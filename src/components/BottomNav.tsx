import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentScreen, setCurrentScreen, cartCount } = useApp();

  // If in admin mode, checkout, or PDP, we either show specialized actions or default bar
  if (currentScreen === 'admin') {
    return null; // Admin has its own dock
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-[#fff8f5]/95 backdrop-blur-md border-t border-[#dbc0c1]/40 shadow-[0_-4px_20px_rgba(102,10,35,0.06)] md:hidden">
      <div className="max-w-md mx-auto flex justify-around items-center px-2 py-1.5">
        {/* Tab 1: Catalogue */}
        <button
          onClick={() => setCurrentScreen('catalogue')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
            currentScreen === 'catalogue' || currentScreen === 'home'
              ? 'text-[#450011] font-bold'
              : 'text-[#554243] hover:text-[#450011]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              currentScreen === 'catalogue' || currentScreen === 'home' ? 'material-symbols-filled' : ''
            }`}
          >
            flare
          </span>
          <span className="text-[11px]">Catalogue</span>
        </button>

        {/* Tab 2: Hampers */}
        <button
          onClick={() => setCurrentScreen('hampers')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
            currentScreen === 'hampers'
              ? 'text-[#450011] font-bold'
              : 'text-[#554243] hover:text-[#450011]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              currentScreen === 'hampers' ? 'material-symbols-filled' : ''
            }`}
          >
            local_mall
          </span>
          <span className="text-[11px]">Hampers</span>
        </button>

        {/* Tab 3: Orders (Tracking) */}
        <button
          onClick={() => setCurrentScreen('tracking')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
            currentScreen === 'tracking'
              ? 'text-[#450011] font-bold'
              : 'text-[#554243] hover:text-[#450011]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              currentScreen === 'tracking' ? 'material-symbols-filled' : ''
            }`}
          >
            receipt_long
          </span>
          <span className="text-[11px]">Orders</span>
        </button>

        {/* Tab 4: Concierge (Direct WhatsApp) */}
        <button
          onClick={() => setCurrentScreen('concierge')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
            currentScreen === 'concierge'
              ? 'text-[#450011] font-bold'
              : 'text-[#554243] hover:text-[#450011]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              currentScreen === 'concierge' ? 'material-symbols-filled' : ''
            }`}
          >
            chat
          </span>
          <span className="text-[11px]">Concierge</span>
        </button>
      </div>
    </nav>
  );
};
