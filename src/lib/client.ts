"use client";
/** Browser-side helpers: call our API routes, save project fields through Supabase (RLS keeps it to the owner). */
import { createClient } from "./supabase/client";
import type { Project } from "./types";

export async function api<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

/** Save a few fields of the project. Keys are the app's camelCase names. */
export async function saveFields(id: string, fields: Partial<Pick<Project, "interview" | "facts" | "chat" | "done" | "doneAt" | "work" | "idea" | "redos">>) {
  const map: Record<string, string> = { interview: "interview", facts: "facts", chat: "chat", done: "done", doneAt: "done_at", work: "work", idea: "idea", redos: "redos" };
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) row[map[k]] = v;
  const { error } = await createClient().from("projects").update(row).eq("id", id);
  if (error) throw new Error(error.message);
}
