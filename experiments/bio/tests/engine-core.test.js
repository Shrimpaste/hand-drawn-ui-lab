import { describe, it, expect } from "vitest";
import { rng, hashString } from "../src/engine/rng.js";
import {
  polyLength,
  partialPath,
  catmull,
  pointInPolygon,
  clamp,
} from "../src/engine/geom.js";
import { InkTransition } from "../src/engine/ink.js";
import { Spring, Action } from "../src/engine/motion.js";

describe("rng", () => {
  it("is deterministic per seed and stays in [0,1)", () => {
    const a = rng(42),
      b = rng(42),
      c = rng(43);
    const sa = Array.from({ length: 50 }, a),
      sb = Array.from({ length: 50 }, b),
      sc = Array.from({ length: 50 }, c);
    expect(sa).toEqual(sb);
    expect(sa).not.toEqual(sc);
    for (const v of sa) expect(v >= 0 && v < 1).toBe(true);
  });
  it("hashes strings stably", () => {
    expect(hashString("糖")).toBe(hashString("糖"));
    expect(hashString("糖")).not.toBe(hashString("酮"));
  });
});

describe("geometry", () => {
  it("measures and cuts polylines by arc length", () => {
    const p = [
      [0, 0],
      [3, 4],
      [3, 10],
    ];
    expect(polyLength(p)).toBeCloseTo(11);
    const half = partialPath(p, 5);
    expect(half.at(-1)).toEqual([3, 4]);
    const mid = partialPath(p, 8);
    expect(mid.at(-1)[1]).toBeCloseTo(7);
    expect(partialPath(p, 0)).toHaveLength(1);
  });
  it("passes Catmull-Rom curves through their knots", () => {
    const knots = [
      [0, 0],
      [10, 5],
      [20, 0],
    ];
    const out = catmull(knots, { steps: 6 });
    expect(out[0]).toEqual([0, 0]);
    expect(out.at(-1)).toEqual([20, 0]);
    expect(out.some(([x, y]) => x === 10 && y === 5)).toBe(true);
  });
  it("tests points against polygons", () => {
    const sq = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    expect(pointInPolygon([5, 5], sq)).toBe(true);
    expect(pointInPolygon([15, 5], sq)).toBe(false);
    expect(clamp(2)).toBe(1);
    expect(clamp(-1, 0, 5)).toBe(0);
  });
});

describe("InkTransition", () => {
  it("writes, then erases from the current ink amount when interrupted", () => {
    const ink = new InkTransition({ writeSeconds: 1, eraseSeconds: 0.5 });
    ink.setVisible(true);
    ink.update(0.4);
    expect(ink.progress).toBeCloseTo(0.4);
    ink.setVisible(false);
    ink.update(0);
    expect(ink.progress).toBeCloseTo(0.4);
    // Erase time scales with the ink left on paper (0.4 x 0.5 s here).
    ink.update(0.1);
    expect(ink.progress).toBeLessThan(0.4);
    expect(ink.progress).toBeGreaterThan(0);
    ink.update(1);
    expect(ink.progress).toBe(0);
  });
  it("uses a short transition in reduced motion", () => {
    const ink = new InkTransition({ writeSeconds: 2 });
    ink.setVisible(true, true);
    ink.update(0.1);
    expect(ink.progress).toBe(1);
  });
});

describe("Spring and Action", () => {
  it("settles a spring on its target without blowing up on long frames", () => {
    const s = new Spring(0, { stiffness: 120, damping: 14 });
    s.target = 1;
    for (let i = 0; i < 120; i++) s.update(i % 10 === 0 ? 0.5 : 1 / 60);
    expect(s.value).toBeCloseTo(1, 3);
  });
  it("fires every semantic event exactly once, even across one slow frame", () => {
    const seen = [];
    const a = new Action({
      duration: 1,
      events: [
        { at: 0.6, name: "contact" },
        { at: 0.2, name: "lift" },
      ],
      onEvent: (e) => seen.push(e.name),
    });
    a.start();
    a.update(0.9);
    a.update(0.5);
    expect(seen).toEqual(["lift", "contact"]);
    expect(a.active).toBe(false);
  });
});
