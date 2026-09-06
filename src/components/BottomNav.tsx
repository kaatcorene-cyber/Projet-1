import { Link, useLocation } from 'react-router-dom';
import { CircleUser, Clock, Wallet, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Wallet, label: 'Investi', path: '/revenues' },
    { icon: Clock, label: 'Historique', path: '/history' },
    { icon: CircleUser, label: 'Profil', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#03296c]/80 backdrop-blur-xl border-t border-white/20 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-[72px] px-2 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full transition-all duration-300",
                isActive ? "text-brand-500" : "text-blue-200/60 hover:text-white/80"
              )}
            >
              <div className="relative flex flex-col items-center justify-center gap-1">
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-transform duration-300", 
                    isActive ? "scale-110" : "scale-100"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                
                <span className={cn(
                  "text-[11px] font-medium transition-all duration-300",
                  isActive ? "opacity-100" : "opacity-80"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -top-3.5 w-10 h-1 bg-brand-500 rounded-b-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
