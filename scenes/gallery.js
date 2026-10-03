import { SceneHost } from "./host.js";
import { GalleryWalk } from "./gallery-model.js";
import { Spring } from "../primitives/motion.js";
import { InkTransition } from "../primitives/ink.js";
import { Pencil, palette as C, curve } from "../primitives/living-ink.js";
import { handwriting } from "../primitives/handwriting.js";
import { drawGuide, drawPainting, plant } from "./art.js";
import { GuideMotion } from "./guide-motion.js";
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
  g = new GalleryWalk(372, 607),
  rig = new GuideMotion();
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
// Affine ground coordinates constrain the guide to the paving platform.
function groundClamp(x, y) {
  const dx = x - 110,
    dy = y - 456,
    det = 506 * 270 + 132 * 404;
  const u = Math.max(0.05, Math.min(0.93, (dx * 270 - dy * 404) / det));
  const v = Math.max(0.27, Math.min(0.92, (dy * 506 + dx * 132) / det));
  return { x: 110 + 506 * u + 404 * v, y: 456 - 132 * u + 270 * v };
}
function go(x, y) {
  if (g.selected >= 0 || closing || rig.state === "carry") return;
  const p = groundClamp(x, y);
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
    g.walkTo(gardenBench.x + 4, gardenBench.y + 6, { sit: true });
  }
});
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
  const b = screen(gardenBench);
  s.place(seat, b.x, b.y, 190 * projection.k, 99 * projection.k);
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
};
s.onReduced = () => {
  if (s.reduced) captions.setVisible(g.selected >= 0 && !closing, true);
};
s.update = (dt) => {
  const events = s.openingDone ? g.update(dt, s.reduced) : [];
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
  const gp = screen({ x: g.x, y: g.y - 55 });
  s.place(guide, gp.x, gp.y, 89 * projection.k, 112 * projection.k);
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
  layers.push({
    depth: 544,
    draw: () =>
      plant.draw(c, 180, 501, { time: t, scale: 0.5, reduced: s.reduced }),
  });
  layers.push({
    depth: 601,
    draw: () =>
      lantern.draw(c, 941, 538, { time: 0, scale: 0.71, reduced: true }),
  });
  layers.push({
    depth: 678,
    draw: () =>
      courtyardBench.draw(c, gardenBench.x, gardenBench.y, {
        time: 0,
        scale: 0.81,
        reduced: true,
      }),
  });
  layers.push({
    depth: 697,
    draw: () =>
      wateringCan.draw(c, 570, 691, {
        time: t,
        scale: 0.54,
        reduced: s.reduced,
      }),
  });
  layers.push({
    depth: 719,
    draw: () =>
      plant.draw(c, 352, 683, { time: t, scale: 0.55, reduced: s.reduced }),
  });
  layers.push({
    depth: g.y + (g.mode === "sitting" ? 40 : 0),
    draw: () =>
      drawGuide(c, g.x, g.y, {
        ...rig.pose,
        time: t,
        scale: 0.69 + (g.y - 470) * 0.00045,
        seated: g.mode === "sitting",
        reduced: s.reduced,
      }),
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
});
s.start();
