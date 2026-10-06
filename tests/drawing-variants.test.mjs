import test from "node:test";
import assert from "node:assert/strict";
import { redrawPoint, redrawProfiles } from "../primitives/drawing-variants.js";
import { Pencil } from "../primitives/living-ink.js";

test("full redraw preserves joint/contact pivots while changing interior anatomy deterministically", () => {
  for (const [name, profile] of Object.entries(redrawProfiles)) {
    for (let frame = 0; frame < 3; frame++) {
      assert.deepEqual(redrawPoint([0, 0], frame, profile), [0, 0], name);
      let changed = false;
      for (let y = profile[0][0]; y <= profile.at(-1)[0]; y += 2) {
        for (const x of [-12, 0, 12]) {
          const point = [x, y],
            result = redrawPoint(point, frame, profile);
          assert.deepEqual(result, redrawPoint(point, frame, profile));
          assert.ok(Math.hypot(result[0] - x, result[1] - y) < 2, name);
          changed ||= Math.hypot(result[0] - x, result[1] - y) > 0.1;
          if (!frame) assert.deepEqual(result, point);
        }
      }
      if (frame) assert.ok(changed, name);
    }
  }
  for (const frame of [0, 1, 2])
    for (const y of [0, 4, 8, 12]) {
      assert.deepEqual(redrawPoint([17, y], frame, redrawProfiles.foot), [
        17,
        y,
      ]);
    }
});

test("Pencil redraw is opt-in and does not mutate shared authored geometry", () => {
  const knots = [
      [-12, -60],
      [9, -32],
      [0, 0],
    ],
    saved = structuredClone(knots);
  const p = new Pencil({}, 1);
  assert.deepEqual(p.points(knots), saved);
  p.redraw = redrawProfiles.rabbitBody;
  assert.notDeepEqual(p.points(knots), saved);
  assert.deepEqual(knots, saved);
  assert.deepEqual(p.points(knots).at(-1), [0, 0]);
});
