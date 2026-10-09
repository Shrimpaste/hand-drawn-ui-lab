// Record the actual Canvas calls of a drawing, then replay them into a timing raster where
// each painted pixel stores *when* it was drawn. Time is normalised over the whole drawing
// and quantised to 12 bits: R holds the high 8 bits, G the low 4 (blending stays benign).
const PAINTS = new Set(["fill", "stroke", "fillRect", "strokeRect", "drawImage", "fillText"]);
const SKIP_PROPS = new Set(["fillStyle", "strokeStyle", "globalAlpha", "filter", "shadowColor", "shadowBlur"]);
export const TIME_LEVELS = 4096;

export const encodeTime = (t) => {
  const v = Math.max(0, Math.min(TIME_LEVELS - 1, Math.round(t * (TIME_LEVELS - 1))));
  return `rgb(${v >> 4},${(v & 15) << 4},0)`;
};
export const decodeTime = (r, g) => (r << 4) | (g >> 4);

export class StrokeRecorder {
  constructor(target) {
    this.target = target;
    this.ops = [];
    this.group = [];
    this.groupPaints = 0;
    this.total = 0;
    this.from = this.to = this.cursor = this.start = this.cost = 0;
    const cachedFns = new Map();
    this.context = new Proxy(target, {
      get: (t, name) => {
        if (name === "strokeRecorder") return this;
        const v = Reflect.get(t, name, t);
        if (typeof v !== "function") return v;
        if (!cachedFns.has(name))
          cachedFns.set(name, (...args) => {
            const paint = PAINTS.has(name);
            this.group.push({ name, args, paint });
            if (paint) this.groupPaints++;
            return v.apply(t, args);
          });
        return cachedFns.get(name);
      },
      set: (t, name, value) => {
        if (!SKIP_PROPS.has(name)) this.group.push({ prop: name, value });
        return Reflect.set(t, name, value, t);
      },
    });
  }
  /** Start a drawing element costing `cost` units of pen travel. */
  begin(cost) {
    this.closeGroup();
    this.start = this.total;
    this.cost = cost;
    this.total += cost;
    this.from = this.cursor = this.start;
    this.to = this.total;
  }
  /** Split the current element: ops until the next split occupy up to `fraction`. */
  segment(fraction) {
    this.closeGroup();
    this.from = this.cursor;
    this.to = this.start + this.cost * fraction;
    this.cursor = this.to;
  }
  closeGroup() {
    let k = 0;
    for (const op of this.group) {
      if (op.paint) op.time = this.from + (this.to - this.from) * (++k / this.groupPaints);
      this.ops.push(op);
    }
    this.group = [];
    this.groupPaints = 0;
  }
  /** Replay everything into a timing context that already has the base transform. */
  replay(timing) {
    this.closeGroup();
    const total = this.total || 1;
    for (const op of this.ops) {
      if (op.prop) {
        timing[op.prop] = op.value;
        continue;
      }
      if (op.paint) {
        timing.fillStyle = timing.strokeStyle = encodeTime(op.time / total);
        timing.globalAlpha = 1;
      }
      timing[op.name](...op.args);
    }
    this.ops = [];
  }
}
