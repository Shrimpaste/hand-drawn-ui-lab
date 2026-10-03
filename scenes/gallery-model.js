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
  }
  walkTo(x, y, { art = -1, sit = false } = {}) {
    this.target = { x, y };
    this.pending = art;
    this.selected = -1;
    this.sit = sit;
    this.mode = "walking";
    this.delay = 0.09;
    this.distance = 0;
  }
  update(dt, reduced = false) {
    if (this.mode !== "walking") return [];
    if (this.delay > 0) {
      this.delay -= dt;
      return [];
    }
    const dx = this.target.x - this.x,
      dy = this.target.y - this.y,
      d = Math.hypot(dx, dy);
    const step = reduced ? d : Math.min(d, Math.min(205, 45 + d * 2.2) * dt);
    if (d) {
      this.x += (dx / d) * step;
      this.y += (dy / d) * step;
      this.look = dx / d;
    }
    const before = Math.floor(this.distance / 25);
    this.distance += step;
    const after = Math.floor(this.distance / 25),
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
      if (this.pending >= 0) {
        this.selected = this.pending;
        this.pending = -1;
        this.mode = "looking";
        this.look = 0;
        events.push({ name: "arrive", art: this.selected });
      } else this.mode = this.sit ? "sitting" : "idle";
    }
    return events;
  }
  close() {
    this.selected = -1;
    this.mode = "idle";
    this.pending = -1;
    this.sit = false;
  }
}
