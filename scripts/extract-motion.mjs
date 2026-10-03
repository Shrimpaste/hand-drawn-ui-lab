import fs from 'node:fs/promises';
import { parse } from 'acorn';
import { analyze } from 'eslint-scope';
import prettier from 'prettier';

// Study only code the reference already delivered to the browser. Resolve actual
// module bindings, so minified local names cannot pull unrelated Three.js code in.
const source = await fs.readFile(new URL('../research/reference.pretty.js', import.meta.url), 'utf8');
const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', ranges: true });
const scopes = analyze(ast, { ecmaVersion: 2022, sourceType: 'module', optimistic: true });
const moduleScope = scopes.scopes.find(s => s.type === 'module');
const declarations = new Map();
for (const node of ast.body) {
  if (node.type === 'VariableDeclaration') {
    for (const declaration of node.declarations) {
      if (declaration.id.type === 'Identifier') declarations.set(declaration.id.name, {
        start: declaration.start, end: declaration.end,
        text: `${node.kind} ${source.slice(declaration.start, declaration.end)};`,
      });
    }
  } else if ((node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') && node.id) {
    declarations.set(node.id.name, { start: node.start, end: node.end, text: source.slice(node.start, node.end) });
  }
}
const references = moduleScope.variables.flatMap(variable => variable.references.map(ref => ({
  position: ref.identifier.start, name: variable.name,
})));
const exports = {
  Puppet: 'Iy', pawnAnimator: 'UA', knightAnimator: 'CM', bishopAnimator: 'gP',
  rookAnimator: 'UF', queenAnimator: 'gL', kingAnimator: 'iz',
};
const selected = new Set();
function visit(name) {
  if (selected.has(name)) return;
  const declaration = declarations.get(name);
  if (!declaration) return;
  selected.add(name);
  for (const ref of references) if (ref.position >= declaration.start && ref.position < declaration.end) visit(ref.name);
}
Object.values(exports).forEach(visit);
const body = [...selected].map(n => declarations.get(n)).sort((a, b) => a.start - b.start).map(d => d.text).join('\n');
const result = `// Extracted from the publicly delivered Ballpoint Gambit client on 2026-10-03.\n// Source: https://ballpoint-gambit.vercel.app/assets/index-BF7G8tOs.js\n// Original author's code. Private local study; this is not an original implementation.\n${body}\nexport {${Object.entries(exports).map(([alias, name]) => `${name} as ${alias}`).join(',')}};\n`;
await fs.mkdir(new URL('../src/vendor/', import.meta.url), { recursive: true });
await fs.writeFile(new URL('../src/vendor/reference-motion.js', import.meta.url), await prettier.format(result, { parser: 'babel' }));
await fs.writeFile(new URL('../research/motion-extraction.json', import.meta.url), JSON.stringify({ source: 'index-BF7G8tOs.js', bindings: [...selected], exports, bytes: result.length }, null, 2));
console.log({ bindings: selected.size, bytes: result.length });
