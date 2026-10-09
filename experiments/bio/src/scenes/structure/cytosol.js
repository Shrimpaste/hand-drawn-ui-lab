import { InkSprite } from "../../engine/sprite.js";
import { Flicker } from "../../engine/flicker.js";
import { Spring } from "../../engine/motion.js";
import { P, mix, tint, edge } from "../../engine/palette.js";
import { rng } from "../../engine/rng.js";
import { ellipsePts } from "../../engine/geom.js";

// Hepatocyte cytosol as a layered space. Every object is baked as three genuinely different
// drawings (folds, chains and lobes re-posed), shown in an uneven alternation, while slow drift
// and tilt are continuous. Far things are pale and small, near things carry more pigment.
const jit = (pts, v, amp, seed = 0) => pts.map(([x, y], i) => [x + Math.sin(i * 1.7 + seed + v * 2.1) * amp, y + Math.cos(i * 1.3 + seed + v * 1.7) * amp]);
const pose = (v) => [0, 1, -0.8][v];
export const PAL = {
  er: ["#a9b9a2", "#889e86"],
  lumen: "#d9dfc9",
  riboL: ["#b88e9a", "#8c6a7f"],
  riboS: ["#9591ab", "#746f93"],
  glyc: ["#cbb376", "#a38f5f"],
  tub: ["#9fb4c9", "#7a93ad"],
  tub2: ["#c1a9b8", "#9c8396"],
  actin: ["#d1a9a0", "#a98078"],
  mito: ["#e3b180", "#bd8656"],
  prot: ["#7e9da9", "#60818f"],
  prot2: ["#92afad", "#718f99"],
};

export function er(w = 520, h = 170) {
  return new InkSprite(
    w,
    h,
    (p, c, v) => {
      const a = pose(v);
      const sheet = (y0, amp, thick, seed) => {
        const top = Array.from({ length: 12 }, (_, i) => [-w / 2 + 14 + (i * (w - 28)) / 11, y0 + Math.sin(i * 0.9 + seed) * amp + a * Math.sin(i + seed) * 2.2]);
        const bot = top.map(([x, y], i) => [x, y + thick + Math.sin(i * 0.7 + seed) * 2]).reverse();
        p.shape([...top, ...bot], PAL.er[0], { shade: 0.35, density: 0.8, width: 1.4, angle: 0.15, base: 0.5 });
        const inner = top.map(([x, y]) => [x, y + thick * 0.5]);
        p.line(inner, { color: PAL.er[1], width: 1, alpha: 0.7, boil: 0.5 });
        for (let i = 1; i < 11; i += 2) p.dot(top[i][0], top[i][1] - 3.6, 4.1, "#b78c99");
      };
      sheet(-44, 8, 17, 1);
      sheet(-4, 9, 18, 2.6);
      sheet(38, 7, 16, 4.1);
      // a tubule branching off the top sheet
      p.line(jit([[-110, -44], [-120, -66], [-98, -78], [-70, -70]], v, 1.2, 3), { color: PAL.er[1], width: 7.5, alpha: 0.9 });
      p.line(jit([[-110, -44], [-120, -66], [-98, -78], [-70, -70]], v, 1.2, 3), { color: PAL.lumen, width: 3.6 });
    },
    { seed: 701, variants: 3 },
  );
}

export function ribosome() {
  return new InkSprite(
    120,
    104,
    (p, c, v) => {
      const a = pose(v);
      p.shape(jit([[-46, 8], [-47, -14], [-30, -33], [-6, -40], [20, -31], [42, -11], [44, 9], [24, 19], [1, 13], [-22, 21]], v, 1.3, 7), PAL.riboL[0], { shade: 0.5, density: 0.9, width: 1.5, angle: -0.5 });
      p.shape(jit([[-34, 5], [-26, -16], [-8, -24], [10, -20], [18, -6], [4, 3], [-12, -2]], v, 1.1, 8), mix(PAL.riboL[0], PAL.riboL[1], 0.35), { shade: 0.3, density: 0.7, width: 1, base: 0.6 });
      for (let i = 0; i < 3; i++) p.line([[-26 + i * 17, -9 + a], [-22 + i * 17, -19], [-14 + i * 17, -20]], { color: tint(PAL.riboL[0], 0.6), width: 1.9, alpha: 0.9 });
      p.shape(jit([[-38, 14], [-14, 20], [12, 19], [36, 9], [44, 21], [28, 38], [4, 44], [-26, 35], [-42, 22]], v, 1.5, 9), PAL.riboS[0], { shade: 0.5, density: 0.9, width: 1.4, angle: 0.3 });
      p.line(jit([[-28, 24], [-9, 32], [10, 33], [30, 23]], v, 1, 10), { color: tint(PAL.riboS[0], 0.6), width: 2.2 });
      // mRNA threading between the subunits and a nascent chain
      p.line(jit([[-58, 17], [-38, 16], [-14, 18], [12, 17], [38, 15], [58, 21]], v, 2.2, 11), { color: "#a7986f", width: 1.5 });
      p.line(jit([[8, -36], [12, -52], [4, -60], [14, -70]], v, 2, 12), { color: "#a89aa3", width: 1.3 });
    },
    { seed: 711, variants: 3 },
  );
}

export function glycogen() {
  return new InkSprite(
    150,
    150,
    (p, c, v) => {
      const a = pose(v);
      const arm = (ang, len, depth = 0) => {
        const pts = [[0, 0]];
        for (let i = 1; i <= 4; i++) pts.push([Math.cos(ang + Math.sin(i * 1.3 + ang + a * 0.35) * 0.18) * (i * len), Math.sin(ang + Math.sin(i * 1.3 + ang + a * 0.35) * 0.18) * (i * len)]);
        p.line(pts, { color: PAL.glyc[1], width: 1.3, alpha: 0.9 });
        pts.slice(1).forEach(([x, y], i) => p.oval(x, y, 6.2 - depth - i * 0.2, 5.8 - depth - i * 0.2, PAL.glyc[0], { shade: 0.4, width: 0.9, double: false, density: 1.2 }));
        return pts;
      };
      for (let k = 0; k < 7; k++) {
        const ang = (k / 7) * Math.PI * 2 + 0.3,
          pts = arm(ang, 11);
        const [bx, by] = pts[2];
        for (const s of [-1, 1]) {
          const a2 = ang + s * 0.8;
          const sub = [[bx, by]];
          for (let i = 1; i <= 2; i++) sub.push([bx + Math.cos(a2 + a * 0.12) * i * 10, by + Math.sin(a2 + a * 0.12) * i * 10]);
          p.line(sub, { color: PAL.glyc[1], width: 1.1, alpha: 0.85 });
          sub.slice(1).forEach(([x, y]) => p.oval(x, y, 5.3, 5, tint(PAL.glyc[0], 0.12), { shade: 0.4, width: 0.8, double: false }));
        }
      }
      p.oval(0, 0, 11, 10.5, "#9c8a58", { shade: 0.6, width: 1.3, light: true });
      p.write("GN", 0, -6, { size: 9, align: "center", color: "#f4ead0" });
    },
    { seed: 721, variants: 3 },
  );
}

function tubulin() {
  return new InkSprite(
    300,
    56,
    (p, c, v) => {
      const a = pose(v);
      for (const row of [0, 1, 2]) {
        for (let i = 0; i < 13; i++) {
          const x = -135 + i * 21 + (row === 1 ? 10 : 0) + a * 0.6,
            y = -14 + row * 14 + Math.sin(i * 0.5 + row) * 1.2;
          p.oval(x, y, 10.2, 7.2, (i + row) % 2 ? PAL.tub[0] : PAL.tub2[0], { shade: 0.45, density: 1, width: 1, double: false, light: row === 0 });
        }
      }
    },
    { seed: 731, variants: 3 },
  );
}

function actin() {
  return new InkSprite(
    260,
    50,
    (p, c, v) => {
      const a = pose(v);
      for (const ph of [0, Math.PI]) {
        const pts = Array.from({ length: 24 }, (_, i) => [-118 + i * 10.4, Math.sin(i * 0.55 + ph + a * 0.12) * 11]);
        p.line(pts, { color: PAL.actin[1], width: 1.1, alpha: 0.8 });
        pts.forEach(([x, y], i) => i % 1 === 0 && p.oval(x, y, 6.6, 6.2, ph ? tint(PAL.actin[0], 0.2) : PAL.actin[0], { shade: 0.45, width: 0.9, double: false, density: 1.1 }));
      }
    },
    { seed: 741, variants: 3 },
  );
}

export function enzyme(seed, tintCol) {
  return new InkSprite(
    120,
    110,
    (p, c, v) => {
      const a = pose(v);
      p.shape(jit([[-38, -1], [-39, -22], [-22, -38], [0, -36], [16, -26], [22, -3], [10, 12], [-12, 19], [-30, 12]], v, 1.5, seed), tintCol[0], { shade: 0.55, density: 0.9, width: 1.5, angle: -0.5 });
      p.shape(jit([[10, 6], [14, -14], [30, -24], [48, -12], [50, 8], [34, 22], [16, 20]], v, 1.5, seed + 3), mix(tintCol[0], PAL.prot2[0], 0.5), { shade: 0.5, density: 0.9, width: 1.4, angle: 0.4 });
      p.line(jit([[-28, -4], [-24, -20], [-9, -27], [4, -18], [5, -2], [-7, 5]], v, 1.2, seed + 5), { color: tint(tintCol[0], 0.6), width: 2.1 });
      const helix = Array.from({ length: 22 }, (_, i) => [-22 + i * 1.8, 6 + Math.sin(i * 1.2 + a) * 4]);
      p.line(helix, { color: tintCol[1], width: 1.2 });
    },
    { seed, variants: 3 },
  );
}

export function mito() {
  return new InkSprite(
    360,
    210,
    (p, c, v) => {
      const a = pose(v);
      p.shape(jit(ellipsePts(0, 0, 160, 84, 18, 0).slice(0, -1), v, 2.2, 21), PAL.mito[0], { shade: 0.55, density: 0.9, width: 1.8, angle: -0.35, base: 0.55 });
      p.shape(jit(ellipsePts(0, 0, 145, 70, 18, 0).slice(0, -1), v, 2, 22), mix(PAL.mito[0], "#f4ead0", 0.55), { shade: 0.2, density: 0.5, width: 1.2, base: 0.5 });
      // cristae: folds of the inner membrane entering from the top and bottom
      for (let i = 0; i < 6; i++) {
        const x = -108 + i * 42 + a * 1.4,
          up = i % 2 === 0,
          s = up ? -1 : 1,
          len = 36 + ((i * 7) % 18);
        const pts = [[x - 9, s * 66], [x - 8, s * (66 - len * 0.6)], [x + a * 1.2, s * (66 - len)], [x + 8, s * (66 - len * 0.6)], [x + 9, s * 66]];
        p.line(pts, { color: PAL.mito[1], width: 2.8 });
        p.line(pts, { color: tint(PAL.mito[0], 0.45), width: 1 });
        for (let k = 0; k < 4; k++) p.dot(x + (k % 2 ? 11 : -11), s * (62 - k * (len / 5.5)), 2.4, "#8a6a52");
      }
      for (let k = 0; k < 9; k++) p.dot(-120 + k * 30, 10 * Math.sin(k * 1.7), 1.6, "#8e6a99");
    },
    { seed: 751, variants: 3 },
  );
}

function solute(kind) {
  return new InkSprite(
    46,
    46,
    (p, c, v) => {
      const a = pose(v);
      if (kind === "glucose") {
        const hex = Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * Math.PI * 2 + 0.3) * 11 + a * 0.6, Math.sin((i / 6) * Math.PI * 2 + 0.3) * 8.5]);
        p.shape(hex, P.yellow, { angular: true, shade: 0.35, width: 1.1, double: false, density: 1.2 });
        p.dot(hex[4][0], hex[4][1], 2.6, P.red);
      } else if (kind === "atp") {
        p.oval(-8, 0, 7.5, 6.5, "#d1b566", { shade: 0.4, width: 1, double: false });
        p.line([[0, 0], [10 + a, 2], [18, 0]], { color: "#b0803a", width: 1.6 });
        for (const x of [8, 15, 22]) p.dot(x + a * 0.5, x === 15 ? 2 : 0, 3.1, "#e5a73c");
      } else {
        // a Mg2+ with its first hydration shell
        p.dot(0, 0, 5.2, "#79b25f");
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + a * 0.12;
          p.dot(Math.cos(ang) * 12, Math.sin(ang) * 12, 2.7, "#da7861");
        }
      }
    },
    { seed: kind.length * 7 + 761, variants: 3 },
  );
}

/** Items: [kind, x, y, scale, layer(0 far..2 near), phase] in stage coordinates. */
const ITEMS = [
  ["er", 640, 700, 0.95, 0, 0.3],
  ["er", 1070, 760, 1.0, 0, 2.4],
  ["er", 250, 215, 0.7, 0, 3.2],
  ["mito", 70, 470, 0.72, 0, 1.1],
  ["tubulin", 770, 52, 0.9, 0, 4.1],
  ["actin", 150, 640, 0.9, 0, 2.2],
  ["ribosome", 585, 150, 0.9, 1, 1.7],
  ["ribosome", 60, 330, 0.8, 1, 3.3],
  ["ribosome", 835, 300, 0.85, 1, 5.1],
  ["glycogen", 90, 520, 1.0, 1, 0.8],
  ["glycogen", 820, 560, 0.9, 1, 4.4],
  ["glycogen", 700, 220, 0.62, 0, 2.9],
  ["enzyme1", 760, 700, 0.9, 1, 3.8],
  ["enzyme2", 60, 160, 0.75, 1, 0.6],
  ["enzyme1", 820, 130, 0.65, 0, 5.4],
  ["enzyme2", 500, 740, 0.7, 1, 1.9],
  ["glucose", 850, 430, 1, 2, 1.0],
  ["glucose", 40, 440, 1, 2, 3.0],
  ["atp", 790, 640, 1, 2, 2.0],
  ["atp", 150, 250, 1, 2, 4.0],
  ["mg", 810, 210, 1, 2, 5.0],
  ["mg", 70, 600, 1, 2, 0.2],
  ["glucose", 560, 770, 1, 2, 4.6],
];
const FOG = [0.62, 0.86, 1];

export class Cytosol {
  /** items: [kind, x, y, scale, layer, phase]; defaults to the structure room's arrangement. */
  constructor(items = ITEMS) {
    this.sprites = null;
    this.items = items.map(([kind, x, y, s, layer, phase], i) => ({ kind, x, y, s, layer, phase, i, flick: new Flicker(3, { seed: 300 + i * 3, min: 0.14, max: 0.36 }), greet: new Spring(0, { stiffness: 46, damping: 11 }) }));
    this.glow = null;
  }
  bake() {
    this.sprites = {
      er: er(),
      mito: mito(),
      tubulin: tubulin(),
      actin: actin(),
      ribosome: ribosome(),
      glycogen: glycogen(),
      enzyme1: enzyme(781, PAL.prot),
      enzyme2: enzyme(791, PAL.prot2),
      glucose: solute("glucose"),
      atp: solute("atp"),
      mg: solute("mg"),
    };
  }
  update(dt, reduced) {
    for (const it of this.items) it.greet.update(dt, reduced);
  }
  /** Draw one layer (0 far, 1 mid, 2 near). */
  draw(c, t, reduced, layer, progress, cam, hover) {
    if (!this.sprites) return;
    const o = cam.shift([0.12, 0.42, 0.78][layer]);
    for (const it of this.items) {
      if (it.layer !== layer) continue;
      const a = reduced ? 0 : t * (0.36 + it.i * 0.021) + it.phase,
        x = it.x + o.x + (reduced ? 0 : Math.sin(a) * (layer === 2 ? 14 : 7) + Math.sin(a * 1.7) * 2),
        y = it.y + o.y + (reduced ? 0 : Math.cos(a * 0.8) * (layer === 2 ? 11 : 5)),
        fr = it.flick.at(t, { reduced });
      const spr = this.sprites[it.kind];
      c.save();
      c.globalAlpha *= FOG[layer] * (layer === 2 ? 0.9 : 1);
      spr.draw(c, x, y, { progress: Math.min(1, progress), frame: fr, scale: it.s * (1 + it.greet.value * 0.06), angle: reduced ? 0 : Math.sin(a * 0.8) * 0.06, time: t, reduced });
      c.restore();
    }
  }
}
