import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Grid3X3, Gamepad2, Wallet, User, Trash2, Heart, X, Zap, Flame, Trophy, Image as ImageIcon, Settings, Bell, Target, ChevronRight, Upload, Crown, Medal, Layers as LayersIcon, Timer, Swords, ZoomIn, ZoomOut, Maximize, ChevronDown, Undo, Redo, Grid as GridIcon, SplitSquareHorizontal, Film, Plus, Play, Pause, Eye, EyeOff, Lock, Unlock, Copy } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

// --- MODALS ---
const DangerModal = ({ title, desc, onAccept, onDecline }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
    <div className="bg-space-surface border border-neon-pink rounded-3xl w-full max-w-sm p-6 text-center shadow-[0_0_50px_rgba(244,63,94,0.2)]">
      <Trash2 size={40} className="text-neon-pink mx-auto mb-4" />
      <h3 className="text-xl font-black text-white font-['Orbitron'] mb-2 uppercase">{title}</h3>
      <p className="text-slate-400 text-sm mb-6">{desc}</p>
      <div className="flex gap-3">
        <button onClick={onDecline} className="flex-1 py-3 rounded-xl font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 uppercase tracking-widest font-['Orbitron']">Cancel</button>
        <button onClick={onAccept} className="flex-1 py-3 rounded-xl font-bold text-black bg-neon-pink hover:bg-red-500 uppercase tracking-widest font-['Orbitron']">Confirm</button>
      </div>
    </div>
  </motion.div>
);

const LayersModal = ({ layers, currLayer, setCurrLayer, addLayer, toggleVis, deleteLayer, onClose }) => (
  <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="absolute right-0 top-0 bottom-20 w-64 bg-space-surface border-l border-white/10 shadow-2xl z-50 flex flex-col">
    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
      <h3 className="font-['Orbitron'] font-bold text-white flex items-center gap-2"><LayersIcon size={16}/> Layers</h3>
      <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {layers.map((l, i) => (
        <div key={i} onClick={() => setCurrLayer(i)} className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${currLayer === i ? 'bg-mint/10 border-mint' : 'bg-white/5 border-white/10'}`}>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); toggleVis(i); }} className="text-slate-400 hover:text-white">{l.visible ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
            <span className={`text-sm font-bold ${currLayer === i ? 'text-mint' : 'text-slate-300'}`}>Layer {i + 1}</span>
          </div>
          {layers.length > 1 && <button onClick={(e) => { e.stopPropagation(); deleteLayer(i); }} className="text-slate-500 hover:text-neon-pink"><Trash2 size={14}/></button>}
        </div>
      )).reverse()}
    </div>
    <div className="p-4 border-t border-white/10">
      <button onClick={addLayer} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center justify-center gap-2"><Plus size={16}/> New Layer</button>
    </div>
  </motion.div>
);

// --- CREATE TAB ---
const CreateTab = ({ onSaveArt }) => {
  const [gridSize, setGridSize] = useState(16);
  const [color, setColor] = useState('#10b981');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  
  // Menus
  const [activeMenu, setActiveMenu] = useState(null); // 'grid', 'sym', null
  const [showLayers, setShowLayers] = useState(false);
  const [dangerAction, setDangerAction] = useState(null); // { type, payload }

  // Modes & Tools
  const [symmetry, setSymmetry] = useState('none'); // none, horizontal, vertical, both
  const [isAnimMode, setIsAnimMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Data Engine: frames[f].layers[l] = { pixels, visible }
  const createLayer = () => ({ pixels: Array(gridSize * gridSize).fill('transparent'), visible: true });
  const [frames, setFrames] = useState([ { layers: [createLayer()] } ]);
  const [currF, setCurrF] = useState(0);
  const [currL, setCurrL] = useState(0);
  const [history, setHistory] = useState([]);

  // Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const lastTouch = useRef(null);

  // Animation Loop
  useEffect(() => {
    let interval;
    if (isPlaying && isAnimMode) {
      interval = setInterval(() => setCurrF(f => (f + 1) % frames.length), 200); // 5fps
    }
    return () => clearInterval(interval);
  }, [isPlaying, isAnimMode, frames.length]);

  const saveState = () => setHistory(prev => [...prev, JSON.stringify(frames)].slice(-10));

  const applyGridSize = (size) => {
    setGridSize(size);
    setFrames([{ layers: [{ pixels: Array(size * size).fill('transparent'), visible: true }] }]);
    setCurrF(0); setCurrL(0); setHistory([]); setZoom(1); setPan({x:0,y:0});
    setDangerAction(null); setActiveMenu(null);
  };

  const getSymIndices = (index, size, mode) => {
    const x = index % size; const y = Math.floor(index / size);
    const indices = [index];
    if (mode === 'horizontal' || mode === 'both') indices.push(y * size + (size - 1 - x));
    if (mode === 'vertical' || mode === 'both') indices.push((size - 1 - y) * size + x);
    if (mode === 'both') indices.push((size - 1 - y) * size + (size - 1 - x));
    return [...new Set(indices)];
  };

  const paintPixel = (index) => {
    if (!isDrawing || isPlaying) return;
    setFrames(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const targetLayer = copy[currF].layers[currL];
      if (!targetLayer.visible) return prev;
      let changed = false;
      getSymIndices(index, gridSize, symmetry).forEach(idx => {
        if (targetLayer.pixels[idx] !== color) { targetLayer.pixels[idx] = color; changed = true; }
      });
      return changed ? copy : prev;
    });
  };

  // Touch logic
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) { setIsDrawing(false); lastTouch.current = { dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), midX: (e.touches[0].clientX + e.touches[1].clientX)/2, midY: (e.touches[0].clientY + e.touches[1].clientY)/2 }; }
    else if (e.touches.length === 1 && !isPlaying) { saveState(); setIsDrawing(true); const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY); if (el?.dataset.idx) paintPixel(Number(el.dataset.idx)); }
  };
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouch.current) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (lastTouch.current.dist === 0) return;
      const midX = (e.touches[0].clientX + e.touches[1].clientX)/2; const midY = (e.touches[0].clientY + e.touches[1].clientY)/2;
      setZoom(z => Math.min(Math.max(0.5, z * (dist / lastTouch.current.dist)), 5));
      setPan(p => ({ x: p.x + (midX - lastTouch.current.midX), y: p.y + (midY - lastTouch.current.midY) }));
      lastTouch.current = { dist, midX, midY };
    } else if (e.touches.length === 1 && isDrawing) {
      const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      if (el?.dataset.idx) paintPixel(Number(el.dataset.idx));
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full pt-4 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center w-full px-4 mb-3 z-30 relative">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">MINT</h2>
        <div className="flex gap-2 items-center relative">
          
          {/* Grid Dropdown */}
          <div className="relative">
            <button onClick={() => setActiveMenu(activeMenu === 'grid' ? null : 'grid')} className="flex items-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-slate-300 font-['Orbitron']">
              {gridSize}x{gridSize} <ChevronDown size={14} />
            </button>
            {activeMenu === 'grid' && (
              <div className="absolute right-0 top-full mt-2 bg-space-surface border border-white/10 rounded-lg shadow-xl flex flex-col overflow-hidden w-24 backdrop-blur-md">
                {[16, 24, 32, 48, 64].map(s => (
                  <button key={s} onClick={() => { setActiveMenu(null); if(frames[0].layers[0].pixels.some(p => p !== 'transparent')) setDangerAction({type: 'grid', payload: s}); else applyGridSize(s); }} className="px-4 py-2 text-sm text-left hover:bg-white/10 text-white font-['Orbitron'] border-b border-white/5">{s}x{s}</button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setDangerAction({type: 'clear'})} className="p-2 text-slate-400 hover:text-neon-pink"><Trash2 size={18} /></button>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="w-[90vw] max-w-[350px] flex justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-2 mb-3 z-20">
         <div className="flex gap-1">
            <button onClick={() => { if(history.length){ setFrames(JSON.parse(history[history.length-1])); setHistory(h => h.slice(0, -1)); } }} disabled={!history.length} className="p-1.5 text-slate-300 disabled:opacity-30"><Undo size={18}/></button>
            <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 ${showGrid ? 'text-mint' : 'text-slate-500'}`}><GridIcon size={18}/></button>
         </div>

         {/* Symmetry Dropdown */}
         <div className="relative border-l border-white/10 pl-2">
            <button onClick={() => setActiveMenu(activeMenu === 'sym' ? null : 'sym')} className="relative p-1.5 text-slate-300">
               <SplitSquareHorizontal size={18} className={symmetry !== 'none' ? 'text-fbbf24' : ''}/>
               {symmetry !== 'none' && <span className="absolute -top-1 -right-1 text-[8px] font-black text-black bg-fbbf24 rounded px-0.5">{symmetry === 'horizontal' ? 'X' : symmetry === 'vertical' ? 'Y' : 'XY'}</span>}
            </button>
            {activeMenu === 'sym' && (
              <div className="absolute left-0 top-full mt-2 bg-space-surface border border-white/10 rounded-lg shadow-xl flex flex-col overflow-hidden w-32 backdrop-blur-md z-50">
                {['none', 'horizontal', 'vertical', 'both'].map(s => (
                  <button key={s} onClick={() => { setSymmetry(s); setActiveMenu(null); }} className="px-4 py-2 text-sm text-left hover:bg-white/10 text-white capitalize">{s}</button>
                ))}
              </div>
            )}
         </div>

         <div className="flex gap-2 border-l border-white/10 pl-2 items-center">
            <button onClick={() => setShowLayers(true)} className="flex items-center text-xs font-bold text-slate-400 gap-1 bg-white/5 px-2 py-1 rounded hover:bg-white/10"><LayersIcon size={14}/> L{currL + 1}</button>
            <button onClick={() => { setIsAnimMode(!isAnimMode); setIsPlaying(false); }} className={`flex items-center text-xs font-bold gap-1 px-2 py-1 rounded ${isAnimMode ? 'bg-mint text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><Film size={14}/> {isAnimMode ? 'Anim' : 'Draw'}</button>
         </div>
      </div>

      {/* Animation Timeline (Conditional) */}
      {isAnimMode && (
        <div className="w-[90vw] max-w-[350px] flex items-center gap-2 mb-3 bg-black/40 p-2 rounded-lg border border-white/5 overflow-x-auto">
          <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 rounded-full ${isPlaying ? 'bg-neon-pink text-white' : 'bg-mint text-black'}`}>{isPlaying ? <Pause size={14}/> : <Play size={14}/>}</button>
          {frames.map((_, i) => (
            <button key={i} onClick={() => { setCurrF(i); setIsPlaying(false); }} className={`min-w-[30px] h-8 rounded border ${currF === i ? 'border-mint bg-mint/20 text-mint' : 'border-white/10 text-slate-500'} font-bold text-xs`}>{i+1}</button>
          ))}
          <button onClick={() => { saveState(); setFrames(f => [...f, { layers: [createLayer()] }]); setCurrF(frames.length); }} className="p-2 text-slate-400 hover:text-white"><Plus size={16}/></button>
          <button onClick={() => { saveState(); setFrames(f => [...f, JSON.parse(JSON.stringify(f[currF]))]); setCurrF(frames.length); }} className="p-2 text-slate-400 hover:text-white"><Copy size={16}/></button>
        </div>
      )}

      {/* Canvas */}
      <div className="relative w-[90vw] max-w-[350px] aspect-square overflow-hidden rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-space-surface backdrop-blur-xl border-2 border-white/10 touch-none">
        {/* Zoom Controls */}
        <div className="absolute right-2 top-2 z-40 flex flex-col gap-2 bg-black/50 p-1 rounded-lg border border-white/10 backdrop-blur-md">
          <button onClick={() => setZoom(z => Math.min(z + 0.5, 5))} className="p-1.5 text-white hover:text-mint"><ZoomIn size={18}/></button>
          <button onClick={() => {setZoom(1); setPan({x:0, y:0})}} className="p-1.5 text-white hover:text-mint"><Maximize size={18}/></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="p-1.5 text-white hover:text-mint"><ZoomOut size={18}/></button>
        </div>

        <div className="w-full h-full origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          {frames[currF].layers.map((layer, lIdx) => (
             layer.visible && (
               <div key={lIdx} className="absolute inset-0 grid p-1 pointer-events-none" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, opacity: isAnimMode ? 1 : (lIdx > currL ? 0.3 : 1) }}>
                  {layer.pixels.map((px, i) => <div key={i} className={`w-full h-full ${showGrid && !isPlaying ? 'border-[0.5px] border-white/5' : ''}`} style={{ backgroundColor: px }} />)}
               </div>
             )
          ))}
          {/* Interaction Overlay */}
          <div className="absolute inset-0 grid p-1 z-30" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={() => {setIsDrawing(false); lastTouch.current = null;}} onMouseDown={() => {saveState(); setIsDrawing(true);}} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}>
             {Array(gridSize*gridSize).fill(0).map((_, idx) => <div key={idx} data-idx={idx} onMouseDown={() => paintPixel(idx)} onMouseEnter={() => paintPixel(idx)} className="w-full h-full" />)}
          </div>
        </div>
      </div>

      {/* Palette */}
      <div className="flex gap-4 mt-4 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10 z-10 overflow-x-auto w-[90vw] max-w-[350px]">
        {['#10b981', '#f43f5e', '#3b82f6', '#fbbf24', '#a855f7', '#ffffff', '#000000', 'transparent'].map((c) => (
          <button key={c} onClick={() => setColor(c)} className={`min-w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c === 'transparent' ? '#1f2937' : c, backgroundImage: c === 'transparent' ? 'radial-gradient(#4b5563 1px, transparent 1px)' : 'none', backgroundSize: c === 'transparent' ? '4px 4px' : 'auto' }} />
        ))}
      </div>
      
      <button onClick={() => onSaveArt({ id: Date.now(), title: `Mint #${Math.floor(Math.random()*1000)}`, pixels: frames[0].layers[0].pixels, isAnim: isAnimMode })} className="mt-4 w-[90vw] max-w-[350px] py-4 rounded-xl font-['Orbitron'] font-bold text-black bg-mint shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-widest z-10">Save to Vault</button>

      {/* Overlays */}
      <AnimatePresence>
         {showLayers && <LayersModal layers={frames[currF].layers} currLayer={currL} setCurrLayer={setCurrL} addLayer={() => { saveState(); setFrames(f => { const copy = [...f]; copy[currF].layers.push(createLayer()); return copy; }); setCurrL(frames[currF].layers.length); }} toggleVis={(idx) => setFrames(f => { const copy = JSON.parse(JSON.stringify(f)); copy[currF].layers[idx].visible = !copy[currF].layers[idx].visible; return copy; })} deleteLayer={(idx) => { saveState(); setFrames(f => { const copy = JSON.parse(JSON.stringify(f)); copy[currF].layers.splice(idx, 1); return copy; }); setCurrL(Math.max(0, currL - 1)); }} onClose={() => setShowLayers(false)} />}
         {dangerAction && <DangerModal title={dangerAction.type === 'clear' ? 'Clear Canvas' : 'Resize Grid'} desc="This will permanently delete your current drawing and frames. Proceed?" onDecline={() => setDangerAction(null)} onAccept={() => { if(dangerAction.type === 'grid') applyGridSize(dangerAction.payload); else applyGridSize(gridSize); }} />}
      </AnimatePresence>
    </div>
  );
};

// --- CURATE TAB (Professional UI Update) ---
const CurateTab = () => {
  const [cards, setCards] = useState([1,2,3]);
  const x = useMotionValue(0); const rotate = useTransform(x, [-200, 200], [-15, 15]); const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  return (
    <div className="flex flex-col w-full h-full px-4 pt-6 pb-24 overflow-hidden relative">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">CURATE</h2>
           <p className="text-xs text-mint animate-pulse font-bold tracking-widest uppercase">Global Feed Live</p>
        </div>
        <div className="flex gap-2">
           <div className="flex flex-col items-end"><span className="text-[10px] text-slate-400 uppercase">Voting Power</span><span className="text-sm font-bold text-fbbf24">84% <Zap size={10} className="inline"/></span></div>
        </div>
      </div>

      {/* Deep Filtering UI */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2 no-scrollbar">
        {['🔥 Trending', '✨ Newest', '💎 High Wager', '🏆 Top Ranked', '🎨 Abstract'].map((f, i) => (
          <button key={i} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold border ${i===0 ? 'bg-mint text-black border-mint' : 'bg-white/5 text-slate-300 border-white/10'}`}>{f}</button>
        ))}
      </div>

      {/* Swipe Engine */}
      <div className="relative w-full max-w-[340px] mx-auto aspect-[4/5] flex items-center justify-center mt-4">
        {cards.length > 0 ? cards.map((c, i) => (
          <motion.div key={c} style={i===0 ? { x, rotate, opacity } : { scale: 0.95, y: 10, opacity: 0.5, zIndex: -1 }} drag={i===0 ? "x" : false} dragConstraints={{ left: 0, right: 0 }} onDragEnd={(e, info) => { if(Math.abs(info.offset.x) > 100) { setCards(p => p.slice(1)); x.set(0); } }} className="absolute inset-0 bg-space-surface border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden touch-none">
            <div className="absolute top-4 left-4 z-10 flex gap-2"><span className="bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-mint border border-mint/30 uppercase tracking-widest">Pixel Art</span></div>
            <div className="h-2/3 bg-black/80 flex items-center justify-center border-b border-white/5 p-4 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-mint/10 to-transparent"></div>
               <Gamepad2 size={80} className="text-mint opacity-40"/>
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

// --- ARCADE TAB (Professional 'Coming Soon') ---
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

// --- PROFILE TAB (Massive Feature Mockup) ---
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

// (EconomyTab remains same as previous version - simple tokenomics)
const EconomyTab = () => ( <div className="flex flex-col w-full h-full px-4 pt-6 overflow-y-auto pb-24"> <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider mb-6 uppercase">Tokenomics</h2> <div className="bg-gradient-to-br from-mint/10 to-black/80 border border-mint rounded-2xl p-6 mb-4 relative overflow-hidden"><h3 className="text-3xl font-['Orbitron'] text-mint font-bold mb-1 shadow-mint-glow">12,450 <span className="text-lg">$PIX</span></h3></div> <div className="bg-gradient-to-br from-neon-pink/10 to-black/80 border border-neon-pink rounded-2xl p-6 relative overflow-hidden"><h3 className="text-3xl font-['Orbitron'] text-neon-pink font-bold mb-1">0.00 <span className="text-lg">$MINT</span></h3><button className="w-full mt-5 py-3 rounded-lg font-bold bg-[#3390ec] hover:bg-[#2b7bc9] transition-colors flex items-center justify-center gap-2"><Wallet size={20}/> Connect TON Wallet</button></div> </div> );

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('Create');
  const [savedArts, setSavedArts] = useState([]);

  useEffect(() => { WebApp.ready(); WebApp.expand(); WebApp.setHeaderColor('#030712'); }, []);

  const tabs = [{ id: 'Create', icon: Grid3X3 }, { id: 'Curate', icon: LayersIcon }, { id: 'Arcade', icon: Gamepad2 }, { id: 'Economy', icon: Wallet }, { id: 'Profile', icon: User }];

  return (
    <div className="bg-space-base text-slate-100 h-screen w-full flex flex-col font-sans select-none overflow-hidden relative">
       <div className="flex-1 relative">
         <AnimatePresence mode="wait">
           <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="absolute inset-0">
             {activeTab === 'Create' && <CreateTab onSaveArt={(art) => { setSavedArts([art, ...savedArts]); setActiveTab('Profile'); }} />}
             {activeTab === 'Curate' && <CurateTab />}
             {activeTab === 'Arcade' && <ArcadeTab />}
             {activeTab === 'Economy' && <EconomyTab />}
             {activeTab === 'Profile' && <ProfileTab savedArts={savedArts} />}
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
    </div>
  );
};

export default App;