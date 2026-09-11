import { Link, useLocation } from 'react-router-dom';
import { Home, Sprout, Users2, History as HistoryIcon, UserCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Sprout, label: 'Culture', path: '/invest' },
    { icon: Users2, label: 'Équipe', path: '/team' },
    { icon: HistoryIcon, label: 'Histoire', path: '/history' },
    { icon: UserCircle2, label: 'Compte', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/5 pb-safe z-50 shadow-lg">
      <div className="flex justify-around items-center h-[70px] max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative",
                isActive ? "text-emerald-600 scale-105" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
              <span className={cn("text-[10px] font-bold tracking-wider capitalize", isActive ? "text-emerald-600 opacity-100" : "opacity-70")}>{item.label}</span>
              {isActive && (
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-b from-emerald-500 to-emerald-500/0 rounded-b-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
