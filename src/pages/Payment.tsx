// src/pages/Payment.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import { $cartItems, $cartSubtotal } from '../stores/cartStore';
import { useAuth } from '../hooks/useAuth';
import {
  createCashfreeOrderApi,
  getDeliverySettingsApi,
  getProductsApi,
  submitOrderConsultantRequestApi,
} from '../lib/api';
import type { DeliveryRegion, Product } from '../types';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, Video, Smartphone, QrCode, CreditCard, Building2 } from 'lucide-react';

declare global {
  interface Window {
    Cashfree?: any;
  }
}

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, token } = useAuth();
  const cartItems = useStore($cartItems);
  const subtotal = useStore($cartSubtotal);

  // Form Fields
  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [pincode, setPincode] = useState(profile?.pincode || '');
  const [trackingPreference, setTrackingPreference] = useState<'yes' | 'no'>('yes');
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Delivery & Processing States
  const [deliveryRegions, setDeliveryRegions] = useState<DeliveryRegion[]>([]);
  const [shippingCharge, setShippingCharge] = useState(50);
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<any[]>([]);
  const [consultantSent, setConsultantSent] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getDeliverySettingsApi();
        if (res?.regions && res.regions.length > 0) {
          setDeliveryRegions(res.regions);
        }
      } catch (e) {
        console.warn('Unable to load delivery regions:', e);
      }
    }
    loadConfig();
  }, []);

  // Update form fields if profile arrives
  useEffect(() => {
    if (profile) {
      if (profile.name && !name) setName(profile.name);
      if (profile.phone && !phone) setPhone(profile.phone);
      if (profile.whatsappNumber && !whatsappNumber) setWhatsappNumber(profile.whatsappNumber);
      if (profile.email && !email) setEmail(profile.email);
      if (profile.address && !address) setAddress(profile.address);
      if (profile.city && !city) setCity(profile.city);
      if (profile.state && !state) setState(profile.state);
      if (profile.pincode && !pincode) setPincode(profile.pincode);
    }
  }, [profile]);

  const validatePincode = (code: string) => {
    const cleanPin = code.trim();
    if (cleanPin.length !== 6 || isNaN(Number(cleanPin))) {
      setPincodeStatus('Please enter a valid 6-digit postal pincode.');
      setPincodeValid(false);
      return;
    }

    const num = parseInt(cleanPin, 10);
    const matchedRegion = deliveryRegions.find(
      (r) => r.isEnabled && num >= parseInt(r.pincodeStart, 10) && num <= parseInt(r.pincodeEnd, 10)
    );

    if (matchedRegion) {
      setShippingCharge(subtotal >= 1500 ? 0 : matchedRegion.deliveryCharge);
      setPincodeStatus(`✓ ${matchedRegion.regionName} — Delivery in ${matchedRegion.estimatedDays} day${matchedRegion.estimatedDays > 1 ? 's' : ''}`);
      setPincodeValid(true);
    } else {
      setShippingCharge(0);
      setPincodeStatus('Delivery is currently unavailable for this pincode.');
      setPincodeValid(false);
    }
  };

  const loadCashfreeSdk = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.Cashfree) {
        return resolve(window.Cashfree);
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(window.Cashfree);
      script.onerror = () => reject(new Error('Failed to load Cashfree payment gateway SDK.'));
      document.head.appendChild(script);
    });
  };

  const requestConsultant = async () => {
    setErrorMessage(null);
    try {
      await submitOrderConsultantRequestApi(token || '', { name, phone, whatsappNumber, email, address, city, state, pincode, cartItems, subtotal, requestedRegion: city });
      setConsultantSent(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to submit consultant request.');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStockErrors([]);

    if (!acceptTerms) {
      setErrorMessage('Please accept the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    if (!addressConfirmed) {
      setErrorMessage('Please confirm that your delivery address is correct before proceeding.');
      return;
    }

    if (!name.trim() || !phone.trim() || !whatsappNumber.trim() || !email.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in all required shipping and contact details.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanWhatsapp = whatsappNumber.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (cleanWhatsapp.length !== 10) {
      setErrorMessage('Please provide a valid 10-digit WhatsApp number.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your shopping bag is empty.');
      return;
    }

    if (pincodeValid !== true) {
      setErrorMessage('Please enter a supported delivery pincode before proceeding.');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = subtotal + shippingCharge;

      // 1. Create order on backend and acquire Cashfree session
      const result = await createCashfreeOrderApi({
        amount: totalAmount,
        currency: 'INR',
        customer: {
          name: name.trim(),
          phone: cleanPhone,
          whatsappNumber: cleanWhatsapp,
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          trackingRequested: trackingPreference === 'yes',
          addressConfirmed,
        },
        cartItems,
        shippingCharge,
        subtotal,
        totalAmount,
      });

      if (!result || !result.paymentSessionId || !result.orderId) {
        throw new Error('Payment session could not be established. Please try again.');
      }

      // 2. Device-aware Checkout: '_self' on mobile for seamless UPI Intent app launch, '_modal' on desktop for dynamic QR code overlay
      const CashfreeSdk = await loadCashfreeSdk();
      const activeEnv = result.environment === 'production' ? 'production' : 'sandbox';
      const cashfree = CashfreeSdk({ mode: activeEnv });

      // Robust mobile detection: userAgent pattern + screen width + touch capability
      const isMobileDevice = (): boolean => {
        if (typeof window === 'undefined') return false;
        const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();
        const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
        const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
        const isNarrow = window.innerWidth <= 768;
        return mobileKeywords.test(ua) || (isTouch && isNarrow);
      };

      const redirectTarget = isMobileDevice() ? '_self' : '_modal';

      cashfree.checkout({
        paymentSessionId: result.paymentSessionId,
        redirectTarget,
      })
      .then((checkoutResult: any) => {
        if (checkoutResult?.error) {
          console.warn('[Cashfree] Checkout response:', checkoutResult.error);
          if (checkoutResult.error.message && !checkoutResult.error.message.includes('closed')) {
            setErrorMessage(checkoutResult.error.message);
          }
          return;
        }

        // For mobile redirect, browser navigates away; for modal completion or dismissal:
        if (checkoutResult?.redirect) {
          return;
        }
        navigate(`/order/pending?cf_order_id=${encodeURIComponent(result.orderId)}`);
      })
      .catch((err: any) => {
        console.error('[Cashfree] Checkout error:', err);
        setErrorMessage('Unable to complete payment transaction. Please try again.');
      });

    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err.body?.stockErrors) {
        setStockErrors(err.body.stockErrors);
      } else {
        setErrorMessage(err.message || 'Could not initiate checkout.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAF7F2] px-4 py-16">
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-10 text-center max-w-md shadow-xs space-y-4">
          <h2 className="font-heading text-2xl text-[#1C1612]">Your Bag is Empty</h2>
          <p className="text-xs text-[#7D7063]">Please add creations to your shopping bag before checking out.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1612] text-[#FEF3C7] text-xs uppercase tracking-widest font-semibold"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const finalTotal = subtotal + shippingCharge;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 pb-6 border-b border-[#E8E1D5] flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-1">
              Direct Checkout
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#1C1612]">
              Complete <span className="font-serif italic text-[#C5A059]">Payment</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#7D7063]">
            <Lock className="w-4 h-4 text-[#C5A059]" />
            <span>256-bit Encrypted SSL Gateway</span>
          </div>
        </div>

        {/* Form & Summary */}
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Shipping Info (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E8E1D5] shadow-xs p-6 md:p-8 space-y-5">
              <h2 className="font-heading text-xl font-normal text-[#1C1612] flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                <span>1. Shipping &amp; Consignment Details</span>
                <span className="text-xs uppercase tracking-wider text-[#C5A059] font-sans font-medium">Bespoke Delivery</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8E1D5] rounded-xl text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10 digit mobile"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8E1D5] rounded-xl text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-1.5">
                    WhatsApp Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="10 digit WhatsApp mobile"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8E1D5] rounded-xl text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8E1D5] rounded-xl text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Apartment, Street address, Landmark…"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8E1D5] rounded-xl text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Coimbatore"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8E1D5] rounded-xl text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8E1D5] rounded-xl text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-1.5">
                    Postal Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      if (e.target.value.trim().length === 6) {
                        validatePincode(e.target.value);
                      }
                    }}
                    onBlur={() => validatePincode(pincode)}
                    placeholder="6 digit PIN (e.g. 641001)"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8E1D5] rounded-xl text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
                  />
                  {pincodeStatus && (
                    <p className={`mt-1.5 text-xs ${pincodeValid ? 'text-emerald-700' : 'text-red-600'}`}>
                      {pincodeStatus}
                    </p>
                  )}
                </div>
              </div>

              {/* Tracking Preference */}
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5]">
                <span className="block text-xs font-semibold text-[#5C5248] uppercase tracking-wider mb-2">
                  Would you like automated tracking updates for this order? *
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E1D5] bg-white cursor-pointer hover:border-[#C5A059] transition-colors">
                    <input
                      type="radio"
                      name="trackingPref"
                      value="yes"
                      checked={trackingPreference === 'yes'}
                      onChange={() => setTrackingPreference('yes')}
                      className="accent-[#C5A059] w-4 h-4"
                    />
                    <span className="text-xs font-medium text-[#1C1612]">YES — Send live tracking updates</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E1D5] bg-white cursor-pointer hover:border-[#C5A059] transition-colors">
                    <input
                      type="radio"
                      name="trackingPref"
                      value="no"
                      checked={trackingPreference === 'no'}
                      onChange={() => setTrackingPreference('no')}
                      className="accent-[#C5A059] w-4 h-4"
                    />
                    <span className="text-xs font-medium text-[#7D7063]">NO — Standard dispatch</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Order Summary & Cashfree Button (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8E1D5] shadow-sm p-5 sm:p-7 lg:sticky lg:top-24 space-y-5">
            <h2 className="font-heading text-xl font-normal text-[#1C1612] flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <span>Order Summary</span>
              <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3 py-2 border-b border-[#F0EAE1] last:border-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-14 object-cover rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm font-normal text-[#1C1612] truncate">{item.productName}</p>
                    <p className="text-[11px] text-[#8A7E72]">{item.color} • {item.quantity} unit{item.quantity > 1 ? 's' : ''}</p>
                  </div>
                  <span className="font-heading text-sm font-medium text-[#1C1612]">
                    ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Costs Breakdown */}
            <div className="space-y-2.5 py-4 border-y border-[#F0EAE1] text-xs sm:text-sm">
              <div className="flex justify-between text-[#7D7063]">
                <span>Subtotal</span>
                <span className="font-medium text-[#1C1612]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#7D7063]">
                <span>Shipping</span>
                <span className="font-medium text-[#1C1612]">
                  {shippingCharge === 0 ? <span className="text-emerald-700">COMPLIMENTARY</span> : `₹${shippingCharge}`}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-baseline">
                <div>
                  <span className="font-heading text-lg font-medium text-[#1C1612] block">Total Amount</span>
                  <span className="text-[11px] text-[#8A7E72]">Inclusive of all taxes</span>
                </div>
                <span className="font-heading text-2xl font-bold text-[#1C1612]">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Stock Errors Banner */}
            {stockErrors.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Some items are unavailable in selected quantity:</span>
                </div>
                <ul className="text-xs text-amber-700 space-y-1 pl-6 list-disc">
                  {stockErrors.map((err, i) => (
                    <li key={i}>{err.productName || 'Item'}: {err.reason}</li>
                  ))}
                </ul>
                <Link to="/cart" className="text-xs text-[#C5A059] font-medium hover:underline block pt-1">
                  ← Return to update bag
                </Link>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            {pincodeValid === false && pincode.length === 6 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <p className="text-xs text-amber-800">Delivery is not currently configured for this location. Our order consultants can help arrange delivery.</p>
                {consultantSent ? (
                  <p className="text-xs font-semibold text-emerald-700">Your consultant request was sent successfully.</p>
                ) : (
                  <button type="button" onClick={requestConsultant} className="w-full py-3 rounded-xl bg-[#C5A059] text-[#1C1612] text-xs font-semibold uppercase tracking-wider">Request Order Consultant</button>
                )}
              </div>
            )}

            {/* Unboxing Video Guideline — shown for every order before payment */}
            <div
              role="note"
              aria-label="Unboxing video guideline for all orders"
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3 items-start"
            >
              <Video className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Important: Record Your Unboxing Video
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  When your parcel is delivered, please record a clear, continuous unboxing video while opening the package and keep the video safely. If you receive a damaged, incorrect, missing, or otherwise problematic product, this unboxing video may be required to support a Return or Replacement request.
                </p>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  required
                  checked={addressConfirmed}
                  onChange={(e) => setAddressConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#D1C7BA] text-[#C5A059] focus:ring-[#C5A059]/30"
                />
                <span className="text-xs text-[#5C5248] leading-relaxed">
                  I confirm that the delivery address, city, state, and pincode entered above are correct.
                  <span className="text-red-500"> *</span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#D1C7BA] text-[#C5A059] focus:ring-[#C5A059]/30"
                />
                <span className="text-xs text-[#7D7063] leading-relaxed">
                  I accept the{' '}
                  <Link to="/terms" target="_blank" className="text-[#C5A059] hover:underline">Terms &amp; Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" className="text-[#C5A059] hover:underline">Privacy Policy</Link>.
                  View our{' '}
                  <Link to="/refund-policy" target="_blank" className="text-[#C5A059] hover:underline">Refund Policy</Link>.
                  <span className="text-red-500"> *</span>
                </span>
              </label>
            </div>

            {/* Supported Payment Channels Information Box */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]/70">
                <span className="text-[11px] font-semibold text-[#5C5248] uppercase tracking-wider">
                  Supported Payment Methods
                </span>
                <span className="text-[10px] text-[#C5A059] font-medium uppercase tracking-wider">
                  Cashfree Gateway
                </span>
              </div>

              {/* UPI Highlight */}
              <div className="bg-white rounded-xl p-3 border border-[#E8E1D5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1C1612] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Instant UPI &amp; Dynamic QR
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    Fastest
                  </span>
                </div>
                
                {/* Visual badges for supported UPI apps */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E8E1D5] rounded-lg text-[11px] font-medium text-[#1C1612]">
                    Google Pay
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E8E1D5] rounded-lg text-[11px] font-medium text-[#1C1612]">
                    PhonePe
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E8E1D5] rounded-lg text-[11px] font-medium text-[#1C1612]">
                    Paytm
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E8E1D5] rounded-lg text-[11px] font-medium text-[#1C1612]">
                    BHIM / Any UPI
                  </span>
                </div>

                <div className="pt-1 space-y-1 text-[11px] text-[#7D7063] leading-relaxed border-t border-stone-100">
                  <p>
                    <span className="font-medium text-[#1C1612]">Mobile:</span> Direct UPI Intent launches your installed UPI app.
                  </p>
                  <p>
                    <span className="font-medium text-[#1C1612]">Desktop:</span> Instant dynamic QR code appears for camera/UPI scan.
                  </p>
                </div>
              </div>

              {/* Cards & Net Banking Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5]">
                  <p className="font-medium text-[#1C1612] text-[11px]">Cards</p>
                  <p className="text-[10px] text-[#8A7E72] mt-0.5">Visa, Mastercard, RuPay</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#E8E1D5]">
                  <p className="font-medium text-[#1C1612] text-[11px]">Net Banking</p>
                  <p className="text-[10px] text-[#8A7E72] mt-0.5">50+ Indian Banks</p>
                </div>
              </div>
            </div>

            {/* Submit / Cashfree Checkout Button */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1C1612] text-[#FEF3C7] hover:bg-[#2A231D] disabled:opacity-50 py-4 px-6 rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] shadow-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#FEF3C7]/40 border-t-[#FEF3C7] animate-spin"></div>
                    <span>Initiating Cashfree Gateway…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Proceed to Pay ₹{finalTotal.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
              <p className="text-center text-[10px] text-[#8A7E72]">
                Secured by 256-bit SSL encryption via Cashfree Payments
              </p>
            </div>

            <Link
              to="/cart"
              className="block text-center text-xs text-[#7D7063] hover:text-[#1C1612] pt-1"
            >
              ← Return to Shopping Bag
            </Link>

          </div>

        </form>

      </div>
    </div>
  );
};
