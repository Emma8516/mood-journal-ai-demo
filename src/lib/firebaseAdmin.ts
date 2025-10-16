// src/lib/firebaseAdmin.ts
//後端 Admin SDK 初始化（用 FIREBASE_* 讀環境變數），提供 adminAuth、adminDb
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawKey) {
  // 直接在啟動時就告警，避免後面 verify 才 401
  console.error("[admin] Missing envs:",
    { projectId: !!projectId, clientEmail: !!clientEmail, privateKey: !!rawKey });
  throw new Error("Missing Firebase Admin credentials in .env.local");
}

const privateKey = rawKey.replace(/\\n/g, "\n");

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId, 
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

