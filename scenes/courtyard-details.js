import {
  InkSprite,
  Pencil,
  curve,
  palette as C,
} from "../primitives/living-ink.js";
import { courtyardPigments as M } from "../primitives/pigments.js";
import { smooth } from "../primitives/motion.js";
import { courtyardProps as L } from "./courtyard-layout.js";

export const pond = new InkSprite(
  186,
  83,
  (p) => {
    p.oval(0, 3, 81, 28, M.stone, { seed: 70601, width: 0.8, base: 0.24 });
    p.oval(0, -3, 74, 24, M.water, {
      seed: 70602,
      width: 0.7,
      angle: 0.05,
      base: 0.24,
    });
    for (let i = 0; i < 7; i++)
      p.line(
        [
          [-56 + i * 16, -4 + (i % 2) * 6],
          [-42 + i * 16, -2 + (i % 2) * 6],
        ],
        { color: M.waterLight, width: 0.65 },
      );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      p.oval(Math.cos(a) * 77, Math.sin(a) * 25, 5.5, 2.8, "#dfd3b8", {
        seed: 70620 + i,
        width: 0.4,
      });
    }
    p.oval(30, -8, 12, 4.4, M.lily, { seed: 70604, width: 0.5 });
    p.line(
      [
        [30, -8],
        [37, -11],
      ],
      { color: M.leafLight, width: 0.45 },
    );
    for (let i = -1; i <= 1; i++)
      p.oval(30 + i * 4, -13, 3.5, 4.6, M.flower, {
        seed: 70610 + i,
        angle: i * 0.3,
        width: 0.4,
      });
    p.dot(30, -13, 1.2, "#dfc18f");
  },
  { pivot: [93, 45], seed: 70600, variants: 1 },
);

const fish = new InkSprite(
  53,
  36,
  (p) => {
    p.shape(
      [
        [-8, 1],
        [-21, -8],
        [-17, 4],
        [-22, 12],
        [-8, 6],
      ],
      M.fish,
      { seed: 76102, width: 0.4, base: 0.23 },
    );
    p.oval(3, 0, 13, 7, M.fish, { seed: 76103, width: 0.5, base: 0.35 });
    p.oval(10, 1, 5, 4, M.woodLight, { seed: 76104, width: 0.35 });
    p.dot(11, -2, 1.2, "#9b8875");
    p.line(
      [
        [6, -5],
        [5, 0],
        [7, 4],
      ],
      { color: "#b89570", width: 0.45 },
    );
    p.line(
      [
        [-3, 3],
        [0, 7],
        [3, 5],
      ],
      { color: "#c4a87e", width: 0.65 },
    );
  },
  { pivot: [26, 18], seed: 76100 },
);
const sparrow = new InkSprite(
  61,
  51,
  (p) => {
    p.line(
      [
        [-4, 5],
        [-4, 12],
        [-8, 13],
      ],
      { color: "#b5a07d", width: 1.1 },
    );
    p.line(
      [
        [4, 5],
        [5, 12],
        [10, 12],
      ],
      { color: "#b5a07d", width: 1.1 },
    );
    p.shape(
      [
        [-12, 3],
        [-23, -4],
        [-20, 7],
        [-12, 9],
      ],
      "#b09579",
      { seed: 76201, width: 0.4 },
    );
    p.oval(-2, -2, 13, 10, "#b5a089", { seed: 76202, width: 0.55 });
    p.oval(2, 2, 9, 7, "#ddcbb1", { seed: 76203, width: 0.4 });
    p.oval(9, -11, 9, 8, "#a58e77", { seed: 76204, width: 0.45 });
    p.shape(
      [
        [14, -10],
        [23, -8],
        [15, -5],
      ],
      "#d1b47c",
      { seed: 76205, width: 0.35 },
    );
    p.oval(12, -8, 4, 3, "#e5d4b6", { seed: 76206, width: 0.3 });
    p.dot(12, -12, 1.3, "#8b7968");
    p.shape(
      [
        [-12, -5],
        [3, -6],
        [6, 1],
        [-1, 7],
        [-12, 4],
      ],
      "#a0876e",
      { seed: 76207, width: 0.45 },
    );
    p.line(
      [
        [-9, -2],
        [0, 0],
        [3, 3],
      ],
      { color: "#c6b59b", width: 0.7 },
    );
  },
  { pivot: [30, 31], seed: 76200 },
);
const bee = new InkSprite(
  31,
  26,
  (p) => {
    p.oval(-1, -5, 5, 3.2, "#d7ddd0", { seed: 76301, angle: -0.6, width: 0.4 });
    p.oval(4, -5, 4.8, 3, "#d7ddd0", { seed: 76302, angle: 0.5, width: 0.4 });
    p.oval(0, 0, 6, 3.8, "#d8be81", { seed: 76303, width: 0.4 });
    for (let i = -1; i < 2; i++)
      p.line(
        [
          [i * 3, -2],
          [i * 3 + 1, 2],
        ],
        { color: "#a69b78", width: 1 },
      );
    p.dot(6, -1, 0.9, "#958970");
  },
  { pivot: [15, 15], seed: 76300 },
);
const blossom = new InkSprite(
  36,
  35,
  (p) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      p.oval(Math.cos(a) * 6, Math.sin(a) * 6, 4.8, 4, M.flower, {
        seed: 76410 + i,
        angle: a,
        width: 0.35,
      });
    }
    p.oval(0, 0, 3.8, 3.3, "#d6bc7d", { seed: 76416, width: 0.35 });
  },
  { pivot: [18, 18], seed: 76400 },
);

export function drawPondLife(c, life, time, reduced) {
  const a = L.pond,
    pose = life.pose;
  pond.draw(c, a.x, a.y, { reduced: true });
  if (pose.fish > 0.01) {
    c.save();
    // The fish remains clipped to the water plane, including its diving tail.
    c.beginPath();
    c.ellipse(a.x, a.y - 3, 72, 22, 0, 0, Math.PI * 2);
    c.clip();
    const q = life.age.pond;
    fish.draw(c, a.x - 20 + Math.sin(q * 1.4) * 24, a.y + 10 - pose.fish * 13, {
      time,
      reduced,
      alpha: pose.fish * 0.78,
      scale: 0.78,
      angle: reduced ? 0 : Math.sin(q * 4) * 0.06,
    });
    c.restore();
  }
  const p = new Pencil(c, reduced ? 0 : Math.floor(time * 8) % 3);
  for (const ripple of life.ripples) {
    const age = ripple.age,
      radius = 7 + age * 17;
    c.save();
    c.globalAlpha *= (1 - smooth(age / 2.7)) * 0.65;
    p.oval(a.x - 14, a.y - 1, radius, radius * 0.3, null, {
      outline: "#d4e0cb",
      width: 0.9,
    });
    if (age > 0.26)
      p.oval(a.x - 14, a.y - 1, radius - 7, (radius - 7) * 0.3, null, {
        outline: M.water,
        width: 0.6,
      });
    c.restore();
  }
}
export function drawLampLife(c, life, time, reduced) {
  const a = L.lantern,
    glow = life.pose.glow;
  if (glow < 0.01) return;
  c.save();
  c.globalAlpha *= glow;
  c.fillStyle = "#edd38a24";
  c.beginPath();
  c.ellipse(a.ground.x, a.ground.y, 41, 11, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#f1d69360";
  c.beginPath();
  c.ellipse(a.x + 30 * a.scale, a.y - 86 * a.scale, 11, 14, 0, 0, Math.PI * 2);
  c.fill();
  const p = new Pencil(c, reduced ? 0 : Math.floor(time * 8) % 3);
  for (let i = 0; i < 4; i++) {
    const q = reduced ? i : time * 0.65 + i * 1.9;
    const x = a.ground.x - 14 + Math.sin(q) * (23 + i * 6),
      y = a.ground.y - 44 + Math.cos(q * 0.7) * 15 - i * 9;
    p.dot(x, y, 1.5, C.yellow);
    p.line(
      [
        [x - 3, y - 2],
        [x, y],
        [x + 3, y - 2],
      ],
      { color: "#d3d7bf", width: 0.4 },
    );
  }
  c.restore();
}
export function drawBenchLife(c, life, time, reduced) {
  const a = L.bench,
    amount = life.pose.bird;
  if (amount < 0.01) return;
  const landing = 1 - amount,
    q = life.age.bench;
  sparrow.draw(
    c,
    a.x + 44 + landing * 39,
    a.y -
      18 -
      landing * 36 -
      (reduced ? 0 : Math.max(0, Math.sin(q * 3.6)) * 2 * amount),
    { time, reduced, scale: 0.69, alpha: amount, angle: landing * -0.16 },
  );
}
export function drawFlowerLife(c, life, time, reduced) {
  const a = L.flowers,
    bloom = life.pose.flower;
  if (bloom > 0.01) {
    blossom.draw(c, a.x + 15, a.y - 38, {
      time,
      reduced,
      scale: 0.52 + bloom * 0.15,
      alpha: bloom,
    });
    const q = reduced ? 0 : time * 1.4;
    bee.draw(c, a.x + Math.sin(q) * 20, a.y - 76 + Math.cos(q * 1.7) * 5, {
      time,
      reduced,
      scale: 0.63,
      alpha: bloom,
      angle: Math.sin(q) * 0.2,
    });
  }
  const age = life.age.water;
  if (age >= 0.8 && age < 2.55) {
    const p = new Pencil(c, reduced ? 0 : Math.floor(time * 8) % 3);
    for (let i = 0; i < 7; i++) {
      const t = reduced ? i / 7 : (age * 1.5 + i / 7) % 1;
      c.save();
      c.globalAlpha *= Math.sin(t * Math.PI) * 0.7;
      curve(
        c,
        [
          [a.x - 6 + t * 8 + (i % 2), a.y - 23 + t * 31],
          [a.x - 7 + t * 8, a.y - 20 + t * 31],
        ],
        { color: M.water, width: 0.7 },
      );
      c.restore();
    }
  }
}
