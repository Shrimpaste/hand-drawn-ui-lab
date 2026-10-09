// Layout helpers for font-rendered handwriting labels (pure, measured in any unit).

const NO_LINE_START = new Set("，。、：；！？）”’】》…—,.:;!?)]%");
const isLatin = (ch) => /[A-Za-z0-9_'’\-\u0370-\u03ff\u2070-\u209f]/.test(ch);

/** Greedy wrap. CJK may break anywhere; Latin runs prefer spaces; closers never start a line. */
export function wrapByWidth(text, maxWidth, measure) {
  const lines = [];
  let width = 0;
  for (const para of String(text).split("\n")) {
    let line = "";
    const push = () => {
      lines.push(line);
      width = Math.max(width, measure(line));
      line = "";
    };
    const chars = [...para];
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (line && measure(line + ch) > maxWidth && !NO_LINE_START.has(ch)) {
        // keep a Latin word together by moving it down whole
        const m = isLatin(ch) && /[A-Za-z0-9_'’\-\u0370-\u03ff\u2070-\u209f]+$/.exec(line);
        if (m && m.index > 0 && !/\s$/.test(line)) {
          const tail = line.slice(m.index);
          line = line.slice(0, m.index);
          push();
          line = tail;
        } else push();
        if (ch === " ") continue;
      }
      line += ch;
    }
    push();
  }
  // trailing spaces from word wrapping
  const trimmed = lines.map((l) => l.replace(/\s+$/, ""));
  return { lines: trimmed, width: Math.max(0, ...trimmed.map(measure)) };
}

/** Pen progress -> whole characters written and the fraction of the next one. */
export function revealState(progress, count) {
  const p = Math.max(0, Math.min(1, progress)) * count,
    whole = Math.floor(p + 1e-9),
    part = whole >= count ? 0 : +(p - whole).toFixed(6);
  return { whole, part };
}
