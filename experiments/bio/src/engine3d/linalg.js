// Small 3D toolkit for the structure views: quaternions [w,x,y,z], row-major 3x3 matrices,
// Kabsch/Horn superposition and a perspective projection that matches the 2D stage.

export const quatIdentity = () => [1, 0, 0, 0];

export function quatFromAxisAngle(axis, angle) {
  const n = Math.hypot(...axis) || 1,
    s = Math.sin(angle / 2) / n;
  return [Math.cos(angle / 2), axis[0] * s, axis[1] * s, axis[2] * s];
}

/** Hamilton product: the result applies `a` first, then `b`. */
export function quatMul(b, a) {
  const [bw, bx, by, bz] = b,
    [aw, ax, ay, az] = a;
  return [bw * aw - bx * ax - by * ay - bz * az, bw * ax + bx * aw + by * az - bz * ay, bw * ay - bx * az + by * aw + bz * ax, bw * az + bx * ay - by * ax + bz * aw];
}

export function quatNormalize(q) {
  const n = Math.hypot(...q) || 1;
  return q.map((v) => v / n);
}

export function quatToMat([w, x, y, z]) {
  return [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y), 2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x), 2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)];
}

export function quatSlerp(a, b, t) {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const bb = dot < 0 ? b.map((v) => -v) : b;
  dot = Math.abs(dot);
  if (dot > 0.9995) return quatNormalize(a.map((v, i) => v + (bb[i] - v) * t));
  const th = Math.acos(dot),
    s = Math.sin(th),
    ka = Math.sin((1 - t) * th) / s,
    kb = Math.sin(t * th) / s;
  return a.map((v, i) => v * ka + bb[i] * kb);
}

/** Shortest rotation taking direction a onto direction b. */
export function quatFromTo(a, b) {
  const na = Math.hypot(...a),
    nb = Math.hypot(...b),
    u = a.map((v) => v / na),
    v = b.map((x) => x / nb),
    dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  if (dot > 0.999999) return quatIdentity();
  if (dot < -0.999999) {
    const axis = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0],
      c = [u[1] * axis[2] - u[2] * axis[1], u[2] * axis[0] - u[0] * axis[2], u[0] * axis[1] - u[1] * axis[0]];
    return quatFromAxisAngle(c, Math.PI);
  }
  const c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  return quatNormalize([1 + dot, c[0], c[1], c[2]]);
}

export const applyMat = (m, [x, y, z]) => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
export const matMul = (a, b) => {
  const out = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) out[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
  return out;
};
export const transpose = (m) => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];

export function centroid(pts) {
  const c = [0, 0, 0];
  for (const p of pts) {
    c[0] += p[0];
    c[1] += p[1];
    c[2] += p[2];
  }
  return c.map((v) => v / pts.length);
}

export function rmsd(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i][0] - b[i][0]) ** 2 + (a[i][1] - b[i][1]) ** 2 + (a[i][2] - b[i][2]) ** 2;
  return Math.sqrt(s / a.length);
}

/** Jacobi eigen-decomposition of a small symmetric matrix (rows of arrays). */
export function jacobi(A) {
  const n = A.length,
    a = A.map((r) => [...r]),
    v = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] ** 2;
    if (off < 1e-22) break;
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]),
          t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)),
          c = 1 / Math.sqrt(t * t + 1),
          s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k][p],
            akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k],
            aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k][p],
            vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
  }
  return { values: a.map((r, i) => r[i]), vectors: v };
}

/**
 * Best rigid motion taking cloud P onto Q (Horn's quaternion method, always a proper rotation).
 * Returns the rotation matrix, translation, an `apply` for points and the fit RMSD.
 */
export function kabsch(P, Q) {
  const cp = centroid(P),
    cq = centroid(Q);
  let Sxx = 0, Sxy = 0, Sxz = 0, Syx = 0, Syy = 0, Syz = 0, Szx = 0, Szy = 0, Szz = 0;
  for (let i = 0; i < P.length; i++) {
    const px = P[i][0] - cp[0], py = P[i][1] - cp[1], pz = P[i][2] - cp[2];
    const qx = Q[i][0] - cq[0], qy = Q[i][1] - cq[1], qz = Q[i][2] - cq[2];
    Sxx += px * qx; Sxy += px * qy; Sxz += px * qz;
    Syx += py * qx; Syy += py * qy; Syz += py * qz;
    Szx += pz * qx; Szy += pz * qy; Szz += pz * qz;
  }
  const N = [
    [Sxx + Syy + Szz, Syz - Szy, Szx - Sxz, Sxy - Syx],
    [Syz - Szy, Sxx - Syy - Szz, Sxy + Syx, Szx + Sxz],
    [Szx - Sxz, Sxy + Syx, -Sxx + Syy - Szz, Syz + Szy],
    [Sxy - Syx, Szx + Sxz, Syz + Szy, -Sxx - Syy + Szz],
  ];
  const { values, vectors } = jacobi(N);
  let best = 0;
  for (let i = 1; i < 4; i++) if (values[i] > values[best]) best = i;
  const q = quatNormalize([vectors[0][best], vectors[1][best], vectors[2][best], vectors[3][best]]),
    matrix = quatToMat(q),
    rc = applyMat(matrix, cp),
    translation = [cq[0] - rc[0], cq[1] - rc[1], cq[2] - rc[2]];
  const apply = (p) => {
    const r = applyMat(matrix, p);
    return [r[0] + translation[0], r[1] + translation[1], r[2] + translation[2]];
  };
  return { quat: q, matrix, translation, apply, rmsd: rmsd(P.map(apply), Q) };
}

/**
 * Perspective camera on the z axis: +z points toward the viewer. `depth` grows with distance,
 * `s` is the pixels-per-unit scale at that depth.
 */
export function project([x, y, z], { f = 700, cx = 0, cy = 0, dist = 220 } = {}) {
  const depth = dist - z,
    s = f / Math.max(1, depth);
  return { x: cx + x * s, y: cy - y * s, s, depth };
}

