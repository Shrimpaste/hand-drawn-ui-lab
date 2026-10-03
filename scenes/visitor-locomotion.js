import { smooth } from "../primitives/motion.js";

const TAU = Math.PI * 2;
const cycle = (phase) => (((phase / TAU) % 1) + 1) % 1;
function keys(t, points) {
  for (let i = 1; i < points.length; i++) {
    const [a, x] = points[i - 1],
      [b, y] = points[i];
    if (t <= b) return x + (y - x) * smooth((t - a) / (b - a));
  }
  return points.at(-1)[1];
}
const flight = (t) =>
  t > 0.22 && t < 0.78 ? Math.sin((Math.PI * (t - 0.22)) / 0.56) ** 2 : 0;

/** Ground translation shares the same contact/flight phase as the body. */
export function visitorTravelRate(character, phase) {
  if (character === "rabbit")
    return 0.28 + (0.72 / 0.28) * flight(cycle(phase));
  if (character === "owl") return 1 - 0.16 * Math.cos(phase * 2);
  return 1 - 0.22 * Math.cos(phase * 2 - 0.3);
}

export function visitorContacts(character, from, to) {
  const period = character === "rabbit" ? TAU : Math.PI;
  const offset = character === "rabbit" ? 0.78 * TAU : Math.PI * 0.5;
  const events = [];
  for (
    let i = Math.floor((from - offset) / period) + 1;
    i <= Math.floor((to - offset) / period);
    i++
  )
    events.push({ pair: character === "rabbit", side: i % 2 ? 1 : -1 });
  return events;
}

/** Authored anatomical timing; source Puppet still blends and solves attachments. */
export function visitorStride(
  character,
  phase,
  amount,
  direction = 0,
  seated = 0,
) {
  const t = cycle(phase),
    s = Math.sin(phase),
    a = amount * (1 - seated);
  let lift,
    sy,
    lean,
    arm,
    foot,
    props = {};
  if (character === "rabbit") {
    // Crouch → extend both hind feet → tuck in flight → land together → recover.
    lift =
      a *
      keys(t, [
        [0, 0],
        [0.22, 0],
        [0.48, 0.085],
        [0.78, 0],
        [1, 0],
      ]);
    sy =
      1 +
      a *
        keys(t, [
          [0, -0.02],
          [0.16, -0.12],
          [0.33, 0.08],
          [0.64, 0.035],
          [0.78, 0],
          [0.84, -0.12],
          [0.95, 0.025],
          [1, -0.02],
        ]);
    lean =
      direction *
      a *
      keys(t, [
        [0, -0.025],
        [0.18, -0.06],
        [0.35, 0.08],
        [0.7, 0.025],
        [0.84, -0.035],
        [1, -0.025],
      ]);
    const tuck =
      a *
      keys(t, [
        [0, 0],
        [0.22, -0.014],
        [0.46, 0.055],
        [0.66, 0.04],
        [0.78, 0],
        [1, 0],
      ]);
    const deg =
      18 +
      a *
        keys(t, [
          [0, 2],
          [0.18, -5],
          [0.4, -12],
          [0.68, -10],
          [0.84, 12],
          [1, 2],
        ]);
    arm = { L: { deg }, R: { deg: deg + a * 2 } };
    foot = {
      L: { dx: -direction * a * 0.015, dy: tuck, rot: -a * 0.16 * flight(t) },
      R: { dx: -direction * a * 0.015, dy: tuck, rot: a * 0.16 * flight(t) },
    };
    const follow = keys(t, [
      [0, 0],
      [0.24, 0.11],
      [0.5, -0.07],
      [0.82, -0.03],
      [1, 0],
    ]);
    props = {
      earL: { rot: a * follow },
      earR: { rot: a * follow * 0.72 },
      tail: { dy: a * 0.009 * Math.sin(phase - 0.5) },
    };
  } else if (character === "owl") {
    // Low alternating talon steps; the body sways over the planted foot.
    lift = a * 0.009 * (1 - Math.cos(phase * 2));
    sy = 1 + a * 0.018 * Math.cos(phase * 2);
    lean = a * (0.073 * s + direction * 0.018);
    arm = {
      L: { deg: 18 + a * (10 + 13 * s) },
      R: { deg: 18 + a * (10 - 13 * s) },
    };
    foot = {
      L: {
        dx: -0.038 * a * s,
        dy: 0.024 * a * Math.max(0, -s),
        rot: -0.09 * a * s,
      },
      R: {
        dx: 0.038 * a * s,
        dy: 0.024 * a * Math.max(0, s),
        rot: 0.09 * a * s,
      },
    };
    props = { tail: { rot: -0.04 * a * Math.sin(phase - 0.4) } };
  } else {
    // Soft little steps: compress before shifting weight, cap arrives a beat later.
    lift = 0.019 * a * (1 - Math.cos(phase * 2));
    sy = 1 + 0.044 * a * Math.cos(phase * 2 + 0.35);
    lean = 0.029 * a * s + direction * 0.027 * a;
    arm = { L: { deg: 18 + 10 * a * s }, R: { deg: 18 - 10 * a * s } };
    foot = {
      L: {
        dx: -0.038 * a * s,
        dy: 0.025 * a * Math.max(0, -s),
        rot: -0.065 * a * s,
      },
      R: {
        dx: 0.038 * a * s,
        dy: 0.025 * a * Math.max(0, s),
        rot: 0.065 * a * s,
      },
    };
    props = {
      cap: {
        dy: 0.009 * a * Math.sin(phase * 2 - 0.65),
        rot: -0.026 * a * Math.sin(phase - 0.45),
      },
    };
  }
  for (const [side, sign] of [
    ["L", -1],
    ["R", 1],
  ]) {
    foot[side].dy -= seated * 0.065;
    foot[side].rot += sign * seated * 0.22;
  }
  return { lift, sx: 1 / sy, sy, lean, arm, foot, props };
}
