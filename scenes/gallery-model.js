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
  }
  walkTo(x, y, { art = -1, sit = false } = {}) {
    this.target = { x, y };
    this.pending = art;
    this.selected = -1;
    this.sit = sit;
    this.mode = "walking";
    this.delay = this.speed > 5 ? 0 : 0.09;
  }
  update(dt, reduced = false) {
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
      this.speed = 0;
      this.vx = 0;
      this.vy = 0;
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
    this.speed = this.vx = this.vy = 0;
  }
}
