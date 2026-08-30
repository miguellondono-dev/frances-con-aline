import type { Pregunta } from './faq';

/**
 * Preguntas propias de cada servicio. Cinco a ocho por landing, y ninguna
 * reciclada del home: si una pregunta ya esta contestada arriba, aqui se
 * contesta desde el angulo de este servicio o no se pone.
 */

export const FAQ_PRIVADAS: Pregunta[] = [
  {
    q: '¿Puedo cambiar de objetivo a mitad del camino?',
    a: 'Sí, y pasa a menudo. Alguien empieza para viajar y a los dos meses le sale trabajo en Lyon. Cuando eso ocurre rehacemos el plan en la clase siguiente: cambia el vocabulario, cambian las situaciones que practicamos y cambia el orden de la gramática.',
  },
  {
    q: '¿Qué pasa si un día llego sin haber hecho la tarea?',
    a: 'Damos la clase igual. No pongo la tarea para controlarte, la pongo para que entre una clase y otra pase algo. Si se repite muchas semanas, hablamos: normalmente significa que la tarea es demasiado larga y hay que recortarla.',
  },
  {
    q: '¿Trabajas la pronunciación o solo la gramática?',
    a: 'Las dos, y la pronunciación desde el primer día. El hispanohablante arrastra errores muy concretos en francés: las vocales nasales, la u francesa, la r. Los conozco porque yo hice el camino inverso aprendiendo español.',
  },
  {
    q: '¿Cuántas clases necesito para notar que avanzo?',
    a: 'No te voy a dar un número, porque dependería de tu punto de partida y de cuánto practiques fuera de clase. Lo que sí puedo decirte es qué vamos a haber cubierto al final de cada mes, y eso lo acordamos en la primera clase.',
  },
  {
    q: '¿Das clase a niños?',
    a: 'Trabajo con adultos. Es donde tengo la experiencia y donde mi método tiene sentido, porque se apoya en material cultural real y en explicar por qué un idioma funciona como funciona. Para un niño hace falta otro enfoque.',
  },
  {
    q: '¿Puedo pasar de clase privada a clase en grupo, o al contrario?',
    a: 'Sí, cuando quieras, y lo que ya trabajamos sigue contando: cambia el precio, no el plan.',
  },
];

export const FAQ_GRUPO: Pregunta[] = [
  {
    q: '¿Puedo apuntarme si no conozco a nadie?',
    a: 'Sí, y es lo habitual: te apuntas por tu cuenta y yo formo el grupo con otras personas de tu nivel.',
  },
  {
    q: '¿Puedo venir con gente que ya conozco?',
    a: 'También, y en ese caso el grupo sale directo con ustedes si son al menos dos.',
  },
  {
    q: '¿Qué pasa si vamos a ritmos distintos?',
    a: 'Es lo primero que mido en la clase gratis, y si la diferencia es grande lo digo antes de empezar.',
  },
  {
    q: '¿Tenemos que estar en el mismo sitio?',
    a: 'No, cada persona se conecta desde donde esté, con que os cuadre la misma hora es suficiente.',
  },
  {
    q: '¿Cuántas personas pueden ser?',
    a: 'De dos a cinco, y el tope existe para que a todos les toque hablar en cada clase.',
  },
  {
    q: '¿Y si alguien no puede venir un día?',
    a: 'La clase se da igual con quien esté, y a quien faltó le paso el material para retomarlo en la siguiente.',
  },
  {
    q: '¿El precio es por persona o por clase?',
    a: 'Por persona: cada uno paga 20 € la hora, no 20 € entre todos.',
  },
  {
    q: '¿Hablo lo suficiente en un grupo?',
    a: 'Reparto los turnos yo, así que a nadie le toca escuchar la hora entera sin abrir la boca.',
  },
];

export const FAQ_DELF: Pregunta[] = [
  {
    q: '¿Eres examinadora oficial del DELF?',
    a: 'No, y quiero ser precisa: preparo el examen y hago simulacros, pero no evalúo oficialmente ni corrijo pruebas reales. Quien te pone la nota es el centro donde te presentes. Lo que hago es que llegues sabiendo exactamente cómo funciona la prueba.',
  },
  {
    q: '¿Qué es un simulacro y cómo lo hacemos?',
    a: 'Es el examen completo con el formato y los tiempos oficiales. Se hace de una sentada, sin pausas ni ayuda, y después lo revisamos parte por parte. Sirve sobre todo para descubrir dónde se te va el tiempo, que es donde suele perderse la nota.',
  },
  {
    q: '¿Puedo preparar el DELF desde cero?',
    a: 'Depende del nivel al que te presentes y de cuánto tiempo tengas, y en algunos casos la respuesta honesta es que no. Un A1 desde cero es razonable con margen suficiente. Un B2 desde cero en pocas semanas no lo es, y te lo diré en la primera clase.',
  },
  {
    q: '¿Trabajamos las cuatro partes del examen?',
    a: 'Sí: comprensión oral, comprensión escrita, producción escrita y producción oral. Empezamos midiendo las cuatro por separado, porque casi nadie las tiene al mismo nivel, y el plan se concentra en la que más te va a costar.',
  },
  {
    q: '¿Cuánto cuesta la preparación del DELF?',
    a: 'Lo mismo que una clase normal: 35 € la hora en privado y 20 € la hora por persona en grupo. No cobro un extra por preparar el examen, y los bonos de varias clases también sirven para esto.',
  },
  {
    q: '¿Me inscribes tú al examen?',
    a: 'No. La inscripción se hace directamente en un centro autorizado, y las fechas y los plazos los pone cada centro. Te ayudo a entender qué nivel te conviene presentar y a organizar el calendario de preparación hacia esa fecha.',
  },
  {
    q: '¿Qué niveles preparas?',
    a: 'PENDIENTE: falta confirmar el rango exacto de niveles antes de publicar esta respuesta.',
    pendiente: true,
  },
];
