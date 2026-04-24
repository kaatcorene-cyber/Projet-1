import { useEffect, useRef } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BottomNav } from './BottomNav';
import { LogOut, Settings, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function Layout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const hasCheckedYields = useRef(false);
  const { isInstallable, installPWA } = usePWAInstall();

  useEffect(() => {
    if (user?.id && !hasCheckedYields.current) {
      hasCheckedYields.current = true;
      processDailyYields(user.id);
    }
  }, [user?.id]);

  const processDailyYields = async (userId: string) => {
    try {
      const { data: investments } = await supabase.from('investments').select('*').eq('user_id', userId).eq('status', 'active');
      if (!investments || investments.length === 0) return;

      // Optimize: Only fetch needed columns to reduce payload size drastically
      const { data: gains } = await supabase.from('transactions')
          .select('reference')
          .eq('user_id', userId)
          .eq('type', 'daily_gain');

      let totalToAdd = 0;
      const newTransactions: any[] = [];
      const completedInvestments: string[] = [];

      for (const inv of investments) {
          const startDate = new Date(inv.start_date || inv.created_at || Date.now()).getTime();
          let effectiveNow = Date.now();
          let isExpired = false;

          if (inv.end_date) {
            const endTimestamp = new Date(inv.end_date).getTime();
            if (Date.now() >= endTimestamp) {
              effectiveNow = endTimestamp;
              isExpired = true;
            }
          }

          const daysElapsed = Math.floor((effectiveNow - startDate) / (24 * 60 * 60 * 1000));
          const paidCount = gains?.filter(g => g.reference === inv.id).length || 0;
          const missedDays = daysElapsed - paidCount;

          if (missedDays > 0) {
              totalToAdd += (inv.daily_yield * missedDays);
              for (let i = 0; i < missedDays; i++) {
                  newTransactions.push({
                      user_id: userId,
                      type: 'daily_gain',
                      amount: inv.daily_yield,
                      status: 'completed',
                      reference: inv.id
                  });
              }
          }
          
          if (isExpired) {
             completedInvestments.push(inv.id);
          }
      }

      if (totalToAdd > 0 && newTransactions.length > 0) {
          await supabase.from('transactions').insert(newTransactions);
          
          const { data: userData } = await supabase.from('users').select('balance').eq('id', userId).single();
          if (userData) {
              await supabase.from('users').update({ balance: userData.balance + totalToAdd }).eq('id', userId);
          }
      }
      
      if (completedInvestments.length > 0) {
          for (const id of completedInvestments) {
              await supabase.from('investments').update({ status: 'completed' }).eq('id', id);
          }
      }
    } catch (e) {
      console.error("Failed to process yields", e);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-white pb-16 font-sans">
      <main className="max-w-md mx-auto min-h-screen relative overflow-x-hidden">
        {/* Top Mini Header for Admin and Logout */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
          {isInstallable && (
            <button 
              onClick={installPWA}
              className="w-10 h-10 bg-emerald-500 border border-emerald-400 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-emerald-600 transition-colors animate-pulse"
              title="Télécharger l'Application"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
