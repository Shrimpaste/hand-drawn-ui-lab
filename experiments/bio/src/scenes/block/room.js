import { Scene } from "../../engine/scene.js";
import { HandLabel } from "../../engine/label.js";
import { Flicker, PACE } from "../../engine/flicker.js";
import { Spring } from "../../engine/motion.js";
import { penLine } from "../../engine/pencil.js";
import { P, edge } from "../../engine/palette.js";
import { clamp, smooth, ellipsePts, roundedPolygon } from "../../engine/geom.js";
import { StepPager, Chip } from "../kit.js";
import { Cytosol, er, mito, glycogen } from "../structure/cytosol.js";
import { BeatTrack, beatState } from "../structure/beats.js";
import { Caption, BeatPager } from "../structure/caption.js";
import { TITLE, SUBTITLE, STEPS, LABELS, DEFAULT_STATE, NODE_INFO, NODE_TAG, CLOSEUPS, CLOSEUP_LABELS } from "../../content/block-room.js";
import { Timeline, focusTransform, closeupLine, closeupNote, nextCloseup, closeupAt } from "./closeup.js";
import { drawCloseup } from "./closeupArt.js";
import { ROUTES, bloodTargets, stepGlycogen, spawnRates } from "./model.js";
import { FlowSim } from "./flow.js";
import { NODES, FBP1_AT, BEND, ROUTE_CLASS, TRACK_COLOR, MAIN_TAGS, BLOOD, MEMBRANE, edgePoint } from "./layout.js";
import { bakeMolecules } from "./molecules.js";
import { bakeFBP1 } from "./enzyme.js";
import { bloodBand, membrane, redCell, glow, BAND_TOP } from "./cell.js";

const ROW_Y = 752;
// the camera keeps the close-up inside the cell, framed by a lens window above the chip row
// Leave a separate header row for the close-up's keyboard hints above the lens.
const LENS = { x0: 12, y0: 156, x1: 864, y1: 722 };
const LENS_CENTER = [(LENS.x0 + LENS.x1) / 2, (LENS.y0 + LENS.y1) / 2 + 10];
const CU_BY_ID = Object.fromEntries(CLOSEUPS.map((c) => [c.id, c]));
const MOL_SCALE = 0.6;
const pose = (s) => [0, 1, -0.8][s];
const FRAMES = [0, 1, 2, 1];
const CARRIERS = { left: [NODES.glcOut[1], NODES.glyIn[1], NODES.lacIn[1], NODES.lacOut[1], NODES.alaIn[1]], right: [NODES.galIn[1], NODES.manIn[1], NODES.fruIn[1]] };
// a sparse far layer, kept clear of the tracks
const AMBIENT = [
  ["ribosome", 300, 318, 0.55, 0, 1.2],
  ["ribosome", 650, 470, 0.55, 0, 3.1],
  ["enzyme1", 318, 430, 0.5, 1, 2.6],
  ["enzyme2", 590, 520, 0.5, 1, 5.2],
  ["atp", 560, 430, 1, 2, 1.1],
  ["mg", 236, 420, 1, 2, 4.7],
]

/** Edges of all routes, each once, with the class of the first route that uses it. */
function edgeList() {
  const seen = new Map();
  for (const [route, nodes] of Object.entries(ROUTES))
    nodes.slice(1).forEach((b, i) => {
      const a = nodes[i],
        key = `${a}>${b}`;
      if (!seen.has(key)) seen.set(key, { a, b, key, routes: [route], cls: ROUTE_CLASS[route] });
      else seen.get(key).routes.push(route);
    });
  return [...seen.values()];
}

/** Room for the report's section 1: where each substrate enters, and the one step they share. */
export class BlockRoom extends Scene {
  constructor(app, data) {
    super(app, "block");
    this.title = TITLE;
    this.data = data;
    this.state = { ...DEFAULT_STATE };
    this.glycogen = 1;
    this.sim = new FlowSim(NODES, { seed: 7, pileMax: 14 });
    this.edges = edgeList();
    this.cyto = new Cytosol(AMBIENT);
    this.gGlc = new Spring(4.6, { stiffness: 2.4, damping: 3.2 });
    this.gLac = new Spring(1.0, { stiffness: 2.4, damping: 3.2 });
    this.patientK = new Spring(0, { stiffness: 30, damping: 10 });
    this.flashes = [];
    this.bloodTokens = [];
    this.bloodAcc = 0;
    this.fbpFlick = new Flicker(3, { seed: 33, ...PACE.protein });
    this.ringFlick = new Flicker(3, { seed: 91, min: 0.14, max: 0.32 });
    this.titleLabel = new HandLabel(TITLE, { size: 31, color: P.inkDeep });
    this.subLabel = new HandLabel(SUBTITLE, { size: 15, color: P.soft });
    this.hint = new HandLabel(LABELS.hint, { size: 15, color: P.soft });
    this.tip = new HandLabel(" ", { size: 15, color: P.inkDeep });
    this.notePanel({ x: 1062, y: 414, w: 372, h: 580, seed: 43, compact: true, domRules: true });
    this.track = new BeatTrack(STEPS);
    this.caption = new Caption({ maxWidth: 272, size: 32 });
    this.pager = new StepPager(this, STEPS.length, { x: 1062, y: ROW_Y, color: P.honey, onChange: (i) => this.gotoStep(i) });
    this.beatPager = new BeatPager(this, { x: 1062, y: 676, color: P.honey, onPrev: () => this.move(-1), onNext: () => this.move(1) });
    this.pointerAt = null;
    this.hoverNode = null;
    this.hoverRing = null;
    // close-up camera: k blends from the whole cell (0) to the close-up (1); x, y, z travel between close-ups
    this.cu = null;
    this.camK = new Spring(0, { stiffness: 11, damping: 6.6 });
    this.camX = new Spring(LENS_CENTER[0], { stiffness: 8, damping: 5.7 });
    this.camY = new Spring(LENS_CENTER[1], { stiffness: 8, damping: 5.7 });
    this.camZ = new Spring(1, { stiffness: 8, damping: 5.7 });
    this.cuTitle = new HandLabel(" ", { size: 19, color: "#8a2f22" });
    this.cuDone = false;
    this.chips = [];
    this.timers = [];
    this.buildChips();
  }

  chip(opts) {
    const ch = new Chip(this, opts);
    this.chips.push(ch);
    return ch;
  }
  buildChips() {
    const C = LABELS.chips,
      H = LABELS.hints,
      S = () => this.state;
    const mk = (id, i, color, isOn, onClick, icon, w = 128) => this.chip({ id: `block-${id}`, label: H[id], text: C[id], hint: H[id], x: 86 + i * 138, y: ROW_Y, w, size: 18, color, isOn, onClick, icon });
    mk("patient", 0, P.red, () => S().patient, () => this.setLive({ patient: !S().patient }), (c, o) => this.iconPatient(c, o));
    // the patient switch stays during close-ups (FBP1 has a patient version); the rest give way to the choices
    this.mainChips = [
      mk("fast", 1, P.honey, () => !S().fed, () => this.setLive(S().fed ? { fed: false, stress: true } : { fed: true, stress: false }), (c, o) => this.iconFast(c, o)),
      mk("iv", 2, P.blue, () => S().iv, () => this.setLive({ iv: !S().iv }), (c, o) => this.iconIV(c, o)),
      mk("reset", 3, P.plum, () => false, () => this.gotoStep(0), (c, o) => this.iconReset(c, o)),
      mk("deep", 4, P.teal, () => false, () => this.openStructure(), (c, o) => this.iconDeep(c, o)),
    ];
    const L = CLOSEUP_LABELS,
      ck = (id, x, w, color, onClick, icon) => this.chip({ id: `block-cu-${id}`, label: L.hints[id], text: L[id], hint: L.hints[id], x, y: ROW_Y, w, size: 18, color, onClick, icon });
    this.cuChips = {
      back: ck("back", 224, 128, P.plum, () => this.leaveCloseup(), (c, o) => this.iconBack(c, o)),
      replay: ck("replay", 362, 128, P.honey, () => this.replayCloseup(), (c, o) => this.iconReset(c, o)),
      next: ck("next", 510, 150, P.teal, () => this.enterCloseup(nextCloseup(CLOSEUPS, this.cu.def.id)), (c, o) => this.iconNext(c, o)),
      deep: ck("deep", 672, 150, P.blue, () => this.openStructure(), (c, o) => this.iconDeep(c, o)),
    };
    for (const ch of Object.values(this.cuChips)) ch.ctl.setHidden(true, true);
    const T = LABELS.lecture;
    this.lectureChip = this.chip({ id: "block-lecture", label: T.hint, text: T.open, hint: T.hint, x: 1062, y: 96, w: 124, size: 18, color: P.honey, isOn: () => this.notes.expanded, onClick: () => this.toggleLecture() });
  }
  iconPen(c, o, strokes, colors) {
    const s = pose(o.state);
    c.save();
    c.translate(o.x, o.y - 1);
    strokes(s).forEach((pts, i) => penLine(c, pts, { color: colors[i % colors.length], width: 1.7, progress: o.progress, variant: o.state, seed: 5 + i, taper: false, boil: 0.2 }));
    c.restore();
  }
  iconPatient(c, o) {
    this.iconPen(c, o, (s) => [ellipsePts(-2, 0, 9, 8, 14, 0.05, 1), [[-12, 10 + s * 0.3], [8, -10]], [[-8, 12], [12, -8 + s * 0.3]]], ["#6d8f98", P.red, P.red]);
  }
  iconFast(c, o) {
    this.iconPen(c, o, (s) => [ellipsePts(0, 3, 12, 5, 16, 0.04, 2), [[-6, -8 + s], [-4, -2]], [[4, -9], [2 + s * 0.5, -2]]], [P.inkDeep, P.honey, P.honey]);
  }
  iconIV(c, o) {
    this.iconPen(c, o, (s) => [[[-6, -12], [6, -12], [7, 0], [0, 4], [-7, 0], [-6, -12]], [[0, 4], [0, 10 + s * 0.4]], [[-3, 13], [0, 10], [3, 13]]], [P.blue, P.inkDeep, P.blue]);
  }
  iconReset(c, o) {
    this.iconPen(c, o, (s) => [Array.from({ length: 14 }, (_, i) => [Math.cos(-0.5 + (i / 13) * 5 + s * 0.12) * 10, Math.sin(-0.5 + (i / 13) * 5 + s * 0.12) * 10]), [[8, -12 + s], [10, -5], [3, -4]]], [P.plum]);
  }
  iconDeep(c, o) {
    this.iconPen(c, o, (s) => [ellipsePts(-3, -2, 8, 8, 14, 0.05, 3), [[3, 4], [10 + s * 0.4, 11]]], [P.teal, P.inkDeep]);
  }
  iconBack(c, o) {
    this.iconPen(c, o, (s) => [[[11, s * 0.4], [-10, 0]], [[-4, -7 + s * 0.3], [-11, 0], [-4, 7]], ellipsePts(0, 0, 14, 11, 16, 0.06, 2).slice(9, 16)], [P.plum, P.plum, P.inkDeep]);
  }
  iconNext(c, o) {
    this.iconPen(c, o, (s) => [ellipsePts(-4, -1, 7, 7, 14, 0.05, 4), [[1, 4], [6, 9]], [[6, -9 + s * 0.4], [13, -4], [6, 1]]], [P.teal, P.inkDeep, P.teal]);
  }

  roomJobs() {
    return [
      () => this.cyto.bake(),
      () => (this.mol = bakeMolecules()),
      () => (this.fbp1 = bakeFBP1(this.data)),
      () =>
        (this.art = {
          bandL: bloodBand("left"),
          bandR: bloodBand("right"),
          memL: membrane("left", CARRIERS.left),
          memR: membrane("right", CARRIERS.right),
          rbc: redCell(),
          er: er(420, 150),
          mito: mito(),
          gn: glycogen(),
        }),
      () => this.chips.forEach((ch) => ch.bake()),
    ];
  }
  bakeJobs() {
    return this.roomJobs();
  }

  onEnter() {
    this.titleLabel.show(this.reduced);
    this.subLabel.show(this.reduced);
    this.hint.show(this.reduced);
    this.pager.reset();
    this.notes.show(this.reduced);
    this.gotoStep(0, { first: true });
    for (const ch of this.chips) ch.text.ink.snap(true);
    this.prewarmFlow(8);
  }
  /** Run the flow for a while off-screen so the page opens with molecules already on their way. */
  prewarmFlow(seconds) {
    for (let t = 0; t < seconds; t += 1 / 20) this.stepFlow(1 / 20);
    this.flashes = [];
  }
  onLeave() {
    this.timers.forEach(clearTimeout);
  }

  /* ---------- story ---------- */
  gotoStep(i, { beat = 0, first = false } = {}) {
    if (this.cu) this.leaveCloseup({ quiet: true, restore: false, snap: first });
    this.track.go(i, beat);
    this.showBeat(first, true);
  }
  beatMove(dir) {
    if (!this.interactive) return;
    if (this.notes.expanded) this.setLecture(false, { quiet: true });
    const r = dir > 0 ? this.track.next() : this.track.prev();
    if (!r) return;
    this.showBeat(false, r.stepChanged);
  }
  showBeat(first, stepChanged) {
    const st = STEPS[this.track.step],
      j = this.track.beat,
      beat = st.beats[j];
    if (stepChanged) {
      this.notes.setContent(st.note, this.reduced);
      this.pager.state.index = this.track.step;
      this.pager.sync();
      if (st.state.setGlycogen !== undefined) this.glycogen = st.state.setGlycogen;
    }
    this.state = beatState(st, j, DEFAULT_STATE);
    this.pulse = beat.pulse || null;
    this.cueAt = this.time;
    this.caption.set(beat.say, beat.fine || "", this.reduced);
    this.beatPager.setPosition(j, st.beats.length, this.track.atStart, this.track.atEnd);
    if (!first) this.app.foley.play("paper", { strength: 0.35 });
    if (!this.warming) this.announce(beat.say + "。" + (beat.fine || ""));
  }
  /** Chips change the live state without moving the story; the next beat takes over again. */
  setLive(patch) {
    this.state = { ...this.state, ...patch, spot: [], nodes: [] };
    this.app.foley.play("wood", { strength: 0.45 });
    // inside a close-up the switch replays the sentence on screen in the other version
    if (this.cu && !this.cu.leaving && "patient" in patch) {
      const tl = this.cu.tl;
      tl.t = tl.starts[tl.phase];
      this.notes.setContent(closeupNote(this.cu.def, this.state.patient), this.reduced);
      this.showCloseupLine();
    }
  }
  /** Space, arrows and the page's pager step through a close-up's sentences when one is open. */
  move(dir) {
    if (this.cu && !this.cu.leaving) this.closeupMove(dir);
    else this.beatMove(dir);
  }

  /* ---------- close-ups ---------- */
  enterCloseup(def) {
    const r = this.reduced,
      from = this.camK.value > 0.05;
    if (this.notes.expanded) this.setLecture(false, { quiet: true });
    this.cu = { def, tl: new Timeline(def.lines.map((l) => l.dur)), leaving: false, travel: from && this.camK.value > 0.7 ? 0.85 : 0 };
    this.cuDone = null;
    if (!from) {
      this.camX.snap(def.focus[0]);
      this.camY.snap(def.focus[1]);
      this.camZ.snap(def.zoom);
    }
    this.camX.target = def.focus[0];
    this.camY.target = def.focus[1];
    this.camZ.target = def.zoom;
    this.camK.target = 1;
    this.setChipMode(true);
    this.cuTitle.set(`${CLOSEUP_LABELS.title} · ${def.label}`, r);
    this.cuTitle.setVisible(true, r);
    this.hint.set(CLOSEUP_LABELS.keys, r);
    this.notes.setContent(closeupNote(def, this.state.patient), r);
    this.showCloseupLine();
    this.app.foley.play("paper", { strength: 0.5 });
  }
  leaveCloseup({ quiet = false, restore = true, snap = false } = {}) {
    if (!this.cu || this.cu.leaving) return;
    const r = this.reduced;
    this.cu.leaving = true;
    this.camK.target = 0;
    if (snap) {
      this.camK.snap(0);
      this.cu = null;
    }
    this.setChipMode(false);
    this.cuTitle.hide(r);
    this.hint.set(LABELS.hint, r);
    if (restore) {
      const st = STEPS[this.track.step],
        j = this.track.beat,
        beat = st.beats[j];
      this.notes.setContent(st.note, r);
      this.caption.set(beat.say, beat.fine || "", r);
      this.beatPager.setPosition(j, st.beats.length, this.track.atStart, this.track.atEnd);
      this.cueAt = this.time;
    }
    if (!quiet) {
      this.app.foley.play("paper", { strength: 0.45 });
      this.announce("回到全景");
    }
  }
  replayCloseup() {
    if (!this.cu) return;
    this.cu.tl.replay();
    this.showCloseupLine();
    this.app.foley.play("paper", { strength: 0.35 });
  }
  closeupMove(dir) {
    const cu = this.cu,
      tl = cu.tl;
    if (dir > 0) {
      if (tl.next()) this.showCloseupLine();
      else if (tl.done) this.leaveCloseup();
      // the last sentence is still playing: finish it so the choices come up
      else tl.t = tl.total;
    } else if (tl.prev()) this.showCloseupLine();
  }
  showCloseupLine() {
    const { def, tl } = this.cu,
      n = def.lines.length,
      line = closeupLine(def, tl.phase, this.state.patient);
    this.caption.set(line.say, line.fine, this.reduced);
    this.beatPager.setPosition(tl.phase, n, tl.phase === 0, tl.phase === n - 1);
    if (!this.warming) this.announce(line.say + "。" + line.fine);
  }
  /** During a close-up the scene chips step aside for the way back; the other choices wait for the end. */
  setChipMode(inCloseup) {
    const r = this.reduced;
    for (const ch of this.mainChips) ch.ctl.setHidden(inCloseup, r);
    this.cuChips.back.ctl.setHidden(!inCloseup, r);
    if (!inCloseup) for (const id of ["replay", "next", "deep"]) this.cuChips[id].ctl.setHidden(true, r);
  }
  syncChoices() {
    const cu = this.cu,
      done = !!cu && !cu.leaving && cu.tl.done;
    if (done === this.cuDone) return;
    this.cuDone = done;
    const r = this.reduced;
    this.cuChips.replay.ctl.setHidden(!done, r);
    this.cuChips.next.ctl.setHidden(!done, r);
    this.cuChips.deep.ctl.setHidden(!(done && cu.def.deep), r);
    if (done && !this.warming) this.app.foley.play("write", { strength: 0.4 });
  }
  camera() {
    return focusTransform({ focus: [this.camX.value, this.camY.value], zoom: this.camZ.value, center: LENS_CENTER, k: clamp(this.camK.value, 0, 1.2) });
  }
  openStructure() {
    this.app.foley.play("paper", { strength: 0.6 });
    location.href = "room.html";
  }
  toggleLecture() {
    this.setLecture(!this.notes.expanded);
  }
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

  /* ---------- input ---------- */
  pointer(x, y, buttons = 0, overUi = false) {
    this.overUi = overUi;
    this.pointerAt = x === null ? null : { x, y };
  }
  click(x, y) {
    if (!this.interactive) return;
    const cr = this.caption.rect();
    if (cr && x >= cr.x && x <= cr.x + cr.w && y >= cr.y && y <= cr.y + cr.h) return this.move(1);
    if (this.cu && !this.cu.leaving) {
      if (this.inLens(x, y)) this.closeupMove(1);
      return;
    }
    const ring = this.ringAt(x, y);
    if (ring) return this.enterCloseup(ring);
    if (this.overFBP1(x, y)) return this.enterCloseup(CU_BY_ID.fbp1);
  }
  key(e) {
    if (!this.interactive) return;
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      this.move(1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      this.move(-1);
    } else if (e.key === "t" || e.key === "T") this.toggleLecture();
    else if (e.key === "Home") this.gotoStep(0);
  }
  escape() {
    if (!this.interactive || !this.cu || this.cu.leaving) return false;
    this.leaveCloseup();
    return true;
  }
  inLens(x, y) {
    return x >= LENS.x0 && x <= LENS.x1 && y >= LENS.y0 && y <= LENS.y1;
  }
  ringAt(x, y) {
    return this.cu ? null : closeupAt(CLOSEUPS, x, y);
  }
  overFBP1(x, y) {
    return Math.abs(x - FBP1_AT[0]) < 62 && Math.abs(y - FBP1_AT[1]) < 66;
  }
  nodeAt(x, y) {
    let best = null,
      bd = 20;
    for (const [n, [nx, ny]] of Object.entries(NODES)) {
      if (n.endsWith("In")) continue;
      const d = Math.hypot(nx - x, ny - y);
      if (d < bd) {
        bd = d;
        best = n;
      }
    }
    return best;
  }

  /* ---------- update ---------- */
  stepFlow(dt) {
    const S = this.state;
    this.glycogen = stepGlycogen(this.glycogen, dt, S);
    this.sim.update(dt, { blocked: S.patient, rates: spawnRates({ ...S, glycogen: this.glycogen }) });
    for (const e of this.sim.events) {
      if (e.kind === "fbp1") this.flashes.push({ x: FBP1_AT[0], y: FBP1_AT[1] - 70, t: 0, color: "#7aa7a1" });
      else if (e.node === "glcOut") this.flashes.push({ x: NODES.glcOut[0], y: NODES.glcOut[1], t: 0, color: "#d8b14e" });
      else if (e.node === "lacOut") this.flashes.push({ x: NODES.lacOut[0], y: NODES.lacOut[1], t: 0, color: "#c47b70" });
    }
    for (const f of this.flashes) f.t += dt;
    this.flashes = this.flashes.filter((f) => f.t < 0.6);
  }
  update(dt) {
    super.update(dt);
    const r = this.reduced,
      S = this.state;
    for (const l of [this.titleLabel, this.subLabel, this.hint, this.tip, this.cuTitle]) l.update(dt);
    this.updateCamera(dt, r);
    this.caption.update(dt, r);
    this.pager.update(dt, r);
    this.beatPager.update(dt, r);
    for (const ch of this.chips) ch.update(dt, r);
    this.cyto.update(dt, r);
    this.stepFlow(dt);
    const tg = bloodTargets({ ...S, glycogen: this.glycogen });
    this.gGlc.target = tg.glucose;
    this.gLac.target = tg.lactate;
    this.gGlc.update(dt, r);
    this.gLac.update(dt, r);
    this.patientK.target = S.patient ? 1 : 0;
    this.patientK.update(dt, r);
    // diet glucose and IV glucose ride down the left sinusoid
    const rate = (S.fed ? 1.2 : 0) + (S.iv ? 1.6 : 0);
    this.bloodAcc += rate * dt;
    while (this.bloodAcc >= 1) {
      this.bloodAcc -= 1;
      this.bloodTokens.push({ y: BAND_TOP - 10, x: 22 + Math.random() * 30, v: 34 + Math.random() * 14, iv: S.iv && (!S.fed || Math.random() < 0.6), id: Math.random() * 100 });
    }
    for (const b of this.bloodTokens) b.y += b.v * dt;
    this.bloodTokens = this.bloodTokens.filter((b) => b.y < 760);
    // hover
    const p = this.pointerAt;
    let tipText = null;
    this.hoverNode = null;
    this.hoverRing = p && !this.overUi ? this.ringAt(p.x, p.y) : null;
    if (p && !this.overUi && p.x < 870 && !this.cu) {
      if (this.hoverRing) tipText = `${CLOSEUP_LABELS.ring} · ${this.hoverRing.label}`;
      else if (this.overFBP1(p.x, p.y)) tipText = LABELS.fbp1Hint;
      else {
        const n = this.nodeAt(p.x, p.y);
        if (n) {
          this.hoverNode = n;
          tipText = NODE_INFO[n].join(" · ");
        }
      }
    }
    if (tipText) this.tip.set(tipText, r);
    this.tip.setVisible(!!tipText, r);
    const live = this.cu && !this.cu.leaving;
    this.app.stage.style.cursor = p && !this.overUi && (live ? this.inLens(p.x, p.y) : this.hoverRing || this.overFBP1(p.x, p.y)) ? "pointer" : "";
  }
  updateCamera(dt, r) {
    const cu = this.cu;
    if (cu) {
      // between two close-ups the camera backs off a little, travels, and moves in again
      if (cu.travel > 0) cu.travel -= dt;
      this.camK.target = cu.leaving ? 0 : cu.travel > 0.3 ? 0.62 : 1;
      if (!cu.leaving && cu.travel <= 0 && this.camK.value > 0.9) cu.tl.update(dt);
    }
    for (const s of [this.camK, this.camX, this.camY, this.camZ]) s.update(dt, r);
    if (cu?.leaving && this.camK.value < 0.01) {
      this.camK.snap(0);
      this.cu = null;
    }
    this.syncChoices();
  }
  get writing() {
    return super.writing || this.titleLabel.writing || this.subLabel.writing || this.caption.writing || this.chips.some((c) => c.text.writing);
  }
  get erasing() {
    return super.erasing || this.caption.erasing;
  }

  /* ---------- rehearsal behind the loading page ---------- */
  warmPlan() {
    const step = (i) => () => this.gotoStep(i, { first: true });
    const beat = (i, j) => {
      this.track.go(i, j);
      this.showBeat(true, false);
    };
    return [
      { label: "铺开肝细胞切面", enter: step(0), frames: 10, each: (i) => (this.pointerAt = i === 4 ? { x: NODES.f6p[0], y: NODES.f6p[1] } : null) },
      { label: "画出各条糖异生路线", enter: step(1), frames: 14, measure: true, each: (i) => i === 7 && beat(1, 3) },
      { label: "演练 FBP1 受阻", enter: step(2), frames: 18, measure: true, each: (i) => i === 9 && beat(2, 3) },
      { label: "放入半乳糖、甘露糖与果糖", enter: step(3), frames: 14, measure: true, each: (i) => i === 6 && beat(3, 3) },
      { label: "感染禁食与静脉补糖", enter: step(4), frames: 14, measure: true, each: (i) => i === 6 && beat(4, 3) },
      {
        label: "推近镜头，演练特写",
        enter: () => this.enterCloseup(CU_BY_ID.fbp1),
        frames: 18,
        measure: true,
        each: (i) => {
          if (i === 3) this.camK.snap(1);
          if (i === 8) this.closeupMove(1);
          if (i === 12) this.enterCloseup(CU_BY_ID.mito);
        },
      },
      { label: "回到第一步", enter: step(0), frames: 10, measure: true },
    ];
  }
  afterWarm() {
    if (this.cu) this.leaveCloseup({ quiet: true, restore: false, snap: true });
    this.syncChoices();
    for (const ch of [...this.mainChips, ...Object.values(this.cuChips)]) ch.ctl.vis = ch.ctl.hidden ? 0 : 1;
    this.cuTitle.ink.snap(false);
    this.hint.set(LABELS.hint, true);
    this.pointerAt = null;
    this.caption.snap();
    this.tip.ink.snap(false);
    this.tip.pending = null;
    this.sim.reset();
    this.glycogen = 1;
    this.flashes = [];
    this.bloodTokens = [];
  }

  /* ---------- draw ---------- */
  routeAlpha(route) {
    const spot = this.state.spot;
    if (!spot || !spot.length) return 1;
    return spot.includes(route) ? 1 : 0.28;
  }
  tokenPos(t) {
    const r = ROUTES[t.route],
      a = r[t.i],
      b = r[t.i + 1],
      u = clamp(t.s / this.sim.len[t.route][t.i]);
    return edgePoint(NODES[a], NODES[b], u, BEND[`${a}>${b}`] || 0);
  }
  drawMol(c, kind, x, y, id, alpha = 1, scale = MOL_SCALE, progress = 1) {
    const spr = this.mol?.[kind];
    if (!spr || alpha <= 0.01) return;
    const fr = this.reduced ? 0 : FRAMES[Math.floor(this.time * 2.4 + id * 0.61) % 4];
    spr.draw(c, x, y, { frame: fr, scale, alpha, progress, angle: this.reduced ? 0 : Math.sin(this.time * 0.9 + id) * 0.08 });
  }
  draw(c) {
    const t = this.time,
      r = this.reduced,
      S = this.state,
      env = this.p("env"),
      pc = this.p("char"),
      lp = this.p("label"),
      ui = this.p("ui");
    const k = clamp(this.camK.value),
      zoomed = k > 0.002,
      calm = 1 - 0.93 * k;
    if (zoomed) {
      c.save();
      this.lensPath(c, k);
      c.clip();
      this.camera().toCanvas(c);
    }
    this.drawCellFloor(c, env);
    this.cyto.draw(c, t, r, 0, this.p("env", 0.1), this.cam);
    this.drawBlood(c, env, t, r);
    this.drawOrganelles(c, this.p("prop"), t, r);
    this.cyto.draw(c, t, r, 1, this.p("prop"), this.cam);
    if (pc > 0.02) {
      this.drawTracks(c, pc * calm, t);
      // in its own close-up the enzyme steps back so the substrate in its pocket reads first
      this.drawFBP1(c, pc, t, r, 1 - k * (this.cu?.def.id === "fbp1" ? 0.5 : 0.75));
      this.drawTokens(c, pc * calm);
      if (!zoomed) this.drawFlashes(c);
    }
    if (pc > 0.98 && k < 0.98) this.drawTags(c, lp * (1 - k), t, r);
    if (pc > 0.98) this.drawRings(c, lp * (1 - k), t, r);
    this.cyto.draw(c, t, r, 2, this.p("prop", 0.3), this.cam);
    this.drawRegionLabels(c, lp * (1 - k));
    if (zoomed) {
      const cu = this.cu;
      if (cu) drawCloseup(cu.def.id, this, c, cu.def.focus, cu.tl.local, { k: clamp((k - 0.62) / 0.3) * lp, patient: this.state.patient, variant: this.ringFlick.at(t, { reduced: r }) });
      c.restore();
      this.drawLens(c, k, lp, t, r);
    }
    this.titleLabel.draw(c, 60, 24, { progress: lp });
    // Open up the header with the camera, keeping the overview's diagram positions intact.
    this.subLabel.draw(c, 62, 66 + 10 * k, { progress: this.p("label", 0.2) });
    this.hint.draw(c, 62, 92 + 16 * k, { progress: lp });
    if (this.tip.ink.progress > 0 && this.pointerAt) this.drawTip(c, lp);
    this.notes.draw(c, { progress: this.p("env", 0.3), labelProgress: lp, shift: this.cam.shift(0.4) });
    this.caption.draw(c, this.notes.zone, { progress: lp, time: t, reduced: r });
    this.drawGauges(c, lp, t, r);
    this.pager.draw(c, { progress: ui, time: t, reduced: r });
    this.beatPager.draw(c, { progress: ui, time: t, reduced: r });
    this.drawControls(c);
  }
  drawCellFloor(c, env) {
    const g = c.createRadialGradient(440, 420, 40, 440, 420, 460);
    g.addColorStop(0, "rgba(252,246,232,0.9)");
    g.addColorStop(1, "rgba(240,228,206,0.4)");
    c.save();
    c.globalAlpha *= clamp(env * 1.4);
    c.fillStyle = g;
    c.fillRect(MEMBRANE.left, 90, MEMBRANE.right - MEMBRANE.left, 660);
    c.restore();
  }
  drawBlood(c, env, t, r) {
    if (!this.art) return;
    const fr = this.reduced ? 0 : FRAMES[Math.floor(t * 2.2) % 4];
    this.art.bandL.draw(c, BLOOD.left[0] - 4, BAND_TOP, { progress: env, frame: fr });
    this.art.bandR.draw(c, BLOOD.right[0] - 4, BAND_TOP, { progress: env, frame: (fr + 1) % 3 });
    if (env < 0.6) return;
    // red cells drifting down both sinusoids
    for (let k = 0; k < 16; k++) {
      const side = k % 2 ? "right" : "left",
        [x0, x1] = BLOOD[side],
        speed = 26 + (k % 5) * 3,
        y = BAND_TOP + ((((r ? 0 : t) * speed + k * 97) % 680) + 680) % 680 - 20,
        x = x0 + 12 + ((k * 23) % (x1 - x0 - 24));
      if (y > BAND_TOP + 640) continue;
      this.art.rbc.draw(c, x, y, { frame: (k + Math.floor(t * 2)) % 3, angle: Math.sin(t * 0.7 + k) * 0.5, alpha: 0.9 });
    }
    const lit = this.state.spot.includes("iv") || this.state.spot.includes("diet");
    if (lit) glow(c, 36, 360, 150, "rgba(232,196,90,0.45)", clamp((t - (this.cueAt || 0)) * 1.5));
    for (const b of this.bloodTokens) if (b.y > BAND_TOP && b.y < BAND_TOP + 640) this.drawMol(c, "glucose", b.x, b.y, b.id, b.iv ? 1 : 0.85, 0.5);
    this.art.memL.draw(c, MEMBRANE.left, BAND_TOP, { progress: env, frame: fr });
    this.art.memR.draw(c, MEMBRANE.right, BAND_TOP, { progress: env, frame: (fr + 2) % 3 });
  }
  drawOrganelles(c, pr, t, r) {
    if (!this.art) return;
    const fr = r ? 0 : FRAMES[Math.floor(t * 2) % 4];
    c.save();
    c.globalAlpha *= 0.72;
    this.art.er.draw(c, 212, 168, { progress: pr, frame: fr, scale: 0.78 });
    this.art.mito.draw(c, 392, 684, { progress: pr, frame: (fr + 1) % 3, scale: 0.55 });
    c.restore();
    const g = this.glycogen;
    [[704, 120, 0.62], [662, 98, 0.44], [748, 98, 0.4]].forEach(([x, y, s], i) => {
      const k = clamp(g * 3 - i);
      if (k <= 0.02) return;
      this.art.gn.draw(c, x, y, { progress: pr, frame: (fr + i) % 3, scale: s * (0.55 + 0.45 * k), alpha: 0.4 + 0.6 * k });
    });
  }
  drawTracks(c, pc, t) {
    const pk = this.patientK.value;
    c.save();
    c.lineCap = "round";
    for (const e of this.edges) {
      const spill = e.cls === "spill";
      const alpha = Math.max(...e.routes.map((rt) => this.routeAlpha(rt))) * (spill ? pk : 1) * pc;
      if (alpha < 0.02) continue;
      const a = NODES[e.a],
        b = NODES[e.b],
        bend = BEND[e.key] || 0;
      c.globalAlpha = alpha * (spill ? 0.8 : 0.55);
      c.strokeStyle = TRACK_COLOR[e.cls];
      c.lineWidth = this.state.spot.length && alpha > 0.9 ? 3 : 2;
      c.setLineDash(spill ? [3, 6] : [7, 6]);
      c.lineDashOffset = -t * (spill ? 14 : 18);
      c.beginPath();
      for (let k = 0; k <= 16; k++) {
        const [x, y] = edgePoint(a, b, k / 16, bend);
        k ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
      // a small chevron at the middle shows the direction of the carbon flow
      const [mx, my] = edgePoint(a, b, 0.55, bend),
        [nx, ny] = edgePoint(a, b, 0.62, bend),
        ang = Math.atan2(ny - my, nx - mx);
      c.setLineDash([]);
      c.beginPath();
      c.moveTo(mx - Math.cos(ang - 0.6) * 6, my - Math.sin(ang - 0.6) * 6);
      c.lineTo(mx, my);
      c.lineTo(mx - Math.cos(ang + 0.6) * 6, my - Math.sin(ang + 0.6) * 6);
      c.stroke();
    }
    c.restore();
  }
  drawFBP1(c, pc, t, r, mute = 1) {
    if (!this.fbp1) return;
    pc *= mute;
    const pk = this.patientK.value,
      fr = this.fbpFlick.at(t, { reduced: r }),
      size = this.fbp1.size * 0.78,
      [x, y] = FBP1_AT,
      pulse = this.pulse === "fbp1" ? clamp((t - this.cueAt) * 1.5) * (0.5 + 0.5 * Math.sin(t * 4)) : 0;
    glow(c, x, y, 96, pk > 0.5 ? "rgba(200,90,70,0.35)" : "rgba(122,167,161,0.35)", (0.6 + pulse * 0.5) * mute);
    c.save();
    c.globalAlpha *= pc * (1 - pk);
    c.drawImage(this.fbp1.normal[fr], x - size / 2, y - size / 2, size, size);
    c.globalAlpha = pc * pk * 0.85;
    c.drawImage(this.fbp1.patient[fr], x - size / 2, y - size / 2, size, size);
    c.restore();
    // the figure's mark for a blocked step: two red strokes across the arrow
    if (pk > 0.02) {
      const k = pk * pc;
      // on the F-1,6-BP -> F6P arrow, between the enzyme and its missing product
      const my = (NODES.f6p[1] + (y - 74)) / 2;
      for (const o of [-4, 4]) penLine(c, [[x - 20, my + o + 7], [x + 20, my + o - 7]], { color: "#c0392b", width: 3, progress: k, variant: fr, seed: 7 + o, taper: false });
      this.drawText(c, LABELS.blocked, x + 28, my, "#b13c30", k, 17);
    }
    this.drawText(c, LABELS.fbp1, x - 30, y - 70, "#355d58", pc, 18, "right");
  }
  drawTokens(c, pc) {
    const sim = this.sim;
    // waiting at the triose phosphates for a partner
    sim.triWait.forEach((tk, k) => this.drawMol(c, "triose", NODES.tri[0] - 26 - k * 10, NODES.tri[1] + 6, tk.id, pc * this.routeAlpha(tk.route)));
    // the pile of F-1,6-BP in front of the defective enzyme
    sim.pile.forEach((tk, k) => {
      const row = Math.floor(k / 5),
        col = k % 5,
        x = NODES.f16bp[0] + (col - 2) * 20 + (row % 2) * 10,
        y = NODES.f16bp[1] + 10 + row * 15 + Math.sin(this.time * 1.3 + k) * 1.2;
      this.drawMol(c, "f16bp", x, y, tk.id, pc);
    });
    for (const tk of sim.tokens) {
      const [px, py] = this.tokenPos(tk),
        x = px + Math.sin(this.time * 1.7 + tk.wob) * 2,
        y = py + Math.cos(this.time * 1.3 + tk.wob) * 2,
        kind = sim.kindOf(tk);
      if (tk.pair) {
        this.drawTrioseMerge(c, tk, x, y, pc);
        continue;
      }
      this.drawMol(c, kind, x, y, tk.id, pc * this.routeAlpha(tk.route));
    }
  }
  /** Pair on the tri -> F16BP edge, finishing the ink change before the next node. */
  drawTrioseMerge(c, tk, x, y, pc) {
    const u = clamp(tk.s / this.sim.len[tk.route][tk.i]),
      approach = smooth(u / 0.35),
      erase = 1 - smooth((u - 0.25) / 0.25),
      draw = smooth((u - 0.5) / 0.4),
      // The oldest partner was waiting at this position; bring it into the moving pair.
      ax = NODES.tri[0] - 26,
      ay = NODES.tri[1] + 6;
    this.drawMol(c, "triose", ax + (x - 12 - ax) * approach, ay + (y - ay) * approach, tk.pair.id, pc * this.routeAlpha(tk.pair.route), MOL_SCALE, erase);
    this.drawMol(c, "gap", x + 12 * approach, y, tk.id, pc * this.routeAlpha(tk.route), MOL_SCALE, erase);
    this.drawMol(c, "f16bp", x, y, tk.id, pc * this.routeAlpha(tk.route), MOL_SCALE, draw);
  }
  drawFlashes(c) {
    for (const f of this.flashes) {
      const k = f.t / 0.6;
      c.save();
      c.globalAlpha = (1 - k) * 0.8;
      c.strokeStyle = f.color;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(f.x, f.y, 6 + k * 18, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
  }
  drawTags(c, lp, t, r) {
    const pointed = new Set(this.state.nodes || []);
    if (this.hoverNode) pointed.add(this.hoverNode);
    const k = clamp((t - (this.cueAt || 0) - 0.3) * 2.5) * lp,
      fr = this.ringFlick.at(t, { reduced: r });
    for (const [n, label] of Object.entries(NODE_TAG)) {
      const lit = pointed.has(n),
        main = MAIN_TAGS.includes(n);
      if (!lit && !main) continue;
      const [x, y] = NODES[n],
        right = x > 690 || n === "f16bp",
        size = lit ? 19 : 15,
        a = lit ? Math.max(k, n === this.hoverNode ? 1 : 0) : 0.82 * lp;
      if (lit) {
        const rr = 15;
        penLine(c, ellipsePts(x, y, rr * (1 + pose(fr) * 0.05), rr * 0.86, 22, 0.06, fr), { color: "#c0482f", width: 1.8, progress: a, variant: fr, seed: 9, taper: false, boil: 0.3 });
      }
      this.drawText(c, label, x + (right ? -16 : 16), y - 18, lit ? "#8a2f22" : "#5c4631", a, size, right ? "right" : "left");
    }
  }
  /** Small hand-drawn magnifiers where a close-up waits; the pointed one grows and darkens. */
  drawRings(c, a, t, r) {
    if (a <= 0.01) return;
    const fr = this.ringFlick.at(t, { reduced: r });
    CLOSEUPS.forEach((cu, i) => {
      const [x, y] = cu.at,
        hv = this.hoverRing === cu,
        rr = hv ? 11.5 : 9,
        breath = r ? 0 : 0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.3);
      c.save();
      c.globalAlpha *= a * (0.12 + 0.12 * breath + (hv ? 0.15 : 0));
      c.fillStyle = "#f0c46a";
      c.beginPath();
      c.arc(x, y, rr + 5 + breath * 2, 0, Math.PI * 2);
      c.fill();
      c.restore();
      const col = hv ? "#8a2f22" : "#a5562f",
        w = hv ? 2 : 1.6,
        al = a * (hv ? 1 : 0.85);
      penLine(c, ellipsePts(x, y, rr, rr * 0.94, 18, 0.05, fr + i), { color: col, width: w, progress: al, variant: fr, seed: 21 + i, taper: false, boil: 0.3 });
      penLine(c, [[x + rr * 0.72, y + rr * 0.72], [x + rr * 1.5, y + rr * 1.5 + pose(fr) * 0.4]], { color: col, width: w + 0.8, progress: al, variant: fr, seed: 31 + i, taper: false });
      penLine(c, [[x - 4, y], [x + 4, y]], { color: col, width: 1.2, progress: al, variant: fr, seed: 41 + i, taper: false });
      penLine(c, [[x, y - 4], [x, y + 4]], { color: col, width: 1.2, progress: al, variant: fr, seed: 51 + i, taper: false });
    });
  }
  /** The lens window grows from the whole stage to the framed close-up as the camera moves in. */
  lensRect(k) {
    const l = (a, b) => a + (b - a) * k;
    return { x0: l(-40, LENS.x0), y0: l(-40, LENS.y0), x1: l(900, LENS.x1), y1: l(840, LENS.y1) };
  }
  lensPath(c, k) {
    const { x0, y0, x1, y1 } = this.lensRect(k),
      pts = roundedPolygon([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 18 * k, 4);
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
  }
  drawLens(c, k, lp, t, r) {
    const { x0, y0, x1, y1 } = this.lensRect(k),
      fr = this.ringFlick.at(t, { reduced: r }),
      e = 26;
    // the zoomed cell fades into the paper at the window's edge, as through a loupe
    c.save();
    this.lensPath(c, k);
    c.clip();
    for (const [gx0, gy0, gx1, gy1, rx, ry, rw, rh] of [
      [x0, 0, x0 + e, 0, x0, y0, e, y1 - y0],
      [x1, 0, x1 - e, 0, x1 - e, y0, e, y1 - y0],
      [0, y0, 0, y0 + e, x0, y0, x1 - x0, e],
      [0, y1, 0, y1 - e, x0, y1 - e, x1 - x0, e],
    ]) {
      const g = c.createLinearGradient(gx0, gy0, gx1, gy1);
      g.addColorStop(0, `rgba(242,234,216,${0.95 * k})`);
      g.addColorStop(1, "rgba(242,234,216,0)");
      c.fillStyle = g;
      c.fillRect(rx, ry, rw, rh);
    }
    c.restore();
    const pts = roundedPolygon([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 18, 4);
    penLine(c, [...pts, pts[0]], { color: "#7a6450", width: 1.8, progress: k * lp, variant: fr, seed: 61, taper: false, boil: 0.15 });
    const l = this.cuTitle;
    if (l.ink.progress > 0.01) {
      const tx = LENS.x0 + 28,
        ty = LENS.y0 + 18;
      c.save();
      c.globalAlpha *= clamp(l.ink.progress * 1.5) * k;
      c.fillStyle = "rgba(246,240,226,0.94)";
      c.beginPath();
      roundedPolygon([[tx - 10, ty - 4], [tx + l.boxWidth + 10, ty - 4], [tx + l.boxWidth + 10, ty + l.boxHeight + 4], [tx - 10, ty + l.boxHeight + 4]], 8, 3).forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
      c.closePath();
      c.fill();
      c.restore();
      l.draw(c, tx, ty, { progress: lp });
    }
  }
  drawRegionLabels(c, lp) {
    this.drawText(c, LABELS.blood, 36, 126, "#9b4f45", lp * 0.9, 15, "center");
    this.drawText(c, LABELS.portal, 840, 126, "#9b4f45", lp * 0.9, 15, "center");
    this.drawText(c, LABELS.er, 140, 214, "#5e7a5e", lp * 0.8, 14);
    this.drawText(c, LABELS.mito, 470, 716, "#8a5a36", lp * 0.8, 14);
  }
  drawText(c, text, x, y, color, alpha, size = 16, align = "left") {
    if (alpha <= 0.01) return;
    c.save();
    c.globalAlpha *= alpha;
    c.font = `${size}px "小赖", serif`;
    c.textAlign = align;
    c.textBaseline = "middle";
    c.lineJoin = "round";
    c.lineWidth = 4.5;
    c.strokeStyle = "rgba(246,240,226,0.95)";
    c.strokeText(text, x, y);
    c.fillStyle = color;
    c.fillText(text, x, y);
    c.restore();
  }
  drawTip(c, lp) {
    const p = this.pointerAt,
      l = this.tip,
      x = Math.min(p.x + 16, 860 - l.boxWidth),
      y = p.y - 34;
    const w = l.boxWidth + 14,
      h = l.boxHeight + 8;
    c.save();
    c.globalAlpha *= clamp(l.ink.progress * lp * 1.4);
    c.fillStyle = "rgba(244,238,224,0.92)";
    c.beginPath();
    roundedPolygon([[x - 6, y - 3], [x + w - 6, y - 3], [x + w - 6, y + h - 3], [x - 6, y + h - 3]], 7, 3).forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
    c.closePath();
    c.fill();
    c.restore();
    l.draw(c, x, y, { progress: 1 });
  }
  /** Two schematic readings on the page, under the sentence: blood glucose and blood lactate. */
  drawGauges(c, lp, t, r) {
    if (this.notes.expanded) return;
    const z = this.notes.zone,
      G = LABELS.gauge,
      y0 = z.bottom - 58;
    const row = (label, v, max, low, high, y, color) => {
      const x = z.x,
        w = 150,
        bad = (low !== null && v < low) || (high !== null && v > high);
      this.drawText(c, label, x, y, "#5c4631", lp, 16);
      c.save();
      c.globalAlpha *= lp;
      c.strokeStyle = "rgba(122,100,76,0.45)";
      c.lineWidth = 1.2;
      c.strokeRect(x + 64, y - 6, w, 12);
      c.fillStyle = bad ? "#c9574d" : color;
      c.fillRect(x + 65, y - 5, (w - 2) * clamp(v / max), 10);
      c.restore();
      this.drawText(c, `${v.toFixed(1)}${bad ? (low !== null && v < low ? " ↓" : " ↑") : ""}`, x + 64 + w + 8, y, bad ? "#b13c30" : "#5c4631", lp, 17);
    };
    row(G.glucose, this.gGlc.value, 7, 4.0, null, y0, "#d4b257");
    row(G.lactate, this.gLac.value, 4, null, 1.8, y0 + 24, "#c48a7d");
    this.drawText(c, `${G.unit} · ${G.note}`, z.x, y0 + 46, P.soft, lp * 0.9, 13);
  }
}
