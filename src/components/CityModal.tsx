import React from 'react';
import { useApp } from '../context/AppContext';

interface CityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CityModal: React.FC<CityModalProps> = ({ isOpen, onClose }) => {
  const { settings, selectedCity, setSelectedCity } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#fff8f5] rounded-t-2xl sm:rounded-2xl border border-[#dbc0c1] p-4 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#dbc0c1]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#775a00] text-[20px] material-symbols-filled">
              local_shipping
            </span>
            <h3 className="font-playfair text-base font-bold text-[#450011]">
              Select Delivery Destination
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f8ebe5] flex items-center justify-center text-[#450011]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <p className="text-xs text-[#554243]">
          PESO Certified HazMat Vans depart daily from Sivakasi Central Dispatch Hub. Select your delivery hub:
        </p>

        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar py-1">
          {settings.deliveryAreas.map((city) => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city);
                onClose();
              }}
              className={`p-2.5 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                selectedCity === city
                  ? 'bg-[#661023] text-white border-[#661023]'
                  : 'bg-[#fff8f5] text-[#201a16] border-[#dbc0c1]/60 hover:bg-[#f8ebe5]'
              }`}
            >
              <span>{city}</span>
              {selectedCity === city ? (
                <span className="material-symbols-outlined text-[16px]">check</span>
              ) : (
                <span className="text-[10px] text-[#775a00]">48h</span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-[#fef1ea] p-2.5 rounded-lg border border-[#dbc0c1]/40 text-[11px] text-[#554243] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#775a00] text-[18px]">verified</span>
          <span>Insured door dispatch in compliance with statutory safety transit norms.</span>
        </div>
      </div>
    </div>
  );
};
