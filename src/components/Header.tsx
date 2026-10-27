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
    cartTotal,
    deliveryDestination,
    detectedLocation,
    locationStatus,
    locationError,
    isDeliveryAvailable,
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

  const handleGpsClick = async () => {
    try {
      await triggerAutoLocation();
    } catch {
      if (onOpenCityModal) onOpenCityModal();
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#fff8f5]/95 backdrop-blur-md border-b border-[#dbc0c1]/40 shadow-xs">
      {/* Top Main Navigation Bar: Expands seamlessly to max-w-7xl on laptop / desktop */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
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
              <h1 className="font-playfair text-[18px] sm:text-[20px] font-semibold text-[#450011] leading-tight">
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
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#661023] flex items-center justify-center text-[#ffdf98] shadow-sm">
              <span className="material-symbols-outlined text-[22px] text-[#fece57] material-symbols-filled">
                stars
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-playfair text-[17px] sm:text-[19px] font-bold tracking-tight text-[#450011] leading-none">
                  Deepam Royal Sparks
                </h1>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#661023]/10 text-[#661023] border border-[#661023]/20">
                  Vijayawada Hub
                </span>
              </div>
              <span className="text-[10px] text-[#775a00] font-semibold tracking-wider uppercase block pt-0.5">
                Sivakasi Atelier Pyrotechnics • AP
              </span>
            </div>
          </div>
        )}

        {/* Laptop/Desktop Quick Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#554243]">
          <button
            onClick={() => setCurrentScreen('catalogue')}
            className={`hover:text-[#450011] transition-colors pb-0.5 ${
              currentScreen === 'catalogue' ? 'text-[#450011] border-b-2 border-[#661023] font-bold' : ''
            }`}
          >
            Catalogue
          </button>
          <button
            onClick={() => setCurrentScreen('hampers')}
            className={`hover:text-[#450011] transition-colors pb-0.5 ${
              currentScreen === 'hampers' ? 'text-[#450011] border-b-2 border-[#661023] font-bold' : ''
            }`}
          >
            Festive Hampers
          </button>
          <button
            onClick={() => setCurrentScreen('concierge')}
            className={`hover:text-[#450011] transition-colors pb-0.5 ${
              currentScreen === 'concierge' ? 'text-[#450011] border-b-2 border-[#661023] font-bold' : ''
            }`}
          >
            Concierge Desk
          </button>
          <button
            onClick={() => setCurrentScreen('tracking')}
            className={`hover:text-[#450011] transition-colors pb-0.5 ${
              currentScreen === 'tracking' ? 'text-[#450011] border-b-2 border-[#661023] font-bold' : ''
            }`}
          >
            Track Order
          </button>
        </nav>

        {/* Right Section Actions: Admin Terminal & Cart */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Merchant Console Switch */}
          <button
            onClick={handleMerchantClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all border ${
              currentScreen === 'admin'
                ? 'bg-[#661023] text-white border-[#661023]'
                : 'bg-[#661023]/10 text-[#661023] border-[#661023]/30 hover:bg-[#661023] hover:text-white'
            }`}
            title="Merchant / Admin Console"
          >
            <span className="material-symbols-outlined text-[15px]">
              {isAdminAuthenticated ? 'dashboard' : 'lock'}
            </span>
            <span>{currentScreen === 'admin' ? 'Storefront' : isAdminAuthenticated ? 'Console' : 'Admin'}</span>
          </button>

          {/* Cart Button with Counter & Total on Laptop */}
          <button
            onClick={() => setCurrentScreen('checkout')}
            aria-label="View Cart"
            className="flex items-center gap-1.5 bg-[#661023] hover:bg-[#450011] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="bg-[#ffdf98] text-[#450011] px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                {cartCount}
              </span>
            ) : (
              <span className="text-[10px] opacity-80">(0)</span>
            )}
            {cartTotal > 0 && (
              <span className="hidden md:inline font-mono text-[11px] text-[#ffdf98] pl-1 border-l border-white/20">
                ₹{cartTotal.toLocaleString()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-strip for location detection and delivery destination */}
      {!showBack && currentScreen !== 'admin' && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <div className="bg-[#fef1ea] rounded-xl px-3 sm:px-4 py-2 border border-[#dbc0c1]/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Left: Location State UX (Detecting / Detected / Denied) */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#775a00] text-[18px] shrink-0 material-symbols-filled">
                location_on
              </span>

              {locationStatus === 'detecting' || isLocating ? (
                <div className="flex items-center gap-2 text-[#450011] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#775a00] animate-ping" />
                  <span>📍 Detecting location...</span>
                </div>
              ) : detectedLocation && detectedLocation.city ? (
                <div className="flex flex-wrap items-center gap-1.5 truncate">
                  <span className="font-bold text-[#450011]">
                    📍 {detectedLocation.city}
                  </span>
                  {(detectedLocation.area || detectedLocation.pincode) && (
                    <span className="text-[#554243] text-[11px] truncate hidden sm:inline">
                      • {detectedLocation.area} {detectedLocation.pincode ? `(${detectedLocation.pincode})` : ''}
                    </span>
                  )}
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                      isDeliveryAvailable
                        ? 'bg-[#c2edd0] text-[#002414] border-[#8ad3a6]'
                        : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]'
                    }`}
                  >
                    {isDeliveryAvailable ? 'Delivery available: Yes' : 'Delivery may not be available'}
                  </span>
                </div>
              ) : locationStatus === 'denied' || locationError ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#ba1a1a]">
                    📍 Location access is unavailable.
                  </span>
                  <span className="text-[#554243] text-[11px] hidden sm:inline">
                    (Delivering to: <strong className="text-[#450011]">{deliveryDestination}</strong>)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#450011]">
                    📍 {deliveryDestination || 'Vijayawada'}
                  </span>
                  <span className="text-[#554243] text-[11px] hidden sm:inline">
                    (Central Hub Dispatch)
                  </span>
                </div>
              )}
            </div>

            {/* Right: Location Actions */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <button
                onClick={handleGpsClick}
                disabled={isLocating}
                className="text-[11px] text-[#133a27] bg-white hover:bg-[#e7f5ec] px-2.5 py-1 rounded-md border border-[#8ad3a6] font-bold flex items-center gap-1 transition-colors active:scale-95 shadow-2xs"
                title="Detect GPS location from browser"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isLocating ? 'sync' : 'my_location'}
                </span>
                <span>{isLocating ? 'Locating...' : 'Use my current location'}</span>
              </button>

              <button
                onClick={onOpenCityModal}
                className="text-[11px] text-[#450011] bg-white hover:bg-[#f8ebe5] px-2.5 py-1 rounded-md border border-[#dbc0c1] font-bold transition-colors shadow-2xs"
              >
                Enter address manually
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
