// src/components/cart/CartDrawer.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import {
  $cartItems,
  $isCartOpen,
  $cartSubtotal,
  closeCart,
  removeFromCart,
  updateQuantity,
  initCart,
} from '../../stores/cartStore';

export const CartDrawer: React.FC = () => {
  const cartItems = useStore($cartItems);
  const isOpen = useStore($isCartOpen);
  const subtotal = useStore($cartSubtotal);

  useEffect(() => {
    initCart();
  }, []);

  if (!isOpen) {
    return null;
  }

  const shippingThreshold = 1500;
  const shipping = subtotal >= shippingThreshold ? 0 : 50;
  const total = subtotal + shipping;
  const amountToFreeShipping = Math.max(0, shippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / shippingThreshold) * 100));

  return (
    <>
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed top-0 right-0 h-full w-full sm:w-96 max-w-[100vw] sm:max-w-[90vw] bg-[#FAF7F2] shadow-2xl z-50 border-l border-[#E8E2D8] transition-all">
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-5 border-b border-[#E8E2D8] bg-white">
            <div>
              <h2 className="font-heading text-xl font-normal text-stone-900">Shopping Bag</h2>
              <span className="text-[11px] text-stone-400 font-sans tracking-wide">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} {cartItems.length === 1 ? 'creation' : 'creations'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close Bag"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3.5 bg-amber-50/70 border-b border-amber-200/50">
            <div className="flex justify-between text-xs font-sans mb-1.5">
              <span className="text-amber-900 font-medium">
                {amountToFreeShipping === 0 ? 'Complimentary shipping unlocked ✨' : `Add ₹${amountToFreeShipping} for Free Shipping`}
              </span>
              <span className="text-amber-700 font-semibold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#C5A059] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Bag Items */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-[#E8E2D8] text-stone-400 shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-normal text-stone-800">Your bag is empty</h3>
                <p className="text-xs text-stone-500 font-sans mt-1">Explore our atelier to discover radiant pieces</p>
                <button
                  onClick={closeCart}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-stone-900 text-amber-200 hover:bg-stone-800 text-xs uppercase tracking-widest font-sans font-medium transition-all shadow-xs cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.variantId} className="flex gap-4 p-3 bg-white rounded-2xl border border-stone-200/70 shadow-2xs">
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="text-sm font-heading font-normal text-stone-900 break-words">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-sans mt-0.5">
                        {item.color} {item.pattern ? `• ${item.pattern}` : ''}
                      </p>
                      <p className="text-sm font-medium text-stone-900 font-sans mt-1">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-6 h-6 rounded-md hover:bg-white text-stone-600 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-sans font-medium text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-6 h-6 rounded-md hover:bg-white text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-[11px] text-stone-400 hover:text-stone-900 font-sans uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cartItems.length > 0 && (
            <div className="bg-white border-t border-[#E8E2D8] p-6 space-y-4 shadow-lg">
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900 font-sans">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  <span className="font-medium font-sans">{shipping === 0 ? <span className="text-emerald-700">Complimentary</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Estimated Total</span>
                  <span className="text-base font-sans font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <Link
                  to="/payment"
                  onClick={closeCart}
                  className="block w-full bg-stone-900 text-amber-200 hover:bg-stone-800 py-3.5 px-4 rounded-xl text-center font-sans text-xs uppercase tracking-[0.18em] font-medium shadow-md transition-all active:scale-98"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block w-full border border-stone-200 bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-50 py-3 px-4 rounded-xl text-center font-sans text-xs uppercase tracking-wider font-medium transition-colors"
                >
                  View Full Bag
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
