import { runPart } from "@/lib/build";
import { bumpUsage, errorResponse, limits, loadOwnProject } from "@/lib/projects";
import type { Part } from "@/lib/types";
import { str } from "@/lib/util";

export const maxDuration = 300;

/** POST { projectId, part: "A"|"B"|"C"|"D", extra? } → { book, done?, doneAt? }. The client runs A, D and B together, then C. */
export async function POST(req: Request) {
  try {
    const { projectId, part, extra } = await req.json();
    if (!["A", "B", "C", "D"].includes(part)) return Response.json({ error: "Unknown part" }, { status: 400 });
    const { supabase, user, project } = await loadOwnProject(str(projectId));
    await bumpUsage(user.id, "build", limits.build);
    const out = await runPart(part as Part, project, str(extra).slice(0, 600) || undefined);
    const patch: Record<string, unknown> = { book: out.book };
    if (out.done) { patch.done = out.done; patch.done_at = out.doneAt; }
    if (out.resetWork) patch.work = null;
    if (part === "C" && !project.builtAt) patch.built_at = new Date().toISOString();
    const { error } = await supabase.from("projects").update(patch).eq("id", project.id);
    if (error) throw new Error(error.message);
    return Response.json({ book: out.book, done: out.done, doneAt: out.doneAt, resetWork: !!out.resetWork });
  } catch (e) { return errorResponse(e); }
}
