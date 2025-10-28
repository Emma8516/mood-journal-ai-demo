// src/components/viz/MoodJar.tsx
import React from "react";
import type { MoodLabel } from "@/lib/types";
import { moodColor } from "@/lib/ui";


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
        "md:sticky md:top-24",
        
        className,
      ].join(" ")}
      aria-hidden
    >
    
      <div className="relative mx-auto h-80 w-56">

        {/* Jar silhouette (for clipping) */}
        <div
          className="
            absolute inset-0
            bg-white/15 backdrop-blur-sm
            
         
          "
          style={{
            clipPath:
              "polygon(30% 5%, 70% 5%, 78% 5%, 85% 18%, 85% 82%, 80% 92%, 70% 97%, 30% 97%, 20% 92%, 15% 82%, 15% 18%, 22% 5%)",
          }}
        />

        


        {/* Dots layer (clipped using same polygon) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath:
              "polygon(30% 5%, 70% 5%, 78% 5%, 85% 18%, 85% 82%, 80% 92%, 70% 97%, 30% 97%, 20% 92%, 15% 82%, 15% 18%, 22% 5%)",
          }}
        >
          {items.slice(0, max).map((it, i) => (
            <span
              key={it.id}
              className={[
                "absolute mj-dot",               
                moodColor[it.label],             
              ].join(" ")}
              style={{
                left: `${(i * 37) % 60 + 20}%`,
                top: `${(i % 6) * 6 + 10}%`,
                animationDelay: `${(i % 12) * 90}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


