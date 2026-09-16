/** Thin wrapper around the Claude API: pick a model tier, optionally turn on web search, and get JSON back. Server only. */
import Anthropic from "@anthropic-ai/sdk";
import { parseJson } from "./util";

export type Tier = "quick" | "smart";
export type Turn = { role: "user" | "assistant"; content: string };
export type AskOptions = {
  tier?: Tier;
  maxTokens?: number;
  /** Turn on Claude's built-in web search for this call. */
  webSearch?: { maxUses: number; country?: string; region?: string; city?: string };
};

const MODELS: Record<Tier, string> = {
  smart: process.env.CLAUDE_MODEL_SMART || "claude-sonnet-5",
  quick: process.env.CLAUDE_MODEL_QUICK || "claude-haiku-4-5-20251001",
};

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  return (client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 240_000 }));
}

export type AskResult<T> = { data: T; text: string; searches: number };

/** Ask Claude and parse the reply as JSON. Throws with a readable message on failure. */
export async function askJson<T = unknown>(input: string | Turn[], opts: AskOptions = {}): Promise<AskResult<T>> {
  const anthropic = getClient();
  const messages = typeof input === "string" ? [{ role: "user" as const, content: input }] : input;
  const tools: Anthropic.Messages.ToolUnion[] = [];
  if (opts.webSearch) {
    const loc = opts.webSearch.country && opts.webSearch.country !== "XX"
      ? { type: "approximate" as const, country: opts.webSearch.country, ...(opts.webSearch.region ? { region: opts.webSearch.region } : {}), ...(opts.webSearch.city ? { city: opts.webSearch.city } : {}) }
      : undefined;
    tools.push({ type: "web_search_20250305", name: "web_search", max_uses: opts.webSearch.maxUses, ...(loc ? { user_location: loc } : {}) } as Anthropic.Messages.ToolUnion);
  }
  const res = await anthropic.messages.create({
    model: MODELS[opts.tier ?? "smart"],
    max_tokens: opts.maxTokens ?? 6000,
    system: "You reply with a single JSON value and nothing else: no prose before or after, no markdown fences. The reply will be parsed by a program.",
    messages,
    ...(tools.length ? { tools } : {}),
  });
  const text = res.content.filter((b): b is Anthropic.Messages.TextBlock => b.type === "text").map((b) => b.text).join("\n");
  if (res.stop_reason === "max_tokens") throw new Error("The answer was cut short. Try again with a shorter request.");
  if (!text.trim()) throw new Error("Claude sent back nothing.");
  // With tools, narration can precede the final JSON; the parser takes the last JSON object in the text.
  const data = parseLast<T>(text);
  const searches = (res.usage as unknown as { server_tool_use?: { web_search_requests?: number } }).server_tool_use?.web_search_requests ?? 0;
  return { data, text, searches };
}

function parseLast<T>(text: string): T {
  try { return parseJson<T>(text); } catch { /* try the last block */ }
  const i = text.lastIndexOf("\n{");
  if (i >= 0) return parseJson<T>(text.slice(i + 1));
  throw new Error("The answer came back in a shape I couldn't read.");
}
