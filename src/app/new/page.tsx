// src/app/new/page.tsx
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { MoodLabel } from "@/lib/types";

import {
  analyzeText,
  createJournal,
  type AnalyzeResult,
} from "@/features/journals/client";

export default function NewEntryPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");
  const router = useRouter();

  // --- 分析功能 ---
  async function analyze() {
    setErr("");

    if (!text || text.trim().length < 10) {
      setErr("Please enter at least 10 characters.");
      return;
    }

    if (!auth.currentUser) {
      setErr("Please sign in first.");
      return;
    }

    try {
      setLoading(true);
      const data = await analyzeText(text);
      setResult(data);
    } catch (e: any) {
      const msg = e?.message || "Analyze failed.";
      setErr(msg.includes("401") ? "Please sign in first." : msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // --- 儲存功能 ---
  async function save() {
    setErr("");

    if (!text.trim()) {
      setErr("Please write something before saving.");
      return;
    }

    if (!auth.currentUser) {
      setErr("Please sign in first.");
      return;
    }

    try {
      setSaving(true);
      await createJournal({
        text,
        mood: result?.mood ?? { label: "unknown" as MoodLabel, score: 1 },
        advice: result?.advice ?? "No AI advice generated.",
      });

      router.push("/journals");
    } catch (e: any) {
      const msg = e?.message || "Save failed.";
      setErr(msg.includes("401") ? "Please sign in first." : msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-white">
        <h1 className="text-2xl font-semibold">How are you feeling today?</h1>
        <p className="mt-1 text-sm text-white/60">
          Write a few sentences about your day. We’ll analyze your mood and suggest grounded advice.
        </p>

        <textarea
          className="mt-6 w-full min-h-[160px] rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Write about your feelings, events, or thoughts…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 按鈕區：統一風格 */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={analyze}
            disabled={loading}
            variant="primary"
            className="flex-1"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </Button>

          <Button
            onClick={save}
            disabled={!text.trim() || saving}
            variant="secondary"
            className="flex-1"
          >
            {saving ? "Saving…" : "Save to journal"}
          </Button>
        </div>

        {err && (
          <p
            className="mt-4 text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            {err}
          </p>
        )}

        {result && (
          <div className="mt-6 rounded-xl border border-white/10 p-4">
            <div className="text-xs uppercase tracking-wide text-white/50">
              AI result
            </div>
            <div className="mt-2">
              Mood: <b>{result.mood.label}</b> ({result.mood.score}/5)
            </div>
            <div className="mt-1">Advice: {result.advice}</div>
          </div>
        )}

        {!result && text.trim() && (
          <p className="mt-4 text-sm text-white/40 italic">
            (No AI analysis yet — your entry will still be saved.)
          </p>
        )}
      </div>
    </main>
  );
}




