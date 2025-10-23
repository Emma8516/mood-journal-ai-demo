// src/app/journals/page.tsx
"use client";

import { ButtonLink } from "@/components/ui/Button";
import MoodJar from "@/components/viz/MoodJar";
import { useJournals, deleteJournal } from "@/features/journals/client";
import { type JournalDoc } from "@/lib/types";
import { useState, useMemo } from "react";
import JournalItem from "@/components/journals/JournalItem";
import MonthsSidebar from "@/components/journals/MonthsSidebar";

export default function JournalsPage() {
  const { months, selectedMonth, setSelectedMonth, rows, loading, error, loadLatest, refresh } =
    useJournals();
  const [openId, setOpenId] = useState<string | null>(null);
  const [opErr, setOpErr] = useState<string>("");

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    []
  );

  const jarItems = rows
    .filter((r) => r.mood?.label)
    .map((r) => ({ id: r.id, label: r.mood!.label }));

  async function handleDelete(id: string) {
    setOpErr("");
    try {
      await deleteJournal(id);
      if (openId === id) setOpenId(null);
      await refresh();
    } catch (e: any) {
      setOpErr(e?.message ?? "Delete failed.");
    }
  }

  return (
    <main className="min-h-[calc(100vh-120px)] flex items-start justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-6">
        {/* 左側：月份 */}
        <MonthsSidebar
          months={months}
          selected={selectedMonth}
          onSelect={(m) => setSelectedMonth(m)}
          onLatest={() => {
            setSelectedMonth("");
            loadLatest();
          }}
        />

        {/* 右側：內容 */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 text-white">
          <header className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">
              {selectedMonth ? `Your journal – ${selectedMonth}` : "Your journal"}
            </h1>

            {/* 統一按鈕風格：primary */}
            <ButtonLink href="/new" variant="primary">
              New entry
            </ButtonLink>
          </header>

          {(error || opErr) && (
            <p className="mt-4 text-sm text-red-400">{error || opErr}</p>
          )}

          <div className="mt-6 flex justify-center">
            <MoodJar items={jarItems} className="max-md:hidden" />
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState selectedMonth={selectedMonth} />
          ) : (
            <ul className="mt-6 space-y-3">
              {rows.map((r: JournalDoc) => {
                const isOpen = openId === r.id;
                const prettyDate = (() => {
                  try {
                    return formatter.format(new Date(r.dateKey));
                  } catch {
                    return r.dateKey;
                  }
                })();

                return (
                  <JournalItem
                    key={r.id}
                    row={r}
                    open={isOpen}
                    onToggle={() => setOpenId((id) => (id === r.id ? null : r.id))}
                    prettyDate={prettyDate}
                    onDelete={handleDelete}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

/* Loading */
function LoadingSkeleton() {
  return (
    <ul className="mt-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="rounded-xl border border-white/10 p-4 animate-pulse">
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="mt-3 h-4 w-3/4 bg-white/10 rounded" />
          <div className="mt-2 h-4 w-2/3 bg-white/10 rounded" />
        </li>
      ))}
    </ul>
  );
}

/* 空狀態 */
function EmptyState({ selectedMonth }: { selectedMonth: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-white/10 p-8 text-center">
      <p className="text-white/70">
        {selectedMonth ? "No entries for this month." : "No entries yet."}
      </p>
      {!selectedMonth && (
        <>
          <p className="mt-1 text-sm text-white/50">
            Start your first journal entry to see AI mood analysis here.
          </p>
          {/* 統一按鈕風格：primary；只保留外距 */}
          <ButtonLink href="/new" variant="primary" className="mt-6">
            Write your first entry
          </ButtonLink>
        </>
      )}
    </div>
  );
}

