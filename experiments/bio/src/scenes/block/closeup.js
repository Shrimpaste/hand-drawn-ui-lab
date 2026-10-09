/**
 * A close-up tells one reaction in a few sentences; each sentence owns one phase of the
 * animation. The clock plays the current phase to its end and holds until the viewer moves on.
 */
export class Timeline {
  constructor(durations) {
    this.d = durations;
    this.starts = durations.map((_, i) => durations.slice(0, i).reduce((a, b) => a + b, 0));
    this.total = durations.reduce((a, b) => a + b, 0);
    this.replay();
  }
  replay() {
    this.phase = 0;
    this.t = 0;
  }
  end(i) {
    return this.starts[i] + this.d[i];
  }
  update(dt) {
    this.t = Math.min(this.end(this.phase), this.t + Math.max(0, dt));
  }
  next() {
    if (this.phase >= this.d.length - 1) return false;
    this.t = Math.max(this.t, this.end(this.phase));
    this.phase++;
    return true;
  }
  prev() {
    if (this.phase === 0) return false;
    this.phase--;
    this.t = this.starts[this.phase];
    return true;
  }
  get done() {
    return this.phase === this.d.length - 1 && this.t >= this.total - 1e-9;
  }
  /** Phase index and its local progress 0..1 at the current time. */
  get local() {
    const i = this.phase;
    return { i, u: Math.min(1, Math.max(0, (this.t - this.starts[i]) / this.d[i])) };
  }
}

/** Sentence i of a close-up; the patient's version replaces it only where one is written. */
export function closeupLine(cu, i, patient) {
  const l = cu.lines[i],
    alt = patient && l.sayPatient;
  return { say: alt ? l.sayPatient : l.say, fine: (alt ? l.finePatient : l.fine) || "" };
}

/** The close-up on the note page: its sentences as a short numbered list. */
export function closeupNote(cu, patient) {
  return {
    kicker: "特写",
    title: cu.label,
    key: patient && cu.deep ? "患儿的 FBP1" : "放大看这一步",
    body: cu.lines.map((_, i) => {
      const { say, fine } = closeupLine(cu, i, patient);
      return `<b>${i + 1}</b>　${say}${fine ? `<span class='muted'>（${fine}）</span>` : ""}`;
    }),
  };
}

export function nextCloseup(list, id) {
  const i = list.findIndex((c) => c.id === id);
  return list[(i + 1) % list.length];
}

/** The close-up ring under (x, y), if any. */
export function closeupAt(list, x, y, r = 20) {
  let best = null,
    bd = r;
  for (const cu of list) {
    const d = Math.hypot(cu.at[0] - x, cu.at[1] - y);
    if (d < bd) {
      bd = d;
      best = cu;
    }
  }
  return best;
}

/** Camera into a close-up: at k = 1 the focus point sits at `center`, scaled by `zoom`. */
export function focusTransform({ focus, zoom, center, k }) {
  const s = 1 + (zoom - 1) * k,
    mx = focus[0] + (center[0] - focus[0]) * k,
    my = focus[1] + (center[1] - focus[1]) * k;
  return {
    s,
    mx,
    my,
    apply: ([x, y]) => [(x - focus[0]) * s + mx, (y - focus[1]) * s + my],
    invert: ([x, y]) => [(x - mx) / s + focus[0], (y - my) / s + focus[1]],
    toCanvas(c) {
      c.translate(mx, my);
      c.scale(s, s);
      c.translate(-focus[0], -focus[1]);
    },
  };
}
