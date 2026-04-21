import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Trash2, Plus, Users, ArrowDownRight, ArrowUpRight, LayoutList, Settings as SettingsIcon, Edit2, ShieldAlert, Crown, Upload, Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DEFAULT_PLANS = [
  { amount: 2500, daily: 375, total: 22500, image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&q=80&w=800' },
  { amount: 5000, daily: 750, total: 45000, image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800' },
  { amount: 10000, daily: 1500, total: 90000, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800' },
  { amount: 15000, daily: 2250, total: 135000, image: 'https://images.unsplash.com/photo-1605374668853-2d2d6d841b52?auto=format&fit=crop&q=80&w=800' },
  { amount: 20000, daily: 3000, total: 180000, image: 'https://images.unsplash.com/photo-1542396601-dca920ea2807?auto=format&fit=crop&q=80&w=800' },
  { amount: 30000, daily: 4500, total: 270000, image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&q=80&w=800' },
];

const VIP_LEVELS = ['user', 'vip1', 'vip2', 'vip3', 'vip4', 'vip5'];

export function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [isInitializing, setIsInitializing] = useState(true);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // Settings
  const [paymentLink, setPaymentLink] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [supportLink, setSupportLink] = useState('');

  const [plans, setPlans] = useState<any[]>([]);
  
  // States for Plans
  const [newPlanAmount, setNewPlanAmount] = useState('');
  const [newPlanDaily, setNewPlanDaily] = useState('');
  const [newPlanTotal, setNewPlanTotal] = useState('');
  const [newPlanImage, setNewPlanImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Users
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setIsInitializing(true);
    try {
      const [txsRes, usersRes, settingsRes] = await Promise.all([
        supabase.from('transactions').select('*, users(first_name, last_name, phone)').in('type', ['deposit', 'withdrawal']).order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*')
      ]);

      if (txsRes.data) setTransactions(txsRes.data);
      if (usersRes.data) setUsersList(usersRes.data);

      if (settingsRes.data) {
        const link = settingsRes.data.find(s => s.key === 'payment_link');
        if (link) setPaymentLink(link.value);
        
        const grp = settingsRes.data.find(s => s.key === 'group_link');
        if (grp) setGroupLink(grp.value);

        const sup = settingsRes.data.find(s => s.key === 'support_link');
        if (sup) setSupportLink(sup.value);

        const dbPlansStr = settingsRes.data.find(s => s.key === 'investment_plans');
        if (dbPlansStr && dbPlansStr.value) {
          try {
            setPlans(JSON.parse(dbPlansStr.value));
          } catch (e) {
            setPlans(DEFAULT_PLANS);
          }
        } else {
          setPlans(DEFAULT_PLANS);
        }
      } else {
        setPlans(DEFAULT_PLANS);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitializing(false);
    }
  };

  // --- Users Handlers ---
  const handleUpdateBalance = async (id: string) => {
    setLoading(true);
    await supabase.from('users').update({ balance: Number(editBalance) }).eq('id', id);
    setEditingUserId(null);
    fetchData();
    setLoading(false);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    await supabase.from('users').update({ role: newRole }).eq('id', id);
    fetchData();
  };

  const handleDeleteUser = async (id: string) => {
    setLoading(true);
    await supabase.from('transactions').delete().eq('user_id', id);
    await supabase.from('investments').delete().eq('user_id', id);
    await supabase.from('users').delete().eq('id', id);
    setConfirmDeleteId(null);
    fetchData();
    setLoading(false);
  };

  // --- Transactions Handlers ---
  const handleTransaction = async (id: string, status: 'approved' | 'rejected', type: string, amount: number, userId: string) => {
    setLoading(true);
    await supabase.from('transactions').update({ status }).eq('id', id);

    if (status === 'approved') {
      if (type === 'deposit') {
        const { data: userData } = await supabase.from('users').select('balance, referred_by').eq('id', userId).single();
        if (userData) {
          await supabase.from('users').update({ balance: userData.balance + amount }).eq('id', userId);

          // Check if this is the user's FIRST approved deposit to attribute referral bonus
          const { count } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'deposit')
            .eq('status', 'approved');

          if (count === 1 && userData.referred_by) {
            // Level 1 logic (25%)
            const { data: level1 } = await supabase.from('users').select('id, balance, referred_by').eq('referral_code', userData.referred_by).maybeSingle();
            
            if (level1) {
              const l1Bonus = amount * 0.25;
              await supabase.from('users').update({ balance: level1.balance + l1Bonus }).eq('id', level1.id);
              await supabase.from('transactions').insert([{
                user_id: level1.id,
                type: 'referral_bonus',
                amount: l1Bonus,
                status: 'completed',
                reference: 'Bonus 1er dépôt L1 (25%)'
              }]);

              // Level 2 logic (2%)
              if (level1.referred_by) {
                const { data: level2 } = await supabase.from('users').select('id, balance, referred_by').eq('referral_code', level1.referred_by).maybeSingle();
                
                if (level2) {
                  const l2Bonus = amount * 0.02;
                  await supabase.from('users').update({ balance: level2.balance + l2Bonus }).eq('id', level2.id);
                  await supabase.from('transactions').insert([{
                    user_id: level2.id,
                    type: 'referral_bonus',
                    amount: l2Bonus,
                    status: 'completed',
                    reference: 'Bonus 1er dépôt L2 (2%)'
                  }]);

                  // Level 3 logic (1%)
                  if (level2.referred_by) {
                    const { data: level3 } = await supabase.from('users').select('id, balance').eq('referral_code', level2.referred_by).maybeSingle();
                    
                    if (level3) {
                      const l3Bonus = amount * 0.01;
                      await supabase.from('users').update({ balance: level3.balance + l3Bonus }).eq('id', level3.id);
                      await supabase.from('transactions').insert([{
                        user_id: level3.id,
                        type: 'referral_bonus',
                        amount: l3Bonus,
                        status: 'completed',
                        reference: 'Bonus 1er dépôt L3 (1%)'
                      }]);
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else if (status === 'rejected' && type === 'withdrawal') {
      const { data: userData } = await supabase.from('users').select('balance').eq('id', userId).single();
      if (userData) {
        await supabase.from('users').update({ balance: userData.balance + amount }).eq('id', userId);
      }
    }
    fetchData();
    setLoading(false);
  };

  // --- Plans Handlers ---
  const handleSavePlans = async (updatedPlans: any[]) => {
    setLoading(true);
    await supabase.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(updatedPlans) });
    setPlans(updatedPlans);
    setLoading(false);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setNewPlanImage(compressedBase64);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPlan = () => {
    if (!newPlanAmount || !newPlanDaily || !newPlanTotal || !newPlanImage) return;
    const newPlan = {
      amount: Number(newPlanAmount),
      daily: Number(newPlanDaily),
      total: Number(newPlanTotal),
      image: newPlanImage
    };
    const updatedPlans = [...plans, newPlan].sort((a, b) => a.amount - b.amount);
    handleSavePlans(updatedPlans);
    setNewPlanAmount(''); setNewPlanDaily(''); setNewPlanTotal(''); setNewPlanImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePlan = (index: number) => {
    const updatedPlans = plans.filter((_, i) => i !== index);
    handleSavePlans(updatedPlans);
  };

  // --- Settings Handlers ---
  const handleUpdateSettings = async () => {
    setLoading(true);
    await supabase.from('settings').upsert([
      { key: 'payment_link', value: paymentLink },
      { key: 'group_link', value: groupLink },
      { key: 'support_link', value: supportLink }
    ]);
    setLoading(false);
    alert('Paramètres enregistrés !');
  };

  const tabs = [
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'deposits', label: 'Dépôts', icon: ArrowDownRight },
    { id: 'withdrawals', label: 'Retraits', icon: ArrowUpRight },
    { id: 'plans', label: 'Plans VIP', icon: LayoutList },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
  ];

  return (
    <div className="p-6 space-y-6 pb-24 pt-20 max-w-lg mx-auto">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 truncate">Administration</h1>
      </header>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-2 scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t.id ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Gestion des Utilisateurs ({usersList.length})</h2>
          <div className="space-y-3">
            {usersList.map(u => (
              <div key={u.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      {u.first_name} {u.last_name}
                      {u.role && u.role.startsWith('vip') && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">{u.role}</span>}
                      {u.role === 'admin' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{u.phone} • {u.country}</p>
                    <p className="text-[11px] text-gray-500 mt-1"><span className="font-semibold">MDP:</span> <span className="font-mono text-gray-900 bg-gray-100 px-1 py-0.5 rounded">{u.password_hash}</span></p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{u.id}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-sm">{formatCurrency(u.balance)}</p>
                    {u.role !== 'admin' && (
                       <select 
                         value={u.role || 'user'} 
                         onChange={(e) => handleRoleChange(u.id, e.target.value)}
                         className="text-[10px] border border-gray-200 rounded p-1 bg-white outline-none"
                       >
                         {VIP_LEVELS.map(v => <option key={v} value={v}>{v === 'user' ? 'Standard' : v.toUpperCase()}</option>)}
                       </select>
                    )}
                  </div>
                </div>

                {editingUserId === u.id ? (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <input type="number" className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-medium" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} />
                    <button onClick={() => handleUpdateBalance(u.id)} disabled={loading} className="px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer">Sauver</button>
                    <button onClick={() => setEditingUserId(null)} className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-colors cursor-pointer">X</button>
                  </div>
                ) : confirmDeleteId === u.id ? (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 text-xs font-medium">
                    <button onClick={() => handleDeleteUser(u.id)} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 cursor-pointer transition-colors">Oui, Supprimer</button>
                    <button onClick={() => setConfirmDeleteId(null)} disabled={loading} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 cursor-pointer transition-colors">Annuler</button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => {setEditingUserId(u.id); setEditBalance(String(u.balance));}} className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center text-xs font-medium hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Solde
                    </button>
                    {u.role !== 'admin' && (
                      <button onClick={() => setConfirmDeleteId(u.id)} className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: DEPOSITS */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Demandes de Dépôts</h2>
          <div className="space-y-3">
            {transactions.filter(t => t.type === 'deposit').length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucun dépôt.</p>}
            {transactions.filter(t => t.type === 'deposit').map(tx => (
              <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">{tx.users?.first_name} {tx.users?.last_name} ({tx.users?.phone})</p>
                    <p className="text-xs text-gray-400 mt-1">Ref: {tx.reference}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    tx.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {tx.status}
                  </div>
                </div>
                
                {tx.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleTransaction(tx.id, 'approved', tx.type, tx.amount, tx.user_id)} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                      <CheckCircle className="w-4 h-4" /> Approuver
                    </button>
                    <button onClick={() => handleTransaction(tx.id, 'rejected', tx.type, tx.amount, tx.user_id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                      <XCircle className="w-4 h-4" /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: WITHDRAWALS */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Demandes de Retraits</h2>
          <div className="space-y-3">
            {transactions.filter(t => t.type === 'withdrawal').length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucun retrait.</p>}
            {transactions.filter(t => t.type === 'withdrawal').map(tx => (
              <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">{tx.users?.first_name} {tx.users?.last_name} ({tx.users?.phone})</p>
                    <p className="text-xs text-gray-400 mt-1">Ref/Numéro: {tx.reference}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    tx.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {tx.status}
                  </div>
                </div>
                
                {tx.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => handleTransaction(tx.id, 'approved', tx.type, tx.amount, tx.user_id)} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                      <CheckCircle className="w-4 h-4" /> Approuver
                    </button>
                    <button onClick={() => handleTransaction(tx.id, 'rejected', tx.type, tx.amount, tx.user_id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                      <XCircle className="w-4 h-4" /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Créer un Plan VIP</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Montant (ex: 5000)" value={newPlanAmount} onChange={e => setNewPlanAmount(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" />
                <input type="number" placeholder="Gain journalier" value={newPlanDaily} onChange={e => setNewPlanDaily(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" />
                <input type="number" placeholder="Revenu Total" value={newPlanTotal} onChange={e => setNewPlanTotal(e.target.value)} className="col-span-2 bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" />
              </div>

              {/* IMAGE UPLOAD */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  ref={fileInputRef}
                  className="hidden" 
                  id="plan-image"
                />
                <label htmlFor="plan-image" className="cursor-pointer flex flex-col items-center gap-2">
                  {newPlanImage ? (
                    <img src={newPlanImage} className="w-full h-32 object-cover rounded-lg shadow-sm" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Ajouter une photo de la galerie</span>
                    </>
                  )}
                </label>
              </div>

              <button onClick={handleAddPlan} disabled={loading || !newPlanImage} className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                <Plus className="w-5 h-5" /> Ajouter à la liste
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-gray-900 font-bold px-1">Plans actuels ({plans.length})</h3>
            {isInitializing ? (
               <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
               </div>
            ) : plans.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt="" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-emerald-600 font-medium bg-emerald-50 inline-block px-2 py-0.5 rounded mt-1">+{formatCurrency(p.daily)}/jour</p>
                  </div>
                </div>
                <button onClick={() => handleRemovePlan(idx)} disabled={loading} className="p-2.5 text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Configuration globale</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 ml-1 mb-1">Lien de paiement pour dépôts</label>
                <input
                  type="text"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 ml-1 mb-1">Lien du Groupe (ex: Telegram/WhatsApp)</label>
                <input
                  type="url"
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 ml-1 mb-1">Lien du Service Client</label>
                <input
                  type="url"
                  value={supportLink}
                  onChange={(e) => setSupportLink(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  placeholder="https://t.me/support..."
                />
              </div>

              <button 
                onClick={handleUpdateSettings}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors shadow-sm cursor-pointer mt-4"
              >
                Sauvegarder les paramètres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
