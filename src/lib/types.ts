// src/lib/types.ts

// === Canonical mood labels used across the whole app ===
export type MoodLabel =
  | "positive" | "neutral" | "negative"
  | "stressed" | "anxious" | "sad" | "angry"
  | "grateful" | "excited" | "tired";

// 1..5 discrete score
export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface Mood {
  label: MoodLabel;
  score: MoodScore;
}

export interface MoodResult {
  mood: Mood;
  advice: string;
}

// Payload we store (and also what your POST /api/journals expects)
export interface JournalInput extends MoodResult {
  uid: string;        // owner uid
  text: string;       // user input
  createdAt: number;  // epoch ms
  dateKey: string;    // "YYYY-MM-DD"
}

// What we return to the client (id included)
export interface JournalDoc extends JournalInput {
  readonly id: string;
}
