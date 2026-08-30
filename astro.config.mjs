// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// TODO [PENDIENTE: dominio] Sustituir por el dominio real antes de publicar.
// De este valor dependen el sitemap, los canonical y las etiquetas Open Graph.
export const SITE = 'https://PENDIENTE-DOMINIO.example';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  // Todo el sitio se prerenderiza. El adaptador existe solo para las rutas de
  // /api, que llevan `export const prerender = false`. Ninguna pagina se
  // renderiza bajo demanda: eso es lo que sostiene el objetivo de LCP.
  output: 'static',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/gracias'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
