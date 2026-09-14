// src/pages/About.tsx
import React from 'react';
import { Sparkles, Award, ShieldCheck, Heart } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium block">
            Our Atelier Heritage
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-normal text-[#1C1612]">
            About <span className="font-serif italic text-[#C5A059]">Sunbloom Adorn</span>
          </h1>
          <p className="text-sm sm:text-base text-[#7D7063] font-light max-w-xl mx-auto leading-relaxed">
            Where sunlight meets fine adornment. Handcrafted luxury anti-tarnish fine jewellery designed for lifelong brilliance.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-8 sm:p-12 shadow-xs space-y-8 text-xs sm:text-sm text-[#5C5248] leading-relaxed">
          <div>
            <h2 className="font-heading text-2xl font-normal text-[#1C1612] mb-3">
              The Genesis of Radiant Craft
            </h2>
            <p>
              Sunbloom Adorn was established in the tranquil hills of Coonoor and Coimbatore with a singular vision: to create fine everyday jewellery that never tarnishes, never fades, and seamlessly elevates everyday moments into expressions of grace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#F0EAE1]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1612]">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>18K PVD Golden Brilliance</span>
              </div>
              <p className="text-xs text-[#7D7063]">
                Utilizing advanced Physical Vapor Deposition (PVD), each piece is molecularly coated in 18-karat gold over surgical-grade 316L stainless steel, rendering it 100% waterproof and sweatproof.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1612]">
                <Award className="w-4 h-4 text-[#C5A059]" />
                <span>Korean Minimalist Silhouette</span>
              </div>
              <p className="text-xs text-[#7D7063]">
                Our design language balances subtle organic curves with clean architectural geometry, creating understated yet striking pieces.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0EAE1]">
            <h2 className="font-heading text-2xl font-normal text-[#1C1612] mb-3">
              Our Promise
            </h2>
            <p>
              Every Sunbloom Adorn creation undergoes multi-stage quality inspections before being dispatched in our signature luxury presentation box. We are committed to ethical craftsmanship, durable materials, and personal customer concierge care.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
