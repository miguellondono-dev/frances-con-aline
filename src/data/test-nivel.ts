/**
 * TEST DE NIVEL.
 *
 * Veinticinco preguntas repartidas en cinco bloques, de A1 a C1, con siete
 * formas distintas de preguntar. Las escribio Aline: aqui no se inventa ni se
 * corrige contenido, solo se estructura.
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
  subPreguntas: { id: string; enunciado: string; correcta: string }[];
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
    enunciado: '« Regarde, ___ voiture de Paul est devant ___ maison. »',
    opciones: ['le / le', 'la / la', 'la / le', 'le / la'],
    correcta: 'la / la',
    puntos: 2,
  },
  {
    id: 'a1-2',
    bloque: 'A1',
    tipo: 'opcion',
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
    enunciado:
      '« Elle travaille ___ Portugal, mais sa famille vit ___ Lisbonne et ___ États-Unis. »',
    opciones: ['en / à / aux', 'au / à / aux', 'au / en / dans les', 'dans le / à / en'],
    correcta: 'au / à / aux',
    puntos: 3,
  },
  {
    id: 'a2-7',
    bloque: 'A2',
    tipo: 'ordenar',
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
    enunciado:
      'Décris ta routine du matin, du réveil jusqu’au moment où tu sors de chez toi. Utilise au moins deux verbes pronominaux et deux connecteurs temporels.',
    minPalabras: 30,
    maxPalabras: 45,
    puntos: 6,
  },

  // --- Bloque B1 ---
  {
    id: 'b1-10',
    bloque: 'B1',
    tipo: 'huecos',
    enunciado: 'Conjuga los verbos entre paréntesis en el tiempo correcto.',
    texto:
      '« Quand je ___ (être) petit, nous ___ (aller) à la mer tous les étés. Un jour, mon frère ___ (se casser) le bras. »',
    correctas: ['étais', 'allions', 's’est cassé'],
    puntos: 4,
  },
  {
    id: 'b1-11',
    bloque: 'B1',
    tipo: 'opcion',
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
    enunciado:
      'Écris un message à un(e) ami(e). Vous deviez vous retrouver ce week-end, mais tu dois annuler. Explique ce qui s’est passé et propose une autre date. Utilise au moins un passé composé, un imparfait et une forme de futur.',
    minPalabras: 60,
    maxPalabras: 80,
    puntos: 8,
  },

  // --- Bloque B2 ---
  {
    id: 'b2-16',
    bloque: 'B2',
    tipo: 'opcion',
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
    enunciado: 'Escucha y responde.',
    textoAudio:
      'Bon, franchement, j’te dis pas la galère. On a poireauté deux plombes devant la salle, et au final le mec, il est même pas venu.',
    subPreguntas: [
      {
        id: 'b2-20a',
        enunciado: 'Combien de temps ont-ils attendu environ ?',
        correcta: 'deux heures',
      },
      {
        id: 'b2-20b',
        enunciado: 'La personne qu’ils attendaient est-elle venue ?',
        correcta: 'non',
      },
    ],
    puntos: 4,
  },
  {
    id: 'b2-21',
    bloque: 'B2',
    tipo: 'huecos',
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
    enunciado: '« À peine ___ que le téléphone a sonné. »',
    opciones: ['il était entré', 'était-il entré', 'qu’il était entré', 'il est entré'],
    correcta: 'était-il entré',
    puntos: 4,
  },
  {
    id: 'c1-24',
    bloque: 'C1',
    tipo: 'redaccion',
    enunciado:
      'a) Réécris en style nominal et formel : « Comme les prix ont augmenté, les ventes ont baissé. »\n\nb) Ajoute 25-35 mots pour expliquer, dans un registre formel, une conséquence possible pour l’entreprise. Utilise un connecteur de conséquence.',
    minPalabras: 25,
    maxPalabras: 45,
    puntos: 8,
  },
  {
    id: 'c1-25',
    bloque: 'C1',
    tipo: 'opcion',
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
