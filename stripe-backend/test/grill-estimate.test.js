const test = require("node:test");
const assert = require("node:assert/strict");
const estimate = require("../lib/grill-estimate");
const catalog = require("../lib/pricing-catalog");

test("backend pricing catalog carries the approved version", () => {
  assert.equal(catalog.version, "2026-11-24-permanent-single-tooth-premium");
});

test("six silver teeth include standard shipping", () => {
  const result = estimate.calculate({
    design: "grillz", metal: "silver", upperCount: 6, lowerCount: 0,
    shipping: "standard", stones: "none", stoneCount: 0
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "estimate");
  assert.equal(result.total, 660);
});

test("eight 14K teeth calculate individual fabrication and deep/bar by pair", () => {
  const result = estimate.calculate({
    design: "grillz", metal: "gold14k", upperCount: 8, lowerCount: 0,
    cuts: ["individualFabrication", "deepBar"],
    shipping: "standard", stones: "none", stoneCount: 0
  });
  assert.equal(result.status, "estimate");
  assert.equal(result.lines.find(line => line.label.startsWith("Individual-tooth fabrication")).amount, 40);
  assert.equal(result.lines.find(line => line.label.startsWith("Deep / Bar cut")).amount, 60);
  assert.equal(result.total, 2560);
});

test("per-arch cuts are charged once for each selected arch", () => {
  const result = estimate.calculate({
    design: "grillz", metal: "silver", upperCount: 2, lowerCount: 2,
    cuts: ["diamondDust"], shipping: "standard", stones: "none", stoneCount: 0
  });
  assert.equal(result.lines.find(line => line.label.startsWith("Diamond / Dust cut")).amount, 60);
});

test("rush shipping replaces standard shipping instead of stacking", () => {
  const result = estimate.calculate({
    design: "grillz", metal: "silver", upperCount: 1, lowerCount: 0,
    shipping: "rush", stones: "none", stoneCount: 0
  });
  assert.equal(result.total, 250);
  assert.equal(result.lines.some(line => line.label.includes("Standard FedEx")), false);
});

test("quote-only metal never receives a payable total", () => {
  const result = estimate.calculate({
    design: "grillz", metal: "quote", upperCount: 6, lowerCount: 0,
    shipping: "standard", stones: "none", stoneCount: 0
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "quote");
  assert.equal(result.total, null);
  assert.ok(result.quoteReasons.length > 0);
});

test("custom finish, enamel, and custom artwork each require a quote", () => {
  const cases = [
    { finish: "custom" },
    { enamelProfiles: { "11": { color: "#ff0000" } } },
    { customArtwork: true }
  ];
  for (const extra of cases) {
    const result = estimate.calculate({
      design: "grillz", metal: "silver", teeth: ["11"], shipping: "standard",
      stones: "none", stoneCount: 0, ...extra
    });
    assert.equal(result.status, "quote");
    assert.equal(result.total, null);
  }
});

test("invalid tooth counts are rejected", () => {
  const result = estimate.calculate({
    design: "grillz", metal: "silver", upperCount: 17, lowerCount: 0,
    shipping: "standard", stones: "none", stoneCount: 0
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /whole number from 0 to 16/);
});

test("stone selection requires a valid positive quantity", () => {
  const result = estimate.calculate({
    design: "grillz", metal: "silver", upperCount: 1, lowerCount: 0,
    shipping: "standard", stones: "natural", stoneCount: 0
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /whole number of stones from 1 to 100/);
});

const stripeMode = require("../lib/stripe-mode");

test("only live-mode standard and restricted Stripe secret keys are accepted", () => {
  assert.equal(stripeMode.isLiveSecretKey("sk_live_example"), true);
  assert.equal(stripeMode.isLiveSecretKey("rk_live_example"), true);
  assert.equal(stripeMode.isLiveSecretKey("sk_test_example"), false);
  assert.equal(stripeMode.isLiveSecretKey("rk_test_example"), false);
  assert.equal(stripeMode.isLiveSecretKey(""), false);
  assert.equal(stripeMode.isLiveSecretKey(undefined), false);
});

test("only explicitly live webhook events are accepted", () => {
  assert.equal(stripeMode.isLiveEvent({ livemode: true }), true);
  assert.equal(stripeMode.isLiveEvent({ livemode: false }), false);
  assert.equal(stripeMode.isLiveEvent({}), false);
  assert.equal(stripeMode.isLiveEvent(null), false);
});


test("permanent single-tooth design is priced as a separate $40-per-tooth premium", () => {
  const six = estimate.calculate({ metal: "silver", upperCount: 6, cuts: "permanentSingleTooth" });
  assert.equal(six.total, 6 * 100 + 6 * 40 + 60);
  assert.ok(six.lines.some(line => line.label.includes("$40 per tooth") && line.amount === 240));
  const eight = estimate.calculate({ metal: "gold10k", lowerCount: 8, cuts: "permanentSingleTooth" });
  assert.equal(eight.total, 8 * 240 + 8 * 40 + 60);
});
