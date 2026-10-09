import { rng } from "../../engine/rng.js";
import { ROUTES, BLOCK, MOLECULE_OF } from "./model.js";

/**
 * Token flow over the routes of the model. Each token is a packet of carbon drawn as the
 * molecule it currently is. Three-carbon packets meet in pairs at the triose phosphates and go on
 * as one fructose-1,6-bisphosphate. At FBP1 they pass at the enzyme's pace, or, when the enzyme
 * is defective, wait in a pile; once the pile is full, newcomers run the glycolytic way back to
 * lactate. Pure (no drawing): the scene maps (route, edge, s) onto its own curves.
 */
export class FlowSim {
  constructor(nodes, { seed = 1, speed = 72, pileMax = 14, fbp1Rate = 2.4, curve = 1.12 } = {}) {
    this.nodes = nodes;
    this.speed = speed;
    this.pileMax = pileMax;
    this.fbp1Rate = fbp1Rate;
    this.rand = rng(seed);
    this.len = {};
    for (const [name, r] of Object.entries(ROUTES)) this.len[name] = r.slice(1).map((n, i) => this.dist(r[i], n) * curve);
    this.reset();
  }
  dist(a, b) {
    const p = this.nodes[a],
      q = this.nodes[b];
    return Math.max(8, Math.hypot(q[0] - p[0], q[1] - p[1]));
  }
  reset() {
    this.tokens = [];
    this.pile = [];
    this.triWait = [];
    this.acc = {};
    this.spawned = {};
    this.out = { glcOut: 0, lacOut: 0 };
    this.merges = 0;
    this.bucket = 0;
    this.events = [];
    this.nextId = 1;
    for (const k of Object.keys(ROUTES)) {
      this.acc[k] = this.rand();
      this.spawned[k] = 0;
    }
  }
  kindOf(t) {
    const node = ROUTES[t.route][t.i];
    return node === "tri" && t.pair ? "f16bp" : MOLECULE_OF[node];
  }
  spawn(route) {
    this.spawned[route]++;
    this.tokens.push({ id: this.nextId++, route, i: 0, s: 0, wob: this.rand() * 6.283, v: 0.85 + this.rand() * 0.3 });
  }
  update(dt, { blocked = false, rates = {} } = {}) {
    this.events = [];
    for (const [route, rate] of Object.entries(rates)) {
      if (!(rate > 0) || !ROUTES[route]) continue;
      this.acc[route] += rate * dt * (0.7 + this.rand() * 0.6);
      while (this.acc[route] >= 1) {
        this.acc[route] -= 1;
        this.spawn(route);
      }
    }
    this.bucket = blocked ? 0 : Math.min(2, this.bucket + this.fbp1Rate * dt);
    // the enzyme turns over the oldest waiting molecule first
    while (!blocked && this.pile.length && this.bucket >= 1) {
      this.bucket -= 1;
      const t = this.pile.shift();
      this.events.push({ node: BLOCK[1], kind: "fbp1" });
      t.s = 0;
      this.tokens.push(t);
    }
    const keep = [];
    for (const t of this.tokens) {
      t.s += this.speed * t.v * dt;
      let alive = true;
      while (alive && t.s >= this.len[t.route][t.i]) {
        t.s -= this.len[t.route][t.i];
        t.i++;
        const r = ROUTES[t.route],
          node = r[t.i];
        this.events.push({ node, kind: MOLECULE_OF[node] });
        if (t.i >= r.length - 1) {
          this.out[node] = (this.out[node] || 0) + 1;
          alive = false;
          break;
        }
        if (node === "tri" && t.route !== "spill") {
          if (this.triWait.length) {
            // Keep the partner for the scene's two-triose erase / six-carbon draw on this edge.
            t.pair = this.triWait.shift();
            this.merges++;
          } else {
            this.triWait.push(t);
            alive = false;
            break;
          }
        }
        if (node === BLOCK[0] && r[t.i + 1] === BLOCK[1]) {
          delete t.pair;
          if (!blocked && this.bucket >= 1) {
            this.bucket -= 1;
            this.events.push({ node: BLOCK[1], kind: "fbp1" });
          } else if (this.pile.length < this.pileMax) {
            this.pile.push(t);
            alive = false;
            break;
          } else {
            t.route = "spill";
            t.i = 0;
          }
        }
      }
      if (alive) keep.push(t);
    }
    this.tokens = keep;
  }
}
