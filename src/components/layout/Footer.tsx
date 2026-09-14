// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-[#1C1612] text-[#FAF7F2] border-t border-[#382F26]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to={user ? "/dashboard" : "/"} className="inline-block">
              <span className="font-heading text-2xl font-normal tracking-wide text-[#FAF7F2]">
                Sunbloom <span className="font-serif italic text-[#D4AF37]">Adorn</span>
              </span>
            </Link>
            <p className="text-xs text-[#B8ADA0] font-light leading-relaxed max-w-sm">
              Where radiant sunlight meets bespoke adornment. Handcrafted anti-tarnish fine jewellery designed with Korean minimalist elegance and lifelong brilliance.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#C5A059] uppercase tracking-widest font-medium">
              <span>✦ Coonoor &amp; Coimbatore Atelier</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
              The Atelier
            </h4>
            <ul className="space-y-2 text-xs text-[#B8ADA0]">
              <li>
                <Link to={user ? "/dashboard" : "/login"} className="hover:text-white transition-colors">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Fine Jewellery Catalog
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Jewellery Categories
                </Link>
              </li>
              <li>
                <Link to={user ? "/orders" : "/login"} className="hover:text-white transition-colors">
                  Client Orders
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors">
                  Concierge Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Heritage &amp; Craft
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Assistance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
              Client Care
            </h4>
            <ul className="space-y-2 text-xs text-[#B8ADA0]">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">
                  Refund &amp; Replacement
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Atelier Enquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct WhatsApp Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.2em]">
              Direct Contact
            </h4>
            <p className="text-xs text-[#B8ADA0] font-light leading-relaxed">
              Experience personalized jewellery curation directly on WhatsApp.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/919789325964?text=Hello%20Sunbloom%20Adorn%20Team%2C%20I%20would%20like%20to%20enquire%20about%20your%20jewellery%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-medium transition-all"
              >
                <span>WhatsApp: +91 97893 25964</span>
              </a>
            </div>
            <p className="text-[11px] text-[#8A7E72] pt-2">
              Email: <a href="mailto:support@sunbloomadorn.com" className="hover:text-[#D4AF37]">support@sunbloomadorn.com</a>
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#2E2620] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8A7E72]">
          <p>© {new Date().getFullYear()} Sunbloom Adorn. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-[#B8ADA0]">Terms</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#B8ADA0]">Privacy</Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-[#B8ADA0]">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
