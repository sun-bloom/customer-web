import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

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

  const emitFilterChange = (filters: { categories: string[]; minPrice: number | null; maxPrice: number | null }) => {
    window.dispatchEvent(new CustomEvent('filter-change', { detail: filters }));
  };

  const handleCategoryChange = (categorySlug: string) => {
    const next = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter((c) => c !== categorySlug)
      : [...selectedCategories, categorySlug];
    setSelectedCategories(next);
    emitFilterChange({
      categories: next,
      minPrice: parseInt(priceRange.min),
      maxPrice: parseInt(priceRange.max),
    });
  };

  const handleMinPriceChange = (value: string) => {
    const newMin = parseInt(value);
    setPriceRange((prev) => ({ ...prev, min: value }));
    emitFilterChange({
      categories: selectedCategories,
      minPrice: newMin,
      maxPrice: parseInt(priceRange.max),
    });
  };

  const handleMaxPriceChange = (value: string) => {
    const newMax = parseInt(value);
    setPriceRange((prev) => ({ ...prev, max: value }));
    emitFilterChange({
      categories: selectedCategories,
      minPrice: parseInt(priceRange.min),
      maxPrice: newMax,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: priceBounds.min.toString(), max: priceBounds.max.toString() });
    emitFilterChange({ categories: [], minPrice: null, maxPrice: null });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Filters</h2>
        <button
          onClick={handleClearFilters}
          className="text-sm text-gray-600 hover:text-black transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="font-medium">Categories</h3>
          <span className="text-gray-500">
            {expandedSections.categories ? '−' : '+'}
          </span>
        </div>

        {expandedSections.categories && (
          <div className="space-y-2">
            {categoryList.map((category) => (
              <label key={category.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="category"
                  value={category.slug}
                  checked={selectedCategories.includes(category.slug)}
                  onChange={() => handleCategoryChange(category.slug)}
                  className="mr-2 h-4 w-4 text-black focus:ring-gray-900"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => toggleSection('price')}
        >
          <h3 className="font-medium">Price Range</h3>
          <span className="text-gray-500">
            {expandedSections.price ? '−' : '+'}
          </span>
        </div>

        {expandedSections.price && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="minPrice"
                className="text-sm text-gray-600 block mb-1"
              >
                Min: ₹{priceRange.min}
              </label>
              <input
                type="range"
                id="minPrice"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceRange.min}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label
                htmlFor="maxPrice"
                className="text-sm text-gray-600 block mb-1"
              >
                Max: ₹{priceRange.max}
              </label>
              <input
                type="range"
                id="maxPrice"
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceRange.max}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="text-sm text-gray-600 text-center">
              ₹{priceRange.min} - ₹{priceRange.max}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
