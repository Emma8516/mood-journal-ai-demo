import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getUidFromAuthHeader } from "@/lib/verifyToken";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

async function requireUid(req: NextRequest) {
  const uid = await getUidFromAuthHeader(req.headers.get("authorization"));
  if (!uid) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  return uid;
}

// 工具：算出當月起訖字串（YYYY-MM-DD）
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

// ✅ GET: 取月份清單 或 特定月份日記
export async function GET(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode");
    const month = url.searchParams.get("month");

    const col = adminDb.collection("users").doc(uid).collection("journals");

    // 1️⃣ 取月份清單
    if (mode === "months") {
      const snap = await col.orderBy("createdAt", "desc").limit(1000).get();
      const months = new Set<string>();
      snap.forEach((d) => {
        const dk = d.get("dateKey");
        if (typeof dk === "string" && dk.length >= 7) months.add(dk.slice(0, 7));
      });
      const list = Array.from(months).sort((a, b) => (a < b ? 1 : -1));
      return NextResponse.json(list);
    }

    // 2️⃣ 取指定月份的日記
    if (month) {
      const range = monthRange(month);
      if (!range) return NextResponse.json({ error: "Invalid month" }, { status: 400 });

      const snap = await col
        .where("dateKey", ">=", range.start)
        .where("dateKey", "<", range.end)
        .orderBy("dateKey", "desc") 
        .limit(500)
        .get();

      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      return NextResponse.json(rows);
    }

    // 3️⃣ 沒帶 month → 回最近 20 筆
    const snap = await col.orderBy("createdAt", "desc").limit(20).get();
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return NextResponse.json(rows);
  } catch (e: any) {
    if (e instanceof Response) return e;
    console.error("[GET /journals] error:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// ✅ POST: 新增日記
export async function POST(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const body = await req.json().catch(() => ({}));
    if (!body?.text || String(body.text).trim().length < 5) {
      return NextResponse.json({ error: "text too short" }, { status: 400 });
    }

    const now = Date.now();
    const dateKey = new Date(now).toISOString().slice(0, 10);

    const doc = {
      uid,
      text: String(body.text),
      mood: body.mood ?? null,
      advice: body.advice ?? "",
      createdAt: now,
      createdAtServer: FieldValue.serverTimestamp(),
      dateKey,
    };

    const ref = await adminDb.collection("users").doc(uid).collection("journals").add(doc);
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (e: any) {
    if (e instanceof Response) return e;
    console.error("[POST /journals] error:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// ✅ DELETE: 刪除
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
