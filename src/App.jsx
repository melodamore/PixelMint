import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Grid3X3, Gamepad2, Wallet, User, Trash2, Heart, X, Zap, Flame, Trophy, Image as ImageIcon, Settings, Bell, Target, ChevronRight, Upload, Crown, Medal } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

const GRID_SIZE = 16;

// --- MODALS ---
const QuestsModal = ({ onClose }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm pb-20 px-4">
    <div className="bg-space-surface border border-mint rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-white font-['Orbitron'] flex items-center gap-2"><Target className="text-neon-pink"/> Daily Quests</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
      </div>
      <div className="space-y-3">
        {[
          { title: "Draw a Cyber-Cat", reward: "500 $PIX", done: false },
          { title: "Vote on 10 Artworks", reward: "250 $PIX", done: true },
          { title: "Login 3 days in a row", reward: "1.5x Multiplier", done: false }
        ].map((q, i) => (
          <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${q.done ? 'bg-mint/10 border-mint/30' : 'bg-white/5 border-white/10'}`}>
            <div>
              <p className={`font-bold ${q.done ? 'text-mint line-through' : 'text-white'}`}>{q.title}</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{q.reward}</p>
            </div>
            {q.done ? <Zap size={20} className="text-mint fill-mint" /> : <ChevronRight size={20} className="text-slate-500" />}
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const SettingsModal = ({ onClose }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm pb-20 px-4">
    <div className="bg-space-surface border border-white/10 rounded-2xl w-full max-w-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-white font-['Orbitron'] flex items-center gap-2"><Settings className="text-slate-300"/> System Config</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
      </div>
      <div className="space-y-2">
        {['Haptic Feedback', 'Offline Draft Mode', 'Data Saver Mode'].map((setting, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="font-bold text-slate-200">{setting}</span>
            <div className="w-12 h-6 bg-mint rounded-full flex items-center p-1 justify-end">
              <div className="w-4 h-4 bg-black rounded-full shadow-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const LeaderboardModal = ({ onClose }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm pb-20 px-4">
    <div className="bg-space-surface border border-fbbf24/50 rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(251,191,36,0.15)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-white font-['Orbitron'] flex items-center gap-2"><Crown className="text-fbbf24"/> Top Creators</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
      </div>
      <div className="space-y-3">
        {[
          { name: "NeonGod", score: "124.5k XP", rank: 1, color: "text-fbbf24", bg: "bg-fbbf24/10 border-fbbf24/30" },
          { name: "PixelQueen", score: "98.2k XP", rank: 2, color: "text-slate-300", bg: "bg-white/10 border-white/20" },
          { name: "VoidWalker", score: "85.0k XP", rank: 3, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30" },
          { name: "You", score: "4.0k XP", rank: 42, color: "text-mint", bg: "bg-mint/10 border-mint/30" }
        ].map((u, i) => (
          <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${u.bg}`}>
            <div className="flex items-center gap-3">
              <span className={`font-black font-['Orbitron'] ${u.color}`}>#{u.rank}</span>
              <span className="font-bold text-white">{u.name}</span>
            </div>
            <span className="text-sm text-slate-300 font-bold">{u.score}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

// --- TABS ---
const CreateTab = ({ openQuests }) => {
  const [pixels, setPixels] = useState(Array(GRID_SIZE * GRID_SIZE).fill('transparent'));
  const [color, setColor] = useState('#10b981');
  const [isDrawing, setIsDrawing] = useState(false);
  const [bgImage, setBgImage] = useState(null);
  const fileInputRef = useRef(null);

  const paintPixel = (index) => {
    setPixels(prev => { const newPixels = [...prev]; newPixels[index] = color; return newPixels; });
  };

  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    const element = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    if (element?.dataset.index) paintPixel(Number(element.dataset.index));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBgImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    setPixels(Array(GRID_SIZE * GRID_SIZE).fill('transparent'));
    setBgImage(null);
  };

  return (
    <div className="flex flex-col items-center w-full h-full pt-4">
      <div className="flex justify-between items-center w-full px-4 mb-4">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">
          MINT <span className="text-mint text-sm border border-mint/30 bg-mint/10 px-2 py-1 rounded-full">8-BIT</span>
        </h2>
        <div className="flex gap-2">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="p-2 text-slate-400 hover:text-3b82f6 transition-colors" title="Import Meme/Ghost Template">
            <Upload size={20} />
          </button>
          <button onClick={openQuests} className="p-2 text-slate-400 hover:text-fbbf24 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full animate-pulse"></span>
          </button>
          <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-neon-pink transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div 
        className="w-[90vw] max-w-[350px] aspect-square bg-space-surface backdrop-blur-xl border-2 border-white/10 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] grid touch-none overflow-hidden p-1 relative bg-cover bg-center"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
        onMouseLeave={() => setIsDrawing(false)} onMouseUp={() => setIsDrawing(false)} onTouchEnd={() => setIsDrawing(false)}
      >
        {/* Semi-transparent overlay to make drawing visible over images */}
        {bgImage && <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>}
        
        {pixels.map((pixelColor, index) => (
          <div key={index} data-index={index} onMouseDown={() => { setIsDrawing(true); paintPixel(index); }} onMouseEnter={() => { if (isDrawing) paintPixel(index); }} onTouchStart={() => { setIsDrawing(true); paintPixel(index); }} onTouchMove={handleTouchMove} className="w-full h-full border-[0.5px] border-white/10 active:scale-90 z-10" style={{ backgroundColor: pixelColor }} />
        ))}
      </div>

      <div className="flex gap-4 mt-8 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10">
        {['#10b981', '#f43f5e', '#3b82f6', '#fbbf24', '#a855f7', '#ffffff', 'transparent'].map((c) => (
          <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-125' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: c === 'transparent' ? '#1f2937' : c, backgroundImage: c === 'transparent' ? 'radial-gradient(#4b5563 1px, transparent 1px)' : 'none', backgroundSize: c === 'transparent' ? '4px 4px' : 'auto' }} />
        ))}
      </div>
      
      <button className="mt-6 w-[90vw] max-w-[350px] py-4 rounded-xl font-['Orbitron'] font-bold text-black bg-mint hover:bg-mint-glow shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all uppercase tracking-widest">Submit Artwork</button>
    </div>
  );
};

const ArcadeTab = () => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      <div className="w-full flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">CURATION</h2>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/5"><Zap size={14} className="text-fbbf24" fill="#fbbf24" /><span className="text-sm font-bold">1.5x Multiplier</span></div>
      </div>
      <div className="relative w-full max-w-[320px] aspect-[4/5] flex items-center justify-center">
        <motion.div style={{ x, rotate, opacity }} drag="x" dragConstraints={{ left: 0, right: 0 }} className="absolute inset-0 bg-space-surface border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden touch-none">
          <div className="h-2/3 bg-black/50 flex items-center justify-center border-b border-white/5 p-4">
             <div className="w-32 h-32 grid grid-cols-4 gap-1 opacity-80">{Array(16).fill(0).map((_,i) => <div key={i} className={`bg-${i%2===0 ? 'mint' : 'neon-pink'}`} />)}</div>
          </div>
          <div className="flex-1 p-5 flex flex-col justify-center"><h3 className="font-['Orbitron'] text-xl text-white">Neon Cyber-Cat</h3><p className="text-sm text-slate-400 mt-1">By hidden_user</p></div>
        </motion.div>
      </div>
      <div className="flex gap-8 mt-10">
        <button className="w-16 h-16 rounded-full bg-space-surface border border-neon-pink flex items-center justify-center text-neon-pink active:scale-90"><X size={30} strokeWidth={3} /></button>
        <button className="w-16 h-16 rounded-full bg-space-surface border border-mint flex items-center justify-center text-mint active:scale-90"><Heart size={30} strokeWidth={3} fill="#10b981" /></button>
      </div>
    </div>
  );
};

const EconomyTab = () => (
  <div className="flex flex-col w-full h-full px-4 pt-6 overflow-y-auto pb-24">
    <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider mb-6 uppercase">Tokenomics</h2>
    <div className="bg-gradient-to-br from-mint/10 to-black/80 border border-mint rounded-2xl p-6 mb-4 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-mint/20 rounded-full blur-3xl" />
      <h3 className="text-3xl font-['Orbitron'] text-mint font-bold mb-1 shadow-mint-glow">12,450 <span className="text-lg">$PIX</span></h3>
      <p className="text-xs text-mint/70 mb-4 uppercase tracking-widest font-bold">Utility Token</p>
    </div>
    <div className="bg-gradient-to-br from-neon-pink/10 to-black/80 border border-neon-pink rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-neon-pink/20 rounded-full blur-3xl" />
      <h3 className="text-3xl font-['Orbitron'] text-neon-pink font-bold mb-1">0.00 <span className="text-lg">$MINT</span></h3>
      <p className="text-xs text-neon-pink/70 mb-4 uppercase tracking-widest font-bold">On-chain Airdrop (TON)</p>
      <button className="w-full mt-5 py-3 rounded-lg font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">Connect TON Wallet</button>
    </div>
  </div>
);

const ProfileTab = ({ openSettings, openLeaderboard }) => (
  <div className="flex flex-col w-full h-full px-4 pt-6 overflow-y-auto pb-24">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider uppercase">Pilot Auth</h2>
      <button onClick={openSettings} className="p-2 text-slate-400 hover:text-mint transition-colors"><Settings size={20} /></button>
    </div>
    <div className="bg-space-surface border border-white/10 rounded-2xl p-5 mb-6 flex items-center gap-4 relative overflow-hidden">
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-mint to-neon-pink p-1">
        <div className="w-full h-full bg-black rounded-full border-2 border-black flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-white/10 grid grid-cols-2"><div className="bg-mint/80"></div><div className="bg-neon-pink/80"></div><div className="bg-fbbf24/80"></div><div className="bg-3b82f6/80"></div></div>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white font-['Orbitron'] flex items-center gap-2">@PixelPunk <span className="bg-fbbf24 text-black text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase">PRO</span></h3>
        <p className="text-sm text-slate-400">Level 12 Creator</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center"><Flame size={28} className="text-neon-pink mb-2" /><span className="text-2xl font-black font-['Orbitron'] text-white">14</span><span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Day Streak</span></div>
      <button onClick={openLeaderboard} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-left">
        <Medal size={28} className="text-fbbf24 mb-2" />
        <span className="text-2xl font-black font-['Orbitron'] text-white">4,050</span>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rank: #42</span>
      </button>
    </div>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('Create');
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#030712');
  }, []);

  const tabs = [{ id: 'Create', icon: Grid3X3 }, { id: 'Arcade', icon: Gamepad2 }, { id: 'Economy', icon: Wallet }, { id: 'Profile', icon: User }];

  return (
    <div className="bg-space-base text-slate-100 h-screen w-full flex flex-col font-sans select-none overflow-hidden relative">
       <div className="flex-1 relative">
         <AnimatePresence mode="wait">
           <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="absolute inset-0">
             {activeTab === 'Create' && <CreateTab openQuests={() => setActiveModal('quests')} />}
             {activeTab === 'Arcade' && <ArcadeTab />}
             {activeTab === 'Economy' && <EconomyTab />}
             {activeTab === 'Profile' && <ProfileTab openSettings={() => setActiveModal('settings')} openLeaderboard={() => setActiveModal('leaderboard')} />}
           </motion.div>
         </AnimatePresence>
       </div>

       <div className="h-20 bg-[#030712]/95 backdrop-blur-lg border-t border-mint/20 px-4 flex justify-between items-center pb-safe z-40 relative">
         {tabs.map((tab) => {
           const Icon = tab.icon; const isActive = activeTab === tab.id;
           return (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative flex flex-col items-center justify-center w-full h-full">
               <motion.div animate={{ scale: isActive ? 1.1 : 1, color: isActive ? '#10b981' : '#64748b' }} className="mb-1"><Icon strokeWidth={isActive ? 2.5 : 2} size={24} /></motion.div>
               <motion.span animate={{ color: isActive ? '#10b981' : '#64748b' }} className="text-[10px] font-bold tracking-wide uppercase font-['Rajdhani']">{tab.id}</motion.span>
             </button>
           );
         })}
       </div>

       <AnimatePresence>
         {activeModal === 'quests' && <QuestsModal onClose={() => setActiveModal(null)} />}
         {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} />}
         {activeModal === 'leaderboard' && <LeaderboardModal onClose={() => setActiveModal(null)} />}
       </AnimatePresence>
    </div>
  );
};

export default App;