import test from "node:test";
import assert from "node:assert/strict";
import { VisitorRedraw } from "../scenes/visitor-redraw.js";
import { GalleryWalk } from "../scenes/gallery-model.js";
import { benchGeometry, onPlatform } from "../scenes/courtyard-layout.js";
import { insideBench } from "../scenes/bench-path.js";

test("character redraw never overlaps old/new ink and preserves interrupted partial drawings", () => {
  const v = new VisitorRedraw();
  v.start();
  v.update(0.15);
  const ink = v.oldProgress;
  assert.equal(v.start(), false);
  assert.equal(v.oldProgress, ink);
  for (let i = 0; i < 120; i++) {
    v.update(0.01);
    assert.ok(v.oldProgress === 0 || v.newProgress === 0);
  }
  assert.equal(v.phase, "complete");
  assert.equal(v.newProgress, 1);
  v.start();
  v.update(0.36 + 0.31);
  const visible = v.newProgress;
  assert.equal(v.start(), true);
  assert.equal(v.oldProgress, visible);
  assert.equal(v.newProgress, 0);
  v.update(4);
  assert.equal(v.newProgress, 1);
});

test("bench arrival, mounting and dismounting complete before queued walking", () => {
  const g = new GalleryWalk(576, 663);
  g.configureBench(benchGeometry);
  g.walkTo(benchGeometry.approach.x, benchGeometry.approach.y, { sit: true });
  let mounting = false;
  for (let i = 0; i < 360 && g.mode !== "sitting"; i++) {
    g.update(1 / 60);
    mounting ||= g.mode === "mounting";
  }
  assert.ok(mounting);
  assert.equal(g.mode, "sitting");
  assert.equal(g.seatAmount, 1);
  assert.equal(g.drawingPose.x, benchGeometry.perch.x);
  g.walkTo(350, 500);
  assert.equal(g.mode, "dismounting");
  const before = { x: g.x, y: g.y };
  g.update(0.12);
  assert.deepEqual({ x: g.x, y: g.y }, before);
  assert.ok(g.seatAmount > 0 && g.seatAmount < 1);
  for (let i = 0; i < 600; i++) g.update(1 / 60);
  assert.equal(g.mode, "idle");
  assert.equal(g.seatAmount, 0);
  assert.equal(g.x, 350);
  assert.equal(g.y, 500);
});

test("walking across the bench routes around its ground footprint", () => {
  const b = benchGeometry.obstacle;
  const g = new GalleryWalk(b.minX - 35, (b.minY + b.maxY) / 2);
  g.configureBench(benchGeometry);
  g.walkTo(b.maxX + 35, (b.minY + b.maxY) / 2);
  assert.ok(g.route.length > 0);
  for (let i = 0; i < 600; i++) {
    g.update(1 / 60);
    assert.equal(insideBench(g, b), false);
    assert.ok(onPlatform(g.x, g.y));
  }
  assert.equal(g.x, b.maxX + 35);
  assert.equal(g.mode, "idle");
});
