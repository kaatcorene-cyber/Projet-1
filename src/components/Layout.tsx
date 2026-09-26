import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BottomNav } from './BottomNav';
import { Settings } from 'lucide-react';

export function Layout() {
  const { isAuthenticated, user, refreshUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen text-slate-900 bg-slate-50 pb-20 font-sans selection:bg-red-600 selection:text-white">
      <main className="max-w-md mx-auto min-h-screen relative overflow-x-hidden bg-slate-50">
        {/* Top Mini Header for Admin */}
        {user?.role === 'admin' && (
          <div className="absolute top-3 right-4 flex items-center gap-2 z-50">
            <button 
              onClick={() => navigate('/admin')}
              className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm hover:text-red-600 hover:border-red-500 transition-colors cursor-pointer active:scale-95"
              title="Panneau d'administration"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}

        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
