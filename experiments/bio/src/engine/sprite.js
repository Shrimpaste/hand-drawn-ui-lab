import { Pencil, boilFrame } from "./pencil.js";
import { StrokeRecorder, decodeTime, TIME_LEVELS } from "./recorder.js";

let QUALITY = 2;
/** Raster density chosen once from the screen; sprites are baked at this resolution. */
export function setQuality(q) {
  QUALITY = Math.max(1.25, Math.min(3, q));
}

const canvas = (w, h) => {
  const el = document.createElement("canvas");
  el.width = Math.max(1, Math.ceil(w));
  el.height = Math.max(1, Math.ceil(h));
  return el;
};

/**
 * Artwork baked once into 1-3 contour drawings plus a stroke-time map.
 * Playback picks a drawing (boil) and reveals pixels by the time they were drawn.
 */
export class InkSprite {
  constructor(w, h, draw, { pivot = [w / 2, h / 2], seed = 1, variants = 3, maxReveal = 900 } = {}) {
    this.w = w;
    this.h = h;
    this.pivot = pivot;
    this.seed = seed;
    const big = Math.max(w, h);
    const raster = big > 700 ? Math.min(QUALITY, 2) : big > 360 ? Math.min(QUALITY, 2.5) : QUALITY;
    const rs = Math.min(raster, maxReveal / big, 2);
    this.revealScale = rs;
    const timing = canvas(w * rs, h * rs);
    const tc = timing.getContext("2d", { willReadFrequently: true });
    tc.scale(rs, rs);
    tc.translate(pivot[0], pivot[1]);
    this.frames = [];
    for (let v = 0; v < variants; v++) {
      const cv = canvas(w * raster, h * raster),
        color = cv.getContext("2d");
      color.scale(raster, raster);
      color.translate(pivot[0], pivot[1]);
      const recorder = v === 0 ? new StrokeRecorder(color) : null;
      const ctx = recorder ? recorder.context : color;
      draw(new Pencil(ctx, v), ctx, v);
      if (recorder) recorder.replay(tc);
      this.frames.push(cv);
    }
    this.buildReveal(timing, tc);
  }
  buildReveal(timing, tc) {
    const W = timing.width,
      H = timing.height,
      n = W * H;
    const t = tc.getImageData(0, 0, W, H).data;
    // Counting sort of pixel indices by stroke time so reveal steps only touch new pixels.
    const counts = new Uint32Array(TIME_LEVELS + 1),
      times = new Uint16Array(n);
    for (let i = 0; i < n; i++) {
      const v = t[i * 4 + 3] ? decodeTime(t[i * 4], t[i * 4 + 1]) : TIME_LEVELS;
      times[i] = v;
      counts[v]++;
    }
    const starts = new Uint32Array(TIME_LEVELS + 2);
    for (let v = 0; v <= TIME_LEVELS; v++) starts[v + 1] = starts[v] + counts[v];
    const order = new Uint32Array(n),
      fill = starts.slice(0, TIME_LEVELS + 1);
    for (let i = 0; i < n; i++) order[fill[times[i]]++] = i;
    this.order = order;
    this.starts = starts;
    this.revealCanvas = canvas(W, H);
    this.revealCtx = this.revealCanvas.getContext("2d");
    this.revealCtx.drawImage(this.frames[0], 0, 0, W, H);
    this.source = this.revealCtx.getImageData(0, 0, W, H);
    this.out = this.revealCtx.createImageData(W, H);
    this.shownLevel = 0;
  }
  /** Bring the reveal raster to `level` time levels, touching only the changed pixels. */
  setLevel(level) {
    if (level === this.shownLevel) return;
    const src = this.source.data,
      dst = this.out.data,
      o = this.order;
    if (level > this.shownLevel) {
      for (let k = this.starts[this.shownLevel]; k < this.starts[level]; k++) {
        const j = o[k] * 4;
        dst[j] = src[j];
        dst[j + 1] = src[j + 1];
        dst[j + 2] = src[j + 2];
        dst[j + 3] = src[j + 3];
      }
    } else {
      for (let k = this.starts[level]; k < this.starts[this.shownLevel]; k++) dst[o[k] * 4 + 3] = 0;
    }
    this.shownLevel = level;
    this.revealCtx.putImageData(this.out, 0, 0);
  }
  draw(c, x, y, { time = 0, frame, progress = 1, scale = 1, sx, sy, angle = 0, alpha = 1, reduced = false } = {}) {
    if (progress <= 0 || alpha <= 0) return;
    let img;
    if (progress < 1) {
      // 160 visible steps keep the hand's pace smooth without re-touching every pixel.
      const level = Math.round(Math.floor(progress * 160) / 160 * TIME_LEVELS);
      this.setLevel(Math.min(TIME_LEVELS, level));
      img = this.revealCanvas;
    } else {
      img = this.frames[(frame ?? boilFrame(time, this.seed, reduced)) % this.frames.length];
    }
    c.save();
    c.translate(x, y);
    if (angle) c.rotate(angle);
    c.scale(sx ?? scale, sy ?? scale);
    if (alpha < 1) c.globalAlpha *= alpha;
    c.drawImage(img, -this.pivot[0], -this.pivot[1], this.w, this.h);
    c.restore();
  }
}

/** Bake-on-first-use; scenes describe sprites as functions so rooms bake lazily. */
export function lazy(factory) {
  let s = null;
  return () => (s ||= factory());
}
