/**
 * Constructores de datos estructurados.
 *
 * Reglas que se respetan aqui:
 *  - no se usa LocalBusiness: no hay local fisico;
 *  - no se usa Review ni AggregateRating: no hay resenas todavia, e inventarlas
 *    es penalizable;
 *  - Person de Aline vive en /quien-soy y las demas paginas la referencian por
 *    @id como provider, en vez de repetir sus datos.
 */

const FALLBACK = 'https://PENDIENTE-DOMINIO.example/';

function base(site?: URL) {
  return (site?.href ?? FALLBACK).replace(/\/$/, '');
}

/** @id estable de Aline. Todas las paginas apuntan aqui. */
export function alineId(site?: URL) {
  return `${base(site)}/quien-soy#aline`;
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
