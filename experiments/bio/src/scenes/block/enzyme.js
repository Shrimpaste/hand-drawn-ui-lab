import { StructureView } from "../structure/view.js";

/**
 * The FBP1 tetramer at the bottleneck is the real crystal structure, drawn once per conformer
 * frame by the structure room's ribbon renderer into small canvases: three normal drafts, and three
 * for the patient with the frameshifted C terminus marked and the lost tail removed.
 */
export function bakeFBP1(data, { size = 210, scale = 1.75, density = 2 } = {}) {
  const make = (patient) =>
    [0, 1, 2].map((frame) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = Math.round(size * density);
      const c = cv.getContext("2d");
      c.scale(density, density);
      const v = new StructureView(data, { cx: size / 2, cy: size / 2, scale });
      v.bake(c);
      for (const ch of v.chains) ch.flick = { at: () => frame };
      if (patient) {
        v.mut.snap(1);
        v.tail.snap(1);
      }
      v.update(0, 0, false);
      v.draw(c, 0, false, 1);
      return cv;
    });
  return { size, normal: make(false), patient: make(true) };
}
