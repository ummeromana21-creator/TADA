import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToString } from "react-dom/server";
import { ReadOnly } from "../src/components/ReadOnly";
import { Scrapbook } from "../src/components/Scrapbook";
import { Sheet } from "../src/components/Sheet";
import { VisionBoard } from "../src/components/VisionBoard";
import { toMarkdown } from "../src/lib/export";
import sample from "./sample-project.json";
import type { Project } from "../src/lib/types";

const p = sample as unknown as Project;

test("scrapbook renders every tile and the assumptions panel", () => {
  const html = renderToString(<Scrapbook p={p} onOpen={() => {}} onChat={() => {}} />);
  for (const s of ["The pitch", "Brand mood", "Money", "Legal &amp; licences", "Tools, vendors &amp; funding", "The path", "Things I assumed", "Sugar &amp; Sage"]) assert.ok(html.includes(s), s);
});

test("vision board renders the dream, milestones and all four phases", () => {
  const html = renderToString(<VisionBoard p={p} readOnly />);
  for (const s of ["The dream, in your words", "A day in the life", "Your first post", "Decide", "Register", "Set up", "Launch", "Ta-da"]) assert.ok(html.includes(s), s);
});

test("every tile sheet renders, including the money workbook and verified badges", () => {
  for (const tile of ["pitch", "brand", "money", "legal", "tools"]) {
    const html = renderToString(<Sheet p={p} tile={tile} readOnly onClose={() => {}} />);
    assert.ok(html.length > 500, tile);
  }
  const legal = renderToString(<Sheet p={p} tile="legal" readOnly onClose={() => {}} />);
  assert.ok(legal.includes("checked"));
  const money = renderToString(<Sheet p={p} tile="money" readOnly onClose={() => {}} />);
  assert.ok(money.includes("Cash-positive") && money.includes("Where the money could come from"));
});

test("read-only share view renders with a banner", () => {
  const html = renderToString(<ReadOnly project={p} />);
  assert.ok(html.includes("shared scrapbook"));
});

test("markdown export covers every section", () => {
  const md = toMarkdown(p);
  for (const s of ["# Sugar & Sage", "## The dream", "## The pitch", "## Money workbook", "## Legal & licences", "## Tools & vendors", "## The path to Ta-da", "Funding options"]) assert.ok(md.includes(s), s);
});
