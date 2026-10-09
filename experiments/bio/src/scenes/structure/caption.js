import { HandLabel } from "../../engine/label.js";
import { penLine, boilFrame } from "../../engine/pencil.js";
import { Spring } from "../../engine/motion.js";
import { P } from "../../engine/palette.js";
import { roundedPolygon, ellipsePts, clamp } from "../../engine/geom.js";
import { LABELS } from "../../content/fbp1-room.js";

/**
 * The sentence being told right now, written large on the notebook page under its heading, with a
 * highlighter band behind it. A smaller second line carries caveats. While the lecture text is
 * open the caption is suppressed (it keeps the current sentence, ready to write it again).
 */
export class Caption {
  constructor({ maxWidth = 270, size = 30 } = {}) {
    this.say = new HandLabel(" ", { size, color: P.inkDeep, maxWidth, width: 0.07 });
    this.fine = new HandLabel(" ", { size: 17, color: P.soft, maxWidth });
    this.hasFine = false;
    this.suppressed = false;
    this.bw = new Spring(100, { stiffness: 120, damping: 17 });
    this.bh = new Spring(44, { stiffness: 120, damping: 17 });
    this.last = null;
  }
  set(text, fine, reduced) {
    this.hasFine = !!fine;
    this.say.set(text, reduced);
    this.fine.set(fine || " ", reduced);
    this.say.setVisible(!this.suppressed, reduced);
    this.fine.setVisible(!this.suppressed && this.hasFine, reduced);
  }
  setSuppressed(flag, reduced) {
    this.suppressed = flag;
    this.say.setVisible(!flag, reduced);
    this.fine.setVisible(!flag && this.hasFine, reduced);
  }
  snap() {
    this.say.ink.snap(false);
    this.fine.ink.snap(false);
    this.say.pending = this.fine.pending = null;
    this.suppressed = false;
    this.last = null;
  }
  update(dt, reduced) {
    this.say.update(dt);
    this.fine.update(dt);
    this.bw.target = this.say.boxWidth + 20;
    this.bh.target = this.say.boxHeight + 10;
    this.bw.update(dt, reduced);
    this.bh.update(dt, reduced);
  }
  get writing() {
    return this.say.writing || this.fine.writing;
  }
  get erasing() {
    return this.say.erasing || this.fine.erasing;
  }
  /** Where the sentence was last drawn (stage coordinates), for click-to-advance; null when not on paper. */
  rect() {
    return this.say.ink.progress > 0.05 ? this.last : null;
  }
  draw(c, zone, { progress = 1, time = 0, reduced = false } = {}) {
    const k = Math.min(progress, this.say.ink.progress);
    this.last = { x: zone.x - 10, y: zone.y + 8, w: this.bw.value, h: this.bh.value };
    if (k <= 0.01) return;
    const { x, y, w, h } = this.last;
    // highlighter: a soft translucent band that follows the size of the words
    const box = roundedPolygon([[x, y + 2], [x + w, y], [x + w - 1, y + h], [x + 1, y + h + 1]], 6, 3);
    c.save();
    c.globalAlpha *= clamp(k * 1.8);
    c.fillStyle = "rgba(238,194,78,0.30)";
    c.beginPath();
    box.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
    c.closePath();
    c.fill();
    c.restore();
    this.say.draw(c, zone.x, y + 5, { progress });
    if (this.hasFine) this.fine.draw(c, zone.x, y + h + 14, { progress });
  }
}

/** Previous / next sentence marks with one dot per beat of the current step. */
export class BeatPager {
  constructor(scene, { x, y, color = P.honey, onPrev, onNext }) {
    Object.assign(this, { scene, x, y, color });
    const L = LABELS.beat,
      gap = 62;
    this.n = 1;
    this.index = 0;
    this.prev = scene.control({ id: `${scene.id}-beat-prev`, label: L.prev, hint: L.prev, mark: "prev", x: x - gap, y, scale: 0.5, labelAt: "left", w: 56, h: 48, onClick: onPrev });
    this.next = scene.control({ id: `${scene.id}-beat-next`, label: L.next, hint: L.next, mark: "next", x: x + gap, y, scale: 0.5, labelAt: "right", w: 56, h: 48, onClick: onNext });
    this.dot = new Spring(0, { stiffness: 140, damping: 15 });
  }
  setPosition(index, n, atStart, atEnd) {
    this.index = index;
    this.n = n;
    this.prev.setDisabled(atStart);
    this.next.setDisabled(atEnd);
  }
  update(dt, reduced) {
    this.dot.target = this.index;
    this.dot.update(dt, reduced);
  }
  draw(c, { progress = 1, time = 0, reduced = false }) {
    if (progress <= 0) return;
    const n = this.n,
      v = boilFrame(time, 6, reduced),
      sp = 20;
    for (let i = 0; i < n; i++) {
      const cx = this.x + (i - (n - 1) / 2) * sp;
      penLine(c, ellipsePts(cx, this.y, 5, 5, 14, 0.06, i), { color: P.ink, width: 1.2, variant: v, seed: 60 + i, progress, taper: false });
    }
    const cx = this.x + (this.dot.value - (n - 1) / 2) * sp;
    c.save();
    c.globalAlpha *= progress;
    c.fillStyle = this.color;
    c.beginPath();
    c.ellipse(cx, this.y, 4.4, 4.2, 0.3, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
}
