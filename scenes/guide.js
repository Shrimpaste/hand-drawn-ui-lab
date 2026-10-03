import {
  InkSprite,
  Pencil,
  palette as C,
  curve,
} from "../primitives/living-ink.js";
import { smooth } from "../primitives/motion.js";
export { GuideMotion } from "./guide-motion.js";
import { handwriting } from "../primitives/handwriting.js";
import { visitorArt } from "./visitor-art.js";

const moss = "#6b8c4c",
  mossShade = "#52705e",
  ochre = "#d2983b",
  coral = "#aa5341";
const body = new InkSprite(
  120,
  124,
  (p) => {
    p.shape(
      [
        [-31, -8],
        [-38, -30],
        [-34, -61],
        [-21, -77],
        [4, -82],
        [28, -70],
        [37, -46],
        [34, -19],
        [22, -6],
        [0, 0],
      ],
      moss,
      { seed: 811, angle: -0.35, base: 0.25, width: 1.2 },
    );
    p.shape(
      [
        [-24, -15],
        [-25, -36],
        [-12, -49],
        [12, -48],
        [25, -35],
        [24, -14],
        [9, -7],
        [-8, -7],
      ],
      C.cream,
      { seed: 812, width: 0.75, angle: 0.15, base: 0.28 },
    );
    // Pigment, stitch and speckle follow the rounded volume.
    for (let i = 0; i < 9; i++) {
      p.line(
        [
          [-31 + i * 0.3, -51 + i * 4],
          [-29 + i * 0.2, -48 + i * 4],
        ],
        { color: mossShade, width: 0.8 },
      );
      p.dot(27 - (i % 3) * 2, -50 + i * 3, 0.6, mossShade);
    }
    p.line(
      [
        [-20, -13],
        [-7, -10],
        [9, -10],
        [21, -14],
      ],
      { color: ochre, width: 0.6 },
    );
    p.line(
      [
        [-27, -23],
        [-15, -20],
        [5, -19],
        [22, -22],
      ],
      { color: "#c39971", width: 2.9 },
    );
    p.oval(20, -21, 4.5, 3.1, "#d4a16e", { width: 0.55, seed: 919 });
  },
  { pivot: [60, 100], seed: 811 },
);
const cap = new InkSprite(
  132,
  84,
  (p) => {
    p.shape(
      [
        [-42, 3],
        [-35, -14],
        [-24, -33],
        [-6, -38],
        [5, -33],
        [17, -35],
        [31, -20],
        [42, 1],
        [30, 9],
        [3, 12],
        [-26, 9],
      ],
      coral,
      { seed: 821, width: 1.2, base: 0.25, angle: 0.22 },
    );
    p.shape(
      [
        [-39, 2],
        [-23, 0],
        [0, 3],
        [22, 1],
        [40, 3],
        [27, 10],
        [0, 13],
        [-27, 10],
      ],
      "#e1b19a",
      { seed: 822, width: 0.7 },
    );
    for (const [x, y, r] of [
      [-23, -13, 3.7],
      [-10, -26, 3.5],
      [8, -22, 4],
      [26, -8, 3],
      [-4, -7, 3],
    ]) {
      p.oval(x, y, r, r * 0.67, C.cream, {
        seed: 840 + x,
        width: 0.45,
        base: 0.45,
      });
    }
    p.line(
      [
        [-29, -18],
        [-18, -30],
        [-8, -33],
      ],
      { color: "#edc4ab", width: 0.8 },
    );
    p.shape(
      [
        [-2, -35],
        [3, -48],
        [12, -53],
        [14, -44],
        [5, -35],
      ],
      "#a6b590",
      { seed: 825, width: 0.65 },
    );
    p.line(
      [
        [3, -37],
        [8, -48],
      ],
      { color: mossShade, width: 0.7 },
    );
  },
  { pivot: [66, 62], seed: 821 },
);
const foot = new InkSprite(
  36,
  22,
  (p) => {
    p.shape(
      [
        [-10, -7],
        [-3, -10],
        [5, -8],
        [13, -3],
        [12, 2],
        [1, 4],
        [-11, 2],
      ],
      ochre,
      { seed: 831, width: 0.8, base: 0.27 },
    );
    p.line(
      [
        [-7, 1],
        [4, 2],
        [10, 0],
      ],
      { color: "#bc8b62", width: 0.55 },
    );
  },
  { pivot: [18, 14], seed: 831 },
);
const hand = new InkSprite(
  32,
  36,
  (p) => {
    p.shape(
      [
        [-4, -1],
        [-8, 8],
        [-5, 20],
        [2, 24],
        [8, 17],
        [7, 5],
        [3, 0],
      ],
      moss,
      { seed: 832, width: 0.65 },
    );
    p.line(
      [
        [0, 18],
        [3, 20],
        [5, 17],
      ],
      { color: mossShade, width: 0.55 },
    );
  },
  { pivot: [16, 7], seed: 832 },
);
const scarfTail = new InkSprite(
  68,
  52,
  (p) => {
    p.shape(
      [
        [-2, -2],
        [10, -5],
        [22, 4],
        [38, 18],
        [33, 25],
        [20, 19],
        [9, 8],
      ],
      "#d4a16e",
      { seed: 835, width: 0.6 },
    );
    for (let i = 0; i < 3; i++)
      p.line(
        [
          [29 + i * 3, 22],
          [28 + i * 3, 27],
        ],
        { color: "#aa8a64", width: 0.65 },
      );
    p.line(
      [
        [9, 0],
        [18, 6],
        [29, 15],
      ],
      { color: C.cream, width: 0.7 },
    );
  },
  { pivot: [10, 12], seed: 835 },
);

export function antParade(c, x, y, { time = 0, scale = 1, progress = 1 } = {}) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  const p = new Pencil(c, Math.floor(time * 8) % 3);
  for (let i = 0; i < 6; i++) {
    const ax = (i - 2.5) * 12,
      ay = i % 2 ? 3 : -1,
      phase = time * 16 + i * 2;
    for (const side of [-1, 1])
      for (let j = 0; j < 3; j++) {
        const bend = Math.sin(phase + j * 2 + side) * 1.4;
        p.line(
          [
            [ax - 3 + j * 3, ay],
            [ax - 5 + j * 4, ay + side * 3],
            [ax - 6 + j * 4 + bend, ay + side * 5],
          ],
          { color: "#9c846e", width: 0.6, progress },
        );
      }
    p.oval(ax - 3, ay, 2.3, 1.7, "#af9680", { width: 0.6 });
    p.oval(ax + 1, ay, 1.7, 1.4, "#af9680", { width: 0.6 });
    p.oval(ax + 4, ay - 1, 1.8, 1.6, "#af9680", { width: 0.6 });
    p.line(
      [
        [ax + 4, ay - 2],
        [ax + 7, ay - 5],
        [ax + 8, ay - 5],
      ],
      { width: 0.55, color: "#9c846e" },
    );
    p.line(
      [
        [ax + 4, ay - 2],
        [ax + 5, ay - 6],
      ],
      { width: 0.55, color: "#9c846e" },
    );
  }
  c.restore();
}

export function drawGuide(
  c,
  x,
  y,
  {
    time = 0,
    scale = 1,
    walk = 0,
    gait = walk ? 1 : 0,
    look = 0,
    lookY = 0,
    scarf = 0,
    lean = 0,
    hop = 0,
    squash = 0,
    seated = false,
    reduced = false,
    sleep = 0,
    nervous = 0,
    carry = -1,
    puppet,
    character = "mushroom",
  } = {},
) {
  if (puppet) {
    drawRigGuide(c, x, y, {
      time,
      scale,
      reduced,
      carry,
      puppet,
      seated,
      hop,
      squash,
      character,
    });
    return;
  }
  const t = reduced ? 0 : time,
    stride = Math.sin(walk),
    bob = (1 - Math.cos(walk * 2)) * 1.3 * gait;
  const transported = carry >= 0;
  // Ants approach, crouch under the sleeping creature, then lift and travel together.
  const lift = transported
    ? smooth((carry - 1.3) / 0.5) * 8 * (1 - smooth((carry - 4.8) / 0.5))
    : 0;
  const offset = transported ? smooth((carry - 1.8) / 2.8) * 76 : 0;
  const exit = transported ? 1 - smooth((carry - 5.3) / 0.8) : 1;
  c.save();
  c.translate(x + offset * scale, y);
  c.scale(scale, scale);
  c.globalAlpha *= exit;
  c.fillStyle = "#a9997321";
  c.beginPath();
  c.ellipse(0, 2, 29 - hop * 0.035, 4, 0, 0, Math.PI * 2);
  c.fill();
  if (transported)
    antParade(c, -60 * (1 - smooth(carry / 1.4)), 2, { time: t, scale: 0.83 });
  c.translate(0, -hop - lift);
  const common = { time: t, reduced };
  // Heel stays on the ground through stance; swing only raises the returning foot.
  const fx = 9 * gait * stride,
    fy = 5 * gait;
  foot.draw(c, -13 - fx, seated ? -7 : -Math.max(0, -stride) * fy, {
    ...common,
    angle: -stride * 0.07 * gait,
  });
  foot.draw(c, 13 + fx, seated ? -7 : -Math.max(0, stride) * fy, {
    ...common,
    angle: stride * 0.07 * gait,
  });
  c.save();
  c.translate(0, -4 - bob - sleep * 3);
  c.rotate(
    lean + Math.sin(t * 2.6) * 0.003 + nervous * Math.sin(t * 11) * 0.013,
  );
  c.scale(
    1 + squash * 0.3 + Math.sin(t * 1.8) * 0.006,
    1 - squash * 0.55 + Math.cos(t * 1.8) * 0.006,
  );
  hand.draw(c, -30, -42, {
    ...common,
    angle: -0.2 - stride * gait * 0.12 - hop * 0.009,
  });
  scarfTail.draw(c, 19, -24, {
    ...common,
    angle: scarf + Math.sin(t * 1.6) * 0.013,
  });
  body.draw(c, 0, 0, common);
  hand.draw(c, 30, -42, {
    ...common,
    angle: 0.2 + stride * gait * 0.12 + hop * 0.009,
  });
  cap.draw(c, look * 0.7, -74 + sleep * 5, {
    ...common,
    angle: scarf * 0.4 - sleep * 0.08,
  });
  const p = new Pencil(c, reduced ? 0 : Math.floor(t * 8) % 3);
  const blink = reduced
    ? 0
    : Math.pow(Math.max(0, Math.cos((t + 1.2) * 1.54)), 55);
  const closed = Math.max(sleep, blink),
    ey = -49 + lookY * 1.7;
  for (const side of [-1, 1]) {
    const ex = side * 11 + look * 1.5;
    if (closed < 0.9) {
      // Two small dark eyes are embedded in the body; eyelids squash continuously.
      c.save();
      c.translate(ex, ey);
      c.scale(1, Math.max(0.08, 1 - closed));
      p.oval(0, 0, 5.1, 6.2, "#77716d", {
        outline: "#77716d",
        width: 0.45,
        base: 0.7,
        seed: 911 + side,
      });
      p.dot(-1.2, -2, 1.45, C.paper);
      c.restore();
    } else
      p.line(
        [
          [ex - 4, ey],
          [ex, ey + 1.7],
          [ex + 4, ey - 0.2],
        ],
        { color: "#897565", width: 1.05 },
      );
    p.oval(side * 24, -35, 4.6, 2.8, "#dfb3a0", {
      outline: "#dfb3a0",
      width: 0.2,
      base: 0.25,
      seed: 914 + side,
    });
    p.line(
      [
        [side * 9, -61 - nervous * 2],
        [side * 14, -62 - nervous * 4],
      ],
      { color: "#8c8c72", width: 0.7 },
    );
  }
  p.line(
    [
      [-4, -32],
      [0, -30 + sleep * 2],
      [5, -33],
    ],
    { color: "#9a826c", width: 0.9 },
  );
  if (hop > 6) p.oval(0, -31, 3.4, 2.8, "#c2937e", { width: 0.4 });
  // Scarf collar is integrated into the body, with a small visible knot.
  p.line(
    [
      [-27, -23],
      [-15, -20],
      [5, -19],
      [22, -22],
    ],
    { color: "#c39971", width: 2.9 },
  );
  p.oval(20, -21, 4.5, 3.1, "#d4a16e", { width: 0.55, seed: 919 });
  if (nervous > 0.1) {
    const droplet = (t * 0.95) % 1;
    c.save();
    c.globalAlpha *= nervous * (1 - droplet);
    p.shape(
      [
        [35, -57 + droplet * 13],
        [32, -51 + droplet * 13],
        [36, -48 + droplet * 13],
        [38, -52 + droplet * 13],
      ],
      "#a9c3c4",
      { width: 0.45 },
    );
    c.restore();
  }
  c.restore();
  if (sleep > 0.25 && !transported)
    handwriting(c, "z", 37 + Math.sin(t) * 2, -89 - (t % 2) * 4, {
      size: 13,
      alpha: sleep * 0.6,
      color: C.soft,
    });
  c.restore();
}

const facial = new Map();
function faceSprite(part, state, character = "mushroom") {
  const key = character + ":" + part + ":" + state;
  if (facial.has(key)) return facial.get(key);
  const sprite = new InkSprite(
    34,
    30,
    (p) => {
      if (part.startsWith("eye")) {
        if (["closed", "sleepy", "happy", "squeezed"].includes(state))
          p.line(
            [
              [-4, 0],
              [0, state === "happy" ? -2 : 2],
              [4, 0],
            ],
            { color: "#80766a", width: 1.1 },
          );
        else {
          const half = ["half", "lidded", "glare"].includes(state),
            wide = state === "wide";
          p.oval(0, 0, wide ? 5.7 : 5.1, half ? 3.1 : 6.2, "#77716d", {
            outline: "#77716d",
            width: 0.45,
            base: 0.73,
            seed: 914,
          });
          p.dot(-1.3, half ? -1.1 : -2, 1.35, C.paper);
        }
      } else if (part.startsWith("cheek"))
        p.oval(0, 0, 4.6, 2.8, "#dfb3a0", {
          outline: "#dfb3a0",
          width: 0.2,
          base: 0.25,
          seed: 914,
        });
      else if (part.startsWith("brow"))
        p.line(
          [
            [-4, state === "worried" ? 2 : 0],
            [0, -1],
            [4, state === "raised" ? -2 : 0],
          ],
          { color: "#95927a", width: 0.85 },
        );
      else if (character === "owl")
        p.shape(
          [
            [-4, -3],
            [4, -3],
            [2, 1],
            [0, state === "open" ? 6 : 4],
          ],
          "#c9a570",
          { seed: 915, width: 0.4, base: 0.45 },
        );
      else if (["o", "open", "grin"].includes(state))
        p.oval(
          0,
          0,
          state === "o" ? 2.5 : 4,
          state === "open" ? 4 : 2.3,
          "#bd9482",
          { width: 0.5, base: 0.65, seed: 915 },
        );
      else
        p.line(
          [
            [-4, 0],
            [0, state === "wavy" ? -1.3 : 2],
            [4, state === "frown" ? 2 : 0],
          ],
          { color: "#9a826c", width: 0.95 },
        );
    },
    { seed: 839, pivot: [17, 15] },
  );
  facial.set(key, sprite);
  return sprite;
}
function drawRigGuide(
  c,
  x,
  y,
  { time, scale, reduced, carry, puppet, seated, hop, squash, character },
) {
  const art = visitorArt[character] || {
    body,
    cap,
    scarf: scarfTail,
    armL: hand,
    armR: hand,
    footL: foot,
    footR: foot,
  };
  const transported = carry >= 0,
    lift = transported
      ? smooth((carry - 1.3) / 0.5) * 8 * (1 - smooth((carry - 4.8) / 0.5))
      : 0;
  const offset = transported ? smooth((carry - 1.8) / 2.8) * 76 : 0;
  c.save();
  c.translate(x + offset * scale, y);
  c.scale(scale, scale);
  c.globalAlpha *= transported ? 1 - smooth((carry - 5.3) / 0.8) : 1;
  if (transported)
    antParade(c, -60 * (1 - smooth(carry / 1.4)), 2, { time, scale: 0.83 });
  c.translate((puppet.out.x || 0) * 160, -(puppet.out.y || 0) * 160);
  c.translate(0, -lift - hop - (seated ? 9 : 0));
  c.scale(1 + squash * 0.3, 1 - squash * 0.55);
  for (const i of puppet.instances()) {
    if (["tuft", "plaster"].includes(i.part)) continue;
    c.save();
    c.translate(i.t[0] * 160, -i.t[1] * 160);
    const [a, b, cc, d] = i.m;
    c.transform(a, -cc, -b, d, 0, 0);
    c.globalAlpha *= i.alpha;
    const opts = {
      time,
      reduced,
      frame: i.hand,
      progress: Math.min(i.progress, c.sceneDrawing?.(811) ?? 1),
    };
    if (i.part === "shadow") {
      if (opts.progress > 0.85) {
        c.fillStyle = "#a999731d";
        c.beginPath();
        c.ellipse(0, 2, 29, 4, 0, 0, Math.PI * 2);
        c.fill();
      }
    } else if (i.part.startsWith("arm")) {
      c.rotate(
        (((i.state === "up" ? 132 : i.state === "out" ? 60 : 0) * Math.PI) /
          180) *
          (i.part.endsWith("L") ? -1 : 1),
      );
      if (character === "owl" && i.part.endsWith("R")) c.scale(-1, 1);
      art[i.part]?.draw(c, 0, 0, opts);
    } else if (art[i.part]) art[i.part].draw(c, 0, 0, opts);
    else if (opts.progress > 0.68)
      faceSprite(i.part, i.state, character).draw(c, 0, 0, {
        ...opts,
        progress: Math.max(0, (opts.progress - 0.68) / 0.32),
      });
    c.restore();
  }
  if (puppet.out.mood === "sleepy" && !transported)
    handwriting(c, "z", 37 + Math.sin(time) * 2, -89 - (time % 2) * 4, {
      size: 13,
      alpha: 0.6,
      color: C.soft,
    });
  if (puppet.out.mood === "worried") {
    const p = new Pencil(c),
      drop = (time * 0.95) % 1;
    c.save();
    c.globalAlpha *= 1 - drop;
    p.shape(
      [
        [35, -57 + drop * 13],
        [32, -51 + drop * 13],
        [36, -48 + drop * 13],
        [38, -52 + drop * 13],
      ],
      "#a9c3c4",
      { width: 0.45 },
    );
    c.restore();
  }
  c.restore();
}
