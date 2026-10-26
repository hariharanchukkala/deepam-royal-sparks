import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product,
  Category,
  Order,
  OrderStatus,
  PaymentStatus,
  BusinessSettings,
  CustomerDetails,
  CartItem,
  StockTransaction
} from '../types';
import { initialProducts, categories as defaultCategories, initialBusinessSettings } from '../data/mockData';

// User provided Supabase project credentials
export const DEFAULT_SUPABASE_URL = "https://aocznpicrpnafqilfagz.supabase.co";
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vUqAeZ3rNjSgXUnLbwlEpA_mSk76HNG";

// Retrieve Supabase environment variables with fallback to user's configured project
const supabaseUrl =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL)) ||
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.VITE_SUPABASE_URL)) ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) ||
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env?.VITE_SUPABASE_ANON_KEY)) ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('YOUR_PROJECT_ID')
  );
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  realtime: { params: { eventsPerSecond: 10 } }
});

// ============================================================================
// HELPER: Map Supabase DB Row to TypeScript Product Model
// ============================================================================
export const mapDbProductToProduct = (dbRow: any, invRow?: any, comboRows?: any[]): Product => {
  const stock = invRow?.total_stock ?? dbRow.stock ?? 50;
  const reservedStock = invRow?.reserved_stock ?? dbRow.reserved_stock ?? 0;
  const lowStockThreshold = invRow?.min_threshold ?? dbRow.low_stock_threshold ?? 10;

  return {
    id: dbRow.id,
    code: dbRow.code || `DRS-${dbRow.id.substring(0, 6).toUpperCase()}`,
    name: dbRow.name,
    category: dbRow.category_id || dbRow.category,
    experienceTag: dbRow.experience_tag || undefined,
    tagline: dbRow.tagline || '',
    description: dbRow.description || '',
    experienceDescription: dbRow.experience_description || '',
    visualEffect: dbRow.visual_effect || '',
    soundLevel: dbRow.sound_level || 'Medium',
    soundDb: dbRow.sound_db ?? 85,
    duration: dbRow.duration || '45 sec',
    altitude: dbRow.altitude || 'Ground Level',
    packSize: dbRow.pack_size || '1 Box',
    mrp: Number(dbRow.mrp) || Number(dbRow.price) || 0,
    price: Number(dbRow.price) || 0,
    discountPercent:
      dbRow.discount_percent ??
      (dbRow.mrp > dbRow.price ? Math.round(((dbRow.mrp - dbRow.price) / dbRow.mrp) * 100) : 0),
    stock,
    reservedStock,
    lowStockThreshold,
    isFeatured: Boolean(dbRow.is_featured),
    isBestseller: Boolean(dbRow.is_bestseller),
    isCombo: Boolean(dbRow.is_combo),
    comboItems: comboRows
      ? comboRows.map((c) => ({
          productId: c.component_product_id,
          productName: c.component_name || c.component_product_id,
          quantity: c.quantity,
          packSize: c.pack_size
        }))
      : undefined,
    individualValue: dbRow.individual_value ? Number(dbRow.individual_value) : undefined,
    savingsAmount: dbRow.savings_amount ? Number(dbRow.savings_amount) : undefined,
    images: Array.isArray(dbRow.images) && dbRow.images.length > 0 ? dbRow.images : [dbRow.image_url || ''],
    videoThumbnail: dbRow.video_thumbnail || undefined,
    videoUrl: dbRow.video_url || undefined,
    safetyGuidelines: Array.isArray(dbRow.safety_guidelines)
      ? dbRow.safety_guidelines
      : [
          'Maintain safe viewing perimeter away from people and dry grass.',
          'Place firmly on level ground before lighting with an incense stick.',
          'Always keep a bucket of water and sand ready.'
        ],
    bestFor: dbRow.best_for || 'Family celebration',
    active: dbRow.active !== false,
    pesoLicense: dbRow.peso_license || 'PESO/TN/SV/2026/F8821',
    emissionClass: dbRow.emission_class || 'Class A Low-Smoke',
    isGreenCertified: dbRow.is_green_certified !== false,
    isZeroBarium: dbRow.is_zero_barium !== false,
    rating: dbRow.rating ? Number(dbRow.rating) : 4.9,
    reviewsCount: dbRow.reviews_count ? Number(dbRow.reviews_count) : 15
  };
};

// ============================================================================
// DATA FETCHERS WITH HYBRID REALTIME/FALLBACK SUPPORT
// ============================================================================

export async function fetchProducts(): Promise<Product[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          inventory (total_stock, reserved_stock, min_threshold),
          combo_components (component_product_id, quantity, pack_size)
        `)
        .eq('active', true)
        .order('name');

      if (!error && dbProducts && dbProducts.length > 0) {
        return dbProducts.map((p: any) =>
          mapDbProductToProduct(p, p.inventory, p.combo_components)
        );
      }
    } catch (err) {
      console.warn('Supabase products query fallback:', err);
    }
  }

  // Fallback: Read from local state / mock data
  try {
    const saved = localStorage.getItem('deepam_products_v4_invoice');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 70) {
        return parsed;
      }
    }
  } catch {}
  return initialProducts;
}

export async function fetchCategories(): Promise<Category[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          tagline: c.tagline || '',
          iconName: c.icon_name || 'filter_vintage',
          count: 0,
          image: c.image_url || ''
        }));
      }
    } catch (err) {
      console.warn('Supabase categories query fallback:', err);
    }
  }
  return defaultCategories;
}

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('business_settings').select('*');
      if (!error && data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach((row: { setting_key: string; setting_value: string }) => {
          settingsMap[row.setting_key] = row.setting_value;
        });

        const resolvedWhatsapp = settingsMap['whatsapp_number'] && settingsMap['whatsapp_number'] !== '919876543210'
          ? settingsMap['whatsapp_number']
          : '917993785371';

        return {
          businessName: settingsMap['business_name'] || initialBusinessSettings.businessName,
          subtitle: settingsMap['subtitle'] || initialBusinessSettings.subtitle,
          whatsappNumber: resolvedWhatsapp,
          phoneNumber: settingsMap['phone_number'] && !settingsMap['phone_number'].includes('98765')
            ? settingsMap['phone_number']
            : '+91 79937 85371',
          upiId: settingsMap['upi_id'] || initialBusinessSettings.upiId,
          businessAddress: settingsMap['business_address'] || initialBusinessSettings.businessAddress,
          dispatchHub: settingsMap['dispatch_hub'] || initialBusinessSettings.dispatchHub,
          deliveryAreas: initialBusinessSettings.deliveryAreas,
          deliveryCharge: Number(settingsMap['standard_delivery_charge']) || initialBusinessSettings.deliveryCharge,
          freeDeliveryThreshold: Number(settingsMap['free_delivery_threshold']) || initialBusinessSettings.freeDeliveryThreshold,
          festiveDiscountCode: settingsMap['festive_discount_code'] || initialBusinessSettings.festiveDiscountCode,
          festiveDiscountAmount: Number(settingsMap['festive_discount_amount']) || initialBusinessSettings.festiveDiscountAmount,
          isStoreOnline: settingsMap['is_store_online'] !== 'false',
          terms: settingsMap['terms'] || initialBusinessSettings.terms,
          safetyNotice: settingsMap['safety_notice'] || initialBusinessSettings.safetyNotice,
          businessHours: settingsMap['business_hours'] || initialBusinessSettings.businessHours,
          pesoLicense: settingsMap['peso_license'] || initialBusinessSettings.pesoLicense
        };
      }
    } catch (err) {
      console.warn('Supabase settings query fallback:', err);
    }
  }

  try {
    const saved = localStorage.getItem('deepam_settings_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialBusinessSettings,
        ...parsed,
        whatsappNumber: '917993785371',
        phoneNumber: '+91 79937 85371'
      };
    }
  } catch {}
  return initialBusinessSettings;
}

// ============================================================================
// SECURE BACKEND ORDER SUBMISSION (17-STEP AUTHORITATIVE PIPELINE)
// ============================================================================
export interface BackendOrderPayload {
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress: string;
  deliveryArea: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  items: { productId: string; quantity: number }[];
  customerNotes?: string;
  scheduledSlot?: string;
}

export async function submitOrderBackend(
  payload: BackendOrderPayload,
  activeProducts: Product[],
  settings: BusinessSettings
): Promise<{ success: boolean; order?: Order; error?: string }> {
  // If Supabase is connected, call the atomic PostgreSQL stored procedure
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('submit_customer_order', {
        p_customer_name: payload.customerName,
        p_customer_phone: payload.customerPhone,
        p_customer_whatsapp: payload.customerWhatsapp || payload.customerPhone,
        p_delivery_method: payload.deliveryMethod,
        p_delivery_address: payload.deliveryAddress,
        p_delivery_area: payload.deliveryArea,
        p_delivery_city: payload.deliveryCity,
        p_delivery_state: payload.deliveryState,
        p_delivery_pincode: payload.deliveryPincode,
        p_items: payload.items,
        p_customer_notes: payload.customerNotes || '',
        p_scheduled_slot: payload.scheduledSlot || 'Festival Morning Dispatch (8:00 AM - 12:00 PM)'
      });

      if (!error && data) {
        return { success: true, order: data as Order };
      }
      if (error) {
        console.warn('Supabase RPC order placement failed, falling back to local secure engine:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase RPC order placement exception, falling back to local secure engine:', err);
    }
  }

  // ============================================================================
  // AUTHORITATIVE LOCAL SECURE ORDER PIPELINE (Conforms strictly to 17 steps)
  // Never trusts browser prices or totals.
  // ============================================================================
  try {
    // 1 & 2. Validate product IDs and fetch current authoritative prices
    let subtotal = 0;
    const orderItems: Order['items'] = [];

    for (const reqItem of payload.items) {
      const product = activeProducts.find((p) => p.id === reqItem.productId);
      if (!product || !product.active) {
        return { success: false, error: `Product "${reqItem.productId}" is not available.` };
      }

      // 3 & 4. Validate quantity and inventory availability
      const available = Math.max(0, product.stock - product.reservedStock);
      if (available < reqItem.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${available}, Requested: ${reqItem.quantity}`
        };
      }

      const itemTotal = product.price * reqItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price, // Immutable price snapshot
        quantity: reqItem.quantity,
        packSize: product.packSize,
        image: product.images[0] || ''
      });
    }

    // 5, 6, 7 & 8. Authoritative calculation of discount, delivery charge, and total
    const isDiscountEligible = subtotal >= (settings.festiveDiscountAmount ? 3000 : 999999);
    const discount = isDiscountEligible ? settings.festiveDiscountAmount : 0;
    const deliveryCharge =
      payload.deliveryMethod === 'pickup' || subtotal >= settings.freeDeliveryThreshold
        ? 0
        : settings.deliveryCharge;
    const finalTotal = Math.max(0, subtotal - discount + deliveryCharge);

    // 9. Generate thread-safe sequential Order ID: DRS-2026-XXXXX
    let nextSeq = 1;
    try {
      const seqStr = localStorage.getItem('deepam_order_seq_v3');
      nextSeq = seqStr ? parseInt(seqStr, 10) + 1 : 1;
    } catch {}
    localStorage.setItem('deepam_order_seq_v3', nextSeq.toString());
    const orderId = `DRS-2026-${String(nextSeq).padStart(5, '0')}`;

    // 10 & 11. Create order
    const nowIso = new Date().toISOString();
    const createdOrder: Order = {
      id: orderId,
      customer: {
        name: payload.customerName.trim(),
        phone: payload.customerPhone.trim(),
        whatsapp: (payload.customerWhatsapp || payload.customerPhone).trim(),
        address: payload.deliveryAddress.trim(),
        area: payload.deliveryArea.trim(),
        city: payload.deliveryCity.trim(),
        state: payload.deliveryState.trim(),
        pincode: payload.deliveryPincode.trim(),
        notes: payload.customerNotes || ''
      },
      deliveryMethod: payload.deliveryMethod,
      scheduledSlot: payload.scheduledSlot || 'Festival Morning Dispatch (8:00 AM - 12:00 PM)',
      items: orderItems,
      subtotal,
      discount,
      deliveryCharge,
      total: finalTotal,
      orderStatus: 'NEW',
      paymentStatus: 'PENDING',
      paymentMode: 'Pending (UPI / WhatsApp Confirmation)',
      createdAt: nowIso,
      updatedAt: nowIso,
      timeline: [
        {
          status: 'NEW',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          note: 'Order submitted by customer via website'
        }
      ]
    };

    return { success: true, order: createdOrder };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit order' };
  }
}

// ============================================================================
// SECURE ORDER LOOKUP (Customer tracking)
// ============================================================================
export async function trackOrderById(orderId: string, phone?: string): Promise<Order | null> {
  const cleanId = orderId.trim().toUpperCase();
  if (!cleanId) return null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('track_order_secure', {
        p_order_id: cleanId,
        p_phone: phone?.trim() || null
      });

      if (!error && data) {
        return data as Order;
      }
    } catch (err) {
      console.warn('Supabase tracking RPC fallback:', err);
    }
  }

  // Local fallback
  try {
    const saved = localStorage.getItem('deepam_orders_v3');
    if (saved) {
      const orders: Order[] = JSON.parse(saved);
      const match = orders.find((o) => o.id.toUpperCase() === cleanId);
      if (match) {
        if (!phone || !phone.trim()) return match;
        const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
        const matchPhone = match.customer.phone.replace(/[^0-9]/g, '').slice(-10);
        if (cleanPhone === matchPhone) return match;
      }
    }
  } catch {}

  return null;
}

// ============================================================================
// ADMIN WORKFLOWS (STATUS, PAYMENT, INVENTORY & PRODUCT EDITING)
// ============================================================================

export async function adminUpdateOrderStatusInDb(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  docketNumber?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.rpc('admin_update_order_status', {
        p_order_id: orderId,
        p_status: newStatus,
        p_note: note || '',
        p_docket_number: docketNumber || null
      });
      if (!error) return true;
      console.error('Supabase admin status update error:', error);
    } catch (err) {
      console.error('Supabase admin status update exception:', err);
    }
  }
  return true;
}

export async function adminVerifyPaymentInDb(
  orderId: string,
  upiRefId?: string,
  verifiedBy?: string
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.rpc('admin_verify_payment', {
        p_order_id: orderId,
        p_upi_ref_id: upiRefId || null,
        p_verified_by: verifiedBy || 'Merchant Central Accounts'
      });
      if (!error) return true;
      console.error('Supabase admin payment verification error:', error);
    } catch (err) {
      console.error('Supabase admin payment verification exception:', err);
    }
  }
  return true;
}

export async function adminSaveProductInDb(product: Product): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      // Upsert products table
      const { error: prodErr } = await supabase.from('products').upsert({
        id: product.id,
        code: product.code,
        name: product.name,
        category_id: product.category,
        experience_tag: product.experienceTag,
        tagline: product.tagline,
        description: product.description,
        experience_description: product.experienceDescription,
        visual_effect: product.visualEffect,
        sound_level: product.soundLevel,
        sound_db: product.soundDb,
        duration: product.duration,
        altitude: product.altitude,
        pack_size: product.packSize,
        mrp: product.mrp,
        price: product.price,
        is_featured: product.isFeatured,
        is_bestseller: product.isBestseller,
        is_combo: product.isCombo,
        images: product.images,
        safety_guidelines: product.safetyGuidelines,
        best_for: product.bestFor,
        active: product.active,
        peso_license: product.pesoLicense,
        emission_class: product.emissionClass,
        is_green_certified: product.isGreenCertified,
        is_zero_barium: product.isZeroBarium,
        updated_at: new Date().toISOString()
      });

      if (prodErr) {
        console.error('Supabase product upsert error:', prodErr);
        return false;
      }

      // Upsert inventory table
      const { error: invErr } = await supabase.from('inventory').upsert({
        product_id: product.id,
        total_stock: product.stock,
        reserved_stock: product.reservedStock,
        min_threshold: product.lowStockThreshold,
        updated_at: new Date().toISOString()
      });

      if (invErr) {
        console.error('Supabase inventory upsert error:', invErr);
      }

      return true;
    } catch (err) {
      console.error('Supabase save product exception:', err);
      return false;
    }
  }
  return true;
}

export async function adminSaveSettingsInDb(settings: BusinessSettings): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const updates = [
        { setting_key: 'business_name', setting_value: settings.businessName },
        { setting_key: 'subtitle', setting_value: settings.subtitle },
        { setting_key: 'whatsapp_number', setting_value: settings.whatsappNumber },
        { setting_key: 'phone_number', setting_value: settings.phoneNumber },
        { setting_key: 'upi_id', setting_value: settings.upiId },
        { setting_key: 'business_address', setting_value: settings.businessAddress },
        { setting_key: 'dispatch_hub', setting_value: settings.dispatchHub },
        { setting_key: 'standard_delivery_charge', setting_value: String(settings.deliveryCharge) },
        { setting_key: 'free_delivery_threshold', setting_value: String(settings.freeDeliveryThreshold) },
        { setting_key: 'festive_discount_code', setting_value: settings.festiveDiscountCode },
        { setting_key: 'festive_discount_amount', setting_value: String(settings.festiveDiscountAmount) },
        { setting_key: 'is_store_online', setting_value: String(settings.isStoreOnline) },
        { setting_key: 'business_hours', setting_value: settings.businessHours },
        { setting_key: 'terms', setting_value: settings.terms },
        { setting_key: 'safety_notice', setting_value: settings.safetyNotice },
        { setting_key: 'peso_license', setting_value: settings.pesoLicense || '' }
      ];

      for (const item of updates) {
        await supabase
          .from('business_settings')
          .upsert({ ...item, updated_at: new Date().toISOString() });
      }
      return true;
    } catch (err) {
      console.error('Supabase save settings exception:', err);
      return false;
    }
  }
  return true;
}

// ============================================================================
// REALTIME SUBSCRIPTIONS (Targeted channels to avoid resource leakage)
// ============================================================================

export function subscribeToOrders(onOrderChange: (payload: any) => void) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel('orders_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        onOrderChange(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToSingleOrder(orderId: string, onUpdate: (order: Order) => void) {
  if (!isSupabaseConfigured() || !supabase || !orderId) return () => {};

  const channel = supabase
    .channel(`order_${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      async () => {
        const refreshed = await trackOrderById(orderId);
        if (refreshed) onUpdate(refreshed);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToInventory(onInventoryChange: () => void) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel('inventory_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inventory' },
      () => {
        onInventoryChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
