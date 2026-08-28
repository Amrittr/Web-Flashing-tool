import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAU3UF08gJBkoyoJmBCIfayVdFjWxlC8lU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "online-flashing-tool-for-esp.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://online-flashing-tool-for-esp-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "online-flashing-tool-for-esp",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "online-flashing-tool-for-esp.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "285032332049",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:285032332049:web:d3b7ce376f5c563f0daab0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TWTWKCS53X",
};

// Initialize Firebase with fallback configuration
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;
