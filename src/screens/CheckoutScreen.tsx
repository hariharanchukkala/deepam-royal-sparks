import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerDetails } from '../types';

export const CheckoutScreen: React.FC = () => {
  const {
    cart,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    settings,
    createOrder,
    generateWhatsAppPayload,
    generateCartWhatsAppPayload,
    dispatchWhatsAppOrder,
    setCurrentScreen,
    currentUser,
    triggerAutoLocation,
    isLocating
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState<'details' | 'review'>('details');

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    whatsapp: currentUser?.whatsapp || '',
    address: currentUser?.address || '',
    area: currentUser?.area || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || '',
    notes: ''
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isConfirmedCheck, setIsConfirmedCheck] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedCart, setCopiedCart] = useState<boolean>(false);
  const [copiedReview, setCopiedReview] = useState<boolean>(false);

  // Official Business WhatsApp Number strictly enforced for all dispatch URLs
  const cleanPhone = '917993785371';

  // Fast direct WhatsApp Cart Payload for sharing directly from cart
  const cartWhatsAppText = generateCartWhatsAppPayload(cart, customer, deliveryMethod);
  const waCartUrl = `https://wa.me/917993785371?text=${encodeURIComponent(cartWhatsAppText)}`;
  const waWebCartUrl = `https://web.whatsapp.com/send?phone=917993785371&text=${encodeURIComponent(cartWhatsAppText)}`;

  const handleCopyCart = () => {
    navigator.clipboard.writeText(cartWhatsAppText);
    setCopiedCart(true);
    setTimeout(() => setCopiedCart(false), 2500);
  };

  const subtotal = cartTotal;
  const isDiscountEligible = subtotal >= 3000;
  const discount = isDiscountEligible ? settings.festiveDiscountAmount : 0;
  const deliveryCharge =
    deliveryMethod === 'pickup' || subtotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.deliveryCharge;
  const finalPayable = Math.max(0, subtotal - discount + (cart.length > 0 ? deliveryCharge : 0));

  const handleAutoLocation = async () => {
    setLocationStatus('Pinpointing location...');
    try {
      const loc = await triggerAutoLocation();
      setCustomer((prev) => ({
        ...prev,
        city: loc.city || prev.city,
        area: loc.area || prev.area,
        address: loc.address || prev.address,
        state: loc.state || prev.state,
        pincode: loc.pincode || prev.pincode
      }));
      setLocationStatus(`✓ Detected: ${loc.city || 'Location coordinates acquired'}`);
      setTimeout(() => setLocationStatus(''), 3000);
    } catch {
      setLocationStatus('Location unavailable. Please enter address manually.');
      setTimeout(() => setLocationStatus(''), 3500);
    }
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (!customer.phone.trim()) {
      setValidationError('Please enter your mobile phone number');
      return;
    }
    if (deliveryMethod === 'delivery' && !customer.address.trim()) {
      setValidationError('Please enter your delivery street address');
      return;
    }
    if (!isConfirmedCheck) {
      setValidationError('Please confirm that your order details are correct');
      return;
    }
    setValidationError('');
    setCheckoutStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Full review order payload for Step 2 WhatsApp dispatch
  const reviewItemsText = cart
    .map(
      (c, idx) =>
        `${idx + 1}. ${c.product.name} × ${c.quantity}${c.product.price > 0 ? ` (₹${c.product.price})` : ''}`
    )
    .join('\n');

  const reviewAddress =
    deliveryMethod === 'pickup'
      ? 'Store / Hub Pickup'
      : `${customer.address}${customer.area ? `, ${customer.area}` : ''}${customer.city ? `, ${customer.city}` : ''}${customer.pincode ? ` - ${customer.pincode}` : ''}`;

  const reviewWhatsAppText =
    `🪔 *${settings.businessName.toUpperCase()}*\n` +
    `*NEW CRACKER ORDER REQUEST*\n\n` +
    `👤 *Customer:* ${customer.name || 'Customer'}\n` +
    `📞 *Mobile:* ${customer.phone}\n` +
    `📍 *Delivery:* ${deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}\n` +
    (deliveryMethod === 'delivery' && reviewAddress ? `🏠 *Address:* ${reviewAddress}\n` : '') +
    `\n📦 *ORDERED CRACKERS (${cart.length} items):*\n` +
    `${reviewItemsText}\n\n` +
    `💰 *Estimated Bill:* ${finalPayable > 0 ? `₹${finalPayable.toLocaleString('en-IN')}` : 'Price on Request / Final Invoice'}\n` +
    `\nPlease confirm stock availability & final bill for payment!`;

  const waReviewUrl = `https://wa.me/917993785371?text=${encodeURIComponent(reviewWhatsAppText)}`;
  const waWebReviewUrl = `https://web.whatsapp.com/send?phone=917993785371&text=${encodeURIComponent(reviewWhatsAppText)}`;

  const handleCopyReview = () => {
    navigator.clipboard.writeText(reviewWhatsAppText);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 2500);
  };

  const handleFinalSubmitWhatsApp = async () => {
    if (cart.length === 0) {
      setValidationError('Your cart is empty. Please add items to proceed.');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      await createOrder(customer, deliveryMethod);
      setCurrentScreen('confirmation');
    } catch (err) {
      console.warn('Order sync fallback:', err);
      setCurrentScreen('confirmation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fff8f5] text-[#201a16] min-h-screen pb-36">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#fff8f5]/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-[#dbc0c1]/40 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (checkoutStep === 'review') {
                setCheckoutStep('details');
              } else {
                setCurrentScreen('catalogue');
              }
            }}
            aria-label="Go Back"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#661023] hover:bg-[#f8ebe5] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-playfair text-[17px] font-semibold text-[#661023] leading-tight">
              {checkoutStep === 'details' ? 'Your Celebration Cart' : 'Review & Confirm Order'}
            </h1>
            <p className="text-[10px] uppercase tracking-wider text-[#775a00] font-bold">
              {checkoutStep === 'details' ? 'Step 1 of 2: Cart & Details' : 'Step 2 of 2: WhatsApp Dispatch'}
            </p>
          </div>
        </div>

        {cart.length > 0 && checkoutStep === 'details' && (
          <button
            onClick={clearCart}
            className="text-[11px] text-[#ba1a1a] font-bold hover:underline"
          >
            Clear Cart
          </button>
        )}
      </header>

      {/* Main Container: Responsive across Mobile and Laptop */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#dbc0c1] p-8 text-center space-y-3">
            <span className="material-symbols-outlined text-[42px] text-[#887173]">
              remove_shopping_cart
            </span>
            <h3 className="font-playfair text-lg font-bold text-[#450011]">
              Your Cart is Empty
            </h3>
            <p className="text-xs text-[#554243]">
              Explore our verified flower pots, sparklers, and celebration combos.
            </p>
            <button
              onClick={() => setCurrentScreen('catalogue')}
              className="px-5 py-2 bg-[#661023] text-white rounded-lg text-xs font-bold hover:bg-[#450011]"
            >
              Start Shopping
            </button>
          </div>
        ) : checkoutStep === 'details' ? (
          <>
            {/* Step 12: Cart Items List */}
            <section className="bg-white rounded-xl border border-[#dbc0c1]/50 divide-y divide-[#dbc0c1]/20 overflow-hidden shadow-xs">
              <div className="p-3 bg-[#fef1ea] flex justify-between items-center text-xs font-bold text-[#450011]">
                <span>Items in Celebration ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>Unit Price</span>
              </div>

              {cart.map((item) => (
                <article key={item.productId} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 rounded object-cover border border-[#dbc0c1]/40 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#201a16] truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-[#554243]">{item.product.packSize}</p>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center border border-[#dbc0c1] rounded bg-[#fff8f5] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#661023] hover:bg-[#ece0d9] font-bold"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-[11px] font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-[#661023] hover:bg-[#ece0d9] font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[10px] text-[#ba1a1a] hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#450011]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      (₹{item.product.price} each)
                    </span>
                  </div>
                </article>
              ))}
            </section>

            {/* Quick Share Cart on WhatsApp (Immediate 1-Click Action) */}
            <div className="bg-[#eefcf2] border-2 border-[#25D366] rounded-xl p-3.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#0f5132] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px] text-[#25D366]">chat</span>
                  Instant Order / Share Cart on WhatsApp
                </span>
                <span className="text-[10px] font-mono font-bold text-[#0f5132] bg-[#c2edd0] px-2 py-0.5 rounded-full">
                  +91 79937 85371
                </span>
              </div>
              <p className="text-[11px] text-[#2c533e] leading-snug">
                Want to send your cracker list directly without typing your full address? Click below to share your cart items to our official WhatsApp line:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
                <a
                  href={waCartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#1ebc57] text-[#002414] font-black rounded-lg text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>SEND CART LIST ON WHATSAPP</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyCart}
                  className="py-2.5 px-3 bg-white hover:bg-[#f2faf5] text-[#0f5132] font-bold rounded-lg text-xs border border-[#25D366]/60 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedCart ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedCart ? 'Copied to Clipboard!' : 'Copy Cart Items'}</span>
                </button>
              </div>
              <a
                href={waWebCartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[10px] text-[#0f5132] hover:underline font-semibold"
              >
                Open in WhatsApp Web (Browser / Desktop) →
              </a>
            </div>

            {/* Delivery Method Selector */}
            <div className="bg-[#f2e6df] p-1 rounded-xl flex text-xs font-bold border border-[#dbc0c1]/40">
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  deliveryMethod === 'delivery'
                    ? 'bg-[#661023] text-white shadow-2xs'
                    : 'text-[#554243] hover:text-[#201a16]'
                }`}
              >
                Home Delivery
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  deliveryMethod === 'pickup'
                    ? 'bg-[#661023] text-white shadow-2xs'
                    : 'text-[#554243] hover:text-[#201a16]'
                }`}
              >
                Store / Hub Pickup
              </button>
            </div>

            {/* Step 13: Customer Contact & Delivery Form */}
            <form onSubmit={handleProceedToReview} className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-[#dbc0c1]/30">
                <h3 className="font-playfair text-sm font-bold text-[#450011] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Customer Information (No Registration Required)
                </h3>
              </div>

              <div>
                <label className="font-bold text-[#554243] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#554243] block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="e.g. 7993785371"
                    className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#554243] block mb-1">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={customer.whatsapp || customer.phone}
                    onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })}
                    placeholder="For order confirmation"
                    className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="space-y-2 pt-1 border-t border-[#dbc0c1]/30">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#554243]">Delivery Address *</label>
                    <button
                      type="button"
                      onClick={handleAutoLocation}
                      disabled={isLocating}
                      className="text-[11px] font-bold text-[#133a27] flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isLocating ? 'sync' : 'my_location'}
                      </span>
                      <span>{isLocating ? 'Detecting...' : 'Auto-Fill GPS'}</span>
                    </button>
                  </div>

                  {locationStatus && (
                    <p className="text-[10px] text-[#133a27] font-bold bg-[#c2edd0] p-1 rounded">
                      {locationStatus}
                    </p>
                  )}

                  <input
                    type="text"
                    required={deliveryMethod === 'delivery'}
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="House / Flat / Street address"
                    className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customer.area}
                      onChange={(e) => setCustomer({ ...customer, area: e.target.value })}
                      placeholder="Area / Locality"
                      className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="City"
                      className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customer.state}
                      onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                      placeholder="State"
                      className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={customer.pincode}
                      onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                      placeholder="Pincode"
                      className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] text-[#554243] block mb-1">Optional Notes</label>
                <input
                  type="text"
                  value={customer.notes || ''}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="e.g. Ring bell twice, deliver after 5pm"
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 text-xs"
                />
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-2 pt-2 text-xs text-[#554243] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfirmedCheck}
                  onChange={(e) => setIsConfirmedCheck(e.target.checked)}
                  className="rounded text-[#661023] mt-0.5"
                />
                <span>I confirm that my order details are correct.</span>
              </label>

              {validationError && (
                <p className="text-[11px] text-[#ba1a1a] font-bold bg-[#ffdad6] p-2 rounded">
                  {validationError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#661023] hover:bg-[#450011] text-white font-bold rounded-lg text-xs shadow active:scale-95 transition-all"
              >
                Review Order & Price Summary
              </button>
            </form>
          </>
        ) : (
          /* Step 14: Order Review Screen */
          <div className="max-w-3xl mx-auto space-y-4 text-xs">
            {/* Customer Details Summary */}
            <div className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-2">
              <h3 className="font-playfair text-sm font-bold text-[#450011] pb-1 border-b">
                Customer & Delivery Summary
              </h3>
              <div className="space-y-1 text-[#201a16]">
                <p><span className="text-gray-500">Name:</span> <strong>{customer.name}</strong></p>
                <p><span className="text-gray-500">Mobile:</span> <strong className="font-mono">{customer.phone}</strong></p>
                <p><span className="text-gray-500">WhatsApp:</span> <strong className="font-mono">{customer.whatsapp || customer.phone}</strong></p>
                <p><span className="text-gray-500">Method:</span> <strong>{deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</strong></p>
                {deliveryMethod === 'delivery' && (
                  <p>
                    <span className="text-gray-500">Address:</span>{' '}
                    <span>{customer.address}{customer.area ? `, ${customer.area}` : ''}{customer.city ? `, ${customer.city}` : ''}{customer.pincode ? ` - ${customer.pincode}` : ''}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Complete Product List */}
            <div className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-2">
              <h3 className="font-playfair text-sm font-bold text-[#450011] pb-1 border-b">
                Selected Crackers ({cart.length} items)
              </h3>
              <div className="divide-y divide-[#dbc0c1]/20">
                {cart.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#201a16]">{item.product.name}</p>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity} × ₹{item.product.price}</p>
                    </div>
                    <span className="font-bold text-[#661023]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 shadow-xs space-y-2">
              <h3 className="font-playfair text-sm font-bold text-[#450011] pb-1 border-b">
                Price Breakdown
              </h3>
              <div className="space-y-1.5 text-[#201a16]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#ba1a1a]">
                    <span>Festive Discount:</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Charge:</span>
                  <span>{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}</span>
                </div>
                <div className="pt-2 border-t flex justify-between items-baseline font-bold">
                  <span className="font-playfair text-base text-[#450011]">Final Total:</span>
                  <span className="font-playfair text-xl text-[#661023]">
                    ₹{finalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Explanation Box */}
            <div className="bg-[#fef1ea] p-3.5 rounded-xl border border-[#dbc0c1]/60 text-[#554243] space-y-2">
              <p className="text-xs leading-relaxed font-medium">
                Your order will be sent to us on WhatsApp for availability confirmation. Payment is not made at this step.
              </p>
            </div>

            {/* Final WhatsApp Action Panel */}
            <div className="bg-[#eefcf2] p-4 rounded-xl border-2 border-[#25D366] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f5132] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
                  Confirm Order & Dispatch to WhatsApp
                </span>
                <span className="text-[11px] font-mono font-bold text-[#0f5132]">
                  +91 79937 85371
                </span>
              </div>

              {/* Direct Primary Link to WhatsApp */}
              <a
                href={waReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleFinalSubmitWhatsApp}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#1ebc57] text-[#002414] font-black rounded-xl text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all text-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>OPEN WHATSAPP (+91 79937 85371)</span>
              </a>

              {/* Desktop WhatsApp Web Alternative */}
              <a
                href={waWebReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleFinalSubmitWhatsApp}
                className="w-full py-2 bg-white hover:bg-[#dcf8e6] text-[#0f5132] font-bold rounded-lg text-xs border border-[#25D366]/60 flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <span className="material-symbols-outlined text-[16px]">laptop_mac</span>
                <span>Open in WhatsApp Web (Browser / Desktop)</span>
              </a>

              {/* Copy Full Manifest Button */}
              <button
                type="button"
                onClick={handleCopyReview}
                className="w-full py-2 bg-[#fff8f5] hover:bg-[#f8ebe5] text-[#554243] font-semibold rounded-lg text-xs border border-[#dbc0c1] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copiedReview ? 'check' : 'content_copy'}
                </span>
                <span>{copiedReview ? '✓ Order Message Copied! Ready to paste' : 'Copy Full Order Message (Manual Paste)'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
