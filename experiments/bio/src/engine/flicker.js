import { rng } from "./rng.js";

/** Dwell ranges (s). Big things the eye studies (the protein) breathe slowly; small marks tick faster. */
export const PACE = {
  protein: { min: 0.42, max: 0.95 },
  ligand: { min: 0.26, max: 0.6 },
  ring: { min: 0.14, max: 0.32 },
};

/** Hovering must not make the protein jitter; only small markers react by ticking faster. */
export function hoverRate(hovered, kind) {
  if (!hovered || kind === "protein" || kind === "ligand") return 1;
  return 1.5;
}

/**
 * Idle life for important things: a few genuinely different drawings (poses, conformers) shown
 * one after another with uneven dwell times, instead of one drawing slowly wobbling. The order
 * ping-pongs 0,1,2,1 so neighbouring drawings are always close; each element has its own seed
 * so a room of them never ticks in unison. Pure in time, so it can be queried any number of times.
 */
export class Flicker {
  constructor(states = 3, { seed = 1, min = 0.085, max = 0.2 } = {}) {
    this.states = states;
    this.min = min;
    this.max = max;
    this.rand = rng(seed * 7919 + 13);
    this.offset = this.rand() * 3;
    this.ends = [];
    this.order = [];
    for (let i = 0; i < states; i++) this.order.push(i);
    for (let i = states - 2; i > 0; i--) this.order.push(i);
  }
  extend(upTo) {
    let t = this.ends.at(-1) ?? 0;
    while (t <= upTo) {
      t += this.min + this.rand() * (this.max - this.min);
      this.ends.push(t);
    }
  }
  /** Drawing index at time t. `rate` > 1 excites it (hover); `reduced` shows drawing 0 only. */
  at(t, { rate = 1, reduced = false } = {}) {
    if (reduced || this.states < 2) return 0;
    const tau = Math.max(0, t * rate) + this.offset;
    this.extend(tau);
    let lo = 0,
      hi = this.ends.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.ends[mid] > tau) hi = mid;
      else lo = mid + 1;
    }
    return this.order[lo % this.order.length];
  }
}
