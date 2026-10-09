import { clamp } from "./geom.js";

/** Interruptible write/erase envelope. Reversal starts from the ink already on paper. */
export class InkTransition {
  constructor({ writeSeconds = 0.4, eraseSeconds = 0.24 } = {}) {
    this.writeSeconds = writeSeconds;
    this.eraseSeconds = eraseSeconds;
    this.progress = 0;
    this.from = 0;
    this.target = 0;
    this.elapsed = 0;
    this.duration = 1;
  }
  setVisible(visible, reduced = false) {
    const target = visible ? 1 : 0;
    if (target === this.target) return;
    this.from = this.progress;
    this.target = target;
    this.elapsed = 0;
    const span = Math.abs(target - this.from) || 1;
    this.duration = reduced
      ? 0.06
      : (target ? this.writeSeconds : this.eraseSeconds) * span;
  }
  snap(visible) {
    this.target = this.progress = this.from = visible ? 1 : 0;
    this.elapsed = this.duration;
  }
  update(dt) {
    this.elapsed += Math.max(0, dt);
    const t = clamp(this.elapsed / (this.duration || 1));
    const eased = this.target ? t : t * t * (3 - 2 * t);
    this.progress = this.from + (this.target - this.from) * eased;
    return this.progress;
  }
  get active() {
    return this.progress > 0 && this.progress < 1;
  }
}
