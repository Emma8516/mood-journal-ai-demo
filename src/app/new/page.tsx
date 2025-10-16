"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import type { MoodLabel } from "@/lib/types";
import { Button } from "@/components/ui/Button";

type AnalyzeResult = { mood: { label: MoodLabel; score: number }; advice: string };

export default function NewEntryPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");
  const router = useRouter();

  async function analyze() {
    setErr("");

    // 後端 /api/analyze 要求至少 10 個字，這裡跟它一致
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

      // ✅ 用 fetchWithAuth，自動帶 Authorization 與 Content-Type
      const res = await fetchWithAuth("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      // 對 401/其他錯誤友善提示
      if (res.status === 401) {
        setErr("Please sign in first.");
        setResult(null);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Analyze failed.");
      setResult(data as AnalyzeResult);
    } catch (e: any) {
      setErr(e?.message ?? "Analyze failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setErr("");
    if (!result) return;

    try {
      setSaving(true);
      const res = await fetchWithAuth("/api/journals", {
        method: "POST",
        body: JSON.stringify({
          text,
          mood: result.mood,
          advice: result.advice,
        }),
      });

      if (res.status === 401) {
        setErr("Please sign in first.");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed.");
      router.push("/journals");
    } catch (e: any) {
      setErr(e?.message ?? "Save failed.");
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

        <div className="mt-4 flex gap-3">
          <Button onClick={analyze} disabled={loading}>
            {loading ? "Analyzing…" : "Analyze"}
          </Button>
          <Button onClick={save} disabled={!result || saving} className="bg-white/10 hover:bg-white/15">
            {saving ? "Saving…" : "Save to journal"}
          </Button>
        </div>

        {err && (
          <p className="mt-4 text-sm text-red-400" role="alert" aria-live="polite">
            {err}
          </p>
        )}

        {result && (
          <div className="mt-6 rounded-xl border border-white/10 p-4">
            <div className="text-xs uppercase tracking-wide text-white/50">AI result</div>
            <div className="mt-2">
              Mood: <b>{result.mood.label}</b> ({result.mood.score}/5)
            </div>
            <div className="mt-1">Advice: {result.advice}</div>
          </div>
        )}
      </div>
    </main>
  );
}


