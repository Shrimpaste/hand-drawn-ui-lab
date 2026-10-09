import { InkSprite } from "./sprite.js";
import { HandLabel } from "./label.js";
import { P } from "./palette.js";
import { rng } from "./rng.js";
import { Spring } from "./motion.js";

const sheets = new Map();
/** A taped sheet of paper with a soft drop shadow, slight torn edge and margin rule. */
function sheet(w, h, seed, ruled = true) {
  const key = `${w}x${h}|${seed}|${ruled}`;
  if (sheets.has(key)) return sheets.get(key);
  const s = new InkSprite(w + 30, h + 30, (p, c) => {
    const r = rng(seed);
    const edgePts = [];
    const n = 26;
    const corner = (x, y) => [x + (r() - 0.5) * 2, y + (r() - 0.5) * 2];
    for (let i = 0; i <= n; i++) edgePts.push(corner(-w / 2 + (w * i) / n, -h / 2 + Math.sin(i * 1.3) * 0.8));
    for (let i = 1; i <= n; i++) edgePts.push(corner(w / 2 + Math.sin(i) * 0.8, -h / 2 + (h * i) / n));
    for (let i = 1; i <= n; i++) edgePts.push(corner(w / 2 - (w * i) / n, h / 2 + Math.sin(i * 0.7) * 1.1));
    for (let i = 1; i < n; i++) edgePts.push(corner(-w / 2 + Math.sin(i * 1.7) * 0.8, h / 2 - (h * i) / n));
    c.save();
    c.shadowColor = "rgba(70,52,30,.16)";
    c.shadowBlur = 14;
    c.shadowOffsetY = 5;
    c.fillStyle = "#f8f3e7";
    c.beginPath();
    edgePts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
    c.restore();
    p.fillPath([...edgePts, edgePts[0]], null, { width: 0.9, outline: "#c8b997", boil: 0.25 });
    // Faint ruling, like a lab notebook page.
    if (ruled) for (let y = -h / 2 + 92; y < h / 2 - 20; y += 29)
      p.line([[-w / 2 + 16, y], [w / 2 - 16, y + 0.6]], { color: "#cfd6d2", width: 0.7, straight: true, taper: false, boil: 0.15 });
    p.line([[-w / 2 + 40, -h / 2 + 8], [-w / 2 + 41, h / 2 - 8]], { color: "#e2b5a6", width: 0.8, straight: true, taper: false, boil: 0.15 });
    // Tape strips at the top corners.
    for (const [tx, a] of [[-w / 2 + 34, -0.32], [w / 2 - 34, 0.28]]) {
      c.save();
      c.translate(tx, -h / 2 + 2);
      c.rotate(a);
      p.shape([[-30, -11], [30, -10], [29, 10], [-31, 9]], "#e2cf9e", { angular: true, base: 0.35, density: 0.6, shade: 0, width: 0.7, outline: "#c4ad79", angle: 1.2 });
      c.restore();
    }
  }, { variants: 1, seed });
  sheets.set(key, s);
  return s;
}

/** Split HTML into per-character spans so the body can ink in and erase in reading order. */
function inkHTML(html) {
  const t = document.createElement("template");
  t.innerHTML = html;
  let i = 0;
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const ch of child.textContent) {
          const s = document.createElement("span");
          s.className = "ch";
          s.textContent = ch;
          s.style.setProperty("--i", String(i++));
          frag.append(s);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    }
  };
  walk(t.content);
  return { fragment: t.content, count: i };
}

export class NotePanel {
  /**
   * compact: start folded (heading and a free zone for the host to write a short sentence in);
   * the full lecture text opens with setExpanded(true). domRules: the ruling belongs to the DOM
   * text, so the lines scroll with it.
   */
  constructor(host, { x, y, w, h, seed = 21, compact = false, domRules = false }) {
    Object.assign(this, { host, x, y, w, h, seed });
    this.expanded = !compact;
    this.domRules = domRules;
    this.sprite = sheet(w, h, seed, !domRules);
    const sizes = compact ? [16, 29, 21] : [15, 27, 19];
    this.kicker = new HandLabel(" ", { size: sizes[0], color: P.soft, maxWidth: w - 80 });
    this.title = new HandLabel(" ", { size: sizes[1], color: P.inkDeep, maxWidth: w - 76, width: 0.07 });
    this.key = new HandLabel(" ", { size: sizes[2], color: P.red, maxWidth: w - 80, width: 0.068 });
    this.el = document.createElement("div");
    this.el.className = "note";
    this.body = document.createElement("div");
    this.body.className = "note-body" + (domRules ? " ruled" : "") + (this.expanded ? "" : " folded");
    this.el.append(this.body);
    this.content = null;
    this.timer = 0;
    this.visible = false;
    this.lift = new Spring(0, { stiffness: 150, damping: 9 });
    this.zone = { x: x - w / 2 + 50, y: y - h / 2 + 200, w: w - 100, bottom: y + h / 2 - 76 };
    this.layoutDom();
  }
  /** Fold to the heading or open the full lecture text; the paper lifts a little as it turns. */
  setExpanded(flag, reduced = false) {
    if (flag === this.expanded) return;
    this.expanded = flag;
    this.body.classList.toggle("folded", !flag);
    this.lift.kick(reduced ? 0 : 5);
    if (!this.visible) return;
    if (flag) {
      this.body.scrollTop = 0;
      this.inkIn();
    } else this.eraseBody(reduced);
  }
  layoutDom() {
    Object.assign(this.el.style, { left: `${this.x - this.w / 2 + 44}px`, top: `${this.y - this.h / 2}px`, width: `${this.w - 64}px`, height: `${this.h}px` });
  }
  attach(layer) {
    layer.append(this.el);
  }
  dispose() {
    clearTimeout(this.timer);
    this.el.remove();
  }
  /** Erase the old words (canvas + DOM), then write the new page. */
  setContent(content, reduced = false) {
    this.content = content;
    const apply = () => {
      this.kicker.set(content.kicker || " ", reduced);
      this.title.set(content.title || " ", reduced);
      this.key.set(content.key || " ", reduced);
      this.writeBody(content.body || [], reduced);
    };
    if (!this.visible) {
      apply();
      return;
    }
    this.eraseBody(reduced);
    this.kicker.set(content.kicker || " ", reduced);
    this.title.set(content.title || " ", reduced);
    this.key.set(content.key || " ", reduced);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.writeBody(content.body || [], reduced), reduced ? 30 : 380);
  }
  writeBody(paras, reduced) {
    const html = paras.map((p) => (p.startsWith("<") ? p : `<p>${p}</p>`)).join("");
    const { fragment, count } = inkHTML(html);
    this.body.replaceChildren(fragment);
    this.body.scrollTop = 0;
    this.body.style.setProperty("--step", reduced ? "0ms" : `${Math.min(9, 1700 / Math.max(1, count))}ms`);
    this.count = count;
    if (this.visible && this.expanded) this.inkIn();
  }
  inkIn() {
    requestAnimationFrame(() => this.body.classList.add("on"));
    this.body.classList.remove("off");
  }
  eraseBody(reduced) {
    this.body.style.setProperty("--n", String(this.count || 0));
    this.body.style.setProperty("--estep", reduced ? "0ms" : `${Math.min(2.2, 340 / Math.max(1, this.count || 1))}ms`);
    this.body.classList.add("off");
    this.body.classList.remove("on");
  }
  show(reduced) {
    this.visible = true;
    this.body.style.pointerEvents = "";
    this.body.removeAttribute("aria-hidden");
    for (const l of [this.kicker, this.title, this.key]) l.show(reduced);
    if (this.expanded) this.inkIn();
  }
  hide(reduced) {
    this.visible = false;
    // A hidden page must not catch clicks meant for the scene underneath.
    this.body.style.pointerEvents = "none";
    this.body.setAttribute("aria-hidden", "true");
    for (const l of [this.kicker, this.title, this.key]) l.hide(reduced);
    this.eraseBody(reduced);
  }
  update(dt) {
    for (const l of [this.kicker, this.title, this.key]) l.update(dt);
    this.lift.update(dt);
  }
  get writing() {
    return [this.kicker, this.title, this.key].some((l) => l.writing);
  }
  get erasing() {
    return [this.kicker, this.title, this.key].some((l) => l.erasing);
  }
  draw(c, { progress = 1, labelProgress = 1, shift = { x: 0, y: 0 } }) {
    const lift = -this.lift.value;
    shift = { x: shift.x, y: shift.y + lift };
    this.sprite.draw(c, this.x + shift.x, this.y + shift.y, { progress, frame: 0 });
    const left = this.x - this.w / 2 + 50 + shift.x;
    let y = this.y - this.h / 2 + 26 + shift.y;
    this.kicker.draw(c, left, y, { progress: labelProgress });
    y += 22;
    this.title.draw(c, left, y, { progress: labelProgress });
    y += this.title.boxHeight + 6;
    this.key.draw(c, left, y, { progress: labelProgress });
    y += this.key.boxHeight + 10;
    // DOM body starts under the handwritten head; shares the parallax shift.
    const top = y - (this.y - this.h / 2 + shift.y);
    this.zone = { x: left, y, w: this.w - 100, bottom: this.y + this.h / 2 + shift.y - 76 };
    if (top !== this.bodyTop) {
      this.bodyTop = top;
      this.body.style.marginTop = `${top}px`;
      this.body.style.height = `${this.h - top - (this.domRules ? 78 : 22)}px`;
    }
    this.el.style.transform = `translate(${shift.x}px, ${shift.y}px)`;
  }
}
