import { useEffect, useRef } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BottomNav } from './BottomNav';
import { LogOut, Settings, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { parseSafeDate } from '../lib/utils';
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
      if (result.success && result.totalAmount > 0) {
        await refreshUser();
      }
    } catch (e) {
      console.error("Failed to process yields", e);
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
    <div className="min-h-screen text-slate-900 pb-16 font-sans">
      <main className="max-w-md mx-auto min-h-screen relative overflow-x-hidden">
        {/* Top Mini Header for Admin and Logout */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
          {isInstallable && (
            <button 
              onClick={installPWA}
              className="w-10 h-10 bg-emerald-600 border border-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-emerald-700 transition-colors animate-pulse"
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
        </div>

        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
