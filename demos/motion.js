import { Study } from "./runtime.js";
import { Action, Spring } from "../primitives/motion.js";
import { materials, materialPose, blendPose } from "./material-motion.js";
import { stroke, oval, colors } from "../primitives/sketch.js";
import { penText, prose } from "../primitives/lettering.js";
import { paperObject, leaf, bell, stone, lamp, creature } from "./art.js";

const study = new Study({ name: "motion", height: 775, mobileHeight: 1310 });
const names = {
  paper: ["PAPER", "纸角抬起，笔迹跟着走"],
  leaf: ["LEAF", "轻一点，绕着空气归位"],
  bell: ["BELL", "钟身先摆，铃舌稍后回答"],
  stone: ["STONE", "很短的重量，留在地面上"],
  lamp: ["LAMP", "拉一下，给桌面一点光"],
  creature: ["LITTLE ONE", "先蹲下，再开心地跳起来"],
};
let serial = 0;
const events = [];
const objects = Object.keys(materials).map((kind) => {
  const item = {
    kind,
    pose: materialPose(kind, 0),
    from: materialPose(kind, 0),
    follow: new Spring(0, {
      stiffness: kind === "bell" ? 180 : 65,
      damping: kind === "bell" ? 5 : 9,
    }),
    glow: new Spring(0, { stiffness: 45, damping: 14 }),
    lit: false,
    count: 0,
  };
  item.button = study.button(
    `touch-${kind}`,
    `触碰${names[kind][0]}：${names[kind][1]}`,
    () => {
      item.from = { ...item.pose };
      item.action.start();
      item.count++;
      serial++;
      if (kind === "lamp") {
        item.lit = !item.lit;
        item.button.el.setAttribute("aria-pressed", String(item.lit));
      }
      study.announce(names[kind][1]);
    },
  );
  item.action = new Action({
    duration: materials[kind].duration,
    events: materials[kind].events,
    onEvent: (event) => {
      events.push({ kind, name: event.name, at: study.time });
      if (events.length > 40) events.shift();
      const pan = (item.x - study.w / 2) / study.w;
      if (event.name === "takeoff") {
        study.sound.play("step", { pan, strength: 0.65 });
        study.residue.emit("dust", item.x, item.y + 39, {
          color: colors.red,
          strength: 0.75,
          reduced: study.reduced,
        });
      } else if (event.name === "landing") {
        study.sound.play("land", { pan, strength: 0.8 });
        study.residue.emit("ring", item.x, item.y + 39, {
          color: colors.red,
          reduced: study.reduced,
        });
        item.follow.kick(1.2);
      } else if (event.name === "stone-impact") {
        study.sound.play(event.name, { pan });
        study.residue.emit("ring", item.x, item.y + 38, {
          color: colors.ink,
          strength: 0.6,
          reduced: study.reduced,
        });
      } else if (event.name === "leaf-wind") {
        study.sound.play("leaf-wind", { pan, strength: 0.6 });
      } else if (/bell/.test(event.name)) {
        study.sound.play("bell", {
          pan,
          pitch: kind === "bell" ? 3 : 0,
          strength: event.name === "bell-echo" ? 0.3 : 0.8,
        });
      } else if (event.name === "paper-settle") {
        study.sound.play(event.name, { pan, strength: 0.5 });
        study.residue.emit("dust", item.x, item.y + 53, {
          strength: 0.4,
          reduced: study.reduced,
        });
      } else if (event.name === "lamp-switch") {
        item.glow.target = item.lit ? 0.85 : 0;
        study.sound.play("select", { pan, strength: 0.5 });
      } else study.sound.play(event.name, { pan, strength: 0.55 });
    },
  });
  return item;
});
function layout() {
  for (let i = 0; i < objects.length; i++) {
    const o = objects[i];
    o.x = study.mobile ? (i % 2 ? 329 : 113) : 200 + (i % 3) * 320;
    o.y = study.mobile
      ? 302 + Math.floor(i / 2) * 337
      : 306 + Math.floor(i / 3) * 310;
  }
}
study.layout = layout;
layout();
study.update = (dt) => {
  for (const o of objects) {
    o.action.update(dt);
    const target = materialPose(o.kind, o.action.elapsed);
    o.pose = blendPose(o.from, target, o.action.elapsed / 0.13);
    o.follow.target = -o.pose.angle * (o.kind === "bell" ? 1.7 : 1);
    o.follow.update(dt, study.reduced);
    o.glow.update(dt, study.reduced);
    study.place(o.button, o.x, o.y, study.mobile ? 164 : 210, 181);
  }
};
study.draw = (c) => {
  study.heading(
    "Same touch, six stories.",
    "同样轻轻碰一下，每件东西都有自己的回答。",
    "03 / MATERIAL MOTION",
  );
  for (const o of objects) {
    let p = o.pose;
    if (study.reduced) p = { ...p, x: 0, y: 0, angle: 0, squash: 0 };
    const active = o.button.hover || o.button.focused;
    oval(c, o.x, o.y + 66, o.kind === "leaf" ? 25 : 48, 3, {
      color: colors.faint,
      alpha: 0.33,
      width: 0.65,
      seed: 64,
    });
    if (o.kind === "bell") {
      stroke(
        c,
        [
          [o.x, o.y - 126],
          [o.x, o.y - 50],
        ],
        { color: colors.ink, width: 0.8 },
      );
      c.save();
      c.translate(o.x, o.y - 52);
      c.rotate(p.angle);
      c.translate(0, 52);
      bell(c, { clapper: study.reduced ? 0 : o.follow.value });
      c.restore();
    } else {
      c.save();
      c.translate(o.x + p.x, o.y + p.y);
      if (o.kind !== "lamp") c.rotate(p.angle);
      if (o.kind === "paper") paperObject(c, { fold: p.fold });
      if (o.kind === "leaf") {
        c.save();
        c.translate(-10, 43);
        leaf(c, 0, 0, 100, -0.16);
        c.restore();
      }
      if (o.kind === "stone") stone(c);
      if (o.kind === "lamp") {
        lamp(c, { shade: study.reduced ? 0 : p.angle, glow: o.glow.value });
        stroke(
          c,
          [
            [o.x + 42 - o.x, -26],
            [44, 16],
          ],
          { color: colors.red, width: 0.7 },
        );
        oval(c, 44, 20, 3, 4, { color: colors.red, width: 0.8 });
      }
      if (o.kind === "creature")
        creature(c, {
          squash: p.squash,
          look: study.pointer
            ? (study.pointer.x - o.x) /
              Math.max(50, Math.abs(study.pointer.x - o.x))
            : 0,
          antenna: study.reduced ? 0 : o.follow.value,
        });
      c.restore();
    }
    penText(c, names[o.kind][0], o.x, o.y + 98, {
      size: study.mobile ? 12 : 14,
      align: "center",
      color: active ? colors.red : colors.ink,
    });
    stroke(
      c,
      [
        [o.x - 32, o.y + 123],
        [o.x + 32, o.y + 122],
      ],
      { color: colors.red, width: 0.7, progress: o.button.ink.progress },
    );
    if (!study.mobile)
      prose(c, names[o.kind][1], o.x, o.y + 151, {
        size: 13,
        align: "center",
        color: "#968b75",
      });
    else
      penText(c, active ? "TRY AGAIN" : "TOUCH ME", o.x, o.y + 144, {
        size: 8.5,
        color: colors.red,
        align: "center",
        progress: o.button.ink.progress,
      });
  }
  study.residue.draw(c);
  prose(
    c,
    "纸会轻飘，石头不会。声音与余韵跟着动作发生。",
    study.w / 2,
    study.mobile ? 1260 : 758,
    { size: study.mobile ? 13 : 15, align: "center", color: "#918773" },
  );
};
study.debug = () => ({
  demo: "motion",
  activations: serial,
  objects: objects.map((o) => ({
    kind: o.kind,
    count: o.count,
    active: o.action.active,
    pose: { ...o.pose },
    follow: o.follow.value,
    lit: o.lit,
    glow: o.glow.value,
  })),
  events: [...events],
  particles: study.residue.items.length,
  totalResidue: study.residue.total,
  audio: study.sound.context?.state || "locked",
  reduced: study.reduced,
});
study.start();
