// The reference solver rotates relative to the selected authored arm drawing.
// Our arm states share one neutral drawing; restore its authored rotation before
// drawing it in the Canvas coordinate system (whose Y axis points down).
export function armArtworkRotation(instance, rig) {
  const part = rig.parts[instance.part];
  const selected = part.states[instance.state] ?? part.states[part.default];
  const neutral = part.states[part.default];
  return (
    (-(part.rotSign ?? part.side) *
      ((selected.deg ?? neutral.deg) - neutral.deg) *
      Math.PI) /
    180
  );
}
