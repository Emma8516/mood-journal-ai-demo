// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { analyzeMood } from "@/lib/openaiService";

export const runtime = "nodejs"; // server SDKs expect Node environment

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: "The text is too short. Please enter at least 10 characters." },
        { status: 400 }
      );
    }

    const result = await analyzeMood(text);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[/api/analyze] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Analyze failed." },
      { status: 500 }
    );
  }
}
