import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ConciergeScreen: React.FC = () => {
  const { settings } = useApp();
  const [inquiryType, setInquiryType] = useState<string>('Wedding & Society Display');
  const [guestCount, setGuestCount] = useState<string>('50 - 200 Guests');
  const [customerName, setCustomerName] = useState<string>('');
  const [city, setCity] = useState<string>('Bengaluru');
  const [message, setMessage] = useState<string>('');

  const conciergeText =
    `🪔 *DEEPAM ROYAL SPARKS - CONCIERGE INQUIRY*\n` +
    `*Client:* ${customerName || 'Valued Patron'}\n` +
    `*City:* ${city}\n` +
    `*Occasion:* ${inquiryType}\n` +
    `*Scale:* ${guestCount}\n` +
    (message ? `*Notes:* ${message}\n` : '') +
    `\n_Hello Master Blender, I would like guidance on curated pyrotechnics and safe transit for our celebration._`;

  const waConciergeUrl = `https://wa.me/917993785371?text=${encodeURIComponent(conciergeText)}`;
  const waWebConciergeUrl = `https://web.whatsapp.com/send?phone=917993785371&text=${encodeURIComponent(conciergeText)}`;

  return (
    <div className="pt-24 pb-36 max-w-md mx-auto px-4 space-y-4">
      <div>
        <div className="flex items-center gap-1.5 text-[#775a00]">
          <span className="material-symbols-outlined text-[18px] material-symbols-filled">
            support_agent
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Sivakasi Master Atelier
          </span>
        </div>
        <h2 className="font-playfair text-xl text-[#450011] font-bold">
          Pyrotechnic Concierge Desk
        </h2>
        <p className="text-xs text-[#554243]">
          Speak directly with our senior Sivakasi safety engineers for custom wedding fireworks, society festival permits, and bulk corporate hampers.
        </p>
      </div>

      {/* Trust Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#fef1ea] p-3 rounded-xl border border-[#dbc0c1]/40 space-y-1">
          <span className="material-symbols-outlined text-[#775a00] text-[20px]">
            verified
          </span>
          <h4 className="font-bold text-[#450011]">PESO Certified</h4>
          <p className="text-[11px] text-[#554243]">Legal non-hazardous van dispatch across South & West India.</p>
        </div>

        <div className="bg-[#fef1ea] p-3 rounded-xl border border-[#dbc0c1]/40 space-y-1">
          <span className="material-symbols-outlined text-[#133a27] text-[20px]">
            eco
          </span>
          <h4 className="font-bold text-[#133a27]">Zero-Barium Formulations</h4>
          <p className="text-[11px] text-[#554243]">Gentle acoustic damping for residential gated communities.</p>
        </div>
      </div>

      {/* Inquiry Form Card */}
      <div className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-3 text-xs">
        <h3 className="font-playfair text-sm font-bold text-[#450011]">
          Plan a Bespoke Pyrotechnic Show
        </h3>

        <div>
          <label className="text-[10px] uppercase font-bold text-[#554243] block mb-1">
            Celebration Type
          </label>
          <select
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value)}
            className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs text-[#201a16]"
          >
            <option>Wedding & Society Display</option>
            <option>Diwali Apartment Society Bulk</option>
            <option>Corporate Executive Gift Boxes</option>
            <option>Low-Acoustic Pet Friendly Curation</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase font-bold text-[#554243] block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Vikram Seth"
              className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-[#554243] block mb-1">
              Destination City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-[#554243] block mb-1">
            Special Requests / Space Constraints
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Terrace height is 40 feet, require child-safe sparklers and 50-shot aerial cakes."
            rows={3}
            className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs text-[#201a16]"
          />
        </div>

        <div className="space-y-2 pt-1">
          <a
            href={waConciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] hover:bg-[#1ebc57] text-[#002414] font-black rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md text-center"
          >
            <span className="material-symbols-outlined text-[20px]">
              chat
            </span>
            <span>OPEN WHATSAPP (+91 79937 85371)</span>
          </a>

          <a
            href={waWebConciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-white hover:bg-[#f2faf5] text-[#0f5132] font-bold rounded-lg text-[11px] border border-[#25D366]/60 flex items-center justify-center gap-1.5 transition-colors text-center"
          >
            <span className="material-symbols-outlined text-[16px]">laptop_mac</span>
            <span>Open in WhatsApp Web (Browser / Desktop)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
