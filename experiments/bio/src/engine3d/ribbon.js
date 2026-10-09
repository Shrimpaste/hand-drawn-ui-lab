// Backbone splines for the ribbon drawing. Residues missing from the crystal (disordered
// loops) split the chain into separate runs; the renderer bridges them with a dashed line.

function catmull3(p0, p1, p2, p3, t) {
  const t2 = t * t,
    t3 = t2 * t;
  return [0, 1, 2].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
}

/**
 * @param pts   control points (C-alpha), one per residue
 * @param num   residue numbers, to find gaps
 * @param ss    secondary structure letters per residue (H, E, C)
 * @returns runs of samples { p, res (fractional residue index), ss }
 */
export function splineChain(pts, num, ss, { sub = 3 } = {}) {
  const runs = [];
  let start = 0;
  for (let i = 1; i <= pts.length; i++) {
    if (i === pts.length || num[i] - num[i - 1] > 1) {
      runs.push([start, i - 1]);
      start = i;
    }
  }
  return runs.map(([a, b]) => {
    const out = [];
    for (let i = a; i < b; i++) {
      const p0 = pts[Math.max(a, i - 1)],
        p1 = pts[i],
        p2 = pts[i + 1],
        p3 = pts[Math.min(b, i + 2)];
      for (let s = 0; s < sub; s++) {
        const res = i + s / sub;
        out.push({ p: s === 0 ? [...p1] : catmull3(p0, p1, p2, p3, s / sub), res, ss: ss[Math.round(res)] });
      }
    }
    out.push({ p: [...pts[b]], res: b, ss: ss[b] });
    return out;
  });
}
