"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button, ButtonLink } from "@/components/ui/Button";

const links = [
  { href: "/", label: "Home" },
  { href: "/new", label: "New entry", authOnly: true },
  { href: "/journals", label: "Your journal", authOnly: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isHome = pathname === "/"; // ✅ 判斷是否為首頁

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  // ✅ 首頁不顯示 Home
  const visibleLinks = links
    .filter((l) => !l.authOnly || uid)
    .filter((l) => !(isHome && l.href === "/"))
    .filter((l) => !(uid && l.href === "/"));

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(auth);
      setMenuOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-white">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-90">
          Mood Journal <span className="text-indigo-400">AI</span>
        </Link>

        {/* 桌機版 */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1">
            {visibleLinks.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "px-3 py-1.5 rounded-full transition text-sm",
                    active ? "bg-white/15" : "hover:bg-white/10 text-white/80 hover:text-white",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ✅ 首頁時不顯示登入/註冊 */}
          {!uid ? (
            !isHome ? (
              <div className="flex items-center gap-2">
                <ButtonLink href="/login" variant="secondary" size="sm">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/register" variant="primary" size="sm">
                  Create account
                </ButtonLink>
              </div>
            ) : null
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            </div>
          )}
        </div>

        {/* 手機漢堡選單 */}
        <button
          type="button"
          className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 transition"
          aria-label="Toggle menu"
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* 手機下拉選單 */}
      <div
        id="mobile-menu"
        className={[
          "sm:hidden overflow-hidden border-t border-white/10 bg-white/5 backdrop-blur transition-all",
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 text-white">
          <div className="flex flex-col gap-1">
            {visibleLinks.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "block rounded-md px-3 py-2 text-sm transition",
                    active ? "bg-white/15" : "hover:bg-white/10 text-white/80 hover:text-white",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}

            {/* ✅ 首頁時不顯示登入/註冊 */}
            {!uid ? (
              !isHome ? (
                <>
                  <ButtonLink
                    href="/login"
                    variant="secondary"
                    size="md"
                    className="w-full justify-center mt-1"
                  >
                    Sign in
                  </ButtonLink>
                  <ButtonLink
                    href="/register"
                    variant="primary"
                    size="md"
                    className="w-full justify-center mt-1"
                  >
                    Create account
                  </ButtonLink>
                </>
              ) : null
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-1 w-full justify-center"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



