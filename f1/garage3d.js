// f1.h garage: generated 3D cars (tools/cars) with an explode -> transform -> reassemble change.
//
// One persistent renderer. Each car is a GLB whose nodes are the car's components (stable ids shared by
// every team); rest transforms are read once and never mutated, and every frame is computed from them
// by poseAt(t), a pure function of the timeline position, so any frame can be scrubbed (debug only).
// Needs the import map in index.html ("three", "three/addons/").
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DUR = 3.6;
const PH = { prep: 0.35, apart: 1.35, xform: 2.0, settle: 3.25 };
const CACHE = 3;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOut = (u) => 1 - Math.pow(1 - u, 3);
const smooth = (a, b, t) => { const u = clamp01((t - a) / (b - a)); return u * u * (3 - 2 * u); };
const win = (t, [s, d]) => clamp01((t - s) / d);

// ---------------------------------------------------------------------------------- dissolve shader
const DS_VERT = `varying vec3 vDsPos;`;
const DS_FRAG = `
uniform float uDsK; uniform float uDsDir; uniform vec3 uDsEdge; varying vec3 vDsPos;
float dsHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dsNoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dsHash(i), dsHash(i + vec3(1,0,0)), f.x), mix(dsHash(i + vec3(0,1,0)), dsHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dsHash(i + vec3(0,0,1)), dsHash(i + vec3(1,0,1)), f.x), mix(dsHash(i + vec3(0,1,1)), dsHash(i + vec3(1,1,1)), f.x), f.y), f.z); }
float dsField(){ return 0.55 * dsNoise(vDsPos * 6.0) + 0.2 * dsNoise(vDsPos * 21.0) + 0.25 * clamp((2.9 - vDsPos.x) / 5.8, 0.0, 1.0); }`;

function patchDissolve(material, U) {
  if (material.userData.ds) return;
  material.userData.ds = true;
  material.onBeforeCompile = (sh) => {
    sh.uniforms.uDsK = U.uDsK; sh.uniforms.uDsDir = U.uDsDir; sh.uniforms.uDsEdge = U.uDsEdge;
    sh.vertexShader = DS_VERT + "\n" + sh.vertexShader.replace("#include <project_vertex>",
      "#include <project_vertex>\n vDsPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = DS_FRAG + "\n" + sh.fragmentShader
      .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
  float dsN = dsField();
  if (uDsDir > 0.5 && dsN < uDsK) discard;
  if (uDsDir < -0.5 && dsN >= uDsK) discard;`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
  if (abs(uDsDir) > 0.5) totalEmissiveRadiance += uDsEdge * (1.0 - smoothstep(0.0, 0.03, abs(dsN - uDsK))) * step(0.0005, uDsK) * step(uDsK, 0.9995);`);
  };
  material.customProgramCacheKey = () => "ds1";
  material.needsUpdate = true;
}

// ---------------------------------------------------------------------------------- studio
function studioEnvironment(renderer) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 30), new THREE.MeshBasicMaterial({ color: 0x0b0c0f, side: THREE.BackSide }));
  room.position.y = 5; env.add(room);
  const panel = (w, h, intensity, pos, rotX = 0, rotY = 0, color = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(rotX, rotY, 0); env.add(m);
  };
  panel(7, 2.4, 1.7, [0, 9, 0], Math.PI / 2);                    // overhead softbox
  panel(14, 0.6, 5.0, [0, 6.5, -7], 0.4);                        // long strips: crisp highlights on paint
  panel(14, 0.6, 3.5, [0, 6.5, 7], -0.4);
  panel(0.6, 7, 2.2, [-11, 4, 0], 0, Math.PI / 2, 0xdfe8ff);
  panel(0.6, 7, 1.6, [11, 4, 0], 0, -Math.PI / 2, 0xfff2e4);
  panel(30, 2, 0.35, [0, 0.2, -14.9], 0, 0, 0x9fb0d0);         // horizon glow
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(env, 0.035);
  env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  pm.dispose();
  return rt;
}

function radialTexture(stops, size = 256) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------------------------- mount
// view: optional fixed camera { az, tilt, zoom, sway } - the car holds that angle and sways gently by `sway` radians
// instead of turning all the way round (used by the hero).
export async function mount(host, { manifestUrl, teams, start = 0, auto = true, quality, onChange, onState, debug = false, view = null } = {}) {
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");
  const manifest = await (await fetch(manifestUrl)).json();
  const base = new URL(".", new URL(manifestUrl, location.href)).href;
  const small = quality ? quality === "mobile" : (Math.min(innerWidth, innerHeight) < 700 || (navigator.deviceMemory || 8) <= 4);
  const variant = small ? "mobile" : "desktop";

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));   // adapted at runtime (adaptResolution)
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.45;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;           // shadows only re-render while parts move (the light is fixed)
  host.prepend(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const envRT = studioEnvironment(renderer);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 1.6;
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 120);
  // screen-space ambient occlusion (desktop): contact darkening in undercuts, wheel wells and panel joints,
  // computed per frame so it stays correct while parts separate
  let composer = null, gtao = null;
  if (!small) {
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.32, distanceExponent: 1.4, thickness: 1.2, scale: 1.0, samples: 12 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    gtao.blendIntensity = 0.9;
    composer.addPass(gtao);
    composer.addPass(new OutputPass());
  }
  const draw = () => (composer ? composer.render() : renderer.render(scene, camera));
  // the AO pass renders opaquely, so the scene paints the section's own backdrop (team-tinted radial gradient)
  const bgCanvas = document.createElement("canvas"); bgCanvas.width = 512; bgCanvas.height = 288;
  const bgTex = new THREE.CanvasTexture(bgCanvas); bgTex.colorSpace = THREE.SRGBColorSpace;
  function paintBackdrop(hex) {
    if (!composer) return;
    const g2 = bgCanvas.getContext("2d"), W = bgCanvas.width, H = bgCanvas.height;
    const tint = new THREE.Color(hex || "#1a2030").lerp(new THREE.Color("#141924"), 0.78);
    const gr = g2.createRadialGradient(W * 0.5, H * 0.62, 0, W * 0.5, H * 0.62, W * 0.62);
    gr.addColorStop(0, "#" + tint.getHexString()); gr.addColorStop(0.55, "#0f1219"); gr.addColorStop(1, "#0b0d11");
    g2.fillStyle = gr; g2.fillRect(0, 0, W, H);
    bgTex.needsUpdate = true;
    scene.background = bgTex;
  }
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3.5, 9, 4.5);
  key.target.position.set(0, 0.4, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -5.5, right: 5.5, top: 5.5, bottom: -5.5, near: 1, far: 25 });
  key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key, key.target);
  const rimL = new THREE.DirectionalLight(0xdfe8ff, 1.1);      // separates dark liveries from the dark page
  rimL.position.set(-6, 3.5, -5); scene.add(rimL);
  const groundShadow = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.ShadowMaterial({ opacity: 0.42 }));
  groundShadow.rotation.x = -Math.PI / 2; groundShadow.receiveShadow = true; scene.add(groundShadow);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 2.6), new THREE.MeshBasicMaterial({
    map: radialTexture([[0, "rgba(0,0,0,0.85)"], [0.55, "rgba(0,0,0,0.35)"], [1, "rgba(0,0,0,0)"]]), transparent: true, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2; contact.position.set(0.1, 0.002, 0); scene.add(contact);
  const glowTex = radialTexture([[0, "rgba(255,255,255,0.22)"], [0.5, "rgba(255,255,255,0.06)"], [1, "rgba(255,255,255,0)"]]);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, toneMapped: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.001; scene.add(glow);
  if (view) glow.visible = false;      // fixed, low view over a page background: a lit floor would end in a hard edge at the canvas

  // guide lines (rest anchor -> displaced part), one buffer for every part of the visible car(s)
  const GUIDE_MAX = 256;
  const gPos = new Float32Array(GUIDE_MAX * 6);
  const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute("position", new THREE.BufferAttribute(gPos, 3));
  const gMat = new THREE.LineDashedMaterial({ color: 0xc9d4ea, dashSize: 0.05, gapSize: 0.04, transparent: true, opacity: 0, depthWrite: false });
  const guides = new THREE.LineSegments(gGeo, gMat); guides.frustumCulled = false; scene.add(guides);

  // ------------------------------------------------------------------------------ assets
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const cache = new Map();          // slug -> Promise<Car>
  const lru = [];
  const motion = {};
  for (const c of manifest.components) motion[c.id] = c;

  function teamEntry(i) { return manifest.cars[teams[i].team]; }

  function load(i) {
    const entry = teamEntry(i);
    const slug = entry.slug;
    if (cache.has(slug)) { lru.splice(lru.indexOf(slug), 1); lru.push(slug); return cache.get(slug); }
    const p = loader.loadAsync(base + entry.files[variant].url).then((g) => prepare(g, entry, i));
    cache.set(slug, p); lru.push(slug);
    p.catch(() => { cache.delete(slug); lru.splice(lru.indexOf(slug), 1); });
    while (lru.length > CACHE) {
      const old = lru.find((s) => s !== cur?.slug && s !== next?.slug);
      if (!old) break;
      lru.splice(lru.indexOf(old), 1);
      cache.get(old)?.then(disposeCar);
      cache.delete(old);
    }
    return p;
  }

  function prepare(gltf, entry, i) {
    const root = gltf.scene;
    const U = { uDsK: { value: 0 }, uDsDir: { value: 0 }, uDsEdge: { value: new THREE.Color(teams[i].color || "#ffffff").multiplyScalar(2.2) } };
    const nodes = new Map(), rest = new Map();
    root.traverse((o) => {
      const id = o.userData?.id;
      if (id) { nodes.set(id, o); rest.set(id, { p: o.position.clone(), q: o.quaternion.clone() }); }
      if (o.isMesh) {
        o.castShadow = true; o.receiveShadow = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => { patchDissolve(m, U); if (m.map) m.map.anisotropy = renderer.capabilities.getMaxAnisotropy(); });
      }
    });
    let livery = null;
    root.traverse((o) => { if (o.isMesh && o.material?.name === "livery") livery = o.material; });
    const car = { slug: entry.slug, entry, root, nodes, rest, U, livery, liveryImg: livery?.map?.image, anchors: new Map(), bbox: new Map() };
    // rest anchors (car space) and component boxes in component-local space, measured from the decoded
    // meshes (the optimiser may fold dequantisation transforms into nodes, so stored extents can't be trusted)
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4(), rel = new THREE.Matrix4();
    for (const [id, n] of nodes) {
      const meshes = [];
      (function walk(o) { for (const ch of o.children) { if (ch.userData?.id) continue; if (ch.isMesh) meshes.push(ch); walk(ch); } })(n);
      if (n.isMesh) meshes.push(n);
      if (!meshes.length) continue;
      inv.copy(n.matrixWorld).invert();
      const lb = new THREE.Box3();
      for (const m of meshes) {
        m.geometry.computeBoundingBox();
        lb.union(m.geometry.boundingBox.clone().applyMatrix4(rel.multiplyMatrices(inv, m.matrixWorld)));
      }
      car.bbox.set(id, lb);
      car.anchors.set(id, lb.getCenter(new THREE.Vector3()).applyMatrix4(n.matrixWorld));
    }
    paintNumbers(car, teams[i].drivers?.[teams[i].driver || 0]?.number);
    return car;
  }

  function paintNumbers(car, number) {
    if (!car.livery || !car.liveryImg) return;
    const img = car.liveryImg, W = img.width, H = img.height;
    let cv = car.canvas;
    if (!cv) { cv = car.canvas = document.createElement("canvas"); cv.width = W; cv.height = H; }
    const g = cv.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(img, 0, 0);
    if (number != null && number !== "") {
      for (const s of car.entry.slots) {
        const [[a, c], [b, d]] = s.m;            // uv per mm: columns = (reading, up)
        g.setTransform(a * W, b * H, -c * W, -d * H, s.uv[0] * W, s.uv[1] * H);
        g.font = `700 ${s.h_mm}px Tektur, "Arial Narrow", sans-serif`;
        g.textAlign = "center"; g.textBaseline = "middle";
        g.fillStyle = s.color;
        g.fillText(String(number), 0, 0);
      }
    }
    if (!car.tex) {
      car.tex = new THREE.CanvasTexture(cv);
      car.tex.flipY = false; car.tex.colorSpace = THREE.SRGBColorSpace;
      car.tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      car.livery.map = car.tex; car.livery.needsUpdate = true;
    } else car.tex.needsUpdate = true;
  }

  function disposeCar(car) {
    car.root.removeFromParent();
    car.root.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "clearcoatMap", "aoMap"]) m[k]?.dispose();
        m.dispose();
      });
    });
    car.tex?.dispose();
  }

  // ------------------------------------------------------------------------------ pose (pure)
  const qI = new THREE.Quaternion(), qTmp = new THREE.Quaternion(), vTmp = new THREE.Vector3();
  const offQ = new Map();
  for (const c of manifest.components) offQ.set(c.id, new THREE.Quaternion(...c.quat));
  const LIFT = manifest.timeline.lift;

  function liftAt(t, role) {
    if (role === "solo") return 0;
    if (role === "out") return LIFT.height * ease(win(t, LIFT.out));
    if (role === "in") return LIFT.height * (1 - ease(win(t, LIFT.inn)));
    return 0;
  }
  function explodeAt(m, t, role) {
    if (role === "out") return ease(win(t, m.out));
    if (role === "in") return 1 - easeOut(win(t, m.inn));
    return 0;
  }
  // role: "out" (car leaving: disassembles, then hands over), "in" (arriving: exploded, then reassembles)
  function poseAt(car, t, role, other) {
    const k = smooth(PH.apart, PH.xform, t);
    const lift = liftAt(t, role);
    let settle = 0;
    if (role === "in" && t > PH.settle) { const s = t - PH.settle; settle = -0.004 * Math.exp(-s * 9) * Math.sin(s * 34); }
    car.root.position.set(0, lift + settle, 0);
    for (const [id, n] of car.nodes) {
      const m = motion[id], r = car.rest.get(id);
      if (!m) { n.position.copy(r.p); n.quaternion.copy(r.q); continue; }
      const e = explodeAt(m, t, role);
      // where the matching part of the other car sits (transformation phase)
      const o = other?.rest.get(id);
      const p0 = vTmp.copy(r.p);
      const q0 = qTmp.copy(r.q);
      if (o && t > PH.apart && t < PH.xform + 1e-6) {
        const kk = role === "out" ? k : 1 - k;
        p0.lerp(o.p, kk); q0.slerp(o.q, kk);
      }
      n.position.set(p0.x + m.off[0] * e, p0.y + m.off[1] * e, p0.z + m.off[2] * e);
      n.quaternion.copy(q0).multiply(qI.identity().slerp(offQ.get(id), e));
      if (m.spin) {
        // fasteners: release a little during preparation, spin off with the part, tighten on the way back
        const rel = role === "out" ? smooth(0, PH.prep, t) : 1 - smooth(3.0, PH.settle, t);
        const side = Math.sign(m.off[2]) || 1;
        n.quaternion.multiply(qI.setFromAxisAngle(AXIS_Z, (rel * 1.2 + e * 6) * side));
        n.position.z += 0.022 * rel * side;
      }
    }
    car.root.updateMatrixWorld(true);
  }
  const AXIS_Z = new THREE.Vector3(0, 0, 1);

  // ------------------------------------------------------------------------------ framing
  const corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  function carBox(car, out) {
    out.makeEmpty();
    for (const [id, lb] of car.bbox) {
      const n = car.nodes.get(id);
      if (!n.children.some((c) => c.isMesh) && !n.isMesh) continue;
      let i = 0;
      for (const x of [lb.min.x, lb.max.x]) for (const y of [lb.min.y, lb.max.y]) for (const z of [lb.min.z, lb.max.z]) corners[i++].set(x, y, z).applyMatrix4(n.matrixWorld);
      corners.forEach((c) => out.expandByPoint(c));
    }
    return out;
  }
  function carPoints(car, out) {        // world-space corners of every component's local box
    for (const [id, lb] of car.bbox) {
      const n = car.nodes.get(id);
      for (const x of [lb.min.x, lb.max.x]) for (const y of [lb.min.y, lb.max.y]) for (const z of [lb.min.z, lb.max.z]) out.push(x, y, z), applyLast(out, n.matrixWorld);
    }
    return out;
  }
  const _v = new THREE.Vector3();
  function applyLast(arr, m) { const i = arr.length - 3; _v.set(arr[i], arr[i + 1], arr[i + 2]).applyMatrix4(m); arr[i] = _v.x; arr[i + 1] = _v.y; arr[i + 2] = _v.z; }
  function sampleBoxes(A, B) {
    const boxes = [];
    for (let i = 0; i <= 72; i++) {
      const t = (i / 72) * DUR, pts = [];
      if (A && t <= PH.xform) { poseAt(A, t, "out", B); carPoints(A, pts); }
      if (B && t >= PH.apart) { poseAt(B, t, "in", A); carPoints(B, pts); }
      boxes.push(new Float32Array(pts));
    }
    return boxes;
  }
  const right = new THREE.Vector3(), up = new THREE.Vector3(), dir = new THREE.Vector3();
  function fitDistance(clouds, target) {
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), tanH = tanV * camera.aspect;
    const mH = 0.9, mV = camera.aspect < 1 ? 0.64 : 0.84;
    let d = 0;
    const c = _v;
    for (const P of clouds) for (let i = 0; i < P.length; i += 3) {
      c.set(P[i] - target.x, P[i + 1] - target.y, P[i + 2] - target.z);
      const cx = c.dot(right), cy = c.dot(up), cz = c.dot(dir);
      d = Math.max(d, cz + Math.abs(cx) / (tanH * mH), cz + Math.abs(cy) / (tanV * mV));
    }
    return d;
  }
  function cloudCentre(clouds, out) {
    const b = new THREE.Box3();
    for (const P of clouds) for (let i = 0; i < P.length; i += 3) b.expandByPoint(_v.set(P[i], P[i + 1], P[i + 2]));
    return b.getCenter(out);
  }

  // ------------------------------------------------------------------------------ state
  let cur = null, next = null, curIdx = start, pending = null, trans = null, token = 0, loading = false;
  let restCloud = null, boxes = null;
  let az = view?.az ?? 0.95, tilt = view?.tilt ?? 0.32, vel = 0, dragging = false, lx = 0, ly = 0, aspect = 1, autoOn = auto && !REDUCED;
  let scrubT = null, holdT = 0, zoomMul = view?.zoom ?? 1, snap = false, swayT = 0, swayPrev = 0;
  const target = new THREE.Vector3(0, 0.45, 0), camDist = { v: 10 };

  function setGuides(cars, t) {
    let n = 0;
    const alpha = t == null ? 0 : smooth(0, PH.prep, t) * (1 - smooth(PH.settle, DUR, t));
    gMat.opacity = 0.55 * alpha;
    if (alpha <= 0) { gGeo.setDrawRange(0, 0); return; }
    for (const [car] of cars) {
      for (const [id, a] of car.anchors) {
        const m = motion[id];
        if (!m || Math.hypot(...m.off) < 0.05 || n >= GUIDE_MAX) continue;
        const nd = car.nodes.get(id), lb = car.bbox.get(id);
        const c = lb.getCenter(vTmp).applyMatrix4(nd.matrixWorld);
        if (c.distanceTo(a) < 0.02) continue;
        gPos.set([a.x, a.y, a.z, c.x, c.y, c.z], n * 6); n++;
      }
    }
    gGeo.attributes.position.needsUpdate = true;
    gGeo.setDrawRange(0, n * 2);
    guides.computeLineDistances();
  }

  function setVisible(car, on) { if (on && car.root.parent !== scene) scene.add(car.root); if (!on) car.root.removeFromParent(); }
  function setCastShadow(car, on) { car.root.traverse((o) => { if (o.isMesh) o.castShadow = on; }); }

  async function begin(i) {
    const my = ++token;
    loading = true; onState?.({ loading: true, index: i });
    let B;
    try { B = await load(i); } catch (err) {
      console.error("garage: could not load car", teams[i]?.team, err);
      if (my === token) { loading = false; onState?.({ loading: false, error: err.message, index: curIdx }); pending = null; }
      return;
    }
    if (my !== token) return;
    loading = false; onState?.({ loading: false, index: i });
    if (!cur) {            // first car
      cur = B; curIdx = i; setVisible(B, true); poseAt(B, 0, "solo"); paintBackdrop(teams[i].color);
      restCloud = new Float32Array(carPoints(B, [])); shadowDirty = true; onChange?.(i);
      prefetch();
      return;
    }
    if (B === cur) { pending = null; return; }
    if (REDUCED) {        // no motion: swap in place
      setVisible(cur, false); cur = B; curIdx = i; setVisible(B, true); poseAt(B, 0, "solo"); paintBackdrop(teams[i].color); restCloud = new Float32Array(carPoints(B, [])); shadowDirty = true; onChange?.(i); pending = null; kick(); return;
    }
    next = B;
    boxes = sampleBoxes(cur, next);
    poseAt(cur, 0, "out", next);
    trans = { t0: performance.now(), from: cur, to: next, idx: i, swapped: false };
    pending = pending === i ? null : pending;
    startRaf();
  }

  function go(i) {
    i = ((i % teams.length) + teams.length) % teams.length;
    pending = i;
    if (!trans && !loading) begin(i);
    else if (loading) begin(i);         // a newer selection supersedes the one still loading
  }

  function prefetch() {
    if (!autoOn) return;
    const n = (curIdx + 1) % teams.length;
    load(n).catch(() => {});
  }

  function step(now) {
    if (!trans) return null;
    let t = scrubT != null ? scrubT : (now - trans.t0) / 1000;
    t = Math.min(t, DUR);
    const A = trans.from, B = trans.to;
    // outgoing car
    const showA = t <= PH.xform, showB = t >= PH.apart;
    setVisible(A, showA); setVisible(B, showB);
    if (showA) poseAt(A, t, "out", B);
    if (showB) poseAt(B, t, "in", A);
    const k = smooth(PH.apart, PH.xform, t);
    A.U.uDsDir.value = t > PH.apart ? 1 : 0; A.U.uDsK.value = k * 1.08 - 0.02;
    B.U.uDsDir.value = t < PH.xform ? -1 : 0; B.U.uDsK.value = k * 1.08 - 0.02;
    setCastShadow(A, k < 0.5); setCastShadow(B, k >= 0.5);
    if (!trans.swapped && t >= (PH.apart + PH.xform) / 2) { trans.swapped = true; curIdx = trans.idx; paintBackdrop(teams[trans.idx].color); onChange?.(trans.idx); }
    setGuides([[A], [B]].filter(([c]) => c.root.parent === scene), t);
    contact.material.opacity = 1 - clamp01((A.root.position.y + B.root.position.y) / 0.25);
    if (t >= DUR && scrubT == null) finish();
    return t;
  }
  function finish() {
    const { from: A, to: B } = trans;
    setVisible(A, false); A.U.uDsDir.value = 0; B.U.uDsDir.value = 0;
    setCastShadow(B, true);
    poseAt(B, 0, "solo");
    cur = B; next = null; trans = null; holdT = 0; boxes = null;
    restCloud = new Float32Array(carPoints(B, []));
    shadowDirty = true;
    setGuides([], null);
    contact.material.opacity = 1;
    prefetch();
    if (pending != null && pending !== curIdx) begin(pending); else pending = null;
  }

  // ------------------------------------------------------------------------------ camera + loop
  const el = renderer.domElement;
  const down = (e) => { if (trans || e.target.closest?.("button, a")) return; dragging = true; lx = e.clientX; ly = e.clientY; host.classList.add("grabbing"); el.setPointerCapture?.(e.pointerId); };
  const move = (e) => { if (!dragging) return; vel = (e.clientX - lx) * -0.005; az += vel; tilt = Math.max(0.05, Math.min(0.8, tilt + (e.clientY - ly) * 0.004)); lx = e.clientX; ly = e.clientY; kick(); };
  const upH = () => { dragging = false; host.classList.remove("grabbing"); };
  el.addEventListener("pointerdown", down); addEventListener("pointermove", move); addEventListener("pointerup", upH);
  el.style.touchAction = "pan-y";

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); aspect = w / h; camera.aspect = aspect;
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
    if (aspect < 1) camera.setViewOffset(w, h, 0, h * 0.06, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix(); kick();
  };

  const frameTimes = [];
  let shadowDirty = true;
  // dynamic resolution: drop the pixel ratio on slow GPUs (sustained > 22 ms), restore when there is headroom
  const maxDpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
  let dpr = maxDpr, slow = 0, fast = 0;
  function adaptResolution(dt) {
    if (REDUCED || !running) return;
    const ms = dt * 1000;
    if (ms > 22) { slow += dt; fast = 0; } else if (ms < 13) { fast += dt; slow = 0; } else { slow = Math.max(0, slow - dt); }
    if (slow > 1 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); slow = 0; renderer.setPixelRatio(dpr); resize(); }
    else if (fast > 4 && dpr < maxDpr) { dpr = Math.min(maxDpr, dpr + 0.25); fast = 0; renderer.setPixelRatio(dpr); resize(); }
  }
  let running = false, raf = 0, last = performance.now(), until = 0;
  function frame(now) {
    if (!host.isConnected) { dispose(); return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = step(now);
    if (!dragging && !trans) {
      vel *= 0.92;
      if (view) { swayT += dt; const sw = REDUCED ? 0 : Math.sin(swayT * 0.45) * (view.sway ?? 0.18); az += vel + sw - swayPrev; swayPrev = sw; }   // hold the angle, sway a little
      else az += vel + (REDUCED ? 0 : dt * 0.08);
    }
    if (!trans && cur && autoOn && pending == null && !loading) { holdT += dt; if (holdT > 5.5) { holdT = 0; go(curIdx + 1); } }
    // camera: fitted to the animated bounds (windowed over the timeline so it eases out before parts arrive)
    const prepAz = t != null ? 0.06 * smooth(0, PH.prep, t) * (1 - smooth(PH.settle, DUR, t)) : 0;
    const prepTilt = t != null ? 0.07 * smooth(0, PH.apart, t) * (1 - smooth(PH.settle - 0.4, DUR, t)) : 0;
    const A = az + prepAz, T = tilt + prepTilt;
    dir.set(Math.sin(A) * Math.cos(T), Math.sin(T), Math.cos(A) * Math.cos(T));
    right.crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    up.crossVectors(dir, right).normalize();
    let clouds = restCloud ? [restCloud] : [];
    if (trans && boxes && t != null) {
      const i0 = Math.max(0, Math.floor(((t - 0.35) / DUR) * 72)), i1 = Math.min(72, Math.ceil(((t + 0.35) / DUR) * 72));
      clouds = boxes.slice(i0, i1 + 1);
    }
    if (clouds.length) {
      const c = cloudCentre(clouds, new THREE.Vector3());
      target.lerp(c, snap || scrubT != null ? 1 : trans ? 0.12 : 0.08);
      const want = fitDistance(clouds, target);
      camDist.v += (want - camDist.v) * (snap || scrubT != null ? 1 : trans ? 0.1 : 0.06);
      if (camDist.v < want * 0.97) camDist.v = want * 0.97;     // never clip: catch up immediately
    }
    camera.position.copy(target).addScaledVector(dir, camDist.v * zoomMul);
    camera.lookAt(target);
    if (trans || shadowDirty) { renderer.shadowMap.needsUpdate = true; shadowDirty = false; }
    draw();
    adaptResolution(dt);
    frameTimes.push(dt * 1000); if (frameTimes.length > 240) frameTimes.shift();
    if (running || trans || now < until || dragging) raf = requestAnimationFrame(frame); else raf = 0;
  }
  function kick(ms = 450) { until = performance.now() + ms; if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function startRaf() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const startLoop = () => { if (running) return; running = !REDUCED; startRaf(); };
  const stopLoop = () => { running = false; };
  let inView = false;
  const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView && !document.hidden ? startLoop() : stopLoop(); }, { threshold: 0 });
  io.observe(host);
  const onVis = () => (document.hidden || !inView ? stopLoop() : startLoop());
  document.addEventListener("visibilitychange", onVis);
  const ro = new ResizeObserver(resize); ro.observe(host); resize();

  let gone = false;
  function dispose() {
    if (gone) return; gone = true;
    running = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    removeEventListener("pointermove", move); removeEventListener("pointerup", upH);
    for (const p of cache.values()) p.then(disposeCar).catch(() => {});
    cache.clear();
    scene.traverse((o) => { if (o.isMesh || o.isLine) { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose(); } });
    envRT.dispose(); composer?.dispose(); gtao?.dispose(); renderer.dispose(); renderer.forceContextLoss?.();
  }

  await begin(curIdx);
  kick(800);
  const api = {
    dispose, go,
    next: () => go((pending ?? curIdx) + 1),
    prev: () => go((pending ?? curIdx) - 1),
    setAuto: (on) => { autoOn = on && !REDUCED; holdT = 0; if (autoOn) prefetch(); },
    setDriver: (i, number) => { teams[i].driver = number; if (i === curIdx && cur) { paintNumbers(cur, number); kick(); } },
    get index() { return pending ?? curIdx; },
    credits: manifest.credits || [],
    fixedNumber: (i) => manifest.cars[teams[i]?.team]?.fixed_number ?? null,   // livery baked into a source model
    source: (i) => manifest.cars[teams[i]?.team]?.source ?? null,                // which model the car is built from
    get variant() { return variant; },
    stats() {
      const info = renderer.info;
      const ft = frameTimes.slice().sort((a, b) => a - b);
      return { variant, calls: info.render.calls, triangles: info.render.triangles, geometries: info.memory.geometries, textures: info.memory.textures,
               frame_ms_median: ft[Math.floor(ft.length / 2)] || null, frame_ms_p95: ft[Math.floor(ft.length * 0.95)] || null, cached: [...cache.keys()] };
    },
  };
  if (debug) {
    api.debug = {
      scrub(t) { scrubT = t; kick(1000); },            // freeze the timeline at t seconds (null resumes)
      async transition(i, t) { scrubT = t ?? null; go(i); },
      get t() { return trans ? (scrubT ?? (performance.now() - trans.t0) / 1000) : null; },
      camera: (a, b, z = 1) => { az = a; tilt = b; zoomMul = z; vel = 0; kick(1500); },
      freeze: (on) => { running = !on; },
      node: (id) => cur?.nodes.get(id),
      bench(n = 60) {         // synchronous GPU-timed renders of the current view (forces completion with readPixels)
        const gl = renderer.getContext(), px = new Uint8Array(4), times = [];
        for (let i = 0; i < n; i++) { const t0 = performance.now(); draw(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); times.push(performance.now() - t0); }
        times.sort((a, b) => a - b);
        let texBytes = 0; const seen = new Set();
        scene.traverse((o) => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
          for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap"]) { const t = m[k]; if (!t || seen.has(t.uuid)) continue; seen.add(t.uuid);
            const im = t.image; if (im?.width) texBytes += im.width * im.height * 4 * 1.33; } }); });
        let tris = 0, meshes = 0; scene.traverse((o) => { if (o.isMesh && o.visible) { meshes++; tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; } });
        return { frames: n, ms_median: +times[n >> 1].toFixed(2), ms_p95: +times[Math.floor(n * 0.95)].toFixed(2), draw_calls: renderer.info.render.calls,
                 triangles_drawn: renderer.info.render.triangles, scene_triangles: Math.round(tris), meshes, textures: seen.size, texture_mb_est: +(texBytes / 1e6).toFixed(1),
                 pixels: [renderer.domElement.width, renderer.domElement.height], dpr: renderer.getPixelRatio() };
      },
      scene: () => scene,
      renderNow: () => { snap = true; cancelAnimationFrame(raf); raf = 0; frame(performance.now()); snap = false; return true; },
      info: () => ({ dist: camDist.v, want: restCloud ? fitDistance([restCloud], target) : null, target: target.toArray(), aspect: camera.aspect, fov: camera.fov,
                     pts: restCloud?.length / 3, bounds: restCloud ? (() => { const b = new THREE.Box3(); for (let i = 0; i < restCloud.length; i += 3) b.expandByPoint(new THREE.Vector3(restCloud[i], restCloud[i + 1], restCloud[i + 2])); return [b.min.toArray().map((v) => +v.toFixed(2)), b.max.toArray().map((v) => +v.toFixed(2))]; })() : null,
                     far: cur ? [...cur.bbox].map(([id, lb]) => [id, lb.min.toArray().map((v) => +v.toFixed(2)), lb.max.toArray().map((v) => +v.toFixed(2))]).filter((e) => Math.max(...e[1].map(Math.abs), ...e[2].map(Math.abs)) > 1.5) : null, zoomMul, size: [renderer.domElement.width, renderer.domElement.height] }),
    };
  }
  return api;
}
