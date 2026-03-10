import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, Gamepad2, Wallet, User, Trash2 } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

const GRID_SIZE = 16;

const CreateTab = () => {
  const [pixels, setPixels] = useState(Array(GRID_SIZE * GRID_SIZE).fill('transparent'));
  const [color, setColor] = useState('#10b981'); // Default Mint
  const [isDrawing, setIsDrawing] = useState(false);

  const clearCanvas = () => {
    setPixels(Array(GRID_SIZE * GRID_SIZE).fill('transparent'));
  };

  const paintPixel = (index) => {
    setPixels(prev => {
      const newPixels = [...prev];
      newPixels[index] = color;
      return newPixels;
    });
  };

  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.dataset.index) {
      paintPixel(Number(element.dataset.index));
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full pt-4">
      <div className="flex justify-between w-full px-4 mb-4">
        <h2 className="text-2xl font-black text-white font-['Orbitron'] uppercase tracking-wider">
          Mint <span className="text-mint text-sm border border-mint/30 bg-mint/10 px-2 py-1 rounded-full">8-BIT</span>
        </h2>
        <button onClick={clearCanvas} className="p-2 text-slate-400 hover:text-neon-pink transition-colors">
          <Trash2 size={20} />
        </button>
      </div>

      {/* Pixel Art Grid Container */}
      <div 
        className="w-[90vw] max-w-[350px] aspect-square bg-space-surface backdrop-blur-xl border-2 border-white/10 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] grid touch-none overflow-hidden p-1"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        onMouseLeave={() => setIsDrawing(false)}
        onMouseUp={() => setIsDrawing(false)}
        onTouchEnd={() => setIsDrawing(false)}
      >
        {pixels.map((pixelColor, index) => (
          <div
            key={index}
            data-index={index}
            onMouseDown={() => { setIsDrawing(true); paintPixel(index); }}
            onMouseEnter={() => { if (isDrawing) paintPixel(index); }}
            onTouchStart={() => { setIsDrawing(true); paintPixel(index); }}
            onTouchMove={handleTouchMove}
            className="w-full h-full border-[0.5px] border-white/5 active:scale-90 transition-transform duration-75"
            style={{ 
              backgroundColor: pixelColor === 'transparent' ? 'transparent' : pixelColor,
              boxShadow: pixelColor !== 'transparent' ? `0 0 5px ${pixelColor}` : 'none'
            }}
          />
        ))}
      </div>

      {/* Color Palette */}
      <div className="flex gap-4 mt-8 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10">
        {['#10b981', '#f43f5e', '#3b82f6', '#fbbf24', '#a855f7', '#ffffff', 'transparent'].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-125' : 'border-transparent hover:scale-110'}`}
            style={{ 
              backgroundColor: c === 'transparent' ? '#1f2937' : c, 
              boxShadow: color === c && c !== 'transparent' ? `0 0 15px ${c}` : 'none',
              backgroundImage: c === 'transparent' ? 'radial-gradient(#4b5563 1px, transparent 1px)' : 'none',
              backgroundSize: c === 'transparent' ? '4px 4px' : 'auto'
            }}
            title={c === 'transparent' ? 'Eraser' : c}
          />
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('Create');

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#030712');
  }, []);

  const tabs = [
    { id: 'Create', icon: Grid3X3 },
    { id: 'Arcade', icon: Gamepad2 },
    { id: 'Economy', icon: Wallet },
    { id: 'Profile', icon: User }
  ];

  return (
    <div className="bg-space-base text-slate-100 h-screen w-full flex flex-col font-sans select-none overflow-hidden">
       {/* Main Content Area */}
       <div className="flex-1 relative">
         <AnimatePresence mode="wait">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.2 }}
             className="absolute inset-0 flex flex-col items-center"
           >
             {activeTab === 'Create' ? <CreateTab /> : (
               <div className="flex h-full items-center justify-center">
                 <h1 className="text-3xl font-bold text-mint font-['Orbitron'] uppercase tracking-widest animate-pulse">
                   {activeTab} <span className="text-white">SYS</span>
                 </h1>
               </div>
             )}
           </motion.div>
         </AnimatePresence>
       </div>

       {/* Native App Style Bottom Navigation */}
       <div className="h-20 bg-[#030712]/95 backdrop-blur-lg border-t border-mint/20 px-4 flex justify-between items-center pb-safe z-50">
         {tabs.map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className="relative flex flex-col items-center justify-center w-full h-full"
             >
               <motion.div
                 animate={{ 
                   scale: isActive ? 1.1 : 1, 
                   color: isActive ? '#10b981' : '#64748b',
                 }}
                 className="mb-1"
               >
                 <Icon strokeWidth={isActive ? 2.5 : 2} size={24} />
               </motion.div>
               
               <motion.span 
                 animate={{ color: isActive ? '#10b981' : '#64748b' }}
                 className="text-[10px] font-bold tracking-wide uppercase font-['Rajdhani']"
               >
                 {tab.id}
               </motion.span>
             </button>
           );
         })}
       </div>
    </div>
  );
};

export default App;