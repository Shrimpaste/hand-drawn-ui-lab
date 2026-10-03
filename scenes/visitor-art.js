import { InkSprite, palette as C } from "../primitives/living-ink.js";
import { courtyardPigments as M } from "../primitives/pigments.js";

// Independent silhouettes and anatomy; none of these drawings uses the reference atlas.
const wool = M.rabbitFur,
  cream = M.rabbitCream,
  pink = M.rabbitEar;
const sage = M.owlBody,
  feather = M.owlWing,
  honey = M.owlBelly;
const sprite = (w, h, pivot, seed, draw) =>
  new InkSprite(w, h, draw, { pivot, seed });

export function fieldBag(seed, color = "#b78643", notebook = false) {
  return sprite(45, 43, [22, 20], seed, (p) => {
    p.shape(
      [
        [-11, -9],
        [-9, -15],
        [11, -14],
        [14, -8],
        [12, 12],
        [3, 16],
        [-11, 11],
      ],
      color,
      { seed, width: 0.7, base: 0.34 },
    );
    p.shape(
      [
        [-11, -9],
        [13, -8],
        [10, 1],
        [-2, 4],
        [-10, 1],
      ],
      notebook ? cream : "#d3b17e",
      { seed: seed + 1, width: 0.5, base: 0.28 },
    );
    p.line(
      [
        [-8, 7],
        [-3, 10],
        [8, 8],
      ],
      { color: "#ead1a8", width: 0.55 },
    );
    for (const s of [-1, 1])
      for (let i = 0; i < 4; i++)
        p.line(
          [
            [s * 10, 3 + i * 2],
            [s * 9, 4 + i * 2],
          ],
          { color: "#846947", width: 0.4 },
        );
    if (notebook) {
      p.shape(
        [
          [-6, -11],
          [4, -10],
          [4, 4],
          [-5, 5],
        ],
        "#eee0b9",
        { seed: seed + 2, width: 0.35, base: 0.48 },
      );
      for (let y = -6; y <= 1; y += 3)
        p.line(
          [
            [-3, y],
            [2, y - 0.4],
          ],
          { color: "#648478", width: 0.45 },
        );
      p.line(
        [
          [7, -14],
          [9, -18],
        ],
        { color: M.owlScarf, width: 1.6 },
      );
    } else {
      p.oval(1, 3, 2.5, 3.5, "#aa7a42", { seed: seed + 2, width: 0.4 });
      p.dot(1, 3, 0.75, cream);
      p.line(
        [
          [-6, -5],
          [0, -7],
          [7, -5],
        ],
        { color: "#8e764f", width: 0.5 },
      );
    }
  });
}

const rabbitTail = sprite(40, 39, [20, 20], 896, (p) => {
  p.shape(
    [
      [-9, -7],
      [-4, -12],
      [2, -11],
      [6, -14],
      [11, -9],
      [10, -3],
      [14, 1],
      [10, 8],
      [4, 9],
      [0, 12],
      [-7, 8],
      [-12, 4],
      [-11, -2],
    ],
    cream,
    { seed: 896, width: 0.65, base: 0.38 },
  );
  p.line(
    [
      [-7, -5],
      [-2, -7],
      [1, -4],
      [5, -6],
    ],
    { color: "#f0dfb8", width: 0.8 },
  );
  p.line(
    [
      [-6, 6],
      [-1, 8],
      [5, 5],
    ],
    { color: "#c2a379", width: 0.55 },
  );
});
const rabbitNose = sprite(23, 19, [11, 9], 897, (p) => {
  p.shape(
    [
      [-4, -3],
      [4, -3],
      [2, 0],
      [0, 2],
      [-2, 0],
    ],
    pink,
    { seed: 897, width: 0.45, base: 0.58 },
  );
  p.line(
    [
      [-2, -2],
      [1, -2],
    ],
    { color: "#e5b2a0", width: 0.6 },
  );
  p.line(
    [
      [0, 2],
      [0, 5],
    ],
    { color: "#a7755e", width: 0.5 },
  );
});
const owlTail = sprite(52, 44, [26, 15], 898, (p) => {
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 7;
    p.shape(
      [
        [x - 5, -7],
        [x + 4, -8],
        [x + 10, 14 - i * 2],
        [x + 6, 22 - i * 2],
        [x + 1, 19 - i * 2],
      ],
      feather,
      { seed: 898 + i, width: 0.55, base: 0.34 },
    );
    p.line(
      [
        [x, 3],
        [x + 4, 13],
      ],
      { color: "#a7b9a6", width: 0.7 },
    );
    p.line(
      [
        [x, 9],
        [x + 8, 7],
      ],
      { color: M.owlBody, width: 1.3 },
    );
  }
});
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
  p.oval(-9, -54, 11, 8, M.rabbitCream, { seed: 854, width: 0.3 });
  p.oval(9, -54, 11, 8, M.rabbitCream, { seed: 855, width: 0.3 });
  // Nose is a separate sniffing part; muzzle and whiskers stay on the face.
  p.line(
    [
      [-9, -87],
      [-5, -90],
      [-1, -88],
      [4, -91],
      [10, -87],
    ],
    { color: "#f1d9ad", width: 1 },
  );
  p.line(
    [
      [-25, -71],
      [-24, -77],
      [-20, -80],
    ],
    { color: "#e9c898", width: 0.75 },
  );
  for (const side of [-1, 1])
    for (let i = 0; i < 3; i++)
      p.dot(side * (12 + i * 3), -55 + (i % 2) * 3, 0.5, "#ac8769");
  p.line(
    [
      [-14, -36],
      [-5, -30],
      [7, -22],
      [21, -17],
    ],
    { color: "#9f804f", width: 1.3 },
  );
  p.line(
    [
      [-13, -37],
      [-3, -30],
      [20, -18],
    ],
    { color: "#d8b786", width: 0.7 },
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
    { color: M.rabbitScarf, width: 4 },
  );
  p.oval(18, -39, 3, 3, "#a5b9b5", { seed: 857, width: 0.4 });
  p.dot(18, -40, 0.8, "#e6d8ab");
  for (let i = 0; i < 5; i++)
    p.line(
      [
        [-13 + i * 6, -33 + Math.sin(i) * 2],
        [-12 + i * 6, -31 + Math.sin(i) * 2],
      ],
      { color: "#aac0cd", width: 0.5 },
    );
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
const rabbitFoot = sprite(45, 27, [23, 17], 870, (p) => {
  p.shape(
    [
      [-13, -5],
      [-7, -10],
      [3, -9],
      [14, -5],
      [17, 1],
      [12, 5],
      [-5, 5],
      [-14, 2],
    ],
    cream,
    { seed: 871, width: 0.65, base: 0.4 },
  );
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
    M.owlBelly,
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
    for (let i = 0; i < 7; i++) {
      const y = -69 + i * 4;
      p.line(
        [
          [s * (24 + Math.sin(i * 0.6) * 2), y],
          [s * (22 + Math.sin(i * 0.6) * 2), y + 2],
        ],
        { color: "#bbad87", width: 0.45 },
      );
    }
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
    { color: M.owlScarf, width: 2.8 },
  );
  p.oval(17, -28, 3.3, 2.7, "#cca18a", { seed: 885, width: 0.4 });
  p.line(
    [
      [-15, -26],
      [-22, -22],
      [-30, -19],
    ],
    { color: "#987948", width: 1.1 },
  );
  p.line(
    [
      [-14, -24],
      [-23, -19],
    ],
    { color: "#e2c59b", width: 0.5 },
  );
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 4; i++) {
      const x = -13 + i * 8 + row * 3,
        y = -20 + row * 7;
      p.line(
        [
          [x - 2, y],
          [x, y + 2],
          [x + 2, y],
        ],
        { color: "#8e895e", width: 0.5 },
      );
    }
  p.line(
    [
      [-8, -84],
      [0, -78],
      [9, -84],
    ],
    { color: "#7aa093", width: 0.9 },
  );
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
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 3; i++) {
      const x = -8 + i * 5 + row,
        y = 5 + row * 6;
      p.line(
        [
          [x - 2, y],
          [x, y + 3],
          [x + 2, y + 1],
        ],
        { color: row ? "#8eab9b" : "#47767a", width: 0.8 },
      );
    }
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
    scarf: scarf(M.rabbitScarf, 874),
    tail: rabbitTail,
    nose: rabbitNose,
    pouch: fieldBag(902),
  },
  owl: {
    body: owlBody,
    armL: owlWing,
    armR: owlWing,
    footL: owlFoot,
    footR: owlFoot,
    earL: owlTuft(-1),
    earR: owlTuft(1),
    scarf: scarf(M.owlScarf, 895),
    tail: owlTail,
    pouch: fieldBag(907, "#6a8978", true),
  },
};
