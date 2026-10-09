import { describe, it, expect } from "vitest";
import { makeProgress } from "../src/engine/boot.js";

describe("makeProgress: one bar over several loading stages", () => {
  const stages = [
    { id: "font", weight: 1 },
    { id: "bake", weight: 3 },
    { id: "warm", weight: 6 },
  ];
  it("maps a stage and its own fraction onto 0..1 by weight", () => {
    const p = makeProgress(stages);
    expect(p.at("font", 0)).toBeCloseTo(0);
    expect(p.at("font", 1)).toBeCloseTo(0.1);
    expect(p.at("bake", 0.5)).toBeCloseTo(0.25);
    expect(p.at("warm", 1)).toBeCloseTo(1);
  });
  it("never moves backwards, even if a stage reports out of order", () => {
    const p = makeProgress(stages);
    expect(p.at("warm", 0.5)).toBeCloseTo(0.7);
    expect(p.at("bake", 0.2)).toBeCloseTo(0.7);
    expect(p.at("warm", 0.4)).toBeCloseTo(0.7);
  });
  it("clamps fractions and rejects unknown stages", () => {
    const p = makeProgress(stages);
    expect(p.at("font", 5)).toBeCloseTo(0.1);
    expect(p.at("font", -2)).toBeCloseTo(0.1);
    expect(() => p.at("nope", 0.5)).toThrow();
  });
});
