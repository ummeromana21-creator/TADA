import { bumpUsage, errorResponse, HttpError, limits, loadOwnProject } from "@/lib/projects";
import { imagePrompt } from "@/lib/prompts";
import { adminClient } from "@/lib/supabase/admin";
import type { Images } from "@/lib/types";
import { arr, hexOr, obj, str } from "@/lib/util";

export const maxDuration = 300;

/** POST { projectId } → { images }. Paints the vision board: three mood scenes and a hero picture (and a logo mark), stored in Supabase Storage. */
export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) throw new HttpError(400, "Pictures are switched off on this site (no image API key).");
    const { projectId } = await req.json();
    const { supabase, user, project } = await loadOwnProject(str(projectId));
    const book = project.book;
    if (!book?.brand) throw new HttpError(400, "Build the scrapbook first.");
    const existing = Object.keys(project.images || {}).length;
    if (existing >= limits.imagesPerProject) throw new HttpError(429, "This scrapbook already has its pictures. Redo the brand to paint new ones.");
    await bumpUsage(user.id, "images", 3);

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 180_000 });
    const model = process.env.IMAGE_MODEL || "gpt-image-1-mini";
    const brand = obj(book.brand), vision = obj(book.vision);
    const palette = arr(brand.palette).map((c) => hexOr(obj(c).hex, "")).filter(Boolean);
    const jobs: { key: keyof Images; prompt: string }[] = [];
    const hero = str(vision.hero) || `${book.oneLiner} on its best day`;
    jobs.push({ key: "hero", prompt: imagePrompt("hero", hero, palette) });
    arr(brand.mood).slice(0, 3).forEach((m, i) => jobs.push({ key: `mood${i}` as keyof Images, prompt: imagePrompt("mood", str(obj(m).picture) || str(obj(m).caption), palette) }));

    const admin = adminClient();
    const images: Images = { ...project.images };
    const results = await Promise.allSettled(jobs.map(async (j) => {
      const res = await openai.images.generate({ model, prompt: j.prompt, n: 1, size: "1024x1024", ...(model.startsWith("gpt-image") ? { quality: "low" as const, output_format: "png" as const } : {}) });
      const b64 = res.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image returned");
      const path = `${project.id}/${j.key}-${Date.now()}.png`;
      const { error } = await admin.storage.from("tada-images").upload(path, Buffer.from(b64, "base64"), { contentType: "image/png", upsert: true });
      if (error) throw new Error(error.message);
      const { data } = admin.storage.from("tada-images").getPublicUrl(path);
      images[j.key] = data.publicUrl;
    }));
    const failed = results.filter((r) => r.status === "rejected").length;
    const { error } = await supabase.from("projects").update({ images }).eq("id", project.id);
    if (error) throw new Error(error.message);
    if (failed === jobs.length) throw new Error("The pictures didn't come back. Check the image API key and try again.");
    return Response.json({ images, failed });
  } catch (e) { return errorResponse(e); }
}
