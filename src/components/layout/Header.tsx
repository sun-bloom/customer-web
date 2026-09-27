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
    <header className="sticky top-0 z-40 bg-[#FCF9F5]/95 backdrop-blur-md border-b border-[#E8DCCF] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-[64px] sm:h-[72px]">
          
          {/* LEFT: Brand Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-[#7A223B] via-[#C96884] to-[#DFC598] p-0.5 shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#FCF9F5] flex items-center justify-center text-[#7A223B] font-serif text-base font-bold">
                S
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-base sm:text-xl font-normal tracking-wide text-[#2A1C19] group-hover:text-[#7A223B] transition-colors leading-none whitespace-nowrap">
                Sunbloom <span className="font-serif italic text-rose-gold-gradient font-medium">Adorn</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.24em] text-[#A88136] font-medium mt-0.5">
                Haute Atelier
              </span>
            </div>
          </Link>

          {/* CENTER: Navigation Links (Authenticated Top Navigation) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 xl:gap-1.5">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs border border-[#DFC598]/50'
                    : 'text-[#5E4742] hover:text-[#7A223B] hover:bg-[#FCE7EC]/60'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/products"
                className={`px-3 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/products')
                    ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs border border-[#DFC598]/50'
                    : 'text-[#5E4742] hover:text-[#7A223B] hover:bg-[#FCE7EC]/60'
                }`}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className={`px-3 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/categories')
                    ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs border border-[#DFC598]/50'
                    : 'text-[#5E4742] hover:text-[#7A223B] hover:bg-[#FCE7EC]/60'
                }`}
              >
                Categories
              </Link>
              <Link
                to="/orders"
                className={`px-3 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/orders')
                    ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs border border-[#DFC598]/50'
                    : 'text-[#5E4742] hover:text-[#7A223B] hover:bg-[#FCE7EC]/60'
                }`}
              >
                Orders
              </Link>
              <Link
                to="/support"
                className={`px-3 py-1.5 rounded-full text-[11px] xl:text-xs uppercase tracking-widest font-medium transition-all ${
                  isActive('/support')
                    ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs border border-[#DFC598]/50'
                    : 'text-[#5E4742] hover:text-[#7A223B] hover:bg-[#FCE7EC]/60'
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
                  className="relative p-2 rounded-full text-[#2A1C19] hover:bg-[#FCE7EC]/70 hover:text-[#7A223B] transition-colors cursor-pointer"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-4.5 h-4.5 text-[#2A1C19]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-gradient-to-r from-[#7A223B] to-[#C96884] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs border border-[#DFC598] animate-scale-in">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Customer Profile Pill */}
                <Link
                  to="/settings"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DCCF] hover:border-[#7A223B] transition-all shadow-2xs group"
                  title="View Account Profile"
                >
                  <div className="w-5 h-5 rounded-full bg-[#FCE7EC] border border-[#DFC598]/50 flex items-center justify-center text-[10px] font-serif font-bold text-[#7A223B]">
                    {initial}
                  </div>
                  <span className="text-[11px] font-medium text-[#2A1C19] max-w-[85px] truncate group-hover:text-[#7A223B]">
                    {displayName}
                  </span>
                </Link>

                {/* Profile Settings Option — shown only sm→lg (profile pill covers lg+) */}
                <Link
                  to="/settings"
                  className={`hidden sm:flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    isActive('/settings')
                      ? 'bg-[#7A223B] text-[#FFF9FA] shadow-rose'
                      : 'text-[#5E4742] hover:text-[#7A223B] hover:bg-[#FCE7EC]/60 border border-[#E8DCCF]'
                  }`}
                  title="Account Profile & Settings"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Settings</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-[#755B55] hover:text-[#7A223B] hover:bg-[#FCE7EC]/70 transition-colors cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 rounded-lg text-[#2A1C19] hover:bg-[#FCE7EC]/70 transition-colors cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-[#7A223B]" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              /* Unauthenticated Master Header CTAs */
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <Link
                  to="/login?mode=login"
                  className="px-3 sm:px-4 py-1.5 rounded-xl border border-[#DFC598] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-[#7A223B] hover:border-[#7A223B] hover:bg-[#FCE7EC]/50 transition-all shadow-2xs whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="px-3.5 sm:px-4.5 py-1.5 rounded-xl btn-rose-primary text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap"
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
        <div className="md:hidden bg-[#FCF9F5] border-b border-[#E8DCCF] px-4 pt-3 pb-5 space-y-2.5 shadow-lg animate-fade-in">
          {/* User badge */}
          <div className="p-3 bg-white rounded-2xl border border-[#E8DCCF] flex items-center justify-between mb-1.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7A223B] to-[#C96884] text-white flex items-center justify-center font-serif font-bold text-xs border border-[#DFC598]">
                {initial}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#2A1C19] truncate">{displayName}</span>
                <span className="text-[10px] text-[#755B55] truncate">{user.email}</span>
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-wider bg-[#FCE7EC] text-[#7A223B] px-2.5 py-0.5 rounded-full font-semibold border border-[#E29BB0]/40">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/dashboard') ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs' : 'text-[#5E4742] hover:bg-[#FCE7EC]/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#DFC598]" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/products') ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs' : 'text-[#5E4742] hover:bg-[#FCE7EC]/60'
              }`}
            >
              <Compass className="w-4 h-4 text-[#DFC598]" />
              <span>Products</span>
            </Link>

            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/categories') ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs' : 'text-[#5E4742] hover:bg-[#FCE7EC]/60'
              }`}
            >
              <Layers className="w-4 h-4 text-[#DFC598]" />
              <span>Categories</span>
            </Link>

            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/orders') ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs' : 'text-[#5E4742] hover:bg-[#FCE7EC]/60'
              }`}
            >
              <Package className="w-4 h-4 text-[#DFC598]" />
              <span>Orders</span>
            </Link>

            <Link
              to="/support"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/support') ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs' : 'text-[#5E4742] hover:bg-[#FCE7EC]/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-[#DFC598]" />
              <span>Support</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider ${
                isActive('/settings') ? 'bg-[#7A223B] text-[#FFF9FA] shadow-xs' : 'text-[#5E4742] hover:bg-[#FCE7EC]/60'
              }`}
            >
              <SettingsIcon className="w-4 h-4 text-[#DFC598]" />
              <span>Profile Settings</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#E8DCCF]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FCE7EC] text-[#7A223B] text-xs font-semibold hover:bg-[#F8D5DF] transition-colors cursor-pointer border border-[#E29BB0]/40"
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
