import React from 'react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onOpenCityModal?: () => void;
  showBack?: boolean;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCityModal,
  showBack = false,
  title,
  subtitle
}) => {
  const {
    currentScreen,
    setCurrentScreen,
    cartCount,
    selectedCity,
    currentUser,
    isAdminAuthenticated,
    triggerAutoLocation,
    isLocating
  } = useApp();

  const handleMerchantClick = () => {
    if (currentScreen === 'admin') {
      setCurrentScreen('catalogue');
    } else {
      if (isAdminAuthenticated) {
        setCurrentScreen('admin');
      } else {
        setCurrentScreen('admin-login');
      }
    }
  };

  const handleAutoGps = async () => {
    try {
      await triggerAutoLocation();
    } catch {
      if (onOpenCityModal) onOpenCityModal();
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#fff8f5]/95 backdrop-blur-md border-b border-[#dbc0c1]/40 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {showBack ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentScreen('catalogue')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#450011] hover:bg-[#ece0d9] active:scale-95 transition-all"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <div>
              <h1 className="font-playfair text-[18px] font-semibold text-[#450011] leading-tight">
                {title || 'Deepam Royal Sparks'}
              </h1>
              {subtitle && (
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#775a00]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => setCurrentScreen('catalogue')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#661023] flex items-center justify-center text-[#ffdf98] shadow-sm">
              <span className="material-symbols-outlined text-[20px] text-[#fece57] material-symbols-filled">
                stars
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-playfair text-[17px] font-semibold tracking-tight text-[#450011] leading-none">
                  Deepam Royal Sparks
                </h1>
              </div>
              <span className="text-[10px] text-[#775a00] font-semibold tracking-widest uppercase block pt-0.5">
                Sivakasi Atelier Pyrotechnics
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {/* User Profile or Login */}
          {currentUser ? (
            <button
              onClick={() => setCurrentScreen('profile')}
              className="flex items-center gap-1 bg-[#f8ebe5] px-2 py-1 rounded text-xs text-[#450011] font-bold border border-[#dbc0c1]/60 hover:bg-[#ece0d9] max-w-[85px] truncate"
              title={`Logged in as ${currentUser.name}`}
            >
              <span className="material-symbols-outlined text-[15px]">person</span>
              <span className="truncate">{currentUser.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentScreen('login')}
              className="px-2 py-1 bg-[#f8ebe5] text-[#450011] text-[11px] font-bold rounded border border-[#dbc0c1] hover:bg-[#ece0d9]"
            >
              Login
            </button>
          )}

          {/* Quick Merchant Console Switch */}
          <button
            onClick={handleMerchantClick}
            className={`px-2 py-1 rounded text-[11px] font-bold tracking-wide transition-all border ${
              currentScreen === 'admin'
                ? 'bg-[#661023] text-white border-[#661023]'
                : 'bg-[#661023]/10 text-[#661023] border-[#661023]/30 hover:bg-[#661023] hover:text-white'
            }`}
            title="Switch between Customer View and Merchant Console"
          >
            {currentScreen === 'admin' ? 'Store' : 'Admin'}
          </button>

          {/* Cart Icon with Counter */}
          <button
            onClick={() => setCurrentScreen('checkout')}
            aria-label="View Cart"
            className="relative p-2 text-[#450011] hover:text-[#661023] transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#661023] text-white text-[10px] font-bold flex items-center justify-center border border-[#fff8f5]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-strip for delivery location with Auto-GPS pinpoint button */}
      {!showBack && currentScreen !== 'admin' && (
        <div className="max-w-md mx-auto px-4 pb-2">
          <div className="bg-[#fef1ea] rounded-lg px-3 py-1.5 border border-[#dbc0c1]/40 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="material-symbols-outlined text-[#775a00] text-[16px] shrink-0 material-symbols-filled">
                local_shipping
              </span>
              <p className="text-[#201a16] truncate">
                Delivering to <span className="font-bold text-[#450011]">{selectedCity}</span>
                <span className="text-[#554243] font-normal"> (Sivakasi Direct - 48h express)</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAutoGps}
                disabled={isLocating}
                className="text-[10px] text-[#133a27] font-bold flex items-center gap-0.5 hover:underline"
                title="Detect current GPS location"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {isLocating ? 'sync' : 'my_location'}
                </span>
                <span>{isLocating ? 'Locating...' : 'GPS'}</span>
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={onOpenCityModal}
                className="text-[11px] text-[#450011] font-bold hover:underline"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
