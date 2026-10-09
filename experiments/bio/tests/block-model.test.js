import { describe, it, expect } from "vitest";
import { ROUTES, passesFBP1, bloodTargets, stepGlycogen, spawnRates, MOLECULE_OF } from "../src/scenes/block/model.js";

describe("routes into glucose (report figure 1)", () => {
  it("sends lactate, alanine, glycerol and fructose through the FBP1 step", () => {
    for (const r of ["lactate", "alanine", "glycerol", "fructose"]) expect(passesFBP1(ROUTES[r])).toBe(true);
  });
  it("lets glycogen, galactose and mannose enter after the block", () => {
    for (const r of ["glycogen", "galactose", "mannose"]) expect(passesFBP1(ROUTES[r])).toBe(false);
  });
  it("joins the three-carbon routes at the triose phosphates, and mannose at F6P, galactose at G1P", () => {
    for (const r of ["lactate", "alanine", "glycerol", "fructose"]) expect(ROUTES[r]).toContain("tri");
    expect(ROUTES.mannose).toContain("f6p");
    expect(ROUTES.mannose).not.toContain("f16bp");
    expect(ROUTES.galactose).toContain("g1p");
    expect(ROUTES.glycogen.slice(0, 2)).toEqual(["gn", "g1p"]);
  });
  it("ends every glucose route in the blood, and the spill route in the lactate pool", () => {
    for (const [k, r] of Object.entries(ROUTES)) {
      if (k === "spill") expect(r.at(-1)).toBe("lacOut");
      else expect(r.at(-1)).toBe("glcOut");
    }
  });
  it("names a molecule for every node on every route", () => {
    for (const r of Object.values(ROUTES)) for (const n of r) expect(MOLECULE_OF[n]).toBeTruthy();
  });
});

describe("blood glucose and lactate (schematic, anchored on the case values)", () => {
  const base = { patient: false, fed: false, glycogen: 0, iv: false };
  it("gives the case's values for the patient fasting with glycogen used up", () => {
    const v = bloodTargets({ ...base, patient: true });
    expect(v.glucose).toBeCloseTo(3.2, 5);
    expect(v.lactate).toBeCloseTo(2.5, 5);
  });
  it("keeps a normal liver above 4 mmol/L fasting, because gluconeogenesis still works", () => {
    expect(bloodTargets(base).glucose).toBeGreaterThan(4);
    expect(bloodTargets(base).lactate).toBeLessThan(1.5);
  });
  it("lets the patient hold glucose while fed or while glycogen lasts", () => {
    expect(bloodTargets({ ...base, patient: true, fed: true }).glucose).toBeGreaterThan(4.2);
    expect(bloodTargets({ ...base, patient: true, glycogen: 0.8 }).glucose).toBeGreaterThan(4.2);
  });
  it("restores glucose with IV glucose, without repairing the block (lactate eases but stays above normal)", () => {
    const iv = bloodTargets({ ...base, patient: true, iv: true });
    expect(iv.glucose).toBeGreaterThan(4.5);
    expect(iv.lactate).toBeLessThan(2.5);
    expect(iv.lactate).toBeGreaterThan(bloodTargets(base).lactate);
  });
});

describe("glycogen store", () => {
  it("refills when fed, drains slowly when fasting and fast under infection stress", () => {
    expect(stepGlycogen(0.5, 1, { fed: true })).toBeGreaterThan(0.5);
    const slow = 0.5 - stepGlycogen(0.5, 1, { fed: false });
    const fast = 0.5 - stepGlycogen(0.5, 1, { fed: false, stress: true });
    expect(slow).toBeGreaterThan(0);
    expect(fast).toBeGreaterThan(slow * 5);
    expect(stepGlycogen(0.01, 10, { fed: false, stress: true })).toBe(0);
    expect(stepGlycogen(0.99, 10, { fed: true })).toBe(1);
  });
});

describe("spawn rates", () => {
  it("only brings diet sugars in when the beat lists them, and glycogen units only while there is glycogen", () => {
    const r = spawnRates({ fed: false, sugars: [], glycogen: 0 });
    expect(r.fructose).toBe(0);
    expect(r.glycogen).toBe(0);
    expect(r.lactate).toBeGreaterThan(0);
    const s = spawnRates({ fed: false, sugars: ["mannose"], glycogen: 0.7 });
    expect(s.mannose).toBeGreaterThan(0);
    expect(s.glycogen).toBeGreaterThan(0);
  });
  it("mobilises more glycerol and alanine under stress", () => {
    expect(spawnRates({ stress: true, sugars: [] }).glycerol).toBeGreaterThan(spawnRates({ sugars: [] }).glycerol);
  });
});
