/** Nearest-to-camera chain whose ribbon sample circle holds (x, y); `allowed(k)` filters out faded chains. */
export function pickChain(picks, x, y, allowed = () => true) {
  let best = -1,
    bd = Infinity;
  for (const q of picks) {
    if (!allowed(q.k)) continue;
    if (Math.hypot(q.x - x, q.y - y) < q.r && q.depth < bd) {
      bd = q.depth;
      best = q.k;
    }
  }
  return best;
}

/**
 * The one chain whose description may be shown, or -1. Close-ups hide it: the other ribbons are
 * veiled there, and their pick circles grow with the zoom, so a hover would be invisible nonsense.
 */
export function tipChain({ hover, picked, focusAmt, pointer, overUi }) {
  if (!pointer || overUi || focusAmt > 0.05) return -1;
  if (hover >= 0) return hover;
  return picked >= 0 ? picked : -1;
}

/** False when a ribbon piece and its stroke (half-width `pad`) lie wholly off the page; those cost raster time for nothing. */
export function segmentVisible(a, b, pad, { w, h }) {
  return !(Math.max(a.x, b.x) < -pad || Math.min(a.x, b.x) > w + pad || Math.max(a.y, b.y) < -pad || Math.min(a.y, b.y) > h + pad);
}
