import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const CustomerProfileScreen: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    orders,
    setCurrentOrderId,
    setCurrentScreen,
    triggerAutoLocation,
    isLocating,
    logout
  } = useApp();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState<string>(currentUser?.whatsapp || '');
  const [address, setAddress] = useState<string>(currentUser?.address || '');
  const [city, setCity] = useState<string>(currentUser?.city || 'Bengaluru');
  const [pincode, setPincode] = useState<string>(currentUser?.pincode || '560038');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone, whatsapp, address, city, pincode });
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleGpsUpdate = async () => {
    try {
      const loc = await triggerAutoLocation();
      setAddress(loc.address);
      setCity(loc.city);
      setPincode(loc.pincode);
      updateUserProfile({
        address: loc.address,
        city: loc.city,
        pincode: loc.pincode
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch {
      alert('Unable to capture GPS location.');
    }
  };

  const customerOrders = orders.filter(
    (o) => currentUser && (o.customer.phone === currentUser.phone || o.customer.name === currentUser.name)
  );

  return (
    <div className="pt-24 pb-36 max-w-md mx-auto px-4 space-y-4">
      {/* Profile Header */}
      <div className="bg-[#fef1ea] p-4 rounded-2xl border border-[#dbc0c1]/50 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#661023] text-white flex items-center justify-center font-bold text-lg font-playfair shadow">
            {currentUser?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h2 className="font-playfair text-lg font-bold text-[#450011]">
              {currentUser?.name || 'Valued Patron'}
            </h2>
            <p className="text-xs text-[#554243] font-mono">{currentUser?.phone || 'No phone set'}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            setCurrentScreen('catalogue');
          }}
          className="text-xs text-[#ba1a1a] font-bold hover:underline"
        >
          Sign Out
        </button>
      </div>

      {savedToast && (
        <div className="p-2 bg-[#c2edd0] text-[#002414] rounded-lg text-xs font-bold text-center animate-in fade-in">
          ✓ Profile and Contact Details Saved!
        </div>
      )}

      {/* Editable Contact & Address Information */}
      <div className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#dbc0c1]/40">
          <h3 className="font-playfair text-sm font-bold text-[#450011] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">contact_phone</span>
            Contact & Dispatch Details
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-[#775a00] hover:underline"
          >
            {isEditing ? 'Cancel' : 'Edit Details'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="font-bold text-[#554243] block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#554243] block mb-1">Mobile Phone (Calling)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-[#554243] block mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-[#554243]">Delivery Address</label>
                <button
                  type="button"
                  onClick={handleGpsUpdate}
                  disabled={isLocating}
                  className="text-[10px] text-[#133a27] font-bold flex items-center gap-0.5 hover:underline"
                >
                  <span className="material-symbols-outlined text-[13px]">my_location</span>
                  <span>{isLocating ? 'Locating...' : 'Auto-Fill from GPS'}</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-[#554243] block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-[#554243] block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#661023] hover:bg-[#450011] text-white font-bold rounded-lg text-xs"
            >
              Save Profile Changes
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Calling Mobile:</span>
              <span className="font-mono font-bold text-[#201a16]">{currentUser?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">WhatsApp Alert Number:</span>
              <span className="font-mono font-bold text-[#133a27]">{currentUser?.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="text-right font-medium max-w-[200px]">
                {currentUser?.address}, {currentUser?.city} - {currentUser?.pincode}
              </span>
            </div>
            <div className="pt-2 border-t border-[#dbc0c1]/30 flex justify-between items-center">
              <span className="text-[11px] text-gray-500">Live GPS Location:</span>
              <button
                onClick={handleGpsUpdate}
                disabled={isLocating}
                className="text-[11px] font-bold text-[#133a27] flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                <span>{isLocating ? 'Pinpointing...' : 'Update from GPS'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Orders History */}
      <div className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-3 text-xs">
        <h3 className="font-playfair text-sm font-bold text-[#450011] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          My Festive Orders ({customerOrders.length})
        </h3>

        {customerOrders.length === 0 ? (
          <p className="text-gray-500 py-3 text-center">No orders placed under this mobile number yet.</p>
        ) : (
          <div className="divide-y divide-[#dbc0c1]/30 space-y-2">
            {customerOrders.map((ord) => (
              <div key={ord.id} className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-[#450011]">#{ord.id}</span>
                  <p className="text-[11px] text-gray-500">
                    {ord.items.length} items • ₹{ord.total.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-[#c2edd0] text-[#002414] font-bold px-2 py-0.5 rounded">
                    {ord.orderStatus}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentOrderId(ord.id);
                      setCurrentScreen('tracking');
                    }}
                    className="px-2.5 py-1 bg-[#661023] text-white rounded text-[11px] font-bold"
                  >
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
