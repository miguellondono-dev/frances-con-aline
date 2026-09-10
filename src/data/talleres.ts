/**
 * Catalogo de talleres.
 *
 * Un taller es un producto: tiene fecha, sitio, duracion y precio. Los cuatro
 * datos viven aqui y no repartidos por las paginas, porque los consumen la
 * rejilla del indice, la ficha de cada taller y el schema, y un dato escrito
 * tres veces se desincroniza a la primera correccion.
 *
 * Los tres hechos que deciden una compra (cuando, cuanto dura, cuanto cuesta)
 * se llaman igual y salen en el mismo orden en todos los talleres. Sin eso no
 * se pueden comparar de un vistazo, que es justo para lo que existe el indice.
 */

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

  /* --- Los tres hechos, en este orden, siempre --- */
  /** "4 sábados de octubre" o "Un domingo de octubre". */
  cuando: string;
  /** Los dias sueltos, para el detalle: "10, 17, 24 y 31". */
  dias: string;
  /** "11:00 a 12:30". Sin "hrs" ni "h", que no aporta nada. */
  hora: string;
  precio: number;

  /* --- Resto --- */
  sesiones: number;
  minutosPorSesion: number;
  donde: string;
  ciudad: string;
  /** Fecha limite de inscripcion, legible. */
  cierre: string;

  /* --- Para el schema, en ISO --- */
  iso: { inicia: string; termina: string; cierre: string };
};

export const TALLERES: Taller[] = [
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
    cuando: '4 sábados de octubre',
    dias: '10, 17, 24 y 31',
    hora: '11:00 a 12:30',
    precio: 65,
    sesiones: 4,
    minutosPorSesion: 90,
    donde: 'Presencial, en París',
    ciudad: 'París',
    cierre: '8 de octubre',
    iso: {
      inicia: '2026-10-10T11:00:00+02:00',
      termina: '2026-10-31T12:30:00+01:00',
      cierre: '2026-10-08',
    },
  },
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
    cuando: 'Un domingo de octubre',
    dias: '18',
    hora: '11:00 a 13:30',
    precio: 30,
    sesiones: 1,
    minutosPorSesion: 150,
    donde: 'Presencial, en París',
    ciudad: 'París',
    cierre: '16 de octubre',
    iso: {
      inicia: '2026-10-18T11:00:00+02:00',
      termina: '2026-10-18T13:30:00+02:00',
      cierre: '2026-10-16',
    },
  },
];

export const porSlug = (slug: string) => TALLERES.find((t) => t.slug === slug)!;

/**
 * Los tres hechos comparables de un taller, en orden fijo.
 * La tarjeta y la ficha usan esto, nunca su propia lista: en cuanto cada sitio
 * elige que enseñar y en que orden, se acaba la comparacion.
 */
export const hechos = (t: Taller) => [
  { clave: 'Cuándo', valor: t.cuando },
  { clave: 'Hora', valor: t.hora },
  { clave: 'Precio', valor: `${t.precio} €` },
];

/**
 * Un elemento de la galeria de un taller. Los videos llevan siempre poster:
 * sin el, una celda vacia hasta que alguien le da al play.
 */
export type Medio =
  | { tipo: 'foto'; src: ImageMetadata; alt: string; ancho?: 1 | 2 }
  | { tipo: 'video'; src: string; poster: ImageMetadata; alt: string; ancho?: 1 | 2 };
