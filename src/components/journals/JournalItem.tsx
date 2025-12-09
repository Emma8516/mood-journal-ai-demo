"use client";

import { useState, memo } from "react";
import type { JournalDoc } from "@/lib/types";
import { moodColor } from "@/lib/ui";
import { Button } from "@/components/ui/Button";

/** ===============================
 *  JournalItem
 *  - 收合：只顯示 日期 + Mood 標籤
 *  - 展開：顯示全文與 AI 建議、刪除按鈕
 *  - 刪除：彈出確認視窗
 *  =============================== */
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
  const [showConfirm, setShowConfirm] = useState(false);

  // ------- 派生資料（mood 樣式與顯示字） -------
  const label = row.mood?.label ?? "Unknown";
  const score = row.mood?.score ?? "-";
  const colorClass = row.mood?.label ? moodColor[row.mood.label] : "bg-white/20";

  return (
<li className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[.03] hover:bg-white/[.06] transition">

      {/* =========================
          列表標題列（收合狀態視圖）
          - 點擊可展開 / 收合
          - 僅顯示 日期 + Mood
         ========================= */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
      >
        {/* 左：日期 */}
        <div className="flex flex-col min-w-0">
          <div className="text-sm font-medium text-white">
            <time dateTime={row.dateKey}>{prettyDate}</time>
          </div>
        </div>

        {/* 右：Mood 標籤 */}
        <MoodBadge label={label} score={score} colorClass={colorClass} />

        {/* 展開箭頭 */}
        <Chevron open={open} />
      </button>

      {/* =========================
          展開內容（動畫過渡）
          - 文字內容 / AI 建議 / 刪除按鈕
         ========================= */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0 text-sm text-white/85 space-y-4">
            {/* 標題列右側放刪除 */}
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-white/50">Entry</div>

              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // 防止點擊刪除時又觸發展開/收合
                    setShowConfirm(true);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>

            {/* 正文 */}
            <p className="mt-1 whitespace-pre-wrap">{row.text}</p>

            {/* AI 建議（可選） */}
            {row.advice && (
              <section aria-label="AI advice">
                <div className="text-xs uppercase tracking-wide text-white/50">AI advice</div>
                <p className="mt-1 whitespace-pre-wrap">{row.advice}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* =========================
          刪除確認彈窗（覆蓋層）
         ========================= */}
      {showConfirm && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl z-20 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`confirm-title-${row.id}`}
        >
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center text-white w-72 shadow-xl backdrop-blur-md">
            <p id={`confirm-title-${row.id}`} className="text-sm mb-5 leading-relaxed">
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

      {/* =========================
          動畫（淡入 + 微縮放）
         ========================= */}
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
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </li>
  );
}

/* ---------------------------------
 * 小型純展示子元件
 * - 讓主體更乾淨、聚焦邏輯
 * --------------------------------- */

/** 展開箭頭 */
const Chevron = memo(function Chevron({ open }: { open: boolean }) {
  return (
<svg
  className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}

      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
});

/** Mood 標籤（右側膠囊） */
const MoodBadge = memo(function MoodBadge({
  label,
  score,
  colorClass,
}: {
  label: string | number;
  score: string | number;
  colorClass: string;
}) {
  return (
    <span
      className="
    inline-flex items-center justify-center
    rounded-full bg-white/10 px-2.5 py-0.5
    text-xs sm:text-sm
    max-w-[70%] sm:max-w-none truncate
  "
    >
      <span
        aria-hidden
        className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full ${colorClass} ring-1 ring-white/30`}
      />
      Mood:&nbsp;<b className="text-white">{label}</b>
      <span className="ml-1.5 text-white/70">({score}/5)</span>
    </span>
  );
});
