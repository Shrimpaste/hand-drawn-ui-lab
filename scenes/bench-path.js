export function insideBench(p, b) {
  return p.x > b.minX && p.x < b.maxX && p.y > b.minY && p.y < b.maxY;
}
export function crossesBench(a, z, b) {
  let lo = 0,
    hi = 1;
  for (const [start, delta, min, max] of [
    [a.x, z.x - a.x, b.minX, b.maxX],
    [a.y, z.y - a.y, b.minY, b.maxY],
  ]) {
    if (Math.abs(delta) < 1e-9) {
      if (start <= min || start >= max) return false;
    } else {
      const p = (min - start) / delta,
        q = (max - start) / delta;
      lo = Math.max(lo, Math.min(p, q));
      hi = Math.min(hi, Math.max(p, q));
    }
  }
  return lo < hi && hi > 0 && lo < 1;
}
/** Six-node visibility graph around the bench's conservative ground footprint. */
export function benchPath(start, end, b) {
  if (!crossesBench(start, end, b)) return [end];
  const nodes = [
    start,
    end,
    ...[
      [b.minX - 1, b.minY - 1],
      [b.maxX + 1, b.minY - 1],
      [b.maxX + 1, b.maxY + 1],
      [b.minX - 1, b.maxY + 1],
    ].map(([x, y]) => ({ x, y })),
  ];
  const costs = nodes.map(() => Infinity),
    from = [],
    seen = new Set();
  costs[0] = 0;
  while (seen.size < nodes.length) {
    let at = -1;
    nodes.forEach((_, i) => {
      if (!seen.has(i) && (at < 0 || costs[i] < costs[at])) at = i;
    });
    if (at < 0 || !Number.isFinite(costs[at])) break;
    if (at === 1) break;
    seen.add(at);
    nodes.forEach((n, i) => {
      if (i === at || crossesBench(nodes[at], n, b)) return;
      const cost = costs[at] + Math.hypot(n.x - nodes[at].x, n.y - nodes[at].y);
      if (cost < costs[i]) {
        costs[i] = cost;
        from[i] = at;
      }
    });
  }
  const route = [];
  let at = 1;
  while (at !== 0 && at != null) {
    route.unshift(nodes[at]);
    at = from[at];
  }
  return at === 0 ? route : [start];
}
