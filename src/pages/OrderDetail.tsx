// src/pages/OrderDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCustomerOrderByIdApi, API_BASE_URL } from '../lib/api';
import type { Order } from '../types';
import { Package, ArrowLeft, CheckCircle2, Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

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
          // Public lookup fallback by order number or id
          const res = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(id)}`);
          if (!res.ok) throw new Error('Order not found');
          const data = await res.json();
          setOrder(data.order || data);
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF7F2]">
        <div className="w-12 h-12 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mb-4"></div>
        <p className="font-heading text-sm text-[#7D7063] uppercase tracking-widest">
          Loading Consignment…
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF7F2] px-4">
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-10 text-center max-w-md shadow-xs space-y-4">
          <h2 className="font-heading text-2xl text-[#1C1612]">Order Not Found</h2>
          <p className="text-xs text-[#7D7063]">
            We could not locate this consignment. Please check the order reference.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1612] text-[#FEF3C7] text-xs uppercase tracking-widest font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const dateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7D7063] hover:text-[#1C1612] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EAE1]">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium block mb-1">
                Order Consignment
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-normal text-[#1C1612]">
                #{order.orderNumber}
              </h1>
              <p className="text-xs text-[#8A7E72] mt-1">Placed on {dateFormatted}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                {order.paymentStatus === 'paid' ? 'Payment Confirmed' : order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Tracking Details if Dispatched */}
          {(order.trackingNumber || order.orderStatus === 'shipped' || order.orderStatus === 'delivered') && (
            <div className="mt-6 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <span className="text-xs font-semibold text-[#1C1612] block">
                    Dispatched via {order.trackingCarrier || 'Express Insured Courier'}
                  </span>
                  <span className="text-[11px] text-[#8A7E72] font-mono">
                    {order.trackingNumber ? `AWB Tracking: ${order.trackingNumber}` : 'Tracking number will be shared after courier handover.'}
                  </span>
                </div>
              </div>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-[#1C1612] text-[#FEF3C7] text-xs font-semibold uppercase tracking-widest text-center"
                >
                  Live Courier Tracking
                </a>
              )}
            </div>
          )}
        </div>

        {/* Consignment Items */}
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs mb-8 space-y-4">
          <h2 className="font-heading text-xl font-normal text-[#1C1612] pb-4 border-b border-[#F0EAE1]">
            Purchased Creations ({order.items?.length || 0})
          </h2>

          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 py-3 border-b border-[#F0EAE1] last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#E8E1D5] flex-shrink-0 flex items-center justify-center text-[#C5A059]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-normal text-[#1C1612]">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-[#8A7E72] mt-0.5">
                      Finish: {item.color} {item.pattern ? `• ${item.pattern}` : ''} × {item.quantity}
                    </p>
                  </div>
                </div>

                <span className="font-heading text-base sm:text-lg font-medium text-[#1C1612]">
                  ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-6 border-t border-[#F0EAE1] space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[#7D7063]">
              <span>Subtotal</span>
              <span className="font-medium text-[#1C1612]">₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#7D7063]">
              <span>Insured Shipping</span>
              <span className="font-medium text-[#1C1612]">
                {order.shippingCharge === 0 ? 'Complimentary' : `₹${order.shippingCharge}`}
              </span>
            </div>
            <div className="pt-2 flex justify-between items-baseline text-base font-bold text-[#1C1612]">
              <span>Total Paid</span>
              <span className="font-heading text-2xl font-normal">
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs">
          <h2 className="font-heading text-xl font-normal text-[#1C1612] pb-4 border-b border-[#F0EAE1] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C5A059]" />
            <span>Delivery Destination</span>
          </h2>
          <div className="pt-4 text-xs sm:text-sm text-[#5C5248] space-y-1">
            <p className="font-semibold text-[#1C1612]">{order.customerName}</p>
            <p>{order.deliveryAddress}</p>
            <p>{order.city}, {order.state} - {order.pincode}</p>
            <p className="text-[#8A7E72] pt-2">Contact: {order.customerPhone} • {order.customerEmail}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
