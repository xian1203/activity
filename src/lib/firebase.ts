// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGh9zscknsK2NNax6nCrFbCXgytAbXblE",
  authDomain: "activity-ef64a.firebaseapp.com",
  projectId: "activity-ef64a",
  storageBucket: "activity-ef64a.firebasestorage.app",
  messagingSenderId: "1026662126123",
  appId: "1:1026662126123:web:e5f2343fb476c88523906e",
  databaseURL: "https://activity-ef64a-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
