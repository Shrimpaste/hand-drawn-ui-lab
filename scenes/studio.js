import { SceneHost } from "./host.js";
import { GuideMotion } from "./guide-motion.js";
import { drawGuide, plant, paintings } from "./art.js";
import { handwriting } from "../primitives/handwriting.js";
import { Pencil, palette as C } from "../primitives/living-ink.js";
const s = new SceneHost("studio");
let character = "mushroom";
let rig = new GuideMotion(127, character);
let fixedRig = new GuideMotion(127, character);
fixedRig.update(0, { reduced: true });
const cast = ["mushroom", "rabbit", "owl"];
const castButtons = cast.map((name) =>
  s.button("drawing-" + name, "比较 " + name + " 的三张画稿", () => {
    character = name;
    rig = new GuideMotion(127, name);
    fixedRig = new GuideMotion(127, name);
    fixedRig.update(0, { reduced: true });
    castButtons.forEach((b, i) =>
      b.el.setAttribute("aria-pressed", String(cast[i] === name)),
    );
  }),
);
castButtons.forEach((b, i) =>
  b.el.setAttribute("aria-pressed", String(i === 0)),
);
const cues = [
  "step",
  "paper",
  "leaf",
  "stone",
  "bell",
  "switch",
  "write",
  "erase",
];
const buttons = cues.map((name) =>
  s.button("cue-" + name, "试听 " + name, () => s.audio.play(name)),
);
const repeat = s.button("rewrite", "重新绘制全部画稿", () =>
  s.replay.el.click(),
);
s.update = (dt) => {
  const liveX = s.mobile ? 440 : 460;
  rig.update(dt, {
    look: s.pointer
      ? Math.max(-1, Math.min(1, (s.pointer.x - liveX) / 180))
      : 0,
    lookY: s.pointer
      ? Math.max(-0.8, Math.min(0.6, (s.pointer.y - 360) / 160))
      : 0,
    hover:
      s.pointer && Math.hypot(s.pointer.x - liveX, s.pointer.y - 350) < 100,
    active: !!s.pointer && s.time - s.inputTime < 0.35,
    reduced: s.reduced || !s.openingDone,
  });
  buttons.forEach((b, i) =>
    s.place(
      b,
      s.mobile ? 85 + (i % 4) * 160 : 75 + i * 135,
      s.mobile ? 970 + Math.floor(i / 4) * 65 : 747,
      110,
      52,
    ),
  );
  castButtons.forEach((b, i) =>
    s.place(
      b,
      s.mobile ? 115 + i * 205 : 758 + i * 122,
      s.mobile ? 820 : 475,
      112,
      52,
    ),
  );
  s.place(repeat, s.mobile ? 325 : 858, s.mobile ? 892 : 590, 180, 58);
};
s.draw = (c) => {
  handwriting(c, "drawing bench", 43, 115, {
    size: s.mobile ? 35 : 43,
    color: C.red,
  });
  handwriting(c, "fixed", 160, 175, { size: 23, align: "center" });
  handwriting(c, "three drawings", s.mobile ? 440 : 460, 195, {
    size: 23,
    align: "center",
  });
  drawGuide(c, 160, 450, {
    ...fixedRig.pose,
    scale: s.mobile ? 1.25 : character === "rabbit" ? 1.5 : 1.75,
    reduced: true,
  });
  drawGuide(c, s.mobile ? 440 : 460, 450, {
    ...rig.pose,
    time: s.time,
    scale: s.mobile ? 1.25 : character === "rabbit" ? 1.5 : 1.75,
    reduced: s.reduced,
    look: Math.sin(s.time) * 0.8,
  });
  if (!s.mobile) {
    plant.draw(c, 767, 335, { scale: 1.2, time: s.time, reduced: s.reduced });
    paintings[1].draw(c, 955, 300, {
      time: s.time,
      scale: 0.78,
      reduced: s.reduced,
    });
  }
  handwriting(c, "same pose /", s.mobile ? 75 : 730, s.mobile ? 475 : 635, {
    size: 22,
  });
  handwriting(c, "three drawings", s.mobile ? 75 : 730, s.mobile ? 510 : 665, {
    size: 22,
  });
  for (let i = 0; i < 3; i++) {
    drawGuide(
      c,
      s.mobile ? 115 + i * 205 : 145 + i * 180,
      s.mobile ? 740 : 652,
      {
        ...fixedRig.pose,
        scale: s.mobile ? 1.12 : 1.22,
        drawingFrame: i,
        reduced: s.reduced,
      },
    );
    handwriting(
      c,
      String(i),
      s.mobile ? 115 + i * 205 : 145 + i * 180,
      s.mobile ? 775 : 680,
      {
        size: 21,
        align: "center",
      },
    );
  }
  castButtons.forEach((b, i) =>
    handwriting(c, cast[i], b.x, b.y - 9, {
      size: 19,
      align: "center",
      color: cast[i] === character ? C.red : C.ink,
    }),
  );
  handwriting(c, "write again", repeat.x, repeat.y - 9, {
    size: 23,
    align: "center",
  });
  buttons.forEach((b, i) => {
    const p = new Pencil(c);
    p.oval(b.x, b.y, 55, 24, C.cream, { width: 1 });
    handwriting(c, cues[i], b.x, b.y - 10, { size: 20, align: "center" });
  });
};
s.debug = () => ({
  demo: "studio",
  character,
  time: s.time,
  frame: Math.floor(s.time * 8) % 4,
  audio: s.audio.context?.state || "locked",
  sounds: s.audio.count,
  reduced: s.reduced,
});
s.start();
