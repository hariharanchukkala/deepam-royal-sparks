import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const HampersScreen: React.FC = () => {
  const { products, addToCart, setCurrentScreen, setSelectedProduct } = useApp();
  const [comboError, setComboError] = useState<Record<string, string>>({});
  const [addedCombo, setAddedCombo] = useState<Record<string, boolean>>({});

  const combos = products.filter((p) => p.isCombo || p.category === 'combo-packs');

  // Verify inventory for every component of a combo
  const checkComboAvailability = (combo: Product): { available: boolean; error?: string } => {
    if (!combo.comboItems || combo.comboItems.length === 0) {
      return { available: combo.stock - combo.reservedStock > 0 };
    }

    for (const item of combo.comboItems) {
      const comp = products.find((p) => p.id === item.productId);
      if (comp) {
        const available = comp.stock - comp.reservedStock;
        if (available < item.quantity) {
          return {
            available: false,
            error: `Component "${comp.name}" is out of stock (${available} left, needs ${item.quantity}).`
          };
        }
      }
    }
    return { available: true };
  };

  const handleAddCombo = (combo: Product) => {
    const check = checkComboAvailability(combo);
    if (!check.available) {
      setComboError((prev) => ({ ...prev, [combo.id]: check.error || 'Components out of stock' }));
      setTimeout(() => setComboError((prev) => ({ ...prev, [combo.id]: '' })), 3500);
      return;
    }

    const res = addToCart(combo, 1);
    if (res.success) {
      setAddedCombo((prev) => ({ ...prev, [combo.id]: true }));
      setTimeout(() => setAddedCombo((prev) => ({ ...prev, [combo.id]: false })), 2000);
    } else {
      setComboError((prev) => ({ ...prev, [combo.id]: res.message || 'Cannot add combo' }));
      setTimeout(() => setComboError((prev) => ({ ...prev, [combo.id]: '' })), 3500);
    }
  };

  return (
    <div className="pt-28 pb-36 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-[#775a00]">
          <span className="material-symbols-outlined text-[18px]">stars</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Complete Celebrations Bundled
          </span>
        </div>
        <h2 className="font-playfair text-xl sm:text-2xl text-[#450011] font-bold">
          Celebration Combos & Hampers
        </h2>
        <p className="text-xs sm:text-sm text-[#554243]">
          Pre-assembled assortments of verified flower pots, sparklers, fountains and chakras with bundled savings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {combos.map((combo) => {
          const avail = checkComboAvailability(combo);
          const isAdded = !!addedCombo[combo.id];
          const errorMsg = comboError[combo.id];

          return (
            <article
              key={combo.id}
              className="bg-white rounded-xl border border-[#dbc0c1]/60 overflow-hidden shadow-xs space-y-3 p-4"
            >
              {/* Image banner */}
              <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#ece0d9]">
                <img
                  src={combo.images[0]}
                  alt={combo.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-[#661023] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Combo Pack
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-playfair text-lg font-bold text-[#450011]">
                  {combo.name}
                </h3>
                <p className="text-xs text-[#554243] mt-0.5">
                  {combo.tagline}
                </p>
              </div>

              {/* Items Included List (Step 35) */}
              {combo.comboItems && combo.comboItems.length > 0 && (
                <div className="bg-[#fef1ea] p-3 rounded-lg border border-[#dbc0c1]/40 space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#775a00] tracking-wider block">
                    Items Included in This Combo:
                  </span>
                  <ul className="space-y-1 text-[#201a16] text-[11px]">
                    {combo.comboItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center">
                        <span>• {item.productName}</span>
                        <span className="font-bold text-[#661023]">
                          {item.quantity} {item.packSize || 'pack'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Individual Value & Savings Breakdown */}
              <div className="bg-[#f8ebe5] p-2.5 rounded-lg border border-[#dbc0c1]/40 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-[#554243] block">Individual Value:</span>
                  <span className="line-through text-gray-500 font-bold">
                    ₹{(combo.individualValue || combo.mrp).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#775a00] block font-bold">Combo Price:</span>
                  <span className="font-playfair text-lg font-bold text-[#450011]">
                    ₹{combo.price.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#133a27] block font-bold">Your Savings:</span>
                  <span className="bg-[#c2edd0] text-[#002414] text-[11px] font-bold px-2 py-0.5 rounded">
                    Save ₹{(combo.savingsAmount || combo.mrp - combo.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <p className="text-[11px] text-[#ba1a1a] font-bold bg-[#ffdad6] p-2 rounded">
                  {errorMsg}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setSelectedProduct(combo);
                    setCurrentScreen('pdp');
                  }}
                  className="px-3 py-2 bg-white border border-[#dbc0c1] text-[#450011] rounded-lg text-xs font-bold hover:bg-[#ece0d9]"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleAddCombo(combo)}
                  disabled={!avail.available}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm ${
                    !avail.available
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isAdded
                      ? 'bg-[#133a27] text-white'
                      : 'bg-[#661023] hover:bg-[#450011] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isAdded ? 'check' : 'add_shopping_cart'}
                  </span>
                  <span>
                    {!avail.available ? 'Component Out of Stock' : isAdded ? 'Combo Added!' : 'Add Combo'}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
