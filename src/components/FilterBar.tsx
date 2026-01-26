import React, { useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface FilterBarProps {
  categories: Category[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  activeFilters: {
    category: string;
    color: string;
    minPrice: string;
    maxPrice: string;
  };
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  colors,
  minPrice,
  maxPrice,
  activeFilters,
}) => {
  const [priceRange, setPriceRange] = useState({
    min: activeFilters.minPrice || minPrice.toString(),
    max: activeFilters.maxPrice || maxPrice.toString(),
  });
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    colors: true,
    price: true,
  });

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (activeFilters.category) {
      params.set('category', activeFilters.category);
    }
    
    if (activeFilters.color) {
      params.set('color', activeFilters.color);
    }
    
    if (priceRange.min !== minPrice.toString()) {
      params.set('minPrice', priceRange.min);
    }
    
    if (priceRange.max !== maxPrice.toString()) {
      params.set('maxPrice', priceRange.max);
    }
    
    window.location.href = `/products?${params.toString()}`;
  };

  const handleClearFilters = () => {
    window.location.href = '/products';
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
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
      
      <form onSubmit={handleApplyFilters}>
        {/* Categories Filter */}
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
              {categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={activeFilters.category === category.id}
                    onChange={() => {
                      const params = new URLSearchParams(window.location.search);
                      if (activeFilters.category === category.id) {
                        params.delete('category');
                      } else {
                        params.set('category', category.id);
                      }
                      window.location.href = `/products?${params.toString()}`;
                    }}
                    className="mr-2 h-4 w-4 text-black focus:ring-gray-900"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Colors Filter */}
        <div className="mb-6">
          <div
            className="flex justify-between items-center cursor-pointer mb-3"
            onClick={() => toggleSection('colors')}
          >
            <h3 className="font-medium">Colors</h3>
            <span className="text-gray-500">
              {expandedSections.colors ? '−' : '+'}
            </span>
          </div>
          
          {expandedSections.colors && (
            <div className="space-y-2">
              {colors.map(color => (
                <label key={color} className="flex items-center">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    checked={activeFilters.color === color}
                    onChange={() => {
                      const params = new URLSearchParams(window.location.search);
                      if (activeFilters.color === color) {
                        params.delete('color');
                      } else {
                        params.set('color', color);
                      }
                      window.location.href = `/products?${params.toString()}`;
                    }}
                    className="mr-2 h-4 w-4 text-black focus:ring-gray-900"
                  />
                  <span 
                    className={`inline-block w-4 h-4 rounded-full mr-2 border border-gray-300 ${
                      color.toLowerCase().includes('red') ? 'bg-red-500' :
                      color.toLowerCase().includes('blue') ? 'bg-blue-500' :
                      color.toLowerCase().includes('green') ? 'bg-green-500' :
                      color.toLowerCase().includes('yellow') ? 'bg-yellow-500' :
                      color.toLowerCase().includes('purple') ? 'bg-purple-500' :
                      color.toLowerCase().includes('pink') ? 'bg-pink-500' :
                      color.toLowerCase().includes('maroon') ? 'bg-red-800' :
                      color.toLowerCase().includes('multi') ? 'bg-gray-400' :
                      'bg-gray-400'
                    }`}
                  ></span>
                  <span className="text-sm">{color}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        {/* Price Range Filter */}
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
                <label htmlFor="minPrice" className="text-sm text-gray-600">
                  Min Price: ₹{priceRange.min}
                </label>
                <input
                  type="range"
                  id="minPrice"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({
                    ...prev,
                    min: e.target.value
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label htmlFor="maxPrice" className="text-sm text-gray-600">
                  Max Price: ₹{priceRange.max}
                </label>
                <input
                  type="range"
                  id="maxPrice"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({
                    ...prev,
                    max: e.target.value
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-black transition-colors"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
};

export default FilterBar;