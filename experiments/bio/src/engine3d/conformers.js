import { rng } from "../engine/rng.js";

/** RMS 3D displacement (Å) implied by a crystallographic B-factor: <u²> = B / 8π² per axis. */
export const thermalAmplitude = (b) => Math.sqrt((3 * Math.max(0, b)) / (8 * Math.PI ** 2));

function smoothNoise(n, r, width) {
  let a = Float32Array.from({ length: n }, () => r() * 2 - 1);
  for (let pass = 0; pass < 2; pass++) {
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0,
        c = 0;
      for (let k = -width; k <= width; k++) {
        const j = i + k;
        if (j >= 0 && j < n) {
          s += a[j];
          c++;
        }
      }
      out[i] = s / c;
    }
    a = out;
  }
  const rms = Math.sqrt(a.reduce((s, v) => s + v * v, 0) / n) || 1;
  return a.map((v) => v / rms);
}

/** Typical step between neighbouring snapshots is thermalAmplitude(B) * this, i.e. about 0.5 Å at B = 30. */
export const CONFORMER_GAIN = 0.46;

/**
 * Snapshots of one chain breathing along a single soft collective motion: the middle snapshot is
 * the crystal pose, the outer ones lean to either side of it, each with a little private wobble.
 * Neighbouring snapshots therefore always differ by the same small amount, enough to see but not
 * a twitch. Offsets are per-residue (flat x,y,z), correlated along the chain and scaled by that
 * residue's thermal amplitude, so flexible loops move more than the buried core.
 */
export function conformerFrames(bFactors, { frames = 3, seed = 1, gain = CONFORMER_GAIN, width = 3, wobble = 0.3 } = {}) {
  const n = bFactors.length,
    mr = rng(seed * 104729 + 11),
    mode = [0, 1, 2].map(() => smoothNoise(n, mr, width)),
    mid = (frames - 1) / 2;
  return Array.from({ length: frames }, (_, f) => {
    const r = rng(seed * 104729 + f * 7717 + 97),
      own = [0, 1, 2].map(() => smoothNoise(n, r, width)),
      lean = mid ? (f - mid) / mid : 0,
      out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const amp = (thermalAmplitude(bFactors[i]) * gain) / Math.sqrt(3);
      for (let k = 0; k < 3; k++) out[i * 3 + k] = amp * (lean * mode[k][i] + wobble * own[k][i]);
    }
    return out;
  });
}