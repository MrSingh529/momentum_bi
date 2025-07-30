import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  projectId: "service-insights-dashboard",
  appId: "1:391015958608:web:436cf62b2ed8efa0ba6955",
  storageBucket: "service-insights-dashboard.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "service-insights-dashboard.firebaseapp.com",
  messagingSenderId: "391015958608",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Set persistence to local to keep user signed in
setPersistence(auth, browserLocalPersistence);


export { db, auth };