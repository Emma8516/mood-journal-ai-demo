// src/lib/verifyToken.ts
//從 Authorization: Bearer <ID_TOKEN> 驗證 → 取得 uid
import { adminAuth } from "./firebaseAdmin";
import "server-only";

export async function getUidFromAuthHeader(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    console.warn("[auth] missing/invalid Authorization header:", authHeader);
    return null;
  }
  const idToken = authHeader.slice("Bearer ".length).trim();
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid ?? null;
  } catch (err: any) {
    console.error("[auth] verifyIdToken failed:", err?.code, err?.message);
    return null;
  }
}

