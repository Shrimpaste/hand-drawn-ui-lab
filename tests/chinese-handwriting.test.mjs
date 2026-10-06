import test from "node:test";
import assert from "node:assert/strict";
import {
  ChineseInk,
  chinesePaths,
  drawChinese,
  penSample,
  unsupportedChinese,
} from "../primitives/chinese-handwriting.js";
import { chineseGlyphs, chinesePhrases } from "../primitives/chinese-glyphs.js";

const advance = (ink, seconds) => {
  for (let t = 0; t < seconds; t += 1 / 120) ink.update(1 / 120);
};
test("generated Chinese medians preserve ordered strokes and explicit missing-character errors", () => {
  for (const phrase of chinesePhrases) {
    const p = chinesePaths(phrase);
    assert.ok(p.cost > 0);
    for (let i = 1; i < p.strokes.length; i++)
      assert.ok(p.strokes[i].start > p.strokes[i - 1].end);
    assert.deepEqual(p, chinesePaths(phrase));
  }
  assert.equal(chinesePaths("日").strokes.length, 4);
  assert.deepEqual(
    chinesePaths("日").strokes.map((s) => s.strokeIndex),
    [0, 1, 2, 3],
  );
  assert.equal(chinesePaths("存").strokes.length, 6);
  assert.equal(chinesePaths("稿").strokes.length, 15);
  const firstMedian = chineseGlyphs["日"][0];
  const firstPath = chinesePaths("日").strokes[0].points;
  assert.ok(Math.abs(firstPath[0][0] - (firstMedian[0] / 1024) * 100) < 2);
  assert.ok(
    Math.abs(firstPath[0][1] - ((900 - firstMedian[1]) / 1024) * 100) < 2,
  );
  for (const text of ["单", "件"]) {
    const strokes = chinesePaths(text).strokes;
    const horizontal = strokes.at(-2).points,
      vertical = strokes.at(-1).points;
    assert.ok(horizontal.at(-1)[0] - horizontal[0][0] > 40);
    assert.ok(vertical.at(-1)[1] - vertical[0][1] > 55);
  }
  assert.deepEqual(unsupportedChinese("保存龘你好龘"), ["龘"]);
  assert.throws(() => chinesePaths("龘"), RangeError);
});
test("write/erase reversals preserve visible ink for repeated interruption", () => {
  const ink = new ChineseInk("保存草稿");
  advance(ink, 0.35);
  for (let i = 0; i < 10; i++) {
    const before = ink.cursor;
    ink.setVisible(false);
    assert.equal(ink.cursor, before);
    ink.update(0.01);
    const erased = ink.cursor;
    assert.ok(erased < before);
    ink.setVisible(true);
    assert.equal(ink.cursor, erased);
    ink.update(0.01);
    assert.ok(ink.cursor > erased);
  }
  ink.setVisible(false);
  advance(ink, 5);
  assert.equal(ink.cursor, 0);
  ink.setVisible(true);
  advance(ink, 10);
  assert.equal(ink.progress, 1);
});
test("replacement keeps visible identity until empty and latest target wins", () => {
  const ink = new ChineseInk("保存");
  ink.finish();
  const before = ink.cursor;
  ink.replace("打开");
  assert.equal(ink.cursor, before);
  assert.equal(ink.layout.text, "保存");
  advance(ink, 0.1);
  ink.replace("归档");
  assert.equal(ink.layout.text, "保存");
  while (ink.layout.text === "保存") ink.update(0.01);
  assert.equal(ink.layout.text, "归档");
  assert.equal(ink.cursor, 0);
  advance(ink, 10);
  assert.equal(ink.progress, 1);
  ink.replace("收起");
  advance(ink, 0.03);
  const mid = ink.cursor;
  ink.replace("归档");
  assert.equal(ink.pending, null);
  assert.equal(ink.cursor, mid);
  assert.throws(() => ink.replace("龘"));
  assert.equal(ink.layout.text, "归档");
});
test("replay erases from current ink; reduced mode reaches final state and does not restart", () => {
  const ink = new ChineseInk("今日待办");
  advance(ink, 0.3);
  const before = ink.cursor;
  ink.replay();
  assert.equal(ink.cursor, before);
  ink.update(0.01);
  assert.ok(ink.cursor < before);
  ink.replace("清单", true);
  assert.equal(ink.layout.text, "清单");
  assert.equal(ink.progress, 1);
  ink.update(0.02, false);
  assert.equal(ink.progress, 1);
  ink.setVisible(false, true);
  assert.equal(ink.cursor, 0);
  ink.seek(0.5);
  ink.update(0.1, true);
  assert.equal(ink.progress, 0.5);
  ink.update(0.1, false);
  assert.equal(ink.progress, 0.5);
});
test("render prefixes keep crossing strokes separate and existing pressure unchanged", () => {
  const calls = [];
  let line;
  const ctx = {
    save() {},
    restore() {},
    translate() {},
    scale() {},
    clearRect() {},
    beginPath() {
      line = [];
    },
    moveTo(...p) {
      line.push(p);
    },
    lineTo(...p) {
      line.push(p);
    },
    stroke() {
      calls.push({ line, width: this.lineWidth, alpha: this.globalAlpha });
    },
  };
  const layout = chinesePaths("开");
  const first = layout.strokes[0];
  drawChinese(ctx, layout, { cursor: first.end, style: "pencil" });
  const completeFirst = structuredClone(calls);
  calls.length = 0;
  drawChinese(ctx, layout, {
    cursor: layout.strokes[1].start,
    style: "pencil",
  });
  assert.deepEqual(calls, completeFirst);
  calls.length = 0;
  drawChinese(ctx, layout, { cursor: layout.cost, style: "pencil" });
  assert.deepEqual(calls.slice(0, completeFirst.length), completeFirst);
  assert.equal(penSample(layout, first.end + 1), null);
  assert.equal(penSample(layout, first.start + 5).index, 0);
  calls.length = 0;
  drawChinese(ctx, layout, { cursor: 0 });
  assert.equal(calls.length, 0);
});
