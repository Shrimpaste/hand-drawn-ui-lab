import { SceneHost } from "./host.js";
import { GalleryWalk } from "./gallery-model.js";
import { Spring } from "../primitives/motion.js";
import { InkTransition } from "../primitives/ink.js";
import { Pencil, palette as C, curve } from "../primitives/living-ink.js";
import { handwriting } from "../primitives/handwriting.js";
import { drawGuide, drawPainting, plant } from "./art.js";
import { GuideMotion } from "./guide-motion.js";
import { visitorProfiles } from "./guide-rig.js";
import { clampGround, courtyardProps as props } from "./courtyard-layout.js";
import { CourtyardLife } from "./courtyard-life.js";
import {
  drawPondLife,
  drawLampLife,
  drawBenchLife,
  drawFlowerLife,
} from "./courtyard-details.js";
import {
  courtyardGround,
  stations,
  kiosks,
  courtyardBench,
  gardenBench,
  lantern,
  wateringCan,
} from "./courtyard.js";

const s = new SceneHost("gallery"),
  g = new GalleryWalk(576, 663),
  life = new CourtyardLife();
const savedVisitor = localStorage.getItem("gallery-visitor");
let character = visitorProfiles[savedVisitor] ? savedVisitor : "rabbit";
let rig = new GuideMotion(127, character),
  oldRig = null,
  switchAge = 1;
g.stride = rig.profile.stride;
const portraits = Object.keys(visitorProfiles).map(
  (id, i) => new GuideMotion(240 + i, id),
);
const view = new Spring(0, { stiffness: 53, damping: 15 });
const captions = new InkTransition({ writeSeconds: 1.05, eraseSeconds: 0.42 });
const titles = ["night greenhouse", "the post office", "the harbour"];
const notes = [
  ["the gardener fell asleep.", "tap the glass to wake him."],
  ["one more letter to deliver.", "tap to send it to the letterbox."],
  ["the tide is coming in.", "tap the water for a little breeze."],
];
let places,
  projection,
  closing = false,
  ready = 0,
  counts = [0, 0, 0],
  touches = [0, 0, 0],
  effects = [10, 10, 10],
  footprints = [];
const screen = (p) => ({
  x: projection.x + p.x * projection.k,
  y: projection.y + p.y * projection.k,
});
const world = (p) => ({
  x: (p.x - projection.x) / projection.k,
  y: (p.y - projection.y) / projection.k,
});
function canPose() {
  const a = props.can,
    f = props.flowers,
    q = life.pose.can;
  return {
    x: a.x + (f.x - 30 - a.x) * q,
    y: a.y + (f.y - 35 - a.y) * q - Math.sin(q * Math.PI) * 13,
    angle: q * 0.48,
  };
}
function go(x, y) {
  if (g.selected >= 0 || closing || rig.state === "carry") return;
  const p = clampGround(x, y);
  rig.wake();
  g.walkTo(p.x, p.y);
}
function choose(i) {
  if (closing || rig.state === "carry") return;
  if (g.selected >= 0) {
    close();
    return;
  }
  counts[i]++;
  rig.wake();
  const p = stations[i].visit;
  g.walkTo(p.x, p.y, { art: i });
  s.announce("参观者走向作品 " + (i + 1));
}
function close() {
  if (g.selected < 0) return;
  closing = true;
  captions.setVisible(false, s.reduced);
}
const floor = s.button(
  "gallery-floor",
  "点击庭院地面行走，或使用方向键",
  (e) => {
    const p = e.detail ? world(s.point(e)) : { x: 580, y: 590 };
    go(p.x, p.y);
  },
);
const works = titles.map((name, i) =>
  s.button("gallery-work-" + i, "走近并观察作品 " + (i + 1) + "：" + name, () =>
    choose(i),
  ),
);
const seat = s.button("gallery-bench", "走到长凳坐下", () => {
  if (g.selected < 0) {
    rig.wake();
    if (g.mode === "sitting") {
      life.touch("bench");
      rig.react("hello");
    } else g.walkTo(gardenBench.x, gardenBench.y, { sit: true });
  }
});
const objects = [
  ["pond", "轻点池塘，看涟漪和小鱼", "a little ripple"],
  ["lamp", "点亮路灯，萤火虫会慢慢飞来；再点熄灭", "light the lantern"],
  ["flowers", "轻碰花盆，花朵和小蜜蜂醒来", "wake the flowers"],
  ["water", "用喷壶给旁边的花浇水", "water the flowers"],
].map(([kind, label, hint]) => ({
  kind,
  hint,
  button: s.button("gallery-" + kind, label, () => {
    life.touch(kind);
    rig.wake();
    s.audio.play(kind === "lamp" ? "switch" : "leaf", { strength: 0.12 });
    s.announce(label);
  }),
}));
function changeVisitor(id) {
  if (id === character || rig.state === "carry" || g.selected >= 0) return;
  oldRig = rig;
  const state = rig.state,
    phase = rig.phase,
    gait = rig.gait.value,
    direction = rig.direction;
  rig = new GuideMotion(
    127 + Object.keys(visitorProfiles).indexOf(id) * 19,
    id,
  );
  rig.phase = phase;
  rig.gait.snap(gait);
  rig.direction = direction;
  if (state !== "awake") rig.react(state);
  g.distance = (g.distance / g.stride) * rig.profile.stride;
  g.stride = rig.profile.stride;
  character = id;
  switchAge = 0;
  localStorage.setItem("gallery-visitor", id);
  guide.el.setAttribute(
    "aria-label",
    "和" + visitorProfiles[id].label + "打招呼，唤醒睡着的参观者",
  );
  for (const entry of visitors)
    entry.button.el.setAttribute("aria-pressed", String(entry.id === id));
  s.announce("换成" + visitorProfiles[id].label);
}
const visitors = Object.entries(visitorProfiles).map(([id, p], i) => ({
  id,
  portrait: portraits[i],
  button: s.button("gallery-visitor-" + id, "选择" + p.label, () =>
    changeVisitor(id),
  ),
}));
for (const entry of visitors)
  entry.button.el.setAttribute("aria-pressed", String(entry.id === character));
const guide = s.button(
  "gallery-guide",
  "和参观者打招呼，唤醒睡着的参观者",
  () => {
    rig.react("hello");
    s.announce("参观者回应招呼");
  },
);
const nap = s.button("gallery-nap", "让参观者打盹，再点角色唤醒", () =>
  rig.state === "asleep" ? rig.wake() : rig.react("asleep"),
);
const nervous = s.button("gallery-nervous", "演示紧张状态", () =>
  rig.react("nervous"),
);
const ants = s.button("gallery-ants", "演示小蚂蚁抬起并搬运角色", () => {
  g.close();
  rig.react("carry");
});
const back = s.button("gallery-back", "退出观察，回到庭院", close);
const inspect = s.button(
  "gallery-inspect",
  "触碰作品内部：唤醒园丁、寄信或吹动小船",
  () => {
    if (g.selected < 0 || closing) return;
    effects[g.selected] = 0;
    touches[g.selected]++;
    s.audio.play(g.selected === 2 ? "leaf" : "paper", { strength: 0.18 });
  },
);
const left = s.button("gallery-left", "向左走", () => go(g.x - 90, g.y));
const right = s.button("gallery-right", "向右走", () => go(g.x + 90, g.y));
back.el.hidden = inspect.el.hidden = true;

s.layout = () => {
  projection = s.mobile ? { x: 5, y: 250, k: 0.57 } : { x: 0, y: 0, k: 1 };
  places = stations.map((a) => ({
    ...screen(a),
    scale: a.scale * projection.k,
  }));
  const fp = screen({ x: 570, y: 543 });
  s.place(floor, fp.x, fp.y, 920 * projection.k, 450 * projection.k);
  places.forEach((p, i) =>
    s.place(
      works[i],
      p.x,
      p.y - 17 * projection.k,
      238 * p.scale,
      287 * p.scale,
    ),
  );
  const b = screen(props.bench);
  // The free right-hand seat remains tappable while the visitor occupies the left.
  s.place(
    seat,
    b.x + 65 * projection.k,
    b.y + 8 * projection.k,
    80 * projection.k,
    75 * projection.k,
  );
  for (const entry of objects) {
    const a =
      props[
        { lamp: "lantern", water: "can", flowers: "flowers", pond: "pond" }[
          entry.kind
        ]
      ];
    const center = screen({
      x: a.x,
      y: a.y - (entry.kind === "lamp" ? 28 : entry.kind === "flowers" ? -6 : 0),
    });
    const dims = {
      pond: [166, 66],
      lamp: [48, 162],
      flowers: [62, 91],
      water: [58, 40],
    }[entry.kind];
    s.place(
      entry.button,
      center.x,
      center.y,
      dims[0] * projection.k,
      dims[1] * projection.k,
    );
  }
  visitors.forEach((entry, i) =>
    s.place(
      entry.button,
      s.mobile ? 208 + i * 86 : 144 + i * 75,
      s.mobile ? 221 : 187,
      64,
      70,
    ),
  );
  s.place(back, s.w / 2, s.mobile ? 987 : 748, 190, 53);
  s.place(
    inspect,
    s.w / 2,
    s.mobile ? 438 : 395,
    s.mobile ? 440 : 448,
    s.mobile ? 465 : 476,
  );
  const y = s.mobile ? 920 : 779;
  s.place(left, 65, y, 43, 43);
  s.place(right, 112, y, 43, 43);
  s.place(nap, s.mobile ? 205 : 740, y, 80, 43);
  s.place(nervous, s.mobile ? 350 : 863, y, 130, 43);
  s.place(ants, s.mobile ? 518 : 1000, y, 106, 43);
};
s.layout();
s.onKey = (e) => {
  if (rig.state === "carry") return;
  if (e.key === "Escape") {
    close();
    return;
  }
  const d = {
    ArrowLeft: [-75, 0],
    ArrowRight: [75, 0],
    ArrowUp: [-30, -48],
    ArrowDown: [30, 48],
  }[e.key];
  if (d) {
    e.preventDefault();
    go(g.x + d[0], g.y + d[1]);
  }
  if (["1", "2", "3"].includes(e.key)) choose(+e.key - 1);
  if (e.key.toLowerCase() === "z") rig.react("asleep");
  if (e.key.toLowerCase() === "t") rig.react("nervous");
  if (e.key.toLowerCase() === "a") rig.react("carry");
};
s.onReplay = () => {
  closing = false;
  g.close();
  view.snap(0);
  captions.setVisible(false, true);
  rig.react("awake");
  life.reset();
  oldRig = null;
};
s.onReduced = () => {
  if (s.reduced) captions.setVisible(g.selected >= 0 && !closing, true);
};
s.update = (dt) => {
  const previousMode = g.mode;
  const events = s.openingDone ? g.update(dt, s.reduced) : [];
  if (previousMode !== "sitting" && g.mode === "sitting") {
    life.touch("bench");
    s.audio.play("wood", { strength: 0.16 });
  }
  life.update(dt, s.reduced);
  const movingCan = screen(canPose()),
    waterButton = objects.find((entry) => entry.kind === "water").button;
  s.place(
    waterButton,
    movingCan.x + 7 * projection.k,
    movingCan.y + 4 * projection.k,
    58 * projection.k,
    40 * projection.k,
  );
  if (life.events.includes("water-lands"))
    s.audio.play("leaf", { strength: 0.1 });
  switchAge += dt;
  if (switchAge > 0.28) oldRig = null;
  for (const e of events) {
    if (e.name === "footstep") {
      s.audio.play("step", { strength: 0.28, pan: (g.x - 560) / 1120 });
      footprints.push({ x: e.x + e.side * 7, y: e.y + 2, life: 0.6 });
    }
    if (e.name === "arrive") {
      ready = 0.25;
      s.announce("观察作品 " + (e.art + 1) + "，按 Esc 返回");
    }
  }
  if (g.mode === "looking") {
    ready -= dt;
    if (ready <= 0) {
      g.mode = "detail";
      captions.setVisible(true, s.reduced);
    }
  }
  if (closing && captions.progress === 0) {
    view.target = 0;
    if (view.value < 0.005) {
      g.close();
      closing = false;
    }
  } else view.target = g.mode === "detail" ? 1 : 0;
  view.update(dt, s.reduced);
  captions.update(dt);
  effects = effects.map((x) => x + dt);
  footprints = footprints
    .map((p) => ({ ...p, life: p.life - dt }))
    .filter((p) => p.life > 0)
    .slice(-25);
  const pointer = s.pointer ? world(s.pointer) : null;
  const attention = works.findIndex((b) => b.hover || b.focus);
  const target = attention >= 0 ? stations[attention] : pointer;
  const near =
    pointer && Math.hypot(pointer.x - g.x, pointer.y - g.y + 45) < 65;
  rig.update(dt, {
    speed: s.openingDone ? g.speed : 0,
    look:
      g.mode === "walking"
        ? g.look
        : target
          ? Math.max(-1, Math.min(1, (target.x - g.x) / 150))
          : 0,
    lookY:
      attention >= 0 || g.selected >= 0
        ? -0.7
        : target
          ? Math.max(-0.8, Math.min(0.6, (target.y - g.y + 45) / 180))
          : 0,
    active: g.mode === "walking" || (near && s.time - s.inputTime < 0.35),
    hover: guide.hover || guide.focus,
    reduced: s.reduced || !s.openingDone,
  });
  if (oldRig)
    oldRig.update(dt, {
      speed: g.speed,
      look: g.look,
      active: true,
      reduced: s.reduced,
    });
  const gp = screen({ x: g.x, y: g.y - 55 });
  s.place(
    guide,
    gp.x,
    gp.y - (character === "rabbit" ? 9 : 0),
    89 * projection.k,
    (character === "rabbit" ? 137 : 112) * projection.k,
  );
  // Native pointer input must hit the exposed seat, not a foreground character.
  const benchLeft = props.bench.x - 30,
    benchRight = props.bench.x + 65;
  const freeSeat =
    Math.abs(g.x - benchRight) > Math.abs(g.x - benchLeft)
      ? benchRight
      : benchLeft;
  const seatPoint = screen({ x: freeSeat, y: props.bench.y + 8 });
  s.place(seat, seatPoint.x, seatPoint.y, 80 * projection.k, 75 * projection.k);
  const detail = g.mode === "detail";
  back.el.hidden = inspect.el.hidden = !detail;
  inspect.el.disabled = closing;
  for (const b of [
    ...works,
    seat,
    floor,
    left,
    right,
    guide,
    nap,
    nervous,
    ants,
    ...objects.map((entry) => entry.button),
    ...visitors.map((entry) => entry.button),
  ])
    b.el.disabled =
      detail || closing || !s.openingDone || rig.state === "carry";
};
s.isWriting = () => captions.progress > 0 && captions.progress < 1;
s.isErasing = () => closing;

function drawWorld(c, t) {
  c.save();
  c.translate(projection.x, projection.y);
  c.scale(projection.k, projection.k);
  courtyardGround.draw(c, 0, 0, { time: 0, reduced: true });
  const layers = stations.map((a, i) => ({
    depth: a.ground,
    draw: () => {
      kiosks[i].draw(c, a.x, a.y, { time: 0, scale: a.scale, reduced: true });
      drawPainting(c, i, a.x, a.y + 6, {
        time: t,
        scale: a.scale * 0.83,
        reduced: s.reduced,
        effect: effects[i],
      });
      handwriting(c, titles[i], a.x, a.ground + 29, {
        size: 17,
        align: "center",
        color: C.teal,
        progress: works[i].ink.progress,
      });
    },
  }));
  for (const id of ["plant", "flowers"]) {
    const a = props[id];
    layers.push({
      depth: a.ground.y,
      draw: () => {
        c.save();
        c.translate(a.ground.x, a.ground.y);
        if (id === "flowers") c.rotate(life.pose.sway);
        plant.draw(c, a.x - a.ground.x, a.y - a.ground.y, {
          time: t,
          scale: a.scale,
          reduced: s.reduced,
        });
        c.restore();
        if (id === "flowers" && s.openingDone)
          drawFlowerLife(c, life, t, s.reduced);
      },
    });
  }
  layers.push({
    depth: props.lantern.ground.y,
    draw: () => {
      lantern.draw(c, props.lantern.x, props.lantern.y, {
        scale: props.lantern.scale,
        reduced: true,
      });
      if (s.openingDone) drawLampLife(c, life, t, s.reduced);
    },
  });
  layers.push({
    depth: props.pond.ground.y,
    draw: () => drawPondLife(c, life, t, s.reduced),
  });
  layers.push({
    depth: props.bench.ground.y,
    draw: () => {
      courtyardBench.draw(c, props.bench.x, props.bench.y, {
        scale: props.bench.scale,
        reduced: true,
      });
    },
  });
  layers.push({
    depth: props.bench.ground.y + 3,
    draw: () => {
      if (s.openingDone) drawBenchLife(c, life, t, s.reduced);
    },
  });
  layers.push({
    depth: props.can.ground.y,
    draw: () => {
      const a = props.can,
        pose = canPose();
      wateringCan.draw(c, pose.x, pose.y, {
        time: t,
        scale: a.scale,
        reduced: s.reduced,
        angle: pose.angle,
      });
    },
  });
  layers.push({
    depth: g.mode === "sitting" ? props.bench.ground.y + 1 : g.y,
    draw: () => {
      const blend = Math.max(0, Math.min(1, switchAge / 0.28));
      if (oldRig) {
        c.save();
        c.globalAlpha *= 1 - blend;
        drawGuide(c, g.x, g.y, {
          ...oldRig.pose,
          time: t,
          scale: 0.69 + (g.y - 470) * 0.00045,
          seated: g.mode === "sitting",
          reduced: s.reduced,
        });
        c.restore();
      }
      c.save();
      c.globalAlpha *= oldRig ? blend : 1;
      drawGuide(c, g.x, g.y, {
        ...rig.pose,
        time: t,
        scale: 0.69 + (g.y - 470) * 0.00045,
        seated: g.mode === "sitting",
        reduced: s.reduced,
      });
      c.restore();
    },
  });
  for (const f of footprints) {
    c.save();
    c.globalAlpha = f.life * 0.22;
    new Pencil(c).oval(f.x, f.y, 3, 1.2, null, {
      width: 0.5,
      outline: C.honey,
    });
    c.restore();
  }
  layers.sort((a, b) => a.depth - b.depth).forEach((l) => l.draw());
  if (s.openingDone) {
    for (const entry of objects) {
      const a =
        props[
          { pond: "pond", lamp: "lantern", water: "can", flowers: "flowers" }[
            entry.kind
          ]
        ];
      handwriting(
        c,
        entry.hint,
        a.ground.x,
        a.ground.y + (entry.kind === "flowers" ? 25 : 38),
        {
          size: 16,
          align: "center",
          color: C.teal,
          progress: entry.button.ink.progress,
        },
      );
    }
    handwriting(
      c,
      "sit with a little friend",
      props.bench.ground.x,
      props.bench.ground.y + 27,
      { size: 16, align: "center", color: C.teal, progress: seat.ink.progress },
    );
  }
  c.restore();
}
s.draw = (c) => {
  const t = s.reduced ? 0 : s.time,
    v = Math.max(0, Math.min(1, view.value));
  c.save();
  c.globalAlpha = 1 - v * 0.97;
  handwriting(c, "the courtyard gallery", s.w / 2, s.mobile ? 136 : 99, {
    size: s.mobile ? 34 : 38,
    align: "center",
    color: C.red,
    progress: s.intro.progress,
  });
  drawWorld(c, t);
  for (const entry of visitors) {
    const b = entry.button;
    drawGuide(c, b.x, b.y + 21, {
      ...entry.portrait.pose,
      time: 0,
      scale: entry.id === "rabbit" ? 0.33 : 0.37,
      reduced: true,
    });
    if (entry.id === character && s.openingDone)
      new Pencil(c).line(
        [
          [b.x - 18, b.y + 30],
          [b.x + 2, b.y + 31],
          [b.x + 17, b.y + 29],
        ],
        { color: C.red, width: 1.3 },
      );
    handwriting(
      c,
      "be the " + entry.id,
      s.mobile ? 325 : 220,
      s.mobile ? 174 : 138,
      { size: 17, align: "center", color: C.teal, progress: b.ink.progress },
    );
  }
  handwriting(
    c,
    "walk over to a picture",
    s.mobile ? s.w / 2 : 362,
    s.mobile ? 866 : 774,
    {
      size: s.mobile ? 23 : 20,
      align: "center",
      color: C.soft,
      progress: s.openingDone ? 1 : 0,
    },
  );
  const p = new Pencil(c);
  p.line(
    [
      [left.x + 6, left.y - 5],
      [left.x - 5, left.y],
      [left.x + 6, left.y + 5],
    ],
    { color: C.red, width: 1.3 },
  );
  p.line(
    [
      [right.x - 6, right.y - 5],
      [right.x + 5, right.y],
      [right.x - 6, right.y + 5],
    ],
    { color: C.red, width: 1.3 },
  );
  for (const [b, text] of [
    [nap, "doze"],
    [nervous, "nervous"],
    [ants, "ants"],
  ]) {
    handwriting(c, text, b.x, b.y - 13, {
      size: 19,
      align: "center",
      color: C.teal,
    });
    const hint =
      b === nap
        ? "z / wake by a touch"
        : b === nervous
          ? "t / a worried moment"
          : "a / a tiny rescue";
    handwriting(c, hint, b.x, b.y - 45, {
      size: 16,
      align: "center",
      color: C.red,
      progress: b.ink.progress,
    });
  }
  if (s.mobile)
    handwriting(c, "1 - 3 : visit / arrows : walk", s.w / 2, 981, {
      size: 20,
      align: "center",
      color: C.soft,
    });
  c.restore();
  if (g.selected >= 0 && v > 0.002) {
    const i = g.selected,
      a = places[i],
      center = { x: s.w / 2, y: s.mobile ? 438 : 395 };
    drawPainting(c, i, a.x + (center.x - a.x) * v, a.y + (center.y - a.y) * v, {
      time: t,
      scale: a.scale + ((s.mobile ? 1.82 : 1.92) - a.scale) * v,
      reduced: s.reduced,
      alpha: Math.min(1, v * 3),
      effect: effects[i],
    });
    c.save();
    c.globalAlpha = v;
    handwriting(c, titles[i], s.w / 2, s.mobile ? 154 : 107, {
      size: s.mobile ? 32 : 34,
      align: "center",
      color: C.red,
      progress: captions.progress,
    });
    notes[i].forEach((text, j) =>
      handwriting(c, text, s.w / 2, (s.mobile ? 752 : 658) + j * 35, {
        size: s.mobile ? 24 : 22,
        align: "center",
        progress: Math.max(0, captions.progress * 2 - j * 0.52),
        seed: 512 + i * 5 + j,
      }),
    );
    handwriting(c, "back", s.w / 2, back.y - 16, {
      size: 25,
      align: "center",
      color: C.teal,
      progress: Math.min(1, captions.progress * 2),
    });
    curve(
      c,
      [
        [s.w / 2 - 64, back.y],
        [s.w / 2 - 81, back.y - 2],
        [s.w / 2 - 70, back.y - 12],
      ],
      { color: C.teal, width: 1.1 },
    );
    c.restore();
  }
};
s.debug = () => ({
  demo: "courtyard-gallery",
  character,
  mode: g.mode,
  guide: {
    x: g.x,
    y: g.y,
    speed: g.speed,
    target: { ...g.target },
    steps: g.steps,
    state: rig.state,
    pose: { ...rig.puppet.out },
    springs: { ...rig.puppet.springs.s },
  },
  selected: g.selected,
  pending: g.pending,
  view: view.value,
  caption: captions.progress,
  closing,
  counts: [...counts],
  touches: [...touches],
  footprints: footprints.length,
  opening: s.openingTime,
  openingDone: s.openingDone,
  reduced: s.reduced,
  sounds: s.audio.count,
  objects: {
    counts: { ...life.count },
    lit: life.lit,
    pose: life.pose,
    age: { ...life.age },
    ripples: life.ripples.length,
  },
  props: Object.fromEntries(
    Object.entries(props).map(([id, a]) => [
      id,
      { ground: a.ground, x: a.x, y: a.y },
    ]),
  ),
  hints: Object.fromEntries(
    objects.map((entry) => [entry.kind, entry.button.ink.progress]),
  ),
});
s.start();
