/* ---------- Escena, camara y render ---------- */
const cont = document.getElementById("container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  55, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 11, 50);
const renderer = new THREE.WebGLRenderer(
  { antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
cont.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(
  camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 20;
controls.maxDistance = 110;
controls.target.set(0, 9, 0);

const todo = new THREE.Group();   // todo lo que crece al inicio
todo.visible = false;             // aparece al soltar la flecha
scene.add(todo);
const orbita = new THREE.Group(); // frases que giran
todo.add(orbita);

/* ---------- Ayudas ---------- */
function puntos(cant, fn, size) {
  const pos = new Float32Array(cant * 3);
  const col = new Float32Array(cant * 3);
  const c = new THREE.Color();
  for (let i = 0; i < cant; i++) {
    pos.set(fn(i, c), i * 3);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position",
    new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color",
    new THREE.BufferAttribute(col, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({
    size: size, vertexColors: true,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
}

function lienzo(w, h) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  return cv;
}

function sprite(cv, w, h, suma) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(cv),
    transparent: true, depthWrite: false,
    blending: suma ? THREE.AdditiveBlending
                   : THREE.NormalBlending
  }));
  s.scale.set(w, h, 1);
  return s;
}

function brillo(color) {
  const cv = lienzo(128, 128);
  const x = cv.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, color);
  g.addColorStop(0.3, "rgba(0,150,255,0.45)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return cv;
}

/* ---------- Galaxia en espiral ---------- */
const galaxia = puntos(30000, (i, c) => {
  const r = Math.pow(Math.random(), 1.3) * 34;
  const ang = r * 0.3 + (i % 3) * (Math.PI * 2 / 3);
  const d = () => (Math.random() - 0.5) * r * 0.28;
  c.setHSL(0.55 + Math.random() * 0.05, 1,
    Math.max(0.2, 0.8 - r / 45 + Math.random() * 0.15));
  return [Math.cos(ang) * r + d(), d() * 0.25,
          Math.sin(ang) * r + d()];
}, 0.2);
todo.add(galaxia);

// brillo del centro y columna de luz
const centro = sprite(brillo("rgba(255,255,255,1)"),
  26, 12, true);
centro.position.set(0, 0.5, 0);
todo.add(centro);
const columna = sprite(brillo("rgba(150,255,255,1)"),
  5, 34, true);
columna.position.set(0, 14, 0);
columna.material.opacity = 0.55;
todo.add(columna);

// estrellas de fondo
scene.add(puntos(3000, (i, c) => {
  c.set(0xffffff);
  return [(Math.random() - 0.5) * 300,
          (Math.random() - 0.5) * 300,
          (Math.random() - 0.5) * 300];
}, 0.45));

// cuadritos blancos que flotan
const cuadros = puntos(40, (i, c) => {
  c.set(0xffffff);
  return [(Math.random() - 0.5) * 70,
          Math.random() * 40,
          (Math.random() - 0.5) * 70];
}, 1.1);
todo.add(cuadros);

/* ---------- Corazon (solo el contorno) ---------- */
const corazon = puntos(2800, (i, c) => {
  const t = Math.random() * Math.PI * 2;
  const k = 1 + (Math.random() - 0.5) * 0.1;
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t)
    - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  c.setHSL(0.5, 1, 0.6 + Math.random() * 0.3);
  const j = () => (Math.random() - 0.5) * 0.5;
  return [x * 0.55 * k + j(), y * 0.55 * k + j(), j() * 3];
}, 0.2);
corazon.position.set(0, 17, 0);
todo.add(corazon);

/* ---------- Rosas azules y hojas ---------- */
function rosa(h) {
  const cv = lienzo(160, 160);
  const x = cv.getContext("2d");
  x.translate(80, 80);
  for (let k = 0; k < 4; k++) {
    const n = 7 - k;
    const R = 62 - k * 14;
    for (let i = 0; i < n; i++) {
      x.save();
      x.rotate(i * Math.PI * 2 / n + k * 0.5);
      x.beginPath();
      x.ellipse(0, -R * 0.55, R * 0.42, R * 0.6,
        0, 0, 7);
      x.fillStyle = "hsl(" + h + ",90%," +
        (32 + k * 9) + "%)";
      x.fill();
      x.strokeStyle = "hsla(" + h + ",100%,85%,0.5)";
      x.lineWidth = 1.5;
      x.stroke();
      x.restore();
    }
  }
  x.beginPath();
  x.arc(0, 0, 7, 0, 7);
  x.fillStyle = "hsl(" + h + ",90%,72%)";
  x.fill();
  return cv;
}

function hoja() {
  const cv = lienzo(128, 128);
  const x = cv.getContext("2d");
  x.translate(64, 64);
  [-0.7, 0.7].forEach(a => {
    x.save();
    x.rotate(a);
    x.beginPath();
    x.ellipse(0, -30, 13, 32, 0, 0, 7);
    x.fillStyle = "#1c9b4a";
    x.fill();
    x.restore();
  });
  return cv;
}

const flotan = [];
for (let i = 0; i < 18; i++) {
  const f = sprite(rosa(200 + Math.random() * 25),
    5 + Math.random() * 4, 5 + Math.random() * 4);
  const a = Math.random() * Math.PI * 2;
  const r = 8 + Math.random() * 24;
  f.position.set(Math.cos(a) * r,
    2 + Math.random() * 12, Math.sin(a) * r);
  f.userData = { y: f.position.y, f: Math.random() * 6 };
  orbita.add(f);
  flotan.push(f);
  if (i % 2 === 0) {
    const h = sprite(hoja(), 4, 4);
    h.position.copy(f.position).add(
      new THREE.Vector3(1.5, -1, 0));
    h.userData = { y: h.position.y, f: f.userData.f };
    orbita.add(h);
    flotan.push(h);
  }
}

// bolitas azules que suben
const orbes = [];
for (let i = 0; i < 45; i++) {
  const o = sprite(brillo("rgba(90,180,255,1)"),
    1.5 + Math.random() * 2, 1.5 + Math.random() * 2, true);
  o.position.set((Math.random() - 0.5) * 70,
    Math.random() * 32, (Math.random() - 0.5) * 70);
  todo.add(o);
  orbes.push(o);
}

/* ---------- Frases y cartas ---------- */
function texto(txt) {
  const cv = lienzo(512, 128);
  const x = cv.getContext("2d");
  x.font = "italic bold 54px Arial";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.shadowColor = "#00eaff";
  x.shadowBlur = 16;
  x.fillStyle = "#ffffff";
  x.fillText(txt + " \u{1F499}", 256, 64);
  return cv;
}

// CAMBIA AQUI tus frases y los mensajes de las cartas
const frases = [
  ["Eres mi sol", "AMOR",
    ["Eres tu ese", "capitulo de mi vida,",
     "donde mi corazon", "se detuvo y dijo:",
     "\"Aqui me quedo\""]],
  ["Te Amo", "TE AMO",
    ["Te amo mas de lo", "que las palabras",
     "pueden decir"]],
  ["Mi Amor", "MI AMOR",
    ["Contigo todo", "es mas bonito"]],
  ["Eres preciosa", "PRECIOSA",
    ["Tu sonrisa ilumina", "todos mis dias"]],
  ["Siempre juntos", "JUNTOS",
    ["Quiero caminar", "a tu lado", "toda la vida"]],
  ["Eres unica", "UNICA",
    ["Nadie como tu,", "gracias por existir"]],
  ["Me encantas", "ME ENCANTAS",
    ["Me encanta tu forma", "de ser"]],
  ["Amor de mi vida", "MI VIDA",
    ["Gracias por estar", "en mi vida"]],
  ["Eres mi todo", "MI TODO",
    ["Eres mi lugar", "favorito en", "el mundo"]]
];

const clicks = [];
frases.forEach((f, i) => {
  const grande = i % 3 === 1;
  const s = sprite(texto(f[0]),
    grande ? 14 : 9.5, grande ? 3.5 : 2.4);
  const a = (i / frases.length) * Math.PI * 2;
  const r = 12 + Math.random() * 16;
  s.position.set(Math.cos(a) * r,
    1 + Math.random() * 11, Math.sin(a) * r);
  s.userData = { t: f[1], l: f[2] };
  orbita.add(s);
  clicks.push(s);
});

// frase dentro del corazon
const dentro = sprite(texto("Te amo"), 9, 2.2);
dentro.position.set(0, 18, 0.5);
dentro.userData = { t: "TE AMO",
  l: ["Eres lo mejor", "que me paso"] };
todo.add(dentro);
clicks.push(dentro);

/* ---------- Dibujo de la carta ---------- */
function corazonCarta(x, cx, cy, s, rot) {
  x.save();
  x.translate(cx, cy);
  x.rotate(rot);
  x.scale(s, s);
  x.beginPath();
  x.moveTo(0, -30);
  x.bezierCurveTo(-5, -50, -45, -50, -45, -15);
  x.bezierCurveTo(-45, 15, -10, 35, 0, 50);
  x.bezierCurveTo(10, 35, 45, 15, 45, -15);
  x.bezierCurveTo(45, -50, 5, -50, 0, -30);
  const g = x.createLinearGradient(-40, -40, 40, 50);
  g.addColorStop(0, "#e0203a");
  g.addColorStop(1, "#8f0c20");
  x.fillStyle = g;
  x.fill();
  x.restore();
}

function carta(titulo, lineas) {
  const cv = lienzo(600, 1050);
  const x = cv.getContext("2d");
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, 600, 1050);
  corazonCarta(x, 430, 150, 2.6, -0.1);
  corazonCarta(x, 530, 75, 1.4, 0.45);
  corazonCarta(x, 545, 215, 1.7, 0.25);
  x.strokeStyle = "#222";
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(30, 150);
  x.bezierCurveTo(80, 110, 120, 190, 170, 140);
  x.stroke();
  x.textAlign = "center";
  x.fillStyle = "#111";
  x.font = "italic 900 84px Georgia";
  x.fillText(titulo, 300, 380);
  x.font = "600 48px Caveat, cursive";
  lineas.forEach((l, i) =>
    x.fillText(l, 300, 480 + i * 66));
  return cv.toDataURL("image/png");
}

/* ---------- Tocar una frase = abrir carta ---------- */
const modal = document.getElementById("modalCarta");
const img = document.getElementById("cartaImg");
document.getElementById("cerrarModal").onclick =
  () => modal.classList.remove("show");

function abrir(d) {
  const mostrar = () => {
    img.src = carta(d.t, d.l);
    modal.classList.add("show");
  };
  document.fonts.load("48px Caveat").then(mostrar, mostrar);
}

const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let ini = [0, 0];
const el = renderer.domElement;
el.addEventListener("pointerdown", e => {
  ini = [e.clientX, e.clientY];
});
el.addEventListener("pointerup", e => {
  const mov = Math.hypot(e.clientX - ini[0],
                         e.clientY - ini[1]);
  if (mov > 6) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(clicks)[0];
  if (hit) abrir(hit.object.userData);
});

/* ---------- Musica ---------- */
// suena desde que abres la pagina, empezando en INICIO_MUSICA
const audio = document.getElementById("miAudio");

// CAMBIA AQUI el segundo donde empieza la cancion
// (0 = desde el principio de tu audio recortado).
const INICIO_MUSICA = 0;

let sonando = false;

function subirVolumen() {             // sube suave (2 seg)
  let v = 0;
  const sube = setInterval(() => {
    v = Math.min(v + 0.05, 1);
    audio.volume = v;
    if (v >= 1) clearInterval(sube);
  }, 100);
}

function arrancarMusica() {
  if (!audio || sonando) return;
  sonando = true;
  try {
    audio.currentTime = INICIO_MUSICA;
    audio.volume = 0;                 // empieza en silencio...
    const pr = audio.play();
    if (pr && pr.then) {
      pr.then(subirVolumen)           // ...y sube el volumen
        .catch(() => { sonando = false; });  // bloqueada: reintenta
    } else {
      subirVolumen();
    }
  } catch (err) { sonando = false; }
}

// 1) intenta sonar apenas abre la pagina
arrancarMusica();
// 2) si el navegador la bloquea, suena con el primer toque o clic
["pointerdown", "pointerup", "keydown"].forEach(ev =>
  addEventListener(ev, arrancarMusica));

/* ---------- Animacion ---------- */
const reloj = new THREE.Clock();
let empezo = false;
let t0 = 0;
function animar() {
  requestAnimationFrame(animar);
  const t = reloj.getElapsedTime();
  const p = empezo ? Math.min((t - t0) / 5, 1) : 0;
  todo.scale.setScalar(0.05 + 0.95 * (1 - Math.pow(1 - p, 3)));
  galaxia.rotation.y = t * 0.06;
  orbita.rotation.y = t * 0.03;
  corazon.scale.setScalar(1 + Math.sin(t * 3) * 0.04);
  flotan.forEach(f => {
    f.position.y = f.userData.y +
      Math.sin(t + f.userData.f);
  });
  orbes.forEach(o => {
    o.position.y += 0.02;
    if (o.position.y > 34) o.position.y = 0;
  });
  cuadros.rotation.y = t * 0.02;
  controls.update();
  renderer.render(scene, camera);
}
animar();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ---------- Pantalla de inicio: arco y flecha ---------- */
const intro = document.getElementById("intro");
const meta = document.getElementById("meta");
const pista = document.getElementById("pista");
const grupo = document.getElementById("arcoG");
const cuerda = document.getElementById("cuerda");
const flecha = document.getElementById("flecha");
const vuelo = document.getElementById("vuelo");
const TEXTO = pista.innerHTML;

let px = 0;            // posicion del arco
let py = 0;
let ang = 0;           // hacia donde apunta la flecha
let tira = 0;          // cuanto se jala la cuerda
let estado = "listo";  // listo, tirando, volando, acierto

function centro2(el) {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}

function dibujar() {
  grupo.setAttribute("transform", "translate(" + px + " " +
    py + ") rotate(" + (ang * 180 / Math.PI) + ")");
  const n = -25 - tira;
  cuerda.setAttribute("points",
    "-25,-65 " + n + ",0 -25,65");
  flecha.setAttribute("transform", "translate(" + n + " 0)");
  flecha.setAttribute("visibility",
    (estado === "listo" || estado === "tirando")
      ? "visible" : "hidden");
}

function medidas() {   // el arco apunta al corazon al inicio
  px = innerWidth * 0.2;
  py = innerHeight * 0.78;
  if (estado === "listo") {
    const m = centro2(meta);
    ang = Math.atan2(m[1] - py, m[0] - px);
  }
  dibujar();
}

function empezar() {
  arrancarMusica();               // por si aun no sonaba
  empezo = true;
  t0 = reloj.getElapsedTime();
  todo.visible = true;
  intro.classList.add("fuera");
}

function distSeg(cx, cy, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l = dx * dx + dy * dy || 1;
  let t = ((cx - x1) * dx + (cy - y1) * dy) / l;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(cx - (x1 + t * dx), cy - (y1 + t * dy));
}

function reiniciar() {
  estado = "listo";
  tira = 0;
  vuelo.setAttribute("visibility", "hidden");
  medidas();
}

function fallo() {
  pista.textContent = "Casi... intenta otra vez";
  setTimeout(() => { pista.innerHTML = TEXTO; }, 1800);
  reiniciar();
}

function acierto() {
  estado = "acierto";
  meta.classList.add("golpe");
  setTimeout(empezar, 450);
}

function tirar(e) {
  const vx = e.clientX - px;
  const vy = e.clientY - py;
  const dist = Math.hypot(vx, vy);
  tira = Math.max(0, Math.min(dist - 25, 90));
  if (dist > 5) ang = Math.atan2(-vy, -vx);
  dibujar();
}

function soltar() {
  if (estado !== "tirando") return;
  if (tira < 20) { reiniciar(); return; }
  estado = "volando";

  arrancarMusica();   // por si el navegador aun no la dejo sonar

  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const deg = ang * 180 / Math.PI;
  const v = 900 + tira * 8;
  let x = px + dx * (-25 - tira);
  let y = py + dy * (-25 - tira);
  tira = 0;
  dibujar();
  vuelo.setAttribute("transform", "translate(" + x + " " +
    y + ") rotate(" + deg + ")");
  vuelo.setAttribute("visibility", "visible");
  let ant = performance.now();
  function vuela(ahora) {
    const dt = Math.min((ahora - ant) / 1000, 0.05);
    ant = ahora;
    const x0 = x + dx * 130;
    const y0 = y + dy * 130;
    x += dx * v * dt;
    y += dy * v * dt;
    const x1 = x + dx * 130;
    const y1 = y + dy * 130;
    vuelo.setAttribute("transform", "translate(" + x + " " +
      y + ") rotate(" + deg + ")");
    const m = centro2(meta);
    if (distSeg(m[0], m[1], x0, y0, x1, y1) < 55) {
      acierto();
      return;
    }
    if (x1 < -150 || x1 > innerWidth + 150 ||
        y1 < -150 || y1 > innerHeight + 150) {
      fallo();
      return;
    }
    requestAnimationFrame(vuela);
  }
  requestAnimationFrame(vuela);
}

intro.addEventListener("pointerdown", e => {
  if (estado !== "listo") return;
  if (Math.hypot(e.clientX - px, e.clientY - py) > 130) return;
  estado = "tirando";
  intro.setPointerCapture(e.pointerId);
  tirar(e);
});
intro.addEventListener("pointermove", e => {
  if (estado === "tirando") tirar(e);
});
intro.addEventListener("pointerup", soltar);
intro.addEventListener("pointercancel", soltar);

addEventListener("resize", medidas);
medidas();