import { useEffect, useRef } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BottomNav } from './BottomNav';
import { Settings, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { claimAllActiveYields } from '../lib/investments';

export function Layout() {
  const { isAuthenticated, user, logout, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const hasCheckedYields = useRef(false);
  const { isInstallable, installPWA } = usePWAInstall();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  useEffect(() => {
    if (user?.id && !hasCheckedYields.current) {
      hasCheckedYields.current = true;
      processDailyYields(user.id);
    }
  }, [user?.id]);

  const processDailyYields = async (userId: string) => {
    try {
      const { data: investments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (!investments || investments.length === 0) return;

      const result = await claimAllActiveYields(investments, userId);
      if (result.success && result.totalClaimed > 0) {
        await refreshUser();
      }
    } catch (e) {
      console.error("Failed to process yields", e);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen text-slate-900 bg-slate-50 pb-20 font-sans selection:bg-emerald-600 selection:text-white">
      <main className="max-w-md mx-auto min-h-screen relative overflow-x-hidden bg-slate-50">
        {/* Top Mini Header for Admin and PWA */}
        <div className="absolute top-3 right-4 flex items-center gap-2 z-50">
          {isInstallable && (
            <button 
              onClick={installPWA}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center gap-1.5 text-[11px] font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
              title="Installer l'application"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer PWA</span>
            </button>
          )}
          {user?.role === 'admin' && (
            <button 
              onClick={() => navigate('/admin')}
              className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm hover:text-emerald-600 hover:border-emerald-500 transition-colors cursor-pointer active:scale-95"
              title="Panneau d'administration"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
