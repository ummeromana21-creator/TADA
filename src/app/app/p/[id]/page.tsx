import { Project } from "@/components/Project";
import { rowToProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <Project initial={rowToProject(data)} email={user?.email ?? ""} imagesEnabled={!!process.env.OPENAI_API_KEY} />;
}
