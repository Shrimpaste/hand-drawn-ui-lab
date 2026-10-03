// The drawing and all ground contacts use this exact four-corner paving surface.
export const platform = [
  [110, 456],
  [616, 324],
  [1030, 544],
  [514, 725],
];
export function groundPoint(u, v) {
  const [a, b, c, d] = platform;
  return {
    x:
      a[0] +
      (b[0] - a[0]) * u +
      (d[0] - a[0]) * v +
      (a[0] - b[0] + c[0] - d[0]) * u * v,
    y:
      a[1] +
      (b[1] - a[1]) * u +
      (d[1] - a[1]) * v +
      (a[1] - b[1] + c[1] - d[1]) * u * v,
  };
}
export function groundUV(x, y) {
  const [a, b, c, d] = platform;
  const crossX = a[0] - b[0] + c[0] - d[0],
    crossY = a[1] - b[1] + c[1] - d[1];
  let u = 0.5,
    v = 0.5;
  for (let i = 0; i < 7; i++) {
    const p = groundPoint(u, v),
      dx = x - p.x,
      dy = y - p.y;
    const xu = b[0] - a[0] + crossX * v,
      xv = d[0] - a[0] + crossX * u;
    const yu = b[1] - a[1] + crossY * v,
      yv = d[1] - a[1] + crossY * u;
    const det = xu * yv - xv * yu;
    u += (dx * yv - dy * xv) / det;
    v += (dy * xu - dx * yu) / det;
  }
  return { u, v };
}
export function groundBasis(u, v) {
  const p = groundPoint(u, v),
    a = groundPoint(u + 0.001, v),
    b = groundPoint(u, v + 0.001);
  const d = Math.hypot(b.x - p.x, b.y - p.y);
  return {
    slope: (a.y - p.y) / (a.x - p.x),
    depth: [(b.x - p.x) / d, (b.y - p.y) / d],
  };
}
export function kioskPoint(station, x, y, depth = 0) {
  return [
    x + depth * station.basis.depth[0],
    y + x * station.basis.slope + depth * station.basis.depth[1],
  ];
}
export function onPlatform(x, y, margin = 0) {
  const { u, v } = groundUV(x, y);
  return u >= margin && v >= margin && u <= 1 - margin && v <= 1 - margin;
}
export function clampGround(x, y) {
  const { u, v } = groundUV(x, y);
  return groundPoint(
    Math.max(0.05, Math.min(0.95, u)),
    Math.max(0.24, Math.min(0.92, v)),
  );
}
function grounded(u, v, offsetX, offsetY, scale, footprint) {
  const ground = groundPoint(u, v);
  return {
    x: ground.x - offsetX * scale,
    y: ground.y - offsetY * scale,
    scale,
    ground,
    footprint,
  };
}
export const courtyardProps = {
  bench: grounded(0.28, 0.79, 14, 69, 0.78, [
    [-57, 53],
    [73, 40],
    [101, 69],
    [-23, 69],
  ]),
  lantern: grounded(0.94, 0.94, 2, 104, 0.71, [
    [-27, 100],
    [27, 100],
    [27, 108],
    [-27, 108],
  ]),
  pond: grounded(0.53, 0.82, 0, 0, 1, [
    [-81, -28],
    [81, -28],
    [81, 28],
    [-81, 28],
  ]),
  plant: grounded(0.1, 0.4, 0, 59, 0.49, [
    [-29, 43],
    [29, 43],
    [29, 59],
    [-29, 59],
  ]),
  flowers: grounded(0.1, 0.71, 0, 59, 0.52, [
    [-29, 43],
    [29, 43],
    [29, 59],
    [-29, 59],
  ]),
  can: grounded(0.25, 0.58, 0, 23, 0.55, [
    [-28, 13],
    [24, 13],
    [24, 26],
    [-28, 26],
  ]),
};
export const stations = [
  { x: 270, y: 337, scale: 0.66, ground: 451, visit: groundPoint(0.16, 0.41) },
  { x: 578, y: 316, scale: 0.64, ground: 427, visit: groundPoint(0.64, 0.41) },
  { x: 815, y: 385, scale: 0.68, ground: 510, visit: groundPoint(0.78, 0.86) },
].map((a) => {
  const uv = groundUV(a.x, a.y + 156 * a.scale);
  return { ...a, basis: groundBasis(uv.u, uv.v) };
});
courtyardProps.bench.basis = groundBasis(0.28, 0.79);
export function benchPoint(x, y, depth = 0) {
  return kioskPoint(courtyardProps.bench, x, y, depth);
}
courtyardProps.bench.footprint = [
  [-72, 69, 0],
  [72, 69, 0],
  [72, 69, -35],
  [-72, 69, -35],
].map((p) => benchPoint(...p));
const benchWorld = (x, y, d = 0) => {
  const p = benchPoint(x, y, d),
    b = courtyardProps.bench;
  return { x: b.x + p[0] * b.scale, y: b.y + p[1] * b.scale };
};
export const gardenBench = benchWorld(-24, 69, 36);
const footprint = courtyardProps.bench.footprint.map(([x, y]) => ({
  x: courtyardProps.bench.x + x * courtyardProps.bench.scale,
  y: courtyardProps.bench.y + y * courtyardProps.bench.scale,
}));
export const benchGeometry = {
  approach: gardenBench,
  perch: benchWorld(-24, 7, -8),
  obstacle: {
    minX: Math.min(...footprint.map((p) => p.x)) - 9,
    maxX: Math.max(...footprint.map((p) => p.x)) + 9,
    minY: Math.min(...footprint.map((p) => p.y)) - 9,
    maxY: Math.max(...footprint.map((p) => p.y)) + 9,
  },
};
