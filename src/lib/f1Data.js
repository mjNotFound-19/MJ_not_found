import { F1_SNAPSHOT } from "./f1Snapshot";

// f1.h (manasjha.online/f1) publishes its forecast as JSON, same-origin. A copy
// lives in public/f1, so the dev server serves it too, but only by explicit
// file path: a bare /f1/ falls back to the portfolio's own index.html in dev.
export const F1_SITE = import.meta.env.DEV ? "/f1/index.html" : "/f1/";
const DATA_URL = "/f1/data/v3/site.json";

// Shape the (large) site data down to what the portfolio card shows.
function shape(d) {
  const n = d.next;
  const m = n.meta;
  const c = n.circuit;
  const top = [...n.drivers]
    .sort((a, b) => b.win - a.win)
    .slice(0, 5)
    .map((x) => ({
      code: x.Driver,
      team: x.Team,
      color: d.team_colors?.[x.Team] ?? "#9aa3b0",
      win: x.win,
      strategy: x.strategy,
    }));
  return {
    event: m.event,
    round: m.round,
    date: m.date,
    location: m.location,
    sims: m.n_sims,
    mode: m.mode,
    pSC: m.p_sc,
    laps: c.n_laps,
    pitLoss: c.pit_loss,
    // Same figure f1.h shows: each driver's chance of 2+ stops, averaged.
    twoPlus: n.drivers.reduce((sum, x) => sum + (x.stop2 ?? 0) + (x.stop3p ?? 0), 0) / n.drivers.length,
    top,
    track: n.track ? { w: n.track.w, h: n.track.h, points: n.track.points } : F1_SNAPSHOT.track,
  };
}

let cache = null;
export function loadF1() {
  if (!cache) {
    cache = fetch(DATA_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(shape)
      .catch(() => F1_SNAPSHOT);
  }
  return cache;
}

export { F1_SNAPSHOT };
