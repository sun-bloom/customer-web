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
        const prod = await getProductBySlugApi(slug);
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
        const related = allProds.products
          .filter((p) => p.id !== prod.id && p.category === prod.category)
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
      productSlug: product.slug,
      productImage: selectedImage || selectedVariant.images?.[0] || product.images?.[0] || '',
      color: selectedVariant.color || 'Standard',
      pattern: selectedVariant.pattern || 'Classic',
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF7F2]">
        <div className="w-12 h-12 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mb-4"></div>
        <p className="font-heading text-sm text-[#7D7063] uppercase tracking-widest">
          Revealing Creation…
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF7F2] px-4">
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-10 text-center max-w-md shadow-xs">
          <h2 className="font-heading text-2xl text-[#1C1612] mb-2">Creation Not Found</h2>
          <p className="text-xs text-[#7D7063] mb-6">
            The piece you are looking for may have been retired or moved.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1612] text-[#FEF3C7] text-xs uppercase tracking-widest font-semibold"
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
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7D7063] hover:text-[#1C1612] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Collection</span>
          </Link>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Featured Image */}
            <div className="aspect-4/5 rounded-3xl overflow-hidden bg-white border border-[#E8E1D5] shadow-xs relative">
              <img
                src={selectedImage || galleryImages[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#E8E1D5] text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">
                18K Golden Lustre
              </div>
            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#C5A059] shadow-gold scale-102'
                        : 'border-[#E8E1D5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Options (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8E1D5] p-5 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-24">
            
            {/* Title & Category */}
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-2">
                {product.category || 'Fine Jewellery'}
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-normal text-[#1C1612] leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price & Availability */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 py-3 border-y border-[#F0EAE1]">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-3xl font-medium text-[#1C1612]">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#8A7E72] font-light">Taxes included</span>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {isAvailable ? 'In Atelier Stock' : 'Currently Unavailable'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-[#5C5248] font-light leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248]">
                  Select Finish / Variant
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleVariantChange(v)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#C5A059] bg-[#FEF3C7]/20 shadow-2xs ring-1 ring-[#C5A059]'
                            : 'border-[#E8E1D5] bg-[#FAF7F2] hover:border-[#C5A059]/50'
                        }`}
                      >
                        <span className="block text-xs font-medium text-[#1C1612]">
                          {v.color || 'Standard'} {v.pattern ? `(${v.pattern})` : ''}
                        </span>
                        {v.additionalPrice > 0 && (
                          <span className="text-[10px] text-[#C5A059] block mt-0.5">
                            +₹{v.additionalPrice}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Bag */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5248]">
                  Quantity
                </span>
                <div className="flex items-center border border-[#E8E1D5] rounded-xl bg-[#FAF7F2] p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg text-sm text-[#1C1612] hover:bg-white flex items-center justify-center disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-[#1C1612]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg text-sm text-[#1C1612] hover:bg-white flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full bg-[#1C1612] text-[#FEF3C7] hover:bg-[#2A231D] disabled:bg-[#8A7E72] disabled:cursor-not-allowed py-4 px-6 rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] shadow-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Shopping Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>
            </div>

            {/* Atelier Assurance Badges */}
            <div className="pt-4 border-t border-[#F0EAE1] grid grid-cols-2 gap-3 text-[11px] text-[#7D7063]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Waterproof 18K PVD</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Anti-Tarnish Lifetime</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Insured Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Hassle-Free Replacement</span>
              </div>
            </div>

          </div>

        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8E1D5]">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-1">
                Harmonious Pairings
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-normal text-[#1C1612]">
                Complete <span className="font-serif italic text-[#C5A059]">The Look</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
