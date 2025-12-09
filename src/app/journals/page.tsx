// src/app/journals/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ButtonLink, Button } from "@/components/ui/Button";
import MoodJar from "@/components/viz/MoodJar";
import { useJournals, deleteJournal } from "@/features/journals/client";
import { type JournalDoc } from "@/lib/types";
import JournalItem from "@/components/journals/JournalItem";
import MonthsSidebar from "@/components/journals/MonthsSidebar";

export default function JournalsPage() {
  // ── 資料存取（自訂 hook）
  const {
    months,
    selectedMonth,
    setSelectedMonth,
    rows,
    loading,
    error,
    loadLatest,
    refresh,
    pagination,
    currentPage,
    loadPage,
  } = useJournals();

  // ── UI 狀態
  const [openId, setOpenId] = useState<string | null>(null);
  const [opErr, setOpErr] = useState<string>("");     // 操作錯誤訊息（刪除等）
  const [userName, setUserName] = useState<string>(""); // 使用者名稱（未登入顯示 "User"）
  const [showFilters, setShowFilters] = useState<boolean>(false); // 手機版展開/收起月份篩選

  // ── 監聽登入狀態 → 取得顯示名稱
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserName(u?.displayName || "User");
    });
    return () => unsub();
  }, []);

  // ── 日期格式化（列表使用）
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    []
  );

  // ── MoodJar 視覺化資料（只取有標記 mood 的項目）
  const jarItems = rows
    .filter((r) => r.mood?.label)
    .map((r) => ({ id: r.id, label: r.mood!.label }));

  // ── 刪除單一日記
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
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-6">
        {/* ───────────────── 左側：月份篩選 ───────────────── */}
        {/* 行動版：漢堡按鈕 + 可展開的篩選面板 */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            aria-expanded={showFilters}
            aria-controls="months-filter-panel"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
            Filters
          </button>

          {showFilters && (
            <div id="months-filter-panel" className="mb-4">
              <MonthsSidebar
                months={months}
                selected={selectedMonth}
                onSelect={(m) => {
                  setSelectedMonth(m);
                  setShowFilters(false);
                }}
                onLatest={() => {
                  setSelectedMonth("");
                  loadLatest(1);
                  setShowFilters(false);
                }}
              />
            </div>
          )}
        </div>

        {/* 桌機版：固定側欄 */}
        <div className="hidden md:block">
          <MonthsSidebar
            months={months}
            selected={selectedMonth}
            onSelect={(m) => setSelectedMonth(m)}
            onLatest={() => {
              setSelectedMonth("");
              loadLatest(1);
            }}
          />
        </div>

        {/* ───────────────── 右側：主內容卡 ───────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 text-white">
          {/* Header（手機自動斷行；New entry 僅在 md 以上顯示） */}
          <header className="flex items-start justify-between gap-4 flex-wrap min-w-0">
            <div className="min-w-0">
<h1 className="text-2xl sm:text-[26px] font-semibold leading-snug">
  {selectedMonth ? (
    <>
      <span className="block sm:inline">
        {userName ? `${userName}’s journal –` : "Your journal –"}
      </span>{" "}
      <span className="block sm:inline">
        {(() => {
          try {
            const [year, month] = selectedMonth.split("-");
            const formatted = formatter.format(new Date(`${year}-${month}-01`));
            return formatted;
          } catch {
            return selectedMonth;
          }
        })()}
      </span>
    </>
  ) : (
    <>{userName ? `${userName}’s journal` : "Your journal"}</>
  )}
</h1>


              {/* 次標（簡短說明） */}
              <p className="mt-1 text-sm text-white/60">
                Reflect on your day. Track your mood trends over time.
              </p>
            </div>

            {/* 行動按鈕：桌機顯示 / 手機隱藏 */}
            <div className="hidden md:flex">
              <ButtonLink href="/new" variant="primary" size="sm" className="whitespace-nowrap">
                New entry
              </ButtonLink>
            </div>
          </header>

          {/* 錯誤訊息（載入錯誤 / 操作錯誤） */}
          {(error || opErr) && (
            <p className="mt-4 text-sm text-red-400">{error || opErr}</p>
          )}

          {/* 視覺化（MoodJar：中等尺寸以下隱藏） */}
          <div className="mt-6 flex justify-center">
            <MoodJar items={jarItems} className="max-md:hidden" />
          </div>

          {/* 列表區：載入 / 空狀態 / 實際列表 */}
          {loading ? (
            <LoadingSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState selectedMonth={selectedMonth} />
          ) : (
            <>
              <ul className="mt-6 space-y-3">
                {rows.map((r: JournalDoc) => {
                  const isOpen = openId === r.id;
                  const prettyDate = (() => {
                    try {
                    // Use noon UTC to avoid timezone shifting the displayed date
                    return formatter.format(new Date(`${r.dateKey}T12:00:00Z`));
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

              {/* 分頁控件 */}
              {pagination && pagination.totalPages > 1 && (
                <PaginationControls
                  pagination={pagination}
                  currentPage={currentPage}
                  onPageChange={loadPage}
                />
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

/* ───────────────── Loading Skeleton ───────────────── */
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

/* ───────────────── 空狀態 ───────────────── */
function EmptyState({ selectedMonth }: { selectedMonth: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-white/10 p-10 text-center bg-white/[.03]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
        {/* 書本圖示（inline SVG） */}
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M4 5.5A2.5 2.5 0 016.5 3H20v15.5A2.5 2.5 0 0117.5 21H6.5A2.5 2.5 0 014 18.5v-13zM6.5 5A.5.5 0 006 5.5v13a.5.5 0 00.5.5H18V5H6.5z"
            fill="currentColor"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        {selectedMonth ? "No entries this month" : "Start your first entry"}
      </h3>

      <p className="mt-1 text-sm text-white/60">
        {selectedMonth
          ? "Try another month or write a new entry."
          : "Write about your day and let AI analyze your mood."}
      </p>

      {/* 行動：桌機顯示；手機隱藏 */}
      {!selectedMonth && (
        <ButtonLink
          href="/new"
          variant="primary"
          className="mt-6 whitespace-nowrap hidden md:inline-flex"
        >
          Write your first entry
        </ButtonLink>
      )}
    </div>
  );
}

/* ───────────────── 分頁控件 ───────────────── */
function PaginationControls({
  pagination,
  currentPage,
  onPageChange,
}: {
  pagination: { page: number; totalPages: number; hasNext: boolean; hasPrev: boolean; total: number };
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
      {/* Page info */}
      <div className="text-sm text-white/60">
        Page {currentPage} of {pagination.totalPages}
        <span className="ml-2">({pagination.total} entries)</span>
      </div>

      {/* Pager buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNext}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <svg
            className="h-4 w-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}



