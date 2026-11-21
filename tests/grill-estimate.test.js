// Run with: node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const catalog = require("../assets/pricing-catalog.js");
const E = require("../assets/grill-estimate.js");

const total = (cfg) => E.calculate(cfg).total;

test("published tiers equal per-tooth x count", () => {
  for (const m of Object.values(catalog.grillz)) for (const n of [1, 6, 12]) assert.equal(m.teeth[n], m.perTooth * n);
});
test("1 silver tooth = 100 + 60 shipping", () => assert.equal(total({ upperCount: 1 }), 160));
test("2 silver teeth = 200 + 60", () => assert.equal(total({ upperCount: 2 }), 260));
test("4 upper 10K + 8 lower 10K = 12 x 240 + 60", () => assert.equal(total({ metal: "gold10k", upperCount: 4, lowerCount: 8 }), 2940));
test("6 teeth 14K = 1800 + 60", () => assert.equal(total({ metal: "gold14k", upperCount: 6 }), 1860));
test("12 teeth 14K dental = 3840 + 60", () => assert.equal(total({ metal: "dentalGold14k", upperCount: 6, lowerCount: 6 }), 3900));
test("exact teeth decide jaw counts", () => {
  const r = E.calculate({ teeth: "13,12,11,21,43,42", upperCount: 9 });
  assert.equal(r.config.upperCount, 4); assert.equal(r.config.lowerCount, 2); assert.equal(r.total, 660);
});
test("invalid/duplicate tooth numbers are dropped", () => assert.deepEqual(E.calculate({ teeth: "11,11,99,x" }).config.teeth, ["11"]));
test("silver fangs + long extension", () => assert.equal(total({ design: "fangs", extension: "long" }), 180 + 35 + 60));
test("14K dental gap filler", () => assert.equal(total({ design: "gapFiller", metal: "dentalGold14k" }), 540));
test("10K fangs is quote", () => { const r = E.calculate({ design: "fangs", metal: "gold10k" }); assert.equal(r.status, "quote"); assert.equal(r.total, null); });
test("stones priced, labor included, no quote", () => {
  const r = E.calculate({ upperCount: 6, stones: "natural", clarity: "vvs", size: "2.0", stoneCount: 20 });
  assert.equal(r.status, "estimate"); assert.equal(r.total, 600 + 560 + 60);
  assert.ok(r.notes.some((n) => /labor is included/.test(n)));
});
test("decimal stone prices round to cents", () => assert.equal(total({ upperCount: 1, stones: "labGrownDiamond", size: "1.3", stoneCount: 3 }), 100 + 9.9 + 60));
test("cut charged once per set: upper only", () => assert.equal(total({ upperCount: 6, cuts: "diamondDust" }), 600 + 30 + 60));
test("cut charged per set: upper + lower = 2 sets", () => assert.equal(total({ upperCount: 6, lowerCount: 6, cuts: "openFace,centerSplit" }), 1200 + 80 + 40 + 60));
test("cut on fangs = 1 set", () => assert.equal(total({ design: "fangs", cuts: "deepBar" }), 180 + 30 + 60));
test("rush replaces standard shipping", () => {
  const r = E.calculate({ upperCount: 1, shipping: "rush" });
  assert.equal(r.total, 250); assert.ok(!r.lines.some((l) => /Standard/.test(l.label)));
});
test("quote metal: known subtotal only, total null", () => {
  const r = E.calculate({ metal: "quote", upperCount: 6 });
  assert.equal(r.status, "quote"); assert.equal(r.total, null); assert.equal(r.knownSubtotal, 60);
});
test("custom finish forces quote but keeps known lines", () => {
  const r = E.calculate({ upperCount: 2, finish: "custom" }); assert.equal(r.status, "quote"); assert.equal(r.knownSubtotal, 260);
});
test("validation errors", () => {
  assert.equal(E.calculate({ upperCount: 17 }).ok, false);
  assert.equal(E.calculate({ upperCount: 0 }).ok, false);
  assert.equal(E.calculate({ upperCount: 1, stones: "natural", stoneCount: 0 }).ok, false);
  assert.equal(E.calculate({ upperCount: 1.5 }).ok, false);
});
test("round trip through URL params gives the same estimate", () => {
  const cfg = { metal: "gold14k", teeth: "13,12,11,21,22,23", stones: "vvsMoissanite", size: "1.5", stoneCount: 12, cuts: "diamondDust", shipping: "rush", finish: "standard" };
  const a = E.calculate(cfg); const b = E.calculate(Object.fromEntries(new URLSearchParams(E.toParams(a.config))));
  assert.equal(a.total, b.total); assert.equal(E.summaryText(a), E.summaryText(b));
  assert.equal(E.toParams(a.config).pv, catalog.version);
});
