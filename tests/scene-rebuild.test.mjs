import test from "node:test";
import assert from "node:assert/strict";
import { GalleryWalk } from "../scenes/gallery-model.js";
import { handwrittenPaths } from "../primitives/handwriting.js";
import { livingContour, boilFrame } from "../primitives/living-ink.js";
import { foleySamples } from "../primitives/foley.js";

test("gallery approaches the picture before observation and can be retargeted", () => {
  const g = new GalleryWalk(560, 676);
  g.walkTo(266, 598, { art: 0 });
  g.update(0.04);
  assert.equal(g.selected, -1);
  assert.equal(g.mode, "walking");
  const events = [];
  for (let i = 0; i < 240; i++) events.push(...g.update(1 / 60));
  assert.equal(g.mode, "looking");
  assert.equal(g.selected, 0);
  assert.equal(g.x, 266);
  assert.equal(g.y, 598);
  assert.equal(events.filter((e) => e.name === "arrive").length, 1);
  assert.ok(g.steps > 7);
  g.close();
  g.walkTo(800, 720);
  g.update(0.2);
  g.walkTo(500, 610, { art: 2 });
  for (let i = 0; i < 300; i++) g.update(0.017);
  assert.equal(g.selected, 2);
  assert.equal(g.x, 500);
});
test("reduced gallery motion still reaches the selected work without emitting footsteps", () => {
  const g = new GalleryWalk();
  g.walkTo(100, 600, { art: 1 });
  g.update(0.1, true);
  const events = g.update(0.04, true);
  assert.equal(g.selected, 1);
  assert.equal(events.filter((e) => e.name === "footstep").length, 0);
});
test("three contour drawings stay bounded, deterministic and distinct from frozen ink", () => {
  const points = Array.from({ length: 100 }, (_, i) => [
    i,
    Math.sin(i * 0.1) * 10,
  ]);
  const a = livingContour(points, 0, 71),
    b = livingContour(points, 1, 71);
  assert.notDeepEqual(a, b);
  assert.deepEqual(a, livingContour(points, 0, 71));
  a.forEach((p, i) =>
    assert.ok(Math.hypot(p[0] - points[i][0], p[1] - points[i][1]) <= 0.420001),
  );
  assert.deepEqual(
    [0, 0.125, 0.25, 0.375, 0.5].map((t) => boilFrame(t)),
    [0, 1, 2, 1, 0],
  );
  assert.equal(boilFrame(12, 71, true), 0);
});
test("handwritten words have curved pen paths, unequal natural spacing and stable variants", () => {
  const a = handwrittenPaths("little gallery", 91),
    b = handwrittenPaths("little gallery", 92);
  assert.deepEqual(a, handwrittenPaths("little gallery", 91));
  assert.notDeepEqual(a.paths, b.paths);
  assert.ok(a.paths.some((p) => p.length > 40));
  assert.ok(a.total > a.width * 2);
  assert.ok(a.paths.flat().every((p) => p.every(Number.isFinite)));
});
test("Foley buffers have bounded level, distinct contact/friction signatures and natural tails", () => {
  const kinds = [
    "step",
    "paper",
    "leaf",
    "stone",
    "wood",
    "bell",
    "switch",
    "write",
    "erase",
  ];
  for (const kind of kinds) {
    const d = foleySamples(kind, 24000, 91);
    assert.ok(d.length > 1000);
    assert.ok(d.every(Number.isFinite));
    assert.ok(Math.max(...d.map(Math.abs)) < 0.25);
  }
  const paper = foleySamples("paper", 24000, 91),
    step = foleySamples("step", 24000, 91),
    bell = foleySamples("bell", 24000, 91);
  assert.notDeepEqual([...paper.slice(0, 90)], [...step.slice(0, 90)]);
  assert.notDeepEqual([...step], [...foleySamples("step", 24000, 92)]);
  const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
  assert.ok(rms(step.slice(-600)) < rms(step.slice(0, 600)) * 0.1);
  assert.ok(rms(bell.slice(-1000)) < rms(bell.slice(0, 1000)) * 0.05);
});
