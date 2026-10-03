import { smooth } from "../primitives/motion.js";
import { benchPath, insideBench } from "./bench-path.js";
export class GalleryWalk {
  constructor(x = 560, y = 676) {
    this.x = x;
    this.y = y;
    this.target = { x, y };
    this.mode = "idle";
    this.selected = -1;
    this.distance = 0;
    this.steps = 0;
    this.look = 0;
    this.pending = -1;
    this.delay = 0;
    this.speed = 0;
    this.vx = 0;
    this.vy = 0;
    this.stride = 23;
    this.route = [];
    this.seatAmount = 0;
    this.seatAge = 0;
  }
  configureBench(geometry) {
    this.bench = geometry;
  }
  walkTo(x, y, { art = -1, sit = false } = {}) {
    if (
      this.bench &&
      ["mounting", "sitting", "dismounting"].includes(this.mode)
    ) {
      this.queuedWalk = { x, y, art, sit };
      if (this.mode !== "dismounting") {
        this.seatFrom = this.seatAmount;
        this.seatAge = 0;
        this.mode = "dismounting";
      }
      return;
    }
    if (this.bench && insideBench({ x, y }, this.bench.obstacle)) {
      ({ x, y } = this.bench.approach);
      sit = true;
    }
    this.route = this.bench
      ? benchPath({ x: this.x, y: this.y }, { x, y }, this.bench.obstacle)
      : [{ x, y }];
    this.target = this.route.shift();
    this.pending = art;
    this.selected = -1;
    this.sit = sit;
    this.mode = "walking";
    this.delay = this.speed > 5 ? 0 : 0.09;
  }
  update(dt, reduced = false) {
    if (this.mode === "mounting" || this.mode === "dismounting") {
      this.seatAge += dt;
      const u = Math.min(1, this.seatAge / (reduced ? 0.14 : 0.74));
      this.seatAmount =
        this.mode === "mounting" ? smooth(u) : this.seatFrom * (1 - smooth(u));
      this.speed = 0;
      if (u >= 1) {
        if (this.mode === "mounting") {
          this.mode = "sitting";
          return [{ name: "sit" }];
        }
        this.mode = "idle";
        this.seatAmount = 0;
        const next = this.queuedWalk;
        this.queuedWalk = null;
        if (next) this.walkTo(next.x, next.y, next);
        return [{ name: "stand" }];
      }
      return [];
    }
    if (this.mode !== "walking") {
      this.speed *= Math.exp(-dt * 14);
      return [];
    }
    if (this.delay > 0) {
      this.delay -= dt;
      return [];
    }
    const dx = this.target.x - this.x,
      dy = this.target.y - this.y,
      d = Math.hypot(dx, dy);
    const desired = Math.min(156, Math.sqrt(d * 550));
    this.speed += (desired - this.speed) * (1 - Math.exp(-dt * 10));
    const step = reduced ? d : Math.min(d, this.speed * dt);
    if (d) {
      this.x += (dx / d) * step;
      this.y += (dy / d) * step;
      this.look = dx / d;
      this.vx = (dx / d) * this.speed;
      this.vy = (dy / d) * this.speed;
    }
    const before = Math.floor(this.distance / this.stride);
    this.distance += step;
    const after = Math.floor(this.distance / this.stride),
      events = [];
    for (let n = before; n < after; n++) {
      this.steps++;
      if (!reduced)
        events.push({
          name: "footstep",
          x: this.x,
          y: this.y,
          side: n % 2 ? 1 : -1,
        });
    }
    if (d - step < 0.7) {
      this.x = this.target.x;
      this.y = this.target.y;
      if (this.route.length) {
        this.target = this.route.shift();
        return events;
      }
      this.speed = 0;
      this.vx = 0;
      this.vy = 0;
      if (this.pending >= 0) {
        this.selected = this.pending;
        this.pending = -1;
        this.mode = "looking";
        this.look = 0;
        events.push({ name: "arrive", art: this.selected });
      } else {
        this.mode = this.sit ? (this.bench ? "mounting" : "sitting") : "idle";
        this.seatAge = 0;
        this.seatAmount = this.sit && !this.bench ? 1 : 0;
      }
    }
    return events;
  }
  close() {
    this.selected = -1;
    this.mode = "idle";
    this.pending = -1;
    this.sit = false;
    this.speed = this.vx = this.vy = 0;
    this.route = [];
    this.queuedWalk = null;
    this.seatAmount = 0;
  }
  get drawingPose() {
    const q = this.seatAmount;
    if (
      !this.bench ||
      !["mounting", "sitting", "dismounting"].includes(this.mode)
    )
      return { x: this.x, y: this.y, seated: 0, hop: 0, squash: 0 };
    const a = this.bench.approach,
      b = this.bench.perch;
    const arc =
      this.mode === "sitting"
        ? 0
        : Math.sin(Math.PI * Math.min(1, this.seatAge / 0.74));
    return {
      x: a.x + (b.x - a.x) * q,
      y: a.y + (b.y - a.y) * q,
      seated: q,
      hop: arc * 29,
      squash: arc * 0.12,
    };
  }
}
