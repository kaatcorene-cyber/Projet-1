import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BottomNav } from './BottomNav';
import { LogOut, Settings } from 'lucide-react';

export function Layout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16 font-sans">
      <main className="max-w-md mx-auto min-h-screen bg-gray-50 relative shadow-2xl">
        {/* Top Mini Header for Admin and Logout */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
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
