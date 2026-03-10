import React from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Trash2, Undo, Grid as GridIcon, SplitSquareHorizontal,
  Layers as LayersIcon, Film, Pause, Play, Plus, Copy,
  ZoomIn, Maximize, ZoomOut
} from 'lucide-react';
import { usePixelEngine } from '../../hooks/usePixelEngine';
import DangerModal from '../modals/DangerModal';
import LayersModal from '../modals/LayersModal';
import { createLayer } from '../../utils/canvasUtils';

const CreateTab = ({ onSaveArt }) => {
  const { activeMenu, setActiveMenu, gridSize, setDangerAction, dangerAction, frames, applyGridSize, history, setFrames, setHistory, showGrid, setShowGrid, symmetry, setSymmetry, showLayers, setShowLayers, currL, isAnimMode, setIsAnimMode, isPlaying, setIsPlaying, currF, setCurrF, saveState, zoom, setZoom, pan, setPan, canvasRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseLeave, handleMouseUp, isDrawing, setIsDrawing, paintPixel, color, setColor, setCurrL } = usePixelEngine();


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
                  <button key={s} onClick={() => {
                    setActiveMenu(null);
                    if(frames[0].layers[0].pixels.some(p => p !== 'transparent')) {
                      setDangerAction({type: 'grid', payload: s});
                    } else {
                      applyGridSize(s);
                    }
                  }} className="px-4 py-2 text-sm text-left hover:bg-white/10 text-white font-['Orbitron'] border-b border-white/5">{s}x{s}</button>
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
            <button onClick={() => {
              if(history.length){
                setFrames(JSON.parse(history[history.length-1]));
                setHistory(h => h.slice(0, -1));
              }
            }} disabled={!history.length} className="p-1.5 text-slate-300 disabled:opacity-30"><Undo size={18}/></button>
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
          <button onClick={() => { saveState(); setFrames(f => [...f, { layers: [createLayer(gridSize)] }]); setCurrF(frames.length); }} className="p-2 text-slate-400 hover:text-white"><Plus size={16}/></button>
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
          <div
            ref={canvasRef}
            className="absolute inset-0 z-30 touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
          >
             {/* Using a single element for the grid interactions instead of many small ones,
                 then calculating the hit testing based on coordinates in the mouse handlers */}
             <div
                className="w-full h-full"
                onMouseDown={(e) => {
                  saveState();
                  setIsDrawing(true);
                  if (canvasRef.current) {
                    const rect = canvasRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2 - pan.x * zoom) / zoom + rect.width / 2;
                    const y = (e.clientY - rect.top - rect.height / 2 - pan.y * zoom) / zoom + rect.height / 2;

                    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                      const col = Math.floor((x / rect.width) * gridSize);
                      const row = Math.floor((y / rect.height) * gridSize);
                      paintPixel(row * gridSize + col);
                    }
                  }
                }}
                onMouseMove={(e) => {
                  if (isDrawing) {
                    if (canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const x = (e.clientX - rect.left - rect.width / 2 - pan.x * zoom) / zoom + rect.width / 2;
                      const y = (e.clientY - rect.top - rect.height / 2 - pan.y * zoom) / zoom + rect.height / 2;

                      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                        const col = Math.floor((x / rect.width) * gridSize);
                        const row = Math.floor((y / rect.height) * gridSize);
                        paintPixel(row * gridSize + col);
                      }
                    }
                  }
                }}
             />
          </div>
        </div>
      </div>

      {/* Palette */}
      <div className="flex gap-4 mt-4 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10 z-10 overflow-x-auto w-[90vw] max-w-[350px]">
        {['#10b981', '#f43f5e', '#3b82f6', '#fbbf24', '#a855f7', '#ffffff', '#000000', 'transparent'].map((c) => (
          <button key={c} onClick={() => setColor(c)} className={`min-w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c === 'transparent' ? '#1f2937' : c, backgroundImage: c === 'transparent' ? 'radial-gradient(#4b5563 1px, transparent 1px)' : 'none', backgroundSize: c === 'transparent' ? '4px 4px' : 'auto' }} />
        ))}
      </div>

      <button onClick={() => onSaveArt({ id: Date.now(), title: `Mint #${Math.floor(Math.random()*1000)}`, pixels: frames[0].layers[0].pixels, isAnim: isAnimMode, gridSize: gridSize })} className="mt-4 w-[90vw] max-w-[350px] py-4 rounded-xl font-['Orbitron'] font-bold text-black bg-mint shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-shadow uppercase tracking-widest z-10">Save to Vault</button>

      {/* Overlays */}
      <AnimatePresence>
         {showLayers && <LayersModal layers={frames[currF].layers} currLayer={currL} setCurrLayer={setCurrL} addLayer={() => { saveState(); setFrames(f => { const copy = [...f]; copy[currF].layers.push(createLayer(gridSize)); return copy; }); setCurrL(frames[currF].layers.length); }} toggleVis={(idx) => setFrames(f => { const copy = JSON.parse(JSON.stringify(f)); copy[currF].layers[idx].visible = !copy[currF].layers[idx].visible; return copy; })} deleteLayer={(idx) => { saveState(); setFrames(f => { const copy = JSON.parse(JSON.stringify(f)); copy[currF].layers.splice(idx, 1); return copy; }); setCurrL(Math.max(0, currL - 1)); }} onClose={() => setShowLayers(false)} />}
         {dangerAction && <DangerModal title={dangerAction.type === 'clear' ? 'Clear Canvas' : 'Resize Grid'} desc="This will permanently delete your current drawing and frames. Proceed?" onDecline={() => setDangerAction(null)} onAccept={() => { if(dangerAction.type === 'grid') applyGridSize(dangerAction.payload); else applyGridSize(gridSize); }} />}
      </AnimatePresence>
    </div>
  );
};

export default CreateTab;
