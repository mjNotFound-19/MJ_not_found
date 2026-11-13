// The portfolio home page: plain JavaScript over a static page (index.html).
// Everything here is an enhancement: the page reads fine without it.
(() => {
  "use strict";
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const root = document.documentElement;
  const EMAIL = "manasjha.015@gmail.com";
  const F1_URL = "/f1/";
  const F1_DATA = "/f1/data/v3/site.json";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // Each feature starts on its own, so one failing never takes the page down.
  const feature = (name, start) => { try { start(); } catch (error) { console.warn(`[${name}] skipped:`, error); } };
  // Things other features (and the command line) can call.
  const api = {};

  $("#year").textContent = new Date().getFullYear();

  // ----- Toast + email -----
  const toast = $("#toast");
  let toastTimer = 0;
  const say = (message) => {
    toast.textContent = message;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2600);
  };
  api.copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      say("Email copied: " + EMAIL);
      return true;
    } catch {
      window.location.href = "mailto:" + EMAIL;
      return false;
    }
  };
  $$("[data-copy-email]").forEach((btn) => btn.addEventListener("click", api.copyEmail));
  api.goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });

  // ----- Atlanta's clock, so "is he awake?" has an answer -----
  feature("clock", () => {
    const el = $("#clock");
    const format = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
    const tick = () => { el.textContent = "· " + format.format(new Date()) + " there"; };
    tick();
    setInterval(tick, 20000);
  });

  // ----- Theme: the new colours spread out from the button -----
  feature("theme", () => {
    const btn = $("#theme");
    const meta = $('meta[name="theme-color"]');
    const set = (theme) => {
      root.dataset.theme = theme;
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      try { localStorage.setItem("theme", theme); } catch { /* private mode: lasts for this visit */ }
    };
    api.toggleTheme = (event) => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      if (!document.startViewTransition || reduce) return set(next);
      const box = btn.getBoundingClientRect();
      const x = event?.clientX || box.left + box.width / 2;
      const y = event?.clientY || box.top + box.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add("theme-vt");
      const transition = document.startViewTransition(() => set(next));
      transition.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      }).catch(() => {});
      transition.finished.finally(() => root.classList.remove("theme-vt"));
    };
    btn.setAttribute("aria-label", root.dataset.theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    btn.addEventListener("click", api.toggleTheme);
    void meta;
  });

  // ----- Name: decodes once, without blocking anything -----
  feature("name", () => {
    if (reduce) return;
    const el = $("#name");
    const final = el.textContent;
    const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789<>/=+*";
    const start = performance.now();
    const DURATION = 900;
    const frame = (now) => {
      const progress = Math.min(1, (now - start) / DURATION);
      const settled = Math.floor(progress * final.length);
      el.textContent = [...final].map((ch, i) => (i < settled || ch === " " ? ch : glyphs[(Math.random() * glyphs.length) | 0])).join("");
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = final;
    };
    requestAnimationFrame(frame);
  });

  // ----- Rain: made of my own words, brighter near the pointer, hides a secret -----
  feature("rain", () => {
    if (reduce) return;
    const stage = $(".stage");
    const canvas = $("#rain");
    const ctx = canvas.getContext("2d");
    const WORDS = ["AGENTS", "EVALS", "PYTORCH", "RAG", "GCP", "TIMESFM", "13.4%", "15M/MIN", "4M", "LIGHTGBM", "PYTHON", "SQL", "GRAFANA", "TFT", "BENCHMARK", "BUILD", "BREAK", "MEASURE", "SHIP"];
    const SECRET = "MJ::MAY-2004::LEO MESSI::MAX VERSTAPPEN  ";
    const CELL = 20;
    const ROW = 18;
    let width = 0, height = 0, columns = [], visible = true, last = 0, secretUntil = 0;
    const pointer = { x: -999, y: -999 };

    const stream = () => Array.from({ length: 6 }, () => WORDS[(Math.random() * WORDS.length) | 0]).join("  ");
    // On first paint the columns start spread down the screen, so the rain is
    // already falling instead of trickling in from the top.
    const fresh = (x, scatter) => ({ x, row: scatter ? Math.random() * (height / ROW) : -Math.random() * 12, speed: 0.3 + Math.random() * 0.5, text: stream(), on: Math.random() < 0.72 });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = stage.clientWidth;
      height = stage.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, width, height);
      columns = Array.from({ length: Math.ceil(width / CELL) }, (_, i) => fresh(i * CELL + 4, true));
    };
    const draw = (now) => {
      requestAnimationFrame(draw);
      // ~30 frames a second is plenty for falling text, and half the work.
      if (!visible || document.hidden || now - last < 33) return;
      last = now;
      const secret = now < secretUntil;
      ctx.fillStyle = "rgba(5, 7, 12, 0.085)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = "500 14px 'JetBrains Mono', monospace";
      columns.forEach((col, i) => {
        if (!col.on && !secret) return;
        const before = Math.floor(col.row);
        col.row += col.speed * (secret ? 1.6 : 1);
        const row = Math.floor(col.row);
        if (row === before || row < 0) return;
        const text = secret ? SECRET : col.text;
        const y = row * ROW;
        const near = Math.hypot(col.x - pointer.x, y - pointer.y) < 150;
        // The previous head cools down to the body colour; the new head is bright.
        ctx.fillStyle = secret ? "rgba(182, 255, 68, 0.75)" : near ? "rgba(150, 225, 255, 0.95)" : "rgba(60, 196, 255, 0.5)";
        ctx.fillText(text[(before + i * 3) % text.length] || " ", col.x, before * ROW);
        ctx.fillStyle = secret ? "#eaffc4" : "#eaf6ff";
        ctx.fillText(text[(row + i * 3) % text.length] || " ", col.x, y);
        if (y > height + Math.random() * 400) columns[i] = fresh(col.x, false);
      });
    };
    api.decode = () => {
      secretUntil = performance.now() + 7000;
      columns.forEach((col) => { col.row = -Math.random() * 10; });
    };
    new ResizeObserver(resize).observe(stage);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(stage);
    stage.addEventListener("pointermove", (event) => {
      const box = stage.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
    }, { passive: true });
    stage.addEventListener("pointerleave", () => { pointer.x = pointer.y = -999; });
    resize();
    requestAnimationFrame(draw);
  });

  // ----- Portrait: the photo redrawn as characters. Every cell can decode from
  // code to photo, and back, through a short scramble: under the pointer, or in
  // a wave across the whole frame when the button is pressed. -----
  feature("portrait", () => {
    const wrap = $("#portrait");
    const img = $("img", wrap);
    const canvas = $("canvas", wrap);
    const ctx = canvas.getContext("2d");
    const toggle = $("#portrait-toggle");
    const hint = $("#portrait-hint");
    const RAMP = " .,:;-=+*x#%@";
    const SCRAMBLE = "01<>/\\{}[]#%@*+=";
    const DECODE_SECONDS = 0.45; // one cell: code -> scramble -> photo
    const WAVE_SPEED = 950; // css px per second, how fast the button's wave spreads
    const ascii = document.createElement("canvas");
    const photo = document.createElement("canvas");
    let width = 0, height = 0, dpr = 1, raf = 0, last = 0, lastFlick = -1;
    let shown = false; // what the button last asked for: false = code, true = photo
    let grid = null;
    let bornRows = reduce ? Infinity : 0; // the code types in row by row on first load
    const lens = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0 };

    // The photo is a cut-out whose hair touches its top edge. Draw it whole, a
    // little smaller than the frame and standing on the bottom edge, so there's
    // headroom above the hair and the shoulders run off the bottom.
    const FILL = 0.9;
    const place = (target, w, h) => {
      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight) * FILL;
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      target.drawImage(img, (w - dw) / 2, h - dh, dw, dh);
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      [canvas, ascii, photo].forEach((c) => { c.width = Math.round(width * dpr); c.height = Math.round(height * dpr); });
      const pctx = photo.getContext("2d");
      pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      place(pctx, width, height);

      // One character per cell, denser = brighter. The grid tiles the frame
      // exactly (cell sizes are fractional), and each cell is the average of the
      // very pixels of the finished photo layer that sit under it. So the code
      // and the photo line up by construction, at any size.
      const cols = Math.round(width / (width < 340 ? 6 : 7));
      const cellW = width / cols;
      const rows = Math.round(height / (cellW * 1.55));
      const cellH = height / rows;
      const small = document.createElement("canvas");
      small.width = cols; small.height = rows;
      const sctx = small.getContext("2d", { willReadFrequently: true });
      sctx.imageSmoothingQuality = "high";
      sctx.drawImage(photo, 0, 0, photo.width, photo.height, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data; // throws on file:// (handled by `feature`)
      const count = cols * rows;
      const lights = new Float32Array(count);
      const person = new Uint8Array(count); // enough of the person here to draw a character
      const hasPhoto = new Uint8Array(count); // any photo pixels here at all (soft hair edges)
      for (let i = 0; i < count; i += 1) {
        lights[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
        person[i] = data[i * 4 + 3] > 50 ? 1 : 0;
        hasPhoto[i] = data[i * 4 + 3] > 2 ? 1 : 0;
      }
      // The photo is mostly dark (black hair, black jacket), so stretch its
      // brightness to the full range before picking characters.
      const sorted = Float32Array.from(lights.filter((_, i) => person[i])).sort();
      const low = sorted[Math.floor(sorted.length * 0.05)];
      const high = sorted[Math.floor(sorted.length * 0.985)];
      const actx = ascii.getContext("2d");
      actx.setTransform(dpr, 0, 0, dpr, 0, 0);
      actx.clearRect(0, 0, width, height);
      actx.font = `700 ${cellH * 0.92}px 'JetBrains Mono', monospace`;
      actx.textAlign = "center";
      actx.textBaseline = "middle";
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const i = r * cols + c;
          if (!person[i]) continue;
          const raw = (lights[i] - low) / Math.max(0.01, high - low);
          // A floor, so black hair and the black jacket still draw as faint
          // characters and the whole silhouette reads, not just the face.
          const light = 0.16 + 0.84 * Math.pow(Math.min(1, Math.max(0, raw)), 0.7);
          const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(light * RAMP.length))];
          if (ch === " ") continue;
          actx.fillStyle = `rgba(${Math.round(110 + light * 145)}, ${Math.round(200 + light * 55)}, 255, ${0.5 + light * 0.5})`;
          actx.fillText(ch, (c + 0.5) * cellW, (r + 0.5) * cellH);
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const base = new Uint8Array(count).fill(shown ? 1 : 0);
      grid = {
        cols, rows, cellW, cellH, count, person, hasPhoto,
        base, // where each cell rests when nothing is over it: 0 code, 1 photo
        level: Float32Array.from(base), // where it is right now, 0..1
        drawn: new Float32Array(count).fill(-1), // the level last painted, to skip unchanged cells
        flipAt: new Float64Array(count), // when the button's wave reaches this cell (0 = not pending)
        flipTo: shown ? 1 : 0,
      };
    };

    // Paint one cell for its current level: code, scrambling, photo arriving, or photo.
    const paintCell = (i, c, r, level) => {
      const g = grid;
      const x = Math.round(c * g.cellW * dpr), y = Math.round(r * g.cellH * dpr);
      const w = Math.round((c + 1) * g.cellW * dpr) - x, h = Math.round((r + 1) * g.cellH * dpr) - y;
      ctx.clearRect(x, y, w, h);
      if (level <= 0) {
        if (g.person[i]) ctx.drawImage(ascii, x, y, w, h, x, y, w, h);
        return;
      }
      const glyph = () => ctx.fillText(SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0], (c + 0.5) * g.cellW * dpr, (r + 0.5) * g.cellH * dpr);
      if (level < 0.65) {
        // Scramble: the character flickers through symbols, heating from blue to white.
        if (!g.person[i]) return;
        ctx.fillStyle = level < 0.3 ? "rgba(140, 222, 255, 0.95)" : "#f4fbff";
        glyph();
        return;
      }
      if (g.hasPhoto[i]) ctx.drawImage(photo, x, y, w, h, x, y, w, h);
      if (level < 1 && g.person[i]) {
        // The last symbols fade off the photo as it settles.
        ctx.fillStyle = `rgba(244, 251, 255, ${((1 - level) / 0.35) * 0.75})`;
        glyph();
      }
    };

    const frame = (now) => {
      raf = 0;
      const g = grid;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      let busy = false;

      lens.x += (lens.tx - lens.x) * 0.3;
      lens.y += (lens.ty - lens.y) * 0.3;
      lens.r += (lens.tr - lens.r) * 0.2;
      if (Math.abs(lens.tr - lens.r) > 0.5 || Math.hypot(lens.tx - lens.x, lens.ty - lens.y) > 0.5) busy = true;
      else lens.r = lens.tr;

      if (bornRows < g.rows) { bornRows += Math.max(1, g.rows / 40); busy = true; }
      const step = reduce ? 1 : dt / DECODE_SECONDS;
      const flick = Math.floor(now / 55); // scrambling symbols change about 18 times a second
      const reshuffle = flick !== lastFlick;
      lastFlick = flick;
      const r2 = lens.r * lens.r;
      ctx.font = `700 ${g.cellH * 0.92 * dpr}px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let r = 0; r < g.rows && r < bornRows; r += 1) {
        for (let c = 0; c < g.cols; c += 1) {
          const i = r * g.cols + c;
          if (g.flipAt[i]) {
            if (now >= g.flipAt[i]) { g.base[i] = g.flipTo; g.flipAt[i] = 0; }
            else busy = true;
          }
          if (!g.hasPhoto[i]) continue; // empty background: nothing to draw in either state
          const dx = (c + 0.5) * g.cellW - lens.x, dy = (r + 0.5) * g.cellH - lens.y;
          const target = g.base[i] || (lens.r > 1 && dx * dx + dy * dy < r2) ? 1 : 0;
          let level = g.level[i];
          if (level !== target) {
            level = target > level ? Math.min(1, level + step) : Math.max(0, level - step);
            g.level[i] = level;
            busy = true;
          }
          const moving = level > 0 && level < 1;
          if (g.drawn[i] !== level || (moving && reshuffle)) {
            paintCell(i, c, r, level);
            g.drawn[i] = level;
          }
        }
      }
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const request = () => { if (!raf && grid) raf = requestAnimationFrame(frame); };

    // The button's wave: every cell flips a moment later the further it is from
    // where the wave started, with a little randomness so the edge looks alive.
    const flipAll = (toPhoto, originX, originY) => {
      shown = toPhoto;
      const g = grid;
      if (!g) return;
      const now = performance.now();
      g.flipTo = toPhoto ? 1 : 0;
      for (let r = 0; r < g.rows; r += 1) {
        for (let c = 0; c < g.cols; c += 1) {
          const distance = Math.hypot((c + 0.5) * g.cellW - originX, (r + 0.5) * g.cellH - originY);
          g.flipAt[r * g.cols + c] = now + (reduce ? 0 : (distance / WAVE_SPEED) * 1000 + Math.random() * 160) + 1;
        }
      }
      request();
    };

    const start = () => {
      // A frame with no size (hidden tab, collapsed layout) can't be sampled:
      // wait for the observer to report a real size instead.
      const sized = () => wrap.clientWidth > 1 && wrap.clientHeight > 1;
      if (sized()) {
        build();
        wrap.classList.add("is-ready");
        request();
      }
      new ResizeObserver(() => {
        if (!sized() || (wrap.clientWidth === width && wrap.clientHeight === height)) return;
        const first = !grid;
        build();
        wrap.classList.add("is-ready");
        if (!first) bornRows = Infinity;
        request();
      }).observe(wrap);

      const aim = (event) => {
        const box = canvas.getBoundingClientRect();
        lens.tx = event.clientX - box.left;
        lens.ty = event.clientY - box.top;
        if (lens.r < 1) { lens.x = lens.tx; lens.y = lens.ty; }
        lens.tr = Math.min(120, width * 0.3);
        request();
      };
      const release = () => { lens.tr = 0; request(); };
      canvas.addEventListener("pointermove", aim);
      canvas.addEventListener("pointerdown", aim);
      canvas.addEventListener("pointerleave", release);
      canvas.addEventListener("pointercancel", release);
      // On touch there is no hover: the decoded patch closes when the finger lifts.
      canvas.addEventListener("pointerup", (event) => { if (event.pointerType !== "mouse") release(); });

      toggle.addEventListener("click", () => {
        const box = canvas.getBoundingClientRect();
        const from = toggle.getBoundingClientRect();
        flipAll(!shown, from.left + from.width / 2 - box.left, from.top + from.height / 2 - box.top);
        toggle.setAttribute("aria-pressed", String(shown));
        toggle.textContent = shown ? "show code" : "show photo";
        hint.textContent = shown ? "// decoded" : finePointer ? "// move over the code" : "// touch the code";
      });
      if (!finePointer) hint.textContent = "// touch the code";
    };
    if (img.complete && img.naturalWidth) start();
    else img.addEventListener("load", () => feature("portrait", start), { once: true });
  });

  // ----- Statement: split into words for the CSS fill -----
  feature("statement", () => {
    const el = $("#statement");
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", words.join(" "));
    el.replaceChildren(...words.flatMap((word, i) => {
      const span = document.createElement("span");
      span.textContent = word;
      span.style.setProperty("--i", i);
      span.setAttribute("aria-hidden", "true");
      return [span, " "];
    }));
  });

  // ----- Reveal + pipeline status -----
  feature("scroll", () => {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        reveal.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    $$("[data-reveal]").forEach((el) => reveal.observe(el));

    // The header is a CI pipeline: stages you've scrolled past have passed,
    // the one on screen is running, the rest are waiting.
    const stages = $$(".pipe a").map((link) => ({ link, section: document.getElementById(link.dataset.stage) }));
    const after = $("#tools");
    let queued = false;
    const update = () => {
      queued = false;
      const line = innerHeight * 0.45;
      let current = -1;
      stages.forEach((stage, i) => { if (stage.section.getBoundingClientRect().top <= line) current = i; });
      const allDone = after.getBoundingClientRect().top <= line;
      stages.forEach((stage, i) => {
        const state = allDone || i < current ? "passed" : i === current ? "running" : "pending";
        stage.link.dataset.state = state;
        stage.link.setAttribute("aria-current", String(state === "running"));
        stage.link.title = `${stage.link.dataset.stage}: ${state}`;
      });
    };
    addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  });

  // ----- Case files: a card grows into a sheet -----
  feature("sheet", () => {
    const dialog = $("#sheet");
    const panel = $(".sheet-panel", dialog);
    const body = $("#sheet-body");
    const canMorph = Boolean(document.startViewTransition) && !reduce;
    let source = null;

    const fill = (card) => {
      const copy = card.cloneNode(true);
      $$(".lights, .js-only, [id]", copy).forEach((el) => (el.matches(".lights, .js-only") ? el.remove() : el.removeAttribute("id")));
      const details = $("details.more", copy);
      const full = $(".proj-full", copy);
      details.replaceWith(full);
      const title = $("h3", copy);
      title.id = "sheet-title";
      const column = $(".f1-col", copy);
      body.replaceChildren(...(column ? column.childNodes : copy.childNodes));
    };
    const open = (card) => {
      source = card;
      fill(card);
      if (!canMorph) return dialog.showModal();
      card.style.viewTransitionName = "sheet";
      const transition = document.startViewTransition(() => {
        card.style.viewTransitionName = "";
        dialog.showModal();
        panel.style.viewTransitionName = "sheet";
      });
      transition.finished.finally(() => { panel.style.viewTransitionName = ""; });
    };
    const close = () => {
      if (!dialog.open) return;
      if (!canMorph || !source) return dialog.close();
      panel.style.viewTransitionName = "sheet";
      const card = source;
      const transition = document.startViewTransition(() => {
        panel.style.viewTransitionName = "";
        dialog.close();
        card.style.viewTransitionName = "sheet";
      });
      transition.finished.finally(() => { card.style.viewTransitionName = ""; });
    };
    $$(".proj details.more > summary").forEach((summary) => {
      summary.addEventListener("click", (event) => {
        event.preventDefault();
        open(summary.closest(".proj"));
      });
    });
    $("#sheet-close").addEventListener("click", close);
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
    dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
    // Links inside a sheet that point at a section should close it first.
    body.addEventListener("click", (event) => { if (event.target.closest('a[href^="#"]')) dialog.close(); });
  });

  // ----- f1.h: live forecast -----
  feature("f1-live", () => {
    const card = $("#f1");
    const label = $("#f1-event");
    const list = $("#f1-odds");
    const load = async () => {
      label.textContent = "Loading the latest forecast from f1.h…";
      try {
        const response = await fetch(F1_DATA, { signal: AbortSignal.timeout(12000) });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const data = await response.json();
        const meta = data.next.meta;
        const top = [...data.next.drivers].sort((a, b) => b.win - a.win).slice(0, 5);
        const best = top[0].win;
        label.textContent = `Live from f1.h · Round ${meta.round}, ${meta.event} · ${meta.n_sims.toLocaleString("en-US")} races simulated`;
        list.replaceChildren(...top.map((driver) => {
          const li = document.createElement("li");
          const code = document.createElement("span");
          code.textContent = driver.Driver;
          const bar = document.createElement("span");
          bar.className = "bar";
          const fill = document.createElement("span");
          fill.style.background = data.team_colors?.[driver.Team] ?? "#9aa3b0";
          fill.style.setProperty("--w", (driver.win / best).toFixed(3));
          bar.append(fill);
          const pct = document.createElement("span");
          pct.textContent = (driver.win * 100).toFixed(1) + "%";
          pct.style.textAlign = "right";
          li.append(code, bar, pct);
          li.title = `${driver.Driver} (${driver.Team}): ${(driver.win * 100).toFixed(1)}% chance to win`;
          return li;
        }));
        requestAnimationFrame(() => requestAnimationFrame(() => list.classList.add("is-in")));
      } catch {
        label.textContent = "Couldn't reach f1.h for the live forecast just now. The numbers above are from the project itself.";
      }
    };
    const watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      watch.disconnect();
      load();
    }, { rootMargin: "200px 0px" });
    watch.observe(card);
  });

  // ----- f1.h: start-lights reaction test -----
  feature("lights", () => {
    const lamps = $$("#gantry span");
    const message = $("#lights-msg");
    const button = $("#lights-btn");
    let phase = "idle"; // idle -> wait (lights coming on, then held) -> go -> idle
    let timers = [];
    let lightsOutAt = 0;
    const bestKey = "f1-reaction-best";
    const readBest = () => { try { return Number(localStorage.getItem(bestKey)) || null; } catch { return null; } };
    const setPhase = (next, text) => { phase = next; button.dataset.phase = next; button.textContent = text; };
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const setMessage = (big, small) => {
      message.replaceChildren();
      if (big) { const b = document.createElement("b"); b.textContent = big; message.append(b); }
      message.append(small);
    };
    const reset = (text = "Start the lights") => { clear(); lamps.forEach((lamp) => lamp.classList.remove("is-on")); setPhase("idle", text); };

    const begin = () => {
      setPhase("wait", "Wait for lights out…");
      setMessage("", "Press the moment all five go dark.");
      lamps.forEach((lamp, i) => timers.push(setTimeout(() => lamp.classList.add("is-on"), 700 * (i + 1))));
      // Like a real start: an unpredictable hold after the fifth light.
      const hold = 700 * lamps.length + 500 + Math.random() * 1700;
      timers.push(setTimeout(() => {
        lamps.forEach((lamp) => lamp.classList.remove("is-on"));
        lightsOutAt = performance.now();
        setPhase("go", "GO!");
      }, hold));
    };
    const press = (event) => {
      if (event.type === "keydown" && event.key !== " " && event.key !== "Enter") return;
      if (event.type === "keydown" && event.repeat) return;
      event.preventDefault();
      if (phase === "idle") return begin();
      if (phase === "wait") {
        reset("Try again");
        return setMessage("Jump start", "You went before lights out. That's a penalty.");
      }
      const seconds = (performance.now() - lightsOutAt) / 1000;
      const previous = readBest();
      const isBest = !previous || seconds < previous;
      if (isBest) { try { localStorage.setItem(bestKey, String(seconds)); } catch { /* not saved in private mode */ } }
      reset("Go again");
      setMessage(seconds.toFixed(3) + " s", isBest ? "Your best so far. A good F1 start is about 0.2 s." : `Your best is ${previous.toFixed(3)} s.`);
    };
    // pointerdown + keydown, not click: a click only fires on release, which adds delay.
    button.addEventListener("pointerdown", press);
    button.addEventListener("keydown", press);
    new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && phase !== "idle") reset(); }).observe(button);
  });

  // ----- Measure: the numbers run like a test suite -----
  feature("tests", () => {
    const rows = $$("#tests li").map((li) => ({ li, state: $(".t-state", li), value: $(".t-val", li), final: $(".t-val", li).textContent }));
    const summary = $("#tests-sum");
    const spinner = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
    let runId = 0;
    const run = async () => {
      const id = ++runId;
      const started = performance.now();
      rows.forEach((row) => { row.li.dataset.s = "idle"; row.state.textContent = "·"; row.value.textContent = "…"; });
      summary.textContent = "collected 6 items";
      for (const row of rows) {
        row.li.dataset.s = "run";
        for (let step = 0; step < 6; step += 1) {
          if (id !== runId) return;
          row.state.textContent = spinner[step % spinner.length];
          // Digits flicker while the "test" runs, then settle on the real number.
          row.value.textContent = row.final.replace(/\d/g, () => String((Math.random() * 10) | 0));
          await sleep(40);
        }
        row.li.dataset.s = "pass";
        row.state.textContent = "✓";
        row.value.textContent = row.final;
      }
      summary.textContent = `6 passed, 0 failed in ${((performance.now() - started) / 1000).toFixed(2)}s`;
    };
    if (reduce) return;
    $("#tests-rerun").addEventListener("click", run);
    const watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      watch.disconnect();
      run();
    }, { threshold: 0.35 });
    watch.observe($("#tests"));
  });

  // ----- Ship: a strip that shows which roles overlapped -----
  feature("timeline", () => {
    const strip = $("#strip .lane-wrap");
    const label = $("#strip-label");
    const month = (text) => { const [y, m] = text.split("-").map(Number); return y * 12 + (m - 1); };
    const now = new Date();
    const end = now.getFullYear() * 12 + now.getMonth();
    const roles = $$("details.xp").map((el) => ({
      el,
      from: month(el.dataset.from),
      to: el.dataset.to ? month(el.dataset.to) : end,
      live: !el.dataset.to,
      name: $(".xp-role", el).firstChild.textContent.trim() + ", " + $(".xp-org", el).textContent.split("·")[0].trim(),
    })).sort((a, b) => a.from - b.from);
    const start = roles[0].from;
    const span = end - start + 1;
    // Greedy lanes: a role takes the first lane that's free when it starts.
    const laneEnds = [];
    roles.forEach((role) => {
      let lane = laneEnds.findIndex((until) => until < role.from);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = role.to;
      role.lane = lane;
    });
    const LANE = 20;
    strip.style.height = laneEnds.length * LANE + "px";
    const hint = label.textContent;
    roles.forEach((role) => {
      const bar = document.createElement("button");
      bar.type = "button";
      bar.style.left = ((role.from - start) / span) * 100 + "%";
      bar.style.width = Math.max(1.5, ((role.to - role.from + 1) / span) * 100) + "%";
      bar.style.top = (laneEnds.length - 1 - role.lane) * LANE + "px";
      if (role.live) bar.classList.add("is-live");
      bar.setAttribute("aria-label", `${role.name}, ${$(".xp-when", role.el).textContent}. Show this role.`);
      const hot = (on) => { role.el.classList.toggle("is-hot", on); label.textContent = on ? `${$(".xp-when", role.el).textContent}: ${role.name}` : hint; };
      bar.addEventListener("pointerenter", () => hot(true));
      bar.addEventListener("pointerleave", () => hot(false));
      bar.addEventListener("focus", () => hot(true));
      bar.addEventListener("blur", () => hot(false));
      bar.addEventListener("click", () => { role.el.open = true; role.el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); });
      role.el.addEventListener("pointerenter", () => bar.classList.add("is-hot"));
      role.el.addEventListener("pointerleave", () => bar.classList.remove("is-hot"));
      strip.append(bar);
    });
    for (let year = Math.ceil(start / 12); year * 12 <= end; year += 1) {
      const tick = document.createElement("span");
      tick.className = "tick";
      tick.textContent = year;
      tick.style.left = ((year * 12 - start) / span) * 100 + "%";
      $("#strip").append(tick);
    }

    const all = $("#xp-all");
    const details = $$("details.xp");
    const sync = () => {
      const open = details.every((d) => d.open);
      all.setAttribute("aria-pressed", String(open));
      all.textContent = open ? "Collapse all" : "Expand all";
    };
    all.addEventListener("click", () => { const open = !details.every((d) => d.open); details.forEach((d) => (d.open = open)); });
    details.forEach((d) => d.addEventListener("toggle", sync));
    sync();
  });

  // ----- Tools: filter, and show which project proves a skill -----
  feature("skills", () => {
    const input = $("#skill-filter");
    const status = $("#skill-status");
    const groups = $$(".skill-group").map((group) => ({ group, chips: $$(".chips li", group) }));
    const projects = $$(".proj").map((card) => ({ card, name: card.dataset.name, stack: $$("[data-stack] li", card).map((li) => li.textContent.toLowerCase()) }));
    const proofFor = (skill) => {
      const text = skill.toLowerCase();
      return projects.filter((p) => p.stack.some((item) => item === text || (item.length > 3 && text.includes(item)) || (text.length > 3 && item.includes(text))));
    };
    const clearProof = () => projects.forEach((p) => p.card.classList.remove("is-proof"));
    const showProof = (chip, found) => {
      clearProof();
      found.forEach((p) => p.card.classList.add("is-proof"));
      status.replaceChildren(`${chip.textContent}: used in ${found.map((p) => p.name).join(", ")}. `);
      const jump = document.createElement("a");
      jump.href = "#build";
      jump.textContent = "See it highlighted";
      status.append(jump);
      setTimeout(clearProof, 8000);
    };
    groups.forEach(({ chips }) => chips.forEach((chip) => {
      const found = proofFor(chip.textContent);
      if (!found.length) return;
      chip.classList.add("has-proof");
      chip.tabIndex = 0;
      chip.setAttribute("role", "button");
      chip.addEventListener("click", () => showProof(chip, found));
      chip.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showProof(chip, found); } });
    }));
    api.filterSkills = (value) => {
      input.value = value;
      const query = value.trim().toLowerCase();
      let hits = 0;
      groups.forEach(({ group, chips }) => {
        let groupHits = 0;
        chips.forEach((chip) => {
          const hit = query !== "" && chip.textContent.toLowerCase().includes(query);
          chip.classList.toggle("is-hit", hit);
          chip.classList.toggle("is-miss", query !== "" && !hit);
          if (hit) groupHits += 1;
        });
        group.classList.toggle("is-empty", query !== "" && groupHits === 0);
        hits += groupHits;
      });
      if (query === "") status.textContent = "";
      else if (hits === 0) status.textContent = `Nothing matches "${value.trim()}". Ask me about it anyway.`;
      else status.textContent = `${hits} ${hits === 1 ? "skill matches" : "skills match"} "${value.trim()}"`;
      return hits;
    };
    input.addEventListener("input", () => api.filterSkills(input.value));
  });

  // ----- The command line -----
  feature("terminal", () => {
    const form = $("#term");
    const input = $("#cmd");
    const out = $("#term-out");
    const print = (...lines) => { out.replaceChildren(); lines.forEach((line, i) => { if (i) out.append("\n"); out.append(line); }); };
    const bold = (text) => { const b = document.createElement("b"); b.textContent = text; return b; };
    const go = (id, text) => { api.goTo(id); return text; };
    const COMMANDS = {
      help: () => "work · break · measure · experience · skills <word> · f1 · email · resume · bucket · theme · decode · whoami",
      whoami: () => "Manas Jha. AI Engineer at DevHawk AI, founder of a stealth agent OS, Purdue AI 2026, Atlanta.",
      work: () => go("build", "→ BUILD: five projects. Open any case file."),
      build: () => COMMANDS.work(),
      projects: () => COMMANDS.work(),
      break: () => go("break", "→ BREAK: benchmarks, leakage tests, security."),
      measure: () => go("measure", "→ MEASURE: running the test suite."),
      numbers: () => COMMANDS.measure(),
      experience: () => go("ship", "→ SHIP: eight roles on one timeline."),
      ship: () => COMMANDS.experience(),
      skills: (arg) => {
        api.goTo("tools");
        if (!arg) return "→ TOOLS. Add a word to filter, e.g. skills pytorch";
        const hits = api.filterSkills ? api.filterSkills(arg) : 0;
        return hits ? `→ TOOLS: ${hits} match "${arg}".` : `→ TOOLS: nothing matches "${arg}".`;
      },
      tools: (arg) => COMMANDS.skills(arg),
      f1: () => go("f1", "→ Flat Out F1: live forecast, and a start-lights test. Lights out and away we go."),
      email: () => { api.copyEmail(); return "Copied " + EMAIL + " (or opening your mail app)."; },
      contact: () => go("contact", "→ " + EMAIL),
      resume: () => { setTimeout(() => window.print(), 300); return "Opening the print view: a clean one-column résumé."; },
      print: () => COMMANDS.resume(),
      bucket: () => { setTimeout(() => (window.location.href = "/bucket-list/"), 500); return "Opening the bucket list…"; },
      theme: () => { api.toggleTheme?.(); return "Theme switched. It's remembered next visit."; },
      decode: () => { api.decode ? api.decode() : null; return reduce ? "The rain is off (reduced motion). The secret: MJ · May 2004 · Leo Messi · Max Verstappen." : "Decoding the rain… watch the columns."; },
      clear: () => "",
      sudo: () => "Nice try. Permission denied.",
    };
    const run = (raw) => {
      const text = raw.trim();
      if (!text) return;
      const [name, ...rest] = text.toLowerCase().split(/\s+/);
      const command = Object.hasOwn(COMMANDS, name) ? COMMANDS[name] : null;
      const result = command ? command(rest.join(" ")) : `command not found: ${name}. Try help`;
      print(bold("$ " + text), result);
      input.value = "";
    };
    form.addEventListener("submit", (event) => { event.preventDefault(); run(input.value); });
    $$(".term-chips button").forEach((chip) => chip.addEventListener("click", () => run(chip.dataset.cmd)));

    // Idle placeholder types out suggestions, so the prompt looks alive.
    const hints = ["work", "skills pytorch", "f1", "decode", "email", "whoami"];
    let hint = 0;
    const typeHint = async () => {
      while (true) {
        const word = hints[hint++ % hints.length];
        for (let i = 1; i <= word.length; i += 1) { input.placeholder = word.slice(0, i); await sleep(90); }
        await sleep(1700);
        for (let i = word.length; i >= 0; i -= 1) { input.placeholder = word.slice(0, i); await sleep(40); }
        await sleep(300);
      }
    };
    if (!reduce) typeHint();

    // "/" or Ctrl/Cmd+K focuses the prompt from anywhere.
    document.addEventListener("keydown", (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
      const palette = (event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey);
      if (!palette && !(event.key === "/" && !typing)) return;
      if (document.querySelector("dialog[open]")) return;
      event.preventDefault();
      api.goTo("top");
      input.focus({ preventScroll: true });
    });
  });

  // ----- Print: open everything first -----
  let reopened = [];
  addEventListener("beforeprint", () => { reopened = $$("details:not([open])"); reopened.forEach((d) => (d.open = true)); });
  addEventListener("afterprint", () => reopened.forEach((d) => (d.open = false)));
})();
