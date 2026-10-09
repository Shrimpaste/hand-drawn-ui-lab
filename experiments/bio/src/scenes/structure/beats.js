/**
 * Each room step is told in a few short beats, one sentence at a time. A beat can change the 3D
 * state (merged on top of the step's own), move the reaction clock on to a new mark, ring atoms,
 * draw a measured distance, or pulse the hotspots. Everything here is pure so it can be tested.
 */

/** State at beat j: defaults, then the step's state, then every beat's state up to and including j. */
export function beatState(step, j, defaults = {}) {
  let st = { ...defaults, ...step.state };
  for (let i = 0; i <= j && i < step.beats.length; i++) st = { ...st, ...(step.beats[i].state || {}) };
  return st;
}

/** What beat j asks the scene to show. The reaction mark carries forward; the rest belongs to this beat only. */
export function beatCue(step, j) {
  let rxnTo;
  for (let i = 0; i <= j && i < step.beats.length; i++) if (step.beats[i].rxnTo !== undefined) rxnTo = step.beats[i].rxnTo;
  const b = step.beats[j] || {};
  return { rxnTo, spots: b.spots || [], measure: b.measure, pulse: b.pulse };
}

export const beatText = (text, siteK = 0) => text.replaceAll("{chain}", "ABCD"[siteK] ?? "A");

/** One cursor across all beats of all steps; moving past an end is ignored. */
export class BeatTrack {
  constructor(steps) {
    this.steps = steps;
    this.step = 0;
    this.beat = 0;
  }
  get beatCount() {
    return this.steps[this.step].beats.length;
  }
  get total() {
    return this.steps.reduce((n, s) => n + s.beats.length, 0);
  }
  /** 1-based index of the current beat among all beats. */
  get position() {
    let n = 0;
    for (let i = 0; i < this.step; i++) n += this.steps[i].beats.length;
    return n + this.beat + 1;
  }
  get atStart() {
    return this.step === 0 && this.beat === 0;
  }
  get atEnd() {
    return this.step === this.steps.length - 1 && this.beat === this.beatCount - 1;
  }
  go(step, beat = 0) {
    this.step = Math.max(0, Math.min(this.steps.length - 1, Math.round(step)));
    this.beat = Math.max(0, Math.min(this.beatCount - 1, Math.round(beat)));
  }
  next() {
    if (this.atEnd) return null;
    const from = this.step;
    if (this.beat < this.beatCount - 1) this.beat++;
    else {
      this.step++;
      this.beat = 0;
    }
    return { step: this.step, beat: this.beat, stepChanged: this.step !== from };
  }
  prev() {
    if (this.atStart) return null;
    const from = this.step;
    if (this.beat > 0) this.beat--;
    else {
      this.step--;
      this.beat = this.beatCount - 1;
    }
    return { step: this.step, beat: this.beat, stepChanged: this.step !== from };
  }
}
