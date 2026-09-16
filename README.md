# Tada — an AI-powered business scrapbook

Describe a business idea; Tada interviews you, then builds a scrapbook (pitch, brand, money workbook, legal & licences with official links, tools & vendors, funding options) and a whimsical vision board with a step-by-step path to launch. You can change your mind in a chat and the affected tiles rebuild.

**Non-technical? Read `SETUP.md` — it walks through every account and click.** This file is the developer view.

## Stack

- **Next.js 16** (App Router, TypeScript) — pages, API routes, server-side auth.
- **Supabase** — sign-in by email link, Postgres (one `projects` row per scrapbook, RLS so people only see their own), Storage for generated pictures.
- **Claude API** — `claude-sonnet-5` writes, researches and (with the built-in **web search tool**) verifies licences; `claude-haiku-4-5` runs the interview and chat. Models are env-configurable.
- **OpenAI Images** (optional) — `gpt-image-1-mini` by default, for the vision-board pictures.
- **Vercel** — hosting. Route handlers set `maxDuration` up to 300 s for the long AI calls.

## Layout

```
supabase/schema.sql        tables, RLS policies, storage bucket — paste into the Supabase SQL editor
proxy.ts                   refreshes the auth session on every request; guards /app
src/app/                   pages: / (landing+sign-in), /login, /auth/confirm, /app (list), /app/new, /app/p/[id], /s/[token] (public share)
src/app/api/               interview · build (parts A/B/C/D) · chat · verify (web search) · images · share
src/lib/prompts.ts         every instruction given to Claude — tune here
src/lib/build.ts           how each part's answer merges into the book
src/lib/anthropic.ts       askJson(): model tiers + web search tool + tolerant JSON parsing
src/lib/money.ts           the workbook maths (unit-tested)
src/lib/art.ts             vector motifs, doodles, logo marks, storybook scenes
src/components/            Project (state machine), Interview, Building, Scrapbook, Sheet, MoneyWorkbook, VisionBoard, Chat, ReadOnly
tests/                     node --test: money maths, JSON parsing, SSR render smoke tests over realistic data
```

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the keys
npm run dev                  # http://localhost:3000
npm test                     # unit + render tests
npm run typecheck && npm run lint
```

## How a scrapbook is built

1. `/api/interview` (Haiku) asks up to two rounds of questions with tap-able options.
2. The client runs `/api/build` for parts **A** (pitch + money + "start smaller"), **D** (brand + vision) and **B** (legal + tools + funding) in parallel, then **C** (the path). Each part returns `assumptions` that show on the scrapbook.
3. "Talk to Tada" (`/api/chat`, Haiku) answers, records new facts, and names the parts to rebuild; the client re-runs those parts with the facts appended to the context. Ticks on the path survive a rebuild when a step's title is unchanged.
4. "Check every item live" (`/api/verify`, Sonnet + web search, localized to the founder's country/region) confirms or corrects each licence and funding item and stamps `verifiedAt`.
5. "Paint my vision board" (`/api/images`) generates a hero scene, three mood scenes and stores them in the `tada-images` bucket.

## Safety rails

- `DAILY_BUILD_LIMIT`, `DAILY_VERIFY_LIMIT`, `IMAGES_PER_PROJECT` cap spend per user/day (`usage_counts` table).
- Every Claude answer is read defensively (`arr/obj/str/num` in `util.ts`); unknown shapes never crash a page.
- Legal items only get an "official" badge when the link is on a government domain (`isGov`), and "checked" only after live verification.
- Public share pages are read-only and served through a secret-key client by token; nothing else is public.

## Not in this version (planned)

"Keep it alive" after launch (renewals, filings, reminders), payments/Pro tier, co-founder editing, and a human hand-off ("book an accountant").
