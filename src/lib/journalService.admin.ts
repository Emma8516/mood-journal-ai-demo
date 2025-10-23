// src/lib/journalService.admin.ts
import "server-only";
import { adminDb } from "@/lib/firebaseAdmin";

type ListOpts = {
  take?: number;     // 預設 20；有 month 時預設可放大
  month?: string;    // "YYYY-MM"（例如 "2025-10"）
};

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return null;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1); // 下一個月第一天
  const fmt = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };
  return { start: fmt(start), end: fmt(end) };
}

/** 依條件列出日記（支援 month=YYYY-MM） */
export async function listJournals(uid: string, opts: ListOpts = {}) {
  // 沒帶 month：預設 20；帶 month：預設 200（可調）
  const defaultTake = opts.month ? 200 : 20;
  const take = Math.min(Math.max(opts.take ?? defaultTake, 1), 500);

  let q = adminDb
    .collection("users").doc(uid)
    .collection("journals")
    .orderBy("createdAt", "desc");

  if (opts.month) {
    const rng = monthRange(opts.month);
    if (rng) {
      q = q.where("dateKey", ">=", rng.start)
           .where("dateKey", "<",  rng.end);
    }
  }

  const snap = await q.limit(take).get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

/**
 * 列出使用者有資料的月份（回傳 "YYYY-MM" 陣列）
 * 做法：抓最近 N 筆（預設 1000），由 dateKey 取唯一月份。
 * 夠簡潔，不做複雜聚合；資料量大再調整。
 */
export async function listAvailableMonths(uid: string, cap = 30) {
  const q = adminDb
    .collection("users").doc(uid)
    .collection("journals")
    .orderBy("createdAt", "desc")
    .limit(Math.max(50, Math.min(cap, 5000)));

  const snap = await q.get();

  const set = new Set<string>();
  for (const d of snap.docs) {
    const dk = (d.get("dateKey") as string) || "";
    if (dk.length >= 7) set.add(dk.slice(0, 7)); // "YYYY-MM"
  }

  // 依時間新到舊排序
  const months = Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  return months;
}

