export const clamp01 = value => Math.max(0, Math.min(1, value));

/** Same threshold as the reference shader; red in the time map is stroke time. */
export function strokeCoverage(progress, timeByte) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return clamp01((progress * 1.03 - timeByte / 255) * 60);
}

/** Reversible write/erase envelope. An interrupted stroke resumes from its ink. */
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
    // A pen writes at a steady speed; an eraser settles gently.
    const eased = this.target ? t : t * t * (3 - 2 * t);
    this.progress = this.from + (this.target - this.from) * eased;
    return this.progress;
  }
}

/** Shared opening choreography, independent of any board/game implementation. */
export class DrawingSequence {
  constructor({ reduced = false } = {}) { this.restart(reduced); }
  restart(reduced = this.reduced) { this.reduced = reduced; this.elapsed = 0; }
  setReduced(reduced) {
    const completed = this.done;
    this.reduced = reduced;
    // Disabling reduced motion must not resurrect an already completed opening.
    if (completed || reduced) this.elapsed = Math.max(this.elapsed, 4.8);
  }
  update(dt) { this.elapsed += Math.max(0, dt); }
  progress(start = 0, seconds = 1) {
    return this.reduced ? 1 : clamp01((this.elapsed - start) / seconds);
  }
  get interactive() { return this.reduced || this.elapsed >= 3.6; }
  get done() { return this.reduced || this.elapsed >= 4.8; }
}
