"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { JournalDoc } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { moodColor } from "@/lib/ui";
import MoodJar from "@/components/viz/MoodJar";

export default function JournalsPage() {
  const [rows, setRows] = useState<JournalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null); // which item is expanded

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth("/api/journals?take=20");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load journals.");
        setRows(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load journals.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    []
  );

  return (
    <main className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-white">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Your journal</h1>
          <ButtonLink href="/new" className="px-5 py-2 rounded-full text-sm">
            New entry
          </ButtonLink>
        </header>

        {err && (
          <p className="mt-4 text-sm text-red-400" role="alert" aria-live="polite">
            {err}
          </p>
        )}

        {loading ? (
          <ul className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="rounded-xl border border-white/10 p-4 animate-pulse">
                <div className="h-3 w-24 bg-white/10 rounded" />
                <div className="mt-3 h-4 w-3/4 bg-white/10 rounded" />
                <div className="mt-2 h-4 w-2/3 bg-white/10 rounded" />
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-white/70">No entries yet.</p>
            <p className="mt-1 text-sm text-white/50">
              Start your first journal entry to see AI mood analysis here.
            </p>
            <ButtonLink href="/new" className="mt-6 px-6 py-3 rounded-full">
              Write your first entry
            </ButtonLink>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {rows.map((r) => {
              const prettyDate = (() => {
                try {
                  return formatter.format(new Date(r.dateKey));
                } catch {
                  return r.dateKey;
                }
              })();

              const isOpen = openId === r.id;

              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-white/10 bg-white/[.03] hover:bg-white/[.06] transition"
                >
                  {/* Header row (click to toggle) */}
                  <button
                    type="button"
                    onClick={() => setOpenId((id) => (id === r.id ? null : r.id))}
                    aria-expanded={isOpen}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="text-xs uppercase tracking-wide text-white/50">
                        <time>{prettyDate}</time>
                      </div>
                      {/* preview line when collapsed */}
                      {!isOpen && (
                        <p className="mt-1 text-white/80 line-clamp-2">
                          {r.text}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
                        <span
                         aria-hidden
                         title={r.mood.label}
                         className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${moodColor[r.mood.label]} ring-1 ring-white/30`}
                          />

                          Mood:&nbsp;<b className="text-white">{r.mood.label}</b>
                          <span className="ml-1.5 text-white/70">({r.mood.score}/5)</span>
                        </span>
                        {!isOpen && r.advice && (
                          <span className="text-white/60 line-clamp-1">
                            Advice: {r.advice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* chevron */}
                    <svg
                      className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Expandable content */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0 text-sm text-white/85 space-y-4">
                        <section>
                          <div className="text-xs uppercase tracking-wide text-white/50">
                            Entry
                          </div>
                          <p className="mt-1 whitespace-pre-wrap">{r.text}</p>
                        </section>

                        {r.advice && (
                          <section>
                            <div className="text-xs uppercase tracking-wide text-white/50">
                              AI advice
                            </div>
                            <p className="mt-1 whitespace-pre-wrap">{r.advice}</p>
                          </section>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
    </main>
  );
}

