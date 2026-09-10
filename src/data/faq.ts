/**
 * PREGUNTAS FRECUENTES
 *
 * Empiezan por el miedo real de quien quiere aprender un idioma, no por el
 * precio. El precio es la novena: quien llega hasta ahí ya decidió que le
 * interesa.
 *
 * Formato: la pregunta se escribe como la escribe una persona, y la respuesta
 * es una frase que responde entera. Una segunda solo si trae un dato nuevo.
 * Las respuestas de una palabra están permitidas y son las que mejor leen.
 *
 * De este archivo salen a la vez el HTML y el JSON-LD de FAQPage.
 */

export interface Pregunta {
  q: string;
  a: string;
  /** Marca las respuestas que dependen de una decision todavia sin tomar. */
  pendiente?: boolean;
}

export const FAQ_HOME: Pregunta[] = [
  {
    q: 'Me da vergüenza hablar y me bloqueo. ¿Cómo lo llevas?',
    a: 'Es lo más común que me encuentro, así que los primeros días te escucho bastante más de lo que te corrijo.',
  },
  {
    q: 'Ya intenté aprender francés antes y lo dejé. ¿Ahora qué cambia?',
    a: 'Empezamos por entender qué te hizo abandonar, porque casi siempre está en el material o en el ritmo.',
  },
  {
    q: 'Nunca hago las tareas. ¿Es un problema?',
    a: 'No, y si se repite es que te la puse demasiado larga, así que la recorto.',
  },
  {
    q: '¿Cuánto tiempo tengo que dedicarle por semana?',
    a: 'Una clase de una hora, y un rato corto entre medias para no llegar en frío a la siguiente.',
  },
  {
    q: '¿Necesito saber algo de francés para empezar?',
    a: 'No.',
  },
  {
    q: '¿Cuánto cuesta una clase de francés?',
    a: '35 € la hora, o 20 € por persona si vienen en grupo.',
  },
];

/** Genera el bloque FAQPage a partir de las mismas preguntas del HTML. */
export function faqSchema(preguntas: Pregunta[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas
      // Una respuesta pendiente no se publica como dato estructurado.
      .filter((p) => !p.pendiente)
      .map((p) => ({
        '@type': 'Question',
        name: p.q,
        acceptedAnswer: { '@type': 'Answer', text: p.a },
      })),
  };
}
