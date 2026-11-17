/* FORJA · mensajes del entrenador (los usa la app y el service worker)
   Tono pedido por Mario: entrenador exigente, sin mensajes suaves. */
var FORJA_TITULOS = ['A entrenar, Mario', 'Media jornada, Mario', 'Cierre del día, Mario'];
var FORJA_MSG = [
  [ // mañana · 10:30 · el entreno
    'Te has despertado. Ahora mismo hay dos opciones: 25 minutos de entreno o 25 minutos de TikTok. Una te acerca a Asia y la otra te deja donde estás.',
    'Nadie va a venir a ponerte en forma. Ni el gimnasio que no te gusta ni el coche que no tienes. Suelo, ropa cómoda y a sudar.',
    'Las ganas no van a llegar. Nunca llegan. Empieza sin ellas y aparecen al tercer ejercicio.',
    'Dijiste que no te gusta tu cuerpo. Pues o lo cambias o te callas. Hoy toca cambiarlo.',
    '¿Que no tienes tiempo? Pasas más de 6 horas al día en el móvil. 25 minutos los tienes de sobra.',
    'Cuando ibas al gimnasio te sentías bien. Ese tío sigue ahí debajo. Sácalo.',
    'Ya lo dejaste una vez por falta de motivación. Esta vez no dependes de la motivación: dependes de la rutina. Al suelo.',
    'Nadie te ve entrenar en casa. No hay excusa de vergüenza. Solo tú contra tu pereza.',
    'Quieres facturar 10.000 al mes. Quien no es capaz de hacer 25 minutos de sentadillas no aguanta un mes de ventas duras.',
    'Primero el entreno, luego el móvil. Ni un vistazo antes de terminar.',
    'Si hoy no puedes con todo, haz la versión mínima de 10 minutos. Cero no es una opción.',
    'Hoy no tienes que hacerlo perfecto. Tienes que hacerlo. Venga.',
    'Cada sentadilla de hoy es un kilo menos de excusas. Muévete.',
    'Te quieres ir a vivir a Bali en tu mejor forma. Bali no espera a los que se quedan en la cama.',
  ],
  [ // tarde · 15:00 · comida y agua
    '¿Has comido proteína o has comido lo que había? Lo que había te ha traído a 70 kilos. Cambia el plato.',
    '¿Cuántos vasos de agua llevas? Si son menos de 4, levántate ahora y bebe dos.',
    'Comes poco pero comes mal. La solución no es comer menos, es comer mejor. Proteína en el plato.',
    'Con hambre a media tarde se toman malas decisiones. Bebe agua y aguanta hasta la cena.',
    'Lo que comas hoy es lo que verás en la foto del domingo. Piénsalo antes de abrir la nevera.',
    'Dos comidas, las dos con proteína. No es complicado. Es disciplina.',
    'Tu cuerpo no quema porque no se mueve. Si no has entrenado esta mañana, todavía estás a tiempo. Ahora.',
    'Pídete el agua grande. Tu cuerpo lleva toda la vida medio seco y así no rinde nadie.',
    'Picar no te va a quitar el estrés. Te va a quitar los abdominales que todavía no tienes.',
    'La mitad del día ya ha pasado. ¿La has ganado o la has regalado?',
    'Hoy no tienes que ser un monje. Tienes que cumplir dos cosas. Mira la app y cúmplelas.',
    'Si hoy comes con tu novia, empieza por la proteína y para cuando estés lleno al 80 %. Puedes disfrutar sin destrozar la semana.',
    'Cada vez que dices «mañana empiezo», el Mario de dentro de un año se queda más lejos.',
    'Agua, proteína y movimiento. Tres cosas. Ni una más. Ni una menos.',
  ],
  [ // noche · 23:00 · cierre
    'Cierra el día: marca lo que hiciste y mira lo que no. Si fallaste algo, que sea la última vez esta semana.',
    'Fallar un día no rompe nada. Fallar dos seguidos es empezar a dejarlo. Mañana no se falla.',
    '¿Has cumplido hoy? Si sí, bien, pero no te lo creas: mañana vuelve a contar. Si no, mañana lo pagas con el entreno completo.',
    'Ahora viene la parte peligrosa: el móvil en la cama. Cada hora de TikTok a las 2 de la mañana es una hora menos de recuperación.',
    'Deja la ropa de entrenar preparada al lado de la cama. Mañana no hay que pensar, solo ponérsela.',
    'Te cuesta dormirte porque la cabeza no para. Apaga la pantalla 30 minutos antes y verás.',
    'Hoy eras un poco mejor que ayer o un poco peor. No hay término medio. ¿Cuál ha sido?',
    'Ni el gimnasio caro ni el coche: lo que te faltaba era constancia. Hoy la has entrenado o no.',
    'Tus metas no se cumplen el día que lo decides. Se cumplen en noches como esta, sin nadie mirando.',
    'Mañana a las 10:30 te escribo. Que me pilles ya con el entreno hecho.',
    'Si hoy fallaste, no te castigues. Corrígelo. Mañana, entreno completo y dos comidas limpias.',
    'Pésate mañana al levantarte, antes de beber nada. Los números no mienten aunque tú quieras.',
    'Ganar un día no cuesta. Lo que cuesta es ganar 60 seguidos. Por eso lo vas a hacer.',
    'Quien quiere vivir desde cualquier parte del mundo primero tiene que mandar en su propio día. Manda en el de mañana.',
  ],
];
function forjaSlot(h) { return (h >= 5 && h < 14) ? 0 : (h >= 14 && h < 21) ? 1 : 2; }
function forjaMsg(slot, dia) {
  var lista = FORJA_MSG[slot];
  return lista[(dia * 5 + slot * 3) % lista.length];
}
