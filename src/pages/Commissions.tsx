import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Gift, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Users 
} from 'lucide-react';
import { AppLogo } from '../components/AppLogo';

interface CommissionTier {
  id: number;
  target: number;
  reward: number;
  rewardLabel: string;
}

const COMMISSION_TIERS: CommissionTier[] = [
  { id: 1, target: 1, reward: 300, rewardLabel: '300 F' },
  { id: 2, target: 3, reward: 1000, rewardLabel: '1 000 F' },
  { id: 3, target: 7, reward: 3000, rewardLabel: '3 000 F' },
  { id: 4, target: 15, reward: 10000, rewardLabel: '10 000 F' },
  { id: 5, target: 30, reward: 25000, rewardLabel: '25 000 F' },
  { id: 6, target: 45, reward: 40000, rewardLabel: '40 000 F' },
  { id: 7, target: 70, reward: 70000, rewardLabel: '70 000 F' },
  { id: 8, target: 100, reward: 100000, rewardLabel: '100 000 F' },
  { id: 9, target: 150, reward: 160000, rewardLabel: '160 000 F' },
  { id: 10, target: 250, reward: 300000, rewardLabel: '300 000 F' },
];

export function Commissions() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const [qualifiedCount, setQualifiedCount] = useState<number>(0);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([]);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommissionData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const claimedSet = new Set<number>();
        try {
          const local = localStorage.getItem(`agritrans_claimed_commissions_${user.id}`);
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              parsed.forEach((id: number) => claimedSet.add(id));
            }
          }
        } catch (e) {
          console.warn('Erreur lecture localStorage:', e);
        }

        const { data: bonusTx } = await supabase
          .from('transactions')
          .select('reference')
          .eq('user_id', user.id)
          .in('type', ['referral_bonus', 'commission', 'bonus']);

        bonusTx?.forEach(tx => {
          COMMISSION_TIERS.forEach(t => {
            if (tx.reference && tx.reference.includes(`Palier ${t.id}`)) {
              claimedSet.add(t.id);
            }
          });
        });

        setClaimedTiers(Array.from(claimedSet));

        if (user.referral_code) {
          const { data: referredUsers } = await supabase
            .from('users')
            .select('id, balance')
            .eq('referred_by', user.referral_code);

          if (referredUsers && referredUsers.length > 0) {
            const userIds = referredUsers.map(u => u.id);

            const { data: deposits } = await supabase
              .from('transactions')
              .select('user_id, amount')
              .in('user_id', userIds)
              .eq('type', 'deposit')
              .gte('amount', 3000)
              .neq('status', 'rejected');

            const qualifiedUserIds = new Set<string>();
            deposits?.forEach(d => {
              if (d.user_id) qualifiedUserIds.add(d.user_id);
            });

            setQualifiedCount(qualifiedUserIds.size);
          } else {
            setQualifiedCount(0);
          }
        }
      } catch (err) {
        console.error('Erreur chargement commissions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCommissionData();
  }, [user]);

  const handleClaim = async (tier: CommissionTier) => {
    if (!user) return;
    if (qualifiedCount < tier.target) return;
    if (claimedTiers.includes(tier.id)) return;

    setClaimingId(tier.id);

    try {
      const newBalance = (Number(user.balance) || 0) + tier.reward;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'referral_bonus',
        amount: tier.reward,
        status: 'completed',
        reference: `Prime Palier ${tier.id} - ${tier.target} membres qualifiés`
      }]);

      const updatedClaimed = [...claimedTiers, tier.id];
      setClaimedTiers(updatedClaimed);
      localStorage.setItem(`agritrans_claimed_commissions_${user.id}`, JSON.stringify(updatedClaimed));

      await refreshUser();

      setSuccessMessage(`Félicitations ! Votre prime de ${tier.rewardLabel} a été créditée avec succès.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Erreur réclamation prime:', err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-28 font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Paliers & Primes</h1>
            <p className="text-emerald-700 text-[10px] uppercase font-black tracking-wider">Bonus Partenaires Niveau 1</p>
          </div>
        </div>
        <AppLogo imgClassName="h-8 w-auto object-contain max-h-9" />
      </header>

      <div className="pt-3 max-w-xl mx-auto space-y-4 px-3 sm:px-0">
        
        {/* Message de succès */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Bannière explicative : Niveau 1 uniquement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900">Partenaires Niveau 1 Qualifiés</p>
              <p className="text-xs text-slate-500 font-medium">Recharge minimum de 3 000 FCFA</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">{qualifiedCount}</span>
            <span className="text-[10px] text-slate-500 block font-bold uppercase">actif{qualifiedCount > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Liste des Paliers */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Paliers de progression
            </h2>
            <span className="text-xs font-black text-emerald-700">10 Paliers • Niveau 1</span>
          </div>

          <div className="space-y-3">
            {COMMISSION_TIERS.map((tier) => {
              const isFilled = qualifiedCount >= tier.target;
              const isClaimed = claimedTiers.includes(tier.id);
              const progressPct = Math.min(100, Math.round((qualifiedCount / tier.target) * 100));
              const isClaimingThis = claimingId === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 bg-white shadow-sm ${
                    isClaimed
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : isFilled
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isClaimed
                          ? 'bg-emerald-600 text-white'
                          : isFilled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {isClaimed ? <CheckCircle2 className="w-5 h-5" /> : `N°${tier.id}`}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">
                            {tier.target} {tier.target === 1 ? 'partenaire direct (Niveau 1)' : 'partenaires directs (Niveau 1)'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Recharge min. 3 000 F / membre N1
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200">
                        <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{tier.rewardLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Progression : {Math.min(qualifiedCount, tier.target)} / {tier.target}
                      </span>
                      <span className="font-black text-emerald-700">{progressPct}%</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFilled ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Zone d'action : Bouton Réclamer si la barre est remplie */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    {isClaimed ? (
                      <div className="flex items-center justify-between text-xs py-1 text-emerald-800 font-black bg-emerald-50 px-3 rounded-xl border border-emerald-200">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Prime créditée sur votre solde
                        </span>
                        <span className="font-black text-emerald-800">+{tier.rewardLabel}</span>
                      </div>
                    ) : isFilled ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(tier)}
                        disabled={isClaimingThis}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-75"
                      >
                        {isClaimingThis ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Crédit en cours...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Réclamer {tier.rewardLabel}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 py-1 font-medium">
                        <span>Encore {tier.target - qualifiedCount} partenaire{tier.target - qualifiedCount > 1 ? 's' : ''} N1 (recharge ≥ 3 000 F)</span>
                        <span className="text-slate-600 font-bold">À débloquer</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
