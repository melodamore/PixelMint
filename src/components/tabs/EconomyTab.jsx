import React from 'react';
import { Wallet } from 'lucide-react';

const EconomyTab = () => (
  <div className="flex flex-col w-full h-full px-4 pt-6 overflow-y-auto pb-24">
    <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider mb-6 uppercase">Tokenomics</h2>
    <div className="bg-gradient-to-br from-mint/10 to-black/80 border border-mint rounded-2xl p-6 mb-4 relative overflow-hidden">
      <h3 className="text-3xl font-['Orbitron'] text-mint font-bold mb-1 shadow-mint-glow">
        12,450 <span className="text-lg">$PIX</span>
      </h3>
    </div>
    <div className="bg-gradient-to-br from-neon-pink/10 to-black/80 border border-neon-pink rounded-2xl p-6 relative overflow-hidden">
      <h3 className="text-3xl font-['Orbitron'] text-neon-pink font-bold mb-1">
        0.00 <span className="text-lg">$MINT</span>
      </h3>
      <button className="w-full mt-5 py-3 rounded-lg font-bold bg-[#3390ec] hover:bg-[#2b7bc9] transition-colors flex items-center justify-center gap-2">
        <Wallet size={20} /> Connect TON Wallet
      </button>
    </div>
  </div>
);

export default EconomyTab;
