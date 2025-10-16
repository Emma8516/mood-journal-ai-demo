"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const visibleLinks = links
    .filter((l) => !l.authOnly || uid)
    .filter((l) => !(uid && l.href === "/")); // 👈 logged-in: hide Home

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

        {/* desktop */}
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

          {!uid ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-sm transition"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-90 transition"
              >
                Create account
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-4 py-2 text-sm rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-60 transition"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          )}
        </div>

        {/* mobile hamburger */}
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

      {/* mobile dropdown */}
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

            {!uid ? (
              <>
                <Link
                  href="/login"
                  className="block rounded-md px-3 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition mt-1"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block rounded-md px-3 py-2 text-sm bg-gradient-to-br from-indigo-600 to-violet-600 hover:opacity-90 transition mt-1"
                >
                  Create account
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm bg-white/10 hover:bg-white/15 disabled:opacity-60 transition"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



