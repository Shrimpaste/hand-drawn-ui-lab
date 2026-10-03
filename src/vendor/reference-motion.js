// Extracted from the publicly delivered Ballpoint Gambit client on 2026-10-03.
// Source: https://ballpoint-gambit.vercel.app/assets/index-BF7G8tOs.js
// Original author's code. Private local study; this is not an original implementation.
var e = Object.defineProperty;
var t = (t, n) => {
  let r = {};
  for (var i in t) e(r, i, { get: t[i], enumerable: !0 });
  return (n || e(r, Symbol.toStringTag, { value: `Module` }), r);
};
var sl = {
  tile: -4,
  sheetInk: -3,
  garden: -2,
  shadow: -1,
  marker: 0,
  trail: 1,
  decal: 2,
  tape: 3,
};
var cl = (e, t = 0, n = 0) => e * 1e5 - t * 10 + n;
var ll = (e, t = 0, n = 0) => -e * 100 + t + n;
function vu(e) {
  e.s = (e.s + 2654435769) | 0;
  let t = e.s;
  return (
    (t = Math.imul(t ^ (t >>> 16), 2246822507)),
    (t = Math.imul(t ^ (t >>> 13), 3266489909)),
    (t ^ (t >>> 16)) >>> 0
  );
}
var yu = class {
  a = 0;
  b = 0;
  c = 0;
  d = 0;
  constructor(e = 1) {
    this.reseed(e);
  }
  reseed(e) {
    let t = { s: e | 0 };
    ((this.a = vu(t) | 0),
      (this.b = vu(t) | 0),
      (this.c = vu(t) | 0),
      (this.d = vu(t) | 0),
      (this.a | this.b | this.c | this.d) === 0 && (this.a = 1));
    for (let e = 0; e < 8; e++) this.u32();
  }
  u32() {
    let e = Math.imul(bu(Math.imul(this.b, 5), 7), 9) >>> 0,
      t = this.b << 9;
    return (
      (this.c ^= this.a),
      (this.d ^= this.b),
      (this.b ^= this.c),
      (this.a ^= this.d),
      (this.c ^= t),
      (this.d = bu(this.d, 11)),
      e
    );
  }
  next() {
    return this.u32() / 4294967296;
  }
  int(e) {
    return Math.floor(this.next() * e);
  }
  weighted(e) {
    let t = 0;
    for (let n = 0; n < e.length; n++) t += Math.max(0, e[n]);
    if (t <= 0) return this.int(e.length);
    let n = this.next() * t;
    for (let t = 0; t < e.length; t++)
      if (((n -= Math.max(0, e[t])), n < 0)) return t;
    return e.length - 1;
  }
};
function bu(e, t) {
  return (e << t) | (e >>> (32 - t));
}
var __ = { fps: 8, seq2: [0, 1], seq3: [0, 1, 2, 1] };
var v_ = 0.005;
var y_ = { arm: 1, foot: 1, prop: 0.75, head: 0.8, fx: 1 };
var b_ = {
  neutral: { eye: `open`, brow: `none`, mouth: `smile`, blush: 1 },
  happy: { eye: `happy`, brow: `none`, mouth: `grin`, blush: 1.3 },
  worried: {
    eye: `open`,
    brow: `worried`,
    mouth: `wavy`,
    blush: 0.75,
    look: [0, -0.6],
  },
  angry: { eye: `glare`, brow: `angry`, mouth: `frown`, blush: 0.75 },
  surprised: { eye: `wide`, brow: `raised`, mouth: `o`, blush: 1 },
  sleepy: {
    eye: `sleepy`,
    brow: `worried`,
    mouth: `o`,
    blush: 1,
    mouthScale: 0.6,
  },
  hurt: { eye: `squeezed`, brow: `none`, mouth: `wavy`, blush: 1 },
  dizzy: {
    eye: `spiral`,
    brow: `none`,
    mouth: `o`,
    blush: 1,
    mouthScale: 0.8,
  },
  victorious: { eye: `happy`, brow: `none`, mouth: `open`, blush: 1.3 },
  smug: {
    eye: `lidded`,
    brow: `raised`,
    mouth: `smirk`,
    blush: 0.8,
    look: [0.45, 0],
  },
  shy: {
    eye: `half`,
    brow: `none`,
    mouth: `smile`,
    blush: 1.5,
    look: [-0.7, -0.6],
  },
};
var x_ = {
  half: 0.25,
  closed: 0.7,
  roundEyes: [`open`, `wide`, `lidded`, `half`, `glare`],
};
function S_(e) {
  return e >= 3 ? __.seq3 : __.seq2;
}
function M_() {
  return {
    t: 0,
    footFollow: 0,
    lift: 0,
    sx: 1,
    sy: 1,
    lean: 0,
    shear: 0,
    bodyPose: `idle`,
    arm: { L: {}, R: {} },
    foot: { L: {}, R: {} },
    look: { x: 0, y: 0 },
    mood: `neutral`,
    blink: 0,
    blush: null,
    mouthScale: null,
    props: {},
    alpha: 1,
    draw: 1,
    pivot: null,
    contact: null,
    contactV: 0,
    turn: 1,
    facing: null,
  };
}
var N_ = Math.PI / 180;
var P_ = (e, t, n) => (e < t ? t : e > n ? n : e);
var F_ = (e, t, n) => e + (t - e) * n;
var I_ = (e, t, n) => {
  let r = P_((n - e) / (t - e), 0, 1);
  return r * r * (3 - 2 * r);
};
var L_ = (e, t) => [
  e[0] * t[0] + e[1] * t[2],
  e[0] * t[1] + e[1] * t[3],
  e[2] * t[0] + e[3] * t[2],
  e[2] * t[1] + e[3] * t[3],
];
var R_ = (e) => {
  let t = Math.cos(e),
    n = Math.sin(e);
  return [t, -n, n, t];
};
var z_ = (e, t) => [e[0] * t[0] + e[1] * t[1], e[2] * t[0] + e[3] * t[1]];
var B_ = [1, 0, 0, 1];
function V_(e, t, n = null) {
  let r = (t) => !!e.bodyPoses[t];
  return n === `squash` && r(`squash`) && t.sy < 0.94
    ? `squash`
    : n === `stretch` && r(`stretch`) && t.sy > 1.04
      ? `stretch`
      : t.sy < 0.9 && r(`squash`)
        ? `squash`
        : t.sy > 1.08 && r(`stretch`)
          ? `stretch`
          : `idle`;
}
var H_ = class {
  fps;
  cur = `idle`;
  lastTick = -1;
  constructor(e = __.fps) {
    this.fps = e;
  }
  update(e, t) {
    let n = Math.floor((t.t ?? 0) * this.fps);
    return (
      n !== this.lastTick &&
        ((this.cur = V_(e, { sy: t.sy ?? 1 }, this.cur)), (this.lastTick = n)),
      this.cur
    );
  }
  reset() {
    ((this.cur = `idle`), (this.lastTick = -1));
  }
};
function U_(e, t) {
  let n = null,
    r = 1e9;
  for (let [i, a] of Object.entries(e.states)) {
    if (a.deg == null) continue;
    let e = Math.abs(a.deg - t);
    e < r && ((r = e), (n = i));
  }
  return n;
}
function W_(e, t) {
  let n = e.eye ?? t.eye,
    r = e.blink ?? 0;
  return (
    x_.roundEyes.includes(n) &&
      (r >= x_.closed ? (n = `closed`) : r >= x_.half && (n = `half`)),
    n
  );
}
function G_(e, t, n = 0, r = __.fps) {
  if (t <= 1) return 0;
  let i = S_(t),
    a = i.length;
  return i[((Math.floor(e * r + n * a) % a) + a) % a] % t;
}
var K_ = new WeakMap();
function q_(e, t) {
  if (!t || !e.twin) return e;
  let n = K_.get(e);
  return (
    n ||
      ((n = Object.assign({}, e, {
        anchors: e.twin.anchors,
        bodyPoses: e.twin.bodyPoses,
        parts: Object.assign({}, e.parts, e.twin.parts),
      })),
      K_.set(e, n)),
    n
  );
}
function J_(e) {
  let t = M_();
  for (let n of Object.keys(e)) {
    let r = e[n];
    r !== void 0 && (t[n] = r);
  }
  let n = t;
  return (
    (n.arm = Object.assign({ L: {}, R: {} }, e.arm || {})),
    (n.foot = Object.assign({ L: {}, R: {} }, e.foot || {})),
    (n.look = Object.assign({ x: 0, y: 0 }, e.look || {})),
    (n.props = e.props || {}),
    n
  );
}
function Y_(e, t = {}) {
  let n = J_(t),
    r = n.turn ?? 1,
    i = Math.max(0.02, Math.min(1, Math.abs(r))),
    a = n.facing ?? e.facing ?? 0,
    o = r < 0 ? -(a || 1) : a || 1,
    s = !!e.twin && !!e.facing && o === -e.facing,
    c = q_(e, s),
    l = r < 0 && !e.twin,
    u = c.moods || b_,
    d = u[n.mood] || u.neutral,
    f = d.look || [0, 0],
    p = {
      x: P_(n.look.x + (s ? -f[0] : f[0]), -1, 1),
      y: P_(n.look.y + f[1], -1, 1),
    },
    m =
      n.bodyPose === `auto`
        ? V_(c, n, n.autoFrom)
        : c.bodyPoses[n.bodyPose]
          ? n.bodyPose
          : `idle`,
    h = c.bodyPoses[m],
    g = h.nominal,
    _ = n.sx / g.sx,
    v = n.sy / g.sy,
    y = Math.cos(n.lean),
    b = Math.sin(n.lean),
    x = (e, t) => [
      y * e,
      y * n.shear * t + b * t,
      -b * e,
      -b * n.shear * t + y * t,
    ],
    S = x(_, v),
    C = Object.assign({}, c.anchors, h.anchors),
    w = typeof n.pivot == `string` ? C[n.pivot] || [0, 0] : n.pivot || [0, 0],
    T = z_([_, n.shear * v, 0, v], w),
    E = z_([y, b, -b, y], T),
    D = [T[0] - E[0], T[1] - E[1]],
    O = n.lift;
  if (n.contact === `ground` && h.hull?.length) {
    let e = 1e9;
    for (let t of h.hull) e = Math.min(e, z_(S, t)[1] + D[1]);
    O = (n.contactV ?? 0) - e + n.lift;
  }
  return {
    rig0: e,
    rig: c,
    P: n,
    useTwin: s,
    flipSprites: l,
    turnAbs: i,
    mood: d,
    look: p,
    bpName: m,
    bp: h,
    nom: g,
    ex: _,
    ey: v,
    Bl: S,
    t0: D,
    Lf: O,
    anchors: C,
    B: (e) => {
      let t = z_(S, e);
      return [t[0] + D[0], t[1] + D[1] + O];
    },
    Gm: x,
  };
}
function X_(e, t = {}) {
  let {
      rig: n,
      P: r,
      mood: i,
      look: a,
      bpName: o,
      bp: s,
      nom: c,
      ex: l,
      ey: u,
      Bl: d,
      t0: f,
      Lf: p,
      anchors: m,
      B: h,
      Gm: g,
      flipSprites: _,
      turnAbs: v,
    } = e,
    y = r.t ?? 0,
    b = r.draw ?? 1,
    x = Math.sqrt(r.sx * r.sy),
    S = {};
  for (let e of n.order) {
    let t = n.parts[e],
      a = r.props[e] || {},
      s = t.side < 0 ? `L` : `R`,
      c = t.default;
    switch (t.role) {
      case `body`:
        c = o;
        break;
      case `arm`: {
        let e = r.arm[s] || {};
        c = e.pick || (e.deg == null ? t.default : U_(t, e.deg)) || t.default;
        break;
      }
      case `foot`: {
        let e = r.foot[s] || {};
        c = e.pick || (e.deg == null ? t.default : U_(t, e.deg)) || t.default;
        break;
      }
      case `eye`:
        c = W_(r, i);
        break;
      case `brow`:
        c = r.brow ?? i.brow;
        break;
      case `mouth`:
        c = r.mouth ?? i.mouth;
        break;
      case `prop`:
        c = a.state || i.props?.[e] || t.default;
    }
    (!t.states[c] && (t.role !== `brow` || c !== `none`) && (c = t.default),
      (S[e] = { state: c, st: t.states[c] ?? t.states[t.default] }));
  }
  let C = {},
    w = (e) => {
      let t = C[e];
      if (t) return t;
      let o = n.parts[e],
        s = r.props[e] || {},
        { st: f } = S[e],
        _ = o.side < 0 ? `L` : `R`,
        v = r.arm[_] || {},
        y = r.foot[_] || {},
        b = m[o.anchor] || [0, 0],
        T =
          o.attach === `body`
            ? [o.offset[0] * c.sx, o.offset[1] * c.sy]
            : o.offset,
        E = [b[0] + T[0], b[1] + T[1]];
      if (o.look) {
        let e = o.lookGain ?? 1;
        E = [
          E[0] +
            a.x * n.look.face[0] * e +
            (o.look === `eye` ? a.x * n.look.eye[0] : 0),
          E[1] +
            a.y * n.look.face[1] * e +
            (o.look === `eye` ? a.y * n.look.eye[1] : 0),
        ];
      }
      let D = 0,
        O = s.sx ?? 1,
        k = s.sy ?? 1,
        A = s.dx ?? 0,
        j = s.dy ?? 0,
        M = !0,
        N = 0,
        P = 0,
        ee = 0;
      if (o.role === `arm`) {
        let e = v.deg ?? o.states[o.default].deg;
        ((D = (o.rotSign ?? o.side) * (e - (f.deg ?? e)) * N_),
          (M = v.deg != null),
          (N = v.dx ?? 0),
          (P = v.dy ?? 0));
      } else
        o.role === `foot`
          ? (y.deg == null
              ? ((D = y.rot ?? 0),
                (ee = D),
                (A = y.dx ?? 0),
                (j = y.dy ?? 0),
                (N = A),
                (P = j))
              : ((D = (o.rotSign ?? o.side) * (y.deg - (f.deg ?? y.deg)) * N_),
                (A = 0),
                (j = 0)),
            (M = y.deg != null))
          : o.role === `prop` &&
            ((D = s.rot ?? 0),
            o.rotRange && (D = P_(D, o.rotRange[0], o.rotRange[1])));
      if (o.role === `cheek`) {
        let e = 0.7 + 0.3 * P_(r.blush ?? i.blush ?? 1, 0, 1.6);
        ((O *= e), (k *= e));
      }
      if (o.role === `mouth`) {
        let e = r.mouthScale ?? i.mouthScale ?? 1;
        ((O *= e), (k *= e));
      }
      let F = L_(R_(D), [O, 0, 0, k]),
        te,
        ne;
      if (o.role === `body`) ((te = l), (ne = u));
      else if (
        o.role === `eye` ||
        o.role === `brow` ||
        o.role === `mouth` ||
        o.role === `cheek`
      )
        ((te = x), (ne = x));
      else {
        let e = s.squashK ?? o.squashK ?? y_[o.role] ?? 1;
        ((te = F_(1, r.sx, e)), (ne = F_(1, r.sy, e)));
      }
      let re,
        ie,
        ae = F,
        oe = [A, j];
      if (o.parent) {
        let e = w(o.parent);
        ae = L_(e.Lacc, F);
        let t = z_(
          [e.Lacc[0] - 1, e.Lacc[1], e.Lacc[2], e.Lacc[3] - 1],
          [E[0] - e.ap[0], E[1] - e.ap[1]],
        );
        oe = [A + t[0] + e.off[0], j + t[1] + e.off[1]];
      }
      if (o.plant && !M && o.attach === `body`) {
        let e = h(E),
          t = [l * E[0] + N, P],
          n = [t[0] - e[0], t[1] - e[1]],
          r = Math.hypot(n[0], n[1]) || 1e-6,
          i = o.plant,
          a = P_(r / i.len, i.min ?? 0.7, i.max ?? 1.2),
          s = P_(1 / Math.sqrt(a), 0.92, 1.1);
        ((re = L_(R_(Math.atan2(n[0], -n[1]) + ee), [s, 0, 0, a])),
          (ie = e),
          (ae = re));
      } else if (o.attach === `ground`) {
        ((re = F), (ie = [l * E[0] + A, E[1] + j + p]));
        let e = P_(r.footFollow ?? 0, 0, 1);
        if (e > 0) {
          let t = L_(d, F),
            n = h(E),
            r = z_(d, [A, j]);
          ((re = [
            re[0] + (t[0] - re[0]) * e,
            re[1] + (t[1] - re[1]) * e,
            re[2] + (t[2] - re[2]) * e,
            re[3] + (t[3] - re[3]) * e,
          ]),
            (ie = [
              ie[0] + (n[0] + r[0] - ie[0]) * e,
              ie[1] + (n[1] + r[1] - ie[1]) * e,
            ]));
        }
      } else {
        re = L_(g(te, ne), ae);
        let e = h(E),
          t = z_(d, oe);
        ie = [e[0] + t[0], e[1] + t[1]];
        let r = s.space === `card` ? 0 : (s.follow ?? 1);
        if (r < 1) {
          let e = n.anchors[o.anchor] || [0, 0],
            t = [
              e[0] + o.offset[0] + (s.dx ?? 0),
              e[1] + o.offset[1] + (s.dy ?? 0),
            ],
            i = L_(B_, F);
          ((re = [
            F_(i[0], re[0], r),
            F_(i[1], re[1], r),
            F_(i[2], re[2], r),
            F_(i[3], re[3], r),
          ]),
            (ie = [F_(t[0], ie[0], r), F_(t[1], ie[1], r)]));
        }
      }
      return (C[e] = { M: re, t: ie, Lacc: ae, ap: E, off: oe, local: F });
    },
    T = { w: r.sx, cu: 0 },
    E = s.hull,
    D = n.bodyPoses.idle?.hull;
  if (E?.length && D?.length) {
    let e = 1e9,
      t = -1e9;
    for (let n of E) {
      let r = z_(d, n)[0] + f[0];
      (r < e && (e = r), r > t && (t = r));
    }
    let n = 1e9,
      r = -1e9;
    for (let e of D) (e[0] < n && (n = e[0]), e[0] > r && (r = e[0]));
    T = {
      w: P_((t - e) / Math.max(0.001, r - n), 0.5, 2.6),
      cu: (t + e - (r + n)) / 2,
    };
  }
  let O = [];
  for (let e of n.order) {
    let a = n.parts[e],
      o = r.props[e] || {},
      { state: s, st: c } = S[e];
    if (o.hidden || (a.role === `brow` && s === `none`)) continue;
    let l =
        t.hand == null
          ? G_(y, c.frames.length, a.phase)
          : t.hand % c.frames.length,
      u = c.frames[l % c.frames.length],
      d = 1,
      f = r.alpha,
      h = s;
    if (b < 1 && a.sketch) {
      let [e, t] = a.sketch,
        n = a.states[a.default];
      if (a.timed) {
        if (
          ((d = P_((b - e) / (t - e), 0, 1)),
          (u = n.frames[0]),
          (h = a.default),
          d <= 0)
        )
          continue;
      } else if (b < t) continue;
    } else if (b < 1 && !a.sketch && ((f *= I_(0.6, 0.85, b)), f <= 0))
      continue;
    (a.role === `cheek` && (f *= P_(P_(r.blush ?? i.blush ?? 1, 0, 1.6), 0, 1)),
      o.alpha != null && (f *= o.alpha));
    let g = a.role === `arm` && o.front ? (a.zFront ?? a.z + 70) : (c.z ?? a.z);
    if (a.role === `shadow`) {
      let t = m[a.anchor] || [0, 0],
        n = [t[0] + a.offset[0], t[1] + a.offset[1]],
        r = 1 / (1 + 1.2 * Math.max(0, p));
      O.push({
        part: e,
        role: a.role,
        frame: u,
        state: h,
        hand: l,
        z: g,
        layer: g * v_,
        batch: a.batch,
        m: [T.w * r * (o.sx ?? 1), 0, 0, r * (o.sy ?? 1)],
        t: [n[0] + T.cu * r + (o.dx ?? 0), n[1] + (o.dy ?? 0)],
        alpha: f / (1 + 2 * Math.max(0, p)),
        progress: d,
      });
      continue;
    }
    let x = w(e),
      C = x.M,
      E = x.t;
    if (a.batch !== `flat` && (v !== 1 || _)) {
      let e = [(_ ? -1 : 1) * v, 0, 0, 1];
      ((C = L_(e, C)), (E = z_(e, E)));
    }
    O.push({
      part: e,
      role: a.role,
      frame: u,
      state: h,
      hand: l,
      z: g,
      layer: g * v_,
      batch: a.batch,
      m: C,
      t: E,
      alpha: f,
      progress: d,
    });
  }
  return (O.sort((e, t) => e.z - t.z), O);
}
function Z_(e, t) {
  let n = 1e9,
    r = 1e9,
    i = -1e9,
    a = -1e9;
  for (let o of t) {
    let t = e.frames[o.frame];
    if (t)
      for (let [e, s] of [
        [0, 0],
        [t.w, 0],
        [t.w, t.h],
        [0, t.h],
      ]) {
        let c = [e - t.px, s - t.py],
          l = z_(o.m, c),
          u = l[0] + o.t[0],
          d = l[1] + o.t[1];
        (u < n && (n = u),
          u > i && (i = u),
          d < r && (r = d),
          d > a && (a = d));
      }
  }
  return [n, r, i, a];
}
var Q_ = (e, t, n) => (e < t ? t : e > n ? n : e);
var $_ = (e, t = 0) => (typeof e == `number` && Number.isFinite(e) ? e : t);
var ev = 0.55;
var tv = 0.35;
var nv = 0.05;
var rv = 1 / 30;
var iv = class {
  rig;
  names;
  s = {};
  hist = [];
  last = null;
  vx = 0;
  vl = 0;
  px = null;
  pl = null;
  accMax;
  constructor(e, t = {}) {
    ((this.rig = e),
      (this.accMax = t.accMax ?? 1 / 0),
      (this.names = Object.keys(e.parts).filter(
        (t) => e.parts[t].spring && e.parts[t].role === `prop`,
      )),
      this.reset());
  }
  reset() {
    ((this.s = Object.fromEntries(this.names.map((e) => [e, { th: 0, w: 0 }]))),
      (this.hist = []),
      (this.last = null),
      (this.vx = 0),
      (this.vl = 0),
      (this.px = null),
      (this.pl = null));
  }
  kick(e, t) {
    let n = this.s[e];
    n && Number.isFinite(t) && (n.w += t);
  }
  angle(e) {
    return this.s[e]?.th ?? 0;
  }
  has(e) {
    return e in this.s;
  }
  resync(e = {}) {
    ((this.px = $_(e.x)),
      (this.pl = $_(e.lean)),
      (this.vx = 0),
      (this.vl = 0),
      (this.hist =
        this.last == null ? [] : [{ t: this.last, lean: $_(e.lean) }]));
  }
  settle() {
    for (let e of this.names) {
      let t = this.s[e];
      ((t.th = 0), (t.w = 0));
    }
  }
  step(e, t) {
    t = Q_($_(t), 0, rv);
    let n = $_(e.lean),
      r = $_(e.x),
      i = (this.last ?? 0) + t;
    (this.px == null || this.pl == null) &&
      ((this.px = r), (this.pl = n), (this.vx = 0), (this.vl = 0));
    let a = 0;
    if (t > 0) {
      let e = (r - this.px) / t,
        i = (n - this.pl) / t;
      ((a = (e - this.vx) / t + (0.9 * (i - this.vl)) / t),
        this.accMax !== 1 / 0 && (a = Q_(a, -this.accMax, this.accMax)),
        (this.px = r),
        (this.pl = n),
        (this.vx = e),
        (this.vl = i));
    }
    (t > 0 || !this.hist.length) && this.hist.push({ t: i, lean: n });
    let o = Math.max(1, Math.ceil(t / (1 / 120))),
      s = t / o;
    if (t > 0)
      for (let e = 0; e < o; e++) {
        let t = (this.last ?? 0) + (e + 1) * s;
        for (let e of this.names) {
          let n = this.rig.parts[e].spring,
            r = this.s[e],
            i =
              n.from === `lean`
                ? -n.gain * tv * this.leanAt(t - (n.wave || 0) * nv)
                : 0,
            o =
              -n.k * (r.th - i) -
              n.damp * r.w -
              (n.from === `lean` ? ev * n.gain * a : 0);
          ((r.w += o * s), (r.th += r.w * s));
        }
      }
    for (this.last = i; this.hist.length && this.hist[0].t < this.last - 1.2;)
      this.hist.shift();
    let c = {};
    for (let e of this.names) {
      let t = this.rig.parts[e].rotRange,
        n = this.s[e];
      ((!Number.isFinite(n.th) || !Number.isFinite(n.w)) &&
        ((n.th = 0), (n.w = 0)),
        t &&
          (n.th < t[0]
            ? ((n.th = t[0]), n.w < 0 && (n.w = 0))
            : n.th > t[1] && ((n.th = t[1]), n.w > 0 && (n.w = 0))),
        (c[e] = { rot: n.th }));
    }
    return c;
  }
  advance(e, t, n) {
    if (((n = Q_($_(n), 0, 1)), n <= 0)) return this.step(t, 0);
    let r = Math.max(1, Math.ceil(n / rv - 1e-9)),
      i = {};
    this.px ?? this.resync(e);
    let a = $_(e.lean),
      o = $_(t.lean),
      s = $_(e.x),
      c = $_(t.x);
    for (let e = 1; e <= r; e++) {
      let t = e / r;
      i = this.step({ lean: a + (o - a) * t, x: s + (c - s) * t }, n / r);
    }
    return i;
  }
  leanAt(e) {
    let t = this.hist;
    if (!t.length) return 0;
    if (e <= t[0].t) return t[0].lean;
    for (let n = t.length - 1; n >= 0; n--) if (t[n].t <= e) return t[n].lean;
    return t[0].lean;
  }
};
function av(e, t) {
  let n = Object.assign({}, e.props || {});
  for (let [e, r] of Object.entries(t))
    n[e] = Object.assign({}, n[e] || {}, { rot: (n[e]?.rot ?? 0) + r.rot });
  return Object.assign({}, e, { props: n });
}
var B = (e, t, n) => (e < t ? t : e > n ? n : e);
var V = (e) => (e < 0 ? 0 : e > 1 ? 1 : e);
var ov = (e, t, n) => e + (t - e) * n;
var sv = (e) => {
  let t = V(e);
  return t * t * (3 - 2 * t);
};
var cv = (e) => {
  let t = V(e);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
var lv = Math.PI;
var uv = 1.70158;
var dv = 2.70158;
var fv = (2 * lv) / 3;
var pv = (e) => (t) => (t < 0.5 ? 0.5 * e(2 * t) : 1 - 0.5 * e(2 - 2 * t));
var mv = (e) => (t) => 1 - e(1 - t);
var hv = (e) => {
  let t = 7.5625,
    n = 2.75;
  if (e < 1 / n) return t * e * e;
  if (e < 2 / n) {
    let r = e - 1.5 / n;
    return t * r * r + 0.75;
  }
  if (e < 2.5 / n) {
    let r = e - 2.25 / n;
    return t * r * r + 0.9375;
  }
  let r = e - 2.625 / n;
  return t * r * r + 0.984375;
};
var H = {
  linear: (e) => e,
  smooth: sv,
  smoother: cv,
  inQuad: (e) => e * e,
  outQuad: (e) => 1 - (1 - e) * (1 - e),
  inOutQuad: pv((e) => e * e),
  inCubic: (e) => e * e * e,
  outCubic: (e) => 1 - (1 - e) ** 3,
  inOutCubic: (e) => (e < 0.5 ? 4 * e * e * e : 1 - (-2 * e + 2) ** 3 / 2),
  inQuart: (e) => e ** 4,
  outQuart: (e) => 1 - (1 - e) ** 4,
  inOutQuart: (e) => (e < 0.5 ? 8 * e ** 4 : 1 - (-2 * e + 2) ** 4 / 2),
  inQuint: (e) => e ** 5,
  outQuint: (e) => 1 - (1 - e) ** 5,
  inSine: (e) => 1 - Math.cos((e * lv) / 2),
  outSine: (e) => Math.sin((e * lv) / 2),
  inOutSine: (e) => -(Math.cos(lv * e) - 1) / 2,
  inExpo: (e) => (e <= 0 ? 0 : e >= 1 ? 1 : 2 ** (10 * e - 10)),
  outExpo: (e) => (e >= 1 ? 1 : 1 - 2 ** (-10 * e)),
  inCirc: (e) => 1 - Math.sqrt(1 - e * e),
  outCirc: (e) => Math.sqrt(1 - (e - 1) ** 2),
  inBack: (e) => dv * e * e * e - uv * e * e,
  outBack: (e) => 1 + dv * (e - 1) ** 3 + uv * (e - 1) ** 2,
  inOutBack: (e) => {
    let t = uv * 1.525;
    return e < 0.5
      ? ((2 * e) ** 2 * (7.189819 * e - t)) / 2
      : ((2 * e - 2) ** 2 * (3.5949095 * (e * 2 - 2) + t) + 2) / 2;
  },
  inElastic: (e) =>
    e <= 0
      ? 0
      : e >= 1
        ? 1
        : -(2 ** (10 * e - 10)) * Math.sin((e * 10 - 10.75) * fv),
  outElastic: (e) =>
    e <= 0
      ? 0
      : e >= 1
        ? 1
        : 2 ** (-10 * e) * Math.sin((e * 10 - 0.75) * fv) + 1,
  outBounce: hv,
  inBounce: mv(hv),
  inOutBounce: pv(mv(hv)),
};
function gv(e, t, n, r) {
  let i = 3 * e,
    a = 3 * (n - e) - i,
    o = 1 - i - a,
    s = 3 * t,
    c = 3 * (r - t) - s,
    l = 1 - s - c,
    u = (e) => ((o * e + a) * e + i) * e,
    d = (e) => ((l * e + c) * e + s) * e,
    f = (e) => (3 * o * e + 2 * a) * e + i;
  return (e) => {
    if (e <= 0) return 0;
    if (e >= 1) return 1;
    let t = e;
    for (let n = 0; n < 8; n++) {
      let n = u(t) - e;
      if (Math.abs(n) < 1e-7) return d(t);
      let r = f(t);
      if (Math.abs(r) < 1e-6) break;
      t -= n / r;
    }
    let n = 0,
      r = 1;
    t = e;
    for (let i = 0; i < 40; i++) {
      let i = u(t);
      if (Math.abs(i - e) < 1e-7) break;
      (i < e ? (n = t) : (r = t), (t = (n + r) / 2));
    }
    return d(t);
  };
}
function _v(e, t, n, r, i) {
  let a = 2 / Math.max(1e-4, r),
    o = a * i,
    s = 1 / (1 + o + 0.48 * o * o + 0.235 * o * o * o),
    c = e - t,
    l = (n + a * c) * i,
    u = (n - a * l) * s,
    d = t + (c + l) * s;
  return (
    t - e > 0 == d > t && ((d = t), (u = i > 0 ? (d - t) / i : 0)),
    [d, u]
  );
}
var vv = {
  x: `add`,
  y: `add`,
  lift: `add`,
  lean: `add`,
  shear: `add`,
  blink: `add`,
  sx: `mul`,
  sy: `mul`,
  alpha: `mul`,
  draw: `ovr`,
  turn: `ovr`,
  blush: `ovr`,
  mouthScale: `ovr`,
  footFollow: `ovr`,
  mood: `set`,
  eye: `set`,
  brow: `set`,
  mouth: `set`,
  bodyPose: `set`,
  facing: `set`,
  pivot: `set`,
  contact: `set`,
};
var yv = { deg: `ovr`, dx: `add`, dy: `add`, pick: `set` };
var bv = { deg: `ovr`, dx: `add`, dy: `add`, rot: `add`, pick: `set` };
var xv = {
  rot: `add`,
  dx: `add`,
  dy: `add`,
  sx: `mul`,
  sy: `mul`,
  alpha: `mul`,
  follow: `ovr`,
  squashK: `ovr`,
  state: `set`,
  hidden: `set`,
  front: `set`,
  space: `set`,
};
function Sv(e) {
  let t = e.split(`.`);
  return t.length === 1
    ? (vv[t[0]] ?? null)
    : t[0] === `look` && t.length === 2 && (t[1] === `x` || t[1] === `y`)
      ? `add`
      : t[0] === `arm` && t.length === 3 && (t[1] === `L` || t[1] === `R`)
        ? (yv[t[2]] ?? null)
        : t[0] === `foot` && t.length === 3 && (t[1] === `L` || t[1] === `R`)
          ? (bv[t[2]] ?? null)
          : t[0] === `props` && t.length === 3
            ? (xv[t[2]] ?? null)
            : null;
}
function Cv(e) {
  let t = [];
  for (let [n, r] of Object.entries(e))
    if (r !== void 0 && n !== `mix` && n !== `set`) {
      if (n === `look`) {
        let e = r;
        (e.x !== void 0 && t.push([`look.x`, e.x]),
          e.y !== void 0 && t.push([`look.y`, e.y]));
      } else if (n === `arm` || n === `foot`) {
        for (let [e, i] of Object.entries(r))
          if (i)
            for (let [r, a] of Object.entries(i))
              a !== void 0 && t.push([`${n}.${e}.${r}`, a]);
      } else if (n === `props`) {
        for (let [e, n] of Object.entries(r))
          if (n)
            for (let [r, i] of Object.entries(n))
              i !== void 0 && t.push([`props.${e}.${r}`, i]);
      } else t.push([n, r]);
    }
  return t;
}
function wv(e, t, n) {
  let r = t.split(`.`),
    i = e;
  if (r.length === 1) {
    i[r[0]] = n;
    return;
  }
  let a = i;
  for (let e = 0; e < r.length - 1; e++) {
    let t = r[e];
    ((typeof a[t] != `object` || a[t] === null) && (a[t] = {}), (a = a[t]));
  }
  a[r[r.length - 1]] = n;
}
function Tv(e, t) {
  let n = e;
  for (let e of t.split(`.`)) {
    if (typeof n != `object` || !n) return;
    n = n[e];
  }
  return n;
}
var Ev = 1e-9;
var Dv = (e) => (e > 0.999999999 ? 1 : e);
function Ov(e, t) {
  if (!e) return t;
  if (!t) return e;
  let n = { ...e };
  for (let [e, r] of Object.entries(t)) {
    let t = n[e];
    n[e] =
      r &&
      typeof r == `object` &&
      !Array.isArray(r) &&
      t &&
      typeof t == `object` &&
      !Array.isArray(t)
        ? Ov(t, r)
        : r;
  }
  return n;
}
function kv(e, t) {
  if (t >= 0.999999999) return e;
  let n = {},
    r = {};
  for (let [i, a] of Cv(e)) {
    let o = Sv(i);
    if (o === `add`) wv(n, i, a * t);
    else if (o === `mul`) wv(n, i, 1 + (a - 1) * t);
    else if (o === `ovr`) {
      wv(n, i, a);
      let o = (e.mix?.[i] ?? 1) * t;
      o > Ev ? (r[i] = o) : Av(n, i);
    } else o === `set` && t >= 0.5 && wv(n, i, a);
  }
  return (
    Object.keys(r).length && (n.mix = r),
    e.set && t >= 0.5 && (n.set = e.set),
    n
  );
}
function Av(e, t) {
  let n = t.split(`.`),
    r = e;
  for (let e = 0; e < n.length - 1; e++) {
    let t = r[n[e]];
    if (typeof t != `object` || !t) return;
    r = t;
  }
  delete r[n[n.length - 1]];
}
function jv(e, t) {
  let n = {},
    r = {},
    i = new Set(),
    a = new Map(Cv(e)),
    o = new Map(Cv(t));
  for (let [s, c] of a) {
    i.add(s);
    let a = o.get(s),
      l = Sv(s);
    if (a === void 0) {
      wv(n, s, c);
      let t = e.mix?.[s];
      l === `ovr` && t !== void 0 && (r[s] = t);
      continue;
    }
    if (l === `add`) wv(n, s, c + a);
    else if (l === `mul`) wv(n, s, c * a);
    else if (l === `ovr`) {
      let i = e.mix?.[s] ?? 1,
        o = t.mix?.[s] ?? 1,
        l = 1 - (1 - i) * (1 - o);
      (wv(n, s, l > Ev ? (i * (1 - o) * c + o * a) / l : a),
        Dv(l) < 1 && (r[s] = l));
    } else wv(n, s, a);
  }
  for (let [e, a] of o) {
    if (i.has(e)) continue;
    wv(n, e, a);
    let o = t.mix?.[e];
    Sv(e) === `ovr` && o !== void 0 && (r[e] = o);
  }
  Object.keys(r).length && (n.mix = r);
  let s = Ov(e.set, t.set);
  return (s && (n.set = s), n);
}
function Mv(e) {
  let t = {};
  for (let n of e) t = jv(t, n);
  return t;
}
function Nv(e, t) {
  let n = {};
  for (let [r, i] of Cv(e)) {
    let e = Sv(r);
    e === `add`
      ? wv(n, r, i * t)
      : e === `mul`
        ? wv(n, r, 1 + (i - 1) * t)
        : wv(n, r, i);
  }
  return (e.mix && (n.mix = { ...e.mix }), e.set && (n.set = e.set), n);
}
function Pv(e) {
  let t = new Set([`x`, `lean`, `shear`, `look.x`]),
    n = {},
    r = (e) =>
      e.replace(
        /^(arm|foot)\.([LR])\./,
        (e, t, n) => `${t}.${n === `L` ? `R` : `L`}.`,
      );
  for (let [i, a] of Cv(e)) {
    let e = Sv(i),
      o = r(i),
      s = i.split(`.`).pop();
    e === `add` &&
    (t.has(i) ||
      s === `dx` ||
      (i.startsWith(`props.`) && s === `rot`) ||
      (i.startsWith(`foot.`) && s === `rot`))
      ? wv(n, o, -a)
      : i === `pivot` && Array.isArray(a)
        ? wv(n, o, [-a[0], a[1]])
        : i === `facing`
          ? wv(n, o, -a)
          : wv(n, o, a);
  }
  if (e.mix) {
    n.mix = {};
    for (let [t, i] of Object.entries(e.mix)) n.mix[r(t)] = i;
  }
  return (e.set && (n.set = e.set), n);
}
function Fv(e) {
  return Cv(e).length === 0 && !e.set;
}
function Iv(e, t, n) {
  let r = e.split(`.`);
  switch (r[0]) {
    case `draw`:
    case `turn`:
      return 1;
    case `footFollow`:
      return 0;
    case `blush`:
      return n?.moods?.[t.mood ?? `neutral`]?.blush ?? 1;
    case `mouthScale`:
      return n?.moods?.[t.mood ?? `neutral`]?.mouthScale ?? 1;
    case `arm`: {
      let e = n?.parts?.[r[1] === `L` ? `armL` : `armR`];
      return e?.states?.[e.default]?.deg ?? 0;
    }
    case `foot`: {
      let e = n?.parts?.[r[1] === `L` ? `footL` : `footR`];
      return e?.states?.[e.default]?.deg ?? 0;
    }
    case `props`: {
      let e = n?.parts?.[r[1]];
      return r[2] === `follow`
        ? 1
        : (e?.squashK ?? (e ? (y_[e.role] ?? 1) : 1));
    }
    default:
      return 0;
  }
}
function Lv(e, t) {
  let n = e;
  for (let e of t.split(`.`)) {
    if (typeof n != `object` || !n) return;
    n = n[e];
  }
  return n;
}
function Rv(e, t, n) {
  let r = t.split(`.`),
    i = e;
  for (let e = 0; e < r.length - 1; e++) {
    let t = r[e],
      n = i[t];
    i = i[t] = typeof n == `object` && n ? { ...n } : {};
  }
  i[r[r.length - 1]] = n;
}
function zv(e, t, n) {
  let r = e;
  (t.set && (r = Ov(r, t.set)), (r = r === e ? { ...e } : r));
  for (let [e, i] of Cv(t)) {
    let a = Sv(e);
    if (a === `add`) Rv(r, e, (Lv(r, e) ?? 0) + i);
    else if (a === `mul`) Rv(r, e, (Lv(r, e) ?? 1) * i);
    else if (a === `ovr`) {
      let a = t.mix?.[e] ?? 1;
      if (a >= 0.999999999) Rv(r, e, i);
      else {
        let t = Lv(r, e) ?? Iv(e, r, n);
        Rv(r, e, t + (i - t) * a);
      }
    } else a === `set` && Rv(r, e, i);
  }
  return r;
}
function Bv(e) {
  if (e.look) {
    let t = e.look.x ?? 0,
      n = e.look.y ?? 0;
    (t < -1 || t > 1 || n < -1 || n > 1) &&
      (e.look = {
        x: Math.max(-1, Math.min(1, t)),
        y: Math.max(-1, Math.min(1, n)),
      });
  }
  return (
    e.sx !== void 0 && e.sx < 0.05 && (e.sx = 0.05),
    e.sy !== void 0 && e.sy < 0.05 && (e.sy = 0.05),
    e
  );
}
var Vv = new Set([`impact`, `world`]);
var Hv = (e) => e.essential ?? Vv.has(e.kind);
var U = {
  sound: (e, t, n) => ({ at: e, kind: `sound`, name: t, data: n }),
  particle: (e, t, n) => ({ at: e, kind: `particle`, name: t, data: n }),
  world: (e, t, n) => ({ at: e, kind: `world`, name: t, data: n }),
  shake: (e, t = 1, n = 0.25) => ({
    at: e,
    kind: `shake`,
    name: `shake`,
    data: { amount: t, duration: n },
  }),
  impact: (e, t = `impact`, n) => ({
    at: e,
    kind: `impact`,
    name: t,
    data: n,
  }),
  custom: (e, t, n) => ({ at: e, kind: `custom`, name: t, data: n }),
};
var Uv = { breath: !0, blink: !0, look: !0, ears: !0 };
function Wv(e) {
  return e === void 0 || e === !0
    ? { ...Uv }
    : e === !1
      ? { breath: !1, blink: !1, look: !1, ears: !1 }
      : {
          breath: e.breath ?? !0,
          blink: e.blink ?? !0,
          look: e.look ?? !0,
          ears: e.ears ?? !0,
        };
}
function Gv(e, t) {
  let n = Wv(e),
    r = Wv(t);
  return {
    breath: n.breath && r.breath,
    blink: n.blink && r.blink,
    look: n.look && r.look,
    ears: n.ears && r.ears,
  };
}
var Kv = Object.freeze({});
var qv = (e, t) => e.at - t.at;
var Jv = class e {
  duration;
  idle;
  label;
  fn;
  evs;
  dyn;
  constructor(e) {
    if (!(e.duration >= 0))
      throw RangeError(`Clip: duration must be >= 0 (got ${e.duration})`);
    ((this.duration = e.duration),
      (this.fn = e.sample),
      (this.evs = [...(e.events ?? [])].sort(qv)));
    for (let t of this.evs)
      if (!(t.at >= 0 && t.at <= e.duration))
        throw RangeError(
          `Clip '${e.label ?? `?`}': event '${t.name}' at ${t.at} is outside 0..${e.duration}`,
        );
    ((this.dyn = e.eventsIn), (this.idle = e.idle), (this.label = e.label));
  }
  sample(e) {
    return this.fn(e <= 0 ? 0 : e > this.duration ? this.duration : e);
  }
  eventsIn(e, t) {
    if (this.dyn) return this.dyn(e, Math.min(t, this.duration));
    if (!this.evs.length) return [];
    let n = [];
    for (let r of this.evs) r.at > e && r.at <= t && n.push(r);
    return n;
  }
  then(...e) {
    return ey(this, ...e);
  }
  and(...e) {
    return ty(this, ...e);
  }
  delayed(e) {
    return ny(this, e);
  }
  blended(e, t = e, n = {}) {
    return iy(this, e, t, n);
  }
  eased(e) {
    return oy(this, e);
  }
  looped(e = 1 / 0) {
    return ry(this, e);
  }
  scaled(e) {
    return ly(this, e);
  }
  speed(e) {
    return sy(this, e);
  }
  reversed() {
    return cy(this);
  }
  mirrored() {
    return uy(this);
  }
  volume(e = 1) {
    return dy(this, e);
  }
  followed(e) {
    return my(this, e);
  }
  withEvents(...e) {
    return fy(this, ...e);
  }
  withIdle(e) {
    return py(this, e);
  }
  named(t) {
    return new e({
      duration: this.duration,
      sample: (e) => this.sample(e),
      eventsIn: (e, t) => this.eventsIn(e, t),
      idle: this.idle,
      label: t,
    });
  }
};
function Yv(e) {
  return e instanceof Jv
    ? e
    : new Jv({
        duration: e.duration,
        sample: (t) => e.sample(t),
        eventsIn: (t, n) => e.eventsIn(t, n),
        idle: e.idle,
        label: e.label,
      });
}
function W(e, t, n = {}) {
  return new Jv({ duration: e, sample: t, ...n });
}
function Xv(e) {
  return new Jv({ duration: e, sample: () => Kv, label: `hold` });
}
var $v = (e, t) => (t === 0 ? e : e.map((e) => ({ ...e, at: e.at + t })));
function ey(...e) {
  if (!e.length) return Xv(0);
  let t = [],
    n = 0;
  for (let r of e) (t.push(n), (n += r.duration));
  let r = e.reduce((e, t) => (t.idle === void 0 ? e : Gv(e, t.idle)), void 0);
  return new Jv({
    duration: n,
    idle: r,
    label: `sequence`,
    sample: (r) => {
      if (r >= n) {
        let t = e[e.length - 1];
        return t.sample(t.duration);
      }
      for (let n = e.length - 1; n >= 0; n--) {
        let i = e[n];
        if (i.duration > 0 && r >= t[n]) return i.sample(r - t[n]);
      }
      return e[0].sample(0);
    },
    eventsIn: (n, r) => {
      let i = [];
      return (
        e.forEach((e, a) => {
          let o = t[a];
          r - o >= 0 &&
            n - o <= e.duration &&
            i.push(...$v(e.eventsIn(n - o, r - o), o));
        }),
        i.sort(qv)
      );
    },
  });
}
function ty(...e) {
  return e.length
    ? new Jv({
        duration: Math.max(...e.map((e) => e.duration)),
        idle: e.reduce(
          (e, t) => (t.idle === void 0 ? e : Gv(e, t.idle)),
          void 0,
        ),
        label: `parallel`,
        sample: (t) => Mv(e.map((e) => e.sample(Math.min(t, e.duration)))),
        eventsIn: (t, n) => e.flatMap((e) => e.eventsIn(t, n)).sort(qv),
      })
    : Xv(0);
}
function ny(e, t) {
  return t <= 0 ? Yv(e) : ey(Xv(t), e);
}
function ry(e, t = 1 / 0) {
  let n = e.duration;
  if (!(n > 0)) return Yv(e);
  let r = n * t;
  return new Jv({
    duration: r,
    idle: e.idle,
    label: `loop`,
    sample: (t) => {
      if (t >= r && Number.isFinite(r)) return e.sample(n);
      let i = t - Math.floor(t / n) * n;
      return e.sample(i);
    },
    eventsIn: (r, i) => {
      let a = [],
        o = Math.max(0, Math.floor(r / n) - 0),
        s = Math.floor(i / n);
      for (let c = o; c <= s && c < t; c++)
        a.push(...$v(e.eventsIn(r - c * n, Math.min(i - c * n, n)), c * n));
      return a.sort(qv);
    },
  });
}
function iy(e, t, n = t, r = {}) {
  let i = r.easeIn ?? H.smooth,
    a = r.easeOut ?? H.smooth,
    o = e.duration;
  return new Jv({
    duration: o,
    idle: e.idle,
    label: `blend`,
    sample: (r) => {
      let s = 1;
      return (
        t > 0 && r < t && (s = i(r / t)),
        n > 0 &&
          Number.isFinite(o) &&
          r > o - n &&
          (s = Math.min(s, a((o - r) / n))),
        kv(e.sample(r), V(s))
      );
    },
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
function ay(e, t) {
  return new Jv({
    duration: e.duration,
    idle: e.idle,
    label: `weight`,
    sample: (n) => kv(e.sample(n), V(t(n))),
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
function oy(e, t) {
  let n = e.duration;
  if (!Number.isFinite(n) || n <= 0) return Yv(e);
  let r = (e) => t(V(e / n)) * n,
    i = (e) => {
      if (e <= 0) return 0;
      if (e >= n) return n;
      let t = 0;
      for (let i = 1; i <= 256; i++) {
        let a = (i / 256) * n;
        if (r(a) >= e) {
          let n = t,
            i = a;
          for (let t = 0; t < 30; t++) {
            let t = (n + i) / 2;
            r(t) >= e ? (i = t) : (n = t);
          }
          return i;
        }
        t = a;
      }
      return n;
    },
    a = e.eventsIn(-1e-12, n).map((e) => ({ ...e, at: i(e.at) }));
  return new Jv({
    duration: n,
    idle: e.idle,
    label: `warp`,
    sample: (t) => e.sample(r(t)),
    events: a,
  });
}
function sy(e, t) {
  if (!(t > 0)) throw RangeError(`timeScale: k must be > 0`);
  return new Jv({
    duration: e.duration / t,
    idle: e.idle,
    label: `timeScale`,
    sample: (n) => e.sample(n * t),
    eventsIn: (n, r) =>
      e.eventsIn(n * t, r * t).map((e) => ({ ...e, at: e.at / t })),
  });
}
function cy(e) {
  let t = e.duration;
  if (!Number.isFinite(t))
    throw RangeError(`reverse: an endless action cannot be reversed`);
  let n = e.eventsIn(-1e-12, t).map((e) => ({ ...e, at: t - e.at }));
  return new Jv({
    duration: t,
    idle: e.idle,
    label: `reverse`,
    sample: (n) => e.sample(t - n),
    events: n,
  });
}
function ly(e, t) {
  return new Jv({
    duration: e.duration,
    idle: e.idle,
    label: `scale`,
    sample: (n) => Nv(e.sample(n), t),
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
function uy(e) {
  return new Jv({
    duration: e.duration,
    idle: e.idle,
    label: `mirror`,
    sample: (t) => Pv(e.sample(t)),
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
function dy(e, t = 1) {
  return new Jv({
    duration: e.duration,
    idle: e.idle,
    label: `volume`,
    sample: (n) => {
      let r = e.sample(n);
      return r.sy !== void 0 && r.sx === void 0
        ? { ...r, sx: r.sy ** -t }
        : r.sx !== void 0 && r.sy === void 0
          ? { ...r, sy: r.sx ** (-1 / t) }
          : r;
    },
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
function fy(e, ...t) {
  let n = e.eventsIn(-1e-12, e.duration);
  for (let n of t)
    if (!(n.at >= 0 && n.at <= e.duration))
      throw RangeError(
        `withEvents: '${n.name}' at ${n.at} is outside 0..${e.duration}`,
      );
  if (!Number.isFinite(e.duration)) {
    let n = [...t].sort(qv);
    return new Jv({
      duration: e.duration,
      idle: e.idle,
      label: e.label,
      sample: (t) => e.sample(t),
      eventsIn: (t, r) =>
        [...e.eventsIn(t, r), ...n.filter((e) => e.at > t && e.at <= r)].sort(
          qv,
        ),
    });
  }
  return new Jv({
    duration: e.duration,
    idle: e.idle,
    label: e.label,
    sample: (t) => e.sample(t),
    events: [...n, ...t],
  });
}
function py(e, t) {
  return new Jv({
    duration: e.duration,
    idle: t,
    label: e.label,
    sample: (t) => e.sample(t),
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
function my(e, t = {}) {
  let n = t.freq ?? 3.5,
    r = t.zeta ?? 0.35,
    i = t.tail ?? 0.5,
    a = e.duration;
  if (!Number.isFinite(a))
    throw RangeError(
      `follow: an endless action cannot be followed (loop the followed action instead)`,
    );
  let o = a + i,
    s = 1 / 240,
    c = 2 * Math.PI * n,
    l = [],
    u = [],
    d = (t) => {
      let n = new Map();
      for (let [r, i] of Cv(e.sample(Math.min(t, a))))
        typeof i == `number` && Sv(r) !== `set` && n.set(r, i);
      return n;
    },
    f = (e) => {
      for (; l.length <= e;) {
        let e = l.length,
          t = d(e * s);
        if (e === 0) {
          (l.push(new Map(t)),
            u.push(new Map([...t.keys()].map((e) => [e, 0]))));
          continue;
        }
        let n = l[e - 1],
          i = u[e - 1],
          a = new Map(),
          o = new Map();
        for (let [e, l] of t) {
          let t = Sv(e),
            u = n.get(e) ?? (t === `mul` ? 1 : l),
            d = i.get(e) ?? 0,
            f = d + (c * c * (l - u) - 2 * r * c * d) * s,
            p = u + f * s;
          (a.set(e, p), o.set(e, f));
        }
        for (let [e, l] of n)
          if (!t.has(e)) {
            let t = +(Sv(e) === `mul`),
              n = i.get(e) ?? 0,
              u = n + (c * c * (t - l) - 2 * r * c * n) * s;
            (a.set(e, l + u * s), o.set(e, u));
          }
        (l.push(a), u.push(o));
      }
    };
  return new Jv({
    duration: o,
    idle: e.idle,
    label: `follow`,
    sample: (t) => {
      let n = t / s,
        r = Math.floor(n),
        i = n - r;
      f(r + 1);
      let o = l[r],
        c = l[r + 1],
        u = {},
        d = e.sample(Math.min(t, a));
      for (let [e, t] of Cv(d))
        (typeof t != `number` || Sv(e) === `set`) && wv(u, e, t);
      let p = new Set([...o.keys(), ...c.keys()]);
      for (let e of p)
        wv(u, e, ov(o.get(e) ?? c.get(e), c.get(e) ?? o.get(e), i));
      return (d.mix && (u.mix = d.mix), d.set && (u.set = d.set), u);
    },
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
var hy = (e, t) => {
  if (e === void 0) return t;
  if (typeof e == `function`) return e;
  let n = H[e];
  if (!n)
    throw Error(
      `unknown ease '${String(e)}' (try ${Object.keys(H).slice(0, 8).join(`, `)} ...)`,
    );
  return n;
};
function gy(e, t = {}) {
  let n = hy(t.ease, H.linear),
    r = t.fps ? 1 / t.fps : 1,
    i = [],
    a = 0;
  for (let [t, o] of Object.entries(e)) {
    if (Sv(t) === null)
      throw Error(
        `keys: '${t}' is not a pose channel (e.g. lift, sy, lean, look.x, arm.L.deg, props.<part>.rot, mood)`,
      );
    if (!o.length) continue;
    let e = o.map((e) =>
      Array.isArray(e)
        ? { t: e[0] * r, v: e[1], e: e[2] }
        : { t: e.t * r, v: e.v, e: e.ease },
    );
    for (let n = 1; n < e.length; n++)
      if (e[n].t < e[n - 1].t)
        throw Error(
          `keys: '${t}' key times must not decrease (${e[n - 1].t} then ${e[n].t})`,
        );
    let s = e.every((e) => typeof e.v == `number`);
    if (!s && e.some((e) => typeof e.v == `number`))
      throw Error(`keys: '${t}' mixes numbers with other values`);
    (i.push({
      path: t,
      t: e.map((e) => e.t),
      v: e.map((e) => e.v),
      e: e.map((e) => hy(e.e, n)),
      numeric: s,
    }),
      (a = Math.max(a, e[e.length - 1].t)));
  }
  let o = t.duration ?? a,
    s = t.volume === !0 ? 1 : t.volume || 0,
    c = (e, t) => {
      let n = e.t.length;
      if (t <= e.t[0]) return e.v[0];
      if (t >= e.t[n - 1]) return e.v[n - 1];
      let r = 0;
      for (; r < n - 1 && e.t[r + 1] <= t;) r++;
      if (!e.numeric) return e.v[r];
      let i = e.t[r],
        a = e.t[r + 1];
      return a <= i
        ? e.v[r + 1]
        : ov(e.v[r], e.v[r + 1], e.e[r + 1]((t - i) / (a - i)));
    };
  return new Jv({
    duration: o,
    events: t.events,
    idle: t.idle,
    label: t.label ?? `keys`,
    sample: (e) => {
      let t = {};
      for (let n of i) wv(t, n.path, c(n, e));
      return (
        s &&
          (t.sy !== void 0 && t.sx === void 0
            ? (t.sx = t.sy ** -s)
            : t.sx !== void 0 && t.sy === void 0 && (t.sy = t.sx ** (-1 / s))),
        t
      );
    },
  });
}
function vy(e, t, n, r, i = `smooth`) {
  return gy(
    {
      [e]: [
        [0, t],
        [r, n, i],
      ],
    },
    { duration: r, label: `tween:${e}` },
  );
}
var by = class {
  action;
  layer;
  state = `waiting`;
  time = 0;
  paused = !1;
  fastForwarded = !1;
  speed;
  weight;
  hold;
  onEnd;
  done;
  tl;
  resolveDone;
  delayLeft;
  fadeIn;
  age = 0;
  evT = -1e-12;
  slot;
  constructor(e, t, n, r, i) {
    ((this.tl = e),
      (this.action = t),
      (this.slot = n),
      (this.layer = r.layer ?? null),
      (this.onEnd = r.onEnd),
      (this.speed = r.speed ?? 1),
      (this.weight = r.weight ?? 1),
      (this.hold = !!r.hold),
      (this.delayLeft = Math.max(0, r.delay ?? 0)),
      (this.fadeIn = i),
      (this.done = new Promise((e) => {
        this.resolveDone = e;
      })));
  }
  get finished() {
    return this.state === `finished` || this.state === `cancelled`;
  }
  get progress() {
    let e = this.action.duration;
    return Number.isFinite(e) && e > 0 ? Math.min(1, this.time / e) : 0;
  }
  finish() {
    this.tl.finishHandle(this);
  }
  cancel(e = 0.1) {
    this.tl.cancelHandle(this, e);
  }
  pause() {
    this.paused = !0;
  }
  resume() {
    this.paused = !1;
  }
};
var xy = class {
  timeScale = 1;
  paused = !1;
  quantizeFps = 0;
  sink;
  slots = new Map();
  anon = 0;
  constructor(e = null) {
    this.sink = e;
  }
  play(e, t = {}) {
    let n = t.layer ?? `#anon${this.anon++}`,
      r = this.slots.get(n);
    r ||
      ((r = {
        key: n,
        anon: t.layer === void 0,
        cur: null,
        queue: [],
        held: null,
        ghosts: [],
      }),
      this.slots.set(n, r));
    let i = !!(r.cur || r.held),
      a = i ? (t.fade ?? 0.12) : 0;
    i && this.retire(r, a);
    let o = new by(this, e, n, t, a);
    return (
      this.begin(r, o, 0),
      t.signal &&
        (t.signal.aborted
          ? this.finishHandle(o)
          : t.signal.addEventListener(`abort`, () => this.finishHandle(o), {
              once: !0,
            })),
      o
    );
  }
  queue(e, t = {}) {
    let n = t.layer ?? `main`,
      r = this.slots.get(n);
    if (!r || !r.cur) return this.play(e, { ...t, layer: n });
    let i = new by(this, e, n, { ...t, layer: n }, 0);
    return (
      r.queue.push(i),
      t.signal &&
        (t.signal.aborted
          ? this.finishHandle(i)
          : t.signal.addEventListener(`abort`, () => this.finishHandle(i), {
              once: !0,
            })),
      i
    );
  }
  begin(e, t, n) {
    ((e.cur = t),
      (t.state = t.delayLeft > 0 ? `waiting` : `playing`),
      n > 0 && this.advance(e, t, n));
  }
  retire(e, t) {
    let n = e.cur;
    (n &&
      (t > 0 &&
        n.state !== `waiting` &&
        e.ghosts.push({
          delta: n.action.sample(this.qt(n.time)),
          weight: n.weight * this.fadeInW(n),
          age: 0,
          fade: t,
        }),
      (n.state = `cancelled`),
      n.resolveDone(),
      n.onEnd?.(n),
      (e.cur = null)),
      (e.held &&=
        (t > 0 &&
          e.ghosts.push({
            delta: e.held.delta,
            weight: e.held.weight,
            age: 0,
            fade: t,
          }),
        null)));
    for (let t of e.queue)
      ((t.state = `cancelled`), t.resolveDone(), t.onEnd?.(t));
    e.queue.length = 0;
  }
  qt(e) {
    return this.quantizeFps > 0
      ? Math.floor(e * this.quantizeFps + 1e-9) / this.quantizeFps
      : e;
  }
  fadeInW(e) {
    return e.fadeIn > 0 && e.age < e.fadeIn ? sv(e.age / e.fadeIn) : 1;
  }
  fire(e, t, n) {
    this.sink?.({ ...t, handle: e, skipped: n });
  }
  update(e) {
    if (this.paused || !(e > 0)) return;
    let t = Math.min(e, 1) * this.timeScale;
    for (let e of [...this.slots.values()]) {
      for (let n of e.ghosts) n.age += t;
      e.ghosts = e.ghosts.filter((e) => e.age < e.fade);
      let n = e.cur;
      if (n && !n.paused) {
        n.age += t;
        let r = t;
        if (n.delayLeft > 0) {
          if (r <= n.delayLeft) {
            n.delayLeft -= r;
            continue;
          }
          ((r -= n.delayLeft), (n.delayLeft = 0), (n.state = `playing`));
        }
        this.advance(e, n, r * n.speed);
      }
      e.anon &&
        !e.cur &&
        !e.held &&
        !e.queue.length &&
        !e.ghosts.length &&
        this.slots.delete(e.key);
    }
  }
  advance(e, t, n) {
    let r = t,
      i = n,
      a = 0;
    for (; r && a++ < 64;) {
      let t = r.action.duration,
        n = r.time,
        a = Math.min(n + i, t);
      t - a < 1e-9 && (a = t);
      let o = r.action.eventsIn(r.evT, a);
      r.time = a;
      for (let e of o) this.fire(r, e, !1);
      if (((r.evT = a), a < t)) return;
      let s = Math.max(0, i - (t - n)) / r.speed;
      this.complete(e, r);
      let c = e.cur;
      if (!c) return;
      let l = s;
      if (c.delayLeft > 0) {
        if (l <= c.delayLeft) {
          c.delayLeft -= l;
          return;
        }
        ((l -= c.delayLeft), (c.delayLeft = 0), (c.state = `playing`));
      }
      ((r = c), (i = l * c.speed));
    }
  }
  complete(e, t) {
    ((t.state = `finished`),
      (t.time = t.action.duration),
      (e.cur = null),
      t.hold &&
        (e.held = {
          delta: t.action.sample(t.action.duration),
          idle: t.action.idle,
          weight: t.weight,
        }),
      t.resolveDone(),
      t.onEnd?.(t));
    let n = e.queue.shift();
    n &&
      ((e.cur = n),
      (n.age = 0),
      (n.state = n.delayLeft > 0 ? `waiting` : `playing`));
  }
  finishHandle(e) {
    if (e.finished) return;
    e.fastForwarded = !0;
    let t = this.slots.get(e.slot);
    if (!t) {
      ((e.state = `finished`), e.resolveDone(), e.onEnd?.(e));
      return;
    }
    let n = 0;
    for (; !e.finished && n++ < 1e3;) {
      let e = t.cur;
      if (!e) {
        let e = t.queue.shift();
        if (!e) break;
        t.cur = e;
        continue;
      }
      if (!Number.isFinite(e.action.duration)) {
        this.cancelHandle(e, 0);
        continue;
      }
      e.fastForwarded = !0;
      for (let t of e.action.eventsIn(e.evT, e.action.duration))
        Hv(t) && this.fire(e, t, !0);
      ((e.evT = e.action.duration), (e.delayLeft = 0), this.complete(t, e));
    }
    (e.finished || ((e.state = `finished`), e.resolveDone(), e.onEnd?.(e)),
      t.anon &&
        !t.cur &&
        !t.held &&
        !t.queue.length &&
        !t.ghosts.length &&
        this.slots.delete(t.key));
  }
  cancelHandle(e, t = 0.1) {
    if (e.finished) return;
    let n = this.slots.get(e.slot);
    if (n) {
      if (n.cur === e)
        (t > 0 &&
          e.state !== `waiting` &&
          n.ghosts.push({
            delta: e.action.sample(this.qt(e.time)),
            weight: e.weight * this.fadeInW(e),
            age: 0,
            fade: t,
          }),
          (n.cur = n.queue.shift() ?? null),
          n.cur &&
            ((n.cur.state = n.cur.delayLeft > 0 ? `waiting` : `playing`),
            (n.cur.age = 0)));
      else {
        let t = n.queue.indexOf(e);
        t >= 0 && n.queue.splice(t, 1);
      }
    }
    ((e.state = `cancelled`),
      e.resolveDone(),
      e.onEnd?.(e),
      n?.anon &&
        !n.cur &&
        !n.held &&
        !n.queue.length &&
        !n.ghosts.length &&
        this.slots.delete(n.key));
  }
  finishAll() {
    for (let e of [...this.slots.values()]) {
      let t = 0;
      for (; (e.cur || e.queue.length) && t++ < 1e3;) {
        let t = e.cur ?? e.queue[0];
        this.finishHandle(t);
      }
      ((e.ghosts.length = 0), e.anon && !e.held && this.slots.delete(e.key));
    }
  }
  cancelAll(e = 0.1) {
    for (let t of [...this.slots.values()]) {
      for (let n of [t.cur, ...t.queue]) n && this.cancelHandle(n, e);
      t.held &&=
        (e > 0 &&
          t.ghosts.push({
            delta: t.held.delta,
            weight: t.held.weight,
            age: 0,
            fade: e,
          }),
        null);
    }
  }
  clear(e, t = 0.15) {
    let n = this.slots.get(e);
    n && this.retire(n, t);
  }
  sample() {
    let e = {};
    for (let t of this.slots.values()) {
      t.held && (e = jv(e, kv(t.held.delta, t.held.weight)));
      for (let n of t.ghosts)
        e = jv(e, kv(n.delta, n.weight * (1 - sv(n.age / n.fade))));
      let n = t.cur;
      if (n && n.state !== `waiting`) {
        let t = n.action.sample(this.qt(n.time));
        Fv(t) || (e = jv(e, kv(t, n.weight * this.fadeInW(n))));
      }
    }
    return e;
  }
  idleMask() {
    let e;
    for (let t of this.slots.values())
      (t.held?.idle !== void 0 && (e = Gv(e, t.held.idle)),
        t.cur &&
          t.cur.state !== `waiting` &&
          t.cur.action.idle !== void 0 &&
          (e = Gv(e, t.cur.action.idle)));
    return Wv(e);
  }
  get busy() {
    for (let e of this.slots.values()) if (e.cur || e.queue.length) return !0;
    return !1;
  }
  get playing() {
    let e = [];
    for (let t of this.slots.values()) t.cur && e.push(t.cur);
    return e;
  }
  layerActive(e) {
    let t = this.slots.get(e);
    return !!t && !!(t.cur || t.queue.length || t.held);
  }
};
var Sy = Object.freeze({
  enabled: !0,
  breath: { amp: 0.012, period: 3.7 },
  blink: { gap: 3.3, jitter: 0.15, double: 0.1, step: 0.06 },
  look: {
    maxX: 1,
    maxY: 0.85,
    maxLen: 1.15,
    smooth: 0.11,
    reach: 3.2,
    wanderGap: [1.4, 3.8],
    wander: 0.4,
  },
  ears: { gap: [2.4, 6.5], angle: [0.1, 0.22] },
});
function Cy(e = {}) {
  let t = Sy,
    n = (t, n) => {
      let r = e[t];
      return r === void 0 ? n : r === !1 ? !1 : n === !1 ? r : { ...n, ...r };
    };
  return {
    enabled: e.enabled ?? t.enabled,
    breath: n(`breath`, t.breath),
    blink: n(`blink`, t.blink),
    look: n(`look`, t.look),
    ears: n(`ears`, t.ears),
  };
}
function wy(e, t) {
  if (e < 0) return 0;
  let n = Math.floor(e / t);
  return n === 0 ? 0.5 : n === 1 ? 1 : n === 2 ? 0.5 : 0;
}
var Ty = class {
  cfg;
  gazeTarget = null;
  rb;
  rl;
  re;
  seed;
  earNames = [];
  breathPhase = 0;
  blinkStart = -1e9;
  blinkNext = 0;
  wanderNext = 0;
  wander = [0, 0];
  earNext = 0;
  gx = 0;
  gy = 0;
  gvx = 0;
  gvy = 0;
  lastT = 0;
  earPending = [];
  constructor(e, t, n = Cy()) {
    ((this.cfg = n), (this.seed = t), this.setRig(e), this.reset());
  }
  setRig(e) {
    let t = Object.keys(e.parts)
        .filter((t) => e.parts[t].spring && /^(ear|ant)/i.test(t))
        .sort(),
      n = new Map();
    for (let e of t) {
      let t = e.replace(/[LR]$/, ``);
      (n.get(t) ?? n.set(t, []).get(t)).push(e);
    }
    ((this.earNames = [...n.values()]),
      (this.springK = new Map(t.map((t) => [t, e.parts[t].spring.k]))),
      (this.range = new Map(
        t.map((t) => [t, e.parts[t].rotRange ?? [-0.5, 0.5]]),
      )));
  }
  springK = new Map();
  range = new Map();
  reset() {
    ((this.rb = new yu(this.seed ^ 6941)),
      (this.rl = new yu(this.seed ^ 11310)),
      (this.re = new yu(this.seed ^ 15679)),
      (this.breathPhase = new yu(this.seed ^ 19019).next() * Math.PI * 2));
    let e = this.cfg.blink;
    ((this.blinkStart = -1e9),
      (this.blinkNext = e ? e.gap * (0.25 + 0.9 * this.rb.next()) : 1 / 0));
    let t = this.cfg.look;
    ((this.wanderNext = t ? 0.3 + this.rl.next() * t.wanderGap[1] : 1 / 0),
      (this.wander = [0, 0]));
    let n = this.cfg.ears;
    ((this.earNext = n
      ? n.gap[0] + this.re.next() * (n.gap[1] - n.gap[0])
      : 1 / 0),
      (this.earPending = []),
      (this.gx = this.gy = this.gvx = this.gvy = 0),
      (this.lastT = 0));
  }
  update(e, t, n) {
    let r = this.cfg;
    if (r.blink) {
      let t = 0;
      for (; e >= this.blinkNext && t++ < 512;) {
        this.blinkStart = this.blinkNext;
        let e = r.blink.step * 3,
          t = this.rb.next() < r.blink.double,
          n = r.blink.gap * (1 + r.blink.jitter * (2 * this.rb.next() - 1));
        this.blinkNext = this.blinkStart + e + (t ? 0.09 : n);
      }
    }
    if (r.look) {
      let n = 0;
      for (; e >= this.wanderNext && n++ < 512;) {
        let e = r.look.wander,
          t = this.rl.next() < 0.35;
        ((this.wander = t
          ? [0, 0]
          : [(this.rl.next() * 2 - 1) * e, (this.rl.next() * 2 - 1) * e * 0.5]),
          (this.wanderNext +=
            r.look.wanderGap[0] +
            this.rl.next() * (r.look.wanderGap[1] - r.look.wanderGap[0])));
      }
      let i = this.gazeTarget ?? this.wander,
        [a, o] = this.limitGaze(i[0], i[1]);
      if (t > 0) {
        let e = Math.max(1, Math.ceil(t / (1 / 60))),
          n = t / e;
        for (let t = 0; t < e; t++)
          (([this.gx, this.gvx] = _v(this.gx, a, this.gvx, r.look.smooth, n)),
            ([this.gy, this.gvy] = _v(this.gy, o, this.gvy, r.look.smooth, n)));
      }
    }
    if (r.ears && n && this.earNames.length) {
      let t = 0;
      for (; e >= this.earNext && t++ < 64;) {
        let e =
            this.earNames[
              Math.min(
                this.earNames.length - 1,
                Math.floor(this.re.next() * this.earNames.length),
              )
            ],
          t = e.length > 1 && this.re.next() < 0.45,
          n = this.re.next() < 0.5 ? -1 : 1,
          i = t
            ? e
            : [
                e[
                  Math.min(e.length - 1, Math.floor(this.re.next() * e.length))
                ],
              ],
          a =
            r.ears.angle[0] +
            this.re.next() * (r.ears.angle[1] - r.ears.angle[0]);
        (i.forEach((e, t) =>
          this.earPending.push({
            at: this.earNext + t * 0.05,
            name: e,
            w: n * a,
          }),
        ),
          (this.earNext +=
            r.ears.gap[0] + this.re.next() * (r.ears.gap[1] - r.ears.gap[0])));
      }
      if (this.earPending.length) {
        let t = this.earPending.filter((t) => t.at <= e);
        this.earPending = this.earPending.filter((t) => t.at > e);
        for (let e of t) {
          let t = this.springK.get(e.name) ?? 60,
            r = this.range.get(e.name) ?? [-0.5, 0.5],
            i = 0.6 * Math.min(-r[0], r[1]);
          n.kick(e.name, Math.max(-i, Math.min(i, e.w)) * Math.sqrt(t));
        }
      }
    }
    this.lastT = e;
  }
  limitGaze(e, t) {
    let n = this.cfg.look;
    if (!n) return [0, 0];
    ((e = Math.max(-n.maxX, Math.min(n.maxX, e))),
      (t = Math.max(-n.maxY, Math.min(n.maxY, t))));
    let r = Math.hypot(e, t);
    return (r > n.maxLen && ((e *= n.maxLen / r), (t *= n.maxLen / r)), [e, t]);
  }
  gazeFor(e, t) {
    let n = this.cfg.look;
    return n
      ? this.limitGaze(Math.tanh(e / n.reach), Math.tanh(t / n.reach))
      : [0, 0];
  }
  snap() {
    if (!this.cfg.look) return;
    let e = this.gazeTarget ?? this.wander,
      [t, n] = this.limitGaze(e[0], e[1]);
    ((this.gx = t), (this.gy = n), (this.gvx = 0), (this.gvy = 0));
  }
  delta(e, t) {
    let n = this.cfg,
      r = {};
    if (!n.enabled) return r;
    if (n.breath && t.breath) {
      let t = Math.sin((2 * Math.PI * e) / n.breath.period + this.breathPhase),
        i = 1 + n.breath.amp * t;
      ((r.sy = i), (r.sx = 1 / i));
    }
    if (n.blink && t.blink) {
      let t = wy(e - this.blinkStart, n.blink.step);
      t > 0 && (r.blink = t);
    }
    return (
      n.look &&
        t.look &&
        (this.gx !== 0 || this.gy !== 0) &&
        (r.look = { x: this.gx, y: this.gy }),
      r
    );
  }
  get gaze() {
    return [this.gx, this.gy];
  }
  get blinkTimes() {
    return { last: this.blinkStart, next: this.blinkNext };
  }
};
var Ey = (e) => (e * Math.PI) / 180;
function Dy(e, t, n = 56) {
  return [t[0] - e[0], (t[1] - e[1]) * Math.sin(Ey(n))];
}
function Oy(e, t) {
  let n = !1;
  for (let r = 0, i = e.length - 1; r < e.length; i = r++) {
    let a = e[r],
      o = e[i];
    a[1] > t[1] != o[1] > t[1] &&
      t[0] < ((o[0] - a[0]) * (t[1] - a[1])) / (o[1] - a[1]) + a[0] &&
      (n = !n);
  }
  return n;
}
function ky(e, t) {
  let n = 1 / 0;
  for (let r = 0, i = e.length - 1; r < e.length; i = r++) {
    let a = e[i],
      o = e[r],
      s = o[0] - a[0],
      c = o[1] - a[1],
      l = s * s + c * c,
      u =
        l > 0
          ? Math.max(
              0,
              Math.min(1, ((t[0] - a[0]) * s + (t[1] - a[1]) * c) / l),
            )
          : 0;
    n = Math.min(n, Math.hypot(t[0] - (a[0] + u * s), t[1] - (a[1] + u * c)));
  }
  return n;
}
function Ay(e, t, n, r) {
  let i = e.frames[t.frame];
  if (!i) return !1;
  let [a, o, s, c] = t.m,
    l = a * c - o * s;
  if (Math.abs(l) < 1e-9) return !1;
  let u = n[0] - t.t[0],
    d = n[1] - t.t[1],
    f = (c * u - o * d) / l + i.px,
    p = (-s * u + a * d) / l + i.py,
    m = r / (Math.sqrt(Math.abs(l)) || 1);
  return f >= -m && f <= i.w + m && p >= -m && p <= i.h + m;
}
function jy(e, t, n, r, i = {}) {
  let a = Dy(n, r, i.elevationDeg ?? 56),
    o = i.pad ?? 0.04,
    s = i.mode ?? `parts`,
    c = Y_(e, t),
    l = c.bp.hull;
  if (l?.length) {
    let e = l.map((e) => c.B(e));
    if (Oy(e, a) || ky(e, a) <= o) return !0;
    if (s === `hull`) return !1;
  } else if (s === `hull`)
    return (
      Math.abs(a[0]) <= e.world.width / 2 + o &&
      a[1] >= -o &&
      a[1] <= e.world.height + o
    );
  let u = i.instances ?? X_(c),
    d = !!l?.length;
  for (let t of u)
    if (
      !(
        t.batch === `flat` ||
        t.role === `shadow` ||
        t.role === `fx` ||
        t.alpha < 0.05
      ) &&
      !(d && t.role !== `arm` && t.role !== `foot` && t.role !== `prop`) &&
      Ay(e, t, a, o)
    )
      return !0;
  return !1;
}
function My(e, t = {}) {
  let n = e.bodyPoses.idle?.hull,
    r = e.world.width / 2;
  if (n?.length) {
    r = 0;
    for (let e of n) r = Math.max(r, Math.abs(e[0]));
  }
  return {
    halfWidth: +(r + (t.padWidth ?? 0)).toFixed(4),
    height: +(e.world.height + (t.padHeight ?? 0)).toFixed(4),
  };
}
var Py = 1e3;
var Fy = { breath: !1, blink: !1, look: !1, ears: !1 };
var Iy = class {
  asset;
  rig;
  x;
  y;
  bias;
  pose;
  seed;
  timeline;
  idle;
  springs;
  bodySwitch;
  idleEnabled = !0;
  clock = 0;
  _out;
  get out() {
    return (this.sync(), this._out);
  }
  listeners = new Set();
  lookPoint = null;
  prevSpring = null;
  resyncNext = !0;
  stale = !1;
  cache = null;
  boilOffset;
  accMax;
  opts;
  constructor(e, t = {}) {
    ((this.asset = e),
      (this.rig = e.rig),
      (this.opts = t),
      (this.bodySwitch = new H_(t.bodySwapFps ?? 8)),
      (this.seed = t.seed ?? Py++),
      (this.x = t.x ?? 0),
      (this.y = t.y ?? 0),
      (this.bias = t.bias ?? 0),
      (this.accMax = t.accMax ?? 60),
      (this.pose = { bodyPose: `auto`, ...(t.pose ?? {}) }),
      (this.timeline = new xy((e) => this.dispatch(e))),
      (this.timeline.quantizeFps = t.poseFps ?? 0),
      (this.idle = new Ty(this.rig, this.seed, Cy(t.idle))),
      (this.springs = new iv(this.rig, { accMax: this.accMax })),
      (this.boilOffset = (((this.seed * 2654435761) >>> 0) / 4294967296) * 0.5),
      (this._out = { ...this.pose }),
      this.refresh());
  }
  update(e) {
    ((e = Number.isFinite(e) ? Math.max(0, Math.min(e, 0.5)) : 0),
      (this.clock += e),
      this.timeline.update(e),
      this.build(e));
  }
  refresh() {
    this.build(0);
  }
  build(e) {
    let t = this.rig,
      n =
        this.idleEnabled && this.idle.cfg.enabled
          ? this.timeline.idleMask()
          : Fy,
      [r, i] = this.groundNow();
    (this.lookPoint
      ? (this.idle.gazeTarget = this.idle.gazeFor(
          this.lookPoint[0] - r,
          this.lookPoint[1] - i,
        ))
      : (this.idle.gazeTarget = null),
      this.idle.update(this.clock, e, n.ears ? this.springs : null));
    let a = { ...this.pose, t: this.clock + this.boilOffset };
    if (
      ((a = zv(a, this.idle.delta(this.clock, n), t)),
      (a = zv(a, this.timeline.sample(), t)),
      Bv(a),
      this.springs.names.length)
    ) {
      let t = { x: this.x + (a.x ?? 0), lean: a.lean ?? 0 };
      (this.resyncNext || !this.prevSpring) &&
        (this.springs.resync(t), (this.prevSpring = t), (this.resyncNext = !1));
      let n = this.springs.advance(this.prevSpring, t, e);
      ((this.prevSpring = t), (a = av(a, n)));
    }
    (a.bodyPose === `auto` && (a.bodyPose = this.bodySwitch.update(t, a)),
      (this._out = a),
      (this.cache = null),
      (this.stale = !1));
  }
  sync() {
    this.stale && this.build(0);
  }
  groundNow() {
    return [this.x + (this._out?.x ?? 0), this.y + (this._out?.y ?? 0)];
  }
  ground() {
    return (this.sync(), this.groundNow());
  }
  instances() {
    return (this.sync(), (this.cache ??= X_(Y_(this.rig, this._out))));
  }
  bounds() {
    return Z_(
      this.rig,
      this.instances().filter((e) => e.batch !== `flat`),
    );
  }
  emit(e, t, n, r, i = {}) {
    let [a, o] = this.ground(),
      s = t ?? a,
      c = n ?? o,
      l = r ?? this.bias,
      u = this.instances(),
      d = i.batch === `world` ? e.world : e.piece;
    if (!d)
      throw Error(
        `Puppet ${this.rig.id}: emit({batch:'world'}) needs targets.world`,
      );
    let f = i.alpha ?? 1,
      p = i.gz ?? 0,
      m = i.tint ?? Ly,
      h = i.shadow !== !1,
      g = null,
      _ = null,
      v = 0;
    for (let t of u) {
      let n = t.batch === `flat`;
      if (n && !h) continue;
      let r = t.alpha * f,
        a;
      a = n
        ? (_ ??= this.asset.frames(e.flat.pages, `flat`))
        : (g ??= this.asset.frames(d.pages, `billboard`));
      let o = a.get(t.frame);
      if (!o)
        throw Error(
          `Puppet ${this.rig.id}: frame '${t.frame}' of part '${t.part}' has no FrameDef (composed a frame the rig does not list?)`,
        );
      let u = t.progress;
      if (
        (u < 1 && !o.hasTime && ((r *= u * u * (3 - 2 * u)), (u = 1)),
        r <= 0.003)
      )
        continue;
      let y = t.m,
        b = t.t;
      (n
        ? e.flat.batch.add(
            o,
            s,
            c,
            p,
            y[0],
            y[1],
            y[2],
            y[3],
            b[0],
            b[1],
            cl(sl.shadow, c, t.layer + (i.flatBias ?? 0)),
            r,
            u,
            m[0],
            m[1],
            m[2],
          )
        : d.batch.add(
            o,
            s,
            c,
            p,
            y[0],
            y[1],
            y[2],
            y[3],
            b[0],
            b[1],
            ll(c, l, t.layer),
            r,
            u,
            m[0],
            m[1],
            m[2],
          ),
        v++);
    }
    return v;
  }
  play(e, t = {}) {
    return ((this.stale = !0), this.timeline.play(e, this.watch(t)));
  }
  queue(e, t = {}) {
    return ((this.stale = !0), this.timeline.queue(e, this.watch(t)));
  }
  watch(e) {
    return {
      ...e,
      onEnd: (t) => {
        ((this.stale = !0),
          t.fastForwarded && (this.resyncNext = !0),
          e.onEnd?.(t));
      },
    };
  }
  finishAll() {
    (this.timeline.finishAll(),
      this.springs.settle(),
      (this.resyncNext = !0),
      this.idle.snap(),
      this.build(0));
  }
  cancelAll(e = 0.1) {
    ((this.stale = !0), this.timeline.cancelAll(e));
  }
  clear(e, t = 0.15) {
    ((this.stale = !0), this.timeline.clear(e, t));
  }
  get busy() {
    return this.timeline.busy;
  }
  relocate(e, t) {
    let n = [this.x - e, this.y - t];
    return (
      (this.x = e),
      (this.y = t),
      (this.resyncNext = !0),
      (this.stale = !0),
      n
    );
  }
  drawOn(e, t = H.linear, n = {}) {
    ((this.pose = { ...this.pose, draw: 0 }), (this.stale = !0));
    let r = vy(`draw`, 0, 1, e, t).withIdle(!1);
    return this.play(r, {
      layer: `draw`,
      ...n,
      onEnd: (e) => {
        (e.state === `finished` && (this.pose = { ...this.pose, draw: 1 }),
          n.onEnd?.(e));
      },
    });
  }
  hide() {
    ((this.pose = { ...this.pose, draw: 0 }), (this.stale = !0));
  }
  lookAt(e, t) {
    ((this.lookPoint = e === null ? null : [e, t ?? this.y]),
      (this.stale = !0));
  }
  kick(e, t) {
    this.springs.kick(e, t);
  }
  jolt(e = 1) {
    let t = 0;
    for (let n of this.springs.names) {
      let r = this.rig.parts[n].spring,
        i = this.rig.parts[n].rotRange ?? [-0.5, 0.5],
        a = r.from === `none` ? 1 : Math.min(1.5, Math.max(0.3, r.gain)),
        o = 0.6 * Math.min(-i[0], i[1]),
        s = Math.min(o, 0.1 * e * a),
        c = Math.cos(t * 1.7 + (r.wave ?? 0) * 2.3) >= 0 ? 1 : -1;
      (this.springs.kick(n, c * s * Math.sqrt(r.k)), t++);
    }
  }
  onEvent(e) {
    return (this.listeners.add(e), () => this.listeners.delete(e));
  }
  dispatch(e) {
    let t = this.opts.impactJolt ?? 0.6;
    if (e.kind === `impact` && t > 0) {
      let n = e.data?.strength;
      this.jolt((typeof n == `number` ? n : 1) * t);
    }
    if (!this.listeners.size) return;
    let [n, r] = this.groundNow(),
      i = { ...e, puppet: this, x: n, y: r };
    for (let e of [...this.listeners]) e(i);
  }
  hit(e, t, n = {}) {
    let r = this.instances();
    return jy(this.rig, this._out, this.groundNow(), [e, t], {
      instances: r,
      ...n,
    });
  }
  pickBox() {
    return My(this.rig);
  }
  reset() {
    ((this.clock = 0),
      (this.timeline = new xy((e) => this.dispatch(e))),
      (this.timeline.quantizeFps = this.opts.poseFps ?? 0),
      (this.idle = new Ty(this.rig, this.seed, Cy(this.opts.idle))),
      (this.springs = new iv(this.rig, { accMax: this.accMax })),
      this.bodySwitch.reset(),
      (this.prevSpring = null),
      (this.resyncNext = !0),
      this.build(0));
  }
  seek(e, t = 1 / 60, n) {
    (this.reset(), n?.(this));
    let r = 0;
    for (; r < e - 1e-9;) {
      let n = Math.min(t, e - r);
      (this.update(n), (r += n));
    }
  }
};
var Ly = [1, 1, 1];
var QO = Math.PI * 2;
var $O = Math.sin((56 * Math.PI) / 180);
function ek(e, t = 0) {
  let n =
    Math.imul(
      Math.floor(((Number.isFinite(e) ? e : 0) * 1e6) % 4294967296) ^
        2654435769,
      2246822507,
    ) ^ Math.imul(t + 1, 3266489909);
  return (
    (n = Math.imul(n ^ (n >>> 16), 2146121005)),
    (n = Math.imul(n ^ (n >>> 15), 2221713035)),
    (n ^= n >>> 16),
    (n >>> 0) / 4294967296
  );
}
var tk = (e, t, n = 0.1) => 1 + n * (2 * ek(e, t) - 1);
var nk = (e, t, n) => Math.min(n - 1, Math.floor(ek(e, t) * n));
var rk = (e, t) => (ek(e, t) < 0.5 ? -1 : 1);
var ik = new Map();
function ak(e, t) {
  let n = ik.get(e);
  ik.set(e, n === void 0 || n === t ? t : `both`);
}
function ok(e, t) {
  (ak(e, t), Number.isFinite(e) && e >= 1 && ak((e % 1e3) / 1e3, t));
}
function sk(e) {
  if (e.side === `w` || e.side === `b`) return e.side;
  let t = ik.get(e.seed);
  return t === `w` || t === `b` ? t : `w`;
}
var ck = (e) => (e === void 0 ? H.linear : typeof e == `function` ? e : H[e]);
function lk(e) {
  let t = e.length,
    n = e.map((e) => e[0]),
    r = e.map((e) => e[1]),
    i = e.map((e) => ck(e[2]));
  for (let e = 1; e < t; e++)
    if (n[e] < n[e - 1] - 1e-12)
      throw Error(`pw: key times must not decrease (${n[e - 1]} then ${n[e]})`);
  return (e) => {
    if (t === 0) return 0;
    if (e <= n[0]) return r[0];
    if (e >= n[t - 1]) return r[t - 1];
    let a = 0;
    for (; a < t - 1 && n[a + 1] <= e;) a++;
    let o = n[a],
      s = n[a + 1];
    return s <= o ? r[a + 1] : ov(r[a], r[a + 1], i[a + 1]((e - o) / (s - o)));
  };
}
function uk(e) {
  let t = -1 / 0;
  return lk(e.map((e) => ((t = Math.max(t, e[0])), [t, e[1], e[2]])));
}
var G = (e, t, n) =>
  e <= t || e >= n ? 0 : Math.sin((Math.PI * (e - t)) / (n - t)) ** 2;
var dk = (e, t, n, r, i, a = 0) =>
  e <= t ? 0 : n * Math.exp(-(e - t) / i) * Math.sin(QO * r * (e - t) + a);
var fk = (e, t, n, r = `smooth`) =>
  n <= t ? +(e >= n) : ck(r)(B((e - t) / (n - t), 0, 1));
function pk(e, t, n, r) {
  let i = 1 / 240,
    a = QO * n,
    o = Math.max(2, Math.ceil(t / i) + 2),
    s = new Float64Array(o + 1),
    c = 0,
    l = e(0),
    u = 0;
  s[0] = Number.isFinite(l) ? l : 0;
  let d = (t) => {
    for (; c < t;) {
      c++;
      let t = e(c * i);
      Number.isFinite(t) || (t = l);
      let n = a * a * (t - l) - 2 * r * a * u;
      ((u += n * i), (l += u * i), (s[c] = l));
    }
  };
  return (e) => {
    let n = B(e, 0, t) / i,
      r = Math.min(o - 1, Math.floor(n));
    return (d(r + 1), ov(s[r], s[r + 1], n - r));
  };
}
function mk(e, t) {
  let n = [],
    r = [],
    i = 0;
  for (let t of e) ((i += t.crouch), n.push(i), (i += t.air), r.push(i));
  return { take: n, land: r, end: i + t, hops: [...e], settle: t };
}
function hk(e, t) {
  for (let n = 0; n < e.take.length; n++)
    if (t >= e.take[n] && t < e.land[n])
      return [n, (t - e.take[n]) / e.hops[n].air];
  return null;
}
function gk(e, t) {
  let n = hk(e, t);
  return n ? e.hops[n[0]].height * 4 * n[1] * (1 - n[1]) : 0;
}
function _k(e, t) {
  let n = e.take.length;
  if (t <= e.take[0]) return 0;
  if (t >= e.land[n - 1]) return 1;
  for (let r = 0; r < n; r++) {
    if (t < e.take[r]) return r / n;
    if (t < e.land[r]) {
      let i = (t - e.take[r]) / e.hops[r].air;
      return (r + 0.7 * i + 0.3 * H.inOutSine(i)) / n;
    }
  }
  return 1;
}
function vk(...e) {
  let t = {},
    n = (e, t) => {
      for (let [r, i] of Object.entries(t))
        i !== void 0 &&
          (typeof i == `object` &&
          i &&
          !Array.isArray(i) &&
          typeof e[r] == `object` &&
          e[r] !== null &&
          !Array.isArray(e[r])
            ? n(e[r], i)
            : typeof i == `object` && i && !Array.isArray(i)
              ? ((e[r] = {}), n(e[r], i))
              : (e[r] = i));
    };
  for (let r of e) r && n(t, r);
  return t;
}
function yk(e, t, n = 0.14) {
  return (r) => {
    let i = 1 - fk(r, t - n, t, `smooth`),
      a = e(r);
    return i >= 1 ? a : kv(a, i);
  };
}
function bk(e, t) {
  return e
    .map((e) => ({ ...e, at: B(e.at, 0, t) }))
    .sort((e, t) => e.at - t.at);
}
function xk(e) {
  let { x0: t, y0: n, g: r, floor: i, e: a } = e,
    o = e.maxBounces ?? 3,
    s = e.slide ?? 0.35,
    c = [],
    l = 0,
    u = t,
    d = Math.max(n, i),
    f = e.vx,
    p = e.vy;
  for (let e = 0; e <= o; e++) {
    let e = p * p + 2 * r * (d - i),
      t = e <= 0 ? 0 : (p + Math.sqrt(e)) / r;
    if (
      (c.push({ t0: l, x: u, y: d, vx: f, vy: p, dur: t }),
      (u += f * t),
      (l += t),
      (d = i),
      (p = -(p - r * t) * a),
      (f *= 0.8),
      p < 0.25)
    )
      break;
  }
  let m = c[c.length - 1],
    h = m.t0 + m.dur;
  return (e) => {
    if (e >= h) {
      let t = Math.min(e - h, s);
      return {
        x: m.x + m.vx * m.dur + (m.vx / 6) * (1 - Math.exp(-6 * t)),
        y: i,
        vx: 0,
        vy: 0,
        bounces: c.length - 1,
      };
    }
    let t = 0;
    for (; t < c.length - 1 && e >= c[t + 1].t0;) t++;
    let n = c[t],
      a = e - n.t0;
    return {
      x: n.x + n.vx * a,
      y: n.y + n.vy * a - 0.5 * r * a * a,
      vx: n.vx,
      vy: n.vy - r * a,
      bounces: t,
    };
  };
}
function Sk(e, t, n, r, i = {}) {
  let a = ey(
    W(
      n,
      (t) =>
        jv(
          kv(e(t), fk(t, 0, n, `smooth`)),
          kv(r(t), 1 - fk(t, n - 0.1, n, `smooth`)),
        ),
      {
        events: bk(i.introEvents ?? [], n),
        idle: i.idle,
        label: `${i.label ?? `loop`}-intro`,
      },
    ),
    ry(
      W(t, (t) => e(t + n), {
        events: bk(
          (i.cycleEvents ?? []).map((e) => ({
            ...e,
            at: (((e.at - n) % t) + t) % t,
          })),
          t,
        ),
        idle: i.idle,
        label: i.label,
      }),
    ),
  );
  return (Ck.set(a, { period: t, intro: n }), a);
}
var Ck = new WeakMap();
function wk(e, t, n, r = { a: 0.232, b: 0.254, c: 0.2775 }) {
  let i = Math.sin(e),
    a = Math.cos(e);
  return (
    (r.c * t - Math.sqrt((r.a * n * i) ** 2 + (r.b * t * a) ** 2)) *
    (1 - fk(Math.abs(e), 0.1, 0.8))
  );
}
var Tk = 0.2941;
var Ek = { normal: 0.253, flat: 0.203, lifted: 0.306 };
var Dk = 0.7;
var Ok = [0, 0.26];
var K = 18;
var kk = [``, `B`, `C`];
var Ak = (e) => kk[nk(e, 900, 3)];
var jk = (e) => [0, 0, 1, 2][nk(e, 901, 4)];
var Mk = (e, t) => e + Ak(t);
function Nk(e, t, n, r = `normal`) {
  let i = B(n, -0.7, Dk),
    a = Ek[r];
  return { dx: e + a * Math.sin(i), dy: t - a * Math.cos(i) - Tk, rot: i };
}
var Pk = (e) => ({ amp: e.reduced ? 0.5 : 1, red: e.reduced, seed: e.seed });
var Fk = (e, t) => ({ arm: { L: { deg: e }, R: { deg: t } } });
var Ik = (e) => ({ props: { cap: e } });
function Lk(e, t, n = [], r = {}) {
  return W(e, r.hold ? t : yk(t, e), {
    events: bk(n, e),
    idle: r.idle,
    label: r.label,
  });
}
function Rk(e, t) {
  let { amp: n } = Pk(e),
    r = e.seed,
    i = B(Math.round(e.dist), 1, 5),
    a = (a) => {
      let o = [];
      for (let s = 0; s < i; s++) {
        let c = i === 1 ? 0.5 : s / (i - 1),
          l =
            0.3 *
            n *
            (t?.heightScale ?? 1) *
            tk(r, 10 + s, 0.1) *
            (i === 1 ? 1 : 0.7 + 0.6 * c) *
            (e.promotes && s === i - 1 ? 1.12 : 1);
        o.push({
          height: l,
          air: Math.sqrt((8 * Math.max(l, 0.05)) / 30) * a,
          crouch: (s === 0 ? 0.11 : 0.085) * a,
        });
      }
      return mk(o, (t?.flourish ? 0.34 : 0.2) * a);
    },
    o = tk(r, 1, 0.07) * (e.reduced ? 0.9 : 1),
    s = a(o);
  s.end > 1.1 && !t?.heightScale && ((o *= 1.1 / s.end), (s = a(o)));
  let c = s.settle,
    l = s.end,
    [u, d] = e.off,
    f = e.facing,
    p = 1 - 0.2 * n,
    m = 1 + 0.16 * n,
    h = 1 - 0.22 * n,
    g = [[0, 1]];
  for (let e = 0; e < i; e++) {
    let t = s.take[e],
      r = s.land[e],
      a = s.hops[e].air;
    (e === 0 &&
      g.push(
        [t - s.hops[0].crouch * 0.4, p, `outQuad`],
        [t, p - 0.01, `inOutSine`],
      ),
      g.push(
        [t + a * 0.3, m, `outCubic`],
        [r - a * 0.14, 1 + 0.04 * n, `inOutSine`],
        [r, 1, `inQuad`],
        [r + 0.05, h, `outQuad`],
      ),
      e < i - 1
        ? g.push([
            Math.max(r + 0.06, s.take[e + 1] - 0.005),
            h - 0.01,
            `inOutSine`,
          ])
        : g.push([r + c * 0.5, 1 + 0.07 * n, `outQuad`], [l, 1, `inOutSine`]));
  }
  let _ = uk(g),
    v = (e, t) => {
      let r = [[0, K]];
      for (let a = 0; a < i; a++) {
        let i = s.take[a] + e,
          o = s.land[a] + e,
          c = s.hops[a].air;
        r.push(
          [i - 0.05, K - 8 * n, `outQuad`],
          [i + c * 0.35, K + 84 * n * t, `outBack`],
          [i + c * 0.7, K + 66 * n * t, `inOutSine`],
          [o, K + 26 * n, `inQuad`],
          [o + 0.07, K - 6 * n, `outQuad`],
          [o + 0.15, K, `inOutSine`],
        );
      }
      return (r.push([l, K]), uk(r));
    },
    y = v(0, 1),
    b = v(0.025, 0.92),
    x = (e) => gk(s, e) + Tk * (_(e) - 1),
    S = pk(x, l, 4.4, 0.24),
    C = (e) => {
      for (let t = 0; t < i; t++) {
        let n = s.take[t],
          r = s.land[t];
        if (e >= n - 0.005 && e < r + 0.02) return { mood: `happy` };
        if (e >= r + 0.02 && e < r + 0.075)
          return { eye: `closed`, mouth: `grin` };
        let a = t < i - 1 ? s.take[t + 1] : 1 / 0;
        if (e >= r + 0.075 && e < a - 0.1) return {};
        if (e >= Math.max(r + 0.075, a - 0.1) && e < a - 0.005)
          return { mouth: `o`, eye: `wide` };
      }
      return e < s.take[0] - 0.005 && e >= s.take[0] - 0.1
        ? { mouth: `o`, eye: `wide` }
        : {};
    },
    w = s.land[i - 1] + 0.06,
    T = [];
  for (let e = 0; e < i; e++) {
    let r = s.take[e],
      a = s.land[e],
      o = i === 1 ? 1 : (e + 1) / i;
    (T.push(U.sound(r, `count`, { n: e + 1, of: i })),
      t?.quiet ||
        T.push(
          U.impact(a, `land`, {
            strength: B((0.3 + 0.35 * o) * n * 1.4, 0.15, 0.9),
          }),
        ),
      T.push(U.particle(a, `puff`)),
      e < i - 1 && T.push(U.sound(a, `pawnBoing`, { step: e + 1, of: i })));
  }
  return (
    t?.flourish && T.push(U.particle(w, `sparkle`)),
    Lk(
      l,
      (e) => {
        let a = _k(s, e),
          o = hk(s, e),
          c = _(e),
          l = 0;
        o && (l += f * 0.11 * n * Math.sin(Math.PI * o[1]));
        for (let t = 0; t < i; t++)
          l += dk(e, s.land[t], -f * 0.055 * n, 3.2, 0.14);
        let p = B((S(e) - x(e)) * 1.7, -0.03, 0.07) * n,
          m = 0;
        for (let t = 0; t < i; t++)
          m += dk(
            e,
            s.land[t],
            0.11 * n * (t % 2 ? -1 : 1) * rk(r, 3),
            3.4,
            0.17,
          );
        let h;
        if (t?.flourish) {
          let t = e - w;
          if (t > -0.02) {
            let e = K + 132 * fk(t, 0, 0.1, `outBack`) * (1 - fk(t, 0.2, 0.3));
            ((h = vk(
              Fk(e, e),
              { mood: `victorious` },
              Ik({ state: Mk(`lifted`, r) }),
            )),
              (t < 0 || t > 0.22) && (h = void 0));
          }
        }
        return vk(
          {
            x: u * (1 - a),
            y: d * (1 - a),
            lift: gk(s, e),
            sy: c,
            sx: 1 / c,
            lean: l,
          },
          Fk(y(e), b(e)),
          C(e),
          Ik({ dy: p, rot: m }),
          h,
        );
      },
      T,
      { label: i > 1 ? `w-move-double` : `w-move` },
    )
  );
}
function zk(e, t) {
  let n = jk(t);
  ((e.pose = {
    ...e.pose,
    mood: `neutral`,
    props: {
      ...(e.pose.props ?? {}),
      cap: { ...(e.pose.props?.cap ?? {}), state: Mk(`normal`, t) },
      tuft: { ...(e.pose.props?.tuft ?? {}), hidden: n !== 1 },
      plaster: { ...(e.pose.props?.plaster ?? {}), hidden: n !== 2 },
    },
  }),
    e.refresh());
}
function Bk(e, t) {
  let { amp: n, seed: r } = Pk(t),
    i = Number.isFinite(e) ? Math.max(0, e) : 0,
    a = 0.44 * tk(r, 2, 0.06),
    o = a + 0.04,
    s = 0.14 * n * tk(r, 3, 0.1),
    c = Math.sqrt((8 * Math.max(s, 0.04)) / 30),
    l = o + c,
    u = l + 0.19,
    d = uk([
      [0, 1],
      [a - 0.05, 1],
      [o - 0.01, 0.82, `outQuad`],
      [o, 0.83],
      [o + c * 0.3, 1.14, `outCubic`],
      [l - c * 0.14, 1.04, `inOutSine`],
      [l, 1, `inQuad`],
      [l + 0.05, 0.84, `outQuad`],
      [l + 0.1, 1.06, `outQuad`],
      [u, 1, `inOutSine`],
    ]),
    f = (e) =>
      uk([
        [0, K],
        [o - 0.04 + e, 12, `outQuad`],
        [o + c * 0.5 + e, K + 130 * n, `outBack`],
        [l + e, K + 100 * n, `inOutSine`],
        [l + 0.08 + e, 14, `outQuad`],
        [u, K, `inOutSine`],
      ]),
    p = f(0),
    m = f(0.02),
    h = [
      U.sound(i + l, `pawnBoing`, { entrance: !0 }),
      U.particle(i + l, `sparkle`),
    ];
  return Lk(
    i + u,
    (e) => {
      let t = e - i;
      if (t < 0) return { draw: 0 };
      let u = d(t),
        f = t >= o && t < l ? s * 4 * ((t - o) / c) * (1 - (t - o) / c) : 0,
        h =
          t < a - 0.02
            ? {}
            : t < o + c * 0.5
              ? { mood: `surprised` }
              : t < l + 0.02
                ? { mood: `happy` }
                : t < l + 0.08
                  ? { eye: `closed`, mouth: `grin` }
                  : {};
      return vk(
        { draw: fk(t, 0, a, `inOutSine`), lift: f, sy: u, sx: 1 / u },
        Fk(p(t), m(t)),
        h,
        Ik({
          rot: dk(t, l, 0.1 * n * rk(r, 4), 3.4, 0.16),
          dy:
            t >= l
              ? 0.03 * n * Math.exp(-(t - l) / 0.1) * Math.sin(QO * 4 * (t - l))
              : 0,
        }),
      );
    },
    h,
    { idle: !1, label: `w-entrance` },
  );
}
function Vk(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 1.7 * tk(n, 4, 0.1),
    i = ek(n, 5) * QO;
  return Sk(
    (e) => {
      let n = (QO * e) / r + i,
        a = Math.sin(n),
        o = 1 + t * (0.05 + 0.012 * Math.sin(n + 0.7));
      return vk(
        {
          lift: t * (0.016 + 0.01 * a),
          sy: o,
          sx: 1 / o,
          lean: t * 0.02 * Math.sin(n * 2 + 1),
        },
        Fk(K + t * (16 + 6 * a), K + t * (16 + 6 * Math.sin(n + 1.3))),
        { eye: `wide`, brow: `raised` },
        Ik({
          dy: t * (0.03 + 0.012 * Math.sin(n - 0.9)),
          rot: t * 0.05 * Math.sin(2 * n),
        }),
      );
    },
    r,
    0.26,
    (e) =>
      vk(
        {
          sy: 1 + 0.1 * t * G(e, 0, 0.2),
          sx: 1 - 0.07 * t * G(e, 0, 0.2),
          lift: 0.04 * t * G(e, 0, 0.26),
        },
        e < 0.17 ? Ik({ state: Mk(`lifted`, n) }) : void 0,
        Ik({ dy: 0.05 * t * G(e, 0, 0.24) }),
      ),
    { introEvents: [U.particle(0.04, `exclaim`)], label: `w-hover` },
  );
}
function Hk(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 0.64 * tk(n, 6, 0.1),
    i = 0.09 * t * tk(n, 7, 0.1),
    a = 0.32,
    o = 0.14 * r,
    s = 0.9 * r,
    c = uk([
      [0, 1 - 0.13 * t],
      [0.06 * r, 1 + 0.04 * t, `outQuad`],
      [o - 0.02, 1 - 0.07 * t, `inOutSine`],
      [o + 0.12 * r, 1 + 0.1 * t, `outCubic`],
      [s - 0.08 * r, 1.03, `inOutSine`],
      [s, 1, `inQuad`],
      [r, 1 - 0.13 * t, `outQuad`],
    ]),
    l = (e, n) => {
      let i = ((e % r) + r) % r,
        a = (i / r + n + 1) % 1;
      return (
        K +
        t * (104 + 30 * Math.sin(QO * a)) * (0.55 + 0.45 * G(i, 0.02 * r, r))
      );
    },
    u = (e) => {
      let n = ((e % r) + r) % r,
        a = s - o,
        u = (n - o) / a,
        d = n >= o && n < s ? i * 4 * u * (1 - u) : 0,
        f = c(n);
      return vk(
        { lift: d, sy: f, sx: 1 / f, lean: t * 0.04 * Math.sin((QO * n) / r) },
        Fk(l(e, 0), l(e, 0.18)),
        n >= o && n < s ? { mood: `happy` } : { eye: `wide`, mouth: `grin` },
        Ik({
          dy: t * 0.04 * Math.sin((QO * (n - o)) / r),
          rot: t * 0.06 * Math.sin((QO * n) / r + 1),
        }),
      );
    },
    d = (e, n) => {
      let r =
        fk(e + n * 0.1, 0.05, 0.14, `outBack`) * (1 - fk(e, 0.12, a, `smooth`));
      return ov(K, ov(l(e, n), K + 132 * t, r), fk(e, 0, 0.08));
    };
  return Sk(
    u,
    r,
    a,
    (e) =>
      vk(
        {
          sy: 1 - 0.12 * t * G(e, 0, 0.12) + 0.12 * t * G(e, 0.1, 0.32),
          lift: 0.09 * t * G(e, 0.1, 0.32),
        },
        e > 0.1 && e < 0.28 ? Ik({ state: Mk(`lifted`, n) }) : void 0,
        Fk(d(e, 0), d(e, 0.18)),
      ),
    { introEvents: [U.particle(0.1, `sparkle`)], label: `w-select` },
  );
}
function Uk(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 1.3 * tk(n, 8, 0.1),
    i = ek(n, 9) * QO,
    a = Math.round(9.5 * r) / r;
  return Sk(
    (e) => {
      let n = (QO * e) / r + i,
        o = Math.sin(QO * a * e + i),
        s = 0.97 + 0.012 * Math.sin(2 * n),
        c = G(((e % r) + r) % r, 0.55 * r, 0.7 * r);
      return vk(
        {
          x: 0.006 * t * o,
          sy: s - 0.03 * c * t,
          sx: 1 / (s - 0.03 * c * t),
          lean: t * 0.02 * Math.sin(n),
          look: { x: 0.6 * Math.sin(n) },
        },
        Fk(K + t * (46 + 5 * o), K + t * (46 - 5 * o)),
        {
          mood: `worried`,
          foot: { L: { rot: 0.07 * t * o }, R: { rot: -0.07 * t * o } },
        },
        Ik({ dy: -0.012, rot: t * (0.09 * Math.sin(n) + 0.02 * o) }),
      );
    },
    r,
    0.3,
    (e) =>
      vk(
        { sy: 1 - 0.08 * t * G(e, 0, 0.16), lift: 0.03 * t * G(e, 0.05, 0.25) },
        Ik({ dy: 0.04 * t * G(e, 0.05, 0.2) }),
      ),
    {
      introEvents: [U.particle(0.08, `sweat`)],
      cycleEvents: [U.particle(0.5 * r, `sweat`)],
      label: `w-nervous`,
    },
  );
}
function Wk(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 6.4 * tk(n, 11, 0.1),
    i = rk(n, 12),
    a = (e) => e * r,
    o = uk([
      [a(0), -0.02],
      [a(0.4), -0.075, `inOutSine`],
      [a(0.53), -0.092, `inOutSine`],
      [a(0.575), -0.118, `inQuad`],
      [a(0.615), 0.03, `outQuad`],
      [a(0.665), -0.012, `inOutSine`],
      [a(0.85), -0.03, `inOutSine`],
      [a(1), -0.02, `inOutSine`],
    ]),
    s = uk([
      [a(0), 0],
      [a(0.4), -0.2 * i, `inOutSine`],
      [a(0.575), -0.3 * i, `inQuad`],
      [a(0.615), 0.08 * i, `outQuad`],
      [a(0.68), -0.03 * i, `inOutSine`],
      [a(0.85), -0.09 * i, `inOutSine`],
      [a(1), 0, `inOutSine`],
    ]),
    c = uk([
      [a(0), 1],
      [a(0.16), 1, `inOutSine`],
      [a(0.27), 1.06, `inOutSine`],
      [a(0.4), 0.955, `inOutSine`],
      [a(0.575), 0.9, `inQuad`],
      [a(0.62), 1.09, `outQuad`],
      [a(0.7), 1, `inOutSine`],
      [a(0.85), 0.985, `inOutSine`],
      [a(1), 1, `inOutSine`],
    ]),
    l = uk([
      [a(0), 0],
      [a(0.5), 0.05 * i, `inOutSine`],
      [a(0.575), 0.075 * i, `inQuad`],
      [a(0.63), -0.03 * i, `outQuad`],
      [a(0.75), 0, `inOutSine`],
      [a(1), 0, `linear`],
    ]),
    u = (e) => G(e, a(0.16), a(0.4));
  return Sk(
    (e) => {
      let n = ((e % r) + r) % r,
        i = u(n),
        d = c(n) + 0.07 * i,
        f =
          n >= a(0.6) && n < a(0.65)
            ? { mood: `surprised` }
            : i > 0.05
              ? { mood: `sleepy`, eye: `closed`, mouthScale: 0.6 + 1.2 * i }
              : { mood: `sleepy` },
        p = K + t * 100 * i;
      return vk(
        {
          sy: 1 + (d - 1) * t,
          sx: 1 / (1 + (d - 1) * t),
          lean: l(n) * t,
          lift: 0.03 * t * i,
        },
        Fk(p, p),
        f,
        Ik({ dy: o(n) * t, rot: s(n) * t }),
      );
    },
    r,
    0.9,
    (e) => (e > 0.05 && e < 0.4 ? { eye: `closed` } : {}),
    {
      cycleEvents: [U.particle(a(0.3), `zzz`), U.particle(a(0.6), `zzz`)],
      label: `w-sleepy`,
    },
  );
}
function Gk(e) {
  let { amp: t, seed: n } = Pk(e),
    r = nk(n, 77, 3),
    i = tk(n, 78, 0.06);
  if (r === 1)
    return Rk(
      { off: [0, 0], facing: 0, dist: 3, reduced: e.reduced, seed: n },
      { flourish: !0, heightScale: 0.5, quiet: !0 },
    );
  if (r === 0) {
    let e = 1.8 * i,
      n = (e) => e * i,
      r = uk([
        [0, 0],
        [n(0.34), -0.112, `inQuad`],
        [n(0.9), -0.112, `linear`],
        [n(1), -0.13, `outQuad`],
        [n(1.08), 0.06, `outBack`],
        [n(1.5), 0, `inOutSine`],
        [e, 0],
      ]),
      a = uk([
        [0, 0],
        [n(0.34), -0.34, `inQuad`],
        [n(0.9), -0.34, `linear`],
        [n(1.08), 0.07, `outBack`],
        [n(1.5), 0, `inOutSine`],
        [e, 0],
      ]),
      o = uk([
        [0, K],
        [n(0.55), K, `linear`],
        [n(0.75), 152, `outBack`],
        [n(1), 152, `linear`],
        [n(1.2), 60, `inOutSine`],
        [n(1.5), K, `inOutSine`],
        [e, K],
      ]),
      s = uk([
        [0, K],
        [n(0.4), 52, `outQuad`],
        [n(0.9), 52, `linear`],
        [n(1.3), K, `inOutSine`],
        [e, K],
      ]),
      c = uk([
        [0, 1],
        [n(0.36), 0.97, `outQuad`],
        [n(1), 0.95, `inOutSine`],
        [n(1.1), 1.09, `outQuad`],
        [n(1.3), 0.99, `inOutSine`],
        [e, 1, `inOutSine`],
      ]);
    return Lk(
      e,
      (e) => {
        let i = e > n(0.4) && e < n(0.9) ? 0.008 * Math.sin(QO * 9 * e) : 0,
          l =
            e < n(0.34)
              ? {}
              : e < n(1)
                ? { mouth: `o`, eye: `wide`, brow: `worried` }
                : e < n(1.6)
                  ? { mood: `happy` }
                  : {},
          u = c(e);
        return vk(
          {
            sy: 1 + (u - 1) * t,
            sx: 1 / (1 + (u - 1) * t),
            x: i * t,
            lift: 0.03 * t * G(e, n(1.02), n(1.3)),
          },
          Fk(s(e), o(e)),
          l,
          Ik({ dy: r(e) * t, rot: (a(e) + dk(e, n(1.1), 0.09, 3.4, 0.2)) * t }),
        );
      },
      [
        U.particle(n(0.4), `sweat`),
        U.sound(n(1.04), `capPop`),
        U.particle(n(1.15), `sparkle`),
      ],
      { label: `w-gag-slip` },
    );
  }
  let a = 1.6 * i,
    o = (e) => e * i,
    s = uk([
      [0, 0],
      [o(0.22), 0, `linear`],
      [o(0.42), 0.15, `outBack`],
      [o(1), 0.15, `linear`],
      [o(1.16), -0.02, `inQuad`],
      [a, 0, `outQuad`],
    ]),
    c = uk([
      [0, 0],
      [o(0.42), 0.42, `outBack`],
      [o(0.7), 0.3, `inOutSine`],
      [o(1), 0.42, `inOutSine`],
      [o(1.16), 0, `inQuad`],
      [a, 0],
    ]),
    l = uk([
      [0, K],
      [o(0.25), 152, `outBack`],
      [o(1.05), 152, `linear`],
      [o(1.3), K, `inOutSine`],
      [a, K],
    ]),
    u = uk([
      [0, 1],
      [o(0.18), 0.94, `inOutSine`],
      [o(0.5), 0.965, `inOutSine`],
      [o(1), 0.965, `linear`],
      [o(1.16), 0.9, `inQuad`],
      [o(1.3), 1.03, `outQuad`],
      [a, 1, `inOutSine`],
    ]);
  return Lk(
    a,
    (e) => {
      let r = u(e),
        i = e > o(0.3) && e < o(1.12);
      return vk(
        {
          sy: 1 + (r - 1) * t,
          sx: 1 / (1 + (r - 1) * t),
          lean: 0.06 * t * G(e, o(0.1), o(1.3)) * rk(n, 79),
        },
        Fk(K, K + (l(e) - K) * t),
        e > o(0.3) && e < o(1.3) ? { mood: `happy` } : {},
        Ik({
          dy: s(e) * t,
          rot: c(e) * rk(n, 79) * t,
          state: i ? Mk(`lifted`, n) : void 0,
        }),
      );
    },
    [
      U.sound(o(0.3), `capPop`),
      U.particle(o(0.5), `sparkle`),
      U.sound(o(1.14), `capPop`),
    ],
    { label: `w-gag-tip` },
  );
}
function Kk(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 0.5 * tk(n, 13, 0.06),
    i = uk([
      [0, 1],
      [0.07, 1 - 0.14 * t, `outQuad`],
      [0.2, 1 + 0.05 * t, `outQuad`],
      [0.34, 0.99, `inOutSine`],
      [r, 1, `inOutSine`],
    ]),
    a = uk([
      [0, K],
      [0.06, K + 30 * t, `outQuad`],
      [0.22, K + 12 * t, `inOutSine`],
      [r, K, `inOutSine`],
    ]);
  return Lk(
    r,
    (e) => {
      let r = i(e);
      return vk(
        { sy: r, sx: 1 / r, lift: 0.025 * t * G(e, 0.02, 0.26) },
        Fk(a(e), a(e - 0.02)),
        e > 0.1 && e < 0.38 ? { mood: `happy` } : {},
        Ik({
          dy: 0.03 * t * G(e, 0.08, 0.26) - 0.02 * t * G(e, 0, 0.1),
          rot: dk(e, 0.08, 0.08 * t * rk(n, 14), 3.6, 0.15),
        }),
      );
    },
    [U.particle(0.1, `puff`)],
    { label: `w-deselect` },
  );
}
function qk(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 1 * tk(n, 15, 0.06),
    i = rk(n, 16),
    a = uk([
      [0, 1],
      [0.07, 1 + 0.1 * t, `outQuad`],
      [0.2, 0.98, `inOutSine`],
      [0.7, 0.98, `linear`],
      [r, 1, `inOutSine`],
    ]),
    o = uk([
      [0, 0],
      [0.12, 0.95 * i, `outQuad`],
      [0.5, 0.95 * i, `linear`],
      [0.66, 0, `inOutSine`],
      [r, 0],
    ]);
  return Lk(
    r,
    (e) => {
      let r = 1 + (a(e) - 1) * t;
      return vk(
        {
          sy: r,
          sx: 1 / r,
          lift: 0.04 * t * G(e, 0, 0.22),
          look: { x: o(e) },
          x: 0.006 * t * (e > 0.3 && e < 0.8 ? Math.sin(QO * 10 * e) : 0),
        },
        Fk(K + 26 * t * G(e, 0, 0.5), K + 26 * t * G(e, 0.02, 0.5)),
        e < 0.3 ? { mood: `surprised` } : e < 0.8 ? { mood: `worried` } : {},
        Ik({
          dy: 0.05 * t * G(e, 0, 0.3),
          rot: dk(e, 0.05, 0.1 * t * i, 3.4, 0.2),
          state: e > 0.02 && e < 0.3 ? Mk(`lifted`, n) : void 0,
        }),
      );
    },
    [U.particle(0.04, `exclaim`), U.particle(0.45, `sweat`)],
    { label: `w-checked` },
  );
}
function Jk(e, t, n = {}) {
  return Ik({
    follow: e,
    dx: t.dx * (1 - e),
    dy: t.dy * (1 - e),
    rot: t.rot,
    ...n,
  });
}
var Yk = (e, t, n = 0) => {
  let [r, i] = [Math.sin(n) * Tk * e, Math.cos(n) * Tk * e + t];
  return [r + Ek.normal * Math.sin(n), i + Ek.normal * Math.cos(n)];
};
var Xk = (e, t) => Math.max(0.16, Math.abs(Math.cos(QO * t * e)));
function Zk(e) {
  let { amp: t, seed: n, red: r } = Pk(e),
    i = tk(n, 40, 0.06),
    a = rk(n, 41),
    o = [0.3, 0.36, 0.5].map((e) => e * t),
    s = 0.95 * i,
    c = o.map((e, t) => ({
      height: e,
      air: Math.sqrt((8 * Math.max(e, 0.05)) / 30) * i,
      crouch: (t === 0 ? 0.16 : 0.09) * i,
    })),
    l = mk(c, 0.5),
    u = l.take[2] + 0.03,
    d = u + s,
    f = Math.max(0.3, d - 0.06 - l.land[2]),
    p = mk(c, f),
    m = d + 0.85 * i,
    h = [[0, 1]];
  for (let e = 0; e < 3; e++) {
    let n = p.take[e],
      r = p.land[e],
      i = p.hops[e].air;
    (e === 0 &&
      h.push(
        [n - p.hops[0].crouch * 0.4, 1 - 0.2 * t, `outQuad`],
        [n, 1 - 0.21 * t],
      ),
      h.push(
        [n + i * 0.3, 1 + 0.16 * t, `outCubic`],
        [r - i * 0.14, 1 + 0.04 * t, `inOutSine`],
        [r, 1, `inQuad`],
        [r + 0.05, 1 - 0.22 * t, `outQuad`],
      ),
      e < 2
        ? h.push([
            Math.max(r + 0.06, p.take[e + 1] - 0.005),
            1 - 0.23 * t,
            `inOutSine`,
          ])
        : h.push(
            [r + f * 0.4, 1 + 0.07 * t, `outQuad`],
            [p.end, 1, `inOutSine`],
          ));
  }
  h.push(
    [d - 0.03, 1, `linear`],
    [d + 0.03, 1 - 0.09 * t, `outQuad`],
    [d + 0.16, 1 + 0.03 * t, `outQuad`],
    [d + 0.32, 1, `inOutSine`],
  );
  let g = uk(h),
    _ = (e) =>
      uk([
        [0, K],
        [p.take[0] - 0.03 + e, 12, `outQuad`],
        [p.take[0] + 0.1 + e, K + 132 * t, `outBack`],
        [d + 0.2, K + 132 * t, `linear`],
        [m - 0.28, K + 60 * t, `inOutSine`],
        [m, K, `inOutSine`],
      ]),
    v = _(0),
    y = _(0.03),
    b = Tk * g(u) + Ek.normal + gk(p, u),
    x = (Tk + Ek.normal - b + 4.5 * s * s) / s,
    S = [
      U.sound(p.take[0], `cheer`),
      U.particle(u, `star`),
      U.sound(d, `capPop`),
      U.particle(d + 0.02, `sparkle`),
    ];
  for (let e = 0; e < 3; e++) S.push(U.particle(p.land[e], `sparkle`));
  return Lk(
    m,
    (e) => {
      let n = 1 + (g(e) - 1),
        i = gk(p, e),
        o;
      if (e < u - 0.02 || e > d + 0.03) {
        let n = 0;
        for (let r = 0; r < 3; r++)
          n += dk(e, p.land[r], 0.09 * t * (r % 2 ? -1 : 1) * a, 3.4, 0.16);
        o = Ik({
          rot: n,
          dy: e > d ? 0.03 * t * dk(e, d + 0.02, 1, 4, 0.12) : 0,
        });
      } else {
        let t = B((e - u) / s, 0, 1),
          n =
            e < u + 0.02
              ? B(1 - (e - (u - 0.02)) / 0.04, 0, 1)
              : e > d - 0.02
                ? B((e - (d - 0.02)) / 0.05, 0, 1)
                : 0,
          i = b + x * (e - u) - 4.5 * (e - u) ** 2,
          c = r ? 0 : 0.6 * Math.sin(QO * 1.5 * t) * (1 - t) * a;
        o = Jk(n, Nk(0.1 * a * Math.sin(Math.PI * t), i, c), {
          sx: r ? 1 : Xk(t, 2),
        });
      }
      let c =
        e < p.take[0] - 0.02
          ? {}
          : e < m - 0.3
            ? { mood: `victorious` }
            : e < m - 0.06
              ? { mood: `happy` }
              : {};
      return vk(
        {
          lift: i,
          sy: n,
          sx: 1 / n,
          lean:
            e > d
              ? 0.05 *
                t *
                a *
                Math.sin(QO * 1.2 * (e - d)) *
                fk(e, d, d + 0.3) *
                (1 - fk(e, m - 0.3, m))
              : 0,
        },
        Fk(v(e), y(e)),
        c,
        o,
      );
    },
    S,
    { label: `w-victory` },
  );
}
function Qk(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 1.9 * tk(n, 42, 0.06),
    i = rk(n, 43),
    a = (e) => (e * r) / 1.9,
    o = uk([
      [0, 1],
      [a(0.25), 1.05, `outQuad`],
      [a(0.75), 0.82, `inQuad`],
      [a(1.05), 0.86, `outQuad`],
      [r, 0.85, `inOutSine`],
    ]),
    s = uk([
      [0, K],
      [a(0.3), 38, `outQuad`],
      [a(0.9), 8, `inOutSine`],
      [r, 8],
    ]),
    c = uk([
      [0, 0],
      [a(0.5), 0, `linear`],
      [a(1.1), -0.108, `inQuad`],
      [r, -0.108],
    ]),
    l = uk([
      [0, 0],
      [a(0.5), 0, `linear`],
      [a(1.1), -0.3 * i, `inQuad`],
      [r, -0.3 * i],
    ]);
  return Lk(
    r,
    (e) => {
      let n = 1 + (o(e) - 1) * (0.5 + 0.5 * t),
        r =
          e < a(0.7)
            ? { mood: `worried` }
            : { eye: `closed`, brow: `worried`, mouth: `frown` };
      return vk(
        { sy: n, sx: 1 / n, lean: 0.07 * i * fk(e, a(0.5), a(1.2)) * t, x: 0 },
        Fk(s(e), s(e + 0.05)),
        r,
        Ik({ dy: c(e), rot: l(e) + dk(e, a(1.05), 0.05 * i, 3, 0.2) }),
      );
    },
    [U.particle(a(0.3), `sweat`), U.sound(a(0.4), `sigh`)],
    { idle: { blink: !1 }, hold: !0, label: `w-defeat` },
  );
}
function $k(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 1.3 * tk(n, 44, 0.06),
    i = rk(n, 45),
    a = (e) => (e * r) / 1.3,
    o = uk([
      [0, 1],
      [a(0.22), 0.96, `inOutSine`],
      [a(0.42), 1.05, `outQuad`],
      [a(0.82), 0.965, `inOutSine`],
      [a(1.05), 1, `outQuad`],
      [r, 1, `inOutSine`],
    ]),
    s = uk([
      [0, K],
      [a(0.28), 92, `outBack`],
      [a(0.9), 88, `linear`],
      [a(1.15), K, `inOutSine`],
      [r, K],
    ]);
  return Lk(
    r,
    (e) => {
      let n = 1 + (o(e) - 1) * t;
      return vk(
        {
          sy: n,
          sx: 1 / n,
          lift: 0.025 * t * G(e, a(0.3), a(0.6)),
          lean: 0.06 * t * i * Math.sin((e / r) * QO),
          look: { x: 0.7 * i * Math.sin((e / r) * QO * 1) },
        },
        Fk(K + (s(e) - K) * t, K + (s(e + 0.03) - K) * t),
        e > a(0.2) && e < a(1.1)
          ? { eye: `lidded`, brow: `raised`, mouth: `wavy` }
          : {},
        Ik({
          dy:
            0.035 * t * G(e, a(0.3), a(0.75)) -
            0.02 * t * G(e, a(0.8), a(1.15)),
          rot: dk(e, a(0.3), 0.1 * t * i, 3.2, 0.25),
        }),
      );
    },
    [U.sound(a(0.35), `hm`), U.particle(a(0.95), `puff`)],
    { label: `w-shrug` },
  );
}
function eA(e) {
  let { amp: t, seed: n } = Pk(e),
    r = 0.64,
    i = 3.6,
    a = rk(n, 46);
  return Lk(
    r,
    (e) => {
      let n = Math.sin(Math.PI * B(e / r, 0, 1)) ** 0.6 * (1 - (0.3 * e) / r),
        o = Math.sin(QO * i * e) * n * a;
      return vk(
        {
          look: { x: 0.95 * o },
          lean: 0.055 * t * o,
          x: 0.014 * t * o,
          sy: 1 - 0.03 * t * G(e, 0, 0.16),
          sx: 1 + 0.03 * t * G(e, 0, 0.16),
          foot: {
            L: { dy: 0.012 * t * Math.max(0, Math.sin(QO * i * e)) * n },
          },
        },
        Fk(
          K + 26 * t * G(e, 0, r),
          K +
            (132 + 14 * Math.sin(QO * i * 1 * e)) *
              t *
              fk(e, 0.02, 0.14) *
              (1 - fk(e, 0.46, r)),
        ),
        { brow: `angry`, mouth: `flat` },
        Ik({
          rot: 0.14 * t * Math.sin(QO * i * (e - 0.06)) * n * a,
          dy: -0.01 * t * n,
        }),
      );
    },
    [],
    { label: `w-refuse` },
  );
}
function tA(e) {
  let { amp: t, seed: n, red: r } = Pk(e),
    i = tk(n, 50, 0.05) * (r ? 0.85 : 1),
    a = rk(n, 51),
    o = 0.3 * i,
    s = 0.98 * i,
    c = 1.22 * i,
    l = uk([
      [0, 1],
      [o * 0.85, 1 - 0.28 * t, `inOutSine`],
      [o, 1 - 0.28 * t],
      [o + 0.12, 1 + 0.4 * t, `outCubic`],
      [s, 1 + 0.55 * t, `linear`],
      [c, 1 + 0.55 * t],
    ]),
    u = Tk * (1 - 0.28 * t) + Ek.normal,
    d = 3.3 * t,
    f = uk([
      [0, K],
      [o * 0.8, 8, `outQuad`],
      [o + 0.07, 150, `outBack`],
      [c, 150],
    ]);
  return Lk(
    c,
    (e) => {
      let n = B((e - o) / (s - o), 0, 1),
        p = l(e),
        m = e < o ? 0 : t * 1.15 * H.outCubic(n),
        h =
          r || e < o + 0.05 || e >= s
            ? void 0
            : Xk(B((e - o - 0.05) / (s - o - 0.05), 0, 1) ** 1.4, 2.5),
        g = e - o,
        _ = B(g / (c - o), 0, 1),
        v =
          e < o - 0.02
            ? {}
            : Jk(
                e < o ? 1 - B((e - (o - 0.02)) / 0.02, 0, 1) : 0,
                Nk(
                  0.35 * a * H.outQuad(_),
                  u + d * g - 4.5 * g * g,
                  -0.5 * a * Math.sin(QO * 1.2 * _),
                ),
                {
                  alpha: 1 - fk(e, o + 0.5 * i, c - 0.1),
                  sx: r ? 1 : Xk(_, 2),
                },
              );
      return vk(
        {
          lift: m,
          sy: p,
          sx: p ** -0.9,
          draw: 1 - fk(e, o + 0.32 * i, s + 0.1, `inQuad`),
          alpha: 1 - fk(e, s - 0.1, c, `smooth`),
          turn: h,
          lean: r ? 0 : 0.12 * a * G(e, o, s),
        },
        Fk(f(e), f(e + 0.02)),
        e < o * 0.85 ? { mouth: `o` } : { mood: `happy` },
        v,
      );
    },
    [
      U.particle(o, `sparkle`),
      U.sound(o + 0.2 * i, `inkSwirl`),
      U.particle(o + 0.3, `star`),
      U.particle(o + 0.5, `note`),
      U.particle(s, `poof`),
      U.world(c, `vanished`),
    ],
    { idle: !1, hold: !0, label: `w-promoteOut` },
  );
}
function nA(e) {
  let { amp: t, seed: n } = Pk(e),
    r = tk(n, 52, 0.05),
    i = rk(n, 53),
    a = 0.72 * r,
    o = 0.74 * r,
    s = o + 0.15,
    c = s + 0.72 * r,
    l = uk([
      [0, 1],
      [s - 0.01, 1],
      [s + 0.05, 1 - 0.2 * t, `outQuad`],
      [s + 0.17, 1 + 0.1 * t, `outQuad`],
      [s + 0.32, 1, `inOutSine`],
      [c, 1],
    ]),
    u = (e) =>
      uk([
        [0, K],
        [s + e, K, `linear`],
        [s + 0.14 + e, K + 132 * t, `outBack`],
        [c - 0.26 + e, K + 132 * t, `linear`],
        [c, K, `inOutSine`],
      ]),
    d = u(0),
    f = u(0.03);
  return Lk(
    c,
    (e) => {
      let n = 1 + (l(e) - 1),
        r;
      if (e >= s + 0.04)
        r = Ik({
          rot: dk(e, s + 0.04, 0.12 * t * i, 3.4, 0.17),
          dy: -0.02 * t * G(e, s, s + 0.12),
        });
      else {
        let n = e < o ? 1 : 1 - H.inQuad(B((e - o) / (s - o), 0, 1)),
          a = e < o ? 0.02 * Math.sin(QO * 1.6 * e) : 0;
        r = Jk(
          e > s - 0.02 ? B((e - (s - 0.02)) / 0.06, 0, 1) : 0,
          Nk(a, Tk + Ek.normal + 0.34 * t * n, 0.28 * i * n),
        );
      }
      return vk(
        { draw: fk(e, 0, a, `inOutSine`), sy: n, sx: 1 / n },
        Fk(d(e), f(e)),
        e > s + 0.02 && e < c - 0.2 ? { mood: `victorious` } : {},
        r,
      );
    },
    [
      U.sound(s, `capPlop`),
      U.impact(s, `land`, { strength: 0.3 }),
      U.particle(s + 0.02, `puff`),
      U.particle(s + 0.1, `sparkle`),
    ],
    { idle: !1, label: `w-promoteIn` },
  );
}
function rA(e) {
  let { amp: t, seed: n } = Pk(e),
    r = rk(n, 60),
    i = rk(n, 61),
    a = 4.4 * tk(n, 62, 0.08),
    o = 0.95,
    s = (e) => {
      let n = (QO * e) / a,
        i = 0.9 + 0.022 * t * Math.sin(n),
        o = 0.6 + 0.35 * (0.5 + 0.5 * Math.sin(n - 1.2));
      return vk(
        { sy: i, sx: 1 / i, lean: 0.1 * r + 0.012 * Math.sin(n) },
        Fk(K, K),
        { mood: `sleepy`, mouthScale: o },
      );
    },
    c = (e) =>
      Ik({
        dy: -0.09 + 0.008 * Math.sin((QO * e) / a),
        rot: -0.3 * r + 0.02 * Math.sin((QO * e) / a + 1),
      }),
    l = (e) => vk(s(e), c(e)),
    u = 0.12,
    d = 0.62,
    f = ey(
      Lk(
        o,
        (e) => {
          let a = kv(s(e), fk(e, 0, 0.5)),
            l;
          if (e >= 0.64) {
            let n = fk(e, 0.64, o, `smooth`),
              r = c(o).props.cap;
            l = Ik({
              dy: (r.dy ?? 0) * n,
              rot: (r.rot ?? 0) * n + dk(e, 0.66, 0.1 * t, 3.6, 0.15) * (1 - n),
            });
          } else {
            let a = B((e - u) / 0.5, 0, 1),
              o = e < u ? 0 : 4 * a * (1 - a),
              s = Yk(0.9, 0, 0.1 * r),
              c = ov(0.42 * i, s[0], H.inOutSine(a)),
              f = ov(0.12, s[1], H.inQuad(a)) + 0.45 * t * o;
            l = Jk(
              e > 0.59 ? B((e - 0.59) / 0.05, 0, 1) : 0,
              Nk(
                c,
                f,
                ov(0.3 * i, 0, a),
                a > 0.9 ? `normal` : a > 0.05 ? `lifted` : `flat`,
              ),
              {
                state: Mk(
                  a >= 0.9 || e >= d ? `normal` : e < u ? `flat` : `lifted`,
                  n,
                ),
              },
            );
          }
          return vk(a, l);
        },
        [U.sound(0.16999999999999998, `capPop`), U.sound(d, `capPlop`)],
        { hold: !0, label: `w-napping-intro` },
      ),
      ry(
        W(a, (e) => l(e + o), {
          events: bk(
            [U.particle(0.35 * a, `zzz`), U.particle(0.75 * a, `zzz`)].map(
              (e) => ({ ...e, at: (((e.at - o) % a) + a) % a }),
            ),
            a,
          ),
          label: `w-napping`,
        }),
      ),
    );
  return (Ck.set(f, { period: a, intro: o }), f);
}
function iA(e) {
  let { amp: t, seed: n, red: r } = Pk(e),
    i = tk(n, 21, 0.06) * (r ? 0.92 : 1),
    [a, o] = e.off,
    s = Math.hypot(a, o) || 1,
    c = -a / s,
    l = -o / s,
    u = e.facing || (c >= 0 ? 1 : -1),
    d = (e) => e * i,
    f = d(0.4),
    p = d(0.75),
    m = d(0.83),
    h = d(1.3),
    g = d(1.56),
    _ = d(1.8),
    v = Math.min(0.55, s * 0.4),
    y = -c * v,
    b = -l * v,
    x = 0.62 * t * tk(n, 22, 0.08),
    S = 0.32,
    C = (e) => {
      if (e < f || e >= m) return e >= m ? 0.075 * t * G(e, m, m + d(0.2)) : 0;
      let n = (e - f) / (m - f);
      return n < S
        ? x * (1 - ((S - n) / S) ** 2)
        : x * (1 - ((n - S) / 0.6799999999999999) ** 2);
    },
    w = 0.07 * t,
    T = (e) => {
      if (e < f) {
        let t = w * fk(e, d(0.16), f - 0.02, `inOutSine`);
        return [a - c * t, o - l * t];
      }
      if (e < p) {
        let t = (e - f) / (p - f),
          n = -w * (1 - t);
        return [ov(a, y, t) - c * n * 0, ov(o, b, t) - l * n * 0];
      }
      let t = H.outQuad(B((e - p) / (m + d(0.14) - p), 0, 1));
      return [y * (1 - t), b * (1 - t)];
    },
    E = uk([
      [0, 0],
      [d(0.18), -0.04 * u, `inOutSine`],
      [f, -0.3 * u * t, `inOutSine`],
      [f + d(0.05), -0.3 * u * t, `linear`],
      [p, 1.25 * u * (0.4 + 0.6 * t), `inOutCubic`],
      [m, 1.5 * u, `outQuad`],
      [h + d(0.08), 1.5 * u, `linear`],
      [h + d(0.26), -0.1 * u, `inOutCubic`],
      [_, 0, `inOutSine`],
    ]),
    D = uk([
      [0, 1],
      [d(0.09), 0.9, `outQuad`],
      [d(0.17), 1.03, `inOutSine`],
      [d(0.3), 0.72, `inOutSine`],
      [f - 0.01, 0.72],
      [f + d(0.07), 1.28, `outCubic`],
      [p - d(0.05), 1.2, `linear`],
      [p + d(0.03), 0.74, `outQuad`],
      [m, 0.86, `outQuad`],
      [m + d(0.06), 0.8, `outQuad`],
      [m + d(0.16), 1, `outQuad`],
      [h - d(0.1), 0.97, `inOutSine`],
      [h + d(0.1), 1.06, `outQuad`],
      [h + d(0.22), 0.86, `inQuad`],
      [g, 1.1, `outCubic`],
      [g + d(0.08), 0.96, `inOutSine`],
      [_, 1, `inOutSine`],
    ]),
    O = (e) =>
      uk([
        [0, K],
        [d(0.1), 34, `outQuad`],
        [d(0.18), K, `inOutSine`],
        [d(0.3), 4, `inOutSine`],
        [f + d(0.05) + e, 152, `outBack`],
        [p + d(0.1), 152, `linear`],
        [m, 96, `inOutSine`],
        [m + d(0.2), 60, `outQuad`],
        [h, 46, `inOutSine`],
        [h + d(0.1), 20, `outQuad`],
        [h + d(0.2), 110, `outQuad`],
        [g + e, 152, `outBack`],
        [_ - d(0.1), 152],
        [_, K, `inOutSine`],
      ]),
    k = O(0),
    A = O(0.02);
  return {
    impactAt: p,
    action: Lk(
      _,
      (e) => {
        let [r, i] = T(e),
          a = E(e),
          o = D(e),
          s = e < _ - 0.02,
          c = e >= p && e < h + d(0.2),
          l;
        l =
          e < d(0.12)
            ? { mouth: `o` }
            : e < d(0.19)
              ? {}
              : e < p
                ? { eye: `glare`, brow: `angry`, mouth: `grin` }
                : e < p + d(0.12)
                  ? { mood: `hurt` }
                  : e < h + d(0.16)
                    ? { mood: `dizzy` }
                    : e < g + d(0.3)
                      ? { eye: `closed`, mouth: `wavy` }
                      : e < _ - 0.05
                        ? { mood: `happy` }
                        : {};
        let m;
        return (
          (m =
            e < p
              ? Ik({ dy: -0.03 * t * G(e, d(0.18), f + d(0.05)) })
              : e < g
                ? Ik({ state: Mk(`flat`, n), dy: -0.02 })
                : e < g + d(0.12)
                  ? Ik({
                      state: Mk(`lifted`, n),
                      dy: 0.09 * t * G(e, g, g + d(0.16)),
                    })
                  : Ik({
                      dy: dk(e, g + d(0.12), 0.04 * t, 4, 0.12),
                      rot: dk(e, g + d(0.1), 0.12 * t * u, 3.4, 0.16),
                    })),
          vk(
            {
              x: r,
              y: i,
              lift: C(e) + (s ? wk(a, o, 1 / o) : 0),
              sy: o,
              sx: 1 / o,
              lean: a,
              look: {
                x:
                  e > h + d(0.2) && e < g
                    ? 0.9 * Math.sin(QO * 3 * (e - h))
                    : 0,
              },
              pivot: s ? Ok : void 0,
              contact: s ? `ground` : void 0,
              footFollow: fk(Math.abs(a), 0.3, 0.9),
              bodyPose: c ? `hurt` : void 0,
            },
            Fk(k(e), A(e)),
            l,
            m,
          )
        );
      },
      [
        U.sound(d(0.02), `count`, { n: 1, of: 3 }),
        U.sound(d(0.2), `count`, { n: 2, of: 3 }),
        U.sound(f, `count`, { n: 3, of: 3 }),
        U.sound(f + 0.02, `dive`),
        U.particle(f + d(0.04), `speed`),
        U.impact(p, `dink`, { strength: r ? 0.6 : 0.85 }),
        U.particle(p, `star`),
        ...(r ? [] : [U.shake(p, 0.5, 0.22)]),
        U.sound(m + d(0.03), `thud`),
        U.particle(m + d(0.03), `puff`),
        U.particle(m + d(0.12), `orbit`),
        U.sound(g + d(0.05), `capPop`),
        U.particle(g + d(0.06), `sparkle`),
      ],
      { idle: !1, label: `w-attack` },
    ),
  };
}
function aA(e) {
  let { amp: t, seed: n, red: r } = Pk(e),
    i = B(Number.isFinite(e.strength) ? e.strength : 0.6, 0.15, 1),
    a = tk(n, 30, 0.06),
    o = Math.hypot(e.from[0], e.from[1]),
    s = o > 0.001 ? e.from[0] / o : 0,
    c = o > 0.001 ? e.from[1] / o : 1,
    l = { p: 0.9, n: 1, b: 1, r: 1.1, q: 1.15, k: 1.2 }[e.by] ?? 1,
    u = Math.abs(s) > 0.2 ? Math.sign(s) : rk(n, 31),
    d = (0.45 + 0.6 * i) * t * l * tk(n, 32, 0.1),
    f = (e) => e * a,
    p = f(0.03),
    m = f(0.62),
    h = f(0.88),
    g = f(1.5),
    _ = f(0.05),
    v = (0.24 + 0.4 * i) * t * l,
    y = (0.05 + 0.06 * i) * t,
    b = (e) => {
      if (e >= p && e < m) {
        let t = (e - p) / (m - p);
        return v * 4 * t * (1 - t);
      }
      if (e >= m && e < h) {
        let t = (e - m) / (h - m);
        return y * 4 * t * (1 - t);
      }
      return 0;
    },
    x = (e) => H.outCubic(B((e - p) / (h + f(0.1) - p), 0, 1)),
    S = (e) => s * d * x(e),
    C = (e) => c * d * x(e),
    w = uk([
      [0, 0],
      [p + 0.03, 0.2 * u, `outQuad`],
      [m - 0.1, 1.15 * u, `inOutSine`],
      [m, 1.46 * u, `outQuad`],
      [m + f(0.1), 1.37 * u, `outQuad`],
      [h, 1.46 * u, `inQuad`],
      [g, 1.46 * u],
    ]),
    T = uk([
      [0, 1],
      [p, 0.72, `outQuad`],
      [p + f(0.08), 1.1, `outQuad`],
      [m - 0.08, 1.02, `inOutSine`],
      [m + f(0.05), 0.9, `outQuad`],
      [h + f(0.04), 0.94, `inOutSine`],
      [g, 0.97, `inOutSine`],
    ]),
    E = (e) =>
      uk([
        [0, K],
        [p + e, 152, `outBack`],
        [m - 0.05 + e, 120, `inOutSine`],
        [m + f(0.12) + e, 52 + 14 * u * (e ? 1 : -1), `outQuad`],
        [g, 38 + 20 * (e ? 1 : -1) * u, `inOutSine`],
      ]),
    D = E(0),
    O = E(0.02),
    k = c * d * $O + Ek.flat * 0.58,
    A = (Math.abs(s) > 0.2 ? s : u * 0.8) * (1.1 + 0.9 * i) * t * l,
    j = (2.9 + 2.1 * i) * t * l,
    M = xk({
      x0: 0,
      y0: Tk + Ek.normal + 0.02,
      vx: A,
      vy: j,
      g: 9.5,
      floor: k,
      e: 0.42,
      maxBounces: 2,
    });
  return Lk(
    g,
    (e) => {
      let t = w(e),
        i = T(e),
        o = S(e),
        s = C(e),
        c = e - _,
        l = M(Math.max(0, c)),
        d;
      if (e < _ - 0.02)
        d = Ik({ state: Mk(`flat`, n), dy: -0.015 * fk(e, 0, 0.03) });
      else {
        let t = e < _ ? B(1 - (e - (_ - 0.02)) / 0.02, 0, 1) : 0,
          i = l.bounces === 0 && l.vy !== 0 ? B(c / 0.9, 0, 1) : 1,
          f = r
            ? 0.1 * u
            : -0.55 * u * Math.sin(QO * 1.1 * Math.min(i, 1)) * (1 - i) +
              dk(e, _ + 0.7 * a, 0.16 * u, 3.4, 0.2) +
              0.12 * u * fk(i, 0.9, 1),
          p =
            r || l.bounces > 0 || Math.abs(l.vy) < 1e-9
              ? 1
              : Xk(B(c / 0.72, 0, 1), 2);
        d = Jk(t, Nk(l.x - o, l.y - s * $O, f, `flat`), {
          state: Mk(`flat`, n),
          sx: p,
        });
      }
      let f =
        e < p + 0.02
          ? { mood: `surprised` }
          : e < m
            ? { mood: `hurt` }
            : { mood: `dizzy` };
      return vk(
        {
          x: o,
          y: s,
          lift: b(e) + wk(t, i, 1 / i),
          sy: i,
          sx: 1 / i,
          lean: t,
          pivot: Ok,
          contact: `ground`,
          footFollow: fk(Math.abs(t), 0.3, 0.9),
          bodyPose: e >= p ? `hurt` : void 0,
          look: { x: e > h ? 0.3 * Math.sin(QO * 0.8 * e) : 0 },
        },
        Fk(D(e), O(e)),
        f,
        d,
      );
    },
    [
      U.particle(0.02, `star`),
      U.sound(_, `capPop`),
      U.sound(m + f(0.02), `thud`),
      U.particle(m + f(0.02), `puff`),
      U.particle(h + f(0.05), `orbit`),
      U.world(g, `removed`),
    ],
    { idle: !1, hold: !0, label: `w-removed` },
  );
}
var oA = {
  rest: zk,
  entrance: Bk,
  hover: Vk,
  select: Hk,
  nervous: Uk,
  sleepy: Wk,
  gag: Gk,
  deselect: Kk,
  move: (e) =>
    Rk(
      {
        off: e.off,
        facing: e.facing,
        dist: e.dist,
        reduced: e.reduced,
        seed: e.seed,
        double: e.double,
        promotes: e.promotes,
      },
      { flourish: !!e.promotes },
    ),
  attack: iA,
  removed: aA,
  napping: rA,
  checked: qk,
  victory: Zk,
  defeat: Qk,
  shrug: $k,
  promoteOut: tA,
  promoteIn: nA,
  refuse: eA,
};
var sA = 0.5441;
var cA = 0.112;
var lA = 0.7;
var uA = 18;
var dA = [0, sA];
var fA = [0, 0.27];
function pA(e, t, n) {
  let r = B(n, -0.7, lA);
  return { dx: e + cA * Math.sin(r), dy: t - cA * Math.cos(r) - sA, rot: r };
}
var mA = (e, t, n = 0) => [
  Math.sin(n) * (sA * e + cA),
  Math.cos(n) * (sA * e + cA) + t,
];
var hA = (e) => ({ amp: e.reduced ? 0.5 : 1, red: e.reduced, seed: e.seed });
var gA = (e, t) => ({ arm: { L: { deg: e }, R: { deg: t } } });
var _A = (e) => ({ props: { star: e } });
var vA = (e, t, n = {}) =>
  _A({ follow: e, dx: t.dx * (1 - e), dy: t.dy * (1 - e), rot: t.rot, ...n });
var yA = (e, t) => Math.max(0.16, Math.abs(Math.cos(QO * t * e)));
function bA(e, t, n = [], r = {}) {
  return W(e, r.hold ? t : yk(t, e), {
    events: bk(n, e),
    idle: r.idle,
    label: r.label,
  });
}
var xA = (e, t) => U.sound(e, `ding`, t);
function SA(e, t) {
  ((e.pose = {
    ...e.pose,
    mood: `neutral`,
    props: {
      ...(e.pose.props ?? {}),
      star: { ...(e.pose.props?.star ?? {}), state: `on` },
    },
  }),
    e.refresh());
}
function CA(e, t) {
  let { amp: n, red: r, seed: i } = hA(e),
    a = B(Math.round(e.dist), 1, 5),
    o = (r) => {
      let o = [];
      for (let s = 0; s < a; s++) {
        let c = a === 1 ? 0.5 : s / (a - 1),
          l =
            0.22 *
            n *
            (t?.heightScale ?? 1) *
            tk(i, 110 + s, 0.1) *
            (a === 1 ? 1 : 0.88 + 0.24 * c) *
            (e.promotes && s === a - 1 ? 1.1 : 1);
        o.push({
          height: l,
          air: Math.sqrt((8 * Math.max(l, 0.05)) / 17) * r,
          crouch: (s === 0 ? 0.17 : 0.11) * r,
        });
      }
      return mk(o, 0.3 * r);
    },
    s = tk(i, 101, 0.07) * (r ? 0.9 : 1),
    c = o(s);
  c.end > 1.1 && ((s *= 1.1 / c.end), (c = o(s)));
  let l = c.end,
    [u, d] = e.off,
    f = e.facing,
    p = 1 - 0.19 * n,
    m = 1 + 0.13 * n,
    h = 1 - 0.21 * n,
    g = [[0, 1]];
  for (let e = 0; e < a; e++) {
    let t = c.take[e],
      r = c.land[e],
      i = c.hops[e].air;
    (e === 0 &&
      g.push(
        [0.05 * s, 1 + 0.03 * n, `outQuad`],
        [t - c.hops[0].crouch * 0.3, p, `inOutSine`],
        [t, p - 0.01],
      ),
      g.push(
        [t + i * 0.3, m, `outCubic`],
        [r - i * 0.14, 1 + 0.03 * n, `inOutSine`],
        [r, 1, `inQuad`],
        [r + 0.06, h, `outQuad`],
      ),
      e < a - 1
        ? g.push([
            Math.max(r + 0.07, c.take[e + 1] - 0.005),
            h - 0.01,
            `inOutSine`,
          ])
        : g.push(
            [r + c.settle * 0.5, 1 + 0.06 * n, `outQuad`],
            [l, 1, `inOutSine`],
          ));
  }
  let _ = uk(g),
    v = (e) => {
      let t = [[0, uA]];
      for (let r = 0; r < a; r++) {
        let i = c.take[r] + e,
          a = c.land[r] + e,
          o = c.hops[r].air;
        t.push(
          [i, uA, `linear`],
          [i + o * 0.5, uA + 52 * n, `outQuad`],
          [a, uA + 30 * n, `inOutSine`],
          [a + 0.1, uA, `outQuad`],
        );
      }
      return (t.push([l, uA]), uk(t));
    },
    y = v(0),
    b = v(0.03),
    x = (e) => gk(c, e) + sA * (_(e) - 1),
    S = pk(x, l, 3.2, 0.13),
    C = Math.round(-u),
    w = [];
  for (let e = 0; e < a; e++) {
    let r = c.land[e],
      i = a === 1 ? 1 : (e + 1) / a;
    (t?.noDing ||
      w.push(
        xA(r, {
          step: e + 1,
          steps: a,
          dfile: Math.round((C * (e + 1)) / a),
          last: e === a - 1,
          ...(t?.ascend ? { ascend: !0 } : {}),
        }),
      ),
      w.push(U.particle(r + 0.01, `ding`)),
      w.push(
        U.impact(r, `land`, {
          strength: B((0.25 + 0.3 * i) * n * 1.3, 0.12, 0.8),
        }),
      ),
      e === a - 1 && w.push(U.particle(r + 0.12, `note`)));
  }
  return bA(
    l,
    (e) => {
      let t = _k(c, e),
        r = hk(c, e),
        o = _(e),
        s = 0;
      r &&
        (s +=
          f * 0.05 * n * Math.sin(Math.PI * r[1]) +
          0.06 * n * Math.sin(QO * r[1]) * (r[0] % 2 ? -1 : 1) * rk(i, 103));
      let l = 0,
        p = 0;
      for (let t = 0; t < a; t++) {
        let r = c.land[t];
        ((s += dk(e, r, 0.07 * n * (t % 2 ? -1 : 1) * rk(i, 104), 2.6, 0.28)),
          (l += dk(e, r, 0.007 * n, 13, 0.22)),
          (p += dk(e, r, 0.34 * n * (t % 2 ? -1 : 1) * rk(i, 105), 2.9, 0.4)));
      }
      let m = B((S(e) - x(e)) * 1.5, -0.07, 0.11) * n,
        h = {};
      for (let t = 0; t < a; t++)
        e >= c.land[t] + 0.01 &&
          e < c.land[t] + 0.22 &&
          (h = { eye: `closed`, mouth: `o` });
      return vk(
        {
          x: u * (1 - t) + l,
          y: d * (1 - t),
          lift: gk(c, e),
          sy: o,
          sx: 1 / o,
          lean: s,
        },
        gA(y(e), b(e)),
        h,
        _A({ dy: m, rot: p }),
      );
    },
    w,
    { label: a > 1 ? `b-move-double` : `b-move` },
  );
}
function wA(e, t) {
  let { amp: n, seed: r } = hA(t),
    i = Number.isFinite(e) ? Math.max(0, e) : 0,
    a = 0.42 * tk(r, 102, 0.06),
    o = a + 0.05,
    s = 0.13 * n * tk(r, 106, 0.1),
    c = Math.sqrt((8 * Math.max(s, 0.04)) / 17),
    l = o + c,
    u = l + 0.24,
    d = uk([
      [0, 1],
      [a - 0.05, 1],
      [o - 0.02, 0.84, `inOutSine`],
      [o, 0.84],
      [o + c * 0.3, 1.12, `outCubic`],
      [l - c * 0.14, 1.03, `inOutSine`],
      [l, 1, `inQuad`],
      [l + 0.06, 0.85, `outQuad`],
      [l + 0.15, 1.05, `outQuad`],
      [u, 1, `inOutSine`],
    ]),
    f = (e) =>
      uk([
        [0, uA],
        [o + e, uA, `linear`],
        [o + c * 0.5 + e, uA + 70 * n, `outQuad`],
        [l + 0.1 + e, uA + 20 * n, `inOutSine`],
        [u, uA, `inOutSine`],
      ]),
    p = f(0),
    m = f(0.03);
  return bA(
    i + u,
    (e) => {
      let t = e - i;
      if (t < 0) return { draw: 0 };
      let u = d(t),
        f = t >= o && t < l ? s * 4 * ((t - o) / c) * (1 - (t - o) / c) : 0,
        h =
          t < a - 0.02
            ? {}
            : t >= l + 0.01 && t < l + 0.24
              ? { eye: `closed`, mouth: `o` }
              : {};
      return vk(
        {
          draw: fk(t, 0, a, `inOutSine`),
          lift: f,
          sy: u,
          sx: 1 / u,
          lean: dk(t, l, 0.08 * n * rk(r, 107), 2.6, 0.3),
        },
        gA(p(t), m(t)),
        h,
        _A({
          rot: dk(t, l, 0.3 * n * rk(r, 108), 2.9, 0.4),
          dy: 0.05 * n * dk(t, l, 1, 3.2, 0.3),
        }),
      );
    },
    [
      xA(i + l, { step: 1, steps: 1, entrance: !0, last: !0 }),
      U.particle(i + l + 0.01, `ding`),
    ],
    { idle: !1, label: `b-entrance` },
  );
}
function TA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 2.6 * tk(n, 120, 0.1),
    i = ek(n, 121) * QO;
  return Sk(
    (e) => {
      let n = (QO * e) / r + i,
        a = 1 + t * (0.04 + 0.01 * Math.sin(n + 0.5));
      return vk(
        {
          lift: t * (0.01 + 0.008 * Math.sin(n)),
          sy: a,
          sx: 1 / a,
          lean: t * 0.035 * Math.sin(n),
        },
        { eye: `wide`, brow: `raised` },
        _A({
          dy: t * (0.03 + 0.02 * Math.sin(2 * n)),
          rot: t * 0.09 * Math.sin(n + 1.2),
        }),
      );
    },
    r,
    0.34,
    (e) =>
      vk(
        {
          sy: 1 - 0.08 * t * G(e, 0, 0.14) + 0.08 * t * G(e, 0.1, 0.34),
          lift: 0.03 * t * G(e, 0.1, 0.34),
        },
        _A({
          dy: 0.1 * t * G(e, 0.06, 0.3),
          rot: dk(e, 0.08, 0.5 * t, 3.2, 0.25),
        }),
      ),
    {
      introEvents: [
        xA(0.08, { soft: !0, hover: !0 }),
        U.particle(0.09, `ding`),
      ],
      label: `b-hover`,
    },
  );
}
function EA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 1.2 * tk(n, 122, 0.1),
    i = 0.11 * t;
  return Sk(
    (e) => {
      let n = (QO * e) / r,
        a = t * 0.17 * Math.sin(n),
        o = Math.sin(n);
      return vk(
        {
          lift: i + 0.008 * Math.sin(2 * n),
          lean: a,
          pivot: dA,
          footFollow: 1,
          foot: {
            L: { rot: 0.16 * t * o },
            R: { rot: 0.16 * t * Math.sin(n - 0.5) },
          },
        },
        gA(uA + t * (36 + 14 * o), uA + t * (36 - 14 * o)),
        { mood: `happy` },
        _A({
          dy: 0.02 * t * Math.sin(2 * n + 1),
          rot: t * 0.12 * Math.sin(n + 2.4),
        }),
      );
    },
    r,
    0.4,
    (e) =>
      vk(
        {
          sy: 1 - 0.12 * t * G(e, 0, 0.12) + 0.1 * t * G(e, 0.1, 0.4),
          lift: 0.05 * t * G(e, 0.1, 0.4),
        },
        _A({
          dy: 0.1 * t * G(e, 0.1, 0.36),
          rot: dk(e, 0.16, 0.45 * t, 3, 0.25),
        }),
      ),
    {
      introEvents: [
        xA(0.16, { soft: !0, select: !0 }),
        U.particle(0.17, `ding`),
      ],
      label: `b-select`,
    },
  );
}
function DA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 1.5 * tk(n, 123, 0.1),
    i = ek(n, 124) * QO,
    a = Math.round(9 * r) / r,
    o = Math.round(6 * r) / r;
  return Sk(
    (e) => {
      let n = (QO * e) / r + i,
        s = Math.sin(QO * a * e + i),
        c = 0.965 - 0.03 * G(((e % r) + r) % r, 0.6 * r, 0.75 * r) * t;
      return vk(
        {
          x: 0.007 * t * s,
          sy: c,
          sx: 1 / c,
          lean: t * 0.025 * Math.sin(n),
          look: { x: 0.7 * Math.sin(n) },
        },
        gA(uA + t * (30 + 4 * s), uA + t * (30 - 4 * s)),
        { mood: `worried` },
        _A({
          rot: t * 0.26 * Math.sin(QO * o * e + 1) + 0.04 * Math.sin(n),
          dy: -0.01,
        }),
      );
    },
    r,
    0.3,
    (e) =>
      vk(
        { sy: 1 - 0.07 * t * G(e, 0, 0.16) },
        _A({ dy: 0.06 * t * G(e, 0.04, 0.22) }),
      ),
    {
      introEvents: [U.particle(0.1, `sweat`)],
      cycleEvents: [U.particle(0.55 * r, `sweat`)],
      label: `b-nervous`,
    },
  );
}
function OA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 7.6 * tk(n, 125, 0.1),
    i = rk(n, 126),
    a = (e) => e * r,
    o = uk([
      [a(0), -0.01],
      [a(0.42), -0.05, `inOutSine`],
      [a(0.575), -0.075, `inQuad`],
      [a(0.62), 0.06, `outQuad`],
      [a(0.7), -0.01, `inOutSine`],
      [a(1), -0.01, `inOutSine`],
    ]),
    s = uk([
      [a(0), 0],
      [a(0.42), -0.3 * i, `inOutSine`],
      [a(0.575), -0.45 * i, `inQuad`],
      [a(0.62), 0.4 * i, `outQuad`],
      [a(0.7), -0.1 * i, `inOutSine`],
      [a(1), 0, `inOutSine`],
    ]),
    c = uk([
      [a(0), 1],
      [a(0.16), 1, `inOutSine`],
      [a(0.28), 1.055, `inOutSine`],
      [a(0.42), 0.955, `inOutSine`],
      [a(0.575), 0.9, `inQuad`],
      [a(0.63), 1.08, `outQuad`],
      [a(0.72), 1, `inOutSine`],
      [a(1), 1, `inOutSine`],
    ]),
    l = uk([
      [a(0), 0],
      [a(0.5), 0.05 * i, `inOutSine`],
      [a(0.575), 0.08 * i, `inQuad`],
      [a(0.64), -0.03 * i, `outQuad`],
      [a(0.78), 0, `inOutSine`],
      [a(1), 0],
    ]);
  return Sk(
    (e) => {
      let n = ((e % r) + r) % r,
        i = G(n, a(0.16), a(0.42)),
        u = c(n) + 0.05 * i,
        d =
          n >= a(0.6) && n < a(0.66)
            ? { mood: `surprised` }
            : i > 0.05
              ? { mood: `sleepy`, eye: `closed`, mouthScale: 0.6 + 1.2 * i }
              : { mood: `sleepy` },
        f = uA + t * 60 * i;
      return vk(
        {
          sy: 1 + (u - 1) * t,
          sx: 1 / (1 + (u - 1) * t),
          lean: l(n) * t,
          lift: 0.02 * t * i,
        },
        gA(f, f),
        d,
        _A({ dy: o(n) * t, rot: s(n) * t }),
      );
    },
    r,
    1,
    (e) => (e > 0.05 && e < 0.4 ? { eye: `closed` } : {}),
    {
      cycleEvents: [
        U.particle(a(0.3), `zzz`),
        U.particle(a(0.62), `zzz`),
        xA(a(0.62), { soft: !0, jerk: !0 }),
      ],
      label: `b-sleepy`,
    },
  );
}
function kA(e) {
  let { amp: t, seed: n } = hA(e),
    r = nk(n, 130, 3),
    i = tk(n, 131, 0.06),
    a = (e) => e * i;
  if (r === 1) {
    let e = a(1.7),
      n = 0.05 * t;
    return bA(
      e,
      (e) => {
        let r = 0,
          i = 1,
          o = 0;
        for (let s = 0; s < 3; s++) {
          let c = a(0.16 + 0.34 * s),
            l = a(0.34 + 0.34 * s),
            u = (e - c) / (l - c);
          (u > 0 && u < 1 && (r = n * 4 * u * (1 - u) * (1 + 0.25 * s)),
            (i *=
              1 - 0.08 * t * G(e, l - 0.02, l + 0.12) + 0.05 * t * G(e, c, l)),
            (o += dk(e, l, 0.3 * t * (s % 2 ? -1 : 1), 3, 0.3)));
        }
        return vk(
          {
            lift: r,
            sy: i,
            sx: 1 / i,
            lean: 0.02 * t * Math.sin(QO * 1.2 * e),
          },
          e > a(0.3) && e < a(1.5)
            ? { mood: e > a(1.15) ? `shy` : `happy` }
            : {},
          _A({ rot: o, dy: 0.02 * t * G(e, a(0.3), a(1.3)) }),
        );
      },
      [0, 1, 2].flatMap((e) => [
        xA(a(0.34 + 0.34 * e), {
          step: e + 1,
          steps: 3,
          dfile: 0,
          last: e === 2,
          gag: !0,
        }),
        U.particle(a(0.35 + 0.34 * e), `ding`),
      ]),
      { label: `b-gag-hiccup` },
    );
  }
  if (r === 2) {
    let e = a(1.9),
      n = uk([
        [0, 0],
        [a(0.35), 0.9, `outQuad`],
        [a(1.2), 0.9],
        [a(1.45), 0, `inOutSine`],
        [e, 0],
      ]),
      r = uk([
        [0, 1],
        [a(0.4), 1.5, `outBack`],
        [a(1.2), 1.5],
        [a(1.5), 1, `inOutSine`],
        [e, 1],
      ]);
    return bA(
      e,
      (e) => {
        let i = n(e),
          o = r(e);
        return vk(
          {
            look: { y: i },
            sy: 1 + 0.03 * t * G(e, a(0.2), a(1.5)),
            lean: 0.03 * t * Math.sin(QO * 1.5 * e) * G(e, a(0.3), a(1.5)),
          },
          e > a(0.5) && e < a(1.35) ? { mood: `happy` } : {},
          _A({
            dy:
              -0.09 *
              fk(e, a(0.1), a(0.4), `outBack`) *
              (1 - fk(e, a(1.2), a(1.5))) *
              t,
            sx: 1 + (o - 1) * t,
            sy: 1 + (o - 1) * t,
            rot:
              dk(e, a(0.45), 0.4 * t, 3.2, 0.3) +
              dk(e, a(1.4), 0.3 * t, 3.2, 0.3),
          }),
        );
      },
      [
        xA(a(0.45), { soft: !0, gag: !0 }),
        U.particle(a(0.46), `ding`),
        U.particle(a(0.7), `heart`),
        xA(a(1.45), { soft: !0, gag: !0 }),
      ],
      { label: `b-gag-stargaze` },
    );
  }
  let o = a(1.6);
  return bA(
    o,
    (e) => {
      let n = G(e, 0.05, o - 0.1),
        r = Math.sin(QO * 1.25 * (e - 0.1));
      return vk(
        {
          lean: 0.07 * t * r * n,
          sy: 1 + 0.03 * t * G(e, 0.1, 0.4),
          lift: 0.015 * t * G(e, 0.1, 0.4),
        },
        e > 0.1 && e < o - 0.3 ? { eye: `closed`, mouth: `smile` } : {},
        _A({
          rot: dk(e, a(0.15), 0.55 * t, 3, 0.35) + 0.1 * t * r * n,
          dy: 0.06 * t * G(e, a(0.12), a(0.5)),
        }),
      );
    },
    [
      xA(a(0.15), { soft: !0, gag: !0 }),
      U.particle(a(0.16), `ding`),
      U.particle(a(0.6), `note`),
    ],
    { label: `b-gag-ding` },
  );
}
function AA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 0.7 * tk(n, 132, 0.06),
    i = uk([
      [0, 0.11 * t],
      [0.06, 0.13 * t, `outQuad`],
      [0.22, 0, `inQuad`],
      [r, 0],
    ]),
    a = uk([
      [0, 1],
      [0.22, 1, `linear`],
      [0.29, 0.86, `outQuad`],
      [0.42, 1.04, `outQuad`],
      [0.56, 0.99, `inOutSine`],
      [r, 1, `inOutSine`],
    ]);
  return bA(
    r,
    (e) => {
      let r = 1 + (a(e) - 1) * t,
        o = 1 - fk(e, 0.18, 0.26);
      return vk(
        {
          lift: i(e),
          sy: r,
          sx: 1 / r,
          lean:
            0.1 * t * Math.sin(QO * 1.6 * e) * o +
            dk(e, 0.26, 0.06 * t * rk(n, 133), 2.6, 0.25),
          pivot: o > 0.02 ? dA : void 0,
          footFollow: o,
        },
        gA(uA + 30 * t * o, uA + 30 * t * o),
        e > 0.26 && e < 0.55 ? { mood: `happy` } : {},
        _A({
          rot: dk(e, 0.25, 0.4 * t, 3, 0.3),
          dy: 0.04 * t * G(e, 0.24, 0.45),
        }),
      );
    },
    [xA(0.24, { soft: !0, deselect: !0 }), U.particle(0.25, `ding`)],
    { label: `b-deselect` },
  );
}
function jA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 1.1 * tk(n, 134, 0.06),
    i = rk(n, 135),
    a = uk([
      [0, 0],
      [0.16, 0.95 * i, `outQuad`],
      [0.6, 0.95 * i, `linear`],
      [0.8, 0, `inOutSine`],
      [r, 0],
    ]);
  return bA(
    r,
    (e) => {
      let n = 1 + 0.08 * t * G(e, 0, 0.3) - 0.03 * t * G(e, 0.3, 0.9);
      return vk(
        {
          sy: n,
          sx: 1 / n,
          lift: 0.03 * t * G(e, 0, 0.25),
          look: { x: a(e) },
          x: 0.007 * t * (e > 0.3 && e < 0.95 ? Math.sin(QO * 10 * e) : 0),
        },
        e < 0.35 ? { mood: `surprised` } : e < 0.95 ? { mood: `worried` } : {},
        _A({
          rot: dk(e, 0.05, 0.5 * t * i, 8, 0.35),
          dy: 0.06 * t * G(e, 0, 0.3),
        }),
      );
    },
    [
      xA(0.05, { soft: !0, alarm: !0 }),
      U.particle(0.06, `exclaim`),
      U.particle(0.5, `sweat`),
    ],
    { label: `b-checked` },
  );
}
function MA(e) {
  let { amp: t, seed: n, red: r } = hA(e),
    i = tk(n, 140, 0.05),
    a = rk(n, 141),
    o = mk(
      [0.24, 0.3, 0.4]
        .map((e) => e * t)
        .map((e, t) => ({
          height: e,
          air: Math.sqrt((8 * Math.max(e, 0.05)) / 17) * i,
          crouch: (t === 0 ? 0.2 : 0.1) * i,
        })),
      0.35 * i,
    ),
    s = o.end,
    c = 0.95 * i,
    l = s + c * 2,
    u = l + 0.5 * i,
    d = [[0, 1]];
  for (let e = 0; e < 3; e++) {
    let n = o.take[e],
      r = o.land[e],
      i = o.hops[e].air;
    (e === 0 &&
      d.push(
        [n - o.hops[0].crouch * 0.4, 1 - 0.19 * t, `inOutSine`],
        [n, 1 - 0.2 * t],
      ),
      d.push(
        [n + i * 0.3, 1 + 0.14 * t, `outCubic`],
        [r - i * 0.14, 1 + 0.03 * t, `inOutSine`],
        [r, 1, `inQuad`],
        [r + 0.06, 1 - 0.21 * t, `outQuad`],
      ),
      e < 2
        ? d.push([
            Math.max(r + 0.07, o.take[e + 1] - 0.005),
            1 - 0.22 * t,
            `inOutSine`,
          ])
        : d.push(
            [r + o.settle * 0.5, 1 + 0.05 * t, `outQuad`],
            [o.end, 1, `inOutSine`],
          ));
  }
  let f = uk(d),
    p = (e) =>
      uk([
        [0, uA],
        [o.take[0] + e, uA, `linear`],
        [o.take[0] + 0.2 + e, uA + 132 * t, `outBack`],
        [l - 0.1 + e, uA + 132 * t, `linear`],
        [u, uA, `inOutSine`],
      ]),
    m = p(0),
    h = p(0.03),
    g = [];
  for (let e = 0; e < 3; e++)
    g.push(
      xA(o.land[e], {
        step: e + 1,
        steps: 3,
        victory: !0,
        last: !1,
        ascend: !0,
      }),
      U.particle(o.land[e] + 0.01, `ding`),
      U.particle(o.land[e], `sparkle`),
    );
  for (let e = 0; e < 4; e++) {
    let t = s + (c * (e + 0.5)) / 2 + 0;
    g.push(
      xA(t, { step: 4 + e, toll: !0, victory: !0, last: e === 3 }),
      U.particle(t + 0.01, e % 2 ? `note` : `ding`),
    );
  }
  return bA(
    u,
    (e) => {
      let n = f(e),
        i = gk(o, e),
        d = 0,
        p;
      if (e >= s - 0 && e < l + 0.4) {
        let t = e - s,
          n = fk(t, 0, 0.3) * (1 - fk(e, l - 0.1, l + 0.4));
        ((d = (r ? 0.14 : 0.32) * a * Math.sin((QO * t) / c) * n), (p = dA));
      }
      let g = 0;
      for (let n = 0; n < 3; n++)
        g += dk(e, o.land[n], 0.3 * t * (n % 2 ? -1 : 1), 2.8, 0.4);
      return (
        e >= s &&
          (g +=
            0.45 *
            t *
            Math.sin((QO * (e - s)) / c - 0.9) *
            fk(e, s, s + 0.3) *
            (1 - fk(e, l, l + 0.4))),
        vk(
          {
            lift: i + (p ? 0.03 * t * G(e, s, l) : 0),
            sy: n,
            sx: 1 / n,
            lean: d,
            pivot: p,
            footFollow: p ? 1 : void 0,
          },
          gA(m(e), h(e)),
          e < o.take[0] - 0.03
            ? {}
            : e < u - 0.3
              ? { mood: `victorious` }
              : e < u - 0.05
                ? { mood: `happy` }
                : {},
          _A({
            rot: g,
            dy:
              0.05 *
              t *
              Math.sin(QO * 2 * (e / c)) *
              fk(e, s, s + 0.3) *
              (1 - fk(e, l, l + 0.3)),
          }),
        )
      );
    },
    g,
    { label: `b-victory` },
  );
}
function NA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 2 * tk(n, 142, 0.06),
    i = rk(n, 143),
    a = (e) => (e * r) / 2,
    o = uk([
      [0, 1],
      [a(0.3), 1.05, `outQuad`],
      [a(0.9), 0.84, `inQuad`],
      [a(1.25), 0.87, `outQuad`],
      [r, 0.86, `inOutSine`],
    ]);
  return bA(
    r,
    (e) => {
      let n = 1 + (o(e) - 1) * (0.5 + 0.5 * t),
        r =
          e < a(0.8)
            ? { mood: `worried` }
            : { eye: `closed`, brow: `worried`, mouth: `frown` };
      return vk(
        { sy: n, sx: 1 / n, lean: 0.06 * i * fk(e, a(0.6), a(1.4)) * t },
        gA(uA - 4 * fk(e, a(0.5), a(1.4)), uA - 4 * fk(e, a(0.5), a(1.4))),
        r,
        _A({
          dy: -0.09 * fk(e, a(0.7), a(1.4)),
          rot:
            -0.6 * i * fk(e, a(0.6), a(1.3)) +
            dk(e, a(0.95), 0.12 * i, 2.4, 0.3),
        }),
      );
    },
    [U.particle(a(0.35), `sweat`), U.sound(a(0.95), `dong`, { defeat: !0 })],
    { idle: { blink: !1 }, hold: !0, label: `b-defeat` },
  );
}
function PA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 1.4 * tk(n, 144, 0.06),
    i = rk(n, 145),
    a = (e) => (e * r) / 1.4,
    o = uk([
      [0, 1],
      [a(0.25), 0.965, `inOutSine`],
      [a(0.5), 1.05, `outQuad`],
      [a(0.9), 0.97, `inOutSine`],
      [a(1.15), 1, `outQuad`],
      [r, 1, `inOutSine`],
    ]),
    s = uk([
      [0, uA],
      [a(0.3), 96, `outBack`],
      [a(0.95), 92, `linear`],
      [a(1.2), uA, `inOutSine`],
      [r, uA],
    ]);
  return bA(
    r,
    (e) => {
      let n = 1 + (o(e) - 1) * t;
      return vk(
        {
          sy: n,
          sx: 1 / n,
          lift: 0.02 * t * G(e, a(0.3), a(0.7)),
          lean: 0.08 * t * i * Math.sin((e / r) * QO),
          look: { x: 0.7 * i * Math.sin((e / r) * QO) },
        },
        gA(uA + (s(e) - uA) * t, uA + (s(e + 0.03) - uA) * t),
        e > a(0.2) && e < a(1.15)
          ? { eye: `lidded`, brow: `raised`, mouth: `wavy` }
          : {},
        _A({
          rot:
            0.25 * t * i * G(e, a(0.3), a(1.1)) +
            dk(e, a(0.5), 0.15 * t, 2.8, 0.3),
          dy: 0.03 * t * G(e, a(0.3), a(0.8)),
        }),
      );
    },
    [U.particle(a(0.95), `puff`)],
    { label: `b-shrug` },
  );
}
function FA(e) {
  let { amp: t, seed: n } = hA(e),
    r = 0.72,
    i = 2.9,
    a = rk(n, 146);
  return bA(
    r,
    (e) => {
      let n = Math.sin(Math.PI * B(e / r, 0, 1)) ** 0.6 * (1 - (0.25 * e) / r),
        o = Math.sin(QO * i * e) * n * a;
      return vk(
        {
          look: { x: 0.9 * o },
          lean: 0.13 * t * o,
          x: 0.012 * t * o,
          sy: 1 - 0.04 * t * G(e, 0, 0.18),
          sx: 1 + 0.04 * t * G(e, 0, 0.18),
        },
        gA(uA + 34 * t * G(e, 0, r), uA + 34 * t * G(e, 0, r)),
        { brow: `angry`, mouth: `flat` },
        _A({
          rot: -0.3 * t * Math.sin(QO * i * (e - 0.08)) * n * a,
          dy: 0.01 * t * n,
        }),
      );
    },
    [U.sound(0.06, `dong`, { refuse: !0 })],
    { label: `b-refuse` },
  );
}
function IA(e) {
  let { amp: t, seed: n, red: r } = hA(e),
    i = tk(n, 150, 0.05) * (r ? 0.85 : 1),
    a = rk(n, 151),
    o = 0.34 * i,
    s = 1.08 * i,
    c = 1.4 * i,
    l = uk([
      [0, 1],
      [o * 0.85, 1 - 0.24 * t, `inOutSine`],
      [o, 1 - 0.24 * t],
      [o + 0.14, 1 + 0.36 * t, `outCubic`],
      [s, 1 + 0.5 * t, `linear`],
      [c, 1 + 0.5 * t],
    ]),
    u = uk([
      [0, uA],
      [o + 0.05, 150, `outBack`],
      [c, 150],
    ]);
  return bA(
    c,
    (e) => {
      let n = B((e - o) / (s - o), 0, 1),
        d = l(e),
        f = e < o ? 0 : t * 1.1 * H.outCubic(n),
        p =
          r || e < o + 0.06 || e >= s
            ? void 0
            : yA(B((e - o - 0.06) / (s - o - 0.06), 0, 1) ** 1.4, 2.5),
        m = e - o,
        h = B(m / (c - o), 0, 1),
        g =
          e < o - 0.02
            ? {}
            : vA(
                e < o ? 1 - B((e - (o - 0.02)) / 0.02, 0, 1) : 0,
                pA(
                  0.3 * a * H.outQuad(h) + 0.1 * Math.sin(QO * 1.5 * h),
                  sA * (1 - 0.24 * t) + cA + 3.6 * t * m - 4.5 * m * m,
                  -0.55 * a * Math.sin(QO * 1.4 * h),
                ),
                {
                  alpha: 1 - fk(e, o + 0.55 * i, c - 0.1),
                  sx: r ? 1 : yA(h, 2.5),
                },
              );
      return vk(
        {
          lift: f,
          sy: d,
          sx: d ** -0.9,
          draw: 1 - fk(e, o + 0.36 * i, s + 0.1, `inQuad`),
          alpha: 1 - fk(e, s - 0.1, c, `smooth`),
          turn: p,
          lean: r ? 0 : 0.12 * a * G(e, o, s),
        },
        gA(u(e), u(e + 0.02)),
        e < o * 0.85 ? { mouth: `o` } : { mood: `happy` },
        g,
      );
    },
    [
      xA(o, { step: 1, promote: !0, ascend: !0 }),
      xA(o + 0.28 * i, { step: 3, promote: !0, ascend: !0 }),
      xA(o + 0.56 * i, { step: 5, promote: !0, ascend: !0, last: !0 }),
      U.particle(o, `sparkle`),
      U.sound(o + 0.2 * i, `inkSwirl`),
      U.particle(o + 0.32, `note`),
      U.particle(o + 0.6, `star`),
      U.particle(s, `poof`),
      U.world(c, `vanished`),
    ],
    { idle: !1, hold: !0, label: `b-promoteOut` },
  );
}
function LA(e) {
  let { amp: t, seed: n } = hA(e),
    r = tk(n, 152, 0.05),
    i = rk(n, 153),
    a = 0.75 * r,
    o = 0.78 * r,
    s = o + 0.16,
    c = s + 0.85 * r,
    l = uk([
      [0, 1],
      [s - 0.01, 1],
      [s + 0.05, 1 - 0.16 * t, `outQuad`],
      [s + 0.18, 1 + 0.08 * t, `outQuad`],
      [s + 0.34, 1, `inOutSine`],
      [c, 1],
    ]);
  return bA(
    c,
    (e) => {
      let n = l(e),
        r;
      if (e >= s + 0.04)
        r = _A({
          rot: dk(e, s + 0.04, 0.45 * t * i, 2.9, 0.4),
          dy: 0.05 * t * G(e, s, s + 0.3),
        });
      else {
        let n = e < o ? 1 : 1 - H.inQuad(B((e - o) / (s - o), 0, 1));
        r = vA(
          e > s - 0.02 ? B((e - (s - 0.02)) / 0.06, 0, 1) : 0,
          pA(
            0.02 * Math.sin(QO * 1.6 * e) * (e < o),
            0.6561 + 0.36 * t * n,
            0.35 * i * n,
          ),
        );
      }
      return vk(
        {
          draw: fk(e, 0, a, `inOutSine`),
          sy: n,
          sx: 1 / n,
          lean: dk(e, s + 0.06, 0.08 * t * i, 2.6, 0.3),
        },
        gA(
          uA + 60 * t * G(e, s, c - 0.2),
          uA + 60 * t * G(e, s + 0.03, c - 0.2),
        ),
        e > s + 0.02 && e < c - 0.3 ? { mood: `victorious` } : {},
        r,
      );
    },
    [
      xA(s, { step: 1, promote: !0, last: !0 }),
      U.impact(s, `land`, { strength: 0.25 }),
      U.particle(s + 0.01, `ding`),
      U.particle(s + 0.1, `sparkle`),
    ],
    { idle: !1, label: `b-promoteIn` },
  );
}
function RA(e) {
  let { amp: t, seed: n } = hA(e),
    r = rk(n, 160),
    i = rk(n, 161),
    a = 5.2 * tk(n, 162, 0.08),
    o = 0.9,
    s = (e) => {
      let n = (QO * e) / a,
        i = o + 0.022 * t * Math.sin(n),
        s = 0.6 + 0.35 * (0.5 + 0.5 * Math.sin(n - 1.2));
      return vk(
        { sy: i, sx: 1 / i, lean: 0.08 * r + 0.012 * Math.sin(n) },
        { mood: `sleepy`, mouthScale: s },
      );
    },
    c = (e) =>
      _A({
        dy: -0.06 + 0.008 * Math.sin((QO * e) / a),
        rot: -0.42 * r + 0.03 * Math.sin((QO * e) / a + 1),
      }),
    l = 0.12,
    u = ey(
      bA(
        1,
        (e) => {
          let n = kv(s(e), fk(e, 0, 0.5)),
            a;
          if (e >= 0.72) {
            let n = fk(e, 0.72, 1, `smooth`),
              r = c(1).props.star;
            a = _A({
              dy: (r.dy ?? 0) * n,
              rot: (r.rot ?? 0) * n + dk(e, 0.74, 0.3 * t, 3, 0.25) * (1 - n),
            });
          } else {
            let n = B((e - l) / 0.58, 0, 1),
              s = e < l ? 0 : 4 * n * (1 - n),
              c = mA(o, 0, 0.08 * r),
              u = ov(0.4 * i, c[0], H.inOutSine(n)),
              d = ov(0.1, c[1], H.inQuad(n)) + 0.5 * t * s;
            a = vA(
              e > 0.6699999999999999
                ? B((e - 0.6699999999999999) / 0.05, 0, 1)
                : 0,
              pA(u, d, ov(0.7 * i, 0, n)),
            );
          }
          return vk(n, a);
        },
        [xA(0.7, { step: 1, steps: 1, soft: !0, nap: !0, last: !0 })],
        { hold: !0, label: `b-napping-intro` },
      ),
      ry(
        W(a, (e) => vk(s(e + 1), c(e + 1)), {
          events: bk(
            [U.particle(0.35 * a, `zzz`), U.particle(0.75 * a, `zzz`)].map(
              (e) => ({ ...e, at: (((e.at - 1) % a) + a) % a }),
            ),
            a,
          ),
          label: `b-napping`,
        }),
      ),
    );
  return (Ck.set(u, { period: a, intro: 1 }), u);
}
function zA(e) {
  let { amp: t, seed: n, red: r } = hA(e),
    i = tk(n, 170, 0.06) * (r ? 0.92 : 1),
    a = (e) => e * i,
    [o, s] = e.off,
    c = Math.hypot(o, s) || 1,
    l = -o / c,
    u = -s / c,
    d = e.facing || (l >= 0 ? 1 : -1),
    f = Math.min(0.85, c * 0.6),
    p = -l * f,
    m = -u * f,
    h = a(0.26),
    g = a(0.66),
    _ = a(0.88),
    v = a(1.06),
    y = a(1.52),
    b = a(1.8),
    x = 0.24 * t,
    S = g - h,
    C = (e) => {
      if (e >= h && e < g) {
        let t = (e - h) / S;
        return x * 4 * t * (1 - t);
      }
      return 0;
    },
    w = (e) => {
      if (e < h) return [o, s];
      if (e < g) {
        let t = (e - h) / S,
          n = 0.7 * t + 0.3 * H.inOutSine(t);
        return [ov(o, p, n), ov(s, m, n)];
      }
      if (e < v) return [p, m];
      let t = H.inOutSine(B((e - v) / (y - v), 0, 1));
      return [p * (1 - t), m * (1 - t)];
    },
    T = 0.78 * (0.5 + 0.5 * t),
    E = 0.5 * (0.5 + 0.5 * t),
    D = (e) => {
      if (e < g) return 0.04 * Math.sin(Math.PI * B((e - h) / S, 0, 1)) * t;
      if (e < _) return -E * H.inOutSine((e - g) / (_ - g));
      if (e < v) return ov(-E, T, H.inCubic((e - _) / (v - _)));
      let n = e - v;
      return T * Math.exp(-n / 0.3) * Math.cos(QO * 1.5 * n);
    },
    O = uk([
      [0, 1],
      [a(0.1), 1.05, `outQuad`],
      [a(0.24), 0.86, `inOutSine`],
      [h, 0.85],
      [h + S * 0.3, 1.13, `outCubic`],
      [g - S * 0.14, 1.03, `inOutSine`],
      [g, 1, `inQuad`],
      [g + a(0.06), 0.84, `outQuad`],
      [g + a(0.17), 1, `outQuad`],
      [_, 1.02, `inOutSine`],
      [v - a(0.04), 1.04, `linear`],
      [v + a(0.03), 0.85, `outQuad`],
      [v + a(0.15), 1.05, `outQuad`],
      [v + a(0.4), 1, `inOutSine`],
      [b, 1],
    ]),
    k = (e) =>
      uk([
        [0, uA],
        [a(0.24) + e, 38, `outQuad`],
        [h + S * 0.5 + e, 78, `outQuad`],
        [g + e, 48, `inOutSine`],
        [_ + e, 98, `inOutSine`],
        [v + a(0.05) + e, 118, `outQuad`],
        [v + a(0.4) + e, 58, `inOutSine`],
        [b, uA, `inOutSine`],
      ]),
    A = k(0),
    j = k(0.03),
    M = (e) => C(e) + sA * (O(e) - 1),
    N = pk(M, b, 3.2, 0.13);
  return {
    impactAt: v,
    action: bA(
      b,
      (e) => {
        let [n, r] = w(e),
          i = D(e),
          o = O(e),
          s = e >= g - 0.02 && e < b - 0.02,
          c = -d * i,
          l = e - v,
          u;
        u =
          e < a(0.22)
            ? {}
            : e < _ - a(0.1)
              ? { brow: `angry`, mouth: `flat` }
              : e < v
                ? { eye: `squeezed`, brow: `angry`, mouth: `flat` }
                : e < v + a(0.14)
                  ? { mood: `hurt`, mouth: `o` }
                  : e < v + a(0.55)
                    ? { mood: `dizzy` }
                    : e < b - 0.08
                      ? { eye: `closed`, mouth: `smile` }
                      : {};
        let f =
            e >= v ? 0.009 * t * Math.exp(-l / 0.3) * Math.sin(QO * 14 * l) : 0,
          p =
            dk(e, v, 0.6 * t * d, 3.2, 0.4) +
            dk(e, g, 0.3 * t * d, 3, 0.3) +
            (e >= _ - a(0.1) && e < v
              ? -0.35 * d * t * G(e, _ - a(0.1), v + 0.02)
              : 0),
          m =
            B((N(e) - M(e)) * 1.5, -0.07, 0.11) * t +
            0.08 * t * G(e, v, v + a(0.3));
        return vk(
          {
            x: n + f,
            y: r,
            lift: C(e),
            sy: o,
            sx: 1 / o,
            lean: c,
            pivot: s ? dA : void 0,
            footFollow: s ? fk(Math.abs(c), 0.03, 0.2) : void 0,
            look: {
              x:
                e > v + a(0.15) && e < v + a(0.6)
                  ? 0.8 * Math.sin(QO * 2.5 * (e - v))
                  : 0,
            },
          },
          gA(A(e), j(e)),
          u,
          _A({ rot: p, dy: m }),
        );
      },
      [
        xA(g, { step: 1, steps: 2, dfile: 0, last: !1 }),
        U.particle(g + 0.01, `ding`),
        U.sound(_ - a(0.04), `creak`),
        U.sound(_ + 0.03, `whoosh`),
        U.impact(v, `dink`, { strength: r ? 0.6 : 0.9 }),
        xA(v, { step: 2, steps: 2, hit: !0, strength: 1, last: !0 }),
        U.particle(v, `burst`),
        U.particle(v + 0.02, `ding`),
        U.particle(v + a(0.22), `ding`),
        U.particle(v + a(0.45), `note`),
        ...(r ? [] : [U.shake(v, 0.6, 0.25)]),
        xA(v + a(0.36), { step: 3, echo: !0, soft: !0 }),
        xA(v + a(0.7), { step: 4, echo: !0, soft: !0 }),
        U.particle(v + a(0.2), `orbit`),
      ],
      { idle: !1, label: `b-attack` },
    ),
  };
}
function BA(e) {
  let { amp: t, seed: n, red: r } = hA(e),
    i = B(Number.isFinite(e.strength) ? e.strength : 0.6, 0.15, 1),
    a = tk(n, 180, 0.06),
    o = (e) => e * a,
    s = Math.hypot(e.from[0], e.from[1]),
    c = s > 0.001 ? e.from[0] / s : 0,
    l = s > 0.001 ? e.from[1] / s : 1,
    u = { p: 0.9, n: 1, b: 1, r: 1.1, q: 1.15, k: 1.2 }[e.by] ?? 1,
    d = Math.abs(c) > 0.2 ? Math.sign(c) : rk(n, 181),
    f = (0.3 + 0.45 * i) * t * u * tk(n, 182, 0.1),
    p = o(0.1),
    m = o(0.62),
    h = o(1.5),
    g = o(0.12),
    _ = (e) => H.outCubic(B((e - o(0.02)) / (o(0.9) - o(0.02)), 0, 1)),
    v = (e) => c * f * _(e),
    y = (e) => l * f * _(e),
    b = (e) =>
      e >= p && e < m
        ? (0.1 + 0.16 * i) *
          t *
          u *
          4 *
          ((e - p) / (m - p)) *
          (1 - (e - p) / (m - p))
        : 0,
    x = (e) => dk(e, m, 0.11 * d, 3, o(0.45)),
    S = uk([
      [0, 0],
      [o(0.08), 0.1 * d, `outQuad`],
      [p + o(0.2), 0.7 * d, `inOutSine`],
      [m - 0.05, 1.3 * d, `inQuad`],
      [m, 1.36 * d, `outQuad`],
      [h, 1.36 * d],
    ]),
    C = uk([
      [0, 1],
      [o(0.04), 0.8, `outQuad`],
      [o(0.14), 1.06, `outQuad`],
      [o(0.3), 1, `inOutSine`],
      [m + o(0.04), 0.93, `outQuad`],
      [h, 0.96, `inOutSine`],
    ]),
    w = l * f * $O + 0.09,
    T = xk({
      x0: 0,
      y0: 0.6561,
      vx: (Math.abs(c) > 0.2 ? c : d * 0.7) * (0.9 + 0.8 * i) * t * u,
      vy: (2.7 + 2 * i) * t * u,
      g: 9.5,
      floor: w,
      e: 0.5,
      maxBounces: 3,
    });
  return bA(
    h,
    (e) => {
      let n = S(e),
        i = C(e),
        a = v(e),
        s = y(e),
        c =
          0.02 *
          t *
          Math.exp(-e / 0.35) *
          Math.sin(QO * 13 * e) *
          (1 - fk(e, p, m)),
        l = e - g,
        u = T(Math.max(0, l)),
        f;
      if (e < g - 0.02)
        f = _A({
          rot: 0.6 * t * d * Math.exp(-e / 0.2) * Math.sin(QO * 9 * e),
        });
      else {
        let t = e < g ? B(1 - (e - (g - 0.02)) / 0.02, 0, 1) : 0,
          n = u.bounces === 0 && u.vy !== 0,
          i = B(l / 0.9, 0, 1),
          o = r
            ? 0.2 * d
            : n
              ? -0.6 * d * Math.sin(QO * 1.3 * i)
              : dk(e, g + 0.9, 0.3 * d, 3.4, 0.25) + 0.25 * d;
        f = vA(t, pA(u.x - a, u.y - s * $O, o), {
          sx: r || !n ? 1 : yA(B(l / 0.8, 0, 1), 2.5),
        });
      }
      let _ =
        e < o(0.05)
          ? { mood: `surprised` }
          : e < p + o(0.2)
            ? { mood: `hurt` }
            : { mood: `dizzy` };
      return vk(
        {
          x: a + c,
          y: s,
          lift: b(e) + wk(n + x(e), i, 1 / i),
          sy: i,
          sx: 1 / i,
          lean: n + x(e),
          pivot: fA,
          contact: `ground`,
          footFollow: fk(Math.abs(n), 0.3, 0.9),
          bodyPose: e >= o(0.04) ? `hurt` : void 0,
        },
        gA(
          uA + 100 * G(e, o(0.02), o(0.6)) + 20,
          uA + 90 * G(e, o(0.04), o(0.6)) + 30 * fk(e, m, h),
        ),
        _,
        f,
      );
    },
    [
      xA(0.02, { hit: !0, strength: i, rung: !0 }),
      U.particle(0.02, `ding`),
      U.particle(o(0.14), `star`),
      U.sound(g, `starPop`),
      xA(m + 0.02, { soft: !0, echo: !0, strength: 0.6 * i }),
      U.particle(m + 0.03, `puff`),
      U.particle(o(0.28), `ding`),
      xA(m + o(0.32), { soft: !0, echo: !0, strength: 0.35 * i }),
      xA(m + o(0.62), { soft: !0, echo: !0, strength: 0.18 * i }),
      U.particle(o(1), `orbit`),
      U.world(h, `removed`),
    ],
    { idle: !1, hold: !0, label: `b-removed` },
  );
}
var VA = {
  rest: SA,
  entrance: wA,
  hover: TA,
  select: EA,
  nervous: DA,
  sleepy: OA,
  gag: kA,
  deselect: AA,
  move: (e) =>
    CA({
      off: e.off,
      facing: e.facing,
      dist: e.dist,
      reduced: e.reduced,
      seed: e.seed,
      promotes: e.promotes,
    }),
  attack: zA,
  removed: BA,
  napping: RA,
  checked: jA,
  victory: MA,
  defeat: NA,
  shrug: PA,
  promoteOut: IA,
  promoteIn: LA,
  refuse: FA,
};
var HA = (e) => (e === `b` ? VA : oA);
var UA = {
  kind: `p`,
  rest(e, t, n) {
    (ok(n, t), HA(t).rest(e, n));
  },
  entrance(e, t) {
    return HA(sk(t)).entrance(e, t);
  },
  hover(e) {
    return HA(sk(e)).hover(e);
  },
  select(e) {
    return HA(sk(e)).select(e);
  },
  nervous(e) {
    return HA(sk(e)).nervous(e);
  },
  sleepy(e) {
    return HA(sk(e)).sleepy(e);
  },
  gag(e) {
    return HA(sk(e)).gag(e);
  },
  deselect(e) {
    return HA(sk(e)).deselect(e);
  },
  move(e) {
    return HA(e.side).move(e);
  },
  attack(e) {
    return HA(e.side).attack(e);
  },
  removed(e) {
    return HA(e.side).removed(e);
  },
  napping(e) {
    return HA(sk(e)).napping(e);
  },
  checked(e) {
    return HA(sk(e)).checked(e);
  },
  victory(e) {
    return HA(sk(e)).victory(e);
  },
  defeat(e) {
    return HA(sk(e)).defeat(e);
  },
  shrug(e) {
    return HA(sk(e)).shrug(e);
  },
  promoteOut(e) {
    return HA(sk(e)).promoteOut(e);
  },
  promoteIn(e) {
    return HA(sk(e)).promoteIn(e);
  },
  refuse(e) {
    return HA(sk(e)).refuse(e);
  },
};
var WA = Math.sin((56 * Math.PI) / 180);
var q = Math.PI * 2;
var GA = (e) => (e ? 0.5 : 1);
function KA(e, t = 0) {
  let n = Number.isFinite(e) ? e : 0,
    r =
      (Math.floor(n * 4294967.296) ^
        Math.floor(n) ^
        Math.imul(t + 1, 2654435761)) >>>
      0;
  return (
    (r = Math.imul(r ^ (r >>> 16), 2246822507) >>> 0),
    (r = Math.imul(r ^ (r >>> 13), 3266489909) >>> 0),
    (r ^ (r >>> 16)) >>> 0
  );
}
var qA = (e, t = 0) => KA(e, t) / 4294967296;
function JA(e, t, n, r = 1 / 0) {
  let i = Math.floor(e * t + 1e-6);
  if (Number.isFinite(r)) {
    let e = Math.max(1, Math.round(t * r));
    i = ((i % e) + e) % e;
  }
  return qA(i, n) * 2 - 1;
}
var YA = (e, t, n) => Math.min(n - 1, Math.floor(qA(e, t) * n));
var XA = (e) => (e === void 0 ? H.smooth : typeof e == `function` ? e : H[e]);
function ZA(e) {
  let t = e.length;
  return t === 0
    ? () => 0
    : (n) => {
        if (!(n > e[0][0])) return e[0][1];
        if (n >= e[t - 1][0]) return e[t - 1][1];
        let r = 0;
        for (; r < t - 2 && e[r + 1][0] <= n;) r++;
        let i = e[r],
          a = e[r + 1],
          o = a[0] - i[0];
        return o <= 1e-9
          ? a[1]
          : i[1] + (a[1] - i[1]) * XA(a[2])((n - i[0]) / o);
      };
}
function QA(e, t, n, r, i) {
  return e <= t || e >= i
    ? 0
    : e < n
      ? H.smooth((e - t) / Math.max(1e-9, n - t))
      : e <= r
        ? 1
        : H.smooth((i - e) / Math.max(1e-9, i - r));
}
var $A = (e, t, n) =>
  e <= t || e >= n ? 0 : Math.sin((Math.PI * (e - t)) / (n - t)) ** 2;
var ej = (e, t, n, r, i, a = 0) => {
  let o = e - t;
  return o <= 0 ? 0 : n * Math.exp(-i * o) * Math.sin(q * r * o + a);
};
var tj = (e, t, n, r) => {
  let i = e - t;
  return i <= 0 || i >= n + r
    ? 0
    : i < n
      ? H.outQuad(i / n)
      : 1 - H.inOutSine((i - n) / r);
};
function nj(e, t, n = 0.16) {
  return (r) => {
    let i = e(r),
      a = r >= t - 1e-9;
    if (!a && (!i.props || r <= t - n)) return i;
    let o = a ? 0 : H.smooth((t - r) / n),
      s = { ...i };
    if (i.props) {
      let e = {};
      for (let [t, n] of Object.entries(i.props))
        e[t] = {
          ...n,
          ...(n.rot === void 0 ? {} : { rot: n.rot * o }),
          ...(n.dx === void 0 ? {} : { dx: n.dx * o }),
          ...(n.dy === void 0 ? {} : { dy: n.dy * o }),
        };
      s.props = e;
    }
    return (
      a &&
        (delete s.mood,
        delete s.eye,
        delete s.brow,
        delete s.mouth,
        delete s.blush,
        delete s.look),
      s
    );
  };
}
function J(e, t, n) {
  let r = (e[t] ??= {});
  (n.rot !== void 0 && (r.rot = (r.rot ?? 0) + n.rot),
    n.dx !== void 0 && (r.dx = (r.dx ?? 0) + n.dx),
    n.dy !== void 0 && (r.dy = (r.dy ?? 0) + n.dy),
    n.sx !== void 0 && (r.sx = (r.sx ?? 1) * n.sx),
    n.sy !== void 0 && (r.sy = (r.sy ?? 1) * n.sy),
    n.alpha !== void 0 && (r.alpha = (r.alpha ?? 1) * n.alpha),
    n.state !== void 0 && (r.state = n.state),
    n.hidden !== void 0 && (r.hidden = n.hidden),
    n.follow !== void 0 && (r.follow = n.follow));
}
function rj(e, t) {
  ((t.armL !== void 0 || t.armR !== void 0) &&
    (e.arm = {
      ...(t.armL === void 0 ? {} : { L: { deg: t.armL } }),
      ...(t.armR === void 0 ? {} : { R: { deg: t.armR } }),
    }),
    (t.footL !== void 0 || t.footR !== void 0) &&
      (e.foot = {
        ...(t.footL === void 0 ? {} : { L: { deg: t.footL } }),
        ...(t.footR === void 0 ? {} : { R: { deg: t.footR } }),
      }));
}
var ij = (e) => (e < 0.92 ? `squash` : e > 1.07 ? `stretch` : `idle`);
function aj(e, t) {
  return ZA(
    t === `tuck`
      ? [
          [0, 0, `outQuad`],
          [0.25, 112, `outQuad`],
          [0.8, 112],
          [1, 0, `inQuad`],
        ]
      : e === `front`
        ? [
            [0, 0],
            [0.16, 60, `outQuad`],
            [0.5, 112, `inOutSine`],
            [0.82, 66, `inOutSine`],
            [1, 0, `inQuad`],
          ]
        : [
            [0, 0],
            [0.22, 58, `outQuad`],
            [0.56, 112, `inOutSine`],
            [0.86, 62, `inOutSine`],
            [1, 0, `inQuad`],
          ],
  );
}
var oj = { bound: aj(`front`, `bound`), tuck: aj(`front`, `tuck`) };
var sj = { bound: aj(`hind`, `bound`), tuck: aj(`hind`, `tuck`) };
var cj = (e, t) => (n) => e(V((n - t) / (1 - t)));
function lj(e) {
  let { segs: t, A: n } = e,
    r = typeof e.dir == `function` ? e.dir : () => e.dir,
    i = t.length,
    a = [],
    o = [],
    s = e.lead;
  for (let e = 0; e < i; e++)
    (a.push(s), (s += t[e].air), o.push(s), (s += t[e].gap));
  let c = s,
    l = e.lead,
    u = 1 + (e.crouch - 1) * n,
    d = [[0, 1]];
  l > 0.02 && d.push([Math.max(0.01, l - 0.015), u, `inOutSine`]);
  for (let r = 0; r < i; r++) {
    let s = t[r],
      c = 1 + ((s.stretch ?? 1.12) - 1) * n,
      l = 1 + ((s.squat ?? 0.88) - 1) * n;
    if (
      (d.push([a[r], u, `linear`]),
      d.push([a[r] + Math.min(0.32 * s.air, 0.09), c, `outCubic`]),
      d.push([o[r] - 0.22 * s.air, 1 + (c - 1) * 0.3, `inOutSine`]),
      d.push([o[r], 1.02 + 0.03 * n, `inOutSine`]),
      r < i - 1)
    )
      ((u = l), d.push([o[r] + Math.min(0.5 * s.gap, 0.05), u, `outQuad`]));
    else {
      let t = s.gap,
        i = 1 + (e.over ?? 0.05) * n;
      d.push(
        [o[r] + Math.min(0.28 * t, 0.05), l, `outQuad`],
        [o[r] + 0.62 * t, i, `outQuad`],
        [o[r] + t, 1, `inOutSine`],
      );
    }
  }
  let f = ZA(
      d
        .map((e, t) => ({ p: e, k: t }))
        .sort((e, t) => e.p[0] - t.p[0] || e.k - t.k)
        .map((e) => e.p),
    ),
    p = [[0, 0]];
  l > 0.02 &&
    p.push([Math.max(0.01, l - 0.015), -(e.leadLean ?? 0.06) * n, `inOutSine`]);
  for (let r = 0; r < i; r++) {
    let s = t[r],
      c = (s.lean ?? 0.1) * n;
    (p.push(
      [a[r] + 0.3 * s.air, c * 0.7, `outQuad`],
      [a[r] + 0.62 * s.air, c, `inOutSine`],
      [o[r], -c * 0.35, `inOutSine`],
    ),
      r < i - 1
        ? p.push([
            o[r] + 0.6 * s.gap,
            -(e.leadLean ?? 0.06) * n * 0.5,
            `outQuad`,
          ])
        : p.push(
            [o[r] + 0.35 * s.gap, c * 0.3, `outQuad`],
            [o[r] + s.gap, 0, `inOutSine`],
          ));
  }
  let m = ZA(p.slice().sort((e, t) => e[0] - t[0])),
    h = (e) => {
      for (let t = 0; t < i; t++) if (e >= a[t] && e < o[t]) return t;
      return -1;
    },
    g = (e) => {
      if (i === 0) return [0, 0];
      if (e < a[0]) return t[0].a;
      for (let n = 0; n < i; n++) {
        let r = t[n];
        if (e < o[n]) {
          if (e < a[n]) return n === 0 ? r.a : t[n - 1].b;
          let i = (e - a[n]) / r.air;
          return [
            r.a[0] + (r.b[0] - r.a[0]) * i,
            r.a[1] + (r.b[1] - r.a[1]) * i,
          ];
        }
      }
      return t[i - 1].b;
    },
    _ = (e) => {
      let r = h(e);
      if (r < 0) return 0;
      let i = t[r],
        o = (e - a[r]) / i.air;
      return (i.hEnd ?? 0) * o + i.h * n * 4 * o * (1 - o);
    };
  return {
    duration: c,
    L: a,
    T: o,
    pos: g,
    lift: _,
    airAt: (e) => {
      let n = h(e);
      return n < 0 ? null : { i: n, u: (e - a[n]) / t[n].air };
    },
    sample: (e) => {
      let [n, i] = g(e),
        o = f(e),
        s = {
          x: n,
          y: i,
          lift: _(e),
          sy: o,
          sx: 1 / o,
          lean: r(e) * m(e),
          bodyPose: ij(o),
        },
        c = h(e);
      if (c >= 0) {
        let n = t[c],
          r = (e - a[c]) / n.air,
          i = n.legs ?? `bound`;
        if (i === `bound` || i === `tuck`) {
          let e = oj[i],
            t = sj[i];
          rj(s, {
            armL: e(r),
            armR: e(V(r - 0.03)),
            footL: t(V(r - 0.05)),
            footR: t(V(r - 0.07)),
          });
        } else if (i === `trot`) {
          let e = n.parity ?? c & 1,
            t = e === 0 ? 0 : 0.18,
            i = e === 0 ? 0.18 : 0;
          rj(s, {
            armL: cj(oj.bound, t)(r),
            footR: cj(sj.bound, t + 0.04)(r),
            armR: cj(oj.tuck, i)(r),
            footL: cj(sj.tuck, i + 0.04)(r),
          });
        }
      }
      return s;
    },
  };
}
function uj(e) {
  let t = Math.round(Math.abs(e[0]) * 1e3) / 1e3,
    n = Math.round(Math.abs(e[1]) * 1e3) / 1e3;
  return (t === 2 && n === 1) || (t === 1 && n === 2);
}
function dj(e) {
  let [t, n] = e;
  if (uj(e)) {
    let e = Math.abs(t) > Math.abs(n) ? [Math.sign(t), 0] : [0, Math.sign(n)];
    return [
      [t, n],
      [t - e[0], n - e[1]],
      [t - 2 * e[0], n - 2 * e[1]],
      [0, 0],
    ];
  }
  let r = Math.max(1, Math.min(8, Math.ceil(Math.hypot(t, n) - 1e-6))),
    i = [];
  for (let e = 0; e <= r; e++) {
    let a = 1 - e / r;
    i.push([t * a, n * a]);
  }
  return ((i[r] = [0, 0]), i);
}
function fj(e, t) {
  let n = 1;
  for (let r of t) {
    if (e < r.t0) return n;
    let t = V((e - r.t0) / Math.max(1e-6, r.t1 - r.t0));
    if (e < r.t1)
      return r.full
        ? n * Math.cos(q * H.inOutSine(t))
        : n * Math.cos(Math.PI * H.inOutSine(t));
    r.full || (n = -n);
  }
  return n;
}
var pj = 1;
var mj = (e, t) => {
  ((e.sy = (e.sy ?? 1) * t), (e.sx = (e.sx ?? 1) / t), (e.bodyPose = ij(e.sy)));
};
var hj = (e, t, n, r) => r * $A(e, t, t + n);
var gj = JA;
function _j(e, t) {
  e.pose = { ...e.pose, facing: pj, mood: `neutral` };
  let n = e.idle.cfg;
  (n.enabled &&
    ((n.breath &&= { ...n.breath, amp: 0.014, period: 2.9 }),
    (n.blink &&= { ...n.blink, gap: 2.8 }),
    (n.ears &&= { gap: [1.1, 3], angle: [0.16, 0.3] }),
    (n.look &&= { ...n.look, wander: 0.55, wanderGap: [1, 2.8] }),
    e.idle.reset()),
    e.refresh());
}
function vj(e, t, n, r) {
  if (!e) return () => pj;
  let i = n.length === 2 ? n[1] : { t0: r - 0.04, t1: r + 0.04 };
  return ZA([
    [0, t, `linear`],
    [i.t0, t, `linear`],
    [i.t1, pj, `linear`],
  ]);
}
function yj(e) {
  let t = GA(e.reduced),
    n = e.facing || pj,
    r = e.seed,
    i = dj(e.off),
    a = i.length - 1,
    o = n !== pj,
    s = 0.1,
    c = (e, t) => 1 + t * (qA(r, 40 + e) - 0.5),
    l = [];
  for (let e = 0; e < a; e++) {
    let t = e === a - 1;
    l.push({
      a: i[e],
      b: i[e + 1],
      air: (t ? 0.21 : 0.165) * c(e, 0.1),
      h: (t ? 0.3 : 0.17 + 0.03 * e) * c(e, 0.2),
      gap: t ? 0.17 : 0.05,
      squat: t ? 0.84 : 0.9,
      stretch: t ? 1.14 : 1.1,
      lean: t ? 0.12 : 0.09,
      legs: `bound`,
    });
  }
  let u = a - 1,
    d = [],
    f = -1,
    p = lj({ dir: pj, lead: s, crouch: 0.88, segs: l, A: t }),
    m = p.L[u],
    h = p.T[u],
    g = l[u].air;
  e.reduced
    ? o && (f = m + 0.5 * g)
    : o
      ? (d = [
          { t0: 0.015, t1: 0.095 },
          { t0: m + 0.14 * g, t1: h - 0.14 * g },
        ])
      : a >= 2 && (d = [{ t0: m + 0.1 * g, t1: h - 0.1 * g, full: !0 }]);
  let _ = vj(o, n, d, f),
    v = lj({ dir: _, lead: s, crouch: 0.88, leadLean: 0.07, segs: l, A: t }),
    y = v.duration,
    b = v.L,
    x = v.T,
    S = (e) => {
      let r = v.sample(e),
        i = _(e),
        o = 0.11 * QA(e, 0.02, 0.06, 0.08, 0.13);
      for (let t = 0; t < a; t++)
        o += 0.15 * tj(e, x[t], 0.03, 0.15) - 0.1 * $A(e, b[t], x[t]);
      let s = {};
      J(s, `head`, { rot: -i * o * t });
      for (let n = 0; n < a; n++) {
        let r = n % 3,
          i = 0.3 * t;
        ((r === 0 || r === 2) &&
          J(s, `earL`, { rot: hj(e, x[n] - 0.02, 0.17, i) }),
          (r === 1 || r === 2) &&
            J(s, `earR`, { rot: -hj(e, x[n] - 0.02, 0.17, i) }));
      }
      for (let n = 0; n < 6; n++) {
        let r = 0;
        for (let i = 0; i < a; i++)
          r += ej(
            e,
            x[i] + 0.012 * n,
            -0.12 * t * (i === u ? 1.5 : 1),
            4.2,
            6,
            0,
          );
        J(s, `mane${n}`, { rot: r });
      }
      return (
        (r.props = s),
        d.length && (r.turn = fj(e, d)),
        f >= 0 && e < f && (r.facing = n),
        e < b[0] && (r.look = { x: n * 0.8, y: 0.15 }),
        e >= b[0] - 0.01 && e < y - 0.14 && (r.mood = `happy`),
        r
      );
    },
    C = [];
  for (let e = 0; e < a; e++)
    (C.push(U.sound(b[e], `hop`)),
      e < u &&
        C.push(
          U.sound(x[e], `hoof`),
          U.particle(x[e], `dust`, { u: -0.1, v: 0 }),
        ));
  C.push(
    U.impact(x[u], `land`, { strength: 0.5 * t + 0.1 }),
    U.particle(x[u], `dust`, { u: 0, v: 0 }),
  );
  for (let e = 0; e < 3; e++)
    C.push(
      U.particle(x[u] + 0.02 + 0.035 * e, e === 1 ? `leafG` : `leafR`, {
        u: -0.05 + 0.1 * e,
        v: 0.75,
        n: 1,
      }),
    );
  return W(y, nj(S, y), {
    events: C,
    idle: { blink: !1, look: !1 },
    label: `foal.move`,
  });
}
var bj = { p: 0.3, n: 0.46, b: 0.36, r: 0.42, q: 0.46, k: 0.56 };
function xj(e) {
  let t = GA(e.reduced),
    n = e.facing || pj,
    r = e.off,
    i = e.victim,
    a = (i ? bj[i] : 0.36) * (0.6 + 0.4 * t),
    o = n !== pj,
    s = 0.2,
    c = 0.48,
    l = 0.42 * (0.9 + 0.1 * B(e.dist / 2.24, 0.4, 1.6)),
    u = c + l,
    d = u + 0.08,
    f = d + 0.42,
    p = f + 0.4,
    m = Math.hypot(r[0], r[1]) || 1,
    h = r[0] / m,
    g = r[1] / m,
    _ = (0.5 + 0.06 * B(e.dist, 0.5, 3)) * t + 0.1,
    v = e.reduced
      ? []
      : o
        ? [
            { t0: 0.03, t1: 0.15 },
            { t0: d + 0.1, t1: d + 0.26 },
          ]
        : [{ t0: d + 0.06, t1: d + 0.3, full: !0 }],
    y = e.reduced && o ? d + 0.15 : -1,
    b = vj(o, n, v, y),
    x = ZA([
      [0, 1],
      [0.1, 1.04, `outQuad`],
      [s, 1.02, `inOutSine`],
      [0.44, 1 - 0.14 * t, `inOutSine`],
      [c, 1 - 0.14 * t, `linear`],
      [0.55, 1 + 0.14 * t, `outCubic`],
      [u - 0.12, 1.05, `inOutSine`],
      [u, 1, `inOutSine`],
      [u + 0.03, 1 - 0.22 * t, `outQuad`],
      [d, 1 - 0.22 * t, `linear`],
      [d + 0.07, 1 + 0.16 * t, `outCubic`],
      [f - 0.1, 1.06, `inOutSine`],
      [f, 1.03, `inOutSine`],
      [f + 0.05, 1 - 0.18 * t, `outQuad`],
      [f + 0.13, 1.05, `outQuad`],
      [f + 0.2, 1.06, `inOutSine`],
      [p - 0.05, 1.03, `inOutSine`],
      [p, 1, `inOutSine`],
    ]),
    S = ZA([
      [0, 0],
      [s, 0.03, `outQuad`],
      [0.43, -0.16 * t, `inOutSine`],
      [0.58, -0.2 * t, `outCubic`],
      [c + l * 0.5, 0, `inOutSine`],
      [u - 0.06, 0.26 * t, `inQuad`],
      [u + 0.02, 0.04, `outQuad`],
      [d, 0.02, `linear`],
      [d + 0.14, -0.3 * t, `outQuad`],
      [f - 0.05, 0.1 * t, `inOutSine`],
      [f + 0.12, -0.42 * t, `outBack`],
      [p - 0.24, -0.4 * t, `linear`],
      [p, 0, `inOutCubic`],
    ]),
    C = ZA([
      [0, 0],
      [s, -0.1, `outQuad`],
      [0.43, 0.16, `inOutSine`],
      [0.5599999999999999, -0.22, `outCubic`],
      [u - 0.14, 0.05, `inOutSine`],
      [u - 0.02, 0.24, `inQuad`],
      [d + 0.04, 0.3, `outQuad`],
      [d + 0.16, -0.24, `outQuad`],
      [f - 0.05, 0.08, `inOutSine`],
      [f + 0.1, -0.2, `outQuad`],
      [p, 0, `inOutSine`],
    ]),
    w = ZA([
      [0, 0],
      [c, 0, `linear`],
      [c + l * 0.14, 62, `outQuad`],
      [c + l * 0.5, 112, `inOutSine`],
      [c + l * 0.8, 70, `inOutSine`],
      [u, 10, `inQuad`],
      [d, 12, `linear`],
      [d + 0.1, 112, `outQuad`],
      [f - 0.14, 100, `linear`],
      [f - 0.02, 20, `inQuad`],
      [f, 0],
    ]),
    T = ZA([
      [0, 0],
      [c, 0, `linear`],
      [c + l * 0.18, 58, `outQuad`],
      [c + l * 0.52, 112, `inOutSine`],
      [c + l * 0.84, 62, `inOutSine`],
      [u, 16, `inQuad`],
      [d, 18, `linear`],
      [d + 0.1, 112, `outQuad`],
      [f - 0.13, 100, `linear`],
      [f - 0.01, 24, `inQuad`],
      [f, 0],
    ]),
    E = (e) => {
      if (e >= c && e < u) {
        let t = (e - c) / l;
        return a * t + _ * 4 * t * (1 - t);
      }
      if (e >= u && e < d) return a - 0.03 * $A(e, u, d + 0.02);
      if (e >= d && e < f) {
        let n = (e - d) / (f - d);
        return (
          a * (1 - n) +
          (0.42 * t + 0.16) * 4 * n * (1 - n) -
          a * 0.25 * $A(n, 0.7, 1)
        );
      }
      return 0;
    },
    D = (e) => (e <= c ? 1 : e >= u ? 0 : 1 - (e - c) / l),
    O = (e) => 0.05 * QA(e, 0.15, 0.44, 0.479, 0.53),
    k = (e) => 0.14 * t * $A(e, d, f),
    A = (e) => {
      let i = b(e),
        a = D(e),
        o = O(e),
        d = x(e),
        m = {
          x: r[0] * a + h * o - i * k(e),
          y: r[1] * a + g * o,
          lift: E(e),
          sy: d,
          sx: 1 / d,
          lean: i * S(e),
          bodyPose: ij(d),
        };
      e > f &&
        e < p &&
        (m.pivot = [-0.27 * QA(e, f, f + 0.08, p - 0.16, p), 0]);
      let _ = {};
      (J(_, `head`, { rot: -i * C(e) * t }),
        J(_, `earL`, { rot: hj(e, u, 0.2, 0.3 * t) + hj(e, f, 0.2, 0.3 * t) }),
        J(_, `earR`, {
          rot: -hj(e, u + 0.03, 0.2, 0.3 * t) - hj(e, f + 0.04, 0.2, 0.3 * t),
        }));
      for (let n = 0; n < 6; n++)
        J(_, `mane${n}`, {
          rot:
            ej(e, u + 0.012 * n, -0.2 * t, 4.5, 5) +
            ej(e, f + 0.012 * n, -0.15 * t, 4.2, 5) +
            (e > c && e < u ? -0.16 * t * $A(e, c, u) : 0),
        });
      (J(_, `tail`, { rot: ej(e, c, 0.2 * t, 3, 4) }),
        (m.props = _),
        v.length && (m.turn = fj(e, v)),
        y >= 0 && e < y && (m.facing = n));
      let A = (t, n, r) =>
        e > t && e < n ? r * Math.sin((Math.PI * (e - t)) / (n - t)) : 0;
      if (e >= c && e < f)
        rj(m, {
          armL: w(e),
          armR: w(B(e - 0.02, 0, p)),
          footL: T(e),
          footR: T(B(e - 0.03, 0, p)),
        });
      else if (e > 0.2 && e < c) {
        let e = A(0.24, 0.32, 38) + A(0.4, 0.47, 34),
          t = A(0.29, 0.37, 38);
        (e > 0.5 || t > 0.5) &&
          rj(m, { armL: e > 0.5 ? e : void 0, armR: t > 0.5 ? t : void 0 });
      }
      return (
        e < 0.03
          ? ((m.brow = `raised`), (m.look = { x: n * 0.9, y: 0.1 }))
          : e < s
            ? ((m.brow = `raised`),
              (m.look = { x: n * 0.9, y: 0.1 }),
              (m.eye = `wide`))
            : e < c + l * 0.35
              ? (m.mood = `angry`)
              : e < u - 0.06
                ? (m.mood = `smug`)
                : e < u
                  ? (m.mood = `angry`)
                  : e < f - 0.02
                    ? (m.mood = `happy`)
                    : e < p - 0.12 && (m.mood = `smug`),
        m
      );
    },
    j = [
      U.particle(0.05, `exclaim`, { u: 0.25, v: 0.95 }),
      U.sound(0.06, `nicker`),
      U.sound(0.26, `hoof`),
      U.particle(0.27, `dust`, { u: -0.15, v: 0 }),
      U.sound(0.34, `hoof`),
      U.particle(0.35, `dust`, { u: -0.15, v: 0 }),
      U.sound(0.42, `hoof`),
      U.particle(0.43, `dust`, { u: -0.15, v: 0 }),
      U.sound(c, `hop`),
      U.particle(c, `dust`, { u: -0.2, v: 0 }),
      U.particle(0.5, `speed`, { u: -0.4, v: 0.5 }),
      U.impact(u, `dink`, { strength: 0.85 * t + 0.15 }),
      U.sound(u, `stamp`),
      U.particle(u, `burst`, { u: 0, v: a }),
      U.particle(u + 0.01, `star`, { u: 0.1, v: a + 0.1 }),
      U.sound(d + 0.1, `hop`),
      U.particle(d + 0.24, `sparkle`, { u: 0, v: 0.9 }),
      U.sound(f, `hoof`),
      U.particle(f, `dust`, { u: 0, v: 0 }),
      U.particle(f + 0.02, `leafR`, { u: -0.1, v: 0.75 }),
      U.particle(f + 0.06, `leafG`, { u: 0, v: 0.8 }),
      U.particle(f + 0.1, `leafR`, { u: 0.1, v: 0.75 }),
      U.sound(f + 0.08, `whinny`),
    ];
  return {
    action: W(p, nj(A, p), {
      events: j,
      idle: { blink: !1, look: !1 },
      label: `foal.attack`,
    }),
    impactAt: u,
  };
}
function Sj(e) {
  let t = GA(e.reduced),
    n = B(e.strength, 0.2, 1),
    r = e.from[0],
    i = e.from[1],
    a = (Math.abs(r) >= 0.35 ? Math.sign(r) : -1) === pj,
    o = 1.5,
    s = 0.1,
    c = 0.96,
    l = 0.3 * n * t,
    u = ZA([
      [0, 0],
      [s, 0, `linear`],
      [0.6699999999999999, 1, `outCubic`],
      [o, 1],
    ]),
    d = ZA([
      [0, 0],
      [s, 0],
      [0.42, (a ? 1 : -1) * 0.22 * t, `outQuad`],
      [0.6, (a ? -1 : 1) * 0.16 * t, `inOutSine`],
      [0.74, (a ? 1 : -1) * 0.3, `inOutSine`],
      [c, (a ? 1 : -1) * (a ? 1.5 : 1.7), `inQuad`],
      [1.12, (a ? 1 : -1) * (a ? 1.44 : 1.62), `outQuad`],
      [o, (a ? 1 : -1) * (a ? 1.46 : 1.65), `inOutSine`],
    ]),
    f = (e) => V((e - 0.7) / 0.2);
  return W(
    o,
    (e) => {
      let o = pj,
        p = {};
      tj(e, 0, s, 0.3) * n;
      let m = 1 - 0.25 * t * (e < s ? H.outQuad(e / s) : 0) * n;
      if (
        (e >= s && (m = 1 - 0.25 * t * n * (1 - H.outBack(V((e - s) / 0.22)))),
        e >= 0.32 && (m = 1),
        (p.sy = B(m, 0.55, 1.2)),
        (p.sx = 1 / p.sy),
        (p.x = r * l * u(e)),
        (p.y = i * l * 0.6 * u(e)),
        (p.lean = o * d(e)),
        e >= 0.7 &&
          ((p.pivot = [o * (a ? 0.05 : -0.15) * f(e), 0]),
          (p.contact = `ground`)),
        (p.bodyPose =
          e < 0.05 || e < 0.32 ? `hurt` : e < 0.7 ? ij(p.sy) : `hurt`),
        e >= 0.7 && (p.footFollow = f(e)),
        (p.mood = e < 0.05 || e < 0.4 ? `hurt` : `dizzy`),
        e >= 0.3)
      ) {
        let t = QA(e, 0.3, 0.42, 0.9, 1.2),
          n = H.smooth(V((e - 1.02 + 0.12) / 0.4)),
          r = 30 * t * Math.sin(q * 3.2 * (e - 0.3)),
          i = 60 * t * (1 - n) + 115 * n;
        rj(p, {
          armL: B(i + r, 0, 120),
          armR: B(i - r, 0, 120),
          footL: B(i * 0.9 - r, 0, 120),
          footR: B(i * 0.9 + r, 0, 120),
        });
      }
      let h = {};
      (J(h, `head`, {
        rot: -1 * (0.15 * $A(e, 0, 0.4) * -1 + 0.2 * QA(e, 0.5, 0.7, 2, 2)),
      }),
        J(h, `earL`, {
          rot: 0.2 * Math.sin(q * 4 * e) * QA(e, 0.4, 0.5, 0.9, 1.3),
        }),
        J(h, `earR`, {
          rot: -0.2 * Math.sin(q * 4 * e + 1) * QA(e, 0.4, 0.5, 0.9, 1.3),
        }));
      for (let n = 0; n < 6; n++)
        J(h, `mane${n}`, { rot: ej(e, c + 0.012 * n, -0.25 * t, 4, 5) });
      return ((p.props = h), p);
    },
    {
      events: [
        U.sound(0.02, `oof`),
        U.particle(0.03, `star`, { u: 0.1, v: 0.9 }),
        U.particle(0.44, `orbit`, { u: 0.2, v: 0.85 }),
        U.particle(c, `dust`, { u: -0.1, v: 0 }),
        U.sound(c, `thud`),
        U.particle(0.98, `leafR`, { u: -0.1, v: 0.5 }),
        U.particle(1.02, `leafG`, { u: 0.1, v: 0.5 }),
        U.world(o, `removed`),
      ],
      idle: !1,
      label: `foal.removed`,
    },
  );
}
var Cj = (e, t, n = [], r) => W(e, t, { events: n, idle: r, label: `foal` });
var wj = (e, t, n = [], r) => Cj(e, nj(t, e), n, r);
var Tj = (e, t) => (t <= 0 ? 1 : H.outBack(V(e / t)));
function Ej(e, t, n) {
  let r = e / t,
    i = {};
  (mj(i, 1 + 0.03 * n + 0.008 * Math.sin(q * 2 * r) * n),
    (i.lift = 0.018 * n * (0.6 + 0.4 * Math.sin(q * 2 * r - 1.2))),
    (i.lean = pj * 0.045 * n),
    (i.brow = `raised`));
  let a = {};
  (J(a, `earL`, { rot: 0.2 * n * Math.sin(q * 2 * r) }),
    J(a, `earR`, { rot: 0.2 * n * Math.sin(q * 2 * r + Math.PI) }),
    J(a, `tail`, { rot: 0.22 * n * Math.sin(q * 2 * r + 1) }));
  let o = ZA([
    [0.08, 0],
    [0.16, 42, `outQuad`],
    [0.24, 8, `inQuad`],
    [0.32, 42, `outQuad`],
    [0.4, 8, `inQuad`],
    [0.48, 0, `outQuad`],
  ])(r);
  return (
    J(a, `head`, { rot: -1 * (-0.05 * n + 0.05 * $A(r, 0.1, 0.5)) }),
    r > 0.08 && r < 0.48 && n > 0.5 && ((i.lift = 0), rj(i, { armR: o })),
    (i.props = a),
    i
  );
}
function Dj(e) {
  let t = 1.6,
    n = GA(e.reduced),
    r = 0.22;
  return ey(
    Cj(r, (e) => Oj(Ej(e, t, Tj(e, r)), n), [U.sound(0.05, `nicker`)]),
    ry(Cj(t, (e) => Oj(Ej(e, t, 1), n))),
  ).named(`foal.hover`);
}
function Oj(e, t) {
  return t === 1 ? e : kj(e, t);
}
function kj(e, t) {
  let n = { ...e };
  if (
    (n.lift !== void 0 && (n.lift *= t),
    n.lean !== void 0 && (n.lean *= t),
    n.sy !== void 0 && ((n.sy = 1 + (n.sy - 1) * t), (n.sx = 1 / n.sy)),
    n.props)
  ) {
    let e = {};
    for (let [r, i] of Object.entries(n.props))
      e[r] = { ...i, ...(i.rot === void 0 ? {} : { rot: i.rot * t }) };
    n.props = e;
  }
  return n;
}
function Aj(e, t, n, r) {
  let i = e / t,
    a = {},
    o = 0.02 * Math.sin(q * i);
  if (
    ((a.lift = 0.15 * r + o * r),
    mj(a, 1 + 0.03 * r * (1 + 0.5 * Math.sin(q * i + 1))),
    (a.lean = pj * 0.05 * Math.sin(q * i + 1.4) * r),
    (a.eye = `wide`),
    (a.mouth = `grin`),
    r > 0.15)
  ) {
    let e = Math.sin(q * i);
    rj(a, {
      armL: 24 * r + 14 * e * r,
      armR: 24 * r - 14 * e * r,
      footL: 30 * r + 14 * Math.sin(q * i + 2.2) * r,
      footR: 30 * r - 14 * Math.sin(q * i + 2.2) * r,
    });
  }
  let s = {};
  return (
    J(s, `earL`, { rot: 0.24 * n * Math.sin(q * 2 * i) }),
    J(s, `earR`, { rot: 0.24 * n * Math.sin(q * 2 * i + Math.PI) }),
    J(s, `tail`, { rot: 0.3 * n * Math.sin(q * i + 0.5) }),
    J(s, `head`, { rot: 0.06 * n }),
    (a.props = s),
    a
  );
}
function jj(e) {
  let t = 1.1,
    n = GA(e.reduced);
  return ey(
    Cj(
      0.26,
      (e) => {
        let r = $A(e, 0, 0.11),
          i = H.outBack(V((e - 0.09) / 0.17)),
          a = Aj(e, t, H.smooth(V((e - 0.08) / 0.15)), i);
        return (mj(a, 1 - 0.1 * r * n + 0.06 * $A(e, 0.1, 0.22)), Oj(a, n));
      },
      [U.sound(0.1, `hop`), U.particle(0.1, `sparkle`, { u: 0.1, v: 0.9 })],
    ),
    ry(Cj(t, (e) => Oj(Aj(e, t, 1, 1), n))),
  ).named(`foal.select`);
}
function Mj(e) {
  let t = 1.5,
    n = GA(e.reduced);
  return ry(
    Cj(
      t,
      (e) => {
        let r = e / t,
          i = {};
        ((i.mood = `worried`),
          (i.x = 0.006 * gj(e, 14, 1) * n),
          (i.lean = pj * (0.012 * gj(e, 14, 2) - 0.03) * n),
          mj(i, 1 - 0.03 * n + 0.01 * Math.sin(q * 2 * r)),
          (i.look = {
            x:
              0.65 *
              (Math.sin(q * r * 2) > 0.2
                ? 1
                : Math.sin(q * r * 2) < -0.2
                  ? -1
                  : 0),
            y: -0.2,
          }));
        let a = {};
        (J(a, `head`, { rot: -0.08 * n }),
          J(a, `tail`, { rot: 0.2 * gj(e, 10, 5) * n }),
          (i.props = a));
        let o = $A(r, 0.08, 0.32),
          s = $A(r, 0.55, 0.8);
        return (
          (o > 0.02 || s > 0.02) &&
            rj(i, {
              armL: o > 0.02 ? 28 * o : void 0,
              armR: s > 0.02 ? 28 * s : void 0,
            }),
          i
        );
      },
      [
        U.particle(0.2 * t, `sweat`, { u: 0.3, v: 0.8 }),
        U.sound(0.62 * t, `snort`),
      ],
      { blink: !0, look: !1 },
    ),
  ).named(`foal.nervous`);
}
function Nj(e) {
  let t = 6.6,
    n = GA(e.reduced);
  return ry(
    Cj(
      t,
      (e) => {
        let r = {},
          i = {},
          a = QA(e, 0.25, 0.7, 1.3, 1.75),
          o = QA(e, 1.9, 2.5, 4.9, 5.05),
          s = tj(e, 5, 0.1, 0.5),
          c = QA(e, 5.5, 5.7, 6.1, 6.5),
          l = ZA([
            [0, 0],
            [2.1, 0.05, `smooth`],
            [3.4, 0.3, `inOutSine`],
            [4.9, 0.46, `inSine`],
            [5, 0.46, `linear`],
            [5.1, -0.14, `outQuad`],
            [5.6, 0, `inOutSine`],
            [t, 0],
          ]);
        return (
          (r.lean =
            pj *
            (0.05 * Math.sin((q * e) / 3.3) * o - 0.07 * a + 0.03 * s * 0) *
            n),
          mj(r, 1 + 0.045 * a * n - 0.03 * o * n + 0.05 * s * n),
          (r.lift = 0.04 * s * n),
          J(i, `head`, { rot: -1 * (l(e) * n) + pj * 0.3 * a * n }),
          a > 0.05
            ? ((r.mouth = `open`), (r.eye = `squeezed`))
            : o > 0.05 && s < 0.05 && (r.mood = `sleepy`),
          (s > 0.05 || (e > 5 && e < 5.5)) &&
            ((r.eye = `wide`), (r.brow = `raised`), (r.mouth = `o`)),
          (r.look = { x: 0.7 * Math.sin(q * 2.2 * (e - 5.5)) * c * n, y: 0 }),
          J(i, `earL`, { rot: 0.25 * $A(e, 5.05, 5.4) * n }),
          J(i, `earR`, { rot: -0.25 * $A(e, 5.08, 5.45) * n }),
          (r.props = i),
          r
        );
      },
      [
        U.sound(0.7, `yawn`),
        U.particle(2.6, `zzz`, { u: 0.3, v: 0.85 }),
        U.particle(4, `zzz`, { u: 0.3, v: 0.85 }),
        U.sound(5.05, `snort`),
        U.particle(5.08, `exclaim`, { u: 0.25, v: 0.95 }),
      ],
      { look: !1, blink: !1 },
    ),
  ).named(`foal.sleepy`);
}
function Pj(e) {
  let t = GA(e.reduced),
    n = YA(e.seed, 7, 3);
  return n === 0
    ? wj(
        1.6,
        (e) => {
          let n = {},
            r = {};
          ((n.eye = `half`), (n.mouth = `flat`), (n.brow = `neutral`));
          let i = (t) =>
              e > t && e < t + 0.32
                ? Math.sin((Math.PI * (e - t)) / 0.32) ** 1.5
                : 0,
            a = i(0.25),
            o = i(0.6),
            s = i(0.95);
          return (
            rj(n, {
              armL: a > 0.02 ? 44 * a : void 0,
              armR: o > 0.02 ? 44 * o : void 0,
            }),
            s > 0.02 && rj(n, { armL: 44 * s, armR: 44 * s * 0.6 }),
            mj(
              n,
              1 -
                0.03 *
                  t *
                  ($A(e, 0.36, 0.5) + $A(e, 0.71, 0.85) + $A(e, 1.06, 1.2)),
            ),
            (n.lean = pj * -0.04 * QA(e, 0.1, 0.3, 1.2, 1.5) * t),
            J(r, `head`, {
              rot:
                -1 *
                (0.05 +
                  0.08 * $A(e, 0.3, 0.5) +
                  0.08 * $A(e, 0.65, 0.85) +
                  0.1 * $A(e, 1, 1.2)) *
                t,
            }),
            J(r, `earL`, { rot: 0.25 * QA(e, 0.2, 0.3, 1.3, 1.5) * t }),
            J(r, `earR`, { rot: -0.25 * QA(e, 0.2, 0.3, 1.3, 1.5) * t }),
            (n.look = { x: 0.7 * QA(e, 1.15, 1.25, 1.45, 1.6) * t, y: 0.1 }),
            (n.props = r),
            n
          );
        },
        [
          U.sound(0.42, `hoof`),
          U.particle(0.43, `dust`, { u: 0.2, v: 0 }),
          U.sound(0.77, `hoof`),
          U.particle(0.78, `dust`, { u: 0.2, v: 0 }),
          U.sound(1.12, `hoof`),
          U.particle(1.13, `dust`, { u: 0.2, v: 0 }),
          U.sound(1.3, `huff`),
        ],
        { look: !1 },
      ).named(`foal.gag.stamp`)
    : n === 1
      ? wj(
          1.35,
          (e) => {
            let n = {},
              r = {},
              i = QA(e, 0.1, 0.18, 0.55, 1),
              a = q * 5.2 * (e - 0.1);
            ((n.mood = `happy`),
              J(r, `head`, { rot: 0.32 * Math.sin(a) * i * t }),
              (n.lean = pj * 0.05 * Math.sin(a - 0.8) * i * t),
              (n.x = 0.01 * Math.sin(a) * i * t),
              mj(n, 1 - 0.02 * i * t));
            for (let e = 0; e < 6; e++)
              J(r, `mane${e}`, { rot: -0.28 * Math.sin(a - 0.5 * e) * i * t });
            return (
              J(r, `forelock`, { rot: 0.4 * Math.sin(a - 0.3) * i * t }),
              J(r, `earL`, { rot: 0.3 * Math.sin(a + 1) * i * t }),
              J(r, `earR`, { rot: 0.3 * Math.sin(a + 2) * i * t }),
              (n.props = r),
              n
            );
          },
          [
            U.sound(0.12, `rustle`),
            U.particle(0.3, `leafR`, { u: -0.1, v: 0.8 }),
            U.particle(0.42, `leafG`, { u: 0, v: 0.8 }),
            U.particle(0.55, `leafR`, { u: -0.2, v: 0.7 }),
            U.particle(0.7, `leafG`, { u: 0.1, v: 0.75 }),
          ],
          { look: !1 },
        ).named(`foal.gag.shake`)
      : wj(
          1.9,
          (n) => {
            let r = {},
              i = {};
            return (
              !e.reduced &&
                n > 0.5 &&
                n < 1.05 &&
                (r.turn = Math.cos(q * H.inOutSine(V((n - 0.5) / 0.55)) * 2)),
              (r.lift = 0.05 * t * ($A(n, 0.45, 0.8) + $A(n, 0.8, 1.1))),
              mj(
                r,
                1 +
                  0.06 * t * ($A(n, 0.42, 0.7) - $A(n, 0.35, 0.5) * 0.6) -
                  0.06 * t * $A(n, 1.05, 1.25),
              ),
              (r.look = { x: -0.9 * QA(n, 0.1, 0.3, 0.5, 0.7), y: 0 }),
              J(i, `head`, { rot: pj * 0.2 * QA(n, 0.15, 0.3, 0.45, 0.6) * t }),
              (r.lean =
                pj * -0.08 * QA(n, 0.1, 0.3, 0.45, 0.6) * t +
                pj *
                  0.12 *
                  Math.sin(q * 2.2 * (n - 1.1)) *
                  QA(n, 1.1, 1.15, 1.4, 1.9) *
                  t),
              J(i, `tail`, {
                rot: 0.5 * Math.sin(q * 5 * n) * QA(n, 0.2, 0.3, 1, 1.2) * t,
              }),
              (r.mood = n < 1.1 ? `happy` : n < 1.7 ? `dizzy` : `happy`),
              (r.props = i),
              r
            );
          },
          [
            U.sound(0.5, `hop`),
            U.particle(1.15, `orbit`, { u: 0.2, v: 0.85 }),
            U.sound(1.2, `giggle`),
          ],
          { look: !1, blink: !1 },
        ).named(`foal.gag.tail`);
}
function Fj(e) {
  let t = GA(e.reduced),
    n = 0.55;
  return wj(
    n,
    (e) => {
      let r = {},
        i = H.inQuad(V(e / 0.16));
      r.lift = 0.15 * (1 - i);
      let a = +(e >= 0.16);
      if (
        (mj(
          r,
          1 +
            (ZA([
              [0, 1.03],
              [0.1, 1.06, `outQuad`],
              [0.16, 1.02, `inQuad`],
              [0.21, 0.86, `outQuad`],
              [0.32, 1.05, `outQuad`],
              [0.42, 1, `inOutSine`],
              [n, 1],
            ])(e) -
              1) *
              t,
        ),
        !a)
      ) {
        let e = 1 - i;
        rj(r, { armL: 24 * e, armR: 24 * e, footL: 30 * e, footR: 30 * e });
      }
      ((r.lean = pj * (-0.04 * $A(e, 0.05, 0.3)) * t),
        e < 0.45 && (r.mood = `happy`));
      let o = {};
      (J(o, `earL`, { rot: hj(e, 0.17, 0.2, 0.28 * t) }),
        J(o, `earR`, { rot: -hj(e, 0.2, 0.2, 0.28 * t) }),
        J(o, `head`, { rot: -0.12 * $A(e, 0.15, 0.4) * t }));
      for (let n = 0; n < 6; n++)
        J(o, `mane${n}`, { rot: ej(e, 0.17 + 0.012 * n, -0.14 * t, 4.2, 6) });
      return ((r.props = o), r);
    },
    [
      U.sound(0.17, `hoof`),
      U.particle(0.17, `dust`, { u: 0, v: 0 }),
      U.particle(0.2, `puff`, { u: 0.3, v: 0.6 }),
    ],
    { look: !1 },
  );
}
function Ij(e) {
  let t = 3.4,
    n = GA(e.reduced);
  return ry(
    Cj(
      t,
      (e) => {
        let r = e / t,
          i = {},
          a = {};
        ((i.contact = `ground`), (i.bodyPose = `squash`), (i.mood = `sleepy`));
        let o = 0.85 + 0.022 * Math.sin(q * r) * n;
        ((i.sy = o),
          (i.sx = 1.1 - ((0.06 * (o - 0.85)) / 0.022) * 0.3 * 0),
          (i.sx = 1.1 - (o - 0.85) * 1.6),
          rj(i, { armL: 115, armR: 115, footL: 115, footR: 115 }),
          J(a, `head`, { rot: -1 * (0.45 + 0.03 * Math.sin(q * r - 0.6)) }),
          J(a, `earL`, { rot: 0.14 * $A(r, 0.3, 0.42) }),
          J(a, `tail`, { rot: 0.3 * $A(r, 0.62, 0.82) }));
        for (let e = 0; e < 6; e++)
          J(a, `mane${e}`, { rot: -0.05 * Math.sin(q * r - 0.4 * e) * n });
        return ((i.props = a), i);
      },
      [
        U.particle(0.2 * t, `zzz`, { u: 0.3, v: 0.5 }),
        U.sound(0.22 * t, `snore`),
      ],
      { blink: !1, look: !1 },
    ),
  ).named(`foal.napping`);
}
function Lj(e) {
  let t = GA(e.reduced),
    n = 1.1;
  return wj(
    n,
    (e) => {
      let r = {},
        i = {};
      return (
        mj(
          r,
          1 +
            (ZA([
              [0, 1],
              [0.06, 0.93, `outQuad`],
              [0.14, 1.1, `outCubic`],
              [0.3, 1.03, `inOutSine`],
              [0.38, 0.9, `inQuad`],
              [0.5, 1.03, `outQuad`],
              [0.62, 1, `inOutSine`],
              [n, 1],
            ])(e) -
              1) *
              t,
        ),
        (r.lift =
          0.1 *
          t *
          4 *
          V((e - 0.12) / 0.26) *
          (1 - V((e - 0.12) / 0.26)) *
          (e > 0.12 && e < 0.38)),
        e < 0.55 ? (r.mood = `surprised`) : e < 0.95 && (r.mood = `worried`),
        (r.look = {
          x:
            e < 0.4
              ? -0.9 * H.smooth(V((e - 0.15) / 0.12))
              : e < 0.7
                ? 0.9 * H.smooth(V((e - 0.4) / 0.14)) -
                  0.9 * (1 - H.smooth(V((e - 0.4) / 0.14)))
                : 0.9 * (1 - H.smooth(V((e - 0.7) / 0.15))),
          y: 0.1,
        }),
        J(i, `earL`, { rot: 0.3 * $A(e, 0.05, 0.3) * t }),
        J(i, `earR`, { rot: -0.3 * $A(e, 0.08, 0.34) * t }),
        J(i, `head`, { rot: 0.12 * QA(e, 0.1, 0.2, 0.6, 0.9) * t }),
        (r.lean =
          pj * 0.05 * Math.sin(q * 1.6 * e) * QA(e, 0.3, 0.4, 0.8, 1.1) * t),
        (r.props = i),
        r
      );
    },
    [
      U.particle(0.1, `exclaim`, { u: 0.25, v: 0.95 }),
      U.sound(0.12, `gasp`),
      U.particle(0.7, `sweat`, { u: 0.3, v: 0.8 }),
    ],
    { look: !1, blink: !1 },
  ).named(`foal.checked`);
}
function Rj(e) {
  let t = GA(e.reduced),
    n = 2.3,
    r = 0.24,
    i = 1.25,
    a = 1.75,
    o = ZA([
      [0, 0],
      [0.19, 0.05, `inOutSine`],
      [0.45999999999999996, -0.56 * t, `outBack`],
      [0.79, -0.5 * t, `inOutSine`],
      [1, -0.5 * t, `linear`],
      [1.16, 0.06, `inOutCubic`],
      [i, 0.05, `linear`],
      [n, 0, `inOutSine`],
    ]);
  return wj(
    n,
    (s) => {
      let c = {},
        l = {},
        u = s > 0.22 && s < 1.1400000000000001;
      ((c.lean = pj * o(s)),
        u &&
          (c.pivot = [-0.27 * QA(s, 0.21, 0.26, 1.02, 1.1400000000000001), 0]));
      let d =
        s > 0.29 && s < 1
          ? {
              armL: B(55 + 30 * Math.sin(q * 2.6 * (s - r)), 0, 118),
              armR: B(105 - 30 * Math.sin(q * 2.6 * (s - r)), 0, 118),
            }
          : void 0;
      d && rj(c, d);
      let f = (e, t, n) =>
        s > e && s < e + t ? n * 4 * ((s - e) / t) * (1 - (s - e) / t) : 0;
      ((c.lift = f(i, 0.32, 0.26 * t) + f(a, 0.36, 0.3 * t)),
        c.lift > 0.01 &&
          rj(c, {
            armL: 60 * Math.sin(Math.PI * V(c.lift / 0.25)),
            armR: 60 * Math.sin(Math.PI * V(c.lift / 0.25)),
            footL: 70 * Math.sin(Math.PI * V(c.lift / 0.25)),
            footR: 70 * Math.sin(Math.PI * V(c.lift / 0.25)),
          }),
        mj(
          c,
          1 +
            (ZA([
              [0, 1],
              [0.18, 0.86, `inOutSine`],
              [0.3, 1.08, `outCubic`],
              [1, 1.02, `inOutSine`],
              [1.1400000000000001, 0.86, `inQuad`],
              [1.22, 0.88, `linear`],
              [1.35, 1.1, `outCubic`],
              [1.55, 1.02, `inOutSine`],
              [1.6099999999999999, 0.88, `inQuad`],
              [1.72, 0.9, `linear`],
              [1.85, 1.12, `outCubic`],
              [2.09, 1, `inOutSine`],
              [2.15, 0.84, `inQuad`],
              [2.3, 1.05, `outQuad`],
              [n, 1, `inOutSine`],
            ])(s) -
              1) *
              t,
        ),
        !e.reduced &&
          s > 1.79 &&
          s < 2.07 &&
          (c.turn = Math.cos(q * H.inOutSine((s - a - 0.04) / 0.28))),
        (c.mood = `victorious`),
        s > 1.9999999999999998 && delete c.mood,
        J(l, `head`, {
          rot:
            -1 *
            (-0.15 * QA(s, r, 0.44, 1, 1.15) +
              0.3 * $A(s, 1.8499999999999999, n)) *
            t,
        }),
        J(l, `earL`, { rot: 0.2 * Math.sin(q * 3 * s) * t }),
        J(l, `earR`, { rot: -0.2 * Math.sin(q * 3 * s + 1.5) * t }));
      for (let e = 0; e < 6; e++)
        J(l, `mane${e}`, {
          rot:
            ej(s, 1.1400000000000001 + 0.012 * e, -0.2 * t, 4.2, 5) +
            ej(s, 1.57 + 0.012 * e, -0.16 * t, 4.2, 5) +
            ej(s, 2.11 + 0.012 * e, -0.2 * t, 4.2, 5),
        });
      return ((c.props = l), (c.bodyPose = ij(c.sy ?? 1)), c);
    },
    [
      U.sound(0.3, `whinny`),
      U.particle(0.44, `sparkle`, { u: 0.1, v: 1.1 }),
      U.particle(0.74, `heart`, { u: 0.3, v: 1 }),
      U.sound(1.1400000000000001, `hoof`),
      U.particle(1.1400000000000001, `dust`, { u: 0, v: 0 }),
      U.sound(1.57, `hoof`),
      U.particle(1.57, `leafR`, { u: -0.1, v: 0.75 }),
      U.sound(2.11, `hoof`),
      U.particle(2.11, `leafG`, { u: 0, v: 0.75 }),
      U.particle(2.15, `sparkle`, { u: 0.1, v: 1 }),
      U.particle(2.19, `heart`, { u: 0.3, v: 0.9 }),
    ],
    { look: !1, blink: !1 },
  ).named(`foal.victory`);
}
function zj(e) {
  let t = GA(e.reduced),
    n = 2.6;
  return wj(
    n,
    (e) => {
      let r = {},
        i = {},
        a = tj(e, 0, 0.1, 0.35),
        o = QA(e, 0.25, 0.85, 1.9, 2.5);
      return (
        mj(
          r,
          1 +
            (ZA([
              [0, 1],
              [0.08, 0.9, `outQuad`],
              [0.3, 1, `outQuad`],
              [0.85, 0.92, `inOutSine`],
              [1.3, 1, `inOutSine`],
              [1.6, 0.91, `inOutSine`],
              [2.5, 0.95, `inOutSine`],
              [n, 1, `inOutSine`],
            ])(e) -
              1) *
              t,
        ),
        (r.lean = pj * (-0.1 * a + 0.07 * o) * t),
        J(i, `head`, { rot: -0.42 * o * t }),
        e < 0.5 ? (r.mood = `hurt`) : e < 2.4 && (r.mood = `worried`),
        (r.look = { x: 0.4 * Math.sin(q * 0.35 * e) * o, y: -0.7 * o }),
        J(i, `earL`, { rot: 0 }),
        (r.props = i),
        e < 0.3 && (r.bodyPose = `hurt`),
        r
      );
    },
    [
      U.sound(0.05, `oof`),
      U.particle(1.35, `puff`, { u: 0.35, v: 0.6 }),
      U.sound(1.35, `sigh`),
      U.particle(1, `sweat`, { u: 0.3, v: 0.8 }),
    ],
    { look: !1 },
  ).named(`foal.defeat`);
}
function Bj(e) {
  let t = GA(e.reduced);
  return wj(
    1.3,
    (e) => {
      let n = {},
        r = {},
        i = QA(e, 0.1, 0.32, 0.9, 1.2);
      return (
        mj(n, 1 - 0.05 * t * $A(e, 0.05, 0.25) + 0.04 * t * i),
        (n.lift = 0.045 * t * $A(e, 0.2, 0.55)),
        (n.lean =
          pj *
          (0.09 * Math.sin(q * 0.9 * (e - 0.3)) * QA(e, 0.3, 0.45, 0.9, 1.25)) *
          t),
        J(r, `head`, {
          rot:
            -0.2 *
            Math.sin(q * 0.9 * (e - 0.3)) *
            QA(e, 0.3, 0.45, 0.9, 1.25) *
            t,
        }),
        J(r, `earL`, { rot: 0.28 * i * t }),
        J(r, `earR`, { rot: -0.28 * i * t }),
        (n.mouth = `flat`),
        (n.brow = e < 0.7 ? `worried` : `raised`),
        (n.look = {
          x: 0.8 * Math.sin(q * 0.8 * (e - 0.2)) * QA(e, 0.2, 0.3, 0.9, 1.2),
          y: 0.1,
        }),
        (n.props = r),
        n
      );
    },
    [U.particle(0.35, `question`, { u: 0.3, v: 1 }), U.sound(0.5, `hm`)],
    { look: !1 },
  ).named(`foal.shrug`);
}
function Vj(e) {
  let t = GA(e.reduced);
  return wj(
    0.7,
    (e) => {
      let n = {},
        r = {},
        i = QA(e, 0.03, 0.1, 0.35, 0.62),
        a = q * 6.5 * e;
      (e < 0.6 && (n.mood = `angry`),
        (n.look = { x: Math.sin(a) * i, y: 0 }),
        J(r, `head`, { rot: 0.28 * Math.sin(a + 0.3) * i * t }),
        (n.lean = pj * 0.05 * Math.sin(a + 0.9) * i * t),
        (n.x = -0.05 * t * $A(e, 0, 0.3) + 0.008 * Math.sin(a) * i * t),
        mj(n, 1 - 0.05 * t * $A(e, 0.2, 0.4)));
      let o = $A(e, 0.16, 0.34);
      return (o > 0.02 && rj(n, { armR: 44 * o }), (n.props = r), n);
    },
    [
      U.sound(0.06, `huff`),
      U.sound(0.28, `hoof`),
      U.particle(0.29, `dust`, { u: 0.25, v: 0 }),
    ],
    { look: !1, blink: !1 },
  ).named(`foal.refuse`);
}
function Hj(e, t) {
  let n = GA(t.reduced),
    r = e + 0.4,
    i = lj({
      dir: pj,
      lead: 0.06,
      crouch: 0.88,
      A: n,
      segs: [
        {
          a: [0, 0],
          b: [0, 0],
          air: 0.2,
          h: 0.26,
          gap: 0.2,
          squat: 0.86,
          stretch: 1.14,
          lean: 0.05,
          legs: `bound`,
        },
      ],
    }),
    a = r + i.duration,
    o = r + i.T[0];
  return W(
    a,
    nj((t) => {
      let o = t >= r ? i.sample(t - r) : {};
      if (((o.draw = t < e ? 0 : H.inOutSine(V((t - e) / 0.5))), t >= r)) {
        let e = {},
          s = t - r,
          c = i.T[0];
        (J(e, `earL`, { rot: hj(s, c - 0.03, 0.2, 0.3 * n) }),
          J(e, `earR`, { rot: -hj(s, c + 0.02, 0.17, 0.3 * n) }),
          J(e, `head`, {
            rot:
              -1 * (0.14 * tj(s, c, 0.03, 0.16) - 0.1 * $A(s, i.L[0], c)) * n,
          }));
        for (let t = 0; t < 6; t++)
          J(e, `mane${t}`, { rot: ej(s, c + 0.012 * t, -0.16 * n, 4.2, 5) });
        ((o.props = e), (o.mood = `happy`), t > a - 0.16 && delete o.mood);
      }
      return o;
    }, a),
    {
      events: [
        U.sound(r + i.L[0], `hop`),
        U.sound(o, `nicker`),
        U.particle(o, `dust`, { u: 0, v: 0 }),
        U.particle(o + 0.02, `leafR`, { u: -0.05, v: 0.75 }),
        U.particle(o + 0.06, `leafG`, { u: 0.05, v: 0.8 }),
      ],
      idle: { blink: !1, look: !1 },
      label: `foal.entrance`,
    },
  );
}
var Uj = {
  loops: {
    hover: { intro: 0.22, period: 1.6 },
    select: { intro: 0.26, period: 1.1 },
    nervous: { intro: 0, period: 1.5 },
    sleepy: { intro: 0, period: 6.6 },
    napping: { intro: 0, period: 3.4 },
  },
  rest: _j,
  entrance: Hj,
  hover: Dj,
  select: jj,
  nervous: Mj,
  sleepy: Nj,
  gag: Pj,
  deselect: Fj,
  move: yj,
  attack: xj,
  removed: Sj,
  napping: Ij,
  checked: Lj,
  victory: Rj,
  defeat: zj,
  shrug: Bj,
  refuse: Vj,
};
var Wj = -1;
var Gj = (e, t) => -e * t;
var Kj = (e, t) => -e * t;
var qj = (e, t) => {
  ((e.sy = (e.sy ?? 1) * t), (e.sx = (e.sx ?? 1) / t), (e.bodyPose = ij(e.sy)));
};
var Jj = JA;
var Yj = (e, t, n = [], r) => W(e, t, { events: n, idle: r, label: `sag` });
var Xj = (e, t, n = [], r) => Yj(e, nj(t, e), n, r);
var Zj = (e) => {
  ((e.eye = `sleepy`), (e.mouth = `smile`), (e.brow = `none`));
};
var Qj = (e) => {
  ((e.eye = `wide`), (e.mouth = `o`), (e.brow = `raised`));
};
function $j(e, t, n, r, i, a, o = 1) {
  let s = tj(n, r, 0.04, 0.2),
    c = tj(n, r + 0.13, 0.05, 0.2);
  return s <= 0 && c <= 0
    ? 0
    : ((e.lift = (e.lift ?? 0) + 0.05 * o * a * s),
      qj(e, 1 + 0.09 * o * a * s - 0.05 * a * c),
      (e.lean = (e.lean ?? 0) + i * -0.06 * o * a * s),
      J(t, `cap`, { dy: 0.075 * o * a * s, rot: Kj(i, 0.32 * o * a * s) }),
      J(t, `pom`, { rot: Kj(i, 0.45) * ej(n, r, o * a, 3.2, 3.2) * -1 }),
      J(t, `earL`, { rot: 0.3 * a * s }),
      J(t, `earR`, { rot: -0.3 * a * s }),
      s);
}
function eM(e, t) {
  e.pose = { ...e.pose, facing: Wj, mood: `neutral` };
  let n = e.idle.cfg;
  (n.enabled &&
    ((n.breath &&= { ...n.breath, amp: 0.022, period: 5.4 }),
    (n.blink &&= { ...n.blink, gap: 4.6, step: 0.11, double: 0 }),
    (n.ears &&= { gap: [3.5, 8], angle: [0.08, 0.16] }),
    (n.look &&= { ...n.look, wander: 0.3, wanderGap: [2.2, 5], smooth: 0.22 }),
    e.idle.reset()),
    e.refresh());
}
function tM(e, t) {
  if (t) return [e[0], e[2], e[3]];
  let n = e[0],
    r = Math.max(1, Math.ceil(Math.hypot(n[0], n[1]) / 1.8 - 1e-6)),
    i = [];
  for (let e = 0; e <= r; e++) i.push([n[0] * (1 - e / r), n[1] * (1 - e / r)]);
  return ((i[r] = [0, 0]), i);
}
function nM(e, t, n, r, i) {
  if (!e) return () => Wj;
  let a = n.length ? n[0] : { t0: r - 0.04, t1: r + 0.04 },
    o = n.length ? n[1] : { t0: i - 0.04, t1: i + 0.04 };
  return ZA([
    [0, Wj, `linear`],
    [a.t0, Wj, `linear`],
    [a.t1, t, `linear`],
    [o.t0, t, `linear`],
    [o.t1, Wj, `linear`],
  ]);
}
function rM(e) {
  let t = GA(e.reduced),
    n = e.facing || Wj,
    r = e.seed,
    i = tM(dj(e.off), uj(e.off)),
    a = i.length - 1,
    o = a - 1,
    s = n !== Wj,
    c = 0.09,
    l = (e, t) => 1 + t * (qA(r, 60 + e) - 0.5),
    u = [];
  for (let e = 0; e < a; e++) {
    let t = i[e],
      n = i[e + 1],
      r = Math.hypot(n[0] - t[0], n[1] - t[1]),
      a = e === o;
    u.push({
      a: t,
      b: n,
      air: (0.24 + 0.06 * B(r, 0.5, 2.2)) * l(e, 0.08),
      h: (a ? 0.2 : 0.11 + 0.07 * r) * l(e, 0.16),
      gap: a ? 0.24 : 0.09,
      squat: a ? 0.82 : 0.86,
      stretch: 1.08,
      lean: 0.07,
      legs: `trot`,
      parity: e & 1,
    });
  }
  let d = lj({ dir: Wj, lead: c, crouch: 0.93, segs: u, A: t }),
    f = d.L[0],
    p = d.L[o],
    m = d.T[o],
    h = u[o].air,
    g = u[0].air,
    _ = [],
    v = -1,
    y = -1;
  s &&
    (e.reduced
      ? ((v = f + 0.08), (y = p + 0.5 * h))
      : (_ = [
          { t0: f + 0.04, t1: f + 0.04 + 0.2 * g + 0.06 },
          { t0: p + 0.06, t1: m - 0.05 },
        ]));
  let b = nM(s, n, _, v, y),
    x = lj({
      dir: b,
      lead: c,
      crouch: 0.93,
      leadLean: -0.03,
      segs: u,
      A: t,
      over: 0.03,
    }),
    S = x.duration,
    C = x.L,
    w = x.T,
    T = p + 0.5 * h - 0.03,
    E = (e) => {
      let r = x.sample(e),
        i = b(e),
        o = {},
        s = 0.03 * Math.sin(q * 2.1 * e);
      for (let t = 0; t < a; t++)
        s += 0.22 * tj(e, w[t], 0.05, 0.24) - 0.1 * $A(e, C[t], w[t]);
      J(o, `head`, { rot: Gj(i, s * t) });
      for (let n = 0; n < a; n++) {
        (J(o, `cap`, {
          rot:
            Kj(i, 0.22 * $A(e, C[n], w[n]) * t) +
            ej(e, w[n], Kj(i, -0.3 * t), 3.2, 3.6),
        }),
          J(o, `pom`, {
            rot:
              Kj(i, 0.3 * $A(e, C[n] + 0.05, w[n] + 0.06) * t) +
              ej(e, w[n] + 0.06, Kj(i, -0.45 * t), 2.8, 3),
          }),
          J(o, `quiver`, { rot: ej(e, w[n], 0.16 * t, 3, 4) }));
        for (let r = 0; r < 6; r++)
          J(o, `mane${r}`, {
            rot: ej(e, w[n] + 0.02 * r, -0.12 * t, 3.4, 4.5),
          });
      }
      return (
        $j(r, o, e, T, i, t) > 0
          ? Qj(r)
          : e >= f - 0.02 && e < T
            ? Zj(r)
            : e >= T + 0.22 &&
              e < S - 0.14 &&
              ((r.eye = `half`), (r.mouth = `smile`)),
        _.length && (r.turn = fj(e, _)),
        v >= 0 && e >= v && e < y && (r.facing = n),
        (r.props = o),
        r
      );
    },
    D = [U.sound(f, `mumble`)];
  for (let e = 0; e < a; e++)
    e < o &&
      D.push(U.sound(w[e], `hoof`), U.particle(w[e], `dust`, { u: 0.1, v: 0 }));
  return (
    D.push(
      U.sound(T, `hic`),
      U.particle(T + 0.02, `exclaim`, { u: -0.3, v: 0.95 }),
    ),
    D.push(
      U.impact(w[o], `land`, { strength: 0.5 * t + 0.1 }),
      U.particle(w[o], `dust`, { u: 0, v: 0 }),
      U.particle(w[o] + 0.05, `puff`, { u: 0.2, v: 0.4 }),
    ),
    W(S, nj(E, S), {
      events: D,
      idle: { blink: !1, look: !1 },
      label: `sag.move`,
    })
  );
}
function iM(e) {
  let t = GA(e.reduced),
    n = e.facing || Wj,
    r = tM(dj(e.off), uj(e.off)),
    i = r.length - 1,
    a = i - 1,
    o = n !== Wj,
    s = 0.68,
    c = i === 1 ? 0.77 : 0.09,
    l = [];
  for (let e = 0; e < i; e++) {
    let t = r[e],
      n = r[e + 1],
      i = Math.hypot(n[0] - t[0], n[1] - t[1]),
      o = e === a;
    l.push({
      a: t,
      b: n,
      air: o ? 0.36 : 0.2 + 0.06 * B(i, 0.5, 2.2),
      h: o ? 0.2 : 0.11 + 0.07 * i,
      gap: o ? 0.55 : e === a - 1 ? s : 0.12,
      squat: o ? 0.8 : 0.88,
      stretch: 1.08,
      lean: 0.07,
      legs: `trot`,
      parity: e & 1,
    });
  }
  let u = lj({ dir: Wj, lead: c, crouch: 0.93, segs: l, A: t }),
    d = u.L[0],
    f = u.L[a],
    p = u.T[a],
    m = l[a].air,
    h = l[0].air,
    g = [],
    _ = -1,
    v = -1;
  o &&
    (e.reduced
      ? ((_ = d + 0.08), (v = f + 0.5 * m))
      : (g = [
          { t0: d + 0.04, t1: d + 0.04 + 0.2 * h + 0.06 },
          { t0: f + 0.1, t1: p - 0.06 },
        ]));
  let y = nM(o, n, g, _, v),
    b = lj({
      dir: y,
      lead: c,
      crouch: 0.93,
      leadLean: -0.03,
      segs: l,
      A: t,
      over: 0,
    }),
    x = b.L,
    S = b.T,
    C = p,
    w = C + 0.54,
    T = a > 0 ? S[a - 1] : c - s,
    E = T + 0.05,
    D = T + 0.3,
    O = D + 0.03,
    k = D + 0.11,
    A = 0.24,
    j = k + A,
    M = 0.3,
    N = (e) => [-e * 0.1526, 0.4797],
    P = b.pos,
    ee = b.lift,
    F = (e, t) => {
      let [n, r] = P(e),
        i = N(t),
        [a, o] = P(k),
        s = ee(k),
        c = [a + i[0] + t * 0.1, o * WA + s + i[1] + 0.06],
        l = [0, M];
      if (e < k) {
        let n = H.outQuad(V((e - O) / (k - O)));
        return { dx: t * 0.02 * n, dy: 0.16 * n, rot: t * -0.5 * n };
      }
      let u = H.inQuad(V((e - k) / A)) * 0.6 + V((e - k) / A) * 0.4,
        d = [c[0] + (l[0] - c[0]) * u, c[1] + (l[1] - c[1]) * u],
        f = l[0] - c[0],
        p = l[1] - c[1],
        m =
          Math.abs(f) < 0.25
            ? 0.7 * Math.sign(p || 1)
            : Math.atan2(p, Math.abs(f));
      return (
        (m = B(m, -0.7, 0.7)),
        { dx: d[0] - n - i[0], dy: d[1] - r * WA - i[1], rot: t * m }
      );
    },
    te = (e) => {
      let r = b.sample(e),
        a = y(e),
        o = {},
        s = 0.03 * Math.sin(q * 2.1 * e);
      for (let t = 0; t < i; t++)
        s += 0.22 * tj(e, S[t], 0.05, 0.24) - 0.1 * $A(e, x[t], S[t]);
      let c = QA(e, E, E + 0.1, D - 0.02, D + 0.03);
      c > 0 &&
        (qj(r, 1 + 0.06 * c * t),
        (s += 0.08 * c),
        J(o, `cap`, { rot: 0.07 * Jj(e, 16, 3) * c }),
        J(o, `pom`, { rot: 0.2 * Jj(e, 12, 4) * c }),
        (r.x = (r.x ?? 0) + 0.004 * Jj(e, 14, 5) * c));
      let l = QA(e, j + 0.1, j + 0.28, w - 0.3, w - 0.05),
        u = 0.18 * ($A(e, C + 0.04, C + 0.24) + $A(e, C + 0.2, C + 0.4));
      J(o, `head`, { rot: Gj(a, (s + 0.3 * l + u) * t) });
      for (let n = 0; n < i; n++) {
        (J(o, `cap`, {
          rot:
            Kj(a, 0.22 * $A(e, x[n], S[n]) * t) +
            ej(e, S[n], Kj(a, -0.3 * t), 3.2, 3.6),
        }),
          J(o, `pom`, {
            rot:
              Kj(a, 0.3 * $A(e, x[n] + 0.05, S[n] + 0.06) * t) +
              ej(e, S[n] + 0.06, Kj(a, -0.45 * t), 2.8, 3),
          }));
        for (let r = 0; r < 6; r++)
          J(o, `mane${r}`, {
            rot: ej(e, S[n] + 0.02 * r, -0.12 * t, 3.4, 4.5),
          });
      }
      if (
        ($j(r, o, e, D, a, t, 1.4) > 0 || (e > D && e < j + 0.12)
          ? Qj(r)
          : e >= d - 0.02 && e < E
            ? Zj(r)
            : e >= E && e < D
              ? ((r.eye = `half`), (r.mouth = `o`), (r.brow = `worried`))
              : ((e >= j + 0.12 && e < C + 0.02) ||
                  (e >= C + 0.02 && e < w - 0.16)) &&
                ((r.mood = `shy`), (r.blush = 1.6)),
        e >= O)
      ) {
        let t = F(e, a);
        e < k
          ? J(o, `arrow`, { dx: t.dx, dy: t.dy, rot: t.rot })
          : e < j
            ? J(o, `arrow`, {
                state: `fly`,
                follow: 0,
                dx: t.dx,
                dy: t.dy,
                rot: t.rot,
              })
            : e < C + 0.1
              ? J(o, `arrow`, {
                  state: `fly`,
                  follow: 0,
                  dx: t.dx,
                  dy: t.dy,
                  rot: t.rot,
                  hidden: !0,
                })
              : J(o, `arrow`, { alpha: H.smooth(V((e - C - 0.1) / 0.25)) });
      }
      ((r.look = { x: -a * 0.7 * l, y: -0.5 * l }),
        J(o, `cap`, { rot: Kj(a, -0.28 * l * t), dy: -0.03 * l * t }),
        (r.lean = (r.lean ?? 0) + a * 0.05 * l * t));
      let f = tj(e, w - 0.42, 0.03, 0.14);
      return (
        f > 0 &&
          ((r.lift = (r.lift ?? 0) + 0.02 * f),
          J(o, `cap`, { dy: 0.04 * f }),
          J(o, `pom`, { rot: Kj(a, -0.3 * f) })),
        g.length && (r.turn = fj(e, g)),
        _ >= 0 && e >= _ && e < v && (r.facing = n),
        (r.props = o),
        r
      );
    },
    ne = [U.sound(d, `mumble`)];
  for (let e = 0; e < a; e++)
    ne.push(U.sound(S[e], `hoof`), U.particle(S[e], `dust`, { u: 0.1, v: 0 }));
  return (
    ne.push(
      U.sound(E + 0.1, `gulp`),
      U.sound(D, `hic`),
      U.particle(D + 0.02, `exclaim`, { u: -0.3, v: 0.95 }),
      U.sound(k, `twang`),
      U.particle(k, `speed`, { u: -0.2, v: 0.5 }),
    ),
    ne.push(
      U.impact(j, `dink`, { strength: 0.55 * t + 0.15 }),
      U.sound(j, `thunk`),
      U.particle(j, `burst`, { u: 0, v: M }),
      U.particle(j + 0.01, `star`, { u: 0.05, v: 0.4 }),
    ),
    ne.push(
      U.sound(C, `hoof`),
      U.particle(C, `dust`, { u: 0, v: 0 }),
      U.sound(C + 0.06, `oops`),
      U.particle(C + 0.2, `sweat`, { u: -0.3, v: 0.8 }),
      U.sound(w - 0.42, `hic`),
    ),
    {
      action: W(w, nj(te, w), {
        events: ne,
        idle: { blink: !1, look: !1 },
        label: `sag.attack`,
      }),
      impactAt: j,
    }
  );
}
function aM(e) {
  let t = GA(e.reduced),
    n = B(e.strength, 0.2, 1),
    r = e.from[0],
    i = e.from[1],
    a = Wj,
    o = Math.abs(r) >= 0.35 ? Math.sign(r) : 1,
    s = o === a,
    c = 1.6,
    l = 0.1,
    u = 1.17,
    d = 0.28 * n * t,
    f = ZA([
      [0, 0],
      [l, 0, `linear`],
      [0.8, 1, `outCubic`],
      [c, 1],
    ]),
    p = ZA([
      [0, 0],
      [l, 0],
      [0.5, (s ? 1 : -1) * 0.18 * t, `outQuad`],
      [0.76, (s ? -1 : 1) * 0.12 * t, `inOutSine`],
      [0.92, (s ? 1 : -1) * 0.3, `inOutSine`],
      [u, (s ? 1 : -1) * (s ? 1.5 : 1.7), `inQuad`],
      [1.35, (s ? 1 : -1) * (s ? 1.44 : 1.62), `outQuad`],
      [c, (s ? 1 : -1) * (s ? 1.46 : 1.65), `inOutSine`],
    ]),
    m = (e) => V((e - 0.9) / 0.25);
  return W(
    c,
    (e) => {
      let c = {},
        h = {},
        g = 1;
      if (
        (e < l
          ? (g = 1 - 0.25 * t * n * H.outQuad(e / l))
          : e < 0.36 &&
            (g = 1 - 0.25 * t * n * (1 - H.outBack(V((e - l) / 0.26)))),
        (c.sy = B(g, 0.55, 1.2)),
        (c.sx = 1 / c.sy),
        (c.x = r * d * f(e)),
        (c.y = i * d * 0.6 * f(e)),
        (c.lean = a * p(e)),
        e >= 0.9 &&
          ((c.pivot = [a * (s ? 0.05 : -0.15) * m(e), 0]),
          (c.contact = `ground`),
          (c.footFollow = m(e))),
        (c.bodyPose = e < 0.36 ? `hurt` : e < 0.9 ? ij(c.sy) : `hurt`),
        (c.mood = e < 0.45 ? `hurt` : `dizzy`),
        e > 0.02 && e < 0.9)
      ) {
        let t = V((e - 0.02) / 0.78),
          n = H.smooth(V((e - 0.74) / 0.14));
        J(h, `cap`, {
          follow: e < 0.78 ? 0 : H.smooth(V((e - 0.78) / 0.1)),
          dx: (o || 1) * 0.32 * Math.sin(Math.PI * t) * (1 - n),
          dy: 2.8 * t * (1 - t) * (1 - n),
          rot: 0.5 * Math.sin(q * 2.2 * t) * (1 - n),
        });
      }
      if ((e >= 0.9 && J(h, `cap`, { state: `hurt` }), e >= 0.3)) {
        let t = QA(e, 0.3, 0.45, 1.05, 1.35),
          n = H.smooth(V((e - 1.25 + 0.16) / 0.5)),
          r = 26 * t * Math.sin(q * 2.4 * (e - 0.3)),
          i = 55 * t * (1 - n) + 115 * n;
        rj(c, {
          armL: B(i + r, 0, 120),
          armR: B(i - r, 0, 120),
          footL: B(i * 0.9 - r, 0, 120),
          footR: B(i * 0.9 + r, 0, 120),
        });
      }
      (J(h, `head`, {
        rot: Gj(a, 0.2 * QA(e, 0.6, 0.9, 2, 2) * t - 0.15 * $A(e, 0, 0.45)),
      }),
        J(h, `pom`, {
          rot: Kj(a, 0.4) * Math.sin(q * 3 * e) * QA(e, 0.1, 0.2, 0.8, 1.2),
        }),
        J(h, `quiver`, { rot: ej(e, u, 0.25 * t, 3, 3) }));
      for (let n = 0; n < 6; n++)
        J(h, `mane${n}`, { rot: ej(e, u + 0.014 * n, -0.22 * t, 3.6, 4) });
      return ((c.props = h), c);
    },
    {
      events: [
        U.sound(0.02, `oof`),
        U.particle(0.03, `star`, { u: -0.1, v: 0.9 }),
        U.particle(0.5, `orbit`, { u: -0.2, v: 0.9 }),
        U.particle(u, `dust`, { u: 0.1, v: 0 }),
        U.sound(u, `thud`),
        U.sound(1.23, `plunk`),
        U.world(c, `removed`),
      ],
      idle: !1,
      label: `sag.removed`,
    },
  );
}
function oM(e, t, n, r) {
  let i = e / t,
    a = {},
    o = {};
  return (
    qj(a, 1 + 0.03 * n * r),
    (a.lift = 0.012 * n * r),
    (a.lean = Wj * 0.05 * n * r * (1 + 0.4 * Math.sin(q * i))),
    (a.eye = `open`),
    (a.brow = `raised`),
    (a.mouth = `smile`),
    J(o, `head`, { rot: Gj(Wj, -0.1 * n) }),
    J(o, `pom`, { rot: Kj(Wj, 0.28 * n * Math.sin(q * i)) }),
    J(o, `cap`, { rot: Kj(Wj, 0.05 * n * Math.sin(q * i - 0.6)) }),
    J(o, `earL`, { rot: 0.14 * n * Math.sin(q * i * 0.5) }),
    (a.props = o),
    a
  );
}
function sM(e) {
  let t = 2.6,
    n = GA(e.reduced);
  return ey(
    Yj(0.4, (e) => oM(e, t, H.outBack(V((e - 0.06) / 0.32)), n), [
      U.sound(0.1, `mumble`),
    ]),
    ry(Yj(t, (e) => oM(e, t, 1, n))),
  ).named(`sag.hover`);
}
function cM(e, t, n, r, i, a) {
  let o = e / t,
    s = {},
    c = {};
  if (
    ((s.lift = (0.13 + 0.02 * Math.sin(q * o)) * r * i),
    qj(s, 1 + 0.03 * r * i),
    (s.lean = Wj * 0.06 * Math.sin(q * o + 1.2) * r * i),
    (s.eye = e < 0.3 && !a ? `wide` : `half`),
    (s.mouth = `o`),
    (s.brow = `worried`),
    r > 0.15)
  ) {
    let e = Math.sin(q * o),
      t = Math.sin(q * o + 1.4);
    rj(s, {
      armL: 22 * r + 16 * e * r,
      armR: 22 * r - 16 * e * r,
      footL: 28 * r + 16 * t * r,
      footR: 28 * r - 16 * t * r,
    });
  }
  return (
    J(c, `pom`, { rot: Kj(Wj, 0.5 * Math.sin(q * o - 0.3)) * n }),
    J(c, `cap`, { rot: Kj(Wj, 0.14 * Math.sin(q * o - 0.9)) * n }),
    J(c, `head`, { rot: Gj(Wj, 0.1 * r) }),
    J(c, `quiver`, { rot: 0.16 * Math.sin(q * o + 0.5) * r }),
    a && $j(s, c, e, 0.62 * t, Wj, i, 0.7),
    (s.props = c),
    s
  );
}
function lM(e) {
  let t = 1.7,
    n = GA(e.reduced);
  return ey(
    Yj(
      0.36,
      (e) => {
        let r = H.outBack(V((e - 0.1) / 0.24)),
          i = cM(e, t, H.smooth(V((e - 0.1) / 0.2)), r, n, !1);
        return (qj(i, 1 - 0.07 * $A(e, 0, 0.16) * n), i);
      },
      [
        U.sound(0.12, `mumble`),
        U.particle(0.14, `exclaim`, { u: -0.3, v: 0.95 }),
      ],
    ),
    ry(Yj(t, (e) => cM(e, t, 1, 1, n, !0), [U.sound(0.62 * t, `hic`)])),
  ).named(`sag.select`);
}
function uM(e) {
  let t = GA(e.reduced);
  return ry(
    Yj(
      2,
      (e) => {
        let n = e / 2,
          r = {},
          i = {};
        ((r.mood = `worried`),
          (r.x = 0.005 * Jj(e, 12, 7) * t),
          (r.lean = Wj * (0.012 * Jj(e, 12, 8) - 0.02) * t),
          qj(r, 1 - 0.035 * t + 0.008 * Math.sin(q * 2 * n)),
          (r.look = { x: 0.6 * Math.sin(q * n), y: -0.2 }),
          J(i, `head`, { rot: Gj(Wj, 0.12 * t) }));
        let a = QA(n, 0.1, 0.5, 0.62, 0.66);
        return (
          J(i, `cap`, { dy: -0.035 * a * t, rot: Kj(Wj, -0.2 * a * t) }),
          J(i, `pom`, { rot: 0.2 * Jj(e, 10, 9) * t }),
          $j(r, i, e, 1.32, Wj, t, 0.9),
          (r.props = i),
          r
        );
      },
      [U.particle(0.4, `sweat`, { u: -0.3, v: 0.85 }), U.sound(1.32, `hic`)],
      { blink: !0, look: !1 },
    ),
  ).named(`sag.nervous`);
}
function dM(e) {
  let t = 7.2,
    n = GA(e.reduced),
    r = 5.75,
    i = ZA([
      [0, 0],
      [0.7, 0.03, `smooth`],
      [3.2, 0.3, `inOutSine`],
      [5.3, 0.36, `inSine`],
      [5.55, 0.4, `outQuad`],
      [r, 0.4, `linear`],
      [5.84, -0.14, `outQuad`],
      [6.25, -0.02, `inOutSine`],
      [6.6, 0, `inOutSine`],
      [t, 0],
    ]);
  return ry(
    Yj(
      t,
      (e) => {
        let t = {},
          a = {},
          o = QA(e, 1.8, 2.6, 5.7, r);
        return (
          qj(t, 1 - 0.045 * o * n + 0.012 * o * Math.sin(q * 0.55 * e) * n),
          (t.lean = Wj * 0.03 * Math.sin((q * e) / 3.6) * o * n),
          J(a, `head`, { rot: Gj(Wj, i(e) * n) }),
          J(a, `cap`, { rot: Kj(Wj, -0.25 * o * n), dy: -0.02 * o * n }),
          J(a, `pom`, { rot: Kj(Wj, 0.25 * Math.sin((q * e) / 3) * o * n) }),
          $j(t, a, e, 5.77, Wj, n, 1.2) > 0 || (e > r && e < 6.25)
            ? Qj(t)
            : o > 0.5
              ? (t.mood = `sleepy`)
              : e > 0.9 && e < 1.8
                ? ((t.eye = `half`), (t.mouth = `smile`))
                : e > 6.2 &&
                  e < 6.9 &&
                  ((t.eye = `half`),
                  (t.mouth = `smile`),
                  (t.look = { x: 0.7 * Math.sin(q * 0.9 * (e - 6.2)), y: 0 })),
          e > 6.25 &&
            e < 6.2 &&
            ((t.look = { x: 0.8 * Math.sin(q * 0.7 * (e - r - 0.5)), y: 0 }),
            (t.eye = `open`),
            (t.brow = `raised`),
            (t.mouth = `smile`)),
          (t.props = a),
          t
        );
      },
      [
        U.particle(2.9, `zzz`, { u: -0.3, v: 0.85 }),
        U.sound(3, `snore`),
        U.particle(4.5, `zzz`, { u: -0.3, v: 0.85 }),
        U.sound(4.6, `snore`),
        U.sound(5.77, `hic`),
        U.particle(5.81, `exclaim`, { u: -0.3, v: 0.95 }),
      ],
      { look: !1, blink: !1 },
    ),
  ).named(`sag.sleepy`);
}
function fM(e) {
  let t = GA(e.reduced),
    n = YA(e.seed, 7, 3);
  return n === 0
    ? Xj(
        2.2,
        (e) => {
          let n = {},
            r = {},
            i = QA(e, 0.1, 0.9, 1.15, 1.2),
            a = tj(e, 1.2, 0.1, 0.35);
          return (
            J(r, `cap`, {
              dy: -0.06 * i * t + 0.16 * a * t,
              rot: Kj(Wj, -0.35 * i * t + 0.7 * a * t),
            }),
            J(r, `pom`, {
              rot:
                Kj(Wj, 0.5) *
                Math.sin(q * 3.4 * (e - 1.2)) *
                QA(e, 1.2, 1.25, 1.6, 2) *
                t,
            }),
            J(r, `head`, { rot: Gj(Wj, (0.16 * i - 0.32 * a) * t) }),
            qj(n, 1 + 0.06 * a * t - 0.03 * i * t),
            (n.lift = 0.03 * a * t),
            i > 0.3 && e < 1.2
              ? ((n.eye = `half`),
                (n.mouth = `flat`),
                (n.look = { x: 0.5 * Math.sin(q * 0.9 * e), y: -0.1 }))
              : e >= 1.2 &&
                e < 1.9 &&
                ((n.eye = `wide`), (n.mouth = `grin`), (n.brow = `raised`)),
            (n.props = r),
            n
          );
        },
        [
          U.sound(1.2, `hic`),
          U.particle(1.25, `sparkle`, { u: -0.3, v: 1.05 }),
        ],
        { look: !1 },
      ).named(`sag.gag.cap`)
    : n === 1
      ? Xj(
          2.6,
          (e) => {
            let n = {},
              r = {},
              i = QA(e, 0.2, 0.7, 1.9, 2.3),
              a = $A(e, 0.9, 1.5);
            return (
              tj(e, 1.62, 0.06, 0.25),
              J(r, `head`, { rot: Gj(Wj, -0.2 * i * t) }),
              (n.lean = Wj * -0.05 * i * t),
              (n.look = { x: 0.9 * i, y: 0 }),
              J(r, `arrow`, {
                dy: 0.2 * a * t + 0.2 * tj(e, 1.55, 0.08, 0.2) * t,
                rot: 0.3 * Math.sin(q * 2.5 * (e - 0.9)) * a * t,
              }),
              J(r, `quiver`, {
                rot: 0.2 * Math.sin(q * 2.5 * (e - 0.9)) * a * t,
              }),
              $j(n, r, e, 1.55, Wj, t, 0.9),
              i > 0.3 &&
                ((n.eye = `open`), (n.brow = `worried`), (n.mouth = `o`)),
              (n.props = r),
              n
            );
          },
          [
            U.sound(1, `mumble`),
            U.sound(1.55, `hic`),
            U.particle(1.6, `exclaim`, { u: -0.3, v: 0.95 }),
            U.sound(1.8, `plop`),
          ],
          { look: !1 },
        ).named(`sag.gag.quiver`)
      : Xj(
          2.4,
          (e) => {
            let n = {},
              r = {},
              i = 0;
            return (
              (i = Math.max(i, $j(n, r, e, 0.3, Wj, t, 0.7))),
              (i = Math.max(i, $j(n, r, e, 0.95, Wj, t, 1))),
              (i = Math.max(i, $j(n, r, e, 1.55, Wj, t, 1.5))),
              i > 0
                ? Qj(n)
                : e > 0.2 &&
                  e < 2 &&
                  ((n.eye = `half`), (n.mouth = `o`), (n.brow = `worried`)),
              e > 1.9 && Zj(n),
              J(r, `head`, {
                rot: Gj(Wj, 0.1 * QA(e, 0.1, 0.3, 1.9, 2.3) * t),
              }),
              (n.props = r),
              n
            );
          },
          [
            U.sound(0.3, `hic`),
            U.sound(0.95, `hic`),
            U.sound(1.55, `hic`),
            U.particle(1.6, `star`, { u: -0.2, v: 1.1 }),
            U.particle(1.62, `sparkle`, { u: -0.3, v: 1.1 }),
          ],
          { look: !1 },
        ).named(`sag.gag.cascade`);
}
function pM(e) {
  let t = GA(e.reduced),
    n = 0.8;
  return Xj(
    n,
    (e) => {
      let r = {},
        i = {},
        a = 1 - H.inQuad(V((e - 0.06) / 0.26));
      ((r.lift = 0.13 * a),
        qj(
          r,
          1 +
            (ZA([
              [0, 1.03],
              [0.2, 1.05, `outQuad`],
              [0.32, 1, `inQuad`],
              [0.4, 0.82, `outQuad`],
              [0.62, 1.04, `outQuad`],
              [0.78, 1, `inOutSine`],
              [n, 1],
            ])(e) -
              1) *
              t,
        ),
        e < 0.32 &&
          rj(r, { armL: 22 * a, armR: 22 * a, footL: 28 * a, footR: 28 * a }),
        e < 0.7 && ((r.eye = `half`), (r.mouth = `smile`), (r.brow = `none`)),
        J(i, `pom`, { rot: Kj(Wj, -0.4) * ej(e, 0.32, 1, 2.6, 2.6) * t * -1 }),
        J(i, `cap`, {
          rot: Kj(Wj, -0.3 * t) * $A(e, 0.3, 0.7),
          dy: 0.03 * $A(e, 0.42, 0.6) * t,
        }),
        J(i, `head`, { rot: Gj(Wj, 0.2 * $A(e, 0.3, 0.75) * t) }));
      for (let n = 0; n < 6; n++)
        J(i, `mane${n}`, { rot: ej(e, 0.34 + 0.02 * n, -0.14 * t, 3.4, 4.5) });
      return ((r.props = i), r);
    },
    [
      U.sound(0.34, `hoof`),
      U.particle(0.34, `dust`, { u: 0, v: 0 }),
      U.particle(0.5, `puff`, { u: -0.2, v: 0.5 }),
      U.sound(0.5, `sigh`),
    ],
    { look: !1 },
  );
}
function mM(e) {
  let t = 4.2,
    n = GA(e.reduced);
  return ry(
    Yj(
      t,
      (e) => {
        let r = e / t,
          i = {},
          a = {};
        ((i.contact = `ground`), (i.bodyPose = `squash`), (i.mood = `sleepy`));
        let o = 0.85 + 0.024 * Math.sin(q * r) * n;
        return (
          (i.sy = o),
          (i.sx = 1.1 - (o - 0.85) * 1.6),
          rj(i, { armL: 115, armR: 115, footL: 115, footR: 115 }),
          J(a, `head`, { rot: Gj(Wj, 0.4 + 0.02 * Math.sin(q * r - 0.6)) }),
          J(a, `cap`, { rot: Kj(Wj, -0.25), dy: -0.02 }),
          J(a, `pom`, { rot: Kj(Wj, 0.3 * Math.sin(q * r - 1) * n) }),
          J(a, `earL`, { rot: 0.12 * $A(r, 0.5, 0.62) }),
          (i.props = a),
          i
        );
      },
      [
        U.particle(0.22 * t, `zzz`, { u: -0.3, v: 0.5 }),
        U.sound(0.24 * t, `snore`),
        U.particle(0.72 * t, `zzz`, { u: -0.3, v: 0.5 }),
      ],
      { blink: !1, look: !1 },
    ),
  ).named(`sag.napping`);
}
function hM(e) {
  let t = GA(e.reduced);
  return Xj(
    1.5,
    (e) => {
      let n = {},
        r = {};
      return (
        e < 0.32 && ((n.eye = `half`), (n.mouth = `smile`), (n.brow = `none`)),
        $j(n, r, e, 0.34, Wj, t, 1.5) > 0 || (e >= 0.34 && e < 0.9)
          ? Qj(n)
          : e >= 0.9 && e < 1.4 && (n.mood = `worried`),
        (n.look = {
          x:
            e < 0.9
              ? 0
              : Math.sin(q * 0.85 * (e - 0.9)) *
                0.9 *
                QA(e, 0.9, 0.95, 1.2, 1.45),
          y: 0,
        }),
        qj(n, 1 - 0.03 * t * QA(e, 0.05, 0.25, 0.3, 0.34)),
        J(r, `head`, { rot: Gj(Wj, -0.1 * QA(e, 0.34, 0.45, 0.9, 1.2) * t) }),
        J(r, `pom`, {
          rot:
            0.3 * Math.sin(q * 2.4 * (e - 0.9)) * QA(e, 0.9, 1, 1.2, 1.5) * t,
        }),
        (n.props = r),
        n
      );
    },
    [
      U.sound(0.34, `hic`),
      U.particle(0.38, `exclaim`, { u: -0.3, v: 0.95 }),
      U.particle(0.9, `sweat`, { u: -0.3, v: 0.85 }),
    ],
    { look: !1, blink: !1 },
  ).named(`sag.checked`);
}
function gM(e) {
  let t = GA(e.reduced),
    n = 1.95,
    r = 2.5;
  return Xj(
    3,
    (e) => {
      let i = {},
        a = {},
        o = (t, n, r) =>
          e > t && e < t + n ? r * 4 * ((e - t) / n) * (1 - (e - t) / n) : 0;
      if (
        ((i.lift = o(0.8, 0.42, 0.24 * t) + o(1.4, 0.42, 0.28 * t)),
        i.lift > 0.01)
      ) {
        let e = Math.sin(Math.PI * V(i.lift / 0.26));
        rj(i, { armL: 60 * e, armR: 110 * e, footL: 100 * e, footR: 60 * e });
      }
      if (
        (qj(
          i,
          1 +
            (ZA([
              [0, 1],
              [0.31, 0.93, `inOutSine`],
              [0.43, 1.09, `outCubic`],
              [0.6499999999999999, 1, `inOutSine`],
              [0.77, 0.88, `inQuad`],
              [0.92, 1.08, `outCubic`],
              [1.1600000000000001, 1.02, `inOutSine`],
              [1.25, 0.84, `inQuad`],
              [1.3699999999999999, 0.9, `linear`],
              [1.52, 1.1, `outCubic`],
              [1.7599999999999998, 1.02, `inOutSine`],
              [1.8599999999999999, 0.82, `inQuad`],
              [2.0999999999999996, 1.03, `outQuad`],
              [2.8, 1, `inOutSine`],
              [3, 1],
            ])(e) -
              1) *
              t,
        ),
        e < 1.65
          ? (i.mood = `victorious`)
          : e < n && ((i.eye = `wide`), (i.mouth = `o`), (i.brow = `raised`)),
        $j(i, a, e, n, Wj, t, 1.5),
        e > 2 && e < r)
      ) {
        let t = V((e - n - 0.05) / 0.45);
        J(a, `arrow`, {
          follow: 0,
          dx: 0,
          dy: 1.6 * H.outQuad(t),
          alpha: 1 - H.smooth(V((t - 0.4) / 0.6)),
        });
      } else
        e >= r && e < 2.8 && J(a, `arrow`, { alpha: H.smooth((e - r) / 0.3) });
      (e > 2.05 && e < 2.6
        ? ((i.look = { x: 0, y: 0.9 }),
          J(a, `head`, {
            rot: Gj(Wj, -0.35 * QA(e, 2.05, 2.2, 2.4, 2.65) * t),
          }))
        : e >= 2.65 &&
          (J(a, `head`, { rot: Gj(Wj, 0.3 * $A(e, 2.65, 3) * t) }),
          e > 2.8 && e < 2.7 && ((i.eye = `squeezed`), (i.mouth = `open`))),
        J(a, `pom`, { rot: Kj(Wj, 0.4) * Math.sin(q * 2.2 * e) * t }),
        J(a, `earL`, { rot: 0.2 * Math.sin(q * 2.4 * e) * t }));
      for (let n = 0; n < 6; n++)
        J(a, `mane${n}`, {
          rot:
            ej(e, 1.24 + 0.02 * n, -0.16 * t, 3.4, 4) +
            ej(e, 1.8399999999999999 + 0.02 * n, -0.18 * t, 3.4, 4),
        });
      return ((i.props = a), i);
    },
    [
      U.sound(0.35, `hic`),
      U.particle(0.38999999999999996, `exclaim`, { u: -0.3, v: 0.95 }),
      U.sound(1.2000000000000002, `hoof`),
      U.particle(1.24, `sparkle`, { u: -0.2, v: 1 }),
      U.sound(1.7999999999999998, `hoof`),
      U.particle(1.8399999999999999, `heart`, { u: -0.3, v: 1 }),
      U.sound(n, `hic`),
      U.sound(2, `twang`),
      U.sound(2.7, `plop`),
      U.sound(2.9, `yawn`),
      U.particle(2.95, `puff`, { u: -0.4, v: 0.6 }),
    ],
    { look: !1, blink: !1 },
  ).named(`sag.victory`);
}
function _M(e) {
  let t = GA(e.reduced),
    n = 2.8;
  return Xj(
    n,
    (e) => {
      let r = {},
        i = {},
        a = tj(e, 0, 0.12, 0.4),
        o = QA(e, 0.3, 1.1, 2, 2.65);
      return (
        qj(
          r,
          1 +
            (ZA([
              [0, 1],
              [0.1, 0.9, `outQuad`],
              [0.4, 1, `outQuad`],
              [1, 0.9, `inOutSine`],
              [1.5, 1.02, `inOutSine`],
              [1.9, 0.88, `inOutSine`],
              [2.6, 0.93, `inOutSine`],
              [n, 1, `inOutSine`],
            ])(e) -
              1) *
              t,
        ),
        (r.lean = Wj * (-0.09 * a + 0.05 * o) * t),
        J(i, `head`, { rot: Gj(Wj, 0.4 * o * t) }),
        J(i, `cap`, { rot: Kj(Wj, -0.5 * o * t), dy: -0.05 * o * t }),
        J(i, `pom`, { rot: Kj(Wj, -0.3 * o) }),
        e < 0.5
          ? (r.mood = `hurt`)
          : e < 2.6 &&
            ((r.eye = `sleepy`), (r.mouth = `wavy`), (r.brow = `worried`)),
        (r.look = { x: 0, y: -0.7 * o }),
        e < 0.3 && (r.bodyPose = `hurt`),
        (r.props = i),
        r
      );
    },
    [
      U.sound(0.05, `oof`),
      U.sound(1.5, `sigh`),
      U.particle(1.52, `puff`, { u: -0.4, v: 0.6 }),
      U.particle(1.1, `sweat`, { u: -0.3, v: 0.85 }),
    ],
    { look: !1 },
  ).named(`sag.defeat`);
}
function vM(e) {
  let t = GA(e.reduced);
  return Xj(
    1.6,
    (e) => {
      let n = {},
        r = {},
        i = QA(e, 0.2, 0.55, 1.05, 1.4);
      return (
        qj(n, 1 - 0.05 * t * $A(e, 0.1, 0.4) + 0.04 * t * i),
        (n.lift = 0.03 * t * $A(e, 0.35, 0.8)),
        (n.lean =
          Wj *
          0.08 *
          Math.sin(q * 0.75 * (e - 0.4)) *
          QA(e, 0.4, 0.55, 1, 1.4) *
          t),
        J(r, `head`, {
          rot: Gj(
            Wj,
            0.16 *
              Math.sin(q * 0.75 * (e - 0.4)) *
              QA(e, 0.4, 0.55, 1, 1.4) *
              t,
          ),
        }),
        J(r, `earL`, { rot: 0.28 * i * t }),
        J(r, `earR`, { rot: -0.28 * i * t }),
        J(r, `pom`, {
          rot: Kj(Wj, 0.3) * Math.sin(q * 1.5 * (e - 0.4)) * i * t,
        }),
        (n.eye = `half`),
        (n.mouth = `flat`),
        (n.brow = e < 0.9 ? `worried` : `raised`),
        $j(n, r, e, 1.2, Wj, t, 0.5),
        (n.look = {
          x: 0.7 * Math.sin(q * 0.6 * (e - 0.2)) * QA(e, 0.2, 0.3, 1, 1.4),
          y: 0,
        }),
        (n.props = r),
        n
      );
    },
    [
      U.particle(0.5, `question`, { u: -0.3, v: 1.05 }),
      U.sound(0.6, `mumble`),
      U.sound(1.2, `hic`),
    ],
    { look: !1 },
  ).named(`sag.shrug`);
}
function yM(e) {
  let t = GA(e.reduced);
  return Xj(
    0.9,
    (e) => {
      let n = {},
        r = {},
        i = QA(e, 0.05, 0.2, 0.5, 0.75),
        a = q * 3.4 * e;
      return (
        (n.eye = `half`),
        (n.mouth = `wavy`),
        (n.brow = `worried`),
        (n.look = { x: Math.sin(a) * i, y: 0 }),
        J(r, `head`, { rot: 0.24 * Math.sin(a + 0.4) * i * t }),
        J(r, `cap`, { rot: Kj(Wj, 0.2) * Math.sin(a - 0.8) * i * t }),
        J(r, `pom`, { rot: Kj(Wj, 0.5) * Math.sin(a - 1.5) * i * t }),
        (n.lean = Wj * 0.04 * Math.sin(a + 1) * i * t),
        (n.x = 0.04 * t * $A(e, 0, 0.5)),
        qj(n, 1 - 0.03 * t * $A(e, 0.05, 0.4)),
        $j(n, r, e, 0.5, Wj, t, 0.6),
        (n.props = r),
        n
      );
    },
    [U.sound(0.08, `mumble`), U.sound(0.5, `hic`)],
    { look: !1, blink: !1 },
  ).named(`sag.refuse`);
}
function bM(e, t) {
  let n = GA(t.reduced),
    r = e + 0.52,
    i = r + 0.4;
  return W(
    i,
    nj((t) => {
      let i = {},
        a = {};
      if (
        ((i.draw = t < e ? 0 : H.inOutSine(V((t - e) / 0.5))), t >= r - 0.04)
      ) {
        let e = t - r;
        (qj(
          i,
          1 +
            (ZA([
              [-0.04, 1],
              [0, 1],
              [0.05, 1.1, `outQuad`],
              [0.14, 0.94, `inOutSine`],
              [0.28, 1.02, `outQuad`],
              [0.4, 1, `inOutSine`],
            ])(e) -
              1) *
              n,
        ),
          $j(i, a, t, r, Wj, n, 1.2),
          e < 0.22
            ? Qj(i)
            : e < 0.34 && ((i.eye = `half`), (i.mouth = `smile`)),
          J(a, `head`, { rot: Gj(Wj, 0.12 * $A(e, 0.1, 0.4) * n) }));
        for (let e = 0; e < 6; e++)
          J(a, `mane${e}`, {
            rot: ej(t, r + 0.14 + 0.02 * e, -0.14 * n, 3.4, 4.5),
          });
        i.props = a;
      }
      return i;
    }, i),
    {
      events: [
        U.sound(r, `hic`),
        U.particle(r + 0.03, `exclaim`, { u: -0.3, v: 0.95 }),
        U.particle(r + 0.14, `puff`, { u: 0.1, v: 0 }),
      ],
      idle: { blink: !1, look: !1 },
      label: `sag.entrance`,
    },
  );
}
var xM = {
  loops: {
    hover: { intro: 0.4, period: 2.6 },
    select: { intro: 0.36, period: 1.7 },
    nervous: { intro: 0, period: 2 },
    sleepy: { intro: 0, period: 7.2 },
    napping: { intro: 0, period: 4.2 },
  },
  rest: eM,
  entrance: bM,
  hover: sM,
  select: lM,
  nervous: uM,
  sleepy: dM,
  gag: fM,
  deselect: pM,
  move: rM,
  attack: iM,
  removed: aM,
  napping: mM,
  checked: hM,
  victory: gM,
  defeat: _M,
  shrug: vM,
  refuse: yM,
};
var SM = (e) => (e.side === `b` ? xM : Uj);
var CM = {
  kind: `n`,
  rest: (e, t, n) => (t === `b` ? xM : Uj).rest(e, n),
  entrance: (e, t) => SM(t).entrance(e, t),
  hover: (e) => SM(e).hover(e),
  select: (e) => SM(e).select(e),
  nervous: (e) => SM(e).nervous(e),
  sleepy: (e) => SM(e).sleepy(e),
  gag: (e) => SM(e).gag(e),
  deselect: (e) => SM(e).deselect(e),
  move: (e) => SM(e).move(e),
  attack: (e) => SM(e).attack(e),
  removed: (e) => SM(e).removed(e),
  napping: (e) => SM(e).napping(e),
  checked: (e) => SM(e).checked(e),
  victory: (e) => SM(e).victory(e),
  defeat: (e) => SM(e).defeat(e),
  shrug: (e) => SM(e).shrug(e),
  promoteOut: () => Xv(0),
  promoteIn: () => Xv(0),
  refuse: (e) => SM(e).refuse(e),
};
var Y = Math.PI * 2;
var X = H;
function wM(e, t = 0) {
  let n = Number.isFinite(e) ? Math.round(e * 1000003) | 0 : 0,
    r =
      Math.imul(n ^ 2654435769, 2246822507) ^
      Math.imul((t | 0) + 2135587861, 3266489909);
  return (
    (r ^= r >>> 15),
    (r = Math.imul(r, 739982445)),
    (r ^= r >>> 12),
    (r = Math.imul(r, 695872825)),
    (r ^= r >>> 15),
    (r >>> 0) / 4294967296
  );
}
var TM = (e, t, n, r) => n + (r - n) * wM(e, t);
var EM = (e, t) => (wM(e, t) < 0.5 ? -1 : 1);
var DM = (e) => Math.sin(Math.PI * V(e));
var OM = (e, t, n, r = 1 / 0) =>
  e <= 0 || e >= r
    ? 0
    : Math.exp(-n * e) *
      Math.sin(Y * t * e) *
      (Number.isFinite(r) ? 1 - X.smooth((e - 0.55 * r) / (0.45 * r)) : 1);
var kM = (e, t = 12) => Math.floor(e * t + 1e-9) / t;
var AM = (e, t, n, r = H.smooth) =>
  n <= t ? +(e >= n) : r(V((e - t) / (n - t)));
function jM(e) {
  let t = e.length;
  return (n) => {
    if (n <= e[0][0]) return e[0][1];
    if (n >= e[t - 1][0]) return e[t - 1][1];
    let r = 0;
    for (; r < t - 2 && e[r + 1][0] <= n;) r++;
    let [i, a] = e[r],
      [o, s, c] = e[r + 1];
    if (o <= i) return s;
    let l = (n - i) / (o - i);
    return a + (s - a) * (c ? c(l) : H.inOutSine(l));
  };
}
var MM = (e, t) => {
  let n = (e.props ??= {});
  return (n[t] ??= {});
};
var NM = (e, t) => {
  let n = (e.arm ??= {});
  return (n[t] ??= {});
};
var PM = (e, t) => {
  let n = (e.foot ??= {});
  return (n[t] ??= {});
};
function FM(e, t) {
  ((e.sy = (e.sy ?? 1) * t), (e.sx = (e.sx ?? 1) / t));
}
function IM(e, t, n) {
  e[t] = (e[t] ?? 0) + n;
}
function LM(e, t, n = 0) {
  e.look = { x: (e.look?.x ?? 0) + t, y: (e.look?.y ?? 0) + n };
}
function RM(e, t, n, r, i) {
  if (i <= 1e-4) return;
  let a = n + (r - n) * i;
  (t !== `R` && (NM(e, `L`).deg = a), t !== `L` && (NM(e, `R`).deg = a));
}
var zM = (e) => Math.max(Math.abs(e[0]), Math.abs(e[1]));
var BM = (e, t, n = 3) => (e > 0 ? 1 : e < 0 ? -1 : EM(t, n));
function VM(e, t) {
  let n = t.events ?? [],
    r = t.period;
  return new Jv({
    duration: 1 / 0,
    sample: e,
    idle: t.idle,
    label: t.label ?? `endless`,
    eventsIn: (e, t) => {
      let i = [];
      for (let a of n) {
        let n = a.every ?? 1,
          o = a.phase ?? 0,
          s = Math.max(0, Math.floor((e - a.at) / r)),
          c = Math.floor((t - a.at) / r);
        for (let l = s; l <= c; l++) {
          let s = a.at + l * r;
          s > e &&
            s <= t &&
            s > 0 &&
            l % n === o &&
            i.push({ ...a.make(l), at: s });
        }
      }
      return i.sort((e, t) => e.at - t.at);
    },
  });
}
var HM = 18;
var UM = (e) => (e ? 0.5 : 1);
var WM = (e, t) => (t ? sy(e, 1.12) : e);
function GM(e, t, n) {
  ((MM(e, `antL`).rot = (MM(e, `antL`).rot ?? 0) + t),
    (MM(e, `antR`).rot = (MM(e, `antR`).rot ?? 0) + n));
}
var KM = (e, t) => GM(e, t, -t);
var qM = (e, t, n) => GM(e, t * n, t * n);
var JM = (e) => B(0.38 + 0.16 * Math.sqrt(Math.max(e, 1)), 0.5, 0.85);
function YM(e, t, n, r) {
  if (t <= 0 || t >= 1) return;
  let i = DM(t);
  IM(
    e,
    `lift`,
    r.H * (0.5 * i + 0.25 * Math.sqrt(i) * (1 - Math.cos(Y * r.m * t))),
  );
  let a = kM(n, 12),
    o = r.A * 0.07 * i * Math.sin(Y * 6.5 * a);
  ((MM(e, `wings`).rot = (MM(e, `wings`).rot ?? 0) + o),
    qM(e, r.dir, 0.2 * r.A * i));
  let s = 0.035 * r.A * i;
  ((PM(e, `L`).dy = (PM(e, `L`).dy ?? 0) + s),
    (PM(e, `R`).dy = (PM(e, `R`).dy ?? 0) + s * 0.8));
}
function XM(e) {
  let t = UM(e.reduced),
    n = Math.max(1, zM(e.off)),
    r = JM(n),
    i = e.facing,
    a = 0.09,
    o = 0.19,
    s = r - a - o,
    c = a + s,
    l = B(1 + Math.floor(n / 2.2), 1, 4),
    u = 0.15 * t * (0.88 + 0.12 * wM(e.seed, 1)),
    d = jM([
      [0, 1],
      [a * 0.85, 0.87, X.outQuad],
      [a, 0.87],
      [0.14, 1.09, X.outCubic],
      [a + s * 0.55, 1.03],
      [c - 0.02, 1.05],
      [c + 0.03, 0.84, X.inQuad],
      [c + 0.12, 1.05, X.outQuad],
      [r, 1],
    ]),
    f = jM([
      [0, 0],
      [a, -0.06, X.outQuad],
      [0.21, 0.16, X.outCubic],
      [a + s * 0.7, 0.12],
      [c, 0.02],
      [c + 0.06, -0.06, X.outQuad],
      [r, 0],
    ]),
    p = jM([
      [0, 1],
      [a * 0.85, 1.12, X.outQuad],
      [0.15, 0.97],
      [c, 1],
      [c + 0.04, 0.88, X.inQuad],
      [c + 0.14, 1.07, X.outQuad],
      [r, 1],
    ]);
  return WM(
    W(
      r,
      (n) => {
        let m = {},
          h = V((n - a) / s),
          g = n <= a ? 1 : n >= c ? 0 : 1 - X.inOutSine(h);
        ((m.x = e.off[0] * g),
          (m.y = e.off[1] * g),
          FM(m, 1 + (d(n) - 1) * (0.5 + 0.5 * t)),
          IM(m, `lean`, i * t * f(n)));
        let _ = 1 + (p(n) - 1) * t;
        return (
          (MM(m, `wings`).sy = _),
          (MM(m, `wings`).sx = _ ** -0.7),
          YM(m, h, n, { m: l, H: u, A: t, dir: i }),
          n > c && qM(m, i, -0.32 * t * OM(n - c, 3.4, 6, o)),
          RM(m, `both`, HM, 58, DM(h) * +(n >= a && n <= c)),
          LM(m, i * 0.6 * DM(V((n - a * 0.5) / (s + a)))),
          n > c + 0.02 &&
            n < Math.min(c + 0.32, r - 0.05) &&
            (m.mood = `happy`),
          m
        );
      },
      {
        events: [
          U.sound(a, `wingFlick`),
          U.impact(c, `land`, { strength: 0.2 * t }),
          U.particle(c, `puff`),
        ],
        idle: { look: !1 },
        label: `w.move`,
      },
    ),
    e.reduced,
  );
}
var ZM = 0.65;
function QM(e) {
  let t = UM(e.reduced),
    n = Math.max(1, zM(e.off)),
    r = BM(e.facing, e.seed),
    i = e.facing === 0 ? 0 : e.facing,
    a = B(ZM / n, 0, 1),
    o = n * (1 - a),
    s = 0.09,
    c = 0.16 + 0.075 * o,
    l = s + c,
    u = l + 0.13,
    d = u + 0.03,
    f = u + 0.12,
    p = u + 0.15,
    m = p + 0.2,
    h = m + 0.08,
    g = 0.3,
    _ = h + g,
    v = _ + 0.2,
    y = 0.12 / n,
    b = Math.max(0, a - y),
    x = B(1 + Math.floor(o / 2.2), 1, 3),
    S = 0.15 * t,
    C = 0.14 * t,
    w = jM([
      [0, 1],
      [s * 0.85, 0.87, X.outQuad],
      [s, 0.87],
      [0.14, 1.08, X.outCubic],
      [l - 0.03, 1.03],
      [l + 0.05, 0.84, X.outQuad],
      [u - 0.01, 0.84],
      [u + 0.06, 1.13, X.outCubic],
      [p + 0.06, 1, X.inOutSine],
      [m - 0.02, 0.97],
      [h - 0.03, 0.88, X.inOutSine],
      [h + 0.06, 1.1, X.outCubic],
      [_ - 0.02, 1.04],
      [_ + 0.03, 0.82, X.inQuad],
      [_ + 0.12, 1.05, X.outQuad],
      [v, 1],
    ]),
    T = jM([
      [0, 0],
      [s, -0.06, X.outQuad],
      [0.19, 0.14, X.outCubic],
      [l, 0.02],
      [u - 0.02, -0.14, X.inOutSine],
      [u + 0.08, 0.26, X.outCubic],
      [p + 0.05, 0.1, X.inOutSine],
      [m + 0.02, 0],
      [h + 0.05, 0.14, X.outCubic],
      [_, 0.03],
      [_ + 0.06, -0.06, X.outQuad],
      [v, 0],
    ]),
    E = jM([
      [d, 0.35],
      [d + 0.06, 1.22, X.outCubic],
      [p, 1, X.inOutSine],
      [m, 1],
      [m + 0.1, 0.4, X.inQuad],
    ]),
    D = jM([
      [d, 0.9],
      [d + 0.06, 1.06, X.outCubic],
      [p, 1, X.inOutSine],
    ]),
    O = jM([
      [0, 1],
      [s * 0.85, 1.12, X.outQuad],
      [0.15, 0.97],
      [l, 1],
      [u - 0.02, 1.28, X.outQuad],
      [d, 1.28],
      [m + 0.1, 0.7],
      [m + 0.18, 1.12, X.outQuad],
      [m + 0.3, 1, X.inOutSine],
      [_ + 0.02, 0.9, X.inQuad],
      [_ + 0.14, 1.06, X.outQuad],
      [v, 1],
    ]),
    k = W(
      v,
      (n) => {
        let o = {},
          f;
        if (
          ((f =
            n <= s
              ? 1
              : n < l
                ? 1 - (1 - a) * X.inOutSine((n - s) / c)
                : n < p
                  ? a - (a - b) * X.outCubic(V((n - u) / 0.1))
                  : n < h
                    ? b
                    : n < _
                      ? b * (1 - X.inOutSine((n - h) / g))
                      : 0),
          (o.x = e.off[0] * f),
          (o.y = e.off[1] * f),
          FM(o, 1 + (w(n) - 1) * (0.5 + 0.5 * t)),
          IM(o, `lean`, i * t * T(n)),
          YM(o, V((n - s) / c) * +(n < l), n, { m: x, H: S, A: t, dir: r }),
          n >= h && n < _)
        ) {
          let e = (n - h) / g;
          (IM(o, `lift`, C * 4 * e * (1 - e)), qM(o, r, 0.16 * t * DM(e)));
        }
        let y = 1 + (O(n) - 1) * t,
          k = n >= d && n < m + 0.1,
          A = MM(o, `wings`);
        k
          ? ((A.state = `open`),
            (A.sx = 1 + (E(n) - 1) * (0.4 + 0.6 * t)),
            (A.sy = D(n)),
            (A.rot =
              (A.rot ?? 0) +
              (n > p && n < m ? t * 0.05 * Math.sin(Y * 8 * kM(n, 12)) : 0)))
          : ((A.sy = y), (A.sx = y ** -0.7));
        let j = AM(n, l, u - 0.02, X.outQuad) * (1 - AM(n, d, d + 0.05));
        return (
          j > 0 && GM(o, -r * 0.32 * t * j, -r * 0.32 * t * j),
          n > d && qM(o, r, 0.4 * t * OM(n - d, 2.6, 4.5, v - d)),
          RM(
            o,
            `both`,
            HM,
            110,
            AM(n, l, u - 0.03, X.outQuad) * (1 - AM(n, d, d + 0.04)),
          ),
          RM(o, `both`, HM, 80, AM(n, d, d + 0.05) * (1 - AM(n, p + 0.05, m))),
          LM(o, r * 0.7 * $M(n, s, _)),
          n >= l - 0.02 && n < p + 0.03
            ? (o.mood = `angry`)
            : n >= p + 0.03 && n < m + 0.1
              ? (o.mood = `smug`)
              : n > _ + 0.02 && n < _ + 0.14 && (o.mood = `happy`),
          o
        );
      },
      {
        events: [
          U.sound(s, `wingFlick`),
          U.sound(d + 0.015, `wingSnap`),
          U.particle(u + 0.05, `speed`, { dir: r, anchor: `wingRoot` }),
          U.impact(f, `smack`, {
            strength: 0.85 * (e.reduced ? 0.6 : 1),
            dir: r,
          }),
          U.particle(f, `star`, { anchor: `top`, dx: r * 0.5, dy: -0.2 }),
          U.impact(_, `land`, { strength: 0.25 * t }),
          U.particle(_, `puff`),
          ...(e.reduced ? [] : [U.shake(f, 0.5, 0.18)]),
        ],
        idle: { look: !1 },
        label: `w.attack`,
      },
    ),
    A = e.reduced ? 1.12 : 1;
  return { action: WM(k, e.reduced), impactAt: f / A };
}
var $M = (e, t, n) => AM(e, t, t + 0.08) * (1 - AM(e, n - 0.05, n + 0.1));
function eN(e) {
  let t = UM(e.reduced),
    n = 0.6 + 0.4 * V(e.strength),
    r = 1.5,
    i = Math.abs(e.from[0]) > 0.15 ? Math.sign(e.from[0]) : EM(e.seed, 5),
    a = 0.1,
    o = 0.5,
    s = 1.38 * i,
    c = jM([
      [0, 0],
      [a, 0.08 * i, X.outQuad],
      [0.44, s * 1.03, X.inOutSine],
      [0.6, s * 0.97, X.outQuad],
      [0.76, s, X.inOutSine],
    ]),
    l = jM([
      [0.02, 0.4],
      [0.1, 1, X.outCubic],
      [0.28, 0.85],
      [o, 0.7],
      [0.8, 0.5, X.inOutSine],
    ]);
  return WM(
    W(
      r,
      (r) => {
        let s = {
            contact: `ground`,
            bodyPose: `hurt`,
            footFollow: AM(r, 0.1, 0.45, X.smooth),
          },
          u = V((r - a) / 0.4);
        (FM(
          s,
          r < 0.1
            ? 1 - 0.22 * t * X.outQuad(r / 0.1)
            : 1 - 0.22 * t * (1 - AM(r, 0.1, 0.24)),
        ),
          (s.x = e.from[0] * 0.22 * n * t * DM(u)),
          (s.y = e.from[1] * 0.22 * n * t * DM(u)),
          IM(s, `lift`, 0.34 * n * t * 4 * u * (1 - u) * (u > 0 && u < 1)),
          IM(s, `lean`, c(r)),
          r > o && r < 0.8 && IM(s, `lift`, 0.05 * t * DM((r - o) / 0.3)));
        let d = MM(s, `wings`),
          f = r > 0.1 && r < o && Math.floor(kM(r, 8) * 8 + 1e-6) % 2 == 1;
        (r >= 0.02 &&
          (r < 0.3 || r >= 0.48 || !f) &&
          ((d.state = `open`),
          (d.sx =
            l(r) * (r > 0.8 ? 1 + 0.07 * Math.sin(Y * 0.9 * (r - o)) : 1)),
          (d.sy = 1)),
          KM(s, OM(r, 5, 5) * 0.35 * t));
        let p = V(Math.abs(c(r)) / 1.38);
        return (
          (d.dx = (d.dx ?? 0) + i * 0.08 * p),
          (d.dy = (d.dy ?? 0) + 0.015 * p),
          (s.mood = r < 0.28 ? `hurt` : r < 0.4 ? `surprised` : `dizzy`),
          s
        );
      },
      {
        events: [
          U.particle(0.02, `star`, { anchor: `top` }),
          U.sound(0.02, `antTick`),
          U.impact(o, `faint-land`, { strength: 0.3 * n }),
          U.particle(o, `puff`),
          U.sound(o, `thud`),
          U.particle(0.75, `orbit`, { anchor: `top` }),
          U.world(r, `removed`),
        ],
        idle: !1,
        label: `w.removed`,
      },
    ),
    e.reduced,
  );
}
function tN(e, t) {
  let n = UM(t.reduced),
    r = Math.max(0, e),
    i = TM(t.seed, 11, -0.03, 0.03),
    a = 0.42,
    o = r + a - 0.08 + i,
    s = 0.1,
    c = 0.2,
    l = o + s + c,
    u = l + 0.26,
    d = jM([
      [o - 0.001, 1],
      [o + s * 0.85, 0.86, X.outQuad],
      [o + s, 0.86],
      [o + s + 0.05, 1.1, X.outCubic],
      [l - 0.03, 1.03],
      [l + 0.03, 0.85, X.inQuad],
      [l + 0.13, 1.05, X.outQuad],
      [u, 1],
    ]);
  return W(
    u,
    (e) => {
      let t = { draw: AM(e, r, r + a, X.inOutSine) };
      FM(t, 1 + (d(e) - 1) * (0.5 + 0.5 * n));
      let i = V((e - (o + s)) / c);
      return (
        i > 0 && i < 1 && IM(t, `lift`, 0.17 * n * 4 * i * (1 - i)),
        e > l &&
          (KM(t, 0.3 * n * OM(e - l, 3.6, 5, u - l)),
          (MM(t, `wings`).sy =
            1 -
            0.1 *
              n *
              Math.exp(-6 * (e - l)) *
              Math.cos(Y * 3 * (e - l)) *
              (1 - AM(e, u - 0.14, u)))),
        e > l + 0.02 && e < l + 0.22 && (t.mood = `happy`),
        t
      );
    },
    {
      events: [
        U.particle(r + a, `sparkle`, { anchor: `top` }),
        U.sound(o + s, `wingFlick`),
        U.particle(l, `puff`),
        U.sound(l, `antTick`),
      ],
      idle: !1,
      label: `w.entrance`,
    },
  );
}
var nN = 1.75;
var rN = 0.75;
var iN = 1.5;
var aN = 7;
var oN = 3.6;
var sN = 2.5;
var cN = 4.6;
var lN = 5;
function uN(e) {
  let t = UM(e.reduced),
    n = nN;
  return VM(
    (e) => {
      let r = {},
        i = X.outBack(V(e / 0.16)),
        a = V(e / 0.16),
        o = 0.5 - 0.5 * Math.cos((Y * e) / n);
      (IM(r, `lift`, t * (0.03 * i + 0.012 * o * a)),
        FM(r, 1 + t * (0.045 * i + 0.01 * o * a)),
        IM(r, `lean`, t * 0.02 * Math.sin((Y * e) / n) * a),
        KM(r, t * (0.12 * i + 0.1 * a * Math.sin((Y * 3 * kM(e, 12)) / n))),
        (MM(r, `antR`).rot =
          (MM(r, `antR`).rot ?? 0) +
          t * 0.06 * a * Math.sin((Y * 5 * kM(e, 12)) / n + 1.6)));
      let s = DM(V(((((e % n) + n) % n) - 1) / 0.35));
      return (
        IM(r, `lift`, t * 0.02 * s * a),
        FM(r, 1 + t * 0.02 * s * a),
        KM(r, t * 0.12 * s * a),
        RM(r, `both`, HM, 46, a * t),
        (r.brow = `raised`),
        r
      );
    },
    { period: n, label: `w.hover` },
  );
}
function dN(e) {
  let t = UM(e.reduced),
    n = rN,
    r = jM([
      [0, 1],
      [0.1, 0.87, X.outQuad],
      [0.14, 1.1, X.outCubic],
      [0.36, 1.05],
      [0.42, 0.85, X.inQuad],
      [0.52, 1.05, X.outQuad],
      [n, 1],
    ]);
  return VM(
    (e) => {
      let i = {},
        a = ((e % n) + n) % n,
        o = V((a - 0.12) / 0.3);
      (FM(i, 1 + (r(a) - 1) * (0.5 + 0.5 * t)),
        o > 0 && o < 1 && IM(i, `lift`, 0.11 * t * 4 * o * (1 - o)));
      let s = 0.16 * t * (0.5 - 0.5 * Math.cos((Y * a) / n));
      return (
        GM(
          i,
          s * Math.sin((Y * 2 * a) / n),
          -s * Math.sin((Y * 2 * a) / n + 1),
        ),
        (MM(i, `wings`).rot = t * 0.06 * Math.sin((Y * 2 * kM(a, 12)) / n)),
        RM(i, `both`, HM, 64 + 24 * Math.sin((Y * a) / n), t),
        IM(i, `lean`, t * 0.05 * Math.sin((Y * a) / n)),
        (i.mood = `happy`),
        i
      );
    },
    {
      period: n,
      events: [
        {
          at: 0.42,
          every: 2,
          make: () => U.particle(0, `sparkle`, { anchor: `top` }),
        },
      ],
      label: `w.select`,
    },
  );
}
function fN(e) {
  let t = UM(e.reduced),
    n = iN;
  return VM(
    (e) => {
      let r = {},
        i = V(e / 0.12),
        a = kM(e, 12);
      return (
        IM(r, `x`, t * 0.012 * i * Math.sin(Y * 10 * a)),
        FM(r, 1 + t * 0.018 * i * Math.sin(Y * 8 * a)),
        LM(r, t * 0.55 * i * Math.sin((Y * a) / (n / 2))),
        GM(
          r,
          t * 0.1 * i * Math.sin(Y * 10 * a),
          -t * 0.1 * i * Math.sin(Y * 10 * a + 1.3),
        ),
        (MM(r, `wings`).rot = t * 0.05 * i * Math.sin(Y * 10 * a + 0.5)),
        IM(r, `lean`, -t * 0.02 * i),
        (PM(r, `L`).dx = t * 0.012 * i * Math.sin(Y * 10 * a + 1)),
        (PM(r, `R`).dx = -t * 0.012 * i * Math.sin(Y * 10 * a + 1)),
        (r.mood = `worried`),
        r
      );
    },
    {
      period: n,
      idle: { look: !1 },
      events: [
        {
          at: 0.15,
          make: () => U.particle(0, `sweat`, { anchor: `top`, dx: 0.22 }),
        },
      ],
      label: `w.nervous`,
    },
  );
}
function pN(e) {
  let t = UM(e.reduced),
    n = aN,
    r = jM([
      [0, 0],
      [2.4, 0.14, X.inQuad],
      [2.55, -0.05, X.outCubic],
      [2.9, 0, X.inOutSine],
      [3.6, 0.03],
      [4.4, 0],
      [5.2, -0.04, X.inOutSine],
      [5.9, 0.04, X.inOutSine],
      [n, 0, X.inOutSine],
    ]),
    i = jM([
      [0, 1],
      [2.4, 0.93, X.inOutSine],
      [2.5, 1.06, X.outCubic],
      [2.9, 1, X.inOutSine],
      [4.4, 0.97, X.inOutSine],
      [5.3, 1.07, X.inOutSine],
      [5.9, 1.06],
      [6.4, 0.95, X.inOutSine],
      [n, 1],
    ]),
    a = (e) => AM(e, 4.6, 5.3) * (1 - AM(e, 5.9, 6.3));
  return VM(
    (e) => {
      let o = {},
        s = ((e % n) + n) % n;
      return (
        IM(o, `lean`, t * r(s)),
        FM(o, 1 + (i(s) - 1) * t),
        RM(o, `both`, HM, 100, a(s) * t),
        (MM(o, `wings`).dy = t * 0.03 * a(s)),
        GM(
          o,
          -0.1 *
            t *
            (1 - AM(s, 2.4, 2.5) * (1 - AM(s, 2.5, 3.2))) *
            AM(s, 0.3, 2.3),
          0,
        ),
        (o.mood = s >= 2.4 && s < 2.75 ? `surprised` : `sleepy`),
        s >= 4.9 &&
          s < 6.1 &&
          ((o.mouth = `open`),
          (o.mouthScale = 0.6 + 1.3 * t * DM((s - 4.9) / 1.2))),
        o
      );
    },
    {
      period: n,
      idle: { blink: !1, look: !1 },
      events: [
        { at: 1.2, make: () => U.particle(0, `zzz`, { anchor: `top` }) },
        { at: 2, make: () => U.particle(0, `zzz`, { anchor: `top` }) },
        { at: 2.42, make: () => U.particle(0, `exclaim`, { anchor: `top` }) },
        { at: 5, make: () => U.sound(0, `yawn`) },
      ],
      label: `w.sleepy`,
    },
  );
}
function mN(e) {
  let t = UM(e.reduced),
    n = Math.min(2, Math.floor(wM(e.seed, 21) * 3)),
    r = EM(e.seed, 22);
  if (n === 0)
    return WM(
      W(
        1.7,
        (e) => {
          let n = {},
            i = kM(e, 12),
            a = DM(V((e - 0.1) / 1.3));
          return (
            (MM(n, r > 0 ? `antR` : `antL`).rot =
              t * 0.45 * a * Math.sin(Y * 4 * i) * -r),
            e > 0.35 &&
              e < 1.1 &&
              (MM(n, r > 0 ? `antL` : `antR`).state = `curl`),
            LM(
              n,
              r * t * 0.9 * DM(V((e - 0.2) / 0.9)),
              t * 0.5 * DM(V((e - 0.2) / 0.9)),
            ),
            IM(n, `lean`, t * 0.06 * r * DM(V((e - 0.2) / 0.9))),
            FM(
              n,
              1 +
                t * 0.05 * OM(e - 1.15, 3, 5, 0.55) * (e > 1.15) +
                t * 0.05 * DM(V((e - 1.1) / 0.3)),
            ),
            e > 0.3 && e < 1.2
              ? (n.mood = `worried`)
              : e >= 1.2 && e < 1.6 && (n.mood = `smug`),
            n
          );
        },
        {
          events: [U.sound(0.3, `antTick`), U.sound(0.62, `antTick`)],
          idle: { look: !1 },
          label: `w.gag.twitch`,
        },
      ),
      e.reduced,
    );
  if (n === 1) {
    let n = r > 0 ? `R` : `L`;
    return WM(
      W(
        2.3,
        (e) => {
          let i = {},
            a = DM(V((e - 0.5) / 0.4)),
            o = AM(e, 0.65, 0.9) * (1 - AM(e, 1.6, 1.85)),
            s = AM(e, 0.75, 1) * (1 - AM(e, 1.55, 1.8));
          return (
            FM(i, 1 + t * 0.08 * a - t * 0.03 * DM(V((e - 1.85) / 0.35))),
            IM(i, `lift`, t * 0.04 * a),
            LM(
              i,
              r * t * 0.6 * o,
              t *
                (0.35 * AM(e, 0.5, 0.65) * (1 - AM(e, 0.65, 0.9)) -
                  0.9 * AM(e, 0.85, 1.5) * (1 - AM(e, 1.6, 1.85))),
            ),
            IM(i, `lean`, r * t * 0.08 * s),
            RM(i, n, HM, 95, s * t),
            GM(i, r * t * 0.25 * s, r * t * 0.25 * s),
            (MM(i, `wings`).rot =
              t * 0.06 * Math.sin(Y * 5 * kM(e, 12)) * DM(V(e / 0.6))),
            e >= 0.5 && e < 0.9
              ? (i.mood = `surprised`)
              : e >= 1.85 && e < 2.2 && (i.mood = `shy`),
            i
          );
        },
        {
          events: [
            U.particle(0.45, `sparkle`, {
              kind: `scale`,
              anchor: `wingRoot`,
              dx: r * 0.3,
              dy: 0.15,
            }),
            U.sound(0.46, `scaleTink`),
            U.particle(0.55, `exclaim`, { anchor: `top` }),
          ],
          idle: { look: !1 },
          label: `w.gag.scale`,
        },
      ),
      e.reduced,
    );
  }
  return WM(
    W(
      1.5,
      (e) => {
        let n = {},
          i = MM(n, `wings`);
        return (
          e >= 0.35 && e < 0.62
            ? ((i.state = `open`),
              (i.sx = 0.35 + 0.15 * DM((e - 0.35) / 0.27)),
              (i.sy = 0.95))
            : (i.sy =
                1 +
                t * 0.08 * DM(V((e - 0.15) / 0.2)) -
                t *
                  0.1 *
                  (e >= 0.62
                    ? Math.exp(-7 * (e - 0.62)) *
                      Math.cos(Y * 3 * (e - 0.62)) *
                      (1 - AM(e, 1.2, 1.5))
                    : 0)),
          e > 0.62 && FM(n, 1 - t * 0.05 * DM(V((e - 0.62) / 0.25))),
          GM(
            n,
            t * 0.2 * OM(e - 0.3, 4, 4, 1.2),
            -t * 0.2 * OM(e - 0.3, 4, 4, 1.2),
          ),
          LM(
            n,
            t * 0.8 * r * AM(e, 0.85, 1) * (1 - AM(e, 1.3, 1.45)),
            t * 0.5 * AM(e, 0.85, 1) * (1 - AM(e, 1.3, 1.45)),
          ),
          e >= 0.8 && e < 1.4 && (n.mood = `smug`),
          n
        );
      },
      {
        events: [U.sound(0.36, `wingFlick`), U.sound(0.62, `wingSnap`)],
        idle: { look: !1 },
        label: `w.gag.peek`,
      },
    ),
    e.reduced,
  );
}
function hN(e) {
  let t = UM(e.reduced),
    n = 0.55,
    r = jM([
      [0, 1],
      [0.05, 0.86, X.outQuad],
      [0.2, 1.06, X.outQuad],
      [n, 1],
    ]);
  return WM(
    W(
      n,
      (e) => {
        let i = {};
        return (
          FM(i, 1 + (r(e) - 1) * (0.5 + 0.5 * t)),
          KM(i, t * 0.3 * OM(e - 0.05, 3.5, 5, 0.5)),
          (MM(i, `wings`).rot = t * 0.08 * OM(e, 4, 6, n)),
          e < 0.4 && (i.mood = `happy`),
          i
        );
      },
      {
        events: [U.particle(0.05, `puff`), U.sound(0.05, `antTick`)],
        label: `w.deselect`,
      },
    ),
    e.reduced,
  );
}
function gN(e) {
  let t = UM(e.reduced),
    n = 1.2;
  return WM(
    W(
      n,
      (e) => {
        let r = {},
          i = DM(V(e / n)) ** 0.5;
        return (
          LM(
            r,
            t *
              0.95 *
              (e < 0.3
                ? -X.outQuad(e / 0.3)
                : e < 0.6
                  ? -1 + 2 * X.inOutSine((e - 0.3) / 0.3)
                  : 1 - X.inOutSine(V((e - 0.6) / 0.3))),
          ),
          FM(r, 1 + t * 0.05 * i),
          IM(r, `lift`, t * 0.02 * i),
          GM(
            r,
            t * 0.14 * Math.sin(Y * 8 * kM(e, 12)) * i,
            -t * 0.14 * Math.sin(Y * 8 * kM(e, 12) + 1) * i,
          ),
          e > 0.08 && e < 1.05 && (r.mood = `worried`),
          r
        );
      },
      {
        events: [
          U.particle(0.1, `exclaim`, { anchor: `top` }),
          U.particle(0.55, `sweat`, { anchor: `top`, dx: 0.22 }),
        ],
        idle: { look: !1 },
        label: `w.checked`,
      },
    ),
    e.reduced,
  );
}
function _N(e) {
  let t = UM(e.reduced),
    n = sN,
    r = (e, t) => {
      let n = (e - t) / 0.36;
      return n > 0 && n < 1 ? 4 * n * (1 - n) : 0;
    },
    i = jM([
      [0, 1],
      [0.08, 0.88, X.outQuad],
      [0.14, 1.1, X.outCubic],
      [0.42, 1.02],
      [0.5, 0.86, X.inQuad],
      [0.6, 1.05, X.outQuad],
      [0.8, 0.88, X.inOutSine],
      [0.9, 1.12, X.outCubic],
      [1.3, 1.02],
      [1.85, 1.02],
      [2, 0.9, X.inQuad],
      [2.2, 1.04, X.outQuad],
      [n, 1],
    ]);
  return VM(
    (e) => {
      let a = {},
        o = ((e % n) + n) % n;
      (FM(a, 1 + (i(o) - 1) * (0.5 + 0.5 * t)),
        IM(
          a,
          `lift`,
          t *
            (0.2 * r(o, 0.1) +
              0.2 * r(o, 0.82) * 0 +
              (o >= 0.86 && o < 1.9
                ? 0.05 + 0.035 * Math.sin(Y * 3 * (o - 0.86))
                : 0) *
                AM(o, 0.86, 0.98)),
        ),
        IM(
          a,
          `lean`,
          t * 0.08 * (o > 1 && o < 1.9 ? Math.sin(Y * 1.1 * (o - 1)) : 0),
        ));
      let s = MM(a, `wings`);
      return (
        o >= 0.9 &&
          o < 1.95 &&
          ((s.state = `open`),
          (s.sx =
            (o < 0.98 ? 0.4 + 0.8 * AM(o, 0.9, 0.98) : 1) *
            (1 + 0.06 * Math.sin(Y * 6 * kM(o, 12))) *
            (o > 1.85 ? 1 - 0.6 * AM(o, 1.85, 1.95) : 1))),
        RM(a, `both`, HM, 150, AM(o, 0.05, 0.2) * (1 - AM(o, 2.1, 2.4)) * t),
        KM(a, t * (0.2 + 0.15 * Math.sin(Y * 3 * kM(o, 12)))),
        (a.mood = `victorious`),
        a
      );
    },
    {
      period: n,
      events: [
        { at: 0.9, make: () => U.sound(0, `wingSnap`) },
        { at: 1.2, make: () => U.particle(0, `sparkle`, { anchor: `top` }) },
        {
          at: 1.6,
          make: () => U.particle(0, `sparkle`, { anchor: `wingRoot`, dx: 0.5 }),
        },
      ],
      label: `w.victory`,
    },
  );
}
function vN(e) {
  let t = UM(e.reduced),
    n = cN;
  return VM(
    (e) => {
      let r = {},
        i = AM(e, 0.1, 0.6),
        a = ((e % n) + n) % n,
        o = DM(V((a - 2.6) / 1));
      return (
        FM(
          r,
          1 - t * (0.07 * i + 0.025 * o + (e < 0.4 ? 0.1 * DM(e / 0.4) : 0)),
        ),
        IM(r, `lean`, t * (0.05 * i + 0.015 * Math.sin((Y * e) / n))),
        GM(r, -0.15 * t * i, 0.15 * t * i),
        (MM(r, `wings`).rot = -0.08 * t * i),
        (MM(r, `wings`).sy = 1 - 0.1 * t * i),
        LM(
          r,
          t *
            0.6 *
            Math.sin(Y * 1.25 * V((a - 1.3) / 1.6)) *
            DM(V((a - 1.3) / 1.6)) *
            AM(e, 0.6, 0.8),
        ),
        GM(
          r,
          t *
            0.06 *
            Math.sin(Y * 1.25 * V((a - 1.3) / 1.6)) *
            DM(V((a - 1.3) / 1.6)),
          0,
        ),
        e < 0.35 && (r.bodyPose = `hurt`),
        (r.mood = e < 0.35 ? `hurt` : `worried`),
        r
      );
    },
    {
      period: n,
      idle: { look: !1 },
      events: [{ at: 3, make: () => U.sound(0, `sigh`) }],
      label: `w.defeat`,
    },
  );
}
function yN(e) {
  let t = UM(e.reduced);
  return WM(
    W(
      1.3,
      (e) => {
        let n = {},
          r = DM(V((e - 0.05) / 1.1)) ** 0.6,
          i = AM(e, 0.15, 0.4) * (1 - AM(e, 0.85, 1.15));
        return (
          RM(n, `both`, HM, 72, i * t),
          IM(n, `lift`, t * 0.03 * i),
          FM(n, 1 - t * 0.035 * r),
          IM(n, `lean`, t * 0.09 * Math.sin(Y * 0.9 * V((e - 0.15) / 0.9)) * r),
          e > 0.3 && e < 1 && (MM(n, `antR`).state = `droop`),
          (MM(n, `wings`).rot =
            t * 0.06 * Math.sin(Y * 0.9 * V((e - 0.15) / 0.9)) * r),
          e > 0.12 && e < 1.15 && (n.mood = `shy`),
          n
        );
      },
      {
        events: [
          U.particle(0.3, `question`, { anchor: `top` }),
          U.sound(0.2, `hm`),
        ],
        label: `w.shrug`,
      },
    ),
    e.reduced,
  );
}
function bN(e) {
  let t = UM(e.reduced),
    n = oN;
  return VM(
    (e) => {
      let r = {},
        i = V(e / 0.3);
      return (
        IM(r, `lean`, 0.07 * i + t * 0.012 * Math.sin((Y * e) / n)),
        FM(r, 1 - 0.1 * i + t * 0.025 * Math.sin((Y * e) / n)),
        (MM(r, `wings`).rot = -0.1 * i),
        (MM(r, `wings`).sy = 1 - 0.08 * i),
        (r.mood = `sleepy`),
        r
      );
    },
    {
      period: n,
      idle: { blink: !1, look: !1 },
      events: [
        { at: 1.2, make: () => U.particle(0, `zzz`, { anchor: `top` }) },
        { at: 2, make: () => U.sound(0, `zzz`) },
      ],
      label: `w.napping`,
    },
  );
}
function xN(e) {
  let t = UM(e.reduced),
    n = 0.62;
  return WM(
    W(
      n,
      (e) => {
        let r = {},
          i =
            Math.exp((-2.2 * e) / n) *
            DM(V(e / 0.08) * 0.5) *
            (1 - AM(e, 0.7 * n, n)),
          a = Math.sin(Y * 3.2 * kM(e, 24));
        return (
          IM(r, `lean`, t * 0.1 * i * a),
          IM(r, `x`, t * 0.025 * i * a),
          LM(r, t * 0.9 * i * a),
          FM(r, 1 - t * 0.03 * i * Math.abs(a)),
          GM(r, t * 0.22 * i * a, t * 0.22 * i * a),
          (MM(r, `wings`).rot = -t * 0.08 * i * a),
          e < 0.5 && (r.mood = `angry`),
          r
        );
      },
      {
        events: [U.sound(0.02, `antTick`)],
        idle: { look: !1 },
        label: `w.refuse`,
      },
    ),
    e.reduced,
  );
}
function SN(e) {
  let t = UM(e.reduced),
    n = lN;
  return VM(
    (e) => {
      let r = {},
        i = Math.sin((Y * e) / n);
      return (IM(r, `lean`, t * 0.012 * i), KM(r, t * 0.05 * i), r);
    },
    {
      period: n,
      events: [
        {
          at: 3.6,
          make: (e) =>
            U.particle(0, `sparkle`, {
              kind: `scale`,
              anchor: `wingRoot`,
              dx: EM(e, 41) * 0.28,
              dy: 0.2,
            }),
        },
        { at: 3.62, make: () => U.sound(0, `scaleTink`) },
      ],
      label: `w.ambient`,
    },
  );
}
var CN = {
  entrance: tN,
  hover: uN,
  select: dN,
  nervous: fN,
  sleepy: pN,
  gag: mN,
  deselect: hN,
  move: XM,
  attack: QM,
  removed: eN,
  napping: bN,
  checked: gN,
  victory: _N,
  defeat: vN,
  shrug: yN,
  refuse: xN,
  ambient: SN,
  periods: {
    hover: nN,
    select: rN,
    nervous: iN,
    sleepy: aN,
    napping: oN,
    victory: sN,
    defeat: cN,
    ambient: lN,
  },
};
var wN = 34;
var TN = (e) => (e ? 0.5 : 1);
var EN = (e, t) => (t ? sy(e, 1.12) : e);
function DN(e, t, n, r = 0) {
  if (n <= 0.003) return;
  let i = MM(e, `beam`);
  ((i.state = t), (i.alpha = n), r && (i.rot = r));
}
var ON = (e, t) => {
  MM(e, `lamp`).state = t;
};
var kN = (e, t) => {
  let n = MM(e, `roof`);
  n.rot = (n.rot ?? 0) + t;
};
var AN = (e, t) => {
  let n = MM(e, `flag`);
  n.rot = (n.rot ?? 0) + t;
};
function jN(e, t, n) {
  let r = 0.36 + 0.83 * n - 0.66;
  return e * B(Math.atan2(r, Math.max(0.45, Math.abs(t))), -0.62, 0.62);
}
var MN = (e, t, n) => AM(e, t, n, X.smooth);
function NN(e, t, n, r) {
  let i = X.smooth(V((Math.abs(t) - 0.25) / 0.5));
  i > 0.5
    ? DN(e, t > 0 ? `right` : `left`, 0.6 * i * n)
    : DN(e, `halo`, r * (1 - i) * n);
}
var PN = (e) => B(0.55 + 0.21 * Math.sqrt(Math.max(e, 1)), 0.7, 1.1);
function FN(e) {
  let t = TN(e.reduced),
    n = Math.max(1, zM(e.off)),
    r = PN(n),
    i = e.facing,
    a = BM(e.facing, e.seed),
    o = 0.15 + 0.015 * Math.min(n, 4),
    s = n >= 4 ? 0.2 : 0.24,
    c = r - o - s,
    l = o + c,
    u = o * 0.4,
    d = (e) => {
      let t = V((n - 1) / 4);
      return (1 - t) * X.inOutCubic(e) + t * X.inOutSine(e);
    },
    f = jM([
      [0, 1],
      [o * 0.7, 0.965, X.outQuad],
      [o, 0.965],
      [o + 0.2 * c, 1.035, X.outCubic],
      [l - 0.05, 1.02],
      [l + 0.03, 0.95, X.inQuad],
      [l + 0.15, 1.02, X.outQuad],
      [r, 1],
    ]),
    p = jM([
      [0, 0],
      [o, -0.05, X.outQuad],
      [o + 0.3 * c, 0.15, X.inOutSine],
      [l - 0.05, 0.08],
      [l + 0.06, -0.05, X.outQuad],
      [r, 0],
    ]);
  return EN(
    W(
      r,
      (n) => {
        let m = {},
          h = V((n - o) / c),
          g = n <= o ? 1 : n >= l ? 0 : 1 - d(h);
        if (
          ((m.x = e.off[0] * g),
          (m.y = e.off[1] * g),
          FM(m, 1 + (f(n) - 1) * (0.5 + 0.5 * t)),
          IM(m, `lean`, i * t * p(n)),
          IM(m, `lift`, 0.018 * t * DM(h)),
          kN(
            m,
            -i * 0.05 * t * DM(h) +
              (n > l ? i * 0.07 * t * OM(n - l, 2.4, 4, s) : 0),
          ),
          n >= u && n < l + 0.1)
        ) {
          let t = MN(n, u, u + 0.12) * (1 - MN(n, l - 0.1, l + 0.08));
          DN(
            m,
            a > 0 ? `right` : `left`,
            0.9 * t,
            jN(a, -e.off[0] * g, -e.off[1] * g) * (0.7 + 0.3 * (1 - g)),
          );
        }
        (n >= u && n < u + 0.08 && ON(m, `flash`),
          LM(m, i * 0.85 * MN(n, 0.03, o + 0.05) * (1 - MN(n, l, l + 0.12))));
        let _ = Math.sin(Y * 2.5 * h) * DM(h) * 0.03 * t;
        return (
          (PM(m, `L`).dx = _),
          (PM(m, `R`).dx = -_),
          n > l + 0.04 &&
            n < Math.min(l + 0.34, r - 0.06) &&
            (m.mood = `happy`),
          m
        );
      },
      {
        events: [
          U.sound(u, `lampClick`),
          U.impact(l, `land`, { strength: 0.35 * t }),
          U.particle(l, `puff`),
        ],
        idle: { look: !1 },
        label: `b.move`,
      },
    ),
    e.reduced,
  );
}
var IN = 1;
function LN(e) {
  let t = TN(e.reduced),
    n = Math.max(1, zM(e.off)),
    r = e.facing,
    i = BM(e.facing, e.seed),
    a = B(IN / n, 0, 1),
    o = n * (1 - a),
    s = o > 0.05,
    c = s ? Math.min(0.5, 0.22 + 0.06 * o) : 0,
    l = s ? 0.16 : 0.26,
    u = l + c,
    d = u + 0.14,
    f = d,
    p = f + 0.06,
    m = f + 0.34,
    h = 0.3,
    g = m + h,
    _ = g + 0.5,
    v = -e.off[0] * a,
    y = -e.off[1] * a,
    b = jN(i, v, y),
    x = jM([
      [0, 1],
      [l, 1.04, X.outCubic],
      [u, 1.03],
      [u + 0.1, 1.07, X.outCubic],
      [f, 1.07],
      [f + 0.08, 0.97, X.outQuad],
      [f + 0.3, 1, X.inOutSine],
      [g - 0.02, 1],
      [g + 0.06, 0.95, X.inQuad],
      [g + 0.2, 1, X.outQuad],
      [_, 1],
    ]),
    S = jM([
      [0, 0],
      [l, -0.03, X.outQuad],
      [u + 0.02, 0.04, X.inOutSine],
      [d - 0.02, -0.13, X.inOutSine],
      [f + 0.1, 0.13, X.outCubic],
      [f + 0.34, 0.05, X.inOutSine],
      [g, 0.05],
      [g + 0.1, 0.05],
      [g + 0.28, 0.42, X.inOutSine],
      [g + 0.36, 0.42],
      [_, 0, X.inOutSine],
    ]),
    C = jM([
      [0, 0],
      [d - 0.02, 0.06, X.inOutSine],
      [f + 0.1, -0.1, X.outCubic],
      [f + 0.34, 0, X.inOutSine],
      [g + 0.28, 0.16, X.inOutSine],
      [g + 0.36, 0.16],
      [_, 0, X.inOutSine],
    ]);
  return {
    action: EN(
      W(
        _,
        (n) => {
          let o = {},
            p;
          if (
            ((p =
              n <= l
                ? 1
                : n < u
                  ? 1 - (1 - a) * X.inOutCubic((n - l) / c)
                  : n < m
                    ? a
                    : n < g
                      ? a * (1 - X.inOutCubic((n - m) / h))
                      : 0),
            (o.x = e.off[0] * p),
            (o.y = e.off[1] * p),
            FM(o, 1 + (x(n) - 1) * (0.5 + 0.5 * t)),
            IM(o, `lean`, r * t * S(n)),
            IM(
              o,
              `lift`,
              0.02 *
                t *
                (DM(V((n - l) / Math.max(c, 0.001))) * +(c > 0) +
                  DM(V((n - m) / h))),
            ),
            kN(o, -r * t * C(n)),
            n > f && AN(o, r * 0.3 * t * OM(n - f, 3, 3.5, _ - f)),
            n >= 0.04 && n < f)
          ) {
            ON(o, n < 0.14 ? `flash` : `lit`);
            let e = MN(n, 0.05, 0.3) * (1 - MN(n, f - 0.06, f));
            n < u + 0.08
              ? DN(o, `halo`, 0.75 * e)
              : DN(
                  o,
                  i > 0 ? `right` : `left`,
                  0.8 * MN(n, u, u + 0.1) * (1 - MN(n, f - 0.05, f)),
                  jN(i, v, y) * 0.6,
                );
          }
          if (n >= f && n < m) {
            ON(o, `flash`);
            let e = 0.85 + 0.15 * Math.sin(Y * 4 * kM(n - f, 12));
            DN(
              o,
              i > 0 ? `farRight` : `farLeft`,
              e * (1 - MN(n, m - 0.1, m)),
              b,
            );
          }
          return (
            n >= m &&
              n < m + 0.14 &&
              DN(o, `halo`, 0.6 * (1 - MN(n, m, m + 0.14))),
            n < d
              ? LM(
                  o,
                  s
                    ? r * 0.8 * MN(n, 0.04, 0.2)
                    : 0.9 *
                        t *
                        Math.sin(Y * V(n / d) * 1) *
                        (1 - MN(n, d - 0.12, d - 0.02)) +
                        r * 0.85 * MN(n, d - 0.12, d - 0.02),
                )
              : LM(o, r * 0.85 * (1 - MN(n, g - 0.1, g + 0.05))),
            RM(
              o,
              `both`,
              wN,
              70,
              AM(n, f, f + 0.08) * (1 - AM(n, f + 0.25, f + 0.4)) * t,
            ),
            n >= d && n < f + 0.3
              ? (o.mood = `angry`)
              : n >= g + 0.1 && n < _ - 0.06 && (o.mood = `happy`),
            o
          );
        },
        {
          events: [
            U.sound(0.05, `lampClick`),
            U.sound(f, `lampFlash`),
            U.impact(p, `flash`, {
              strength: 0.6 * (e.reduced ? 0.6 : 1),
              dir: i,
            }),
            U.particle(f + 0.02, `burst`, { anchor: `beamSeat` }),
            U.particle(f + 0.05, `sparkle`, {
              anchor: `beamSeat`,
              dx: i * 0.6,
            }),
            U.impact(g, `land`, { strength: 0.3 * t }),
            U.particle(g, `puff`),
            U.sound(g + 0.2, `creak`),
            ...(e.reduced ? [] : [U.shake(p, 0.35, 0.16)]),
          ],
          idle: { look: !1 },
          label: `b.attack`,
        },
      ),
      e.reduced,
    ),
    impactAt: p / (e.reduced ? 1.12 : 1),
  };
}
function RN(e) {
  let t = TN(e.reduced),
    n = 0.6 + 0.4 * V(e.strength),
    r = 1.6,
    i = Math.abs(e.from[0]) > 0.15 ? Math.sign(e.from[0]) : EM(e.seed, 5),
    a = 0.6,
    o = 1.12,
    s = 1.38 * i,
    c = jM([
      [0, 0],
      [0.22, 0.17 * i * n, X.outCubic],
      [0.42, -0.07 * i, X.inOutSine],
      [a, 0.05 * i, X.inOutSine],
      [o, s * 1.02, X.inQuad],
      [1.2400000000000002, s * 0.98, X.outQuad],
      [1.4200000000000002, s, X.inOutSine],
    ]);
  return EN(
    W(
      r,
      (e) => {
        let n = {
          contact: `ground`,
          bodyPose: `hurt`,
          footFollow: AM(e, a, o, X.smooth),
        };
        return (
          IM(n, `lean`, c(e)),
          FM(
            n,
            1 -
              0.1 * t * (e < 0.12 ? X.outQuad(e / 0.12) : 1 - AM(e, 0.12, 0.3)),
          ),
          e < 0.1
            ? ON(n, `flash`)
            : e < 0.5 || e > 0.62
              ? ON(n, `dim`)
              : ON(n, `lit`),
          e < 0.4 && DN(n, `halo`, 0.9 * (1 - MN(e, 0.05, 0.4))),
          kN(
            n,
            -i *
              0.28 *
              t *
              (e < 0.2 ? X.outCubic(e / 0.2) : 1 - 0.4 * AM(e, 0.2, 0.5)) +
              (e > o ? i * 0.22 * t * OM(e - o, 2.6, 4.5) : 0),
          ),
          e > o && AN(n, i * 0.4 * t * OM(e - o, 3.2, 3.5)),
          RM(n, `both`, wN, 150, AM(e, 0.02, 0.1) * (1 - AM(e, 0.5, 0.9)) * t),
          e > o &&
            e < 1.4200000000000002 &&
            IM(n, `lift`, 0.04 * t * DM((e - o) / 0.3)),
          (n.mood = e < 0.3 ? `hurt` : e < a ? `surprised` : `dizzy`),
          n
        );
      },
      {
        events: [
          U.sound(0.02, `lampFlash`),
          U.particle(0.03, `burst`, { anchor: `beamSeat` }),
          U.particle(0.12, `star`, { anchor: `top` }),
          U.sound(0.5499999999999999, `creak`),
          U.impact(o, `faint-land`, { strength: 0.5 * n }),
          U.particle(o, `puff`),
          U.sound(o, `thud`),
          U.world(r, `removed`),
        ],
        idle: !1,
        label: `b.removed`,
      },
    ),
    e.reduced,
  );
}
function zN(e, t) {
  let n = TN(t.reduced),
    r = Math.max(0, e),
    i = TM(t.seed, 11, -0.03, 0.03),
    a = 0.5,
    o = r + a + i * 0.5,
    s = o + 0.32,
    c = jM([
      [o - 0.001, 1],
      [o + 0.09, 1.06, X.outCubic],
      [o + 0.2, 0.965, X.inOutSine],
      [s, 1, X.inOutSine],
    ]);
  return W(
    s,
    (e) => {
      let t = { draw: AM(e, r, r + a, X.inOutSine) };
      return (
        FM(t, 1 + (c(e) - 1) * (0.5 + 0.5 * n)),
        e < o - 0.04 ? ON(t, `dim`) : e < o + 0.06 && ON(t, `flash`),
        e > o &&
          e < o + 0.3 &&
          DN(t, `halo`, 0.8 * (1 - MN(e, o + 0.1, o + 0.3))),
        kN(t, e > o ? 0.1 * n * OM(e - o, 2.6, 4.5, s - o) : 0),
        IM(
          t,
          `lift`,
          e > o && e < o + 0.22 ? 0.03 * n * DM((e - o) / 0.22) : 0,
        ),
        e > o + 0.04 && e < o + 0.3 && (t.mood = `happy`),
        t
      );
    },
    {
      events: [
        U.sound(o, `lampClick`),
        U.particle(o, `sparkle`, { anchor: `beamSeat` }),
      ],
      idle: !1,
      label: `b.entrance`,
    },
  );
}
var BN = 3;
var VN = 2.4;
var HN = 1.5;
var UN = 9;
var WN = 4.5;
var GN = 4;
var KN = 6;
var qN = 4;
function JN(e) {
  let t = TN(e.reduced),
    n = BN;
  return VM(
    (e) => {
      let r = {},
        i = X.outCubic(V(e / 0.28));
      return (
        IM(r, `lift`, t * 0.012 * i),
        FM(r, 1 + t * 0.035 * i),
        kN(r, -0.03 * t * i),
        AN(r, t * 0.14 * i * Math.sin((Y * 2 * e) / n)),
        IM(r, `lean`, t * 0.012 * i * Math.sin((Y * e) / n + 1)),
        DN(r, `halo`, i * (0.55 + 0.25 * t * Math.sin((Y * e) / n))),
        (r.brow = `raised`),
        r
      );
    },
    { period: n, label: `b.hover` },
  );
}
function YN(e) {
  let t = TN(e.reduced),
    n = VN;
  return VM(
    (e) => {
      let r = {},
        i = X.outCubic(V(e / 0.35)),
        a = ((e % n) + n) % n;
      (IM(r, `lift`, t * i * (0.03 + 0.01 * Math.sin((Y * e) / n))),
        FM(r, 1 + t * 0.05 * i),
        IM(r, `lean`, t * 0.02 * Math.sin((Y * e) / n)),
        kN(r, -0.04 * t * Math.sin((Y * e) / n + 1) * i),
        a >= 0.1 && a < 0.19 && ON(r, `flash`));
      let o = Math.sin((Y * e) / n) * i;
      return (
        NN(
          r,
          o * (0.5 + 0.5 * t),
          1,
          0.65 + 0.15 * t * Math.sin((Y * e) / n + 2),
        ),
        LM(r, 0.85 * t * o),
        IM(r, `lean`, t * 0.03 * o),
        AN(r, t * 0.12 * i * Math.sin((Y * 2 * e) / n)),
        RM(r, `both`, wN, 60, i * 0.5 * t),
        (r.brow = `raised`),
        r
      );
    },
    {
      period: n,
      idle: { look: !1 },
      events: [{ at: 0.1, make: () => U.sound(0, `lampClick`) }],
      label: `b.select`,
    },
  );
}
function XN(e) {
  let t = TN(e.reduced),
    n = HN;
  return VM(
    (r) => {
      let i = {},
        a = V(r / 0.15),
        o = kM(r, 12),
        s = Math.floor((((r % n) + n) % n) / 0.3);
      return (
        IM(i, `x`, t * 0.008 * a * Math.sin(Y * 10 * o)),
        FM(i, 1 + t * 0.012 * a * Math.sin(Y * 8 * o)),
        IM(i, `lean`, t * 0.02 * Math.sin((Y * r) / n) * a),
        kN(i, t * 0.045 * a * Math.sin(Y * 10 * o + 0.7)),
        AN(i, t * 0.12 * a * Math.sin(Y * 10 * o + 2)),
        LM(i, t * 0.6 * a * Math.sin((Y * o) / 0.75)),
        ON(i, e.reduced || (s !== 1 && s !== 3) ? `dim` : `lit`),
        (i.mood = `worried`),
        i
      );
    },
    {
      period: n,
      idle: { look: !1 },
      events: [
        {
          at: 0.2,
          make: () => U.particle(0, `sweat`, { anchor: `top`, dx: 0.2 }),
        },
        { at: 0.3, make: () => U.sound(0, `lampClick`) },
      ],
      label: `b.nervous`,
    },
  );
}
function ZN(e) {
  let t = TN(e.reduced),
    n = UN,
    r = jM([
      [0, 0],
      [3, 0.1, X.inQuad],
      [3.15, -0.03, X.outCubic],
      [3.6, 0, X.inOutSine],
      [5, 0.03, X.inOutSine],
      [6.6, -0.03, X.inOutSine],
      [7.8, 0.03, X.inOutSine],
      [n, 0, X.inOutSine],
    ]),
    i = jM([
      [0, 1],
      [3, 0.95, X.inOutSine],
      [3.15, 1.04, X.outCubic],
      [3.6, 1, X.inOutSine],
      [7, 0.97, X.inOutSine],
      [n, 1, X.inOutSine],
    ]);
  return VM(
    (e) => {
      let a = {},
        o = ((e % n) + n) % n,
        s = V(e / 0.4);
      return (
        IM(a, `lean`, t * r(o)),
        FM(a, 1 + (i(o) - 1) * t),
        kN(a, -0.16 * t * s + 0),
        ON(a, o >= 3.15 && o < 3.9 ? `lit` : `dim`),
        o >= 5.2 && o < 6.2 && DN(a, `halo`, 0.3 * t * DM((o - 5.2) / 1)),
        (a.mood = o >= 3.15 && o < 3.5 ? `surprised` : `sleepy`),
        a
      );
    },
    {
      period: n,
      idle: { blink: !1, look: !1 },
      events: [
        { at: 1.6, make: () => U.particle(0, `zzz`, { anchor: `top` }) },
        { at: 2.6, make: () => U.particle(0, `zzz`, { anchor: `top` }) },
        { at: 3.17, make: () => U.sound(0, `lampClick`) },
        { at: 6, make: () => U.sound(0, `sigh`) },
      ],
      label: `b.sleepy`,
    },
  );
}
function QN(e) {
  let t = TN(e.reduced),
    n = Math.min(2, Math.floor(wM(e.seed, 21) * 3)),
    r = EM(e.seed, 22);
  if (n === 0)
    return EN(
      W(
        2.8,
        (e) => {
          let n = {},
            i =
              e < 0.35
                ? -r * X.outQuad(e / 0.35)
                : e < 0.75
                  ? -r
                  : e < 1.15
                    ? -r + 2 * r * X.inOutSine((e - 0.75) / 0.4)
                    : e < 1.55
                      ? r
                      : r * (1 - X.inOutSine(V((e - 1.55) / 0.35)));
          if (
            (LM(n, t * 0.95 * i),
            IM(n, `lean`, t * 0.04 * i),
            e < 1.5 &&
              NN(
                n,
                i * (0.5 + 0.5 * t),
                MN(e, 0.05, 0.2) * (1 - MN(e, 1.35, 1.5)),
                0.5,
              ),
            e >= 1.5 && e < 2.6)
          ) {
            ON(n, e < 2 ? `flash` : `lit`);
            let t = MN(e, 1.5, 1.7) * (1 - MN(e, 2.4, 2.6));
            DN(
              n,
              (e < 1.9 || (e >= 2.05 && e < 2.2)) == r > 0
                ? `farLeft`
                : `farRight`,
              t * 0.9,
              0,
            );
          }
          return (
            FM(n, 1 + t * 0.04 * DM(V((e - 1.45) / 1))),
            kN(n, -t * 0.05 * DM(V((e - 1.45) / 1))),
            e > 2 && e < 2.6 && (n.mood = `happy`),
            n
          );
        },
        {
          events: [
            U.sound(0.05, `creak`),
            U.sound(1.5, `lampClick`),
            U.sound(1.9, `beamTick`),
            U.sound(2.15, `beamTick`),
          ],
          idle: { look: !1 },
          label: `b.gag.sweep`,
        },
      ),
      e.reduced,
    );
  if (n === 1)
    return EN(
      W(
        2,
        (e) => {
          let n = {},
            i = DM(V((e - 0.2) / 1.2));
          return (
            IM(n, `lean`, t * 0.16 * r * X.inOutSine(i)),
            kN(
              n,
              -r * t * 0.3 * i +
                r * 0.08 * t * OM(e - 1.3, 3, 4, 0.7) * (e > 1.3),
            ),
            AN(n, r * t * 0.3 * OM(e - 0.4, 3, 3.5, 1.6) * (e > 0.4)),
            e >= 1.3 && e < 1.5
              ? ON(n, `dim`)
              : e >= 1.5 && e < 1.62 && ON(n, `flash`),
            LM(n, r * t * 0.4 * i, -t * 0.4 * i),
            e > 0.3 && e < 1.7 && (n.mood = `happy`),
            n
          );
        },
        {
          events: [
            U.sound(0.3, `creak`),
            U.sound(1.5, `lampClick`),
            U.particle(1.52, `ding`, { anchor: `beamSeat` }),
          ],
          idle: { look: !1 },
          label: `b.gag.hat`,
        },
      ),
      e.reduced,
    );
  let i = 2.4;
  return EN(
    W(
      i,
      (e) => {
        let n = {},
          r = DM(V(e / i)) ** 0.6,
          a = kM(e, 12);
        return (
          IM(n, `lean`, t * 0.09 * Math.sin(Y * 1 * e) * r),
          kN(n, -t * 0.07 * Math.sin(Y * 1 * e + 0.6) * r),
          AN(n, t * 0.2 * Math.sin(Y * 2 * e) * r),
          DN(
            n,
            `halo`,
            r * (0.5 + 0.35 * (Math.sin(Y * 2 * a) > 0 ? 1 : 0.35)),
          ),
          IM(n, `lift`, t * 0.012 * r * (0.5 - 0.5 * Math.cos(Y * 2 * e))),
          e > 0.2 && e < 2.1999999999999997 && (n.mood = `happy`),
          n
        );
      },
      {
        events: [
          U.sound(0.2, `beamTick`),
          U.sound(0.7, `beamTick`),
          U.sound(1.2, `beamTick`),
          U.sound(1.7, `beamTick`),
        ],
        label: `b.gag.beacon`,
      },
    ),
    e.reduced,
  );
}
function $N(e) {
  let t = TN(e.reduced),
    n = 0.7,
    r = jM([
      [0, 1],
      [0.08, 0.955, X.outQuad],
      [0.28, 1.02, X.outQuad],
      [n, 1],
    ]);
  return EN(
    W(
      n,
      (e) => {
        let n = {};
        return (
          FM(n, 1 + (r(e) - 1) * (0.5 + 0.5 * t)),
          kN(
            n,
            0.09 * t * OM(e - 0.05, 2.4, 4, 0.6499999999999999) * (e > 0.05),
          ),
          e >= 0.1 && e < 0.18 && ON(n, `flash`),
          e < 0.5 && (n.mood = `happy`),
          n
        );
      },
      {
        events: [U.particle(0.08, `puff`), U.sound(0.1, `lampClick`)],
        label: `b.deselect`,
      },
    ),
    e.reduced,
  );
}
function eP(e) {
  let t = TN(e.reduced),
    n = 1.5;
  return EN(
    W(
      n,
      (e) => {
        let r = {},
          i = DM(V(e / n)) ** 0.5,
          a =
            e < 0.25
              ? -X.outQuad(e / 0.25)
              : e < 0.7
                ? -1 + 2 * X.inOutSine((e - 0.25) / 0.45)
                : 1 - X.inOutSine(V((e - 0.7) / 0.4));
        if (
          (LM(r, t * 0.95 * a),
          FM(r, 1 + t * 0.05 * i),
          IM(r, `lift`, t * 0.015 * i),
          e >= 0.12 && e < 1.1)
        ) {
          ON(r, e < 0.3 ? `flash` : `lit`);
          let t = MN(e, 0.12, 0.25) * (1 - MN(e, 0.95, 1.1));
          DN(r, e < 0.6 ? `farLeft` : `farRight`, 0.85 * t * 1);
        }
        return (e > 0.1 && e < 1.3 && (r.mood = `worried`), r);
      },
      {
        events: [
          U.sound(0.12, `lampClick`),
          U.sound(0.6, `beamTick`),
          U.particle(0.15, `exclaim`, { anchor: `top` }),
        ],
        idle: { look: !1 },
        label: `b.checked`,
      },
    ),
    e.reduced,
  );
}
function tP(e) {
  let t = TN(e.reduced),
    n = GN;
  return VM(
    (e) => {
      let r = {},
        i = X.outCubic(V(e / 0.4)),
        a = ((e % n) + n) % n,
        o = a < 2 ? 1 : -1;
      (FM(r, 1 + t * 0.06 * i + t * 0.012 * Math.sin(((Y * 2 * e) / n) * 2)),
        IM(r, `lean`, t * 0.09 * Math.sin((Y * e) / n) * i),
        kN(r, -t * 0.05 * Math.sin((Y * e) / n + 0.8) * i),
        IM(r, `lift`, t * 0.02 * i * (0.5 - 0.5 * Math.cos((Y * 2 * e) / n))),
        ON(r, a % 1 < 0.14 ? `flash` : `lit`));
      let s = MN((a % 2) / 2, 0, 0.1) * (1 - MN((a % 2) / 2, 0.85, 1));
      return (
        DN(r, o > 0 ? `farRight` : `farLeft`, 0.85 * s * i, 0),
        RM(r, `both`, wN, 150, i * t),
        (r.mood = `victorious`),
        r
      );
    },
    {
      period: n,
      events: [
        { at: 0.3, make: () => U.sound(0, `lampClick`) },
        { at: 1.3, make: () => U.sound(0, `lampClick`) },
        { at: 2.3, make: () => U.particle(0, `note`, { anchor: `top` }) },
      ],
      label: `b.victory`,
    },
  );
}
function nP(e) {
  let t = TN(e.reduced),
    n = KN;
  return VM(
    (e) => {
      let r = {},
        i = AM(e, 0.1, 0.6),
        a = ((e % n) + n) % n,
        o = DM(V((a - 3.9) / 1.4));
      return (
        FM(
          r,
          1 -
            t * (0.06 * i + 0.025 * o) +
            (e < 0.4 ? -t * 0.05 * DM(e / 0.4) : 0),
        ),
        IM(r, `lean`, t * (-0.03 * i + 0.02 * Math.sin((Y * e) / n))),
        kN(r, -0.14 * t * i),
        AN(r, -0.1 * t * i),
        ON(r, a >= 3 && a < 3.6 ? `lit` : `dim`),
        e < 0.4 && (r.bodyPose = `hurt`),
        (r.mood = e < 0.4 ? `hurt` : `worried`),
        r
      );
    },
    {
      period: n,
      idle: { look: !1 },
      events: [
        { at: 3, make: () => U.sound(0, `lampClick`) },
        { at: 4.2, make: () => U.sound(0, `sigh`) },
      ],
      label: `b.defeat`,
    },
  );
}
function rP(e) {
  let t = TN(e.reduced);
  return EN(
    W(
      1.5,
      (e) => {
        let n = {},
          r = DM(V((e - 0.05) / 1.3)) ** 0.6,
          i = Math.sin(Y * V((e - 0.2) / 1));
        return (
          IM(n, `lean`, t * 0.08 * i * r),
          kN(n, -t * 0.1 * i * r),
          RM(n, `both`, wN, 72, AM(e, 0.2, 0.5) * (1 - AM(e, 1, 1.3)) * t),
          IM(n, `lift`, t * 0.02 * r),
          e >= 0.3 && e < 0.9 && ON(n, `dim`),
          e > 0.12 && e < 1.3 && (n.mood = `shy`),
          n
        );
      },
      {
        events: [
          U.particle(0.35, `question`, { anchor: `top` }),
          U.sound(0.3, `hm`),
        ],
        label: `b.shrug`,
      },
    ),
    e.reduced,
  );
}
function iP(e) {
  let t = TN(e.reduced),
    n = WN;
  return VM(
    (e) => {
      let r = {},
        i = V(e / 0.3);
      return (
        IM(r, `lean`, 0.06 * i + t * 0.01 * Math.sin((Y * e) / n)),
        FM(r, 1 - 0.09 * i + t * 0.02 * Math.sin((Y * e) / n)),
        kN(r, -0.16 * i),
        ON(r, `dim`),
        DN(r, `halo`, i * (0.3 + 0.12 * t * Math.sin((Y * e) / n))),
        (r.mood = `sleepy`),
        r
      );
    },
    {
      period: n,
      idle: { blink: !1, look: !1 },
      events: [
        { at: 1.5, make: () => U.particle(0, `zzz`, { anchor: `top` }) },
        { at: 2.5, make: () => U.sound(0, `zzz`) },
      ],
      label: `b.napping`,
    },
  );
}
function aP(e) {
  let t = TN(e.reduced),
    n = 0.8;
  return EN(
    W(
      n,
      (e) => {
        let r = {},
          i =
            Math.exp((-1.6 * e) / n) *
            DM(V(e / 0.1) * 0.5) *
            (1 - AM(e, 0.7 * n, n)),
          a = Math.sin(Y * 1.9 * e);
        return (
          IM(r, `lean`, t * 0.1 * i * a),
          kN(r, -t * 0.14 * i * a),
          AN(r, t * 0.3 * i * a),
          LM(r, t * 0.9 * i * a),
          e >= 0.05 && e < 0.5 && ON(r, `dim`),
          FM(r, 1 - t * 0.02 * i),
          e < 0.6 && (r.mood = `angry`),
          r
        );
      },
      {
        events: [U.sound(0.05, `creak`), U.sound(0.05, `lampClick`)],
        idle: { look: !1 },
        label: `b.refuse`,
      },
    ),
    e.reduced,
  );
}
function oP(e) {
  let t = TN(e.reduced),
    n = qN;
  return VM(
    (e) => {
      let r = {},
        i = ((e % n) + n) % n;
      return (
        DN(
          r,
          `halo`,
          t * (0.22 + 0.14 * Math.sin((Y * e) / n)) +
            (i > 2.5 && i < 3.1 ? t * 0.3 * DM((i - 2.5) / 0.6) : 0),
        ),
        IM(r, `lean`, t * 0.008 * Math.sin((Y * e) / n)),
        r
      );
    },
    {
      period: n,
      events: [{ at: 2.6, make: () => U.sound(0, `beamTick`) }],
      label: `b.ambient`,
    },
  );
}
var sP = {
  entrance: zN,
  hover: JN,
  select: YN,
  nervous: XN,
  sleepy: ZN,
  gag: QN,
  deselect: $N,
  move: FN,
  attack: LN,
  removed: RN,
  napping: iP,
  checked: eP,
  victory: tP,
  defeat: nP,
  shrug: rP,
  refuse: aP,
  ambient: oP,
  periods: {
    hover: BN,
    select: VN,
    nervous: HN,
    sleepy: UN,
    napping: WN,
    victory: GN,
    defeat: KN,
    ambient: qN,
  },
};
function cP(e) {
  return e.props ? { props: e.props } : {};
}
function lP(e, t) {
  return ty(
    e,
    new Jv({
      duration: t.duration,
      sample: (e) => cP(t.sample(e)),
      eventsIn: () => [],
      label: `keeper-props`,
    }),
  );
}
function uP(e, t) {
  return t.side === `w`
    ? e(CN)(t)
    : t.side === `b`
      ? e(sP)(t)
      : lP(e(CN)(t), e(sP)(t));
}
var dP = (e) => (e === `b` ? sP : CN);
function fP(e, t, n) {
  e.pose = { ...e.pose, mood: `neutral` };
  let r = e.idle.cfg;
  (t === `w`
    ? ((r.breath &&= { ...r.breath, amp: 0.016, period: 2.9 }),
      (r.blink &&= { ...r.blink, gap: 2.9 }),
      (r.ears &&= { gap: [1.6, 4.2], angle: [0.12, 0.28] }))
    : ((r.breath &&= { ...r.breath, amp: 0.008, period: 5.4 }),
      (r.blink &&= { ...r.blink, gap: 4.6 }),
      (r.look &&= { ...r.look, wanderGap: [2.2, 5], wander: 0.9 })),
    e.idle.reset(),
    e.refresh());
}
var pP = () => new Jv({ duration: 0, sample: () => ({}), label: `noop` });
var mP = { victory: { w: 1, b: 0.875 }, defeat: { w: 1, b: 1 } };
function hP(e, t) {
  let n = t.side === `b` ? `b` : `w`,
    r = uP((t) => t[e], t),
    i = (dP(n).periods[e] ?? 3) * mP[e][n];
  return new Jv({
    duration: i,
    sample: (e) => r.sample(e),
    eventsIn: (e, t) => r.eventsIn(e, Math.min(t, i)),
    idle: r.idle,
    label: `${n}.${e}`,
  });
}
var gP = {
  kind: `b`,
  rest: fP,
  entrance: (e, t) => uP((t) => (n) => t.entrance(e, n), t),
  hover: (e) => uP((e) => e.hover, e),
  select: (e) => uP((e) => e.select, e),
  nervous: (e) => uP((e) => e.nervous, e),
  sleepy: (e) => uP((e) => e.sleepy, e),
  gag: (e) => uP((e) => e.gag, e),
  deselect: (e) => uP((e) => e.deselect, e),
  move: (e) => dP(e.side).move(e),
  attack: (e) => dP(e.side).attack(e),
  removed: (e) => dP(e.side).removed(e),
  napping: (e) => uP((e) => e.napping, e),
  checked: (e) => uP((e) => e.checked, e),
  victory: (e) => hP(`victory`, e),
  defeat: (e) => hP(`defeat`, e),
  shrug: (e) => uP((e) => e.shrug, e),
  promoteOut: () => pP(),
  promoteIn: () => pP(),
  refuse: (e) => uP((e) => e.refuse, e),
  ambient: (e) => uP((e) => e.ambient, e),
  periods: (e) => dP(e).periods,
};
var _P = Math.PI * 2;
function vP(e, t = 0) {
  let n =
    (Math.floor(e * 65536) ^
      Math.imul(Math.floor(e) | 0, 668265261) ^
      Math.imul((t | 0) + 1, 2654435761)) |
    0;
  return (
    (n = Math.imul(n ^ (n >>> 16), 2246822507)),
    (n = Math.imul(n ^ (n >>> 13), 3266489909)),
    (n ^= n >>> 16),
    (n >>> 0) / 4294967296
  );
}
var yP = (e, t) => Math.floor(Math.max(0, e) * t + 1e-9);
function bP(e, t, n) {
  let r = yP(e, t);
  return (r % 2 == 0 ? 1 : -1) * (0.55 + 0.45 * vP(n, r));
}
function xP(e, t, n, r, i) {
  if (e <= t || e >= i) return 0;
  if (e < n) {
    let r = (e - t) / (n - t);
    return r * r * (3 - 2 * r);
  }
  if (e <= r) return 1;
  let a = (i - e) / (i - r);
  return a * a * (3 - 2 * a);
}
function SP(e, t, n, r, i, a) {
  if (e <= t) return 0;
  let o = e - t,
    s = a === void 0 ? 1 : 1 - TP(e, a - 0.12, a);
  return n * Math.exp(-i * o) * Math.sin(_P * r * o) * s;
}
function CP(e, t, n = 0.5) {
  return Math.max(0, Math.sin((Math.PI * e) / t)) ** n;
}
function wP(e, t, n) {
  return e <= t || e >= n ? 0 : Math.sin((Math.PI * (e - t)) / (n - t));
}
function TP(e, t, n) {
  if (n <= t) return +(e >= n);
  let r = V((e - t) / (n - t));
  return r * r * (3 - 2 * r);
}
function EP(e, t, n) {
  return t <= 0
    ? e instanceof Jv
      ? e
      : new Jv({
          duration: e.duration,
          sample: (t) => e.sample(t),
          eventsIn: (t, n) => e.eventsIn(t, n),
          idle: e.idle,
          label: e.label,
        })
    : new Jv({
        duration: e.duration + t,
        idle: e.idle,
        label: e.label,
        sample: (r) => (r < t ? n : e.sample(r - t)),
        eventsIn: (n, r) =>
          e.eventsIn(n - t, r - t).map((e) => ({ ...e, at: e.at + t })),
      });
}
function DP(e, t = 0.12) {
  let n = e.duration;
  return new Jv({
    duration: n,
    idle: e.idle,
    label: e.label,
    sample: (r) => {
      let i = e.sample(r);
      if (!(r > n - t)) return i;
      let a = V((n - r) / t),
        o = kv(i, a * a * (3 - 2 * a));
      return (i.x !== void 0 && (o.x = i.x), i.y !== void 0 && (o.y = i.y), o);
    },
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
function OP(e, t, n, r = 1e5) {
  return (i, a) => {
    let o = [],
      s = Math.max(0, Math.ceil((i - t) / e - 1e-9));
    for (; s < r; s++) {
      let r = t + s * e;
      if (r > a) break;
      if (r <= i) continue;
      let c = n(s);
      c && o.push({ ...c, at: r });
    }
    return o;
  };
}
function kP(e, t = {}) {
  return W(1 / 0, e, { eventsIn: t.events, idle: t.idle, label: t.label });
}
function AP(e, t) {
  return t
    .map((t) => ({ ...t, at: B(t.at, 0, e) }))
    .sort((e, t) => e.at - t.at);
}
function jP(e, t, n) {
  let r = t.split(`.`),
    i = e;
  for (let e = 0; e < r.length - 1; e++) {
    let t = r[e],
      n = i[t];
    ((typeof n != `object` || !n) && (i[t] = {}), (i = i[t]));
  }
  let a = r[r.length - 1];
  return ((i[a] = (i[a] ?? 0) + n), e);
}
function MP(e, t, n) {
  let r = t.split(`.`),
    i = e;
  for (let e = 0; e < r.length - 1; e++) {
    let t = r[e],
      n = i[t];
    ((typeof n != `object` || !n) && (i[t] = {}), (i = i[t]));
  }
  return ((i[r[r.length - 1]] = n), e);
}
function NP(e, t) {
  let n = t.length;
  if (!n) return 0;
  if (e <= t[0][0]) return t[0][1];
  if (e >= t[n - 1][0]) return t[n - 1][1];
  let r = 0;
  for (; r < n - 2 && t[r + 1][0] <= e;) r++;
  let i = t[r],
    a = t[r + 1],
    o = a[0] > i[0] ? (e - i[0]) / (a[0] - i[0]) : 1;
  return ov(i[1], a[1], a[2] ? a[2](o) : o);
}
var PP = (e, t, n) => B(e, t, n);
var FP = t({
  ROLL_POST: () => eF,
  ROLL_PRE: () => $P,
  attack: () => iF,
  attackTimes: () => rF,
  checked: () => sF,
  defeat: () => lF,
  deselect: () => XP,
  entrance: () => WP,
  gag: () => YP,
  hover: () => GP,
  move: () => nF,
  napping: () => oF,
  nervous: () => qP,
  refuse: () => dF,
  removed: () => aF,
  rockCount: () => ZP,
  rockTime: () => QP,
  rollTime: () => tF,
  select: () => KP,
  shimmer: () => UP,
  shrug: () => uF,
  sleepy: () => JP,
  victory: () => cF,
});
var IP = (e, t) => ((e.sy = t), (e.sx = 1 / t), e);
var LP = (e) => (e.reduced ? 0.5 : 1);
var RP = (e) => (e.reduced ? 0.9 : 1);
var zP = (e) => (e < 0 ? 0 : e > 1 ? 1 : e);
var BP = 0.42;
function VP(e, t, n, r) {
  let i = 1 + n;
  (MP(e, `props.${t}.sx`, i),
    MP(e, `props.${t}.sy`, i),
    r !== void 0 && MP(e, `props.${t}.alpha`, r));
}
var HP = (e, t, n = 0.16) =>
  e > t && e < t + n ? Math.sin((Math.PI * (e - t)) / n) : 0;
function UP(e, t) {
  let n = vP(t, 5) * _P,
    r = vP(t, 6) * _P,
    i = 0.62 + 0.38 * Math.sin((_P * e) / 3.1 + n),
    a = 0.5 + 0.5 * Math.sin((_P * e) / 4.7 + r),
    o = {};
  return (
    VP(o, `glintA`, 0.12 * (i - 0.6), 0.55 + 0.45 * i),
    VP(o, `glintB`, 0.16 * (a - 0.5), 0.3 + 0.7 * a * a),
    o
  );
}
function WP(e, t) {
  let n = LP(t),
    r = 0.85;
  return EP(
    W(
      r,
      (e) => {
        let t = {};
        ((t.draw = NP(e, [
          [0, 0],
          [0.55, 1, H.inOutSine],
        ])),
          IP(
            t,
            NP(e, [
              [0, 1],
              [0.4, 1],
              [0.56, 1 - 0.07 * n, H.inOutSine],
              [0.7, 1 + 0.05 * n, H.outQuad],
              [0.8, 1 - 0.015 * n, H.inOutSine],
              [r, 1, H.inOutSine],
            ]),
          ),
          (t.lift = 0.03 * n * wP(e, 0.5, 0.85)),
          MP(
            t,
            `props.crystals.dy`,
            NP(e, [
              [0, -0.2],
              [0.5, -0.2],
              [0.72, 0.03 * n, H.outQuad],
              [0.82, -0.01 * n, H.inOutSine],
              [r, 0, H.inOutSine],
            ]),
          ),
          MP(t, `props.crystals.alpha`, TP(e, 0.5, 0.58)),
          jP(t, `props.crystals.rot`, SP(e, 0.74, 0.14 * n, 2.6, 4.5, r)));
        for (let r of [`glintA`, `glintB`])
          VP(
            t,
            r,
            0.9 * n * HP(e, r === `glintA` ? 0.72 : 0.79, 0.2),
            e < 0.7 ? 0 : 1,
          );
        return (
          (t.mood = e < 0.55 ? `sleepy` : e < 0.75 ? `surprised` : `neutral`),
          t
        );
      },
      {
        events: AP(r, [
          U.sound(0.5, `grind`),
          ...[0, 1, 2, 3, 4].map((e) =>
            U.sound(0.6 + 0.045 * e, `tink`, { i: e }),
          ),
          U.particle(0.72, `sparkle`),
          U.particle(0.78, `sparkle`),
        ]),
        idle: { ears: !1 },
      },
    ),
    e,
    { draw: 0 },
  ).named(`b.entrance`);
}
function GP(e) {
  let t = LP(e),
    n = 2.4,
    r = vP(e.seed, 1) < 0.5 ? -1 : 1;
  return kP(
    (e) => {
      let i = TP(e, 0, 0.25),
        a = {};
      return (
        IP(a, 1 + i * 0.025 * t + 0.008 * t * i * Math.sin((_P * e) / n)),
        MP(a, `props.crystals.dy`, 0.025 * t * i),
        jP(
          a,
          `props.crystals.rot`,
          0.02 * t * i * Math.sin((_P * e) / n + 0.7),
        ),
        VP(a, `glintA`, i * (0.3 + 0.2 * Math.sin((_P * e) / (n / 2))) * t, 1),
        VP(
          a,
          `glintB`,
          i * (0.3 + 0.2 * Math.sin((_P * e) / (n / 2) + 2)) * t,
          1,
        ),
        (a.mouth = `flat`),
        (a.brow = `raised`),
        (a.look = { x: 0.65 * r * i, y: 0.1 * i }),
        (a.blush = 1 + 0.3 * i),
        a
      );
    },
    {
      events: OP(n, 0.1, (e) => U.sound(0, `tink`, { i: e % 5, soft: !0 })),
      idle: { look: !1, ears: !1 },
      label: `b.hover`,
    },
  );
}
function KP(e) {
  let t = LP(e),
    n = 1.2;
  return kP(
    (r) => {
      let i = {},
        a = NP(r, [
          [0, 0],
          [0.12, 0, H.linear],
          [0.42, 1, H.outCubic],
        ]),
        o = wP(r, 0, 0.22),
        s = Math.sin((_P * r) / n);
      return (
        (i.lift = a * (0.1 + 0.015 * s) * t),
        IP(i, 1 - 0.12 * o * t + a * (0.03 * t - 0.01 * t * s)),
        (i.lean = 0.03 * t * a * Math.sin((_P * r) / (n * 2))),
        jP(
          i,
          `props.crystals.rot`,
          0.05 * t * a * Math.sin((_P * r) / (n / 3)) +
            0.025 * t * a * Math.sin((_P * r) / (n / 5) + 1),
        ),
        MP(
          i,
          `props.crystals.dy`,
          0.03 * t * a * (0.5 + 0.5 * Math.sin((_P * r) / n)),
        ),
        VP(
          i,
          `glintA`,
          0.35 * t * a * (0.5 + 0.5 * Math.sin((_P * r) / (n / 2))),
          1,
        ),
        VP(
          i,
          `glintB`,
          0.35 * t * a * (0.5 + 0.5 * Math.sin((_P * r) / (n / 2) + 1.6)),
          1,
        ),
        (i.eye = `wide`),
        (i.mouth = `flat`),
        (i.blush = 1.35),
        (i.x = t === 1 ? 0.0035 * a * bP(r, 12, e.seed) : 0),
        i
      );
    },
    {
      events: OP(n, 0.4, (e) => U.sound(0, `hum`, { i: e })),
      idle: { breath: !1, ears: !1 },
      label: `b.select`,
    },
  );
}
function qP(e) {
  let t = LP(e),
    n = 1.5;
  return kP(
    (r) => {
      let i = TP(r, 0, 0.2),
        a = {};
      a.mood = `worried`;
      let o = 0.5 + 0.5 * Math.sin((_P * r) / (n * 1.3));
      (IP(a, 1 - 0.04 * i * t + 0.008 * t * Math.sin((_P * r) / (n / 2))),
        (a.lean = 0.035 * t * i * Math.sin((_P * r) / (n * 2))),
        jP(
          a,
          `props.crystals.rot`,
          t === 1
            ? 0.06 * i * o * bP(r, 14, e.seed + 2)
            : 0.02 * i * Math.sin((_P * r) / n),
        ),
        (a.x = t === 1 ? 0.005 * i * o * bP(r, 12, e.seed + 1) : 0));
      let s = bP(r, 12, e.seed + 3) > 0 ? 1 : 0.15;
      return (
        VP(a, `glintA`, 0, 0.35 + 0.65 * (1 - i) + 0.65 * i * s),
        VP(a, `glintB`, 0, i * 0.2 + (1 - i) * 0.8),
        a
      );
    },
    {
      events: OP(n, 0.15, () => U.particle(0, `sweat`)),
      idle: { ears: !1, look: !1 },
      label: `b.nervous`,
    },
  );
}
function JP(e) {
  let t = LP(e),
    n = 4.6,
    r = 1.5;
  return kP(
    (e) => {
      let i = {},
        a = wP(e, 0.1, 0.95),
        o = TP(e, 0.95, r);
      (e > 0.18 &&
        e < 0.86 &&
        (MP(i, `props.crystals.state`, `open`),
        MP(i, `props.maw.state`, `open`)),
        (i.mood = `sleepy`),
        e < 0.9 && ((i.mouth = `open`), (i.mouthScale = 1 + 1 * a)));
      let s = e > r ? Math.sin((_P * (e - r)) / n) : 0;
      (IP(i, 1 + 0.08 * a * t - 0.12 * o * t + 0.02 * t * s),
        (i.lean =
          0.05 * t * o + 0.015 * t * o * Math.sin((_P * (e - r)) / (n * 2))),
        jP(i, `props.crystals.rot`, 0.16 * o * t),
        MP(i, `props.crystals.dy`, -0.03 * o * t + 0.03 * a * t));
      for (let e of [`glintA`, `glintB`]) MP(i, `props.${e}.hidden`, o > 0.6);
      return ((i.look = { x: 0, y: -0.2 * o }), i);
    },
    {
      events: OP(n, 2.7, () => U.particle(0, `zzz`)),
      idle: { breath: !1, ears: !1, blink: !1 },
      label: `b.sleepy`,
    },
  );
}
function YP(e) {
  let t = LP(e),
    n = 2 * RP(e),
    r = vP(e.seed, 4) < 0.5 ? -1 : 1,
    i = 0.25,
    a = 0.11;
  return W(
    n,
    (e) => {
      let n = {};
      n.look = {
        x: r * 0.7 * TP(e, 0.9, 1.05) * (1 - TP(e, 1.7, 1.95)),
        y: -0.4 * TP(e, 0.9, 1.05) * (1 - TP(e, 1.7, 1.95)),
      };
      for (let r = 0; r < 5; r++)
        jP(
          n,
          `props.crystals.rot`,
          SP(e, i + r * a, (r % 2 ? -1 : 1) * 0.06 * t, 5, 12),
        );
      MP(n, `props.crystals.dy`, 0.03 * t * wP(e, 0.2, 0.95));
      let o = (t) => HP(e, i + t * a, 0.2),
        s = 1 - TP(e, 1, 1.15) * (1 - TP(e, 1.75, 1.95));
      return (
        VP(n, `glintA`, 1 * t * Math.max(o(1), o(3)), 0.3 + 0.7 * s),
        VP(n, `glintB`, 1 * t * Math.max(o(0), o(2), o(4)), 0.25 + 0.75 * s),
        IP(n, 1 + 0.03 * t * wP(e, 0.2, 0.95) - 0.03 * t * wP(e, 0.95, 1.9)),
        (n.mood = e > 0.95 && e < 1.85 ? `shy` : `neutral`),
        (n.lift = 0.008 * t * wP(e, i, 0.85)),
        n
      );
    },
    {
      events: AP(n, [
        ...[0, 1, 2, 3, 4].map((e) => U.sound(i + e * a, `tink`, { i: e })),
        U.particle(0.33, `sparkle`),
        U.particle(0.55, `sparkle`),
        U.particle(0.75, `sparkle`),
      ]),
      idle: { look: !1, ears: !1 },
      label: `b.gag`,
    },
  );
}
function XP(e) {
  let t = LP(e),
    n = 0.75 * RP(e);
  return W(
    n,
    (e) => {
      let r = {};
      return (
        (r.lift = NP(e, [
          [0, 0.1 * t],
          [0.28, 0, H.inCubic],
        ])),
        IP(
          r,
          NP(e, [
            [0, 1.03],
            [0.28, 1.06, H.linear],
            [0.33, 1 - 0.17 * t, H.outQuad],
            [0.5, 1 + 0.05 * t, H.outQuad],
            [n, 1, H.inOutSine],
          ]),
        ),
        (r.lean = NP(e, [
          [0, 0],
          [0.3, 0, H.linear],
          [0.42, 0.04 * t, H.outQuad],
          [0.6, -0.02 * t, H.inOutSine],
          [n, 0, H.inOutSine],
        ])),
        jP(r, `props.crystals.rot`, SP(e, 0.3, -0.16 * t, 2.8, 4.5)),
        VP(r, `glintA`, 0.9 * t * HP(e, 0.34, 0.2), 1),
        (r.mouth = e > 0.3 && e < 0.62 ? `smirk` : void 0),
        r.mouth === void 0 && delete r.mouth,
        r
      );
    },
    {
      events: AP(n, [
        U.sound(0.3, `thud`),
        U.sound(0.34, `tink`, { i: 2 }),
        U.particle(0.31, `puff`),
      ]),
      idle: { ears: !1 },
      label: `b.deselect`,
    },
  );
}
var ZP = (e) => (e <= 2 ? 2 : 3);
var QP = (e) => (e <= 1 ? 0.24 : e <= 2 ? 0.27 : e <= 3 ? 0.25 : 0.27);
var $P = 0.13;
var eF = 0.15;
var tF = (e, t = !1) =>
  PP(0.28 + ZP(Math.max(e, 1)) * QP(Math.max(e, 1)), 0.6, 1.1) * (t ? 0.9 : 1);
function nF(e) {
  let t = LP(e),
    [n, r] = e.off,
    i = Math.max(e.dist, 0.5),
    a = ZP(i),
    o = tF(i, e.reduced),
    s = $P * (e.reduced ? 0.9 : 1),
    c = eF * (e.reduced ? 0.9 : 1),
    l = (o - s - c) / a,
    u = e.facing,
    d = vP(e.seed, 7) < 0.5 ? -1 : 1,
    f = (e) => (u === 0 ? d * (e % 2 == 0 ? 1 : -1) : u),
    p = (e) => H.inOutSine(zP((e - 0.06) / 0.72)),
    m = Math.min(0.05 / i, 0.05) * t,
    h = (e) => {
      if (e <= s) return -Math.min(0.03 / i, 0.04) * H.outQuad(e / s) * t;
      let n = Math.min(a - 1, Math.floor((e - s) / l));
      if (e < s + a * l)
        return (
          (n + p((e - s - n * l) / l)) / a +
          (n === a - 1
            ? m * wP(e, s + (a - 1) * l + 0.62 * l, s + a * l) * 0
            : 0)
        );
      let r = (e - s - a * l) / c;
      return 1 + m * (1 - H.outCubic(Math.min(1, r / 0.6)));
    },
    g = o;
  return W(
    g,
    (i) => {
      let c = 1 - h(i),
        d = { x: n * c, y: r * c },
        p = i < s ? 0 : Math.min(a - 1, Math.floor((i - s) / l)),
        m = i < s || i >= s + a * l ? (i < s ? 0 : 1) : (i - s - p * l) / l,
        g = f(p),
        _ = i >= s && i < s + a * l,
        v = NP(m, [
          [0, 0],
          [0.1, -0.07, H.outQuad],
          [0.56, 0.44, H.inOutSine],
          [0.7, -0.07, H.inQuad],
          [0.85, 0.02, H.outQuad],
          [1, 0, H.inOutSine],
        ]);
      ((d.lean = _
        ? g * v * t
        : g *
            NP(i, [
              [0, 0],
              [s, -0.06, H.outQuad],
              [s, -0.06],
            ]) *
            (i < s ? t : 0) +
          (i >= s + a * l ? -g * 0.03 * t * wP(i, s + a * l, o) : 0)),
        i < s && (d.lean = f(0) * -0.06 * H.outQuad(i / s) * t),
        (_ || i < s) && MP(d, `pivot`, [(_ ? g : f(0)) * BP, 0]),
        IP(
          d,
          1 +
            ((_
              ? NP(m, [
                  [0, 1],
                  [0.1, 0.93, H.outQuad],
                  [0.56, 1.05, H.inOutSine],
                  [0.7, 0.82, H.inQuad],
                  [0.85, 1.04, H.outQuad],
                  [1, 1, H.inOutSine],
                ])
              : i < s
                ? 1 - 0.09 * H.outQuad(i / s)
                : 1 + 0.04 * wP(i, s + a * l, o)) -
              1) *
              t,
        ),
        (d.lift = _ ? 0.02 * t * Math.abs(Math.sin(Math.PI * zP(m / 0.7))) : 0),
        (d.footFollow = Math.min(1, Math.abs(d.lean ?? 0) / 0.25)));
      let y = t === 1 && _ ? xP(m, 0.02, 0.1, 0.5, 0.66) : 0;
      if (
        (u === 0
          ? (d.y = (d.y ?? 0) + 0.003 * y * bP(i, 12, e.seed))
          : (d.x = (d.x ?? 0) + 0.004 * y * bP(i, 12, e.seed)),
        jP(d, `props.crystals.rot`, _ ? -g * 0.12 * t * wP(m, 0.1, 0.8) : 0),
        _)
      ) {
        let e = HP(m, 0.66, 0.24);
        (VP(d, `glintA`, 0.9 * t * e),
          VP(d, `glintB`, 0.9 * t * (p % 2 == 0 ? e : 0.6 * e)));
      }
      return (
        (d.mood = i < s ? `neutral` : _ ? `surprised` : `smug`),
        (d.look = {
          x: u * 0.6 * xP(i, 0.05, 0.2, o - 0.3, o - 0.05),
          y:
            (e.away ? 0.4 : u === 0 ? -0.25 : 0) *
            xP(i, 0.05, 0.2, o - 0.3, o - 0.05),
        }),
        d
      );
    },
    {
      events: AP(g, [
        U.sound(0.02, `grind`),
        ...Array.from({ length: a }, (e, t) => [
          U.sound(s + t * l + 0.1 * l, `grind`, { i: t }),
          U.sound(s + t * l + 0.7 * l, (a - 1, `tink`), { i: t }),
          ...(t < a - 1
            ? [U.sound(s + t * l + 0.7 * l, `thud`, { i: t })]
            : []),
          U.particle(s + t * l + 0.7 * l, `puff`),
        ]).flat(),
        U.impact(s + (a - 1) * l + 0.7 * l, `thud`, {
          strength: 0.35 * (e.reduced ? 0.5 : 1),
        }),
        U.particle(s + a * l, `sparkle`),
      ]),
      idle: { ears: !1 },
    },
  ).named(`b.move`);
}
var rF = (e, t = !1) => {
  let n = t ? 0.9 : 1,
    r = 0.52 * n,
    i = Math.min(0.26 + 0.045 * Math.max(e, 1), 0.5) * n,
    a = r + i;
  return { open: r, lunge: i, snap: a, end: a + 0.95 * n };
};
function iF(e) {
  let t = LP(e),
    [n, r] = e.off,
    i = Math.max(e.dist, 1),
    a = e.reduced ? 0.9 : 1,
    o = e.facing,
    { open: s, lunge: c, snap: l, end: u } = rF(i, e.reduced),
    d = u,
    f = Math.max(Math.hypot(n, r), 0.5),
    p = 0.1 * t,
    m = 1 + p / f,
    h = (e) => {
      if (e <= s) return 1 + (p / f) * H.inOutSine(e / s);
      if (e < l) {
        let t = (e - s) / c;
        return m * (1 - (0.5 * H.inOutSine(t) + 0.5 * H.inQuad(t)));
      }
      return 0;
    },
    g = 0.16 * a,
    _ = (e) =>
      e > l + 0.12 * a
        ? Math.max(0, Math.sin((_P * (e - l - 0.12 * a)) / (0.3 * a))) *
          xP(e, l + 0.12 * a, l + 0.2 * a, l + 0.5 * a, l + 0.65 * a)
        : 0;
  return {
    action: W(
      d,
      (i) => {
        let c = h(i),
          d = { x: n * c, y: r * c };
        (i >= g &&
          i < l &&
          (MP(d, `props.crystals.state`, `open`),
          MP(d, `props.maw.state`, `open`)),
          IP(
            d,
            1 +
              t *
                (NP(i, [
                  [0, 1],
                  [g - 0.05, 0.94, H.outQuad],
                  [g, 1.03, H.outQuad],
                  [g + 0.12, 0.9, H.inOutSine],
                  [s, 0.84, H.inOutSine],
                  [s + 0.06 * a, 1.14, H.outCubic],
                  [l - 0.04, 1.1, H.linear],
                  [l + 0.05, 0.78, H.outQuad],
                  [l + 0.14 * a, 1.05, H.outQuad],
                  [l + 0.22 * a, 0.94, H.inOutSine],
                  [u - 0.3 * a, 0.98, H.linear],
                  [u, 1, H.inOutSine],
                ]) -
                  1) -
              0.05 * t * _(i),
          ));
        let f = (i - (s + 0.06 * a)) / (l - s - 0.06 * a);
        ((d.lift =
          (f > 0 && f < 1 ? 0.12 * t * 4 * f * (1 - f) * (1 - 0.6 * f) : 0) +
          0.012 * t * wP(i, l + 0.08, l + 0.5)),
          (d.lean =
            o *
            t *
            NP(i, [
              [0, 0],
              [s * 0.6, -0.06, H.inOutSine],
              [s, -0.09, H.inOutSine],
              [s + 0.1, 0.16, H.outQuad],
              [l, 0.12, H.linear],
              [l + 0.08, 0.2, H.outQuad],
              [l + 0.3 * a, -0.03, H.inOutSine],
              [u, 0, H.inOutSine],
            ])),
          jP(
            d,
            `props.crystals.rot`,
            -o *
              t *
              NP(i, [
                [0, 0],
                [s, -0.1, H.inOutSine],
                [s + 0.1, -0.32, H.outQuad],
                [l - 0.02, -0.28, H.linear],
              ]) *
              +(i < l) +
              SP(i, l, 0.18 * t, 4.2, 6) +
              (t === 1 ? 0.03 * _(i) * bP(i, 14, e.seed) : 0),
          ),
          MP(
            d,
            `props.crystals.dy`,
            NP(i, [
              [0, 0],
              [s, 0.02 * t, H.inOutSine],
              [l - 0.02, 0.06 * t, H.outQuad],
              [l + 0.03, -0.03 * t, H.inQuad],
              [l + 0.2, 0, H.outQuad],
            ]),
          ));
        let p = i < g ? 1 : i < l ? 0.2 : TP(i, l + 0.06, l + 0.3);
        return (
          VP(d, `glintA`, 1.4 * t * HP(i, l + 0.02, 0.26), p),
          VP(d, `glintB`, 1.4 * t * HP(i, l + 0.08, 0.26), p),
          (d.mood =
            i < g * 0.6
              ? `neutral`
              : i < l + 0.04
                ? `angry`
                : i < l + 0.4 * a || i < u - 0.25 * a
                  ? `smug`
                  : `neutral`),
          (d.look = { x: 0, y: 0 }),
          (d.x =
            (d.x ?? 0) +
            (t === 1
              ? 0.004 * xP(i, 0.05, 0.2, s - 0.05, s + 0.05) * bP(i, 12, e.seed)
              : 0)),
          d
        );
      },
      {
        events: AP(d, [
          U.sound(0.04, `grind`),
          U.sound(g, `open`),
          U.particle(g, `sparkle`),
          U.sound(s + 0.02, `hum`, { lunge: !0 }),
          U.sound(l, `clack`),
          U.impact(l, `snap`, { strength: 1 }),
          U.particle(l, `sparkle`),
          U.particle(l + 0.03, `sparkle`),
          U.particle(l + 0.07, `sparkle`),
          U.particle(l, `puff`),
          ...[0, 1, 2, 3, 4].map((e) =>
            U.sound(l + 0.05 + e * 0.05, `tink`, { i: e }),
          ),
          ...(e.reduced ? [] : [U.shake(l, 0.45, 0.18)]),
          U.particle(l + 0.25 * a, `star`),
        ]),
        idle: { ears: !1, look: !1 },
      },
    ).named(`b.attack`),
    impactAt: l,
  };
}
function aF(e) {
  let t = LP(e),
    n = RP(e),
    r = 1.5 * n,
    i = 0.55 + 0.45 * Math.max(0, Math.min(1, e.strength)),
    a =
      Math.abs(e.from[0]) > 0.2
        ? Math.sign(e.from[0])
        : vP(e.seed, 9) < 0.5
          ? -1
          : 1,
    [, o] = e.from,
    s = 0.72 * n,
    c = 0.36 * n;
  return W(
    r,
    (e) => {
      let l = {},
        u = H.outQuad(zP(e / (0.07 * n))),
        d = e >= s,
        f =
          SP(e, 0.07 * n, 0.28 * i * t, 2.2, 3.4) *
          (1 - TP(e, s - 0.15 * n, s)),
        p = a * 0.18 * i * t * H.outQuad(zP(e / (0.22 * n))),
        m = o * 0.08 * i * t * H.outQuad(zP(e / (0.25 * n))),
        h = -a * 0.06 * u * t * (e < 0.07 * n) + a * f,
        g = NP(e, [
          [0, 1],
          [0.05 * n, 0.78, H.outQuad],
          [0.16 * n, 1.06, H.outQuad],
          [0.3 * n, 0.97, H.inOutSine],
          [s - 0.1 * n, 0.99, H.linear],
        ]);
      if (d) {
        let n = e - s,
          r = Math.min(1, Math.floor(n / c)),
          u = zP((n - r * c) / c),
          d = NP(u, [
            [0, 0],
            [0.15, -0.05, H.outQuad],
            [0.55, 0.5, H.inOutSine],
            [0.75, -0.06, H.inQuad],
            [1, 0, H.inOutSine],
          ]);
        h = a * d * t * +(n < 2 * c);
        let f = (r + H.inOutQuad(zP((u - 0.1) / 0.6))) / 2,
          _ = n >= 2 * c ? 1 : f;
        ((p = a * (0.18 * i * t + 0.85 * t * _)),
          (m = o * (0.08 * i * t + 0.4 * t * _)),
          (g = NP(u, [
            [0, 1],
            [0.15, 0.94, H.outQuad],
            [0.55, 1.04, H.inOutSine],
            [0.75, 0.84, H.inQuad],
            [1, 1, H.inOutSine],
          ])),
          (l.lift = 0.03 * Math.abs(Math.sin(Math.PI * zP(u / 0.75)))),
          MP(l, `pivot`, [a * BP, 0]));
      }
      return (
        (l.x = p),
        (l.y = m),
        (l.lean = h),
        IP(l, g),
        MP(l, `props.crystals.state`, `hurt`),
        MP(l, `props.glintB.hidden`, !0),
        MP(l, `props.glintA.hidden`, e < 0.45 * n),
        e >= 0.45 * n && VP(l, `glintA`, 0.6 * HP(e, 0.5 * n, 0.24)),
        e < 0.45 * n && (l.bodyPose = `hurt`),
        (l.mood =
          e < 0.06 * n
            ? `surprised`
            : e < 0.16 * n
              ? `hurt`
              : e < 0.42 * n
                ? `dizzy`
                : `happy`),
        e >= 0.42 * n && (l.mouth = `grin`),
        jP(l, `props.crystals.rot`, 0.5 * SP(e, 0.07 * n, 0.3 * t, 3.3, 4)),
        (l.alpha = 1 - TP(e, r - 0.4 * n, r - 0.06)),
        l
      );
    },
    {
      events: AP(r, [
        U.particle(0.03 * n, `star`),
        U.sound(0.04 * n, `crumble`),
        U.sound(0.1 * n, `tink`, { i: 0, broken: !0 }),
        U.particle(0.2 * n, `orbit`),
        U.sound(0.46 * n, `tink`, { i: 3 }),
        U.particle(0.5 * n, `sparkle`),
        U.sound(s, `grind`),
        U.sound(s + 0.7 * c, `thud`, { i: 0 }),
        U.sound(s + 1.7 * c, `thud`, { i: 1 }),
        U.particle(s + 0.7 * c, `puff`),
        U.particle(s + 1.7 * c, `puff`),
        U.particle(r - 0.3 * n, `sparkle`),
        U.particle(r - 0.24 * n, `sparkle`),
        U.sound(r - 0.3 * n, `tink`, { i: 4 }),
        U.world(r, `removed`),
      ]),
      idle: !1,
      label: `b.removed`,
    },
  );
}
function oF(e) {
  let t = LP(e),
    n = 4.2;
  return kP(
    (e) => {
      let r = TP(e, 0, 0.6),
        i = {};
      return (
        (i.mood = `sleepy`),
        IP(i, 1 - 0.13 * r * t + 0.03 * t * r * Math.sin((_P * e) / n)),
        (i.lean = 0.06 * t * r + 0.02 * t * r * Math.sin((_P * e) / (n * 2))),
        jP(i, `props.crystals.rot`, 0.18 * r * t),
        MP(i, `props.crystals.dy`, -0.03 * r * t),
        MP(i, `props.glintA.hidden`, r > 0.5),
        MP(i, `props.glintB.hidden`, r > 0.5),
        i
      );
    },
    {
      events: OP(n, 1.2, () => U.particle(0, `zzz`)),
      idle: { breath: !1, ears: !1, blink: !1 },
      label: `b.napping`,
    },
  );
}
function sF(e) {
  let t = LP(e),
    n = 1.2 * RP(e),
    r = vP(e.seed, 2) < 0.5 ? -1 : 1;
  return W(
    n,
    (i) => {
      let a = {};
      (IP(
        a,
        NP(i, [
          [0, 1],
          [0.1, 1 + 0.07 * t, H.outQuad],
          [0.3, 1 - 0.04 * t, H.inOutSine],
          [0.8, 1 - 0.04 * t, H.linear],
          [n, 1, H.inOutSine],
        ]),
      ),
        MP(a, `props.crystals.dy`, 0.05 * t * wP(i, 0, 0.5)),
        jP(
          a,
          `props.crystals.rot`,
          SP(i, 0.08, 0.2 * t, 4.5, 4.5) * r +
            (t === 1 ? 0.04 * xP(i, 0.3, 0.4, 0.8, 1) * bP(i, 14, e.seed) : 0),
        ));
      let o = bP(i, 12, e.seed + 3) > 0 ? 1 : 0.1;
      return (
        VP(a, `glintA`, 0, i > 0.1 && i < 0.9 ? o : 1),
        VP(a, `glintB`, 0, i > 0.1 && i < 0.9 ? 1.1 - o : 1),
        (a.mood = i < 0.3 ? `surprised` : i < n - 0.3 ? `worried` : `neutral`),
        (a.lean = r * 0.04 * t * xP(i, 0.2, 0.35, 0.8, n)),
        (a.look = { x: r * 0.8 * xP(i, 0.25, 0.4, 0.85, n - 0.1), y: 0.1 }),
        (a.x =
          t === 1 ? 0.004 * xP(i, 0.3, 0.4, 0.8, 1) * bP(i, 12, e.seed) : 0),
        a
      );
    },
    {
      events: AP(n, [
        U.particle(0.08, `exclaim`),
        U.sound(0.08, `tink`, { i: 4, alarm: !0 }),
        U.sound(0.16, `tink`, { i: 2, alarm: !0 }),
        U.particle(0.55, `sweat`),
      ]),
      idle: { look: !1, ears: !1 },
      label: `b.checked`,
    },
  );
}
function cF(e) {
  let t = LP(e),
    n = RP(e),
    r = 3 * n,
    i = 0.5 * n,
    a = 0.95 * n,
    o = 1.2 * n,
    s = 1.75 * n,
    c = 2.4 * n,
    l = (e, n, r, i) =>
      e > n && e < r
        ? i * t * 4 * ((e - n) / (r - n)) * (1 - (e - n) / (r - n))
        : 0;
  return W(
    r,
    (e) => {
      let u = {};
      (e >= i && e < c && MP(u, `props.crystals.state`, `open`),
        IP(
          u,
          1 +
            t *
              (NP(e, [
                [0, 1],
                [0.34 * n, 0.86, H.inOutSine],
                [i, 1.14, H.outCubic],
                [a - 0.06, 1.06, H.inOutSine],
                [a + 0.04, 0.8, H.outQuad],
                [a + 0.14, 0.9, H.inOutSine],
                [o - 0.04, 0.85, H.inOutSine],
                [o + 0.06, 1.15, H.outCubic],
                [s - 0.06, 1.07, H.inOutSine],
                [s + 0.05, 0.78, H.outQuad],
                [s + 0.24, 1.07, H.outBack],
                [c, 1.06, H.linear],
                [c + 0.08, 0.9, H.inQuad],
                [c + 0.25, 1.02, H.outQuad],
                [r, 1, H.inOutSine],
              ]) -
                1),
        ),
        (u.lift =
          l(e, i, a, 0.17) +
          l(e, o, s, 0.22) +
          0.02 * t * xP(e, s + 0.2, s + 0.4, c - 0.2, c)),
        (u.lean =
          0.12 *
          t *
          Math.sin((_P * (e - s - 0.1)) / 1.2) *
          xP(e, s + 0.1, s + 0.35, c - 0.3, c)));
      let d = 18 + 132 * t * xP(e, i - 0.05, i + 0.15, c - 0.1, c + 0.1);
      (MP(u, `arm.L.deg`, d),
        MP(u, `arm.R.deg`, d),
        jP(
          u,
          `props.crystals.rot`,
          SP(e, a, 0.14 * t, 2.3, 3, r) +
            SP(e, s, 0.18 * t, 2.3, 3, r) +
            SP(e, c + 0.06, 0.2 * t, 4, 6, r),
        ),
        MP(
          u,
          `props.crystals.dy`,
          0.04 * t * TP(e, i, i + 0.2) * (1 - TP(e, c - 0.1, c + 0.1)),
        ));
      for (let n of [`glintA`, `glintB`])
        VP(
          u,
          n,
          0.55 *
            t *
            (0.5 + 0.5 * Math.sin((_P * e) / 0.5 + (n === `glintA` ? 0 : 2))) *
            xP(e, i, i + 0.2, c - 0.2, c),
          1,
        );
      return (
        (u.mood = e > i - 0.05 && e < c + 0.1 ? `victorious` : `neutral`),
        (u.look = { x: 0, y: 0.3 * xP(e, i + 0.2, i + 0.5, c - 0.3, c) }),
        u
      );
    },
    {
      events: AP(r, [
        U.sound(i, `open`),
        U.particle(i, `sparkle`),
        U.impact(a, `thud`, { strength: 0.3 }),
        ...[0, 1, 2, 3, 4].map((e) => U.sound(a + e * 0.07, `tink`, { i: e })),
        U.impact(s, `thud`, { strength: 0.45 }),
        ...[0, 1, 2, 3, 4].map((e) => U.sound(s + e * 0.07, `tink`, { i: e })),
        U.particle(a, `sparkle`),
        U.particle(a + 0.1, `star`),
        U.particle(s, `sparkle`),
        U.particle(s + 0.1, `star`),
        U.particle(s + 0.4, `sparkle`),
        U.particle(2 * n, `sparkle`),
        U.particle(2.2 * n, `star`),
        U.sound(c + 0.06, `clack`),
      ]),
      idle: { ears: !1 },
      label: `b.victory`,
    },
  );
}
function lF(e) {
  let t = LP(e),
    n = RP(e),
    r = 2.5 * n;
  return W(
    r,
    (e) => {
      let i = {},
        a = e < 0.45 * n;
      return (
        a && ((i.bodyPose = `hurt`), MP(i, `props.crystals.state`, `hurt`)),
        (i.mood = a ? `hurt` : e < r - 0.5 * n ? `worried` : `neutral`),
        IP(
          i,
          NP(e, [
            [0, 1],
            [0.08 * n, 0.82, H.outQuad],
            [0.4 * n, 0.94, H.inOutSine],
            [0.95 * n, 0.8, H.inOutSine],
            [1.6 * n, 0.8, H.linear],
            [1.8 * n, 0.83, H.inOutSine],
            [2 * n, 0.81, H.inOutSine],
            [r - 0.05, 1, H.inOutSine],
          ]),
        ),
        (i.lean = NP(e, [
          [0, 0],
          [0.1 * n, -0.05 * t, H.outQuad],
          [0.9 * n, 0.07 * t, H.inOutSine],
          [1.6 * n, 0.07 * t, H.linear],
          [r, 0, H.inOutSine],
        ])),
        jP(
          i,
          `props.crystals.rot`,
          0.2 * t * xP(e, 0.5 * n, 1 * n, 1.7 * n, r - 0.2),
        ),
        MP(
          i,
          `props.crystals.dy`,
          -0.04 * t * xP(e, 0.5 * n, 1 * n, 1.7 * n, r - 0.2),
        ),
        MP(i, `props.glintA.hidden`, e > 0.35 * n && e < r - 0.3 * n),
        MP(i, `props.glintB.hidden`, e > 0.15 * n && e < r - 0.3 * n),
        VP(i, `glintA`, 0.7 * t * HP(e, r - 0.3 * n, 0.25)),
        (i.look = { x: 0, y: -0.5 * xP(e, 0.6 * n, 1 * n, 1.8 * n, r - 0.2) }),
        i
      );
    },
    {
      events: AP(r, [
        U.particle(0.05 * n, `star`),
        U.sound(0.08 * n, `crumble`),
        U.particle(1.2 * n, `sweat`),
        U.sound(r - 0.3 * n, `tink`, { i: 0, soft: !0 }),
      ]),
      idle: { ears: !1, look: !1 },
      label: `b.defeat`,
    },
  );
}
function uF(e) {
  let t = LP(e),
    n = 1.4 * RP(e);
  return W(
    n,
    (e) => {
      let n = {},
        r = xP(e, 0.1, 0.4, 1, 1.3),
        i = 18 + 60 * r * t;
      (MP(n, `arm.L.deg`, i),
        MP(n, `arm.R.deg`, i),
        (n.lift = 0.025 * t * r),
        IP(n, 1 - 0.03 * t * r),
        (n.lean = 0.09 * t * r * Math.sin((_P * (e - 0.1)) / 1.1)),
        r > 0.3 && ((n.eye = `half`), (n.brow = `raised`), (n.mouth = `flat`)));
      let a = 1 - r * (e > 0.6 && e < 0.95 ? 1 : 0.6);
      return (
        VP(n, `glintA`, 0, a),
        VP(n, `glintB`, 0, a),
        jP(
          n,
          `props.crystals.rot`,
          -0.1 * t * r * Math.sin((_P * (e - 0.1)) / 1.1 - 0.5),
        ),
        n
      );
    },
    {
      events: AP(n, [U.sound(0.5, `hum`, { low: !0 })]),
      idle: { look: !1, ears: !1 },
      label: `b.shrug`,
    },
  );
}
function dF(e) {
  let t = LP(e),
    n = 0.72 * RP(e);
  return W(
    n,
    (r) => {
      let i = {},
        a = CP(r, n, 0.5),
        o = Math.sin((_P * r) / 0.36);
      return (
        (i.lean = 0.1 * t * a * o),
        MP(i, `pivot`, [(o > 0 ? 1 : -1) * BP, 0]),
        IP(i, 1 - 0.05 * t * a),
        jP(
          i,
          `props.crystals.rot`,
          -0.09 * t * a * o + (t === 1 ? 0.03 * a * bP(r, 14, e.seed) : 0),
        ),
        (i.mood = `angry`),
        (i.mouth = `flat`),
        (i.eye = `squeezed`),
        MP(i, `props.glintA.alpha`, 1 - 0.85 * a),
        MP(i, `props.glintB.alpha`, 1 - 0.85 * a),
        i
      );
    },
    {
      events: AP(n, [
        U.sound(0.02, `hum`, { low: !0, no: !0 }),
        U.sound(0.38, `hum`, { low: !0, no: !0 }),
        U.sound(0.1, `clack`, { soft: !0 }),
      ]),
      idle: { look: !1, ears: !1 },
      label: `b.refuse`,
    },
  );
}
var fF = t({
  attack: () => OF,
  attackTimes: () => DF,
  checked: () => MF,
  defeat: () => PF,
  deselect: () => wF,
  entrance: () => vF,
  gag: () => CF,
  hover: () => yF,
  move: () => EF,
  napping: () => jF,
  nervous: () => xF,
  refuse: () => IF,
  removed: () => AF,
  select: () => bF,
  shrug: () => FF,
  sleepy: () => SF,
  slideTime: () => TF,
  victory: () => NF,
  wAmbient: () => _F,
  windSway: () => gF,
});
var pF = (e, t) => ((e.sy = t), (e.sx = 1 / t), e);
var mF = (e) => (e.reduced ? 0.5 : 1);
var hF = (e) => (e.reduced ? 0.9 : 1);
function gF(e, t) {
  let n = vP(t, 3) * _P,
    r = vP(t, 4) * _P,
    i = 0.55 + 0.45 * Math.sin((_P * e) / 11.3 + r),
    a =
      0.6 * Math.sin((_P * e) / 3.6 + n) +
      0.4 * Math.sin((_P * e) / 1.9 + r * 2);
  return 0.17 * i * a;
}
function _F(e, t) {
  return { props: { sapling: { rot: gF(e, t) } } };
}
function vF(e, t) {
  let n = mF(t),
    r = 0.82;
  return EP(
    W(
      r,
      (e) => {
        let t = {};
        ((t.draw = NP(e, [
          [0, 0],
          [0.5, 1, H.inOutSine],
        ])),
          pF(
            t,
            NP(e, [
              [0, 1],
              [0.3, 1],
              [0.4, 1 - 0.12 * n, H.outQuad],
              [0.5, 1 + 0.14 * n, H.outCubic],
              [0.6, 1 + 0.05 * n, H.inOutSine],
              [0.7, 1 - 0.16 * n, H.inQuad],
              [0.77, 1 + 0.05 * n, H.outQuad],
              [r, 1, H.inOutSine],
            ]),
          ));
        let i = (e - 0.46) / 0.24;
        ((t.lift = i > 0 && i < 1 ? 0.13 * n * 4 * i * (1 - i) : 0),
          (t.lean = NP(e, [
            [0, 0],
            [0.4, -0.06 * n, H.outQuad],
            [0.58, 0.03 * n, H.inOutSine],
            [0.72, 0, H.inOutSine],
          ])));
        let a = NP(e, [
          [0, 40],
          [0.44, 40],
          [0.58, 40 + 55 * n, H.outQuad],
          [0.72, 40, H.inQuad],
        ]);
        return (
          MP(t, `arm.L.deg`, a),
          MP(t, `arm.R.deg`, a),
          (t.mood = e > 0.5 && e < 0.78 ? `happy` : `neutral`),
          jP(t, `props.sapling.rot`, SP(e, 0.7, -0.35 * n, 3.2, 5, r)),
          t
        );
      },
      {
        events: AP(r, [
          U.sound(0.48, `pop`),
          U.sound(0.7, `stomp`, { soft: !0 }),
          U.particle(0.7, `puff`),
        ]),
        idle: { ears: !1 },
      },
    ),
    e,
    { draw: 0 },
  ).named(`w.entrance`);
}
function yF(e) {
  let t = mF(e),
    n = 1.8;
  return kP(
    (e) => {
      let r = TP(e, 0, 0.22),
        i = {};
      return (
        pF(i, 1 + r * (0.05 * t + 0.012 * t * Math.sin((_P * e) / n))),
        (i.lift = r * 0.012 * t),
        (i.lean = -0.03 * t * r + 0.012 * t * r * Math.sin((_P * e) / n + 1)),
        (i.mouth = `grin`),
        (i.blush = 1 + 0.35 * r),
        (i.brow = `raised`),
        jP(
          i,
          `props.sapling.rot`,
          SP(e, 0.05, 0.3 * t, 3.6, 4.5) +
            0.05 * t * r * Math.sin((_P * e) / n),
        ),
        i
      );
    },
    { idle: { breath: !1, ears: !1 }, label: `w.hover` },
  );
}
function bF(e) {
  let t = mF(e);
  return kP(
    (n) => {
      let r = {},
        i = NP(n, [
          [0, 0],
          [0.09, 0, H.linear],
          [0.3, 1, H.outBack],
        ]),
        a = wP(n, 0, 0.16),
        o = Math.sin((_P * n) / 1);
      ((r.lift = i * (0.09 + 0.018 * o) * t),
        pF(r, 1 - 0.1 * a * t + i * (0.035 * t - 0.012 * t * o)),
        (r.lean = 0.02 * t * i * Math.sin((_P * n) / 2)));
      let s = 40 + i * (20 + 12 * Math.sin((_P * n) / (1 / 2) + 0.5)) * t;
      return (
        MP(r, `arm.L.deg`, s),
        MP(r, `arm.R.deg`, s),
        (r.mouth = `open`),
        (r.brow = `raised`),
        (r.blush = 1.2),
        (r.x = t === 1 ? 0.004 * i * bP(n, 12, e.seed) : 0),
        jP(r, `props.sapling.rot`, SP(n, 0.28, 0.25 * t, 3.4, 4)),
        r
      );
    },
    { idle: { breath: !1, ears: !1 }, label: `w.select` },
  );
}
function xF(e) {
  let t = mF(e),
    n = 1.3;
  return kP(
    (r) => {
      let i = TP(r, 0, 0.18),
        a = {};
      ((a.mood = `worried`),
        pF(a, 1 - 0.035 * i * t + 0.01 * t * Math.sin((_P * r) / (n / 2))),
        (a.lean = 0.03 * t * i * Math.sin((_P * r) / (n * 2))));
      let o = 0.5 + 0.5 * Math.sin((_P * r) / (n * 1.5));
      return (
        (a.x = t === 1 ? 0.006 * i * o * bP(r, 12, e.seed + 1) : 0),
        jP(a, `props.sapling.rot`, 0.1 * t * i * o * bP(r, 12, e.seed + 2)),
        jP(
          a,
          `props.battlements.rot`,
          t === 1 ? 0.012 * i * o * bP(r, 12, e.seed + 3) : 0,
        ),
        a
      );
    },
    {
      events: OP(n, 0.12, () => U.particle(0, `sweat`)),
      idle: { ears: !1, look: !1 },
      label: `w.nervous`,
    },
  );
}
function SF(e) {
  let t = mF(e),
    n = 3.6,
    r = 1.1;
  return kP(
    (e) => {
      let i = {},
        a = wP(e, 0.05, 0.75),
        o = TP(e, 0.75, r);
      ((i.mood = e < 0.12 ? `neutral` : `sleepy`),
        e < 0.7 &&
          ((i.mouth = `open`),
          (i.mouthScale = 1 + 1.2 * a),
          e > 0.12 && (i.eye = `closed`)));
      let s = e > r ? Math.sin((_P * (e - r)) / n) : 0;
      (pF(i, 1 + 0.07 * a * t - 0.07 * o * t + 0.018 * t * s),
        (i.lean =
          0.05 * t * o + 0.02 * t * Math.sin((_P * (e - r)) / (n * 2)) * o));
      let c = 40 + 50 * a * t;
      return (
        MP(i, `arm.L.deg`, c),
        MP(i, `arm.R.deg`, c),
        jP(i, `props.sapling.rot`, -0.28 * o * t),
        i
      );
    },
    {
      events: OP(n, 2, () => U.particle(0, `zzz`)),
      idle: { breath: !1, ears: !1, blink: !1 },
      label: `w.sleepy`,
    },
  );
}
function CF(e) {
  let t = mF(e),
    n = hF(e),
    r = 2 * n;
  return W(
    r,
    (r) => {
      let i = {},
        a = r / n;
      ((i.look = {
        x: NP(a, [
          [0, 0],
          [0.3, 0.7, H.inOutSine],
          [0.7, 0.7],
          [0.85, 0.25, H.inOutSine],
          [1.25, 0.25],
          [1.4, 0.6, H.inOutSine],
          [1.75, 0.6],
          [1.95, 0, H.inOutSine],
        ]),
        y: NP(a, [
          [0, 0],
          [0.3, 0.75, H.inOutSine],
          [0.7, 0.75],
          [0.9, -0.75, H.inOutSine],
          [1.25, -0.75],
          [1.4, 0.8, H.inOutSine],
          [1.75, 0.8],
          [1.95, 0, H.inOutSine],
        ]),
      }),
        (i.lean = NP(a, [
          [0, 0],
          [0.3, -0.035 * t, H.inOutSine],
          [0.7, -0.035 * t],
          [0.75, 0.02 * t, H.outQuad],
          [1.3, 0.01 * t, H.inOutSine],
          [1.5, -0.03 * t, H.inOutSine],
          [1.95, 0, H.inOutSine],
        ])),
        pF(
          i,
          NP(a, [
            [0, 1],
            [0.3, 1 + 0.03 * t, H.inOutSine],
            [0.7, 1 + 0.03 * t],
            [0.78, 1 + 0.07 * t, H.outQuad],
            [0.95, 1, H.inOutSine],
            [1.45, 1, H.linear],
            [1.5, 1 - 0.02 * t, H.inOutSine],
            [1.95, 1, H.inOutSine],
          ]),
        ));
      let o = xP(a, 0.3, 0.36, 0.62, 0.95);
      return (
        jP(i, `props.sapling.rot`, 0.34 * t * o * bP(r, 14, e.seed + 5)),
        (i.mood =
          a < 0.7
            ? `neutral`
            : a < 1.35
              ? `surprised`
              : a < 1.6
                ? `worried`
                : a < 1.9
                  ? `smug`
                  : `neutral`),
        (i.x =
          t === 1
            ? 0.004 * xP(a, 1.35, 1.4, 1.55, 1.6) * bP(r, 12, e.seed)
            : 0),
        i
      );
    },
    {
      events: AP(r, [
        U.sound(0.3 * n, `rustle`),
        U.particle(0.62 * n, `leafG`),
        U.particle(0.74 * n, `exclaim`),
        U.sound(1.65 * n, `huff`),
      ]),
      idle: { look: !1, ears: !1 },
      label: `w.gag`,
    },
  );
}
function wF(e) {
  let t = mF(e),
    n = 0.55 * hF(e);
  return W(
    n,
    (e) => {
      let r = {};
      ((r.lift = NP(e, [
        [0, 0.09 * t],
        [0.2, 0, H.inQuad],
      ])),
        pF(
          r,
          NP(e, [
            [0, 1.035],
            [0.2, 1.06, H.linear],
            [0.25, 1 - 0.11 * t, H.outQuad],
            [0.36, 1 + 0.035 * t, H.outQuad],
            [n, 1, H.inOutSine],
          ]),
        ),
        (r.lean = NP(e, [
          [0, 0],
          [0.24, 0.03 * t, H.linear],
          [0.4, -0.02 * t, H.inOutSine],
          [n, 0, H.inOutSine],
        ])));
      let i = NP(e, [
        [0, 40 + 20 * t],
        [0.24, 40, H.inQuad],
      ]);
      return (
        MP(r, `arm.L.deg`, i),
        MP(r, `arm.R.deg`, i),
        (r.mood = e > 0.22 && e < 0.5 ? `happy` : `neutral`),
        jP(r, `props.sapling.rot`, SP(e, 0.22, -0.3 * t, 3.2, 5, n)),
        r
      );
    },
    {
      events: AP(n, [
        U.particle(0.23, `puff`),
        U.sound(0.23, `stomp`, { soft: !0 }),
      ]),
      idle: { ears: !1 },
      label: `w.deselect`,
    },
  );
}
var TF = (e, t = !1) =>
  PP(0.5 + 0.09 * (Math.max(e, 1) - 1), 0.45, 1.05) * (t ? 0.9 : 1);
function EF(e) {
  let t = mF(e),
    [n, r] = e.off,
    i = Math.max(e.dist, 0.5),
    a = TF(i, e.reduced),
    o = 0.08,
    s = 0.17,
    c = a - o - s,
    l = e.facing,
    u = Math.min(0.05 / i, 0.1) * t,
    d = Math.min(0.07 / i, 0.06) * t,
    f = (e) => 0.65 * H.inOutSine(e) + 0.35 * H.inOutCubic(e),
    p = (e) => {
      if (e <= o) return -u * H.outQuad(e / o);
      if (e <= o + c) {
        let t = (e - o) / c;
        return -u + (1 + d + u) * f(t);
      }
      if (e <= a) {
        let t = (e - o - c) / s;
        return 1 + d * (1 - H.outCubic(Math.min(1, t / 0.7)));
      }
      return 1;
    },
    m = (e) => (t === 1 ? xP(e, o, 0.13, o + c - 0.04, o + c + 0.02) : 0),
    h = a;
  return W(
    h,
    (i) => {
      let u = 1 - p(i),
        d = { x: n * u, y: r * u },
        f = m(i),
        h = NP(i, [
          [0, 0],
          [o, -0.05, H.outQuad],
          [o + 0.25 * c, 0.1, H.inOutSine],
          [o + 0.85 * c, 0.1, H.linear],
          [o + c, 0.13, H.outQuad],
          [o + c + 0.45 * s, -0.05, H.outQuad],
          [a, 0, H.inOutSine],
        ]);
      ((d.lean =
        l * h * t +
        (l === 0
          ? 0.025 *
            t *
            Math.sin((_P * i) / 0.5) *
            xP(i, o, 0.18, o + c - 0.05, o + c + 0.1)
          : 0)),
        pF(
          d,
          NP(i, [
            [0, 1],
            [o, 1 - 0.06 * t, H.outQuad],
            [o + 0.2 * c, 1 + 0.03 * t, H.outQuad],
            [o + 0.85 * c, 1 + 0.02 * t, H.linear],
            [o + c, 1 - 0.1 * t, H.inQuad],
            [o + c + 0.45 * s, 1 + 0.05 * t, H.outQuad],
            [a, 1, H.inOutSine],
          ]) *
            (1 + 0.007 * f * bP(i, 12, e.seed + 4)),
        ),
        (d.lift =
          0.006 * f * bP(i, 12, e.seed) + 0.012 * t * wP(i, o + c - 0.02, a)),
        jP(d, `props.battlements.rot`, 0.022 * f * bP(i, 12, e.seed + 1)));
      let g = 0.03 * f * bP(i, 12, e.seed + 2);
      (jP(d, `foot.L.dx`, g), jP(d, `foot.R.dx`, -g));
      let _ = e.away ? 0.45 : l === 0 ? -0.3 : 0;
      return (
        (d.look = {
          x: l * 0.6 * xP(i, 0.02, 0.12, o + c, a),
          y: _ * xP(i, 0.02, 0.12, o + c, a),
        }),
        i > o + c && (d.mood = `smug`),
        d
      );
    },
    {
      events: AP(h, [
        U.sound(o, `rumble`),
        ...(t === 1
          ? Array.from({ length: Math.max(1, Math.floor(c / 0.1)) }, (e, t) =>
              U.particle(0.11 + t * 0.1, `puff`),
            )
          : [U.particle(0.13, `puff`)]),
        U.particle(o + c, `puff`),
        U.impact(o + c, `skid`, { strength: 0.22 * (e.reduced ? 0.5 : 1) }),
      ]),
      idle: { ears: !1 },
    },
  ).named(`w.move`);
}
var DF = (e, t = !1) => {
  let n = t ? 0.9 : 1,
    r = Math.min(0.28 + 0.05 * Math.max(e, 1), 0.52) * n,
    i = 0.28 * n,
    a = i + r,
    o = a + 0.28 * n;
  return { back: i, t1: a, t2: o, end: o + 0.9 * n };
};
function OF(e) {
  let t = mF(e),
    [n, r] = e.off,
    i = Math.max(e.dist, 1),
    a = e.reduced ? 0.9 : 1,
    o = e.facing,
    { back: s, t1: c, t2: l, end: u } = DF(i, e.reduced),
    d = u,
    f = c - s,
    p = Math.max(Math.hypot(n, r), 0.5),
    m = (0.12 * t) / p,
    h = (e) => {
      if (e <= s) return 1 + m * H.outCubic(e / s);
      if (e < c) {
        let t = (e - s) / f;
        return (1 + m) * (1 - (0.5 * H.inOutSine(t) + 0.5 * H.inQuad(t)));
      }
      return 0;
    },
    g = l + 0.3 * a,
    _ = u - 0.14 * a;
  return {
    action: W(
      d,
      (i) => {
        let d = h(i),
          p = { x: n * d, y: r * d },
          m = xP(i, s, s + 0.05, c - 0.03, c),
          v = NP(i, [
            [0, 0],
            [s, -0.28, H.outCubic],
            [s + 0.1 * f, -0.28, H.linear],
            [c - 0.06 * f, 0.16, H.inOutSine],
            [c + 0.06, -0.02, H.outQuad],
            [c + 0.16, -0.1, H.inOutSine],
            [l, 0.02, H.inQuad],
            [l + 0.08, 0.05, H.outQuad],
            [l + 0.38 * a, -0.07, H.inOutSine],
            [u - 0.28 * a, -0.02, H.inOutSine],
            [u, 0, H.inOutSine],
          ]);
        p.lean = o === 0 ? 0 : o * v * t;
        let y = H.inOutSine(kF((i - (c + 0.06)) / (0.16 * a))),
          b = l - 0.045 * a;
        ((p.lift =
          (i < b
            ? 0.11 * t * y
            : i < l
              ? 0.11 * t * (1 - H.inQuad((i - b) / (0.045 * a)))
              : 0) +
          0.06 * t * wP(i, l + 0.1, l + 0.5) +
          0.03 * t * wP(i, c - 0.02, c + 0.1)),
          pF(
            p,
            (1 +
              (NP(i, [
                [0, 1],
                [s * 0.4, 1.09, H.outQuad],
                [s, 1.11, H.linear],
                [s + 0.1 * f, 1.05, H.inOutSine],
                [c - 0.02, 1.06, H.linear],
                [c + 0.05, 0.83, H.outQuad],
                [c + 0.14, 1.06, H.outQuad],
                [c + 0.16 * a + 0.06, 1.12, H.inOutSine],
                [l - 0.02, 1.13, H.linear],
                [l + 0.04, 0.76, H.inQuad],
                [l + 0.13, 1.03, H.outQuad],
                [l + 0.3 * a, 1.12, H.outBack],
                [l + 0.58 * a, 1.08, H.inOutSine],
                [u - 0.22 * a, 1, H.inOutSine],
              ]) -
                1) *
                t) *
              (1 + 0.006 * m * (t === 1 ? bP(i, 12, e.seed) : 0)),
          ),
          jP(
            p,
            `props.battlements.rot`,
            t === 1 ? 0.03 * m * bP(i, 12, e.seed + 1) : 0,
          ));
        let x = wP(i, c - 0.14 * a, c + 0.04),
          S = wP(i, l - 0.2 * a, l + 0.02);
        (jP(p, `foot.L.dy`, 0.05 * t * x + 0.05 * t * S),
          jP(p, `foot.R.dy`, 0.04 * t * S));
        let C = t === 1 ? 0.035 * m * bP(i, 12, e.seed + 2) : 0;
        (jP(p, `foot.L.dx`, C), jP(p, `foot.R.dx`, -C));
        let w =
          40 +
          (NP(i, [
            [0, 40],
            [s, 20, H.outQuad],
            [c + 0.05, 55, H.outQuad],
            [l - 0.06 * a, 110, H.outQuad],
            [l + 0.02, 30, H.inQuad],
            [l + 0.16 * a, 60, H.outQuad],
            [l + 0.42 * a, 150, H.outBack],
            [l + 0.68 * a, 150, H.linear],
            [u - 0.05, 40, H.inOutSine],
          ]) -
            40) *
            (t === 1 ? 1 : 0.6);
        if (
          (MP(p, `arm.L.deg`, w),
          MP(p, `arm.R.deg`, w),
          (p.mood =
            i < s * 0.3
              ? `neutral`
              : i < l + 0.06
                ? `angry`
                : i < l + 0.3 * a
                  ? `surprised`
                  : i < l + 0.68 * a
                    ? `victorious`
                    : `smug`),
          (p.look = {
            x: 0,
            y: 0.7 * xP(i, l + 0.25 * a, l + 0.4 * a, l + 0.68 * a, u - 0.05),
          }),
          i >= g && i < _ && MP(p, `props.sapling.state`, `grown`),
          i >= g)
        ) {
          let e = NP(i, [
            [g, 0.55],
            [g + 0.09, 1.3, H.outQuad],
            [g + 0.2, 1, H.inOutSine],
            [_ - 0.02, 1, H.linear],
            [_ + 0.03, 0.55, H.inQuad],
            [u, 1, H.outBack],
          ]);
          (MP(
            p,
            `props.sapling.sx`,
            e < 1 ? 1 - (1 - e) * 0.8 : 1 + (e - 1) * 0.6,
          ),
            MP(p, `props.sapling.sy`, e));
        }
        return (jP(p, `props.sapling.rot`, SP(i, g, 0.25 * t, 3.5, 4.5, u)), p);
      },
      {
        events: AP(d, [
          U.sound(0.02, `creak`),
          U.sound(s, `rumble`),
          U.particle(s + 0.02, `speed`),
          ...Array.from({ length: Math.max(1, Math.floor(f / 0.1)) }, (e, t) =>
            U.particle(s + 0.06 + t * 0.1, `puff`),
          ).filter((e) => e.at < c),
          U.sound(c, `stomp`, { n: 1 }),
          U.particle(c, `puff`),
          U.particle(c, `puff`),
          ...(e.reduced ? [] : [U.shake(c, 0.35, 0.15)]),
          U.sound(l - 0.2 * a, `huff`),
          U.impact(l, `stomp`, { strength: 1, n: 2 }),
          U.particle(l, `star`),
          U.particle(l, `puff`),
          U.particle(l + 0.02, `puff`),
          U.sound(g, `pop`),
          U.sound(l + 0.4 * a, `hoist`),
          U.particle(g + 0.08, `sparkle`),
        ]),
        idle: { ears: !1, look: !1 },
      },
    ).named(`w.attack`),
    impactAt: l,
  };
}
var kF = (e) => (e < 0 ? 0 : e > 1 ? 1 : e);
function AF(e) {
  let t = mF(e),
    n = hF(e),
    r = 1.45 * n,
    i = 0.55 + 0.45 * Math.max(0, Math.min(1, e.strength)),
    a =
      Math.abs(e.from[0]) > 0.2
        ? Math.sign(e.from[0])
        : vP(e.seed, 9) < 0.5
          ? -1
          : 1,
    o = e.from[1],
    s = 0.34 * n,
    c = 0.62 * n,
    l = e.reduced ? 0.7 : 1.4;
  return ty(
    gy(
      {
        lean: [
          [0, 0],
          [0.07 * n, -a * 0.1 * t, `outQuad`],
          [0.2 * n, a * 0.34 * i * t, `outQuad`],
          [s, a * 0.2 * t, `inOutSine`],
          [c, a * l, `inQuad`],
          [c + 0.08, a * l * 0.94, `outQuad`],
          [c + 0.18, a * l, `inOutSine`],
          [r, a * l],
        ],
        x: [
          [0, 0],
          [0.2 * n, a * 0.16 * i * t, `outQuad`],
          [c, a * 0.36 * i * t, `inOutSine`],
          [r, a * 0.36 * i * t],
        ],
        y: [
          [0, 0],
          [0.2 * n, o * 0.1 * i * t, `outQuad`],
          [r, o * 0.12 * i * t, `inOutSine`],
        ],
        lift: [
          [0, 0],
          [0.12 * n, 0.06 * i * t, `outQuad`],
          [0.22 * n, 0.02 * t, `inQuad`],
          [s, 0.05 * t, `outQuad`],
          [c, 0, `inQuad`],
        ],
        sy: [
          [0, 1],
          [0.05 * n, 0.8, `outQuad`],
          [0.14 * n, 1.05, `outQuad`],
          [c - 0.05, 1, `linear`],
          [c + 0.03, 0.93, `outQuad`],
          [c + 0.14, 1, `outQuad`],
          [r, 1, `linear`],
        ],
        pivot: [[0, [a * 0.4, 0]]],
        bodyPose: [
          [0, `idle`],
          [0.05 * n, `hurt`],
        ],
        mood: [
          [0, `surprised`],
          [0.06 * n, `hurt`],
          [c + 0.1, `dizzy`],
        ],
        footFollow: [
          [0, 0],
          [c, 1, `smooth`],
        ],
        alpha: [
          [0, 1],
          [r - 0.3 * n, 1],
          [r, 0, `inQuad`],
        ],
        "arm.L.deg": [
          [0, 40],
          [0.1 * n, 150, `outQuad`],
          [s, 110, `inOutSine`],
          [c, 78, `inOutSine`],
          [r, 78],
        ],
        "arm.R.deg": [
          [0, 40],
          [0.1 * n, 150, `outQuad`],
          [s, 110, `inOutSine`],
          [c, 78, `inOutSine`],
          [r, 78],
        ],
        "props.sapling.state": [[0, `hurt`]],
        "props.battlements.state": [[0, `hurt`]],
      },
      { duration: r, volume: !0, idle: !1 },
    ),
    W(r, (e) => {
      let t = NP(e, [
        [r - 0.3 * n, 1],
        [r - 0.2 * n, 1.07, H.outQuad],
        [r, 0.4, H.inQuad],
      ]);
      return e >= s ? { sx: t, sy: t, contact: `ground` } : { sx: t, sy: t };
    }),
  )
    .withEvents(
      ...AP(r, [
        U.particle(0.04 * n, `star`),
        U.sound(0.05 * n, `flop`),
        U.sound(c, `thud`),
        U.particle(c, `puff`),
        U.particle(c + 0.02, `puff`),
        U.particle(c + 0.12, `orbit`),
        U.particle(r - 0.3 * n, `poof`),
        U.sound(r - 0.3 * n, `poof`),
        U.world(r, `removed`),
      ]),
    )
    .withIdle(!1)
    .named(`w.removed`);
}
function jF(e) {
  let t = mF(e),
    n = 3.2;
  return kP(
    (e) => {
      let r = TP(e, 0, 0.5),
        i = {};
      i.mood = `sleepy`;
      let a = Math.sin((_P * e) / n);
      (pF(i, 1 - 0.09 * r * t + 0.03 * t * a * r),
        (i.lean = 0.07 * t * r + 0.03 * t * r * Math.sin((_P * e) / (n * 2))),
        jP(i, `props.sapling.rot`, -0.3 * r * t));
      let o = 40 - 20 * r;
      return (MP(i, `arm.L.deg`, o), MP(i, `arm.R.deg`, o), i);
    },
    {
      events: OP(n, 1, () => U.particle(0, `zzz`)),
      idle: { breath: !1, ears: !1, blink: !1 },
      label: `w.napping`,
    },
  );
}
function MF(e) {
  let t = mF(e),
    n = 1.1 * hF(e),
    r = vP(e.seed, 2) < 0.5 ? -1 : 1;
  return W(
    n,
    (i) => {
      let a = {};
      return (
        pF(
          a,
          NP(i, [
            [0, 1],
            [0.06, 1 + 0.1 * t, H.outQuad],
            [0.2, 1 - 0.03 * t, H.inOutSine],
            [0.6, 1 - 0.03 * t, H.linear],
            [n, 1, H.inOutSine],
          ]),
        ),
        (a.lift = 0.04 * t * wP(i, 0, 0.26)),
        (a.mood = i < 0.3 ? `surprised` : i < n - 0.25 ? `worried` : `neutral`),
        (a.lean = r * 0.04 * t * xP(i, 0.2, 0.35, 0.8, n)),
        (a.look = { x: r * 0.8 * xP(i, 0.25, 0.4, 0.85, n - 0.1), y: 0.1 }),
        jP(a, `props.sapling.rot`, SP(i, 0.06, 0.4 * t, 3.6, 4) * -r),
        (a.x =
          t === 1 ? 0.004 * xP(i, 0.3, 0.4, 0.8, 0.95) * bP(i, 12, e.seed) : 0),
        a
      );
    },
    {
      events: AP(n, [
        U.particle(0.06, `exclaim`),
        U.sound(0.05, `creak`),
        U.particle(0.5, `sweat`),
      ]),
      idle: { look: !1, ears: !1 },
      label: `w.checked`,
    },
  );
}
function NF(e) {
  let t = mF(e),
    n = 2.7 * hF(e),
    r = hF(e),
    i = 0.32,
    a = 0.78,
    o = 0.62,
    s = 1.1,
    c = 0.8300000000000001,
    l = n - 0.22,
    u = (e, n, r, i) =>
      e > n && e < r
        ? i * t * 4 * ((e - n) / (r - n)) * (1 - (e - n) / (r - n))
        : 0;
  return W(
    n,
    (e) => {
      let d = {};
      ((d.lift =
        u(e, i, o, 0.2) +
        u(e, a, s, 0.27) +
        0.03 * t * xP(e, 1.2000000000000002, 1.5, 2.1 * r, 2.5 * r)),
        pF(
          d,
          NP(e, [
            [0, 1],
            [0.2, 0.86, H.outQuad],
            [i, 1.14, H.outCubic],
            [0.58, 1.06, H.inOutSine],
            [0.66, 0.84, H.outQuad],
            [0.79, 1.02, H.outQuad],
            [0.75, 0.85, H.inOutSine],
            [0.8400000000000001, 1.16, H.outCubic],
            [1.06, 1.07, H.inOutSine],
            [1.1500000000000001, 0.82, H.outQuad],
            [1.32, 1.1, H.outBack],
            [2.2 * r, 1.07, H.inOutSine],
            [n, 1, H.inOutSine],
          ]),
        ),
        (d.lean = NP(e, [
          [0, 0],
          [a, 0],
          [1.4000000000000001, -0.06 * t, H.inOutSine],
          [2.2 * r, -0.05 * t, H.linear],
          [n, 0, H.inOutSine],
        ])));
      let f = NP(e, [
        [0, 40],
        [0.2, 25, H.outQuad],
        [i, 40 + 110 * t, H.outBack],
        [o, 40 + 60 * t, H.inOutSine],
        [a, 40 + 110 * t, H.outBack],
        [2.3 * r, 40 + 110 * t, H.linear],
        [n, 40, H.inOutSine],
      ]);
      (MP(d, `arm.L.deg`, f),
        MP(d, `arm.R.deg`, f),
        (d.mood = e > 0.27 && e < n - 0.3 ? `victorious` : `neutral`),
        (d.look = { x: 0, y: 0.6 * xP(e, 1.3, 1.5, 2.1 * r, 2.5 * r) }),
        e >= c && e < l && MP(d, `props.sapling.state`, `grown`));
      let p =
        e >= c
          ? NP(e, [
              [c, 0.55],
              [0.93, 1.3, H.outQuad],
              [1.07, 1, H.inOutSine],
              [l - 0.02, 1, H.linear],
              [l + 0.04, 0.55, H.inQuad],
              [n, 1, H.outBack],
            ])
          : 1;
      return (
        e >= c &&
          (MP(
            d,
            `props.sapling.sx`,
            p < 1 ? 1 - (1 - p) * 0.8 : 1 + (p - 1) * 0.6,
          ),
          MP(d, `props.sapling.sy`, p)),
        jP(
          d,
          `props.sapling.rot`,
          SP(e, o, 0.3 * t, 3.4, 4) + SP(e, s, 0.3 * t, 3.4, 4),
        ),
        d
      );
    },
    {
      events: AP(n, [
        U.sound(i, `pop`),
        U.impact(o, `land`, { strength: 0.35 }),
        U.particle(o, `puff`),
        U.sound(a, `pop`),
        U.impact(s, `land`, { strength: 0.5 }),
        U.particle(s, `puff`),
        U.particle(1.1500000000000001, `sparkle`),
        U.particle(1.4500000000000002, `heart`),
        U.particle(1.9000000000000001, `sparkle`),
        U.particle(1.9 * r, `sparkle`),
        U.sound(0.8800000000000001, `pop`),
      ]),
      idle: { ears: !1 },
      label: `w.victory`,
    },
  );
}
function PF(e) {
  let t = mF(e),
    n = 2.4 * hF(e),
    r = hF(e);
  return W(
    n,
    (e) => {
      let i = {},
        a = e < 0.4 * r;
      ((i.mood = a ? `hurt` : e < n - 0.5 * r ? `worried` : `neutral`),
        a && (i.bodyPose = `hurt`),
        pF(
          i,
          NP(e, [
            [0, 1],
            [0.08 * r, 0.86, H.outQuad],
            [0.3 * r, 0.94, H.inOutSine],
            [0.8 * r, 0.83, H.inOutSine],
            [1.5 * r, 0.83, H.linear],
            [1.7 * r, 0.86, H.inOutSine],
            [1.9 * r, 0.84, H.inOutSine],
            [n - 0.1, 1, H.inOutSine],
          ]),
        ),
        (i.lean = NP(e, [
          [0, 0],
          [0.1 * r, 0.05 * t, H.outQuad],
          [0.8 * r, 0.09 * t, H.inOutSine],
          [1.5 * r, 0.09 * t, H.linear],
          [n, 0, H.inOutSine],
        ])),
        (i.lift = 0));
      let o = NP(e, [
        [0, 40],
        [0.1 * r, 110, H.outQuad],
        [0.6 * r, 15, H.inOutSine],
        [1.6 * r, 15, H.linear],
        [n, 40, H.inOutSine],
      ]);
      return (
        MP(i, `arm.L.deg`, 40 + (o - 40) * t),
        MP(i, `arm.R.deg`, 40 + (o - 40) * t),
        e > 0.05 * r &&
          e < n - 0.45 * r &&
          MP(i, `props.sapling.state`, `hurt`),
        (i.look = {
          x: 0,
          y: -0.5 * xP(e, 0.5 * r, 0.9 * r, 1.7 * r, n - 0.2),
        }),
        i
      );
    },
    {
      events: AP(n, [
        U.particle(0.05 * r, `star`),
        U.sound(0.1 * r, `flop`),
        U.particle(1.15 * r, `sweat`),
        U.sound(1.3 * r, `huff`),
      ]),
      idle: { ears: !1, look: !1 },
      label: `w.defeat`,
    },
  );
}
function FF(e) {
  let t = mF(e),
    n = 1.2 * hF(e);
  return W(
    n,
    (e) => {
      let n = {},
        r = xP(e, 0.1, 0.35, 0.85, 1.1),
        i = 40 + 40 * r * t;
      return (
        MP(n, `arm.L.deg`, i),
        MP(n, `arm.R.deg`, i),
        (n.lift = 0.03 * t * r),
        pF(n, 1 - 0.03 * t * r),
        (n.lean = 0.07 * t * Math.sin((_P * (e - 0.1)) / 0.9) * r),
        r > 0.3 && ((n.eye = `half`), (n.brow = `raised`), (n.mouth = `flat`)),
        (n.look = { x: 0.3 * Math.sin((_P * e) / 0.9) * r, y: 0 }),
        jP(n, `props.sapling.rot`, 0.2 * t * r * Math.sin((_P * e) / 0.9)),
        n
      );
    },
    {
      events: AP(n, [U.sound(0.3, `huff`)]),
      idle: { look: !1, ears: !1 },
      label: `w.shrug`,
    },
  );
}
function IF(e) {
  let t = mF(e),
    n = 0.62 * hF(e),
    r = 0.2;
  return W(
    n,
    (e) => {
      let i = {},
        a = CP(e, n, 0.6),
        o = Math.sin((_P * e) / r);
      return (
        (i.lean = 0.09 * t * a * o),
        (i.x = 0.03 * t * a * Math.sin((_P * e) / r + 1.2)),
        (i.look = { x: 0.9 * a * o, y: 0 }),
        (i.mood = `angry`),
        (i.mouth = `frown`),
        pF(i, 1 - 0.03 * t * a),
        jP(
          i,
          `props.sapling.rot`,
          -0.25 * t * a * Math.sin((_P * e) / r + 0.6),
        ),
        i
      );
    },
    {
      events: AP(n, [U.sound(0.02, `huff`), U.particle(0.1, `anger`)]),
      idle: { look: !1, ears: !1 },
      label: `w.refuse`,
    },
  );
}
var LF = new Map();
function RF(e) {
  return e.side === `w` || e.side === `b` ? e.side : (LF.get(e.seed) ?? `w`);
}
var zF = (e) => (e === `b` ? FP : fF);
var BF = Xv(0);
var VF = Symbol(`rookAmbient`);
function HF(e, t, n) {
  let r = e.idle;
  if (r[VF]) return;
  r[VF] = !0;
  let i = r.delta.bind(r),
    a = t === `b` ? UP : _F;
  r.delta = (e, t) => {
    let o = i(e, t);
    if (!t.ears || !r.cfg.enabled) return o;
    let s = a(e, n),
      c = { ...(o.props ?? {}) };
    for (let [e, t] of Object.entries(s.props ?? {}))
      c[e] = { ...(c[e] ?? {}), ...t };
    return { ...o, props: c };
  };
}
var UF = {
  kind: `r`,
  rest(e, t, n) {
    (LF.set(n, t), (e.pose = { ...e.pose, mood: `neutral`, bodyPose: `auto` }));
    let r = e.idle.cfg;
    ((e.idle.cfg = Cy({
      ...r,
      breath:
        t === `w` ? { amp: 0.02, period: 3.9 } : { amp: 0.009, period: 5.6 },
      blink:
        r.blink === !1
          ? !1
          : t === `w`
            ? { ...r.blink }
            : { ...r.blink, gap: 4.6 },
    })),
      HF(e, t, n),
      e.refresh());
  },
  entrance: (e, t) => DP(zF(RF(t)).entrance(e, t)),
  hover: (e) => zF(RF(e)).hover(e),
  select: (e) => zF(RF(e)).select(e),
  nervous: (e) => zF(RF(e)).nervous(e),
  sleepy: (e) => zF(RF(e)).sleepy(e),
  gag: (e) => DP(zF(RF(e)).gag(e)),
  deselect: (e) => DP(zF(RF(e)).deselect(e)),
  move: (e) => DP(zF(e.side).move(e)),
  attack: (e) => {
    let t = zF(e.side).attack(e);
    return { action: DP(t.action), impactAt: t.impactAt };
  },
  removed: (e) => zF(e.side).removed(e),
  napping: (e) => zF(RF(e)).napping(e),
  checked: (e) => DP(zF(RF(e)).checked(e)),
  victory: (e) => DP(zF(RF(e)).victory(e)),
  defeat: (e) => DP(zF(RF(e)).defeat(e)),
  shrug: (e) => DP(zF(RF(e)).shrug(e)),
  promoteOut: () => BF,
  promoteIn: () => BF,
  refuse: (e) => DP(zF(RF(e)).refuse(e)),
  forSide(e) {
    let t = (t) => ({ ...t, side: e }),
      n = (e) => (n) => e(t(n));
    return {
      kind: `r`,
      rest: (t, n, r) => UF.rest(t, n ?? e, r),
      entrance: (e, n) => UF.entrance(e, t(n)),
      hover: n(UF.hover),
      select: n(UF.select),
      nervous: n(UF.nervous),
      sleepy: n(UF.sleepy),
      gag: n(UF.gag),
      deselect: n(UF.deselect),
      move: (t) => UF.move({ ...t, side: e }),
      attack: (t) => UF.attack({ ...t, side: e }),
      removed: (t) => UF.removed({ ...t, side: e }),
      napping: n(UF.napping),
      checked: n(UF.checked),
      victory: n(UF.victory),
      defeat: n(UF.defeat),
      shrug: n(UF.shrug),
      promoteOut: () => BF,
      promoteIn: () => BF,
      refuse: n(UF.refuse),
    };
  },
};
var WF = Math.PI * 2;
var GF = (e, t = 0) => (Number.isFinite(e) ? e : t);
var KF = (e) => {
  let t = V(e);
  return t * t * (3 - 2 * t);
};
var qF = (e, t, n) => (n === t ? +(e >= n) : V((e - t) / (n - t)));
var JF = (e, t, n) =>
  e <= t || e >= n ? 0 : Math.sin((Math.PI * (e - t)) / (n - t));
var YF = (e, t, n, r, i) => KF(qF(e, t, n)) * (1 - KF(qF(e, r, i)));
var XF = (e, t, n, r, i = 1, a = 0) =>
  e < t ? 0 : i * Math.exp(-(e - t) / r) * Math.sin(WF * n * (e - t) + a);
function ZF(e, t = 0) {
  let n =
    ((Math.floor(GF(e) * 4294967296) >>> 0) ^ Math.imul(t + 1, 2654435761)) >>>
    0;
  return (
    (n = Math.imul(n ^ (n >>> 16), 2246822507) >>> 0),
    (n = Math.imul(n ^ (n >>> 13), 3266489909) >>> 0),
    (n = (n ^ (n >>> 16)) >>> 0),
    n / 4294967296
  );
}
var QF = (e, t = 0) => (ZF(e, t) < 0.5 ? -1 : 1);
var $F = (e) => ({
  reduced: !!e.reduced,
  a: e.reduced ? 0.5 : 1,
  s: e.reduced ? 0.85 : 1,
  seed: GF(e.seed),
});
function eI(e, t) {
  let n = e.duration;
  return new Jv({
    duration: n,
    label: t ?? e.label,
    idle: e.idle,
    sample: (t) => (t >= n ? {} : e.sample(t)),
    eventsIn: (t, n) => e.eventsIn(t, n),
  });
}
function tI(e, t, n = [], r, i) {
  let a = e;
  return new Jv({
    duration: 1 / 0,
    idle: r,
    label: i,
    sample: (e) => t(e < 0 ? 0 : e - Math.floor(e / a) * a),
    eventsIn: (e, t) => {
      let r = [];
      if (!n.length || !(t > e)) return r;
      let i = Math.max(0, Math.floor(e / a)),
        o = Math.floor(t / a);
      for (let s = i; s <= o && s - i < 64; s++)
        for (let i of n) {
          let n = i.at + s * a;
          n > e && n <= t && r.push({ ...i, at: n });
        }
      return r.sort((e, t) => e.at - t.at);
    },
  });
}
function nI(e, t) {
  let n = kv(e, t);
  n.sy !== void 0 && n.sx !== void 0 && (n.sx = 1 / n.sy);
  for (let t of [`L`, `R`]) {
    let r = e.arm?.[t]?.pick;
    r !== void 0 && n.arm?.[t] && (n.arm[t].pick = r);
  }
  return n;
}
function rI(e, t, n = {}) {
  let r = e,
    i = n.fade ?? 0.15,
    a = tI(r, t, n.events ?? [], n.idle, n.label);
  return new Jv({
    duration: 1 / 0,
    idle: n.idle,
    label: n.label,
    sample: (e) => {
      let t = KF(e / i),
        n = a.sample(e);
      return t >= 1 ? n : nI(n, t);
    },
    eventsIn: (e, t) => a.eventsIn(e, t),
  });
}
function iI(e, t, n, r, i = {}) {
  let a = i.events ?? [],
    o = i.introEvents ?? [];
  return new Jv({
    duration: 1 / 0,
    idle: i.idle,
    label: i.label,
    sample: (i) =>
      i < e ? t(i < 0 ? 0 : i) : r(i - e - Math.floor((i - e) / n) * n),
    eventsIn: (t, r) => {
      let i = [];
      for (let e of o) e.at > t && e.at <= r && i.push(e);
      if (a.length && r > t) {
        let o = Math.max(0, Math.floor((t - e) / n)),
          s = Math.floor((r - e) / n);
        for (let c = o; c <= s && c - o < 64; c++)
          for (let o of a) {
            let a = e + o.at + c * n;
            a > t && a <= r && i.push({ ...o, at: a });
          }
      }
      return i.sort((e, t) => e.at - t.at);
    },
  });
}
function aI(e, t, n = {}) {
  let r = W(e, t, { events: n.events, idle: n.idle, label: n.label });
  return n.holdEnd ? r : eI(r);
}
function oI(e, t) {
  let n = t.length;
  if (e <= t[0][0]) return t[0][1];
  if (e >= t[n - 1][0]) return t[n - 1][1];
  let r = 0;
  for (; r < n - 2 && t[r + 1][0] <= e;) r++;
  let [i, a] = t[r],
    [o, s, c] = t[r + 1];
  if (o <= i) return s;
  let l = (e - i) / (o - i);
  return a + (s - a) * (c ? c(l) : l);
}
function sI(e, t) {
  let n = t[0][1];
  for (let [r, i] of t)
    if (e >= r) n = i;
    else break;
  return n;
}
var Z = {
  sound: (e, t, n) => U.sound(e, t, n),
  particle: (e, t, n) => U.particle(e, t, n),
  impact: (e, t, n, r) => U.impact(e, t, { strength: n, ...r }),
  world: (e, t, n) => U.world(e, t, n),
  custom: (e, t, n) => U.custom(e, t, n),
};
var cI = 6;
var lI = (e, t = !1) => ({
  arm: { R: { deg: GF(e, 102), pick: `dipper` } },
  ...(t ? { props: { armR: { front: !0 } } } : {}),
});
function uI(e, t, n, r = 1) {
  if (t <= 0.02) return {};
  let i = r * t * (n.reduced ? 0.6 : 1),
    a = Math.cos(WF * cI * e),
    o = Math.cos(WF * cI * e + 1.9);
  return {
    props: {
      wingL: { state: `buzz`, rot: 0.17 * i * a },
      wingR: { state: `buzz`, rot: 0.13 * i * (1 + o) },
    },
  };
}
var dI = (...e) => Mv(e);
var fI = gv(0.55, 0, 0.16, 1);
var pI = 0.001;
var mI = (() => {
  let e = 0;
  for (let t = 0; t <= 200; t++) {
    let n = t / 200;
    e = Math.max(
      e,
      (fI(Math.min(1, n + pI)) - fI(Math.max(0, n - pI))) /
        (Math.min(1, n + pI) - Math.max(0, n - pI)),
    );
  }
  return e;
})();
var hI = (e) =>
  e <= 0 || e >= 1
    ? 0
    : V(
        (fI(Math.min(1, e + pI)) - fI(Math.max(0, e - pI))) /
          (Math.min(1, e + pI) - Math.max(0, e - pI)) /
          mI,
      );
var gI = (e) => B(0.45 + 0.075 * (Math.max(1, e) - 1), 0.45, 1.1);
function _I(e) {
  let t = $F(e),
    [n, r] = e.off,
    i = Math.max(0.01, e.dist),
    a = e.facing,
    o = gI(i) * (t.reduced ? 0.88 : 1),
    s = 0.1 * t.s,
    c = 0.17 * t.s,
    l = o - c,
    u = e.away ? 1 : -1,
    d = 0.05 / i,
    f = (e) =>
      e < s ? -d * KF(e / s) : e < l ? -d + (1 + d) * fI(qF(e, s, l)) : 1,
    p = (e) => qF(e, s, l),
    m = (0.05 + 0.014 * Math.min(i, 6)) * t.a,
    h = (e) =>
      e > s && e < l
        ? m * Math.sin(Math.PI * p(e)) ** 0.8 +
          0.006 * t.a * Math.cos(WF * cI * e) * YF(e, s, s + 0.05, l - 0.06, l)
        : 0,
    g = s + 0.05 * t.s,
    _ = g + 0.12 * t.s,
    v = aI(
      o,
      (e) => {
        let t = f(e);
        return { x: n * (1 - t), y: r * (1 - t), lift: h(e) };
      },
      {
        events: [
          Z.sound(g, `drip`),
          Z.particle(g, `drip`, { dx: 0.37, dy: 0.8, fall: 0.8 }),
          ...(i >= 3 && !t.reduced
            ? [Z.particle(s + 0.02, `speed`, { at: `mouth`, dir: a })]
            : []),
          Z.world(_, `hex`, { dx: n, dy: r, from: `departure`, dries: 0.6 }),
        ],
        label: `bee.move.path`,
      },
    ),
    y = t.a,
    b = gy(
      {
        sy: [
          [0, 1],
          [s, 1 - 0.13 * y, `outQuad`],
          [s + 0.06, 1 + 0.1 * y, `outCubic`],
          [l - 0.03, 1 + 0.05 * y, `inOutSine`],
          [l + 0.3 * c, 1 - 0.1 * y, `outQuad`],
          [l + 0.72 * c, 1 + 0.04 * y, `outQuad`],
          [o, 1, `inOutSine`],
        ],
      },
      { duration: o, volume: !0 },
    ),
    x = 0.3,
    S = (e) =>
      e < s ? -a * 0.07 * y * KF(e / s) : e < l ? a * 0.17 * y * hI(p(e)) : 0,
    C = (e) =>
      e < s
        ? 102 + 12 * y * KF(e / s)
        : e < l
          ? 102 + (10 + 12 * (a || 1)) * y * hI(p(e))
          : 102;
  return eI(
    ty(
      v,
      b,
      my(
        aI(Math.max(0.05, o - x), (e) => dI({ lean: S(e) }, lI(C(e))), {
          holdEnd: !0,
        }),
        { freq: 4.6, zeta: 0.42, tail: x },
      ),
      aI(o, (e) => uI(e, YF(e, s - 0.04, s + 0.03, l + 0.02, l + 0.09), t), {
        label: `bee.move.wings`,
      }),
      aI(
        o,
        (e) => {
          let t = YF(e, 0.02, s + 0.03, l, o - 0.03),
            n = hI(p(e));
          return {
            look: { x: a * 0.8 * t, y: a === 0 ? u * 0.55 * t : 0 },
            foot: {
              L: { dx: -a * 0.03 * n, dy: 0.015 * n },
              R: { dx: -a * 0.02 * n, dy: 0.02 * n },
            },
          };
        },
        { idle: { look: !1 } },
      ),
    ),
    `bee.move`,
  );
}
function vI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    [i, a] = e.off,
    o = e.facing,
    s = Math.hypot(i, a) || 1,
    c = -i / s,
    l = -a / s,
    u = o >= 0,
    d = o === 0 ? 0.6 : u ? 0.86 : 0.62,
    f = [-c * d + (o === 0 ? -0.3 : 0), -l * d],
    p = Math.hypot(i - f[0], a - f[1]),
    m = Math.sign(-(i - f[0])) || 0,
    h = 0.09 * r,
    g = B(0.29 + 0.04 * p, 0.27, 0.48) * r,
    _ = g - 0.06 * r,
    v = [0.16, 0.27, 0.42].map((e) => e * r),
    y = g + v[0],
    b = y + v[1],
    x = b + v[2],
    S = x + 0.16 * r,
    C = S + 0.28 * r,
    w = C + 0.12 * r,
    T = u ? [68, 76, 88] : [212, 220, 232],
    E = u ? [126, 134, 162] : [162, 170, 186],
    D = !u,
    O = [0.3, 0.5, 0.9],
    k = (e) => qF(e, h, _),
    A = 0.05 / Math.max(p, 0.05),
    j = (e) => (e < h ? -A * KF(e / h) : e < _ ? -A + (1 + A) * fI(k(e)) : 1),
    M = (e) => KF(qF(e, S, C)) ** 0.85,
    N = (e) => 0.02 * n * YF(e, h, g, S, C),
    P = (e) =>
      n *
      [0.02, 0.035, 0.09].reduce(
        (t, n, i) =>
          t + n * JF(e, [y, b, x][i] - 0.1 * r, [y, b, x][i] + 0.06 * r),
        0,
      ),
    ee = (e) => {
      if (e < g) {
        let t = j(e);
        return [i + (f[0] - i) * t, a + (f[1] - a) * t];
      }
      let t = M(e);
      return [f[0] * (1 - t), f[1] * (1 - t)];
    },
    F = h + 0.05 * r,
    te = F + 0.12 * r,
    ne = aI(
      w,
      (e) => {
        let [t, r] = ee(e);
        return {
          x: t,
          y: r,
          lift:
            (e > h && e < _
              ? (0.05 + 0.014 * Math.min(p, 6)) *
                n *
                Math.sin(Math.PI * k(e)) ** 0.8
              : 0) +
            N(e) +
            P(e) +
            (e > S && e < C ? 0.05 * n * Math.sin(Math.PI * qF(e, S, C)) : 0),
        };
      },
      {
        events: [
          Z.sound(F, `drip`),
          Z.particle(F, `drip`, { dx: 0.37, dy: 0.8, fall: 0.8 }),
          Z.world(te, `hex`, { dx: i, dy: a, from: `departure`, dries: 0.6 }),
          ...[y, b, x].flatMap((e, t) => [
            Z.impact(e, `dink`, O[t], { n: t + 1, crown: t === 2 }),
            Z.sound(e, `tap`, { n: t + 1 }),
            Z.particle(e, `sparkle`, {
              dx: u ? 0.58 : -0.3,
              dy: 0.7,
              scale: 1 + t * 0.4,
            }),
            Z.particle(e + 0.02, `honey`, {
              level: (t + 1) / 3,
              side: u ? 1 : -1,
            }),
          ]),
          Z.custom(S, `carry`, { dx: -f[0], dy: -f[1] }),
          Z.sound(S, `beeBuzz`, { dur: C - S }),
          Z.particle(S + 0.05, `sparkle`, { at: `crown`, scale: 1.2 }),
        ],
        label: `bee.attack.path`,
      },
    ),
    re = (e) => [y, b, x][e] - [0.1, 0.09, 0.3][e] * r,
    ie = [
      [0, 1],
      [h, 1 - 0.13 * n, H.outQuad],
      [h + 0.06, 1 + 0.1 * n, H.outCubic],
      [_, 1.03, H.inOutSine],
      [g + 0.03, 1 - 0.06 * n, H.outQuad],
      [re(0), 1 + 0.05 * n, H.outQuad],
      [y, 1 - 0.07 * n, H.inQuad],
      [y + 0.07, 1.02, H.outQuad],
      [re(1), 1 + 0.06 * n, H.outQuad],
      [b, 1 - 0.11 * n, H.inQuad],
      [b + 0.08, 1.02, H.outQuad],
      [re(2), 1 - 0.05 * n, H.outQuad],
      [x - 0.06 * r, 1 + 0.1 * n, H.outCubic],
      [x, 1 - 0.18 * n, H.inQuad],
      [x + 0.1 * r, 1.05, H.outQuad],
      [S, 1, H.inOutSine],
      [C - 0.06 * r, 1.05, H.outQuad],
      [C, 1 - 0.09 * n, H.inQuad],
      [C + 0.07 * r, 1.03, H.outQuad],
      [w, 1, H.inOutSine],
    ],
    ae = aI(
      w,
      (e) => {
        let t = oI(e, ie);
        return { sy: t, sx: 1 / t };
      },
      { holdEnd: !0 },
    ),
    oe = o || (e.away, 0),
    se = (e) => {
      if (e < g)
        return e < h
          ? -m * 0.07 * n * KF(e / h)
          : e < _
            ? m * 0.17 * n * hI(k(e))
            : 0;
      let t = (t) => JF(e, [y, b, x][t] - 0.06 * r, [y, b, x][t] + 0.2 * r),
        i = (t) => JF(e, re(t) - 0.1 * r, [y, b, x][t] - 0.02),
        a = oe * n;
      return (
        -a * 0.05 * (i(0) + i(1) + i(2)) +
        a * (0.07 * t(0) + 0.09 * t(1) + 0.13 * t(2)) +
        (e > S && e < C ? m * 0 : 0)
      );
    },
    ce = my(
      aI(Math.max(0.05, w - 0.3), (e) => ({ lean: se(e) }), { holdEnd: !0 }),
      { freq: 5, zeta: 0.45, tail: 0.3 },
    ),
    le = (e) =>
      e < g
        ? e < h
          ? 102 + 12 * n * KF(e / h)
          : e < _
            ? 102 + (10 + 12 * (m || 1)) * n * hI(k(e))
            : 102
        : NaN,
    ue = (e) => {
      let t = (e) => T[e],
        i = (e) => E[e],
        a = (e) => 102 + (e - 102) * n,
        o = y,
        s = b,
        c = x;
      return oI(e, [
        [g - 0.03, 102],
        [re(0) + 0.02, a(i(0)), H.outCubic],
        [o - 0.05 * r, a(i(0)) - 1 * n, H.linear],
        [o, a(t(0)), H.inCubic],
        [o + 0.05 * r, a(t(0)), H.linear],
        [o + 0.14 * r, 102 + 4 * n, H.outBack],
        [re(1), 102 + 4 * n, H.linear],
        [re(1) + 0.08 * r, a(i(1)), H.outCubic],
        [s - 0.03 * r, a(i(1)), H.linear],
        [s, a(t(1)), H.inCubic],
        [s + 0.05 * r, a(t(1)), H.linear],
        [s + 0.14 * r, 102 + 6 * n, H.outBack],
        [re(2), 102 + 6 * n, H.linear],
        [c - 0.14 * r, a(i(2)), H.outCubic],
        [c - 0.03 * r, a(i(2)) + 4 * n, H.inOutSine],
        [c, a(t(2)), H.inCubic],
        [c + 0.08 * r, a(t(2)), H.linear],
        [S, 102 + (t(2) - 102) * 0.3 * n, H.outQuad],
        [S + 0.05, 102, H.linear],
        [C, 102, H.linear],
      ]);
    };
  return {
    action: eI(
      ty(
        ne,
        ae,
        ce,
        aI(w, (e) => {
          let n = e < g ? le(e) : ue(e),
            i = qF(e, S, C - 0.05 * r);
          return (
            i > 0 &&
              i < 1 &&
              (n +=
                (t.reduced ? 0 : 360) * KF(i) * 1 +
                (t.reduced ? 30 * Math.sin(Math.PI * i) : 0)),
            t.reduced &&
              i > 0 &&
              i < 1 &&
              (n = 102 + 30 * Math.sin(Math.PI * i)),
            dI(
              lI(
                n,
                D || (i > 0.05 && i < 0.95 && !t.reduced) || (n > 150 && !u),
              ),
              {},
            )
          );
        }),
        aI(w, (e) =>
          uI(
            e,
            Math.max(
              YF(e, h - 0.04, h + 0.03, _ + 0.02, _ + 0.09),
              YF(e, x - 0.04 * r, x, x + 0.06, x + 0.14) * 0.8,
              YF(e, S - 0.02, S + 0.04, C - 0.02, C + 0.06),
            ),
            t,
          ),
        ),
        gy(
          {
            mood: [
              [0, `neutral`],
              [g - 0.02, `smug`],
              [x + 0.06 * r, `happy`],
              [C + 0.04, `happy`],
            ],
          },
          { duration: w },
        ),
        aI(
          w,
          (t) => {
            let r = YF(t, 0.02, h + 0.03, C, w - 0.03),
              i = o === 0 ? (e.away ? 0.6 : -0.4) : 0,
              a =
                [y, b, x].reduce(
                  (e, n, r) =>
                    e + [0.05, 0.08, 0.14][r] * XF(t, n, 5.5, 0.16, 1),
                  0,
                ) * n;
            return {
              look: { x: o * 0.85 * r, y: i * r },
              props: {
                crown: { rot: -o * a * 0.6 },
                antL: { rot: a * 2 },
                antR: { rot: a * 2 },
              },
            };
          },
          { idle: { look: !1 } },
        ),
        aI(w, (e) => {
          let t = YF(e, x - 0.3 * r, x - 0.08 * r, S, S + 0.2),
            i = hI(k(e));
          return {
            arm: { L: { deg: 18 + 62 * t * n } },
            foot: {
              L: { dx: -m * 0.03 * i, dy: 0.015 * i },
              R: { dx: -m * 0.02 * i, dy: 0.02 * i },
            },
          };
        }),
      ),
      `bee.attack`,
    ),
    impactAt: x,
  };
}
var yI = (e, t, n, r = 1) => 360 * r * H.inOutSine(qF(e, t, n));
var bI = (e, t, n, r = 1) => {
  let i = XF(e, t, 5.2, 0.16, n);
  return { props: { antL: { rot: i * r }, antR: { rot: i * r } } };
};
var xI = (e, t) => (Math.abs(e[0]) > 0.2 ? Math.sign(e[0]) : QF(t, 3));
function SI(e, t) {
  let n = $F(t),
    r = n.a,
    i = n.s,
    a = Math.max(0, GF(e)),
    o = 0.5 * i,
    s = a + 0.46 * i,
    c = s + 0.36 * i,
    l = a + 0.86 * i,
    u = [
      [0, 1],
      [s, 1],
      [s + 0.07 * i, 1 - 0.12 * r, H.outQuad],
      [s + 0.13 * i, 1 + 0.1 * r, H.outCubic],
      [c - 0.04, 1.04, H.inOutSine],
      [c, 1 - 0.1 * r, H.inQuad],
      [c + 0.1 * i, 1 + 0.04 * r, H.outQuad],
      [l, 1, H.inOutSine],
    ];
  return aI(
    l,
    (e) => {
      KF(qF(e, s + 0.08 * i, c));
      let t =
          0.13 * r * 4 * qF(e, s + 0.08 * i, c) * (1 - qF(e, s + 0.08 * i, c)),
        l = oI(e, u);
      return dI(
        { draw: qF(e - a, 0, o), lift: t, sy: l, sx: 1 / l },
        uI(e, YF(e, s + 0.04 * i, s + 0.1 * i, c - 0.02, c + 0.08), n),
        lI(
          102 +
            (n.reduced ? 12 : 34) *
              Math.sin(Math.PI * qF(e, s + 0.1 * i, c + 0.05)) ** 2,
        ),
        { mood: e > s + 0.05 * i ? `happy` : `neutral` },
        bI(e, c, 0.3 * r),
      );
    },
    {
      idle: !1,
      events: [
        Z.sound(s + 0.1 * i, `beeBuzz`, { dur: 0.3 }),
        Z.particle(c, `sparkle`, { at: `crown`, scale: 1.1 }),
      ],
      label: `bee.entrance`,
    },
  );
}
function CI(e) {
  let t = $F(e),
    n = t.a,
    r = 1.5;
  return rI(
    r,
    (e) => {
      let i = Math.sin((WF * e) / r),
        a = 1 + 0.035 * n + 0.008 * n * Math.sin((WF * e) / r + 1.2);
      return dI(
        {
          lift: (0.03 + 0.012 * i) * n,
          sy: a,
          sx: 1 / a,
          brow: `raised`,
          lean: 0.012 * n * Math.sin((WF * e) / r + 0.6),
        },
        lI(102 + (10 + 5 * i) * n),
        uI(e, YF(e, 0.95, 1, 1.06, 1.12), t, 0.7),
        bI(e, 0.05, 0.1 * n),
        { arm: { L: { deg: 18 + 8 * n * Math.sin((WF * e) / r + 1) } } },
      );
    },
    { fade: 0.18, label: `bee.hover` },
  );
}
function wI(e) {
  let t = $F(e),
    n = t.a,
    r = 0.75,
    i = 0.2 * t.s,
    a = 0.13 * n;
  return iI(
    i,
    (e) => {
      let r = e / i,
        o = oI(e, [
          [0, 1],
          [0.35 * i, 1 - 0.12 * n, H.outQuad],
          [0.7 * i, 1 + 0.12 * n, H.outCubic],
          [i, 1 + 0.03 * n, H.inOutSine],
        ]);
      return dI(
        {
          lift: a * KF(qF(r, 0.3, 1)),
          sy: o,
          sx: 1 / o,
          mood: r > 0.4 ? `happy` : `neutral`,
        },
        uI(e, YF(e, 0.25 * i, 0.5 * i, i, i + 0.01), t, 0.9),
        lI(102 + 16 * KF(qF(r, 0.2, 1))),
        {
          props: {
            antL: { rot: -0.12 * n * KF(r) },
            antR: { rot: 0.12 * n * KF(r) },
          },
        },
      );
    },
    r,
    (e) => {
      let i = Math.sin((WF * e) / r),
        o = 1 + 0.03 * n + 0.012 * n * i;
      return dI(
        {
          lift: a + 0.02 * n * i,
          sy: o,
          sx: 1 / o,
          lean: 0.03 * n * Math.sin((WF * e) / r),
          mood: `happy`,
        },
        uI(e, 1, t, 0.9),
        lI(118 + 16 * n * Math.sin((WF * e) / r + 1.2)),
        {
          props: { antL: { rot: -0.12 * n }, antR: { rot: 0.12 * n } },
          arm: { L: { deg: 18 + 20 * n * (0.5 + 0.5 * i) } },
        },
      );
    },
    {
      introEvents: [Z.sound(0.3 * i, `beeBuzz`, { dur: 0.35 })],
      label: `bee.select`,
    },
  );
}
function TI(e) {
  let t = $F(e),
    n = t.a,
    r = 1.5,
    i = (e) =>
      sI(e, [
        [0, -0.7],
        [0.4, 0.6],
        [0.75, -0.3],
        [1.1, 0.8],
      ]);
  return rI(
    r,
    (e) => {
      let a = Math.cos(WF * 6 * e),
        o = 0.97 + 0.01 * Math.sin(((WF * e) / r) * 2);
      return dI(
        {
          x: 0.006 * n * a,
          lean: 0.02 * n * Math.sin(((WF * e) / r) * 2),
          sy: o,
          sx: 1 / o,
          mood: `worried`,
          look: { x: i(e), y: 0 },
        },
        uI(e, 0.5 + 0.2 * Math.sin(((WF * e) / r) * 3), t, 0.5),
        lI(125 + 4 * n * a),
        { arm: { L: { deg: 40 + 6 * n * a } } },
      );
    },
    {
      events: [Z.particle(0.3, `sweat`, { at: `face`, side: 1 })],
      idle: { look: !1 },
      label: `bee.nervous`,
    },
  );
}
function EI(e) {
  let t = $F(e),
    n = t.a;
  return rI(
    6,
    (e) => {
      let r = KF(qF(e, 0, 2.4)) * (1 - KF(qF(e, 3.35, 3.5))),
        i = KF(qF(e, 2.4, 3.4)) * (1 - KF(qF(e, 3.35, 3.5))),
        a = JF(e, 3.4, 3.95),
        o = 1 - KF(qF(e, 4.9, 5.6)),
        s = e >= 3.4 && e < 5,
        c = 1 - 0.03 * n * r - 0.03 * n * i + 0.1 * n * JF(e, 3.4, 3.75),
        l = s ? (e < 4 ? `surprised` : e < 4.9 ? `shy` : `neutral`) : `sleepy`;
      return dI(
        {
          lean: (0.05 * r + 0.07 * i) * n - 0.06 * n * a,
          lift: 0.05 * n * JF(e, 3.4, 3.7),
          sy: c,
          sx: 1 / c,
          mood: l,
        },
        uI(e, YF(e, 3.4, 3.44, 3.7, 3.95), t, 1),
        lI(102 - 16 * n * (r + i) + 24 * n * a),
        bI(e, 3.42, 0.35 * n),
        {
          arm: { L: { deg: 18 + 120 * n * YF(e, 4.2, 4.5, 4.8, 5.1) } },
          props: { crown: { rot: 0.08 * n * XF(e, 4.4, 6, 0.3, 1) * o } },
        },
      );
    },
    {
      events: [
        Z.particle(2.7, `zzz`, { at: `top`, scale: 1.4 }),
        Z.sound(3.4, `beeBuzz`, { dur: 0.3 }),
        Z.particle(3.42, `exclaim`, { at: `top` }),
      ],
      label: `bee.sleepy`,
    },
  );
}
function DI(e) {
  let t = $F(e).a;
  return rI(
    3,
    (e) => {
      let n = Math.sin((WF * e) / 3),
        r = 0.96 + 0.02 * t * n;
      return dI(
        {
          mood: `sleepy`,
          lean: 0.07,
          sy: r,
          sx: 1 / r,
          look: { x: 0, y: -0.3 },
        },
        lI(72),
        bI(e, 1.4, 0.1 * t),
        { arm: { L: { deg: 18 } } },
      );
    },
    {
      fade: 0.2,
      events: [Z.particle(0.4, `zzz`, { at: `top`, scale: 1.4 })],
      idle: { blink: !1 },
      label: `bee.napping`,
    },
  );
}
function OI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s;
  if (ZF(t.seed, 11) < 0.5) {
    let e = 1.5 * r,
      i = 0.2 * r,
      a = 0.66 * r,
      o = 0.86 * r,
      s = 1.2 * r,
      c = [
        [0, 1],
        [i, 1 - 0.09 * n, H.outQuad],
        [i + 0.1, 1 + 0.08 * n, H.outCubic],
        [a, 1.02, H.linear],
        [o, 1 + 0.08 * n, H.outBack],
        [s, 1 + 0.03 * n, H.inOutSine],
        [e, 1, H.inOutSine],
      ];
    return aI(
      e,
      (r) => {
        let l = oI(r, c),
          u = YF(r, i + 0.05, i + 0.12, a, a + 0.06),
          d =
            r < i
              ? 102 + 33 * n * KF(r / i)
              : r < a
                ? 102 + 33 * n + (t.reduced ? 0 : yI(r, i + 0.02, a, 2))
                : r < s
                  ? 102 + 48 * n * KF(qF(r, a, o))
                  : 102 + 48 * n * (1 - KF(qF(r, s, e)));
        return dI(
          {
            lift: (0.09 * u + 0.02 * JF(r, o, s)) * n,
            sy: l,
            sx: 1 / l,
            lean:
              -0.04 * n * JF(r, 0, i) +
              0.05 * n * Math.sin(WF * qF(r, i, a)) * u,
            mood: r > o - 0.05 ? `smug` : `neutral`,
            look: { x: 0.6 * JF(r, 0.1, e - 0.1) },
          },
          lI(d, !t.reduced && r > i && r < a + 0.05),
          uI(r, u, t),
        );
      },
      {
        idle: { look: !1 },
        events: [
          Z.sound(i + 0.05, `beeBuzz`, { dur: a - i }),
          Z.particle(o, `sparkle`, { dx: 0.3, dy: 0.95, scale: 1.4 }),
        ],
        label: `bee.gag.flourish`,
      },
    );
  }
  let i = 1.35 * r,
    a = 0.22 * r,
    o = 1 * r,
    s = 1.15 * r;
  return aI(
    i,
    (e) => {
      let i = YF(e, 0.05, a, o, s),
        c = Math.sin(WF * 4 * qF(e, a, o)) * JF(e, a, o),
        l = 1 + 0.02 * n * i;
      return dI(
        {
          arm: { L: { deg: 18 + 124 * n * i + 6 * n * c } },
          sy: l,
          sx: 1 / l,
          mood: e > 0.12 * r && e < o + 0.1 ? `smug` : `neutral`,
          look: { x: 0, y: 0.7 * YF(e, 0.05, 0.2, o - 0.1, o + 0.1) },
          lean: 0.03 * n * c,
          props: { crown: { rot: 0.1 * n * c, dy: 0.012 * n * Math.abs(c) } },
        },
        lI(102 + 6 * n * i),
        uI(e, YF(e, o, o + 0.04, o + 0.14, o + 0.2), t, 0.7),
        bI(e, a, 0.2 * n),
      );
    },
    {
      idle: { look: !1 },
      events: [
        Z.sound(a + 0.05, `tick`),
        Z.particle(o + 0.05, `sparkle`, { at: `crown`, scale: 1.1 }),
      ],
      label: `bee.gag.crown`,
    },
  );
}
function kI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 0.45 * r,
    a = 0.13 * n,
    o = [
      [0, 1 + 0.03 * n],
      [0.06 * r, 1.08, H.outQuad],
      [0.2 * r, 1.03, H.inQuad],
      [0.27 * r, 1 - 0.11 * n, H.outQuad],
      [0.38 * r, 1.03, H.outQuad],
      [i, 1, H.inOutSine],
    ];
  return aI(
    i,
    (e) => {
      let s = oI(e, o);
      return dI(
        {
          lift: oI(e, [
            [0, a],
            [0.06 * r, a + 0.03 * n, H.outQuad],
            [0.24 * r, 0, H.inQuad],
            [i, 0, H.linear],
          ]),
          sy: s,
          sx: 1 / s,
          mood: `happy`,
          lean: -0.03 * n * JF(e, 0.2 * r, i),
        },
        lI(118 + -16 * KF(qF(e, 0.1 * r, 0.3 * r))),
        uI(e, YF(e, 0, 0.01, 0.16 * r, 0.26 * r), t, 0.8),
        { arm: { L: { deg: 18 + 8 * n * JF(e, 0.2 * r, i) } } },
      );
    },
    { events: [Z.sound(0.24 * r, `tick`)], label: `bee.deselect` },
  );
}
function AI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 0.95 * r,
    a = [
      [0, 1],
      [0.05 * r, 1 - 0.08 * n, H.outQuad],
      [0.14 * r, 1 + 0.09 * n, H.outCubic],
      [0.32 * r, 1 - 0.08 * n, H.inQuad],
      [0.42 * r, 1.02, H.outQuad],
      [0.6 * r, 1 - 0.05 * n, H.inOutSine],
      [0.72 * r, 1.01, H.outQuad],
      [i, 1, H.inOutSine],
    ];
  return aI(
    i,
    (e) => {
      let i = oI(e, a);
      return dI(
        {
          lift:
            0.06 *
            n *
            4 *
            qF(e, 0.1 * r, 0.34 * r) *
            (1 - qF(e, 0.1 * r, 0.34 * r)),
          sy: i,
          sx: 1 / i,
          mood:
            e < 0.5 * r ? `surprised` : e < 0.75 * r ? `worried` : `neutral`,
          look: {
            x: 0.9 * JF(e, 0.02, 0.8 * r),
            y: 0.3 * JF(e, 0.02, 0.6 * r),
          },
          lean: -0.05 * n * JF(e, 0.05 * r, 0.3 * r),
        },
        lI(102 + 22 * n * JF(e, 0.05 * r, 0.6 * r)),
        uI(e, YF(e, 0.06 * r, 0.1 * r, 0.3 * r, 0.4 * r), t, 0.8),
        bI(e, 0.12 * r, -0.4 * n),
      );
    },
    {
      idle: { look: !1 },
      events: [
        Z.particle(0.08 * r, `exclaim`, { at: `top` }),
        Z.sound(0.14 * r, `beeBuzz`, { dur: 0.2 }),
      ],
      label: `bee.checked`,
    },
  );
}
function jI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 2.6 * r,
    a = 0.35 * r,
    o = 2 * r,
    s = 2.35 * r;
  return aI(
    i,
    (e) => {
      let c = YF(e, a, a + 0.15, o - 0.1, o),
        l = (e - a) / 1.6,
        u = Math.cos(WF * 6 * e) * c,
        d =
          1 +
          0.04 * n * c * Math.sin(WF * 3 * l) -
          0.1 * n * JF(e, o, s) +
          0.1 * n * JF(e, 0, a) -
          0.08 * n * JF(e, 0, 0.1 * r),
        f =
          e < o
            ? 102 +
              53 * n * KF(qF(e, 0.05, a)) +
              14 * n * Math.sin(WF * 2 * l) * c
            : 102 + 53 * n * (1 - KF(qF(e, o, i)));
      return dI(
        {
          x: 0.15 * n * Math.sin(WF * l) * c,
          y: 0.07 * n * Math.sin(WF * 2 * l) * c,
          lift:
            (0.09 * JF(e, 0.05, a + 0.1) +
              0.06 * c +
              0.03 * c * Math.sin(WF * 3 * l)) *
            n,
          sy: d,
          sx: 1 / d,
          lean: 0.11 * n * u + 0.03 * n * Math.sin(WF * l) * c,
          mood: `victorious`,
          arm: { L: { deg: 18 + 130 * n * YF(e, 0.1, a, o, s) } },
        },
        lI(f, e > 0.3 && e < s),
        uI(e, YF(e, 0.05, 0.12, o + 0.1, o + 0.3), t),
        bI(e, o, 0.2 * n),
      );
    },
    {
      events: [
        Z.sound(0.1, `beeBuzz`, { dur: o }),
        Z.particle(a, `sparkle`, { at: `crown`, scale: 1.4 }),
        Z.particle(a + 0.7, `heart`, { at: `top` }),
        Z.particle(o, `sparkle`, { dx: 0.3, dy: 0.95, scale: 1.6 }),
      ],
      idle: { look: !1 },
      label: `bee.victory`,
    },
  );
}
function MI(e) {
  let t = $F(e),
    n = t.a,
    r = 1.4 * t.s,
    i = (e) => KF(qF(e, 0.05, 0.9));
  return aI(
    r,
    (e) => {
      let t = i(e),
        r = 1 - 0.07 * n * t + 0.03 * n * JF(e, 0, 0.3);
      return dI(
        {
          lean: 0.06 * n * t,
          sy: r,
          sx: 1 / r,
          mood: `worried`,
          look: { x: 0.2, y: -0.7 * t },
          lift: 0,
          props: {
            crown: { state: t > 0.4 ? `hurt` : `idle`, rot: 0.08 * n * t },
            wingL: { state: `droop` },
            wingR: { state: `droop` },
            antL: { state: `droop` },
            antR: { state: `droop` },
          },
        },
        lI(102 - 62 * n * t),
        { arm: { L: { deg: 18 } } },
      );
    },
    {
      holdEnd: !0,
      idle: { look: !1 },
      events: [
        Z.sound(0.4, `sigh`),
        Z.particle(0.5, `sweat`, { at: `face`, side: 1 }),
      ],
      label: `bee.defeat`,
    },
  );
}
function NI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s;
  return aI(
    1 * r,
    (e) => {
      let t = YF(e, 0.06, 0.24 * r, 0.62 * r, 0.9 * r),
        i = 1 - 0.05 * n * t;
      return dI(
        {
          lift: 0.03 * n * t,
          sy: i,
          sx: 1 / i,
          lean: 0.05 * n * t,
          mood: `neutral`,
          mouth: t > 0.3 ? `flat` : void 0,
          brow: t > 0.3 ? `worried` : void 0,
          look: { x: 0.5 * t },
        },
        lI(102 - 34 * n * t),
        { arm: { L: { deg: 18 + 62 * n * t } } },
        bI(e, 0.5 * r, 0.15 * n),
      );
    },
    {
      idle: { look: !1 },
      events: [Z.sound(0.3 * r, `hm`)],
      label: `bee.shrug`,
    },
  );
}
function PI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 0.6 * r;
  return aI(
    i,
    (e) => {
      let a = YF(e, 0, 0.06, i - 0.14, i),
        o = Math.cos(WF * 3.3 * (e / r) + Math.PI);
      return dI(
        {
          lean: 0.045 * n * a * o * -1,
          x: 0.01 * n * a * o,
          look: { x: 0.9 * a * Math.sin((WF * 3.3 * e) / r) },
          mood: `angry`,
          sy: 1 - 0.02 * n * a,
          sx: 1 / (1 - 0.02 * n * a),
        },
        lI(102 + 26 * n * a * (1 - o) * 0.5 + 12 * n * a * o),
        bI(e, 0.05, 0.3 * n),
        uI(e, YF(e, 0.02, 0.06, 0.2, 0.3), t, 0.7),
      );
    },
    {
      idle: { look: !1 },
      events: [Z.sound(0.05, `hm`, { tone: `no` })],
      label: `bee.refuse`,
    },
  );
}
function FI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 1.5 * r,
    a = B(0.55 + 0.6 * GF(e.strength, 0.8), 0.6, 1.15) * n,
    o = xI(e.from, e.seed),
    s = e.from[0],
    c = e.from[1],
    l = 0.28 * r,
    u = 0.62 * r,
    d = 0.88 * r;
  return aI(
    i,
    (e) => {
      let t = XF(e, 0, 3.4, 0.35, 1),
        f = 0.22 * JF(e, 0, 0.55 * r) * a + 0.3 * KF(qF(e, d, d + 0.35 * r)),
        p =
          e < 0.07 * r
            ? 1 - 0.19 * a * KF(e / (0.07 * r))
            : oI(e, [
                [0.07 * r, 1 - 0.19 * a],
                [0.2 * r, 1.1, H.outCubic],
                [l, 1, H.inOutSine],
                [u, 1.03, H.inOutSine],
                [d - 0.05 * r, 1.06, H.outQuad],
                [d, 0.98, H.inQuad],
                [d + 0.3 * r, 0.96, H.outQuad],
                [i, 0.96, H.linear],
              ]),
        m =
          e < u
            ? o *
              (0.2 * a * JF(e, 0, 0.3 * r) +
                0.16 *
                  n *
                  Math.cos(WF * 2.3 * (e - 0.28 * r)) *
                  Math.exp(-(e - 0.28 * r) * 2) *
                  qF(e, 0.28 * r, 0.32 * r))
            : 0,
        h = -o * 0.13 * n * JF(e, u - 0.08, d),
        g = H.inQuad(qF(e, d - 0.02, d + 0.3 * r)),
        _ =
          o * 1.4 * g +
          0.1 *
            n *
            o *
            Math.sin(Math.PI * qF(e, d + 0.3 * r, d + 0.6 * r)) *
            (e > d + 0.3 * r) *
            -1,
        v = e >= d - 0.02,
        y = m + h + (v ? _ : 0) + o * 0.05 * t * (e < l),
        b =
          e < 0.06 * r
            ? `hurt`
            : e < 0.34 * r
              ? `angry`
              : (d - 0.05 * r, `dizzy`),
        x = {
          x: s * f,
          y: c * f * 0.6,
          lift: 0.05 * n * JF(e, 0.03, 0.3 * r),
          sy: p,
          sx: 1 / p,
          lean: y,
          mood: b,
          look: { x: 0.5 * Math.sin(WF * 1.5 * e) * JF(e, 0.3 * r, d) },
        };
      v &&
        ((x.contact = `ground`),
        (x.footFollow = KF(qF(e, d, d + 0.15 * r))),
        (x.bodyPose = `hurt`));
      let S = o > 0 ? -0.1 * g : 0;
      x.props = {
        crown: {
          state: e > 0.05 * r ? `hurt` : `idle`,
          rot: 0.35 * a * JF(e, 0, 0.5 * r) + 0.1,
          dx: S,
          dy: 0.06 * JF(e, 0.02, 0.2 * r) * n,
        },
        wingL: { state: `droop` },
        wingR: { state: `droop` },
        antL: { state: `droop` },
        antR: { state: `droop` },
      };
      let C = o > 0 ? 190 : 150;
      return (
        (x.arm = {
          R: {
            deg:
              102 -
              40 * n * JF(e, 0.1, d + 0.1) * (1 - KF(qF(e, d, d + 0.1))) +
              (C - 102) * KF(qF(e, d, d + 0.3 * r)),
            pick: `dipper`,
          },
        }),
        o > 0 &&
          e > d &&
          (x.props = { ...(x.props ?? {}), armR: { front: !0 } }),
        x
      );
    },
    {
      holdEnd: !0,
      idle: !1,
      events: [
        Z.particle(0.02, `star`, { at: `top`, scale: 1.4 }),
        Z.sound(0.03, `oof`),
        Z.particle(0.3 * r, `orbit`, { at: `top` }),
        Z.impact(d + 0.3 * r, `faint-land`, 0.6 * a + 0.2),
        Z.particle(d + 0.3 * r, `puff`, { scale: 1.2 }),
        Z.sound(d + 0.3 * r, `thud`),
        Z.world(i, `removed`, { kind: `q`, side: `w` }),
      ],
      label: `bee.removed`,
    },
  );
}
var II = {
  rest(e) {
    ((e.idle.cfg = Cy({
      breath: { amp: 0.009, period: 2.6 },
      blink: { gap: 2.7, jitter: 0.15, double: 0.1, step: 0.06 },
      look: {
        maxX: 1,
        maxY: 0.85,
        maxLen: 1.15,
        smooth: 0.09,
        reach: 3.2,
        wanderGap: [0.9, 2.4],
        wander: 0.55,
      },
      ears: { gap: [1.6, 4.2], angle: [0.14, 0.3] },
    })),
      e.idle.reset());
  },
  entrance: SI,
  hover: CI,
  select: wI,
  nervous: TI,
  sleepy: EI,
  gag: OI,
  deselect: kI,
  move: _I,
  attack: vI,
  removed: FI,
  napping: DI,
  checked: AI,
  victory: jI,
  defeat: MI,
  shrug: NI,
  promoteOut: () => Xv(0),
  promoteIn: () => Xv(0),
  refuse: PI,
};
var LI = (...e) => Mv(e);
var RI = [0, 1, 2, 3, 4, 5, 6];
function zI(e, t = {}) {
  let n = {};
  for (let r of RI)
    n[`crest${r}`] = {
      rot:
        -((r - 3) / 3) * e +
        (t.sweep ?? 0) +
        (t.quiver ?? 0) * Math.sin(WF * 7 * (t.t ?? 0) + r * 1.3),
    };
  return { props: n };
}
var BI = (e, t = 0) => ({
  arm: { L: { deg: GF(e, 13) }, R: { deg: GF(e + t, 13) } },
});
var VI = (e, t) => ({ props: { tailL: { rot: e }, tailR: { rot: t } } });
var HI = (e, t, n = !1) => [
  Z.sound(e, `note`, { i: t }),
  Z.particle(e, `note`, { at: `mouth`, i: t, scale: n ? 2 : 1.7 }),
];
var UI = (e, t) => (Math.abs(e[0]) > 0.2 ? Math.sign(e[0]) : QF(t, 5));
var WI = gv(0.42, 0, 0.22, 1.12);
var GI = 0.001;
var KI = (e) =>
  (WI(Math.min(1, e + GI)) - WI(Math.max(0, e - GI))) /
  (Math.min(1, e + GI) - Math.max(0, e - GI));
var qI = (() => {
  let e = 0;
  for (let t = 0; t <= 200; t++) e = Math.max(e, Math.abs(KI(t / 200)));
  return e;
})();
var JI = (e) => (e <= 0 || e >= 1 ? 0 : B(Math.abs(KI(e)) / qI, 0, 1));
var YI = (e) => B(0.62 + 0.08 * (Math.max(1, e) - 1), 0.62, 1.1);
function XI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    [i, a] = e.off,
    o = Math.max(0.01, e.dist),
    s = e.facing,
    c = YI(o) * (t.reduced ? 0.88 : 1),
    l = 0.24 * r,
    u = 0.24 * r,
    d = c - u;
  d - l;
  let f = (e) => qF(e, l, d),
    p = -a / o,
    m = i / o,
    h = 0.09 * Math.min(Math.sqrt(o), 2.5) * QF(t.seed, 1) * n,
    g = (e) =>
      e < l
        ? (-0.03 / o) * KF(e / l)
        : e < d
          ? (-0.03 / o) * (1 - KF(qF(e, l, l + 0.1))) +
            (1 + 0.03 / o) * WI(f(e))
          : 1,
    _ = e.away ? 1 : -1,
    v = aI(
      c,
      (e) => {
        let t = g(e),
          r = h * Math.sin(Math.PI * B(t, 0, 1)) ** 1.2;
        return {
          x: i * (1 - t) + p * r,
          y: a * (1 - t) + m * r,
          lift:
            (0.02 + 0.012 * Math.min(o, 5)) *
            n *
            Math.sin(Math.PI * B(f(e), 0, 1)) ** 1.3,
        };
      },
      {
        events: [
          ...HI(0.55 * l, Math.floor(ZF(t.seed, 2) * 4)),
          Z.sound(d, `rustle`),
        ],
        label: `star.move.path`,
      },
    ),
    y = gy(
      {
        sy: [
          [0, 1],
          [l, 1 + 0.08 * n, `inOutSine`],
          [d - 0.05, 1 + 0.05 * n, `inOutSine`],
          [d + 0.35 * u, 1 - 0.07 * n, `inOutSine`],
          [d + 0.78 * u, 1 + 0.02 * n, `outQuad`],
          [c, 1, `inOutSine`],
        ],
      },
      { duration: c, volume: !0 },
    ),
    b = 0.3,
    x = (e) =>
      e < l
        ? -s * 0.13 * n * KF(e / l)
        : e < d
          ? -s * 0.13 * n * (1 - 0.45 * KF(f(e)))
          : s * 0.07 * n * JF(e, d, d + 0.22 * r),
    S = ay(
      my(
        aI(Math.max(0.05, c - b), (e) => ({ lean: x(e) }), { holdEnd: !0 }),
        { freq: 2.7, zeta: 0.34, tail: b },
      ),
      (e) => 1 - KF(qF(e, c - 0.1, c)),
    ),
    C = ay(
      my(
        aI(
          Math.max(0.05, c - b),
          (e) => VI(-s * 0.3 * n * JI(f(e)), -s * 0.3 * n * JI(f(e))),
          { holdEnd: !0 },
        ),
        { freq: 2.4, zeta: 0.3, tail: b },
      ),
      (e) => 1 - KF(qF(e, c - 0.1, c)),
    ),
    w = (e) => YF(e, 0.35 * l, l, d, d + 0.6 * u);
  return eI(
    ty(
      v,
      y,
      S,
      C,
      aI(
        c,
        (e) =>
          LI(
            BI(13 + 52 * n * w(e) + 8 * n * JI(f(e))),
            zI(0.05 + 0.24 * n * w(e), {
              sweep: -s * 0.12 * n * JI(f(e)),
              quiver: 0.03 * n * w(e),
              t: e,
            }),
            {
              look: {
                x: s * 0.5 * w(e),
                y:
                  (s === 0 ? _ * 0.4 : 0.5) * YF(e, 0.2 * l, l, d, d + 0.4 * u),
              },
              mood: sI(e, [
                [0, `smug`],
                [0.5 * l, `happy`],
                [d + 0.45 * u, `smug`],
              ]),
              foot: {
                L: { dx: -s * 0.03 * JI(f(e)), dy: 0.01 * JI(f(e)) },
                R: { dx: -s * 0.02 * JI(f(e)) },
              },
            },
          ),
        { idle: { look: !1 }, label: `star.move.face` },
      ),
    ),
    `star.move`,
  );
}
function ZI(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    [i, a] = e.off,
    o = e.facing,
    s = Math.hypot(i, a) || 1,
    c = -i / s,
    l = -a / s,
    u = Math.min(1, s),
    d = [-c * u, -l * u],
    f = Math.hypot(i - d[0], a - d[1]),
    p = Math.sign(-(i - d[0])) || 0,
    m = B(0.46 + 0.03 * f, 0.46, 0.58) * r,
    h = 0.2 * r,
    g = m - 0.08 * r,
    _ = m + 0.3 * r,
    v = _ + 0.04 * r,
    y = v + 0.32 * r,
    b = v + 0.18 * r,
    x = y + 0.02 * r,
    S = x + 0.24 * r,
    C = S - 0.04 * r,
    w = C + 0.22 * r,
    T = w + 0.26 * r,
    E = (e) => qF(e, h, g),
    D = (e) => {
      if (e < m) {
        let t = e < h ? -0.02 * KF(e / h) : e < g ? -0.02 + 1.02 * WI(E(e)) : 1;
        return [i + (d[0] - i) * t, a + (d[1] - a) * t];
      }
      if (e < x) return [d[0], d[1]];
      let t = KF(qF(e, x, S));
      return [d[0] * (1 - t), d[1] * (1 - t)];
    },
    O = o || p,
    k = aI(
      T,
      (e) => {
        let [t, r] = D(e);
        return {
          x: t,
          y: r,
          lift:
            (0.02 + 0.012 * Math.min(f, 5)) *
              n *
              Math.sin(Math.PI * B(E(e), 0, 1)) ** 1.3 +
            0.03 * n * JF(e, _, y),
        };
      },
      {
        events: [
          ...HI(0.5 * h, 1),
          Z.sound(_, `breath`),
          ...HI(v, 6, !0),
          Z.particle(v, `ding`, {
            at: `mouth`,
            scale: 2,
            ring: 1,
            dir: [c, l],
            reach: u,
          }),
          Z.particle(v + 0.09 * r, `ding`, {
            at: `mouth`,
            scale: 2.2,
            ring: 2,
            dir: [c, l],
            reach: u,
          }),
          Z.particle(v + 0.18 * r, `ding`, {
            at: `mouth`,
            scale: 2.4,
            ring: 3,
            dir: [c, l],
            reach: u,
          }),
          Z.impact(b, `ring`, 0.9, { kind: `song` }),
          Z.custom(b, `knock`, { dx: c, dy: l }),
          Z.sound(x, `rustle`),
          Z.particle(C, `puff`, { scale: 1.1 }),
          Z.sound(C, `rustle`),
          Z.particle(w, `sparkle`, { at: `circlet`, scale: 1.4 }),
        ],
        label: `star.attack.path`,
      },
    ),
    A = [
      [0, 1],
      [h, 1 + 0.07 * n, H.inOutSine],
      [g, 1.04, H.inOutSine],
      [_, 1 + 0.13 * n, H.inOutSine],
      [v, 1 + 0.15 * n, H.outQuad],
      [b, 1 + 0.09 * n, H.inOutSine],
      [y, 1 - 0.05 * n, H.inOutSine],
      [S, 1 - 0.02 * n, H.inOutSine],
      [C, 1 - 0.15 * n, H.inOutSine],
      [w, 1 - 0.15 * n, H.linear],
      [w + 0.16 * r, 1 + 0.05 * n, H.outBack],
      [T, 1, H.inOutSine],
    ],
    j = aI(
      T,
      (e) => {
        let t =
          oI(e, A) +
          0.012 * n * Math.cos(WF * 6 * e) * YF(e, v, v + 0.05, y - 0.05, y);
        return { sy: t, sx: 1 / t };
      },
      { holdEnd: !0 },
    ),
    M = 0.3,
    N = (e) =>
      e < m
        ? e < h
          ? -p * 0.13 * n * KF(e / h)
          : e < g
            ? -p * 0.13 * n * (1 - 0.45 * KF(E(e)))
            : 0
        : -O *
            n *
            (0.17 * KF(qF(e, m, _)) * (1 - KF(qF(e, y, y + 0.15 * r))) +
              0.05 * JF(e, v, v + 0.2 * r)) +
          O *
            n *
            0.18 *
            JF(e, C - 0.16 * r, w + 0.14 * r) *
            (e >= C - 0.16 * r),
    P = ay(
      my(
        aI(Math.max(0.05, T - M), (e) => ({ lean: N(e) }), { holdEnd: !0 }),
        { freq: 2.9, zeta: 0.36, tail: M },
      ),
      (e) => 1 - KF(qF(e, T - 0.1, T)),
    ),
    ee = (e) => YF(e, m - 0.05 * r, _, y, y + 0.2 * r);
  return (
    YF(0, 0, 0, 0, 0),
    {
      action: eI(
        ty(
          k,
          j,
          P,
          aI(T, (e) => {
            let t = YF(e, C - 0.14 * r, C, w, w + 0.18 * r);
            return BI(
              e < m
                ? 13 + 52 * n * YF(e, 0.35 * h, h, g, m) + 8 * n * JI(E(e))
                : 13 + 155 * n * ee(e) + 65 * n * t * (1 - ee(e)),
            );
          }),
          aI(T, (e) =>
            zI(0.05 + 0.32 * n * ee(e) + 0.12 * n * JF(e, v, y), {
              quiver: 0.05 * n * YF(e, v, v + 0.04, y, y + 0.1),
              t: e,
              sweep:
                -O * 0.04 * JF(e, v, y + 0.1) +
                (e < m ? -p * 0.12 * n * JI(E(e)) : 0) +
                0.09 * n * JF(e, C - 0.1, w + 0.1) * O,
            }),
          ),
          ay(
            my(
              aI(
                Math.max(0.05, T - M),
                (e) => {
                  let t =
                    e < m
                      ? -p * 0.3 * n * JI(E(e))
                      : O *
                        n *
                        (0.3 * JF(e, v, y + 0.2) * -1 +
                          0.25 * JF(e, C - 0.1, w + 0.2));
                  return VI(t, t);
                },
                { holdEnd: !0 },
              ),
              { freq: 2.4, zeta: 0.3, tail: M },
            ),
            (e) => 1 - KF(qF(e, T - 0.1, T)),
          ),
          aI(
            T,
            (e) => {
              let t =
                e < h
                  ? void 0
                  : e < 0.6 * h + 0.3 * m || e < _
                    ? `grin`
                    : e < v
                      ? `open`
                      : e < y
                        ? `o`
                        : e < y + 0.14 * r
                          ? `open`
                          : `smile`;
              return {
                mood: sI(e, [
                  [0, `smug`],
                  [0.5 * h, `happy`],
                  [_, `surprised`],
                  [v - 0.02, `happy`],
                  [y + 0.05, `smug`],
                  [C - 0.08, `happy`],
                  [w + 0.2, `smug`],
                ]),
                ...(t ? { mouth: t } : {}),
                look: {
                  x: o * 0.5 * YF(e, 0.2 * h, h, x, S),
                  y: 0.6 * YF(e, m - 0.05, _, y, y + 0.1),
                },
                foot: {
                  L: { dx: -p * 0.03 * JI(E(e)) },
                  R: { dx: -p * 0.02 * JI(E(e)) },
                },
              };
            },
            { idle: { look: !1 } },
          ),
        ),
        `star.attack`,
      ),
      impactAt: b,
    }
  );
}
function QI(e) {
  let t = $F(e).a,
    n = 2.5;
  return rI(
    n,
    (e) => {
      let r = Math.sin((WF * e) / n),
        i = 1 + 0.045 * t + 0.012 * t * Math.sin((WF * e) / n + 1);
      return LI(
        {
          sy: i,
          sx: 1 / i,
          lean: 0.02 * t * r,
          lift: 0.014 * t * (1 + r),
          mood: `smug`,
          look: { y: 0.25 },
        },
        zI(0.05 + 0.12 * t, { quiver: 0.03 * t, t: e }),
        BI(13 + 10 * t * (0.5 + 0.5 * r)),
        VI(0.05 * t * r, 0.05 * t * r),
      );
    },
    { fade: 0.35, label: `star.hover` },
  );
}
function $I(e) {
  let t = $F(e),
    n = t.a,
    r = 2.5,
    i = 0.35 * t.s,
    a = 0.07 * n;
  return iI(
    i,
    (e) => {
      let t = e / i,
        r = oI(e, [
          [0, 1],
          [0.3 * i, 1 - 0.05 * n, H.outQuad],
          [i, 1 + 0.07 * n, H.outCubic],
        ]);
      return LI(
        {
          lift: a * KF(qF(t, 0.3, 1)),
          sy: r,
          sx: 1 / r,
          mood: t > 0.3 ? `happy` : `smug`,
          mouth: `grin`,
        },
        BI(13 + 65 * n * KF(t)),
        zI(0.05 + 0.24 * n * KF(t)),
      );
    },
    r,
    (e) => {
      let t = Math.sin((WF * e) / r),
        i = 1 + 0.07 * n + 0.014 * n * Math.sin((WF * e) / r + 0.7);
      return LI(
        {
          lift: a + 0.014 * n * t,
          sy: i,
          sx: 1 / i,
          lean: 0.025 * n * Math.sin((WF * e) / r + 1.5),
          mood: `happy`,
          mouth: e < 1.4 ? `grin` : `smile`,
          look: { y: 0.3 },
        },
        BI(78 + 8 * n * t),
        zI(0.05 + 0.24 * n, { quiver: 0.03 * n, t: e }),
        VI(0.08 * n * t, -0.08 * n * t),
      );
    },
    {
      events: [Z.sound(0.3, `note`, { i: 2 })],
      introEvents: [Z.sound(0.5 * i, `breath`)],
      label: `star.select`,
    },
  );
}
function eL(e) {
  let t = $F(e).a,
    n = 1.5;
  return rI(
    n,
    (e) => {
      let r = Math.cos(WF * 6 * e),
        i = 0.95 + 0.012 * Math.sin(((WF * e) / n) * 2);
      return LI(
        {
          x: 0.005 * t * r,
          lean: 0.018 * t * Math.sin((WF * e) / n),
          sy: i,
          sx: 1 / i,
          mood: `worried`,
          mouth: e > 0.5 && e < 0.7 ? `o` : `wavy`,
          look: {
            x: sI(e, [
              [0, -0.6],
              [0.5, 0.5],
              [1, -0.2],
            ]),
          },
        },
        BI(40 + 4 * t * r),
        VI(0.05 * t * r, 0.05 * t * r),
      );
    },
    {
      events: [
        Z.particle(0.3, `sweat`, { at: `face`, side: -1 }),
        Z.sound(0.5, `note`, { i: 4, tiny: 1 }),
      ],
      idle: { look: !1 },
      label: `star.nervous`,
    },
  );
}
function tL(e) {
  let t = $F(e).a;
  return rI(
    8,
    (e) => {
      let n = JF(e, 4.4, 5.9),
        r =
          KF(qF(e, 0, 3.6)) * (1 - KF(qF(e, 4.2, 4.6))) +
          KF(qF(e, 6.4, 7.6)) * 0,
        i = 1 - 0.05 * t * r + 0.09 * t * n;
      return LI(
        {
          sy: i,
          sx: 1 / i,
          lean: 0.05 * t * r - 0.05 * t * n,
          mood: `sleepy`,
          mouth: n > 0.15 ? `open` : void 0,
          lift: 0.02 * t * n,
        },
        BI(13 + 95 * t * n),
      );
    },
    {
      fade: 0.5,
      events: [
        Z.sound(4.6, `yawn`),
        Z.particle(6.6, `zzz`, { at: `top`, scale: 1.4 }),
      ],
      label: `star.sleepy`,
    },
  );
}
function nL(e) {
  let t = $F(e).a;
  return rI(
    4,
    (e) => {
      let n = Math.sin((WF * e) / 4),
        r = 0.95 + 0.02 * t * n;
      return LI(
        { mood: `sleepy`, lean: 0.09, sy: r, sx: 1 / r, look: { y: -0.3 } },
        BI(30),
      );
    },
    {
      fade: 0.3,
      events: [
        Z.particle(0.4, `zzz`, { at: `top`, scale: 1.4 }),
        Z.sound(2.2, `note`, { i: 0, tiny: 1 }),
      ],
      idle: { blink: !1 },
      label: `star.napping`,
    },
  );
}
function rL(e, t) {
  let n = $F(t),
    r = n.a,
    i = n.s,
    a = Math.max(0, GF(e)),
    o = 0.55 * i,
    s = a + 0.5 * i,
    c = a + 0.86 * i,
    l = (e) => YF(e, s, s + 0.22 * i, s + 0.26 * i, c),
    u = [
      [0, 1],
      [s, 1],
      [s + 0.22 * i, 1 + 0.09 * r, H.outCubic],
      [s + 0.32 * i, 1 + 0.03 * r, H.inOutSine],
      [c, 1, H.inOutSine],
    ];
  return aI(
    c,
    (e) => {
      let t = oI(e, u),
        n = l(e);
      return LI(
        {
          draw: qF(e - a, 0, o),
          sy: t,
          sx: 1 / t,
          lift: 0.035 * r * JF(e, s, s + 0.5 * i),
          mood: e > s ? `happy` : `neutral`,
          ...(e > s && e < s + 0.3 * i ? { mouth: `grin` } : {}),
        },
        BI(
          13 +
            137 *
              r *
              n *
              (1 + 0.08 * Math.sin(Math.PI * qF(e, s + 0.2 * i, s + 0.4 * i))),
        ),
        zI(0.05 + 0.3 * r * n, { quiver: 0.04 * r * n, t: e }),
      );
    },
    {
      idle: !1,
      events: [
        ...HI(s + 0.04 * i, 0),
        Z.particle(s + 0.22 * i, `sparkle`, { at: `circlet`, scale: 1.3 }),
      ],
      label: `star.entrance`,
    },
  );
}
function iL(e) {
  let t = $F(e),
    n = t.a,
    r = t.s;
  if (ZF(t.seed, 11) < 0.5) {
    let e = 2.2 * r,
      t = [0.45, 1, 1.55].map((e) => e * r),
      i = 0.4 * r;
    return aI(
      e,
      (e) => {
        let a = t.reduce((t, n) => t + JF(e, n - 0.12 * r, n + i), 0),
          o = JF(e, t[2] - 0.12 * r, t[2] + i),
          s = t
            .map((t, n) => (e >= t - 0.12 * r ? n + 1 : 0))
            .reduce((e, t) => Math.max(e, t), 0),
          c = 1 + (0.05 + 0.02 * s) * n * a;
        return LI(
          {
            sy: c,
            sx: 1 / c,
            lift: 0.012 * s * n * a,
            lean: -0.03 * n * a * (1 + 0.3 * s),
            mood: a > 0.2 ? `happy` : `smug`,
            ...(a > 0.3 ? { mouth: `open` } : {}),
            look: { y: 0.4 * a },
          },
          zI(0.05 + 0.1 * n * a, { quiver: 0.03 * n * a, t: e }),
          BI(13 + 30 * n * a * (1 + o)),
        );
      },
      {
        idle: { look: !1 },
        events: [...HI(t[0], 0), ...HI(t[1], 2), ...HI(t[2], 4)],
        label: `star.gag.scale`,
      },
    );
  }
  let i = 1.8 * r,
    a = 0.35 * r,
    o = 1.3 * r;
  return aI(
    i,
    (e) => {
      let t = YF(e, 0.1, a, o, o + 0.3 * r),
        i = XF(e, a + 0.3 * r, 4, 0.3, 0.5 * n);
      return LI(
        {
          lean: -0.05 * n * t,
          sy: 1 + 0.02 * n * t,
          mood: e > 0.1 ? `happy` : `smug`,
          arm: { R: { deg: 13 + 159 * n * t } },
          look: { x: 0.4 * t, y: 0.5 * t },
        },
        zI(0.05 + 0.05 * n * t, { t: e }),
        {
          props: {
            crest4: { rot: i },
            crest5: { rot: i * 0.6 },
            circlet: { dy: 0.01 * t },
          },
        },
      );
    },
    {
      idle: { look: !1 },
      events: [
        Z.sound(a + 0.3 * r, `rustle`),
        Z.particle(o, `sparkle`, { at: `circlet`, scale: 1.5 }),
      ],
      label: `star.gag.preen`,
    },
  );
}
function aL(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 0.65 * r,
    a = 0.07 * n;
  return aI(
    i,
    (e) => {
      let t = oI(e, [
        [0, 1 + 0.07 * n],
        [0.22 * r, 0.95, H.inOutSine],
        [0.45 * r, 1.02, H.outQuad],
        [i, 1, H.inOutSine],
      ]);
      return LI(
        {
          lift: a * (1 - KF(qF(e, 0, 0.3 * r))),
          sy: t,
          sx: 1 / t,
          mood: e < 0.3 * r ? `happy` : `smug`,
          lean: 0.03 * n * JF(e, 0.1 * r, i),
        },
        BI(78 - 65 * KF(qF(e, 0.05 * r, 0.4 * r))),
        zI(0.05 + 0.24 * n * (1 - KF(qF(e, 0, 0.35 * r))), { t: e }),
      );
    },
    { events: [Z.sound(0.1 * r, `sigh`)], label: `star.deselect` },
  );
}
function oL(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 1.15 * r;
  return aI(
    i,
    (e) => {
      let t = YF(e, 0.02, 0.22 * r, 0.7 * r, 1 * r),
        a = 1 + 0.1 * n * t - 0.04 * n * JF(e, 0.75 * r, i),
        o = Math.cos(WF * 6 * e) * YF(e, 0.25 * r, 0.3 * r, 0.7 * r, 0.8 * r);
      return LI(
        {
          sy: a,
          sx: 1 / a,
          lean: -0.1 * n * t + 0.02 * n * o,
          mood: e < 0.8 * r ? `surprised` : `worried`,
          look: { y: 0.4 * t },
          lift: 0.02 * n * t,
        },
        BI(13 + 70 * n * t),
        zI(0.05 + 0.33 * n * t, { quiver: 0.05 * n * t, t: e }),
        VI(-0.1 * n * t, 0.1 * n * t),
      );
    },
    {
      idle: { look: !1 },
      events: [
        Z.particle(0.06 * r, `alarm`, { at: `top` }),
        Z.sound(0.08 * r, `note`, { i: 5, gasp: 1 }),
        Z.particle(0.3 * r, `sweat`, { at: `face`, side: 1 }),
      ],
      label: `star.checked`,
    },
  );
}
function sL(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 3.4 * r,
    a = 0.55 * r,
    o = 2.5 * r,
    s = 3.1 * r;
  return aI(
    i,
    (e) => {
      let t = YF(e, a, a + 0.1, o, o + 0.15),
        r = Math.cos(WF * 6 * e) * t,
        c = YF(e, o + 0.1, s - 0.1, s, i - 0.05) * +(e < i),
        l = YF(e, 0.05, a, o, o + 0.25),
        u =
          1 +
          0.12 * n * l +
          0.014 * n * Math.cos(WF * 3 * e) * t -
          0.12 * n * c,
        d =
          13 +
          152 * n * l * (1 - c) +
          6 * n * Math.sin(WF * 3 * e) * t +
          60 * n * c;
      return LI(
        {
          sy: u,
          sx: 1 / u,
          lift: (0.05 * l + 0.02 * t * Math.sin((WF * e) / 1.2)) * n,
          lean: 0.03 * n * r - 0.05 * n * l + 0.22 * n * c,
          mood: t > 0.3 ? `victorious` : c > 0.2 ? `happy` : `smug`,
          ...(t > 0.3 ? { mouth: `open` } : {}),
          look: { y: 0.5 * l },
        },
        BI(d),
        zI(0.05 + 0.33 * n * l - 0.2 * n * c, {
          quiver: 0.04 * n * t,
          t: e,
          sweep: 0.15 * n * c,
        }),
        VI(0.05 * n * r, -0.05 * n * r),
      );
    },
    {
      idle: { look: !1 },
      events: [
        Z.sound(0.2 * r, `breath`),
        ...HI(a + 0.05 * r, 3, !0),
        ...HI(a + 0.55 * r, 5, !0),
        ...HI(a + 1.1 * r, 6, !0),
        Z.particle(a + 0.9 * r, `sparkle`, { at: `circlet`, scale: 1.6 }),
        Z.particle(s, `heart`, { at: `top` }),
        Z.sound(o + 0.2 * r, `rustle`),
      ],
      label: `star.victory`,
    },
  );
}
function cL(e) {
  let t = $F(e),
    n = t.a,
    r = 1.6 * t.s;
  return aI(
    r,
    (e) => {
      let i = YF(e, 0.05, 0.4 * t.s, 0.85 * t.s, 1.25 * t.s),
        a = KF(qF(e, 0.8 * t.s, r)),
        o = 1 - 0.07 * n * a + 0.05 * n * JF(e, 0, 0.4 * t.s),
        s = a > 0.3 ? `droop` : `idle`,
        c = {};
      for (let e of RI) c[`crest${e}`] = { state: s, rot: 0 };
      return LI(
        {
          sy: o,
          sx: 1 / o,
          lean: -0.16 * n * i * (1 - a) + 0.05 * n * a,
          mood: `worried`,
          look: { y: -0.7 * a, x: 0.2 * (1 - a) },
          mouth: `wavy`,
        },
        {
          arm: {
            L: { deg: 13 + 12 * n * a },
            R: { deg: 13 + 159 * n * i * (1 - a) + 12 * n * a },
          },
          props: { ...c, circlet: { state: a > 0.4 ? `hurt` : `idle` } },
        },
      );
    },
    {
      holdEnd: !0,
      idle: { look: !1 },
      events: [
        Z.sound(0.3 * t.s, `note`, { i: 1, sad: 1 }),
        Z.sound(0.9 * t.s, `sigh`),
        Z.particle(1 * t.s, `sweat`, { at: `face`, side: 1 }),
      ],
      label: `star.defeat`,
    },
  );
}
function lL(e) {
  let t = $F(e),
    n = t.a,
    r = t.s;
  return aI(
    1.1 * r,
    (e) => {
      let t = YF(e, 0.1, 0.4 * r, 0.75 * r, 1 * r),
        i = 1 - 0.04 * n * t;
      return LI(
        {
          sy: i,
          sx: 1 / i,
          lift: 0.025 * n * t,
          lean: 0.06 * n * t,
          mood: `smug`,
          ...(t > 0.3 ? { mouth: `flat` } : {}),
          look: { x: 0.4 * t },
        },
        BI(13 + 72 * n * t),
        zI(0.05 + 0.08 * n * t, { t: e }),
      );
    },
    {
      idle: { look: !1 },
      events: [Z.sound(0.35 * r, `hm`)],
      label: `star.shrug`,
    },
  );
}
function uL(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 0.85 * r;
  return aI(
    i,
    (e) => {
      let t = YF(e, 0.02, 0.16 * r, i - 0.25, i),
        a = Math.sin((WF * 2.4 * e) / r),
        o = 1 + 0.07 * n * t;
      return LI(
        {
          sy: o,
          sx: 1 / o,
          lean: -0.08 * n * t + 0.05 * n * a * t,
          x: 0.006 * n * a * t,
          mood: `angry`,
          mouth: `frown`,
          look: { x: 0.9 * a * t },
        },
        BI(13 + 118 * n * t),
        zI(0.05 + 0.3 * n * t, { quiver: 0.04 * n * t, t: e }),
        { foot: { L: { dy: 0.025 * n * JF(e, 0.1 * r, 0.25 * r) } } },
      );
    },
    {
      idle: { look: !1 },
      events: [Z.sound(0.06 * r, `note`, { i: 1, no: 1 })],
      label: `star.refuse`,
    },
  );
}
function dL(e) {
  let t = $F(e),
    n = t.a,
    r = t.s,
    i = 1.6 * r,
    a = B(0.55 + 0.6 * GF(e.strength, 0.8), 0.6, 1.15) * n,
    o = UI(e.from, e.seed),
    s = e.from[0],
    c = e.from[1],
    l = 0.12 * r,
    u = 0.66 * r,
    d = 0.92 * r,
    f = d + 0.42 * r;
  return aI(
    i,
    (e) => {
      let t = 0.26 * a * JF(e, 0, 0.6 * r) + 0.3 * KF(qF(e, d, f)),
        p =
          e < 0.07 * r
            ? 1 - 0.19 * a * KF(e / (0.07 * r))
            : oI(e, [
                [0.07 * r, 1 - 0.19 * a],
                [0.2 * r, 1.12, H.outCubic],
                [0.5 * r, 1, H.inOutSine],
                [u, 1.06, H.inOutSine],
                [d, 1, H.inQuad],
                [f, 0.95, H.outQuad],
                [i, 0.95, H.linear],
              ]),
        m =
          o *
          (0.24 * a * JF(e, 0, 0.5 * r) +
            0.16 *
              n *
              Math.cos(WF * 1.7 * (e - 0.3 * r)) *
              Math.exp(-(e - 0.3 * r) * 1.7) *
              qF(e, 0.3 * r, 0.34 * r) *
              (e < u)),
        h = H.inQuad(qF(e, d, f)),
        g = -o * 0.18 * n * KF(qF(e, u - 0.05, d - 0.02)) * (1 - h),
        _ =
          e >= d
            ? o *
              (1.45 * H.inQuad(qF(e, d, f)) -
                0.11 * n * Math.sin(Math.PI * qF(e, f, f + 0.3 * r)) * (e > f))
            : 0,
        v = e >= d - 0.02,
        y =
          e > l && e < u
            ? 100 + 45 * n * Math.sin(WF * 3 * (e - l))
            : e < l
              ? 150
              : 100,
        b = KF(qF(e, d, f)),
        x = {
          x: s * t,
          y: c * t * 0.6,
          lift: 0.04 * n * JF(e, 0.03, 0.3 * r),
          sy: p,
          sx: 1 / p,
          lean: m + g + _,
          mood: e < 0.08 * r ? `hurt` : e < 0.3 * r ? `surprised` : `dizzy`,
          ...(e > 0.02 && e < d ? { mouth: e < 0.4 * r ? `open` : `o` } : {}),
          look: { x: 0.5 * Math.sin(WF * 1.4 * e) * JF(e, 0.3 * r, d) },
        };
      v &&
        ((x.contact = `ground`),
        (x.footFollow = KF(qF(e, d, d + 0.15 * r))),
        (x.bodyPose = `hurt`));
      let S = YF(e, u - 0.1, u + 0.1, d, d + 0.1),
        C = o > 0 ? `R` : `L`,
        w = (e) => {
          let t = e === `R` ? y + (172 - y) * S : y;
          return t + ((e === C ? 13 : 78) - t) * b;
        };
      x.arm = { L: { deg: w(`L`) }, R: { deg: w(`R`) } };
      let T = zI(0.05 + 0.45 * a * JF(e, 0, 0.5 * r), {
        quiver: 0.07 * n * JF(e, 0.05 * r, 0.6 * r),
        t: e,
        sweep: o * 0.2 * a * JF(e, 0, 0.3 * r),
      });
      if (e >= f - 0.05 * r)
        for (let e of RI) T.props[`crest${e}`] = { rot: 0, state: `droop` };
      return (
        (x.props = {
          ...(T.props ?? {}),
          tailL: { rot: -0.2 * n * Math.sin(WF * 3 * e) * JF(e, 0.05, d) },
          tailR: { rot: 0.2 * n * Math.sin(WF * 3 * e + 1) * JF(e, 0.05, d) },
        }),
        x
      );
    },
    {
      holdEnd: !0,
      idle: !1,
      events: [
        Z.particle(0.02, `burst`, { at: `top`, scale: 1.6 }),
        ...HI(0.03, 5),
        Z.particle(0.3 * r, `orbit`, { at: `top` }),
        Z.sound(u, `note`, { i: 4, fall: 1 }),
        Z.sound(u + 0.2 * r, `note`, { i: 2, fall: 1 }),
        Z.sound(d, `note`, { i: 0, fall: 1 }),
        Z.impact(f, `faint-land`, 0.6 * a + 0.2),
        Z.particle(f, `puff`, { scale: 1.3 }),
        Z.sound(f, `thud`),
        Z.world(i, `removed`, { kind: `q`, side: `b` }),
      ],
      label: `star.removed`,
    },
  );
}
var fL = {
  rest(e) {
    ((e.idle.cfg = Cy({
      breath: { amp: 0.02, period: 5.2 },
      blink: { gap: 4.4, jitter: 0.2, double: 0.06, step: 0.08 },
      look: {
        maxX: 1,
        maxY: 0.85,
        maxLen: 1.15,
        smooth: 0.18,
        reach: 3.6,
        wanderGap: [2.2, 5.5],
        wander: 0.3,
      },
    })),
      e.idle.reset());
  },
  entrance: rL,
  hover: QI,
  select: $I,
  nervous: eL,
  sleepy: tL,
  gag: iL,
  deselect: aL,
  move: XI,
  attack: ZI,
  removed: dL,
  napping: nL,
  checked: oL,
  victory: sL,
  defeat: cL,
  shrug: lL,
  promoteOut: () => Xv(0),
  promoteIn: () => Xv(0),
  refuse: uL,
};
var pL = new Map();
function mL(e) {
  return e.side === `w` || e.side === `b` ? e.side : (pL.get(e.seed) ?? `w`);
}
var hL = (e) => (e === `b` ? fL : II);
var gL = {
  kind: `q`,
  rest: (e, t, n) => {
    (pL.set(n, t), hL(t).rest(e, n));
  },
  entrance: (e, t) => hL(mL(t)).entrance(e, t),
  hover: (e) => hL(mL(e)).hover(e),
  select: (e) => hL(mL(e)).select(e),
  nervous: (e) => hL(mL(e)).nervous(e),
  sleepy: (e) => hL(mL(e)).sleepy(e),
  gag: (e) => hL(mL(e)).gag(e),
  deselect: (e) => hL(mL(e)).deselect(e),
  move: (e) => hL(e.side).move(e),
  attack: (e) => hL(e.side).attack(e),
  removed: (e) => hL(e.side).removed(e),
  napping: (e) => hL(mL(e)).napping(e),
  checked: (e) => hL(mL(e)).checked(e),
  victory: (e) => hL(mL(e)).victory(e),
  defeat: (e) => hL(mL(e)).defeat(e),
  shrug: (e) => hL(mL(e)).shrug(e),
  promoteOut: (e) => hL(mL(e)).promoteOut(e),
  promoteIn: (e) => hL(mL(e)).promoteIn(e),
  refuse: (e) => hL(mL(e)).refuse(e),
};
var Q = Math.PI * 2;
var _L = (e, t, n) => (e < t ? t : e > n ? n : e);
var vL = (e) => (e < 0 ? 0 : e > 1 ? 1 : e);
var yL = (e) => {
  let t = vL(e);
  return t * t * (3 - 2 * t);
};
var bL = (e) => {
  let t = vL(e);
  return 1 - (1 - t) * (1 - t);
};
var xL = (e) => -(Math.cos(Math.PI * vL(e)) - 1) / 2;
var SL = (e, t, n) => (n > t ? vL((e - t) / (n - t)) : +(e >= n));
var CL = (e, t, n, r = yL) => r(SL(e, t, n));
var $ = (e, t, n) =>
  e <= t || e >= n ? 0 : Math.sin((Math.PI * (e - t)) / (n - t));
var wL = (e, t, n, r, i) => yL(SL(e, t, n)) * (1 - yL(SL(e, r, i)));
var TL = (e, t, n, r) => {
  let i = (e - t) / n;
  return i > 0 && i < 1 ? r * 4 * i * (1 - i) : 0;
};
var EL = (e, t, n, r, i) => {
  let a = e - t;
  return a <= 0 ? 0 : n * Math.exp(-i * a) * Math.sin(Q * r * a);
};
var DL = (e, t = 12) => Math.floor(e * t + 1e-9) / t;
function OL(e, t = 0) {
  let n =
    (Math.floor((Number.isFinite(e) ? e : 0.5) * 4294967296) ^
      Math.imul(t + 1, 2654435761)) >>>
    0;
  return (
    (n = Math.imul(n ^ (n >>> 16), 2246822507) >>> 0),
    (n = Math.imul(n ^ (n >>> 13), 3266489909) >>> 0),
    (n = (n ^ (n >>> 16)) >>> 0),
    n / 4294967296
  );
}
var kL = (e, t = 0) => (OL(e, t) < 0.5 ? -1 : 1);
function AL(e, t) {
  let n = t.length;
  if (e <= t[0][0]) return t[0][1];
  if (e >= t[n - 1][0]) return t[n - 1][1];
  let r = 0;
  for (; r < n - 2 && t[r + 1][0] <= e;) r++;
  let i = t[r],
    a = t[r + 1],
    o = H[a[2] ?? `smooth`];
  return i[1] + (a[1] - i[1]) * o((e - i[0]) / (a[0] - i[0]));
}
function jL(e, t) {
  let n;
  for (let [r, i] of e)
    if (r <= t) n = i;
    else break;
  return n ?? void 0;
}
var ML = (e) => (e ? 0.5 : 1);
var NL = class {
  d = {};
  A;
  armRest;
  constructor(e = 1, t = 0) {
    ((this.A = e), (this.armRest = t));
  }
  num(e) {
    let t = Tv(this.d, e);
    return typeof t == `number` ? t : void 0;
  }
  add(e, t, n = !1) {
    if (Sv(e) !== `add`)
      throw Error(`DB.add: '${e}' is not an additive channel`);
    return (
      (t === 0 && this.num(e) === void 0) ||
        wv(this.d, e, (this.num(e) ?? 0) + (n ? t : t * this.A)),
      this
    );
  }
  mul(e, t, n = !1) {
    if (Sv(e) !== `mul`)
      throw Error(`DB.mul: '${e}' is not a multiplicative channel`);
    return (
      wv(this.d, e, (this.num(e) ?? 1) * (n ? t : 1 + (t - 1) * this.A)),
      this
    );
  }
  put(e, t) {
    let n = Sv(e);
    if (n !== `ovr` && n !== `set`)
      throw Error(`DB.put: '${e}' is not an override or discrete channel`);
    return (wv(this.d, e, t), this);
  }
  travel(e, t) {
    return (this.add(`x`, e, !0), this.add(`y`, t, !0), this);
  }
  lift(e) {
    return this.add(`lift`, e);
  }
  liftRaw(e) {
    return this.add(`lift`, e, !0);
  }
  lean(e) {
    return this.add(`lean`, e);
  }
  leanRaw(e) {
    return this.add(`lean`, e, !0);
  }
  shear(e) {
    return this.add(`shear`, e);
  }
  sway(e) {
    return this.add(`x`, e);
  }
  squash(e) {
    let t = 1 + (e - 1) * this.A;
    return (
      wv(this.d, `sy`, (this.num(`sy`) ?? 1) * t),
      wv(this.d, `sx`, (this.num(`sx`) ?? 1) / t),
      this
    );
  }
  wide(e) {
    return this.mul(`sx`, e);
  }
  blink(e) {
    return this.add(`blink`, e, !0);
  }
  look(e, t = 0) {
    return (this.add(`look.x`, e), t && this.add(`look.y`, t), this);
  }
  arm(e, t) {
    return this.put(`arm.${e}.deg`, this.armRest + (t - this.armRest) * this.A);
  }
  arms(e) {
    return this.arm(`L`, e).arm(`R`, e);
  }
  armFront(e, t = !0) {
    return this.put(`props.arm${e}.front`, t);
  }
  foot(e, t) {
    return (
      t.dx && this.add(`foot.${e}.dx`, t.dx),
      t.dy && this.add(`foot.${e}.dy`, t.dy),
      t.rot && this.add(`foot.${e}.rot`, t.rot),
      this
    );
  }
  prop(e, t, n = !1) {
    return (
      t.rot && this.add(`props.${e}.rot`, t.rot, n),
      t.dx && this.add(`props.${e}.dx`, t.dx, n),
      t.dy && this.add(`props.${e}.dy`, t.dy, n),
      t.sx !== void 0 && this.mul(`props.${e}.sx`, t.sx, n),
      t.sy !== void 0 && this.mul(`props.${e}.sy`, t.sy, n),
      t.alpha !== void 0 && this.mul(`props.${e}.alpha`, t.alpha, !0),
      this
    );
  }
  propState(e, t) {
    return (t !== void 0 && this.put(`props.${e}.state`, t), this);
  }
  mood(e) {
    return (e !== void 0 && this.put(`mood`, e), this);
  }
  eye(e) {
    return (e !== void 0 && this.put(`eye`, e), this);
  }
  brow(e) {
    return (e !== void 0 && this.put(`brow`, e), this);
  }
  mouth(e) {
    return (e !== void 0 && this.put(`mouth`, e), this);
  }
  bodyPose(e) {
    return (e !== void 0 && this.put(`bodyPose`, e), this);
  }
};
function PL(e, t, n = {}) {
  let r = Math.min(n.taper ?? 0.05, e * 0.5);
  return W(
    e,
    r > 0
      ? (n) => {
          let i = t(n);
          if (n <= e - r) return i;
          let a = kv(i, yL((e - n) / r));
          return (
            i.draw !== void 0 &&
              ((a.draw = i.draw), a.mix && delete a.mix.draw),
            a
          );
        }
      : t,
    { events: n.events, label: n.label, idle: n.idle },
  );
}
function FL(e, t, n = {}) {
  return ry(
    W(e, t, { events: n.events, label: n.label, idle: n.idle }),
    n.times ?? 1 / 0,
  ).named(n.label ?? `cycle`);
}
function IL(e, t, n, r) {
  let i = r.ease ?? yL,
    a = (t) => n(((t % e) + e) % e),
    o = ry(
      W(e, (e) => a(t + e), {
        events: (r.events ?? []).map((n) => ({
          ...n,
          at: (((n.at - t) % e) + e) % e,
        })),
        label: r.label,
      }),
    );
  return t > 0
    ? ey(
        W(
          t,
          (e) => {
            let n = i(e / t),
              o = kv(a(e), n);
            return r.extras ? jv(o, r.extras(e)) : o;
          },
          { label: `${r.label}:in` },
        ),
        o,
      ).named(r.label)
    : o.named(r.label);
}
var LL = (e, t, n) => U.sound(e, t, n);
var RL = (e, t, n = {}) => U.particle(e, t, n);
var zL = (e = `noop`) => Xv(0).named(e);
function BL(e, t, n, r, i) {
  let a = 0,
    o = t,
    s = e,
    c = 0,
    l = e;
  for (let e = 0; e < 8; e++) {
    let e = o * o + 2 * n * (a - i),
      t = (o + Math.sqrt(Math.max(0, e))) / n;
    if (s <= t) return [a + o * s - 0.5 * n * s * s, c, l];
    if (((s -= t), (l = s), (o = -(o - n * t) * r), (a = i), c++, o < 0.3))
      return [i, c, s];
  }
  return [i, c, s];
}
function VL(e, t, n, r, i) {
  let a = [],
    o = t,
    s = 0,
    c = e;
  for (let e = 0; e < 6; e++) {
    let e = (o + Math.sqrt(o * o + 2 * n * (s - i))) / n;
    if (((c += e), a.push(c), (o = (e * n - o) * r), (s = i), o < 0.3)) break;
  }
  return a;
}
function HL(e, t) {
  let n = e - t.t0;
  if (n < 0) return { detached: !1, dx: 0, dy: 0, sx: 1, rot: 0, landed: 0 };
  let r = t.g ?? 9,
    i = t.e ?? (t.calm ? 0.3 : 0.42),
    [a, o, s] = BL(n, t.vy, r, i, t.floor),
    c = (t.vy + Math.sqrt(t.vy * t.vy + 2 * r * -t.floor)) / r,
    l = n > c ? (0.45 * t.vx * (1 - Math.exp(-3 * (n - c)))) / 3 : 0,
    u = t.vx * Math.min(n, c) + l,
    d = 1 - yL(SL(e, t.end - 0.35, t.end)),
    f = t.calm ? 0 : (t.spin ?? 3),
    p = Q * 0.5 * f * (1 - Math.exp(-2.2 * n)),
    m = f ? Math.max(0.16, Math.abs(Math.cos(p))) : 1,
    h = t.vx >= 0 ? 1 : -1,
    g =
      o > 0
        ? 0.34 * Math.exp(-4.2 * s) * Math.cos(21 * s) * h
        : 0.12 * Math.sin(Q * 1.5 * n) * h;
  return {
    detached: !0,
    dx: u,
    dy: a,
    sx: 1 + (m - 1) * d,
    rot: _L(g * d, -0.35, 0.35),
    landed: o,
  };
}
function UL(e, t, n = `crown`) {
  t.detached &&
    (e.put(`props.${n}.follow`, 0),
    e.prop(n, { dx: t.dx, dy: t.dy, rot: t.rot, sx: t.sx }, !0));
}
function WL(e, t, n, r = `leaf`) {
  let i = t - n.t0;
  if (i < 0) return;
  let a = _L(i / n.fall, 0, 1),
    o = n.floor * (a * (2 - a)),
    s = Math.sin(Q * 1.1 * i) * (1 - yL(a)) * (n.calm ? 0.5 : 1),
    c = n.drift * (1 - Math.exp(-2.2 * i)) + 0.12 * s,
    l = _L(0.46 * Math.cos(Q * 1.1 * i + 0.6) * (1 - 0.7 * yL(a)), -0.5, 0.5);
  (e.put(`props.${r}.follow`, 0), e.prop(r, { dx: c, dy: o, rot: l }, !0));
}
var GL = {
  w: {
    hover: { intro: 0.34, period: 2.4 },
    select: { intro: 0.4, period: 0.78 },
    nervous: { intro: 0.2, period: 1.2 },
    sleepy: { intro: 0.3, period: 6.4 },
    napping: { intro: 0, period: 4.4 },
  },
  b: {
    hover: { intro: 0.5, period: 3 },
    select: { intro: 0.6, period: 2.2 },
    nervous: { intro: 0.3, period: 1.8 },
    sleepy: { intro: 0.4, period: 8 },
    napping: { intro: 0, period: 5 },
  },
};
var KL = GL.w;
var qL = 150;
var JL = -38;
var YL = -0.88;
var XL = -1.03;
var ZL = 0.5;
var QL = (e, t) => {
  let n = Math.hypot(e, t);
  return n > 1e-6 ? [e / n, t / n] : [0, -1];
};
var $L = (e, t, n, r, i) =>
  r + (i - r) * (0.5 + 0.5 * Math.cos((Q * (DL(e) - t)) / n));
var eR = (e, t) => {
  (e.arm(`L`, t), e.arm(`R`, t));
};
function tR(e, t, n = 0) {
  e.prop(`leaf`, {
    dx: -0.2 * t,
    dy: -0.05 * t * t - 0.02 * t,
    rot: -0.42 * t + n,
  });
}
function nR(e, t, n) {
  e.idle.cfg = Cy({
    blink: { gap: 3, jitter: 0.2, double: 0.06, step: 0.085 },
    breath: { amp: 0.014, period: 4.4 },
    look: {
      maxX: 1,
      maxY: 0.85,
      maxLen: 1.15,
      smooth: 0.16,
      reach: 3.2,
      wanderGap: [1.8, 4.6],
      wander: 0.5,
    },
  });
}
function rR(e, t) {
  let n = ML(t.reduced),
    r = Math.max(0, Number.isFinite(e) ? e : 0),
    i = kL(t.seed, 3),
    a = 0.5,
    o = 0.36;
  return PL(
    r + a + o,
    (e) => {
      let t = new NL(n, 14),
        s = e - r;
      if ((t.put(`draw`, s <= 0 ? 0 : s >= a ? 1 : yL(s / a)), s <= 0))
        return t.d;
      let c = s - a;
      if (
        (t.leanRaw(0.012 * i * Math.sin(Q * s * 1.1) * (1 - yL(c / 0.1))),
        c > -0.02)
      ) {
        let e = AL(c, [
          [0, 1],
          [0.09, 0.86, `outQuad`],
          [0.14, 1.14, `outCubic`],
          [0.26, 1.06, `inOutSine`],
          [0.31, 0.88, `inQuad`],
          [0.4, 1.04, `outQuad`],
          [o, 1, `inOutSine`],
        ]);
        (t.squash(e),
          t.lift(TL(c, 0.09, 0.21, 0.12)),
          eR(t, 14 + 64 * $(c, 0.09, 0.36)),
          t.mood(c > 0.08 && c < 0.3 ? `surprised` : void 0),
          t.prop(`crown`, {
            dy: 0.03 * $(c, 0.1, 0.24),
            rot: EL(c, 0.3, 0.09 * i, 3.2, 5) * (1 - yL(SL(c, 0.3, o))),
          }));
      }
      return t.d;
    },
    {
      events: [
        LL(r + a + 0.1, `flap`),
        U.impact(r + a + 0.3, `land`, { strength: 0.3 }),
        RL(r + a + 0.3, `dust`, { scale: 1.6 }),
      ],
      label: `owl:entrance`,
      idle: !1,
    },
  );
}
function iR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 5),
    { intro: r, period: i } = KL.hover;
  return IL(
    i,
    r,
    (e) => {
      let r = new NL(t, 14);
      return (
        r.squash(1.035 + 0.008 * Math.sin(((Q * e) / i) * 2)),
        r.lift(0.012 + 0.028 * $(e, 0.9, 1.08)),
        r.lean(0.02 * n + 0.016 * Math.sin((Q * e) / i)),
        r.arm(`L`, 30 + 12 * $(DL(e), 1.6, 1.9)),
        r.arm(`R`, 30),
        r.eye(`open`),
        r.prop(`crown`, {
          rot: 0.03 * Math.sin((Q * e) / i + 1) - 0.05 * n * $(e, 0.9, 1.08),
        }),
        r.d
      );
    },
    {
      extras: (e) => {
        let i = new NL(t, 14),
          a = 1 - yL(SL(e, 0.2, r));
        return (
          i.squash(1 - 0.05 * $(e, 0, 0.12) + 0.02 * $(e, 0.12, r)),
          i.prop(`crown`, {
            dy: 0.014 * $(e, 0.12, 0.3),
            rot: 0.06 * n * EL(e, 0.14, 1, 4, 5) * a,
          }),
          i.d
        );
      },
      label: `owl:hover`,
    },
  );
}
function aR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 7),
    { intro: r, period: i } = KL.select;
  return IL(
    i,
    r,
    (e) => {
      let r = new NL(t, 14),
        a = $(e, 0, 0.2) * 0.9 + $(e, 0.54, 0.78) * 0.9;
      return (
        r.squash(1 - 0.06 * a + 0.045 * $(e, 0.2, 0.36)),
        r.lift(TL(e, 0.2, 0.32, 0.07) + 0.03),
        eR(r, 52 + 46 * (e > 0.2 && e < 0.52 ? $L(e, 0.2, 0.32, 0, 1) : 0)),
        r.eye(`open`),
        r.mouth(`smile`),
        r.lean(0.03 * n * Math.sin((Q * e) / i)),
        r.prop(`crown`, {
          dy: 0.02 * $(e, 0.2, 0.5) - 0.01 * $(e, 0.5, 0.7),
          rot: -0.07 * n * Math.sin((Q * (e - 0.05)) / i),
        }),
        r.d
      );
    },
    {
      extras: (e) => {
        let i = new NL(t, 14);
        return (
          e < 0.3 && i.mood(`surprised`),
          i.squash(1 - 0.08 * $(e, 0, 0.12) + 0.08 * $(e, 0.1, r)),
          i.lift(0.05 * $(e, 0.1, r)),
          i.prop(`crown`, {
            dy: 0.04 * $(e, 0.14, 0.34),
            rot: 0.1 * n * EL(e, 0.16, 1, 3.5, 5) * (1 - yL(SL(e, 0.2, r))),
          }),
          i.d
        );
      },
      label: `owl:select`,
    },
  );
}
function oR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 9),
    { intro: r, period: i } = KL.nervous;
  return IL(
    i,
    r,
    (e) => {
      let r = new NL(t, 14),
        a = DL(e);
      r.mood(`worried`);
      let o = 0.5 * Math.sin(Q * a * 4.5) + 0.5 * Math.sin(Q * a * 7.5 + 1);
      (r.sway(0.005 * o),
        r.lean(
          0.014 * Math.sin(Q * a * 3 + 0.5) +
            0.02 * n * Math.sin(((Q * e) / i) * 2),
        ),
        r.squash(0.976 - 0.012 * Math.sin(((Q * e) / i) * 2)));
      let s = 12 + 8 * Math.sin(Q * a * 5 + 2);
      return (
        r.arm(`L`, 14 + s),
        r.arm(`R`, 14 + s + 4 * Math.sin(Q * a * 5)),
        r.look(0.8 * Math.sin((Q * e) / (i * 2))),
        r.prop(`crown`, {
          rot: 0.07 * Math.sin(Q * a * 6),
          dy: 0.004 * Math.sin(Q * a * 6),
        }),
        r.prop(`leaf`, { rot: 0.1 * Math.sin(Q * a * 5 + 1) }),
        r.d
      );
    },
    {
      extras: (e) => new NL(t, 14).prop(`crown`, { dy: 0.02 * $(e, 0, r) }).d,
      events: [RL(0.12, `sweat`, { scale: 2.4, u: 0.3 * n, v: 0.98 })],
      label: `owl:nervous`,
    },
  );
}
function sR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 11),
    { intro: r, period: i } = KL.sleepy;
  return IL(
    i,
    r,
    (e) => {
      let r = new NL(t, 14),
        i = e;
      r.mood(`sleepy`);
      let a = CL(i, 0.2, 1.5, xL) * (1 - CL(i, 2.6, 2.72, bL)),
        o = wL(i, 1.2, 1.6, 2.5, 2.62),
        s = $(i, 2.6, 3.1),
        c = wL(i, 3.05, 3.55, 4, 4.6);
      return (
        r.lean(0.02 + 0.1 * n * a - 0.05 * n * s - 0.02 * c),
        r.squash(
          0.975 -
            0.024 * a +
            0.055 * s +
            0.06 * c +
            0.012 * o * Math.sin((Q * i) / 2.3),
        ),
        r.prop(`crown`, {
          rot:
            0.1 * n * a +
            0.05 * EL(i, 2.62, 1, 3, 4) -
            0.04 * EL(i, 3.9, 1, 3, 5),
          dy: -0.012 * a + 0.03 * $(i, 2.6, 2.86),
        }),
        tR(r, 0.35 * a * t, 0.06 * EL(i, 2.62, 1, 3, 3)),
        r.eye(
          o > 0.5
            ? `closed`
            : s > 0.3 && i < 2.9
              ? `wide`
              : c > 0.5
                ? `squeezed`
                : void 0,
        ),
        c > 0.15 && (r.mouth(`o`), r.put(`mouthScale`, 0.6 + 1 * c)),
        eR(r, 14 + 80 * c - 4 * s),
        r.d
      );
    },
    {
      events: [
        RL(1.5, `zzz`, { scale: 2.2, u: 0.34 * n, v: 1.05 }),
        LL(2.62, `startle`),
        LL(3.45, `yawn`),
      ],
      label: `owl:sleepy`,
    },
  );
}
function cR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 13);
  return OL(e.seed, 14) < 0.5
    ? PL(
        2.5,
        (e) => {
          let r = new NL(t, 14),
            i = CL(e, 0.05, 0.55, xL) * (1 - CL(e, 0.62, 0.9, bL)),
            a = $(e, 0.55, 0.98),
            o = $(e, 1.3, 1.9),
            s = Math.max(a, o);
          return (
            r.squash(1 + 0.06 * i - 0.045 * a - 0.05 * o),
            r.lean(0.05 * n * a - 0.045 * n * o + 0.01 * Math.sin(Q * e * 0.5)),
            eR(r, 14 + 26 * i + 12 * a + 14 * o),
            (i > 0.4 || s > 0.05) && r.eye(`open`),
            s > 0.05 && (r.mouth(`o`), r.put(`mouthScale`, 1 + 0.5 * s)),
            r.prop(`crown`, {
              dy: 0.022 * a + 0.025 * o,
              rot:
                0.06 * n * EL(e, 0.62, 1, 3.2, 4) -
                0.06 * n * EL(e, 1.42, 1, 3.2, 4),
            }),
            r.prop(`leaf`, { rot: 0.16 * EL(e, 0.62, 1, 4.2, 3.5) }),
            r.blink(0.9 * $(e, 2, 2.34)),
            r.d
          );
        },
        {
          events: [
            LL(0.62, `hoot`),
            LL(1.42, `hoot`, { low: !0 }),
            RL(0.62, `note`, { scale: 2.2, u: 0.36 * n, v: 1 }),
            RL(1.42, `note`, { scale: 2.2, u: -0.36 * n, v: 1.05 }),
          ],
          label: `owl:gag-hoot`,
        },
      )
    : PL(
        3,
        (e) => {
          let r = new NL(t, 14),
            i = yL(SL(e, 0.2, 1.55)) * (1 - yL(SL(e, 2.05, 2.5))),
            a = wL(e, 1.4, 1.5, 1.9, 2.1);
          return (
            r.lean(
              0.03 * n * Math.sin((Q * e) / 3) + 0.05 * n * $(e, 1.9, 2.6),
            ),
            r.squash(1 - 0.012 * Math.sin((Q * e) / 3)),
            tR(
              r,
              i,
              0.16 *
                a *
                Math.sin(Q * 4.2 * (e - 1.4)) *
                Math.exp(-2 * Math.max(0, e - 1.5)),
            ),
            r.prop(`crown`, { rot: -0.05 * n * $(e, 1.9, 2.6) }),
            r.blink(0.55 * $(e, 0.6, 1.4)),
            r.d
          );
        },
        { events: [LL(1.5, `rustle`)], label: `owl:gag-leaf` },
      );
}
function lR(e) {
  let t = ML(e.reduced);
  return PL(
    0.62,
    (e) => {
      let n = new NL(t, 14),
        r = $(e, 0.05, 0.4);
      return (
        n.squash(1 + 0.03 * $(e, 0, 0.14) - 0.06 * r),
        e < 0.3 && eR(n, 14 + 40 * (1 - bL(e / 0.3))),
        e < 0.4 && n.mood(`shy`),
        e > 0.05 && e < 0.35 && (n.mouth(`o`), n.put(`mouthScale`, 0.7)),
        n.blink(0.9 * $(e, 0.22, 0.52)),
        n.prop(`crown`, { dy: -0.016 * r, rot: -0.05 * EL(e, 0.2, 1, 3, 5) }),
        n.d
      );
    },
    { events: [LL(0.1, `sigh`)], label: `owl:deselect` },
  );
}
function uR(e) {
  let t = ML(e.reduced),
    n = e.castle === `king`,
    [r, i] = e.off,
    a = Math.max(0.01, Number.isFinite(e.dist) ? e.dist : Math.hypot(r, i)),
    o = e.facing || 0,
    s = e.facing || kL(e.seed, 21),
    c = _L(Math.round(a * 2), 2, 6),
    l = _L(n ? 0.66 + 0.1 * a : 0.74 + 0.24 * (a - 1), 0.6, 1.1),
    u = n ? 0.09 : 0.12 + 0.02 * OL(e.seed, 22),
    d = n ? 0.18 : 0.22,
    f = (l - u - d) / c,
    p = u + c * f,
    m = n ? 0.16 : 0.135,
    [h, g] = QL(r, i),
    _ = [];
  for (let e = 1; e < c; e++)
    _.push(
      LL(u + e * f, `pat`),
      U.impact(u + e * f, `step`, { strength: 0.2 }),
    );
  _.push(
    LL(p, `pat`),
    U.impact(p, `land`, { strength: 0.42 }),
    RL(p, `dust`, { scale: 1.6 }),
    LL(p + 0.1, `sigh`),
  );
  let v = (e) => {
    let t = e - u,
      n = c * f;
    if (t <= 0 || t >= n)
      return { on: !1, env: 0, roll: 0, speed: 0, foot: 0, i: 0 };
    let r = Math.min(c - 1, Math.floor(t / f)),
      i = (t - r * f) / f,
      a = yL(Math.min(1, t / (0.6 * f), (n - t) / (0.6 * f)));
    return {
      on: !0,
      env: a,
      roll: s * (r % 2 == 0 ? 1 : -1) * Math.sin(Math.PI * i) * a,
      speed: Math.sin(Math.PI * i),
      foot: Math.cos(Math.PI * i) ** 2,
      i: r,
    };
  };
  return PL(
    l,
    (e) => {
      let n = new NL(t, 14),
        a = v(e),
        s = e - u,
        l = 0;
      if (s > 0) {
        let e = c * f,
          t = Math.min(c - 1, Math.floor(s / f)),
          n = (s - t * f) / f;
        l = s >= e ? 1 : 0.55 * ((t + yL(n)) / c) + 0.45 * xL(s / e);
      }
      let d = 0.03 * $(e, 0, u * 1.8);
      n.travel(r * (1 - l) + h * d, i * (1 - l) + g * d);
      let _ = $(e, 0, u * 1.7),
        y = yL(SL(e, p - 0.04, p + 0.005)),
        b = e < p + 0.005 ? y : Math.exp(-(e - p - 0.005) * 15);
      if (
        (n.lean(
          m * a.roll +
            o * (0.055 * a.env - 0.07 * _) +
            o * 0.08 * EL(e, p, 1, 2.6, 7),
        ),
        n.lift(0.038 * a.env * a.speed),
        n.squash(
          1 -
            0.09 * _ +
            a.env * (0.03 * a.speed - 0.05 * a.foot) -
            0.13 * b +
            0.06 * $(e, p + 0.06, p + 0.2),
        ),
        a.on)
      ) {
        let e = a.i % 2 == 0;
        n.foot(e ? `L` : `R`, {
          dy: 0.055 * Math.sin(Math.PI * ((s / f) % 1)),
          rot: (e ? 1 : -1) * 0.25 * Math.sin(Math.PI * ((s / f) % 1)),
        });
      }
      let x = v(e - 0.04).roll * 1,
        S = 30 * Math.max(0, EL(e, p, 1, 3.2, 8)) * 1.4 + 24 * _ + 20 * a.env;
      return (
        n.arm(`L`, 14 + S + 14 * Math.max(0, x / 1)),
        n.arm(`R`, 14 + S + 14 * Math.max(0, -x)),
        n.look(0.6 * o * yL(e / 0.1) * (e < p ? 1 : 1 - yL((e - p) / 0.2))),
        n.blink(0.95 * $(e, p + 0.04, p + 0.3)),
        e > p + 0.03 &&
          e < p + 0.22 &&
          (n.mouth(`o`), n.put(`mouthScale`, 0.75)),
        n.prop(`crown`, {
          dy:
            -0.02 * a.foot * a.env + 0.03 * $(e, p + 0.04, p + 0.16) - 0.02 * b,
        }),
        n.d
      );
    },
    { events: _, label: `owl:move${n ? `-castle` : ``}` },
  );
}
function dR(e) {
  let t = ML(e.reduced),
    [n, r] = e.off,
    i = Math.max(1, Number.isFinite(e.dist) ? e.dist : Math.hypot(n, r)),
    a = e.facing || 0,
    o = e.facing || 0.35 * kL(e.seed, 31),
    [s, c] = QL(n, r),
    l = 0.24 + 0.15 * Math.min(i, 2),
    u = 0.6,
    d = 1.04,
    f = 1.86,
    p = 0.11,
    m = [
      LL(0.28, `sigh`),
      LL(u, `flap`),
      LL(0.73, `flap`),
      RL(0.65, `speed`, { scale: 2, dirx: a }),
      U.impact(d, `dink`, { strength: 0.62 }),
      RL(d, `burst`, { scale: 1.7 }),
      RL(1.06, `dust`, { scale: 2 }),
      LL(1.45, `yawn`),
    ];
  e.reduced || m.push(U.shake(d, 0.5, 0.2));
  let h = [
    [0, `worried`],
    [0.34, `angry`],
    [d, `surprised`],
    [1.1600000000000001, `shy`],
    [1.36, `sleepy`],
    [1.78, null],
  ];
  return {
    impactAt: d,
    action: PL(
      f,
      (e) => {
        let i = new NL(t, 14),
          m = n + s * p * yL(SL(e, 0.14, 0.56)),
          g = r + c * p * yL(SL(e, 0.14, 0.56)),
          _ = 0;
        if (e >= u) {
          let t = SL(e, u, d),
            i = 0.3 * t + 0.7 * t * t;
          ((m = (n + s * p) * (1 - i)),
            (g = (r + c * p) * (1 - i)),
            (_ = l * Math.sin(Math.PI * t ** 0.75)));
        }
        return (
          i.travel(m, g),
          i.lift(_),
          i.squash(
            AL(e, [
              [0, 1],
              [0.3, 0.95, `smooth`],
              [0.54, 0.83, `smooth`],
              [u, 0.83],
              [0.7, 1.17, `outQuad`],
              [1, 1.09, `smooth`],
              [1.09, 0.76, `outQuad`],
              [1.24, 1.05, `outQuad`],
              [1.34, 0.985, `smooth`],
              [1.62, 1.075, `inOutSine`],
              [f, 1, `inOutSine`],
            ]),
          ),
          i.lean(
            o *
              AL(e, [
                [0, 0],
                [0.3, -0.05, `smooth`],
                [0.54, -0.18, `smooth`],
                [u, -0.18],
                [0.76, 0.28, `outQuad`],
                [d, 0.46, `inQuad`],
                [1.1800000000000002, -0.13, `outQuad`],
                [1.32, 0.04, `smooth`],
                [1.62, -0.06, `inOutSine`],
                [f, 0, `smooth`],
              ]),
          ),
          eR(
            i,
            AL(e, [
              [0, 14],
              [0.3, 50, `smooth`],
              [0.54, qL, `outQuad`],
              [u, qL],
              [0.7, 48, `inOutSine`],
              [0.82, 132, `outQuad`],
              [1.02, 42, `inQuad`],
              [1.1300000000000001, JL, `outQuad`],
              [1.22, JL],
              [1.4, 14, `smooth`],
              [1.62, 104, `inOutSine`],
              [1.84, 14, `inOutSine`],
            ]),
          ),
          e > 1.02 && e < 1.34 && (i.armFront(`L`), i.armFront(`R`)),
          i.mood(jL(h, e)),
          i.look(
            _L(0.9 * (a || o), -1, 1) *
              yL(e / 0.15) *
              (e < 1.1400000000000001
                ? 1
                : 1 - CL(e, 1.1400000000000001, 1.44)),
            e > 1.35 && e < 1.7 ? 0.3 : 0,
          ),
          e > 1.4 &&
            e < 1.7 &&
            (i.mouth(`o`),
            i.put(`mouthScale`, 0.5 + 1.1 * $(e, 1.4, 1.7)),
            i.eye(`squeezed`)),
          i.prop(`crown`, {
            dy: 0.055 * $(e, 1.06, 1.26) - 0.02 * $(e, 0.3, 0.54),
            rot: 0.16 * o * EL(e, 1.06, 1, 3.2, 4.2),
          }),
          i.prop(`leaf`, {
            rot: -0.3 * o * EL(e, 1.06, 1, 3.6, 3.5),
            dy: 0.03 * $(e, d, 1.24),
          }),
          i.foot(`L`, { dy: 0.05 * $(e, 0.58, 0.84) }),
          i.foot(`R`, { dy: 0.05 * $(e, 0.58, 0.84) }),
          i.d
        );
      },
      { events: m, label: `owl:attack` },
    ),
  };
}
function fR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 51),
    r = e.reduced,
    i = 1.5,
    a = {
      t0: 0.06,
      vx: -n * 0.7,
      vy: 2.8,
      floor: YL,
      spin: 3,
      end: 2.3,
      calm: r,
    },
    o = VL(a.t0, a.vy, 9, r ? 0.3 : 0.42, a.floor).filter((e) => e < a.end),
    s = [
      RL(0.03, `exclaim`, { scale: 2.6, u: 0.05, v: 1.5 }),
      LL(0.05, `hoot`, { yelp: !0 }),
      ...o.map((e, t) => LL(e, `clink`, { soft: t })),
      U.impact(i, `faint-land`, { strength: 1 }),
      LL(i, `thud`),
      RL(i, `dust`, { scale: 2.4 }),
      RL(1.62, `orbit`, { scale: 2.2, u: 0, v: 0.5, hold: !0 }),
      LL(2.25, `sigh`),
    ];
  r || s.push(U.shake(i, 0.9, 0.3));
  let c = (e) => (e > i ? BL(e - i, 1.5, 12, 0.35, 0)[0] : 0);
  return PL(
    2.7,
    (e) => {
      let o = new NL(t, 14);
      (UL(o, HL(e, a)),
        WL(o, e, { t0: 0.1, fall: 1.4, drift: n * 0.2, floor: XL, calm: r }));
      let s =
        e < 0.34
          ? 0
          : AL(e, [
              [0.34, 0],
              [0.54, -0.17, `inOutSine`],
              [0.76, 0.24, `inOutSine`],
              [0.92, -0.12, `inOutSine`],
              [i, 1.4, `inCubic`],
            ]);
      if (
        (o.leanRaw(n * (s - 0.12 * c(e) * 6)),
        o.liftRaw(TL(e, 0.02, 0.28, 0.16 * (r ? 0.5 : 1)) + c(e)),
        o.squash(
          AL(e, [
            [0, 1],
            [0.05, 0.9, `outQuad`],
            [0.12, 1.15, `outCubic`],
            [0.28, 1.08, `inOutSine`],
            [0.34, 0.88, `inQuad`],
            [0.46, 1.03, `outQuad`],
            [0.7, 1, `smooth`],
            [1.45, 1],
            [1.55, 0.82, `outQuad`],
            [1.8, 1.02, `outQuad`],
            [2.1, 1, `smooth`],
          ]),
        ),
        s > ZL && o.put(`contact`, `ground`),
        e > 0.92 && o.put(`footFollow`, yL(SL(e, 0.92, i))),
        e > 0.98 && o.bodyPose(`hurt`),
        eR(
          o,
          AL(e, [
            [0, 14],
            [0.12, qL, `outBack`],
            [0.3, qL],
            [0.5, 96, `smooth`],
            [0.7, 60, `smooth`],
            [0.85, 110, `smooth`],
            [i, 40, `inCubic`],
            [1.7, 88, `outQuad`],
            [2.1, 78, `smooth`],
          ]) + (e > 0.4 && e < i ? 14 * Math.sin(Q * DL(e) * 2.6) : 0),
        ),
        o.mood(e < 0.34 ? `surprised` : `dizzy`),
        e > 1.75 && e < 2.4)
      ) {
        let t = $(e, 1.75, 2.4) * Math.sin(Q * DL(e) * 3.4);
        (o.foot(`L`, { rot: 0.5 * t }), o.foot(`R`, { rot: -0.4 * t }));
      }
      return o.d;
    },
    { events: s, label: `owl:defeat`, idle: !1, taper: 0 },
  );
}
function pR(e) {
  let t = ML(e.reduced),
    n = e.reduced,
    r = 1.5,
    i = 0.62,
    a =
      _L(0.5 + 0.6 * e.strength, 0.4, 1.3) *
      ({ p: 0.7, n: 0.95, b: 0.95, r: 1.2, q: 1.15, k: 1 }[e.by] ?? 1),
    [o, s] = e.from,
    c = Math.abs(o) > 0.2 ? Math.sign(o) : kL(e.seed, 41),
    l = {
      t0: 0.02,
      vx: c * 0.7,
      vy: 1.7,
      floor: YL,
      spin: 3,
      end: 1.45,
      calm: n,
    },
    u = VL(l.t0, l.vy, 9, n ? 0.3 : 0.42, l.floor).filter((e) => e < l.end),
    d = [
      RL(0.02, `burst`, { scale: 1.6, u: -0.2 * c, v: 0.6 }),
      LL(0.04, `hoot`, { yelp: !0 }),
      ...u.map((e, t) => LL(e, `clink`, { soft: t })),
      U.impact(i, `faint-land`, { strength: 0.8 * Math.min(1, a) }),
      LL(i, `thud`),
      RL(i, `dust`, { scale: 2.2 }),
      RL(0.77, `orbit`, { scale: 2.2, u: 0, v: 0.5, hold: !0 }),
      U.world(r, `removed`),
    ],
    f = (e) => (e > i ? BL(e - i, 1.2, 12, 0.35, 0)[0] : 0);
  return PL(
    r,
    (e) => {
      let u = new NL(t, 14);
      (UL(u, HL(e, l)),
        WL(u, e, { t0: 0.04, fall: 1, drift: c * 0.25, floor: XL, calm: n }));
      let d = CL(e, 0, i, (e) => 1 - (1 - e) ** 2);
      (u.travel(o * 0.55 * a * d, s * 0.55 * a * d),
        u.liftRaw(TL(e, 0.02, 0.6, 0.2 * a * (n ? 0.5 : 1)) + f(e)));
      let p = AL(e, [
        [0, 0],
        [0.1, -0.1, `outQuad`],
        [i, 1.4, `inQuad`],
      ]);
      if (
        (u.leanRaw(c * (p - 0.1 * f(e) * 6)),
        p > ZL && u.put(`contact`, `ground`),
        e > 0.25 && u.put(`footFollow`, yL(SL(e, 0.25, i))),
        u.bodyPose(`hurt`),
        u.mood(e < i ? `hurt` : `dizzy`),
        u.squash(
          AL(e, [
            [0, 1],
            [0.05, 0.84, `outQuad`],
            [0.2, 1.08, `outCubic`],
            [0.58, 1],
            [0.67, 0.84, `outQuad`],
            [0.9199999999999999, 1, `outQuad`],
          ]),
        ),
        eR(
          u,
          AL(e, [
            [0, 14],
            [0.1, qL, `outBack`],
            [i, 50, `inOutSine`],
            [0.87, 84, `outQuad`],
            [r, 78, `smooth`],
          ]),
        ),
        e > 0.87 && e < 1.42)
      ) {
        let t = $(e, 0.87, 1.42) * Math.sin(Q * DL(e) * 3.4);
        (u.foot(`L`, { rot: 0.5 * t }), u.foot(`R`, { rot: -0.4 * t }));
      }
      return u.d;
    },
    { events: d, label: `owl:removed`, idle: !1, taper: 0 },
  );
}
function mR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 61),
    r = KL.napping.period;
  return FL(
    r,
    (e) => {
      let i = new NL(1, 14);
      return (
        i.mood(`sleepy`),
        i.eye(`closed`),
        i.lean(0.17 * n + 0.01 * t * Math.sin((Q * e) / r)),
        i.squash(0.86 + 0.02 * t * Math.sin((Q * e) / r)),
        i.mouth(`o`),
        i.put(`mouthScale`, 0.55 + 0.15 * t * Math.sin((Q * e) / r)),
        eR(i, 14),
        i.prop(`crown`, { rot: 0.12 * n, dy: -0.01 }),
        tR(i, 0.5),
        i.d
      );
    },
    {
      events: [RL(0.6, `zzz`, { scale: 2.2, u: 0.3 * n, v: 1 })],
      label: `owl:napping`,
    },
  );
}
function hR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 71),
    r = 1.75;
  return PL(
    r,
    (e) => {
      let i = new NL(t, 14),
        a = DL(e);
      (i.lift(TL(e, 0.02, 0.28, 0.15)),
        i.squash(
          AL(e, [
            [0, 1],
            [0.05, 0.9, `outQuad`],
            [0.12, 1.15, `outCubic`],
            [0.28, 1.08, `inOutSine`],
            [0.34, 0.86, `inQuad`],
            [0.44, 1.03, `outQuad`],
            [0.6, 1, `smooth`],
            [1.5, 0.98, `smooth`],
            [1.62, 1.03, `outQuad`],
            [r, 1, `inOutSine`],
          ]),
        ));
      let o = AL(e, [
          [0, 14],
          [0.12, qL, `outBack`],
          [0.3, qL],
          [0.4, 120, `smooth`],
          [0.62, JL, `inOutCubic`],
          [1.4, JL],
          [1.62, 14, `inOutSine`],
        ]),
        s = wL(e, 0.6, 0.72, 1.35, 1.5);
      return (
        eR(
          i,
          o +
            (e < 0.4 && e > 0.2 ? 12 * Math.sin(Q * a * 5) : 0) +
            4 * s * Math.sin(Q * a * 6),
        ),
        e > 0.42 && e < 1.55 && (i.armFront(`L`), i.armFront(`R`)),
        i.mood(e < 0.4 ? `surprised` : e < 1.5 ? `worried` : void 0),
        i.look(
          0.8 * Math.sin((Q * (e - 0.5)) / 0.6) * wL(e, 0.5, 0.65, 1.2, 1.4),
        ),
        i.sway(0.007 * Math.sin(Q * a * 5) * s),
        i.lean(0.02 * Math.sin(Q * a * 3.5) * s),
        i.prop(`crown`, {
          rot:
            0.09 * Math.sin(Q * a * 5.5) * s + 0.1 * n * EL(e, 0.34, 1, 3.5, 5),
          dy: 0.03 * $(e, 0.05, 0.3),
        }),
        i.prop(`leaf`, { rot: 0.12 * Math.sin(Q * a * 5 + 1) * s }),
        i.blink(0.9 * $(e, 1.55, 1.75)),
        i.d
      );
    },
    {
      events: [
        RL(0.03, `exclaim`, { scale: 2.6, u: 0.02, v: 1.5 }),
        LL(0.04, `hoot`, { yelp: !0 }),
        RL(0.38, `sweat`, { scale: 2.4, u: 0.3 * n, v: 0.98 }),
        U.impact(0.32, `land`, { strength: 0.3 }),
        RL(0.95, `sweat`, { scale: 2.4, u: -0.3 * n, v: 0.92 }),
        LL(1.55, `sigh`),
      ],
      label: `owl:checked`,
    },
  );
}
function gR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 81),
    r = 3.7,
    i = e.reduced,
    a = [
      [0.22, 0.3, 0.26],
      [0.66, 0.32, 0.3],
      [1.1, 0.4, 0.42],
    ],
    o = [];
  (a.forEach(([e, t], r) =>
    o.push(
      LL(e, `flap`),
      U.impact(e + t, `land`, { strength: 0.32 + 0.06 * r }),
      RL(e + t * 0.5, `sparkle`, { scale: 2.2, u: 0.34 * n, v: 1 + 0.1 * r }),
    ),
  ),
    o.push(
      LL(1.3, `hoot`),
      RL(1.3, `note`, { scale: 2.2, u: -0.4 * n, v: 1.1 }),
      RL(1.8, `heart`, { scale: 2.2, u: 0.34, v: 1 }),
      RL(2.1, `sparkle`, { scale: 2.2, u: -0.34, v: 0.9 }),
      U.impact(2.66, `plop`, { strength: 0.4 }),
      LL(2.9, `sigh`),
    ));
  for (let e = 0; e < 3; e++) o.push(LL(1.5 + e * 0.3 + 0.15, `pat`));
  return PL(
    r,
    (e) => {
      let o = new NL(t, 14),
        s = 0;
      for (let [t, n, r] of a) s += TL(e, t, n, r);
      ((s += TL(e, 2.4, 0.24, 0.12)), o.lift(s));
      let c = AL(e, [
        [0, 1],
        [0.2, 0.86, `outQuad`],
        [0.26, 1.16, `outCubic`],
        [0.5, 1.06, `inOutSine`],
        [0.55, 0.86, `inQuad`],
        [0.66, 1.1, `outQuad`],
        [0.7, 1.12],
        [0.95, 1.05, `smooth`],
        [1, 0.86, `inQuad`],
        [1.1, 1.14, `outCubic`],
        [1.4, 1.1, `smooth`],
        [1.5, 0.84, `inQuad`],
        [1.62, 1.03, `outQuad`],
        [2.4, 1, `smooth`],
        [2.5, 1.1, `outQuad`],
        [2.64, 1.02, `smooth`],
        [2.7, 0.8, `inQuad`],
        [3.3, 0.82, `smooth`],
        [3.5, 1.07, `outBack`],
        [r, 1, `inOutSine`],
      ]);
      o.squash(c);
      let l = a.some(([t, n]) => e > t && e < t + n),
        u = 14,
        d = 14;
      if (l) u = d = $L(e, 0, 0.25, 50, qL);
      else if (e >= 1.5 && e < 2.4) {
        let t = Math.sin((Q * (DL(e) - 1.5)) / 0.6);
        ((u = 14 + 110 * Math.max(0, t)), (d = 14 + 110 * Math.max(0, -t)));
      } else
        e >= 2.4 && e < 2.66
          ? (u = d = $L(e, 0, 0.25, 60, 140))
          : e >= 2.66 && e < 3.4
            ? (u = d = 64 + 8 * Math.sin(Q * e * 0.7))
            : e >= 3.4 &&
              (u = d =
                AL(e, [
                  [3.4, 64],
                  [3.7, 14, `smooth`],
                ]));
      (o.arm(`L`, u),
        o.arm(`R`, d),
        !i &&
          e > 0.66 &&
          e < 0.98 &&
          o.put(
            `turn`,
            Math.max(0.28, Math.abs(Math.cos((Math.PI * (e - 0.66)) / 0.32))),
          ));
      let f = wL(e, 1.5, 1.55, 2.3, 2.42);
      return (
        o.lean(
          0.13 * n * Math.sin((Q * (e - 1.5)) / 0.6) * f +
            0.06 * n * $(e, 0.2, 0.5) +
            0.05 * n * $(e, 2.66, 3.2),
        ),
        o.lift(0.05 * f * Math.abs(Math.sin((Q * (e - 1.5)) / 0.6))),
        o.prop(`crown`, {
          dy: 0.12 * $(e, 1.2, 1.55) + 0.02 * $(e, 0.3, 0.5),
          rot: 0.14 * n * EL(e, 1.5, 1, 3.2, 4),
        }),
        o.prop(`leaf`, {
          dy: 0.16 * $(e, 1.2, 1.5),
          rot: -0.3 * n * EL(e, 1.5, 1, 3.6, 3.5),
        }),
        o.mood(
          e < 0.2
            ? void 0
            : e < 2.66
              ? `victorious`
              : e < 3.3
                ? `happy`
                : void 0,
        ),
        e > 3.3 && e < 3.6 && o.blink(0.9 * $(e, 3.3, 3.6)),
        o.d
      );
    },
    { events: o, label: `owl:victory`, idle: { look: !1 } },
  );
}
function _R(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 91);
  return PL(
    1.4,
    (e) => {
      let r = new NL(t, 14),
        i = wL(e, 0.1, 0.4, 0.95, 1.25);
      return (
        r.squash(
          AL(e, [
            [0, 1],
            [0.1, 0.97, `smooth`],
            [0.4, 1.035, `outBack`],
            [0.95, 1.03],
            [1.25, 1, `inOutSine`],
          ]),
        ),
        r.lift(0.025 * i),
        eR(r, 14 + 80 * i),
        r.lean(
          0.07 * n * wL(e, 0.2, 0.5, 0.7, 0.9) -
            0.05 * n * wL(e, 0.8, 1, 1.1, 1.3),
        ),
        r.brow(i > 0.3 ? `worried` : void 0),
        r.mouth(i > 0.3 ? `wavy` : void 0),
        r.eye(i > 0.3 ? `half` : void 0),
        r.prop(`crown`, { rot: -0.08 * n * EL(e, 0.5, 1, 3, 4) }),
        r.blink(0.9 * $(e, 1.05, 1.32)),
        r.d
      );
    },
    { events: [LL(0.42, `hm`)], label: `owl:shrug` },
  );
}
function vR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 95);
  return PL(
    0.62,
    (e) => {
      let r = new NL(t, 14),
        i = wL(e, 0, 0.06, 0.4, 0.6),
        a = Math.sin((Q * DL(e)) / 0.24);
      return (
        r.look(0.95 * a * i),
        r.lean(0.06 * n * a * i * -1),
        r.squash(1 - 0.03 * $(e, 0, 0.16)),
        r.mood(`worried`),
        eR(r, 14 + 34 * $(e, 0.04, 0.5)),
        r.prop(`crown`, { rot: 0.06 * n * a * i }),
        r.d
      );
    },
    { events: [LL(0.04, `hm`)], label: `owl:refuse` },
  );
}
var yR = {
  kind: `k`,
  rest: nR,
  entrance: rR,
  hover: iR,
  select: aR,
  nervous: oR,
  sleepy: sR,
  gag: cR,
  deselect: lR,
  move: uR,
  attack: dR,
  removed: pR,
  napping: mR,
  checked: hR,
  victory: gR,
  defeat: fR,
  shrug: _R,
  promoteOut: () => zL(`owl:promoteOut`),
  promoteIn: () => zL(`owl:promoteIn`),
  refuse: vR,
};
var bR = GL.b;
var xR = 80;
var SR = 150;
var CR = 22;
var wR = -0.87;
var TR = 0.5;
var ER = 0.08;
var DR = (e, t) => {
  let n = Math.hypot(e, t);
  return n > 1e-6 ? [e / n, t / n] : [0, -1];
};
function OR(e) {
  let t = e.lift;
  return (t && wv(e, `props.wave.dy`, (e.props?.wave?.dy ?? 0) - t), e);
}
var kR = (e, t, n = {}) => PL(e, (e) => OR(t(e)), n);
var AR = (e, t, n = {}) => FL(e, (e) => OR(t(e)), n);
var jR = (e, t) => {
  (e.mul(`sy`, 1 + 0.5 * t), e.mul(`sx`, 1 + 0.9 * t));
};
var MR = (e, t, n = t) => {
  (e.arm(`L`, t), e.arm(`R`, n));
};
var NR = (e, t, n) => {
  let r = jL(t, n);
  r && e.propState(`spout`, r);
};
var PR = (e, t = 1) => [
  [e, `pfft1`],
  [e + 0.06 * t, `pfft2`],
  [e + 0.13 * t, `pfft3`],
  [e + 0.3 * t, `pfft2`],
  [e + 0.38 * t, `pfft1`],
  [e + 0.44 * t, null],
];
var FR = (e) => [
  [e, `pfft1`],
  [e + 0.14, null],
];
function IR(e, t, n) {
  e.idle.cfg = Cy({
    blink: { gap: 3.6, jitter: 0.2, double: 0.05, step: 0.08 },
    breath: { amp: 0.022, period: 5.2 },
    look: {
      maxX: 1,
      maxY: 0.85,
      maxLen: 1.15,
      smooth: 0.2,
      reach: 3.2,
      wanderGap: [2.2, 5],
      wander: 0.4,
    },
  });
}
function LR(e, t) {
  let n = ML(t.reduced),
    r = Math.max(0, Number.isFinite(e) ? e : 0),
    i = kL(t.seed, 3),
    a = 0.6,
    o = 0.36;
  return kR(
    r + a + o,
    (e) => {
      let t = new NL(n, 54),
        s = e - r;
      if ((t.put(`draw`, s <= 0 ? 0 : s >= a ? 1 : yL(s / a)), s <= 0))
        return t.d;
      let c = s - a;
      return (
        t.mul(`props.wave.alpha`, s < 0.3 ? yL(s / 0.3) : 1, !0),
        t.leanRaw(0.01 * i * Math.sin(Q * s * 0.9) * (1 - yL(c / 0.1))),
        c > -0.05 &&
          (t.squash(
            AL(c, [
              [-0.05, 1],
              [0, 0.94, `smooth`],
              [0.12, 1.07, `outCubic`],
              [0.22, 0.95, `inOutSine`],
              [0.3, 1.02, `outQuad`],
              [o, 1, `inOutSine`],
            ]),
          ),
          t.lift(TL(c, 0.02, 0.22, 0.07)),
          MR(t, 54 + 40 * $(c, 0.04, 0.34)),
          t.prop(`crown`, {
            dy: 0.03 * $(c, 0.1, 0.26),
            rot: EL(c, 0.2, 0.08 * i, 2.8, 4.5) * (1 - yL(SL(c, 0.2, o))),
          })),
        NR(
          t,
          [
            [0.8, `pfft1`],
            [0.86, `pfft2`],
            [0.9299999999999999, `pfft1`],
            [0.98, null],
          ],
          s,
        ),
        t.d
      );
    },
    {
      events: [
        U.impact(r + a + 0.16, `land`, { strength: 0.3 }),
        RL(r + a + 0.16, `dust`, { scale: 1.8 }),
        LL(r + a + 0.18, `pfft`, { soft: !0 }),
      ],
      label: `whale:entrance`,
      idle: !1,
    },
  );
}
function RR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 5),
    { intro: r, period: i } = bR.hover;
  return IL(
    i,
    r,
    (e) => {
      let r = new NL(t, 54);
      (jR(r, 0.05 + 0.012 * Math.sin(((Q * e) / i) * 2)),
        r.lift(0.01),
        r.eye(`open`),
        r.lean(0.02 * n + 0.028 * Math.sin((Q * e) / i)));
      let a = Math.sin(((Q * (e - 0.4)) / i) * 2);
      return (
        MR(r, 80 + 20 * Math.max(0, a), 80 + 20 * Math.max(0, -a)),
        r.prop(`crown`, { rot: 0.03 * Math.sin((Q * e) / i + 1) }),
        r.prop(`wave`, { sx: 1 + 0.06 * Math.sin(((Q * e) / i) * 2) }, !0),
        OR(r.d)
      );
    },
    {
      extras: (e) => {
        let i = new NL(t, 54),
          a = 1 - yL(SL(e, 0.3, r));
        return (
          jR(i, -0.03 * $(e, 0, 0.16) + 0.02 * $(e, 0.16, r)),
          i.prop(`crown`, {
            dy: 0.014 * $(e, 0.16, 0.4),
            rot: 0.06 * n * EL(e, 0.2, 1, 2.6, 4) * a,
          }),
          OR(i.d)
        );
      },
      label: `whale:hover`,
    },
  );
}
function zR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 7),
    { intro: r, period: i } = bR.select;
  return IL(
    i,
    r,
    (e) => {
      let r = new NL(t, 54);
      (r.lift(0.045 + 0.03 * Math.sin((Q * e) / i)),
        jR(r, 0.03 * Math.sin((Q * e) / i + 1)));
      let a = 22 * Math.sin(((Q * DL(e)) / i) * 2);
      return (
        MR(r, 124 + a, 124 - a),
        r.eye(`open`),
        r.mouth(`smile`),
        r.lean(0.05 * n * Math.sin((Q * e) / i + 0.6)),
        r.prop(`crown`, {
          dy: 0.014 * Math.sin((Q * e) / i + 0.8),
          rot: -0.05 * n * Math.sin((Q * (e - 0.1)) / i + 0.6),
        }),
        r.prop(`wave`, { sx: 1 + 0.12 * Math.sin((Q * e) / i + 2) }, !0),
        NR(r, FR(1.5), e),
        OR(r.d)
      );
    },
    {
      extras: (e) => {
        let i = new NL(t, 54);
        return (
          e < 0.36 && i.mood(`surprised`),
          i.squash(1 - 0.08 * $(e, 0, 0.16) + 0.08 * $(e, 0.14, r)),
          i.lift(0.05 * $(e, 0.16, r)),
          i.prop(`crown`, {
            dy: 0.04 * $(e, 0.2, 0.46),
            rot: 0.1 * n * EL(e, 0.24, 1, 2.6, 4) * (1 - yL(SL(e, 0.3, r))),
          }),
          OR(i.d)
        );
      },
      events: [LL(1.52, `pfft`, { soft: !0 })],
      label: `whale:select`,
    },
  );
}
function BR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 9),
    { intro: r, period: i } = bR.nervous;
  return IL(
    i,
    r,
    (e) => {
      let r = new NL(t, 54),
        a = DL(e);
      (r.mood(`worried`),
        r.lean(
          0.045 * Math.sin(Q * a * 1.9) + 0.02 * n * Math.sin((Q * e) / i),
        ),
        jR(r, -0.02 + 0.014 * Math.sin(Q * a * 3.8)));
      let o = 16 * Math.sin(Q * a * 2.8);
      return (
        MR(r, 40 + o, 40 - o),
        r.look(0.7 * Math.sin((Q * e) / i)),
        r.sway(0.004 * Math.sin(Q * a * 6)),
        r.prop(`crown`, {
          rot: 0.06 * Math.sin(Q * a * 5.5),
          dy: 0.004 * Math.sin(Q * a * 5.5),
        }),
        r.prop(`fluke`, { rot: 0.03 * Math.sin(Q * a * 5) }),
        NR(r, FR(1), e),
        OR(r.d)
      );
    },
    {
      extras: (e) => new NL(t, 54).prop(`crown`, { dy: 0.02 * $(e, 0, r) }).d,
      events: [
        RL(0.2, `sweat`, { scale: 2.6, u: 0.5 * n, v: 1 }),
        LL(1, `pfft`, { soft: !0 }),
      ],
      label: `whale:nervous`,
    },
  );
}
function VR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 11),
    { intro: r, period: i } = bR.sleepy;
  return IL(
    i,
    r,
    (e) => {
      let r = new NL(t, 54);
      r.mood(`sleepy`);
      let i = CL(e, 0.2, 2.4, xL) * (1 - CL(e, 4.8, 4.95, bL)),
        a = wL(e, 2.2, 2.7, 4.6, 4.8),
        o = $(e, 4.8, 5.4),
        s = wL(e, 5.4, 5.6, 6.2, 6.5);
      return (
        r.lean(0.02 + 0.09 * n * i - 0.05 * n * o),
        jR(
          r,
          -0.03 -
            0.03 * i +
            0.05 * o +
            0.035 * a * Math.sin((Q * (e - 2.2)) / 2.2),
        ),
        r.prop(`crown`, {
          rot: 0.1 * n * i + 0.05 * EL(e, 4.85, 1, 2.8, 4),
          dy: -0.012 * i + 0.03 * $(e, 4.8, 5.1),
        }),
        r.prop(`fluke`, { rot: -0.06 * $(e, 3.4, 3.8) }),
        r.eye(a > 0.5 ? `closed` : o > 0.3 && e < 5.1 ? `wide` : void 0),
        r.look(0.8 * Math.sin((Q * (e - 5.4)) / 1.1) * s),
        MR(r, 54 - 16 * i + 20 * o),
        r.prop(`wave`, { sx: 1 - 0.1 * i }, !0),
        NR(
          r,
          [
            [3.2, `pfft1`],
            [3.32, null],
            [4.4, `pfft1`],
            [4.52, null],
            [4.85, `pfft1`],
            [4.9, `pfft2`],
            [4.98, `pfft1`],
            [5.06, null],
          ],
          e,
        ),
        OR(r.d)
      );
    },
    {
      events: [
        RL(2.6, `zzz`, { scale: 2.2, u: 0.45 * n, v: 1.05 }),
        LL(3.2, `pfft`, { snore: !0 }),
        LL(4.4, `pfft`, { snore: !0 }),
        LL(4.85, `pfft`, { startle: !0 }),
        RL(5.2, `question`, { scale: 2.2, u: -0.4 * n, v: 1.15 }),
      ],
      label: `whale:sleepy`,
    },
  );
}
function HR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 13);
  if (OL(e.seed, 14) < 0.6) {
    let r = 0.9;
    return kR(
      2.5,
      (i) => {
        let a = new NL(t, 54),
          o = CL(i, 0.05, 0.8, xL) * (1 - CL(i, r, 0.98, bL)),
          s = $(i, r, 1.4);
        return (
          jR(a, 0.1 * o - 0.06 * s),
          a.lean(-0.06 * n * o + 0.04 * n * s),
          a.liftRaw(0.03 * s * (e.reduced ? 0.5 : 1)),
          MR(
            a,
            54 +
              26 * o +
              12 * DL(i) * 0 +
              (i > r && i < 1.5 ? 26 * Math.sin((Q * DL(i)) / 0.3) : 0),
          ),
          a.eye(o > 0.3 ? `closed` : void 0),
          a.mood(i > r && i < 1.4 ? `happy` : void 0),
          a.look(0, 0.5 * o),
          a.prop(`crown`, {
            dy: 0.055 * $(i, 0.92, 1.4) - 0.014 * o,
            rot: 0.1 * n * EL(i, 0.9500000000000001, 1, 3, 3.5),
          }),
          a.prop(`wave`, { sx: 1 - 0.15 * o + 0.12 * s }, !0),
          NR(a, PR(r), i),
          a.blink(0.9 * $(i, 1.9, 2.25)),
          a.d
        );
      },
      {
        events: [
          LL(0.05, `inhale`),
          LL(r, `pfft`),
          RL(1.08, `sparkle`, { scale: 2, u: 0.3 * n, v: 1.5 }),
        ],
        label: `whale:gag-pfft`,
      },
    );
  }
  return kR(
    3,
    (e) => {
      let r = new NL(t, 54),
        i = yL(SL(e, 0.2, 1.1)) * (1 - yL(SL(e, 1.9, 2.1))),
        a = wL(e, 1.35, 1.7, 1.95, 2.25);
      return (
        r.prop(`crown`, {
          rot: -0.3 * n * i,
          dx: 0.06 * n * i,
          dy: -0.01 * i + 0.03 * $(e, 1.95, 2.2),
        }),
        r.lean(-0.02 * n * i + 0.04 * n * a),
        MR(r, 54, 54 + 96 * a),
        a > 0.2 && r.armFront(`R`, !0),
        r.mood(
          e > 1.1 && e < 2.4 ? `worried` : e >= 2.4 && e < 2.9 ? `shy` : void 0,
        ),
        r.look(0, 0.5 * wL(e, 1.2, 1.4, 1.9, 2.2)),
        r.blink(0.8 * $(e, 2.55, 2.85)),
        r.d
      );
    },
    { events: [LL(1.9, `pat`)], label: `whale:gag-crown` },
  );
}
function UR(e) {
  let t = ML(e.reduced);
  return kR(
    0.8,
    (e) => {
      let n = new NL(t, 54),
        r = $(e, 0.1, 0.6);
      return (
        jR(n, 0.04 * $(e, 0, 0.2) - 0.05 * r),
        e < 0.55 && MR(n, 54 + 40 * (1 - CL(e, 0, 0.5, bL))),
        e < 0.5 && n.mood(`shy`),
        n.blink(0.9 * $(e, 0.3, 0.68)),
        n.prop(`crown`, { dy: -0.016 * r, rot: -0.05 * EL(e, 0.3, 1, 2.6, 5) }),
        NR(n, FR(0.28), e),
        n.d
      );
    },
    {
      events: [LL(0.1, `sigh`), LL(0.3, `pfft`, { soft: !0 })],
      label: `whale:deselect`,
    },
  );
}
function WR(e) {
  let t = ML(e.reduced),
    n = e.castle === `king`,
    [r, i] = e.off,
    a = Math.max(0.01, Number.isFinite(e.dist) ? e.dist : Math.hypot(r, i)),
    o = e.facing || 0,
    s = e.facing || kL(e.seed, 21),
    c = _L(0.94 + 0.12 * (a - 1) - 0, 0.85, 1.1),
    l = 0.16,
    u = l + (c - l - 0.24),
    [d, f] = DR(r, i),
    p = n ? 2 : 1;
  return kR(
    c,
    (e) => {
      let n = new NL(t, 54),
        c = SL(e, l, u),
        m = +(e > l && e < u),
        h = 1 - (1 - yL(c)) ** 1.7,
        g = 0.05 * Math.min(1, a) * EL(e, u, 1, 1.4, 4.5);
      n.travel(r * (1 - h) - d * g, i * (1 - h) - f * g);
      let _ = Math.sin(Math.PI * c) ** 0.8 * m,
        v = Q * p * c,
        y = $(e, 0, l * 1.7);
      (n.lean(
        0.075 * s * Math.sin(v) * _ +
          o * (0.05 * _ - 0.06 * y) +
          o * 0.06 * EL(e, u, 1, 1.5, 4.5) +
          0.03 * s * EL(e, u + 0.05, 1, 1.9, 5),
      ),
        n.lift(0.022 * Math.abs(Math.sin(v)) * _),
        jR(
          n,
          0.05 * y +
            0.018 * Math.sin(2 * v) * _ -
            0.03 * $(e, u - 0.05, u + 0.2),
        ));
      let b = 24 * Math.sin(v) * _;
      MR(n, 54 + b + 16 * y, 54 - b + 16 * y);
      let x = Math.sin(v * 2) * _;
      return (
        n.foot(`L`, { dx: 0.035 * x, dy: 0.012 * Math.max(0, x) }),
        n.foot(`R`, { dx: -0.035 * x, dy: 0.012 * Math.max(0, -x) }),
        n.prop(
          `wave`,
          {
            sx: 1 + 0.35 * _ + 0.08 * Math.sin(Q * DL(e) * 2.5) * _,
            dx: -o * 0.14 * _,
          },
          !0,
        ),
        n.prop(`fluke`, { rot: -0.05 * (1 + Math.sin(v * 2)) * _ }),
        n.look(0.5 * o * yL(e / 0.15) * (e < u ? 1 : 1 - yL((e - u) / 0.25))),
        n.blink(0.9 * $(e, u + 0.06, u + 0.36)),
        n.prop(`crown`, {
          dy: 0.012 * Math.sin(v * 2) * _ - 0.014 * $(e, u - 0.02, u + 0.14),
        }),
        e > u + 0.1 && e < u + 0.5 && n.mood(`shy`),
        n.d
      );
    },
    {
      events: [
        LL(u, `blup`),
        U.impact(u, `land`, { strength: 0.32 }),
        RL(u, `dust`, { scale: 1.8 }),
        LL(u + 0.2, `sigh`),
      ],
      label: `whale:move${n ? `-castle` : ``}`,
    },
  );
}
function GR(e) {
  let t = ML(e.reduced),
    [n, r] = e.off;
  Math.max(1, Number.isFinite(e.dist) ? e.dist : Math.hypot(n, r));
  let i = e.facing || 0,
    a = e.facing || 0.4 * kL(e.seed, 31),
    [o, s] = DR(n, r),
    c = 0.34,
    l = 0.68,
    u = 0.94,
    d = 1.98,
    f = 0.14,
    p = [
      LL(0.2, `sigh`),
      LL(l, `inhale`, { soft: !0 }),
      U.impact(u, `dink`, { strength: 1 }),
      LL(u, `bump`),
      RL(u, `burst`, { scale: 2 }),
      RL(0.96, `dust`, { scale: 2.4 }),
      RL(1.3399999999999999, `sweat`, { scale: 2.6, u: 0.5 * (i || 1), v: 1 }),
      LL(1.66, `pfft`),
      RL(1.9, `sparkle`, { scale: 2, u: 0.32, v: 1.5 }),
    ];
  e.reduced || p.push(U.shake(u, 0.9, 0.26));
  let m = [
    [0, `worried`],
    [c, `shy`],
    [u, `surprised`],
    [1.24, `worried`],
    [1.66, `happy`],
    [1.8599999999999999, null],
  ];
  return {
    impactAt: u,
    action: kR(
      d,
      (e) => {
        let p = new NL(t, 54),
          h = n,
          g = r;
        if (e < l) {
          let t = f * yL(SL(e, c, l));
          ((h += o * t), (g += s * t));
        } else if (e < u) {
          let t = SL(e, l, u) ** 1.9;
          ((h = (n + o * f) * (1 - t)), (g = (r + s * f) * (1 - t)));
        } else {
          let t = 0.17 * $(e, u, 1.56) ** 0.85 * 1;
          ((h = o * t), (g = s * t));
        }
        return (
          p.travel(h, g),
          p.liftRaw(0.02 * $(e, 0.78, u) + TL(e, 0.96, 0.28, 0.06)),
          p.squash(
            AL(e, [
              [0, 1],
              [c, 0.93, `smooth`],
              [l, 0.88, `smooth`],
              [0.84, 1.07, `outQuad`],
              [u, 1],
              [0.99, 0.74, `outQuad`],
              [1.16, 1.13, `outQuad`],
              [1.3399999999999999, 0.95, `inOutSine`],
              [1.26, 1, `smooth`],
              [1.5, 0.94, `inOutSine`],
              [1.62, 1.03, `smooth`],
              [d, 1, `inOutSine`],
            ]),
          ),
          jR(p, 0.05 * $(e, 0.34, 0.68) + 0.09 * wL(e, 1.5, 1.66, 1.74, 1.9)),
          p.lean(
            a *
              AL(e, [
                [0, 0],
                [c, -0.06, `smooth`],
                [l, -0.2, `smooth`],
                [0.8899999999999999, 0.13, `outQuad`],
                [1.08, -0.2, `outQuad`],
                [1.3, 0.02, `smooth`],
                [1.5, 0.12, `inOutSine`],
                [1.62, -0.05, `smooth`],
                [d, 0, `inOutSine`],
              ]),
          ),
          MR(
            p,
            AL(e, [
              [0, 54],
              [c, xR, `smooth`],
              [l, 96, `smooth`],
              [0.8899999999999999, 30, `inQuad`],
              [1.08, SR, `outBack`],
              [1.12, SR],
              [1.4, CR, `inOutSine`],
              [1.56, CR],
              [1.72, 96, `outQuad`],
              [d, 54, `inOutSine`],
            ]),
          ),
          p.mood(jL(m, e)),
          p.look(
            _L(0.9 * (i || a), -1, 1) *
              yL(e / 0.2) *
              (e < 1.04 ? 1 : 1 - CL(e, 1.04, 1.3399999999999999)),
            e > 1.55 && e < 1.8 ? 0.6 : 0,
          ),
          p.prop(`crown`, {
            dy: 0.09 * $(e, 0.96, 1.24) - 0.014 * $(e, c, l),
            rot: 0.28 * a * EL(e, 0.97, 1, 2.8, 4),
          }),
          p.prop(`fluke`, { rot: -0.1 * $(e, u, 1.29) }),
          p.prop(
            `wave`,
            { sx: 1 + 0.4 * $(e, l, 1.04) + 0.2 * $(e, u, 1.44) },
            !0,
          ),
          p.foot(`L`, { dx: -0.04 * $(e, l, u) }),
          p.foot(`R`, { dx: 0.04 * $(e, l, u) }),
          NR(p, PR(1.66, 0.85), e),
          e > 1.58 && e < 1.7 && p.eye(`closed`),
          p.d
        );
      },
      { events: p, label: `whale:attack` },
    ),
  };
}
function KR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 51),
    r = e.reduced,
    i = 1.95,
    a = {
      t0: 0.16,
      vx: -n * 0.8,
      vy: 2.5,
      floor: wR,
      spin: 3,
      end: 2.7,
      calm: r,
    },
    o = VL(a.t0, a.vy, 9, r ? 0.3 : 0.42, a.floor).filter((e) => e < a.end),
    s = [
      RL(0.04, `exclaim`, { scale: 2.6, u: 0.05, v: 1.55 }),
      LL(0.3, `pfft`, { panic: !0 }),
      ...o.map((e, t) => LL(e, `clink`, { soft: t })),
      U.impact(i, `faint-land`, { strength: 1 }),
      LL(i, `thud`),
      RL(i, `dust`, { scale: 2.6 }),
      RL(1.97, `puff`, { scale: 2.4, u: 0.5, v: 0.1 }),
      RL(2.1, `orbit`, { scale: 2.2, u: 0, v: 0.5, hold: !0 }),
      LL(2.45, `pfft`, { sad: !0 }),
      LL(2.8, `sigh`),
    ];
  r || s.push(U.shake(i, 1, 0.35));
  let c = (e) => (e > i ? BL(e - i, 1.2, 12, 0.25, 0)[0] : 0);
  return kR(
    3.1,
    (e) => {
      let o = new NL(t, 54);
      UL(o, HL(e, a));
      let s = AL(e, [
        [0, 0],
        [0.5, 0],
        [0.8, -0.13, `inOutSine`],
        [1.15, 0.2, `inOutSine`],
        [1.45, -0.1, `inOutSine`],
        [i, 1.4, `inCubic`],
      ]);
      if (
        (o.leanRaw(n * (s - 0.1 * c(e) * 6)),
        o.liftRaw(
          TL(e, 0.04, 0.4, 0.09 * (r ? 0.5 : 1)) +
            c(e) +
            ER * yL(SL(e, 1.6, i)),
        ),
        o.squash(
          AL(e, [
            [0, 1],
            [0.08, 0.92, `outQuad`],
            [0.22, 1.12, `outCubic`],
            [0.4, 1.06, `inOutSine`],
            [0.5, 0.9, `inQuad`],
            [0.7, 1.02, `outQuad`],
            [1.89, 1],
            [2, 0.8, `outQuad`],
            [2.29, 1.02, `outQuad`],
            [2.65, 1, `smooth`],
          ]),
        ),
        s > TR && o.put(`contact`, `ground`),
        e > 1.4 && o.put(`footFollow`, yL(SL(e, 1.4, i))),
        e > 1.5 && o.bodyPose(`hurt`),
        o.mul(`props.wave.alpha`, 1 - yL(SL(e, 1.4, 1.75)), !0),
        MR(
          o,
          AL(e, [
            [0, 54],
            [0.22, SR, `outBack`],
            [0.5, SR],
            [0.9, 100, `smooth`],
            [1.3, 60, `smooth`],
            [i, 30, `inCubic`],
            [2.25, 70, `outQuad`],
            [2.5, 60, `smooth`],
          ]) + (e > 0.5 && e < i ? 10 * Math.sin(Q * DL(e) * 2) : 0),
        ),
        o.mood(e < 0.5 ? `surprised` : `dizzy`),
        o.prop(`fluke`, {
          rot:
            -0.12 * $(e, i, 2.45) +
            0.05 * Math.sin(Q * DL(e) * 2) * wL(e, 0.6, 0.8, 1.4, 1.7),
        }),
        e > 2.2 && e < 2.95)
      ) {
        let t = $(e, 2.2, 2.95) * Math.sin(Q * DL(e) * 2.6);
        (o.foot(`L`, { rot: 0.5 * t }), o.foot(`R`, { rot: -0.4 * t }));
      }
      return (
        NR(
          o,
          [
            [0.3, `pfft1`],
            [0.36, `pfft2`],
            [0.44, `pfft3`],
            [0.62, `pfft2`],
            [0.7, `pfft1`],
            [0.76, null],
            [2.45, `pfft1`],
            [2.6, null],
          ],
          e,
        ),
        o.d
      );
    },
    { events: s, label: `whale:defeat`, idle: !1, taper: 0 },
  );
}
function qR(e) {
  let t = ML(e.reduced),
    n = e.reduced,
    r = 1.6,
    i = 0.7,
    a =
      _L(0.5 + 0.6 * e.strength, 0.4, 1.3) *
      ({ p: 0.7, n: 0.95, b: 0.95, r: 1.2, q: 1.15, k: 1 }[e.by] ?? 1) *
      0.8,
    [o, s] = e.from,
    c = Math.abs(o) > 0.2 ? Math.sign(o) : kL(e.seed, 41),
    l = {
      t0: 0.03,
      vx: c * 0.8,
      vy: 1.7,
      floor: wR,
      spin: 3,
      end: 1.55,
      calm: n,
    },
    u = VL(l.t0, l.vy, 9, n ? 0.3 : 0.42, l.floor).filter((e) => e < l.end),
    d = [
      RL(0.02, `burst`, { scale: 1.8, u: -0.25 * c, v: 0.6 }),
      LL(0.05, `pfft`, { panic: !0 }),
      ...u.map((e, t) => LL(e, `clink`, { soft: t })),
      U.impact(i, `faint-land`, { strength: 0.85 * Math.min(1, a) }),
      LL(i, `thud`),
      RL(i, `dust`, { scale: 2.4 }),
      RL(0.85, `orbit`, { scale: 2.2, u: 0, v: 0.5, hold: !0 }),
      U.world(r, `removed`),
    ],
    f = (e) => (e > i ? BL(e - i, 1, 12, 0.25, 0)[0] : 0);
  return kR(
    r,
    (e) => {
      let u = new NL(t, 54);
      UL(u, HL(e, l));
      let d = CL(e, 0, i, (e) => 1 - (1 - e) ** 2);
      (u.travel(o * 0.5 * a * d, s * 0.5 * a * d),
        u.liftRaw(
          TL(e, 0.02, 0.6799999999999999, 0.14 * a * (n ? 0.5 : 1)) +
            f(e) +
            ER * yL(SL(e, 0.4, i)),
        ));
      let p = AL(e, [
        [0, 0],
        [0.12, -0.1, `outQuad`],
        [i, 1.4, `inQuad`],
      ]);
      return (
        u.leanRaw(c * (p - 0.1 * f(e) * 6)),
        p > TR && u.put(`contact`, `ground`),
        e > 0.28 && u.put(`footFollow`, yL(SL(e, 0.28, i))),
        u.bodyPose(`hurt`),
        u.mood(e < i ? `hurt` : `dizzy`),
        u.squash(
          AL(e, [
            [0, 1],
            [0.06, 0.8, `outQuad`],
            [0.22, 1.08, `outCubic`],
            [0.6599999999999999, 1],
            [0.75, 0.82, `outQuad`],
            [1.04, 1, `outQuad`],
          ]),
        ),
        u.mul(`props.wave.alpha`, 1 - yL(SL(e, 0.3, 0.6)), !0),
        MR(
          u,
          AL(e, [
            [0, 54],
            [0.12, SR, `outBack`],
            [i, 40, `inOutSine`],
            [1, 70, `outQuad`],
            [r, 62, `smooth`],
          ]),
        ),
        NR(
          u,
          [
            [0.1, `pfft2`],
            [0.2, `pfft3`],
            [0.4, `pfft1`],
            [0.5, null],
            [1.2, `pfft1`],
            [1.32, null],
          ],
          e,
        ),
        u.d
      );
    },
    { events: d, label: `whale:removed`, idle: !1, taper: 0 },
  );
}
function JR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 61),
    r = bR.napping.period;
  return AR(
    r,
    (e) => {
      let i = new NL(1, 54);
      return (
        i.mood(`sleepy`),
        i.eye(`closed`),
        i.lean(0.15 * n + 0.01 * t * Math.sin((Q * e) / r)),
        i.mul(`sy`, 0.9 + 0.025 * t * Math.sin((Q * e) / r), !0),
        i.mul(`sx`, 1.08 + 0.03 * t * Math.sin((Q * e) / r), !0),
        i.mouth(`o`),
        i.put(`mouthScale`, 0.55),
        MR(i, 40),
        i.prop(`crown`, { rot: -0.1 * n, dy: -0.01 }),
        i.prop(`wave`, { sx: 0.9 }, !0),
        i.prop(`fluke`, { rot: -0.03 * $(e, 3.8, 4.4) }),
        NR(i, FR(2.6), e),
        i.d
      );
    },
    {
      events: [
        RL(0.9, `zzz`, { scale: 2.2, u: 0.4 * n, v: 1.05 }),
        LL(2.6, `pfft`, { snore: !0 }),
      ],
      label: `whale:napping`,
    },
  );
}
function YR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 71),
    r = 1.95;
  return kR(
    r,
    (e) => {
      let i = new NL(t, 54),
        a = DL(e);
      (i.lift(TL(e, 0.04, 0.38, 0.09)),
        i.squash(
          AL(e, [
            [0, 1],
            [0.08, 0.9, `outQuad`],
            [0.2, 1.13, `outCubic`],
            [0.38, 1.06, `inOutSine`],
            [0.46, 0.86, `inQuad`],
            [0.6, 1.03, `outQuad`],
            [0.8, 1, `smooth`],
            [1.7, 0.98, `smooth`],
            [1.82, 1.03, `outQuad`],
            [r, 1, `inOutSine`],
          ]),
        ));
      let o = AL(e, [
          [0, 54],
          [0.2, SR, `outBack`],
          [0.5, SR],
          [0.6, 138, `smooth`],
          [1.7, 138],
          [1.9, 54, `inOutSine`],
        ]),
        s = wL(e, 0.5, 0.65, 1.55, 1.7);
      return (
        MR(
          i,
          o + 5 * s * Math.sin(Q * a * 5.5),
          o - 5 * s * Math.sin(Q * a * 5.5),
        ),
        i.mood(e < 0.5 ? `surprised` : e < 1.7 ? `worried` : void 0),
        i.lean(0.06 * Math.sin(Q * a * 2.2) * s),
        i.sway(0.006 * Math.sin(Q * a * 5) * s),
        jR(i, -0.03 * s + 0.02 * Math.sin(Q * a * 4.4) * s),
        i.look(
          0.8 * Math.sin((Q * (e - 0.6)) / 0.9) * wL(e, 0.6, 0.75, 1.3, 1.5),
        ),
        i.prop(`crown`, {
          rot:
            0.08 * Math.sin(Q * a * 5.5) * s +
            0.12 * n * EL(e, 0.46, 1, 2.8, 4),
          dy: 0.04 * $(e, 0.05, 0.4),
        }),
        i.prop(`wave`, { sx: 1 + 0.08 * Math.sin(Q * a * 4) * s }, !0),
        NR(
          i,
          [
            [0.7, `pfft1`],
            [0.78, null],
            [1, `pfft1`],
            [1.08, `pfft2`],
            [1.16, null],
            [1.38, `pfft1`],
            [1.46, null],
          ],
          e,
        ),
        i.blink(0.9 * $(e, 1.7, 1.92)),
        i.d
      );
    },
    {
      events: [
        RL(0.04, `exclaim`, { scale: 2.6, u: 0.02, v: 1.55 }),
        LL(0.06, `pfft`, { panic: !0 }),
        RL(0.5, `sweat`, { scale: 2.6, u: 0.5 * n, v: 1 }),
        U.impact(0.42, `land`, { strength: 0.32 }),
        RL(1.1, `sweat`, { scale: 2.6, u: -0.5 * n, v: 0.95 }),
        LL(1.7, `sigh`),
      ],
      label: `whale:checked`,
    },
  );
}
function XR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 81),
    r = e.reduced;
  return kR(
    4.4,
    (e) => {
      let i = new NL(t, 54),
        a = CL(e, 0.05, 0.5, xL) * (1 - CL(e, 0.55, 0.62, bL)),
        o = $(e, 0.55, 1.5),
        s = $(e, 2.6, 3.3);
      return (
        jR(
          i,
          0.13 * a +
            0.05 * o +
            0.05 * s -
            0.04 * $(e, 0.55, 0.75) +
            0.02 * Math.sin(Q * DL(e) * 1.5) * (o + s),
        ),
        i.squash(
          AL(e, [
            [0, 1],
            [2.2, 1],
            [2.34, 0.82, `inQuad`],
            [2.55, 1.05, `outQuad`],
            [2.75, 1, `smooth`],
            [3.5, 1, `smooth`],
            [3.65, 0.95, `inOutSine`],
            [4.1, 1, `inOutSine`],
          ]),
        ),
        i.lift(0.03 * o + TL(e, 1.55, 0.75, 0.16) + 0.03 * s),
        i.lean(
          -0.1 * n * a +
            0.05 * n * $(e, 0.55, 0.9) +
            0.14 * n * $(e, 3.4, 4.1) -
            0.05 * n * $(e, 1.5, 2.3),
        ),
        MR(
          i,
          AL(e, [
            [0, 54],
            [0.5, SR, `inOutSine`],
            [1.45, SR],
            [1.7, xR, `smooth`],
            [2.3, xR],
            [2.55, SR, `outBack`],
            [3.3, SR],
            [3.6, 100, `smooth`],
            [4.2, 54, `inOutSine`],
          ]) + (e > 3.3 && e < 4 ? 14 * Math.sin((Q * DL(e)) / 0.5) : 0),
          AL(e, [
            [0, 54],
            [0.5, SR, `inOutSine`],
            [1.45, SR],
            [1.7, xR, `smooth`],
            [2.3, xR],
            [2.55, SR, `outBack`],
            [3.3, SR],
            [3.6, 100, `smooth`],
            [4.2, 54, `inOutSine`],
          ]),
        ),
        !r &&
          e > 1.55 &&
          e < 2.3 &&
          i.put(
            `turn`,
            Math.max(
              0.28,
              Math.abs(Math.cos((Math.PI * 2 * (e - 1.55)) / 0.75)),
            ),
          ),
        i.mood(
          e < 0.1 ? void 0 : e < 3.3 ? `victorious` : e < 4 ? `happy` : void 0,
        ),
        e > 0.05 && e < 0.55 && i.eye(`closed`),
        i.look(0, 0.5 * a),
        i.prop(`crown`, {
          dy: 0.09 * o + 0.08 * s + 0.02 * $(e, 2.3, 2.6),
          rot:
            0.1 * n * EL(e, 0.6, 1, 2.6, 3.2) -
            0.1 * n * EL(e, 2.65, 1, 2.6, 3.2),
        }),
        i.prop(`fluke`, { rot: -0.1 * $(e, 0.8, 1.6) - 0.08 * $(e, 1.9, 2.4) }),
        i.prop(
          `wave`,
          { sx: 1 - 0.15 * a + 0.25 * $(e, 1.5, 2.35) + 0.2 * s },
          !0,
        ),
        NR(i, PR(0.55, 2.2), e),
        e >= 2.6 && NR(i, PR(2.6, 2), e),
        i.d
      );
    },
    {
      events: [
        LL(0.1, `inhale`),
        LL(0.55, `pfft`, { big: !0 }),
        RL(0.6, `sparkle`, { scale: 2.2, u: 0.4, v: 1.6 }),
        RL(0.8, `sparkle`, { scale: 2.2, u: -0.4, v: 1.5 }),
        U.impact(2.32, `land`, { strength: 0.5 }),
        RL(2.32, `dust`, { scale: 2.2 }),
        LL(2.6, `pfft`, { big: !0 }),
        RL(2.7, `heart`, { scale: 2.2, u: 0.4, v: 1.4 }),
        RL(3, `note`, { scale: 2.2, u: -0.44, v: 1.3 }),
        LL(3.9, `sigh`),
      ],
      label: `whale:victory`,
      idle: { look: !1 },
    },
  );
}
function ZR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 91);
  return kR(
    1.7,
    (e) => {
      let r = new NL(t, 54),
        i = wL(e, 0.15, 0.6, 1.1, 1.5);
      return (
        jR(
          r,
          AL(e, [
            [0, 0],
            [0.15, -0.02, `smooth`],
            [0.6, 0.06, `outBack`],
            [1.1, 0.05],
            [1.5, 0, `inOutSine`],
          ]),
        ),
        r.lift(0.03 * i),
        MR(r, 54 + 52 * i),
        r.lean(
          0.07 * n * wL(e, 0.3, 0.6, 0.9, 1.15) -
            0.05 * n * wL(e, 1, 1.2, 1.3, 1.5),
        ),
        i > 0.3 && (r.brow(`worried`), r.mouth(`wavy`), r.eye(`half`)),
        r.prop(`crown`, { rot: -0.08 * n * EL(e, 0.6, 1, 2.6, 4) }),
        r.blink(0.9 * $(e, 1.3, 1.62)),
        NR(r, FR(1.45), e),
        r.d
      );
    },
    {
      events: [LL(0.5, `hm`), LL(1.46, `pfft`, { soft: !0 })],
      label: `whale:shrug`,
    },
  );
}
function QR(e) {
  let t = ML(e.reduced),
    n = kL(e.seed, 95);
  return kR(
    0.78,
    (e) => {
      let r = new NL(t, 54),
        i = wL(e, 0, 0.1, 0.5, 0.74),
        a = Math.sin((Q * DL(e)) / 0.36);
      return (
        r.look(0.95 * a * i),
        r.lean(-0.08 * n * a * i),
        jR(r, -0.03 * $(e, 0, 0.22)),
        r.mood(`worried`),
        MR(r, 54 + 26 * $(e, 0.05, 0.66)),
        r.prop(`crown`, { rot: 0.07 * n * a * i }),
        NR(r, FR(0.6), e),
        r.d
      );
    },
    { events: [LL(0.05, `hm`)], label: `whale:refuse` },
  );
}
var $R = {
  w: yR,
  b: {
    kind: `k`,
    rest: IR,
    entrance: LR,
    hover: RR,
    select: zR,
    nervous: BR,
    sleepy: VR,
    gag: HR,
    deselect: UR,
    move: WR,
    attack: GR,
    removed: qR,
    napping: JR,
    checked: YR,
    victory: XR,
    defeat: KR,
    shrug: ZR,
    promoteOut: () => zL(`whale:promoteOut`),
    promoteIn: () => zL(`whale:promoteIn`),
    refuse: QR,
  },
};
var ez = new Map();
function tz(e, t) {
  if (!Number.isFinite(e)) return;
  let n = ez.get(e);
  ez.set(e, n === void 0 || n === t ? t : `both`);
}
function nz(e) {
  let t = e.side;
  return t === `w` || t === `b` ? t : ez.get(e.seed) === `b` ? `b` : `w`;
}
var rz = (e) => $R[nz(e)];
var iz = {
  kind: `k`,
  forSide: (e) => $R[e === `b` ? `b` : `w`],
  rest(e, t, n) {
    (tz(n, t), tz(e.seed, t), $R[t === `b` ? `b` : `w`].rest(e, t, n));
  },
  entrance: (e, t) => rz(t).entrance(e, t),
  hover: (e) => rz(e).hover(e),
  select: (e) => rz(e).select(e),
  nervous: (e) => rz(e).nervous(e),
  sleepy: (e) => rz(e).sleepy(e),
  gag: (e) => rz(e).gag(e),
  deselect: (e) => rz(e).deselect(e),
  move: (e) => $R[e.side === `b` ? `b` : `w`].move(e),
  attack: (e) => $R[e.side === `b` ? `b` : `w`].attack(e),
  removed: (e) => $R[e.side === `b` ? `b` : `w`].removed(e),
  napping: (e) => rz(e).napping(e),
  checked: (e) => rz(e).checked(e),
  victory: (e) => rz(e).victory(e),
  defeat: (e) => rz(e).defeat(e),
  shrug: (e) => rz(e).shrug(e),
  promoteOut: (e) => rz(e).promoteOut(e),
  promoteIn: (e) => rz(e).promoteIn(e),
  refuse: (e) => rz(e).refuse(e),
};
export {
  Iy as Puppet,
  UA as pawnAnimator,
  CM as knightAnimator,
  gP as bishopAnimator,
  UF as rookAnimator,
  gL as queenAnimator,
  iz as kingAnimator,
};
