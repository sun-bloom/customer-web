// src/pages/Cart.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import {
  $cartItems,
  $cartSubtotal,
  removeFromCart,
  updateQuantity,
  clearCart,
  initCart,
} from '../stores/cartStore';
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, ShieldCheck, AlertCircle, Lock } from 'lucide-react';

const MINIMUM_ORDER_VALUE = 200;

export const Cart: React.FC = () => {
  const cartItems = useStore($cartItems);
  const subtotal = useStore($cartSubtotal);

  useEffect(() => {
    initCart();
  }, []);

  const isBelowMinimum = subtotal < MINIMUM_ORDER_VALUE;
  const amountToMinimum = Math.max(0, Number((MINIMUM_ORDER_VALUE - subtotal).toFixed(2)));

  const isPatternValueValid = (p?: string | null): p is string => {
    if (!p) return false;
    const trimmed = p.trim();
    if (!trimmed) return false;
    return !/^(null|undefined|none|n\/a)$/i.test(trimmed);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FCF9F5] px-4 py-16">
        <div className="bg-white rounded-3xl border border-[#EADBCE] p-10 sm:p-14 text-center max-w-lg shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF0F4] border border-[#F7C6D3] flex items-center justify-center mx-auto text-[#8B2E4B]">
            <ShoppingBag className="w-8 h-8 text-[#8B2E4B]" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-normal text-[#2A1C19]">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs sm:text-sm text-[#7D6460] font-light max-w-sm mx-auto">
            Discover our atelier's bespoke anti-tarnish creations and adorn yourself with enduring light.
          </p>
          <div className="pt-4">
            <Link
              to="/products"
              className="btn-rose-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-medium shadow-rose transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 text-[#E5C583]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-8 md:py-14 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-[#F2E5CC]/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Title */}
        <div className="mb-6 md:mb-8 pb-5 border-b border-[#E8DCCF] flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#7A223B] font-medium block mb-1">
              Your Atelier Selection
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-normal text-[#2A1C19]">
              Shopping <span className="font-serif italic text-rose-gold-gradient">Bag</span>
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="self-start sm:self-auto text-xs text-[#755B55] hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear Bag
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Left: Bag Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-3.5">
            {cartItems.map((item) => {
              const cleanPattern = isPatternValueValid(item.pattern) ? item.pattern.trim() : null;

              return (
                <div
                  key={item.variantId}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                >
                  <div className="flex gap-3.5 items-center min-w-0">
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="w-18 h-22 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#E8DCCF] flex-shrink-0 block"
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="min-w-0">
                      <Link to={`/products/${item.productSlug}`}>
                        <h3 className="font-heading text-sm sm:text-base font-normal text-[#2A1C19] hover:text-[#7A223B] transition-colors break-words">
                          {item.productName}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#755B55] mt-0.5">
                        Finish: {item.color || 'Standard'}{cleanPattern ? ` • ${cleanPattern}` : ''}
                      </p>
                      <p className="font-heading text-sm sm:text-base font-medium text-[#7A223B] mt-1.5">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Controls: Quantity & Total & Remove */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2.5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#F4ECE5]">
                    <div className="flex items-center border border-[#E8DCCF] rounded-xl bg-[#FAF6F0] p-0.5">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6.5 h-6.5 rounded-lg text-sm text-[#2A1C19] hover:bg-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-6.5 text-center text-xs font-semibold text-[#2A1C19]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-6.5 h-6.5 rounded-lg text-sm text-[#2A1C19] hover:bg-white flex items-center justify-center cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-heading text-base sm:text-lg font-medium text-[#2A1C19]">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="p-1.5 rounded-lg text-[#755B55] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#7A223B] hover:text-[#5E152A] font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>Continue Exploring Atelier</span>
              </Link>
            </div>
          </div>

          {/* Right: Order Summary Card (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-5 sm:p-6 shadow-xs space-y-5 lg:sticky lg:top-24">
            <h2 className="font-heading text-lg sm:text-xl font-normal text-[#2A1C19] pb-3 border-b border-[#F4ECE5]">
              Consignment Summary
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-[#755B55]">
                <span>Creations Subtotal</span>
                <span className="font-medium text-[#2A1C19]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#755B55]">
                <span>Insured Shipping</span>
                <span className="font-medium text-[#755B55] text-xs">
                  Calculated at checkout
                </span>
              </div>
              <div className="pt-2.5 border-t border-[#F4ECE5] flex justify-between items-baseline">
                <div>
                  <span className="font-heading text-base sm:text-lg font-medium text-[#2A1C19] block">Total</span>
                  <span className="text-[11px] text-[#A8928D]">
                    Shipping calculated at checkout
                  </span>
                </div>
                <span className="font-heading text-xl sm:text-2xl font-bold text-[#7A223B]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Minimum Order Value Banner & Notice */}
            {isBelowMinimum && (
              <div className="p-3.5 bg-[#FAF0F4] border border-[#F7C6D3] rounded-2xl flex items-start gap-2.5 text-xs text-[#7A223B]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#7A223B]" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Minimum Order Value: ₹{MINIMUM_ORDER_VALUE}</span>
                  <span className="text-[11px] text-[#5C4540]">
                    Add ₹{amountToMinimum.toLocaleString('en-IN')} more to reach the minimum order value of ₹200.
                  </span>
                </div>
              </div>
            )}

            {isBelowMinimum ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full bg-[#E8DCCF] text-[#A8928D] py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                >
                  <Lock className="w-3.5 h-3.5 text-[#A8928D]" />
                  <span>Proceed to Payment</span>
                </button>
                <p className="text-[11px] text-center text-[#7A223B] font-medium leading-tight">
                  Add ₹{amountToMinimum.toLocaleString('en-IN')} more to reach the minimum order value of ₹200.
                </p>
              </div>
            ) : (
              <Link
                to="/payment"
                className="w-full btn-rose-primary py-3 px-6 rounded-xl font-semibold text-xs uppercase tracking-[0.16em] shadow-xs transition-all duration-300 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFC598]" />
              </Link>
            )}

            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-[#755B55]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFC598]" />
              <span>256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
