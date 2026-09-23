import { useEffect, useRef } from "react";
import { useMotionValueEvent } from "framer-motion";
import { FRAG, UPSCALE_FRAG, VERT, terrainHeight } from "./terrainShader";

const PEAK = { x: 0, z: 2600 };
const SUMMIT_Y = terrainHeight(PEAK.x, PEAK.z);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

// How long scrolling must pause before the sharp frame starts rendering.
const SETTLE_MS = 150;
// Cap for the sharp frame, in device pixels (keeps huge screens bounded).
const HQ_MAX_PIXELS = 2.6e6;

// Camera path for climb progress c (0..1): from a valley floor looking up at the
// peak, rising past the cloud layer to just above the summit, looking down on it.
function cameraFor(c) {
  const e = smooth(c);
  const x = lerp(-520, -160, e);
  const z = lerp(-1100, 1350, e);
  const wantY = lerp(640, SUMMIT_Y + 230, e);
  // Stay clear of the ground: the JS port of the terrain gives the height here.
  const y = Math.max(wantY, terrainHeight(x, z) + 70);
  const target = [PEAK.x, lerp(SUMMIT_Y * 0.55, SUMMIT_Y - 60, e), PEAK.z];
  return { cam: [x, y, z], target };
}

function compile(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || "shader compile failed");
  }
  return shader;
}

function linkProgram(gl, fragSrc) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

// One WebGL context running the terrain shader on a canvas. With `upscale`, the
// scene renders into a smaller texture and a second pass rebuilds it at canvas
// size (bicubic + sharpen) instead of leaving that to the browser's bilinear.
function createRenderer(canvas, { preserveDrawingBuffer = false, fast = false, upscale = false } = {}) {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer,
  });
  if (!gl) throw new Error("WebGL unavailable");

  const scene = linkProgram(gl, FRAG);
  const up = upscale ? linkProgram(gl, UPSCALE_FRAG) : null;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const bindQuad = (program) => {
    gl.useProgram(program);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  };

  const u = {
    res: gl.getUniformLocation(scene, "uRes"),
    cam: gl.getUniformLocation(scene, "uCam"),
    target: gl.getUniformLocation(scene, "uTarget"),
    alt: gl.getUniformLocation(scene, "uAlt"),
    fast: gl.getUniformLocation(scene, "uFast"),
  };
  const uu = up && {
    tex: gl.getUniformLocation(up, "uTex"),
    src: gl.getUniformLocation(up, "uSrcRes"),
    dst: gl.getUniformLocation(up, "uDstRes"),
    sharpen: gl.getUniformLocation(up, "uSharpen"),
  };

  // Offscreen target for the low-resolution scene (upscale mode only).
  let fbo = null;
  let tex = null;
  let texW = 0;
  let texH = 0;
  const ensureTarget = (w, h) => {
    if (fbo && texW === w && texH === h) return;
    if (!fbo) {
      fbo = gl.createFramebuffer();
      tex = gl.createTexture();
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Linear filtering is what the 9-tap Catmull-Rom relies on.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    texW = w;
    texH = h;
  };

  const setScene = (w, h, c) => {
    const { cam, target } = cameraFor(c);
    bindQuad(scene);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.res, w, h);
    gl.uniform3f(u.cam, cam[0], cam[1], cam[2]);
    gl.uniform3f(u.target, target[0], target[1], target[2]);
    gl.uniform1f(u.alt, c);
    gl.uniform1f(u.fast, fast ? 1 : 0);
  };

  return {
    // Full frame straight to the canvas, or rows [y, y + h) when given.
    drawDirect(c, y, h) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      setScene(canvas.width, canvas.height, c);
      if (h === undefined) {
        gl.disable(gl.SCISSOR_TEST);
      } else {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, y, canvas.width, h);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    // Scene at (w, h), then upscaled to fill the canvas.
    drawUpscaled(c, w, h) {
      gl.disable(gl.SCISSOR_TEST);
      ensureTarget(w, h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      setScene(w, h, c);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      bindQuad(up);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uu.tex, 0);
      gl.uniform2f(uu.src, w, h);
      gl.uniform2f(uu.dst, canvas.width, canvas.height);
      // More sharpening the further we upscale; none at native size.
      const ratio = canvas.width / w;
      gl.uniform1f(uu.sharpen, Math.min(0.6, Math.max(0, (ratio - 1) * 0.5)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      // Free GPU objects but keep the context: a remount of this canvas (e.g. React
      // StrictMode in development) gets the same context back from getContext().
      gl.deleteBuffer(buf);
      gl.deleteProgram(scene);
      if (up) gl.deleteProgram(up);
      if (fbo) gl.deleteFramebuffer(fbo);
      if (tex) gl.deleteTexture(tex);
    },
  };
}

// Progressive rendering: while the climb moves, a fast low-resolution frame
// (resolution adapts to frame time). Once scrolling settles, a sharp frame at
// device resolution renders in strips across several frames (so no single frame
// stalls) and fades in on top; any new movement drops it instantly.
export default function TerrainCanvas({ climb, onUnsupported }) {
  const lowRef = useRef(null);
  const hqRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const low = lowRef.current;
    const hq = hqRef.current;
    let lowR;
    let hqR;
    try {
      lowR = createRenderer(low, { fast: true, upscale: true });
      hqR = createRenderer(hq, { preserveDrawingBuffer: true });
    } catch (err) {
      console.warn("[TerrainCanvas] falling back to illustration:", err);
      onUnsupported?.();
      return undefined;
    }

    const s = {
      // Fraction of output resolution the scene renders at while scrolling.
      scale: window.innerWidth < 768 ? 0.6 : 0.75,
      sceneW: 1,
      sceneH: 1,
      lowRaf: 0,
      hqRaf: 0,
      settle: 0,
      last: 0,
      avg: 16,
      lost: false,
      hqJob: null,
    };

    const cancelHQ = () => {
      window.clearTimeout(s.settle);
      cancelAnimationFrame(s.hqRaf);
      s.hqJob = null;
      // Hide instantly: fading out would leave a ghost of the old viewpoint on top.
      hq.style.transition = "none";
      hq.style.opacity = "0";
    };

    const drawLow = () => {
      s.lowRaf = 0;
      if (s.lost) return;
      const now = performance.now();
      if (s.last && now - s.last < 100) {
        s.avg = s.avg * 0.8 + (now - s.last) * 0.2;
        if (s.avg > 22 && s.scale > 0.4) s.scale = Math.max(0.4, s.scale * 0.92);
        else if (s.avg < 15 && s.scale < 1) s.scale = Math.min(1, s.scale * 1.04);
      }
      s.last = now;
      // The canvas itself is always at display resolution; only the scene
      // texture shrinks, and the upscale pass fills the gap.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const outW = Math.max(1, Math.round(low.clientWidth * dpr));
      const outH = Math.max(1, Math.round(low.clientHeight * dpr));
      if (low.width !== outW || low.height !== outH) {
        low.width = outW;
        low.height = outH;
      }
      s.sceneW = Math.max(1, Math.round(outW * s.scale));
      s.sceneH = Math.max(1, Math.round(outH * s.scale));
      lowR.drawUpscaled(Math.min(1, Math.max(0, climb.get())), s.sceneW, s.sceneH);
      s.settle = window.setTimeout(startHQ, SETTLE_MS);
    };

    const startHQ = () => {
      if (s.lost) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let w = Math.round(hq.clientWidth * dpr);
      let h = Math.round(hq.clientHeight * dpr);
      const k = Math.min(1, Math.sqrt(HQ_MAX_PIXELS / Math.max(1, w * h)));
      w = Math.max(1, Math.round(w * k));
      h = Math.max(1, Math.round(h * k));
      hq.width = w;
      hq.height = h;
      // Each strip costs about what a scrolling frame costs (already tuned to
      // the frame budget); full quality is ~2x dearer per pixel, hence the /2.
      const budget = Math.max(1, (s.sceneW * s.sceneH) / 2);
      const strips = Math.max(1, Math.ceil((w * h) / budget));
      const c = Math.min(1, Math.max(0, climb.get()));
      s.hqJob = { y: 0, stripH: Math.ceil(h / strips), h, c };
      s.hqRaf = requestAnimationFrame(stepHQ);
    };

    const stepHQ = () => {
      const job = s.hqJob;
      if (!job || s.lost) return;
      hqR.drawDirect(job.c, job.y, job.stripH);
      job.y += job.stripH;
      if (job.y < job.h) {
        s.hqRaf = requestAnimationFrame(stepHQ);
      } else {
        s.hqJob = null;
        hq.style.transition = "opacity 0.35s ease";
        hq.style.opacity = "1";
      }
    };

    const request = () => {
      cancelHQ();
      if (!s.lowRaf) s.lowRaf = requestAnimationFrame(drawLow);
    };

    const onLost = (event) => {
      event.preventDefault();
      s.lost = true;
      cancelHQ();
      onUnsupported?.();
    };
    low.addEventListener("webglcontextlost", onLost);
    hq.addEventListener("webglcontextlost", onLost);
    const ro = new ResizeObserver(request);
    ro.observe(low);

    apiRef.current = { request };
    request();

    return () => {
      cancelAnimationFrame(s.lowRaf);
      cancelHQ();
      ro.disconnect();
      low.removeEventListener("webglcontextlost", onLost);
      hq.removeEventListener("webglcontextlost", onLost);
      apiRef.current = null;
      lowR.dispose();
      hqR.dispose();
    };
  }, [climb, onUnsupported]);

  useMotionValueEvent(climb, "change", () => apiRef.current?.request());

  return (
    <>
      <canvas ref={lowRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <canvas
        ref={hqRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0 }}
        aria-hidden="true"
      />
    </>
  );
}
