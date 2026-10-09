export const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export const centroid = (pts) => {
  const s = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
  return s.map((v) => v / pts.length);
};

/** Residue numbered `minNum` or higher whose C-alpha lies nearest a point; chain.t holds flat x,y,z. */
export function nearestResidue(chain, minNum, point) {
  let best = { num: -1, d: Infinity };
  chain.num.forEach((n, i) => {
    if (n < minNum) return;
    const d = dist3([chain.t[i * 3], chain.t[i * 3 + 1], chain.t[i * 3 + 2]], point);
    if (d < best.d) best = { num: n, d };
  });
  return best;
}
