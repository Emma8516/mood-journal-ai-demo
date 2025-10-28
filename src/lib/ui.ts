// src/lib/ui.ts
import type { MoodLabel } from "@/lib/types";

/** Tailwind color classes for each mood label — soft translucent version */
export const moodColor: Record<MoodLabel, string> = {
  positive: "bg-emerald-300/80",   // 柔和薄荷綠，代表正向、希望
  neutral:  "bg-zinc-400/80",      // 灰中帶溫，代表中性/平靜
  negative: "bg-rose-400/80",      // 柔玫瑰紅，代表沮喪/低潮
  stressed: "bg-amber-400/80",     // 溫暖琥珀，代表壓力/緊張
  anxious:  "bg-sky-300/80",       // 冷靜天藍，代表焦慮但輕盈
  sad:      "bg-blue-400/80",      // 深藍，代表悲傷或低落
  angry:    "bg-red-400/80",       // 柔紅偏暗，代表憤怒但不刺眼
  grateful: "bg-yellow-300/80",    // 暖黃光感，代表感激與溫暖
  excited:  "bg-pink-400/80",      // 粉紅紫，代表興奮或期待
  tired:    "bg-violet-400/80",    // 霧紫色，代表疲倦與放鬆
  unknown:  "bg-slate-500/60",     // 淡灰霧色，未知或未分類
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


