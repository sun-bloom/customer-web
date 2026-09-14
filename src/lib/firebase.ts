// src/lib/firebase.ts
// Customer Storefront — Firebase Authentication Client Module

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyB0Fz9JvR_1QlW-KIiNCBaUA7ftgs4r3Ow',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'sunbloom-a5e7b.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ||
    'sunbloom-a5e7b',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'sunbloom-a5e7b.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    '539317473477',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    import.meta.env.PUBLIC_FIREBASE_APP_ID ||
    '1:539317473477:web:a49e5a323f4bc382b020ac',
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID ||
    'G-XWGQPGRT6P',
};

// Initialize Firebase client safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerWithEmail(email: string, password: string, displayName?: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function loginWithGoogleRedirect(): Promise<void> {
  await signInWithRedirect(auth, googleProvider);
}

export async function checkRedirectResult(): Promise<User | null> {
  try {
    const res = await getRedirectResult(auth);
    return res?.user || null;
  } catch (err) {
    throw err;
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getCustomerIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken();
}

export const getIdToken = getCustomerIdToken;

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
