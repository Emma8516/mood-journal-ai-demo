"use client";

import Navbar from "@/components/layout/Navbar";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function AnalyzePage() {
  const [text, setText] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("moodDraft") : null;
    if (saved) setText(saved);
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-white space-y-6">
          <header>
            <h1 className="text-2xl font-semibold">AI analysis</h1>
            <p className="mt-1 text-sm text-white/60">
              Here’s the text you wrote and a placeholder for the AI result.
            </p>
          </header>

          {/* Your input */}
          <section className="rounded-xl border border-white/10 p-4">
            <div className="text-xs uppercase tracking-wide text-white/50">Your input</div>
            <p className="mt-2 whitespace-pre-wrap text-white/80 italic">
              {text || "No draft found. Go back and write a new entry."}
            </p>
          </section>

          {/* AI result (placeholder) */}
          <section className="rounded-xl border border-white/10 p-4">
            <div className="text-xs uppercase tracking-wide text-white/50">AI result</div>
            <div className="mt-2 space-y-2 text-white/80">
              <div>
                Mood: <b className="text-white">—</b> (—/5)
              </div>
              <div>Advice: —</div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <ButtonLink href="/new" className="px-6 py-3 rounded-full">
              Write a new entry
            </ButtonLink>
            <Button className="bg-white/10 hover:bg-white/15">Save to journal</Button>
          </div>
        </div>
      </main>
    </>
  );
}
