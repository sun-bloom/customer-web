import { map, computed } from 'nanostores';
import type { CartItem } from '../types';

export type { CartItem };

const CART_STORAGE_KEY = 'cart';

export const $cartItems = map<CartItem[]>([]);
export const $isCartOpen = map<boolean>(false);

export const $cartCount = computed($cartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const $cartSubtotal = computed($cartItems, (items) =>
  items.reduce((sum, item) => sum + item.totalPrice, 0)
);

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function dispatchCartEvent(eventName: string, items: CartItem[]) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail: { cart: items } }));
  }
}

export function initCart() {
  const items = loadCartFromStorage();
  $cartItems.set(items);
}

export function openCart() {
  $isCartOpen.set(true);
}

export function closeCart() {
  $isCartOpen.set(false);
}

export function toggleCart() {
  $isCartOpen.set(!$isCartOpen.get());
}

export function addToCart(item: CartItem) {
  const items = $cartItems.get();
  const existingIndex = items.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );

  let newItems: CartItem[];
  if (existingIndex >= 0) {
    newItems = items.map((i, index) =>
      index === existingIndex
        ? {
            ...i,
            quantity: i.quantity + item.quantity,
            totalPrice: (i.quantity + item.quantity) * i.unitPrice,
          }
        : i
    );
  } else {
    newItems = [...items, item];
  }

  $cartItems.set(newItems);
  saveCartToStorage(newItems);
  dispatchCartEvent('cart:updated', newItems);
  
  // Also dispatch item-added for backward compatibility
  if (existingIndex < 0) {
    dispatchCartEvent('cart:item-added', newItems);
  }
  
  openCart();
}

export function removeFromCart(variantId: string) {
  const items = $cartItems.get().filter((i) => i.variantId !== variantId);
  $cartItems.set(items);
  saveCartToStorage(items);
  dispatchCartEvent('cart:item-removed', items);
}

export function updateQuantity(variantId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(variantId);
    return;
  }

  const items = $cartItems.get().map((i) =>
    i.variantId === variantId
      ? { ...i, quantity, totalPrice: quantity * i.unitPrice }
      : i
  );
  $cartItems.set(items);
  saveCartToStorage(items);
  dispatchCartEvent('cart:item-quantity-changed', items);
}

export function clearCart() {
  $cartItems.set([]);
  saveCartToStorage([]);
  dispatchCartEvent('cart:cleared', []);
}

export function syncCartFromStorage() {
  const items = loadCartFromStorage();
  $cartItems.set(items);
}

// Listen for storage changes from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CART_STORAGE_KEY) {
      syncCartFromStorage();
    }
  });
  
  // Listen for legacy custom events from cart page
  window.addEventListener('cart:updated', () => syncCartFromStorage());
  window.addEventListener('cart:item-added', () => syncCartFromStorage());
  window.addEventListener('cart:item-removed', () => syncCartFromStorage());
  window.addEventListener('cart:cleared', () => {
    $cartItems.set([]);
    saveCartToStorage([]);
  });
}
