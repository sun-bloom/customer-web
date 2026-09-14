// src/components/layout/PublicLayout.tsx
import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { WhatsAppFloat } from './WhatsAppFloat';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1612] font-sans antialiased selection:bg-[#FEF3C7] selection:text-[#1C1612]">
      <ScrollRestoration />
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
};
