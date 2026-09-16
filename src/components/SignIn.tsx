"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function SignIn({ next = "/app" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setMsg("That doesn't look like an email address."); return; }
    setState("sending"); setMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}` } });
    if (error) { setState("error"); setMsg(error.message); return; }
    setState("sent");
  }
  if (state === "sent") return <div className="note yellow signin"><div className="tape stripe"></div><div className="serif" style={{ fontSize: 24 }}>Check your email</div><p className="muted" style={{ margin: "6px 0 0" }}>We sent a sign-in link to <strong>{email}</strong>. Open it on this device and you&apos;ll land in your scrapbooks. No password to remember.</p></div>;
  return (
    <div className="note signin"><div className="tape stripe"></div>
      <div className="eyebrow">Sign in or create your profile</div>
      <form onSubmit={submit}>
        <label className="lbl" htmlFor="email" style={{ marginTop: 8 }}>Your email</label>
        <input id="email" className="field" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn primary" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Email me a sign-in link"}</button>
        {msg && <div className="msg bad">{msg}</div>}
        <p className="tiny" style={{ margin: 0 }}>We&apos;ll email you a link; clicking it signs you in. Your scrapbooks are private to you unless you share one.</p>
      </form>
    </div>
  );
}
