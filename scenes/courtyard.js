import { InkSprite, palette as C } from "../primitives/living-ink.js";
import { courtyardPigments as M } from "../primitives/pigments.js";
import { random } from "../primitives/sketch.js";
import { handwriting } from "../primitives/handwriting.js";

import {
  groundPoint,
  platform,
  stations,
  kioskPoint,
  benchPoint,
} from "./courtyard-layout.js";
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
  const roof = [M.roofRed, M.roofGold, M.roofTeal][index],
    station = stations[index];
  const q = (x, y, d = 0) => kioskPoint(station, x, y, d);
  const plane = (points, color, seed, options = {}) =>
    p.shape(
      points.map((a) => q(...a)),
      color,
      { angular: true, seed, width: 0.75, ...options },
    );
  // Width follows the paving's U tangent; depth follows V; height stays vertical.
  // Back edge is upstream (negative depth), front edge is the same picture plane.
  plane(
    [
      [-111, 151, -24],
      [111, 151, -24],
      [111, 151, 25],
      [-111, 151, 25],
    ],
    M.woodLight,
    72110 + index,
  );
  plane(
    [
      [-111, 151, 25],
      [111, 151, 25],
      [111, 168, 25],
      [-111, 168, 25],
    ],
    M.wood,
    72120 + index,
  );
  plane(
    [
      [111, 151, -24],
      [111, 151, 25],
      [111, 168, 25],
      [111, 168, -24],
    ],
    M.woodGrain,
    72130 + index,
  );
  plane(
    [
      [101, -106, 0],
      [101, -106, -25],
      [101, 151, -25],
      [101, 151, 0],
    ],
    M.wood,
    72140 + index,
  );
  for (const x of [-103, 103]) {
    plane(
      [
        [x - 5, -112],
        [x + 5, -112],
        [x + 5, 151],
        [x - 5, 151],
      ],
      M.woodLight,
      72150 + index + x,
    );
    for (let j = 0; j < 6; j++)
      p.line([q(x - 2, -100 + j * 38), q(x + 1, -88 + j * 38)], {
        color: M.woodGrain,
        width: 0.6,
      });
    p.dot(...q(x, 125), 1.2, M.woodGrain);
  }
  // Sloping shed roof: a real front/back quadrilateral, with a visible eave.
  plane(
    [
      [-123, -113, 8],
      [123, -113, 8],
      [123, -159, -54],
      [-123, -159, -54],
    ],
    roof,
    72210 + index,
    { base: 0.3 },
  );
  plane(
    [
      [-123, -113, 8],
      [123, -113, 8],
      [123, -103, 8],
      [-123, -103, 8],
    ],
    M.roofEdge,
    72220 + index,
  );
  plane(
    [
      [123, -113, 8],
      [123, -159, -54],
      [123, -149, -54],
      [123, -103, 8],
    ],
    M.roofEdge,
    72221 + index,
  );
  for (let row = 0; row < 3; row++)
    for (let j = 0; j < 9; j++) {
      const d = -47 + row * 18,
        y = -154 + row * 13,
        x = -117 + j * 27;
      p.line([q(x, y, d), q(x + 22, y, d), q(x + 22, y + 10, d + 13)], {
        color: index === 2 ? M.iron : M.woodGrain,
        width: 0.55,
      });
    }
  plane(
    [
      [-99, -105],
      [99, -105],
      [99, -79],
      [-99, -79],
    ],
    M.leafLight,
    72230 + index,
  );
  for (let i = 0; i < 10; i++) {
    const x = -89 + i * 20;
    p.line([q(x, -104), q(x, -80)], { color: M.leafShade, width: 0.75 });
    const [cx, cy] = q(x, -79);
    p.oval(cx, cy, 9, 3.3, M.leafLight, {
      seed: 72300 + i + index * 20,
      width: 0.5,
    });
  }
  p.line([q(-96, 157, 25), q(102, 157, 25)], { color: C.cream, width: 1 });
  const [nx, ny] = q(-90, 153, 25);
  handwriting(c, "0" + (index + 1), nx, ny, { size: 12, color: M.woodGrain });
}
export const kiosks = stations.map(
  (_, i) =>
    new InkSprite(382, 430, (p, c) => kioskArt(p, c, i), {
      pivot: [190, 217],
      seed: 7200 + i,
      variants: 1,
    }),
);
export const courtyardBench = new InkSprite(
  246,
  194,
  (p) => {
    const q = benchPoint;
    // Rear legs and backrest stand behind the seat; all slats follow U / V.
    for (const x of [-72, 72]) {
      p.line([q(x, 69, -35), q(x, -62, -35)], { color: M.iron, width: 3 });
      p.line([q(x, 69, 0), q(x, -8, 0), q(x, -19, -11), q(x, -17, -25)], {
        color: M.iron,
        width: 3,
      });
    }
    for (let row = 0; row < 3; row++) {
      const y = -62 + row * 13;
      p.shape(
        [q(-82, y, -35), q(82, y, -35), q(82, y + 9, -35), q(-82, y + 9, -35)],
        M.wood,
        { angular: true, seed: 73100 + row, width: 0.65 },
      );
      p.line([q(-77, y + 3, -35), q(76, y + 3, -35)], {
        color: M.woodLight,
        width: 0.8,
      });
      for (const x of [-73, 73]) p.dot(...q(x, y + 4, -35), 0.9, M.woodGrain);
    }
    for (let row = 0; row < 4; row++) {
      const d = -35 + row * 9;
      p.shape(
        [q(-80, -8, d), q(80, -8, d), q(80, -8, d + 7), q(-80, -8, d + 7)],
        M.woodLight,
        { angular: true, seed: 73110 + row, width: 0.6 },
      );
      p.line([q(-62, -8, d + 2), q(-20, -8, d + 3), q(48, -8, d + 2)], {
        color: M.woodGrain,
        width: 0.5,
      });
    }
    p.shape([q(-80, -8, 0), q(80, -8, 0), q(80, 1, 0), q(-80, 1, 0)], M.wood, {
      angular: true,
      seed: 73120,
      width: 0.6,
    });
    p.line([q(-72, 42, 0), q(72, 42, 0)], { color: M.iron, width: 1.3 });
  },
  { pivot: [130, 99], seed: 7300, variants: 1 },
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
