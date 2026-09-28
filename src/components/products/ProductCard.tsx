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
  // Authoritative variant resolution:
  // 1. Prefer an available variant that has uploaded images
  // 2. Fall back to any variant with images
  // 3. Fall back to the first variant
  const defaultVariant =
    product.variants?.find((v) => v.isAvailable && Array.isArray(v.images) && v.images.length > 0) ||
    product.variants?.find((v) => Array.isArray(v.images) && v.images.length > 0) ||
    product.variants?.[0];

  const allVariantImages = (product.variants || []).flatMap((v) => (Array.isArray(v.images) ? v.images : [])).filter(Boolean);

  // Authoritative primary image:
  // 1. First image of default/active variant
  // 2. First image across any variant
  // 3. Product's own images array
  // 4. Product's primaryImage / imageUrl if provided
  const primaryImage =
    defaultVariant?.images?.[0] ||
    allVariantImages[0] ||
    product.images?.[0] ||
    (product as any).primaryImage ||
    (product as any).imageUrl ||
    '';

  // Authoritative secondary image (hover alternate view):
  // 1. Second image of default variant
  // 2. Second image across any variant
  // 3. Second image in product.images
  // 4. Fall back to primaryImage
  const secondaryImage =
    defaultVariant?.images?.[1] ||
    allVariantImages[1] ||
    product.images?.[1] ||
    primaryImage;

  const price = defaultVariant ? product.basePrice + (defaultVariant.additionalPrice || 0) : product.basePrice;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;

    addToCart({
      productId: product.id,
      variantId: defaultVariant.id,
      productName: product.name,
      productSlug: product.slug || product.id,
      productImage: defaultVariant.images?.[0] || primaryImage || '/logo.png',
      color: defaultVariant.color || 'Standard',
      pattern: defaultVariant.pattern || '',
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#DFC598] transition-all duration-300 flex flex-col">
      {/* Product Image Container (Crisp, Balanced & Untinted) */}
      <Link to={`/products/${product.slug || product.id}`} className="relative aspect-square sm:aspect-[4/4.5] max-h-[250px] sm:max-h-[280px] overflow-hidden bg-[#FAF5EB] block">
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            {secondaryImage && secondaryImage !== primaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF5EB] text-[#7A223B]/60 p-4">
            <ShoppingBag className="w-10 h-10 mb-2 text-[#DFC598]" />
            <span className="text-[10px] uppercase tracking-widest font-medium text-[#7A223B]">Atelier Creation</span>
          </div>
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
          <Link to={`/products/${product.slug || product.id}`}>
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

