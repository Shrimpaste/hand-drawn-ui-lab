export const clamp01 = value => Math.max(0, Math.min(1, value));

/** Interruptible visible process. Durations are a scene choice, not a standard. */
export class InkTransition {
  constructor({ writeSeconds = .3, eraseSeconds = .18 } = {}) {
    this.writeSeconds = writeSeconds; this.eraseSeconds = eraseSeconds;
    this.progress = 0; this.from = 0; this.target = 0; this.elapsed = 0;
  }
  setVisible(visible, reduced = false) {
    const target = Number(visible);
    if (target === this.target) return;
    this.from = this.progress; this.target = target; this.elapsed = 0;
    this.duration = reduced ? .08 : target ? this.writeSeconds : this.eraseSeconds;
  }
  update(dt) {
    this.elapsed += Math.max(0, dt);
    const t = clamp01(this.elapsed / (this.duration || 1));
    const eased = this.target ? t : t * t * (3 - 2 * t);
    this.progress = this.from + (this.target - this.from) * eased;
    return this.progress;
  }
}
