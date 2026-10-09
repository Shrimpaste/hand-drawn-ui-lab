// Subset the 小赖 (LXGW Kose, SIL OFL 1.1) font to the characters this project actually shows.
// Source: references/xiaolai.woff2 (copied from the UI-lab fonts). Output: public/fonts/xiaolai-sub.woff2
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcFont = join(root, "references", "xiaolai.woff2");
const out = join(root, "public", "fonts", "xiaolai-sub.woff2");
if (!existsSync(srcFont)) {
  console.log("font: source missing, keeping existing", out);
  process.exit(0);
}
const walk = (dir, acc = []) => {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) {
      if (n !== "generated") walk(p, acc);
    } else if (/\.(js|html)$/.test(n)) acc.push(p);
  }
  return acc;
};
const files = [...walk(join(root, "src")), ...readdirSync(root).filter((f) => f.endsWith(".html")).map((f) => join(root, f))];
const chars = new Set();
for (const f of files) for (const ch of readFileSync(f, "utf8")) if (ch.codePointAt(0) > 31) chars.add(ch);
for (let c = 32; c < 127; c++) chars.add(String.fromCharCode(c));
for (const ch of "αβγΔΩμ°±×÷→←↑↓⇌≈≥≤·…—‘’“”、。，：；！？（）【】《》₀₁₂₃₄₅₆₇₈₉⁰¹²³⁺⁻℃") chars.add(ch);
const text = [...chars].join("");
const buf = await subsetFont(readFileSync(srcFont), text, { targetFormat: "woff2" });
writeFileSync(out, buf);
console.log(`font: ${chars.size} requested chars -> ${(buf.length / 1024).toFixed(0)} kB ${out}`);
