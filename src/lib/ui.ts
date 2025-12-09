// src/lib/ui.ts
import type { MoodLabel } from "@/lib/types";

/** Tailwind color classes for each mood label — soft translucent version */
export const moodColor: Record<MoodLabel, string> = {
  positive: "bg-emerald-300/80",   
  neutral:  "bg-zinc-400/80",      
  negative: "bg-rose-400/80",      
  stressed: "bg-amber-400/80",    
  anxious:  "bg-sky-300/80",       
  sad:      "bg-blue-400/80",      
  angry:    "bg-red-400/80",      
  grateful: "bg-yellow-300/80",    
  excited:  "bg-pink-400/80",     
  tired:    "bg-violet-400/80",    
  unknown:  "bg-slate-500/60",     
};


/** Helper: get a ready-to-use class string for a mood dot */
export function moodDotClass(label: MoodLabel, extra = "") {
  return [
    "inline-block h-2.5 w-2.5 rounded-full",
    moodColor[label],
    "ring-1 ring-white/25 shadow-[0_0_6px_rgba(255,255,255,0.15)]",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}


