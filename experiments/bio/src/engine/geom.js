import { rng } from "./rng.js";

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const easeOut = (t) => 1 - (1 - clamp(t)) ** 3;
export const easeInOut = (t) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
export const easeOutBack = (t, k = 1.6) => {
  const x = clamp(t) - 1;
  return 1 + (k + 1) * x * x * x + k * x * x;
};

export function polyLength(points) {
  let sum = 0;
  for (let i = 1; i < points.length; i++)
    sum += Math.hypot(
      points[i][0] - points[i - 1][0],
      points[i][1] - points[i - 1][1],
    );
  return sum;
}

export function partialPath(points, distance) {
  const out = [points[0]];
  let left = distance;
  for (let i = 1; i < points.length && left > 0; i++) {
    const a = points[i - 1],
      b = points[i],
      span = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (left < span) {
      const t = left / span;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      break;
    }
    out.push(b);
    left -= span;
  }
  return out;
}

/** Catmull-Rom through every knot; closed curves wrap their tangents. */
export function catmull(knots, { closed = false, steps = 8 } = {}) {
  let p = knots;
  if (
    closed &&
    p.length > 2 &&
    p[0][0] === p.at(-1)[0] &&
    p[0][1] === p.at(-1)[1]
  )
    p = p.slice(0, -1);
  if (p.length < 2) return p.map((q) => [...q]);
  const n = p.length,
    at = (i) => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))],
    out = [];
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const a = at(i - 1),
      b = at(i),
      c = at(i + 1),
      d = at(i + 2);
    for (let j = 0; j < steps; j++) {
      const t = j / steps,
        t2 = t * t,
        t3 = t2 * t;
      if (j === 0) {
        out.push([b[0], b[1]]);
        continue;
      }
      out.push(
        [0, 1].map(
          (k) =>
            0.5 *
            (2 * b[k] +
              (-a[k] + c[k]) * t +
              (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 +
              (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t3),
        ),
      );
    }
  }
  out.push(closed ? [...out[0]] : [p[n - 1][0], p[n - 1][1]]);
  return out;
}

/** Point and heading at fraction t of a polyline's arc length. */
export function pointAt(points, t) {
  const total = polyLength(points);
  let left = clamp(t) * total;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      span = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (left <= span || i === points.length - 1) {
      const k = span ? Math.min(1, left / span) : 0;
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])];
    }
    left -= span;
  }
  return [points[0][0], points[0][1], 0];
}

export function ellipsePts(cx, cy, rx, ry, n = 72, wobble = 0.012, phase = 0) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = (i / n) * Math.PI * 2,
      v = 1 + wobble * Math.sin(t * 3 + phase) + wobble * 0.5 * Math.sin(t * 5 - phase);
    return [cx + Math.cos(t) * rx * v, cy + Math.sin(t) * ry * v];
  });
}

/** Low-frequency normal offset. Variant changes the curve, never the pivot. */
export function livingOffset(points, variant = 0, seed = 1, amount = 0.4) {
  if (!amount) return points;
  const phase = rng(seed)() * Math.PI * 2;
  return points.map(([x, y], i) => {
    const a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)];
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      d = Math.hypot(dx, dy) || 1;
    const wave =
      Math.sin(i * 0.23 + phase + variant * 1.93) * 0.7 +
      Math.sin(i * 0.071 + phase - variant * 1.1) * 0.3;
    return [x - (dy / d) * wave * amount, y + (dx / d) * wave * amount];
  });
}

export function bounds(points) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

export function pointInPolygon([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i],
      [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

export function transformPts(points, { x = 0, y = 0, sx = 1, sy = sx, a = 0 } = {}) {
  const c = Math.cos(a),
    s = Math.sin(a);
  return points.map(([px, py]) => [
    x + (px * c - py * s) * sx,
    y + (px * s + py * c) * sy,
  ]);
}

/** Regular polygon knots, optionally rotated; used for sugar rings and lobules. */
export function polygon(cx, cy, r, sides, rot = 0, sy = 1) {
  return Array.from({ length: sides }, (_, i) => {
    const a = rot + (i / sides) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * sy];
  });
}

/** Rounded-corner polygon as a dense point list (for hard-but-soft objects). */
export function roundedPolygon(points, radius = 6, steps = 5) {
  const out = [],
    n = points.length;
  for (let i = 0; i < n; i++) {
    const p = points[(i - 1 + n) % n],
      q = points[i],
      r = points[(i + 1) % n];
    const d1 = Math.hypot(q[0] - p[0], q[1] - p[1]),
      d2 = Math.hypot(r[0] - q[0], r[1] - q[1]);
    const k1 = Math.min(radius, d1 / 2) / d1,
      k2 = Math.min(radius, d2 / 2) / d2;
    const a = [q[0] + (p[0] - q[0]) * k1, q[1] + (p[1] - q[1]) * k1],
      b = [q[0] + (r[0] - q[0]) * k2, q[1] + (r[1] - q[1]) * k2];
    for (let j = 0; j <= steps; j++) {
      const t = j / steps,
        u = 1 - t;
      out.push([
        u * u * a[0] + 2 * u * t * q[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * q[1] + t * t * b[1],
      ]);
    }
  }
  out.push([...out[0]]);
  return out;
}
