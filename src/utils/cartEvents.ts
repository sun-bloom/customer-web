// Cart event system for cross-component communication

// Custom event names
export const CART_EVENTS = {
    UPDATED: 'cart:updated',
    ITEM_ADDED: 'cart:item-added',
    ITEM_REMOVED: 'cart:item-removed',
    ITEM_QUANTITY_CHANGED: 'cart:item-quantity-changed',
    CLEARED: 'cart:cleared'
};

// Get cart from localStorage
export function getCart() {
    try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error reading cart:', error);
        return [];
    }
}

// Save cart to localStorage and dispatch event
export function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        dispatchCartEvent(CART_EVENTS.UPDATED, { cart });
        return true;
    } catch (error) {
        console.error('Error saving cart:', error);
        return false;
    }
}

// Dispatch custom cart event
export function dispatchCartEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
        detail: {
            ...detail,
            timestamp: Date.now()
        }
    });
    window.dispatchEvent(event);
}

// Add item to cart
export function addToCart(item) {
    const cart = getCart();

    // Check if item already exists
    const existingIndex = cart.findIndex(
        cartItem => cartItem.productId === item.productId && cartItem.variantId === item.variantId
    );

    if (existingIndex >= 0) {
        // Update quantity
        cart[existingIndex].quantity += item.quantity || 1;
        cart[existingIndex].totalPrice = cart[existingIndex].quantity * cart[existingIndex].unitPrice;
    } else {
        // Add new item
        cart.push({
            ...item,
            quantity: item.quantity || 1,
            totalPrice: (item.quantity || 1) * item.unitPrice
        });
    }

    saveCart(cart);
    dispatchCartEvent(CART_EVENTS.ITEM_ADDED, { item });

    return cart;
}

// Remove item from cart
export function removeFromCart(productId, variantId) {
    const cart = getCart();
    const filteredCart = cart.filter(
        item => !(item.productId === productId && item.variantId === variantId)
    );

    saveCart(filteredCart);
    dispatchCartEvent(CART_EVENTS.ITEM_REMOVED, { productId, variantId });

    return filteredCart;
}

// Update item quantity
export function updateCartItemQuantity(productId, variantId, quantity) {
    if (quantity <= 0) {
        return removeFromCart(productId, variantId);
    }

    const cart = getCart();
    const itemIndex = cart.findIndex(
        item => item.productId === productId && item.variantId === variantId
    );

    if (itemIndex >= 0) {
        cart[itemIndex].quantity = quantity;
        cart[itemIndex].totalPrice = quantity * cart[itemIndex].unitPrice;
        saveCart(cart);
        dispatchCartEvent(CART_EVENTS.ITEM_QUANTITY_CHANGED, { productId, variantId, quantity });
    }

    return cart;
}

// Clear cart
export function clearCart() {
    localStorage.removeItem('cart');
    dispatchCartEvent(CART_EVENTS.CLEARED);
    return [];
}

// Get cart item count
export function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get cart total
export function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.totalPrice, 0);
}

// Listen to cart updates
export function onCartUpdate(callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener(CART_EVENTS.UPDATED, handler);
    return () => window.removeEventListener(CART_EVENTS.UPDATED, handler);
}
