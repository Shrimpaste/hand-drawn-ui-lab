import { describe, it, expect } from "vitest";
import { FlowSim } from "../src/scenes/block/flow.js";
import { ROUTES } from "../src/scenes/block/model.js";
import { BlockRoom } from "../src/scenes/block/room.js";

// a compact layout: every node on a line, 60 px apart in route order of the lactate route
const nodes = {};
const all = [...new Set(Object.values(ROUTES).flat())];
all.forEach((n, i) => (nodes[n] = [i * 60, (i % 3) * 20]));

const run = (sim, seconds, opts, dt = 1 / 30) => {
  for (let t = 0; t < seconds; t += dt) sim.update(dt, opts);
};
const only = (route, rate = 1) => ({ lactate: 0, alanine: 0, glycerol: 0, glycogen: 0, fructose: 0, galactose: 0, mannose: 0, [route]: rate });

describe("FlowSim: molecules along their routes", () => {
  it("keeps both trioses for ink playback and finishes drawing F16BP before reaching the block", () => {
    const sim = new FlowSim(nodes),
      route = "glycerol",
      beforeTri = ROUTES[route].indexOf("tri") - 1;
    sim.tokens = [1, 2].map((id) => ({ id, route, i: beforeTri, s: sim.len[route][beforeTri] - 0.1, v: 1, wob: 0 }));
    sim.update(0.01);
    const tk = sim.tokens[0];
    expect(sim.tokens).toHaveLength(1);
    expect(sim.triWait).toHaveLength(0);
    expect(tk.pair.id).toBe(1);
    expect(sim.merges).toBe(1);
    expect(sim.kindOf(tk)).toBe("f16bp");
    let strokes;
    const room = {
      sim, time: 0, routeAlpha: () => 1,
      tokenPos: BlockRoom.prototype.tokenPos,
      drawTrioseMerge: BlockRoom.prototype.drawTrioseMerge,
      drawMol: (_c, kind, x, y, _id, alpha, _scale, progress = 1) => strokes.push({ kind, x, y, alpha, progress }),
    };
    const sample = (u) => {
      strokes = [];
      tk.s = sim.len[route][tk.i] * u;
      BlockRoom.prototype.drawTokens.call(room, {}, 1);
      return strokes.filter((s) => s.progress > 0);
    };
    expect(sample(0).map((s) => s.kind)).toEqual(["triose", "gap"]);
    const erasing = sample(0.35);
    expect(erasing.map((s) => s.kind)).toEqual(["triose", "gap"]);
    expect(erasing.every((s) => s.progress > 0 && s.progress < 1 && s.alpha === 1)).toBe(true);
    const drawing = sample(0.7);
    expect(drawing).toHaveLength(1);
    expect(drawing[0].kind).toBe("f16bp");
    expect(drawing[0].progress).toBeGreaterThan(0);
    expect(drawing[0].progress).toBeLessThan(1);
    expect(sample(0.95)[0].progress).toBe(1);
    tk.s = sim.len[route][tk.i] - 0.1;
    sim.update(0.01, { blocked: true });
    expect(sim.pile[0]).toBe(tk);
    expect(tk.pair).toBeUndefined();
    expect(sim.kindOf(tk)).toBe("f16bp");
  });
  it("spawns at the given rate and is deterministic for a seed", () => {
    const a = new FlowSim(nodes, { seed: 3 }),
      b = new FlowSim(nodes, { seed: 3 });
    run(a, 10, { blocked: false, rates: only("lactate", 1.1) });
    run(b, 10, { blocked: false, rates: only("lactate", 1.1) });
    expect(a.spawned.lactate).toBeGreaterThanOrEqual(10);
    expect(a.spawned.lactate).toBeLessThanOrEqual(12);
    expect(a.tokens.map((t) => t.s.toFixed(3))).toEqual(b.tokens.map((t) => t.s.toFixed(3)));
  });
  it("pairs two trioses into one fructose-1,6-bisphosphate", () => {
    const sim = new FlowSim(nodes, { seed: 1 });
    run(sim, 80, { blocked: false, rates: only("glycerol", 1) });
    expect(sim.merges).toBeGreaterThan(20);
    const ratio = sim.out.glcOut / sim.spawned.glycerol;
    expect(ratio).toBeGreaterThan(0.3);
    expect(ratio).toBeLessThan(0.55);
  });
  it("lets bypass sugars reach the blood even when FBP1 is blocked", () => {
    for (const r of ["mannose", "galactose", "glycogen"]) {
      const sim = new FlowSim(nodes, { seed: 2 });
      run(sim, 40, { blocked: true, rates: only(r, 1) });
      expect(sim.pile.length).toBe(0);
      expect(sim.out.glcOut).toBeGreaterThan(10);
    }
  });
  it("piles F-1,6-BP up at the block, sends no glucose out, and spills carbon back to lactate", () => {
    const sim = new FlowSim(nodes, { seed: 4, pileMax: 10 });
    run(sim, 90, { blocked: true, rates: only("lactate", 1.2) });
    expect(sim.pile.length).toBe(10);
    expect(sim.out.glcOut).toBe(0);
    expect(sim.out.lacOut).toBeGreaterThan(5);
  });
  it("drains the pile once the enzyme works again", () => {
    const sim = new FlowSim(nodes, { seed: 5, pileMax: 10 });
    run(sim, 90, { blocked: true, rates: only("lactate", 1.2) });
    run(sim, 30, { blocked: false, rates: only("lactate", 0) });
    expect(sim.pile.length).toBe(0);
    expect(sim.out.glcOut).toBeGreaterThan(5);
  });
  it("reports node arrivals for the reaction flashes", () => {
    const sim = new FlowSim(nodes, { seed: 6 });
    let seen = new Set();
    for (let i = 0; i < 900; i++) {
      sim.update(1 / 30, { blocked: false, rates: only("mannose", 1) });
      for (const e of sim.events) seen.add(e.node);
    }
    expect(seen.has("m6p")).toBe(true);
    expect(seen.has("f6p")).toBe(true);
  });
});
