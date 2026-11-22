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

test("stone sizes reserve wider grid spacing as stones get larger", () => {
  assert.equal(L.allowedCells("1.3").length, 25);
  assert.equal(L.allowedCells("1.5").length, 16);
  assert.equal(L.allowedCells("2.0").length, 9);
  assert.equal(L.allowedCells("3.0").length, 4);
  const large = L.createDefault(["11", "21"], 10, { size:"3.0" });
  assert.equal(large.capacityPerTooth, 4);
  assert.equal(large.placedCount, 8);
  assert.equal(large.unplacedCount, 2);
});
test("same-tooth reposition moves a stone instead of duplicating it", () => {
  const layout = L.createDefault(["11"], 5);
  const [source] = layout.placements["11"];
  const destination = L.allowedCells("1.3").find(cell => !layout.placements["11"].includes(cell));
  const moved = L.move(layout, "11", source, "11", destination);
  assert.equal(moved.placedCount, 5);
  assert.equal(moved.requestedCount, 5);
  assert.equal(moved.placements["11"].includes(source), false);
  assert.equal(moved.placements["11"].includes(destination), true);
});
test("size-specific grid refuses a stone position that is too close for 3mm", () => {
  const large = L.createDefault(["11"], 2, { size:"3.0" });
  const notAllowed = Array.from({length:25}, (_,cell)=>cell).find(cell => !L.allowedCells("3.0").includes(cell));
  const result = L.add(large, "11", notAllowed, 2);
  assert.equal(result.placedCount, 2);
});
