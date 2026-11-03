import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

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

// A full-screen fragment shader on a canvas, drawn every frame while it's on
// screen and paused when it isn't. `getUniforms(timeSeconds)` is called each
// frame and returns { uName: number | number[] }; uRes and uTime are set here.
//
// Resolution adapts to frame time the way the Everest scene does: it renders
// below display resolution and scales the work up or down to hold ~60 fps, so
// a slow GPU gets a softer image instead of a stutter.
export default function ShaderCanvas({ frag, getUniforms, onUnsupported, className = "", maxScale = 0.85 }) {
  const canvasRef = useRef(null);
  const uniformsRef = useRef(getUniforms);
  uniformsRef.current = getUniforms;

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    let program;
    let buf;
    try {
      if (!gl) throw new Error("WebGL unavailable");
      program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch (err) {
      console.warn("[ShaderCanvas] falling back:", err);
      onUnsupported?.();
      return undefined;
    }

    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const locations = new Map();
    const loc = (name) => {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
      return locations.get(name);
    };
    const set = (name, v) => {
      const l = loc(name);
      if (l === null) return;
      if (typeof v === "number") gl.uniform1f(l, v);
      else if (v.length === 2) gl.uniform2f(l, v[0], v[1]);
      else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2]);
      else gl.uniform4f(l, v[0], v[1], v[2], v[3]);
    };

    const s = {
      scale: Math.min(maxScale, window.innerWidth < 768 ? 0.5 : 0.65),
      raf: 0,
      last: 0,
      avg: 16,
      visible: false,
      lost: false,
      start: performance.now(),
    };

    const draw = (now) => {
      s.raf = 0;
      if (s.lost || !s.visible) return;
      if (s.last && now - s.last < 100) {
        s.avg = s.avg * 0.85 + (now - s.last) * 0.15;
        // A 60 Hz display delivers a frame every ~16.7 ms, so anything at or
        // near that is keeping up; only clearly missed frames mean too much work.
        if (s.avg > 20.5 && s.scale > 0.3) s.scale = Math.max(0.3, s.scale * 0.94);
        else if (s.avg < 18 && s.scale < maxScale) s.scale = Math.min(maxScale, s.scale * 1.015);
      }
      s.last = now;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr * s.scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr * s.scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      const t = (now - s.start) / 1000;
      set("uRes", [w, h]);
      set("uTime", t);
      const extra = uniformsRef.current?.(t) ?? {};
      Object.keys(extra).forEach((k) => set(k, extra[k]));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      s.raf = requestAnimationFrame(draw);
    };

    // Only spend GPU time while the scene is (nearly) on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting;
        if (s.visible && !s.raf) {
          s.last = 0;
          s.raf = requestAnimationFrame(draw);
        }
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(canvas);

    const onLost = (event) => {
      event.preventDefault();
      s.lost = true;
      onUnsupported?.();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(s.raf);
      io.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      // Keep the context itself: StrictMode remounts get the same one back.
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [frag, onUnsupported, maxScale]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} aria-hidden="true" />;
}
