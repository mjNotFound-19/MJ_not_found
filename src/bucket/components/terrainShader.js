// Real-time raymarched mountain range for the summit climb.
//
// Terrain: value noise with analytic derivatives, summed so that each octave is
// damped by the accumulated slope ("derivative fbm"). Steep areas get less fine
// detail and flat areas more, which reads like erosion: sharp ridges, smooth
// scree fans, gullies. A broad cone adds one dominant peak.
//
// The same terrain function is ported to JS (see terrainHeight) so the camera
// can be kept safely above the ground without reading back from the GPU.

export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform vec3 uCam;
uniform vec3 uTarget;
uniform float uAlt;      // 0 at the bottom of the climb, 1 at the summit
uniform float uFast;     // 1 while scrolling: cheaper detail so resolution can stay high

const vec3 SUN = vec3(0.82, 0.34, -0.3);
const vec2 PEAK = vec2(0.0, 2600.0);
const float SNOW_Y = 380.0;
const float CLOUD_Y = 720.0;
const mat2 M2 = mat2(0.8, -0.6, 0.6, 0.8);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Value noise + analytic derivatives (quintic interpolation).
vec3 noised(vec2 x) {
  vec2 p = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float a = hash(p);
  float b = hash(p + vec2(1.0, 0.0));
  float c = hash(p + vec2(0.0, 1.0));
  float d = hash(p + vec2(1.0, 1.0));
  float k1 = b - a;
  float k2 = c - a;
  float k4 = a - b - c + d;
  return vec3(a + k1 * u.x + k2 * u.y + k4 * u.x * u.y, du * vec2(k1 + k4 * u.y, k2 + k4 * u.x));
}

float fbmTerrain(vec2 x, int octaves) {
  vec2 p = x * 0.003;
  float a = 0.0;
  float b = 1.0;
  vec2 d = vec2(0.0);
  for (int i = 0; i < 11; i++) {
    if (i >= octaves) break;
    vec3 n = noised(p);
    d += n.yz;
    a += b * n.x / (1.0 + dot(d, d));
    b *= 0.5;
    p = M2 * p * 2.0;
  }
  return a;
}

float ridgedNoise(vec2 p) {
  return 1.0 - abs(noised(p).x * 2.0 - 1.0);
}

// The main peak: a three-sided pyramid (like Everest's faces and ridges) with a
// slightly irregular footprint, plus ridged noise carving ribs and gullies into
// the flanks, strongest mid-slope and fading out at the summit and the base.
// Same as fbmTerrain but with a fractional octave count: the last octave is
// weighted by its fraction, so changing the detail level blends smoothly
// instead of popping. Used for shading only; geometry keeps a fixed count.
float fbmTerrainF(vec2 x, float octaves) {
  vec2 p = x * 0.003;
  float a = 0.0;
  float b = 1.0;
  vec2 d = vec2(0.0);
  for (int i = 0; i < 11; i++) {
    float w = clamp(octaves - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    vec3 n = noised(p);
    d += n.yz * w;
    a += w * b * n.x / (1.0 + dot(d, d));
    b *= 0.5;
    p = M2 * p * 2.0;
  }
  return a;
}

float peakShape(vec2 xz) {
  vec2 d = xz - PEAK;
  float ang = atan(d.y, d.x);
  float lobes = 0.5 + 0.5 * cos(3.0 * ang + 0.6 * sin(2.0 * ang + 1.3));
  float r = length(d) / (1500.0 * (0.82 + 0.28 * lobes));
  float base = pow(max(0.0, 1.0 - r), 2.0);
  float rib = ridgedNoise(xz * 0.012) * 0.6 + ridgedNoise(xz * 0.027) * 0.4;
  return 950.0 * base + 480.0 * base * (1.0 - base) * (rib - 0.5);
}

float height(vec2 xz, int octaves) {
  return 320.0 * fbmTerrain(xz, octaves) + peakShape(xz);
}

float heightF(vec2 xz, float octaves) {
  return 320.0 * fbmTerrainF(xz, octaves) + peakShape(xz);
}

// The terrain's actual shape: one fixed detail level everywhere and in every
// render mode, so the mountains can't change shape as the camera moves.
const int GEO_OCT = 7;

// Shading detail for a surface at distance t. Far away, fine octaves are
// smaller than a pixel and only cost time (and alias), so they fade out. The
// fade is continuous: stepped levels sweep across the terrain as the camera moves.
float shadeOctaves(float t) {
  return 10.0 - 2.0 * smoothstep(500.0, 1400.0, t) - 2.0 * smoothstep(1800.0, 3600.0, t)
       - (uFast > 0.5 ? 0.6 : 0.0);
}

vec3 normalAt(vec3 p, float t) {
  float e = max(0.6, 0.0015 * t);
  float oct = shadeOctaves(t);
  float h = heightF(p.xz, oct);
  return normalize(vec3(
    h - heightF(p.xz + vec2(e, 0.0), oct),
    e,
    h - heightF(p.xz + vec2(0.0, e), oct)
  ));
}

float softShadow(vec3 ro, vec3 rd) {
  float res = 1.0;
  float t = 12.0;
  // While scrolling: fewer, longer steps over a coarser terrain.
  int steps = uFast > 0.5 ? 18 : 32;
  float maxStep = uFast > 0.5 ? 240.0 : 160.0;
  for (int i = 0; i < 32; i++) {
    if (i >= steps) break;
    vec3 p = ro + t * rd;
    // The +6 bias stops fine surface detail from shadowing itself into blotches.
    float h = p.y - height(p.xz, 6) + 6.0;
    // Lower factor = softer penumbra, which also hides banding on near ledges.
    res = min(res, 6.0 * h / t);
    t += clamp(h, 8.0, maxStep);
    if (res < 0.002 || p.y > 1600.0) break;
  }
  return clamp(res, 0.0, 1.0);
}

vec3 skyColor(vec3 rd) {
  // Thin air: the zenith goes from hazy blue to near-black as we climb.
  vec3 zenith = mix(vec3(0.20, 0.40, 0.76), vec3(0.008, 0.015, 0.05), smoothstep(0.25, 1.0, uAlt));
  vec3 horizon = mix(vec3(0.70, 0.78, 0.88), vec3(0.30, 0.42, 0.66), smoothstep(0.2, 1.0, uAlt));
  float y = max(rd.y, 0.0);
  vec3 col = mix(horizon, zenith, pow(y, 0.45));
  float s = max(dot(rd, normalize(SUN)), 0.0);
  col += vec3(1.0, 0.82, 0.62) * (0.22 * pow(s, 6.0) + 0.6 * pow(s, 64.0));
  col += vec3(1.0) * smoothstep(0.9995, 0.9999, s) * 4.0;
  // Stars appear once the sky is dark enough.
  if (uAlt > 0.55 && rd.y > 0.05) {
    vec2 g = rd.xz / (rd.y + 0.2) * 220.0;
    vec2 cell = floor(g);
    float h = hash(cell);
    float star = step(0.985, h) * smoothstep(0.6, 0.0, length(fract(g) - 0.5) * 3.0);
    col += star * smoothstep(0.55, 0.95, uAlt) * pow(y, 0.3) * 0.9;
  }
  return col;
}

vec3 fogColor(vec3 rd) {
  vec3 base = mix(vec3(0.66, 0.74, 0.86), vec3(0.36, 0.46, 0.66), uAlt);
  float s = max(dot(rd, normalize(SUN)), 0.0);
  return base + vec3(0.9, 0.7, 0.5) * 0.35 * pow(s, 8.0);
}

vec3 shadeTerrain(vec3 p, vec3 rd, float t) {
  vec3 sun = normalize(SUN);
  vec3 n = normalAt(p, t);

  // Fine texture fades out with distance: detail smaller than a pixel only
  // aliases into speckle, so far surfaces get the averaged value instead.
  float detail = smoothstep(2600.0, 350.0, t);

  // Rock albedo with strata and grain; snow where it's high and flat enough to hold.
  float grain = mix(0.5, fbmTerrain(p.xz * 6.0, 4), detail);
  float strata = 0.5 + 0.5 * sin(p.y * 0.07 + grain * 9.0);
  vec3 rock = mix(vec3(0.075, 0.072, 0.07), vec3(0.19, 0.17, 0.155), grain);
  rock *= 0.92 + 0.1 * strata;
  // Snow settles on gentle slopes and slides off steep faces, so slope decides
  // where it lies; only fine noise breaks up its edges (coarse noise reads as
  // painted-on blobs).
  float snowNoise = mix(fbmTerrain(p.xz * 2.0, 2), fbmTerrain(p.xz * 7.0, 3), detail);
  float snow = smoothstep(0.66, 0.84, n.y + (snowNoise - 0.5) * 0.12)
             * smoothstep(SNOW_Y - 60.0, SNOW_Y + 80.0, p.y + (snowNoise - 0.5) * 50.0);
  vec3 albedo = mix(rock, vec3(0.86, 0.9, 0.96), snow);

  float dif = clamp(dot(n, sun), 0.0, 1.0);
  float sha = dif > 0.001 ? softShadow(p + n * 4.0, sun) : 0.0;
  float skyL = clamp(0.5 + 0.5 * n.y, 0.0, 1.0);
  float bounce = clamp(0.2 - 0.8 * n.y, 0.0, 1.0);

  vec3 light = vec3(0.0);
  light += dif * vec3(2.5, 2.2, 1.9) * sha;
  light += skyL * vec3(0.28, 0.36, 0.52);
  light += bounce * vec3(0.18, 0.14, 0.10);
  vec3 col = albedo * light;

  // Snow sparkle / sheen facing the sun.
  vec3 h = normalize(sun - rd);
  col += snow * sha * pow(clamp(dot(n, h), 0.0, 1.0), 40.0) * 0.6;
  return col;
}

// Filmic tone curve (ACES fit) keeps bright snow from clipping to flat white.
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uRes) / uRes.y;

  vec3 ro = uCam;
  vec3 fw = normalize(uTarget - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.7 * fw);

  // March the heightfield.
  float tMax = 11000.0;
  float t = 1.0;
  bool hit = false;
  // Longer steps are safe because the bisection below corrects any overshoot;
  // they change how fast the surface is found, not where it is.
  float tPrev = t;
  for (int i = 0; i < 200; i++) {
    vec3 p = ro + t * rd;
    float h = p.y - height(p.xz, GEO_OCT);
    if (h < 0.0015 * t) { hit = true; break; }
    // Nothing is taller than ~1,250: a ray climbing past that only finds sky.
    if (t > tMax || (p.y > 1300.0 && rd.y > 0.0)) break;
    tPrev = t;
    t += 0.62 * h;
  }
  // The last step can overshoot into the rock, which reads as contour bands
  // that crawl with the camera. Bisect between the last two samples to find
  // the actual surface crossing.
  if (hit) {
    float lo = tPrev;
    float hi = t;
    for (int k = 0; k < 6; k++) {
      float mid = 0.5 * (lo + hi);
      vec3 pm = ro + mid * rd;
      if (pm.y - height(pm.xz, GEO_OCT) > 0.0) lo = mid; else hi = mid;
    }
    t = 0.5 * (lo + hi);
  }

  vec3 col;
  if (hit) {
    col = shadeTerrain(ro + t * rd, rd, t);
    // Aerial perspective, thinner the higher we are.
    float density = mix(1.0, 0.35, uAlt);
    float fog = 1.0 - exp(-pow(t * 0.00016 * density, 1.4));
    col = mix(col, fogColor(rd), fog);
  } else {
    col = skyColor(rd);
    t = tMax;
  }

  // Sea of clouds: once we're above the layer, look down onto it.
  if (ro.y > CLOUD_Y && rd.y < 0.0) {
    float tc = (CLOUD_Y - ro.y) / rd.y;
    if (tc < t) {
      vec3 cp = ro + tc * rd;
      float c = fbmTerrain(cp.xz * 0.35 + vec2(40.0, 0.0), 5);
      float density = smoothstep(0.42, 0.78, c);
      float lit = 0.75 + 0.35 * fbmTerrain(cp.xz * 0.7, 3);
      vec3 cloud = vec3(1.0, 0.98, 0.96) * lit * 1.4;
      float fadeIn = smoothstep(CLOUD_Y + 20.0, CLOUD_Y + 220.0, ro.y);
      float distFade = exp(-tc * 0.00012);
      float grazing = smoothstep(0.03, 0.18, -rd.y);
      col = mix(col, cloud, density * fadeIn * grazing * (0.4 + 0.6 * distFade));
    }
  }

  col = aces(col * 0.95);
  col = pow(col, vec3(1.0 / 2.2));
  // Tiny dither to avoid banding in the sky gradient.
  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---- JS port of the terrain height (camera clearance only) ----

const fract = (v) => v - Math.floor(v);

function hash(px, py) {
  let x = fract(px * 123.34);
  let y = fract(py * 456.21);
  const d = x * (x + 45.32) + y * (y + 45.32);
  x += d;
  y += d;
  return fract(x * y);
}

function noise(xx, yy) {
  const px = Math.floor(xx);
  const py = Math.floor(yy);
  const fx = xx - px;
  const fy = yy - py;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const dux = 30 * fx * fx * (fx * (fx - 2) + 1);
  const duy = 30 * fy * fy * (fy * (fy - 2) + 1);
  const a = hash(px, py);
  const b = hash(px + 1, py);
  const c = hash(px, py + 1);
  const d = hash(px + 1, py + 1);
  const k1 = b - a;
  const k2 = c - a;
  const k4 = a - b - c + d;
  return [a + k1 * ux + k2 * uy + k4 * ux * uy, dux * (k1 + k4 * uy), duy * (k2 + k4 * ux)];
}

const ridged = (x, z) => 1 - Math.abs(noise(x, z)[0] * 2 - 1);

// Mirrors peakShape() in the shader.
function peakShape(x, z) {
  const dx = x - 0;
  const dz = z - 2600;
  const ang = Math.atan2(dz, dx);
  const lobes = 0.5 + 0.5 * Math.cos(3 * ang + 0.6 * Math.sin(2 * ang + 1.3));
  const r = Math.hypot(dx, dz) / (1500 * (0.82 + 0.28 * lobes));
  const base = Math.pow(Math.max(0, 1 - r), 2);
  const rib = ridged(x * 0.012, z * 0.012) * 0.6 + ridged(x * 0.027, z * 0.027) * 0.4;
  return 950 * base + 480 * base * (1 - base) * (rib - 0.5);
}

export function terrainHeight(x, z, octaves = 7) {
  let px = x * 0.003;
  let py = z * 0.003;
  let a = 0;
  let b = 1;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < octaves; i++) {
    const [n, nx, ny] = noise(px, py);
    dx += nx;
    dy += ny;
    a += (b * n) / (1 + dx * dx + dy * dy);
    b *= 0.5;
    // p = M2 * p * 2 with M2 = mat2(0.8, -0.6, 0.6, 0.8) (column-major).
    const qx = (0.8 * px + 0.6 * py) * 2;
    const qy = (-0.6 * px + 0.8 * py) * 2;
    px = qx;
    py = qy;
  }
  return 320 * a + peakShape(x, z);
}

// ---- Upscale pass ----
// Scrolling frames render below screen resolution. Rather than let the browser
// stretch them bilinearly (soft and blocky), this pass rebuilds the full-size
// image with Catmull-Rom bicubic filtering (9 bilinear taps covering the 4x4
// footprint), then applies a light unsharp mask to restore edge contrast.
export const UPSCALE_FRAG = `
precision highp float;

uniform sampler2D uTex;
uniform vec2 uSrcRes;   // size of the low-resolution scene texture
uniform vec2 uDstRes;   // size of the output canvas
uniform float uSharpen;

vec3 catmullRom(vec2 uv) {
  vec2 samplePos = uv * uSrcRes;
  vec2 texPos1 = floor(samplePos - 0.5) + 0.5;
  vec2 f = samplePos - texPos1;

  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);

  vec2 w12 = w1 + w2;
  vec2 offset12 = w2 / w12;

  vec2 texPos0 = (texPos1 - 1.0) / uSrcRes;
  vec2 texPos3 = (texPos1 + 2.0) / uSrcRes;
  vec2 texPos12 = (texPos1 + offset12) / uSrcRes;

  vec3 r = vec3(0.0);
  r += texture2D(uTex, vec2(texPos0.x, texPos0.y)).rgb * w0.x * w0.y;
  r += texture2D(uTex, vec2(texPos12.x, texPos0.y)).rgb * w12.x * w0.y;
  r += texture2D(uTex, vec2(texPos3.x, texPos0.y)).rgb * w3.x * w0.y;
  r += texture2D(uTex, vec2(texPos0.x, texPos12.y)).rgb * w0.x * w12.y;
  r += texture2D(uTex, vec2(texPos12.x, texPos12.y)).rgb * w12.x * w12.y;
  r += texture2D(uTex, vec2(texPos3.x, texPos12.y)).rgb * w3.x * w12.y;
  r += texture2D(uTex, vec2(texPos0.x, texPos3.y)).rgb * w0.x * w3.y;
  r += texture2D(uTex, vec2(texPos12.x, texPos3.y)).rgb * w12.x * w3.y;
  r += texture2D(uTex, vec2(texPos3.x, texPos3.y)).rgb * w3.x * w3.y;
  return r;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uDstRes;
  vec3 c = catmullRom(uv);
  // Unsharp mask against a one-source-texel cross.
  vec2 px = 1.0 / uSrcRes;
  vec3 blur = (texture2D(uTex, uv + vec2(px.x, 0.0)).rgb + texture2D(uTex, uv - vec2(px.x, 0.0)).rgb
             + texture2D(uTex, uv + vec2(0.0, px.y)).rgb + texture2D(uTex, uv - vec2(0.0, px.y)).rgb) * 0.25;
  c = clamp(c + (c - blur) * uSharpen, 0.0, 1.0);
  gl_FragColor = vec4(c, 1.0);
}
`;
