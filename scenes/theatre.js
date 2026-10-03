import { SceneHost } from "./host.js";
import { TheatreModel } from "./theatre-model.js";
import {
  InkSprite,
  Pencil,
  palette as C,
  curve,
} from "../primitives/living-ink.js";
import { handwriting } from "../primitives/handwriting.js";
import {
  boat,
  jar,
  leafSprite,
  bellSprite,
  clapper,
  stoneSprite,
  lampBase,
  lampShade,
  drawGuide,
  tableSprite,
  windowArt,
  pencilProp,
} from "./art.js";
const s = new SceneHost("theatre");
let coords,
  env,
  rings = [],
  dust = [];
const cues = {
  paper: ["paper", 0.35],
  leaf: ["leaf", 0.35],
  bell: ["bell", 0.28],
  "bell-echo": ["bell", 0.13],
  stone: ["stone", 0.65],
  lamp: ["switch", 0.58],
  creature: ["step", 0.7],
};
const m = new TheatreModel((event) => {
  const o = coords[event.kind],
    pan = (o.x - s.w / 2) / s.w;
  let cue = null;
  if (event.name === "paper-lift" || event.name === "paper-settle")
    cue = cues.paper;
  if (event.name === "leaf-wind") cue = cues.leaf;
  if (event.name === "bell" || event.name === "bell-echo")
    cue = cues[event.name];
  if (event.name === "stone-impact") {
    cue = cues.stone;
    rings.push({ x: o.x, y: o.y + 28 * o.scale, age: 0, scale: o.scale });
  }
  if (event.name === "lamp-switch") cue = cues.lamp;
  if (event.name === "takeoff") cue = ["paper", 0.12];
  if (event.name === "landing") {
    cue = cues.creature;
    rings.push({ x: o.x, y: o.y + 2, age: 0, scale: 0.5 });
    for (let i = 0; i < 6; i++)
      dust.push({
        x: o.x,
        y: o.y,
        vx: (i - 2.5) * 18,
        vy: -8 - (i % 3) * 4,
        age: 0,
      });
  }
  if (cue) s.audio.play(cue[0], { pan, strength: cue[1] });
});
const instructions = {
  paper: "lift the paper boat",
  leaf: "brush the leaf",
  bell: "ring the bell",
  stone: "nudge the stone",
  lamp: "pull the cord",
  creature: "say hello",
};
const labels = {
  paper: "纸船抬起与滑回",
  leaf: "拨动瓶中的叶",
  bell: "碰一下悬铃",
  stone: "轻推石头，观察台面和邻近物体",
  lamp: "拉动台灯绳，切换灯光",
  creature: "和桌脚边的小动物打招呼",
};
const controls = Object.keys(m.objects).map((kind) => {
  const b = s.button("theatre-" + kind, labels[kind], () => {
    m.trigger(kind);
    s.announce(labels[kind]);
    if (kind === "lamp")
      b.el.setAttribute("aria-pressed", String(m.objects.lamp.lit));
  });
  if (kind === "lamp") b.el.setAttribute("aria-pressed", "false");
  return { kind, b };
});
s.layout = () => {
  coords = s.mobile
    ? {
        paper: { x: 161, y: 764, scale: 0.62, w: 168, h: 101 },
        leaf: { x: 364, y: 595, scale: 0.69, w: 132, h: 172 },
        bell: { x: 477, y: 266, scale: 0.79, w: 164, h: 155 },
        stone: { x: 343, y: 786, scale: 0.65, w: 132, h: 87 },
        lamp: { x: 516, y: 727, scale: 0.61, w: 170, h: 210 },
        creature: { x: 446, y: 997, scale: 0.88, w: 128, h: 150 },
      }
    : {
        paper: { x: 342, y: 562, scale: 0.78, w: 210, h: 129 },
        leaf: { x: 561, y: 422, scale: 0.73, w: 139, h: 185 },
        bell: { x: 831, y: 253, scale: 0.92, w: 190, h: 180 },
        stone: { x: 690, y: 568, scale: 0.76, w: 160, h: 102 },
        lamp: { x: 889, y: 510, scale: 0.82, w: 190, h: 245 },
        creature: { x: 822, y: 754, scale: 0.94, w: 139, h: 166 },
      };
  env = new InkSprite(
    s.w,
    s.h,
    (p, c) => {
      const roof = s.mobile ? { a: 188, b: 401 } : { a: 164, b: 312 },
        bottom = s.mobile ? 882 : 666;
      p.line(
        [
          [45, roof.b],
          [s.w * 0.3, roof.a],
          [s.w * 0.71, roof.a + 5],
          [s.w - 45, roof.b + 8],
          [s.w - 45, bottom],
          [49, bottom + 4],
          [45, roof.b],
        ],
        { width: 1.5, color: C.soft },
      );
      p.shape(
        [
          [45, roof.b],
          [s.w * 0.3, roof.a],
          [s.w * 0.3 + 15, roof.a + 7],
          [55, roof.b + 20],
        ],
        C.honey,
        { angular: true, width: 1.2, seed: 2101, base: 0.06 },
      );
      p.shape(
        [
          [s.w * 0.3, roof.a],
          [s.w * 0.71, roof.a + 5],
          [s.w * 0.71 + 7, roof.a + 18],
          [s.w * 0.3 + 9, roof.a + 16],
        ],
        C.honey,
        { angular: true, width: 1.2, seed: 2102, base: 0.08 },
      );
      p.shape(
        [
          [s.w * 0.71, roof.a + 5],
          [s.w - 45, roof.b + 8],
          [s.w - 56, roof.b + 21],
          [s.w * 0.71 - 4, roof.a + 19],
        ],
        C.honey,
        { angular: true, width: 1.2, seed: 2103, base: 0.06 },
      );
      p.line(
        [
          [51, bottom + 13],
          [s.w - 49, bottom + 10],
        ],
        { width: 1.2 },
      );
      for (let i = 0; i < 7; i++)
        p.line(
          [
            [68 + (i * (s.w - 136)) / 6, bottom + 16],
            [39 + (i * (s.w - 80)) / 6, s.mobile ? 1039 : 780],
          ],
          { width: 0.75, color: "#bca687" },
        );
      for (let i = 0; i < 4; i++)
        p.line(
          [
            [53, bottom + 24 + i * i * 9],
            [s.w - 51, bottom + 24 + i * i * 9],
          ],
          { width: 0.75, color: "#bca687" },
        );
      windowArt(
        p,
        s.mobile ? 183 : 230,
        s.mobile ? 461 : 343,
        s.mobile ? 0.68 : 0.85,
        true,
      );
      const tx = s.mobile ? 73 : 86,
        ty = s.mobile ? 690 : 588;
      p.line(
        [
          [tx, ty - 39],
          [tx + 41, ty - 40],
        ],
        { width: 1.4 },
      );
      p.shape(
        [
          [tx + 3, ty - 39],
          [tx + 34, ty - 39],
          [tx + 42, ty + 20],
          [tx + 21, ty + 24],
          [tx - 1, ty + 19],
        ],
        C.teal,
        { seed: 2110, width: 1.2, angle: 0.8 },
      );
      for (let i = 0; i < 4; i++)
        p.line(
          [
            [tx + 6 + i * 7, ty - 36],
            [tx + 7 + i * 8, ty + 15],
          ],
          { width: 0.65, color: C.cream },
        );
      pencilProp(
        p,
        s.mobile ? 89 : 455,
        s.mobile ? 831 : 602,
        1.46,
        s.mobile ? 0.41 : 0.55,
      );
      handwriting(
        c,
        "touch the things on the desk",
        s.w / 2,
        s.mobile ? 1039 : 785,
        { size: s.mobile ? 21 : 22, align: "center", color: C.soft },
      );
    },
    { pivot: [0, 0], seed: 201, variants: 1 },
  );
  controls.forEach(({ kind, b }) => {
    const o = coords[kind];
    s.place(b, o.x, o.y, Math.max(o.w, 78), Math.max(o.h, 72));
  });
};
s.layout();
s.onKey = (e) => {
  const i = Number(e.key) - 1;
  if (i >= 0 && i < controls.length) {
    m.trigger(controls[i].kind);
    e.preventDefault();
  }
};
s.update = (dt) => {
  m.update(dt, s.reduced);
  rings = rings
    .map((r) => ({ ...r, age: r.age + dt }))
    .filter((r) => r.age < 0.46)
    .slice(-12);
  dust = dust
    .map((d) => ({
      ...d,
      x: d.x + d.vx * dt,
      y: d.y + d.vy * dt,
      vy: d.vy + 45 * dt,
      age: d.age + dt,
    }))
    .filter((d) => d.age < 0.5)
    .slice(-36);
};
function pose(kind) {
  const p = m.objects[kind].pose;
  return s.reduced ? { x: 0, y: 0, angle: 0, squash: 0, fold: 0 } : p;
}
s.draw = (c) => {
  const t = s.reduced ? 0 : s.time;
  env.draw(c, 0, 0, { time: 0, reduced: true });
  handwriting(c, "the attic workbench", s.w / 2, 86, {
    size: s.mobile ? 35 : 43,
    align: "center",
    color: C.red,
    progress: s.intro.progress,
  });
  const table = {
    x: s.mobile ? 326 : 613,
    y: s.mobile ? 805 : 598,
    scale: s.mobile ? 0.68 : 0.99,
  };
  const shake = s.reduced ? 0 : m.table.value;
  const p = new Pencil(c, s.reduced ? 0 : Math.floor(t * 8) % 3);
  tableSprite.draw(c, table.x, table.y + shake, {
    time: t,
    scale: table.scale,
    reduced: s.reduced,
  });
  const lo = coords.lamp,
    lit = m.glow.value;
  if (lit > 0.005) {
    c.save();
    c.globalAlpha = 0.14 * lit;
    c.fillStyle = "#e5bc54";
    c.beginPath();
    c.ellipse(
      lo.x - 40 * lo.scale,
      table.y - 12,
      128 * lo.scale,
      21 * lo.scale,
      -0.05,
      0,
      Math.PI * 2,
    );
    c.fill();
    c.restore();
  }
  const paper = coords.paper,
    pp = pose("paper");
  boat.draw(
    c,
    paper.x + pp.x,
    paper.y + pp.y + shake + (s.reduced ? 0 : m.paperReply.value),
    { time: t, scale: paper.scale, angle: pp.angle, reduced: s.reduced },
  );
  const jo = { x: coords.leaf.x, y: coords.leaf.y + 125 * coords.leaf.scale };
  jar.draw(c, jo.x, jo.y + shake, {
    time: t,
    scale: coords.leaf.scale,
    reduced: s.reduced,
  });
  const leaf = coords.leaf,
    lp = pose("leaf"),
    sway = s.reduced ? 0 : m.leafReply.value;
  c.save();
  c.translate(leaf.x, leaf.y + 69 * leaf.scale + shake);
  c.rotate(lp.angle + sway + (!s.reduced ? Math.sin(t * 0.9) * 0.008 : 0));
  leafSprite.draw(c, lp.x * 0.22, -69 * leaf.scale + lp.y * 0.15, {
    time: t,
    scale: leaf.scale,
    reduced: s.reduced,
  });
  c.restore();
  const stone = coords.stone,
    sp = pose("stone");
  stoneSprite.draw(c, stone.x + sp.x, stone.y + sp.y + shake, {
    time: t,
    scale: stone.scale,
    angle: sp.angle,
    reduced: s.reduced,
  });
  const bell = coords.bell,
    bp = pose("bell"),
    anchor = bell.y - 54 * bell.scale;
  p.line(
    [
      [bell.x, s.mobile ? 205 : 181],
      [bell.x - 1, anchor],
    ],
    { width: 1.7 },
  );
  p.oval(bell.x, anchor - 3, 3, 4, C.honey, { width: 0.85 });
  c.save();
  c.translate(bell.x, anchor);
  c.rotate(bp.angle);
  bellSprite.draw(c, 0, 54 * bell.scale, {
    time: t,
    scale: bell.scale,
    reduced: s.reduced,
  });
  c.save();
  c.translate(0, 49 * bell.scale);
  c.rotate(s.reduced ? 0 : m.clapper.value);
  clapper.draw(c, 0, 7 * bell.scale, {
    time: t,
    scale: bell.scale,
    reduced: s.reduced,
  });
  c.restore();
  c.restore();
  lampBase.draw(c, lo.x, lo.y + shake, {
    time: t,
    scale: lo.scale,
    reduced: s.reduced,
  });
  const shade = pose("lamp").angle + (s.reduced ? 0 : m.shade.value),
    shadeY = lo.y - 70 * lo.scale;
  lampShade.draw(c, lo.x, shadeY + shake, {
    time: t,
    scale: lo.scale,
    angle: shade,
    reduced: s.reduced,
  });
  if (lit > 0.01) {
    c.save();
    c.globalAlpha = 0.34 * lit;
    c.fillStyle = C.yellow;
    c.beginPath();
    c.ellipse(
      lo.x,
      shadeY + 34 * lo.scale,
      17 * lo.scale,
      13 * lo.scale,
      0,
      0,
      Math.PI * 2,
    );
    c.fill();
    c.restore();
  }
  const cordPull = pose("lamp").angle
    ? Math.max(0, Math.sin(m.objects.lamp.action.elapsed * 16)) * 9
    : 0;
  p.line(
    [
      [lo.x + 42 * lo.scale, shadeY + 40 * lo.scale],
      [lo.x + 44 * lo.scale, lo.y + 26 * lo.scale + cordPull],
    ],
    { width: 1.2 },
  );
  p.oval(
    lo.x + 44 * lo.scale,
    lo.y + 31 * lo.scale + cordPull,
    3.5 * lo.scale,
    5 * lo.scale,
    C.honey,
    { width: 1 },
  );
  const cr = coords.creature,
    cp = pose("creature");
  let look = 0;
  if (m.lookAt) look = Math.sign(coords[m.lookAt].x - cr.x);
  else if (s.pointer)
    look = Math.max(-1, Math.min(1, (s.pointer.x - cr.x) / 180));
  drawGuide(c, cr.x + cp.x, cr.y, {
    time: t,
    scale: cr.scale,
    hop: -cp.y,
    squash: cp.squash,
    look,
    lookY: m.lookAt
      ? -0.8
      : s.pointer
        ? Math.max(-0.8, Math.min(0.6, (s.pointer.y - cr.y + 65) / 180))
        : 0,
    scarf: s.reduced ? 0 : cp.angle * 0.75 + Math.sin(t * 1.6) * 0.012,
    reduced: s.reduced,
  });
  for (const r of rings) {
    c.save();
    c.globalAlpha = (1 - r.age / 0.46) * 0.45;
    p.oval(r.x, r.y, 15 + r.age * 58 * r.scale, 3 + r.age * 5, null, {
      width: 0.95,
      outline: C.honey,
    });
    c.restore();
  }
  for (const d of dust) {
    c.save();
    c.globalAlpha = (1 - d.age / 0.5) * 0.35;
    p.dot(d.x, d.y, 1.5, C.honey);
    c.restore();
  }
  controls.forEach(({ kind, b }) => {
    const o = coords[kind];
    const y =
      kind === "bell"
        ? o.y + 108 * o.scale
        : kind === "leaf"
          ? o.y - 119 * o.scale
          : kind === "lamp"
            ? o.y - 175 * o.scale
            : kind === "creature"
              ? o.y - 25
              : kind === "paper"
                ? o.y - 132 * o.scale
                : s.mobile
                  ? 904
                  : o.y - 89 * o.scale;
    const x =
      kind === "creature"
        ? o.x - 122
        : kind === "stone" && s.mobile
          ? 208
          : o.x;
    handwriting(c, instructions[kind], x, y, {
      size: s.mobile ? 20 : 21,
      align: "center",
      color: C.red,
      progress: b.ink.progress,
      seed: 771 + controls.findIndex((x) => x.kind === kind),
    });
  });
};
s.debug = () => ({
  demo: "material-scene",
  activations: m.serial,
  objects: Object.values(m.objects).map((o) => ({
    kind: o.kind,
    count: o.count,
    active: o.action.active,
    pose: { ...o.pose },
    lit: o.lit,
  })),
  relations: {
    table: m.table.value,
    leaf: m.leafReply.value,
    paper: m.paperReply.value,
    clapper: m.clapper.value,
    look: m.lookAt,
    glow: m.glow.value,
  },
  events: [...m.events],
  residue: rings.length + dust.length,
  reduced: s.reduced,
  audio: s.audio.context?.state || "locked",
  sounds: s.audio.count,
  audioEvents: [...s.audio.events],
});
s.start();
