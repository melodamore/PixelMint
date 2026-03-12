import React from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Trash2, Undo, Grid as GridIcon, SplitSquareHorizontal,
  Layers as LayersIcon, Film, Pause, Play, Plus, Copy,
  ZoomIn, Maximize, ZoomOut, Pencil, Eraser, PaintBucket,
  Slash, Square, Circle, MousePointer2, Move, Hexagon, Triangle, Save,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Eye
} from 'lucide-react';
import { usePixelEngine } from '../../hooks/usePixelEngine';
import DangerModal from '../modals/DangerModal';
import LayersModal from '../modals/LayersModal';
import { createLayer } from '../../utils/canvasUtils';
import { PRESET_PALETTES, getSavedPalettes, savePalette } from '../../utils/paletteUtils';

const CreateTab = ({ onSaveArt }) => {
  const {
    activeMenu, setActiveMenu, gridSize, setDangerAction, dangerAction,
    frames, applyGridSize, history, setFrames, setHistory,
    showGrid, setShowGrid, symmetry, setSymmetry, showLayers, setShowLayers,
    currL, isAnimMode, setIsAnimMode, isPlaying, setIsPlaying, currF, setCurrF,
    saveState, zoom, setZoom, pan, setPan, canvasRef,
    handleTouchStart, handleTouchMove, handleTouchEnd,
    startInteraction, moveInteraction, endInteraction,
    color, setColor, setCurrL, activeTool, setActiveTool,
    toolOptions, setToolOptions, draftLayer, selectionMask
  } = usePixelEngine();

  const [currentPalette, setCurrentPalette] = React.useState('default');
  const [showUI, setShowUI] = React.useState(true);
  const allPalettes = { ...PRESET_PALETTES, ...getSavedPalettes() };
  const currentColors = allPalettes[currentPalette] || PRESET_PALETTES['default'];

  const tools = [
    { id: 'pencil', icon: Pencil },
    { id: 'eraser', icon: Eraser },
    { id: 'fill', icon: PaintBucket },
    { id: 'shapes', icon: Triangle },
    { id: 'select_rect', icon: MousePointer2 }
  ];

  const isShapeTool = ['line', 'rect', 'circle', 'polygon'].includes(activeTool);
  const handleShapeToolClick = () => {
    if (activeTool === 'shapes' || isShapeTool) {
       setActiveTool('pencil');
    } else {
       setActiveTool('shapes');
    }
  };


  return (
    <div className="flex flex-col items-center w-full h-full pt-4 relative">
      {showUI && (
        <>
          {/* Top Bar */}
          <div className="flex justify-between items-center w-full px-4 mb-3 z-30 relative">
            <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider">MINT</h2>
            <div className="flex gap-2 items-center relative">
              <button onClick={() => onSaveArt({ id: Date.now(), title: `Mint #${Math.floor(Math.random()*1000)}`, pixels: frames[0].layers[0].pixels, isAnim: isAnimMode, gridSize: gridSize })} className="p-2 text-slate-400 hover:text-mint"><Save size={18}/></button>

              {/* Grid Dropdown */}
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === 'grid' ? null : 'grid')} className="flex items-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-slate-300 font-['Orbitron']">
                  {gridSize}x{gridSize} <ChevronDown size={14} />
                </button>
                {activeMenu === 'grid' && (
                  <div className="absolute right-0 top-full mt-2 bg-space-surface border border-white/10 rounded-lg shadow-xl flex flex-col overflow-hidden w-24 backdrop-blur-md z-50">
                    {[16, 24, 32, 48, 64, 128, 256, 512, 1024, 2048].map(s => (
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

          {/* Tools Panel (Horizontal Scroll) */}
      <div className="w-[90vw] max-w-[350px] flex gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-2 mb-3 z-20 overflow-x-auto hide-scrollbar">
          {tools.map(t => {
             const Icon = t.icon;
             const isShapesActive = t.id === 'shapes' && (activeTool === 'shapes' || isShapeTool);
             return (
                 <button
                     key={t.id}
                     onClick={t.id === 'shapes' ? handleShapeToolClick : () => setActiveTool(t.id)}
                     className={`p-2 rounded-lg flex-shrink-0 transition-colors ${activeTool === t.id || isShapesActive ? 'bg-mint text-black' : 'text-slate-300 hover:bg-white/10'}`}
                 >
                     <Icon size={18} />
                 </button>
             )
          })}
      </div>

      <AnimatePresence>
        {(activeTool === 'shapes' || isShapeTool) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-[90vw] max-w-[350px] flex gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-2 mb-3 z-20 overflow-hidden">
                <button onClick={() => setActiveTool('line')} className={`p-2 rounded-lg flex-shrink-0 transition-colors ${activeTool === 'line' ? 'bg-mint text-black' : 'text-slate-300 hover:bg-white/10'}`}><Slash size={16} /></button>
                <button onClick={() => setActiveTool('rect')} className={`p-2 rounded-lg flex-shrink-0 transition-colors ${activeTool === 'rect' ? 'bg-mint text-black' : 'text-slate-300 hover:bg-white/10'}`}><Square size={16} /></button>
                <button onClick={() => setActiveTool('circle')} className={`p-2 rounded-lg flex-shrink-0 transition-colors ${activeTool === 'circle' ? 'bg-mint text-black' : 'text-slate-300 hover:bg-white/10'}`}><Circle size={16} /></button>
                <button onClick={() => setActiveTool('polygon')} className={`p-2 rounded-lg flex-shrink-0 transition-colors ${activeTool === 'polygon' ? 'bg-mint text-black' : 'text-slate-300 hover:bg-white/10'}`}><Hexagon size={16} /></button>
            </motion.div>
        )}
      </AnimatePresence>

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
        </>
      )}

      {/* Canvas */}
      <div className="relative w-[90vw] max-w-[350px] aspect-square overflow-hidden rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-space-surface backdrop-blur-xl border-2 border-white/10 touch-none">
        {/* Zoom & Pan Controls */}
        <div className="absolute right-2 top-2 z-40 flex flex-col gap-2 items-center">
          <div className="flex flex-col gap-1 bg-black/50 p-1 rounded-lg border border-white/10 backdrop-blur-md">
            <button onClick={() => setZoom(z => Math.min(z + 0.5, 5))} className="p-1.5 text-white hover:text-mint"><ZoomIn size={18}/></button>
            <button onClick={() => {setZoom(1); setPan({x:0, y:0})}} className="p-1.5 text-white hover:text-mint"><Maximize size={18}/></button>
            <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="p-1.5 text-white hover:text-mint"><ZoomOut size={18}/></button>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-lg border border-white/10 backdrop-blur-md mt-1">
            <button onClick={() => setPan(p => ({x: p.x + 20/zoom, y: p.y + 20/zoom}))} className="p-1 text-white hover:text-mint"><ArrowUpLeft size={16}/></button>
            <button onClick={() => setPan(p => ({x: p.x, y: p.y + 20/zoom}))} className="p-1 text-white hover:text-mint"><ArrowUp size={16}/></button>
            <button onClick={() => setPan(p => ({x: p.x - 20/zoom, y: p.y + 20/zoom}))} className="p-1 text-white hover:text-mint"><ArrowUpRight size={16}/></button>
            <button onClick={() => setPan(p => ({x: p.x + 20/zoom, y: p.y}))} className="p-1 text-white hover:text-mint"><ArrowLeft size={16}/></button>
            <div className="w-6 h-6 rounded-full bg-white/10 m-0.5"></div>
            <button onClick={() => setPan(p => ({x: p.x - 20/zoom, y: p.y}))} className="p-1 text-white hover:text-mint"><ArrowRight size={16}/></button>
            <button onClick={() => setPan(p => ({x: p.x + 20/zoom, y: p.y - 20/zoom}))} className="p-1 text-white hover:text-mint"><ArrowDownLeft size={16}/></button>
            <button onClick={() => setPan(p => ({x: p.x, y: p.y - 20/zoom}))} className="p-1 text-white hover:text-mint"><ArrowDown size={16}/></button>
            <button onClick={() => setPan(p => ({x: p.x - 20/zoom, y: p.y - 20/zoom}))} className="p-1 text-white hover:text-mint"><ArrowDownRight size={16}/></button>
          </div>
        </div>

        <div className="w-full h-full origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          {/* Main Grid Render */}
          {frames[currF].layers.map((layer, lIdx) => (
             layer.visible && (
               <div key={lIdx} className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, opacity: isAnimMode ? 1 : (lIdx > currL ? 0.3 : 1) }}>
                  {layer.pixels.map((px, i) => <div key={i} className={`w-full h-full ${showGrid && !isPlaying ? 'border-[0.5px] border-white/5' : ''}`} style={{ backgroundColor: px }} />)}
               </div>
             )
          ))}
          {/* Draft Layer for Shapes/Selection preview */}
          {draftLayer && (
               <div className="absolute inset-0 grid pointer-events-none z-20" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                  {draftLayer.pixels.map((px, i) => <div key={`draft-${i}`} className="w-full h-full" style={{ backgroundColor: px }} />)}
               </div>
          )}
          {/* Selection Mask Overlay (Marching Ants/Highlight) */}
          {selectionMask.length > 0 && (
               <div className="absolute inset-0 grid pointer-events-none z-10" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                  {Array(gridSize * gridSize).fill(null).map((_, i) => (
                      <div key={`sel-${i}`} className={`w-full h-full ${selectionMask.includes(i) ? 'bg-mint/30 border border-mint/50 animate-pulse' : ''}`} />
                  ))}
               </div>
          )}

          {/* Interaction Overlay */}
          <div
            ref={canvasRef}
            className="absolute inset-0 z-30 touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseLeave={() => endInteraction()}
            onMouseUp={() => endInteraction()}
          >
             {/* Using a single element for the grid interactions instead of many small ones,
                 then calculating the hit testing based on coordinates in the mouse handlers */}
             <div
                className="w-full h-full"
                onMouseDown={(e) => startInteraction(e.clientX, e.clientY)}
                onMouseMove={(e) => moveInteraction(e.clientX, e.clientY)}
             />
          </div>
        </div>
      </div>

      {showUI && (
        <>
          {/* Tool Options Menu */}
          <AnimatePresence>
            {['fill', 'select_wand', 'polygon', 'circle', 'rect', 'ellipse'].includes(activeTool) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="w-[90vw] max-w-[350px] bg-white/5 p-2 rounded-lg backdrop-blur-md border border-white/10 z-10 mt-2 flex flex-wrap gap-2 text-xs items-center">
                    {activeTool === 'fill' && (
                        <>
                           <span className="text-slate-400 font-bold uppercase tracking-wider">Fill Mode:</span>
                           <select value={toolOptions.fillMode} onChange={(e) => setToolOptions({...toolOptions, fillMode: e.target.value})} className="bg-space-surface border border-white/10 rounded px-2 py-1 text-white">
                               <option value="contiguous">Contiguous</option>
                               <option value="global">Global</option>
                           </select>
                        </>
                    )}
                    {['fill', 'select_wand'].includes(activeTool) && (
                        <div className="flex items-center gap-2 w-full">
                            <span className="text-slate-400 font-bold uppercase tracking-wider min-w-[70px]">Tolerance:</span>
                            <input type="range" min="0" max="1" step="0.05" value={toolOptions.fillTolerance} onChange={(e) => setToolOptions({...toolOptions, fillTolerance: parseFloat(e.target.value)})} className="flex-1 accent-mint" />
                            <span className="text-white w-8 text-right">{Math.round(toolOptions.fillTolerance * 100)}%</span>
                        </div>
                    )}
                    {['rect', 'circle', 'ellipse', 'polygon'].includes(activeTool) && (
                        <>
                           <label className="flex items-center gap-1 text-slate-300 font-bold uppercase tracking-wider">
                               <input type="checkbox" checked={toolOptions.shapeFill} onChange={(e) => setToolOptions({...toolOptions, shapeFill: e.target.checked})} className="accent-mint"/>
                               Fill Shape
                           </label>
                        </>
                    )}
                    {activeTool === 'polygon' && (
                        <div className="flex items-center gap-2 w-full mt-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider min-w-[70px]">Sides:</span>
                            <input type="range" min="3" max="12" step="1" value={toolOptions.polygonSides} onChange={(e) => setToolOptions({...toolOptions, polygonSides: parseInt(e.target.value)})} className="flex-1 accent-mint" />
                            <span className="text-white w-4 text-right">{toolOptions.polygonSides}</span>
                        </div>
                    )}
                </motion.div>
            )}
          </AnimatePresence>

          {/* Palette */}
          <div className="flex flex-col gap-2 mt-4 bg-white/5 p-3 rounded-2xl backdrop-blur-md border border-white/10 z-10 w-[90vw] max-w-[350px]">
            <div className="flex justify-between items-center mb-1">
               <select value={currentPalette} onChange={(e) => setCurrentPalette(e.target.value)} className="bg-transparent text-xs font-bold text-slate-300 font-['Orbitron'] outline-none border-b border-white/20 pb-1">
                  <option value="default" className="bg-space-surface">Default Palette</option>
                  <option value="nes" className="bg-space-surface">NES Retro</option>
                  <option value="gameboy" className="bg-space-surface">Gameboy</option>
                  <option value="pico8" className="bg-space-surface">Pico-8</option>
                  {Object.keys(getSavedPalettes()).map(p => <option key={p} value={p} className="bg-space-surface">{p}</option>)}
               </select>
               <button onClick={() => {
                  const name = prompt('Name your new palette:');
                  if(name) {
                     const customColors = Array.from(new Set(frames[0].layers[0].pixels.filter(c => c !== 'transparent'))).slice(0, 16);
                     if(customColors.length === 0) customColors.push('#ffffff');
                     customColors.push('transparent');
                     savePalette(name, customColors);
                     setCurrentPalette(name);
                  }
               }} className="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-300 hover:text-white uppercase font-bold tracking-wider">Extract</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {currentColors.map((c, i) => (
                <button key={i} onClick={() => setColor(c)} className={`min-w-8 h-8 rounded-full border-2 flex-shrink-0 transition-transform ${color === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent'}`} style={{ backgroundColor: c === 'transparent' ? '#1f2937' : c, backgroundImage: c === 'transparent' ? 'radial-gradient(#4b5563 1px, transparent 1px)' : 'none', backgroundSize: c === 'transparent' ? '4px 4px' : 'auto' }} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Floating UI Toggle */}
      <button
        onClick={() => {
           setShowUI(!showUI);
           window.dispatchEvent(new CustomEvent('toggle-bottom-nav', { detail: !showUI }));
        }}
        className="absolute bottom-4 right-4 z-50 p-3 bg-mint rounded-full text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 transition-transform"
      >
        <Eye size={24} />
      </button>

      {/* Overlays */}
      <AnimatePresence>
         {showLayers && <LayersModal layers={frames[currF].layers} currLayer={currL} setCurrLayer={setCurrL} addLayer={() => { saveState(); setFrames(f => { const copy = [...f]; copy[currF].layers.push(createLayer(gridSize)); return copy; }); setCurrL(frames[currF].layers.length); }} toggleVis={(idx) => setFrames(f => { const copy = JSON.parse(JSON.stringify(f)); copy[currF].layers[idx].visible = !copy[currF].layers[idx].visible; return copy; })} deleteLayer={(idx) => { saveState(); setFrames(f => { const copy = JSON.parse(JSON.stringify(f)); copy[currF].layers.splice(idx, 1); return copy; }); setCurrL(Math.max(0, currL - 1)); }} onClose={() => setShowLayers(false)} />}
         {dangerAction && <DangerModal title={dangerAction.type === 'clear' ? 'Clear Canvas' : 'Resize Grid'} desc="This will permanently delete your current drawing and frames. Proceed?" onDecline={() => setDangerAction(null)} onAccept={() => { if(dangerAction.type === 'grid') applyGridSize(dangerAction.payload); else applyGridSize(gridSize); }} />}
      </AnimatePresence>
    </div>
  );
};

export default CreateTab;
