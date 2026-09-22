import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BottomNav } from './BottomNav';
import { Settings, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function Layout() {
  const { isAuthenticated, user, logout, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const { isInstallable, installPWA } = usePWAInstall();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

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
