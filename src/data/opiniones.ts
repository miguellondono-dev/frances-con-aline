/**
 * Opiniones reales de alumnos de Aline, que Miguel paso en capturas el
 * 2026-10-19. Mismas palabras que escribieron; solo se corrigieron tildes y
 * puntuacion para que se lean bien (Miguel pidio un texto profesional), y se
 * quito el "¡Genial!" que la plataforma pone delante de las de cinco
 * estrellas. No se inventan estrellas: no todas las tenian.
 *
 * `clave` es un trozo literal del texto que se resalta. `nota` va bajo el
 * nombre y solo dice lo que el propio alumno cuenta.
 */
export type Opinion = {
  id: string;
  nombre: string;
  nota?: string;
  /** Uno o mas parrafos, tal cual. */
  texto: string[];
  clave: string;
};

export const OPINIONES: Opinion[] = [
  {
    id: 'alvaro',
    nombre: 'Álvaro',
    texto: [
      'Las clases con la profesora Aline son excelentes. Tiene una paciencia infinita, lo que facilita muchísimo el progreso. Las lecciones están completamente personalizadas, no solo en función de los intereses del alumno, sino también de los objetivos específicos de aprendizaje. Además de aprender o reforzar el idioma francés, uno descubre Francia: su cultura, su historia y, por supuesto, su gastronomía.',
      'Recomendada al ciento por ciento.',
    ],
    clave: 'Las lecciones están completamente personalizadas',
  },
  {
    id: 'mario',
    nombre: 'Mario',
    nota: 'Preparó el DELF B2',
    texto: [
      'Aline es muy buena, muy flexible con los horarios, paciente y excelente para practicar conversación. Le agradezco por ayudarme a preparar el DELF B2.',
    ],
    clave: 'excelente para practicar conversación',
  },
  {
    id: 'blanca',
    nombre: 'Blanca María',
    nota: 'Nivel B2 para estudiar en Francia',
    texto: [
      'Necesitaba alcanzar un buen nivel de francés para poder estudiar en Francia, y Aline me ayudó muchísimo a llegar al nivel B2. Sus clases, dinámicas y bien estructuradas, me hicieron volver a amar el francés. ¡Merci, Aline!',
    ],
    clave: 'me hicieron volver a amar el francés',
  },
  {
    id: 'giorgio',
    nombre: 'Giorgio',
    nota: 'Clases desde Bogotá',
    texto: [
      'Aline como profe es simplemente ¡très chouette! ¡Muy chévere! Cada clase es como ir a París sin salir de Bogotá.',
      'Aline tiene una paciencia «incroyable», o sea, ¡increíble!, para aguantar mis intentos de pronunciar «œuf» o «serrurerie». Si buscas aprender sin aburrirte y enamorarte del francés, ella te ayudará. ¡Merci beaucoup, profe!',
    ],
    clave: 'Cada clase es como ir a París sin salir de Bogotá',
  },
  {
    id: 'juan-felipe',
    nombre: 'Juan Felipe',
    texto: ['La paciencia de Aline es fundamental para aprender francés, le agradezco por todo.'],
    clave: 'La paciencia de Aline es fundamental',
  },
  {
    id: 'miguel',
    nombre: 'Miguel',
    texto: [
      'Me gusta su metodología: es muy práctico cómo enseña. Me ha ayudado mucho a mejorar mi nivel de francés.',
    ],
    clave: 'Me ha ayudado mucho a mejorar mi nivel de francés',
  },
];

/** Las opiniones en el orden que pide cada pagina; las no nombradas, detras. */
export const opinionesEnOrden = (primero: string[] = []) => [
  ...primero.map((id) => OPINIONES.find((o) => o.id === id)!).filter(Boolean),
  ...OPINIONES.filter((o) => !primero.includes(o.id)),
];
