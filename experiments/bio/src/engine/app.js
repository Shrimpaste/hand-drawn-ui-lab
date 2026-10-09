import { Camera } from "./camera.js";
import { Control } from "./controls.js";
import { Foley } from "./foley.js";
import { paperTexture } from "./paper.js";
import { setQuality } from "./sprite.js";
import { easeInOut, clamp } from "./geom.js";
import { FrameGovernor } from "./perf.js";

// canvas pixel-ratio ceiling per render tier: raster cost grows with the pixel count

const DPR_CAP = [2.5, 1.75, 1.25];

export const W = 1280,
  H = 800;

/**
 * Owns the stage, loop and transitions. Scenes draw into one canvas; semantic buttons and
 * readable text live in DOM layers that share the stage scale and the camera zoom.
 */
export class App {
  constructor(root) {
    this.root = root;
    this.time = 0;
    this.scenes = new Map();
    this.current = null;
    this.busy = false;
    this.reduced = localStorage.getItem("fbp1-still") ? localStorage.getItem("fbp1-still") === "1" : matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.foley = new Foley({ enabled: localStorage.getItem("fbp1-sound") !== "off" });
    this.camera = new Camera({ width: W, height: H, amountX: 34, amountY: 16 });
    this.zoom = { s: 1, from: 1, to: 1, cx: W / 2, cy: H / 2, t: 1, dur: 1 };
    this.tier = 0;
    this.governor = new FrameGovernor();
    this.governing = false;
    root.innerHTML = `
      <div class="viewport"><div class="stage">
        <canvas class="art" aria-hidden="true"></canvas>
        <div class="layer notes-layer"></div>
        <div class="layer hits-layer" role="group" aria-label="展厅操作"></div>
        <div class="layer nav-layer" role="navigation" aria-label="全局"></div>
      </div></div>
      <p class="sr-only" id="live" aria-live="polite"></p>
      <p class="rotate-hint">横屏或更宽的窗口可获得完整体验</p>`;
    this.stage = root.querySelector(".stage");
    this.canvas = root.querySelector("canvas");
    this.c = this.canvas.getContext("2d");
    this.hits = root.querySelector(".hits-layer");
    this.notesLayer = root.querySelector(".notes-layer");
    this.navLayer = root.querySelector(".nav-layer");
    this.live = root.querySelector("#live");
    this.texture = paperTexture(512, 913);
    setQuality(Math.min(3, Math.max(1.5, ((screen.width || 1440) * (devicePixelRatio || 1)) / W)));
    this.buildNav();
    this.bind();
    this.resize();
  }
  buildNav() {
    const host = { app: this, get interactive() { return true; } };
    this.referenceLink = new Control(host, {
      id: "nav-reference", label: "返回 Reference", hint: "Reference",
      href: "../../index.html", mark: "prev", x: W - 336, y: 44, w: 112, h: 80,
      labelAt: "below", labelSize: 17, labelOffset: [0, -18], always: true,
    });
    this.homeBtn = new Control(host, { id: "nav-home", label: "返回肝小叶大厅", hint: "回到大厅", mark: "home", x: 54, y: 44, labelAt: "below", onClick: () => this.go("hall") });
    this.soundBtn = new Control(host, {
      id: "nav-sound",
      label: "切换声音",
      hint: this.foley.enabled ? "声音开" : "声音关",
      mark: "sound",
      x: W - 132,
      y: 44,
      isOn: () => this.foley.enabled,
      onClick: () => {
        this.foley.setEnabled(!this.foley.enabled);
        localStorage.setItem("fbp1-sound", this.foley.enabled ? "on" : "off");
        this.soundBtn.setHint(this.foley.enabled ? "声音开" : "声音关", this.reduced);
      },
    });
    this.stillBtn = new Control(host, {
      id: "nav-still",
      label: "减少动画",
      hint: this.reduced ? "静止" : "灵动",
      mark: "still",
      x: W - 56,
      y: 44,
      isOn: () => !this.reduced,
      isPressed: () => this.reduced,
      onClick: () => {
        this.reduced = !this.reduced;
        localStorage.setItem("fbp1-still", this.reduced ? "1" : "0");
        this.stillBtn.setHint(this.reduced ? "静止" : "灵动", this.reduced);
      },
    });
    this.replayBtn = new Control(host, {
      id: "nav-replay",
      label: "把这一页重新画一遍",
      hint: "重画",
      mark: "replay",
      x: W - 208,
      y: 44,
      onClick: () => this.replay(),
    });
    this.nav = [this.referenceLink, this.homeBtn, this.replayBtn, this.soundBtn, this.stillBtn];
    for (const n of this.nav) n.attach(this.navLayer);
  }
  bind() {
    addEventListener("resize", () => this.resize());
    const toLocal = (e) => {
      const r = this.stage.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    this.stage.addEventListener("pointermove", (e) => {
      const p = toLocal(e);
      this.camera.point(p.x / W * 2 - 1, p.y / H * 2 - 1);
      const z = this.zoom;
      this.current?.pointer?.((p.x - z.cx) / z.s + z.cx, (p.y - z.cy) / z.s + z.cy, e.buttons, !!e.target.closest?.("button, a"));
    });
    addEventListener("pointerup", () => this.current?.release?.());
    addEventListener("pointercancel", () => this.current?.release?.());
    this.stage.addEventListener("pointerleave", () => {
      this.camera.leave();
      this.current?.pointer?.(null, null);
    });
    this.stage.addEventListener("pointerdown", (e) => {
      this.foley.unlock();
      if (e.target.closest("button, a") || !this.current?.interactive) return;
      const p = toLocal(e),
        z = this.zoom;
      this.current.click?.((p.x - z.cx) / z.s + z.cx, (p.y - z.cy) / z.s + z.cy);
    });
    addEventListener("keydown", (e) => {
      this.foley.unlock();
      // a scene may use Escape itself (closing a close-up) before it means "back to the hall"
      if (e.key === "Escape" && this.current?.id !== "hall") {
        if (!this.current?.escape?.()) this.go("hall");
      } else this.current?.key?.(e);
    });
    addEventListener("hashchange", () => {
      const id = location.hash.replace(/^#\/?/, "") || "hall";
      if (id !== this.current?.id && this.scenes.has(id)) this.go(id, { fromHash: true });
    });
    // a pointer that left without a pointerleave (window blur, tab switch, devtools) must not keep hovering
    const lost = () => {
      this.camera.leave();
      this.current?.pointer?.(null, null);
    };
    addEventListener("blur", lost);
    document.documentElement.addEventListener("mouseleave", lost);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) lost();
      this.last = 0;
    });
  }
  resize() {
    const vw = innerWidth,
      vh = innerHeight;
    this.scale = Math.min(vw / W, vh / H);
    const cw = Math.round(W * this.scale),
      ch = Math.round(H * this.scale);
    this.stage.style.width = `${cw}px`;
    this.stage.style.height = `${ch}px`;
    this.stage.style.setProperty("--k", String(this.scale));
    this.dpr = Math.min(DPR_CAP[this.tier], devicePixelRatio || 1);
    this.canvas.width = Math.round(cw * this.dpr);
    this.canvas.height = Math.round(ch * this.dpr);
    this.root.classList.toggle("portrait", vw < 700 && vh > vw);
  }
  /** Apply a render tier: lower pixel ratio, and let the current scene simplify its drawing. */
  setTier(tier) {
    if (tier === this.tier) return;
    this.tier = tier;
    this.resize();
    this.governor.reset();
    this.current?.setTier?.(tier);
  }
  register(id, factory) {
    this.scenes.set(id, { factory, scene: null });
  }
  scene(id) {
    const entry = this.scenes.get(id);
    entry.scene ||= entry.factory(this);
    return entry.scene;
  }
  announce(text) {
    this.live.textContent = text;
  }
  setZoom(to, cx, cy, dur) {
    Object.assign(this.zoom, { from: this.zoom.s, to, cx: cx ?? this.zoom.cx, cy: cy ?? this.zoom.cy, t: 0, dur: Math.max(0.01, dur) });
  }
  /**
   * Draw the scene through the states it will be used in, before anyone is watching: this primes
   * fonts, caches, JIT and texture uploads, and measures how fast this machine really draws so the
   * render tier can be chosen up front. Frames use a fixed step so every machine sees the same motion.
   */
  async warm(s, onProgress = () => {}) {
    const plan = s.warmPlan?.() || [];
    const total = plan.reduce((n, p) => n + p.frames, 0);
    if (!total) return;
    const samples = [];
    let done = 0,
      last = 0;
    this.current = s;
    s.warming = true;
    s.reveal.show();
    for (const item of plan) {
      item.enter();
      for (let i = 0; i < item.frames; i++) {
        const now = await new Promise((r) => requestAnimationFrame(r));
        if (item.measure && last && i > 1) samples.push(now - last);
        last = now;
        item.each?.(i);
        this.tick(0.05);
        onProgress(++done / total, item.label);
      }
    }
    s.warming = false;
    s.afterWarm?.();
    s.reveal.phase = "hidden";
    s.reveal.t = 0;
    this.last = 0;
    this.setTier(this.governor.tierFor(samples));
    this.warmSamples = samples;
  }
  async start(id, { onPrepare, onWarm } = {}) {
    const s = this.scene(id);
    await s.prepare(onPrepare);
    this.current = s;
    s.enter();
    const warmed = !!s.warmPlan && !this.reduced;
    this.root.classList.add("ready");
    if (warmed) {
      await this.warm(s, onWarm);
      s.onEnter?.();
    }
    this.governing = true;
    this.homeBtn.el.hidden = id === "hall" || !this.scenes.has("hall");
    s.reveal.draw(this.reduced);
    this.setZoom(1, W / 2, H / 2, 0.01);
    this.raf = requestAnimationFrame((t) => this.frame(t));
    setTimeout(() => (s.interactive = true), this.reduced ? 100 : 1400);
  }
  /** Erase the current page (optionally diving toward a door), then draw the next one. */
  async go(id, { focus, fromHash = false } = {}) {
    if (this.busy || !this.scenes.has(id) || this.current?.id === id) return;
    this.busy = true;
    const from = this.current,
      to = this.scene(id);
    from.interactive = false;
    if (from.beforeExit) await from.beforeExit(id);
    this.foley.play("paper", { strength: 0.8 });
    const dive = focus || from.exitFocus?.(id);
    if (dive && !this.reduced) this.setZoom(1.35, dive.x, dive.y, 0.95);
    from.reveal.erase(this.reduced);
    const preparing = to.prepare();
    while (!from.reveal.done) await new Promise((r) => requestAnimationFrame(r));
    await preparing;
    from.leave();
    this.current = to;
    if (!fromHash) history.pushState(null, "", id === "hall" ? "#/" : `#/${id}`);
    this.homeBtn.el.hidden = id === "hall";
    const back = from.id !== "hall" && id === "hall" ? to.doorPoint?.(from.id) : null;
    if (!this.reduced) {
      this.zoom.s = back ? 1.3 : 0.92;
      if (back) Object.assign(this.zoom, { cx: back.x, cy: back.y });
      this.setZoom(1, this.zoom.cx, this.zoom.cy, 1.3);
    } else this.setZoom(1, W / 2, H / 2, 0.01);
    to.enter(from.id);
    to.reveal.draw(this.reduced);
    this.foley.play("paper", { strength: 0.5 });
    this.announce(to.title || "");
    setTimeout(() => {
      to.interactive = true;
      this.busy = false;
    }, this.reduced ? 120 : 1100);
  }
  replay() {
    if (this.busy || !this.current) return;
    this.busy = true;
    const s = this.current;
    s.interactive = false;
    s.reveal.erase(this.reduced);
    const wait = () => {
      if (!s.reveal.done) return requestAnimationFrame(wait);
      s.onReplay?.();
      s.reveal.draw(this.reduced);
      setTimeout(() => {
        s.interactive = true;
        this.busy = false;
      }, this.reduced ? 100 : 1200);
    };
    wait();
  }
  frame(t) {
    if (this.governing && this.last && !document.hidden) {
      const tier = this.governor.push(t - this.last);
      if (tier !== this.tier) this.setTier(tier);
    }
    const dt = clamp(this.last ? (t - this.last) / 1000 : 1 / 60, 0, 0.05);
    this.last = t;
    this.tick(dt);
    this.raf = requestAnimationFrame((x) => this.frame(x));
  }
  /** Advance and draw one frame of the current scene. */
  tick(dt) {
    this.time += dt;
    const s = this.current,
      z = this.zoom;
    z.t = Math.min(1, z.t + dt / z.dur);
    z.s = z.from + (z.to - z.from) * easeInOut(z.t);
    this.camera.update(dt, this.reduced);
    s.reveal.update(dt);
    s.update(dt);
    for (const n of this.nav) n.update(dt, this.reduced, null);

    const c = this.c,
      k = this.scale * this.dpr;
    c.setTransform(k, 0, 0, k, 0, 0);
    c.fillStyle = c.createPattern(this.texture, "repeat");
    c.fillRect(0, 0, W, H);
    c.save();
    c.translate(z.cx, z.cy);
    c.scale(z.s, z.s);
    c.translate(-z.cx, -z.cy);
    s.draw(c);
    c.restore();
    const zt = `translate(${z.cx}px, ${z.cy}px) scale(${z.s}) translate(${-z.cx}px, ${-z.cy}px)`;
    if (zt !== this.lastZoomCss) {
      this.hits.style.transform = this.notesLayer.style.transform = zt;
      this.lastZoomCss = zt;
    }
    const ui = s.reveal.progress("ui");
    for (const n of this.nav) if (!n.el.hidden) n.draw(c, { time: this.time, reduced: this.reduced, progress: ui });
    const writing = s.writing || this.nav.some((n) => n.label.writing);
    const erasing = s.erasing || this.nav.some((n) => n.label.erasing);
    this.foley.writing(writing, erasing, dt);
  }
}
