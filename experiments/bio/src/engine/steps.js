/** Index over a room's story steps. Moves past either end are ignored, not wrapped. */
export class StepState {
  constructor(count, onChange = () => {}) {
    this.count = Math.max(1, count);
    this.index = 0;
    this.onChange = onChange;
  }
  go(i) {
    const next = Math.max(0, Math.min(this.count - 1, Math.round(i)));
    if (next === this.index) return false;
    const from = this.index;
    this.index = next;
    this.onChange(next, from);
    return true;
  }
  next() {
    return this.go(this.index + 1);
  }
  prev() {
    return this.go(this.index - 1);
  }
  get atStart() {
    return this.index === 0;
  }
  get atEnd() {
    return this.index === this.count - 1;
  }
}
