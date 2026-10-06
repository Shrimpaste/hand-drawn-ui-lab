import { chineseGlyphs } from "./chinese-glyphs.js";
import { length, partial, random } from "./sketch.js";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// Hanzi Writer stores pen medians in a 1024-unit, y-up em. Resample them once
// per layout so all animation frames traverse an identical, ordered centreline.
function medianPoints(flat, rng, x, dy, tilt) {
  const source = [];
  for (let i = 0; i < flat.length; i += 2) {
    const py = ((900 - flat[i + 1]) / 1024) * 100;
    source.push([x + (flat[i] / 1024) * 100 + (py - 50) * tilt, py + dy]);
  }
  const dense = [source[0]];
  for (let i = 1; i < source.length; i++) {
    const a = source[i - 1],
      b = source[i];
    const count = Math.max(
      1,
      Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6),
    );
    for (let j = 1; j <= count; j++)
      dense.push([
        a[0] + ((b[0] - a[0]) * j) / count,
        a[1] + ((b[1] - a[1]) * j) / count,
      ]);
  }
  let points = dense;
  for (let round = 0; round < 2; round++) {
    if (points.length < 3) break;
    const next = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1],
        b = points[i];
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    next.push(points.at(-1));
    points = next;
  }
  const phase = rng() * Math.PI * 2;
  return points.map(([px, py], i) => {
    const t = i / Math.max(1, points.length - 1);
    return [
      px + Math.sin(t * 8 + phase) * 0.24,
      py + Math.cos(t * 7 + phase) * 0.24,
    ];
  });
}
export function unsupportedChinese(text) {
  return [...new Set([...text].filter((c) => c !== " " && !chineseGlyphs[c]))];
}

/** Separate geometric distance from pen-up time; stable glyph placement. */
export function chinesePaths(text, seed = 17) {
  const missing = unsupportedChinese(text);
  if (missing.length) throw new RangeError(`缺少笔迹：${missing.join("、")}`);
  const rng = random(seed),
    strokes = [];
  let clock = 0,
    x = 0;
  for (const [characterIndex, character] of [...text].entries()) {
    if (character === " ") {
      x += 52;
      clock += 28;
      continue;
    }
    const dy = (rng() - 0.5) * 2.2,
      tilt = (rng() - 0.5) * 0.025;
    for (const [strokeIndex, median] of chineseGlyphs[character].entries()) {
      const points = medianPoints(median, rng, x, dy, tilt);
      const distance = length(points);
      strokes.push({
        character,
        characterIndex,
        strokeIndex,
        points,
        length: distance,
        start: clock,
        end: clock + distance,
        seed: seed + strokes.length * 19,
      });
      clock += distance + 8; // brief pen lift, same cost coordinate in either direction
    }
    clock += 24;
    x += 104;
  }
  return {
    text,
    strokes,
    width: Math.max(0, x - 4),
    cost: strokes.at(-1)?.end || 0,
  };
}

export function penSample(layout, cursor) {
  const stroke = layout.strokes.find(
    (s) => cursor >= s.start && cursor < s.end,
  );
  if (!stroke) return null;
  const points = partial(stroke.points, cursor - stroke.start);
  return {
    character: stroke.character,
    index: stroke.strokeIndex,
    point: points.at(-1),
  };
}

/** Latest request wins. Erase the visible identity to zero before swapping it.
 * No reset on reverse, no hidden old/new crossfade, no decoration-owned state.
 */
export class ChineseInk {
  constructor(text, { seed = 17, speed = 780 } = {}) {
    this.seed = seed;
    this.speed = speed;
    this.layout = chinesePaths(text, seed);
    this.cursor = 0;
    this.visible = true;
    this.pending = null;
    this.paused = false;
  }
  get progress() {
    return this.layout.cost ? this.cursor / this.layout.cost : 0;
  }
  get erasing() {
    return this.pending !== null || !this.visible;
  }
  get moving() {
    return (
      !this.paused &&
      (this.erasing
        ? this.cursor > 0 || this.pending !== null
        : this.cursor < this.layout.cost)
    );
  }
  setVisible(visible, reduced = false) {
    this.visible = visible;
    this.paused = false;
    if (reduced) this.finish();
  }
  replace(text, reduced = false) {
    const next = chinesePaths(text, this.seed); // validate before mutating anything
    this.pending = text === this.layout.text ? null : next;
    this.visible = true;
    this.paused = false;
    if (reduced) this.finish();
  }
  replay(reduced = false) {
    this.pending = this.pending || this.layout;
    this.visible = true;
    this.paused = false;
    if (reduced) this.finish();
  }
  seek(progress) {
    this.pending = null;
    this.cursor =
      clamp(Number.isFinite(progress) ? progress : 0, 0, 1) * this.layout.cost;
    this.paused = true;
  }
  finish() {
    if (this.pending) {
      this.layout = this.pending;
      this.pending = null;
    }
    this.cursor = this.visible ? this.layout.cost : 0;
    this.paused = false;
  }
  update(dt, reduced = false) {
    if (reduced) {
      if (!this.paused) this.finish();
      return false;
    }
    if (!this.moving || !Number.isFinite(dt) || dt <= 0) return false;
    const before = this.cursor;
    const rate = this.speed * (this.erasing ? 1.65 : 1);
    this.cursor = clamp(
      this.cursor + (this.erasing ? -1 : 1) * Math.min(dt, 0.05) * rate,
      0,
      this.layout.cost,
    );
    if (this.cursor === 0 && this.pending) {
      this.layout = this.pending;
      this.pending = null;
    }
    return this.cursor !== before;
  }
}

export const penStyles = {
  fine: { width: 2.15, grain: 0, pressure: 0.17 },
  pencil: { width: 3.1, grain: 0.16, pressure: 0.25 },
  color: { width: 4.2, grain: 0.22, pressure: 0.3 },
};

/** Draw actual stroke prefixes. Pressure and grain are indexed on the FULL
 * stroke, so changing progress never reshuffles already visible pigment. */
export function drawChinese(
  ctx,
  layout,
  {
    x = 0,
    y = 0,
    size = 48,
    cursor = layout.cost,
    color = "#725239",
    style = "fine",
  } = {},
) {
  const material = penStyles[style] || penStyles.fine;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of layout.strokes) {
    if (cursor <= s.start) break;
    const budget = Math.min(s.length, cursor - s.start);
    let traveled = 0;
    for (let i = 1; i < s.points.length && traveled < budget; i++) {
      const a = s.points[i - 1],
        b = s.points[i];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (!d) continue;
      const part = Math.min(1, (budget - traveled) / d);
      const pressure =
        0.85 +
        material.pressure * Math.sin(i * 0.19 + s.seed) +
        0.12 * Math.sin((Math.PI * traveled) / s.length);
      ctx.lineWidth = Math.max(material.width * pressure, (100 / size) * 0.85);
      ctx.globalAlpha =
        1 - material.grain * (0.5 + 0.5 * Math.sin(i * 3.71 + s.seed));
      ctx.beginPath();
      ctx.moveTo(...a);
      ctx.lineTo(a[0] + (b[0] - a[0]) * part, a[1] + (b[1] - a[1]) * part);
      ctx.stroke();
      traveled += d;
    }
  }
  ctx.restore();
}
