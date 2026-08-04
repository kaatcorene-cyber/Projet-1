import { useEffect, useRef } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { BottomNav } from './BottomNav';
import { FloatingSupport } from './FloatingSupport';
import { LogOut, Settings, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePWAInstall } from '../hooks/usePWAInstall';

let isProcessingYields = false;

export function Layout() {
  const { isAuthenticated, user, logout, refreshUser } = useAuthStore();
  const { fetchConfig, setInvestmentsCache } = useAppStore();
  const navigate = useNavigate();
  const hasCheckedYields = useRef(false);
  const { isInstallable, installPWA } = usePWAInstall();

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (user?.id) {
      if (!hasCheckedYields.current) {
        hasCheckedYields.current = true;
        processDailyYields(user.id);
        preloadInvestments(user.id);
      }
      
      const interval = setInterval(() => {
        processDailyYields(user.id);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const preloadInvestments = async (userId: string) => {
    try {
      const { data } = await supabase.from('investments').select('*').eq('user_id', userId).eq('status', 'active');
      if (data) {
        setInvestmentsCache(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const processDailyYields = async (userId: string) => {
    if (isProcessingYields) return;
    isProcessingYields = true;
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
          refreshUser();
      }
      
      if (completedInvestments.length > 0) {
          for (const id of completedInvestments) {
              await supabase.from('investments').update({ status: 'completed' }).eq('id', id);
          }
      }
    } catch (e) {
      console.error("Failed to process yields", e);
    } finally {
      isProcessingYields = false;
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('telegramModalShown');
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen text-slate-900 pb-16 font-sans bg-transparent">
      <main className="max-w-md mx-auto min-h-screen relative overflow-x-hidden">
        {/* Top Mini Header for Admin */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              className="w-10 h-10 bg-white border-slate-200/80 shadow-slate-200/50 border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-100/80 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>

        <Outlet />
      </main>
      <FloatingSupport />
      <BottomNav />
    </div>
  );
}
