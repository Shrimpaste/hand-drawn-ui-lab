import { clamp, smooth } from "../engine/geom.js";

/**
 * Timeline (u 0..1) of the phosphate hydrolysis shown at the active site. It is a teaching
 * sequence of the net reaction, not a quantum-chemical trajectory: water approaches the C1
 * phosphorus from the side opposite the leaving O1, the P-O1 bond stretches, a proton ends up
 * on O1 (C1-OH of F6P), and inorganic phosphate leaves.
 */
export function reactionPose(u) {
  const t = clamp(u);
  const ramp = (a, b) => (t <= a ? 0 : t >= b ? 1 : smooth((t - a) / (b - a)));
  return { water: ramp(0, 0.28), stretch: ramp(0.28, 0.55), proton: ramp(0.4, 0.62), leave: ramp(0.55, 1) };
}

/** Ligand approach: `away` scales the outward offset, `spin` the tumbling, `alpha` the ink. */
export function dockPose(p) {
  const t = clamp(p),
    e = t * t * (3 - 2 * t);
  return { away: 1 - e, spin: (1 - e) * (1 - e), alpha: clamp(t * 3) };
}
