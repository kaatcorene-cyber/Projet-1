import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, ImagePlus, Loader2, Sun } from 'lucide-react';
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
    supabase.from('settings').select('*').eq('key', 'support_link').single().then(({ data }) => {
      if (data && data.value) setSupportLink(data.value);
    });

    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          sender: 'bot',
          text: `Bonjour ${user?.first_name || ''} ! Je suis le Service Client de SIM.COM. Comment puis-je vous assister aujourd'hui ?`
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
        responseText = `Je comprends que votre dépôt n'a pas encore été crédité. Rassurez-vous, notre système d'analyse automatisé va procéder à une vérification immédiate. Pour des raisons de conformité, veuillez m'indiquer votre nom complet.`;
      } else if (lower.includes('télécharg') || lower.includes('install') || lower.includes('application') || lower.includes('appli')) {
        responseText = `
          <span>
            L'installation de l'application <b>SIM.COM</b> s'effectue en quelques instants. Appuyez sur l'icône d'installation ⬇️ (ou accédez au menu de votre navigateur) pour procéder à l'ajout.<br/><br/>
            <b>• Sur appareil Android :</b><br/>
            Acceptez l'installation via la bannière qui s'affiche au bas de l'écran ou depuis le menu de votre navigateur (Ajouter à l'écran d'accueil).<br/><br/>
            <b>• Sur appareil iOS (iPhone) :</b><br/>
            1. Appuyez sur l'icône de partage située en bas de votre navigateur Safari.<br/>
            2. Sélectionnez l'option <b>« Sur l'écran d'accueil »</b>.<br/>
            3. Validez en appuyant sur <b>« Ajouter »</b>.<br/><br/>
            L'application sera ainsi disponible directement sur votre écran d'accueil pour une gestion optimale de vos actifs SIM.COMs.
          </span>
        `;
      } else if (lower.includes('moov') || lower.includes('mtn')) {
        responseText = `
          <span>
            Voici la procédure à suivre pour effectuer un dépôt via <b>Moov Money ou MTN Mobile Money</b> sur votre compte SIM.COM :<br/><br/>
            <b>Étape 1 :</b> Accédez à la rubrique « Recharger » et sélectionnez l'opérateur concerné (Moov ou MTN).<br/>
            <b>Étape 2 :</b> Saisissez le montant de votre investissement et votre numéro de téléphone de facturation.<br/>
            <b>Étape 3 :</b> Cliquez sur « Lancer le code système ». Vous serez redirigé vers l'invite de commande de votre téléphone.<br/>
            <b>Étape 4 :</b> Entrez manuellement le montant défini et confirmez à l'aide de votre code PIN personnel.<br/><br/>
            Le système créditera vos fonds instantanément dès la validation du réseau opérateur.
          </span>
        `;
      } else if (lower.includes('wave')) {
        responseText = `
          <span>
            Voici le protocole de rechargement via <b>Wave</b> sur la plateforme SIM.COM :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous dans la section « Recharger » et choisissez l'option « Wave ».<br/>
            <b>Étape 2 :</b> Renseignez le montant désiré et votre numéro de compte Wave.<br/>
            <b>Étape 3 :</b> Un identifiant de paiement vous sera fourni. Copiez ce numéro.<br/>
            <b>Étape 4 :</b> Effectuez l'envoi des fonds vers ce numéro directement depuis votre application Wave.<br/><br/>
            Votre dépôt sera analysé et crédité sur votre solde d'investisseur de manière sécurisée et rapide.
          </span>
        `;
      } else if (lower.includes('attente') && (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement'))) {
        responseText = "Nous comprenons que votre transaction est en attente de traitement. Soyez assuré que vos fonds sont sécurisés. Le délai de traitement interbancaire ou de l'opérateur varie généralement de 5 à 15 minutes. Si vos fonds ne sont toujours pas reflétés au-delà de ce délai, utilisez la commande « mon dépôt n'est pas crédité » pour procéder à une vérification avec votre reçu.";
      } else if ((lower.includes('étape') || lower.includes('etape') || lower.includes('comment')) && (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer'))) {
        responseText = `
          <span>
            Pour créditer votre solde d'investisseur, accédez à l'onglet « Recharger » depuis votre interface principale. Nous supportons les réseaux <b>Wave</b>, <b>Moov Money</b> et <b>MTN Mobile Money</b>.<br/><br/>
            <i>Si vous désirez consulter une procédure spécifique, veuillez indiquer le nom de votre opérateur (ex: « comment recharger par Wave », « procédure pour MTN »).</i>
          </span>
        `;
      } else if (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer')) {
        responseText = "Veuillez préciser l'objet de votre requête. Souhaitez-vous obtenir de l'assistance pour un dépôt en attente d'approbation ou avez-vous besoin d'orientations sur le processus de rechargement ?";
      } else if (lower.includes('attente') && (lower.includes('retrait') || lower.includes('retirer'))) {
        responseText = "Le statut de votre demande de retrait est actuellement en traitement. Nos administrateurs financiers valident chaque décaissement manuellement afin de garantir la sécurité des fonds. Ce processus peut prendre jusqu'à 24 heures ouvrées. Vos fonds vous parviendront sous peu.";
      } else if ((lower.includes('étape') || lower.includes('etape') || lower.includes('comment')) && (lower.includes('retrait') || lower.includes('retirer'))) {
        responseText = `
          <span>
            Afin de procéder au décaissement de vos rendements, veuillez suivre la démarche ci-dessous :<br/><br/>
            <b>Étape 1 :</b> Cliquez sur la section « Retrait » de votre tableau de bord.<br/>
            <b>Étape 2 :</b> Spécifiez le montant exact que vous désirez retirer de votre solde.<br/>
            <b>Étape 3 :</b> Entrez le numéro de téléphone de réception ou de facturation adéquat.<br/>
            <b>Étape 4 :</b> Confirmez la transaction à l'aide de votre mot de passe d'accès pour finaliser l'opération.<br/><br/>
            Une fois validée, la requête est transmise à nos équipes pour libération des fonds.
          </span>
        `;
      } else if (lower.includes('retrait') || lower.includes('retirer')) {
        responseText = "Veuillez préciser votre demande concernant les décaissements. Voulez-vous faire un suivi sur un retrait en cours d'approbation ou avez-vous besoin d'indications sur la procédure complète ?";
      } else if (lower.includes('parrain') || lower.includes('invit') || lower.includes('équipe') || lower.includes('equipe') || lower.includes('affili')) {
        responseText = `
          <span>
            SIM.COM vous offre l'opportunité de multiplier vos sources de revenus grâce à notre programme d'affiliation structuré en réseau :<br/><br/>
            <b>Étape 1 :</b> Naviguez vers l'onglet « Réseau » ou « Équipe » en bas de votre écran.<br/>
            <b>Étape 2 :</b> Repérez et copiez votre lien de parrainage affilié unique.<br/>
            <b>Étape 3 :</b> Diffusez-le à votre entourage ou vos collaborateurs.<br/><br/>
            Lorsqu'un partenaire s'inscrit via votre lien et initialise un actif SIM.COM, la plateforme vous octroiera automatiquement les commissions correspondantes selon notre stratégie de rendement de niveaux.
          </span>
        `;
      } else if (lower.includes('investir') || lower.includes('plan') || lower.includes('vip') || lower.includes('générateur') || lower.includes('generateur')) {
        responseText = `
          <span>
            L'acquisition d'un générateur SIM.COM sur la plateforme SIM.COM est optimisée pour garantir une rentabilité efficace :<br/><br/>
            <b>Étape 1 :</b> Vérifiez que votre solde d'intérêts a été rechargé conformément à la valeur de l'actif souhaité.<br/>
            <b>Étape 2 :</b> Consultez la liste des générateurs disponibles dans la section « Générateurs » (Investir).<br/>
            <b>Étape 3 :</b> Évaluez les rendements proposés pour chaque contrat et sélectionnez l'équipement SIM.COM visé.<br/>
            <b>Étape 4 :</b> Lancez le processus d'acquisition par le biais du bouton d'investissement.<br/><br/>
            Une fois le contrat acté, la génération de vos intérêts débute instamment et les profits vous seront versés quotidiennement.
          </span>
        `;
      } else if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('coucou')) {
        responseText = "Bonjour ! Le Service Client SIM.COM est à votre écoute pour vous assister dans vos opérations. Souhaitez-vous des conseils sur un dépôt, un retrait ou un forfait d'investissement ?";
      } else {
        const finalLink = supportLink ? (supportLink.startsWith('http') ? supportLink : `https://${supportLink}`) : 'https://wa.me/2250574738155';
        responseText = `
          <span>
            Pour une meilleure prise en charge, veuillez contacter <b>𝗠𝗶𝘀𝘀 𝗩𝗮𝗻𝗲𝘀𝘀𝗮</b> sur WhatsApp en cliquant ici : <br/><br/>
            <a href="${finalLink}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:8px; background-color:#25D366; color:white; padding:8px 12px; border-radius:8px; text-decoration:none; font-weight:bold; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.898-4.45 9.896-9.896 0-2.679-1.055-5.198-2.946-7.089-1.891-1.89-4.41-2.932-7.091-2.932-5.447 0-9.896 4.45-9.896 9.896 0 2.115.597 3.716 1.592 5.392l-1.074 3.922 4.027-1.085zm-1.545-7.443c-.027-.08-.054-.162-.054-.246 0-.825.68-1.498 1.512-1.498.423 0 .807.172 1.085.45.278.278.448.66.448 1.085 0 .285-.09.544-.241.761l-1.285 2.226c-.198.343-.464.306-.605.163-.14-.143-.377-.384-.377-.384z" opacity="0"/><path d="M11.954 2.1c-5.467 0-9.914 4.448-9.914 9.914 0 1.947.563 3.822 1.583 5.398l-1.127 4.116 4.223-1.107c1.52.923 3.266 1.411 5.235 1.411 5.467 0 9.914-4.448 9.914-9.914 0-5.466-4.447-9.914-9.914-9.914m0 18.067c-1.638 0-3.238-.42-4.646-1.215l-.333-.188-3.447.904.921-3.359-.208-.34C3.41 14.568 2.89 12.915 2.89 11.198c0-4.996 4.066-9.062 9.064-9.062 4.996 0 9.064 4.066 9.064 9.062 0 4.996-4.068 9.062-9.064 9.062m4.97-6.793c-.272-.136-1.611-.796-1.861-.887-.251-.09-.435-.136-.616.136-.182.272-.703.887-.862 1.068-.159.181-.318.204-.59.068-1.503-.758-2.617-1.464-3.525-2.646-.239-.312.316-.279.795-1.235.09-.181.045-.34-.022-.477-.068-.136-.616-1.486-.844-2.036-.221-.537-.446-.464-.616-.473-.159-.009-.34-.009-.523-.009-.181 0-.477.068-.726.34-.25.272-.953.931-.953 2.269 0 1.339.976 2.632 1.112 2.813.136.182 1.918 2.93 4.645 4.108 1.84.795 2.457.863 3.327.727.863-.136 2.502-1.021 2.853-2.008.352-.987.352-1.838.246-2.015-.105-.178-.387-.269-.659-.406z"/></svg> 
              𝗠𝗶𝘀𝘀 𝗩𝗮𝗻𝗲𝘀𝘀𝗮
            </a>
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
          if (loweredRecipient.includes('0140814162') || loweredRecipient.includes('0595918513') || loweredRecipient.includes('SIM.COM entreprise')) {
            isValid = true;
          }
        }

        const numericAmount = Number(verifState.amount.replace(/[^0-9]/g, ''));
        if (result.amount !== numericAmount) {
           isValid = false; 
        }

        const finalStatus = isValid ? 'valid' : 'rejected';
        
        if (user) {
           await supabase.from('deposit_verifications').insert({
             user_id: user.id,
             full_name: verifState.name,
             amount: numericAmount || result.amount,
             sender_number: verifState.number,
             receipt_url: 'uploaded_via_chat', 
             status: finalStatus,
             ai_analysis: JSON.stringify(result)
           });
           
           if (isValid) {
             const amt = numericAmount || result.amount;
             
             const { data: userData } = await supabase.from('users').select('balance').eq('id', user.id).single();
             if (userData) {
                const newBalance = Number(userData.balance || 0) + amt;
                
                await supabase.from('users').update({ balance: newBalance }).eq('id', user.id);
                
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
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col font-sans relative overflow-x-hidden text-neutral-900">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      <header className="bg-white/80 backdrop-blur-xl px-5 pt-12 pb-4 border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between rounded-none rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-neutral-100 shadow-sm border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">Service Client</h1>
            <p className="text-[10px] text-brand font-bold flex items-center gap-1 uppercase tracking-widest mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              En ligne
            </p>
          </div>
        </div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-neutral-200 overflow-hidden shadow-sm p-1">
           <img src="https://i.imgur.com/HfAOyni.jpeg" alt="SIM" className="w-full h-full object-contain" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-[160px] relative z-10 scrollbar-hide">
        <div className="flex justify-center mb-6">
           <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest bg-white px-3 py-1 rounded-full border border-neutral-200 shadow-sm">Historique des communications</span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shrink-0 mt-auto mb-1 border border-neutral-200 relative overflow-hidden shadow-sm p-1">
                <img src="https://i.imgur.com/HfAOyni.jpeg" alt="Logo" className="w-full h-full object-contain" />
              </div>
            )}
            
            <div className={`max-w-[85%] ${msg.sender === 'user' ? 'bg-brand text-white rounded-[1.2rem] rounded-tr-sm pl-4 pr-5 py-3 shadow-[0_4px_14px_0_rgba(229,9,47,0.39)] font-bold' : 'bg-white border border-neutral-200 text-neutral-800 rounded-[1.2rem] rounded-tl-sm pl-5 pr-4 py-3 shadow-sm'}`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="preuve" className="w-full max-w-[200px] rounded-xl mb-3 object-cover border border-neutral-200 shadow-sm" />
              )}
              {msg.sender === 'user' ? (
                <div className="text-[14px] leading-relaxed break-words">{msg.text}</div>
              ) : (
                <div className="text-[14px] leading-relaxed break-words font-medium" dangerouslySetInnerHTML={{ __html: msg.text }} />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in mb-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shrink-0 mt-auto mb-1 border border-neutral-200 relative overflow-hidden shadow-sm p-1">
              <img src="https://i.imgur.com/HfAOyni.jpeg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="bg-white border border-neutral-200 rounded-[1.2rem] rounded-tl-sm px-5 py-4 flex items-center gap-1.5 h-[46px] shadow-sm">
              <div className="w-1.5 h-1.5 bg-brand/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-brand/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="bg-white/90 backdrop-blur-md border-t border-neutral-200 p-4 fixed bottom-[72px] left-0 right-0 z-40 shadow-[0_-4px_14px_0_rgba(0,0,0,0.05)]">
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
            className="w-12 h-12 bg-neutral-100 text-neutral-500 rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors shrink-0 border border-neutral-200"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Transmettre un message..."
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3.5 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 text-neutral-900 transition-all text-sm font-medium placeholder-neutral-400 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-brand text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all active:scale-95 shrink-0 shadow-[0_4px_14px_0_rgba(229,9,47,0.39)] disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
