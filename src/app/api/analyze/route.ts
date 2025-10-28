// src/app/api/analyze/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getUidFromAuthHeader } from "@/lib/verifyToken";
import { analyzeMood } from "@/lib/openaiService";

export const runtime = "nodejs"; // server SDKs expect Node environment

async function requireUid(req: NextRequest) {
  const uid = await getUidFromAuthHeader(req.headers.get("authorization"));
  if (!uid) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  return uid;
}

export async function POST(req: NextRequest) {
  try {
    // 驗證登入
    const uid = await requireUid(req);

    const { text } = await req.json().catch(() => ({}));
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: "The text is too short. Please enter at least 10 characters." },
        { status: 400 }
      );
    }

    const result = await analyzeMood(text);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof Response) return err; // 傳回 401 等
    console.error("[/api/analyze] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Analyze failed." },
      { status: 500 }
    );
  }
}
