"use client";
import { DECOR, decor, ico, logoSvg, scene, starSticker } from "@/lib/art";
import { pal, PHASES, progressOf } from "@/lib/book";
import { placeOf } from "@/lib/data";
import type { Project } from "@/lib/types";
import { arr, host, niceDate, obj, safeUrl, str, today } from "@/lib/util";
import { useEffect, useRef, useState } from "react";
import { Art } from "./Art";
import { MoodTile } from "./Scrapbook";

function refLink(ref: unknown): { key: string; label: string } | null {
  const r = str(ref); if (!r) return null;
  const map: Record<string, string> = { L: "legal", T: "tools", pitch: "pitch", brand: "brand", money: "money" };
  const k = map[r[0]] || map[r]; if (!k) return null;
  return { key: k, label: k === "legal" ? "Legal & licences" : k === "tools" ? "Tools & vendors" : "the " + k };
}

function Confetti({ go }: { go: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!go || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current!; c.hidden = false; const x = c.getContext("2d")!; const W = (c.width = innerWidth), H = (c.height = innerHeight);
    const cols = ["#E0596F", "#2E4BC6", "#FFE45C", "#3E9B6A", "#F2CD8A", "#BFDCC6", "#F6C6D0"];
    const ps = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.2, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: cols[Math.floor(Math.random() * cols.length)] }));
    const t0 = performance.now(); let raf = 0;
    const f = (t: number) => { x.clearRect(0, 0, W, H); for (const q of ps) { q.x += q.vx; q.y += q.vy; q.r += q.vr; x.save(); x.translate(q.x, q.y); x.rotate(q.r); x.fillStyle = q.c; x.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); x.restore(); } if (t - t0 < 3800) raf = requestAnimationFrame(f); else { x.clearRect(0, 0, W, H); c.hidden = true; } };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [go]);
  return <canvas id="confetti" ref={ref} hidden />;
}

export function VisionBoard({ p, onTick, onOpenTile, onPaint, onFounding, busy, readOnly }: { p: Project; onTick?: (id: string) => void; onOpenTile?: (t: string) => void; onPaint?: () => void; onFounding?: () => void; busy?: boolean; readOnly?: boolean }) {
  const b = p.book!; const pr = progressOf(p); const path = obj(b.path), v = obj(b.vision), br = obj(b.brand), P = pal(p);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [founding, setFounding] = useState(false);
  const [party, setParty] = useState(0);
  const wasPct = useRef(pr.pct);
  useEffect(() => { if (pr.pct === 100 && wasPct.current < 100) { setFounding(true); setParty((n) => n + 1); } wasPct.current = pr.pct; }, [pr.pct]);
  const stones = arr(v.milestones).slice(0, 5), fills = ["#FFE45C", "#F9D3DC", "#CFEEDC", "#D2E2FA", "#E4D9F7"], strokes = ["#E8B62A", "#E0596F", "#3E9B6A", "#2E4BC6", "#8B6FD1"];
  const next = pr.steps.find((s) => !p.done[str(s.id)]);
  const handle = str(b.name).toLowerCase().replace(/[^a-z0-9]+/g, "");
  const hasPics = !!(p.images?.hero || p.images?.mood0);
  return (
    <>
      <div className="bhead">
        <Art html={decor("sun", "left:-30px;top:-10px;width:90px;opacity:.95") + decor("sprig", "right:-20px;bottom:-30px;width:110px;transform:rotate(-20deg)")} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="row wrapping" style={{ gap: 8 }}><span className="sticker">{b.name}</span><span className="sticker white">Started {niceDate(p.createdAt)}</span>{pr.pct === 100 && <span className="sticker mint">Ta-da!</span>}</div>
          <h1 className="serif">The path to <span style={{ color: "var(--accent)" }}>Ta-da</span></h1>
        </div>
        <div className="note" style={{ padding: "18px 22px", minWidth: "min(400px,100%)", position: "relative", zIndex: 1 }}><div className="tape stripe"></div>
          <div className="row between"><span className="eyebrow">Progress</span><span className="serif" style={{ fontSize: 24 }}>{pr.done} <span className="muted" style={{ fontSize: 15 }}>of {pr.total}</span></span></div>
          <div className="progress" style={{ marginTop: 10, height: 14 }}><div className="bar" style={{ width: pr.pct + "%" }}></div></div>
          <div className="row between wrapping" style={{ marginTop: 8 }}><span className="tiny">{str(path.target)}</span><span className="hand" style={{ fontSize: 20 }}>{pr.pct === 100 ? "you did it" : pr.pct >= 50 ? "you're past halfway" : pr.done ? "good start" : "first tick is the hardest"}</span></div>
        </div>
      </div>
      {!readOnly && onPaint && !hasPics && <div className="verify-bar" style={{ marginTop: 26 }}><div><div style={{ fontWeight: 600, fontSize: 15 }}>Paint the vision board</div><div className="tiny" style={{ fontWeight: 500 }}>Turns the scenes below into real storybook pictures of {b.name}. Takes a minute or two.</div></div><button className="btn primary small" disabled={busy} onClick={onPaint}>{busy ? <><span className="spin"></span> Painting…</> : <><Art html={ico("camera", 16, "#fff")} /> Paint my vision board</>}</button></div>}
      <div className="vision">
        <Art html={decor("cloud", "left:38%;top:-30px;width:90px;opacity:.9") + decor("heart", "right:30%;top:-24px;width:40px;transform:rotate(10deg)")} />
        <div className="note v-manifesto"><div className="tape stripe"></div><Art html={decor("flower", "left:-26px;bottom:-26px;width:64px;transform:rotate(-15deg)")} /><span className="eyebrow">The dream, in your words</span><div className="hand" style={{ fontSize: "clamp(26px,3.4vw,38px)", color: "var(--ink)", marginTop: 10 }}>{str(v.manifesto) || b.oneLiner}</div>{v.why && <div className="row" style={{ gap: 10, marginTop: 18, alignItems: "flex-start" }}><Art html={ico("heart", 18, "#E0596F")} /><span className="muted" style={{ fontSize: 15 }}>{str(v.why)}</span></div>}</div>
        <div className="v-side">
          {p.images?.hero && <div className="polaroid" style={{ transform: "rotate(1.5deg)" }}><div className="tape dots" style={{ width: 80, height: 22 }}></div><div className="photo" style={{ aspectRatio: "4/3" }}><img src={p.images.hero} alt={`${b.name} on its best day`} className="img" /></div><div className="cap">{b.name}, on its best day</div></div>}
          <div className="note" style={{ padding: "18px 20px" }}><div className="pin gold"></div><div className="row" style={{ gap: 14 }}>{p.images?.logo ? <img src={p.images.logo} alt="Logo" width={64} height={64} style={{ borderRadius: 12 }} /> : <Art html={logoSvg(br.logo, 64, b.name)} />}<div className="col" style={{ gap: 2, minWidth: 0 }}><div className="serif" style={{ fontSize: 22 }}>{b.name}</div><div className="hand" style={{ fontSize: 20, color: "var(--ink)" }}>“{str(br.tagline)}”</div></div></div><div className="row" style={{ gap: 0, marginTop: 14, height: 18, borderRadius: 4, overflow: "hidden", transform: "rotate(-1deg)", alignItems: "stretch" }}>{P.map((c) => <span key={c} style={{ flex: 1, height: 18, background: c }}></span>)}</div><div className="tiny" style={{ marginTop: 6 }}>{arr(br.palette).map((c) => str(obj(c).name)).filter(Boolean).join(" · ")}</div></div>
          <div className="note yellow" style={{ padding: "18px 20px", transform: "rotate(1deg)" }}><div className="tape gingham right"></div><span className="eyebrow">Next on the path</span>{next ? <><div style={{ fontWeight: 600, fontSize: 17, marginTop: 6 }}>{str(next.title)}</div><div className="tiny" style={{ marginTop: 2 }}>{[str(next.cost), str(next.time)].filter(Boolean).join(" · ")}</div></> : <div className="serif" style={{ fontSize: 22, marginTop: 6 }}>All done. Ta-da.</div>}</div>
        </div>
        <div className="v-moods">{arr(br.mood).slice(0, 3).map((m, i) => <MoodTile key={i} m={m} i={i} palette={P} src={p.images?.[`mood${i}` as "mood0"]} />)}</div>
        <div className="v-stones">{stones.map((s, i) => <div key={i} className="col" style={{ alignItems: "center", gap: 2, transform: `rotate(${(i % 2 ? 1 : -1) * (3 + i)}deg)` }}><Art html={starSticker(str(obj(s).title), fills[i % 5], strokes[i % 5])} /><span className="tiny">{str(obj(s).when)}</span></div>)}{!stones.length && <span className="muted">Milestones show up here.</span>}</div>
        <div className="note cream v-day"><div className="tape lilac left"></div><Art html={decor("sparkles", "right:12px;top:-14px;width:40px")} /><span className="eyebrow">A day in the life, one year from now</span><p style={{ fontSize: 16, lineHeight: 1.6, margin: "8px 0 0", maxWidth: "none" }}>{str(v.dayInTheLife) || <span className="muted">Ask me in the chat to imagine a day in the life.</span>}</p></div>
        <div className="note v-post"><div className="pin"></div><span className="eyebrow">Your first post</span><div className="post-head" style={{ marginTop: 10 }}>{p.images?.logo ? <img src={p.images.logo} alt="" width={36} height={36} style={{ borderRadius: 8 }} /> : <Art html={logoSvg(br.logo, 36, b.name)} />}<div><div style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</div><div className="tiny" style={{ fontWeight: 500 }}>@{handle} · just now</div></div></div><div className="post-body">{p.images?.mood0 ? <img src={p.images.mood0} alt="" className="img" /> : <Art html={scene(str(obj(br.logo).motif), P[3] || "#F6C6D0", P[1] || "#F2CD8A", 7)} />}</div><p style={{ fontSize: 14, margin: "12px 0 0", maxWidth: "none" }}>{str(v.firstPost)}</p></div>
      </div>
      <div className="row between wrapping" style={{ marginTop: 44 }}><div><span className="eyebrow">The path</span><h2 className="serif" style={{ fontSize: 30, margin: "6px 0 0" }}>Tick your way there</h2></div><span className="hand" style={{ fontSize: 22 }}>every box links back to the tile it came from</span></div>
      <div className="phases">
        {PHASES.map((ph, i) => { const steps = pr.steps.filter((s) => str(s.phase) === ph); const d = steps.filter((s) => p.done[str(s.id)]).length;
          return <div key={ph} className="note phase" style={{ transform: `rotate(${[-0.8, 1, -1.1, 0.9][i]}deg)` }}><div className={"tape " + ["stripe", "dots", "gingham", "blush"][i]}></div><div className="row between"><h2 className="serif">{ph}</h2><span className={"tag" + (d === steps.length && steps.length ? " ok" : "")}>{d}/{steps.length}</span></div>
            <div className="steps">{steps.length ? steps.map((s) => { const id = str(s.id), dn = !!p.done[id], u = safeUrl(s.url), rl = refLink(s.ref), isNext = next && str(next.id) === id;
              return <div key={id} className={"step" + (dn ? " done" : "") + (isNext ? " next" : "") + (open[id] ? " open" : "")}><button className={"check" + (dn ? " on" : "")} disabled={readOnly} onClick={() => onTick?.(id)} aria-label={dn ? "Undo" : "Done"}><Art html={dn ? ico("check", 14, "#fff", 3) : ""} /></button><div style={{ flex: 1, minWidth: 0 }}><button className="t" style={{ textAlign: "left" }} onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))}>{str(s.title)}</button><div className="m">{[str(s.cost), str(s.time)].filter(Boolean).join(" · ")}{dn && p.doneAt[id] ? ` · done ${niceDate(p.doneAt[id])}` : ""}</div><div className="d">{str(s.detail)}{u && <> <a href={u} target="_blank" rel="noopener noreferrer">{host(u)} <Art html={ico("ext", 11)} /></a></>}{rl && !readOnly && onOpenTile && <> <a href="#" onClick={(e) => { e.preventDefault(); onOpenTile(rl.key); }}>see {rl.label}</a></>}</div></div>{isNext && <span className="sticker" style={{ fontSize: 11, padding: "3px 9px" }}>next</span>}</div>; }) : <p className="muted" style={{ fontSize: 14 }}>No steps in this phase.</p>}</div></div>; })}
      </div>
      <div className="note tada"><div className="tape blush" style={{ left: 40, transform: "rotate(-6deg)" }}></div>
        <div style={{ position: "relative", zIndex: 1 }}><div className="eyebrow">What happens at 100%</div><div className="serif" style={{ fontSize: 28, marginTop: 8 }}>The board becomes your founding page.</div><p className="muted" style={{ fontSize: 15, margin: "8px 0 0", maxWidth: "56ch" }}>Every ticked step, kept in one place with the date it happened. Save it, print it, or frame it. Then start scrapbook two.</p></div>
        <Art html={DECOR.bunting.replace("<svg ", '<svg style="width:240px;max-width:100%" ')} />
      </div>
      <Confetti go={party} />
      {founding && <div className="founding on"><div className="note"><div className="tape stripe"></div><Art html={decor("bunting", "left:0;top:-8px;width:100%;opacity:.9")} /><div style={{ position: "relative", marginTop: 30 }}><span className="sticker">Ta-da</span><h2 className="serif" style={{ fontSize: "clamp(30px,5vw,44px)", margin: "12px 0 6px" }}>{b.name} exists.</h2><p className="muted" style={{ margin: 0 }}>Founded by you · {placeOf(p)} · {niceDate(today())}</p><p className="hand" style={{ fontSize: 24, color: "var(--ink)", margin: "14px 0 0" }}>{str(v.manifesto) || b.oneLiner}</p><div className="sec" style={{ marginTop: 16 }}><div className="tiny">The record</div><div className="col" style={{ gap: 4, marginTop: 6, fontSize: 14 }}>{pr.steps.map((s) => <div key={str(s.id)} className="row" style={{ gap: 8, alignItems: "flex-start" }}><Art html={ico("check", 14, "#1F6B44", 3)} /><span>{str(s.title)}<span className="tiny" style={{ fontWeight: 500 }}> · {niceDate(p.doneAt[str(s.id)] || today())}</span></span></div>)}</div></div><div className="row wrapping" style={{ marginTop: 18, gap: 10 }}>{onFounding && <button className="btn primary" onClick={onFounding}>Save the founding page</button>}<button className="btn ghost" onClick={() => setFounding(false)}>Close</button></div></div></div></div>}
    </>
  );
}
