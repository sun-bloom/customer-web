// src/pages/PaymentPending.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { checkRazorpayStatusApi, getOrderByRzpIdApi } from '../lib/api';
import { clearCart } from '../stores/cartStore';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const PaymentPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Support both rzp_order_id (new) and cf_order_id (legacy redirect fallback)
  const rzpOrderId = searchParams.get('rzp_order_id') || searchParams.get('order_id') || '';

  const [statusState, setStatusState] = useState<'checking' | 'success' | 'failed' | 'pending' | 'not-found'>('checking');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [failureReason, setFailureReason] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);

  const MAX_RETRIES = 6;
  const RETRY_INTERVAL = 3500;

  const verifyStatus = async () => {
    if (!rzpOrderId) {
      setStatusState('not-found');
      return;
    }

    setStatusState('checking');

    try {
      const res = await checkRazorpayStatusApi(rzpOrderId);
      const status = res?.status;

      if (status === 'PAID') {
        clearCart();
        let num = res.orderNumber;
        if (!num) {
          const byRzp = await getOrderByRzpIdApi(rzpOrderId).catch(() => null);
          num = byRzp?.orderNumber;
        }
        setOrderNumber(num || rzpOrderId);
        setStatusState('success');

        if (num) {
          setTimeout(() => {
            navigate(`/order/${encodeURIComponent(num)}`, { replace: true });
          }, 2500);
        }
        return;
      }

      if (status === 'FAILED') {
        setStatusState('failed');
        setFailureReason(res.reason || 'Payment transaction was declined. Please try again.');
        return;
      }

      // Still processing / active
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
      } else {
        setStatusState('pending');
      }
    } catch (err: any) {
      console.warn('Status check warning:', err);
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
      } else {
        setStatusState('pending');
      }
    }
  };

  useEffect(() => {
    let timer: any;
    if (statusState === 'checking' || (retryCount > 0 && retryCount <= MAX_RETRIES)) {
      timer = setTimeout(() => {
        verifyStatus();
      }, retryCount === 0 ? 500 : RETRY_INTERVAL);
    }
    return () => clearTimeout(timer);
  }, [retryCount, rzpOrderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF7F2] px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8E1D5] p-8 sm:p-10 shadow-sm text-center">
        
        {/* Checking State */}
        {statusState === 'checking' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full border-3 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mx-auto"></div>
            <h1 className="font-heading text-2xl font-normal text-[#1C1612]">
              Verifying Payment
            </h1>
            <p className="text-xs text-[#7D7063] font-light">
              Confirming your transaction with Razorpay…
            </p>
            {retryCount > 0 && (
              <p className="text-[11px] text-[#8A7E72]">
                Verification cycle {retryCount} of {MAX_RETRIES}…
              </p>
            )}
          </div>
        )}

        {/* Success State */}
        {statusState === 'success' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-emerald-950">
              Payment Confirmed!
            </h1>
            <p className="text-xs text-emerald-800">
              Your bespoke jewellery consignment is being registered.
            </p>
            {orderNumber && (
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E1D5] text-xs">
                <span className="text-[#8A7E72] block">Consignment Number:</span>
                <span className="font-mono font-bold text-[#1C1612] text-sm">{orderNumber}</span>
              </div>
            )}
            <p className="text-[11px] text-[#8A7E72] pt-2">
              Redirecting to your order consignment details…
            </p>
          </div>
        )}

        {/* Failed State */}
        {statusState === 'failed' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-red-950">
              Payment Incomplete
            </h1>
            <p className="text-xs text-red-700">
              {failureReason || 'Your transaction could not be confirmed.'}
            </p>
            <div className="pt-4 space-y-2">
              <Link
                to="/payment"
                className="block w-full py-3 rounded-2xl bg-[#1C1612] text-[#FEF3C7] text-xs font-semibold uppercase tracking-widest shadow-gold"
              >
                Try Payment Again
              </Link>
              <Link
                to="/cart"
                className="block text-xs text-[#7D7063] hover:text-[#1C1612] pt-1"
              >
                ← Return to Bag
              </Link>
            </div>
          </div>
        )}

        {/* Pending State */}
        {statusState === 'pending' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-amber-950">
              Verification Taking Longer
            </h1>
            <p className="text-xs text-amber-800">
              Your payment is still being processed. Please check your orders page in a minute.
            </p>
            <div className="pt-4 space-y-2">
              <button
                onClick={() => { setRetryCount(0); verifyStatus(); }}
                className="w-full py-3 rounded-2xl bg-[#C5A059] text-[#1C1612] text-xs font-semibold uppercase tracking-widest shadow-gold cursor-pointer"
              >
                Check Status Again
              </button>
              <Link
                to="/orders"
                className="block text-xs text-[#7D7063] hover:text-[#1C1612] pt-1"
              >
                View Order History
              </Link>
            </div>
          </div>
        )}

        {/* Not Found State */}
        {statusState === 'not-found' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-[#1C1612]">
              Order Reference Missing
            </h1>
            <p className="text-xs text-[#7D7063]">
              We could not find an active transaction session linked to this page.
            </p>
            <div className="pt-4 space-y-2">
              <Link
                to="/orders"
                className="block w-full py-3 rounded-2xl bg-[#1C1612] text-[#FEF3C7] text-xs font-semibold uppercase tracking-widest shadow-gold"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="block text-xs text-[#7D7063] hover:text-[#1C1612] pt-1"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
