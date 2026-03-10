import React from 'react';
import { Sparkles } from 'lucide-react';

const HomeTab = ({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center w-full h-full px-6 relative overflow-hidden bg-space-base">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    <div className="absolute top-0 right-0 w-64 h-64 bg-mint/10 blur-[100px] rounded-full"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-pink/10 blur-[100px] rounded-full"></div>

    <div className="relative z-10 text-center flex flex-col items-center">
      <h1 className="text-5xl font-black text-white font-['Orbitron'] tracking-widest mb-4 uppercase">
        Pixel<span className="text-mint">Mint</span>
      </h1>
      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-[280px] mb-12 leading-relaxed">
        The definitive canvas for on-chain pixel art.
      </p>

      <button
        onClick={onCreateClick}
        className="group relative px-8 py-4 bg-mint rounded-2xl font-black text-black font-['Orbitron'] uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-95 flex items-center gap-3 overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        <Sparkles size={24} className="group-hover:animate-pulse" />
        Start Creating
      </button>
    </div>
  </div>
);

export default HomeTab;
