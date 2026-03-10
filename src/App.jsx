import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Grid3X3, Gamepad2, Wallet, User, Trash2, Heart, X, Zap, Flame, Trophy, Image as ImageIcon, Settings, Bell, Target, ChevronRight, Upload, Crown, Medal, Layers, Timer, Swords, ZoomIn, ZoomOut, Maximize, ChevronDown } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

// --- MODALS ---
const QuestsModal = ({ onClose }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm pb-20 px-4">
    <div className="bg-space-surface border border-mint rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
      <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-white font-['Orbitron'] flex items-center gap-2"><Target className="text-neon-pink"/> Daily Quests</h3><button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
      <div className="space-y-3">
        {[{ title: "Draw a Cyber-Cat", reward: "500 $PIX", done: false }, { title: "Vote on 10 Artworks", reward: "250 $PIX", done: true }, { title: "Login 3 days in a row", reward: "1.5x Multiplier", done: false }].map((q, i) => (
          <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${q.done ? 'bg-mint/10 border-mint/30' : 'bg-white/5 border-white/10'}`}>
            <div><p className={`font-bold ${q.done ? 'text-mint line-through' : 'text-white'}`}>{q.title}</p><p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{q.reward}</p></div>
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
      <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-white font-['Orbitron'] flex items-center gap-2"><Settings className="text-slate-300"/> System Config</h3><button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
      <div className="space-y-2">
        {['Haptic Feedback', 'Offline Draft Mode', 'Data Saver Mode'].map((setting, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"><span className="font-bold text-slate-200">{setting}</span><div className="w-12 h-6 bg-mint rounded-full flex items-center p-1 justify-end"><div className="w-4 h-4 bg-black rounded-full shadow-md"></div></div></div>
        ))}
      </div>
    </div>
  </motion.div>
);

const LeaderboardModal = ({ onClose }) => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm pb-20 px-4">
    <div className="bg-space-surface border border-fbbf24/50 rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(251,191,36,0.15)]">
      <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-white font-['Orbitron'] flex items-center gap-2"><Crown className="text-fbbf24"/> Top Creators</h3><button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button></div>
      <div className="space-y-3">
        {[{ name: "NeonGod", score: "124.5k XP", rank: 1, color: "text-fbbf24", bg: "bg-fbbf24/10 border-fbbf24/30" }, { name: "PixelQueen", score: "98.2k XP", rank: 2, color: "text-slate-300", bg: "bg-white/10 border-white/20" }, { name: "VoidWalker", score: "85.0k XP", rank: 3, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30" }, { name: "You", score: "4.0k XP", rank: 42, color: "text-mint", bg: "bg-mint/10 border-mint/30" }].map((u, i) => (
          <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${u.bg}`}><div className="flex items-center gap-3"><span className={`font-black font-['Orbitron'] ${u.color}`}>#{u.rank}</span><span className="font-bold text-white">{u.name}</span></div><span className="text-sm text-slate-300 font-bold">{u.score}</span></div>
        ))}
      </div>
    </div>
  </motion.div>
);

const MintModal = ({ art, onClose, onConfirm }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
    <div className="bg-space-surface border border-mint rounded-3xl w-full max-w-sm p-6 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
      <div className="w-20 h-20 bg-black border border-white/10 mx-auto flex items-center justify-center mb-4 grid" style={{ gridTemplateColumns: `repeat(${art?.gridSize || 16}, minmax(0, 1fr))` }}>
         {art?.pixels.map((color, i) => <div key={i} style={{ backgroundColor: color }} />)}
      </div>
      <h3 className="text-xl font-black text-white font-['Orbitron'] mb-2 uppercase">Mint "{art?.title}"</h3>
      <p className="text-slate-400 text-sm mb-6">Deploying your creation to the TON blockchain. Estimated gas fee: 0.05 TON.</p>
      <div className="space-y-3">
        <button onClick={() => { onConfirm(art.id); onClose(); }} className="w-full py-3 rounded-xl font-bold text-black bg-mint hover:bg-mint-glow uppercase tracking-widest font-['Orbitron']">Confirm & Mint</button>
        <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 uppercase tracking-widest font-['Orbitron']">Cancel</button>
      </div>
    </div>
  </motion.div>
);

const SpeedrunModal = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [pixels, setPixels] = useState(Array(16 * 16).fill('transparent'));
  const [color, setColor] = useState('#10b981');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) { const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(timer); }
  }, [timeLeft]);

  const paintPixel = (index) => setPixels(prev => { const newPixels = [...prev]; newPixels[index] = color; return newPixels; });
  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    const element = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    const idx = element?.getAttribute('data-index');
    if (idx !== null && idx !== undefined) paintPixel(Number(idx));
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-50 flex flex-col items-center bg-space-base px-4 pt-8 pb-20">
      <div className="w-full flex justify-between items-center mb-6">
         <div className="flex flex-col"><span className="text-neon-pink font-bold uppercase tracking-widest text-xs">Prompt</span><span className="text-xl font-black text-white font-['Orbitron']">Cyber-Sword</span></div>
         <div className={`text-3xl font-black font-['Orbitron'] ${timeLeft <= 10 ? 'text-neon-pink animate-pulse' : 'text-mint'}`}>0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
      </div>
      <div className="w-[90vw] max-w-[350px] aspect-square bg-space-surface backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.15)] grid touch-none overflow-hidden p-1" style={{ gridTemplateColumns: `repeat(16, minmax(0, 1fr))` }} onMouseLeave={() => setIsDrawing(false)} onMouseUp={() => setIsDrawing(false)} onTouchEnd={() => setIsDrawing(false)}>
        {pixels.map((pixelColor, index) => <div key={index} data-index={index} onMouseDown={() => { setIsDrawing(true); paintPixel(index); }} onMouseEnter={() => { if (isDrawing) paintPixel(index); }} onTouchStart={() => { setIsDrawing(true); paintPixel(index); }} onTouchMove={handleTouchMove} className="w-full h-full border-[0.5px] border-white/10 active:scale-90" style={{ backgroundColor: pixelColor }} />)}
      </div>
      <div className="flex gap-4 mt-8 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10">{['#10b981', '#f43f5e', '#3b82f6', '#fbbf24', '#ffffff'].map((c) => <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-125' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div>
      <div className="mt-auto w-full flex gap-3"><button onClick={onClose} className="flex-1 py-4 rounded-xl font-bold text-white bg-white/10 border border-white/20 uppercase tracking-widest font-['Orbitron']">Abort</button><button onClick={onClose} className="flex-[2] py-4 rounded-xl font-bold text-black bg-mint hover:bg-mint-glow uppercase tracking-widest font-['Orbitron']">Submit</button></div>
    </motion.div>
  );
};

const ConfirmClearModal = ({ onAccept, onDecline }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
    <div className="bg-space-surface border border-neon-pink rounded-3xl w-full max-w-sm p-6 text-center shadow-[0_0_50px_rgba(244,63,94,0.2)]">
      <Trash2 size={40} className="text-neon-pink mx-auto mb-4" />
      <h3 className="text-xl font-black text-white font-['Orbitron'] mb-2 uppercase">Warning: Data Loss</h3>
      <p className="text-slate-400 text-sm mb-6">Changing the grid size will clear your current canvas. This action cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onDecline} className="flex-1 py-3 rounded-xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 uppercase tracking-widest font-['Orbitron']">Decline</button>
        <button onClick={onAccept} className="flex-1 py-3 rounded-xl font-bold text-black bg-neon-pink hover:bg-red-500 uppercase tracking-widest font-['Orbitron']">Accept</button>
      </div>
    </div>
  </motion.div>
);

const CustomGridModal = ({ onAccept, onClose }) => {
  const [val, setVal] = useState(16);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-space-surface border border-mint rounded-3xl w-full max-w-sm p-6 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        <h3 className="text-xl font-black text-white font-['Orbitron'] mb-2 uppercase">Custom Grid Size</h3>
        <p className="text-slate-400 text-sm mb-4">Enter a grid size (e.g., 50 for 50x50). Max 128.</p>
        <input type="number" min="1" max="128" value={val} onChange={e => setVal(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white text-center font-bold text-xl focus:outline-none focus:border-mint mb-6" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 uppercase tracking-widest font-['Orbitron']">Cancel</button>
          <button onClick={() => onAccept(Math.min(Math.max(Number(val), 1), 128))} className="flex-1 py-3 rounded-xl font-bold text-black bg-mint hover:bg-mint-glow uppercase tracking-widest font-['Orbitron']">Apply</button>
        </div>
      </div>
    </motion.div>
  );
};

// --- TABS ---
const CreateTab = ({ openQuests, onSaveArt }) => {
  const [gridSize, setGridSize] = useState(16);
  const [pixels, setPixels] = useState(Array(16 * 16).fill('transparent'));
  const [color, setColor] = useState('#10b981');
  const [isDrawing, setIsDrawing] = useState(false);
  const [bgImage, setBgImage] = useState(null);
  
  // UI States
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [pendingSize, setPendingSize] = useState(null);

  // Zoom & Pan states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const lastTouchRef = useRef(null);
  const fileInputRef = useRef(null);

  const paintPixel = (index) => setPixels(prev => { const newPixels = [...prev]; newPixels[index] = color; return newPixels; });

  const handleGridSelect = (size) => {
    setShowGridMenu(false);
    if (size === 'custom') {
      setShowCustomModal(true);
      return;
    }
    const isBlank = pixels.every(p => p === 'transparent');
    if (!isBlank) {
      setPendingSize(size);
      setShowConfirmClear(true);
    } else {
      applyGridSize(size);
    }
  };

  const applyGridSize = (size) => {
    setGridSize(size);
    setPixels(Array(size * size).fill('transparent'));
    setZoom(1);
    setPan({x: 0, y: 0});
    setBgImage(null);
    setShowConfirmClear(false);
    setShowCustomModal(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setIsDrawing(false);
      lastTouchRef.current = { dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), midX: (e.touches[0].clientX + e.touches[1].clientX) / 2, midY: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
    } else if (e.touches.length === 1) {
      setIsDrawing(true);
      const element = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      const idx = element?.getAttribute('data-index');
      if (idx !== null && idx !== undefined) paintPixel(Number(idx));
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchRef.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const scaleDelta = dist / lastTouchRef.current.dist;
      setZoom(z => Math.min(Math.max(0.5, z * scaleDelta), 5));
      setPan(p => ({ x: p.x + (midX - lastTouchRef.current.midX), y: p.y + (midY - lastTouchRef.current.midY) }));
      lastTouchRef.current = { dist, midX, midY };
    } else if (e.touches.length === 1 && isDrawing) {
      const element = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      const idx = element?.getAttribute('data-index');
      if (idx !== null && idx !== undefined) paintPixel(Number(idx));
    }
  };

  const handleTouchEnd = () => { setIsDrawing(false); lastTouchRef.current = null; };
  const clearCanvas = () => { setPixels(Array(gridSize * gridSize).fill('transparent')); setBgImage(null); setZoom(1); setPan({x:0, y:0}); };

  const handleSave = () => {
    if (pixels.every(p => p === 'transparent')) return alert("Canvas is empty!");
    onSaveArt({ id: Date.now(), title: `Pixel #${Math.floor(Math.random() * 10000)}`, pixels: [...pixels], bgImage, gridSize, minted: false });
    clearCanvas();
  };

  return (
    <div className="flex flex-col items-center w-full h-full pt-4 relative">
      <div className="flex justify-between items-center w-full px-4 mb-4 z-30 relative">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">MINT <span className="text-mint text-sm border border-mint/30 bg-mint/10 px-2 py-1 rounded-full">8-BIT</span></h2>
        <div className="flex gap-1 items-center">
          
          <div className="relative">
            <button onClick={() => setShowGridMenu(!showGridMenu)} className="flex items-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-slate-300 font-['Orbitron'] mr-1 transition-colors">
              {gridSize}x{gridSize} <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {showGridMenu && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-full mt-2 bg-space-surface border border-white/10 rounded-lg shadow-xl flex flex-col overflow-hidden w-28 backdrop-blur-md">
                  {[16, 32, 64, 128].map(size => (
                    <button key={size} onClick={() => handleGridSelect(size)} className="px-4 py-3 text-sm text-left hover:bg-white/10 text-white font-['Orbitron'] font-bold border-b border-white/5">{size}x{size}</button>
                  ))}
                  <button onClick={() => handleGridSelect('custom')} className="px-4 py-3 text-sm text-left hover:bg-white/10 text-mint font-bold font-['Orbitron']">Custom</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => { if(e.target.files[0]) { const r = new FileReader(); r.onload = (ev) => setBgImage(ev.target.result); r.readAsDataURL(e.target.files[0]); } }} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="p-2 text-slate-400 hover:text-3b82f6"><Upload size={18} /></button>
          <button onClick={openQuests} className="p-2 text-slate-400 hover:text-fbbf24 relative"><Bell size={18} /><span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full animate-pulse"></span></button>
          <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-neon-pink"><Trash2 size={18} /></button>
        </div>
      </div>

      <div className="relative w-[90vw] max-w-[350px] aspect-square overflow-hidden rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-space-surface backdrop-blur-xl border-2 border-white/10 touch-none">
        <div className="absolute right-2 top-2 z-20 flex flex-col gap-2 bg-black/50 p-1 rounded-lg border border-white/10 backdrop-blur-md">
          <button onClick={() => setZoom(z => Math.min(z + 0.5, 5))} className="p-1.5 text-white hover:text-mint transition-colors"><ZoomIn size={18}/></button>
          <button onClick={() => {setZoom(1); setPan({x:0, y:0})}} className="p-1.5 text-white hover:text-mint transition-colors"><Maximize size={18}/></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="p-1.5 text-white hover:text-mint transition-colors"><ZoomOut size={18}/></button>
        </div>

        <div 
          className="w-full h-full grid p-1 bg-cover bg-center origin-center"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, backgroundImage: bgImage ? `url(${bgImage})` : 'none', transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          onMouseDown={() => setIsDrawing(true)} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}
        >
          {bgImage && <div className="absolute inset-0 bg-black/40 pointer-events-none -z-0"></div>}
          {pixels.map((pixelColor, index) => (
            <div key={index} data-index={index} onMouseDown={() => { setIsDrawing(true); paintPixel(index); }} onMouseEnter={() => { if (isDrawing) paintPixel(index); }} className={`w-full h-full z-10 ${gridSize > 32 ? '' : 'border-[0.5px] border-white/10'}`} style={{ backgroundColor: pixelColor }} />
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-8 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10 z-10">
        {['#10b981', '#f43f5e', '#3b82f6', '#fbbf24', '#a855f7', '#ffffff', 'transparent'].map((c) => (
          <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-125' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: c === 'transparent' ? '#1f2937' : c, backgroundImage: c === 'transparent' ? 'radial-gradient(#4b5563 1px, transparent 1px)' : 'none', backgroundSize: c === 'transparent' ? '4px 4px' : 'auto' }} />
        ))}
      </div>
      <button onClick={handleSave} className="mt-6 w-[90vw] max-w-[350px] py-4 rounded-xl font-['Orbitron'] font-bold text-black bg-white hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all uppercase tracking-widest z-10">Save to Vault</button>

      {/* Grid Update Modals */}
      <AnimatePresence>
         {showConfirmClear && <ConfirmClearModal onDecline={() => setShowConfirmClear(false)} onAccept={() => applyGridSize(pendingSize)} />}
         {showCustomModal && <CustomGridModal onClose={() => setShowCustomModal(false)} onAccept={(size) => { const isBlank = pixels.every(p => p === 'transparent'); if (!isBlank) { setPendingSize(size); setShowConfirmClear(true); setShowCustomModal(false); } else { applyGridSize(size); } }} />}
      </AnimatePresence>
    </div>
  );
};

const CurateTab = () => {
  const generateMockArt = (c1, c2) => Array(256).fill(0).map(() => Math.random() > 0.6 ? c1 : (Math.random() > 0.8 ? c2 : 'transparent'));
  const [cards, setCards] = useState([
    { id: 1, title: "Neon Cyber-Cat", author: "anon_84", art: generateMockArt('#10b981', '#f43f5e') },
    { id: 2, title: "Galactic Sword", author: "pixel_king", art: generateMockArt('#3b82f6', '#fbbf24') },
    { id: 3, title: "Space Invader", author: "retro_fan", art: generateMockArt('#f43f5e', '#a855f7') },
    { id: 4, title: "Mint Leaf", author: "nature_bot", art: generateMockArt('#10b981', '#ffffff') },
  ]);

  const x = useMotionValue(0); const rotate = useTransform(x, [-200, 200], [-15, 15]); const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const handleVote = (id) => { setCards(prev => prev.filter(c => c.id !== id)); x.set(0); };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4">
      <div className="w-full flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">CURATION</h2><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/5"><Zap size={14} className="text-fbbf24" fill="#fbbf24" /><span className="text-sm font-bold">1.5x Multiplier</span></div></div>
      <div className="relative w-full max-w-[320px] aspect-[4/5] flex items-center justify-center">
        {cards.length > 0 ? (
          cards.map((card, index) => {
            const isTop = index === 0;
            return (
              <motion.div key={card.id} style={isTop ? { x, rotate, opacity } : { scale: 0.95, y: 10, opacity: 0.5, zIndex: -1 }} drag={isTop ? "x" : false} dragConstraints={{ left: 0, right: 0 }} onDragEnd={(e, info) => { if (info.offset.x > 100 || info.offset.x < -100) handleVote(card.id); }} className="absolute inset-0 bg-space-surface border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden touch-none">
                <div className="h-2/3 bg-black/50 flex items-center justify-center border-b border-white/5 p-4"><div className="w-48 h-48 grid border border-white/10 opacity-90" style={{ gridTemplateColumns: `repeat(16, minmax(0, 1fr))` }}>{card.art.map((color, i) => <div key={i} style={{ backgroundColor: color }} />)}</div></div>
                <div className="flex-1 p-5 flex flex-col justify-center"><h3 className="font-['Orbitron'] text-xl text-white">{card.title}</h3><p className="text-sm text-slate-400 mt-1">By {card.author}</p></div>
              </motion.div>
            );
          }).reverse() 
        ) : (<div className="text-slate-400 font-['Orbitron'] text-center">No more art to curate!<br/><span className="text-sm mt-2 block">Check back later.</span></div>)}
      </div>
      <div className="flex gap-8 mt-10"><button onClick={() => cards.length && handleVote(cards[0].id)} className="w-16 h-16 rounded-full bg-space-surface border border-neon-pink flex items-center justify-center text-neon-pink active:scale-90 z-20"><X size={30} strokeWidth={3} /></button><button onClick={() => cards.length && handleVote(cards[0].id)} className="w-16 h-16 rounded-full bg-space-surface border border-mint flex items-center justify-center text-mint active:scale-90 z-20"><Heart size={30} strokeWidth={3} fill="#10b981" /></button></div>
    </div>
  );
};

const ArcadeTab = ({ openSpeedrun }) => (
  <div className="flex flex-col w-full h-full px-4 pt-6 overflow-y-auto pb-24">
    <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider mb-6 uppercase">Arcade</h2>
    <div className="bg-gradient-to-br from-mint/20 to-black/90 border border-mint rounded-2xl p-5 mb-6 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-mint/10 rounded-full blur-3xl"></div>
      <div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-white font-['Orbitron'] flex items-center gap-2"><Timer className="text-mint" size={20}/> Speedrun</h3><span className="bg-neon-pink text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider animate-pulse">Live</span></div>
      <p className="text-sm text-slate-300 mb-4">Prompt: <strong className="text-mint">Cyber-Sword</strong></p>
      <div className="flex items-center justify-between border-t border-white/10 pt-3"><span className="text-xs text-slate-400 font-bold uppercase">Time: 60s</span><span className="text-xs text-fbbf24 font-bold uppercase">Reward: 500 $PIX</span></div>
      <button onClick={openSpeedrun} className="w-full mt-4 py-3 bg-mint text-black font-black rounded-xl font-['Orbitron'] uppercase tracking-widest hover:bg-mint-glow transition-all">Start Run</button>
    </div>
    <div className="mb-4">
      <h3 className="text-lg font-bold text-white font-['Orbitron'] tracking-wider mb-4 flex items-center gap-2"><Swords className="text-fbbf24" size={20}/> Wager Arena</h3>
      <div className="space-y-3">
        {[{ p1: "NeonGod", p2: "VoidWalker", pool: "1,000", status: "Voting" }, { p1: "PixelQueen", p2: "Waiting...", pool: "250", status: "Open" }].map((match, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col relative overflow-hidden">
             {match.status === 'Voting' && <div className="absolute left-0 top-0 w-1 h-full bg-fbbf24"></div>}{match.status === 'Open' && <div className="absolute left-0 top-0 w-1 h-full bg-mint"></div>}
             <div className="flex justify-between items-center mb-3"><span className="text-sm font-bold text-mint">{match.p1}</span><span className="text-xs text-slate-500 font-bold px-2 italic">VS</span><span className={`text-sm font-bold ${match.status === 'Open' ? 'text-slate-500 border border-dashed border-slate-500 px-2 py-0.5 rounded' : 'text-neon-pink'}`}>{match.p2}</span></div>
             <div className="flex justify-between items-center pt-3 border-t border-white/5"><span className="text-xs text-fbbf24 font-bold uppercase">{match.pool} $PIX Pool</span><button className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded ${match.status === 'Open' ? 'bg-mint text-black' : 'bg-white/10 text-slate-300'}`}>{match.status === 'Open' ? 'Accept' : 'Spectate'}</button></div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-3 border border-dashed border-white/20 text-slate-300 font-bold rounded-xl font-['Orbitron'] uppercase tracking-widest hover:bg-white/5 transition-all">Create Match</button>
    </div>
  </div>
);

const EconomyTab = () => (
  <div className="flex flex-col w-full h-full px-4 pt-6 overflow-y-auto pb-24">
    <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider mb-6 uppercase">Tokenomics</h2>
    <div className="bg-gradient-to-br from-mint/10 to-black/80 border border-mint rounded-2xl p-6 mb-4 relative overflow-hidden"><div className="absolute -right-10 -top-10 w-32 h-32 bg-mint/20 rounded-full blur-3xl" /><h3 className="text-3xl font-['Orbitron'] text-mint font-bold mb-1 shadow-mint-glow">12,450 <span className="text-lg">$PIX</span></h3><p className="text-xs text-mint/70 mb-4 uppercase tracking-widest font-bold">Utility Token</p></div>
    <div className="bg-gradient-to-br from-neon-pink/10 to-black/80 border border-neon-pink rounded-2xl p-6 relative overflow-hidden"><div className="absolute -right-10 -top-10 w-32 h-32 bg-neon-pink/20 rounded-full blur-3xl" /><h3 className="text-3xl font-['Orbitron'] text-neon-pink font-bold mb-1">0.00 <span className="text-lg">$MINT</span></h3><p className="text-xs text-neon-pink/70 mb-4 uppercase tracking-widest font-bold">On-chain Airdrop (TON)</p><button className="w-full mt-5 py-3 rounded-lg font-bold bg-[#3390ec] hover:bg-[#2b7bc9] transition-colors flex items-center justify-center gap-2"><Wallet size={20}/> Connect TON Wallet</button></div>
  </div>
);

const ProfileTab = ({ openSettings, openLeaderboard, savedArts, openMint }) => (
  <div className="flex flex-col w-full h-full px-4 pt-6 overflow-y-auto pb-24">
    <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider uppercase">Pilot Auth</h2><button onClick={openSettings} className="p-2 text-slate-400 hover:text-mint transition-colors"><Settings size={20} /></button></div>
    <div className="bg-space-surface border border-white/10 rounded-2xl p-5 mb-6 flex items-center gap-4 relative overflow-hidden"><div className="w-16 h-16 rounded-full bg-gradient-to-tr from-mint to-neon-pink p-1"><div className="w-full h-full bg-black rounded-full border-2 border-black flex items-center justify-center overflow-hidden"><div className="w-full h-full bg-white/10 grid grid-cols-2"><div className="bg-mint/80"></div><div className="bg-neon-pink/80"></div><div className="bg-fbbf24/80"></div><div className="bg-3b82f6/80"></div></div></div></div><div className="flex-1"><h3 className="text-xl font-bold text-white font-['Orbitron'] flex items-center gap-2">@PixelPunk <span className="bg-fbbf24 text-black text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase">PRO</span></h3><p className="text-sm text-slate-400">Level 12 Creator</p></div></div>
    <div className="grid grid-cols-2 gap-4 mb-6"><div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center"><Flame size={28} className="text-neon-pink mb-2" /><span className="text-2xl font-black font-['Orbitron'] text-white">14</span><span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Day Streak</span></div><button onClick={openLeaderboard} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-left"><Medal size={28} className="text-fbbf24 mb-2" /><span className="text-2xl font-black font-['Orbitron'] text-white">4,050</span><span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rank: #42</span></button></div>

    <div className="mb-2">
      <h3 className="text-lg font-bold text-white font-['Orbitron'] tracking-wider mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-mint" /> My Arts</h3>
      <div className="grid grid-cols-2 gap-3">
        {savedArts.length === 0 ? (
          <div className="col-span-2 text-center text-slate-500 py-6 border border-dashed border-white/10 rounded-xl">No art saved yet. Head to Create!</div>
        ) : (
          savedArts.map(art => (
            <div key={art.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center">
              <div className="w-full aspect-square bg-black border border-white/5 grid rounded" style={{ gridTemplateColumns: `repeat(${art.gridSize || 16}, minmax(0, 1fr))` }}>
                {art.pixels.map((color, i) => <div key={i} style={{ backgroundColor: color }} />)}
              </div>
              <p className="text-white text-xs font-bold mt-3 font-['Orbitron'] truncate w-full text-center">{art.title}</p>
              {art.minted ? (
                <span className="text-mint text-[10px] font-bold mt-2 uppercase border border-mint/30 bg-mint/10 px-3 py-1 rounded-full tracking-wider w-full text-center">Minted</span>
              ) : (
                <button onClick={() => openMint(art)} className="mt-2 w-full py-2 bg-mint text-black text-[10px] font-black rounded hover:bg-mint-glow font-['Orbitron'] uppercase tracking-widest">Mint NFT</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('Create');
  const [activeModal, setActiveModal] = useState(null);
  const [savedArts, setSavedArts] = useState([]);
  const [selectedArtForMint, setSelectedArtForMint] = useState(null);

  useEffect(() => { WebApp.ready(); WebApp.expand(); WebApp.setHeaderColor('#030712'); }, []);

  const handleSaveArt = (newArt) => { setSavedArts([newArt, ...savedArts]); setActiveTab('Profile'); };
  const handleConfirmMint = (artId) => { setSavedArts(savedArts.map(art => art.id === artId ? { ...art, minted: true } : art)); };

  const tabs = [{ id: 'Create', icon: Grid3X3 }, { id: 'Curate', icon: Layers }, { id: 'Arcade', icon: Gamepad2 }, { id: 'Economy', icon: Wallet }, { id: 'Profile', icon: User }];

  return (
    <div className="bg-space-base text-slate-100 h-screen w-full flex flex-col font-sans select-none overflow-hidden relative">
       <div className="flex-1 relative">
         <AnimatePresence mode="wait">
           <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="absolute inset-0">
             {activeTab === 'Create' && <CreateTab openQuests={() => setActiveModal('quests')} onSaveArt={handleSaveArt} />}
             {activeTab === 'Curate' && <CurateTab />}
             {activeTab === 'Arcade' && <ArcadeTab openSpeedrun={() => setActiveModal('speedrun')} />}
             {activeTab === 'Economy' && <EconomyTab />}
             {activeTab === 'Profile' && <ProfileTab openSettings={() => setActiveModal('settings')} openLeaderboard={() => setActiveModal('leaderboard')} savedArts={savedArts} openMint={(art) => { setSelectedArtForMint(art); setActiveModal('mint'); }} />}
           </motion.div>
         </AnimatePresence>
       </div>

       <div className="h-20 bg-[#030712]/95 backdrop-blur-lg border-t border-mint/20 px-2 flex justify-between items-center pb-safe z-40 relative">
         {tabs.map((tab) => {
           const Icon = tab.icon; const isActive = activeTab === tab.id;
           return (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative flex-1 flex flex-col items-center justify-center h-full">
               <motion.div animate={{ scale: isActive ? 1.1 : 1, color: isActive ? '#10b981' : '#64748b' }} className="mb-1"><Icon strokeWidth={isActive ? 2.5 : 2} size={22} /></motion.div>
               <motion.span animate={{ color: isActive ? '#10b981' : '#64748b' }} className="text-[9px] font-bold tracking-wide uppercase font-['Rajdhani']">{tab.id}</motion.span>
             </button>
           );
         })}
       </div>

       <AnimatePresence>
         {activeModal === 'quests' && <QuestsModal onClose={() => setActiveModal(null)} />}
         {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} />}
         {activeModal === 'leaderboard' && <LeaderboardModal onClose={() => setActiveModal(null)} />}
         {activeModal === 'speedrun' && <SpeedrunModal onClose={() => setActiveModal(null)} />}
         {activeModal === 'mint' && <MintModal art={selectedArtForMint} onClose={() => {setActiveModal(null); setSelectedArtForMint(null);}} onConfirm={handleConfirmMint} />}
       </AnimatePresence>
    </div>
  );
};

export default App;