import React from 'react';
import { RadioTower, Satellite, Cpu, Wifi, Server } from 'lucide-react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#fafafa] pointer-events-none">
      {/* Accent gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-red-600/5 blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

      {/* Connectivity Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] text-red-600" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="30" cy="30" r="1.5" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Floating Machines */}
      <div className="absolute top-[15%] left-[10%] opacity-10 text-red-600 animate-[bounce_6s_infinite]">
        <RadioTower size={64} strokeWidth={1} />
      </div>
      <div className="absolute top-[40%] right-[15%] opacity-10 text-red-600 animate-[bounce_8s_infinite_reverse]">
        <Server size={48} strokeWidth={1} />
      </div>
      <div className="absolute bottom-[20%] left-[25%] opacity-10 text-red-600 animate-[pulse_5s_infinite]">
        <Cpu size={56} strokeWidth={1} />
      </div>
      <div className="absolute bottom-[10%] right-[20%] opacity-10 text-red-600 animate-[bounce_7s_infinite]">
        <Satellite size={60} strokeWidth={1} />
      </div>
      <div className="absolute top-[60%] left-[15%] opacity-10 text-red-600 animate-[pulse_4s_infinite]">
        <Wifi size={40} strokeWidth={1} />
      </div>
    </div>
  );
}
