// src/components/viz/MoodJar.tsx
import React from "react";
import type { MoodLabel } from "@/lib/types";
import { moodColor } from "@/lib/ui";

/**
 * Glass jar that collects colored dots.
 * - CSS-only animation
 * - Content clipped to jar silhouette
 * - No hooks (server-safe)
 */
export default function MoodJar({
  items,
  className = "",
  max = 80,
  hideOnMobile = false,
}: {
  items: { id: string; label: MoodLabel }[];
  className?: string;
  max?: number;
  hideOnMobile?: boolean;
}) {
  return (
    <div
      className={[
        "pointer-events-none select-none z-30",
        // sticky so it tracks scroll near top
        "md:sticky md:top-24",
        hideOnMobile ? "hidden md:block" : "",
        className,
      ].join(" ")}
      aria-hidden
    >
      <div className="relative mx-auto h-64 w-40">
        {/* Jar silhouette (for clipping) */}
        <div
          className="
            absolute inset-0
            rounded-b-[40px]
            border-2 border-white/40
            bg-white/10 backdrop-blur-sm
            before:absolute before:inset-x-8 before:top-0 before:h-5
            before:rounded-b before:bg-white/15 before:border-x before:border-white/30
            after:absolute after:inset-x-12 after:top-5 after:h-2
            after:rounded-b after:bg-white/15
          "
          style={{
            // Clip the inner content into a jar-ish polygon
            // neck -> shoulders -> body -> bottom curve (approx)
            clipPath:
              "polygon(30% 5%, 70% 5%, 78% 10%, 85% 18%, 85% 82%, 80% 92%, 70% 97%, 30% 97%, 20% 92%, 15% 82%, 15% 18%, 22% 10%)",
          }}
        />

        {/* Highlight strip */}
        <div className="pointer-events-none absolute left-3 top-6 h-36 w-3 rounded-full bg-white/20 blur-[1px] opacity-70" />

        {/* Dots layer (clipped using same polygon) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath:
              "polygon(30% 5%, 70% 5%, 78% 10%, 85% 18%, 85% 82%, 80% 92%, 70% 97%, 30% 97%, 20% 92%, 15% 82%, 15% 18%, 22% 10%)",
          }}
        >
          {items.slice(0, max).map((it, i) => (
            <span
              key={it.id}
              className={[
                "absolute rounded-full opacity-90",
                moodColor[it.label],
                "animate-[mj-fall_600ms_ease-out_forwards]",
              ].join(" ")}
              style={{
                height: "10px",
                width: "10px",
                left: `${(i * 37) % 78 + 12}%`,
                top: `${(i % 6) * 6 + 10}%`,
                animationDelay: `${(i % 12) * 90}ms`,
                boxShadow: "0 0 0 1px rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes mj-fall {
          0% {
            transform: translateY(-14px);
          }
          100% {
            transform: translateY(160px);
          }
        }
      `}</style>
    </div>
  );
}

