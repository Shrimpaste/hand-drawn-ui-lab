import { Study } from "./runtime.js";
import { sheet, tape, stroke, colors } from "../primitives/sketch.js";
import { penText, prose } from "../primitives/lettering.js";
import { plant, paperObject, bell, leaf } from "./art.js";
const study = new Study({ name: "home", height: 690, mobileHeight: 1160 });
const entries = [
  ["GALLERY", "拿近一张画。", "/demos/gallery.html"],
  ["NOTEBOOK", "写下今天的一点小事。", "/demos/notebook.html"],
  ["MOTION", "听听材质怎样回答。", "/demos/motion.html"],
].map((e, i) => ({
  title: e[0],
  text: e[1],
  url: e[2],
  i,
  button: study.button(
    `open-${i}`,
    `打开${e[0]}：${e[1]}`,
    () => (location.href = e[2]),
  ),
}));
study.draw = (c) => {
  study.heading(
    "Small things, alive.",
    "纸、笔迹、余韵。三个可以亲手触碰的小实验。",
    "UI / LAB - ORIGINAL STUDIES",
  );
  for (const e of entries) {
    const x = study.mobile ? 220 : 195 + e.i * 325,
      y = study.mobile ? 322 + e.i * 315 : 370,
      angle = e.i === 1 ? 0.05 : e.i === 0 ? -0.06 : -0.025;
    study.place(e.button, x, y, 260, 275, angle);
    const lift = e.button.ink.progress * 0.25;
    c.save();
    c.translate(x, y - lift * 8);
    c.rotate(angle);
    sheet(c, 246, 263, { seed: 88 + e.i, lift });
    tape(c, 0, -132, 69, angle);
    c.scale(0.78, 0.78);
    if (e.i === 0) plant(c);
    if (e.i === 1) {
      paperObject(c);
      leaf(c, 35, 49, 32, 0.9);
    }
    if (e.i === 2) bell(c, { clapper: lift * 0.3 });
    c.restore();
    penText(c, e.title, x, y + 159, {
      size: 16,
      color: colors.red,
      align: "center",
    });
    prose(c, e.text, x, y + 190, {
      size: 16,
      color: "#8e846f",
      align: "center",
    });
    stroke(
      c,
      [
        [x - 27, y + 217],
        [x + 31, y + 216],
      ],
      { color: colors.red, progress: e.button.ink.progress },
    );
    stroke(
      c,
      [
        [x + 22, y + 209],
        [x + 31, y + 216],
        [x + 24, y + 223],
      ],
      { color: colors.red, progress: e.button.ink.progress },
    );
  }
};
study.debug = () => ({ demo: "home", reduced: study.reduced });
study.start();
