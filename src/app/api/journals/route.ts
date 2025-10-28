// src/app/api/journals/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getUidFromAuthHeader } from "@/lib/verifyToken";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

/** 取得使用者 UID（從 Authorization Bearer Token 解析） */
async function requireUid(req: NextRequest) {
  const uid = await getUidFromAuthHeader(req.headers.get("authorization"));
  if (!uid) {
    
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  return uid;
}


function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return null;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  return { start: fmt(start), end: fmt(end) };
}


export async function GET(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode");
    const month = url.searchParams.get("month");

    // 讀取 take 並限制範圍，避免被亂轟
    const takeRaw = url.searchParams.get("take");
    const take = Math.min(Math.max(Number(takeRaw ?? 20), 1), 100); // 1~100，預設 20

    const col = adminDb.collection("users").doc(uid).collection("journals");

    // 1) 取月份清單（以 dateKey 排序，比 createdAt 更穩定）
    if (mode === "months") {
      const snap = await col.orderBy("dateKey", "desc").limit(1000).get();
      const months = new Set<string>();
      snap.forEach((d) => {
        const dk = d.get("dateKey");
        if (typeof dk === "string" && dk.length >= 7) months.add(dk.slice(0, 7));
      });
      const list = Array.from(months).sort((a, b) => (a < b ? 1 : -1));
      return NextResponse.json(list);
    }

    // 2) 取指定月份的日記（含 start，不含 end）
    if (month) {
      const range = monthRange(month);
      if (!range) return NextResponse.json({ error: "Invalid month" }, { status: 400 });

      const snap = await col
        .where("dateKey", ">=", range.start)
        .where("dateKey", "<", range.end)
        .orderBy("dateKey", "desc")
        .limit(Math.min(take, 500)) // 每月最多 500 筆，受 take 影響
        .get();

      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      return NextResponse.json(rows);
    }

    // 3) 沒帶 month → 回最近 N 筆
    const snap = await col.orderBy("createdAt", "desc").limit(take).get();
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return NextResponse.json(rows);
  } catch (e: any) {
    if (e instanceof Response) return e; // 直接回傳 requireUid 的錯誤
    console.error("[GET /journals] error:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const body = await req.json().catch(() => ({}));

   
    const text = String(body?.text ?? "");
    if (text.trim().length < 10) {
      return NextResponse.json({ error: "text too short" }, { status: 400 });
    }

    // ---- 2) 解析可選日期欄位
    // （a）dateKey（YYYY-MM-DD）
    const hasDateKey =
      typeof body?.dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.dateKey);

    // 檢查 dateKey 的實際有效性（如 2025-13-40 這種錯誤日期）
    if (hasDateKey) {
      const [yy, mm, dd] = body.dateKey.split("-").map(Number);
      const d = new Date(Date.UTC(yy, mm - 1, dd));
      const isValid =
        d.getUTCFullYear() === yy && d.getUTCMonth() === mm - 1 && d.getUTCDate() === dd;
      if (!isValid) {
        return NextResponse.json({ error: "invalid dateKey" }, { status: 400 });
      }
    }

    // （b）createdAt（毫秒，有限且 > 0；可再加上界限，例如 2000~2100）
    const hasCreatedAt =
      Number.isFinite(Number(body?.createdAt)) && Number(body.createdAt) > 0;

 
    let createdAtMs: number;
    let dateKey: string;

    if (hasDateKey) {
      const [yy, mm, dd] = body.dateKey.split("-").map(Number);
      // 設定為該日「UTC 12:00」以避免跨時區導致的前一天/後一天偏移
      const utcNoon = Date.UTC(yy, mm - 1, dd, 12, 0, 0);
      createdAtMs = utcNoon;
      dateKey = body.dateKey;
    } else if (hasCreatedAt) {
      createdAtMs = Number(body.createdAt);
      dateKey = new Date(createdAtMs).toISOString().slice(0, 10);
    } else {
      createdAtMs = Date.now();
      dateKey = new Date(createdAtMs).toISOString().slice(0, 10);
    }

  
    const doc = {
      uid,
      text,
      mood: body.mood ?? null,                 // 可為 null
      advice: body.advice ?? "",               // 預設空字串
      createdAt: createdAtMs,                  // 用於「最近 N 筆」排序
      createdAtServer: FieldValue.serverTimestamp(), // 伺服器時間戳（稽核/比對用）
      dateKey,                                 // 月份查詢/清單用的主鍵
    };

   
    const ref = await adminDb
      .collection("users")
      .doc(uid)
      .collection("journals")
      .add(doc);

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (e: any) {
    if (e instanceof Response) return e; // 直接回傳 requireUid 的錯誤
    console.error("[POST /journals] error:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const ref = adminDb.collection("users").doc(uid).collection("journals").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof Response) return e;
    console.error("[DELETE /journals] error:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

