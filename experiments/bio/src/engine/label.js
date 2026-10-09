import { layoutText, drawWriting } from "./writing.js";
import { InkTransition } from "./ink.js";
import { P } from "./palette.js";
import { hashString } from "./rng.js";
import { wrapByWidth, revealState } from "./fontlayout.js";

// When a font family is set, every HandLabel renders with that font (pen-wipe reveal) instead
// of stroke-order handwriting. The structure room uses 小赖 this way.
let FONT = null,
  measureCtx = null;
export function useFontLabels(family) {
  FONT = family;
}
const fontStack = () => `${FONT}, "Cambria Math", serif`;
const LINE = 1.42;

/**
 * A handwritten label. Either driven by a scene reveal (progress passed in) or by its own
 * InkTransition. Changing text erases the old words first, then writes the new ones.
 */
export class HandLabel {
  constructor(text, { size = 22, color = P.ink, align = "left", maxWidth = Infinity, seed, width = 0.062, write = 0.9, erase = 0.4 } = {}) {
    this.size = size;
    this.color = color;
    this.align = align;
    this.maxWidth = maxWidth;
    this.width = width;
    this.seedBase = seed;
    this.ink = new InkTransition({ writeSeconds: write, eraseSeconds: erase });
    this.text = text;
    this.pending = null;
    this.wantAfterSwap = null;
    this.relayout();
  }
  relayoutFont() {
    measureCtx ||= document.createElement("canvas").getContext("2d");
    measureCtx.font = `100px ${fontStack()}`;
    const em = (s) => measureCtx.measureText(s).width / 100;
    const w = wrapByWidth(this.text, this.maxWidth / this.size, em);
    const count = w.lines.reduce((n, l) => n + [...l].length, 0);
    this.layout = { lines: w.lines, width: w.width, height: w.lines.length * LINE, total: count, strokes: [] };
    this.ink.writeSeconds = Math.min(2.4, 0.3 + count * 0.04);
    this.ink.eraseSeconds = Math.min(0.7, 0.14 + count * 0.012);
  }
  drawFont(c, x, y, p, alpha, color) {
    if (p <= 0) return;
    const L = this.layout,
      s = this.size,
      { whole, part } = revealState(p, L.total);
    c.save();
    c.font = `${s}px ${fontStack()}`;
    c.textBaseline = "top";
    c.fillStyle = color;
    c.globalAlpha *= alpha;
    const ox = this.align === "center" ? -L.width * s * 0.5 : this.align === "right" ? -L.width * s : 0;
    let n = 0;
    L.lines.forEach((line, li) => {
      const ly = y + li * LINE * s + s * 0.12,
        lw = c.measureText(line).width,
        start = x + ox + (this.align === "center" ? (L.width * s - lw) / 2 : this.align === "right" ? L.width * s - lw : 0),
        chars = [...line],
        len = chars.length;
      if (p >= 1 || n + len <= whole) c.fillText(line, start, ly);
      else if (n <= whole) {
        const k = whole - n,
          head = chars.slice(0, k).join("");
        c.fillText(head, start, ly);
        const hx = start + c.measureText(head).width,
          ch = chars[k] ?? "",
          cw = c.measureText(ch).width;
        if (part > 0 && ch) {
          c.save();
          c.beginPath();
          c.rect(hx - 1, ly - 2, cw * part + 2, s * 1.4);
          c.clip();
          c.fillText(ch, hx, ly);
          c.restore();
          c.globalAlpha *= 0.8;
          c.beginPath();
          c.arc(hx + cw * part, ly + s * 0.92, Math.max(1.1, s * 0.07), 0, Math.PI * 2);
          c.fill();
        }
      }
      n += len;
    });
    c.restore();
  }
  relayout() {
    if (FONT) return this.relayoutFont();
    const seed = this.seedBase ?? (hashString(this.text) % 997) + 1;
    this.layout = layoutText(this.text, { seed, maxWidth: this.maxWidth / this.size });
    // Writing pace follows pen travel: long sentences take longer, short tags stay quick.
    const travel = this.layout.total;
    this.ink.writeSeconds = Math.min(3.2, 0.35 + travel * 0.028);
    this.ink.eraseSeconds = Math.min(0.9, 0.18 + travel * 0.006);
  }
  get boxWidth() {
    return this.layout.width * this.size;
  }
  get boxHeight() {
    return this.layout.height * this.size;
  }
  show(reduced) {
    this.ink.setVisible(true, reduced);
  }
  hide(reduced) {
    this.setVisible(false, reduced);
  }
  /**
   * For owners that restate "visible or not" every frame. While old words are being erased for a
   * pending replacement, the request is remembered and applied after the swap; passing it straight
   * to the ink would cancel the erase and leave the old words on paper.
   */
  setVisible(visible, reduced = false) {
    if (this.pending !== null) {
      this.wantAfterSwap = visible;
      return;
    }
    this.ink.setVisible(visible, reduced);
  }
  /** Replace the words with a visible erase-then-write. */
  set(text, reduced = false) {
    if (text === this.text && !this.pending) return;
    if (this.ink.progress <= 0.001) {
      this.text = text;
      this.relayout();
      return;
    }
    this.pending = text;
    this.wantAfterSwap = null;
    this.ink.setVisible(false, reduced);
    this.reducedSwap = reduced;
  }
  update(dt) {
    this.ink.update(dt);
    if (this.pending !== null && this.ink.progress <= 0) {
      this.text = this.pending;
      this.pending = null;
      this.relayout();
      this.ink.setVisible(this.wantAfterSwap ?? true, this.reducedSwap);
      this.wantAfterSwap = null;
    }
  }
  get writing() {
    return this.ink.active;
  }
  get erasing() {
    return this.ink.active && this.ink.target === 0;
  }
  draw(c, x, y, { progress = 1, alpha = 1, color } = {}) {
    const p = Math.min(progress, this.ink.progress);
    if (FONT) return this.drawFont(c, x, y, p, alpha, color || this.color);
    drawWriting(c, this.layout, {
      x,
      y,
      size: this.size,
      progress: p,
      color: color || this.color,
      align: this.align,
      width: this.width,
      alpha,
    });
  }
}
