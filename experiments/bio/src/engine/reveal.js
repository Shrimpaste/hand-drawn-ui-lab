import { clamp, smooth } from "./geom.js";

// Drawing order follows how one would actually draw the page: ground first, words last.
const DRAW = {
  env: [0, 1.5],
  prop: [0.7, 1.4],
  char: [1.35, 1.1],
  label: [1.9, 1.0],
  ui: [2.2, 0.8],
};
// Erasing runs the other way: words leave first, then figures, then the room.
const ERASE = {
  label: [0, 0.28],
  ui: [0, 0.3],
  char: [0.12, 0.36],
  prop: [0.22, 0.4],
  env: [0.3, 0.46],
};

export class Reveal {
  constructor({ draw = DRAW, erase = ERASE } = {}) {
    this.drawSpec = draw;
    this.eraseSpec = erase;
    this.phase = "hidden";
    this.t = 0;
    this.frozen = 0;
    this.speed = 1;
  }
  draw(reduced = false) {
    this.phase = "drawing";
    this.t = 0;
    this.speed = reduced ? 12 : 1;
  }
  show() {
    this.phase = "shown";
  }
  erase(reduced = false) {
    if (this.phase === "hidden") return;
    this.frozen = this.phase === "shown" ? Infinity : this.t;
    this.phase = "erasing";
    this.t = 0;
    this.speed = reduced ? 8 : 1;
  }
  update(dt) {
    if (this.phase === "drawing" || this.phase === "erasing")
      this.t += Math.max(0, dt) * this.speed;
    if (this.phase === "drawing" && this.t >= this.drawEnd) this.phase = "shown";
    if (this.phase === "erasing" && this.t >= this.eraseEnd) this.phase = "hidden";
  }
  get drawEnd() {
    return Math.max(...Object.values(this.drawSpec).map(([d, l]) => d + l)) + 0.4;
  }
  get eraseEnd() {
    return Math.max(...Object.values(this.eraseSpec).map(([d, l]) => d + l));
  }
  drawn(layer, offset, t) {
    const [delay, len] = this.drawSpec[layer] || this.drawSpec.prop;
    return clamp((t - delay - offset) / len);
  }
  /** Ink amount for a layer; offset staggers objects within a layer. */
  progress(layer, offset = 0) {
    if (this.phase === "shown") return 1;
    if (this.phase === "hidden") return 0;
    if (this.phase === "drawing") return this.drawn(layer, offset, this.t);
    const start = this.frozen === Infinity ? 1 : this.drawn(layer, offset, this.frozen);
    const [delay, len] = this.eraseSpec[layer] || this.eraseSpec.prop;
    return start * (1 - smooth((this.t - delay) / len));
  }
  get done() {
    return this.phase === "shown" || this.phase === "hidden";
  }
  get erasing() {
    return this.phase === "erasing";
  }
}
