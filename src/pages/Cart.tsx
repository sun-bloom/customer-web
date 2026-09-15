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
import { ShoppingBag, ArrowRight, Trash2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

import { getDeliverySettingsApi } from '../lib/api';

export const Cart: React.FC = () => {
  const cartItems = useStore($cartItems);
  const subtotal = useStore($cartSubtotal);
  const [shippingThreshold, setShippingThreshold] = React.useState(1500);

  useEffect(() => {
    initCart();
    getDeliverySettingsApi()
      .then((settings) => {
        if (settings?.freeShippingThreshold) {
          setShippingThreshold(settings.freeShippingThreshold);
        }
      })
      .catch(() => {});
  }, []);

  const isComplimentary = subtotal >= shippingThreshold && subtotal > 0;
  const amountToFreeShipping = Math.max(0, shippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / shippingThreshold) * 100));

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAF7F2] px-4 py-16">
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-10 sm:p-14 text-center max-w-lg shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#C5A059]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-normal text-[#1C1612]">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs sm:text-sm text-[#7D7063] font-light max-w-sm mx-auto">
            Discover our atelier's bespoke anti-tarnish creations and adorn yourself with enduring light.
          </p>
          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1C1612] text-[#FEF3C7] text-xs uppercase tracking-[0.2em] font-medium shadow-gold hover:bg-[#2A231D] transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 text-[#C5A059]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-8 md:mb-10 pb-6 border-b border-[#E8E1D5] flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-1">
              Your Atelier Selection
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#1C1612]">
              Shopping <span className="font-serif italic text-[#C5A059]">Bag</span>
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="self-start sm:self-auto text-xs text-[#8A7E72] hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Notification Bar */}
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 mb-8 shadow-2xs">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-medium text-[#1C1612]">
              {amountToFreeShipping === 0 ? (
                <span className="text-emerald-700 flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  Complimentary Pan-India Insured Shipping Unlocked ✨
                </span>
              ) : (
                `Add ₹${amountToFreeShipping.toLocaleString('en-IN')} more for Complimentary Shipping`
              )}
            </span>
            <span className="font-bold text-[#C5A059]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#E8E1D5]">
            <div
              className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Bag Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.variantId}
                className="bg-white rounded-3xl border border-[#E8E1D5] p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center min-w-0">
                  <Link
                    to={`/products/${item.productSlug}`}
                    className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8E1D5] flex-shrink-0 block"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link to={`/products/${item.productSlug}`}>
                      <h3 className="font-heading text-base sm:text-lg font-normal text-[#1C1612] hover:text-[#C5A059] transition-colors break-words">
                        {item.productName}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#8A7E72] mt-0.5">
                      Finish: {item.color} {item.pattern ? `• ${item.pattern}` : ''}
                    </p>
                    <p className="font-heading text-base font-medium text-[#1C1612] mt-2">
                      ₹{item.unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Controls: Quantity & Total & Remove */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F0EAE1]">
                  <div className="flex items-center border border-[#E8E1D5] rounded-xl bg-[#FAF7F2] p-0.5">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-lg text-sm text-[#1C1612] hover:bg-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-xs font-semibold text-[#1C1612]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg text-sm text-[#1C1612] hover:bg-white flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-heading text-lg font-medium text-[#1C1612]">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="p-1.5 rounded-lg text-[#8A7E72] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7D7063] hover:text-[#1C1612] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Exploring Atelier</span>
              </Link>
            </div>
          </div>

          {/* Right: Order Summary Card (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E8E1D5] p-5 sm:p-7 shadow-sm space-y-6 lg:sticky lg:top-24">
            <h2 className="font-heading text-xl font-normal text-[#1C1612] pb-4 border-b border-[#F0EAE1]">
              Consignment Summary
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-[#7D7063]">
                <span>Creations Subtotal</span>
                <span className="font-medium text-[#1C1612]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#7D7063]">
                <span>Insured Shipping</span>
                <span className="font-medium text-[#1C1612]">
                  {isComplimentary ? (
                    <span className="text-emerald-700 font-semibold">COMPLIMENTARY</span>
                  ) : (
                    <span className="text-xs text-[#8A7E72]">Calculated at checkout</span>
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-[#F0EAE1] flex justify-between items-baseline">
                <div>
                  <span className="font-heading text-lg font-medium text-[#1C1612] block">Total</span>
                  <span className="text-[11px] text-[#8A7E72]">
                    {isComplimentary ? 'Includes complimentary insured delivery' : 'Delivery region resolved at payment'}
                  </span>
                </div>
                <span className="font-heading text-2xl font-bold text-[#1C1612]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Link
              to="/payment"
              className="w-full bg-[#1C1612] text-[#FEF3C7] hover:bg-[#2A231D] py-4 px-6 rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] shadow-gold transition-all duration-300 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </Link>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#8A7E72]">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
