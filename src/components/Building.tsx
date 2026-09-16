"use client";
export type Station = { id: "A" | "B" | "C" | "D"; label: string; state: "wait" | "run" | "done" | "err" };

export function Building({ stations, error, onRetry, onBack }: { stations: Station[]; error: string; onRetry: () => void; onBack: () => void }) {
  return (
    <div className="build">
      <span className="sticker">Building your scrapbook</span>
      <h1 className="serif" style={{ fontSize: "clamp(32px,5vw,52px)", margin: "16px 0 8px" }}>Pinning things to the board…</h1>
      <p className="muted" style={{ margin: "0 auto", maxWidth: "48ch" }}>Claude is writing the pitch, dreaming up the brand, researching licences and funding for your location, comparing tools, and planning your steps. This usually takes a minute or two.</p>
      <div className="stations">
        {stations.map((s) => <div key={s.id} className={"station " + s.state}><span className="dot"></span><span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{s.label}</span><span className="tiny">{s.state === "wait" ? "waiting" : s.state === "run" ? "thinking…" : s.state === "done" ? "done" : "failed"}</span></div>)}
      </div>
      {error && <div className="msg bad" style={{ textAlign: "left" }}>{error}</div>}
      {error && <div className="row" style={{ justifyContent: "center", marginTop: 20, gap: 10 }}><button className="btn primary" onClick={onRetry}>Try again</button><button className="btn ghost" onClick={onBack}>Back to the questions</button></div>}
      <div className="hand" style={{ fontSize: 24, marginTop: 26 }}>good things take a minute</div>
    </div>
  );
}
