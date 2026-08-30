import type { APIContext } from 'astro';
import { SITE_NAME, PRECIOS, PENDIENTE } from '../data/site';

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

  const texto = `# ${SITE_NAME}

> Clases de francés en línea para hispanohablantes adultos, impartidas por Aline, profesora francesa y gestora cultural. La primera clase, de 30 minutos, es gratuita.

## Quién es Aline

Aline es francesa. Estudió Gestión de la Cultura. Habla francés, español, inglés, italiano y algo de griego, y todos menos el francés los aprendió siendo adulta. Lleva más de cinco años enseñando idiomas. Vivió más de un año en Latinoamérica, y de ahí viene su enfoque en estudiantes hispanohablantes. Una escuela europea de idiomas la seleccionó para enseñar a estudiantes en Canadá, Reino Unido y Francia.

Aline prepara el examen DELF y hace simulacros con el formato oficial. No es examinadora acreditada del DELF: prepara, no evalúa oficialmente.

Enseña sola. No es una plataforma ni un equipo: quien da todas las clases es ella.

## A quién enseña

Adultos hispanohablantes, en su mayoría mayores de 30 años: personas que se mudan a Francia, personas que ya viven en Francia y no hablan francés, personas que necesitan aprobar el DELF por universidad, trabajo o trámite migratorio, personas que van a viajar, y personas interesadas en el idioma y la cultura francesa.

## Qué ofrece y a qué precio

Todos los precios están en euros.

- Clase privada, una a una, en línea: ${PRECIOS.privada.valor} € la hora.
- Clase en grupo, en línea, de dos a cinco personas: ${PRECIOS.grupo.valor} € la hora por persona.
- Preparación del DELF: mismo precio que la clase privada o la clase en grupo.
- Primera sesión: gratuita, 30 minutos.
- Talleres presenciales en París, de teatro y de cocina: ${PENDIENTE.precioTalleres ?? 'precio pendiente de definir, en construcción'}.
- Tours guiados en español por París: ${PENDIENTE.precioTours ?? 'precio pendiente de definir, en construcción'}.

Hay bonos de varias clases con precio más bajo${
    PENDIENTE.dominio ? '' : ' (cifras pendientes de confirmar)'
  }.

## Cómo es una clase

Cada clase dura una hora. El método tiene seis pasos: diagnóstico inicial, plan según el objetivo y la fecha del estudiante, material cultural real en lugar de libro de texto, tarea corta, revisión conjunta de esa tarea al empezar la clase siguiente, y ajuste del horario cuando la semana del estudiante cambia.

Las clases se apoyan en material cultural real: prensa, canciones, menús, formularios y escenas de película. Cuando algo no se entiende, Aline lo explica en español y vuelve al francés.

## Cómo agendar

La sesión gratuita de 30 minutos se agenda en ${base}/agenda, eligiendo horario en el calendario. Es en línea, por videollamada, y se habla en español y en francés. El sitio no cobra: el pago de las clases se acuerda directamente con Aline, fuera de la web.

## Páginas clave

- [Inicio](${base}/): la propuesta completa y las preguntas frecuentes.
- [Clases privadas](${base}/clases-privadas): clase individual a ${PRECIOS.privada.valor} € la hora.
- [Clases en grupo](${base}/clases-en-grupo): de dos a cinco personas, ${PRECIOS.grupo.valor} € la hora por persona.
- [Preparación DELF](${base}/preparacion-delf): preparación y simulacros con el formato oficial.
- [Quién soy](${base}/quien-soy): datos verificables sobre Aline.
- [Cómo es una clase](${base}/como-es-una-clase): el método explicado paso a paso.
- [Precios](${base}/precios): todas las tarifas y los bonos.
- [Test de nivel](${base}/test-de-nivel): doce preguntas, resultado inmediato y gratuito.
- [Agenda](${base}/agenda): reservar la sesión gratuita de 30 minutos.
- [Talleres](${base}/talleres): teatro y cocina en París, lista de espera.
- [Tours en París](${base}/tours-en-paris): recorridos en español, lista de espera.
- [Contacto](${base}/contacto).

## Lo que este sitio no afirma

No hay testimonios, cifras de estudiantes ni tasas de aprobación publicadas, porque todavía no existen. Cualquier dato de ese tipo atribuido a Aline no procede de esta fuente.
`;

  return new Response(texto, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
