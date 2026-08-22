import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Users, History } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Store, label: 'Boutique', path: '/invest' },
    { icon: Users, label: 'Équipe', path: '/team' },
    { icon: History, label: 'Historique', path: '/history' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 pb-safe z-50">
      <div className="flex justify-around items-center h-[72px] max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                isActive ? "text-red-500 scale-110" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]")} />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
