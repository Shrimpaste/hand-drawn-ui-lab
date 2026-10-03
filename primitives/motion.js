/** Scene-tuned inertia, with bounded substeps for irregular RAF intervals. */
export const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
export const mix = (a, b, t) => a + (b - a) * t;
export class Spring {
  constructor(value = 0, { stiffness = 140, damping = 20, mass = 1 } = {}) {
    Object.assign(this, { value, target: value, velocity: 0, stiffness, damping, mass });
  }
  update(dt, reduced = false) {
    if (reduced) { this.value = this.target; this.velocity = 0; return this.value; }
    const span = clamp(dt, 0, .1), steps = Math.max(1, Math.ceil(span * 180)), h = span / steps;
    for (let i = 0; i < steps; i++) {
      this.velocity += ((this.target - this.value) * this.stiffness - this.velocity * this.damping) / this.mass * h;
      this.value += this.velocity * h;
    }
    if (Math.abs(this.velocity) + Math.abs(this.target - this.value) < .0001) { this.value = this.target; this.velocity = 0; }
    return this.value;
  }
  kick(velocity) { this.velocity += velocity; }
  snap(value = this.target) { this.value = this.target = value; this.velocity = 0; }
}

/** Crossing events once, even when a slow frame spans several semantic beats. */
export class Action {
  constructor({ duration, events = [], sample = () => ({}), onEvent = () => {} }) {
    Object.assign(this, { duration, events: [...events].sort((a, b) => a.at - b.at), sample, onEvent });
    this.elapsed = 0; this.cursor = 0; this.active = false;
  }
  start() { this.elapsed = 0; this.cursor = 0; this.active = true; this.update(0); }
  update(dt) {
    if (!this.active) return;
    this.elapsed = Math.min(this.duration, this.elapsed + Math.max(0, dt));
    while (this.cursor < this.events.length && this.events[this.cursor].at <= this.elapsed) this.onEvent(this.events[this.cursor++]);
    if (this.elapsed >= this.duration) this.active = false;
  }
  get pose() { return this.sample(this.elapsed); }
}
