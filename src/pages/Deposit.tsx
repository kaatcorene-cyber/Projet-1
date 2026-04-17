import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export function Deposit() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('https://bkapay.com/merchant/20cf6268');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch payment link from settings
    supabase.from('settings').select('value').eq('key', 'payment_link').single().then(({ data }) => {
      if (data) setPaymentLink(data.value);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'deposit',
        amount: Number(amount),
        reference: reference,
        status: 'pending'
      }]);

      if (error) throw error;
      
      setMessage('Demande de dépôt envoyée. Elle sera validée sous peu.');
      setAmount('');
      setReference('');
    } catch (err) {
      setMessage('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 pt-20">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Dépôt</h1>
      </header>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-500 text-sm">
          <li>Cliquez sur le bouton ci-dessous pour effectuer le paiement.</li>
          <li>Copiez le numéro de transaction (ID) après le paiement.</li>
          <li>Revenez ici et remplissez le formulaire pour valider votre dépôt.</li>
        </ol>
        
        <a 
          href={paymentLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          Aller au paiement <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm text-center">
            {message}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 ml-1">Montant déposé (FCFA)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
            placeholder="Ex: 5000"
            required
            min="100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 ml-1">Numéro de transaction</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
            placeholder="ID de la transaction"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl mt-6 transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Envoi...' : 'Confirmer le dépôt'}
        </button>
      </form>
    </div>
  );
}
