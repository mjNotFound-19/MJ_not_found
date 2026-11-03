// Small physics helpers that give the 3D scenes weight. Scroll never moves a
// scene directly: it sets what the driver, rider or runner *wants*, and these
// integrate toward it with real limits, so motion builds, carries and fades.

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Frame time in seconds from a running clock, capped so a stalled tab (or the
// first frame) can't produce a huge jump.
export function frameDelta(state, t) {
  const dt = state.last ? Math.min(0.05, Math.max(0, t - state.last)) : 0;
  state.last = t;
  return dt;
}

// How fast the visitor is scrolling through a 0..1 progress value, smoothed
// over ~0.25 s so single wheel ticks don't read as bursts. Units: progress/s.
export function scrollRate(state, progress, dt) {
  if (dt <= 0) {
    state.prev = progress;
    return state.rate ?? 0;
  }
  const raw = (progress - (state.prev ?? progress)) / dt;
  state.prev = progress;
  const k = 1 - Math.exp(-dt / 0.25);
  state.rate = (state.rate ?? 0) + (raw - (state.rate ?? 0)) * k;
  return state.rate;
}

// One step of longitudinal motion toward `want` (m/s): acceleration fades as
// speed approaches the top speed (drag), braking is firmer than accelerating.
// Returns the acceleration used, for camera pitch.
export function drive(state, dt, want, { accel, brake, top }) {
  const v = state.v;
  let a;
  if (want > v) a = Math.min(accel * (1 - 0.7 * (v / top) ** 2), (want - v) / Math.max(dt, 1e-3));
  else a = Math.max(-brake, (want - v) / Math.max(dt, 1e-3));
  state.v = clamp(v + a * dt, 0, top);
  state.d += state.v * dt;
  // Smoothed acceleration: suspension doesn't react to single frames.
  const k = 1 - Math.exp(-dt / 0.3);
  state.a = (state.a ?? 0) + (a - (state.a ?? 0)) * k;
  return state.a;
}

// A six-speed sequential box: each gear tops out at the listed speed (m/s).
// Revs climb through each gear and drop on the upshift, like a real tacho.
const GEAR_TOPS = [19, 31, 42, 53, 64, 80];
export function gearbox(v) {
  if (v < 0.5) return { gear: 1, rpm: 1100 };
  const gear = Math.max(1, GEAR_TOPS.findIndex((top) => v < top) + 1 || 6);
  const top = GEAR_TOPS[gear - 1];
  const floor = gear === 1 ? 0 : GEAR_TOPS[gear - 2] * 0.98;
  const rpm = gear === 1 ? 1100 + (v / top) * 7600 : 5600 + ((v - floor) / (top - floor)) * 3200;
  return { gear, rpm: clamp(rpm, 1100, 8800) };
}

// Critically damped follow: `value` eases toward `target` with no overshoot,
// reaching ~95% in about 3 x `time` seconds. For cameras and slow dials.
export function follow(value, target, dt, time) {
  return value + (target - value) * (1 - Math.exp(-dt / time));
}
