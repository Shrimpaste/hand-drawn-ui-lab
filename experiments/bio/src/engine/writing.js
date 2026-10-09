import { rng, hashString } from "./rng.js";
import { catmull, polyLength, partialPath } from "./geom.js";
import { latin, cjkPunct } from "./glyphs.js";

// Chinese strokes are hanzi-writer medians (Make Me a Hanzi, Arphic PL): real stroke
// order, 1024 box, y up with the baseline offset at 900.
let hanzi = {};
export function setHanziData(dict) {
  hanzi = dict || {};
  cache.clear();
}

const LATIN_SCALE = 0.8,
  LATIN_BASE = 0.9,
  LIFT = 0.22; // pen-lift cost between strokes, in em of travel

const isSpace = (ch) => ch === " " || ch === "\u3000";
export const hasGlyph = (ch) =>
  isSpace(ch) || ch === "\n" || !!hanzi[ch] || !!latin[ch] || !!cjkPunct[ch];

export function missingGlyphs(text) {
  return [...new Set([...String(text)].filter((ch) => !hasGlyph(ch)))];
}

/** Chaikin corner cutting keeps endpoints and avoids Catmull overshoot on sharp turns. */
function chaikin(points, rounds = 2) {
  let p = points;
  for (let r = 0; r < rounds; r++) {
    if (p.length < 3) return p;
    const out = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i],
        b = p[i + 1];
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    out.push(p.at(-1));
    p = out;
  }
  return p;
}

/** Densify straight runs so pressure and wobble have points to act on. */
function densify(points, step = 0.035) {
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 1; j <= n; j++)
      out.push([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]);
  }
  return out;
}

function handWobble(points, r, amount) {
  const ph = r() * 6.28,
    f = 6 + r() * 5;
  return points.map(([x, y], i) => {
    const t = i / Math.max(1, points.length - 1);
    return [
      x + Math.sin(t * f + ph) * amount,
      y + Math.cos(t * f * 0.8 + ph * 1.3) * amount,
    ];
  });
}

function glyphStrokes(ch, r) {
  if (hanzi[ch]) {
    const s = 0.93 + r() * 0.08,
      shear = -0.05 + r() * 0.06,
      rot = (r() - 0.5) * 0.05,
      dy = (r() - 0.5) * 0.04,
      dx = (r() - 0.5) * 0.03;
    const c = Math.cos(rot),
      sn = Math.sin(rot);
    const strokes = hanzi[ch].map((flat) => {
      const pts = [];
      for (let i = 0; i < flat.length; i += 2) {
        let x = flat[i] / 1024 - 0.5,
          y = (900 - flat[i + 1]) / 1024 - 0.5;
        x += shear * -y;
        pts.push([
          0.5 + dx + (x * c - y * sn) * s,
          0.5 + dy + (x * sn + y * c) * s,
        ]);
      }
      return handWobble(chaikin(densify(pts, 0.06), 2), r, 0.004);
    });
    return { strokes, advance: 1.0 + 0.02 + (r() - 0.5) * 0.05 };
  }
  if (cjkPunct[ch]) {
    const g = cjkPunct[ch];
    return {
      strokes: g.strokes.map((k) => catmull(k, { steps: 6 })),
      advance: g.advance,
    };
  }
  const g = latin[ch] || latin["?"];
  const tilt = -0.07 + (r() - 0.5) * 0.06,
    sy = 0.95 + r() * 0.08,
    base = (r() - 0.5) * 0.03;
  let maxX = 0;
  const strokes = g.map((knots) => {
    const pts = catmull(knots, { steps: 6 }).map(([x, y]) => {
      maxX = Math.max(maxX, x);
      return [
        (x + tilt * (y - 1)) * LATIN_SCALE,
        LATIN_BASE + (y - 1) * LATIN_SCALE * sy + base,
      ];
    });
    return handWobble(pts, r, 0.003);
  });
  return { strokes, advance: (maxX + 0.13 + (r() - 0.5) * 0.04) * LATIN_SCALE };
}

const noLineStart = new Set("，。、：；）”！？.,:;)!?");
const cache = new Map();

/**
 * Lay out text in em units. Returns strokes in writing order, each with its arc length,
 * the line count and the overall box. `maxWidth` wraps greedily (CJK may break anywhere).
 */
export function layoutText(text, { seed = 1, maxWidth = Infinity, lineHeight = 1.32 } = {}) {
  const key = `${text}|${seed}|${maxWidth}|${lineHeight}`;
  if (cache.has(key)) return cache.get(key);
  const r = rng(seed * 7919 + hashString(text));
  const strokes = [];
  let x = 0,
    line = 0,
    width = 0;
  const chars = [...String(text)];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === "\n") {
      width = Math.max(width, x);
      x = 0;
      line++;
      continue;
    }
    if (isSpace(ch)) {
      x += ch === " " ? 0.32 : 1;
      continue;
    }
    const g = glyphStrokes(ch, r);
    if (x > 0 && x + g.advance > maxWidth && !noLineStart.has(ch)) {
      width = Math.max(width, x);
      x = 0;
      line++;
    }
    const oy = line * lineHeight;
    for (const pts of g.strokes) {
      const placed = pts.map(([px, py]) => [px + x, py + oy]);
      strokes.push({
        points: placed,
        len: polyLength(placed),
        char: ch,
        line,
        pressure: 0.86 + r() * 0.26,
      });
    }
    x += g.advance;
  }
  width = Math.max(width, x);
  const total = strokes.reduce((s, k) => s + k.len + LIFT, 0);
  const out = { strokes, width, lines: line + 1, height: (line + 1) * lineHeight, total, lineHeight };
  if (cache.size > 600) cache.delete(cache.keys().next().value);
  cache.set(key, out);
  return out;
}

/**
 * Draw laid-out writing by arc-length budget. progress 0..1 reveals strokes in order;
 * lowering progress removes the latest strokes first (a real reverse erase).
 */
export function drawWriting(
  c,
  layout,
  {
    x = 0,
    y = 0,
    size = 24,
    progress = 1,
    color = "#5b3f2b",
    width = 0.062,
    align = "left",
    alpha = 1,
  } = {},
) {
  if (progress <= 0 || !layout.strokes.length) return;
  let budget = layout.total * Math.min(1, progress);
  const ox = align === "center" ? -layout.width / 2 : align === "right" ? -layout.width : 0;
  c.save();
  c.translate(x, y);
  c.scale(size, size);
  c.translate(ox, 0);
  c.strokeStyle = color;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.globalAlpha *= alpha;
  for (const s of layout.strokes) {
    budget -= LIFT;
    if (budget <= 0) break;
    const shown = budget < s.len ? partialPath(s.points, budget) : s.points;
    budget -= s.len;
    penPressureStroke(c, shown, s.len, width * s.pressure);
  }
  c.restore();
}

function penPressureStroke(c, pts, fullLen, w) {
  if (pts.length < 2) return;
  let travelled = 0;
  const step = 3;
  for (let i = 0; i < pts.length - 1; i += step) {
    const seg = pts.slice(i, Math.min(pts.length, i + step + 1));
    const segLen = polyLength(seg),
      mid = (travelled + segLen / 2) / (fullLen || 1);
    // Pressure: quick landing, slight swell, light lift-off.
    const press =
      Math.min(1, 0.55 + mid * 6) * (1 - Math.max(0, mid - 0.82) * 1.6) * (0.92 + 0.12 * Math.sin(mid * 9));
    c.lineWidth = w * press;
    c.beginPath();
    c.moveTo(seg[0][0], seg[0][1]);
    for (let j = 1; j < seg.length; j++) c.lineTo(seg[j][0], seg[j][1]);
    c.stroke();
    travelled += segLen;
  }
}

export const LIFT_COST = LIFT;
