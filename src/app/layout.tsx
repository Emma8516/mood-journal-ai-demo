// src/app/layout.tsx
import "./globals.css";
import { sora } from "./fonts";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={` ${sora.variable}`}>
<body className="font-[var(--font-sora)] text-white antialiased bg-gradient-to-br from-[#0a192f] via-[#1e3a8a] to-[#3b82f6] backdrop-blur-sm">








        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}



