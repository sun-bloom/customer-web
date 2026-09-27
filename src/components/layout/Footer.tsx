// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-paint-deep-rose text-[#FFF9FA] border-t border-[#DFC598]/30 relative overflow-hidden">
      {/* Subtle background radial champagne glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-radial from-[#DFC598]/12 via-[#7A223B]/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-3.5">
            <Link to={user ? "/dashboard" : "/"} className="inline-block">
              <span className="font-heading text-2xl font-normal tracking-wide text-[#FFF9FA]">
                Sunbloom <span className="font-serif italic text-[#DFC598]">Adorn</span>
              </span>
            </Link>
            <p className="text-xs text-[#E8D0D6] font-light leading-relaxed max-w-sm">
              Where radiant sunlight meets bespoke adornment. Handcrafted anti-tarnish fine jewellery rooted in Korean minimalist aesthetics and lifelong golden lustre.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[10px] text-[#DFC598] uppercase tracking-widest font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#DFC598]" />
              <span>Coonoor &amp; Coimbatore Atelier</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#DFC598] uppercase tracking-[0.2em]">
              The Atelier
            </h4>
            <ul className="space-y-2 text-xs text-[#E8D0D6]">
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
            <h4 className="text-xs font-semibold text-[#DFC598] uppercase tracking-[0.2em]">
              Client Care
            </h4>
            <ul className="space-y-2 text-xs text-[#E8D0D6]">
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
            <h4 className="text-xs font-semibold text-[#DFC598] uppercase tracking-[0.2em]">
              Bespoke Concierge
            </h4>
            <p className="text-xs text-[#E8D0D6] font-light leading-relaxed">
              Experience personalized jewellery curation and styling advice directly on WhatsApp.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/919789325964?text=Hello%20Sunbloom%20Adorn%20Team%2C%20I%20would%20like%20to%20enquire%20about%20your%20jewellery%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-medium transition-all"
              >
                <span>WhatsApp: +91 97893 25964</span>
              </a>
            </div>
            <p className="text-[11px] text-[#DFC598] pt-1">
              Email: <a href="mailto:support@sunbloomadorn.com" className="hover:text-white underline decoration-[#DFC598]">support@sunbloomadorn.com</a>
            </p>
          </div>

        </div>

        {/* Bottom Bar with delicate champagne gold divider */}
        <div className="mt-10 pt-6 border-t border-[#DFC598]/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#E8D0D6]/80">
          <p>© {new Date().getFullYear()} Sunbloom Adorn. Handcrafted with timeless passion.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-white">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

