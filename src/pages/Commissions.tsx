import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Gift, 
  CheckCircle2, 
  Sparkles,
  Loader2
} from 'lucide-react';

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
  const { user } = useAuthStore();
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
        // 1. Charger les paliers déjà réclamés depuis localStorage et transactions
        const claimedSet = new Set<number>();
        try {
          const local = localStorage.getItem(`cargill_claimed_commissions_${user.id}`);
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              parsed.forEach((id: number) => claimedSet.add(id));
            }
          }
        } catch (e) {
          console.warn('Erreur lecture localStorage:', e);
        }

        // Vérifier également dans les transactions Supabase
        const { data: bonusTx } = await supabase
          .from('transactions')
          .select('reference')
          .eq('user_id', user.id)
          .eq('type', 'referral_bonus');

        bonusTx?.forEach(tx => {
          COMMISSION_TIERS.forEach(t => {
            if (tx.reference && tx.reference.includes(`Palier ${t.id}`)) {
              claimedSet.add(t.id);
            }
          });
        });

        setClaimedTiers(Array.from(claimedSet));

        // 2. Compter uniquement les membres invités ayant rechargé au minimum 3000 F
        if (user.referral_code) {
          const { data: referredUsers } = await supabase
            .from('users')
            .select('id, balance')
            .eq('referred_by', user.referral_code);

          if (referredUsers && referredUsers.length > 0) {
            const userIds = referredUsers.map(u => u.id);

            // Vérifier les dépôts d'au moins 3 000 F
            const { data: deposits } = await supabase
              .from('transactions')
              .select('user_id, amount')
              .in('user_id', userIds)
              .eq('type', 'deposit')
              .gte('amount', 3000)
              .neq('status', 'rejected');

            // Vérifier les investissements d'au moins 3 000 F
            const { data: investments } = await supabase
              .from('investments')
              .select('user_id, plan_amount')
              .in('user_id', userIds)
              .gte('plan_amount', 3000);

            const qualifiedUserIds = new Set<string>();

            deposits?.forEach(d => {
              if (Number(d.amount) >= 3000) {
                qualifiedUserIds.add(d.user_id);
              }
            });

            investments?.forEach(i => {
              if (Number(i.plan_amount) >= 3000) {
                qualifiedUserIds.add(i.user_id);
              }
            });

            referredUsers.forEach(u => {
              if ((u.balance || 0) >= 3000) {
                qualifiedUserIds.add(u.id);
              }
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
    if (!user || claimingId !== null || claimedTiers.includes(tier.id)) return;
    if (qualifiedCount < tier.target) return;

    setClaimingId(tier.id);
    try {
      const currentBalance = Number(user.balance || 0);
      const newBalance = currentBalance + tier.reward;

      // 1. Mettre à jour le solde dans Supabase
      const { error: updateErr } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateErr) {
        throw updateErr;
      }

      // 2. Enregistrer la transaction du bonus
      await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'referral_bonus',
        amount: tier.reward,
        status: 'completed',
        reference: `Bonus Commission Palier ${tier.id} - ${tier.target} membres`
      }]);

      // 3. Mettre à jour l'état local et localStorage
      const nextClaimed = [...claimedTiers, tier.id];
      setClaimedTiers(nextClaimed);
      try {
        localStorage.setItem(`cargill_claimed_commissions_${user.id}`, JSON.stringify(nextClaimed));
      } catch (e) {
        console.warn('Erreur écriture localStorage:', e);
      }

      // 4. Mettre à jour le store d'authentification pour répercuter immédiatement le solde
      useAuthStore.setState({
        user: {
          ...user,
          balance: newBalance,
        }
      });

      setSuccessMessage(`Félicitations ! Votre bonus de ${tier.rewardLabel} a été crédité sur votre solde principal.`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

    } catch (err: any) {
      console.error('Erreur réclamation bonus:', err);
      alert('Une erreur est survenue lors de la réclamation du bonus. Veuillez réessayer.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans text-gray-900 relative">
      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* Header épuré sans logo ni nom Cargill */}
      <div className="bg-white px-5 pt-8 pb-4 shadow-sm border-b border-black/5 sticky top-0 z-30 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 hover:bg-black/10 transition-colors border border-black/5 cursor-pointer active:scale-95"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-base font-black text-gray-900 tracking-tight">Commissions</h1>
          <p className="text-[11px] text-gray-500 font-semibold">Paliers de parrainage & récompenses</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 max-w-md mx-auto relative z-10">

        {/* Message de succès lors de la réclamation */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-500/30 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}


        {/* Liste des Paliers avec boutons Réclamer lorsque la barre est remplie */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider">
              Paliers de progression
            </h2>
            <span className="text-[11px] font-bold text-emerald-700">10 Paliers</span>
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
                  className={`p-4 rounded-2xl border transition-all duration-200 bg-white ${
                    isClaimed
                      ? 'border-emerald-500/20 bg-emerald-50/30'
                      : isFilled
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm'
                      : 'border-black/5 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isClaimed
                          ? 'bg-emerald-600 text-white'
                          : isFilled
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-500/30'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isClaimed ? <CheckCircle2 className="w-5 h-5" /> : `N°${tier.id}`}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">
                            {tier.target} {tier.target === 1 ? 'personne à inviter' : 'personnes à inviter'}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Recharge min. 3 000 F / membre
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300/60">
                        <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{tier.rewardLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 font-medium">
                        Progression : {Math.min(qualifiedCount, tier.target)} / {tier.target}
                      </span>
                      <span className="font-bold text-emerald-700">{progressPct}%</span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFilled ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Zone d'action : Bouton Réclamer si la barre est remplie */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100">
                    {isClaimed ? (
                      <div className="flex items-center justify-between text-xs py-1 text-emerald-800 font-bold bg-emerald-50 px-3 rounded-xl border border-emerald-500/20">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Bonus crédité sur votre solde
                        </span>
                        <span className="font-black text-emerald-700">+{tier.rewardLabel}</span>
                      </div>
                    ) : isFilled ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(tier)}
                        disabled={isClaimingThis}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-75"
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
                      <div className="flex items-center justify-between text-[11px] text-gray-400 py-1 font-medium">
                        <span>Encore {tier.target - qualifiedCount} personne{tier.target - qualifiedCount > 1 ? 's' : ''} (recharge ≥ 3 000 F)</span>
                        <span className="text-gray-400 font-bold">À débloquer</span>
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
