import { useEffect, useRef } from "react";

// Katakana + digits + a few symbols, the classic Matrix glyph set.
const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:=*+-<>¦|";
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Three depth layers: far rain is small, dim and slow; near rain is large and bright.
const LAYERS = [
  { size: 11, speed: 70, alpha: 0.28, trail: 14, density: 0.55 },
  { size: 15, speed: 120, alpha: 0.55, trail: 18, density: 0.5 },
  { size: 20, speed: 190, alpha: 0.9, trail: 22, density: 0.32 },
];

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export default function MatrixRain({
  color = "#00AEEF",
  background = "#01030c",
  secret = "",
  secretColor = "#b6ff44",
  revealSecret = false,
}) {
  const canvasRef = useRef(null);
  const revealTargetRef = useRef(revealSecret ? 1 : 0);

  useEffect(() => {
    revealTargetRef.current = revealSecret ? 1 : 0;
  }, [revealSecret]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const [r, g, b] = hexToRgb(color);
    const [sr, sg, sb] = hexToRgb(secretColor);
    const secretChars = secret.toUpperCase().split("");

    let width = 0;
    let height = 0;
    let layers = [];
    let secretSlots = [];
    let rafId = 0;
    let lastTime = performance.now();
    let revealBlend = revealTargetRef.current;
    let boost = 0; // scroll-driven speed boost, decays back to 0
    let lastScrollY = window.scrollY;
    const pointer = { x: -9999, y: -9999, active: false };
    let scanY = -200;
    let nextScanAt = performance.now() + 4000;

    const makeDrop = (layer, x, initial) => {
      const trailLength = Math.round(layer.trail * (0.6 + Math.random() * 0.8));
      return {
        x,
        y: initial ? Math.random() * height : -Math.random() * height * 0.6,
        speed: layer.speed * (0.65 + Math.random() * 0.7),
        glyphs: Array.from({ length: trailLength }, randomGlyph),
        lastRow: 0,
      };
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Thin out the rain on small screens so it stays a backdrop.
      const densityScale = width < 768 ? 0.6 : 1;
      layers = LAYERS.map((layer) => {
        const columns = Math.floor(width / layer.size);
        const drops = [];
        for (let i = 0; i < columns; i++) {
          if (Math.random() < layer.density * densityScale) {
            drops.push(makeDrop(layer, i * layer.size, true));
          }
        }
        return { ...layer, drops, font: `${layer.size}px "JetBrains Mono", monospace` };
      });

      // Secret message sits on one row across the near layer's grid, centered.
      const near = LAYERS[LAYERS.length - 1];
      const columns = Math.floor(width / near.size);
      secretSlots = [];
      if (secretChars.length && columns >= secretChars.length + 2) {
        const start = Math.floor((columns - secretChars.length) / 2);
        const row = Math.floor(height / near.size / 2);
        secretSlots = secretChars.map((char, i) => ({
          char,
          x: (start + i) * near.size,
          y: row * near.size,
          lit: 0,
        }));
        // Every secret column needs rain falling through it, or its letter never lights up.
        const nearLayer = layers[layers.length - 1];
        const taken = new Set(nearLayer.drops.map((drop) => drop.x));
        secretSlots.forEach((slot) => {
          if (!taken.has(slot.x)) nearLayer.drops.push(makeDrop(near, slot.x, true));
        });
      }
    };

    const onResize = () => build();
    const onPointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;
      boost = Math.min(2.2, boost + delta / 260);
    };

    const draw = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      boost *= 0.94;
      revealBlend += (revealTargetRef.current - revealBlend) * 0.06;

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      ctx.textBaseline = "top";

      const lensRadius = 160;

      layers.forEach((layer, layerIndex) => {
        ctx.font = layer.font;
        const isNear = layerIndex === layers.length - 1;
        const cell = layer.size;

        layer.drops.forEach((drop) => {
          drop.y += drop.speed * (1 + boost) * dt;
          const headRow = Math.floor(drop.y / cell);

          // Each time the head enters a new row, shift the trail and pick a new head glyph.
          if (headRow !== drop.lastRow) {
            drop.lastRow = headRow;
            drop.glyphs.pop();
            drop.glyphs.unshift(randomGlyph());
          }
          // Occasionally mutate a glyph mid-trail for that shimmering look.
          if (Math.random() < 0.04) {
            drop.glyphs[Math.floor(Math.random() * drop.glyphs.length)] = randomGlyph();
          }

          const trailLength = drop.glyphs.length;
          for (let i = 0; i < trailLength; i++) {
            const y = (headRow - i) * cell;
            if (y < -cell || y > height) continue;

            const fade = 1 - i / trailLength;
            let alpha = layer.alpha * fade * fade;

            // Pointer lens: glyphs near the cursor light up.
            let lens = 0;
            if (pointer.active) {
              const dx = drop.x - pointer.x;
              const dy = y - pointer.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < lensRadius) lens = 1 - dist / lensRadius;
            }
            alpha = Math.min(1, alpha + lens * 0.6 * fade);

            // Scanline sweep brightens whatever it passes.
            const scanDist = Math.abs(y - scanY);
            if (scanDist < 40) alpha = Math.min(1, alpha + (1 - scanDist / 40) * 0.35 * fade);

            if (i === 0) {
              // White-hot head with a glow.
              ctx.shadowColor = `rgb(${r},${g},${b})`;
              ctx.shadowBlur = isNear ? 14 : 8;
              ctx.fillStyle = `rgba(235,250,255,${Math.min(1, layer.alpha + 0.15 + lens * 0.3)})`;
              ctx.fillText(drop.glyphs[0], drop.x, y);
              ctx.shadowBlur = 0;
            } else {
              // Blend toward white near the cursor.
              const mix = lens * 0.7;
              const cr = Math.round(r + (255 - r) * mix);
              const cg = Math.round(g + (255 - g) * mix);
              const cb = Math.round(b + (255 - b) * mix);
              ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
              ctx.fillText(drop.glyphs[i], drop.x, y);
            }
          }

          if ((headRow - trailLength) * cell > height) {
            Object.assign(drop, makeDrop(layer, drop.x, false));
          }
        });

        // Secret message decodes on the near layer as drops pass through its row.
        if (isNear && secretSlots.length && revealBlend > 0.01) {
          secretSlots.forEach((slot) => {
            const passing = layer.drops.some((drop) => {
              if (drop.x !== slot.x) return false;
              const headY = Math.floor(drop.y / cell) * cell;
              return slot.y <= headY && slot.y >= headY - drop.glyphs.length * cell;
            });
            slot.lit = passing ? 1 : slot.lit * 0.985;
            const alpha = revealBlend * (0.35 + slot.lit * 0.65);
            ctx.fillStyle = background;
            ctx.fillRect(slot.x, slot.y, cell, cell);
            ctx.shadowColor = secretColor;
            ctx.shadowBlur = 12 * slot.lit * revealBlend;
            ctx.fillStyle = `rgba(${sr},${sg},${sb},${alpha})`;
            ctx.fillText(slot.char, slot.x, slot.y);
            ctx.shadowBlur = 0;
          });
        }
      });

      // Periodic scanline sweep.
      if (now > nextScanAt) {
        scanY += 900 * dt;
        if (scanY > height + 200) {
          scanY = -200;
          nextScanAt = now + 6000 + Math.random() * 6000;
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        lastTime = performance.now();
        rafId = requestAnimationFrame(draw);
      }
    };

    build();
    rafId = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [color, background, secret, secretColor]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          background,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div className="matrix-vignette" aria-hidden="true" />
    </>
  );
}
