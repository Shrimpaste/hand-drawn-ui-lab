import { describe, it, expect } from "vitest";
import { quatFromAxisAngle, quatMul, quatToMat, quatSlerp, applyMat, kabsch, rmsd, centroid, project } from "../src/engine3d/linalg.js";
import { rng } from "../src/engine/rng.js";

const cloud = (n, seed = 1) => {
  const r = rng(seed);
  return Array.from({ length: n }, () => [(r() - 0.5) * 40, (r() - 0.5) * 30, (r() - 0.5) * 20]);
};

describe("quaternions", () => {
  it("rotates a vector about an axis", () => {
    const m = quatToMat(quatFromAxisAngle([0, 0, 1], Math.PI / 2));
    const [x, y, z] = applyMat(m, [1, 0, 0]);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(1);
    expect(z).toBeCloseTo(0);
  });
  it("composes rotations in order", () => {
    const a = quatFromAxisAngle([0, 0, 1], Math.PI / 2),
      b = quatFromAxisAngle([1, 0, 0], Math.PI / 2);
    const [x, y, z] = applyMat(quatToMat(quatMul(b, a)), [1, 0, 0]);
    expect([x, y, z].map((v) => Math.round(v * 1e6) / 1e6)).toEqual([0, 0, 1]);
  });
  it("slerps along the shortest arc and keeps unit length", () => {
    const a = quatFromAxisAngle([0, 1, 0], 0),
      b = quatFromAxisAngle([0, 1, 0], Math.PI / 2);
    const h = quatSlerp(a, b, 0.5);
    expect(Math.hypot(...h)).toBeCloseTo(1);
    const [x, , z] = applyMat(quatToMat(h), [0, 0, 1]);
    expect(x).toBeCloseTo(Math.sin(Math.PI / 4));
    expect(z).toBeCloseTo(Math.cos(Math.PI / 4));
    const flipped = b.map((v) => -v);
    expect(quatSlerp(a, flipped, 1).map((v, i) => Math.abs(v - b[i]) < 1e-9 || Math.abs(v + b[i]) < 1e-9).every(Boolean)).toBe(true);
  });
});

describe("Kabsch superposition", () => {
  it("recovers a known rigid motion", () => {
    const P = cloud(60, 3),
      R = quatToMat(quatFromAxisAngle([0.3, 0.8, 0.5], 1.1)),
      t = [12, -7, 5];
    const Q = P.map((p) => applyMat(R, p).map((v, i) => v + t[i]));
    const fit = kabsch(P, Q);
    expect(fit.rmsd).toBeLessThan(1e-6);
    const moved = P.map(fit.apply);
    expect(rmsd(moved, Q)).toBeLessThan(1e-6);
  });
  it("is not fooled by a mirror image: result is a proper rotation", () => {
    const P = cloud(40, 5),
      Q = P.map(([x, y, z]) => [-x, y, z]);
    const fit = kabsch(P, Q);
    const m = fit.matrix,
      det = m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
    expect(det).toBeCloseTo(1);
    expect(fit.rmsd).toBeGreaterThan(1);
  });
  it("centroid and rmsd basics", () => {
    expect(centroid([[0, 0, 0], [2, 4, 6]])).toEqual([1, 2, 3]);
    expect(rmsd([[0, 0, 0]], [[3, 4, 0]])).toBeCloseTo(5);
  });
});

describe("perspective projection", () => {
  it("shrinks distant points toward the centre and flips y-up to screen-down", () => {
    const near = project([10, 10, 20], { f: 600, cx: 0, cy: 0, dist: 200 });
    const far = project([10, 10, -20], { f: 600, cx: 0, cy: 0, dist: 200 });
    expect(near.x).toBeGreaterThan(far.x);
    expect(near.s).toBeGreaterThan(far.s);
    expect(near.y).toBeLessThan(0);
    expect(near.depth).toBeLessThan(far.depth);
  });
});

import { quatFromTo } from "../src/engine3d/linalg.js";
describe("quatFromTo", () => {
  it("turns one direction onto another", () => {
    for (const [a, b] of [[[1, 0, 0], [0, 0, 1]], [[0.3, -0.8, 0.5], [0, 0, 1]], [[0, 0, 1], [0, 0, 1]], [[0, 0, -1], [0, 0, 1]]]) {
      const n = Math.hypot(...a),
        got = applyMat(quatToMat(quatFromTo(a, b)), a.map((v) => v / n));
      got.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6));
    }
  });
});
