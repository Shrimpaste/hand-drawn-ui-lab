// Minimal PDB reader for the structure views: atoms, hetero groups (water dropped),
// HELIX/SHEET ranges and REMARK 350 assembly operators. Fixed-column format.

const num = (s) => parseFloat(s.slice(0).trim());

export function parsePdb(text) {
  const out = { atoms: [], hetero: [], helix: [], sheet: [], biomt: [] };
  const ops = new Map();
  for (const line of text.split(/\r?\n/)) {
    const rec = line.slice(0, 6);
    if (rec === "ATOM  " || rec === "HETATM") {
      const resName = line.slice(17, 20).trim();
      if (rec === "HETATM" && resName === "HOH") continue;
      const atom = {
        serial: parseInt(line.slice(6, 11), 10),
        name: line.slice(12, 16).trim(),
        alt: line[16].trim(),
        resName,
        chain: line[21],
        resSeq: parseInt(line.slice(22, 26), 10),
        x: num(line.slice(30, 38)),
        y: num(line.slice(38, 46)),
        z: num(line.slice(46, 54)),
        b: num(line.slice(60, 66)),
        element: (line.slice(76, 78).trim() || line.slice(12, 16).trim().replace(/[0-9]/g, "")[0]).toUpperCase(),
      };
      if (atom.alt && atom.alt !== "A") continue;
      (rec === "ATOM  " ? out.atoms : out.hetero).push(atom);
    } else if (rec === "HELIX ") {
      out.helix.push({ chain: line[19], from: parseInt(line.slice(21, 25), 10), to: parseInt(line.slice(33, 37), 10) });
    } else if (rec === "SHEET ") {
      out.sheet.push({ chain: line[21], from: parseInt(line.slice(22, 26), 10), to: parseInt(line.slice(33, 37), 10) });
    } else if (line.startsWith("REMARK 350   BIOMT")) {
      const row = parseInt(line[18], 10) - 1,
        id = parseInt(line.slice(20, 23), 10),
        v = line.slice(23).trim().split(/\s+/).map(Number);
      const op = ops.get(id) || { id, m: new Array(9), t: [0, 0, 0] };
      op.m[row * 3] = v[0];
      op.m[row * 3 + 1] = v[1];
      op.m[row * 3 + 2] = v[2];
      op.t[row] = v[3];
      ops.set(id, op);
    }
  }
  out.biomt = [...ops.values()].sort((a, b) => a.id - b.id);
  return out;
}

export function residueSS(pdb, chain, resSeq) {
  if (pdb.helix.some((h) => h.chain === chain && resSeq >= h.from && resSeq <= h.to)) return "H";
  if (pdb.sheet.some((s) => s.chain === chain && resSeq >= s.from && resSeq <= s.to)) return "E";
  return "C";
}

export function applyBiomt(op, [x, y, z]) {
  const m = op.m;
  return [m[0] * x + m[1] * y + m[2] * z + op.t[0], m[3] * x + m[4] * y + m[5] * z + op.t[1], m[6] * x + m[7] * y + m[8] * z + op.t[2]];
}

const RADIUS = { H: 0.31, C: 0.76, N: 0.71, O: 0.66, P: 1.07, S: 1.05 };
const METALS = new Set(["MG", "ZN", "MN", "CA", "NA", "K", "FE"]);

/** Covalent bonds inferred from distances (visual use only); metals are never bonded. */
export function bondsByDistance(atoms, tol = 0.25) {
  const bonds = [];
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i];
    if (METALS.has(a.element) || !RADIUS[a.element]) continue;
    for (let j = i + 1; j < atoms.length; j++) {
      const b = atoms[j];
      if (METALS.has(b.element) || !RADIUS[b.element]) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      if (d > 0.4 && d < RADIUS[a.element] + RADIUS[b.element] + tol) bonds.push([i, j]);
    }
  }
  return bonds;
}
