/**
 * PREGUNTAS FRECUENTES
 *
 * Empiezan por el miedo real de quien quiere aprender un idioma, no por el
 * precio. El precio va al final: quien llega hasta ahí ya decidió que le
 * interesa. Miguel quitó en septiembre de 2026 las de tareas y tiempo por
 * semana: no aportaban.
 *
 * Formato: la pregunta se escribe como la escribe una persona, y la respuesta
 * responde entera en una o dos frases. Sin respuestas de una palabra: un "No."
 * suelto sonaba seco.
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
    a: 'Es normal, y le pasa a casi todo el mundo al principio. Empezamos con frases cortas y temas que te resultan cómodos, sin corregirte cada palabra, y poco a poco hablar deja de darte miedo.',
  },
  {
    q: 'Ya intenté aprender francés antes y lo dejé. ¿Ahora qué cambia?',
    a: 'Empezamos por entender qué te hizo abandonar, porque casi siempre está en el material o en el ritmo.',
  },
  {
    q: '¿Necesito saber algo de francés para empezar?',
    a: 'No, porque mis clases te permiten aprender desde cualquier nivel. Veremos las bases juntos: lo único que necesitas son las ganas de aprender.',
  },
  {
    q: '¿Cuánto cuesta una clase de francés?',
    a: '35 € la hora en clase privada, o 20 € la hora por persona en las clases grupales (a partir de 2 personas).',
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
