// config/firebase.js - Single Firebase configuration file
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, query, orderBy  } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxHwR1xz0A12pGrZuNIukcB3Vf_6yM7JA",
  authDomain: "mentii-7f725.firebaseapp.com",
  projectId: "mentii-7f725",
  storageBucket: "mentii-7f725.firebasestorage.app",
  messagingSenderId: "438647966539",
  appId: "1:438647966539:web:162a079b84405bfc86b6ce"
};



// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
