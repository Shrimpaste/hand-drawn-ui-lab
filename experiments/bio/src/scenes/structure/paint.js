import { InkSprite } from "../../engine/sprite.js";
import { rng } from "../../engine/rng.js";
import { P, mix, edge, tint } from "../../engine/palette.js";

export const PAPER = P.paper;
export const CHAIN_COLOR = { A: "#d9983f", B: "#4e9a92", C: "#8f78ad", D: "#c7675a" };
export const ELEMENT = {
  C: { color: "#74949b", r: 0.62 },
  N: { color: "#6d7ab8", r: 0.6 },
  O: { color: "#da7861", r: 0.58 },
  P: { color: "#e5a73c", r: 0.85 },
  S: { color: "#d8c24a", r: 0.85 },
  H: { color: "#f3e9cf", r: 0.32 },
  CL: { color: "#d4a63f", r: 0.62 },
  OW: { color: "#6fa3d0", r: 0.62 },
  MG: { color: "#79b25f", r: 0.78 },
};

/** Tiling crayon texture in one pigment: paper gaps and darker short strokes, all one direction. */
export function crayonPattern(ctx, color, fog = 0, seed = 1) {
  const S = 128,
    cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const c = cv.getContext("2d"),
    r = rng(seed),
    base = mix(color, PAPER, fog * 0.5);
  c.fillStyle = base;
  c.fillRect(0, 0, S, S);
  c.lineCap = "round";
  const stroke = (col, a, n, w, len) => {
    c.strokeStyle = col;
    for (let i = 0; i < n; i++) {
      const x = r() * S,
        y = r() * S,
        l = len * (0.4 + r());
      c.globalAlpha = a * (0.4 + r() * 0.6);
      c.lineWidth = w * (0.6 + r() * 0.8);
      // draw on both sides of the tile edge so the pattern tiles without seams
      for (const [ox, oy] of [[0, 0], [S, 0], [-S, 0], [0, S], [0, -S]]) {
        c.beginPath();
        c.moveTo(x + ox, y + oy);
        c.lineTo(x + ox + l * 0.85, y + oy - l * 0.5);
        c.stroke();
      }
    }
  };
  stroke(edge(base), 0.28, 150, 0.9, 11);
  stroke(tint(base, 0.5), 0.34, 90, 1.5, 9);
  stroke(PAPER, 0.4, 70, 1.1, 7);
  return ctx.createPattern(cv, "repeat");
}

/** Round atoms, three drawings each (contour variants), pivot at the centre. */
export function bakeAtoms() {
  const out = {};
  let seed = 400;
  for (const [el, { color }] of Object.entries(ELEMENT)) {
    out[el] = new InkSprite(
      44,
      44,
      (p) => {
        p.oval(0, 0, 16, 15.2, color, { shade: 0.55, light: true, width: 1.5, angle: -0.6, density: 1.2 });
        p.oval(-5, -5.5, 4.4, 3, tint(color, 0.7), { shade: 0, base: 0.9, width: 0.4, double: false, outlineAlpha: 0 });
      },
      { seed: seed++ },
    );
  }
  return out;
}
