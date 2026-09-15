// src/pages/Privacy.tsx
import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-1">
            Client Protection
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#1C1612]">
            Privacy <span className="font-serif italic text-[#C5A059]">Policy</span>
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-8 sm:p-12 shadow-xs space-y-6 text-xs sm:text-sm text-[#5C5248] leading-relaxed">
          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">1. Overview</h2>
            <p>
              Sunbloom Adorn ("we", "our", "us") values your privacy. This policy outlines how your personal information is collected, utilized, and safeguarded when interacting with our website and purchasing our handcrafted fine jewellery.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">2. Information We Collect</h2>
            <p>
              When you create an account, place an order, or submit a support query, we collect details including your name, email address, mobile phone number, WhatsApp contact, delivery address, and payment confirmation tokens.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">3. Payment &amp; Financial Security</h2>
            <p>
              All online payments are securely processed through Razorpay Software Private Limited. We do not store full credit card numbers, debit card PINs, or UPI MPINs on our servers.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">4. Communication &amp; WhatsApp Updates</h2>
            <p>
              If opted in, we use your phone and WhatsApp numbers strictly to send transaction confirmations, delivery tracking updates, and concierge support responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
