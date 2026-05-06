import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Network, Clock, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Accueil', path: '/dashboard' },
    { icon: TrendingUp, label: 'Générateurs', path: '/invest' },
    { icon: Network, label: 'Équipe', path: '/team' },
    { icon: Clock, label: 'Activité', path: '/history' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
      <div className="flex justify-around items-center h-[72px] max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all duration-300 relative",
                isActive ? "text-amber-500 scale-105" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]")} />
              <span className={cn("text-[9px] font-bold tracking-wider", isActive ? "opacity-100" : "opacity-70")}>{item.label}</span>
              {isActive && (
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-b from-amber-500 to-amber-500/0 rounded-b-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
