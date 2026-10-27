export type SoundLevel = 'Silent 0dB' | 'Whisper 45dB' | 'Low 85dB' | 'Medium 95dB' | 'High Salvo 110dB' | 'Low' | 'Medium' | 'High' | 'Noiseless';

export interface ComboItem {
  productId: string;
  productName: string;
  quantity: number;
  packSize?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  experienceTag?: 'bright-colourful' | 'sky-effects' | 'fountain-effects' | 'spinning-effects' | 'family-celebration' | 'combo-packs' | 'best-sellers';
  tagline: string;
  description: string;
  experienceDescription: string;
  visualEffect: string;
  soundLevel: string;
  duration: string;
  altitude: string;
  packSize: string;
  mrp: number;
  price: number;
  discountPercent: number;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isCombo?: boolean;
  comboItems?: ComboItem[];
  individualValue?: number;
  savingsAmount?: number;
  images: string[];
  videoThumbnail?: string;
  videoUrl?: string;
  safetyGuidelines: string[];
  bestFor: string;
  active: boolean;
  soundDb?: number;
  pesoLicense?: string;
  emissionClass?: string;
  isGreenCertified?: boolean;
  isZeroBarium?: boolean;
  rating?: number;
  reviewsCount?: number;
}

export interface Category {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  count: number;
  image: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export type OrderStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PAYMENT_REQUESTED'
  | 'CONFIRMED'
  | 'PACKING'
  | 'READY'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'REQUESTED'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'FAILED'
  | 'REFUNDED';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number; // snapshotted at time of order
  quantity: number;
  packSize: string;
  image: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export interface Order {
  id: string; // DRS-2026-XXXXX
  customer: CustomerDetails;
  deliveryMethod: 'delivery' | 'pickup';
  scheduledSlot: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimeline[];
  adminNotes?: string;
  docketNumber?: string;
  paymentMode: string;
}

export interface BusinessSettings {
  businessName: string;
  subtitle: string;
  whatsappNumber: string; // e.g. "917993785371"
  phoneNumber: string; // e.g. "+91 79937 85371"
  upiId: string; // e.g. "deepam.sparks@icici"
  businessAddress: string;
  dispatchHub: string;
  deliveryAreas: string[];
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  festiveDiscountCode: string;
  festiveDiscountAmount: number;
  isStoreOnline: boolean;
  terms: string;
  safetyNotice: string;
  businessHours: string;
  pesoLicense?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  city: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'INITIAL_STOCK' | 'STOCK_ADDED' | 'ORDER_RESERVED' | 'ORDER_CONFIRMED' | 'ORDER_CANCELLED' | 'MANUAL_ADJUSTMENT' | 'STOCK_RETURNED';
  quantityChange: number;
  balanceAfter: number;
  timestamp: string;
  referenceId?: string;
  note: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: 'customer' | 'admin';
  address?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface DetectedLocation {
  latitude: number;
  longitude: number;
  city: string;
  area: string;
  address: string;
  pincode: string;
  state?: string;
  source?: 'gps' | 'network' | 'ip' | 'manual';
}
