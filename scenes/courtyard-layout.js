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
  lantern: grounded(0.91, 0.87, 2, 104, 0.71, [
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
  { x: 578, y: 298, scale: 0.64, ground: 409, visit: groundPoint(0.64, 0.41) },
  { x: 844, y: 408, scale: 0.7, ground: 529, visit: groundPoint(0.78, 0.86) },
];
export const gardenBench = {
  x: courtyardProps.bench.x + 4,
  y: courtyardProps.bench.y + 16,
};
