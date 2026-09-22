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
      }, 60000 * 5); // every 5 minutes instead of 5 seconds
      
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

      const completedInvestments: string[] = [];
      for (const inv of investments) {
          if (inv.end_date) {
            const endTimestamp = new Date(inv.end_date).getTime();
            if (Date.now() >= endTimestamp) {
              completedInvestments.push(inv.id);
            }
          }
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
    <div className="min-h-screen text-white pb-20 font-sans bg-[#03296c]">
      <main className="max-w-md mx-auto min-h-screen relative overflow-x-hidden pb-8">
        {/* Top Mini Header for Admin */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              className="w-10 h-10 bg-white/80 backdrop-blur-md border-brand-500/50 shadow-brand-500/20 border rounded-full flex items-center justify-center text-brand-400 shadow-sm hover:bg-slate-700 transition-colors"
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
