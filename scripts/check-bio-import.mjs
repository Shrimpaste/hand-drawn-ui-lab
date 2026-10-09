import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parse } from 'acorn';

const root = fileURLToPath(new URL('../experiments/bio/', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'source-manifest.json'), 'utf8'));
const imported = new Set(manifest.files.map(f => f.path));
let edges = 0;
const errors = [];
for (const file of manifest.files) {
  const bytes = await fs.readFile(path.join(root, file.path));
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  if (hash !== file.importedSha256) errors.push(`${file.path}: imported snapshot changed; record the adaptation in source-manifest.json`);
  if (!file.path.endsWith('.js')) continue;
  const ast = parse(bytes.toString(), { ecmaVersion: 'latest', sourceType: 'module' });
  for (const n of ast.body) {
    if (!n.source) continue;
    const specifier = n.source.value;
    if (!specifier.startsWith('.')) {
      if (specifier !== 'vitest') errors.push(`${file.path}: unexpected external import ${specifier}`);
      continue;
    }
    const dep = path.posix.normalize(path.posix.join(path.posix.dirname(file.path), specifier));
    if (!imported.has(dep)) errors.push(`${file.path}: missing recorded dependency ${dep}`);
    edges++;
  }
}
for (const file of ['block.html', 'room.html', 'src/styles.css']) {
  const text = await fs.readFile(path.join(root, file), 'utf8');
  for (const match of text.matchAll(/(?:href|src)="([^"#]+)"|url\("([^"]+)"\)/g)) {
    const url = match[1] || match[2];
    const dep = path.posix.normalize(path.posix.join(path.posix.dirname(file), url));
    if (!url.startsWith('.') || !imported.has(dep)) errors.push(`${file}: missing experiment-relative asset ${url}`);
    edges++;
  }
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Bio import: ${manifest.files.length} snapshot hashes and ${edges} dependency/resource edges verified.`);
