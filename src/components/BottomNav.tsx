import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Network, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Accueil', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Appareils', path: '/invest' },
    { icon: Network, label: 'Équipe', path: '/team' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 pb-safe z-50">
      <div className="flex justify-around items-center h-[72px] max-w-md mx-auto px-2">
        {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <Link
               key={item.path}
               to={item.path}
               className={cn(
                 "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative rounded-xl",
                 isActive ? "text-brand" : "text-neutral-400 hover:text-neutral-600"
               )}
             >
               <div className={cn("p-2 rounded-xl transition-all duration-300", isActive ? "bg-brand/10 text-brand font-bold" : "bg-transparent")}>
                 <item.icon className="w-5 h-5" />
               </div>
               <span className={cn("text-[9px] font-bold tracking-widest uppercase transition-opacity duration-300", isActive ? "opacity-100 font-bold" : "opacity-80")}>{item.label}</span>
             </Link>
           );
        })}
      </div>
    </div>
  );
}
