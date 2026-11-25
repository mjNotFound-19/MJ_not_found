// Runs the radar nowcast maths (nowcast.js) off the page's main thread, so scrolling never waits for it.
// Message in: { id, op, args }; out: { id, ok, v } or { id, ok: false, e }.
import * as nowcast from "./nowcast.js?v=9e5d7c6fd1";

onmessage = ({ data: { id, op, args } }) => {
  try { postMessage({ id, ok: true, v: nowcast[op](...args) }); }
  catch (e) { postMessage({ id, ok: false, e: String(e?.message || e) }); }
};
