const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

import type { Product, Category } from '../types';

const responseCache = new Map<string, Promise<any>>();

async function fetchFromAPI(endpoint: string, options?: { cache?: boolean }) {
  // In dev, avoid caching across requests so admin changes appear immediately.
  const useCache = options?.cache ?? !import.meta.env.DEV;
  if (useCache) {
    const cached = responseCache.get(endpoint);
    if (cached) return cached;
  }

  const request = (async () => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      if (!response.ok) {
        console.error(`API error: ${response.status} for ${endpoint}`);
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Fetch error for ${endpoint}:`, error);
      throw error;
    }
  })();

  if (useCache) {
    responseCache.set(endpoint, request);
    request.catch(() => {
      responseCache.delete(endpoint);
    });
  }

  return request;
}

export async function getAllProducts(): Promise<Product[]> {
  const data = await fetchFromAPI('/api/products');
  return data.products.filter((p: Product) => p.isActive);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const product = await fetchFromAPI(`/api/products/${id}`);
    return product;
  } catch {
    return undefined;
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.category === categorySlug);
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchFromAPI('/api/categories');
  return data.categories || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts();
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}

export async function filterProducts(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
}): Promise<Product[]> {
  let products = await getAllProducts();

  if (filters.category) {
    products = products.filter((p) => p.category === filters.category);
  }

  if (filters.minPrice !== undefined) {
    products = products.filter((p) => p.basePrice >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => p.basePrice <= filters.maxPrice!);
  }

  if (filters.colors && filters.colors.length > 0) {
    products = products.filter((p) =>
      p.variants.some((v) => filters.colors!.includes(v.color))
    );
  }

  return products;
}

export function sortProducts(products: Product[], sortBy: 'price-asc' | 'price-desc' | 'newest' | 'name'): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.basePrice - b.basePrice);
    case 'price-desc':
      return sorted.sort((a, b) => b.basePrice - a.basePrice);
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function getVariantById(product: Product, variantId: string) {
  return product.variants.find((v) => v.id === variantId);
}

export function isVariantAvailable(product: Product, variantId: string): boolean {
  const variant = getVariantById(product, variantId);
  return variant?.isAvailable ?? false;
}

export function getVariantPrice(product: Product, variantId: string): number {
  const variant = getVariantById(product, variantId);
  if (!variant) return product.basePrice;
  return product.basePrice + variant.additionalPrice;
}

export async function createOrder(orderData: {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    variantId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
}): Promise<any> {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
}

export async function getSettings(): Promise<any> {
  return fetchFromAPI('/api/settings');
}

export async function getDeliverySettings(): Promise<any> {
  return fetchFromAPI('/api/delivery');
}
