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

  const ROWS = 8;
  const COLUMNS = 5;
  const CAPACITY_PER_TOOTH = ROWS * COLUMNS;
  const SIZE_CAPACITY = Object.freeze({ "1.3":40, "1.5":30, "2.0":20, "3.0":10 });
  const UPPER = ["14","13","12","11","21","22","23","24"];
  const LOWER = ["44","43","42","41","31","32","33","34"];
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

  function capacityForSize(size) {
    return SIZE_CAPACITY[String(size)] || CAPACITY_PER_TOOTH;
  }

  function allowedCells(size) {
    const key = String(size || "1.3");
    const limit = SIZE_CAPACITY[key] || CAPACITY_PER_TOOTH;
    return centerFirstCells.slice(0, limit).sort((a,b) => a-b);
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

  function makeResult(targets, placements, requestedCount, capacity, size) {
    const selected = uniqueTeeth(targets);
    const clean = normalizeLayout(placements, selected);
    const requested = Math.max(0, Math.min(100, Math.floor(Number(requestedCount) || 0)));
    const perToothCapacity = capacity || capacityForSize(size);
    const placedCount = count(clean);
    return {
      rows: ROWS,
      columns: COLUMNS,
      capacityPerTooth: perToothCapacity,
      stoneSize: String(size || "1.3"),
      stoneTeeth: selected,
      placements: clean,
      requestedCount: requested,
      placedCount,
      unplacedCount: Math.max(0, requested - placedCount)
    };
  }

  function createDefault(targets, requestedCount, options) {
    const size = options && options.size ? String(options.size) : "1.3";
    const perToothCapacity = capacityForSize(size);
    const selected = uniqueTeeth(targets);
    const requested = Math.max(0, Math.min(100, Math.floor(Number(requestedCount) || 0)));
    const placements = {};
    selected.forEach(tooth => { placements[tooth] = []; });
    if (!selected.length || !requested) return makeResult(selected, placements, requested, perToothCapacity, size);

    let remaining = requested;
    let cursor = 0;
    const sizeCells = allowedCells(size);
    let cellCursor = 0;
    while (remaining > 0) {
      const tooth = selected[cursor % selected.length];
      const cells = placements[tooth];
      if (cells.length < perToothCapacity) {
        const nextCell = sizeCells[cellCursor % sizeCells.length];
        if (!cells.includes(nextCell)) {
          cells.push(nextCell);
          remaining--;
          cellCursor++;
        }
      }
      cursor++;
      if (cursor > requested * selected.length * 3 + selected.length) break;
      if (selected.every(t => placements[t].length >= perToothCapacity)) break;
    }
    return makeResult(selected, placements, requested, perToothCapacity, size);
  }

  function add(layout, tooth, cell, requestedCount) {
    const targets = uniqueTeeth(layout && layout.stoneTeeth);
    const placements = normalizeLayout(layout && layout.placements, targets);
    const key = String(tooth);
    const slot = Number(cell);
    const capacity = layout && layout.capacityPerTooth ? layout.capacityPerTooth : CAPACITY_PER_TOOTH;
    const size = layout && layout.stoneSize ? layout.stoneSize : "1.3";
    if (!targets.includes(key) || !Number.isInteger(slot) || slot < 0 || slot >= CAPACITY_PER_TOOTH) {
      return makeResult(targets, placements, requestedCount, capacity, size);
    }
    const current = placements[key] || [];
    if (!current.includes(slot) && current.length < capacity && allowedCells(size).includes(slot)) {
      placements[key] = current.concat(slot);
    }
    return makeResult(targets, placements, Math.max(Number(requestedCount) || 0, count(placements)), capacity, size);
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
    return makeResult(targets, placements, total, layout && layout.capacityPerTooth, layout && layout.stoneSize);
  }

  function move(layout, fromTooth, fromCell, toTooth, toCell) {
    const targets = uniqueTeeth(layout && layout.stoneTeeth);
    const placements = normalizeLayout(layout && layout.placements, targets);
    const from = String(fromTooth), to = String(toTooth);
    const sourceCell = Number(fromCell), targetCell = Number(toCell);
    const source = placements[from] || [];
    const destination = placements[to] || [];
    const capacity = layout && layout.capacityPerTooth ? layout.capacityPerTooth : CAPACITY_PER_TOOTH;
    const size = layout && layout.stoneSize ? layout.stoneSize : "1.3";
    const requested = layout && Number.isFinite(Number(layout.requestedCount)) ? Number(layout.requestedCount) : count(placements);
    if (!targets.includes(from) || !targets.includes(to)) return makeResult(targets, placements, requested, capacity, size);
    if (!source.includes(sourceCell) || destination.includes(targetCell)) return makeResult(targets, placements, requested, capacity, size);
    if (!Number.isInteger(targetCell) || targetCell < 0 || targetCell >= CAPACITY_PER_TOOTH || !allowedCells(size).includes(targetCell)) return makeResult(targets, placements, requested, capacity, size);
    if (from !== to && destination.length >= capacity) return makeResult(targets, placements, requested, capacity, size);
    if (from === to) {
      placements[from] = source.filter(value => value !== sourceCell).concat(targetCell);
    } else {
      placements[from] = source.filter(value => value !== sourceCell);
      if (!placements[from].length) delete placements[from];
      placements[to] = destination.concat(targetCell);
    }
    return makeResult(targets, placements, requested, capacity, size);
  }

  function withTargets(targets, requestedCount, options) {
    return createDefault(targets, requestedCount, options);
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
    return makeResult(selected, raw, requestedCount === undefined ? count(raw) : requestedCount, capacityForSize("1.3"), "1.3");
  }

  return Object.freeze({
    rows: ROWS,
    columns: COLUMNS,
    capacityPerTooth: CAPACITY_PER_TOOTH,
    capacityForSize,
    allowedCells,
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
