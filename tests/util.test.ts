import assert from "node:assert/strict";
import { test } from "node:test";
import { isGov, parseJson, safeUrl } from "../src/lib/util";

test("parseJson accepts plain, fenced and wrapped JSON", () => {
  assert.deepEqual(parseJson('{"a":1}'), { a: 1 });
  assert.deepEqual(parseJson('Here you go:\n```json\n{"a":2}\n```'), { a: 2 });
  assert.deepEqual(parseJson('Sure. {"a":3} Hope that helps.'), { a: 3 });
  assert.throws(() => parseJson("no json here"));
});

test("safeUrl only accepts http(s) links", () => {
  assert.equal(safeUrl("https://www.irs.gov/ein"), "https://www.irs.gov/ein");
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("irs.gov"), "");
});

test("isGov recognises official domains across countries", () => {
  for (const u of ["https://www.irs.gov/x", "https://www.gov.uk/licence-finder", "https://www.canada.ca/en", "https://business.gov.au/", "https://www.mca.gov.in/", "https://comptroller.texas.gov/", "https://www.sos.state.tx.us/"]) assert.ok(isGov(u), u);
  for (const u of ["https://squareup.com", "https://legalzoom.com", "https://example.com"]) assert.ok(!isGov(u), u);
});
