import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct, setCurrentScreen } = useApp();
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const availableStock = Math.max(0, product.stock - product.reservedStock);
  const isOutOfStock = availableStock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    const res = addToCart(product, 1);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1400);
    } else {
      setErrorMessage(res.message || 'Cannot add item');
      setTimeout(() => setErrorMessage(''), 2500);
    }
  };

  const handleCardClick = () => {
    setSelectedProduct(product);
    setCurrentScreen('pdp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <article
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-[#dbc0c1]/50 overflow-hidden shadow-xs hover:border-[#661023]/40 transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Product Image Frame */}
        <div className="relative w-full aspect-[4/3] bg-[#ece0d9] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            loading="lazy"
          />

          {/* Clean metadata badge only if applicable */}
          {product.isBestseller && (
            <div className="absolute top-2 left-2 pointer-events-none">
              <span className="bg-[#661023] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
                Best Seller
              </span>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center">
              <span className="bg-[#ba1a1a] text-white text-xs font-bold px-3 py-1 rounded shadow">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3.5 space-y-2">
          <div>
            <h3 className="font-playfair text-[16px] font-bold text-[#450011] leading-snug group-hover:text-[#661023] transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-[#554243] mt-0.5 line-clamp-1">
              {product.tagline}
            </p>
          </div>

          {/* Quick Experience Indicators (Visual, Sound, Duration, Pack) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#554243] pt-0.5 border-t border-[#dbc0c1]/30">
            {product.visualEffect && (
              <span className="flex items-center gap-1 font-medium">
                <span className="text-[#775a00]">✨</span>
                <span>{product.visualEffect}</span>
              </span>
            )}
            {product.soundLevel && (
              <span className="flex items-center gap-1 font-medium">
                <span>🔊</span>
                <span>{product.soundLevel}</span>
              </span>
            )}
            {product.duration && (
              <span className="flex items-center gap-1">
                <span>⏱</span>
                <span>{product.duration}</span>
              </span>
            )}
            <span className="text-[10px] text-[#775a00] font-bold">
              • {product.packSize}
            </span>
          </div>

          {errorMessage && (
            <p className="text-[10px] text-[#ba1a1a] font-bold bg-[#ffdad6] p-1 rounded">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="p-3.5 pt-0 flex items-center justify-between gap-2 border-t border-[#dbc0c1]/20 mt-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            {product.price > 0 ? (
              <>
                <span className="font-playfair text-lg font-bold text-[#450011]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span className="text-xs text-[#887173] line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs font-bold text-[#775a00] bg-[#fff0d4] px-2 py-0.5 rounded border border-[#e8c374]">
                Price on Request
              </span>
            )}
          </div>
          {availableStock > 0 && availableStock <= product.lowStockThreshold && (
            <span className="text-[10px] text-[#ba1a1a] font-bold block">
              Only {availableStock} left
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isAdded
              ? 'bg-[#133a27] text-white'
              : 'bg-[#661023] hover:bg-[#450011] text-white'
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isAdded ? 'check' : 'add'}
          </span>
          <span>{isAdded ? 'Added' : '+ ADD'}</span>
        </button>
      </div>
    </article>
  );
};
