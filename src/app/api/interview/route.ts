import { askJson } from "@/lib/anthropic";
import { bumpUsage, errorResponse, limits, loadOwnProject } from "@/lib/projects";
import { interviewPrompt } from "@/lib/prompts";
import { arr, obj, str } from "@/lib/util";

export const maxDuration = 60;

/** POST { projectId, n } → { questions: [{q, why, options, licence}] } */
export async function POST(req: Request) {
  try {
    const { projectId, n } = await req.json();
    const { project, user } = await loadOwnProject(str(projectId));
    await bumpUsage(user.id, "interview", limits.build * 2);
    const count = Math.max(1, Math.min(4, Number(n) || 4));
    const { data } = await askJson<{ questions?: unknown }>(interviewPrompt(project, count), { tier: "quick", maxTokens: 1500 });
    const questions = arr(obj(data).questions).map((q) => obj(q)).filter((q) => str(q.q).trim()).slice(0, count)
      .map((q) => ({ q: str(q.q), why: str(q.why), options: arr(q.options).map(str).filter(Boolean).slice(0, 5), licence: !!q.licence }));
    return Response.json({ questions });
  } catch (e) { return errorResponse(e); }
}
