/* ============================================================
   FORJA · app.js
   Plan de Mario sacado de su estudio (17-nov-2026):
   fase 1 = entreno en casa al levantarse + proteína y agua.
   Fase 2 y 3 se desbloquean solas si cumple el 70 % durante 14 días.
   ============================================================ */
'use strict';

const PLAN = { kcal: 1800, prot: 130, vasos: 8, objetivo: 64, pesoIni: 70, altura: 175 };
const DIAS_C = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_L = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SLOTS_H = [[10, 30], [15, 0], [23, 0]];      // avisos: tras levantarse, media tarde, cierre

/* ---------- ejercicios ---------- */
const EJ = {
  A: [
    { n: 'Sentadillas', r: 15, how: 'Pies a la anchura de los hombros, baja como si te sentaras en una silla. Talones en el suelo y pecho arriba.' },
    { n: 'Flexiones', r: 8, how: 'Cuerpo recto de cabeza a talones. Si no llegas a 8 bien hechas, apoya las rodillas.' },
    { n: 'Zancadas', r: 10, lado: 1, how: 'Paso largo hacia delante y baja hasta que la rodilla de atrás casi toque el suelo.' },
    { n: 'Puente de glúteo', r: 15, how: 'Tumbado boca arriba, sube la cadera y aprieta el glúteo un segundo arriba.' },
    { n: 'Plancha', s: 30, how: 'Apoyado en antebrazos, cuerpo recto. Aprieta abdomen y glúteo, que no se hunda la cadera.' },
  ],
  B: [
    { n: 'Sentadilla búlgara', r: 8, lado: 1, how: 'Pie de atrás apoyado en una silla o el sofá. Baja recto con la pierna de delante.' },
    { n: 'Fondos en silla', r: 8, how: 'Manos en el borde de una silla, piernas estiradas. Baja doblando los codos hacia atrás.' },
    { n: 'Flexiones inclinadas', r: 10, how: 'Manos en el sofá o la mesa. Pecho al borde y arriba. Cuando sean fáciles, pasa a flexiones normales.' },
    { n: 'Superman', r: 12, how: 'Boca abajo, levanta brazos y piernas a la vez y aguanta un segundo arriba.' },
    { n: 'Escaladores', s: 30, how: 'Posición de flexión y rodillas al pecho, rápido, sin subir la cadera.' },
  ],
};
const ROTA = ['A', 'B', 'A', 'B', 'A', 'libre', 'descanso'];   // L..D

/* ---------- comidas (≈ 800–900 kcal y 60+ g de proteína cada una) ---------- */
const PLATOS = [
  { n: 'Pollo con arroz y pimientos', k: 820, p: 66, i: ['250 g de pechuga de pollo', '100 g de arroz (en seco)', 'Pimiento y cebolla', '1 cucharada de aceite'], c: 'Pollo en tiras a la sartén con el pimiento y la cebolla. Arroz hervido 12 minutos.' },
  { n: 'Pasta con atún y tomate', k: 830, p: 61, i: ['110 g de pasta (en seco)', '2 latas de atún al natural', '200 g de tomate triturado', '30 g de queso rallado'], c: 'Pasta 10 minutos. Tomate caliente con el atún. Queso por encima.' },
  { n: 'Ternera con patatas y ensalada', k: 790, p: 61, i: ['250 g de ternera picada 5 %', '250 g de patata o boniato', 'Ensalada al gusto', '1 cucharada de aceite', '50 g de pan'], c: 'Hamburguesas planas a la sartén. Patata 8 minutos al microondas tapada.' },
  { n: 'Huevos con patata y jamón', k: 860, p: 61, i: ['4 huevos', '300 g de patata', '80 g de jamón serrano', '1 cucharada de aceite'], c: 'Patata en rodajas al microondas 8 minutos y dorada en la sartén. Huevos a la plancha encima y el jamón.' },
  { n: 'Salmón con arroz y skyr', k: 820, p: 62, i: ['200 g de salmón', '80 g de arroz (en seco)', 'Ensalada', '1 skyr natural de postre'], c: 'Salmón 4 minutos por lado, con la piel hacia abajo primero.' },
  { n: 'Lentejas con pollo', k: 785, p: 67, i: ['1 bote de lentejas cocidas (400 g)', '150 g de pollo o pavo', '1 cucharada de aceite', '50 g de pan'], c: 'Lentejas calientes con el pollo a la plancha troceado dentro. Pimentón y comino.' },
  { n: 'Burritos de pollo', k: 760, p: 70, i: ['2 tortillas de trigo', '200 g de pollo', 'Maíz y lechuga', '50 g de queso rallado', 'Salsa de tomate o yogur'], c: 'Pollo en tiras con especias, todo dentro de las tortillas y a la sartén 1 minuto por lado.' },
  { n: 'Merluza con patata y skyr', k: 730, p: 76, i: ['300 g de merluza o bacalao', '300 g de patata', '1 cucharada de aceite', '1 skyr con una cucharadita de miel'], c: 'Merluza a la plancha con ajo y perejil. Patata al microondas.' },
];
const COMPRA = ['Pechuga de pollo', 'Ternera picada 5 %', 'Huevos (docena)', 'Atún al natural', 'Salmón', 'Merluza congelada', 'Jamón serrano', 'Skyr natural', 'Lentejas en bote', 'Arroz', 'Pasta', 'Patatas', 'Tortillas de trigo', 'Pan', 'Tomate triturado', 'Pimientos y cebolla', 'Ensalada en bolsa', 'Queso rallado', 'Aceite de oliva', 'Agua (garrafa)'];

/* ---------- fases ---------- */
const FASES = [
  { n: 'Fase 1 · Base', d: 'Entreno en casa al levantarte (de lunes a viernes) + proteína en tus 2 comidas + 2 litros de agua.' },
  { n: 'Fase 2 · Dormir y cabeza', d: 'Se suman: móvil fuera de la habitación a la 1:00 y 10 minutos de luz de sol nada más levantarte.' },
  { n: 'Fase 3 · Crecer', d: 'Se suma: 20 minutos de inglés al día. Después vendrán las ventas.' },
];

/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const pad = n => String(n).padStart(2, '0');
const keyDe = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const hoyKey = () => keyDe(new Date());
const deKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const sumaDias = (k, n) => { const d = deKey(k); d.setDate(d.getDate() + n); return keyDe(d); };
const entre = (a, b) => Math.round((deKey(b) - deKey(a)) / 864e5);
const dow = k => (deKey(k).getDay() + 6) % 7;           // 0 = lunes
const fmt1 = n => n.toFixed(1).replace('.', ',');
const diaN = () => Math.floor(deKey(hoyKey()).getTime() / 864e5);

let D = cargar();
function cargar() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem('forja') || 'null'); } catch (e) {}
  if (!d) d = { inicio: hoyKey(), dias: {}, pesos: {}, cintura: {}, objetivo: PLAN.objetivo, fases: { 1: hoyKey() } };
  return d;
}
function guardar() { try { localStorage.setItem('forja', JSON.stringify(D)); } catch (e) { toast('No se pudo guardar en este móvil'); } }
function dia(k) { if (!D.dias[k]) D.dias[k] = {}; return D.dias[k]; }
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }

/* ---------- fases y cumplimiento ---------- */
function faseEn(k) { let f = 1; if (D.fases[2] && k >= D.fases[2]) f = 2; if (D.fases[3] && k >= D.fases[3]) f = 3; return f; }
function habitosDe(k) {
  const f = faseEn(k), w = dow(k), lista = [];
  if (w <= 4) lista.push('ent');
  lista.push('prot', 'agua');
  if (f >= 2) lista.push('sol', 'movil');
  if (f >= 3) lista.push('ingles');
  return lista;
}
function hecho(k, h) {
  const d = D.dias[k] || {};
  if (h === 'prot') return !!(d.c1 && d.c2);
  if (h === 'agua') return (d.agua || 0) >= PLAN.vasos;
  if (h === 'ent') return !!d.ent;
  return !!d[h];
}
function completo(k) { return habitosDe(k).every(h => hecho(k, h)); }
function racha() {
  let k = hoyKey(), n = 0;
  if (!completo(k)) k = sumaDias(k, -1);
  while (k >= D.inicio && completo(k)) { n++; k = sumaDias(k, -1); }
  return n;
}
function cumplimiento(desde, dias) {
  let ok = 0, tot = 0;
  for (let i = 0; i < dias; i++) { const k = sumaDias(desde, -i); if (k < D.inicio) break; if (k === hoyKey()) continue; tot++; if (completo(k)) ok++; }
  return tot ? ok / tot : 0;
}
function revisarFase() {
  const hoy = hoyKey();
  for (const f of [2, 3]) {
    if (D.fases[f]) continue;
    const desde = D.fases[f - 1];
    if (!desde || entre(desde, hoy) < 14) return;
    if (cumplimiento(sumaDias(hoy, -1), 14) >= 0.7) { D.fases[f] = hoy; guardar(); toast('Desbloqueada la ' + FASES[f - 1].n.split(' · ')[0]); }
    return;
  }
}

/* ---------- HOY ---------- */
const NOMBRES = {
  ent: ['Entreno en casa', () => { const t = ROTA[dow(hoyKey())]; return 'Entreno ' + t + ' · ' + (semana() >= 3 ? 4 : 3) + ' rondas · nada más levantarte'; }],
  prot: ['Proteína en tus 2 comidas', () => 'La mitad del plato: pollo, carne, pescado o huevos'],
  agua: ['2 litros de agua', () => 'Toca un vaso cada vez que te bebas uno'],
  sol: ['10 min de luz al despertar', () => 'A la calle o a la ventana, sin el móvil'],
  movil: ['Móvil fuera a la 1:00', () => 'Fuera de la habitación. Te dormirás antes'],
  ingles: ['20 min de inglés', () => 'Para trabajar desde cualquier parte'],
};
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function renderHoy() {
  revisarFase();
  const k = hoyKey(), d = dia(k), w = dow(k), h = new Date().getHours();
  const f = faseEn(k), n = entre(D.inicio, k) + 1;
  $('#hoy-fecha').textContent = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase().replace('.', '');
  $('#hoy-dia').textContent = 'Día ' + n;
  $('#hoy-fase').textContent = FASES[f - 1].n + ' · semana ' + semana();

  const slot = forjaSlot(h);
  $('#coach-when').textContent = 'EL ENTRENADOR · ' + ['MAÑANA', 'TARDE', 'NOCHE'][slot];
  $('#coach-msg').textContent = forjaMsg(slot, diaN());

  $('#racha').textContent = racha();
  const lunes = sumaDias(k, -w);
  $('#semana').innerHTML = DIAS_C.map((c, i) => {
    const dk = sumaDias(lunes, i);
    let cls = 'wd';
    if (dk === k) cls += ' hoy' + (completo(dk) ? ' ok' : '');
    else if (dk < k && dk >= D.inicio) cls += completo(dk) ? ' ok' : ' mal';
    return `<div class="${cls}">${c}<i></i></div>`;
  }).join('');

  const ayer = sumaDias(k, -1), anteayer = sumaDias(k, -2);
  const av = $('#aviso-fallo');
  if (ayer >= D.inicio && !completo(ayer)) {
    av.hidden = false;
    av.textContent = (anteayer >= D.inicio && !completo(anteayer))
      ? 'Dos días seguidos sin cumplir. Así es como lo dejaste la otra vez. Hoy, como poco, la versión mínima.'
      : 'Ayer no cumpliste. Fallar uno no rompe nada. Fallar dos seguidos es empezar a dejarlo. Hoy no se falla.';
  } else av.hidden = true;

  let html = '';
  if (w === 5) html += `<div class="habit"><div class="habit-txt"><b>Sábado: actividad libre</b><span>Caminata rápida de 45 min, partido o bici. No cuenta para la racha, pero suma.</span></div></div>`;
  if (w === 6) html += `<div class="habit"><div class="habit-txt"><b>Domingo: descanso del entreno</b><span>Toca pesarte, medir la cintura y la foto. Abajo tienes el repaso.</span></div></div>`;
  habitosDe(k).forEach(hb => {
    const ok = hecho(k, hb);
    let extra = '';
    if (hb === 'prot') extra = `<div class="subchecks"><button class="mini${d.c1 ? ' on' : ''}" data-c="c1">Comida 1</button><button class="mini${d.c2 ? ' on' : ''}" data-c="c2">Comida 2</button></div>`;
    if (hb === 'agua') extra = `<div class="agua">${Array.from({ length: PLAN.vasos }, (_, i) => `<button class="vaso${i < (d.agua || 0) ? ' lleno' : ''}" data-v="${i}" aria-label="Vaso ${i + 1}"></button>`).join('')}</div>`;
    const go = hb === 'ent' ? `<button class="habit-go" data-go="entreno">Ver</button>` : '';
    const tipoEnt = hb === 'ent' && d.ent === 'minimo' ? ' (mínimo)' : '';
    html += `<div class="habit${ok ? ' done' : ''}" data-h="${hb}">
      <button class="check" data-t="${hb}" aria-label="Marcar ${NOMBRES[hb][0]}">${CHECK}</button>
      <div class="habit-txt"><b>${NOMBRES[hb][0]}${tipoEnt}</b><span>${NOMBRES[hb][1]()}</span>${extra}</div>${go}</div>`;
  });
  $('#habitos').innerHTML = html;

  $$('#habitos .check').forEach(b => b.onclick = () => marcar(b.dataset.t));
  $$('#habitos .mini').forEach(b => b.onclick = () => { d[b.dataset.c] = !d[b.dataset.c]; guardar(); renderHoy(); celebrar(); });
  $$('#habitos .vaso').forEach(b => b.onclick = () => { const i = +b.dataset.v; d.agua = (d.agua || 0) === i + 1 ? i : i + 1; guardar(); renderHoy(); celebrar(); });
  $$('#habitos .habit-go').forEach(b => b.onclick = () => irA(b.dataset.go));

  const p = D.pesos[k];
  $('#peso-input').value = p ? fmt1(p) : '';
  const m = media7(k);
  $('#peso-media').textContent = m ? 'Media de 7 días: ' + fmt1(m) + ' kg' : 'Pésate al levantarte, antes de beber nada.';

  renderDomingo();
}
function marcar(hb) {
  const d = dia(hoyKey());
  if (hb === 'prot') { const v = !(d.c1 && d.c2); d.c1 = v; d.c2 = v; }
  else if (hb === 'agua') d.agua = (d.agua || 0) >= PLAN.vasos ? 0 : PLAN.vasos;
  else if (hb === 'ent') d.ent = d.ent ? 0 : 'completo';
  else d[hb] = !d[hb];
  guardar(); renderHoy(); celebrar();
}
function celebrar() {
  if (completo(hoyKey()) && !celebrar.ya) { celebrar.ya = true; toast('Día cumplido. Racha: ' + racha() + '. Mañana, igual.'); if (navigator.vibrate) navigator.vibrate([30, 40, 30]); }
  if (!completo(hoyKey())) celebrar.ya = false;
}

$('#peso-form').addEventListener('submit', e => {
  e.preventDefault();
  const v = parseFloat($('#peso-input').value.replace(',', '.'));
  if (isNaN(v) || v < 40 || v > 150) { toast('Pon el peso en kilos, por ejemplo 70,4'); return; }
  D.pesos[hoyKey()] = v; guardar(); toast('Peso guardado'); renderHoy(); $('#peso-input').blur();
});

/* ---------- repaso del domingo ---------- */
function renderDomingo() {
  const k = hoyKey(), card = $('#card-domingo');
  if (dow(k) !== 6) { card.hidden = true; return; }
  const lunes = sumaDias(k, -6);
  let ents = 0, comp = 0;
  for (let i = 0; i < 7; i++) { const dk = sumaDias(lunes, i); if (dk < D.inicio) continue; if ((D.dias[dk] || {}).ent) ents++; if (completo(dk)) comp++; }
  const m1 = media7(k), m0 = media7(sumaDias(k, -7));
  const dif = m1 && m0 ? m1 - m0 : null;
  let ver;
  if (ents >= 5 && comp >= 6) ver = 'Semana de las buenas. No te relajes: la siguiente sube de repeticiones.';
  else if (ents >= 3) ver = 'Aprobado justo. Con esto no llegas a tu mejor forma. La semana que viene, los 5 entrenos.';
  else ver = 'Semana perdida. Sin excusas: el lunes a las 10:30 estás en el suelo haciendo sentadillas.';
  card.hidden = false;
  card.innerHTML = `<h3>Repaso de la semana</h3>
    <div class="stats">
      <div class="stat"><b>${ents}/5</b><span>entrenos</span></div>
      <div class="stat"><b>${comp}/7</b><span>días cumplidos</span></div>
      <div class="stat"><b>${dif === null ? '—' : (dif > 0 ? '+' : '') + fmt1(dif)}</b><span>kg de media</span></div>
    </div>
    <p class="veredicto">${ver}</p>
    <p class="small">Hoy toca: foto de frente, cintura y peso. Todo en Progreso.</p>`;
}

/* ---------- ENTRENO ---------- */
let modo = 'completo';
function semana() { return Math.floor(entre(D.inicio, hoyKey()) / 7) + 1; }
function rutinaHoy() {
  const k = hoyKey(), t = ROTA[dow(k)], s = semana();
  const tipo = (t === 'A' || t === 'B') ? t : (semana() % 2 ? 'A' : 'B');
  const extraR = Math.min(8, (s - 1) * 2), extraS = Math.min(30, (s - 1) * 5);
  const lista = EJ[tipo].map(e => ({ ...e, r: e.r ? e.r + (modo === 'minimo' ? 0 : extraR) : null, s: e.s ? e.s + (modo === 'minimo' ? 0 : extraS) : null }));
  const rondas = modo === 'minimo' ? 2 : (s >= 3 ? 4 : 3);
  return { t, tipo, lista: modo === 'minimo' ? lista.slice(0, 4) : lista, rondas };
}
function renderEntreno() {
  const k = hoyKey(), d = dia(k), R = rutinaHoy();
  $('#ent-titulo').textContent = R.t === 'descanso' ? 'Descanso' : R.t === 'libre' ? 'Día libre' : 'Entreno ' + R.tipo;
  $('#ent-sub').textContent = (modo === 'minimo' ? '10 min' : (R.rondas === 4 ? '30 min' : '25 min')) + ' · ' + R.rondas + ' rondas · semana ' + semana();
  $('#ent-explica').textContent = R.t === 'descanso'
    ? 'Hoy no toca. Si te apetece, aquí tienes el entreno igualmente.'
    : R.t === 'libre' ? 'Hoy toca algo libre: caminata rápida, bici o partido. Si prefieres, haz este.'
    : modo === 'minimo' ? 'Para los días malos. Vale para la racha, pero no te acostumbres.'
    : 'Haz los ejercicios seguidos, uno detrás de otro. Eso es una ronda. Descansa 1 minuto y repite.';
  $$('#ent-modo .seg-btn').forEach(b => b.classList.toggle('on', b.dataset.modo === modo));
  const hechos = d.ejs || [];
  $('#ejercicios').innerHTML = R.lista.map((e, i) => `<li class="ej${hechos.includes(i) ? ' done' : ''}" data-i="${i}">
      <div class="ej-main"><p class="ej-n">${e.n}</p><p class="ej-how">${e.how}</p></div>
      <div class="ej-reps">${e.r ? e.r : e.s + ' s'}<small>${e.lado ? 'POR PIERNA' : e.r ? 'REPES' : 'AGUANTA'}</small></div></li>`).join('');
  $$('#ejercicios .ej').forEach(li => li.onclick = () => {
    const i = +li.dataset.i, arr = d.ejs || [];
    d.ejs = arr.includes(i) ? arr.filter(x => x !== i) : [...arr, i]; guardar(); renderEntreno();
  });
  const b = $('#ent-hecho');
  b.textContent = d.ent ? 'Hecho ✓ · ' + (d.ent === 'minimo' ? 'mínimo' : 'completo') : 'Entreno hecho';
  b.classList.toggle('hecho', !!d.ent);
  const w = dow(k);
  $('#plan-semana').innerHTML = ROTA.map((t, i) => `<div class="ps${i === w ? ' hoy' : ''}"><span>${DIAS_L[i]}</span><span>${t === 'descanso' ? 'Descanso' : t === 'libre' ? 'Actividad libre' : 'Entreno ' + t}</span></div>`).join('');
}
$$('#ent-modo .seg-btn').forEach(b => b.addEventListener('click', () => { modo = b.dataset.modo; const d = dia(hoyKey()); d.ejs = []; guardar(); renderEntreno(); }));
$('#ent-hecho').addEventListener('click', () => {
  const d = dia(hoyKey());
  d.ent = d.ent ? 0 : modo; guardar(); renderEntreno();
  if (d.ent) { toast(modo === 'minimo' ? 'Mínimo hecho. Mañana, completo.' : 'Entreno hecho. Ahora, proteína.'); if (navigator.vibrate) navigator.vibrate(40); }
});
let timerInt = null;
$('#timer-btn').addEventListener('click', () => {
  if (timerInt) { clearInterval(timerInt); timerInt = null; $('#timer-num').textContent = '1:00'; $('#timer-btn').textContent = 'Empezar'; return; }
  let s = 60; $('#timer-btn').textContent = 'Parar';
  timerInt = setInterval(() => {
    s--; $('#timer-num').textContent = Math.floor(s / 60) + ':' + pad(s % 60);
    if (s <= 0) { clearInterval(timerInt); timerInt = null; $('#timer-btn').textContent = 'Empezar'; $('#timer-num').textContent = '¡Ya!'; if (navigator.vibrate) navigator.vibrate([200, 100, 200]); }
  }, 1000);
});

/* ---------- COMIDA ---------- */
function renderComida() {
  $('#comidas').innerHTML = PLATOS.map(p => `<div class="comida"><h3>${p.n}</h3><p class="comida-nums">${p.k} kcal · ${p.p} g de proteína</p><ul>${p.i.map(x => `<li>${x}</li>`).join('')}</ul><p>${p.c}</p></div>`).join('');
  $('#compra').innerHTML = COMPRA.map(c => `<span>${c}</span>`).join('');
}

/* ---------- PROGRESO ---------- */
function media7(k) {
  const v = []; for (let i = 0; i < 7; i++) { const p = D.pesos[sumaDias(k, -i)]; if (p) v.push(p); }
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}
function renderProgreso() {
  const k = hoyKey(), m = media7(k);
  $('#prog-peso').textContent = m ? fmt1(m) + ' kg' : '— kg';
  const ini = Object.keys(D.pesos).sort()[0];
  $('#prog-sub').textContent = m && ini ? 'Media de 7 días · ' + (m - D.pesos[ini] <= 0 ? '' : '+') + fmt1(m - D.pesos[ini]) + ' kg desde el principio' : 'Pésate cada mañana y aquí aparece la media';
  $('#prog-obj').textContent = 'Objetivo: ' + fmt1(D.objetivo) + ' kg';
  grafica();

  let ents = 0, comp = 0;
  for (let i = 0; i < 7; i++) { const dk = sumaDias(k, -i); if (dk < D.inicio) break; if ((D.dias[dk] || {}).ent) ents++; if (completo(dk)) comp++; }
  let max = 0, cur = 0;
  for (let dk = D.inicio; dk <= k; dk = sumaDias(dk, 1)) { if (completo(dk)) { cur++; max = Math.max(max, cur); } else if (dk !== k) cur = 0; }
  $('#stats').innerHTML = `<div class="stat"><b>${ents}</b><span>entrenos en 7 días</span></div><div class="stat"><b>${comp}/7</b><span>días cumplidos</span></div><div class="stat"><b>${max}</b><span>mejor racha</span></div>`;

  const cs = Object.keys(D.cintura).sort();
  if (cs.length) {
    const u = D.cintura[cs[cs.length - 1]], p0 = D.cintura[cs[0]];
    $('#cintura-ult').textContent = 'Última: ' + fmt1(u) + ' cm' + (cs.length > 1 ? ' · ' + (u - p0 <= 0 ? '' : '+') + fmt1(u - p0) + ' cm desde el principio' : '');
  }
  const f = faseEn(k);
  $('#fases').innerHTML = FASES.map((x, i) => {
    const n = i + 1, cls = n === f ? 'activa' : n > f ? 'bloq' : '';
    const est = n < f ? 'Superada' : n === f ? 'Ahora' : 'Se desbloquea con 14 días al 70 %';
    return `<div class="fase ${cls}"><p class="fase-t">${x.n} · <span style="color:var(--ember)">${est}</span></p><p class="fase-d">${x.d}</p></div>`;
  }).join('');
  pintarFotos();
}
function grafica() {
  const ks = Object.keys(D.pesos).sort().slice(-60);
  const el = $('#grafica');
  if (ks.length < 2) { el.innerHTML = '<p class="small">Con dos días de peso aparece la gráfica.</p>'; return; }
  const W = 320, H = 150, L = 34, Rr = 8, T = 10, B = 22;
  const vals = ks.map(x => D.pesos[x]);
  let lo = Math.min(...vals, D.objetivo) - 0.5, hi = Math.max(...vals) + 0.5;
  const x = i => L + (W - L - Rr) * (ks.length === 1 ? 0 : i / (ks.length - 1));
  const y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const medias = ks.map(kk => media7(kk));
  const ticks = [lo + 0.5, (lo + hi) / 2, hi - 0.5];
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de peso">
    ${ticks.map(t => `<line x1="${L}" x2="${W - Rr}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${y(t) + 4}" fill="var(--muted)" font-size="10" text-anchor="end">${fmt1(t)}</text>`).join('')}
    <line x1="${L}" x2="${W - Rr}" y1="${y(D.objetivo)}" y2="${y(D.objetivo)}" stroke="var(--ok)" stroke-dasharray="4 4" stroke-width="1.5"/>
    <polyline points="${vals.map((v, i) => x(i) + ',' + y(v)).join(' ')}" fill="none" stroke="var(--muted)" stroke-width="1" opacity=".6"/>
    ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="2" fill="var(--muted)"/>`).join('')}
    <polyline points="${medias.map((v, i) => x(i) + ',' + y(v)).join(' ')}" fill="none" stroke="var(--ember)" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="${x(vals.length - 1)}" cy="${y(medias[medias.length - 1])}" r="4.5" fill="var(--ember)"/>
    <text x="${L}" y="${H - 6}" fill="var(--muted)" font-size="10">${deKey(ks[0]).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</text>
    <text x="${W - Rr}" y="${H - 6}" fill="var(--muted)" font-size="10" text-anchor="end">Naranja: media de 7 días · verde: objetivo</text>
  </svg>`;
}
$('#cintura-form').addEventListener('submit', e => {
  e.preventDefault();
  const v = parseFloat($('#cintura-input').value.replace(',', '.'));
  if (isNaN(v) || v < 50 || v > 150) { toast('Pon la cintura en centímetros, por ejemplo 82'); return; }
  D.cintura[hoyKey()] = v; guardar(); $('#cintura-input').value = ''; toast('Cintura guardada'); renderProgreso();
});
$('#btn-objetivo').addEventListener('click', () => {
  const v = prompt('Peso objetivo en kilos:', fmt1(D.objetivo));
  const n = parseFloat((v || '').replace(',', '.'));
  if (!isNaN(n) && n > 40 && n < 150) { D.objetivo = n; guardar(); renderProgreso(); }
});
$('#btn-copia').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(JSON.stringify(D)); toast('Datos copiados. Pégalos donde quieras guardarlos.'); }
  catch (e) { toast('No se pudo copiar en este móvil'); }
});

/* fotos en IndexedDB (no caben en localStorage) */
function idb() {
  return new Promise((ok, ko) => { const r = indexedDB.open('forja', 1); r.onupgradeneeded = () => r.result.createObjectStore('fotos'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
}
async function fotoGuardar(k, blob) { const db = await idb(); return new Promise((ok, ko) => { const t = db.transaction('fotos', 'readwrite'); t.objectStore('fotos').put(blob, k); t.oncomplete = ok; t.onerror = () => ko(t.error); }); }
async function fotoListar() {
  const db = await idb();
  return new Promise((ok, ko) => { const t = db.transaction('fotos'); const st = t.objectStore('fotos'); const r = st.getAllKeys(); r.onsuccess = async () => { const ks = r.result.sort(); const out = []; for (const kk of [ks[0], ks[ks.length - 1]].filter((v, i, a) => v && a.indexOf(v) === i)) { out.push({ k: kk, b: await new Promise(res => { const g = db.transaction('fotos').objectStore('fotos').get(kk); g.onsuccess = () => res(g.result); }) }); } ok({ total: ks.length, out }); }; r.onerror = () => ko(r.error); });
}
async function reducir(file) {
  const img = await createImageBitmap(file);
  const s = Math.min(1, 900 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.82));
}
$('#foto-input').addEventListener('change', async e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  try { await fotoGuardar(hoyKey(), await reducir(f)); toast('Foto guardada'); pintarFotos(); }
  catch (err) { toast('No se pudo guardar la foto'); }
  e.target.value = '';
});
async function pintarFotos() {
  try {
    const { total, out } = await fotoListar();
    if (!total) return;
    $('#fotos').innerHTML = out.map((o, i) => `<div class="foto"><figure><img src="${URL.createObjectURL(o.b)}" alt="Foto del ${o.k}"><figcaption>${i === 0 ? 'Primera' : 'Última'} · ${deKey(o.k).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</figcaption></figure></div>`).join('')
      + `<p class="small">${total} ${total === 1 ? 'foto' : 'fotos'} guardadas en este móvil.</p>`;
  } catch (e) { /* sin fotos */ }
}

/* ---------- avisos push (pantalla bloqueada) ---------- */
const PUSH_VAPID_PUBLIC = 'BMg2VZ_iggrZ1e2Dd7ddu3VRZuE8o3jN70sY_bnsU4wm21D8V4B9YmnD3oRUGPbhyl2WBedD6nEtXTBDYfsbgTg';
const PUSH_WORKER_URL = 'https://forma64-push.pobicasas.workers.dev';
const u8 = b => { const p = '='.repeat((4 - b.length % 4) % 4); return Uint8Array.from(atob((b + p).replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)); };
const pushOn = () => { try { return localStorage.getItem('f64-push') === '1'; } catch (e) { return false; } };

function notifState() {
  const b = $('#btn-notif');
  if (!('Notification' in window) || !('serviceWorker' in navigator)) { b.title = 'Instala la app en la pantalla de inicio para recibir avisos'; return; }
  b.classList.toggle('on', pushOn());
  b.title = pushOn() ? 'Avisos activados: 10:30, 15:00 y 23:00' : 'Activar los avisos del entrenador';
}
async function suscribir() {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: u8(PUSH_VAPID_PUBLIC) });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
  const r = await fetch(PUSH_WORKER_URL + '/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub.toJSON(), tz }) });
  if (!r.ok) throw new Error('worker ' + r.status);
}
$('#btn-notif').addEventListener('click', async () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) { toast('Primero añade FORJA a la pantalla de inicio'); return; }
  if (pushOn()) { toast('Los avisos ya están activados: 10:30, 15:00 y 23:00'); return; }
  if (Notification.permission === 'denied') { toast('Tienes los avisos bloqueados en Ajustes'); return; }
  const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (p !== 'granted') { toast('Sin permiso no hay avisos'); return; }
  try { await suscribir(); localStorage.setItem('f64-push', '1'); toast('Avisos activados. Te escribo a las 10:30.'); }
  catch (e) { toast('No se pudieron activar los avisos'); }
  notifState();
});
async function renovarPush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) { localStorage.setItem('f64-push', '1'); await suscribir(); } else localStorage.removeItem('f64-push');
  } catch (e) {}
  notifState();
}

/* ---------- pestañas ---------- */
const RENDER = { hoy: renderHoy, entreno: renderEntreno, comida: renderComida, progreso: renderProgreso };
let cur = 'hoy';
function irA(id) {
  cur = id;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.screen === id));
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id));
  window.scrollTo(0, 0);
  RENDER[id]();
}
$$('.tab').forEach(t => t.addEventListener('click', () => irA(t.dataset.screen)));
document.addEventListener('visibilitychange', () => { if (!document.hidden) RENDER[cur](); });

/* ---------- arranque ---------- */
guardar();
irA('hoy');
notifState();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(renovarPush).catch(() => {});
}
