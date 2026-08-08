import { Link, useLocation } from 'react-router-dom';
import { CircleUser, Network, Wallet, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Wallet, label: 'Revenus', path: '/revenues' },
    { icon: Network, label: 'Invités', path: '/team' },
    { icon: CircleUser, label: 'Profil', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-6 px-4 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pt-12">
      <div className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-slate-200/50 p-2 rounded-3xl shadow-2xl shadow-emerald-500/5 w-full max-w-sm flex justify-around items-center relative">
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative z-10 flex flex-col items-center justify-center w-[64px] h-[64px] rounded-2xl transition-all duration-500",
                isActive ? "text-emerald-500" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className="relative flex flex-col items-center justify-center h-full w-full">
                <motion.div
                  animate={{ y: isActive ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <item.icon 
                    className={cn("w-6 h-6", isActive ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "")} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </motion.div>
                
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-1.5 text-[10px] font-bold tracking-wide whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
