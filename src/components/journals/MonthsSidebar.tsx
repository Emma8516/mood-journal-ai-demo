"use client";

import { useMemo } from "react";

export default function MonthsSidebar({
  months,
  selected,
  onSelect,
  onLatest,
}: {
  months: string[];
  selected: string;
  onSelect: (m: string) => void;
  onLatest: () => void;
}) {
  const pretty = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short" });
    return (m: string) => {
      try {
        // 支援 "YYYY-MM" or "YYYY/MM"
        const norm = m.replace("/", "-");
        const [y, mm] = norm.split("-");
        const d = new Date(Number(y), Number(mm) - 1, 1);
        if (isNaN(d.getTime())) return m;
        return fmt.format(d); // e.g. "Oct 2025"
      } catch {
        return m;
      }
    };
  }, []);

  const hasMonths = months && months.length > 0;

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur text-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">
          Filter
        </h2>
        {/* 最新 */}
        <button
          type="button"
          onClick={onLatest}
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
            "bg-white/10 hover:bg-white/15 border border-white/15",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.98] transition",
          ].join(" ")}
          aria-label="Show latest entries"
        >
          {/* 小圖示 heroicons*/}
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M13 3L4 14h6l-1 7 9-11h-6l1-7z"
              fill="currentColor"
              className="opacity-80"
            />
          </svg>
          Latest
        </button>
      </div>

      {/* List */}
      {!hasMonths ? (
        <p className="text-white/60 text-sm">No month yet</p>
      ) : (
        <div className="relative">
          {/* 微分隔線 */}
          <div className="absolute inset-x-0 -top-1 border-t border-white/10" />
          <ul
            className="mt-3 max-h-[60vh] overflow-auto pr-1 space-y-1"
            role="listbox"
            aria-label="Months"
          >
            {months.map((m) => {
              const active = selected === m;
              return (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => onSelect(m)}
                    aria-selected={active || undefined}
                    className={[
                      "w-full text-left rounded-xl px-3 py-2 text-sm",
                      "flex items-center justify-between gap-2",
                      // 樣式：膠囊 + 左側細條指示（用 ring 模擬）
                      active
                        ? "bg-white/15 ring-1 ring-white/25"
                        : "hover:bg-white/10",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                    ].join(" ")}
                  >
                    <span className="truncate">{pretty(m)}</span>

                    {/* 右側小圓點（選中時顯示） */}
                    <span
                      aria-hidden
                      className={[
                        "h-2.5 w-2.5 rounded-full shrink-0",
                        active ? "bg-indigo-400" : "bg-white/20",
                      ].join(" ")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}

