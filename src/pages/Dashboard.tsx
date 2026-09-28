// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '@nanostores/react';
import { $cartItems, addToCart, toggleCart } from '../stores/cartStore';
import { getProductsApi, getCategoriesApi, getCustomerOrdersApi } from '../lib/api';
import type { Product, Category, Order, CartItem } from '../types';
import {
  ShoppingBag,
  Package,
  Truck,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Layers,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, profile, token } = useAuth();
  const cartItems = useStore($cartItems);
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Variant Modal
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [chosenVariantId, setChosenVariantId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes, recentRes, topRes] = await Promise.all([
          getProductsApi().catch(() => ({ products: [] })),
          getCategoriesApi().catch(() => ({ categories: [] })),
          fetch('/api/products/featured/recent')
            .then((r) => (r.ok ? r.json() : { products: [] }))
            .catch(() => ({ products: [] })),
          fetch('/api/products/featured/top-selling')
            .then((r) => (r.ok ? r.json() : { products: [] }))
            .catch(() => ({ products: [] })),
        ]);

        const activeProds = (prodRes.products || []).filter((p: Product) => p.isActive);
        setProducts(activeProds);
        setCategories(catRes.categories || []);
        setRecentProducts(recentRes.products || activeProds.slice(0, 3));
        setTopSellingProducts(topRes.products || activeProds.slice(0, 3));

        if (token) {
          const ordRes = await getCustomerOrdersApi(token).catch(() => ({ orders: [] }));
          setOrders(ordRes.orders || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const getCustomerFirstName = () => {
    if (profile?.name) {
      const parts = profile.name.trim().split(/\s+/);
      if (parts.length > 1 && parts[0].replace(/[.,]/g, '').length <= 1) {
        return parts[1].replace(/[.,]/g, '') || 'Client';
      }
      return parts[0].replace(/[.,]/g, '') || 'Client';
    }
    if (user?.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length > 1 && parts[0].replace(/[.,]/g, '').length <= 1) {
        return parts[1].replace(/[.,]/g, '') || 'Client';
      }
      return parts[0].replace(/[.,]/g, '') || 'Client';
    }
    if (user?.email) {
      const localPart = user.email.split('@')[0].split('.')[0];
      return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
    return 'Client';
  };

  const handleAddToCart = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return;

    if (product.variants.length === 1) {
      const v = product.variants[0];
      const item: CartItem = {
        productId: product.id,
        variantId: v.id,
        productName: product.name,
        productSlug: product.slug,
        color: v.color || 'Standard',
        pattern: v.pattern || '',
        quantity: 1,
        unitPrice: product.basePrice + (v.additionalPrice || 0),
        totalPrice: product.basePrice + (v.additionalPrice || 0),
        productImage: v.images?.[0] || product.images?.[0] || '/logo.png',
      };
      addToCart(item);
    } else {
      setSelectedProductForModal(product);
      setChosenVariantId(product.variants[0].id);
    }
  };

  const confirmModalAddToCart = () => {
    if (!selectedProductForModal) return;
    const v = selectedProductForModal.variants.find((item) => item.id === chosenVariantId);
    if (!v) return;

    const item: CartItem = {
      productId: selectedProductForModal.id,
      variantId: v.id,
      productName: selectedProductForModal.name,
      productSlug: selectedProductForModal.slug,
      color: v.color || 'Standard',
      pattern: v.pattern || '',
      quantity: 1,
      unitPrice: selectedProductForModal.basePrice + (v.additionalPrice || 0),
      totalPrice: selectedProductForModal.basePrice + (v.additionalPrice || 0),
      productImage: v.images?.[0] || selectedProductForModal.images?.[0] || '/logo.png',
    };
    addToCart(item);
    setSelectedProductForModal(null);
  };

  const liveShipmentsCount = orders.filter(
    (o: any) =>
      o.orderStatus === 'shipped' ||
      o.orderStatus === 'processing' ||
      o.orderStatus === 'confirmed' ||
      o.status === 'SHIPPED' ||
      o.status === 'PROCESSING' ||
      o.status === 'CONFIRMED'
  ).length;

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-6 sm:py-8 md:py-10">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* ============================================================ */}
        {/* 1. DASHBOARD HERO BANNER (Refined luxury rose-gold)           */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-[#7A223B] via-[#8B2E4B] to-[#5E182C] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white relative overflow-hidden shadow-md border border-[#DFC598]/30">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#DFC598]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/3 w-60 h-60 bg-[#FCE7EC]/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#DFC598] font-semibold font-sans block mb-1.5">
              Customer Atelier
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-normal tracking-tight text-white mb-2.5">
              Welcome back, <span className="text-champagne-gradient font-serif italic">{getCustomerFirstName()}</span>
            </h1>
            <p className="text-xs sm:text-[13px] text-[#FDF2F5]/90 font-light leading-relaxed mb-6 max-w-lg">
              Explore our latest handcrafted pieces, monitor your bespoke orders, and discover new Korean luxury jewellery arrivals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DFC598] to-[#C9A86A] text-[#2A1C19] text-[11px] uppercase tracking-wider font-semibold hover:opacity-95 transition-all shadow-xs cursor-pointer"
              >
                Shop Products
              </Link>
              <Link
                to="/orders"
                className="px-5 py-2.5 rounded-xl border border-[#DFC598]/50 bg-white/10 text-[#FFF6FA] text-[11px] uppercase tracking-wider font-medium hover:bg-white/20 transition-all cursor-pointer backdrop-blur-xs"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. QUICK METRICS ROW (3 Refined Cards)                        */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
          <button
            type="button"
            onClick={toggleCart}
            className="bg-white hover:bg-[#FAF6F0]/60 transition-all rounded-2xl p-4 sm:p-5 border border-[#E8DCCF] shadow-2xs flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FDF2F5] border border-[#FCE7EC] flex items-center justify-center text-[#7A223B] shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#A8928D] uppercase tracking-wider block font-semibold mb-0.5">
                Bag Items
              </span>
              <span className="font-heading text-xl sm:text-2xl font-normal text-[#2A1C19]">
                {cartItems.length}
              </span>
            </div>
          </button>

          <Link
            to="/orders"
            className="bg-white hover:bg-[#FAF6F0]/60 transition-all rounded-2xl p-4 sm:p-5 border border-[#E8DCCF] shadow-2xs flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF5EB] border border-[#DFC598]/40 flex items-center justify-center text-[#C9A86A] shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#A8928D] uppercase tracking-wider block font-semibold mb-0.5">
                Total Orders
              </span>
              <span className="font-heading text-xl sm:text-2xl font-normal text-[#2A1C19]">
                {orders.length}
              </span>
            </div>
          </Link>

          <Link
            to="/orders"
            className="bg-white hover:bg-[#FAF6F0]/60 transition-all rounded-2xl p-4 sm:p-5 border border-[#E8DCCF] shadow-2xs flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF5EB] border border-[#DFC598]/40 flex items-center justify-center text-[#C9A86A] shrink-0 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#A8928D] uppercase tracking-wider block font-semibold mb-0.5">
                Live Shipments
              </span>
              <span className="font-heading text-xl sm:text-2xl font-normal text-[#2A1C19]">
                {liveShipmentsCount}
              </span>
            </div>
          </Link>
        </div>

        {/* ============================================================ */}
        {/* 3. FRESH ARRIVALS / RECENTLY ADDED ITEMS                      */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCF]/60">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A223B] font-semibold block">
                Fresh Arrivals
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-normal text-[#2A1C19]">
                Recently Added <span className="font-serif italic text-rose-gold-gradient">Items</span>
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs uppercase tracking-wider text-[#7A223B] hover:text-[#5E182C] transition-colors font-medium flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-[#C9A86A]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {(recentProducts.length > 0 ? recentProducts : products.slice(0, 3)).map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] overflow-hidden shadow-2xs hover:border-[#DFC598] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <Link to={`/products/${prod.slug}`} className="relative aspect-square overflow-hidden bg-[#FAF6F0] block">
                  <img
                    src={prod.images?.[0] || '/logo.png'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#7A223B] border border-[#FCE7EC] text-[9px] uppercase tracking-wider font-semibold shadow-2xs">
                    New Creation
                  </span>
                </Link>
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#A8928D] font-medium block mb-0.5">
                      {(prod as any).categoryDetails?.name || prod.category || 'Atelier Fine Jewellery'}
                    </span>
                    <Link to={`/products/${prod.slug}`}>
                      <h3 className="font-heading text-base sm:text-lg font-normal text-[#2A1C19] group-hover:text-[#7A223B] transition-colors line-clamp-1 mb-1">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-[13px] font-semibold text-[#7A223B]">₹{prod.basePrice}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="btn-rose-primary mt-3.5 w-full py-2.5 rounded-xl text-[11px] uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. CLIENT FAVORITES / TOP SELLING CREATIONS                   */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCF]/60">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A223B] font-semibold block">
                Client Favorites
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-normal text-[#2A1C19]">
                Top Selling <span className="font-serif italic text-rose-gold-gradient">Creations</span>
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs uppercase tracking-wider text-[#7A223B] hover:text-[#5E182C] transition-colors font-medium flex items-center gap-1 group"
            >
              <span>Explore Shop</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-[#C9A86A]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {(topSellingProducts.length > 0 ? topSellingProducts : products.slice(0, 3)).map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] overflow-hidden shadow-2xs hover:border-[#DFC598] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <Link to={`/products/${prod.slug}`} className="relative aspect-square overflow-hidden bg-[#FAF6F0] block">
                  <img
                    src={prod.images?.[0] || '/logo.png'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#FAF5EB] text-[#7A223B] border border-[#DFC598]/50 text-[9px] uppercase tracking-wider font-semibold shadow-2xs">
                    Popular
                  </span>
                </Link>
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#A8928D] font-medium block mb-0.5">
                      {(prod as any).categoryDetails?.name || prod.category || 'Haute Jewellery'}
                    </span>
                    <Link to={`/products/${prod.slug}`}>
                      <h3 className="font-heading text-base sm:text-lg font-normal text-[#2A1C19] group-hover:text-[#7A223B] transition-colors line-clamp-1 mb-1">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-[13px] font-semibold text-[#7A223B]">₹{prod.basePrice}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="btn-rose-primary mt-3.5 w-full py-2.5 rounded-xl text-[11px] uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. CURATED COLLECTIONS / CATEGORIES                           */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DCCF]/60">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A223B] font-semibold block">
                Curated Collections
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-normal text-[#2A1C19]">
                Atelier <span className="font-serif italic text-rose-gold-gradient">Categories</span>
              </h2>
            </div>
            <Link
              to="/categories"
              className="text-xs uppercase tracking-wider text-[#7A223B] hover:text-[#5E182C] transition-colors font-medium flex items-center gap-1 group"
            >
              <span>All Categories</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-[#C9A86A]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-4/3 border border-[#E8DCCF] text-left p-3.5 sm:p-4 flex flex-col justify-end shadow-2xs hover:border-[#DFC598] hover:shadow-md transition-all cursor-pointer block"
              >
                <img
                  src={cat.image || '/logo.png'}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A1C19]/75 via-[#2A1C19]/25 to-transparent"></div>
                <div className="relative z-10 text-white">
                  <h4 className="font-heading text-sm sm:text-base font-normal tracking-wide text-white group-hover:text-[#DFC598] transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#DFC598] font-medium flex items-center gap-1 mt-0.5">
                    <span>Explore</span>
                    <ArrowRight className="w-2.5 h-2.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* ============================================================ */}
      {/* 6. QUICK VARIANT SELECTION MODAL                             */}
      {/* ============================================================ */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 bg-[#2A1C19]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8DCCF]/60">
              <h3 className="font-heading text-lg font-normal text-[#2A1C19]">
                Select Atelier Variant
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="text-[#A8928D] hover:text-[#2A1C19] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={selectedProductForModal.images?.[0] || '/logo.png'}
                alt={selectedProductForModal.name}
                className="w-16 h-16 rounded-xl object-cover bg-[#FAF6F0] border border-[#E8DCCF]"
              />
              <div>
                <h4 className="font-heading text-sm font-normal text-[#2A1C19]">
                  {selectedProductForModal.name}
                </h4>
                <p className="text-xs text-[#7A223B] font-semibold mt-0.5">
                  Base Price: ₹{selectedProductForModal.basePrice}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540]">
                Available Options
              </label>
              <div className="space-y-2">
                {selectedProductForModal.variants.map((v) => {
                  const isSelected = chosenVariantId === v.id;
                  const price = selectedProductForModal.basePrice + (v.additionalPrice || 0);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setChosenVariantId(v.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7A223B] bg-[#FDF2F5] shadow-xs'
                          : 'border-[#E8DCCF] hover:border-[#DFC598] bg-[#FAF6F0]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#7A223B] bg-[#7A223B]' : 'border-[#A8928D]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-xs font-medium text-[#2A1C19]">
                          {v.color || 'Standard'} {v.pattern ? `• ${v.pattern}` : ''}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#7A223B]">₹{price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="btn-ivory-secondary flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#5C4540] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModalAddToCart}
                className="btn-rose-primary flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest cursor-pointer shadow-xs"
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
