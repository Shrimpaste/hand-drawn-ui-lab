export const TIERS = 3;

const quantile = (a, q) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(s.length * q))];
};
const median = (a) => quantile(a, 0.5);

/**
 * Watches frame times and lowers render quality one tier at a time when the machine cannot hold
 * about 45 fps. Tiers only go down: a picture that changes quality back and forth is worse than
 * a steady one. Hidden-tab gaps and single hitches never count, because it judges the median.
 */
export class FrameGovernor {
  constructor({ slowMs = 22, window = 30, maxGap = 250 } = {}) {
    this.slowMs = slowMs;
    this.window = window;
    this.maxGap = maxGap;
    this.tier = 0;
    this.samples = [];
  }
  push(dtMs) {
    if (!(dtMs > 0) || dtMs > this.maxGap) return this.tier;
    this.samples.push(dtMs);
    if (this.samples.length >= this.window) {
      if (median(this.samples) > this.slowMs && this.tier < TIERS - 1) this.tier++;
      this.samples = [];
    }
    return this.tier;
  }
  reset() {
    this.samples = [];
  }
  /** Starting tier from a benchmark run drawn at full quality; judged by the 85th percentile, since hitches are what people feel (a healthy 60 Hz display sits at about 17 ms there). */
  tierFor(samples) {
    const m = quantile(samples.filter((x) => x > 0 && x <= this.maxGap), 0.85);
    if (!(m > this.slowMs)) return 0;
    return m > this.slowMs * 2 ? TIERS - 1 : 1;
  }
}
