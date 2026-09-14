// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SunbloomScrollExperience } from '../components/home/SunbloomScrollExperience';
import { ProductCard } from '../components/products/ProductCard';
import { CategoryCard } from '../components/products/CategoryCard';
import { getProductsApi, getCategoriesApi } from '../lib/api';
import type { Product, Category } from '../types';
import { ShieldCheck, Sparkles, Truck, Award } from 'lucide-react';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProductsApi().catch(() => ({ products: [] })),
          getCategoriesApi().catch(() => ({ categories: [] })),
        ]);
        setFeaturedProducts(prodRes.products.slice(0, 4));
        setCategories(catRes.categories.slice(0, 3));
      } catch (e) {
        console.error('Home data error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="w-full">
      {/* 3D Scroll Hero Medallion Experience */}
      <SunbloomScrollExperience />

      {/* Atelier Values Banner */}
      <section className="border-y border-[#E8E1D5] bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mb-2.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-sm font-semibold text-[#1C1612]">Anti-Tarnish Lustre</h4>
              <p className="text-[11px] text-[#7D7063] mt-0.5">Waterproof 18K PVD coating</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mb-2.5">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-sm font-semibold text-[#1C1612]">Bespoke Craft</h4>
              <p className="text-[11px] text-[#7D7063] mt-0.5">Korean minimalist designs</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mb-2.5">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-sm font-semibold text-[#1C1612]">Secure Express Delivery</h4>
              <p className="text-[11px] text-[#7D7063] mt-0.5">Pan-India insured consignment</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] mb-2.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-sm font-semibold text-[#1C1612]">Hypoallergenic</h4>
              <p className="text-[11px] text-[#7D7063] mt-0.5">Pure surgical grade stainless steel</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24 bg-[#FAF7F2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-2">
                Curated Universes
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl text-[#1C1612] font-normal">
                Signature <span className="font-serif italic text-[#C5A059]">Collections</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Showcase */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-white border-t border-[#E8E1D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-2">
                  Atelier Highlights
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl text-[#1C1612] font-normal">
                  Latest <span className="font-serif italic text-[#C5A059]">Creations</span>
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs uppercase tracking-widest font-medium text-[#1C1612] hover:text-[#C5A059] transition-colors inline-flex items-center gap-1"
              >
                <span>View Full Catalog</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Story & Manifesto Section */}
      <section className="py-20 md:py-28 bg-[#1C1612] text-[#FAF7F2] relative overflow-hidden">
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
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1C1612] text-xs uppercase tracking-[0.2em] font-medium transition-all"
            >
              Discover Our Heritage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
