import { FINISH, NOISE, ROAD } from "./common.glsl.js";

// Onboard lap of a forest circuit at golden hour: cambered asphalt with rubbered
// racing lines, red/white kerbs on the bends, armco on both sides, and a spruce
// forest of individual pointed crowns behind it, all raymarched as one
// heightfield plus an SDF for the barriers. The camera sits at driver height,
// heading down the road at uDist metres. The car is simulated in JS (see
// lib/motion.js): uVel is its speed in m/s and uAccel its smoothed
// acceleration (-1 hard braking .. 1 full throttle), which drive a shutter-
// accurate motion blur, cornering lean, pitch under braking and vibration.

export const NORDSCHLEIFE_FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uDist;
uniform float uSpeed;
uniform float uVel;
uniform float uAccel;
${NOISE}
${ROAD}
${FINISH}

const float HALF = 4.6;
const float RAIL = 7.4;
const vec3 SUN = vec3(-0.52, 0.36, 0.77);
const vec3 SUN_COL = vec3(1.0, 0.74, 0.5) * 3.2;

float lateral(vec3 p) { return p.x - roadX(p.z); }

float groundH(vec2 xz) {
  float a = abs(xz.x - roadX(xz.y));
  float h = roadY(xz.y);
  float bank = smoothstep(HALF + 1.5, 45.0, a);
  h += bank * ((fbm3(xz * 0.018) - 0.35) * 26.0 + a * 0.1);
  h += smoothstep(HALF + 0.8, HALF + 3.0, a) * (noise(xz * 0.45) - 0.5) * 0.22;
  // Camber: the crown sheds water to both edges.
  h -= (1.0 - smoothstep(HALF - 0.3, HALF + 0.3, a)) * a * a * 0.0045;
  return h;
}

// Spruce crowns: pointed cones on a jittered 5 m grid, only past the barriers.
float crowns(vec2 xz, out float id) {
  id = 0.0;
  float a = abs(xz.x - roadX(xz.y));
  float edge = smoothstep(RAIL + 2.0, RAIL + 5.5, a);
  if (edge <= 0.0) return 0.0;
  vec2 base = floor(xz / 5.0 - 0.5);
  float best = 0.0;
  for (int j = 0; j < 2; j++) {
    for (int i = 0; i < 2; i++) {
      vec2 c = base + vec2(float(i), float(j));
      vec2 center = (c + 0.25 + 0.5 * hash22(c)) * 5.0;
      float r = 3.0 + 1.8 * hash12(c + 7.0);
      float d = length(xz - center) / r;
      // Some cells stay empty, so light and sky show between the trees.
      if (hash12(c + 11.7) < 0.18) continue;
      float tall = 15.0 + 13.0 * hash12(c + 3.1);
      float hgt = tall * (1.0 - d);
      if (hgt > best) { best = hgt; id = hash12(c); }
    }
  }
  return best * edge;
}

float sceneH(vec2 xz, out float g, out float id) {
  g = groundH(xz);
  return g + crowns(xz, id);
}

float rails(vec3 p) {
  float u = abs(lateral(p));
  float v = p.y - roadY(p.z);
  vec2 q = vec2(u - RAIL, v - 0.62);
  float beam = length(max(abs(q) - vec2(0.04, 0.17), 0.0)) - 0.01;
  float pz = mod(p.z, 2.0) - 1.0;
  vec3 pp = vec3(u - RAIL - 0.14, v - 0.36, pz);
  float post = length(max(abs(pp) - vec3(0.05, 0.36, 0.05), 0.0));
  return min(beam, post);
}

// Returns t and material: 1 ground, 2 tree, 3 barrier, 0 sky.
vec2 march(vec3 ro, vec3 rd) {
  float t = 0.3;
  for (int i = 0; i < 130; i++) {
    vec3 p = ro + rd * t;
    float g;
    float id;
    float h = sceneH(p.xz, g, id);
    float dh = p.y - h;
    float dr = rails(p);
    float eps = 0.0015 * t;
    if (dr < eps) return vec2(t, 3.0);
    if (dh < eps) return vec2(t, h - g > 0.05 ? 2.0 : 1.0);
    t += max(min(dh * 0.33, dr), 0.02 + t * 0.004);
    if (t > 900.0) return vec2(t, 0.0);
  }
  // Out of steps while skimming the ground (common looking down a long
  // straight): it's ground, not sky.
  return vec2(t, 1.0);
}

vec3 normalH(vec3 p, float t) {
  float e = 0.02 + t * 0.001;
  float g;
  float id;
  float h = sceneH(p.xz, g, id);
  return normalize(vec3(h - sceneH(p.xz + vec2(e, 0.0), g, id), e, h - sceneH(p.xz + vec2(0.0, e), g, id)));
}

vec3 normalR(vec3 p) {
  vec2 e = vec2(0.003, 0.0);
  return normalize(vec3(rails(p + e.xyy) - rails(p - e.xyy), rails(p + e.yxy) - rails(p - e.yxy), rails(p + e.yyx) - rails(p - e.yyx)));
}

float shadow(vec3 p) {
  float res = 1.0;
  float t = 0.2;
  for (int i = 0; i < 22; i++) {
    vec3 q = p + SUN * t;
    float g;
    float id;
    float h = q.y - sceneH(q.xz, g, id);
    float r = rails(q);
    float d = min(h, r);
    res = min(res, 10.0 * d / t);
    if (res < 0.01) break;
    t += clamp(d, 0.3, 6.0);
  }
  return clamp(res, 0.0, 1.0);
}

vec3 sky(vec3 rd) {
  float s = max(dot(rd, SUN), 0.0);
  vec3 col = mix(vec3(0.58, 0.65, 0.74), vec3(0.16, 0.3, 0.56), clamp(rd.y * 2.2, 0.0, 1.0));
  col = mix(col, vec3(1.0, 0.68, 0.42), pow(1.0 - max(rd.y, 0.0), 7.0) * 0.55);
  col += vec3(1.0, 0.7, 0.42) * pow(s, 6.0) * 0.55 + vec3(1.0, 0.9, 0.75) * pow(s, 900.0) * 30.0;
  vec2 cuv = rd.xz / (rd.y + 0.12);
  float c = smoothstep(0.5, 0.85, fbm(cuv * 1.3 + vec2(uTime * 0.01, 0.0)));
  col = mix(col, vec3(1.0, 0.86, 0.74) * (0.55 + 0.7 * pow(s, 3.0)), c * 0.55 * smoothstep(0.0, 0.25, rd.y));
  return col * 1.1;
}

vec3 shade(vec3 ro, vec3 rd, vec2 hit) {
  float t = hit.x;
  vec3 p = ro + rd * t;
  if (hit.y < 0.5) return sky(rd);

  vec3 n = hit.y > 2.5 ? normalR(p) : normalH(p, t);
  float sh = shadow(p + n * 0.05);
  float dif = max(dot(n, SUN), 0.0) * sh;
  float amb = 0.5 + 0.5 * n.y;
  vec3 albedo;
  float spec = 0.0;
  float rough = 0.6;

  if (hit.y > 2.5) {
    albedo = vec3(0.42, 0.44, 0.47);
    spec = 0.6;
    rough = 0.25;
  } else if (hit.y > 1.5) {
    float g;
    float id;
    sceneH(p.xz, g, id);
    float leaf = fbm3(p.xz * 2.2 + p.y * 1.7);
    albedo = vec3(0.022, 0.045, 0.024) * (0.65 + 0.7 * id) * (0.6 + 0.8 * leaf);
    // Lower branches sit in the shade of the ones above.
    float hgt = clamp((p.y - g) / 18.0, 0.0, 1.0);
    amb *= 0.35 + 0.65 * hgt;
    // Light through the needles at the sun-facing edges.
    albedo += vec3(0.06, 0.07, 0.01) * pow(max(dot(rd, SUN), 0.0), 4.0) * hgt;
  } else {
    float u = lateral(p);
    float a = abs(u);
    if (a < HALF) {
      float grain = noise(p.xz * 18.0) * 0.5 + noise(p.xz * 60.0) * 0.5;
      float patchy = fbm3(p.xz * 0.25);
      albedo = vec3(0.075, 0.075, 0.08) * (0.75 + 0.35 * grain) * (0.8 + 0.45 * patchy);
      // Rubber laid down along the racing line, which swings with the bends.
      float line = roadDDX(p.z) * 900.0;
      float tyres = exp(-pow((u + clamp(line, -2.5, 2.5)) / 0.9, 2.0));
      albedo *= 1.0 - 0.35 * tyres;
      float edgeLine = smoothstep(HALF - 0.42, HALF - 0.36, a) * (1.0 - smoothstep(HALF - 0.2, HALF - 0.14, a));
      albedo = mix(albedo, vec3(0.62), edgeLine * (0.75 + 0.25 * noise(p.xz * 9.0)));
      spec = 0.08 + 0.08 * patchy;
      rough = 0.55;
    } else if (a < HALF + 0.95 && abs(roadDDX(p.z)) > 0.0016) {
      float stripe = step(1.5, mod(p.z, 3.0));
      albedo = mix(vec3(0.55, 0.035, 0.03), vec3(0.72), stripe);
      spec = 0.3;
      rough = 0.3;
    } else {
      float gr = noise(p.xz * 3.0) * 0.6 + noise(p.xz * 14.0) * 0.4;
      albedo = mix(vec3(0.05, 0.1, 0.025), vec3(0.16, 0.15, 0.06), smoothstep(0.35, 0.8, fbm3(p.xz * 0.2))) * (0.7 + 0.6 * gr);
    }
  }

  vec3 h = normalize(SUN - rd);
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
  float sp = pow(max(dot(n, h), 0.0), mix(400.0, 12.0, rough)) * spec * (1.0 + fres * 2.0) * sh;

  vec3 col = albedo * (SUN_COL * dif + vec3(0.3, 0.4, 0.58) * amb * 0.7 + vec3(0.14, 0.11, 0.06) * max(-n.y, 0.0));
  col += SUN_COL * sp;
  // The road picks up the bright sky near the horizon.
  if (spec > 0.0) col += sky(reflect(rd, n)) * fres * spec * 0.5;

  // Aerial perspective: distant trees fade into warm haze.
  float fog = 1.0 - exp(-t * 0.0019);
  vec3 fogCol = mix(vec3(0.5, 0.56, 0.64), vec3(0.95, 0.7, 0.48), pow(max(dot(rd, SUN), 0.0), 8.0) * 0.7);
  return mix(col, fogCol, fog);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (2.0 * frag - uRes) / uRes.y;

  // Motion blur as a camera shutter sees it: over a 1/60 s exposure the car
  // covers uVel/60 metres, so each pixel samples one random point of that.
  float jitter = (hash12(frag + fract(uTime * 7.3) * 113.0) - 0.5) * uVel / 60.0;
  float d = uDist + jitter;
  // Engine buzz plus road texture through stiff suspension, both growing
  // with speed; a slow body float on top.
  float buzz = sin(uTime * 92.0) * 0.0018 * uSpeed;
  float bumps = (noise(vec2(d * 0.35, 3.1)) - 0.5) * 0.035 * min(1.0, uVel / 30.0);
  float float1 = sin(uTime * 1.7) * 0.006;
  // Weight transfer: the nose dips under braking and lifts on throttle.
  float pitch = -uAccel * 0.55;
  vec3 ro = vec3(roadX(d) + 1.1, roadY(d) + 1.05 + buzz + bumps + float1, d);
  float ahead = d + 20.0 + uSpeed * 12.0;
  vec3 ta = vec3(roadX(ahead) + 0.5, roadY(ahead) + 0.75 + pitch, ahead);

  vec3 fw = normalize(ta - ro);
  // Lean with lateral g (v^2 x curvature), the way a helmet cam rolls.
  float latG = uVel * uVel * roadDDX(d) / 9.81;
  float roll = clamp(-latG * 0.05, -0.1, 0.1) + buzz * 4.0;
  vec3 up = vec3(sin(roll), cos(roll), 0.0);
  vec3 rt = normalize(cross(up, fw));
  vec3 vu = cross(fw, rt);
  float focal = 1.55 - uSpeed * 0.35;
  vec3 rd = normalize(uv.x * rt + uv.y * vu + focal * fw);

  vec2 hit = march(ro, rd);
  vec3 col = shade(ro, rd, hit);

  // Sun glare across the lens.
  float sg = max(dot(rd, SUN), 0.0);
  col += vec3(1.0, 0.65, 0.35) * pow(sg, 6.0) * 0.12;

  gl_FragColor = vec4(finish(col, frag, uRes, uTime), 1.0);
}
`;
