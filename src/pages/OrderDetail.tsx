// src/pages/OrderDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCustomerOrderByIdApi, API_BASE_URL } from '../lib/api';
import type { Order } from '../types';
import { Package, ArrowLeft, CheckCircle2, Truck, Clock, MapPin, ExternalLink, Circle } from 'lucide-react';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        if (token) {
          const res = await getCustomerOrderByIdApi(id, token);
          setOrder(res);
        } else {
          // Lookup fallback by order number or id
          const res = await fetch(`${API_BASE_URL}/api/orders/by-number/${encodeURIComponent(id)}`);
          if (!res.ok) {
            const fallbackRes = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(id)}`);
            if (!fallbackRes.ok) throw new Error('Order not found');
            const data = await fallbackRes.json();
            setOrder(data.order || data);
          } else {
            const data = await res.json();
            setOrder(data.order || data);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve order details');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FCF9F5]">
        <div className="w-12 h-12 rounded-full border-2 border-[#DFC598]/40 border-t-[#7A223B] animate-spin mb-4"></div>
        <p className="font-heading text-sm text-[#7A223B] uppercase tracking-widest">
          Loading Order Details…
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FCF9F5] px-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-8 sm:p-10 text-center max-w-md shadow-xs space-y-4">
          <h2 className="font-heading text-2xl text-[#2A1C19]">Order Not Found</h2>
          <p className="text-xs text-[#7D6460]">
            We could not locate this order. Please check the reference or log in to view your orders.
          </p>
          <Link
            to="/orders"
            className="btn-rose-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>
    );
  }

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

  const status = (order.orderStatus || order.status || '').toLowerCase();
  const isOrderPlaced = true; // Always achieved once placed
  const isOutForDelivery = status === 'shipped' || status === 'delivered';
  const isDelivered = status === 'delivered';
  const isCancelled = status === 'cancelled';

  return (
    <div className="min-h-screen bg-[#FCF9F5] py-10 md:py-16 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A223B] hover:text-[#5E182C] transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FAF6F0]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A223B] font-semibold block mb-1">
                Order Reference
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-normal text-[#2A1C19]">
                #{order.orderNumber}
              </h1>
              <p className="text-xs text-[#A8928D] mt-1">Placed on {formatDate(order.createdAt)}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FDF2F5] text-[#7A223B] border border-[#FCE7EC]">
                {order.paymentStatus === 'paid' ? 'Payment Confirmed' : order.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>

          {/* 3-Stage Delivery Timeline (Authoritative Sunbloom Adorn Delivery Workflow) */}
          <div className="pt-6">
            <h2 className="text-xs uppercase tracking-widest text-[#7A223B] font-semibold mb-6">
              Delivery Stages
            </h2>

            {isCancelled ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                This order has been cancelled.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
                {/* Stage 1: Order Placed */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isOrderPlaced ? 'bg-[#FDFBF7] border-[#DFC598] shadow-xs' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    {isOrderPlaced ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                    <span className="font-heading text-sm font-semibold text-[#2A1C19]">
                      Order Placed
                    </span>
                  </div>
                  <p className="text-xs text-[#7D6460] pl-7">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Stage 2: Out for Delivery */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isOutForDelivery ? 'bg-[#FDFBF7] border-[#DFC598] shadow-xs' : 'bg-gray-50/70 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    {isOutForDelivery ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                    <span className={`font-heading text-sm font-semibold ${isOutForDelivery ? 'text-[#2A1C19]' : 'text-gray-500'}`}>
                      Out for Delivery
                    </span>
                  </div>
                  <p className="text-xs text-[#7D6460] pl-7">
                    {isOutForDelivery && order.shippedAt ? formatDate(order.shippedAt) : 'Pending'}
                  </p>
                </div>

                {/* Stage 3: Delivered */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDelivered ? 'bg-[#FDFBF7] border-[#DFC598] shadow-xs' : 'bg-gray-50/70 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    {isDelivered ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                    <span className={`font-heading text-sm font-semibold ${isDelivered ? 'text-[#2A1C19]' : 'text-gray-500'}`}>
                      Delivered
                    </span>
                  </div>
                  <p className="text-xs text-[#7D6460] pl-7">
                    {isDelivered && order.deliveredAt ? formatDate(order.deliveredAt) : 'Pending'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Courier Tracking Section */}
        {order.trackingUrl ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#DFC598] p-6 sm:p-8 shadow-xs mb-8 bg-gradient-to-br from-white to-[#FDFBF7]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#7A223B]">
                  <Truck className="w-5 h-5 text-[#C9A86A]" />
                  <h3 className="font-heading text-lg font-semibold text-[#2A1C19]">Courier Tracking</h3>
                </div>
                <p className="text-xs text-[#7D6460]">
                  Your courier tracking link is available.
                </p>
                {order.trackingCarrier && (
                  <p className="text-[11px] text-[#A8928D]">
                    Courier: <span className="font-medium text-[#2A1C19]">{order.trackingCarrier}</span>
                    {order.trackingNumber ? ` • AWB: ${order.trackingNumber}` : ''}
                  </p>
                )}
              </div>

              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-rose-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
              >
                <span>TRACK SHIPMENT</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-[#FAF6F0]/60 rounded-2xl border border-[#E8DCCF] p-4 sm:p-5 mb-8 flex items-center gap-3 text-xs text-[#7D6460]">
            <Clock className="w-4 h-4 text-[#C9A86A] flex-shrink-0" />
            <span>Tracking information will be available once provided by the courier.</span>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-6 sm:p-8 shadow-xs mb-8 space-y-4">
          <h2 className="font-heading text-xl font-normal text-[#2A1C19] pb-4 border-b border-[#FAF6F0]">
            Purchased Items ({order.items?.length || 0})
          </h2>

          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 py-3 border-b border-[#FAF6F0] last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-[#FAF6F0] rounded-xl overflow-hidden border border-[#E8DCCF] flex-shrink-0 flex items-center justify-center text-[#7A223B]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-normal text-[#2A1C19]">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-[#A8928D] mt-0.5">
                      Finish: {item.color} {item.pattern ? `• ${item.pattern}` : ''} × {item.quantity}
                    </p>
                  </div>
                </div>

                <span className="font-heading text-base sm:text-lg font-medium text-[#7A223B]">
                  ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-6 border-t border-[#FAF6F0] space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[#7D6460]">
              <span>Subtotal</span>
              <span className="font-medium text-[#2A1C19]">₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#7D6460]">
              <span>Shipping Charge</span>
              <span className="font-medium text-[#2A1C19]">
                {order.shippingCharge === 0 ? 'Complimentary' : `₹${order.shippingCharge}`}
              </span>
            </div>
            <div className="pt-2 flex justify-between items-baseline text-base font-bold text-[#2A1C19]">
              <span>Total Amount</span>
              <span className="font-heading text-2xl font-normal text-[#7A223B]">
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-6 sm:p-8 shadow-xs">
          <h2 className="font-heading text-xl font-normal text-[#2A1C19] pb-4 border-b border-[#FAF6F0] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#7A223B]" />
            <span>Delivery Address</span>
          </h2>
          <div className="pt-4 text-xs sm:text-sm text-[#5C4540] space-y-1">
            <p className="font-semibold text-[#2A1C19]">{order.customerName}</p>
            <p>{order.deliveryAddress}</p>
            <p>{order.city}, {order.state} - {order.pincode}</p>
            <p className="text-[#A8928D] pt-2">Contact: {order.customerPhone} • {order.customerEmail}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetail;
