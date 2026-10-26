import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EffectSimulationModal } from '../components/EffectSimulationModal';

export const ProductDetailScreen: React.FC = () => {
  const { selectedProduct, products, addToCart, setCurrentScreen } = useApp();
  const product = selectedProduct || products[0];

  const [activeThumb, setActiveThumb] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const availableStock = Math.max(0, product.stock - product.reservedStock);
  const isOutOfStock = availableStock <= 0;

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, availableStock || 1)));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      setIsAddedToast(true);
      setTimeout(() => setIsAddedToast(false), 2000);
    } else {
      setFeedbackMsg(res.message || 'Cannot add to cart');
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  return (
    <div className="bg-[#fff8f5] text-[#201a16] min-h-screen pb-32">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#fff8f5]/90 backdrop-blur-md border-b border-[#dbc0c1]/40 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('catalogue')}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#450011] hover:bg-[#ece0d9] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>

          <span className="text-xs uppercase tracking-widest text-[#450011] font-bold">
            Product Experience
          </span>

          <button
            onClick={() => setCurrentScreen('checkout')}
            aria-label="View Cart"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#450011] hover:bg-[#ece0d9]"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto pt-14 px-4 space-y-4">
        {/* Product Media Box */}
        <section className="mt-2 bg-white rounded-xl overflow-hidden shadow-xs border border-[#dbc0c1]/40">
          <div className="relative aspect-square w-full overflow-hidden bg-[#ece0d9]">
            <img
              src={product.images[activeThumb] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-200"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-[#ba1a1a] text-white text-xs font-bold px-3 py-1 rounded">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          {/* Curated Thumbnails */}
          {product.images.length > 1 && (
            <div className="p-3 bg-[#fef1ea] flex items-center gap-2 border-t border-[#dbc0c1]/40">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveThumb(idx)}
                  className={`w-12 h-12 rounded overflow-hidden shadow-2xs focus:outline-none transition-all ${
                    activeThumb === idx
                      ? 'ring-2 ring-[#661023] scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Title & Pricing */}
        <section className="bg-white p-4 rounded-xl shadow-xs border border-[#dbc0c1]/40 space-y-2.5">
          <h1 className="font-playfair text-[22px] text-[#450011] tracking-tight font-bold leading-snug">
            {product.name}
          </h1>

          <p className="text-xs text-[#554243] leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-baseline gap-2 pt-1 border-t border-[#dbc0c1]/30">
            {product.price > 0 ? (
              <>
                <span className="font-playfair text-2xl text-[#450011] font-bold">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm line-through text-[#887173]">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-[#fece57] text-[#735700] px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {product.discountPercent}% Off
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-playfair text-xl text-[#775a00] font-bold">
                  Price on Request
                </span>
                <span className="text-[11px] text-[#775a00] bg-[#fff0d4] px-2 py-0.5 rounded border border-[#e8c374]">
                  Price to be updated by merchant
                </span>
              </div>
            )}
            <span className="text-xs text-gray-500 ml-auto">
              Pack of {product.packSize}
            </span>
          </div>

          {availableStock > 0 && availableStock <= product.lowStockThreshold && (
            <p className="text-[11px] text-[#ba1a1a] font-bold">
              Only {availableStock} boxes remaining in stock
            </p>
          )}

          {feedbackMsg && (
            <p className="text-xs text-[#ba1a1a] font-bold bg-[#ffdad6] p-2 rounded">
              {feedbackMsg}
            </p>
          )}
        </section>

        {/* Clear Visual Experience Section (Mandatory Step 7) */}
        <section className="bg-white p-4 rounded-xl shadow-xs border border-[#dbc0c1]/40 space-y-3">
          <h2 className="font-playfair text-base text-[#450011] font-bold pb-1 border-b border-[#dbc0c1]/30">
            Product Experience Guide
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2 bg-[#fef1ea] p-2.5 rounded-lg border border-[#dbc0c1]/40">
              <span className="text-[10px] uppercase font-bold text-[#775a00] block">
                Visual Experience
              </span>
              <p className="font-semibold text-[#201a16] text-[13px] mt-0.5">
                {product.visualEffect}
              </p>
              <p className="text-[11px] text-[#554243] mt-0.5">
                {product.experienceDescription}
              </p>
            </div>

            <div className="bg-[#fef1ea] p-2.5 rounded-lg border border-[#dbc0c1]/40">
              <span className="text-[10px] uppercase font-bold text-[#775a00] block">
                Sound Level
              </span>
              <p className="font-bold text-[#201a16] text-[13px] mt-0.5">
                {product.soundLevel}
              </p>
            </div>

            <div className="bg-[#fef1ea] p-2.5 rounded-lg border border-[#dbc0c1]/40">
              <span className="text-[10px] uppercase font-bold text-[#775a00] block">
                Duration
              </span>
              <p className="font-bold text-[#201a16] text-[13px] mt-0.5">
                {product.duration}
              </p>
            </div>

            <div className="bg-[#fef1ea] p-2.5 rounded-lg border border-[#dbc0c1]/40">
              <span className="text-[10px] uppercase font-bold text-[#775a00] block">
                Pack Size
              </span>
              <p className="font-bold text-[#201a16] text-[13px] mt-0.5">
                {product.packSize}
              </p>
            </div>

            <div className="bg-[#fef1ea] p-2.5 rounded-lg border border-[#dbc0c1]/40">
              <span className="text-[10px] uppercase font-bold text-[#775a00] block">
                Best For
              </span>
              <p className="font-bold text-[#201a16] text-[11px] mt-0.5">
                {product.bestFor}
              </p>
            </div>
          </div>
        </section>

        {/* Video Demonstration Card */}
        <section className="bg-[#362f2b] text-[#fbeee7] rounded-xl overflow-hidden p-4 shadow-sm border border-[#D4AF37]/30 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[#ffdf98] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            <span>Effect Demonstration Video</span>
          </div>

          <p className="text-xs text-[#ece0d9]/90">
            Preview the visual burst pattern and firing sequence recorded at our Sivakasi test range.
          </p>

          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="w-full py-2.5 px-4 bg-[#775a00] hover:bg-[#5a4300] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            <span>Watch Demonstration Effect</span>
          </button>
        </section>

        {/* Safety & Protocol Instructions */}
        {product.safetyGuidelines && product.safetyGuidelines.length > 0 && (
          <section className="bg-white p-4 rounded-xl shadow-xs border border-[#dbc0c1]/40 space-y-2 text-xs">
            <h3 className="font-playfair text-sm text-[#450011] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#661023]">security</span>
              Safety & Handling Guidelines
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-[#554243] text-[11px]">
              {product.safetyGuidelines.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 bg-[#fff8f5]/95 backdrop-blur-md border-t border-[#dbc0c1]/40 shadow-md">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-[#dbc0c1] rounded-lg bg-white overflow-hidden">
            <button
              onClick={() => handleQtyChange(-1)}
              disabled={isOutOfStock}
              className="w-8 h-8 flex items-center justify-center text-[#661023] hover:bg-[#f8ebe5] font-bold active:scale-90 transition-transform"
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-bold text-[#201a16]">
              {quantity}
            </span>
            <button
              onClick={() => handleQtyChange(1)}
              disabled={isOutOfStock || quantity >= availableStock}
              className="w-8 h-8 flex items-center justify-center text-[#661023] hover:bg-[#f8ebe5] font-bold active:scale-90 transition-transform"
            >
              +
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isAddedToast
                ? 'bg-[#133a27] text-white'
                : 'bg-[#661023] hover:bg-[#450011] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAddedToast ? 'check' : 'add_shopping_cart'}
            </span>
            <span>
              {isOutOfStock
                ? 'Out of Stock'
                : isAddedToast
                ? 'Added to Cart!'
                : `Add to Cart • ₹${(product.price * quantity).toLocaleString('en-IN')}`}
            </span>
          </button>
        </div>
      </aside>

      {/* Effect Video Demonstration Modal */}
      <EffectSimulationModal
        product={product}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onAdd={handleAddToCart}
      />
    </div>
  );
};
