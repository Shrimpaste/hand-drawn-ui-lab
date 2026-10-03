import { drawControlMark } from "../primitives/illustrated-control.js";
import { InkTransition } from "../primitives/ink.js";
import { Spring } from "../primitives/motion.js";
import { handwriting } from "../primitives/handwriting.js";
import { Pencil, palette } from "../primitives/living-ink.js";

/** Reference page navigation uses the Gallery's exact pen marks and hover motion. */
export class SketchLink {
  constructor(button, { type, label, reduced = () => false }) {
    Object.assign(this, { button, type, label, reduced });
    this.ink = new InkTransition({ writeSeconds: 0.38, eraseSeconds: 0.24 });
    this.response = new Spring(0, { stiffness: 110, damping: 17 });
    this.elapsed = 0;
    button.classList.add("study-link");
    button.setAttribute("aria-label", label);
    button.replaceChildren();
    this.canvas = document.createElement("canvas");
    this.canvas.className = "control-art";
    this.text = document.createElement("canvas");
    this.text.className = "link-ink";
    for (const c of [this.canvas, this.text])
      c.setAttribute("aria-hidden", "true");
    button.append(this.canvas, this.text);
    button.onpointerenter = () => (this.hover = true);
    button.onpointerleave = () => (this.hover = false);
    button.onfocus = () => (this.focus = button.matches(":focus-visible"));
    button.onblur = () => (this.focus = false);
    button.onpointerdown = () => (this.focus = false);
  }
  get writing() {
    return this.ink.progress > 0 && this.ink.progress < 1;
  }
  update(dt) {
    this.elapsed += dt;
    const active = Boolean(this.hover || this.focus);
    this.ink.setVisible(active, this.reduced());
    this.ink.update(dt);
    this.response.target = Number(active);
    this.response.update(dt, this.reduced());
    const dpr = Math.min(2, devicePixelRatio || 1);
    for (const [canvas, w, h] of [
      [this.canvas, 60, 48],
      [this.text, 168, 42],
    ]) {
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const c = canvas.getContext("2d");
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      if (canvas === this.canvas) {
        drawControlMark(c, this.type, {
          x: 30,
          y: 24,
          scale: 0.56,
          time: this.elapsed,
          reduced: this.reduced(),
          hover: this.response.value,
        });
        if (this.focus)
          new Pencil(c).line(
            [
              [14, 45],
              [29, 46],
              [47, 44],
            ],
            { color: palette.red, width: 1.4 },
          );
      } else
        handwriting(c, this.label, 84, 7, {
          align: "center",
          size: 16,
          color: palette.teal,
          progress: this.ink.progress,
        });
    }
    this.button.dataset.inkProgress = this.ink.progress.toFixed(3);
  }
}
