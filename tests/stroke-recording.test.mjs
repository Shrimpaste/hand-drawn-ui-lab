import test from "node:test";
import assert from "node:assert/strict";
import {
  CanvasStrokeRecorder,
  strokeTimeValue,
  revealStrokePixels,
} from "../primitives/stroke-recording.js";

test("recorded contour precedes pigment and retains path transforms at different raster resolutions", () => {
  const painted = [],
    timed = [];
  const surface = (log) => ({
    globalAlpha: 1,
    translate(...args) {
      log.push(["translate", ...args]);
    },
    moveTo(...args) {
      log.push(["moveTo", ...args]);
    },
    lineTo(...args) {
      log.push(["lineTo", ...args]);
    },
    stroke() {
      log.push(["stroke", this.strokeStyle, this.globalAlpha]);
    },
    fillRect(...args) {
      log.push(["fillRect", this.fillStyle, this.globalAlpha, ...args]);
    },
  });
  const recorder = new CanvasStrokeRecorder(surface(painted), surface(timed)),
    c = recorder.context;
  c.translate(4, -3);
  recorder.begin(100);
  recorder.segment(0.34);
  c.strokeStyle = "#abc";
  c.globalAlpha = 0.3;
  c.moveTo(0, 0);
  c.lineTo(10, 5);
  c.stroke();
  recorder.segment(1);
  c.fillStyle = "#123";
  c.fillRect(0, 0, 5, 5);
  recorder.flush();
  assert.deepEqual(timed.slice(0, 3), painted.slice(0, 3));
  const decode = (color) => strokeTimeValue(...color.match(/\d+/g).map(Number));
  assert.equal(decode(timed[3][1]), 34);
  assert.equal(decode(timed[4][1]), 100);
  assert.equal(painted[3][2], 0.3);
  assert.equal(timed[3][2], 1);
  recorder.begin(20);
  c.stroke();
  recorder.flush();
  assert.equal(decode(timed.at(-1)[1]), 120);
  assert.equal(recorder.operations.length, 0);
});

test("stroke threshold preserves pigment alpha and reverses without stale revealed pixels", () => {
  const times = new Float32Array([10, 20, Infinity]);
  const source = new Uint8ClampedArray([
    30, 40, 50, 127, 20, 30, 40, 255, 10, 20, 30, 0,
  ]);
  const output = source.slice();
  revealStrokePixels(times, source, output, 21);
  assert.deepEqual([output[3], output[7], output[11]], [127, 255, 0]);
  revealStrokePixels(times, source, output, 11);
  assert.deepEqual([output[3], output[7], output[11]], [127, 0, 0]);
  assert.deepEqual(output.slice(0, 3), source.slice(0, 3));
});
