// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '@nanostores/react';
import { $cartCount, toggleCart } from '../../stores/cartStore';
import {
  ShoppingBag,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Package,
  Compass,
  LayoutDashboard,
  HelpCircle,
  Layers,
  Settings as SettingsIcon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const cartCount = useStore($cartCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const displayName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Client';
  const initial = displayName.charAt(0).toUpperCase();

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path === '/products' && (location.pathname === '/products' || location.pathname.startsWith('/products/'))) return true;
    if (path === '/categories' && location.pathname.startsWith('/categories')) return true;
    if (path === '/orders' && (location.pathname.startsWith('/order') || location.pathname.startsWith('/orders'))) return true;
    if (path === '/support' && location.pathname === '/support') return true;
    if (path === '/settings' && location.pathname === '/settings') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E1D5] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-[68px] sm:h-[76px]">
          
          {/* LEFT: Brand Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FEF3C7] p-0.5 shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#1C1612] flex items-center justify-center text-[#D4AF37] font-serif text-base font-bold">
                S
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-base sm:text-xl font-normal tracking-wide text-[#1C1612] group-hover:text-[#A88136] transition-colors leading-none whitespace-nowrap">
                Sunbloom <span className="font-serif italic text-[#C5A059]">Adorn</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.22em] text-[#8A7E72] font-medium mt-0.5">
                Haute Atelier
              </span>
            </div>
          </Link>

          {/* CENTER: Navigation Links (Authenticated Top Navigation) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 xl:gap-1.5">
              <Link
                to="/dashboard"
                className={`px-3 py-1 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-[#1C1612] text-[#FEF3C7] shadow-2xs'
                    : 'text-[#5C5248] hover:text-[#1C1612] hover:bg-[#F2ECE1]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/products"
                className={`px-3 py-1 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/products')
                    ? 'bg-[#1C1612] text-[#FEF3C7] shadow-2xs'
                    : 'text-[#5C5248] hover:text-[#1C1612] hover:bg-[#F2ECE1]'
                }`}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className={`px-3 py-1 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/categories')
                    ? 'bg-[#1C1612] text-[#FEF3C7] shadow-2xs'
                    : 'text-[#5C5248] hover:text-[#1C1612] hover:bg-[#F2ECE1]'
                }`}
              >
                Categories
              </Link>
              <Link
                to="/orders"
                className={`px-3 py-1 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/orders')
                    ? 'bg-[#1C1612] text-[#FEF3C7] shadow-2xs'
                    : 'text-[#5C5248] hover:text-[#1C1612] hover:bg-[#F2ECE1]'
                }`}
              >
                Orders
              </Link>
              <Link
                to="/support"
                className={`px-3 py-1 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/support')
                    ? 'bg-[#1C1612] text-[#FEF3C7] shadow-2xs'
                    : 'text-[#5C5248] hover:text-[#1C1612] hover:bg-[#F2ECE1]'
                }`}
              >
                Support
              </Link>
            </nav>
          )}

          {/* RIGHT: Action Icons & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {user ? (
              <>
                {/* Cart Button */}
                <button
                  onClick={toggleCart}
                  className="relative p-2 rounded-full text-[#1C1612] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#1C1612]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#1C1612] text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs animate-scale-in">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Customer Profile Pill */}
                <Link
                  to="/settings"
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E8E1D5] hover:border-[#C5A059] transition-all shadow-2xs group"
                  title="View Account Profile"
                >
                  <div className="w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#C5A059]/40 flex items-center justify-center text-[10px] font-serif font-bold text-[#C5A059]">
                    {initial}
                  </div>
                  <span className="text-[11px] font-medium text-[#1C1612] max-w-[85px] truncate">
                    {displayName}
                  </span>
                </Link>

                {/* Profile Settings Option — shown only sm→lg (profile pill covers lg+) */}
                <Link
                  to="/settings"
                  className={`hidden sm:flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    isActive('/settings')
                      ? 'bg-[#1C1612] text-[#FEF3C7] shadow-2xs'
                      : 'text-[#5C5248] hover:text-[#1C1612] hover:bg-[#F2ECE1] border border-[#E8E1D5]'
                  }`}
                  title="Account Profile & Settings"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Settings</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#7D7063] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 rounded-lg text-[#1C1612] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              /* Unauthenticated Master Header CTAs */
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <Link
                  to="/login?mode=login"
                  className="px-2.5 sm:px-4 py-1.5 rounded-full border border-[#D1C7BA] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-widest text-[#1C1612] hover:border-[#C5A059] hover:bg-white transition-all shadow-2xs whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="px-2.5 sm:px-4 py-1.5 rounded-full bg-[#1C1612] text-[#FEF3C7] hover:bg-[#2A231D] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-widest shadow-gold transition-all whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (When Authenticated and Opened) */}
      {user && mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E1D5] px-4 pt-3 pb-5 space-y-2.5 shadow-lg animate-fade-in">
          {/* User badge */}
          <div className="p-2.5 bg-[#FAF7F2] rounded-2xl border border-[#E8E1D5] flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#C5A059] text-white flex items-center justify-center font-serif font-bold text-xs">
                {initial}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1C1612] truncate">{displayName}</span>
                <span className="text-[10px] text-[#8A7E72] truncate">{user.email}</span>
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/dashboard') ? 'bg-[#1C1612] text-[#FEF3C7]' : 'text-[#5C5248] hover:bg-[#FAF7F2]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#C5A059]" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/products') ? 'bg-[#1C1612] text-[#FEF3C7]' : 'text-[#5C5248] hover:bg-[#FAF7F2]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#C5A059]" />
              <span>Products</span>
            </Link>

            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/categories') ? 'bg-[#1C1612] text-[#FEF3C7]' : 'text-[#5C5248] hover:bg-[#FAF7F2]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#C5A059]" />
              <span>Categories</span>
            </Link>

            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/orders') ? 'bg-[#1C1612] text-[#FEF3C7]' : 'text-[#5C5248] hover:bg-[#FAF7F2]'
              }`}
            >
              <Package className="w-4 h-4 text-[#C5A059]" />
              <span>Orders</span>
            </Link>

            <Link
              to="/support"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/support') ? 'bg-[#1C1612] text-[#FEF3C7]' : 'text-[#5C5248] hover:bg-[#FAF7F2]'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-[#C5A059]" />
              <span>Support</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/settings') ? 'bg-[#1C1612] text-[#FEF3C7]' : 'text-[#5C5248] hover:bg-[#FAF7F2]'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-[#C5A059]" />
              <span>Profile Settings</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#F0EAE1]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
