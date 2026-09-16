"use client";
import { calcMoney, workFromMoney, type Calc } from "@/lib/money";
import type { Funding, Project, Work } from "@/lib/types";
import { arr, isGov, money, num, obj, safeUrl, str } from "@/lib/util";
import { useEffect, useMemo, useRef, useState } from "react";
import { Art } from "./Art";
import { ico } from "@/lib/art";

/** Cash-by-month bars: one hue, baseline at zero, direct labels on the two months that matter, hover for the rest. */
export function CashChart({ c, cur }: { c: Calc; cur: string }) {
  const [tip, setTip] = useState<{ x: number; y: number; t: string } | null>(null);
  const W = 600, H = 230, L = 52, R = 14, T = 22, B = 34;
  const vals = c.months; const mx = Math.max(0, ...vals), mn = Math.min(0, ...vals); const span = mx - mn || 1;
  const y = (v: number) => T + ((mx - v) / span) * (H - T - B); const bw = (W - L - R) / 12;
  const now = new Date(); const mon = (i: number) => new Date(now.getFullYear(), now.getMonth() + i + 1, 1).toLocaleDateString(undefined, { month: "short" });
  const ticks = [mx, 0, mn].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cash balance by month" onMouseLeave={() => setTip(null)}>
        {ticks.map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={v === 0 ? "#2A2724" : "#E6DFD3"} strokeWidth={v === 0 ? 1.5 : 1} /><text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#7A7268">{money(v, cur)}</text></g>)}
        {vals.map((v, i) => { const x = L + i * bw + bw * 0.2, w = bw * 0.6, y0 = y(0), y1 = y(v), top = Math.min(y0, y1), h = Math.max(2, Math.abs(y1 - y0)); const hi = i + 1 === c.positiveMonth || i + 1 === c.low.m;
          return <g key={i} onMouseEnter={() => setTip({ x: ((x + w / 2) / W) * 100, y: (top / H) * 100, t: `${mon(i)}: ${money(v, cur)}` })}>
            <rect x={x} y={top} width={w} height={h} rx={3} fill="#2E4BC6" opacity={v < 0 ? 0.45 : 1} />
            <rect x={L + i * bw} y={T} width={bw} height={H - T - B} fill="transparent" />
            {hi && <text x={x + w / 2} y={v >= 0 ? top - 6 : top + h + 13} textAnchor="middle" fontSize="11" fontWeight="700" fill="#2A2724">{money(v, cur)}</text>}
            <text x={x + w / 2} y={H - 12} textAnchor="middle" fontSize="11" fill="#7A7268">{mon(i)}</text>
          </g>; })}
      </svg>
      {tip && <div className="tip" style={{ left: tip.x + "%", top: tip.y + "%", display: "block" }}>{tip.t}</div>}
      <div className="tiny" style={{ marginTop: 4 }}>Cash in the bank at the end of each month, starting from what you have minus start-up costs. Hover a bar for the exact figure.</div>
    </div>
  );
}

const Num = ({ v, on, id }: { v: number; on: (n: number) => void; id: string }) => <input id={id} className="num" type="number" min={0} step={1} inputMode="decimal" value={Math.round(v)} onChange={(e) => on(num(e.target.value))} />;

export function MoneyWorkbook({ p, onWork, onChat, readOnly }: { p: Project; onWork?: (w: Work) => void; onChat?: (pre: string) => void; readOnly?: boolean }) {
  const b = p.book!; const cur = str(obj(b.money).currency) || p.currency; const lean = obj(b.leaner);
  const [w, setW] = useState<Work>(() => p.work ?? workFromMoney(b.money));
  const c = useMemo(() => calcMoney(w), [w]);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } const t = setTimeout(() => onWork?.(w), 500); return () => clearTimeout(t); }, [w, onWork]);
  const set = (fn: (d: Work) => void) => setW((prev) => { const d = structuredClone(prev); fn(d); return d; });
  const be = c.factor === Infinity ? "—" : Math.round(c.factor * 100) + "%";
  const need = c.low.v < 0 ? money(-c.low.v, cur) : null;
  return (
    <>
      <p style={{ margin: "6px 0 0" }}>These are Claude&apos;s first estimates. Change any number and everything below recalculates, so you can see what a higher price, a slower start, or one more product does to your year.</p>
      <h3 className="serif">1 · What you sell</h3>
      <div className="sec"><div className="wb"><div className="h">Item</div><div className="h">Price</div><div className="h">Cost each</div><div className="h">Per month</div>
        {w.items.map((x, i) => <div key={i} style={{ display: "contents" }}><div>{x.item}</div>{readOnly ? <><div className="n">{money(x.price, cur)}</div><div className="n">{money(x.unitCost, cur)}</div><div className="n">{x.units}</div></> : <><Num id={`wi-p${i}`} v={x.price} on={(n) => set((d) => { d.items[i].price = n; })} /><Num id={`wi-c${i}`} v={x.unitCost} on={(n) => set((d) => { d.items[i].unitCost = n; })} /><Num id={`wi-u${i}`} v={x.units} on={(n) => set((d) => { d.items[i].units = n; })} /></>}</div>)}
      </div><div className="teach"><strong>Cost each</strong> is what one sale costs you to make or deliver: ingredients, materials, packaging, time you pay for. What&apos;s left after that is your <strong>contribution</strong> — the money that pays the fixed costs below.</div></div>
      <h3 className="serif">2 · What you pay every month anyway</h3>
      <div className="sec"><div className="wb wb2"><div className="h">Fixed cost</div><div className="h">A month</div>
        {w.running.map((x, i) => <div key={i} style={{ display: "contents" }}><div>{x.item}</div>{readOnly ? <div className="n">{money(x.amount, cur)}</div> : <Num id={`wr-${i}`} v={x.amount} on={(n) => set((d) => { d.running[i].amount = n; })} />}</div>)}
      </div><div className="teach">Fixed costs are paid whether you sell one loaf or a hundred. Keep this list honest; it&apos;s the number that decides how many sales you need just to stand still.</div></div>
      <h3 className="serif">3 · Cash to start with</h3>
      <div className="sec"><div className="wb wb2"><div className="h">One-off cost</div><div className="h">Estimate</div>{w.startup.map((x, i) => <div key={i} style={{ display: "contents" }}><div>{x.item}</div><div className="n">{money(x.low, cur)}–{money(x.high, cur)}</div></div>)}</div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div><label className="lbl" htmlFor="w-cash">Money you have to start</label>{readOnly ? <div className="n" style={{ fontWeight: 600 }}>{money(w.cash, cur)}</div> : <Num id="w-cash" v={w.cash} on={(n) => set((d) => { d.cash = n; })} />}</div>
          <div><label className="lbl" htmlFor="w-ramp">Months until sales reach the numbers above: <strong>{w.ramp}</strong></label>{!readOnly && <input type="range" id="w-ramp" min={1} max={12} value={w.ramp} onChange={(e) => set((d) => { d.ramp = num(e.target.value, 3); })} />}</div>
        </div><div className="teach">Start-up costs come out first, and early months rarely hit full volume, so cash dips before it climbs. Founders most often get the <strong>ramp</strong> wrong — be pessimistic here.</div></div>
      <h3 className="serif">4 · What that means</h3>
      <div className="sec" style={{ background: "var(--hi-soft)" }}>
        <div className="stats">
          {[["Contribution a month", money(c.monthly, cur), "at full volume, after cost-each", ""], ["Fixed costs a month", money(c.fixed, cur), "paid whether you sell or not", ""], ["Profit a month", money(c.profit, cur), "at full volume", c.profit >= 0 ? "var(--ok)" : "var(--bad)"], ["Break-even", be, "of your planned sales just to cover fixed costs", ""], ["Cash-positive", c.positiveMonth ? "month " + c.positiveMonth : "not in year 1", "when the balance stops dipping", ""], ["Lowest point", money(c.low.v, cur), c.low.m ? "in month " + c.low.m : "at the start", c.low.v >= 0 ? "var(--ok)" : "var(--bad)"]].map(([l, v, why, col]) => <div key={l} className="stat"><div className="l">{l}</div><div className="v" style={col ? { color: col } : undefined}>{v}</div><div className="why">{why}</div></div>)}
        </div>
        <CashChart c={c} cur={cur} />
        <div className="teach">{c.factor === Infinity ? "Right now nothing you sell makes more than it costs, so no amount of sales covers the fixed costs. Raise a price or lower a cost-each." : c.factor > 1 ? <>At these numbers you&apos;d need <strong>{Math.round(c.factor * 100)}%</strong> of your planned sales just to cover fixed costs — more than you planned. Either the volume is too low, the prices too low, or the fixed costs too high. Try each and watch the profit tile.</> : <>You need about <strong>{Math.round(c.factor * 100)}%</strong> of your planned sales to cover fixed costs; everything above that is profit. {need ? <>The cash line dips to <strong>{money(c.low.v, cur)}</strong> before it recovers, which means you&apos;d really need about <strong>{need}</strong> more than you have, or a slower spend on start-up costs.</> : <>Your starting cash covers the dip, so the plan holds if the ramp is realistic.</>}</>}</div>
        <div className="row between wrapping" style={{ marginTop: 12 }}><span className="tiny">Claude&apos;s own summary: {str(obj(b.money).breakEven)}</span>{!readOnly && <button className="btn ghost small" onClick={() => { const fresh = workFromMoney(b.money); setW(fresh); }}>Reset to Claude&apos;s estimates</button>}</div>
      </div>
      {lean.title && <><h3 className="serif">If the budget doesn&apos;t stretch</h3><div className="sec"><div className="row between wrapping"><div style={{ fontWeight: 600, fontSize: 17 }}>{str(lean.title)}</div><span className="tag">{money(num(lean.startupLow), cur)}–{money(num(lean.startupHigh), cur)} to start</span></div><p className="muted" style={{ fontSize: 14, margin: "6px 0 0" }}>{str(lean.whatChanges)}</p>{!readOnly && onChat && <button className="btn ghost small" style={{ marginTop: 10 }} onClick={() => onChat(`Let's go with the smaller version: ${str(lean.title)}. `)}>Rebuild the scrapbook around this smaller version</button>}</div></>}
      <h3 className="serif">Where the money could come from</h3>
      {arr<Funding>(b.funding).length ? <><div className="sec">{arr<Funding>(b.funding).map((f, i) => { const u = safeUrl(f.url); const v = obj(f.verified); return <div key={i} className="item"><span className="tag" style={{ marginTop: 2 }}>{str(f.type) || "option"}</span><div><div className="t">{str(f.name)}</div><div className="d">{str(f.fits)}</div><div className="m">{f.amount && <span className="tag">{str(f.amount)}</span>}{v.status === "confirmed" || v.status === "updated" ? <span className="tag ok">checked</span> : u && isGov(u) ? <span className="tag ok">official</span> : null}{f.verify && v.status !== "confirmed" && <span className="tag warn">verify</span>}<span className="tiny">{str(f.body)}</span></div>{v.note && <div className="d" style={{ marginTop: 6 }}>{str(v.note)}</div>}{u && <><a className="btn ghost small" style={{ marginTop: 8 }} href={u} target="_blank" rel="noopener noreferrer">Open {new URL(u).hostname.replace(/^www\./, "")} <Art html={ico("ext", 14)} /></a><div className="u">{u}</div></>}</div></div>; })}</div><p className="tiny" style={{ marginTop: 8 }}>Terms change often. Confirm amounts and eligibility on the source&apos;s own site before you plan around them.</p></> : <div className="sec"><p className="muted" style={{ margin: 0 }}>No funding options came back this time. Ask in the chat: &quot;what funding could I get?&quot;</p></div>}
    </>
  );
}
