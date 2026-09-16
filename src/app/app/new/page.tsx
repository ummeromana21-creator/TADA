import { Shell } from "@/components/Shell";
import { StartForm } from "@/components/StartForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewIdea() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <Shell email={user?.email}>
      <StartForm />
    </Shell>
  );
}
