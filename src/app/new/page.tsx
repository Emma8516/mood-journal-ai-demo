// src/app/new/page.tsx
"use client";

import { useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { MoodLabel } from "@/lib/types";

import {
  analyzeText,
  createJournal,
  type AnalyzeResult,
} from "@/features/journals/client";

const MIN_CHARS = 10;

export default function NewEntryPage() {
 
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  const router = useRouter();

  // 字數/是否可送出
  const charCount = text.trim().length;
  const canAnalyze = charCount >= MIN_CHARS && !loading && !!auth.currentUser;
  const canSave = !!text.trim() && !saving && !!auth.currentUser;

  // 顯示友善錯誤（401 → 提醒登入）
  const showError = useMemo(() => {
    if (!err) return "";
    return err.includes("401") ? "Please sign in first." : err;
  }, [err]);

  // 分析
  async function analyze() {
    setErr("");
    if (charCount < MIN_CHARS) {
      setErr(`Please enter at least ${MIN_CHARS} characters.`);
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

  //  儲存
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
      {/* 容器卡片*/}
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 text-white">
        {/* 標題 + 小提示 */}
        <header>
          <h1 className="text-2xl font-semibold">How are you feeling today?</h1>
          <p className="mt-1 text-sm text-white/60">
            Write a few sentences about your day. We’ll analyze your mood and suggest grounded advice.
          </p>
        </header>

        {/*輸入區（含字數提示）*/}
        <div className="mt-6 relative">
          <label htmlFor="entry" className="sr-only">
            Journal entry
          </label>

          <textarea
            id="entry"
            className="w-full min-h-[180px] rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write about your feelings, events, or thoughts…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* 字數提示（達標前顯示灰色，達標後淡綠） */}
          <div className="absolute bottom-2 right-3 text-xs">
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5",
                charCount >= MIN_CHARS
                  ? "bg-green-500/15 text-green-200 border border-green-400/20"
                  : "bg-white/10 text-white/70 border border-white/10",
              ].join(" ")}
            >
              {charCount}/{MIN_CHARS}
            </span>
          </div>
        </div>

        {/* 按鈕列 */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={analyze}
            disabled={!canAnalyze}
            variant="primary"
            className="flex-1"
            aria-disabled={!canAnalyze}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </Button>

          <Button
            onClick={save}
            disabled={!canSave}
            variant="secondary"
            className="flex-1"
            aria-disabled={!canSave}
          >
            {saving ? "Saving…" : "Save to journal"}
          </Button>
        </div>

        {/* 友善錯誤 */}
        {showError && (
          <p className="mt-4 text-sm text-red-400" role="alert" aria-live="polite">
            {showError}
          </p>
        )}

        {/* 分析結果（有結果才顯示）*/}
        {result && (
          <section
            aria-label="AI result"
            className="mt-6 rounded-xl border border-white/10 bg-white/[.03] p-4"
          >
            <div className="text-xs uppercase tracking-wide text-white/55">AI result</div>

            {/* Mood 膠囊 */}
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-sm">
              <span className="text-white/70">Mood:</span>
              <b className="text-white">{result.mood.label}</b>
              <span className="text-white/60">({result.mood.score}/5)</span>
            </div>

            {/* 建議 */}
            <p className="mt-3 text-white/85 leading-relaxed">
              <span className="text-white/60 text-sm uppercase tracking-wide">Advice: </span>
              {result.advice}
            </p>
          </section>
        )}

        {/* 尚未分析但有輸入 → 引導文字 */}
        {!result && text.trim() && (
          <p className="mt-4 text-sm text-white/40 italic">
            (No AI analysis yet — your entry will still be saved.)
          </p>
        )}
      </div>
    </main>
  );
}





