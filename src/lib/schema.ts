/**
 * Constructores de datos estructurados.
 *
 * Reglas que se respetan aqui:
 *  - no se usa LocalBusiness: no hay local fisico;
 *  - no se usa Review ni AggregateRating: no hay resenas todavia, e inventarlas
 *    es penalizable;
 *  - Person de Aline vive en /sobre-mi y las demas paginas la referencian por
 *    @id como provider, en vez de repetir sus datos.
 */

const FALLBACK = 'https://francesconaline.com/';

function base(site?: URL) {
  return (site?.href ?? FALLBACK).replace(/\/$/, '');
}

/**
 * La marca. Va en el inicio y es lo que le dice a un buscador como se llama
 * esto: sin ella, quien busca "frances con aline" no tiene nada que enlazar
 * con el sitio salvo el texto suelto de la pagina.
 *
 * Organization y no LocalBusiness: no hay local fisico. Y la fundadora
 * apunta por @id al Person que vive en /sobre-mi, sin repetir sus datos.
 */
export function marca(site?: URL) {
  const raiz = base(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${raiz}/#organizacion`,
    name: 'Francés con Aline',
    alternateName: 'Frances con Aline',
    url: `${raiz}/`,
    email: 'contacto@francesconaline.com',
    logo: `${raiz}/img/logo.svg`,
    founder: { '@id': alineId(site) },
    knowsLanguage: ['fr', 'es'],
    areaServed: ['Online', 'París'],
    description:
      'Clases de francés online para hispanohablantes con Aline, profesora de francés nativa, y talleres y tours en París.',
  };
}

/** @id estable de Aline. Todas las paginas apuntan aqui. */
export function alineId(site?: URL) {
  return `${base(site)}/sobre-mi#aline`;
}

export function breadcrumb(
  items: { name: string; path: string }[],
  site?: URL,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${base(site)}${item.path}`,
    })),
  };
}

interface ServiceInput {
  name: string;
  description: string;
  path: string;
  precio: number;
  /** Texto de la unidad, para que el precio no quede sin contexto. */
  unidad: string;
  site?: URL;
}

export function service({
  name,
  description,
  path,
  precio,
  unidad,
  site,
}: ServiceInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType: 'Clases de francés',
    url: `${base(site)}${path}`,
    availableLanguage: ['es', 'fr'],
    provider: { '@id': alineId(site) },
    offers: {
      '@type': 'Offer',
      price: precio,
      priceCurrency: 'EUR',
      description: unidad,
      availability: 'https://schema.org/InStock',
      url: `${base(site)}/agenda`,
    },
  };
}

/**
 * Un curso online. Con precio lleva `offers`, que es lo que Google pide para
 * enseñarlo en sus listas de cursos con el precio al lado.
 */
export function course({
  name,
  description,
  path,
  site,
  precio,
}: Omit<ServiceInput, 'precio' | 'unidad'> & { precio?: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url: `${base(site)}${path}`,
    inLanguage: 'es',
    teaches: 'Francés como lengua extranjera',
    provider: { '@id': alineId(site) },
    ...(precio !== undefined
      ? {
          offers: {
            '@type': 'Offer',
            category: 'Paid',
            price: precio,
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT1H',
    },
  };
}

/**
 * Un taller con fecha, sitio y precio cerrados.
 *
 * No reutiliza course(): aquel describe un servicio en linea y abierto, y esto
 * es una tanda concreta, presencial y con plazas. La diferencia importa,
 * porque un CourseInstance sin fechas ni lugar no le sirve de nada a un
 * buscador que quiere mostrar cuando empieza y cuanto cuesta.
 */
export function taller({
  name,
  description,
  path,
  site,
  inicia,
  termina,
  horario,
  dia,
  sesiones,
  minutosPorSesion,
  precio,
  moneda,
  ciudad,
  pais,
  cierreInscripcion,
}: {
  name: string;
  description: string;
  path: string;
  site?: URL;
  /**
   * Las fechas de la tanda. Sin ellas (taller "Próximamente") solo se
   * declara el curso: una instancia sin fechas ni precio no le dice nada a
   * un buscador.
   */
  /** ISO 8601, con hora local de inicio de la primera sesion. */
  inicia?: string;
  /** ISO 8601, fin de la ultima sesion. */
  termina?: string;
  /** Repeticion legible: "Sábados de 11:00 a 12:30". */
  horario: string;
  /** Dia de la semana en schema.org. Solo cuenta si hay varias sesiones. */
  dia: string;
  sesiones: number;
  minutosPorSesion: number;
  precio?: number;
  moneda: string;
  ciudad: string;
  pais: string;
  /** ISO 8601. Hasta cuando se puede reservar plaza. */
  cierreInscripcion?: string;
}) {
  const url = `${base(site)}${path}`;
  const curso = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url,
    inLanguage: 'es',
    teaches: 'Expresión oral en francés',
    provider: { '@id': alineId(site) },
  };
  if (!inicia || !termina || precio === undefined || !cierreInscripcion) return curso;
  const totalMinutos = sesiones * minutosPorSesion;

  /**
   * Un taller de una sola sesion no tiene repeticion. Declarar un Schedule
   * semanal con repeatCount 1 le dice a un buscador que se repite cada semana
   * y no se repite ninguna: mejor no decir nada que decirlo mal.
   */
  const agenda =
    sesiones > 1
      ? {
          courseSchedule: {
            '@type': 'Schedule',
            repeatFrequency: 'P1W',
            byDay: `https://schema.org/${dia}`,
            repeatCount: sesiones,
            duration: `PT${minutosPorSesion}M`,
            description: horario,
          },
        }
      : {};

  return {
    ...curso,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      name,
      courseMode: 'offline',
      ...agenda,
      courseWorkload: `PT${totalMinutos}M`,
      startDate: inicia,
      endDate: termina,
      inLanguage: 'fr',
      location: {
        '@type': 'Place',
        name: ciudad,
        address: {
          '@type': 'PostalAddress',
          addressLocality: ciudad,
          addressCountry: pais,
        },
      },
      offers: {
        '@type': 'Offer',
        price: precio,
        priceCurrency: moneda,
        availability: 'https://schema.org/InStock',
        validThrough: cierreInscripcion,
        url,
        category:
          sesiones > 1 ? `Taller completo, las ${sesiones} sesiones` : 'Sesión única',
      },
    },
  };
}
