// src/pages/Categories.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoriesApi, getProductsApi } from '../lib/api';
import type { Category, Product } from '../types';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          getCategoriesApi().catch(() => ({ categories: [] })),
          getProductsApi().catch(() => ({ products: [] })),
        ]);
        setCategories(catRes.categories || []);
        setProducts(prodRes.products.filter((p) => p.isActive) || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getProductCountForCategory = (slug: string) => {
    return products.filter(
      (p) =>
        p.category?.toLowerCase() === slug.toLowerCase() ||
        (p as any).categorySlug?.toLowerCase() === slug.toLowerCase() ||
        (p as any).categoryDetails?.slug === slug
    ).length;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-2">
            Curated Atelier Departments
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#1C1612]">
            Jewellery <span className="font-serif italic text-[#C5A059]">Categories</span>
          </h1>
          <p className="text-sm text-[#7D7063] font-light mt-3 max-w-xl mx-auto leading-relaxed">
            Browse our signature collections crafted with anti-tarnish waterproof stainless steel and luminous 18K gold finishing.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-[#E8E1D5] p-5 space-y-4 animate-pulse">
                <div className="aspect-4/3 bg-[#F0EAE1] rounded-2xl w-full"></div>
                <div className="h-5 bg-[#F0EAE1] rounded w-1/2"></div>
                <div className="h-3 bg-[#F0EAE1] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
            <p className="font-heading text-lg text-red-900 mb-2">Unable to load categories</p>
            <p className="text-xs text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl bg-[#1C1612] text-white text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((cat) => {
              const count = getProductCountForCategory(cat.slug);
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-[#F0EAE1]">
                    <img
                      src={cat.image || '/logo.png'}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1612]/70 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1C1612] text-[10px] font-semibold uppercase tracking-wider shadow-2xs">
                        {count} {count === 1 ? 'Creation' : 'Creations'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-heading text-xl font-normal text-[#1C1612] group-hover:text-[#C5A059] transition-colors mb-2">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-[#7D7063] font-light line-clamp-2 leading-relaxed mb-4">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between text-xs font-semibold text-[#1C1612] group-hover:text-[#C5A059] transition-colors">
                      <span className="uppercase tracking-widest text-[11px]">Explore Pieces</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
