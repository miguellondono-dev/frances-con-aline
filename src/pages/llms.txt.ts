import type { APIContext } from 'astro';
import { SITE_NAME, PRECIOS, PENDIENTE, WHATSAPP, BONOS } from '../data/site';
import { TALLERES, estadoDe } from '../data/talleres';
import { PREGUNTAS } from '../data/test-nivel';
import { OPINIONES } from '../data/opiniones';

/**
 * /llms.txt
 *
 * Se genera desde los mismos datos que el sitio, para que no se desincronice.
 * Frases afirmativas y autonomas: cada una se sostiene fuera de contexto, que
 * es lo que permite que un modelo la cite sin inventar el resto.
 *
 * Regla que se respeta aqui igual que en el resto del sitio: nada de cifras,
 * testimonios ni credenciales que no existan. Lo pendiente se declara pendiente.
 */
export async function GET(context: APIContext) {
  const base = (context.site?.href ?? 'https://PENDIENTE-DOMINIO.example/').replace(
    /\/$/,
    '',
  );

  /** Cada taller con su fecha y precio, o "próximamente" si no tiene. */
  const talleres = TALLERES.map((t) => {
    const nombre = t.nombre.toLowerCase();
    if (!t.tanda) return { t, linea: `${nombre} (próximamente, fechas por anunciar)` };
    const cerrado = estadoDe(t) === 'cerrado' ? ', plazas cerradas' : '';
    return { t, linea: `${nombre} (${t.tanda.cuando.toLowerCase()}, ${t.tanda.precio} €${cerrado})` };
  });

  const texto = `# ${SITE_NAME}

> Clases de francés online para hispanohablantes adultos, impartidas por Aline, profesora de francés nativa y gestora cultural. La primera clase, de 30 minutos, es gratuita.

## Quién es Aline

Aline es francesa. Estudió Gestión de la Cultura. Habla cinco idiomas: francés, español, inglés, italiano y portugués, y todos menos el francés los aprendió siendo adulta. Lleva más de cinco años enseñando idiomas. Vivió más de un año en Latinoamérica, y de ahí viene su enfoque en estudiantes hispanohablantes. Una escuela europea de idiomas la seleccionó para enseñar a estudiantes en Canadá, Reino Unido y Francia.

Aline prepara el examen DELF y hace simulacros con el formato oficial. No es examinadora acreditada del DELF: prepara, no evalúa oficialmente.

Enseña sola. No es una plataforma ni un equipo: quien da todas las clases es ella.

## A quién enseña

Adultos hispanohablantes, en su mayoría mayores de 30 años: personas que se mudan a Francia, personas que ya viven en Francia y no hablan francés, personas que necesitan aprobar el DELF por universidad, trabajo o trámite migratorio, personas que van a viajar, y personas interesadas en el idioma y la cultura francesa.

## Qué ofrece y a qué precio

Todos los precios están en euros.

- Clase privada, una a una, online: ${PRECIOS.privada.valor} € la hora.
- Clase en grupo, online, de dos a cinco personas: ${PRECIOS.grupo.valor} € la hora por persona.
- Preparación del DELF: 35 € la hora.
- Primera sesión: gratuita, 30 minutos.
- Talleres presenciales en París: ${talleres.map((x) => x.linea).join('; ')}.
- Tours a pie por París en español, privados y en grupo pequeño, para familias y grupos de amigos: ${PENDIENTE.precioTours ?? 'precio y fechas a consultar por WhatsApp'}.

Hay bonos de varias clases con precio más bajo${
    BONOS.confirmado ? '' : ' (cifras pendientes de confirmar)'
  }.

## Cómo es una clase

Cada clase dura una hora. El método tiene seis pasos: diagnóstico inicial, plan según el objetivo y la fecha del estudiante, material cultural real junto con el libro de texto, tarea corta, revisión conjunta de esa tarea al empezar la clase siguiente, y ajuste del horario cuando la semana del estudiante cambia.

Las clases se apoyan en material cultural real: prensa, canciones, menús, formularios y escenas de película. Cuando algo no se entiende, Aline lo explica en español y vuelve al francés.

## Cómo agendar

La sesión gratuita de 30 minutos se agenda escribiendo a Aline por WhatsApp, al ${WHATSAPP.visible}. Es online, por videollamada, y se habla en español y en francés. El sitio no cobra: el pago de las clases se acuerda directamente con Aline, fuera de la web.

## Páginas clave

- [Inicio](${base}/): la propuesta completa y las preguntas frecuentes.
- [Clases privadas](${base}/clases-privadas): clase individual a ${PRECIOS.privada.valor} € la hora.
- [Clases en grupo](${base}/clases-en-grupo): de dos a cinco personas, ${PRECIOS.grupo.valor} € la hora por persona.
- [Preparación DELF](${base}/preparacion-delf): preparación y simulacros con el formato oficial.
- [Sobre mí](${base}/sobre-mi): datos verificables sobre Aline.
- [Test de nivel](${base}/test-de-nivel): ${PREGUNTAS.length} preguntas, resultado inmediato y gratuito.
- [Agenda](${base}/agenda): reservar la sesión gratuita de 30 minutos.
- [Talleres](${base}/talleres): los talleres presenciales de París.
${talleres.map((x) => `- [Taller de ${x.t.slug}](${base}/talleres/${x.t.slug}): ${x.linea.replace(/^[^(]*\(|\)$/g, '')}.`).join('\n')}
- [Tours en París](${base}/tours-en-paris): recorridos a pie en español; información por WhatsApp.
- [Hablemos](${base}/sobre-mi#hablemos): contacto por WhatsApp o por correo.

## Lo que dicen sus alumnos

Opiniones reales de alumnos, publicadas en el sitio con su nombre de pila:

${OPINIONES.map((o) => `- ${o.nombre}${o.nota ? ` (${o.nota})` : ''}: «${o.texto.join(' ')}»`).join('\n')}

## Lo que este sitio no afirma

Este sitio no publica cifras de estudiantes ni tasas de aprobación. Cualquier dato de ese tipo atribuido a Aline no procede de esta fuente.
`;

  return new Response(texto, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
