import test from "node:test";
import assert from "node:assert/strict";
import {
  groundPoint,
  groundUV,
  clampGround,
  courtyardProps,
  onPlatform,
  stations,
  gardenBench,
} from "../scenes/courtyard-layout.js";
import { CourtyardLife } from "../scenes/courtyard-life.js";

test("all prop ground footprints and visit points fit the actual four-corner platform", () => {
  for (const [name, p] of Object.entries(courtyardProps)) {
    for (const [x, y] of p.footprint)
      assert.ok(
        onPlatform(p.x + x * p.scale, p.y + y * p.scale),
        name + " overhangs the paving",
      );
  }
  for (const station of stations)
    assert.ok(onPlatform(station.visit.x, station.visit.y, 0.03));
  assert.ok(onPlatform(gardenBench.x, gardenBench.y));
  for (const [x, y] of [
    [-999, 1200],
    [1500, -400],
    [0, 0],
    [900, 700],
  ]) {
    const p = clampGround(x, y);
    assert.ok(onPlatform(p.x, p.y, 0.049));
  }
  for (let u = 0; u < 1.001; u += 0.1)
    for (let v = 0; v < 1.001; v += 0.1) {
      const p = groundPoint(u, v),
        q = groundUV(p.x, p.y);
      assert.ok(Math.abs(q.u - u) + Math.abs(q.v - v) < 1e-9);
    }
});
test("watering re-triggers continuously and emits contact once even across a slow frame", () => {
  const life = new CourtyardLife();
  life.touch("water");
  for (let i = 0; i < 35; i++) life.update(0.02);
  const moving = life.pose.can;
  assert.ok(moving > 0.7);
  life.touch("water");
  life.update(0);
  assert.equal(life.pose.can, moving);
  life.update(0.86);
  assert.deepEqual(life.events, ["water-lands"]);
  life.update(0.1);
  assert.deepEqual(life.events, []);
  for (let i = 0; i < 600; i++) life.update(0.02);
  assert.ok(Math.abs(life.pose.can) < 0.001);
  assert.ok(Math.abs(life.pose.flower) < 0.001);
  assert.ok(Math.abs(life.pose.sway) < 0.001);
});
test("pond, light and bird responses remain bounded and reversible under repeated input", () => {
  const life = new CourtyardLife();
  for (let i = 0; i < 40; i++) {
    life.touch("pond");
    life.update(0.03);
  }
  assert.equal(life.ripples.length, 4);
  assert.equal(life.count.pond, 40);
  life.touch("lamp");
  life.touch("bench");
  life.update(0.2, true);
  assert.equal(life.pose.glow, 1);
  life.touch("lamp");
  life.update(0.04, true);
  assert.equal(life.pose.glow, 0);
  for (let i = 0; i < 500; i++) life.update(0.02, true);
  assert.equal(life.pose.bird, 0);
  assert.equal(life.pose.fish, 0);
  assert.equal(life.ripples.length, 0);
  life.reset();
  assert.ok(Object.values(life.count).every((n) => n === 0));
});
