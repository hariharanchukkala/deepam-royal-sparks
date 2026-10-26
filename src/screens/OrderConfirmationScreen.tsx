import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const OrderConfirmationScreen: React.FC = () => {
  const { currentOrderId, orders, setCurrentScreen, settings, generateWhatsAppPayload } = useApp();

  const currentOrder = orders.find((o) => o.id === currentOrderId);

  const [copiedId, setCopiedId] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const cleanPhone = '917993785371';

  // Build the complete, full order payload for WhatsApp
  const fullOrderText = currentOrder
    ? generateWhatsAppPayload(currentOrder)
    : `🪔 DEEPAM ROYAL SPARKS\n\nOrder Request #${currentOrderId || 'DRS-2026-00001'}\nPlease review availability and confirm.`;

  const encodedMessage = encodeURIComponent(fullOrderText);
  const waAppUrl = `https://wa.me/917993785371?text=${encodedMessage}`;
  const waWebUrl = `https://web.whatsapp.com/send?phone=917993785371&text=${encodedMessage}`;

  const handleCopyOrderId = () => {
    if (currentOrderId) {
      navigator.clipboard.writeText(currentOrderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyFullPayload = () => {
    navigator.clipboard.writeText(fullOrderText);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 3000);
  };

  return (
    <div className="pt-20 pb-36 max-w-md mx-auto px-4 space-y-4 text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-full bg-[#c2edd0] text-[#002414] flex items-center justify-center mx-auto shadow-sm">
        <span className="material-symbols-outlined text-[36px]">check_circle</span>
      </div>

      <div className="space-y-1">
        <h2 className="font-playfair text-2xl font-bold text-[#450011]">
          Order Reserved Successfully
        </h2>
        <p className="text-xs text-[#554243] max-w-xs mx-auto">
          Stock has been reserved in our system. Send your order summary to our official WhatsApp to finalize dispatch.
        </p>
      </div>

      {/* Order ID Card */}
      <div className="bg-[#fef1ea] p-4 rounded-xl border border-[#dbc0c1]/50 space-y-1.5 text-xs">
        <span className="text-[10px] uppercase font-bold text-[#775a00] tracking-wider block">
          Your Unique Order ID
        </span>
        <div className="flex items-center justify-center gap-2">
          <p className="font-mono text-xl font-bold text-[#661023]">
            {currentOrderId || 'DRS-2026-00001'}
          </p>
          <button
            onClick={handleCopyOrderId}
            className="p-1 text-[#554243] hover:text-[#661023] rounded-md transition-colors"
            title="Copy Order ID"
            aria-label="Copy Order ID"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copiedId ? 'check' : 'content_copy'}
            </span>
          </button>
        </div>
        {copiedId && (
          <span className="text-[10px] text-[#002414] font-medium block">
            Copied to clipboard!
          </span>
        )}
        {currentOrder && (
          <p className="text-[11px] text-[#554243] pt-1">
            Total Amount: <strong className="text-[#201a16]">₹{currentOrder.total.toLocaleString('en-IN')}</strong> • {currentOrder.items.length} Items
          </p>
        )}
      </div>

      {/* Primary WhatsApp Action Panel */}
      <div className="bg-white p-4 rounded-xl border-2 border-[#25D366] shadow-sm space-y-3">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
            <span className="text-xs font-bold text-[#002414] uppercase tracking-wide">
              Official WhatsApp Line
            </span>
          </div>
          <p className="font-mono text-base font-bold text-[#133a27]">
            +91 79937 85371
          </p>
          <p className="text-[11px] text-[#554243]">
            Click below to open WhatsApp with your complete pre-filled order manifest:
          </p>
        </div>

        {/* Direct Link to Mobile / App WhatsApp */}
        <a
          href={waAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-[#25D366] hover:bg-[#1ebc57] text-[#002414] font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span>OPEN WHATSAPP (+91 79937 85371)</span>
        </a>

        {/* Desktop Web WhatsApp Alternative Link */}
        <a
          href={waWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 bg-[#f0fbf4] hover:bg-[#dcf8e6] text-[#0c6b60] font-bold rounded-lg text-[11px] border border-[#25D366]/40 flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">laptop_mac</span>
          <span>Open in WhatsApp Web (Browser / Desktop)</span>
        </a>

        {/* 1-Click Copy Manifest Fallback */}
        <button
          onClick={handleCopyFullPayload}
          className="w-full py-2 bg-[#fff8f5] hover:bg-[#f8ebe5] text-[#554243] font-semibold rounded-lg text-[11px] border border-[#dbc0c1] flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">
            {copiedPayload ? 'check' : 'content_copy'}
          </span>
          <span>{copiedPayload ? '✓ Order Message Copied! Ready to paste' : 'Copy Full Order Message (Manual Paste)'}</span>
        </button>
      </div>

      {/* Secondary Navigation */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => setCurrentScreen('tracking')}
          className="w-full py-2.5 bg-[#661023] hover:bg-[#450011] text-white font-bold rounded-lg text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">route</span>
          <span>View Live Order Tracking</span>
        </button>

        <button
          onClick={() => setCurrentScreen('catalogue')}
          className="w-full py-2 bg-white border border-[#dbc0c1] text-[#450011] font-bold rounded-lg text-xs hover:bg-[#f8ebe5]"
        >
          Back to Fireworks Catalogue
        </button>
      </div>
    </div>
  );
};
