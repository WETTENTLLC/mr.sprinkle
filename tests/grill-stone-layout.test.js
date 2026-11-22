const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../assets/grill-stone-layout.js");

test("50 stones auto-distribute exactly across the chosen teeth", () => {
  const layout = L.createDefault(["11", "21", "22"], 50);
  assert.equal(layout.requestedCount, 50);
  assert.equal(layout.placedCount, 50);
  assert.equal(layout.unplacedCount, 0);
  assert.deepEqual(layout.stoneTeeth, ["11", "21", "22"]);
  assert.equal(L.count(layout.placements), 50);
});

test("the layout does not hide impossible 50-stone one-tooth requests", () => {
  const layout = L.createDefault(["11"], 50);
  assert.equal(layout.placedCount, 25);
  assert.equal(layout.unplacedCount, 25);
  assert.equal(layout.requestedCount, 50);
});

test("only explicitly targeted teeth receive placements", () => {
  const layout = L.createDefault(["11", "22"], 12);
  assert.deepEqual(Object.keys(layout.placements).sort(), ["11", "22"]);
  assert.equal(layout.placedCount, 12);
});

test("moving a stone between teeth preserves requested quantity and placement count", () => {
  const layout = L.createDefault(["11", "21"], 10);
  const sourceCell = layout.placements["11"][0];
  const targetCell = 24;
  const moved = L.move(layout, "11", sourceCell, "21", targetCell);
  assert.equal(moved.requestedCount, 10);
  assert.equal(moved.placedCount, 10);
  assert.equal(moved.unplacedCount, 0);
  assert.equal(moved.placements["21"].includes(targetCell), true);
  assert.equal(moved.placements["11"].includes(sourceCell), false);
});

test("click-add and remove update the exact total", () => {
  const base = L.createDefault(["11"], 2);
  const blank = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].find(c => !base.placements["11"].includes(c));
  const added = L.add(base, "11", blank, 2);
  assert.equal(added.placedCount, 3);
  assert.equal(added.requestedCount, 3);
  const removed = L.remove(added, "11", blank);
  assert.equal(removed.placedCount, 2);
  assert.equal(removed.requestedCount, 2);
});

test("layout serializes and restores without changing cell positions", () => {
  const original = L.createDefault(["11", "21"], 9);
  const text = L.serialize(original);
  const restored = L.parse(text, original.stoneTeeth, original.requestedCount);
  assert.deepEqual(restored.placements, original.placements);
  assert.equal(restored.placedCount, original.placedCount);
});

test("invalid teeth and out-of-range grid cells are rejected", () => {
  const layout = L.createDefault(["11", "99", "x"], 2);
  assert.deepEqual(layout.stoneTeeth, ["11"]);
  const added = L.add(layout, "11", 25, 2);
  assert.equal(added.placedCount, 2);
});
