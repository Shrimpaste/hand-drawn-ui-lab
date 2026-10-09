import { describe, it, expect } from "vitest";
import { HandLabel } from "../src/engine/label.js";

const run = (label, seconds, visible, dt = 1 / 60) => {
  for (let t = 0; t < seconds; t += dt) {
    label.setVisible(visible, false);
    label.update(dt);
  }
};

describe("HandLabel text swap while its owner keeps asking for it to be visible", () => {
  it("erases the old words, then writes the new ones (hover moving from one subunit to another)", () => {
    const l = new HandLabel("亚基 A", { size: 15 });
    run(l, 3, true);
    expect(l.text).toBe("亚基 A");
    expect(l.ink.progress).toBeCloseTo(1, 1);
    l.set("亚基 B", false);
    let swappedAt = -1,
      minProgress = 1;
    for (let i = 0; i < 600; i++) {
      l.setVisible(true, false);
      l.update(1 / 60);
      minProgress = Math.min(minProgress, l.ink.progress);
      if (swappedAt < 0 && l.text === "亚基 B") swappedAt = i / 60;
    }
    expect(swappedAt).toBeGreaterThan(0);
    expect(swappedAt).toBeLessThan(1.2);
    expect(minProgress).toBeLessThan(0.05);
    expect(l.ink.progress).toBeCloseTo(1, 1);
  });
  it("stays hidden after the swap if the owner asked it to hide meanwhile", () => {
    const l = new HandLabel("亚基 A", { size: 15 });
    run(l, 3, true);
    l.set("亚基 B", false);
    run(l, 0.05, true);
    run(l, 4, false);
    expect(l.ink.progress).toBeLessThan(0.01);
  });
});
