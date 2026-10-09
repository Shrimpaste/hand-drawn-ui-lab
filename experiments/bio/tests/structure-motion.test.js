import { describe, it, expect } from "vitest";
import { Flicker } from "../src/engine/flicker.js";
import { conformerFrames, thermalAmplitude } from "../src/engine3d/conformers.js";
import { splineChain } from "../src/engine3d/ribbon.js";

describe("Flicker: three alternating drawings with uneven dwell", () => {
  it("is a pure function of time and stays within the state count", () => {
    const f = new Flicker(3, { seed: 4 });
    for (let t = 0; t < 20; t += 0.037) {
      const a = f.at(t);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(3);
      expect(f.at(t)).toBe(a);
    }
  });
  it("visits every state, never repeats a state back to back, and dwells 60-220 ms", () => {
    const f = new Flicker(3, { seed: 9 });
    const runs = [];
    let last = f.at(0),
      start = 0;
    for (let t = 0.001; t < 30; t += 0.001) {
      const s = f.at(t);
      if (s !== last) {
        runs.push({ s: last, len: t - start });
        last = s;
        start = t;
      }
    }
    expect(new Set(runs.map((r) => r.s)).size).toBe(3);
    for (const r of runs.slice(1)) {
      expect(r.len).toBeGreaterThan(0.055);
      expect(r.len).toBeLessThan(0.23);
    }
  });
  it("runs faster when excited and freezes in reduced motion", () => {
    const f = new Flicker(3, { seed: 2 });
    const changes = (rate) => {
      let n = 0,
        prev = f.at(0, { rate });
      for (let t = 0.002; t < 10; t += 0.002) {
        const s = f.at(t, { rate });
        if (s !== prev) n++;
        prev = s;
      }
      return n;
    };
    expect(changes(2)).toBeGreaterThan(changes(1) * 1.6);
    expect(f.at(5.5, { reduced: true })).toBe(0);
  });
  it("has a calm pace for the protein (>= 0.35 s dwell) and does not speed up on hover", async () => {
    const { PACE, hoverRate } = await import("../src/engine/flicker.js");
    expect(PACE.protein.min).toBeGreaterThanOrEqual(0.35);
    expect(PACE.ligand.min).toBeGreaterThanOrEqual(0.2);
    expect(hoverRate(true, "protein")).toBe(1);
    expect(hoverRate(true, "ring")).toBeGreaterThan(1);
  });
  it("decouples elements through their seeds", () => {
    const a = new Flicker(3, { seed: 1 }),
      b = new Flicker(3, { seed: 7 });
    let same = 0,
      n = 0;
    for (let t = 0; t < 10; t += 0.01, n++) if (a.at(t) === b.at(t)) same++;
    expect(same / n).toBeLessThan(0.7);
  });
});

describe("thermal conformer frames from B-factors", () => {
  const b = [15, 15, 15, 45, 45, 45, 15, 15];
  it("maps B to an RMS displacement (u^2 = B / 8 pi^2, three axes)", () => {
    expect(thermalAmplitude(0)).toBe(0);
    expect(thermalAmplitude(20)).toBeCloseTo(Math.sqrt((3 * 20) / (8 * Math.PI ** 2)), 6);
    expect(thermalAmplitude(40)).toBeGreaterThan(thermalAmplitude(20));
  });
  it("makes distinct, deterministic frames; flexible residues move more", () => {
    const f1 = conformerFrames(b, { frames: 3, seed: 5, gain: 2 }),
      f2 = conformerFrames(b, { frames: 3, seed: 5, gain: 2 });
    expect(f1.length).toBe(3);
    expect(f1[0].length).toBe(b.length * 3);
    expect(Array.from(f1[1])).toEqual(Array.from(f2[1]));
    expect(Array.from(f1[0])).not.toEqual(Array.from(f1[1]));
    const mag = (f, i) => Math.hypot(f[i * 3], f[i * 3 + 1], f[i * 3 + 2]);
    const mixed = [...Array(30).fill(15), ...Array(30).fill(45), ...Array(30).fill(15)];
    let stiff = 0,
      loose = 0;
    for (let s = 0; s < 30; s++) {
      for (const f of conformerFrames(mixed, { frames: 3, seed: s, gain: 2 })) {
        for (let i = 10; i < 20; i++) stiff += mag(f, i);
        for (let i = 40; i < 50; i++) loose += mag(f, i);
      }
    }
    expect(loose).toBeGreaterThan(stiff * 1.4);
  });
  it("steps between neighbouring conformers by a small, even amount (visible, not a twitch)", async () => {
    const { CONFORMER_GAIN } = await import("../src/engine3d/conformers.js");
    const long = Array(300).fill(30);
    const fr = conformerFrames(long, { frames: 3, seed: 8, gain: CONFORMER_GAIN });
    const rms = (a, b) => {
      let s = 0;
      for (let i = 0; i < a.length; i += 3) s += (a[i] - b[i]) ** 2 + (a[i + 1] - b[i + 1]) ** 2 + (a[i + 2] - b[i + 2]) ** 2;
      return Math.sqrt(s / (a.length / 3));
    };
    const s01 = rms(fr[0], fr[1]),
      s12 = rms(fr[1], fr[2]);
    // ping-pong order 0,1,2,1 only ever moves between neighbours: both steps are alike
    expect(Math.abs(s01 - s12) / Math.max(s01, s12)).toBeLessThan(0.3);
    // a flexible stretch (B=30 here) steps ~0.3-0.7 A: about 1.5-3 px on screen
    expect(s01).toBeGreaterThan(0.3);
    expect(s01).toBeLessThan(0.7);
  });
  it("is smooth along the chain, like a real backbone breathing", () => {
    const long = Array(200).fill(30),
      [f] = conformerFrames(long, { frames: 1, seed: 3, gain: 2 });
    let near = 0,
      far = 0;
    for (let i = 0; i < 190; i++) {
      for (let k = 0; k < 3; k++) {
        near += Math.abs(f[i * 3 + k] - f[(i + 1) * 3 + k]);
        far += Math.abs(f[i * 3 + k] - f[(i + 40) * 3 + k] || 0);
      }
    }
    expect(near).toBeLessThan(far * 0.8);
  });
});

describe("spline chain for ribbons", () => {
  const pts = Array.from({ length: 6 }, (_, i) => [i * 3.8, Math.sin(i) * 2, 0]);
  const num = [1, 2, 3, 4, 5, 6],
    ss = "CHHHEC";
  it("passes through the control points and subdivides between them", () => {
    const s = splineChain(pts, num, ss, { sub: 4 });
    expect(s.length).toBe(1);
    expect(s[0].length).toBe((6 - 1) * 4 + 1);
    expect(s[0][0].p).toEqual(pts[0]);
    expect(s[0][4].p.map((v) => +v.toFixed(6))).toEqual(pts[1].map((v) => +v.toFixed(6)));
    expect(s[0].at(-1).p).toEqual(pts[5]);
  });
  it("carries a fractional residue index and its secondary structure", () => {
    const [seg] = splineChain(pts, num, ss, { sub: 2 });
    expect(seg[1].res).toBeCloseTo(0.5);
    expect(seg[3].ss).toBe("H");
    expect(seg.at(-1).ss).toBe("C");
  });
  it("breaks the ribbon where residues are missing", () => {
    const gapped = splineChain(pts, [1, 2, 3, 7, 8, 9], ss, { sub: 3 });
    expect(gapped.length).toBe(2);
    expect(gapped[0].at(-1).p).toEqual(pts[2]);
    expect(gapped[1][0].p).toEqual(pts[3]);
  });
});

