import { describe, it, expect } from "vitest";
import { BeatTrack, beatState, beatCue, beatText } from "../src/scenes/structure/beats.js";
import { STEPS, DEFAULT_STATE } from "../src/content/fbp1-room.js";

const steps = [
  { state: { focus: 0, dock: true }, beats: [{ say: "a" }, { say: "b", state: { amp: true } }, { say: "c", rxnTo: 5 }] },
  { state: { focus: -1 }, beats: [{ say: "d", rxnTo: 2 }, { say: "e", measure: "x", spots: ["P1"], pulse: "hot" }] },
];

describe("BeatTrack: one cursor over every beat of every step", () => {
  it("moves through beats, then into the next step, and stops at the very end", () => {
    const t = new BeatTrack(steps);
    expect([t.step, t.beat]).toEqual([0, 0]);
    expect(t.next()).toEqual({ step: 0, beat: 1, stepChanged: false });
    t.next();
    expect(t.next()).toEqual({ step: 1, beat: 0, stepChanged: true });
    t.next();
    expect(t.next()).toBeNull();
    expect([t.step, t.beat]).toEqual([1, 1]);
  });
  it("goes back the same way, landing on the last beat of the previous step", () => {
    const t = new BeatTrack(steps);
    t.go(1, 0);
    expect(t.prev()).toEqual({ step: 0, beat: 2, stepChanged: true });
    expect(t.prev()).toEqual({ step: 0, beat: 1, stepChanged: false });
    t.go(0, 0);
    expect(t.prev()).toBeNull();
  });
  it("jumps to a step's first beat and reports position out of the total", () => {
    const t = new BeatTrack(steps);
    t.go(1);
    expect([t.step, t.beat]).toEqual([1, 0]);
    expect(t.position).toBe(4);
    expect(t.total).toBe(5);
    expect(t.beatCount).toBe(2);
    expect(t.atEnd).toBe(false);
    t.go(1, 1);
    expect(t.atEnd).toBe(true);
  });
  it("clamps out-of-range requests", () => {
    const t = new BeatTrack(steps);
    t.go(9, 9);
    expect([t.step, t.beat]).toEqual([1, 1]);
    t.go(-3, -1);
    expect([t.step, t.beat]).toEqual([0, 0]);
  });
});

describe("beatState / beatCue", () => {
  it("accumulates state changes of earlier beats on top of the step's state", () => {
    expect(beatState(steps[0], 0, {})).toEqual({ focus: 0, dock: true });
    expect(beatState(steps[0], 2, { rxn: false })).toEqual({ rxn: false, focus: 0, dock: true, amp: true });
  });
  it("carries the reaction target forward but takes spots and measures from this beat only", () => {
    expect(beatCue(steps[0], 1).rxnTo).toBeUndefined();
    expect(beatCue(steps[0], 2).rxnTo).toBe(5);
    expect(beatCue(steps[1], 1)).toMatchObject({ rxnTo: 2, measure: "x", spots: ["P1"], pulse: "hot" });
    expect(beatCue(steps[1], 0).measure).toBeUndefined();
    expect(beatCue(steps[1], 0).spots).toEqual([]);
  });
  it("fills in the chain letter of the examined site", () => {
    expect(beatText("{chain} 链的活性位点", 2)).toBe("C 链的活性位点");
    expect(beatText("没有占位符", 0)).toBe("没有占位符");
  });
});

describe("the FBP1 room's real beats", () => {
  it("gives every step 3-4 short captions, each fitting two lines of 30px text", () => {
    for (const s of STEPS) {
      expect(s.beats.length).toBeGreaterThanOrEqual(3);
      expect(s.beats.length).toBeLessThanOrEqual(4);
      for (const b of s.beats) {
        expect([...b.say.replace("{chain}", "A")].length).toBeLessThanOrEqual(30);
        if (b.fine) expect([...b.fine].length).toBeLessThanOrEqual(46);
      }
    }
  });
  it("starts each step from the state the step declares", () => {
    for (const s of STEPS) {
      const st = beatState(s, 0, DEFAULT_STATE);
      for (const [k, v] of Object.entries(s.state)) if (!(s.beats[0].state && k in s.beats[0].state)) expect(st[k]).toBe(v);
    }
  });
  it("walks the reaction clock forward and ends fully played", () => {
    const react = STEPS.find((s) => s.id === "react");
    const marks = react.beats.map((_, j) => beatCue(react, j).rxnTo);
    expect(marks.every((m) => typeof m === "number")).toBe(true);
    expect([...marks].sort((a, b) => a - b)).toEqual(marks);
    expect(marks.at(-1)).toBe(9);
  });
});
