import { penLine } from "../../engine/pencil.js";
import { ellipsePts, clamp } from "../../engine/geom.js";

// Close-up choreography, drawn in world coordinates relative to the close-up's focus point so it
// zooms with the cell. Each function receives the phase (i) and its progress (u 0..1).
const ease = (u) => {
  const t = clamp(u);
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
const mixP = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const span = (u, a, b) => ease((u - a) / (b - a));

/** Shared drawing kit; `k` is the close-up's overall visibility. */
function kit(room, c, f, k) {
  const at = ([x, y]) => [f[0] + x, f[1] + y];
  return {
    mol(kind, p, progress = 1, s = 0.62, id = 7) {
      const [x, y] = at(p);
      // sizes are written relative to the overview's tokens; a close-up shows them half again as large
      // The sprite's recorded stroke-time map draws/erases ink; k only blends the lens entrance.
      room.drawMol(c, kind, x, y, id, k, s * 1.5, progress);
    },
    tag(text, p, alpha = 1, color = "#4a3a2c", size = 10.5) {
      const [x, y] = at(p);
      room.drawText(c, text, x, y, color, alpha * k, size, "center");
    },
    puff(text, p, alpha = 1, color = "#7a5a2a") {
      const [x, y] = at(p);
      if (alpha * k <= 0.01) return;
      c.save();
      c.globalAlpha *= alpha * k;
      c.font = '10px "小赖", serif';
      const w = c.measureText(text).width + 12;
      c.fillStyle = "rgba(250,244,230,0.92)";
      c.strokeStyle = "rgba(150,120,80,0.6)";
      c.lineWidth = 0.8;
      c.beginPath();
      c.ellipse(x, y, w / 2, 9, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.restore();
      room.drawText(c, text, x, y, color, alpha * k, 10, "center");
    },
    flash(p, u, label) {
      const [x, y] = at(p);
      if (u <= 0 || u >= 1) return;
      c.save();
      c.globalAlpha *= (1 - u) * 0.9 * k;
      c.strokeStyle = "#e0a63a";
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(x, y, 6 + u * 22, 0, Math.PI * 2);
      c.stroke();
      c.restore();
      if (label) room.drawText(c, label, x, y - 30, "#8a5a22", Math.min(1, u * 4) * k, 10.5, "center");
    },
    arrow(p, q, alpha = 1, color = "#8f8278", dash = true) {
      const [x0, y0] = at(p),
        [x1, y1] = at(q);
      if (alpha * k <= 0.01) return;
      c.save();
      c.globalAlpha *= alpha * k;
      c.strokeStyle = color;
      c.lineWidth = 1.4;
      if (dash) c.setLineDash([4, 4]);
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x1, y1);
      c.stroke();
      c.setLineDash([]);
      const a = Math.atan2(y1 - y0, x1 - x0);
      c.beginPath();
      c.moveTo(x1 - Math.cos(a - 0.5) * 6, y1 - Math.sin(a - 0.5) * 6);
      c.lineTo(x1, y1);
      c.lineTo(x1 - Math.cos(a + 0.5) * 6, y1 - Math.sin(a + 0.5) * 6);
      c.stroke();
      c.restore();
    },
    cross(p, alpha = 1, variant = 0) {
      const [x, y] = at(p);
      for (const s of [-1, 1]) penLine(c, [[x - 9, y - 9 * s], [x + 9, y + 9 * s]], { color: "#c0392b", width: 2.6, progress: alpha * k, variant, seed: 3 + s, taper: false });
    },
    ring(p, r, alpha, variant) {
      const [x, y] = at(p);
      penLine(c, ellipsePts(x, y, r, r * 0.88, 22, 0.06, variant), { color: "#c0482f", width: 1.4, progress: alpha * k, variant, seed: 9, taper: false });
    },
  };
}

/** Erase the reactant's recorded strokes completely before drawing the product. */
function replaceMolecule(K, a, b, p, t, s) {
  K.mol(a, p, 1 - span(t, 0, 0.4), s);
  K.mol(b, p, span(t, 0.4, 1), s);
}

const SCRIPTS = {
  mito(K, i, u) {
    const inMito = [-30, 24];
    if (i === 0) {
      K.mol("pyruvate", mixP([-170, -60], inMito, ease(u)));
      K.tag("丙酮酸", mixP([-170, -38], [inMito[0], inMito[1] + 22], ease(u)));
      return;
    }
    if (i === 1) {
      K.mol("co2", mixP([70, -50], [0, 18], span(u, 0, 0.55)), 1 - span(u, 0.55, 0.7), 0.55);
      replaceMolecule(K, "pyruvate", "oaa", inMito, span(u, 0.55, 0.85));
      K.flash([-30, 24], (u - 0.5) / 0.4, "丙酮酸羧化酶");
      K.puff("ATP → ADP + Pi", [-110, -10], span(u, 0.5, 0.75));
      K.tag(u < 0.7 ? "丙酮酸 + CO₂" : "草酰乙酸", [inMito[0], inMito[1] + 24], 1);
      return;
    }
    const out = [144, 0],
      go = span(u, 0.55, 1);
    replaceMolecule(K, "oaa", "pep", mixP(inMito, out, go), span(u, 0.25, 0.55));
    K.mol("co2", mixP(inMito, [60, 70], span(u, 0.05, 0.5)), 1 - span(u, 0.35, 0.55), 0.55);
    K.puff("GTP → GDP", [-110, -10], span(u, 0.2, 0.45));
    K.flash(inMito, (u - 0.15) / 0.4, "PEPCK");
    K.tag(u < 0.5 ? "草酰乙酸" : "PEP", mixP([inMito[0], inMito[1] + 24], [out[0], out[1] + 24], go));
  },
  triose(K, i, u) {
    const left = [-80, 30],
      right = [80, 30];
    if (i === 0) {
      K.mol("triose", left, span(u, 0, 0.4));
      K.mol("gap", right, span(u, 0.2, 0.6));
      K.tag("DHAP", [left[0], left[1] + 24], span(u, 0, 0.4));
      K.tag("GAP", [right[0], right[1] + 24], span(u, 0.2, 0.6));
      return;
    }
    if (i === 1) {
      const m = span(u, 0, 0.6),
        j = span(u, 0.62, 0.9);
      K.mol("triose", mixP(left, [-16, 18], m), 1 - span(j, 0, 0.4));
      K.mol("gap", mixP(right, [16, 18], m), 1 - span(j, 0, 0.4));
      K.mol("f16bp", [0, 12], span(j, 0.4, 1));
      K.flash([0, 16], (u - 0.58) / 0.35, "醛缩酶");
      K.tag(j < 0.5 ? "DHAP + GAP" : "果糖-1,6-二磷酸", [0, 40]);
      return;
    }
    const p = mixP([0, 12], [0, -60], ease(u));
    K.mol("f16bp", p);
    K.tag("果糖-1,6-二磷酸", [p[0] + 60, p[1]]);
    K.arrow([0, -78], [0, -110], 1 - ease(u) * 0.3, "#7aa7a1", false);
  },
  fbp1(K, i, u, patient, variant) {
    const site = [8, 16],
      below = [0, 100],
      above = [0, -98];
    if (i === 0) {
      const p = mixP(below, site, ease(u));
      K.mol("f16bp", p, 1, 0.66);
      K.tag("C1 磷酸", [p[0] + 34, p[1] - 18], span(u, 0.7, 1), "#a8671a", 10);
      K.tag("C6 磷酸", [p[0] - 34, p[1] - 18], span(u, 0.7, 1), "#a8671a", 10);
      return;
    }
    if (i === 1) {
      if (!patient) {
        K.mol("water", mixP([-80, -40], [0, 8], span(u, 0, 0.5)), 1 - span(u, 0.55, 0.65), 0.6);
        K.tag("H₂O", mixP([-80, -58], [0, -10], span(u, 0, 0.5)), 1 - span(u, 0.5, 0.6), "#2f5f86");
        replaceMolecule(K, "f16bp", "f6p", site, span(u, 0.55, 0.8), 0.66);
        const pp = mixP(site, [76, 44], span(u, 0.55, 1));
        K.mol("pi", pp, span(u, 0.52, 0.62), 0.6);
        K.tag("Pi", [pp[0], pp[1] + 20], span(u, 0.6, 0.8), "#a8671a");
        K.flash(site, (u - 0.5) / 0.4);
      } else {
        const w = u < 0.5 ? span(u, 0, 0.5) : 1 - span(u, 0.5, 1);
        K.mol("water", mixP([-80, -40], [-14, 4], w), 1, 0.6);
        K.tag("H₂O", mixP([-80, -58], [-14, -14], w), 1, "#2f5f86");
        K.mol("f16bp", [site[0] + Math.sin(u * 40) * 1.5 * (u > 0.4 ? 1 : 0), site[1]], 1, 0.66);
        K.cross([site[0] + 30, site[1] - 30], span(u, 0.45, 0.65), variant);
      }
      return;
    }
    if (!patient) {
      const p = mixP(site, above, ease(u));
      K.mol("f6p", p, 1, 0.66);
      K.tag("果糖-6-磷酸", [p[0] + 64, p[1]]);
      K.mol("pi", mixP([76, 44], [120, 90], ease(u)), 1 - ease(u), 0.6);
    } else {
      const p = mixP(site, below, ease(u));
      K.mol("f16bp", p, 1, 0.66);
      K.arrow([40, 110], [-100, 200], span(u, 0.4, 0.8));
      K.tag("流回丙酮酸、乳酸", [-60, 150], span(u, 0.5, 0.9), "#7a6f66");
    }
  },
  er(K, i, u) {
    const start = [180, 8],
      inEr = [-10, -30],
      out = [-168, -38],
      blood = [-220, -38];
    if (i === 0) {
      const p = mixP(start, inEr, ease(u));
      K.mol("g6p", p);
      K.tag("葡萄糖-6-磷酸", [p[0], p[1] + 24]);
      return;
    }
    if (i === 1) {
      replaceMolecule(K, "g6p", "glucose", inEr, span(u, 0.4, 0.7));
      K.flash(inEr, (u - 0.3) / 0.4, "葡萄糖-6-磷酸酶");
      const pp = mixP(inEr, [50, -76], span(u, 0.45, 1));
      K.mol("pi", pp, span(u, 0.42, 0.55) * (1 - span(u, 0.85, 1)), 0.55);
      K.tag("Pi", [pp[0] + 16, pp[1]], span(u, 0.5, 0.7) * (1 - span(u, 0.85, 1)), "#a8671a");
      K.tag(u < 0.6 ? "葡萄糖-6-磷酸" : "葡萄糖", [inEr[0], inEr[1] + 24]);
      return;
    }
    const p = u < 0.6 ? mixP(inEr, out, ease(u / 0.6)) : mixP(out, blood, ease((u - 0.6) / 0.4));
    K.mol("glucose", p, 1 - span(u, 0.85, 1));
    K.tag("GLUT2", [out[0] + 18, out[1] - 26], span(u, 0.3, 0.6), "#47727c");
    K.tag("葡萄糖 → 血液", [p[0], p[1] + 24], 1 - span(u, 0.85, 1));
  },
  fructose(K, i, u) {
    const enter = [150, 12],
      at = [-10, 12],
      dhap = [-48, -26],
      gald = [34, 42],
      tri = [-220, 6];
    if (i === 0) {
      const p = mixP(enter, at, span(u, 0, 0.55));
      replaceMolecule(K, "fructose", "f1p", p, span(u, 0.6, 0.85));
      K.puff("ATP → ADP", [60, -40], span(u, 0.55, 0.75));
      K.tag(u < 0.7 ? "果糖" : "果糖-1-磷酸", [p[0], p[1] + 26]);
      return;
    }
    if (i === 1) {
      const sp = span(u, 0.35, 0.8);
      K.mol("f1p", at, 1 - span(u, 0.3, 0.45));
      K.mol("triose", mixP(at, dhap, sp), span(u, 0.45, 0.65));
      K.mol("glyceraldehyde", mixP(at, gald, sp), span(u, 0.45, 0.65));
      K.flash(at, (u - 0.2) / 0.4, "醛缩酶 B");
      K.tag("DHAP", [dhap[0], dhap[1] + 24], span(u, 0.6, 0.85));
      K.tag("甘油醛", [gald[0], gald[1] + 24], span(u, 0.6, 0.85));
      return;
    }
    const m = ease(u);
    K.mol("triose", mixP(dhap, tri, m), 1 - span(u, 0.85, 1));
    K.mol("glyceraldehyde", mixP(gald, [tri[0] + 20, tri[1] + 20], m), 1 - span(u, 0.85, 1));
    K.arrow([-60, 60], [-200, 40], span(u, 0.1, 0.4));
    K.tag("经 FBP1", [-130, 66], span(u, 0.2, 0.5), "#8a2f22");
  },
};

/** Draw close-up `id` at phase i, progress u. */
export function drawCloseup(id, room, c, focus, { i, u }, { k = 1, patient = false, variant = 0 } = {}) {
  const K = kit(room, c, focus, k);
  SCRIPTS[id]?.(K, i, u, patient, variant);
}
