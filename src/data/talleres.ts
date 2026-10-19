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
  /** Sin tanda, el taller esta "Próximamente". */
  tanda?: Tanda;
};

export const TALLERES: Taller[] = [
  {
    slug: 'acuarela',
    nombre: 'Acuarela en francés',
    titular: 'Un domingo pintando, con las manos ocupadas y el francés suelto',
    acento: 'francés',
    resumen:
      'Una sesión, una lámina terminada y el vocabulario del color y de la luz.',
    parrafos: [
      'Se pinta con acuarela y se habla en francés mientras se pinta. Las manos ocupadas quitan la presión: cuando estás mezclando un color, dejas de vigilar cada palabra que dices y el idioma empieza a salir solo.',
      'Trabajamos el vocabulario del color, de la luz y del gesto, que es el que no aparece en ninguna clase normal. Te vas con una lámina terminada y con un puñado de palabras que ya no se te olvidan, porque las usaste para hacer algo.',
    ],
    practica: [
      'Mezcla de color y aguadas',
      'El vocabulario del color y de la luz',
      'Bocetos rápidos del natural',
      'Una lámina terminada para llevarte',
    ],
    sesiones: 1,
    minutosPorSesion: 150,
    diaSemana: 'Sunday',
    donde: 'Presencial, en París',
    ciudad: 'París',
    tanda: {
      cuando: 'Domingo 1 de noviembre',
      hora: '11:00 a 13:30',
      precio: 45,
      cierre: '30 de octubre',
      iso: {
        inicia: '2026-11-01T11:00:00+01:00',
        termina: '2026-11-01T13:30:00+01:00',
        cierre: '2026-10-30T23:59:00+01:00',
      },
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
        { clave: 'Dónde', valor: t.ciudad },
      ]
    : [
        { clave: 'Cuándo', valor: 'Próximamente' },
        { clave: 'Formato', valor: formato(t) },
        { clave: 'Dónde', valor: t.ciudad },
      ];

