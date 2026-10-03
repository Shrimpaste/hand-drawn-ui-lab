// Authored anchor geometry for the new artwork, using the reference rig schema.
// The scheduler/solver remains the attributed reference engine in src/vendor/.
const anchors = {
  groundContact: [0, 0],
  top: [0, 0.52],
  cap: [0, 0.47],
  tuft: [0.01, 0.68],
  patch: [-0.1, 0.59],
  pouch: [0.19, 0.105],
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
  "sprout",
  "prop",
  "tuft",
  71,
  { idle: {} },
  {
    parent: "cap",
    spring: { k: 60, damp: 3.4, gain: 1.6, from: "lean", wave: 1.1 },
    rotRange: [-0.6, 0.6],
  },
);
part("capPatch", "prop", "patch", 72, { idle: {} }, { parent: "cap" });
part(
  "pouch",
  "prop",
  "pouch",
  61,
  { idle: {} },
  {
    spring: { k: 57, damp: 6, gain: 0.55, from: "lean", wave: 0.5 },
    rotRange: [-0.15, 0.15],
  },
);
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

export const visitorProfiles = {
  mushroom: {
    label: "蘑菇参观者",
    stride: 23,
    breath: { amp: 0.012, period: 3.7 },
  },
  rabbit: {
    label: "长耳兔参观者",
    stride: 32,
    breath: { amp: 0.011, period: 3.15 },
  },
  owl: {
    label: "小猫头鹰参观者",
    stride: 19,
    breath: { amp: 0.016, period: 4.4 },
  },
};
export function visitorRig(character = "mushroom") {
  if (character === "mushroom") return guideRig;
  if (!(character in visitorProfiles))
    throw new Error("Unknown visitor: " + character);
  const rig = structuredClone(guideRig),
    rabbit = character === "rabbit";
  rig.id = character + "-visitor";
  rig.world = { height: rabbit ? 0.94 : 0.69, width: rabbit ? 0.48 : 0.58 };
  Object.assign(rig.anchors, {
    top: [0, rabbit ? 0.57 : 0.54],
    eyeL: [rabbit ? -0.075 : -0.102, rabbit ? 0.401 : 0.345],
    eyeR: [rabbit ? 0.075 : 0.102, rabbit ? 0.401 : 0.345],
    browL: [rabbit ? -0.074 : -0.102, rabbit ? 0.449 : 0.4],
    browR: [rabbit ? 0.074 : 0.102, rabbit ? 0.449 : 0.4],
    cheekL: [-0.145, rabbit ? 0.326 : 0.271],
    cheekR: [0.145, rabbit ? 0.326 : 0.271],
    mouth: [0, rabbit ? 0.324 : 0.277],
    shoulderL: [-0.18, rabbit ? 0.25 : 0.31],
    shoulderR: [0.18, rabbit ? 0.25 : 0.31],
    earL: [-0.103, rabbit ? 0.52 : 0.47],
    earR: [0.103, rabbit ? 0.535 : 0.47],
    scarf: [0.11, 0.22],
    tail: [rabbit ? -0.2 : 0.14, rabbit ? 0.09 : 0.07],
    pouch: [rabbit ? 0.19 : -0.18, rabbit ? 0.12 : 0.14],
    nose: [0, 0.35],
  });
  delete rig.parts.cap;
  delete rig.parts.sprout;
  delete rig.parts.capPatch;
  rig.order = rig.order.filter(
    (p) => !["cap", "sprout", "capPatch"].includes(p),
  );
  for (const [name, z] of rabbit
    ? [
        ["tail", 19],
        ["nose", 57.5],
      ]
    : [["tail", 19]]) {
    rig.parts[name] = {
      role: "prop",
      anchor: name,
      z,
      attach: "body",
      batch: "billboard",
      offset: [0, 0],
      side: 0,
      default: "idle",
      hands: 3,
      phase: 0.27,
      states: { idle: { frames: [0, 1, 2].map((i) => `${name}.idle.${i}`) } },
      ...(name === "tail"
        ? {
            spring: {
              k: rabbit ? 48 : 68,
              damp: 5,
              gain: 0.9,
              from: "lean",
              wave: 0.7,
            },
            rotRange: [-0.25, 0.25],
          }
        : {}),
    };
    rig.order.push(name);
  }
  for (const [side, z] of [
    ["L", 43],
    ["R", 44],
  ]) {
    const name = "ear" + side;
    rig.parts[name] = {
      role: "prop",
      anchor: name,
      z,
      attach: "body",
      batch: "billboard",
      offset: [0, 0],
      side: side === "L" ? -1 : 1,
      default: "idle",
      hands: 3,
      phase: side === "L" ? 0.13 : 0.37,
      states: { idle: { frames: [0, 1, 2].map((i) => name + ".idle." + i) } },
      spring: {
        k: rabbit ? (side === "L" ? 32 : 40) : 75,
        damp: rabbit ? 4.2 : 6,
        gain: rabbit ? 1.7 : 0.8,
        from: "lean",
        wave: side === "L" ? 0.2 : 0.8,
      },
      rotRange: rabbit ? [-0.4, 0.4] : [-0.22, 0.22],
    };
    rig.order.push(name);
  }
  // Wings remain in front of the body; paws tuck behind it. Both use the source arm blend.
  if (!rabbit) {
    rig.parts.armL.z = 51;
    rig.parts.armR.z = 51.1;
  }
  for (const pose of Object.values(rig.bodyPoses)) pose.anchors = rig.anchors;
  return rig;
}
