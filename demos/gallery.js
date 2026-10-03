import { Study } from "./runtime.js";
import { Spring, clamp } from "../primitives/motion.js";
import { InkTransition } from "../primitives/ink.js";
import { sheet, tape, stroke, colors } from "../primitives/sketch.js";
import { penText, prose } from "../primitives/lettering.js";
import { plant, moth, windowArt } from "./art.js";

const titles = ["A SMALL WILDERNESS", "AFTER THE RAIN", "A WINDOW AT DUSK"];
const descriptions = [
  "Some things need only a little room.",
  "A visitor, resting between two journeys.",
  "A light left on for the evening.",
];
const study = new Study({ name: "gallery", height: 710, mobileHeight: 1220 });
let returnScroll = 0;
let selected = -1,
  closing = -1,
  closePending = false;
const cards = titles.map((title, i) => ({
  title,
  i,
  x: new Spring(0),
  y: new Spring(0),
  angle: new Spring(0, { stiffness: 85, damping: 15 }),
  scale: new Spring(1, { stiffness: 150, damping: 22 }),
  lift: new Spring(0, { stiffness: 105, damping: 17 }),
  ink: new InkTransition({ writeSeconds: 0.65, eraseSeconds: 0.27 }),
  caption: new InkTransition({ writeSeconds: 0.95, eraseSeconds: 0.28 }),
}));
for (const card of cards)
  card.button = study.button(`work-${card.i}`, `展开作品：${card.title}`, () =>
    selected === card.i ? closeWork() : open(card.i),
  );
const close = study.button("return-work", "收起作品", () => closeWork());
close.el.hidden = true;
function layout() {
  const positions = study.mobile
    ? [
        [220, 345, -0.06],
        [208, 683, 0.04],
        [235, 1001, -0.035],
      ]
    : [
        [207, 390, -0.07],
        [523, 419, 0.045],
        [831, 366, -0.045],
      ];
  for (const c of cards) {
    [c.homeX, c.homeY, c.homeAngle] = positions[c.i];
    const focus = c.i === selected;
    c.x.snap(focus ? study.w / 2 : c.homeX);
    c.y.snap(focus ? (study.mobile ? 420 : 365) : c.homeY);
    c.angle.snap(focus ? 0 : c.homeAngle);
    c.scale.snap(focus ? (study.mobile ? 1.24 : 1.38) : 1);
    c.lift.snap(focus ? 1 : 0);
    c.button.el.disabled = selected >= 0 && !focus;
    c.button.el.setAttribute("aria-expanded", String(focus));
  }
  // Layout changes never cancel the user's open work or its ink process.
  close.el.hidden = selected < 0;
}
study.layout = layout;
layout();
function open(i) {
  if (closePending || selected >= 0) return;
  selected = i;
  returnScroll = window.scrollY;
  closing = -1;
  const c = cards[i];
  c.caption.setVisible(true, study.reduced);
  study.sound.play("paper-lift", { strength: 0.7 });
  study.announce(`展开${c.title}。可用 Esc 收起。`);
  close.el.hidden = false;
  for (const o of cards) {
    o.button.el.disabled = o.i !== i;
    o.button.el.setAttribute("aria-expanded", String(o.i === i));
  }
  if (study.mobile)
    study.outer.scrollIntoView({
      behavior: study.reduced ? "instant" : "smooth",
      block: "start",
    });
}
function closeWork() {
  if (selected < 0 || closePending) return;
  closePending = true;
  closing = selected;
  cards[selected].caption.setVisible(false, study.reduced);
  study.sound.play("erase");
  study.announce("擦去说明，将作品放回纸上。");
}
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeWork();
});
study.update = (dt) => {
  if (closePending && cards[closing].caption.progress === 0) {
    selected = -1;
    closePending = false;
    close.el.hidden = true;
    if (study.mobile)
      window.scrollTo({
        top: returnScroll,
        behavior: study.reduced ? "instant" : "smooth",
      });
    study.sound.play("paper-settle", { strength: 0.55 });
    for (const c of cards) {
      c.button.el.disabled = false;
      c.button.el.setAttribute("aria-expanded", "false");
    }
    cards[closing].button.el.focus({ preventScroll: true });
  }
  for (const c of cards) {
    const active = c.button.hover || c.button.focused,
      focus = selected === c.i;
    c.ink.setVisible(active || focus, study.reduced);
    c.ink.update(dt);
    c.caption.update(dt);
    c.x.target = focus ? study.w / 2 : c.homeX;
    c.y.target = focus ? (study.mobile ? 420 : 365) : c.homeY;
    c.scale.target = focus ? (study.mobile ? 1.24 : 1.38) : 1;
    c.angle.target = focus
      ? 0
      : c.homeAngle + (active && !study.reduced ? 0.022 : 0);
    c.lift.target = focus ? 1 : active ? 0.35 : 0;
    for (const k of ["x", "y", "angle", "scale", "lift"])
      c[k].update(dt, study.reduced);
    if (
      closing === c.i &&
      selected < 0 &&
      Math.abs(c.y.value - c.homeY) < 2 &&
      Math.abs(c.scale.value - 1) < 0.01
    ) {
      study.residue.emit("dust", c.homeX, c.homeY + 138, {
        color: colors.faint,
        reduced: study.reduced,
      });
      closing = -1;
    }
    study.place(
      c.button,
      c.x.value,
      c.y.value,
      230 * c.scale.value,
      284 * c.scale.value,
      c.angle.value,
    );
  }
  study.place(close, study.w - 52, selected >= 0 ? 190 : 172, 58, 50);
};
study.isWriting = () =>
  cards.some(
    (c) =>
      (c.caption.progress > 0 && c.caption.progress < 1) ||
      (c.ink.progress > 0 && c.ink.progress < 1),
  );
study.isErasing = () =>
  cards.some(
    (c) =>
      c.caption.progress > 0 && c.caption.progress < 1 && !c.caption.target,
  );
study.draw = (c) => {
  study.heading(
    "Things worth keeping.",
    "把一张画拿近些，再轻轻放回去。",
    "01 / A PAPER GALLERY",
  );
  const order = [...cards].sort(
    (a, b) => (a.i === selected) - (b.i === selected),
  );
  for (const card of order) {
    const s = card.scale.value;
    c.save();
    c.globalAlpha =
      selected >= 0 && selected !== card.i ? (study.mobile ? 0.12 : 0.28) : 1;
    c.translate(card.x.value, card.y.value - card.lift.value * 9);
    c.rotate(card.angle.value);
    c.scale(s, s);
    sheet(c, 230, 284, { lift: card.lift.value, seed: 21 + card.i });
    tape(c, -37, -143, 64, -0.09);
    tape(c, 60, -140, 48, 0.12);
    c.save();
    c.translate(0, -8);
    c.scale(0.93, 0.93);
    if (card.i === 0)
      plant(c, {
        sway: study.reduced ? 0 : Math.sin(study.time * 0.5) * 0.012,
      });
    if (card.i === 1)
      moth(c, { wing: study.reduced ? 0 : Math.sin(study.time * 0.7) * 0.018 });
    if (card.i === 2) windowArt(c, { glow: 0.6 });
    c.restore();
    penText(c, `NO. 0${card.i + 1}`, -90, 115, { size: 9, color: colors.red });
    stroke(
      c,
      [
        [-85, 129],
        [85, 128],
      ],
      { color: colors.faint, width: 0.5 },
    );
    c.restore();
    if (selected !== card.i) {
      penText(c, card.title, card.x.value, card.y.value + 173, {
        size: study.mobile ? 12 : 11,
        color: colors.red,
        align: "center",
        progress: card.ink.progress,
      });
    }
  }
  if (selected >= 0) {
    const card = cards[selected];
    penText(c, card.title, study.w / 2, study.mobile ? 633 : 596, {
      size: study.mobile ? 13 : 17,
      align: "center",
      color: colors.red,
      progress: card.caption.progress,
    });
    prose(c, descriptions[selected], study.w / 2, study.mobile ? 675 : 640, {
      size: study.mobile ? 14 : 18,
      align: "center",
      italic: true,
      alpha: clamp((card.caption.progress - 0.65) / 0.35),
    });
    stroke(
      c,
      [
        [study.w - 40, 174],
        [study.w - 64, 179],
        [study.w - 71, 190],
        [study.w - 51, 198],
      ],
      { color: colors.red, progress: close.ink.progress || 0.8, width: 1.4 },
    );
    stroke(
      c,
      [
        [study.w - 42, 168],
        [study.w - 39, 177],
        [study.w - 49, 179],
      ],
      { color: colors.red },
    );
    penText(c, "RETURN", study.w - 53, 220, {
      size: 10,
      align: "center",
      progress: close.ink.progress,
      color: colors.red,
    });
  } else {
    const y = study.mobile ? 1170 : 658;
    prose(c, "三张画 · 胶带与纸 · 一个安静的小展览", study.w / 2, y, {
      size: study.mobile ? 14 : 16,
      align: "center",
      color: "#8e856f",
    });
    stroke(
      c,
      [
        [study.w / 2 - 18, y + 18],
        [study.w / 2, y + 22],
        [study.w / 2 + 18, y + 17],
      ],
      { color: colors.red, width: 0.7 },
    );
  }
  study.residue.draw(c);
};
study.debug = () => ({
  demo: "gallery",
  selected,
  closePending,
  captions: cards.map((c) => c.caption.progress),
  cards: cards.map((c) => ({
    x: c.x.value,
    y: c.y.value,
    scale: c.scale.value,
  })),
  particles: study.residue.items.length,
  audio: study.sound.context?.state || "locked",
  reduced: study.reduced,
});
study.start();
