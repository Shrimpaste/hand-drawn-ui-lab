// Warm paper, bold pigments. Softness comes from paper gaps and pressure, not low alpha.
export const P = {
  paper: "#f1ebde",
  paperShade: "#e4dac4",
  ink: "#6b4a33",
  inkDeep: "#4e3423",
  soft: "#8d795c",
  faint: "#c9bda2",
  // liver + tissue
  liver: "#b5574a",
  liverLight: "#d98a72",
  liverDeep: "#8c3d36",
  cell: "#e7b892",
  cellLight: "#f0cfac",
  nucleus: "#7a5a9a",
  nucleusLight: "#a48dc0",
  sinusoid: "#c97a6d",
  // vessels
  vein: "#5a5f9e",
  veinLight: "#8e92c4",
  artery: "#b8463c",
  bile: "#7f9a3c",
  bileLight: "#b4c46e",
  // molecules
  blue: "#4c5190",
  blueLight: "#8389c0",
  red: "#aa493b",
  rose: "#d47862",
  blush: "#e39a85",
  teal: "#397e78",
  tealLight: "#77ada3",
  green: "#648144",
  greenLight: "#9fb56b",
  yellow: "#daa523",
  honey: "#b67a29",
  orange: "#d9843a",
  plum: "#71628f",
  cream: "#ebc696",
  wood: "#b48645",
  woodLight: "#cfa76a",
  woodGrain: "#8e6a3c",
  steel: "#6f8590",
  glass: "#a9c7c9",
  milk: "#f4efe3",
  fat: "#e9c25c",
  fatLight: "#f3dc93",
};

function parse(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
const toHex = (rgb) =>
  "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

export function mix(a, b, t) {
  const x = parse(a),
    y = parse(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
}

/** Outline belongs to the same pigment: darkened and nudged toward warm brown. */
export function edge(color) {
  if (!/^#[\da-f]{6}$/i.test(color)) return P.ink;
  const c = parse(color);
  return toHex(c.map((v, i) => v * 0.7 + [84, 56, 36][i] * 0.3 - 18));
}

export const shade = (color, t = 0.25) => mix(color, "#3c2a22", t);
export const tint = (color, t = 0.35) => mix(color, "#fff8ec", t);
