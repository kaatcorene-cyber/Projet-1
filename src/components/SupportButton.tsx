import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export function SupportButton() {
  const [supportLink, setSupportLink] = useState('https://t.me/GraceRaphaelle');
  const location = useLocation();

  useEffect(() => {
    const fetchLink = async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'support_link').single();
      if (data && data.value) {
        setSupportLink(data.value);
      }
    };
    fetchLink();
  }, []);

  if (location.pathname === '/register') {
    return null;
  }

  return (
    <a 
      href={supportLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-24 right-5 w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform active:scale-95 z-50 border-2 border-zinc-900"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
