/* eslint-env node */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "../assets/grill-studio-3d.js"), "utf8");
const upperMatch = source.match(/const UPPER = (\[[^;]+\]);/);
const lowerMatch = source.match(/const LOWER = (\[[^;]+\]);/);
assert.ok(upperMatch, "upper FDI inventory must exist");
assert.ok(lowerMatch, "lower FDI inventory must exist");

const upper = Function("return " + upperMatch[1])();
const lower = Function("return " + lowerMatch[1])();
const ids = upper.concat(lower);

assert.equal(upper.length, 16, "upper arch must contain 16 positions");
assert.equal(lower.length, 16, "lower arch must contain 16 positions");
assert.equal(new Set(ids).size, 32, "all 32 FDI positions must be unique");
assert.deepEqual(upper, ["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"]);
assert.deepEqual(lower, ["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"]);

const classMatch = source.match(/function toothClass\(index\) \{[\s\S]*?\n  \}/);
const dimensionsMatch = source.match(/function toothDimensions\(index\) \{[\s\S]*?\n  \}/);
assert.ok(classMatch && dimensionsMatch, "tooth archetype functions must exist");
const { toothClass, toothDimensions } = Function(
  classMatch[0] + "\n" + dimensionsMatch[0] + "\nreturn { toothClass, toothDimensions };"
)();

const expectedCounts = { incisor: 8, canine: 4, premolar: 8, molar: 12 };
for (const jaw of [upper, lower]) {
  const classes = jaw.map((_, index) => toothClass(index));
  assert.equal(classes.filter(x => x === "incisor").length, 4);
  assert.equal(classes.filter(x => x === "canine").length, 2);
  assert.equal(classes.filter(x => x === "premolar").length, 4);
  assert.equal(classes.filter(x => x === "molar").length, 6);
  classes.forEach((kind, index) => {
    const d = toothDimensions(index);
    assert.equal(d.type, kind);
    assert.ok(d.width > 0 && d.depth > 0 && d.height > 0, "tooth dimensions must be positive");
  });
}
assert.deepEqual(expectedCounts, { incisor: 8, canine: 4, premolar: 8, molar: 12 });

assert.match(source, /getToothInventory/);
assert.match(source, /getGeometryDiagnostics/);
assert.match(source, /window\.MrSprinkleGrill3D = Object\.freeze\(\{ update, getToothInventory, getGeometryDiagnostics \}\)/);

console.log("PASS: 32 unique FDI positions; 8 incisors, 4 canines, 8 premolars, 12 molars; positive dimensions; diagnostics API exposed.");
