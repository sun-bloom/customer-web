// src/lib/api.ts
// Central API Client for Sunbloom Adorn Customer Web

import type { Product, Category, Order, DeliverySettingsData, SiteSettings } from '../types';

const RENDER_BACKEND_URL = 'https://backend-api-bonr.onrender.com';
const RAW_ENV_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.PUBLIC_API_URL ||
  ''
).trim();
const isBrowser = typeof window !== 'undefined';
const isProductionHost =
  isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const pointsToLocalhost = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(RAW_ENV_URL);

export const API_BASE_URL = RAW_ENV_URL
  ? (isProductionHost && pointsToLocalhost ? RENDER_BACKEND_URL : RAW_ENV_URL)
  : (import.meta.env.DEV ? '' : RENDER_BACKEND_URL);

// Generic Fetcher with Timeout and Error Handling
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { token?: string | null; timeoutMs?: number } = {}
): Promise<T> {
  const { token, timeoutMs = 12000, headers: customHeaders, ...fetchOptions } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const error: any = new Error(errBody.message || errBody.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.body = errBody;
      throw error;
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your network connection.');
    }
    throw err;
  }
}

// ── Auth & Customer Sync ──────────────────────────────────────────────────
export async function syncCustomerApi(token: string) {
  return apiFetch<{ success: boolean; customer: any }>('/api/auth/sync-customer', {
    method: 'POST',
    token,
  });
}

export async function getCustomerProfileApi(token: string) {
  return apiFetch<{ customer: any }>('/api/auth/customer/me', {
    method: 'GET',
    token,
  });
}

export async function updateCustomerProfileApi(token: string, data: any) {
  return apiFetch<{ success: boolean; customer: any }>('/api/auth/customer/me', {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });
}

// ── Products & Categories ────────────────────────────────────────────────
export async function getProductsApi(): Promise<{ products: Product[] }> {
  return apiFetch<{ products: Product[] }>('/api/products');
}

export async function getProductBySlugApi(slug: string): Promise<Product> {
  try {
    return await apiFetch<Product>(`/api/products/slug/${encodeURIComponent(slug)}`);
  } catch (err: any) {
    // If not found by slug, fallback to lookup by ID
    return await apiFetch<Product>(`/api/products/${encodeURIComponent(slug)}`);
  }
}

export async function getProductByIdApi(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${encodeURIComponent(id)}`);
}

export async function getCategoriesApi(): Promise<{ categories: Category[] }> {
  return apiFetch<{ categories: Category[] }>('/api/categories');
}

export async function getCategoryBySlugApi(slug: string): Promise<Category | null> {
  const { categories } = await getCategoriesApi();
  return categories.find((c) => c.slug === slug) || null;
}

// ── Orders ───────────────────────────────────────────────────────────────
export async function getCustomerOrdersApi(token: string): Promise<{ orders: Order[] }> {
  return apiFetch<{ orders: Order[] }>('/api/customer/orders', {
    method: 'GET',
    token,
  });
}

export async function getCustomerOrderByIdApi(orderId: string, token: string): Promise<Order> {
  const res = await apiFetch<{ order?: Order } | Order>(`/api/customer/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    token,
  });
  return (res as any).order || (res as Order);
}

export async function trackOrderApi(orderNumber: string, phone: string): Promise<{ order: Order }> {
  return apiFetch<{ order: Order }>(
    `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`
  );
}

// ── Cashfree Payments ────────────────────────────────────────────────────
export async function createCashfreeOrderApi(data: {
  amount: number;
  currency?: string;
  customer: {
    name: string;
    phone: string;
    whatsappNumber: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    trackingRequested: boolean;
    addressConfirmed: boolean;
  };
  cartItems: any[];
  shippingCharge: number;
  subtotal: number;
  totalAmount: number;
}) {
  return apiFetch<{
    orderId: string;
    orderNumber: string;
    paymentSessionId: string;
    environment: string;
  }>('/api/payments/cashfree/create-order', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function checkCashfreeStatusApi(cfOrderId: string) {
  return apiFetch<{
    status: 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'ACTIVE' | string;
    orderNumber?: string;
    reason?: string;
  }>(`/api/payments/cashfree/status/${encodeURIComponent(cfOrderId)}`);
}

export async function getOrderByCfIdApi(cfOrderId: string) {
  return apiFetch<{ orderNumber: string }>(`/api/payments/cashfree/order-by-cf-id/${encodeURIComponent(cfOrderId)}`);
}

// ── Support ──────────────────────────────────────────────────────────────
export async function submitSupportQueryApi(data: {
  name: string;
  mobile?: string;
  phone?: string;
  whatsapp?: string;
  whatsappNumber?: string;
  email: string;
  queryType: string;
  description: string;
}, token?: string | null) {
  const payload = {
    name: data.name,
    phone: data.phone || data.mobile,
    whatsappNumber: data.whatsappNumber || data.whatsapp || data.phone || data.mobile,
    email: data.email,
    queryType: data.queryType,
    description: data.description,
  };

  return apiFetch<{ success: boolean; message: string }>('/api/customer/support', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// ── Site & Delivery Settings ─────────────────────────────────────────────
export async function getSettingsApi(): Promise<{ site?: SiteSettings; upi?: any }> {
  return apiFetch<{ site?: SiteSettings; upi?: any }>('/api/public/settings');
}

export async function getDeliverySettingsApi(): Promise<DeliverySettingsData> {
  return apiFetch<DeliverySettingsData>('/api/delivery');
}

export async function submitOrderConsultantRequestApi(token: string, data: any) {
  return apiFetch<{ success: boolean; requestId: string; message: string }>('/api/customer/order-consultants', {
    method: 'POST', token, body: JSON.stringify(data),
  });
}
