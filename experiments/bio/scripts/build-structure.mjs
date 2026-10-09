// Turn three public crystal structures of human liver FBPase (FBP1) into one small JSON:
//   7C9Q  T-state tetramer with AMP + Mg2+ (1.88 A)
//   7CWE  apo R-state (3.0 A), assembled to a tetramer from its BIOMT operators
//   7CVH  tetramer with the substrate fructose-1,6-bisphosphate + two Mg2+ per active site
// Everything is superposed onto the 7C9Q frame, then centred and rotated so the three C2 axes of
// the tetramer lie on x, y, z. Only C-alpha traces, B-factors and the ligand/active-site atoms
// are kept (a few tens of kB).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePdb, residueSS, applyBiomt } from "../src/engine3d/pdb.js";
import { kabsch, centroid, applyMat, jacobi } from "../src/engine3d/linalg.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (id) => parsePdb(readFileSync(join(root, "references", "pdb", `${id}.pdb`), "utf8"));
const AA3 = { ALA: "A", ARG: "R", ASN: "N", ASP: "D", CYS: "C", GLN: "Q", GLU: "E", GLY: "G", HIS: "H", ILE: "I", LEU: "L", LYS: "K", MET: "M", PHE: "F", PRO: "P", SER: "S", THR: "T", TRP: "W", TYR: "Y", VAL: "V" };
const CHAINS = ["A", "B", "C", "D"];
const r1 = (v) => Math.round(v * 10) / 10;

// off converts file numbering to UniProt P09467 numbering (7C9Q counts from 0: DBREF 0-337 = UNP 1-338).
function caTrace(pdb, chain, off = 0) {
  const ca = new Map();
  for (const a of pdb.atoms) if (a.chain === chain && a.name === "CA") ca.set(a.resSeq + off, a);
  return ca;
}
const UNIPROT = "MADQAPFDTDVNTLTRFVMEEGRKARGTGELTQLLNSLCTAVKAISSAVRKAGIAHLYGIAGSTNVTGDQVKKLDVLSNDLVMNMLKSSFATCVLVSEEDKHAIIVEPEKRGKYVVCFDPLDGSSNIDCLVSVGTIFGIYRKKSTDEPSEKDALQPGRNLVAAGYALYGSATMLVLAMDCGVNCFMLDPAIGEFILVDKDVKIKKKGKIYSLNEGYARDFDPAVTEYIQRKKFPPDNSAPYGARYVGSMVADVHRTLVYGGIFLYPANKKSPNGKLRLLYECNPMAYVMEKAGGMATTGKEAVLDVIPTDIHQRAPVILGSPDDVLEFLKVYEKHSAQ";

const T = load("7C9Q"),
  R = load("7CWE"),
  S = load("7CVH");

// ---- T-state chains
const tCa = Object.fromEntries(CHAINS.map((c) => [c, caTrace(T, c, 1)]));

// ---- R-state tetramer from the two chains + operator 2; find the chain assignment that fits best
const rCopies = [];
for (const op of R.biomt) for (const c of ["A", "B"]) rCopies.push({ key: `${c}${op.id}`, ca: new Map([...caTrace(R, c)].map(([n, a]) => [n, { ...a, xyz: applyBiomt(op, [a.x, a.y, a.z]) }])) });
const perms = (arr) => (arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p])));
let bestMap = null;
for (const p of perms([0, 1, 2, 3])) {
  const P = [],
    Q = [];
  CHAINS.forEach((c, i) => {
    const rc = rCopies[p[i]].ca;
    for (const [n, a] of tCa[c]) if (rc.has(n)) {
      P.push(rc.get(n).xyz);
      Q.push([a.x, a.y, a.z]);
    }
  });
  const fit = kabsch(P, Q);
  if (!bestMap || fit.rmsd < bestMap.fit.rmsd) bestMap = { p, fit };
}
console.log("R->T chain assignment", bestMap.p.map((i) => rCopies[i].key).join(","), "global C-alpha RMSD", bestMap.fit.rmsd.toFixed(2), "A");

// ---- substrate tetramer onto T (chain letters differ between crystal forms, so search assignments)
const sCa = Object.fromEntries(CHAINS.map((c) => [c, caTrace(S, c)]));
let sBest = null;
for (const p of perms([0, 1, 2, 3])) {
  const P = [],
    Q = [];
  CHAINS.forEach((c, i) => {
    const sc = sCa[CHAINS[p[i]]];
    for (const [n, a] of tCa[c]) if (sc.has(n)) {
      P.push([sc.get(n).x, sc.get(n).y, sc.get(n).z]);
      Q.push([a.x, a.y, a.z]);
    }
  });
  const fit = kabsch(P, Q);
  if (!sBest || fit.rmsd < sBest.fit.rmsd) sBest = { p, fit };
}
const sFit = sBest.fit,
  sChainFor = (c) => CHAINS[sBest.p[CHAINS.indexOf(c)]];
console.log("7CVH chain assignment", sBest.p.map((i) => CHAINS[i]).join(","), "C-alpha RMSD", sFit.rmsd.toFixed(2), "A");

// ---- common frame: centre + principal axes of the T tetramer
const allT = CHAINS.flatMap((c) => [...tCa[c].values()].map((a) => [a.x, a.y, a.z]));
const ctr = centroid(allT);
const cov = [0, 1, 2].map((i) => [0, 1, 2].map((j) => allT.reduce((s, p) => s + (p[i] - ctr[i]) * (p[j] - ctr[j]), 0) / allT.length));
const eig = jacobi(cov);
const order = [0, 1, 2].sort((a, b) => eig.values[b] - eig.values[a]);
const axes = order.map((k) => [eig.vectors[0][k], eig.vectors[1][k], eig.vectors[2][k]]);
// right-handed: z = x cross y
axes[2] = [axes[0][1] * axes[1][2] - axes[0][2] * axes[1][1], axes[0][2] * axes[1][0] - axes[0][0] * axes[1][2], axes[0][0] * axes[1][1] - axes[0][1] * axes[1][0]];
const frame = (p) => {
  const d = [p[0] - ctr[0], p[1] - ctr[1], p[2] - ctr[2]];
  return axes.map((ax) => d[0] * ax[0] + d[1] * ax[1] + d[2] * ax[2]);
};
const pt = (xyz) => frame(xyz).map(r1);

// the numbering shift must be right: every residue letter has to match UniProt
for (const c of CHAINS) { let bad = 0; for (const [n, a] of tCa[c]) if (UNIPROT[n - 1] !== AA3[a.resName]) bad++; if (bad > 3) throw new Error(`7C9Q chain ${c}: ${bad} residues disagree with UniProt`); }
// ---- chains with the residues present in both states
const chains = CHAINS.map((c, i) => {
  const rc = rCopies[bestMap.p[i]].ca,
    nums = [...tCa[c].keys()].filter((n) => rc.has(n)).sort((a, b) => a - b),
    aa = nums.map((n) => AA3[tCa[c].get(n).resName] || "X").join("");
  return {
    id: c,
    num: nums,
    aa,
    ss: nums.map((n) => residueSS(T, c, n - 1)).join(""),
    ssR: nums.map((n) => residueSS(R, c === "A" || c === "B" ? c : c, n)).join(""),
    t: nums.flatMap((n) => pt([tCa[c].get(n).x, tCa[c].get(n).y, tCa[c].get(n).z])),
    r: nums.flatMap((n) => pt(bestMap.fit.apply(rc.get(n).xyz))),
    b: nums.map((n) => r1(tCa[c].get(n).b)),
    bR: nums.map((n) => r1(rc.get(n).b)),
  };
});
// secondary structure of R-state: its HELIX/SHEET records use chain A/B of the 7CWE file
chains.forEach((ch, i) => {
  const src = rCopies[bestMap.p[i]].key[0];
  ch.ssR = ch.num.map((n) => residueSS(R, src, n)).join("");
});

// ---- ligands in the T frame
const heavy = (list) => list.map((a) => ({ n: a.name, e: a.element, p: pt([a.x, a.y, a.z]) }));
const amp = CHAINS.map((c) => heavy(T.hetero.filter((h) => h.resName === "AMP" && h.chain === c)));
const mgT = CHAINS.map((c) => T.hetero.filter((h) => h.resName === "MG" && h.chain === c).map((h) => pt([h.x, h.y, h.z])));

// ---- active sites from the substrate structure
const siteFit = [],
  siteFitR = [];
const sites = CHAINS.map((tc) => {
  const c = sChainFor(tc);
  const own = [...sCa[c]].filter(([n]) => tCa[tc].has(n) && n >= 190 && n <= 335);
  const cfit = kabsch(own.map(([, a]) => [a.x, a.y, a.z]), own.map(([n]) => [tCa[tc].get(n).x, tCa[tc].get(n).y, tCa[tc].get(n).z]));
  siteFit.push(+cfit.rmsd.toFixed(2));
  // the same atoms placed on the R-state chain through the catalytic domain (residues 190-335)
  const rcaMap = rCopies[bestMap.p[CHAINS.indexOf(tc)]].ca;
  const ownR = [...sCa[c]].filter(([n]) => rcaMap.has(n) && n >= 190 && n <= 335);
  const rfit = kabsch(
    ownR.map(([, a]) => [a.x, a.y, a.z]),
    ownR.map(([n]) => bestMap.fit.apply(rcaMap.get(n).xyz)),
  );
  siteFitR.push(+rfit.rmsd.toFixed(2));
  const moveR = (a) => pt(rfit.apply([a.x, a.y, a.z]));
  const move = (a) => pt(cfit.apply([a.x, a.y, a.z]));
  const fbp = S.hetero.filter((h) => h.resName === "FBP" && h.chain === c);
  const mg = S.hetero.filter((h) => h.resName === "MG" && h.chain === c);
  const near = new Map();
  for (const a of S.atoms) {
    if (a.chain !== c) continue;
    if ([...fbp, ...mg].some((l) => Math.hypot(a.x - l.x, a.y - l.y, a.z - l.z) < 4.6)) near.set(a.resSeq, true);
  }
  const res = [...near.keys()].sort((a, b) => a - b).map((n) => {
    const atoms = S.atoms.filter((a) => a.chain === c && a.resSeq === n && !["N", "C", "O"].includes(a.name) || (a.chain === c && a.resSeq === n && a.name === "CA"));
    return { num: n, aa: AA3[atoms[0].resName] || "X", atoms: atoms.map((a) => ({ n: a.name, e: a.element, p: move(a), pR: moveR(a) })) };
  });
  return { chain: tc, fbp: fbp.map((a) => ({ n: a.name, e: a.element, p: move(a), pR: moveR(a) })), mg: mg.map((a) => ({ p: move(a), pR: moveR(a) })), res };
});

console.log("catalytic-domain fit to T:", siteFit.join(", "), "to R:", siteFitR.join(", "));
// ---- facts derived from the coordinates, used by tests and captions
const cen = (pts) => centroid(pts);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const site0 = sites[0];
const fbpC = cen(site0.fbp.map((a) => a.p)),
  ampC = cen(amp[0].map((a) => a.p));
const cterm = chains[0].num.map((n, i) => ({ n, p: chains[0].t.slice(i * 3, i * 3 + 3) })).filter((r) => r.n >= 321);
const facts = {
  ampToActiveSiteA: +dist(ampC, fbpC).toFixed(1),
  cTermFirst: cterm[0]?.n,
  cTermLast: cterm.at(-1)?.n,
  cTermToActiveSite: +Math.min(...cterm.map((r) => dist(r.p, fbpC))).toFixed(1),
  cTermResolved: cterm.length,
  gapsA: chains[0].num.filter((n, i, a) => i && n - a[i - 1] > 1).length,
};
console.log("facts", facts);

const out = {
  source: { T: "7C9Q", R: "7CWE", S: "7CVH", note: "C-alpha traces, aligned to 7C9Q; R-state and substrate structures superposed (Kabsch)" },
  rmsd: { r: +bestMap.fit.rmsd.toFixed(2), s: +sFit.rmsd.toFixed(2), siteT: siteFit, siteR: siteFitR },
  chains,
  amp,
  mgT,
  sites,
  facts,
};
const file = join(root, "src", "generated", "fbp1-structure.json");
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, JSON.stringify(out));
console.log("structure ->", file, (JSON.stringify(out).length / 1024).toFixed(0), "kB", "chains", chains.map((c) => c.num.length).join("/"));




