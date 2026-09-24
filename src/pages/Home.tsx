// src/pages/Home.tsx
// Cinematic Haute Jewellery Master Page with Continuous 3D Necklace Scroll Journey
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CinematicNecklaceExperience } from '../components/home/CinematicNecklaceExperience';
import { ProductCard } from '../components/products/ProductCard';
import { CategoryCard } from '../components/products/CategoryCard';
import { getProductsApi, getCategoriesApi } from '../lib/api';
import type { Product, Category } from '../types';
import {
  ShieldCheck,
  Sparkles,
  Truck,
  Award,
  MapPin,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Measure Normalized Scroll Progress (0.0 at top -> 1.0 at bottom)
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(1.0, Math.max(0.0, window.scrollY / docHeight));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Existing Products & Categories from Real Backend APIs
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProductsApi().catch(() => ({ products: [] })),
          getCategoriesApi().catch(() => ({ categories: [] })),
        ]);
        setProducts(prodRes.products || []);
        setCategories(catRes.categories || []);
      } catch (e) {
        console.error('Home data load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Slices for Recently Added and Highly Popular
  const recentlyAdded = products.slice(0, 4);
  const highlyPopular = products.length > 4 ? products.slice(4, 8) : products.slice(0, 4);

  return (
    <div className="relative w-full overflow-hidden bg-[#FAF7F2]">
      {/* ========================================================================= */}
      {/* 3D HAUTE JEWELLERY NECKLACE — CINEMATIC SCROLL-DRIVEN VISUAL LAYER       */}
      {/* Stays fixed/sticky in midground, travelling across all 7 homepage stages */}
      {/* ========================================================================= */}
      <CinematicNecklaceExperience scrollProgress={scrollProgress} />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO / ATELIER INTRODUCTION                                    */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center z-20 pointer-events-auto">
        {/* Soft Champagne Ambient Aura */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[460px] lg:w-[680px] h-[460px] lg:h-[680px] rounded-full bg-radial from-[#FCEFC7]/35 via-[#F8E7BE]/12 to-transparent blur-3xl opacity-75"></div>
          <div className="absolute top-1/4 left-[4%] w-[320px] h-[320px] rounded-full bg-radial from-[#FFF9EE]/70 to-transparent blur-2xl opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Official Logo + Editorial Narrative + CTAs */}
            <div className="lg:col-span-6 xl:col-span-6 text-center lg:text-left space-y-6">
              
              {/* Haute Jewellery Atelier Pill Badge */}
              <div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#9E7B31] font-medium font-sans inline-block bg-[#FAF7F2]/90 px-4 py-1.5 rounded-full border border-[#C5A059]/35 shadow-2xs backdrop-blur-xs">
                  Haute Jewellery Atelier
                </span>
              </div>

              {/* Official Sunbloom Adorn Logo (Source of Truth, transparent, zero white box) */}
              <div className="flex justify-center lg:justify-start">
                <img
                  src="/logo.png"
                  alt="Sunbloom Adorn — Haute Jewellery Atelier Official Logo"
                  className="w-auto h-auto max-w-[260px] sm:max-w-[340px] xl:max-w-[380px] object-contain transition-transform duration-500 hover:scale-[1.02]"
                  style={{ mixBlendMode: 'multiply' }}
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Brand Description */}
              <p className="text-sm sm:text-base xl:text-lg text-[#5C5248] font-sans font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                Where sunlight meets adornment. Discover handcrafted anti-tarnish fine jewellery rooted in Korean minimalist aesthetics.
              </p>

              {/* CTA Navigation Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#1C1612] text-[#FEF3C7] hover:bg-[#2A231D] text-xs uppercase tracking-[0.22em] font-medium shadow-gold hover:shadow-gold-lg transition-all duration-500 hover:scale-105 active:scale-95"
                    >
                      <span>Enter Dashboard</span>
                      <span className="text-[#C5A059] transform group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D1C7BA] hover:border-[#C5A059] text-[#1C1612] text-xs uppercase tracking-[0.18em] font-medium transition-all hover:bg-white/60"
                    >
                      View Catalog
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login?mode=login"
                      className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#1C1612] text-[#FEF3C7] hover:bg-[#2A231D] text-xs uppercase tracking-[0.22em] font-medium shadow-gold hover:shadow-gold-lg transition-all duration-500 hover:scale-105 active:scale-95"
                    >
                      <span>Enter Atelier</span>
                      <span className="text-[#C5A059] transform group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D1C7BA] hover:border-[#C5A059] text-[#1C1612] text-xs uppercase tracking-[0.18em] font-medium transition-all hover:bg-white/60"
                    >
                      View Catalog
                    </Link>
                  </>
                )}
              </div>

              {/* Scroll to Bloom Indicator */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-[#8A7E72] opacity-80">
                <div className="w-3.5 h-6 rounded-full border border-[#8A7E72] p-0.5 flex justify-center">
                  <div className="w-1 h-1.5 rounded-full bg-[#C5A059] animate-bounce"></div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-medium">
                  Scroll to bloom
                </span>
              </div>
            </div>

            {/* Right Column: Generous Spatial Area where the 3D Necklace floats prominently */}
            <div className="lg:col-span-6 xl:col-span-6 min-h-[320px] lg:min-h-[480px] pointer-events-none"></div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: BRAND STORY & CRAFTSMANSHIP (ATELIER STANDARDS)                */}
      {/* The 3D Necklace glides toward the left background while cards take front  */}
      {/* ========================================================================= */}
      <section className="relative z-20 py-20 lg:py-28 border-y border-[#E8E1D5] bg-white/80 backdrop-blur-sm pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A059] font-medium block">
              The Atelier Standard
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl text-[#1C1612] font-normal">
              Craftsmanship <span className="font-serif italic text-[#C5A059]">Never Meant to Fade</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7063] font-light max-w-xl mx-auto">
              Every curve, chain, and bezel is engineered with surgical-grade metallurgy, dipped in waterproof 18K gold.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Value Card 1 */}
            <div className="bg-[#FAF7F2]/90 border border-[#E8E1D5] p-6 rounded-2xl text-center space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-white border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-semibold text-[#1C1612]">Anti-Tarnish Lustre</h4>
              <p className="text-xs text-[#7D7063] leading-relaxed">
                Waterproof 18K physical vapor deposition (PVD) coating resisting perfumes, moisture, and sweat.
              </p>
            </div>

            {/* Value Card 2 */}
            <div className="bg-[#FAF7F2]/90 border border-[#E8E1D5] p-6 rounded-2xl text-center space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-white border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-semibold text-[#1C1612]">Bespoke Craft</h4>
              <p className="text-xs text-[#7D7063] leading-relaxed">
                Refined Korean minimalist design philosophy balancing delicate grace with daily durability.
              </p>
            </div>

            {/* Value Card 3 */}
            <div className="bg-[#FAF7F2]/90 border border-[#E8E1D5] p-6 rounded-2xl text-center space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-white border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-semibold text-[#1C1612]">Insured Dispatch</h4>
              <p className="text-xs text-[#7D7063] leading-relaxed">
                Pan-India insured courier consignments with dedicated tracking from our Tamil Nadu atelier.
              </p>
            </div>

            {/* Value Card 4 */}
            <div className="bg-[#FAF7F2]/90 border border-[#E8E1D5] p-6 rounded-2xl text-center space-y-3 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-white border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-semibold text-[#1C1612]">Pure Hypoallergenic</h4>
              <p className="text-xs text-[#7D7063] leading-relaxed">
                Pure 316L medical-grade stainless steel foundation, nickel-free and gentle on delicate skin.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: CURATED CATEGORIES / JEWELLERY UNIVERSES                       */}
      {/* The 3D Necklace glides toward the right background, framing collection cards */}
      {/* ========================================================================= */}
      {categories.length > 0 && (
        <section className="relative z-20 py-20 lg:py-28 bg-[#FAF7F2]/85 pointer-events-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059] font-medium block mb-2">
                  Curated Universes
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl text-[#1C1612] font-normal">
                  Signature <span className="font-serif italic text-[#C5A059]">Collections</span>
                </h2>
              </div>
              <Link
                to="/categories"
                className="text-xs uppercase tracking-widest font-medium text-[#1C1612] hover:text-[#C5A059] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Explore All Universes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: RECENTLY ADDED / LATEST CREATIONS                              */}
      {/* The 3D Necklace recedes deeper in perspective; real product cards focus   */}
      {/* ========================================================================= */}
      {recentlyAdded.length > 0 && (
        <section className="relative z-20 py-20 lg:py-28 bg-white/90 border-t border-[#E8E1D5] pointer-events-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059] font-medium block mb-2">
                  Fresh from the Atelier Bench
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl text-[#1C1612] font-normal">
                  Recently <span className="font-serif italic text-[#C5A059]">Added</span>
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs uppercase tracking-widest font-medium text-[#1C1612] hover:text-[#C5A059] transition-colors inline-flex items-center gap-1.5"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {recentlyAdded.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: HIGHLY POPULAR / ATELIER BESTSELLERS                           */}
      {/* The 3D Necklace pirouettes in center; curated highlights showcased       */}
      {/* ========================================================================= */}
      {highlyPopular.length > 0 && (
        <section className="relative z-20 py-20 lg:py-28 bg-[#FAF7F2]/85 border-t border-[#E8E1D5] pointer-events-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059] font-medium block mb-2">
                  Cherished by Connoisseurs
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl text-[#1C1612] font-normal">
                  Highly <span className="font-serif italic text-[#C5A059]">Popular</span>
                </h2>
              </div>
              <span className="text-xs uppercase tracking-widest text-[#8A7E72] font-sans font-medium">
                ✦ Bespoke Curation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {highlyPopular.map((product) => (
                <ProductCard key={`popular-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: ATELIER PHILOSOPHY & MANIFESTO                                 */}
      {/* Dark editorial typography contrasting with muted gold accents            */}
      {/* ========================================================================= */}
      <section className="relative z-20 py-24 md:py-32 bg-[#1C1612] text-[#FAF7F2] overflow-hidden pointer-events-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium">
            Our Atelier Philosophy
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-normal leading-tight">
            "Designed for everyday light. Crafted never to fade."
          </h2>
          <p className="text-sm sm:text-base text-[#B8ADA0] font-light leading-relaxed max-w-2xl mx-auto">
            Sunbloom Adorn was born from a desire for fine jewellery that defies time. Each creation is meticulously cast, polished, and finished with waterproof PVD golden brilliance, ensuring it accompanies you through every chapter of life.
          </p>
          <div className="pt-4">
            <Link
              to="/about"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1612] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300"
            >
              <span>Discover Our Heritage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: ATELIER LOCATIONS & DIRECT CONCIERGE INFORMATION               */}
      {/* The 3D Necklace softly descends and dissolves as boutique info takes over */}
      {/* ========================================================================= */}
      <section className="relative z-20 py-20 lg:py-28 bg-[#FAF7F2] border-t border-[#E8E1D5] pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#C5A059] font-medium block">
              Visit &amp; Connect
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl text-[#1C1612] font-normal">
              Atelier Boutiques <span className="font-serif italic text-[#C5A059]">&amp; Concierge</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7063] font-light max-w-xl mx-auto">
              Experience personalized fine jewellery curation in our Tamil Nadu boutiques or connect with a master stylist online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Location 1: Coonoor */}
            <div className="bg-white border border-[#E8E1D5] p-8 rounded-2xl space-y-4 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-[#1C1612]">Coonoor Atelier</h3>
              <p className="text-xs text-[#7D7063] leading-relaxed">
                Bedford Circle, Nilgiris District, Tamil Nadu 643101
              </p>
              <div className="pt-2 text-[11px] text-[#C5A059] font-medium uppercase tracking-wider">
                Private Appointments &amp; Boutique Display
              </div>
            </div>

            {/* Location 2: Coimbatore */}
            <div className="bg-white border border-[#E8E1D5] p-8 rounded-2xl space-y-4 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-[#1C1612]">Coimbatore Atelier</h3>
              <p className="text-xs text-[#7D7063] leading-relaxed">
                Race Course Road, Coimbatore, Tamil Nadu 641018
              </p>
              <div className="pt-2 text-[11px] text-[#C5A059] font-medium uppercase tracking-wider">
                Design Studio &amp; Express Dispatch Center
              </div>
            </div>

            {/* Direct Concierge & WhatsApp Consultation */}
            <div className="bg-white border border-[#C5A059]/40 p-8 rounded-2xl space-y-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#1C1612]">Direct Concierge</h3>
                <p className="text-xs text-[#7D7063] leading-relaxed">
                  Prefer real-time styling advice, gift curation, or custom ring sizing? Chat directly with our jewellery specialists.
                </p>
              </div>
              <div className="pt-4">
                <a
                  href="https://wa.me/919789325964?text=Hello%20Sunbloom%20Adorn%20Team%2C%20I%20would%20like%20to%20enquire%20about%20your%20jewellery%20collection."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-medium hover:bg-[#20ba5a] transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: +91 97893 25964</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
