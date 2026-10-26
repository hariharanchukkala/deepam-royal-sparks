import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AdminAuthScreen: React.FC = () => {
  const { loginAdmin, setCurrentScreen } = useApp();
  const [adminPin, setAdminPin] = useState<string>('sivakasi');
  const [adminEmail, setAdminEmail] = useState<string>('master.blender@deepamsparks.com');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(adminPin);
    if (success) {
      setCurrentScreen('admin');
    } else {
      setErrorMsg('Invalid Master Blender authorization key. Please use demo key "sivakasi"');
    }
  };

  const handleQuickAdminDemo = () => {
    loginAdmin('sivakasi');
    setCurrentScreen('admin');
  };

  return (
    <div className="pt-24 pb-36 max-w-md mx-auto px-4 space-y-4">
      {/* Back button */}
      <button
        onClick={() => setCurrentScreen('catalogue')}
        className="flex items-center gap-1 text-xs font-bold text-[#450011] hover:underline"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Customer Store</span>
      </button>

      {/* Admin Portal Header */}
      <div className="bg-[#661023] text-white p-5 rounded-2xl shadow-md border border-[#D4AF37]/50 text-center space-y-2 relative overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-[#fece57] text-[#735700] flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-[28px] material-symbols-filled">
            security
          </span>
        </div>
        <h2 className="font-playfair text-xl font-bold">
          Sivakasi Merchant Dispatch Portal
        </h2>
        <p className="text-xs text-[#ffdf98]">
          Authorized factory personnel only. Gated access to real-time inventory editing, photo updates, prices & WhatsApp manifests.
        </p>
      </div>

      {/* Login Card */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-[#dbc0c1]/60 shadow-xs space-y-3.5 text-xs">
        <div>
          <label className="font-bold text-[#554243] block mb-1">
            Dispatch Hub Admin Email
          </label>
          <input
            type="email"
            required
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2.5 text-xs font-mono font-semibold"
          />
        </div>

        <div>
          <label className="font-bold text-[#554243] block mb-1">
            Master Authorization Key / PIN
          </label>
          <input
            type="password"
            required
            value={adminPin}
            onChange={(e) => setAdminPin(e.target.value)}
            placeholder="e.g. sivakasi"
            className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2.5 text-xs font-mono font-bold text-[#661023]"
          />
          <span className="text-[10px] text-gray-500 mt-1 block">
            Default Demo Master Key: <strong className="text-[#661023]">sivakasi</strong> or <strong className="text-[#661023]">admin123</strong>
          </span>
        </div>

        {errorMsg && (
          <div className="p-2 bg-[#ffdad6] text-[#ba1a1a] rounded text-[11px] font-bold">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-[#661023] hover:bg-[#450011] text-white font-bold rounded-lg text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">lock_open</span>
          <span>Access Merchant Console</span>
        </button>

        <div className="pt-2 border-t border-[#dbc0c1]/40 text-center">
          <button
            type="button"
            onClick={handleQuickAdminDemo}
            className="w-full py-2 bg-[#133a27] hover:bg-[#002414] text-white font-bold rounded-lg text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Instant Demo Admin Access</span>
          </button>
        </div>
      </form>
    </div>
  );
};
