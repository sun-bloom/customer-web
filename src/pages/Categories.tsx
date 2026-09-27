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
      setError(null);
      try {
        const [catRes, prodRes] = await Promise.all([
          getCategoriesApi().catch(() => ({ categories: [] })),
          getProductsApi().catch(() => ({ products: [] })),
        ]);
        const catList = catRes.categories || [];
        const prodList = prodRes.products?.filter((p) => p.isActive) || [];

        setCategories(catList);
        setProducts(prodList);
      } catch (err: any) {
        console.error('Failed to load categories:', err);
        setError(err.message || 'Unable to load categories');
        setCategories([]);
        setProducts([]);
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
    <div className="min-h-screen bg-[#FCF9F5] py-10 md:py-16 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#7A223B] font-semibold block mb-2">
            Curated Atelier Departments
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#2A1C19]">
            Jewellery <span className="font-serif italic text-rose-gold-gradient">Categories</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7D6460] font-light mt-3 max-w-xl mx-auto leading-relaxed">
            Browse our signature collections crafted with anti-tarnish waterproof stainless steel and luminous 18K gold finishing.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-5 space-y-4 animate-pulse">
                <div className="aspect-4/3 bg-[#FAF6F0] rounded-xl w-full"></div>
                <div className="h-5 bg-[#FAF6F0] rounded w-1/2"></div>
                <div className="h-3 bg-[#FAF6F0] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl sm:rounded-3xl p-8 text-center max-w-lg mx-auto">
            <p className="font-heading text-lg text-red-900 mb-2">Unable to load categories</p>
            <p className="text-xs text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-rose-primary px-5 py-2 rounded-xl text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((cat) => {
              const count = getProductCountForCategory(cat.slug);
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] overflow-hidden shadow-xs hover:border-[#DFC598] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-[#FAF6F0]">
                    <img
                      src={cat.image || '/logo.png'}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A1C19]/65 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#7A223B] border border-[#FCE7EC] text-[10px] font-semibold uppercase tracking-wider shadow-2xs">
                        {count} {count === 1 ? 'Creation' : 'Creations'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <h3 className="font-heading text-xl font-normal text-[#2A1C19] group-hover:text-[#7A223B] transition-colors mb-2">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-[#7D6460] font-light line-clamp-2 leading-relaxed mb-4">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#FAF6F0] flex items-center justify-between text-xs font-semibold text-[#7A223B] group-hover:text-[#5E182C] transition-colors">
                      <span className="uppercase tracking-widest text-[11px]">Explore Pieces</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#C9A86A]" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FDF2F5] border border-[#FCE7EC] flex items-center justify-center mx-auto mb-4 text-[#7A223B]">
              <Sparkles className="w-6 h-6 text-[#DFC598]" />
            </div>
            <h3 className="font-heading text-xl font-normal text-[#2A1C19] mb-1">
              No categories found
            </h3>
            <p className="text-xs text-[#7D6460] font-light mb-6">
              No product categories are currently available in the atelier collection.
            </p>
            <Link
              to="/products"
              className="btn-rose-primary px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs inline-block"
            >
              Browse Catalog
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default Categories;
