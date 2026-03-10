import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Gamepad2, Wallet, User } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

const App = () => {
  const [activeTab, setActiveTab] = useState('Create');

  // Initialize Telegram Mini App
  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
  }, []);

  const tabs = [
    { id: 'Create', icon: PlusCircle },
    { id: 'Arcade', icon: Gamepad2 },
    { id: 'Wallet', icon: Wallet },
    { id: 'Me', icon: User }
  ];

  return (
    <div className="bg-black text-white h-screen w-full overflow-hidden flex flex-col font-sans select-none">
       {/* Main 3D Content Area */}
       <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black">
         <AnimatePresence mode="wait">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 30, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -30, scale: 0.9 }}
             transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
             className="absolute inset-0 p-6 flex flex-col items-center justify-center"
           >
             {/* 3D Glassmorphism NFT Card Placeholder */}
             <motion.div 
               whileHover={{ rotateX: 10, rotateY: 10, scale: 1.05 }}
               transition={{ type: "spring", stiffness: 200 }}
               className="w-64 h-80 rounded-3xl bg-gray-900/50 backdrop-blur-xl border border-gray-700 shadow-[0_0_50px_rgba(255,255,255,0.05)] flex items-center justify-center mb-8"
               style={{ perspective: 1000 }}
             >
                <span className="text-4xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500">
                  {activeTab}
                </span>
             </motion.div>
           </motion.div>
         </AnimatePresence>
       </div>

       {/* OKX-Style Bottom Navigation */}
       <div className="h-24 bg-[#0a0a0a] border-t border-gray-800/50 px-6 flex justify-between items-center pb-6">
         {tabs.map((tab) => {
           const Icon = tab.icon;
           const isActive = activeTab === tab.id;
           
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className="relative flex flex-col items-center justify-center w-16 h-full"
             >
               {/* Active Tab Neon Indicator */}
               {isActive && (
                 <motion.div
                   layoutId="nav-indicator"
                   className="absolute top-0 w-8 h-1 bg-white rounded-b-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                 />
               )}
               
               <motion.div
                 animate={{ 
                   scale: isActive ? 1.15 : 1, 
                   color: isActive ? '#ffffff' : '#4b5563',
                   y: isActive ? -4 : 0
                 }}
                 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                 className="mt-2"
               >
                 <Icon strokeWidth={isActive ? 2.5 : 2} size={26} />
               </motion.div>
               
               <motion.span 
                 animate={{ color: isActive ? '#ffffff' : '#4b5563' }}
                 className="text-[10px] mt-1.5 font-semibold tracking-wide"
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