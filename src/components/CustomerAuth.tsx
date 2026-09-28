// src/components/CustomerAuth.tsx
// Sunbloom Adorn Haute Jewellery Atelier — Customer Authentication
// ONLY TWO TOP-LEVEL OPTIONS: [ SIGN IN ] and [ CREATE ACCOUNT ]
// Email + Password flow with Firebase Email Verification enforcement.
// Google Sign-In button preserved below the main form.

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
  sendVerificationToUser,
} from '../lib/firebase';
import { mapFirebaseAuthError } from '../lib/authErrors';
import type { User } from 'firebase/auth';
import { API_BASE_URL } from '../lib/api';
import { Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface CustomerAuthProps {
  apiUrl?: string;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CustomerAuth({ apiUrl = API_BASE_URL, onSuccess }: CustomerAuthProps) {
  const [user, setUser] = useState<User | null>(null);

  // Top-level mode: ONLY [ SIGN IN ] (true) or [ CREATE ACCOUNT ] (false)
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

  // Verification & Status States
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResentSuccess, setEmailResentSuccess] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'login' | 'signup' | 'google' | null>(null);

  // Safe redirect helper
  const handleAuthRedirect = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes(':')) {
        window.location.href = redirect;
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  // Synchronize customer profile with PostgreSQL via backend API
  const syncCustomerWithBackend = async (idToken: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/sync-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.warn('[Customer Sync Note]:', err.message);
      }
    }
    return null;
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

  // Switch between Sign In and Create Account
  const handleTabSwitch = (loginTab: boolean) => {
    setIsLogin(loginTab);
    setError(null);
    setInfoMessage(null);
    setUnverifiedEmail(null);
    setEmailResentSuccess(false);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('mode', loginTab ? 'login' : 'signup');
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }
  };

  // ── Handle Email Form Submit (Sign In or Create Account) ─────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingAction) return;
    setError(null);
    setInfoMessage(null);
    setUnverifiedEmail(null);
    setEmailResentSuccess(false);

    const trimmedEmail = email.trim().toLowerCase();

    if (!isLogin && !name.trim()) {
      setError('Please enter your full name.');
      return;
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
      setError('Please enter your password.');
      return;
    }

    if (!isLogin) {
      if (password.length < 6) {
        setError('Your password must be at least 6 characters.');
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

    setLoadingAction(isLogin ? 'login' : 'signup');

    try {
      if (isLogin) {
        // ── SIGN IN FLOW ──
        const firebaseUser = await loginWithEmail(trimmedEmail, password);

        // Enforce Firebase Email Verification
        if (!firebaseUser.emailVerified) {
          setUnverifiedEmail(trimmedEmail);
          setError('Your email address has not been verified yet. Please check your inbox for the verification link.');
          // Sign out unverified session immediately
          await logout();
          return;
        }

        // Email is verified — sync customer using authenticated Firebase UID
        const idToken = await firebaseUser.getIdToken(true);
        await syncCustomerWithBackend(idToken);
        handleAuthRedirect();

      } else {
        // ── CREATE ACCOUNT FLOW ──
        const newUser = await registerWithEmail(trimmedEmail, password, name.trim());

        // Send Firebase email verification
        await sendVerificationToUser(newUser);

        // Sign out newly created unverified user
        await logout();

        setInfoMessage(
          `Account created for ${trimmedEmail}! We have sent a verification link to your email. Please click the link in your inbox to verify your email, then sign in.`
        );
        // Switch to Sign In tab so user can sign in after clicking email link
        setIsLogin(true);
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[Email Auth Error]:', err);
      }
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoadingAction(null);
    }
  };

  // ── Resend Email Verification ─────────────────────────────────────────
  const handleResendVerification = async () => {
    if (!unverifiedEmail || resendingEmail) return;
    setResendingEmail(true);
    setEmailResentSuccess(false);
    setError(null);

    try {
      // Temporarily sign in with credentials to re-trigger email verification safely
      const tempUser = await loginWithEmail(unverifiedEmail, password);
      await sendVerificationToUser(tempUser);
      await logout();
      setEmailResentSuccess(true);
      setInfoMessage(`Verification email resent to ${unverifiedEmail}. Please check your inbox.`);
    } catch (err: any) {
      setError('Unable to resend verification email. Please confirm your password and try again.');
    } finally {
      setResendingEmail(false);
    }
  };

  // ── Google Sign-In ────────────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    if (loadingAction) return;
    setError(null);
    setInfoMessage(null);
    setLoadingAction('google');

    try {
      const firebaseUser = await loginWithGoogle();
      const idToken = await firebaseUser.getIdToken(true);
      await syncCustomerWithBackend(idToken);
      handleAuthRedirect();
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[Google Auth Error]:', err);
      }
      const code = err?.code || '';
      if (code === 'auth/popup-blocked') {
        try {
          await loginWithGoogleRedirect();
          return;
        } catch (redirErr: any) {
          setError(mapFirebaseAuthError(redirErr));
        }
      } else {
        setError(mapFirebaseAuthError(err));
      }
    } finally {
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

  // ── Render: Authenticated Profile (If on /login while already signed in)
  if (user) {
    const initial = user.displayName ? user.displayName[0].toUpperCase() : user.email?.[0].toUpperCase() || 'S';
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

  // ── Render: Auth Page with ONLY TWO Top-Level Tabs [ SIGN IN ] and [ CREATE ACCOUNT ]
  return (
    <div className="bg-white p-7 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xs border border-[#E8DCCF] max-w-md w-full mx-auto relative overflow-hidden">
      {/* Ambient pink and gold accents */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#FCE7EC]/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#FAF5EB]/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Atelier Header */}
      <div className="text-center mb-6 relative z-10">
        <img
          src="/logo.png"
          alt="Sunbloom Adorn"
          className="w-16 h-16 mx-auto rounded-full object-cover shadow-xs ring-2 ring-[#DFC598]/40 mb-2.5"
        />
        <h2 className="font-heading text-2xl sm:text-3xl text-[#2A1C19] font-normal">Sunbloom Adorn</h2>
        <p className="text-[11px] text-[#7A223B] font-semibold mt-0.5 tracking-[0.2em] uppercase">Haute Jewellery Atelier</p>
      </div>

      {/* ========================================================================= */}
      {/* 1. AUTH UI — ONLY TWO TOP-LEVEL OPTIONS: [ SIGN IN ] and [ CREATE ACCOUNT ] */}
      {/* ========================================================================= */}
      <div className="flex border-b border-[#E8DCCF] mb-6 relative z-10">
        <button
          type="button"
          id="tab-sign-in"
          onClick={() => handleTabSwitch(true)}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            isLogin
              ? 'border-[#7A223B] text-[#7A223B]'
              : 'border-transparent text-[#A8928D] hover:text-[#5C4540]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          id="tab-create-account"
          onClick={() => handleTabSwitch(false)}
          className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            !isLogin
              ? 'border-[#7A223B] text-[#7A223B]'
              : 'border-transparent text-[#A8928D] hover:text-[#5C4540]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Status & Error Alerts */}
      {error && (
        <div id="auth-error-banner" className="mb-4 p-3.5 bg-red-50/95 border border-red-200 text-red-700 text-xs rounded-xl font-sans flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span>{error}</span>
            {unverifiedEmail && (
              <div className="mt-2.5 pt-2 border-t border-red-200 flex flex-col gap-1.5">
                <span className="text-[11px] text-[#5C4540]">Need another verification link?</span>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-300 rounded-lg text-xs font-semibold text-[#7A223B] hover:bg-[#FAF0F4] transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${resendingEmail ? 'animate-spin' : ''}`} />
                  <span>{resendingEmail ? 'Sending Link…' : 'Resend Verification Email'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {infoMessage && (
        <div id="auth-info-banner" className="mb-4 p-3.5 bg-[#FAF0F4] border border-[#F7C6D3] text-[#7A223B] text-xs rounded-xl font-sans flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed flex-1">{infoMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EMAIL CREDENTIAL FORM                                                    */}
      {/* ========================================================================= */}
      <form onSubmit={handleEmailSubmit} className="relative z-10 space-y-4" noValidate>

        {/* Full Name field (Only shown for CREATE ACCOUNT) */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              id="auth-full-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. S Kavin Raj"
              className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/70 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B] focus:ring-1 focus:ring-[#7A223B]/20 transition-all"
            />
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            id="auth-email-input"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
              setUnverifiedEmail(null);
            }}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/70 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B] focus:ring-1 focus:ring-[#7A223B]/20 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="auth-password-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/70 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B] focus:ring-1 focus:ring-[#7A223B]/20 transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8928D] hover:text-[#5C4540] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password (Only for Create Account) */}
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-[#5C4540] uppercase tracking-wider mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="auth-confirm-password-input"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/70 border border-[#E8DCCF] rounded-xl text-xs sm:text-sm text-[#2A1C19] focus:outline-none focus:border-[#7A223B] focus:ring-1 focus:ring-[#7A223B]/20 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8928D] hover:text-[#5C4540] cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          id="auth-email-submit-btn"
          disabled={loadingAction !== null}
          className="w-full btn-rose-primary py-3 px-4 font-semibold text-xs uppercase tracking-widest rounded-xl shadow-xs transition-all duration-300 disabled:opacity-50 mt-2 cursor-pointer flex items-center justify-center gap-2"
        >
          {loadingAction === 'login' || loadingAction === 'signup' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>{isLogin ? 'SIGNING IN…' : 'CREATING ACCOUNT…'}</span>
            </>
          ) : (
            <span>{isLogin ? 'SIGN IN WITH EMAIL' : 'CREATE ACCOUNT'}</span>
          )}
        </button>
      </form>

      {/* ========================================================================= */}
      {/* 3. GOOGLE SIGN-IN BUTTON BELOW MAIN CREDENTIAL FORM                        */}
      {/* ========================================================================= */}
      <div className="mt-6 pt-5 border-t border-[#E8DCCF]/80 relative z-10">
        <div className="relative text-center mb-4">
          <span className="bg-white px-3 text-[11px] text-[#A8928D] uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          id="google-signin-btn"
          onClick={handleGoogleAuth}
          disabled={loadingAction !== null}
          className="w-full py-2.5 px-4 rounded-xl border border-[#E8DCCF] bg-[#FAF6F0]/80 hover:bg-[#FDF2F5] hover:border-[#DFC598] text-[#2A1C19] font-medium text-xs tracking-wider transition-all shadow-2xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          {loadingAction === 'google' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#7A223B]" />
              <span>CONNECTING TO GOOGLE…</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#A8928D] mt-4 leading-relaxed font-light">
          By continuing, you agree to Sunbloom Adorn's{' '}
          <a href="/terms" className="text-[#7A223B] underline hover:text-[#5E152A]">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#7A223B] underline hover:text-[#5E152A]">
            Privacy Policy
          </a>.
        </p>
      </div>

    </div>
  );
}
