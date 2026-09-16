"use client";
import { api, saveFields } from "@/lib/client";
import type { Project } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

type Q = { q: string; why: string; options: string[]; licence: boolean };

/** Asks up to two rounds of questions, saves each answer, then hands over to the build. */
export function Interview({ p, onUpdate, onBuild }: { p: Project; onUpdate: (patch: Partial<Project>) => void; onBuild: () => void }) {
  const [queue, setQueue] = useState<Q[]>([]);
  const [round, setRound] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [own, setOwn] = useState(false);
  const [text, setText] = useState("");
  const started = useRef(false);
  const n = p.interview.length;

  const fetchBatch = useCallback(async (r: number) => {
    setBusy(true); setErr("");
    try {
      const { questions } = await api<{ questions: Q[] }>("/api/interview", { projectId: p.id, n: r === 1 ? 4 : 3 });
      if (!questions.length) { onBuild(); return; }
      setQueue(questions); setRound(r);
    } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }, [p.id, onBuild]);

  useEffect(() => { if (!started.current) { started.current = true; fetchBatch(n ? 2 : 1); } }, [fetchBatch, n]);

  async function answer(a: string) {
    const q = queue[0]; if (!q) return;
    const interview = [...p.interview, { q: q.q, a: a || "(skipped)" }];
    onUpdate({ interview });
    await saveFields(p.id, { interview });
    setPick(null); setOwn(false); setText("");
    const rest = queue.slice(1); setQueue(rest);
    if (rest.length) return;
    if (round >= 2 || interview.length >= 8) onBuild(); else fetchBatch(2);
  }
  const q = queue[0];
  return (
    <div className="iv">
      <div className="col" style={{ gap: 22 }}>
        <div className="note" style={{ padding: "22px 20px 18px", transform: "rotate(-1.2deg)" }}><div className="pin"></div>
          <div className="eyebrow">The idea</div>
          <div className="hand" style={{ fontSize: 24, color: "var(--ink)", marginTop: 8 }}>{p.idea}</div>
          <div className="row wrapping" style={{ gap: 6, marginTop: 12 }}><span className="tag">{p.countryName}</span>{p.region && <span className="tag">{p.region}</span>}</div>
        </div>
        <div className="col" style={{ gap: 10, padding: "0 4px" }}>
          <div className="row between"><span className="eyebrow">What I know so far</span><span className="tiny">{n} answered</span></div>
          <div className="progress"><div className="bar" style={{ width: Math.min(95, 8 + n * 13) + "%" }}></div></div>
          <div className="row wrapping" style={{ gap: 8, marginTop: 4 }}>{n ? p.interview.map((x, i) => <span key={i} className="chip soft" style={{ minHeight: 32, fontSize: 13, padding: "4px 12px" }}>{x.a.slice(0, 48)}</span>) : <span className="tiny">Your answers will show up here.</span>}</div>
        </div>
        <div className="note yellow" style={{ padding: "14px 16px", transform: "rotate(1deg)" }}><div className="tape gingham left"></div><div className="hand" style={{ fontSize: 22, color: "var(--ink)" }}>The more specific you are, the more specific the scrapbook gets. &quot;Not sure&quot; is a fine answer too.</div></div>
      </div>
      <div>
        <div className="answered">{p.interview.slice(-2).map((x, i) => <div key={i} className="qa"><div className="q">{x.q}</div><div className="a">{x.a}</div></div>)}</div>
        <div className="note qcard"><div className="tape dots"></div>
          <div className="row between wrapping"><span className="eyebrow">Question {n + 1}</span>{q?.licence && <span className="tag warn">Affects your licences</span>}</div>
          <h2 className="serif">{busy || !q ? "Thinking about what to ask you…" : q.q}</h2>
          {q && !busy && <p className="muted" style={{ fontSize: 15, margin: "10px 0 0" }}>{q.why}</p>}
          {q && !busy && <div className="opts">
            {q.options.map((o) => <button key={o} className={"chip" + (pick === o && !own ? " on" : "")} onClick={() => { setPick(o); setOwn(false); }}>{o}</button>)}
            <button className={"chip" + (own ? " on" : "")} onClick={() => { setOwn(true); setPick(null); }}>Something else…</button>
          </div>}
          {own && <textarea className="field" rows={2} style={{ marginTop: 14 }} placeholder="Or say it your way…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (text.trim()) answer(text.trim()); } }} autoFocus />}
          {err && <div className="msg bad">{err}<div style={{ marginTop: 10 }}><button className="btn ghost small" onClick={() => fetchBatch(round || 1)}>Try again</button> {n >= 2 && <button className="btn primary small" onClick={onBuild}>Build with what I have</button>}</div></div>}
          <div className="row between wrapping" style={{ marginTop: 18 }}>
            <span className="muted" style={{ fontSize: 14 }}>{n < 3 ? "A few questions, then I build." : "Answer more for a sharper scrapbook, or build now."}</span>
            <div className="row wrapping">
              <button className="btn ghost small" disabled={busy || !q} onClick={() => answer("")}>Skip</button>
              {n >= 3 && <button className="btn ghost small" disabled={busy} onClick={onBuild}>That&apos;s enough, build it</button>}
              <button className="btn primary" disabled={busy || !q} onClick={() => { const a = own ? text.trim() : pick; if (!a) { setErr("Pick an option or type an answer (or skip)."); return; } setErr(""); answer(a); }}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
