// Rezidence Metelka – architektonická maketa domu podle projektové dokumentace.
// Rozměry: délka 42,856 m, hloubka 11 m, 8 bytů vedle sebe na podlaží, přízemí ±0,00 / světlá výška 2,5 m,
// podkroví pod dvěma pultovými střechami (+4,97 → +5,84 a +6,46 → +5,45), pavlač 1,2 m, balkon 1,2 m.
// Fasáda a materiály nejsou rozhodnuté, proto maketa: bílá sádra, černé rámy, zlatý vybraný byt.
// Kreslí se jen na vyžádání (render on demand), žádná smyčka v klidu.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const L = 42.856, D = 11, N = 8, W = L / N;
const Z0 = -D / 2, Z1 = D / 2;           // sever = pavlač (z < 0), jih = balkony a zahrádky (z > 0)
const U0 = 2.85;                         // úroveň podlahy podkroví
const RN0 = 4.97, RN1 = 5.84;            // severní střecha: okap → střed
const RS0 = 6.46, RS1 = 5.45;            // jižní střecha: střed → okap
const TW = 0.45, TP = 0.125;             // obvodová zeď, polovina mezibytové zdi
const CUT = 1.25;                        // výška řezu u rozkrytého podlaží

export const BARVY = {
  pozadi: 0xeee7dc, zem: 0xe9e1d3, travnik: 0xe2e0d0, dlazba: 0xf1ece3, zivyplot: 0xcfcdb9,
  omitka: 0xf4f1ec, strecha: 0xe9e5de, sokl: 0xd9d0c2, ram: 0x2b2724, sklo: 0x4f4b46,
  drevo: 0xdcc8a8, dlazba_kup: 0xc4beb4, nabytek: 0xfbfaf7, zlata: 0xc79d5a, zlata_svetla: 0xe4cfa6,
};

function prisma(profil, x0, x1) {
  // profil: [[z, y], ...] v řezu domu, protažený podél osy x
  const s = new THREE.Shape(profil.map(([z, y]) => new THREE.Vector2(-z, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth: x1 - x0, bevelEnabled: false });
  g.rotateY(Math.PI / 2); g.translate(x0, 0, 0);
  return g;
}

function stena(x0, x1, y0, y1, z, tl, otvory = []) {
  // svislá stěna v rovině xy s otvory [{x, y, w, h}] (x,y = levý dolní roh v souřadnicích světa), tloušťka do +z
  const s = new THREE.Shape();
  s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.closePath();
  for (const o of otvory) {
    const h = new THREE.Path();
    h.moveTo(o.x, o.y); h.lineTo(o.x, o.y + o.h); h.lineTo(o.x + o.w, o.y + o.h); h.lineTo(o.x + o.w, o.y); h.closePath();
    s.holes.push(h);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: tl, bevelEnabled: false });
  g.translate(0, 0, z);
  return g;
}

function kvadr(x0, x1, y0, y1, z0, z1) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return g;
}

export function vytvorMaketu(canvas, opt = {}) {
  const kvalita = opt.kvalita || 'live';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !!opt.pruhledne, preserveDrawingBuffer: !!opt.preserve, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opt.maxDpr || 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = opt.tone === 'agx' ? THREE.AgXToneMapping : THREE.NeutralToneMapping;
  renderer.toneMappingExposure = opt.expozice || 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const bg = new THREE.Color(opt.pozadi ?? BARVY.pozadi);
  if (!opt.pruhledne) scene.background = bg;
  if (opt.mlha) scene.fog = new THREE.Fog(bg, opt.mlhaOd ?? 70, opt.mlhaDo ?? 150);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = opt.env ?? 0.4;

  const hemi = new THREE.HemisphereLight(0xf4f1ec, 0xd9d0c4, opt.hemi ?? 0.5);
  scene.add(hemi);
  const slunce = new THREE.DirectionalLight(0xfff3e4, opt.slunce ?? 3.6);
  slunce.position.set(-42, 26, 20);
  slunce.castShadow = true;
  const sm = kvalita === 'offline' ? 4096 : (opt.stinMapa || 2048);
  slunce.shadow.mapSize.set(sm, sm);
  const sc = slunce.shadow.camera;
  sc.left = -34; sc.right = 34; sc.top = 30; sc.bottom = -30; sc.near = 1; sc.far = 140;
  slunce.shadow.bias = -0.0004; slunce.shadow.normalBias = 0.03; slunce.shadow.radius = 3;
  scene.add(slunce); scene.add(slunce.target);

  // materiály
  const M = (c, r = 0.9, m = 0, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...extra });
  const mat = {
    zem: M(BARVY.zem, 1), travnik: M(BARVY.travnik, 1), dlazba: M(BARVY.dlazba, 0.95), zivyplot: M(BARVY.zivyplot, 1),
    strecha: M(BARVY.strecha, 0.88), sokl: M(BARVY.sokl, 0.95), ram: M(BARVY.ram, 0.5, 0.2),
    sklo: M(BARVY.sklo, 0.12, 0, { envMapIntensity: 1.2 }), cleristory: M(0x4d4943, 0.1, 0, { envMapIntensity: 1.3 }),
    zlata: M(BARVY.zlata, 0.5, 0.35), zlataSvetla: M(BARVY.zlata_svetla, 0.8, 0.1), kmen: M(0xcdbfa9, 0.9), koruna: M(0xeeebe4, 0.95),
  };
  const roofPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000);
  const planeP = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000);   // řez přízemí
  const planeU = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1000);   // řez podkroví
  const matPodlazi = (pl) => ({
    omitka: M(BARVY.omitka, 0.92, 0, { clippingPlanes: [pl], side: THREE.DoubleSide, clipShadows: true }),
    drevo: M(BARVY.drevo, 0.75), dlazba: M(BARVY.dlazba_kup, 0.6), nabytek: M(BARVY.nabytek, 0.9),
    ram: M(BARVY.ram, 0.5, 0.2, { clippingPlanes: [pl], clipShadows: true }),
    sklo: M(BARVY.sklo, 0.12, 0, { envMapIntensity: 1.2, clippingPlanes: [pl], clipShadows: true }),
  });
  const matP = matPodlazi(planeP), matU = matPodlazi(planeU);
  const zlataStena = (pl) => M(BARVY.zlata, 0.55, 0.3, { clippingPlanes: [pl], side: THREE.DoubleSide, clipShadows: true });
  const zlataP = zlataStena(planeP), zlataU = zlataStena(planeU);
  const svetlaP = M(BARVY.zlata_svetla, 0.85, 0.05, { clippingPlanes: [planeP], side: THREE.DoubleSide, clipShadows: true });
  const svetlaU = M(BARVY.zlata_svetla, 0.85, 0.05, { clippingPlanes: [planeU], side: THREE.DoubleSide, clipShadows: true });

  const mesh = (g, m, parent, stin = true) => {
    const o = new THREE.Mesh(g, m); o.castShadow = stin; o.receiveShadow = true; parent.add(o); return o;
  };

  // ---------- okolí ----------
  const okoli = new THREE.Group(); scene.add(okoli);
  // modelová deska (jako fyzický model na stole) a stůl, který jen přijímá stín
  const DX0 = -27, DX1 = 27, DZ0 = -11.5, DZ1 = 18.6, DY = -1.25;
  mat.deska = M(0xf1ede6, 0.95); mat.hrana = M(0xc9ad85, 0.7);
  mesh(kvadr(DX0, DX1, DY, -0.31, DZ0, DZ1), [mat.hrana, mat.hrana, mat.deska, mat.hrana, mat.hrana, mat.hrana], okoli);
  const stul = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ color: 0x2e2620, opacity: 0.13 }));
  stul.position.y = DY; stul.receiveShadow = true; okoli.add(stul);
  // sokl domu
  mesh(kvadr(-L / 2, L / 2, -0.31, 0.0, Z0, Z1), mat.sokl, okoli);
  // chodník podél pavlače a příjezd
  mesh(kvadr(-L / 2 - 1.4, L / 2 + 1.4, -0.31, -0.29, Z0 - 3.2, Z0), mat.dlazba, okoli, false);

  // ---------- dům ----------
  const dum = new THREE.Group(); scene.add(dum);
  const patroG = new THREE.Group(); dum.add(patroG);
  const strechaG = new THREE.Group(); dum.add(strechaG);
  const byty = [];   // {cislo, pozice, podlazi, steny:[mesh], podlaha:[mesh], stred:Vector3, hit}

  function okno(parent, m, x, y, w, h, zFace, smer, mullion = 0) {
    // rám (černý, tenký) + sklo zapuštěné o 0,16 m od líce
    const r = 0.055, hl = 0.06;
    const zr = smer > 0 ? zFace - 0.16 : zFace + 0.16 - hl;
    const s = new THREE.Shape();
    s.moveTo(x, y); s.lineTo(x + w, y); s.lineTo(x + w, y + h); s.lineTo(x, y + h); s.closePath();
    const hole = (a, b, c, d) => { const p = new THREE.Path(); p.moveTo(a, b); p.lineTo(a, d); p.lineTo(c, d); p.lineTo(c, b); p.closePath(); s.holes.push(p); };
    if (mullion) {
      const cx = x + w / 2;
      hole(x + r, y + r, cx - r / 2, y + h - r); hole(cx + r / 2, y + r, x + w - r, y + h - r);
    } else hole(x + r, y + r, x + w - r, y + h - r);
    const g = new THREE.ExtrudeGeometry(s, { depth: hl, bevelEnabled: false }); g.translate(0, 0, zr);
    mesh(g, m.ram, parent, false);
    const sg = new THREE.PlaneGeometry(w - 2 * r, h - 2 * r); sg.translate(x + w / 2, y + h / 2, zr + hl / 2);
    if (smer < 0) sg.rotateY(0); // rovina je oboustranná přes DoubleSide skla níže
    const sk = mesh(sg, m.sklo, parent, false); sk.material.side = THREE.DoubleSide;
  }

  for (const podlazi of ['prizemi', 'patro']) {
    const m = podlazi === 'prizemi' ? matP : matU;
    const parent = podlazi === 'prizemi' ? dum : patroG;
    const y0 = podlazi === 'prizemi' ? 0 : U0;
    for (let p = 1; p <= N; p++) {
      const cislo = podlazi === 'prizemi' ? p : p + 8;
      const g = new THREE.Group(); parent.add(g);
      const x0 = -L / 2 + (p - 1) * W, x1 = x0 + W;
      const zrc = p % 2 === 0;                      // dvojice bytů jsou zrcadlené
      const xl = x0 + (p === 1 ? TW : TP), xr = x1 - (p === N ? TW : TP);
      const steny = [], podlaha = [];
      // otvory: jih = dvě francouzská okna / dveře, sever = vstup + okno ložnice
      const mx = (u) => zrc ? x0 + x1 - u : u;      // zrcadlení v rámci bytu
      const jih = [{ x: x0 + 0.8, w: 1.5 }, { x: x0 + W - 0.8 - 1.5, w: 1.5 }].map(o => ({ x: o.x, y: y0 + 0.05, w: o.w, h: 2.3 }));
      const vstupX = zrc ? xl + 0.15 : xr - 0.15 - 1.0;
      const loznX = zrc ? xr - 0.9 - 1.4 : xl + 0.9;
      const sever = podlazi === 'prizemi' ? [{ x: vstupX, y: y0 + 0.02, w: 1.0, h: 2.2 }, { x: loznX, y: y0 + 0.95, w: 1.4, h: 1.35 }]
        : [{ x: vstupX, y: y0 + 0.02, w: 1.0, h: 1.9 }, { x: loznX, y: y0 + 0.75, w: 1.4, h: 1.1 }];
      const vyskaSever = podlazi === 'prizemi' ? 2.85 : RN0 - U0;
      const vyskaJih = podlazi === 'prizemi' ? 2.85 : RS1 - U0;
      steny.push(mesh(stena(x0, x1, y0, y0 + vyskaJih, Z1 - TW, TW, jih), m.omitka, g));
      steny.push(mesh(stena(x0, x1, y0, y0 + vyskaSever, Z0, TW, sever), m.omitka, g));
      for (const o of jih) okno(g, m, o.x, o.y, o.w, o.h, Z1, 1, 1);
      okno(g, m, sever[0].x, sever[0].y, sever[0].w, sever[0].h, Z0, -1, 0);
      okno(g, m, sever[1].x, sever[1].y, sever[1].w, sever[1].h, Z0, -1, 0);
      // boční zdi
      const prof = podlazi === 'prizemi'
        ? [[Z0 + TW, 0], [Z1 - TW, 0], [Z1 - TW, 2.85], [Z0 + TW, 2.85]]
        : [[Z0 + TW, U0], [Z1 - TW, U0], [Z1 - TW, RS1 + 0.18], [0, RS0], [0, RN1], [Z0 + TW, RN0 + 0.15]];
      steny.push(mesh(prisma(prof, x0, xl), m.omitka, g));
      steny.push(mesh(prisma(prof, xr, x1), m.omitka, g));
      // strop přízemí
      if (podlazi === 'prizemi') steny.push(mesh(kvadr(x0, x1, 2.5, 2.85, Z0 + TW, Z1 - TW), m.omitka, g));
      // vnitřní dispozice (chodba 5,77 · ložnice 10,40 · koupelna 6,99 · obývák s kuchyní 24,05)
      const zN = Z0 + TW, zS = Z1 - TW, zM = -0.1, zB = -2.35, hall = 1.25, t = 0.1;
      const xa = zrc ? xl + hall : xr - hall - t;           // příčka chodba | ložnice+koupelna
      const roomL = zrc ? xa + t : xl, roomR = zrc ? xr : xa;
      const pH = y0 + 2.5;
      podlaha.push(mesh(kvadr(xl, xr, y0, y0 + 0.02, zM, zS), m.drevo, g, false));
      podlaha.push(mesh(kvadr(roomL, roomR, y0, y0 + 0.02, zN, zB), m.drevo, g, false));
      podlaha.push(mesh(kvadr(roomL, roomR, y0, y0 + 0.02, zB + t, zM), m.dlazba, g, false));
      podlaha.push(mesh(kvadr(zrc ? xl : xa + t, zrc ? xa : xr, y0, y0 + 0.02, zN, zM), m.drevo, g, false));
      // příčka A s dveřmi do ložnice a koupelny
      const segA = [[zN, zN + 0.9], [zN + 1.8, zB + 1.05], [zB + 1.95, zM + t]];
      for (const [a, b] of segA) if (b > a) steny.push(mesh(kvadr(xa, xa + t, y0, pH, a, b), m.omitka, g));
      steny.push(mesh(kvadr(roomL, roomR, y0, pH, zB, zB + t), m.omitka, g));
      steny.push(mesh(kvadr(roomL, roomR, y0, pH, zM, zM + t), m.omitka, g));
      // nábytek (kostky jako na modelu)
      const nb = m.nabytek;
      const rc = (roomL + roomR) / 2;
      mesh(kvadr(rc - 0.8, rc + 0.8, y0, y0 + 0.45, zN + 0.1, zN + 2.1), nb, g);                     // postel
      mesh(kvadr(roomR - 0.95, roomR - 0.05, y0, y0 + 0.08, zB + t + 0.05, zB + t + 0.95), nb, g);   // sprcha
      mesh(kvadr(roomL + 0.1, roomL + 0.55, y0, y0 + 0.42, zB + 0.3, zB + 0.9), nb, g);               // WC
      mesh(kvadr(roomL + 0.1, roomL + 0.6, y0, y0 + 0.85, zM - 1.0, zM - 0.3), nb, g);                // umyvadlo
      const kx0 = zrc ? xr - 3.4 : xl + 0.05;
      mesh(kvadr(kx0, kx0 + 3.35, y0, y0 + 0.9, zM + t, zM + t + 0.62), nb, g);                         // kuchyně
      const sx = (xl + xr) / 2 + (zrc ? 0.6 : -0.6);
      mesh(kvadr(sx - 1.1, sx + 1.1, y0, y0 + 0.42, 2.9, 3.85), nb, g);                                // pohovka
      mesh(kvadr(sx - 1.1, sx + 1.1, y0, y0 + 0.75, 3.7, 3.85), nb, g);
      const stul = new THREE.CylinderGeometry(0.5, 0.5, 0.74, 28); stul.translate(zrc ? xl + 1.1 : xr - 1.1, y0 + 0.37, 1.6);
      mesh(stul, nb, g);
      // hit box pro výběr
      const hb = new THREE.Mesh(kvadr(x0 + 0.05, x1 - 0.05, y0, podlazi === 'prizemi' ? 2.85 : RS0, Z0 - (podlazi === 'patro' ? 1.2 : 0), Z1 + (podlazi === 'patro' ? 1.2 : 0)), new THREE.MeshBasicMaterial());
      hb.visible = false; hb.userData.cislo = cislo; g.add(hb);
      const stred = new THREE.Vector3((x0 + x1) / 2, podlazi === 'prizemi' ? 1.6 : 4.6, Z1);
      byty.push({ cislo, pozice: p, podlazi, g, steny, podlaha, hit: hb, stred, m, zlata: podlazi === 'prizemi' ? zlataP : zlataU, svetla: podlazi === 'prizemi' ? svetlaP : svetlaU });
    }
  }

  // pavlač na severu (podkroví) se schodišti na obou štítech
  const pav = new THREE.Group(); patroG.add(pav);
  const zPav0 = Z0 - 1.2;
  mesh(kvadr(-L / 2 - 1.1, L / 2 + 1.1, U0 - 0.22, U0, zPav0, Z0), mat.strecha, pav);
  // zábradlí: horní madlo + tenké svislice
  const zabradli = (x0, x1, z, y, parent) => {
    mesh(kvadr(x0, x1, y + 1.0, y + 1.04, z - 0.02, z + 0.02), mat.ram, parent, true);
    const n = Math.max(2, Math.round((x1 - x0) / 0.14));
    const gi = new THREE.BoxGeometry(0.018, 1.0, 0.018);
    const im = new THREE.InstancedMesh(gi, mat.ram, n + 1); im.castShadow = true;
    const mm = new THREE.Matrix4();
    for (let i = 0; i <= n; i++) { mm.makeTranslation(x0 + (x1 - x0) * i / n, y + 0.5, z); im.setMatrixAt(i, mm); }
    parent.add(im);
  };
  zabradli(-L / 2 - 1.1, L / 2 + 1.1, zPav0 + 0.04, U0, pav);
  for (let i = 0; i <= N; i++) {   // sloupky pod pavlačí
    const x = -L / 2 - 0.9 + i * (L + 1.8) / N;
    mesh(kvadr(x - 0.09, x + 0.09, -0.3, U0 - 0.22, zPav0 + 0.05, zPav0 + 0.23), mat.strecha, pav);
  }
  for (const s of [-1, 1]) {      // schodiště podél štítů
    const xs0 = s < 0 ? -L / 2 - 1.1 : L / 2 + 0.1, xs1 = xs0 + 1.0;
    const stupnu = 15, beh = 4.2;
    for (let i = 0; i < stupnu; i++) {
      const y1 = U0 - (i + 1) * U0 / (stupnu + 1);
      const z = Z0 + i * beh / stupnu;
      mesh(kvadr(xs0, xs1, y1 - 0.06, y1 + 0.0, z, z + beh / stupnu + 0.02), mat.strecha, pav);
    }
    const xz = s < 0 ? xs0 + 0.02 : xs1 - 0.02;
    const lin = new THREE.BoxGeometry(0.03, 0.03, Math.hypot(beh, U0));
    const madlo = new THREE.Mesh(lin, mat.ram); madlo.castShadow = true;
    madlo.position.set(xz, U0 / 2 + 1.0, Z0 + beh / 2); madlo.rotation.x = Math.atan2(U0, beh); pav.add(madlo);
  }

  // balkony na jihu (podkroví) s dělicími stěnami
  const bal = new THREE.Group(); patroG.add(bal);
  mesh(kvadr(-L / 2, L / 2, U0 - 0.22, U0, Z1, Z1 + 1.2), mat.strecha, bal);
  zabradli(-L / 2, L / 2, Z1 + 1.16, U0, bal);
  for (let i = 1; i < N; i++) mesh(kvadr(-L / 2 + i * W - 0.04, -L / 2 + i * W + 0.04, U0, U0 + 1.9, Z1, Z1 + 1.2), mat.strecha, bal);

  // střechy (dvě pultové, vyšší jižní, mezi nimi světlíkový pás)
  const nS = (RN1 - RN0) / (D / 2), sS = (RS0 - RS1) / (D / 2), tl = 0.3, pres = 0.6, stit = 0.45;
  const sever = [[Z0 - pres, RN0 - pres * nS], [0.18, RN1 + 0.18 * nS], [0.18, RN1 + 0.18 * nS + tl], [Z0 - pres, RN0 - pres * nS + tl]];
  const jih = [[-0.04, RS0 + 0.04 * sS], [Z1 + pres, RS1 - pres * sS], [Z1 + pres, RS1 - pres * sS + tl], [-0.04, RS0 + 0.04 * sS + tl]];
  mesh(prisma(sever, -L / 2 - stit, L / 2 + stit), mat.strecha, strechaG);
  mesh(prisma(jih, -L / 2 - stit, L / 2 + stit), mat.strecha, strechaG);
  mesh(kvadr(-L / 2, L / 2, RN1 + 0.18 * nS + tl - 0.02, RS0 + 0.02, 0.02, 0.1), mat.cleristory, strechaG, false);
  // štítové zdi podkroví nad stropem posledního bytu nejsou potřeba (boční zdi bytů to kryjí)

  // zahrádky přízemních bytů
  const zahr = new THREE.Group(); scene.add(zahr);
  const hloubka = 10.3;
  for (let p = 1; p <= N; p++) {
    const x0 = -L / 2 + (p - 1) * W, x1 = x0 + W;
    mesh(kvadr(x0 + 0.08, x1 - 0.08, -0.31, -0.27, Z1 + 0.0, Z1 + 2.2), mat.dlazba, zahr, false);
    mesh(kvadr(x0 + 0.08, x1 - 0.08, -0.31, -0.285, Z1 + 2.2, Z1 + hloubka), mat.travnik, zahr, false);
    if (p > 1) mesh(kvadr(x0 - 0.05, x0 + 0.05, -0.31, 0.12, Z1 + 2.2, Z1 + hloubka), mat.zivyplot, zahr);
  }
  mesh(kvadr(-L / 2 - 0.05, L / 2 + 0.05, -0.31, 0.12, Z1 + hloubka, Z1 + hloubka + 0.1), mat.zivyplot, zahr);
  for (const x of [-L / 2 - 0.05, L / 2 - 0.05]) mesh(kvadr(x, x + 0.1, -0.31, 0.12, Z1 + 1.3, Z1 + hloubka), mat.zivyplot, zahr);
  // stromy jako modelářské koule (ilustrační)
  const strom = (x, z, r = 1.6, h = 2.2) => {
    const k = new THREE.CylinderGeometry(0.07, 0.1, h + r, 8); k.translate(x, -0.3 + (h + r) / 2, z); mesh(k, mat.kmen, zahr);
    const c = new THREE.IcosahedronGeometry(r, 4); c.scale(1, 1.18, 1); c.translate(x, -0.3 + h + r, z); mesh(c, mat.koruna, zahr);
  };
  if (opt.stromy !== false) [[-24.5, 8, 1.5, 2.3], [-24, 13.5, 1.15, 1.9], [24.6, -4, 1.6, 2.4], [24.2, 1.5, 1.2, 2.0], [-9, -9.5, 1.3, 2.1], [11, -9.8, 1.1, 1.9], [24.5, 15.5, 1.3, 2.1]].forEach(a => strom(...a));

  // ---------- kamera a ovládání ----------
  const camera = new THREE.PerspectiveCamera(opt.fov || 30, 1, 0.5, 400);
  const cil = new THREE.Vector3(0, 2.2, 1.5);
  camera.position.set(-34, 26, 58);
  let controls = null;
  if (opt.ovladani) {
    controls = new OrbitControls(camera, canvas);
    controls.target.copy(cil);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 26; controls.maxDistance = 95;
    controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.35;
    controls.zoomToCursor = false;
    controls.addEventListener('change', () => pozadej());
    controls.addEventListener('start', () => { aktivni = true; pozadej(); });
    controls.addEventListener('end', () => { aktivni = false; pozadej(); });
  }

  // ---------- stav ----------
  let rezim = 'dum', vybrany = null, najety = null, filtr = () => true, aktivni = false;
  const anim = { patro: 0, strecha: 0, rezP: 0, rezU: 0 }, cilAnim = { ...anim };

  function nastavMaterialy() {
    for (const b of byty) {
      const vyb = vybrany === b.cislo, naj = najety === b.cislo, ok = filtr(b.cislo);
      const m = vyb || naj ? b.zlata : (ok && filtrAktivni ? b.svetla : b.m.omitka);
      for (const s of b.steny) s.material = m;
    }
  }
  let filtrAktivni = false;

  function velikost() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    pozadej();
  }

  let ceka = false;
  function pozadej() {
    if (ceka) return; ceka = true;
    requestAnimationFrame(snimek);
  }
  // plynulý přelet kamery (bez nekonečné smyčky: běží jen do konce přeletu)
  const let_ = { t: 1, t0: 0, ms: 900, p0: new THREE.Vector3(), p1: new THREE.Vector3(), c0: new THREE.Vector3(), c1: new THREE.Vector3() };
  const cilNyni = () => (controls ? controls.target : cil);
  function letKamera(pos, target, ms = 900) {
    let_.p0.copy(camera.position); let_.p1.set(...pos);
    let_.c0.copy(cilNyni()); let_.c1.set(...(target || cilNyni().toArray()));
    let_.ms = opt.bezAnimace ? 0 : ms; let_.t0 = performance.now(); let_.t = 0;
    pozadej();
  }
  function otoc(uhel) {
    const t = cilNyni(), v = camera.position.clone().sub(t);
    v.applyAxisAngle(new THREE.Vector3(0, 1, 0), uhel);
    letKamera(t.clone().add(v).toArray(), t.toArray(), 650);
  }
  function krok(a, b, k) { return Math.abs(b - a) < 0.001 ? b : a + (b - a) * k; }
  function snimek() {
    ceka = false;
    let dal = false;
    for (const k in anim) { const n = krok(anim[k], cilAnim[k], 0.14); if (n !== anim[k]) { anim[k] = n; dal = true; } }
    // patro a střecha odjíždějí nahoru a mizí
    patroG.position.y = anim.patro * 6; patroG.visible = anim.patro < 0.98;
    strechaG.position.y = anim.strecha * 7; strechaG.visible = anim.strecha < 0.98;
    for (const g of [patroG, strechaG]) g.traverse(o => { if (o.material && !Array.isArray(o.material)) { /* bez průhlednosti: čistší stíny */ } });
    planeP.constant = 1000 - anim.rezP * (1000 - CUT);
    planeU.constant = 1000 - anim.rezU * (1000 - (U0 + CUT));
    if (let_.t < 1) {
      let_.t = let_.ms ? Math.min(1, (performance.now() - let_.t0) / let_.ms) : 1;
      const e = 1 - Math.pow(1 - let_.t, 3);
      camera.position.lerpVectors(let_.p0, let_.p1, e);
      const c = new THREE.Vector3().lerpVectors(let_.c0, let_.c1, e);
      if (controls) controls.target.copy(c); else cil.copy(c);
      camera.lookAt(c);
      if (let_.t < 1) dal = true;
    }
    if (controls && let_.t >= 1) { if (controls.update()) dal = true; }
    renderer.render(scene, camera);
    if (dal || aktivni) pozadej();
    opt.poSnimku && opt.poSnimku();
  }

  function nastavRezim(r) {
    rezim = r;
    cilAnim.patro = r === 'prizemi' ? 1 : 0;
    cilAnim.strecha = r === 'dum' ? 0 : 1;
    cilAnim.rezP = r === 'prizemi' ? 1 : 0;
    cilAnim.rezU = r === 'patro' ? 1 : 0;
    if (opt.bezAnimace) Object.assign(anim, cilAnim);
    pozadej();
  }

  // výběr myší / prstem
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function trefa(ev) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const cile = byty.filter(b => (b.podlazi === 'prizemi' ? rezim !== 'patro' || true : rezim !== 'prizemi')).map(b => b.hit);
    const hity = ray.intersectObjects(cile, false);
    // v režimu přízemí ignoruj patro, v režimu patro ignoruj přízemí
    for (const h of hity) {
      const b = byty.find(x => x.hit === h.object);
      if (rezim === 'prizemi' && b.podlazi !== 'prizemi') continue;
      if (rezim === 'patro' && b.podlazi !== 'patro') continue;
      return b.cislo;
    }
    return null;
  }
  if (opt.ovladani || opt.vyber) {
    let dolu = null;
    canvas.addEventListener('pointermove', (ev) => {
      if (ev.pointerType !== 'mouse' || ev.buttons) return;
      const c = trefa(ev);
      if (c !== najety) { najety = c; nastavMaterialy(); canvas.style.cursor = c ? 'pointer' : 'grab'; opt.priNajeti && opt.priNajeti(c); pozadej(); }
    });
    canvas.addEventListener('pointerleave', () => { if (najety) { najety = null; nastavMaterialy(); opt.priNajeti && opt.priNajeti(null); pozadej(); } });
    canvas.addEventListener('pointerdown', (ev) => { dolu = [ev.clientX, ev.clientY]; });
    canvas.addEventListener('pointerup', (ev) => {
      if (!dolu || Math.hypot(ev.clientX - dolu[0], ev.clientY - dolu[1]) > 6) return;
      const c = trefa(ev);
      if (c) { vybrany = c; nastavMaterialy(); opt.priVyberu && opt.priVyberu(c); pozadej(); }
    });
  }

  function projekce(cislo) {
    const b = byty.find(x => x.cislo === cislo); if (!b) return null;
    const v = b.stred.clone(); v.y += (b.podlazi === 'patro' ? patroG.position.y : 0);
    v.project(camera);
    return { x: (v.x + 1) / 2 * canvas.clientWidth, y: (1 - v.y) / 2 * canvas.clientHeight, vidi: v.z < 1 };
  }

  if (typeof ResizeObserver !== 'undefined' && !opt.pevnaVelikost) new ResizeObserver(velikost).observe(canvas);
  velikost();
  nastavMaterialy();

  return {
    renderer, scene, camera, controls, slunce, byty, BARVY, strechaG, patroG,
    render: () => { renderer.render(scene, camera); },
    pozadej, velikost,
    nastavRezim, rezim: () => rezim,
    vyber(c) { vybrany = c; nastavMaterialy(); pozadej(); },
    najed(c) { najety = c; nastavMaterialy(); pozadej(); },
    filtruj(fn) { filtr = fn || (() => true); filtrAktivni = !!fn; nastavMaterialy(); pozadej(); },
    kamera(pos, target) { camera.position.set(...pos); const t = target ? new THREE.Vector3(...target) : cil; camera.lookAt(t); if (controls) { controls.target.copy(t); controls.update(); } pozadej(); },
    projekce, letKamera, otoc,
    setSize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
    THREE,
  };
}
