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

test("one exact FDI tooth produces the same approved per-tooth estimate", () => {
  const r = E.calculate({ teeth: ["18"], metal: "silver" });
  assert.equal(r.config.upperCount, 1);
  assert.equal(r.config.lowerCount, 0);
  assert.equal(r.total, 160);
});
test("any non-contiguous combination across both jaws is priced by exact selected count", () => {
  const r = E.calculate({ teeth: ["18", "13", "22", "35"], metal: "gold10k" });
  assert.equal(r.config.upperCount, 3);
  assert.equal(r.config.lowerCount, 1);
  assert.equal(r.total, 4 * 240 + 60);
});
test("single exact dental-gold tooth and one lower exact tooth both remain selectable", () => {
  const r = E.calculate({ teeth: ["43"], metal: "dentalGold14k" });
  assert.equal(r.config.upperCount, 0);
  assert.equal(r.config.lowerCount, 1);
  assert.equal(r.total, 320 + 60);
});

test("stone shape, stone target teeth, and cell layout survive quote URL round trip", () => {
  const cfg = E.calculate({
    teeth: ["11", "21", "22"],
    metal: "gold14k",
    stones: "natural",
    stoneCount: 3,
    stoneShape: "square",
    stoneTeeth: ["11", "22"],
    stoneLayout: "11:12.13;22:7"
  }).config;
  const params = E.toParams(cfg);
  assert.equal(params.stoneShape, "square");
  assert.equal(params.stoneTeeth, "11,22");
  assert.equal(params.stoneLayout, "11:12.13;22:7");
  const restored = E.normalize(Object.fromEntries(new URLSearchParams(params)));
  assert.equal(restored.stoneShape, "square");
  assert.deepEqual(restored.stoneTeeth, ["11", "22"]);
  assert.equal(restored.stoneLayout, "11:12.13;22:7");
});
test("legacy grill quote links default stone targets to selected grill teeth", () => {
  const restored = E.normalize({ teeth: "11,21", stones: "natural", stoneCount: "2" });
  assert.deepEqual(restored.stoneTeeth, ["11", "21"]);
  assert.equal(restored.stoneShape, "round");
});

test("mixed tooth-specific stone materials and colors are priced by their assigned counts", () => {
  const r = E.calculate({
    teeth: ["11", "21", "22"],
    metal: "gold14k",
    stones: "none",
    size: "2.0",
    stoneCount: 6,
    stoneTeeth: ["11", "21", "22"],
    stoneLayout: "11:0.1;21:2.3;22:4.5",
    stoneProfiles: {
      "11": { type:"natural", clarity:"vvs", color:"#f4f8ff", shape:"round", manual:true },
      "21": { type:"cubicZirconia", clarity:"commercial", color:"#6bbcf2", shape:"square", manual:true },
      "22": { type:"vvsMoissanite", clarity:"commercial", color:"#f3a8c8", shape:"round", manual:true }
    }
  });
  assert.equal(r.status, "estimate");
  assert.equal(r.total, 3 * 300 + 60 + 2 * 28 + 2 * 6 + 2 * 3.7);
  assert.ok(r.lines.some(line => /white VVS natural diamond: 2/.test(line.label)));
  assert.ok(r.lines.some(line => /ice blue Cubic Zirconia: 2/.test(line.label)));
  assert.ok(r.lines.some(line => /pink VVS Moissanite: 2/.test(line.label)));
});

test("per-tooth stone styling survives the quote URL round trip", () => {
  const cfg = E.calculate({
    teeth:["11","21"], stones:"natural", size:"1.5", stoneCount:4,
    stoneTeeth:["11","21"], stoneLayout:"11:12.13;21:7.8",
    stoneProfiles:{
      "11":{type:"natural",clarity:"vvs",color:"#f4f8ff",shape:"round",manual:false},
      "21":{type:"cubicZirconia",clarity:"commercial",color:"#f3a8c8",shape:"square",manual:true}
    }
  }).config;
  const params = E.toParams(cfg);
  const restored = E.normalize(Object.fromEntries(new URLSearchParams(params)));
  assert.deepEqual(restored.stoneProfiles, cfg.stoneProfiles);
  assert.equal(restored.stoneLayout, "11:12.13;21:7.8");
});

test("the first explicitly chosen material can price unedited target teeth through the inherited default", () => {
  const r = E.calculate({
    teeth:["11","21"], stones:"natural", size:"1.3", stoneCount:4,
    stoneTeeth:["11","21"], stoneLayout:"11:0.1;21:2.3",
    stoneProfiles:{
      "11":{type:"natural",clarity:"commercial",color:"#f4f8ff",shape:"round",manual:true},
      "21":{type:"natural",clarity:"commercial",color:"#f4f8ff",shape:"round",manual:false}
    }
  });
  assert.equal(r.status,"estimate");
  assert.equal(r.total,2*100+60+4*6);
});

test("enamel profiles are quoted and survive the configuration handoff", () => {
  const r = E.calculate({
    teeth:["11","21","22"], metal:"gold14k",
    enamelProfiles:{
      "11":{color:"#f3a8c8",finish:"enamel",enabled:true},
      "22":{color:"#6bbcf2",finish:"enamel",enabled:true}
    }
  });
  assert.equal(r.status,"quote");
  assert.equal(r.total,null);
  assert.ok(r.quoteReasons.some(reason => /enamel color work/.test(reason)));
  const params = E.toParams(r.config);
  const restored = E.normalize(Object.fromEntries(new URLSearchParams(params)));
  assert.deepEqual(restored.enamelProfiles,r.config.enamelProfiles);
  assert.ok(E.summaryText(r).includes("Tooth 11: enamel #f3a8c8"));
});

test("custom artwork requests are explicitly quote-only and preserved in the URL", () => {
  const r = E.calculate({teeth:["11","21"],metal:"gold14k",customArtwork:"true"});
  assert.equal(r.status,"quote");
  assert.equal(r.total,null);
  assert.ok(r.quoteReasons.some(reason => /custom artwork requires a reference image/.test(reason)));
  const params = E.toParams(r.config);
  assert.equal(params.customArtwork,"true");
  const restored = E.normalize(Object.fromEntries(new URLSearchParams(params)));
  assert.equal(restored.customArtwork,true);
});


test("Grill Maker order handoff uses confirmed Formspree delivery and a traceable order record", () => {
  const fs = require("node:fs");
  const html = fs.readFileSync(require("node:path").join(__dirname, "..", "mold-form.html"), "utf8");
  assert.match(html, /formspree\.io\/f\/myzpanyg/);
  assert.match(html, /orderReference/);
  assert.match(html, /orderDetails/);
  assert.match(html, /wettentertainmentllc@gmail\.com/);
  assert.match(html, /!formResponse\.ok \|\| responseBody\.errors/);
  assert.match(html, /Your request was not confirmed as delivered/);
  assert.doesNotMatch(html, /mode:\s*['"]no-cors['"]/);
});
