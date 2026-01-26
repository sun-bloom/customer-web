import React, { useState, useEffect } from 'react';

interface CartItem {
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

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  images: string[];
  variants: Array<{
    id: string;
    color: string;
    pattern: string;
    stock: number;
    additionalPrice: number;
    sku: string;
    isAvailable: boolean;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CartDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productsData, setProductsData] = useState<{ products: Product[]; categories: any[] } | null>(null);
  const [subtotal, setSubtotal] = useState(0);

  // Load products data
  useEffect(() => {
    // In a real app, this would be fetched from an API
    // For now, we'll load it from a script tag in the document
    const productsDataElement = document.getElementById('products-data');
    if (productsDataElement) {
      const data = JSON.parse(productsDataElement.textContent || '{}');
      setProductsData(data);
    }
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = localStorage.getItem('cart');
        if (cart) {
          const items = JSON.parse(cart);
          setCartItems(items);

          // Calculate subtotal
          const subtotalAmount = items.reduce((total: number, item: CartItem) => total + item.totalPrice, 0);
          setSubtotal(subtotalAmount);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    // Load cart on component mount
    loadCart();

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update cart in localStorage
  const updateCart = (newItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(newItems));
    setCartItems(newItems);

    // Calculate subtotal
    const subtotalAmount = newItems.reduce((total, item) => total + item.totalPrice, 0);
    setSubtotal(subtotalAmount);

    // Update cart badge if it exists
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
      const totalItems = newItems.reduce((total, item) => total + item.quantity, 0);
      cartBadge.textContent = totalItems.toString();
    }
  };

  // Update item quantity
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const newItems = [...cartItems];
    newItems[index].quantity = newQuantity;
    newItems[index].totalPrice = newQuantity * newItems[index].unitPrice;

    updateCart(newItems);
  };

  // Remove item from cart
  const removeItem = (index: number) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    updateCart(newItems);
  };

  // Clear cart
  const clearCart = () => {
    updateCart([]);
  };

  // Calculate shipping (free shipping over ₹1500)
  const shipping = subtotal >= 1500 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500">Your cart is empty</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 text-gray-600 hover:text-black font-medium transition-colors border-b border-gray-300 hover:border-black"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.color} / {item.pattern}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{item.unitPrice}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <div className="space-y-2">
                <a
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-gray-900 text-white py-2 px-4 rounded-md text-center font-medium hover:bg-black transition-colors"
                >
                  View Cart
                </a>
                <a
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-center font-medium hover:bg-gray-300 transition-colors"
                >
                  Checkout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden script for products data */}
      <script
        id="products-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: productsData ? JSON.stringify(productsData) : '{}'
        }}
      />
    </>
  );
};

export default CartDrawer;