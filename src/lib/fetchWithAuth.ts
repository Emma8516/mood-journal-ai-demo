//src/lib/fetchWithAuth.ts
//在瀏覽器端用 fetch 自動附上 Firebase ID Token（Authorization: Bearer <token>），給需要登入的 API 用
"use client";
import { auth } from "@/lib/firebase";

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.method && init.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
