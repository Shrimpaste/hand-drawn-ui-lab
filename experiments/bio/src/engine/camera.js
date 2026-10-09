import { clamp } from "./geom.js";

/** Pointer-led parallax plus a dolly zoom. Drawing and hit testing share these numbers. */
export class Camera {
  constructor({ width = 1280, height = 800, amountX = 26, amountY = 12, tau = 0.45 } = {}) {
    this.width = width;
    this.height = height;
    this.amountX = amountX;
    this.amountY = amountY;
    this.tau = tau;
    this.px = this.py = 0;
    this.tx = this.ty = 0;
    this.zoom = { s: 1, cx: width / 2, cy: height / 2 };
  }
  point(nx, ny) {
    this.tx = clamp(nx, -1, 1);
    this.ty = clamp(ny, -1, 1);
  }
  leave() {
    this.tx = this.ty = 0;
  }
  update(dt, reduced = false) {
    if (reduced) {
      this.px = this.py = 0;
      return;
    }
    const k = 1 - Math.exp(-Math.max(0, dt) / this.tau);
    this.px += (this.tx - this.px) * k;
    this.py += (this.ty - this.py) * k;
  }
  setZoom(s, cx = this.width / 2, cy = this.height / 2) {
    this.zoom = { s, cx, cy };
  }
  /** depth 0 = far wall, 1 = nearest foreground. */
  shift(depth = 0.5) {
    const d = depth - 0.35;
    return {
      x: -this.px * this.amountX * d || 0,
      y: -this.py * this.amountY * d || 0,
    };
  }
  project(x, y, depth = 0.5) {
    const o = this.shift(depth),
      { s, cx, cy } = this.zoom;
    return { x: (x + o.x - cx) * s + cx, y: (y + o.y - cy) * s + cy };
  }
  unproject(sx, sy, depth = 0.5) {
    const o = this.shift(depth),
      { s, cx, cy } = this.zoom;
    return { x: (sx - cx) / s + cx - o.x, y: (sy - cy) / s + cy - o.y };
  }
  /** Depth of a point lying on a floor whose far edge is at y0 and near edge at y1. */
  static floorDepth(y, y0, y1) {
    return 0.35 + clamp((y - y0) / (y1 - y0)) * 0.65;
  }
}
