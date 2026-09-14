import React, { useState, useEffect } from 'react';
import { auth, subscribeToAuth, logout, getIdToken } from '../lib/firebase';
import {
  $cartItems,
  $cartCount,
  $cartSubtotal,
  addToCart,
  removeFromCart,
  updateQuantity,
  initCart,
} from '../stores/cartStore';
import type { CartItem } from '../types';

interface ProductVariant {
  id: string;
  color?: string;
  pattern?: string;
  stock: number;
  additionalPrice: number;
  isAvailable: boolean;
  images: string[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  isActive: boolean;
  category: string;
  categoryDetails?: { id: string; name: string; slug: string } | null;
  variants: ProductVariant[];
  createdAt?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface OrderItemData {
  id: string;
  quantity: number;
  price: number;
  variant?: {
    id: string;
    color?: string;
    pattern?: string;
    product?: {
      name: string;
      images: string[];
    };
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: OrderItemData[];
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  whatsappNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

interface Props {
  apiUrl: string;
}

type TabType =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'cart'
  | 'orders'
  | 'track'
  | 'support'
  | 'settings';

export default function CustomerDashboard({ apiUrl }: Props) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [cartItemsState, setCartItemsState] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Loading & notification states
  const [loadingData, setLoadingData] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Support query form state
  const [supportCategory, setSupportCategory] = useState('Order Issue');
  const [supportDescription, setSupportDescription] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState<{ id: string } | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);

  // Quick variant selection modal
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [chosenVariantId, setChosenVariantId] = useState<string>('');

  // Tracking query state
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Controlled Profile States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWhatsapp, setProfileWhatsapp] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileState, setProfileState] = useState('');
  const [profilePincode, setProfilePincode] = useState('');

  // Mobile navigation drawer toggle
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // 1. Initialize Cart & Sync Store
  useEffect(() => {
    initCart();
    setCartItemsState([...$cartItems.get()]);
    setCartTotal($cartSubtotal.get());

    const unsubCart = $cartItems.subscribe((items) => {
      setCartItemsState([...items]);
      setCartTotal($cartSubtotal.get());
    });

    return () => unsubCart();
  }, []);

  // 2. Handle URL parameters for initial tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as TabType;
      if (
        viewParam &&
        [
          'dashboard',
          'products',
          'categories',
          'cart',
          'orders',
          'track',
          'support',
          'settings',
        ].includes(viewParam)
      ) {
        setActiveTab(viewParam);
      }
      const catParam = params.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
        setActiveTab('products');
      }
    }
  }, []);

  // 3. Subscribe to Firebase Auth
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        fetchCustomerData(user);
      }
    });
    return () => unsub();
  }, []);

  // 4. Fetch Products & Categories
  useEffect(() => {
    fetchCatalogData();
  }, []);

  const fetchCatalogData = async () => {
    try {
      const [prodRes, catRes, recentRes, topRes] = await Promise.all([
        fetch(`${apiUrl}/api/products`).catch(() => null),
        fetch(`${apiUrl}/api/categories`).catch(() => null),
        fetch(`${apiUrl}/api/products/featured/recent`).catch(() => null),
        fetch(`${apiUrl}/api/products/featured/top-selling`).catch(() => null),
      ]);

      if (prodRes && prodRes.ok) {
        const pData = await prodRes.json();
        const activeOnly = (pData.products || []).filter((p: Product) => p.isActive);
        setProducts(activeOnly);
      }
      if (catRes && catRes.ok) {
        const cData = await catRes.json();
        setCategories(cData.categories || []);
      }
      if (recentRes && recentRes.ok) {
        const rData = await recentRes.json();
        setRecentProducts(rData.products || []);
      }
      if (topRes && topRes.ok) {
        const tData = await topRes.json();
        setTopSellingProducts(tData.products || []);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching catalog:', err);
    }
  };

  // 5. Fetch Customer Profile & Orders
  const fetchCustomerData = async (user: any) => {
    setLoadingData(true);
    try {
      const token = await getIdToken();
      if (!token) return;

      const profileRes = await fetch(`${apiUrl}/api/auth/customer/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.ok) {
        const data = await profileRes.json();
        if (data.customer) {
          setProfile(data.customer);
          setOrders(data.customer.orders || []);
        }
      } else {
        // Fallback: fetch orders from customer orders route
        const ordersRes = await fetch(`${apiUrl}/api/customer/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ordersRes.ok) {
          const oData = await ordersRes.json();
          setOrders(oData.orders || []);
        }
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching customer data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Sync profile form states when profile or currentUser loads
  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || currentUser?.displayName || '');
      setProfilePhone(profile.phone || '');
      setProfileWhatsapp(profile.whatsappNumber || profile.phone || '');
      setProfileAddress(profile.address || '');
      setProfileCity(profile.city || '');
      setProfileState(profile.state || '');
      setProfilePincode(profile.pincode || '');
    } else if (currentUser) {
      setProfileName(currentUser.displayName || '');
    }
  }, [profile, currentUser]);

  // 6. Handle Customer Profile Update
  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const token = await getIdToken();
      if (!token) {
        setProfileError('Authentication session expired. Please sign in again.');
        return;
      }

      const payload = {
        name: profileName.trim(),
        phone: profilePhone.trim() || null,
        whatsappNumber: profileWhatsapp.trim() || null,
        address: profileAddress.trim() || null,
        city: profileCity.trim() || null,
        state: profileState.trim() || null,
        pincode: profilePincode.trim() || null,
      };

      const res = await fetch(`${apiUrl}/api/auth/customer/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update profile settings.');
      }

      const resData = await res.json();
      setProfile(resData.customer);
      setProfileSuccess('Your customer settings have been saved successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'An error occurred while updating profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // 7. Handle Customer Support Submission
  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSubmitting(true);
    setSupportSuccess(null);
    setSupportError(null);

    try {
      if (!supportDescription.trim()) {
        setSupportError('Please describe your query in detail.');
        return;
      }

      const payload = {
        name: profile?.name || currentUser?.displayName || 'Valued Client',
        email: profile?.email || currentUser?.email || '',
        phone: profile?.phone || '',
        whatsappNumber: profile?.whatsappNumber || profile?.phone || '',
        queryType: supportCategory,
        description: supportDescription.trim(),
        customerId: profile?.id || null,
      };

      const res = await fetch(`${apiUrl}/api/customer/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit support query.');
      }

      const data = await res.json();
      setSupportSuccess({ id: data.query?.id || 'SUBMITTED' });
      setSupportDescription('');
    } catch (err: any) {
      setSupportError(err.message || 'Failed to submit query. Please try again.');
    } finally {
      setSupportSubmitting(false);
    }
  };

  // 8. Handle Live Tracking Lookup
  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingResult(null);

    try {
      if (!trackOrderNumber.trim()) {
        setTrackingError('Please provide an order or consignment number.');
        return;
      }

      // Check customer's existing loaded orders first
      const localMatch = orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === trackOrderNumber.trim().toLowerCase() ||
          o.trackingNumber?.toLowerCase() === trackOrderNumber.trim().toLowerCase()
      );

      if (localMatch) {
        setTrackingResult({
          orderNumber: localMatch.orderNumber,
          createdAt: localMatch.createdAt,
          status: localMatch.status,
          totalAmount: localMatch.totalAmount,
          trackingCarrier: localMatch.trackingCarrier || 'Sunbloom Logistics Partner',
          trackingNumber: localMatch.trackingNumber,
          trackingUrl: localMatch.trackingUrl,
          itemsCount: localMatch.items?.length || 1,
        });
        return;
      }

      // Live lookup via backend API
      const res = await fetch(
        `${apiUrl}/api/orders/track?orderNumber=${encodeURIComponent(
          trackOrderNumber.trim()
        )}&phone=${encodeURIComponent(trackPhone.trim())}`
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Consignment records not found.');
      }

      const data = await res.json();
      setTrackingResult(data.order || data);
    } catch (err: any) {
      setTrackingError(
        err.message || 'Unable to locate consignment. Please verify the order number.'
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  // 9. Add to Cart helper
  const handleAddToCartClick = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return;

    if (product.variants.length === 1) {
      const v = product.variants[0];
      const cartItem: CartItem = {
        productId: product.id,
        variantId: v.id,
        productName: product.name,
        productSlug: product.slug,
        color: v.color || 'Standard',
        pattern: v.pattern || 'Classic',
        quantity: 1,
        unitPrice: product.basePrice + (v.additionalPrice || 0),
        totalPrice: product.basePrice + (v.additionalPrice || 0),
        productImage: v.images?.[0] || product.images?.[0] || '/logo.png',
      };
      addToCart(cartItem);
    } else {
      setSelectedProductForModal(product);
      setChosenVariantId(product.variants[0].id);
    }
  };

  const confirmModalAddToCart = () => {
    if (!selectedProductForModal) return;
    const v = selectedProductForModal.variants.find((item) => item.id === chosenVariantId);
    if (!v) return;

    const cartItem: CartItem = {
      productId: selectedProductForModal.id,
      variantId: v.id,
      productName: selectedProductForModal.name,
      productSlug: selectedProductForModal.slug,
      color: v.color || 'Standard',
      pattern: v.pattern || 'Classic',
      quantity: 1,
      unitPrice: selectedProductForModal.basePrice + (v.additionalPrice || 0),
      totalPrice: selectedProductForModal.basePrice + (v.additionalPrice || 0),
      productImage: v.images?.[0] || selectedProductForModal.images?.[0] || '/logo.png',
    };
    addToCart(cartItem);
    setSelectedProductForModal(null);
  };

  // 10. Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Unauthenticated Gate view
  if (!authLoading && !currentUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-[#FAF7F2]">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E2D8] shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#C5A059]/40 flex items-center justify-center mx-auto mb-5 text-[#C5A059]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-stone-900 mb-2 font-normal">
            Client Authentication Required
          </h2>
          <p className="text-xs text-stone-600 font-sans font-light mb-6">
            Please sign in to access your personal Sunbloom Adorn dashboard, orders, and
            curated pieces.
          </p>
          <div className="space-y-3">
            <a
              href="/login?mode=login&redirect=/dashboard"
              className="block w-full py-3 px-4 rounded-xl bg-stone-900 text-amber-200 text-xs uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors shadow-2xs"
            >
              Sign In to Atelier
            </a>
            <a
              href="/login?mode=signup&redirect=/dashboard"
              className="block w-full py-3 px-4 rounded-xl border border-stone-300 text-stone-800 text-xs uppercase tracking-widest font-medium hover:bg-stone-50 transition-colors"
            >
              Create Client Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Filtered products calculation
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      !selectedCategory ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      p.categoryDetails?.slug === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const getCustomerFirstName = () => {
    if (!currentUser) return 'Client';
    if (currentUser.displayName) {
      const parts = currentUser.displayName.trim().split(/\s+/);
      if (parts.length > 1 && parts[0].replace(/[.,]/g, '').length <= 1) {
        return parts[1].replace(/[.,]/g, '') || 'Client';
      }
      return parts[0].replace(/[.,]/g, '') || 'Client';
    }
    if (currentUser.email) {
      const localPart = currentUser.email.split('@')[0].split('.')[0];
      return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
    return 'Client';
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex flex-col">
      {/* Main Layout: Left Sidebar + Right Dynamic Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 gap-6 lg:gap-8">
        {/* Mobile Navigation Trigger Strip */}
        <div className="md:hidden flex items-center justify-between py-2.5 px-4 bg-white border border-[#E8E2D8] rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-wider text-stone-800 cursor-pointer"
          >
            <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="font-serif capitalize text-sm font-semibold">{activeTab}</span>
          </button>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-medium font-sans">
            Client Atelier
          </span>
        </div>

        {/* Mobile Backdrop for Sidebar */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR NAVIGATION */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FAF7F2] border-r border-[#E8E2D8] p-6 flex flex-col justify-between transform transition-transform duration-300 md:static md:translate-x-0 md:w-60 lg:w-64 md:border md:rounded-3xl md:bg-white/80 md:shadow-xs ${
            mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            {/* Close button on mobile */}
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D8] md:hidden">
              <span className="font-serif font-bold text-stone-900">Navigation</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800"
              >
                ✕
              </button>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1.5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
                { id: 'products', label: 'Products', icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9' },
                { id: 'categories', label: 'Categories', icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z' },
                { id: 'cart', label: 'Cart', icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z' },
                { id: 'orders', label: 'Orders', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
                { id: 'track', label: 'Track Order', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75A1.125 1.125 0 0013.125 2.625H4.875A1.125 1.125 0 003.75 3.75v10.5' },
                { id: 'support', label: 'Support', icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z' },
                { id: 'settings', label: 'Settings', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setMobileNavOpen(false);
                      if (tab.id === 'products') setSelectedCategory(null);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-[0.14em] font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-900 text-amber-200 font-semibold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#C5A059]' : 'text-stone-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d={tab.icon}
                      />
                    </svg>
                    <span>{tab.label}</span>
                    {tab.id === 'cart' && cartItemsState.length > 0 && (
                      <span className="ml-auto bg-[#C5A059] text-stone-900 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                        {cartItemsState.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Logout Button */}
          <div className="pt-6 border-t border-[#E8E2D8] mt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-[0.14em] font-medium text-stone-500 hover:text-red-600 hover:bg-red-50/60 transition-all cursor-pointer"
            >
              <svg
                className="w-4 h-4 text-stone-400 group-hover:text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* RIGHT DYNAMIC CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {/* ============================================================ */}
          {/* VIEW 1: DASHBOARD (Home summary, Recent, Top Selling, Cats) */}
          {/* ============================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              {/* Dashboard Welcome Area */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-md">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1.5">
                  Dashboard
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-white mb-2">
                  Welcome back, {getCustomerFirstName()}
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xl leading-relaxed mb-5">
                  Explore the latest pieces, manage your orders, and discover new arrivals.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('products');
                      setSelectedCategory(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#C5A059] text-stone-950 text-xs uppercase tracking-widest font-semibold hover:bg-amber-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    Shop Products
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="px-5 py-2.5 rounded-xl border border-stone-600 bg-stone-800/60 text-stone-200 text-xs uppercase tracking-widest font-medium hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    View Orders
                  </button>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('cart')}
                  className="bg-white hover:bg-stone-50 transition-all rounded-2xl p-4 sm:p-5 border border-[#E8E2D8] shadow-xs flex items-center gap-4 text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-wider block font-medium">Bag Items</span>
                    <span className="font-serif text-xl sm:text-2xl font-normal text-stone-900">{cartItemsState.length}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="bg-white hover:bg-stone-50 transition-all rounded-2xl p-4 sm:p-5 border border-[#E8E2D8] shadow-xs flex items-center gap-4 text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-wider block font-medium">Total Orders</span>
                    <span className="font-serif text-xl sm:text-2xl font-normal text-stone-900">{orders.length}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className="bg-white hover:bg-stone-50 transition-all rounded-2xl p-4 sm:p-5 border border-[#E8E2D8] shadow-xs flex items-center gap-4 text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75A1.125 1.125 0 0013.125 2.625H4.875A1.125 1.125 0 003.75 3.75v10.5" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-wider block font-medium">Live Shipments</span>
                    <span className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
                      {orders.filter((o) => o.status === 'SHIPPED' || o.status === 'PROCESSING').length}
                    </span>
                  </div>
                </button>
              </div>

              {/* 1. RECENTLY ADDED ITEMS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold block">Fresh Arrivals</span>
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">Recently Added Items</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="text-xs uppercase tracking-wider text-[#C5A059] hover:text-stone-900 transition-colors font-medium cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {(recentProducts.length > 0 ? recentProducts : products.slice(0, 3)).map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-stone-100">
                        <img
                          src={prod.images?.[0] || '/logo.png'}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-medium block mb-1">
                            {prod.categoryDetails?.name || prod.category || 'Atelier'}
                          </span>
                          <h3 className="font-serif text-sm font-normal text-stone-900 line-clamp-1 mb-1">
                            {prod.name}
                          </h3>
                          <p className="text-xs font-semibold text-stone-900">₹{prod.basePrice}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCartClick(prod)}
                          className="mt-3 w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. TOP SELLING ITEMS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold block">Client Favorites</span>
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">Top Selling Creations</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="text-xs uppercase tracking-wider text-[#C5A059] hover:text-stone-900 transition-colors font-medium cursor-pointer"
                  >
                    Explore Shop →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {(topSellingProducts.length > 0 ? topSellingProducts : products.slice(0, 3)).map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-stone-100">
                        <img
                          src={prod.images?.[0] || '/logo.png'}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-stone-900/80 text-amber-200 text-[9px] uppercase tracking-wider backdrop-blur-xs">
                          Popular
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-medium block mb-1">
                            {prod.categoryDetails?.name || prod.category || 'Haute Jewellery'}
                          </span>
                          <h3 className="font-serif text-sm font-normal text-stone-900 line-clamp-1 mb-1">
                            {prod.name}
                          </h3>
                          <p className="text-xs font-semibold text-stone-900">₹{prod.basePrice}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCartClick(prod)}
                          className="mt-3 w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. CATEGORIES SUMMARY */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold block">Curated Collections</span>
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">Categories</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    className="text-xs uppercase tracking-wider text-[#C5A059] hover:text-stone-900 transition-colors font-medium cursor-pointer"
                  >
                    All Categories →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setActiveTab('products');
                      }}
                      className="group relative rounded-2xl overflow-hidden aspect-4/3 border border-[#E8E2D8] text-left p-4 flex flex-col justify-end shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <img
                        src={cat.image || '/logo.png'}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent"></div>
                      <div className="relative z-10 text-white">
                        <h4 className="font-serif text-base font-normal tracking-wide text-white group-hover:text-amber-200 transition-colors">
                          {cat.name}
                        </h4>
                        <span className="text-[9px] uppercase tracking-widest text-[#C5A059]">Explore</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: PRODUCTS CATALOG (Zero internal SKU/productNumber) */}
          {/* ============================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2D8]">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1">
                    The Complete Collection
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                    Product Catalog
                  </h1>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search by piece name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059] transition-all"
                  />
                  <svg
                    className="w-4 h-4 text-stone-400 absolute left-3 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === null
                      ? 'bg-stone-900 text-amber-200 shadow-2xs'
                      : 'bg-white border border-[#E8E2D8] text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  All Pieces ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.slug
                        ? 'bg-stone-900 text-amber-200 shadow-2xs'
                        : 'bg-white border border-[#E8E2D8] text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E8E2D8] p-12 text-center">
                  <p className="text-sm text-stone-500 font-light mb-4">
                    No creations found matching your filter criteria.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                    className="px-5 py-2 rounded-xl bg-stone-900 text-amber-200 text-xs uppercase tracking-widest font-medium cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-stone-100">
                        <img
                          src={prod.images?.[0] || '/logo.png'}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-stone-700 text-[9px] uppercase tracking-wider backdrop-blur-xs font-medium">
                          {prod.variants?.length || 1} Variant
                          {prod.variants?.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-medium block mb-1">
                            {prod.categoryDetails?.name || prod.category}
                          </span>
                          <h3 className="font-serif text-sm font-normal text-stone-900 line-clamp-1 mb-1">
                            {prod.name}
                          </h3>
                          <p className="text-xs font-semibold text-stone-900">₹{prod.basePrice}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCartClick(prod)}
                          className="mt-3.5 w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: CATEGORIES BROWSER                                  */}
          {/* ============================================================ */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E8E2D8]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1">
                  Atelier Departments
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  Jewellery Categories
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const matchingCount = products.filter(
                    (p) =>
                      p.category?.toLowerCase() === cat.slug.toLowerCase() ||
                      p.categoryDetails?.slug === cat.slug
                  ).length;

                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-3xl border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                        <img
                          src={cat.image || '/logo.png'}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-serif text-xl font-normal text-stone-900">
                              {cat.name}
                            </h3>
                            <span className="text-[10px] uppercase tracking-wider font-medium text-[#C5A059] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#E8E2D8]">
                              {matchingCount} Piece{matchingCount === 1 ? '' : 's'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 font-light leading-relaxed mb-6">
                            {cat.description || 'Artisanal jewellery designed for lasting elegance.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.slug);
                            setActiveTab('products');
                          }}
                          className="w-full py-2.5 rounded-xl border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-amber-200 text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer"
                        >
                          Explore {cat.name}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: CART                                                */}
          {/* ============================================================ */}
          {activeTab === 'cart' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E8E2D8]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1">
                  Shopping Bag
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  Your Selected Pieces
                </h1>
              </div>

              {cartItemsState.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E8E2D8] p-12 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center mx-auto mb-4 text-[#C5A059]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-xl font-normal text-stone-900 mb-2">
                    Your bag is currently empty
                  </h2>
                  <p className="text-xs text-stone-500 font-light mb-6">
                    Add your favorite anti-tarnish jewelry pieces to your bag.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-6 py-3 rounded-xl bg-stone-900 text-amber-200 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 transition-all cursor-pointer"
                  >
                    Discover The Collection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Cart Items List */}
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E8E2D8] p-6 space-y-4 shadow-xs">
                    {cartItemsState.map((item) => (
                      <div
                        key={item.variantId}
                        className="flex items-center gap-4 py-4 border-b border-[#F0EAE1] last:border-0"
                      >
                        <img
                          src={item.productImage || '/logo.png'}
                          alt={item.productName}
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#E8E2D8] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm font-normal text-stone-900 truncate">
                            {item.productName}
                          </h4>
                          <p className="text-[11px] text-[#C5A059] font-medium mb-1">
                            {item.color} • {item.pattern}
                          </p>
                          <p className="text-xs font-semibold text-stone-900">
                            ₹{item.unitPrice}
                          </p>
                        </div>
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#E8E2D8] rounded-xl overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2.5 py-1 text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-medium text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.variantId)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Checkout Button */}
                  <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E8E2D8] p-6 space-y-4 shadow-xs sticky top-24">
                    <h3 className="font-serif text-lg font-normal text-stone-900 pb-3 border-b border-[#E8E2D8]">
                      Order Summary
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal</span>
                        <span className="font-medium text-stone-900">₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Estimated Shipping</span>
                        <span className="font-medium text-stone-900">
                          {cartTotal >= 999 ? 'FREE' : '₹50'}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-[#E8E2D8] flex justify-between text-sm font-semibold text-stone-900">
                        <span>Estimated Total</span>
                        <span className="font-serif text-base text-[#C5A059]">
                          ₹{cartTotal + (cartTotal >= 999 ? 0 : 50)}
                        </span>
                      </div>
                    </div>

                    <a
                      href="/payment"
                      className="block w-full text-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-900 text-xs font-semibold uppercase tracking-widest shadow-gold hover:opacity-95 transition-opacity"
                    >
                      Proceed to Checkout
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 5: CUSTOMER ORDERS (Scoped to Authenticated Customer) */}
          {/* ============================================================ */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E8E2D8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1">
                    Consignment Archive
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                    Your Orders
                  </h1>
                </div>
                <span className="text-xs text-stone-500 font-sans">
                  Account: {profile?.email || currentUser?.email}
                </span>
              </div>

              {loadingData ? (
                <div className="py-12 text-center text-xs text-stone-400 uppercase tracking-widest">
                  Loading consignment archive...
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E8E2D8] p-12 text-center max-w-md mx-auto">
                  <h3 className="font-serif text-xl font-normal text-stone-900 mb-2">
                    No orders placed yet
                  </h3>
                  <p className="text-xs text-stone-500 font-light mb-6">
                    When you place an order, your consignment details, live tracking status, and
                    receipts will appear here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="px-6 py-3 rounded-xl bg-stone-900 text-amber-200 text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 transition-all cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-2xl border border-[#E8E2D8] p-5 sm:p-6 shadow-xs space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0EAE1]">
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Order Reference</span>
                          <span className="font-serif text-sm sm:text-base font-normal text-stone-900">
                            {ord.orderNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Booking Date</span>
                          <span className="text-xs text-stone-700">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Total Amount</span>
                          <span className="text-xs font-semibold text-stone-900">
                            ₹{ord.totalAmount}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              ord.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'SHIPPED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-3">
                              {item.variant?.product?.images?.[0] && (
                                <img
                                  src={item.variant.product.images[0]}
                                  alt="Product"
                                  className="w-10 h-10 rounded-lg object-cover border border-[#E8E2D8]"
                                />
                              )}
                              <div>
                                <span className="font-medium text-stone-900">
                                  {item.variant?.product?.name || 'Jewellery Creation'}
                                </span>
                                <span className="text-[11px] text-stone-400 block">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            </div>
                            <span className="font-medium text-stone-900">₹{item.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tracking Section */}
                      <div className="pt-3 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2]/50 p-3 rounded-xl">
                        {ord.trackingNumber ? (
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-stone-700">
                              Tracking ID: <strong className="font-mono">{ord.trackingNumber}</strong> ({ord.trackingCarrier || 'Express'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-500 italic">
                            Tracking information will be available after shipment.
                          </span>
                        )}

                        {ord.trackingNumber && (
                          <button
                            type="button"
                            onClick={() => {
                              setTrackOrderNumber(ord.orderNumber);
                              setActiveTab('track');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-amber-200 hover:bg-stone-800 text-[11px] uppercase tracking-wider font-medium cursor-pointer"
                          >
                            Track Order →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 6: TRACK ORDER (Consignment status)                     */}
          {/* ============================================================ */}
          {activeTab === 'track' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center pb-4 border-b border-[#E8E2D8]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1">
                  Live Dispatch
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  Track Consignment
                </h1>
                <p className="text-xs text-stone-500 font-light mt-1">
                  Enter your order or consignment number to inspect courier tracking status.
                </p>
              </div>

              <form
                onSubmit={handleTrackLookup}
                className="bg-white rounded-3xl border border-[#E8E2D8] p-6 sm:p-8 space-y-4 shadow-xs"
              >
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Order / Consignment Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ORD-1726000000000"
                    value={trackOrderNumber}
                    onChange={(e) => setTrackOrderNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7F2]/40 border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Phone Number (Optional verification)
                  </label>
                  <input
                    type="tel"
                    placeholder="10 digit mobile"
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAF7F2]/40 border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-900 font-semibold text-xs uppercase tracking-widest shadow-gold hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {trackingLoading ? 'Locating Package...' : 'Locate Consignment'}
                </button>

                {trackingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {trackingError}
                  </div>
                )}
              </form>

              {/* Tracking Status Display */}
              {trackingResult && (
                <div className="bg-white rounded-3xl border border-[#E8E2D8] p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Consignment</span>
                      <span className="font-serif text-lg font-normal text-stone-900">
                        {trackingResult.orderNumber}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C5A059]/40 text-[#C5A059] text-xs font-semibold uppercase tracking-wider">
                      {trackingResult.status}
                    </span>
                  </div>

                  {/* Visual Status Steps */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] uppercase tracking-wider">
                    {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                      const statusMap: Record<string, number> = {
                        PENDING: 1,
                        CONFIRMED: 1,
                        PROCESSING: 2,
                        SHIPPED: 3,
                        DELIVERED: 4,
                      };
                      const currentLevel = statusMap[trackingResult.status] || 1;
                      const isComplete = currentLevel >= idx + 1;

                      return (
                        <div key={step} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full ${
                              isComplete ? 'bg-[#C5A059]' : 'bg-stone-200'
                            }`}
                          ></div>
                          <span className={isComplete ? 'font-semibold text-stone-900' : 'text-stone-400'}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Courier Details */}
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Carrier / Logistics:</span>
                      <span className="font-medium text-stone-900">
                        {trackingResult.trackingCarrier || 'Sunbloom White-Glove Dispatch'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Tracking Reference:</span>
                      <span className="font-mono font-medium text-stone-900">
                        {trackingResult.trackingNumber || 'Pending Assignment'}
                      </span>
                    </div>
                    {trackingResult.trackingUrl && (
                      <div className="pt-2 text-right">
                        <a
                          href={trackingResult.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C5A059] underline hover:text-stone-900"
                        >
                          Open Courier Tracking Portal →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 7: SUPPORT (Submit Customer Query)                     */}
          {/* ============================================================ */}
          {activeTab === 'support' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="pb-4 border-b border-[#E8E2D8]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1">
                  Client Care
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  Customer Support
                </h1>
                <p className="text-xs text-stone-500 font-light mt-1">
                  Have a question about an order, delivery, or custom piece? Raise a direct
                  support query.
                </p>
              </div>

              {supportSuccess ? (
                <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h3 className="font-serif text-xl font-normal text-stone-900">
                    Query Submitted Successfully
                  </h3>
                  <p className="text-xs text-stone-600 font-light max-w-md mx-auto leading-relaxed">
                    Thank you. Your support ticket reference has been logged. Our concierge team
                    will review your query and reply to your registered email and WhatsApp shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSupportSuccess(null)}
                    className="px-5 py-2.5 rounded-xl bg-stone-900 text-amber-200 text-xs uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Raise Another Query
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmitSupport}
                  className="bg-white rounded-3xl border border-[#E8E2D8] p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        defaultValue={profile?.name || currentUser?.displayName || ''}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E8E2D8] rounded-xl text-xs text-stone-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        defaultValue={profile?.email || currentUser?.email || ''}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E8E2D8] rounded-xl text-xs text-stone-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        defaultValue={profile?.phone || ''}
                        placeholder="Registered mobile"
                        disabled
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E8E2D8] rounded-xl text-xs text-stone-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        defaultValue={profile?.whatsappNumber || profile?.phone || ''}
                        placeholder="Registered WhatsApp"
                        disabled
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E8E2D8] rounded-xl text-xs text-stone-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Query Category *
                    </label>
                    <select
                      value={supportCategory}
                      onChange={(e) => setSupportCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Order Issue">Order Issue</option>
                      <option value="Payment Issue">Payment Issue</option>
                      <option value="Delivery Issue">Delivery Issue</option>
                      <option value="Product Issue">Product Issue</option>
                      <option value="Return/Refund">Return / Refund</option>
                      <option value="Other">Other Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please provide details regarding your query or order..."
                      value={supportDescription}
                      onChange={(e) => setSupportDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    ></textarea>
                  </div>

                  {supportError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      {supportError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={supportSubmitting}
                    className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {supportSubmitting ? 'Recording Ticket...' : 'Submit Support Query'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 8: SETTINGS (Customer Information Management)          */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="pb-4 border-b border-[#E8E2D8]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1">
                  Profile & Address Book
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                  Customer Settings
                </h1>
                <p className="text-xs text-stone-500 font-light mt-1">
                  Manage your delivery address, mobile contacts, and WhatsApp notifications
                  profile.
                </p>
              </div>

              <form
                onSubmit={handleUpdateProfile}
                className="bg-white rounded-3xl border border-[#E8E2D8] p-6 sm:p-8 space-y-4 shadow-xs"
              >
                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Email Address (Firebase Identity)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || currentUser?.email || ''}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-[#E8E2D8] rounded-xl text-xs text-stone-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10 digit mobile"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      placeholder="10 digit WhatsApp number"
                      value={profileWhatsapp}
                      onChange={(e) => setProfileWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Shipping Address
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    placeholder="Street address, house/flat number, landmark..."
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                  ></textarea>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={profileState}
                      onChange={(e) => setProfileState(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      placeholder="6 digits"
                      value={profilePincode}
                      onChange={(e) => setProfilePincode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 mt-4"
                >
                  {profileSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Quick Variant Selection Modal */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E2D8] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D8]">
              <h3 className="font-serif text-lg font-normal text-stone-900">Choose Variant</h3>
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="text-stone-400 hover:text-stone-800 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 font-medium">
              {selectedProductForModal.name}
            </p>

            <div className="space-y-2">
              {selectedProductForModal.variants.map((v) => (
                <label
                  key={v.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    chosenVariantId === v.id
                      ? 'border-[#C5A059] bg-[#C5A059]/10'
                      : 'border-[#E8E2D8] hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="variantChoice"
                      value={v.id}
                      checked={chosenVariantId === v.id}
                      onChange={() => setChosenVariantId(v.id)}
                      className="accent-[#C5A059]"
                    />
                    <span className="text-xs font-medium text-stone-800">
                      {v.color || 'Standard'} • {v.pattern || 'Classic'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-stone-900">
                    ₹{selectedProductForModal.basePrice + (v.additionalPrice || 0)}
                  </span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={confirmModalAddToCart}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 text-xs font-semibold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Add to Bag
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
