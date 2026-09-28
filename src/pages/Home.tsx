// src/pages/Home.tsx
// Sunbloom Adorn — Master Page Redesign (Static, Premium, Luxury Jewellery Boutique UI)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProductCard } from '../components/products/ProductCard';
import { CategoryCard } from '../components/products/CategoryCard';
import { getProductsApi, getCategoriesApi } from '../lib/api';
import type { Product, Category } from '../types';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Truck,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Gem,
  Clock,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Existing Products & Categories from Real Backend APIs
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProductsApi().catch(() => ({ products: [] })),
          getCategoriesApi().catch(() => ({ categories: [] })),
        ]);

        if (isMounted) {
          const apiProducts = prodRes.products?.filter((p) => p.isActive) || [];
          const apiCategories = catRes.categories || [];
          setProducts(apiProducts);
          setCategories(apiCategories);
        }
      } catch (e) {
        console.error('Home data load error:', e);
        if (isMounted) {
          setProducts([]);
          setCategories([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Distinct Product Journey Slices
  // 1. Recently Added (Ordered by latest creation)
  const recentlyAdded = React.useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [products]);

  // 2. Most Popular (Curated highlight slice)
  const mostPopular = React.useMemo(() => {
    if (products.length > 4) {
      return products.slice(4, 8);
    }
    return products.slice(0, 4);
  }, [products]);

  // Real Jewellery Image Hero Slider: Cycles automatically through real active products
  const heroSlides = React.useMemo(() => {
    const valid = products
      .map((p) => {
        const primaryImg =
          p.variants?.find((v) => v.isAvailable && Array.isArray(v.images) && v.images.length > 0)?.images?.[0] ||
          p.variants?.find((v) => Array.isArray(v.images) && v.images.length > 0)?.images?.[0] ||
          p.images?.[0];

        if (!primaryImg) return null;

        const defaultVariant = p.variants?.[0];
        const effectivePrice = defaultVariant
          ? p.basePrice + (defaultVariant.additionalPrice || 0)
          : p.basePrice;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug || p.id,
          category: p.category || 'Fine Jewellery',
          subtitle: '18K Gold Plated • Waterproof • Anti-Tarnish',
          tag: 'Signature Creation',
          price: effectivePrice,
          image: primaryImg,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    if (valid.length > 0) return valid;

    return [
      {
        id: 'default',
        name: 'Sunbloom Adorn Atelier',
        slug: '',
        category: 'Haute Jewellery',
        subtitle: 'Waterproof 18K Gold • Anti-Tarnish • 316L Steel',
        tag: 'Haute Atelier',
        price: 200,
        image: '/logo.png',
      },
    ];
  }, [products]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  // Automatic image sliding every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1 || isSliderPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isSliderPaused]);

  const activeSlide = heroSlides[currentSlideIndex] || heroSlides[0];

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  return (
    <div className="w-full bg-[#FCF9F5] text-[#2A1C19]">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: STATIC, PREMIUM PINK + GOLD LUXURY JEWELLERY EDITORIAL    */}
      {/* Left: Brand Eyebrow + Official Logo + Narrative + Dual Buttons            */}
      {/* Right: High-Resolution Signature Jewellery Showcase in Pink+Gold frame     */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: STATIC, PREMIUM PINK + GOLD LUXURY JEWELLERY EDITORIAL    */}
      {/* Left: Brand Eyebrow + Official Logo + Narrative + Dual Buttons            */}
      {/* Right: High-Resolution Signature Jewellery Showcase in Pink+Gold frame     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:py-14 lg:py-20 border-b border-[#E8DCCF] bg-paint-blend">
        {/* Soft Ambient Blush Pink + Champagne Gold Glow Accents */}
        <div className="absolute top-0 right-0 w-[420px] lg:w-[600px] h-[420px] lg:h-[600px] rounded-full bg-radial from-[#F9D5DF]/30 via-[#FDF2F5]/20 to-transparent blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-radial from-[#F2E5CC]/35 via-[#FAF5EB]/20 to-transparent blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Brand Narrative & Dual CTAs */}
            <div className="lg:col-span-6 xl:col-span-6 text-center lg:text-left space-y-5 sm:space-y-6">
              
              {/* Small Haute Atelier Eyebrow */}
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.26em] text-[#7A223B] font-medium bg-[#FFF9FA] border border-[#DFC598]/60 shadow-2xs backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#DFC598]" />
                  <span>Haute Jewellery Atelier</span>
                </span>
              </div>

              {/* Official Sunbloom Adorn Logo */}
              <div className="flex justify-center lg:justify-start">
                <img
                  src="/logo.png"
                  alt="Sunbloom Adorn — Haute Jewellery Atelier Official Logo"
                  className="w-auto h-auto max-w-[240px] sm:max-w-[290px] xl:max-w-[320px] object-contain transition-transform duration-300 hover:scale-[1.01]"
                  style={{ mixBlendMode: 'multiply' }}
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Brand Description */}
              <p className="text-xs sm:text-sm xl:text-base text-[#5E4742] font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                Where radiant sunlight meets bespoke adornment. Discover handcrafted anti-tarnish fine jewellery rooted in Korean minimalist elegance and lifelong lustre.
              </p>

              {/* Dual Action CTAs: Shop Collection & View Categories (Slim & Refined) */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/products"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl btn-rose-primary text-xs uppercase tracking-[0.16em] font-medium shadow-xs transition-all duration-300 active:scale-98"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#DFC598] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/categories"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl btn-ivory-secondary text-xs uppercase tracking-[0.14em] font-medium transition-all shadow-2xs"
                >
                  <span>View Categories</span>
                </Link>
              </div>

              {/* Reassurance Badges */}
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

            {/* RIGHT COLUMN: Interactive Signature Hero Product Image Slider */}
            <div
              className="lg:col-span-6 xl:col-span-6 flex justify-center"
              onMouseEnter={() => setIsSliderPaused(true)}
              onMouseLeave={() => setIsSliderPaused(false)}
            >
              <div className="relative w-full max-w-[420px] lg:max-w-[460px]">
                
                {/* Decorative Champagne Outline Frame */}
                <div className="absolute -inset-2.5 sm:-inset-3 rounded-[32px] border border-[#DFC598]/40 pointer-events-none -z-0"></div>

                {/* Primary Slider Card */}
                <div className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white border border-[#E8DCCF] shadow-md group">
                  
                  {/* Subtle Top Atelier Tag & Slide Counter */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold bg-[#FFF9FA]/95 text-[#7A223B] border border-[#DFC598]/50 shadow-2xs backdrop-blur-xs">
                      <Gem className="w-3 h-3 text-[#DFC598]" />
                      <span>{activeSlide.tag}</span>
                    </span>

                    {heroSlides.length > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/40 text-white backdrop-blur-xs">
                        {currentSlideIndex + 1} / {heroSlides.length}
                      </span>
                    )}
                  </div>

                  {/* High Quality Real Product Image */}
                  <div className="aspect-4/5 overflow-hidden bg-[#FAF4EF] flex items-center justify-center relative">
                    <img
                      key={activeSlide.id}
                      src={activeSlide.image}
                      alt={activeSlide.name}
                      className="w-full h-full object-cover object-center transition-all duration-700 ease-out animate-fadeIn"
                      loading="eager"
                      decoding="async"
                    />

                    {/* Navigation Controls: Prev & Next Buttons */}
                    {heroSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          aria-label="Previous slide"
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#7A223B] shadow-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer z-10"
                        >
                          <ArrowRight className="w-4 h-4 rotate-180 text-[#7A223B]" />
                        </button>

                        <button
                          type="button"
                          onClick={handleNextSlide}
                          aria-label="Next slide"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#7A223B] shadow-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer z-10"
                        >
                          <ArrowRight className="w-4 h-4 text-[#7A223B]" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Clean Bottom Overlay Card */}
                  <div className="p-4 sm:p-4.5 bg-white/95 backdrop-blur-xs border-t border-[#F4ECE5] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#7A223B] font-medium block">
                        {activeSlide.category}
                      </span>
                      <h3 className="font-heading text-base sm:text-lg font-normal text-[#2A1C19]">
                        {activeSlide.name}
                      </h3>
                      <p className="text-xs text-[#7A223B] font-medium mt-0.5">
                        ₹{activeSlide.price.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <Link
                      to={`/products/${activeSlide.slug}`}
                      className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl btn-rose-primary text-xs uppercase tracking-wider font-semibold transition-colors shadow-2xs gap-1.5"
                      title="View creation"
                      aria-label={`View ${activeSlide.name}`}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#DFC598]" />
                    </Link>
                  </div>

                  {/* Slide Indicators / Dots */}
                  {heroSlides.length > 1 && (
                    <div className="py-2 bg-white flex items-center justify-center gap-1.5 border-t border-[#FAF6F0]">
                      {heroSlides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlideIndex(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentSlideIndex === idx
                              ? 'w-6 bg-[#7A223B]'
                              : 'w-1.5 bg-[#E8DCCF] hover:bg-[#DFC598]'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                </div>

                {/* Floating Aesthetic Corner Pill */}
                <div className="hidden sm:flex absolute -bottom-2.5 -left-2.5 bg-[#FFF9FA] border border-[#DFC598]/60 px-3 py-1 rounded-full shadow-sm items-center gap-2 text-[10px] uppercase tracking-widest text-[#7A223B] font-medium z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFC598]"></span>
                  <span>Korean Minimalist Atelier</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SIGNATURE PINK + GOLD TWO-TONE LUXURY TILES BLOCK                       */}
      {/* Editorial Luxury Language: Blush Pink, Champagne Gold, Ivory, Soft Rose    */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 bg-[#FCF9F5] border-b border-[#E8DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Tile 1: Blush Pink Dominant */}
            <div className="bg-paint-tile-blush p-5 sm:p-6 rounded-2xl border border-[#DFC598]/40 shadow-2xs space-y-2.5 relative overflow-hidden group hover:border-[#7A223B]/40 transition-all">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-center text-[#7A223B]">
                <Sparkles className="w-4.5 h-4.5 text-[#DFC598]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#7A223B] font-semibold block">
                PVD 18K Gold
              </span>
              <h3 className="font-heading text-lg font-normal text-[#2A1C19]">
                Waterproof Lustre
              </h3>
              <p className="text-xs text-[#755B55] font-light leading-relaxed">
                Engineered for daily resilience against water, heat, and moisture without tarnishing.
              </p>
            </div>

            {/* Tile 2: Champagne Gold Dominant */}
            <div className="bg-paint-tile-gold p-5 sm:p-6 rounded-2xl border border-[#DFC598]/50 shadow-2xs space-y-2.5 relative overflow-hidden group hover:border-[#DFC598] transition-all">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#DFC598]/50 flex items-center justify-center text-[#DFC598]">
                <Gem className="w-4.5 h-4.5 text-[#7A223B]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#A88136] font-semibold block">
                Atelier Craft
              </span>
              <h3 className="font-heading text-lg font-normal text-[#2A1C19]">
                Korean Minimalism
              </h3>
              <p className="text-xs text-[#755B55] font-light leading-relaxed">
                Featherlight silhouettes and clean geometric curves designed for modern styling.
              </p>
            </div>

            {/* Tile 3: Ivory Pearl Dominant */}
            <div className="bg-paint-tile-ivory p-5 sm:p-6 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-2.5 relative overflow-hidden group hover:border-[#DFC598]/60 transition-all">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-center text-[#7A223B]">
                <ShieldCheck className="w-4.5 h-4.5 text-[#DFC598]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#7A223B] font-semibold block">
                Hypoallergenic
              </span>
              <h3 className="font-heading text-lg font-normal text-[#2A1C19]">
                316L Stainless Steel
              </h3>
              <p className="text-xs text-[#755B55] font-light leading-relaxed">
                Medical-grade foundation, 100% nickel-free and safe for the most delicate skin.
              </p>
            </div>

            {/* Tile 4: Soft Rose Pearl Dominant */}
            <div className="bg-paint-tile-blush p-5 sm:p-6 rounded-2xl border border-[#DFC598]/40 shadow-2xs space-y-2.5 relative overflow-hidden group hover:border-[#7A223B]/40 transition-all">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-center text-[#7A223B]">
                <Award className="w-4.5 h-4.5 text-[#DFC598]" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#7A223B] font-semibold block">
                Bespoke Quality
              </span>
              <h3 className="font-heading text-lg font-normal text-[#2A1C19]">
                Timeless Brilliance
              </h3>
              <p className="text-xs text-[#755B55] font-light leading-relaxed">
                Hand-inspected in our Tamil Nadu ateliers before insured dispatch across India.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MOST POPULAR: CHERISHED BY CONNOISSEURS                                */}
      {/* ========================================================================= */}
      {mostPopular.length > 0 && (
        <section className="py-14 sm:py-18 lg:py-22 bg-[#FAF6F0] border-t border-[#E8DCCF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#7A223B] font-medium block mb-1.5">
                  Cherished by Connoisseurs
                </span>
                <h2 className="font-heading text-2xl sm:text-4xl text-[#2A1C19] font-normal">
                  Most <span className="font-serif italic text-rose-gold-gradient">Popular</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#755B55] font-light mt-1 max-w-md">
                  Timeless designs most cherished by our discerning patrons for everyday grace and gifting.
                </p>
              </div>

              <Link
                to="/products"
                className="text-xs uppercase tracking-widest font-medium text-[#7A223B] hover:text-[#DFC598] transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Explore Popular</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFC598]" />
              </Link>
            </div>

            {/* Responsive Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
              {mostPopular.map((product) => (
                <ProductCard key={`popular-${product.id}`} product={product} />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. RECENTLY ADDED: FRESH FROM THE ATELIER                                 */}
      {/* ========================================================================= */}
      {recentlyAdded.length > 0 && (
        <section className="py-14 sm:py-18 lg:py-22 bg-white border-t border-[#E8DCCF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#7A223B] font-medium block mb-1.5">
                  Fresh from the Atelier
                </span>
                <h2 className="font-heading text-2xl sm:text-4xl text-[#2A1C19] font-normal">
                  Recently <span className="font-serif italic text-rose-gold-gradient">Added</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#755B55] font-light mt-1 max-w-md">
                  The latest handcrafted creations fresh off our Coimbatore &amp; Coonoor atelier benches.
                </p>
              </div>

              <Link
                to="/products"
                className="text-xs uppercase tracking-widest font-medium text-[#7A223B] hover:text-[#DFC598] transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFC598]" />
              </Link>
            </div>

            {/* Responsive Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
              {recentlyAdded.map((product) => (
                <ProductCard key={`recent-${product.id}`} product={product} />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. CATEGORIES SECTION: SHOP BY CATEGORY                                   */}
      {/* ========================================================================= */}
      {categories.length > 0 && (
        <section className="py-14 sm:py-18 lg:py-22 bg-[#FCF9F5] border-t border-[#E8DCCF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#7A223B] font-medium block mb-1.5">
                  Curated Universes
                </span>
                <h2 className="font-heading text-2xl sm:text-4xl text-[#2A1C19] font-normal">
                  Shop by <span className="font-serif italic text-rose-gold-gradient">Category</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#755B55] font-light mt-1 max-w-md">
                  Explore our signature realms, each handcrafted to bring effortless brilliance to your daily light.
                </p>
              </div>

              <Link
                to="/categories"
                className="text-xs uppercase tracking-widest font-medium text-[#7A223B] hover:text-[#5E152A] transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <span>View All Categories</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFC598]" />
              </Link>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>

          </div>
        </section>
      )}



      {/* ========================================================================= */}
      {/* 7. BRAND STORY / SHOP INFORMATION: THE SUNBLOOM ADORN STORY               */}
      {/* Authentic craftsmanship story & four atelier pillars                      */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-24 bg-[#FAF6F0] border-t border-[#E8DCCF] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#FCE7EC]/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#F2E5CC]/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Story Narrative */}
          <div className="max-w-3xl mx-auto text-center space-y-3.5 mb-14">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#7A223B] font-medium block">
              The Sunbloom Adorn Story
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl text-[#2A1C19] font-normal leading-tight">
              Craftsmanship <span className="font-serif italic text-rose-gold-gradient">Never Meant to Fade</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#5E4742] font-light leading-relaxed">
              Sunbloom Adorn was born from a desire for fine jewellery that defies time. Rooted in Korean minimalist aesthetics and refined in our Tamil Nadu ateliers, each creation balances delicate grace with lifelong durability.
            </p>
            <p className="text-xs sm:text-sm text-[#755B55] font-light leading-relaxed">
              Every ring, necklace, bracelet, and pendant is forged in surgical-grade 316L stainless steel, dipped in waterproof 18K gold via advanced Physical Vapor Deposition (PVD). The result is pure, hypoallergenic brilliance that withstands perfumes, moisture, and daily wear without tarnishing.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-medium text-[#7A223B] hover:text-[#5E152A] transition-colors border-b border-[#DFC598] pb-1"
              >
                <span>Read Full Atelier Heritage</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#DFC598]" />
              </Link>
            </div>
          </div>

          {/* 4 Craftsmanship & Atelier Standards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Pillar 1 */}
            <div className="bg-white border border-[#E8DCCF] p-6 rounded-2xl text-center space-y-3 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FCE7EC] border border-[#DFC598]/50 flex items-center justify-center text-[#7A223B] mx-auto">
                <Sparkles className="w-5 h-5 text-[#DFC598]" />
              </div>
              <h4 className="font-heading text-base font-semibold text-[#2A1C19]">Anti-Tarnish Lustre</h4>
              <p className="text-xs text-[#755B55] leading-relaxed">
                Waterproof 18K physical vapor deposition (PVD) coating resisting perfumes, moisture, and sweat.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-[#E8DCCF] p-6 rounded-2xl text-center space-y-3 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FAF5EB] border border-[#DFC598]/50 flex items-center justify-center text-[#DFC598] mx-auto">
                <Award className="w-5 h-5 text-[#7A223B]" />
              </div>
              <h4 className="font-heading text-base font-semibold text-[#2A1C19]">Korean Minimalist Craft</h4>
              <p className="text-xs text-[#755B55] leading-relaxed">
                Refined geometric forms balancing delicate everyday elegance with lasting structural durability.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-[#E8DCCF] p-6 rounded-2xl text-center space-y-3 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FCE7EC] border border-[#DFC598]/50 flex items-center justify-center text-[#7A223B] mx-auto">
                <ShieldCheck className="w-5 h-5 text-[#DFC598]" />
              </div>
              <h4 className="font-heading text-base font-semibold text-[#2A1C19]">Hypoallergenic 316L</h4>
              <p className="text-xs text-[#755B55] leading-relaxed">
                Surgical-grade stainless steel base ensuring 100% skin safety, nickel-free and lead-free comfort.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-white border border-[#E8DCCF] p-6 rounded-2xl text-center space-y-3 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#FAF5EB] border border-[#DFC598]/50 flex items-center justify-center text-[#DFC598] mx-auto">
                <Truck className="w-5 h-5 text-[#7A223B]" />
              </div>
              <h4 className="font-heading text-base font-semibold text-[#2A1C19]">Pan-India Insured Dispatch</h4>
              <p className="text-xs text-[#755B55] leading-relaxed">
                Tamper-evident luxury packaging and insured courier tracking directly to your doorstep.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CONTACT / WHATSAPP SECTION: "LET'S CONNECT" / "NEED HELP?"             */}
      {/* Uses Official Sunbloom Adorn Contact & Atelier Information                */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-18 lg:py-22 bg-white border-t border-[#E8DCCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center space-y-2.5 mb-10">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#7A223B] font-medium block">
              Atelier Concierge
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl text-[#2A1C19] font-normal">
              Let's <span className="font-serif italic text-rose-gold-gradient">Connect</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#755B55] font-light">
              Have a question about a piece, custom sizing, or order curation? Our jewellery specialists are here to help.
            </p>

            {/* Prominent Quick Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/919789325964?text=Hello%20Sunbloom%20Adorn%20Team%2C%20I%20would%20like%20to%20enquire%20about%20your%20jewellery%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#20ba5a] transition-all shadow-2xs hover:scale-101"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href="tel:+919789325964"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-rose-primary text-xs uppercase tracking-wider font-semibold transition-all shadow-2xs hover:scale-101"
              >
                <Phone className="w-4 h-4 text-[#DFC598]" />
                <span>Call Concierge</span>
              </a>
            </div>
          </div>

          {/* Contact Details & Ateliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            
            {/* Card 1: Direct Concierge Contacts */}
            <div className="bg-[#FAF6F0] border border-[#E8DCCF] p-6 rounded-2xl space-y-3.5 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-center text-[#7A223B]">
                <MessageCircle className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-heading text-base font-semibold text-[#2A1C19]">Direct Concierge</h3>
              <div className="space-y-2 text-xs text-[#5E4742]">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-[#2A1C19]">Phone:</span>
                  <a href="tel:+919789325964" className="text-[#7A223B] hover:underline font-mono">
                    +91 97893 25964
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-[#2A1C19]">WhatsApp:</span>
                  <a
                    href="https://wa.me/919789325964?text=Hello%20Sunbloom%20Adorn%20Team%2C%20I%20would%20like%20to%20enquire%20about%20your%20jewellery%20collection."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] hover:underline font-mono"
                  >
                    +91 97893 25964
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-[#2A1C19]">Email:</span>
                  <a href="mailto:support@sunbloomadorn.com" className="text-[#7A223B] hover:underline">
                    support@sunbloomadorn.com
                  </a>
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#755B55] flex items-center gap-1.5 border-t border-[#E8DCCF]">
                <Clock className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>Mon – Sat: 10:00 AM – 7:30 PM IST</span>
              </div>
            </div>

            {/* Card 2: Coonoor Atelier */}
            <div className="bg-[#FAF6F0] border border-[#E8DCCF] p-6 rounded-2xl space-y-3.5 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#DFC598]/50 flex items-center justify-center text-[#DFC598]">
                <MapPin className="w-4.5 h-4.5 text-[#7A223B]" />
              </div>
              <h3 className="font-heading text-base font-semibold text-[#2A1C19]">Coonoor Atelier</h3>
              <p className="text-xs text-[#5E4742] leading-relaxed">
                Bedford Circle, Nilgiris District, Tamil Nadu 643101
              </p>
              <div className="pt-2 text-[11px] text-[#7A223B] font-medium uppercase tracking-wider">
                Private Appointments &amp; Boutique Display
              </div>
              <p className="text-[11px] text-[#755B55]">
                Experience custom styling in the serene Nilgiris hills.
              </p>
            </div>

            {/* Card 3: Coimbatore Atelier */}
            <div className="bg-[#FAF6F0] border border-[#E8DCCF] p-6 rounded-2xl space-y-3.5 shadow-2xs hover:border-[#DFC598] transition-all">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-center text-[#7A223B]">
                <MapPin className="w-4.5 h-4.5 text-[#DFC598]" />
              </div>
              <h3 className="font-heading text-base font-semibold text-[#2A1C19]">Coimbatore Atelier</h3>
              <p className="text-xs text-[#5E4742] leading-relaxed">
                Race Course Road, Coimbatore, Tamil Nadu 641018
              </p>
              <div className="pt-2 text-[11px] text-[#7A223B] font-medium uppercase tracking-wider">
                Design Studio &amp; Express Dispatch Center
              </div>
              <p className="text-[11px] text-[#755B55]">
                Direct fulfillment &amp; bespoke sizing center.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
