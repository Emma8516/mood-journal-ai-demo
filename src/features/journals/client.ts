// src/features/journals/client.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { JournalDoc, MoodLabel } from "@/lib/types";

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export function useJournals() {
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [rows, setRows] = useState<JournalDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const initializedRef = useRef(false);
  const isInitializingRef = useRef(false);

  const limit = 10;

  const applyData = (data: any, page?: number) => {
    if (data?.rows && data?.pagination) {
      setRows(data.rows);
      setPagination(data.pagination);
      if (page) setCurrentPage(page);
    } else if (Array.isArray(data)) {
      setRows(data);
      setPagination(null);
      if (page) setCurrentPage(page);
    } else {
      setRows([]);
      setPagination(null);
    }
  };

  const fetchList = async ({
    month,
    page,
  }: {
    month?: string;
    page: number;
  }) => {
    const query = month
      ? `/api/journals?month=${month}&page=${page}&limit=${limit}`
      : `/api/journals?page=${page}&limit=${limit}`;
    const res = await fetchWithAuth(query);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to load journals.");
    return data;
  };

  async function loadLatest(page = 1) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchList({ page });
      applyData(data, page);
    } catch (e: any) {
      setRows([]);
      setPagination(null);
      setError(e?.message ?? "Failed to load journals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || initializedRef.current) return;
    initializedRef.current = true;
    isInitializingRef.current = true;

    (async () => {
      setLoading(true);
      setError("");

      const [monthsRes, latestRes] = await Promise.allSettled([
        fetchWithAuth("/api/journals?mode=months"),
        fetchWithAuth(`/api/journals?page=1&limit=${limit}`),
      ]);

      let monthsDataCached: string[] | null = null;

      if (latestRes.status === "fulfilled") {
        try {
          const latestData = await latestRes.value.json();
          if (latestRes.value.ok) {
            applyData(latestData, 1);
          }
        } catch (e) {
          console.error("Failed to parse latest journals:", e);
        }
      }

      if (monthsRes.status === "fulfilled") {
        try {
          const monthsData = await monthsRes.value.json();
          if (monthsRes.value.ok && Array.isArray(monthsData) && monthsData.length > 0) {
            monthsDataCached = monthsData;
            setMonths(monthsData);
            setSelectedMonth(monthsData[0]);
          }
        } catch (e) {
          console.error("Failed to parse months:", e);
        }
      }

      if (monthsRes.status === "rejected" && latestRes.status === "rejected") {
        setError("Failed to load journals.");
        setRows([]);
      }

      setLoading(false);
      isInitializingRef.current = false;

      // Load first month page in background if available
      const month = monthsDataCached?.[0];
      if (month) {
        fetchWithAuth(`/api/journals?month=${month}&page=1&limit=${limit}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.rows && data?.pagination) {
              setRows(data.rows);
              setPagination(data.pagination);
              setCurrentPage(1);
            } else if (Array.isArray(data)) {
              setRows(data);
              setPagination(null);
              setCurrentPage(1);
            }
          })
          .catch((e) => {
            console.error("Failed to load month data:", e);
          });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedMonth || !isAuthenticated || isInitializingRef.current) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchList({ month: selectedMonth, page: 1 });
        applyData(data, 1);
      } catch (e: any) {
        setRows([]);
        setPagination(null);
        setError(e?.message ?? "Failed to load journals.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, isAuthenticated]);

  async function refresh() {
    if (selectedMonth) {
      setLoading(true);
      setError("");
      try {
        const data = await fetchList({ month: selectedMonth, page: currentPage });
        if (data?.rows?.length === 0 && currentPage > 1) {
          await loadPage(currentPage - 1);
          return;
        }
        applyData(data);
      } catch (e: any) {
        setRows([]);
        setPagination(null);
        setError(e?.message ?? "Failed to load journals.");
      } finally {
        setLoading(false);
      }
    } else {
      await loadLatest(currentPage);
    }
  }

  async function loadPage(page: number) {
    if (selectedMonth) {
      setLoading(true);
      setError("");
      try {
        const data = await fetchList({ month: selectedMonth, page });
        applyData(data, page);
      } catch (e: any) {
        setRows([]);
        setPagination(null);
        setError(e?.message ?? "Failed to load journals.");
      } finally {
        setLoading(false);
      }
    } else {
      await loadLatest(page);
    }
  }

  return {
    months,
    selectedMonth,
    setSelectedMonth,
    rows,
    loading,
    error,
    loadLatest,
    refresh,
    setRows,
    pagination,
    currentPage,
    loadPage,
  };
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
