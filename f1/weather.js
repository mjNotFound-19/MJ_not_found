// Live weather at the circuit: a radar loop (RainViewer) over an OpenStreetMap base map (darkened here) and
// current conditions + the next hours (Open-Meteo). Plain image and JSON requests only: no third-party
// scripts, cookies or trackers. getWeather() also classifies the situation (dry / showers nearby / wet) for
// the strategy notes.
import { flow, origin, verify, coverAhead } from "./nowcast.js?v=2ff3b714ee";

const RV = "https://api.rainviewer.com/public/weather-maps.json";
const BASE = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
const ZR = 7;                               // radar zoom (RainViewer serves up to 7)
const TTL = 50 * 1000, FC_TTL = 5 * 60 * 1000;      // radar frame list re-checked each minute; forecast every 5 minutes
const cache = new Map(), fcCache = new Map(), patches = new Map();
export const STEP = 600000, LEADS = 8;         // radar scan interval; forecast frames from the latest scan (80 min, so a full hour ahead of now is always covered)

const world = (lat, lon, z) => {            // Web Mercator pixel coordinates at zoom z
  const n = 256 * 2 ** z, s = Math.sin((lat * Math.PI) / 180);
  return [((lon + 180) / 360) * n, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n];
};
const kmPerPx = (lat, z) => (40075 * Math.cos((lat * Math.PI) / 180)) / (256 * 2 ** z);
const img = (src) => new Promise((ok, no) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = no; i.src = src; });

async function radarFrames() {
  const j = await (await fetch(RV)).json();
  return (j.radar?.past || []).slice(-12).map((f) => ({ time: f.time * 1000, url: (x, y) => `${j.host}${f.path}/256/${ZR}/${x}/${y}/2/1_0.png` }));
}
function echoStats(p, lat) {                // distance to the nearest echo and coverage near the circuit, from a radar patch
  const g = p.raw.getContext("2d", { willReadFrequently: true }), n = p.raw.width, d = g.getImageData(0, 0, n, n).data, km = kmPerPx(lat, ZR);
  let nearest = Infinity, in5 = 0, tot5 = 0, in15 = 0, tot15 = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const r = Math.hypot(x - p.px, y - p.py) * km;
    if (r > 160) continue;
    const on = d[(y * n + x) * 4 + 3] > 60;
    if (r <= 5) { tot5++; in5 += on; }
    if (r <= 15) { tot15++; in15 += on; }
    if (on && r < nearest) nearest = r;
  }
  return { nearestKm: Number.isFinite(nearest) ? nearest : null, cover5: tot5 ? in5 / tot5 : 0, cover15: tot15 ? in15 / tot15 : 0 };
}
async function forecast(lat, lon) {
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,cloud_cover` +
    `&hourly=precipitation_probability,precipitation&minutely_15=precipitation&past_minutely_15=16&forecast_minutely_15=24&timezone=auto&forecast_hours=7`;
  const j = await (await fetch(u)).json(), off = (j.utc_offset_seconds || 0) * 1000;      // times come back in the circuit's zone
  return { temp: j.current?.temperature_2m, precipNow: j.current?.precipitation ?? 0, wind: j.current?.wind_speed_10m, cloud: j.current?.cloud_cover,
    tz: j.timezone || null,
    slots: (j.minutely_15?.time || []).map((t, i) => ({ t: Date.parse(t + "Z") - off, mm: j.minutely_15.precipitation?.[i] ?? 0 })),   // mm per 15 min
    hours: (j.hourly?.time || []).map((t, i) => ({ t: Date.parse(t + "Z") - off, prob: j.hourly.precipitation_probability?.[i] ?? null, mm: j.hourly.precipitation?.[i] ?? 0 })) };
}

// { kind: "dry" | "threat" | "wet", nearestKm, cover5, precipNow, prob2h, mm2h, temp, wind, hours, frames, radarTime, updated }
export function getWeather({ lat, lon }) {
  const key = `${lat},${lon}`, hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.p;
  const p = (async () => {
    const old = fcCache.get(key), fcP = old && Date.now() - old.at < FC_TTL ? old.p : forecast(lat, lon).catch(() => null);
    if (!old || fcP !== old.p) fcCache.set(key, { at: Date.now(), p: fcP });
    const [fr, fc] = await Promise.all([radarFrames().catch(() => []), fcP]);
    let echo = { nearestKm: null, cover5: 0, cover15: 0 }, nowcast = [];
    if (fr.length) {
      const ps = (await Promise.all(fr.slice(-4).map((f) => getPatch(f, lat, lon).catch(() => null)))).filter((x) => x?.m), last = ps[ps.length - 1];
      if (last) {
        try { echo = echoStats(last, lat); } catch {}
        try {                                     // extrapolation nowcast for the circuit: +10 ... +60 minutes
          const F = flow(ps.map((x) => x.m)), r5 = 5 / (kmPerPx(lat, ZR) * 2);
          for (let m = 1; m <= LEADS * 10; m++) { const cov = coverAhead(last.m, F, last.cx, last.cy, Math.max(1.5, r5), m / 10); nowcast.push({ t: last.time + m * 60000, lead: m, cover: cov, wet: cov > 0.05 }); }
        } catch {}
      }
    }
    const next2 = (fc?.hours || []).slice(0, 3), prob2h = next2.length ? Math.max(...next2.map((h) => h.prob ?? 0)) : null, mm2h = next2.reduce((s, h) => s + h.mm, 0);
    const wet = (fc?.precipNow ?? 0) >= 0.1 || echo.cover5 > 0.05;
    const threat = !wet && ((echo.nearestKm != null && echo.nearestKm < 25) || (prob2h ?? 0) >= 60 || mm2h >= 0.3);
    return { kind: wet ? "wet" : threat ? "threat" : "dry", ...echo, precipNow: fc?.precipNow ?? null, prob2h, mm2h, temp: fc?.temp ?? null, wind: fc?.wind ?? null,
      hours: fc?.hours || [], slots: fc?.slots || [], nowcast, tz: fc?.tz ?? null, frames: fr, radarTime: fr.length ? fr[fr.length - 1].time : null, updated: Date.now(), ok: !!(fr.length || fc) };
  })();
  cache.set(key, { at: Date.now(), p });
  return p;
}

// Keep a view up to date without a page reload: calls cb(weather) now and whenever a new radar frame or
// forecast arrives (checked every `every` ms while the tab is visible, and again when it becomes visible).
export function watchWeather(geo, cb, every = 60000) {
  let stopped = false, seen = null;
  const run = async () => {
    if (stopped || document.hidden) return;
    try {
      const w = await getWeather(geo), key = `${w.radarTime}|${w.precipNow}|${w.prob2h}|${w.kind}|${w.slots?.[0]?.t}|${w.nowcast.filter((x, i) => i % 5 === 4).map((x) => +x.wet).join("")}`;
      if (!stopped && key !== seen) { seen = key; cb(w); }
    } catch {}
  };
  const id = setInterval(run, every), vis = () => { if (!document.hidden) run(); };
  document.addEventListener("visibilitychange", vis);
  run();
  return () => { stopped = true; clearInterval(id); document.removeEventListener("visibilitychange", vis); };
}

// A moment shown in both clocks: the circuit's local time and the viewer's device time (one value when they match).
export function dualTime(t, tz, opts = { hour: "2-digit", minute: "2-digit" }) {
  const d = new Date(t), mine = new Intl.DateTimeFormat(undefined, opts).format(d);
  let track = null;
  try { if (tz) track = new Intl.DateTimeFormat(undefined, { ...opts, timeZone: tz }).format(d); } catch {}
  return { track, mine, same: !track || track === mine, text: !track || track === mine ? mine : `${track} at the circuit · ${mine} your time` };
}

// ------------------------------------------------------------------------------------------- interactive map
// Pan / zoom map in `host`: darkened OpenStreetMap tiles, the circuit outline, and the radar loop with
// crossfaded frames. Everything is drawn on one canvas from a requestAnimationFrame loop that only runs
// while something is moving. Returns { weather, dispose }.
const ZMIN = 7.6, ZMAX = 16.4, TINT = "#7f8aa6";
const norm = (lat, lon) => { const s = Math.sin((lat * Math.PI) / 180); return [(lon + 180) / 360, 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)]; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tiles = new Map();                       // "z/x/y" -> { c: canvas | null, state }
function baseTile(z, x, y, onload) {
  const key = `${z}/${x}/${y}`;
  let t = tiles.get(key);
  if (!t) {
    t = { c: null, state: "loading" }; tiles.set(key, t);
    img(BASE(z, x, y)).then((im) => {
      const c = document.createElement("canvas"); c.width = c.height = 256;
      const g = c.getContext("2d");
      g.drawImage(im, 0, 0);                  // light standard tiles -> the site's dark palette
      g.globalCompositeOperation = "difference"; g.fillStyle = "#fff"; g.fillRect(0, 0, 256, 256);
      g.globalCompositeOperation = "saturation"; g.fillStyle = "#000"; g.fillRect(0, 0, 256, 256);
      g.globalCompositeOperation = "multiply"; g.fillStyle = TINT; g.fillRect(0, 0, 256, 256);
      t.c = c; t.state = "ok"; onload();
    }).catch(() => { t.state = "error"; });
  }
  return t;
}
// radar frame as one canvas covering the 2x2 radar tiles nearest the circuit, with its position in tile units
async function radarPatch(frame, lat, lon) {
  const [wx, wy] = world(lat, lon, ZR), tx0 = Math.round(wx / 256) - 1, ty0 = Math.round(wy / 256) - 1;
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d", { willReadFrequently: true }), jobs = [];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++)
    jobs.push(img(frame.url(tx0 + i, ty0 + j)).then((im) => g.drawImage(im, i * 256, j * 256)).catch(() => {}));
  await Promise.all(jobs);
  let m = null;                                  // echo intensity around the circuit (central 256x256 radar px, every 2nd px)
  try {
    const d = g.getImageData(128, 128, 256, 256).data; m = new Uint8Array(128 * 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) m[y * 128 + x] = d[((y * 2) * 256 + x * 2) * 4 + 3];
  } catch {}
  // soften once here (2x upscale + blur) so the loop never needs a per-frame filter, even zoomed right in
  const soft = document.createElement("canvas"); soft.width = soft.height = 1024;
  const sg = soft.getContext("2d");
  sg.imageSmoothingEnabled = true; sg.imageSmoothingQuality = "high";
  if ("filter" in sg) sg.filter = "blur(1.4px)";
  sg.drawImage(c, 0, 0, 1024, 1024);
  const n = 2 ** ZR;
  const pxc = wx - tx0 * 256, pyc = wy - ty0 * 256;                 // the circuit inside the patch (radar pixels) and on the grid (cells)
  return { time: frame.time, c: soft, raw: c, m, px: pxc, py: pyc, cx: (pxc - 128) / 2, cy: (pyc - 128) / 2,
    x0: tx0 / n, y0: ty0 / n, span: 2 / n };                        // normalised Mercator rectangle
}
function getPatch(frame, lat, lon) {             // one download per scan, shared by the conditions and the map
  const key = `${lat},${lon},${frame.time}`;
  if (!patches.has(key)) {
    patches.set(key, radarPatch(frame, lat, lon));
    if (patches.size > 40) patches.delete(patches.keys().next().value);
  }
  return patches.get(key);
}
// Forecast picture `k` scans ahead: the latest scan carried along the motion field (backward trajectories on a
// coarse lattice, interpolated per pixel), then blurred more the further ahead it is.
function forecastPatch(p, F, k) {
  const n = 512, src = p.raw.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, n, n), out = new ImageData(n, n), sd = src.data, od = out.data;
  const L = 8, gn = n / L + 1, dx = new Float32Array(gn * gn), dy = new Float32Array(gn * gn);
  for (let j = 0; j < gn; j++) for (let i = 0; i < gn; i++) { const x = (i * L - 128) / 2, y = (j * L - 128) / 2, [ox, oy] = origin(F, x, y, k); dx[j * gn + i] = (ox - x) * 2; dy[j * gn + i] = (oy - y) * 2; }
  for (let Y = 0; Y < n; Y++) { const fj = Y / L, j = Math.min(gn - 2, Math.floor(fj)), b = fj - j;
    for (let X = 0; X < n; X++) { const fi = X / L, i = Math.min(gn - 2, Math.floor(fi)), a = fi - i, q = j * gn + i;
      const sx = X + dx[q] * (1 - a) * (1 - b) + dx[q + 1] * a * (1 - b) + dx[q + gn] * (1 - a) * b + dx[q + gn + 1] * a * b;
      const sy = Y + dy[q] * (1 - a) * (1 - b) + dy[q + 1] * a * (1 - b) + dy[q + gn] * (1 - a) * b + dy[q + gn + 1] * a * b;
      const xi = Math.round(sx), yi = Math.round(sy);
      if (xi < 0 || yi < 0 || xi >= n || yi >= n) continue;
      const si = (yi * n + xi) * 4, oi = (Y * n + X) * 4;
      od[oi] = sd[si]; od[oi + 1] = sd[si + 1]; od[oi + 2] = sd[si + 2]; od[oi + 3] = sd[si + 3]; } }
  const raw = document.createElement("canvas"); raw.width = raw.height = n; raw.getContext("2d").putImageData(out, 0, 0);
  const soft = document.createElement("canvas"); soft.width = soft.height = 1024;
  const sg = soft.getContext("2d"); sg.imageSmoothingEnabled = true; sg.imageSmoothingQuality = "high";
  if ("filter" in sg) sg.filter = `blur(${(1.4 + 0.55 * k).toFixed(1)}px)`;     // less detail is predictable further ahead
  sg.drawImage(raw, 0, 0, 1024, 1024);
  return { time: p.time + k * STEP, c: soft, x0: p.x0, y0: p.y0, span: p.span, lead: k * 10 };
}
// How the rain moved from frame a to frame b: the shift (in normalised Mercator units) that best lines a up
// with b, found by comparing the two echo grids over shifts of up to +-16 km. [0, 0] when there is too little
// rain to track or no shift is clearly better than none.
function motion(a, b) {
  if (!a?.m || !b?.m) return [0, 0];
  const A = a.m, B = b.m, N = 128, R = 6;
  let on = 0; for (let i = 0; i < A.length; i++) on += A[i] > 60;
  if (on < 40) return [0, 0];
  const cost = (dx, dy) => { let c = 0; for (let y = R; y < N - R; y++) for (let x = R; x < N - R; x++) c += Math.abs(A[y * N + x] - B[(y + dy) * N + x + dx]); return c; };
  let best = [0, 0], bc = cost(0, 0); const c0 = bc, grid = {};
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const c = dx || dy ? cost(dx, dy) : c0; grid[`${dx},${dy}`] = c; if (c < bc) { bc = c; best = [dx, dy]; } }
  if (bc > c0 * 0.93) return [0, 0];             // not clearly better than no movement
  const sub = (i) => {                           // parabola through the neighbours for a sub-pixel shift
    const d = i ? [0, 1] : [1, 0], l = grid[`${best[0] - d[0]},${best[1] - d[1]}`], r = grid[`${best[0] + d[0]},${best[1] + d[1]}`];
    if (l == null || r == null) return best[i];
    const den = l - 2 * bc + r; return best[i] + (den > 0 ? clamp((l - r) / (2 * den), -0.5, 0.5) : 0);
  };
  const px = 2 / (256 * 2 ** ZR);                // one grid step = 2 radar pixels
  return [sub(0) * px, sub(1) * px];
}

export async function mountRadar(host, { lat, lon, name, outline, onUpdate }) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const wrap = el("div", "wx-view"), cv = el("canvas"), ctl = el("div", "wx-ctl"), bar = el("div", "wx-bar"), stamp = el("div", "wx-stamp", "Loading radar…");
  cv.setAttribute("role", "img"); cv.setAttribute("aria-label", `Rain radar around ${name}. Use the buttons to zoom.`); cv.tabIndex = 0;
  const btn = (label, title, fn) => { const b = el("button", null, label); b.type = "button"; b.title = title; b.setAttribute("aria-label", title); b.addEventListener("click", fn); return b; };
  wrap.append(cv, stamp, ctl, bar); host.replaceChildren(wrap);
  const g = cv.getContext("2d");

  // geometry: circuit outline (lat/lon) in normalised Mercator, its centre and extent
  const track = (outline?.track || []).map(([a, b]) => norm(a, b)), other = (outline?.other || []).map((w) => w.map(([a, b]) => norm(a, b)));
  const pts = track.length ? track : [norm(lat, lon)];
  const bx0 = Math.min(...pts.map((p) => p[0])), bx1 = Math.max(...pts.map((p) => p[0])), by0 = Math.min(...pts.map((p) => p[1])), by1 = Math.max(...pts.map((p) => p[1]));
  const home = track.length ? [(bx0 + bx1) / 2, (by0 + by1) / 2] : norm(lat, lon);
  const kmNorm = 40075 * Math.cos((lat * Math.PI) / 180);       // km per unit of normalised x at this latitude
  let W = 640, H = 360, dpr = 1;
  const fitZoom = () => track.length ? clamp(Math.log2(Math.min(W / (bx1 - bx0), H / (by1 - by0)) / 256) - 0.55, 11, ZMAX) : 14;
  const view = { x: home[0], y: home[1], z: 9.6, tz: 9.6, tx: home[0], ty: home[1] };
  const PRESET = { circuit: () => fitZoom(), area: () => 9.6, region: () => ZMIN };

  let frames = [], pos = 0, playing = !reduced, hold = 0, raf = 0, last = 0, alive = true, dirty = true, weather = null;
  const need = () => { dirty = true; if (!raf && alive) raf = requestAnimationFrame(loop); };
  const px = (p) => [(p[0] - view.x) * 256 * 2 ** view.z + W / 2, (p[1] - view.y) * 256 * 2 ** view.z + H / 2];

  function size() {
    const w = Math.max(280, host.clientWidth || 640);
    W = w; H = Math.round(clamp(w * (w < 520 ? 0.95 : 0.6), 280, 520));   // taller on phones, where the controls overlay the map
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + "px";
    need();
  }
  function goto(z, x = view.tx, y = view.ty) {
    view.tz = clamp(z, ZMIN, ZMAX);
    const lim = 160 / kmNorm;                                   // keep the circuit within reach: +-160 km
    view.tx = clamp(x, home[0] - lim, home[0] + lim); view.ty = clamp(y, home[1] - lim, home[1] + lim);
    if (reduced) { view.z = view.tz; view.x = view.tx; view.y = view.ty; }
    need();
  }
  function zoomAt(dz, cx = W / 2, cy = H / 2) {                 // keep the point under the cursor fixed
    const z1 = clamp(view.tz + dz, ZMIN, ZMAX), k0 = 256 * 2 ** view.tz, k1 = 256 * 2 ** z1;
    const wx = view.tx + (cx - W / 2) / k0, wy = view.ty + (cy - H / 2) / k0;
    goto(z1, wx - (cx - W / 2) / k1, wy - (cy - H / 2) / k1);
  }

  function drawBase() {
    const zi = clamp(Math.round(view.z), 3, 17), n = 2 ** zi, s = 2 ** (view.z - zi) * 256;
    const x0 = view.x * n - W / 2 / s, y0 = view.y * n - H / 2 / s;
    for (let tx = Math.floor(x0); tx <= Math.floor(x0 + W / s); tx++) for (let ty = Math.floor(y0); ty <= Math.floor(y0 + H / s); ty++) {
      if (ty < 0 || ty >= n) continue;
      const X = (tx - x0) * s, Y = (ty - y0) * s, t = baseTile(zi, ((tx % n) + n) % n, ty, need);
      if (t.c) { g.drawImage(t.c, X, Y, s + 0.6, s + 0.6); continue; }
      for (let up = 1; up <= 5 && zi - up >= 3; up++) {         // not loaded yet: show the part of a loaded parent tile
        const f = 2 ** up, p = tiles.get(`${zi - up}/${Math.floor((((tx % n) + n) % n) / f)}/${Math.floor(ty / f)}`);
        if (p?.c) { const sub = 256 / f; g.drawImage(p.c, (((tx % n) + n) % n % f) * sub, (ty % f) * sub, sub, sub, X, Y, s + 0.6, s + 0.6); break; }
      }
    }
  }
  // timeline: 0..n-1 are radar frames; beyond n-1 the latest frame is carried along its measured motion up to now
  // forecast frames fc[0..LEADS-1] are +10 ... +60 min from the latest scan; "now" sits between the two
  let fc = [], skill = null;
  const nowPos = () => frames.length ? frames.length - 1 + clamp(Date.now() - frames[frames.length - 1].time, 0, LEADS * STEP) / STEP : 0;
  const end = () => fc.length ? Math.min(frames.length - 1 + LEADS, nowPos() + 6) : Math.max(0, frames.length - 1) + clamp(nowPos() - (frames.length - 1), 0, 1.5);   // one hour past now
  function drawRadar() {
    if (!frames.length) return;
    const n = frames.length, k = 256 * 2 ** view.z, layers = [];
    if (pos <= n - 1) {                           // each frame slides along the motion between them while they crossfade
      const i = Math.floor(pos), f = pos - i, a = frames[clamp(i, 0, n - 1)], b = frames[clamp(i + 1, 0, n - 1)], v = a.v || [0, 0];
      layers.push([a, 1 - f, f * v[0], f * v[1]], [b, f, -(1 - f) * v[0], -(1 - f) * v[1]]);
    } else if (fc.length) {                       // forecast: crossfade between the advected frames (the latest scan is lead 0)
      const e = pos - (n - 1), i = Math.floor(e), f = e - i, a = i ? fc[i - 1] : frames[n - 1], b = fc[Math.min(LEADS - 1, i)];
      layers.push([a, 1 - f, 0, 0], [b, f, 0, 0]);
    } else {                                      // forecast not built yet: the latest scan moved on by the latest overall motion
      const e = pos - (n - 1), v = frames[n - 2]?.v || [0, 0];
      layers.push([frames[n - 1], 1, e * v[0], e * v[1]]);
    }
    g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    for (const [fr, al, ox, oy] of layers) {
      if (!fr?.c || al <= 0.01) continue;
      g.globalAlpha = 0.9 * al;
      g.drawImage(fr.c, (fr.x0 + ox - view.x) * k + W / 2, (fr.y0 + oy - view.y) * k + H / 2, fr.span * k, fr.span * k);
    }
    g.restore();
  }
  function path(line, close) { g.beginPath(); line.forEach((p, j) => { const [X, Y] = px(p); j ? g.lineTo(X, Y) : g.moveTo(X, Y); }); if (close) g.closePath(); }
  function drawOverlay() {
    const k = 256 * 2 ** view.z, [cx, cy] = px(home), far = clamp((12.2 - view.z) / 1.2, 0, 1), near = 1 - far;
    g.lineJoin = g.lineCap = "round";
    if (far > 0.02) {                                           // distance rings in the wide views
      g.strokeStyle = `rgba(255,255,255,${0.32 * far})`; g.fillStyle = `rgba(255,255,255,${0.6 * far})`; g.lineWidth = 1; g.font = "500 11px ui-monospace, monospace";
      for (const r of [15, 40]) { const R = (r / kmNorm) * k; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.fillText(`${r} km`, cx + R * 0.71 + 4, cy - R * 0.71 - 4); }
    }
    if (track.length) {
      const wPit = clamp((view.z - 11) * 0.7, 0, 2.2), wTrk = clamp(1.4 + (view.z - 10) * 0.55, 1.4, 4.2);
      if (wPit > 0.3) { g.strokeStyle = "rgba(255,255,255,.38)"; g.lineWidth = wPit; other.forEach((w) => { path(w, false); g.stroke(); }); }
      path(track, true); g.strokeStyle = "rgba(8,9,12,.85)"; g.lineWidth = wTrk + 3.2; g.stroke();
      path(track, true); g.strokeStyle = "#fff"; g.lineWidth = wTrk; g.shadowColor = "rgba(255,59,59,.9)"; g.shadowBlur = 10 * near; g.stroke(); g.shadowBlur = 0;
    }
    if (far > 0.02 || !track.length) {                          // marker + name while the outline is too small to read
      g.globalAlpha = track.length ? far : 1;
      g.fillStyle = "#ff3b3b"; g.beginPath(); g.arc(cx, cy, 4.5, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.stroke();
      g.font = "600 12px system-ui, sans-serif"; g.lineWidth = 3; g.strokeStyle = "rgba(8,9,12,.9)"; g.strokeText(name, cx + 10, cy + 4); g.fillStyle = "#fff"; g.fillText(name, cx + 10, cy + 4);
      g.globalAlpha = 1;
    }
    // scale bar
    const kmPx = kmNorm / k, nice = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100].find((v) => v / kmPx >= 60) || 100, L = nice / kmPx;
    g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 2; g.beginPath(); g.moveTo(14, H - 54); g.lineTo(14 + L, H - 54); g.stroke();
    g.font = "500 11px ui-monospace, monospace"; g.fillStyle = "rgba(255,255,255,.8)"; g.fillText(nice < 1 ? `${nice * 1000} m` : `${nice} km`, 14, H - 60);
  }
  let scrub = null, playBtn = null;
  function label() {
    if (!frames.length) return;
    const n = frames.length, est = pos > n - 1 + 0.03, i = clamp(Math.round(pos), 0, n - 1);
    const i0 = clamp(Math.floor(pos), 0, n - 1), i1 = Math.min(n - 1, i0 + 1), f0 = pos - i0;
    const exact = !est && (f0 < 0.03 || f0 > 0.97);                       // on a real scan (within ~20 s)
    const when = est ? frames[n - 1].time + (pos - (n - 1)) * STEP : exact ? frames[i].time : Math.round((frames[i0].time + f0 * (frames[i1].time - frames[i0].time)) / 60000) * 60000;
    const dm = Math.round((when - Date.now()) / 60000);
    const t = dualTime(when, weather?.tz), tag = !est ? (!exact ? "<i class=\"mid\">between scans</i>" : i === n - 1 ? "<i>latest radar</i>" : "<i class=\"mid\">radar scan</i>") : dm >= 2 ? `<i class="fc">forecast +${dm} min</i>` : dm <= -2 ? "<i>estimate</i>" : "<i>now · estimate</i>";
    const html = t.same ? `<b>${t.mine}</b>${tag}` : `<span>Circuit</span><b>${t.track}</b>${tag}<br><span>You</span><b>${t.mine}</b>`;
    if (stamp.dataset.h !== html) { stamp.dataset.h = html; stamp.innerHTML = html; }
    if (scrub && document.activeElement !== scrub) scrub.value = String(pos);
    const e = end() || 1;                        // zones under the scrubber: scans | forecast, with a tick at now
    zones.style.setProperty("--obs", `${((n - 1) / e) * 100}%`); zones.style.setProperty("--now", `${(clamp(nowPos(), 0, e) / e) * 100}%`);
  }
  function loop(now) {
    raf = 0;
    if (!alive) return;
    if (!visible) { last = 0; dirty = true; return; }
    const dt = Math.min(64, now - (last || now)); last = now;
    let moving = false;
    const e = 1 - Math.exp(-dt / 110);                          // critically damped ease toward the target view
    for (const [a, b] of [["z", "tz"], ["x", "tx"], ["y", "ty"]]) {
      const d = view[b] - view[a];
      if (Math.abs(d) > (a === "z" ? 0.002 : 1e-9)) { view[a] += d * e; moving = true; } else view[a] = view[b];
    }
    if (playing && frames.length > 1) {
      if (hold > 0) hold -= dt;
      else { pos += dt / (pos > frames.length - 1 ? 700 : 520); if (pos >= end()) { pos = end(); hold = 2600; } }
      if (hold <= 0 && pos >= end()) pos = 0;
      moving = true;
    }
    if (moving || dirty) {
      dirty = false;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = "#0d0f14"; g.fillRect(0, 0, W, H);
      drawBase(); drawRadar(); drawOverlay(); label();
    }
    if (moving) raf = requestAnimationFrame(loop); else last = 0;
  }

  // controls
  ctl.append(btn("+", "Zoom in", () => zoomAt(1)), btn("−", "Zoom out", () => zoomAt(-1)));
  const presets = el("div", "wx-presets");
  for (const [k, t] of [["circuit", "Circuit"], ["area", "Area"], ["region", "Region"]]) presets.append(btn(t, `${t} view`, () => goto(PRESET[k](), home[0], home[1])));
  wrap.append(presets);
  const setPlay = (on) => { playing = on && frames.length > 1; playBtn.innerHTML = playing ? "❚❚" : "►"; playBtn.title = playing ? "Pause the radar loop" : "Play the radar loop"; playBtn.setAttribute("aria-label", playBtn.title); need(); };
  playBtn = btn("►", "Play the radar loop", () => { if (!playing && pos >= end() - 0.01) pos = 0; hold = 0; setPlay(!playing); });
  scrub = el("input"); scrub.type = "range"; scrub.min = "0"; scrub.step = "0.1";             // one step = one minute (a scan interval is 10) scrub.value = "0"; scrub.setAttribute("aria-label", "Radar time");
  scrub.addEventListener("input", () => { setPlay(false); pos = +scrub.value; need(); });
  const zones = el("div", "wx-zones", "<i></i><b></b>"), track2 = el("div", "wx-scrub");
  track2.append(scrub, zones); bar.append(playBtn, track2);

  // pointer: drag to pan, pinch or ctrl/cmd + wheel to zoom, double-click to zoom in
  const ptr = new Map(); let pinch = 0;
  cv.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch" && ptr.size === 0 && !e.isPrimary) return; ptr.set(e.pointerId, [e.offsetX, e.offsetY]); if (e.pointerType !== "touch" || ptr.size > 1) cv.setPointerCapture(e.pointerId); cv.classList.add("drag"); });
  cv.addEventListener("pointermove", (e) => {
    if (!ptr.has(e.pointerId)) return;
    const prev = ptr.get(e.pointerId); ptr.set(e.pointerId, [e.offsetX, e.offsetY]);
    const k = 256 * 2 ** view.z;
    if (ptr.size === 2) {
      const [a, b] = [...ptr.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) zoomAt(Math.log2(d / pinch), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      pinch = d; view.z = view.tz; return;
    }
    if (e.pointerType === "touch") return;                      // one finger scrolls the page
    goto(view.tz, view.tx - (e.offsetX - prev[0]) / k, view.ty - (e.offsetY - prev[1]) / k);
    view.x = view.tx; view.y = view.ty;                         // dragging follows the pointer exactly
  });
  const up = (e) => { ptr.delete(e.pointerId); pinch = 0; if (!ptr.size) cv.classList.remove("drag"); };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); cv.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !cv.hasPointerCapture(e.pointerId)) up(e); });
  cv.addEventListener("wheel", (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoomAt(-e.deltaY * (e.deltaMode ? 0.12 : 0.01), e.offsetX, e.offsetY); }, { passive: false });
  cv.addEventListener("dblclick", (e) => zoomAt(1, e.offsetX, e.offsetY));
  cv.addEventListener("keydown", (e) => {
    const k = { "+": 1, "=": 1, "-": -1, "_": -1 }[e.key], t = { ArrowLeft: -0.1, ArrowRight: 0.1 }[e.key];
    if (k) { e.preventDefault(); zoomAt(k); }
    if (t) { e.preventDefault(); setPlay(false); pos = clamp(Math.round((pos + t) * 10) / 10, 0, end()); need(); }     // step one minute
  });
  const ro = new ResizeObserver(size); ro.observe(host);
  let visible = true;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) need(); }); io.observe(wrap);
  size();

  // data: radar frames arrive in the background; the map is usable straight away. New frames are added as
  // they are published (watchWeather), keeping the last 12, without interrupting what the viewer is doing.
  let first = true;
  const have = new Map();                        // frame time -> patch
  async function sync(w) {
    weather = w;
    const fresh = w.frames.filter((f) => !have.has(f.time));
    const got = await Promise.all(fresh.map((f) => getPatch(f, lat, lon).catch(() => null)));
    if (!alive) return;
    got.filter(Boolean).forEach((p) => have.set(p.time, p));
    const keep = new Set(w.frames.map((f) => f.time));
    for (const t of [...have.keys()]) if (!keep.has(t)) have.delete(t);
    const atEnd = false, shift = frames.length ? frames.findIndex((f) => have.has(f.time)) : 0;
    frames = [...have.values()].sort((a, b) => a.time - b.time);
    if (!frames.length) { stamp.textContent = "Radar unavailable"; return; }
    for (let i = 0; i < frames.length - 1; i++) if (!frames[i].v || frames[i].vTo !== frames[i + 1].time) { frames[i].v = motion(frames[i], frames[i + 1]); frames[i].vTo = frames[i + 1].time; }
    scrub.max = String(end());
    if (first) { first = false; pos = nowPos(); hold = 2600; setPlay(!reduced); }       // open on "now", then play the loop
    else if (atEnd) { pos = clamp(pos - Math.max(0, shift), 0, end()); }
    else pos = clamp(pos - Math.max(0, shift), 0, end());                                // keep the same moment under the scrubber
    need(); onUpdate?.(w, { skill });
    // one-hour forecast from the motion of the last scans, built off the animation path one frame at a time
    const lastP = frames[frames.length - 1], grids = frames.map((f) => f.m);
    if (lastP?.raw && frames.length >= 2 && lastP.time !== builtFor) {
      builtFor = lastP.time;
      const F = flow(grids.slice(-4)), next = [];
      for (let k = 1; k <= LEADS; k++) { await new Promise((r) => setTimeout(r, 0)); if (!alive || builtFor !== lastP.time) return; next.push(forecastPatch(lastP, F, k)); }
      fc = next; scrub.max = String(end());
      await new Promise((r) => setTimeout(r, 0));
      try { skill = { m30: verify(grids, 3), m60: verify(grids, 6) }; } catch { skill = null; }
      need(); onUpdate?.(w, { skill });
    }
  }
  let builtFor = 0;
  // between radar frames the "now" estimate moves on by itself: refresh it every 20 seconds
  const nowTimer = setInterval(() => {
    if (!alive || !frames.length || document.hidden) return;
    const was = +scrub.max; scrub.max = String(end());
    need();
  }, 20000);
  const stopWatch = watchWeather({ lat, lon }, (w) => { sync(w); });
  weather = await getWeather({ lat, lon });
  if (!alive) { stopWatch(); return { weather, dispose() {} }; }
  if (!reduced && track.length) {                               // open on the circuit, then ease out to the area view
    view.z = view.tz = fitZoom(); need();
    setTimeout(() => { if (alive && view.tz === fitZoom()) goto(PRESET.area()); }, 1600);
  }
  return { weather, dispose() { alive = false; stopWatch(); clearInterval(nowTimer); cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); } };
}
