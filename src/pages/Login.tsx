// src/pages/Login.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CustomerAuth from '../components/CustomerAuth';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../lib/api';

export const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect, { replace: true });
    }
  }, [user, loading, searchParams, navigate]);

  const handleSuccess = () => {
    const redirect = searchParams.get('redirect') || '/dashboard';
    navigate(redirect, { replace: true });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2]">
      <div className="w-full max-w-md">
        <CustomerAuth apiUrl={API_BASE_URL} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};
