// src/pages/Products.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsApi, getCategoriesApi } from '../lib/api';
import type { Product, Category } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, catRes] = await Promise.all([
          getProductsApi().catch(() => ({ products: [] })),
          getCategoriesApi().catch(() => ({ categories: [] })),
        ]);
        
        const activeProducts = prodRes.products?.filter((p) => p.isActive) || [];
        setProducts(activeProducts);
        setCategories(catRes.categories || []);
      } catch (err: any) {
        console.error('Failed to load products/categories:', err);
        setError(err.message || 'Unable to load collection');
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Update selectedCategory if URL param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: slug });
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) =>
          // API's serializeProduct() always sets p.category = category slug string
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          // Fallback: categoryDetails.slug (present on all API responses)
          (p as any).categoryDetails?.slug?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-10 md:py-16 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-4 sm:p-6 mb-10 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#A8928D] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or style…"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] placeholder-[#A8928D] focus:outline-none focus:border-[#7A223B] focus:ring-1 focus:ring-[#7A223B]/20 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-[#7A223B]" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs font-medium text-[#2A1C19] focus:outline-none focus:border-[#7A223B] cursor-pointer"
              >
                <option value="featured">Featured Collections</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#7A223B] text-[#FFF6FA] shadow-xs border border-[#7A223B]'
                  : 'bg-[#FAF6F0] text-[#5C4540] hover:bg-[#FDF2F5] border border-[#E8DCCF]'
              }`}
            >
              All Creations ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-3.5 py-1.5 rounded-lg sm:rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.slug.toLowerCase()
                    ? 'bg-[#7A223B] text-[#FFF6FA] shadow-xs border border-[#7A223B]'
                    : 'bg-[#FAF6F0] text-[#5C4540] hover:bg-[#FDF2F5] border border-[#E8DCCF]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-3 sm:p-4 space-y-3 animate-pulse">
                <div className="aspect-square sm:aspect-[4/4.5] bg-[#FAF6F0] rounded-xl w-full"></div>
                <div className="h-4 bg-[#FAF6F0] rounded w-3/4"></div>
                <div className="h-3 bg-[#FAF6F0] rounded w-1/2"></div>
                <div className="h-5 bg-[#FAF6F0] rounded w-1/3 pt-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl sm:rounded-3xl p-8 text-center max-w-lg mx-auto">
            <p className="font-heading text-lg text-red-900 mb-2">Unable to load collection</p>
            <p className="text-xs text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-rose-primary px-5 py-2 rounded-xl text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FDF2F5] border border-[#FCE7EC] flex items-center justify-center mx-auto mb-4 text-[#7A223B]">
              <Sparkles className="w-6 h-6 text-[#DFC598]" />
            </div>
            <h3 className="font-heading text-xl font-normal text-[#2A1C19] mb-1">
              No products found
            </h3>
            <p className="text-xs text-[#7D6460] font-light mb-6">
              {searchQuery
                ? `No pieces matching "${searchQuery}" in this collection.`
                : 'No pieces currently available in this category.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('all');
              }}
              className="btn-rose-primary px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer"
            >
              View All Creations
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;
