// src/pages/Dashboard.tsx
// Sunbloom Adorn — Main Ecommerce Storefront (Public Dashboard)
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '@nanostores/react';
import { $cartItems, addToCart } from '../stores/cartStore';
import {
  getProductsApi,
  getCategoriesApi,
  getRecentProductsApi,
  getTopSellingProductsApi,
  getCustomerOrdersApi,
} from '../lib/api';
import type { Product, Category, Order, CartItem, Variant } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { CategoryCard } from '../components/products/CategoryCard';
import { HeroBannerSlider } from '../components/HeroBannerSlider';
import {
  ShoppingBag,
  Package,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  Truck,
  MessageCircle,
  Phone,
  X,
  User as UserIcon,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, profile, token } = useAuth();
  const cartItems = useStore($cartItems);
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Variant Modal
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [chosenVariantId, setChosenVariantId] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes, recentRes, topRes] = await Promise.all([
          getProductsApi().catch(() => ({ products: [] })),
          getCategoriesApi().catch(() => ({ categories: [] })),
          getRecentProductsApi(8).catch(() => ({ products: [] })),
          getTopSellingProductsApi(8).catch(() => ({ products: [] })),
        ]);

        if (isMounted) {
          const activeProds = (prodRes.products || []).filter((p: Product) => p.isActive);
          setProducts(activeProds);
          setCategories(catRes.categories || []);

          // Real recent products from backend or fallback to latest sorted activeProds
          const recent = (recentRes.products || []).filter((p: Product) => p.isActive);
          if (recent.length > 0) {
            setRecentProducts(recent);
          } else {
            const sortedByDate = [...activeProds].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentProducts(sortedByDate.slice(0, 4));
          }

          // Real top selling / popular products from backend or fallback to activeProds
          const top = (topRes.products || []).filter((p: Product) => p.isActive);
          if (top.length > 0) {
            setTopSellingProducts(top);
          } else {
            setTopSellingProducts(activeProds.slice(0, 4));
          }

          if (token) {
            const ordRes = await getCustomerOrdersApi(token).catch(() => ({ orders: [] }));
            if (isMounted) {
              setOrders(ordRes.orders || []);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load storefront data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [token]);


  const getCustomerFirstName = () => {
    if (profile?.name) {
      const parts = profile.name.trim().split(/\s+/);
      if (parts.length > 1 && parts[0].replace(/[.,]/g, '').length <= 1) {
        return parts[1].replace(/[.,]/g, '') || 'Client';
      }
      return parts[0].replace(/[.,]/g, '') || 'Client';
    }
    if (user?.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length > 1 && parts[0].replace(/[.,]/g, '').length <= 1) {
        return parts[1].replace(/[.,]/g, '') || 'Client';
      }
      return parts[0].replace(/[.,]/g, '') || 'Client';
    }
    if (user?.email) {
      const localPart = user.email.split('@')[0].split('.')[0];
      return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
    return 'Client';
  };

  const isPatternValueValid = (p?: string | null): p is string => {
    if (!p) return false;
    const trimmed = p.trim();
    if (!trimmed) return false;
    return !/^(null|undefined|none|n\/a)$/i.test(trimmed);
  };

  const handleAddToCart = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      // Default single piece
      const item: CartItem = {
        productId: product.id,
        variantId: product.id,
        productName: product.name,
        productSlug: product.slug || product.id,
        color: 'Standard',
        pattern: '',
        quantity: 1,
        unitPrice: product.basePrice,
        totalPrice: product.basePrice,
        productImage: product.variants?.[0]?.images?.[0] || product.images?.[0] || '/logo.png',
      };
      addToCart(item);
      return;
    }

    if (product.variants.length === 1) {
      const v = product.variants[0];
      const cleanPattern = isPatternValueValid(v.pattern) ? v.pattern.trim() : '';
      const item: CartItem = {
        productId: product.id,
        variantId: v.id,
        productName: product.name,
        productSlug: product.slug || product.id,
        color: v.color || 'Standard',
        pattern: cleanPattern,
        quantity: 1,
        unitPrice: product.basePrice + (v.additionalPrice || 0),
        totalPrice: product.basePrice + (v.additionalPrice || 0),
        productImage: v.images?.[0] || product.images?.[0] || '/logo.png',
      };
      addToCart(item);
    } else {
      setSelectedProductForModal(product);
      setChosenVariantId(product.variants[0].id);
    }
  };

  const confirmModalAddToCart = () => {
    if (!selectedProductForModal) return;
    const v = selectedProductForModal.variants.find((item) => item.id === chosenVariantId);
    if (!v) return;

    const cleanPattern = isPatternValueValid(v.pattern) ? v.pattern.trim() : '';
    const item: CartItem = {
      productId: selectedProductForModal.id,
      variantId: v.id,
      productName: selectedProductForModal.name,
      productSlug: selectedProductForModal.slug || selectedProductForModal.id,
      color: v.color || 'Standard',
      pattern: cleanPattern,
      quantity: 1,
      unitPrice: selectedProductForModal.basePrice + (v.additionalPrice || 0),
      totalPrice: selectedProductForModal.basePrice + (v.additionalPrice || 0),
      productImage: v.images?.[0] || selectedProductForModal.images?.[0] || '/logo.png',
    };
    addToCart(item);
    setSelectedProductForModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FCF9F5]">
        <div className="w-12 h-12 rounded-full border-2 border-[#E69CB0]/40 border-t-[#8B2E4B] animate-spin mb-4"></div>
        <p className="font-heading text-sm text-[#8B2E4B] uppercase tracking-widest">
          Opening Sunbloom Adorn Storefront…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FCF9F5] text-[#2A1C19]">
      
      {/* ============================================================ */}
      {/* AUTHENTICATED PATRON GREETING CHIP (Only shown when logged in) */}
      {/* ============================================================ */}
      {user && (
        <div className="bg-gradient-to-r from-[#FAF0F4] via-[#FFF9FA] to-[#FAF5EB] border-b border-[#DFC598]/40 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#7A223B]">
              <Sparkles className="w-3.5 h-3.5 text-[#DFC598]" />
              <span>
                Welcome back, <strong className="font-semibold text-[#2A1C19]">{getCustomerFirstName()}</strong>
              </span>
              <span className="hidden sm:inline text-[#A8928D]">• Atelier Patron</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-medium">
              <Link
                to="/orders"
                className="text-[#5E4742] hover:text-[#7A223B] transition-colors flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>Orders ({orders.length})</span>
              </Link>
              <Link
                to="/cart"
                className="text-[#5E4742] hover:text-[#7A223B] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>Bag ({cartItems.length})</span>
              </Link>
              <Link
                to="/settings"
                className="text-[#7A223B] hover:text-[#5E182C] underline decoration-[#DFC598] underline-offset-2 transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. HERO / BANNER SLIDER                                      */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:py-8 lg:py-10 border-b border-[#E8DCCF] bg-paint-blend">
        {/* Soft Ambient Blush Pink + Champagne Gold Glow Accents */}
        <div className="absolute top-0 right-0 w-[380px] lg:w-[560px] h-[380px] lg:h-[560px] rounded-full bg-radial from-[#F9D5DF]/30 via-[#FDF2F5]/20 to-transparent blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full bg-radial from-[#F2E5CC]/35 via-[#FAF5EB]/20 to-transparent blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <HeroBannerSlider />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. MOST POPULAR                                              */}
      {/* ============================================================ */}
      {topSellingProducts.length > 0 && (
        <section className="py-12 sm:py-16 bg-[#FAF6F0] border-b border-[#E8DCCF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#7A223B] font-medium block mb-1">
                  Cherished by Connoisseurs
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#2A1C19] font-normal">
                  Most <span className="font-serif italic text-rose-gold-gradient">Popular</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#755B55] font-light mt-1 max-w-md">
                  Signature designs cherished by our patrons for effortless everyday grace and thoughtful gifting.
                </p>
              </div>

              <Link
                to="/products"
                className="text-xs uppercase tracking-widest font-medium text-[#7A223B] hover:text-[#5E182C] transition-colors inline-flex items-center gap-1.5 shrink-0 group"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFC598] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Responsive Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
              {topSellingProducts.map((product) => (
                <ProductCard key={`popular-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 3. RECENTLY ADDED                                            */}
      {/* ============================================================ */}
      {recentProducts.length > 0 && (
        <section className="py-12 sm:py-16 bg-white border-b border-[#E8DCCF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#7A223B] font-medium block mb-1">
                  Fresh from the Atelier
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#2A1C19] font-normal">
                  Recently <span className="font-serif italic text-rose-gold-gradient">Added</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#755B55] font-light mt-1 max-w-md">
                  The latest handcrafted creations fresh off our Coimbatore &amp; Coonoor atelier benches.
                </p>
              </div>

              <Link
                to="/products"
                className="text-xs uppercase tracking-widest font-medium text-[#7A223B] hover:text-[#5E182C] transition-colors inline-flex items-center gap-1.5 shrink-0 group"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFC598] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Responsive Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
              {recentProducts.map((product) => (
                <ProductCard key={`recent-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 4. ATELIER CATEGORIES                                        */}
      {/* ============================================================ */}
      {categories.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-[#FCF9F5] border-b border-[#E8DCCF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#7A223B] font-medium block mb-1">
                  Curated Universes
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#2A1C19] font-normal">
                  Shop by <span className="font-serif italic text-rose-gold-gradient">Category</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#755B55] font-light mt-1 max-w-md">
                  Explore our signature realms, each handcrafted to bring effortless brilliance to your daily light.
                </p>
              </div>

              <Link
                to="/categories"
                className="text-xs uppercase tracking-widest font-medium text-[#7A223B] hover:text-[#5E182C] transition-colors inline-flex items-center gap-1.5 shrink-0 group"
              >
                <span>All Categories</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFC598] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 5. ATELIER CRAFTSMANSHIP PILLARS (Reassurance)               */}
      {/* ============================================================ */}
      <section className="py-12 sm:py-16 bg-[#FAF6F0] border-b border-[#E8DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#7A223B] font-semibold block">
              Atelier Standards
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#2A1C19] font-normal">
              Enduring <span className="font-serif italic text-rose-gold-gradient">Excellence</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#755B55] font-light">
              Every creation is forged to withstand daily wear while maintaining radiant brilliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white border border-[#E8DCCF] p-5 sm:p-6 rounded-2xl text-center space-y-2.5 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FCE7EC] border border-[#DFC598]/50 flex items-center justify-center text-[#7A223B] mx-auto">
                <Sparkles className="w-4.5 h-4.5 text-[#DFC598]" />
              </div>
              <h4 className="font-heading text-sm sm:text-base font-semibold text-[#2A1C19]">18K PVD Waterproof Gold</h4>
              <p className="text-xs text-[#755B55] leading-relaxed font-light">
                Physical vapor deposition coating resisting perfumes, moisture, and daily wear without tarnishing.
              </p>
            </div>

            <div className="bg-white border border-[#E8DCCF] p-5 sm:p-6 rounded-2xl text-center space-y-2.5 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EB] border border-[#DFC598]/50 flex items-center justify-center text-[#DFC598] mx-auto">
                <Award className="w-4.5 h-4.5 text-[#7A223B]" />
              </div>
              <h4 className="font-heading text-sm sm:text-base font-semibold text-[#2A1C19]">Korean Minimalist Craft</h4>
              <p className="text-xs text-[#755B55] leading-relaxed font-light">
                Featherlight silhouettes balancing modern delicate curves with lasting structural durability.
              </p>
            </div>

            <div className="bg-white border border-[#E8DCCF] p-5 sm:p-6 rounded-2xl text-center space-y-2.5 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FCE7EC] border border-[#DFC598]/50 flex items-center justify-center text-[#7A223B] mx-auto">
                <ShieldCheck className="w-4.5 h-4.5 text-[#DFC598]" />
              </div>
              <h4 className="font-heading text-sm sm:text-base font-semibold text-[#2A1C19]">Hypoallergenic 316L</h4>
              <p className="text-xs text-[#755B55] leading-relaxed font-light">
                Surgical-grade stainless steel base ensuring 100% skin safety, nickel-free and lead-free comfort.
              </p>
            </div>

            <div className="bg-white border border-[#E8DCCF] p-5 sm:p-6 rounded-2xl text-center space-y-2.5 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FAF5EB] border border-[#DFC598]/50 flex items-center justify-center text-[#DFC598] mx-auto">
                <Truck className="w-4.5 h-4.5 text-[#7A223B]" />
              </div>
              <h4 className="font-heading text-sm sm:text-base font-semibold text-[#2A1C19]">Pan-India Insured Dispatch</h4>
              <p className="text-xs text-[#755B55] leading-relaxed font-light">
                Tamper-evident luxury packaging and insured courier tracking directly to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CONCIERGE ASSISTANCE (WhatsApp & Phone)                   */}
      {/* ============================================================ */}
      <section className="py-12 sm:py-16 bg-white border-b border-[#E8DCCF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.24em] text-[#7A223B] font-semibold block">
            Atelier Concierge
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl text-[#2A1C19] font-normal">
            Need Guidance on a <span className="font-serif italic text-rose-gold-gradient">Creation?</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#755B55] font-light max-w-lg mx-auto">
            Our jewellery consultants in Coonoor and Coimbatore are available to answer your sizing questions, styling enquiries, or bespoke requests.
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/919789325964?text=Hello%20Sunbloom%20Adorn%20Team%2C%20I%20would%20like%20to%20enquire%20about%20your%20jewellery%20collection."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#20ba5a] transition-all shadow-2xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Concierge</span>
            </a>
            <a
              href="tel:+919789325964"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-rose-primary text-xs uppercase tracking-wider font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#DFC598]" />
              <span>+91 97893 25964</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. QUICK VARIANT SELECTION MODAL                             */}
      {/* ============================================================ */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 bg-[#2A1C19]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8DCCF]/60">
              <h3 className="font-heading text-lg font-normal text-[#2A1C19]">
                Select Atelier Variant
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="text-[#A8928D] hover:text-[#2A1C19] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={selectedProductForModal.images?.[0] || '/logo.png'}
                alt={selectedProductForModal.name}
                className="w-16 h-16 rounded-xl object-cover bg-[#FAF6F0] border border-[#E8DCCF]"
              />
              <div>
                <h4 className="font-heading text-sm font-normal text-[#2A1C19]">
                  {selectedProductForModal.name}
                </h4>
                <p className="text-xs text-[#7A223B] font-semibold mt-0.5">
                  Base Price: ₹{selectedProductForModal.basePrice}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540]">
                Available Options
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedProductForModal.variants.map((v) => {
                  const isSelected = chosenVariantId === v.id;
                  const price = selectedProductForModal.basePrice + (v.additionalPrice || 0);
                  const cleanPattern = isPatternValueValid(v.pattern) ? v.pattern.trim() : null;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setChosenVariantId(v.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7A223B] bg-[#FDF2F5] shadow-xs'
                          : 'border-[#E8DCCF] hover:border-[#DFC598] bg-[#FAF6F0]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#7A223B] bg-[#7A223B]' : 'border-[#A8928D]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-xs font-medium text-[#2A1C19]">
                          {v.color || 'Standard'} {cleanPattern ? `• ${cleanPattern}` : ''}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#7A223B]">₹{price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="btn-ivory-secondary flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#5C4540] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModalAddToCart}
                className="btn-rose-primary flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest cursor-pointer shadow-xs"
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
