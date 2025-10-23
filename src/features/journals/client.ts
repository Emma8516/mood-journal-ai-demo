// src/features/journals/client.ts
"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { JournalDoc, MoodLabel } from "@/lib/types";

/** 月份清單 + 日記列表：封裝資料取得邏輯 */
export function useJournals() {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [rows, setRows] = useState<JournalDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // 供 page 點「Latest」時使用
  async function loadLatest(take = 20) {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(`/api/journals?take=${take}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load journals.");
      setRows(data);
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? "Failed to load journals.");
    } finally {
      setLoading(false);
    }
  }

  // 初始化：拿月份清單
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth("/api/journals?mode=months");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load months.");
        if (Array.isArray(data) && data.length > 0) {
          setMonths(data);
          setSelectedMonth(data[0]); // 預設最新月份
        } else {
          await loadLatest();
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to load months.");
        await loadLatest();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 月份切換：載入該月份
  useEffect(() => {
    if (!selectedMonth) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchWithAuth(`/api/journals?month=${selectedMonth}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load journals.");
        setRows(data);
      } catch (e: any) {
        setRows([]);
        setError(e?.message ?? "Failed to load journals.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedMonth]);

  // 新增：刷新目前視圖（Latest 或目前 month）
  async function refresh() {
    if (selectedMonth) {
      setLoading(true);
      setError("");
      try {
        const res = await fetchWithAuth(`/api/journals?month=${selectedMonth}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load journals.");
        setRows(data);
      } catch (e: any) {
        setRows([]);
        setError(e?.message ?? "Failed to load journals.");
      } finally {
        setLoading(false);
      }
    } else {
      await loadLatest();
    }
  }

  return { months, selectedMonth, setSelectedMonth, rows, loading, error, loadLatest, refresh, setRows };
}

/* ——— 輕量 API 包裝 ——— */
export type AnalyzeResult = { mood: { label: MoodLabel; score: number }; advice: string };

export async function analyzeText(text: string): Promise<AnalyzeResult> {
  const res = await fetchWithAuth("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Analyze failed.");
  return data as AnalyzeResult;
}

export async function createJournal(payload: {
  text: string;
  mood: AnalyzeResult["mood"];
  advice: string;
}): Promise<{ id: string }> {
  const res = await fetchWithAuth("/api/journals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Save failed.");
  return data as { id: string };
}

// 新增：刪除一筆日記
export async function deleteJournal(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/journals?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Delete failed.");
}
