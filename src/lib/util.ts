/** Small defensive helpers. Claude's JSON is never trusted to have the right shape. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arr = <T = any>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);
export const str = (x: unknown): string => (x == null ? "" : typeof x === "string" ? x : typeof x === "object" ? JSON.stringify(x) : String(x));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const obj = (x: unknown): Record<string, any> => (x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, any>) : {});
export const num = (x: unknown, d = 0): number => {
  const v = typeof x === "number" ? x : parseFloat(String(x ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(v) ? v : d;
};
export const isHex = (h: unknown) => /^#[0-9a-fA-F]{6}$/.test(String(h || ""));
export const hexOr = (h: unknown, d: string) => (isHex(h) ? String(h) : d);
export const today = () => new Date().toISOString().slice(0, 10);
export const niceDate = (d: string | null | undefined) => {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch { return d; }
};
export const money = (n: unknown, cur: string) => {
  if (n == null || n === "") return "";
  const v = Number(n);
  if (!Number.isFinite(v)) return str(n);
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: cur || "USD", maximumFractionDigits: 0 }).format(v); } catch { return `${cur || ""} ${Math.round(v)}`; }
};
export const safeUrl = (u: unknown) => {
  const s = str(u).trim();
  if (!/^https?:\/\//i.test(s)) return "";
  try { new URL(s); return s; } catch { return ""; }
};
export const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
export const isGov = (u: string) => {
  const h = host(u);
  if (!h) return false;
  return /(^|\.)(gov|gov\.[a-z]{2,3}|gc\.ca|canada\.ca|ontario\.ca|quebec\.ca|alberta\.ca|gov\.bc\.ca|govt\.nz|europa\.eu|admin\.ch|bund\.de|gouv\.fr|service-public\.fr|gob\.[a-z]{2}|go\.jp|go\.kr|gv\.at|nic\.in|mil|[a-z]{2}\.us|overheid\.nl|belgium\.be|revenue\.ie|cro\.ie|gov\.ie)$/i.test(h);
};
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scrapbook";

/** Tolerant JSON extraction: whole text, else a fenced block, else first {…} / […]. */
export function parseJson<T = unknown>(text: string): T {
  const t = text.trim();
  try { return JSON.parse(t) as T; } catch { /* fall through */ }
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]) as T; } catch { /* fall through */ } }
  const a = t.search(/[{[]/);
  const b = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1)) as T;
  throw new Error("No JSON found in the answer");
}
