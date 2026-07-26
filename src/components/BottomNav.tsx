import { Link, useLocation } from 'react-router-dom';
import { User, ScrollText, Users, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: ScrollText, label: 'Contrats', path: '/invest' },
    { icon: Users, label: 'Équipe', path: '/team' },
    { icon: History, label: 'Transactions', path: '/history' },
    { icon: User, label: 'Profil', path: '/dashboard' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
      <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-300/50 rounded-full shadow-lg p-2 flex gap-1 relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center justify-center px-4 py-2.5 rounded-full transition-all duration-300 z-10",
                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative flex items-center gap-2">
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "")} />
                {isActive && (
                   <motion.span
                       initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      className="text-xs font-bold tracking-wide overflow-hidden whitespace-nowrap text-white"
                   >
                     {item.label}
                   </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
