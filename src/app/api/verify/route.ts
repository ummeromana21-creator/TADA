import { askJson } from "@/lib/anthropic";
import { bumpUsage, errorResponse, limits, loadOwnProject } from "@/lib/projects";
import { promptVerify } from "@/lib/prompts";
import type { Funding, LegalItem, Verified } from "@/lib/types";
import { arr, obj, safeUrl, str } from "@/lib/util";

export const maxDuration = 300;

/** POST { projectId } → { book }. Checks every legal and funding item against the web with Claude's web search and stamps a "last checked" date. */
export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();
    const { supabase, user, project } = await loadOwnProject(str(projectId));
    const book = project.book;
    if (!book?.legal) return Response.json({ error: "Build the scrapbook first." }, { status: 400 });
    await bumpUsage(user.id, "verify", limits.verify);
    const legal = arr<LegalItem>(book.legal.items);
    const funding = arr<Funding>(book.funding).map((f, i) => ({ ...f, id: `F${i + 1}` }));
    const items = [...legal.map((i) => ({ id: str(i.id), title: str(i.title), body: str(i.body), url: safeUrl(i.url), cost: str(i.cost), time: str(i.time) })),
      ...funding.map((f) => ({ id: f.id, title: str(f.name), body: str(f.body), url: safeUrl(f.url), cost: str(f.amount), time: "" }))].slice(0, 16);
    const { data, searches } = await askJson<{ items?: unknown }>(promptVerify(project, items), {
      tier: "smart", maxTokens: 6000,
      webSearch: { maxUses: Math.min(20, items.length * 2), country: project.country, region: project.region || undefined },
    });
    const now = new Date().toISOString();
    const byId = new Map<string, Verified & { cost: string; time: string }>();
    for (const raw of arr(obj(data).items)) {
      const r = obj(raw);
      const status = (["confirmed", "updated", "unsure"].includes(str(r.status)) ? str(r.status) : "unsure") as Verified["status"];
      const url = safeUrl(r.url);
      byId.set(str(r.id), { status, url, note: str(r.note).slice(0, 400), checkedAt: now, cost: str(r.cost), time: str(r.time) });
    }
    book.legal.items = legal.map((i) => {
      const v = byId.get(str(i.id));
      if (!v) return { ...i, verified: { status: "unsure", url: safeUrl(i.url), note: "Not checked this time.", checkedAt: now } };
      const next: LegalItem = { ...i, verified: { status: v.status, url: v.url || safeUrl(i.url), note: v.note, checkedAt: now } };
      if (v.status === "updated") { if (v.url) next.url = v.url; if (v.cost) next.cost = v.cost; if (v.time) next.time = v.time; next.verify = false; }
      if (v.status === "confirmed") next.verify = false;
      return next;
    });
    book.funding = funding.map((f) => {
      const v = byId.get(f.id);
      const { id: _drop, ...rest } = f; void _drop;
      if (!v) return rest;
      const next: Funding = { ...rest, verified: { status: v.status, url: v.url || safeUrl(f.url), note: v.note, checkedAt: now } };
      if (v.status === "updated") { if (v.url) next.url = v.url; if (v.cost) next.amount = v.cost; next.verify = false; }
      return next;
    });
    book.verifiedAt = now;
    const { error } = await supabase.from("projects").update({ book }).eq("id", project.id);
    if (error) throw new Error(error.message);
    return Response.json({ book, searches });
  } catch (e) { return errorResponse(e); }
}
