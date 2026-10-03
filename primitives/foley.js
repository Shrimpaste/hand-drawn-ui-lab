import { random } from "./sketch.js";

/** Friction and contact, not UI notes. Every cue is rendered into a short buffer;
 * footsteps/wood contain noise only. Bell uses decaying, inharmonic metal modes. */
export function foleySamples(name, sampleRate = 44100, seed = 1, strength = 1) {
  const r = random(seed),
    duration =
      {
        step: 0.11,
        paper: 0.34,
        leaf: 0.31,
        stone: 0.22,
        wood: 0.16,
        bell: 1.8,
        switch: 0.065,
        write: 0.13,
        erase: 0.17,
      }[name] || 0.1;
  const data = new Float32Array(Math.ceil(duration * sampleRate));
  let brown = 0,
    low = 0,
    prev = 0;
  const modes = [1, 2.756, 5.404, 8.933];
  const bellBase = 890 * (0.993 + r() * 0.008);
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate,
      n = r() * 2 - 1;
    const window = Math.max(0, Math.sin((Math.PI * t) / duration));
    brown = (brown + n * 0.024) / 1.019;
    low += 0.065 * (n - low);
    const high = n - prev;
    prev = n;
    let v = 0;
    if (name === "step") {
      const heel = Math.exp(-t * 72) * (1 - Math.exp(-t * 700));
      const toe =
        t > 0.035
          ? Math.exp(-(t - 0.035) * 100) * (1 - Math.exp(-(t - 0.035) * 500))
          : 0;
      v = (low * 0.8 + brown * 0.7) * heel + (high * 0.028 + low * 0.14) * toe;
    } else if (name === "paper") {
      const envelope = window ** 1.7;
      const rub = 0.45 + 0.4 * Math.sin(t * 27 + 0.7) ** 2;
      const crackle = r() > 0.993 ? (r() - 0.5) * 0.55 : 0;
      v = (high * 0.12 + low * 0.27 + crackle) * envelope * rub;
    } else if (name === "leaf") {
      v =
        (high * 0.085 + low * 0.16) *
        window ** 2 *
        (0.4 + 0.6 * Math.sin(t * 47) ** 2);
    } else if (name === "stone" || name === "wood") {
      // Different contact bodies: stone has a short hard edge; wood a dull body.
      const edge = name === "stone" ? high * 0.29 : high * 0.07;
      const body = name === "stone" ? low * 0.95 : low * 1.25;
      v =
        (edge * Math.exp(-t * 130) +
          body * Math.exp(-t * 38) +
          brown * 0.8 * Math.exp(-t * 24)) *
        (1 - Math.exp(-t * 1500));
    } else if (name === "bell") {
      const base = bellBase; // stable metal pitch, no sliding UI chirp
      v =
        modes.reduce(
          (sum, m, j) =>
            sum +
            Math.sin(2 * Math.PI * base * m * t + 0.2 * j) *
              [0.36, 0.17, 0.075, 0.022][j] *
              Math.exp(-t * [2.7, 4.2, 7, 11][j]),
          0,
        ) *
        (1 - Math.exp(-t * 1400));
      v += high * 0.1 * Math.exp(-t * 180);
    } else if (name === "switch") {
      v =
        (high * 0.26 + low * 0.9) *
        Math.exp(-t * 120) *
        (1 - Math.exp(-t * 1700));
    } else if (name === "write") {
      v =
        (high * 0.11 + low * 0.05) *
        window ** 1.2 *
        (0.24 + 0.76 * Math.sin(t * 83 + seed) ** 2);
    } else if (name === "erase") {
      v =
        (low * 0.55 + high * 0.025) *
        window ** 1.2 *
        (0.6 + 0.4 * Math.sin(t * 31) ** 2);
    }
    data[i] =
      v *
      Math.min(strength, 1.4) *
      0.22 *
      Math.max(0, Math.min(1, (duration - t) / 0.004));
  }
  return data;
}
export class SceneFoley {
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.count = 0;
    this.sequence = 0;
    this.last = new Map();
    this.sources = new Set();
    this.events = [];
  }
  unlock() {
    if (!this.enabled) return;
    try {
      this.context ||= new AudioContext();
      this.context.resume().catch(() => {});
    } catch {}
  }
  setEnabled(on) {
    this.enabled = on;
    if (!on) {
      for (const s of this.sources) {
        try {
          s.stop();
        } catch {}
      }
      this.sources.clear();
    } else this.unlock();
  }
  play(name, { pan = 0, strength = 1 } = {}) {
    const c = this.context;
    if (!this.enabled || c?.state !== "running") return;
    const now = c.currentTime;
    if (now - (this.last.get(name) ?? -10) < (name === "step" ? 0.1 : 0.035))
      return;
    this.last.set(name, now);
    const seed = 931 + this.sequence++ * 17;
    const data = foleySamples(
      name,
      c.sampleRate,
      seed,
      strength * (0.93 + (seed % 11) / 100),
    );
    const b = c.createBuffer(1, data.length, c.sampleRate);
    b.copyToChannel(data, 0);
    const s = c.createBufferSource(),
      p = c.createStereoPanner();
    s.buffer = b;
    p.pan.value = Math.max(-0.65, Math.min(0.65, pan));
    s.connect(p).connect(c.destination);
    s.playbackRate.value = name === "bell" ? 1 : 0.96 + (seed % 7) * 0.013;
    this.sources.add(s);
    s.onended = () => {
      s.disconnect();
      p.disconnect();
      this.sources.delete(s);
    };
    s.start();
    this.count++;
    this.events.push({ name, at: now, strength });
    if (this.events.length > 40) this.events.shift();
  }
  handwriting(active, erasing = false, dt = 0) {
    this.scratchClock = (this.scratchClock || 0) + dt;
    if (active && this.scratchClock > (erasing ? 0.12 : 0.09)) {
      this.play(erasing ? "erase" : "write", {
        strength: erasing ? 0.2 : 0.16,
      });
      this.scratchClock = 0;
    }
    if (!active) this.scratchClock = 0;
  }
  dispose() {
    this.setEnabled(false);
    this.context?.close();
  }
}
