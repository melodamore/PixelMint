import React from 'react';
import { Gamepad2 } from 'lucide-react';

const ArcadeTab = () => (
  <div className="flex flex-col items-center justify-center w-full h-full px-6 relative overflow-hidden bg-space-base">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-mint/20 blur-[100px] rounded-full"></div>

    <Gamepad2 size={80} className="text-mint mb-6 animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
    <h2 className="text-4xl font-black text-white font-['Orbitron'] tracking-widest mb-2 uppercase relative z-10 text-center">Arcade<br/><span className="text-neon-pink">Offline</span></h2>
    <p className="text-slate-400 text-center text-sm font-bold uppercase tracking-widest max-w-[250px] relative z-10 mb-8 mt-4">Wager matches, Speedruns, and Guild Wars are compiling.</p>

    <div className="flex gap-2 relative z-10">
      <div className="w-2 h-8 bg-mint animate-[bounce_1s_infinite_0ms]"></div>
      <div className="w-2 h-8 bg-mint animate-[bounce_1s_infinite_100ms]"></div>
      <div className="w-2 h-8 bg-mint animate-[bounce_1s_infinite_200ms]"></div>
    </div>

    <div className="mt-12 px-6 py-2 bg-black/50 border border-mint/30 rounded-full text-mint text-xs font-bold uppercase tracking-widest backdrop-blur-md relative z-10">Deploying in v3.0</div>
  </div>
);

export default ArcadeTab;
