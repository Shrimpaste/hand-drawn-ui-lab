import { describe, it, expect, vi } from "vitest";
import { _spec as spec, MOLECULE_KINDS, bakeMolecules } from "../src/scenes/block/molecules.js";
import { MOLECULE_OF } from "../src/scenes/block/model.js";

// Inspect the real baker's canvas dimensions without requiring a browser canvas in Vitest.
vi.mock("../src/engine/sprite.js", () => ({
  InkSprite: class {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.pivot = [w / 2, h / 2];
    }
  },
}));

const count = (m, e) => m.atoms.filter((a) => a[2] === e).length;

describe("molecule sketches keep the chemistry that matters here", () => {
  it("keeps terminal atoms inside the baked canvas with room for draft motion and pencil strokes", () => {
    const sprites = bakeMolecules(),
      radius = { C: 3.6, O: 3.3, N: 3.5, P: 4.6, H: 2.4 };
    for (const kind of MOLECULE_KINDS) {
      const { w, h, pivot } = sprites[kind];
      for (const [x, y, element] of spec(kind).atoms) {
        const margin = radius[element] + 3;
        expect(x + pivot[0] - margin, kind).toBeGreaterThanOrEqual(0);
        expect(x + pivot[0] + margin, kind).toBeLessThanOrEqual(w);
        expect(y + pivot[1] - margin, kind).toBeGreaterThanOrEqual(0);
        expect(y + pivot[1] + margin, kind).toBeLessThanOrEqual(h);
      }
    }
  });
  it("has a drawing for every molecule a token can be", () => {
    for (const k of new Set(Object.values(MOLECULE_OF))) expect(MOLECULE_KINDS).toContain(k);
    for (const k of MOLECULE_KINDS) expect(() => spec(k)).not.toThrow();
  });
  it("counts carbons: three for the trioses and acids, four for oxaloacetate, six for the hexoses", () => {
    for (const k of ["lactate", "pyruvate", "alanine", "glycerol", "g3p", "triose", "pep"]) expect(count(spec(k), "C")).toBe(3);
    expect(count(spec("oaa"), "C")).toBe(4);
    expect(count(spec("glyceraldehyde"), "C")).toBe(3);
    expect(count(spec("co2"), "C")).toBe(1);
    expect(count(spec("co2"), "O")).toBe(2);
    expect(count(spec("water"), "H")).toBe(2);
    expect(count(spec("pi"), "P")).toBe(1);
    expect(count(spec("pi"), "O")).toBe(4);
    for (const k of ["glucose", "g6p", "g1p", "mannose", "m6p", "galactose", "gal1p", "fructose", "f1p", "f6p", "f16bp"]) expect(count(spec(k), "C")).toBe(6);
  });
  it("counts phosphates where the names say so", () => {
    expect(count(spec("f16bp"), "P")).toBe(2);
    for (const k of ["f6p", "f1p", "g6p", "g1p", "m6p", "gal1p", "g3p", "triose", "pep"]) expect(count(spec(k), "P")).toBe(1);
    for (const k of ["glucose", "fructose", "mannose", "galactose", "lactate", "pyruvate", "alanine", "glycerol", "oaa"]) expect(count(spec(k), "P")).toBe(0);
  });
  it("tells the two triose phosphates apart: DHAP is a ketone, GAP an aldehyde", () => {
    const dbl = (m, i) => m.bonds.some(([a, b, o]) => o === 2 && (a === i || b === i) && m.atoms[a === i ? b : a][2] === "O");
    expect(count(spec("gap"), "C")).toBe(3);
    expect(count(spec("gap"), "P")).toBe(1);
    expect(dbl(spec("gap"), 0)).toBe(true);
    expect(dbl(spec("gap"), 1)).toBe(false);
    expect(dbl(spec("triose"), 1)).toBe(true);
  });
  it("gives alanine its nitrogen, and rings of the right size to the sugars", () => {
    expect(count(spec("alanine"), "N")).toBe(1);
    expect(spec("glucose").ring.length).toBe(6);
    expect(spec("f16bp").ring.length).toBe(5);
  });
});
