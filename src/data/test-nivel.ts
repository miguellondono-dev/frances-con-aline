/**
 * TEST DE NIVEL.
 *
 * Veinticinco preguntas repartidas en cinco bloques, de A1 a C1, con siete
 * formas distintas de preguntar. Las escribio Aline.
 *
 * Revision de septiembre de 2026, a peticion de Miguel:
 *  - b1-10 decia "Quand je ___ (être)", y la respuesta correcta obligaba a
 *    escribir "je étais". Ahora el sujeto es "mon frère et moi".
 *  - a2-6 hacia trabajar a alguien "en Portugal" con la familia "en Lisboa",
 *    que tambien es Portugal. Ahora la familia esta en Marsella.
 *  - Las redacciones llevan la consigna en español, como el resto.
 *  - La pregunta de audio acepta "2 heures", "2h" o "dos horas".
 *
 * Cada pregunta lleva su area (articulos, pasado, pronombres...). Con eso el
 * resultado dice fortalezas y donde mejorar, no solo un nivel.
 *
 * Cada bloque suma sus puntos por separado. El nivel no sale de la nota
 * global sino del porcentaje de cada bloque, y eso es lo que impide que
 * alguien que acierta cuatro cosas sueltas de C1 salga como C1.
 *
 * Las redacciones no se corrigen solas: no hay forma honesta de puntuar un
 * texto libre con una comparacion de cadenas. Se guardan tal cual y quedan
 * marcadas para revision. Lo demas si se corrige al vuelo.
 */

export type Bloque = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/** Lo que mide cada pregunta. Sale en el resultado como fortaleza o mejora. */
export type Area =
  | 'articulos'
  | 'presente'
  | 'frase'
  | 'pasado'
  | 'comparar'
  | 'pronombres'
  | 'subjuntivo'
  | 'participio'
  | 'lectura'
  | 'escucha'
  | 'vocabulario'
  | 'conectores'
  | 'escritura';

export type TipoPregunta =
  | 'opcion'
  | 'verdadero-falso'
  | 'huecos'
  | 'ordenar'
  | 'redaccion'
  | 'emparejar'
  | 'audio';

interface Base {
  id: string;
  bloque: Bloque;
  tipo: TipoPregunta;
  area: Area;
  enunciado: string;
  puntos: number;
}

export interface Opcion extends Base {
  tipo: 'opcion';
  opciones: string[];
  correcta: string;
}

export interface VerdaderoFalso extends Base {
  tipo: 'verdadero-falso';
  afirmaciones: { texto: string; verdadera: boolean }[];
}

export interface Huecos extends Base {
  tipo: 'huecos';
  /** Cada ___ es un hueco. */
  texto: string;
  correctas: string[];
}

export interface Ordenar extends Base {
  tipo: 'ordenar';
  palabras: string[];
  ordenCorrecto: string;
}

export interface Redaccion extends Base {
  tipo: 'redaccion';
  minPalabras: number;
  maxPalabras: number;
}

export interface Emparejar extends Base {
  tipo: 'emparejar';
  parejas: { izquierda: string; derecha: string }[];
}

export interface Audio extends Base {
  tipo: 'audio';
  /** No hay archivo de sonido: lo lee el propio navegador. */
  textoAudio: string;
  /** alternativas: otras formas validas de decir lo mismo ("2h", "dos horas"). */
  subPreguntas: { id: string; enunciado: string; correcta: string; alternativas?: string[] }[];
}

export type Pregunta =
  | Opcion
  | VerdaderoFalso
  | Huecos
  | Ordenar
  | Redaccion
  | Emparejar
  | Audio;

export const PREGUNTAS: Pregunta[] = [
  // --- Bloque A1 ---
  {
    id: 'a1-1',
    bloque: 'A1',
    tipo: 'opcion',
    area: 'articulos',
    enunciado: '« Regarde, ___ voiture de Paul est devant ___ maison. »',
    opciones: ['le / le', 'la / la', 'la / le', 'le / la'],
    correcta: 'la / la',
    puntos: 2,
  },
  {
    id: 'a1-2',
    bloque: 'A1',
    tipo: 'opcion',
    area: 'presente',
    enunciado:
      '« — Vous ___ d’où ? — Nous ___ de Colombie, mais nous ___ à Paris depuis un an. »',
    opciones: [
      'venez / venons / habitons',
      'venez / venez / habitez',
      'venir / venons / habite',
      'vient / venons / habitons',
    ],
    correcta: 'venez / venons / habitons',
    puntos: 2,
  },
  {
    id: 'a1-3',
    bloque: 'A1',
    tipo: 'verdadero-falso',
    area: 'lectura',
    enunciado:
      'Lee el mensaje y responde.\n\n« Salut ! Je ne peux pas venir ce soir, j’ai trop de travail. On se voit demain midi ? Bises, Léa »',
    afirmaciones: [
      { texto: 'Léa propose de se retrouver ce soir.', verdadera: false },
      { texto: 'Léa explique pourquoi elle annule.', verdadera: true },
    ],
    puntos: 2,
  },
  {
    id: 'a1-4',
    bloque: 'A1',
    tipo: 'huecos',
    area: 'frase',
    enunciado: 'Completa los dos huecos.',
    texto: '« Je ___ mange ___ viande, je suis végétarien. »',
    correctas: ['ne', 'pas de'],
    puntos: 2,
  },

  // --- Bloque A2 ---
  {
    id: 'a2-5',
    bloque: 'A2',
    tipo: 'opcion',
    area: 'pasado',
    enunciado:
      '« Hier, Marie ___ à la gare à huit heures et elle ___ le train de Lyon. »',
    opciones: [
      'est arrivée / a pris',
      'a arrivé / a pris',
      'est arrivé / est pris',
      'a arrivée / a prise',
    ],
    correcta: 'est arrivée / a pris',
    puntos: 3,
  },
  {
    id: 'a2-6',
    bloque: 'A2',
    tipo: 'opcion',
    area: 'articulos',
    enunciado:
      '« Elle travaille ___ Portugal, mais sa famille vit ___ Marseille et ses amis ___ États-Unis. »',
    opciones: ['en / à / aux', 'au / à / aux', 'au / en / dans les', 'dans le / à / en'],
    correcta: 'au / à / aux',
    puntos: 3,
  },
  {
    id: 'a2-7',
    bloque: 'A2',
    tipo: 'ordenar',
    area: 'frase',
    enunciado: 'Ordena las palabras para formar una pregunta correcta.',
    palabras: [
      'à',
      'mon',
      'message',
      'est-ce que',
      'tu',
      'n’as',
      'pas',
      'répondu',
      'Pourquoi',
      '?',
    ],
    ordenCorrecto: 'Pourquoi est-ce que tu n’as pas répondu à mon message ?',
    puntos: 3,
  },
  {
    id: 'a2-8',
    bloque: 'A2',
    tipo: 'opcion',
    area: 'comparar',
    enunciado:
      '« Ce restaurant est (1) ___ que l’autre : on y mange (2) ___ et c’est (3) ___ de la ville. »',
    opciones: [
      'meilleur / mieux / le meilleur',
      'mieux / meilleur / le mieux',
      'plus bon / plus bien / le plus bon',
      'meilleur / meilleur / le meilleur',
    ],
    correcta: 'meilleur / mieux / le meilleur',
    puntos: 3,
  },
  {
    id: 'a2-9',
    bloque: 'A2',
    tipo: 'redaccion',
    area: 'escritura',
    enunciado:
      'Escribe en francés tu rutina de la mañana, desde que te despiertas hasta que sales de casa. Usa al menos dos verbos pronominales y dos conectores de tiempo.',
    minPalabras: 30,
    maxPalabras: 45,
    puntos: 6,
  },

  // --- Bloque B1 ---
  {
    id: 'b1-10',
    bloque: 'B1',
    tipo: 'huecos',
    area: 'pasado',
    enunciado: 'Conjuga los verbos entre paréntesis en el tiempo correcto.',
    texto:
      '« Quand mon frère et moi ___ (être) petits, nous ___ (aller) à la mer tous les étés. Un jour, il ___ (se casser) le bras. »',
    correctas: ['étions', 'allions', 's’est cassé'],
    puntos: 4,
  },
  {
    id: 'b1-11',
    bloque: 'B1',
    tipo: 'opcion',
    area: 'pronombres',
    enunciado: 'Elige la frase correcta.\n« — Tu as rendu les livres à Paul ? »',
    opciones: [
      'Oui, je lui les ai rendus lundi.',
      'Oui, je les lui ai rendus lundi.',
      'Oui, je les lui ai rendu lundi.',
      'Oui, je les y ai rendus lundi.',
    ],
    correcta: 'Oui, je les lui ai rendus lundi.',
    puntos: 4,
  },
  {
    id: 'b1-12',
    bloque: 'B1',
    tipo: 'huecos',
    area: 'pronombres',
    enunciado: 'Completa el diálogo.',
    texto:
      '« — T’as encore besoin de ton dictionnaire ? — Non, j’___ ai plus besoin, tu peux ___ prendre. »',
    correctas: ['en', 'le'],
    puntos: 4,
  },
  {
    id: 'b1-13',
    bloque: 'B1',
    tipo: 'huecos',
    area: 'subjuntivo',
    enunciado: 'Conjuga los verbos entre paréntesis.',
    texto:
      '« Il faut que tu ___ (être) là avant midi, bien que ce ___ (être) difficile pour toi. »',
    correctas: ['sois', 'soit'],
    puntos: 4,
  },
  {
    id: 'b1-14',
    bloque: 'B1',
    tipo: 'huecos',
    area: 'pronombres',
    enunciado: 'Completa con el pronombre relativo adecuado.',
    texto:
      '« C’est le film ___ je t’ai parlé, ___ a gagné le prix ___ tout le monde attendait. »',
    correctas: ['dont', 'qui', 'que'],
    puntos: 4,
  },
  {
    id: 'b1-15',
    bloque: 'B1',
    tipo: 'redaccion',
    area: 'escritura',
    enunciado:
      'Escribe en francés un mensaje a un amigo o una amiga. Habían quedado este fin de semana, pero tienes que cancelar. Cuenta qué pasó y propón otra fecha. Usa al menos un passé composé, un imparfait y una forma de futuro.',
    minPalabras: 60,
    maxPalabras: 80,
    puntos: 8,
  },

  // --- Bloque B2 ---
  {
    id: 'b2-16',
    bloque: 'B2',
    tipo: 'opcion',
    area: 'pronombres',
    enunciado:
      '« Il m’a expliqué ___ il avait besoin, mais pas ___ le dérangeait vraiment. »',
    opciones: ['ce que / ce qui', 'ce dont / ce qui', 'ce dont / ce que', 'dont / qui'],
    correcta: 'ce dont / ce qui',
    puntos: 4,
  },
  {
    id: 'b2-17',
    bloque: 'B2',
    tipo: 'huecos',
    area: 'participio',
    enunciado: 'Escribe el participio pasado con la forma correcta.',
    texto:
      '« Elles se sont ___ (parler) longuement, puis elles se sont ___ (laver) les mains. »',
    correctas: ['parlé', 'lavé'],
    puntos: 4,
  },
  {
    id: 'b2-18',
    bloque: 'B2',
    tipo: 'opcion',
    area: 'vocabulario',
    enunciado:
      '« Après trois heures de désaccord, chacun a fait des concessions et on a fini par ___. »',
    opciones: [
      'tomber dans les pommes',
      'trouver un terrain d’entente',
      'mettre la main à la pâte',
      'prendre ses jambes à son cou',
    ],
    correcta: 'trouver un terrain d’entente',
    puntos: 4,
  },
  {
    id: 'b2-19',
    bloque: 'B2',
    tipo: 'emparejar',
    area: 'vocabulario',
    enunciado: 'Asocia cada frase con su registro.',
    parejas: [
      { izquierda: '« T’as pas un stylo ? »', derecha: 'familier' },
      {
        izquierda: '« Auriez-vous l’obligeance de patienter un instant ? »',
        derecha: 'soutenu',
      },
      {
        izquierda: '« Est-ce que vous pouvez attendre un instant ? »',
        derecha: 'courant',
      },
    ],
    puntos: 4,
  },
  {
    id: 'b2-20',
    bloque: 'B2',
    tipo: 'audio',
    area: 'escucha',
    enunciado: 'Escucha y responde.',
    textoAudio:
      'Bon, franchement, j’te dis pas la galère. On a poireauté deux plombes devant la salle, et au final le mec, il est même pas venu.',
    subPreguntas: [
      {
        id: 'b2-20a',
        enunciado: 'Combien de temps ont-ils attendu environ ?',
        correcta: 'deux heures',
        alternativas: ['2 heures', '2h', '2 h', 'deux h', 'dos horas', '2 horas'],
      },
      {
        id: 'b2-20b',
        enunciado: 'La personne qu’ils attendaient est-elle venue ?',
        correcta: 'non',
        alternativas: ['no'],
      },
    ],
    puntos: 4,
  },
  {
    id: 'b2-21',
    bloque: 'B2',
    tipo: 'huecos',
    area: 'conectores',
    enunciado:
      'Completa con tres conectores. Sobran dos.\nContrairement aux · Néanmoins · dans la mesure où · En effet · Bien que',
    texto:
      'a. ___ prévisions, le nombre d’inscriptions a chuté.\nb. Le nombre d’inscriptions a chuté. ___, l’équipe maintient le projet.\nc. Le projet a pu être maintenu ___ l’équipe a obtenu de nouveaux financements.',
    correctas: ['Contrairement aux', 'Néanmoins', 'dans la mesure où'],
    puntos: 4,
  },

  // --- Bloque C1 ---
  {
    id: 'c1-22',
    bloque: 'C1',
    tipo: 'opcion',
    area: 'subjuntivo',
    enunciado: '« Si nous ___ prévenus à temps, nous ___ autrement. »',
    opciones: [
      'avions été / aurions réagi',
      'aurions été / avions réagi',
      'serions / réagirions',
      'étions / réagirions',
    ],
    correcta: 'avions été / aurions réagi',
    puntos: 4,
  },
  {
    id: 'c1-23',
    bloque: 'C1',
    tipo: 'opcion',
    area: 'conectores',
    enunciado: '« À peine ___ que le téléphone a sonné. »',
    opciones: ['il était entré', 'était-il entré', 'qu’il était entré', 'il est entré'],
    correcta: 'était-il entré',
    puntos: 4,
  },
  {
    id: 'c1-24',
    bloque: 'C1',
    tipo: 'redaccion',
    area: 'escritura',
    enunciado:
      'a) Reescribe en francés, en estilo nominal y formal: « Comme les prix ont augmenté, les ventes ont baissé. »\n\nb) Añade entre 25 y 35 palabras, en registro formal, sobre una consecuencia posible para la empresa. Usa un conector de consecuencia.',
    minPalabras: 25,
    maxPalabras: 45,
    puntos: 8,
  },
  {
    id: 'c1-25',
    bloque: 'C1',
    tipo: 'opcion',
    area: 'lectura',
    enunciado:
      'Lee el intercambio y elige la interpretación más precisa.\n« — Alors, ce nouveau collaborateur ? — Disons qu’il a beaucoup de bonne volonté. »',
    opciones: [
      'Hace un elogio sin reservas del colaborador.',
      'Indica sobre todo que es muy ambicioso.',
      'Expresa, de forma atenuada, reservas sobre sus competencias.',
      'Dice que no lo conoce lo bastante para opinar.',
    ],
    correcta: 'Expresa, de forma atenuada, reservas sobre sus competencias.',
    puntos: 6,
  },
];

/** Los cinco bloques, en orden. Se recorren asi para no saltarse ninguno. */
export const BLOQUES: Bloque[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Cada area con su nombre para el resultado y un consejo concreto de por
 * donde seguir. La escritura no se corrige sola: la lee Aline.
 */
export const AREAS: Record<Area, { nombre: string; consejo: string }> = {
  articulos: {
    nombre: 'Artículos y preposiciones',
    consejo:
      'Aprende cada palabra con su artículo (la voiture, le pays) y repasa au, en y aux con países y ciudades.',
  },
  presente: {
    nombre: 'Verbos en presente',
    consejo:
      'Repasa en voz alta los irregulares más usados (être, avoir, aller, venir, faire) con todas las personas.',
  },
  frase: {
    nombre: 'Negación y preguntas',
    consejo:
      'Practica ne… pas, ne… plus y las preguntas con est-ce que, primero en presente y luego en pasado.',
  },
  pasado: {
    nombre: 'Tiempos del pasado',
    consejo:
      'Trabaja la diferencia entre passé composé e imparfait, y qué verbos se conjugan con être.',
  },
  comparar: {
    nombre: 'Comparativos',
    consejo: 'Fíjate en los irregulares: meilleur acompaña a un nombre y mieux a un verbo.',
  },
  pronombres: {
    nombre: 'Pronombres',
    consejo:
      'Practica le, la, lui, leur, en, y y los relativos qui, que, dont sustituyendo complementos en frases cortas.',
  },
  subjuntivo: {
    nombre: 'Subjuntivo y condicional',
    consejo:
      'Repasa las expresiones que piden subjuntivo (il faut que, bien que) y las frases con si en pasado.',
  },
  participio: {
    nombre: 'Concordancia del participio',
    consejo:
      'Repasa cuándo concuerda el participio con los verbos pronominales: se parler no concuerda, se lever sí.',
  },
  lectura: {
    nombre: 'Comprensión escrita',
    consejo:
      'Lee textos reales y cortos (mensajes, prensa) y resume en una frase lo que el autor quiere decir, no solo lo que dice.',
  },
  escucha: {
    nombre: 'Comprensión oral',
    consejo:
      'Escucha francés hablado de verdad, con expresiones coloquiales: series, pódcast y conversaciones.',
  },
  vocabulario: {
    nombre: 'Vocabulario y registro',
    consejo:
      'Aprende expresiones hechas en su contexto y distingue el registro familiar, el corriente y el formal.',
  },
  conectores: {
    nombre: 'Conectores y estilo',
    consejo:
      'Amplía tus conectores (néanmoins, dans la mesure où, à peine…) y úsalos cada vez que escribas.',
  },
  escritura: {
    nombre: 'Expresión escrita',
    consejo: 'Tus textos los leo yo: con ellos te confirmo el nivel.',
  },
};

/** Lo que alguien puede hacer en cada nivel, en palabras normales. */
export const NIVELES: Record<Bloque | 'Pre-A1', { etiqueta: string; puedes: string }> = {
  'Pre-A1': {
    etiqueta: 'Empezando',
    puedes: 'Estás dando tus primeros pasos: conoces palabras sueltas y algunas frases hechas.',
  },
  A1: {
    etiqueta: 'Principiante',
    puedes: 'Te presentas, pides cosas sencillas y entiendes frases muy básicas.',
  },
  A2: {
    etiqueta: 'Básico',
    puedes:
      'Te desenvuelves en lo cotidiano: compras, direcciones, tu rutina y lo que hiciste ayer.',
  },
  B1: {
    etiqueta: 'Intermedio',
    puedes: 'Te manejas de viaje, cuentas experiencias y das tu opinión con frases sencillas.',
  },
  B2: {
    etiqueta: 'Intermedio alto',
    puedes: 'Conversas con fluidez con nativos, entiendes ideas complejas y defiendes tu punto de vista.',
  },
  C1: {
    etiqueta: 'Avanzado',
    puedes:
      'Te expresas con soltura y precisión, captas matices y usas el francés en el trabajo o en la universidad.',
  },
};

/** Para que aprende francés quien hace el test. Personaliza el resultado. */
export const OBJETIVOS = [
  'Viajar',
  'Trabajar',
  'Estudiar',
  'Vivir en un país francófono',
  'Preparar el DELF',
  'Por gusto',
];
