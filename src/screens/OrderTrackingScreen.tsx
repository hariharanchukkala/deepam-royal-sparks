import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { subscribeToSingleOrder } from '../services/supabaseClient';

export const OrderTrackingScreen: React.FC = () => {
  const { orders, currentOrderId, setCurrentOrderId, trackOrder, settings } = useApp();
  const [searchId, setSearchId] = useState<string>(currentOrderId || '');
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(() => {
    if (currentOrderId) {
      return orders.find((o) => o.id === currentOrderId);
    }
    return orders[0];
  });
  const [isCopiedUpi, setIsCopiedUpi] = useState<boolean>(false);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');

  // Realtime subscription for customer's tracked order
  React.useEffect(() => {
    if (!selectedOrder?.id) return;
    const unsubscribe = subscribeToSingleOrder(selectedOrder.id, (updatedOrder) => {
      setSelectedOrder(updatedOrder);
    });
    return () => {
      unsubscribe();
    };
  }, [selectedOrder?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
    setSearchError('');

    if (!searchId.trim()) {
      setSearchError('Please enter your Order ID (e.g. DRS-2026-00001)');
      return;
    }

    setIsSearching(true);
    try {
      const result = await trackOrder(searchId, searchPhone);
      if (result) {
        setSelectedOrder(result);
        setCurrentOrderId(result.id);
      } else {
        setSelectedOrder(undefined);
        setSearchError(`No order found matching "${searchId}". Please check your order ID and mobile number.`);
      }
    } catch {
      setSearchError('Error looking up order. Please check your connection and retry.');
    } finally {
      setIsSearching(false);
    }
  };

  // 10 Mandatory Stages from Step 18
  const trackingSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'NEW', label: 'ORDER RECEIVED', desc: 'Order request received at Sivakasi central desk' },
    { key: 'UNDER_REVIEW', label: 'UNDER REVIEW', desc: 'Verifying warehouse stock availability' },
    { key: 'APPROVED', label: 'APPROVED', desc: 'Inventory reserved; ready for payment' },
    { key: 'PAYMENT_REQUESTED', label: 'PAYMENT REQUESTED', desc: 'UPI and settlement details sent via WhatsApp' },
    { key: 'CONFIRMED', label: 'PAYMENT VERIFIED', desc: 'Payment verified by accounts team' },
    { key: 'PACKING', label: 'PACKING', desc: 'Secured inside climate-controlled wooden transport crate' },
    { key: 'READY', label: 'READY', desc: 'Assigned to authorized carrier van' },
    { key: 'DISPATCHED', label: 'DISPATCHED', desc: 'En route from Sivakasi dispatch hub' },
    { key: 'DELIVERED', label: 'DELIVERED', desc: 'Delivered safely to customer' }
  ];

  const getStepStatus = (stepKey: OrderStatus, current: OrderStatus) => {
    const progression: OrderStatus[] = [
      'NEW',
      'UNDER_REVIEW',
      'APPROVED',
      'PAYMENT_REQUESTED',
      'CONFIRMED',
      'PACKING',
      'READY',
      'DISPATCHED',
      'DELIVERED'
    ];

    if (current === 'CANCELLED') return 'cancelled';

    const currentIndex = progression.indexOf(current);
    const stepIndex = progression.indexOf(stepKey);

    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'current';
    return 'pending';
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2000);
  };

  return (
    <div className="pt-24 pb-36 max-w-md mx-auto px-4 space-y-4">
      {/* Title */}
      <div>
        <h2 className="font-playfair text-xl text-[#450011] font-bold">
          Track Your Celebration Order
        </h2>
        <p className="text-xs text-[#554243]">
          Check live availability, packing, and dispatch status directly from our database.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="bg-white p-3.5 rounded-xl border border-[#dbc0c1]/60 shadow-xs space-y-2 text-xs">
        <span className="font-bold text-[#554243] block">
          Enter Order Information
        </span>
        <div className="space-y-2">
          <input
            type="text"
            required
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Order ID (e.g. DRS-2026-00001)"
            className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#450011]"
          />
          <input
            type="tel"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Mobile Number (optional verification)"
            className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg px-3 py-2 text-xs font-mono"
          />
        </div>
        {searchError && (
          <p className="text-[11px] text-[#ba1a1a] bg-[#ffdad6] p-2 rounded-lg font-medium">
            {searchError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSearching}
          className={`w-full py-2 ${
            isSearching ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#661023] hover:bg-[#450011]'
          } text-white rounded-lg text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5`}
        >
          {isSearching && <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>}
          <span>{isSearching ? 'Querying Sivakasi Database...' : 'Look Up Order Status'}</span>
        </button>
      </form>

      {/* Order Display */}
      {selectedOrder ? (
        <div className="space-y-4">
          <div className="bg-[#fef1ea] rounded-xl border border-[#dbc0c1]/60 p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-start justify-between pb-2 border-b border-[#dbc0c1]/40">
              <div>
                <span className="text-[10px] text-[#775a00] font-bold uppercase tracking-wider">
                  Order ID: {selectedOrder.id}
                </span>
                <h3 className="font-playfair text-lg text-[#450011] font-bold">
                  {selectedOrder.customer.name}
                </h3>
                <p className="text-[11px] text-[#554243]">
                  {selectedOrder.customer.city || 'Sivakasi Dispatch'} • {selectedOrder.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                </p>
              </div>

              <div className="text-right">
                <span className="font-playfair text-lg font-bold text-[#661023] block">
                  ₹{selectedOrder.total.toLocaleString('en-IN')}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedOrder.orderStatus === 'DELIVERED'
                      ? 'bg-[#c2edd0] text-[#002414]'
                      : selectedOrder.orderStatus === 'CANCELLED'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#fece57] text-[#735700]'
                  }`}
                >
                  {selectedOrder.orderStatus}
                </span>
              </div>
            </div>

            {/* Payment Section if payment requested or pending */}
            {selectedOrder.paymentStatus === 'REQUESTED' && (
              <div className="bg-white p-3 rounded-lg border border-[#dbc0c1]/50 space-y-2">
                <span className="text-xs font-bold text-[#661023] block">
                  Payment Requested: ₹{selectedOrder.total.toLocaleString('en-IN')}
                </span>
                <p className="text-[11px] text-[#554243]">
                  Please send settlement to our official UPI VPA:
                </p>
                <div className="p-2 bg-[#f8ebe5] rounded flex items-center justify-between">
                  <span className="font-mono font-bold text-[#450011]">{settings.upiId}</span>
                  <button
                    onClick={handleCopyUpi}
                    className="px-2 py-1 bg-white border border-[#dbc0c1] rounded text-[10px] font-bold text-[#661023]"
                  >
                    {isCopiedUpi ? 'Copied!' : 'Copy UPI'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">
                  After payment, share the transaction screenshot on WhatsApp. Our accounts team will manually verify and mark your payment verified.
                </p>
              </div>
            )}

            {/* Docket info if dispatched */}
            {selectedOrder.docketNumber && (
              <div className="bg-white p-2.5 rounded-lg border border-[#dbc0c1]/40 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-500 block">Dispatch Carrier Docket:</span>
                  <span className="font-mono font-bold text-[#133a27]">{selectedOrder.docketNumber}</span>
                </div>
                <span className="text-[10px] bg-[#c2edd0] text-[#002414] font-bold px-2 py-0.5 rounded">
                  In Transit
                </span>
              </div>
            )}
          </div>

          {/* Step 18: Timeline Visualizer */}
          <section className="bg-white rounded-xl border border-[#dbc0c1]/60 p-4 shadow-xs space-y-4">
            <h3 className="font-playfair text-base font-bold text-[#450011] pb-2 border-b border-[#dbc0c1]/30">
              Live Order Status
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dbc0c1]/50 text-xs">
              {trackingSteps.map((step, idx) => {
                const status = getStepStatus(step.key, selectedOrder.orderStatus);
                return (
                  <div key={idx} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                        status === 'completed'
                          ? 'bg-[#133a27] text-white border-[#133a27]'
                          : status === 'current'
                          ? 'bg-[#fece57] text-[#735700] border-[#775a00] ring-4 ring-[#fece57]/30'
                          : 'bg-white text-gray-400 border-gray-300'
                      }`}
                    >
                      {status === 'completed' ? '✓' : '○'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold ${
                            status === 'completed'
                              ? 'text-[#133a27]'
                              : status === 'current'
                              ? 'text-[#775a00]'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {status === 'completed' && (
                          <span className="text-[10px] font-bold text-[#133a27]">Completed</span>
                        )}
                        {status === 'current' && (
                          <span className="text-[10px] bg-[#fece57] text-[#735700] px-1.5 py-0.2 rounded font-bold animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#554243] mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Ordered Items List */}
          <section className="bg-white rounded-xl border border-[#dbc0c1]/60 p-4 shadow-xs space-y-2 text-xs">
            <h3 className="font-playfair text-sm font-bold text-[#450011]">
              Items In This Order ({selectedOrder.items.length})
            </h3>
            <div className="divide-y divide-[#dbc0c1]/20">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#201a16]">{it.productName}</p>
                    <p className="text-[10px] text-gray-500">{it.packSize}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#661023]">
                      {it.quantity} × ₹{it.price}
                    </span>
                    <span className="block text-[10px] text-gray-500">
                      ₹{(it.quantity * it.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : searchAttempted ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#dbc0c1] text-xs text-[#554243] space-y-2">
          <span className="material-symbols-outlined text-[32px] text-[#887173]">info</span>
          <p className="font-bold text-[#450011]">No Order Found</p>
          <p>Please check your Order ID (format: DRS-2026-00001) and try again.</p>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl border border-[#dbc0c1]/50 text-xs text-[#554243]">
          Enter your Order ID above to track your order request in real time.
        </div>
      )}
    </div>
  );
};
