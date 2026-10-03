import { smooth } from "../primitives/motion.js";

/** Only one drawing is visible. Interrupted choices preserve its visible ink. */
export class VisitorRedraw {
  constructor() {
    this.phase = "complete";
    this.oldProgress = 0;
    this.newProgress = 1;
    this.elapsed = 0;
  }
  start(reduced = false) {
    if (this.phase === "erasing") return false;
    this.from = this.newProgress;
    this.oldProgress = this.from;
    this.newProgress = 0;
    this.elapsed = 0;
    this.phase = "erasing";
    this.eraseSeconds = reduced ? 0.1 : 0.36;
    this.drawSeconds = reduced ? 0.18 : 0.8;
    return true;
  }
  update(dt) {
    let remaining = Math.max(0, dt);
    while (remaining > 0 && this.phase !== "complete") {
      const duration =
        this.phase === "erasing" ? this.eraseSeconds : this.drawSeconds;
      const step = Math.min(remaining, duration - this.elapsed);
      this.elapsed += step;
      remaining -= step;
      if (this.phase === "erasing")
        this.oldProgress = this.from * (1 - smooth(this.elapsed / duration));
      else this.newProgress = Math.min(1, this.elapsed / duration);
      if (this.elapsed >= duration) {
        this.elapsed = 0;
        this.phase = this.phase === "erasing" ? "drawing" : "complete";
      }
    }
  }
  reset() {
    this.phase = "complete";
    this.oldProgress = 0;
    this.newProgress = 1;
    this.elapsed = 0;
  }
}
