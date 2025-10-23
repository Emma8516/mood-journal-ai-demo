"use client";

import { useState } from "react";
import type { JournalDoc } from "@/lib/types";
import { moodColor } from "@/lib/ui";
import { Button } from "@/components/ui/Button"; // ✅ 引入共用 Button

export default function JournalItem({
  row,
  open,
  onToggle,
  prettyDate,
  onDelete,
}: {
  row: JournalDoc;
  open: boolean;
  onToggle: () => void;
  prettyDate: string;
  onDelete?: (id: string) => void;
}) {
  const label = row.mood?.label ?? "Unknown";
  const score = row.mood?.score ?? "-";
  const colorClass = row.mood?.label ? moodColor[row.mood.label] : "bg-white/20";
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <li className="relative rounded-xl border border-white/10 bg-white/[.03] hover:bg-white/[.06] transition">
      {/* 日記項目標題列 */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
      >
        <div>
          <div className="text-xs uppercase tracking-wide text-white/50">
            <time>{prettyDate}</time>
          </div>
          {!open && <p className="mt-1 text-white/80 line-clamp-2">{row.text}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1">
              <span
                aria-hidden
                className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${colorClass} ring-1 ring-white/30`}
              />
              Mood:&nbsp;<b className="text-white">{label}</b>
              <span className="ml-1.5 text-white/70">({score}/5)</span>
            </span>
            {!open && row.advice && (
              <span className="text-white/60 line-clamp-1">Advice: {row.advice}</span>
            )}
          </div>
        </div>

        {/* 下拉箭頭 */}
        <svg
          className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* 展開內容 */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 text-sm text-white/85 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-white/50">Entry</div>

              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(true);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>

            <p className="mt-1 whitespace-pre-wrap">{row.text}</p>

            {row.advice && (
              <section>
                <div className="text-xs uppercase tracking-wide text-white/50">
                  AI advice
                </div>
                <p className="mt-1 whitespace-pre-wrap">{row.advice}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 統一風格的彈窗 */}
      {showConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl z-20 animate-fadeIn">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center text-white w-72 shadow-xl backdrop-blur-md">
            <p className="text-sm mb-5 leading-relaxed">
              Are you sure you want to delete this entry?
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete?.(row.id);
                  setShowConfirm(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

/* 動畫 */
<style jsx global>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`}</style>
