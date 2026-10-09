import { clamp } from "./geom.js";

/** Damped spring with bounded substeps; value/velocity persist across retargeting. */
export class Spring {
  constructor(value = 0, { stiffness = 140, damping = 18, mass = 1 } = {}) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.damping = damping;
    this.mass = mass;
  }
  update(dt, reduced = false) {
    if (reduced) {
      this.value = this.target;
      this.velocity = 0;
      return this.value;
    }
    const span = clamp(dt, 0, 0.1),
      steps = Math.max(1, Math.ceil(span * 240)),
      h = span / steps;
    for (let i = 0; i < steps; i++) {
      const force =
        (this.target - this.value) * this.stiffness - this.velocity * this.damping;
      this.velocity += (force / this.mass) * h;
      this.value += this.velocity * h;
    }
    if (Math.abs(this.velocity) + Math.abs(this.target - this.value) < 1e-5) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  }
  kick(v) {
    this.velocity += v;
  }
  snap(v = this.target) {
    this.value = this.target = v;
    this.velocity = 0;
  }
}

/** Timed action with semantic events crossed exactly once per run. */
export class Action {
  constructor({ duration = 1, events = [], sample = () => ({}), onEvent = () => {} } = {}) {
    this.duration = duration;
    this.events = [...events].sort((a, b) => a.at - b.at);
    this.sample = sample;
    this.onEvent = onEvent;
    this.elapsed = 0;
    this.cursor = 0;
    this.active = false;
  }
  start() {
    this.elapsed = 0;
    this.cursor = 0;
    this.active = true;
    this.update(0);
    return this;
  }
  update(dt) {
    if (!this.active) return;
    this.elapsed = Math.min(this.duration, this.elapsed + Math.max(0, dt));
    while (
      this.cursor < this.events.length &&
      this.events[this.cursor].at <= this.elapsed
    )
      this.onEvent(this.events[this.cursor++]);
    if (this.elapsed >= this.duration) this.active = false;
  }
  get t() {
    return this.duration ? this.elapsed / this.duration : 1;
  }
  get pose() {
    return this.sample(this.elapsed, this.t);
  }
}

/** Seeded blink schedule: irregular gaps with occasional doubles, no per-frame dice. */
export class Blink {
  constructor(seed = 1, { gap = 3.4, jitter = 0.35, double = 0.12 } = {}) {
    let s = seed * 9301 + 49297;
    this.rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    this.gap = gap;
    this.jitter = jitter;
    this.double = double;
    this.clock = this.gap * (0.3 + this.rand() * 0.7);
    this.closed = 0;
    this.phase = -1;
  }
  update(dt) {
    this.clock -= dt;
    if (this.phase >= 0) {
      this.phase += dt;
      const len = 0.16;
      this.closed = this.phase < len ? Math.sin((this.phase / len) * Math.PI) : 0;
      if (this.phase >= len) {
        this.phase = -1;
        this.closed = 0;
        if (this.rand() < this.double) this.clock = 0.12;
      }
    } else if (this.clock <= 0) {
      this.phase = 0;
      this.clock = this.gap * (1 - this.jitter + this.rand() * this.jitter * 2);
    }
    return this.closed > 0.5;
  }
}
