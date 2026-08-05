const fs = require('fs');

let content = fs.readFileSync('src/pages/Products.tsx', 'utf8');

const match = content.match(/const CountdownTimer: React\.FC<\{ inv: any \}> = \(\{ inv \}\) => \{[\s\S]*?\}\s*;\s*\n/);
if (match) {
  const replacement = `const CountdownTimer: React.FC<{ inv: any, onRefresh?: () => void }> = ({ inv, onRefresh }) => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number, percent: number} | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { user, refreshUser } = useAuthStore();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const lastPaidAt = new Date(inv.last_paid_at || inv.start_date || inv.created_at).getTime();
      const nextPay = lastPaidAt + (24 * 60 * 60 * 1000);
      
      const diff = nextPay - now;
      
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, percent: 100 });
        setCanClaim(true);
        return;
      }
      
      setCanClaim(false);
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const totalDuration = 24 * 60 * 60 * 1000;
      const elapsed = totalDuration - diff;
      let pct = (elapsed / totalDuration) * 100;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;

      setTimeLeft({ h: hours, m: minutes, s: seconds, percent: pct });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [inv]);

  const handleClaim = async () => {
    if (!user || isClaiming || !canClaim) return;
    setIsClaiming(true);
    
    try {
      // 1. Double check the DB to ensure last_paid_at hasn't changed
      const { data: currentInv, error: invError } = await supabase.from('investments').select('last_paid_at, status').eq('id', inv.id).single();
      
      if (invError || !currentInv || currentInv.status !== 'active') {
        toast.error("Contrat invalide ou expiré");
        return;
      }
      
      const now = new Date().getTime();
      const currentLastPaidAt = new Date(currentInv.last_paid_at || inv.start_date || inv.created_at).getTime();
      
      if (now - currentLastPaidAt < 24 * 60 * 60 * 1000) {
        toast.error("Pas encore disponible. Patientez.");
        if (onRefresh) onRefresh();
        return;
      }
      
      const claimAmount = Number(inv.daily_yield);
      
      // Update last_paid_at FIRST to prevent multiple claims
      const newPaidAt = new Date().toISOString();
      const { error: updateError } = await supabase.from('investments')
        .update({ last_paid_at: newPaidAt })
        .eq('id', inv.id)
        .eq('last_paid_at', currentInv.last_paid_at); // Optimistic lock
        
      if (updateError) throw updateError;
      
      // Insert transaction
      await supabase.from('transactions').insert([{
        user_id: user.id,
        type: 'daily_gain',
        amount: claimAmount,
        status: 'completed',
        reference: inv.id
      }]);
      
      // Update balance
      const { data: userData } = await supabase.from('users').select('balance').eq('id', user.id).single();
      if (userData) {
          await supabase.from('users').update({ balance: Number(userData.balance || 0) + claimAmount }).eq('id', user.id);
      }
      
      toast.success(\`+\${claimAmount} FCFA récoltés avec succès !\`);
      refreshUser();
      if (onRefresh) onRefresh();
    } catch (e) {
      toast.error("Erreur lors de la récolte");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!timeLeft) return null;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-5 relative overflow-hidden flex items-center gap-5">
      <div className={\`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none bg-orange-600/10\`}></div>
      
      <ContractVisual />
      
      <div className="flex-1 z-10">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
            Plan <span className="w-1 h-1 rounded-full bg-zinc-600"></span> {formatCurrency(inv.plan_amount || 0)}
          </p>
          <div className="flex gap-1.5 items-center bg-orange-600/10 px-2 py-1 rounded-lg border border-orange-600/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
            <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Actif</span>
          </div>
        </div>
        
        {canClaim ? (
          <button 
            onClick={handleClaim}
            disabled={isClaiming}
            className="mt-2 w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-orange-600/20 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isClaiming ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            ) : (
              <>
                <Coins className="w-5 h-5" />
                RÉCOLTER
              </>
            )}
          </button>
        ) : (
          <>
            <div className="font-mono text-3xl font-black text-slate-900 tracking-widest flex items-baseline" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <span>{String(timeLeft.h).padStart(2, '0')}</span>
              <span className="text-zinc-600 mx-1 mb-1">:</span>
              <span>{String(timeLeft.m).padStart(2, '0')}</span>
              <span className="text-zinc-600 mx-1 mb-1">:</span>
              <span className="text-orange-600">{String(timeLeft.s).padStart(2, '0')}</span>
            </div>
            
            <div className="mt-4 w-full bg-slate-100/80 rounded-full h-2 overflow-hidden border border-slate-200">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-linear bg-gradient-to-r from-orange-700 to-orange-600" 
                style={{ width: \`\${timeLeft.percent}%\` }}
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
`;

  content = content.replace(match[0], replacement);
  fs.writeFileSync('src/pages/Products.tsx', content, 'utf8');
  console.log("Replaced");
} else {
  console.log("No match found!");
}
