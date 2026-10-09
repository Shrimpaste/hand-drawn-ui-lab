import { rng } from "./rng.js";

// Material sounds rendered into short buffers: paper friction, pen scratch, soft contacts,
// a droplet, a snip. Each cue is tied to a visible event by the caller.
const DUR = {
  paper: 0.42,
  write: 0.12,
  erase: 0.16,
  step: 0.1,
  pop: 0.16,
  snip: 0.09,
  drip: 0.32,
  wood: 0.14,
  thud: 0.22,
  chime: 1.1,
};

export function renderCue(name, rate = 44100, seed = 1, strength = 1) {
  const r = rng(seed),
    d = DUR[name] || 0.12,
    n = Math.ceil(d * rate),
    out = new Float32Array(n);
  let low = 0,
    low2 = 0,
    prev = 0,
    phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / rate,
      w = Math.sin((Math.PI * t) / d),
      noise = r() * 2 - 1;
    low += 0.08 * (noise - low);
    low2 += 0.02 * (noise - low2);
    const high = noise - prev;
    prev = noise;
    let v = 0;
    if (name === "paper") {
      const rub = 0.4 + 0.5 * Math.sin(t * 23 + 0.4) ** 2;
      v = (high * 0.1 + low * 0.3 + (r() > 0.994 ? (r() - 0.5) * 0.5 : 0)) * w ** 1.6 * rub;
    } else if (name === "write") {
      v = (high * 0.12 + low * 0.04) * w ** 1.2 * (0.25 + 0.75 * Math.sin(t * 90 + seed) ** 2);
    } else if (name === "erase") {
      v = (low * 0.5 + high * 0.03) * w ** 1.2 * (0.6 + 0.4 * Math.sin(t * 30) ** 2);
    } else if (name === "step") {
      v = (low2 * 2.2 + low * 0.5) * Math.exp(-t * 60) * (1 - Math.exp(-t * 800));
    } else if (name === "pop") {
      const f = 520 * Math.exp(-t * 9) + 180;
      phase += (2 * Math.PI * f) / rate;
      v = Math.sin(phase) * 0.45 * Math.exp(-t * 26) * (1 - Math.exp(-t * 900)) + high * 0.03 * Math.exp(-t * 80);
    } else if (name === "snip") {
      const click = (k) => (t > k ? Math.exp(-(t - k) * 420) : 0);
      v = high * 0.5 * (click(0) + click(0.045) * 0.8);
    } else if (name === "drip") {
      const f = 700 + 900 * (1 - Math.exp(-t * 30));
      phase += (2 * Math.PI * f) / rate;
      v = Math.sin(phase) * 0.35 * Math.exp(-t * 16) * (1 - Math.exp(-t * 2000));
    } else if (name === "wood") {
      v = (high * 0.06 * Math.exp(-t * 160) + low * 1.1 * Math.exp(-t * 45) + low2 * 0.9 * Math.exp(-t * 30)) * (1 - Math.exp(-t * 1600));
    } else if (name === "thud") {
      v = (low2 * 3 + low * 0.4) * Math.exp(-t * 22) * (1 - Math.exp(-t * 600));
    } else if (name === "chime") {
      const base = 660;
      v = [1, 2.4, 3.9].reduce((s, m, j) => s + Math.sin(2 * Math.PI * base * m * t) * [0.3, 0.12, 0.05][j] * Math.exp(-t * [3, 5, 8][j]), 0) * (1 - Math.exp(-t * 900));
    }
    out[i] = v * Math.min(1.4, strength) * 0.24 * Math.min(1, (d - t) / 0.005);
  }
  return out;
}

export class Foley {
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.ctx = null;
    this.serial = 0;
    this.last = new Map();
    this.sources = new Set();
    this.scratch = 0;
  }
  unlock() {
    if (!this.enabled) return;
    try {
      this.ctx ||= new AudioContext();
      if (this.ctx.state !== "running") this.ctx.resume().catch(() => {});
    } catch {
      /* audio unavailable: visuals keep working */
    }
  }
  setEnabled(on) {
    this.enabled = on;
    if (!on) {
      for (const s of this.sources) {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      }
      this.sources.clear();
    } else this.unlock();
  }
  play(name, { strength = 1, pan = 0 } = {}) {
    const c = this.ctx;
    if (!this.enabled || !c || c.state !== "running") return;
    const now = c.currentTime;
    if (now - (this.last.get(name) ?? -1) < (name === "step" ? 0.08 : 0.03)) return;
    this.last.set(name, now);
    const seed = 811 + this.serial++ * 13;
    const data = renderCue(name, c.sampleRate, seed, strength);
    const buf = c.createBuffer(1, data.length, c.sampleRate);
    buf.copyToChannel(data, 0);
    const src = c.createBufferSource(),
      p = c.createStereoPanner();
    src.buffer = buf;
    src.playbackRate.value = 0.95 + (seed % 9) * 0.012;
    p.pan.value = Math.max(-0.7, Math.min(0.7, pan));
    src.connect(p).connect(c.destination);
    this.sources.add(src);
    src.onended = () => {
      src.disconnect();
      p.disconnect();
      this.sources.delete(src);
    };
    src.start();
  }
  /** Pen friction follows visible writing; erasing has its own duller rub. */
  writing(active, erasing, dt) {
    this.scratch += dt;
    if (active && this.scratch > (erasing ? 0.13 : 0.085)) {
      this.play(erasing ? "erase" : "write", { strength: erasing ? 0.22 : 0.17 });
      this.scratch = 0;
    }
    if (!active) this.scratch = 0;
  }
}
