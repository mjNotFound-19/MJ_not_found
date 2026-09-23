import{z as Fe,r as h,b as F,j as e,R as ke,g as _e,u as he,d as ne,m as j,i as M,k as O,h as le,n as ze,e as ce,A as Ie,o as $e,D as De,q as We,t as Oe,v as Ue,p as qe,w as Be,E as G,x as He,y as Ge}from"./pageTransition-DPG00EJA.js";const Ve={some:0,all:1};function Ye(t,a,{root:n,margin:r,amount:s="some"}={}){const o=Fe(t),l=new WeakMap,u=i=>{i.forEach(f=>{const d=l.get(f.target);if(f.isIntersecting!==!!d)if(f.isIntersecting){const x=a(f);typeof x=="function"?l.set(f.target,x):c.unobserve(f.target)}else typeof d=="function"&&(d(f),l.delete(f.target))})},c=new IntersectionObserver(u,{root:n,rootMargin:r,threshold:typeof s=="number"?s:Ve[s]});return o.forEach(i=>c.observe(i)),()=>c.disconnect()}function Ce(t,{root:a,margin:n,amount:r,once:s=!1}={}){const[o,l]=h.useState(!1);return h.useEffect(()=>{if(!t.current||s&&o)return;const u=()=>(l(!0),s?void 0:()=>l(!1)),c={root:a&&a.current||void 0,margin:n,amount:r};return Ye(t.current,u,c)},[a,t,n,s,r]),o}/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xe=F("ArrowDownRight",[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=F("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ze=F("Bike",[["circle",{cx:"18.5",cy:"17.5",r:"3.5",key:"15x4ox"}],["circle",{cx:"5.5",cy:"17.5",r:"3.5",key:"1noe27"}],["circle",{cx:"15",cy:"5",r:"1",key:"19l28e"}],["path",{d:"M12 17.5V14l-3-3 4-3 2 3h2",key:"1npguv"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Je=F("Footprints",[["path",{d:"M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",key:"1dudjm"}],["path",{d:"M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",key:"l2t8xc"}],["path",{d:"M16 17h4",key:"1dejxt"}],["path",{d:"M4 13h4",key:"1bwh8b"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qe=F("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const et=F("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tt=F("Shuffle",[["path",{d:"M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22",key:"1wmou1"}],["path",{d:"m18 2 4 4-4 4",key:"pucp1d"}],["path",{d:"M2 6h1.9c1.5 0 2.9.9 3.6 2.2",key:"10bdb2"}],["path",{d:"M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8",key:"vgxac0"}],["path",{d:"m18 14 4 4-4 4",key:"10pe0f"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const st=F("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const at=F("Waves",[["path",{d:"M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",key:"knzxuh"}],["path",{d:"M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",key:"2jd2cc"}],["path",{d:"M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",key:"rd2r6e"}]]),P=[{id:"summits",number:"01",title:"The Three Summits",kicker:"Mountaineering",line:"Stand on the three highest points on Earth.",accent:"#2f6df6",status:"on the list",log:[]},{id:"nordschleife",number:"02",title:"Green Hell, GT3",kicker:"Motorsport",line:"Race a GT3 car around the Nürburgring Nordschleife.",accent:"#ff6a00",status:"on the list",log:[]},{id:"ironman",number:"03",title:"Ironman",kicker:"Endurance",line:"Swim, bike and run 226 km in a single day.",accent:"#e6202e",status:"on the list",log:[]},{id:"album",number:"04",title:"The Album",kicker:"Music",line:"Write, play, produce, mix and master a whole album. Every sound, by me.",accent:"#7c3aed",status:"on the list",log:[]}],Ne=[{name:"Everest",height:8849,range:"Nepal / China"},{name:"K2",height:8611,range:"Pakistan / China"},{name:"Kangchenjunga",height:8586,range:"Nepal / India"}],ue=[{at:0,label:"Sea level",note:"100% of sea-level air pressure"},{at:5364,label:"Everest Base Camp",note:"Roughly half the air of sea level"},{at:8e3,label:"The death zone",note:"Above 8,000 m the body can't acclimatise"},{at:8849,label:"Summit",note:"About a third of sea-level air pressure"}],Re=[{id:"swim",label:"Swim",km:3.8},{id:"bike",label:"Bike",km:180.2},{id:"run",label:"Run",km:42.2}],re=17,me=["Written","Composed","Performed","Recorded","Produced","Mixed","Mastered","Artwork"];function nt(){const t=P.filter(a=>a.status==="done").length;return e.jsx("header",{className:"b-topbar",children:e.jsxs("div",{className:"b-shell flex items-center justify-between gap-4",children:[e.jsxs("a",{href:"/","data-transition":"portfolio",className:"b-pill","aria-label":"Back to manasjha.online",children:[e.jsx(Ke,{size:14,"aria-hidden":!0}),e.jsx(ke,{children:"manasjha.online"})]}),e.jsx("p",{className:"b-mono hidden sm:block",children:"bucket list / vol. 01"}),e.jsxs("p",{className:"b-mono",children:[e.jsx("span",{className:"font-semibold",children:String(t).padStart(2,"0")}),e.jsxs("span",{className:"text-[var(--ink-3)]",children:[" / ",String(P.length).padStart(2,"0")," done"]})]})]})})}const rt=[.76,0,.24,1],it=[{text:"8,849 m",pos:"right-[18%] top-[24%]",rotate:-8,depth:26,bg:"#2f6df6"},{text:"20.8 km of Green Hell",pos:"right-[4%] top-[35%]",rotate:6,depth:40,bg:"#ff6a00"},{text:"226 km in a day",pos:"right-[16%] top-[48%]",rotate:5,depth:34,bg:"#e6202e"},{text:"1 album, 1 person",pos:"right-[5%] top-[58%]",rotate:-6,depth:22,bg:"#7c3aed"}];function ot({sticker:t,mx:a,my:n,index:r,introDelay:s}){const o=M(a,c=>c*t.depth),l=M(n,c=>c*t.depth),u=M(a,c=>t.rotate+c*6);return e.jsx(j.span,{className:`absolute hidden md:inline-flex b-sticker ${t.pos}`,style:{x:o,y:l,rotate:u,background:t.bg},initial:{opacity:0,scale:.6},animate:{opacity:1,scale:1},transition:{delay:s+.9+r*.12,duration:.6,ease:[.34,1.56,.64,1]},"aria-hidden":"true",children:t.text})}function fe({children:t,delay:a,className:n=""}){return e.jsx("span",{className:"block overflow-hidden pb-[0.06em]",children:e.jsx(j.span,{className:`block ${n}`,initial:{y:"105%"},animate:{y:"0%"},transition:{duration:1.1,delay:a,ease:rt},children:t})})}function lt({introDelay:t=0}){const a=_e(),n=h.useRef(null),r=he(0),s=he(0),o=ne(r,{stiffness:80,damping:18}),l=ne(s,{stiffness:80,damping:18});return h.useEffect(()=>{if(a)return;const c=i=>{r.set(i.clientX/window.innerWidth-.5),s.set(i.clientY/window.innerHeight-.5)};return window.addEventListener("pointermove",c,{passive:!0}),()=>window.removeEventListener("pointermove",c)},[r,s,a]),e.jsxs("section",{ref:n,className:"relative min-h-[100svh] flex flex-col justify-center pt-28 pb-16 overflow-hidden",children:[it.map((c,i)=>e.jsx(ot,{sticker:c,mx:o,my:l,index:i,introDelay:t},c.text)),e.jsxs("div",{className:"b-shell relative",children:[e.jsx(j.p,{className:"b-mono text-[var(--ink-3)] mb-6",initial:{opacity:0},animate:{opacity:1},transition:{duration:.8,delay:t},children:"manas jha / things to do before i'm done"}),e.jsxs("h1",{className:"b-hero-title",children:[e.jsx(fe,{delay:t+.1,children:"Bucket"}),e.jsxs(fe,{delay:t+.22,children:["List",e.jsx("span",{className:"b-hero-italic text-[0.42em] align-top ml-[0.15em] tracking-normal",children:"(04)"})]})]}),e.jsxs("div",{className:"mt-10 grid gap-8 md:grid-cols-[1fr_1fr] md:items-end",children:[e.jsx("p",{className:"text-[clamp(1.25rem,2.4vw,1.9rem)] leading-[1.25] tracking-[-0.02em] max-w-[34ch]",children:"Not a résumé. Four things I want to have done, each of which scares me a little. This page tracks them until they're crossed off.".split(" ").map((c,i)=>e.jsx(j.span,{className:"inline-block mr-[0.28em]",initial:{opacity:0,y:12,filter:"blur(6px)"},animate:{opacity:1,y:0,filter:"blur(0px)"},transition:{delay:t+.6+i*.03,duration:.5},children:c},i))}),e.jsxs(j.a,{href:"#overview",className:"justify-self-start md:justify-self-end b-pill",initial:{opacity:0},animate:{opacity:1},transition:{delay:t+1.4},children:["scroll to see the list",e.jsx("span",{"aria-hidden":!0,children:"↓"})]})]})]})]})}function ct(){return e.jsxs("svg",{viewBox:"0 0 400 300",className:"absolute inset-0 w-full h-full","aria-hidden":"true",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"sky-a",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0",stopColor:"#c9d6f3"}),e.jsx("stop",{offset:"1",stopColor:"#eef1f7"})]})}),e.jsx("rect",{width:"400",height:"300",fill:"url(#sky-a)"}),e.jsx("circle",{cx:"310",cy:"80",r:"26",fill:"#fff7d6",children:e.jsx("animate",{attributeName:"cy",values:"86;74;86",dur:"6s",repeatCount:"indefinite"})}),e.jsx("path",{d:"M-10 300 L90 150 L150 210 L230 90 L300 180 L350 140 L420 300 Z",fill:"#9fb3dd"}),e.jsx("path",{d:"M-10 300 L60 200 L130 250 L200 130 L260 200 L330 170 L420 300 Z",fill:"#2f6df6"}),e.jsx("path",{d:"M200 130 L222 162 L210 158 L200 170 L190 157 L178 160 Z",fill:"#fff"}),e.jsx("line",{x1:"200",y1:"130",x2:"200",y2:"100",stroke:"#111",strokeWidth:"2"}),e.jsx("path",{d:"M200 100 L224 106 L200 114 Z",fill:"#111",children:e.jsx("animate",{attributeName:"d",values:"M200 100 L224 106 L200 114 Z;M200 100 L222 110 L200 114 Z;M200 100 L224 106 L200 114 Z",dur:"1.4s",repeatCount:"indefinite"})})]})}function dt(){const t="M60 210 C40 150 90 120 130 140 S190 90 230 70 S330 60 340 120 S300 190 260 200 S200 250 150 240 S80 260 60 210 Z";return e.jsxs("svg",{viewBox:"0 0 400 300",className:"absolute inset-0 w-full h-full","aria-hidden":"true",children:[e.jsx("rect",{width:"400",height:"300",fill:"#151515"}),e.jsx("path",{d:t,fill:"none",stroke:"#2a2a2a",strokeWidth:"18",strokeLinejoin:"round"}),e.jsx("path",{d:t,fill:"none",stroke:"#ff6a00",strokeWidth:"2",strokeDasharray:"6 8",children:e.jsx("animate",{attributeName:"stroke-dashoffset",values:"0;-140",dur:"3s",repeatCount:"indefinite"})}),e.jsx("circle",{r:"7",fill:"#ebe9e4",children:e.jsx("animateMotion",{dur:"5s",repeatCount:"indefinite",rotate:"auto",path:t})}),e.jsx("text",{x:"376",y:"280",textAnchor:"end",fill:"#ebe9e4",fontFamily:"Fragment Mono, monospace",fontSize:"12",children:"20.832 km"})]})}function ht(){return e.jsxs("svg",{viewBox:"0 0 400 300",className:"absolute inset-0 w-full h-full","aria-hidden":"true",children:[e.jsx("rect",{width:"400",height:"300",fill:"#f3e3df"}),[0,1,2].map(t=>e.jsx("path",{d:"M-40 0 Q-20 -10 0 0 T40 0 T80 0 T120 0 T160 0 T200 0 T240 0 T280 0 T320 0 T360 0 T400 0 T440 0",transform:`translate(0 ${70+t*16})`,fill:"none",stroke:"#e6202e",strokeOpacity:.35+t*.25,strokeWidth:"3",children:e.jsx("animateTransform",{attributeName:"transform",type:"translate",values:`0 ${70+t*16};-40 ${70+t*16}`,dur:`${1.6+t*.3}s`,repeatCount:"indefinite"})},t)),e.jsxs("g",{transform:"translate(200 190)",children:[[-50,50].map(t=>e.jsxs("g",{transform:`translate(${t} 0)`,children:[e.jsx("circle",{r:"30",fill:"none",stroke:"#111",strokeWidth:"3"}),e.jsxs("g",{children:[e.jsx("line",{x1:"-30",y1:"0",x2:"30",y2:"0",stroke:"#111",strokeWidth:"1.5"}),e.jsx("line",{x1:"0",y1:"-30",x2:"0",y2:"30",stroke:"#111",strokeWidth:"1.5"}),e.jsx("animateTransform",{attributeName:"transform",type:"rotate",values:"0;360",dur:"1.2s",repeatCount:"indefinite"})]})]},t)),e.jsx("path",{d:"M-50 0 L-10 -40 L30 -40 L50 0 M-10 -40 L0 0 L-50 0",fill:"none",stroke:"#e6202e",strokeWidth:"4",strokeLinejoin:"round"})]}),e.jsx("text",{x:"376",y:"280",textAnchor:"end",fill:"#111",fontFamily:"Fragment Mono, monospace",fontSize:"12",children:"swim / bike / run"})]})}function ut(){return e.jsxs("svg",{viewBox:"0 0 400 300",className:"absolute inset-0 w-full h-full","aria-hidden":"true",children:[e.jsx("rect",{width:"400",height:"300",fill:"#111"}),e.jsx("g",{transform:"translate(150 150)",children:e.jsxs("g",{className:"b-record-spin",children:[e.jsx("circle",{r:"110",fill:"#1d1d1d"}),[95,80,65,50].map(t=>e.jsx("circle",{r:t,fill:"none",stroke:"#2c2c2c",strokeWidth:"1"},t)),e.jsx("circle",{r:"34",fill:"#7c3aed"}),e.jsx("rect",{x:"-2",y:"-34",width:"4",height:"14",fill:"#ebe9e4"}),e.jsx("circle",{r:"4",fill:"#111"})]})}),[0,1,2,3,4].map(t=>e.jsxs("rect",{x:300+t*16,y:"120",width:"10",height:"60",rx:"3",fill:"#7c3aed",opacity:.5+t*.1,children:[e.jsx("animate",{attributeName:"height",values:`${20+t*8};${70-t*6};${30+t*5};${20+t*8}`,dur:`${.9+t*.15}s`,repeatCount:"indefinite"}),e.jsx("animate",{attributeName:"y",values:`${190-(20+t*8)};${190-(70-t*6)};${190-(30+t*5)};${190-(20+t*8)}`,dur:`${.9+t*.15}s`,repeatCount:"indefinite"})]},t))]})}const mt={summits:ct,nordschleife:dt,ironman:ht,album:ut},ft=[.76,0,.24,1];function xt(){return e.jsx("section",{id:"overview",className:"relative py-20 md:py-28",children:e.jsxs("div",{className:"b-shell",children:[e.jsxs("div",{className:"flex items-end justify-between gap-6 b-rule pt-5 mb-10",children:[e.jsx("h2",{className:"b-mono",children:"the list"}),e.jsx("p",{className:"b-mono text-[var(--ink-3)]",children:"tap a card to jump in"})]}),e.jsx("div",{className:"grid gap-5 md:grid-cols-2",children:P.map((t,a)=>{const n=mt[t.id];return e.jsxs(j.a,{href:`#${t.id}`,className:"b-card group",initial:{opacity:0,y:50},whileInView:{opacity:1,y:0},viewport:{once:!0,amount:.25},transition:{duration:.9,delay:a%2*.1,ease:ft},children:[e.jsxs("div",{className:"b-card-art",children:[e.jsx("div",{className:"absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.04]",children:e.jsx(n,{})}),e.jsx("span",{className:"absolute top-4 left-4 b-sticker",style:{background:t.accent},children:t.number})]}),e.jsxs("div",{className:"p-5 md:p-6 flex items-start justify-between gap-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"b-mono text-[var(--ink-3)]",children:t.kicker}),e.jsx("h3",{className:"mt-1 text-[clamp(1.6rem,3vw,2.3rem)] font-bold tracking-[-0.04em] leading-none",children:t.title}),e.jsx("p",{className:"mt-3 text-[var(--ink-2)] max-w-[40ch] leading-snug",children:t.line})]}),e.jsx("span",{className:"shrink-0 w-11 h-11 rounded-full border border-[var(--ink)] grid place-items-center transition-colors duration-300 group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)]","aria-hidden":!0,children:e.jsx(Xe,{size:18})})]})]},t.id)})})]})})}const pt=[.76,0,.24,1];function Q({dream:t,tone:a="light"}){const n=a==="dark"?"text-[rgba(235,233,228,0.6)]":"text-[var(--ink-3)]",r=a==="dark"?"border-[rgba(235,233,228,0.18)]":"border-[var(--rule)]";return e.jsxs("div",{className:"b-shell",children:[e.jsxs("div",{className:`flex items-center justify-between gap-4 border-t ${r} pt-5`,children:[e.jsxs("p",{className:"b-mono",children:[e.jsx("span",{style:{color:t.accent},children:t.number}),e.jsxs("span",{className:n,children:[" / ",t.kicker]})]}),e.jsx("span",{className:"b-status",style:{color:t.accent},children:t.status})]}),e.jsx("h2",{className:"b-chapter-title mt-8",children:t.title.split(" ").map((s,o)=>e.jsx("span",{className:"inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.18em]",children:e.jsx(j.span,{className:"inline-block",initial:{y:"105%"},whileInView:{y:"0%"},viewport:{once:!0,amount:.6},transition:{duration:1,delay:o*.08,ease:pt},children:s})},o))}),e.jsxs("p",{className:"mt-6 text-[clamp(1.2rem,2.2vw,1.7rem)] leading-snug tracking-[-0.02em] max-w-[36ch]",children:[e.jsx("span",{className:"b-serif italic text-[1.15em]",children:"The goal: "}),t.line]}),t.log.length>0&&e.jsx("ul",{className:`mt-8 max-w-xl divide-y ${r} border-y ${r}`,children:t.log.map(s=>e.jsxs("li",{className:"py-3 flex gap-6",children:[e.jsx("span",{className:`b-mono shrink-0 ${n}`,children:s.date}),e.jsx("span",{children:s.text})]},s.date+s.text))})]})}const bt=`
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,gt=`
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
`,ee=t=>t-Math.floor(t);function V(t,a){let n=ee(t*123.34),r=ee(a*456.21);const s=n*(n+45.32)+r*(r+45.32);return n+=s,r+=s,ee(n*r)}function Te(t,a){const n=Math.floor(t),r=Math.floor(a),s=t-n,o=a-r,l=s*s*s*(s*(s*6-15)+10),u=o*o*o*(o*(o*6-15)+10),c=30*s*s*(s*(s-2)+1),i=30*o*o*(o*(o-2)+1),f=V(n,r),d=V(n+1,r),x=V(n,r+1),w=V(n+1,r+1),C=d-f,N=x-f,T=f-d-x+w;return[f+C*l+N*u+T*l*u,c*(C+T*u),i*(N+T*l)]}const xe=(t,a)=>1-Math.abs(Te(t,a)[0]*2-1);function vt(t,a){const n=t-0,r=a-2600,s=Math.atan2(r,n),o=.5+.5*Math.cos(3*s+.6*Math.sin(2*s+1.3)),l=Math.hypot(n,r)/(1500*(.82+.28*o)),u=Math.pow(Math.max(0,1-l),2),c=xe(t*.012,a*.012)*.6+xe(t*.027,a*.027)*.4;return 950*u+480*u*(1-u)*(c-.5)}function Me(t,a,n=7){let r=t*.003,s=a*.003,o=0,l=1,u=0,c=0;for(let i=0;i<n;i++){const[f,d,x]=Te(r,s);u+=d,c+=x,o+=l*f/(1+u*u+c*c),l*=.5;const w=(.8*r+.6*s)*2,C=(-.6*r+.8*s)*2;r=w,s=C}return 320*o+vt(t,a)}const yt=`
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
`,X={x:0,z:2600},te=Me(X.x,X.z),Y=(t,a,n)=>t+(a-t)*n,jt=t=>t*t*(3-2*t),wt=150,kt=26e5;function Ct(t){const a=jt(t),n=Y(-520,-160,a),r=Y(-1100,1350,a),s=Y(640,te+230,a),o=Math.max(s,Me(n,r)+70),l=[X.x,Y(te*.55,te-60,a),X.z];return{cam:[n,o,r],target:l}}function pe(t,a,n){const r=t.createShader(a);if(t.shaderSource(r,n),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS)){const s=t.getShaderInfoLog(r);throw t.deleteShader(r),new Error(s||"shader compile failed")}return r}function be(t,a){const n=t.createProgram();if(t.attachShader(n,pe(t,t.VERTEX_SHADER,bt)),t.attachShader(n,pe(t,t.FRAGMENT_SHADER,a)),t.linkProgram(n),!t.getProgramParameter(n,t.LINK_STATUS))throw new Error(t.getProgramInfoLog(n));return n}function ge(t,{preserveDrawingBuffer:a=!1,fast:n=!1,upscale:r=!1}={}){const s=t.getContext("webgl",{antialias:!1,powerPreference:"high-performance",preserveDrawingBuffer:a});if(!s)throw new Error("WebGL unavailable");const o=be(s,gt),l=r?be(s,yt):null,u=s.createBuffer();s.bindBuffer(s.ARRAY_BUFFER,u),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),s.STATIC_DRAW);const c=m=>{s.useProgram(m);const p=s.getAttribLocation(m,"aPos");s.enableVertexAttribArray(p),s.vertexAttribPointer(p,2,s.FLOAT,!1,0,0)},i={res:s.getUniformLocation(o,"uRes"),cam:s.getUniformLocation(o,"uCam"),target:s.getUniformLocation(o,"uTarget"),alt:s.getUniformLocation(o,"uAlt"),fast:s.getUniformLocation(o,"uFast")},f=l&&{tex:s.getUniformLocation(l,"uTex"),src:s.getUniformLocation(l,"uSrcRes"),dst:s.getUniformLocation(l,"uDstRes"),sharpen:s.getUniformLocation(l,"uSharpen")};let d=null,x=null,w=0,C=0;const N=(m,p)=>{d&&w===m&&C===p||(d||(d=s.createFramebuffer(),x=s.createTexture()),s.bindTexture(s.TEXTURE_2D,x),s.texImage2D(s.TEXTURE_2D,0,s.RGBA,m,p,0,s.RGBA,s.UNSIGNED_BYTE,null),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE),s.bindFramebuffer(s.FRAMEBUFFER,d),s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,x,0),w=m,C=p)},T=(m,p,g)=>{const{cam:b,target:S}=Ct(g);c(o),s.viewport(0,0,m,p),s.uniform2f(i.res,m,p),s.uniform3f(i.cam,b[0],b[1],b[2]),s.uniform3f(i.target,S[0],S[1],S[2]),s.uniform1f(i.alt,g),s.uniform1f(i.fast,n?1:0)};return{drawDirect(m,p,g){s.bindFramebuffer(s.FRAMEBUFFER,null),T(t.width,t.height,m),g===void 0?s.disable(s.SCISSOR_TEST):(s.enable(s.SCISSOR_TEST),s.scissor(0,p,t.width,g)),s.drawArrays(s.TRIANGLES,0,3)},drawUpscaled(m,p,g){s.disable(s.SCISSOR_TEST),N(p,g),s.bindFramebuffer(s.FRAMEBUFFER,d),T(p,g,m),s.drawArrays(s.TRIANGLES,0,3),s.bindFramebuffer(s.FRAMEBUFFER,null),c(l),s.viewport(0,0,t.width,t.height),s.activeTexture(s.TEXTURE0),s.bindTexture(s.TEXTURE_2D,x),s.uniform1i(f.tex,0),s.uniform2f(f.src,p,g),s.uniform2f(f.dst,t.width,t.height);const b=t.width/p;s.uniform1f(f.sharpen,Math.min(.6,Math.max(0,(b-1)*.5))),s.drawArrays(s.TRIANGLES,0,3)},dispose(){s.deleteBuffer(u),s.deleteProgram(o),l&&s.deleteProgram(l),d&&s.deleteFramebuffer(d),x&&s.deleteTexture(x)}}}function Nt({climb:t,onUnsupported:a}){const n=h.useRef(null),r=h.useRef(null),s=h.useRef(null);return h.useEffect(()=>{const o=n.current,l=r.current;let u,c;try{u=ge(o,{fast:!0,upscale:!0}),c=ge(l,{preserveDrawingBuffer:!0})}catch(m){console.warn("[TerrainCanvas] falling back to illustration:",m),a==null||a();return}const i={scale:window.innerWidth<768?.6:.75,sceneW:1,sceneH:1,lowRaf:0,hqRaf:0,settle:0,last:0,avg:16,lost:!1,hqJob:null},f=()=>{window.clearTimeout(i.settle),cancelAnimationFrame(i.hqRaf),i.hqJob=null,l.style.transition="none",l.style.opacity="0"},d=()=>{if(i.lowRaf=0,i.lost)return;const m=performance.now();i.last&&m-i.last<100&&(i.avg=i.avg*.8+(m-i.last)*.2,i.avg>22&&i.scale>.4?i.scale=Math.max(.4,i.scale*.92):i.avg<15&&i.scale<1&&(i.scale=Math.min(1,i.scale*1.04))),i.last=m;const p=Math.min(window.devicePixelRatio||1,1.25),g=Math.max(1,Math.round(o.clientWidth*p)),b=Math.max(1,Math.round(o.clientHeight*p));(o.width!==g||o.height!==b)&&(o.width=g,o.height=b),i.sceneW=Math.max(1,Math.round(g*i.scale)),i.sceneH=Math.max(1,Math.round(b*i.scale)),u.drawUpscaled(Math.min(1,Math.max(0,t.get())),i.sceneW,i.sceneH),i.settle=window.setTimeout(x,wt)},x=()=>{if(i.lost)return;const m=Math.min(window.devicePixelRatio||1,1.5);let p=Math.round(l.clientWidth*m),g=Math.round(l.clientHeight*m);const b=Math.min(1,Math.sqrt(kt/Math.max(1,p*g)));p=Math.max(1,Math.round(p*b)),g=Math.max(1,Math.round(g*b)),l.width=p,l.height=g;const S=Math.max(1,i.sceneW*i.sceneH/2),z=Math.max(1,Math.ceil(p*g/S)),I=Math.min(1,Math.max(0,t.get()));i.hqJob={y:0,stripH:Math.ceil(g/z),h:g,c:I},i.hqRaf=requestAnimationFrame(w)},w=()=>{const m=i.hqJob;!m||i.lost||(c.drawDirect(m.c,m.y,m.stripH),m.y+=m.stripH,m.y<m.h?i.hqRaf=requestAnimationFrame(w):(i.hqJob=null,l.style.transition="opacity 0.35s ease",l.style.opacity="1"))},C=()=>{f(),i.lowRaf||(i.lowRaf=requestAnimationFrame(d))},N=m=>{m.preventDefault(),i.lost=!0,f(),a==null||a()};o.addEventListener("webglcontextlost",N),l.addEventListener("webglcontextlost",N);const T=new ResizeObserver(C);return T.observe(o),s.current={request:C},C(),()=>{cancelAnimationFrame(i.lowRaf),f(),T.disconnect(),o.removeEventListener("webglcontextlost",N),l.removeEventListener("webglcontextlost",N),s.current=null,u.dispose(),c.dispose()}},[t,a]),O(t,"change",()=>{var o;return(o=s.current)==null?void 0:o.request()}),e.jsxs(e.Fragment,{children:[e.jsx("canvas",{ref:n,className:"absolute inset-0 w-full h-full","aria-hidden":"true"}),e.jsx("canvas",{ref:r,className:"absolute inset-0 w-full h-full",style:{opacity:0},"aria-hidden":"true"})]})}const de=P.find(t=>t.id==="summits"),$=Ne[0].height,K=1600,ie=900;function Rt(t,a,n,r=null){let s=t;const o=()=>(s=(s*9301+49297)%233280,s/233280),l=o()*6,u=o()*6,c=o()*6;let i=`M0 ${ie}`;for(let f=0;f<=K;f+=32){let d=a-n*(.55*Math.sin(f*.0035+l)+.3*Math.sin(f*.009+u)+.15*Math.sin(f*.021+c));if(r){const x=Math.abs(f-r.x)/r.width;x<1&&(d-=r.height*(1-x)**1.4)}d+=(o()-.5)*n*.12,i+=` L${f} ${d.toFixed(1)}`}return`${i} L${K} ${ie} Z`}const Tt=[{seed:11,base:520,amp:90,fill:"#b9c6e3",speed:.15},{seed:23,base:610,amp:110,fill:"#8fa5d6",speed:.35},{seed:37,base:700,amp:120,fill:"#5f7fc8",speed:.6,peak:{x:1080,width:420,height:260}},{seed:53,base:820,amp:90,fill:"#2f6df6",speed:1}];function Mt({layer:t,progress:a}){const n=h.useMemo(()=>Rt(t.seed,t.base,t.amp,t.peak),[t]),r=M(a,[0,1],[0,520*t.speed]);return e.jsx(j.path,{d:n,fill:t.fill,style:{y:r}})}function St({opacity:t}){const a=h.useMemo(()=>{let n=7;const r=()=>(n=(n*9301+49297)%233280,n/233280);return Array.from({length:60},()=>({x:r()*K,y:r()*420,r:.6+r()*1.6}))},[]);return e.jsx(j.g,{style:{opacity:t},children:a.map((n,r)=>e.jsx("circle",{cx:n.x,cy:n.y,r:n.r,fill:"#fff"},r))})}const ve=t=>Math.exp(-t/8400);function At(){const t=h.useRef(null),a=h.useRef(null),n=h.useRef(null),[r,s]=h.useState(0),[o,l]=h.useState(!1),[u,c]=h.useState(!0),i=h.useCallback(()=>c(!1),[]),f=Ce(t,{once:!0,margin:"100% 0px 100% 0px"}),{scrollYProgress:d}=le({target:t,offset:["start start","end end"]}),x=M(d,[.04,.88],[0,$],{clamp:!0}),w=M(x,[0,$],[0,1]),C=M(x,[0,5364,6500,8e3,$],["#ebe9e4","#cdd8ef","#6a7fbd","#26366b","#0d1633"]),N=M(x,[7e3,$],[0,1]),T=M(x,b=>`${(ve(b)*100).toFixed(1)}%`),m=M(x,[$-120,$],[0,1]);O(x,"change",b=>{a.current&&(a.current.textContent=Math.round(b).toLocaleString("en-US")),n.current&&(n.current.textContent=`${Math.round(ve(b)*100)}%`);let S=0;ue.forEach((z,I)=>{b>=z.at&&(S=I)}),s(S),l(b>=7e3)});const p=u||o,g=`rounded-2xl p-4 md:p-5 transition-colors duration-500 ${p?"bg-[rgba(8,12,24,0.62)]":"bg-[rgba(235,233,228,0.82)]"}`;return e.jsx("div",{ref:t,className:"relative h-[320vh] md:h-[420vh]",children:e.jsxs(j.div,{className:"sticky top-0 h-[100svh] overflow-hidden",style:{backgroundColor:C,color:p?"#ebe9e4":"#111111",transition:"color 0.4s ease"},children:[u?e.jsxs(e.Fragment,{children:[f&&e.jsx(Nt,{climb:w,onUnsupported:i}),e.jsx("div",{className:"absolute inset-0 pointer-events-none",style:{background:"linear-gradient(90deg, rgba(4,8,18,0.66), rgba(4,8,18,0.42) 55%, rgba(4,8,18,0.14))"},"aria-hidden":"true"})]}):e.jsxs("svg",{viewBox:`0 0 ${K} ${ie}`,preserveAspectRatio:"xMidYMax slice",className:"absolute inset-0 w-full h-full","aria-hidden":"true",children:[e.jsx(St,{opacity:N}),Tt.map(b=>e.jsx(Mt,{layer:b,progress:w},b.seed))]}),e.jsx("div",{className:"relative h-full b-shell flex flex-col justify-center pt-16",children:e.jsxs("div",{className:"grid gap-10 md:grid-cols-[1fr_320px] md:items-center",children:[e.jsxs("div",{children:[e.jsx("p",{className:"b-mono opacity-70",children:"altitude / everest, south route"}),e.jsxs("p",{className:"b-giant-number mt-2","aria-live":"off",style:u?{textShadow:"0 2px 30px rgba(0,0,0,0.45)"}:void 0,children:[e.jsx("span",{ref:a,children:"0"}),e.jsx("span",{className:"b-serif italic text-[0.35em] ml-2 tracking-normal",children:"m"})]}),e.jsxs("div",{className:`mt-6 max-w-sm ${g}`,children:[e.jsxs("div",{className:"flex justify-between b-mono opacity-80",children:[e.jsx("span",{children:"air pressure vs. sea level"}),e.jsx("span",{ref:n,children:"100%"})]}),e.jsx("div",{className:"mt-2 h-2 rounded-full overflow-hidden",style:{backgroundColor:"rgba(127,127,127,0.25)"},children:e.jsx(j.div,{className:"h-full rounded-full bg-current",style:{width:T}})})]})]}),e.jsx("ol",{className:`space-y-3 ${g}`,children:ue.map((b,S)=>{const z=S<=r,I=S===r;return e.jsxs("li",{className:"flex gap-4 transition-opacity duration-500",style:{opacity:z?1:.55},children:[e.jsx("span",{className:"b-mono w-16 shrink-0 text-right tabular-nums",children:b.at.toLocaleString("en-US")}),e.jsxs("span",{children:[e.jsx("span",{className:`block font-semibold ${I?"underline underline-offset-4":""}`,children:b.label}),e.jsx("span",{className:"block text-sm opacity-75",children:b.note})]})]},b.label)})})]})}),e.jsx("div",{className:"absolute left-1/2 top-[14%] -translate-x-1/2","aria-hidden":"true",children:e.jsx(j.div,{className:"origin-bottom",style:{scale:m},children:e.jsx("span",{className:"b-sticker",style:{background:de.accent,color:"#fff"},children:"summit / top of the world"})})})]})})}function Et(){return e.jsxs("div",{className:"b-shell mt-20 md:mt-28",children:[e.jsx("p",{className:"b-mono text-[var(--ink-3)] mb-6",children:"the three, to scale"}),e.jsx("div",{className:"grid grid-cols-3 gap-3 md:gap-6 items-end",children:Ne.map((t,a)=>{const n=t.height/$*100;return e.jsxs(j.div,{initial:{opacity:0,y:40},whileInView:{opacity:1,y:0},viewport:{once:!0,amount:.4},transition:{duration:.9,delay:a*.1,ease:[.76,0,.24,1]},children:[e.jsx("div",{className:"relative h-[180px] md:h-[280px]",children:e.jsxs("svg",{viewBox:"0 0 100 100",preserveAspectRatio:"none",className:"absolute inset-0 w-full h-full","aria-hidden":"true",children:[e.jsx("path",{d:`M0 100 L50 ${100-n} L100 100 Z`,fill:a===0?de.accent:"#8fa5d6"}),e.jsx("path",{d:`M50 ${100-n} L60 ${100-n+14} L50 ${100-n+10} L40 ${100-n+14} Z`,fill:"#fff"})]})}),e.jsxs("div",{className:"border-t border-[var(--ink)] pt-3 mt-2",children:[e.jsxs("p",{className:"b-mono text-[var(--ink-3)]",children:["0",a+1]}),e.jsx("p",{className:"text-lg md:text-2xl font-bold tracking-[-0.03em] leading-tight",children:t.name}),e.jsxs("p",{className:"b-stat mt-1 text-[clamp(1.2rem,3vw,2.2rem)]",children:[t.height.toLocaleString("en-US"),e.jsx("span",{className:"b-serif italic text-[0.6em] ml-1 font-normal",children:"m"})]}),e.jsx("p",{className:"b-mono text-[var(--ink-3)] mt-1",children:t.range})]})]},t.name)})})]})}function Lt(){return e.jsxs("section",{id:"summits",className:"relative pt-24 md:pt-32 pb-24 md:pb-32",children:[e.jsx(Q,{dream:de}),e.jsx("div",{className:"mt-16",children:e.jsx(At,{})}),e.jsx(Et,{})]})}const se="M215.5 416.9 C213.3 416.8 211.0 416.6 208.8 416.7 C206.7 416.7 204.6 417.0 202.4 417.2 C200.2 417.4 198.0 417.6 195.7 418.0 C193.3 418.4 190.7 419.2 188.3 419.6 C185.8 420.1 183.4 420.7 180.8 421.0 C178.3 421.2 175.4 421.3 173.0 421.1 C170.5 420.9 168.2 420.2 165.9 419.5 C163.7 418.7 161.5 417.5 159.3 416.5 C157.0 415.5 154.9 414.4 152.7 413.4 C150.5 412.3 148.2 411.4 146.1 410.1 C144.1 408.7 142.2 406.9 140.3 405.2 C138.3 403.6 136.5 401.8 134.5 400.1 C132.6 398.5 130.5 396.9 128.5 395.3 C126.5 393.7 124.4 392.3 122.4 390.7 C120.4 389.0 118.5 387.2 116.6 385.4 C114.7 383.6 113.0 381.6 111.1 379.8 C109.2 377.9 107.1 376.2 105.3 374.3 C103.4 372.4 101.6 370.5 100.0 368.4 C98.5 366.4 97.1 364.2 96.0 361.9 C94.9 359.7 94.2 357.4 93.6 355.1 C93.0 352.7 92.6 350.3 92.4 347.9 C92.2 345.4 92.1 342.9 92.2 340.3 C92.3 337.7 92.6 335.1 92.8 332.5 C93.1 329.8 93.6 327.2 93.7 324.6 C93.9 322.0 93.9 319.4 93.8 316.7 C93.7 314.1 93.3 311.5 92.9 308.9 C92.4 306.3 91.9 303.8 91.2 301.2 C90.6 298.7 89.8 296.1 89.0 293.7 C88.1 291.2 87.1 288.7 86.0 286.3 C84.9 283.9 83.7 281.5 82.4 279.2 C81.0 276.9 79.7 274.7 78.1 272.6 C76.6 270.6 74.7 268.8 73.1 266.8 C71.5 264.9 69.7 262.9 68.6 261.1 C67.4 259.4 66.5 257.7 65.9 256.1 C65.4 254.5 65.2 253.1 65.4 251.7 C65.6 250.3 66.2 249.0 67.2 247.5 C68.2 246.1 69.6 244.6 71.4 243.1 C73.1 241.6 75.6 240.1 77.7 238.6 C79.9 237.2 82.2 235.8 84.4 234.3 C86.5 232.7 88.7 231.1 90.7 229.4 C92.7 227.7 94.6 225.9 96.5 224.0 C98.3 222.1 100.1 220.1 101.6 218.1 C103.2 216.0 104.6 213.8 105.9 211.6 C107.1 209.3 108.1 207.0 109.2 204.7 C110.3 202.3 111.4 200.0 112.2 197.6 C113.1 195.1 113.6 192.6 114.3 190.1 C115.1 187.7 115.9 185.3 116.8 183.0 C117.8 180.7 118.8 178.4 120.0 176.2 C121.2 174.1 122.7 172.0 124.2 169.9 C125.6 167.9 126.9 165.8 128.6 163.7 C130.2 161.7 132.1 159.8 133.8 157.9 C135.6 155.9 137.7 154.1 139.3 152.1 C141.0 150.0 142.6 147.8 143.8 145.7 C145.0 143.5 146.1 141.1 146.7 139.0 C147.3 136.8 147.6 134.7 147.4 132.7 C147.2 130.7 146.5 128.9 145.7 127.0 C144.8 125.1 143.4 123.1 142.3 121.3 C141.2 119.4 140.0 117.6 139.3 115.9 C138.5 114.2 137.9 112.7 137.7 111.1 C137.5 109.5 137.5 108.1 137.8 106.3 C138.2 104.5 138.7 102.4 139.8 100.5 C140.8 98.5 142.4 96.3 144.1 94.6 C145.7 92.8 147.8 91.3 149.6 90.0 C151.5 88.7 153.4 87.6 155.3 86.9 C157.2 86.1 159.0 85.7 161.0 85.6 C163.0 85.5 165.2 85.9 167.4 86.2 C169.6 86.4 172.0 86.9 174.4 87.3 C176.8 87.7 179.1 88.2 181.5 88.7 C183.9 89.1 186.3 89.6 188.8 89.9 C191.2 90.1 193.7 90.4 196.2 90.2 C198.7 90.0 201.3 89.3 203.6 88.7 C205.8 88.0 207.7 87.0 209.7 86.1 C211.7 85.2 213.7 84.2 215.6 83.1 C217.6 82.0 219.5 80.8 221.4 79.5 C223.3 78.2 225.3 76.7 227.2 75.4 C229.1 74.0 230.9 72.6 233.0 71.4 C235.2 70.3 237.5 69.3 239.9 68.3 C242.3 67.4 245.0 66.5 247.4 65.6 C249.9 64.7 252.4 63.6 254.8 62.9 C257.3 62.1 259.9 61.4 262.1 61.0 C264.3 60.7 266.3 60.6 268.1 60.9 C269.8 61.1 271.2 61.6 272.5 62.5 C273.7 63.4 274.7 64.7 275.7 66.3 C276.6 67.9 277.3 70.1 278.0 72.3 C278.7 74.6 279.2 77.4 279.8 79.8 C280.5 82.3 281.0 84.8 281.9 87.1 C282.8 89.4 284.1 91.6 285.5 93.6 C286.9 95.6 288.5 97.5 290.4 99.2 C292.2 100.9 294.3 102.4 296.5 103.6 C298.7 104.8 301.2 105.8 303.6 106.6 C306.0 107.4 308.6 108.0 311.1 108.6 C313.7 109.1 316.3 109.6 318.9 110.0 C321.6 110.4 324.2 110.7 326.8 111.1 C329.5 111.5 332.1 111.8 334.7 112.3 C337.3 112.8 339.8 113.4 342.3 114.2 C344.8 115.0 347.2 116.0 349.7 117.1 C352.1 118.1 354.5 119.3 356.9 120.4 C359.3 121.4 361.7 122.5 364.1 123.4 C366.5 124.2 368.9 125.0 371.2 125.5 C373.6 125.9 375.9 126.1 378.3 126.0 C380.6 125.8 382.9 125.3 385.2 124.6 C387.5 123.9 389.9 122.8 392.2 121.8 C394.6 120.8 396.9 119.6 399.3 118.5 C401.7 117.4 404.2 116.1 406.5 115.3 C408.8 114.5 411.2 114.0 413.1 113.9 C415.0 113.8 416.7 114.2 417.9 114.9 C419.2 115.5 420.1 116.5 420.5 117.7 C421.0 118.8 420.9 120.6 420.5 121.8 C420.2 123.1 419.2 124.2 418.5 125.2 C417.8 126.3 416.9 127.4 416.6 128.1 C416.2 128.7 416.1 128.9 416.3 129.0 C416.6 129.1 417.1 128.9 418.2 128.5 C419.3 128.1 420.8 127.5 422.7 126.8 C424.6 126.0 427.3 125.0 429.7 124.1 C432.0 123.2 434.6 122.5 436.8 121.4 C439.1 120.3 441.3 119.0 443.2 117.5 C445.0 116.1 446.6 114.5 448.1 112.8 C449.7 111.0 451.0 108.8 452.4 106.9 C453.8 104.9 455.2 102.8 456.7 101.1 C458.2 99.4 459.7 97.9 461.3 96.6 C463.0 95.4 464.6 94.4 466.4 93.8 C468.3 93.3 470.4 93.1 472.5 93.3 C474.7 93.5 477.2 94.2 479.6 95.0 C482.0 95.8 484.5 96.9 486.7 98.1 C489.0 99.4 491.2 100.9 493.2 102.5 C495.1 104.0 497.0 105.8 498.4 107.7 C499.9 109.6 500.9 111.7 501.9 113.8 C503.0 115.8 503.8 118.0 504.7 120.2 C505.6 122.4 506.6 124.7 507.4 126.9 C508.3 129.2 509.1 131.5 509.8 133.9 C510.5 136.2 511.1 138.6 511.5 140.8 C511.9 143.0 512.1 145.2 512.1 147.1 C512.1 148.9 512.0 150.3 511.4 151.8 C510.8 153.3 509.7 154.6 508.5 156.0 C507.2 157.5 505.5 159.1 503.8 160.7 C502.1 162.2 500.0 163.6 498.2 165.1 C496.3 166.6 494.4 168.0 492.9 169.8 C491.4 171.6 490.1 173.5 489.1 175.7 C488.1 178.0 487.6 180.7 486.9 183.1 C486.1 185.6 485.6 188.2 484.8 190.5 C484.0 192.9 483.1 195.1 482.1 197.2 C481.1 199.4 480.0 201.4 478.7 203.4 C477.5 205.4 476.1 207.2 474.5 209.1 C473.0 211.0 471.4 212.9 469.6 214.7 C467.9 216.5 465.9 218.3 464.1 220.1 C462.3 221.9 460.5 223.7 458.7 225.6 C456.9 227.5 455.2 229.6 453.3 231.4 C451.5 233.3 449.6 235.1 447.7 236.7 C445.7 238.4 443.7 240.0 441.6 241.3 C439.4 242.7 437.1 243.9 434.7 245.0 C432.3 246.0 429.7 247.0 427.2 247.7 C424.7 248.4 422.3 248.7 419.8 249.0 C417.3 249.2 414.8 249.0 412.3 249.0 C409.8 249.1 407.2 249.1 404.9 249.3 C402.6 249.6 400.2 250.1 398.5 250.7 C396.7 251.3 395.2 252.0 394.3 252.8 C393.4 253.7 392.9 254.4 392.9 255.6 C392.8 256.8 393.2 258.4 393.9 260.0 C394.5 261.7 395.8 263.6 397.0 265.5 C398.3 267.4 400.1 269.4 401.3 271.3 C402.6 273.2 403.8 274.9 404.4 276.7 C405.1 278.6 405.4 280.5 405.2 282.4 C405.0 284.3 404.3 286.3 403.3 288.2 C402.3 290.0 400.8 291.9 399.1 293.7 C397.5 295.4 395.3 297.0 393.2 298.6 C391.1 300.1 388.7 301.5 386.4 303.0 C384.1 304.4 381.8 305.7 379.5 307.1 C377.2 308.5 374.9 310.0 372.6 311.4 C370.3 312.8 368.0 314.2 365.7 315.6 C363.4 317.0 361.1 318.4 358.8 319.8 C356.5 321.2 354.3 322.6 352.0 324.0 C349.7 325.4 347.5 326.9 345.2 328.3 C343.0 329.7 340.7 331.1 338.4 332.5 C336.2 333.9 333.9 335.3 331.6 336.7 C329.4 338.1 327.1 339.6 324.8 341.0 C322.6 342.4 320.3 343.7 318.0 345.1 C315.8 346.5 313.5 347.9 311.2 349.3 C309.0 350.7 306.7 352.1 304.4 353.5 C302.2 354.9 299.9 356.3 297.6 357.7 C295.3 359.1 293.0 360.5 290.8 361.9 C288.5 363.4 286.3 364.8 284.1 366.3 C281.8 367.8 279.6 369.3 277.4 370.9 C275.3 372.4 273.2 374.1 271.1 375.8 C269.1 377.5 267.1 379.2 265.2 381.1 C263.3 382.9 261.5 384.8 259.7 386.8 C257.9 388.7 256.2 390.8 254.5 392.8 C252.8 394.9 251.1 396.9 249.5 399.0 C247.9 401.1 246.5 403.4 244.8 405.4 C243.1 407.5 241.4 409.4 239.5 411.1 C237.6 412.7 235.5 414.3 233.6 415.3 C231.6 416.2 229.8 416.6 227.8 416.9 C225.9 417.2 223.9 417.1 221.9 417.1 C219.8 417.1 217.7 416.9 215.5 416.9 Z",Pt=[{name:"Hatzenbach",t:.0257,x:180.8,y:421,lx:157,ly:402},{name:"Flugplatz",t:.1147,x:92.4,y:347.9,lx:46,ly:350},{name:"Schwedenkreuz",t:.1779,x:73.1,y:266.8,lx:85,ly:271},{name:"Aremberg",t:.1906,x:65.4,y:251.7,lx:14,ly:248},{name:"Fuchsröhre",t:.2216,x:96.5,y:224,lx:106,ly:226},{name:"Adenauer Forst",t:.2499,x:114.3,y:190.1,lx:46,ly:193},{name:"Bergwerk",t:.4282,x:268.1,y:60.9,lx:283,ly:59},{name:"Kesselchen",t:.4848,x:318.9,y:110,lx:307,ly:101},{name:"Karussell",t:.5729,x:416.3,y:129,lx:390,ly:149},{name:"Hohe Acht",t:.6147,x:461.3,y:96.6,lx:428,ly:76},{name:"Brünnchen",t:.6764,x:512.1,y:147.1,lx:521,ly:151},{name:"Pflanzgarten",t:.7098,x:486.9,y:183.1,lx:428,ly:186},{name:"Schwalbenschwanz",t:.7928,x:404.9,y:249.3,lx:324,ly:236},{name:"Galgenkopf",t:.8254,x:405.2,y:282.4,lx:419,ly:284},{name:"Döttinger Höhe",t:.8819,x:345.2,y:328.3,lx:375,ly:321}],ye={x:222,y:413},L=P.find(t=>t.id==="nordschleife"),je=20.832,D="#ebe9e4";function Ft({rpm:t,gear:a}){const n=h.useRef(null);O(t,"change",l=>{var c;const u=-120+Math.max(0,Math.min(9e3,l))/9e3*240;(c=n.current)==null||c.setAttribute("transform",`rotate(${u.toFixed(2)} 100 100)`)});const r=Array.from({length:10},(l,u)=>u),s=(l,u)=>{const c=(l-90)*Math.PI/180;return[100+u*Math.cos(c),100+u*Math.sin(c)]},o=(l,u,c)=>{const[i,f]=s(l,c),[d,x]=s(u,c);return`M${i} ${f} A${c} ${c} 0 ${u-l>180?1:0} 1 ${d} ${x}`};return e.jsxs("div",{className:"relative w-[140px] sm:w-[200px] md:w-[240px] aspect-square shrink-0",children:[e.jsxs("svg",{viewBox:"0 0 200 200",className:"w-full h-full","aria-hidden":"true",children:[e.jsx("path",{d:o(-120,120,86),fill:"none",stroke:"rgba(235,233,228,0.15)",strokeWidth:"10"}),e.jsx("path",{d:o(80,120,86),fill:"none",stroke:L.accent,strokeWidth:"10"}),r.map(l=>{const u=-120+l/9*240,[c,i]=s(u,72),[f,d]=s(u,62),[x,w]=s(u,50);return e.jsxs("g",{children:[e.jsx("line",{x1:c,y1:i,x2:f,y2:d,stroke:D,strokeWidth:"2"}),e.jsx("text",{x,y:w+4,textAnchor:"middle",fill:D,fontSize:"11",fontFamily:"Fragment Mono, monospace",children:l})]},l)}),e.jsx("g",{ref:n,transform:"rotate(-120 100 100)",children:e.jsx("line",{x1:"100",y1:"100",x2:"100",y2:"24",stroke:L.accent,strokeWidth:"3",strokeLinecap:"round"})}),e.jsx("circle",{cx:"100",cy:"100",r:"7",fill:D})]}),e.jsxs("div",{className:"absolute inset-x-0 bottom-[18%] text-center",children:[e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.6)]",children:"x1000 rpm"}),e.jsx("p",{className:"text-3xl font-bold",style:{color:L.accent},ref:a,"aria-hidden":"true",children:"1"})]})]})}function _t(){var T;const t=h.useRef(null),a=h.useRef(null),n=h.useRef(null),r=h.useRef(null),s=h.useRef(null),[o,l]=h.useState(-1),u=Pt,{scrollYProgress:c,scrollY:i}=le({target:t,offset:["start start","end end"]}),f=M(c,[.05,.92],[0,1],{clamp:!0}),d=M(f,m=>1-m),x=ze(i),w=M(x,m=>Math.min(8800,1100+Math.abs(m)*2.6)),C=ne(w,{stiffness:140,damping:20}),N=m=>{const p=a.current;if(!p||!n.current)return;const g=p.getPointAtLength(m*p.getTotalLength());n.current.setAttribute("cx",g.x),n.current.setAttribute("cy",g.y)};return O(f,"change",m=>{N(m),r.current&&(r.current.textContent=(m*je).toFixed(1));let p=-1;u.forEach((g,b)=>{m>=g.t&&(p=b)}),l(p)}),O(C,"change",m=>{s.current&&(s.current.textContent=String(Math.max(1,Math.min(6,1+Math.floor((m-1100)/1250)))))}),h.useLayoutEffect(()=>N(0),[]),e.jsx("div",{ref:t,className:"relative h-[300vh] md:h-[380vh]",children:e.jsx("div",{className:"sticky top-0 h-[100svh] overflow-hidden flex items-center",children:e.jsxs("div",{className:"b-shell w-full grid gap-8 lg:grid-cols-[1fr_300px] items-center pt-14",children:[e.jsxs("div",{className:"relative",children:[e.jsxs("svg",{viewBox:"5 38 580 420",className:"w-full max-h-[52svh] lg:max-h-[72svh]","aria-label":"Nürburgring Nordschleife lap map",children:[e.jsx("path",{d:se,fill:"none",stroke:"#2a2a2a",strokeWidth:"12",strokeLinejoin:"round"}),e.jsx("path",{ref:a,d:se,fill:"none",stroke:"rgba(235,233,228,0.25)",strokeWidth:"1",strokeDasharray:"3 5"}),e.jsx(j.path,{d:se,fill:"none",stroke:L.accent,strokeWidth:"3.5",strokeLinecap:"round",pathLength:"1",strokeDasharray:"1",style:{strokeDashoffset:d}}),e.jsxs("g",{transform:`translate(${ye.x} ${ye.y})`,children:[e.jsx("rect",{x:"-1.5",y:"-9",width:"3",height:"18",fill:D}),e.jsx("text",{x:"0",y:"30",textAnchor:"middle",fill:"rgba(235,233,228,0.6)",fontSize:"9",fontFamily:"Fragment Mono, monospace",children:"start / finish"})]}),u.map((m,p)=>e.jsxs("g",{opacity:p<=o?1:.4,className:p===o?"":"hidden sm:inline",children:[e.jsx("circle",{cx:m.x,cy:m.y,r:"2.5",fill:p===o?L.accent:D}),e.jsx("text",{x:m.lx,y:m.ly,fill:p===o?L.accent:D,fontSize:"10",fontFamily:"Fragment Mono, monospace",stroke:"#111",strokeWidth:"4",paintOrder:"stroke",strokeLinejoin:"round",children:m.name})]},m.name)),e.jsx("circle",{ref:n,r:"6",fill:D,stroke:L.accent,strokeWidth:"2.5"})]}),e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.45)] mt-2",children:"traced from the circuit map"})]}),e.jsxs("div",{className:"flex lg:flex-col gap-8 items-center lg:items-start",children:[e.jsx(Ft,{rpm:C,gear:s}),e.jsxs("div",{children:[e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.6)]",children:"lap distance"}),e.jsxs("p",{className:"b-stat mt-1",children:[e.jsx("span",{ref:r,children:"0.0"}),e.jsxs("span",{className:"text-[rgba(235,233,228,0.5)]",children:[" / ",je.toFixed(1)," km"]})]}),e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.6)] mt-5",children:"now through"}),e.jsx("p",{className:"text-2xl font-bold tracking-[-0.03em] mt-1",style:{color:L.accent},children:o>=0?(T=u[o])==null?void 0:T.name:"Start / finish"}),e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.45)] mt-5 max-w-[26ch]",children:"scroll faster to rev it"})]})]})]})})})}const zt=[{value:"20.8",unit:"km",label:"per lap"},{value:"~300",unit:"m",label:"of elevation change"},{value:"1927",unit:"",label:"year it opened"},{value:"Grüne",unit:"Hölle",label:"the Green Hell"}];function It(){return e.jsxs("section",{id:"nordschleife",className:"relative bg-[#111] text-[#ebe9e4] pt-24 md:pt-32 pb-24 md:pb-32",children:[e.jsx(Q,{dream:L,tone:"dark"}),e.jsx("div",{className:"mt-10",children:e.jsx(_t,{})}),e.jsx("div",{className:"b-shell mt-16 grid grid-cols-2 md:grid-cols-4 gap-6",children:zt.map((t,a)=>e.jsxs(j.div,{className:"border-t border-[rgba(235,233,228,0.2)] pt-4",initial:{opacity:0,y:30},whileInView:{opacity:1,y:0},viewport:{once:!0,amount:.5},transition:{duration:.8,delay:a*.08,ease:[.76,0,.24,1]},children:[e.jsxs("p",{className:"b-stat",children:[t.value,t.unit&&e.jsx("span",{className:"b-serif italic text-[0.6em] font-normal ml-1",children:t.unit})]}),e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.6)] mt-2",children:t.label})]},t.label))})]})}const q=P.find(t=>t.id==="ironman"),Z=Re.reduce((t,a)=>t+a.km,0),Se={swim:at,bike:Ze,run:Je},$t=.621371;let ae=0;const _=Re.map(t=>{const a=ae/Z;return ae+=t.km,{...t,start:a,end:ae/Z}}),Dt=t=>{const a=Math.floor(t),n=Math.floor((t-a)*60);return`${String(a).padStart(2,"0")}:${String(n).padStart(2,"0")}`};function Wt(){const t=h.useRef(null),a=h.useRef(null),n=h.useRef(null),[r,s]=h.useState(0),{scrollYProgress:o}=le({target:t,offset:["start start","end end"]}),l=M(o,[.05,.9],[0,1],{clamp:!0}),u=M(l,d=>`${d*100}%`),c=u;O(l,"change",d=>{a.current&&(a.current.textContent=(d*Z).toFixed(1)),n.current&&(n.current.textContent=Dt(d*re));const x=_.findIndex(w=>d<=w.end);s(x===-1?_.length-1:x)});const i=_[r],f=Se[i.id];return e.jsx("div",{ref:t,className:"relative h-[280vh] md:h-[340vh]",children:e.jsx("div",{className:"sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-center",children:e.jsxs("div",{className:"b-shell w-full",children:[e.jsxs("div",{className:"grid gap-8 md:grid-cols-[1fr_auto] md:items-end",children:[e.jsxs("div",{children:[e.jsx("p",{className:"b-mono text-[var(--ink-3)]",children:"distance covered"}),e.jsxs("p",{className:"b-giant-number mt-2",children:[e.jsx("span",{ref:a,children:"0.0"}),e.jsxs("span",{className:"b-serif italic text-[0.3em] ml-2 tracking-normal font-normal",children:["/ ",Z.toFixed(1)," km"]})]})]}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(j.span,{className:"w-16 h-16 rounded-full grid place-items-center text-white",style:{background:q.accent},initial:{scale:.4,rotate:-30},animate:{scale:1,rotate:0},transition:{type:"spring",stiffness:300,damping:16},children:e.jsx(f,{size:28,"aria-hidden":!0})},i.id),e.jsxs("div",{children:[e.jsxs("p",{className:"b-mono text-[var(--ink-3)]",children:["leg ",r+1," of 3"]}),e.jsx("p",{className:"text-3xl font-bold tracking-[-0.04em]",children:i.label})]})]})]}),e.jsxs("div",{className:"mt-12 md:mt-16",children:[e.jsxs("p",{className:"b-mono mb-3",children:[_[0].label," ",e.jsxs("span",{className:"text-[var(--ink-3)]",children:[_[0].km," km"]}),e.jsx("span",{className:"text-[var(--ink-3)]",children:" ↓ yes, that sliver"})]}),e.jsxs("div",{className:"relative h-4 rounded-full bg-[var(--paper-3)] overflow-visible",children:[_.map((d,x)=>e.jsx("div",{className:"absolute top-0 h-full",style:{left:`${d.start*100}%`,width:`${(d.end-d.start)*100}%`,borderLeft:x>0?"2px solid var(--paper)":"none"}},d.id)),e.jsx(j.div,{className:"absolute left-0 top-0 h-full rounded-full",style:{width:c,background:q.accent}}),e.jsx(j.div,{className:"absolute top-1/2 w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border-4 border-[var(--paper)] shadow-lg",style:{left:u,background:"var(--ink)"},"aria-hidden":!0})]}),e.jsx("div",{className:"relative mt-4 h-12",children:_.slice(1).map((d,x,w)=>e.jsx("div",{className:"absolute top-0",style:x===w.length-1?{right:0}:{left:`${d.start*100}%`},children:e.jsxs("p",{className:"b-mono whitespace-nowrap",children:[d.label," ",e.jsxs("span",{className:"text-[var(--ink-3)]",children:[d.km," km"]})]})},d.id))})]}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2",children:[e.jsx("p",{className:"b-mono text-[var(--ink-3)]",children:"clock at exactly cutoff pace"}),e.jsxs("p",{className:"b-stat",children:[e.jsx("span",{ref:n,children:"00:00"}),e.jsxs("span",{className:"text-[var(--ink-3)]",children:[" / ",re,":00"]})]})]})]})})})}function Ot(){return e.jsxs("section",{id:"ironman",className:"relative pt-24 md:pt-32 pb-24 md:pb-32",children:[e.jsx(Q,{dream:q}),e.jsx("div",{className:"mt-10",children:e.jsx(Wt,{})}),e.jsxs("div",{className:"b-shell mt-10 grid gap-4 md:grid-cols-4",children:[_.map((t,a)=>{const n=Se[t.id];return e.jsxs(j.div,{className:"rounded-[20px] border border-[var(--rule)] bg-[var(--paper-2)] p-5",initial:{opacity:0,y:30},whileInView:{opacity:1,y:0},viewport:{once:!0,amount:.5},transition:{duration:.8,delay:a*.08,ease:[.76,0,.24,1]},children:[e.jsx(n,{size:22,style:{color:q.accent},"aria-hidden":!0}),e.jsxs("p",{className:"b-stat mt-4",children:[t.km,e.jsx("span",{className:"b-serif italic text-[0.55em] font-normal ml-1",children:"km"})]}),e.jsxs("p",{className:"b-mono text-[var(--ink-3)] mt-1",children:[t.label.toLowerCase()," / ",(t.km*$t).toFixed(1)," mi"]})]},t.id)}),e.jsxs(j.div,{className:"rounded-[20px] p-5 text-white",style:{background:q.accent},initial:{opacity:0,y:30},whileInView:{opacity:1,y:0},viewport:{once:!0,amount:.5},transition:{duration:.8,delay:.24,ease:[.76,0,.24,1]},children:[e.jsx("p",{className:"b-mono opacity-80",children:"all of it, back to back"}),e.jsxs("p",{className:"b-stat mt-4",children:[re,e.jsx("span",{className:"b-serif italic text-[0.55em] font-normal ml-1",children:"hours"})]}),e.jsx("p",{className:"b-mono opacity-80 mt-1",children:"to beat the cutoff"})]})]})]})}const B=[{id:"c5",label:"C5",freq:523.25},{id:"a4",label:"A4",freq:440},{id:"g4",label:"G4",freq:392},{id:"e4",label:"E4",freq:329.63},{id:"d4",label:"D4",freq:293.66},{id:"c4",label:"C4",freq:261.63},{id:"kick",label:"Kick",freq:null}],H=16,Ut={c5:[10],a4:[2,8,14],g4:[4,12],e4:[0,6],d4:[11],c4:[3,15],kick:[0,4,8,12]},qt=()=>B.map(()=>Array(H).fill(!1)),Bt=()=>B.map(t=>{const a=Ut[t.id]??[];return Array.from({length:H},(n,r)=>a.includes(r))});function Ht(t=100){const[a,n]=h.useState(Bt),[r,s]=h.useState(!1),[o,l]=h.useState(-1),u=h.useRef(a),c=h.useRef(null),i=h.useRef(null),f=h.useRef(0),d=h.useRef(0),x=h.useRef(0),w=h.useRef(0),C=h.useRef([]),N=h.useRef(!1);h.useEffect(()=>{u.current=a},[a]);const T=()=>{if(c.current)return c.current;const v=window.AudioContext||window.webkitAudioContext;if(!v)return null;const k=new v,y=k.createGain();y.gain.value=.32;const R=k.createDelay();R.delayTime.value=60/t*.75;const E=k.createGain();E.gain.value=.28;const A=k.createGain();return A.gain.value=.22,R.connect(E).connect(R),R.connect(A).connect(y),y.connect(k.destination),i.current={master:y,delay:R},c.current=k,k},m=(v,k,y)=>{const{master:R,delay:E}=i.current,A=v.createOscillator(),U=v.createBiquadFilter(),W=v.createGain();A.type="triangle",A.frequency.value=k,U.type="lowpass",U.frequency.value=2200,W.gain.setValueAtTime(0,y),W.gain.linearRampToValueAtTime(.5,y+.008),W.gain.exponentialRampToValueAtTime(.001,y+.45),A.connect(U).connect(W),W.connect(R),W.connect(E),A.start(y),A.stop(y+.5)},p=(v,k)=>{const y=v.createOscillator(),R=v.createGain();y.type="sine",y.frequency.setValueAtTime(140,k),y.frequency.exponentialRampToValueAtTime(42,k+.14),R.gain.setValueAtTime(1,k),R.gain.exponentialRampToValueAtTime(.001,k+.3),y.connect(R).connect(i.current.master),y.start(k),y.stop(k+.32)},g=h.useCallback(()=>{const v=c.current,k=60/t/4;for(;x.current<v.currentTime+.12;){const y=w.current,R=x.current;B.forEach((E,A)=>{u.current[A][y]&&(E.freq?m(v,E.freq,R):p(v,R))}),C.current.push({step:y,time:R}),x.current+=k,w.current=(y+1)%H}},[t]),b=h.useCallback(()=>{const v=c.current,k=C.current;let y=null;for(;k.length&&k[0].time<=v.currentTime;)y=k.shift();y&&l(y.step),d.current=requestAnimationFrame(b)},[]),S=h.useCallback(()=>{N.current=!1,window.clearInterval(f.current),cancelAnimationFrame(d.current),C.current=[],s(!1),l(-1)},[]),z=h.useCallback(async()=>{if(N.current)return!0;const v=T();if(!v)return!1;if(v.state!=="running")try{await Promise.race([v.resume(),new Promise(k=>setTimeout(k,300))])}catch{return!1}return v.state!=="running"||N.current?v.state==="running":(N.current=!0,w.current=0,x.current=v.currentTime+.06,f.current=window.setInterval(g,25),d.current=requestAnimationFrame(b),s(!0),!0)},[g,b]),I=(v,k)=>n(y=>y.map((R,E)=>E===v?R.map((A,U)=>U===k?!A:A):R)),Le=()=>n(qt()),Pe=()=>n(B.map(v=>Array.from({length:H},(k,y)=>v.freq?Math.random()<.13:y%4===0||Math.random()<.05)));return h.useEffect(()=>()=>{var v;window.clearInterval(f.current),cancelAnimationFrame(d.current),(v=c.current)==null||v.close()},[]),{grid:a,playing:r,playhead:o,start:z,stop:S,toggle:I,clear:Le,shuffle:Pe}}const J=P.find(t=>t.id==="album"),Ae=100,Ee=1e4;function Gt(t,a){const[n,r]=h.useState(!1),[s,o]=h.useState(!1),l=h.useRef(!1),u=h.useRef(0),c=h.useRef(a);c.current=a;const i=h.useCallback(async()=>l.current?!0:await t.start()?(l.current=!0,o(!1),r(!0),u.current=window.setTimeout(()=>{r(!1),t.stop()},Ee),!0):!1,[t.start,t.stop]);h.useEffect(()=>{if(!a||l.current)return;let d=!1;return i().then(x=>{!x&&!d&&!l.current&&o(!0)}),()=>{d=!0}},[a,i]),h.useEffect(()=>{if(!s)return;const d=()=>{c.current&&i()};return window.addEventListener("pointerdown",d),window.addEventListener("keydown",d),()=>{window.removeEventListener("pointerdown",d),window.removeEventListener("keydown",d)}},[s,i]);const f=h.useCallback(()=>{window.clearTimeout(u.current),l.current=!0,r(!1),o(!1)},[]);return h.useEffect(()=>()=>window.clearTimeout(u.current),[]),{previewing:n,cancel:f}}function Vt({spinning:t}){return e.jsx("div",{className:"relative aspect-square w-full max-w-[420px]",children:e.jsx("svg",{viewBox:"0 0 400 400",className:"w-full h-full","aria-hidden":"true",children:e.jsxs("g",{className:"b-record-spin",style:{animationPlayState:t?"running":"paused",animationDuration:"1.8s"},children:[e.jsx("circle",{cx:"200",cy:"200",r:"196",fill:"#0b0b0b"}),Array.from({length:14},(a,n)=>e.jsx("circle",{cx:"200",cy:"200",r:180-n*9,fill:"none",stroke:"#1f1f1f",strokeWidth:"1"},n)),e.jsx("path",{d:"M200 10 A190 190 0 0 1 380 160",fill:"none",stroke:"rgba(255,255,255,0.08)",strokeWidth:"18"}),e.jsx("circle",{cx:"200",cy:"200",r:"64",fill:J.accent}),e.jsx("text",{x:"200",y:"190",textAnchor:"middle",fill:"#ebe9e4",fontFamily:"Fragment Mono, monospace",fontSize:"11",children:"MANAS JHA"}),e.jsx("text",{x:"200",y:"208",textAnchor:"middle",fill:"#ebe9e4",fontFamily:"Instrument Serif, serif",fontStyle:"italic",fontSize:"16",children:"LP 01"}),e.jsx("text",{x:"200",y:"226",textAnchor:"middle",fill:"rgba(235,233,228,0.7)",fontFamily:"Fragment Mono, monospace",fontSize:"9",children:"side a / 33 rpm"}),e.jsx("circle",{cx:"200",cy:"200",r:"5",fill:"#0b0b0b"})]})})})}function Yt({seq:t,preview:a}){const{grid:n,playing:r,playhead:s,start:o,stop:l,toggle:u,clear:c,shuffle:i}=t,f=()=>{a.cancel(),r?l():o()};return e.jsxs("div",{className:"rounded-[22px] border border-[rgba(235,233,228,0.14)] bg-[rgba(235,233,228,0.03)] p-4 md:p-6",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 mb-5",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"b-mono text-[rgba(235,233,228,0.6)]",children:["record session / ",Ae," bpm"]}),e.jsx("p",{className:"text-lg font-semibold tracking-[-0.02em]",children:"Make a loop. Every cell is a note."})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("button",{type:"button",onClick:f,className:"inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-[#111] bg-[#ebe9e4] hover:bg-white transition-colors",children:[r?e.jsx(Qe,{size:16,"aria-hidden":!0}):e.jsx(et,{size:16,"aria-hidden":!0}),r?"Stop":"Play"]}),e.jsx("button",{type:"button",onClick:i,className:"w-10 h-10 rounded-full border border-[rgba(235,233,228,0.3)] grid place-items-center hover:border-[#ebe9e4] transition-colors","aria-label":"Randomize pattern",children:e.jsx(tt,{size:16,"aria-hidden":!0})}),e.jsx("button",{type:"button",onClick:c,className:"w-10 h-10 rounded-full border border-[rgba(235,233,228,0.3)] grid place-items-center hover:border-[#ebe9e4] transition-colors","aria-label":"Clear pattern",children:e.jsx(st,{size:16,"aria-hidden":!0})})]})]}),e.jsx("div",{className:"grid gap-[3px] md:gap-1.5",style:{gridTemplateColumns:`2.6rem repeat(${H}, minmax(0, 1fr))`},children:B.map((d,x)=>e.jsxs("div",{className:"contents",children:[e.jsx("span",{className:"b-mono self-center text-[rgba(235,233,228,0.55)] text-[10px] md:text-xs",children:d.label}),n[x].map((w,C)=>e.jsx("button",{type:"button",onClick:()=>u(x,C),"aria-pressed":w,"aria-label":`${d.label}, step ${C+1}`,className:`b-step ${w?"is-on":""} ${C===s?"is-playhead":""} ${C%4===0?"ml-[2px]":""}`,style:{"--album":J.accent}},C))]},d.id))}),e.jsx("div",{className:"mt-4 min-h-[1.5rem]",children:e.jsx(ce,{mode:"wait",children:a.previewing?e.jsxs(j.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},children:[e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.7)]",children:"playing a 10-second preview"}),e.jsx("div",{className:"mt-2 h-[2px] bg-[rgba(235,233,228,0.15)] overflow-hidden rounded-full",children:e.jsx(j.div,{className:"h-full",style:{background:J.accent,transformOrigin:"left"},initial:{scaleX:1},animate:{scaleX:0},transition:{duration:Ee/1e3,ease:"linear"}})})]},"preview"):e.jsx(j.p,{className:"b-mono text-[rgba(235,233,228,0.45)]",initial:{opacity:0},animate:{opacity:1},children:"press play to hear your loop"},"idle")})})]})}function Xt(){const t=Ht(Ae),a=h.useRef(null),n=Ce(a,{amount:.5}),r=Gt(t,n);return e.jsxs("section",{id:"album",className:"relative bg-[#111] text-[#ebe9e4] pt-24 md:pt-32 pb-24 md:pb-32",children:[e.jsx(Q,{dream:J,tone:"dark"}),e.jsxs("div",{ref:a,className:"b-shell mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] items-center",children:[e.jsx(j.div,{initial:{opacity:0,rotate:-20,x:-60},whileInView:{opacity:1,rotate:0,x:0},viewport:{once:!0,amount:.4},transition:{duration:1.2,ease:[.76,0,.24,1]},className:"justify-self-center w-full max-w-[420px]",children:e.jsx(Vt,{spinning:t.playing})}),e.jsx(Yt,{seq:t,preview:r})]}),e.jsxs("div",{className:"b-shell mt-16 md:mt-24 grid gap-10 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.6)] mb-4",children:"liner notes / credits"}),e.jsx("ul",{className:"divide-y divide-[rgba(235,233,228,0.14)] border-y border-[rgba(235,233,228,0.14)]",children:me.map((s,o)=>e.jsxs(j.li,{className:"flex items-baseline justify-between gap-4 py-3",initial:{opacity:0,x:-20},whileInView:{opacity:1,x:0},viewport:{once:!0,amount:.8},transition:{duration:.6,delay:o*.05},children:[e.jsxs("span",{className:"text-lg",children:[s," by"]}),e.jsx("span",{className:"b-serif italic text-2xl",style:{color:o===me.length-1?"#ebe9e4":void 0},children:"Manas Jha"})]},s))})]}),e.jsxs("div",{className:"self-end",children:[e.jsx("p",{className:"b-serif italic text-[clamp(2.2rem,5vw,4rem)] leading-[1] tracking-[-0.02em]",children:"Every sound on it, from the first idea to the final master, made by one person."}),e.jsx("p",{className:"b-mono text-[rgba(235,233,228,0.6)] mt-6",children:"tracklist: to be written"})]})]})]})}const we="Before I'm done";function Kt(){const t=P.filter(n=>n.status==="done").length,a=Array.from({length:4},(n,r)=>e.jsxs("span",{className:"flex items-center shrink-0",children:[e.jsx("span",{className:"b-hero-title text-[clamp(3.5rem,12vw,11rem)] px-[0.2em]",children:we}),e.jsx("span",{className:"b-serif italic text-[clamp(3rem,10vw,9rem)] px-[0.2em]","aria-hidden":!0,children:"*"})]},r));return e.jsxs("footer",{className:"relative pt-24 md:pt-32 pb-10 overflow-hidden",children:[e.jsxs("div",{className:"b-marquee-track","aria-hidden":"true",children:[a,a]}),e.jsx("h2",{className:"sr-only",children:we}),e.jsxs("div",{className:"b-shell mt-16 grid gap-8 md:grid-cols-[1fr_auto] md:items-end b-rule pt-6",children:[e.jsxs("p",{className:"text-[clamp(1.3rem,2.6vw,2rem)] leading-tight tracking-[-0.02em] max-w-[30ch]",children:[t," of ",P.length," crossed off so far."," ",e.jsx("span",{className:"b-serif italic",children:"This page updates as they happen."})]}),e.jsxs("a",{href:"/","data-transition":"portfolio",className:"b-pill justify-self-start",children:[e.jsx(ke,{children:"Back to the portfolio"}),e.jsx(Ie,{size:14,"aria-hidden":!0})]})]}),e.jsxs("div",{className:"b-shell mt-10 flex justify-between b-mono text-[var(--ink-3)]",children:[e.jsxs("span",{children:["© ",new Date().getFullYear()," Manas Jha"]}),e.jsx("span",{children:"manasjha.online/bucket-list"})]})]})}const oe=[.76,0,.24,1];function Zt({active:t,onDone:a}){const[n,r]=h.useState(t);return h.useEffect(()=>{if(!t)return;const s=window.setTimeout(()=>{r(!1),a==null||a()},450);return()=>window.clearTimeout(s)},[t,a]),e.jsx(ce,{children:n&&e.jsx(j.div,{className:"fixed inset-0 z-[70] grid place-items-center bg-[var(--paper)]",initial:{clipPath:"inset(0% 0% 0% 0%)"},exit:{clipPath:"inset(0% 0% 100% 0%)"},transition:{duration:.9,ease:oe},"aria-hidden":"true",children:e.jsx(j.p,{className:"transition-title",exit:{y:"-60%",opacity:0},transition:{duration:.6,ease:oe},children:"Bucket List"})})})}function Jt(){const t=$e(),a=(t==null?void 0:t.to)==="portfolio",[n,r]=h.useState(0);return h.useEffect(()=>{if(!a)return;r(0);const s=performance.now(),o=window.setInterval(()=>{r(Math.min(20,Math.round((performance.now()-s)/900*20)))},50);return()=>window.clearInterval(o)},[a]),e.jsx(ce,{children:a&&e.jsx(j.div,{className:"fixed inset-0 z-[2147483646]",style:{background:"#01030c",color:"#f6f7ff"},initial:{clipPath:`circle(0% at ${t.x}px ${t.y}px)`},animate:{clipPath:`circle(150% at ${t.x}px ${t.y}px)`},transition:{duration:.8,ease:oe},"aria-hidden":"true",children:e.jsxs("div",{className:"h-full flex flex-col justify-between py-10 mx-auto",style:{width:"min(1200px, 92vw)"},children:[e.jsx("p",{className:"boot-mono text-xs text-white/40",children:"manas@jha:~$ boot portfolio"}),e.jsxs("div",{className:"flex items-end justify-between gap-6",children:[e.jsx("p",{className:"boot-name",children:e.jsx(De,{text:"Manas Jha",className:"boot-gradient",delay:250,duration:900})}),e.jsx("p",{className:"boot-mono boot-count",children:String(n).padStart(3,"0")})]}),e.jsx("div",{className:"h-px w-full bg-white/10 overflow-hidden",children:e.jsx("div",{className:"h-full bg-[#00aeef]",style:{width:`${n}%`}})})]})})})}const Qt=.7;function es(){const t=We("(prefers-reduced-motion: reduce)");Oe(!t),Ue();const[a]=h.useState(()=>qe("bucket"));return e.jsxs(Be,{reducedMotion:"user",children:[e.jsx("div",{className:"b-grain","aria-hidden":"true"}),e.jsx(Zt,{active:a}),e.jsx(Jt,{}),e.jsx(nt,{}),e.jsxs("main",{children:[e.jsx(lt,{introDelay:a?Qt:0}),e.jsx(xt,{}),e.jsx(G,{children:e.jsx(Lt,{})}),e.jsx(G,{children:e.jsx(It,{})}),e.jsx(G,{children:e.jsx(Ot,{})}),e.jsx(G,{children:e.jsx(Xt,{})}),e.jsx(Kt,{})]})]})}He.createRoot(document.getElementById("root")).render(e.jsx(Ge.StrictMode,{children:e.jsx(es,{})}));
