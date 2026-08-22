import React from 'react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')",
        }} 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/85 to-black/95" />
      
      {/* Subtle floating red/orange particles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-600/10 blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
    </div>
  );
}
