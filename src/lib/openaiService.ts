// src/lib/openaiService.ts
//呼叫 OpenAI 分析心情並回傳嚴格 JSON（mood{label,score} + advice）
import "server-only";
import OpenAI from "openai";
import type { MoodLabel, MoodResult } from "@/lib/types";

const apiKey = process.env.OPENAI_API_KEY!;
if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

const openai = new OpenAI({ apiKey });

export async function analyzeMood(text: string): Promise<MoodResult> {
 
  const prompt = `
Return ONLY a JSON object with this exact shape:
{
  "mood": { "label": "<one of: positive, neutral, negative, stressed, anxious, sad, angry, grateful, excited, tired>", "score": <1-5 number> },
  "advice": "<<= 80 words, concrete, non-clinical>"
}
Journal:
"""${text}"""
  `.trim();

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return strict JSON only. No markdown, no extra text." },
      { role: "user", content: prompt },
    ],
  });

  const content = resp.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as {
    mood?: { label?: MoodLabel; score?: number };
    advice?: string;
  };

  // Normalize & guard
  const allowed: MoodLabel[] = [
    "positive","neutral","negative","stressed","anxious","sad","angry","grateful","excited","tired",
  ];
  const label = (allowed.includes(parsed?.mood?.label as MoodLabel)
    ? (parsed!.mood!.label as MoodLabel)
    : "neutral") as MoodLabel;

  const score = Math.max(1, Math.min(5, Number(parsed?.mood?.score ?? 3))) as 1|2|3|4|5;
  const advice = parsed?.advice || "Take a slow breath and choose one small next step.";

  return { mood: { label, score }, advice };
}

