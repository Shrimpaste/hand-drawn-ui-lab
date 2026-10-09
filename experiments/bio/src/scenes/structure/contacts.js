const POLAR = new Set(["O", "N"]);

/**
 * Which residue atoms to draw around a ligand: for every polar atom within `cutoff` of a partner
 * point, the bond path back to its C-alpha. Everything else of the residue stays out of the picture,
 * so a lysine shows as the stick that actually reaches the phosphate, not its whole side chain and
 * the rings of neighbours.
 */
export function contactSkeleton(atoms, bonds, partners, cutoff = 3.3) {
  const adj = atoms.map(() => []);
  for (const [i, j] of bonds) {
    adj[i].push(j);
    adj[j].push(i);
  }
  const contact = new Set();
  atoms.forEach((a, i) => {
    if (!POLAR.has(a.e) || a.n === "CA") return;
    for (const q of partners) {
      if (Math.hypot(a.p[0] - q[0], a.p[1] - q[1], a.p[2] - q[2]) < cutoff) {
        contact.add(i);
        break;
      }
    }
  });
  const keep = new Set();
  for (const i of contact) {
    const prev = new Map([[i, -1]]);
    const queue = [i];
    let root = -1;
    while (queue.length && root < 0) {
      const u = queue.shift();
      if (atoms[u].n === "CA" && atoms[u].num === atoms[i].num) {
        root = u;
        break;
      }
      for (const v of adj[u]) if (!prev.has(v) && atoms[v].num === atoms[i].num) {
        prev.set(v, u);
        queue.push(v);
      }
    }
    if (root < 0) {
      keep.add(i);
      continue;
    }
    for (let u = root; u >= 0; u = prev.get(u)) keep.add(u);
  }
  return { keep, contact };
}
