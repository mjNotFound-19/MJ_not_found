import { FINISH, NOISE, ROAD } from "./common.glsl.js";

// Ironman, as the day goes: the swim is a dawn sea seen from water level
// (waves, sun glitter, orange course buoys); the bike and run share a gently
// winding country road through fields. The sun follows the time of day
// (uHour, 7 to 24); after dusk the run is lit by streetlights.
//   uLeg   0 swim, 1 bike, 2 run
//   uDist  metres into the current leg
//   uFade  0..1 dip to black at the transitions

export const IRONMAN_FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uLeg;
uniform float uDist;
uniform float uVel;
uniform float uHour;
uniform float uFade;
${NOISE}
${ROAD}
${FINISH}

const float HALF = 3.4;
const float LAMP_GAP = 38.0;

vec3 SUN;
vec3 SUN_COL;
float DAY;    // 1 in daylight, 0 at night
float NIGHT;  // 1 once the streetlights matter

void setSky(float hour) {
  // The sun rises at ~6:00 behind the swim, peaks early afternoon, sets ~20:30.
  float k = clamp((hour - 6.0) / 14.5, 0.0, 1.0);
  float elev = sin(k * 3.14159) * 0.95 - 0.06;
  float az = mix(-0.35, 0.9, k);
  SUN = normalize(vec3(sin(az), elev, cos(az)));
  DAY = smoothstep(-0.08, 0.12, elev);
  NIGHT = smoothstep(19.8, 21.2, hour);
  vec3 low = vec3(1.0, 0.5, 0.25);
  vec3 high = vec3(1.0, 0.93, 0.85);
  SUN_COL = mix(low, high, smoothstep(0.05, 0.45, elev)) * 3.4 * DAY;
}

vec3 sky(vec3 rd) {
  float y = max(rd.y, 0.0);
  float s = max(dot(rd, SUN), 0.0);
  vec3 dayTop = vec3(0.09, 0.25, 0.62);
  vec3 dayHor = vec3(0.55, 0.68, 0.84);
  vec3 duskHor = vec3(1.0, 0.45, 0.2);
  vec3 nightTop = vec3(0.004, 0.008, 0.025);
  vec3 nightHor = vec3(0.03, 0.04, 0.08);
  float golden = (1.0 - smoothstep(0.05, 0.35, SUN.y)) * DAY;
  vec3 hor = mix(mix(nightHor, dayHor, DAY), duskHor, golden * 0.85);
  vec3 top = mix(nightTop, dayTop, DAY);
  vec3 col = mix(hor, top, pow(y, 0.4));
  // Warm glow around a low sun, strongest at dawn and dusk.
  col += duskHor * pow(s, 4.0) * golden * 0.8;
  col += SUN_COL * (pow(s, 6.0) * 0.12 + pow(s, 1200.0) * 12.0);
  vec2 cuv = rd.xz / (rd.y + 0.1);
  float c = smoothstep(0.55, 0.85, fbm(cuv * 1.1 + vec2(uTime * 0.008, 0.0)));
  col = mix(col, mix(vec3(0.05, 0.05, 0.08), vec3(1.0, 0.85, 0.75), DAY) * (0.5 + 0.6 * pow(s, 3.0)), c * 0.5 * smoothstep(0.0, 0.3, rd.y));
  // Stars once it's dark.
  vec2 st = rd.xz / (rd.y + 0.05) * 120.0;
  float star = step(0.9965, hash12(floor(st))) * smoothstep(0.1, 0.5, rd.y);
  col += vec3(0.8, 0.85, 1.0) * star * (1.0 - DAY) * (0.6 + 0.4 * sin(uTime * 3.0 + hash12(floor(st)) * 40.0));
  return col;
}

// ---------- Swim ----------

float waves(vec2 p) {
  float t = uTime;
  float h = 0.0;
  h += 0.16 * sin(dot(p, vec2(0.14, 0.31)) + t * 1.1);
  h += 0.09 * sin(dot(p, vec2(-0.29, 0.21)) + t * 1.5);
  h += 0.05 * sin(dot(p, vec2(0.53, -0.37)) + t * 2.1);
  h += 0.12 * (noise(p * 0.35 + vec2(t * 0.25, t * 0.15)) - 0.5);
  h += 0.04 * (noise(p * 1.6 - vec2(t * 0.6, 0.0)) - 0.5);
  return h;
}

vec3 swim(vec3 ro, vec3 rd) {
  vec3 col = sky(rd);
  // Distant headland.
  float ang = atan(rd.x, rd.z);
  float land = 0.012 + 0.03 * fbm3(vec2(ang * 3.0, 0.0)) * smoothstep(0.25, 1.4, abs(ang + 0.6));
  if (rd.y < land && rd.y > 0.0) col = mix(col, vec3(0.04, 0.05, 0.07) * (0.4 + DAY), 0.85);

  if (rd.y < 0.0) {
    float t = -ro.y / rd.y;
    vec3 p = ro + rd * t;
    float e = 0.04 + t * 0.002;
    float h = waves(p.xz);
    vec3 n = normalize(vec3(h - waves(p.xz + vec2(e, 0.0)), e * 1.2, h - waves(p.xz + vec2(0.0, e))));
    n = normalize(mix(n, vec3(0.0, 1.0, 0.0), smoothstep(30.0, 400.0, t)));
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
    vec3 r = reflect(rd, n);
    vec3 refl = sky(r);
    vec3 body = vec3(0.0, 0.05, 0.07) * (0.3 + DAY) + vec3(0.0, 0.12, 0.1) * max(h, 0.0) * DAY;
    vec3 w = mix(body, refl, fres);
    w += SUN_COL * pow(max(dot(r, SUN), 0.0), 350.0) * 6.0;
    float fog = 1.0 - exp(-t * 0.004);
    col = mix(w, sky(vec3(rd.x, 0.0, rd.z)), fog);

    // Course buoys: bright orange, every 90 m on the left of the line.
    for (int i = 0; i < 4; i++) {
      float k = floor(ro.z / 90.0) + float(i);
      vec3 c = vec3(-5.0 + 3.0 * sin(k * 1.7), waves(vec2(-5.0, k * 90.0)) + 0.25, k * 90.0 + 40.0);
      vec3 oc = ro - c;
      float b = dot(oc, rd);
      float disc = b * b - dot(oc, oc) + 0.55 * 0.55;
      if (disc > 0.0) {
        float tb = -b - sqrt(disc);
        if (tb > 0.0 && tb < t) {
          vec3 bn = normalize(ro + rd * tb - c);
          vec3 bc = vec3(1.0, 0.32, 0.04) * (SUN_COL * max(dot(bn, SUN), 0.0) * 0.3 + 0.25 + 0.25 * bn.y);
          bc += SUN_COL * pow(max(dot(reflect(rd, bn), SUN), 0.0), 40.0) * 0.4;
          col = bc * exp(-tb * 0.003) + sky(rd) * (1.0 - exp(-tb * 0.003));
        }
      }
    }
  }
  return col;
}

// ---------- Bike and run ----------

float groundH(vec2 xz) {
  float a = abs(xz.x - roadX(xz.y));
  float h = roadY(xz.y);
  float bank = smoothstep(HALF + 2.0, 60.0, a);
  h += bank * ((fbm3(xz * 0.006) - 0.3) * 60.0 + a * 0.05);
  h += smoothstep(HALF + 0.5, HALF + 2.5, a) * (noise(xz * 0.5) - 0.5) * 0.18;
  h -= (1.0 - smoothstep(HALF - 0.3, HALF + 0.3, a)) * a * a * 0.004;
  return h;
}

float lamps(vec3 p) {
  float z = p.z - LAMP_GAP * floor(p.z / LAMP_GAP) - LAMP_GAP * 0.5;
  float x = p.x - roadX(p.z) - (HALF + 1.6);
  float y = p.y - roadY(p.z);
  float pole = length(vec2(x, z)) - 0.09;
  pole = max(pole, y - 6.2);
  float arm = length(max(abs(vec3(x + 0.8, y - 6.2, z)) - vec3(0.85, 0.05, 0.05), 0.0));
  return min(pole, arm);
}

vec2 marchLand(vec3 ro, vec3 rd) {
  float t = 0.3;
  for (int i = 0; i < 120; i++) {
    vec3 p = ro + rd * t;
    float dh = p.y - groundH(p.xz);
    // Streetlights line the run course only.
    float dl = uLeg > 1.5 ? lamps(p) : 1e3;
    float eps = 0.0015 * t;
    if (dl < eps) return vec2(t, 3.0);
    if (dh < eps) return vec2(t, 1.0);
    t += max(min(dh * 0.4, dl), 0.02 + t * 0.004);
    if (t > 1500.0) return vec2(t, 0.0);
  }
  return vec2(t, 1.0);
}

vec3 lampGlowAndLight(vec3 p, vec3 n, out vec3 glowAir) {
  vec3 light = vec3(0.0);
  glowAir = vec3(0.0);
  float k = floor(p.z / LAMP_GAP);
  for (int i = -1; i <= 1; i++) {
    float z = (k + float(i)) * LAMP_GAP + LAMP_GAP * 0.5;
    vec3 lp = vec3(roadX(z) + HALF + 0.8, roadY(z) + 6.1, z);
    vec3 L = lp - p;
    float d2 = dot(L, L);
    light += vec3(1.0, 0.72, 0.42) * 70.0 * max(dot(n, normalize(L)), 0.0) / (d2 + 4.0);
  }
  return light * NIGHT;
}

vec3 land(vec3 ro, vec3 rd) {
  vec2 hit = marchLand(ro, rd);
  float t = hit.x;
  vec3 col;
  if (hit.y < 0.5) {
    col = sky(rd);
  } else {
    vec3 p = ro + rd * t;
    vec3 n;
    vec3 albedo;
    float spec = 0.0;
    if (hit.y > 2.5) {
      vec2 e = vec2(0.003, 0.0);
      n = normalize(vec3(lamps(p + e.xyy) - lamps(p - e.xyy), lamps(p + e.yxy) - lamps(p - e.yxy), lamps(p + e.yyx) - lamps(p - e.yyx)));
      albedo = vec3(0.3, 0.31, 0.33);
      spec = 0.4;
    } else {
      float e = 0.03 + t * 0.001;
      float h = groundH(p.xz);
      n = normalize(vec3(h - groundH(p.xz + vec2(e, 0.0)), e, h - groundH(p.xz + vec2(0.0, e))));
      float u = p.x - roadX(p.z);
      float a = abs(u);
      if (a < HALF) {
        float grain = noise(p.xz * 20.0) * 0.5 + noise(p.xz * 70.0) * 0.5;
        albedo = vec3(0.07, 0.07, 0.075) * (0.75 + 0.4 * grain) * (0.85 + 0.3 * fbm3(p.xz * 0.3));
        float centre = (1.0 - smoothstep(0.06, 0.1, a)) * step(0.5, fract(p.z / 9.0));
        float edge = smoothstep(HALF - 0.3, HALF - 0.25, a) * (1.0 - smoothstep(HALF - 0.15, HALF - 0.1, a));
        albedo = mix(albedo, vec3(0.6, 0.55, 0.35), centre);
        albedo = mix(albedo, vec3(0.62), edge);
        spec = 0.03;
      } else {
        // Patchwork fields: each field (a rotated 70 m cell) gets its own crop.
        vec2 fp = ROT2 * p.xz / 70.0;
        vec2 cell = floor(fp);
        float crop = hash12(cell);
        vec3 c1 = vec3(0.07, 0.12, 0.03);
        vec3 c2 = vec3(0.22, 0.19, 0.07);
        vec3 c3 = vec3(0.12, 0.13, 0.05);
        albedo = crop < 0.45 ? c1 : (crop < 0.75 ? c2 : c3);
        float rows = 0.85 + 0.15 * sin(fp.x * 260.0 + crop * 10.0);
        albedo *= rows * (0.75 + 0.5 * noise(p.xz * 2.0));
        // Grass verge right by the road.
        albedo = mix(vec3(0.06, 0.1, 0.03) * (0.8 + 0.4 * noise(p.xz * 6.0)), albedo, smoothstep(HALF + 2.0, HALF + 6.0, a));
      }
    }
    float dif = max(dot(n, SUN), 0.0);
    vec3 amb = mix(vec3(0.008, 0.01, 0.02), vec3(0.3, 0.38, 0.52), DAY) * (0.5 + 0.5 * n.y);
    vec3 glowAir;
    col = albedo * (SUN_COL * dif + amb + lampGlowAndLight(p, n, glowAir));
    vec3 hv = normalize(SUN - rd);
    col += SUN_COL * pow(max(dot(n, hv), 0.0), 60.0) * spec;
    float fog = 1.0 - exp(-t * mix(0.0006, 0.0022, NIGHT));
    col = mix(col, sky(vec3(rd.x, 0.02, rd.z)) * 0.95, fog);
  }

  // Lamp heads glow in the air, the nearer ones brighter.
  float k = floor(ro.z / LAMP_GAP);
  for (int i = 0; i < 10; i++) {
    if (uLeg < 1.5) break;
    float z = (k + float(i)) * LAMP_GAP + LAMP_GAP * 0.5;
    vec3 lp = vec3(roadX(z) + HALF + 0.8, roadY(z) + 6.05, z);
    vec3 oc = lp - ro;
    float along = dot(oc, rd);
    if (along < 0.0 || along > t) continue;
    float d = length(oc - rd * along);
    col += vec3(1.0, 0.72, 0.45) * NIGHT * (0.012 / (d * d + 0.004) + 0.25 * exp(-d * 1.2)) / (1.0 + along * 0.02);
  }
  return col;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (2.0 * frag - uRes) / uRes.y;
  setSky(uHour);

  vec3 col;
  if (uLeg < 0.5) {
    // Eye level in the water, rising and falling with the swell. Each arm
    // stroke (one per ~1.1 m) rolls the head; every third, a breath to the side.
    float z = uDist;
    float stroke = z / 1.1 * 3.14159;
    float breathe = smoothstep(0.75, 1.0, sin(stroke / 3.0)) * 0.35;
    vec3 ro = vec3(0.0, 0.3 + 0.12 * sin(uTime * 1.3) + 0.05 * abs(sin(stroke)), z);
    vec3 fw = normalize(vec3(0.05 + breathe, 0.02 + 0.03 * sin(uTime * 0.9), 1.0));
    vec3 rt = normalize(cross(vec3(0.03 * sin(uTime * 0.7) + 0.07 * sin(stroke), 1.0, 0.0), fw));
    vec3 up = cross(fw, rt);
    vec3 rd = normalize(uv.x * rt + uv.y * up + 1.4 * fw);
    col = swim(ro, rd);
  } else {
    float run = step(1.5, uLeg);
    float d = uDist;
    // Runners bob once per stride (~1.1 m); cyclists sit higher and sway a
    // little with each pedal stroke (~7 m of road per crank turn).
    float stride = d / 1.1 * 3.14159;
    float crank = d / 7.0 * 6.28318;
    float eye = mix(1.45, 1.68, run) + run * 0.05 * abs(sin(stride)) + (1.0 - run) * 0.008 * sin(crank * 2.0);
    vec3 ro = vec3(roadX(d) + 0.9, roadY(d) + eye, d);
    float ahead = d + 22.0;
    vec3 ta = vec3(roadX(ahead) + 0.7, roadY(ahead) + eye - 0.4, ahead);
    vec3 fw = normalize(ta - ro);
    // Lean into bends with speed, plus the side-to-side of the stroke.
    float roll = clamp(-uVel * uVel * roadDDX(d) / 9.81 * 0.35, -0.12, 0.12)
      + (1.0 - run) * 0.012 * sin(crank) + run * 0.01 * sin(stride * 0.5);
    vec3 rt = normalize(cross(vec3(sin(roll), cos(roll), 0.0), fw));
    vec3 up = cross(fw, rt);
    vec3 rd = normalize(uv.x * rt + uv.y * up + 1.5 * fw);
    col = land(ro, rd);
  }

  col = finish(col, frag, uRes, uTime);
  gl_FragColor = vec4(col * (1.0 - uFade), 1.0);
}
`;
