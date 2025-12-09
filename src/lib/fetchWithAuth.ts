//src/lib/fetchWithAuth.ts
//在瀏覽器端用 fetch 自動附上 Firebase ID Token（Authorization: Bearer <token>），給需要登入的 API 用
"use client";
import { auth } from "@/lib/firebase";

// Token 緩存（避免並行請求時重複獲取）
// 使用 Map 來存儲不同用戶的 token，key 為 uid
let tokenCacheMap = new Map<string, { token: string; expiresAt: number }>();
const TOKEN_CACHE_DURATION = 50 * 60 * 1000; // 50 分鐘（Firebase token 通常有效 1 小時）

// 監聽用戶變化，清除舊用戶的緩存
let authListenerInitialized = false;
if (typeof window !== "undefined" && !authListenerInitialized) {
  authListenerInitialized = true;
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // 用戶登出，清除所有緩存
      tokenCacheMap.clear();
    } else {
      // 用戶切換，清除其他用戶的緩存
      const currentUid = user.uid;
      for (const [uid] of tokenCacheMap) {
        if (uid !== currentUid) {
          tokenCacheMap.delete(uid);
        }
      }
    }
  });
}

async function getCachedToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    tokenCacheMap.clear();
    return null;
  }

  const uid = user.uid;
  const cached = tokenCacheMap.get(uid);

  // 檢查緩存是否有效
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  // 獲取新 token（Firebase SDK 內部也有緩存，這裡只是額外優化）
  try {
    const token = await user.getIdToken(false); // false = 不強制刷新，使用 Firebase 內部緩存
    tokenCacheMap.set(uid, {
      token,
      expiresAt: Date.now() + TOKEN_CACHE_DURATION,
    });
    return token;
  } catch (error) {
    console.error("Failed to get ID token:", error);
    tokenCacheMap.delete(uid);
    return null;
  }
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = await getCachedToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.method && init.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
