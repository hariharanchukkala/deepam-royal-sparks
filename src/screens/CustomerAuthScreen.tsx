import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const CustomerAuthScreen: React.FC = () => {
  const {
    loginCustomer,
    registerCustomer,
    setCurrentScreen,
    triggerAutoLocation,
    isLocating,
    selectedCity
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState<string>('aditya.sharma@example.com');
  const [password, setPassword] = useState<string>('diwali2024');

  // Registration fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [detectedAddress, setDetectedAddress] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<string>('');

  const handleAutoLocation = async () => {
    setLocationStatus('Locating GPS coordinates...');
    try {
      const loc = await triggerAutoLocation();
      setDetectedAddress(`${loc.address}, ${loc.area}, ${loc.city} - ${loc.pincode}`);
      setLocationStatus(`✓ Pinpointed: ${loc.city} (${loc.pincode})`);
    } catch {
      setLocationStatus('Could not detect GPS. Please enter manually.');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      alert('Please enter your mobile number or email');
      return;
    }
    loginCustomer(emailOrPhone, password);
    setCurrentScreen('catalogue');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please enter your name and contact phone number');
      return;
    }
    registerCustomer(name, email, phone, whatsapp || phone, password);
    setCurrentScreen('catalogue');
  };

  const quickLoginAs = (custName: string, custPhone: string, city: string) => {
    loginCustomer(custPhone, 'demo');
    setCurrentScreen('catalogue');
  };

  return (
    <div className="pt-24 pb-36 max-w-md mx-auto px-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex w-12 h-12 rounded-xl bg-[#661023] text-[#fece57] items-center justify-center shadow-md mb-1">
          <span className="material-symbols-outlined text-[28px] material-symbols-filled">
            stars
          </span>
        </div>
        <h2 className="font-playfair text-2xl font-bold text-[#450011]">
          {mode === 'login' ? 'Patron Sign In' : 'Create Customer Account'}
        </h2>
        <p className="text-xs text-[#554243]">
          Save festival addresses, receive 1-tap WhatsApp invoice alerts & priority Sivakasi dispatch.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-[#f2e6df] p-1 rounded-xl text-xs font-bold border border-[#dbc0c1]/50">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            mode === 'login'
              ? 'bg-[#661023] text-white shadow-2xs'
              : 'text-[#554243] hover:text-[#201a16]'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            mode === 'register'
              ? 'bg-[#661023] text-white shadow-2xs'
              : 'text-[#554243] hover:text-[#201a16]'
          }`}
        >
          Register
        </button>
      </div>

      {/* Login Form */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-3 text-xs">
          <div>
            <label className="font-bold text-[#554243] block mb-1">
              Mobile Number or Email
            </label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="10-digit mobile or email"
              className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2.5 text-xs font-semibold text-[#201a16]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-[#554243]">Password</label>
              <button type="button" className="text-[10px] text-[#775a00] hover:underline font-bold">
                Forgot?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2.5 text-xs text-[#201a16]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#661023] hover:bg-[#450011] text-white font-bold rounded-lg text-xs shadow-sm active:scale-95 transition-all"
          >
            Enter Festival Store
          </button>

          {/* Quick Demo Logins */}
          <div className="pt-2 border-t border-[#dbc0c1]/40 space-y-2">
            <span className="text-[10px] text-[#775a00] font-bold uppercase tracking-wider block">
              Quick One-Tap Demo Access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLoginAs('Aditya Sharma', '+91 98401 22334', 'Bengaluru')}
                className="p-2 rounded bg-[#fef1ea] border border-[#dbc0c1] text-left hover:bg-[#ece0d9] text-[11px]"
              >
                <span className="font-bold block text-[#450011]">Aditya Sharma</span>
                <span className="text-[10px] text-gray-500">Bengaluru • 3 orders</span>
              </button>
              <button
                type="button"
                onClick={() => quickLoginAs('Kavita Iyer', '+91 94432 11099', 'Chennai')}
                className="p-2 rounded bg-[#fef1ea] border border-[#dbc0c1] text-left hover:bg-[#ece0d9] text-[11px]"
              >
                <span className="font-bold block text-[#450011]">Kavita Iyer</span>
                <span className="text-[10px] text-gray-500">Chennai • Grand Hamper</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Registration Form with Auto Location Tracking */}
      {mode === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-3 text-xs">
          <div>
            <label className="font-bold text-[#554243] block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-[#554243] block mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-[#554243] block mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="For invoice alerts"
                className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#554243] block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
            />
          </div>

          {/* Auto Location GPS Trigger */}
          <div className="p-2.5 bg-[#fef1ea] rounded-xl border border-[#dbc0c1]/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#661023] flex items-center gap-1 text-[11px]">
                <span className="material-symbols-outlined text-[16px]">my_location</span>
                Auto Location Tracking
              </span>
              <button
                type="button"
                onClick={handleAutoLocation}
                disabled={isLocating}
                className="px-2.5 py-1 bg-[#133a27] text-white rounded text-[10px] font-bold active:scale-95 transition-all flex items-center gap-1"
              >
                {isLocating ? (
                  <>
                    <span className="material-symbols-outlined text-[12px] animate-spin">
                      progress_activity
                    </span>
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[12px]">gps_fixed</span>
                    <span>Detect My GPS</span>
                  </>
                )}
              </button>
            </div>

            {locationStatus && (
              <p className="text-[10px] font-medium text-[#133a27]">{locationStatus}</p>
            )}

            <div>
              <label className="text-[10px] uppercase font-bold text-[#554243] block">
                Destination Address
              </label>
              <textarea
                rows={2}
                value={detectedAddress}
                onChange={(e) => setDetectedAddress(e.target.value)}
                placeholder="Flat / Building, Area, City and Pincode"
                className="w-full bg-white border border-[#dbc0c1] rounded p-1.5 text-xs mt-1"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#661023] hover:bg-[#450011] text-white font-bold rounded-lg text-xs shadow-sm active:scale-95 transition-all"
          >
            Create Patron Account
          </button>
        </form>
      )}

      {/* Switch to Admin Login */}
      <div className="p-3 bg-[#f2e6df] rounded-xl border border-[#dbc0c1]/40 text-center text-xs">
        <p className="text-[#554243] mb-1">Are you a Sivakasi Merchant or Factory Admin?</p>
        <button
          onClick={() => setCurrentScreen('admin-login')}
          className="font-bold text-[#661023] hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          <span>Open Merchant Dispatch Admin Login</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
