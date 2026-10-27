import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { categories, experienceCategories } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';

interface CatalogueScreenProps {
  onOpenCityModal: () => void;
}

export const CatalogueScreen: React.FC<CatalogueScreenProps> = ({ onOpenCityModal }) => {
  const { products, cartCount, cartTotal, setCurrentScreen } = useApp();

  const [discoveryMode, setDiscoveryMode] = useState<'type' | 'experience'>('type');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [soundFilter, setSoundFilter] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc'>('recommended');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.active) return false;

        // Discovery Method 1: By Product Type
        if (discoveryMode === 'type' && selectedCategory !== 'all') {
          if (p.category !== selectedCategory) return false;
        }

        // Discovery Method 2: By Experience
        if (discoveryMode === 'experience' && selectedExperience !== 'all') {
          if (selectedExperience === 'best-sellers') {
            if (!p.isBestseller) return false;
          } else if (selectedExperience === 'combo-packs') {
            if (!p.isCombo && p.category !== 'combo-packs') return false;
          } else if (p.experienceTag !== selectedExperience) {
            return false;
          }
        }

        // Price Filter
        if (p.price > priceMax) return false;

        // Sound Filter
        if (soundFilter !== 'all') {
          if (soundFilter === 'low' && !p.soundLevel.toLowerCase().includes('low') && !p.soundLevel.toLowerCase().includes('noiseless')) {
            return false;
          }
          if (soundFilter === 'noiseless' && !p.soundLevel.toLowerCase().includes('noiseless') && !p.soundLevel.toLowerCase().includes('silent')) {
            return false;
          }
        }

        // Stock filter
        if (inStockOnly && p.stock - p.reservedStock <= 0) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesCode = p.code.toLowerCase().includes(q);
          const matchesTag = p.tagline.toLowerCase().includes(q);
          const matchesEffect = p.visualEffect.toLowerCase().includes(q);
          if (!matchesName && !matchesCode && !matchesTag && !matchesEffect) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    products,
    discoveryMode,
    selectedCategory,
    selectedExperience,
    searchQuery,
    priceMax,
    soundFilter,
    inStockOnly,
    sortBy
  ]);

  return (
    <div className="pt-28 pb-32 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      {/* Search Input Bar */}
      <section className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#887173] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flower pot, sparklers, rockets..."
            className="w-full bg-white border border-[#dbc0c1]/60 rounded-lg pl-9 pr-8 py-2 text-xs text-[#201a16] placeholder:text-[#887173] focus:outline-none focus:border-[#661023] transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg border text-[#450011] transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-2xs ${
            showFilters || priceMax < 10000 || soundFilter !== 'all' || inStockOnly
              ? 'bg-[#661023] text-white border-[#661023]'
              : 'bg-[#f2e6df] border-[#dbc0c1]/60 hover:bg-[#ece0d9]'
          }`}
          aria-label="Filter Options"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
      </section>

      {/* Expandable Filter Box */}
      {showFilters && (
        <div className="bg-[#fef1ea] p-3 rounded-xl border border-[#dbc0c1]/60 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-[#dbc0c1]/40 font-bold text-[#450011]">
            <span>Filter Products</span>
            <button
              onClick={() => {
                setPriceMax(10000);
                setSoundFilter('all');
                setInStockOnly(false);
                setSortBy('recommended');
              }}
              className="text-[10px] text-[#775a00] hover:underline"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#554243] block mb-1">
                Price Budget
              </label>
              <select
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full bg-white border border-[#dbc0c1] rounded p-1.5 text-xs text-[#201a16]"
              >
                <option value={10000}>All Prices</option>
                <option value={250}>Under ₹250</option>
                <option value={500}>Under ₹500</option>
                <option value={1500}>Under ₹1,500</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#554243] block mb-1">
                Sound Preference
              </label>
              <select
                value={soundFilter}
                onChange={(e) => setSoundFilter(e.target.value)}
                className="w-full bg-white border border-[#dbc0c1] rounded p-1.5 text-xs text-[#201a16]"
              >
                <option value="all">All Sound Levels</option>
                <option value="noiseless">Noiseless (0 dB)</option>
                <option value="low">Low Acoustic</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#661023]"
              />
              <span className="text-[11px] font-semibold text-[#201a16]">
                In Stock Only
              </span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recommended' | 'price-asc' | 'price-desc')}
              className="bg-white border border-[#dbc0c1] rounded p-1 text-[11px]"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Discovery Mode Switcher (Step 10: By Product Type vs By Experience) */}
      <div className="bg-[#f2e6df] p-1 rounded-xl flex text-xs font-bold border border-[#dbc0c1]/40">
        <button
          onClick={() => setDiscoveryMode('type')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            discoveryMode === 'type'
              ? 'bg-[#661023] text-white shadow-2xs'
              : 'text-[#554243] hover:text-[#201a16]'
          }`}
        >
          By Product Type
        </button>
        <button
          onClick={() => setDiscoveryMode('experience')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            discoveryMode === 'experience'
              ? 'bg-[#661023] text-white shadow-2xs'
              : 'text-[#554243] hover:text-[#201a16]'
          }`}
        >
          By Experience
        </button>
      </div>

      {/* Method 1: Product Types Carousel */}
      {discoveryMode === 'type' ? (
        <section className="overflow-x-auto no-scrollbar -mx-4 px-4 flex items-center gap-1.5 pb-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#661023] text-white'
                : 'bg-white text-[#554243] border border-[#dbc0c1]/60'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#661023] text-white'
                  : 'bg-white text-[#554243] border border-[#dbc0c1]/60'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </section>
      ) : (
        /* Method 2: Experience Filter Pills */
        <section className="overflow-x-auto no-scrollbar -mx-4 px-4 flex items-center gap-1.5 pb-0.5">
          {experienceCategories.map((exp) => (
            <button
              key={exp.id}
              onClick={() => setSelectedExperience(exp.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-all flex items-center gap-1 ${
                selectedExperience === exp.id
                  ? 'bg-[#661023] text-white'
                  : 'bg-white text-[#554243] border border-[#dbc0c1]/60'
              }`}
            >
              {exp.icon && (
                <span className="material-symbols-outlined text-[13px]">{exp.icon}</span>
              )}
              <span>{exp.label}</span>
            </button>
          ))}
        </section>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-playfair text-lg text-[#450011] font-bold">
            {discoveryMode === 'type'
              ? selectedCategory === 'all'
                ? 'Explore All Crackers'
                : categories.find((c) => c.id === selectedCategory)?.name || 'Crackers'
              : experienceCategories.find((e) => e.id === selectedExperience)?.label || 'Experience List'}
          </h2>
          <p className="text-xs text-[#554243]">
            Verified Sivakasi formulations with transparent pricing
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#775a00] bg-[#f2e6df] px-2 py-0.5 rounded border border-[#dbc0c1]/40">
          {filteredProducts.length} Available
        </span>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#dbc0c1] p-6 space-y-2">
          <span className="material-symbols-outlined text-[36px] text-[#887173]">
            search_off
          </span>
          <h3 className="font-playfair text-base font-semibold text-[#450011]">
            No crackers found
          </h3>
          <p className="text-xs text-[#554243]">
            Try adjusting your price range, sound filters or search keywords.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedExperience('all');
              setPriceMax(10000);
              setSoundFilter('all');
              setInStockOnly(false);
            }}
            className="px-4 py-1.5 rounded-lg bg-[#661023] text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Product Cards Grid: 1 column on mobile, 2 on tablet, 3 on laptop, 4 on desktop */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {/* Floating Bottom Cart Bar (Only when Cart has items on mobile devices!) */}
      {cartCount > 0 && (
        <aside className="fixed bottom-[60px] left-0 w-full z-40 px-4 max-w-md mx-auto pointer-events-none md:hidden">
          <div className="pointer-events-auto bg-[#fff8f5]/95 backdrop-blur-md border border-[#D4AF37]/50 rounded-xl p-2.5 shadow-[0_8px_28px_rgba(102,16,35,0.18)] flex items-center justify-between gap-2">
            <div className="pl-1">
              <span className="text-xs font-bold text-[#450011] block">
                {cartCount} Item{cartCount > 1 ? 's' : ''} in Cart
              </span>
              <p className="font-playfair text-[17px] font-bold text-[#201a16] leading-tight">
                ₹{cartTotal.toLocaleString('en-IN')}
              </p>
            </div>

            <button
              onClick={() => setCurrentScreen('checkout')}
              className="bg-[#128C7E] hover:bg-[#0c6b60] text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Review & WhatsApp Order</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
