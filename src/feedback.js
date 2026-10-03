import { clamp01 } from "./ink.js";

import { PaperAudio } from "../primitives/audio.js";
import { oval } from "../primitives/sketch.js";

// Compatibility name for the reference specimen; sound remains locally authored.
export class SketchAudio extends PaperAudio {}

/** Sprite particles driven by the original character's semantic events. */
export class SketchFeedback {
  constructor({ atlas, rig, groundScale = 1, audio = new SketchAudio() }) {
    Object.assign(this, { atlas, rig, groundScale, audio });
    this.particles = [];
    this.impacts = [];
    this.counts = { dust: 0, impact: 0, sound: 0 };
  }
  clear() {
    this.particles.length = 0;
    this.impacts.length = 0;
  }
  cue(
    event,
    { x = event.x ?? 0, y = event.y ?? 0, seed = 1, reduced = false } = {},
  ) {
    if (event.kind === "sound" || event.kind === "impact") {
      this.counts[event.kind]++;
      this.audio.play(event.kind === "impact" ? "land" : event.name, {
        pan: x / 5,
        pitch: (seed % 7) - 3,
        strength: event.data?.strength ?? 1,
      });
      if (event.kind === "impact") {
        this.impacts.push({
          x,
          y,
          age: 0,
          seed,
          reduced,
          strength: event.data?.strength ?? 1,
        });
        this.impacts = this.impacts.slice(-32);
      }
    }
    if (event.kind !== "particle") return;
    const data = event.data || {},
      name = event.name || "puff";
    const count = name === "dust" ? (reduced ? 1 : 3) : 1;
    if (name === "dust") this.counts.dust++;
    const part =
      name === "dust"
        ? "puff"
        : { stars: "star", leaves: "leafG" }[name] || name;
    if (!this.rig.parts[part]) return;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + seed * 0.37;
      this.particles.push({
        part,
        x: x + (data.u || 0),
        y: y + (data.v || 0),
        age: 0,
        vx: name === "dust" ? Math.cos(angle) * 0.38 : 0,
        vy:
          name === "dust"
            ? Math.sin(angle) * 0.17
            : name === "zzz"
              ? 0.15
              : 0.06,
        scale: (data.scale || 1) * (name === "dust" ? 0.7 : 1),
        life: name === "dust" ? 0.5 : 0.8,
        seed: seed + i * 7,
        flat: this.rig.parts[part].batch === "flat",
      });
    }
  }
  update(dt) {
    for (const p of this.particles) p.age += dt;
    this.particles = this.particles.filter((p) => p.age < p.life);
    for (const p of this.impacts) p.age += dt;
    this.impacts = this.impacts.filter((p) => p.age < 0.38);
  }
  drawGround(ctx) {
    for (const p of this.impacts) {
      const t = p.age / 0.38,
        alpha = Math.min(1, p.age / 0.025) * (1 - t) ** 2 * 0.43;
      oval(
        ctx,
        p.x,
        -p.y * this.groundScale,
        (0.22 + t * (p.reduced ? 0.05 : 0.23)) * Math.min(1.25, p.strength),
        0.046 + t * 0.035,
        {
          color: p.seed > 1000 ? "#77778f" : "#af7962",
          width: 0.012,
          jitter: 0.008,
          alpha,
          seed: p.seed,
        },
      );
    }
  }
  draw(ctx, { ground = true } = {}) {
    if (ground) this.drawGround(ctx);
    for (const p of this.particles) {
      const part = this.rig.parts[p.part],
        age = p.age / p.life;
      const states =
        p.part === "puff"
          ? ["a", "b", "c"]
          : p.part === "poof"
            ? ["p0", "p1", "p2", "p3"]
            : [part.default];
      const state =
        part.states[
          states[Math.min(states.length - 1, Math.floor(age * states.length))]
        ];
      const key = `fx/${state.frames[Math.floor(p.age * 8 + p.seed) % state.frames.length]}`;
      const scale = p.scale * (p.part === "puff" ? 0.65 + age * 0.55 : 1);
      const alpha =
        Math.min(1, p.age / 0.025) * clamp01((1 - age) / 0.6) * 0.85;
      this.atlas.draw(ctx, key, {
        x: p.x + p.vx * p.age,
        y: p.y * this.groundScale + p.vy * p.age,
        scale,
        alpha,
        ppu: this.rig.scale.ppu,
        matrix: p.flat ? [1, 0, 0, this.groundScale] : [1, 0, 0, 1],
      });
    }
  }
}
