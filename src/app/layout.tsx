import "./globals.css";
import { inter, sora } from "./fonts";


import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${sora.variable}`}>
      <body className="font-[var(--font-inter)] bg-[rgb(var(--bg))] text-[rgb(var(--fg))] antialiased">
      <Navbar />
        {/* 全域底色層（避免載入瞬間閃白） */}
        <div aria-hidden className="fixed inset-0 -z-50 bg-[rgb(var(--bg))]" />
        {children}
        <Footer />
      </body>
    </html>
  );
}


