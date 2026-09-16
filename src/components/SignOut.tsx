"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOut({ email }: { email: string }) {
  const router = useRouter();
  return <button className="btn ghost small" title={email} onClick={async () => { await createClient().auth.signOut(); router.push("/"); router.refresh(); }}>Sign out</button>;
}
