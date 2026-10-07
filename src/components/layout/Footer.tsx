// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-paint-deep-rose text-[#FFF9FA] border-t border-[#DFC598]/30 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-radial from-[#DFC598]/12 via-[#7A223B]/10 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          <div className="space-y-3.5 min-w-0">
            <Link to={user ? '/dashboard' : '/'} className="inline-block">
              <span className="font-heading text-2xl font-normal tracking-wide text-[#FFF9FA]">
                Sunbloom <span className="font-serif italic text-[#DFC598]">Adorn</span>
              </span>
            </Link>
            <p className="text-xs text-[#E8D0D6] font-light leading-relaxed max-w-sm">
              Where everyday style meets timeless jewellery.
            </p>
            <p className="text-xs text-[#E8D0D6] font-light leading-relaxed max-w-sm">
              Discover carefully curated Korean jewellery, imitation jewellery and anti-tarnish jewellery, selected to complement every occasion and personal style.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[10px] text-[#DFC598] uppercase tracking-[0.2em] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#DFC598]" />
              <span>Coimbatore, Tamil Nadu</span>
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <h4 className="text-xs font-semibold text-[#DFC598] uppercase tracking-[0.2em]">
              The Jewellery
            </h4>
            <ul className="space-y-2 text-xs text-[#E8D0D6]">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Jewellery Catalog
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Client Orders
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors">
                  Concierge Support
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Our Collections
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 min-w-0">
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
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
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
                  Jewellery Enquiries
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 min-w-0">
            <h4 className="text-xs font-semibold text-[#DFC598] uppercase tracking-[0.2em]">
              Bespoke Concierge
            </h4>
            <p className="text-xs text-[#E8D0D6] font-light leading-relaxed">
              Need help choosing the perfect jewellery?
            </p>
            <p className="text-xs text-[#E8D0D6] font-light leading-relaxed">
              Get personalised assistance and styling guidance directly on WhatsApp
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/919952253464?text=Hello%20Sunbloom%20Adorn%20Team%2C%20I%20need%20assistance%20with%20choosing%20a%20jewellery%20piece."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-medium transition-all break-all"
              >
                <span>9952253464</span>
              </a>
            </div>
            <p className="text-xs text-[#E8D0D6] font-light leading-relaxed">
              Email
            </p>
            <p className="text-[11px] text-[#DFC598] pt-0.5 break-all">
              <a href="mailto:sunbloomadornwork@gmail.com" className="hover:text-white underline decoration-[#DFC598]">
                sunbloomadornwork@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

