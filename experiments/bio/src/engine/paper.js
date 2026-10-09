import { rng } from "./rng.js";
import { P } from "./palette.js";

/** Tileable warm paper: fibres, tooth and faint blotches. Generated once. */
export function paperTexture(size = 512, seed = 913) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const c = cv.getContext("2d"),
    r = rng(seed);
  c.fillStyle = P.paper;
  c.fillRect(0, 0, size, size);
  for (let i = 0; i < 26; i++) {
    const x = r() * size,
      y = r() * size,
      rad = 30 + r() * 90;
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    const dark = r() > 0.5;
    g.addColorStop(0, dark ? "rgba(150,120,80,.035)" : "rgba(255,252,240,.07)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    for (const dx of [-size, 0, size])
      for (const dy of [-size, 0, size]) {
        c.save();
        c.translate(dx, dy);
        c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        c.restore();
      }
  }
  for (let i = 0; i < (size * size) / 7; i++) {
    c.fillStyle = r() > 0.55 ? "rgba(92,70,44,.035)" : "rgba(255,255,250,.16)";
    c.fillRect(r() * size, r() * size, 0.4 + r() * 1.1, 0.4 + r() * 1.2);
  }
  c.lineCap = "round";
  for (let i = 0; i < 160; i++) {
    const x = r() * size,
      y = r() * size,
      a = r() * Math.PI,
      l = 4 + r() * 14;
    c.strokeStyle = r() > 0.5 ? "rgba(120,96,64,.06)" : "rgba(255,255,248,.22)";
    c.lineWidth = 0.4 + r() * 0.5;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    c.stroke();
  }
  return cv;
}
