import { Pencil, palette as C } from "./living-ink.js";
import { handwriting } from "./handwriting.js";

function star(p, x, y, r, progress = 1, filled = false) {
  const points = Array.from({ length: 11 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5,
      size = i % 2 ? r * 0.43 : r;
    return [x + Math.cos(a) * size, y + Math.sin(a) * size];
  });
  p.line(points, { color: filled ? C.honey : C.blue, width: 1.7, progress });
}
function pencil(p, x, y, angle) {
  const c = p.c;
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  p.line(
    [
      [-4, -25],
      [4, -25],
      [4, 17],
      [0, 28],
      [-4, 17],
      [-4, -25],
    ],
    { color: C.honey, width: 1.5 },
  );
  p.line(
    [
      [-4, 17],
      [4, 17],
    ],
    { color: C.honey, width: 1.2 },
  );
  p.line(
    [
      [0, -23],
      [0, 15],
    ],
    { color: C.yellow, width: 2 },
  );
  p.line(
    [
      [-4, -25],
      [-4, -32],
      [4, -32],
      [4, -25],
    ],
    { color: C.red, width: 1.5 },
  );
  p.line(
    [
      [-1, 25],
      [0, 28],
      [1, 25],
    ],
    { color: C.ink, width: 1.4 },
  );
  c.restore();
}

/** Options are small pen marks. Rich wax illustration belongs to the scene. */
export function drawControlMark(
  c,
  type,
  {
    x = 0,
    y = 0,
    time = 0,
    reduced = false,
    hover = 0,
    on = true,
    active = false,
    scale = 0.62,
    progress = 1,
  } = {},
) {
  if (progress <= 0) return;
  const t = reduced ? 0 : time,
    h = Math.max(hover, active ? 0.7 : 0);
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  const p = new Pencil(c, reduced ? 0 : Math.floor(t * 8) % 3),
    sway = Math.sin(t * 3.1) * h;
  // Pencil path reveal is shared with scene opening and reverse erase.
  const raw = p.line.bind(p);
  p.line = (points, opts = {}) =>
    raw(points, {
      ...opts,
      width: (opts.width ?? 1.5) * 1.25,
      progress: Math.min(opts.progress ?? 1, progress),
    });
  if (type === "doze") {
    for (const [i, xx, yy, size] of [
      [0, -18, 14, 26],
      [1, 7, -5, 19],
      [2, 26, -24, 13],
    ]) {
      const lift = h * (3 + i * 3) + sway * (1 + i * 0.4),
        a = size * 0.65;
      p.line(
        [
          [xx - a / 2, yy - size / 2 - lift],
          [xx + a / 2, yy - size / 2 - lift],
          [xx - a / 2, yy + size / 2 - lift],
          [xx + a / 2, yy + size / 2 - lift],
        ],
        { color: i === 1 ? C.blue : C.plum, width: 2 - i * 0.3 },
      );
    }
  } else if (type === "nervous") {
    p.line(
      [
        [-23, -4],
        [-13, -9 - h * 5],
        [-5, -6],
      ],
      { color: C.honey, width: 1.9 },
    );
    p.line(
      [
        [4, -6],
        [14, -9 - h * 5],
        [24, -3],
      ],
      { color: C.honey, width: 1.9 },
    );
    p.line(
      [
        [-15, 3],
        [-15, 6],
      ],
      { color: C.honey, width: 2.2 },
    );
    p.line(
      [
        [15, 3],
        [15, 6],
      ],
      { color: C.honey, width: 2.2 },
    );
    p.line(
      [
        [-8, 19],
        [-2, 15 - h * 2],
        [4, 19],
        [9, 15],
      ],
      { color: C.rose, width: 1.5 },
    );
    p.line(
      [
        [29, -23 + sway * 4],
        [23, -11 + sway * 4],
        [27, -5 + sway * 4],
        [33, -8 + sway * 4],
        [29, -23 + sway * 4],
      ],
      { color: C.blue, width: 1.5 },
    );
  } else if (type === "ants") {
    for (let i = 0; i < 3; i++) {
      const xx = -24 + i * 25,
        yy = (i === 1 ? -3 : 5) - h * 3;
      for (let j = 0; j < 3; j++)
        p.oval(
          xx - 6 + j * 5,
          yy,
          j === 0 ? 3.8 : 2.7,
          j === 0 ? 3 : 2.4,
          null,
          { outline: C.honey, width: 1.1, progress },
        );
      for (let j = 0; j < 3; j++)
        for (const side of [-1, 1]) {
          const step = h * Math.sin(t * 9 + i * 2 + j) * 2.5;
          p.line(
            [
              [xx - 6 + j * 4, yy],
              [xx - 8 + j * 5 + step, yy + side * 5],
              [xx - 10 + j * 5 + step, yy + side * 8],
            ],
            { color: C.honey, width: 1 },
          );
        }
      p.line(
        [
          [xx + 5, yy - 2],
          [xx + 7, yy - 8],
          [xx + 10, yy - 9],
        ],
        { color: C.honey, width: 1 },
      );
    }
  } else if (type === "sound") {
    c.rotate(on ? sway * 0.035 : 0);
    p.line(
      [
        [-25, -10],
        [-10, -10],
        [9, -24],
        [9, 25],
        [-10, 10],
        [-25, 10],
        [-25, -10],
      ],
      { color: C.teal, width: 1.9 },
    );
    p.line(
      [
        [-10, -10],
        [-10, 10],
      ],
      { color: C.teal, width: 1.2 },
    );
    if (on)
      for (let i = 0; i < 2; i++)
        p.line(
          [
            [18 + i * 10, -15],
            [24 + i * 10, 0],
            [18 + i * 10, 15],
          ],
          { color: C.blue, width: 1.6, alpha: 0.6 + h * 0.4 },
        );
    else
      p.line(
        [
          [16, -12],
          [34, 13],
        ],
        { color: C.red, width: 1.9 },
      );
  } else if (type === "alive") {
    for (let i = 0; i < 3; i++) {
      const xx = -25 + i * 25,
        yy = i === 1 ? -6 : 4;
      c.save();
      c.translate(xx, yy - (on ? h * (3 + Math.sin(t * 3 + i) * 3) : 0));
      c.rotate(on ? h * Math.sin(t * 2 + i) * 0.12 : 0);
      star(p, 0, 0, i === 1 ? 15 : 10, progress, on);
      c.restore();
    }
    if (!on)
      p.line(
        [
          [-10, 26],
          [10, 26],
        ],
        { color: C.blue, width: 1.3 },
      );
  } else if (type === "sketch" || type === "replay") {
    pencil(p, type === "sketch" ? -5 : 8, 0, 0.43 - h * 0.12);
    if (type === "sketch")
      p.line(
        [
          [-23, 27],
          [-7, 24],
          [9, 27],
          [21, 23 + h * 3],
        ],
        { color: C.rose, width: 1.5 },
      );
    else {
      p.line(
        [
          [-13, 22],
          [-28, 14],
          [-30, -1],
          [-19, -12],
          [-7, -12],
        ],
        { color: C.teal, width: 1.6 },
      );
      p.line(
        [
          [-13, -19],
          [-5, -12],
          [-13, -5],
        ],
        { color: C.teal, width: 1.6 },
      );
    }
  } else if (["reference", "gallery", "components"].includes(type)) {
    c.rotate(-h * 0.07);
    if (type === "gallery") {
      p.line(
        [
          [-30, -25],
          [29, -25],
          [29, 25],
          [-30, 25],
          [-30, -25],
        ],
        { color: C.teal, width: 1.6 },
      );
      p.line(
        [
          [-26, 20],
          [-9, -3],
          [2, 8],
          [11, -3],
          [25, 20],
        ],
        { color: C.honey, width: 1.4 },
      );
      star(p, 12, -12, 6, progress, true);
    } else if (type === "components") {
      for (let i = 0; i < 3; i++)
        star(p, (i - 1) * 24, i === 1 ? -8 : 5, 10, progress, i === 1);
    } else {
      p.line(
        [
          [-30, -21],
          [-6, -26],
          [0, -20],
          [27, -26],
          [31, 22],
          [7, 27],
          [0, 21],
          [-26, 27],
          [-30, -21],
        ],
        { color: C.honey, width: 1.5 },
      );
      p.line(
        [
          [0, -20],
          [0, 21],
        ],
        { color: C.honey, width: 1.2 },
      );
      for (let row = 0; row < 3; row++)
        p.line(
          [
            [7, -15 + row * 8],
            [22, -18 + row * 8],
          ],
          { color: C.green, width: 1.3 },
        );
      p.line(
        [
          [-21, -9],
          [-16, -17],
          [-11, -9],
          [-11, 7],
          [-23, 7],
          [-21, -9],
        ],
        { color: C.blue, width: 1.2 },
      );
    }
  } else {
    const sign = type === "left" || type === "back" ? -1 : 1;
    c.scale(sign, 1);
    c.translate(h * 4, 0);
    p.line(
      [
        [-25, 1],
        [23, 0],
      ],
      { color: C.teal, width: 1.9 },
    );
    p.line(
      [
        [9, -12],
        [24, 0],
        [9, 12],
      ],
      { color: C.teal, width: 1.9 },
    );
  }
  c.restore();
}

export function drawIllustratedControl(
  c,
  button,
  type,
  {
    time = 0,
    reduced = false,
    on = true,
    active = false,
    label = "",
    labelY = button.y + 34,
    scale = 0.62,
  } = {},
) {
  button.artType = type;
  c.save();
  c.globalAlpha *= button.el.disabled ? 0.45 : 1;
  drawControlMark(c, type, {
    x: button.x,
    y: button.y,
    time,
    reduced,
    hover: button.response?.value ?? button.ink.progress,
    on,
    active,
    scale,
    progress: c.sceneDrawing?.(9600) ?? 1,
  });
  c.restore();
  handwriting(c, label, button.x, labelY, {
    size: 16,
    align: "center",
    color: C.teal,
    progress: button.ink.progress,
  });
}
