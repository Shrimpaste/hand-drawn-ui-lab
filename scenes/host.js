import { PaperMotion } from "../primitives/paper-motion.js";
import { InkTransition } from "../primitives/ink.js";
import { paperTexture } from "../primitives/sketch.js";
import { SceneFoley } from "../primitives/foley.js";
import { Pencil, palette } from "../primitives/living-ink.js";
import { Spring } from "../primitives/motion.js";
import { drawIllustratedControl } from "../primitives/illustrated-control.js";

export class SceneHost {
  constructor(name) {
    this.name = name;
    this.outer = document.querySelector(".world");
    this.surface = document.querySelector(".surface");
    this.canvas = document.querySelector("canvas");
    this.c = this.canvas.getContext("2d");
    this.controls = document.querySelector(".controls");
    this.audio = new SceneFoley({
      enabled: localStorage.getItem("scene-sound") !== "off",
    });
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.motion = new PaperMotion({
      amplitudeX: 0.044,
      amplitudeY: 0.025,
      rotate: 0.0012,
    });
    this.time = 0;
    this.openingDuration = 4.8;
    this.openingTime = this.reduced ? this.openingDuration : 0;
    this.buttons = [];
    this.samples = [];
    this.texture = paperTexture(512, 512, 952);
    this.pointer = null;
    this.inputTime = -Infinity;
    this.intro = new InkTransition({ writeSeconds: 1.1 });
    this.intro.setVisible(true, this.reduced);
    this.soundButton = this.button("scene-sound", "切换场景音效", () => {
      this.audio.setEnabled(!this.audio.enabled);
      localStorage.setItem("scene-sound", this.audio.enabled ? "on" : "off");
      this.soundButton.el.setAttribute(
        "aria-pressed",
        String(this.audio.enabled),
      );
    });
    this.soundButton.el.setAttribute(
      "aria-pressed",
      String(this.audio.enabled),
    );
    this.stillButton = this.button("scene-still", "减少动画与轮廓变化", () => {
      this.reduced = !this.reduced;
      if (this.reduced)
        this.openingTime = Math.max(this.openingTime, this.openingDuration);
      this.intro.setVisible(true, this.reduced);
      this.stillButton.el.setAttribute("aria-pressed", String(this.reduced));
      this.onReduced?.();
    });
    this.stillButton.el.setAttribute("aria-pressed", String(this.reduced));
    this.other = this.button(
      "scene-other",
      name === "gallery" ? "打开绘制小样" : "进入纸上画廊",
      () =>
        (location.href =
          name === "gallery" ? "/scenes/studio.html" : "/demos/gallery.html"),
    );
    this.reference = this.button(
      "scene-reference",
      "打开原站还原参考样本",
      () => (location.href = "/"),
    );
    for (const event of ["pointerdown", "keydown"])
      window.addEventListener(event, () => this.audio.unlock(), {
        capture: true,
      });
    this.replay = this.button("scene-replay", "重新逐笔画出整个场景", () => {
      this.openingTime = this.reduced ? this.openingDuration : 0;
      this.intro.progress = 0;
      this.intro.setVisible(true, this.reduced);
      this.onReplay?.();
    });
    this.outer.addEventListener("pointermove", (e) => {
      this.inputTime = this.time;
      const r = this.outer.getBoundingClientRect();
      this.motion.point(
        e.clientX - r.left,
        e.clientY - r.top,
        r.width,
        r.height,
      );
      this.pointer = this.point(e);
      this.onPointer?.(this.pointer, e);
    });
    this.outer.addEventListener("pointerleave", () => {
      this.pointer = null;
      this.motion.leave();
      this.onLeave?.();
    });
    this.outer.addEventListener("pointerdown", (e) => {
      this.inputTime = this.time;
      if (this.openingDone && !e.target.closest("button"))
        this.onGround?.(this.point(e), e);
    });
    window.addEventListener("keydown", (e) => {
      this.inputTime = this.time;
      if (e.target.closest("button") && ["Enter", " "].includes(e.key)) return;
      if (this.openingDone) this.onKey?.(e);
    });
    window.addEventListener("resize", () => this.resize());
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(this.raf);
      this.last = 0;
      if (!document.hidden) this.start();
    });
    this.resize();
    window.sceneLab = {
      get state() {
        return window.activeScene.debug?.() || {};
      },
      get metrics() {
        const a = window.activeScene.samples,
          s = [...a].sort((a, b) => a - b);
        return {
          frames: a.length,
          mean: a.reduce((x, y) => x + y, 0) / (a.length || 1),
          p95: s[Math.floor(s.length * 0.95)],
        };
      },
    };
    window.activeScene = this;
  }
  resize() {
    this.mobile = innerWidth < 600;
    this.w = this.mobile ? 650 : 1120;
    this.h = this.mobile ? 1080 : 820;
    const available = innerWidth - (this.mobile ? 18 : 24),
      max = this.mobile
        ? available
        : Math.min(
            1440,
            available,
            (Math.max(620, innerHeight - 24) * this.w) / this.h,
          );
    this.scale = Math.min(1.36, max / this.w);
    const width = this.w * this.scale,
      height = this.h * this.scale;
    this.outer.style.width = `${width}px`;
    this.outer.style.height = `${height}px`;
    this.dpr = Math.min(2, devicePixelRatio || 1);
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.place(this.other, this.mobile ? 58 : 65, 35, 68, 56);
    this.place(this.reference, this.mobile ? 157 : 182, 35, 68, 56);
    this.place(this.replay, this.mobile ? 257 : 299, 35, 68, 56);
    this.place(this.soundButton, this.w - 164, 35, 72, 56);
    this.place(this.stillButton, this.w - 62, 35, 72, 56);
    this.layout?.();
  }
  point(e) {
    const r = this.outer.getBoundingClientRect(),
      p = this.motion.fromScreen(e.clientX - r.left, e.clientY - r.top);
    return { x: p.x / this.scale, y: p.y / this.scale };
  }
  button(id, label, action) {
    const el = document.createElement("button");
    el.className = "scene-hit";
    el.id = id;
    el.type = "button";
    el.setAttribute("aria-label", label);
    el.textContent = label;
    this.controls.append(el);
    const b = {
      el,
      hover: false,
      focus: false,
      ink: new InkTransition({ writeSeconds: 0.38, eraseSeconds: 0.24 }),
      response: new Spring(0, { stiffness: 110, damping: 17 }),
    };
    el.onpointerenter = () => (b.hover = true);
    el.onpointerleave = () => (b.hover = false);
    el.onfocus = () => (b.focus = el.matches(":focus-visible"));
    el.onblur = () => (b.focus = false);
    el.onpointerdown = () => (b.focus = false);
    el.onclick = (e) => {
      if (!el.disabled && (this.openingDone || id.startsWith("scene-")))
        action(e);
    };
    this.buttons.push(b);
    return b;
  }
  place(b, x, y, w, h) {
    Object.assign(b, { x, y, w, h });
    Object.assign(b.el.style, {
      left: `${((x - w / 2) / this.w) * 100}%`,
      top: `${((y - h / 2) / this.h) * 100}%`,
      width: `${(w / this.w) * 100}%`,
      height: `${(h / this.h) * 100}%`,
    });
  }
  announce(text) {
    document.querySelector("#announcement").textContent = text;
  }
  nav(c) {
    const common = { time: this.time, reduced: this.reduced, scale: 0.56 };
    for (const [button, type, label, on] of [
      [
        this.other,
        this.name === "gallery" ? "sketch" : "gallery",
        this.name === "gallery" ? "drawing bench" : "gallery",
        true,
      ],
      [this.reference, "reference", "reference", true],
      [this.replay, "replay", "draw again", true],
      [
        this.soundButton,
        "sound",
        this.audio.enabled ? "sound on" : "sound off",
        this.audio.enabled,
      ],
      [
        this.stillButton,
        "alive",
        this.reduced ? "still" : "alive",
        !this.reduced,
      ],
    ])
      drawIllustratedControl(c, button, type, {
        ...common,
        label,
        on,
        labelY: 65,
      });
  }
  start() {
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }
  get openingDone() {
    return this.reduced || this.openingTime >= this.openingDuration;
  }
  drawProgress(seed) {
    if (this.openingDone) return 1;
    const environment =
      seed >= 70000 || seed === 150 || seed === 201 || seed === 2100;
    const creature = seed >= 811 && seed <= 840;
    const delay = environment
      ? 0.05
      : creature
        ? 2.9
        : 1.3 + (Math.abs(seed) % 7) * 0.09;
    const duration = environment ? 2.5 : creature ? 1.3 : 1.8;
    return Math.max(0, Math.min(1, (this.openingTime - delay) / duration));
  }
  frame(t) {
    const dt = Math.min(0.04, this.last ? (t - this.last) / 1000 : 1 / 60);
    this.last = t;
    this.time += dt;
    this.openingTime += dt;
    const started = performance.now();
    this.intro.update(dt);
    this.motion.update(dt, {
      width: this.w * this.scale,
      height: this.h * this.scale,
      unit: 110,
      reduced: this.reduced,
    });
    this.surface.style.transform = this.motion.cssTransform;
    let writing = false,
      erasing = false;
    for (const b of this.buttons) {
      b.ink.setVisible(
        !b.el.disabled && !b.el.hidden && (b.hover || b.focus),
        this.reduced,
      );
      b.ink.update(dt);
      b.response.target =
        !b.el.disabled && !b.el.hidden && (b.hover || b.focus) ? 1 : 0;
      b.response.update(dt, this.reduced);
      if (b.ink.progress > 0 && b.ink.progress < 1) {
        writing = true;
        erasing ||= !b.ink.target;
      }
    }
    this.update?.(dt);
    const c = this.c;
    c.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale, 0, 0);
    c.clearRect(0, 0, this.w, this.h);
    c.fillStyle = c.createPattern(this.texture, "repeat");
    c.fillRect(0, 0, this.w, this.h);
    c.sceneDrawing = (seed) => this.drawProgress(seed);
    this.draw?.(c);
    this.nav(c);
    // Keyboard focus is a drawn pen mark in this world, not a DOM rectangle.
    for (const b of this.buttons)
      if (b.focus && !b.el.disabled && !b.el.hidden) {
        const p = new Pencil(c, 0);
        p.line(
          [
            [b.x - b.w * 0.37, b.y + b.h * 0.4],
            [b.x, b.y + b.h * 0.4 + 1],
            [b.x + b.w * 0.37, b.y + b.h * 0.4],
          ],
          { width: 1.5, color: palette.red, progress: b.ink.progress },
        );
      }
    this.audio.handwriting(
      writing || this.isWriting?.(),
      erasing || this.isErasing?.(),
      dt,
    );
    this.samples.push(performance.now() - started);
    if (this.samples.length > 180) this.samples.shift();
    this.raf = requestAnimationFrame((x) => this.frame(x));
  }
}
