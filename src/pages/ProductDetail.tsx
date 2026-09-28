// src/pages/ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlugApi, getProductsApi } from '../lib/api';
import type { Product, Variant } from '../types';
import { addToCart, openCart } from '../stores/cartStore';
import { ProductCard } from '../components/products/ProductCard';
import { ShieldCheck, Sparkles, Truck, RefreshCw, ShoppingBag, ArrowLeft, Check } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        let prod: Product | null = null;
        try {
          prod = await getProductBySlugApi(slug);
        } catch {
          prod = null;
        }

        if (!prod || !prod.id) {
          setError('Product not found');
          return;
        }
        setProduct(prod);

        const defaultVar = prod.variants?.[0] || null;
        setSelectedVariant(defaultVar);

        const initialImg = defaultVar?.images?.[0] || prod.images?.[0] || '';
        setSelectedImage(initialImg);

        // Fetch related products from same category
        const allProds = await getProductsApi().catch(() => ({ products: [] }));
        const prodsList = allProds.products?.filter((p) => p.isActive) || [];
        const related = prodsList
          .filter((p) => p.id !== prod?.id && p.category === prod?.category)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err: any) {
        setError(err.message || 'Unable to load product');
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const isPatternValueValid = (p?: string | null): p is string => {
    if (!p) return false;
    const trimmed = p.trim();
    if (!trimmed) return false;
    return !/^(null|undefined|none|n\/a)$/i.test(trimmed);
  };

  const getCleanPattern = (v?: Variant | null) => {
    if (!v) return null;
    return isPatternValueValid(v.pattern) ? v.pattern.trim() : null;
  };

  const getVariantDisplay = (v: Variant) => {
    const pattern = getCleanPattern(v);
    const color = v.color && v.color.trim() && !/^(standard|default)$/i.test(v.color.trim()) ? v.color.trim() : null;

    if (pattern && color) {
      if (pattern.toLowerCase() === color.toLowerCase()) return pattern;
      return `${color} • ${pattern}`;
    }
    return pattern || color || v.color || 'Standard';
  };

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant);
    if (variant.images?.[0]) {
      setSelectedImage(variant.images[0]);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const price = product.basePrice + (selectedVariant.additionalPrice || 0);

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      productSlug: product.slug || product.id,
      productImage: selectedImage || selectedVariant.images?.[0] || product.images?.[0] || '',
      color: selectedVariant.color || 'Standard',
      pattern: getCleanPattern(selectedVariant) || '',
      quantity,
      unitPrice: price,
      totalPrice: price * quantity,
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
    openCart();
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FCF9F5]">
        <div className="w-12 h-12 rounded-full border-2 border-[#E69CB0]/40 border-t-[#8B2E4B] animate-spin mb-4"></div>
        <p className="font-heading text-sm text-[#8B2E4B] uppercase tracking-widest">
          Revealing Creation…
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FCF9F5] px-4">
        <div className="bg-white rounded-3xl border border-[#EADBCE] p-10 text-center max-w-md shadow-xs">
          <h2 className="font-heading text-2xl text-[#2A1C19] mb-2">Creation Not Found</h2>
          <p className="text-xs text-[#7D6460] mb-6">
            The piece you are looking for may have been retired or moved.
          </p>
          <Link
            to="/products"
            className="btn-rose-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? product.basePrice + (selectedVariant.additionalPrice || 0)
    : product.basePrice;

  const galleryImages = [
    ...(product.images || []),
    ...(product.variants?.flatMap((v) => v.images || []) || []),
  ].filter((img, idx, arr) => img && arr.indexOf(img) === idx);

  if (galleryImages.length === 0) {
    galleryImages.push('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800');
  }

  const isAvailable = selectedVariant?.isAvailable !== false && (selectedVariant?.stock ?? 1) > 0;

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-8 md:py-14 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full bg-[#F2E5CC]/30 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <div className="mb-5">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#7A223B] hover:text-[#5E152A] transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#DFC598]" />
            <span>Back to Collection</span>
          </Link>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left: Image Gallery (6 Cols with refined visual scale) */}
          <div className="lg:col-span-6 space-y-3.5 max-w-md sm:max-w-lg lg:max-w-[480px] mx-auto w-full">
            {/* Primary Featured Image */}
            <div className="aspect-square sm:aspect-4/5 max-h-[440px] sm:max-h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E8DCCF] shadow-xs relative flex items-center justify-center">
              <img
                src={selectedImage || galleryImages[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#DFC598]/60 text-[10px] uppercase tracking-widest text-[#7A223B] font-semibold shadow-2xs">
                18K Golden Lustre
              </div>
            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#7A223B] shadow-xs scale-102 ring-1 ring-[#DFC598]'
                        : 'border-[#E8DCCF] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Options (6 Cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-5 sm:p-7 shadow-xs space-y-5 lg:sticky lg:top-24">
            
            {/* Title & Category */}
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#7A223B] font-medium block mb-1.5">
                {product.category || 'Fine Jewellery'}
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-normal text-[#2A1C19] leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price & Availability */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 py-3 border-y border-[#F4ECE5]">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-2xl sm:text-3xl font-medium text-[#7A223B]">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#A8928D] font-light">Taxes included</span>
              </div>
              <span
                className={`text-xs px-3 py-0.5 rounded-full font-medium ${
                  isAvailable
                    ? 'bg-[#FAF0F4] text-[#7A223B] border border-[#DFC598]/50'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {isAvailable ? 'In Atelier Stock' : 'Currently Unavailable'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-[#5E4742] font-light leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Variants Selection */}
            {(() => {
              const allVariants = product.variants || [];
              const validPatterns = Array.from(
                new Set(allVariants.map(getCleanPattern).filter((p): p is string => p !== null))
              );
              const hasPatterns = validPatterns.length > 0;

              // If product has NO pattern and only 1 variant: do NOT show empty pattern selector or selection UI
              if (!hasPatterns && allVariants.length <= 1) {
                return null;
              }

              // If product has only 1 variant and it has a pattern: show the available pattern normally
              if (hasPatterns && allVariants.length === 1) {
                return (
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#5E4742]">
                      Pattern
                    </span>
                    <div className="inline-flex items-center px-3.5 py-2 rounded-xl border border-[#7A223B] bg-[#FAF0F4] text-xs font-medium text-[#7A223B]">
                      {validPatterns[0]}
                    </div>
                  </div>
                );
              }

              // Multiple variants: customer can switch between them
              const selectorTitle = hasPatterns && validPatterns.length === allVariants.length
                ? 'Select Pattern'
                : hasPatterns
                ? 'Select Pattern / Option'
                : 'Select Option';

              return (
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5E4742]">
                    {selectorTitle}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {allVariants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleVariantChange(v)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#7A223B] bg-[#FAF0F4] shadow-2xs ring-1 ring-[#7A223B]'
                              : 'border-[#E8DCCF] bg-[#FAF6F0] hover:border-[#DFC598]'
                          }`}
                        >
                          <span className="block text-xs font-medium text-[#2A1C19]">
                            {getVariantDisplay(v)}
                          </span>
                          {v.additionalPrice > 0 && (
                            <span className="text-[10px] text-[#7A223B] block mt-0.5 font-semibold">
                              +₹{v.additionalPrice}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Quantity Selector & Add to Bag (Slim, Refined) */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5E4742]">
                  Quantity
                </span>
                <div className="flex items-center border border-[#E8DCCF] rounded-xl bg-[#FAF6F0] p-0.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 rounded-lg text-sm text-[#2A1C19] hover:bg-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-xs font-semibold text-[#2A1C19]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg text-sm text-[#2A1C19] hover:bg-white flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full btn-rose-primary py-3 px-6 rounded-xl font-semibold text-xs uppercase tracking-[0.16em] shadow-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Added to Shopping Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#DFC598]" />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>
            </div>

            {/* Atelier Assurance Badges */}
            <div className="pt-3.5 border-t border-[#F4ECE5] grid grid-cols-2 gap-2.5 text-[11px] text-[#755B55]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>Waterproof 18K PVD</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>Anti-Tarnish Lifetime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>Insured Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#DFC598]" />
                <span>Hassle-Free Replacement</span>
              </div>
            </div>

          </div>

        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#E8DCCF]">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs uppercase tracking-[0.25em] text-[#7A223B] font-medium block mb-1">
                Harmonious Pairings
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-normal text-[#2A1C19]">
                Complete <span className="font-serif italic text-rose-gold-gradient">The Look</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
