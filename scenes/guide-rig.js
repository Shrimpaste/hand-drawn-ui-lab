// Authored anchor geometry for the new artwork, using the reference rig schema.
// The scheduler/solver remains the attributed reference engine in src/vendor/.
const anchors = {
  groundContact: [0, 0],
  top: [0, 0.52],
  cap: [0, 0.47],
  tuft: [0.03, 0.72],
  patch: [-0.04, 0.48],
  shoulderL: [-0.185, 0.255],
  shoulderR: [0.185, 0.255],
  hipL: [-0.081, 0.025],
  hipR: [0.081, 0.025],
  eyeL: [-0.069, 0.306],
  eyeR: [0.069, 0.306],
  browL: [-0.074, 0.381],
  browR: [0.074, 0.381],
  cheekL: [-0.15, 0.219],
  cheekR: [0.15, 0.219],
  mouth: [0, 0.194],
  scarf: [0.12, 0.15],
};
const parts = {},
  order = [];
function part(name, role, anchor, z, states, extra = {}) {
  parts[name] = {
    role,
    anchor,
    z,
    attach: role === "foot" || role === "shadow" ? "ground" : "body",
    batch: role === "shadow" ? "flat" : "billboard",
    offset: [0, 0],
    side: name.endsWith("L") ? -1 : name.endsWith("R") ? 1 : 0,
    default: Object.keys(states)[0],
    hands: 3,
    phase: (z * 0.137) % 1,
    states: Object.fromEntries(
      Object.entries(states).map(([state, opts]) => [
        state,
        { frames: [0, 1, 2].map((n) => `${name}.${state}.${n}`), ...opts },
      ]),
    ),
    ...extra,
  };
  order.push(name);
}
part("shadow", "shadow", "groundContact", 0, { on: {} });
for (const [side, z] of [
  ["L", 20],
  ["R", 21],
])
  part(
    "arm" + side,
    "arm",
    "shoulder" + side,
    z,
    { down: { deg: 18 }, out: { deg: 78 }, up: { deg: 150 } },
    { rotSign: side === "L" ? -1 : 1 },
  );
for (const [side, z] of [
  ["L", 30],
  ["R", 31],
])
  part("foot" + side, "foot", "hip" + side, z, { flat: {} });
part(
  "scarf",
  "prop",
  "scarf",
  40,
  { idle: {} },
  {
    spring: { k: 38, damp: 5, gain: 1.3, from: "lean", wave: 0.7 },
    rotRange: [-0.45, 0.45],
  },
);
part(
  "body",
  "body",
  "groundContact",
  50,
  { idle: {}, squash: {}, stretch: {}, hurt: {} },
  { timed: true, sketch: [0, 0.65] },
);
for (const [side, z] of [
  ["L", 52],
  ["R", 53],
])
  part(
    "cheek" + side,
    "cheek",
    "cheek" + side,
    z,
    { on: {} },
    { look: "face" },
  );
for (const [side, z] of [
  ["L", 54],
  ["R", 55],
])
  part(
    "eye" + side,
    "eye",
    "eye" + side,
    z,
    Object.fromEntries(
      [
        "open",
        "half",
        "closed",
        "wide",
        "lidded",
        "glare",
        "squeezed",
        "happy",
        "sleepy",
        "spiral",
      ].map((n) => [n, {}]),
    ),
    { look: "eye" },
  );
for (const [side, z] of [
  ["L", 56],
  ["R", 57],
])
  part(
    "brow" + side,
    "brow",
    "brow" + side,
    z,
    { neutral: {}, worried: {}, angry: {}, raised: {} },
    { look: "face" },
  );
part(
  "mouth",
  "mouth",
  "mouth",
  58,
  Object.fromEntries(
    ["smile", "grin", "open", "o", "flat", "wavy", "frown", "smirk"].map(
      (n) => [n, {}],
    ),
  ),
  { look: "face" },
);
part(
  "cap",
  "prop",
  "cap",
  70,
  Object.fromEntries(
    [
      "normal",
      "flat",
      "lifted",
      "normalB",
      "flatB",
      "liftedB",
      "normalC",
      "flatC",
      "liftedC",
    ].map((n) => [n, {}]),
  ),
  {
    timed: true,
    sketch: [0.62, 0.96],
    spring: { k: 44, damp: 4.6, gain: 1, from: "lean" },
    rotRange: [-0.5, 0.5],
    squashK: 0.75,
  },
);
part(
  "tuft",
  "prop",
  "tuft",
  71,
  { idle: {} },
  {
    spring: { k: 60, damp: 3.4, gain: 1.6, from: "lean", wave: 0.4 },
    rotRange: [-0.6, 0.6],
  },
);
part("plaster", "prop", "patch", 72, { idle: {} });
export const guideRig = {
  id: "moss-visitor",
  side: "w",
  type: "pawn",
  facing: 0,
  scale: { ppu: 160 },
  world: { height: 0.74, width: 0.55 },
  anchors,
  look: { face: [0.01, 0.006], eye: [0.009, 0.006] },
  boil: { fps: 8, seq2: [0, 1], seq3: [0, 1, 2, 1] },
  bodyPoses: Object.fromEntries(
    ["idle", "squash", "stretch", "hurt"].map((n) => [
      n,
      {
        nominal: { sx: 1, sy: 1 },
        anchors,
        hull: [
          [-0.22, 0.015],
          [0.22, 0.015],
          [0.22, 0.43],
          [0, 0.515],
          [-0.22, 0.43],
        ],
      },
    ]),
  ),
  parts,
  order,
  frames: {},
};
