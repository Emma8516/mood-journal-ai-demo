// src/lib/journalService.ts
//Firestore CRUD（用 number createdAt、dateKey 由後端計算）。
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { JournalInput, JournalDoc, MoodLabel, MoodScore } from "./types";

// 以本地時間產生 YYYY-MM-DD（如果要固定時區可在這裡換成 dayjs.tz 等）
function toDateKeyFromMs(ms: number) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 寫入一筆日記
 * - 依你的型別：JournalInput 需包含 createdAt:number（ms）
 * - 若呼叫端沒給 createdAt，這裡會自動補 now()
 * - 以 number 欄位 createdAt 排序與查詢（不使用 Firestore Timestamp）
 */
export async function saveJournal(input: JournalInput) {
  const { uid, text, mood, advice } = input;

  if (!uid) throw new Error("uid required");
  if (!text || text.trim().length < 5) throw new Error("text too short");
  if (!mood || typeof mood.score !== "number" || !mood.label) {
    throw new Error("mood required");
  }

  const createdAt: number =
    typeof input.createdAt === "number" && input.createdAt > 0
      ? input.createdAt
      : Date.now();

  const dateKey = toDateKeyFromMs(createdAt);

  const docRef = await addDoc(collection(db, "journals"), {
    uid,
    text,
    mood: {
      label: mood.label as MoodLabel,
      score: mood.score as MoodScore,
    },
    advice,
    createdAt, // 以 number 儲存
    dateKey,   // 預先計算好字串鍵
  });

  // 依你的型別，回傳 id 與 dateKey 會很實用
  return { id: docRef.id, dateKey };
}

/**
 * 讀取使用者最近的日記
 * - 預設 20 筆，依 createdAt DESC
 * - 回傳型別符合 JournalDoc（含 readonly id/dateKey 的語意）
 */
export async function getJournals(
  uid: string,
  opts?: { take?: number }
): Promise<JournalDoc[]> {
  if (!uid) throw new Error("uid required");

  const take = Math.min(Math.max(opts?.take ?? 20, 1), 100);

  const q = query(
    collection(db, "journals"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(take)
  );

  const snap = await getDocs(q);

  const rows: JournalDoc[] = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      // readonly 欄位由 TypeScript 語意保證（這裡建立物件時給定）
      id: d.id,
      dateKey: data.dateKey as string,
      uid: data.uid as string,
      text: data.text as string,
      mood: {
        label: data.mood?.label as MoodLabel,
        score: Number(data.mood?.score) as MoodScore,
      },
      advice: data.advice as string,
      createdAt: Number(data.createdAt) || 0,
    };
  });

  return rows;
}
