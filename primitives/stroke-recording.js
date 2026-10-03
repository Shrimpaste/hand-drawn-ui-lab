// Record actual Canvas paths into a stroke-time raster while baking the artwork.
// Only one drawing group is buffered; no paths or random textures are rebuilt at playback.
export const strokeTimeColor = (cost) => {
  const n = Math.min(0xffffff, Math.max(1, Math.round(cost * 8)));
  return `rgb(${n >> 16},${(n >> 8) & 255},${n & 255})`;
};
export const strokeTimeValue = (r, g, b) => ((r << 16) | (g << 8) | b) / 8;
export function revealStrokePixels(times, source, output, limit) {
  for (let i = 0; i < times.length; i++)
    output[i * 4 + 3] = times[i] <= limit ? source[i * 4 + 3] : 0;
}

const paints = new Set([
  "fill",
  "stroke",
  "fillRect",
  "strokeRect",
  "fillText",
  "strokeText",
  "drawImage",
]);
const ignoreStyle = new Set([
  "fillStyle",
  "strokeStyle",
  "globalAlpha",
  "inkPainter",
]);

export class CanvasStrokeRecorder {
  constructor(color, timing) {
    this.timing = timing;
    this.operations = [];
    this.total = 0;
    this.from = this.to = this.cursor = 0;
    this.paintCount = 0;
    const methods = new Map();
    this.context = new Proxy(color, {
      get: (target, name) => {
        if (name === "strokeRecorder") return this;
        const value = Reflect.get(target, name, target);
        if (typeof value !== "function") return value;
        if (!methods.has(name))
          methods.set(name, (...args) => {
            const paint = paints.has(name);
            this.operations.push({ name, args, paint });
            if (paint) this.paintCount++;
            return value.apply(target, args);
          });
        return methods.get(name);
      },
      set: (target, name, value) => {
        if (!ignoreStyle.has(name))
          this.operations.push({ property: name, value });
        return Reflect.set(target, name, value, target);
      },
    });
  }
  begin(cost) {
    this.flush();
    this.start = this.total;
    this.cost = cost;
    this.total += cost;
    this.cursor = this.from = this.start;
    this.to = this.total;
  }
  segment(endFraction) {
    if (this.operations.length) this.flush();
    this.from = this.cursor;
    this.to = this.start + this.cost * endFraction;
    this.cursor = this.to;
  }
  flush() {
    const c = this.timing;
    let paint = 0;
    for (const op of this.operations) {
      if (op.property) c[op.property] = op.value;
      else {
        if (op.paint) {
          const time =
            this.from + (this.to - this.from) * (++paint / this.paintCount);
          c.fillStyle = c.strokeStyle = strokeTimeColor(time);
          c.globalAlpha = 1;
        }
        c[op.name](...op.args);
      }
    }
    this.operations.length = this.paintCount = 0;
  }
}
