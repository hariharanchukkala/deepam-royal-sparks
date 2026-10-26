import React from 'react';
import { Order, BusinessSettings } from '../types';

interface PackingSlipModalProps {
  order: Order;
  settings: BusinessSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({
  order,
  settings,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-white text-[#201a16] rounded-xl border-2 border-[#661023] p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto font-mono text-xs">
        {/* Slip Header */}
        <div className="border-b-2 border-dashed border-[#554243] pb-3 text-center">
          <h2 className="font-playfair text-base font-bold text-[#661023] uppercase tracking-wider">
            {settings.businessName}
          </h2>
          <p className="text-[10px] text-[#554243] uppercase tracking-widest">
            {settings.dispatchHub}
          </p>
          <div className="inline-block bg-[#f8ebe5] border border-[#dbc0c1] px-2 py-0.5 mt-1 rounded text-[10px] font-bold text-[#661023]">
            {settings.pesoLicense}
          </div>
        </div>

        {/* Order Details */}
        <div className="py-3 border-b border-dashed border-[#dbc0c1] space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="font-bold">MANIFEST DOCKET:</span>
            <span className="font-bold text-[#661023]">#{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span>DISPATCH TIME:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>CONSIGNEE:</span>
            <span className="font-bold">{order.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span>CONTACT:</span>
            <span>{order.customer.phone}</span>
          </div>
          <div className="pt-1">
            <span className="font-bold block">DESTINATION:</span>
            <p className="text-[#554243]">
              {order.customer.address}, {order.customer.area}, {order.customer.city} - {order.customer.pincode}
            </p>
          </div>
          {order.docketNumber && (
            <div className="flex justify-between text-[#133a27] font-bold pt-1">
              <span>HAZMAT FREIGHT DOCKET:</span>
              <span>{order.docketNumber}</span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="py-3 border-b-2 border-dashed border-[#554243]">
          <div className="flex justify-between font-bold text-[10px] border-b pb-1 mb-1">
            <span>ITEM & PACK</span>
            <span className="text-right">QTY / AMT</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="pr-2">
                  <span className="font-semibold block">{it.productName}</span>
                  <span className="text-[9px] text-gray-500">{it.packSize}</span>
                </div>
                <div className="text-right shrink-0">
                  <span>{it.quantity} × ₹{it.price}</span>
                  <span className="block font-bold text-[#661023]">
                    ₹{(it.quantity * it.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="py-2 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#ba1a1a]">
              <span>ROYAL FESTIVE DISCOUNT:</span>
              <span>-₹{order.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>SPECIAL WOODEN PACKAGING:</span>
            <span className="text-[#133a27] font-bold">FREE</span>
          </div>
          <div className="flex justify-between">
            <span>FREIGHT & LEVY:</span>
            <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#661023] pt-1 border-t border-dashed">
            <span>TOTAL PAYABLE:</span>
            <span>₹{order.total.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>PAYMENT STATUS:</span>
            <span className="font-bold">{order.paymentStatus} ({order.paymentMode})</span>
          </div>
        </div>

        {/* Legal Seal Stamp */}
        <div className="mt-3 p-2 bg-[#f8ebe5] border border-[#dbc0c1] rounded text-center text-[10px] space-y-0.5">
          <p className="font-bold text-[#661023]">✓ CSIR-NEERI & PESO GREEN CRACKER AUDIT PASSED</p>
          <p className="text-gray-600 text-[9px]">
            Statutory batch verification attached. Non-hazardous non-bulk packaging.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 bg-[#661023] text-white rounded text-xs font-bold hover:bg-[#450011] transition-all"
          >
            Print Packing Slip
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-xs font-bold hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
