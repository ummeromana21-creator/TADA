import { errorResponse, loadOwnProject } from "@/lib/projects";
import { str } from "@/lib/util";
import { randomBytes } from "crypto";

/** POST { projectId, on: boolean } → { url | null }. Turns the public read-only link on or off. */
export async function POST(req: Request) {
  try {
    const { projectId, on } = await req.json();
    const { supabase, project } = await loadOwnProject(str(projectId));
    const token = project.shareToken || randomBytes(12).toString("base64url");
    const { error } = await supabase.from("projects").update({ share_token: token, share_public: !!on }).eq("id", project.id);
    if (error) throw new Error(error.message);
    const base = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    return Response.json({ url: on ? `${base}/s/${token}` : null });
  } catch (e) { return errorResponse(e); }
}
