// Firebase app initialization - exports the Firestore `db` instance used across the app.
// Environment variables are loaded via Vite (VITE_FIREBASE_*) with secure fallback defaults.
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyB0Jdg1RBxsEUTyoWFnEdRm-XcjoA6gFDc",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "sudoku-together-mode.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "sudoku-together-mode",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "sudoku-together-mode.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "116330285995",
  appId: env.VITE_FIREBASE_APP_ID || "1:116330285995:web:3640f3df0d5dc1f73ce0ee",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-NKRBL6CL4M"
};

// Prevent duplicate app initialization during hot module replacement
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);

// Safe export for Firebase Messaging (checking for service worker support, i.e. browser environment)
export const messaging = (typeof window !== "undefined" && "serviceWorker" in navigator)
  ? getMessaging(app)
  : null;
