// Where things sit in the hepatocyte cutaway (stage coordinates, 1280 x 800; the page is on the right).
// Blood runs down both sides; the left sinusoid takes glucose out and brings lactate, alanine and
// glycerol in; the right one brings diet sugars from the portal blood.

export const MEMBRANE = { left: 82, right: 798 };
export const BLOOD = { left: [0, 72], right: [808, 872] };

export const NODES = {
  glcOut: [MEMBRANE.left, 152],
  glc: [236, 152],
  g6p: [430, 198],
  g1p: [604, 198],
  gn: [704, 124],
  galIn: [MEMBRANE.right, 262],
  gal: [744, 262],
  gal1p: [662, 250],
  f6p: [430, 282],
  manIn: [MEMBRANE.right, 336],
  man: [744, 336],
  m6p: [636, 322],
  f16bp: [430, 480],
  tri: [430, 566],
  fruIn: [MEMBRANE.right, 572],
  fru: [744, 572],
  f1p: [640, 572],
  glyIn: [MEMBRANE.left, 500],
  gly: [170, 500],
  g3p: [276, 520],
  lacIn: [MEMBRANE.left, 600],
  lac: [168, 606],
  lacOut: [MEMBRANE.left, 640],
  pyr: [262, 648],
  oaa: [372, 694],
  pep: [536, 650],
  alaIn: [MEMBRANE.left, 694],
  ala: [168, 694],
};

/** The FBP1 tetramer sits on the F-1,6-BP -> F6P edge. */
export const FBP1_AT = [430, 390];

/** Sideways bend (px) of an edge "a>b"; positive bends to the left of travel. */
export const BEND = {
  "pyr>oaa": -10,
  "oaa>pep": 14,
  "pep>tri": -12,
  "g3p>tri": 18,
  "f1p>tri": -14,
  "gal1p>g1p": 6,
  "m6p>f6p": -10,
  "gn>g1p": 8,
  "g6p>glc": 12,
  "f16bp>tri": -40,
  "tri>pyr": 34,
  "pyr>lac": -16,
  "lac>lacOut": -6,
};

/** Route classes give the tracks their colour. */
export const ROUTE_CLASS = { lactate: "c3", alanine: "c3", glycerol: "c3", fructose: "fru", glycogen: "glc", galactose: "gal", mannose: "man", spill: "spill" };
export const TRACK_COLOR = { c3: "#c47b70", fru: "#cf8a4e", glc: "#b89a45", gal: "#6f9cc2", man: "#7ea35a", spill: "#9a8f86" };

/** Only these tags are written at all times; the rest appear when a beat points at them. */
export const MAIN_TAGS = ["glcOut", "g6p", "f6p", "f16bp", "tri", "pyr", "lac", "ala", "gly", "gn", "fru", "man", "gal"];

/** Point at u (0..1) on edge a>b, drawn as a quadratic curve bent sideways. */
export function edgePoint(a, b, u, bend = 0) {
  const [x0, y0] = a,
    [x1, y1] = b,
    mx = (x0 + x1) / 2,
    my = (y0 + y1) / 2,
    dx = x1 - x0,
    dy = y1 - y0,
    d = Math.hypot(dx, dy) || 1,
    cx = mx + (-dy / d) * bend,
    cy = my + (dx / d) * bend,
    v = 1 - u;
  return [v * v * x0 + 2 * v * u * cx + u * u * x1, v * v * y0 + 2 * v * u * cy + u * u * y1];
}
