/** Authored redraw fields, not per-frame noise. Coordinates are local to a
 * joint/contact pivot. The same field redraws silhouette, fill and anatomy. */
export const drawingBeat = (frame) => [0, 1, -0.72][frame % 3];

export function redrawPoint([x, y], frame, bands) {
  const a = drawingBeat(frame);
  if (!a || !bands?.length) return [x, y];
  let lo = bands[0],
    hi = bands.at(-1);
  for (let i = 1; i < bands.length; i++) {
    if (y <= bands[i][0]) {
      lo = bands[i - 1];
      hi = bands[i];
      break;
    }
  }
  const t = Math.max(0, Math.min(1, (y - lo[0]) / (hi[0] - lo[0] || 1)));
  const q = t * t * (3 - 2 * t);
  const at = (i) => lo[i] + (hi[i] - lo[i]) * q;
  return [x * (1 + at(1) * a) + at(2) * a, y + at(3) * a];
}

// [height, width change, lateral shift, height change]. Zero bands protect
// anchors; lips, lobes and distal feathers are redrawn more than joints.
export const redrawProfiles = {
  mushroomBody: [
    [-90, 0.012, -0.55, -0.35],
    [-42, -0.014, 0.5, 0.6],
    [0, 0, 0, 0],
    [12, 0, 0, 0],
  ],
  cap: [
    [-58, -0.018, 0.6, -0.8],
    [-25, 0.017, -0.55, 0.4],
    [0, 0, 0, 0],
    [12, 0.02, 0.3, 0.55],
  ],
  rabbitBody: [
    [-110, 0.012, 0.5, -0.6],
    [-63, -0.012, -0.5, 0.4],
    [-20, 0.016, 0.2, 0.35],
    [0, 0, 0, 0],
  ],
  owlBody: [
    [-108, -0.012, -0.45, -0.5],
    [-72, 0.017, 0.45, 0.3],
    [-28, -0.015, -0.2, 0.4],
    [0, 0, 0, 0],
  ],
  ear: [
    [-80, 0.025, 1, -0.65],
    [-35, -0.015, 0.55, 0.4],
    [0, 0, 0, 0],
    [10, 0, 0, 0],
  ],
  wing: [
    [-7, 0, 0, 0],
    [0, 0, 0, 0],
    [16, 0.03, -0.5, 0.2],
    [37, -0.025, 1.1, -0.7],
  ],
  cloth: [
    [-22, 0.02, -0.45, 0.3],
    [0, 0, 0, 0],
    [14, -0.025, 0.65, 0.5],
    [35, 0.035, -0.7, -0.4],
  ],
  foot: [
    [-20, 0.025, 0.4, -0.4],
    [-4, -0.02, -0.2, 0.3],
    [0, 0, 0, 0],
    [10, 0, 0, 0],
  ],
  feather: [
    [-35, 0.025, 0.5, -0.6],
    [0, 0, 0, 0],
    [14, 0.03, -0.5, 0.25],
    [35, -0.02, 0.8, -0.5],
  ],
  face: [
    [-14, 0.01, 0.18, 0.12],
    [0, 0, 0, 0],
    [10, -0.01, -0.15, 0.15],
  ],
  bird: [
    [-32, 0.02, 0.4, -0.5],
    [-17, -0.025, -0.5, 0.25],
    [-2, 0.012, 0.2, 0.2],
    [0, 0, 0, 0],
    [12, 0, 0, 0],
  ],
  flower: [
    [-16, 0.025, 0.45, -0.4],
    [0, 0, 0, 0],
    [16, -0.025, -0.45, 0.4],
  ],
};
