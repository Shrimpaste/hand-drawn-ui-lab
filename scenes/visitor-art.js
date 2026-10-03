import { InkSprite, palette as C } from "../primitives/living-ink.js";

// Independent silhouettes and anatomy; none of these drawings uses the reference atlas.
const wool = "#c8bbac",
  cream = "#e7dcc6",
  pink = "#d8aaa2";
const sage = "#8ea69d",
  feather = "#71938d",
  honey = "#d1ac78";
const sprite = (w, h, pivot, seed, draw) =>
  new InkSprite(w, h, draw, { pivot, seed });
function scarf(color, seed) {
  return sprite(62, 47, [9, 11], seed, (p) => {
    p.shape(
      [
        [-2, -2],
        [8, -5],
        [24, 6],
        [36, 16],
        [33, 24],
        [20, 16],
        [7, 7],
      ],
      color,
      { seed, width: 0.6 },
    );
    p.line(
      [
        [8, 0],
        [22, 9],
        [29, 16],
      ],
      { color: cream, width: 0.65 },
    );
    for (let i = 0; i < 4; i++)
      p.line(
        [
          [27 + i * 2, 21],
          [26 + i * 2, 25],
        ],
        { color, width: 0.5 },
      );
  });
}
const rabbitBody = sprite(114, 137, [57, 114], 851, (p) => {
  p.shape(
    [
      [-27, -9],
      [-31, -26],
      [-25, -46],
      [-32, -61],
      [-31, -79],
      [-17, -91],
      [2, -94],
      [20, -89],
      [32, -74],
      [30, -55],
      [23, -42],
      [30, -24],
      [25, -8],
      [0, 0],
    ],
    wool,
    { seed: 852, base: 0.32, width: 0.85, angle: -0.24 },
  );
  p.shape(
    [
      [-20, -12],
      [-21, -31],
      [-10, -42],
      [10, -43],
      [21, -32],
      [19, -12],
      [0, -5],
    ],
    cream,
    { seed: 853, width: 0.55, base: 0.34 },
  );
  p.oval(-9, -54, 11, 8, "#ebdcc5", { seed: 854, width: 0.3 });
  p.oval(9, -54, 11, 8, "#ebdcc5", { seed: 855, width: 0.3 });
  p.shape(
    [
      [-3.5, -59],
      [3.5, -59],
      [0, -55],
    ],
    pink,
    { seed: 856, width: 0.45, base: 0.55 },
  );
  p.line(
    [
      [0, -55],
      [0, -52],
    ],
    { color: "#ac8d7d", width: 0.6 },
  );
  for (const s of [-1, 1]) {
    p.line(
      [
        [s * 15, -55],
        [s * 28, -58],
      ],
      { color: "#b09b86", width: 0.5 },
    );
    p.line(
      [
        [s * 16, -52],
        [s * 29, -51],
      ],
      { color: "#b09b86", width: 0.5 },
    );
    for (let i = 0; i < 6; i++)
      p.line(
        [
          [s * (24 + (i % 2)), -32 + i * 3],
          [s * (26 + (i % 2)), -30 + i * 3],
        ],
        { color: "#b4a18d", width: 0.45 },
      );
  }
  p.line(
    [
      [-24, -41],
      [-10, -37],
      [11, -37],
      [24, -42],
    ],
    { color: "#91aeb4", width: 4 },
  );
  p.oval(18, -39, 3, 3, "#a5b9b5", { seed: 857, width: 0.4 });
  p.line(
    [
      [-19, -15],
      [-4, -10],
      [14, -13],
    ],
    { color: "#c2b19a", width: 0.6 },
  );
});
function rabbitEar(side) {
  return sprite(53, 83, [27, 71], side === -1 ? 858 : 859, (p) => {
    const bent = side === 1 ? 6 : 0;
    p.shape(
      [
        [-7, 3],
        [-11, -18],
        [-11, -45],
        [-7, -62],
        [0, -66],
        [7, -57 + bent],
        [10, -38 + bent],
        [7, -13],
        [6, 2],
      ],
      wool,
      { seed: 860 + side, width: 0.75, base: 0.34, angle: -1.1 },
    );
    p.shape(
      [
        [-3, -5],
        [-6, -24],
        [-5, -48],
        [-1, -57],
        [3, -50 + bent],
        [5, -29],
        [3, -6],
      ],
      pink,
      { seed: 863 + side, width: 0.4, base: 0.24, angle: -1.5 },
    );
    p.line(
      [
        [-7, -36],
        [-7, -51],
        [-4, -59],
      ],
      { color: "#ede1c8", width: 0.7 },
    );
    p.line(
      [
        [3, -18],
        [4, -32],
        [3, -42],
      ],
      { color: "#c2948a", width: 0.45 },
    );
    for (let i = 0; i < 3; i++)
      p.line(
        [
          [-7 + i * 4, 0],
          [-6 + i * 4, -4],
        ],
        { color: "#af9c8d", width: 0.4 },
      );
  });
}
const rabbitPaw = sprite(35, 37, [17, 7], 867, (p) => {
  p.shape(
    [
      [-4, -1],
      [-9, 9],
      [-7, 21],
      [0, 25],
      [7, 21],
      [8, 9],
      [3, 0],
    ],
    wool,
    { seed: 868, width: 0.6 },
  );
  p.oval(0, 19, 4, 2.6, pink, { seed: 869, width: 0.3, base: 0.2 });
  p.line(
    [
      [-4, 19],
      [-4, 23],
    ],
    { color: "#b1a08c", width: 0.5 },
  );
  p.line(
    [
      [3, 20],
      [3, 23],
    ],
    { color: "#b1a08c", width: 0.5 },
  );
});
const rabbitFoot = sprite(39, 23, [20, 15], 870, (p) => {
  p.oval(0, -2, 12, 7, cream, { seed: 871, width: 0.6, base: 0.4 });
  p.oval(6, -1, 4.5, 2.4, pink, { seed: 872, width: 0.3, base: 0.25 });
  p.line(
    [
      [-4, 0],
      [-4, 4],
    ],
    { color: "#b1a08c", width: 0.5 },
  );
  p.line(
    [
      [0, 1],
      [0, 4],
    ],
    { color: "#b1a08c", width: 0.5 },
  );
});

const owlBody = sprite(124, 129, [62, 110], 881, (p) => {
  p.shape(
    [
      [-28, -9],
      [-38, -33],
      [-36, -60],
      [-30, -80],
      [-15, -90],
      [0, -85],
      [18, -90],
      [33, -75],
      [38, -52],
      [35, -29],
      [25, -8],
      [3, 0],
    ],
    sage,
    { seed: 882, width: 0.9, base: 0.28, angle: 0.6 },
  );
  // Two soft face discs join into a heart, while the chest follows the rounded belly.
  p.shape(
    [
      [-27, -69],
      [-18, -79],
      [-3, -72],
      [0, -64],
      [4, -74],
      [19, -79],
      [29, -67],
      [26, -46],
      [13, -38],
      [0, -33],
      [-13, -40],
      [-27, -48],
    ],
    cream,
    { seed: 883, width: 0.5, base: 0.38 },
  );
  p.shape(
    [
      [-19, -31],
      [0, -38],
      [21, -29],
      [22, -13],
      [7, -5],
      [-10, -7],
      [-22, -16],
    ],
    "#c9c7a3",
    { seed: 884, width: 0.4, base: 0.27 },
  );
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 4 - row; i++) {
      const x = -13 + i * 9 + row * 4,
        y = -24 + row * 6;
      p.line(
        [
          [x - 2, y],
          [x, y + 3],
          [x + 2, y],
        ],
        { color: row % 2 ? "#a9aa8c" : "#bdad88", width: 0.65 },
      );
    }
  for (const s of [-1, 1]) {
    p.line(
      [
        [s * 24, -68],
        [s * 28, -60],
        [s * 27, -51],
      ],
      { color: "#d8d1b8", width: 0.5 },
    );
    p.line(
      [
        [s * 29, -39],
        [s * 32, -29],
        [s * 29, -22],
      ],
      { color: feather, width: 0.5 },
    );
  }
  p.line(
    [
      [-23, -29],
      [-6, -32],
      [14, -31],
      [24, -27],
    ],
    { color: "#bd8872", width: 2.8 },
  );
  p.oval(17, -28, 3.3, 2.7, "#cca18a", { seed: 885, width: 0.4 });
});
const owlWing = sprite(48, 49, [24, 7], 886, (p) => {
  p.shape(
    [
      [-1, -2],
      [-12, 3],
      [-13, 16],
      [-8, 30],
      [0, 37],
      [5, 25],
      [9, 10],
      [5, 0],
    ],
    feather,
    { seed: 887, width: 0.65, base: 0.3 },
  );
  for (let i = 0; i < 4; i++)
    p.line(
      [
        [-8 + i * 4, 9],
        [-7 + i * 3, 22],
        [-2 + i, 30],
      ],
      { color: "#b5bca8", width: 0.65 },
    );
  p.line(
    [
      [-10, 8],
      [-10, 17],
      [-6, 27],
    ],
    { color: "#64857f", width: 0.5 },
  );
});
const owlFoot = sprite(36, 23, [18, 14], 889, (p) => {
  p.line(
    [
      [0, -7],
      [0, 0],
      [-8, 3],
    ],
    { color: honey, width: 2.5 },
  );
  p.line(
    [
      [0, -1],
      [2, 3],
      [10, 3],
    ],
    { color: honey, width: 2.4 },
  );
  p.line(
    [
      [0, 0],
      [1, 5],
    ],
    { color: honey, width: 2.3 },
  );
  for (const [x, y] of [
    [-8, 3],
    [10, 3],
    [1, 5],
  ])
    p.line(
      [
        [x, y],
        [x + 1, y - 2],
      ],
      { color: "#b4976f", width: 0.55 },
    );
});
function owlTuft(side) {
  return sprite(40, 40, [20, 29], side === -1 ? 891 : 892, (p) => {
    p.shape(
      [
        [-7, 3],
        [-10, -18],
        [-2, -11],
        [4, -23],
        [7, -7],
        [5, 3],
      ],
      sage,
      { seed: 893 + side, width: 0.6 },
    );
    p.line(
      [
        [-4, -13],
        [-2, -3],
      ],
      { color: "#bbc4ae", width: 0.65 },
    );
  });
}
export const visitorArt = {
  rabbit: {
    body: rabbitBody,
    armL: rabbitPaw,
    armR: rabbitPaw,
    footL: rabbitFoot,
    footR: rabbitFoot,
    earL: rabbitEar(-1),
    earR: rabbitEar(1),
    scarf: scarf("#94b0b5", 874),
  },
  owl: {
    body: owlBody,
    armL: owlWing,
    armR: owlWing,
    footL: owlFoot,
    footR: owlFoot,
    earL: owlTuft(-1),
    earR: owlTuft(1),
    scarf: scarf("#bd8872", 895),
  },
};
