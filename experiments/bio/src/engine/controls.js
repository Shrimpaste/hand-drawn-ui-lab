import { penLine, boilFrame } from "./pencil.js";
import { catmull, polyLength } from "./geom.js";
import { InkTransition } from "./ink.js";
import { Spring } from "./motion.js";
import { HandLabel } from "./label.js";
import { P } from "./palette.js";

// Options are a few pen strokes. Each mark is a list of [color, width, knots] in a
// 60x60 box around 0,0. Hover changes the mark's pose; state stays visible.
function star(cx, cy, r) {
  return Array.from({ length: 11 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5,
      k = i % 2 ? r * 0.44 : r;
    return [cx + Math.cos(a) * k, cy + Math.sin(a) * k];
  });
}
const hex = (cx, cy, r) =>
  Array.from({ length: 7 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.62];
  });

const MARKS = {
  home: (h) => [
    [P.teal, 1.8, hex(0, 2 - h * 3, 22), true],
    [P.liver, 2.2, [[-2, 2 - h * 3], [2, 1 - h * 3], [1, 4 - h * 3], [-2, 2 - h * 3]], true],
    [P.blue, 1.2, [[-14, -6 - h * 3], [-5, -1 - h * 3]]],
    [P.blue, 1.2, [[14, 9 - h * 3], [5, 4 - h * 3]]],
  ],
  sound: (h, on) => [
    [P.teal, 1.9, [[-24, -9], [-10, -9], [8, -22], [8, 22], [-10, 9], [-24, 9], [-24, -9]], true],
    ...(on
      ? [0, 1].map((i) => [P.blue, 1.6, [[16 + i * 9, -12 - h * 3], [22 + i * 9 + h * 2, 0], [16 + i * 9, 12 + h * 3]]])
      : [[P.red, 2, [[16, -12], [33, 13]]]]),
  ],
  still: (h, on) => [
    [on ? P.honey : P.blue, 1.6, star(-18, 6 - (on ? h * 4 : 0), 9), true],
    [on ? P.honey : P.blue, 1.8, star(0, -6 - (on ? h * 6 : 0), 13), true],
    [on ? P.honey : P.blue, 1.6, star(18, 6 - (on ? h * 4 : 0), 9), true],
    ...(on ? [] : [[P.blue, 1.4, [[-14, 24], [14, 24]]]]),
  ],
  replay: (h) => [
    [P.honey, 1.5, [[-4 + h * 2, -24], [4 + h * 2, -24], [4 + h * 2, 12], [0 + h * 2, 22], [-4 + h * 2, 12], [-4 + h * 2, -24]], true],
    [P.red, 1.5, [[-4 + h * 2, -24], [-4 + h * 2, -30], [4 + h * 2, -30], [4 + h * 2, -24]]],
    [P.teal, 1.6, [[-12, 20], [-26, 12], [-27, -3], [-17, -13], [-8, -13]]],
    [P.teal, 1.6, [[-14, -19], [-7, -13], [-14, -7]]],
  ],
  next: (h) => [
    [P.teal, 2, [[-22 + h * 5, 1], [20 + h * 5, 0]]],
    [P.teal, 2, [[6 + h * 5, -12], [21 + h * 5, 0], [6 + h * 5, 12]]],
  ],
  prev: (h) => [
    [P.teal, 2, [[22 - h * 5, 1], [-20 - h * 5, 0]]],
    [P.teal, 2, [[-6 - h * 5, -12], [-21 - h * 5, 0], [-6 - h * 5, 12]]],
  ],
  close: (h) => [
    [P.red, 2, [[-14, -14 - h * 2], [14, 14 + h * 2]]],
    [P.red, 2, [[14, -14 - h * 2], [-14, 14 + h * 2]]],
  ],
  // Gate: a closed valve with a red cross for the patient, an open check for normal.
  gate: (h, on) => [
    [P.wood, 2, [[-20, 20], [-20, -16 - h * 2]]],
    [P.wood, 2, [[20, 20], [20, -16 - h * 2]]],
    ...(on
      ? [
          [P.wood, 1.8, [[-20, -2], [20, -2]]],
          [P.red, 2.2, [[-10, -14], [10, 10]]],
          [P.red, 2.2, [[10, -14], [-10, 10]]],
        ]
      : [
          [P.wood, 1.8, [[-20, -14 - h * 4], [-6, -24 - h * 4]]],
          [P.green, 2.2, [[-10, 2], [-3, 10], [12, -10]]],
        ]),
  ],
  drop: (h) => [
    [P.blue, 1.9, [[0, -24 - h * 3], [-12, -4], [-14, 8], [-7, 18], [7, 18], [14, 8], [12, -4], [0, -24 - h * 3]], true],
    [P.blueLight, 1.3, [[-6, 4], [-6, 11]]],
    [P.honey, 1.7, [[16, -14], [28, -14]]],
    [P.honey, 1.7, [[22, -20], [22, -8]]],
  ],
  play: (h) => [
    [P.teal, 2, [[-12, -18 - h * 2], [18 + h * 3, 0], [-12, 18 + h * 2], [-12, -18 - h * 2]], true],
  ],
  reset: (h) => [
    [P.teal, 1.8, Array.from({ length: 14 }, (_, i) => {
      const a = -0.5 + (i / 13) * 5.2 + h * 0.6;
      return [Math.cos(a) * 17, Math.sin(a) * 17];
    })],
    [P.teal, 1.8, [[13, -18], [16, -8], [6, -6]]],
  ],
  case: (h) => [
    [P.wood, 1.7, [[-17, -20 - h * 2], [17, -20 - h * 2], [17, 24], [-17, 24], [-17, -20 - h * 2]], true],
    [P.steel, 1.8, [[-7, -24 - h * 2], [7, -24 - h * 2], [7, -17 - h * 2], [-7, -17 - h * 2], [-7, -24 - h * 2]], true],
    [P.ink, 1.1, [[-10, -8], [10, -8]]],
    [P.ink, 1.1, [[-10, 1], [8, 1]]],
    [P.red, 1.3, [[-10, 10], [4, 10]]],
  ],
  feed: (h) => [
    [P.honey, 1.7, [[-11, -8 + h * 4], [-2, -14 + h * 4], [9, -10 + h * 4], [11, 2 + h * 4], [1, 8 + h * 4], [-10, 4 + h * 4], [-11, -8 + h * 4]], true],
    [P.orange, 1.6, Array.from({ length: 9 }, (_, i) => [-20 + Math.cos(i * 0.8) * 5, -16 + h * 4 + Math.sin(i * 0.8) * 5]), true],
    [P.orange, 1.6, Array.from({ length: 9 }, (_, i) => [20 + Math.cos(i * 0.8) * 5, 8 + h * 4 + Math.sin(i * 0.8) * 5]), true],
    [P.teal, 1.4, [[-4, 24], [0, 18 + h * 2], [4, 24]]],
  ],
  info: (h) => [
    [P.blue, 1.7, Array.from({ length: 15 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return [Math.cos(a) * 20, Math.sin(a) * 20 - h * 2];
    }), true],
    [P.blue, 2, [[0, -2 - h * 2], [0, 10 - h * 2]]],
    [P.blue, 2.4, [[0, -10 - h * 2], [0.5, -9.5 - h * 2]]],
  ],
  flip: (h) => [
    [P.teal, 1.7, [[-18, -14], [12, -14], [18, -6 - h * 4], [18, 18], [-18, 18], [-18, -14]], true],
    [P.honey, 1.5, [[12, -14], [12, -6 - h * 4], [18, -6 - h * 4]]],
    [P.ink, 1.1, [[-11, -2], [8, -2]]],
    [P.ink, 1.1, [[-11, 7], [5, 7]]],
  ],
  domino: (h) => [
    [P.wood, 1.7, [[-18, 18], [-14, -16], [-6, -16], [-10, 18], [-18, 18]], true],
    [P.wood, 1.7, [[2 + h * 4, 18], [10 + h * 6, -12], [18 + h * 6, -10], [10 + h * 4, 18], [2 + h * 4, 18]], true],
    [P.red, 1.4, [[-12, -2], [-11, -1]]],
  ],
};

export function drawMark(c, type, { x = 0, y = 0, scale = 0.62, hover = 0, on = true, progress = 1, time = 0, reduced = false, seed = 1, alpha = 1 } = {}) {
  if (progress <= 0) return;
  const build = MARKS[type] || MARKS.info;
  const strokes = build(hover, on).map(([color, width, knots, closed]) => {
    const pts = catmull(knots, { steps: 5 });
    return { color, width, pts, len: polyLength(pts) };
  });
  const total = strokes.reduce((s, k) => s + k.len, 0);
  let budget = total * progress;
  const v = boilFrame(time, seed, reduced);
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  c.globalAlpha *= alpha;
  strokes.forEach((s, i) => {
    if (budget <= 0) return;
    const p = Math.min(1, budget / s.len);
    budget -= s.len;
    penLine(c, s.pts, { variant: v, seed: seed * 31 + i * 7, width: s.width * 1.3, color: s.color, progress: p, boil: 0.5 });
  });
  c.restore();
}

/**
 * A real <button> for keyboard, focus and names; the canvas draws its mark and label.
 * The handwritten hint writes in on hover/focus and erases from its current ink on leave.
 */
export class Control {
  constructor(host, { id, label, hint = label, mark = "info", art = null, x = 0, y = 0, w = 64, h = 60, depth = null, onClick, isOn, isPressed = isOn, labelAt = "below", labelSize = 17, labelOffset = [0, 0], scale = 0.6, labelColor = P.teal, always = false }) {
    this.host = host;
    this.mark = mark;
    this.art = art;
    this.labelOffset = labelOffset;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.depth = depth;
    this.isOn = isOn;
    this.isPressed = isPressed;
    this.onClick = onClick;
    this.labelAt = labelAt;
    this.scale = scale;
    this.always = always;
    this.hover = false;
    this.focus = false;
    this.disabled = false;
    this.hidden = false;
    this.vis = 1;
    this.resp = new Spring(0, { stiffness: 130, damping: 15 });
    this.label = new HandLabel(hint, { size: labelSize, color: labelColor, align: labelAt === "right" ? "left" : labelAt === "left" ? "right" : "center", write: 0.5, erase: 0.25 });
    this.label.ink.snap(always);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "hit";
    el.id = id;
    el.setAttribute("aria-label", label);
    if (isPressed) el.setAttribute("aria-pressed", String(!!isPressed()));
    el.addEventListener("pointerenter", () => {
      this.hover = true;
      host.app?.foley.unlock();
    });
    el.addEventListener("pointerleave", () => (this.hover = false));
    el.addEventListener("focus", () => (this.focus = el.matches(":focus-visible")));
    el.addEventListener("blur", () => (this.focus = false));
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.disabled || !this.host.interactive) return;
      this.resp.kick(-6);
      this.onClick?.(e);
      if (this.isPressed) el.setAttribute("aria-pressed", String(!!this.isPressed()));
    });
    this.el = el;
    this.place(x, y);
  }
  attach(layer) {
    layer.append(this.el);
  }
  dispose() {
    this.el.remove();
    // A button removed under the pointer never gets pointerleave; drop the stale state.
    this.hover = this.focus = false;
  }
  setHint(text, reduced) {
    this.label.set(text, reduced);
  }
  setDisabled(d) {
    this.disabled = d;
    this.el.disabled = d;
  }
  /** Hidden controls leave the tab order at once and their ink erases away. */
  setHidden(h, reduced = false) {
    this.hidden = h;
    this.el.hidden = h;
    // a button hidden under the pointer never gets pointerleave
    if (h) this.hover = this.focus = false;
    if (reduced) this.vis = h ? 0 : 1;
  }
  place(x, y) {
    this.x = x;
    this.y = y;
    Object.assign(this.el.style, {
      left: `${x - this.w / 2}px`,
      top: `${y - this.h / 2}px`,
      width: `${this.w}px`,
      height: `${this.h}px`,
    });
  }
  update(dt, reduced, cam) {
    // Story steps and keyboard shortcuts also change state without clicking this button.
    if (this.isPressed) {
      const pressed = String(!!this.isPressed());
      if (this.el.getAttribute("aria-pressed") !== pressed) this.el.setAttribute("aria-pressed", pressed);
    }
    const vt = this.hidden ? 0 : 1;
    this.vis = reduced ? vt : vt > this.vis ? Math.min(vt, this.vis + dt * 2.2) : Math.max(vt, this.vis - dt * 4);
    const active = (this.hover || this.focus) && !this.disabled;
    this.label.ink.setVisible(active || this.always, reduced);
    this.label.update(dt);
    this.resp.target = active ? 1 : 0;
    this.resp.update(dt, reduced);
    if (this.depth !== null && cam) {
      const o = cam.shift(this.depth);
      this.el.style.transform = `translate(${o.x}px, ${o.y}px)`;
    }
  }
  get labelBusy() {
    return this.label.writing;
  }
  draw(c, { time, reduced, progress = 1, cam }) {
    if (this.vis <= 0.005) return;
    progress *= this.vis;
    const o = this.depth !== null && cam ? cam.shift(this.depth) : { x: 0, y: 0 };
    const x = this.x + o.x,
      y = this.y + o.y,
      hv = Math.max(0, this.resp.value);
    const on = this.isOn ? !!this.isOn() : true;
    c.save();
    if (this.disabled) c.globalAlpha *= 0.4;
    if (this.art) this.art(c, { x, y, hover: hv, on, progress, time, reduced, focus: this.focus, disabled: this.disabled });
    else if (this.mark) drawMark(c, this.mark, { x, y, scale: this.scale, hover: hv, on, progress, time, reduced, seed: this.el.id.length * 7 + 3 });
    c.restore();
    const lx = (this.labelAt === "right" ? x + this.w * 0.5 + 2 : this.labelAt === "left" ? x - this.w * 0.5 - 2 : x) + this.labelOffset[0];
    const ly = (this.labelAt === "below" ? y + this.h * 0.42 : this.labelAt === "above" ? y - this.h * 0.5 - this.label.size * 1.05 : y - this.label.size * 0.55) + this.labelOffset[1];
    this.label.draw(c, lx, ly, { progress });
    if (this.focus && !this.disabled) {
      penLine(
        c,
        [
          [x - this.w * 0.34, y + this.h * 0.36],
          [x, y + this.h * 0.38],
          [x + this.w * 0.34, y + this.h * 0.35],
        ],
        { color: P.red, width: 1.6, progress: Math.max(0.2, this.label.ink.progress) },
      );
    }
  }
}
