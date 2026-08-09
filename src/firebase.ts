// Firebase app initialization — exports the Firestore `db` instance used across the app.
// Firebase web API keys are intentionally public-safe; security is enforced via Firestore Rules.
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0Jdg1RBxsEUTyoWFnEdRm-XcjoA6gFDc",
  authDomain: "sudoku-together-mode.firebaseapp.com",
  projectId: "sudoku-together-mode",
  storageBucket: "sudoku-together-mode.firebasestorage.app",
  messagingSenderId: "116330285995",
  appId: "1:116330285995:web:3640f3df0d5dc1f73ce0ee",
  measurementId: "G-NKRBL6CL4M"
};

// Prevent duplicate app initialization during hot module replacement
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
