// Radar nowcasting (extrapolation forecast) on a small echo grid, using the standard operational recipe:
//   1. motion field by block correlation between consecutive scans (TREC: Tracking Radar Echoes by
//      Correlation), averaged over the last few scan pairs, with vectors that disagree with the overall
//      motion replaced and the field smoothed (the continuity step of COTREC, simplified);
//   2. semi-Lagrangian backward advection of the latest scan along that field (Lagrangian persistence);
//   3. verification against what was observed, with the critical success index (CSI), next to the
//      "rain stays where it is" baseline (Eulerian persistence).
// Growth and decay of rain are not predicted: that is the known limit of extrapolation nowcasts, and why
// the picture is blurred more as the lead time grows (small features are the least predictable).
// Grids are Uint8Array(N * N) of echo intensity 0..255, row-major; one cell is two radar pixels.
export const N = 128;
const B = 16, S = 8, R = 5, G = (N - B) / S + 1, ECHO = 60;

function blockVector(A, C, bx, by) {
  let on = 0;
  for (let y = by; y < by + B; y++) for (let x = bx; x < bx + B; x++) on += A[y * N + x] > ECHO;
  if (on < 10) return null;
  const cost = (dx, dy) => {
    let c = 0, n = 0;
    for (let y = by; y < by + B; y++) { const yy = y + dy; if (yy < 0 || yy >= N) continue;
      for (let x = bx; x < bx + B; x++) { const xx = x + dx; if (xx < 0 || xx >= N) continue; c += Math.abs(A[y * N + x] - C[yy * N + xx]); n++; } }
    return n > B * B * 0.6 ? c / n : Infinity;
  };
  const grid = new Map(); let best = [0, 0], bc = cost(0, 0); const c0 = bc; grid.set("0,0", c0);
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { if (!dx && !dy) continue; const c = cost(dx, dy); grid.set(`${dx},${dy}`, c); if (c < bc) { bc = c; best = [dx, dy]; } }
  const clear = bc < c0 * 0.9;                   // a shift has to beat "no movement" clearly to count
  if (!clear) return { u: 0, v: 0, w: on * 0.3 };
  const sub = (i) => { const d = i ? [0, 1] : [1, 0], l = grid.get(`${best[0] - d[0]},${best[1] - d[1]}`), r = grid.get(`${best[0] + d[0]},${best[1] + d[1]}`);
    if (!Number.isFinite(l) || !Number.isFinite(r)) return best[i]; const den = l - 2 * bc + r; return best[i] + (den > 0 ? Math.max(-0.5, Math.min(0.5, (l - r) / (2 * den))) : 0); };
  return { u: sub(0), v: sub(1), w: on * (1 - bc / c0) };
}

// Motion field from consecutive grids (oldest first): { u, v } in cells per scan interval on a G x G lattice.
export function flow(grids) {
  const u = new Float32Array(G * G), v = new Float32Array(G * G), w = new Float32Array(G * G);
  const pairs = []; for (let i = Math.max(1, grids.length - 3); i < grids.length; i++) pairs.push([grids[i - 1], grids[i]]);
  pairs.forEach(([A, C], pi) => {
    const age = 0.6 ** (pairs.length - 1 - pi);  // the newest pair counts most
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const b = A && C ? blockVector(A, C, i * S, j * S) : null; if (!b) continue; const k = j * G + i, ww = b.w * age; u[k] += b.u * ww; v[k] += b.v * ww; w[k] += ww; }
  });
  let su = 0, sv = 0, sw = 0;
  for (let k = 0; k < G * G; k++) if (w[k] > 0) { su += u[k]; sv += v[k]; sw += w[k]; u[k] /= w[k]; v[k] /= w[k]; }
  const mu = sw ? su / sw : 0, mv = sw ? sv / sw : 0;
  for (let k = 0; k < G * G; k++) if (!(w[k] > 0) || Math.hypot(u[k] - mu, v[k] - mv) > 3.5) { u[k] = mu; v[k] = mv; }   // no echo, or an outlier: overall motion
  for (let pass = 0; pass < 2; pass++) for (const f of [u, v]) {
    const o = Float32Array.from(f);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { let s = 0, n = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= G || b >= G) continue; s += o[b * G + a]; n++; } f[j * G + i] = s / n; }
  }
  return { u, v, mean: [mu, mv], tracked: sw > 0 };
}
export function sampleFlow(F, x, y) {            // bilinear between block centres, clamped at the edges
  const fx = Math.max(0, Math.min(G - 1, (x - B / 2) / S)), fy = Math.max(0, Math.min(G - 1, (y - B / 2) / S));
  const i = Math.min(G - 2, Math.floor(fx)), j = Math.min(G - 2, Math.floor(fy)), a = fx - i, b = fy - j, k = j * G + i;
  return [F.u[k] * (1 - a) * (1 - b) + F.u[k + 1] * a * (1 - b) + F.u[k + G] * (1 - a) * b + F.u[k + G + 1] * a * b,
          F.v[k] * (1 - a) * (1 - b) + F.v[k + 1] * a * (1 - b) + F.v[k + G] * (1 - a) * b + F.v[k + G + 1] * a * b];
}
// Where the air now at (x, y) was `steps` scan intervals ago (semi-Lagrangian backward trajectory).
export function origin(F, x, y, steps) {     // steps may be fractional (e.g. 0.7 = seven minutes of a ten-minute interval)
  for (let s = 0; s < steps; s++) { const part = Math.min(1, steps - s), [du, dv] = sampleFlow(F, x, y); x -= du * part; y -= dv * part; }
  return [x, y];
}
// Rain near one point `steps` intervals ahead, without advecting the whole grid: share of the cells within `r`
// of (cx, cy) whose backward trajectory starts on an echo.
export function coverAhead(grid, F, cx, cy, r, steps) {
  let on = 0, n = 0;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    if (Math.hypot(x - cx, y - cy) > r) continue;
    n++;
    const [sx, sy] = origin(F, x, y, steps);
    if (sx < 0 || sy < 0 || sx > N - 1 || sy > N - 1) continue;
    const i = Math.min(N - 2, Math.floor(sx)), j = Math.min(N - 2, Math.floor(sy)), a = sx - i, b = sy - j, k = j * N + i;
    on += grid[k] * (1 - a) * (1 - b) + grid[k + 1] * a * (1 - b) + grid[k + N] * (1 - a) * b + grid[k + N + 1] * a * b > ECHO;
  }
  return n ? on / n : 0;
}
export function advect(grid, F, steps) {
  const out = new Uint8Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const [sx, sy] = origin(F, x, y, steps);
    if (sx < 0 || sy < 0 || sx > N - 1 || sy > N - 1) continue;
    const i = Math.min(N - 2, Math.floor(sx)), j = Math.min(N - 2, Math.floor(sy)), a = sx - i, b = sy - j, k = j * N + i;
    out[y * N + x] = grid[k] * (1 - a) * (1 - b) + grid[k + 1] * a * (1 - b) + grid[k + N] * (1 - a) * b + grid[k + N + 1] * a * b;
  }
  return out;
}
// Hindcast check over the scans available: forecast each scan `lead` intervals ahead from the motion known at
// the time, and score rain / no-rain against the scan that followed. Returns pooled CSI for the nowcast and
// for persistence, or null with too little rain to judge.
export function verify(grids, lead) {
  const M = 10; let h = 0, m = 0, f = 0, ph = 0, pm = 0, pf = 0, cases = 0;
  for (let i = 2; i + lead < grids.length; i++) {
    if (!grids[i] || !grids[i + lead] || !grids[i - 1] || !grids[i - 2]) continue;
    const fc = advect(grids[i], flow(grids.slice(Math.max(0, i - 3), i + 1)), lead), obs = grids[i + lead], per = grids[i];
    for (let y = M; y < N - M; y++) for (let x = M; x < N - M; x++) { const k = y * N + x, o = obs[k] > ECHO, a = fc[k] > ECHO, p = per[k] > ECHO;
      if (a && o) h++; else if (o) m++; else if (a) f++;
      if (p && o) ph++; else if (o) pm++; else if (p) pf++; }
    cases++;
  }
  if (!cases || h + m < 60) return null;
  return { lead, cases, csi: h / (h + m + f || 1), persistence: ph / (ph + pm + pf || 1) };
}
// Rain at a point of the grid: share of cells with echo within `r` cells.
export function coverAt(grid, cx, cy, r) {
  let on = 0, n = 0;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    if (x < 0 || y < 0 || x >= N || y >= N || Math.hypot(x - cx, y - cy) > r) continue; n++; on += grid[y * N + x] > ECHO; }
  return n ? on / n : 0;
}
