import { bondsByDistance } from "../../engine3d/pdb.js";
import { reactionPose, dockPose } from "../../engine3d/reaction.js";
import { Spring } from "../../engine/motion.js";
import { Flicker, PACE } from "../../engine/flicker.js";
import { rng } from "../../engine/rng.js";
import { clamp, lerp } from "../../engine/geom.js";
import { ELEMENT } from "./paint.js";
import { contactSkeleton } from "./contacts.js";

const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mixP = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const centroid = (pts) => pts.reduce((s, p) => add(s, p, 1 / pts.length), [0, 0, 0]);
/** Rotate p about an axis through c (Rodrigues). */
function spinAbout(p, c, axis, ang) {
  const v = sub(p, c),
    k = unit(axis),
    cs = Math.cos(ang),
    sn = Math.sin(ang),
    kv = cross(k, v),
    kd = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
  return [c[0] + v[0] * cs + kv[0] * sn + k[0] * kd * (1 - cs), c[1] + v[1] * cs + kv[1] * sn + k[1] * kd * (1 - cs), c[2] + v[2] * cs + kv[2] * sn + k[2] * kd * (1 - cs)];
};
const asAtoms = (list, key = "p") => list.map((a) => ({ element: a.e, x: a[key][0], y: a[key][1], z: a[key][2] }));
// ligand carbons get their own colour so the substrate reads against the residues
const lig = (e) => (e === "C" ? "CL" : e);
const POLAR = new Set(["O", "N"]);

// Three thermal snapshots for ligand atoms (about 0.3 A, larger for terminal groups).
function jitterTable(seed) {
  const r = rng(seed);
  return Array.from({ length: 3 }, () => Array.from({ length: 512 }, () => [(r() - 0.5) * 0.6, (r() - 0.5) * 0.6, (r() - 0.5) * 0.6]));
}

export class Ligands {
  constructor(data) {
    this.jit = jitterTable(31);
    this.flick = new Flicker(3, { seed: 63, ...PACE.ligand });
    this.sites = data.sites.map((s, k) => {
      const centerT = centroid(s.fbp.map((a) => a.p)),
        centerR = centroid(s.fbp.map((a) => a.pR));
      const resAtoms = s.res.flatMap((r) => r.atoms.map((a) => ({ ...a, num: r.num, aa: r.aa })));
      const resBonds = bondsByDistance(asAtoms(resAtoms)).filter(([i, j]) => resAtoms[i].num === resAtoms[j].num),
        { keep, contact } = contactSkeleton(resAtoms, resBonds, [...s.fbp.map((a) => a.p), ...s.mg.map((m) => m.p)], 3.3);
      return {
        k,
        keep,
        contact,
        chain: s.chain,
        fbp: s.fbp,
        mg: s.mg,
        res: s.res,
        resAtoms,
        centerT,
        centerR,
        fbpBonds: bondsByDistance(asAtoms(s.fbp)),
        resBonds,
        dock: new Spring(0, { stiffness: 30, damping: 9 }),
        detail: new Spring(0, { stiffness: 40, damping: 12 }),
        flick: new Flicker(3, { seed: 100 + k * 7, ...PACE.ligand }),
        rxn: 0,
      };
    });
    this.amps = data.amp.map((atoms, k) => ({
      k,
      atoms,
      bonds: bondsByDistance(asAtoms(atoms)),
      center: centroid(atoms.map((a) => a.p)),
      bind: new Spring(0, { stiffness: 26, damping: 8 }),
      flick: new Flicker(3, { seed: 200 + k * 5, ...PACE.ligand }),
    }));
  }
  snap() {
    for (const s of this.sites) {
      s.dock.snap();
      s.detail.snap();
      s.rxn = 0;
    }
    for (const a of this.amps) a.bind.snap();
  }
  update(dt, reduced) {
    for (const s of this.sites) {
      s.dock.update(dt, reduced);
      s.detail.update(dt, reduced);
    }
    for (const a of this.amps) a.bind.update(dt, reduced);
  }
  /** World position a beat refers to at site k: {atom}, {mg}, or {between: [a, b]} (midpoint). */
  spotWorld(k, spec, rt) {
    const s = this.sites[k],
      at = (a) => mixP(a.pR, a.p, rt),
      atom = (name) => at(s.fbp.find((a) => a.n === name));
    if (spec.mg !== undefined) return at(s.mg[spec.mg]);
    if (spec.between) return mixP(atom(spec.between[0]), atom(spec.between[1]), 0.5);
    return atom(spec.atom);
  }
  siteCenter(k, rt) {
    const s = this.sites[k];
    return mixP(s.centerR, s.centerT, rt);
  }
  outward(k, rt) {
    return unit(this.siteCenter(k, rt));
  }
  /**
   * Emit everything to draw for the ligands as world-space primitives.
   * atoms: {p, el, r, alpha, frame}; bonds: {a, b, alpha, dash, color, w}; labels: {text, p, color}
   */
  collect(t, { rt, reduced, rxnSite = -1 }) {
    const out = { atoms: [], bonds: [], labels: [], hbonds: [] };
    for (const s of this.sites) this.collectSite(s, t, rt, reduced, rxnSite, out);
    for (const a of this.amps) this.collectAmp(a, t, rt, reduced, out);
    return out;
  }
  collectAmp(a, t, rt, reduced, out) {
    const p = clamp(a.bind.value);
    if (p <= 0.01) return;
    const { away, spin, alpha } = dockPose(p),
      f = a.flick.at(t, { reduced }),
      dir = unit(a.center),
      jitter = this.jit[f];
    const pos = a.atoms.map((at, i) => {
      let q = at.p;
      q = spinAbout(q, a.center, dir, spin * 2.2);
      q = add(q, dir, away * 34);
      return reduced ? q : add(q, jitter[(i * 5 + 11 * a.k) % 512], 0.7);
    });
    a.atoms.forEach((at, i) => out.atoms.push({ p: pos[i], el: lig(at.e), alpha, frame: f, r: 1 }));
    for (const [i, j] of a.bonds) out.bonds.push({ a: pos[i], b: pos[j], alpha, w: 1 });
    out.labels.push({ text: "AMP", p: add(a.center, dir, 7 + away * 34), color: "#8a5a22", alpha: clamp(alpha * 1.2), id: `amp${a.k}` });
  }
  collectSite(s, t, rt, reduced, rxnSite, out) {
    const f = s.flick.at(t, { reduced }),
      jitter = this.jit[f],
      dockP = clamp(s.dock.value),
      detail = clamp(s.detail.value),
      mixAt = (a) => mixP(a.pR, a.p, rt);
    const center = this.siteCenter(s.k, rt),
      out0 = unit(center);
    // Mg2+ come first and stay while the site is examined
    if (dockP > 0.01 || detail > 0.01) {
      const am = Math.max(dockP, detail);
      s.mg.forEach((m, i) => out.atoms.push({ p: reduced ? mixAt(m) : add(mixAt(m), jitter[(i * 13 + s.k * 3) % 512], 0.35), el: "MG", alpha: clamp(am * 2), frame: f, r: 1 }));
    }
    if (dockP > 0.01) {
      const { away, spin, alpha } = dockPose(dockP),
        react = s.k === rxnSite ? reactionPose(s.rxn) : { water: 0, stretch: 0, proton: 0, leave: 0 },
        running = s.k === rxnSite && s.rxn > 0;
      const base = s.fbp.map((a) => {
        let q = mixAt(a);
        q = spinAbout(q, center, out0, spin * 2);
        return add(q, out0, away * 26);
      });
      const idx = Object.fromEntries(s.fbp.map((a, i) => [a.n, i]));
      const P1 = base[idx.P1],
        O1 = base[idx.O1],
        leaveDir = unit(sub(P1, O1)),
        e1 = unit(cross(leaveDir, [0.31, 0.83, 0.47])),
        e2 = cross(leaveDir, e1);
      const piSet = new Set(["P1", "O1P", "O2P", "O3P"]);
      const shift = add(add([0, 0, 0], leaveDir, react.stretch * 1.3 + react.leave * 12), out0, react.leave * 7);
      const pos = s.fbp.map((a, i) => {
        let q = base[i];
        if (running && piSet.has(a.n)) q = add(q, shift);
        return reduced ? q : add(q, jitter[(i * 7 + s.k * 17) % 512], a.n.startsWith("O") && a.n.length > 2 ? 0.6 : 0.35);
      });
      const piAlpha = running ? 1 - clamp((react.leave - 0.55) / 0.45) : 1;
      s.fbp.forEach((a, i) => out.atoms.push({ p: pos[i], el: lig(a.e), alpha: alpha * (running && piSet.has(a.n) ? piAlpha : 1), frame: f, r: 1 }));
      for (const [i, j] of s.fbpBonds) {
        const na = s.fbp[i].n,
          nb = s.fbp[j].n,
          breaking = (na === "P1" && nb === "O1") || (na === "O1" && nb === "P1");
        const pi = (piSet.has(na) ? 1 : 0) + (piSet.has(nb) ? 1 : 0);
        out.bonds.push({ a: pos[i], b: pos[j], alpha: alpha * (breaking ? 1 - clamp(react.stretch * 1.1) : pi ? piAlpha : 1), dash: breaking && react.stretch > 0.05, w: 1 });
      }
      if (running) {
        // attacking water: arrives opposite O1 and becomes one oxygen of Pi
        const dW = lerp(6, 1.7, react.water),
          Ow = add(add(P1, leaveDir, dW), shift, 1),
          o = reduced ? Ow : add(Ow, jitter[(s.k * 29 + 3) % 512], 0.2),
          th = [0.0, 0.55, -0.5][f],
          hdir = (phi) => add(add([0, 0, 0], e1, Math.cos(phi)), e2, Math.sin(phi)),
          H1a = add(add(o, hdir(th + 0.91), 0.96), leaveDir, 0.4),
          H2 = add(add(o, hdir(th - 0.91), 0.96), leaveDir, 0.4),
          O1h = add(O1, unit(sub(O1, base[idx.C1])), 0.96),
          hop = Math.sin(react.proton * Math.PI) * 1.2,
          H1 = add(mixP(H1a, O1h, react.proton), e1, hop),
          wAlpha = alpha * clamp(react.water * 3) * (react.leave > 0.55 ? piAlpha : 1);
        out.atoms.push({ p: o, el: "OW", alpha: wAlpha, frame: f, r: 1 }, { p: H1, el: "H", alpha: wAlpha, frame: f, r: 1 }, { p: H2, el: "H", alpha: wAlpha, frame: f, r: 1 });
        out.bonds.push({ a: o, b: H1, alpha: wAlpha * (1 - react.proton), w: 0.7 }, { a: o, b: H2, alpha: wAlpha, w: 0.7 });
        out.bonds.push({ a: pos[idx.P1], b: o, alpha: wAlpha * react.water * react.water * (react.leave > 0.55 ? piAlpha : 1), w: 1 });
        out.bonds.push({ a: O1, b: O1h, alpha: wAlpha * react.proton, w: 0.7 });
        if (s.rxn > 0.02) {
          out.labels.push({ text: "H₂O", p: add(o, e1, 2.6), color: "#2f5f86", alpha: wAlpha, id: "water" });
          if (react.leave > 0.15) out.labels.push({ text: "Pi", p: add(add(pos[idx.P1], out0, 4.5), e1, -3), color: "#a8671a", alpha: piAlpha, id: "pi" });
          if (react.stretch >= 1) out.labels.push({ text: "F6P", p: add(base[idx.C3], e2, 7.5), color: "#355d58", alpha: 1, id: "f6p" });
        }
      } else if (dockP > 0.7) {
        out.labels.push({ text: "F-1,6-BP", p: add(base[idx.C3], e2, 7.5), color: "#355d58", alpha: clamp((dockP - 0.7) * 3), id: "fbp" });
      }
    }
    if (detail > 0.01) {
      const at = s.resAtoms.map((a) => mixAt(a)),
        keep = s.keep,
        // once the reaction runs, the surroundings step back so the bond change is what you see
        calm = s.k === rxnSite && s.rxn > 0 ? 1 - 0.65 * clamp(s.rxn * 8) : 1;
      s.resAtoms.forEach((a, i) => {
        if (!keep.has(i)) return;
        const q = reduced ? at[i] : add(at[i], jitter[(i * 3 + s.k * 41) % 512], 0.3);
        at[i] = q;
        if (a.n !== "CA") out.atoms.push({ p: q, el: a.e, alpha: detail * 0.85 * calm, frame: f, r: 0.5 });
      });
      for (const [i, j] of s.resBonds) if (keep.has(i) && keep.has(j)) out.bonds.push({ a: at[i], b: at[j], alpha: detail * 0.8 * calm, w: 0.55 });
      // hydrogen bonds and Mg coordination from the actual geometry
      const ligand = s.fbp.map((a) => ({ ...a, q: mixAt(a) }));
      s.resAtoms.forEach((a, i) => {
        if (!POLAR.has(a.e) || !keep.has(i)) return;
        for (const l of ligand) if (POLAR.has(l.e) && len(sub(at[i], l.q)) < 3.25 && dockP > 0.9) out.hbonds.push({ a: at[i], b: l.q, alpha: detail * dockP * calm, color: "#8c6a45" });
        for (const m of s.mg) if (a.e === "O" && len(sub(at[i], mixAt(m))) < 2.7) out.hbonds.push({ a: at[i], b: mixAt(m), alpha: detail * calm, color: "#5b9a45" });
      });
      for (const l of ligand) for (const m of s.mg) if (l.e === "O" && len(sub(l.q, mixAt(m))) < 2.7 && dockP > 0.9) out.hbonds.push({ a: l.q, b: mixAt(m), alpha: detail * dockP * calm, color: "#5b9a45" });
      // one label per residue that touches the ligand or Mg
      const seen = new Set();
      s.resAtoms.forEach((a, i) => {
        if (!s.contact.has(i) || seen.has(a.num)) return;
        seen.add(a.num);
        out.labels.push({ text: `${a.aa}${a.num}`, p: add(at[i], out0, 1.0), color: "#5c4631", alpha: detail * (calm < 1 ? Math.max(0, (calm - 0.35) / 0.65) : 1), small: true, id: `r${s.k}-${a.num}` });
      });
      s.mg.forEach((m, i) => out.labels.push({ text: "Mg²⁺", p: add(mixAt(m), out0, 2.4), color: "#3f7b2e", alpha: detail * (i ? 0.0 : 1), id: `mg${s.k}`, small: true }));
    }
    return out;
  }
}
