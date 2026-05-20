// ===========================================
// Cart Types
// ===========================================

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  color: string;
  pattern: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  shippingCharge: number;
  total: number;
  itemCount: number;
}

// ===========================================
// Product Types
// ===========================================

export interface Variant {
  id: string;
  color: string;
  pattern: string;
  stock: number;
  additionalPrice: number;
  sku: string;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategoryId?: string;
  description: string;
  basePrice: number;
  images: string[];
  variants: Variant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductsData {
  products: Product[];
  categories: Category[];
}

// ===========================================
// Order Types
// ===========================================

export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  color: string;
  pattern: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentScreenshot?: string;
  upiTransactionId?: string;
  paidAt?: string;
  orderStatus: OrderStatus;
  trackingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersData {
  orders: Order[];
  nextOrderNumber: number;
}

// ===========================================
// Settings Types
// ===========================================

export interface SiteSettings {
  name: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
}

export interface UPISettings {
  vpa: string;
  name: string;
  qrCode: string;
}

export interface SocialSettings {
  instagram: string;
  facebook: string;
  whatsapp: string;
}

export interface PolicySettings {
  returnDays: number;
  replacementDays: number;
  minOrderAmount: number;
  freeShippingAbove: number;
}

export interface SettingsData {
  site: SiteSettings;
  upi: UPISettings;
  social: SocialSettings;
  policies: PolicySettings;
}

// ===========================================
// Delivery Settings Types
// ===========================================

export interface DeliveryRegion {
  id: string;
  regionName: string;
  pincodeStart: string;
  pincodeEnd: string;
  isEnabled: boolean;
  deliveryCharge: number;
  estimatedDays: number;
  codAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAvailability {
  available: boolean;
  charge: number;
  days: number;
  region: DeliveryRegion | null;
}

export interface DeliverySettingsData {
  regions: DeliveryRegion[];
}

// ===========================================
// Admin Types
// ===========================================

export interface AdminPermissions {
  products: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  orders: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  settings: {
    update: boolean;
  };
  admins?: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

export type AdminRole = 'super_admin' | 'order_manager' | 'product_manager';

export interface Admin {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  permissions: AdminPermissions;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AdminsData {
  admins: Admin[];
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
