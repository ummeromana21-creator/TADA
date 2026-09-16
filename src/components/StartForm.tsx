"use client";
import { COUNTRIES, countryOf, EXAMPLES } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartForm() {
  const router = useRouter();
  const [idea, setIdea] = useState(""); const [country, setCountry] = useState("US"); const [region, setRegion] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const c = countryOf(country);
  async function start() {
    if (idea.trim().length < 12) { setMsg("Tell me a little more — a sentence is enough."); return; }
    setBusy(true); setMsg("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login?next=/app/new"); return; }
    const { data, error } = await supabase.from("projects").insert({ owner: user.id, idea: idea.trim(), country: c.code, country_name: c.name, currency: c.currency, region: region.trim() }).select("id").single();
    if (error || !data) { setBusy(false); setMsg(error?.message || "Couldn't save. Try again."); return; }
    router.push(`/app/p/${data.id}`);
  }
  return (
    <div style={{ maxWidth: 720, paddingTop: 36 }} className="col">
      <div><span className="sticker blush">A new scrapbook</span></div>
      <h1 className="serif" style={{ fontSize: "clamp(36px,6vw,64px)", margin: "8px 0 0" }}>What&apos;s the idea?</h1>
      <p className="lede">Say it in a sentence. I&apos;ll ask what I need to know, then build. Change your mind any time; the scrapbook changes with you.</p>
      <div className="note ideabox"><div className="tape stripe"></div>
        <textarea id="idea" className="field" rows={3} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="A small-batch home bakery in Austin — sourdough and celebration cakes, sold at farmers markets and by order online." aria-label="Your idea" />
        <div className="hr" style={{ margin: "6px 0 14px" }}></div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label className="lbl" htmlFor="country">Country</label><select id="country" className="field" value={country} onChange={(e) => { setCountry(e.target.value); setRegion(""); }}>{COUNTRIES.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}</select></div>
          {c.regions ? <div><label className="lbl" htmlFor="region">{c.regionLabel}</label><select id="region" className="field" value={region} onChange={(e) => setRegion(e.target.value)}><option value="">Choose…</option>{c.regions.map((r) => <option key={r}>{r}</option>)}</select></div>
            : <div><label className="lbl" htmlFor="regiontext">City or region (optional)</label><input id="regiontext" className="field" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Lisbon" /></div>}
        </div>
        <div className="row between wrapping" style={{ marginTop: 16 }}>
          <span className="tiny" style={{ maxWidth: 280 }}>Your country decides the licences, taxes and forms you&apos;ll see.</span>
          <button className="btn primary" onClick={start} disabled={busy}>{busy ? "Saving…" : "Start my scrapbook →"}</button>
        </div>
        {msg && <div className="msg">{msg}</div>}
      </div>
      <div className="ex"><span className="tiny" style={{ alignSelf: "center" }}>Try one:</span>{EXAMPLES.map((e) => <button key={e[0]} className="chip soft" onClick={() => { setIdea(e[0]); setCountry(e[1]); setRegion(e[2]); }}>{e[0].split("—")[0].split(" in ")[0].trim()}</button>)}</div>
    </div>
  );
}
