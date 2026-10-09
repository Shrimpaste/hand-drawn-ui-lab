import { InkSprite } from "../../engine/sprite.js";
import { mix, tint } from "../../engine/palette.js";
import { BLOOD, MEMBRANE } from "./layout.js";

// The hepatocyte's edges: sinusoid blood on both sides, the plasma membrane with GLUT2 carriers
// where molecules cross, and the red cells drifting down the sinusoid. Three drafts each.
const TOP = 96,
  BOTTOM = 742,
  H = BOTTOM - TOP;
const pose = (v) => [0, 1, -0.8][v];

export const BAND_TOP = TOP;

/** Sinusoid plasma with the fenestrated endothelium on the cell side. */
export function bloodBand(side) {
  const [x0, x1] = BLOOD[side],
    w = x1 - x0 + 8;
  return new InkSprite(
    w,
    H,
    (p, c, v) => {
      const k = pose(v),
        inner = side === "left" ? w - 6 : 6,
        outer = side === "left" ? -2 : w + 2;
      const edgePts = Array.from({ length: 24 }, (_, i) => [inner + Math.sin(i * 1.1 + k * 0.6) * 2.2, (i / 23) * H]);
      p.shape([[outer, 0], ...edgePts, [outer, H]], "#e7b7ad", { angular: true, shade: 0.25, density: 0.55, width: 0.9, base: 0.55, outlineAlpha: 0.5 });
      // endothelial lining with fenestrae: short strokes with gaps
      for (let i = 0; i < 22; i++) {
        const y0 = (i / 22) * H + 6,
          y1 = y0 + H / 22 - 10;
        const x = inner + (side === "left" ? -3 : 3) + Math.sin(i + k) * 0.8;
        p.line([[x, y0], [x + Math.sin(i) * 1.2, y1]], { color: "#b9837a", width: 2, straight: true, taper: false, boil: 0.25 });
      }
      for (let i = 0; i < 18; i++) p.dot(outer + (side === "left" ? 1 : -1) * (10 + ((i * 13) % 40)), 20 + i * 35 + k * 2, 1.4, "#c99a90", 0.6);
    },
    { pivot: [0, 0], seed: side === "left" ? 1101 : 1103, variants: 3 },
  );
}

/** Lipid bilayer down the cell edge, with GLUT2 carriers at the given heights. */
export function membrane(side, carriers) {
  const w = 34;
  return new InkSprite(
    w,
    H,
    (p, c, v) => {
      const k = pose(v),
        mid = w / 2;
      for (const off of [-4, 4]) {
        const pts = Array.from({ length: 30 }, (_, i) => [mid + off + Math.sin(i * 0.8 + k * 0.5) * 1.2, (i / 29) * H]);
        p.line(pts, { color: "#a58f6a", width: 1.3, taper: false, boil: 0.25 });
        for (let i = 0; i < 64; i++) p.dot(mid + off * 1.7 + Math.sin(i * 0.8) * 0.8, (i / 63) * H, 1.5, off < 0 ? "#c9b48a" : "#b9a37a", 0.85);
      }
      for (const y of carriers) {
        const yy = y - TOP;
        // GLUT2: a barrel of helices spanning the bilayer, open in the middle
        for (const s of [-1, 1]) p.shape([[mid + s * 3, yy - 13], [mid + s * 10, yy - 11 + k], [mid + s * 11, yy + 11], [mid + s * 3, yy + 13]], s < 0 ? "#8fb0b8" : "#7d9fa9", { shade: 0.45, density: 0.9, width: 1.1 });
      }
    },
    { pivot: [w / 2, 0], seed: side === "left" ? 1111 : 1113, variants: 3 },
  );
}

/** A red cell, seen slightly tilted: biconcave disc with a paler centre. */
export function redCell() {
  return new InkSprite(
    34,
    26,
    (p, c, v) => {
      const k = pose(v);
      p.oval(0, 0, 13 + k * 0.4, 9.5 - k * 0.3, "#c9574d", { shade: 0.45, density: 1, width: 1.1, light: true });
      p.oval(1, 0.5, 5.5, 3.6, tint("#c9574d", 0.4), { shade: 0, width: 0.6, double: false, base: 0.8 });
    },
    { seed: 1121, variants: 3 },
  );
}

/** A soft gradient halo used to light whatever a beat is pointing at. */
export function glow(c, x, y, r, color, alpha) {
  if (alpha <= 0.01) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(255,255,255,0)");
  c.save();
  c.globalAlpha *= alpha;
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
  c.restore();
}

export const PLASMA = mix("#e7b7ad", "#f4e8dc", 0.3);
export { MEMBRANE };
