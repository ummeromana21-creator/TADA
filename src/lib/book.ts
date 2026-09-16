/** Pure helpers over a project's book, shared by the app and the public share page. */
import type { Project, Step } from "./types";
import { arr, hexOr, obj, str } from "./util";

export const pal = (p: Project): string[] => {
  const c = arr(obj(p.book?.brand).palette).map((x) => hexOr(obj(x).hex, "")).filter(Boolean);
  return c.length >= 5 ? c : ["#2A2724", "#F2CD8A", "#BFDCC6", "#F6C6D0", "#F7F3EC"];
};
export function progressOf(p: Project) {
  const steps = arr<Step>(obj(p.book?.path).steps);
  const done = steps.filter((s) => p.done[str(s.id)]).length;
  return { steps, done, total: steps.length, pct: steps.length ? Math.round((done / steps.length) * 100) : 0 };
}
export function doneForRef(p: Project, ref: string) {
  const steps = arr<Step>(obj(p.book?.path).steps).filter((s) => str(s.ref) === str(ref));
  return steps.length > 0 && steps.every((s) => p.done[str(s.id)]);
}
export const PHASES = ["Decide", "Register", "Set up", "Launch"] as const;
