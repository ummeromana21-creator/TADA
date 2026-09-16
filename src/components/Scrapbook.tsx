"use client";
import { decor, ico, logoSvg, scene } from "@/lib/art";
import { doneForRef, pal, PHASES, progressOf } from "@/lib/book";
import { placeOf } from "@/lib/data";
import { calcMoney, workFromMoney } from "@/lib/money";
import type { Project } from "@/lib/types";
import { arr, hexOr, isGov, money, niceDate, obj, safeUrl, str } from "@/lib/util";
import { Art } from "./Art";

export function MoodTile({ m, i, palette, small, src }: { m: unknown; i: number; palette: string[]; small?: boolean; src?: string }) {
  const mm = obj(m);
  const from = hexOr(mm.from, palette[i % 2 ? 1 : 3] || "#FBE3C8"), to = hexOr(mm.to, palette[i % 2 ? 3 : 1] || "#F6C6D0");
  const tapes = ["tape stripe", "tape dots", "tape gingham"];
  return (
    <div className="polaroid" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (1.5 + i * 0.4)}deg)` }}>
      <div className={tapes[i % 3]} style={{ width: 70, height: 20 }}></div>
      {src ? <div className="photo"><img src={src} alt={str(mm.caption)} className="img" /></div> : <Art as="div" className="photo" html={scene(str(mm.motif), from, to, i)} />}
      <div className="cap" style={small ? { fontSize: 15 } : undefined}>{str(mm.caption).slice(0, 60)}</div>
    </div>
  );
}

export function Scrapbook({ p, onOpen, onChat, readOnly }: { p: Project; onOpen: (tile: string) => void; onChat?: (prefill: string) => void; readOnly?: boolean }) {
  const b = p.book!; const cur = str(obj(b.money).currency) || p.currency; const P = pal(p);
  const pitch = obj(b.pitch), brand = obj(b.brand), legal = obj(b.legal), tools = obj(b.tools), pr = progressOf(p);
  const w = p.work ?? workFromMoney(b.money); const calc = calcMoney(w);
  const litems = arr(legal.items).slice(0, 5); const ldone = arr(legal.items).filter((i) => doneForRef(p, str(i.id))).length;
  const next = pr.steps.find((s) => !p.done[str(s.id)]);
  const as = arr(b.assumptions);
  const tile = (k: string, rot: number, span2: boolean, children: React.ReactNode) => (
    <div key={k} className={"note tile" + (span2 ? " span2" : "")} role="button" tabIndex={0} style={{ transform: `rotate(${rot}deg)` }} onClick={() => onOpen(k)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(k); } }}>{children}</div>
  );
  return (
    <>
      <div className="sbhead">
        <Art html={decor("sprig", "right:-10px;top:0;width:120px;opacity:.9;transform:scaleX(-1) rotate(8deg)") + decor("star", "right:120px;top:10px;width:44px;transform:rotate(12deg)")} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="row wrapping" style={{ gap: 8 }}><span className="sticker">Draft {(p.redos || 0) + 1}</span><span className="sticker white">Made {niceDate(p.builtAt || p.createdAt)}</span><span className="sticker sky">{placeOf(p)}</span>{b.verifiedAt && <span className="sticker mint">Checked {niceDate(b.verifiedAt)}</span>}</div>
          <h1 className="serif">{b.name}<svg className="ul" viewBox="0 0 330 14" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M3 9c60-8 120-8 180-4s90 4 144-3" stroke="#FFE45C" strokeWidth="7" strokeLinecap="round"></path></svg></h1>
          <div className="muted" style={{ fontSize: 17, maxWidth: "70ch" }}>{b.oneLiner}</div>
        </div>
        {!readOnly && <div className="hand" style={{ fontSize: 24, transform: "rotate(-2deg)", position: "relative", zIndex: 1 }}>tap any tile to open it — or just talk to me to change anything</div>}
      </div>
      {as.length > 0 && <div className="note yellow assume"><div className="tape gingham left"></div><Art html={decor("sparkles", "right:10px;top:-18px;width:44px")} />
        <div><span className="eyebrow">Things I assumed</span>{!readOnly && <div className="hand" style={{ fontSize: 22, color: "var(--ink)", marginTop: 2 }}>Tap &quot;not quite?&quot; on anything that&apos;s off and tell me — I&apos;ll fix the tiles it touches.</div>}</div>
        <div className="list">{as.map((a, i) => <div key={i} className="a"><span>{a.text}{a.because && <span className="muted"> — because {a.because}</span>}</span>{!readOnly && onChat && <button onClick={() => onChat(`About "${a.text}" — actually, `)}>not quite?</button>}</div>)}</div>
      </div>}
      <div className="tiles">
        {tile("pitch", -0.6, true, <><div className="tape stripe"></div><div className="th"><span className="eyebrow">The pitch</span><span className="tag">7 sections</span></div>
          <div className="serif" style={{ fontSize: "clamp(20px,2.4vw,26px)" }}>{str(pitch.solution) || b.oneLiner}</div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 18, marginTop: 16 }}>
            {[["The problem", pitch.problem], ["Who it's for", pitch.who], ["How it makes money", pitch.howItMakesMoney]].map(([k, v]) => <div key={k}><div className="tiny">{k}</div><p style={{ fontSize: 14, color: "#4A443D" }}>{str(v)}</p></div>)}
          </div>
          <div className="row between wrapping" style={{ marginTop: 14 }}><span className="hand" style={{ fontSize: 21 }}>written from your answers — sounds like you?</span><span style={{ fontWeight: 600, color: "var(--accent)" }}>Read the full pitch →</span></div>
        </>)}
        {tile("brand", 1.2, false, <><div className="pin"></div><div className="th"><span className="eyebrow">Brand mood</span><span className="tag">{arr(brand.names).length || 1} names</span></div>
          <div className="row" style={{ alignItems: "flex-start" }}><Art html={logoSvg(brand.logo, 60, b.name)} /><div className="col" style={{ gap: 2, minWidth: 0 }}><div className="serif" style={{ fontSize: 20 }}>{b.name}</div><div className="tiny">also: {arr(brand.names).map((n) => str(obj(n).name)).filter((n) => n && n !== b.name).slice(0, 2).join(" · ")}</div><div className="hand" style={{ fontSize: 19, color: "var(--ink)" }}>“{str(brand.tagline)}”</div></div></div>
          <div className="row wrapping" style={{ gap: 6, marginTop: 14 }}>{P.map((c) => <span key={c} className="swatch" style={{ background: c }}></span>)}</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>{arr(brand.mood).slice(0, 2).map((m, i) => <MoodTile key={i} m={m} i={i} palette={P} small src={p.images?.[`mood${i}` as "mood0"]} />)}</div>
        </>)}
        {tile("money", -1, false, <><div className="tape mint"></div><div className="th"><span className="eyebrow">Money</span><span className="tag">{calc.ok ? "workbook" : "estimates"}</span></div>
          <div className="serif" style={{ fontSize: 30 }}>{calc.startupLow || calc.startupHigh ? `${money(calc.startupLow, cur)}–${money(calc.startupHigh, cur)}` : "—"}</div>
          <div className="tiny" style={{ marginTop: 2 }}>to start · {arr(obj(b.money).startup).slice(0, 3).map((x) => str(x.item).toLowerCase()).join(", ")}{arr(obj(b.money).startup).length > 3 ? "…" : ""}</div>
          <div className="hr" style={{ margin: "12px 0" }}></div>
          <div className="col" style={{ gap: 6, fontSize: 14 }}>{w.items.slice(0, 3).map((x) => <div key={x.item} className="row between"><span className="muted">{x.item}</span><strong>{money(x.price, cur)}</strong></div>)}</div>
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "var(--soft)" }}><div className="tiny">{calc.ok ? "With your numbers" : "Break-even"}</div><div style={{ fontSize: 14, marginTop: 2 }}>{calc.ok ? (calc.profit >= 0 ? <>About <strong>{money(calc.profit, cur)}</strong> a month once you&apos;re at full speed · cash-positive {calc.positiveMonth ? `by month ${calc.positiveMonth}` : "after year one"}</> : <>Still <strong>{money(-calc.profit, cur)}</strong> short each month at these numbers — open the workbook and play with them</>) : str(obj(b.money).breakEven)}</div></div>
          <div className="hand" style={{ fontSize: 19, marginTop: 10 }}>open to play with the numbers</div>
        </>)}
        {tile("legal", 0.8, false, <><div className="pin blue"></div><div className="th"><span className="eyebrow">Legal &amp; licences</span><span className="tag ok">{placeOf(p).split(",")[0]}</span></div>
          {litems.length ? litems.map((i) => { const dn = doneForRef(p, str(i.id)); const v = obj(i.verified); return <div key={str(i.id)} className="lrow"><span className={"check" + (dn ? " on" : "")}><Art html={dn ? ico("check", 13, "#fff", 3) : ""} /></span><span style={{ flex: 1, ...(dn ? { textDecoration: "line-through", color: "var(--ink3)" } : {}) }}>{str(i.title)}</span>{v.status === "confirmed" || v.status === "updated" ? <span className="tag ok">checked</span> : i.verify ? <span className="tag warn">verify</span> : isGov(safeUrl(i.url)) ? <span className="tag ok">official</span> : <span className="tag">{str(i.status)}</span>}</div>; }) : <p className="muted">Nothing here yet.</p>}
          <div className="row between" style={{ marginTop: 12 }}><span className="tiny">{arr(legal.items).length} items · {ldone} done · {b.verifiedAt ? `checked ${niceDate(b.verifiedAt)}` : "not yet checked live"}</span><span style={{ fontWeight: 600, color: "var(--accent)" }}>Open →</span></div>
        </>)}
        {tile("tools", -0.8, false, <><div className="tape dots"></div><div className="th"><span className="eyebrow">Tools, vendors &amp; funding</span><span className="tag">by fit</span></div>
          <div className="col" style={{ gap: 0 }}>{arr(tools.needs).slice(0, 4).map((n) => { const r = arr(n.options).find((o) => obj(o).recommended) || arr(n.options)[0] || {}; return <div key={str(n.id)} className="lrow"><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600 }}>{str(n.need)}</div><div className="tiny">{str(r.name)}{r.priceTier ? ` · ${str(r.priceTier)} cost` : ""}</div></div><span className="sticker mint" style={{ fontSize: 11, padding: "3px 9px" }}>pick</span></div>; })}</div>
          {arr(b.funding).length > 0 && <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "var(--soft)" }}><div className="tiny">Where the money could come from</div><div style={{ fontSize: 14, marginTop: 2 }}>{arr(b.funding).slice(0, 3).map((f) => str(obj(f).name)).join(" · ")}</div></div>}
        </>)}
        {tile("path", 0.5, true, <><div className="tape blush right"></div><Art html={decor("bunting", "left:10px;top:-14px;width:min(260px,60%)")} /><div className="th" style={{ marginTop: 14 }}><span className="eyebrow">The path</span><span className="tag info">{pr.total} steps · 4 phases</span></div>
          <div className="grid pathgrid" style={{ background: "var(--hi-soft)", margin: "-8px -10px -6px", padding: "14px 16px", borderRadius: 8 }}>
            <svg className="ring" width="96" height="96" viewBox="0 0 92 92" aria-hidden="true"><circle cx="46" cy="46" r="38" stroke="#EAE3D7" strokeWidth="10" fill="none"></circle><circle cx="46" cy="46" r="38" stroke="#2E4BC6" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="238.8" strokeDashoffset={(238.8 * (1 - pr.pct / 100)).toFixed(1)} transform="rotate(-90 46 46)"></circle><text x="46" y="52" textAnchor="middle" fontFamily="Young Serif, Georgia, serif" fontSize="22" fill="#2A2724">{pr.pct}%</text></svg>
            <div className="col" style={{ gap: 4 }}><div className="serif" style={{ fontSize: 22 }}>{pr.done} of {pr.total} done</div><div className="tiny">{PHASES.map((ph) => { const s = pr.steps.filter((x) => str(x.phase) === ph); return `${ph} ${s.filter((x) => p.done[str(x.id)]).length}/${s.length}`; }).join(" · ")}</div><div className="hand" style={{ fontSize: 20, marginTop: 2 }}>this is the vision board</div></div>
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "#fff" }}><div className="tiny">{next ? "Next up" : "All done"}</div><div style={{ fontSize: 15, marginTop: 2, fontWeight: 600 }}>{next ? str(next.title) : "Ta-da."}</div><div className="row between wrapping" style={{ marginTop: 6 }}><span className="tiny">{next ? [str(next.cost), str(next.time)].filter(Boolean).join(" · ") : ""}</span><span className="btn primary small">Open the board →</span></div></div>
          </div>
        </>)}
      </div>
    </>
  );
}
