import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * DIARIO (videoblog).
 *
 * La ruta, los dos layouts, el esquema, el RSS y el sitemap se construyen ahora
 * y se lanzan con cero entradas. La idea es que publicar despues sea publicar,
 * no migrar.
 *
 * Para crear una entrada: un archivo .md en src/content/diario/ con este
 * frontmatter. El enlace del menu principal sigue oculto hasta que haya al
 * menos tres entradas publicadas (la regla vive en Footer.astro).
 */
const diario = defineCollection({
  // El README de la carpeta es la plantilla para escribir entradas, no una
  // entrada: se excluye para que no falle la validacion del esquema.
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/diario' }),
  schema: z.object({
    titulo: z.string(),
    /** Dos o tres frases. Se usa en el indice, en el RSS y en la meta description. */
    resumen: z.string(),
    fecha: z.coerce.date(),
    /** URL del video embebido. Sin video, la entrada es solo texto. */
    video: z.string().url().optional(),
    /** Transcripcion completa: accesibilidad y, de paso, todo el SEO de la entrada. */
    transcripcion: z.string().optional(),
    etiquetas: z.array(z.string()).default([]),
    borrador: z.boolean().default(false),
  }),
});

export const collections = { diario };
