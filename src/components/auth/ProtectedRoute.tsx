// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF7F2]">
        <div className="w-12 h-12 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mb-4"></div>
        <p className="font-heading text-sm text-[#7D7063] uppercase tracking-widest">
          Authenticating Atelier…
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF7F2]">
        <div className="w-12 h-12 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059] animate-spin mb-4"></div>
        <p className="font-heading text-sm text-[#7D7063] uppercase tracking-widest">
          Loading Sunbloom Adorn…
        </p>
      </div>
    );
  }

  if (user) {
    const params = new URLSearchParams(location.search);
    const destination = params.get('redirect') || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
