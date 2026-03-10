import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Gamepad2, Zap, X, Heart } from 'lucide-react';

const CurateTab = () => {
  const [cards, setCards] = useState([1, 2, 3]);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  return (
    <div className="flex flex-col w-full h-full px-4 pt-6 pb-24 overflow-hidden relative">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">CURATE</h2>
          <p className="text-xs text-mint animate-pulse font-bold tracking-widest uppercase">Global Feed Live</p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase">Voting Power</span>
            <span className="text-sm font-bold text-fbbf24">84% <Zap size={10} className="inline" /></span>
          </div>
        </div>
      </div>

      {/* Deep Filtering UI */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2 no-scrollbar">
        {['🔥 Trending', '✨ Newest', '💎 High Wager', '🏆 Top Ranked', '🎨 Abstract'].map((f, i) => (
          <button key={i} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border ${i === 0 ? 'bg-mint text-black border-mint' : 'bg-white/5 text-slate-300 border-white/10'}`}>{f}</button>
        ))}
      </div>

      {/* Swipe Engine */}
      <div className="relative w-full max-w-[340px] mx-auto aspect-[4/5] flex items-center justify-center mt-4">
        {cards.length > 0 ? cards.map((c, i) => (
          <motion.div key={c} style={i === 0 ? { x, rotate, opacity } : { scale: 0.95, y: 10, opacity: 0.5, zIndex: -1 }} drag={i === 0 ? "x" : false} dragConstraints={{ left: 0, right: 0 }} onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 100) { setCards(p => p.slice(1)); x.set(0); } }} className="absolute inset-0 bg-space-surface border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden touch-none">
            <div className="absolute top-4 left-4 z-10 flex gap-2"><span className="bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-mint border border-mint/30 uppercase tracking-widest">Pixel Art</span></div>
            <div className="h-2/3 bg-black/80 flex items-center justify-center border-b border-white/5 p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-mint/10 to-transparent"></div>
              <Gamepad2 size={80} className="text-mint opacity-40" />
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between bg-gradient-to-b from-space-surface to-black">
              <div>
                <h3 className="font-['Orbitron'] text-xl text-white mb-1">Cyber Asset #{c}</h3>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-gradient-to-tr from-fbbf24 to-neon-pink"></div><p className="text-sm text-slate-400 font-bold">@Creator_{c}99</p></div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-xs text-slate-500 font-bold uppercase">Pool: 1.2k $PIX</span>
                <span className="text-xs text-slate-500 font-bold uppercase">24h left</span>
              </div>
            </div>
          </motion.div>
        )).reverse() : <div className="text-slate-400 font-['Orbitron'] text-center">Feed Empty.</div>}
      </div>

      {/* Swipe Actions */}
      <div className="flex justify-center gap-8 mt-8">
        <button onClick={() => { setCards(p => p.slice(1)); x.set(0); }} className="w-16 h-16 rounded-full bg-space-surface border border-neon-pink shadow-[0_0_20px_rgba(244,63,94,0.2)] flex items-center justify-center text-neon-pink active:scale-90 z-20"><X size={30} strokeWidth={3} /></button>
        <button onClick={() => { setCards(p => p.slice(1)); x.set(0); }} className="w-16 h-16 rounded-full bg-space-surface border border-mint shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center text-mint active:scale-90 z-20"><Heart size={30} strokeWidth={3} fill="#10b981" /></button>
      </div>
    </div>
  );
};

export default CurateTab;
