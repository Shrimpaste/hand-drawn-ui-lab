import { random } from "./sketch.js";

/** Quiet local Foley. A scene chooses the semantic cue and its strength. */
export class PaperAudio {
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.last = new Map();
    this.rng = random(649);
    this.count = 0;
  }
  unlock() {
    if (!this.enabled) return;
    try {
      this.context ||= new AudioContext();
      this.context.resume().catch(() => {});
    } catch {}
  }
  play(name = "select", { pan = 0, pitch = 0, strength = 1 } = {}) {
    if (!this.enabled || this.context?.state !== "running") return;
    const c = this.context,
      now = c.currentTime,
      kind = /erase/.test(name)
        ? "erase"
        : /paper|lift|tear|pin/.test(name)
          ? "paper"
          : /leaf|wind/.test(name)
            ? "leaf"
            : /bell|ding|happy|victory/.test(name)
              ? "bell"
              : /stone|land|impact/.test(name)
                ? "impact"
                : /step|foot|hoof|tap/.test(name)
                  ? "step"
                  : /hover|greet/.test(name)
                    ? "hover"
                    : /sleep|zzz/.test(name)
                      ? "sleep"
                      : "select";
    if (now - (this.last.get(kind) ?? -10) < (kind === "hover" ? 0.09 : 0.055))
      return;
    this.last.set(kind, now);
    this.count++;
    const gain = c.createGain(),
      panner = c.createStereoPanner();
    panner.pan.value = Math.max(-0.8, Math.min(0.8, pan));
    gain.connect(panner).connect(c.destination);
    const variation = 0.88 + this.rng() * 0.24,
      duration = {
        paper: 0.14,
        erase: 0.18,
        leaf: 0.2,
        bell: 0.48,
        impact: 0.12,
        step: 0.06,
        hover: 0.075,
        sleep: 0.15,
        select: 0.09,
      }[kind];
    const volume =
      {
        paper: 0.027,
        erase: 0.02,
        leaf: 0.015,
        bell: 0.012,
        impact: 0.035,
        step: 0.018,
        hover: 0.008,
        sleep: 0.01,
        select: 0.016,
      }[kind] *
      Math.min(1.25, strength) *
      variation;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.007);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    const sources = [];
    if (["paper", "erase", "leaf"].includes(kind)) {
      const buffer = c.createBuffer(
          1,
          Math.ceil(c.sampleRate * duration),
          c.sampleRate,
        ),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = this.rng() * 2 - 1;
      const source = c.createBufferSource(),
        filter = c.createBiquadFilter();
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value =
        kind === "erase" ? 1500 : kind === "leaf" ? 1000 : 2100;
      source.connect(filter).connect(gain);
      source.start(now);
      sources.push(source, filter);
    } else {
      const base =
        {
          bell: 730,
          impact: 125,
          step: 245,
          hover: 650,
          sleep: 310,
          select: 420,
        }[kind] *
        2 ** ((pitch + (this.rng() - 0.5) * 0.6) / 12);
      for (const [ratio, weight] of kind === "bell"
        ? [
            [1, 1],
            [2.07, 0.18],
            [3.83, 0.04],
          ]
        : [[1, 1]]) {
        const oscillator = c.createOscillator(),
          voice = c.createGain();
        oscillator.type = kind === "step" ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(base * ratio, now);
        oscillator.frequency.exponentialRampToValueAtTime(
          base * ratio * (kind === "bell" ? 0.99 : 0.65),
          now + duration,
        );
        voice.gain.value = weight;
        oscillator.connect(voice).connect(gain);
        oscillator.start(now);
        oscillator.stop(now + duration);
        sources.push(oscillator, voice);
      }
    }
    // Release graphs after their last audible sample; no independent animation timer.
    const cleanup = c.createConstantSource();
    cleanup.offset.value = 0;
    cleanup.connect(gain);
    cleanup.start(now);
    cleanup.stop(now + duration + 0.02);
    cleanup.onended = () => {
      for (const s of sources) s.disconnect();
      cleanup.disconnect();
      gain.disconnect();
      panner.disconnect();
    };
  }
  writing(active, erasing = false) {
    if (!this.enabled || this.context?.state !== "running") active = false;
    if (active && !this.scratch) {
      const c = this.context,
        buffer = c.createBuffer(1, c.sampleRate, c.sampleRate),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (this.rng() * 2 - 1) * (0.5 + 0.5 * Math.sin(i * 0.011));
      const source = c.createBufferSource(),
        filter = c.createBiquadFilter(),
        gain = c.createGain();
      source.buffer = buffer;
      source.loop = true;
      filter.type = "bandpass";
      filter.Q.value = 0.65;
      gain.gain.value = 0;
      source.connect(filter).connect(gain).connect(c.destination);
      source.start();
      this.scratch = { source, filter, gain };
    }
    if (this.scratch) {
      this.scratch.filter.frequency.setTargetAtTime(
        erasing ? 1250 : 2350,
        this.context.currentTime,
        0.03,
      );
      this.scratch.gain.gain.setTargetAtTime(
        active ? (erasing ? 0.007 : 0.005) : 0,
        this.context.currentTime,
        0.015,
      );
    }
  }
  dispose() {
    this.scratch?.source.stop();
    this.context?.close();
  }
}
