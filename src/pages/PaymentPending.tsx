// src/pages/PaymentPending.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { checkPaymentStatusApi } from '../lib/api';
import { clearCart } from '../stores/cartStore';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const PaymentPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id') || searchParams.get('rzp_order_id') || '';

  const [statusState, setStatusState] = useState<'checking' | 'success' | 'failed' | 'pending' | 'not-found'>('checking');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [failureReason, setFailureReason] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);

  const MAX_RETRIES = 6;
  const RETRY_INTERVAL = 3500;

  const verifyStatus = async () => {
    if (!orderId) {
      setStatusState('not-found');
      return;
    }

    setStatusState('checking');

    try {
      const res = await checkPaymentStatusApi(orderId);
      const status = res?.status;

      if (status === 'PAID') {
        clearCart();
        const num = res.orderNumber || orderId;
        setOrderNumber(num);
        setStatusState('success');

        // Redirect to canonical success page with orderNumber
        setTimeout(() => {
          navigate(`/payment/success?order_id=${encodeURIComponent(num)}`, { replace: true });
        }, 1500);
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
  }, [retryCount, orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FCF9F5] px-4 py-16 relative overflow-hidden">
      <div className="absolute top-0 right-10 w-96 h-96 rounded-full bg-[#FCE7EC]/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#FAF5EB]/50 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-[#E8DCCF] p-8 sm:p-10 shadow-xs text-center relative z-10">
        
        {/* Checking State */}
        {statusState === 'checking' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full border-3 border-[#DFC598]/40 border-t-[#7A223B] animate-spin mx-auto"></div>
            <h1 className="font-heading text-2xl font-normal text-[#2A1C19]">
              Verifying Payment
            </h1>
            <p className="text-xs text-[#7D6460] font-light">
              Confirming your transaction…
            </p>
            {retryCount > 0 && (
              <p className="text-[11px] text-[#A8928D]">
                Verification cycle {retryCount} of {MAX_RETRIES}…
              </p>
            )}
          </div>
        )}

        {/* Success State */}
        {statusState === 'success' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#FDF2F5] border border-[#FCE7EC] text-[#7A223B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-[#7A223B]" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-[#2A1C19]">
              Payment Confirmed!
            </h1>
            <p className="text-xs text-[#7D6460]">
              Your bespoke jewellery consignment is being registered.
            </p>
            {orderNumber && (
              <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DCCF] text-xs">
                <span className="text-[#A8928D] block">Consignment Number:</span>
                <span className="font-mono font-bold text-[#7A223B] text-sm">{orderNumber}</span>
              </div>
            )}
            <p className="text-[11px] text-[#A8928D] pt-2">
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
                className="btn-rose-primary block w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest shadow-xs text-center"
              >
                Try Payment Again
              </Link>
              <Link
                to="/cart"
                className="block text-xs text-[#7A223B] hover:text-[#5E182C] pt-1 font-medium"
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
                className="btn-rose-primary w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest shadow-xs cursor-pointer"
              >
                Check Status Again
              </button>
              <Link
                to="/orders"
                className="block text-xs text-[#7A223B] hover:text-[#5E182C] pt-1 font-medium"
              >
                View Order History
              </Link>
            </div>
          </div>
        )}

        {/* Not Found State */}
        {statusState === 'not-found' && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#FDF2F5] border border-[#FCE7EC] text-[#7A223B] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-[#7A223B]" />
            </div>
            <h1 className="font-heading text-2xl font-normal text-[#2A1C19]">
              Order Reference Missing
            </h1>
            <p className="text-xs text-[#7D6460]">
              We could not find an active transaction session linked to this page.
            </p>
            <div className="pt-4 space-y-2">
              <Link
                to="/orders"
                className="btn-rose-primary block w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest shadow-xs text-center"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="block text-xs text-[#7A223B] hover:text-[#5E182C] pt-1 font-medium"
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

export default PaymentPending;
