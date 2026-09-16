import { askJson, type Turn } from "@/lib/anthropic";
import { bumpUsage, errorResponse, limits, loadOwnProject } from "@/lib/projects";
import { promptE } from "@/lib/prompts";
import { PART_CALL, type ChatTurn } from "@/lib/types";
import { arr, obj, str } from "@/lib/util";

export const maxDuration = 60;

/** POST { projectId, text } → { reply, facts, ideaUpdate, regenerate }. Saves the turns and any new facts. */
export async function POST(req: Request) {
  try {
    const { projectId, text } = await req.json();
    const message = str(text).trim().slice(0, 2000);
    if (!message) return Response.json({ error: "Say something first." }, { status: 400 });
    const { supabase, user, project } = await loadOwnProject(str(projectId));
    if (!project.book) return Response.json({ error: "Build the scrapbook first." }, { status: 400 });
    await bumpUsage(user.id, "chat", limits.build * 3);
    const chat: ChatTurn[] = [...arr<ChatTurn>(project.chat), { role: "user", content: message }];
    const hist: Turn[] = chat.filter((t) => t.role !== "sys").slice(-10).map((t) => ({ role: t.role === "user" ? "user" : "assistant", content: t.content }));
    const turns: Turn[] = [{ role: "user", content: promptE(project, project.book) }, ...hist];
    if (turns[turns.length - 1].role !== "user") turns.push({ role: "user", content: "(continue)" });
    const { data } = await askJson<Record<string, unknown>>(turns, { tier: "quick", maxTokens: 1200 });
    const r = obj(data);
    const reply = str(r.reply) || "Got it.";
    const facts = arr(r.facts).map(str).filter(Boolean).slice(0, 6);
    const ideaUpdate = str(r.ideaUpdate).trim();
    const regenerate = arr(r.regenerate).map(str).filter((x) => PART_CALL[x]);
    chat.push({ role: "assistant", content: reply });
    const patch: Record<string, unknown> = { chat: chat.slice(-24) };
    if (facts.length) patch.facts = [...project.facts, ...facts].slice(-30);
    if (ideaUpdate) patch.idea = ideaUpdate;
    const { error } = await supabase.from("projects").update(patch).eq("id", project.id);
    if (error) throw new Error(error.message);
    return Response.json({ reply, facts, ideaUpdate: ideaUpdate || null, regenerate });
  } catch (e) { return errorResponse(e); }
}
