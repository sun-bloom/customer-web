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
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#DFC598] transition-all duration-300 flex flex-col">
      {/* Product Image Container (Crisp, Balanced & Untinted) */}
      <Link to={`/products/${product.slug}`} className="relative aspect-square sm:aspect-[4/4.5] max-h-[250px] sm:max-h-[280px] overflow-hidden bg-[#FAF5EB] block">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
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
            className="absolute bottom-2.5 right-2.5 p-2 sm:p-2.5 rounded-xl btn-rose-primary shadow-xs opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 cursor-pointer"
            aria-label="Add to cart"
            title="Quick add to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#DFC598]" />
          </button>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-[#FCF9F7]">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#7A223B] font-medium block mb-1">
            {product.category || 'Fine Jewellery'}
          </span>
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-heading text-sm sm:text-base font-normal text-[#2A1C19] group-hover:text-[#7A223B] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-xs text-[#755B55] line-clamp-2 mt-0.5 font-light">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#F4ECE5] flex items-center justify-between">
          <span className="font-heading text-sm sm:text-base font-medium text-[#7A223B]">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[#A88136] font-medium">
            {product.variants?.length > 1 ? `${product.variants.length} finishes` : 'In Stock'}
          </span>
        </div>
      </div>
    </div>
  );
};

