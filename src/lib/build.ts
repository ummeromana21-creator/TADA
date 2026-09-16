/** The four build parts (A writer/money, D brand/vision, B legal/tools/funding, C path) and how they merge into the book. Server only. */
import { askJson } from "./anthropic";
import { promptA, promptB, promptC, promptD } from "./prompts";
import type { Assumption, Book, Part, Project } from "./types";
import { arr, obj, str, today } from "./util";

function tagAssume(list: unknown, src: Assumption["src"]): Assumption[] {
  return arr(list).map((a) => obj(a)).filter((a) => str(a.text)).map((a) => ({ text: str(a.text), because: str(a.because), tile: str(a.tile), src }));
}
function mergeAssume(book: Book, src: Assumption["src"], list: unknown) {
  book.assumptions = arr<Assumption>(book.assumptions).filter((a) => a.src !== src).concat(tagAssume(list, src));
}

export type BuildOutcome = { book: Book; done?: Record<string, boolean>; doneAt?: Record<string, string>; resetWork?: boolean };

/** Run one part against the current project and return the updated book (plus any side effects). */
export async function runPart(part: Part, p: Project, extra?: string): Promise<BuildOutcome> {
  const book: Book = p.book ? { ...p.book } : { name: "", oneLiner: "" };
  if (part === "A") {
    const { data } = await askJson<Record<string, unknown>>(promptA(p, extra), { tier: "smart", maxTokens: 5000 });
    const r = obj(data);
    if (!str(r.name) && !r.pitch) throw new Error("The pitch came back empty. Try again.");
    Object.assign(book, { name: str(r.name) || book.name || "My business", oneLiner: str(r.oneLiner) || book.oneLiner, pitch: obj(r.pitch), money: obj(r.money), leaner: obj(r.leaner) });
    mergeAssume(book, "A", r.assumptions);
    return { book, resetWork: true };
  }
  if (part === "D") {
    const { data } = await askJson<Record<string, unknown>>(promptD(p, extra), { tier: "smart", maxTokens: 5000 });
    const r = obj(data);
    if (!r.brand) throw new Error("The brand came back empty. Try again.");
    Object.assign(book, { brand: obj(r.brand), vision: obj(r.vision) });
    mergeAssume(book, "D", r.assumptions);
    return { book };
  }
  if (part === "B") {
    const { data } = await askJson<Record<string, unknown>>(promptB(p, extra), { tier: "smart", maxTokens: 8000 });
    const r = obj(data);
    if (!r.legal) throw new Error("The legal research came back empty. Try again.");
    Object.assign(book, { legal: obj(r.legal), tools: obj(r.tools), funding: arr(r.funding), verifiedAt: null });
    mergeAssume(book, "B", r.assumptions);
    return { book };
  }
  // C: the path. Keep ticks for steps whose title survived.
  const { data } = await askJson<Record<string, unknown>>(promptC(p, book, extra), { tier: "smart", maxTokens: 5000 });
  const r = obj(data);
  const steps = arr(r.steps);
  if (!steps.length) throw new Error("The path came back empty. Try again.");
  const old = arr(obj(book.path).steps);
  const done: Record<string, boolean> = {}, doneAt: Record<string, string> = {};
  for (const s of steps) {
    const m = old.find((o) => str(o.title).toLowerCase() === str(s.title).toLowerCase());
    if (m && p.done[str(m.id)]) { done[str(s.id)] = true; doneAt[str(s.id)] = p.doneAt[str(m.id)] || today(); }
  }
  book.path = { target: str(r.target), steps };
  return { book, done, doneAt };
}
