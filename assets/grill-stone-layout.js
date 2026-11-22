/*
 * Mr. Sprinkle stone-layout engine.
 * Deterministic customer-editable 5 x 5 placement grids for each selected tooth.
 * Shared by the browser UI, 3D renderer, and Node regression tests.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MrSprinkleStoneLayout = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ROWS = 5;
  const COLUMNS = 5;
  const CAPACITY_PER_TOOTH = ROWS * COLUMNS;
  const UPPER = ["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"];
  const LOWER = ["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"];
  const VALID = new Set(UPPER.concat(LOWER));

  const centerFirstCells = Array.from({ length: CAPACITY_PER_TOOTH }, (_, cell) => cell)
    .sort((a, b) => {
      const ax = a % COLUMNS, ay = Math.floor(a / COLUMNS);
      const bx = b % COLUMNS, by = Math.floor(b / COLUMNS);
      const da = Math.pow(ax - 2, 2) + Math.pow(ay - 2, 2);
      const db = Math.pow(bx - 2, 2) + Math.pow(by - 2, 2);
      return da - db || ay - by || ax - bx;
    });

  function uniqueTeeth(values) {
    const list = Array.isArray(values) ? values : String(values || "").split(",");
    return Array.from(new Set(list.map(String).map(v => v.trim()).filter(v => VALID.has(v))));
  }

  function normalizeLayout(layout, targets) {
    const allowed = new Set(uniqueTeeth(targets));
    const output = {};
    Object.keys(layout || {}).forEach(tooth => {
      if (!allowed.has(String(tooth))) return;
      const values = Array.isArray(layout[tooth]) ? layout[tooth] : [];
      const valid = Array.from(new Set(values.map(Number).filter(v =>
        Number.isInteger(v) && v >= 0 && v < CAPACITY_PER_TOOTH
      ))).slice(0, CAPACITY_PER_TOOTH).sort((a, b) => a - b);
      if (valid.length) output[String(tooth)] = valid;
    });
    return output;
  }

  function count(layout) {
    return Object.values(layout || {}).reduce((sum, cells) => sum + (Array.isArray(cells) ? cells.length : 0), 0);
  }

  function makeResult(targets, placements, requestedCount) {
    const selected = uniqueTeeth(targets);
    const clean = normalizeLayout(placements, selected);
    const requested = Math.max(0, Math.min(100, Math.floor(Number(requestedCount) || 0)));
    const placedCount = count(clean);
    return {
      rows: ROWS,
      columns: COLUMNS,
      capacityPerTooth: CAPACITY_PER_TOOTH,
      stoneTeeth: selected,
      placements: clean,
      requestedCount: requested,
      placedCount,
      unplacedCount: Math.max(0, requested - placedCount)
    };
  }

  function createDefault(targets, requestedCount) {
    const selected = uniqueTeeth(targets);
    const requested = Math.max(0, Math.min(100, Math.floor(Number(requestedCount) || 0)));
    const placements = {};
    selected.forEach(tooth => { placements[tooth] = []; });
    if (!selected.length || !requested) return makeResult(selected, placements, requested);

    let remaining = requested;
    let cursor = 0;
    let cellCursor = 0;
    while (remaining > 0) {
      const tooth = selected[cursor % selected.length];
      const cells = placements[tooth];
      if (cells.length < CAPACITY_PER_TOOTH) {
        const nextCell = centerFirstCells[cellCursor % centerFirstCells.length];
        if (!cells.includes(nextCell)) {
          cells.push(nextCell);
          remaining--;
          cellCursor++;
        }
      }
      cursor++;
      if (cursor > requested * selected.length * 3 + selected.length) break;
      if (selected.every(t => placements[t].length >= CAPACITY_PER_TOOTH)) break;
    }
    return makeResult(selected, placements, requested);
  }

  function add(layout, tooth, cell, requestedCount) {
    const targets = uniqueTeeth(layout && layout.stoneTeeth);
    const placements = normalizeLayout(layout && layout.placements, targets);
    const key = String(tooth);
    const slot = Number(cell);
    if (!targets.includes(key) || !Number.isInteger(slot) || slot < 0 || slot >= CAPACITY_PER_TOOTH) {
      return makeResult(targets, placements, requestedCount);
    }
    const current = placements[key] || [];
    if (!current.includes(slot) && current.length < CAPACITY_PER_TOOTH) {
      placements[key] = current.concat(slot);
    }
    return makeResult(targets, placements, Math.max(Number(requestedCount) || 0, count(placements)));
  }

  function remove(layout, tooth, cell) {
    const targets = uniqueTeeth(layout && layout.stoneTeeth);
    const placements = normalizeLayout(layout && layout.placements, targets);
    const key = String(tooth);
    const slot = Number(cell);
    if (Array.isArray(placements[key])) {
      placements[key] = placements[key].filter(value => value !== slot);
      if (!placements[key].length) delete placements[key];
    }
    const total = count(placements);
    return makeResult(targets, placements, total);
  }

  function move(layout, fromTooth, fromCell, toTooth, toCell) {
    const targets = uniqueTeeth(layout && layout.stoneTeeth);
    const placements = normalizeLayout(layout && layout.placements, targets);
    const from = String(fromTooth), to = String(toTooth);
    const sourceCell = Number(fromCell), targetCell = Number(toCell);
    const source = placements[from] || [];
    const destination = placements[to] || [];
    if (!targets.includes(from) || !targets.includes(to)) return makeResult(targets, placements, count(placements));
    if (!source.includes(sourceCell) || destination.includes(targetCell)) return makeResult(targets, placements, count(placements));
    if (!Number.isInteger(targetCell) || targetCell < 0 || targetCell >= CAPACITY_PER_TOOTH) return makeResult(targets, placements, count(placements));
    placements[from] = source.filter(value => value !== sourceCell);
    if (!placements[from].length) delete placements[from];
    placements[to] = destination.concat(targetCell);
    return makeResult(targets, placements, count(placements));
  }

  function withTargets(targets, requestedCount) {
    return createDefault(targets, requestedCount);
  }

  function serialize(layout) {
    const targets = uniqueTeeth(layout && layout.stoneTeeth);
    const placements = normalizeLayout(layout && layout.placements, targets);
    return targets.map(tooth => {
      const cells = placements[tooth] || [];
      return cells.length ? tooth + ":" + cells.join(".") : "";
    }).filter(Boolean).join(";");
  }

  function parse(serialized, targets, requestedCount) {
    const selected = uniqueTeeth(targets);
    const raw = {};
    String(serialized || "").split(";").forEach(part => {
      const match = part.match(/^(\d{2}):([\d.]+)$/);
      if (!match || !selected.includes(match[1])) return;
      raw[match[1]] = match[2].split(".").map(Number);
    });
    return makeResult(selected, raw, requestedCount === undefined ? count(raw) : requestedCount);
  }

  return Object.freeze({
    rows: ROWS,
    columns: COLUMNS,
    capacityPerTooth: CAPACITY_PER_TOOTH,
    upper: Object.freeze(UPPER.slice()),
    lower: Object.freeze(LOWER.slice()),
    uniqueTeeth,
    count,
    createDefault,
    add,
    remove,
    move,
    withTargets,
    serialize,
    parse
  });
});
