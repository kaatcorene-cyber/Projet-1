import React from 'react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ 
          backgroundImage: "url('https://i.imgur.com/eHZq3W8.jpeg')",
          animation: 'slow-pan 45s ease-in-out infinite alternate'
        }} 
      />
      {/* Semi-transparent white overlay to keep the app's dark text readable while letting the image show clearly */}
      <div className="absolute inset-0 bg-zinc-900 border-zinc-800/80 shadow-black/20/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-white/90" />
      
      {/* Subtle floating golden particles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/15 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-amber-600/15 blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
    </div>
  );
}
