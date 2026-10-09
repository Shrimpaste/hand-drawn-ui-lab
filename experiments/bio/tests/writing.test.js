import { describe, it, expect, beforeAll } from "vitest";
import {
  setHanziData,
  layoutText,
  missingGlyphs,
} from "../src/engine/writing.js";

// Two medians shaped like real hanzi-writer data (1024 box, y up, baseline offset 900).
const fake = {
  糖: [
    [100, 800, 500, 800, 900, 790],
    [500, 850, 500, 400, 480, -50],
  ],
};

describe("writing layout", () => {
  beforeAll(() => setHanziData(fake));

  it("uses the median stroke order for Chinese and glyph paths for Latin", () => {
    const l = layoutText("糖3.2", { seed: 5 });
    const chinese = l.strokes.filter((s) => s.char === "糖");
    expect(chinese).toHaveLength(2);
    // First median starts at the left of the em box, top area (900 - 800).
    expect(chinese[0].points[0][0]).toBeLessThan(0.25);
    expect(chinese[0].points[0][1]).toBeLessThan(0.25);
    expect(l.strokes.length).toBeGreaterThan(4);
    expect(l.width).toBeGreaterThan(1.6);
    expect(l.total).toBeGreaterThan(0);
  });

  it("is stable for one seed and varies between seeds", () => {
    const a = layoutText("FBP1 糖", { seed: 9 }),
      b = layoutText("FBP1 糖", { seed: 9 }),
      c = layoutText("FBP1 糖", { seed: 10 });
    expect(a.strokes[0].points).toEqual(b.strokes[0].points);
    expect(a.strokes[0].points).not.toEqual(c.strokes[0].points);
  });

  it("covers the Latin, digit and science symbols the exhibits need", () => {
    const needed =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
      ".,:;-+/()*%=<>~±×→←↑↓⇌≈·'⁺⁻₂₃₆₁°℃βαΔ，。、：；（）“”—…？！";
    expect(missingGlyphs(needed)).toEqual([]);
  });

  it("reports characters that have no stroke data", () => {
    expect(missingGlyphs("糖酮")).toEqual(["酮"]);
  });

  it("breaks long text onto lines within a max width", () => {
    const l = layoutText("糖糖糖糖糖糖", { seed: 1, maxWidth: 3.2 });
    expect(l.lines).toBe(2);
    expect(l.width).toBeLessThanOrEqual(3.3);
  });
});
