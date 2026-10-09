import { describe, it, expect } from "vitest";
import data from "../src/generated/fbp1-structure.json";
import { nearestResidue, dist3, centroid } from "../src/scenes/structure/measure.js";

const chain = (k) => ({ num: data.chains[k].num, t: data.chains[k].t });
const siteCenter = (k) => centroid(data.sites[k].fbp.map((a) => a.p));

describe("distances shown in the room come from the coordinates", () => {
  it("finds the C-terminal residue nearest the active site, matching the stored fact", () => {
    const { num, d } = nearestResidue(chain(0), 321, siteCenter(0));
    expect(num).toBeGreaterThanOrEqual(321);
    expect(d).toBeCloseTo(data.facts.cTermToActiveSite, 1);
  });
  it("measures the AMP pocket to active site distance behind the 31.5 A caption", () => {
    const amp = centroid(data.amp[0].map((a) => a.p));
    expect(dist3(amp, siteCenter(0))).toBeCloseTo(data.facts.ampToActiveSiteA, 1);
    expect(data.facts.ampToActiveSiteA.toFixed(1)).toBe("31.5");
    expect(data.facts.cTermToActiveSite.toFixed(1)).toBe("20.7");
  });
  it("returns an infinite distance when no residue qualifies", () => {
    expect(nearestResidue({ num: [1, 2], t: [0, 0, 0, 1, 1, 1] }, 10, [0, 0, 0]).d).toBe(Infinity);
  });
});
