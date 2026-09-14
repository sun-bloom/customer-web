// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#FAF7F2] px-4 py-16">
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-10 sm:p-14 text-center max-w-md shadow-xs space-y-4">
        <span className="font-serif text-5xl text-[#C5A059] italic block">404</span>
        <h1 className="font-heading text-2xl sm:text-3xl text-[#1C1612]">Page Not Found</h1>
        <p className="text-xs text-[#7D7063] font-light">
          The page you requested does not exist in our atelier directory.
        </p>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1612] text-[#FEF3C7] text-xs uppercase tracking-widest font-semibold shadow-gold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
