"use client";
import { api, saveFields } from "@/lib/client";
import { PART_LABEL, type ChatTurn, type Project } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

type Props = {
  p: Project; prefill?: string; onClose: () => void;
  onUpdate: (patch: Partial<Project>) => void;
  onChatSaved: (chat: ChatTurn[]) => void;
  onRegenerate: (parts: string[], extra?: string, onStatus?: (m: string) => void) => Promise<boolean>;
};

export function Chat({ p, prefill = "", onClose, onUpdate, onChatSaved, onRegenerate }: Props) {
  const [text, setText] = useState(prefill);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const turns = p.chat || [];
  useEffect(() => { input.current?.focus(); const el = input.current; if (el) el.setSelectionRange(el.value.length, el.value.length); }, []);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [turns.length, status]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [onClose]);

  async function send(msg?: string) {
    const m = (msg ?? text).trim(); if (!m || busy) return;
    setText(""); setBusy(true); setStatus("Thinking…");
    const optimistic: ChatTurn[] = [...turns, { role: "user", content: m }];
    onChatSaved(optimistic);
    try {
      const r = await api<{ reply: string; facts: string[]; ideaUpdate: string | null; regenerate: string[] }>("/api/chat", { projectId: p.id, text: m });
      const withReply: ChatTurn[] = [...optimistic, { role: "assistant", content: r.reply }];
      onChatSaved(withReply);
      const patch: Partial<Project> = {};
      if (r.facts.length) patch.facts = [...p.facts, ...r.facts].slice(-30);
      if (r.ideaUpdate) patch.idea = r.ideaUpdate;
      if (Object.keys(patch).length) onUpdate(patch);
      setStatus("");
      if (r.regenerate.length) {
        const ok = await onRegenerate(r.regenerate, r.facts.join(" "), setStatus);
        const note: ChatTurn = { role: "sys", content: ok ? "Updated " + r.regenerate.map((x) => PART_LABEL[x]).join(", ") + (r.regenerate.some((x) => ["pitch", "money", "legal", "tools", "funding"].includes(x)) && !r.regenerate.includes("path") ? " and the path" : "") + "." : "Couldn't update the scrapbook just now — try again in a moment." };
        const withNote = [...withReply, note].slice(-24);
        onChatSaved(withNote); await saveFields(p.id, { chat: withNote });
        setStatus("");
      }
    } catch (e) {
      const note: ChatTurn = { role: "sys", content: e instanceof Error ? e.message : "Something went wrong." };
      onChatSaved([...optimistic, note]); setStatus("");
    } finally { setBusy(false); }
  }
  const sugg = turns.length ? [] : ["What should I do first?", "What if I start with a smaller budget?", "Explain the licence list to me", "Actually, I also want to sell online"];
  const known: [string, string, string][] = [["The idea", p.idea, "Actually, the idea is now: "], ...p.interview.map((x) => [x.q, x.a, `Change my answer to "${x.q}": `] as [string, string, string]), ...p.facts.map((f) => ["Added later", f, `Actually, about "${f}": `] as [string, string, string])];
  return (
    <aside className="chat on" aria-label="Talk to Tada">
      <div className="head"><div><div className="eyebrow">Talk to Tada</div><div className="tiny" style={{ fontWeight: 500 }}>Ask anything, or change your mind. The scrapbook keeps up.</div></div><button className="btn ghost small" onClick={onClose}>Close</button></div>
      <div className="log" ref={log}>
        {!turns.length && <div className="bub ai">Hi! This is your scrapbook for <strong>{p.book?.name}</strong>. Ask me anything about it, or tell me what&apos;s changed — a new product, a different budget, a second location — and I&apos;ll update the tiles that need it.</div>}
        {turns.map((t, i) => <div key={i} className={"bub " + (t.role === "user" ? "me" : t.role === "sys" ? "sys" : "ai")}>{t.content}</div>)}
        {status && <div className={"bub " + (status === "Thinking…" ? "ai" : "sys")}>{status}</div>}
      </div>
      <div className="sugg">{sugg.map((s) => <button key={s} className="chip soft" onClick={() => send(s)}>{s}</button>)}</div>
      <details className="know"><summary>What I know about your idea <span className="tiny">tap to change</span></summary><div className="kl">{known.map((k, i) => <div key={i} className="k"><span><span className="tiny" style={{ display: "block", fontWeight: 600 }}>{k[0]}</span>{k[1]}</span><button onClick={() => { setText(k[2]); input.current?.focus(); }}>change</button></div>)}</div></details>
      <div className="compose"><textarea ref={input} className="field" rows={1} placeholder="e.g. Actually, I also want to sell to cafés…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} /><button className="btn primary" disabled={busy} onClick={() => send()} aria-label="Send">Send</button></div>
    </aside>
  );
}
