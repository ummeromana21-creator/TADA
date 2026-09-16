"use client";
import { ico, logoSvg } from "@/lib/art";
import { doneForRef, pal } from "@/lib/book";
import { placeOf } from "@/lib/data";
import type { LegalItem, Project, ToolOption, Work } from "@/lib/types";
import { arr, hexOr, host, isGov, niceDate, obj, safeUrl, str } from "@/lib/util";
import { useEffect, useState } from "react";
import { Art } from "./Art";
import { MoneyWorkbook } from "./MoneyWorkbook";
import { MoodTile } from "./Scrapbook";

type Props = {
  p: Project; tile: string; busy?: boolean; readOnly?: boolean;
  onClose: () => void;
  onRedo?: (tile: string, extra: string, onStatus: (m: string) => void) => Promise<boolean>;
  onVerify?: () => Promise<void>;
  onWork?: (w: Work) => void;
  onChat?: (pre: string) => void;
};

export function Sheet({ p, tile, busy, readOnly, onClose, onRedo, onVerify, onWork, onChat }: Props) {
  const b = p.book!; const cur = str(obj(b.money).currency) || p.currency; const P = pal(p);
  const [redo, setRedo] = useState(""); const [status, setStatus] = useState("");
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onClose]);
  const head = (eyebrow: string, title: string, tag?: React.ReactNode) => <><div className="row between wrapping"><span className="eyebrow">{eyebrow}</span><div className="row" style={{ gap: 8 }}>{tag}<button className="btn ghost small" onClick={onClose} aria-label="Close"><Art html={ico("x", 16)} /> Close</button></div></div><h2 className="serif">{title}</h2></>;
  const redoBox = (ph: string) => readOnly || !onRedo ? null : <><div className="redo"><input className="field" placeholder={ph} value={redo} onChange={(e) => setRedo(e.target.value)} /><button className="btn ghost" disabled={busy} onClick={async () => { setStatus("Redoing… usually under a minute."); const ok = await onRedo(tile, redo, setStatus); if (ok) setStatus(""); }}><Art html={ico("refresh", 16)} /> Redo</button></div><p className="tiny" style={{ marginTop: 6 }}>Redoing asks Claude again with your note. It takes about a minute. Or just tell me in the chat.</p>{status && <div className="msg plain">{status}</div>}</>;
  let body: React.ReactNode = null;
  if (tile === "pitch") {
    const t = obj(b.pitch); const secs: [string, unknown][] = [["The problem", t.problem], ["The solution", t.solution], ["Who it's for", t.who], ["Why now", t.whyNow], ["How it makes money", t.howItMakesMoney], ["The first 90 days", t.first90Days], ["What could go wrong", t.risks]];
    body = <>{head("The pitch", b.name, <span className="tag">7 sections</span>)}<p className="serif" style={{ fontSize: 20, margin: "6px 0 0" }}>{b.oneLiner}</p>{secs.map(([k, v]) => <div key={k} className="sec"><div className="tiny">{k}</div><p style={{ margin: "4px 0 0" }}>{str(v) || "—"}</p></div>)}{redoBox("e.g. make it shorter, or aim it at investors")}</>;
  } else if (tile === "brand") {
    const br = obj(b.brand);
    body = <>{head("Brand mood", b.name)}
      <div className="sec"><div className="row wrapping" style={{ alignItems: "flex-start", gap: 16 }}>{p.images?.logo ? <img src={p.images.logo} alt="Logo" width={96} height={96} style={{ borderRadius: 16 }} /> : <Art html={logoSvg(br.logo, 96, b.name)} />}<div className="col" style={{ gap: 4, flex: 1, minWidth: 200 }}><div className="tiny">Tagline</div><div className="hand" style={{ fontSize: 26, color: "var(--ink)" }}>“{str(br.tagline)}”</div><div className="tiny" style={{ marginTop: 8 }}>Voice</div><p style={{ margin: 0, fontSize: 15 }}>{str(br.voice)}</p></div></div></div>
      <h3 className="serif">Name directions</h3>{arr(br.names).map((n, i) => <div key={i} className="sec"><div style={{ fontWeight: 600, fontSize: 17 }}>{str(obj(n).name)}</div><p className="muted" style={{ margin: "2px 0 0", fontSize: 14 }}>{str(obj(n).why)}</p></div>)}<p className="tiny" style={{ marginTop: 8 }}>Before you commit to a name, check the domain, trademark register and social handles — that&apos;s a step on your path.</p>
      <h3 className="serif">Palette</h3><div className="sec"><div className="row wrapping" style={{ gap: 14 }}>{arr(br.palette).slice(0, 6).map((c, i) => <div key={i} className="col" style={{ gap: 4, alignItems: "center" }}><span className="swatch" style={{ width: 44, height: 44, background: hexOr(obj(c).hex, "#ccc") }}></span><span className="tiny">{str(obj(c).name)}</span><span style={{ fontSize: 11, color: "var(--ink3)" }}>{hexOr(obj(c).hex, "")}</span></div>)}</div></div>
      <h3 className="serif">Logo marks</h3><div className="sec"><div className="row wrapping" style={{ gap: 18 }}>{["circle", "rounded", "badge", "wordmark"].map((s) => <div key={s} className="col" style={{ alignItems: "center", gap: 4 }}><Art html={logoSvg({ ...obj(br.logo), style: s }, 72, b.name)} /><span className="tiny">{s}</span></div>)}</div><p className="tiny" style={{ marginTop: 10 }}>Vector concepts to react to. &quot;Paint my vision board&quot; adds generated pictures.</p></div>
      <h3 className="serif">Mood</h3><div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>{arr(br.mood).slice(0, 3).map((m, i) => <MoodTile key={i} m={m} i={i} palette={P} src={p.images?.[`mood${i}` as "mood0"]} />)}</div>
      {redoBox("e.g. warmer colours, or a more premium feel")}</>;
  } else if (tile === "money") {
    body = <>{head("Money", "The money workbook", <span className="tag">in {cur}</span>)}<MoneyWorkbook p={p} onWork={onWork} onChat={onChat} readOnly={readOnly} />{redoBox("e.g. assume a smaller budget, or add a second product")}</>;
  } else if (tile === "legal") {
    const l = obj(b.legal);
    body = <>{head("Legal & licences", "Legal & licences", <span className="tag ok">{placeOf(p)}</span>)}
      <p style={{ margin: "6px 0 0" }}>{str(l.summary)}</p>
      <div className="msg" style={{ background: "var(--hi-soft)", color: "var(--ink)" }}><span className="hand" style={{ fontSize: 20 }}>Not legal advice.</span> Every item links to the official body — confirm there before you file, and ask a local accountant about tax.</div>
      {!readOnly && onVerify && <div className="verify-bar"><div><div style={{ fontWeight: 600, fontSize: 15 }}>{b.verifiedAt ? `Last checked against the web ${niceDate(b.verifiedAt)}` : "Not yet checked against the web"}</div><div className="tiny" style={{ fontWeight: 500 }}>Tada searches the official sites for {placeOf(p)} and corrects links, fees and timings. Takes a minute or two.</div></div><button className="btn primary small" disabled={busy} onClick={onVerify}>{busy ? <><span className="spin"></span> Checking…</> : b.verifiedAt ? "Check again" : "Check every item live"}</button></div>}
      <h3 className="serif">Step one · choose your structure</h3>
      <div className="opts3">{arr(l.structures).map((s, i) => <div key={i} className={"optcard" + (obj(s).recommended ? " rec" : "")}>{obj(s).recommended && <span className="sticker" style={{ fontSize: 11, marginBottom: 8 }}>Recommended to start</span>}<div style={{ fontWeight: 600, fontSize: 17 }}>{str(s.name)}</div><p className="muted" style={{ fontSize: 14, margin: "2px 0 8px" }}>{str(s.summary)}</p>{arr(s.pros).map((x, j) => <div key={j} className="row" style={{ gap: 6, alignItems: "flex-start", fontSize: 14 }}><Art html={ico("check", 14, "#1F6B44", 3)} /><span>{str(x)}</span></div>)}{arr(s.cons).map((x, j) => <div key={j} className="row" style={{ gap: 6, alignItems: "flex-start", fontSize: 14, color: "var(--ink2)" }}><span style={{ width: 14, textAlign: "center", fontWeight: 700 }}>–</span><span>{str(x)}</span></div>)}<div className="row wrapping" style={{ gap: 6, marginTop: 10 }}><span className="tag">{str(s.cost)}</span><span className="tag">{str(s.time)}</span></div></div>)}</div>
      <h3 className="serif">Step two · your licence list</h3>
      <div className="row wrapping" style={{ gap: 8, marginBottom: 6 }}><span className="tag ok"><Art html={ico("shield", 12)} /> checked = confirmed on the official site</span><span className="tag ok">official = a government site</span><span className="tag warn">verify = confirm the detail locally</span></div>
      <div className="sec">{arr<LegalItem>(l.items).map((i) => { const u = safeUrl(i.url), dn = doneForRef(p, str(i.id)), v = obj(i.verified); return <div key={str(i.id)} className="item"><span className={"check" + (dn ? " on" : "")} style={{ marginTop: 2 }}><Art html={dn ? ico("check", 14, "#fff", 3) : ""} /></span><div><div className="t" style={dn ? { textDecoration: "line-through", color: "var(--ink3)" } : undefined}>{str(i.title)}</div><div className="d">{str(i.why)}</div><div className="m"><span className={"tag " + (str(i.status) === "required" ? "warn" : str(i.status) === "recommended" ? "info" : "")}>{str(i.status) || "item"}</span>{v.status === "confirmed" || v.status === "updated" ? <span className="tag ok">checked {niceDate(v.checkedAt)}</span> : v.status === "unsure" ? <span className="tag warn">couldn&apos;t confirm</span> : u && isGov(u) ? <span className="tag ok">official</span> : null}{i.verify && v.status !== "confirmed" && v.status !== "updated" && <span className="tag warn">verify</span>}{i.cost && <span className="tag">{str(i.cost)}</span>}{i.time && <span className="tag">{str(i.time)}</span>}</div>{v.note && <div className="d" style={{ marginTop: 6 }}><strong>Checked:</strong> {str(v.note)}</div>}<div className="tiny" style={{ marginTop: 8 }}>Issued by {str(i.body)}</div>{u && <><a className="btn ghost small" style={{ marginTop: 8 }} href={u} target="_blank" rel="noopener noreferrer">Open {host(u)} <Art html={ico("ext", 14)} /></a><div className="u">{u}</div></>}</div></div>; })}</div>
      {redoBox("e.g. I\'ll sell through shops too, or I\'m in a different city")}</>;
  } else if (tile === "tools") {
    const t = obj(b.tools);
    body = <>{head("Tools & vendors", "Tools & vendors", <span className="tag">ranked by fit</span>)}<p style={{ margin: "6px 0 0" }}>Two or three real options for each thing you&apos;ll need, with one pick and why. Prices change; check the vendor&apos;s site before you sign up.</p>
      {arr(t.needs).map((n, i) => <div key={i}><h3 className="serif">{str(n.need)}</h3><p className="muted" style={{ fontSize: 14, margin: "-4px 0 8px" }}>{str(n.why)}</p><div className="opts3">{arr<ToolOption>(n.options).map((o, j) => { const u = safeUrl(o.url); return <div key={j} className={"optcard" + (obj(o).recommended ? " rec" : "")}>{obj(o).recommended && <span className="sticker mint" style={{ fontSize: 11, marginBottom: 8 }}>Our pick</span>}<div style={{ fontWeight: 600, fontSize: 16 }}>{str(o.name)}</div><div className="row wrapping" style={{ gap: 6, margin: "6px 0" }}><span className="tag">{str(o.priceTier)} cost</span><span className="tag">convenience {Math.max(1, Math.min(5, Number(o.convenience) || 3))}/5</span></div><p className="muted" style={{ fontSize: 14, margin: 0 }}>{str(o.note)}</p>{u && <a href={u} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, display: "inline-flex", gap: 4, alignItems: "center", marginTop: 8 }}>{host(u)} <Art html={ico("ext", 12)} /></a>}</div>; })}</div></div>)}
      <h3 className="serif">Funding</h3><p className="muted" style={{ fontSize: 14, margin: "-4px 0 8px" }}>Where the money could come from lives in the Money workbook, next to the numbers it would pay for.</p>
      {redoBox("e.g. cheapest options only, or I already use a bank")}</>;
  }
  return <><div className="sheet-bg on" onClick={onClose}></div><aside className="sheet on" aria-label="Tile detail"><div className="in">{body}</div></aside></>;
}
