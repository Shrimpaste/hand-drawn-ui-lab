import { random, curvePoints, length, partial } from "./sketch.js";

export const palette = {
  ink: "#554335",
  soft: "#968775",
  paper: "#f8f1df",
  yellow: "#e4b742",
  honey: "#c88632",
  red: "#cd684f",
  rose: "#df9b82",
  teal: "#548f87",
  green: "#91a16b",
  blue: "#6277ad",
  plum: "#826e9e",
  pale: "#e3d7bd",
  cream: "#f6deb0",
  dark: "#454057",
};

/** Four-beat, three-drawing cycle. Fixed pivots; shape, texture and time stay separate. */
export function boilFrame(time, seed = 0, reduced = false) {
  return reduced ? 0 : [0, 1, 2, 1][Math.floor((time + seed * 0.017) * 8) % 4];
}
export function livingContour(points, variant = 0, seed = 1, amount = 0.42) {
  const phase = random(seed)() * Math.PI * 2;
  return points.map(([x, y], i) => {
    const a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)];
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      d = Math.hypot(dx, dy) || 1;
    const wave =
      Math.sin(i * 0.21 + phase + variant * 1.91) * 0.72 +
      Math.sin(i * 0.067 + phase - variant) * 0.28;
    return [x - (dy / d) * wave * amount, y + (dx / d) * wave * amount];
  });
}
function trace(c, points, closed = true) {
  c.beginPath();
  c.moveTo(...points[0]);
  for (const p of points.slice(1)) c.lineTo(...p);
  if (closed) c.closePath();
}
export function penLine(
  c,
  points,
  {
    variant = 0,
    seed = 1,
    width = 1.45,
    color = palette.ink,
    alpha = 1,
    closed = false,
    progress = 1,
    boil = 0.3,
  } = {},
) {
  if (progress <= 0) return;
  const p = livingContour(points, variant, seed, boil),
    shown = progress < 1 ? partial(p, length(p) * progress) : p;
  c.save();
  c.globalAlpha *= alpha;
  c.strokeStyle = color;
  c.lineCap = "round";
  c.lineJoin = "round";
  // Pressure along the stroke, rather than a uniform machine outline.
  for (let i = 0; i < shown.length - 1; i += 5) {
    const segment = shown.slice(i, Math.min(shown.length, i + 6));
    c.lineWidth = width * (0.89 + 0.15 * Math.sin(i * 0.27 + seed));
    trace(c, segment, closed && shown.length <= 6);
    c.stroke();
  }
  c.restore();
}
export function curve(c, knots, opts = {}) {
  penLine(
    c,
    curvePoints(knots, { closed: opts.closed || false, steps: 9 }),
    opts,
  );
}
export function ellipsePoints(x, y, rx, ry, phase = 0) {
  return Array.from({ length: 97 }, (_, i) => {
    const t = (i / 96) * Math.PI * 2,
      v = 1 + 0.011 * Math.sin(t * 3 + phase);
    return [x + Math.cos(t) * rx * v, y + Math.sin(t) * ry * v];
  });
}

/** Dense directional wax strokes, incomplete coverage and scumbled overpasses.
 * All randomness is seeded per drawing, so the fill does not shimmer with RAF. */
export function wax(
  c,
  contour,
  color,
  { seed = 1, density = 1, angle = -0.68, base = 0.15, shadow = null } = {},
) {
  const r = random(seed),
    xs = contour.map((p) => p[0]),
    ys = contour.map((p) => p[1]);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const w = maxX - minX,
    h = maxY - minY,
    cx = (maxX + minX) / 2,
    cy = (maxY + minY) / 2;
  c.save();
  trace(c, contour);
  c.clip();
  // Paper-backed pigment is opaque to objects behind it; gaps reveal its own paper.
  // Transparent wax alone makes the scarf/head/painted building incorrectly ghost.
  c.fillStyle = palette.paper;
  c.fillRect(minX, minY, w, h);
  c.fillStyle = color;
  c.globalAlpha *= base;
  c.fillRect(minX, minY, w, h);
  c.restore();
  c.save();
  trace(c, contour);
  c.clip();
  c.translate(cx, cy);
  c.rotate(angle);
  const extent = Math.hypot(w, h) / 2 + 5;
  c.strokeStyle = color;
  c.lineCap = "round";
  for (let row = -extent; row < extent; row += (0.94 + r() * 0.85) / density) {
    const y = row + (r() - 0.5) * 1.7;
    for (let x = -extent; x < extent;) {
      const span = 4 + r() * 23;
      c.globalAlpha = 0.25 + r() * 0.32;
      c.lineWidth = 1.05 + r() * 2.1;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(
        x + span * 0.48,
        y + (r() - 0.5) * 2.2,
        x + span,
        y + (r() - 0.5) * 1.3,
      );
      c.stroke();
      x += span + 0.7 + r() * 3.1;
    }
  }
  c.rotate(0.22);
  c.strokeStyle = shadow || color;
  for (let i = 0; i < w * h * 0.012 * density; i++) {
    const x = (r() - 0.5) * extent * 2,
      y = (r() - 0.5) * extent * 2;
    c.globalAlpha = 0.1 + r() * 0.2;
    c.lineWidth = 0.55 + r() * 0.7;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + 4 + r() * 13, y + (r() - 0.5) * 2);
    c.stroke();
  }
  c.restore();
}
export class Pencil {
  constructor(c, variant = 0) {
    this.c = c;
    this.variant = variant;
    this.serial = 0;
  }
  shape(knots, color, opts = {}) {
    const p = opts.angular
        ? knots
        : curvePoints(knots, { closed: true, steps: 10 }),
      seed = opts.seed || ++this.serial * 47;
    if (color)
      wax(this.c, p, color, {
        seed,
        density: opts.density || 1,
        angle: opts.angle ?? -0.68,
        base: opts.base ?? 0.16,
        shadow: opts.shadow,
      });
    if (opts.paper) {
      this.c.save();
      this.c.globalAlpha = opts.paper;
      this.c.fillStyle = palette.paper;
      trace(this.c, p);
      this.c.fill();
      this.c.restore();
    }
    penLine(this.c, p, {
      variant: this.variant,
      seed,
      width: opts.width || 1.6,
      color: opts.outline || palette.ink,
      boil: opts.boil ?? 0.4,
    });
    if (opts.double)
      penLine(this.c, p, {
        variant: (this.variant + 1) % 3,
        seed: seed + 12,
        width: 0.65,
        alpha: 0.33,
        boil: 0.7,
      });
    return p;
  }
  oval(x, y, rx, ry, color, opts = {}) {
    const p = ellipsePoints(x, y, rx, ry, opts.seed || this.serial),
      seed = opts.seed || ++this.serial * 37;
    if (color)
      wax(this.c, p, color, {
        seed,
        base: opts.base ?? 0.16,
        density: opts.density || 1,
        angle: opts.angle ?? -0.68,
      });
    penLine(this.c, p, {
      variant: this.variant,
      seed,
      width: opts.width || 1.5,
      color: opts.outline || palette.ink,
      boil: opts.boil ?? 0.3,
    });
    return p;
  }
  line(points, opts = {}) {
    curve(this.c, points, {
      variant: this.variant,
      seed: ++this.serial * 59,
      ...opts,
    });
  }
  dot(x, y, r, color = palette.ink) {
    const c = this.c;
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, r, r * 0.94, 0, 0, Math.PI * 2);
    c.fill();
  }
}

/** Artwork is rasterized once per contour drawing, at 2–4× resolution.
 * Animation selects a drawing and moves parts; it does not regenerate texture. */
export class InkSprite {
  constructor(
    w,
    h,
    draw,
    { pivot = [w / 2, h / 2], seed = 1, variants = 3 } = {},
  ) {
    this.w = w;
    this.h = h;
    this.pivot = pivot;
    this.seed = seed;
    // Observation zoom needs genuine stroke resolution, especially on HiDPI.
    const rasterScale = w <= 280 && h <= 280 ? 4 : 2;
    this.frames = Array.from({ length: variants }, (_, v) => {
      const canvas = document.createElement("canvas");
      canvas.width = w * rasterScale;
      canvas.height = h * rasterScale;
      const c = canvas.getContext("2d");
      c.scale(rasterScale, rasterScale);
      c.translate(...pivot);
      draw(new Pencil(c, v), c, v);
      return canvas;
    });
  }
  draw(
    c,
    x,
    y,
    { time = 0, scale = 1, angle = 0, reduced = false, alpha = 1, frame } = {},
  ) {
    const v = frame ?? boilFrame(time, this.seed, reduced);
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.scale(scale, scale);
    c.globalAlpha *= alpha;
    c.drawImage(
      this.frames[v % this.frames.length],
      -this.pivot[0],
      -this.pivot[1],
      this.w,
      this.h,
    );
    c.restore();
  }
}
