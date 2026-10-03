import { InkSprite, Pencil, palette as C } from "../primitives/living-ink.js";

const sunRays = new InkSprite(
  136,
  136,
  (p) => {
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6,
        r = 36 + (i % 2) * 3;
      p.line(
        [
          [Math.cos(a) * r, Math.sin(a) * r],
          [Math.cos(a + 0.035) * (r + 10), Math.sin(a + 0.035) * (r + 10)],
        ],
        { color: i % 3 ? C.yellow : C.rose, width: 2 },
      );
    }
  },
  { seed: 80101 },
);
const sun = new InkSprite(
  96,
  96,
  (p) => {
    p.oval(0, 0, 29, 28, C.yellow, { seed: 80102, width: 1.7, base: 0.4 });
    p.line(
      [
        [-18, -11],
        [-11, -20],
        [3, -23],
      ],
      { color: C.cream, width: 1.8 },
    );
    for (const x of [-16, 16])
      p.oval(x, 7, 4, 2.8, C.rose, { seed: 80103 + x, width: 0.4 });
    p.line(
      [
        [-7, 10],
        [-1, 15],
        [5, 13],
        [9, 9],
      ],
      { color: C.honey, width: 1.5 },
    );
  },
  { seed: 80102 },
);
const cloud = new InkSprite(
  154,
  89,
  (p) => {
    p.shape(
      [
        [-56, 9],
        [-61, -2],
        [-49, -13],
        [-33, -12],
        [-30, -24],
        [-14, -32],
        [0, -25],
        [12, -33],
        [27, -28],
        [31, -11],
        [49, -10],
        [59, 0],
        [53, 13],
        [28, 20],
        [-18, 19],
      ],
      "#c5cdc7",
      { seed: 80201, width: 1.3, base: 0.28 },
    );
    p.line(
      [
        [-44, 6],
        [-29, 12],
        [-18, 10],
      ],
      { color: C.cream, width: 1.2 },
    );
    p.line(
      [
        [15, 12],
        [30, 9],
        [40, 3],
      ],
      { color: C.cream, width: 1.2 },
    );
    p.line(
      [
        [-10, 2],
        [-6, 4],
        [-2, 2],
      ],
      { color: C.teal, width: 1.1 },
    );
    p.line(
      [
        [9, 1],
        [13, 3],
        [17, 0],
      ],
      { color: C.teal, width: 1.1 },
    );
  },
  { seed: 80201 },
);
const moon = new InkSprite(
  127,
  130,
  (p) => {
    p.shape(
      [
        [17, -40],
        [-5, -35],
        [-24, -22],
        [-34, 1],
        [-28, 26],
        [-10, 37],
        [16, 33],
        [32, 16],
        [19, 17],
        [3, 8],
        [-1, -8],
        [8, -26],
      ],
      C.cream,
      { seed: 80301, width: 1.6, base: 0.35 },
    );
    p.line(
      [
        [-17, 1],
        [-11, 4],
        [-6, 2],
      ],
      { color: C.honey, width: 1.4 },
    );
    p.line(
      [
        [-12, 13],
        [-5, 17],
        [3, 14],
      ],
      { color: C.rose, width: 1.2 },
    );
    p.oval(-22, 13, 4, 3, C.rose, { seed: 80302, width: 0.5 });
    p.shape(
      [
        [-23, -19],
        [-10, -38],
        [13, -45],
        [34, -28],
        [28, -12],
        [19, -25],
        [0, -24],
      ],
      C.blue,
      { seed: 80303, width: 1.1 },
    );
    p.line(
      [
        [-7, -33],
        [8, -35],
        [21, -28],
      ],
      { color: C.cream, width: 1.1 },
    );
    p.shape(
      [
        [-23, -19],
        [-19, -26],
        [13, -30],
        [19, -24],
        [11, -19],
      ],
      C.paper,
      { seed: 80304, width: 1.1 },
    );
    p.oval(28, -11, 6, 5, C.yellow, { seed: 80305, width: 0.8 });
  },
  { seed: 80301 },
);
const star = new InkSprite(
  50,
  52,
  (p) => {
    p.shape(
      [
        [0, -17],
        [5, -5],
        [18, -3],
        [8, 5],
        [11, 17],
        [0, 11],
        [-12, 17],
        [-8, 4],
        [-18, -3],
        [-5, -6],
      ],
      C.yellow,
      { seed: 80401, width: 1.2 },
    );
    p.line(
      [
        [-5, -2],
        [-1, -8],
        [2, -2],
      ],
      { color: C.cream, width: 1 },
    );
  },
  { seed: 80401 },
);
const snailShell = new InkSprite(
  80,
  76,
  (p) => {
    p.oval(-3, -7, 25, 23, C.honey, { seed: 80501, width: 1.4 });
    p.line(
      [
        [-23, -4],
        [-22, -15],
        [-12, -25],
        [3, -26],
        [16, -15],
        [16, 0],
        [6, 11],
        [-8, 10],
        [-15, 0],
        [-12, -9],
        [-3, -12],
        [6, -6],
        [4, 2],
        [-3, 4],
      ],
      { color: C.cream, width: 1.6 },
    );
    p.line(
      [
        [-3, 0],
        [0, -2],
        [2, 0],
      ],
      { color: C.red, width: 1 },
    );
  },
  { seed: 80501 },
);
const snailBody = new InkSprite(
  117,
  79,
  (p) => {
    p.shape(
      [
        [-38, 13],
        [-29, 17],
        [4, 14],
        [20, 3],
        [25, -14],
        [33, -18],
        [39, -10],
        [33, 5],
        [23, 17],
        [4, 24],
        [-34, 23],
      ],
      C.green,
      { seed: 80502, width: 1.3 },
    );
    p.line(
      [
        [31, -13],
        [30, -27],
        [25, -32],
      ],
      { color: C.green, width: 1.6 },
    );
    p.line(
      [
        [36, -12],
        [44, -22],
        [49, -23],
      ],
      { color: C.green, width: 1.6 },
    );
    p.oval(25, -33, 3, 3, C.cream, { seed: 80503, width: 0.6 });
    p.dot(25, -33, 1.4, C.teal);
    p.oval(49, -23, 3, 3, C.cream, { seed: 80504, width: 0.6 });
    p.dot(49, -23, 1.4, C.teal);
    p.line(
      [
        [32, -3],
        [36, -3],
      ],
      { color: C.honey, width: 1 },
    );
    p.line(
      [
        [-27, 19],
        [-4, 19],
        [15, 13],
      ],
      { color: C.cream, width: 1.1 },
    );
  },
  { seed: 80502 },
);
const wildflowers = new InkSprite(
  117,
  137,
  (p) => {
    for (let i = 0; i < 5; i++) {
      const x = -33 + i * 16,
        y = -26 - ((i * 17) % 38);
      p.line(
        [
          [x * 0.7, 30],
          [x, -5],
          [x, y],
        ],
        { color: C.green, width: 1.4 },
      );
      p.shape(
        [
          [x * 0.8, 5],
          [x - 11, -9],
          [x - 16, -5],
          [x * 0.8, 13],
        ],
        C.teal,
        { seed: 80610 + i, width: 0.6 },
      );
      for (let j = 0; j < 5; j++) {
        const a = (j * Math.PI * 2) / 5;
        p.oval(
          x + Math.cos(a) * 6,
          y + Math.sin(a) * 6,
          4.5,
          3.8,
          i % 2 ? C.rose : C.yellow,
          { seed: 80630 + i * 5 + j, width: 0.55 },
        );
      }
      p.oval(x, y, 2.8, 2.8, C.honey, { seed: 80670 + i, width: 0.4 });
    }
    p.line(
      [
        [-38, 31],
        [-47, 13],
        [-42, 9],
      ],
      { color: C.green, width: 1 },
    );
    p.line(
      [
        [31, 33],
        [45, 17],
      ],
      { color: C.green, width: 1.2 },
    );
  },
  { seed: 80601 },
);

export function drawCourtyardOrnaments(c, { time = 0, reduced = false } = {}) {
  const t = reduced ? 0 : time,
    opts = { time: t, reduced },
    p = new Pencil(c, reduced ? 0 : Math.floor(t * 8) % 3);
  sunRays.draw(c, 75, 239, {
    ...opts,
    scale: 0.86,
    angle: Math.sin(t * 0.45) * 0.07,
  });
  sun.draw(c, 75, 239, {
    ...opts,
    scale: 0.86,
    angle: Math.sin(t * 0.55) * 0.025,
  });
  if (!c.sceneDrawing || c.sceneDrawing(80102) > 0.9)
    for (const x of [-9, 9]) {
      c.save();
      c.translate(75 + x * 0.86, 237);
      c.scale(1, 1 - 0.9 * Math.pow(Math.max(0, Math.cos(t * 1.12)), 55));
      p.dot(0, 0, 1.9, C.honey);
      c.restore();
    }
  cloud.draw(c, 408 + Math.sin(t * 0.19) * 3, 177 + Math.sin(t * 0.46) * 1.4, {
    ...opts,
    scale: 0.72,
  });
  cloud.draw(
    c,
    781 + Math.sin(t * 0.16 + 2) * 4,
    206 + Math.sin(t * 0.41 + 2) * 2,
    { ...opts, scale: 0.65, angle: -0.04 },
  );
  moon.draw(c, 1034, 222, {
    ...opts,
    scale: 0.82,
    angle: Math.sin(t * 0.43 + 1) * 0.025,
  });
  // Hanging paper stars: attachments stay at the end of their threads.
  for (const [i, x, y] of [
    [0, 854, 154],
    [1, 926, 186],
    [2, 966, 133],
  ]) {
    const a = reduced ? 0 : Math.sin(t * 0.65 + i) * 0.055,
      xx = x + Math.sin(a) * 34;
    p.line(
      [
        [x, 111],
        [x - 2, 128],
        [xx, y - 15],
      ],
      { color: C.pale, width: 0.9, progress: c.sceneDrawing?.(80401) ?? 1 },
    );
    star.draw(c, xx, y, { ...opts, scale: i === 1 ? 0.6 : 0.45, angle: a });
  }
  wildflowers.draw(c, 67, 690, {
    ...opts,
    scale: 0.58,
    angle: Math.sin(t * 0.7) * 0.035,
  });
  snailBody.draw(c, 82, 582, {
    ...opts,
    scale: 0.6,
    angle: Math.sin(t * 0.55) * 0.015,
  });
  snailShell.draw(c, 78, 582, {
    ...opts,
    scale: 0.6,
    angle: Math.sin(t * 0.55) * 0.015,
  });
  wildflowers.draw(c, 1033, 688, {
    ...opts,
    scale: 0.48,
    angle: Math.sin(t * 0.62 + 1) * 0.035,
  });
}
