// Original scene artwork, deliberately kept outside the general toolbox.
import {
  stroke,
  oval,
  ovalPoints,
  fillShape,
  hatch,
  colors,
  curvePoints,
} from "../primitives/sketch.js";
const line = (c, p, o = {}) => stroke(c, p, o);

export function leaf(c, x, y, size = 28, angle = 0, color = colors.green) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  let p = [
    [0, 0],
    [-size * 0.25, -size * 0.32],
    [-size * 0.15, -size * 0.75],
    [size * 0.1, -size],
    [size * 0.45, -size * 0.67],
    [size * 0.35, -size * 0.2],
    [0, 0],
  ];
  p = curvePoints(p, { closed: true });
  fillShape(c, p, color, 0.18);
  hatch(c, p, { color, gap: 4, alpha: 0.6 });
  line(c, p, { color, width: 1.25, seed: 19 });
  line(
    c,
    [
      [0, 3],
      [size * 0.12, -size * 0.87],
    ],
    { color, width: 1 },
  );
  for (let i = 1; i < 4; i++)
    line(
      c,
      [
        [size * 0.03 * i, -size * 0.2 * i],
        [size * (0.25 + 0.03 * i), -size * (0.2 * i + 0.18)],
      ],
      { color, width: 0.6, seed: i },
    );
  c.restore();
}
export function plant(c, { sway = 0 } = {}) {
  c.save();
  c.rotate(sway);
  const vase = [
    [-30, 37],
    [-20, 89],
    [-9, 97],
    [25, 94],
    [33, 84],
    [28, 37],
    [-30, 37],
  ];
  fillShape(c, vase, colors.blue, 0.14);
  hatch(c, vase, { color: colors.blue, gap: 4, alpha: 0.45 });
  line(c, vase, { color: colors.blue, width: 1.5 });
  oval(c, 0, 36, 29, 5, { color: colors.blue, width: 1 });
  line(
    c,
    curvePoints([
      [0, 37],
      [2, -10],
      [-17, -48],
      [-12, -98],
    ]),
    { color: colors.green },
  );
  line(
    c,
    curvePoints([
      [0, 28],
      [30, -16],
      [36, -72],
    ]),
    { color: colors.green },
  );
  line(
    c,
    curvePoints([
      [0, 12],
      [-34, -10],
      [-49, -46],
    ]),
    { color: colors.green },
  );
  leaf(c, -8, -38, 29, -0.9);
  leaf(c, 1, 3, 30, 0.9);
  leaf(c, 29, -12, 24, 0.7);
  leaf(c, 35, -48, 23, -0.85);
  leaf(c, -32, -13, 28, -1.1);
  leaf(c, -14, -65, 23, 0.7);
  for (const [x, y] of [
    [-12, -100],
    [35, -74],
    [-49, -49],
  ]) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      oval(c, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 6, 6, {
        color: colors.red,
        width: 1,
        seed: i + 13,
      });
    }
    oval(c, x, y, 5, 5, { color: colors.yellow, width: 2 });
  }
  c.restore();
}
export function moth(c, { wing = 0 } = {}) {
  for (const side of [-1, 1]) {
    c.save();
    c.scale(side, 1);
    c.translate(0, -10);
    c.rotate(-wing);
    let p = [
      [4, 0],
      [24, -43],
      [66, -71],
      [88, -50],
      [87, -10],
      [60, 20],
      [80, 50],
      [56, 67],
      [25, 54],
      [4, 0],
    ];
    p = curvePoints(p, { closed: true });
    fillShape(c, p, colors.yellow, 0.19);
    hatch(c, p, { color: colors.yellow, gap: 4, alpha: 0.65 });
    line(c, p, { color: colors.red, width: 1.3 });
    line(
      c,
      [
        [9, 0],
        [51, -35],
        [75, -46],
      ],
      { color: colors.red, width: 0.7 },
    );
    line(
      c,
      [
        [8, 0],
        [45, 35],
        [57, 49],
      ],
      { color: colors.red, width: 0.7 },
    );
    oval(c, 55, -23, 15, 19, { color: colors.blue, width: 1.3 });
    oval(c, 55, -23, 7, 9, { color: colors.red, width: 1 });
    for (let i = 0; i < 6; i++)
      oval(c, 26 + i * 7, -44 + Math.sin(i) * 7, 1.5, 2, {
        color: colors.red,
        width: 0.8,
        seed: i,
      });
    c.restore();
  }
  fillShape(c, ovalPoints(0, 0, 7, 39), colors.ink, 0.13);
  oval(c, 0, 0, 7, 39, { width: 1.3 });
  for (let y = -24; y < 28; y += 8)
    line(
      c,
      [
        [-5, y],
        [5, y + 1],
      ],
      { width: 0.7, seed: y },
    );
  oval(c, 0, -44, 7, 7, { width: 1 });
  line(
    c,
    [
      [-3, -48],
      [-14, -61],
      [-19, -58],
    ],
    { width: 1 },
  );
  line(
    c,
    [
      [3, -48],
      [13, -64],
      [20, -62],
    ],
    { width: 1 },
  );
}
export function windowArt(c, { glow = 0 } = {}) {
  const arch = [
    [-73, 91],
    [-73, -43],
    [-63, -75],
    [-38, -97],
    [0, -106],
    [36, -97],
    [65, -76],
    [73, -43],
    [73, 91],
    [-73, 91],
  ];
  fillShape(c, arch, colors.blue, 0.08);
  hatch(c, arch, { color: colors.blue, gap: 7, alpha: 0.25 });
  line(c, arch, { color: colors.blue, width: 2 });
  line(
    c,
    [
      [-63, 82],
      [-63, -41],
      [-53, -69],
      [-30, -88],
      [0, -96],
      [31, -86],
      [54, -65],
      [63, -40],
      [63, 82],
      [-63, 82],
    ],
    { color: colors.blue, width: 1 },
  );
  line(
    c,
    [
      [0, -96],
      [0, 82],
    ],
    { color: colors.blue },
  );
  line(
    c,
    [
      [-63, 0],
      [63, 0],
    ],
    { color: colors.blue },
  );
  const moon = ovalPoints(30, -57, 15, 19);
  fillShape(c, moon, colors.yellow, 0.25);
  oval(c, 30, -57, 15, 19, { color: colors.yellow });
  for (const [x, y] of [
    [-42, -45],
    [-22, -72],
    [43, -25],
    [20, 18],
    [-36, 36],
  ]) {
    line(
      c,
      [
        [x - 3, y],
        [x + 3, y],
      ],
      { color: colors.yellow, width: 0.8 },
    );
    line(
      c,
      [
        [x, y - 3],
        [x, y + 3],
      ],
      { color: colors.yellow, width: 0.8 },
    );
  }
  line(
    c,
    [
      [-86, 93],
      [88, 93],
      [97, 100],
      [-95, 100],
      [-86, 93],
    ],
    { color: colors.ink, width: 1.3 },
  );
  line(
    c,
    [
      [-52, 80],
      [-49, 46],
      [-30, 47],
      [-25, 80],
    ],
    { color: colors.red },
  );
  leaf(c, -39, 50, 27, -0.3);
  line(
    c,
    [
      [32, 81],
      [32, 55],
      [21, 39],
      [49, 39],
      [40, 55],
      [40, 81],
    ],
    { color: colors.yellow },
  );
  if (glow > 0) {
    c.save();
    c.globalAlpha = glow * 0.18;
    c.fillStyle = "#e8bf6e";
    c.beginPath();
    c.ellipse(35, 48, 25, 34, 0, 0, 6.29);
    c.fill();
    c.restore();
  }
}
export function paperObject(c, { fold = 0 } = {}) {
  const pts = [
    [-50, -52],
    [31, -51],
    [50, -32],
    [51, 52],
    [-49, 49],
    [-50, -52],
  ];
  fillShape(c, pts, "#fcf7e5");
  line(c, pts, { color: colors.blue, width: 1.1 });
  line(
    c,
    [
      [31, -51],
      [29, -30 - fold * 5],
      [50, -32],
    ],
    { color: colors.blue, width: 1 },
  );
  for (let i = 0; i < 4; i++)
    line(
      c,
      [
        [-30, -10 + i * 12],
        [25 - (i % 2) * 10, -9 + i * 12],
      ],
      { color: colors.blue, width: 0.9, seed: i + 8 },
    );
  line(
    c,
    [
      [-24, -29],
      [-8, -36],
      [1, -28],
    ],
    { color: colors.red },
  );
}
export function bell(c, { clapper = 0 } = {}) {
  const pts = [
    [-42, 32],
    [-30, 19],
    [-25, -13],
    [-16, -40],
    [0, -46],
    [18, -38],
    [26, -10],
    [30, 20],
    [43, 32],
    [-42, 32],
  ];
  fillShape(c, pts, colors.yellow, 0.14);
  hatch(c, pts, { color: colors.yellow, alpha: 0.5, gap: 4 });
  line(c, pts, { color: colors.ink, width: 1.3 });
  oval(c, 0, -48, 7, 7, { width: 1 });
  oval(c, 0, 31, 41, 6, { width: 0.9 });
  c.save();
  c.translate(0, 0);
  c.rotate(clapper);
  line(
    c,
    [
      [0, -2],
      [0, 39],
    ],
    { width: 1 },
  );
  oval(c, 0, 41, 7, 5, { color: colors.red, width: 1.5 });
  c.restore();
}
export function stone(c) {
  const pts = [
    [-54, 27],
    [-46, -5],
    [-29, -29],
    [11, -42],
    [40, -24],
    [54, 12],
    [39, 32],
    [-13, 36],
    [-54, 27],
  ];
  fillShape(c, pts, "#a9a291", 0.16);
  hatch(c, pts, { color: colors.ink, gap: 5, alpha: 0.27 });
  line(c, pts, { width: 1.6 });
  line(
    c,
    [
      [-29, -29],
      [-13, -11],
      [11, -42],
    ],
    { width: 0.9, alpha: 0.6 },
  );
  line(
    c,
    [
      [40, -24],
      [18, -2],
      [37, 23],
    ],
    { width: 0.9, alpha: 0.5 },
  );
}
export function lamp(c, { shade = 0, glow = 0 } = {}) {
  oval(c, 0, 54, 38, 7, { color: colors.blue, width: 1.4 });
  line(
    c,
    [
      [-9, 50],
      [-5, -30],
      [5, -30],
      [8, 50],
    ],
    { color: colors.blue, width: 1.2 },
  );
  c.save();
  c.translate(0, -27);
  c.rotate(shade);
  const pts = [
    [-47, 0],
    [-27, -49],
    [28, -49],
    [48, 0],
    [-47, 0],
  ];
  fillShape(c, pts, colors.yellow, 0.18 + glow * 0.13);
  hatch(c, pts, { color: colors.red, alpha: 0.35, gap: 5 });
  line(c, pts, { color: colors.red, width: 1.4 });
  oval(c, 0, 1, 47, 6, { color: colors.red, width: 0.8 });
  c.restore();
  if (glow > 0.01) {
    c.save();
    c.globalAlpha = glow * 0.14;
    fillShape(
      c,
      [
        [-31, -23],
        [-71, 51],
        [70, 51],
        [32, -23],
      ],
      "#d5b265",
    );
    c.restore();
  }
}
export function creature(c, { squash = 0, look = 0, antenna = 0 } = {}) {
  c.save();
  c.scale(1 + squash * 0.45, 1 - squash);
  const body = ovalPoints(0, -5, 35, 39, 2);
  fillShape(c, body, colors.red, 0.17);
  hatch(c, body, { color: colors.red, alpha: 0.4, gap: 4 });
  line(c, body, { color: colors.red, width: 1.5 });
  for (const x of [-13, 13]) {
    oval(c, x, -10, 7, 8, { width: 1.2, jitter: 0.3 });
    oval(c, x + look * 2, -10, 1.5, 2, { width: 2, jitter: 0 });
  }
  line(
    c,
    [
      [-5, 8],
      [0, 11],
      [6, 8],
    ],
    { width: 1 },
  );
  c.save();
  c.rotate(antenna);
  line(
    c,
    [
      [-15, -40],
      [-18, -57],
      [-27, -60],
      [-33, -55],
    ],
    { color: colors.red, width: 1.2 },
  );
  line(
    c,
    [
      [14, -40],
      [20, -56],
      [29, -56],
      [32, -50],
    ],
    { color: colors.red, width: 1.2 },
  );
  c.restore();
  c.restore();
  oval(c, -18, 34, 11, 4, { width: 1.2 });
  oval(c, 20, 34, 11, 4, { width: 1.2 });
}
