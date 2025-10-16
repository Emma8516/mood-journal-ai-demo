// src/lib/firebase.ts
//前端 SDK 初始化（用 NEXT_PUBLIC_* 讀環境變數），供登入取得 auth.currentUser 與 getIdToken()。
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth（預設長登）
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Google Provider
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);
