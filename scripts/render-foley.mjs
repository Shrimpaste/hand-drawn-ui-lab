import fs from "node:fs/promises";
import { foleySamples } from "../primitives/foley.js";

// A local audition of the same sample generator/scene strengths, without browser UI.
const sampleRate = 44100,
  duration = 7.2;
const events = [
  { at: 0.15, kind: "step", strength: 0.46, pan: -0.25 },
  { at: 0.4, kind: "step", strength: 0.46, pan: 0.25 },
  { at: 0.65, kind: "step", strength: 0.46, pan: -0.25 },
  { at: 0.9, kind: "step", strength: 0.46, pan: 0.25 },
  { at: 1.35, kind: "paper", strength: 0.35, pan: -0.2 },
  { at: 1.92, kind: "leaf", strength: 0.35, pan: 0 },
  { at: 2.48, kind: "stone", strength: 0.65, pan: 0.1 },
  { at: 2.98, kind: "bell", strength: 0.28, pan: 0.15 },
  { at: 3.29, kind: "bell", strength: 0.13, pan: 0.15 },
  { at: 5.1, kind: "switch", strength: 0.58, pan: 0.15 },
  { at: 5.45, kind: "write", strength: 0.16, pan: 0 },
  { at: 5.56, kind: "write", strength: 0.16, pan: 0 },
  { at: 5.68, kind: "write", strength: 0.16, pan: 0 },
  { at: 6.05, kind: "erase", strength: 0.2, pan: 0 },
  { at: 6.19, kind: "erase", strength: 0.2, pan: 0 },
];
const n = Math.ceil(duration * sampleRate),
  left = new Float32Array(n),
  right = new Float32Array(n);
events.forEach((e, i) => {
  const data = foleySamples(e.kind, sampleRate, 931 + i * 17, e.strength),
    start = Math.round(e.at * sampleRate);
  const angle = ((e.pan + 1) * Math.PI) / 4;
  data.forEach((v, j) => {
    if (start + j < n) {
      left[start + j] += v * Math.cos(angle);
      right[start + j] += v * Math.sin(angle);
    }
  });
});
const wav = Buffer.alloc(44 + n * 4);
wav.write("RIFF");
wav.writeUInt32LE(36 + n * 4, 4);
wav.write("WAVE", 8);
wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(n * 4, 40);
let peak = 0,
  sum = 0;
for (let i = 0; i < n; i++) {
  for (let ch = 0; ch < 2; ch++) {
    const v = (ch ? right : left)[i];
    peak = Math.max(peak, Math.abs(v));
    sum += v * v;
    wav.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, v)) * 32767),
      44 + i * 4 + ch * 2,
    );
  }
}
await fs.writeFile(
  new URL("../research/scene-foley.wav", import.meta.url),
  wav,
);
await fs.writeFile(
  new URL("../research/scene-foley.json", import.meta.url),
  JSON.stringify(
    { sampleRate, duration, peak, rms: Math.sqrt(sum / (n * 2)), events },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ duration, peak, rms: Math.sqrt(sum / (n * 2)) }));
