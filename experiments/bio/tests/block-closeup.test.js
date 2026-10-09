import { describe, it, expect } from "vitest";
import { Timeline, focusTransform, closeupLine, closeupNote, nextCloseup, closeupAt } from "../src/scenes/block/closeup.js";
import { CLOSEUPS } from "../src/content/block-room.js";
import { drawCloseup } from "../src/scenes/block/closeupArt.js";
import { BlockRoom } from "../src/scenes/block/room.js";

const run = (tl, s, dt = 1 / 30) => {
  for (let t = 0; t < s; t += dt) tl.update(dt);
};

describe("close-up molecular ink playback", () => {
  it("erases reactants before drawing products, passing stroke progress to InkSprite at constant opacity", () => {
    const c = new Proxy({ globalAlpha: 1, measureText: () => ({ width: 40 }) }, { get: (o, key) => o[key] ?? (() => {}) });
    const reactions = [
      ["mito", 1, ["pyruvate"], ["oaa"]],
      ["mito", 2, ["oaa"], ["pep"]],
      ["triose", 1, ["triose", "gap"], ["f16bp"]],
      ["fbp1", 1, ["f16bp"], ["f6p"]],
      ["er", 1, ["g6p"], ["glucose"]],
      ["fructose", 0, ["fructose"], ["f1p"]],
      ["fructose", 1, ["f1p"], ["triose", "glyceraldehyde"]],
    ];
    for (const [id, i, reactants, products] of reactions) {
      let partialErase = false,
        partialDraw = false;
      const room = { reduced: true, time: 0, drawText() {}, drawMol: BlockRoom.prototype.drawMol };
      let ink;
      room.mol = Object.fromEntries([...reactants, ...products, "co2", "pi", "water"].map((kind) => [kind, {
        draw: (_c, _x, _y, options) => {
          expect(options.alpha).toBe(1);
          ink[kind] = options.progress;
        },
      }]));
      for (let step = 0; step <= 100; step++) {
        ink = {};
        drawCloseup(id, room, c, [0, 0], { i, u: step / 100 });
        const from = reactants.map((kind) => ink[kind] ?? 0),
          to = products.map((kind) => ink[kind] ?? 0);
        expect(from.some((p) => p > 0) && to.some((p) => p > 0), `${id}:${i} at ${step}%`).toBe(false);
        partialErase ||= from.some((p) => p > 0 && p < 1);
        partialDraw ||= to.some((p) => p > 0 && p < 1);
      }
      expect(partialErase, `${id}:${i}`).toBe(true);
      expect(partialDraw, `${id}:${i}`).toBe(true);
    }
  });
});

describe("close-up Timeline: one animation phase per sentence", () => {
  it("plays the current phase to its end and holds there", () => {
    const tl = new Timeline([2, 3, 1]);
    run(tl, 5);
    expect(tl.phase).toBe(0);
    expect(tl.t).toBeCloseTo(2, 5);
    expect(tl.local).toEqual({ i: 0, u: 1 });
  });
  it("moves on when asked, and reports done only after the last phase has played", () => {
    const tl = new Timeline([2, 3, 1]);
    expect(tl.next()).toBe(true);
    expect(tl.phase).toBe(1);
    expect(tl.t).toBeCloseTo(2, 5);
    run(tl, 1.5);
    expect(tl.local.i).toBe(1);
    expect(tl.local.u).toBeCloseTo(0.5, 1);
    tl.next();
    expect(tl.done).toBe(false);
    run(tl, 2);
    expect(tl.done).toBe(true);
    expect(tl.next()).toBe(false);
  });
  it("goes back to the start of the previous phase, and replays from zero", () => {
    const tl = new Timeline([2, 3, 1]);
    tl.next();
    run(tl, 3);
    expect(tl.prev()).toBe(true);
    expect(tl.phase).toBe(0);
    expect(tl.t).toBe(0);
    expect(tl.prev()).toBe(false);
    tl.next();
    tl.replay();
    expect([tl.phase, tl.t]).toEqual([0, 0]);
  });
});

describe("focusTransform: the camera move into a close-up", () => {
  const f = { focus: [600, 200], zoom: 2, center: [440, 420] };
  it("is the identity when not focused", () => {
    const T = focusTransform({ ...f, k: 0 });
    expect(T.apply([123, 456])).toEqual([123, 456]);
  });
  it("brings the focus point to the centre at full zoom, and inverts exactly", () => {
    const T = focusTransform({ ...f, k: 1 });
    expect(T.apply([600, 200])).toEqual([440, 420]);
    const p = T.apply([650, 230]);
    expect(p[0]).toBeCloseTo(540, 5);
    expect(p[1]).toBeCloseTo(480, 5);
    const back = T.invert(p);
    expect(back[0]).toBeCloseTo(650, 5);
    expect(back[1]).toBeCloseTo(230, 5);
  });
});

describe("close-up words", () => {
  const fbp = CLOSEUPS.find((c) => c.id === "fbp1");
  it("uses the patient's sentence only where one is written", () => {
    expect(closeupLine(fbp, 1, true).say).toBe(fbp.lines[1].sayPatient);
    expect(closeupLine(fbp, 1, true).fine).toBe(fbp.lines[1].finePatient);
    expect(closeupLine(fbp, 1, false).say).toBe(fbp.lines[1].say);
    expect(closeupLine(fbp, 0, true).say).toBe(fbp.lines[0].say);
    expect(closeupLine(fbp, 2, true).fine).toBe("");
  });
  it("writes the close-up on the note page as a numbered list of its sentences", () => {
    const n = closeupNote(fbp, false);
    expect(n.title).toBe(fbp.label);
    expect(n.body.length).toBe(3);
    expect(n.body[1]).toContain(fbp.lines[1].say);
    expect(n.body[1]).toContain(fbp.lines[1].fine);
    expect(closeupNote(fbp, true).body[1]).toContain(fbp.lines[1].sayPatient);
  });
  it("cycles to the next close-up", () => {
    expect(nextCloseup(CLOSEUPS, CLOSEUPS[0].id)).toBe(CLOSEUPS[1]);
    expect(nextCloseup(CLOSEUPS, CLOSEUPS.at(-1).id)).toBe(CLOSEUPS[0]);
  });
  it("finds the ring under the pointer", () => {
    const cu = CLOSEUPS[2];
    expect(closeupAt(CLOSEUPS, cu.at[0] + 5, cu.at[1] - 5)).toBe(cu);
    expect(closeupAt(CLOSEUPS, 10, 10)).toBe(null);
  });
});

describe("the room's close-ups", () => {
  it("each has 3 short lines with phase durations, inside the cell", () => {
    expect(CLOSEUPS.length).toBeGreaterThanOrEqual(4);
    for (const cu of CLOSEUPS) {
      expect(cu.lines.length).toBe(3);
      for (const l of cu.lines) {
        expect(l.dur).toBeGreaterThan(1.5);
        for (const s of [l.say, l.sayPatient].filter(Boolean)) expect([...s].length).toBeLessThanOrEqual(30);
      }
      expect(cu.at[0]).toBeGreaterThan(82);
      expect(cu.at[0]).toBeLessThan(798);
    }
  });
});
