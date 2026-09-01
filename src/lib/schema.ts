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
    areaServed: 'Online',
    description:
      'Clases de francés en línea para hispanohablantes, con Aline, profesora francesa.',
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

export function course(
  { name, description, path, site }: Omit<ServiceInput, 'precio' | 'unidad'>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url: `${base(site)}${path}`,
    inLanguage: 'es',
    teaches: 'Francés como lengua extranjera',
    provider: { '@id': alineId(site) },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT1H',
    },
  };
}
