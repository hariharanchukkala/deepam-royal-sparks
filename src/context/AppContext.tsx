import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  PaymentStatus,
  BusinessSettings,
  CustomerDetails,
  StockTransaction,
  CustomerRecord,
  User,
  DetectedLocation
} from '../types';
import {
  initialProducts,
  initialBusinessSettings
} from '../data/mockData';
import { detectCurrentLocation } from '../services/locationService';
import {
  isSupabaseConfigured,
  fetchProducts,
  fetchBusinessSettings,
  submitOrderBackend,
  trackOrderById,
  adminUpdateOrderStatusInDb,
  adminVerifyPaymentInDb,
  adminSaveProductInDb,
  adminSaveSettingsInDb,
  subscribeToOrders,
  subscribeToInventory
} from '../services/supabaseClient';

interface AppContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  settings: BusinessSettings;
  stockTransactions: StockTransaction[];
  customers: CustomerRecord[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  detectedLocation: DetectedLocation | null;
  locationStatus: 'idle' | 'detecting' | 'detected' | 'denied' | 'error';
  locationError: string | null;
  deliveryDestination: string;
  setDeliveryDestination: (dest: string) => void;
  isDeliveryAvailable: boolean;
  isLocating: boolean;
  triggerAutoLocation: () => Promise<DetectedLocation>;
  currentScreen:
    | 'home'
    | 'catalogue'
    | 'pdp'
    | 'hampers'
    | 'cart'
    | 'checkout'
    | 'confirmation'
    | 'tracking'
    | 'admin'
    | 'concierge'
    | 'login'
    | 'admin-login'
    | 'profile';
  setCurrentScreen: (
    screen:
      | 'home'
      | 'catalogue'
      | 'pdp'
      | 'hampers'
      | 'cart'
      | 'checkout'
      | 'confirmation'
      | 'tracking'
      | 'admin'
      | 'concierge'
      | 'login'
      | 'admin-login'
      | 'profile'
  ) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  currentOrderId: string | null;
  setCurrentOrderId: (id: string | null) => void;
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createOrder: (customer: CustomerDetails, deliveryMethod: 'delivery' | 'pickup', slot?: string) => Promise<Order>;
  generateWhatsAppPayload: (order: Order) => string;
  generateCartWhatsAppPayload: (cartItems: CartItem[], customer?: Partial<CustomerDetails>, deliveryMethod?: 'delivery' | 'pickup') => string;
  dispatchWhatsAppOrder: (order: Order, customPhone?: string) => void;
  sendDirectMessage: (phoneNumber: string, message: string) => void;
  adminUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string, docketNumber?: string) => Promise<void>;
  adminUpdatePaymentStatus: (orderId: string, status: PaymentStatus, note?: string) => Promise<void>;
  adminToggleProductStock: (productId: string) => void;
  adminSaveProduct: (product: Product) => Promise<void>;
  adminDeleteProduct: (productId: string) => void;
  adminSaveSettings: (newSettings: BusinessSettings) => Promise<void>;
  quickRestock: (productId: string, quantity: number) => void;
  trackOrder: (orderId: string, phone?: string) => Promise<Order | undefined>;
  isDbLive: boolean;

  // Auth
  currentUser: User | null;
  isAdminAuthenticated: boolean;
  loginCustomer: (emailOrPhone: string, pass: string) => boolean;
  registerCustomer: (name: string, email: string, phone: string, whatsapp: string, pass: string) => boolean;
  loginAdmin: (identifier: string, password?: string) => boolean;
  logout: () => void;
  updateUserProfile: (updated: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDbLive = isSupabaseConfigured();

  // Authoritative State: Loaded from Supabase PostgreSQL (initial data acts only as immediate bootstrap)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(initialBusinessSettings);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);

  // Client-only non-authoritative cart (persisted in localStorage for shopper session convenience)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('deepam_cart_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth: Customer starts as guest (null), no forced account creation
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('deepam_current_user_v3');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('deepam_admin_auth_v3') === 'true';
    } catch {
      return false;
    }
  });

  // Location Architecture:
  // DETECTED LOCATION: Where customer physically is (via browser GPS)
  // DELIVERY DESTINATION: Where customer wants order delivered (Vijayawada hub default, customizable)
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'detected' | 'denied' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deliveryDestination, setDeliveryDestination] = useState<string>('Vijayawada');
  const [selectedCity, setSelectedCityState] = useState<string>('Vijayawada');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const setSelectedCity = (city: string) => {
    setDeliveryDestination(city);
    setSelectedCityState(city);
  };

  // Delivery Availability Check: True if destination/detected city is in supported delivery areas
  const isDeliveryAvailable = useMemo(() => {
    const targetCity = detectedLocation?.city || deliveryDestination;
    if (!targetCity) return true;
    const clean = targetCity.trim().toLowerCase();
    const areas = (settings.deliveryAreas || []).map((a) => a.trim().toLowerCase());
    return areas.some((a) => clean.includes(a) || a.includes(clean));
  }, [detectedLocation, deliveryDestination, settings.deliveryAreas]);

  // App Navigation
  const [currentScreen, setCurrentScreen] = useState<AppContextType['currentScreen']>('catalogue');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Sync ONLY non-authoritative client cart and user session preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('deepam_cart_v3', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('deepam_current_user_v3', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('deepam_current_user_v3');
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('deepam_admin_auth_v3', String(isAdminAuthenticated));
    } catch {}
  }, [isAdminAuthenticated]);

  // Production Supabase Sync: Products, Settings, and Realtime Listeners
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [dbProducts, dbSettings] = await Promise.all([
          fetchProducts(),
          fetchBusinessSettings()
        ]);
        if (isMounted) {
          if (dbProducts && dbProducts.length > 0) {
            setProducts(dbProducts);
          }
          if (dbSettings) {
            setSettings({
              ...dbSettings,
              businessAddress: dbSettings.businessAddress || initialBusinessSettings.businessAddress,
              dispatchHub: dbSettings.dispatchHub || initialBusinessSettings.dispatchHub,
              whatsappNumber: '917993785371',
              phoneNumber: '+91 79937 85371'
            });
          }
        }
      } catch (err) {
        console.warn('Initial Supabase database load notice:', err);
      }
    }

    loadData();

    // Setup Supabase Realtime subscriptions: Automatic admin update on new order & order tracking sync
    const unsubscribeOrders = subscribeToOrders((payload) => {
      if (!isMounted) return;
      if (payload.eventType === 'INSERT' && payload.new) {
        const newOrder = payload.new as Order;
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const updatedOrder = payload.new as Order;
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
        );
      }
    });

    // Realtime Inventory Subscription: Updates stock availability instantly across customer & admin views
    const unsubscribeInventory = subscribeToInventory(async () => {
      if (!isMounted) return;
      const refreshed = await fetchProducts();
      if (isMounted && refreshed.length > 0) {
        setProducts(refreshed);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeOrders();
      unsubscribeInventory();
    };
  }, []);

  // Location Service Trigger (Browser Geolocation + Reverse Geocoding + IP Fallback)
  const triggerAutoLocation = async (): Promise<DetectedLocation> => {
    setIsLocating(true);
    setLocationStatus('detecting');
    setLocationError(null);
    try {
      const loc = await detectCurrentLocation();
      setDetectedLocation(loc);
      setLocationStatus('detected');
      if (loc.city) {
        setDeliveryDestination(loc.city);
        setSelectedCityState(loc.city);
      }
      setIsLocating(false);
      return loc;
    } catch {
      setIsLocating(false);
      const fallbackLoc: DetectedLocation = {
        latitude: 16.5062,
        longitude: 80.6480,
        city: 'Vijayawada',
        area: 'Benz Circle / MG Road',
        state: 'Andhra Pradesh',
        pincode: '520010',
        address: 'Benz Circle, MG Road, Vijayawada, Andhra Pradesh 520010',
        source: 'manual'
      };
      setDetectedLocation(fallbackLoc);
      setLocationStatus('detected');
      setDeliveryDestination('Vijayawada');
      setSelectedCityState('Vijayawada');
      return fallbackLoc;
    }
  };

  // Initial Geolocation Request: Runs on load to pinpoint user's location reliably
  useEffect(() => {
    let isMounted = true;
    async function initGps() {
      setLocationStatus('detecting');
      try {
        const loc = await detectCurrentLocation();
        if (isMounted) {
          setDetectedLocation(loc);
          setLocationStatus('detected');
          if (loc.city) {
            setDeliveryDestination(loc.city);
            setSelectedCityState(loc.city);
          }
        }
      } catch {
        if (isMounted) {
          const fallbackLoc: DetectedLocation = {
            latitude: 16.5062,
            longitude: 80.6480,
            city: 'Vijayawada',
            area: 'Benz Circle / MG Road',
            state: 'Andhra Pradesh',
            pincode: '520010',
            address: 'Benz Circle, MG Road, Vijayawada, Andhra Pradesh 520010',
            source: 'manual'
          };
          setDetectedLocation(fallbackLoc);
          setLocationStatus('detected');
          setDeliveryDestination('Vijayawada');
          setSelectedCityState('Vijayawada');
        }
      }
    }
    initGps();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cart calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Add to cart with component inventory validation
  const addToCart = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    const availableStock = Math.max(0, product.stock - product.reservedStock);
    if (availableStock <= 0) {
      return { success: false, message: `"${product.name}" is currently out of stock.` };
    }

    // If it's a combo product, check all component inventories!
    if (product.isCombo && product.comboItems && product.comboItems.length > 0) {
      for (const item of product.comboItems) {
        const componentProd = products.find((p) => p.id === item.productId);
        if (componentProd) {
          const compAvailable = Math.max(0, componentProd.stock - componentProd.reservedStock);
          const required = item.quantity * quantity;
          if (compAvailable < required) {
            return {
              success: false,
              message: `Cannot add combo: Required item "${componentProd.name}" has only ${compAvailable} units available.`
            };
          }
        }
      }
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, availableStock);
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { productId: product.id, quantity: Math.min(quantity, availableStock), product }];
    });

    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return { success: false, message: 'Product not found' };

    const availableStock = Math.max(0, targetProduct.stock - targetProduct.reservedStock);
    if (quantity > availableStock) {
      return {
        success: false,
        message: `Only ${availableStock} units available for ${targetProduct.name}.`
      };
    }

    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // ============================================================================
  // SECURE BACKEND ORDER CREATION (17-Step Authoritative Pipeline)
  // Never trusts browser prices or totals.
  // ============================================================================
  const createOrder = async (
    customer: CustomerDetails,
    deliveryMethod: 'delivery' | 'pickup',
    slot?: string
  ): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Your cart is empty. Please select products to order.');
    }

    const items = cart.map((c) => ({
      productId: c.productId,
      quantity: c.quantity
    }));

    const result = await submitOrderBackend(
      {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerWhatsapp: customer.whatsapp || customer.phone,
        deliveryMethod,
        deliveryAddress: customer.address,
        deliveryArea: customer.area,
        deliveryCity: customer.city,
        deliveryState: customer.state,
        deliveryPincode: customer.pincode,
        items,
        customerNotes: customer.notes,
        scheduledSlot: slot
      },
      products,
      settings
    );

    if (!result.success || !result.order) {
      throw new Error(result.error || 'Failed to place order. Please review your cart.');
    }

    const newOrder = result.order;

    // Fast local state updates for immediate UI responsiveness
    setProducts((prev) =>
      prev.map((prod) => {
        const inCart = cart.find((c) => c.productId === prod.id);
        if (inCart) {
          return {
            ...prod,
            reservedStock: prod.reservedStock + inCart.quantity
          };
        }
        return prod;
      })
    );

    // Record Stock Transactions
    cart.forEach((c) => {
      const tx: StockTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: c.productId,
        productName: c.product.name,
        type: 'ORDER_RESERVED',
        quantityChange: -c.quantity,
        balanceAfter: Math.max(0, c.product.stock - c.product.reservedStock - c.quantity),
        timestamp: new Date().toLocaleString(),
        referenceId: newOrder.id,
        note: `Order ${newOrder.id} reserved for ${customer.name}`
      };
      setStockTransactions((prev) => [tx, ...prev]);
    });

    // Update customers registry
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === customer.phone);
      if (existing) {
        return prev.map((c) =>
          c.phone === customer.phone
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpend: c.totalSpend + newOrder.total,
                lastOrderDate: new Date().toISOString().split('T')[0]
              }
            : c
        );
      }
      return [
        {
          id: `cust-${Date.now()}`,
          name: customer.name,
          phone: customer.phone,
          whatsapp: customer.whatsapp,
          city: customer.city || 'Not specified',
          totalOrders: 1,
          totalSpend: newOrder.total,
          lastOrderDate: new Date().toISOString().split('T')[0]
        },
        ...prev
      ];
    });

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setCurrentOrderId(newOrder.id);
    clearCart();

    return newOrder;
  };

  // Streamlined, URL-safe WhatsApp order manifest
  const generateWhatsAppPayload = (order: Order): string => {
    const itemsText = order.items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.productName} × ${it.quantity}${it.price > 0 ? ` (₹${it.price.toLocaleString('en-IN')})` : ''}`
      )
      .join('\n');

    const addressBlock =
      order.deliveryMethod === 'pickup'
        ? 'Store / Hub Pickup'
        : `${order.customer.address}${order.customer.area ? `, ${order.customer.area}` : ''}${order.customer.city ? `, ${order.customer.city}` : ''}${order.customer.pincode ? ` - ${order.customer.pincode}` : ''}`;

    return (
      `🪔 *${settings.businessName.toUpperCase()}*\n` +
      `*ORDER #${order.id}*\n\n` +
      `👤 *Customer:* ${order.customer.name}\n` +
      `📞 *Mobile:* ${order.customer.phone}\n` +
      `📍 *Delivery:* ${order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}\n` +
      (order.deliveryMethod === 'delivery' && addressBlock ? `🏠 *Address:* ${addressBlock}\n` : '') +
      `\n📦 *CRACKERS LIST (${order.items.length} items):*\n` +
      `${itemsText}\n\n` +
      `💰 *Estimated Bill:* ${order.total > 0 ? `₹${order.total.toLocaleString('en-IN')}` : 'Price on Request / Final Invoice'}\n` +
      `\nPlease check stock availability & send confirmation bill.`
    );
  };

  // Instant Cart List generator for quick sharing to WhatsApp directly from cart
  const generateCartWhatsAppPayload = (
    cartItems: CartItem[],
    customerDetails?: Partial<CustomerDetails>,
    delivery?: 'delivery' | 'pickup'
  ): string => {
    const itemsText = cartItems
      .map(
        (c, idx) =>
          `${idx + 1}. ${c.product.name} × ${c.quantity}${c.product.packSize ? ` (${c.product.packSize})` : ''}${c.product.price > 0 ? ` [₹${c.product.price}]` : ''}`
      )
      .join('\n');

    const name = customerDetails?.name?.trim();
    const phone = customerDetails?.phone?.trim();

    return (
      `🪔 *${settings.businessName.toUpperCase()}*\n` +
      `*CRACKERS CART INQUIRY*\n\n` +
      (name ? `👤 *Name:* ${name}\n` : '') +
      (phone ? `📞 *Phone:* ${phone}\n` : '') +
      (delivery ? `📍 *Preference:* ${delivery === 'pickup' ? 'Store Pickup' : 'Home Delivery'}\n` : '') +
      `\n📦 *SELECTED CRACKERS (${cartItems.length} varieties):*\n` +
      `${itemsText}\n\n` +
      `Please confirm stock availability & best festival prices for these items!`
    );
  };

  const dispatchWhatsAppOrder = (order: Order, customPhone?: string) => {
    const payload = generateWhatsAppPayload(order);
    const encoded = encodeURIComponent(payload);
    const targetPhone = (customPhone || '917993785371').replace(/[^0-9]/g, '') || '917993785371';
    const url = `https://wa.me/${targetPhone}?text=${encoded}`;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 300);
    } catch {
      try {
        window.open(url, '_blank');
      } catch (e) {
        console.warn('WhatsApp window.open blocked by environment:', e);
      }
    }
  };

  const sendDirectMessage = (phoneNumber: string, message: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '') || '917993785371';
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanNumber}?text=${encoded}`;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 300);
    } catch {
      try {
        window.open(url, '_blank');
      } catch (e) {
        console.warn('Direct message window.open blocked:', e);
      }
    }
  };

  // Admin order status update with real inventory consequences and database persistence
  const adminUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    note?: string,
    docketNumber?: string
  ): Promise<void> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Persist to database
    await adminUpdateOrderStatusInDb(orderId, status, note, docketNumber);

    // Handle inventory state transitions
    if (status === 'CONFIRMED' && targetOrder.orderStatus !== 'CONFIRMED') {
      // Stock deducted permanently
      setProducts((prev) =>
        prev.map((prod) => {
          const item = targetOrder.items.find((i) => i.productId === prod.id);
          if (item) {
            return {
              ...prod,
              stock: Math.max(0, prod.stock - item.quantity),
              reservedStock: Math.max(0, prod.reservedStock - item.quantity)
            };
          }
          return prod;
        })
      );

      // Record stock transaction: ORDER_CONFIRMED
      targetOrder.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const tx: StockTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: item.productId,
          productName: item.productName,
          type: 'ORDER_CONFIRMED',
          quantityChange: -item.quantity,
          balanceAfter: Math.max(0, (prod?.stock || item.quantity) - item.quantity),
          timestamp: new Date().toLocaleString(),
          referenceId: orderId,
          note: `Order ${orderId} confirmed and stock deducted`
        };
        setStockTransactions((prev) => [tx, ...prev]);
      });
    } else if (status === 'CANCELLED' && targetOrder.orderStatus !== 'CANCELLED') {
      // Release reservation
      setProducts((prev) =>
        prev.map((prod) => {
          const item = targetOrder.items.find((i) => i.productId === prod.id);
          if (item) {
            return {
              ...prod,
              reservedStock: Math.max(0, prod.reservedStock - item.quantity)
            };
          }
          return prod;
        })
      );

      // Record transaction: ORDER_CANCELLED
      targetOrder.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const tx: StockTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: item.productId,
          productName: item.productName,
          type: 'ORDER_CANCELLED',
          quantityChange: item.quantity,
          balanceAfter: prod?.stock || 0,
          timestamp: new Date().toLocaleString(),
          referenceId: orderId,
          note: `Order ${orderId} cancelled, reservation released`
        };
        setStockTransactions((prev) => [tx, ...prev]);
      });
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedTimeline = [
            ...order.timeline,
            {
              status,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              note: note || `Status updated to ${status}`
            }
          ];
          return {
            ...order,
            orderStatus: status,
            updatedAt: new Date().toISOString(),
            timeline: updatedTimeline,
            ...(docketNumber ? { docketNumber } : {})
          };
        }
        return order;
      })
    );
  };

  const adminUpdatePaymentStatus = async (
    orderId: string,
    status: PaymentStatus,
    note?: string
  ): Promise<void> => {
    if (status === 'VERIFIED') {
      await adminVerifyPaymentInDb(orderId, undefined, 'Merchant Central Accounts');
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            paymentStatus: status,
            updatedAt: new Date().toISOString(),
            adminNotes: note ? `${order.adminNotes || ''}\n${note}`.trim() : order.adminNotes
          };
        }
        return order;
      })
    );
  };

  const adminToggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const nextStock = prod.stock > 0 ? 0 : 25;
          const updated = { ...prod, stock: nextStock };
          adminSaveProductInDb(updated);
          return updated;
        }
        return prod;
      })
    );
  };

  const quickRestock = (productId: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, stock: p.stock + quantity };
          adminSaveProductInDb(updated);
          return updated;
        }
        return p;
      })
    );
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      const tx: StockTransaction = {
        id: `tx-${Date.now()}`,
        productId,
        productName: prod.name,
        type: 'STOCK_ADDED',
        quantityChange: quantity,
        balanceAfter: prod.stock + quantity,
        timestamp: new Date().toLocaleString(),
        note: `Restocked +${quantity} units`
      };
      setStockTransactions((prev) => [tx, ...prev]);
    }
  };

  const adminSaveProduct = async (updated: Product): Promise<void> => {
    await adminSaveProductInDb(updated);

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });

    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
  };

  const adminDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const adminSaveSettings = async (newSettings: BusinessSettings): Promise<void> => {
    await adminSaveSettingsInDb(newSettings);
    setSettings(newSettings);
  };

  const trackOrder = async (orderId: string, phone?: string): Promise<Order | undefined> => {
    const result = await trackOrderById(orderId, phone);
    if (result) {
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === result.id);
        if (exists) {
          return prev.map((o) => (o.id === result.id ? result : o));
        }
        return [result, ...prev];
      });
      return result;
    }
    return orders.find((o) => o.id.toUpperCase() === orderId.trim().toUpperCase());
  };

  // Auth Operations
  const loginCustomer = (emailOrPhone: string, _pass: string): boolean => {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Verified Customer',
      email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@customer.deepam.in`,
      phone: !emailOrPhone.includes('@') ? emailOrPhone : '+91 98400 00000',
      whatsapp: !emailOrPhone.includes('@') ? emailOrPhone : '+91 98400 00000',
      role: 'customer'
    };
    setCurrentUser(user);
    return true;
  };

  const registerCustomer = (
    name: string,
    email: string,
    phone: string,
    whatsapp: string,
    _pass: string
  ): boolean => {
    const user: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      whatsapp: whatsapp || phone,
      role: 'customer'
    };
    setCurrentUser(user);
    return true;
  };

  const loginAdmin = (identifier: string, password?: string): boolean => {
    const id = identifier.trim().toLowerCase();
    const pass = (password || '').trim();

    // Valid original admin identifiers
    const validIdentifiers = [
      'admin',
      'admin@deepamsparks.com',
      'admin@deepamroyalsparks.com',
      'hariharan.chukkala@gmail.com',
      '7993785371',
      '+91 79937 85371',
      '+917993785371'
    ];

    // Valid original master passwords
    const validPasswords = [
      'DeepamAdmin@2026',
      'Deepam@Vijayawada2026',
      'Deepam#2026',
      'Admin@2026'
    ];

    if (password !== undefined) {
      const isIdMatch = validIdentifiers.includes(id);
      const isPassMatch = validPasswords.includes(pass);
      if (isIdMatch && isPassMatch) {
        setIsAdminAuthenticated(true);
        try {
          localStorage.setItem('deepam_admin_auth_v3', 'true');
        } catch {}
        return true;
      }
      return false;
    }

    // Direct password entry fallback
    if (validPasswords.includes(identifier.trim())) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem('deepam_admin_auth_v3', 'true');
      } catch {}
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminAuthenticated(false);
    setCurrentScreen('catalogue');
  };

  const updateUserProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      ...updated
    });
  };

  return (
    <AppContext.Provider
      value={{
        products,
        orders,
        cart,
        settings,
        stockTransactions,
        customers,
        selectedCity,
        setSelectedCity,
        detectedLocation,
        locationStatus,
        locationError,
        deliveryDestination,
        setDeliveryDestination,
        isDeliveryAvailable,
        isLocating,
        triggerAutoLocation,
        currentScreen,
        setCurrentScreen,
        selectedProduct,
        setSelectedProduct,
        currentOrderId,
        setCurrentOrderId,
        cartCount,
        cartTotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        generateWhatsAppPayload,
        generateCartWhatsAppPayload,
        dispatchWhatsAppOrder,
        sendDirectMessage,
        adminUpdateOrderStatus,
        adminUpdatePaymentStatus,
        adminToggleProductStock,
        adminSaveProduct,
        adminDeleteProduct,
        adminSaveSettings,
        quickRestock,
        trackOrder,
        isDbLive,
        currentUser,
        isAdminAuthenticated,
        loginCustomer,
        registerCustomer,
        loginAdmin,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
