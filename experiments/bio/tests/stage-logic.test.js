import { describe, it, expect } from "vitest";
import { Reveal } from "../src/engine/reveal.js";
import { Camera } from "../src/engine/camera.js";

describe("Reveal schedule", () => {
  it("draws environment before characters and labels", () => {
    const r = new Reveal();
    r.draw();
    r.update(0.9);
    expect(r.progress("env")).toBeGreaterThan(0);
    expect(r.progress("label")).toBe(0);
    r.update(10);
    expect(r.progress("label")).toBe(1);
    expect(r.done).toBe(true);
  });
  it("erases labels first and continues from the visible ink when interrupted", () => {
    const r = new Reveal();
    r.draw();
    r.update(1.2);
    const envBefore = r.progress("env");
    r.erase();
    r.update(0);
    expect(r.progress("env")).toBeCloseTo(envBefore, 5);
    r.update(0.2);
    expect(r.progress("label")).toBe(0);
    expect(r.progress("env")).toBeGreaterThan(0);
    r.update(5);
    expect(r.progress("env")).toBe(0);
    expect(r.done).toBe(true);
  });
  it("finishes immediately in reduced motion", () => {
    const r = new Reveal();
    r.draw(true);
    r.update(0.3);
    expect(r.progress("label")).toBe(1);
  });
});

describe("Camera parallax", () => {
  it("round-trips hit testing through parallax and zoom", () => {
    const cam = new Camera({ width: 1280, height: 800 });
    cam.point(0.8, -0.4);
    for (let i = 0; i < 60; i++) cam.update(1 / 30);
    cam.setZoom(1.4, 640, 380);
    const depth = 0.7;
    const s = cam.project(500, 420, depth);
    const back = cam.unproject(s.x, s.y, depth);
    expect(back.x).toBeCloseTo(500, 6);
    expect(back.y).toBeCloseTo(420, 6);
  });
  it("moves near layers more than far layers", () => {
    const cam = new Camera({ width: 1280, height: 800 });
    cam.point(1, 0);
    for (let i = 0; i < 60; i++) cam.update(1 / 30);
    expect(Math.abs(cam.shift(1).x)).toBeGreaterThan(
      Math.abs(cam.shift(0.2).x),
    );
  });
  it("holds still in reduced motion", () => {
    const cam = new Camera({ width: 1280, height: 800 });
    cam.point(1, 1);
    cam.update(1, true);
    expect(cam.shift(1).x).toBe(0);
  });
});

describe("Scene entry", () => {
  it("tells the entering scene where the visitor came from", async () => {
    const { Scene } = await import("../src/engine/scene.js");
    const s = new Scene({ hits: null, notesLayer: null }, "hall");
    let from;
    s.onEnter = (f) => (from = f);
    s.enter("glucose");
    expect(from).toBe("glucose");
  });
});
