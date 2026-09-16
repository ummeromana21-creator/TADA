import assert from "node:assert/strict";
import { test } from "node:test";
import { calcMoney, workFromMoney } from "../src/lib/money";
import type { Money } from "../src/lib/types";

const money: Money = {
  currency: "USD", budget: 3000,
  startup: [{ item: "Oven", low: 600, high: 1200, note: "" }, { item: "Tent", low: 350, high: 600, note: "" }],
  pricing: [{ item: "Loaf", price: 10, unitCost: 3, unitsPerMonth: 120, note: "" }, { item: "Cake", price: 120, unitCost: 35, unitsPerMonth: 6, note: "" }],
  monthlyRunning: [{ item: "Market fees", amount: 160 }, { item: "Insurance", amount: 45 }],
  breakEven: "",
};

test("workbook starts from Claude's estimates and the founder's budget", () => {
  const w = workFromMoney(money);
  assert.equal(w.items.length, 2);
  assert.equal(w.cash, 3000);
  assert.equal(w.ramp, 3);
});

test("contribution, fixed costs, profit and break-even", () => {
  const c = calcMoney(workFromMoney(money));
  assert.equal(c.monthly, (10 - 3) * 120 + (120 - 35) * 6); // 840 + 510 = 1350
  assert.equal(c.fixed, 205);
  assert.equal(c.profit, 1145);
  assert.ok(Math.abs(c.factor - 205 / 1350) < 1e-9);
});

test("cash by month dips then recovers; twelve months always", () => {
  const c = calcMoney(workFromMoney(money));
  assert.equal(c.months.length, 12);
  // Month 1: cash 3000 - startupMid 1375 = 1625; + 1350*(1/3) - 205 = 1870
  assert.ok(Math.abs(c.months[0] - 1870) < 1e-9);
  assert.equal(c.positiveMonth, 1);
  assert.ok(c.months[11] > c.months[0]);
});

test("a plan that never covers its costs never turns positive", () => {
  const w = workFromMoney({ ...money, pricing: [{ item: "Loaf", price: 2, unitCost: 3, unitsPerMonth: 100, note: "" }], budget: 100 });
  const c = calcMoney(w);
  assert.equal(c.factor, Infinity);
  assert.equal(c.positiveMonth, null);
  assert.ok(c.low.v < 0);
});

test("empty pricing is reported as not-ok but still totals start-up costs", () => {
  const c = calcMoney(workFromMoney({ ...money, pricing: [] }));
  assert.equal(c.ok, false);
  assert.equal(c.startupLow, 950);
  assert.equal(c.startupHigh, 1800);
});
