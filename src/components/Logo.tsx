import React from 'react';

export const Logo: React.FC<{ className?: string, textClassName?: string }> = ({ className = "", textClassName = "text-3xl" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className={`font-black tracking-tighter ${textClassName}`}>
        <span className="text-emerald-600 drop-shadow-sm">Invest</span>
        <span className="text-amber-500 drop-shadow-sm">Afrik</span>
      </span>
    </div>
  );
};
