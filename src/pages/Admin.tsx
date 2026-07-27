import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Trash2, Plus, Users, ArrowDownRight, ArrowUpRight, LayoutList, Settings as SettingsIcon, Edit2, ShieldAlert, Crown, Upload, Loader2, TrendingUp, Activity, CreditCard, BarChart3, Save, Edit, Bot, Search, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DEFAULT_PLANS: any[] = [];

const VIP_LEVELS = ['user', 'vip1', 'vip2', 'vip3', 'vip4', 'vip5'];

export function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [isInitializing, setIsInitializing] = useState(true);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [investmentsList, setInvestmentsList] = useState<any[]>([]);
  
  // Settings
  const [paymentLink, setPaymentLink] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [supportLink, setSupportLink] = useState('');

  const [plans, setPlans] = useState<any[]>([]);
  
  // States for Plans
  const [newPlanAmount, setNewPlanAmount] = useState('');
  const [newPlanPercent, setNewPlanPercent] = useState('18');
  const [newPlanDuration, setNewPlanDuration] = useState('60');
  const [newPlanDaily, setNewPlanDaily] = useState('');
  const [newPlanTotal, setNewPlanTotal] = useState('');
  const [newPlanImage, setNewPlanImage] = useState('');
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Users
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  
  // States for Banks
  const [editingBankUserId, setEditingBankUserId] = useState<string | null>(null);
  const [editBankMethod, setEditBankMethod] = useState('');
  const [editBankAccountName, setEditBankAccountName] = useState('');
  const [editBankAccountNumber, setEditBankAccountNumber] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);


  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();

    // Polling for live admin updates (Reduced frequency to save database quota)
    const intervalId = setInterval(() => {
      fetchData(false); // pass a flag to possibly NOT trigger loading state
    }, 60000 * 2); // 2 minutes instead of 5 seconds

    return () => clearInterval(intervalId);
  }, [user, navigate]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsInitializing(true);
    try {
      const [txsRes, usersRes, settingsRes, invsRes] = await Promise.all([
        supabase.from('transactions').select('*, users(first_name, last_name, phone)').in('type', ['deposit', 'withdrawal']).order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*'),
        supabase.from('investments').select('*, users(first_name, last_name, phone)').order('start_date', { ascending: false })
      ]);

      if (txsRes.data) setTransactions(txsRes.data);
      if (usersRes.data) {
        let uData = usersRes.data;
        if (settingsRes.data) {
          uData = uData.map(u => {
            const bSet = settingsRes.data.find(s => s.key === 'bank_' + u.id);
            if (bSet && bSet.value) {
              try {
                const parsed = JSON.parse(bSet.value);
                return { ...u, bank_method: parsed.bank_method, bank_account_name: parsed.bank_account_name };
              } catch(e) {}
            }
            return u;
          });
        }
        setUsersList(uData);
      }

      if (invsRes.data) {
        setInvestmentsList(invsRes.data);
      }

      if (settingsRes.data && showLoading) {
        const link = settingsRes.data.find(s => s.key === 'payment_link');
        if (link) setPaymentLink(link.value);
        
        const grp = settingsRes.data.find(s => s.key === 'group_link');
        if (grp) setGroupLink(grp.value);

        const sup = settingsRes.data.find(s => s.key === 'support_link');
        if (sup) setSupportLink(sup.value);
        
        const dbPlansStr = settingsRes.data.find(s => s.key === 'investment_plans');
        if (dbPlansStr && dbPlansStr.value) {
          try {
            const parsed = JSON.parse(dbPlansStr.value);
            setPlans(parsed);
          } catch (e) {
            setPlans(DEFAULT_PLANS);
          }
        } else {
          setPlans(DEFAULT_PLANS);
        }
      } else if (showLoading) {
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
    setConfirmModal({
      isOpen: true,
      message: `Voulez-vous vraiment modifier ce solde ?`,
      onConfirm: async () => {
        try {
      
    setLoading(true);
    await supabase.from('users').update({ balance: Number(editBalance) }).eq('id', id);
    setEditingUserId(null);
    fetchData();
    setLoading(false);
  
    } catch(err: any) {
      setMessage({ type: 'error', text: "Erreur: " + err.message });
      setLoading(false);
    }
      }
    });
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    await supabase.from('users').update({ role: newRole }).eq('id', id);
    fetchData();
  };

  const handleDeleteUser = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Voulez-vous vraiment supprimer cet utilisateur ?`,
      onConfirm: async () => {
        try {
      
    setLoading(true);
    await supabase.from('transactions').delete().eq('user_id', id);
    await supabase.from('investments').delete().eq('user_id', id);
    await supabase.from('users').delete().eq('id', id);
    fetchData();
    setLoading(false);
  
    } catch(err: any) {
      setMessage({ type: 'error', text: "Erreur: " + err.message });
      setLoading(false);
    }
      }
    });
  };

  const handleUpdateUserBank = async (id: string) => {
    setLoading(true);
    const packedName = editBankAccountName || editBankAccountNumber 
      ? `${editBankAccountName}|||${editBankAccountNumber}`
      : '';
      
    try {
      await supabase.from('users').update({ 
        bank_method: editBankMethod,
        bank_account_name: packedName
      }).eq('id', id);
    } catch(e) {}
    
    // Always save to settings
    const { error: settingsError } = await supabase.from('settings').upsert({
      key: 'bank_' + id,
      value: JSON.stringify({ bank_method: editBankMethod, bank_account_name: packedName })
    });
    
    setLoading(false);
    if (settingsError) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de la banque : ' + settingsError.message });
    } else {
      setMessage({ type: 'success', text: 'Coordonnées bancaires mises à jour !' });
      setEditingBankUserId(null);
      fetchData();
    }
  };

  const handleClearUserBank = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Voulez-vous vraiment supprimer la banque de cet utilisateur ?',
      onConfirm: async () => {
        setLoading(true);
        try {
          await supabase.from('users').update({ 
            bank_method: '',
            bank_account_name: ''
          }).eq('id', id);
        } catch(e) {}
        
        await supabase.from('settings').delete().eq('key', 'bank_' + id);
        
        setLoading(false);
        setMessage({ type: 'success', text: 'Banque supprimée avec succès !' });
        fetchData();
      }
    });
  };

  const handleRemoveInvestment = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Voulez-vous vraiment supprimer cet investissement ?',
      onConfirm: async () => {

    // removed confirm
    setLoading(true);
    await supabase.from('investments').delete().eq('id', id);
    fetchData();
    setLoading(false);
      }
    });
  };

  // --- Transactions Handlers ---
  const handleTransaction = async (id: string, status: 'approved' | 'rejected', type: string, amount: number, userId: string) => {
    const actionText = status === 'approved' ? 'approuver' : 'rejeter';
    const typeText = type === 'deposit' ? 'ce dépôt' : 'ce retrait';
    
    setConfirmModal({
      isOpen: true,
      message: `Voulez-vous vraiment ${actionText} ${typeText} ?`,
      onConfirm: async () => {
        try {
    const actionText = status === 'approved' ? 'approuver' : 'rejeter';
    

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
            // Level 1 logic (20%)
            const { data: level1 } = await supabase.from('users').select('id, balance, referred_by').eq('referral_code', userData.referred_by).maybeSingle();
            
            if (level1) {
              const l1Bonus = amount * 0.20;
              await supabase.from('users').update({ balance: level1.balance + l1Bonus }).eq('id', level1.id);
              await supabase.from('transactions').insert([{
                user_id: level1.id,
                type: 'referral_bonus',
                amount: l1Bonus,
                status: 'completed',
                reference: 'Bonus 1er dépôt L1 (20%)'
              }]);

              // Level 2 logic (3%)
              if (level1.referred_by) {
                const { data: level2 } = await supabase.from('users').select('id, balance, referred_by').eq('referral_code', level1.referred_by).maybeSingle();
                
                if (level2) {
                  const l2Bonus = amount * 0.03;
                  await supabase.from('users').update({ balance: level2.balance + l2Bonus }).eq('id', level2.id);
                  await supabase.from('transactions').insert([{
                    user_id: level2.id,
                    type: 'referral_bonus',
                    amount: l2Bonus,
                    status: 'completed',
                    reference: 'Bonus 1er dépôt L2 (3%)'
                  }]);

                  // Level 3 logic (2%)
                  if (level2.referred_by) {
                    const { data: level3 } = await supabase.from('users').select('id, balance').eq('referral_code', level2.referred_by).maybeSingle();
                    
                    if (level3) {
                      const l3Bonus = amount * 0.02;
                      await supabase.from('users').update({ balance: level3.balance + l3Bonus }).eq('id', level3.id);
                      await supabase.from('transactions').insert([{
                        user_id: level3.id,
                        type: 'referral_bonus',
                        amount: l3Bonus,
                        status: 'completed',
                        reference: 'Bonus 1er dépôt L3 (2%)'
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
    } catch(err: any) {
      console.error(err);
      setMessage({ type: 'error', text: "Erreur: " + err.message });
      setLoading(false);
    }
      }
    });
  };

  // --- Plans Handlers ---
  const handleSavePlans = async (updatedPlans: any[]) => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous vraiment enregistrer ces plans ?",
      onConfirm: async () => {
        setLoading(true);
        try {
          await supabase.from('settings').upsert({ key: 'investment_plans', value: JSON.stringify(updatedPlans) });
          setPlans(updatedPlans);
        } catch(err: any) {
          setMessage({ type: 'error', text: "Erreur: " + err.message });
        } finally {
          setLoading(false);
        }
      }
    });
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
      percent: Number(newPlanPercent),
      duration: Number(newPlanDuration),
      daily: Number(newPlanDaily),
      total: Number(newPlanTotal),
      image: newPlanImage
    };
    
    let updatedPlans;
    if (editingPlanIndex !== null) {
      updatedPlans = [...plans];
      updatedPlans[editingPlanIndex] = newPlan;
    } else {
      updatedPlans = [...plans, newPlan];
    }
    
    updatedPlans.sort((a, b) => a.amount - b.amount);
    handleSavePlans(updatedPlans);
    
    setNewPlanAmount(''); setNewPlanDaily(''); setNewPlanTotal(''); setNewPlanImage('');
    setNewPlanPercent('18'); setNewPlanDuration('60');
    setEditingPlanIndex(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditPlan = (index: number) => {
    const plan = plans[index];
    setNewPlanAmount(plan.amount.toString());
    setNewPlanPercent((plan.percent || 18).toString());
    setNewPlanDuration((plan.duration || 60).toString());
    setNewPlanDaily(plan.daily.toString());
    setNewPlanTotal(plan.total.toString());
    setNewPlanImage(plan.image);
    setEditingPlanIndex(index);
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditPlan = () => {
    setNewPlanAmount(''); setNewPlanDaily(''); setNewPlanTotal(''); setNewPlanImage('');
    setNewPlanPercent('18'); setNewPlanDuration('60'); 
    setEditingPlanIndex(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePlan = (index: number) => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous vraiment supprimer ce plan ?",
      onConfirm: async () => {
        const updatedPlans = plans.filter((_, i) => i !== index);
        handleSavePlans(updatedPlans);
      }
    });
  };

  // --- Settings Handlers ---
  const handleUpdateSettings = async () => {
    setLoading(true);
    const { error } = await supabase.from('settings').upsert([
      { key: 'payment_link', value: paymentLink },
      { key: 'group_link', value: groupLink },
      { key: 'support_link', value: supportLink }
    ], { onConflict: 'key' });
    setLoading(false);
    
    if (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement : ' + error.message });
    } else {
      // Clear or update the cache immediately so it reflects in Dashboard
      useAppStore.getState().setSettingsCache(null as any);
      setMessage({ type: 'success', text: 'Paramètres enregistrés !' });
    }
  };

  const handleWipeData = async () => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous vraiment TOUT EFFACER (Comptes, transferts, dépôts, investissements, plans) ? Cette action est IRRÉVERSIBLE !",
      onConfirm: async () => {
        setLoading(true);
        try {
          await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('users').delete().eq('role', 'user');
          await supabase.from('settings').upsert({ key: 'investment_plans', value: '[]' });
          
          setMessage({ type: 'success', text: 'Toutes les données ont été effacées avec succès !' });
          setPlans([]);
          setTimeout(() => window.location.reload(), 2000);
        } catch (err: any) {
          setMessage({ type: 'error', text: 'Erreur lors de la suppression : ' + err.message });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'investments', label: 'Investissements', icon: Activity },
    { id: 'deposits', label: 'Dépôts', icon: ArrowDownRight },
    { id: 'withdrawals', label: 'Retraits', icon: ArrowUpRight },
    { id: 'banks', label: 'Banque', icon: CreditCard },
    { id: 'plans', label: 'Plans VIP', icon: LayoutList },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
  ];

  return (
    <div className="p-6 space-y-6 pb-24 pt-20 max-w-lg mx-auto">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-full flex items-center justify-center text-slate-900 shadow-sm hover:bg-slate-100/80 transition-colors shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 truncate">Administration</h1>
      </header>

      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-sm">
          <div className="bg-white border-slate-200/80 shadow-slate-200/50 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmation</h3>
            <p className="text-slate-500 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  setConfirmModal({...confirmModal, isOpen: false});
                  confirmModal.onConfirm();
                }}
                className="flex-1 py-3 px-4 bg-orange-700 hover:bg-orange-800 text-slate-900 rounded-xl font-bold transition-colors shadow-lg shadow-orange-200"
                disabled={loading}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-orange-600/10 text-orange-800 border border-orange-600/20' : 'bg-green-50 text-orange-700 border border-green-100'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-2 scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSearchTerm(''); }}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t.id ? 'bg-orange-600/100 text-slate-900 shadow-md shadow-orange-600/20' : 'bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 text-slate-500 hover:bg-slate-100/80'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {['users', 'deposits', 'withdrawals'].includes(activeTab) && (
        <div className="bg-white border-slate-200/80 shadow-slate-200/50 px-4 py-3 border border-slate-200 rounded-xl shadow-sm mb-4">
          <input
            type="text"
            placeholder="Rechercher par nom ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder-gray-400"
          />
        </div>
      )}

      {/* CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Vue d'ensemble</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-orange-600/20 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total des soldes</p>
               <p className="text-xl font-black text-orange-800">{formatCurrency(usersList.reduce((acc, u) => acc + (u.balance || 0), 0))}</p>
            </div>
            <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-orange-600/20 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Retraits validés</p>
               <p className="text-xl font-black text-orange-800">{formatCurrency(transactions.filter(t => t.type === 'withdrawal' && t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0))}</p>
            </div>
            <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-amber-100 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Dépôts validés</p>
               <p className="text-xl font-black text-amber-600">{formatCurrency(transactions.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((acc, t) => acc + (t.amount || 0), 0))}</p>
            </div>
            <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-orange-600/20 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Utilisateurs</p>
               <p className="text-xl font-black text-orange-700">{usersList.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: INVESTMENTS */}
      {activeTab === 'investments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Tous les Investissements ({investmentsList.length})</h2>
          <div className="space-y-3">
            {investmentsList.length === 0 ? (
              <p className="text-center text-slate-500 py-8 bg-white border-slate-200/80 shadow-slate-200/50 rounded-2xl border border-slate-200">Aucun investissement</p>
            ) : (
              investmentsList.map(inv => {
                
                return (
                <div key={inv.id} className="bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-orange-600/100`}></div>
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">Contrat ({formatCurrency(inv.plan_amount || 0)})</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {inv.users?.first_name} {inv.users?.last_name} ({inv.users?.phone})
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                        inv.status === 'active' ? 'bg-orange-600/20 text-red-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {inv.status}
                      </span>
                      <button onClick={() => handleRemoveInvestment(inv.id)} disabled={loading} className="text-orange-600 hover:bg-orange-600/10 p-1.5 rounded-lg transition-colors" title="Supprimer l'investissement">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 pl-2">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Prix du pack</p>
                      <p className="font-bold text-slate-900">{formatCurrency(inv.plan_amount || 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Gain Journalier</p>
                      <p className={`font-bold text-orange-800`}>{formatCurrency(inv.daily_yield)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 text-center">
                    Acheté le : {inv.start_date ? format(new Date(inv.start_date), 'dd MMM yyyy HH:mm', { locale: fr }) : 'Date inconnue'}
                    <br />
                    Expire le : {inv.end_date ? format(new Date(inv.end_date), 'dd MMM yyyy HH:mm', { locale: fr }) : 'Non défini'}
                  </p>
                </div>
              )})
            )}
          </div>
        </div>
      )}



      {/* CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Gestion des Utilisateurs ({usersList.length})</h2>
          <div className="space-y-3">
            {usersList.filter(u => searchTerm ? `${u.first_name} ${u.last_name} ${u.phone} OLA-${u.id.substring(0,6).toUpperCase()}`.toLowerCase().includes(searchTerm.toLowerCase()) : true).map(u => (
              <div key={u.id} className="bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-2xl p-4 shadow-sm relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                       {u.first_name} {u.last_name}
                       {u.role && u.role.startsWith('vip') && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">{u.role}</span>}
                       {u.role === 'admin' && <ShieldAlert className="w-4 h-4 text-orange-600" />}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{u.phone} • {u.country}</p>
                    <p className="text-[11px] text-slate-500 mt-1"><span className="font-semibold">MDP:</span> <span className="font-mono text-slate-900 bg-slate-100 px-1 py-0.5 rounded">{u.password_hash}</span></p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">OLA-{u.id.substring(0, 6).toUpperCase()}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="font-bold text-orange-800 bg-orange-600/10 px-2 py-1 rounded-lg text-sm">{formatCurrency(u.balance)}</p>
                    {u.role !== 'admin' && (
                       <select 
                         value={u.role || 'user'} 
                         onChange={(e) => handleRoleChange(u.id, e.target.value)}
                         className="text-[10px] border border-slate-200 rounded p-1 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-slate-200/50 outline-none"
                       >
                         {VIP_LEVELS.map(v => <option key={v} value={v}>{v === 'user' ? 'Standard' : v.toUpperCase()}</option>)}
                       </select>
                    )}
                  </div>
                </div>

                {editingUserId === u.id ? (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                    <input type="number" className="flex-1 bg-slate-100/80 border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-600 font-medium" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} />
                    <button onClick={() => handleUpdateBalance(u.id)} disabled={loading} className="px-4 bg-orange-600/100 hover:bg-orange-800 text-slate-900 font-medium rounded-lg text-sm transition-colors cursor-pointer">Sauver</button>
                    <button onClick={() => setEditingUserId(null)} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors cursor-pointer">X</button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                    <button onClick={() => {setEditingUserId(u.id); setEditBalance(String(u.balance));}} className="flex-1 py-2 bg-slate-100/80 text-slate-500 rounded-xl flex items-center justify-center text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Solde
                    </button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-orange-600/10 text-orange-600 border border-orange-600/20 rounded-xl hover:bg-orange-600/20 transition-colors cursor-pointer">
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

      {/* CONTENT: BANKS */}
      {activeTab === 'banks' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Gestion des Banques ({usersList.length})</h2>
          <div className="space-y-3">
            {usersList.filter(u => searchTerm ? `${u.first_name} ${u.last_name} ${u.phone} ${u.bank_method} ${u.bank_account_name} OLA-${u.id.substring(0,6).toUpperCase()}`.toLowerCase().includes(searchTerm.toLowerCase()) : true).map(u => {
              const bAccountNameRaw = (u as any)?.bank_account_name || '';
              const bAccountName = bAccountNameRaw.split('|||')[0] || '';
              const bAccountNumber = bAccountNameRaw.split('|||')[1] || '';
              const bMethod = (u as any)?.bank_method || 'Non défini';

              return (
              <div key={u.id} className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-sm relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900 flex items-center gap-2">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">{u.phone}</p>
                    <div className="mt-2 bg-slate-100/80 rounded-lg p-2 inline-block space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700">
                        Opérateur: <span className="font-normal text-slate-500">{bMethod}</span>
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        Nom: <span className="font-normal text-slate-500">{bAccountName || 'N/A'}</span>
                      </p>
                      <p className="text-xs font-semibold text-slate-700">
                        Numéro: <span className="font-normal text-slate-500">{bAccountNumber || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {u.bank_method && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                    <button 
                      onClick={() => handleClearUserBank(u.id)}
                      className="flex-1 py-2 bg-orange-600/10 text-orange-600 rounded-xl flex items-center justify-center text-xs font-medium hover:bg-orange-600/20 transition-colors border border-orange-600/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" /> Supprimer ce compte bancaire
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENT: DEPOSITS */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Demandes de Dépôts</h2>
          <div className="space-y-3">
            {transactions.filter(t => t.type === 'deposit' && (searchTerm ? `${t.users?.first_name} ${t.users?.last_name} ${t.users?.phone} ${t.reference} OLA-${t.users?.id?.substring(0,6).toUpperCase()}`.toLowerCase().includes(searchTerm.toLowerCase()) : true)).length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun dépôt.</p>}
            {transactions.filter(t => t.type === 'deposit' && (searchTerm ? `${t.users?.first_name} ${t.users?.last_name} ${t.users?.phone} ${t.reference} OLA-${t.users?.id?.substring(0,6).toUpperCase()}`.toLowerCase().includes(searchTerm.toLowerCase()) : true)).map(tx => (
              <div key={tx.id} className="bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-slate-900">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-slate-500 mt-1">{tx.users?.first_name} {tx.users?.last_name} ({tx.users?.phone})</p>
                    <p className="text-xs text-slate-500 mt-1">Ref: {tx.reference}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    tx.status === 'approved' ? 'bg-orange-600/10 text-orange-800 border border-orange-600/20' :
                    'bg-orange-600/10 text-orange-700 border border-orange-600/20'
                  }`}>
                    {tx.status}
                  </div>
                </div>
                
                {tx.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                    <button onClick={() => handleTransaction(tx.id, 'approved', tx.type, tx.amount, tx.user_id)} className="flex-1 bg-orange-600/10 hover:bg-orange-600/20 text-orange-800 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                      <CheckCircle className="w-4 h-4" /> Approuver
                    </button>
                    <button onClick={() => handleTransaction(tx.id, 'rejected', tx.type, tx.amount, tx.user_id)} className="flex-1 bg-orange-600/10 hover:bg-orange-600/20 text-orange-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
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
          <h2 className="text-lg font-bold text-slate-900 mb-2">Demandes de Retraits</h2>
          <div className="space-y-3">
            {transactions.filter(t => t.type === 'withdrawal' && (searchTerm ? `${t.users?.first_name} ${t.users?.last_name} ${t.users?.phone} ${t.reference} OLA-${t.users?.id?.substring(0,6).toUpperCase()}`.toLowerCase().includes(searchTerm.toLowerCase()) : true)).length === 0 && <p className="text-sm text-slate-500 text-center py-4">Aucun retrait.</p>}
            {transactions.filter(t => t.type === 'withdrawal' && (searchTerm ? `${t.users?.first_name} ${t.users?.last_name} ${t.users?.phone} ${t.reference} OLA-${t.users?.id?.substring(0,6).toUpperCase()}`.toLowerCase().includes(searchTerm.toLowerCase()) : true)).map(tx => (
              <div key={tx.id} className="bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Montant demandé</p>
                    <p className="font-bold text-slate-900">{formatCurrency(tx.amount)}</p>
                    <div className="flex items-center gap-2 mt-1 mb-2">
                      <div className="bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-300/50">
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">Frais (10%)</p>
                        <p className="text-orange-500 font-bold text-xs">-{formatCurrency(tx.amount * 0.10)}</p>
                      </div>
                      <div className="bg-orange-600/10 px-2 py-0.5 rounded-md border border-orange-600/20">
                        <p className="text-[9px] text-orange-600/70 uppercase tracking-wider">Montant à envoyer</p>
                        <p className="text-orange-500 font-bold text-xs">{formatCurrency(tx.amount * 0.90)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{tx.users?.first_name} {tx.users?.last_name} ({tx.users?.phone})</p>
                    <p className="text-xs text-slate-500 mt-1">Ref/Numéro: {tx.reference}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    tx.status === 'approved' ? 'bg-orange-600/10 text-orange-800 border border-orange-600/20' :
                    'bg-orange-600/10 text-orange-700 border border-orange-600/20'
                  }`}>
                    {tx.status}
                  </div>
                </div>
                
                {tx.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                    <button onClick={() => handleTransaction(tx.id, 'approved', tx.type, tx.amount, tx.user_id)} className="flex-1 bg-orange-600/10 hover:bg-orange-600/20 text-orange-800 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
                      <CheckCircle className="w-4 h-4" /> Approuver
                    </button>
                    <button onClick={() => handleTransaction(tx.id, 'rejected', tx.type, tx.amount, tx.user_id)} className="flex-1 bg-orange-600/10 hover:bg-orange-600/20 text-orange-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer">
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
          <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-3xl p-6 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-4">{editingPlanIndex !== null ? 'Modifier le contrat' : 'Créer un contrat'}</h2>
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-3">
                 <input 
                   type="number" 
                   placeholder="Montant (ex: 5000)" 
                   value={newPlanAmount} 
                   onChange={e => {
                     const amt = Number(e.target.value);
                     setNewPlanAmount(e.target.value);
                     if (amt > 0) {
                        const daily = Math.round(amt * (Number(newPlanPercent) / 100));
                        const total = daily * Number(newPlanDuration);
                        setNewPlanDaily(daily.toString());
                        setNewPlanTotal(total.toString());
                     } else {
                        setNewPlanDaily('');
                        setNewPlanTotal('');
                     }
                   }} 
                   className="col-span-2 bg-slate-100/80 border border-slate-200 text-slate-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-orange-600 outline-none" 
                 />
                 <div className="flex flex-col gap-1">
                   <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Gain %</label>
                   <input 
                     type="number" 
                     placeholder="%" 
                     value={newPlanPercent} 
                     onChange={e => {
                       const pct = Number(e.target.value);
                       setNewPlanPercent(e.target.value);
                       if (Number(newPlanAmount) > 0) {
                          const daily = Math.round(Number(newPlanAmount) * (pct / 100));
                          const total = daily * Number(newPlanDuration);
                          setNewPlanDaily(daily.toString());
                          setNewPlanTotal(total.toString());
                       }
                     }} 
                     className="bg-slate-100/80 border border-slate-200 text-slate-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-orange-600 outline-none" 
                   />
                 </div>
                 <div className="flex flex-col gap-1">
                   <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Durée (jours)</label>
                   <input 
                     type="number" 
                     placeholder="Jours" 
                     value={newPlanDuration} 
                     onChange={e => {
                       const dur = Number(e.target.value);
                       setNewPlanDuration(e.target.value);
                       if (Number(newPlanAmount) > 0) {
                          const daily = Math.round(Number(newPlanAmount) * (Number(newPlanPercent) / 100));
                          const total = daily * dur;
                          setNewPlanDaily(daily.toString());
                          setNewPlanTotal(total.toString());
                       }
                     }} 
                     className="bg-slate-100/80 border border-slate-200 text-slate-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-orange-600 outline-none" 
                   />
                 </div>
                 <div className="flex flex-col gap-1">
                   <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Gain/Jour (FCFA)</label>
                   <input type="number" placeholder="Gain journalier" value={newPlanDaily} readOnly className="bg-slate-100 border border-slate-200 text-slate-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-orange-600 outline-none cursor-not-allowed opacity-80" />
                 </div>
                 <div className="flex flex-col gap-1">
                   <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Total (FCFA)</label>
                   <input type="number" placeholder="Revenu Total" value={newPlanTotal} readOnly className="bg-slate-100 border border-slate-200 text-slate-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-orange-600 outline-none cursor-not-allowed opacity-80" />
                 </div>
               </div>

               {/* IMAGE UPLOAD */}
               <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-100/80 transition-colors">
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
                       <div className="w-10 h-10 bg-orange-600/10 text-orange-600 rounded-full flex items-center justify-center">
                         <Upload className="w-5 h-5" />
                       </div>
                       <span className="text-sm font-medium text-slate-500">Ajouter une photo</span>
                     </>
                   )}
                 </label>
               </div>

               {editingPlanIndex !== null ? (
                 <div className="flex gap-2">
                   <button onClick={handleAddPlan} disabled={loading || !newPlanImage || !newPlanAmount || !newPlanDaily || !newPlanTotal} className="flex-1 bg-orange-600/100 hover:bg-orange-800 disabled:opacity-50 text-slate-900 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                     <Save className="w-5 h-5" /> Sauvegarder
                   </button>
                   <button onClick={handleCancelEditPlan} className="flex-1 bg-slate-200 hover:bg-gray-300 text-slate-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                     Annuler
                   </button>
                 </div>
               ) : (
                 <button onClick={handleAddPlan} disabled={loading || !newPlanImage || !newPlanAmount || !newPlanDaily || !newPlanTotal} className="w-full bg-orange-600/100 hover:bg-orange-800 disabled:opacity-50 text-slate-900 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                   <Plus className="w-5 h-5" /> Ajouter à la liste
                 </button>
               )}
             </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-slate-900 font-bold px-1">Plans actuels ({plans.length})</h3>
            {isInitializing ? (
               <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
               </div>
            ) : plans.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white border-slate-200/80 shadow-slate-200/50 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600/100"></div>
                <div className="flex items-center gap-4 pl-2">
                  <img src={p.image || '/logo.svg?v=2'} className="w-12 h-12 rounded-xl object-cover bg-slate-100" alt="" referrerPolicy="no-referrer" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                       <p className="font-bold text-slate-900 text-sm leading-none">{formatCurrency(p.amount)}</p>
                    </div>
                    <div className="flex gap-2">
                        <p className="text-[11px] text-slate-500 mt-0.5">Gain/j: <span className="font-bold text-slate-700">{formatCurrency(p.daily)}</span></p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Total: <span className="font-bold text-slate-700">{formatCurrency(p.total)}</span></p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditPlan(idx)} disabled={loading} className="p-2.5 text-orange-600 bg-orange-600/10 border border-orange-600/20 rounded-xl hover:bg-orange-600/20 transition-colors cursor-pointer">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleRemovePlan(idx)} disabled={loading} className="p-2.5 text-orange-600 bg-orange-600/10 border border-orange-600/20 rounded-xl hover:bg-orange-600/20 transition-colors cursor-pointer">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Configuration globale</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 ml-1 mb-1">Lien de Paiement</label>
                <input
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-600 transition-colors text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 ml-1 mb-1">Lien du Groupe (ex: Telegram/WhatsApp)</label>
                <input
                  type="url"
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-600 transition-colors text-sm"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 ml-1 mb-1">Lien du Service Client</label>
                <input
                  type="url"
                  value={supportLink}
                  onChange={(e) => setSupportLink(e.target.value)}
                  className="w-full bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-600 transition-colors text-sm"
                  placeholder="https://t.me/support..."
                />
              </div>

              <button 
                onClick={handleUpdateSettings}
                disabled={loading}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-medium transition-colors shadow-sm cursor-pointer mt-4 border border-slate-300"
              >
                Sauvegarder les paramètres
              </button>

              <div className="pt-6 mt-6 border-t border-orange-600/20">
                <h3 className="text-orange-600 font-bold mb-3">Zone de Danger</h3>
                <button 
                  onClick={handleWipeData}
                  disabled={loading}
                  className="w-full bg-orange-700 hover:bg-orange-800 text-slate-900 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-orange-600/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  TOUT EFFACER (RÉINITIALISER)
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">Cette action supprimera tous les utilisateurs, dépôts, retraits et plans d'investissement.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
