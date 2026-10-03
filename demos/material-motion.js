import { clamp, smooth, mix } from "../primitives/motion.js";
const bump = (t, a, b) =>
  t < a || t > b ? 0 : Math.sin(((t - a) / (b - a)) * Math.PI);
const decay = (t, rate) => Math.exp(-Math.max(0, t) * rate);
export const materials = {
  paper: {
    duration: 1.05,
    events: [
      { at: 0.1, name: "paper-lift" },
      { at: 0.68, name: "paper-settle" },
    ],
  },
  leaf: {
    duration: 1.6,
    events: [
      { at: 0.12, name: "leaf-wind" },
      { at: 1.18, name: "leaf-settle" },
    ],
  },
  bell: {
    duration: 2.5,
    events: [
      { at: 0.12, name: "bell" },
      { at: 0.49, name: "bell-echo" },
    ],
  },
  stone: { duration: 0.65, events: [{ at: 0.095, name: "stone-impact" }] },
  lamp: {
    duration: 1.25,
    events: [
      { at: 0.14, name: "lamp-switch" },
      { at: 0.5, name: "lamp-settle" },
    ],
  },
  creature: {
    duration: 0.94,
    events: [
      { at: 0.16, name: "takeoff" },
      { at: 0.55, name: "landing" },
    ],
  },
};
export function materialPose(kind, t) {
  const pose = { x: 0, y: 0, angle: 0, squash: 0, fold: 0 };
  if (kind === "paper") {
    pose.y = -20 * bump(t, 0.08, 0.75);
    pose.angle =
      0.085 *
      Math.sin((t - 0.1) * 11) *
      decay(t - 0.1, 3.6) *
      smooth((t - 0.05) / 0.1);
    pose.fold = 0.9 * bump(t, 0, 0.22);
  }
  if (kind === "leaf") {
    const p = clamp((t - 0.1) / 1.35);
    pose.x = Math.sin(p * Math.PI * 2) * 19;
    pose.y = -28 * Math.sin(p * Math.PI);
    pose.angle = Math.sin(p * Math.PI * 3) * 0.32 * (1 - p);
  }
  if (kind === "bell") {
    pose.angle =
      0.3 *
      Math.sin(Math.max(0, t - 0.075) * 14) *
      decay(t - 0.075, 2.3) *
      smooth((t - 0.04) / 0.07);
  }
  if (kind === "stone") {
    pose.x = 3 * Math.sin(t * 20) * decay(t, 8);
    pose.y = -2 * bump(t, 0.04, 0.12) + 1.8 * bump(t, 0.12, 0.23);
    pose.angle = 0.025 * bump(t, 0, 0.22);
  }
  if (kind === "lamp") {
    pose.angle =
      0.12 *
      Math.sin(Math.max(0, t - 0.12) * 17) *
      decay(t - 0.12, 4.5) *
      smooth(t / 0.12);
  }
  if (kind === "creature") {
    pose.squash =
      0.18 * bump(t, 0, 0.16) -
      0.06 * bump(t, 0.16, 0.51) +
      0.2 * bump(t, 0.55, 0.73);
    pose.y = -45 * bump(t, 0.16, 0.55);
    pose.x = 12 * bump(t, 0.16, 0.55);
    pose.angle = 0.035 * bump(t, 0.16, 0.55);
  }
  return pose;
}
export function blendPose(from, to, t) {
  return Object.fromEntries(
    Object.keys(to).map((k) => [k, mix(from[k] || 0, to[k], smooth(t))]),
  );
}
