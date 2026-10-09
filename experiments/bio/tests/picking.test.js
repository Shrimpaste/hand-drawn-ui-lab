import { describe, it, expect } from "vitest";
import { pickChain, tipChain, segmentVisible } from "../src/scenes/structure/picking.js";

const picks = [
  { x: 100, y: 100, r: 10, depth: 5, k: 0 },
  { x: 104, y: 100, r: 10, depth: 2, k: 1 },
  { x: 400, y: 400, r: 10, depth: 1, k: 2 },
];

describe("pickChain", () => {
  it("returns the nearest-to-camera chain under the point, or -1", () => {
    expect(pickChain(picks, 102, 100)).toBe(1);
    expect(pickChain(picks, 400, 405)).toBe(2);
    expect(pickChain(picks, 250, 250)).toBe(-1);
  });
  it("ignores chains the caller says are not pickable (faded behind the close-up)", () => {
    expect(pickChain(picks, 102, 100, (k) => k !== 1)).toBe(0);
    expect(pickChain(picks, 102, 100, () => false)).toBe(-1);
  });
});

describe("tipChain: which chain's description may be on screen", () => {
  const base = { hover: -1, picked: -1, focusAmt: 0, pointer: true, overUi: false };
  it("shows the hovered chain, else the recently clicked one", () => {
    expect(tipChain({ ...base, hover: 2 })).toBe(2);
    expect(tipChain({ ...base, picked: 3 })).toBe(3);
    expect(tipChain({ ...base, hover: 1, picked: 3 })).toBe(1);
  });
  it("shows nothing during a site close-up, even for a stale click", () => {
    expect(tipChain({ ...base, hover: 2, focusAmt: 0.3 })).toBe(-1);
    expect(tipChain({ ...base, picked: 3, focusAmt: 1 })).toBe(-1);
  });
  it("shows nothing when the pointer is gone or over a button", () => {
    expect(tipChain({ ...base, hover: 2, pointer: false })).toBe(-1);
    expect(tipChain({ ...base, picked: 3, pointer: false })).toBe(-1);
    expect(tipChain({ ...base, hover: 2, overUi: true })).toBe(-1);
  });
});

describe("segmentVisible: culling ribbon pieces that cannot touch the page", () => {
  const view = { w: 1280, h: 800 };
  it("keeps pieces inside or crossing the page", () => {
    expect(segmentVisible({ x: 100, y: 100 }, { x: 110, y: 104 }, 10, view)).toBe(true);
    expect(segmentVisible({ x: -300, y: 400 }, { x: 1500, y: 410 }, 10, view)).toBe(true);
  });
  it("drops pieces wholly outside, but keeps ones whose stroke width reaches in", () => {
    expect(segmentVisible({ x: 2000, y: 100 }, { x: 2010, y: 100 }, 10, view)).toBe(false);
    expect(segmentVisible({ x: -60, y: 100 }, { x: -50, y: 100 }, 10, view)).toBe(false);
    expect(segmentVisible({ x: -60, y: 100 }, { x: -50, y: 100 }, 80, view)).toBe(true);
    expect(segmentVisible({ x: 100, y: 1200 }, { x: 140, y: 1300 }, 10, view)).toBe(false);
  });
});
