import type { Money, Work } from "./types";
import { arr, num, obj, str } from "./util";

/** Build the editable workbook from Claude's first estimates. */
export function workFromMoney(m: Money | undefined): Work {
  const mm = obj(m);
  const items = arr(mm.pricing).map((x) => ({ item: str(obj(x).item) || "Item", price: Math.max(0, num(obj(x).price)), unitCost: Math.max(0, num(obj(x).unitCost)), units: Math.max(0, num(obj(x).unitsPerMonth)) }));
  const running = arr(mm.monthlyRunning).map((x) => ({ item: str(obj(x).item) || "Cost", amount: Math.max(0, num(obj(x).amount)) }));
  const startup = arr(mm.startup).map((x) => ({ item: str(obj(x).item) || "Item", low: Math.max(0, num(obj(x).low)), high: Math.max(0, num(obj(x).high)) }));
  const mid = startup.reduce((a, x) => a + (x.low + x.high) / 2, 0);
  const budget = mm.budget != null && num(mm.budget) > 0 ? num(mm.budget) : Math.round(mid * 1.3);
  return { v: 1, items, running, startup, cash: budget, ramp: 3 };
}

export type Calc = {
  ok: boolean; startupLow: number; startupHigh: number; startupMid: number;
  monthly: number; fixed: number; profit: number; factor: number;
  months: number[]; low: { v: number; m: number }; positiveMonth: number | null; ramp: number; cash: number;
};

/** The workbook maths. Pure, so it's unit-tested in tests/money.test.mjs. */
export function calcMoney(w: Work): Calc {
  const items = arr(w.items), running = arr(w.running), startup = arr(w.startup);
  const startupLow = startup.reduce((a, x) => a + x.low, 0), startupHigh = startup.reduce((a, x) => a + x.high, 0), startupMid = (startupLow + startupHigh) / 2;
  const base = { startupLow, startupHigh, startupMid, months: [] as number[], low: { v: 0, m: 0 }, positiveMonth: null as number | null, ramp: 3, cash: num(w.cash) };
  if (!items.length) return { ok: false, monthly: 0, fixed: 0, profit: 0, factor: Infinity, ...base };
  const monthly = items.reduce((a, x) => a + (x.price - x.unitCost) * x.units, 0);
  const fixed = running.reduce((a, x) => a + x.amount, 0);
  const profit = monthly - fixed;
  const factor = monthly > 0 ? fixed / monthly : Infinity;
  const ramp = Math.max(1, Math.min(12, num(w.ramp, 3)));
  let cash = num(w.cash) - startupMid;
  const months: number[] = [];
  let low = { v: cash, m: 0 };
  for (let m = 1; m <= 12; m++) {
    const share = Math.min(1, m / ramp);
    cash += monthly * share - fixed;
    months.push(cash);
    if (cash < low.v) low = { v: cash, m };
  }
  let positiveMonth: number | null = null;
  for (let m = 0; m < 12; m++) {
    if (months[m] >= 0 && months.slice(m).every((v) => v >= 0)) { positiveMonth = m + 1; break; }
  }
  return { ok: true, monthly, fixed, profit, factor, startupLow, startupHigh, startupMid, months, low, positiveMonth, ramp, cash: num(w.cash) };
}
