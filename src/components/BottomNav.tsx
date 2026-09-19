import { Link, useLocation } from 'react-router-dom';
import { Home, Truck, Users2, History as HistoryIcon, UserCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Truck, label: 'Service', path: '/invest' },
    { icon: UserCircle2, label: 'Compte', path: '/profile' },
    { icon: Users2, label: 'Équipe', path: '/team' },
    { icon: HistoryIcon, label: 'Historique', path: '/history' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe">
      <div className="max-w-md mx-auto px-4 pb-3">
        <nav 
          aria-label="Navigation principale"
          className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-1.5 py-1.5 flex items-center justify-around"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 group active:scale-95",
                  isActive
                    ? "text-emerald-700 font-extrabold"
                    : "text-slate-500 hover:text-slate-800 font-semibold"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-emerald-50 border border-emerald-200/70 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
                )}
                
                <div className="relative">
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-transform duration-150", 
                      isActive ? "scale-105 stroke-[2.5] text-emerald-700" : "stroke-[1.9] text-slate-500 group-hover:text-slate-800"
                    )} 
                  />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-600 rounded-full ring-2 ring-white shadow-sm" />
                  )}
                </div>

                <span 
                  className={cn(
                    "text-[10px] mt-1 tracking-tight leading-none whitespace-nowrap",
                    isActive ? "text-emerald-800 font-black" : "text-slate-500 font-semibold group-hover:text-slate-800"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
