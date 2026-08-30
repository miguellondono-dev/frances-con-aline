import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE_NAME } from '../../data/site';

/**
 * RSS del diario. Se construye ahora aunque no haya entradas: un feed vacio es
 * valido, y asi el dia que se publique la primera no hay que tocar nada.
 */
export async function GET(context: APIContext) {
  const entradas = (await getCollection('diario', ({ data }) => !data.borrador)).sort(
    (a, b) => b.data.fecha.getTime() - a.data.fecha.getTime(),
  );

  return rss({
    title: `Diario | ${SITE_NAME}`,
    description:
      'Vídeos cortos sobre el idioma francés y la cultura que lo rodea, con transcripción completa.',
    site: context.site ?? 'https://PENDIENTE-DOMINIO.example',
    customData: '<language>es</language>',
    items: entradas.map((entrada) => ({
      title: entrada.data.titulo,
      description: entrada.data.resumen,
      pubDate: entrada.data.fecha,
      link: `/diario/${entrada.id}`,
      categories: entrada.data.etiquetas,
    })),
  });
}
