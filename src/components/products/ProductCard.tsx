// src/components/products/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { addToCart } from '../../stores/cartStore';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800';
  const secondaryImage = product.images?.[1] || primaryImage;
  const defaultVariant = product.variants?.[0];
  const price = defaultVariant ? product.basePrice + (defaultVariant.additionalPrice || 0) : product.basePrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;

    addToCart({
      productId: product.id,
      variantId: defaultVariant.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: defaultVariant.images?.[0] || primaryImage,
      color: defaultVariant.color || 'Standard',
      pattern: defaultVariant.pattern || 'Classic',
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-2xs hover:shadow-gold transition-all duration-300 flex flex-col">
      {/* Product Image Container */}
      <Link to={`/products/${product.slug}`} className="relative aspect-4/5 overflow-hidden bg-[#F6F1EA] block">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            loading="lazy"
          />
        )}
        
        {/* Quick Add overlay button */}
        {defaultVariant && defaultVariant.isAvailable !== false && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 p-3 rounded-full bg-[#1C1612] text-[#FEF3C7] shadow-gold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#C5A059] hover:text-[#1C1612] cursor-pointer"
            aria-label="Add to cart"
            title="Quick add to bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium block mb-1">
            {product.category || 'Fine Jewellery'}
          </span>
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-heading text-base sm:text-lg font-normal text-[#1C1612] group-hover:text-[#A88136] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-xs text-[#7D7063] line-clamp-2 mt-1 font-light">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex items-center justify-between">
          <span className="font-heading text-base sm:text-lg font-medium text-[#1C1612]">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[#8A7E72]">
            {product.variants?.length > 1 ? `${product.variants.length} finishes` : 'In Stock'}
          </span>
        </div>
      </div>
    </div>
  );
};
