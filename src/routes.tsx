// src/routes.tsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { PortalLayout } from './components/layout/PortalLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Categories } from './pages/Categories';
import { Cart } from './pages/Cart';
import { Payment } from './pages/Payment';
import { PaymentPending } from './pages/PaymentPending';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { TrackOrder } from './pages/TrackOrder';
import { Support } from './pages/Support';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { RefundPolicy } from './pages/RefundPolicy';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  // 1. Public Master Page & Information Pages (Include Master Footer & WhatsApp Float)
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        ),
      },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/terms', element: <Terms /> },
      { path: '/refund-policy', element: <RefundPolicy /> },
    ],
  },

  // 2. Authenticated Customer Portal (NO Master Footer, NO WhatsApp Float)
  {
    element: <PortalLayout />,
    children: [
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/products',
        element: (
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        ),
      },
      {
        path: '/products/:slug',
        element: (
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/categories',
        element: (
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        ),
      },
      {
        path: '/cart',
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: '/payment',
        element: (
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        ),
      },
      {
        path: '/order/pending',
        element: (
          <ProtectedRoute>
            <PaymentPending />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders/:id',
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/order/:id',
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/track-order',
        element: (
          <ProtectedRoute>
            <TrackOrder />
          </ProtectedRoute>
        ),
      },
      {
        path: '/support',
        element: (
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },

      // 404 Catch-All
      { path: '*', element: <NotFound /> },
    ],
  },
]);
