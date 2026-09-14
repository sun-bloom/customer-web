// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  auth,
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  loginWithGoogle as fbLoginWithGoogle,
  logout as fbLogout,
  subscribeToAuth,
  getCustomerIdToken,
} from '../lib/firebase';
import { syncCustomerApi, getCustomerProfileApi } from '../lib/api';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  whatsappNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  profile: CustomerProfile | null;
  login: (email: string, pass: string) => Promise<User>;
  signup: (email: string, pass: string, name?: string) => Promise<User>;
  googleLogin: () => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const fetchProfile = async (idToken: string) => {
    try {
      // 1. Sync customer record with backend
      await syncCustomerApi(idToken).catch((e) => console.warn('Customer sync warning:', e.message));
      // 2. Fetch full customer profile
      const res = await getCustomerProfileApi(idToken);
      if (res?.customer) {
        setProfile(res.customer);
      }
    } catch (err: any) {
      console.warn('Failed to fetch customer profile:', err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
          await fetchProfile(idToken);
        } catch (e) {
          console.error('Error loading user session:', e);
        }
      } else {
        setToken(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const u = await fbLoginWithEmail(email, pass);
    const idToken = await u.getIdToken();
    setToken(idToken);
    await fetchProfile(idToken);
    return u;
  };

  const signup = async (email: string, pass: string, name?: string) => {
    const u = await fbRegisterWithEmail(email, pass, name);
    const idToken = await u.getIdToken();
    setToken(idToken);
    await fetchProfile(idToken);
    return u;
  };

  const googleLogin = async () => {
    const u = await fbLoginWithGoogle();
    const idToken = await u.getIdToken();
    setToken(idToken);
    await fetchProfile(idToken);
    return u;
  };

  const logout = async () => {
    await fbLogout();
    setUser(null);
    setToken(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const idToken = await user.getIdToken(true);
      setToken(idToken);
      await fetchProfile(idToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        profile,
        login,
        signup,
        googleLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
