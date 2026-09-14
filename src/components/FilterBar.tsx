import React, { useState, useEffect } from 'react';
import { getSubcategories } from '../api/subcategories';
import type { Category, Subcategory } from '../types';

interface FilterBarProps {
  categories: Category[];
  minPrice: number;
  maxPrice: number;
  initialCategory: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  client?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  minPrice,
  maxPrice,
  initialCategory,
  initialMinPrice,
  initialMaxPrice,
}) => {
  const initialCategories = initialCategory
    ? initialCategory.split(',').map((c) => c.trim()).filter(Boolean)
    : [];
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [priceBounds, setPriceBounds] = useState({ min: minPrice, max: maxPrice });
  const [priceRange, setPriceRange] = useState({
    min: initialMinPrice || minPrice.toString(),
    max: initialMaxPrice || maxPrice.toString(),
  });
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  });

  useEffect(() => {
    getSubcategories().then(setSubcategories).catch(console.error);
  }, []);

  const filteredSubcategories = selectedCategories.length === 1
    ? subcategories.filter((s) => s.category?.slug === selectedCategories[0])
    : [];

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    window.dispatchEvent(new CustomEvent('filter-change', {
      detail: {
        categories: selectedCategories,
        subcategoryId: subcategoryId || null,
        minPrice: parseInt(priceRange.min),
        maxPrice: parseInt(priceRange.max),
      }
    }));
  };

  useEffect(() => {
    const handleFilterChange = (e: CustomEvent) => {
      const incoming = e.detail.categories || e.detail.category || [];
      const next = Array.isArray(incoming) ? incoming : [incoming];
      setSelectedCategories(next.filter(Boolean));
      setPriceRange({
        min: e.detail.minPrice?.toString() || priceBounds.min.toString(),
        max: e.detail.maxPrice?.toString() || priceBounds.max.toString(),
      });
    };
    window.addEventListener('filter-change', handleFilterChange as EventListener);
    return () => window.removeEventListener('filter-change', handleFilterChange as EventListener);
  }, [priceBounds.min, priceBounds.max]);

  useEffect(() => {
    const handleData = (e: CustomEvent) => {
      const detail = e.detail || {};
      if (Array.isArray(detail.categories)) {
        setCategoryList(detail.categories);
      }
      if (typeof detail.minPrice === 'number' && typeof detail.maxPrice === 'number') {
        setPriceBounds({ min: detail.minPrice, max: detail.maxPrice });
        setPriceRange({
          min: initialMinPrice || detail.minPrice.toString(),
          max: initialMaxPrice || detail.maxPrice.toString(),
        });
      }
    };
    window.addEventListener('filters:data', handleData as EventListener);
    return () => window.removeEventListener('filters:data', handleData as EventListener);
  }, [initialMinPrice, initialMaxPrice]);

  const emitFilterChange = (filters: { categories: string[]; subcategoryId: string | null; minPrice: number | null; maxPrice: number | null }) => {
    window.dispatchEvent(new CustomEvent('filter-change', { detail: filters }));
  };

  const handleCategoryChange = (categorySlug: string) => {
    const next = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter((c) => c !== categorySlug)
      : [...selectedCategories, categorySlug];
    setSelectedCategories(next);
    setSelectedSubcategoryId('');
    emitFilterChange({
      categories: next,
      subcategoryId: null,
      minPrice: parseInt(priceRange.min),
      maxPrice: parseInt(priceRange.max),
    });
  };

  const handleMinPriceChange = (value: string) => {
    const newMin = parseInt(value);
    setPriceRange((prev) => ({ ...prev, min: value }));
    emitFilterChange({
      categories: selectedCategories,
      subcategoryId: selectedSubcategoryId || null,
      minPrice: isNaN(newMin) ? null : newMin,
      maxPrice: parseInt(priceRange.max),
    });
  };

  const handleMaxPriceChange = (value: string) => {
    const newMax = parseInt(value);
    setPriceRange((prev) => ({ ...prev, max: value }));
    emitFilterChange({
      categories: selectedCategories,
      subcategoryId: selectedSubcategoryId || null,
      minPrice: parseInt(priceRange.min),
      maxPrice: isNaN(newMax) ? null : newMax,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategoryId('');
    setPriceRange({ min: priceBounds.min.toString(), max: priceBounds.max.toString() });
    emitFilterChange({ categories: [], subcategoryId: null, minPrice: null, maxPrice: null });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E8E2D8] p-6 sm:p-7 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-[#F0EAE1]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-medium block">Filter Vault</span>
          <h2 className="font-serif text-xl font-normal text-stone-900">Refine Pieces</h2>
        </div>
        {(selectedCategories.length > 0 || parseInt(priceRange.min) > priceBounds.min || parseInt(priceRange.max) < priceBounds.max || selectedSubcategoryId) && (
          <button
            onClick={handleClearFilters}
            className="text-[11px] uppercase tracking-wider text-[#A88136] hover:text-[#1C1612] transition-colors font-medium cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Categories Section */}
      <div>
        <div
          className="flex justify-between items-center cursor-pointer mb-3.5 group"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="font-serif text-base font-medium text-stone-900 group-hover:text-[#C5A059] transition-colors">
            Collections
          </h3>
          <span className="text-stone-400 text-sm font-light">
            {expandedSections.categories ? '−' : '+'}
          </span>
        </div>

        {expandedSections.categories && (
          <div className="space-y-2.5 pt-1">
            {categoryList.map((category) => (
              <label key={category.id} className="flex items-center justify-between cursor-pointer group py-0.5">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="category"
                    value={category.slug}
                    checked={selectedCategories.includes(category.slug)}
                    onChange={() => handleCategoryChange(category.slug)}
                    className="h-4 w-4 rounded-md border-stone-300 text-[#C5A059] focus:ring-[#C5A059]/30 cursor-pointer accent-[#C5A059]"
                  />
                  <span className="ml-2.5 text-xs font-sans text-stone-700 group-hover:text-stone-950 transition-colors">
                    {category.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Subcategories Section */}
      {selectedCategories.length === 1 && filteredSubcategories.length > 0 && (
        <div className="pt-4 border-t border-[#F0EAE1]">
          <div className="mb-2.5">
            <h3 className="font-serif text-base font-medium text-stone-900">Sub-Category</h3>
          </div>
          <select
            value={selectedSubcategoryId}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            className="w-full p-2.5 bg-[#FAF7F2]/60 border border-[#E8E2D8] rounded-xl text-xs font-sans text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
          >
            <option value="">All Sub-Categories</option>
            {filteredSubcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range Section */}
      <div className="pt-4 border-t border-[#F0EAE1]">
        <div
          className="flex justify-between items-center cursor-pointer mb-3.5 group"
          onClick={() => toggleSection('price')}
        >
          <h3 className="font-serif text-base font-medium text-stone-900 group-hover:text-[#C5A059] transition-colors">
            Price Range
          </h3>
          <span className="text-stone-400 text-sm font-light">
            {expandedSections.price ? '−' : '+'}
          </span>
        </div>

        {expandedSections.price && (
          <div className="space-y-4 pt-1 font-sans">
            <div>
              <div className="flex justify-between text-[11px] text-stone-500 mb-1.5">
                <span>Minimum</span>
                <span className="font-medium text-stone-900">₹{priceRange.min}</span>
              </div>
              <input
                type="range"
                id="minPrice"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceRange.min}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-stone-500 mb-1.5">
                <span>Maximum</span>
                <span className="font-medium text-stone-900">₹{priceRange.max}</span>
              </div>
              <input
                type="range"
                id="maxPrice"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceRange.max}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] text-center text-xs text-stone-700 font-medium tracking-wide">
              ₹{priceRange.min} — ₹{priceRange.max}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
