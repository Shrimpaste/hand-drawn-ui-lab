import { InkSprite, palette as C } from "../primitives/living-ink.js";
import { courtyardPigments as M } from "../primitives/pigments.js";
import { random } from "../primitives/sketch.js";
import { handwriting } from "../primitives/handwriting.js";

import { groundPoint, platform, stations } from "./courtyard-layout.js";
export { stations, gardenBench, courtyardProps } from "./courtyard-layout.js";

function foliage(p, x, y, size, seed) {
  const r = random(seed);
  p.oval(x + 8, y + 7, size * 0.8, size * 0.22, "#c5c4a0", {
    width: 0.3,
    seed,
    base: 0.08,
  });
  for (let i = 0; i < 17; i++) {
    const a = r() * Math.PI * 2,
      rad = Math.sqrt(r()) * size * 0.62;
    const xx = x + Math.cos(a) * rad,
      yy = y - 12 + Math.sin(a) * rad * 0.57;
    p.oval(xx, yy, 9 + r() * 12, 7 + r() * 9, i % 4 ? M.foliage : M.leafLight, {
      seed: seed + i * 3,
      width: 0.4,
      angle: r(),
      base: 0.25,
    });
    if (i % 3 === 0)
      p.line(
        [
          [xx - 3, yy + 3],
          [xx + 2, yy - 4],
        ],
        { color: M.leafShade, width: 0.45 },
      );
  }
}
function grass(p, x, y, seed) {
  for (let j = 0; j < 3; j++)
    p.line(
      [
        [x + (j - 1) * 3, y],
        [x + (j - 1) * 5, y - 5 - (j % 2) * 3],
      ],
      { color: M.grass, width: 0.65 },
    );
  if (seed % 3 === 0)
    p.oval(x + 8, y - 5, 2.2, 1.6, M.flower, { width: 0.3, seed });
}

export const courtyardGround = new InkSprite(
  1120,
  820,
  (p, c) => {
    // The platform has thickness, with a different warm pigment on the visible faces.
    p.shape(
      [
        [110, 456],
        [616, 324],
        [1030, 575],
        [515, 765],
        [111, 484],
      ],
      "#d6c9aa",
      { angular: true, seed: 70101, width: 0.8, base: 0.16 },
    );
    p.shape(
      [
        [111, 456],
        [514, 725],
        [515, 765],
        [111, 484],
      ],
      M.platformSide,
      { angular: true, seed: 70102, width: 0.6, base: 0.25 },
    );
    p.shape(
      [
        [514, 725],
        [1030, 544],
        [1030, 575],
        [515, 765],
      ],
      M.platformShade,
      { angular: true, seed: 70103, width: 0.6, base: 0.23 },
    );
    p.shape(platform, M.paving, {
      angular: true,
      seed: 70104,
      width: 0.8,
      base: 0.2,
      angle: 0.35,
    });
    const r = random(70201);
    // Unequal paving blocks in two ground directions establish a shared projection.
    for (let row = 0; row < 10; row++)
      for (let col = 0; col < 15; col++) {
        const u = 0.012 + ((col + 0.1 * (row % 2)) / 15) * 0.96,
          v = 0.018 + (row / 10) * 0.95;
        const a = 0.047 + r() * 0.01,
          b = 0.04 + r() * 0.01;
        const corners = [
          [u, v],
          [u + a, v],
          [u + a, v + b],
          [u, v + b],
        ]
          .map(([uu, vv]) => groundPoint(uu, vv))
          .map((p) => [p.x, p.y]);
        p.shape(
          corners,
          (row + col) % 7 === 0
            ? "#c6c9ac"
            : (row + col) % 4 === 0
              ? "#ded1b2"
              : null,
          {
            angular: true,
            width: 0.45,
            outline: "#bdb69b",
            seed: 70300 + row * 18 + col,
            base: 0.1,
          },
        );
      }
    // A winding strip of garden beds; edges share the same depth rather than a flat icon.
    p.shape(
      [
        [149, 415],
        [420, 346],
        [490, 374],
        [224, 451],
      ],
      M.bed,
      { angular: true, seed: 70401, width: 0.6, base: 0.2 },
    );
    p.shape(
      [
        [149, 415],
        [224, 451],
        [224, 466],
        [149, 430],
      ],
      "#c3b599",
      { angular: true, seed: 70402, width: 0.5 },
    );
    for (let i = 0; i < 18; i++)
      grass(p, 170 + i * 15, 423 - i * 3.1, 70410 + i);
    p.shape(
      [
        [856, 594],
        [996, 545],
        [1013, 561],
        [877, 616],
      ],
      M.bedLight,
      { angular: true, seed: 70501, width: 0.5 },
    );
    for (let i = 0; i < 11; i++) grass(p, 872 + i * 12, 599 - i * 4, 70510 + i);
    // Weathered low garden wall at the rear and a few plants beyond it.
    p.shape(
      [
        [98, 344],
        [586, 218],
        [595, 236],
        [105, 363],
      ],
      "#ddd1b3",
      { angular: true, seed: 70701, width: 0.6 },
    );
    p.shape(
      [
        [105, 363],
        [595, 236],
        [595, 302],
        [106, 427],
      ],
      M.wall,
      { angular: true, seed: 70702, width: 0.6, base: 0.12 },
    );
    p.shape(
      [
        [595, 236],
        [660, 276],
        [660, 337],
        [595, 302],
      ],
      M.wallShade,
      { angular: true, seed: 70703, width: 0.6 },
    );
    for (let i = 0; i < 21; i++) {
      const x = 112 + i * 22,
        y = 363 - i * 5.72;
      p.line(
        [
          [x, y + 2],
          [x, y + 25],
        ],
        { color: "#c2b79b", width: 0.5 },
      );
      p.line(
        [
          [x + 10, y + 28],
          [x + 10, y + 52],
        ],
        { color: "#c2b79b", width: 0.5 },
      );
    }
    p.line(
      [
        [110, 389],
        [591, 264],
      ],
      { color: "#c5baa1", width: 0.55 },
    );
    foliage(p, 154, 337, 51, 70801);
    foliage(p, 447, 259, 43, 70830);
    foliage(p, 933, 522, 34, 70880);
    // Cut leaves, tiny fallen petals and partial pencil marks make the world inhabited.
    for (let i = 0; i < 18; i++) {
      const x = 205 + r() * 680,
        y = 519 + r() * 136;
      if (i % 3)
        p.line(
          [
            [x, y],
            [x + 4, y - 1],
          ],
          { color: "#b9b18e", width: 0.5 },
        );
      else p.oval(x, y, 2, 1, "#d7ad97", { seed: 70900 + i, width: 0.3 });
    }
  },
  { pivot: [0, 0], seed: 70000, variants: 1 },
);

function kioskArt(p, c, index) {
  const roof = [M.roofRed, M.roofGold, M.roofTeal][index];
  // Posts, side face, plinth and roof thickness give each exhibition a small building.
  if (p.consume(290) > 0.6) {
    c.save();
    c.fillStyle = "#a99b7526";
    c.beginPath();
    c.ellipse(10, 171, 127, 17, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  p.shape(
    [
      [-107, 127],
      [106, 119],
      [137, 140],
      [-77, 157],
    ],
    "#d1c4a1",
    { angular: true, seed: 72110 + index, width: 0.7 },
  );
  p.shape(
    [
      [-77, 157],
      [137, 140],
      [137, 156],
      [-78, 173],
    ],
    "#bcae91",
    { angular: true, seed: 72120 + index, width: 0.6 },
  );
  p.shape(
    [
      [106, 119],
      [137, 140],
      [137, 156],
      [106, 134],
    ],
    "#b4b398",
    { angular: true, seed: 72130 + index, width: 0.6 },
  );
  for (const x of [-102, 102]) {
    p.shape(
      [
        [x - 5, -118],
        [x + 6, -117],
        [x + 5, 132],
        [x - 6, 132],
      ],
      M.woodLight,
      { angular: true, seed: 72150 + index + x, width: 0.65 },
    );
    for (let j = 0; j < 5; j++)
      p.line(
        [
          [x - 2, -92 + j * 40],
          [x + 2, -83 + j * 40],
        ],
        { color: M.woodGrain, width: 0.5 },
      );
  }
  p.shape(
    [
      [-117, -118],
      [-77, -165],
      [119, -173],
      [152, -130],
      [122, -113],
    ],
    roof,
    { angular: true, seed: 72210 + index, width: 1, base: 0.25, angle: 0.13 },
  );
  p.shape(
    [
      [-117, -118],
      [122, -113],
      [152, -130],
      [137, -120],
      [122, -102],
      [-118, -107],
    ],
    M.roofEdge,
    { angular: true, seed: 72220 + index, width: 0.6 },
  );
  for (let row = 0; row < 3; row++)
    for (let j = 0; j < 8; j++) {
      const x = -79 + j * 27 + row * 2,
        y = -159 + row * 13;
      p.line(
        [
          [x, y],
          [x + 20, y + 1],
          [x + 23, y + 10],
        ],
        { color: index === 2 ? M.iron : M.woodGrain, width: 0.5 },
      );
    }
  p.shape(
    [
      [-101, -108],
      [101, -104],
      [98, -76],
      [-100, -79],
    ],
    M.leafLight,
    { angular: true, seed: 72230 + index, width: 0.5 },
  );
  for (let i = 0; i < 10; i++)
    p.line(
      [
        [-92 + i * 20, -106],
        [-94 + i * 20, -81],
      ],
      { color: M.leafShade, width: 0.7 },
    );
  for (let i = 0; i < 10; i++)
    p.oval(-89 + i * 20, -79, 9, 4, M.leafLight, {
      seed: 72300 + i + index * 20,
      width: 0.4,
    });
  p.line(
    [
      [-84, 137],
      [102, 130],
    ],
    { color: "#f0e2c4", width: 1 },
  );
  handwriting(c, "0" + (index + 1), -86, 140, { size: 12, color: "#9a8d77" });
}
export const kiosks = stations.map(
  (_, i) =>
    new InkSprite(336, 386, (p, c) => kioskArt(p, c, i), {
      pivot: [150, 193],
      seed: 7200 + i,
      variants: 1,
    }),
);

export const courtyardBench = new InkSprite(
  230,
  143,
  (p) => {
    // Three-quarter seat, visible slats, front and back feet, curved iron supports.
    for (const x of [-63, 62]) {
      p.line(
        [
          [x, -14],
          [x + 14, 17],
          [x + 10, 56],
        ],
        { color: M.iron, width: 3 },
      );
      p.line(
        [
          [x + 14, 17],
          [x + 42, 39],
          [x + 39, 69],
        ],
        { color: M.iron, width: 3 },
      );
    }
    for (let i = 0; i < 3; i++)
      p.shape(
        [
          [-77, -50 + i * 12],
          [68, -65 + i * 12],
          [71, -56 + i * 12],
          [-75, -41 + i * 12],
        ],
        M.wood,
        { angular: true, width: 0.55, seed: 73100 + i },
      );
    for (let i = 0; i < 3; i++)
      p.shape(
        [
          [-71, -15 + i * 8],
          [73, -30 + i * 8],
          [104, -10 + i * 8],
          [-40, 5 + i * 8],
        ],
        M.woodLight,
        { angular: true, width: 0.5, seed: 73110 + i },
      );
    p.line(
      [
        [-40, 23],
        [102, 7],
      ],
      { color: M.woodGrain, width: 0.7 },
    );
    for (const x of [-64, 60])
      for (let i = 0; i < 3; i++)
        p.dot(x, -45 + i * 12 - (x > 0 ? 13 : 0), 1, M.woodGrain);
  },
  { pivot: [110, 71], seed: 7300, variants: 1 },
);

export const lantern = new InkSprite(
  120,
  252,
  (p) => {
    p.oval(2, 104, 27, 6, "#c8c1a4", { width: 0.4, seed: 74010 });
    p.shape(
      [
        [-8, 100],
        [-5, 87],
        [5, 87],
        [9, 100],
      ],
      "#afbaa5",
      { width: 0.65, seed: 74011 },
    );
    p.line(
      [
        [0, 88],
        [0, -82],
        [6, -97],
        [19, -103],
        [29, -96],
      ],
      { color: M.iron, width: 3.6 },
    );
    p.shape(
      [
        [20, -98],
        [21, -71],
        [37, -73],
        [40, -100],
      ],
      "#d9c392",
      { angular: true, width: 0.7, seed: 74012 },
    );
    p.shape(
      [
        [18, -101],
        [27, -114],
        [40, -101],
      ],
      M.ironLight,
      { angular: true, width: 0.7, seed: 74013 },
    );
    p.shape(
      [
        [20, -74],
        [39, -76],
        [35, -67],
        [24, -66],
      ],
      M.iron,
      { angular: true, width: 0.7, seed: 74014 },
    );
    p.line(
      [
        [27, -98],
        [28, -75],
      ],
      { color: "#bbaa86", width: 0.65 },
    );
    p.dot(31, -86, 2.6, "#e4c57e");
  },
  { pivot: [45, 136], seed: 7400, variants: 1 },
);

export const wateringCan = new InkSprite(
  123,
  93,
  (p) => {
    p.shape(
      [
        [-24, -9],
        [-21, 20],
        [9, 23],
        [19, 12],
        [14, -12],
      ],
      M.roofTeal,
      { width: 0.75, seed: 75101 },
    );
    p.oval(-3, -10, 19, 6, "#bad0b8", { width: 0.6, seed: 75102 });
    p.shape(
      [
        [13, 5],
        [42, -15],
        [47, -10],
        [23, 17],
      ],
      M.ironLight,
      { angular: true, width: 0.5, seed: 75103 },
    );
    p.oval(47, -14, 6, 9, "#bacab3", { width: 0.5, seed: 75104 });
    p.line(
      [
        [-22, -5],
        [-38, -10],
        [-43, 6],
        [-30, 17],
        [-24, 13],
      ],
      { color: M.iron, width: 4 },
    );
    for (let i = 0; i < 6; i++)
      p.dot(46 + (i % 2) * 3, -18 + Math.floor(i / 2) * 4, 0.7, M.iron);
    p.line(
      [
        [-16, -3],
        [-14, 14],
        [1, 18],
      ],
      { color: "#d2dac3", width: 0.8 },
    );
  },
  { pivot: [53, 46], seed: 7500 },
);
