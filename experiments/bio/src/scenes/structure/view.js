import { Spring } from "../../engine/motion.js";
import { Flicker, PACE, hoverRate } from "../../engine/flicker.js";
import { pickChain, segmentVisible } from "./picking.js";
import { P, mix, edge, tint } from "../../engine/palette.js";
import { clamp, lerp } from "../../engine/geom.js";
import { quatFromAxisAngle, quatFromTo, quatMul, quatSlerp, quatToMat, quatNormalize, applyMat, project } from "../../engine3d/linalg.js";
import { conformerFrames } from "../../engine3d/conformers.js";
import { splineChain } from "../../engine3d/ribbon.js";
import { Ligands } from "./ligands.js";
import { CHAIN_COLOR, PAPER, ELEMENT, crayonPattern, bakeAtoms } from "./paint.js";

const NB = 9;
const WIDTH = { C: 0.9, E: 2.2, H: 2.6 }; // ribbon widths in Angstrom
const PAGE = { w: 1280, h: 800 };
const BASE_Q = quatMul(quatFromAxisAngle([1, 0, 0], -0.42), quatFromAxisAngle([0, 1, 0], 0.5));
const TAIL_FROM = 321,
  LOST_FROM = 333;

/**
 * Real 3D view of the FBP1 tetramer: C-alpha ribbons from the crystal structures, breathing
 * through three B-factor conformer snapshots, drawn in crayon with depth-ordered bins.
 */
export class StructureView {
  constructor(data, { cx = 440, cy = 410, scale = 4.3 } = {}) {
    this.data = data;
    this.cx = cx;
    this.cy = cy;
    this.dist = 330;
    this.baseScale = scale;
    this.chains = data.chains.map((ch, k) => ({
      ...ch,
      k,
      t: Float32Array.from(ch.t),
      r: Float32Array.from(ch.r),
      n: ch.num.length,
      frames: conformerFrames(ch.b, { frames: 3, seed: 11 + k * 3 }),
      flick: new Flicker(3, { seed: 21 + k * 5, ...PACE.protein }),
      // quick, nearly critical: chains that fade out of a close-up stop costing raster time early
      alpha: new Spring(1, { stiffness: 130, damping: 23 }),
    }));
    this.ligands = new Ligands(data);
    this.atoms = null;
    this.patterns = null;
    // pose state
    this.qFocus = [...BASE_Q];
    this.qDrag = [1, 0, 0, 0];
    this.omega = [0, 0];
    this.dragging = false;
    this.q = [...BASE_Q];
    this.focusPos = [new Spring(0), new Spring(0), new Spring(0)];
    this.zoom = new Spring(1, { stiffness: 36, damping: 11 });
    this.thin = new Spring(1, { stiffness: 50, damping: 13 });
    this.focusK = -1;
    this.focusAmt = new Spring(0, { stiffness: 40, damping: 12 });
    this.rt = new Spring(0, { stiffness: 18, damping: 7 });
    this.mut = new Spring(0, { stiffness: 30, damping: 10 });
    this.tail = new Spring(0, { stiffness: 40, damping: 12 });
    this.hover = -1;
    /** Render tier from the frame governor: 0 full, 1 no highlight/hatching passes, 2 also flat colour instead of crayon texture. */
    this.tier = 0;
    this.sub = 3;
    this.moving = false;
    this.excite = new Spring(0, { stiffness: 80, damping: 12 });
    this.rxnSite = -1;
    this.pick = [];
    this.proj = { s: baseScale(scale), R: quatToMat(BASE_Q) };
    this.sceneData = null;
  }
  get ready() {
    return !!this.atoms;
  }
  bake(ctx) {
    this.atoms = bakeAtoms();
    this.patterns = Object.fromEntries(Object.entries(CHAIN_COLOR).map(([id, col], i) => [id, [0, 1, 2, 3].map((fog) => crayonPattern(ctx, col, fog / 3, 40 + i * 9 + fog))]));
  }
  /** Orient the camera on one active site (k) or release it (-1). */
  setFocus(k) {
    this.focusK = k;
    if (k >= 0) {
      const c = this.ligands.siteCenter(k, 1),
        dir = c.map((v) => v / Math.hypot(...c));
      this.qFocus = quatFromTo(dir, [0, 0, 1]);
      this.focusPos.forEach((s, i) => (s.target = c[i]));
      this.zoom.target = 4.3;
      this.thin.target = 0.2;
    } else {
      this.qFocus = [...BASE_Q];
      this.focusPos.forEach((s) => (s.target = 0));
      this.zoom.target = 1;
      this.thin.target = 1;
    }
    this.focusAmt.target = k >= 0 ? 1 : 0;
    this.chains.forEach((ch) => (ch.alpha.target = k < 0 ? 1 : ch.k === k ? 0.3 : 0.05));
  }
  dragBy(dx, dy) {
    if (this.focusK >= 0) return;
    this.dragging = true;
    const qa = quatMul(quatFromAxisAngle([0, 1, 0], dx * 0.011), quatFromAxisAngle([1, 0, 0], dy * 0.011));
    this.qDrag = quatNormalize(quatMul(qa, this.qDrag));
    this.omega = [dx, dy];
  }
  release() {
    this.dragging = false;
  }
  /** Jump every spring to where it is heading, e.g. after a rehearsal. */
  snap() {
    const sp = [this.zoom, this.thin, this.focusAmt, this.rt, this.mut, this.tail, this.excite, ...this.focusPos, ...this.chains.map((c) => c.alpha)];
    for (const s of sp) s.snap();
    this.ligands.snap();
    this.qCur = [...this.qFocus];
    this.qDrag = [1, 0, 0, 0];
    this.omega = [0, 0];
    this.settle = false;
    this.dragging = false;
  }
  /** Ease the user's rotation back to the default view. */
  resetDrag() {
    this.settle = true;
    this.omega = [0, 0];
  }
  /** World position of residue `num` on chain k in the current R/T blend. */
  resPos(k, num) {
    const ch = this.chains[k],
      i = ch.num.indexOf(num);
    if (i < 0) return [0, 0, 0];
    const rt = this.rt.value;
    return [0, 1, 2].map((a) => ch.r[i * 3 + a] + (ch.t[i * 3 + a] - ch.r[i * 3 + a]) * rt);
  }
  chainCenter(k) {
    const ch = this.chains[k],
      c = [0, 0, 0],
      rt = this.rt.value;
    for (let i = 0; i < ch.n; i++) for (let a = 0; a < 3; a++) c[a] += (ch.r[i * 3 + a] + (ch.t[i * 3 + a] - ch.r[i * 3 + a]) * rt) / ch.n;
    return c;
  }
  update(dt, t, reduced) {
    const sp = [this.zoom, this.thin, this.focusAmt, this.rt, this.mut, this.tail, this.excite, ...this.focusPos, ...this.chains.map((c) => c.alpha)];
    for (const s of sp) s.update(dt, reduced);
    this.ligands.update(dt, reduced);
    const k = 1 - Math.exp(-dt / 0.3);
    this.qCur = this.qCur ? quatSlerp(this.qCur, this.qFocus, k) : [...this.qFocus];
    if (this.focusK >= 0 || this.settle) {
      this.qDrag = quatSlerp(this.qDrag, [1, 0, 0, 0], 1 - Math.exp(-dt / 0.25));
      if (this.settle && Math.abs(this.qDrag[0]) > 0.99995) {
        this.qDrag = [1, 0, 0, 0];
        this.settle = false;
      }
    } else if (!this.dragging && !reduced) {
      // inertia after a flick, then rest
      const [ox, oy] = this.omega,
        rate = 60 * dt;
      if (Math.abs(ox) + Math.abs(oy) > 0.02) {
        this.qDrag = quatNormalize(quatMul(quatMul(quatFromAxisAngle([0, 1, 0], ox * 0.011 * rate), quatFromAxisAngle([1, 0, 0], oy * 0.011 * rate)), this.qDrag));
        this.omega = [ox * Math.exp(-dt * 3.2), oy * Math.exp(-dt * 3.2)];
      }
    }
    const sway = reduced || this.focusK >= 0 || this.dragging ? [1, 0, 0, 0] : quatMul(quatFromAxisAngle([0, 1, 0], Math.sin(t * 0.33) * 0.1), quatFromAxisAngle([1, 0, 0], Math.sin(t * 0.21 + 1) * 0.04));
    this.q = quatNormalize(quatMul(sway, quatMul(this.qDrag, this.qCur)));
    this.R = quatToMat(this.q);
    this.F = this.focusPos.map((s) => s.value);
    this.f = this.dist * this.baseScale * this.zoom.value;
    // fewer spline pieces while the camera dives: every piece costs round caps and joins in the stroker
    this.moving = Math.abs(this.zoom.target - this.zoom.value) > 0.03 || Math.abs(this.focusAmt.target - this.focusAmt.value) > 0.03;
    this.sub = (this.moving ? [2, 1, 1] : [3, 2, 2])[this.tier];
  }
  /** world point -> view coordinates */
  toView(p) {
    return applyMat(this.R, [p[0] - this.F[0], p[1] - this.F[1], p[2] - this.F[2]]);
  }
  screen(p) {
    return project(this.toView(p), { f: this.f, cx: this.cx, cy: this.cy, dist: this.dist });
  }
  /** Nearest front chain under a screen point, or -1. */
  hit(x, y) {
    if (this.focusAmt.value > 0.05) return -1;
    return pickChain(this.pick, x, y, (k) => this.chains[k].alpha.value >= 0.5);
  }  buildRuns(t, reduced) {
    const rt = this.rt.value,
      runs = [];
    let dmin = Infinity,
      dmax = -Infinity;
    for (const ch of this.chains) {
      const rate = hoverRate(ch.k === this.hover, "protein"),
        fi = ch.flick.at(t, { rate, reduced }),
        off = ch.frames[fi],
        views = [];
      for (let i = 0; i < ch.n; i++) {
        const j = i * 3,
          x = ch.r[j] + (ch.t[j] - ch.r[j]) * rt + (reduced ? 0 : off[j]),
          y = ch.r[j + 1] + (ch.t[j + 1] - ch.r[j + 1]) * rt + (reduced ? 0 : off[j + 1]),
          z = ch.r[j + 2] + (ch.t[j + 2] - ch.r[j + 2]) * rt + (reduced ? 0 : off[j + 2]);
        views.push(this.toView([x, y, z]));
      }
      const ss = rt > 0.5 ? ch.ss : ch.ssR,
        segs = splineChain(views, ch.num, ss, { sub: this.sub }).map((run) =>
          run.map((s) => {
            const pr = project(s.p, { f: this.f, cx: this.cx, cy: this.cy, dist: this.dist });
            dmin = Math.min(dmin, pr.depth);
            dmax = Math.max(dmax, pr.depth);
            return { x: pr.x, y: pr.y, s: pr.s, depth: pr.depth, ss: s.ss, res: s.res, num: ch.num[Math.round(s.res)], fi };
          }),
        );
      runs.push(segs);
    }
    this.dmin = dmin;
    this.dmax = dmax;
    return runs;
  }
  binOf(depth) {
    const span = Math.max(1, this.dmax - this.dmin);
    return clamp(Math.floor(((this.dmax - depth) / span) * NB), 0, NB - 1);
  }
  draw(c, t, reduced, reveal = 1) {
    if (!this.ready || reveal <= 0) return;
    const runs = this.buildRuns(t, reduced),
      thin = this.thin.value,
      mut = this.mut.value,
      tailMark = this.tail.value;
    const newBucket = () => ({ chains: this.chains.map(() => ({ C: new Path2D(), E: new Path2D(), H: new Path2D(), hatch: new Path2D(), arrows: [], tail: [], gap: new Path2D(), n: 0, sSum: 0 })), items: [] });
    const buckets = Array.from({ length: NB + 1 }, newBucket);
    this.pick = [];
    runs.forEach((chainRuns, k) => {
      chainRuns.forEach((run, ri) => {
        for (let i = 0; i < run.length - 1; i++) {
          const a = run[i],
            b = run[i + 1],
            bk = buckets[this.binOf((a.depth + b.depth) / 2)].chains[k];
          // the backbone is traced from N to C terminus while the page is being drawn
          if (reveal < 1 && a.res / this.chains[k].n > reveal) continue;
          // close-ups put most of the chain far off the page; stroking that unseen part is pure cost
          if (!segmentVisible(a, b, WIDTH[a.ss] * a.s * thin + 14, PAGE)) continue;
          bk.n++;
          bk.sSum += a.s;
          const wob = reduced ? 0 : 0.0,
            ax = a.x + wob,
            ay = a.y;
          if (i % 2 === 0) this.pick.push({ x: a.x, y: a.y, depth: a.depth, k, r: Math.max(7, WIDTH[a.ss] * a.s * thin * 0.7) });
          if (a.num >= TAIL_FROM) {
            bk.tail.push({ a, b, wrong: a.num < LOST_FROM });
            continue;
          }
          const path = bk[a.ss] || bk.C;
          path.moveTo(ax, ay);
          path.lineTo(b.x, b.y);
          if (a.ss === "H" && i % 2 === 0) {
            const dx = b.x - a.x,
              dy = b.y - a.y,
              d = Math.hypot(dx, dy) || 1,
              w = WIDTH.H * a.s * thin * 0.52;
            bk.hatch.moveTo(a.x - (dy / d) * w, a.y + (dx / d) * w);
            bk.hatch.lineTo(a.x + (dy / d) * w, a.y - (dx / d) * w);
          }
          if (a.ss === "E" && run[i + 2] && run[i + 2].ss !== "E" && Math.round(b.res) !== Math.round(a.res)) {
            const dx = b.x - a.x,
              dy = b.y - a.y,
              d = Math.hypot(dx, dy) || 1,
              w = WIDTH.E * a.s * thin;
            bk.arrows.push([[b.x + (dx / d) * w * 1.3, b.y + (dy / d) * w * 1.3], [b.x - (dy / d) * w * 0.95, b.y + (dx / d) * w * 0.95], [b.x + (dy / d) * w * 0.95, b.y - (dx / d) * w * 0.95]]);
          }
        }
        // dashed bridge over a disordered, unresolved stretch
        const next = chainRuns[ri + 1];
        if (next) {
          const a = run.at(-1),
            b = next[0],
            bk = buckets[this.binOf((a.depth + b.depth) / 2)].chains[k];
          bk.gap.moveTo(a.x, a.y);
          bk.gap.quadraticCurveTo((a.x + b.x) / 2 + 7, (a.y + b.y) / 2 - 9, b.x, b.y);
        }
      });
    });

    // ligands, residues, bonds
    const lig = this.ligands.collect(t, { rt: this.rt.value, reduced, rxnSite: this.rxnSite });
    const top = this.focusAmt.value > 0.5 ? NB : -1;
    const place = (depth) => (top >= 0 ? top : this.binOf(depth));
    const sc = (p) => this.screen(p);
    for (const b of lig.bonds) {
      const A = sc(b.a),
        B = sc(b.b);
      buckets[place((A.depth + B.depth) / 2)].items.push({ kind: "bond", A, B, alpha: b.alpha, dash: b.dash, w: b.w });
    }
    for (const b of lig.hbonds) {
      const A = sc(b.a),
        B = sc(b.b);
      buckets[place((A.depth + B.depth) / 2)].items.push({ kind: "hb", A, B, alpha: b.alpha, color: b.color });
    }
    const near = lerp(2.1, 0.98, this.focusAmt.value);
    for (const a of lig.atoms) {
      const S = sc(a.p),
        el = ELEMENT[a.el] || ELEMENT.C;
      buckets[place(S.depth)].items.push({ kind: "atom", S, el: a.el, rpx: el.r * S.s * near * (a.r || 1) * (a.el === "MG" ? 1.1 : 1), alpha: a.alpha, frame: a.frame, depth: S.depth });
    }
    this.labels = lig.labels.map((l) => ({ ...l, S: sc(l.p) }));

    for (let b = 0; b <= NB; b++) {
      const bucket = buckets[b],
        fog = b < NB ? 1 - b / (NB - 1) : 0;
      if (b === NB && this.focusAmt.value > 0.02) this.drawVeil(c);
      if (b < NB) bucket.chains.forEach((bk, k) => this.drawChainBucket(c, bk, k, fog, thin, mut, tailMark));
      bucket.items.sort((p, q) => (q.depth ?? 0) - (p.depth ?? 0));
      for (const it of bucket.items) this.drawItem(c, it);
    }
    c.setLineDash([]);
  }
  /** Mist over the ribbons so the atoms of the examined site stand out. */
  drawVeil(c) {
    const g = c.createRadialGradient(this.cx, this.cy, 120, this.cx, this.cy, 400);
    g.addColorStop(0, "rgba(246,241,228,0.9)");
    g.addColorStop(0.7, "rgba(246,241,228,0.72)");
    g.addColorStop(1, "rgba(246,241,228,0)");
    c.save();
    c.globalAlpha *= clamp(this.focusAmt.value * 1.2);
    c.fillStyle = g;
    c.fillRect(0, 0, 880, 800);
    c.restore();
  }
  drawChainBucket(c, bk, k, fog, thin, mut, tailMark) {
    const ch = this.chains[k],
      id = ch.id;
    const alpha = clamp(ch.alpha.value) * (this.hover >= 0 && this.hover !== k && this.focusK < 0 ? 0.78 : 1);
    if (alpha < 0.07) return;
    const s = bk.n ? bk.sSum / bk.n : 4,
      base = mix(CHAIN_COLOR[id], PAPER, fog * 0.5),
      pat = this.tier >= 2 ? base : this.patterns[id][clamp(Math.floor(fog * 3.99), 0, 3)],
      edgeCol = edge(base),
      hovered = this.hover === k;
    c.save();
    c.globalAlpha *= alpha;
    c.lineCap = "round";
    c.lineJoin = "round";
    const w = (key) => WIDTH[key] * s * thin;
    for (const key of this.tier >= 2 && this.moving ? [] : ["C", "E", "H"]) {
      c.strokeStyle = hovered ? tint(edgeCol, 0.2) : edgeCol;
      c.lineWidth = w(key) + 2.3 + (hovered ? 1.8 : 0);
      c.stroke(bk[key]);
    }
    for (const key of ["C", "E", "H"]) {
      c.strokeStyle = pat;
      c.lineWidth = w(key);
      c.stroke(bk[key]);
    }
    for (const key of this.tier >= 1 ? [] : ["E", "H"]) {
      c.save();
      c.translate(-w(key) * 0.12, -w(key) * 0.2);
      c.globalAlpha *= 0.55;
      c.strokeStyle = tint(base, 0.7);
      c.lineWidth = Math.max(1, w(key) * 0.2);
      c.stroke(bk[key]);
      c.restore();
    }
    if (this.tier < 1) {
      c.strokeStyle = mix(edgeCol, base, 0.35);
      c.lineWidth = 1.1;
      c.globalAlpha *= 0.75;
      c.stroke(bk.hatch);
      c.globalAlpha /= 0.75;
    }
    for (const tri of bk.arrows) {
      c.beginPath();
      tri.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fillStyle = pat;
      c.fill();
      c.strokeStyle = edgeCol;
      c.lineWidth = 1.5;
      c.stroke();
    }
    c.setLineDash([3, 4.5]);
    c.strokeStyle = mix(edgeCol, PAPER, 0.15);
    c.lineWidth = 1.5;
    c.stroke(bk.gap);
    c.setLineDash([]);
    this.drawTail(c, bk, k, base, edgeCol, pat, s, thin, mut, tailMark);
    c.restore();
  }
  /** C-terminal residues 321+: red when marked, ghosted or removed by the c.960_961insG frameshift. */
  drawTail(c, bk, k, base, edgeCol, pat, s, thin, mut, tailMark) {
    if (!bk.tail.length) return;
    const red = "#c4483a",
      mark = clamp(tailMark + mut * 0.4);
    const col = mix(base, red, mark * 0.85);
    for (const { a, b, wrong } of bk.tail) {
      const lost = !wrong,
        keep = 1 - mut;
      const w = WIDTH[a.ss] * a.s * thin;
      if (keep > 0.02) {
        c.save();
        c.globalAlpha *= keep;
        c.strokeStyle = mix(edgeCol, red, mark * 0.7);
        c.lineWidth = w + 2.2;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
        c.strokeStyle = mark > 0.05 ? col : pat;
        c.lineWidth = w;
        c.stroke();
        c.restore();
      }
      if (wrong && mut > 0.02) {
        c.save();
        c.globalAlpha *= mut;
        c.setLineDash([2, 5]);
        c.strokeStyle = red;
        c.lineWidth = 2.2;
        c.beginPath();
        c.moveTo(a.x + Math.sin(a.res * 3) * 2.2, a.y + Math.cos(a.res * 2.3) * 2.2);
        c.lineTo(b.x + Math.sin(b.res * 3) * 2.2, b.y + Math.cos(b.res * 2.3) * 2.2);
        c.stroke();
        c.restore();
      }
      void lost;
    }
  }
  drawItem(c, it) {
    if (it.alpha < 0.02) return;
    c.save();
    c.globalAlpha *= clamp(it.alpha);
    if (it.kind === "bond") {
      const w = Math.max(1.2, 0.34 * it.A.s * it.w);
      c.lineCap = "round";
      c.strokeStyle = "#5f4b3a";
      c.lineWidth = w + 1.6;
      if (it.dash) c.setLineDash([w * 1.4, w * 1.6]);
      c.beginPath();
      c.moveTo(it.A.x, it.A.y);
      c.lineTo(it.B.x, it.B.y);
      c.stroke();
      c.strokeStyle = "#c9b693";
      c.lineWidth = Math.max(0.6, w * 0.45);
      c.stroke();
      c.setLineDash([]);
    } else if (it.kind === "hb") {
      c.setLineDash([3, 3.5]);
      c.strokeStyle = it.color;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(it.A.x, it.A.y);
      c.lineTo(it.B.x, it.B.y);
      c.stroke();
    } else {
      const sprite = this.atoms[it.el];
      if (sprite) sprite.draw(c, it.S.x, it.S.y, { scale: Math.max(0.12, it.rpx / 16), frame: it.frame });
    }
    c.restore();
  }
}

function baseScale(s) {
  return s;
}

export { lerp };
