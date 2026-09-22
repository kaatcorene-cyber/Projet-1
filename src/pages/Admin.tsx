import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useAuthStore, deleteStoredLocalUser } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, CheckCircle, XCircle, Trash2, Plus, Users, 
  ArrowDownRight, ArrowUpRight, LayoutList, Edit2, ShieldAlert, 
  Upload, Loader2, Activity, BarChart3, Save, Edit, 
  Lock, Unlock, RotateCcw 
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DEFAULT_CROP_PLANS, CropPlan } from '../data/plans';
import { getCropInfo } from '../lib/investments';
import { 
  getLocalUsers, 
  saveLocalUser, 
  deleteLocalUser, 
  getLocalTransactions, 
  saveLocalTransaction, 
  updateLocalTransactionStatus, 
  deleteLocalTransaction, 
  getLocalInvestments, 
  deleteLocalInvestment,
  getLocalSettings, 
  saveLocalSettings,
  purgePlatformDataExceptAdmin,
  isPermanentlyDeletedPhone,
  deleteAccountCompletely,
  SEED_ADMIN
} from '../lib/dataStore';
import { safeStorage } from '../lib/storage';

const VIP_LEVELS = ['user', 'vip1', 'vip2', 'vip3', 'vip4', 'vip5'];

export function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isInitializing, setIsInitializing] = useState(true);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [investmentsList, setInvestmentsList] = useState<any[]>([]);
  
  // Settings
  const [paymentLink, setPaymentLink] = useState('');
  const [appLogo, setAppLogo] = useState('');
  const [ussdCI, setUssdCI] = useState('*155*1*1*0140814162#');
  const [ussdMtnCI, setUssdMtnCI] = useState('*133*1*1*0595918513#');
  const [waveNumber, setWaveNumber] = useState('0574738155');
  const [groupLink, setGroupLink] = useState('');
  const [supportLink, setSupportLink] = useState('');
  const [extraSettings, setExtraSettings] = useState<Record<string, string>>({});

  // Plans
  const [plans, setPlans] = useState<CropPlan[]>(DEFAULT_CROP_PLANS);
  
  // States for Plan Form
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanAmount, setNewPlanAmount] = useState('');
  const [newPlanPercent, setNewPlanPercent] = useState('7');
  const [newPlanDuration, setNewPlanDuration] = useState('60');
  const [newPlanDaily, setNewPlanDaily] = useState('');
  const [newPlanTotal, setNewPlanTotal] = useState('');
  const [newPlanImage, setNewPlanImage] = useState('');
  const [newPlanLocked, setNewPlanLocked] = useState(false);
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Users
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(false);
  // Verrouillage anti-double clic / idempotence pour les confirmations de transaction
  const processingTxRef = useRef<Set<string>>(new Set());
  const [processingTxIds, setProcessingTxIds] = useState<Record<string, boolean>>({});
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.phone === '+2250704752133' || user?.phone === '0704752133';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/profile');
      return;
    }
    fetchData();

    const intervalId = setInterval(() => {
      fetchData(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [user, navigate, isAdmin]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsInitializing(true);
    try {
      // 1. Charger immédiatement le cache local
      const localUsers = getLocalUsers();
      const localTxs = getLocalTransactions();
      const localInvs = getLocalInvestments();
      const localSets = getLocalSettings();

      setUsersList(localUsers);
      setTransactions(localTxs);
      setInvestmentsList(localInvs);

      // Charger les paramètres locaux immédiatement
      if (localSets.payment_link) setPaymentLink(localSets.payment_link);
      if (localSets.group_link) setGroupLink(localSets.group_link);
      if (localSets.support_link) setSupportLink(localSets.support_link);
      if (localSets.ussd_ci) setUssdCI(localSets.ussd_ci);
      if (localSets.wave_number) setWaveNumber(localSets.wave_number);
      if (localSets.ussd_mtn_ci) setUssdMtnCI(localSets.ussd_mtn_ci);
      if (localSets.app_logo) setAppLogo(localSets.app_logo);

      // 2. Tenter de récupérer les données en ligne avec rattrapage automatique en cas d'erreur réseau
      const safeQuery = async (queryPromise: PromiseLike<any>) => {
        try {
          return await queryPromise;
        } catch (e) {
          return { data: null, error: e };
        }
      };

      const [usersRes, transRes, invRes, settingsRes] = await Promise.all([
        safeQuery(supabase.from('users').select('*').order('created_at', { ascending: false })),
        safeQuery(supabase.from('transactions').select('*, users(first_name, last_name, phone)').order('created_at', { ascending: false })),
        safeQuery(supabase.from('investments').select('*, users(first_name, last_name, phone)').order('start_date', { ascending: false })),
        safeQuery(supabase.from('settings').select('*'))
      ]);

      if (usersRes?.data && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
        const mergedUsers = [...usersRes.data];
        for (const lu of localUsers) {
          if (!mergedUsers.some(mu => mu.id === lu.id || mu.phone === lu.phone)) {
            mergedUsers.push(lu);
          }
        }
        
        // Filtrer les comptes définitivement supprimés
        const cleanUsers = mergedUsers.filter(u => !isPermanentlyDeletedPhone(u.phone));
        if (cleanUsers.length !== mergedUsers.length) {
          deleteAccountCompletely('2250574641956');
        }
        setUsersList(cleanUsers);
      } else {
        setUsersList(localUsers.filter(u => !isPermanentlyDeletedPhone(u.phone)));
      }

      if (transRes?.data && Array.isArray(transRes.data)) {
        const mergedTxs = [...transRes.data];
        for (const lt of localTxs) {
          if (!mergedTxs.some(mt => mt.id === lt.id)) {
            mergedTxs.push(lt);
          }
        }
        const cleanTxs = mergedTxs.filter(t => !isPermanentlyDeletedPhone(t.users?.phone));
        setTransactions(cleanTxs);
      } else {
        setTransactions(localTxs.filter(t => !isPermanentlyDeletedPhone(t.users?.phone)));
      }

      if (invRes?.data && Array.isArray(invRes.data)) {
        const mergedInvs = [...invRes.data];
        for (const li of localInvs) {
          if (!mergedInvs.some(mi => mi.id === li.id)) {
            mergedInvs.push(li);
          }
        }
        const cleanInvs = mergedInvs.filter(i => !isPermanentlyDeletedPhone(i.users?.phone));
        setInvestmentsList(cleanInvs);
      } else {
        setInvestmentsList(localInvs.filter(i => !isPermanentlyDeletedPhone(i.users?.phone)));
      }

      if (settingsRes?.data && Array.isArray(settingsRes.data)) {
        const pay = settingsRes.data.find(s => s.key === 'payment_link');
        const grp = settingsRes.data.find(s => s.key === 'group_link');
        const sup = settingsRes.data.find(s => s.key === 'support_link');
        const uc = settingsRes.data.find(s => s.key === 'ussd_ci');
        const wn = settingsRes.data.find(s => s.key === 'wave_number');
        const u_mtn_ci = settingsRes.data.find(s => s.key === 'ussd_mtn_ci');
        const logo = settingsRes.data.find(s => s.key === 'app_logo');

        if (pay) setPaymentLink(pay.value);
        if (grp) setGroupLink(grp.value);
        if (sup) setSupportLink(sup.value);
        if (uc) setUssdCI(uc.value);
        if (wn) setWaveNumber(wn.value);
        if (u_mtn_ci) setUssdMtnCI(u_mtn_ci.value);
        if (logo) setAppLogo(logo.value);

        const extraKeys = [
          'bj_moov_number', 'bj_moov_syntax', 'bj_mtn_number', 'bj_mtn_syntax', 
          'bf_moov_number', 'bf_moov_syntax', 'bf_wave_number', 
          'tg_moov_number', 'tg_moov_syntax', 
          'sn_wave_number', 'ne_wave_number', 
          'ml_moov_number', 'ml_moov_syntax', 'ml_wave_number'
        ];
        const extraObj: Record<string, string> = {};
        extraKeys.forEach(k => {
          const f = settingsRes.data.find(s => s.key === k);
          extraObj[k] = f ? f.value : (localSets[k] || '');
        });
        setExtraSettings(extraObj);
        
        const dbPlansStr = settingsRes.data.find(s => s.key === 'investment_plans');
        if (dbPlansStr && dbPlansStr.value) {
          try {
            const parsed = JSON.parse(dbPlansStr.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPlans(parsed.map((p: any, idx: number) => ({
                ...p,
                id: p.id || `crop_${p.amount || idx}_${idx}`
              })));
            } else {
              setPlans(DEFAULT_CROP_PLANS);
            }
          } catch (e) {
            setPlans(DEFAULT_CROP_PLANS);
          }
        } else {
          setPlans(DEFAULT_CROP_PLANS);
        }
      } else if (showLoading) {
        setPlans(DEFAULT_CROP_PLANS);
      }
    } catch (e) {
      console.warn('fetchData warn:', e);
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
          const newBal = Number(editBalance);
          
          // 1. Mise à jour locale immédiate
          setUsersList(prev => prev.map(u => {
            if (u.id === id) {
              const updated = { ...u, balance: newBal };
              saveLocalUser(updated);
              if (user?.id === id) {
                useAuthStore.getState().updateBalance(newBal);
              }
              return updated;
            }
            return u;
          }));
          setEditingUserId(null);

          // 2. Synchronisation distante
          try {
            await supabase.from('users').update({ balance: newBal }).eq('id', id);
          } catch (e) {}

          setLoading(false);
          setMessage({ type: 'success', text: "Solde mis à jour avec succès !" });
        } catch(err: any) {
          setMessage({ type: 'error', text: "Erreur: " + err.message });
          setLoading(false);
        }
      }
    });
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, role: newRole };
        saveLocalUser(updated);
        return updated;
      }
      return u;
    }));
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', id);
    } catch (e) {}
    setMessage({ type: 'success', text: `Rôle mis à jour (${newRole})` });
  };

  const handleDeleteUser = async (id: string, userPhone?: string, referralCode?: string) => {
    setConfirmModal({
      isOpen: true,
      message: `Voulez-vous vraiment supprimer définitivement cet utilisateur (${userPhone || id}) ? Toutes ses transactions et investissements associés seront également supprimés.`,
      onConfirm: async () => {
        try {
          setLoading(true);

          // 1. Suppression locale immédiate
          deleteLocalUser(id);
          deleteStoredLocalUser(id);
          setUsersList(prev => prev.filter(u => u.id !== id));
          setTransactions(prev => prev.filter(t => t.user_id !== id));
          setInvestmentsList(prev => prev.filter(i => i.user_id !== id));

          // 2. Suppression sur Supabase
          try {
            await supabase.from('transactions').delete().eq('user_id', id);
            await supabase.from('investments').delete().eq('user_id', id);
            await supabase.from('deposit_verifications').delete().eq('user_id', id);
            if (referralCode) {
              await supabase.from('users').update({ referred_by: null }).eq('referred_by', referralCode);
            }
            await supabase.from('users').delete().eq('id', id);
          } catch (e) {}

          setMessage({ type: 'success', text: "Utilisateur et données associées supprimés avec succès." });
        } catch(err: any) {
          console.error('[DeleteUser Error]', err);
          setMessage({ type: 'error', text: "Erreur suppression: " + (err.message || 'Impossible de supprimer cet utilisateur.') });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handlePurgeAllDataExceptAdmin = () => {
    setConfirmModal({
      isOpen: true,
      message: "⚠️ ACTION CRITIQUE : Voulez-vous vraiment supprimer définitivement TOUS les comptes utilisateurs, TOUTES les transactions, et TOUS les investissements de la plateforme ? SEUL le compte Administrateur (+2250704752133) sera conservé. Cette action est irréversible.",
      onConfirm: async () => {
        try {
          setLoading(true);
          const result = await purgePlatformDataExceptAdmin();
          setUsersList([SEED_ADMIN]);
          setTransactions([]);
          setInvestmentsList([]);
          setMessage({
            type: 'success',
            text: `Plateforme nettoyée ! Comptes supprimés : ${result.usersDeleted}, transactions supprimées : ${result.transactionsDeleted}, investissements supprimés : ${result.investmentsDeleted}. Seul l'administrateur reste actif.`
          });
        } catch (err: any) {
          console.error('[Purge Error]', err);
          setMessage({
            type: 'error',
            text: "Erreur lors de la suppression : " + (err.message || 'Échec de la purge.')
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // --- Transactions Handlers ---
  const handleTransaction = async (id: string, newStatus: string, type: string, amount: number, userId: string) => {
    // 1. Verrou immédiat anti-double clic / re-entrance
    if (processingTxRef.current.has(id)) {
      console.warn(`[Admin] Transaction ${id} est déjà en cours de traitement.`);
      return;
    }
    processingTxRef.current.add(id);
    setProcessingTxIds(prev => ({ ...prev, [id]: true }));
    setLoading(true);

    try {
      // 2. Mise à jour locale immédiate de la transaction
      updateLocalTransactionStatus(id, newStatus);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

      // 3. Gestion de l'impact sur le solde
      if (newStatus === 'approved') {
        if (type === 'deposit') {
          setUsersList(prev => prev.map(u => {
            if (u.id === userId) {
              const newBal = Number(u.balance || 0) + Number(amount);
              const updatedUser = { ...u, balance: newBal };
              saveLocalUser(updatedUser);
              if (user?.id === userId) {
                useAuthStore.getState().updateBalance(newBal);
              }
              return updatedUser;
            }
            return u;
          }));
        }
      } else if (newStatus === 'rejected') {
        if (type === 'withdrawal') {
          // Rembourser le solde déduit lors de la demande de retrait
          setUsersList(prev => prev.map(u => {
            if (u.id === userId) {
              const newBal = Number(u.balance || 0) + Number(amount);
              const updatedUser = { ...u, balance: newBal };
              saveLocalUser(updatedUser);
              if (user?.id === userId) {
                useAuthStore.getState().updateBalance(newBal);
              }
              return updatedUser;
            }
            return u;
          }));
        }
      }

      // 4. Synchronisation Supabase en tâche de fond sécurisée
      try {
        await supabase
          .from('transactions')
          .update({ status: newStatus })
          .eq('id', id);

        if (newStatus === 'approved' && type === 'deposit') {
          const { data: dbU } = await supabase.from('users').select('balance, referred_by').eq('id', userId).maybeSingle();
          if (dbU) {
            const newBal = Number(dbU.balance || 0) + Number(amount);
            await supabase.from('users').update({ balance: newBal }).eq('id', userId);

            // Bonus de parrainage sur premier dépôt si éligible
            if (dbU.referred_by) {
              const { data: refUser } = await supabase
                .from('users')
                .select('id, balance')
                .eq('referral_code', dbU.referred_by)
                .maybeSingle();
              if (refUser) {
                const bonus = Math.round(Number(amount) * 0.20);
                await supabase.from('users').update({ balance: Number(refUser.balance || 0) + bonus }).eq('id', refUser.id);
                await supabase.from('transactions').insert([{
                  user_id: refUser.id,
                  type: 'bonus',
                  amount: bonus,
                  status: 'completed',
                  reference: `Bonus Parrainage 20%`
                }]);
              }
            }
          }
        } else if (newStatus === 'rejected' && type === 'withdrawal') {
          const { data: dbU } = await supabase.from('users').select('balance').eq('id', userId).maybeSingle();
          if (dbU) {
            await supabase.from('users').update({ balance: Number(dbU.balance || 0) + Number(amount) }).eq('id', userId);
          }
        }
      } catch (remoteErr) {
        console.warn('Mise à jour Supabase différée:', remoteErr);
      }

      setMessage({ type: 'success', text: `Transaction mise à jour : ${newStatus === 'approved' ? 'Approuvée avec succès' : 'Rejetée'}` });
    } catch(err: any) {
      setMessage({ type: 'error', text: "Erreur: " + err.message });
    } finally {
      processingTxRef.current.delete(id);
      setProcessingTxIds(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setLoading(false);
    }
  };

  const handleRemoveInvestment = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous vraiment supprimer cet investissement ?",
      onConfirm: async () => {
        setLoading(true);
        try {
          deleteLocalInvestment(id);
          setInvestmentsList(prev => prev.filter(i => i.id !== id));
          try {
            await supabase.from('investments').delete().eq('id', id);
          } catch (e) {}
          setMessage({ type: 'success', text: "Investissement supprimé." });
        } catch(err: any) {
          setMessage({ type: 'error', text: "Erreur: " + err.message });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous vraiment supprimer cette transaction de l'historique ?",
      onConfirm: async () => {
        setLoading(true);
        try {
          deleteLocalTransaction(id);
          setTransactions(prev => prev.filter(t => t.id !== id));
          try {
            await supabase.from('transactions').delete().eq('id', id);
          } catch (e) {}
          setMessage({ type: 'success', text: "Transaction supprimée avec succès." });
        } catch(err: any) {
          setMessage({ type: 'error', text: "Erreur: " + err.message });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // --- Plans Handlers ---
  const handleSavePlans = async (updatedPlans: CropPlan[]) => {
    setLoading(true);
    try {
      setPlans(updatedPlans);
      safeStorage.setItem('agritrans_investment_plans', JSON.stringify(updatedPlans));
      safeStorage.setItem('translogis_investment_plans', JSON.stringify(updatedPlans));
      window.dispatchEvent(new Event('agritrans_plans_updated'));
      window.dispatchEvent(new Event('translogis_plans_updated'));

      try {
        await supabase
          .from('settings')
          .upsert({ key: 'investment_plans', value: JSON.stringify(updatedPlans) }, { onConflict: 'key' });
      } catch (remoteErr) {}

      setMessage({ type: 'success', text: "Plans de transport et flotte enregistrés et synchronisés avec l'application !" });
    } catch(err: any) {
      setMessage({ type: 'error', text: "Erreur d'enregistrement : " + err.message });
    } finally {
      setLoading(false);
    }
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setNewPlanImage(compressedBase64);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPlan = () => {
    if (!newPlanAmount || !newPlanDaily || !newPlanTotal) return;
    const planObj: CropPlan = {
      id: editingPlanIndex !== null && plans[editingPlanIndex]?.id ? plans[editingPlanIndex].id : 'crop_' + Date.now(),
      name: newPlanName.trim() || `Culture ${formatCurrency(Number(newPlanAmount))}`,
      amount: Number(newPlanAmount),
      daily: Number(newPlanDaily),
      total: Number(newPlanTotal),
      duration: Number(newPlanDuration) || 60,
      image: newPlanImage || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
      locked: newPlanLocked
    };
    
    let updatedPlans: CropPlan[];
    if (editingPlanIndex !== null) {
      updatedPlans = [...plans];
      updatedPlans[editingPlanIndex] = planObj;
    } else {
      updatedPlans = [...plans, planObj];
    }
    
    updatedPlans.sort((a, b) => a.amount - b.amount);
    handleSavePlans(updatedPlans);
    handleCancelEditPlan();
  };

  const handleEditPlan = (index: number) => {
    const plan = plans[index];
    setEditingPlanIndex(index);
    setNewPlanName(plan.name || '');
    setNewPlanAmount(plan.amount.toString());
    const pct = plan.daily && plan.amount ? Math.round((plan.daily / plan.amount) * 100) : 7;
    setNewPlanPercent(pct.toString());
    setNewPlanDuration((plan.duration || 60).toString());
    setNewPlanDaily(plan.daily.toString());
    setNewPlanTotal(plan.total.toString());
    setNewPlanImage(plan.image || '');
    setNewPlanLocked(!!plan.locked);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLock = (index: number) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], locked: !updated[index].locked };
    handleSavePlans(updated);
  };

  const handleCancelEditPlan = () => {
    setNewPlanName('');
    setNewPlanAmount('');
    setNewPlanDaily('');
    setNewPlanTotal('');
    setNewPlanImage('');
    setNewPlanPercent('7');
    setNewPlanDuration('60');
    setNewPlanLocked(false);
    setEditingPlanIndex(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePlan = (index: number) => {
    setConfirmModal({
      isOpen: true,
      message: `Voulez-vous vraiment supprimer le plan "${plans[index].name}" ?`,
      onConfirm: async () => {
        const updatedPlans = plans.filter((_, i) => i !== index);
        handleSavePlans(updatedPlans);
      }
    });
  };

  const handleResetDefaultPlans = () => {
    setConfirmModal({
      isOpen: true,
      message: "Voulez-vous réinitialiser aux véhicules et plans de transport officiels de AgriTrans CI ?",
      onConfirm: async () => {
        await handleSavePlans(DEFAULT_CROP_PLANS);
      }
    });
  };

  // --- Settings Handlers ---
  const handleUpdateSettings = async () => {
    setLoading(true);
    const settingsMap: Record<string, string> = {
      payment_link: paymentLink,
      app_logo: appLogo,
      group_link: groupLink,
      support_link: supportLink,
      ussd_ci: ussdCI,
      ussd_mtn_ci: ussdMtnCI,
      wave_number: waveNumber,
      ...extraSettings
    };

    // 1. Sauvegarde locale immédiate
    saveLocalSettings(settingsMap);
    useAppStore.getState().setSettingsCache(null as any);

    // 2. Synchronisation Supabase
    try {
      const toUpsert = Object.entries(settingsMap).map(([key, value]) => ({ key, value }));
      await supabase.from('settings').upsert(toUpsert, { onConflict: 'key' });
    } catch (e) {
      console.warn('Erreur synchronisation Supabase settings:', e);
    }
    
    setLoading(false);
    setMessage({ type: 'success', text: 'Paramètres et Logo enregistrés avec succès !' });
  };

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'investments', label: 'Investissements Flotte', icon: Activity },
    { id: 'deposits', label: 'Dépôts', icon: ArrowDownRight },
    { id: 'withdrawals', label: 'Retraits', icon: ArrowUpRight },
    { id: 'plans', label: 'Formules de Transport', icon: LayoutList },
    { id: 'settings', label: 'Paramètres', icon: LayoutList },
  ];

  // Calculated overview stats
  const totalBalances = usersList.reduce((acc, u) => acc + Number(u.balance || 0), 0);
  const totalDepositsApproved = transactions
    .filter(t => t.type === 'deposit' && t.status === 'approved')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalWithdrawalsApproved = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'approved')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  return (
    <div className="p-6 space-y-6 pb-24 pt-20 max-w-2xl mx-auto font-sans">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/profile')} title="Retour à l'application" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-colors shrink-0 cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Administration</h1>
          <p className="text-xs text-blue-600 font-bold">AgriTrans CI • Gestion de la flotte & des utilisateurs</p>
        </div>
      </header>

      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmation</h3>
            <p className="text-gray-600 mb-6 text-sm">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-colors cursor-pointer"
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  setConfirmModal({...confirmModal, isOpen: false});
                  confirmModal.onConfirm();
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 cursor-pointer"
                disabled={loading}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" /> : <XCircle className="w-5 h-5 shrink-0 text-red-500" />}
          <p>{message.text}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-2 scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSearchTerm(''); }}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === t.id 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {['users', 'deposits', 'withdrawals'].includes(activeTab) && (
        <div className="bg-white px-4 py-3 border border-gray-200 rounded-xl shadow-sm mb-4">
          <input
            type="text"
            placeholder="Rechercher par nom ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
      )}

      {/* CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 mb-2">Vue d'ensemble</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total des soldes</p>
               <p className="text-xl font-black text-emerald-700">{formatCurrency(totalBalances)}</p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Retraits validés</p>
               <p className="text-xl font-black text-emerald-700">{formatCurrency(totalWithdrawalsApproved)}</p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Dépôts validés</p>
               <p className="text-xl font-black text-emerald-600">{formatCurrency(totalDepositsApproved)}</p>
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Utilisateurs</p>
               <p className="text-xl font-black text-emerald-600">{usersList.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: INVESTMENTS */}
      {activeTab === 'investments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 mb-2">Tous les Investissements ({investmentsList.length})</h2>
          <div className="space-y-3">
            {investmentsList.length === 0 ? (
              <p className="text-center text-gray-500 py-8 bg-white rounded-2xl border border-gray-100">Aucun investissement actif</p>
            ) : (
              investmentsList.map(inv => (
                <div key={inv.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                      <p className="font-black text-gray-900 text-sm">
                        Culture de {getCropInfo(inv.plan_amount, inv.daily_yield).name} ({formatCurrency(inv.plan_amount || 0)})
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inv.users?.first_name} {inv.users?.last_name} ({inv.users?.phone})
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        inv.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {inv.status}
                      </span>
                      <button onClick={() => handleRemoveInvestment(inv.id)} disabled={loading} className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 pl-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Montant</p>
                      <p className="font-bold text-gray-900">{formatCurrency(inv.plan_amount || 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gain Journalier</p>
                      <p className="font-bold text-emerald-700">{formatCurrency(inv.daily_yield)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Lancé le : {inv.start_date ? format(new Date(inv.start_date), 'dd MMM yyyy HH:mm', { locale: fr }) : 'Inconnue'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTENT: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 mb-2">Gestion des Utilisateurs ({usersList.length})</h2>
          <div className="space-y-3">
            {usersList.filter(u => searchTerm ? `${u.first_name} ${u.last_name} ${u.phone}`.toLowerCase().includes(searchTerm.toLowerCase()) : true).map(u => (
              <div key={u.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      {u.first_name} {u.last_name}
                      {u.role && u.role.startsWith('vip') && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">{u.role}</span>}
                      {u.role === 'admin' && <ShieldAlert className="w-4 h-4 text-emerald-600" />}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{u.phone} • {u.country}</p>
                    <p className="text-[11px] text-gray-500 mt-1"><span className="font-semibold">MDP:</span> <span className="font-mono text-gray-900 bg-gray-100 px-1 py-0.5 rounded">{u.password_hash}</span></p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{u.id}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg text-sm">{formatCurrency(u.balance)}</p>
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
                    <input type="number" className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-medium" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} />
                    <button onClick={() => handleUpdateBalance(u.id)} disabled={loading} className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer">Sauver</button>
                    <button onClick={() => setEditingUserId(null)} className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg text-sm transition-colors cursor-pointer">X</button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => {setEditingUserId(u.id); setEditBalance(String(u.balance));}} className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-xl flex items-center justify-center text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Modifier Solde
                    </button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u.id, u.phone, u.referral_code)} className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-colors cursor-pointer" title="Supprimer cet utilisateur">
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
          <h2 className="text-lg font-black text-gray-900 mb-2">Demandes de Dépôts</h2>
          <div className="space-y-3">
            {transactions.filter(t => t.type === 'deposit' && (searchTerm ? `${t.users?.first_name} ${t.users?.last_name} ${t.users?.phone} ${t.reference}`.toLowerCase().includes(searchTerm.toLowerCase()) : true)).length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucun dépôt en attente.</p>}
            {transactions.filter(t => t.type === 'deposit' && (searchTerm ? `${t.users?.first_name} ${t.users?.last_name} ${t.users?.phone} ${t.reference}`.toLowerCase().includes(searchTerm.toLowerCase()) : true)).map(tx => (
              <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-black text-gray-900 text-base">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">{tx.users?.first_name} {tx.users?.last_name} ({tx.users?.phone})</p>
                    <p className="text-xs text-gray-600 mt-1 font-mono">Ref: {tx.reference}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                      tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      tx.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {tx.status === 'pending' ? 'En attente' : tx.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(tx.id)}
                      title="Supprimer la transaction"
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {tx.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      disabled={Boolean(processingTxIds[tx.id]) || loading}
                      onClick={() => handleTransaction(tx.id, 'approved', tx.type, tx.amount, tx.user_id)} 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      {processingTxIds[tx.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Confirmation...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" /> Approuver
                        </>
                      )}
                    </button>
                    <button 
                      disabled={Boolean(processingTxIds[tx.id]) || loading}
                      onClick={() => handleTransaction(tx.id, 'rejected', tx.type, tx.amount, tx.user_id)} 
                      className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors cursor-pointer border border-red-200"
                    >
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
          <h2 className="text-lg font-black text-gray-900 mb-2">Demandes de Retraits</h2>
          <div className="space-y-3">
            {transactions.filter(t => t.type === 'withdrawal' && (searchTerm ? `${t.users?.first_name} ${t.users?.last_name} ${t.users?.phone} ${t.reference}`.toLowerCase().includes(searchTerm.toLowerCase()) : true)).length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucun retrait en attente.</p>}
            {transactions.filter(t => t.type === 'withdrawal' && (searchTerm ? `${t.users?.first_name} ${t.users?.last_name} ${t.users?.phone} ${t.reference}`.toLowerCase().includes(searchTerm.toLowerCase()) : true)).map(tx => (
              <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-black text-gray-900 text-base">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">{tx.users?.first_name} {tx.users?.last_name} ({tx.users?.phone})</p>
                    <p className="text-xs text-gray-600 mt-1 font-mono">Ref/Numéro: {tx.reference}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                      tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      tx.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {tx.status === 'pending' ? 'En attente' : tx.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(tx.id)}
                      title="Supprimer la transaction"
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {tx.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      disabled={Boolean(processingTxIds[tx.id]) || loading}
                      onClick={() => handleTransaction(tx.id, 'approved', tx.type, tx.amount, tx.user_id)} 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      {processingTxIds[tx.id] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Traitement...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" /> Approuver
                        </>
                      )}
                    </button>
                    <button 
                      disabled={Boolean(processingTxIds[tx.id]) || loading}
                      onClick={() => handleTransaction(tx.id, 'rejected', tx.type, tx.amount, tx.user_id)} 
                      className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors cursor-pointer border border-red-200"
                    >
                      <XCircle className="w-4 h-4" /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: PLANS (PLANS DE CULTURE AGRICOLE) */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {editingPlanIndex !== null ? 'Modifier la Culture' : 'Ajouter un Plan de Culture'}
                </h2>
                <p className="text-xs text-gray-500">Ces plans sont synchronisés en direct avec la page de culture des utilisateurs.</p>
              </div>
              <button 
                onClick={handleResetDefaultPlans}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Rétablir les 9 cultures officielles"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser 9 cultures
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Nom de la Culture (ex: Coton, Manioc...)</label>
                  <input 
                    type="text" 
                    placeholder="Nom de la culture" 
                    value={newPlanName} 
                    onChange={e => setNewPlanName(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Montant Investissement (FCFA)</label>
                  <input 
                    type="number" 
                    placeholder="ex: 5000" 
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
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Gain % Journalier</label>
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
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Durée (jours)</label>
                  <input 
                    type="number" 
                    placeholder="60" 
                    value={newPlanDuration} 
                    onChange={e => {
                      const dur = Number(e.target.value);
                      setNewPlanDuration(e.target.value);
                      if (Number(newPlanAmount) > 0) {
                        const total = Number(newPlanDaily) * dur;
                        setNewPlanTotal(total.toString());
                      }
                    }} 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Statut</label>
                  <button
                    type="button"
                    onClick={() => setNewPlanLocked(!newPlanLocked)}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-colors cursor-pointer ${
                      newPlanLocked 
                        ? 'bg-gray-100 border-gray-300 text-gray-700' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {newPlanLocked ? <><Lock className="w-4 h-4" /> Verrouillé</> : <><Unlock className="w-4 h-4" /> Disponible</>}
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Gain/Jour (FCFA)</label>
                  <input 
                    type="number" 
                    placeholder="Gain journalier" 
                    value={newPlanDaily} 
                    onChange={e => {
                      setNewPlanDaily(e.target.value);
                      if (Number(e.target.value) > 0) {
                        setNewPlanTotal((Number(e.target.value) * Number(newPlanDuration)).toString());
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Revenu Total (FCFA)</label>
                  <input 
                    type="number" 
                    placeholder="Revenu Total" 
                    value={newPlanTotal} 
                    onChange={e => setNewPlanTotal(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 focus:border-emerald-500 outline-none" 
                  />
                </div>
              </div>

              {/* URL IMAGE OU UPLOAD */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Image du véhicule / service</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL de l'image (https://...)"
                    value={newPlanImage}
                    onChange={e => setNewPlanImage(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl px-4 py-2.5 focus:border-emerald-500 outline-none"
                  />
                  <label htmlFor="plan-image-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0">
                    <Upload className="w-4 h-4" /> Uploader
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    ref={fileInputRef}
                    className="hidden" 
                    id="plan-image-upload"
                  />
                </div>

                {newPlanImage && (
                  <div className="w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={newPlanImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {editingPlanIndex !== null ? (
                <div className="flex gap-2 pt-2">
                  <button onClick={handleAddPlan} disabled={loading || !newPlanAmount || !newPlanDaily || !newPlanTotal} className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                    <Save className="w-4 h-4" /> Enregistrer la modification
                  </button>
                  <button onClick={handleCancelEditPlan} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    Annuler
                  </button>
                </div>
              ) : (
                <button onClick={handleAddPlan} disabled={loading || !newPlanAmount || !newPlanDaily || !newPlanTotal} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                  <Plus className="w-4 h-4" /> Ajouter ce plan de culture
                </button>
              )}
            </div>
          </div>

          {/* LISTE DES PLANS ACTUELS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-gray-900 font-black text-base">Plans Actuels ({plans.length})</h3>
              <p className="text-xs text-gray-500">Ordre par montant croissant</p>
            </div>

            {isInitializing ? (
              <div className="flex justify-center p-6">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : plans.map((p, idx) => (
              <div key={p.id || idx} className={`p-4 bg-white rounded-2xl border transition-all shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                p.locked ? 'border-gray-200 bg-gray-50/50' : 'border-emerald-100'
              }`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${p.locked ? 'bg-gray-400' : 'bg-emerald-500'}`}></div>
                
                <div className="flex items-center gap-3.5 pl-2">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-black/10 shrink-0 relative">
                    <img 
                      src={p.image || '/logo-icon.svg'} 
                      className={`w-full h-full object-cover ${p.locked ? 'grayscale' : ''}`} 
                      alt={p.name} 
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo-icon.svg'; }}
                    />
                    {p.locked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-gray-900 text-sm">{p.name || `Plan ${formatCurrency(p.amount)}`}</p>
                      {p.locked ? (
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-300 px-1.5 py-0.5 rounded">Verrouillé</span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">Actif</span>
                      )}
                    </div>
                    <p className="text-xs font-black text-emerald-700 mt-0.5">{formatCurrency(p.amount)}</p>
                    <div className="flex gap-3 text-[11px] text-gray-500 mt-0.5">
                      <span>Gain/j: <strong className="text-gray-800">{formatCurrency(p.daily)}</strong></span>
                      <span>Total: <strong className="text-gray-800">{formatCurrency(p.total)}</strong></span>
                      <span>({p.duration || 60}j)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2 sm:pl-0 shrink-0 self-end sm:self-center">
                  <button 
                    onClick={() => handleToggleLock(idx)} 
                    disabled={loading} 
                    title={p.locked ? "Déverrouiller" : "Verrouiller"}
                    className={`p-2 rounded-xl transition-colors cursor-pointer border text-xs font-bold flex items-center gap-1 ${
                      p.locked 
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {p.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>

                  <button 
                    onClick={() => handleEditPlan(idx)} 
                    disabled={loading} 
                    title="Modifier"
                    className="p-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleRemovePlan(idx)} 
                    disabled={loading} 
                    title="Supprimer"
                    className="p-2 text-red-500 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
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
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4">Configuration globale de la plateforme</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 ml-1 mb-1">Logo de la Plateforme (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={appLogo}
                    onChange={(e) => setAppLogo(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                    placeholder="https://... ou laisser vide pour le logo officiel"
                  />
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center p-1 shrink-0">
                    <img 
                      src={appLogo || '/logo.svg?v=agritrans'} 
                      alt="Logo" 
                      className="max-h-full max-w-full object-contain" 
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo.svg?v=agritrans'; }} 
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 ml-1">Laissez vide ou entrez l'URL directe d'une image de logo.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 ml-1 mb-1">Lien de Paiement</label>
                <input
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 ml-1 mb-1">Lien du Groupe (Telegram / WhatsApp)</label>
                <input
                  type="url"
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  placeholder="https://t.me/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 ml-1 mb-1">Lien du Service Client</label>
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
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-colors shadow-sm cursor-pointer mt-4"
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
