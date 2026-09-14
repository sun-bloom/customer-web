// src/lib/authErrors.ts
// Centralized, customer-friendly authentication error mapper for Sunbloom Adorn

export function mapFirebaseAuthError(error: any): string {
  if (!error) {
    return 'Unable to sign in right now. Please try again.';
  }

  // Development logging only - never expose technical details to customer UI
  if (import.meta.env.DEV) {
    console.warn('[Auth Debug Code]:', error?.code, error?.message || error);
  }

  // Extract Firebase error code if present
  let code = '';
  if (typeof error === 'string') {
    const match = error.match(/auth\/[a-z-]+/);
    if (match) code = match[0];
  } else if (error?.code && typeof error.code === 'string') {
    code = error.code;
  } else if (error?.message && typeof error.message === 'string') {
    const match = error.message.match(/auth\/[a-z-]+/);
    if (match) code = match[0];
  }

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';

    case 'auth/user-not-found':
      return 'No account found with this email address.';

    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';

    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password.';

    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';

    case 'auth/weak-password':
      return 'Your password is too weak. Please choose a stronger password.';

    case 'auth/missing-password':
      return 'Please enter your password.';

    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';

    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';

    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window. Please allow popups for this site and try again.';

    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';

    case 'auth/cancelled-popup-request':
      return 'Another Google sign-in request is already in progress.';

    case 'auth/network-request-failed':
      return 'Unable to connect to the authentication service. Please check your internet connection and try again.';

    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently unavailable.';

    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Please sign in using the original sign-in method.';

    default:
      // If error message is already a custom user-friendly validation error without technical Firebase text, use it
      if (
        typeof error.message === 'string' &&
        !error.message.includes('Firebase:') &&
        !error.message.includes('auth/') &&
        !error.message.includes('INTERNAL') &&
        !error.message.includes('TypeError') &&
        !error.message.includes('Error:')
      ) {
        return error.message;
      }
      return 'Unable to sign in right now. Please try again.';
  }
}
