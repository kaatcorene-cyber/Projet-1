import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, ImagePlus, Loader2 } from 'lucide-react';
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
    const saved = localStorage.getItem('support_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [supportLink, setSupportLink] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [verifState, setVerifState] = useState<VerifState>(() => {
    try {
      const saved = localStorage.getItem('support_verif_state');
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
    localStorage.setItem('support_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('support_verif_state', JSON.stringify(verifState));
  }, [verifState]);

  useEffect(() => {
    // Fetch support link
    supabase.from('settings').select('*').eq('key', 'support_link').single().then(({ data }) => {
      if (data && data.value) setSupportLink(data.value);
    });

    // Initial greeting
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: 'bot',
          text: `Bonjour ! Je suis l'assistant SIMcom. Comment puis-je vous aider aujourd'hui ?`
        }
      ]);
    }
  }, [user?.first_name, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
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
        responseText = `Je suis navré d'apprendre que votre dépôt n'a pas été crédité. Ne vous inquiétez pas, notre système intelligent peut le vérifier immédiatement. Pour commencer, quel est votre nom complet ?`;
      } else if (lower.includes('télécharg') || lower.includes('install') || lower.includes('application') || lower.includes('appli')) {
        responseText = `
          <span>
            Rien de plus facile que de <b>télécharger notre application</b> afin de l'avoir toujours à portée de main ! Il vous suffit d'appuyer sur l'icône ⬇️ (ou dans le menu de votre navigateur) pour lancer l'installation.<br/><br/>
            <b>• Pour les utilisateurs d'Android :</b><br/>
            Ouvrez le fichier une fois téléchargé, puis laissez-vous guider pour installer l'application de façon classique.<br/><br/>
            <b>• Pour les utilisateurs d'iPhone (iOS) :</b><br/>
            1. Appuyez sur l'icône de partage ou les 3 petits points situés en bas de votre navigateur.<br/>
            2. Touchez l'option <b>« Partager »</b> dans le menu.<br/>
            3. Choisissez ensuite <b>« Sur l'écran d'accueil »</b>.<br/>
            4. Pour finir, appuyez sur <b>« Ajouter »</b> et le tour est joué !<br/><br/>
            L'application apparaîtra comme par magie sur votre écran d'accueil.
          </span>
        `;
      } else if (lower.includes('moov') || lower.includes('mtn')) {
        responseText = `
          <span>
            Excellente question ! Voici les instructions détaillées pour effectuer votre <b>rechargement par Moov Money ou MTN Money</b> en toute simplicité :<br/><br/>
            <b>Étape 1 :</b> Cliquez sur le bouton « Recharger » pour débuter l'opération.<br/>
            <b>Étape 2 :</b> Optez pour le moyen de paiement « Moov Money ou MTN Money ».<br/>
            <b>Étape 3 :</b> Renseignez soigneusement votre numéro de téléphone ainsi que le montant souhaité.<br/>
            <b>Étape 4 :</b> Appuyez sur « Lancer le code USSD ». Il ne vous restera plus qu'à renseigner le montant à recharger directement sur l'invite de votre téléphone, puis à finaliser la transaction avec votre code secret Mobile Money.<br/><br/>
            Et voilà, votre compte sera crédité en un clin d'œil !
          </span>
        `;
      } else if (lower.includes('wave')) {
        responseText = `
          <span>
            C'est parfait ! Voici les informations nécessaires pour effectuer votre <b>rechargement par Wave</b> :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous sur l'option « Recharger ».<br/>
            <b>Étape 2 :</b> Sélectionnez simplement le moyen de paiement « Wave ».<br/>
            <b>Étape 3 :</b> Saisissez votre numéro de téléphone et indiquez le montant souhaité.<br/>
            <b>Étape 4 :</b> Vous verrez apparaître un numéro de paiement : copiez-le et suivez les instructions à l'écran pour réaliser le transfert.<br/><br/>
            Votre solde sera actualisé très rapidement, merci de votre confiance !
          </span>
        `;
      } else if (lower.includes('attente') && (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement'))) {
        responseText = "Je vois que vous êtes en attente de la validation de votre dépôt. Ne vous inquiétez pas, vos fonds sont en sécurité ! Les recharges s'effectuent généralement en 5 à 15 minutes. Si ce délai est légèrement dépassé, n'hésitez pas à transmettre votre reçu de paiement à notre service client sur WhatsApp pour une validation immédiate.";
      } else if ((lower.includes('étape') || lower.includes('etape') || lower.includes('comment')) && (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer'))) {
        responseText = `
          <span>
            Avec grand plaisir ! Pour recharger votre compte, rendez-vous sur le bouton « Recharger » de votre menu. Nous prenons en charge <b>Wave</b>, <b>Moov Money</b> et <b>MTN Money</b>.<br/><br/>
            <i>Si vous souhaitez le processus détaillé, merci de me confirmer l'opérateur que vous utilisez (par exemple : « comment recharger par Wave » ou « étapes pour MTN »).</i>
          </span>
        `;
      } else if (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer')) {
        responseText = "Souhaitez-vous des informations concernant un dépôt en attente, ou avez-vous besoin des étapes pour recharger votre compte ? Précisez-moi votre besoin pour que je puisse vous guider parfaitement.";
      } else if (lower.includes('attente') && (lower.includes('retrait') || lower.includes('retirer'))) {
        responseText = "Je comprends tout à fait votre préoccupation concernant votre retrait en attente. Rassurez-vous, le traitement des retraits s'effectue sous 24 heures maximum, le temps pour notre équipe financière de sécuriser votre transaction. Veuillez patienter un peu, vos fonds seront bientôt disponibles sur votre compte !";
      } else if ((lower.includes('étape') || lower.includes('etape') || lower.includes('comment')) && (lower.includes('retrait') || lower.includes('retirer'))) {
        responseText = `
          <span>
            C'est très simple ! Voici comment procéder pour effectuer votre retrait en toute sérénité :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous sur la page « Retrait » depuis votre tableau de bord.<br/>
            <b>Étape 2 :</b> Indiquez le montant que vous souhaitez retirer.<br/>
            <b>Étape 3 :</b> Choisissez votre moyen de paiement et saisissez votre numéro de téléphone.<br/>
            <b>Étape 4 :</b> Entrez votre mot de passe pour confirmer puis validez votre demande.<br/><br/>
            Ensuite, il ne vous reste plus qu'à patienter, notre équipe se charge du reste !
          </span>
        `;
      } else if (lower.includes('retrait') || lower.includes('retirer')) {
        responseText = "Avez-vous une question sur un retrait en attente ou souhaitez-vous connaître les étapes pour retirer vos fonds ? Je suis là pour vous orienter, n'hésitez pas à préciser votre demande.";
      } else if (lower.includes('parrain') || lower.includes('invit') || lower.includes('équipe') || lower.includes('equipe') || lower.includes('affili')) {
        responseText = `
          <span>
            C'est une excellente initiative de vouloir parrainer ! Voici comment procéder pour étendre votre équipe :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous dans la section « Équipe » située au bas de votre écran.<br/>
            <b>Étape 2 :</b> Vous y découvrirez votre lien d'invitation personnel.<br/>
            <b>Étape 3 :</b> Copiez-le simplement et partagez-le avec vos proches.<br/><br/>
            Dès qu'ils s'inscriront et réaliseront leur premier investissement, vous serez récompensé avec d'excellentes commissions. À vous de jouer !
          </span>
        `;
      } else if (lower.includes('investir') || lower.includes('plan') || lower.includes('vip')) {
        responseText = `
          <span>
            Investir avec SIMcom est conçu pour être rapide et très intuitif ! Voici les étapes à suivre :<br/><br/>
            <b>Étape 1 :</b> Assurez-vous d'avoir rechargé votre compte en utilisant le bouton « Recharger ».<br/>
            <b>Étape 2 :</b> Accédez ensuite à la rubrique « Investir », facilement accessible en bas de votre écran.<br/>
            <b>Étape 3 :</b> Parcourez nos offres et sélectionnez le plan qui s'aligne avec vos objectifs.<br/>
            <b>Étape 4 :</b> Un simple clic sur « Investir » validera votre choix.<br/><br/>
            Félicitations, tout est prêt ! Vos bénéfices seront dorénavant versés sur votre compte de manière automatique chaque jour.
          </span>
        `;
      } else if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('coucou')) {
        responseText = "Bonjour ! Je suis ravi de vous assister. Comment puis-je vous aider aujourd'hui ? (Exemple: Comment investir ? Comment faire un retrait ?)";
      } else {
        const finalLink = supportLink ? (supportLink.startsWith('http') ? supportLink : `https://${supportLink}`) : 'https://wa.me/2250574738155';
        responseText = `
          <span>
            Je suis navré, je ne suis pas certain de bien comprendre votre demande. Pour vous offrir la meilleure assistance possible, je vous invite à échanger directement avec notre équipe d'assistance sur WhatsApp : <a href="${finalLink}" target="_blank" rel="noopener noreferrer" className="text-red-500 font-bold underline whitespace-nowrap">Cliquez ici pour discuter</a>
          </span>
        `;
      }

      const botMsg: Message = { id, sender: 'bot', text: responseText as string };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (verifState.step !== 'ask_receipt') {
      // Allow upload anyway but don't do verification if they aren't in this step
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
      setVerifState(v => ({ ...v, step: 'verifying' }));

      try {
        const base64Data = base64String.split(',')[1];
        const { analyzeReceipt } = await import('../lib/gemini');
        const result = await analyzeReceipt(base64Data, file.type);
        
        let isValid = false;
        
        const loweredRecipient = result.recipient.toLowerCase();
        if (!result.is_falsified) {
          if (loweredRecipient.includes('0140814162') || loweredRecipient.includes('0595918513') || loweredRecipient.includes('qualcomm entreprise')) {
            isValid = true;
          }
        }

        const numericAmount = Number(verifState.amount.replace(/[^0-9]/g, ''));
        if (result.amount !== numericAmount) {
           isValid = false; // Mismatch in amount declared vs found
        }

        const finalStatus = isValid ? 'valid' : 'rejected';
        
        // Save to database
        if (user) {
           await supabase.from('deposit_verifications').insert({
             user_id: user.id,
             full_name: verifState.name,
             amount: numericAmount || result.amount,
             sender_number: verifState.number,
             receipt_url: 'uploaded_via_chat', // Normally we would upload to storage, keeping placeholder
             status: finalStatus,
             ai_analysis: JSON.stringify(result)
           });
           
           if (isValid) {
             const amt = numericAmount || result.amount;
             
             // Refresh user current balance
             const { data: userData } = await supabase.from('users').select('balance').eq('id', user.id).single();
             if (userData) {
                const newBalance = Number(userData.balance || 0) + amt;
                
                await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);
                
                // Add an approved transaction
                await supabase.from('transactions').insert({
                  user_id: user.id,
                  type: 'deposit',
                  amount: amt,
                  status: 'approved',
                  reference: `IA_VERIF_${Date.now()}`
                });
             }
           }
        }

        const botMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          sender: 'bot', 
          text: isValid 
            ? `Bonne nouvelle ${verifState.name} ! J'ai bien vérifié la capture d'écran, le dépôt est **VALIDE**. Votre compte a été mis à jour dans nos registres.`
            : `Désolé ${verifState.name}, après vérification attentive de l'image, le dépôt a été **REJETÉ**. Motif: ${result.reasoning}. Assurez-vous d'avoir transféré au bon numéro.`
        };
        
        setMessages(prev => [...prev, botMsg]);
        setVerifState({ step: 'none', name: '', amount: '', number: '' });

      } catch (err: any) {
        console.error("Analysis error:", err);
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: `Une erreur est survenue lors de l\'analyse de l\'image: ${err.message || String(err)}. Veuillez réessayer.` }]);
        setVerifState(v => ({ ...v, step: 'ask_receipt' }));
      } finally {
        setIsTyping(false);
      }
    };
    reader.readAsDataURL(file);
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <header className="bg-white px-5 pt-14 pb-4 shadow-sm border-b border-gray-200 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 active:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">Support SIMcom</h1>
          <p className="text-xs text-green-500 font-bold flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            En ligne
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-24">
        <div className="flex justify-center mb-6">
           <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Aujourd'hui</span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2 shrink-0 mt-auto mb-1 border border-gray-100 shadow-sm relative overflow-hidden">
                <img src="https://i.imgur.com/IKSCH3N.png" alt="QA" className="w-6 h-6 rounded-full object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
            
            <div className={`max-w-[85%] ${msg.sender === 'user' ? 'bg-red-600 text-white rounded-2xl rounded-tr-sm pl-4 pr-5 py-3 shadow-md' : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm pl-5 pr-4 py-3 shadow-md'}`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="preuve" className="w-full max-w-[200px] rounded-lg mb-2 object-cover" />
              )}
              {msg.sender === 'user' ? (
                <div className="text-[14px] leading-relaxed font-medium break-words">{msg.text}</div>
              ) : (
                <div className="text-[14px] leading-relaxed font-medium break-words" dangerouslySetInnerHTML={{ __html: msg.text }} />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2 shrink-0 mt-auto mb-1 border border-gray-100 shadow-sm relative overflow-hidden">
              <img src="https://i.imgur.com/IKSCH3N.png" alt="QA" className="w-6 h-6 gap-1 rounded-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-4 shadow-md flex items-center gap-1.5 h-[46px]">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10 pb-8 cursor-pointer">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
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
            className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Écrivez votre question ici..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-red-500 focus:bg-white transition-colors text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-all active:scale-95 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
