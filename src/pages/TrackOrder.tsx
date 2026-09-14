// src/pages/TrackOrder.tsx
import React, { useState } from 'react';
import { trackOrderApi } from '../lib/api';
import type { Order } from '../types';
import { Search, Truck, CheckCircle2, Clock, Package, AlertCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-2">
            Consignment Tracking
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#1C1612]">
            Track Your <span className="font-serif italic text-[#C5A059]">Delivery</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7063] font-light mt-2">
            Check live shipment dispatch and tracking status for your Sunbloom Adorn pieces.
          </p>
        </div>

        {/* Tracking Lookup Form */}
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs mb-10">
          <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                Order Number *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-2026-001"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5248] mb-1.5">
                Registered Mobile *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit mobile"
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs sm:text-sm text-[#1C1612] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1C1612] text-[#FEF3C7] text-xs font-semibold uppercase tracking-widest shadow-gold hover:bg-[#2A231D] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#D4AF37]" />
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
          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
              <div>
                <span className="text-xs text-[#8A7E72] block">Consignment Reference</span>
                <h3 className="font-heading text-2xl font-normal text-[#1C1612]">
                  #{order.orderNumber}
                </h3>
              </div>
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                {order.orderStatus || 'Confirmed'}
              </span>
            </div>

            {/* Carrier & Tracking Info */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-[#C5A059]" />
                <div>
                  <span className="text-xs font-semibold text-[#1C1612] block">
                    {order.trackingCarrier ? `Carrier: ${order.trackingCarrier}` : 'Dispatched via Express Insured Courier'}
                  </span>
                  <span className="text-xs text-[#8A7E72]">
                    {order.trackingNumber ? `AWB Tracking Number: ${order.trackingNumber}` : 'Tracking ID is being generated upon dispatch.'}
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
                  Live Courier Portal
                </a>
              )}
            </div>

            {/* Destination Summary */}
            <div className="text-xs text-[#5C5248] space-y-1">
              <span className="font-semibold text-[#1C1612] block">Destination:</span>
              <p>{order.customerName} • {order.city}, {order.state} - {order.pincode}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
