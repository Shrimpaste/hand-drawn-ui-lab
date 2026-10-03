/** Small, lagged paper motion. Input and rendering use the same affine transform. */
export class PaperMotion {
  constructor({ tau = .35, amplitudeX = .07, amplitudeY = .045, rotate = .0018 } = {}) {
    Object.assign(this, { tau, amplitudeX, amplitudeY, rotate });
    this.x = this.y = this.tx = this.ty = 0;
    this.matrix = [1, 0, 0, 1, 0, 0];
  }
  point(x, y, width, height) {
    this.tx = Math.max(-1, Math.min(1, x / width * 2 - 1));
    this.ty = Math.max(-1, Math.min(1, y / height * 2 - 1));
  }
  leave() { this.tx = this.ty = 0; }
  update(dt, { width, height, unit = 60, reduced = false }) {
    const k = 1 - Math.exp(-Math.max(0, dt) / this.tau);
    this.x += ((reduced ? 0 : this.tx) - this.x) * k;
    this.y += ((reduced ? 0 : this.ty) - this.y) * k;
    const angle = this.x * this.rotate, c = Math.cos(angle), s = Math.sin(angle);
    const dx = -this.x * this.amplitudeX * unit, dy = -this.y * this.amplitudeY * unit;
    this.matrix = [c, s, -s, c, width / 2 + dx - c * width / 2 + s * height / 2,
      height / 2 + dy - s * width / 2 - c * height / 2];
    return this.matrix;
  }
  toScreen(x, y) {
    const [a, b, c, d, e, f] = this.matrix;
    return { x: a * x + c * y + e, y: b * x + d * y + f };
  }
  fromScreen(x, y) {
    const [a, b, c, d, e, f] = this.matrix, determinant = a * d - b * c;
    return { x: (d * (x - e) - c * (y - f)) / determinant,
      y: (-b * (x - e) + a * (y - f)) / determinant };
  }
  get cssTransform() { return `matrix(${this.matrix.join(',')})`; }
}
