//src/components/journals/AIResultCard.tsx
"use client";
import type { MoodLabel } from "@/lib/types";
import { moodColor } from "@/lib/ui";

export default function AIResultCard({ label, score, advice }:{
  label: MoodLabel; score: number; advice: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 p-4">
      <div className="text-xs uppercase tracking-wide text-white/50">AI result</div>
      <div className="mt-2 flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${moodColor[label]} ring-1 ring-white/30`} />
        Mood:&nbsp;<b>{label}</b> ({score}/5)
      </div>
      <div className="mt-1">{advice}</div>
    </div>
  );
}
