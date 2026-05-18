import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gem, Network, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Accueil', path: '/dashboard' },
    { icon: Gem, label: 'Mine', path: '/invest' },
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
                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-purple-700" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-purple-700 rounded-b-full"></div>
              )}
              <item.icon className={cn("w-5 h-5", isActive && "fill-purple-50")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
