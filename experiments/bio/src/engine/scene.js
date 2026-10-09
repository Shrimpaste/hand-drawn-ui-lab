import { Reveal } from "./reveal.js";
import { Control } from "./controls.js";
import { NotePanel } from "./notes.js";

export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

/** Base for the hall and rooms: reveal schedule, semantic controls, optional note page. */
export class Scene {
  constructor(app, id) {
    this.app = app;
    this.id = id;
    this.reveal = new Reveal();
    this.controls = [];
    this.notes = null;
    this.prepared = false;
    this.interactive = false;
    this.s = {};
    this.releaseOnLeave = false;
  }
  get reduced() {
    return this.app.reduced;
  }
  get time() {
    return this.app.time;
  }
  get cam() {
    return this.app.camera;
  }
  p(layer, offset = 0) {
    return this.reveal.progress(layer, offset);
  }
  control(opts) {
    const c = new Control(this, opts);
    this.controls.push(c);
    return c;
  }
  notePanel(opts) {
    this.notes = new NotePanel(this, opts);
    return this.notes;
  }
  /** Bake artwork. Long scenes yield between sprites so the outgoing erase keeps moving. */
  async prepare(onProgress) {
    if (this.prepared) return;
    const jobs = this.bakeJobs?.() || [];
    let n = 0;
    for (const job of jobs) {
      job();
      onProgress?.(++n / jobs.length);
      await nextFrame();
    }
    this.prepared = true;
  }
  enter(from) {
    for (const c of this.controls) c.attach(this.app.hits);
    if (this.notes) this.notes.attach(this.app.notesLayer);
    this.onEnter?.(from);
  }
  leave() {
    for (const c of this.controls) c.dispose();
    this.notes?.dispose();
    this.onLeave?.();
    // Rooms re-bake on the next visit (hidden behind the outgoing erase) to cap memory.
    if (this.releaseOnLeave) {
      this.s = {};
      this.prepared = false;
    }
  }
  update(dt) {
    for (const c of this.controls) c.update(dt, this.reduced, this.cam);
    this.notes?.update(dt);
  }
  drawControls(c, layer = "ui") {
    const progress = this.p(layer);
    for (const ctl of this.controls) ctl.draw(c, { time: this.time, reduced: this.reduced, progress, cam: this.cam });
  }
  get writing() {
    return this.controls.some((c) => c.label.writing) || !!this.notes?.writing;
  }
  get erasing() {
    return this.controls.some((c) => c.label.erasing) || !!this.notes?.erasing;
  }
  announce(text) {
    this.app.announce(text);
  }
}
