import {
  InkSprite,
  Pencil,
  palette as C,
  ellipsePoints,
  wax,
  curve,
  penLine,
} from "../primitives/living-ink.js";

function solid(c, x, y, rx, ry, color) {
  if (c.inkPainter) {
    c.inkPainter.oval(x, y, rx, ry, color, {
      outline: color,
      width: 0.2,
      base: 0.75,
    });
    return;
  }
  c.save();
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
function stars(p, coords) {
  for (const [x, y, s = 3] of coords) {
    p.line(
      [
        [x - s, y],
        [x + s, y],
      ],
      { width: 0.9, color: C.yellow },
    );
    p.line(
      [
        [x, y - s],
        [x, y + s],
      ],
      { width: 0.9, color: C.yellow },
    );
  }
}
function stitch(p, points, color = C.paper) {
  for (let i = 1; i < points.length; i++)
    p.line([points[i - 1], points[i]], { color, width: 0.8 });
}
function bloom(p, x, y, s, color = C.rose) {
  for (let i = 0; i < 5; i++) {
    const a = i * 1.256;
    p.oval(
      x + Math.cos(a) * s * 0.55,
      y + Math.sin(a) * s * 0.55,
      s * 0.43,
      s * 0.47,
      color,
      { width: 0.8 },
    );
  }
  p.oval(x, y, s * 0.26, s * 0.27, C.yellow, { width: 0.9 });
}
function smallLeaf(p, x, y, s, a = 0, color = C.green) {
  const c = p.c;
  c.save();
  c.translate(x, y);
  c.rotate(a);
  p.shape(
    [
      [0, 0],
      [-s * 0.42, -s * 0.3],
      [-s * 0.34, -s * 0.79],
      [0, -s],
      [s * 0.38, -s * 0.62],
      [s * 0.24, -s * 0.2],
    ],
    color,
    { width: 1.05, angle: -0.9 },
  );
  p.line(
    [
      [0, 0],
      [0, -s * 0.88],
    ],
    { width: 0.8 },
  );
  for (let i = 1; i < 4; i++)
    p.line(
      [
        [0, -s * i * 0.21],
        [s * 0.2, -s * (i * 0.21 + 0.17)],
      ],
      { width: 0.65, color: C.honey },
    );
  c.restore();
}
function cloud(p, x, y, s) {
  p.shape(
    [
      [x - s, y],
      [x - s * 0.72, y - s * 0.24],
      [x - s * 0.45, y - s * 0.62],
      [x - s * 0.1, y - s * 0.4],
      [x + s * 0.25, y - s * 0.54],
      [x + s * 0.6, y - s * 0.19],
      [x + s, y],
      [x + s * 0.5, y + s * 0.1],
      [x - s * 0.4, y + s * 0.12],
    ],
    C.paper,
    { base: 0.13, width: 0.9, outline: C.soft },
  );
}
function bird(p, x, y, s) {
  p.line(
    [
      [x - s, y],
      [x - s * 0.4, y - s * 0.5],
      [x, y],
      [x + s * 0.5, y - s * 0.45],
      [x + s, y],
    ],
    { width: 0.9 },
  );
}

export { drawGuide } from "./guide.js";

export function plantArt(p, x = 0, y = 0, scale = 1) {
  const c = p.c;
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  p.shape(
    [
      [-36, -1],
      [-29, 49],
      [0, 59],
      [27, 49],
      [36, 0],
    ],
    C.red,
    { double: true, seed: 500, angle: 0.3 },
  );
  p.oval(0, -1, 37, 10, C.honey, { width: 1.5, seed: 502 });
  p.oval(0, -3, 30, 5, C.ink, { width: 0.7, seed: 503 });
  for (let i = 0; i < 7; i++)
    p.line(
      [
        [-24 + i * 8, 7],
        [-19 + i * 6, 46],
      ],
      { width: 0.7, color: C.cream },
    );
  p.line(
    [
      [-25, 44],
      [0, 52],
      [24, 43],
    ],
    { color: C.honey, width: 1 },
  );
  const stems = [
    [-7, -82, -0.5],
    [11, -114, 0.25],
    [29, -73, 0.6],
    [-32, -54, -0.9],
    [-23, -125, -0.32],
    [5, -55, 0.07],
  ];
  for (const [sx, sy, a] of stems) {
    p.line(
      [
        [0, -3],
        [sx * 0.45, sy * 0.48],
        [sx, sy],
      ],
      { width: 1.7, color: "#647756" },
    );
    smallLeaf(p, sx, sy, 29, a, C.green);
    smallLeaf(p, sx * 0.6 - 8, sy * 0.57, 23, a - 0.6, C.teal);
  }
  bloom(p, -24, -117, 9, C.yellow);
  c.restore();
}
export const plant = new InkSprite(150, 220, (p) => plantArt(p), {
  pivot: [75, 150],
  seed: 51,
});

function greenhouse(p, c) {
  p.shape(
    [
      [-104, -100],
      [106, -100],
      [106, 101],
      [-104, 101],
    ],
    C.blue,
    { angular: true, width: 0.8, base: 0.1, seed: 610, angle: 0.07 },
  );
  p.oval(64, -65, 15, 16, C.cream, { width: 0.8, seed: 611 });
  stars(p, [
    [-72, -71, 3],
    [-46, -87, 2],
    [15, -71, 3],
    [83, -30, 2],
    [-89, -33, 2],
  ]);
  p.shape(
    [
      [-96, 66],
      [-66, 50],
      [-19, 53],
      [19, 45],
      [59, 59],
      [97, 51],
      [103, 101],
      [-101, 101],
    ],
    C.teal,
    { seed: 612, width: 1 },
  );
  p.shape(
    [
      [-71, 66],
      [-69, -29],
      [-47, -57],
      [-6, -77],
      [38, -64],
      [68, -39],
      [73, 67],
    ],
    "#acc5b7",
    { seed: 613, base: 0.07, width: 1.6, double: true, angle: 1.3 },
  );
  p.line(
    [
      [-71, -28],
      [0, -59],
      [70, -39],
    ],
    { width: 1.8 },
  );
  p.line(
    [
      [-68, 9],
      [71, 11],
    ],
    { width: 1.5 },
  );
  p.line(
    [
      [-66, 38],
      [70, 39],
    ],
    { width: 1.5 },
  );
  for (const x of [-45, -21, 5, 31, 56])
    p.line(
      [
        [x, 63],
        [x, -42 + Math.abs(x) * 0.25],
      ],
      { width: 1.2 },
    );
  p.line(
    [
      [0, -76],
      [0, -59],
      [4, 67],
    ],
    { width: 1.5 },
  );
  p.shape(
    [
      [-16, 67],
      [-17, 18],
      [5, 13],
      [22, 18],
      [24, 66],
    ],
    C.green,
    { seed: 614, width: 1.2, base: 0.1 },
  );
  p.oval(12, 40, 2, 2, C.yellow, { width: 0.7 });
  for (let i = 0; i < 4; i++) {
    const x = -55 + i * 34;
    p.shape(
      [
        [x - 8, 64],
        [x - 5, 76],
        [x + 6, 76],
        [x + 9, 63],
      ],
      C.red,
      { width: 0.8, seed: 620 + i },
    );
    p.line(
      [
        [x, 62],
        [x, 40],
        [x - 5, 31],
      ],
      { width: 0.9 },
    );
    smallLeaf(p, x, 54, 12, -0.5);
    smallLeaf(p, x, 43, 12, 0.5);
  }
  p.shape(
    [
      [-82, 83],
      [-49, 75],
      [-7, 84],
      [47, 78],
      [92, 88],
      [91, 99],
      [-89, 99],
    ],
    C.honey,
    { seed: 635, width: 0.8, base: 0.12 },
  );
  for (let i = 0; i < 7; i++)
    p.line(
      [
        [-74 + i * 25, 85],
        [-67 + i * 25, 99],
      ],
      { width: 0.65, color: C.cream },
    );
  // A gardener curled up beside a watering can.
  p.oval(45, 81, 15, 8, C.yellow, { seed: 637, width: 1 });
  p.oval(32, 76, 9, 9, C.cream, { seed: 638, width: 0.9 });
  p.line(
    [
      [25, 73],
      [28, 75],
      [31, 73],
    ],
    { width: 0.8 },
  );
  p.line(
    [
      [34, 74],
      [37, 75],
      [39, 73],
    ],
    { width: 0.8 },
  );
  p.shape(
    [
      [70, 76],
      [82, 74],
      [84, 88],
      [71, 89],
    ],
    C.teal,
    { width: 1, seed: 640 },
  );
  p.line(
    [
      [81, 76],
      [91, 70],
      [96, 70],
    ],
    { width: 1 },
  );
  p.line(
    [
      [73, 76],
      [72, 69],
      [82, 68],
      [83, 75],
    ],
    { width: 0.9 },
  );
  for (let i = 0; i < 3; i++)
    p.line(
      [
        [-55 + i * 39, -30],
        [-42 + i * 37, -12],
      ],
      { width: 0.8, color: C.paper, alpha: 0.8 },
    );
}
function postoffice(p, c) {
  p.shape(
    [
      [-103, -101],
      [104, -100],
      [104, 100],
      [-104, 100],
    ],
    C.cream,
    { angular: true, width: 0.8, base: 0.13, seed: 701 },
  );
  cloud(p, -62, -68, 29);
  cloud(p, 65, -78, 24);
  bird(p, 14, -82, 6);
  p.shape(
    [
      [-91, 45],
      [-71, -52],
      [-10, -75],
      [62, -44],
      [84, 46],
    ],
    C.red,
    { width: 1.5, seed: 702, double: true },
  );
  p.shape(
    [
      [-73, -41],
      [-72, 57],
      [65, 57],
      [64, -42],
      [-6, -62],
    ],
    C.yellow,
    { width: 1.3, seed: 703, angle: 0.9 },
  );
  p.line(
    [
      [-91, -41],
      [-10, -77],
      [83, -43],
    ],
    { width: 2 },
  );
  for (let row = 0; row < 5; row++)
    for (let i = 0; i < 8; i++)
      p.line(
        [
          [-76 + i * 18 + row * 3, -45 + row * 4],
          [-73 + i * 18 + row * 3, -39 + row * 4],
        ],
        { width: 0.65, color: C.cream },
      );
  p.shape(
    [
      [-17, 55],
      [-20, -11],
      [-11, -30],
      [13, -31],
      [24, -11],
      [24, 56],
    ],
    C.teal,
    { seed: 704, width: 1.5, double: true },
  );
  p.oval(5, -19, 14, 9, C.cream, { width: 0.8, seed: 705 });
  p.line(
    [
      [-11, -2],
      [17, -2],
    ],
    { width: 1 },
  );
  p.oval(14, 25, 2, 2, C.honey, { width: 0.8 });
  for (const x of [-49, 45]) {
    p.shape(
      [
        [x - 12, -7],
        [x + 12, -7],
        [x + 12, 20],
        [x - 12, 20],
      ],
      C.blue,
      { angular: true, width: 1.2, seed: 710 + x },
    );
    p.line(
      [
        [x, -7],
        [x, 20],
      ],
      { width: 0.8 },
    );
    p.line(
      [
        [x - 12, 7],
        [x + 12, 7],
      ],
      { width: 0.8 },
    );
    p.line(
      [
        [x - 14, 22],
        [x + 15, 21],
      ],
      { width: 1.3 },
    );
    for (let i = 0; i < 3; i++) {
      smallLeaf(p, x - 8 + i * 8, 23, 10, (i - 1) * 0.4);
      bloom(p, x - 8 + i * 8, 16, 4, C.rose);
    }
  }
  p.shape(
    [
      [-101, 67],
      [-73, 47],
      [-17, 57],
      [26, 52],
      [86, 62],
      [104, 91],
      [104, 100],
      [-104, 100],
    ],
    C.green,
    { seed: 720, width: 0.9 },
  );
  for (let i = 0; i < 18; i++) {
    const x = -94 + (i % 6) * 34,
      y = 73 + Math.floor(i / 6) * 11;
    p.oval(x, y, 12, 4, C.pale, { seed: 730 + i, width: 0.6 });
  }
  // Letterbox, letters and an individual snail post carrier.
  p.shape(
    [
      [55, 51],
      [54, 9],
      [58, 1],
      [74, 1],
      [80, 10],
      [79, 51],
    ],
    C.red,
    { seed: 752, width: 1.3 },
  );
  p.line(
    [
      [58, 16],
      [76, 16],
    ],
    { width: 2 },
  );
  p.shape(
    [
      [56, 24],
      [76, 24],
      [76, 43],
      [57, 43],
    ],
    C.rose,
    { angular: true, width: 0.8, seed: 753 },
  );
  p.line(
    [
      [65, 51],
      [65, 62],
    ],
    { width: 2 },
  );
  p.oval(65, 62, 9, 2, C.ink, { width: 0.7 });
  p.oval(-35, 65, 24, 14, C.honey, { seed: 760, width: 1.3, double: true });
  p.line(
    [
      [-49, 67],
      [-50, 55],
      [-40, 51],
      [-26, 55],
      [-24, 66],
      [-31, 74],
      [-43, 72],
      [-44, 62],
      [-37, 60],
      [-33, 65],
      [-38, 68],
    ],
    { width: 1.2, color: C.red },
  );
  p.shape(
    [
      [-65, 80],
      [-61, 69],
      [-52, 68],
      [-41, 76],
      [-15, 77],
      [-10, 84],
      [-49, 88],
      [-67, 85],
    ],
    C.cream,
    { seed: 761, width: 1.2 },
  );
  for (const x of [-60, -52]) {
    p.line(
      [
        [x, 71],
        [x - 3, 58],
      ],
      { width: 1.2 },
    );
    solid(c, x - 3, 58, 3, 4, C.paper);
    p.oval(x - 3, 58, 3, 4, null, { width: 0.8 });
    p.dot(x - 3, 58, 1.3);
  }
  p.shape(
    [
      [-28, 53],
      [-13, 47],
      [-5, 68],
      [-19, 73],
    ],
    C.teal,
    { angular: true, width: 0.9, seed: 770 },
  );
  p.shape(
    [
      [-27, 53],
      [-17, 43],
      [-11, 52],
      [-12, 63],
    ],
    C.paper,
    { angular: true, width: 0.65, seed: 771 },
  );
  p.line(
    [
      [-25, 52],
      [-18, 55],
      [-12, 49],
    ],
    { width: 0.65 },
  );
  bloom(p, -85, 47, 7, C.rose);
  smallLeaf(p, -85, 65, 20, 0.1);
}
function harbour(p, c) {
  p.shape(
    [
      [-104, -100],
      [105, -100],
      [105, 100],
      [-104, 100],
    ],
    "#c5d4d3",
    { angular: true, width: 0.8, base: 0.14, seed: 801 },
  );
  cloud(p, -56, -66, 42);
  cloud(p, 57, -81, 26);
  p.oval(78, -44, 12, 12, C.yellow, { seed: 802, width: 0.8 });
  p.shape(
    [
      [-104, 8],
      [-60, -1],
      [-6, 10],
      [51, -1],
      [105, 9],
      [105, 100],
      [-104, 100],
    ],
    C.blue,
    { seed: 803, width: 0.9, base: 0.1 },
  );
  for (let row = 0; row < 12; row++)
    for (let i = 0; i < 5; i++)
      p.line(
        [
          [-101 + i * 47 + (row % 2) * 8, 20 + row * 6],
          [-92 + i * 47, 18 + row * 6],
          [-74 + i * 47, 20 + row * 6],
        ],
        { width: 0.8, color: row % 3 ? C.teal : C.paper },
      );
  p.shape(
    [
      [-104, 100],
      [-103, 44],
      [-91, 24],
      [-69, 17],
      [-61, -8],
      [-40, -12],
      [-28, 15],
      [-5, 38],
      [0, 77],
      [29, 100],
    ],
    C.honey,
    { seed: 810, width: 1.3, double: true, angle: 0.4 },
  );
  p.line(
    [
      [-91, 48],
      [-78, 33],
      [-79, 57],
      [-66, 65],
      [-61, 39],
    ],
    { width: 0.8 },
  );
  p.line(
    [
      [-49, 14],
      [-42, 36],
      [-30, 31],
      [-25, 64],
      [-15, 75],
    ],
    { width: 0.8 },
  );
  p.shape(
    [
      [-75, 16],
      [-70, -64],
      [-39, -65],
      [-34, 18],
    ],
    C.cream,
    { angular: true, seed: 820, width: 1.3, double: true },
  );
  for (let i = 0; i < 3; i++)
    p.shape(
      [
        [-71 + i, -47 + i * 21],
        [-40 - i, -47 + i * 21],
        [-39 - i, -37 + i * 21],
        [-73 + i, -37 + i * 21],
      ],
      C.red,
      { angular: true, width: 0.6, seed: 822 + i },
    );
  p.shape(
    [
      [-73, -64],
      [-74, -80],
      [-38, -80],
      [-35, -64],
    ],
    C.teal,
    { angular: true, width: 1.2, seed: 827 },
  );
  p.shape(
    [
      [-78, -80],
      [-57, -97],
      [-31, -80],
    ],
    C.red,
    { angular: true, width: 1.2, seed: 828 },
  );
  p.line(
    [
      [-56, -80],
      [-56, -66],
    ],
    { width: 1 },
  );
  p.oval(-56, -72, 4, 6, C.yellow, { width: 0.6, seed: 829 });
  p.line(
    [
      [-84, -62],
      [-27, -62],
    ],
    { width: 1.4 },
  );
  p.line(
    [
      [-82, -62],
      [-81, -67],
      [-28, -67],
      [-28, -61],
    ],
    { width: 0.8 },
  );
  p.shape(
    [
      [-62, 14],
      [-62, -4],
      [-51, -4],
      [-50, 16],
    ],
    C.dark,
    { angular: true, width: 0.8, seed: 830 },
  );
  p.line(
    [
      [-53, 18],
      [-59, 25],
      [-54, 31],
      [-63, 38],
      [-59, 45],
      [-70, 52],
      [-66, 59],
      [-78, 66],
      [-76, 74],
      [-87, 83],
    ],
    { width: 1.1, color: C.cream },
  );
  bird(p, 13, -46, 7);
  bird(p, 31, -55, 5);
  bird(p, 45, -38, 6);
  p.oval(77, 86, 9, 4, C.teal, { seed: 849, width: 0.8 });
  p.shape(
    [
      [85, 85],
      [95, 81],
      [95, 92],
    ],
    C.teal,
    { angular: true, width: 0.8, seed: 850 },
  );
  p.dot(72, 85, 1);
  p.line(
    [
      [74, 82],
      [74, 89],
    ],
    { width: 0.6 },
  );
}
export const paintings = [greenhouse, postoffice, harbour].map(
  (draw, i) =>
    new InkSprite(
      252,
      266,
      (p, c) => {
        p.shape(
          [
            [-120, -120],
            [121, -118],
            [120, 121],
            [-119, 123],
          ],
          i === 0 ? C.plum : i === 1 ? C.honey : C.teal,
          { angular: true, double: true, width: 2, seed: 900 + i, base: 0.22 },
        );
        p.shape(
          [
            [-111, -109],
            [111, -109],
            [112, 110],
            [-110, 111],
          ],
          C.cream,
          { angular: true, width: 1.2, seed: 910 + i },
        );
        for (let j = 0; j < 4; j++) {
          p.line(
            [
              [-117, -115 + j * 3],
              [-112, -115 + j * 3],
            ],
            { width: 0.65 },
          );
          p.line(
            [
              [115, 115 - j * 3],
              [109, 115 - j * 3],
            ],
            { width: 0.65 },
          );
        }
        draw(p, c);
        p.line(
          [
            [-104, -100],
            [105, -100],
            [105, 100],
            [-104, 100],
            [-104, -100],
          ],
          { width: 1.5 },
        );
      },
      { pivot: [126, 132], seed: 71 + i * 13 },
    ),
);

const paintedBoat = new InkSprite(
  74,
  93,
  (p) => {
    p.shape(
      [
        [-24, 0],
        [26, 0],
        [15, 13],
        [-12, 13],
      ],
      C.red,
      { angular: true, width: 1.2, seed: 840 },
    );
    p.line(
      [
        [-2, 0],
        [-2, -47],
      ],
      { width: 1.5 },
    );
    p.shape(
      [
        [1, -43],
        [1, -6],
        [25, -9],
      ],
      C.paper,
      { angular: true, seed: 841, width: 1 },
    );
    p.shape(
      [
        [-5, -37],
        [-26, -7],
        [-5, -6],
      ],
      C.yellow,
      { angular: true, seed: 842, width: 1 },
    );
  },
  { pivot: [37, 60], seed: 80 },
);

/** Small events within the paintings have their own local coordinates. */
export function drawPainting(
  c,
  i,
  x,
  y,
  { time = 0, scale = 1, reduced = false, alpha = 1, effect = 10 } = {},
) {
  paintings[i].draw(c, x, y, { time, scale, reduced, alpha });
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  c.globalAlpha *= alpha;
  const p = new Pencil(c, reduced ? 0 : Math.floor(time * 8) % 3);
  if (i === 0 && effect < 2.2) {
    const alive =
      Math.sin((Math.min(1, effect / 0.15) * Math.PI) / 2) *
      (effect > 1.6 ? Math.max(0, (2.2 - effect) / 0.6) : 1);
    c.save();
    c.globalAlpha *= alive;
    solid(c, 32, 76, 8, 7, C.cream);
    p.oval(29, 75, 2, 2.6, null, { width: 0.65 });
    p.oval(35, 75, 2, 2.6, null, { width: 0.65 });
    p.dot(29, 75, 0.8);
    p.dot(35, 75, 0.8);
    c.restore();
    for (let j = 0; j < 3; j++) {
      c.save();
      c.globalAlpha *= alive * 0.15;
      c.fillStyle = C.yellow;
      c.fillRect(-44 + j * 35, -13, 17, 21);
      c.restore();
    }
  }
  if (i === 1 && effect < 1.25) {
    const u = Math.min(1, effect / 1.1),
      xx = -20 + 84 * u,
      yy = 48 - 30 * u - Math.sin(u * Math.PI) * 35;
    c.save();
    c.translate(xx, yy);
    c.rotate(-0.2 + Math.sin(u * 5) * 0.15);
    p.shape(
      [
        [-9, -5],
        [9, -5],
        [9, 6],
        [-9, 6],
      ],
      C.paper,
      { angular: true, width: 0.65, seed: 771 },
    );
    p.line(
      [
        [-9, -5],
        [0, 1],
        [9, -5],
      ],
      { width: 0.65 },
    );
    c.restore();
  }
  if (i === 2) {
    const touch = effect < 1.6 ? Math.sin((effect / 1.6) * Math.PI) : 0;
    const shift = reduced ? 0 : Math.sin(time * 0.7) * 1.7 + touch * 8;
    paintedBoat.draw(
      c,
      60 + shift,
      44 + (reduced ? 0 : Math.sin(time * 1.2) * 0.9),
      {
        time,
        angle: reduced ? 0 : Math.sin(time * 1.2) * 0.018 + touch * 0.06,
        reduced,
      },
    );
  }
  c.restore();
}

export const boat = new InkSprite(
  230,
  145,
  (p) => {
    p.shape(
      [
        [-101, 8],
        [-48, -8],
        [87, -5],
        [49, 43],
        [-58, 42],
      ],
      C.cream,
      { angular: true, double: true, seed: 1001, width: 1.7 },
    );
    p.shape(
      [
        [-98, 9],
        [-44, -20],
        [12, 4],
        [-48, 30],
      ],
      C.paper,
      { angular: true, width: 1.2, seed: 1002, base: 0.12 },
    );
    p.shape(
      [
        [-48, 30],
        [12, 4],
        [89, -5],
        [45, 44],
      ],
      C.yellow,
      { angular: true, width: 1.1, seed: 1003, base: 0.08 },
    );
    p.shape(
      [
        [-40, -13],
        [-21, -68],
        [40, -12],
      ],
      C.paper,
      { angular: true, width: 1.5, seed: 1004, base: 0.2 },
    );
    p.shape(
      [
        [-21, -68],
        [-16, -14],
        [40, -12],
      ],
      C.cream,
      { angular: true, width: 1, seed: 1005, base: 0.16 },
    );
    p.line(
      [
        [-17, -57],
        [18, -22],
      ],
      { width: 0.8, color: C.blue },
    );
    p.line(
      [
        [-24, -32],
        [-13, -20],
      ],
      { width: 0.9, color: C.red },
    );
    p.line(
      [
        [-88, 16],
        [-51, 37],
        [44, 39],
        [75, 11],
      ],
      { width: 0.9, color: C.honey },
    );
    p.shape(
      [
        [-55, 3],
        [-31, -4],
        [-22, 8],
        [-47, 16],
      ],
      C.red,
      { angular: true, width: 0.75, seed: 1006, base: 0.12 },
    );
    p.line(
      [
        [-52, 5],
        [-37, 9],
        [-25, 3],
      ],
      { width: 0.7 },
    );
    for (let i = 0; i < 4; i++)
      p.line(
        [
          [-18 + i * 8, 24],
          [-13 + i * 8, 23],
        ],
        { color: C.blue, width: 0.7 },
      );
  },
  { pivot: [115, 80], seed: 84 },
);
export const leafSprite = new InkSprite(
  175,
  165,
  (p) => {
    p.shape(
      [
        [0, 47],
        [-48, 25],
        [-64, -14],
        [-45, -49],
        [-2, -74],
        [41, -53],
        [63, -17],
        [47, 21],
      ],
      C.green,
      { double: true, width: 1.7, seed: 1101, shadow: C.teal, angle: -0.35 },
    );
    p.line(
      [
        [0, 69],
        [0, 28],
        [-1, -60],
      ],
      { width: 1.8, color: C.honey },
    );
    for (let i = 0; i < 6; i++) {
      const y = 24 - i * 14;
      p.line(
        [
          [0, y],
          [-18 - i * 3, y - 14],
          [-41 + Math.abs(i - 3) * 4, y - 20],
        ],
        { width: 1, color: "#627b55" },
      );
      p.line(
        [
          [0, y - 4],
          [22 + i, y - 20],
          [43 - Math.abs(i - 3) * 4, y - 24],
        ],
        { width: 0.95, color: "#627b55" },
      );
    }
    for (let i = 0; i < 4; i++)
      p.line(
        [
          [-35 + i * 18, -45],
          [-31 + i * 18, -53],
        ],
        { width: 0.9, color: C.yellow },
      );
    p.shape(
      [
        [42, 5],
        [50, -2],
        [55, 4],
        [49, 11],
      ],
      C.honey,
      { width: 0.75, seed: 1102 },
    );
  },
  { pivot: [87, 82], seed: 91 },
);
export const jar = new InkSprite(
  135,
  185,
  (p) => {
    p.shape(
      [
        [-31, -56],
        [-33, -41],
        [-42, -19],
        [-40, 67],
        [-30, 79],
        [30, 78],
        [41, 64],
        [41, -17],
        [32, -38],
        [32, -56],
      ],
      "#acc4bf",
      { seed: 1151, width: 1.5, double: true, base: 0.07 },
    );
    p.oval(0, -57, 33, 8, C.cream, { seed: 1152, width: 1.4, base: 0.15 });
    p.oval(0, -60, 27, 4, null, { width: 0.8 });
    p.oval(0, 45, 38, 7, C.teal, { width: 0.9, seed: 1153 });
    p.shape(
      [
        [-37, 45],
        [-36, 64],
        [-25, 74],
        [26, 74],
        [36, 64],
        [37, 46],
      ],
      C.teal,
      { seed: 1154, width: 0.7, base: 0.12 },
    );
    p.line(
      [
        [-28, -26],
        [-29, 28],
      ],
      { width: 2, color: C.paper },
    );
    p.line(
      [
        [31, -16],
        [32, 56],
      ],
      { width: 1.1, color: C.paper },
    );
    p.shape(
      [
        [-24, -12],
        [23, -12],
        [22, 19],
        [-23, 18],
      ],
      C.cream,
      { angular: true, width: 0.7, seed: 1155 },
    );
    p.line(
      [
        [-17, -5],
        [14, -6],
      ],
      { width: 0.7, color: C.honey },
    );
    p.line(
      [
        [-16, 2],
        [7, 2],
      ],
      { width: 0.7, color: C.honey },
    );
    p.oval(0, 73, 28, 3, null, { width: 0.6, outline: C.soft });
  },
  { pivot: [67, 88], seed: 95 },
);
export const bellSprite = new InkSprite(
  185,
  165,
  (p) => {
    p.oval(0, -42, 10, 12, C.honey, { width: 1.6, seed: 1201 });
    p.shape(
      [
        [-19, -31],
        [-35, -8],
        [-42, 37],
        [-60, 50],
        [-33, 60],
        [0, 64],
        [37, 59],
        [61, 50],
        [43, 35],
        [34, -8],
        [19, -30],
      ],
      C.yellow,
      { double: true, width: 1.9, seed: 1202, angle: 0.8, shadow: C.honey },
    );
    p.line(
      [
        [-18, -27],
        [-26, -2],
        [-31, 26],
        [-43, 47],
      ],
      { color: C.cream, width: 1.6 },
    );
    p.line(
      [
        [22, -19],
        [28, 8],
        [31, 30],
        [46, 48],
      ],
      { color: C.honey, width: 1.2 },
    );
    p.oval(0, 51, 59, 9, C.honey, { width: 1.5, seed: 1204, base: 0.07 });
    p.line(
      [
        [-47, 48],
        [-10, 55],
        [28, 54],
        [47, 48],
      ],
      { width: 0.8, color: C.cream },
    );
    p.shape(
      [
        [-8, -22],
        [0, -28],
        [8, -22],
        [4, -13],
        [-4, -13],
      ],
      C.red,
      { width: 0.8, seed: 1205 },
    );
    for (const x of [-24, 0, 24]) {
      p.oval(x, 29, 5, 5, null, { width: 0.85 });
      p.line(
        [
          [x - 2, 26],
          [x + 2, 31],
        ],
        { width: 0.65 },
      );
    }
  },
  { pivot: [92, 65], seed: 102 },
);
export const clapper = new InkSprite(
  55,
  75,
  (p) => {
    p.line(
      [
        [0, -29],
        [0, 12],
      ],
      { width: 2 },
    );
    p.oval(0, 17, 9, 10, C.red, { width: 1.4, seed: 1210 });
    p.line(
      [
        [-4, 12],
        [-5, 20],
      ],
      { width: 1, color: C.cream },
    );
  },
  { pivot: [27, 30], seed: 104 },
);
export const stoneSprite = new InkSprite(
  195,
  132,
  (p) => {
    p.shape(
      [
        [-72, 30],
        [-76, 2],
        [-53, -26],
        [-12, -44],
        [30, -36],
        [61, -17],
        [76, 17],
        [64, 35],
        [13, 45],
        [-42, 43],
      ],
      "#9898a2",
      { seed: 1301, width: 1.8, double: true, shadow: C.plum, angle: 0.2 },
    );
    p.shape(
      [
        [-69, 9],
        [-45, -15],
        [-15, -30],
        [24, -28],
        [53, -11],
        [27, -4],
        [-11, 7],
        [-45, 23],
      ],
      "#c2b5a8",
      { seed: 1302, width: 0.7, outline: C.soft, base: 0.08 },
    );
    p.line(
      [
        [-38, -25],
        [-33, -10],
        [-45, 0],
        [-34, 14],
      ],
      { width: 1.1, color: C.dark },
    );
    p.line(
      [
        [29, -16],
        [18, -1],
        [32, 13],
        [20, 34],
      ],
      { width: 1.05, color: C.plum },
    );
    for (let i = 0; i < 9; i++) {
      const x = -57 + i * 13,
        y = 15 + (i % 3) * 7;
      p.oval(x, y, 1.5 + (i % 2), 1.2, null, { width: 0.65, outline: C.ink });
    }
    p.line(
      [
        [-60, 32],
        [-25, 38],
        [14, 39],
        [57, 30],
      ],
      { width: 0.9, color: C.dark },
    );
  },
  { pivot: [97, 63], seed: 111 },
);
export const lampBase = new InkSprite(
  215,
  210,
  (p) => {
    p.oval(0, 67, 63, 16, C.teal, { seed: 1401, width: 1.6, double: true });
    p.oval(0, 63, 53, 11, C.green, { seed: 1402, width: 1 });
    p.shape(
      [
        [-8, 62],
        [-7, -39],
        [8, -42],
        [10, 62],
      ],
      C.honey,
      { seed: 1403, width: 1.4, angle: 0 },
    );
    p.line(
      [
        [-3, -28],
        [-2, 55],
      ],
      { width: 1.1, color: C.cream },
    );
    p.oval(0, -40, 18, 8, C.honey, { seed: 1404, width: 1.1 });
    p.line(
      [
        [49, 66],
        [75, 66],
        [83, 79],
        [100, 79],
      ],
      { width: 1.2 },
    );
    p.line(
      [
        [86, 79],
        [84, 90],
        [94, 91],
        [96, 79],
      ],
      { width: 1 },
    );
    p.line(
      [
        [-45, 67],
        [-20, 72],
        [25, 72],
        [47, 65],
      ],
      { width: 0.8, color: C.cream },
    );
  },
  { pivot: [105, 107], seed: 123 },
);
export const lampShade = new InkSprite(
  224,
  158,
  (p) => {
    p.shape(
      [
        [-38, -53],
        [-72, 27],
        [-87, 37],
        [-63, 48],
        [2, 55],
        [66, 47],
        [86, 38],
        [71, 26],
        [39, -53],
      ],
      C.red,
      { seed: 1421, width: 1.8, double: true, angle: 0.95, shadow: C.honey },
    );
    p.oval(0, -52, 40, 8, C.honey, { seed: 1422, width: 1.2, base: 0.15 });
    p.oval(0, 37, 85, 13, C.cream, { seed: 1423, width: 1.5, base: 0.25 });
    for (let i = 0; i < 7; i++) {
      const x = -31 + i * 10;
      p.line(
        [
          [x, -47],
          [x * 1.92, 30],
        ],
        { color: i % 2 ? C.rose : C.honey, width: 0.9 },
      );
    }
    for (let i = 0; i < 9; i++)
      p.oval(-58 + i * 14, 11, 3.3, 4.2, C.cream, {
        width: 0.7,
        seed: 1430 + i,
      });
    p.line(
      [
        [-61, 29],
        [0, 40],
        [64, 29],
      ],
      { color: C.cream, width: 1.15 },
    );
  },
  { pivot: [112, 70], seed: 124 },
);

export function bench(p, x, y, s = 1) {
  const c = p.c;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  p.shape(
    [
      [-101, -8],
      [-90, 52],
      [-79, 52],
      [-86, -7],
    ],
    C.honey,
    { angular: true, seed: 1501, width: 1.6 },
  );
  p.shape(
    [
      [76, -7],
      [69, 52],
      [82, 52],
      [93, -7],
    ],
    C.honey,
    { angular: true, seed: 1502, width: 1.6 },
  );
  p.shape(
    [
      [-121, -22],
      [91, -24],
      [120, -7],
      [-92, -4],
    ],
    C.honey,
    { angular: true, seed: 1503, width: 1.7, double: true },
  );
  for (let i = 0; i < 3; i++)
    p.line(
      [
        [-110 + i * 8, -18 + i * 5],
        [96 + i * 8, -19 + i * 5],
      ],
      { width: 0.8, color: C.cream },
    );
  p.line(
    [
      [-64, 5],
      [-67, 22],
      [61, 22],
      [66, 5],
    ],
    { width: 1.7 },
  );
  for (const x of [-80, 77]) p.oval(x, 0, 2, 2, C.ink, { width: 0.6 });
  c.restore();
}
export function tableArt(p, x, y, s = 1) {
  const c = p.c;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  p.shape(
    [
      [-351, 16],
      [-332, 213],
      [-309, 213],
      [-311, 19],
    ],
    C.honey,
    { angular: true, seed: 1601, width: 2, double: true },
  );
  p.shape(
    [
      [306, 15],
      [306, 210],
      [329, 210],
      [348, 14],
    ],
    C.honey,
    { angular: true, seed: 1602, width: 2, double: true },
  );
  p.line(
    [
      [-327, 117],
      [-316, 198],
    ],
    { width: 0.9, color: C.cream },
  );
  p.line(
    [
      [316, 56],
      [321, 197],
    ],
    { width: 0.9, color: C.cream },
  );
  p.shape(
    [
      [-361, -29],
      [346, -34],
      [394, 0],
      [356, 30],
      [-354, 31],
      [-398, 0],
    ],
    C.honey,
    {
      angular: true,
      seed: 1603,
      width: 2,
      double: true,
      base: 0.18,
      angle: 0.05,
    },
  );
  p.shape(
    [
      [-397, 0],
      [395, 0],
      [356, 30],
      [-354, 31],
    ],
    C.red,
    { angular: true, seed: 1604, width: 1.4, base: 0.06 },
  );
  for (let i = 0; i < 5; i++)
    p.line(
      [
        [-351 + i * 12, -25 + i * 5],
        [-139, -29 + i * 5],
        [131, -26 + i * 5],
        [347 - i * 11, -29 + i * 6],
      ],
      { width: 0.6, color: C.cream },
    );
  p.oval(-234, -9, 16, 4, null, { width: 0.7, outline: C.red });
  p.oval(192, -9, 23, 3, null, { width: 0.7, outline: C.red });
  p.shape(
    [
      [-183, 41],
      [-178, 96],
      [96, 96],
      [102, 40],
    ],
    C.cream,
    { angular: true, seed: 1610, width: 1.5 },
  );
  p.oval(-39, 61, 9, 4, C.honey, { width: 1, seed: 1611 });
  p.line(
    [
      [-40, 61],
      [-39, 66],
    ],
    { width: 0.7 },
  );
  for (let i = 0; i < 3; i++)
    p.line(
      [
        [-167, 49 + i * 4],
        [-136, 49 + i * 4],
      ],
      { width: 0.6, color: C.honey },
    );
  c.restore();
}

export const tableSprite = new InkSprite(900, 285, (p) => tableArt(p, 0, 0), {
  pivot: [450, 44],
  seed: 135,
});

export function windowArt(p, x, y, s = 1, attic = false) {
  const c = p.c;
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  p.shape(
    [
      [-112, 96],
      [-109, -64],
      [-76, -105],
      [0, -123],
      [78, -102],
      [113, -65],
      [112, 97],
    ],
    C.honey,
    { seed: 1701, width: 2, double: true, base: 0.1 },
  );
  p.shape(
    [
      [-98, 83],
      [-96, -61],
      [-68, -91],
      [0, -110],
      [67, -89],
      [99, -59],
      [98, 82],
    ],
    "#b8c5d0",
    { seed: 1702, width: 1.2, base: 0.09 },
  );
  cloud(p, -48, -57, 35);
  cloud(p, 61, -28, 27);
  p.oval(56, -67, 15, 16, C.yellow, { seed: 1703, width: 1 });
  if (attic) {
    p.line(
      [
        [-87, 81],
        [-80, 4],
        [-62, -17],
        [-69, -38],
      ],
      { width: 2 },
    );
    p.line(
      [
        [-79, 18],
        [-54, 8],
        [-37, -13],
      ],
      { width: 1.3 },
    );
    smallLeaf(p, -39, -12, 16, 0.8);
    smallLeaf(p, -61, -23, 16, -0.7);
    smallLeaf(p, -77, 20, 18, -0.6);
  }
  p.line(
    [
      [0, -109],
      [1, 83],
    ],
    { width: 2.5 },
  );
  p.line(
    [
      [-97, -4],
      [98, -3],
    ],
    { width: 2.4 },
  );
  p.shape(
    [
      [-120, 84],
      [120, 83],
      [134, 97],
      [130, 110],
      [-129, 112],
      [-138, 99],
    ],
    C.cream,
    { angular: true, seed: 1705, width: 1.8, double: true },
  );
  p.line(
    [
      [-94, -44],
      [-80, -57],
    ],
    { width: 1.6, color: C.paper },
  );
  p.line(
    [
      [18, 58],
      [41, 31],
    ],
    { width: 1.6, color: C.paper },
  );
  p.line(
    [
      [11, -85],
      [33, -96],
    ],
    { width: 1.6, color: C.paper },
  );
  bird(p, -63, -70, 6);
  c.restore();
}

export function pencilProp(p, x, y, a = 0, s = 1) {
  const c = p.c;
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.scale(s, s);
  p.shape(
    [
      [-4, -47],
      [5, -47],
      [5, 34],
      [-5, 34],
    ],
    C.yellow,
    { angular: true, width: 0.8, seed: 1801 },
  );
  p.shape(
    [
      [-5, 34],
      [0, 48],
      [5, 34],
    ],
    C.cream,
    { angular: true, width: 0.8, seed: 1802 },
  );
  p.shape(
    [
      [-1, 44],
      [0, 48],
      [2, 44],
    ],
    C.ink,
    { angular: true, width: 0.5, seed: 1803 },
  );
  p.shape(
    [
      [-5, -47],
      [5, -47],
      [5, -59],
      [-5, -59],
    ],
    C.red,
    { angular: true, width: 0.8, seed: 1804 },
  );
  p.line(
    [
      [0, -41],
      [0, 31],
    ],
    { width: 0.8, color: C.cream },
  );
  c.restore();
}
