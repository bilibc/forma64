/* ============================================================
   Forma64 · app.js — v3
   Plan de 72 → 64 kg. Dos comidas al día, sin desayuno ni
   merienda, sin compensar. QR de nevera + motivación 3x/día.
   ============================================================ */
'use strict';

/* ---------- constantes del plan (recalculadas a 72 kg) ---------- */
const PLAN = {
  edad: 22, pesoIni: 72, altura: 176, pesoObj: 64,
  tmb: 1715, gasto: 2400, comer: 1150, deficit: 1250,
  agua: 2500, pasosMin: 8000, pasosMax: 10000, sueno: 8,
  libreDia: 5,            // sábado
  semanas: '8–10'
};

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_LARGOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MOMENTOS = [['Comida', '14:00'], ['Cena', '21:00']];

/* ---------- los 7 días: solo comida y cena ---------- */
const SEMANA = [
  { meals: [
    { n: 'Pollo, arroz y brócoli', kcal: 625, p: 49, items: ['180 g · pechuga de pollo', '70 g · arroz blanco (en seco)', '250 g · brócoli', '10 g · aceite de oliva'], how: 'Pollo a la plancha 8 min con sal y limón. Arroz hervido 12 min. Brócoli al vapor 5 min.' },
    { n: 'Tortilla con pan, tomate y yogur', kcal: 545, p: 49, items: ['2 huevos + 2 claras', '60 g · pan integral', '1 tomate grande', '6 g · aceite de oliva', '160 g · yogur griego natural 0 %'], how: 'Tortilla francesa a fuego medio. Pan tostado. Yogur de postre, sin azúcar.' },
  ]},
  { meals: [
    { n: 'Lentejas con pavo y arroz', kcal: 660, p: 52, items: ['200 g · lentejas cocidas', '130 g · pavo en filetes', '60 g · arroz blanco', '8 g · aceite de oliva'], how: 'Arroz y lentejas calientes. Pavo a la plancha con comino.' },
    { n: 'Merluza con patata, judías y queso', kcal: 510, p: 59, items: ['220 g · merluza', '150 g · patata hervida', '150 g · judías verdes', '6 g · aceite de oliva', '125 g · queso fresco batido 0 %'], how: 'Merluza al vapor con limón. Patata y judías hervidas. Queso de postre.' },
  ]},
  { meals: [
    { n: 'Atún con garbanzos y ensalada', kcal: 590, p: 38, items: ['1 lata · atún al natural', '250 g · garbanzos cocidos', '200 g · tomate y lechuga', '8 g · aceite de oliva'], how: 'Escurre el atún y los garbanzos. Aliga el aceite con limón por encima.' },
    { n: 'Tortilla de claras con espinacas y yogur', kcal: 510, p: 54, items: ['4 claras + 2 huevos', '150 g · espinacas', '40 g · pan integral', '5 g · aceite de oliva', '160 g · yogur griego natural 0 %'], how: 'Rehoga la espinaca, añade los huevos y cuaja. Yogur de postre.' },
  ]},
  { meals: [
    { n: 'Pasta integral con pollo y calabacín', kcal: 610, p: 46, items: ['90 g · pasta integral (en seco)', '160 g · pollo', '150 g · calabacín', '10 g · aceite de oliva'], how: 'Pasta 10 min (al dente). Pollo a la plancha. Calabacín salteado.' },
    { n: 'Requesón con ensalada, huevos y jamón', kcal: 500, p: 50, items: ['200 g · requesón 0 %', '2 huevos duros', '150 g · ensalada mixta', '60 g · jamón york de pavo', '40 g · pan integral', '6 g · aceite de oliva'], how: 'Ensalada con los huevos en cuartos y el jamón. Requesón de postre.' },
  ]},
  { meals: [
    { n: 'Ternera picada con boniato y brócoli', kcal: 570, p: 42, items: ['170 g · ternera picada 5 %', '180 g · boniato', '200 g · brócoli', '10 g · aceite de oliva'], how: '2–3 hamburguesas planas a la sartén sin más. Boniato asado 8 min en el microondas. Brócoli al vapor.' },
    { n: 'Salmón a la plancha, ensalada y yogur', kcal: 560, p: 55, items: ['170 g · salmón', '150 g · ensalada', '40 g · pan integral', '8 g · aceite de oliva', '160 g · yogur griego natural 0 %'], how: 'Salmón 5 min por lado, piel hacia abajo. Pan tostado. Yogur de postre.' },
  ]},
  { meals: [ // sábado: comida + cena libre
    { n: 'Gambas al ajillo con arroz y ensalada', kcal: 460, p: 35, items: ['170 g · gambas congeladas', '60 g · arroz blanco', '1 diente de ajo', '150 g · ensalada', '10 g · aceite de oliva'], how: 'Sofríe el ajo, saltea las gambas 3 min. Arroz hervido. Ensalada.' },
  ]},
  { meals: [
    { n: 'Ternera con boniato y brócoli', kcal: 550, p: 42, items: ['170 g · ternera picada 5 %', '180 g · boniato', '200 g · brócoli', '8 g · aceite de oliva'], how: 'Hamburguesas planas a la sartén. Boniato asado en el microondas. Brócoli al vapor.' },
    { n: 'Tortilla con ensalada y requesón', kcal: 520, p: 53, items: ['3 huevos + 1 clara', '150 g · ensalada mixta', '40 g · pan integral', '150 g · requesón 0 %', '5 g · aceite de oliva'], how: 'Tortilla fina. Requesón de postre con canela.' },
  ]},
];

const CENA_LIBRE = {
  n: 'La cena libre', kcal: 0, p: 0, free: true,
  items: ['Lo que te apetezca: un plato + un postre', 'Pizza, hamburguesa, arroz del chino… una, no tres'],
  how: 'Es tu día y esta es tu recompensa. El domingo se vuelve al plan, sin drama.'
};

/* ---------- rutina de casa ---------- */
const RUTINA_SEMANA = [
  { d: 'Lunes', t: 'Fuerza A · 35 min', k: '≈ 250 kcal', rest: false },
  { d: 'Martes', t: 'Descanso · pero andas', k: '8–10 mil pasos', rest: true },
  { d: 'Miércoles', t: 'Fuerza A · 35 min', k: '≈ 250 kcal', rest: false },
  { d: 'Jueves', t: 'Descanso · pero andas', k: '8–10 mil pasos', rest: true },
  { d: 'Viernes', t: 'Fuerza A · 35 min', k: '≈ 250 kcal', rest: false },
  { d: 'Sábado', t: 'Caminata rápida · 60 min', k: '≈ 350 kcal', rest: false },
  { d: 'Domingo', t: 'Descanso · paseo suave', k: '—', rest: true },
];

const RUTINA_A = [
  { n: 'Calentamiento', s: '2 × 30 s', how: 'Jumping jacks y rodillas altas, dos rondas de 30 s de cada uno, sin pausa.' },
  { n: 'Flexiones de pecho', s: '4 × 10', how: 'Espalda recta, manos a la altura de los hombros. Baja el pecho a 2 cm del suelo. ¿No llegas a 8 limpias? Hazlas de rodillas.' },
  { n: 'Sentadillas', s: '4 × 15', how: 'Siéntate como si hubiera una silla: rodillas hacia fuera, pecho arriba, talones en el suelo.' },
  { n: 'Plancha', s: '3 × 40 s', how: 'Línea recta de cabeza a talones. Aprieta abdomen y glúteo; no hundas la cadera.' },
  { n: 'Zancadas', s: '3 × 12 por pierna', how: 'Paso largo, la rodilla trasera casi toca el suelo. Cuerpo recto.' },
  { n: 'Puente de glúteo', s: '3 × 15', how: 'Sube la cadera y aprieta el glúteo 1 s arriba.' },
  { n: 'Escaladores', s: '3 × 20 s', how: 'Rodillas al pecho a ritmo rápido sin levantar la cadera.' },
];

const TIPS = [
  'Dos comidas completas al día: la comida y la cena ganan la semana.',
  'Si te sobra hambre de verdad, 1 huevo duro o un yogur griego: no rompen nada.',
  'La proteína de cada comida es lo que protege tu músculo a déficit de verdad.',
  'Un vaso de agua 20 min antes de comer llena y quita hambre de sobra.',
  'Si te pasas de 1.150 hoy, no pasa nada: lo que cuenta es la semana.',
  'Pésate cada lunes en ayunas. La báscula miente a diario, no a la semana.',
  'El sábado es tu día libre. Lo demás, sin negociar.',
];

/* ---------- mensajes de motivación (mañana / tarde / noche) ---------- */
const SLOTS = [['mañana', 9, 0], ['tarde', 14, 30], ['noche', 21, 0]];
const MSG = {
  mañana: [
    'Hoy no es ensayo, Mario: es el día. Dos comidas limpias y 8 mil pasos y el plan va solo.',
    'Levántate antes de que la cabeza te convenza de lo contrario. La ropa ya está lista.',
    'La báscula del lunes manda. Lo que hagas esta mañana decide cómo suena.',
    'No tienes que ser perfecto hoy. Solo dos comidas y salir a andar.',
    'El 64 no se consigue en un día: se consigue en días como hoy.',
    'Antes de las 7 nadie te lo pone difícil. Aprovecha la mañana en silencio.',
    'Un vaso de agua nada más levantarte. Pequeño, pero suma.',
    'Hoy toca comida y cena decentes. El resto, a paseo.',
    'Tu yo de dentro de dos meses te está mirando. No le falles hoy.',
    'Empieza el día con diez minutos de paseo y ya llevas la mitad de los pasos.',
    'No esperes a tener ganas. Las ganas llegan después de empezar.',
    'Una decisión buena tras otra. Eso es todo el plan, Mario.',
    'Mírate en el espejo: esto es el «antes». Empieza a cambiarlo hoy.',
    'Descansa bien esta noche. Hoy vuelve el plan y tú también.',
    'Sin desayuno ni penas: tu primera comida del día ya está decidida por ti.',
  ],
  tarde: [
    'Bien hecho, Mario: la comida ya está. Ahora solo falta no estropearlo esta tarde.',
    'El antojo de las 6 es el enemigo. Agua, un café solo y se pasa.',
    'Mitad del día ganada. La segunda mitad se gana andando.',
    'Recuerda por qué empezaste: para no mirarte fofo en el espejo.',
    'Si hoy te pasas en la cena, no pasa nada. Lo que cuenta es la semana.',
    'Diez minutos de paseo después de comer y el plan sigue rodando.',
    'No estás a dieta: estás construyendo el cuerpo del próximo año.',
    'El hambre que sientes ahora es la grasa quejándose. Déjala.',
    'Sigue así y el sábado te ganas la cena libre.',
    'No compares tu semana con la de nadie. Compara el 72 con el 64.',
    'Tarde perfecta para escaleras en vez de ascensor. Rápido y gratis.',
    'La constancia pesa más que la intensidad. Y hoy ya has sido constante.',
    'Pronto podrás ponerte esa camiseta. Esa es la recompensa.',
    'Si te entra el bajón, recuerda: 4 kg solo era el primer mes. Esto baja.',
    'Una comida limpia más en el casillero. Así se gana esto.',
  ],
  noche: [
    'Bien hecho, Mario. Sigue así mañana. A las 23:00, a la cama.',
    'Comida marcada, cena marcada. Día resuelto. Buenas noches.',
    'Has hecho hoy lo que tocaba. Eso es todo lo que se pedía. Descansa.',
    'Cierra los ojos sabiendo que ganaste el día. Mañana, otra vez.',
    'El cuerpo cambia de noche, durmiendo. Ocho horas y despierta nuevo.',
    'Nada de pantallas media hora antes. El plan no termina con la cena.',
    'Buen trabajo hoy, Mario. Mañana hay más: dos comidas y pasos.',
    'La constancia de esta noche es la báscula del lunes. A dormir.',
    'Menos peso cada lunes, más fuerza cada semana. Buenas noches, campeón.',
    'Hoy has elegido bien. Mañana también. Prometido.',
    'Apaga todo y descansa: dormir también es parte de la dieta.',
    'Bien hecho, sigue así. El 64 está a dos meses de noches como esta.',
    'Hasta mañana, Mario. La nevera estará esperando con lo tuyo.',
    'Día completo, día ganado. No hay mejor forma de cerrarlo. A dormir.',
    'La cama a las 23:00 no es fruta: es táctica. Buenas noches, Mario.',
  ],
};

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const todayKey = () => new Date().toISOString().slice(0, 10);
const round1 = n => (Math.round(n * 10) / 10).toFixed(1);

function state() {
  const k = todayKey();
  const raw = localStorage.getItem('f64-' + k);
  const s = raw ? JSON.parse(raw) : { done: {}, water: 0, steps: 0, sleep: 0, libre: false };
  const store = obj => localStorage.setItem('f64-' + k, JSON.stringify(obj));
  return { s, store, k };
}
function todayIdx() { return (new Date().getDay() + 6) % 7; }
function mealId(day, i) { return day + '.' + i; }

/* ---------- peso ---------- */
let peso = parseFloat(localStorage.getItem('f64-peso') || '72');

/* ---------- render: HOY ---------- */
function renderHoy() {
  const { s, store } = state();
  const di = todayIdx();
  const dayData = SEMANA[di];
  const h = new Date().getHours();

  $('#today-label').textContent = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  $('#hero-title').textContent = (h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches') + ', Mario';

  // anillo: avance 72 → 64
  const frac = Math.min(1, Math.max(0, (PLAN.pesoIni - peso) / (PLAN.pesoIni - PLAN.pesoObj)));
  const C = 553;
  $('#ring-weight').style.strokeDashoffset = C * (1 - frac * 0.82);
  $('#ring-kg').innerHTML = round1(peso) + '<span>kg</span>';
  $('#ring-rest').textContent = 'faltan ' + round1(Math.max(0, peso - PLAN.pesoObj)).replace('.', ',') + ' kg';
  $('#btn-weight').textContent = 'peso de hoy: ' + round1(peso).replace('.', ',') + ' kg · editar';

  // chips
  const kcal = kcalComidas(di, s);
  $('#chip-kcal').textContent = kcal;
  $('#chip-deficit').textContent = PLAN.deficit;

  // mensaje de motivación según la hora
  const si = slotNow();
  $('#msg-when').textContent = 'Mensaje de la ' + SLOTS[si][0];
  $('#tip-msg').textContent = msgFor(si);
  notifState();

  // semana
  $('#week-bar').innerHTML = DIAS_LARGOS.map((n, i) =>
    `<div class="wd${i === di ? ' today' : ''}${i === PLAN.libreDia ? ' free' : ''}"><small>${DIAS[i]}</small><b>${n[0]}</b></div>`
  ).join('');
  $$('#week-bar .wd').forEach((el, i) => el.addEventListener('click', () => { goTab('comidas'); setDia(i); }));

  // objetivos
  $('#goal-cal-num').textContent = kcal + ' / ' + PLAN.comer;
  $('#goal-cal-num').style.color = kcal > PLAN.comer ? '#cb272f' : '';
  $('#bar-cal').style.width = Math.min(100, kcal / PLAN.comer * 100) + '%';

  $('#goal-water-num').textContent = (s.water / 1000).toFixed(1).replace('.', ',');
  $('#bar-water').style.width = Math.min(100, s.water / PLAN.agua * 100) + '%';

  $('#goal-steps-num').textContent = s.steps.toLocaleString('es-ES');
  $('#bar-steps').style.width = Math.min(100, s.steps / PLAN.pasosMin * 100) + '%';

  $('#sleep-state').textContent = s.sleep ? 'a las 23:00 ✓' : 'pendiente';
  $('#sleep-state').style.color = s.sleep ? 'var(--spruce)' : '';

  // banner día libre
  const freeEl = $('#card-libre');
  if (di === PLAN.libreDia) {
    freeEl.innerHTML = `<div class="libre-banner"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-3-6.2" fill="none" stroke="var(--spruce)" stroke-width="2" stroke-linecap="round"/></svg><p class="card-note"><b>Hoy es tu día libre.</b> La cena, a tu elección: un plato + un postre. El resto del día, normal.</p></div>`;
  } else {
    const hasta = (PLAN.libreDia - di + 7) % 7;
    freeEl.innerHTML = `<div class="libre-banner"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-3-6.2" fill="none" stroke="var(--spruce)" stroke-width="2" stroke-linecap="round"/></svg><p class="card-note"><b>Día libre: el sábado.</b> ${hasta === 0 ? 'Es hoy.' : hasta === 1 ? 'Mañana.' : 'En ' + hasta + ' días.'} Una comida, no el día entero.</p></div>`;
  }

  // comidas de hoy (solo comida y cena)
  const mealsHtml = dayData.meals.map((m, i) => mealCard(m, di, i, s, false)).join('');
  const libreHoy = (di === PLAN.libreDia) ? mealCard(CENA_LIBRE, di, 'libre', s, true) : '';
  $('#today-meals').innerHTML = mealsHtml + libreHoy;
  bindMealButtons('#today-meals', ['renderHoy', 'renderComidas']);

  // botones
  $('#btn-reset').onclick = () => {
    if (confirm('¿Reiniciar agua, pasos, sueño y comidas marcadas de hoy?')) {
      localStorage.removeItem('f64-' + todayKey());
      renderHoy();
    }
  };
  $('#btn-water').onclick = () => { s.water = Math.min(4000, s.water + 250); store(s); renderHoy(); };
  $('#goal-water').onclick = e => { if (e.target.closest('#btn-water')) return; if (s.water >= 250) { s.water = Math.max(0, s.water - 250); store(s); renderHoy(); } };
  $('#btn-steps').onclick = () => { s.steps += 500; store(s); renderHoy(); };
  $('#goal-steps').onclick = e => { if (e.target.closest('#btn-steps')) return; if (s.steps >= 500) { s.steps = Math.max(0, s.steps - 500); store(s); renderHoy(); } };
  $('#btn-sleep').onclick = () => { s.sleep = s.sleep ? 0 : 1; store(s); renderHoy(); };
  $('#btn-weight').onclick = () => {
    const v = prompt('Peso de esta mañana (kg):', round1(peso));
    const n = parseFloat((v || '').replace(',', '.'));
    if (!isNaN(n) && n > 40 && n < 150) { peso = n; localStorage.setItem('f64-peso', String(n)); renderHoy(); }
    else if (v !== null) alert('Pon un número, anda.');
  };
  $('#btn-notif').onclick = notifToggle;
  stagger();
}

function kcalComidas(di, s) {
  return SEMANA[di].meals.reduce((acc, m, i) => acc + (m.kcal * (s.done[mealId(di, i)] ? 1 : 0)), 0);
}

function mealCard(m, di, i, s, isLibre) {
  const id = mealId(di, i);
  const done = isLibre ? !!s.libre : !!s.done[id];
  const when = m.free ? 'Cena · 21:00' : MOMENTOS[typeof i === 'number' ? i : 0][0] + ' · ' + MOMENTOS[typeof i === 'number' ? i : 0][1];
  return `
    <div class="meal${done ? ' ate' : ''}" style="--i:${typeof i === 'number' ? i : 6}">
      <div class="meal-top">
        <div><p class="meal-when">${when}${m.free ? ' <span class="free-tag">Día libre</span>' : ''}</p><h3 class="meal-name">${m.n}</h3></div>
        <div class="meal-nums"><div class="meal-kcal">${m.free ? 'a placer' : m.kcal + ' kcal'}</div><div class="meal-p">${m.free ? 'un plato + un postre' : m.p + ' g proteína'}</div></div>
      </div>
      <div class="meal-items">${m.items.map(it => `<span class="item">${it}</span>`).join('')}</div>
      <p class="meal-how"><b>Cómo se hace:</b> ${m.how}</p>
      <div class="meal-foot">
        <button class="done-btn${done ? ' on' : ''}" data-tog="${id}" data-libre="${isLibre ? 1 : 0}">${m.free ? (done ? 'Disfrutada ✓' : 'Marcar disfrutada') : (done ? 'Hecho ✓' : 'Marcar hecho')}</button>
      </div>
    </div>`;
}

function bindMealButtons(sel, renderers) {
  const fn = { renderHoy, renderComidas };
  $$(sel + ' .done-btn').forEach(b => b.addEventListener('click', () => {
    const { s, store } = state();
    if (b.dataset.libre === '1') {
      s.libre = !s.libre;
    } else {
      s.done[b.dataset.tog] = !s.done[b.dataset.tog];
    }
    store(s);
    renderers.forEach(r => fn[r]());
  }));
}

/* ---------- render: COMIDAS ---------- */
let diaSel = todayIdx();
function setDia(i) { diaSel = i; renderComidas(); }

function renderComidas() {
  const { s } = state();
  const di = diaSel;
  const dayData = SEMANA[di];
  $('#comidas-title').textContent = DIAS_LARGOS[di];

  $('#day-nav').innerHTML = DIAS_LARGOS.map((n, i) =>
    `<button class="day-pill${i === di ? ' here' : ''}${i === PLAN.libreDia ? ' free' : ''}" data-d="${i}">${DIAS[i]}<small>${n}</small></button>`
  ).join('');
  $$('#day-nav .day-pill').forEach(b => b.addEventListener('click', () => setDia(+b.dataset.d)));

  const kcal = kcalComidas(di, s);
  const rest = PLAN.comer - kcal;
  $('#kcal-status').innerHTML =
    `<span><strong>${kcal}</strong> / ${PLAN.comer} kcal</span>` +
    (rest >= 0 ? `<span class="rest">quedan ${rest} kcal</span>` : `<span class="rest" style="color:#cb272f">+${Math.abs(rest)} de más</span>`);

  const html = dayData.meals.map((m, i) => mealCard(m, di, i, s, false)).join('');
  const libreHtml = (di === PLAN.libreDia) ? mealCard(CENA_LIBRE, di, 'libre', s, true) : '';
  $('#meal-list').innerHTML = html + libreHtml;
  bindMealButtons('#meal-list', ['renderComidas', 'renderHoy']);
  stagger();
}

/* ---------- render: ENTRENAR ---------- */
function renderEntrenar() {
  $('#week-routine').innerHTML = RUTINA_SEMANA.map((r, i) =>
    `<div class="wr-row${r.rest ? ' rest' : ''}"><span class="wr-d">${r.d}</span><span class="wr-t">${r.t}</span><span class="wr-k">${r.k}</span></div>`
  ).join('');
  $('#routine-a').innerHTML = RUTINA_A.map((ex, i) => `
    <div class="ex" style="--i:${i}">
      <div class="ex-main"><p class="ex-name">${ex.n}</p><p class="ex-how">${ex.how}</p></div>
      <div class="ex-sets">${ex.s.split(' ')[0]} <small>${ex.s.split(' ').slice(1).join(' ')}</small></div>
    </div>`).join('');
  stagger();
}

/* ---------- render: PLAN ---------- */
function renderPlan() {
  renderQr();
  stagger();
}

/* ---------- QR de la nevera ---------- */
function qrUrl() {
  return location.origin + location.pathname + '#nevera';
}
function renderQr() {
  const target = $('#qr');
  const printTarget = $('#qr-print-img');
  if (!target || !printTarget) return;
  if (typeof qrcode !== 'function') {
    target.innerHTML = '<p class="qr-loading">Carga la página una vez con conexión para generar el QR.</p>';
    return;
  }
  const url = qrUrl();
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  target.innerHTML = qr.createImgTag(6, 2);
  printTarget.innerHTML = qr.createImgTag(9, 2);
  const hint = $('#qr-hint');
  if (hint) hint.textContent = 'El QR contiene: ' + url;
}

/* ---------- motivación: mensajes y avisos ---------- */
function slotNow() { const h = new Date().getHours(); return h < 14 ? 0 : h < 21 ? 1 : 2; }
function msgFor(slot) {
  const dayN = Math.floor(Date.now() / 864e5);
  return MSG[SLOTS[slot][0]][(dayN * 3 + slot) % MSG[SLOTS[slot][0]].length];
}

/* ---------- avisos: push real (pantalla bloqueada) + fallback local ---------- */
const PUSH_VAPID_PUBLIC = 'BMg2VZ_iggrZ1e2Dd7ddu3VRZuE8o3jN70sY_bnsU4wm21D8V4B9YmnD3oRUGPbhyl2WBedD6nEtXTBDYfsbgTg';
const PUSH_WORKER_URL = 'https://forma64-push.pobicasas.workers.dev'; // relay de avisos (Cloudflare)

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
const pushConfigured = () => PUSH_WORKER_URL.indexOf('TU-WORKER') === -1;
const pushOn = () => localStorage.getItem('f64-push') === '1';

function notifState() {
  const b = $('#btn-notif');
  if (!b) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) { b.classList.add('off'); b.title = 'Este navegador no permite avisos'; return; }
  const on = pushOn() || (Notification.permission === 'granted' && localStorage.getItem('f64-notif') === 'on');
  b.classList.toggle('on', on);
  b.title = on ? 'Avisos activados 3 veces al día · tocar para apagar' : 'Activar avisos 3 veces al día';
}

async function notifyWorker(sub) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
  const res = await fetch(PUSH_WORKER_URL + '/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub.toJSON(), tz }),
  });
  if (!res.ok) throw new Error('worker ' + res.status);
}

async function startPush() {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(PUSH_VAPID_PUBLIC) });
  }
  await notifyWorker(sub);
}

async function stopPush() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      if (pushConfigured()) {
        await fetch(PUSH_WORKER_URL + '/subscribe', {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        });
      }
    }
  } catch (e) { /* nada */ }
}

async function syncPush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      localStorage.setItem('f64-push', '1');
      if (notifTimer) { clearTimeout(notifTimer); notifTimer = null; } // sin doble aviso
      if (pushConfigured()) await notifyWorker(sub).catch(() => {}); // renueva la suscripción
    } else {
      localStorage.removeItem('f64-push');
    }
  } catch (e) { /* nada */ }
  notifState();
}

function nextSlotInfo() {
  const now = new Date();
  const best = [];
  for (let dayOff = 0; dayOff <= 1; dayOff++) {
    for (let slot = 0; slot < 3; slot++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOff, SLOTS[slot][1], SLOTS[slot][2], 0, 0);
      if (d > now) best.push({ slot, d });
    }
  }
  best.sort((a, b) => a.d - b.d);
  return best[0] || null;
}

function fireNotif(slot) {
  const regP = navigator.serviceWorker.getRegistration();
  regP.then(reg => {
    if (!reg) return;
    const title = slot === 0 ? 'Buenos días, Mario' : slot === 1 ? 'Sigue así, Mario' : 'Buenas noches, Mario';
    reg.showNotification(title, { body: msgFor(slot), icon: 'icon-192.png', badge: 'icon-192.png', tag: 'f64-' + todayKey() + '-' + slot, data: { url: qrUrl().replace('#nevera', '') } });
  }).catch(() => {});
}

let notifTimer = null;
function scheduleNext() {
  if (pushOn()) return;                  // push real: los avisos los manda Cloudflare
  if (localStorage.getItem('f64-notif') !== 'on') return;
  const nx = nextSlotInfo();
  if (!nx) return;
  const ms = nx.d - Date.now();
  if (notifTimer) clearTimeout(notifTimer);
  notifTimer = setTimeout(() => {
    notifTimer = null;
    fireNotif(nx.slot);
    scheduleNext();
  }, ms);
}

async function notifToggle() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    alert('Este navegador no permite avisos. Usa la app instalada en el móvil.');
    return;
  }
  // apagar si ya está encendido
  if (pushOn() || (Notification.permission === 'granted' && localStorage.getItem('f64-notif') === 'on')) {
    if (confirm('¿Apagar los avisos de motivación?')) {
      localStorage.removeItem('f64-push');
      localStorage.removeItem('f64-notif');
      if (notifTimer) { clearTimeout(notifTimer); notifTimer = null; }
      await stopPush();
      notifState();
    }
    return;
  }
  if (Notification.permission === 'denied') {
    alert('Bloqueaste los avisos. Puedes activarlos desde los ajustes del navegador si cambias de idea.');
    return;
  }
  if (Notification.permission !== 'granted') {
    const p = await Notification.requestPermission();
    if (p !== 'granted') { alert('Sin permiso no hay avisos. Si te arrepientes, activa las notificaciones en los ajustes del navegador.'); return; }
  }
  // 1) push real: llega con la pantalla bloqueada
  if (pushConfigured()) {
    try {
      await startPush();
      localStorage.setItem('f64-push', '1');
      localStorage.removeItem('f64-notif');
      if (notifTimer) { clearTimeout(notifTimer); notifTimer = null; }
      notifState();
      return;
    } catch (err) { console.warn('push falló', err); }
  }
  // 2) fallback: avisos mientras la app está abierta
  localStorage.setItem('f64-notif', 'on');
  scheduleNext();
  notifState();
  if (!pushConfigured()) {
    alert('Avisos de motivación activados (se disparan con la app abierta).\n\nPara que te lleguen con la pantalla bloqueada, sigue la guía PUSH-ACTIVACION.md del repo.');
  }
}

/* ---------- pestañas ---------- */
let cur = 'hoy';
const RENDER = { hoy: renderHoy, comidas: renderComidas, entrenar: renderEntrenar, plan: renderPlan };

function applyView() {
  const nevera = location.hash === '#nevera';
  const tabbar = $('#tabbar');
  tabbar.classList.toggle('hidden', nevera);
  $$('.tab').forEach(t => t.classList.toggle('active', !nevera && t.dataset.screen === cur));
  $$('.screen').forEach(se => se.classList.toggle('active', nevera ? se.id === 'screen-nevera' : se.id === 'screen-' + cur));
  window.scrollTo(0, 0);
  if (nevera) renderNevera();
  else RENDER[cur]();
}
function goTab(id) { cur = id; applyView(); }

$$('.tab').forEach(t => t.addEventListener('click', () => goTab(t.dataset.screen)));
$$('.card-link').forEach(a => a.addEventListener('click', () => goTab(a.dataset.go)));

/* ---------- NEVERA (pantalla del QR) ---------- */
function neveraMeals() {
  const di = todayIdx();
  const meals = [...SEMANA[di].meals];
  if (di === PLAN.libreDia) meals.push(CENA_LIBRE);
  return meals;
}
function neveraDone(s, m, i) { return m.free ? s.libre : !!s.done[mealId(todayIdx(), i)]; }

function renderNevera() {
  const { s, store } = state();
  const di = todayIdx();
  const meals = neveraMeals();
  const doneCount = meals.filter((m, i) => neveraDone(s, m, i)).length;
  const total = meals.length;
  const nextI = meals.findIndex((m, i) => !neveraDone(s, m, i));

  $('#nevera-date').textContent = 'LA NEVERA · ' + DIAS_LARGOS[di].toUpperCase();
  $('#nevera-progress').innerHTML =
    `<span>${doneCount} de ${total} comidas de hoy</span>` +
    `<i style="width:${Math.round(doneCount / total * 100)}%"></i>`;

  const content = $('#nevera-content');
  if (nextI === -1) {
    $('#nevera-title').textContent = 'Todo hecho, Mario.';
    $('#nevera-sub').textContent = 'Día completo. Mañana vuelves a escanear.';
    content.innerHTML = `
      <div class="nevera-done">
        <svg width="60" height="60" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>
        <h2>Comida y cena marcadas</h2>
        <p class="card-note">Has ganado el día, Mario. A dormir 8 horas. El plan de mañana te espera en la nevera.</p>
        <button class="done-btn" id="nevera-home">Ir a la app</button>
      </div>`;
    $('#nevera-home').addEventListener('click', neveraClose);
  } else {
    const m = meals[nextI];
    const when = m.free ? 'Cena · 21:00' : MOMENTOS[nextI][0] + ' · ' + MOMENTOS[nextI][1];
    $('#nevera-title').textContent = 'Hola, Mario.';
    $('#nevera-sub').textContent = when + ' · esto es lo que toca.';
    content.innerHTML = `
      <div class="meal nevera-meal">
        <div class="meal-top">
          <div><p class="meal-when">${when}${m.free ? ' <span class="free-tag">Día libre</span>' : ''}</p><h3 class="meal-name">${m.n}</h3></div>
          <div class="meal-nums"><div class="meal-kcal">${m.free ? 'a placer' : m.kcal + ' kcal'}</div><div class="meal-p">${m.free ? 'un plato + un postre' : m.p + ' g proteína'}</div></div>
        </div>
        <div class="meal-items">${m.items.map(it => `<span class="item">${it}</span>`).join('')}</div>
        <p class="meal-how"><b>Cómo se hace:</b> ${m.how}</p>
        <div class="meal-foot">
          <button class="done-btn" id="nevera-done">${m.free ? 'Marcar disfrutada' : 'Marcar hecha'} y ver qué sigue →</button>
        </div>
      </div>
      <article class="card tip-card">
        <p class="tip">"${msgFor(slotNow())}"</p>
      </article>`;
    $('#nevera-done').addEventListener('click', () => {
      const { s: st, store: sto } = state();
      if (m.free) st.libre = true;
      else st.done[mealId(di, nextI)] = true;
      sto(st);
      renderNevera();
    });
  }
  stagger();
}
function neveraClose() {
  history.replaceState(null, '', location.pathname);
  applyView();
}
$('#nevera-close').addEventListener('click', neveraClose);
window.addEventListener('hashchange', applyView);

/* entrada suave en cascada */
function stagger() {
  $$('.screen.active .content > *').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 6)));
}

/* ---------- arranque ---------- */
$('#btn-print').addEventListener('click', () => { renderQr(); setTimeout(() => window.print(), 60); });

// arranque de avisos: si ya tienes push, se renueva; si no, temporizador local
notifState();
scheduleNext();
syncPush();

renderQr();
applyView();

// registro del service worker (app instalable + offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW registro:', err));
  });
}