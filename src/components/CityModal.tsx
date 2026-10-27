import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CityModal: React.FC<CityModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    detectedLocation,
    locationStatus,
    locationError,
    deliveryDestination,
    setDeliveryDestination,
    setSelectedCity,
    isDeliveryAvailable,
    triggerAutoLocation,
    isLocating
  } = useApp();

  const [manualCity, setManualCity] = useState<string>('');
  const [gpsError, setGpsError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectArea = (city: string) => {
    setSelectedCity(city);
    onClose();
  };

  const handleApplyManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCity.trim()) {
      setSelectedCity(manualCity.trim());
      onClose();
    }
  };

  const handleUseDetected = () => {
    if (detectedLocation && detectedLocation.city) {
      setSelectedCity(detectedLocation.city);
      onClose();
    }
  };

  const handleTriggerGps = async () => {
    setGpsError(null);
    try {
      const loc = await triggerAutoLocation();
      if (loc.city) {
        setSelectedCity(loc.city);
      }
    } catch {
      setGpsError('Location access is unavailable. Please choose or type your delivery destination below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#fff8f5] rounded-t-2xl sm:rounded-2xl border border-[#dbc0c1] p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#dbc0c1]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#775a00] text-[22px] material-symbols-filled">
              local_shipping
            </span>
            <div>
              <h3 className="font-playfair text-lg font-bold text-[#450011]">
                Delivery Destination & Location
              </h3>
              <p className="text-[11px] text-[#554243]">
                Dispatched from Vijayawada Hub & Sivakasi Central Dispatch Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8ebe5] hover:bg-[#ece0d9] flex items-center justify-center text-[#450011] transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* SECTION 1: DETECTED PHYSICAL LOCATION */}
        <div className="bg-[#fef1ea] p-3.5 rounded-xl border border-[#dbc0c1]/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#775a00] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              Detected Physical Location
            </span>
            <button
              onClick={handleTriggerGps}
              disabled={isLocating}
              className="text-[11px] font-bold text-[#133a27] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">
                {isLocating ? 'sync' : 'refresh'}
              </span>
              <span>{isLocating ? 'Detecting...' : 'Use my current location'}</span>
            </button>
          </div>

          {detectedLocation && detectedLocation.city ? (
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="font-bold text-[#450011] text-sm">
                    📍 {detectedLocation.city}
                    {detectedLocation.state ? `, ${detectedLocation.state}` : ''}
                  </p>
                  {(detectedLocation.area || detectedLocation.pincode) && (
                    <p className="text-xs text-[#554243]">
                      {detectedLocation.area} {detectedLocation.pincode ? `• PIN: ${detectedLocation.pincode}` : ''}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isDeliveryAvailable
                      ? 'bg-[#c2edd0] text-[#002414] border-[#8ad3a6]'
                      : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]'
                  }`}
                >
                  {isDeliveryAvailable ? 'Delivery available: Yes' : 'Delivery may not be available'}
                </span>
              </div>

              {deliveryDestination !== detectedLocation.city && (
                <button
                  onClick={handleUseDetected}
                  className="w-full mt-1 py-1.5 bg-white hover:bg-[#f8ebe5] text-[#450011] text-xs font-bold rounded-lg border border-[#dbc0c1] transition-colors"
                >
                  Deliver to Detected City ({detectedLocation.city})
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-[#ba1a1a] font-semibold">
                Location access is unavailable.
              </p>
              <p className="text-[11px] text-[#554243]">
                Browser permission was not granted or GPS timed out. You can manually enter or pick your delivery destination below.
              </p>
              {gpsError && (
                <p className="text-[11px] text-[#ba1a1a] italic">{gpsError}</p>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: DELIVERY DESTINATION (Where order should be delivered) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#450011]">
              Select Delivery Destination Hub:
            </span>
            <span className="text-[11px] text-[#775a00] font-semibold">
              Current: <strong className="text-[#450011]">{deliveryDestination}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto no-scrollbar py-1">
            {settings.deliveryAreas.map((city) => (
              <button
                key={city}
                onClick={() => handleSelectArea(city)}
                className={`p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  deliveryDestination.toLowerCase() === city.toLowerCase()
                    ? 'bg-[#661023] text-white border-[#661023]'
                    : 'bg-[#fff8f5] text-[#201a16] border-[#dbc0c1]/60 hover:bg-[#f8ebe5]'
                }`}
              >
                <span className="truncate">{city}</span>
                {deliveryDestination.toLowerCase() === city.toLowerCase() ? (
                  <span className="material-symbols-outlined text-[16px] shrink-0">check</span>
                ) : (
                  <span className="text-[10px] text-[#775a00] shrink-0">48h</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3: MANUAL ADDRESS OR CUSTOM CITY INPUT */}
        <form onSubmit={handleApplyManual} className="space-y-2 pt-1 border-t border-[#dbc0c1]/40">
          <label className="block text-xs font-bold text-[#554243]">
            Enter address manually / other city:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              placeholder="e.g. Guntur, Benz Circle Vijayawada, etc."
              className="flex-1 bg-white border border-[#dbc0c1] rounded-lg px-3 py-2 text-xs text-[#201a16] placeholder:text-[#887173] focus:outline-none focus:border-[#661023]"
            />
            <button
              type="submit"
              disabled={!manualCity.trim()}
              className="px-4 py-2 bg-[#661023] hover:bg-[#450011] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Confirm
            </button>
          </div>
        </form>

        <div className="bg-[#fef1ea] p-2.5 rounded-lg border border-[#dbc0c1]/40 text-[11px] text-[#554243] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#775a00] text-[18px]">verified</span>
          <span>PESO Certified dispatch vans operate daily from Vijayawada Hub & Sivakasi factory depot.</span>
        </div>
      </div>
    </div>
  );
};
