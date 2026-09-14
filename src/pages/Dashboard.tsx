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
        pattern: v.pattern || 'Classic',
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
      pattern: v.pattern || 'Classic',
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
    <div className="min-h-screen bg-[#FAF7F2] py-6 sm:py-8 md:py-10">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* ============================================================ */}
        {/* 1. DASHBOARD HERO BANNER (Refined luxury dark gradient)        */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-[#1C1612] via-[#2A231D] to-[#1C1612] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 text-white relative overflow-hidden shadow-md border border-[#3D332A]">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-xl">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans block mb-1.5">
              Customer Atelier
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-normal tracking-tight text-white mb-2.5">
              Welcome back, {getCustomerFirstName()}
            </h1>
            <p className="text-xs sm:text-[13px] text-[#D1C7BA] font-light leading-relaxed mb-5 max-w-lg">
              Explore our latest handcrafted pieces, monitor your bespoke orders, and discover new Korean luxury jewellery arrivals.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#1C1612] text-[11px] uppercase tracking-wider font-semibold hover:opacity-95 transition-all shadow-gold cursor-pointer"
              >
                Shop Products
              </Link>
              <Link
                to="/orders"
                className="px-5 py-2.5 rounded-full border border-[#5C5248] bg-[#1C1612]/60 text-[#FEF3C7] text-[11px] uppercase tracking-wider font-medium hover:bg-[#2A231D] hover:border-[#C5A059] transition-all cursor-pointer"
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
            className="bg-white hover:bg-[#FAF7F2] transition-all rounded-2xl p-4 sm:p-5 border border-[#E8E1D5] shadow-2xs flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#8A7E72] uppercase tracking-wider block font-medium mb-0.5">
                Bag Items
              </span>
              <span className="font-heading text-xl sm:text-2xl font-normal text-[#1C1612]">
                {cartItems.length}
              </span>
            </div>
          </button>

          <Link
            to="/orders"
            className="bg-white hover:bg-[#FAF7F2] transition-all rounded-2xl p-4 sm:p-5 border border-[#E8E1D5] shadow-2xs flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#8A7E72] uppercase tracking-wider block font-medium mb-0.5">
                Total Orders
              </span>
              <span className="font-heading text-xl sm:text-2xl font-normal text-[#1C1612]">
                {orders.length}
              </span>
            </div>
          </Link>

          <Link
            to="/orders"
            className="bg-white hover:bg-[#FAF7F2] transition-all rounded-2xl p-4 sm:p-5 border border-[#E8E1D5] shadow-2xs flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0 group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-[#8A7E72] uppercase tracking-wider block font-medium mb-0.5">
                Live Shipments
              </span>
              <span className="font-heading text-xl sm:text-2xl font-normal text-[#1C1612]">
                {liveShipmentsCount}
              </span>
            </div>
          </Link>
        </div>

        {/* ============================================================ */}
        {/* 3. FRESH ARRIVALS / RECENTLY ADDED ITEMS                      */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold block">
                Fresh Arrivals
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-normal text-[#1C1612]">
                Recently Added Items
              </h2>
            </div>
            <Link
              to="/products"
              className="text-[11px] sm:text-xs uppercase tracking-wider text-[#C5A059] hover:text-[#1C1612] transition-colors font-medium flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {(recentProducts.length > 0 ? recentProducts : products.slice(0, 3)).map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <Link to={`/products/${prod.slug}`} className="relative aspect-square overflow-hidden bg-[#F0EAE1] block">
                  <img
                    src={prod.images?.[0] || '/logo.png'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[#1C1612] text-[9px] uppercase tracking-wider font-semibold shadow-2xs">
                    New Creation
                  </span>
                </Link>
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-medium block mb-0.5">
                      {(prod as any).categoryDetails?.name || prod.category || 'Atelier Fine Jewellery'}
                    </span>
                    <Link to={`/products/${prod.slug}`}>
                      <h3 className="font-heading text-base sm:text-lg font-normal text-[#1C1612] group-hover:text-[#C5A059] transition-colors line-clamp-1 mb-1">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-[13px] font-semibold text-[#1C1612]">₹{prod.basePrice}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="mt-3.5 w-full py-2 rounded-full bg-[#1C1612] hover:bg-[#2A231D] text-[#FEF3C7] text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold block">
                Client Favorites
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-normal text-[#1C1612]">
                Top Selling Creations
              </h2>
            </div>
            <Link
              to="/products"
              className="text-[11px] sm:text-xs uppercase tracking-wider text-[#C5A059] hover:text-[#1C1612] transition-colors font-medium flex items-center gap-1 group"
            >
              <span>Explore Shop</span>
              <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {(topSellingProducts.length > 0 ? topSellingProducts : products.slice(0, 3)).map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <Link to={`/products/${prod.slug}`} className="relative aspect-square overflow-hidden bg-[#F0EAE1] block">
                  <img
                    src={prod.images?.[0] || '/logo.png'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#1C1612]/90 backdrop-blur-md text-[#FEF3C7] text-[9px] uppercase tracking-wider font-semibold shadow-2xs">
                    Popular
                  </span>
                </Link>
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#C5A059] font-medium block mb-0.5">
                      {(prod as any).categoryDetails?.name || prod.category || 'Haute Jewellery'}
                    </span>
                    <Link to={`/products/${prod.slug}`}>
                      <h3 className="font-heading text-base sm:text-lg font-normal text-[#1C1612] group-hover:text-[#C5A059] transition-colors line-clamp-1 mb-1">
                        {prod.name}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-[13px] font-semibold text-[#1C1612]">₹{prod.basePrice}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="mt-3.5 w-full py-2 rounded-full bg-[#1C1612] hover:bg-[#2A231D] text-[#FEF3C7] text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E1D5]">
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-semibold block">
                Curated Collections
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-normal text-[#1C1612]">
                Categories
              </h2>
            </div>
            <Link
              to="/categories"
              className="text-[11px] sm:text-xs uppercase tracking-wider text-[#C5A059] hover:text-[#1C1612] transition-colors font-medium flex items-center gap-1 group"
            >
              <span>All Categories</span>
              <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-4/3 border border-[#E8E1D5] text-left p-3.5 sm:p-4 flex flex-col justify-end shadow-2xs hover:shadow-md transition-all cursor-pointer block"
              >
                <img
                  src={cat.image || '/logo.png'}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1612]/80 via-[#1C1612]/30 to-transparent"></div>
                <div className="relative z-10 text-white">
                  <h4 className="font-heading text-sm sm:text-base font-normal tracking-wide text-white group-hover:text-[#FEF3C7] transition-colors">
                    {cat.name}
                  </h4>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#C5A059] font-medium flex items-center gap-1 mt-0.5">
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
        <div className="fixed inset-0 z-50 bg-[#1C1612]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E1D5] max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E1D5]">
              <h3 className="font-heading text-lg font-normal text-[#1C1612]">
                Select Atelier Variant
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="text-[#8A7E72] hover:text-[#1C1612] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={selectedProductForModal.images?.[0] || '/logo.png'}
                alt={selectedProductForModal.name}
                className="w-16 h-16 rounded-2xl object-cover bg-[#F0EAE1]"
              />
              <div>
                <h4 className="font-heading text-sm font-normal text-[#1C1612]">
                  {selectedProductForModal.name}
                </h4>
                <p className="text-xs text-[#8A7E72] mt-0.5">
                  Base Price: ₹{selectedProductForModal.basePrice}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248]">
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
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1C1612] bg-[#FAF7F2] shadow-xs'
                          : 'border-[#E8E1D5] hover:border-[#C5A059]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#1C1612] bg-[#1C1612]' : 'border-[#8A7E72]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#FEF3C7]"></div>}
                        </div>
                        <span className="text-xs font-medium text-[#1C1612]">
                          {v.color || 'Standard'} {v.pattern ? `• ${v.pattern}` : ''}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#1C1612]">₹{price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="flex-1 py-3 rounded-full border border-[#E8E1D5] text-xs font-semibold uppercase tracking-wider text-[#5C5248] hover:bg-[#FAF7F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModalAddToCart}
                className="flex-1 py-3 rounded-full bg-[#1C1612] text-[#FEF3C7] text-xs font-semibold uppercase tracking-widest shadow-gold hover:bg-[#2A231D] cursor-pointer"
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
