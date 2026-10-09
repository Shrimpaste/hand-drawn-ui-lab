import { Scene } from "../../engine/scene.js";
import { HandLabel } from "../../engine/label.js";
import { Flicker } from "../../engine/flicker.js";
import { tipChain } from "./picking.js";
import { penLine } from "../../engine/pencil.js";
import { P, mix, edge } from "../../engine/palette.js";
import { clamp, ellipsePts, roundedPolygon } from "../../engine/geom.js";
import { StepPager, Chip } from "../kit.js";
import { StructureView } from "./view.js";
import { Cytosol } from "./cytosol.js";
import { CHAIN_COLOR } from "./paint.js";
import { TITLE, SUBTITLE, STEPS, LABELS, DEFAULT_STATE } from "../../content/fbp1-room.js";
import { BeatTrack, beatState, beatCue, beatText } from "./beats.js";
import { Caption, BeatPager } from "./caption.js";
import { nearestResidue } from "./measure.js";

const VIEW = { cx: 432, cy: 395, scale: 4.6 };
const ROW_Y = 752;
const REACTION_SECONDS = 9;
const pose = (s) => [0, 1, -0.8][s];

/** The FBP1 room: one real structure to turn around, open up and ask questions of. */
export class StructureRoom extends Scene {
  constructor(app, data) {
    super(app, "fbp1");
    this.title = TITLE;
    this.data = data;
    this.view = new StructureView(data, VIEW);
    this.cyto = new Cytosol();
    this.state = { ...DEFAULT_STATE };
    this.titleLabel = new HandLabel(TITLE, { size: 31, color: P.inkDeep });
    this.subLabel = new HandLabel(SUBTITLE, { size: 15, color: P.soft });
    this.hint = new HandLabel(LABELS.hintDrag, { size: 15, color: P.soft });
    this.tip = new HandLabel(" ", { size: 15, color: P.inkDeep });
    this.notePanel({ x: 1062, y: 414, w: 372, h: 580, seed: 41, compact: true, domRules: true });
    this.track = new BeatTrack(STEPS);
    this.siteK = 0;
    this.rxnTo = 0;
    this.cue = null;
    this.cueAt = 0;
    this.caption = new Caption({ maxWidth: 272, size: 32 });
    this.captionRect = null;
    this.pager = new StepPager(this, STEPS.length, { x: 1062, y: 752, color: P.honey, onChange: (i) => this.gotoStep(i) });
    this.beatPager = new BeatPager(this, { x: 1062, y: 676, color: P.honey, onPrev: () => this.beatMove(-1), onNext: () => this.beatMove(1) });
    this.rxnT = 0;
    this.rxnRun = false;
    this.hot = [];
    this.hotIdx = -1;
    this.down = null;
    this.pointerAt = null;
    this.ringFlick = new Flicker(3, { seed: 91, min: 0.1, max: 0.24 });
    this.timers = [];
    this.chips = [];
    this.buildChips();
    this.buildLectureChip();
    this.buildCallouts();
  }

  chip(opts) {
    const ch = new Chip(this, opts);
    this.chips.push(ch);
    return ch;
  }

  buildChips() {
    const C = LABELS.chips,
      H = LABELS.hints,
      L = this;
    const mk = (id, text, hint, i, color, isOn, onClick, icon) =>
      this.chip({ id: `fbp1-${id}`, label: hint, text, hint, x: 78 + i * 118, y: ROW_Y, w: 104, size: 18, color, isOn, onClick, icon });
    // the chips jump to a step; a lit chip means "you are on this step"
    const at = (i) => () => L.track.step === i;
    const to = (i) => () => L.gotoStep(L.track.step === i && i !== 0 ? 0 : i, { resetView: true });
    mk("substrate", C.substrate, H.substrate, 0, P.teal, at(1), to(1), (c, o) => this.iconSubstrate(c, o));
    mk("react", C.react, H.react, 1, P.blue, at(2), to(2), (c, o) => this.iconReact(c, o));
    mk("amp", C.amp, H.amp, 2, P.honey, at(3), to(3), (c, o) => this.iconAmp(c, o));
    mk("mut", C.mut, H.mut, 3, P.red, at(4), to(4), (c, o) => this.iconMut(c, o));
    mk("reset", C.reset, H.reset, 4, P.plum, () => false, () => L.gotoStep(0, { resetView: true }), (c, o) => this.iconReset(c, o));
    this.chip({ id: "fbp1-back", label: H.back, text: C.back, hint: H.back, x: 78 + 5 * 118 + 14, y: ROW_Y, w: 132, size: 18, color: P.honey, onClick: () => this.openBlock(), icon: (c, o) => this.iconBack(c, o) });
  }
  /** The structure room is the deep end of the report's module room; this is the way back up. */
  openBlock() {
    this.app.foley.play("paper", { strength: 0.6 });
    location.href = "block.html";
  }
  iconBack(c, o) {
    c.save();
    c.translate(o.x, o.y);
    this.iconPen(c, { ...o, x: 0, y: 0 }, (s) => [[[11, s * 0.4], [-10, 0]], [[-4, -7 + s * 0.3], [-11, 0], [-4, 7]]], [P.honey, P.inkDeep]);
    c.restore();
  }
  buildLectureChip() {
    const T = LABELS.lecture;
    this.lectureChip = this.chip({
      id: "fbp1-lecture",
      label: T.hint,
      text: T.open,
      hint: T.hint,
      x: 1062,
      y: 96,
      w: 124,
      size: 18,
      color: P.honey,
      isOn: () => this.notes.expanded,
      onClick: () => this.toggleLecture(),
    });
  }
  toggleLecture() {
    this.setLecture(!this.notes.expanded);
  }
  /** Open the lecture text over the caption zone, or fold it away and write the caption again. */
  setLecture(open, { quiet = false } = {}) {
    if (open === this.notes.expanded) return;
    this.notes.setExpanded(open, this.reduced);
    this.caption.setSuppressed(open, this.reduced);
    this.lectureChip.setText(open ? LABELS.lecture.close : LABELS.lecture.open, this.reduced);
    if (!quiet) {
      this.app.foley.play("paper", { strength: 0.4 });
      this.announce(open ? "讲义已展开" : "讲义已收起");
    }
  }
  iconPen(c, o, strokes, color) {
    const s = pose(o.state);
    for (const [i, pts] of strokes(s).entries()) penLine(c, pts, { color: Array.isArray(color) ? color[i % color.length] : color, width: 1.7, progress: o.progress, variant: o.state, seed: 5 + i, taper: false, boil: 0.2 });
  }
  iconSubstrate(c, o) {
    c.save();
    c.translate(o.x, o.y - 2 - o.hover * 2);
    const pent = (r) => Array.from({ length: 6 }, (_, i) => [Math.cos(-Math.PI / 2 + (i * Math.PI * 2) / 5) * r, Math.sin(-Math.PI / 2 + (i * Math.PI * 2) / 5) * r * 0.9]);
    this.iconPen(c, { ...o, x: 0, y: 0 }, (s) => [pent(8), [[-8 - s, 5], [-13 - s, 11]], [[8 + s, 5], [13 + s, 11]]], [P.inkDeep, P.honey, P.honey]);
    const s = pose(o.state);
    c.fillStyle = "#e5a73c";
    for (const [x, y] of [[-14 - s, 12], [14 + s, 12]]) {
      c.beginPath();
      c.arc(x, y, 3, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  iconReact(c, o) {
    c.save();
    c.translate(o.x, o.y - 1);
    this.iconPen(c, { ...o, x: 0, y: 0 }, (s) => [[[0, -11], [-6, -2 + s], [-6, 5], [0, 9], [6, 5], [6, -2 + s], [0, -11]], [[11, 0], [20 + s, 0]], [[16 + s, -4], [20 + s, 0], [16 + s, 4]]], [P.blue, P.inkDeep, P.inkDeep]);
    c.restore();
  }
  iconAmp(c, o) {
    c.save();
    c.translate(o.x - 3, o.y - 1);
    const hex = Array.from({ length: 7 }, (_, i) => [Math.cos((i / 6) * Math.PI * 2) * 6 - 4, Math.sin((i / 6) * Math.PI * 2) * 6]);
    this.iconPen(c, { ...o, x: 0, y: 0 }, (s) => [hex, [[2, -4], [9, -6 + s], [11, 1], [5, 4]], [[11, 1], [16 + s, 6]]], [P.honey, P.honey, P.inkDeep]);
    c.fillStyle = "#e5a73c";
    c.beginPath();
    c.arc(18 + pose(o.state), 8, 3.2, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  iconMut(c, o) {
    c.save();
    c.translate(o.x, o.y);
    const s = pose(o.state);
    this.iconPen(c, { ...o, x: 0, y: 0 }, () => [[[-16, 4], [-8, 4]], [[-6, 4], [4, 4]], [[6, 4], [16, 4]], [[-1, -8 + s], [-1, 0]], [[-5, -4 + s], [-1, 0], [3, -4 + s]]], [P.inkDeep, P.inkDeep, P.inkDeep, P.red, P.red]);
    c.restore();
  }
  iconReset(c, o) {
    c.save();
    c.translate(o.x, o.y);
    this.iconPen(c, { ...o, x: 0, y: 0 }, (s) => [Array.from({ length: 14 }, (_, i) => [Math.cos(-0.5 + (i / 13) * 5 + s * 0.12 + o.hover * 0.6) * 10, Math.sin(-0.5 + (i / 13) * 5 + s * 0.12 + o.hover * 0.6) * 10]), [[8, -12 + s], [10, -5], [3, -4]]], [P.plum]);
    c.restore();
  }

  buildCallouts() {
    const v = this.view,
      S = this.state,
      L = LABELS;
    const mkLabel = (text, color, size = 16) => new HandLabel(text, { size, color, align: "left", maxWidth: 230 });
    const chainPts = (num) => v.resPos(0, num);
    this.callouts = [
      { id: "site", label: mkLabel(L.site, "#355d58", 17), world: () => v.ligands.siteCenter(Math.max(0, S.focus), v.rt.value), show: () => S.focus >= 0 && S.dock && v.focusAmt.value > 0.9, off: [-150, -120] },
      { id: "ampSite", label: mkLabel(L.ampSite, "#8a5a22"), world: () => v.ligands.amps[0].center, show: () => S.amp && v.focusAmt.value < 0.2 && v.ligands.amps[0].bind.value > 0.9, off: [60, 40] },
      { id: "tail", label: mkLabel(L.tail, "#b13c30"), world: () => chainPts(321), show: () => S.tail && v.focusAmt.value < 0.2 && this.cue?.measure !== "tailSite", off: [60, -50] },
      { id: "gap", label: mkLabel(L.gap, P.soft, 14), world: () => [...chainPts(56)].map((x, i) => (x + chainPts(72)[i]) / 2), show: () => STEPS[this.pager?.state.index ?? 0].id === "fold" && !S.dock, off: [-30, -62] },
      ...[0, 1, 2, 3].map((k) => ({ id: `sub${k}`, label: mkLabel(`${L.subunit} ${"ABCD"[k]}`, edge(CHAIN_COLOR["ABCD"[k]]), 17), world: () => v.chainCenter(k), show: () => STEPS[this.pager?.state.index ?? 0].id === "fold" && v.focusAmt.value < 0.1, off: [0, 0], chain: k })),
    ];
  }

  roomJobs() {
    return [
      () => this.view.bake(this.app.c),
      () => this.cyto.bake(),
      () => this.chips.forEach((ch) => ch.bake()),
    ];
  }
  bakeJobs() {
    return this.roomJobs();
  }

  onEnter() {
    this.titleLabel.show(this.reduced);
    this.subLabel.show(this.reduced);
    this.pager.reset();
    this.notes.show(this.reduced);
    this.gotoStep(0, { first: true });
    for (const ch of this.chips) ch.text.ink.snap(true);
  }

  /** Jump to the first beat of a step (or a given beat). siteK picks which chain's active site is examined. */
  gotoStep(i, { beat = 0, first = false, resetView = false, siteK = 0 } = {}) {
    this.siteK = siteK;
    this.track.go(i, beat);
    this.showBeat(first, true, resetView);
  }
  beatMove(dir) {
    if (!this.interactive) return;
    // moving on while the lecture is open folds it back to the sentence being told
    if (this.notes.expanded) this.setLecture(false, { quiet: true });
    const r = dir > 0 ? this.track.next() : this.track.prev();
    if (!r) return;
    this.showBeat(false, r.stepChanged);
  }
  /** Put the page, caption and 3D scene into the state of the current beat. */
  showBeat(first, stepChanged, resetView = false) {
    const st = STEPS[this.track.step],
      j = this.track.beat,
      beat = st.beats[j];
    if (stepChanged) {
      this.notes.setContent(st.note, this.reduced);
      this.pager.state.index = this.track.step;
      this.pager.sync();
    }
    const state = beatState(st, j, DEFAULT_STATE);
    if (state.focus >= 0) state.focus = this.siteK;
    this.go(state, first, resetView);
    this.cue = beatCue(st, j);
    this.cueAt = this.time;
    this.rxnTo = this.cue.rxnTo ?? 0;
    const text = beatText(beat.say, this.siteK);
    this.caption.set(text, beat.fine ? beatText(beat.fine, this.siteK) : "", this.reduced);
    this.beatPager.setPosition(j, st.beats.length, this.track.atStart, this.track.atEnd);
    if (!first) this.app.foley.play("paper", { strength: 0.35 });
    if (!this.warming) this.announce(text + "。" + (beat.fine || ""));
  }

  /** Put the 3D scene into a state; springs inside the view do the moving. */
  go(partial, quiet = false, resetView = false) {
    const next = { ...this.state, ...partial },
      v = this.view,
      lg = v.ligands;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.dropTip();
    const wasRx = this.state.rxn,
      prevFocus = this.state.focus;
    this.state = Object.assign(this.state, next);
    const S = this.state;
    v.setFocus(S.focus);
    lg.sites.forEach((s, k) => {
      s.dock.target = S.dock ? (S.focus >= 0 ? (k === S.focus ? 1 : 0) : 1) : 0;
      s.detail.target = S.focus === k ? 1 : 0;
      if (!S.dock || !S.rxn) s.rxn = 0;
    });
    if (S.rxn) {
      // beats move the clock between marks; only a fresh start (or a different site) restarts it
      if (!wasRx || prevFocus !== S.focus) {
        this.rxnT = -1.6;
        lg.sites.forEach((s) => (s.rxn = 0));
      }
      this.rxnRun = true;
    } else {
      this.rxnRun = false;
      this.rxnT = 0;
    }
    v.rxnSite = S.rxn ? Math.max(0, S.focus) : -1;
    lg.amps.forEach((a, k) => {
      if (S.amp) this.timers.push(setTimeout(() => (a.bind.target = 1), (this.reduced ? 0 : k * 280)));
      else a.bind.target = 0;
    });
    v.mut.target = S.mut ? 1 : 0;
    v.tail.target = S.tail ? 1 : 0;
    if (resetView) v.resetDrag();
    if (!quiet) this.app.foley.play("wood", { strength: 0.45 });
  }

  /** Forget any clicked-chain description, e.g. when the view changes under a resting pointer. */
  dropTip() {
    clearTimeout(this.tipTimer);
    this.tipTimer = null;
    this.pickedChain = -1;
  }

  /* ---------- pointer ---------- */
  pointer(x, y, buttons = 0, overUi = false) {
    this.overUi = overUi;
    if (x === null) {
      this.pointerAt = null;
      this.view.hover = -1;
      this.hotIdx = -1;
      return;
    }
    const last = this.pointerAt;
    this.pointerAt = { x, y };
    if (this.down && buttons & 1 && last) {
      const dx = x - last.x,
        dy = y - last.y;
      if (Math.hypot(x - this.down.x, y - this.down.y) > 4) this.down.moved = true;
      if (this.down.moved) this.view.dragBy(dx, dy);
    }
  }
  click(x, y) {
    const cr = this.captionRect;
    if (cr && x >= cr.x && x <= cr.x + cr.w && y >= cr.y && y <= cr.y + cr.h) {
      this.beatMove(1);
      return;
    }
    if (x > 870) return;
    this.down = { x, y, moved: false, hot: this.hotAt(x, y) };
    this.view.excite.target = 1;
  }
  release() {
    const d = this.down;
    this.view.release();
    this.view.excite.target = 0;
    this.down = null;
    if (!d || d.moved || !this.interactive) return;
    if (d.hot >= 0) this.activateHot(this.hot[d.hot]);
    else {
      const k = this.view.hit(d.x, d.y);
      if (k >= 0) {
        this.pickedChain = k;
        this.view.excite.kick(3);
        this.app.foley.play("step", { strength: 0.5 });
      }
    }
  }
  hotAt(x, y) {
    let best = -1,
      bd = Infinity;
    this.hot.forEach((h, i) => {
      const d = Math.hypot(h.x - x, h.y - y);
      if (d < h.r * 1.25 && d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }
  activateHot(h) {
    if (h.kind === "site") this.gotoStep(1, { siteK: h.k });
    else this.gotoStep(3);
  }
  key(e) {
    if (!this.interactive) return;
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      this.beatMove(1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      this.beatMove(-1);
    } else if (e.key === "t" || e.key === "T") this.toggleLecture();
    else if (e.key === "Home") this.gotoStep(0, { resetView: true });
  }

  /* ---------- update ---------- */
  update(dt) {
    super.update(dt);
    const r = this.reduced,
      v = this.view,
      t = this.time;
    this.titleLabel.update(dt);
    this.subLabel.update(dt);
    this.hint.update(dt);
    this.tip.update(dt);
    this.pager.update(dt, r);
    this.caption.update(dt, r);
    this.beatPager.update(dt, r);
    for (const ch of this.chips) ch.update(dt, r);
    this.cyto.update(dt, r);
    for (const c of this.callouts) c.label.update(dt);
    // reaction clock
    if (this.rxnRun) {
      // the clock plays forward up to the mark of the current beat, and rewinds faster when going back
      if (this.rxnT < this.rxnTo) this.rxnT = Math.min(this.rxnTo, this.rxnT + dt);
      else if (this.rxnT > this.rxnTo) this.rxnT = Math.max(this.rxnTo, this.rxnT - dt * 3);
      v.ligands.sites[Math.max(0, this.state.focus)].rxn = clamp(this.rxnT / REACTION_SECONDS);
    }
    // R -> T only once AMP is bound; back as soon as it leaves
    const lg = v.ligands;
    const bound = Math.min(...lg.amps.map((a) => a.bind.value)) > 0.85;
    v.rt.target = this.state.amp && this.state.rtOn ? (bound ? 1 : v.rt.target) : 0;
    v.update(dt, t, r);
    // hover
    const p = this.pointerAt;
    if (p && p.x < 870 && !this.overUi && !this.down?.moved) {
      this.hotIdx = this.hotAt(p.x, p.y);
      v.hover = this.hotIdx >= 0 ? -1 : v.hit(p.x, p.y);
    } else {
      this.hotIdx = -1;
      v.hover = -1;
    }
    const shown = tipChain({ hover: v.hover, picked: this.pickedChain ?? -1, focusAmt: v.focusAmt.value, pointer: !!p, overUi: this.overUi });
    if (shown >= 0) this.tip.set(LABELS.hover("ABCD"[shown], v.chains[shown].n), r);
    this.tip.setVisible(shown >= 0, r);
    if (v.hover < 0 && this.pickedChain >= 0 && !this.tipTimer) this.tipTimer = setTimeout(() => ((this.pickedChain = -1), (this.tipTimer = null)), 1800);
    if (v.hover >= 0 && this.tipTimer) {
      clearTimeout(this.tipTimer);
      this.tipTimer = null;
    }
    this.app.stage.style.cursor = this.down?.moved ? "grabbing" : this.hotIdx >= 0 || v.hover >= 0 ? "pointer" : p && p.x < 870 ? "grab" : "";
    for (const c of this.callouts) c.label.ink.setVisible(c.show(), r);
    this.hint.ink.setVisible(this.state.focus < 0 && !this.state.mut && this.interactive, r);
    this.captionRect = this.caption.rect();
    // keep hover emphasis for background things quiet; hotspots feed the ring flicker
  }
  setTier(tier) {
    this.view.tier = tier;
  }

  /**
   * Everything the room will do, rehearsed behind the loading page: each step with its zoom, the
   * reaction at its middle and late moments, the AMP shift, the mutation, the way back, and a
   * hover tip. The measured frames decide the render tier.
   */
  warmPlan() {
    const step = (i) => () => this.gotoStep(i, { first: true });
    const beat = (i, j) => {
      this.track.go(i, j);
      this.showBeat(true, false);
      this.rxnT = Math.max(0, this.rxnTo - 0.5);
    };
    const overview = (i) => {
      this.pointerAt = i === 2 || i === 3 ? { x: 400, y: 380 } : null;
    };
    return [
      { label: "铺开纸张，画出四聚体", enter: step(0), frames: 8, each: overview },
      { label: "标出两个位点的距离", enter: () => beat(0, 3), frames: 10 },
      { label: "推进到活性位点", enter: step(1), frames: 26, measure: true },
      { label: "圈出磷酸与镁离子", enter: () => beat(1, 1), frames: 10 },
      {
        label: "演练水解反应",
        enter: step(2),
        frames: 30,
        measure: true,
        each: (i) => {
          if (i === 6) beat(2, 1);
          if (i === 14) beat(2, 2);
          if (i === 24) beat(2, 3);
        },
      },
      { label: "对照 R 态与 T 态", enter: step(3), frames: 14, measure: true, each: (i) => i === 6 && beat(3, 1) },
      { label: "标出移码变异", enter: step(4), frames: 12, each: (i) => (i === 4 ? beat(4, 1) : i === 8 ? beat(4, 2) : 0) },
      { label: "回到整体视图", enter: step(0), frames: 28, measure: true },
    ];
  }
  /** Put every transient thing back to a fresh page after the rehearsal. */
  afterWarm() {
    this.pointerAt = null;
    this.hotIdx = -1;
    this.view.hover = -1;
    this.dropTip();
    this.view.snap();
    for (const c of this.callouts) c.label.ink.snap(false);
    this.tip.ink.snap(false);
    this.tip.pending = null;
    this.caption.snap();
    this.cue = null;
    this.rxnT = 0;
    this.rxnRun = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
  get writing() {
    return super.writing || this.titleLabel.writing || this.subLabel.writing || this.callouts.some((c) => c.label.writing) || this.chips.some((c) => c.text.writing) || this.caption.writing;
  }
  get erasing() {
    return super.erasing || this.callouts.some((c) => c.label.erasing) || this.caption.erasing;
  }
  onLeave() {
    this.timers.forEach(clearTimeout);
  }

  /* ---------- draw ---------- */
  drawBackdrop(c, env) {
    const g = c.createRadialGradient(VIEW.cx, VIEW.cy, 30, VIEW.cx, VIEW.cy, 380);
    g.addColorStop(0, "rgba(255,251,240,0.85)");
    g.addColorStop(0.6, "rgba(255,251,240,0.35)");
    g.addColorStop(1, "rgba(255,251,240,0)");
    c.save();
    c.globalAlpha *= clamp(env * 1.5);
    c.fillStyle = g;
    c.fillRect(0, 0, 880, 800);
    c.restore();
  }
  drawRing(c, x, y, r, state, color, hover, progress, time, reduced) {
    const v = state,
      wob = [0, 1, -0.8][v];
    c.save();
    c.globalAlpha *= progress;
    const rr = r * (1 + wob * 0.07 + hover * 0.12);
    penLine(c, ellipsePts(x, y, rr, rr * 0.9, 26, 0.05, v * 1.9), { color, width: 1.8 + hover, progress: 1, variant: v, seed: 5 + v, taper: false, boil: 0.35 });
    c.setLineDash([2, 4]);
    c.strokeStyle = color;
    c.lineWidth = 1.2;
    c.beginPath();
    c.ellipse(x, y, rr * 1.35 + wob, rr * 1.2 - wob, 0.3 * v, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
    c.restore();
  }
  drawLabelBox(c, label, x, y, alpha) {
    if (label.ink.progress <= 0.01) return;
    const w = label.boxWidth + 14,
      h = label.boxHeight + 8;
    c.save();
    c.globalAlpha *= clamp(alpha * 1.4);
    c.fillStyle = "rgba(244,238,224,0.88)";
    c.beginPath();
    roundedPolygon([[x - 6, y - 3], [x + w - 6, y - 3], [x + w - 6, y + h - 3], [x - 6, y + h - 3]], 7, 3).forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
    c.closePath();
    c.fill();
    c.restore();
    label.draw(c, x, y, { progress: 1 });
  }
  draw(c) {
    const t = this.time,
      r = this.reduced,
      v = this.view,
      env = this.p("env"),
      pc = this.p("char"),
      lp = this.p("label"),
      ui = this.p("ui");
    this.drawBackdrop(c, env);
    this.cyto.draw(c, t, r, 0, this.p("env", 0.1), this.cam);
    this.cyto.draw(c, t, r, 1, this.p("prop"), this.cam);
    v.draw(c, t, r, pc);
    this.cyto.draw(c, t, r, 2, this.p("prop", 0.3), this.cam);
    if (pc > 0.98) {
      this.drawHotspots(c, t, r, lp);
      this.drawLigandLabels(c, lp);
      this.drawCallouts(c, lp);
      this.drawCues(c, lp);
    }
    this.titleLabel.draw(c, 60, 24, { progress: lp });
    this.subLabel.draw(c, 62, 66, { progress: this.p("label", 0.2) });
    this.hint.draw(c, 62, 92, { progress: lp });
    if (this.tip.ink.progress > 0 && this.pointerAt) this.drawTip(c, lp);
    this.notes.draw(c, { progress: this.p("env", 0.3), labelProgress: lp, shift: this.cam.shift(0.4) });
    this.caption.draw(c, this.notes.zone, { progress: lp, time: t, reduced: r });
    this.pager.draw(c, { progress: ui, time: t, reduced: r });
    this.beatPager.draw(c, { progress: ui, time: t, reduced: r });
    this.drawControls(c);
  }
  drawTip(c, lp) {
    const p = this.pointerAt,
      x = Math.min(p.x + 16, 640),
      y = p.y - 30;
    this.drawLabelBox(c, this.tip, x, y, this.tip.ink.progress * lp);
  }
  drawHotspots(c, t, r, lp) {
    const v = this.view,
      S = this.state;
    this.hot = [];
    if (v.focusAmt.value > 0.3 || S.mut) return;
    const fr = this.ringFlick.at(t, { reduced: r, rate: 1 + (this.hotIdx >= 0 ? 1.2 : 0) });
    const add = (kind, k, world, rad, color, on) => {
      const s = v.screen(world),
        radius = Math.max(12, rad * s.s);
      this.hot.push({ kind, k, x: s.x, y: s.y, r: radius });
      if (on) return;
      const idx = this.hot.length - 1,
        hover = this.hotIdx === idx || this.cue?.pulse === "hot" ? 1 : 0;
      this.drawRing(c, s.x, s.y, radius, (fr + k) % 3, color, hover, lp, t, r);
    };
    v.ligands.sites.forEach((s, k) => add("site", k, v.ligands.siteCenter(k, v.rt.value), 4.4, "#b5742a", S.dock));
    v.ligands.amps.forEach((a, k) => add("amp", k, a.center, 4.2, "#4c70a8", S.amp && a.bind.value > 0.5));
  }
  /** What the current beat points at: rings on atoms with a short tag, or a measured dashed line. */
  drawCues(c, lp) {
    const cue = this.cue;
    if (!cue) return;
    const v = this.view,
      lg = v.ligands,
      t = this.time,
      r = this.reduced,
      rt = v.rt.value,
      // wait for the camera and ligands to settle before pointing
      k = clamp((t - this.cueAt - (r ? 0 : 0.7)) * 2.2) * lp * (v.focusAmt.value > 0.5 || !cue.spots.length ? 1 : 0);
    if (k > 0.01) {
      const fr = this.ringFlick.at(t, { reduced: r });
      cue.spots.forEach((spec, i) => {
        const S = v.screen(lg.spotWorld(this.siteK, spec, rt)),
          rad = Math.max(13, (spec.mg !== undefined ? 1.7 : 1.5) * S.s);
        this.drawRing(c, S.x, S.y, rad, (fr + i) % 3, "#c0482f", 0, k, t, r);
        if (spec.text) this.drawTag(c, spec.text, S.x + rad * 0.9, S.y - rad * 1.1, "#a8321f", k);
      });
    }
    if (cue.measure) {
      const m = this.measureOf(cue.measure);
      if (!m) return;
      const A = v.screen(m.a),
        B = v.screen(m.b),
        km = clamp((t - this.cueAt - (r ? 0 : 0.5)) * 1.6) * lp;
      if (km < 0.01) return;
      const mx = A.x + (B.x - A.x) * km,
        my = A.y + (B.y - A.y) * km;
      c.save();
      c.globalAlpha *= km;
      c.lineCap = "round";
      c.setLineDash([9, 7]);
      c.strokeStyle = "rgba(244,238,224,0.95)";
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(A.x, A.y);
      c.lineTo(mx, my);
      c.stroke();
      c.strokeStyle = "#a8321f";
      c.lineWidth = 2.2;
      c.stroke();
      c.setLineDash([]);
      for (const P of [A, { x: mx, y: my }]) {
        c.fillStyle = "#a8321f";
        c.beginPath();
        c.arc(P.x, P.y, 4.2, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
      if (km > 0.8) this.drawTag(c, m.text, (A.x + B.x) / 2 + 10, (A.y + B.y) / 2 - 24, "#a8321f", clamp((km - 0.8) * 5), 24);
    }
  }
  /** The two ends and label of a named distance, all taken from the crystal coordinates. */
  measureOf(id) {
    const v = this.view,
      lg = v.ligands,
      F = this.data.facts;
    if (id === "siteAmp") return { a: lg.siteCenter(0, v.rt.value), b: lg.amps[0].center, text: F.ampToActiveSiteA.toFixed(1) + " Å" };
    if (id === "tailSite") {
      if (!this.tailPair) this.tailPair = nearestResidue({ num: this.data.chains[0].num, t: this.data.chains[0].t }, F.cTermFirst, lg.siteCenter(0, 1));
      return { a: v.resPos(0, this.tailPair.num), b: lg.siteCenter(0, v.rt.value), text: this.tailPair.d.toFixed(1) + " Å" };
    }
    return null;
  }
  drawTag(c, text, x, y, color, alpha, size = 19) {
    c.save();
    c.globalAlpha *= alpha;
    c.font = size + 'px "小赖", serif';
    c.textBaseline = "middle";
    c.lineJoin = "round";
    c.lineWidth = 5;
    c.strokeStyle = "rgba(244,238,224,0.95)";
    c.strokeText(text, x, y);
    c.fillStyle = color;
    c.fillText(text, x, y);
    c.restore();
  }
  drawLigandLabels(c, lp) {
    const v = this.view;
    c.save();
    c.textBaseline = "middle";
    for (const l of v.labels || []) {
      if (l.alpha < 0.05) continue;
      const size = l.small ? 13 : 16;
      c.font = `${size}px "小赖", "Cambria Math", serif`;
      c.globalAlpha = clamp(l.alpha) * lp;
      c.lineWidth = 3.4;
      c.strokeStyle = "rgba(244,238,224,0.92)";
      c.lineJoin = "round";
      c.strokeText(l.text, l.S.x + 5, l.S.y - 4);
      c.fillStyle = l.color;
      c.fillText(l.text, l.S.x + 5, l.S.y - 4);
    }
    c.restore();
  }
  drawCallouts(c, lp) {
    const v = this.view,
      t = this.time;
    for (const co of this.callouts) {
      const k = co.label.ink.progress;
      if (k <= 0.01) continue;
      const S = v.screen(co.world());
      let dx = S.x - VIEW.cx,
        dy = S.y - VIEW.cy;
      const d = Math.hypot(dx, dy) || 1;
      dx /= d;
      dy /= d;
      let ox = co.off[0] || dx * 70,
        oy = co.off[1] || dy * 55;
      if (co.chain !== undefined) {
        ox = dx * 52;
        oy = dy * 40;
      }
      const lx = clamp(S.x + ox, 24, 860 - co.label.boxWidth),
        ly = clamp(S.y + oy, 96, 690),
        ax = lx + (S.x < lx ? -4 : co.label.boxWidth + 4),
        ay = ly + co.label.boxHeight * 0.5;
      const col = co.chain !== undefined ? edge(CHAIN_COLOR["ABCD"[co.chain]]) : "#6b5846";
      penLine(c, [[S.x, S.y], [(S.x + ax) / 2 + 4, (S.y + ay) / 2 - 3], [ax, ay]], { color: col, width: 1.3, progress: Math.min(k * 1.6, 1) * lp, variant: Math.floor(t * 8) % 3, seed: 3, taper: false, boil: 0.3 });
      c.save();
      c.fillStyle = col;
      c.beginPath();
      c.arc(S.x, S.y, 3, 0, Math.PI * 2);
      c.fill();
      c.restore();
      this.drawLabelBox(c, co.label, lx, ly, k * lp);
    }
  }
}
