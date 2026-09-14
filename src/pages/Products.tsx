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
      try {
        const [prodRes, catRes] = await Promise.all([
          getProductsApi(),
          getCategoriesApi().catch(() => ({ categories: [] })),
        ]);
        setProducts(prodRes.products.filter((p) => p.isActive));
        setCategories(catRes.categories || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
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
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-2">
            The Complete Atelier Collection
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#1C1612]">
            Fine <span className="font-serif italic text-[#C5A059]">Jewellery</span>
          </h1>
          <p className="text-sm text-[#7D7063] font-light mt-3 max-w-xl mx-auto">
            Discover handcrafted Korean minimalist pieces. Anti-tarnish, waterproof, and designed with enduring 18K golden radiance.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-4 sm:p-6 mb-10 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8A7E72] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or style…"
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] placeholder-[#8A7E72] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-[#8A7E72]" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-full bg-[#FAF7F2] border border-[#E8E1D5] text-xs font-medium text-[#1C1612] focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
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
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1C1612] text-[#FEF3C7] shadow-xs'
                  : 'bg-[#FAF7F2] text-[#5C5248] hover:bg-[#F2ECE1] border border-[#E8E1D5]'
              }`}
            >
              All Creations ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.slug.toLowerCase()
                    ? 'bg-[#1C1612] text-[#FEF3C7] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#5C5248] hover:bg-[#F2ECE1] border border-[#E8E1D5]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-[#E8E1D5] p-4 space-y-3 animate-pulse">
                <div className="aspect-4/5 bg-[#F0EAE1] rounded-2xl w-full"></div>
                <div className="h-4 bg-[#F0EAE1] rounded w-3/4"></div>
                <div className="h-3 bg-[#F0EAE1] rounded w-1/2"></div>
                <div className="h-5 bg-[#F0EAE1] rounded w-1/3 pt-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
            <p className="font-heading text-lg text-red-900 mb-2">Unable to load collection</p>
            <p className="text-xs text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl bg-[#1C1612] text-white text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center mx-auto mb-4 text-[#C5A059]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-normal text-[#1C1612] mb-1">
              No products found
            </h3>
            <p className="text-xs text-[#7D7063] font-light mb-6">
              {searchQuery
                ? `No pieces matching "${searchQuery}" in this collection.`
                : 'No pieces currently available in this category.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('all');
              }}
              className="px-6 py-2.5 rounded-full bg-[#1C1612] text-[#FEF3C7] text-xs font-semibold uppercase tracking-wider shadow-xs cursor-pointer"
            >
              View All Creations
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
