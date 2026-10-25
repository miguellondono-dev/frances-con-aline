/**
 * Catalogo de talleres.
 *
 * Un taller es un producto: tiene fecha, sitio, duracion y precio. Los datos
 * viven aqui y no repartidos por las paginas, porque los consumen la portada
 * de talleres, la ficha de cada taller, el inicio y el schema, y un dato
 * escrito tres veces se desincroniza a la primera correccion.
 *
 * Lo que cambia de una tanda a otra (fecha, hora, precio, cierre) va en
 * `tanda`. Un taller sin tanda esta "Próximamente": se enseña, pero sin
 * fechas ni precio, y el boton pide que le avisen.
 *
 * Los talleres se cierran solos: al pasar `tanda.iso.cierre`, las piezas de
 * "plazas abiertas" se cambian por las de "plazas cerradas". Lo hace
 * scripts/talleres-estado.ts en el navegador, y al compilar ya sale cerrado
 * si la fecha habia pasado. No hace falta tocar nada el dia del cierre.
 */

export type Tanda = {
  /** "Domingo 1 de noviembre" o "4 sábados de octubre". */
  cuando: string;
  /** "11:00 a 13:30". Sin "hrs" ni "h", que no aporta nada. */
  hora: string;
  precio: number;
  /** Fecha limite de inscripcion, legible: "30 de octubre". */
  cierre: string;
  /** Para el schema y para el cierre automatico, en ISO con hora de Paris. */
  iso: { inicia: string; termina: string; cierre: string };
  /** El sitio de esta tanda, si no basta con la ciudad: "The Muisca Gallery". */
  lugar?: string;
  /**
   * El link de pago (Stripe u otro). Con el, "Inscribirme" lleva a pagar y
   * WhatsApp queda para las preguntas. Sin el, la plaza se cierra por WhatsApp.
   */
  pago?: string;
  /**
   * Cuantas plazas hay en total. Se dice solo si esta el dato. Ojo: el limite
   * de pagos de Stripe cuenta compras, no plazas, y una compra puede llevar
   * varias. Las plazas vendidas se miran en el panel de Stripe.
   */
  plazas?: number;
  /** La politica de cancelacion, en una frase. Tiene que verse antes de pagar. */
  cancelacion?: string;
  /** Lo que pasa en la sesion, hora a hora. En la ficha sale como linea de tiempo. */
  programa?: { hora: string; titulo: string; detalle: string }[];
};

export type Taller = {
  slug: string;
  /** Nombre corto. Es el que va en la tarjeta y en el menu. */
  nombre: string;
  /** Titular de la pagina del taller. Dice que se gana, no que se hace. */
  titular: string;
  /** La palabra del titular que va en italica roja. */
  acento: string;
  /** Una linea en la tarjeta del indice. Maximo dos renglones. */
  resumen: string;
  parrafos: string[];
  /** Lo que se practica, en cosas concretas y nombrables. */
  practica: string[];
  sesiones: number;
  minutosPorSesion: number;
  /** Dia de la semana en schema.org, para los de varias sesiones. */
  diaSemana: 'Saturday' | 'Sunday';
  donde: string;
  ciudad: string;
  /** El nivel de francés que hace falta: "Desde A2". */
  nivel?: string;
  /** Lo que va incluido en el precio: "Materiales de pintura, té y café". */
  incluye?: string;
  /** Sin tanda, el taller esta "Próximamente". */
  tanda?: Tanda;
};

export const TALLERES: Taller[] = [
  {
    slug: 'acuarela',
    nombre: 'Acuarela en francés',
    titular: 'Aprende a hablar de arte en francés, con un pincel en la mano',
    acento: 'francés',
    resumen:
      'Una hora de francés para hablar de arte y una sesión de acuarela, con la pastelería francesa como tema.',
    parrafos: [
      'Es la primera edición de mi taller de francés y acuarela, y lo hago junto a la artista Miss S. Es para quien quiere aprender francés haciendo algo creativo: una hora de clase sobre arte y, después, pintamos en acuarela con la pastelería francesa como tema.',
      'Al salir de la clase sabrás describir una obra, dar tu opinión sobre ella y seguir cualquier taller de arte en francés, porque tendrás el vocabulario. En la segunda parte aprendes las técnicas de la acuarela y exploras tu creatividad. Te vas con tu lámina terminada y con palabras que ya no se te olvidan, porque las usaste para crear algo.',
    ],
    // En el orden de las escenas de TallerLanding: mezcla, vocabulario, boceto, lamina.
    practica: [
      'Técnicas de acuarela para principiantes',
      'Describir una obra y dar tu opinión',
      'La pastelería francesa como tema',
      'Una lámina terminada para llevarte',
    ],
    sesiones: 1,
    minutosPorSesion: 150,
    diaSemana: 'Sunday',
    donde: 'Presencial, en París',
    ciudad: 'París',
    nivel: 'Desde A2',
    incluye: 'Materiales de pintura, té y café',
    // Horario y sitio de la presentacion del taller (taller-acuarela-aline.netlify.app).
    tanda: {
      cuando: 'Domingo 1 de noviembre',
      hora: '10:30 a 13:00',
      precio: 45,
      cierre: '30 de octubre',
      iso: {
        inicia: '2026-11-01T10:30:00+01:00',
        termina: '2026-11-01T13:00:00+01:00',
        cierre: '2026-10-30T23:59:00+01:00',
      },
      lugar: 'The Muisca Gallery',
      programa: [
        { hora: '10:30', titulo: 'Llegada', detalle: 'Llegada y preparación del espacio' },
        { hora: '10:35', titulo: 'Clase de francés', detalle: 'Describir obras de arte y dar tu opinión, en francés' },
        { hora: '11:35', titulo: 'Técnica', detalle: 'Técnicas de acuarela para principiantes' },
        { hora: '12:35', titulo: 'Acabado', detalle: 'Terminas tu lámina' },
        { hora: '13:00', titulo: 'Cierre', detalle: 'Fin del taller' },
      ],
    },
  },
  {
    slug: 'teatro',
    nombre: 'Teatro en francés',
    titular: 'Cuatro sábados para perder la vergüenza de hablar',
    acento: 'vergüenza',
    resumen:
      'Escenas en grupo, improvisación y trabalenguas, sobre un escenario de verdad.',
    parrafos: [
      'Hablar en francés delante de otra gente da vergüenza, y esa vergüenza no se quita estudiando más gramática. Se quita repitiendo una escena hasta que suena, y descubriendo que equivocarse en voz alta no tiene consecuencias.',
      'El cuerpo y la escena hacen el trabajo que un cuaderno no puede hacer. Al final del taller subes a un escenario y representas lo que has montado, con vestuario y con público.',
    ],
    practica: [
      'Ejercicios de voz y de respiración',
      'Trabalenguas franceses',
      'Expresiones que no salen en los libros',
      'Escenas cortas en grupo',
      'Interpretación e improvisación',
    ],
    sesiones: 4,
    minutosPorSesion: 90,
    diaSemana: 'Saturday',
    donde: 'Presencial, en París',
    ciudad: 'París',
    // Sin tanda: la de octubre de 2026 no salio. Vuelve cuando haya fechas.
  },
];

export const porSlug = (slug: string) => TALLERES.find((t) => t.slug === slug)!;

export type Estado = 'abierto' | 'cerrado' | 'proximo';

/** El estado al compilar. En el navegador lo vuelve a mirar talleres-estado.ts. */
export const estadoDe = (t: Taller, ahora = Date.now()): Estado =>
  !t.tanda ? 'proximo' : ahora > Date.parse(t.tanda.iso.cierre) ? 'cerrado' : 'abierto';

/** Los abiertos primero: son los que se pueden reservar. */
export const enOrden = () => {
  const peso: Record<Estado, number> = { abierto: 0, cerrado: 1, proximo: 2 };
  return [...TALLERES].sort((a, b) => peso[estadoDe(a)] - peso[estadoDe(b)]);
};

/** El primer taller con plazas abiertas, si lo hay. */
export const tallerAbierto = () => TALLERES.find((t) => estadoDe(t) === 'abierto');

/** Lo que dice el WhatsApp de "Inscribirme", con la fecha de la tanda. */
export const mensajeInscripcion = (t: Taller) =>
  t.tanda
    ? `Hola, me gustaría inscribirme en el taller de ${t.slug} del ${t.tanda.cuando.toLowerCase()}.`
    : mensajeAviso(t);

/** Lo que dice el WhatsApp de las dudas, cuando la plaza se paga con el link de pago. */
export const mensajePregunta = (t: Taller) =>
  t.tanda
    ? `Hola, tengo una pregunta sobre el taller de ${t.slug} del ${t.tanda.cuando.toLowerCase()}.`
    : `Hola, tengo una pregunta sobre el taller de ${t.slug}.`;

/** Lo que dice el WhatsApp de "Avísame": sin fechas, o con las plazas cerradas. */
export const mensajeAviso = (t: Taller) =>
  t.tanda
    ? `Hola, me gustaría que me avises del próximo taller de ${t.slug}.`
    : `Hola, me gustaría que me avises cuando haya fechas para el taller de ${t.slug}.`;

/** "4 sesiones de 1 h 30" o "Una sesión de 2 h 30". */
export const formato = (t: Taller) => {
  const h = Math.floor(t.minutosPorSesion / 60);
  const m = t.minutosPorSesion % 60;
  const duracion = m ? `${h} h ${m}` : `${h} h`;
  return t.sesiones > 1 ? `${t.sesiones} sesiones de ${duracion}` : `Una sesión de ${duracion}`;
};

/** El dia de una tanda, partido para el talon de una entrada: "dom", "1", "nov". */
export const fechaTalon = (iso: string) => {
  const fecha = new Date(iso);
  const parte = (opciones: Intl.DateTimeFormatOptions) =>
    fecha.toLocaleDateString('es-ES', { timeZone: 'Europe/Paris', ...opciones }).replace('.', '');
  return {
    semana: parte({ weekday: 'short' }),
    dia: parte({ day: 'numeric' }),
    mes: parte({ month: 'short' }),
    largo: parte({ day: 'numeric', month: 'long' }),
  };
};

/**
 * Los tres hechos comparables de un taller, en orden fijo. La tarjeta y la
 * ficha usan esto, nunca su propia lista. Sin tanda, en vez de fecha y
 * precio, el formato y el sitio.
 */
export const hechos = (t: Taller) =>
  t.tanda
    ? [
        { clave: 'Cuándo', valor: t.tanda.cuando },
        { clave: 'Hora', valor: t.tanda.hora },
        { clave: 'Precio', valor: `${t.tanda.precio} €` },
        { clave: 'Dónde', valor: t.tanda.lugar ?? t.ciudad },
      ]
    : [
        { clave: 'Cuándo', valor: 'Próximamente' },
        { clave: 'Formato', valor: formato(t) },
        { clave: 'Dónde', valor: t.ciudad },
      ];

