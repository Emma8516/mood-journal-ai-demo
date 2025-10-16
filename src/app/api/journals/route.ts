// src/app/api/journals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// 解析並驗證 Bearer token
async function verify(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const m = authHeader.match(/^Bearer (.+)$/i);
  if (!m) return null;
  try {
    return await adminAuth.verifyIdToken(m[1]); // => { uid, email, ... }
  } catch {
    return null;
  }
}

// GET /api/journals?take=20
export async function GET(req: NextRequest) {
  const user = await verify(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const take = Math.max(1, Math.min(Number(url.searchParams.get("take") ?? 20), 100));

  const col = adminDb.collection("users").doc(user.uid).collection("journals");
  const snap = await col.orderBy("createdAt", "desc").limit(take).get();

  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(data);
}

// POST /api/journals
export async function POST(req: NextRequest) {
  const user = await verify(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = Date.now();

  // 你可以把 uid 欄位拿掉（由路徑得知），保留也沒關係
  const doc = {
    uid: user.uid,
    text: body.text ?? "",
    mood: body.mood ?? null,
    advice: body.advice ?? "",
    createdAt: now,                          // 也可用 serverTimestamp()
    createdAtServer: FieldValue.serverTimestamp(),
    dateKey: new Date(now).toISOString().slice(0, 10), // "YYYY-MM-DD"
  };

  const col = adminDb.collection("users").doc(user.uid).collection("journals");
  const ref = await col.add(doc);

  return NextResponse.json({ id: ref.id }, { status: 201 });
}
