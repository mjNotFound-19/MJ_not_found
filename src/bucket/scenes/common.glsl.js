// GLSL shared by the road scenes (Nordschleife, Ironman): hashing and noise,
// a winding, undulating road defined along +z, and a filmic finish.
// Units are metres; the camera drives along the road at distance uDist.

export const NOISE = `
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }

float noise(vec2 x) {
  vec2 p = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(p);
  float b = hash12(p + vec2(1.0, 0.0));
  float c = hash12(p + vec2(0.0, 1.0));
  float d = hash12(p + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 ROT2 = mat2(0.8, -0.6, 0.6, 0.8);
float fbm(vec2 p) {
  float a = 0.0;
  float b = 0.5;
  for (int i = 0; i < 5; i++) { a += b * noise(p); p = ROT2 * p * 2.03; b *= 0.5; }
  return a;
}
float fbm3(vec2 p) {
  float a = 0.0;
  float b = 0.5;
  for (int i = 0; i < 3; i++) { a += b * noise(p); p = ROT2 * p * 2.03; b *= 0.5; }
  return a;
}
`;

// The road's centreline: lateral offset and height as functions of z, plus
// their slopes (for the camera's heading and pitch) and curvature (for kerbs).
export const ROAD = `
uniform float uBend;   // how twisty the road is (Nordschleife high, Ironman low)
uniform float uHills;  // how hilly

float roadX(float z) {
  return uBend * (38.0 * sin(z * 0.0105) + 21.0 * sin(z * 0.0047 + 1.3) + 8.0 * sin(z * 0.022 + 0.7));
}
float roadDX(float z) {
  return uBend * (38.0 * 0.0105 * cos(z * 0.0105) + 21.0 * 0.0047 * cos(z * 0.0047 + 1.3) + 8.0 * 0.022 * cos(z * 0.022 + 0.7));
}
float roadDDX(float z) {
  return -uBend * (38.0 * 0.0105 * 0.0105 * sin(z * 0.0105) + 21.0 * 0.0047 * 0.0047 * sin(z * 0.0047 + 1.3) + 8.0 * 0.022 * 0.022 * sin(z * 0.022 + 0.7));
}
float roadY(float z) {
  return uHills * (13.0 * sin(z * 0.0031) + 5.0 * sin(z * 0.0083 + 2.0));
}
float roadDY(float z) {
  return uHills * (13.0 * 0.0031 * cos(z * 0.0031) + 5.0 * 0.0083 * cos(z * 0.0083 + 2.0));
}
`;

// ACES-ish tonemap, a touch of vignette and film grain. Expects linear colour.
export const FINISH = `
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
vec3 finish(vec3 col, vec2 frag, vec2 res, float time) {
  col = aces(col * 1.05);
  col = pow(col, vec3(1.0 / 2.2));
  vec2 q = frag / res;
  col *= 0.35 + 0.65 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.18);
  col += (hash12(frag + fract(time * 13.7) * 91.0) - 0.5) * 0.035;
  return col;
}
`;
