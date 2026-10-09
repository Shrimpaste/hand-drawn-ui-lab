const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** One progress bar over several weighted loading stages; the bar only ever moves forward. */
export function makeProgress(stages) {
  const total = stages.reduce((s, x) => s + x.weight, 0);
  const start = new Map();
  let acc = 0;
  for (const s of stages) {
    start.set(s.id, { from: acc / total, span: s.weight / total });
    acc += s.weight;
  }
  let best = 0;
  return {
    at(id, frac) {
      const s = start.get(id);
      if (!s) throw new Error(`unknown loading stage: ${id}`);
      best = Math.max(best, s.from + s.span * clamp01(frac));
      return best;
    },
  };
}

/** The loading page that sits in room.html from the first byte: a pencil line that fills as things get ready. */
export function bootScreen(el = document.getElementById("boot")) {
  if (!el) return { set() {}, finish: async () => {} };
  const bar = el.querySelector("[data-bar]"),
    pencil = el.querySelector("[data-pencil]"),
    text = el.querySelector("[data-text]"),
    pct = el.querySelector("[data-pct]");
  let shown = 0,
    target = 0,
    raf = 0;
  const paint = () => {
    shown += (target - shown) * 0.18;
    if (Math.abs(target - shown) < 0.002) shown = target;
    bar.style.strokeDashoffset = String(1 - shown);
    pencil.style.setProperty("--x", `${shown * 100}%`);
    pct.textContent = `${Math.round(shown * 100)}%`;
    raf = shown === target ? 0 : requestAnimationFrame(paint);
  };
  return {
    set(p, label) {
      target = Math.max(target, clamp01(p));
      if (label) text.textContent = label;
      if (!raf) raf = requestAnimationFrame(paint);
    },
    async finish() {
      target = 1;
      text.textContent = "画好了";
      if (!raf) raf = requestAnimationFrame(paint);
      await new Promise((r) => setTimeout(r, 380));
      el.classList.add("done");
      await new Promise((r) => setTimeout(r, 620));
      el.remove();
    },
  };
}
