// features/auth/client.ts
"use client";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword, signInWithPopup,
  createUserWithEmailAndPassword, updateProfile
} from "firebase/auth";

export async function signInEmail(email: string, password: string) {
  if (!email || !password) throw new Error("Email and password required.");
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signInGoogle() {
  await signInWithPopup(auth, googleProvider);
}

export async function registerEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
}

export async function registerGoogle() {
  await signInWithPopup(auth, googleProvider);
}
