// src/pages/Payment.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import { $cartItems, $cartSubtotal } from '../stores/cartStore';
import { useAuth } from '../hooks/useAuth';
import {
  calculateShippingApi,
  getPostalStatesApi,
  getPostalDistrictsApi,
  verifyPostalPincodeApi,
  submitOrderConsultantRequestApi,
  createOrderApi,
  updateCustomerProfileApi,
} from '../lib/api';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  Video,
  ChevronDown,
  Truck,
  CheckCircle2,
  HelpCircle,
  Send,
} from 'lucide-react';

// Complete official list of Indian States and Union Territories
const INDIAN_STATES_AND_UTS = [
  // 28 States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, token } = useAuth();
  const cartItems = useStore($cartItems);
  const subtotal = useStore($cartSubtotal);

  // Form Fields
  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || profile?.phone || '');
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState<boolean>(() => {
    if (profile?.phone && profile?.whatsappNumber) {
      return profile.phone.trim() === profile.whatsappNumber.trim();
    }
    return false;
  });
  const [address, setAddress] = useState(profile?.address || '');

  // Normalized Postal Address Hierarchy States
  const [statesList, setStatesList] = useState<string[]>(INDIAN_STATES_AND_UTS);
  const [state, setState] = useState(profile?.state || '');
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [city, setCity] = useState(profile?.city || '');
  const [pincode, setPincode] = useState(profile?.pincode || '');

  // Verification & Delivery States
  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const [deliverySupported, setDeliverySupported] = useState<boolean | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [requiresEnquiry, setRequiresEnquiry] = useState(false);

  const [shippingCharge, setShippingCharge] = useState<number | null>(null);

  // Checkout Agreement States
  const [trackingPreference, setTrackingPreference] = useState<'yes' | 'no'>('yes');
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Processing & Enquiry States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<any[]>([]);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [consultantSent, setConsultantSent] = useState(false);

  // Authenticated email from user/profile session
  const authEmail = (user?.email || profile?.email || '').trim().toLowerCase();

  // Load official states on mount
  useEffect(() => {
    getPostalStatesApi()
      .then((res) => {
        if (res.states && res.states.length > 0) setStatesList(res.states);
      })
      .catch(() => {});
  }, []);

  // Load official districts when state changes
  useEffect(() => {
    if (!state) {
      setDistrictsList([]);
      return;
    }
    getPostalDistrictsApi(state)
      .then((res) => {
        if (res.districts && res.districts.length > 0) {
          setDistrictsList(res.districts);
        }
      })
      .catch(() => {});
  }, [state]);

  // Update form fields automatically if profile arrives
  useEffect(() => {
    if (profile) {
      if (profile.name && !name) setName(profile.name);
      if (profile.phone && !phone) setPhone(profile.phone);
      if (profile.whatsappNumber && !whatsappNumber) {
        setWhatsappNumber(profile.whatsappNumber);
        if (profile.phone && profile.phone.trim() === profile.whatsappNumber.trim()) {
          setWhatsappSameAsPhone(true);
        }
      } else if (profile.phone && !whatsappNumber) {
        setWhatsappNumber(profile.phone);
        setWhatsappSameAsPhone(true);
      }
      if (profile.address && !address) setAddress(profile.address);
      if (profile.state && !state) setState(profile.state);
      if (profile.city && !city) setCity(profile.city);
      if (profile.pincode && !pincode) {
        setPincode(profile.pincode);
        if (/^\d{6}$/.test(profile.pincode.trim())) {
          verifyAndLookupPincode(profile.pincode.trim());
        }
      }
    }
  }, [profile]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    if (whatsappSameAsPhone) {
      setWhatsappNumber(val);
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsappNumber(e.target.value);
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setWhatsappSameAsPhone(checked);
    if (checked) {
      setWhatsappNumber(phone);
    }
  };

  // Authoritative Postal Pincode & Delivery Verification
  const verifyAndLookupPincode = async (code: string) => {
    const cleanPin = code.trim().replace(/\D/g, '');

    if (cleanPin.length === 0) {
      setPincodeStatus(null);
      setPincodeValid(null);
      setPincodeVerified(false);
      setDeliverySupported(null);
      setDeliveryMessage(null);
      setRequiresEnquiry(false);
      setCity('');
      setState('');
      setDistrictsList([]);
      setShippingCharge(null);
      return;
    }

    if (cleanPin.length !== 6) {
      setPincodeStatus('Invalid pincode. Please enter a 6-digit numeric pincode.');
      setPincodeValid(false);
      setPincodeVerified(false);
      setDeliverySupported(false);
      setDeliveryMessage(null);
      setRequiresEnquiry(false);
      setCity('');
      setState('');
      setDistrictsList([]);
      setShippingCharge(null);
      return;
    }

    setPincodeChecking(true);
    setPincodeStatus('Verifying pincode...');
    setDeliveryMessage(null);

    try {
      // 1. Verify against Government of India / Department of Posts Directory
      const postalData = await verifyPostalPincodeApi(cleanPin);

      if (!postalData || !postalData.isValid || !postalData.state || !postalData.district) {
        setPincodeValid(false);
        setPincodeVerified(false);
        setPincodeStatus('Invalid pincode. Please check and enter a valid pincode.');
        setDeliverySupported(false);
        setRequiresEnquiry(false);
        setCity('');
        setState('');
        setDistrictsList([]);
        setShippingCharge(null);
        return;
      }

      const verifiedState = postalData.state;
      const verifiedDistrict = postalData.district;

      setState(verifiedState);
      setCity(verifiedDistrict);

      // Load districts for this verified state
      const distRes = await getPostalDistrictsApi(verifiedState).catch(() => ({ districts: [] }));
      const distList = distRes.districts && distRes.districts.length > 0
        ? distRes.districts
        : [verifiedDistrict];
      if (!distList.includes(verifiedDistrict)) {
        distList.push(verifiedDistrict);
      }
      setDistrictsList(distList);

      setPincodeValid(true);
      setPincodeVerified(true);
      setPincodeStatus('Pincode verified');

      // 2. Authoritative backend delivery provider availability check
      const deliveryRes = await calculateShippingApi({
        subtotal,
        pincode: cleanPin,
        city: verifiedDistrict,
      });

      if (deliveryRes.isSupported) {
        setDeliverySupported(true);
        setRequiresEnquiry(false);
        setDeliveryMessage('Delivery available');
        setShippingCharge(typeof deliveryRes.shippingCharge === 'number' ? deliveryRes.shippingCharge : 0);
      } else {
        setDeliverySupported(false);
        setRequiresEnquiry(true);
        setDeliveryMessage('Delivery availability needs confirmation');
        setShippingCharge(null);
      }

    } catch (err: any) {
      console.warn('[Payment] Postal & delivery verification error:', err);
      setPincodeValid(false);
      setPincodeVerified(false);
      setPincodeStatus('Invalid pincode. Please check and enter a valid pincode.');
      setDeliverySupported(false);
      setRequiresEnquiry(false);
      setCity('');
      setState('');
      setDistrictsList([]);
      setShippingCharge(null);
    } finally {
      setPincodeChecking(false);
    }
  };

  // Initial verification on form load only if valid 6-digit pin is present
  useEffect(() => {
    if (pincode && /^\d{6}$/.test(pincode.trim())) {
      verifyAndLookupPincode(pincode.trim());
    }
  }, []);

  // Recalculate shipping if cart subtotal changes while delivery is supported
  useEffect(() => {
    if (pincode && pincode.length === 6 && pincodeVerified && deliverySupported) {
      calculateShippingApi({
        subtotal,
        pincode,
        city,
      })
        .then((res) => {
          if (res.isSupported) {
            setShippingCharge(typeof res.shippingCharge === 'number' ? res.shippingCharge : 0);
          }
        })
        .catch(() => {});
    }
  }, [subtotal]);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(digitsOnly);

    // Editing behaviour: Clear previous City/State and status on edit
    if (digitsOnly !== pincode) {
      setPincodeVerified(false);
      setPincodeValid(null);
      setDeliverySupported(null);
      setDeliveryMessage(null);
      setRequiresEnquiry(false);
      setCity('');
      setState('');
      setDistrictsList([]);
      setShippingCharge(null);

      if (digitsOnly.length > 0 && digitsOnly.length < 6) {
        setPincodeStatus('Invalid pincode. Please enter a 6-digit numeric pincode.');
        setPincodeValid(false);
      } else if (digitsOnly.length === 0) {
        setPincodeStatus(null);
      }
    }

    if (digitsOnly.length === 6) {
      verifyAndLookupPincode(digitsOnly);
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setState(newState);
    setCity('');
    setPincodeVerified(false);
    setPincodeValid(null);
    setDeliverySupported(null);
    setDeliveryMessage(null);
    setShippingCharge(null);

    const distRes = await getPostalDistrictsApi(newState).catch(() => ({ districts: [] }));
    setDistrictsList(distRes.districts || []);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
  };

  // Submit delivery enquiry when no provider is configured
  const handleRaiseDeliveryEnquiry = async () => {
    setErrorMessage(null);
    setEnquiryLoading(true);

    if (!authEmail) {
      setErrorMessage('Please sign in with your Google account to submit a delivery enquiry.');
      setEnquiryLoading(false);
      return;
    }

    const rawPhone = phone.trim();
    const rawWhatsapp = (whatsappSameAsPhone ? phone : whatsappNumber).trim();

    if (!name.trim() || !rawPhone || !address.trim() || !pincode.trim() || !city.trim() || !state.trim()) {
      setErrorMessage('Please fill in your name, contact phone, and full address before submitting a delivery enquiry.');
      setEnquiryLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(rawPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      setEnquiryLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(rawWhatsapp)) {
      setErrorMessage('Please enter a valid 10-digit Indian WhatsApp number (e.g. 9876543210).');
      setEnquiryLoading(false);
      return;
    }

    try {
      await submitOrderConsultantRequestApi(token || '', {
        name: name.trim(),
        phone: rawPhone,
        whatsappNumber: rawWhatsapp,
        email: authEmail,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        cartItems,
        subtotal,
        requestedRegion: `${city.trim()}, ${state.trim()}`,
      });
      setConsultantSent(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Unable to submit delivery enquiry. Please try again.');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStockErrors([]);

    if (!authEmail) {
      setErrorMessage('Please sign in with your authenticated Google account to proceed with checkout.');
      return;
    }

    if (!acceptTerms) {
      setErrorMessage('Please accept the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    if (!addressConfirmed) {
      setErrorMessage('Please confirm that your delivery address is correct before proceeding.');
      return;
    }

    const currentWhatsapp = whatsappSameAsPhone ? phone : whatsappNumber;
    if (!name.trim() || !phone.trim() || !currentWhatsapp.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in all required shipping and contact details.');
      return;
    }

    const rawPhone = phone.trim();
    const rawWhatsapp = currentWhatsapp.trim();

    if (!/^[6-9]\d{9}$/.test(rawPhone)) {
      setErrorMessage('Please provide a valid 10-digit Indian mobile number starting with 6-9 (e.g. 9876543210).');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(rawWhatsapp)) {
      setErrorMessage('Please provide a valid 10-digit Indian WhatsApp number starting with 6-9 (e.g. 9876543210).');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your shopping bag is empty.');
      return;
    }

    const MINIMUM_ORDER_VALUE = 200;
    if (subtotal < MINIMUM_ORDER_VALUE) {
      const remaining = Number((MINIMUM_ORDER_VALUE - subtotal).toFixed(2));
      setErrorMessage(`Add ₹${remaining.toLocaleString('en-IN')} more to reach the minimum order value of ₹200.`);
      return;
    }

    // Pincode & City/State validation check before order submission
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim()) || !pincodeVerified || pincodeValid !== true) {
      setErrorMessage('Please enter and verify a valid 6-digit postal pincode.');
      return;
    }

    if (!city.trim() || !state.trim()) {
      setErrorMessage('City/District and State must be verified from your postal pincode before checkout.');
      return;
    }

    if (deliverySupported !== true) {
      setErrorMessage('Delivery is currently not confirmed for this destination. Please raise a delivery enquiry.');
      return;
    }

    setLoading(true);

    try {
      // 1. Update customer profile in the background if logged in
      if (token) {
        updateCustomerProfileApi(token, {
          name: name.trim(),
          phone: rawPhone,
          whatsappNumber: rawWhatsapp,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        }).catch((profileErr) => console.warn('[Payment] Profile background sync warning:', profileErr.message));
      }

      // 2. Initiate PayU order creation via backend API
      const result = await createOrderApi(
        {
          currency: 'INR',
          customer: {
            name: name.trim(),
            phone: rawPhone,
            whatsappNumber: rawWhatsapp,
            email: authEmail,
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            trackingRequested: trackingPreference === 'yes',
            addressConfirmed,
          },
          cartItems,
        },
        token
      );

      if (result && result.payuPayload && result.payuUrl) {
        // Redirect to PayU securely via POST form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.payuUrl;

        Object.entries(result.payuPayload).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        setErrorMessage('Payment provider not yet configured. Please try again later.');
        setLoading(false);
      }

    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err.body?.stockErrors) {
        setStockErrors(err.body.stockErrors);
      } else if (err.body?.error === 'DELIVERY_UNAVAILABLE' || err.body?.requiresEnquiry) {
        setDeliverySupported(false);
        setRequiresEnquiry(true);
        setDeliveryMessage('Delivery availability needs confirmation');
        setErrorMessage('Delivery is not configured for this destination. Please raise a delivery enquiry.');
      } else {
        setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
      }
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FCF9F5] px-4 py-16">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-8 sm:p-10 text-center max-w-md shadow-xs space-y-4">
          <h2 className="font-heading text-2xl text-[#2A1C19]">Your Bag is Empty</h2>
          <p className="text-xs text-[#7D6460]">Please add creations to your shopping bag before checking out.</p>
          <Link
            to="/products"
            className="btn-rose-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isDeliveryVerified = deliverySupported === true && shippingCharge !== null;
  const finalTotal = isDeliveryVerified ? subtotal + (shippingCharge || 0) : subtotal;

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-10 md:py-14 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 pb-6 border-b border-[#E8DCCF]/60 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#7A223B] font-semibold block mb-1">
              Direct Checkout
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#2A1C19]">
              Complete <span className="font-serif italic text-rose-gold-gradient">Payment</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#7D6460]">
            <Lock className="w-4 h-4 text-[#C9A86A]" />
            <span>256-bit Encrypted SSL Gateway</span>
          </div>
        </div>

        {/* Form & Summary */}
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Shipping Info (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] shadow-xs p-6 md:p-8 space-y-5">
              <h2 className="font-heading text-xl font-normal text-[#2A1C19] flex items-center justify-between pb-3 border-b border-[#E8DCCF]/60">
                <span>1. Shipping &amp; Consignment Details</span>
                <span className="text-xs uppercase tracking-wider text-[#7A223B] font-sans font-medium">Bespoke Delivery</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Authenticated Account Information (Non-editable) */}
                <div className="md:col-span-2 p-3.5 bg-[#FAF6F0]/80 border border-[#E8DCCF] rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-[#A8928D] uppercase tracking-wider">
                      Signed In As
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#2A1C19] truncate block">
                      {authEmail || 'Authenticated Google Account'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider bg-[#FDF2F5] text-[#7A223B] border border-[#FCE7EC] px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
                    Google Account
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5 flex items-start justify-between gap-2 min-h-[1.5rem]">
                    <span className="leading-snug">Mobile Number *</span>
                    <span className="text-[10px] text-[#A8928D] font-normal tracking-normal uppercase whitespace-nowrap flex-shrink-0 mt-0.5">10 digits</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="e.g. 9790657579"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5 flex items-start justify-between gap-2 min-h-[1.5rem]">
                    <span className="leading-snug">WhatsApp Number *</span>
                    <span className="text-[10px] text-[#A8928D] font-normal tracking-normal uppercase whitespace-nowrap flex-shrink-0 mt-0.5">10 digits</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    readOnly={whatsappSameAsPhone}
                    onChange={handleWhatsappChange}
                    placeholder="e.g. 9790657579"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none transition-colors ${
                      whatsappSameAsPhone
                        ? 'bg-[#FAF6F0]/40 border-[#E8DCCF] text-[#7D6460] cursor-not-allowed'
                        : 'bg-[#FAF6F0]/60 border-[#E8DCCF] text-[#2A1C19] focus:border-[#7A223B]'
                    }`}
                  />
                </div>

                <div className="md:col-span-2 -mt-1.5 mb-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[#5C4540] hover:text-[#2A1C19]">
                    <input
                      type="checkbox"
                      checked={whatsappSameAsPhone}
                      onChange={(e) => handleSameAsPhoneToggle(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E8DCCF] text-[#7A223B] focus:ring-[#7A223B]/30"
                    />
                    <span>WhatsApp number same as mobile number</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Apartment, Street address, Landmark…"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
                  />
                </div>

                {/* State Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
                    State / Union Territory *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={state}
                      onChange={handleStateChange}
                      className="w-full appearance-none px-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B] pr-8 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>
                        Select state
                      </option>
                      {statesList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#A8928D] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* City / District Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
                    City / District *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={city}
                      onChange={handleCityChange}
                      disabled={districtsList.length === 0}
                      className="w-full appearance-none px-3.5 py-2.5 bg-[#FAF6F0]/60 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B] pr-8 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>
                        {pincodeChecking ? 'Detecting district...' : 'Select City / District'}
                      </option>
                      {districtsList.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#A8928D] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Pincode Input */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Postal Pincode *</span>
                    <span className="text-[10px] text-[#A8928D] font-normal">6 numeric digits</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={handlePincodeChange}
                    onBlur={() => {
                      if (pincode.length === 6 && !pincodeVerified && !pincodeChecking) {
                        verifyAndLookupPincode(pincode);
                      }
                    }}
                    placeholder="6 digit PIN (e.g. 641602)"
                    className={`w-full px-3.5 py-2.5 bg-[#FAF6F0]/60 border rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none transition-colors ${
                      pincodeValid === true
                        ? 'border-emerald-400 focus:border-emerald-500'
                        : pincodeValid === false
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#E8DCCF] focus:border-[#7A223B]'
                    }`}
                  />

                  {/* Verification Status */}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {pincodeChecking && (
                      <p className="text-xs text-[#7D6460] flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-full border-2 border-[#7A223B]/40 border-t-[#7A223B] animate-spin"></span>
                        <span>Verifying pincode...</span>
                      </p>
                    )}

                    {!pincodeChecking && pincodeStatus && (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        pincodeValid === true ? 'text-emerald-700' : pincodeValid === false ? 'text-red-600' : 'text-[#7D6460]'
                      }`}>
                        {pincodeValid === true && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {pincodeValid === false && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                        {pincodeStatus}
                      </span>
                    )}

                    {/* Delivery Provider Availability Status */}
                    {!pincodeChecking && pincodeValid === true && deliveryMessage && (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        deliverySupported === true
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        <Truck className="w-3 h-3" />
                        {deliveryMessage}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Enquiry Box when provider not configured */}
              {requiresEnquiry && !pincodeChecking && pincodeValid === true && (
                <div className="p-4 rounded-2xl bg-[#FDF2F5] border border-[#FCE7EC] space-y-3">
                  <div className="flex items-start gap-2.5 text-[#7A223B]">
                    <HelpCircle className="w-4 h-4 text-[#7A223B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Delivery Availability Needs Confirmation</p>
                      <p className="text-xs text-[#7D6460] mt-0.5 leading-relaxed">
                        A standard delivery provider is not automatically active for pincode <strong>{pincode}</strong> ({city}, {state}). You can raise a bespoke delivery enquiry, and our logistics team will arrange specialized delivery.
                      </p>
                    </div>
                  </div>

                  {consultantSent ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Your delivery enquiry has been recorded. Our team will contact you on WhatsApp/Phone shortly.</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRaiseDeliveryEnquiry}
                      disabled={enquiryLoading}
                      className="btn-rose-primary inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs"
                    >
                      {enquiryLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                          <span>Submitting enquiry…</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Raise Delivery Enquiry</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Tracking Preference */}
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF6F0]/80 border border-[#E8DCCF]">
                <span className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-2">
                  Would you like automated tracking updates for this order? *
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8DCCF] bg-white cursor-pointer hover:border-[#7A223B] transition-colors">
                    <input
                      type="radio"
                      name="trackingPref"
                      value="yes"
                      checked={trackingPreference === 'yes'}
                      onChange={() => setTrackingPreference('yes')}
                      className="accent-[#7A223B] w-4 h-4"
                    />
                    <span className="text-xs font-medium text-[#2A1C19]">YES — Send live tracking updates</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8DCCF] bg-white cursor-pointer hover:border-[#7A223B] transition-colors">
                    <input
                      type="radio"
                      name="trackingPref"
                      value="no"
                      checked={trackingPreference === 'no'}
                      onChange={() => setTrackingPreference('no')}
                      className="accent-[#7A223B] w-4 h-4"
                    />
                    <span className="text-xs font-medium text-[#7D6460]">NO — Standard dispatch</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Order Summary & Pay Button (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] shadow-xs p-5 sm:p-7 lg:sticky lg:top-24 space-y-5">
            <h2 className="font-heading text-xl font-normal text-[#2A1C19] flex items-center justify-between pb-3 border-b border-[#E8DCCF]/60">
              <span>Order Summary</span>
              <span className="w-2 h-2 rounded-full bg-[#7A223B]"></span>
            </h2>

            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3 py-2 border-b border-[#FAF6F0] last:border-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-14 object-cover rounded-xl bg-[#FAF6F0] border border-[#E8DCCF] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm font-normal text-[#2A1C19] truncate">{item.productName}</p>
                    <p className="text-[11px] text-[#A8928D]">
                      {item.color}
                      {item.pattern && !['null', 'undefined', 'n/a', 'none', ''].includes(String(item.pattern).trim().toLowerCase()) ? ` • ${item.pattern}` : ''}
                      {` • ${item.quantity} unit${item.quantity > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <span className="font-heading text-sm font-medium text-[#7A223B]">
                    ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Costs Breakdown */}
            <div className="space-y-2.5 py-4 border-y border-[#E8DCCF]/60 text-xs sm:text-sm">
              <div className="flex justify-between text-[#7D6460]">
                <span>Subtotal</span>
                <span className="font-medium text-[#2A1C19]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#7D6460]">
                <span>Shipping</span>
                <span className="font-medium text-[#2A1C19]">
                  {pincodeChecking ? (
                    <span className="text-[#A8928D] italic text-[11px]">Calculating…</span>
                  ) : isDeliveryVerified ? (
                    shippingCharge === 0 ? (
                      <span className="text-[#7A223B] font-semibold">Free Delivery</span>
                    ) : (
                      `₹${shippingCharge.toLocaleString('en-IN')}`
                    )
                  ) : deliverySupported === false ? (
                    <span className="text-amber-700 italic text-[11px]">Delivery unavailable for this location</span>
                  ) : (
                    <span className="text-[#A8928D] italic text-[11px]">Shipping calculated at checkout</span>
                  )}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-baseline">
                <div>
                  <span className="font-heading text-lg font-medium text-[#2A1C19] block">Total Amount</span>
                  <span className="text-[11px] text-[#A8928D]">
                    {isDeliveryVerified ? 'Inclusive of all taxes & shipping' : 'Shipping calculated at checkout'}
                  </span>
                </div>
                <span className="font-heading text-2xl font-bold text-[#7A223B]">
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
                <Link to="/cart" className="text-xs text-[#7A223B] font-medium hover:underline block pt-1">
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

            {/* Unboxing Video Guideline */}
            <div
              role="note"
              aria-label="Unboxing video guideline for all orders"
              className="p-4 rounded-2xl bg-[#FDF2F5] border border-[#FCE7EC] flex gap-3 items-start"
            >
              <Video className="w-5 h-5 flex-shrink-0 text-[#7A223B] mt-0.5" aria-hidden="true" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#7A223B] uppercase tracking-wider">
                  Important: Record Your Unboxing Video
                </p>
                <p className="text-xs text-[#7D6460] leading-relaxed">
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
                  className="mt-1 h-4 w-4 rounded border-[#E8DCCF] text-[#7A223B] focus:ring-[#7A223B]/30"
                />
                <span className="text-xs text-[#5C4540] leading-relaxed">
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
                  className="mt-1 h-4 w-4 rounded border-[#E8DCCF] text-[#7A223B] focus:ring-[#7A223B]/30"
                />
                <span className="text-xs text-[#7D6460] leading-relaxed">
                  I accept the{' '}
                  <Link to="/terms" target="_blank" className="text-[#7A223B] hover:underline">Terms &amp; Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" className="text-[#7A223B] hover:underline">Privacy Policy</Link>.
                  View our{' '}
                  <Link to="/refund-policy" target="_blank" className="text-[#7A223B] hover:underline">Refund Policy</Link>.
                  <span className="text-red-500"> *</span>
                </span>
              </label>
            </div>

            {/* Supported Payment Methods Notice */}
            <div className="p-4 rounded-2xl bg-[#FAF6F0]/80 border border-[#E8DCCF] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCF]/70">
                <span className="text-[11px] font-semibold text-[#5C4540] uppercase tracking-wider">
                  Supported Payment Methods
                </span>
                <span className="text-[10px] text-[#7A223B] font-medium uppercase tracking-wider">
                  PayU Hosted Checkout
                </span>
              </div>

              {/* UPI */}
              <div className="bg-white rounded-xl p-3 border border-[#E8DCCF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2A1C19] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    UPI
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    Instant &amp; QR
                  </span>
                </div>
                
                {/* Visual badges for supported UPI apps */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="px-2.5 py-1 bg-[#FAF6F0] border border-[#E8DCCF] rounded-lg text-[11px] font-medium text-[#2A1C19]">
                    Google Pay
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF6F0] border border-[#E8DCCF] rounded-lg text-[11px] font-medium text-[#2A1C19]">
                    PhonePe
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF6F0] border border-[#E8DCCF] rounded-lg text-[11px] font-medium text-[#2A1C19]">
                    Paytm
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF6F0] border border-[#E8DCCF] rounded-lg text-[11px] font-medium text-[#2A1C19]">
                    BHIM / Any UPI
                  </span>
                </div>

                <div className="pt-1 space-y-1 text-[11px] text-[#7D6460] leading-relaxed border-t border-stone-100">
                  <p>
                    <span className="font-medium text-[#2A1C19]">Mobile:</span> Direct UPI Intent launches your installed UPI app.
                  </p>
                  <p>
                    <span className="font-medium text-[#2A1C19]">Desktop:</span> Instant dynamic QR code appears for camera/UPI scan.
                  </p>
                </div>
              </div>

              {/* Cards & Net Banking Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* CARDS */}
                <div className="bg-white p-3 rounded-xl border border-[#E8DCCF] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2A1C19] text-xs uppercase tracking-wider">CARDS</span>
                    <span className="text-[10px] text-[#7D6460]">Credit &amp; Debit</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    <span className="px-2 py-0.5 bg-[#FAF6F0] border border-[#E8DCCF] rounded text-[11px] font-medium text-[#2A1C19]">
                      Visa
                    </span>
                    <span className="px-2 py-0.5 bg-[#FAF6F0] border border-[#E8DCCF] rounded text-[11px] font-medium text-[#2A1C19]">
                      Mastercard
                    </span>
                    <span className="px-2 py-0.5 bg-[#FAF6F0] border border-[#E8DCCF] rounded text-[11px] font-medium text-[#2A1C19]">
                      RuPay
                    </span>
                  </div>
                </div>

                {/* NET BANKING */}
                <div className="bg-white p-3 rounded-xl border border-[#E8DCCF] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2A1C19] text-xs uppercase tracking-wider">NET BANKING</span>
                    <span className="text-[10px] text-[#7D6460]">Online Banking</span>
                  </div>
                  <div className="pt-0.5">
                    <span className="px-2 py-0.5 bg-[#FAF6F0] border border-[#E8DCCF] rounded text-[11px] font-medium text-[#2A1C19] inline-block">
                      Indian bank net banking
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-[#7D6460] italic text-center pt-0.5">
                All payments are securely handled on the official PayU Hosted Checkout gateway.
              </p>
            </div>

            {/* Submit / PayU Checkout Button */}
            <div className="space-y-2">
              {subtotal < 200 ? (
                <div className="space-y-2">
                  <div className="p-3 bg-[#FAF0F4] border border-[#F7C6D3] rounded-xl text-xs text-[#7A223B]">
                    <span className="font-semibold block">Minimum Order Value: ₹200</span>
                    <span className="text-[11px] text-[#5C4540]">
                      Add ₹{Math.max(0, Number((200 - subtotal).toFixed(2))).toLocaleString('en-IN')} more to reach the minimum order value of ₹200.
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-[0.16em] bg-[#E8DCCF] text-[#A8928D] cursor-not-allowed opacity-75 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-[#A8928D]" />
                    <span>Minimum Order Value ₹200</span>
                  </button>
                  <p className="text-[11px] text-center text-[#7A223B] font-medium leading-tight">
                    Add ₹{Math.max(0, Number((200 - subtotal).toFixed(2))).toLocaleString('en-IN')} more to reach the minimum order value of ₹200.
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading || deliverySupported !== true}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-[0.16em] transition-all duration-300 flex items-center justify-center gap-2 ${
                    deliverySupported === true
                      ? 'btn-rose-primary cursor-pointer active:scale-98 shadow-sm'
                      : 'bg-[#E8DCCF] text-[#A8928D] cursor-not-allowed opacity-60'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
                      <span>Processing…</span>
                    </>
                  ) : deliverySupported === true ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#DFC598]" />
                      <span>Proceed to Pay ₹{finalTotal.toLocaleString('en-IN')}</span>
                    </>
                  ) : deliverySupported === false ? (
                    <>
                      <Lock className="w-4 h-4 text-[#7D6460]" />
                      <span>Delivery Unavailable for Location</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#7D6460]" />
                      <span>Delivery Verification Required</span>
                    </>
                  )}
                </button>
              )}
              <p className="text-center text-[10px] text-[#A8928D]">
                Secured by 256-bit SSL encryption
              </p>
            </div>

            <Link
              to="/cart"
              className="block text-center text-xs text-[#7A223B] hover:text-[#5E182C] font-medium pt-1"
            >
              ← Return to Shopping Bag
            </Link>

          </div>

        </form>

      </div>
    </div>
  );
};

export default Payment;
