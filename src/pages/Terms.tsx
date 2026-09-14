// src/pages/Terms.tsx
import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block mb-1">
            Atelier Guidelines
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal text-[#1C1612]">
            Terms &amp; <span className="font-serif italic text-[#C5A059]">Conditions</span>
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-8 sm:p-12 shadow-xs space-y-6 text-xs sm:text-sm text-[#5C5248] leading-relaxed">
          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing the Sunbloom Adorn storefront and placing an order, you agree to be bound by these Terms and Conditions and our associated store policies.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">2. Product Descriptions &amp; Availability</h2>
            <p>
              We endeavor to accurately display the colors, finishes, and dimensions of all jewellery creations. Because our pieces feature artisanal finishing, minor natural variations may occur. All orders are subject to stock confirmation.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">3. Pricing &amp; Payments</h2>
            <p>
              All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST taxes. Payment must be confirmed via Cashfree prior to consignment dispatch.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl text-[#1C1612] mb-2">4. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of Tamil Nadu and India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Coimbatore / Nilgiris district.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
