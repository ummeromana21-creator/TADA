/** Shared shapes for a Tada scrapbook. Everything Claude returns is treated as untrusted and read defensively (see util.ts). */

export type QA = { q: string; a: string };
export type ChatTurn = { role: "user" | "assistant" | "sys"; content: string };

export type Assumption = { text: string; because: string; tile: string; src: "A" | "B" | "D" };

export type Pitch = {
  problem: string; solution: string; who: string; whyNow: string;
  howItMakesMoney: string; first90Days: string; risks: string;
};
export type MoneyItem = { item: string; price: number; unitCost: number; unitsPerMonth: number; note: string };
export type Money = {
  currency: string; budget: number | null;
  startup: { item: string; low: number; high: number; note: string }[];
  pricing: MoneyItem[];
  monthlyRunning: { item: string; amount: number }[];
  breakEven: string;
};
export type Leaner = { title: string; whatChanges: string; startupLow: number; startupHigh: number };
export type Brand = {
  names: { name: string; why: string }[]; tagline: string; voice: string;
  palette: { hex: string; name: string }[];
  logo: { style: string; monogram: string; motif: string; bg: string; fg: string };
  mood: { caption: string; motif: string; from: string; to: string }[];
};
export type Vision = {
  manifesto: string; why: string; dayInTheLife: string; firstPost: string;
  milestones: { title: string; when: string }[];
};
export type Verified = { status: "confirmed" | "updated" | "unsure"; url: string; note: string; checkedAt: string };
export type LegalItem = {
  id: string; title: string; why: string; body: string; url: string; cost: string; time: string;
  status: "required" | "recommended" | "conditional" | string; verify: boolean; verified?: Verified;
};
export type Legal = {
  summary: string;
  structures: { name: string; summary: string; pros: string[]; cons: string[]; cost: string; time: string; recommended: boolean }[];
  items: LegalItem[];
};
export type ToolOption = { name: string; priceTier: string; convenience: number; note: string; recommended: boolean; url: string };
export type Tools = { needs: { id: string; need: string; why: string; options: ToolOption[] }[] };
export type Funding = { name: string; type: string; body: string; fits: string; amount: string; url: string; verify: boolean; verified?: Verified };
export type Step = { id: string; phase: string; title: string; detail: string; cost: string; time: string; ref: string | null; url: string | null };
export type Path = { target: string; steps: Step[] };

export type Book = {
  name: string; oneLiner: string;
  pitch?: Pitch; money?: Money; leaner?: Leaner;
  brand?: Brand; vision?: Vision;
  legal?: Legal; tools?: Tools; funding?: Funding[];
  path?: Path;
  assumptions?: Assumption[];
  verifiedAt?: string | null;
};

export type Work = {
  v: 1;
  items: { item: string; price: number; unitCost: number; units: number }[];
  running: { item: string; amount: number }[];
  startup: { item: string; low: number; high: number }[];
  cash: number; ramp: number;
};

export type Images = Partial<Record<"hero" | "mood0" | "mood1" | "mood2" | "logo", string>>;

/** A project row as stored in Supabase (camel-cased for the app). */
export type Project = {
  id: string; owner: string;
  idea: string; country: string; countryName: string; currency: string; region: string;
  interview: QA[]; facts: string[]; chat: ChatTurn[];
  book: Book | null;
  done: Record<string, boolean>; doneAt: Record<string, string>;
  work: Work | null; images: Images; redos: number;
  shareToken: string | null; sharePublic: boolean;
  builtAt: string | null; createdAt: string; updatedAt: string;
};

export type Part = "A" | "B" | "C" | "D";
export const PART_CALL: Record<string, Part> = { pitch: "A", money: "A", brand: "D", vision: "D", legal: "B", tools: "B", funding: "B", path: "C" };
export const PART_LABEL: Record<string, string> = { pitch: "the pitch", money: "the money picture", brand: "the brand", vision: "the vision board", legal: "legal & licences", tools: "tools & vendors", funding: "funding options", path: "the path" };
