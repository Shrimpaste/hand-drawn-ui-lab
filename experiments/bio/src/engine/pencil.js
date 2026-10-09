import { rng } from "./rng.js";
import { catmull, ellipsePts, livingOffset, polyLength, partialPath, bounds } from "./geom.js";
import { P, edge, tint, shade as darken } from "./palette.js";
import { layoutText, drawWriting } from "./writing.js";

function trace(c, pts, closed = true) {
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  if (closed) c.closePath();
}

/** One pen stroke: living contour per variant, pressure that lands, swells and lifts. */
export function penLine(
  c,
  points,
  { variant = 0, seed = 1, width = 1.4, color = P.ink, alpha = 1, progress = 1, boil = 0.35, taper = true } = {},
) {
  if (progress <= 0 || points.length < 2) return;
  const p = livingOffset(points, variant, seed, boil);
  const shown = progress < 1 ? partialPath(p, polyLength(p) * progress) : p;
  const n = shown.length;
  c.save();
  c.globalAlpha *= alpha;
  c.strokeStyle = color;
  c.lineCap = "round";
  c.lineJoin = "round";
  for (let i = 0; i < n - 1; i += 4) {
    const seg = shown.slice(i, Math.min(n, i + 5)),
      t = i / Math.max(1, p.length - 1);
    const land = taper ? Math.min(1, 0.45 + t * 7) : 1,
      lift = taper ? 1 - Math.max(0, t - 0.86) * 2.4 : 1;
    c.lineWidth = width * land * lift * (0.88 + 0.16 * Math.sin(i * 0.31 + seed));
    trace(c, seg, false);
    c.stroke();
  }
  c.restore();
}

/**
 * Wax crayon fill: own paper backing, thin base wash, seeded directional strokes with
 * paper gaps, a shaded crescent away from the light, optional highlight, cross scumble.
 */
export function wax(
  c,
  contour,
  color,
  {
    seed = 1,
    density = 1,
    angle = -0.65,
    base = 0.2,
    shade = 0.35,
    shadeColor = null,
    light = false,
    paper = true,
    progress = 1,
    lightDir = [-0.62, -0.78],
  } = {},
) {
  if (progress <= 0) return;
  const r = rng(seed),
    a0 = c.globalAlpha,
    bb = bounds(contour),
    cx = bb.minX + bb.w / 2,
    cy = bb.minY + bb.h / 2,
    size = Math.min(bb.w, bb.h),
    extent = Math.hypot(bb.w, bb.h) / 2 + 4;
  c.save();
  trace(c, contour);
  c.clip();
  if (paper) {
    c.fillStyle = P.paper;
    c.fillRect(bb.minX - 2, bb.minY - 2, bb.w + 4, bb.h + 4);
  }
  c.globalAlpha = a0 * base;
  c.fillStyle = color;
  c.fillRect(bb.minX - 2, bb.minY - 2, bb.w + 4, bb.h + 4);

  const strokes = (col, alphaLo, alphaHi, gap, len, widthLo, widthHi, ang) => {
    c.save();
    c.translate(cx, cy);
    c.rotate(ang);
    c.strokeStyle = col;
    c.lineCap = "round";
    for (let row = -extent; row < extent; row += (gap * (0.7 + r() * 0.9)) / density) {
      if ((row + extent) / (2 * extent) > progress) break;
      const y = row + (r() - 0.5) * 1.5;
      for (let x = -extent + r() * 6; x < extent; ) {
        const span = len * (0.35 + r() * 0.9);
        c.globalAlpha = a0 * (alphaLo + r() * (alphaHi - alphaLo));
        c.lineWidth = widthLo + r() * (widthHi - widthLo);
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + span * 0.5, y + (r() - 0.5) * 2.2, x + span, y + (r() - 0.5) * 1.4);
        c.stroke();
        x += span + 1 + r() * 4;
      }
    }
    c.restore();
  };

  strokes(color, 0.42, 0.86, 1.25, 22, 0.75, 2.2, angle);

  if (shade > 0 && size > 6) {
    // Crescent = inside the contour but outside a copy shifted toward the light.
    const k = size * 0.2 * (0.6 + shade),
      sx = lightDir[0] * k,
      sy = lightDir[1] * k;
    c.save();
    c.beginPath();
    c.rect(bb.minX - 50, bb.minY - 50, bb.w + 100, bb.h + 100);
    c.moveTo(contour[0][0] + sx, contour[0][1] + sy);
    for (let i = 1; i < contour.length; i++) c.lineTo(contour[i][0] + sx, contour[i][1] + sy);
    c.closePath();
    c.clip("evenodd");
    strokes(shadeColor || darken(color, 0.32), 0.3 * shade + 0.2, 0.55 * shade + 0.35, 1.5, 16, 0.7, 1.8, angle + 0.35);
    c.restore();
  }
  if (light && size > 10) {
    c.save();
    c.beginPath();
    c.ellipse(cx + lightDir[0] * bb.w * 0.24, cy + lightDir[1] * bb.h * 0.24, bb.w * 0.2, bb.h * 0.14, -0.6, 0, Math.PI * 2);
    c.clip();
    strokes(tint(color, 0.62), 0.35, 0.7, 2.2, 10, 0.8, 1.6, angle - 0.2);
    c.restore();
  }
  // Sparse cross scumble in the edge pigment: texture, not outline.
  c.translate(cx, cy);
  c.rotate(angle + 0.9);
  c.strokeStyle = edge(color);
  const scumble = Math.min(160, bb.w * bb.h * 0.006 * density);
  for (let i = 0; i < scumble * progress; i++) {
    const x = (r() - 0.5) * extent * 2,
      y = (r() - 0.5) * extent * 2;
    c.globalAlpha = a0 * (0.1 + r() * 0.2);
    c.lineWidth = 0.5 + r() * 0.7;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + 3 + r() * 10, y + (r() - 0.5) * 2);
    c.stroke();
  }
  c.restore();
}

/** Drawing tool handed to sprite bakers. Every call is one recorded drawing element. */
export class Pencil {
  constructor(c, variant = 0) {
    this.c = c;
    this.variant = variant;
    this.serial = 0;
  }
  get rec() {
    return this.c.strokeRecorder;
  }
  nextSeed(s) {
    return s ?? ++this.serial * 53 + 7;
  }
  /** Closed shape: smooth by default, `angular` keeps corners. Outline first, then wax. */
  shape(knots, color, opts = {}) {
    const pts = opts.angular ? [...knots, knots[0]] : catmull(knots, { closed: true, steps: opts.steps || 10 });
    return this.fillPath(pts, color, opts);
  }
  fillPath(pts, color, opts = {}) {
    const seed = this.nextSeed(opts.seed);
    const len = polyLength(pts);
    this.rec?.begin(len * (color ? 2.2 : 1));
    if (color) {
      this.rec?.segment(0.35);
    }
    penLine(this.c, pts, {
      variant: this.variant,
      seed,
      width: opts.width ?? 1.5,
      color: opts.outline || (color ? edge(color) : P.ink),
      boil: opts.boil ?? 0.38,
      alpha: opts.outlineAlpha ?? 1,
    });
    if (color) {
      this.rec?.segment(1);
      wax(this.c, pts, color, { seed, ...opts });
      // A lighter second contour gives the pencil-on-pencil weight of the reference.
      if (opts.double !== false && opts.width !== 0)
        penLine(this.c, pts, {
          variant: (this.variant + 1) % 3,
          seed: seed + 11,
          width: (opts.width ?? 1.5) * 0.55,
          color: opts.outline || edge(color),
          alpha: 0.45,
          boil: (opts.boil ?? 0.38) * 1.6,
        });
    }
    return pts;
  }
  oval(cx, cy, rx, ry, color, opts = {}) {
    const pts = ellipsePts(cx, cy, rx, ry, Math.max(28, Math.round((rx + ry) * 1.2)), opts.wobble ?? 0.012, (opts.seed || this.serial) * 0.7);
    if (opts.rot) {
      const co = Math.cos(opts.rot),
        si = Math.sin(opts.rot);
      for (const p of pts) {
        const dx = p[0] - cx,
          dy = p[1] - cy;
        p[0] = cx + dx * co - dy * si;
        p[1] = cy + dx * si + dy * co;
      }
    }
    return this.fillPath(pts, color, opts);
  }
  line(knots, opts = {}) {
    const pts = opts.straight ? knots : catmull(knots, { steps: opts.steps || 9 });
    this.rec?.begin(polyLength(pts));
    penLine(this.c, pts, {
      variant: this.variant,
      seed: this.nextSeed(opts.seed),
      width: opts.width ?? 1.3,
      color: opts.color || P.ink,
      alpha: opts.alpha ?? 1,
      boil: opts.boil ?? 0.3,
      taper: opts.taper ?? true,
    });
    return pts;
  }
  dot(x, y, r, color = P.ink, alpha = 1) {
    this.rec?.begin(Math.max(2, r * 4));
    const c = this.c;
    c.save();
    c.globalAlpha *= alpha;
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, r, r * 0.93, 0.3, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  /** Hand-drawn arrow: shaft then a two-stroke head. */
  arrow(knots, opts = {}) {
    const pts = this.line(knots, opts);
    const a = pts.at(-1),
      b = pts[Math.max(0, pts.length - 4)],
      ang = Math.atan2(a[1] - b[1], a[0] - b[0]),
      s = opts.head ?? 9;
    for (const side of [-1, 1])
      this.line(
        [
          [a[0] - Math.cos(ang + side * 0.5) * s, a[1] - Math.sin(ang + side * 0.5) * s],
          [a[0], a[1]],
        ],
        { ...opts, straight: true, width: (opts.width ?? 1.3) * 1.05 },
      );
    return pts;
  }
  /** Parallel structure hatching clipped to a contour (not random dots). */
  hatch(contour, { color = P.ink, gap = 5, angle = 0.8, width = 0.7, alpha = 0.5, seed } = {}) {
    const c = this.c,
      bb = bounds(contour),
      r = rng(this.nextSeed(seed));
    this.rec?.begin(bb.w + bb.h);
    c.save();
    trace(c, contour);
    c.clip();
    c.translate(bb.minX + bb.w / 2, bb.minY + bb.h / 2);
    c.rotate(angle);
    const e = Math.hypot(bb.w, bb.h) / 2;
    c.strokeStyle = color;
    c.lineCap = "round";
    for (let y = -e; y < e; y += gap) {
      c.globalAlpha = alpha * (0.6 + r() * 0.4);
      c.lineWidth = width * (0.8 + r() * 0.4);
      c.beginPath();
      c.moveTo(-e, y + (r() - 0.5));
      c.quadraticCurveTo(0, y + (r() - 0.5) * 2, e, y + (r() - 0.5));
      c.stroke();
    }
    c.restore();
  }
  /** Handwriting baked into the drawing; strokes are recorded in pen order. */
  write(text, x, y, { size = 16, color = P.ink, align = "left", seed = 3, width = 0.065, maxWidth } = {}) {
    const l = layoutText(text, { seed, maxWidth });
    const c = this.c;
    this.rec?.begin(l.total * size * 0.8);
    drawWriting(c, l, { x, y, size, color, align, width });
    return l;
  }
}

export const boilFrame = (time, seed = 0, reduced = false) =>
  reduced ? 0 : [0, 1, 2, 1][Math.floor((time + seed * 0.0173) * 8) % 4];
