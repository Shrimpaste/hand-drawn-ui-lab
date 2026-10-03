import { SceneHost } from "./host.js";
import {
  drawGuide,
  plant,
  boat,
  leafSprite,
  bellSprite,
  clapper,
  stoneSprite,
  lampBase,
  lampShade,
  paintings,
} from "./art.js";
import { handwriting } from "../primitives/handwriting.js";
import { Pencil, palette as C } from "../primitives/living-ink.js";
const s = new SceneHost("studio");
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
let repeat = s.button("rewrite", "重写笔迹", () => {
  s.intro.progress = 0;
  s.intro.setVisible(true);
});
s.update = () => {
  buttons.forEach((b, i) => s.place(b, 75 + i * 135, 747, 110, 52));
  s.place(repeat, 470, 589, 510, 73);
};
s.draw = (c) => {
  handwriting(c, "drawing bench", 43, 92, { size: 43, color: C.red });
  handwriting(c, "fixed", 160, 175, { size: 23, align: "center" });
  handwriting(c, "three drawings", 460, 175, { size: 23, align: "center" });
  drawGuide(c, 160, 422, { scale: 1.75, reduced: true });
  drawGuide(c, 460, 422, {
    time: s.time,
    scale: 1.75,
    reduced: s.reduced,
    look: Math.sin(s.time) * 0.8,
  });
  plant.draw(c, 767, 335, { scale: 1.2, time: s.time, reduced: s.reduced });
  paintings[1].draw(c, 955, 300, {
    time: s.time,
    scale: 0.78,
    reduced: s.reduced,
  });
  handwriting(c, "look at the little loops.", 72, 540, {
    size: 35,
    progress: s.intro.progress,
    seed: 117,
  });
  handwriting(c, "the quick brown fox / 0123456789", 72, 605, {
    size: 27,
    progress: s.intro.progress,
    seed: 618,
  });
  buttons.forEach((b, i) => {
    const p = new Pencil(c);
    p.oval(b.x, b.y, 55, 24, C.cream, { width: 1 });
    handwriting(c, cues[i], b.x, b.y - 10, { size: 20, align: "center" });
  });
};
s.debug = () => ({
  demo: "studio",
  time: s.time,
  frame: Math.floor(s.time * 8) % 4,
  audio: s.audio.context?.state || "locked",
  sounds: s.audio.count,
  reduced: s.reduced,
});
s.start();
