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
import {
  ShoppingBag,
  Package,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Truck,
  MessageCircle,
  Phone,
  Gem,
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

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  // Products eligible for Hero Slider (strictly real products with images)
  const heroProducts = useMemo(() => {
    const list = topSellingProducts.length > 0 ? topSellingProducts : products;
    return list.filter((p) => p.isActive && p.images && p.images.length > 0).slice(0, 5);
  }, [topSellingProducts, products]);

  // Auto-play Slider effect
  useEffect(() => {
    if (heroProducts.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroProducts.length, isPaused]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroProducts.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroProducts.length);
  };

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
      {/* 1. HERO / SIGNATURE PRODUCTS SLIDER                          */}
      {/* ============================================================ */}
      <section
        className="relative overflow-hidden pt-6 pb-12 sm:py-12 lg:py-16 border-b border-[#E8DCCF] bg-paint-blend"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft Ambient Blush Pink + Champagne Gold Glow Accents */}
        <div className="absolute top-0 right-0 w-[380px] lg:w-[560px] h-[380px] lg:h-[560px] rounded-full bg-radial from-[#F9D5DF]/30 via-[#FDF2F5]/20 to-transparent blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full bg-radial from-[#F2E5CC]/35 via-[#FAF5EB]/20 to-transparent blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {heroProducts.length > 0 ? (
            <div className="relative">
              {/* Active Hero Slide */}
              {heroProducts.map((prod, idx) => {
                if (idx !== currentSlide) return null;
                const defaultVar =
                  prod.variants?.find((v) => v.isAvailable && Array.isArray(v.images) && v.images.length > 0) ||
                  prod.variants?.find((v) => Array.isArray(v.images) && v.images.length > 0) ||
                  prod.variants?.[0];
                const primaryImage =
                  defaultVar?.images?.[0] ||
                  prod.images?.[0] ||
                  (prod.variants || []).flatMap((v) => (Array.isArray(v.images) ? v.images : [])).filter(Boolean)[0] ||
                  (prod as any).imageUrl ||
                  '/logo.png';
                const formattedPrice = prod.basePrice?.toLocaleString('en-IN') || '0';

                return (
                  <div
                    key={prod.id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-fade-in"
                  >
                    {/* LEFT COLUMN: Narrative & Action */}
                    <div className="lg:col-span-6 xl:col-span-6 text-center lg:text-left space-y-4 sm:space-y-5">
                      
                      {/* Brand & Collection Eyebrow */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.24em] text-[#7A223B] font-medium bg-[#FFF9FA] border border-[#DFC598]/60 shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-[#DFC598]" />
                          <span>Signature Creation</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[#A88136] font-medium">
                          {(prod as any).categoryDetails?.name || prod.category || 'Fine Jewellery'}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#2A1C19] font-normal tracking-tight leading-tight">
                        {prod.name}
                      </h1>

                      {/* Description or Craftsmanship Highlight */}
                      <p className="text-xs sm:text-sm text-[#5E4742] font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                        {prod.description ||
                          'Handcrafted anti-tarnish fine jewellery rooted in Korean minimalist elegance. Forged in surgical 316L steel with waterproof 18K PVD gold.'}
                      </p>

                      {/* Price Tag */}
                      <div className="flex items-baseline justify-center lg:justify-start gap-2 pt-1">
                        <span className="text-[11px] uppercase tracking-wider text-[#755B55]">Price:</span>
                        <span className="font-heading text-xl sm:text-2xl font-semibold text-[#7A223B]">
                          ₹{formattedPrice}
                        </span>
                        <span className="text-[10px] text-[#A88136] font-medium bg-[#FAF5EB] px-2 py-0.5 rounded-full border border-[#DFC598]/40">
                          {prod.variants && prod.variants.length > 1
                            ? `${prod.variants.length} Available Finishes`
                            : 'In Stock'}
                        </span>
                      </div>

                      {/* Action Buttons: Shop Now & Add to Bag */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                        <Link
                          to={`/products/${prod.slug || prod.id}`}
                          className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl btn-rose-primary text-xs uppercase tracking-[0.16em] font-medium shadow-xs transition-all duration-300"
                        >
                          <span>Discover Piece</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#DFC598] group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(prod)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl btn-ivory-secondary text-xs uppercase tracking-[0.14em] font-medium transition-all shadow-2xs cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#7A223B]" />
                          <span>Add to Bag</span>
                        </button>
                      </div>

                      {/* Atelier Standards Guarantee */}
                      <div className="pt-3 border-t border-[#E8DCCF]/80 flex flex-wrap items-center justify-center lg:justify-start gap-3.5 sm:gap-5 text-[11px] text-[#755B55]">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#DFC598]" />
                          <span>18K PVD Waterproof Gold</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#DFC598]" />
                          <span>Pure 316L Stainless Steel</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#DFC598]" />
                          <span>Anti-Tarnish Lustre</span>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Large Framed Product Showcase */}
                    <div className="lg:col-span-6 xl:col-span-6 flex justify-center">
                      <div className="relative w-full max-w-[420px] lg:max-w-[460px]">
                        
                        {/* Decorative Champagne Outline Frame */}
                        <div className="absolute -inset-2.5 sm:-inset-3 rounded-[32px] border border-[#DFC598]/40 pointer-events-none -z-0"></div>

                        {/* Primary Image Card */}
                        <div className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white border border-[#E8DCCF] shadow-md group">
                          
                          {/* Subtle Top Atelier Tag */}
                          <div className="absolute top-3.5 left-3.5 z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-[#FFF9FA]/95 text-[#7A223B] border border-[#DFC598]/50 shadow-2xs backdrop-blur-xs">
                              <Gem className="w-3 h-3 text-[#DFC598]" />
                              <span>Featured Selection</span>
                            </span>
                          </div>

                          {/* Image */}
                          <Link
                            to={`/products/${prod.slug || prod.id}`}
                            className="aspect-4/5 overflow-hidden bg-[#FAF4EF] flex items-center justify-center block"
                          >
                            <img
                              src={primaryImage}
                              alt={prod.name}
                              className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
                              loading="eager"
                              decoding="async"
                            />
                          </Link>

                          {/* Clean Bottom Overlay Card */}
                          <div className="p-4 sm:p-4.5 bg-white/95 backdrop-blur-xs border-t border-[#F4ECE5] flex items-center justify-between">
                            <div className="min-w-0 pr-3">
                              <span className="text-[10px] uppercase tracking-widest text-[#7A223B] font-medium block">
                                Fine Jewellery Atelier
                              </span>
                              <h3 className="font-heading text-sm sm:text-base font-normal text-[#2A1C19] truncate">
                                {prod.name}
                              </h3>
                              <p className="text-xs text-[#755B55] mt-0.5 font-light">
                                ₹{formattedPrice} • Pan-India Insured Dispatch
                              </p>
                            </div>

                            <Link
                              to={`/products/${prod.slug || prod.id}`}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-xl btn-rose-primary transition-colors shadow-2xs shrink-0"
                              title="View details"
                            >
                              <ArrowRight className="w-4 h-4 text-[#DFC598]" />
                            </Link>
                          </div>

                        </div>

                        {/* Floating Aesthetic Corner Pill */}
                        <div className="hidden sm:flex absolute -bottom-2.5 -left-2.5 bg-[#FFF9FA] border border-[#DFC598]/60 px-3 py-1 rounded-full shadow-sm items-center gap-2 text-[10px] uppercase tracking-widest text-[#7A223B] font-medium z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DFC598]"></span>
                          <span>Korean Minimalist Atelier</span>
                        </div>

                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Slider Controls: Arrows & Dots (Only shown if more than 1 product) */}
              {heroProducts.length > 1 && (
                <div className="mt-8 flex items-center justify-between max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="p-2 rounded-full bg-white border border-[#E8DCCF] text-[#7A223B] hover:border-[#DFC598] hover:bg-[#FCE7EC] transition-all cursor-pointer shadow-2xs"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {heroProducts.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentSlide(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          i === currentSlide
                            ? 'w-7 bg-[#7A223B]'
                            : 'w-2 bg-[#DFC598]/60 hover:bg-[#DFC598]'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="p-2 rounded-full bg-white border border-[#E8DCCF] text-[#7A223B] hover:border-[#DFC598] hover:bg-[#FCE7EC] transition-all cursor-pointer shadow-2xs"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Graceful Empty State (Real data only, no mock products) */
            <div className="text-center py-12 sm:py-16 max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF9FA] border border-[#DFC598]/60 flex items-center justify-center mx-auto text-[#7A223B] shadow-2xs">
                <Sparkles className="w-7 h-7 text-[#DFC598]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#7A223B] font-medium block">
                Haute Atelier
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-normal text-[#2A1C19]">
                Welcome to <span className="font-serif italic text-rose-gold-gradient">Sunbloom Adorn</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#5E4742] font-light leading-relaxed">
                Our bespoke jewellery creations are being handcrafted in our Tamil Nadu ateliers. New arrivals will appear here shortly.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://wa.me/919789325964?text=Hello%20Sunbloom%20Adorn%20Team%2C%20I%20would%20like%20to%20enquire%20about%20your%20jewellery%20collection."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#20ba5a] transition-all shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire on WhatsApp</span>
                </a>
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-ivory-secondary text-xs uppercase tracking-wider font-medium shadow-2xs"
                >
                  <span>Browse Categories</span>
                </Link>
              </div>
            </div>
          )}
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
