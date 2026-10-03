import { clamp01 } from "../primitives/ink.js";
export { clamp01, InkTransition } from "../primitives/ink.js";

/** Same threshold as the reference shader; red in the time map is stroke time. */
export function strokeCoverage(progress, timeByte) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return clamp01((progress * 1.03 - timeByte / 255) * 60);
}

/** Shared opening choreography, independent of any board/game implementation. */
export class DrawingSequence {
  constructor({ reduced = false } = {}) {
    this.restart(reduced);
  }
  restart(reduced = this.reduced) {
    this.reduced = reduced;
    this.elapsed = 0;
  }
  setReduced(reduced) {
    const completed = this.done;
    this.reduced = reduced;
    // Disabling reduced motion must not resurrect an already completed opening.
    if (completed || reduced) this.elapsed = Math.max(this.elapsed, 4.8);
  }
  update(dt) {
    this.elapsed += Math.max(0, dt);
  }
  progress(start = 0, seconds = 1) {
    return this.reduced ? 1 : clamp01((this.elapsed - start) / seconds);
  }
  get interactive() {
    return this.reduced || this.elapsed >= 3.6;
  }
  get done() {
    return this.reduced || this.elapsed >= 4.8;
  }
}
