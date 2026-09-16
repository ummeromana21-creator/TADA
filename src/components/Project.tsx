"use client";
/** The scrapbook screen: interview → building → scrapbook / vision board, plus the chat drawer, sharing and export. */
import { api, saveFields } from "@/lib/client";
import { placeOf } from "@/lib/data";
import { toMarkdown } from "@/lib/export";
import { PART_CALL, PART_LABEL, type Book, type ChatTurn, type Part, type Project as ProjectT } from "@/lib/types";
import { slug, str } from "@/lib/util";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Building, type Station } from "./Building";
import { Chat } from "./Chat";
import { Interview } from "./Interview";
import { Scrapbook } from "./Scrapbook";
import { Sheet } from "./Sheet";
import { SignOut } from "./SignOut";
import { VisionBoard } from "./VisionBoard";

type View = "interview" | "building" | "scrapbook" | "board";

export function Project({ initial, email, imagesEnabled }: { initial: ProjectT; email: string; imagesEnabled: boolean }) {
  const [p, setP] = useState<ProjectT>(initial);
  const [view, setView] = useState<View>(initial.book ? "scrapbook" : "interview");
  const [stations, setStations] = useState<Station[]>([]);
  const [buildErr, setBuildErr] = useState("");
  const [sheet, setSheet] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState("");
  const [busy, setBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [shareOn, setShareOn] = useState(!!(initial.sharePublic && initial.shareToken));
  const [shareToken, setShareToken] = useState(initial.shareToken);
  const [origin, setOrigin] = useState("");
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((m: string) => { setToastMsg(m); if (toastT.current) clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(""), 2800); }, []);
  const update = useCallback((patch: Partial<ProjectT>) => setP((prev) => ({ ...prev, ...patch })), []);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view]);
  useEffect(() => { const t = setTimeout(() => setOrigin(window.location.origin), 0); return () => clearTimeout(t); }, []);
  const shareUrl = shareOn && shareToken ? `${origin}/s/${shareToken}` : null;

  /** Run one build part on the server and merge the result. */
  const runPart = useCallback(async (part: Part, extra?: string) => {
    const r = await api<{ book: Book; done?: Record<string, boolean>; doneAt?: Record<string, string>; resetWork?: boolean }>("/api/build", { projectId: p.id, part, extra });
    setP((prev) => ({ ...prev, book: r.book, ...(r.done ? { done: r.done, doneAt: r.doneAt || {} } : {}), ...(r.resetWork ? { work: null } : {}), builtAt: prev.builtAt || (part === "C" ? new Date().toISOString() : prev.builtAt) }));
    return r.book;
  }, [p.id]);

  /** First build: A, D and B together, then C. */
  const build = useCallback(async () => {
    setView("building"); setBusy(true); setBuildErr("");
    const st: Station[] = [
      { id: "A", label: "Writing the pitch and the money picture", state: "run" },
      { id: "D", label: "Dreaming up the brand and your vision board", state: "run" },
      { id: "B", label: `Researching licences, tools and funding for ${placeOf(p)}`, state: "run" },
      { id: "C", label: "Planning your path to Ta-da", state: "wait" },
    ];
    setStations(st);
    const set = (id: Part, state: Station["state"]) => setStations((prev) => prev.map((s) => (s.id === id ? { ...s, state } : s)));
    let failed: string | null = null;
    await Promise.all((["A", "D", "B"] as Part[]).map(async (id) => { try { await runPart(id); set(id, "done"); } catch (e) { set(id, "err"); failed = failed || (e instanceof Error ? e.message : "failed"); } }));
    if (!failed) { set("C", "run"); try { await runPart("C"); set("C", "done"); } catch (e) { set("C", "err"); failed = e instanceof Error ? e.message : "failed"; } }
    setBusy(false);
    if (failed) { setBuildErr(failed); return; }
    setView("scrapbook"); toast("Your scrapbook is ready");
  }, [p, runPart, toast]);

  /** Rebuild some parts (from a redo box or the chat). Returns true on success. */
  const regenerate = useCallback(async (parts: string[], extra?: string, onStatus?: (m: string) => void) => {
    const keys = [...new Set(parts.filter((x) => PART_CALL[x]))];
    if (!keys.length || busy) return false;
    setBusy(true);
    const calls = new Set(keys.map((x) => PART_CALL[x]));
    if (calls.has("A") || calls.has("B")) calls.add("C");
    try {
      onStatus?.("Updating " + keys.map((x) => PART_LABEL[x]).join(", ") + "…");
      await Promise.all((["A", "D", "B"] as Part[]).filter((x) => calls.has(x)).map((x) => runPart(x, extra)));
      if (calls.has("C")) { onStatus?.("Re-planning the path…"); await runPart("C", extra); }
      const redos = (p.redos || 0) + 1; update({ redos }); await saveFields(p.id, { redos });
      return true;
    } catch (e) { onStatus?.(e instanceof Error ? e.message : "Stopped."); return false; }
    finally { setBusy(false); }
  }, [busy, p.id, p.redos, runPart, update]);

  async function tick(id: string) {
    const was = !!p.done[id];
    const done = { ...p.done }, doneAt = { ...p.doneAt };
    if (was) { delete done[id]; delete doneAt[id]; } else { done[id] = true; doneAt[id] = new Date().toISOString().slice(0, 10); }
    update({ done, doneAt });
    await saveFields(p.id, { done, doneAt });
    if (!was && Object.keys(done).length === 1) toast("First step done. That's the hardest one.");
  }

  async function exportMd(mode?: "founding") {
    if (!p.book) return;
    const md = toMarkdown(p, mode);
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tada-${slug(p.book.name)}${mode === "founding" ? "-founding-page" : ""}.md`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function toggleShare() {
    try { const { url } = await api<{ url: string | null }>("/api/share", { projectId: p.id, on: !shareOn }); if (url) { setShareToken(url.split("/s/")[1] || shareToken); setShareOn(true); await navigator.clipboard?.writeText(url).catch(() => {}); toast("Share link copied"); } else { setShareOn(false); toast("Sharing turned off"); } }
    catch (e) { toast(e instanceof Error ? e.message : "Couldn't share"); }
  }
  async function verify() {
    setBusy(true);
    try { const r = await api<{ book: Book; searches: number }>("/api/verify", { projectId: p.id }); update({ book: r.book }); toast(`Checked against the web (${r.searches} searches)`); }
    catch (e) { toast(e instanceof Error ? e.message : "Couldn't verify"); }
    finally { setBusy(false); }
  }
  async function paint() {
    setBusy(true);
    try { const r = await api<{ images: ProjectT["images"]; failed: number }>("/api/images", { projectId: p.id }); update({ images: r.images }); toast(r.failed ? "Some pictures didn't come back — try again later" : "Your vision board is painted"); }
    catch (e) { toast(e instanceof Error ? e.message : "Couldn't paint"); }
    finally { setBusy(false); }
  }
  const openChat = (prefill = "") => { setChatPrefill(prefill); setChatOpen(true); };
  const built = !!p.book;

  return (
    <>
      <div className="nav"><div className="in">
        <Link className="wordmark" href="/app">Tada</Link>
        {built && <div className="tabs">{(["scrapbook", "board"] as View[]).map((v) => <button key={v} className={"tab" + (view === v ? " on" : "")} onClick={() => setView(v)}>{v === "scrapbook" ? "Scrapbook" : "Vision board"}</button>)}</div>}
        <div className="navr">
          <Link className="btn ghost small" href="/app">My scrapbooks</Link>
          {built && <button className="btn ghost small" onClick={toggleShare}>{shareUrl ? "Sharing on" : "Share"}</button>}
          {built && <button className="btn ghost small" onClick={() => exportMd()}>Save as file</button>}
          <Link className="btn primary small" href="/app/new">New idea</Link>
          <SignOut email={email} />
        </div>
      </div></div>
      <div className="page">
        {view === "interview" && <Interview p={p} onUpdate={update} onBuild={build} />}
        {view === "building" && <Building stations={stations} error={buildErr} onRetry={build} onBack={() => setView("interview")} />}
        {view === "scrapbook" && p.book && <Scrapbook p={p} onOpen={(t) => (t === "path" ? setView("board") : setSheet(t))} onChat={openChat} />}
        {view === "board" && p.book && <VisionBoard p={p} onTick={tick} onOpenTile={setSheet} onPaint={imagesEnabled ? paint : undefined} onFounding={() => exportMd("founding")} busy={busy} />}
        {built && view !== "building" && <p className="foot">Not legal, tax or financial advice. Every licence links to the official body; confirm there before you file. Costs are estimates.</p>}
      </div>
      {shareUrl && built && <div className="tiny" style={{ textAlign: "center", margin: "-60px 20px 40px" }}>Anyone with this link can view (not edit): <a href={shareUrl}>{shareUrl}</a></div>}
      {built && (view === "scrapbook" || view === "board") && <button className="fab" onClick={() => openChat()}><span style={{ color: "#FFE45C" }}>✦</span><span className="lbl">Talk to Tada</span></button>}
      {sheet && p.book && <Sheet p={p} tile={sheet} busy={busy} onClose={() => setSheet(null)} onRedo={async (t, extra, onStatus) => { const ok = await regenerate([t], extra, onStatus); if (ok) toast("Tile updated"); return ok; }} onVerify={verify} onWork={async (w) => { update({ work: w }); await saveFields(p.id, { work: w }); }} onChat={(pre) => { setSheet(null); openChat(pre); }} />}
      {chatOpen && p.book && <Chat p={p} prefill={chatPrefill} onClose={() => setChatOpen(false)} onUpdate={update} onRegenerate={regenerate} onChatSaved={(chat: ChatTurn[]) => update({ chat })} />}
      <div className={"toast" + (toastMsg ? " on" : "")}>{toastMsg}</div>
      <span hidden>{str(p.updatedAt)}</span>
    </>
  );
}
