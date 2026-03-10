import React from 'react';
import { Bell, Settings, Flame, Medal, Grid as GridIcon, Trophy } from 'lucide-react';

const ProfileTab = ({ savedArts }) => (
  <div className="flex flex-col w-full h-full px-4 pt-6 overflow-y-auto pb-24">
    {/* Top Header */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider uppercase">Terminal</h2>
      <div className="flex gap-3"><Bell size={20} className="text-slate-400"/><Settings size={20} className="text-slate-400"/></div>
    </div>

    {/* Identity Card */}
    <div className="bg-gradient-to-br from-space-surface to-black border border-white/10 rounded-2xl p-5 mb-6 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-mint/10 rounded-full blur-3xl"></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-20 h-20 rounded-xl bg-black border-2 border-mint p-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
           <div className="w-full h-full bg-gradient-to-tr from-fbbf24 to-neon-pink rounded-lg"></div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <h3 className="text-xl font-black text-white font-['Orbitron']">@PixelPunk</h3>
             <span className="bg-fbbf24 text-black text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">PRO</span>
          </div>
          <p className="text-xs text-mint font-bold uppercase tracking-widest mb-3">Neon Syndicate Guild</p>
          <div className="flex gap-4">
             <div><span className="block text-white font-bold">14.2k</span><span className="text-[10px] text-slate-500 uppercase font-bold">Followers</span></div>
             <div><span className="block text-white font-bold">890</span><span className="text-[10px] text-slate-500 uppercase font-bold">Following</span></div>
          </div>
        </div>
      </div>
      {/* XP Bar */}
      <div className="mt-5 relative z-10">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1"><span className="text-slate-400">Level 12 Creator</span><span className="text-mint">450 / 1000 XP</span></div>
        <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10"><div className="h-full bg-mint w-[45%] shadow-[0_0_10px_#10b981]"></div></div>
      </div>
    </div>

    {/* Quick Stats Grid */}
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center"><Flame size={20} className="text-neon-pink mb-1" /><span className="text-lg font-black font-['Orbitron'] text-white">14</span><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Day Streak</span></div>
      <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center"><Medal size={20} className="text-fbbf24 mb-1" /><span className="text-lg font-black font-['Orbitron'] text-white">#42</span><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Global Rank</span></div>
      <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center"><GridIcon size={20} className="text-3b82f6 mb-1" /><span className="text-lg font-black font-['Orbitron'] text-white">12.4k</span><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Pixels Placed</span></div>
    </div>

    {/* Badges/Achievements (Mock) */}
    <div className="mb-6">
       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Achievements</h3>
       <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Genesis Mint', 'Top 100', '10k Pixels', 'Streak x7'].map((b, i) => (
             <div key={i} className="min-w-[80px] h-20 bg-black border border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                <Trophy size={20} className={i === 0 ? 'text-fbbf24' : 'text-slate-500'}/>
                <span className="text-[9px] text-center font-bold text-white leading-tight">{b}</span>
             </div>
          ))}
       </div>
    </div>

    {/* Art Vault */}
    <div className="mb-2">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Art Vault</h3>
         <div className="flex gap-2"><span className="text-xs bg-white/10 px-2 py-1 rounded text-white font-bold">All</span><span className="text-xs text-slate-500 px-2 py-1">Minted</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {savedArts.length === 0 ? (
          <div className="col-span-2 text-center text-slate-500 py-6 border border-dashed border-white/10 rounded-xl font-['Orbitron']">Vault Empty.</div>
        ) : (
          savedArts.map(art => (
            <div key={art.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
              <div className="w-full aspect-square bg-black border border-white/5 grid rounded" style={{ gridTemplateColumns: `repeat(${art.gridSize || 16}, minmax(0, 1fr))` }}>
                {art.pixels.map((color, i) => <div key={i} style={{ backgroundColor: color }} />)}
              </div>
              <p className="text-white text-xs font-bold mt-3 font-['Orbitron'] truncate w-full text-center">{art.title}</p>
              <div className="flex gap-2 mt-2 w-full">
                 <span className="flex-1 bg-white/10 text-slate-300 text-[9px] py-1 rounded text-center font-bold uppercase tracking-widest">{art.isAnim ? 'Anim' : 'Static'}</span>
                 <span className="flex-1 bg-mint/20 text-mint border border-mint/30 text-[9px] py-1 rounded text-center font-bold uppercase tracking-widest">Draft</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default ProfileTab;
