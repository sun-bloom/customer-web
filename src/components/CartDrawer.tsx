import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import {
  $cartItems,
  $isCartOpen,
  $cartSubtotal,
  closeCart,
  removeFromCart,
  updateQuantity,
  initCart,
} from '../stores/cartStore';
import { ShoppingBag, Sparkles, X } from 'lucide-react';

const CartDrawer: React.FC = () => {
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

      <div className="fixed top-0 right-0 h-full w-80 sm:w-92 max-w-[90vw] bg-[#FCF9F5] shadow-2xl z-50 border-l border-[#E8DCCF] transition-all">
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8DCCF] bg-white">
            <div>
              <h2 className="font-heading text-lg font-normal text-[#2A1C19]">Shopping Bag</h2>
              <span className="text-[11px] text-[#755B55] font-sans tracking-wide">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} {cartItems.length === 1 ? 'creation' : 'creations'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-[#755B55] hover:text-[#7A223B] hover:bg-[#FCE7EC] transition-colors cursor-pointer"
              aria-label="Close Bag"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Free Shipping Progress (Soft Blush + Champagne Gold) */}
          <div className="px-5 py-3 bg-gradient-to-r from-[#FDF2F5] via-[#FCF9F5] to-[#FAF5EB] border-b border-[#E8DCCF]">
            <div className="flex justify-between text-xs font-sans mb-1">
              <span className="text-[#7A223B] font-medium flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-[#DFC598]" />
                {amountToFreeShipping === 0 ? 'Complimentary shipping unlocked ✨' : `Add ₹${amountToFreeShipping} for Free Shipping`}
              </span>
              <span className="text-[#A88136] font-semibold text-[11px]">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E8DCCF]/60 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#7A223B] via-[#E29BB0] to-[#DFC598] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Bag Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-14">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border border-[#E8DCCF] text-[#7A223B] shadow-2xs">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-base font-normal text-[#2A1C19]">Your bag is empty</h3>
                <p className="text-xs text-[#755B55] font-sans mt-0.5">Explore our atelier to discover radiant pieces</p>
                <button
                  onClick={closeCart}
                  className="mt-4 px-5 py-2 rounded-xl btn-rose-primary text-xs uppercase tracking-widest font-sans font-medium transition-all shadow-2xs cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.variantId} className="flex gap-3.5 p-3 bg-white rounded-2xl border border-[#E8DCCF] shadow-2xs">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#FAF5EB] shrink-0 border border-[#E8DCCF]/60">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="text-xs sm:text-sm font-heading font-normal text-[#2A1C19] truncate">
                        {item.productName}
                      </h4>
                      <p className="text-[10px] text-[#755B55] font-sans mt-0.5">
                        {item.color} {item.pattern ? `• ${item.pattern}` : ''}
                      </p>
                      <p className="text-xs font-medium text-[#7A223B] font-sans mt-0.5">
                        ₹{item.unitPrice}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="flex items-center space-x-1.5 border border-[#E8DCCF] rounded-lg p-0.5 bg-[#FAF6F0]">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-5 h-5 rounded-md hover:bg-white text-[#2A1C19] flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer text-xs"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-4 text-center text-[11px] font-sans font-medium text-[#2A1C19]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-5 h-5 rounded-md hover:bg-white text-[#2A1C19] flex items-center justify-center transition-colors cursor-pointer text-xs"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-[10px] text-[#755B55] hover:text-[#7A223B] font-sans uppercase tracking-wider transition-colors cursor-pointer"
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
            <div className="bg-white border-t border-[#E8DCCF] p-5 space-y-3.5 shadow-lg">
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between text-[#755B55]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#2A1C19] font-sans">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[#755B55]">
                  <span>Shipping</span>
                  <span className="font-medium font-sans">{shipping === 0 ? <span className="text-emerald-700">Complimentary</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#2A1C19] pt-2 border-t border-[#F4ECE5]">
                  <span>Estimated Total</span>
                  <span className="text-sm font-sans font-bold text-[#7A223B]">₹{total}</span>
                </div>
              </div>

              <div className="space-y-2 pt-0.5">
                <a
                  href="/payment"
                  onClick={closeCart}
                  className="block w-full btn-rose-primary py-2.5 px-4 rounded-xl text-center font-sans text-xs uppercase tracking-[0.14em] font-medium shadow-xs transition-all active:scale-98"
                >
                  Proceed to Checkout
                </a>
                <a
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full border border-[#DFC598] bg-[#FCF9F5] text-[#7A223B] hover:bg-[#FDF2F5] py-2 px-4 rounded-xl text-center font-sans text-xs uppercase tracking-wider font-medium transition-colors"
                >
                  View Full Bag
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
