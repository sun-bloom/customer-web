// src/pages/RefundPolicy.tsx
import React from 'react';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-1">
            Client Assurance
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#1C1612]">
            Refund &amp; <span className="font-serif italic text-[#C5A059]">Replacement Policy</span>
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-8 sm:p-12 shadow-xs space-y-6 text-xs sm:text-sm text-[#5C5248] leading-relaxed">
          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">1. 7-Day Hassle-Free Replacement</h2>
            <p>
              We want you to cherish your Sunbloom Adorn creation. If your order arrives damaged, defective, or incorrect, please notify our concierge support within 7 days of delivery.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">2. Conditions for Return / Exchange</h2>
            <p>
              To be eligible for an exchange, the item must be unworn, in its original packaging with tags intact, and accompanied by the original consignment receipt or order number.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">3. Refund Processing</h2>
            <p>
              Once your returned creation is received and inspected at our atelier, approved refunds are initiated within 3-5 business days directly to the original payment source via Cashfree.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
