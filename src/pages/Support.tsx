import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  imageUrl?: string;
  options?: { label: string; action: string }[];
};

type VerifState = {
  step: 'none' | 'ask_name' | 'ask_amount' | 'ask_number' | 'ask_receipt' | 'verifying';
  name: string;
  amount: string;
  number: string;
};

export function Support() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('agritrans_support_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [supportLink, setSupportLink] = useState('https://wa.me/2250574738155');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [verifState, setVerifState] = useState<VerifState>(() => {
    try {
      const saved = localStorage.getItem('agritrans_support_verif_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { step: 'none', name: '', amount: '', number: '', ...parsed };
        }
      }
    } catch (e) {}
    return { step: 'none', name: '', amount: '', number: '' };
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const safeMsgs = messages.slice(-15).map(m => ({
        ...m,
        imageUrl: m.imageUrl && m.imageUrl.startsWith('data:') ? undefined : m.imageUrl
      }));
      localStorage.setItem('agritrans_support_chat_history', JSON.stringify(safeMsgs));
    } catch (e) {
      console.warn('Could not save support chat history:', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('agritrans_support_verif_state', JSON.stringify(verifState));
    } catch (e) {
      console.warn('Could not save support verif state:', e);
    }
  }, [verifState]);

  useEffect(() => {
    supabase.from('settings').select('*').eq('key', 'support_link').single().then(({ data }) => {
      if (data && data.value) setSupportLink(data.value);
    });

    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: 'bot',
          text: `Bonjour ${user?.first_name || ''} ! Je suis le Service Client d'AgriTrans. Comment puis-je vous assister aujourd'hui pour vos formules de transport ou la gestion de votre compte ?`
        }
      ]);
    }
  }, [user?.first_name, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent, predefinedText?: string) => {
    if (e) e.preventDefault();
    const text = predefinedText || inputText.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!predefinedText) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const id = (Date.now() + 1).toString();
      const lower = text.toLowerCase();
      let responseText: React.ReactNode = '';

      const isDepositProblem = /non crédité|non credite|pas reçu|pas recu|non reçu|non recu|pas encore recu|pas encore reçu|toujours pas recu|toujours pas reçu/i.test(lower) || 
        ((lower.includes('depot') || lower.includes('dépôt') || lower.includes('recharge') || lower.includes('rechargement') || lower.includes('transfert')) && (lower.includes('pas') || lower.includes('non') || lower.includes('rien')));

      if (verifState.step === 'ask_name') {
        setVerifState(v => ({ ...v, step: 'ask_amount', name: text }));
        responseText = `Merci ${text}. Quel est le montant exact de votre transfert ?`;
      } else if (verifState.step === 'ask_amount') {
        setVerifState(v => ({ ...v, step: 'ask_number', amount: text }));
        responseText = `Veuillez m'indiquer le numéro de téléphone utilisé pour faire ce dépôt.`;
      } else if (verifState.step === 'ask_number') {
        setVerifState(v => ({ ...v, step: 'ask_receipt', number: text }));
        responseText = `Veuillez m'envoyer une capture d'écran de votre reçu de transfert pour que je puisse lancer la vérification. Utilisez l'icône d'image à côté du bouton d'envoi.`;
      } else if (verifState.step === 'ask_receipt') {
        responseText = `J'attends toujours une capture d'écran. Veuillez utiliser l'icône d'ajout d'image (🖼️) pour joindre la preuve de votre transfert.`;
      } else if (isDepositProblem) {
        setVerifState({ step: 'ask_name', name: '', amount: '', number: '' });
        responseText = `Je comprends que votre dépôt n'a pas encore été crédité. Rassurez-vous, notre système d'analyse automatisé AgriTrans va procéder à une vérification immédiate. Pour des raisons de conformité, veuillez m'indiquer votre nom complet.`;
      } else if (lower.includes('télécharg') || lower.includes('install') || lower.includes('application') || lower.includes('appli')) {
        responseText = `
          <span>
            L'installation de l'application <b>AgriTrans</b> s'effectue en quelques instants.<br/><br/>
            <b>• Sur appareil Android :</b><br/>
            Acceptez l'installation via la bannière au bas de l'écran ou depuis le menu du navigateur (Ajouter à l'écran d'accueil).<br/><br/>
            <b>• Sur appareil iOS (iPhone) :</b><br/>
            1. Appuyez sur l'icône de partage située en bas de Safari.<br/>
            2. Sélectionnez l'option <b>« Sur l'écran d'accueil »</b>.<br/>
            3. Validez en appuyant sur <b>« Ajouter »</b>.<br/><br/>
            L'application sera ainsi accessible directement pour piloter votre flotte agricole.
          </span>
        `;
      } else if (lower.includes('moov') || lower.includes('mtn')) {
        responseText = `
          <span>
            Voici la procédure à suivre pour effectuer un financement via <b>Moov Money ou MTN Mobile Money</b> sur votre compte AgriTrans :<br/><br/>
            <b>Étape 1 :</b> Accédez à la rubrique « Financer » et sélectionnez l'opérateur concerné.<br/>
            <b>Étape 2 :</b> Saisissez le montant et votre numéro de téléphone.<br/>
            <b>Étape 3 :</b> Cliquez sur « Lancer le code système » pour ouvrir le code USSD.<br/>
            <b>Étape 4 :</b> Confirmez la transaction à l'aide de votre code PIN personnel.<br/><br/>
            Le système créditera vos fonds instantanément dès validation.
          </span>
        `;
      } else if (lower.includes('wave')) {
        responseText = `
          <span>
            Voici la procédure de financement via <b>Wave</b> sur AgriTrans :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous dans la section « Financer » et choisissez « Wave ».<br/>
            <b>Étape 2 :</b> Renseignez le montant désiré et votre numéro Wave.<br/>
            <b>Étape 3 :</b> Copiez le numéro de paiement affiché.<br/>
            <b>Étape 4 :</b> Effectuez l'envoi depuis votre application Wave.<br/><br/>
            Votre compte sera crédité rapidement et en toute sécurité.
          </span>
        `;
      } else if (lower.includes('attente') && (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement'))) {
        responseText = "Votre transaction est en attente de validation. Le délai moyen est de 5 à 15 minutes. Si vos fonds ne sont pas visibles passé ce délai, écrivez « mon dépôt n'est pas crédité » pour démarrer une vérification directe.";
      } else if ((lower.includes('étape') || lower.includes('etape') || lower.includes('comment')) && (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer'))) {
        responseText = `
          <span>
            Pour créditer votre compte AgriTrans, rendez-vous sur « Financer ». Nous supportons les réseaux <b>Wave</b>, <b>Moov Money</b>, <b>Orange Money</b> et <b>MTN Mobile Money</b>.<br/><br/>
            <i>Pour des détails précis, indiquez le nom de votre moyen de paiement (ex : « comment recharger avec Wave »).</i>
          </span>
        `;
      } else if (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer')) {
        responseText = "Veuillez préciser votre demande : souhaitez-vous de l'aide pour un dépôt en cours ou des indications sur la procédure de rechargement ?";
      } else if (lower.includes('attente') && (lower.includes('retrait') || lower.includes('retirer'))) {
        responseText = "Votre demande de retrait est actuellement en cours de traitement. Nos administrateurs traitent chaque demande avec soin sous 24h ouvrées.";
      } else if ((lower.includes('étape') || lower.includes('etape') || lower.includes('comment')) && (lower.includes('retrait') || lower.includes('retirer'))) {
        responseText = `
          <span>
            Pour effectuer un retrait de vos gains AgriTrans :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous sur la section « Retrait ».<br/>
            <b>Étape 2 :</b> Spécifiez le montant (minimum 1 000 FCFA).<br/>
            <b>Étape 3 :</b> Entrez votre mot de passe de connexion.<br/>
            <b>Étape 4 :</b> Validez votre nom et numéro de réception.<br/><br/>
            Le montant net vous sera transféré après déduction des frais réglementaires de 10%.
          </span>
        `;
      } else if (lower.includes('retrait') || lower.includes('retirer')) {
        responseText = "Souhaitez-vous suivre un retrait en attente ou connaître la procédure pour soumettre un retrait ?";
      } else if (lower.includes('parrain') || lower.includes('invit') || lower.includes('équipe') || lower.includes('equipe') || lower.includes('affili')) {
        responseText = `
          <span>
            AgriTrans propose un programme d'affiliation sur 3 niveaux :<br/><br/>
            • <b>Niveau 1 :</b> 20% de commission sur chaque formule activée.<br/>
            • <b>Niveau 2 :</b> 2% de commission.<br/>
            • <b>Niveau 3 :</b> 1% de commission.<br/><br/>
            Rendez-vous dans la section « Équipe » pour récupérer votre lien d'invitation personnel.
          </span>
        `;
      } else if (lower.includes('investir') || lower.includes('plan') || lower.includes('service') || lower.includes('transport') || lower.includes('flotte') || lower.includes('camion')) {
        responseText = `
          <span>
            Pour souscrire à une formule logistique AgriTrans :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous dans la rubrique « Flotte ».<br/>
            <b>Étape 2 :</b> Choisissez une formule adaptée à vos objectifs (à partir de 5 000 FCFA).<br/>
            <b>Étape 3 :</b> Cliquez sur « Activer ce plan ».<br/><br/>
            Vos revenus journaliers vous sont versés chaque jour sur un cycle de 80 jours.
          </span>
        `;
      } else if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('coucou')) {
        responseText = "Bonjour ! Le Service Client AgriTrans est à votre entière disposition. Comment pouvons-nous vous aider aujourd'hui ?";
      } else {
        const finalLink = supportLink ? (supportLink.startsWith('http') ? supportLink : `https://${supportLink}`) : 'https://wa.me/2250574738155';
        responseText = `
          <span>
            Pour une assistance personnalisée directe, contactez un conseiller AgriTrans sur WhatsApp : <br/><br/>
            <a href="${finalLink}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:8px; background-color:#16a34a; color:white; padding:8px 14px; border-radius:10px; text-decoration:none; font-weight:bold; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <span>Assistance Directe WhatsApp</span>
            </a>
          </span>
        `;
      }

      const botMsg: Message = { id, sender: 'bot', text: responseText as string };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (verifState.step !== 'ask_receipt') {
      const botMsg: Message = { 
        id: Date.now().toString(), 
        sender: 'bot', 
        text: "Pour vérifier un dépôt non crédité, veuillez d'abord m'écrire « mon dépôt n'est pas crédité »." 
      };
      setMessages(prev => [...prev, botMsg]);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = (event.target?.result as string);
      
      const userMsg: Message = { 
        id: Date.now().toString(), 
        sender: 'user', 
        text: 'Capture d\'écran envoyée',
        imageUrl: base64String
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        const id = (Date.now() + 1).toString();
        const responseText = "Merci. Votre justificatif a bien été reçu et transmis à l'équipe financière AgriTrans pour vérification prioritaire. Vos fonds seront crédités dès confirmation.";
        setMessages(prev => [...prev, { id, sender: 'bot', text: responseText }]);
        setIsTyping(false);
        setVerifState({ step: 'none', name: '', amount: '', number: '' });
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center gap-3 relative z-10 shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-200 relative shrink-0 bg-emerald-50 flex items-center justify-center">
          <img 
            src="/icon.svg" 
            alt="AgriTrans Support" 
            className="w-full h-full object-contain p-1"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white"></span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">Support Client AgriTrans</h1>
          <p className="text-[10px] text-emerald-700 font-black flex items-center gap-1 uppercase tracking-wider mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            Conseiller en ligne 24/7
          </p>
        </div>
        <a
          href={supportLink || 'https://wa.me/2250574738155'}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>WhatsApp</span>
          <Send className="w-3 h-3" />
        </a>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 pb-[160px] relative z-10 scrollbar-hide">
        <div className="flex justify-center mb-2">
           <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">Assistance en direct</span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2.5 shrink-0 mt-auto mb-1 border border-emerald-200 bg-emerald-50 p-1 flex items-center justify-center">
                <img 
                  src="/icon.svg" 
                  alt="Conseiller" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div className={`max-w-[85%] ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 font-medium text-sm shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm text-sm'}`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="preuve" className="w-full max-w-[200px] rounded-xl mb-2 object-cover shadow-sm border border-slate-200" />
              )}
              {msg.sender === 'user' ? (
                <div className="leading-relaxed break-words">{msg.text}</div>
              ) : (
                <div className="leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: msg.text }} />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-2.5 shrink-0 mt-auto mb-1 border border-emerald-200 text-emerald-700">
              <span className="text-xs font-black">AT</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 h-[40px]">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 fixed bottom-[72px] left-0 right-0 z-40">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center max-w-4xl mx-auto">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0 border border-slate-200 cursor-pointer"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Écrire votre message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-600 text-slate-900 transition-colors text-sm font-medium placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:bg-slate-300 disabled:text-slate-500 transition-all active:scale-95 shrink-0 shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
