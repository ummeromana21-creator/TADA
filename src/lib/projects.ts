/** Server-side helpers for project rows, the signed-in user, and daily usage limits. */
import { createClient } from "./supabase/server";
import type { Project } from "./types";
import { arr, obj, str } from "./util";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToProject(r: any): Project {
  return {
    id: str(r.id), owner: str(r.owner), idea: str(r.idea), country: str(r.country), countryName: str(r.country_name), currency: str(r.currency), region: str(r.region),
    interview: arr(r.interview), facts: arr(r.facts), chat: arr(r.chat), book: r.book ? obj(r.book) as Project["book"] : null,
    done: obj(r.done), doneAt: obj(r.done_at), work: r.work ? (obj(r.work) as Project["work"]) : null, images: obj(r.images), redos: Number(r.redos) || 0,
    shareToken: r.share_token ?? null, sharePublic: !!r.share_public, builtAt: r.built_at ?? null, createdAt: str(r.created_at), updatedAt: str(r.updated_at),
  };
}

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }

/** The signed-in user and their Supabase client, or a 401. */
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new HttpError(401, "Please sign in.");
  return { supabase, user: data.user };
}

/** Load a project the signed-in person owns, or a 404. */
export async function loadOwnProject(id: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).eq("owner", user.id).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "That scrapbook doesn't exist (or isn't yours).");
  return { supabase, user, project: rowToProject(data) };
}

/** Count one use of `kind` today and refuse past `limit`. Counts live in usage_counts (RLS: users can read their own; writes go through the secret key). */
export async function bumpUsage(userId: string, kind: string, limit: number) {
  const { adminClient } = await import("./supabase/admin");
  const admin = adminClient();
  const day = new Date().toISOString().slice(0, 10);
  const { data } = await admin.from("usage_counts").select("count").eq("user_id", userId).eq("day", day).eq("kind", kind).maybeSingle();
  const count = (data?.count ?? 0) + 1;
  if (count > limit) throw new HttpError(429, `You've reached today's limit for this (${limit}). It resets tomorrow.`);
  await admin.from("usage_counts").upsert({ user_id: userId, day, kind, count }, { onConflict: "user_id,day,kind" });
  return count;
}

export const limits = {
  build: Number(process.env.DAILY_BUILD_LIMIT) || 40,
  verify: Number(process.env.DAILY_VERIFY_LIMIT) || 10,
  imagesPerProject: Number(process.env.IMAGES_PER_PROJECT) || 4,
};

/** Turn a thrown error into a JSON response. */
export function errorResponse(e: unknown) {
  const status = e instanceof HttpError ? e.status : 500;
  const message = e instanceof Error ? e.message : "Something went wrong.";
  return Response.json({ error: message }, { status });
}
