// src/pages/TrackOrder.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { trackOrderApi } from '../lib/api';
import type { Order } from '../types';
import { Search, Truck, CheckCircle2, Circle, Package, AlertCircle, ExternalLink, Clock, ArrowRight } from 'lucide-react';

export const TrackOrder: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please provide both Order Number and registered Mobile Phone.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await trackOrderApi(orderNumber.trim(), phone.trim());
      if (res?.order) {
        setOrder(res.order);
      } else {
        setError('No consignment matching this Order Number and Mobile was found.');
      }
    } catch (err: any) {
      setError(err.message || 'No matching consignment found. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const status = (order?.orderStatus || order?.status || '').toLowerCase();
  const isOrderPlaced = true;
  const isOutForDelivery = status === 'shipped' || status === 'delivered';
  const isDelivered = status === 'delivered';
  const isCancelled = status === 'cancelled';

  const getStatusLabel = () => {
    if (isCancelled) return 'CANCELLED';
    if (isDelivered) return 'DELIVERED';
    if (isOutForDelivery) return 'OUT FOR DELIVERY';
    return 'ORDER PLACED';
  };

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-10 md:py-16 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A223B] font-semibold block mb-2">
            Order Delivery Tracking
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#2A1C19]">
            Track Your <span className="font-serif italic text-rose-gold-gradient">Order</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7D6460] font-light mt-2">
            Check official delivery stages and courier tracking link for your Sunbloom Adorn order.
          </p>
        </div>

        {/* Tracking Lookup Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-6 sm:p-8 shadow-xs mb-10">
          <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                Order Number *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-1741234567890"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C4540] mb-1.5">
                Registered Mobile *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit mobile"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B]"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-rose-primary w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-widest shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#DFC598]" />
                    <span>Track</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tracking Result Card */}
        {order && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FAF6F0]">
              <div>
                <span className="text-xs text-[#A8928D] block">Order Reference</span>
                <h3 className="font-heading text-2xl font-normal text-[#2A1C19]">
                  #{order.orderNumber}
                </h3>
              </div>
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FDF2F5] text-[#7A223B] border border-[#FCE7EC] self-start sm:self-auto">
                {getStatusLabel()}
              </span>
            </div>

            {/* 3-Stage Delivery Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-[#7A223B] font-semibold">
                Delivery Stages
              </h4>

              {isCancelled ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  This order has been cancelled.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {/* Stage 1: Order Placed */}
                  <div className="p-3.5 rounded-xl border bg-[#FDFBF7] border-[#DFC598]">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-heading text-xs font-semibold text-[#2A1C19]">
                        Order Placed
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D6460] pl-6">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Stage 2: Out for Delivery */}
                  <div className={`p-3.5 rounded-xl border ${
                    isOutForDelivery ? 'bg-[#FDFBF7] border-[#DFC598]' : 'bg-gray-50/70 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isOutForDelivery ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      <span className={`font-heading text-xs font-semibold ${isOutForDelivery ? 'text-[#2A1C19]' : 'text-gray-500'}`}>
                        Out for Delivery
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D6460] pl-6">
                      {isOutForDelivery && order.shippedAt ? formatDate(order.shippedAt) : 'Pending'}
                    </p>
                  </div>

                  {/* Stage 3: Delivered */}
                  <div className={`p-3.5 rounded-xl border ${
                    isDelivered ? 'bg-[#FDFBF7] border-[#DFC598]' : 'bg-gray-50/70 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isDelivered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                      <span className={`font-heading text-xs font-semibold ${isDelivered ? 'text-[#2A1C19]' : 'text-gray-500'}`}>
                        Delivered
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D6460] pl-6">
                      {isDelivered && order.deliveredAt ? formatDate(order.deliveredAt) : 'Pending'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Courier Tracking Section */}
            {order.trackingUrl ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF6F0] to-white border border-[#DFC598] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[#7A223B]">
                    <Truck className="w-4 h-4 text-[#C9A86A]" />
                    <span className="font-heading text-sm font-semibold text-[#2A1C19]">Courier Tracking</span>
                  </div>
                  <p className="text-xs text-[#7D6460]">Your courier tracking link is available.</p>
                  {order.trackingCarrier && (
                    <p className="text-[11px] text-[#A8928D]">
                      Carrier: <span className="font-medium text-[#2A1C19]">{order.trackingCarrier}</span>
                      {order.trackingNumber ? ` • AWB: ${order.trackingNumber}` : ''}
                    </p>
                  )}
                </div>
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-rose-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold shadow-xs"
                >
                  <span>TRACK SHIPMENT</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF6F0]/60 border border-[#E8DCCF] flex items-center gap-2.5 text-xs text-[#7D6460]">
                <Clock className="w-4 h-4 text-[#C9A86A] shrink-0" />
                <span>Tracking information will be available once provided by the courier.</span>
              </div>
            )}

            {/* Destination Summary & Link to Order Detail */}
            <div className="pt-2 border-t border-[#FAF6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5C4540]">
              <div>
                <span className="font-semibold text-[#2A1C19]">Delivery Destination: </span>
                <span>{order.customerName} • {order.city}, {order.state} - {order.pincode}</span>
              </div>
              <Link
                to={`/orders/${order.orderNumber}`}
                className="inline-flex items-center gap-1 font-semibold text-[#7A223B] hover:underline"
              >
                <span>Full Order Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;
