import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Users, LayoutList } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Briefcase, label: 'Investir', path: '/invest' },
    { icon: Users, label: 'Équipe', path: '/team' },
    { icon: LayoutList, label: 'Historique', path: '/history' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/40 backdrop-blur-3xl border-t border-white/10 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-emerald-400" : "text-white/50 hover:text-white/80"
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
