// src/pages/Orders.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCustomerOrdersApi } from '../lib/api';
import type { Order } from '../types';
import { Package, ChevronRight, ArrowRight, Clock, CheckCircle2, Truck } from 'lucide-react';

export const Orders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getCustomerOrdersApi(token);
        setOrders(res.orders || []);
      } catch (err: any) {
        setError(err.message || 'Unable to load orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>OUT FOR DELIVERY</span>
        </span>
      );
    }
    if (s === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>DELIVERED</span>
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <span>CANCELLED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
        <span>ORDER PLACED</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 pb-6 border-b border-[#E8DCCF]/60 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A223B] font-semibold block mb-1">
              Client Portal
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#2A1C19]">
              Order <span className="font-serif italic text-rose-gold-gradient">Consignments</span>
            </h1>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#7A223B] hover:text-[#5E182C] transition-colors font-medium"
          >
            <span>Explore Creations</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C9A86A]" />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-6 space-y-3 animate-pulse">
                <div className="h-4 bg-[#FAF6F0] rounded w-1/4"></div>
                <div className="h-6 bg-[#FAF6F0] rounded w-1/2"></div>
                <div className="h-4 bg-[#FAF6F0] rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl sm:rounded-3xl p-8 text-center">
            <p className="font-heading text-lg text-red-900 mb-2">Unable to retrieve orders</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-12 text-center max-w-md mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FDF2F5] border border-[#FCE7EC] flex items-center justify-center mx-auto text-[#7A223B]">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="font-heading text-2xl font-normal text-[#2A1C19]">
              No Orders Found
            </h2>
            <p className="text-xs text-[#7D6460] font-light">
              You haven't placed any orders yet. Once you complete a purchase, your consignment history will appear here.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="btn-rose-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold shadow-xs"
              >
                Explore Catalog
              </Link>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const dateStr = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] hover:border-[#DFC598] p-6 shadow-2xs hover:shadow-md transition-all duration-300 block"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FAF6F0]">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-[#2A1C19]">
                          #{order.orderNumber}
                        </span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <span className="text-xs text-[#A8928D] block mt-1">
                        Placed on {dateStr}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-[#A8928D] block">Total Amount</span>
                      <span className="font-heading text-xl font-medium text-[#7A223B]">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#5C4540]">
                      <Package className="w-4 h-4 text-[#C9A86A]" />
                      <span>{order.items?.length || 0} creation{(order.items?.length || 0) > 1 ? 's' : ''}</span>
                      {order.items?.[0] && (
                        <span className="text-[#A8928D] truncate max-w-xs hidden sm:inline">
                          — {order.items[0].productName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#7A223B] group-hover:translate-x-1 transition-transform">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 text-[#C9A86A]" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
