import { Scene } from "../engine/scene.js";
import { InkSprite } from "../engine/sprite.js";
import { HandLabel } from "../engine/label.js";
import { InkTransition } from "../engine/ink.js";
import { penLine, boilFrame } from "../engine/pencil.js";
import { Spring, Blink } from "../engine/motion.js";
import { Flicker } from "../engine/flicker.js";
import { Camera } from "../engine/camera.js";
import { StepState } from "../engine/steps.js";
import { P, mix, edge } from "../engine/palette.js";
import { roundedPolygon, catmull, clamp, ellipsePts } from "../engine/geom.js";
import { rng } from "../engine/rng.js";
import { layoutText } from "../engine/writing.js";
import { roomById, STORY, LABELS } from "../content/rooms.js";

export const W = 1280,
  H = 800;
// One-point perspective room: back wall rectangle, floor and side walls converge on VP.
export const SEAM = 476;
export const VP = [640, 300];
export const BACK = { x0: 110, x1: 1170, y0: 40 };
export const FLOOR = { y0: SEAM, y1: H };
export const THEME = { honey: P.honey, rose: P.rose, yellow: P.yellow, green: P.green, plum: P.plum, blue: P.blue, wood: P.wood };

/** x where the floor line through (xBack, SEAM) reaches height y. */
export const floorX = (xBack, y) => VP[0] + ((xBack - VP[0]) * (y - VP[1])) / (SEAM - VP[1]);
/** Same line on a side wall: height at x of the line through (xb, y) toward VP. */
const sideY = (xb, y, x) => y + ((x - xb) * (y - VP[1])) / (xb - VP[0]);
export const floorShift = (cam, y) => cam.shift(Camera.floorDepth(y, FLOOR.y0, FLOOR.y1));
/** Apparent size of something standing on the floor at y (1 at y = 650). */
export const perspective = (y) => (y - VP[1]) / 350;

export function bakeWall(theme, decorate, seed = 5) {
  const wall = mix(P.paper, theme, 0.2),
    side = mix(wall, "#5a4030", 0.1),
    ceil = mix(P.paper, theme, 0.3);
  const { x0, x1, y0 } = BACK,
    rail = 360;
  return new InkSprite(
    W,
    SEAM + 44,
    (p, c) => {
      p.shape([[-4, -16], [x0, y0], [x1, y0], [W + 4, -16]], ceil, { angular: true, base: 0.4, density: 0.5, shade: 0, width: 1.1, angle: 0.1 });
      p.shape([[x0, y0], [x1, y0], [x1, SEAM], [x0, SEAM]], wall, { angular: true, base: 0.42, density: 0.4, shade: 0.12, width: 1.3, angle: -1.25, lightDir: [0.2, -0.98] });
      p.shape([[-4, -16], [x0, y0], [x0, SEAM], [-4, sideY(x0, SEAM, -4)]], side, { angular: true, base: 0.46, density: 0.5, shade: 0.2, width: 1.2, angle: -0.4 });
      p.shape([[W + 4, -16], [x1, y0], [x1, SEAM], [W + 4, sideY(x1, SEAM, W + 4)]], side, { angular: true, base: 0.46, density: 0.5, shade: 0.2, width: 1.2, angle: 0.4 });
      const e = edge(wall);
      p.line([[x0, rail], [x1, rail]], { color: e, width: 1.5, straight: true, taper: false });
      p.line([[x0, rail + 8], [x1, rail + 8]], { color: e, width: 0.8, straight: true, taper: false, alpha: 0.6 });
      p.line([[0, sideY(x0, rail, 0)], [x0, rail]], { color: e, width: 1.3, straight: true, taper: false });
      p.line([[W, sideY(x1, rail, W)], [x1, rail]], { color: e, width: 1.3, straight: true, taper: false });
      for (let x = x0 + 22; x + 124 < x1; x += 148)
        p.fillPath(roundedPolygon([[x, rail + 24], [x + 124, rail + 24], [x + 124, SEAM - 28], [x, SEAM - 28]], 4), null, { width: 0.9, outline: e, boil: 0.3 });
      p.shape([[x0, SEAM - 16], [x1, SEAM - 16], [x1, SEAM], [x0, SEAM]], P.woodLight, { angular: true, base: 0.5, density: 0.8, shade: 0.25, width: 1.1 });
      decorate?.(p, c, { wall });
    },
    { pivot: [0, 0], variants: 2, seed },
  );
}

export function bakeFloor(theme, { seed = 9, rug = { x: 440, y: 655, rx: 330, ry: 74 } } = {}) {
  const h = H - SEAM + 8,
    wood = mix(P.woodLight, P.paper, 0.38),
    yL = sideY(BACK.x0, SEAM, -4) - SEAM,
    r = rng(seed);
  return new InkSprite(
    W,
    h,
    (p, c) => {
      p.shape([[BACK.x0, 0], [BACK.x1, 0], [W + 4, yL], [W + 4, h], [-4, h], [-4, yL]], wood, {
        angular: true,
        base: 0.45,
        density: 0.55,
        shade: 0.1,
        outlineAlpha: 0,
        double: false,
        angle: 0.12,
        lightDir: [0, -1],
      });
      const seam = edge(wood),
        n = 20,
        xs = Array.from({ length: n + 1 }, (_, i) => BACK.x0 + ((BACK.x1 - BACK.x0) * i) / n);
      for (const xb of xs) p.line([[xb, 0], [floorX(xb, SEAM + h), h]], { color: seam, width: 0.9, straight: true, taper: false, alpha: 0.5, boil: 0.2 });
      // Board ends at perspective-spaced rows, staggered between neighbours.
      const rows = [24, 56, 99, 162, 264];
      for (let i = 0; i < n; i++)
        rows.forEach((ry, k) => {
          if ((i + k) % 2 || r() < 0.25) return;
          const y = SEAM + ry;
          p.line([[floorX(xs[i], y), ry], [floorX(xs[i + 1], y), ry]], { color: seam, width: 0.8, straight: true, taper: false, alpha: 0.45, boil: 0.2 });
        });
      const g = c.createLinearGradient(0, 0, 0, 30);
      g.addColorStop(0, "rgba(70,48,28,.2)");
      g.addColorStop(1, "rgba(70,48,28,0)");
      c.fillStyle = g;
      c.fillRect(BACK.x0, 0, BACK.x1 - BACK.x0, 30);
      if (rug) {
        const rc = mix(theme, P.paper, 0.42),
          ry = rug.y - SEAM;
        p.oval(rug.x, ry, rug.rx, rug.ry, rc, { shade: 0.28, density: 0.85, angle: 0.06, lightDir: [0, -1] });
        p.oval(rug.x, ry, rug.rx - 20, rug.ry - 9, null, { width: 1.1, outline: edge(rc) });
        p.oval(rug.x, ry, rug.rx - 30, rug.ry - 14, null, { width: 0.7, outline: edge(rc), outlineAlpha: 0.6 });
      }
    },
    { pivot: [0, 0], variants: 2, seed },
  );
}

/** Floor drawn through a shear so its far edge stays put and its near edge follows the camera. */
export function drawFloor(c, sprite, cam, opts) {
  const a = cam.shift(0.35),
    b = cam.shift(1),
    span = FLOOR.y1 - FLOOR.y0,
    kx = (b.x - a.x) / span,
    ky = (b.y - a.y) / span;
  c.save();
  c.transform(1, 0, kx, 1 + ky, a.x - kx * FLOOR.y0, a.y - ky * FLOOR.y0);
  sprite.draw(c, 0, FLOOR.y0, opts);
  c.restore();
}

export function bakeLamp(theme, seed = 11) {
  return new InkSprite(
    90,
    150,
    (p) => {
      p.line([[0, 0], [0.6, 40], [0, 84]], { color: P.inkDeep, width: 1.2 });
      p.shape([[-11, 84], [11, 84], [33, 120], [-33, 120]], theme, { angular: true, shade: 0.45, light: true, width: 1.4 });
      p.oval(0, 124, 9, 7, P.fatLight, { shade: 0, base: 0.6, width: 1 });
    },
    { pivot: [45, 2], variants: 3, seed },
  );
}

/** Soft floor shadow; shrinks and lightens when the owner leaves the ground. */
export function shadow(c, x, y, rx, ry, { lift = 0, alpha = 1 } = {}) {
  const k = 1 / (1 + Math.abs(lift) / 90);
  c.save();
  c.globalAlpha *= 0.16 * k * alpha;
  c.fillStyle = "#4a3020";
  c.beginPath();
  c.ellipse(x, y, rx * (0.7 + 0.3 * k), ry * (0.7 + 0.3 * k), 0, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

const MOOD_SMILE = { happy: 1, calm: 0.45, worried: -0.55, sad: -0.9, surprised: 0, sleepy: 0.15, proud: 0.8 };

/**
 * A baked body plus a live face. The body boils at 8 Hz; breath, gaze, blink, hops and the
 * mouth are continuous so the character never freezes between drawings.
 */
export class Character {
  constructor({ sprite, face = {}, face2 = null, seed = 3, breathe = 0.016, mood = "happy" }) {
    this.sprite = sprite;
    this.face = { x: 0, y: -60, gap: 26, eye: 7, mouth: 10, my: 15, color: P.inkDeep, ...face };
    // Disaccharides have two rings, so two faces sharing one mood.
    this.face2 = face2 && { ...this.face, ...face2 };
    this.seed = seed;
    this.breathe = breathe;
    this.blink = new Blink(seed);
    this.hopY = new Spring(0, { stiffness: 170, damping: 13 });
    this.squash = new Spring(0, { stiffness: 260, damping: 13 });
    this.lookX = new Spring(0, { stiffness: 50, damping: 11 });
    this.lookY = new Spring(0, { stiffness: 50, damping: 11 });
    this.smile = new Spring(MOOD_SMILE[mood], { stiffness: 80, damping: 13 });
    this.mood = mood;
    this.t = seed * 1.7;
  }
  setMood(m) {
    this.mood = m;
    this.smile.target = MOOD_SMILE[m] ?? 0.5;
  }
  hop(k = 1) {
    this.hopY.kick(-230 * k);
    this.squash.kick(5 * k);
  }
  wobble(k = 1) {
    this.squash.kick(7 * k);
  }
  look(dx, dy) {
    this.lookX.target = clamp(dx, -1, 1);
    this.lookY.target = clamp(dy, -1, 1);
  }
  get lift() {
    return Math.min(0, this.hopY.value);
  }
  update(dt, reduced) {
    this.t += dt;
    this.blink.update(dt);
    for (const s of [this.hopY, this.squash, this.lookX, this.lookY, this.smile]) s.update(dt, reduced);
  }
  draw(c, x, y, { progress = 1, time = 0, reduced = false, scale = 1, angle = 0, shadowR = 0, alpha = 1, frame } = {}) {
    if (progress <= 0) return;
    const breath = reduced ? 0 : Math.sin(this.t * 2.1) * this.breathe,
      sq = this.squash.value * 0.035,
      lift = this.lift;
    if (shadowR) shadow(c, x, y + 2, shadowR * scale, shadowR * scale * 0.22, { lift, alpha: progress });
    c.save();
    c.translate(x, y + lift);
    if (angle) c.rotate(angle);
    c.scale(scale * (1 - breath * 0.5 + sq), scale * (1 + breath - sq));
    if (alpha < 1) c.globalAlpha *= alpha;
    this.sprite().draw(c, 0, 0, { progress, time, reduced, frame });
    if (progress > 0.62) {
      this.drawFace(c, (progress - 0.62) / 0.38, time, reduced, this.face);
      if (this.face2) this.drawFace(c, (progress - 0.62) / 0.38, time, reduced, this.face2);
    }
    c.restore();
  }
  drawFace(c, p, time, reduced, f = this.face) {
    const v = boilFrame(time, this.seed, reduced),
      lx = this.lookX.value * f.eye * 0.5,
      ly = this.lookY.value * f.eye * 0.35,
      mood = this.mood,
      closed = this.blink.closed > 0.5 || mood === "sleepy";
    c.save();
    c.globalAlpha *= clamp(p * 1.5);
    for (const s of [-1, 1]) {
      const ex = f.x + (s * f.gap) / 2 + lx,
        ey = f.y + ly;
      if (closed) {
        penLine(c, catmull([[ex - f.eye * 0.8, ey], [ex, ey + f.eye * 0.4], [ex + f.eye * 0.8, ey]], { steps: 5 }), { color: f.color, width: 2, variant: v, seed: 3 + s, boil: 0.25, progress: p });
      } else {
        const ry = f.eye * (mood === "surprised" ? 1.15 : 1);
        c.fillStyle = f.color;
        c.beginPath();
        c.ellipse(ex, ey, f.eye * 0.74, ry, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#fffaf0";
        c.beginPath();
        c.ellipse(ex - f.eye * 0.22 + lx * 0.2, ey - ry * 0.38, f.eye * 0.22, f.eye * 0.24, 0, 0, Math.PI * 2);
        c.fill();
      }
      if (mood === "worried" || mood === "sad")
        penLine(c, [[ex - s * f.eye * 0.9, ey - f.eye * 1.55], [ex + s * f.eye * 0.6, ey - f.eye * 2.05]], { color: f.color, width: 1.6, variant: v, seed: 9 + s, progress: p, taper: false });
      if (mood === "surprised")
        penLine(c, catmull([[ex - f.eye * 0.8, ey - f.eye * 1.9], [ex, ey - f.eye * 2.3], [ex + f.eye * 0.8, ey - f.eye * 1.9]], { steps: 4 }), { color: f.color, width: 1.4, variant: v, seed: 12 + s, progress: p });
    }
    const mx = f.x + lx * 0.6,
      my = f.y + f.my + ly * 0.5,
      sm = this.smile.value,
      m = f.mouth;
    if (mood === "surprised") {
      penLine(c, ellipsePts(mx, my + 2, m * 0.35, m * 0.42, 14, 0.04, v), { color: f.color, width: 1.8, variant: v, seed: 21, progress: p, taper: false });
    } else {
      penLine(c, catmull([[mx - m, my - sm * 1.5], [mx, my + sm * m * 0.55], [mx + m, my - sm * 1.5]], { steps: 6 }), { color: f.color, width: 1.9, variant: v, seed: 23, progress: p });
    }
    c.restore();
  }
}

/** Speech bubble: the outline follows the reveal, the words write and erase by hand. */
export class Bubble {
  constructor({ size = 19, maxWidth = 270, color = P.inkDeep, dir = 1 } = {}) {
    this.label = new HandLabel(" ", { size, maxWidth, color, width: 0.066 });
    this.vis = new InkTransition({ writeSeconds: 0.35, eraseSeconds: 0.25 });
    this.bw = new Spring(90, { stiffness: 110, damping: 16 });
    this.bh = new Spring(46, { stiffness: 110, damping: 16 });
    this.dir = dir;
  }
  say(text, reduced) {
    this.vis.setVisible(true, reduced);
    const l = this.label;
    if (l.ink.progress <= 0.001 && l.pending === null) {
      l.set(text, reduced);
      l.show(reduced);
    } else l.set(text, reduced);
  }
  hide(reduced) {
    this.vis.setVisible(false, reduced);
    this.label.hide(reduced);
  }
  update(dt, reduced) {
    this.vis.update(dt);
    this.label.update(dt);
    this.bw.target = Math.max(70, this.label.boxWidth + 34);
    this.bh.target = Math.max(40, this.label.boxHeight + 22);
    this.bw.update(dt, reduced);
    this.bh.update(dt, reduced);
  }
  get writing() {
    return this.label.writing;
  }
  get erasing() {
    return this.label.erasing;
  }
  draw(c, ax, ay, { progress = 1, time = 0, reduced = false, dir = this.dir } = {}) {
    const p = Math.min(progress, this.vis.progress);
    if (p <= 0) return;
    const w = this.bw.value,
      h = this.bh.value;
    let x0 = dir > 0 ? ax + 16 : ax - 16 - w;
    x0 = clamp(x0, 16, W - w - 16);
    const y0 = ay - 26 - h;
    const box = roundedPolygon([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], 15, 4);
    const tx = clamp(ax + dir * 26, x0 + 18, x0 + w - 18);
    const v = boilFrame(time, 7, reduced);
    c.save();
    c.globalAlpha *= clamp(p * 2);
    c.fillStyle = "#fbf6ea";
    c.beginPath();
    box.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(tx - 9, y0 + h - 1);
    c.lineTo(ax, ay - 4);
    c.lineTo(tx + 9, y0 + h - 1);
    c.fill();
    c.restore();
    penLine(c, box, { color: P.ink, width: 1.3, variant: v, seed: 5, progress: p, boil: 0.4 });
    penLine(c, [[tx - 9, y0 + h], [ax, ay - 4], [tx + 9, y0 + h]], { color: P.ink, width: 1.2, variant: v, seed: 6, progress: p, taper: false });
    this.label.draw(c, x0 + 17, y0 + 11, { progress });
  }
}

/** Prev/next pen marks with step dots; arrow keys follow the same path. */
export class StepPager {
  constructor(scene, count, { x, y, color = P.teal, onChange }) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.color = color;
    this.state = new StepState(count, (i, from) => onChange(i, from));
    const L = LABELS.common,
      gap = 30 + count * 11;
    this.prev = scene.control({ id: `${scene.id}-prev`, label: L.prev, hint: L.prev, mark: "prev", x: x - gap, y, scale: 0.52, labelAt: "left", w: 56, h: 48, onClick: () => this.state.prev() });
    this.next = scene.control({ id: `${scene.id}-next`, label: L.next, hint: L.next, mark: "next", x: x + gap, y, scale: 0.52, labelAt: "right", w: 56, h: 48, onClick: () => this.state.next() });
    this.dot = new Spring(0, { stiffness: 120, damping: 15 });
  }
  reset() {
    this.state.index = 0;
    this.dot.snap(0);
    this.sync();
  }
  sync() {
    this.prev.setDisabled(this.state.atStart);
    this.next.setDisabled(this.state.atEnd);
  }
  update(dt, reduced) {
    this.dot.target = this.state.index;
    this.dot.update(dt, reduced);
  }
  draw(c, { progress = 1, time = 0, reduced = false }) {
    if (progress <= 0) return;
    const n = this.state.count,
      v = boilFrame(time, 4, reduced);
    for (let i = 0; i < n; i++) {
      const cx = this.x + (i - (n - 1) / 2) * 22;
      penLine(c, ellipsePts(cx, this.y, 5, 5, 14, 0.06, i), { color: P.ink, width: 1.2, variant: v, seed: 40 + i, progress, taper: false });
    }
    const cx = this.x + (this.dot.value - (n - 1) / 2) * 22;
    c.save();
    c.globalAlpha *= progress;
    c.fillStyle = this.color;
    c.beginPath();
    c.ellipse(cx, this.y, 4.2, 4, 0.3, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
}

/** A sprite baked in stage coordinates over the box (x0, y0, w, h); draw it with drawAbs. */
export function absSprite(x0, y0, w, h, draw, opts = {}) {
  const s = new InkSprite(
    w,
    h,
    (p, c, v) => {
      c.translate(-x0, -y0);
      draw(p, c, v);
    },
    { pivot: [0, 0], ...opts },
  );
  s.at = [x0, y0];
  return s;
}
export const drawAbs = (c, s, opts = {}, o = { x: 0, y: 0 }) => s.draw(c, s.at[0] + o.x, s.at[1] + o.y, opts);

/** Room action buttons sit in one row on the front floor. */
export const ROW_Y = 742;
export const rowX = (i) => 150 + i * 112;

/** Width of a handwritten string in px, for sizing tags around it before drawing. */
export const textWidth = (text, size) => layoutText(text).width * size;

/** Inside a bake: a small paper or wood tag with handwriting centred at x, top at y. */
export function plaque(p, x, y, text, { size = 16, color = P.inkDeep, fill = P.milk, pad = 9, pin = false, shadeAmt = 0.15 } = {}) {
  const w = textWidth(text, size) + pad * 2,
    h = size * 1.3 + 8;
  p.shape([[x - w / 2, y], [x + w / 2, y + 1], [x + w / 2 + 1, y + h], [x - w / 2 - 1, y + h - 1]], fill, { angular: true, shade: shadeAmt, base: 0.35, density: 0.6, width: 1.1 });
  if (pin) p.dot(x, y + 3, 3, P.red);
  p.write(text, x, y + 4 + (pin ? 3 : 0), { size, align: "center", color });
  return { w, h };
}

/** Small molecule tokens that ride streams. Topology kept: carbon count and key groups. */
export function tokenSprite(kind, seed = 1) {
  const bead = (p, x, y, r, col) => p.oval(x, y, r, r * 0.92, col, { shade: 0.35, width: 1, double: false });
  const draw = {
    // lactate / pyruvate / alanine: three carbons; the middle group tells them apart
    lac: (p) => {
      [-11, 0, 11].forEach((x, i) => bead(p, x, 0, 6.5, i === 2 ? P.rose : mix(P.rose, P.cream, 0.35)));
      p.dot(0, -10, 3, P.blue);
    },
    pyr: (p) => {
      [-11, 0, 11].forEach((x, i) => bead(p, x, 0, 6.5, i === 2 ? P.orange : mix(P.orange, P.cream, 0.4)));
      p.line([[0, -6], [0, -13]], { color: P.red, width: 1.4, straight: true });
      p.dot(0, -15, 3, P.red);
    },
    ala: (p) => {
      [-11, 0, 11].forEach((x, i) => bead(p, x, 0, 6.5, i === 2 ? P.green : mix(P.green, P.cream, 0.45)));
      p.dot(0, -10, 3.4, P.blue);
      p.dot(3, -13, 1.6, P.blue);
    },
    gly: (p) => {
      [-11, 0, 11].forEach((x) => bead(p, x, 0, 6, P.fatLight));
      [-11, 0, 11].forEach((x) => p.dot(x, -10, 2.6, P.blue));
    },
    glc: (p) => {
      const hex = Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * Math.PI * 2) * 11, Math.sin((i / 6) * Math.PI * 2) * 7]);
      p.shape(hex, P.yellow, { angular: true, shade: 0.3, width: 1.2, double: false });
      p.dot(hex[5][0], hex[5][1], 2.6, P.red);
    },
    ffa: (p) => {
      const pts = Array.from({ length: 8 }, (_, i) => [-24 + i * 6.5, i % 2 ? -3 : 3]);
      p.line(pts, { color: P.honey, width: 3.2, straight: true, taper: false });
      p.oval(26, 0, 5, 4.5, P.red, { shade: 0.2, width: 0.9, double: false });
    },
    ket: (p) => {
      bead(p, -6, 0, 7, P.plum);
      bead(p, 6, -1, 7, mix(P.plum, P.rose, 0.35));
      p.dot(6, -10, 2.4, P.red);
    },
    acetone: (p) => {
      bead(p, 0, 0, 6, P.faint);
      p.dot(0, -9, 2.4, P.red);
    },
    urate: (p) => {
      p.shape([[-8, 4], [-2, -8], [8, -6], [9, 5], [0, 8]], P.yellow, { angular: true, shade: 0.4, width: 1, double: false });
    },
    drop: (p) => {
      p.shape([[0, -11], [6, -1], [5, 6], [0, 8], [-5, 6], [-6, -1]], P.glass, { shade: 0.2, width: 1, double: false });
    },
  }[kind];
  return new InkSprite(64, 44, (p) => draw(p), { pivot: [32, 26], seed, variants: 3 });
}

/**
 * Option chip: a crayon tag that lifts and tilts under the pointer and fills when chosen.
 * Its own words are handwritten inside; the control's hint writes in on hover.
 */
export class Chip {
  constructor(scene, { id, label, text, hint, x, y, w = 98, h = 46, color = P.teal, isOn = () => false, onClick, icon = null, size = 18, labelAt = "below" }) {
    Object.assign(this, { scene, w, h, color, icon });
    this.text = new HandLabel(text, { size, color: P.inkDeep, align: "center", width: 0.068 });
    this.text.ink.snap(true);
    this.seed = id.length * 13 + 5;
    this.ctl = scene.control({ id, label, hint: hint ?? " ", x, y, w, h, labelAt, art: (c, o) => this.draw(c, o), isOn, onClick });
    this.ctl.label.ink.snap(false);
    this.on = new Spring(0, { stiffness: 160, damping: 14 });
    this.flick = new Flicker(3, { seed: this.seed });
  }
  bake() {
    if (this.off) return;
    const { w, h } = this,
      box = roundedPolygon([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], 10, 4);
    this.off = new InkSprite(w + 16, h + 16, (p, c, v) => {
        p.fillPath([...box, box[0]], mix(P.milk, this.color, 0.08), { shade: 0.15, base: 0.45, density: 0.6, width: 1.3 });
        // each draft re-sketches its shading, so the idle alternation reads as a living page
        const sh = [0, 1, -0.8][v];
        for (let k = 0; k < 4; k++) p.line([[-w / 2 + 12 + k * 8 + sh * 2, h / 2 - 8 - sh], [-w / 2 + 19 + k * 8 + sh * 2, h / 2 - 15 + sh]], { color: edge(this.color), width: 0.9, alpha: 0.6, straight: true, taper: false });
        p.line([[w / 2 - 22 - sh * 2, -h / 2 + 8], [w / 2 - 12, -h / 2 + 9 + sh]], { color: this.color, width: 1.6, alpha: 0.8 });
      }, { seed: this.seed });
    this.onArt = new InkSprite(
      w + 16,
      h + 16,
      (p) => {
        p.fillPath([...box, box[0]], mix(this.color, P.paper, 0.3), { shade: 0.3, light: true, width: 1.8 });
        p.line([[-w / 2 + 12, h / 2 - 6], [w / 2 - 12, h / 2 - 7]], { color: edge(this.color), width: 2, straight: true });
      },
      { seed: this.seed + 1 },
    );
  }
  setText(t, reduced) {
    this.text.set(t, reduced);
  }
  update(dt, reduced) {
    this.text.update(dt);
    this.on.target = this.ctl.isOn?.() ? 1 : 0;
    this.on.update(dt, reduced);
  }
  draw(c, { x, y, hover, progress, time, reduced }) {
    if (progress <= 0 || !this.off) return;
    const k = this.on.value,
      lift = -hover * 5 - k * 2,
      tilt = reduced ? 0 : hover * 0.035 * Math.sin(time * 5.5) + (k - 0.5) * 0.012;
    shadow(c, x, y + this.h / 2 + 6, this.w * 0.42, 6, { lift: -lift * 6, alpha: progress });
    c.save();
    c.translate(x, y + lift);
    c.rotate(tilt);
    c.scale(1 + hover * 0.04, 1 + hover * 0.04);
    const fr = this.flick.at(time, { rate: 1 + hover * 1.8, reduced });
    this.off.draw(c, 0, 0, { progress, time, reduced, alpha: 1 - k * 0.999, frame: fr });
    if (k > 0.001) this.onArt.draw(c, 0, 0, { progress, time, reduced, alpha: k, frame: fr });
    const ix = this.icon ? -this.w / 2 + 22 : 0;
    this.icon?.(c, { x: ix, y: 0, hover, on: k, progress, time, reduced, state: fr });
    this.text.draw(c, this.icon ? 17 : 0, -this.text.size * 0.62, { progress });
    c.restore();
  }
}

/** Pen-drawn rounded rectangle used for cards, tags and gauges drawn live. */
export function penBox(c, x, y, w, h, { r = 10, color = P.ink, width = 1.3, progress = 1, time = 0, reduced = false, seed = 1, fill = null, fillAlpha = 1 } = {}) {
  const box = roundedPolygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], r, 4);
  if (fill) {
    c.save();
    c.globalAlpha *= fillAlpha * clamp(progress * 1.4);
    c.fillStyle = fill;
    c.beginPath();
    box.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
    c.closePath();
    c.fill();
    c.restore();
  }
  penLine(c, box, { color, width, variant: boilFrame(time, seed, reduced), seed, progress, boil: 0.4, taper: false });
}

/** Base for the seven rooms: wall + floor + lamp, a character with speech, steps and notes. */
export class RoomScene extends Scene {
  constructor(app, id, { lampX = 300, rug, decorate } = {}) {
    super(app, id);
    this.room = roomById(id);
    this.theme = THEME[this.room.color];
    this.title = this.room.title;
    this.story = STORY[id];
    this.lampX = lampX;
    this.rug = rug;
    this.decorate = decorate;
    this.releaseOnLeave = true;
    this.titleLabel = new HandLabel(this.room.title, { size: 27, color: P.inkDeep, width: 0.07 });
    this.bubble = new Bubble({ size: 19, maxWidth: 250 });
    this.notePanel({ x: 1062, y: 414, w: 372, h: 580, seed: id.length * 7 + 3 });
    this.pager = new StepPager(this, this.story.length, { x: 1062, y: 752, color: this.theme, onChange: (i) => this.applyStep(i) });
    this.step = 0;
    this.stepState = this.story[0].state;
    this.chips = [];
    this.inks = [];
  }
  get L() {
    return LABELS[this.id];
  }
  chip(opts) {
    const ch = new Chip(this, opts);
    this.chips.push(ch);
    return ch;
  }
  /** An ink envelope updated with the room; for parts that write in and erase on state changes. */
  ink(writeSeconds = 0.8, eraseSeconds = 0.4) {
    const k = new InkTransition({ writeSeconds, eraseSeconds });
    this.inks.push(k);
    return k;
  }
  /** A handwritten label that the room keeps updated. */
  label(text, opts) {
    const l = new HandLabel(text, opts);
    l.ink.snap(true);
    this.inks.push(l);
    return l;
  }
  bakeJobs() {
    return [
      () => (this.s.wall = bakeWall(this.theme, this.decorate, this.id.length * 13 + 1)),
      () => (this.s.floor = bakeFloor(this.theme, { seed: this.id.length * 5 + 2, rug: this.rug })),
      () => (this.s.lamp = bakeLamp(this.theme, this.id.length + 11)),
      () => this.chips.forEach((ch) => ch.bake()),
      ...(this.roomJobs?.() || []),
    ];
  }
  onEnter() {
    this.pager.reset();
    this.titleLabel.show(this.reduced);
    this.applyStep(0, true);
    this.notes.show(this.reduced);
    this.roomEnter?.();
  }
  applyStep(i, first = false) {
    const st = this.story[i];
    this.step = i;
    this.stepState = st.state;
    this.notes.setContent(st.note, this.reduced);
    this.bubble.say(st.say, this.reduced);
    this.pager.sync();
    if (!first) this.app.foley.play("paper", { strength: 0.35 });
    this.onStep?.(i, st.state, first);
    this.announce(`${this.room.title}，第 ${i + 1} 步：${st.say}`);
  }
  key(e) {
    if (!this.interactive) return;
    if (e.key === "ArrowRight") this.pager.state.next();
    else if (e.key === "ArrowLeft") this.pager.state.prev();
  }
  pointer(x, y) {
    this.pointerAt = x === null ? null : { x, y };
  }
  /** Character gaze: the pointer if present, otherwise an idle point of interest. */
  gaze(ch, x, y, idle = null) {
    const t = this.pointerAt || idle;
    if (t) ch.look((t.x - x) / 260, (t.y - y) / 220);
    else ch.look(this.reduced ? 0 : Math.sin(this.time * 0.4) * 0.3, 0.1);
  }
  update(dt) {
    super.update(dt);
    this.bubble.update(dt, this.reduced);
    this.titleLabel.update(dt);
    this.pager.update(dt, this.reduced);
    for (const ch of this.chips) ch.update(dt, this.reduced);
    for (const k of this.inks) k.update(dt);
    this.roomUpdate?.(dt);
  }
  get writing() {
    return super.writing || this.bubble.writing || this.titleLabel.writing || this.inks.some((k) => k.writing ?? k.active) || this.chips.some((ch) => ch.text.writing);
  }
  get erasing() {
    return super.erasing || this.bubble.erasing || this.inks.some((k) => k.erasing ?? (k.active && k.target === 0));
  }
  drawRoom(c) {
    const t = this.time,
      r = this.reduced,
      env = this.p("env");
    this.s.wall.draw(c, 0, 0, { progress: env, time: t, reduced: r });
    drawFloor(c, this.s.floor, this.cam, { progress: this.p("env", 0.25), time: t, reduced: r });
    if (this.lampX !== null) {
      const sway = r ? 0 : Math.sin(t * 0.9) * 0.035 + Math.sin(t * 0.37) * 0.015,
        lp = this.p("prop", -0.2);
      this.s.lamp.draw(c, this.lampX, BACK.y0 - 4, { progress: lp, time: t, reduced: r, angle: sway });
      if (lp > 0.6) this.drawGlow(c, this.lampX - Math.sin(sway) * 124, BACK.y0 + 118, (lp - 0.6) / 0.4);
    }
  }
  drawGlow(c, x, y, k) {
    const g = c.createRadialGradient(x, y, 4, x, y + 60, 230);
    g.addColorStop(0, "rgba(255,226,150,.30)");
    g.addColorStop(1, "rgba(255,226,150,0)");
    c.save();
    c.globalAlpha *= k;
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(x - 26, y);
    c.lineTo(x + 26, y);
    c.lineTo(x + 190, y + 330);
    c.lineTo(x - 190, y + 330);
    c.closePath();
    c.fill();
    // Dust drifting through the light.
    if (!this.reduced) {
      c.fillStyle = "#c79a4a";
      for (let i = 0; i < 14; i++) {
        const tt = this.time * (0.05 + (i % 5) * 0.012) + i * 0.37,
          fy = (tt % 1) * 300,
          fx = Math.sin(tt * 6.3 + i) * (30 + fy * 0.45);
        c.globalAlpha = k * 0.45 * Math.sin((tt % 1) * Math.PI);
        c.beginPath();
        c.arc(x + fx, y + 20 + fy, 1.1 + (i % 3) * 0.4, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();
  }
  drawChrome(c) {
    const t = this.time,
      r = this.reduced,
      lp = this.p("label"),
      sh = this.cam.shift(0.4);
    this.titleLabel.draw(c, 100, 24, { progress: lp });
    this.notes.draw(c, { progress: this.p("env", 0.3), labelProgress: lp, shift: sh });
    const a = this.bubbleAnchor?.();
    if (a) this.bubble.draw(c, a.x, a.y, { progress: lp, time: t, reduced: r, dir: a.dir ?? 1 });
    this.pager.draw(c, { progress: this.p("ui"), time: t, reduced: r });
    this.drawControls(c);
  }
  draw(c) {
    this.drawRoom(c);
    this.drawExhibit(c);
    this.drawChrome(c);
  }
}
