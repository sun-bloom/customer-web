// src/components/CustomerAuth.tsx
// Complete Customer Authentication Component with Robust Firebase Error Mapping & Sync
import React, { useState, useEffect } from 'react';
import {
  auth,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginWithGoogleRedirect,
  checkRedirectResult,
  logout,
  subscribeToAuth,
} from '../lib/firebase';
import { mapFirebaseAuthError } from '../lib/authErrors';
import type { User } from 'firebase/auth';
import { API_BASE_URL } from '../lib/api';

interface CustomerAuthProps {
  apiUrl?: string;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CustomerAuth({ apiUrl = API_BASE_URL, onSuccess }: CustomerAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('tab');
      return mode !== 'signup';
    }
    return true;
  });

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'login' | 'signup' | 'google' | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Safe redirect helper
  const handleAuthRedirect = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      // Validate redirect is an internal relative URL
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes(':')) {
        window.location.href = redirect;
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  // Synchronize customer profile with PostgreSQL via backend API
  const syncCustomerWithBackend = async (idToken: string) => {
    const res = await fetch(`${apiUrl}/api/auth/sync-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      if (import.meta.env.DEV) {
        console.warn('[Customer Sync Warning]:', errBody);
      }
      return null;
    }

    return await res.json();
  };

  // Sync mode with URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') || params.get('tab');
      if (mode === 'signup') {
        setIsLogin(false);
      } else if (mode === 'login') {
        setIsLogin(true);
      }
    }
  }, []);

  // Listen to Firebase Auth state & handle redirect logins
  useEffect(() => {
    // Check if user just returned from a Google redirect
    checkRedirectResult()
      .then(async (redirectUser) => {
        if (redirectUser) {
          const idToken = await redirectUser.getIdToken();
          await syncCustomerWithBackend(idToken);
          handleAuthRedirect();
        }
      })
      .catch((err) => {
        setError(mapFirebaseAuthError(err));
      });

    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [apiUrl]);

  // Tab switcher
  const handleTabSwitch = (loginTab: boolean) => {
    setIsLogin(loginTab);
    setError(null);
    setPopupBlocked(false);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('mode', loginTab ? 'login' : 'signup');
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  // Submit Handler (Email & Password)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingAction) return; // Prevent double submission
    setError(null);
    setPopupBlocked(false);

    const trimmedEmail = email.trim();

    // ── Client-Side Validation ─────────────────────────────────────────
    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError(isLogin ? 'Please enter your password.' : 'Please enter a password.');
      return;
    }

    if (!isLogin) {
      if (password.length < 6) {
        setError('Your password is too weak. Please choose a stronger password.');
        return;
      }
      if (!confirmPassword) {
        setError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    // ── Execute Firebase Authentication ─────────────────────────────────
    setLoadingAction(isLogin ? 'login' : 'signup');

    try {
      let firebaseUser: User;
      if (isLogin) {
        firebaseUser = await loginWithEmail(trimmedEmail, password);
      } else {
        firebaseUser = await registerWithEmail(trimmedEmail, password, name.trim());
      }

      const idToken = await firebaseUser.getIdToken(true);
      await syncCustomerWithBackend(idToken);

      // Successfully authenticated & synchronized
      handleAuthRedirect();
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[Auth Exception]:', err);
      }
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoadingAction(null);
    }
  };

  // Google Login Handler
  const handleGoogleAuth = async () => {
    if (loadingAction) return; // Prevent double clicks
    setError(null);
    setPopupBlocked(false);
    setLoadingAction('google');

    try {
      const firebaseUser = await loginWithGoogle();
      const idToken = await firebaseUser.getIdToken(true);
      await syncCustomerWithBackend(idToken);
      handleAuthRedirect();
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[Google Auth Exception]:', err);
      }
      const code = err?.code || '';
      if (code === 'auth/popup-blocked') {
        setPopupBlocked(true);
      }
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoadingAction(null);
    }
  };

  // Google Redirect Fallback Handler
  const handleGoogleRedirectAuth = async () => {
    setError(null);
    setLoadingAction('google');
    try {
      await loginWithGoogleRedirect();
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
      setLoadingAction(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err: any) {
      setError(mapFirebaseAuthError(err));
    }
  };

  // ── Render: Authenticated Profile (If on /login while signed in) ─────
  if (user) {
    const initial = user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase() || 'U';
    return (
      <div className="bg-white p-8 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xs border border-[#E8DCCF] max-w-md w-full mx-auto text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCE7EC]/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FDF2F5] to-[#FAF5EB] border-2 border-[#DFC598]/50 text-[#7A223B] flex items-center justify-center font-serif text-3xl mx-auto shadow-xs">
          {initial}
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A223B] font-semibold block mb-1">
            Client Profile
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-normal text-[#2A1C19]">
            {user.displayName || 'Welcome Back'}
          </h3>
          <p className="text-xs text-[#7D6460] font-light mt-1 font-sans">{user.email}</p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <a
            href="/orders"
            className="w-full py-2.5 px-4 rounded-xl bg-[#FAF6F0]/70 hover:bg-[#FDF2F5] border border-[#E8DCCF] hover:border-[#DFC598] text-[#2A1C19] font-medium text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-[#C9A86A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Order Archives
          </a>

          <a
            href="/track-order"
            className="w-full py-2.5 px-4 rounded-xl bg-[#FAF6F0]/70 hover:bg-[#FDF2F5] border border-[#E8DCCF] hover:border-[#DFC598] text-[#2A1C19] font-medium text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-[#C9A86A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Track Live Shipment
          </a>

          <a
            href="/products"
            className="btn-rose-primary w-full py-2.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-[0.16em] transition-all text-center block shadow-xs"
          >
            Explore The Collection
          </a>

          <button
            type="button"
            id="auth-signout-btn"
            onClick={handleLogout}
            className="w-full py-2 px-4 rounded-xl text-[#A8928D] hover:text-rose-700 text-xs tracking-wider transition-colors pt-2 cursor-pointer font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Sign In / Create Account Forms ──────────────────────────
  return (
    <div className="bg-white p-8 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xs border border-[#E8DCCF] max-w-md w-full mx-auto relative overflow-hidden">
      {/* Ambient pink and gold accent */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#FCE7EC]/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#FAF5EB]/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Icon Header */}
      <div className="text-center mb-8 relative z-10">
        <img
          src="/logo.png"
          alt="Sunbloom Adorn"
          className="w-16 h-16 mx-auto rounded-full object-cover shadow-xs ring-2 ring-[#DFC598]/40 mb-3"
        />
        <h3 className="font-heading text-2xl sm:text-3xl text-[#2A1C19] font-normal">Sunbloom Adorn</h3>
        <p className="text-xs text-[#7A223B] font-medium mt-0.5 tracking-wider uppercase">Haute Jewellery Atelier</p>
      </div>

      {/* Tab Controls: Sign In vs Create Account */}
      <div className="flex border-b border-[#FAF6F0] mb-7 relative z-10">
        <button
          type="button"
          id="tab-sign-in"
          onClick={() => handleTabSwitch(true)}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            isLogin ? 'border-[#7A223B] text-[#7A223B]' : 'border-transparent text-[#A8928D] hover:text-[#5C4540]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          id="tab-create-account"
          onClick={() => handleTabSwitch(false)}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            !isLogin ? 'border-[#7A223B] text-[#7A223B]' : 'border-transparent text-[#A8928D] hover:text-[#5C4540]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Customer-Friendly Error Message Banner */}
      {error && (
        <div id="auth-error-banner" className="mb-5 p-3.5 bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-xl font-sans flex items-start gap-2.5 transition-all animate-fadeIn">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Authentication Form (Email & Password Only) */}
      <form onSubmit={handleSubmit} className="space-y-4 font-sans relative z-10" noValidate>
        {/* Full Name (Sign Up only) */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="signup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Radhika Sharma"
              disabled={loadingAction !== null}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-sm text-[#2A1C19] focus:outline-none focus:ring-1 focus:ring-[#7A223B]/20 focus:border-[#7A223B] transition-all disabled:opacity-50"
            />
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            id="auth-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={loadingAction !== null}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-sm text-[#2A1C19] focus:outline-none focus:ring-1 focus:ring-[#7A223B]/20 focus:border-[#7A223B] transition-all disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] text-[#A8928D] hover:text-[#7A223B] transition-colors cursor-pointer"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="auth-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loadingAction !== null}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-sm text-[#2A1C19] focus:outline-none focus:ring-1 focus:ring-[#7A223B]/20 focus:border-[#7A223B] transition-all disabled:opacity-50"
          />
        </div>

        {/* Confirm Password (Sign Up only) */}
        {!isLogin && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider">
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[11px] text-[#A8928D] hover:text-[#7A223B] transition-colors cursor-pointer"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="signup-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loadingAction !== null}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0]/70 border border-[#E8DCCF] text-sm text-[#2A1C19] focus:outline-none focus:ring-1 focus:ring-[#7A223B]/20 focus:border-[#7A223B] transition-all disabled:opacity-50"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          id="auth-submit-btn"
          disabled={loadingAction !== null}
          className="w-full btn-rose-primary py-3 px-4 font-semibold text-xs uppercase tracking-widest rounded-xl shadow-xs transition-all duration-300 disabled:opacity-50 mt-3 cursor-pointer flex items-center justify-center gap-2"
        >
          {loadingAction === 'login' && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loadingAction === 'signup' && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>
            {loadingAction === 'login'
              ? 'SIGNING IN…'
              : loadingAction === 'signup'
              ? 'CREATING ACCOUNT…'
              : isLogin
              ? 'SIGN IN TO ATELIER'
              : 'CREATE ATELIER ACCOUNT'}
          </span>
        </button>
      </form>

      {/* Google Sign In — Available on both Sign In and Sign Up tabs */}
      <div className="relative my-6 text-center z-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#FAF6F0]" />
        </div>
        <span className="relative bg-white px-3 text-[10px] text-[#A8928D] uppercase tracking-widest font-semibold">
          Or continue with
        </span>
      </div>

      <button
        type="button"
        id="google-auth-btn"
        onClick={handleGoogleAuth}
        disabled={loadingAction !== null}
        className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF6F0] border border-[#E8DCCF] hover:border-[#DFC598] text-[#2A1C19] font-medium text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-3 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer relative z-10"
      >
        {loadingAction === 'google' ? (
          <>
            <svg className="animate-spin h-4 w-4 text-[#7A223B]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>CONTINUING WITH GOOGLE…</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Popup-Blocked Fallback Option */}
      {popupBlocked && (
        <div className="mt-3 text-center relative z-10">
          <button
            type="button"
            id="google-redirect-btn"
            onClick={handleGoogleRedirectAuth}
            className="text-xs text-[#7A223B] hover:underline font-sans cursor-pointer font-medium"
          >
            Browser blocked popup? Click here to continue with redirect
          </button>
        </div>
      )}
    </div>
  );
}
