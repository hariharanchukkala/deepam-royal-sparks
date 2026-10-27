import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AdminAuthScreen: React.FC = () => {
  const { loginAdmin, setCurrentScreen } = useApp();
  const [adminIdentifier, setAdminIdentifier] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminIdentifier.trim()) {
      setErrorMsg('Please enter your admin email or username.');
      return;
    }
    if (!adminPassword.trim()) {
      setErrorMsg('Please enter your admin password.');
      return;
    }

    setIsSubmitting(true);

    const success = loginAdmin(adminIdentifier.trim(), adminPassword.trim());
    setIsSubmitting(false);

    if (success) {
      setCurrentScreen('admin');
    } else {
      setErrorMsg('Access Denied: Invalid administrator email/username or password.');
    }
  };

  return (
    <div className="pt-28 pb-36 max-w-md lg:max-w-lg mx-auto px-4 space-y-5">
      {/* Back button */}
      <button
        onClick={() => setCurrentScreen('catalogue')}
        className="flex items-center gap-1.5 text-xs font-bold text-[#450011] hover:underline"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Store Catalogue</span>
      </button>

      {/* Admin Portal Header */}
      <div className="bg-[#661023] text-white p-6 rounded-2xl shadow-md border border-[#fece57]/40 text-center space-y-2 relative overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-[#fece57] text-[#735700] flex items-center justify-center mx-auto shadow-inner">
          <span className="material-symbols-outlined text-[28px] material-symbols-filled">
            security
          </span>
        </div>
        <h2 className="font-playfair text-xl sm:text-2xl font-bold tracking-tight">
          Merchant Administration Portal
        </h2>
        <p className="text-xs text-[#ffdf98]">
          Deepam Royal Sparks • Vijayawada Central Hub & Dispatch Terminal
        </p>
        <div className="inline-flex items-center gap-1 bg-[#450011]/80 px-2.5 py-1 rounded-full text-[10px] text-[#ffdf98] font-mono border border-[#fece57]/20 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8ad3a6]" />
          <span>PESO Statutory Licensed Terminal</span>
        </div>
      </div>

      {/* Genuine Admin Login Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-[#dbc0c1]/60 shadow-xs space-y-4 text-xs"
      >
        <div>
          <label className="font-bold text-[#554243] block mb-1.5">
            Admin Email or Username
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              person
            </span>
            <input
              type="text"
              required
              value={adminIdentifier}
              onChange={(e) => setAdminIdentifier(e.target.value)}
              placeholder="e.g. admin@deepamsparks.com or admin"
              autoComplete="username"
              className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#201a16] focus:outline-none focus:border-[#661023]"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[#554243] block mb-1.5">
            Admin Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              key
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter secure admin password"
              autoComplete="current-password"
              className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg pl-9 pr-10 py-2.5 text-xs text-[#201a16] focus:outline-none focus:border-[#661023] font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#661023] hover:bg-[#450011] disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">lock_open</span>
          <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Merchant Terminal'}</span>
        </button>

        <div className="pt-3 border-t border-[#dbc0c1]/40 text-center space-y-1.5">
          <p className="text-[11px] text-[#554243]">
            Access restricted exclusively to authorized Deepam Royal Sparks administrators.
          </p>
          <p className="text-[10px] text-gray-500">
            For credential assistance, contact Store Dispatch Head: <strong className="text-[#450011]">+91 79937 85371</strong>
          </p>
        </div>
      </form>
    </div>
  );
};
