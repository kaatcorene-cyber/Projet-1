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

    setTimeout(() => {
      const id = (Date.now() + 1).toString();
      const lower = text.toLowerCase();
      let responseText: React.ReactNode = '';

      if (lower.includes('dépôt') || lower.includes('depot') || lower.includes('recharg') || lower.includes('paiement') || lower.includes('payer')) {
        responseText = "Je comprends que vous ayez une question concernant un dépôt. Après avoir initié votre recharge sur l'application, assurez-vous d'avoir bien complété le transfert vers le numéro indiqué via votre opérateur (Orange, MTN, Wave, ou Moov). En règle générale, les dépôts sont validés automatiquement en 5 à 15 minutes. Si ce délai est dépassé, n'hésitez pas à envoyer votre reçu de paiement à notre équipe sur WhatsApp pour une validation immédiate.";
      } else if (lower.includes('retrait')) {
        responseText = "Concernant les retraits, le traitement s'effectue généralement sous 24 heures. Si votre retrait a été rejeté, cela signifie souvent que le numéro Mobile Money entré comporte une erreur ou n'est pas à votre nom. Ne vous inquiétez pas, vos fonds ont été restitués sur votre solde ! Si toutefois votre retrait est en attente depuis plus de 24 heures, notre service client sur WhatsApp se fera un plaisir d'accélérer le processus.";
      } else if (lower.includes('parrain') || lower.includes('invit') || lower.includes('équipe') || lower.includes('equipe') || lower.includes('affili')) {
        responseText = "C'est une excellente initiative de vouloir parrainer ! Pour inviter vos proches, rendez-vous simplement dans la rubrique 'Équipe' au bas de votre écran. Vous y trouverez votre lien d'invitation personnel. En le partageant, vous recevrez automatiquement de généreuses commissions chaque fois que vos filleuls investiront.";
      } else if (lower.includes('investir') || lower.includes('plan') || lower.includes('vip')) {
        responseText = "Investir avec QUALCOMM est très simple ! Voici les étapes : commencez par recharger votre compte, puis accédez à l'onglet 'Investir' situé en bas de l'écran. Il vous suffit ensuite de choisir le plan qui correspond le mieux à vos attentes et de le valider. Par la suite, vos bénéfices seront générés quotidiennement.";
      } else if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('coucou')) {
        responseText = "Bonjour ! Je suis ravi de vous assister. Comment puis-je vous aider aujourd'hui ?";
      } else {
        responseText = (
          <span>
            Je suis navré, je ne suis pas certain de bien comprendre votre demande. Pour vous offrir la meilleure assistance possible, je vous invite à échanger directement avec notre équipe d'assistance sur WhatsApp : <a href={supportLink || 'https://wa.me/2250574738155'} target="_blank" rel="noopener noreferrer" className="text-red-500 font-bold underline whitespace-nowrap">Cliquez ici pour discuter</a>
          </span>
        );
      }

      const botMsg: Message = { id, sender: 'bot', text: responseText };
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
