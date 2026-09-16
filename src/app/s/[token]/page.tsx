import { ReadOnly } from "@/components/ReadOnly";
import { rowToProject } from "@/lib/projects";
import { adminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/** Public, read-only view of a shared scrapbook. */
export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) notFound();
  const { data } = await adminClient().from("projects").select("*").eq("share_token", token).eq("share_public", true).maybeSingle();
  if (!data || !data.book) notFound();
  return <ReadOnly project={rowToProject(data)} />;
}
