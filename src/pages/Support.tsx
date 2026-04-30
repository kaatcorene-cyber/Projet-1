import React, { useState, useRef, useEffect } from 'react';
import { Bot, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: React.ReactNode;
  options?: { label: string; action: string }[];
};

export function Support() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [supportLink, setSupportLink] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch support link
    supabase.from('settings').select('*').eq('key', 'support_link').single().then(({ data }) => {
      if (data && data.value) setSupportLink(data.value);
    });

    // Initial greeting
    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: `Bonjour ${user?.first_name || ''} ! Je suis l'assistant QUALCOMM. Comment puis-je vous aider aujourd'hui ?`
      }
    ]);
  }, [user?.first_name]);

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

      if (lower.includes('télécharg') || lower.includes('install') || lower.includes('application') || lower.includes('appli')) {
        responseText = (
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
        );
      } else if (lower.includes('moov') || lower.includes('mtn')) {
        responseText = (
          <span>
            Excellente question ! Voici les instructions détaillées pour effectuer votre <b>rechargement par Moov Money ou MTN Money</b> en toute simplicité :<br/><br/>
            <b>Étape 1 :</b> Cliquez sur le bouton « Recharger » pour débuter l'opération.<br/>
            <b>Étape 2 :</b> Optez pour le moyen de paiement « Moov Money ou MTN Money ».<br/>
            <b>Étape 3 :</b> Renseignez soigneusement votre numéro de téléphone ainsi que le montant souhaité.<br/>
            <b>Étape 4 :</b> Appuyez sur « Lancer le code USSD ». Il ne vous restera plus qu'à renseigner le montant à recharger directement sur l'invite de votre téléphone, puis à finaliser la transaction avec votre code secret Mobile Money.<br/><br/>
            Et voilà, votre compte sera crédité en un clin d'œil !
          </span>
        );
      } else if (lower.includes('wave')) {
        responseText = (
          <span>
            C'est parfait ! Voici les informations nécessaires pour effectuer votre <b>rechargement par Wave</b> :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous sur l'option « Recharger ».<br/>
            <b>Étape 2 :</b> Sélectionnez simplement le moyen de paiement « Wave ».<br/>
            <b>Étape 3 :</b> Saisissez votre numéro de téléphone et indiquez le montant souhaité.<br/>
            <b>Étape 4 :</b> Vous verrez apparaître un numéro de paiement : copiez-le et suivez les instructions à l'écran pour réaliser le transfert.<br/><br/>
            Votre solde sera actualisé très rapidement, merci de votre confiance !
          </span>
        );
      } else if (lower.includes('attente') && (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement'))) {
        responseText = "Je vois que vous êtes en attente de la validation de votre dépôt. Ne vous inquiétez pas, vos fonds sont en sécurité ! Les recharges s'effectuent généralement en 5 à 15 minutes. Si ce délai est légèrement dépassé, n'hésitez pas à transmettre votre reçu de paiement à notre service client sur WhatsApp pour une validation immédiate.";
      } else if ((lower.includes('étape') || lower.includes('etape') || lower.includes('comment')) && (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer'))) {
        responseText = (
          <span>
            Avec grand plaisir ! Pour recharger votre compte, rendez-vous sur le bouton « Recharger » de votre menu. Nous prenons en charge <b>Wave</b>, <b>Moov Money</b> et <b>MTN Money</b>.<br/><br/>
            <i>Si vous souhaitez le processus détaillé, merci de me confirmer l'opérateur que vous utilisez (par exemple : « comment recharger par Wave » ou « étapes pour MTN »).</i>
          </span>
        );
      } else if (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer')) {
        responseText = "Souhaitez-vous des informations concernant un dépôt en attente, ou avez-vous besoin des étapes pour recharger votre compte ? Précisez-moi votre besoin pour que je puisse vous guider parfaitement.";
      } else if (lower.includes('attente') && (lower.includes('retrait') || lower.includes('retirer'))) {
        responseText = "Je comprends tout à fait votre préoccupation concernant votre retrait en attente. Rassurez-vous, le traitement des retraits s'effectue sous 24 heures maximum, le temps pour notre équipe financière de sécuriser votre transaction. Veuillez patienter un peu, vos fonds seront bientôt disponibles sur votre compte !";
      } else if ((lower.includes('étape') || lower.includes('etape') || lower.includes('comment')) && (lower.includes('retrait') || lower.includes('retirer'))) {
        responseText = (
          <span>
            C'est très simple ! Voici comment procéder pour effectuer votre retrait en toute sérénité :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous sur la page « Retrait » depuis votre tableau de bord.<br/>
            <b>Étape 2 :</b> Indiquez le montant que vous souhaitez retirer.<br/>
            <b>Étape 3 :</b> Choisissez votre moyen de paiement et saisissez votre numéro de téléphone.<br/>
            <b>Étape 4 :</b> Entrez votre mot de passe pour confirmer puis validez votre demande.<br/><br/>
            Ensuite, il ne vous reste plus qu'à patienter, notre équipe se charge du reste !
          </span>
        );
      } else if (lower.includes('retrait') || lower.includes('retirer')) {
        responseText = "Avez-vous une question sur un retrait en attente ou souhaitez-vous connaître les étapes pour retirer vos fonds ? Je suis là pour vous orienter, n'hésitez pas à préciser votre demande.";
      } else if (lower.includes('parrain') || lower.includes('invit') || lower.includes('équipe') || lower.includes('equipe') || lower.includes('affili')) {
        responseText = (
          <span>
            C'est une excellente initiative de vouloir parrainer ! Voici comment procéder pour étendre votre équipe :<br/><br/>
            <b>Étape 1 :</b> Rendez-vous dans la section « Équipe » située au bas de votre écran.<br/>
            <b>Étape 2 :</b> Vous y découvrirez votre lien d'invitation personnel.<br/>
            <b>Étape 3 :</b> Copiez-le simplement et partagez-le avec vos proches.<br/><br/>
            Dès qu'ils s'inscriront et réaliseront leur premier investissement, vous serez récompensé avec d'excellentes commissions. À vous de jouer !
          </span>
        );
      } else if (lower.includes('investir') || lower.includes('plan') || lower.includes('vip')) {
        responseText = (
          <span>
            Investir avec QUALCOMM est conçu pour être rapide et très intuitif ! Voici les étapes à suivre :<br/><br/>
            <b>Étape 1 :</b> Assurez-vous d'avoir rechargé votre compte en utilisant le bouton « Recharger ».<br/>
            <b>Étape 2 :</b> Accédez ensuite à la rubrique « Investir », facilement accessible en bas de votre écran.<br/>
            <b>Étape 3 :</b> Parcourez nos offres et sélectionnez le plan qui s'aligne avec vos objectifs.<br/>
            <b>Étape 4 :</b> Un simple clic sur « Investir » validera votre choix.<br/><br/>
            Félicitations, tout est prêt ! Vos bénéfices seront dorénavant versés sur votre compte de manière automatique chaque jour.
          </span>
        );
      } else if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('coucou')) {
        responseText = "Bonjour ! Je suis ravi de vous assister. Comment puis-je vous aider aujourd'hui ? (Exemple: Comment investir ? Comment faire un retrait ?)";
      } else {
        const finalLink = supportLink ? (supportLink.startsWith('http') ? supportLink : `https://${supportLink}`) : 'https://wa.me/2250574738155';
        responseText = (
          <span>
            Je suis navré, je ne suis pas certain de bien comprendre votre demande. Pour vous offrir la meilleure assistance possible, je vous invite à échanger directement avec notre équipe d'assistance sur WhatsApp : <a href={finalLink} target="_blank" rel="noopener noreferrer" className="text-red-500 font-bold underline whitespace-nowrap">Cliquez ici pour discuter</a>
          </span>
        );
      }

      const botMsg: Message = { id, sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white px-5 pt-14 pb-4 shadow-sm border-b border-gray-200 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 active:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">Service Client</h1>
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
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2 shrink-0 mt-auto mb-1 border border-red-200 shadow-sm relative">
                <Bot className="w-4 h-4 text-red-600" />
              </div>
            )}
            
            <div className={`max-w-[85%] ${msg.sender === 'user' ? 'bg-red-600 text-white rounded-2xl rounded-tr-sm pl-4 pr-5 py-3 shadow-md' : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm pl-5 pr-4 py-3 shadow-md'}`}>
              <div className="text-[14px] leading-relaxed font-medium break-words">{msg.text}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2 shrink-0 mt-auto mb-1 border border-red-200 shadow-sm relative">
              <Bot className="w-4 h-4 text-red-600" />
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

      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10 pb-8">
        <form onSubmit={handleSendMessage} className="flex gap-2">
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
