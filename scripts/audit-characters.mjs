import fs from "node:fs/promises";
import { parse } from "acorn";
import { analyze } from "eslint-scope";
import { animators, Character } from "../src/character.js";

const source = await fs.readFile("src/vendor/reference-motion.js", "utf8");
const ast = parse(source, {
  ecmaVersion: "latest",
  sourceType: "module",
  ranges: true,
  locations: true,
});
const scope = analyze(ast, {
  ecmaVersion: 2022,
  sourceType: "module",
  optimistic: true,
}).scopes.find((s) => s.type === "module");
const declarations = new Map();
for (const node of ast.body) {
  if (node.type === "VariableDeclaration")
    for (const d of node.declarations)
      if (d.id.type === "Identifier") declarations.set(d.id.name, d);
      else if (node.id) declarations.set(node.id.name, node);
  if (
    ["FunctionDeclaration", "ClassDeclaration"].includes(node.type) &&
    node.id
  )
    declarations.set(node.id.name, node);
}
const refs = scope.variables.flatMap((v) =>
  v.references.map((r) => ({ at: r.identifier.start, name: v.name })),
);
const roots = {
  pawn: "UA",
  knight: "CM",
  bishop: "gP",
  rook: "UF",
  queen: "gL",
  king: "iz",
};
const audit = { source: "src/vendor/reference-motion.js", characters: [] };
for (const [kind, animator] of Object.entries(animators))
  for (const side of ["w", "b"]) {
    const rig = JSON.parse(
      await fs.readFile(`assets/chars/${side}-${kind}.json`, "utf8"),
    );
    const actor = new Character(rig, { seed: 127 });
    const entry = {
      id: rig.id,
      creature: rig.creature,
      idle: actor.puppet.idle.cfg,
      springs: Object.fromEntries(
        Object.entries(rig.parts)
          .filter(([, p]) => p.spring)
          .map(([n, p]) => [
            n,
            {
              ...p.spring,
              range: p.rotRange,
              parent: p.parent,
              anchor: p.anchor,
            },
          ]),
      ),
      clips: {},
    };
    for (const name of [
      "hover",
      "select",
      "move",
      "nervous",
      "sleepy",
      "removed",
      "napping",
      "victory",
    ]) {
      const clip = animator[name]({
        side,
        seed: 127,
        off: [-2, -1],
        dist: Math.sqrt(5),
        facing: 1,
        from: [-1, 0],
        strength: 0.75,
        reduced: false,
      });
      const duration = Number.isFinite(clip.duration) ? clip.duration : 8;
      entry.clips[name] = {
        label: clip.label,
        duration: Number.isFinite(clip.duration) ? clip.duration : "loop",
        idle: clip.idle,
        events: clip.eventsIn(-0.0001, duration),
        samples: Array.from({ length: 17 }, (_, i) => ({
          time: (duration * i) / 16,
          pose: clip.sample((duration * i) / 16),
        })),
      };
    }
    const visited = new Set();
    function visit(name) {
      if (visited.has(name)) return;
      visited.add(name);
      const d = declarations.get(name);
      if (!d) return;
      for (const r of refs) if (r.at >= d.start && r.at < d.end) visit(r.name);
    }
    visit(roots[kind]);
    entry.sourceFunctions = [...visited]
      .map((n) => [n, declarations.get(n)])
      .filter(([, d]) => d && d.loc.start.line >= 2759)
      .map(([name, d]) => ({
        name,
        line: d.loc.start.line,
        end: d.loc.end.line,
      }))
      .sort((a, b) => a.line - b.line);
    audit.characters.push(entry);
  }
await fs.writeFile(
  "research/character-motion-audit.json",
  JSON.stringify(audit, null, 2),
);
console.log(
  audit.characters.map((c) => ({
    id: c.id,
    breath: c.idle.breath,
    springs: c.springs,
    clips: Object.fromEntries(
      Object.entries(c.clips).map(([n, p]) => [
        n,
        {
          label: p.label,
          duration: p.duration,
          props: [
            ...new Set(
              p.samples.flatMap((s) => Object.keys(s.pose.props || {})),
            ),
          ],
          events: p.events.length,
        },
      ]),
    ),
  })),
);
