// The portfolio home page (a newspaper whose pages turn on scroll): plain JavaScript over a static page (index.html).
// Everything here is an enhancement: the page reads fine without it.
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const EMAIL = "manasjha.015@gmail.com";
  const F1_DATA = "/f1/data/v3/site.json";
  const feature = (name, start) => { try { start(); } catch (error) { console.warn(`[${name}] skipped:`, error); } };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mqWide = matchMedia("(min-width: 860px) and (min-height: 520px)");
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine)").matches;
  const bus = new EventTarget();

  // ----- Date line, clock, year -----
  feature("dateline", () => {
    const tz = "America/New_York";
    const now = new Date();
    const date = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(now);
    $$(".js-date").forEach((el) => (el.textContent = date));
    const start = new Date(now.getFullYear(), 0, 0);
    $$(".js-issue").forEach((el) => (el.textContent = "No. " + Math.floor((now - start) / 864e5)));
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
    const tick = () => $$(".js-clock").forEach((el) => (el.textContent = "· " + fmt.format(new Date()) + " there"));
    tick(); setInterval(tick, 30000);
    $("#year").textContent = String(now.getFullYear());
  });

  // ----- Night edition -----
  feature("theme", () => {
    const btn = $("#theme");
    const meta = $('meta[name="theme-color"]');
    const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const sync = () => {
      const dark = isDark();
      btn.textContent = dark ? "Day edition" : "Night edition";
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Switch to the day edition (light theme)" : "Switch to the night edition (dark theme)");
      meta.content = dark ? "#1d1c19" : "#f3eee2";
    };
    btn.addEventListener("click", () => {
      root.dataset.theme = isDark() ? "light" : "dark";
      try { localStorage.setItem("gazette-theme", root.dataset.theme); } catch { /* private mode */ }
      sync();
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sync);
    sync();
  });

  // ----- Page flip engine -----
  const pager = { goTo: () => {}, current: () => 0, isFlip: () => false };
  feature("flip", () => {
    const track = $("#track"), stage = $("#stage");
    const sheets = $$(".sheet");
    const N = sheets.length;
    const parts = sheets.map((sheet) => ({ sheet, recto: $(".recto", sheet), inner: $(".sheet-in", sheet), heading: $("h1, h2", $(".sheet-in", sheet)) }));
    parts.forEach((p) => { p.heading.tabIndex = -1; });
    const folio = $("#folio"), prevBtn = $("#prev"), nextBtn = $("#next");
    const ALIAS = { top: "front", main: "front", skills: "classifieds", tools: "classifieds", experience: "career", ship: "career", build: "work", measure: "front", break: "work", resume: "back" };
    let flip = false, L = null, cur = -1, raf = 0, snapTimer = 0, snapOn = true, pendingFocus = false;

    const shouldFlip = () => mqWide.matches && !mqReduce.matches;
    const offsetIn = (el, inner) => { let y = 0, n = el; while (n && n !== inner) { y += n.offsetTop; n = n.offsetParent; } return y; };

    const measure = () => {
      const H = stage.clientHeight;
      const turn = Math.round(H * 0.95), rest = Math.round(H * 0.18);
      const over = parts.map((p) => Math.max(0, Math.ceil(p.inner.offsetHeight - p.recto.clientHeight)));
      const start = [];
      let acc = 0;
      for (let i = 0; i < N; i++) { start.push(acc); acc += over[i] + rest + (i < N - 1 ? turn : 0); }
      L = { H, W: $("#book").clientWidth, turn, rest, over, start, end: acc };
      track.style.height = (acc + H) + "px";
    };
    const turnStart = (i) => L.start[i] + L.over[i] + L.rest;

    const setCurrent = (k) => {
      if (k === cur) return;
      const before = cur;
      cur = k;
      parts.forEach((p, i) => { p.sheet.inert = i !== k; });
      folio.textContent = `Page ${k + 1} of ${N}: ${sheets[k].dataset.title}`;
      prevBtn.disabled = k === 0; nextBtn.disabled = k === N - 1;
      const hashTarget = location.hash ? document.getElementById(ALIAS[location.hash.slice(1)] || location.hash.slice(1)) : null;
      if (before !== -1 && !(hashTarget && sheets[k].contains(hashTarget))) history.replaceState(null, "", k === 0 ? location.pathname + location.search : "#" + sheets[k].id);
      const active = document.activeElement;
      if (pendingFocus || (active && active !== document.body && active.closest(".sheet") && active.closest(".sheet") !== sheets[k])) {
        pendingFocus = false;
        parts[k].heading.focus({ preventScroll: true });
      }
      bus.dispatchEvent(new CustomEvent("page", { detail: { index: k, id: sheets[k].id } }));
    };

    const render = () => {
      raf = 0;
      if (!flip || !L) return;
      const s = window.scrollY - track.offsetTop;
      let k = N - 1;
      const prog = parts.map((p, i) => {
        p.inner.style.transform = `translate3d(0, ${-clamp(s - L.start[i], 0, L.over[i])}px, 0)`;
        return i === N - 1 ? 0 : clamp((s - turnStart(i)) / L.turn, 0, 1);
      });
      const firstUnturned = prog.findIndex((p) => p < 1);
      const top = firstUnturned === -1 ? N - 1 : firstUnturned;
      k = prog[top] >= 0.5 && top < N - 1 ? top + 1 : top;
      parts.forEach((p, i) => {
        const pr = prog[i];
        const e = pr * pr * (3 - 2 * pr); // smoothstep
        const turning = pr > 0 && pr < 1;
        const visible = i === top || (i === top + 1 && prog[top] > 0);
        const lift = Math.sin(e * Math.PI);
        p.sheet.style.visibility = visible ? "visible" : "hidden";
        p.sheet.style.zIndex = i === top ? 3 : i === top + 1 ? 2 : 1;
        // A loose sheet is lifted and carried across while it turns, so its back stays in view mid-turn.
        p.sheet.style.transform = turning ? `translate3d(${(lift * L.W * 0.42).toFixed(1)}px, 0, ${(lift * 34).toFixed(1)}px) rotateY(${(-180 * e).toFixed(2)}deg)` : "none";
        p.sheet.style.setProperty("--lift", turning ? lift.toFixed(3) : "0");
        $(".shade", p.recto).style.opacity = turning ? Math.min(1, e * 2.1).toFixed(3) : "0";
        const vs = $(".vshade", p.sheet); if (vs) vs.style.opacity = turning ? clamp((1 - e) * 2, 0.15, 1).toFixed(3) : "1";
        const under = $(".under", p.recto);
        under.style.opacity = i === top + 1 && prog[top] > 0 ? (Math.pow(1 - prog[top], 1.4) * 0.9).toFixed(3) : "0";
      });
      setCurrent(k);
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(render); };

    // Snap: never leave a page half-turned for long.
    const snap = () => {
      if (!flip || !snapOn) return;
      const s = window.scrollY - track.offsetTop;
      for (let i = 0; i < N - 1; i++) {
        const a = turnStart(i), b = a + L.turn;
        if (s > a + 1 && s < b - 1) {
          const target = (s - a) / L.turn < 0.5 ? a : b;
          window.scrollTo({ top: target + track.offsetTop, behavior: "smooth" });
          return;
        }
      }
    };
    const onScroll = () => {
      request();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snap, 180);
    };

    const pageOf = (el) => sheets.findIndex((s) => s.contains(el));
    const goTo = (index, opts = {}) => {
      index = clamp(index, 0, N - 1);
      if (!flip) {
        const el = opts.el || sheets[index];
        el.scrollIntoView({ behavior: mqReduce.matches ? "auto" : "smooth", block: "start" });
        if (opts.focus) (opts.el && opts.el.matches("h1,h2,h3,[tabindex]") ? opts.el : parts[index].heading).focus({ preventScroll: true });
        return;
      }
      let off = 0;
      if (opts.el && opts.el !== sheets[index]) off = clamp(offsetIn(opts.el, parts[index].inner) - 24, 0, L.over[index]);
      const top = L.start[index] + off + track.offsetTop;
      if (opts.focus) pendingFocus = true;
      const far = Math.abs(index - Math.max(cur, 0)) > 1;
      window.scrollTo({ top, behavior: opts.instant || far ? "auto" : "smooth" });
      if (opts.focus && index === cur) { pendingFocus = false; parts[index].heading.focus({ preventScroll: true }); }
    };
    const targetFor = (id) => document.getElementById(ALIAS[id] || id);
    const goToHash = (hash, opts = {}) => {
      const el = hash ? targetFor(decodeURIComponent(hash.replace(/^#/, ""))) : null;
      if (!el) return false;
      const i = pageOf(el);
      if (i === -1) return false;
      goTo(i, { ...opts, el });
      return true;
    };
    pager.goTo = goTo; pager.goToHash = goToHash; pager.current = () => cur; pager.isFlip = () => flip; pager.setSnap = (v) => { snapOn = v; };
    pager.layout = () => L; pager.render = render;

    // Mode switching
    const stackedIndex = () => { let best = 0; sheets.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) best = i; }); return best; };
    const clearFlip = () => {
      track.style.height = "";
      parts.forEach((p) => {
        p.sheet.inert = false; p.sheet.style.cssText = ""; p.inner.style.transform = "";
        $(".shade", p.recto).style.opacity = ""; $(".under", p.recto).style.opacity = "";
      });
    };
    const reveal = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.remove("pending"); reveal.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    const setMode = (initial) => {
      const want = shouldFlip();
      if (!initial && want === flip) { if (flip) { const keep = cur; measure(); if (keep >= 0) window.scrollTo({ top: L.start[keep] + track.offsetTop, behavior: "auto" }); request(); } return; }
      const keepIndex = initial ? null : (flip ? Math.max(cur, 0) : stackedIndex());
      flip = want;
      root.classList.toggle("flip", flip);
      root.classList.toggle("stacked", !flip);
      root.classList.toggle("motion", !mqReduce.matches);
      if (flip) {
        sheets.forEach((s) => s.classList.remove("pending"));
        cur = -1; measure(); render();
        if (keepIndex !== null) window.scrollTo({ top: L.start[keepIndex] + track.offsetTop, behavior: "auto" });
      } else {
        clearFlip(); cur = -1; L = null;
        if (!mqReduce.matches) sheets.forEach((s, i) => { if (i > 0 && s.getBoundingClientRect().top > innerHeight) { s.classList.add("pending"); reveal.observe(s); } });
        if (keepIndex !== null) sheets[keepIndex].scrollIntoView({ block: "start" });
        bus.dispatchEvent(new CustomEvent("page", { detail: { index: -1, id: "" } }));
      }
    };

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    setMode(true);
    if (location.hash) goToHash(location.hash, { instant: true }); else window.scrollTo(0, 0);
    request();

    addEventListener("scroll", () => { if (flip) onScroll(); }, { passive: true });
    let resizeTimer = 0;
    addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => setMode(false), 120); });
    mqWide.addEventListener("change", () => setMode(false));
    mqReduce.addEventListener("change", () => setMode(false));
    const relayout = () => { if (!flip) return; measure(); request(); };
    if (window.ResizeObserver) { const ro = new ResizeObserver(relayout); parts.forEach((p) => ro.observe(p.inner)); }
    if (document.fonts) document.fonts.ready.then(() => { if (flip) { const keep = Math.max(cur, 0); const h = location.hash; measure(); if (h && goToHash(h, { instant: true })) {} else window.scrollTo({ top: L.start[keep] + track.offsetTop, behavior: "auto" }); request(); } });

    // Keep focus visible: a sheet never scrolls itself; we move the page offset instead.
    parts.forEach((p, i) => {
      p.recto.addEventListener("scroll", () => { p.recto.scrollTop = 0; p.recto.scrollLeft = 0; });
      p.inner.addEventListener("focusin", (event) => {
        if (!flip || i !== cur || event.target === p.heading) return;
        requestAnimationFrame(() => {
          p.recto.scrollTop = 0;
          const y = offsetIn(event.target, p.inner);
          const h = event.target.offsetHeight || 20;
          const s = window.scrollY - track.offsetTop;
          const off = clamp(s - L.start[i], 0, L.over[i]);
          const view = p.recto.clientHeight;
          if (y < off + 10 || y + h > off + view - 10) {
            const want = clamp(y - view * 0.3, 0, L.over[i]);
            window.scrollTo({ top: L.start[i] + want + track.offsetTop, behavior: "auto" });
          }
        });
      });
    });

    // Buttons, corners, keys, links
    prevBtn.addEventListener("click", () => goTo(cur - 1));
    nextBtn.addEventListener("click", () => goTo(cur + 1));
    $$(".corner").forEach((btn) => btn.addEventListener("click", () => goTo(cur + (btn.dataset.go === "next" ? 1 : -1), { focus: true })));
    document.addEventListener("keydown", (event) => {
      if (!flip || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if ($("#casefile").open) return;
      const t = event.target;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      const k = event.key;
      if (k === "ArrowRight" || k === "PageDown") { event.preventDefault(); goTo(cur + 1, { focus: true }); }
      else if (k === "ArrowLeft" || k === "PageUp") { event.preventDefault(); goTo(cur - 1, { focus: true }); }
      else if (k === "Home" && event.target === document.body) { event.preventDefault(); goTo(0, { focus: true }); }
      else if (k === "End" && event.target === document.body) { event.preventDefault(); goTo(N - 1, { focus: true }); }
    });
    document.addEventListener("click", (event) => {
      const a = event.target.closest('a[href^="#"]');
      if (!a || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const hash = a.getAttribute("href");
      if (hash === "#main") return;
      const dlg = a.closest("dialog");
      if (dlg) dlg.close();
      const el = targetFor(hash.slice(1));
      if (!el) return;
      event.preventDefault();
      history.pushState(null, "", hash);
      goToHash(hash, { focus: true });
    });
    addEventListener("popstate", () => { if (location.hash) goToHash(location.hash, { focus: true }); else goTo(0); });
    addEventListener("hashchange", () => goToHash(location.hash, { focus: true }));
  });

  // ----- WANTED poster: a little hover tilt -----
  feature("poster", () => {
    const poster = $("#poster");
    if (!finePointer) return;
    poster.addEventListener("pointermove", (event) => {
      if (mqReduce.matches) return;
      const r = poster.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5, y = (event.clientY - r.top) / r.height - 0.5;
      poster.style.transform = `perspective(900px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 6).toFixed(2)}deg) translateY(-3px)`;
    });
    poster.addEventListener("pointerleave", () => { poster.style.transform = ""; });
  });

  // ----- Case files: a dialog in flip mode, inline "continued" text otherwise -----
  feature("casefile", () => {
    const dialog = $("#casefile"), title = $("#cf-title"), body = $("#cf-body");
    $("#cf-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    $$("details.cont > summary").forEach((summary) => summary.addEventListener("click", (event) => {
      if (!pager.isFlip()) return;
      event.preventDefault();
      const story = summary.closest(".story");
      title.textContent = $("h3", story).textContent;
      const lead = document.createElement("p");
      lead.className = "just"; lead.style.marginBottom = ".6em";
      lead.textContent = $("p.body", story).textContent;
      body.replaceChildren(lead, ...[...$(".cont-body", story).cloneNode(true).childNodes]);
      dialog.showModal();
    }));
  });

  // ----- By the numbers: re-run the suite -----
  feature("tests", () => {
    const rows = $$("#tests li").map((li) => ({ state: $(".t-state", li), value: $(".t-val", li), final: $(".t-val", li).textContent }));
    const sum = $("#tests-sum");
    const spin = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
    let id = 0;
    const run = async () => {
      const me = ++id;
      if (mqReduce.matches) { sum.textContent = "6 passed, 0 failed"; return; }
      rows.forEach((r) => { r.state.textContent = "·"; r.value.style.opacity = ".25"; });
      sum.textContent = "running…";
      for (const [i, r] of rows.entries()) {
        for (let f = 0; f < 6; f++) { if (me !== id) return; r.state.textContent = spin[(f + i) % spin.length]; await new Promise((res) => setTimeout(res, 55)); }
        r.state.textContent = "✓"; r.value.style.opacity = ""; r.value.textContent = r.final;
      }
      sum.textContent = `${rows.length} passed, 0 failed in ${(0.33 * rows.length).toFixed(2)}s`;
    };
    $("#tests-rerun").addEventListener("click", run);
  });

  // ----- Sports: live F1 forecast -----
  feature("f1-live", () => {
    const label = $("#f1-event"), list = $("#f1-odds");
    let started = false;
    const load = async () => {
      if (started) return; started = true;
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
          const code = document.createElement("span"); code.textContent = driver.Driver;
          const bar = document.createElement("span"); bar.className = "bar";
          const fill = document.createElement("span"); fill.style.setProperty("--w", (driver.win / best).toFixed(3));
          const swatch = document.createElement("i"); swatch.style.background = data.team_colors?.[driver.Team] ?? "#9aa3b0";
          bar.append(swatch, fill);
          const pct = document.createElement("span"); pct.textContent = (driver.win * 100).toFixed(1) + "%"; pct.style.textAlign = "right";
          li.append(code, bar, pct);
          li.title = `${driver.Driver} (${driver.Team}): ${(driver.win * 100).toFixed(1)}% chance to win`;
          return li;
        }));
        requestAnimationFrame(() => requestAnimationFrame(() => list.classList.add("is-in")));
      } catch (error) {
        label.textContent = "";
        const box = document.createElement("span");
        box.className = "f1-fail"; box.style.display = "block";
        box.append("Couldn't reach f1.h for the live forecast just now. The numbers on this page are from the project itself. ");
        const a = document.createElement("a"); a.href = "/f1/"; a.textContent = "Try f1.h directly";
        box.append(a, ".");
        label.append(box);
        console.info("[f1-live] fallback shown:", error && error.message);
      }
    };
    bus.addEventListener("page", (e) => { if (e.detail.index >= 3) load(); });
    const watch = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && !pager.isFlip()) { watch.disconnect(); load(); } }, { rootMargin: "300px 0px" });
    watch.observe($("#sports"));
    pager.loadF1 = load;
  });

  // ----- Sports: start-lights reaction test -----
  feature("lights", () => {
    const lamps = $$("#gantry span"), message = $("#lights-msg"), button = $("#lights-btn");
    let phase = "idle", timers = [], lightsOutAt = 0;
    const bestKey = "f1-reaction-best";
    const readBest = () => { try { return Number(localStorage.getItem(bestKey)) || null; } catch { return null; } };
    const setPhase = (next, text) => { phase = next; button.dataset.phase = next; button.textContent = text; };
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const setMessage = (big, small) => { message.replaceChildren(); if (big) { const b = document.createElement("b"); b.textContent = big; message.append(b); } message.append(small); };
    const reset = (text = "Start the lights") => { clear(); lamps.forEach((l) => l.classList.remove("is-on")); setPhase("idle", text); };
    const begin = () => {
      setPhase("wait", "Wait for lights out…");
      setMessage("", "Press the moment all five go dark.");
      lamps.forEach((lamp, i) => timers.push(setTimeout(() => lamp.classList.add("is-on"), 700 * (i + 1))));
      const hold = 700 * lamps.length + 500 + Math.random() * 1700;
      timers.push(setTimeout(() => { lamps.forEach((l) => l.classList.remove("is-on")); lightsOutAt = performance.now(); setPhase("go", "GO!"); }, hold));
    };
    const press = (event) => {
      if (event.type === "keydown" && event.key !== " " && event.key !== "Enter") return;
      if (event.type === "keydown" && event.repeat) return;
      if (event.type === "pointerdown" && event.button !== 0) return;
      event.preventDefault();
      if (phase === "idle") return begin();
      if (phase === "wait") { reset("Try again"); return setMessage("Jump start", "You went before lights out. That's a penalty."); }
      const seconds = (performance.now() - lightsOutAt) / 1000;
      const previous = readBest();
      const isBest = !previous || seconds < previous;
      if (isBest) { try { localStorage.setItem(bestKey, String(seconds)); } catch { /* private mode */ } }
      reset("Go again");
      setMessage(seconds.toFixed(3) + " s", isBest ? "Your best so far. A good F1 start is about 0.2 s." : `Your best is ${previous.toFixed(3)} s.`);
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("keydown", press);
    bus.addEventListener("page", (e) => { if (e.detail.id !== "sports" && phase !== "idle" && pager.isFlip()) reset(); });
    new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && phase !== "idle" && !pager.isFlip()) reset(); }).observe(button);
  });

  // ----- Classifieds: filter, and which project proves a skill -----
  feature("skills", () => {
    const input = $("#skill-filter"), status = $("#skill-status");
    const groups = $$(".skill-group").map((group) => ({ group, chips: $$(".chips li", group) }));
    const projects = $$(".story[data-name]").map((card) => ({ card, name: card.dataset.name, stack: $$("[data-stack] li", card).map((li) => li.textContent.toLowerCase()) }));
    const proofFor = (skill) => {
      const text = skill.toLowerCase();
      return projects.filter((p) => p.stack.some((item) => item === text || (item.length > 3 && text.includes(item)) || (text.length > 3 && item.includes(text))));
    };
    let proofTimer = 0;
    const clearProof = () => projects.forEach((p) => p.card.classList.remove("is-proof"));
    const showProof = (chip, found) => {
      clearProof(); clearTimeout(proofTimer);
      found.forEach((p) => p.card.classList.add("is-proof"));
      status.replaceChildren(`${chip.textContent}: used in ${found.map((p) => p.name).join(", ")}. `);
      const jump = document.createElement("a");
      jump.href = "#" + (found[0].card.id || "work");
      jump.textContent = "See it highlighted on page 2";
      status.append(jump);
      proofTimer = setTimeout(clearProof, 12000);
    };
    groups.forEach(({ chips }) => chips.forEach((chip) => {
      const found = proofFor(chip.textContent);
      if (!found.length) return;
      chip.classList.add("has-proof");
      chip.tabIndex = 0;
      chip.setAttribute("role", "button");
      chip.setAttribute("aria-label", `${chip.textContent}: show the project that used it`);
      chip.addEventListener("click", () => showProof(chip, found));
      chip.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showProof(chip, found); } });
    }));
    const filter = (value) => {
      const query = value.trim().toLowerCase();
      let hits = 0;
      groups.forEach(({ group, chips }) => {
        let g = 0;
        chips.forEach((chip) => {
          const hit = query !== "" && chip.textContent.toLowerCase().includes(query);
          chip.classList.toggle("is-hit", hit);
          chip.classList.toggle("is-miss", query !== "" && !hit);
          if (hit) g += 1;
        });
        group.classList.toggle("is-empty", query !== "" && g === 0);
        hits += g;
      });
      if (query === "") status.textContent = "";
      else if (hits === 0) status.textContent = `Nothing matches "${value.trim()}". Ask me about it anyway.`;
      else status.textContent = `${hits} ${hits === 1 ? "skill matches" : "skills match"} "${value.trim()}"`;
      return hits;
    };
    input.addEventListener("input", () => filter(input.value));
    pager.filterSkills = filter;
  });

  // ----- Contact: copy email, print résumé -----
  feature("contact", () => {
    const status = $("#copy-status");
    $("#copy-email").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(EMAIL); status.textContent = "Copied " + EMAIL; }
      catch { window.location.href = "mailto:" + EMAIL; }
    });
    $("#print-resume").addEventListener("click", () => window.print());
  });

  window.gazette = pager; // small handle for testing in the console
})();
