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
        text: `Bonjour ${user?.first_name || ''} ! Je suis l'assistant virtuel QUALCOMM. Comment puis-je vous aider aujourd'hui ?`,
        options: [
          { label: 'Problème de Dépôt', action: 'depot' },
          { label: 'Problème de Retrait', action: 'retrait' },
          { label: 'Comment investir ?', action: 'investir' },
          { label: 'Autre question', action: 'autre' },
        ]
      }
    ]);
  }, [user?.first_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotResponse = (id: string, action: string) => {
    let botMsg: Message;

    if (action === 'depot') {
      botMsg = {
        id,
        sender: 'bot',
        text: "Pour les problèmes de dépôt, assurez-vous d'avoir bien copié le numéro de paiement et la bonne référence. Avez-vous déjà effectué le transfert de l'argent vers le numéro indiqué via votre réseau monétique ?",
        options: [
          { label: 'Oui, transfert effectué', action: 'depot_oui' },
          { label: 'Non, comment faire ?', action: 'depot_non' }
        ]
      };
    } else if (action === 'depot_oui') {
      botMsg = {
        id,
        sender: 'bot',
        text: "Généralement, les recharges prennent 5 à 15 minutes à être validées par le système. Si cela fait plus de 15 minutes, veuillez soumettre votre preuve de paiement (capture d'écran) à notre agent sur WhatsApp pour une validation manuelle.",
        options: [
          { label: 'Contacter sur WhatsApp', action: 'whatsapp' },
          { label: 'Retour au menu', action: 'menu' }
        ]
      };
    } else if (action === 'depot_non') {
      botMsg = {
        id,
        sender: 'bot',
        text: "Allez dans l'onglet 'Recharger', entrez le montant, cliquez sur Recharger, puis vous verrez un numéro. Copiez ce numéro. Ouvrez l'application de votre opérateur (Orange/MTN/Wave/Moov), et transférez l'argent vers ce numéro.",
        options: [
          { label: 'Retour au menu', action: 'menu' }
        ]
      };
    } else if (action === 'retrait') {
      botMsg = {
        id,
        sender: 'bot',
        text: "Les retraits peuvent prendre jusqu'à 24h ouvrées. Assurez-vous d'avoir renseigné le bon numéro de Mobile Money. Votre retrait est-il toujours 'En attente' ?",
        options: [
          { label: 'Oui, toujours en attente', action: 'retrait_attente' },
          { label: 'Statut Rejeté', action: 'retrait_rejete' },
          { label: 'Retour au menu', action: 'menu' }
        ]
      };
    } else if (action === 'retrait_attente') {
      botMsg = {
        id,
        sender: 'bot',
        text: "Veuillez patienter quelques heures. Le système traite les demandes par ordre d'arrivée. Si cela dépasse 24h, contactez le service client avec votre nom complet et numéro de compte.",
        options: [
          { label: 'Contacter sur WhatsApp', action: 'whatsapp' },
          { label: 'Retour au menu', action: 'menu' }
        ]
      };
    } else if (action === 'retrait_rejete') {
      botMsg = {
        id,
        sender: 'bot',
        text: "Si votre retrait a été rejeté, c'est probablement parce que le numéro mobile money est incorrect, en panne chez l'opérateur, ou n'est pas à votre nom. Le montant a été retourné dans votre solde. Veuillez corriger le numéro via les paramètres.",
        options: [
          { label: 'Retour au menu', action: 'menu' }
        ]
      };
    } else if (action === 'investir') {
      botMsg = {
        id,
        sender: 'bot',
        text: "Pour investir : 1. Rechargez votre compte. 2. Cliquez sur l'onglet 'Investir' en bas. 3. Choisissez un plan et cliquez sur 'Investir'. Les gains seront versés tous les 24h automatiquement.",
        options: [
          { label: 'Retour au menu', action: 'menu' }
        ]
      };
    } else if (action === 'menu') {
      botMsg = {
        id,
        sender: 'bot',
        text: "Que puis-je faire d'autre pour vous ?",
        options: [
          { label: 'Problème de Dépôt', action: 'depot' },
          { label: 'Problème de Retrait', action: 'retrait' },
          { label: 'Comment investir ?', action: 'investir' },
          { label: 'Autre question', action: 'autre' },
        ]
      };
    } else if (action === 'autre' || action === 'whatsapp') {
       if (supportLink) {
         window.open(supportLink, '_blank');
         botMsg = {
           id, sender: 'bot', text: "Ouverture de WhatsApp..."
         };
       } else {
         botMsg = {
           id, sender: 'bot', text: "Ouverture de WhatsApp..."
         };
         window.open('https://wa.me/2250574738155', '_blank'); // default fallback
       }
    } else {
       botMsg = { id, sender: 'bot', text: "Je n'ai pas compris." };
    }

    setMessages(prev => [...prev, botMsg]);
  };

  const handleOptionClick = (action: string, label: string) => {
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: label };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      addBotResponse((Date.now() + 1).toString(), action);
    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      const id = (Date.now() + 1).toString();
      const botMsg: Message = {
        id,
        sender: 'bot',
        text: (
          <span>
            Désolé, je ne connais pas la réponse à cette question. Veuillez contacter notre service client sur WhatsApp en cliquant sur ce lien : <a href="https://wa.me/2250574738155" target="_blank" rel="noopener noreferrer" className="text-red-500 font-bold underline">wa.me/2250574738155</a>
          </span>
        )
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
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
              
              {msg.options && (
                <div className="mt-4 flex flex-col gap-2">
                  {msg.options.map(opt => (
                    <button
                      key={opt.action}
                      onClick={() => handleOptionClick(opt.action, opt.label)}
                      className="text-left px-4 py-2.5 text-[13px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors active:scale-95"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
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
