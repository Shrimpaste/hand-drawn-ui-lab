import { describe, it, expect } from "vitest";
import data from "../src/generated/fbp1-structure.json";

const UNIPROT =
  "MADQAPFDTDVNTLTRFVMEEGRKARGTGELTQLLNSLCTAVKAISSAVRKAGIAHLYGIAGSTNVTGDQVKKLDVLSNDLVMNMLKSSFATCVLVSEEDKHAIIVEPEKRGKYVVCFDPLDGSSNIDCLVSVGTIFGIYRKKSTDEPSEKDALQPGRNLVAAGYALYGSATMLVLAMDCGVNCFMLDPAIGEFILVDKDVKIKKKGKIYSLNEGYARDFDPAVTEYIQRKKFPPDNSAPYGARYVGSMVADVHRTLVYGGIFLYPANKKSPNGKLRLLYECNPMAYVMEKAGGMATTGKEAVLDVIPTDIHQRAPVILGSPDDVLEFLKVYEKHSAQ";
const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const at = (arr, i) => [arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]];

describe("FBP1 structure data (7C9Q / 7CWE / 7CVH)", () => {
  it("has four chains in UniProt numbering", () => {
    expect(data.chains.map((c) => c.id)).toEqual(["A", "B", "C", "D"]);
    for (const c of data.chains) {
      let bad = 0;
      c.num.forEach((n, i) => c.aa[i] !== UNIPROT[n - 1] && bad++);
      expect(bad, c.id).toBeLessThanOrEqual(2);
      expect(c.t.length).toBe(c.num.length * 3);
      expect(c.r.length).toBe(c.num.length * 3);
      expect(c.b.length).toBe(c.num.length);
      expect(c.ss.length).toBe(c.num.length);
    }
  });
  it("superposes the R state on the T state with a tetramer-scale difference", () => {
    expect(data.rmsd.r).toBeGreaterThan(1.5);
    expect(data.rmsd.r).toBeLessThan(6);
    expect(data.rmsd.s).toBeLessThan(1.5);
  });
  it("keeps the AMP site far from the active site (~30 A)", () => {
    expect(data.facts.ampToActiveSiteA).toBeGreaterThan(25);
    expect(data.facts.ampToActiveSiteA).toBeLessThan(36);
    expect(data.amp.every((a) => a.length === 23)).toBe(true);
  });
  it("places the substrate phosphates next to two Mg2+ and the known binding residues", () => {
    for (const s of data.sites) {
      expect(s.fbp.length).toBe(20);
      expect(s.mg.length).toBe(2);
      const p1 = s.fbp.find((a) => a.n === "P1").p;
      const p1R = s.fbp.find((a) => a.n === "P1").pR;
      for (const m of s.mg) {
        expect(d(m.p, p1)).toBeLessThan(4.2);
        expect(d(m.pR, p1R), "R-state frame").toBeLessThan(4.2);
      }
      const nums = s.res.map((r) => r.num);
      for (const n of [98, 119, 122, 213, 245, 275, 281]) expect(nums, `${s.chain} ${n}`).toContain(n);
    }
  });
  it("shows the C-terminal 321+ segment lies well away from the active site", () => {
    expect(data.facts.cTermFirst).toBe(321);
    expect(data.facts.cTermToActiveSite).toBeGreaterThan(12);
  });
  it("moves residues between the two states, most in the flexible regions", () => {
    const c = data.chains[0];
    const shift = c.num.map((_, i) => d(at(c.t, i), at(c.r, i)));
    expect(Math.max(...shift)).toBeGreaterThan(3);
    expect(shift.filter((v) => v > 0.5).length).toBeGreaterThan(100);
  });
});
