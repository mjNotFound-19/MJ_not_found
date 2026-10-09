// f1.h · race intelligence. Reads web/data/v3/site.json (written by `python -m flatout export`).

/* ------------------------------------------------------------------ reference data */
let TEAM = {   // replaced by official colours from the data bundle
  "Mercedes": "#00D7B6", "Red Bull Racing": "#4781D7", "Ferrari": "#ED1131", "McLaren": "#F47600",
  "Aston Martin": "#229971", "Alpine": "#00A1E8", "Williams": "#1868DB", "Racing Bulls": "#6C98FF",
  "Haas F1 Team": "#9C9FA2", "Audi": "#F50537", "Cadillac": "#909090"
};
const SHORT = { "Red Bull Racing": "Red Bull", "Haas F1 Team": "Haas", "Racing Bulls": "Racing Bulls", "Aston Martin": "Aston Martin" };
const ISO = {
  "Australia": "au", "China": "cn", "Japan": "jp", "United States": "us", "USA": "us", "Canada": "ca", "Monaco": "mc",
  "Spain": "es", "Austria": "at", "United Kingdom": "gb", "Great Britain": "gb", "UK": "gb", "Belgium": "be", "Hungary": "hu",
  "Netherlands": "nl", "Italy": "it", "Azerbaijan": "az", "Bahrain": "bh", "Singapore": "sg", "Mexico": "mx", "Brazil": "br",
  "Qatar": "qa", "United Arab Emirates": "ae", "UAE": "ae", "Abu Dhabi": "ae", "Saudi Arabia": "sa", "Malaysia": "my",
  "Portugal": "pt", "France": "fr", "Germany": "de", "Russia": "ru", "Turkey": "tr", "Vietnam": "vn", "Argentina": "ar", "South Africa": "za"
};
const MODE_LABEL = { pre_weekend: "Pre-weekend forecast", post_fp: "After practice", post_sprint: "After the sprint", post_quali: "After qualifying" };
const COMP = { S: "SOFT", M: "MEDIUM", H: "HARD", I: "INTERMEDIATE", W: "WET" };
const COMP_COLOR = { S: "#ef4444", M: "#facc15", H: "#f1f5f9", SOFT: "#ef4444", MEDIUM: "#facc15", HARD: "#f1f5f9" };
const ICON = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  sims: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h16M6 15l4-5 3 3 5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  laps: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  sc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15l2-5h14l2 5v3H3z M7 18v2M17 18v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" stroke="currentColor" stroke-width="2"/></svg>',
};

const state = { data: null, mode: "fan", tab: "race", sort: {}, accMode: "post_quali", raceIdx: null, dvcMode: "race", dvcDriver: null, teamSel: null };

/* ------------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
const teamColor = (t) => TEAM[t] || "#8b98a6";
const person = (d) => state.data?.people?.[d] || {};
const name = (d) => person(d).name || d;
const pct = (p, dp) => {
  if (p == null || isNaN(p)) return "-";
  if (p > 0 && p < 0.001) return "<0.1%";
  const v = p * 100;
  return v.toFixed(dp ?? (v < 10 ? 1 : 0)) + "%";
};
const fx = (v, d = 2) => (v == null || isNaN(v) ? "-" : Number(v).toFixed(d));
const sgn = (v, d = 2) => (v == null || isNaN(v) ? "-" : (v > 0 ? "+" : "") + Number(v).toFixed(d));
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nerd = () => state.mode === "nerd";
const clickable = (fn) => ({ onclick: fn, tabindex: "0", role: "button", onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } } });

/* image with a fallback chain: 2026 F1 photo -> older F1 headshot -> onFail() */
function chainImg(urls, attrs, onFail) {
  const list = urls.filter(Boolean);
  if (!list.length) { onFail && onFail(); return null; }
  const img = h("img", { ...attrs, src: list[0] });
  let i = 0;
  img.addEventListener("error", () => { i += 1; if (i < list.length) img.src = list[i]; else { img.remove(); onFail && onFail(); } });
  return img;
}
function avatar(code, size = 36, team) {
  const p = person(code), t = team || p.team;
  const box = h("span", { class: "avatar", style: `--team:${teamColor(t)};width:${size}px;height:${size}px` });
  const ini = h("span", { class: "ini", style: `font-size:${Math.round(size * 0.36)}px` }, code.slice(0, 3));
  const img = chainImg([p.photo, p.headshot], { alt: "", loading: "lazy", decoding: "async", width: size, height: size }, () => box.append(ini));
  if (img) box.append(img);
  return box;
}
function cutout(code, attrs = {}) {
  const p = person(code);
  return chainImg([p.cutout, p.headshot], { alt: attrs.alt ?? "", decoding: "async", ...attrs });
}
function teamLogo(team, size = 28) {
  const url = state.data?.team_logos?.[team];
  if (!url) return null;
  const img = h("img", { class: "tlogo", src: url, alt: `${team} logo`, loading: "lazy", style: `height:${size}px`, height: size });
  img.addEventListener("error", () => img.remove());
  return img;
}
function flag(country, cls = "") {
  const iso = ISO[country];
  if (!iso) return null;
  return h("img", { class: `flag ${cls}`, src: `https://flagcdn.com/w80/${iso}.png`, alt: `${country} flag`, loading: "lazy", width: 28, height: 19 });
}
function drvCell(code, team, sub, size = 34) {   // spans only: valid inside <button>
  return h("span", { class: "drv" }, avatar(code, size, team),
    h("span", { style: "min-width:0;display:block" }, h("span", { class: "code", style: "display:block" }, code), h("span", { class: "nm", style: "display:block" }, sub ?? name(code))));
}
function pbar(p, color, label) {
  const w = Math.max(0, Math.min(1, p || 0)) * 100;
  return h("span", { class: "pbar", style: `display:block;--c:${color || "var(--primary)"}` }, h("i", { style: `width:${w}%` }), h("span", {}, label ?? pct(p)));
}
const btn = (cls, onclick, style, ...kids) => h("button", { type: "button", class: cls, onclick, style }, ...kids);
function stagger(el) { el.classList.add("stagger"); [...el.children].forEach((c, i) => c.style.setProperty("--i", i)); return el; }
const em = (t) => h("em", {}, t);
// add sections to a page, skipping empty slots (Element.append would print "null")
const put = (root, ...kids) => root.append(...kids.filter((k) => k != null && k !== false));
function tyres(seq) {
  if (!seq) return h("span", { class: "muted" }, "-");
  const parts = seq.split("-"), nm = (c) => COMP[c] || "unknown tyre";
  const out = h("span", { class: "tyres", "data-tip": parts.map(nm).join(" → "), "aria-label": parts.map(nm).join(" then ") });
  parts.forEach((c, i) => { if (i) out.append(h("span", { class: "arrow", "aria-hidden": "true" }, "›")); out.append(h("span", { class: `tyre ${COMP[c] ? c : "U"}`, "aria-hidden": "true" }, COMP[c] ? c : "?")); });
  return out;
}
function panel(title, sub, ...kids) {
  return h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", {}, title, sub ? h("small", {}, sub) : null)), ...kids);
}
function stat(v, label, desc, cls = "") {
  return h("div", { class: `stat ${cls}` }, h("div", { class: "v", html: v }), h("div", { class: "l" }, label), desc ? h("div", { class: "d" }, desc) : null);
}
function sectionHead(title, text, right) {   // no eyebrow: the hero owns the only one (taste: eyebrow restraint)
  return h("div", { class: "section-head" }, h("div", {}, h("h1", {}, title), text ? h("p", {}, text) : null), right || null);
}
function countUp(el, to, fmt, ms = 900) {
  el.textContent = fmt(to);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || document.visibilityState !== "visible") return;
  const t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

function table(rows, cols, { key, onRow, initial } = {}) {
  const sk = (key && state.sort[key]) || initial || null;
  let data = rows.slice();
  if (sk) {
    const c = cols.find((c) => c.id === sk.id);
    if (c) data.sort((a, b) => {
      const va = (c.sort || c.val)(a), vb = (c.sort || c.val)(b);
      const na = va == null || Number.isNaN(va), nb = vb == null || Number.isNaN(vb);
      if (na && nb) return 0; if (na) return 1; if (nb) return -1;
      return (va > vb ? 1 : va < vb ? -1 : 0) * sk.dir;
    });
  }
  const vis = cols.filter((c) => !c.nerd || nerd());
  const thead = h("tr", {}, vis.map((c) => h("th", {
    class: [c.num ? "num" : "", key && c.val ? "sortable" : "", sk && sk.id === c.id ? "sorted" : ""].join(" "), scope: "col",
    "data-tip": c.tip || null, tabindex: key && c.val ? "0" : null,
    "aria-sort": sk && sk.id === c.id ? (sk.dir > 0 ? "ascending" : "descending") : null,
    onclick: key && c.val ? () => { const cur = state.sort[key]; state.sort[key] = { id: c.id, dir: cur && cur.id === c.id ? -cur.dir : (c.desc ? -1 : 1) }; rerender(); } : null,
  }, c.label, sk && sk.id === c.id ? (sk.dir > 0 ? " ▲" : " ▼") : "")));
  const tbody = h("tbody", {}, data.map((r) => h("tr", onRow ? { class: "click", ...clickable(() => onRow(r)) } : {},
    vis.map((c) => h("td", { class: c.num ? "num mono" : "" }, c.render ? c.render(r) : c.val(r))))));
  return h("div", { class: "table-wrap" }, h("table", {}, h("thead", {}, thead), tbody));
}

/* ------------------------------------------------------------------ svg charts */
const svgWrap = (w, ht, inner, label = "chart") => `<svg class="chart" viewBox="0 0 ${w} ${ht}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(label)}">${inner}</svg>`;
function lineChart({ series, labels, height = 240, width = 720, yFmt = (v) => fx(v, 3), yLabel = "", lowerBetter = false, invert = false, zero = false }) {
  const L = 64, R = series.some((x) => x.endLabel) ? 110 : 14, T = 14, B = 34, W = width - L - R, H = height - T - B;
  const all = series.flatMap((s) => s.values.filter((v) => v != null));
  let lo = Math.min(...all), hi = Math.max(...all);
  if (zero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  const pad = (hi - lo) * 0.12 || 0.01; lo -= pad; hi += pad;
  const x = (i) => L + (labels.length === 1 ? W / 2 : (i * W) / (labels.length - 1));
  const y = (v) => (invert ? T + ((v - lo) / (hi - lo)) * H : T + H - ((v - lo) / (hi - lo)) * H);
  let g = "";
  for (let k = 0; k <= 4; k++) { const v = lo + ((hi - lo) * k) / 4; g += `<line class="gridl" x1="${L}" x2="${L + W}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${yFmt(v)}</text>`; }
  if (zero) g += `<line class="axis" x1="${L}" x2="${L + W}" y1="${y(0)}" y2="${y(0)}"/>`;
  labels.forEach((l, i) => { if (labels.length <= 16 || i % 2 === 0) g += `<text x="${x(i)}" y="${height - 10}" text-anchor="middle">${esc(l)}</text>`; });
  if (yLabel) g += `<text x="12" y="${T + H / 2}" transform="rotate(-90 12 ${T + H / 2})" text-anchor="middle">${esc(yLabel)}${lowerBetter ? " (lower = better)" : ""}</text>`;
  const ends = [];
  for (const s of series) {
    const pts = s.values.map((v, i) => (v == null ? null : [x(i), y(v), v, i])).filter(Boolean);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width || 2.2}" stroke-linejoin="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ""} opacity="${s.opacity || 1}"/>`;
    for (const p of pts) g += `<circle cx="${p[0]}" cy="${p[1]}" r="${s.r || 3.6}" fill="${s.hollow ? "var(--bg)" : s.color}" stroke="${s.color}" stroke-width="2" data-tip="${esc(s.name)} · ${esc(labels[p[3]])}: ${yFmt(p[2])}"/>`;
    if (s.endLabel && pts.length) { const p = pts[pts.length - 1]; ends.push({ x: p[0] + 8, y: p[1] + 4, t: s.endLabel, c: s.color }); }
  }
  ends.sort((a, b) => a.y - b.y).forEach((e, i, arr) => { if (i && e.y - arr[i - 1].y < 15) e.y = arr[i - 1].y + 15; });   // keep end labels from colliding
  for (const e of ends) g += `<text x="${e.x}" y="${e.y}" style="fill:${e.c};font-weight:600">${esc(e.t)}</text>`;
  return svgWrap(width, height, g, yLabel);
}
function scatter({ points, max, height = 380, width = 420, xLabel, yLabel }) {
  const L = 44, R = 12, T = 12, B = 40, W = width - L - R, H = height - T - B;
  const x = (v) => L + ((v - 1) / (max - 1)) * W, y = (v) => T + ((v - 1) / (max - 1)) * H;
  let g = `<line class="axis" x1="${x(1)}" y1="${y(1)}" x2="${x(max)}" y2="${y(max)}" stroke-dasharray="4 4"/>`;
  for (let v = 1; v <= max; v += Math.ceil(max / 6)) g += `<text x="${x(v)}" y="${height - 22}" text-anchor="middle">P${v}</text><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">P${v}</text><line class="gridl" x1="${L}" x2="${L + W}" y1="${y(v)}" y2="${y(v)}"/>`;
  g += `<text x="${L + W / 2}" y="${height - 4}" text-anchor="middle">${esc(xLabel)}</text><text x="12" y="${T + H / 2}" transform="rotate(-90 12 ${T + H / 2})" text-anchor="middle">${esc(yLabel)}</text>`;
  for (const p of points) {
    g += p.ring ? `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="7" fill="none" stroke="${p.color}" stroke-width="2" data-tip="${esc(p.tip)}"/>`
      : `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="7" fill="${p.color}" stroke="#000" stroke-width=".8" data-tip="${esc(p.tip)}"/>`;
    g += `<text x="${x(p.x) + 10}" y="${y(p.y) + 4}" style="fill:var(--text-2);font-size:11px">${esc(p.label)}</text>`;
  }
  return svgWrap(width, height, g, "predicted vs actual finish");
}
function reliability(bins, color, title, width = 420, height = 340) {
  const L = 44, R = 10, T = 28, B = 38, W = width - L - R, H = height - T - B;
  const x = (v) => L + v * W, y = (v) => T + H - v * H;
  let g = `<text x="${L}" y="16" style="fill:var(--text);font-weight:600">${esc(title)}</text>`;
  for (let k = 0; k <= 4; k++) { const v = k / 4; g += `<line class="gridl" x1="${L}" x2="${L + W}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v * 100}%</text><text x="${x(v)}" y="${height - 20}" text-anchor="middle">${v * 100}%</text>`; }
  g += `<line class="axis" x1="${x(0)}" y1="${y(0)}" x2="${x(1)}" y2="${y(1)}" stroke-dasharray="4 4"/><text x="${L + W / 2}" y="${height - 3}" text-anchor="middle">predicted chance</text>`;
  const pts = (bins || []).filter((b) => b.n > 0), nmax = Math.max(...pts.map((b) => b.n), 1);
  g += `<path d="${pts.map((b, i) => `${i ? "L" : "M"}${x(b.predicted)},${y(b.observed)}`).join("")}" fill="none" stroke="${color}" stroke-width="2"/>`;
  for (const b of pts) g += `<circle cx="${x(b.predicted)}" cy="${y(b.observed)}" r="${3 + 9 * Math.sqrt(b.n / nmax)}" fill="${color}" fill-opacity=".35" stroke="${color}" data-tip="predicted ${pct(b.predicted)} → happened ${pct(b.observed)} (n=${b.n})"/>`;
  return svgWrap(width, height, g, `${title} calibration`);
}
function histogram(vals, { height = 150, width = 500, color = "var(--primary)" } = {}) {
  const L = 8, R = 8, T = 10, B = 24, W = width - L - R, H = height - T - B, n = vals.length, bw = W / n, mx = Math.max(...vals, 1e-9);
  let g = `<rect x="${L}" y="${T}" width="${bw * 3}" height="${H}" fill="rgba(251,191,36,.07)"/><rect x="${L + bw * 3}" y="${T}" width="${bw * 7}" height="${H}" fill="rgba(34,197,94,.05)"/>`;
  vals.forEach((v, i) => {
    const hh = (v / mx) * H;
    g += `<rect x="${L + i * bw + 1.5}" y="${T + H - hh}" width="${bw - 3}" height="${hh}" rx="2" fill="${color}" fill-opacity="${0.4 + 0.6 * (v / mx)}" data-tip="P${i + 1}: ${pct(v, 1)}"/>`;
    if (i === 0 || (i + 1) % 2 === 0) g += `<text x="${L + i * bw + bw / 2}" y="${height - 8}" text-anchor="middle">${i + 1}</text>`;
  });
  return svgWrap(width, height, g, "finishing position distribution");
}
function forest(rows, { key, se, unit = "", width = 640, rowH = 24 }) {
  const L = 70, R = 60, T = 18, B = 26, height = T + B + rows.length * rowH, W = width - L - R;
  const m = Math.max(...rows.flatMap((r) => [Math.abs(r[key] - 1.96 * (r[se] || 0)), Math.abs(r[key] + 1.96 * (r[se] || 0))])) * 1.05 || 1;
  const x = (v) => L + ((v + m) / (2 * m)) * W;
  let g = `<line class="axis" x1="${x(0)}" x2="${x(0)}" y1="${T - 6}" y2="${height - B + 4}"/>`;
  [-m, -m / 2, 0, m / 2, m].forEach((v) => { g += `<text x="${x(v)}" y="${height - 6}" text-anchor="middle">${sgn(v, 2)}</text>`; });
  rows.forEach((r, i) => {
    const yy = T + i * rowH + rowH / 2, c = teamColor(r.team);
    g += `<text x="${L - 10}" y="${yy + 4}" text-anchor="end" style="fill:var(--text);font-weight:600">${esc(r.Driver)}</text>`;
    g += `<line x1="${x(r[key] - 1.96 * (r[se] || 0))}" x2="${x(r[key] + 1.96 * (r[se] || 0))}" y1="${yy}" y2="${yy}" stroke="${c}" stroke-width="2" opacity=".6"/>`;
    g += `<circle cx="${x(r[key])}" cy="${yy}" r="5.5" fill="${c}" data-tip="${esc(r.Driver)}: ${sgn(r[key], 3)}${unit} ± ${fx(1.96 * (r[se] || 0), 3)} (95%)"/><text x="${width - R + 6}" y="${yy + 4}">${sgn(r[key], 2)}</text>`;
  });
  return svgWrap(width, height, g, "ratings with 95% intervals");
}
function degChart(c, width = 640, height = 260) {
  const L = 52, R = 14, T = 14, B = 34, W = width - L - R, H = height - T - B;
  const maxAge = Math.max(...Object.values(c.max_stint || { H: 45 })) + 5;
  const curve = (k, a) => { const over = Math.max(0, a - 0.9 * (c.max_stint?.[k] ?? 40)); return (c.offset?.[k] ?? 0) + (c.deg?.[k] ?? 0.05) * a + 0.04 * over * over; };
  const ks = ["SOFT", "MEDIUM", "HARD"], vals = ks.flatMap((k) => Array.from({ length: maxAge }, (_, a) => curve(k, a + 1)));
  const lo = Math.min(...vals), hi = Math.min(Math.max(...vals), lo + 5);
  const x = (a) => L + (a / maxAge) * W, y = (v) => T + H - ((Math.min(v, hi) - lo) / (hi - lo)) * H;
  let g = "";
  for (let k = 0; k <= 4; k++) { const v = lo + ((hi - lo) * k) / 4; g += `<line class="gridl" x1="${L}" x2="${L + W}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">+${fx(v - lo, 1)}s</text>`; }
  for (let a = 0; a <= maxAge; a += 10) g += `<text x="${x(a)}" y="${height - 14}" text-anchor="middle">${a}</text>`;
  g += `<text x="${L + W / 2}" y="${height - 1}" text-anchor="middle">tyre age (laps)</text>`;
  for (const k of ks) {
    g += `<path d="${Array.from({ length: maxAge }, (_, a) => `${a ? "L" : "M"}${x(a + 1).toFixed(1)},${y(curve(k, a + 1)).toFixed(1)}`).join("")}" fill="none" stroke="${COMP_COLOR[k]}" stroke-width="2.5"/>`;
    if (c.max_stint?.[k]) g += `<line x1="${x(c.max_stint[k])}" x2="${x(c.max_stint[k])}" y1="${T}" y2="${T + H}" stroke="${COMP_COLOR[k]}" stroke-dasharray="3 5" opacity=".5"/>`;
  }
  return svgWrap(width, height, g, "tyre degradation curves");
}
function radar(teams, axes, size = 420) {
  const cx = size / 2, cy = size / 2 + 6, r = size / 2 - 70, n = axes.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [cx + Math.cos(a) * r * v / 100, cy + Math.sin(a) * r * v / 100]; };
  let g = "";
  [25, 50, 75, 100].forEach((lv) => { g += `<polygon points="${axes.map((_, i) => pt(i, lv).join(",")).join(" ")}" fill="none" stroke="var(--border)" ${lv === 50 ? 'stroke-dasharray="4 4"' : ""}/>`; });
  axes.forEach(([, label], i) => {
    const [ex, ey] = pt(i, 100), [lx, ly] = pt(i, 122);
    g += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="var(--border)"/><text x="${lx}" y="${ly + 4}" text-anchor="middle" style="fill:var(--text-2);font-size:12px">${esc(label)}</text>`;
  });
  const dashes = ["", "6 4", "2 3"];
  teams.forEach((t, j) => {
    const c = teamColor(t.Team);
    g += `<polygon points="${axes.map(([k], i) => pt(i, t[k] ?? 50).join(",")).join(" ")}" fill="${c}" fill-opacity=".14" stroke="${c}" stroke-width="2.4" stroke-dasharray="${dashes[j] || ""}"/>`;
    axes.forEach(([k, label], i) => { const [px, py] = pt(i, t[k] ?? 50); g += `<circle cx="${px}" cy="${py}" r="4" fill="${c}" data-tip="${esc(t.Team)} · ${esc(label)}: ${fx(t[k], 0)}/100"/>`; });
  });
  return svgWrap(size, size + 12, g, "constructor comparison radar");
}

/* ------------------------------------------------------------------ RACE */
function flagWave(country) {
  const iso = ISO[country];
  if (!iso) return null;
  const N = 28, url = `url(https://flagcdn.com/w1280/${iso}.png)`;
  const wrap = h("div", { class: "flag-wave", "aria-hidden": "true" });
  for (let k = 0; k < N; k++) wrap.append(h("i", { style: `--k:${k};--n:${N};--flag:${url}` }));
  return wrap;
}
function renderRace(root) {
  const nx = state.data.next;
  if (!nx) return renderResult(root);          // between a race and the next forecast: show the result
  if (nx.sprint && sprintShown(nx)) return renderSprint(root, nx);   // sprint weekend: the sprint has its own forecast
  const m = nx.meta, c = nx.circuit, D = nx.drivers;
  // favourite, podium and win list can show the forecast from before the latest session (toggle in the hero)
  const prevF = nx.previous?.drivers?.length && SESSION_OF[m.mode] ? nx.previous : null;
  const before = !!prevF && state.raceView === "before";
  const byWin = (before ? prevF.drivers : D).slice().sort((a, b) => b.win - a.win);
  const date = m.date ? new Date(m.date + "T12:00:00") : null;

  const fav = byWin[0];
  const dateStr = date ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(date) : String(m.year);
  const hero = h("div", { class: "hero" }, flagWave(m.country),
    h("div", { class: "hero-copy" },
      h("div", { class: "eyebrow" }, flag(m.country, "sm"), `Round ${m.round}, ${dateStr}`),
      titleEl(m.event),
      venueEl(m),
      heroLine(before ? beforeLabel(m.mode) : MODE_LABEL[m.mode] || m.mode, `${Number(m.n_sims).toLocaleString()} simulated races`, `safety car ${pct(m.p_sc)}`,
        nerd() ? `grid ${m.grid_known ? "known" : "simulated"}` : null, m.status === "provisional" ? "provisional: first race here in the data" : null),
      kindToggle(nx),
      provisionalEl(m),
      h("div", { class: "hero-meta" }, countdownEl(m))),
    h("div", { class: "depth", "aria-hidden": "true" },
      h("span", {}, `${Number(m.n_sims).toLocaleString()} RACES`), h("span", {}, `RND_${String(m.round).padStart(2, "0")} // ${m.event.toUpperCase()}`), h("span", {}, `P(SC) ${pct(m.p_sc)}`)),
    h("div", { class: "hero-portrait" },
      cutout(fav.Driver, { loading: "eager", fetchpriority: "high", alt: `${name(fav.Driver)}, race favourite`, width: 480, height: 480 }),
      heroCarEl(fav),
      h("button", { type: "button", class: "tag", onclick: () => openDriver(fav.Driver), "aria-label": `Open ${name(fav.Driver)}` }, h("b", {}, pct(fav.win)), h("span", {}, `${name(fav.Driver)} to win`))));
  const marquee = marqueeEl(byWin.slice(0, 8));
  const podium = h("div", { class: "podium" }, [byWin[1], byWin[0], byWin[2]].map((d, i) => {
    const place = [2, 1, 3][i], p = person(d.Driver), big = h("span", {}, "0");
    const shot = h("div", { class: "shot" }, h("div", { class: "num", "aria-hidden": "true" }, place),
      cutout(d.Driver, { loading: "eager", width: 480, height: 480 }) || h("div", { class: "ini" }, d.Driver),
      h("div", { class: "who" }, h("div", { class: "code" }, d.Driver), h("div", { class: "name" }, `${name(d.Driver)} · ${d.Team}`)));
    countUp(big, d.win * 100, (v) => v.toFixed(1));
    return h("button", { class: `pod p${place}`, style: `--team:${teamColor(d.Team)}`, onclick: () => openDriver(d.Driver), "aria-label": `${name(d.Driver)}, ${pct(d.win)} to win` },
      shot, h("div", { class: "body" }, h("div", { class: "big" }, big, h("small", {}, "%")), h("div", { class: "lbl" }, "chance to win"),
        h("div", { class: "mini" }, h("span", {}, "Podium ", h("b", {}, pct(d.podium))), h("span", {}, "Avg finish ", h("b", {}, "P" + fx(d.exp_pos, 1))), nerd() && !before ? h("span", {}, "E[pts] ", h("b", {}, fx(d.exp_pts, 1))) : null)));
  }));

  const sc = 1 / Math.max(...byWin.map((x) => x.podium));
  const winList = stagger(h("div", { class: "stack", style: "gap:2px" }, (nerd() ? byWin : byWin.slice(0, 10)).map((d) => {
    const row = btn("rowbtn", () => openDriver(d.Driver), "grid-template-columns:150px 1fr;gap:12px;align-items:center;min-height:44px", drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team, 32));
    if (nerd() && !before) {
      const dd = nx.dist[d.Driver] || [];
      row.style.gridTemplateColumns = "150px 1fr 112px";
      row.append(h("div", { class: "pbar", "data-tip": `P1 ${pct(dd[0])} · P2 ${pct(dd[1])} · P3 ${pct(dd[2])}` },
        h("i", { style: `width:${dd[0] * sc * 100}%;background:var(--gold);border-radius:6px 0 0 6px` }),
        h("i", { style: `left:${dd[0] * sc * 100}%;width:${dd[1] * sc * 100}%;background:var(--silver);border-radius:0` }),
        h("i", { style: `left:${(dd[0] + dd[1]) * sc * 100}%;width:${dd[2] * sc * 100}%;background:var(--bronze);border-radius:0 6px 6px 0` })),
        h("span", { class: "mono", style: "text-align:right" }, pct(d.win), h("span", { class: "muted" }, ` / ${pct(d.podium)}`)));
    } else row.append(pbar(d.win / byWin[0].win, teamColor(d.Team), pct(d.win)));
    return row;
  })));
  const winPanel = panel(nerd() ? "Top-3 split" : "Who wins?", nerd() ? "P1 / P2 / P3 share · win / podium" : "chance of winning", winList,
    nerd() ? h("div", { class: "legend" }, h("span", {}, h("i", { style: "background:var(--gold)" }), "P1"), h("span", {}, h("i", { style: "background:var(--silver)" }), "P2"), h("span", {}, h("i", { style: "background:var(--bronze)" }), "P3")) : null);

  const cols = [
    { id: "rank", label: "#", val: (d) => d.rank, render: (d) => h("span", { class: "pos" }, d.rank) },
    { id: "drv", label: "Driver", val: (d) => d.Driver, render: (d) => drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team) },
    { id: "grid", label: "Grid", num: true, nerd: true, val: (d) => d.grid, render: (d) => (m.grid_known ? "P" + Math.round(d.grid) : "~" + fx(d.grid, 1)), tip: m.grid_known ? "starting slot" : "expected grid slot (qualifying simulated)" },
    { id: "exp", label: nerd() ? "E[pos]" : "Avg finish", num: true, val: (d) => d.exp_pos, render: (d) => "P" + fx(d.exp_pos, nerd() ? 2 : 1) },
    { id: "range", label: "P10-P90", nerd: true, val: (d) => d.p90 - d.p10, render: (d) => rangeBar(d, D.length), tip: "80% of simulated finishes fall in the bar; tick = median, ring = mean" },
    { id: "win", label: "Win", desc: true, val: (d) => d.win, render: (d) => pbar(d.win, teamColor(d.Team)) },
    { id: "pod", label: "Podium", desc: true, val: (d) => d.podium, render: (d) => pbar(d.podium, "var(--gold)") },
    { id: "pts", label: "Points", desc: true, val: (d) => d.points, render: (d) => pbar(d.points, "var(--good)"), tip: "chance of a top-10 finish" },
    { id: "dnf", label: "DNF", num: true, desc: true, nerd: true, val: (d) => d.dnf, render: (d) => pct(d.dnf) },
    { id: "ept", label: "E[pts]", num: true, desc: true, nerd: true, val: (d) => d.exp_pts, render: (d) => fx(d.exp_pts, 2) },
    { id: "pace", label: "Pace Δ%", num: true, nerd: true, val: (d) => d.pace_pct, render: (d) => `${sgn(d.pace_pct, 2)} ±${fx(d.pace_sd, 2)}`, tip: "predicted race pace vs field median (% of lap) ± model σ" },
    { id: "stops", label: "Stops 1/2/3", nerd: true, val: (d) => d.exp_stops, render: (d) => stopBar(d) },
    { id: "strat", label: "Likely strategy", val: (d) => d.strategy, render: (d) => h("span", {}, tyres(d.strategy), h("span", { class: "strat-txt" }, nerd() ? `L${fx(d.first_stop_p50, 0)}` : `${d.modal_stops ?? "?"}-stop · pit ~L${fx(d.first_stop_p50, 0)}`)) },
  ];
  // forecast from before the latest session: the switch sits with the numbers it changes, not in the hero
  const viewBar = prevF ? h("div", { class: "view-bar" },
    h("div", { class: "seg view-toggle", role: "group", "aria-label": "Which forecast to show" },
      [["now", afterLabel(m.mode)], ["before", beforeLabel(m.mode)]].map(([k, l]) => h("button", { type: "button", class: (k === "before") === before ? "on" : "",
        "aria-pressed": String((k === "before") === before), onclick: () => { state.raceView = k; rerender(); } }, l))),
    before ? h("p", { class: "view-note" }, `Showing the forecast from before ${SESSION_OF[m.mode]}. The full grid below is the latest forecast.`) : shiftLink(nx)) : null;
  put(root, hero, marquee, consoleEl(nx), viewBar,
    h("div", { class: "grid g-main" }, h("div", { class: "stack" }, podium, quickFacts(nx)), winPanel),
    garageOn() && state.data.constructors?.length ? h("div", { class: "mt" }, sectionHead(["The ", em("garage")], "All eleven 2026 cars in 3D. Drag to turn one around, or let it come apart and rebuild as the next."), garageEl(state.data.constructors)) : null,
    circuit3dEl(nx, fav),
    weatherEl(nx),
    h("div", { class: "mt" }, panel(nerd() ? "Simulated classification" : "The grid, predicted", nerd() ? "sortable · click a row for the driver file" : "tap a driver for details", table(D, cols, { key: "race", onRow: (d) => openDriver(d.Driver) }))));
  const shift = shiftPanel(nx);
  if (shift) put(root, h("div", { class: "mt", id: "shift" }, shift));
  if (nerd()) put(root, h("div", { class: "mt" }, heatmapPanel(nx)));
}
/* ------------------------------------------------------------------ SPRINT (sprint weekends carry two forecasts) */
const SPRINT_LABEL = { pre_weekend: "Pre-weekend forecast", post_sq: "After sprint qualifying" };
// which of the two is on screen: the visitor's pick, else the sprint from its qualifying until Grand Prix qualifying is in
function sprintShown(nx) {
  if (state.raceKind) return state.raceKind === "sprint";
  return nx.meta.mode !== "post_quali" && (nx.sprint.meta.mode === "post_sq" || !!nx.sprint.result);
}
function kindToggle(nx) {
  if (!nx.sprint) return null;
  const on = sprintShown(nx) ? "sprint" : "gp";
  const day = (iso) => (iso ? new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(new Date(iso)) : null);
  return h("div", { class: "seg kind-toggle", role: "group", "aria-label": "Which race of the weekend" },
    [["sprint", "Sprint", nx.sprint.start_utc], ["gp", "Grand Prix", nx.meta.sessions?.R]].map(([k, l, iso]) => h("button", { type: "button", class: k === on ? "on" : "",
      "aria-pressed": String(k === on), onclick: () => { state.raceKind = k; rerender(); } }, l, day(iso) ? h("small", {}, day(iso)) : null)));
}
function renderSprint(root, nx) {
  const sp = nx.sprint, m = nx.meta, sm = sp.meta, D = sp.drivers, rec = state.data.sprint_record;
  const F = Object.fromEntries(D.map((d) => [d.Driver, d])), byWin = D.slice().sort((a, b) => b.win - a.win), fav = byWin[0];
  const R = sp.result?.rows?.length ? sp.result.rows : null, win = R?.[0], lead = win || fav, N = sp.result?.n_laps || sm.n_laps;
  const when = sp.start_utc ? new Date(sp.start_utc) : null;
  const dateStr = when ? new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" }).format(when) : String(m.year);
  const sims = Number(sm.n_sims).toLocaleString(), place = (m.event || "").replace(/\s*Grand Prix.*$/i, "");
  const called = win && fav.Driver === win.Driver;
  const hero = h("div", { class: `hero${win ? " hero-result" : ""}`, style: win ? `--team:${teamColor(win.Team)}` : null }, flagWave(m.country),
    h("div", { class: "hero-copy" },
      h("div", { class: "eyebrow" }, flag(m.country, "sm"), `Round ${m.round} sprint, ${dateStr}`),
      h("h1", {}, place, em("Sprint")),
      venueEl(m),
      win ? heroLine("Sprint result", `${N} laps`, sp.result.wet ? "wet" : null,
        sp.result.sc + sp.result.red ? `${sp.result.sc} safety car${sp.result.sc === 1 ? "" : "s"}${sp.result.red ? `, ${sp.result.red} red flag${sp.result.red === 1 ? "" : "s"}` : ""}` : null,
        sp.result.provisional ? "provisional: official classification not published yet" : null)
        : heroLine(SPRINT_LABEL[sm.mode] || sm.mode, `${N} laps, no pit stops`, `safety car ${pct(sm.p_sc)}`, nerd() ? `${sims} sprints simulated` : null, nerd() ? `sprint grid ${sm.grid_known ? "known" : "simulated"}` : null),
      kindToggle(nx),
      win ? h("p", { class: "winner-line" }, h("b", {}, name(win.Driver)), ` won the sprint from P${win.grid}`, R[1] ? `, ahead of ${name(R[1].Driver)}` : "", R[2] ? ` and ${name(R[2].Driver)}` : "", ".")
        : h("div", { class: "hero-meta" }, countdownEl(m, sp.start_utc))),
    h("div", { class: "depth", "aria-hidden": "true" }, h("span", {}, win ? "SPRINT WINNER" : `${sims} SPRINTS`), h("span", {}, `RND_${String(m.round).padStart(2, "0")} // ${place.toUpperCase()} SPRINT`), h("span", {}, win ? name(win.Driver).toUpperCase() : `P(SC) ${pct(sm.p_sc)}`)),
    h("div", { class: "hero-portrait" },
      win ? confettiEl(teamColor(win.Team)) : null,
      cutout(lead.Driver, { loading: "eager", fetchpriority: "high", alt: `${name(lead.Driver)}, sprint ${win ? "winner" : "favourite"}`, width: 480, height: 480 }),
      heroCarEl(lead),
      win ? h("button", { type: "button", class: "tag winner", onclick: () => openDriver(win.Driver), "aria-label": `Open ${name(win.Driver)}` }, h("b", { html: `${TROPHY}Sprint winner` }), h("span", {}, `${name(win.Driver)} · ${SHORT[win.Team] || win.Team}`))
        : h("button", { type: "button", class: "tag", onclick: () => openDriver(fav.Driver), "aria-label": `Open ${name(fav.Driver)}` }, h("b", {}, pct(fav.win)), h("span", {}, `${name(fav.Driver)} to win the sprint`))));

  const aboutEl = h("p", { class: "explain" }, nerd()
    ? `Same pace models and lap-by-lap simulator as the Grand Prix, run over ${N} laps with a single no-stop plan per car and sprint points (8 to 1). ${sm.grid_known ? "Sprint grid from sprint qualifying, blended with the grid-to-finish prior." : "Sprint grid simulated from expected qualifying pace."}`
    : `A sprint is a short race: ${N} laps here against ${sm.race_laps} on Sunday, one set of tyres and no pit stop to plan around. So the start and the grid matter more than strategy. Points go to the top eight.`);
  const garage = () => (garageOn() && state.data.constructors?.length ? h("div", { class: "mt" }, sectionHead(["The ", em("garage")], "All eleven 2026 cars in 3D. Drag to turn one around, or let it come apart and rebuild as the next."), garageEl(state.data.constructors)) : null);
  const recordEl = rec ? h("p", { class: "explain" }, `On the ${rec.n} past sprints in the data, this forecast was closer than the sprint grid in ${rec.better}, and gave the eventual winner ${pct(rec.model_p_winner, 0)} on average against ${pct(rec.grid_p_winner, 0)} from the grid alone. `,
    "The margin is small and fifteen sprints cannot yet rule out luck.") : null;
  if (win) {
    const podium = h("div", { class: "podium" }, [R[1], R[0], R[2]].filter(Boolean).map((d) => {
      const f = F[d.Driver];
      return h("button", { class: `pod p${d.finish}`, style: `--team:${teamColor(d.Team)}`, onclick: () => openDriver(d.Driver), "aria-label": `${name(d.Driver)}, finished P${d.finish} in the sprint` },
        h("div", { class: "shot" }, h("div", { class: "num", "aria-hidden": "true" }, d.finish),
          cutout(d.Driver, { loading: "eager", width: 480, height: 480 }) || h("div", { class: "ini" }, d.Driver),
          h("div", { class: "who" }, h("div", { class: "code" }, d.Driver), h("div", { class: "name" }, `${name(d.Driver)} · ${d.Team}`))),
        h("div", { class: "body" }, h("div", { class: "big" }, h("span", {}, `P${d.finish}`)), h("div", { class: "lbl" }, `from P${d.grid} on the sprint grid`),
          f ? h("div", { class: "mini" }, h("span", {}, "Forecast win ", h("b", {}, pct(f.win))), h("span", {}, "podium ", h("b", {}, pct(f.podium)))) : null));
    }));
    const orderPanel = panel("Sprint order", "how they finished · places gained or lost from the sprint grid", stagger(h("div", { class: "stack", style: "gap:2px" }, R.map((d) => {
      const v = d.grid - d.finish;
      return btn("rowbtn order-row", () => openDriver(d.Driver), "", h("span", { class: "pos" }, d.classified ? d.finish : "DNF"), drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team, 32),
        h("span", { class: "mono", style: `color:${retired(d) ? "var(--muted)" : v > 0 ? "var(--good)" : v < 0 ? "var(--bad)" : "var(--muted)"}` }, retired(d) ? "" : v > 0 ? `▲ ${v}` : v < 0 ? `▼ ${-v}` : "="),
        h("span", { class: "mono order-pts" }, d.points ? `${fx(d.points, 0)} pts` : retired(d) ? "out" : ""));
    }))));
    const score = scoreEl(sp.result, R, F, { top: 8, made: SPRINT_LABEL[sm.mode] === SPRINT_LABEL.post_sq ? "after sprint qualifying" : "before the weekend", grid: "sprint grid" });
    if (recordEl) score.append(recordEl);
    const rows = R.map((d) => ({ d, f: F[d.Driver] }));
    put(root, hero, h("div", { class: "grid g-main" }, h("div", { class: "stack" }, podium, score), orderPanel), garage(), circuit3dEl(nx, win), weatherEl(nx),
      h("div", { class: "mt" }, panel("Sprint classification", "result against the sprint forecast · tap a driver for details", table(rows, [
        { id: "pos", label: "#", num: true, val: (r) => r.d.finish, render: (r) => h("span", { class: "mono" }, r.d.classified ? r.d.finish : "DNF") },
        { id: "drv", label: "Driver", val: (r) => r.d.Driver, render: (r) => drvCell(r.d.Driver, r.d.Team, SHORT[r.d.Team] || r.d.Team, 30) },
        { id: "grid", label: "Grid", num: true, val: (r) => r.d.grid, render: (r) => `P${r.d.grid}` },
        { id: "chg", label: "Places", num: true, desc: true, val: (r) => r.d.grid - r.d.finish, render: (r) => { const v = r.d.grid - r.d.finish; if (retired(r.d)) return h("span", { class: "mono muted" }, "-"); return h("span", { class: "mono", style: `color:${v > 0 ? "var(--good)" : v < 0 ? "var(--bad)" : "var(--muted)"}` }, v > 0 ? `▲ ${v}` : v < 0 ? `▼ ${-v}` : "="); } },
        { id: "fc", label: "Forecast", num: true, val: (r) => r.f?.exp_pos ?? 99, render: (r) => (r.f ? h("span", { class: "mono muted" }, `P${fx(r.f.exp_pos, 1)}`) : "-"), tip: "average finishing position in the simulated sprints" },
        { id: "miss", label: "vs forecast", num: true, val: (r) => (r.f ? r.f.exp_pos - r.d.finish : 0), render: (r) => { if (!r.f) return "-"; const v = r.f.exp_pos - r.d.finish;
          return h("span", { class: "mono", style: `color:${Math.abs(v) < 2 ? "var(--muted)" : v > 0 ? "var(--good)" : "var(--bad)"}` }, `${v > 0 ? "+" : ""}${fx(v, 1)}`); }, tip: "places better (+) or worse (−) than the forecast's average finish" },
        { id: "st", label: "Status", render: (r) => h("span", { class: "muted" }, retired(r.d) ? `Retired, lap ${r.d.laps_done}` : r.d.status || "") },
        { id: "pts", label: "Pts", num: true, desc: true, val: (r) => r.d.points, render: (r) => (r.d.points ? fx(r.d.points, 0) : "") }],
        { key: "sprint-result", onRow: (r) => openDriver(r.d.Driver) }))));
    return;
  }

  const podium = h("div", { class: "podium" }, [byWin[1], byWin[0], byWin[2]].map((d, i) => {
    const pl = [2, 1, 3][i], big = h("span", {}, "0");
    countUp(big, d.win * 100, (v) => v.toFixed(1));
    return h("button", { class: `pod p${pl}`, style: `--team:${teamColor(d.Team)}`, onclick: () => openDriver(d.Driver), "aria-label": `${name(d.Driver)}, ${pct(d.win)} to win the sprint` },
      h("div", { class: "shot" }, h("div", { class: "num", "aria-hidden": "true" }, pl),
        cutout(d.Driver, { loading: "eager", width: 480, height: 480 }) || h("div", { class: "ini" }, d.Driver),
        h("div", { class: "who" }, h("div", { class: "code" }, d.Driver), h("div", { class: "name" }, `${name(d.Driver)} · ${d.Team}`))),
      h("div", { class: "body" }, h("div", { class: "big" }, big, h("small", {}, "%")), h("div", { class: "lbl" }, "chance to win the sprint"),
        h("div", { class: "mini" }, h("span", {}, "Top 3 ", h("b", {}, pct(d.podium))), h("span", {}, "Avg finish ", h("b", {}, "P" + fx(d.exp_pos, 1))), nerd() ? h("span", {}, "E[pts] ", h("b", {}, fx(d.exp_pts, 1))) : null)));
  }));
  const upset = 1 - byWin.slice(0, 3).reduce((s, d) => s + d.win, 0), gp = Object.fromEntries(nx.drivers.map((d) => [d.Driver, d]));
  const mover = D.filter((d) => gp[d.Driver]).sort((a, b) => Math.abs(b.win - gp[b.Driver].win) - Math.abs(a.win - gp[a.Driver].win))[0];
  const facts = h("div", { class: "grid g-2" },
    stat(pct(fav.win), "Sprint favourite", `${name(fav.Driver)} still loses ${pct(1 - fav.win)} of the time`, "accent"),
    stat(pct(upset), "Surprise winner", "someone outside the top-3 favourites wins", "cyan"),
    stat(pct(sm.p_sc), "Safety car", `over ${N} laps; ${pct(m.p_sc)} over Sunday's ${sm.race_laps}`, ""),
    mover ? stat(`${sgn((mover.win - gp[mover.Driver].win) * 100, 1)}<small>%</small>`, "Biggest gap to Sunday", `${name(mover.Driver)}: ${pct(mover.win)} in the sprint, ${pct(gp[mover.Driver].win)} in the Grand Prix`, "") : null);
  const sc = 1 / Math.max(...byWin.map((x) => x.podium));
  const winList = stagger(h("div", { class: "stack", style: "gap:2px" }, (nerd() ? byWin : byWin.slice(0, 10)).map((d) => {
    const row = btn("rowbtn", () => openDriver(d.Driver), "grid-template-columns:150px 1fr;gap:12px;align-items:center;min-height:44px", drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team, 32));
    const dd = sp.dist?.[d.Driver];
    if (nerd() && dd) {
      row.style.gridTemplateColumns = "150px 1fr 112px";
      row.append(h("div", { class: "pbar", "data-tip": `P1 ${pct(dd[0])} · P2 ${pct(dd[1])} · P3 ${pct(dd[2])}` },
        h("i", { style: `width:${dd[0] * sc * 100}%;background:var(--gold);border-radius:6px 0 0 6px` }),
        h("i", { style: `left:${dd[0] * sc * 100}%;width:${dd[1] * sc * 100}%;background:var(--silver);border-radius:0` }),
        h("i", { style: `left:${(dd[0] + dd[1]) * sc * 100}%;width:${dd[2] * sc * 100}%;background:var(--bronze);border-radius:0 6px 6px 0` })),
        h("span", { class: "mono", style: "text-align:right" }, pct(d.win), h("span", { class: "muted" }, ` / ${pct(d.podium)}`)));
    } else row.append(pbar(d.win / byWin[0].win, teamColor(d.Team), pct(d.win)));
    return row;
  })));
  const winPanel = panel(nerd() ? "Top-3 split" : "Who wins the sprint?", nerd() ? "P1 / P2 / P3 share · win / top 3" : "chance of winning the sprint", winList, aboutEl, recordEl);
  const cols = [
    { id: "rank", label: "#", val: (d) => d.rank, render: (d) => h("span", { class: "pos" }, d.rank) },
    { id: "drv", label: "Driver", val: (d) => d.Driver, render: (d) => drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team) },
    { id: "grid", label: "Sprint grid", num: true, val: (d) => d.grid, render: (d) => (sm.grid_known ? "P" + Math.round(d.grid) : "~" + fx(d.grid, 1)), tip: sm.grid_known ? "starting slot for the sprint" : "expected sprint grid slot (sprint qualifying simulated)" },
    { id: "exp", label: nerd() ? "E[pos]" : "Avg finish", num: true, val: (d) => d.exp_pos, render: (d) => "P" + fx(d.exp_pos, nerd() ? 2 : 1) },
    { id: "range", label: "P10-P90", nerd: true, val: (d) => d.p90 - d.p10, render: (d) => rangeBar(d, D.length), tip: "80% of simulated finishes fall in the bar; tick = median, ring = mean" },
    { id: "win", label: "Win", desc: true, val: (d) => d.win, render: (d) => pbar(d.win, teamColor(d.Team)) },
    { id: "pod", label: "Top 3", desc: true, val: (d) => d.podium, render: (d) => pbar(d.podium, "var(--gold)") },
    { id: "pts", label: "Points", desc: true, val: (d) => d.points, render: (d) => pbar(d.points, "var(--good)"), tip: "chance of a top-eight finish (sprint points: 8 down to 1)" },
    { id: "dnf", label: "DNF", num: true, desc: true, nerd: true, val: (d) => d.dnf, render: (d) => pct(d.dnf) },
    { id: "ept", label: "E[pts]", num: true, desc: true, nerd: true, val: (d) => d.exp_pts, render: (d) => fx(d.exp_pts, 2) },
    { id: "pace", label: "Pace Δ%", num: true, nerd: true, val: (d) => d.pace_pct, render: (d) => `${sgn(d.pace_pct, 2)} ±${fx(d.pace_sd, 2)}`, tip: "predicted race pace vs field median (% of lap) ± model σ" },
  ];
  put(root, hero, marqueeEl(byWin.slice(0, 8)), h("div", { class: "grid g-main" }, h("div", { class: "stack" }, podium, facts), winPanel), garage(), circuit3dEl(nx, fav), weatherEl(nx),
    h("div", { class: "mt" }, panel(nerd() ? "Simulated sprint classification" : "The sprint, predicted", nerd() ? "sortable · click a row for the driver file" : "tap a driver for details", table(D, cols, { key: "sprint", onRow: (d) => openDriver(d.Driver) }))));
  if (nerd() && sp.dist) put(root, h("div", { class: "mt" }, heatmapPanel({ drivers: D, dist: sp.dist })));
}
// the forecast before and after the latest session (e.g. qualifying): how much that session moved it
const SHIFT_LABEL = { ...MODE_LABEL, pre_weekend: "Before practice" };
// before/after comparison is shown once qualifying is in (practice and sprint updates move the forecast too little)
const SESSION_OF = { post_quali: "qualifying" };
const afterLabel = (mode) => `After ${SESSION_OF[mode]}`, beforeLabel = (mode) => `Before ${SESSION_OF[mode]}`;
// the 3D garage is a work in progress: builds published without it switch it off (web/scripts/publish-portfolio.sh)
const garageOn = () => document.querySelector('meta[name="f1h-garage"]')?.content !== "off";
// Hero: the favourite's car, in 3D, in front of the driver (driver and car are one entry). Light version of the
// garage viewer: one car, the phone-size model, no post-processing, transparent over the hero.
function heroCarEl(fav) {
  if (state.heroCar) { state.heroCar.dispose(); state.heroCar = null; }
  if (!garageOn() || !fav) return null;          // with reduced motion the viewer holds the car still
  const S = state.data.standings?.drivers || [], ds = S.filter((d) => d.Team === fav.Team).slice(0, 2);
  const drivers = ds.map((d) => ({ code: d.Driver, name: name(d.Driver), number: person(d.Driver).number ?? "" }));
  const el = h("div", { class: "c3 hero-car", "aria-hidden": "true" });
  const start = () => import("./garage3d.js?v=2ff3b714ee").then((mod) => mod.mount(el, {
    teams: [{ team: fav.Team, label: SHORT[fav.Team] || fav.Team, color: teamColor(fav.Team), drivers, driver: Math.max(0, drivers.findIndex((d) => d.code === fav.Driver)) }],
    manifestUrl: "assets/cars/manifest.json?v=2ff3b714ee", start: 0, auto: false, quality: "mobile", view: { az: 0.74, tilt: 0.17, zoom: 0.93, sway: 0.14 } }))
    .then((c) => { if (!el.isConnected) { c.dispose(); return; } state.heroCar = c; el.classList.add("live"); })
    .catch((err) => { el.remove(); console.info("hero car unavailable:", err.message); });
  (window.requestIdleCallback || ((f) => setTimeout(f, 600)))(start);      // after the first paint
  return el;
}
function shiftStats(nx) {
  const P = nx.previous, cur = nx.meta.mode;
  if (!P?.drivers?.length || !SESSION_OF[cur]) return null;
  const before = Object.fromEntries(P.drivers.map((d) => [d.Driver, d]));
  const rows = nx.drivers.filter((d) => before[d.Driver]).map((d) => ({ d, b: before[d.Driver], moved: before[d.Driver].exp_pos - d.exp_pos }));
  if (!rows.length) return null;
  const session = SESSION_OF[cur];
  const fav = [...nx.drivers].sort((a, b) => b.win - a.win)[0];
  return { P, cur, before, rows, session, fav, avg: rows.reduce((s, r) => s + Math.abs(r.moved), 0) / rows.length };
}
// one line in the hero: how much the latest session moved the forecast; jumps to the full comparison
function shiftLink(nx) {
  const S = shiftStats(nx);
  if (!S) return null;
  const was = S.before[S.fav.Driver]?.win;
  return h("button", { type: "button", class: "shift-link", onclick: () => document.getElementById("shift")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
    h("b", {}, `${S.session[0].toUpperCase()}${S.session.slice(1)} moved the forecast`),
    h("span", {}, `avg ${fx(S.avg, 1)} places`),
    h("span", {}, `${S.fav.Driver} ${pct(was)} → ${pct(S.fav.win)} to win`),
    h("i", {}, "see what changed ↓"));
}
function shiftPanel(nx) {
  const P = nx.previous, cur = nx.meta.mode;
  if (!P?.drivers?.length || !SESSION_OF[cur]) return null;
  const before = Object.fromEntries(P.drivers.map((d) => [d.Driver, d]));
  const rows = nx.drivers.filter((d) => before[d.Driver]).map((d) => ({ d, b: before[d.Driver], moved: before[d.Driver].exp_pos - d.exp_pos }));
  if (!rows.length) return null;
  const session = SESSION_OF[cur];
  const avg = rows.reduce((s, r) => s + Math.abs(r.moved), 0) / rows.length;
  const up = rows.reduce((a, r) => (r.moved > a.moved ? r : a)), down = rows.reduce((a, r) => (r.moved < a.moved ? r : a));
  const arrow = (v) => h("span", { class: "mono", style: `color:${Math.abs(v) < 0.25 ? "var(--muted)" : v > 0 ? "var(--good)" : "var(--bad)"}` },
    Math.abs(v) < 0.25 ? "=" : `${v > 0 ? "▲" : "▼"} ${fx(Math.abs(v), 1)}`);
  const pp = (v) => (v > 0 ? "+" : "") + fx(v * 100, 0) + " pts";
  const favNow = [...nx.drivers].sort((a, b) => b.win - a.win)[0];   // favourite = highest win chance, as in the hero
  return panel(`What ${session} changed`, `${beforeLabel(cur)} vs ${afterLabel(cur).toLowerCase()} · expected finish and win chance`,
    h("div", { class: "grid g-4" },
      stat(fx(avg, 1), "Places moved", `average change in a driver's expected finish after ${session}`, "cyan"),
      stat(up.d.Driver, "Biggest riser", `${fx(up.b.exp_pos, 1)} → ${fx(up.d.exp_pos, 1)} expected finish`, ""),
      stat(down.d.Driver, "Biggest faller", `${fx(down.b.exp_pos, 1)} → ${fx(down.d.exp_pos, 1)} expected finish`, "accent"),
      stat(favNow.Driver, "Now favourite", `${pct(before[favNow.Driver]?.win)} → ${pct(favNow.win)} to win`, "")),
    h("div", { class: "mt" }, table(rows, [
      { id: "drv", label: "Driver", val: (r) => r.d.Driver, render: (r) => drvCell(r.d.Driver, r.d.Team, SHORT[r.d.Team] || r.d.Team, 28) },
      { id: "bp", label: beforeLabel(cur), num: true, val: (r) => r.b.exp_pos, render: (r) => h("span", { class: "mono muted" }, `P${fx(r.b.exp_pos, 1)} · ${pct(r.b.win)}`) },
      { id: "np", label: afterLabel(cur), num: true, val: (r) => r.d.exp_pos, render: (r) => h("span", { class: "mono" }, `P${fx(r.d.exp_pos, 1)} · ${pct(r.d.win)}`) },
      { id: "mv", label: "Places", num: true, desc: true, val: (r) => r.moved, render: (r) => arrow(r.moved) },
      { id: "wn", label: "Win chance", num: true, desc: true, val: (r) => r.d.win - r.b.win, render: (r) => h("span", { class: "mono muted" }, pp(r.d.win - r.b.win)) }],
      { key: "shift", onRow: (r) => openDriver(r.d.Driver) })));
}
function trackCard(nx) {
  const t = nx.track, c = nx.circuit, id = nx.meta.identity || {};
  if (!t) return h("div", { class: "trackcard nomap" },
    h("div", { class: "map nomap-box", "aria-hidden": "true" }, h("span", {}, "no map")),
    h("div", {}, h("div", { class: "k" }, "Circuit"), h("div", { class: "n" }, id.circuit_name || nx.meta.location),
      h("div", { class: "meta" }, h("span", {}, `${c.n_laps} laps`), id.length_km ? h("span", {}, `${fx(id.length_km, 3)} km`) : null,
        h("span", {}, "no recorded lap in 2024–26 data"))));
  const d = "M" + t.points.map((p) => p.join(",")).join(" L") + " Z";
  const pad = 60, vb = `${-pad} ${-pad} ${t.w + 2 * pad} ${t.h + 2 * pad}`;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = `<svg viewBox="${vb}" role="img" aria-label="${esc(nx.meta.location)} circuit map">
    <path class="line-bg" d="${d}"/><path class="line" pathLength="1" d="${d}" id="trk"/>
    ${nerd() ? t.corners.map((k) => `<text class="corner" x="${k.x + 18}" y="${k.y - 18}">${k.n}</text>`).join("") : ""}
    <circle r="16" fill="var(--primary)" stroke="#fff" stroke-width="5">${still ? "" : `<animateMotion dur="7s" repeatCount="indefinite" begin="2.6s"><mpath href="#trk"/></animateMotion>`}</circle></svg>`;
  return h("div", { class: "trackcard" }, h("div", { class: "map", html: svg }),
    h("div", {}, h("div", { class: "k" }, "Circuit"), h("div", { class: "n" }, nx.meta.location),
      h("div", { class: "meta" }, h("span", {}, `${c.n_laps} laps`), h("span", {}, `${t.corners.length} turns`), h("span", {}, `pit loss ${fx(c.pit_loss, 1)}s`),
        t.kind === "official_map_trace" ? h("span", { "data-tip": t.source }, "official layout \u00b7 no telemetry") : null)));
}
/* 3D circuit section: the reference lap as a speed-coloured ribbon (three.js, loaded when scrolled near) */
function circuit3dEl(nx, fav) {
  const t = nx.track, c = nx.circuit, m = nx.meta;
  if (t && !t.speed) return circuit3dLayout(nx, fav);
  if (!t || !t.speed) {
    const id = m.identity || {};
    return h("section", { class: "c3 c3-none", "aria-labelledby": "c3-title" },
      h("div", { class: "c3-hud" },
        h("div", { class: "c3-tl" }, h("span", {}, `CIRCUIT_${String(m.round).padStart(2, "0")}`), h("h2", { id: "c3-title" }, id.circuit_name || m.location)),
        h("p", { class: "c3-none-msg" }, `There is no recorded ${id.circuit_name || m.location} lap in the 2024–26 telemetry this site uses, `
          + "so no 3D circuit is drawn. The last Formula 1 race here predates FastF1 position data (2018 onwards). "
          + "A borrowed layout from another circuit would be misleading, so none is shown.")));
  }
  if (state.c3dispose) { state.c3dispose(); state.c3dispose = null; }
  const vmin = Math.min(...t.speed), vmax = Math.max(...t.speed);
  const elev = (Math.max(...t.z) / 1000) * t.scale_m;
  const lapStr = `${Math.floor(t.lap_time / 60)}:${(t.lap_time % 60).toFixed(3).padStart(6, "0")}`;
  const speedV = h("b", {}, "---"), speedBar = h("i");
  const stats = [["Length", `${fx(t.length_m / 1000, 3)} km`], ["Turns", t.corners.length], ["Elevation Δ", `${fx(elev, 1)} m`], ["Top speed", `${vmax} km/h`], ["Laps", c.n_laps]];
  if (nerd()) stats.push(["Min speed", `${vmin} km/h`], ["Pit loss", `${fx(c.pit_loss, 1)} s`]);
  const fallback = h("div", { class: "c3-fallback" }, trackCard(nx)?.querySelector(".map") || null);
  const el = h("section", { class: "c3", "aria-labelledby": "c3-title", style: `--team:${teamColor(fav.Team)}` },
    fallback,
    h("div", { class: "c3-labels", "aria-hidden": "true" }),
    h("div", { class: "c3-hud" },
      h("div", { class: "c3-tl" }, h("span", { "data-scramble": "" }, `CIRCUIT_${String(m.round).padStart(2, "0")}`), h("h2", { id: "c3-title" }, m.location)),
      h("dl", { class: "c3-tr" }, stats.map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, String(v))))),
      h("div", { class: "c3-bl" }, h("div", { class: "c3-speed", "aria-hidden": "true" }, h("span", {}, "Speed"), speedV, h("small", {}, "km/h"), h("div", { class: "c3-sbar" }, speedBar)),
        h("p", {}, nerd() ? `Reference: ${name(t.driver)}, fastest lap ${lapStr} (${t.source}). Ribbon = telemetry speed, height = elevation ×7.`
          : `${name(t.driver)}'s ${t.session === "Q" ? "pole lap from qualifying" : "fastest lap from last year"}, coloured by speed. Hills are exaggerated 7× so you can see them.`)),
      h("div", { class: "c3-br", "aria-hidden": "true" }, h("div", { class: "c3-legend" }, h("span", {}, `${vmin}`), h("i"), h("span", {}, `${vmax} km/h`)), h("span", { class: "c3-hint" }, "Drag to rotate"))));
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    import("./circuit3d.js?v=2ff3b714ee").then((mod) => mod.mount(el, t, {
      accent: teamColor(fav.Team),
      onSpeed: (v, k) => { speedV.textContent = v; speedBar.style.transform = `scaleX(${Math.max(0.04, k)})`; const [r, g, b] = mod.speedColor(k); speedBar.style.background = `rgb(${r * 255 | 0},${g * 255 | 0},${b * 255 | 0})`; },
    })).then((dispose) => { el.classList.add("live"); state.c3dispose = dispose; })
      .catch((err) => { el.classList.add("flat"); console.info("3D circuit unavailable, showing the flat map:", err.message); });
  }, { rootMargin: "400px 0px" });
  io.observe(el);
  return el;
}
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/* LCD that types its lines; screen readers get the final text once via a polite live region */
function lcdPrint(con, lines) {
  const lcd = con.querySelector(".c-lcd"), live = con.querySelector(".c-live");
  clearInterval(con._typer);
  lcd.innerHTML = "";
  const rows = lines.map((l) => { const d = h("div", { class: `ln ${l.dim ? "dim" : ""}` }); lcd.append(d); return [d, l.t]; });
  const cursor = h("span", { class: "cursor" });
  live.textContent = lines.map((l) => l.t).join(". ");
  if (reduced()) { rows.forEach(([d, t]) => { d.textContent = t; }); rows[rows.length - 1][0].append(cursor); return; }
  let r = 0, c = 0;
  con._typer = setInterval(() => {
    if (r >= rows.length) { clearInterval(con._typer); return; }
    const [d, t] = rows[r];
    d.textContent = t.slice(0, ++c);
    d.append(cursor);
    if (c >= t.length) { r += 1; c = 0; }
  }, 14);
}
// res: set after a race, when the console reads out the result (drivers carry finish, grid, points and their forecast `f`)
function consoleEl(nx, res = null) {
  const m = nx.meta, D = nx.drivers;
  const byWin = D.slice().sort(res ? (a, b) => a.finish - b.finish : (a, b) => b.win - a.win);
  const fin = (d) => (d.classified ? `P${d.finish}` : "DNF"), moved = (d) => { const v = d.grid - d.finish; return retired(d) ? "RETIRED" : v > 0 ? `+${v} PLACES` : v < 0 ? `${v} PLACES` : "HELD PLACE"; };
  const avg = (k) => D.reduce((a, d) => a + d[k], 0) / D.length;
  const angle = (v) => `${-135 + 270 * Math.max(0, Math.min(1, v))}deg`;
  const intro = res ? [
    { t: "F1.H RACE RESULT", dim: true },
    { t: `${m.event.toUpperCase()}  ${res.n_laps} LAPS` },
    { t: `STATUS: ${res.provisional ? "PROVISIONAL" : "OFFICIAL"}${res.wet ? "   WET RACE" : ""}` },
    { t: "> PRESS A DRIVER KEY", dim: true },
  ] : [
    { t: "F1.H SIM ENGINE v3" , dim: true },
    { t: `${m.event.toUpperCase()}  ${Number(m.n_sims).toLocaleString()} RACES` },
    { t: `STATUS: ${(MODE_LABEL[m.mode] || m.mode).toUpperCase()}` },
    { t: "> PRESS A DRIVER KEY", dim: true },
  ];
  const readout = (d) => res ? [
    { t: `> ${d.Driver}  ${name(d.Driver).toUpperCase()}`, dim: true },
    { t: `FINISHED ${fin(d)}   GRID P${d.grid}   ${moved(d)}${d.points ? `   ${fx(d.points, 0)} PTS` : ""}` },
    { t: d.f ? `FORECAST AVG P${fx(d.f.exp_pos, 1)}   WIN ${pct(d.f.win)}   PODIUM ${pct(d.f.podium)}` : "NO FORECAST FOR THIS DRIVER" },
    { t: `TYRES ${d.strategy || "-"}   ${Math.max(0, (d.strategy || "").split("-").length - 1)}-STOP   ${d.laps_done} LAPS` },
  ] : [
    { t: `> ${d.Driver}  ${name(d.Driver).toUpperCase()}`, dim: true },
    { t: `WIN ${pct(d.win)}   PODIUM ${pct(d.podium)}   POINTS ${pct(d.points)}` },
    { t: `AVG P${fx(d.exp_pos, 1)}   RANGE P${d.p10}-P${d.p90}   DNF ${pct(d.dnf)}` },
    { t: `PLAN ${d.strategy}   ${d.modal_stops}-STOP   PIT ~L${fx(d.first_stop_p50, 0)}` },
  ];
  const keys = h("div", { class: "c-cell c-keys", role: "group", "aria-label": "Driver keys" });
  const con = h("section", { class: "console", "aria-label": "Race engineer console" });
  const cam = camEl();
  let showDials = () => {};
  const select = (d) => {
    keys.querySelectorAll(".key").forEach((k) => k.setAttribute("aria-pressed", String(k.dataset.d === d.Driver)));
    cam.show(d);
    showDials(d);
    lcdPrint(con, readout(d));
  };
  const carNo = (d) => parseInt(person(d.Driver).number, 10) || 999;
  D.slice().sort((a, b) => carNo(a) - carNo(b)).forEach((d) => keys.append(h("button", { type: "button", class: "key", "data-d": d.Driver, style: `--team:${teamColor(d.Team)}`, "aria-pressed": "false",
    "aria-label": res ? `${name(d.Driver)}, ${d.classified ? `finished P${d.finish}` : "did not finish"}` : `${name(d.Driver)}, ${pct(d.win)} to win`, onclick: () => { stopAuto(); select(d); } }, h("i", { "aria-hidden": "true" }), h("em", { class: "kn", "aria-hidden": "true" }, person(d.Driver).number || ""), d.Driver, h("small", {}, res ? fin(d) : pct(d.win)))));
  const auto = h("button", { type: "button", class: "c-btn", "aria-pressed": "false" }, h("span", { class: "led", "aria-hidden": "true" }), "Autoplay");
  let idx = 0;
  function stopAuto() { clearInterval(con._auto); auto.setAttribute("aria-pressed", "false"); }
  auto.addEventListener("click", () => {
    if (auto.getAttribute("aria-pressed") === "true") return stopAuto();
    auto.setAttribute("aria-pressed", "true");
    const step = () => { select(byWin[idx % 10]); idx += 1; };
    step(); con._auto = setInterval(() => { if (!document.contains(con)) return clearInterval(con._auto); step(); }, 4200);
  });
  const dial = () => {
    const knob = h("div", { class: "knob", "aria-hidden": "true" }), b = h("b"), span = h("span");
    const el = h("div", { class: "dial" }, knob, b, span);
    const set = ([v, value, label, tip]) => {
      const a = angle(v);
      if (window.gsap && knob.style.getPropertyValue("--a")) gsap.to(knob, { "--a": a, duration: 1.1, ease: "elastic.out(1, 0.6)", overwrite: true });
      else knob.style.setProperty("--a", a);
      b.textContent = value; span.textContent = label; el.dataset.tip = tip;
    };
    return { el, set };
  };
  const margin = res ? 0 : byWin[0].win - byWin[1].win;
  const nFin = D.filter((d) => !retired(d)).length, mv = res ? D.reduce((a, d) => a + Math.abs(d.grid - d.finish), 0) / D.length : 0;
  const raceDials = res ? [
    [nFin / D.length, `${nFin}/${D.length}`, "Finishers", "cars running at the finish"],
    [Math.min(1, (res.sc + res.red) / 4), String(res.sc + res.red), "Safety cars", "safety cars and red flags in the race"],
    [Math.min(1, mv / 8), fx(mv, 1), "Places moved", "average places gained or lost from the grid"],
  ] : [
    [m.p_sc, pct(m.p_sc), "Safety car", "chance of at least one safety car or red flag"],
    [avg("stop2") + avg("stop3p"), pct(avg("stop2") + avg("stop3p")), "Two stops+", "share of cars making two or more stops"],
    [Math.min(1, margin / 0.2), `+${fx(margin * 100, 1)}`, "Fav. margin", "favourite's win chance minus the next driver's, in points"],
  ];
  const driverDials = (d) => res ? [
    [(D.length - d.finish) / (D.length - 1), fin(d), "Finished", `${name(d.Driver)}: finishing position`],
    [(D.length - d.grid) / (D.length - 1), `P${d.grid}`, "Grid", `${name(d.Driver)}: starting position`],
    [d.f ? (D.length - d.f.exp_pos) / (D.length - 1) : 0, d.f ? `P${fx(d.f.exp_pos, 1)}` : "-", "Forecast", `${name(d.Driver)}: average finishing position in the forecast`],
  ] : [
    [d.podium, pct(d.podium), "Podium", `${name(d.Driver)}: chance of a top-3 finish`],
    [d.points, pct(d.points), "Points", `${name(d.Driver)}: chance of finishing in the top 10`],
    [(D.length - d.exp_pos) / (D.length - 1), `P${fx(d.exp_pos, 1)}`, "Avg finish", `${name(d.Driver)}: average finishing position over all simulations`],
  ];
  const dials = [dial(), dial(), dial()];
  dials.forEach((x, i) => x.set(raceDials[i]));
  const dialBox = h("div", { class: "c-cell c-dials" }, dials.map((x) => x.el));
  showDials = (d) => { dialBox.style.setProperty("--knob", teamColor(d.Team)); dials.forEach((x, i) => x.set(driverDials(d)[i])); };
  con.append(h("div", { class: "console-grid" },
    cam.el,
    h("div", { class: "c-cell c-lcd", "aria-hidden": "true" }),
    dialBox,
    keys,
    h("div", { class: "c-foot" }, auto, h("span", { class: "c-brand" }, h("b", {}, "f1"), ".h race engineer"), h("span", {}, "keys = drivers by car number"))),
    h("p", { class: "sr-only c-live", "aria-live": "polite" }));
  lcdPrint(con, intro);
  // autoplay is the default: it starts once the console is on screen (after the intro has been read)
  const seen = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    seen.disconnect();
    setTimeout(() => { if (document.contains(con) && auto.getAttribute("aria-pressed") === "false" && !keys.querySelector('[aria-pressed="true"]')) auto.click(); }, 1800);
  }, { threshold: 0.4 });
  seen.observe(con);
  return con;
}
/* driver cam: a small CRT that cuts to whichever driver key is live (static burst between channels) */
function camEl() {
  const layer = h("div", { class: "cam-feed" });
  const tag = h("div", { class: "cam-tag" }, h("b", {}, "--"), h("span", {}, "no signal"));
  const num = h("div", { class: "cam-num", "aria-hidden": "true" });
  const el = h("div", { class: "c-cell c-cam idle", "aria-hidden": "true" },
    layer, num, h("div", { class: "cam-noise" }), h("div", { class: "cam-scan" }),
    h("div", { class: "cam-rec" }, h("i"), "CAM"), tag);
  let token = 0;
  const show = (d) => {
    const p = person(d.Driver), my = ++token;
    el.style.setProperty("--team", teamColor(d.Team));
    el.classList.remove("idle", "cut"); void el.offsetWidth; el.classList.add("cut");
    const img = cutout(d.Driver, { width: 240, height: 240 });
    const swap = () => {
      if (my !== token) return;
      layer.replaceChildren(img || h("div", { class: "ini" }, d.Driver));
      num.textContent = p.number || "";
      tag.replaceChildren(h("b", {}, d.Driver), h("span", {}, d.camTag || `${pct(d.win)} win`));
    };
    setTimeout(swap, reduced() ? 0 : 140);
  };
  return { el, show };
}
function marqueeEl(list) {
  const item = (d) => h("span", {}, d.Driver, h("i", {}, (name(d.Driver).split(" ").slice(-1)[0] || "")), h("b", {}, pct(d.win)));
  const track = h("div", { class: "marquee-track" }, list.map(item), list.map((d) => { const e = item(d); e.setAttribute("aria-hidden", "true"); return e; }));
  return h("div", { class: "marquee", role: "img", "aria-label": `Win chances: ${list.map((d) => `${d.Driver} ${pct(d.win)}`).join(", ")}` }, track);
}
/* split-flap (Solari) clock: each digit is a tile whose top half falls away to reveal the next digit */
function flapDigit(ch) {
  const half = (cls) => h("span", { class: cls, "aria-hidden": "true" }, h("span", {}, ch));
  const el = h("span", { class: "flap" }, half("fl-top"), half("fl-bottom"), half("fl-leaf fl-leaf-top"), half("fl-leaf fl-leaf-bottom"));
  el.dataset.v = ch;
  return el;
}
function flapTo(el, ch) {
  const old = el.dataset.v;
  if (old === ch) return;
  el.dataset.v = ch;
  const [top, bottom, leafTop, leafBottom] = el.children;
  const set = (node, v) => { node.firstChild.textContent = v; };
  if (reduced()) { [top, bottom, leafTop, leafBottom].forEach((n) => set(n, ch)); return; }
  set(top, ch);          // behind the falling leaf: next digit, upper half
  set(leafTop, old);     // falling leaf: current digit, upper half
  set(leafBottom, ch);   // rising leaf: next digit, lower half
  set(bottom, old);      // stays until the new lower half lands
  el.classList.remove("flipping"); void el.offsetWidth; el.classList.add("flipping");
  clearTimeout(el._t);
  el._t = setTimeout(() => { set(bottom, ch); set(leafTop, ch); el.classList.remove("flipping"); }, 620);
}
function countdownEl(m, iso = m.sessions && m.sessions.R) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  const units = [["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1]];
  const box = h("div", { class: "flipclock", role: "timer", "aria-label": "time to lights out" });
  const live = h("span", { class: "sr-only" });
  const groups = units.map(([label], i) => {
    const digits = h("span", { class: "fc-digits" }, flapDigit("0"), flapDigit("0"));
    const g = h("span", { class: "fc-group" }, digits, h("span", { class: "fc-label" }, label));
    if (i) box.append(h("span", { class: "fc-colon", "aria-hidden": "true" }, h("i"), h("i")));
    box.append(g);
    return digits;
  });
  box.append(live);
  const tick = () => {
    let s = Math.max(0, Math.floor((t - Date.now()) / 1000));
    if (s === 0) { box.innerHTML = '<span class="fc-go">Lights out</span>'; clearInterval(state.cd); return; }
    const vals = units.map(([, sec]) => { const v = Math.floor(s / sec); s %= sec; return v; });
    vals.forEach((v, i) => {
      const str = String(v).padStart(2, "0");
      const digits = groups[i];
      while (digits.children.length < str.length) digits.prepend(flapDigit("0"));   // 100+ days
      [...str].forEach((c, k) => flapTo(digits.children[k], c));
    });
    live.textContent = `${vals[0]} days ${vals[1]} hours ${vals[2]} minutes to lights out`;
  };
  tick(); clearInterval(state.cd); state.cd = setInterval(tick, 1000);
  return box;
}
function rangeBar(d, n) {
  const x = (p) => ((p - 1) / (n - 1)) * 100;
  return h("div", { class: "range", style: `--team:${teamColor(d.Team)}`, "data-tip": `P10 ${d.p10} · median ${d.p50} · P90 ${d.p90} · mean ${fx(d.exp_pos, 2)}` },
    h("div", { class: "track" }), h("div", { class: "span", style: `left:${x(d.p10)}%;width:${x(d.p90) - x(d.p10)}%` }), h("div", { class: "med", style: `left:${x(d.p50)}%` }), h("div", { class: "mean", style: `left:${x(d.exp_pos)}%` }));
}
function stopBar(d) {
  return h("div", { class: "stackbar", "data-tip": `1 stop ${pct(d.stop1)} · 2 stops ${pct(d.stop2)} · 3+ ${pct(d.stop3p)}` },
    h("i", { style: `width:${d.stop1 * 100}%;background:#60a5fa` }), h("i", { style: `width:${d.stop2 * 100}%;background:var(--data)` }), h("i", { style: `width:${d.stop3p * 100}%;background:#a78bfa` }));
}
function quickFacts(nx) {
  const D = nx.drivers, sorted = D.slice().sort((a, b) => b.win - a.win), fav = sorted[0];
  const upset = 1 - sorted.slice(0, 3).reduce((s, d) => s + d.win, 0), risky = D.slice().sort((a, b) => b.dnf - a.dnf)[0];
  const multi = D.reduce((s, d) => s + d.stop2 + d.stop3p, 0) / D.length;
  return h("div", { class: "grid g-2" },
    stat(pct(fav.win), "Favourite", `${name(fav.Driver)} still loses ${pct(1 - fav.win)} of the time`, "accent"),
    stat(pct(upset), "Surprise winner", "someone outside the top-3 favourites wins", "cyan"),
    stat(pct(multi), "Two stops or more", `${fx(D.reduce((s, d) => s + d.exp_stops, 0) / D.length, 2)} stops per car on average`, ""),
    stat(pct(risky.dnf), "Biggest DNF risk", `${name(risky.Driver)} (${risky.Team})`, ""));
}
function heatmapPanel(nx) {
  const D = nx.drivers, n = D.length, g = h("div", { class: "heat", style: `grid-template-columns:120px repeat(${n}, minmax(24px,1fr))` });
  g.append(h("div"));
  for (let p = 1; p <= n; p++) g.append(h("div", { class: "hh" }, p));
  for (const d of D) {
    g.append(h("div", { class: "hl" }, avatar(d.Driver, 22, d.Team), d.Driver));
    const row = nx.dist[d.Driver] || [];
    for (let p = 0; p < n; p++) {
      const v = row[p] || 0, a = Math.min(1, Math.sqrt(v / 0.5));
      g.append(h("div", { class: "hc", style: `background:rgba(${p < 3 ? "251,191,36" : p < 10 ? "56,189,248" : "220,38,38"},${a.toFixed(3)})`, "data-tip": `${d.Driver} finishes P${p + 1}: ${pct(v, 2)}` }, v >= 0.1 ? Math.round(v * 100) : ""));
    }
  }
  return panel("Finishing-position probability matrix", "every driver × every position · √-scaled colour · numbers ≥ 10%", h("div", { class: "table-wrap" }, g));
}

/* ------------------------------------------------------------------ DRIVER DRAWER */
function openDriver(code) {
  const nx = state.data.next, d = nx?.drivers.find((x) => x.Driver === code);
  const r = state.data.ratings.find((x) => x.Driver === code);
  const st = state.data.standings.drivers.find((x) => x.Driver === code);
  const dv = state.data.driver_vs_car.filter((x) => x.Driver === code).sort((a, b) => b.races - a.races)[0];
  const p = person(code), team = d?.Team || r?.team || st?.Team || p.team;
  const body = $("#drawer-body"); body.innerHTML = "";
  body.append(h("div", { class: "dhead", style: `--team:${teamColor(team)}` },
    h("div", { class: "num", "aria-hidden": "true" }, p.number || ""),
    cutout(code, { alt: `${name(code)}`, width: 480, height: 480 }),
    h("div", { class: "info" }, teamLogo(team, 26), h("div", { class: "code" }, code), h("div", { class: "name" }, name(code)), h("div", { class: "team" }, team))));
  if (d) {
    body.append(h("div", { class: "dstats" },
      h("div", {}, h("b", {}, pct(d.win)), h("span", {}, "win")), h("div", {}, h("b", {}, pct(d.podium)), h("span", {}, "podium")),
      h("div", {}, h("b", {}, "P" + fx(d.exp_pos, 1)), h("span", {}, "avg finish")), h("div", {}, h("b", {}, pct(d.dnf)), h("span", {}, "DNF"))));
    body.append(h("div", { class: "dsec" }, h("h4", {}, `${nx.meta.event}: where they finish`), h("div", { html: histogram(nx.dist[code] || [], { color: teamColor(team) }) }), h("p", { class: "sub" }, "gold zone = podium, green = points")));
    const alts = (d.alt_strategies || "").split(";").map((s) => s.trim()).filter(Boolean);
    body.append(h("div", { class: "dsec" }, h("h4", {}, "Strategy"), h("div", { class: "stack", style: "gap:8px" },
      h("div", {}, tyres(d.strategy), h("span", { class: "strat-txt" }, `most likely · ${pct(d.strategy_p)} of races`)),
      alts.map((a) => { const [s, q] = a.split(" "); return h("div", {}, tyres(s), h("span", { class: "strat-txt" }, q)); }),
      h("p", { class: "sub" }, `First stop around lap ${fx(d.first_stop_p50, 0)} (window L${fx(d.first_stop_p25, 0)}-L${fx(d.first_stop_p75, 0)}). 1-stop ${pct(d.stop1)}, 2-stop ${pct(d.stop2)}, 3+ ${pct(d.stop3p)}.`))));
    if (nerd()) body.append(h("div", { class: "dsec" }, h("h4", {}, "Model internals"), h("dl", { class: "kv" },
      h("dt", {}, "race pace Δ"), h("dd", {}, `${sgn(d.pace_pct, 3)} % ± ${fx(d.pace_sd, 3)}`), h("dt", {}, "expected grid"), h("dd", {}, fx(d.grid, 2)),
      h("dt", {}, "P10 / P50 / P90"), h("dd", {}, `${d.p10} / ${d.p50} / ${d.p90}`), h("dt", {}, "expected points"), h("dd", {}, fx(d.exp_pts, 3)), h("dt", {}, "expected stops"), h("dd", {}, fx(d.exp_stops, 3)))));
  }
  if (dv) body.append(h("div", { class: "dsec" }, h("h4", {}, "Driver vs car"),
    h("p", { class: "explain" }, `The ${dv.Team} was worth about `, h("b", {}, `P${fx(dv.car_expected, 1)}`), " on average; ", name(code), " finished ", h("b", {}, `P${fx(dv.actual, 1)}`), `: `,
      h("b", { style: `color:${dv.race_delta >= 0 ? "var(--good)" : "var(--bad)"}` }, `${sgn(dv.race_delta, 1)} places per race`), ` (beat the car in ${pct(dv.beat_car_pct)} of finishes).`)));
  if (r) {
    const metrics = [["race_pace", "Race pace", "s/lap"], ["quali_pace", "Quali pace", "s/lap"], ["starts", "Starts", "places"], ["execution", "Race craft", "places"], ["tyre_mgmt", "Tyre care", "ms/lap²"], ["consistency", "Consistency", "s"]];
    body.append(h("div", { class: "dsec" }, h("h4", {}, "Car-adjusted ratings vs the field"), metrics.map(([k, lbl, unit]) => {
      const m = Math.max(...state.data.ratings.map((x) => Math.abs(x[k] ?? 0))) || 1, v = r[k] ?? 0, w = (Math.abs(v) / m) * 50;
      return h("div", { class: "rrow", "data-tip": `${lbl}: ${sgn(v, 3)} ${unit}${nerd() ? ` ± ${fx(r[k + "_se"], 3)} (SE)` : ""}` },
        h("span", { class: "muted" }, lbl), h("div", { class: "rbar" }, h("span", { class: "mid" }), h("i", { style: `${v >= 0 ? "left:50%" : `left:${50 - w}%`};width:${w}%;background:${v >= 0 ? "var(--good)" : "var(--bad)"}` })),
        h("span", { class: "mono", style: "text-align:right" }, sgn(v, 2)));
    })));
  }
  if (st) body.append(h("div", { class: "dsec" }, h("h4", {}, `${state.data.season} season · ${st.points} pts`), resultStrip(st.results)));
  $("#drawer").classList.add("open"); $("#scrim").classList.add("open"); $("#drawer").setAttribute("aria-hidden", "false");
  document.dispatchEvent(new CustomEvent("drawer:open", { detail: { body } }));
  state.lastFocus = document.activeElement; $("#drawer-close").focus();
}
function closeDrawer() {
  $("#drawer").classList.remove("open"); $("#scrim").classList.remove("open"); $("#drawer").setAttribute("aria-hidden", "true");
  if (state.lastFocus && document.contains(state.lastFocus)) state.lastFocus.focus();
}
function resultStrip(results) {
  return h("div", { class: "strip" }, results.map((r) => {
    const cls = r.dnf ? "dnf" : r.finish === 1 ? "p1" : r.finish === 2 ? "p2" : r.finish === 3 ? "p3" : r.finish <= 10 ? "pts" : "";
    return h("i", { class: cls, "data-tip": `R${r.round}: ${r.dnf ? "DNF" : "P" + r.finish} (from P${r.grid})` }, r.dnf ? "×" : r.finish);
  }));
}

/* ------------------------------------------------------------------ RACE RESULT (between a race and the next forecast) */
const TROPHY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v3a5 5 0 01-10 0V4zM7 5H4v1a3 3 0 003 3M17 5h3v1a3 3 0 01-3 3M12 12v4M8.5 20h7M10 16h4v4h-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';
// confetti over the winner: a short burst in the team's colour and gold, then it settles (still with reduced motion)
function confettiEl(color) {
  const cv = h("canvas", { class: "confetti", "aria-hidden": "true" });
  if (reduced()) return cv;
  let tries = 0, run = 0;
  const begin = () => {
    // wait until the canvas is on the page and the start-lights intro has gone
    if (!cv.isConnected || document.querySelector(".lights-intro")) { if (tries++ < 1800) requestAnimationFrame(begin); return; }
    const W = (cv.width = cv.clientWidth || 600), H = (cv.height = cv.clientHeight || 500), g = cv.getContext("2d");
    if (!g) return;
    const my = ++run;                       // a replay supersedes a burst still falling
    const cols = [color, "#ffd75e", "#ffffff", "#ffb840", color], P = Array.from({ length: 150 }, (_, i) => ({
      x: W * (0.2 + 0.6 * Math.random()), y: H * (Math.random() * 0.9 - 0.45), vx: (Math.random() - 0.5) * 1.6, vy: 1.4 + Math.random() * 2.6,
      w: 5 + Math.random() * 6, hh: 8 + Math.random() * 8, r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.25, c: cols[i % cols.length], sway: Math.random() * 6.3 }));
    const t0 = performance.now(), LIFE = 9000;
    const step = (t) => {
      if (!cv.isConnected || my !== run) return;
      const age = t - t0, fade = Math.max(0, Math.min(1, (LIFE - age) / 1500));
      g.clearRect(0, 0, W, H);
      for (const q of P) {
        q.x += q.vx + Math.sin(age / 600 + q.sway) * 0.5; q.y += q.vy; q.r += q.vr;
        if (q.y > H + 20 && age < LIFE - 2500) { q.y = -20; q.x = W * (0.1 + 0.8 * Math.random()); }
        g.save(); g.translate(q.x, q.y); g.rotate(q.r); g.globalAlpha = 0.9 * fade; g.fillStyle = q.c; g.fillRect(-q.w / 2, -q.hh / 2 * Math.abs(Math.cos(q.r * 1.7)), q.w, q.hh * Math.abs(Math.cos(q.r * 1.7)) + 1); g.restore();
      }
      if (age < LIFE) requestAnimationFrame(step); else g.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(step);
  };
  setTimeout(begin, 700);
  cv.addEventListener("replay", begin);     // cv.dispatchEvent(new Event("replay")) fires the burst again
  return cv;
}
// retired from the race: not classified, or classified on distance (90% of the laps) after stopping
const retired = (d) => !d.classified || d.outcome === "classified_retirement";
function renderResult(root) {
  const L = state.data.last;
  if (!L?.results?.length) { put(root, h("div", { class: "empty" }, "No prediction yet. The next forecast appears before the race weekend.")); return; }
  const race = (state.data.races || []).find((r) => r.year === L.year && r.round === L.round);
  const fc = race?.predictions?.pre_race, F = Object.fromEntries((fc?.drivers || []).map((d) => [d.Driver, d]));
  const R = L.results, win = R[0], color = teamColor(win.Team), has = Object.keys(F).length > 0;
  const date = L.date ? new Date(L.date + "T12:00:00") : null;
  const dateStr = date ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(date) : String(L.year);
  const fav = has ? Object.values(F).sort((a, b) => b.win - a.win)[0] : null;
  const called = fav && fav.Driver === win.Driver;
  const hero = h("div", { class: "hero hero-result", style: `--team:${color}` }, flagWave(L.country),
    h("div", { class: "hero-copy" },
      h("div", { class: "eyebrow" }, flag(L.country, "sm"), `Round ${L.round}, ${dateStr}`),
      titleEl(L.title),
      h("div", { class: "venue" }, h("b", {}, L.circuit), ` · ${L.host_country}`),
      heroLine("Race result", `${L.n_laps} laps`, L.wet ? "wet" : null,
        L.sc + L.red ? `${L.sc} safety car${L.sc === 1 ? "" : "s"}${L.red ? `, ${L.red} red flag${L.red === 1 ? "" : "s"}` : ""}` : null,
        R.some(retired) ? `${R.filter(retired).length} retirement${R.filter(retired).length === 1 ? "" : "s"}` : null,
        L.provisional ? "provisional: official classification not published yet" : null),
      h("p", { class: "winner-line" }, h("b", {}, name(win.Driver)), ` won from P${win.grid}`,
        R[1] ? `, ahead of ${name(R[1].Driver)}` : "", R[2] ? ` and ${name(R[2].Driver)}` : "", ".")),
    h("div", { class: "depth", "aria-hidden": "true" }, h("span", {}, "WINNER"), h("span", {}, `RND_${String(L.round).padStart(2, "0")} // ${L.title.toUpperCase()}`), h("span", {}, name(win.Driver).toUpperCase())),
    h("div", { class: "hero-portrait" },
      confettiEl(color),
      cutout(win.Driver, { loading: "eager", fetchpriority: "high", alt: `${name(win.Driver)}, race winner`, width: 480, height: 480 }),
      heroCarEl(win),
      h("button", { type: "button", class: "tag winner", onclick: () => openDriver(win.Driver), "aria-label": `Open ${name(win.Driver)}` },
        h("b", { html: `${TROPHY}Winner` }), h("span", {}, `${name(win.Driver)} · ${SHORT[win.Team] || win.Team}`))));

  const podium = h("div", { class: "podium" }, [R[1], R[0], R[2]].filter(Boolean).map((d) => {
    const place = d.finish, f = F[d.Driver];
    return h("button", { class: `pod p${place}`, style: `--team:${teamColor(d.Team)}`, onclick: () => openDriver(d.Driver), "aria-label": `${name(d.Driver)}, finished P${place}` },
      h("div", { class: "shot" }, h("div", { class: "num", "aria-hidden": "true" }, place),
        cutout(d.Driver, { loading: "eager", width: 480, height: 480 }) || h("div", { class: "ini" }, d.Driver),
        h("div", { class: "who" }, h("div", { class: "code" }, d.Driver), h("div", { class: "name" }, `${name(d.Driver)} · ${d.Team}`))),
      h("div", { class: "body" }, h("div", { class: "big" }, h("span", {}, `P${place}`)), h("div", { class: "lbl" }, `from P${d.grid} on the grid`),
        f ? h("div", { class: "mini" }, h("span", {}, "Forecast win ", h("b", {}, pct(f.win))), h("span", {}, "podium ", h("b", {}, pct(f.podium)))) : null));
  }));

  // the finishing order, in the panel that shows the win chances before a race
  const orderPanel = panel("Race order", "how they finished · places gained or lost from the grid", stagger(h("div", { class: "stack", style: "gap:2px" }, R.map((d) => {
    const v = d.grid - d.finish;
    return btn("rowbtn order-row", () => openDriver(d.Driver), "", h("span", { class: "pos" }, d.classified ? d.finish : "DNF"), drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team, 32),
      h("span", { class: "mono", style: `color:${retired(d) ? "var(--muted)" : v > 0 ? "var(--good)" : v < 0 ? "var(--bad)" : "var(--muted)"}` }, retired(d) ? "" : v > 0 ? `▲ ${v}` : v < 0 ? `▼ ${-v}` : "="),
      h("span", { class: "mono order-pts" }, d.points ? `${fx(d.points, 0)} pts` : retired(d) ? "out" : ""));
  }))));
  // circuit map and live radar need the same fields as a forecast
  const px = L.meta ? { meta: L.meta, circuit: L.circuit_params || {}, track: L.track, geo: L.geo } : null;
  const con = consoleEl({ meta: { event: L.title }, drivers: R.map((d) => ({ ...d, strategy: (F[d.Driver]?.actual_strategy || d.strategy || "").split("-").map((c) => (COMP[c] ? c : "?")).join("-"), f: F[d.Driver], camTag: !d.classified ? "did not finish" : retired(d) ? `retired · P${d.finish}` : `finished P${d.finish}` })) }, L);
  put(root, hero, con, h("div", { class: "grid g-main" }, h("div", { class: "stack" }, podium, has ? scoreEl(L, R, F) : null), orderPanel),
    garageOn() && state.data.constructors?.length ? h("div", { class: "mt" }, sectionHead(["The ", em("garage")], "All eleven 2026 cars in 3D. Drag to turn one around, or let it come apart and rebuild as the next."), garageEl(state.data.constructors)) : null,
    px ? circuit3dEl(px, win) : null,
    px ? weatherEl(px) : null);
  // full classification against the forecast
  const rows = R.map((d) => ({ d, f: F[d.Driver] }));
  put(root, h("div", { class: "mt" }, panel("Classification", has ? "result against the forecast made after qualifying · tap a driver for details" : "tap a driver for details", table(rows, [
    { id: "pos", label: "#", num: true, val: (r) => r.d.finish, render: (r) => h("span", { class: "mono" }, r.d.classified ? r.d.finish : "DNF") },
    { id: "drv", label: "Driver", val: (r) => r.d.Driver, render: (r) => drvCell(r.d.Driver, r.d.Team, SHORT[r.d.Team] || r.d.Team, 30) },
    { id: "grid", label: "Grid", num: true, val: (r) => r.d.grid, render: (r) => `P${r.d.grid}` },
    { id: "chg", label: "Places", num: true, desc: true, val: (r) => r.d.grid - r.d.finish, render: (r) => { const v = r.d.grid - r.d.finish; if (retired(r.d)) return h("span", { class: "mono muted" }, "-"); return h("span", { class: "mono", style: `color:${v > 0 ? "var(--good)" : v < 0 ? "var(--bad)" : "var(--muted)"}` }, v > 0 ? `▲ ${v}` : v < 0 ? `▼ ${-v}` : "="); } },
    ...(has ? [{ id: "fc", label: "Forecast", num: true, val: (r) => r.f?.exp_pos ?? 99, render: (r) => (r.f ? h("span", { class: "mono muted" }, `P${fx(r.f.exp_pos, 1)}`) : "-"), tip: "average finishing position in the simulations" },
      { id: "miss", label: "vs forecast", num: true, val: (r) => (r.f ? r.f.exp_pos - r.d.finish : 0), render: (r) => { if (!r.f) return "-"; const v = r.f.exp_pos - r.d.finish;
        return h("span", { class: "mono", style: `color:${Math.abs(v) < 2 ? "var(--muted)" : v > 0 ? "var(--good)" : "var(--bad)"}` }, `${v > 0 ? "+" : ""}${fx(v, 1)}`); }, tip: "places better (+) or worse (−) than the forecast's average finish" }] : []),
    { id: "tyres", label: "Tyres used", render: (r) => tyres(r.f?.actual_strategy || r.d.strategy) },
    { id: "st", label: "Status", render: (r) => h("span", { class: "muted", "data-tip": r.d.outcome === "classified_retirement" ? `Stopped after ${r.d.laps_done} laps; classified because more than 90% of the race was completed` : null }, r.d.outcome === "classified_retirement" ? `Retired, lap ${r.d.laps_done}` : !r.d.classified ? `Retired, lap ${r.d.laps_done}` : r.d.status || "") },
    { id: "pts", label: "Pts", num: true, desc: true, val: (r) => r.d.points, render: (r) => (r.d.points ? fx(r.d.points, 0) : "") }],
    { key: "result", onRow: (r) => openDriver(r.d.Driver) }))));
  put(root, h("p", { class: "sub mt" }, "The forecast for the next race appears here before its weekend starts."));
}
// how the forecast did against this result
function scoreEl(L, R, F, { top = 10, made = "after qualifying", grid = "starting grid" } = {}) {
  const act = R.filter((d) => F[d.Driver]), byPod = Object.values(F).sort((a, b) => b.podium - a.podium).slice(0, 3).map((d) => d.Driver);
  const top3 = R.slice(0, 3).map((d) => d.Driver), hitPod = top3.filter((d) => byPod.includes(d)).length;
  const byExp = Object.values(F).sort((a, b) => a.exp_pos - b.exp_pos).slice(0, top).map((d) => d.Driver), top10 = R.slice(0, top).map((d) => d.Driver);
  const hitPts = top10.filter((d) => byExp.includes(d)).length;
  const mae = act.reduce((s, d) => s + Math.abs(F[d.Driver].exp_pos - d.finish), 0) / act.length, gmae = act.reduce((s, d) => s + Math.abs(d.grid - d.finish), 0) / act.length;
  const fav = Object.values(F).sort((a, b) => b.win - a.win)[0], win = R[0];
  return panel("How the forecast did", `the forecast made ${made}, against the result`,
    h("div", { class: "grid g-2" },
      stat(fav.Driver === win.Driver ? "Yes" : "No", "Winner called", `${name(win.Driver)} was given ${pct(F[win.Driver]?.win ?? 0)} to win`, fav.Driver === win.Driver ? "cyan" : "accent"),
      stat(`${hitPod}<small>/3</small>`, "Podium called", `forecast top three: ${byPod.join(", ")}`, hitPod === 3 ? "cyan" : ""),
      stat(`${hitPts}<small>/${top}</small>`, "Points finishers called", `from the ${top === 8 ? "eight" : "ten"} best average finishes in the forecast`, ""),
      stat(fx(mae, 1), "Places off, on average", `the ${grid} alone was ${fx(gmae, 1)} off`, mae <= gmae ? "cyan" : "accent")),
    h("p", { class: "explain" }, mae <= gmae ? "Across the whole field the forecast was closer to the result than the starting order." : "Across the whole field the starting order was closer to the result than the forecast.",
      L.wet ? " Rain is not modelled, so a wet race moves the order more than the simulation expects." : ""));
}
/* ------------------------------------------------------------------ STRATEGY */
function renderStrategy(root) {
  const nx = state.data.next;
  if (!nx) return put(root, h("div", { class: "empty" }, state.data.last ? `The ${state.data.last.title} is over. Strategy for the next race appears here once its forecast is made.` : "No prediction yet."));
  const c = nx.circuit, D = nx.drivers, N = c.n_laps, avg = (k) => D.reduce((s, d) => s + d[k], 0) / D.length;
  const expStops = avg("exp_stops"), pass = c.overtake_factor < 0.7 ? "Hard" : c.overtake_factor > 1.3 ? "Easy" : "Average";
  const pooled = nx.meta.status === "provisional" ? " (pooled estimate: no race here in our data)" : "";
  put(root, sectionHead(["Strategy, ", em(nx.meta.identity?.circuit || nx.meta.event.replace(/\s*Grand Prix$/i, ""))], "How the race is likely to be run: stops, tyres and pit windows, from the same simulations."),
    h("div", { class: "grid g-4" },
      stat(fx(expStops, 1), "Stops per car", `1-stop ${pct(avg("stop1"))} · 2-stop ${pct(avg("stop2"))} · 3+ ${pct(avg("stop3p"))}`, "cyan"),
      stat(`${fx(c.pit_loss, 1)}<small>s</small>`, "Pit stop cost", "time lost driving through the pit lane" + pooled, ""),
      stat(pct(nx.meta.p_sc), "Safety car chance", `${fx(c.sc_per_race, 2)} SC/red + ${fx(c.vsc_per_race, 2)} VSC per race here`, "accent"),
      stat(pass, "Overtaking", `${fx(c.overtake_factor, 2)}× an average track's passing rate` + pooled, "")));
  const reco = strategyRecoPanel(nx);
  const why = h("p", { class: "explain" }, h("b", {}, `Why ${expStops > 1.6 ? "two stops" : "one stop"}? `),
    `Tyres here lose about ${fx((c.deg?.MEDIUM ?? 0.05) * 1000, 0)} thousandths of a second per lap on the medium, and a stop costs ~${fx(c.pit_loss, 0)} s. `,
    expStops > 1.6 ? "Wear adds up fast enough that fresh tyres pay for the extra stop." : "Stopping again costs more than the wear it saves, so most teams run long stints.",
    ` A safety car (${pct(nx.meta.p_sc)} likely) makes stops cheaper and often rewrites the plan.`);
  const lanes = h("div", { class: "lanes" }, h("div", { class: "lane-axis" }, h("div"), h("div", {}, ...[1, Math.round(N / 4), Math.round(N / 2), Math.round((3 * N) / 4), N].map((l) => h("span", {}, "L" + l))), h("div")));
  for (const d of D) {
    const seq = (d.strategy || "M-H").split("-"), k = seq.length - 1, frac = c.stint_frac?.[k] || Array(k + 1).fill(1 / (k + 1));
    const track = h("div", { class: "lane-track" });
    let acc = 0;
    seq.forEach((cmp, i) => { const w = frac[i] * 100; track.append(h("div", { class: `lane-stint ${cmp}`, style: `left:calc(${acc}% + 1px);width:calc(${w}% - 2px)`, "data-tip": `${COMP[cmp]} · ~${Math.round(frac[i] * N)} laps` })); acc += w; });
    if (d.first_stop_p25 != null) track.append(h("div", { class: "lane-win", style: `left:${(d.first_stop_p25 / N) * 100}%;width:${((d.first_stop_p75 - d.first_stop_p25) / N) * 100}%`, "data-tip": `first stop window L${fx(d.first_stop_p25, 0)}-L${fx(d.first_stop_p75, 0)}` }));
    lanes.append(btn("lane rowbtn", () => openDriver(d.Driver), null, drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team, 30), track,
      h("span", { class: "strat-txt", style: "margin:0", "data-tip": `this exact compound order: ${pct(d.strategy_p)}` }, `${k}-stop · ${pct([null, d.stop1, d.stop2, d.stop3p][k])}`)));
  }
  const right = [panel("The strategy call", null, why)];
  const T = nx.meta.tyres || {};
  const fpView = !!(T.plans_practice && state.stratView === "practice");
  const plans = (fpView ? T.plans_practice : T.plans)?.filter((x, i, all) => all.findIndex((y) => y.stops === x.stops) === i),   // one row per stop count
    dyn = fpView ? T.dynamics_practice : T.dynamics;
  if (plans?.length) {
    // every plan's race time against the fastest one, from the tyre-wear model (no traffic, no safety car)
    const best = plans[0], label = (n) => `${n}-stop`, W = T.practice_wear;
    const toggle = T.plans_practice ? h("div", { class: "seg", role: "group", "aria-label": "Tyre wear used" },
      [["model", "Model"], ["practice", "If practice wear holds"]].map(([k, l]) => h("button", { type: "button", class: (k === "practice") === fpView ? "on" : "", "aria-pressed": String((k === "practice") === fpView),
        onclick: () => { state.stratView = k; rerender(); } }, l))) : null;
    right.unshift(panel("Strategy options", "race time vs the fastest plan · tyre wear and pit loss only", toggle, table(plans, [
      { id: "p", label: "Plan", render: (x) => h("span", {}, tyres(x.plan), h("span", { class: "strat-txt" }, label(x.stops))) },
      { id: "d", label: "vs fastest", num: true, render: (x) => (x.delta_s === 0 ? h("span", { class: "badge good" }, "fastest") : h("span", { class: "mono" }, `+${fx(x.delta_s, 1)}s`)) },
      { id: "w", label: "Pit window", render: (x) => h("span", { class: "mono", style: "display:grid;gap:2px;line-height:1.15", "data-tip": `stop laps if run as planned: ${x.stop_laps.join(", ")}; window = first stop within 1 s of this plan's best` },
        x.window ? `L${x.window[0]}-${x.window[1]}` : "-", x.box ? h("small", { class: "muted" }, `box L${x.box}`) : null) }]),
      h("p", { class: "sub" }, (() => {
        const other = plans.find((x) => x.stops !== best.stops);
        return other ? `${label(best.stops)} is fastest; ${label(other.stops)} costs about ${fx(other.delta_s, 1)} s over the race. ` +
          (other.stops > best.stops ? "It is the aggressive option: more stops, fresher tyres, more track position to win back." : "It is the conservative option: fewer stops, longer stints, more tyre management.") : "";
      })()),
      W?.estimate ? h("p", { class: "sub" }, fpView
        ? `Practice long runs (${W.n_stints}) say tyres wear faster here: ` + Object.entries(W.estimate).map(([k, v]) => `${k[0]} ${fx(v * 1000, 0)}`).join(" · ") +
          " ms/lap² against the model's " + Object.entries(W.prior).map(([k, v]) => `${k[0]} ${fx(v * 1000, 0)}`).join(" · ") +
          ". Practice wear has not yet proved more accurate than the model in testing (it is ahead on average but within noise), so the race predictions use the model."
        : "No race here in our data, so tyre wear is a pooled estimate. Switch to the practice view to see the plans if this weekend's long runs are right.") : null));
  }
  const setsEl = tyreSetsPanel(nx, fpView);
  const wxEl = weatherStrategyEl(nx, fpView);
  if (wxEl) right.unshift(wxEl);
  if (dyn) {
    const y = dyn, cls = y.kind === "undercut" ? "good" : y.kind === "overcut" ? "bad" : "";
    right.splice(1, 0, panel("Undercut or overcut?", `first flying lap on new tyres vs one more lap on the old set at lap ${y.at_lap}`,
      h("div", { class: "grid g-2" },
        stat(`${y.gain_s >= 0 ? "+" : ""}${fx(y.gain_s, 2)}<small>s</small>`, y.kind === "undercut" ? "Undercut track" : y.kind === "overcut" ? "Overcut track" : "Neutral", "gain for the car that stops first", cls === "good" ? "cyan" : cls === "bad" ? "accent" : ""),
        stat(`${y.warm_s >= 0 ? "+" : ""}${fx(y.warm_s, 2)}<small>s</small>`, "Tyre warm-up", y.n_stints ? `first lap on new tyres vs trend · ${y.n_stints} stops here` : "pooled from every circuit (no race here yet)", "")),
      h("p", { class: "explain" }, y.note, ` The old tyre has lost about ${fx(y.wear_s, 1)} s/lap by lap ${y.at_lap}; the new one is ${y.warm_s <= 0 ? "up to speed at once" : `${fx(y.warm_s, 2)} s off on its first lap`}. `,
        y.kind === "undercut" ? "Plans box at the start of their window." : y.kind === "overcut" ? "Plans box at the end of their window." : "Plans box mid-window.")));
  }
  if (nerd()) {
    right.push(panel("Degradation model", "lap-time loss vs tyre age · dashed = 97th-pct stint length", h("div", { html: degChart(c) }),
      h("div", { class: "legend" }, ["SOFT", "MEDIUM", "HARD"].map((k) => h("span", {}, h("i", { style: `background:${COMP_COLOR[k]}` }), `${k} ${fx(c.deg?.[k] * 1000, 0)} ms/lap · max ~${c.max_stint?.[k] ?? "?"}`)))));
    right.push(panel("Candidate plans", "time vs best plan under the deg model", table(nx.meta.strategies || [], [
      { id: "seq", label: "Plan", render: (s) => tyres(s.seq) }, { id: "st", label: "Stops", num: true, render: (s) => s.seq.split("-").length - 1 },
      { id: "lens", label: "Stint laps", render: (s) => h("span", { class: "mono muted" }, s.lens.join(" / ")) },
      { id: "d", label: "Δ time", num: true, render: (s) => (s.delta === 0 ? h("span", { class: "badge good" }, "best") : "+" + fx(s.delta, 1) + "s") }])));
    right.push(panel("Stop-count prior", "planned = season norm + venue offset", h("dl", { class: "kv" }, h("dt", {}, "planned stops μ"), h("dd", {}, fx(c.stops_mu, 2)),
      ...[1, 2, 3].flatMap((k) => [h("dt", {}, `P(${k} planned)`), h("dd", {}, pct(c.stops_dist?.[k]))]),
      ...[1, 2, 3].flatMap((k) => [h("dt", {}, `${k}-stop split`), h("dd", {}, (c.stint_frac?.[k] || []).map((f) => Math.round(f * 100) + "%").join(" / "))]))));
  }
  put(root, h("div", { class: "grid g-main mt" }, panel("Tyre plan by driver", "most likely plan · shaded = first-stop window", lanes,
    h("div", { class: "legend" }, ["S", "M", "H"].map((k) => h("span", {}, h("i", { style: `background:${COMP_COLOR[k]}` }), COMP[k])), h("span", {}, h("i", { style: "background:var(--data)" }), "pit window"))), h("div", { class: "stack" }, right)));
  if (setsEl) put(root, h("div", { class: "mt" }, setsEl));
  if (reco) put(root, h("div", { class: "mt" }, reco));
}
/* ------------------------------------------------------------------ LIVE WEATHER (web/weather.js) */
const WX_LABEL = { dry: "Dry", threat: "Showers nearby", wet: "Rain at the circuit" };
const WX_CLASS = { dry: "good", threat: "warn", wet: "bad" };
const lapClock = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
// The radar forecast for the circuit (one value per minute) in a sentence: when rain arrives or clears
function nowcastSummary(w) {
  const nc = (w.nowcast || []).filter((x) => x.t > Date.now() - 60000 && x.t <= Date.now() + 3600000);     // the hour ahead of now
  if (nc.length < 10) return null;
  const mins = (x) => Math.max(1, Math.round((x.t - Date.now()) / 60000)), wetNow = w.kind === "wet";
  const flip = nc.find((x) => x.wet !== wetNow), horizon = mins(nc[nc.length - 1]);
  if (wetNow) return flip ? { kind: "clearing", text: `rain clears in about ${mins(flip)} min`, at: flip.t } : { kind: "wet", text: `rain stays for the next ${horizon} min` };
  return flip ? { kind: "arriving", text: `rain arrives in about ${mins(flip)} min`, at: flip.t } : { kind: "dry", text: `no rain for the next ${horizon} min` };
}
// Race page: radar loop around the circuit + conditions now and for the next hours
function weatherEl(nx) {
  const G = nx.geo;
  if (!G) return null;
  if (state.radar) { state.radar.dispose(); state.radar = null; }
  const map = h("div", { class: "wx-map" }, h("div", { class: "wx-wait" }, "Loading radar…"));
  const stats = h("div", { class: "wx-stats" });
  const el = h("div", { class: "mt" }, panel("Live weather at the circuit", "rain radar: last two hours, now and a one-hour forecast, minute by minute · drag to move, pinch or ctrl + scroll to zoom",
    h("div", { class: "wx" }, map, stats),
    h("p", { class: "sub" }, "Radar: RainViewer · Map: © OpenStreetMap contributors · Conditions and forecast: Open-Meteo · Circuit outline: OpenStreetMap or f1-circuits (MIT). The timeline runs minute by minute: radar scans arrive every 10 minutes, the minutes between them are filled by moving the rain along its tracked motion, and the amber part is a one-hour forecast (block-correlation motion field, semi-Lagrangian advection, blurred as the lead time grows). It cannot predict showers growing or dying. Small showers can sit between radar pixels (about 1 km).")));
  import("./weather.js?v=2ff3b714ee").then((mod) => {
    let tz = null, timer = null;
    // live clocks: the circuit's local time and this device's time
    const clock = h("div", { class: "wx-clock" }), tick = () => {
      const c = mod.dualTime(Date.now(), tz, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      clock.replaceChildren(...(c.same ? [h("div", {}, h("span", {}, "Local time"), h("b", {}, c.mine))]
        : [h("div", {}, h("span", {}, "At the circuit"), h("b", {}, c.track)), h("div", {}, h("span", {}, "Your time"), h("b", {}, c.mine))]));
    };
    let skill = null;
    const show = (w, extra) => {                // runs now and whenever new radar or forecast data arrives
      if (extra?.skill) skill = extra.skill;
      const nc = nowcastSummary(w), sk = skill?.m30;
      tz = w.tz; tick(); if (!timer) timer = setInterval(tick, 1000);
      const hours = w.hours.slice(0, 6), mx = Math.max(0.5, ...hours.map((x) => x.mm));
      const HH = { hour: "numeric" }, hour = (t) => mod.dualTime(t, w.tz, HH);
      stats.replaceChildren(
      h("div", { class: `wx-now ${WX_CLASS[w.kind]}` }, h("b", {}, WX_LABEL[w.kind]),
        h("span", {}, w.precipNow >= 0.05 ? `${fx(w.precipNow * 4, 1)} mm/h now` : w.kind === "wet" ? "shower on radar" : "no rain now", w.temp != null ? ` · ${fx(w.temp, 0)}°C` : "", w.wind != null ? ` · wind ${fx(w.wind, 0)} km/h` : "")),
      h("dl", { class: "kv" },
        h("dt", {}, "Nearest rain on radar"), h("dd", {}, w.nearestKm == null ? "none in range" : w.nearestKm < 2 ? "over the circuit" : `${fx(w.nearestKm, 0)} km away`),
        h("dt", {}, "Radar forecast, next hour"), h("dd", {}, nc ? nc.text : "building…"),
        h("dt", {}, "Rain chance, next 2 h"), h("dd", {}, w.prob2h == null ? "-" : `${fx(w.prob2h, 0)}%`),
        h("dt", {}, "Radar frame"), h("dd", {}, w.radarTime ? ((t) => (t.same ? t.mine : `${t.track} circuit · ${t.mine} yours`))(mod.dualTime(w.radarTime, w.tz)) : "-")),
      clock,
      hours.length ? h("div", { class: "wx-hours", role: "img", "aria-label": "Rain chance for the next hours, in circuit time" }, hours.map((x) => h("div", { "data-tip": `${hour(x.t).text}: ${x.prob ?? "?"}% chance, ${fx(x.mm, 1)} mm` },
        h("i", { style: `height:${Math.max(4, (x.mm / mx) * 100)}%` }), h("b", {}, x.prob == null ? "-" : `${x.prob}%`), h("span", {}, hour(x.t).track || hour(x.t).mine)))) : null,
      hours.length && !hour(hours[0].t).same ? h("p", { class: "sub", style: "margin-top:6px" }, "Hours are circuit time; hover a bar for your time.") : null,
      sk ? h("p", { class: "sub", style: "margin-top:6px", "data-tip": "Critical success index: rain areas forecast correctly ÷ (correct + missed + false alarms), over the last two hours of scans" },
        `Forecast check, last two hours: ${fx(sk.csi * 100, 0)}% of rain areas right at +30 min (${fx(sk.persistence * 100, 0)}% if the rain had simply stayed put)${skill.m60 ? `; ${fx(skill.m60.csi * 100, 0)}% at +60 min` : ""}.`) : null);
    };
    return mod.mountRadar(map, { ...G, onUpdate: show }).then((r) => { show(r.weather); state.radar = { dispose() { clearInterval(timer); r.dispose(); } }; });
  }).catch((err) => { map.replaceChildren(h("div", { class: "wx-wait" }, "Live radar unavailable right now.")); console.info("weather:", err.message); });
  return el;
}
/* ------------------------------------------------------------------ WEATHER TYRE PLAN
   Rule-based, from the rain forecast for the race window (15-minute steps) plus the live radar:
     wet lap   = rain of WET_MMH or more in that lap's slot (or rain on the radar right now)
     drying    = DRY_LAPS laps after the rain stops, still on intermediates
     dry laps  = the fastest dry plan for the laps that are left, with the sets each driver has
   The two-compound rule only applies when no wet-weather tyre is used. No simulation is involved. */
const WET_MMH = 0.3, FULL_WET_MMH = 6, DRY_LAPS = 6, WET_LAP = 1.13;
function nearestNowcast(w, t) {
  const nc = w.nowcast || [];
  if (!nc.length || t < nc[0].t - 60000 || t > nc[nc.length - 1].t + 60000) return null;
  return nc[Math.max(0, Math.min(nc.length - 1, Math.round((t - nc[0].t) / 60000)))];
}
function trackTimeline(nx, w) {
  const c = nx.circuit, N = c.n_laps, start = Date.parse(nx.meta.sessions?.R || "");
  if (!Number.isFinite(start) || !w?.slots?.length) return null;
  const rate = (t) => { let s = null; for (const x of w.slots) if (x.t <= t) s = x; else break; return s ? s.mm * 4 : null; };
  const now = Date.now(), laps = [];
  let t = start, lastWet = -99, covered = 0;
  for (let i = 1; i <= N; i++) {
    let r = rate(t);
    if (r != null) covered++;
    if (w.kind === "wet" && Math.abs(t - now) < 12 * 60000) r = Math.max(r ?? 0, WET_MMH);     // radar says it is raining now
    const nc = nearestNowcast(w, t);              // within the radar forecast's hour, it overrides the coarser model forecast
    if (nc) r = nc.wet ? Math.max(r ?? 0, WET_MMH) : Math.abs(t - now) < 12 * 60000 && w.kind === "wet" ? r : 0;
    const wet = (r ?? 0) >= WET_MMH;
    if (wet) lastWet = i;
    const state = wet ? ((r ?? 0) >= FULL_WET_MMH ? "full" : "wet") : i - lastWet <= DRY_LAPS && lastWet > 0 ? "drying" : "dry";
    laps.push({ lap: i, t, rate: r, state });
    t += c.base_lap * (state === "dry" ? 1 : WET_LAP) * 1000;
  }
  return covered < N * 0.6 ? null : { laps, start, end: t, anyWet: laps.some((l) => l.state !== "dry") };
}
// fastest dry plan for n laps: compounds, stint lengths and time, with the sets available
function dryPlan(c, n, have, needTwo, maxStops = 2) {
  if (n <= 0) return null;
  const comps = ["SOFT", "MEDIUM", "HARD"], MIN = Math.min(6, Math.max(1, Math.floor(n / 3)));
  const cum = {};
  for (const k of comps) { const a = [0]; for (let age = 1; age <= n + 45; age++) { const over = Math.max(0, age - 0.9 * (c.max_stint?.[k] ?? 40)); a.push(a[age - 1] + (c.offset?.[k] ?? 0) + (c.deg?.[k] ?? 0.05) * age + 0.04 * over * over); } cum[k] = a; }
  const avail = Object.fromEntries(comps.map((k) => [k, have ? [...Array(have.new?.[k] ?? 0).fill(0), ...(have.used || []).filter((u) => u.compound === k).map((u) => u.laps).sort((a, b) => a - b)] : Array(4).fill(0)]));
  const cost = (k, age0, L) => cum[k][age0 + L] - cum[k][age0];
  let best = null;
  const tryPlan = (seq) => {
    const left = Object.fromEntries(comps.map((k) => [k, avail[k].slice()])), ages = [];
    for (const k of seq) { if (!left[k].length) return; ages.push(left[k].shift()); }
    if (needTwo && new Set(seq).size < 2) return;
    const m = seq.length, pit = (m - 1) * c.pit_loss;
    const rec = (i, used, tsum, lens) => {
      if (i === m - 1) { const L = n - used; if (L < MIN) return; const T = tsum + cost(seq[i], ages[i], L) + pit; if (!best || T < best.time) best = { seq, lens: [...lens, L], time: T, ages }; return; }
      for (let L = MIN; L <= n - used - MIN * (m - 1 - i); L += m > 2 ? 2 : 1) rec(i + 1, used + L, tsum + cost(seq[i], ages[i], L), [...lens, L]);
    };
    rec(0, 0, 0, []);
  };
  const gen = (seq, depth) => { if (seq.length) tryPlan(seq); if (depth < maxStops + 1) for (const k of comps) gen([...seq, k], depth + 1); };
  gen([], 0);
  return best;
}
// phases across the race: wet-tyre phases from the timeline, dry phases filled by dryPlan
function weatherPlan(nx, TL, have, cc) {
  const c = cc || nx.circuit, N = c.n_laps, segs = [];
  for (const l of TL.laps) { const kind = l.state === "dry" ? "dry" : l.state === "full" ? "W" : "I"; const s = segs[segs.length - 1]; if (s && s.kind === kind) s.to = l.lap; else segs.push({ kind, from: l.lap, to: l.lap }); }
  // very short dry gaps between showers are not worth two stops: stay on intermediates
  for (let i = 1; i < segs.length - 1; i++) if (segs[i].kind === "dry" && segs[i].to - segs[i].from + 1 < 8) segs[i].kind = "I";
  const merged = [];
  for (const s of segs) { const p = merged[merged.length - 1]; if (p && p.kind === s.kind) p.to = s.to; else merged.push({ ...s }); }
  const wetUsed = merged.some((s) => s.kind !== "dry"), left = have ? { new: { ...have.new }, used: [...(have.used || [])] } : null, out = [];
  for (const s of merged) {
    const n = s.to - s.from + 1;
    if (s.kind !== "dry") { out.push({ tyre: s.kind, from: s.from, to: s.to }); continue; }
    const p = dryPlan(c, n, left, !wetUsed, merged.length > 1 ? 1 : 2);
    if (!p) { out.push({ tyre: "?", from: s.from, to: s.to }); continue; }
    let a = s.from;
    p.seq.forEach((k, i) => { out.push({ tyre: k[0], from: a, to: a + p.lens[i] - 1 }); a += p.lens[i];
      if (left) { if (p.ages[i] === 0 && left.new[k] > 0) left.new[k]--; else { const j = left.used.findIndex((u) => u.compound === k && u.laps === p.ages[i]); if (j >= 0) left.used.splice(j, 1); } } });
  }
  return { phases: out, stops: out.length - 1, label: out.map((p) => p.tyre).join("-") };
}
const PHASE_NAME = { S: "Soft", M: "Medium", H: "Hard", I: "Intermediate", W: "Full wet" };
function planLane(plan, N) {
  const track = h("div", { class: "lane-track" });
  for (const p of plan.phases) track.append(h("div", { class: `lane-stint ${p.tyre}`, style: `left:calc(${((p.from - 1) / N) * 100}% + 1px);width:calc(${((p.to - p.from + 1) / N) * 100}% - 2px)`,
    "data-tip": `${PHASE_NAME[p.tyre] || p.tyre} · laps ${p.from}-${p.to}` }));
  return track;
}
// Strategy page: what the live weather means for the plans (history of wet races, not simulation)
function weatherStrategyEl(nx, fpView) {
  const G = nx.geo, R = nx.weather_ref, est = fpView ? nx.meta.tyres?.practice_wear?.estimate : null;
  const c = est ? { ...nx.circuit, deg: { ...nx.circuit.deg, ...est } } : nx.circuit;      // follows the Model / practice-wear toggle
  if (!G || !R?.wet || !R?.dry) return null;
  const body = h("div", {}, h("p", { class: "sub" }, "Checking live weather…"));
  const el = panel("Weather and strategy", "live conditions at the circuit · what rain has changed in past races", body);
  if (state.wxStop) { state.wxStop(); state.wxStop = null; }
  import("./weather.js?v=2ff3b714ee").then((mod) => { state.wxStop = mod.watchWeather(G, (w) => {
    if (!w.ok) { body.replaceChildren(h("p", { class: "sub" }, "Live weather unavailable right now. The plans below assume a dry race.")); return; }
    const ref = c.base_lap * 0.985;         // a good dry race lap here (the model's base lap is the field median)
    const toS = R.to_slicks, toI = R.to_inters;
    const lines = [];
    if (w.kind === "dry") lines.push("No rain near the circuit and little in the forecast: the dry-tyre plans on this page apply.");
    if (w.kind === "threat") lines.push(
      `Showers are ${w.nearestKm != null ? `${fx(w.nearestKm, 0)} km from the circuit` : "in the forecast"}${w.prob2h != null ? `, with a ${fx(w.prob2h, 0)}% chance of rain in the next two hours` : ""}. The dry-tyre plans still apply, but teams will keep their stops flexible to cover a shower.`,
      toI ? `If rain arrives: drivers on slicks have pitted for intermediates once their laps were about ${fx((toI.ratio - 1) * 100, 0)}% off dry pace (roughly ${lapClock(ref * toI.ratio)} laps here).` : null);
    if (w.kind === "wet") lines.push(
      "Rain at the circuit: the dry-tyre plans and stop counts on this page are on hold while the track is wet. On intermediates or wets the two-compound rule does not apply.",
      toS ? `Back to slicks: teams have switched when intermediate laps came within about ${fx((toS.ratio - 1) * 100, 0)}% of dry pace (roughly ${lapClock(ref * toS.ratio)} laps here; range ${fx((toS.lo - 1) * 100, 0)}-${fx((toS.hi - 1) * 100, 0)}%). ${nx.meta.tyres?.dynamics?.kind === "undercut" ? "This is an undercut track, so the first car onto slicks at the right moment usually gains." : ""}` : null,
      toI ? `If it dries and rain returns: slicks give way to intermediates at about ${fx((toI.ratio - 1) * 100, 0)}% off dry pace.` : null);
    if (w.kind !== "dry") lines.push(`In rain-affected races a safety car or red flag has come out ${pct(R.wet.any_sc)} of the time (${pct(R.dry.any_sc)} in dry races), and ${pct(R.wet.dnf)} of cars retired (${pct(R.dry.dnf)} dry): cheap stops under a safety car matter more than tyre wear.`);
    // tyre plan for the forecast conditions (only while the race is still to come or under way)
    const TL = trackTimeline(nx, w), N = c.n_laps, live = TL && Date.now() < TL.end + 20 * 60000;
    let planEl = null;
    if (live) {
      const gen = weatherPlan(nx, TL, null, c), states = [];
      for (const l of TL.laps) { const p = states[states.length - 1]; if (p && p.state === l.state) p.to = l.lap; else states.push({ state: l.state, from: l.lap, to: l.lap }); }
      const SN = { dry: "Dry", drying: "Drying", wet: "Wet", full: "Heavy rain" };
      const bar = h("div", { class: "lane-track wx-track", role: "img", "aria-label": "Expected track conditions by lap" }, states.map((p) => h("div", { class: `wx-seg ${p.state}`,
        style: `left:calc(${((p.from - 1) / N) * 100}% + 1px);width:calc(${((p.to - p.from + 1) / N) * 100}% - 2px)`, "data-tip": `${SN[p.state]} · laps ${p.from}-${p.to}` })));
      const first = gen.phases[0], sw = gen.phases.find((p) => "SMH".includes(p.tyre) && p.from > 1 && gen.phases.some((q) => "IW".includes(q.tyre) && q.to === p.from - 1));
      const dryN = gen.phases.filter((p) => "SMH".includes(p.tyre)).length;
      const say = !TL.anyWet ? `The forecast keeps the race dry: ${gen.label} is the fastest plan.`
        : `${"IW".includes(first.tyre) ? `Start on ${PHASE_NAME[first.tyre].toLowerCase()}s` : `Start on ${PHASE_NAME[first.tyre].toLowerCase()}s; rain is expected from lap ${gen.phases.find((p) => "IW".includes(p.tyre)).from}`}` +
          `${sw ? `, slicks around lap ${sw.from}` : ", with no dry window long enough for slicks"}. With a wet tyre used, the two-compound rule no longer applies${!sw ? "" : dryN === 1 ? `, so one set of ${PHASE_NAME[sw.tyre].toLowerCase()}s can run to the end if it lasts` : `; the dry laps are still quickest split over ${dryN} stints`}.`;
      const TS = nx.tyre_sets?.drivers, all = TS && TL.anyWet ? nx.drivers.filter((d) => TS[d.Driver]).map((d) => ({ d, p: weatherPlan(nx, TL, TS[d.Driver], c) })) : [];
      const sig = (p) => p.phases.map((x) => `${x.tyre}${x.to - x.from + 1}`).join("-"), rows = all.filter((r) => sig(r.p) !== sig(gen));   // only drivers whose sets force a different plan
      planEl = h("div", { class: "wx-plan" },
        h("h3", {}, "Tyre plan for these conditions"),
        h("div", { class: "wx-lanes" },
          h("div", { class: "wx-lane" }, h("span", {}, "Track"), bar),
          h("div", { class: "wx-lane" }, h("span", {}, "Tyres"), planLane(gen, N)),
          h("div", { class: "wx-lane wx-axis" }, h("span", {}), h("div", {}, [1, Math.round(N / 4), Math.round(N / 2), Math.round((3 * N) / 4), N].map((l) => h("i", {}, "L" + l))))),
        h("div", { class: "legend" }, [["wet", "Wet"], ["drying", "Drying"], ["dry", "Dry"]].map(([k, l]) => h("span", {}, h("i", { class: `wx-seg ${k}`, style: "position:static;display:inline-block;width:12px;height:12px;border-radius:3px" }), l)),
          h("span", {}, h("i", { style: "background:#22c55e" }), "Intermediate"), ["S", "M", "H"].map((k) => h("span", {}, h("i", { style: `background:${COMP_COLOR[k]}` }), COMP[k]))),
        h("p", { class: "explain" }, say, est ? " Stint lengths use this weekend's practice tyre wear." : ""),
        all.length && !rows.length ? h("p", { class: "sub" }, "Every driver has the sets for this plan.") : null,
        rows.length ? h("p", { class: "sub" }, `${rows.length} driver${rows.length === 1 ? "" : "s"} lack the sets for it and would run:`) : null,
        rows.length ? table(rows, [
          { id: "drv", label: "Driver", render: (r) => drvCell(r.d.Driver, r.d.Team, SHORT[r.d.Team] || r.d.Team, 26) },
          { id: "plan", label: "Plan with their sets", render: (r) => h("span", {}, tyres(r.p.label), h("span", { class: "strat-txt" }, r.p.phases.map((x) => x.to - x.from + 1).join(" / "))) },
          { id: "st", label: "Stops", num: true, render: (r) => r.p.stops }], { key: "wxplan", onRow: (r) => openDriver(r.d.Driver) }) : null,
        h("p", { class: "sub" }, `Rule-based, not simulated: for the next hour a lap is wet when the radar forecast puts rain over the circuit; beyond that, with ${WET_MMH} mm/h or more of rain in the weather-model forecast (or rain on the radar now), the track is treated as drying for ${DRY_LAPS} laps after rain stops, and the dry laps use the fastest plan for each driver's remaining sets. A 15-minute forecast cannot time a single shower to the lap.`));
    }
    body.replaceChildren(
      h("div", { class: `wx-now ${WX_CLASS[w.kind]}` }, h("b", {}, WX_LABEL[w.kind]),
        h("span", {}, w.precipNow >= 0.05 ? `${fx(w.precipNow * 4, 1)} mm/h now` : w.kind === "wet" ? "shower on radar" : "no rain now", w.nearestKm != null ? ` · nearest rain ${w.nearestKm < 2 ? "overhead" : fx(w.nearestKm, 0) + " km"}` : "", w.prob2h != null ? ` · ${fx(w.prob2h, 0)}% next 2 h` : "")),
      planEl,
      ...lines.filter(Boolean).map((t) => h("p", { class: "explain" }, t)),
      h("p", { class: "sub" }, `From ${R.wet.n} wet and ${R.dry.n} dry races in the data; the race simulation itself has no wet mode, so win and podium odds assume a dry race.`));
  }); }).catch(() => body.replaceChildren(h("p", { class: "sub" }, "Live weather unavailable right now. The plans below assume a dry race.")));
  return el;
}
// after qualifying: the dry sets each driver has left, and the fastest plan those sets allow
function tyreSetsPanel(nx, fpView) {
  const TS = nx.tyre_sets;
  if (!TS?.drivers) return null;
  const key = fpView && Object.values(TS.drivers)[0]?.practice ? "practice" : "model";
  const rows = nx.drivers.filter((d) => TS.drivers[d.Driver]).map((d) => ({ d, s: TS.drivers[d.Driver], p: TS.drivers[d.Driver][key] }));
  if (!rows.length) return null;
  const A = TS.allocation, chip = (k, n) => h("span", { class: "set-count", "data-tip": `${n} new ${COMP[k].toLowerCase()} set${n === 1 ? "" : "s"} left` },
    h("i", { style: `background:${COMP_COLOR[k]}` }), h("b", { class: n ? "" : "muted" }, n));
  const short = { SOFT: "S", MEDIUM: "M", HARD: "H" };
  return panel("Tyres left for the race", `new sets per driver after qualifying · fastest plan those sets allow (${key === "practice" ? "practice wear" : "model wear"})`,
    table(rows, [
      { id: "drv", label: "Driver", val: (r) => r.d.Driver, render: (r) => drvCell(r.d.Driver, r.d.Team, SHORT[r.d.Team] || r.d.Team, 28) },
      { id: "new", label: "New sets  S / M / H", val: (r) => r.s.new.SOFT * 100 + r.s.new.MEDIUM * 10 + r.s.new.HARD, render: (r) => h("span", { class: "set-row" }, ["SOFT", "MEDIUM", "HARD"].map((k) => chip(short[k], r.s.new[k]))) },
      { id: "used", label: "Used sets kept", render: (r) => h("span", { class: "mono muted" }, r.s.used.length ? r.s.used.map((u) => `${short[u.compound]}·${u.laps}`).join("  ") : "-"), tip: "compound · laps already on the set" },
      { id: "plan", label: "Fastest plan available", val: (r) => r.p?.delta_s ?? 99, render: (r) => (r.p ? h("span", {}, tyres(r.p.plan), h("span", { class: "strat-txt" }, r.p.lens.join(" / "))) : "-") },
      { id: "d", label: "vs ideal", num: true, val: (r) => r.p?.delta_s ?? 99, render: (r) => (r.p ? (r.p.delta_s <= 0.05 ? h("span", { class: "badge good" }, "ideal") : h("span", { class: "mono" }, `+${fx(r.p.delta_s, 1)}s`)) : "-"), tip: "time lost against the fastest plan with unlimited new sets" }],
      { key: "sets", onRow: (r) => openDriver(r.d.Driver) }),
    h("p", { class: "sub" }, `Counted from every stint in practice and qualifying: a stint that starts on a fresh tyre opens a new set. Assumes the standard allocation of ${A.HARD} hard, ${A.MEDIUM} medium and ${A.SOFT} soft sets, with ${TS.race_sets} kept for qualifying and the race. Stint laps are tyre-wear optimal, with no traffic or safety car.`));
}

/* ------------------------------------------------------------------ DRIVERS */
const AWARDS = [
  ["race_pace", "Fastest racer", "s/lap vs average driver", (v) => sgn(v, 2) + " s/lap", "M13 2 3 14h9l-1 8 10-12h-9z"],
  ["quali_pace", "Qualifying king", "one-lap pace, car removed", (v) => sgn(v, 2) + " s/lap", "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"],
  ["execution", "Race craft", "places gained vs own pace", (v) => sgn(v, 2) + " places", "M4 20l6-6 4 4 6-10M14 8h6v6"],
  ["starts", "Rocket starts", "lap-1 places vs grid slot", (v) => sgn(v, 2) + " places", "M5 19c3-1 5-3 6-6l7-7-4 1-7 7c-1 3-1 4-2 5z"],
  ["tyre_mgmt", "Tyre whisperer", "slowest tyre fade", (v) => sgn(v, 1) + " ms/lap²", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"],
  ["consistency", "Metronome", "tightest lap-time scatter", (v) => sgn(v * 1000, 0) + " ms", "M12 6v6l4 2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"],
];
function renderDrivers(root) {
  const R = state.data.ratings.slice();
  if (!R.length) return put(root, h("div", { class: "empty" }, "No ratings yet."));
  put(root, sectionHead(["Drivers, ", em("car removed")], "Every driver compared with their team-mate in the same car, race after race. Drivers who switched teams tie the whole grid onto one scale."));
  const [fk, ft, fsub, ff] = AWARDS[0];
  const top = R.filter((r) => r[fk] != null).sort((a, b) => b[fk] - a[fk])[0];
  const feature = h("button", { type: "button", class: "panel clickable award-feature", style: `--team:${teamColor(top.team)}`, onclick: () => openDriver(top.Driver) },
    cutout(top.Driver, { loading: "lazy", width: 480, height: 480 }),
    h("span", { class: "copy", style: "display:block" }, h("span", { class: "kicker", style: "display:block" }, ft),
      h("span", { class: "who", style: "display:block" }, name(top.Driver)), h("span", { class: "mono hl", style: "display:block" }, ff(top[fk])),
      h("span", { class: "sub", style: "display:block;margin-top:6px" }, fsub)));
  const list = stagger(h("div", { class: "panel award-list" }, AWARDS.slice(1).map(([k, t, sub, f]) => {
    const best = R.filter((r) => r[k] != null).sort((a, b) => b[k] - a[k])[0];
    return btn("rowbtn", () => openDriver(best.Driver), null, avatar(best.Driver, 44, best.team),
      h("span", {}, h("span", { class: "t", style: "display:block" }, t), h("span", { class: "n", style: "display:block" }, name(best.Driver))),
      h("span", { class: "v", "data-tip": sub }, f(best[k])));
  })));
  put(root, h("div", { class: "awards" }, feature, list));
  const expl = nerd()
    ? h("p", { class: "explain", html: "Each metric is fitted as <b>metric[race, driver] = car[race, team] + skill[driver] + ε</b>, with one free car effect per team per race, ridge-shrunk (λ=2) driver skills, recency-weighted (half-life 16 races). Whiskers are 95% intervals; overlapping whiskers mean the data can't separate the drivers." })
    : h("p", { class: "explain", html: "Results mostly measure the <b>car</b>. These ratings compare drivers in the same car every weekend, so what's left is the <b>driver</b>." });
  if (!nerd()) {
    const max = Math.max(...R.map((r) => Math.abs(r.overall)));
    const view = state.driverView || "cards";
    const toggle = h("div", { class: "seg", role: "group", "aria-label": "Ranking view" }, [["cards", "Cards"], ["list", "List"]].map(([k, l]) =>
      h("button", { type: "button", class: view === k ? "on" : "", "aria-pressed": String(view === k), onclick: () => { state.driverView = k; rerender(); } }, l)));
    if (view === "cards") {
      put(root, h("div", { class: "mt" }, h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", {}, "Driver power ranking", h("small", {}, "car removed")), toggle),
        stagger(h("div", { class: "gallery" }, R.map((r, i) => h("button", { type: "button", class: "gcard", style: `--team:${teamColor(r.team)}`, onclick: () => openDriver(r.Driver), "aria-label": `${i + 1}. ${name(r.Driver)}, rating ${sgn(r.overall, 2)}` },
          cutout(r.Driver, { loading: "lazy", width: 240, height: 240 }), h("span", { class: "rk" }, i + 1),
          h("span", { class: "nm2" }, name(r.Driver).split(" ").slice(-1)[0]), h("span", { class: "sc" }, `${sgn(r.overall, 2)}  ${SHORT[r.team] || r.team}`))))))),
        h("div", { class: "mt" }, panel("How to read this", null, expl)));
      return;
    }
    put(root, h("div", { class: "grid g-main mt" },
      h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("h2", {}, "Driver power ranking", h("small", {}, "car removed")), toggle), stagger(h("div", { class: "stack", style: "gap:2px" }, R.map((r, i) => btn("rowbtn", () => openDriver(r.Driver), "grid-template-columns:30px 190px 1fr;gap:12px;align-items:center;min-height:44px",
        h("span", { class: "pos" }, i + 1), drvCell(r.Driver, r.team, SHORT[r.team] || r.team), pbar(0.5 + r.overall / (2 * max), teamColor(r.team), sgn(r.overall, 2))))))),
      h("div", { class: "sticky-side" }, panel("How to read this", null, expl))));
    return;
  }
  const cols = [
    { id: "d", label: "Driver", val: (r) => r.Driver, render: (r) => drvCell(r.Driver, r.team, SHORT[r.team] || r.team) },
    { id: "n", label: "Races", num: true, desc: true, val: (r) => r.races }, { id: "o", label: "Overall z", num: true, desc: true, val: (r) => r.overall, render: (r) => fx(r.overall, 2) },
    ...[["race_pace", "Race s/lap", 3], ["quali_pace", "Quali s/lap", 3], ["execution", "Exec", 2], ["starts", "Starts", 2], ["tyre_mgmt", "Tyre ms", 1], ["consistency", "Consist.", 3]].map(([k, l, dp]) => ({
      id: k, label: l, num: true, desc: true, val: (r) => r[k], render: (r) => h("span", { "data-tip": `SE ${fx(r[k + "_se"], 3)} · n=${r[k + "_n"]}` }, sgn(r[k], dp), h("span", { class: "muted" }, ` ±${fx(r[k + "_se"], dp)}`)) })),
    { id: "dnf", label: "DNF rate", num: true, val: (r) => r.dnf_rate, render: (r) => pct(r.dnf_rate) },
  ];
  put(root, h("div", { class: "grid g-2 mt" },
    panel("Race pace", "s/lap vs average driver · 95% CI", h("div", { html: forest(R.slice().sort((a, b) => b.race_pace - a.race_pace), { key: "race_pace", se: "race_pace_se", unit: " s/lap" }) })),
    panel("Qualifying pace", "s/lap vs average driver · 95% CI", h("div", { html: forest(R.slice().sort((a, b) => b.quali_pace - a.quali_pace), { key: "quali_pace", se: "quali_pace_se", unit: " s/lap" }) }))),
    h("div", { class: "mt" }, panel("All ratings", "± standard error · sortable", table(R, cols, { key: "ratings", onRow: (r) => openDriver(r.Driver) }))),
    h("div", { class: "mt" }, panel("Method", null, expl)));
}

/* ------------------------------------------------------------------ DRIVER VS CAR */
function renderDvC(root) {
  const all = (state.data.driver_vs_car || []).filter((d) => d.races >= 3);
  if (!all.length) return put(root, h("div", { class: "empty" }, "No data yet."));
  const q = state.dvcMode === "quali";
  const ek = q ? "grid_expected" : "car_expected", ak = q ? "grid_actual" : "actual", dk = q ? "quali_delta" : "race_delta";
  const rows = all.filter((d) => d[dk] != null).sort((a, b) => b[dk] - a[dk]);
  const seg = h("div", { class: "seg", role: "group", "aria-label": "Race or qualifying" }, [["race", "Race finish"], ["quali", "Qualifying"]].map(([k, l]) =>
    h("button", { class: state.dvcMode === k ? "on" : "", "aria-pressed": String(state.dvcMode === k), onclick: () => { state.dvcMode = k; rerender(); } }, l)));
  put(root, sectionHead(q ? ["Who out-qualifies ", em("their car")] : ["Who beats ", em("their car")],
    q ? "Where each car should start from its one-lap pace, against where its drivers actually qualified."
      : "Where each car should finish on pace alone, against where its drivers actually finished. Positive means the driver found places the car didn't have.", seg));
  const best = rows[0], worst = rows[rows.length - 1];
  const bestTeamPair = Object.values(rows.reduce((m, r) => { (m[r.Team] = m[r.Team] || []).push(r); return m; }, {})).filter((p) => p.length === 2)
    .map((p) => ({ team: p[0].Team, gap: Math.abs(p[0][dk] - p[1][dk]), a: p[0], b: p[1] })).sort((a, b) => b.gap - a.gap)[0];
  const hlFeature = h("button", { type: "button", class: "panel clickable award-feature", style: `--team:${teamColor(best.Team)};min-height:240px`, onclick: () => openDriver(best.Driver) },
    cutout(best.Driver, { loading: "lazy", width: 480, height: 480 }),
    h("span", { class: "copy", style: "display:block" }, h("span", { class: "kicker", style: "display:block" }, "Biggest over-performer"),
      h("span", { class: "who", style: "display:block" }, name(best.Driver)), h("span", { class: "mono", style: "display:block;color:var(--good)" }, `${sgn(best[dk], 1)} places per ${q ? "session" : "race"}`),
      !q && best.race_delta_clear === false ? h("span", { class: "unclear-note", style: "display:block" }, `not yet clear of race-to-race noise (90% range ${sgn(best.race_delta_lo, 1)} to ${sgn(best.race_delta_hi, 1)})`) : null));
  const hlList = h("div", { class: "panel award-list" },
    btn("rowbtn", () => openDriver(worst.Driver), null, avatar(worst.Driver, 44, worst.Team),
      h("span", {}, h("span", { class: "t", style: "display:block" }, "Leaves most on the table"), h("span", { class: "n", style: "display:block" }, name(worst.Driver))),
      h("span", { class: "v", style: "color:var(--bad)" }, sgn(worst[dk], 1))),
    bestTeamPair ? btn("rowbtn", () => openDriver(bestTeamPair.a.Driver), null, teamLogo(bestTeamPair.team, 30) || avatar(bestTeamPair.a.Driver, 44),
      h("span", {}, h("span", { class: "t", style: "display:block" }, "Biggest team-mate gap"), h("span", { class: "n", style: "display:block" }, `${bestTeamPair.a.Driver} vs ${bestTeamPair.b.Driver}`)),
      h("span", { class: "v" }, `${fx(bestTeamPair.gap, 1)} places`)) : null);
  put(root, h("div", { class: "awards" }, hlFeature, hlList));
  const noteSlot = h("div");
  put(root, noteSlot);

  // dumbbell: hollow = car, filled = driver
  const maxP = 22, x = (p) => ((p - 1) / (maxP - 1)) * 100;
  const chart = h("div", { class: "stack", style: "gap:2px" },
    h("div", { class: "dvc-row", style: "cursor:default;min-height:24px" }, h("span"), h("div", { style: "display:flex;justify-content:space-between;font:500 12px var(--mono);color:var(--muted)" }, ...[1, 5, 10, 15, 20].map((p) => h("span", {}, "P" + p))), h("span", { class: "mono muted", style: "text-align:right;font-size:12px" }, "Δ")),
    ...rows.map((d, i) => {
      const e = d[ek], a = d[ak], up = d[dk] >= 0, c = teamColor(d.Team);
      const lo = Math.min(x(e), x(a)), wdt = Math.abs(x(e) - x(a));
      return h("button", { type: "button", class: "dvc-row rowbtn", onclick: () => { state.dvcDriver = d.Driver; rerender(); setTimeout(() => $("#dvc-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); },
        "aria-label": `${name(d.Driver)}: car worth P${fx(e, 1)}, finished P${fx(a, 1)}` },
        drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team, 32),
        h("span", { style: "position:relative;height:28px;display:block" },
          h("span", { style: "position:absolute;left:0;right:0;top:13px;height:2px;background:var(--border)" }),
          h("span", { style: `position:absolute;top:11px;height:6px;border-radius:3px;left:${lo}%;width:${wdt}%;background:${up ? "var(--good)" : "var(--bad)"};opacity:.55` }),
          h("span", { "data-tip": `car worth P${fx(e, 1)}`, style: `position:absolute;top:6px;left:calc(${x(e)}% - 8px);width:16px;height:16px;border-radius:50%;border:2.5px solid ${c};background:var(--surface)` }),
          h("span", { "data-tip": `${d.Driver} averaged P${fx(a, 1)}`, style: `position:absolute;top:4px;left:calc(${x(a)}% - 10px)` }, avatar(d.Driver, 20, d.Team))),
        h("span", { class: `dvc-val ${up ? "up" : "down"} ${!q && d.race_delta_clear === false ? "unclear" : ""}`,
          "data-tip": !q && d.race_delta_lo != null ? `90% range ${sgn(d.race_delta_lo, 1)} to ${sgn(d.race_delta_hi, 1)} places${d.race_delta_clear ? "" : " (includes zero: within noise)"}` : null },
          sgn(d[dk], 1), nerd() && !q && d.race_delta_lo != null ? h("small", { class: "dvc-ci" }, `${sgn(d.race_delta_lo, 1)}\u2026${sgn(d.race_delta_hi, 1)}`) : null));
    }));
  const clearN = rows.filter((d) => d.race_delta_clear).length;
  queueMicrotask(() => dvcNote && noteSlot.append(dvcNote));
  const dvcNote = !q ? h("p", { class: "note dvc-honest" }, h("b", {}, "What this can and can't show: "),
    nerd() ? (state.data.driver_vs_car_note || "") : "Each car's pace is worked out from both of its drivers, so this mostly compares team-mates. ",
    ` Only ${clearN} of ${rows.length} drivers are clearly above or below their car so far; the rest are within normal race-to-race luck (dimmed numbers).`) : null;
  const legend = h("div", { class: "legend" }, h("span", {}, h("i", { class: "hollow" }), "where the car should be"), h("span", {}, h("i", { class: "filled" }), "where the driver was"),
    h("span", {}, h("i", { style: "background:var(--good)" }), "beat the car"), h("span", {}, h("i", { style: "background:var(--bad)" }), "below the car"));
  const note = h("p", { class: "note mt" }, h("b", {}, "How it works: "), q
    ? "Car pace comes from the car-adjusted model (team effect with each driver's skill removed). Cars are ranked by one-lap pace each weekend; a driver 'should' start behind everyone in a faster car and share their own car's slots with their team-mate."
    : "Among the cars that finished each race, a driver 'should' finish behind everyone in a faster car and share their own car's slots with their team-mate. Retirements ahead don't flatter backmarkers and every race sums to zero. Caveat: the fastest car can only lose places (there's no P0), so front-runners read slightly negative.");
  put(root, h("div", { class: "grid g-main mt" }, panel(q ? "Qualifying vs car" : "Race finish vs car", `average per ${q ? "session" : "race"} · ${state.data.season} · tap a driver`, chart, legend, note), dvcDetail(all, q)));
  if (nerd()) {
    const cols = [
      { id: "d", label: "Driver", val: (r) => r.Driver, render: (r) => drvCell(r.Driver, r.Team, SHORT[r.Team] || r.Team) },
      { id: "n", label: "Races", num: true, val: (r) => r.races }, { id: "c", label: "Finished", num: true, val: (r) => r.classified },
      { id: "ce", label: "Car worth", num: true, val: (r) => r.car_expected, render: (r) => "P" + fx(r.car_expected, 2) }, { id: "a", label: "Finished avg", num: true, val: (r) => r.actual, render: (r) => "P" + fx(r.actual, 2) },
      { id: "rd", label: "Race Δ", num: true, desc: true, val: (r) => r.race_delta, render: (r) => sgn(r.race_delta, 2) },
      { id: "ge", label: "Grid worth", num: true, val: (r) => r.grid_expected, render: (r) => "P" + fx(r.grid_expected, 2) }, { id: "ga", label: "Grid avg", num: true, val: (r) => r.grid_actual, render: (r) => "P" + fx(r.grid_actual, 2) },
      { id: "qd", label: "Quali Δ", num: true, desc: true, val: (r) => r.quali_delta, render: (r) => sgn(r.quali_delta, 2) },
      { id: "b", label: "Beat car", num: true, desc: true, val: (r) => r.beat_car_pct, render: (r) => pct(r.beat_car_pct) },
    ];
    put(root, h("div", { class: "mt" }, panel("Full table", "data behind the chart · sortable", table(all, cols, { key: "dvc", initial: { id: "rd", dir: -1 } }))));
  }
}
function dvcDetail(all, q) {
  const code = state.dvcDriver && all.find((d) => d.Driver === state.dvcDriver) ? state.dvcDriver : all[0].Driver;
  const d = all.filter((x) => x.Driver === code).sort((a, b) => b.races - a.races)[0];
  const pr = d.per_race || [];
  const labels = pr.map((r) => "R" + r.round);
  const exp = pr.map((r) => (q ? r.exp_grid : r.exp)), act = pr.map((r) => (q ? r.grid : (r.dnf ? null : r.actual)));
  const sel = h("select", { "aria-label": "Choose driver", onchange: (e) => { state.dvcDriver = e.target.value; rerender(); } },
    all.slice().sort((a, b) => a.Driver.localeCompare(b.Driver)).map((x) => h("option", { value: x.Driver, selected: x.Driver === code ? "selected" : null }, `${x.Driver} · ${SHORT[x.Team] || x.Team}`)));
  return h("div", { id: "dvc-detail", class: "sticky-side" }, panel("Race by race", null,
    h("div", { style: "display:flex;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap" }, avatar(code, 48, d.Team), h("div", {}, h("div", { style: "font:700 22px var(--display)" }, name(code)), h("div", { class: "sub" }, d.Team)), h("div", { style: "margin-left:auto" }, sel)),
    h("div", { html: lineChart({ labels, invert: true, yFmt: (v) => "P" + Math.min(22, Math.max(1, Math.round(v))), yLabel: q ? "grid slot" : "finish", series: [
      { name: "Car worth", color: "var(--muted)", values: exp, dash: "5 5", hollow: true },
      { name: name(code), color: teamColor(d.Team), values: act, width: 3 }] }) }),
    h("div", { class: "legend" }, h("span", {}, h("i", { style: "background:var(--muted)" }), "car worth (dashed)"), h("span", {}, h("i", { style: `background:${teamColor(d.Team)}` }), name(code)), q ? null : h("span", {}, "gaps = retirements")),
    h("p", { class: "sub mt" }, `${d.races} races · ${d.dnfs} DNF · beat the car in ${pct(d.beat_car_pct)} of finishes`)));
}

/* ------------------------------------------------------------------ TEAMS */
const TEAM_AXES = [["s_race", "Race pace"], ["s_quali", "Quali pace"], ["s_reliability", "Reliability"], ["s_execution", "Execution"], ["s_development", "Development"], ["s_pit", "Pit work"]];
/* garage: stylised 3D car per team; changing team explodes it and reassembles it in the next livery */
const CAR_ICON = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg>',
};
function garageEl(T) {
  if (state.car3) { state.car3.dispose(); state.car3 = null; }
  const S = state.data.standings?.drivers || [];
  // drivers come from the standings (current team, points order); numbers from the project's driver data
  const teams = T.map((t) => {
    const ds = S.filter((d) => d.Team === t.Team).slice(0, 2);
    return { team: t.Team, label: SHORT[t.Team] || t.Team, color: teamColor(t.Team), t, ds,
             drivers: ds.map((d) => ({ code: d.Driver, name: name(d.Driver), number: person(d.Driver).number ?? "" })), driver: 0 };
  });
  let i = Math.max(0, teams.findIndex((x) => x.team === state.garageTeam));
  let ctrl = null, playing = !reduced();
  const idxV = h("span", { "data-scramble": "" }), nameV = h("h2", { id: "car3-title" }), dl = h("dl", { class: "c3-tr" }), drv = h("div", { class: "car3-drivers", role: "group", "aria-label": "Car shown" });
  const logoBox = h("div", { class: "c3-fallback car3-logo" });
  const status = h("span", { class: "car3-status", role: "status" });
  const wip = h("span", { class: "chip warn car3-wip", hidden: true, "data-tip": "This team has no dedicated 3D model yet: it shares the generic 2026 body, with a livery painted by this site" }, "Model in progress");
  const playBtn = h("button", { type: "button", class: "car3-btn", onclick: () => { playing = !playing; ctrl?.setAuto(playing); syncPlay(); } });
  const syncPlay = () => { playBtn.innerHTML = playing ? CAR_ICON.pause : CAR_ICON.play; playBtn.setAttribute("aria-label", playing ? "Pause the car rotation" : "Cycle through the cars"); };
  syncPlay();
  let want = null;
  const go = (j) => { j = (j + teams.length) % teams.length; if (ctrl) ctrl.go(j); else { want = j; update(j); } };
  const strip = h("div", { class: "car3-strip", role: "group", "aria-label": "Choose a car" }, teams.map((x, j) => h("button", {
    type: "button", class: "pill-toggle", style: `--team:${x.color}`, "aria-pressed": "false", onclick: () => go(j),
  }, teamLogo(x.team, 18) || h("i"), x.label)));
  const el = h("section", { class: "c3 car3", "aria-labelledby": "car3-title" },
    logoBox,
    h("div", { class: "c3-hud" },
      h("div", { class: "c3-tl" }, idxV, nameV, wip),
      dl,
      h("div", { class: "c3-bl" }, drv, h("p", {}, nerd()
        ? "Community 3D models (CC BY, credited below), split into components for the transition. Four cars carry their author's livery textures; the rest share the FIA 2026 show-car body with liveries painted by this site's pipeline (plain-text sponsor names). Not team CAD."
        : "A 3D model in each team's colours, built from community models credited below, not the teams' own designs. Watch it come apart and rebuild as the next team's car.")),
      h("div", { class: "c3-br car3-ctl" },
        status,
        h("div", { class: "car3-btns" },
          h("button", { type: "button", class: "car3-btn", "aria-label": "Previous car", html: CAR_ICON.prev, onclick: () => go((ctrl ? ctrl.index : i) - 1) }),
          reduced() ? null : playBtn,
          h("button", { type: "button", class: "car3-btn", "aria-label": "Next car", html: CAR_ICON.next, onclick: () => go((ctrl ? ctrl.index : i) + 1) })),
        h("span", { class: "c3-hint" }, "Drag to rotate"))));
  function drivers(j) {
    const x = teams[j];
    // a team with one source model uses it for both drivers (its livery carries one number)
    const fixed = ctrl?.fixedNumber?.(j);
    drv.replaceChildren(...x.drivers.map((d, k) => h("button", {
      type: "button", class: "car3-drv", "aria-pressed": String(k === x.driver),
      title: fixed && String(d.number) !== String(fixed) ? `${d.name}'s car: this team has one model, which carries #${fixed}` : `Show ${d.name}'s car (#${d.number})`,
      onclick: () => { x.driver = k; ctrl?.setDriver(j, d.number); drivers(j); },
    }, h("b", {}, `#${d.number}`), " ", d.name)));
  }
  function update(j) {
    i = j; const x = teams[j], t = x.t;
    state.garageTeam = x.team;
    el.style.setProperty("--team", x.color);
    idxV.textContent = `GARAGE_${String(j + 1).padStart(2, "0")} / ${String(teams.length).padStart(2, "0")}`;
    nameV.replaceChildren(x.team);
    dl.replaceChildren(...[["Rating", fx(t.overall, 0)], ["Wins", t.wins], ["Podiums", t.podiums], ["Finish rate", pct(t.reliability)]]
      .map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, String(v)))));
    drivers(j);
    logoBox.replaceChildren(teamLogo(x.team, 96) || h("b", {}, x.label));
    strip.querySelectorAll("button").forEach((b, k) => b.setAttribute("aria-pressed", String(k === j)));
    wip.hidden = ctrl?.source?.(j) !== "fia_repaint";      // cars without their own model yet
  }
  update(i);
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    el.classList.add("loading");
    import("./garage3d.js?v=2ff3b714ee").then((mod) => mod.mount(el, {
      teams: teams.map((x) => ({ team: x.team, label: x.label, color: x.color, drivers: x.drivers, driver: x.driver })),
      manifestUrl: "assets/cars/manifest.json?v=2ff3b714ee", start: i, auto: playing, onChange: update,
      onState: (st) => { el.classList.toggle("loading", !!st.loading); status.textContent = st.error ? "Could not load that car" : st.loading ? "Loading car…" : ""; if (st.error) setTimeout(() => { if (status.textContent.startsWith("Could")) status.textContent = ""; }, 4000); },
    }))
      .then((c) => { ctrl = c; state.car3 = c; el.classList.remove("loading"); el.classList.add("live"); update(c.index); if (want != null && want !== c.index) c.go(want); showCredits(c.credits); })   // a car picked while loading is kept
      .catch((err) => { el.classList.remove("loading"); el.classList.add("flat"); console.info("3D car unavailable, showing the team badge:", err.message); });
  }, { rootMargin: "300px 0px" });
  io.observe(el);
  // CC BY attribution for every source model, from the asset manifest (filled once the garage loads)
  const credit = h("p", { class: "car3-credit" });
  const showCredits = (list) => {
    if (!list?.length) return;
    const items = list.flatMap((c, k) => [k ? (k === list.length - 1 ? " and " : ", ") : "",
      h("a", { href: c.url, target: "_blank", rel: "noopener" }, `“${c.title}”`), ` by ${c.author}`]);
    credit.replaceChildren("3D models: ", ...items, ", ", h("a", { href: list[0].licence_url, target: "_blank", rel: "noopener" }, "CC BY 4.0"),
      ". Split into parts and adapted for this site (", h("a", { href: "https://github.com/mjNotFound-19/Flat_Out_F1_V2/blob/main/tools/cars/SOURCES.md", target: "_blank", rel: "noopener" }, "list of changes"),
      "); not endorsed by the authors. Logos shown are trademarks of their owners.");
  };
  return h("div", { class: "car3-wrap" }, el, strip, credit);
}

function renderTeams(root) {
  const T = state.data.constructors || [];
  if (!T.length) return put(root, h("div", { class: "empty" }, "No constructor data yet."));
  const drivers = (team) => (state.data.standings.drivers || []).filter((d) => d.Team === team).slice(0, 2);
  put(root, sectionHead(["Rating ", em("the cars")], "Each car's pace with the drivers taken out, plus reliability, conversion of pace into results, pit work and in-season development. 50 is an average team."));
  // the 3D garage is a work in progress: published builds switch it off (web/scripts/publish-portfolio.sh)
  if (garageOn()) put(root, garageEl(T));
  const cards = stagger(h("div", { class: "stack" }, T.map((t, i) => h("div", { class: "teamcard", style: `--team:${teamColor(t.Team)}` },
    h("div", { class: "rank" }, i + 1),
    h("div", {}, h("div", { class: "tname" }, teamLogo(t.Team, 26), t.Team), h("div", { class: "tdrivers" }, drivers(t.Team).map((d) => h("button", { type: "button", class: "chipbtn", onclick: () => openDriver(d.Driver) }, avatar(d.Driver, 26, t.Team), d.Driver)),
      h("span", {}, `· ${t.wins} wins · ${t.podiums} podiums`))),
    h("div", { class: "score" }, h("b", {}, fx(t.overall, 0)), h("span", {}, "rating")),
    h("div", { class: "axisbars" }, TEAM_AXES.map(([k, l]) => h("div", { "data-tip": `${l}: ${fx(t[k], 0)}/100` }, l, h("div", { class: "b" }, h("i", { style: `width:${t[k]}%` })))))))));

  const sel = state.teamSel || T.slice(0, 3).map((t) => t.Team);
  const toggles = h("div", { style: "display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px" }, T.map((t) => h("button", {
    class: "pill-toggle", style: `--team:${teamColor(t.Team)}`, "aria-pressed": String(sel.includes(t.Team)),
    onclick: () => { let s = sel.slice(); s = s.includes(t.Team) ? s.filter((x) => x !== t.Team) : [...s, t.Team].slice(-3); state.teamSel = s.length ? s : [t.Team]; rerender(); },
  }, teamLogo(t.Team, 18) || h("i"), SHORT[t.Team] || t.Team)));
  const radarPanel = panel("Compare cars", "pick up to 3", toggles, h("div", { html: radar(T.filter((t) => sel.includes(t.Team)), TEAM_AXES) }),
    h("div", { class: "legend" }, T.filter((t) => sel.includes(t.Team)).map((t, j) => h("span", {}, h("i", { style: `background:${teamColor(t.Team)};height:${[3, 2, 2][j]}px` }), t.Team + ["", " (dashed)", " (dotted)"][j]))));
  put(root, h("div", { class: "grid g-main" }, cards, radarPanel));

  // pace trend
  const rounds = [...new Set(T.flatMap((t) => (t.pace_trend || []).map((p) => p.round)))].sort((a, b) => a - b);
  const show = nerd() ? T : T.filter((t) => sel.includes(t.Team));
  const trend = lineChart({ labels: rounds.map((r) => "R" + r), width: 1240, height: 340, yLabel: "pace vs median car, % (up = faster)", invert: true, zero: true, yFmt: (v) => sgn(v, 1) + "%",
    series: show.map((t) => ({ name: t.Team, color: teamColor(t.Team), values: rounds.map((r) => (t.pace_trend || []).find((p) => p.round === r)?.pace ?? null), width: sel.includes(t.Team) ? 3 : 1.4, opacity: sel.includes(t.Team) ? 1 : 0.35, endLabel: sel.includes(t.Team) ? (SHORT[t.Team] || t.Team) : null, r: sel.includes(t.Team) ? 3.6 : 2.4 })) });
  put(root, h("div", { class: "mt" }, panel("Car pace through the season", nerd() ? "all teams · selected highlighted · higher on chart = faster" : "selected teams · higher on chart = faster", h("div", { html: trend }))));
  if (nerd()) {
    const cols = [
      { id: "t", label: "Team", val: (t) => t.Team, render: (t) => h("span", {}, h("span", { style: `display:inline-block;width:10px;height:10px;border-radius:3px;background:${teamColor(t.Team)};margin-right:8px` }), t.Team) },
      { id: "o", label: "Rating", num: true, desc: true, val: (t) => t.overall, render: (t) => fx(t.overall, 1) },
      { id: "rp", label: "Race pace %", num: true, val: (t) => t.race_pace, render: (t) => sgn(t.race_pace, 2), tip: "recency-weighted car effect vs median car" },
      { id: "qp", label: "Quali pace %", num: true, val: (t) => t.quali_pace, render: (t) => sgn(t.quali_pace, 2) },
      { id: "sp", label: "Season avg %", num: true, val: (t) => t.season_pace, render: (t) => sgn(t.season_pace, 2) },
      { id: "dv", label: "Dev %/race", num: true, val: (t) => t.development, render: (t) => sgn(t.development, 3), tip: "negative = getting faster" },
      { id: "rl", label: "Finish rate", num: true, desc: true, val: (t) => t.reliability, render: (t) => pct(t.reliability) },
      { id: "ex", label: "Execution", num: true, desc: true, val: (t) => t.execution, render: (t) => sgn(t.execution, 2), tip: "places per car vs car pace (zero-sum)" },
      { id: "pt", label: "Pit Δ s", num: true, val: (t) => t.pit_ops, render: (t) => sgn(t.pit_ops, 2), tip: "median pit loss vs race median" },
      { id: "w", label: "Wins", num: true, desc: true, val: (t) => t.wins },
    ];
    put(root, h("div", { class: "mt" }, panel("Constructor data", "raw values behind the scores · sortable", table(T, cols, { key: "teams" }))));
  }
}

/* ------------------------------------------------------------------ SEASON */
function renderSeason(root) {
  const S = state.data.standings, maxP = S.drivers[0]?.points || 1;
  const rounds = Math.max(0, ...S.drivers.flatMap((d) => d.results.map((r) => r.round)));
  const cols = [
    { id: "p", label: "Pos", render: (d) => h("span", { class: "pos" }, S.drivers.indexOf(d) + 1) },
    { id: "d", label: "Driver", render: (d) => drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team) },
    { id: "pts", label: "Points", render: (d) => pbar(d.points / maxP, teamColor(d.Team), String(d.points)) },
    { id: "gap", label: "Gap", num: true, render: (d) => (d === S.drivers[0] ? "-" : "−" + (maxP - d.points)) },
    { id: "w", label: "Wins", num: true, nerd: true, render: (d) => d.results.filter((r) => r.finish === 1 && !r.dnf).length },
    { id: "pd", label: "Podiums", num: true, nerd: true, render: (d) => d.results.filter((r) => r.finish <= 3 && !r.dnf).length },
    { id: "af", label: "Avg finish", num: true, nerd: true, render: (d) => fx(d.results.filter((r) => !r.dnf).reduce((s, r, _, a) => s + r.finish / a.length, 0), 1) },
    { id: "r", label: `Results R1-R${rounds}`, render: (d) => resultStrip(d.results) },
  ];
  const tmax = S.teams[0]?.points || 1;
  const prov = S.provisional_rounds || [];
  put(root, sectionHead([`${state.data.season} `, em("championship")], "Race and sprint points after every round."
    + (prov.length ? ` Round ${prov.join(", ")} is counted on its provisional result: standard points for the finishing order, before any penalties.` : "")),
    h("div", { class: "stack" },
      panel("Drivers", null, table(S.drivers, cols, { onRow: (d) => openDriver(d.Driver) })),
      h("div", { class: "grid g-2" },
        panel("Constructors", null, h("div", { class: "stack", style: "gap:8px" }, S.teams.map((t, i) => h("div", { style: "display:grid;grid-template-columns:26px 170px 1fr;gap:10px;align-items:center;min-height:36px" },
          h("span", { class: "pos" }, i + 1), h("span", { style: `display:flex;align-items:center;gap:8px;font:700 16px var(--display);text-transform:uppercase;color:${teamColor(t.Team)}` }, teamLogo(t.Team, 20), SHORT[t.Team] || t.Team), pbar(t.points / tmax, teamColor(t.Team), String(t.points)))))),
        panel("Legend", null, h("div", { class: "strip", style: "flex-wrap:wrap;gap:8px;align-items:center;font-size:14px;color:var(--text-2)" },
          h("i", { class: "p1" }, "1"), " win ", h("i", { class: "p2" }, "2"), h("i", { class: "p3" }, "3"), " podium ", h("i", { class: "pts" }, "7"), " points ", h("i", {}, "14"), " no points ", h("i", { class: "dnf" }, "×"), " DNF")))));
}

/* ------------------------------------------------------------------ ACCURACY */
function renderAccuracy(root) {
  const years = Object.keys(state.data.benchmarks || {}).sort().reverse();
  const by = years.includes(state.benchYear) ? state.benchYear : (years.includes(String(state.data.season)) ? String(state.data.season) : years[0]);
  const B = by ? state.data.benchmarks[by] : null;
  if (B) benchmarkSection(root, B, by, years);
  const SR = state.data.sprint_record;
  if (SR) put(root, h("div", { class: "mt" }, panel("Sprint forecast", `${SR.n} sprints, ${SR.first} to ${SR.last} · each forecast with only what was known before it, against the sprint grid`,
    h("div", { class: "grid g-4" },
      stat(`${SR.better}<small>/${SR.n}</small>`, "Closer than the sprint grid", "sprints where the forecast beat 'finish where you start'", "cyan"),
      stat(pct(1 - SR.model_rps / SR.grid_rps), "Lower error than the grid", nerd() ? `RPS ${fx(SR.model_rps, 4)} vs ${fx(SR.grid_rps, 4)}` : "ranked probability score, lower is better", ""),
      stat(pct(SR.model_p_winner, 0), "Chance we gave the winner", `the sprint grid alone: ${pct(SR.grid_p_winner, 0)}`, "accent"),
      stat(SR.hi < 0 ? "Yes" : "Not yet", "Beyond luck?", nerd() ? `paired difference ${sgn(SR.diff, 4)}, 95% range [${sgn(SR.lo, 4)}, ${sgn(SR.hi, 4)}]` : "the likely range of the gap still includes zero", "")),
    h("p", { class: "explain" }, "A sprint is about a third of a race with no pit stop to plan, so it has its own forecast on sprint weekends. ",
      SR.hi < 0 ? "" : `${SR.n} sprints are too few to separate this from the sprint grid with confidence; the count grows with every sprint weekend.`))));
  const ev = state.data.season_eval?.[String(state.data.season)] || {};
  const mode = ev[state.accMode] ? state.accMode : Object.keys(ev)[0], E = ev[mode];
  if (!E) return B ? null : put(root, h("div", { class: "empty" }, "No evaluation yet. Run python -m flatout nested --year 2026 to score past races."));
  if (B) {   // the retrospective backtest below is kept for the per-race explorer, clearly labelled
    put(root, h("h2", { class: "subhead mt" }, "Race-by-race detail",
      h("small", {}, nerd() ? "retrospective backtest \u00b7 simulator settings tuned on these same races (in-sample) \u00b7 use the numbers above for accuracy" : "what we tipped at each race")));
  }
  const tag = "backtest_" + mode, races = state.data.races.filter((r) => r.predictions[tag]), a = E.avg;
  const wins = E.per_race.filter((r) => r.model_winner_correct).length, better = 1 - a.model.rps / a.grid.rps;
  if (!B) put(root, sectionHead(["How good are ", em("the predictions")], "Walk-forward test: the model is retrained before every race using only earlier races, then scored against the result.",
    h("div", { class: "seg", role: "group", "aria-label": "Information available" }, Object.keys(ev).map((k) => h("button", { class: k === mode ? "on" : "", "aria-pressed": String(k === mode), onclick: () => { state.accMode = k; rerender(); } }, MODE_LABEL[k] || k)))));
  if (!B) put(root, h("div", { class: "grid g-4" },
    stat(`${wins}<small>/${E.n}</small>`, "Favourite won", `trusting the grid: ${pct(a.grid.winner_correct)} of races`, "good"),
    stat(pct(better), "More accurate than the grid", "ranked probability score vs 'finish where you start'", "cyan"),
    stat(pct(a.model.p_winner), "Chance we gave the winner", `pace-only baseline ${pct(a.pace.p_winner)}`, "accent"),
    stat(pct(E.strategy.stops_acc), "Stop count right", `first stop off by ~${fx(E.strategy.first_stop_mae, 1)} laps`, "")));
  const calls = stagger(h("div", { class: "calls" }, races.slice().reverse().map((r) => {
    const P = r.predictions[tag].drivers, fav = P.slice().sort((x, y) => y.win - x.win)[0], won = P.find((x) => x.actual === 1), ok = fav && won && fav.Driver === won.Driver;
    return h("button", { type: "button", class: "call", onclick: (() => { state.raceIdx = state.data.races.indexOf(r); if (!nerd()) setMode("nerd"); else rerender(); setTimeout(() => $("#race-explorer")?.scrollIntoView({ behavior: "smooth" }), 60); }) },
      h("span", { class: `ok ${ok ? "y" : "n"}`, html: ok ? ICON.check : ICON.cross, "aria-label": ok ? "called it" : "missed" }), flag(r.country, "sm") || h("span"),
      h("span", {}, h("span", { class: "t", style: "display:block" }, `R${r.round} ${r.location}`), h("span", { class: "s", style: "display:block" }, `Tipped ${fav?.Driver} (${pct(fav?.win)}), won by ${won?.Driver ?? "?"} (${pct(won?.win)} from P${won?.actual_grid ?? "?"})`)),
      won ? avatar(won.Driver, 32, won.Team) : h("span"));
  })));
  const labels = E.per_race.map((r) => "R" + r.round);
  put(root, h("div", { class: "grid g-main mt" },
    panel(nerd() ? "Ranked probability score per race" : "Error per race", nerd() ? "mean over drivers of Σ(CDF_pred − CDF_actual)² / (N−1)" : "lower is better · our simulator vs trusting the starting grid",
      h("div", { html: lineChart({ labels, yLabel: "RPS", lowerBetter: true, series: [
        { name: "Simulator", color: "var(--primary-hi)", values: E.per_race.map((r) => r.model_rps), width: 3 },
        { name: "Grid baseline", color: "#9aa3b0", values: E.per_race.map((r) => r.grid_rps), dash: "6 5" },
        { name: "Pace-only", color: "var(--data)", values: E.per_race.map((r) => r.pace_rps), dash: "2 4", opacity: .85 }] }) }),
      h("div", { class: "legend" }, h("span", {}, h("i", { style: "background:var(--primary-hi)" }), "simulator (solid)"), h("span", {}, h("i", { style: "background:#9aa3b0" }), "grid baseline (dashed)"), h("span", {}, h("i", { style: "background:var(--data)" }), "pace-only (dotted)"))),
    panel("Did we call the winner?", "newest first", calls)));
  if (!nerd()) return;
  const keys = [["log_loss", "Log loss", true], ["rps", "RPS", true], ["brier_win", "Brier · win", true], ["brier_podium", "Brier · podium", true], ["brier_points", "Brier · points", true], ["mae_pos", "MAE position", true], ["spearman", "Spearman ρ", false], ["p_winner", "P(actual winner)", false], ["top3_hit", "Top-3 hit", false], ["top10_hit", "Top-10 hit", false], ["winner_correct", "Favourite won", false]];
  const mt = h("table", {}, h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Metric"), ["Simulator", "Pace-only", "Grid"].map((x) => h("th", { class: "num", scope: "col" }, x)))),
    h("tbody", {}, keys.map(([k, l, low]) => { const vals = ["model", "pace", "grid"].map((s) => a[s]?.[k]), best = low ? Math.min(...vals) : Math.max(...vals);
      return h("tr", {}, h("td", {}, l, h("span", { class: "muted" }, low ? " ↓" : " ↑")), vals.map((v) => h("td", { class: `num mono ${v === best ? "best" : ""}` }, fx(v, 4)))); })));
  const st = E.strategy, rel = state.data.reliability || {};
  put(root, h("div", { class: "grid g-main mt" },
    panel("Season scorecard", `${E.n} races · ${MODE_LABEL[mode]} · best per row in green`, h("div", { class: "table-wrap" }, mt)),
    panel("Strategy scorecard", "predicted vs executed", h("div", { class: "grid g-2" },
      stat(pct(st.stops_acc), "Stop count", "modal predicted = actual", "cyan"), stat(fx(st.stops_ll, 2), "Stop log loss", "uniform guess = 1.10", ""),
      stat(pct(st.seq_acc), "Exact sequence", "e.g. M-H-H predicted and run", ""), stat(`${fx(st.first_stop_mae, 1)}<small>laps</small>`, "First-stop error", `inside predicted window ${pct(st.first_stop_iqr_cover)}`, "")))));
  put(root, h("div", { class: "mt" }, panel("Calibration", "when we say X%, does it happen X% of the time? · dot size = number of predictions",
    h("div", { class: "grid g-3" }, [["win", "WIN", "var(--gold)"], ["podium", "PODIUM", "var(--primary-hi)"], ["points", "POINTS", "var(--data)"]].map(([k, t, col]) => h("div", { html: reliability(rel[k], col, t) }))))));
  put(root, h("div", { class: "mt", id: "race-explorer" }, raceExplorer(races, tag)));
}
function raceExplorer(races, tag) {
  if (!races.length) return h("div");
  const r = state.raceIdx != null && state.data.races[state.raceIdx]?.predictions[tag] ? state.data.races[state.raceIdx] : races[races.length - 1];
  const P = r.predictions[tag], D = P.drivers.filter((d) => d.actual != null), m = P.metrics;
  const sel = h("select", { "aria-label": "Choose race", onchange: (e) => { state.raceIdx = state.data.races.indexOf(races[+e.target.value]); rerender(); } },
    races.map((x, i) => h("option", { value: i, selected: x === r ? "selected" : null }, `R${x.round} ${x.location}`)));
  const cols = [
    { id: "d", label: "Driver", render: (d) => drvCell(d.Driver, d.Team, SHORT[d.Team] || d.Team, 30) }, { id: "g", label: "Grid", num: true, render: (d) => d.actual_grid },
    { id: "e", label: "Pred", num: true, render: (d) => "P" + fx(d.exp_pos, 1) }, { id: "a", label: "Actual", num: true, render: (d) => (d.actual_dnf ? h("span", { class: "badge bad" }, "DNF") : "P" + d.actual) },
    { id: "err", label: "Error", num: true, render: (d) => { const e = d.actual - d.exp_pos; return h("span", { class: `badge ${Math.abs(e) <= 2 ? "good" : Math.abs(e) >= 6 ? "bad" : "neutral"}` }, sgn(e, 1)); } },
    { id: "w", label: "Win %", num: true, render: (d) => pct(d.win) }, { id: "pp", label: "Pace pred / act", num: true, render: (d) => `${sgn(d.pace_pct, 2)} / ${sgn(d.actual_pace, 2)}` },
    { id: "sp", label: "Strategy pred", render: (d) => tyres(d.strategy) }, { id: "sa", label: "Strategy actual", render: (d) => tyres(d.actual_strategy) },
    { id: "fs", label: "1st stop pred/act", num: true, render: (d) => `L${fx(d.first_stop_p50, 0)} / ${d.actual_first_stop != null ? "L" + d.actual_first_stop : "-"}` },
  ];
  return panel("Race explorer", "any past race: prediction vs what happened",
    h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px" }, flag(r.country), sel,
      h("span", { class: "chip" }, `RPS ${fx(m.model_rps, 4)} vs grid ${fx(m.grid_rps, 4)}`), h("span", { class: "chip" }, `log loss ${fx(m.model_log_loss, 3)}`),
      h("span", { class: "chip" }, `ρ ${fx(m.model_spearman, 2)}`), h("span", { class: "chip" }, `stop count ${pct(m.strat_stops_acc)}`)),
    h("div", { class: "grid rx" },
      h("div", { html: scatter({ points: D.map((d) => ({ x: d.exp_pos, y: d.actual, color: teamColor(d.Team), label: d.Driver, ring: d.actual_dnf, tip: `${d.Driver}: predicted P${fx(d.exp_pos, 1)} → P${d.actual}${d.actual_dnf ? " (DNF)" : ""} · win ${pct(d.win)}` })), max: D.length, xLabel: "predicted average finish", yLabel: "actual finish" }) }),
      h("p", { class: "explain" }, h("b", {}, "Reading the chart: "), "each dot is a driver. On the dashed diagonal = predicted exactly. Above it = finished worse than expected, below = better. Hollow rings are retirements, usually the biggest misses.")),
    h("div", { class: "mt" }, table(D.slice().sort((a, b) => a.actual - b.actual), cols)));
}

/* ------------------------------------------------------------------ LAB */
const PARAM_DOC = {
  pass_thr: "s/lap advantage for a 50% pass at an average track", pass_scale: "softness of the pass curve", min_gap: "s a held-up car sits behind",
  start_gap: "s between grid slots", start_sd: "launch randomness (s)", lap1_thr_mult: "lap-1 pass threshold multiplier", pace_sd_mult: "scales model pace σ",
  lap_sd_mult: "scales per-lap noise", sc_gap: "s between cars behind the SC", sc_lap_factor: "SC lap-time multiplier", vsc_lap_factor: "VSC lap-time multiplier",
  sc_pit_factor: "pit loss under SC (× green)", vsc_pit_factor: "pit loss under VSC (× green)", sc_from_dnf: "P(retirement triggers SC/VSC)",
  opp_window: "pit under SC if planned stop is within this share of stint", extra_stop_p: "P(free extra stop under SC)", slow_stop_p: "P(slow pit stop)",
  slow_stop_mean: "mean extra time of a slow stop (s)", lap1_dnf_mult: "lap-1 retirement hazard multiplier", pace_df: "Student-t tail weight of race-day pace", grid_blend: "stacking weight of the grid→finish prior",
};
function renderLab(root) {
  const M = state.data.model || {}, pm = M.pace_models_meta || {}, sp = M.sim_params || {};
  put(root, sectionHead(["Under ", em("the hood")], "Model internals, simulator parameters and the circuit file for the next race."),
    panel("Pipeline", "python -m flatout weekend runs all of it", h("div", { class: "flow" },
      [["SYNC", "FastF1 → parquet"], ["AUDIT", "every GP checked"], ["ANALYSE", "per-race pace regression"], ["CIRCUITS", "deg · pit loss · SC · passing"], ["FEATURES", "pre-race only"], ["TRAIN", "LightGBM + ridge"], ["SIMULATE", "4M races, lap by lap"], ["EVALUATE", "proper scores vs baselines"], ["CALIBRATE", "tune sim behaviour"]]
        .flatMap(([a, b], i) => [i ? h("span", { class: "arr", "aria-hidden": "true" }, "→") : null, h("div", { class: "step" }, h("b", {}, a), b)]))));
  const scp = scenarioPanel(state.data.next), rep = reproPanel(state.data.next);
  if (scp || rep) put(root, h("div", { class: "grid g-main mt" }, scp || h("div"), rep || h("div")));
  const imp = (M.importance || []).slice(0, 12), imax = Math.max(...imp.map((x) => x.gain), 1);
  put(root, h("div", { class: "grid g-3 mt" },
    panel("Pace uncertainty", "walk-forward robust σ, % of lap", h("div", { class: "stack", style: "gap:10px" },
      Object.entries(pm.sd?.race || {}).map(([k, v]) => h("div", {}, h("div", { class: "sub" }, { quali: "after qualifying", practice: "after practice", none: "before the weekend" }[k] || k), pbar(v, "var(--data)", fx(v, 3) + " %")))),
      h("dl", { class: "kv mt" }, h("dt", {}, "race CV MAE"), h("dd", {}, fx(pm.cv?.race?.mae, 3)), h("dt", {}, "race CV RMSE"), h("dd", {}, fx(pm.cv?.race?.rmse, 3)),
        h("dt", {}, "quali CV MAE"), h("dd", {}, fx(pm.cv?.quali?.mae, 3)), h("dt", {}, "GBM share (race / quali)"), h("dd", {}, `${fx(pm.blend?.race, 1)} / ${fx(pm.blend?.quali, 1)}`))),
    panel("What drives the pace model", "LightGBM split gain", h("div", { class: "stack", style: "gap:6px" }, imp.map((x) => h("div", { style: "display:grid;grid-template-columns:150px 1fr;gap:10px;align-items:center" },
      h("span", { class: "mono muted" }, x.feature), pbar(x.gain / imax, "var(--primary)", fx(x.gain, 0)))))),
    panel("Simulator parameters", `used for forecasting · tuned ${sp.calibrated || "-"} on ${(sp.races || []).length} races · RPS ${fx(sp.rps, 4)} on those races (in-sample; see Accuracy for out-of-sample)`, h("div", { class: "table-wrap" }, h("table", {}, h("tbody", {},
      Object.entries(sp.params || {}).map(([k, v]) => h("tr", {}, h("td", { class: "mono" }, k), h("td", { class: "num mono" }, fx(v, 3)), h("td", { class: "muted", style: "white-space:normal;font-size:13px" }, PARAM_DOC[k] || "")))))))));
  const ch = M.calibration_history || [], c = state.data.next?.circuit || {};
  put(root, h("div", { class: "grid g-2 mt" },
    panel("Calibration search", "lower RPS is better", ch.length ? h("div", { html: lineChart({ labels: ch.map((x, i) => (i % 3 === 0 ? String(i) : "")), yLabel: "RPS", lowerBetter: true, yFmt: (v) => fx(v, 4), series: [{ name: "RPS", color: "var(--data)", values: ch.map((x) => x.rps) }] }) }) : h("p", { class: "sub" }, "run python -m flatout calibrate")),
    panel(`Circuit file · ${c.location || ""}`, `${c.n_races ?? 0} past races here`, h("dl", { class: "kv" },
      ...[["laps", c.n_laps], ["base lap (s)", fx(c.base_lap, 2)], ["pit loss (s)", fx(c.pit_loss, 2)], ["fuel (s/lap)", fx(c.fuel, 4)], ["lap noise σ (s)", fx(c.lap_sd, 3)],
        ["SC+red / race", fx(c.sc_per_race, 2)], ["VSC / race", fx(c.vsc_per_race, 2)], ["red share of SC", pct(c.red_share)], ["overtake factor", fx(c.overtake_factor, 3)],
        ["DNF rate / car", pct(c.dnf_rate)], ["max stint S/M/H", c.max_stint ? `${c.max_stint.SOFT}/${c.max_stint.MEDIUM}/${c.max_stint.HARD}` : "-"]].flatMap(([k, v]) => [h("dt", {}, k), h("dd", {}, v ?? "-")])))));
  put(root, h("div", { class: "mt" }, panel("Glossary", null, h("div", { class: "glossary" }, [
    ["Log loss", "−mean log P(actual position). Punishes confident misses hard. Lower is better."],
    ["RPS", "Ranked probability score: compares predicted and actual cumulative finishing distributions, so near-misses earn credit. 0 = perfect."],
    ["Brier", "Mean squared error of a yes/no probability (win, podium, points)."], ["Spearman ρ", "Rank correlation between expected and actual finishing order."],
    ["Walk-forward", "Each race is predicted by a model retrained only on earlier races."], ["Grid baseline", "Finish distribution given starting slot, learned from history."],
    ["Pace-only baseline", "Order drivers by predicted pace plus noise; no strategy, traffic, SC or reliability."], ["Car effect", "Team pace each race with both drivers' skill removed."],
    ["Driver vs car", "Finish vs the slot a car's pace is worth among that race's finishers; zero-sum per race."],
  ].map(([k, v]) => h("div", {}, h("b", {}, k), h("span", {}, v)))))));
}

/* ------------------------------------------------------------------ shell */
const RENDER = { race: renderRace, strategy: renderStrategy, drivers: renderDrivers, dvc: renderDvC, teams: renderTeams, season: renderSeason, accuracy: renderAccuracy, lab: renderLab };
const revealer = "IntersectionObserver" in window
  ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" })
  : null;
function armReveals(root) {
  if (!revealer || reduced()) return;
  root.querySelectorAll(".panel, .teamcard, .stat, .console, .podium, .awards").forEach((el) => { el.classList.add("reveal"); revealer.observe(el); });
}
function rerender() {
  const y = window.scrollY;
  // live-weather watchers belong to the view being replaced: stop them (the new view starts its own)
  if (state.radar) { state.radar.dispose(); state.radar = null; }
  if (state.wxStop) { state.wxStop(); state.wxStop = null; }
  if (state.heroCar) { state.heroCar.dispose(); state.heroCar = null; }
  if (state.car3) { state.car3.dispose(); state.car3 = null; }
  for (const [k, fn] of Object.entries(RENDER)) {
    const root = $(`#view-${k}`); root.innerHTML = "";
    if (k === state.tab) { try { fn(root); if (!window.gsap) armReveals(root); document.dispatchEvent(new CustomEvent("view:render", { detail: { tab: k, root, mode: state.mode } })); } catch (e) { console.error(e); put(root, h("div", { class: "empty" }, "Could not render this view. Reload the page; if it persists, re-run python -m flatout export. (" + e.message + ")")); } }
  }
  window.scrollTo({ top: y, behavior: "instant" });
}
function route() {
  let tab = (location.hash || "#race").slice(1);
  if (!RENDER[tab] || (tab === "lab" && !nerd())) tab = "race";
  const changed = tab !== state.tab;
  const apply = () => {
    state.tab = tab;
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.dataset.view === tab));
    document.querySelectorAll("#tabs a").forEach((a) => { const on = a.dataset.tab === tab; a.classList.toggle("active", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    rerender();
    if (changed) window.scrollTo({ top: 0, behavior: "instant" });
  };
  if (changed && state.tab && document.startViewTransition && !reduced()) document.startViewTransition(apply); else apply();
}
function setMode(m) {
  state.mode = m; document.body.dataset.mode = m;
  document.querySelectorAll(".mode-switch button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === m)));
  try { localStorage.setItem("flatout-mode", m); } catch { /* storage unavailable */ }
  const url = new URL(location.href); url.searchParams.set("mode", m); history.replaceState(null, "", url);
  if (state.tab === "lab" && m === "fan") location.hash = "#race"; else rerender();
}
function bindTips() {
  const tip = $("#tip");
  const show = (t, x, y) => { tip.textContent = t.getAttribute("data-tip"); tip.classList.add("on"); place(x, y); };
  const place = (x, y) => { const w = tip.offsetWidth, ht = tip.offsetHeight; tip.style.left = Math.min(window.innerWidth - w - 8, x + 14) + "px"; tip.style.top = (y + ht + 20 > window.innerHeight ? y - ht - 12 : y + 16) + "px"; };
  document.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-tip]"); if (!t) tip.classList.remove("on"); else show(t, e.clientX, e.clientY); });
  document.addEventListener("mousemove", (e) => { if (tip.classList.contains("on")) place(e.clientX, e.clientY); });
  document.addEventListener("focusin", (e) => { const t = e.target.closest?.("[data-tip]"); if (t) { const r = t.getBoundingClientRect(); show(t, r.left, r.bottom); } else tip.classList.remove("on"); });
}
async function init() {
  let saved = null;
  try { saved = localStorage.getItem("flatout-mode"); } catch { /* storage unavailable */ }
  document.querySelectorAll(".mode-switch button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $(".skip")?.addEventListener("click", (e) => { e.preventDefault(); $("#app").focus(); });   // don't let #app hit the hash router
  $("#drawer-close").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
  bindTips();
  if (!window.gsap) document.body.classList.add("js-reveal");   // CSS reveals are only the fallback; GSAP owns motion when loaded
  let spot = 0;   // pointer spotlight: one rAF per frame, only for the panel under the cursor
  document.addEventListener("pointermove", (e) => {
    if (spot || e.pointerType !== "mouse") return;
    spot = requestAnimationFrame(() => {
      spot = 0;
      const p = e.target.closest?.(".panel");
      if (!p) return;
      const r = p.getBoundingClientRect();
      p.style.setProperty("--mx", `${e.clientX - r.left}px`); p.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }, { passive: true });
  try {
    const res = await fetch("data/v3/site.json", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    state.data = await res.json();
  } catch (e) {
    $("#loading").innerHTML = `<p>No data yet (${esc(e.message)}).<br>Run <code>python -m flatout export</code> from the project root, then reload.</p>`;
    return;
  }
  if (state.data.team_colors) TEAM = { ...TEAM, ...state.data.team_colors };
  $("#loading").remove();
  const urlMode = new URLSearchParams(location.search).get("mode");
  state.mode = (urlMode || saved) === "nerd" ? "nerd" : "fan";
  document.body.dataset.mode = state.mode;
  document.querySelectorAll(".mode-switch button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === state.mode)));
  $("#footer").append(h("span", {}, `Data refreshed ${new Date(state.data.generated).toLocaleString()} · season ${state.data.season} · photos & logos © Formula 1 / teams, flags flagcdn.com`),
    h("span", {}, h("a", { href: "https://manasjha.online/" }, "← Back to manasjha.online"), " · Refresh with ", h("code", {}, "python -m flatout weekend"), " · ", h("a", { href: "legacy/" }, "v2 dashboard")),
    h("span", { class: "disclaimer" }, "Unofficial, non-commercial fan project. Not affiliated with, endorsed or sponsored by Formula 1, the FIA, any team, driver or sponsor. "
      + "F1, team, sponsor and supplier names and logos are trademarks of their owners and appear only to identify the teams. "
      + "3D car models are third-party works under CC BY 4.0, credited on the Teams page."));
  window.addEventListener("hashchange", route);
  state.tab = null;
  route();
}
init();
/* verified venue under the title, and the provisional-forecast explanation */
// the hero's one line of facts: plain text, first item in the accent colour
function heroLine(...parts) {
  const P = parts.filter(Boolean);
  return h("p", { class: "hero-line" }, P.map((t, i) => [i ? h("i", { "aria-hidden": "true" }, "·") : null, h("span", { class: i ? "" : "lead" }, t)]));
}
function titleEl(event) {
  const m = /^(.*?)\s*Grand Prix\s*(.*)$/i.exec(event || "");
  if (!m) return h("h1", {}, event);
  return h("h1", {}, m[1], em("Grand Prix"), m[2] ? h("span", { class: "title-tail" }, m[2]) : null);
}
function venueEl(m) {
  const id = m.identity;
  if (!id || !id.circuit_name) return null;
  return h("div", { class: "venue" }, h("b", {}, id.circuit_name), ` \u00b7 ${id.host_country}`,
    id.status === "override" && nerd() ? h("span", { class: "venue-note", "data-tip": id.note }, " \u00b7 venue verified against formula1.com") : null);
}
function provisionalEl(m) {
  if (m.status !== "provisional") return null;
  const a = m.assumptions || [];
  if (!nerd()) return h("p", { class: "provisional" }, "First race at this circuit in our data, so tyre wear, pit-stop time, safety cars and overtaking use averages from other tracks. Treat these odds as rougher than usual.");
  return h("details", { class: "provisional" }, h("summary", {}, `Provisional forecast \u00b7 ${a.length} stated assumption${a.length === 1 ? "" : "s"}`),
    h("ul", {}, a.map((x) => h("li", {}, x))));
}
const avgOf = (rows, k) => { const v = rows.map((r) => r[k]).filter((x) => x != null && isFinite(x)); return v.length ? v.reduce((a, x) => a + x, 0) / v.length : null; };
/* Accuracy headline from the nested walk-forward benchmark (the only fully out-of-sample numbers) */
// forecasts published before the race and scored afterwards (not backtests)
function liveStat() {
  const live = (state.data.races || []).map((r) => r.predictions?.pre_race?.metrics).filter(Boolean);
  if (!live.length) return stat(`0<small>races</small>`, "Live record", "no forecast published before a race has been scored yet", "");
  const won = live.filter((m) => m.model_winner_correct).length, beat = live.filter((m) => m.model_rps < m.grid_rps).length, last = live[live.length - 1];
  return stat(`${live.length}<small>race${live.length === 1 ? "" : "s"}</small>`, "Live record",
    `published before the race: winner called in ${won} of ${live.length}, closer than the grid in ${beat} of ${live.length} · latest: ${last.event}`, "");
}
function benchmarkSection(root, B, year, years) {
  const modes = Object.keys(B.summary || {});
  const mode = modes.includes(state.benchMode) ? state.benchMode : (modes.includes("post_quali") ? "post_quali" : modes[0]);
  const S = B.summary[mode], rows = B.per_race.filter((r) => r.mode === mode);
  const vsGrid = S.model_minus_grid_rps, vsPace = S.model_minus_pace_rps;
  const ref = mode === "post_quali" ? vsGrid : vsPace, refName = mode === "post_quali" ? "the starting grid" : "a pace-only ranking";
  const rel = (p, base) => (p && base ? -p.mean / base : null);
  const ci = (p) => (p && p.lo != null ? `${sgn(p.lo, 4)} to ${sgn(p.hi, 4)}` : "n/a");
  put(root, sectionHead(["How good are ", em("the predictions")],
    `Every ${year} race below was forecast using only what was known before it: the pace model, circuit settings and simulator settings were all re-fitted on earlier races. These races were also studied while building the model, so this is development evidence; the live record starts at Sepang.`,
    h("div", { class: "seg-row" },
      years.length > 1 ? h("div", { class: "seg", role: "group", "aria-label": "Season" }, years.map((y) => h("button", { class: y === year ? "on" : "", "aria-pressed": String(y === year), onclick: () => { state.benchYear = y; rerender(); } }, y))) : null,
      h("div", { class: "seg", role: "group", "aria-label": "Information available" }, modes.map((k) => h("button", { class: k === mode ? "on" : "", "aria-pressed": String(k === mode), onclick: () => { state.benchMode = k; rerender(); } }, MODE_LABEL[k] || k))))));
  const clear = ref && ref.hi != null && ref.hi < 0;
  put(root, h("p", { class: "note bench-verdict" }, clear
    ? `Clearly better than ${refName} in ${year}: the whole 95% range of the difference is below zero.`
    : `Better than ${refName} on average in ${year}, but the 95% range of the difference reaches zero, so the edge is not established for this season.`));
  const better = rows.filter((r) => r.model_rps < (mode === "post_quali" ? r.grid_rps : r.pace_rps)).length;
  put(root, h("div", { class: "grid g-4" },
    stat(`${better}<small>/${rows.length}</small>`, `Races better than ${mode === "post_quali" ? "the grid" : "pace-only"}`, `lower error than ${refName}`, "good"),
    stat(ref && ref.mean != null ? pct(rel(ref, mode === "post_quali" ? S.grid_rps : S.pace_rps)) : "n/a", "Less error on average", `95% range of the difference ${ci(ref)} (RPS)`, "cyan"),
    stat(pct(avgOf(rows, "model_p_winner")), "Chance we gave the winner", mode === "post_quali" ? `grid baseline ${pct(avgOf(rows, "grid_p_winner"))}` : "grid unknown at this point", "accent"),
    liveStat()));
  const labels = rows.map((r) => "R" + r.round);
  const series = [{ name: "Simulator", color: "var(--primary-hi)", values: rows.map((r) => r.model_rps), width: 3 },
    { name: "Pace-only", color: "var(--data)", values: rows.map((r) => r.pace_rps), dash: "2 4", opacity: .85 }];
  if (mode === "post_quali") series.splice(1, 0, { name: "Grid baseline", color: "#9aa3b0", values: rows.map((r) => r.grid_rps), dash: "6 5" });
  put(root, h("div", { class: "mt" }, panel(nerd() ? "Ranked probability score per race" : "Error per race",
    mode === "post_quali" ? "lower is better \u00b7 simulator vs the starting grid and a pace-only ranking" : "lower is better \u00b7 before the weekend the grid is unknown, so it is not a fair comparison",
    h("div", { html: lineChart({ labels, yLabel: "RPS", lowerBetter: true, series }) }),
    h("div", { class: "legend" }, series.map((s) => h("span", {}, h("i", { style: `background:${s.color}` }), s.name))))));
  if (!nerd()) return;
  const line = (name, p) => h("tr", {}, h("td", {}, name), h("td", { class: "num mono" }, p?.mean != null ? sgn(p.mean, 4) : "n/a"),
    h("td", { class: "num mono" }, ci(p)), h("td", { class: "num mono" }, p?.share_better != null ? pct(p.share_better) : "n/a"), h("td", { class: "num mono" }, p?.n ?? "n/a"));
  const t = h("table", {}, h("thead", {}, h("tr", {}, ["Comparison (model \u2212 baseline)", "Mean", "95% bootstrap range", "Races better", "Races"].map((x, i) => h("th", { class: i ? "num" : "", scope: "col" }, x)))),
    h("tbody", {}, mode === "post_quali" ? [line("RPS vs grid", S.model_minus_grid_rps), line("Log loss vs grid", S.model_minus_grid_log_loss)] : [],
      line("RPS vs pace-only", S.model_minus_pace_rps), line("Log loss vs pace-only", S.model_minus_pace_log_loss)));
  put(root, h("div", { class: "grid g-main mt" },
    panel("Paired comparison", `${rows.length} races \u00b7 negative = model better \u00b7 races are the independent unit`, h("div", { class: "table-wrap" }, t)),
    panel("How this was measured", B.id, h("ul", { class: "method" },
      h("li", {}, `Simulator settings re-tuned before each race on the ${B.config.calib_last_n} races before it (${B.config.calib_sims.toLocaleString()} simulations per race per trial).`),
      h("li", {}, `Each scored race simulated ${B.config.eval_sims.toLocaleString()} times per mode; Monte Carlo error is far below the differences shown.`),
      h("li", {}, "Grid baseline: actual grid spread with a grid-to-finish table learned from earlier races. Only used after qualifying."),
      h("li", {}, "Note: before 27 Sep 2026 this page quoted a backtest whose simulator settings had been tuned on the same races (in-sample). Re-measured properly (above), the result is similar, but these numbers replace it.")))));
}
/* behaviour forecast vs model recommendation (static plans, common random numbers) */
function strategyRecoPanel(nx) {
  const R = nx.recommendations;
  if (!R || !R.drivers) return null;
  const rows = Object.entries(R.drivers).map(([code, r]) => {
    const d = nx.drivers.find((x) => x.Driver === code) || {};
    const best = r.plans.find((p) => p.plan === r.best) || {};
    return { code, team: d.Team, likely: d.strategy, best: r.best, gain: r.gain_pos, bestPod: best.podium, se: best.se_pos };
  });
  const t = h("table", {}, h("thead", {}, h("tr", {}, ["Driver", "Likely plan (behaviour)", "Best plan under the model", "Gain vs likely mix"].map((x, i) => h("th", { class: i === 3 ? "num" : "", scope: "col" }, x)))),
    h("tbody", {}, rows.map((r) => h("tr", {}, h("td", {}, drvCell(r.code, r.team, SHORT[r.team] || r.team, 28)), h("td", {}, tyres(r.likely)), h("td", {}, tyres(r.best)),
      h("td", { class: "num mono", "data-tip": `Monte Carlo s.e. ~${fx(r.se, 3)} places` }, `${sgn(r.gain, 2)} places`)))));
  return panel(nerd() ? "Behaviour forecast vs recommendation" : "What teams will likely do vs what the model rates best",
    nerd() ? R.scope : "Each plan was simulated against the same race conditions. This compares plans inside the model, not in the real world.",
    h("div", { class: "table-wrap" }, t),
    h("p", { class: "note" }, nx.meta.status === "provisional"
      ? "Provisional: tyre wear and pit-lane loss here come from other circuits, so these plan rankings could change once practice data exists."
      : "Plans are fixed before the start; reactions to safety cars use the same rules for every plan."));
}
/* Lab: precomputed what-if scenarios (static site, no live recomputation) */
function scenarioPanel(nx) {
  const S = nx?.scenarios;
  if (!S || !S.scenarios?.length) return null;
  const base = S.scenarios[0], fav = base.drivers.slice(0, 5).map((d) => d.Driver);
  const val = (sc, code) => (sc.drivers.find((d) => d.Driver === code) || {}).win;
  const t = h("table", {}, h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Scenario"), fav.map((c) => h("th", { class: "num", scope: "col" }, c)), h("th", { class: "num", scope: "col" }, "P(SC)"))),
    h("tbody", {}, S.scenarios.map((sc) => h("tr", {}, h("td", {}, sc.label),
      fav.map((c) => { const v = val(sc, c), b = val(base, c), dlt = v != null && b != null ? v - b : null;
        return h("td", { class: "num mono" }, v == null ? "\u2013" : pct(v), sc === base || dlt == null ? null : h("small", { class: dlt > 0 ? "up" : "down" }, ` ${dlt > 0 ? "+" : ""}${(dlt * 100).toFixed(1)}`)); }),
      h("td", { class: "num mono" }, pct(sc.p_sc))))));
  return panel("What if?", `win chance of today's top five \u00b7 ${S.n_sims.toLocaleString()} races per scenario, same random numbers`,
    h("div", { class: "table-wrap" }, t),
    h("p", { class: "note" }, S.note + " " + (S.not_available || []).join(" ")));
}
function reproPanel(nx) {
  const P = nx?.provenance, m = nx?.meta;
  if (!P) return null;
  const short = (x) => (x ? String(x).slice(0, 10) : "–");
  const rows = [["Forecast run", m.run || m.created_utc], ["Mode", MODE_LABEL[m.mode] || m.mode], ["Issued (UTC)", m.created_utc],
    ["Code", `${short(P.code?.git_rev)}${P.code?.dirty ? " + uncommitted changes " + short(P.code?.dirty_diff_sha256) : ""}`],
    ["Data store", `${P.data?.store_files ?? "?"} files · ${short(P.data?.store_sha256)}`], ["Pace model", short(P.model_meta_sha256)],
    ["Sim settings", short(P.sim_params_sha256)], ["Seed", P.seed ? `${P.seed.root ?? P.seed.base} · ${P.seed.scheme}` : "–"],
    ["Simulations", Number(m.n_sims).toLocaleString()], ["Inputs missing", (m.inputs_missing || []).join(", ") || "none"]];
  return panel("Reproducibility", "everything needed to re-run this exact forecast",
    h("table", { class: "repro" }, h("tbody", {}, rows.map(([k, v]) => h("tr", {}, h("th", { scope: "row" }, k), h("td", { class: "mono" }, v))))));
}
/* official 2D layout (traced from the formula1.com circuit map) when no telemetry lap exists */
function layoutSection(nx) {
  const t = nx.track, m = nx.meta, id = m.identity || {}, c = nx.circuit;
  const d = "M" + t.points.map((p) => p.join(",")).join(" L") + " Z";
  const pad = 70, vb = `${-pad} ${-pad} ${t.w + 2 * pad} ${t.h + 2 * pad}`;
  const [sx, sy] = t.points[0];
  const svg = `<svg viewBox="${vb}" role="img" aria-label="${esc(id.circuit_name || m.location)} layout with ${t.corners.length} numbered turns">
    <path class="lay-bg" d="${d}"/><path class="lay" d="${d}"/>
    <line class="lay-sf" x1="${sx}" y1="${sy - 26}" x2="${sx}" y2="${sy + 26}"/>
    ${t.corners.map((k) => `<g class="lay-turn"><circle cx="${k.x}" cy="${k.y}" r="19"/><text x="${k.x}" y="${k.y + 7}">${k.n}</text></g>`).join("")}
  </svg>`;
  return h("section", { class: "c3 c3-layout", "aria-labelledby": "c3-title" },
    h("div", { class: "c3-hud" },
      h("div", { class: "c3-tl" }, h("span", {}, `CIRCUIT_${String(m.round).padStart(2, "0")}`), h("h2", { id: "c3-title" }, id.circuit_name || m.location)),
      h("dl", { class: "c3-tr" }, [["Length", id.length_km ? `${fx(id.length_km, 3)} km` : "\u2013"], ["Turns", t.corners.length], ["Laps", c.n_laps]].map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, String(v)))))),
    h("div", { class: "lay-map", html: svg }),
    h("p", { class: "c3-none-msg" }, "Official layout, traced from the formula1.com circuit map. The speed-coloured 3D view needs a recorded lap, and there is none at Sepang in the telemetry this site uses (FastF1 position data starts in 2018; the last race here was 2017), so no speed, elevation or car is shown."));
}
/* 3D scene for a layout-only circuit: flat and single-colour because no speed or elevation data exists */
function circuit3dLayout(nx, fav) {
  const t = nx.track, m = nx.meta, id = m.identity || {}, c = nx.circuit;
  if (state.c3dispose) { state.c3dispose(); state.c3dispose = null; }
  const fallback = h("div", { class: "c3-fallback" }, trackCard(nx)?.querySelector(".map") || null);
  const el = h("section", { class: "c3 c3-flat", "aria-labelledby": "c3-title", style: `--team:${teamColor(fav.Team)}` },
    fallback,
    h("div", { class: "c3-labels", "aria-hidden": "true" }),
    h("div", { class: "c3-hud" },
      h("div", { class: "c3-tl" }, h("span", {}, `CIRCUIT_${String(m.round).padStart(2, "0")}`), h("h2", { id: "c3-title" }, id.circuit_name || m.location)),
      h("dl", { class: "c3-tr" }, [["Length", id.length_km ? `${fx(id.length_km, 3)} km` : "\u2013"], ["Turns", t.corners.length], ["Laps", c.n_laps]].map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, String(v))))),
      h("div", { class: "c3-bl" }, h("p", {}, "Official layout, traced from the formula1.com circuit map. There is no recorded lap here in the telemetry this site uses, so the track is shown flat and in one colour: no speed, elevation or car.")),
      h("div", { class: "c3-br", "aria-hidden": "true" }, h("span", { class: "c3-hint" }, "Drag to rotate"))));
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    import("./circuit3d.js?v=2ff3b714ee").then((mod) => mod.mount(el, t, { accent: teamColor(fav.Team) }))
      .then((dispose) => { el.classList.add("live"); state.c3dispose = dispose; })
      .catch((err) => { el.classList.add("flat"); console.info("3D circuit unavailable, showing the flat map:", err.message); });
  }, { rootMargin: "400px 0px" });
  io.observe(el);
  return el;
}
