import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Layers as LayersIcon, Wallet, User, Grid3X3, Home as HomeIcon } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

import HomeTab from './components/tabs/HomeTab';
import CurateTab from './components/tabs/CurateTab';
import ArcadeTab from './components/tabs/ArcadeTab';
import EconomyTab from './components/tabs/EconomyTab';
import ProfileTab from './components/tabs/ProfileTab';
import CreateTab from './components/engine/CreateTab';

const App = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [savedArts, setSavedArts] = useState([]);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#030712');
  }, []);

  const tabs = [
    { id: 'Home', icon: HomeIcon },
    { id: 'Curate', icon: LayersIcon },
    { id: 'Economy', icon: Wallet },
    { id: 'Profile', icon: User }
  ];

  return (
    <div className="bg-space-base text-slate-100 h-screen w-full flex flex-col font-sans select-none overflow-hidden relative">
       <div className="flex-1 relative">
         <AnimatePresence mode="wait">
           <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="absolute inset-0">
             {activeTab === 'Home' && <HomeTab onCreateClick={() => setActiveTab('Create')} />}
             {activeTab === 'Create' && <CreateTab onSaveArt={(art) => { setSavedArts([art, ...savedArts]); setActiveTab('Profile'); }} />}
             {activeTab === 'Curate' && <CurateTab />}
             {activeTab === 'Arcade' && <ArcadeTab />}
             {activeTab === 'Economy' && <EconomyTab />}
             {activeTab === 'Profile' && <ProfileTab savedArts={savedArts} />}
           </motion.div>
         </AnimatePresence>
       </div>

       <div className="h-20 bg-[#030712]/95 backdrop-blur-lg border-t border-mint/20 px-2 flex justify-between items-center pb-safe z-40 relative">
         {tabs.slice(0, 2).map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           return (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative flex-1 flex flex-col items-center justify-center h-full group">
               <motion.div animate={{ scale: isActive ? 1.1 : 1, color: isActive ? '#10b981' : '#64748b' }} className="mb-1"><Icon strokeWidth={isActive ? 2.5 : 2} size={22} className="group-active:scale-95 transition-transform" /></motion.div>
               <motion.span animate={{ color: isActive ? '#10b981' : '#64748b' }} className="text-[9px] font-bold tracking-wide uppercase font-['Rajdhani']">{tab.id}</motion.span>
             </button>
           );
         })}

         {/* Center FAB for Create */}
         <div className="relative flex-1 flex justify-center -mt-8">
           <button
             onClick={() => setActiveTab('Create')}
             className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border-4 border-[#030712] transition-transform active:scale-90 ${activeTab === 'Create' ? 'bg-mint' : 'bg-mint/80'}`}
           >
             <Grid3X3 size={24} className={activeTab === 'Create' ? 'text-black' : 'text-black'} strokeWidth={2.5} />
           </button>
         </div>

         {tabs.slice(2, 4).map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           return (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative flex-1 flex flex-col items-center justify-center h-full group">
               <motion.div animate={{ scale: isActive ? 1.1 : 1, color: isActive ? '#10b981' : '#64748b' }} className="mb-1"><Icon strokeWidth={isActive ? 2.5 : 2} size={22} className="group-active:scale-95 transition-transform" /></motion.div>
               <motion.span animate={{ color: isActive ? '#10b981' : '#64748b' }} className="text-[9px] font-bold tracking-wide uppercase font-['Rajdhani']">{tab.id}</motion.span>
             </button>
           );
         })}
       </div>
    </div>
  );
};

export default App;