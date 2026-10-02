// src/pages/PaymentSuccess.tsx
// PayU redirects to /payment/success?order_id=ORD-xxx after a successful payment.
// This page verifies the order status from the backend and shows the customer a
// confirmation with their order number, amount, and a link to view order details.

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { checkPaymentStatusApi } from '../lib/api';
import { clearCart } from '../stores/cartStore';
import { CheckCircle2, XCircle, Clock, Package, ArrowRight } from 'lucide-react';

type State = 'checking' | 'success' | 'failed' | 'pending' | 'not-found';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // order_id from query string = orderNumber (e.g. ORD-1234567890)
  const orderId = searchParams.get('order_id') || '';

  const [state, setState] = useState<State>('checking');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const MAX_RETRIES = 8;
  const RETRY_INTERVAL_MS = 3000;

  const verify = async () => {
    if (!orderId) {
      setState('not-found');
      return;
    }

    try {
      const res = await checkPaymentStatusApi(orderId);

      if (res?.status === 'PAID') {
        clearCart();
        const num = res.orderNumber || orderId;
        setOrderNumber(num);
        if (res.totalAmount) setTotalAmount(res.totalAmount as any);
        setState('success');
        return;
      }

      if (res?.status === 'FAILED') {
        setState('failed');
        return;
      }

      // Still pending — retry
      if (retryCount < MAX_RETRIES) {
        setRetryCount((c) => c + 1);
      } else {
        setState('pending');
      }
    } catch {
      if (retryCount < MAX_RETRIES) {
        setRetryCount((c) => c + 1);
      } else {
        setState('pending');
      }
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (state === 'checking' || (retryCount > 0 && retryCount <= MAX_RETRIES)) {
      const delay = retryCount === 0 ? 600 : RETRY_INTERVAL_MS;
      timer = setTimeout(verify, delay);
    }
    return () => clearTimeout(timer);
  }, [retryCount, orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FCF9F5] px-4 py-16 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-8 sm:p-10 shadow-xs text-center relative z-10">

        {/* ── CHECKING ── */}
        {state === 'checking' && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-full border-[3px] border-[#DFC598]/40 border-t-[#7A223B] animate-spin mx-auto" />
            <h1 className="font-heading text-2xl font-normal text-[#2A1C19]">
              Confirming Your Payment
            </h1>
            <p className="text-xs text-[#7D6460] font-light">
              Verifying your transaction with PayU…
            </p>
            {retryCount > 0 && (
              <p className="text-[11px] text-[#A8928D]">
                Verification attempt {retryCount} of {MAX_RETRIES}…
              </p>
            )}
          </div>
        )}

        {/* ── SUCCESS ── */}
        {state === 'success' && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <div>
              <h1 className="font-heading text-2xl font-normal text-[#2A1C19]">
                Payment Successful!
              </h1>
              <p className="text-xs text-[#7D6460] mt-1">
                Thank you for your order. Your payment has been received.
              </p>
            </div>

            {orderNumber && (
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DCCF] text-xs space-y-1">
                <span className="text-[#A8928D] block">Order Number</span>
                <span className="font-mono font-bold text-[#7A223B] text-sm tracking-wider">{orderNumber}</span>
              </div>
            )}

            {totalAmount != null && (
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DCCF] text-xs space-y-1">
                <span className="text-[#A8928D] block">Amount Paid</span>
                <span className="font-bold text-[#2A1C19] text-base">
                  ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <p className="text-xs text-[#7D6460]">
              Your bespoke jewellery consignment has been placed successfully.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              {orderNumber && (
                <Link
                  to={`/order/${encodeURIComponent(orderNumber)}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7A223B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#5E182C] transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span>View My Order</span>
                </Link>
              )}
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-1 text-xs uppercase tracking-widest text-[#7A223B] hover:text-[#5E182C] transition-colors font-medium"
              >
                <span>All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ── FAILED ── */}
        {state === 'failed' && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-center mx-auto">
              <XCircle className="w-9 h-9 text-rose-600" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-[#2A1C19]">
              Payment Not Completed
            </h1>
            <p className="text-xs text-[#7D6460]">
              Your payment was declined or cancelled. No amount has been charged. Please try again.
            </p>
            <Link
              to="/payment"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7A223B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#5E182C] transition-colors"
            >
              Try Again
            </Link>
          </div>
        )}

        {/* ── PENDING / TIMEOUT ── */}
        {state === 'pending' && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center mx-auto">
              <Clock className="w-9 h-9 text-amber-500" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-[#2A1C19]">
              Payment Being Verified
            </h1>
            <p className="text-xs text-[#7D6460]">
              We are still verifying your payment. This can take a few minutes.
              If your bank was charged, your order will be confirmed and appear in your order history.
            </p>
            {orderId && (
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DCCF] text-xs space-y-1">
                <span className="text-[#A8928D] block">Reference</span>
                <span className="font-mono font-bold text-[#7A223B] text-sm">{orderId}</span>
              </div>
            )}
            <div className="flex flex-col gap-3 pt-1">
              <button
                onClick={() => { setRetryCount(0); setState('checking'); }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7A223B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#5E182C] transition-colors"
              >
                Check Again
              </button>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-1 text-xs uppercase tracking-widest text-[#7A223B] hover:text-[#5E182C] transition-colors font-medium"
              >
                <span>View Order History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ── NOT FOUND ── */}
        {state === 'not-found' && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto">
              <Package className="w-9 h-9 text-slate-400" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-[#2A1C19]">
              Order Not Found
            </h1>
            <p className="text-xs text-[#7D6460]">
              We could not find an order associated with this link.
              Please check your order history or contact support.
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7A223B] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#5E182C] transition-colors"
            >
              View Order History
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
