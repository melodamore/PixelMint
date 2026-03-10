import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Trash2 } from 'lucide-react';

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

export default DangerModal;
