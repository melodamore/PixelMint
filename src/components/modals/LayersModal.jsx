import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Layers as LayersIcon, X, Eye, EyeOff, Trash2, Plus } from 'lucide-react';

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

export default LayersModal;
