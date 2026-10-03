import { smooth } from "../primitives/motion.js";

/** Keep source duration/events/layer fading, adapt the gesture to its anatomy. */
export function visitorReaction(character, state, clip) {
  if (character === "mushroom" || !["hello", "hover"].includes(state))
    return clip;
  return {
    duration: clip.duration,
    idle: clip.idle,
    label: `${character}.${state}`,
    eventsIn: (a, b) => clip.eventsIn(a, b),
    sample: (time) => {
      const pose = clip.sample(time),
        props = { ...pose.props };
      if (state === "hover") {
        const rise = smooth(time / 0.22);
        if (character === "owl")
          return {
            ...pose,
            lift: 0,
            arm: { L: { deg: 18 + rise * 13 }, R: { deg: 18 + rise * 13 } },
          };
        return {
          ...pose,
          lift: (pose.lift || 0) * 0.4,
          props: {
            ...props,
            earL: { rot: -0.06 * rise },
            earR: { rot: 0.035 * rise },
          },
        };
      }
      const u = time / clip.duration,
        envelope = Math.sin(Math.PI * Math.min(1, u)) ** 2;
      if (character === "owl") {
        const ruffle = envelope * (35 + 12 * Math.sin(u * Math.PI * 6));
        return {
          ...pose,
          lift: (pose.lift || 0) * 0.25,
          sx: 1 + ((pose.sx || 1) - 1) * 0.35,
          sy: 1 + ((pose.sy || 1) - 1) * 0.35,
          arm: { L: { deg: 18 + ruffle }, R: { deg: 18 + ruffle } },
          props: {
            ...props,
            earL: { rot: -0.04 * envelope },
            earR: { rot: 0.04 * envelope },
          },
        };
      }
      return {
        ...pose,
        lift: (pose.lift || 0) * 0.8,
        props: {
          ...props,
          earL: { rot: -0.1 * envelope },
          earR: { rot: 0.08 * envelope },
          tail: { dy: 0.016 * envelope },
        },
      };
    },
  };
}
