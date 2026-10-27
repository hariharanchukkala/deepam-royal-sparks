import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, PaymentStatus, Product } from '../types';
import { PackingSlipModal } from '../components/PackingSlipModal';
import { ProductEditModal } from '../components/ProductEditModal';

export const MerchantConsoleScreen: React.FC = () => {
  const {
    orders,
    products,
    settings,
    adminUpdateOrderStatus,
    adminUpdatePaymentStatus,
    adminToggleProductStock,
    adminSaveProduct,
    adminDeleteProduct,
    adminSaveSettings,
    dispatchWhatsAppOrder,
    sendDirectMessage,
    setCurrentScreen,
    stockTransactions,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'bot' | 'analytics'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchOrderQuery, setSearchOrderQuery] = useState<string>('');
  const [selectedPackingOrder, setSelectedPackingOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);

  // Quick message modal
  const [customMsgPhone, setCustomMsgPhone] = useState<string>('');
  const [customMsgText, setCustomMsgText] = useState<string>('');
  const [showMsgModal, setShowMsgModal] = useState<boolean>(false);

  // Docket input modal
  const [docketOrderId, setDocketOrderId] = useState<string | null>(null);
  const [docketNumberInput, setDocketNumberInput] = useState<string>('');
  const [settingsNotice, setSettingsNotice] = useState<string>('');

  // Compute live KPI aggregates from real database/orders
  const totalOrdersCount = orders.length;
  const totalSales = orders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'NEW' || o.orderStatus === 'UNDER_REVIEW').length;
  const awaitingPaymentOrders = orders.filter((o) => o.orderStatus === 'PAYMENT_REQUESTED' || o.paymentStatus === 'REQUESTED').length;
  const confirmedOrders = orders.filter((o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PACKING' || o.orderStatus === 'READY').length;
  const lowStockCount = products.filter((p) => p.stock - p.reservedStock > 0 && p.stock - p.reservedStock <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock - p.reservedStock <= 0).length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && o.orderStatus !== 'NEW' && o.orderStatus !== 'UNDER_REVIEW') return false;
      if (statusFilter === 'payment' && o.orderStatus !== 'PAYMENT_REQUESTED') return false;
      if (statusFilter === 'confirmed' && o.orderStatus !== 'CONFIRMED') return false;
      if (statusFilter === 'packing' && o.orderStatus !== 'PACKING' && o.orderStatus !== 'READY') return false;
      if (statusFilter === 'dispatched' && o.orderStatus !== 'DISPATCHED') return false;
      if (statusFilter === 'delivered' && o.orderStatus !== 'DELIVERED') return false;
      if (statusFilter === 'cancelled' && o.orderStatus !== 'CANCELLED') return false;
    }

    if (searchOrderQuery.trim()) {
      const q = searchOrderQuery.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.customer.name.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }

    return true;
  });

  const handleToggleStoreStatus = () => {
    adminSaveSettings({
      ...settings,
      isStoreOnline: !settings.isStoreOnline
    });
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleSendCustomMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsgPhone.trim() || !customMsgText.trim()) return;
    sendDirectMessage(customMsgPhone, customMsgText);
    setShowMsgModal(false);
    setCustomMsgText('');
  };

  const handleConfirmDispatch = () => {
    if (!docketOrderId) return;
    adminUpdateOrderStatus(
      docketOrderId,
      'DISPATCHED',
      'Assigned to carrier with tracking docket',
      docketNumberInput || `ST-EXP-${Math.floor(10000 + Math.random() * 90000)}`
    );
    setDocketOrderId(null);
    setDocketNumberInput('');
  };

  return (
    <div className="bg-[#fff8f5] text-[#201a16] min-h-screen pb-32">
      {/* Regal Merchant Header */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#661023] text-white shadow-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#fece57] text-[#735700] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[20px]">stars</span>
              </div>
              <div>
                <h1 className="font-playfair text-[17px] font-semibold text-white leading-tight">
                  Deepam Merchant Console
                </h1>
                <p className="text-[10px] text-[#ffdf98] font-mono">
                  Sivakasi Central Dispatch & Order Manager
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentScreen('catalogue')}
                className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[11px] font-bold"
              >
                Storefront
              </button>
              <button
                onClick={() => {
                  logout();
                  setCurrentScreen('admin-login');
                }}
                className="w-7 h-7 rounded-full bg-[#fece57]/20 border border-[#fece57]/50 flex items-center justify-center text-[#ffdf98] font-mono text-xs font-bold"
                title="Sign out of admin"
              >
                SH
              </button>
            </div>
          </div>

          {/* Online Toggle Bar */}
          <div className="flex items-center justify-between bg-[#450011]/80 px-3 py-1.5 rounded-lg border border-[#fece57]/20">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${settings.isStoreOnline ? 'bg-[#c2edd0] animate-ping' : 'bg-red-400'}`} />
              <span className="text-white font-medium">
                {settings.isStoreOnline ? 'Store Accepting Orders' : 'Store Paused'}
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isStoreOnline}
                onChange={handleToggleStoreStatus}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#133a27]"></div>
            </label>
          </div>
        </div>
      </header>

      {/* Main Container: Expands cleanly on laptop screens */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 flex flex-col gap-5">
        {activeTab === 'orders' && (
          <>
            {/* Step 19: Real Dashboard KPIs (From actual stored database records) */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-playfair text-base text-[#450011] font-bold">
                  Business Control Center
                </h2>
                <span className="text-[10px] text-[#775a00] font-bold bg-[#f2e6df] px-2 py-0.5 rounded">
                  Live Database State
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-[#fef1ea] p-2.5 rounded-xl border border-[#dbc0c1]/40 text-center">
                  <span className="text-[9px] uppercase font-bold text-[#554243] block">Orders</span>
                  <span className="font-playfair text-base font-bold text-[#450011]">{totalOrdersCount}</span>
                </div>

                <div className="bg-[#fef1ea] p-2.5 rounded-xl border border-[#dbc0c1]/40 text-center">
                  <span className="text-[9px] uppercase font-bold text-[#554243] block">Sales</span>
                  <span className="font-playfair text-base font-bold text-[#133a27] truncate block">
                    ₹{totalSales.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-[#fef1ea] p-2.5 rounded-xl border border-[#dbc0c1]/40 text-center">
                  <span className="text-[9px] uppercase font-bold text-[#554243] block">Pending</span>
                  <span className="font-playfair text-base font-bold text-[#661023]">{pendingOrders}</span>
                </div>

                <div className="bg-[#fef1ea] p-2.5 rounded-xl border border-[#dbc0c1]/40 text-center">
                  <span className="text-[9px] uppercase font-bold text-[#554243] block">Awaiting Pay</span>
                  <span className="font-playfair text-base font-bold text-[#775a00]">{awaitingPaymentOrders}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border text-center">
                  <span className="text-gray-500 block text-[10px]">Confirmed:</span>
                  <strong className="text-[#133a27]">{confirmedOrders}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border text-center">
                  <span className="text-gray-500 block text-[10px]">Low Stock SKUs:</span>
                  <strong className="text-[#ba1a1a]">{lowStockCount}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border text-center">
                  <span className="text-gray-500 block text-[10px]">Out of Stock:</span>
                  <strong className="text-[#ba1a1a]">{outOfStockCount}</strong>
                </div>
              </div>
            </section>

            {/* Step 20: Order Management & Real Status Workflow */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-playfair text-base text-[#450011] font-bold">
                    Order Processing Pipeline
                  </h3>
                  <p className="text-[11px] text-[#554243]">
                    Review orders, check inventory reservation, request & verify payments
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCustomMsgPhone('');
                    setShowMsgModal(true);
                  }}
                  className="px-2.5 py-1 bg-[#128C7E] text-white rounded text-[10px] font-bold"
                >
                  Direct Message
                </button>
              </div>

              {/* Order Search */}
              <input
                type="text"
                value={searchOrderQuery}
                onChange={(e) => setSearchOrderQuery(e.target.value)}
                placeholder="Search by Order ID, customer name or phone..."
                className="w-full bg-white border border-[#dbc0c1] rounded-lg p-2 text-xs"
              />

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                {[
                  { id: 'all', label: `All (${orders.length})` },
                  { id: 'pending', label: 'Pending' },
                  { id: 'payment', label: 'Payment Req' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'packing', label: 'Packing' },
                  { id: 'dispatched', label: 'Dispatched' },
                  { id: 'delivered', label: 'Delivered' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap font-bold text-[11px] transition-all ${
                      statusFilter === tab.id
                        ? 'bg-[#661023] text-white shadow-2xs'
                        : 'bg-[#f2e6df] text-[#554243] hover:text-[#201a16]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-dashed border-[#dbc0c1] text-xs text-[#554243]">
                    No orders match this status filter.
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <article
                      key={ord.id}
                      className="bg-[#fef1ea] rounded-xl border border-[#dbc0c1]/60 p-3.5 space-y-2.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#661023]">{ord.id}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                ord.orderStatus === 'DELIVERED'
                                  ? 'bg-[#c2edd0] text-[#002414]'
                                  : ord.orderStatus === 'CANCELLED'
                                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                  : 'bg-[#fece57] text-[#735700]'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="font-bold text-[#201a16] mt-0.5">{ord.customer.name}</p>
                          <div className="flex items-center gap-2 text-[11px]">
                            <a href={`tel:${ord.customer.phone}`} className="font-mono text-[#661023] hover:underline">
                              {ord.customer.phone}
                            </a>
                            <button
                              onClick={() => {
                                setCustomMsgPhone(ord.customer.phone);
                                setCustomMsgText(`Hello ${ord.customer.name}, regarding your order ${ord.id}...`);
                                setShowMsgModal(true);
                              }}
                              className="text-[10px] text-[#128C7E] font-bold hover:underline"
                            >
                              WhatsApp
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-playfair text-base font-bold text-[#450011] block">
                            ₹{ord.total.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-600 block">
                            Pay: <strong>{ord.paymentStatus}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-white p-2 rounded border border-[#dbc0c1]/30 space-y-1 text-[11px]">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate pr-2">• {it.quantity}× {it.productName}</span>
                            <span className="text-gray-500 shrink-0">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {ord.customer.address && (
                        <p className="text-[11px] text-[#554243]">
                          📍 {ord.customer.address}, {ord.customer.city}
                        </p>
                      )}

                      {ord.docketNumber && (
                        <p className="text-[11px] font-mono text-[#133a27] font-bold">
                          🚚 Freight Docket: {ord.docketNumber}
                        </p>
                      )}

                      {/* Action Buttons Workflow */}
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setSelectedPackingOrder(ord)}
                          className="px-2 py-1 bg-white border border-[#dbc0c1] rounded text-[11px] font-bold hover:bg-[#ece0d9]"
                        >
                          Packing Slip
                        </button>

                        <button
                          onClick={() => dispatchWhatsAppOrder(ord, ord.customer.whatsapp || ord.customer.phone)}
                          className="px-2 py-1 bg-[#128C7E] text-white rounded text-[11px] font-bold hover:bg-[#0c6b60]"
                        >
                          WhatsApp Reply
                        </button>

                        {/* Order Status Action Buttons */}
                        {ord.orderStatus === 'NEW' && (
                          <button
                            onClick={() => adminUpdateOrderStatus(ord.id, 'APPROVED', 'Order approved by admin')}
                            className="px-2.5 py-1 bg-[#133a27] text-white rounded text-[11px] font-bold"
                          >
                            Approve Order
                          </button>
                        )}

                        {(ord.orderStatus === 'NEW' || ord.orderStatus === 'APPROVED') && (
                          <button
                            onClick={() => {
                              adminUpdateOrderStatus(ord.id, 'PAYMENT_REQUESTED', 'Payment details requested from customer');
                              adminUpdatePaymentStatus(ord.id, 'REQUESTED', 'Requested UPI payment');
                            }}
                            className="px-2.5 py-1 bg-[#775a00] text-white rounded text-[11px] font-bold"
                          >
                            Request Payment
                          </button>
                        )}

                        {ord.paymentStatus !== 'VERIFIED' && ord.orderStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              adminUpdatePaymentStatus(ord.id, 'VERIFIED', 'Payment verified manually by admin');
                              adminUpdateOrderStatus(ord.id, 'CONFIRMED', 'Payment verified, stock committed');
                            }}
                            className="px-2.5 py-1 bg-[#204632] text-white rounded text-[11px] font-bold"
                          >
                            Mark Payment Verified
                          </button>
                        )}

                        {ord.orderStatus === 'CONFIRMED' && (
                          <button
                            onClick={() => adminUpdateOrderStatus(ord.id, 'PACKING', 'Packing in Sivakasi warehouse crate')}
                            className="px-2.5 py-1 bg-[#661023] text-white rounded text-[11px] font-bold"
                          >
                            Mark Packing
                          </button>
                        )}

                        {ord.orderStatus === 'PACKING' && (
                          <button
                            onClick={() => adminUpdateOrderStatus(ord.id, 'READY', 'Ready for courier van handover')}
                            className="px-2.5 py-1 bg-[#133a27] text-white rounded text-[11px] font-bold"
                          >
                            Mark Ready
                          </button>
                        )}

                        {ord.orderStatus === 'READY' && (
                          <button
                            onClick={() => {
                              setDocketOrderId(ord.id);
                              setDocketNumberInput(`ST-EXP-${Math.floor(10000 + Math.random() * 90000)}`);
                            }}
                            className="px-2.5 py-1 bg-[#775a00] text-white rounded text-[11px] font-bold"
                          >
                            Dispatch Van
                          </button>
                        )}

                        {ord.orderStatus === 'DISPATCHED' && (
                          <button
                            onClick={() => adminUpdateOrderStatus(ord.id, 'DELIVERED', 'Delivered safely')}
                            className="px-2.5 py-1 bg-[#133a27] text-white rounded text-[11px] font-bold"
                          >
                            Mark Delivered
                          </button>
                        )}

                        {ord.orderStatus !== 'DELIVERED' && ord.orderStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              adminUpdateOrderStatus(ord.id, 'CANCELLED', 'Cancelled by admin and inventory released');
                            }}
                            className="px-2 py-1 bg-[#ffdad6] text-[#ba1a1a] rounded text-[11px] font-bold ml-auto"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {/* Tab 2: Inventory & SKU Master */}
        {activeTab === 'inventory' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#dbc0c1]/40">
              <div>
                <h2 className="font-playfair text-lg text-[#450011] font-bold">
                  Product & Inventory Management
                </h2>
                <p className="text-[#554243]">
                  Edit prices, photos, stock, and descriptions
                </p>
              </div>
              <button
                onClick={handleOpenNewProduct}
                className="px-3 py-1.5 bg-[#661023] text-white font-bold rounded-lg shadow-2xs hover:bg-[#450011]"
              >
                + Add Firework
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#dbc0c1]/50 divide-y divide-[#dbc0c1]/30 overflow-hidden">
              {products.map((p) => {
                const available = Math.max(0, p.stock - p.reservedStock);
                return (
                  <div key={p.id} className="p-3 flex items-center justify-between gap-3">
                    <div
                      onClick={() => handleOpenEditProduct(p)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                    >
                      <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded object-cover border shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-[#201a16] truncate">{p.name}</p>
                        <p className="text-[11px] text-[#554243]">
                          Price: {p.price > 0 ? (
                            <><strong className="text-[#661023]">₹{p.price}</strong> (MRP ₹{p.mrp})</>
                          ) : (
                            <span className="bg-[#ffdad6] text-[#ba1a1a] font-bold px-1.5 py-0.5 rounded text-[10px]">Price Not Set — Click Edit</span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Total: {p.stock} | Reserved: {p.reservedStock} | Available: <strong className="text-[#133a27]">{available}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="px-2.5 py-1 bg-[#661023] text-white rounded text-[11px] font-bold hover:bg-[#450011]"
                      >
                        Edit
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.stock > 0}
                          onChange={() => adminToggleProductStock(p.id)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#661023]"></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stock history transactions */}
            <div className="bg-[#fef1ea] p-3 rounded-xl border border-[#dbc0c1]/40 space-y-2">
              <h3 className="font-playfair text-sm text-[#450011] font-bold">
                Stock Transaction Ledger
              </h3>
              {stockTransactions.length === 0 ? (
                <p className="text-gray-500 text-[11px]">No stock movements recorded yet.</p>
              ) : (
                <div className="space-y-1.5 text-[11px]">
                  {stockTransactions.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="bg-white p-2 rounded border border-[#dbc0c1]/30 flex justify-between">
                      <div>
                        <strong className="block text-[#201a16]">{tx.productName}</strong>
                        <span className="text-gray-500">{tx.note}</span>
                      </div>
                      <span className={`font-mono font-bold ${tx.quantityChange >= 0 ? 'text-[#133a27]' : 'text-[#ba1a1a]'}`}>
                        {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Bot & Phone Numbers Configuration */}
        {activeTab === 'bot' && (
          <div className="space-y-4 text-xs">
            <h2 className="font-playfair text-lg text-[#450011] font-bold">
              Business Contact & WhatsApp Configuration
            </h2>

            <div className="bg-white p-4 rounded-xl border border-[#dbc0c1]/50 space-y-3">
              <div>
                <label className="font-bold text-[#554243] block mb-1">
                  Business WhatsApp Dispatch Number (Target for orders)
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => adminSaveSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 font-mono font-bold text-[#661023]"
                />
                <span className="text-[10px] text-gray-500">
                  Must include country code without plus (e.g. 917993785371)
                </span>
              </div>

              <div>
                <label className="font-bold text-[#554243] block mb-1">
                  Calling Phone Number
                </label>
                <input
                  type="text"
                  value={settings.phoneNumber}
                  onChange={(e) => adminSaveSettings({ ...settings, phoneNumber: e.target.value })}
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#554243] block mb-1">
                  Official UPI ID
                </label>
                <input
                  type="text"
                  value={settings.upiId}
                  onChange={(e) => adminSaveSettings({ ...settings, upiId: e.target.value })}
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#554243] block mb-1">
                  Standard Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={settings.deliveryCharge}
                  onChange={(e) => adminSaveSettings({ ...settings, deliveryCharge: Number(e.target.value) })}
                  className="w-full bg-[#fff8f5] border border-[#dbc0c1] rounded-lg p-2 font-mono"
                />
              </div>

              {settingsNotice && (
                <p className="text-xs text-[#002414] bg-[#c2edd0] p-2 rounded-lg font-bold text-center">
                  {settingsNotice}
                </p>
              )}

              <button
                onClick={() => {
                  adminSaveSettings(settings);
                  setSettingsNotice('✓ Settings successfully saved to Supabase / database!');
                  setTimeout(() => setSettingsNotice(''), 3500);
                }}
                className="w-full py-2 bg-[#661023] hover:bg-[#450011] text-white font-bold rounded-lg shadow active:scale-95 transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 text-xs">
            <h2 className="font-playfair text-lg text-[#450011] font-bold">
              Sales Analytics
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-xl border border-[#dbc0c1]/40">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Total Revenue</span>
                <p className="font-playfair text-xl text-[#450011] font-bold mt-1">
                  ₹{totalSales.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#dbc0c1]/40">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Average Order Value</span>
                <p className="font-playfair text-xl text-[#133a27] font-bold mt-1">
                  ₹{Math.round(totalSales / Math.max(1, totalOrdersCount)).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Product Edit / Creation Modal */}
      {isProductModalOpen && (
        <ProductEditModal
          product={editingProduct}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={(saved) => {
            adminSaveProduct(saved);
          }}
          onDelete={(id) => {
            adminDeleteProduct(id);
          }}
        />
      )}

      {/* Direct WhatsApp SMS Messaging Modal */}
      {showMsgModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSendCustomMsg}
            className="w-full max-w-sm bg-white rounded-xl p-4 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between pb-1 border-b">
              <h3 className="font-playfair font-bold text-sm text-[#450011]">
                Send Direct WhatsApp / SMS Details
              </h3>
              <button
                type="button"
                onClick={() => setShowMsgModal(false)}
                className="text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#554243] block">Receiver Phone Number</label>
              <input
                type="text"
                required
                value={customMsgPhone}
                onChange={(e) => setCustomMsgPhone(e.target.value)}
                placeholder="e.g. 917993785371"
                className="w-full border rounded p-2 text-xs font-mono font-bold mt-1"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#554243] block">Message Payload</label>
              <textarea
                rows={3}
                required
                value={customMsgText}
                onChange={(e) => setCustomMsgText(e.target.value)}
                className="w-full border rounded p-2 text-xs mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#128C7E] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Send via WhatsApp</span>
            </button>
          </form>
        </div>
      )}

      {/* Docket Entry Modal */}
      {docketOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-xl p-4 space-y-3 text-xs">
            <h3 className="font-playfair font-bold text-sm text-[#450011]">
              Enter Carrier Freight Docket
            </h3>
            <p className="text-[11px] text-[#554243]">
              Assign an explosive transport van docket number for order {docketOrderId}:
            </p>
            <input
              type="text"
              value={docketNumberInput}
              onChange={(e) => setDocketNumberInput(e.target.value)}
              placeholder="e.g. ST-EXP-99214"
              className="w-full border rounded p-2 font-mono font-bold text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={handleConfirmDispatch}
                className="flex-1 py-2 bg-[#133a27] text-white font-bold rounded"
              >
                Confirm Dispatch
              </button>
              <button
                onClick={() => setDocketOrderId(null)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packing Slip View Modal */}
      {selectedPackingOrder && (
        <PackingSlipModal
          order={selectedPackingOrder}
          settings={settings}
          isOpen={true}
          onClose={() => setSelectedPackingOrder(null)}
        />
      )}

      {/* Bottom Admin Menu Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 bg-[#fff8f5]/95 backdrop-blur-md border-t border-[#dbc0c1]/40 shadow-[0_-4px_20px_rgba(102,10,35,0.06)]">
        <div className="max-w-md mx-auto flex justify-around items-center px-2 py-1.5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 ${
              activeTab === 'orders' ? 'text-[#661023] font-bold' : 'text-[#554243]'
            }`}
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              {orders.length > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#661023] text-white text-[9px] font-bold rounded-full">
                  {orders.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 ${
              activeTab === 'inventory' ? 'text-[#661023] font-bold' : 'text-[#554243]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            <span className="text-[10px]">Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('bot')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 ${
              activeTab === 'bot' ? 'text-[#661023] font-bold' : 'text-[#554243]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            <span className="text-[10px]">Settings & Phone</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 ${
              activeTab === 'analytics' ? 'text-[#661023] font-bold' : 'text-[#554243]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">insights</span>
            <span className="text-[10px]">Analytics</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
