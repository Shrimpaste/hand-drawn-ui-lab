import { InkSprite } from "../../engine/sprite.js";
import { tint } from "../../engine/palette.js";
import { ELEMENT } from "../structure/paint.js";

// Small ball-and-stick drawings of the pathway's molecules, in the element colours of the structure
// room. Skeletons are flattened 2D sketches (rings as Haworth-like polygons), enough to tell a
// three-carbon acid from a hexose phosphate at a glance. Each is baked as three re-posed drafts.
const C = ELEMENT.C.color,
  O = ELEMENT.O.color,
  N = ELEMENT.N.color,
  Pc = ELEMENT.P.color;
const FAMILY = {
  c3: "#e3a3a0",
  glc: "#e7c46a",
  fru: "#e8a066",
  man: "#a7c77f",
  gal: "#93b9d8",
  c4: "#d7a6c8",
};

const ring = (n, r, rot) => Array.from({ length: n }, (_, i) => [Math.cos(rot + (i / n) * Math.PI * 2) * r, Math.sin(rot + (i / n) * Math.PI * 2) * r * 0.78]);

/** Molecule specs: atoms [x, y, element], bonds [i, j, order], optional ring polygon fill. */
function spec(kind) {
  const chain3 = (sub) => {
    const atoms = [[-11, 2, "C"], [0, -4, "C"], [11, 2, "C"]],
      bonds = [[0, 1, 1], [1, 2, 1]];
    const add = (x, y, e, to, order = 1) => {
      atoms.push([x, y, e]);
      bonds.push([to, atoms.length - 1, order]);
      return atoms.length - 1;
    };
    sub(add);
    return { atoms, bonds, family: "c3" };
  };
  const phos = (add, x, y, to) => {
    const o = add(x, y, "O", to);
    const p = add(x + 8, y - 4, "P", o);
    add(x + 15, y - 9, "O", p, 2);
    add(x + 13, y + 3, "O", p);
    return p;
  };
  const hexose = (family, pAt = []) => {
    // pyranose: ring O + C1..C5, C6 exocyclic on C5
    const pts = ring(6, 13, -Math.PI / 2 + 0.52);
    const atoms = pts.map(([x, y], i) => [x, y, i === 0 ? "O" : "C"]);
    const bonds = pts.map((_, i) => [i, (i + 1) % 6, 1]);
    const add = (x, y, e, to, order = 1) => {
      atoms.push([x, y, e]);
      bonds.push([to, atoms.length - 1, order]);
      return atoms.length - 1;
    };
    const c6 = add(pts[5][0] - 6, pts[5][1] - 11, "C", 5);
    const o6 = add(pts[5][0] - 14, pts[5][1] - 15, "O", c6);
    const o1 = add(pts[1][0] + 9, pts[1][1] - 4, "O", 1);
    add(pts[3][0] - 2, pts[3][1] + 10, "O", 3);
    if (pAt.includes(6)) phos(add, pts[5][0] - 24, pts[5][1] - 20, o6);
    if (pAt.includes(1)) {
      const p = add(pts[1][0] + 17, pts[1][1] - 8, "P", o1);
      add(pts[1][0] + 24, pts[1][1] - 13, "O", p, 2);
      add(pts[1][0] + 22, pts[1][1] - 1, "O", p);
    }
    return { atoms, bonds, family, ring: pts };
  };
  const furanose = (pAt = []) => {
    // ring O + C2..C5, C1 on C2 and C6 on C5
    const pts = ring(5, 11.5, -Math.PI / 2);
    const atoms = pts.map(([x, y], i) => [x, y, i === 0 ? "O" : "C"]);
    const bonds = pts.map((_, i) => [i, (i + 1) % 5, 1]);
    const add = (x, y, e, to, order = 1) => {
      atoms.push([x, y, e]);
      bonds.push([to, atoms.length - 1, order]);
      return atoms.length - 1;
    };
    const c1 = add(pts[1][0] + 10, pts[1][1] - 6, "C", 1);
    const o1 = add(pts[1][0] + 18, pts[1][1] - 12, "O", c1);
    const c6 = add(pts[4][0] - 10, pts[4][1] - 6, "C", 4);
    const o6 = add(pts[4][0] - 18, pts[4][1] - 12, "O", c6);
    add(pts[2][0] + 3, pts[2][1] + 9, "O", 2);
    if (pAt.includes(1)) {
      const p = add(pts[1][0] + 26, pts[1][1] - 16, "P", o1);
      add(pts[1][0] + 32, pts[1][1] - 22, "O", p, 2);
      add(pts[1][0] + 33, pts[1][1] - 10, "O", p);
    }
    if (pAt.includes(6)) {
      const p = add(pts[4][0] - 26, pts[4][1] - 16, "P", o6);
      add(pts[4][0] - 32, pts[4][1] - 22, "O", p, 2);
      add(pts[4][0] - 33, pts[4][1] - 10, "O", p);
    }
    return { atoms, bonds, family: "fru", ring: pts };
  };
  switch (kind) {
    case "lactate":
      return chain3((add) => {
        add(-18, -4, "O", 0, 2);
        add(-14, 11, "O", 0);
        add(0, -13, "O", 1);
      });
    case "pyruvate":
      return chain3((add) => {
        add(-18, -4, "O", 0, 2);
        add(-14, 11, "O", 0);
        add(0, -14, "O", 1, 2);
      });
    case "alanine":
      return chain3((add) => {
        add(-18, -4, "O", 0, 2);
        add(-14, 11, "O", 0);
        add(0, -14, "N", 1);
      });
    case "glycerol":
      return chain3((add) => {
        add(-17, -6, "O", 0);
        add(0, -14, "O", 1);
        add(17, -6, "O", 2);
      });
    case "g3p":
      return chain3((add) => {
        add(-17, -6, "O", 0);
        add(0, -14, "O", 1);
        phos(add, 17, -2, 2);
      });
    case "triose":
      return chain3((add) => {
        add(-17, -6, "O", 0);
        add(0, -14, "O", 1, 2);
        phos(add, 17, -2, 2);
      });
    case "gap":
      return chain3((add) => {
        add(-18, -5, "O", 0, 2);
        add(0, -14, "O", 1);
        phos(add, 17, -2, 2);
      });
    case "pep":
      return chain3((add) => {
        add(-18, -4, "O", 0, 2);
        add(-14, 11, "O", 0);
        phos(add, 2, -12, 1);
      });
    case "glyceraldehyde":
      return chain3((add) => {
        add(-18, -4, "O", 0, 2);
        add(0, -14, "O", 1);
        add(17, -6, "O", 2);
      });
    case "co2":
      return { atoms: [[-10, 0, "O"], [0, 0, "C"], [10, 0, "O"]], bonds: [[0, 1, 2], [1, 2, 2]], family: "c3", small: true };
    case "water":
      return { atoms: [[0, -2, "O"], [-8, 5, "H"], [8, 5, "H"]], bonds: [[0, 1, 1], [0, 2, 1]], family: "gal", small: true };
    case "pi":
      return { atoms: [[0, 0, "P"], [0, -10, "O"], [-9, 5, "O"], [9, 5, "O"], [0, 10, "O"]], bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [0, 4, 1]], family: "fru", small: true };
    case "oaa": {
      const atoms = [[-16, 2, "C"], [-5, -4, "C"], [6, 2, "C"], [17, -4, "C"]],
        bonds = [[0, 1, 1], [1, 2, 1], [2, 3, 1]];
      const add = (x, y, e, to, order = 1) => {
        atoms.push([x, y, e]);
        bonds.push([to, atoms.length - 1, order]);
      };
      add(-23, -4, "O", 0, 2);
      add(-19, 11, "O", 0);
      add(-5, -14, "O", 1, 2);
      add(24, -10, "O", 3, 2);
      add(22, 5, "O", 3);
      return { atoms, bonds, family: "c4" };
    }
    case "glucose":
      return hexose("glc");
    case "g6p":
      return hexose("glc", [6]);
    case "g1p":
      return hexose("glc", [1]);
    case "mannose":
      return hexose("man");
    case "m6p":
      return hexose("man", [6]);
    case "galactose":
      return hexose("gal");
    case "gal1p":
      return hexose("gal", [1]);
    case "fructose":
      return furanose();
    case "f1p":
      return furanose([1]);
    case "f6p":
      return furanose([6]);
    case "f16bp":
      return furanose([1, 6]);
    default:
      throw new Error(`no molecule drawing for ${kind}`);
  }
}

export const MOLECULE_KINDS = ["lactate", "pyruvate", "alanine", "glycerol", "g3p", "triose", "pep", "oaa", "glucose", "g6p", "g1p", "mannose", "m6p", "galactose", "gal1p", "fructose", "f1p", "f6p", "f16bp", "glyceraldehyde", "gap", "co2", "water", "pi"];

const RADIUS = { C: 3.6, O: 3.3, N: 3.5, P: 4.6, H: 2.4 };
const COLOR = { C, O, N, P: Pc, H: ELEMENT.H.color };

function moleculeSprite(kind, seed) {
  const m = spec(kind);
  // Keep the molecular origin at the pivot, with room for terminal atoms, draft offsets and ink.
  const extent = (axis) => Math.ceil(Math.max(...m.atoms.map((a) => Math.abs(a[axis]) + RADIUS[a[2]])) + 6);
  return new InkSprite(
    Math.max(84, extent(0) * 2),
    Math.max(64, extent(1) * 2),
    (p, c, v) => {
      const k = [0, 1, -0.8][v];
      // each draft leans the molecule a little differently, like a picture of thermal motion
      const pos = m.atoms.map(([x, y], i) => [x + Math.sin(i * 1.9 + v * 2.3) * 0.7 * k, y + Math.cos(i * 1.3 + v) * 0.6 * k]);
      if (m.ring) p.shape(m.ring.map(([x, y]) => [x * 0.86, y * 0.86]), FAMILY[m.family], { angular: true, shade: 0.25, density: 0.7, width: 0.7, double: false, base: 0.6 });
      else {
        const xs = pos.map((q) => q[0]),
          ys = pos.map((q) => q[1]);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2,
          cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        p.oval(cx, cy + 1, (Math.max(...xs) - Math.min(...xs)) / 2 + 6, (Math.max(...ys) - Math.min(...ys)) / 2 + 5, tint(FAMILY[m.family], 0.35), { shade: 0.1, density: 0.5, width: 0.5, double: false, base: 0.7, outlineAlpha: 0.4 });
      }
      for (const [i, j, order] of m.bonds) {
        const a = pos[i],
          b = pos[j];
        p.line([a, b], { color: "#5f5047", width: 1.5, straight: true, taper: false, boil: 0.2 });
        if (order === 2) {
          const dx = b[0] - a[0],
            dy = b[1] - a[1],
            d = Math.hypot(dx, dy) || 1,
            ox = (-dy / d) * 2.4,
            oy = (dx / d) * 2.4;
          p.line([[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy]], { color: "#5f5047", width: 1, straight: true, taper: false, boil: 0.2 });
        }
      }
      pos.forEach(([x, y], i) => {
        const e = m.atoms[i][2];
        p.oval(x, y, RADIUS[e], RADIUS[e] * 0.95, COLOR[e], { shade: 0.45, light: true, width: 0.9, double: false, density: 1.1 });
      });
    },
    { seed, variants: 3 },
  );
}

export function bakeMolecules() {
  const out = {};
  MOLECULE_KINDS.forEach((k, i) => (out[k] = moleculeSprite(k, 900 + i * 7)));
  return out;
}

export const _spec = spec;
