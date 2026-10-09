/**
 * The common block (report section 1, figure 1) as data: which way each substrate takes into
 * glucose, whether it has to pass the FBP1 step, and a deliberately simple, schematic model of
 * blood glucose and lactate anchored on the case's measured values (3.2 and 2.5 mmol/L).
 */

/** Node sequences from the entry at the cell membrane to the exit. "tri" = DHAP / GAP. */
export const ROUTES = {
  lactate: ["lacIn", "lac", "pyr", "oaa", "pep", "tri", "f16bp", "f6p", "g6p", "glc", "glcOut"],
  alanine: ["alaIn", "ala", "pyr", "oaa", "pep", "tri", "f16bp", "f6p", "g6p", "glc", "glcOut"],
  glycerol: ["glyIn", "gly", "g3p", "tri", "f16bp", "f6p", "g6p", "glc", "glcOut"],
  fructose: ["fruIn", "fru", "f1p", "tri", "f16bp", "f6p", "g6p", "glc", "glcOut"],
  glycogen: ["gn", "g1p", "g6p", "glc", "glcOut"],
  galactose: ["galIn", "gal", "gal1p", "g1p", "g6p", "glc", "glcOut"],
  mannose: ["manIn", "man", "m6p", "f6p", "g6p", "glc", "glcOut"],
  // carbon held up before the block runs the glycolytic way back into pyruvate and lactate
  spill: ["f16bp", "tri", "pyr", "lac", "lacOut"],
};

export const BLOCK = ["f16bp", "f6p"];

export const passesFBP1 = (route) => route.some((n, i) => n === BLOCK[0] && route[i + 1] === BLOCK[1]);

/** Molecule carried while leaving each node. */
export const MOLECULE_OF = {
  lacIn: "lactate",
  lac: "lactate",
  lacOut: "lactate",
  pyr: "pyruvate",
  oaa: "oaa",
  pep: "pep",
  alaIn: "alanine",
  ala: "alanine",
  glyIn: "glycerol",
  gly: "glycerol",
  g3p: "g3p",
  tri: "triose",
  f16bp: "f16bp",
  f6p: "f6p",
  g6p: "g6p",
  glc: "glucose",
  glcOut: "glucose",
  fruIn: "fructose",
  fru: "fructose",
  f1p: "f1p",
  manIn: "mannose",
  man: "mannose",
  m6p: "m6p",
  galIn: "galactose",
  gal: "galactose",
  gal1p: "gal1p",
  g1p: "g1p",
  gn: "g1p",
};

/**
 * Schematic steady values (mmol/L). Not a physiological simulation: supply terms are relative,
 * chosen so the patient fasting with glycogen used up lands on the case's 3.2 and 2.5.
 */
export function bloodTargets({ patient = false, fed = false, glycogen = 0, iv = false }) {
  const supply = (fed ? 1 : 0) + 0.9 * Math.min(1, glycogen * 3) + (patient ? 0 : 0.8) + (iv ? 1.2 : 0);
  const glucose = 3.2 + 1.6 * Math.min(1, supply);
  const lactate = 1.0 + (patient ? (fed ? 0.6 : 1.5) : 0) * (iv ? 0.5 : 1);
  return { glucose, lactate };
}

/** Liver glycogen (0..1) after dt seconds of story time. */
export function stepGlycogen(g, dt, { fed = false, stress = false }) {
  const rate = fed ? 0.08 : stress ? -0.12 : -0.01;
  return Math.max(0, Math.min(1, g + rate * dt));
}

/** Tokens per second entering each route. Diet sugars only when the beat brings them in. */
export function spawnRates({ fed = false, stress = false, sugars = [], glycogen = 0 }) {
  const has = (s) => (sugars.includes(s) ? 0.6 : 0);
  return {
    lactate: 1.1,
    alanine: stress ? 0.8 : 0.5,
    glycerol: stress ? 0.9 : 0.45,
    glycogen: !fed && glycogen > 0.02 ? 1.1 * Math.min(1, glycogen * 2 + 0.3) : 0,
    fructose: has("fructose"),
    galactose: has("galactose"),
    mannose: has("mannose"),
  };
}
