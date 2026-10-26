import React, { useState } from 'react';
import { Product, SoundLevel } from '../types';
import { categories } from '../data/mockData';

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Product) => void;
  onDelete?: (productId: string) => void;
}

// Preset verified Sivakasi fireworks photos the admin can choose from or paste custom URL
const CURATED_FIREWORK_PHOTOS = [
  {
    name: 'Maharaja Brocade Willow Box',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbXGNhmyHPk9mSA4ew5cdusKklhAQuBE0UkFm6Ts-sJ_Tb8Q6uI-N18Cg0TYR6yQ1NctRa3S3rO8vd3Tq_y7lCx0rNlQNUeRxazV_hsrf7MJBb2_cETjityAzH_Rw1mmyrGVBCoU7RFr7iXKX-eljGlHySDsyc7xCOPxvGXRMgm_qi31d2YsG6B9FC2XpQNRCWSLRTLz4E4vb2V7z4E1Qzqo9t2p_pPaBYbzxYuLCnuH-0vYqzV6M'
  },
  {
    name: 'Sahasra Silver Cones',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7cy_E8T4z0E2xPFmBNZbF00pz0c9je7fT1pYxUdK4MUnkYJK25bZkWWVKQO2x8jK3KT6mL_xf_fViCZWyt9GqSP8clsQWavBBOw-0vQspck0Nx0tWK18ZxiOMq1fbKj34eOdI2mhFeh3m3KqgJbURKmdnJpEfqDCNpqKZPdkcEP5Z7oa8RTzBY2HNqEZ4qGXv7Lm8zhagy5hfQanmqSWrTkcBnqSSV1bIh5BBBmnZaaFz2tqUwCM'
  },
  {
    name: 'Royal Thunder King 10-Shot',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGVJwHYa8ITKZIXP3E-IFUJU7YtKDWtSWGNd62s9hbZW_LvfbeTR3p-TnOz2HCAbg6UvDZ9l9PvzBst0f0RJrZm2Uq8gFpbJT8GnnmrbSasLAHhQLdQ_Md6Ba6NSU1HCR4YoVSDvNWoOdmkqRmO1-bZGV_RxYIAxSOZACFQf3FYcneOvsYt8P3FaAgSQO2ad8S7zwDjOEhnA94VFMo2Vw1o2fE0bU8e2YfFwtf1n6wjBTE5Ha9eqo'
  },
  {
    name: 'Shimmering Hand Sparklers',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCJbPrExfeBXv97FTdze067jaiX7KO2_hxRNXuhzHug_bmE4A1E12D2LWeRle4a_avdmnj06o3ivJy9HiKychux_esMTeYjyKhIcQuAXFL5Fw38KOPT-2AFmBH-yDjwIg2sbbY9aWTL_mtDJrL_VspXMNzHbmwsJpMeLmAwxcTFjncTiBiJdV-dDeQnJ5GppbYGjuPmObhv9V5xN0oLKWClXPq1PvHahy3laPy4La4sX44dk7-ab8'
  },
  {
    name: 'Shahi Anar Gold Bloom',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3l3_T5i_rWytea4vY_AM9OEKx_ota3pejbXALSrSJkuwOFwBTfsTB8szqxIo86GnvKlnZgpUgzsp3Hl6MgLFqZ5S0awW6TzTi3EXtUpZFmEjjqymMCok5YhOsMFzI4bPdW7oDlZqr9kYmXtB46_MYU-g_8RrfqmBk7-c40hWnhbS8DzI72RRywLRkrdvB_bGvrhXzRQNmKUNcOtioCG2PdiDl2gALvWRDS7rqpcQZ1boPYBHHrZM'
  },
  {
    name: 'Golden Spinning Chakkars',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQwjT9z8EKNWiK5M3EJgNFJuyoUj8c0dgnTp4OoalLJoyO954qHUbZ2ifrL_r68ydaUXMjs8Tyi7VUaDtyyn4ybT8v8jSAek3aHM3G3YuX-w9Xt-lLCue56dM8r8M9H4PZxmXwFX1a9b4xWnaXgFtco-cOJGclenB3zP-ZYIX40cwrFCIuj_GZeWuzms5Yqbe6BRLjeg5E9JgxhfKPhinqb10MpJ8XCWDFeOfk2-w82LTghf6UUAM'
  },
  {
    name: 'Night Sky Burst Willow',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATSTFKOz9ovFL95B13xhd-Qbd5-7c-1hU-x25kvo0fer9xsZEmkQGUR4_GCjJ2plIBnstEFe_KQeRicTcU9t2yGQd91eq_s3f1h-g7QfOuTKpOGtLrSmJPWJaKqHZMesFlGYs2a9D1Qc3uGBptLEzrIkLKiz__W-Ks7uVrqmzJis8HM71SNTgbg_Ir7OWB6G2ZNlEV_ptPYOVujyXZomHRAimT_28ZDUFgF7y6eoA0m5VTKathm5s'
  },
  {
    name: 'Celebration Gift Chest',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOgB7rS2Obf7JNe0uUmL3jSMdZPgFd2C_3hsr-_PAoezuXrS_ADeaTSlPyVOA1qIIQNCUEkzRZhP2gbnWJm90rp4Rr3RO9uStE7jkU8IfCsk7NQYJekcpDkIhqPDnm2CaTrEvCzxRgOu3XbyAk0kIYdeDorW16mJ0aaVwAhzTucXZvzUdcCT_ZL9tydBle-iUnDtsoAeMOr4Fyqz95rhSf48u1qpY8tuMUeTWhxT0zRVap5kwXiE0'
  }
];

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  if (!isOpen) return null;

  const isNew = !product;

  const [formData, setFormData] = useState<Product>(
    product || {
      id: `prod-${Date.now()}`,
      code: `DSP-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'aerial-cakes',
      tagline: '',
      description: '',
      experienceDescription: '',
      visualEffect: 'Golden Brocade Palms',
      soundLevel: 'Low 85dB',
      soundDb: 85,
      duration: '45s Continuous',
      altitude: '120 Ft / 36m',
      packSize: '1 Box',
      mrp: 1200,
      price: 950,
      discountPercent: 20,
      stock: 30,
      reservedStock: 0,
      lowStockThreshold: 10,
      isFeatured: false,
      isBestseller: false,
      isGreenCertified: true,
      isZeroBarium: true,
      emissionClass: 'Class A Low-Smoke',
      pesoLicense: 'E-4482',
      rating: 4.9,
      reviewsCount: 12,
      images: [CURATED_FIREWORK_PHOTOS[0].url],
      safetyGuidelines: ['Maintain 15m safe perimeter', 'Place on level earth', 'Ignite fuse with agarbatti'],
      bestFor: 'Family celebration',
      active: true
    }
  );

  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'specs'>('details');
  const [formError, setFormError] = useState<string>('');

  const handlePriceChange = (price: number, mrp: number) => {
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    setFormData({ ...formData, price, mrp, discountPercent: discount });
  };

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    setFormData({
      ...formData,
      images: [...formData.images, url.trim()]
    });
    setNewImageUrl('');
    setFormError('');
  };

  const handleRemoveImage = (index: number) => {
    if (formData.images.length <= 1) {
      setFormError('Product must have at least one photograph');
      return;
    }
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Please enter a product name');
      return;
    }
    setFormError('');
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-lg bg-[#fff8f5] text-[#201a16] rounded-2xl border-2 border-[#661023] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 bg-[#661023] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">
              {isNew ? 'add_box' : 'edit_document'}
            </span>
            <h3 className="font-playfair text-base font-bold">
              {isNew ? 'Create New Firework' : `Edit: ${formData.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#dbc0c1] bg-[#f8ebe5] px-3 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 px-2 border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-[#661023] text-[#661023]'
                : 'border-transparent text-[#554243] hover:text-[#201a16]'
            }`}
          >
            Product & Prices
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-2 px-2 border-b-2 transition-all ${
              activeTab === 'photos'
                ? 'border-[#661023] text-[#661023]'
                : 'border-transparent text-[#554243] hover:text-[#201a16]'
            }`}
          >
            Photos & Media ({formData.images.length})
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 px-2 border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-[#661023] text-[#661023]'
                : 'border-transparent text-[#554243] hover:text-[#201a16]'
            }`}
          >
            Sensory Specs & Safety
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {activeTab === 'details' && (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-[#554243] block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maharaja 50-Shot Gold Willow"
                  className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#554243] block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#554243] block mb-1">Product Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Price & MRP Row */}
              <div className="p-3 bg-[#fef1ea] rounded-xl border border-[#dbc0c1]/50 space-y-2">
                <span className="font-bold text-[#661023] block text-[11px] uppercase tracking-wider">
                  Pricing & Statutory Margins
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#554243] block">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => handlePriceChange(Number(e.target.value), formData.mrp)}
                      className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs font-bold text-[#661023]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#554243] block">
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.mrp}
                      onChange={(e) => handlePriceChange(formData.price, Number(e.target.value))}
                      className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#554243] block">
                      Discount %
                    </label>
                    <div className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs font-bold text-[#133a27]">
                      {formData.discountPercent}% Off
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory & Pack Size */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-[#554243] block mb-1">Active Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#554243] block mb-1">Low Threshold</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#554243] block mb-1">Pack Size Label</label>
                  <input
                    type="text"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                    placeholder="e.g. Box of 5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#554243] block mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="One line celebration summary"
                  className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#554243] block mb-1">Full Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-3">
              <div>
                <span className="font-bold text-[#450011] block mb-1">
                  Active Photos (Primary image is first)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden border border-[#dbc0c1] group aspect-square bg-gray-100"
                    >
                      <img src={img} alt="Product" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center text-[10px] shadow"
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#661023] text-white text-[9px] px-1 rounded font-bold">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom URL */}
              <div className="p-3 bg-white rounded-xl border border-[#dbc0c1]/60 space-y-2">
                <label className="font-bold text-[#554243] block">
                  Add Photo by URL (or paste image web link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-1.5 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(newImageUrl)}
                    className="px-3 py-1.5 bg-[#661023] text-white font-bold rounded-lg text-xs"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Curated Gallery Picker */}
              <div>
                <span className="font-bold text-[#554243] block mb-1.5">
                  Pick from Verified Sivakasi Pyrotechnic Assets
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {CURATED_FIREWORK_PHOTOS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddImage(item.url)}
                      className="group relative rounded-lg overflow-hidden border border-[#dbc0c1] aspect-square hover:ring-2 hover:ring-[#661023] text-left"
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] p-0.5 truncate">
                        {item.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3">
              <div>
                <label className="font-bold text-[#554243] block mb-1">
                  Visual Spectacle Effect
                </label>
                <input
                  type="text"
                  value={formData.visualEffect}
                  onChange={(e) => setFormData({ ...formData, visualEffect: e.target.value })}
                  placeholder="e.g. 5-Layer Golden Willow & Crimson Palm"
                  className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#554243] block mb-1">Sound Intensity Level</label>
                  <select
                    value={formData.soundLevel}
                    onChange={(e) => setFormData({ ...formData, soundLevel: e.target.value as SoundLevel })}
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                  >
                    <option value="Silent 0dB">Silent (0 dB)</option>
                    <option value="Whisper 45dB">Whisper (45 dB)</option>
                    <option value="Low 85dB">Low Acoustic (85 dB)</option>
                    <option value="Medium 95dB">Medium Acoustic (95 dB)</option>
                    <option value="High Salvo 110dB">High Salvo (110 dB)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#554243] block mb-1">Decibels (dB Number)</label>
                  <input
                    type="number"
                    value={formData.soundDb}
                    onChange={(e) => setFormData({ ...formData, soundDb: Number(e.target.value) })}
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#554243] block mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 75s Continuous"
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#554243] block mb-1">Aerial Altitude Canopy</label>
                  <input
                    type="text"
                    value={formData.altitude}
                    onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                    placeholder="e.g. 150 Ft / 45m"
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#554243] block mb-1">PESO License Code</label>
                  <input
                    type="text"
                    value={formData.pesoLicense}
                    onChange={(e) => setFormData({ ...formData, pesoLicense: e.target.value })}
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#554243] block mb-1">Emission Standard</label>
                  <input
                    type="text"
                    value={formData.emissionClass}
                    onChange={(e) => setFormData({ ...formData, emissionClass: e.target.value })}
                    className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-[#201a16]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isGreenCertified}
                    onChange={(e) => setFormData({ ...formData, isGreenCertified: e.target.checked })}
                    className="rounded text-[#661023]"
                  />
                  <span>CSIR-NEERI Green Certified</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-[#661023]"
                  />
                  <span>Featured Sovereign</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-[#661023]"
                  />
                  <span>Visible in Storefront</span>
                </label>
              </div>
            </div>
          )}

          {formError && (
            <p className="mt-2 text-xs text-[#ba1a1a] bg-[#ffdad6] p-2 rounded-lg font-bold">
              {formError}
            </p>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-[#dbc0c1] flex items-center justify-between gap-2">
            {!isNew && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(formData.id);
                  onClose();
                }}
                className="px-3 py-2 bg-[#ffdad6] text-[#ba1a1a] rounded-lg font-bold hover:bg-[#ba1a1a] hover:text-white transition-all text-xs"
              >
                Delete
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#dbc0c1] rounded-lg font-bold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-[#661023] hover:bg-[#450011] text-white rounded-lg font-bold shadow active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Firework Details</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
