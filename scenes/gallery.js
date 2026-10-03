import { SceneHost } from "./host.js";
import { GalleryWalk } from "./gallery-model.js";
import { Spring } from "../primitives/motion.js";
import { InkTransition } from "../primitives/ink.js";
import { Pencil, palette as C } from "../primitives/living-ink.js";
import { handwriting } from "../primitives/handwriting.js";
import { drawGuide, drawPainting, plant } from "./art.js";
import { GuideMotion } from "./guide-motion.js";
import { visitorProfiles } from "./guide-rig.js";
import {
  clampGround,
  courtyardProps as props,
  benchGeometry,
  benchPoint,
} from "./courtyard-layout.js";
import { CourtyardLife } from "./courtyard-life.js";
import { drawIllustratedControl } from "../primitives/illustrated-control.js";
import { drawCourtyardOrnaments } from "./courtyard-ornaments.js";
import { VisitorRedraw } from "./visitor-redraw.js";
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
  oldRig = null;
const visitorRedraw = new VisitorRedraw();
g.configureBench(benchGeometry);
g.stride = rig.profile.stride;
g.character = character;
const portraits = Object.keys(visitorProfiles).map(
  (id, i) => new GuideMotion(240 + i, id),
);
const view = new Spring(0, { stiffness: 53, damping: 15 });
const captions = new InkTransition({ writeSeconds: 1.05, eraseSeconds: 0.42 });
const exhibitHint = new InkTransition({
  writeSeconds: 0.38,
  eraseSeconds: 0.24,
});
let currentHint = -1,
  afterDismount = null;
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
function seatPoint(x) {
  const p = benchPoint(x, -8, -10),
    b = props.bench;
  return { x: b.x + p[0] * b.scale, y: b.y + p[1] * b.scale };
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
      g.walkTo(gardenBench.x + 24, gardenBench.y + 24);
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
  if (visitorRedraw.start(s.reduced)) oldRig = rig;
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
  g.character = id;
  character = id;
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
  if (g.mode === "sitting") {
    afterDismount = "carry";
    g.walkTo(gardenBench.x, gardenBench.y);
    return;
  }
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
  // Header/caption has its own paper band, above the highest cloud and roof.
  projection = s.mobile ? { x: 5, y: 370, k: 0.57 } : { x: 0, y: 108, k: 1 };
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
  const b = screen(seatPoint(60));
  // The free right-hand seat remains tappable while the visitor occupies the left.
  s.place(seat, b.x, b.y, 70 * projection.k, 58 * projection.k);
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
      s.mobile ? 245 : 204,
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
  const y = s.mobile ? 1040 : 887;
  s.place(left, 65, y, 43, 43);
  s.place(right, 112, y, 43, 43);
  s.place(nap, s.mobile ? 205 : 740, y, 76, 64);
  s.place(nervous, s.mobile ? 350 : 863, y, 76, 64);
  s.place(ants, s.mobile ? 518 : 1000, y, 88, 64);
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
  if (e.key.toLowerCase() === "z") nap.el.click();
  if (e.key.toLowerCase() === "t") nervous.el.click();
  if (e.key.toLowerCase() === "a") ants.el.click();
};
s.onReplay = () => {
  closing = false;
  g.close();
  view.snap(0);
  captions.setVisible(false, true);
  rig.react("awake");
  life.reset();
  oldRig = null;
  visitorRedraw.reset();
  exhibitHint.setVisible(false, true);
  currentHint = -1;
  afterDismount = null;
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
  visitorRedraw.update(dt);
  for (const entry of visitors)
    entry.portrait.update(dt, {
      hover: entry.button.hover || entry.button.focus,
      active: true,
      reduced: s.reduced,
      look: entry.button.hover || entry.button.focus ? 0.6 : 0,
    });
  if (visitorRedraw.phase !== "erasing") oldRig = null;
  for (const e of events) {
    if (e.name === "stand" && afterDismount) {
      g.close();
      rig.react(afterDismount);
      afterDismount = null;
    }
    if (e.name === "footstep") {
      s.audio.play("step", { strength: 0.28, pan: (g.x - 560) / 1120 });
      for (const side of e.pair ? [-1, 1] : [e.side])
        footprints.push({ x: e.x + side * 7, y: e.y + 2, life: 0.6 });
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
  exhibitHint.setVisible(
    currentHint === attention && attention >= 0 && !closing,
    s.reduced,
  );
  exhibitHint.update(dt);
  if (exhibitHint.progress === 0 && currentHint !== attention) {
    currentHint = attention;
    exhibitHint.setVisible(attention >= 0, s.reduced);
  }
  const target = attention >= 0 ? stations[attention] : pointer;
  const near =
    pointer && Math.hypot(pointer.x - g.x, pointer.y - g.y + 45) < 65;
  rig.update(dt, {
    speed: s.openingDone ? g.speed : 0,
    walkPhase: g.phase,
    groundX: g.drawingPose.x,
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
    active:
      ["walking", "mounting", "dismounting"].includes(g.mode) ||
      (near && s.time - s.inputTime < 0.35),
    hover: guide.hover || guide.focus,
    seated: g.seatAmount,
    reduced: s.reduced || !s.openingDone,
  });
  if (oldRig)
    oldRig.update(dt, {
      speed: g.speed,
      walkPhase: g.phase,
      groundX: g.drawingPose.x,
      look: g.look,
      active: true,
      reduced: s.reduced,
      seated: g.seatAmount,
    });
  const drawingPose = g.drawingPose;
  const gp = screen({
    x: drawingPose.x,
    y: drawingPose.y - drawingPose.hop - 55,
  });
  s.place(
    guide,
    gp.x,
    gp.y - (character === "rabbit" ? 9 : 0),
    89 * projection.k,
    (character === "rabbit" ? 137 : 112) * projection.k,
  );
  // Native pointer input must hit the exposed seat, not a foreground character.
  const benchLeft = seatPoint(-44),
    benchRight = seatPoint(60);
  const freeSeat =
    Math.abs(drawingPose.x - benchRight.x) >
    Math.abs(drawingPose.x - benchLeft.x)
      ? benchRight
      : benchLeft;
  const exposedSeat = screen(freeSeat);
  s.place(
    seat,
    exposedSeat.x,
    exposedSeat.y,
    70 * projection.k,
    58 * projection.k,
  );
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
  if (["mounting", "dismounting"].includes(g.mode))
    for (const b of [nap, nervous, ants]) b.el.disabled = true;
  seat.el.setAttribute(
    "aria-label",
    g.mode === "sitting" ? "从长凳下来" : "走到长凳坐下",
  );
};
s.isWriting = () => captions.progress > 0 && captions.progress < 1;
s.isErasing = () => closing;

function drawWorld(c, t) {
  c.save();
  c.translate(projection.x, projection.y);
  c.scale(projection.k, projection.k);
  drawCourtyardOrnaments(c, { time: t, reduced: s.reduced });
  courtyardGround.draw(c, 0, 0, { time: 0, reduced: true });
  const layers = stations.map((a, i) => ({
    depth: a.ground,
    draw: () => {
      kiosks[i].draw(c, a.x, a.y, { time: 0, scale: a.scale, reduced: true });
      c.save();
      c.translate(a.x, a.y + 6);
      c.transform(1, a.basis.slope, 0, 1, 0, 0);
      drawPainting(c, i, 0, 0, {
        time: t,
        scale: a.scale * 0.83,
        reduced: s.reduced,
        effect: effects[i],
      });
      c.restore();
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
    depth: ["mounting", "sitting", "dismounting"].includes(g.mode)
      ? props.bench.ground.y + 1
      : g.y,
    draw: () => {
      const actor = oldRig ?? rig,
        progress = oldRig
          ? visitorRedraw.oldProgress
          : visitorRedraw.newProgress;
      const openingDrawing = c.sceneDrawing;
      c.sceneDrawing = (seed) =>
        Math.min(openingDrawing?.(seed) ?? 1, progress);
      drawGuide(c, g.drawingPose.x, g.drawingPose.y, {
        ...actor.pose,
        time: t,
        scale: 0.69 + (g.y - 470) * 0.00045,
        seated: g.drawingPose.seated,
        hop: g.drawingPose.hop,
        squash: g.drawingPose.squash,
        reduced: s.reduced,
      });
      c.sceneDrawing = openingDrawing;
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
      g.mode === "sitting" ? "step down" : "sit with a little friend",
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
  handwriting(c, "the courtyard gallery", s.w / 2, s.mobile ? 136 : 104, {
    size: s.mobile ? 34 : 38,
    align: "center",
    color: C.red,
    progress: s.intro.progress,
  });
  drawWorld(c, t);
  if (currentHint >= 0)
    handwriting(c, titles[currentHint], s.w / 2, s.mobile ? 330 : 229, {
      size: 19,
      align: "center",
      color: C.teal,
      progress: exhibitHint.progress,
    });
  for (const entry of visitors) {
    const b = entry.button;
    drawGuide(c, b.x, b.y + 21, {
      ...entry.portrait.pose,
      time: t,
      scale: entry.id === "rabbit" ? 0.33 : 0.37,
      reduced: s.reduced,
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
      s.mobile ? 303 : 260,
      { size: 17, align: "center", color: C.teal, progress: b.ink.progress },
    );
  }
  handwriting(
    c,
    "walk over to a picture",
    s.mobile ? s.w / 2 : 362,
    s.mobile ? 986 : 882,
    {
      size: s.mobile ? 23 : 20,
      align: "center",
      color: C.soft,
      progress: s.openingDone ? 1 : 0,
    },
  );
  for (const [b, type, label] of [
    [left, "left", "walk left"],
    [right, "right", "walk right"],
  ])
    drawIllustratedControl(c, b, type, {
      time: t,
      reduced: s.reduced,
      scale: 0.37,
      label,
      labelY: b.y - 35,
    });
  for (const [b, type, state] of [
    [nap, "doze", "asleep"],
    [nervous, "nervous", "nervous"],
    [ants, "ants", "carry"],
  ]) {
    drawIllustratedControl(c, b, type, {
      time: t,
      reduced: s.reduced,
      label: type,
      labelY: b.y - 50,
      scale: 0.68,
      active: rig.state === state,
    });
  }
  if (s.mobile)
    handwriting(c, "1 - 3 : visit / arrows : walk", s.w / 2, 1101, {
      size: 20,
      align: "center",
      color: C.soft,
    });
  c.restore();
  if (g.selected >= 0 && v > 0.002) {
    const i = g.selected,
      a = places[i],
      center = { x: s.w / 2, y: s.mobile ? 438 : 395 };
    c.save();
    c.translate(
      a.x + (center.x - a.x) * v,
      a.y + 6 * projection.k + (center.y - a.y - 6 * projection.k) * v,
    );
    c.transform(1, stations[i].basis.slope * (1 - v), 0, 1, 0, 0);
    drawPainting(c, i, 0, 0, {
      time: t,
      scale: a.scale * 0.83 + ((s.mobile ? 1.82 : 1.92) - a.scale * 0.83) * v,
      reduced: s.reduced,
      alpha: Math.min(1, v * 3),
      effect: effects[i],
    });
    c.restore();
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
    drawIllustratedControl(c, back, "back", {
      time: t,
      reduced: s.reduced,
      label: "back to courtyard",
      scale: 0.7,
      labelY: back.y + 30,
    });
    c.restore();
  }
};
s.debug = () => ({
  demo: "courtyard-gallery",
  character,
  layout: {
    projection,
    titleY: s.mobile ? 136 : 104,
    exhibitTitleY: s.mobile ? 330 : 229,
    width: s.w,
    height: s.h,
  },
  mode: g.mode,
  guide: {
    x: g.x,
    y: g.y,
    speed: g.speed,
    target: { ...g.target },
    steps: g.steps,
    state: rig.state,
    locomotion: { phase: g.phase, gait: rig.gait.value },
    seat: { amount: g.seatAmount, ...g.drawingPose },
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
  visitorDrawing: {
    phase: visitorRedraw.phase,
    old: visitorRedraw.oldProgress,
    next: visitorRedraw.newProgress,
  },
  exhibitCaption: { index: currentHint, progress: exhibitHint.progress },
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
  controls: Object.fromEntries(
    s.buttons
      .filter((b) => b.artType)
      .map((b) => [
        b.el.id,
        {
          icon: b.artType,
          hover: b.response.value,
          ink: b.ink.progress,
          enabled: !b.el.disabled,
        },
      ]),
  ),
});
s.start();
