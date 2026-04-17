import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BottomNav } from './BottomNav';
import { LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Layout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      processDailyYields(user.id);
    }
  }, [user]);

  const processDailyYields = async (userId: string) => {
    try {
      const { data: investments } = await supabase.from('investments').eq('user_id', userId).eq('status', 'active');
      if (!investments || investments.length === 0) return;

      const { data: gains } = await supabase.from('transactions')
          .eq('user_id', userId)
          .eq('type', 'daily_gain');

      let totalToAdd = 0;
      const newTransactions: any[] = [];

      for (const inv of investments) {
          const createdAt = new Date(inv.created_at).getTime();
          const now = Date.now();
          const daysElapsed = Math.floor((now - createdAt) / (24 * 60 * 60 * 1000));

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
      }

      if (totalToAdd > 0 && newTransactions.length > 0) {
          await supabase.from('transactions').insert(newTransactions);
          
          const { data: userData } = await supabase.from('users').select('balance').eq('id', userId).single();
          if (userData) {
              await supabase.from('users').update({ balance: userData.balance + totalToAdd }).eq('id', userId);
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
