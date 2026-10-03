import { useEffect, useRef } from "react";
import portraitSrc from "../assets/portrait/manas.webp";

// Same glyph set as the rain, so the "decoded" portrait reads as part of it.
const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:=*+-<>¦|";
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

const VARIANTS = 3; // glyph layers cycled while revealed, so the code shimmers
const SWAP_MS = 110;
const RADIUS = 92; // css px, reveal brush radius
const TRAIL_LIFE = 0.85; // seconds for a trail blob to fade out
const ASSEMBLE = 1.8; // seconds: bits fly in and lock into place
const RESOLVE = 1.0; // seconds: the photo streams in, coarse blocks to sharp
const PIXEL_STEPS = [22, 12, 6, 3, 1]; // block sizes (css px) as the photo resolves
const SCAN_EVERY_MS = 6500; // touch screens: periodic scan instead of a cursor

// The photo rebuilt as rain glyphs: one glyph per cell, brightness from the
// photo's luminance, on a dark silhouette so the photo never shows through.
function buildGlyphLayers(img, w, h, dpr) {
  const cell = w > 380 ? 7 : 6;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  const sctx = sample.getContext("2d", { willReadFrequently: true });
  sctx.drawImage(img, 0, 0, cols, rows);
  const data = sctx.getImageData(0, 0, cols, rows).data;

  const lum = new Float32Array(cols * rows);
  const fg = [];
  for (let i = 0; i < cols * rows; i += 1) {
    const o = i * 4;
    lum[i] = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
    if (data[o + 3] > 90) fg.push(lum[i]);
  }
  fg.sort((a, b) => a - b);
  const lo = fg[Math.floor(fg.length * 0.05)] ?? 0;
  const hi = fg[Math.floor(fg.length * 0.97)] ?? 1;
  const span = Math.max(0.05, hi - lo);

  const layers = [];
  const cells = []; // the first layer's glyphs, where the intro's bits land
  for (let v = 0; v < VARIANTS; v += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    // Under the glyphs: a dark cyan duotone of the photo, so the face still
    // reads between the characters.
    ctx.drawImage(img, 0, 0, w, h);
    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = "#00AEEF";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(img, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(2,4,12,0.7)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.font = `${cell + 1}px "JetBrains Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const i = y * cols + x;
        if (data[i * 4 + 3] < 90) continue;
        const t = Math.min(1, Math.max(0, (lum[i] - lo) / span));
        const bright = t > 0.86;
        const a = bright ? 0.95 : 0.2 + 0.8 * Math.pow(t, 0.8);
        const ch = randomGlyph();
        const cx = x * cell + cell / 2;
        const cy = y * cell + cell / 2;
        ctx.fillStyle = bright ? `rgba(225,250,255,${a})` : `rgba(0,174,239,${a.toFixed(2)})`;
        ctx.fillText(ch, cx, cy);
        if (v === 0) cells.push({ x: cx, y: cy, ch, a, bright });
      }
    }
    layers.push(canvas);
  }
  return { layers, cells, cell };
}

// Every glyph pre-drawn once, in rain cyan (row 0) and bright white-cyan
// (row 1), so thousands of flying bits per frame are cheap image blits.
function buildAtlas(cell, dpr) {
  const slot = Math.ceil((cell + 3) * dpr);
  const atlas = document.createElement("canvas");
  atlas.width = slot * GLYPHS.length;
  atlas.height = slot * 2;
  const ctx = atlas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.font = `${cell + 1}px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const s = slot / dpr;
  ["rgb(0,174,239)", "rgb(225,250,255)"].forEach((color, row) => {
    ctx.fillStyle = color;
    [...GLYPHS].forEach((ch, i) => ctx.fillText(ch, i * s + s / 2, row * s + s / 2));
  });
  const index = new Map([...GLYPHS].map((ch, i) => [ch, i]));
  return { atlas, slot, index };
}

// Each glyph cell becomes a bit that flies in from somewhere around the
// portrait (some fall from above, like the rain) and locks into its cell.
function makeParticles(cells, h) {
  return cells.map((c) => {
    const fromAbove = Math.random() < 0.3;
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 320;
    return {
      ...c,
      sx: fromAbove ? c.x + (Math.random() - 0.5) * 24 : c.x + Math.cos(angle) * dist,
      sy: fromAbove ? c.y - 220 - Math.random() * 480 : c.y + Math.sin(angle) * dist,
      delay: Math.random() * 0.55 + (c.y / h) * 0.35,
      dur: 0.5 + Math.random() * 0.4,
      seed: Math.floor(Math.random() * 1000),
    };
  });
}

// A soft round brush, drawn once and stamped into the mask.
function makeBrush(size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.55, "rgba(255,255,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

// landonorris.com reveals Lando's helmet under the cursor; here the cursor
// decodes the portrait into the matrix rain it sits in. On load the portrait
// resolves from glyphs into the photo, top to bottom.
export default function DecodePortrait() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none)").matches;

    const img = new Image();
    img.src = portraitSrc;
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d");
    const comp = document.createElement("canvas");
    const cctx = comp.getContext("2d");
    const brush = makeBrush(128);

    let disposed = false;
    let ready = false;
    let raf = 0;
    let last = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let layers = [];
    let glyphAtlas = null;
    let particles = [];
    const pix = document.createElement("canvas");
    const pctx = pix.getContext("2d");
    let layerIdx = 0;
    let lastSwap = 0;
    let blobs = [];
    let intro = reduce ? null : { start: null };
    let scan = null;
    const pointer = { x: 0, y: 0, inside: false };
    const head = { x: 0, y: 0, live: false };

    const kick = () => {
      if (!raf && !disposed && ready) raf = requestAnimationFrame(frame);
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = comp.width = Math.round(w * dpr);
      canvas.height = comp.height = Math.round(h * dpr);
      mask.width = Math.ceil(w / 2);
      mask.height = Math.ceil(h / 2);
      if (!reduce) {
        const built = buildGlyphLayers(img, w, h, dpr);
        layers = built.layers;
        if (intro) {
          glyphAtlas = buildAtlas(built.cell, dpr);
          particles = makeParticles(built.cells, h);
        }
      }
    };

    function drawIntro(t, now) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;

      if (t < ASSEMBLE) {
        // Near the end, the finished glyph layer fades in under the last bits.
        const settle = Math.min(1, Math.max(0, (t - (ASSEMBLE - 0.4)) / 0.4));
        if (settle > 0) {
          ctx.globalAlpha = settle;
          ctx.drawImage(layers[0], 0, 0);
        }
        const { atlas, slot, index } = glyphAtlas;
        const flip = Math.floor(now / 70);
        for (let i = 0; i < particles.length; i += 1) {
          const p = particles[i];
          const lt = (t - p.delay) / p.dur;
          if (lt <= 0) continue;
          let x = p.x;
          let y = p.y;
          let gi;
          let row;
          let alpha;
          if (lt < 1) {
            const e = 1 - Math.pow(1 - lt, 3);
            x = p.sx + (p.x - p.sx) * e;
            y = p.sy + (p.y - p.sy) * e;
            gi = index.get((flip + p.seed) % 2 ? "1" : "0");
            row = 1;
            alpha = 0.25 + 0.6 * e;
          } else {
            if (settle >= 1) continue;
            gi = index.get(p.ch);
            row = p.bright ? 1 : 0;
            alpha = p.a * (1 - settle);
          }
          ctx.globalAlpha = alpha;
          ctx.drawImage(atlas, gi * slot, row * slot, slot, slot, x * dpr - slot / 2, y * dpr - slot / 2, slot, slot);
        }
        ctx.globalAlpha = 1;
        return;
      }

      // Resolve: the photo arrives in coarse blocks that sharpen step by step,
      // like a progressive download, while the code fades off it.
      const p = Math.min(1, (t - ASSEMBLE) / RESOLVE);
      const block = PIXEL_STEPS[Math.min(PIXEL_STEPS.length - 1, Math.floor(p * PIXEL_STEPS.length))];
      ctx.globalAlpha = Math.min(1, p * 2.2);
      if (block > 1) {
        pix.width = Math.max(1, Math.ceil(w / block));
        pix.height = Math.max(1, Math.ceil(h / block));
        pctx.drawImage(img, 0, 0, pix.width, pix.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(pix, 0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
      } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      ctx.globalAlpha = Math.pow(1 - p, 1.4);
      ctx.drawImage(layers[0], 0, 0);
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const k = mask.width / w;
      let active = false;
      let lineY = null;

      mctx.clearRect(0, 0, mask.width, mask.height);

      // Intro: bits assemble into the glyph portrait, then the photo streams in.
      if (intro) {
        if (intro.start === null) intro.start = now;
        const t = (now - intro.start) / 1000;
        if (t < ASSEMBLE + RESOLVE && layers.length && glyphAtlas) {
          drawIntro(t, now);
          raf = requestAnimationFrame(frame);
          return;
        }
        intro = null;
        particles = [];
        glyphAtlas = null;
      }

      // Touch screens: a decode band passes over now and then.
      if (scan) {
        const p = (now - scan.start) / 1800;
        if (p >= 1) {
          scan = null;
        } else {
          active = true;
          const band = 110;
          lineY = -band + p * (h + band * 2);
          const g = mctx.createLinearGradient(0, (lineY - band) * k, 0, (lineY + band) * k);
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(0.5, "rgba(255,255,255,1)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          mctx.fillStyle = g;
          mctx.fillRect(0, 0, mask.width, mask.height);
        }
      }

      // Cursor trail: a smoothed head drops blobs that shrink and fade.
      if (pointer.inside) {
        if (!head.live) {
          head.x = pointer.x;
          head.y = pointer.y;
          head.live = true;
        }
        const f = 1 - Math.exp(-dt * 12);
        const px = head.x;
        const py = head.y;
        head.x += (pointer.x - head.x) * f;
        head.y += (pointer.y - head.y) * f;
        const steps = Math.min(4, Math.floor(Math.hypot(head.x - px, head.y - py) / 10));
        for (let i = 1; i <= steps; i += 1) {
          blobs.push({ x: px + ((head.x - px) * i) / steps, y: py + ((head.y - py) * i) / steps, life: 1 });
        }
      }
      if (blobs.length || pointer.inside) {
        active = true;
        blobs = blobs.filter((b) => (b.life -= dt / TRAIL_LIFE) > 0);
        const stamp = (x, y, r, a) => {
          mctx.globalAlpha = a;
          mctx.drawImage(brush, (x - r) * k, (y - r) * k, r * 2 * k, r * 2 * k);
        };
        blobs.forEach((b) => stamp(b.x, b.y, RADIUS * (0.3 + 0.7 * b.life), b.life));
        if (pointer.inside) stamp(head.x, head.y, RADIUS, 1);
        mctx.globalAlpha = 1;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (active && layers.length) {
        if (now - lastSwap > SWAP_MS) {
          layerIdx = (layerIdx + 1) % layers.length;
          lastSwap = now;
        }
        cctx.globalCompositeOperation = "source-over";
        cctx.clearRect(0, 0, comp.width, comp.height);
        cctx.drawImage(layers[layerIdx], 0, 0);
        if (lineY !== null) {
          // A bright scan line where code turns into photo, only on the figure.
          cctx.globalCompositeOperation = "source-atop";
          cctx.fillStyle = "rgba(190,240,255,0.95)";
          cctx.fillRect(0, (lineY - 1) * dpr, comp.width, 2 * dpr);
        }
        cctx.globalCompositeOperation = "destination-in";
        cctx.drawImage(mask, 0, 0, comp.width, comp.height);
        ctx.drawImage(comp, 0, 0);
      }

      if (active) raf = requestAnimationFrame(frame);
      else last = 0;
    }

    const toLocal = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event) => {
      if (event.pointerType === "touch") return;
      Object.assign(pointer, toLocal(event), { inside: true });
      kick();
    };
    const onLeave = () => {
      pointer.inside = false;
      head.live = false;
    };
    const onDown = (event) => {
      if (event.pointerType !== "touch") return;
      const p = toLocal(event);
      for (let i = 0; i < 6; i += 1) {
        blobs.push({ x: p.x + (Math.random() - 0.5) * 50, y: p.y + (Math.random() - 0.5) * 50, life: 1 + i * 0.1 });
      }
      kick();
    };

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      if (!ready) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        layout();
        kick();
        if (!raf) frame(performance.now());
      }, 150);
    });

    let scanTimer = 0;
    if (touch && !reduce) {
      scanTimer = setInterval(() => {
        const rect = wrap.getBoundingClientRect();
        const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
        if (document.hidden || !onScreen || scan || intro) return;
        scan = { start: performance.now() };
        kick();
      }, SCAN_EVERY_MS);
    }

    const fontReady = document.fonts?.load ? document.fonts.load('10px "JetBrains Mono"').catch(() => {}) : null;
    Promise.all([img.decode(), fontReady])
      .then(() => {
        if (disposed) return;
        layout();
        ready = true;
        wrap.classList.add("is-ready");
        frame(performance.now());
        ro.observe(wrap);
        if (!reduce && !touch) {
          wrap.addEventListener("pointermove", onMove);
          wrap.addEventListener("pointerleave", onLeave);
        }
        if (!reduce) wrap.addEventListener("pointerdown", onDown);
      })
      .catch(() => wrap.classList.add("is-ready"));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      clearInterval(scanTimer);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div ref={wrapRef} className="decode-portrait">
      <div className="decode-portrait-glow" aria-hidden="true" />
      <canvas ref={canvasRef} className="decode-portrait-canvas" role="img" aria-label="Portrait of Manas Jha" />
      <span className="decode-portrait-tag is-tl" aria-hidden="true">
        {"// subject: manas_jha"}
      </span>
      <span className="decode-portrait-tag is-tr" aria-hidden="true">
        <span className="decode-portrait-hint-fine">hover to decode</span>
        <span className="decode-portrait-hint-touch">tap to decode</span>
      </span>
      <i className="decode-portrait-corner is-tl" aria-hidden="true" />
      <i className="decode-portrait-corner is-tr" aria-hidden="true" />
    </div>
  );
}
