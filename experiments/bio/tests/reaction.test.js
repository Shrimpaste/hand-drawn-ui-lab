import { describe, it, expect } from "vitest";
import { reactionPose, dockPose } from "../src/engine3d/reaction.js";

describe("hydrolysis choreography F-1,6-BP + H2O -> F6P + Pi", () => {
  it("starts untouched and ends fully separated", () => {
    expect(reactionPose(0)).toEqual({ water: 0, stretch: 0, proton: 0, leave: 0 });
    expect(reactionPose(1)).toEqual({ water: 1, stretch: 1, proton: 1, leave: 1 });
  });
  it("never runs backwards", () => {
    let prev = reactionPose(0);
    for (let u = 0.01; u <= 1.0001; u += 0.01) {
      const p = reactionPose(u);
      for (const k of Object.keys(p)) expect(p[k]).toBeGreaterThanOrEqual(prev[k] - 1e-9);
      prev = p;
    }
  });
  it("orders the events: water arrives, P-O1 bond stretches, proton moves, Pi leaves", () => {
    expect(reactionPose(0.28).water).toBe(1);
    expect(reactionPose(0.28).stretch).toBe(0);
    expect(reactionPose(0.5).stretch).toBeGreaterThan(0.6);
    expect(reactionPose(0.5).leave).toBe(0);
    expect(reactionPose(0.45).proton).toBeGreaterThan(0);
    expect(reactionPose(0.55).stretch).toBe(1);
    expect(reactionPose(0.7).leave).toBeGreaterThan(0);
  });
  it("clamps outside 0..1", () => {
    expect(reactionPose(-1).water).toBe(0);
    expect(reactionPose(3).leave).toBe(1);
  });
});

describe("docking approach", () => {
  it("sits at the site when docked and starts away along the outward direction", () => {
    expect(dockPose(1)).toEqual({ away: 0, spin: 0, alpha: 1 });
    const start = dockPose(0);
    expect(start.away).toBe(1);
    expect(start.alpha).toBe(0);
    expect(dockPose(0.5).alpha).toBeGreaterThan(0.5);
    expect(dockPose(0.5).away).toBeLessThan(1);
  });
});
