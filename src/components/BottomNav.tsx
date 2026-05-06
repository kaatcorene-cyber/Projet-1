import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Network, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Accueil', path: '/dashboard' },
    { icon: TrendingUp, label: 'Investir', path: '/invest' },
    { icon: Network, label: 'Équipe', path: '/team' },
    { icon: Clock, label: 'Historique', path: '/history' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-red-400" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
