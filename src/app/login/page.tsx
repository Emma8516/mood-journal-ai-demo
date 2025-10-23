// src/app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { Button, ButtonLink } from "@/components/ui/Button";
import { authErrorMessage } from "@/lib/authErrors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/new");
    } catch (e: any) {
      setErr(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setErr("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/new");
    } catch (e: any) {
      setErr(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-white space-y-6">
        {/* 標題 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Sign in to your account</h1>
          <p className="text-sm text-white/70">Welcome back to Mood Journal AI</p>
        </div>

        {/* Google 登入（統一風格） */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 px-5 py-3 transition disabled:opacity-60"
            aria-label="Continue with Google"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.2 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.3 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.5 0 19.3-7.6 19.3-20 0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.3 29.4 4 24 4 16 4 9.1 8.6 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.1 0 10-1.9 13.6-5.3l-6.3-5.2C29.3 35.7 26.8 36 24 36c-5.2 0-9.6-3.8-10.7-8.8l-6.7 5.2C9.1 39.4 16 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 5-5.5 8.8-10.7 8.8-3 0-5.7-1.1-7.8-3l-6.6 5.1C12 42.1 17.7 44 24 44c10.5 0 19.3-7.6 19.3-20 0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

        {/* 分隔線 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-transparent px-3 text-xs text-white/50">or</span>
          </div>
        </div>

        {/* Email 登入表單 */}
        <form onSubmit={handleLogin} className="space-y-3" noValidate>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* 主按鈕 */}
          <Button type="submit" disabled={loading} variant="primary" className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* 錯誤訊息 */}
        {err && (
          <p
            className="text-sm text-red-400 text-center"
            role="alert"
            aria-live="polite"
          >
            {err}
          </p>
        )}

        {/* 註冊連結 */}
        <p className="text-center text-sm text-white/60">
          Don’t have an account?{" "}
          <ButtonLink href="/register" variant="secondary">
            Create account
          </ButtonLink>
        </p>
      </div>
    </main>
  );
}


