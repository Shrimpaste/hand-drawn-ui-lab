import { describe, it, expect } from "vitest";
import { FrameGovernor, TIERS } from "../src/engine/perf.js";

const feed = (g, ms, n) => {
  for (let i = 0; i < n; i++) g.push(ms);
};

describe("FrameGovernor", () => {
  it("stays at full quality while frames are comfortably quick", () => {
    const g = new FrameGovernor();
    feed(g, 8, 300);
    expect(g.tier).toBe(0);
  });
  it("steps down one tier at a time when frames are persistently slow", () => {
    const g = new FrameGovernor();
    feed(g, 36, 40);
    expect(g.tier).toBe(1);
    feed(g, 36, 40);
    expect(g.tier).toBe(2);
    feed(g, 60, 200);
    expect(g.tier).toBe(TIERS - 1);
  });
  it("ignores a lone hitch and the huge gaps of a hidden tab", () => {
    const g = new FrameGovernor();
    feed(g, 8, 60);
    g.push(90);
    feed(g, 8, 60);
    g.push(4000);
    feed(g, 8, 60);
    expect(g.tier).toBe(0);
  });
  it("never climbs back up (no flip-flopping while the user watches)", () => {
    const g = new FrameGovernor();
    feed(g, 36, 40);
    expect(g.tier).toBe(1);
    feed(g, 5, 500);
    expect(g.tier).toBe(1);
  });
  it("can be told to forget its history, e.g. after a resize", () => {
    const g = new FrameGovernor();
    feed(g, 36, 20);
    g.reset();
    feed(g, 8, 40);
    expect(g.tier).toBe(0);
  });
  it("lets a benchmark choose the starting tier from measured samples", () => {
    const g = new FrameGovernor();
    expect(g.tierFor([9, 10, 8, 11, 9, 10])).toBe(0);
    expect(g.tierFor([30, 33, 35, 29, 31, 34])).toBeGreaterThanOrEqual(1);
    expect(g.tierFor([70, 80, 66, 90, 75, 71])).toBe(TIERS - 1);
  });
});
