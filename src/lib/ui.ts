// src/lib/ui.ts
import type { MoodLabel } from "@/lib/types";

/** Tailwind color classes for each mood label */
export const moodColor: Record<MoodLabel, string> = {
  positive: "bg-emerald-400",
  neutral:  "bg-slate-400",
  negative: "bg-rose-500",
  stressed: "bg-amber-500",
  anxious:  "bg-sky-400",
  sad:      "bg-blue-400",
  angry:    "bg-red-500",
  grateful: "bg-yellow-400",
  excited:  "bg-fuchsia-500",
  tired:    "bg-violet-400",
};

/** Helper: get a ready-to-use class string for a mood dot */
export function moodDotClass(label: MoodLabel, extra = "") {
  return ["inline-block h-2.5 w-2.5 rounded-full", moodColor[label], extra]
    .filter(Boolean)
    .join(" ");
}

