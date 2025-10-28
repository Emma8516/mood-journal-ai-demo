// src/components/Navbar.tsx 
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/new", label: "New entry", authOnly: true },//登入後才顯示
  { href: "/journals", label: "Your journal", authOnly: true },//登入後才顯示
];

export default function Navbar() {
  const pathname = usePathname(); //目前在哪一頁
  const router = useRouter(); //程式控制導頁
  const [uid, setUid] = useState<string | null>(null); //保存「登入狀態」
  const [menuOpen, setMenuOpen] = useState(false); //手機版選單的開關
  const [signingOut, setSigningOut] = useState(false); //避免重複點擊
  const isHome = pathname === "/"; //快速判斷是不是HomePage

  //監聽 Firebase 登入狀態變化
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();  
  }, []);


//手機版換頁面菜單收起
  useEffect(() => setMenuOpen(false), [pathname]);

  //判斷這個連結是不是當前頁面
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

//根據 active 狀態回傳不同的樣式
  const navChip = (active = false) =>
    [
      "px-3 py-1.5 rounded-full transition text-sm font-semibold",
      active ? "bg-white/15" : "hover:bg-white/10 text-white/80 hover:text-white",
      "focus:outline-none focus:ring-2 focus:ring-blue-500",
    ].join(" ");

  // 過濾可見連結
  const visibleLinks = links
    .filter((l) => !l.authOnly || uid)//未登入無法瀏覽私人頁面
    .filter((l) => !(isHome && l.href === "/"))//在首頁不要顯示home
    .filter((l) => !(uid && l.href === "/"));//使用者已登入不要顯示home

  // 手機版要不要顯示漢堡選單
  const showMobileMenu = 
  visibleLinks.length > 0 // 有可見連結
  || (!uid && !isHome) // 沒登入 + 不在首頁
  || !!uid;// 已登入

  //當使用者點擊Signout按鈕時，安全地登出 Firebase，並自動導回首頁，同時避免重複點擊與報錯
  async function handleSignOut() {
    if (signingOut) return; //防止重複登出
    setSigningOut(true);
    try {
      await signOut(auth); //向 Firebase 要求：幫我登出
      router.push("/"); //導航到 / 頁面
    } catch (err) {
      alert("Sign out failed. Please try again.");
    } finally {
      setSigningOut(false); //按鈕恢復
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-white">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-90">
          Mood Journal <span className="text-indigo-400">AI</span>
        </Link>

        {/* 電腦版 */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1">
            {/* 依登入狀態與是否首頁決定要不要顯示*/}
            {visibleLinks.map(({ href, label }) => ( 
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={navChip(isActive(href))}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* 行為按鈕  */}
          {!uid && !isHome ? (
            <div className="flex items-center gap-1">
              <Link href="/login" className={navChip(false)}>
                Sign in
              </Link>
              <Link href="/register" className={navChip(false)}>
                Create account
              </Link>
            </div>
          ) : uid ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className={navChip(false)}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          ) : null}
        </div>

        {/* 手機漢堡（有內容時才出現） */}
        {showMobileMenu && (
          <button
            type="button"
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 transition"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </nav>

      {/* 手機下拉（套 navChip） */}
      {showMobileMenu && (
        <div
          className={[
            "sm:hidden overflow-hidden border-t border-white/10 bg-white/5 backdrop-blur transition-all font-semibold",
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="mx-auto max-w-6xl px-4 py-3 text-white">
            <div className="flex flex-col gap-1">
              {visibleLinks.map(({ href, label }) => (
                <Link key={href} href={href} className={navChip(isActive(href))}>
                  {label}
                </Link>
              ))}

              {!uid && !isHome ? (
                <>
                  <Link href="/login" className={navChip(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className={navChip(false)}>
                    Create account
                  </Link>
                </>
              ) : uid ? (
<button
  type="button"
  onClick={handleSignOut}
  disabled={signingOut}
  className={`${navChip(false)} justify-start text-left w-full`}
>
  {signingOut ? "Signing out…" : "Sign out"}
</button>

              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}






