import { SceneHost } from "./host.js";
import { GalleryWalk } from "./gallery-model.js";
import { Spring } from "../primitives/motion.js";
import { InkTransition } from "../primitives/ink.js";
import {
  InkSprite,
  Pencil,
  palette as C,
  curve,
  ellipsePoints,
  wax,
} from "../primitives/living-ink.js";
import { handwriting } from "../primitives/handwriting.js";
import { drawGuide, drawPainting, plant, bench, pencilProp } from "./art.js";
const s = new SceneHost("gallery"),
  g = new GalleryWalk(),
  view = new Spring(0, { stiffness: 53, damping: 15 }),
  scarf = new Spring(0, { stiffness: 75, damping: 9 });
const captions = new InkTransition({ writeSeconds: 1.05, eraseSeconds: 0.42 });
const titles = ["night greenhouse", "the post office", "the harbour"];
const notes = [
  ["the gardener fell asleep.", "tap the glass to wake him."],
  ["one more letter to deliver.", "tap to send it to the letterbox."],
  ["the tide is coming in.", "tap the water for a little breeze."],
];
let env,
  places,
  ready = 0,
  closing = false,
  counts = [0, 0, 0],
  footprints = [],
  attention = -1,
  effects = [10, 10, 10],
  touches = [0, 0, 0];
const floor = s.button("gallery-floor", "点击地面行走，或使用方向键", (e) => {
  if (g.selected >= 0 || closing) return;
  const p = e.detail ? s.point(e) : { x: s.w / 2, y: s.mobile ? 907 : 701 };
  go(p.x, p.y);
});
const works = titles.map((name, i) =>
  s.button("gallery-work-" + i, "走近并观察作品 " + (i + 1) + "：" + name, () =>
    choose(i),
  ),
);
const seat = s.button("gallery-bench", "走到长凳坐下", () => {
  if (g.selected < 0) {
    const b = benchPos();
    g.walkTo(b.x, b.y - 10, { sit: true });
  }
});
const back = s.button("gallery-back", "退出观察，回到展厅", () => close());
back.el.hidden = true;
const inspect = s.button(
  "gallery-inspect",
  "触碰作品内部：唤醒园丁、寄信或吹动小船",
  () => {
    if (g.selected >= 0) {
      effects[g.selected] = 0;
      touches[g.selected]++;
      s.audio.play(g.selected === 2 ? "leaf" : "paper", { strength: 0.18 });
      s.announce(
        ["园丁睁开眼，温室窗里亮起来", "信件飞向邮筒", "小船回应海风"][
          g.selected
        ],
      );
    }
  },
);
inspect.el.hidden = true;
const left = s.button("gallery-left", "向左走", () => go(g.x - 100, g.y));
const right = s.button("gallery-right", "向右走", () => go(g.x + 100, g.y));
function benchPos() {
  return s.mobile ? { x: 338, y: 930 } : { x: 661, y: 662 };
}
function go(x, y) {
  g.walkTo(
    Math.max(87, Math.min(s.w - 87, x)),
    Math.max(s.mobile ? 765 : 569, Math.min(s.mobile ? 978 : 725, y)),
  );
  s.announce("参观者走向新的位置");
}
function choose(i) {
  if (closing) return;
  if (g.selected >= 0) {
    close();
    return;
  }
  counts[i]++;
  const p = places[i];
  g.walkTo(p.x, s.mobile ? 797 : 598, { art: i });
  s.announce("参观者走向作品 " + (i + 1));
}
function close() {
  if (g.selected < 0) return;
  closing = true;
  captions.setVisible(false, s.reduced);
  s.announce("擦去说明，回到展厅");
}
s.layout = () => {
  places = s.mobile
    ? [
        { x: 154, y: 407, scale: 0.68 },
        { x: 462, y: 389, scale: 0.68 },
        { x: 329, y: 668, scale: 0.62 },
      ]
    : [
        { x: 266, y: 333, scale: 0.91 },
        { x: 535, y: 282, scale: 0.78 },
        { x: 834, y: 368, scale: 0.95 },
      ];
  const minY = s.mobile ? 765 : 569,
    maxY = s.mobile ? 978 : 725;
  if (!s.lastLayoutWidth) {
    g.x = s.mobile ? 169 : 548;
    g.y = s.mobile ? 951 : 693;
    g.target = { x: g.x, y: g.y };
  } else if (g.selected >= 0) {
    g.x = places[g.selected].x;
    g.y = s.mobile ? 797 : 598;
    g.target = { x: g.x, y: g.y };
  } else if (g.mode === "sitting") {
    const b = benchPos();
    g.x = b.x;
    g.y = b.y - 10;
    g.target = { x: g.x, y: g.y };
  } else {
    const ratio = s.w / s.lastLayoutWidth;
    g.x = Math.max(87, Math.min(s.w - 87, g.x * ratio));
    g.y = Math.max(minY, Math.min(maxY, g.y));
    g.target = {
      x: Math.max(87, Math.min(s.w - 87, g.target.x * ratio)),
      y: Math.max(minY, Math.min(maxY, g.target.y)),
    };
  }
  s.lastLayoutWidth = s.w;
  // Resize keeps observation identity and relocates the character's approach target.
  if (g.mode === "walking" && g.pending >= 0) {
    g.target = { x: places[g.pending].x, y: s.mobile ? 797 : 598 };
  }
  env = new InkSprite(
    s.w,
    s.h,
    (p, c) => {
      // Exhibition room: bowed wall, picture wires, planked perspective floor.
      const bottom = s.mobile ? 764 : 548;
      p.line(
        [
          [62, 188],
          [48, bottom],
          [s.w - 51, bottom + 10],
          [s.w - 64, 178],
        ],
        { width: 1.6, color: C.soft },
      );
      p.line(
        [
          [47, bottom + 15],
          [s.w - 51, bottom + 24],
        ],
        { width: 1.4 },
      );
      p.line(
        [
          [48, bottom + 24],
          [s.w - 53, bottom + 34],
        ],
        { width: 0.8, color: C.honey },
      );
      for (let i = 0; i < 9; i++) {
        const xb = 75 + (i * (s.w - 150)) / 8;
        p.line(
          [
            [s.w / 2 + (xb - s.w / 2) * 0.72, bottom + 28],
            [xb, s.mobile ? 1000 : 745],
          ],
          { width: 0.75, color: "#b9a586" },
        );
      }
      for (let i = 0; i < 5; i++) {
        const y = bottom + 44 + i * i * (s.mobile ? 10 : 6.3);
        p.line(
          [
            [57, y],
            [s.w - 61, y + 2],
          ],
          { width: 0.75, color: "#b9a586" },
        );
      }
      // Small section of roof window and four pinned stars: a quiet margin.
      p.line(
        [
          [s.mobile ? 302 : 490, 173],
          [s.mobile ? 341 : 628, 175],
        ],
        { width: 0.8, color: C.soft },
      );
      for (let j = 0; j < 3; j++) {
        const x = (s.mobile ? 307 : 514) + j * (s.mobile ? 14 : 36);
        p.line(
          [
            [x, 174],
            [x, 185 + (j % 2) * 7],
          ],
          { width: 0.8, color: C.soft },
        );
        p.shape(
          [
            [x, 181 + (j % 2) * 7],
            [x - 4, 185 + (j % 2) * 7],
            [x, 190 + (j % 2) * 7],
            [x + 4, 185 + (j % 2) * 7],
          ],
          C.yellow,
          { angular: true, width: 0.7, seed: 1950 + j },
        );
      }
      for (const a of places) {
        p.line(
          [
            [a.x - 4, a.y - 160 * a.scale],
            [a.x - 42 * a.scale, a.y - 126 * a.scale],
          ],
          { width: 1 },
        );
        p.line(
          [
            [a.x - 4, a.y - 160 * a.scale],
            [a.x + 43 * a.scale, a.y - 125 * a.scale],
          ],
          { width: 1 },
        );
        p.dot(a.x - 4, a.y - 161 * a.scale, 2);
      }
      const b = benchPos();
      bench(p, b.x, b.y, 0.8);
      // Door at the far side, filled threshold and metal latch.
      const dx = s.mobile ? 558 : 1001,
        dy = s.mobile ? 842 : 480,
        ds = s.mobile ? 0.62 : 0.81;
      c.save();
      c.translate(dx, dy);
      c.scale(ds, ds);
      p.shape(
        [
          [-40, 0],
          [-43, -94],
          [-24, -117],
          [16, -119],
          [39, -97],
          [38, 0],
        ],
        C.teal,
        { seed: 1901, width: 1.5, double: true },
      );
      p.line(
        [
          [-32, -5],
          [-34, -92],
          [-20, -107],
          [15, -109],
          [29, -91],
          [29, -6],
        ],
        { width: 0.8, color: C.cream },
      );
      p.shape(
        [
          [-21, -94],
          [18, -94],
          [19, -60],
          [-21, -60],
        ],
        C.cream,
        { angular: true, seed: 1902, width: 0.8 },
      );
      handwriting(c, "exit", 0, -89, { size: 12, align: "center" });
      p.oval(24, -39, 3, 4, C.yellow, { width: 0.8 });
      p.line(
        [
          [-45, 2],
          [43, 2],
        ],
        { width: 1.5 },
      );
      c.restore();
      pencilProp(p, s.mobile ? 73 : 990, s.mobile ? 967 : 716, -1.25, 0.57);
      handwriting(
        c,
        "click the floor to walk",
        s.w / 2,
        s.mobile ? 1030 : 783,
        { size: s.mobile ? 22 : 21, align: "center", color: C.soft },
      );
    },
    { pivot: [0, 0], seed: 150, variants: 1 },
  );
  s.place(
    floor,
    s.w / 2,
    s.mobile ? 875 : 660,
    s.w - 130,
    s.mobile ? 244 : 218,
  );
  places.forEach((p, i) =>
    s.place(works[i], p.x, p.y, 230 * p.scale, 248 * p.scale),
  );
  const b = benchPos();
  s.place(seat, b.x, b.y, 190, 82);
  s.place(back, s.w / 2, s.mobile ? 983 : 741, 190, 53);
  s.place(
    inspect,
    s.w / 2,
    s.mobile ? 438 : 395,
    s.mobile ? 440 : 448,
    s.mobile ? 465 : 476,
  );
  s.place(left, s.mobile ? 61 : 83, s.mobile ? 1024 : 777, 45, 43);
  s.place(right, s.mobile ? s.w - 61 : 133, s.mobile ? 1024 : 777, 45, 43);
};
s.layout();
s.onKey = (e) => {
  if (e.key === "Escape") {
    close();
    return;
  }
  if (g.selected >= 0) return;
  const d = {
    ArrowLeft: [-78, 0],
    ArrowRight: [78, 0],
    ArrowUp: [0, -48],
    ArrowDown: [0, 48],
  }[e.key];
  if (d) {
    e.preventDefault();
    go(g.x + d[0], g.y + d[1]);
  }
  if (["1", "2", "3"].includes(e.key)) choose(+e.key - 1);
};
s.onReduced = () => {
  if (s.reduced) {
    captions.setVisible(g.selected >= 0 && !closing, true);
  }
};
s.update = (dt) => {
  const events = g.update(dt, s.reduced);
  for (const e of events) {
    if (e.name === "footstep") {
      s.audio.play("step", { pan: (g.x - s.w / 2) / s.w, strength: 0.46 });
      footprints.push({
        x: e.x + e.side * 10,
        y: e.y + 3,
        life: 0.75,
        side: e.side,
      });
    }
    if (e.name === "arrive") {
      ready = 0.24;
      s.announce("观察作品 " + (e.art + 1) + "，按 Esc 返回");
    }
  }
  if (g.mode === "looking") {
    ready -= dt;
    if (ready <= 0) {
      g.mode = "detail";
      captions.setVisible(true, s.reduced);
      s.audio.play("paper", { strength: 0.27 });
    }
  }
  if (closing && captions.progress <= 0) {
    view.target = 0;
    if (view.value < 0.005) {
      g.close();
      closing = false;
    }
  } else view.target = g.mode === "detail" ? 1 : 0;
  view.update(dt, s.reduced);
  captions.update(dt);
  effects = effects.map((x) => x + dt);
  if (s.reduced && closing && captions.progress === 0) {
    g.close();
    closing = false;
  }
  scarf.target = g.mode === "walking" ? -g.look * 0.09 : 0;
  scarf.update(dt, s.reduced);
  footprints = footprints
    .map((p) => ({ ...p, life: p.life - dt }))
    .filter((p) => p.life > 0)
    .slice(-30);
  attention = works.findIndex((b) => b.hover || b.focus);
  const inDetail = g.selected >= 0 && g.mode === "detail";
  back.el.hidden = !inDetail;
  inspect.el.hidden = !inDetail;
  inspect.el.disabled = closing;
  for (const b of [...works, seat, floor, left, right])
    b.el.disabled = inDetail || closing;
};
s.isWriting = () => captions.progress > 0 && captions.progress < 1;
s.isErasing = () => closing;
s.draw = (c) => {
  const t = s.reduced ? 0 : s.time,
    v = Math.max(0, Math.min(1, view.value));
  c.save();
  c.globalAlpha = 1 - v * 0.96;
  env.draw(c, 0, 0, { time: 0, reduced: true });
  handwriting(c, "the paper gallery", s.w / 2, 87, {
    size: s.mobile ? 38 : 45,
    align: "center",
    color: C.red,
    progress: s.intro.progress,
  });
  plant.draw(c, s.mobile ? 77 : 111, s.mobile ? 802 : 557, {
    scale: s.mobile ? 0.58 : 0.72,
    time: t,
    reduced: s.reduced,
  });
  places.forEach((a, i) => {
    drawPainting(c, i, a.x, a.y, {
      scale: a.scale,
      time: t + i * 0.19,
      reduced: s.reduced,
      effect: effects[i],
    });
    handwriting(c, "no. " + (i + 1), a.x, a.y + 139 * a.scale, {
      size: 16,
      align: "center",
      color: C.soft,
    });
    handwriting(c, titles[i], a.x, a.y + 160 * a.scale, {
      size: s.mobile ? 17 : 19,
      align: "center",
      color: C.red,
      progress: works[i].ink.progress,
    });
  });
  for (const f of footprints) {
    const p = new Pencil(c);
    c.save();
    c.globalAlpha *= (f.life / 0.75) * 0.45;
    p.oval(f.x, f.y, 4, 1.6, null, { width: 0.7, outline: C.honey });
    c.restore();
  }
  const look =
    g.mode === "walking"
      ? g.look
      : attention >= 0
        ? Math.sign(places[attention].x - g.x)
        : s.pointer
          ? Math.max(-1, Math.min(1, (s.pointer.x - g.x) / 180))
          : 0;
  drawGuide(c, g.x, g.y, {
    time: t,
    scale: s.mobile ? 0.9 : 0.88,
    walk: g.mode === "walking" ? (g.distance / 25) * Math.PI : 0,
    look,
    lookY:
      g.selected >= 0 || attention >= 0
        ? -0.8
        : s.pointer
          ? Math.max(-0.8, Math.min(0.6, (s.pointer.y - g.y + 60) / 180))
          : 0,
    scarf: scarf.value,
    seated: g.mode === "sitting",
    reduced: s.reduced,
  });
  if (g.mode === "walking" && g.pending >= 0)
    handwriting(c, "going to no. " + (g.pending + 1), g.x, g.y + 26, {
      size: 17,
      align: "center",
      color: C.red,
    });
  if (g.mode === "sitting")
    handwriting(c, "click the floor to stand up", g.x, g.y + 37, {
      size: 17,
      align: "center",
      color: C.red,
      progress: seat.ink.progress,
    });
  const p = new Pencil(c);
  p.line(
    [
      [left.x + 7, left.y - 6],
      [left.x - 5, left.y],
      [left.x + 7, left.y + 7],
    ],
    { width: 1.5, color: C.red },
  );
  p.line(
    [
      [right.x - 7, right.y - 6],
      [right.x + 5, right.y],
      [right.x - 7, right.y + 7],
    ],
    { width: 1.5, color: C.red },
  );
  c.restore();
  if (g.selected >= 0 && v > 0.002) {
    const i = g.selected,
      a = places[i],
      center = { x: s.w / 2, y: s.mobile ? 438 : 395 };
    const scale = a.scale + (s.mobile ? 1.82 : 1.92 - a.scale) * v;
    const actual = s.mobile ? a.scale + (1.82 - a.scale) * v : scale;
    drawPainting(c, i, a.x + (center.x - a.x) * v, a.y + (center.y - a.y) * v, {
      time: t,
      scale: actual,
      reduced: s.reduced,
      alpha: Math.min(1, v * 3),
      effect: effects[i],
    });
    c.save();
    c.globalAlpha = v;
    handwriting(c, titles[i], s.w / 2, s.mobile ? 154 : 107, {
      size: s.mobile ? 32 : 34,
      color: C.red,
      align: "center",
      progress: captions.progress,
    });
    const y = s.mobile ? 752 : 658;
    notes[i].forEach((text, j) =>
      handwriting(c, text, s.w / 2, y + j * 35, {
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
      { color: C.teal, width: 1.5 },
    );
    // Detail life belongs to the picture's world, not an unrelated spinner.
    if (i === 0) {
      const glow = 0.06 + 0.04 * Math.sin(t * 1.7);
      c.fillStyle = `rgba(240,192,81,${glow})`;
      c.beginPath();
      c.ellipse(s.w / 2 + 11, center.y + 51, 26, 30, 0, 0, Math.PI * 2);
      c.fill();
    }
    if (i === 2) {
      for (let j = 0; j < 3; j++)
        curve(
          c,
          [
            [s.w / 2 + 20 + j * 44, center.y + 140],
            [s.w / 2 + 32 + j * 44, center.y + 138 + Math.sin(t * 1.4 + j) * 2],
            [s.w / 2 + 52 + j * 44, center.y + 141],
          ],
          { width: 1, color: C.paper, alpha: 0.7 },
        );
    }
    c.restore();
  }
};
s.debug = () => ({
  demo: "gallery-scene",
  mode: g.mode,
  guide: { x: g.x, y: g.y, target: { ...g.target }, steps: g.steps },
  selected: g.selected,
  pending: g.pending,
  view: view.value,
  caption: captions.progress,
  closing,
  counts: [...counts],
  touches: [...touches],
  footprints: footprints.length,
  reduced: s.reduced,
  audio: s.audio.context?.state || "locked",
  sounds: s.audio.count,
  contourFrame: Math.floor(s.time * 8) % 4,
});
s.start();
