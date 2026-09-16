"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProject({ id }: { id: string }) {
  const [armed, setArmed] = useState(false);
  const router = useRouter();
  return (
    <button className={"btn small " + (armed ? "primary" : "ghost")} aria-label="Delete" onClick={async () => {
      if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 4000); return; }
      await createClient().from("projects").delete().eq("id", id);
      router.refresh();
    }}>{armed ? "Delete?" : "✕"}</button>
  );
}
