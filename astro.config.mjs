// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// De este valor dependen el sitemap, los canonical y las etiquetas Open Graph.
export const SITE = 'https://francesconaline.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  // Todo el sitio se prerenderiza. El adaptador existe solo para las rutas de
  // /api, que llevan `export const prerender = false`. Ninguna pagina se
  // renderiza bajo demanda: eso es lo que sostiene el objetivo de LCP.
  output: 'static',
  // Adaptador de Node, no de Vercel: Hostinger corre la aplicacion como un
  // proceso de Node propio. En standalone el build deja un servidor que se
  // arranca solo, escuchando en el puerto que le ponga el alojamiento.
  //
  // Las paginas siguen siendo archivos ya generados; lo unico que pasa por el
  // servidor son las tres rutas de /api, que es lo que hace que los
  // formularios funcionen.
  adapter: node({ mode: 'standalone' }),
  security: {
    /**
     * La comprobacion de origen de Astro compara la cabecera Origin contra
     * `url.origin`, y con este adaptador ese valor es siempre
     * `http://localhost`, sin puerto: ignora tanto Host como
     * X-Forwarded-Host. Lo comprobe con una sonda contra el servidor ya
     * compilado.
     *
     * Con ella encendida se rechazaba el cien por cien de los envios, tambien
     * en produccion. La sustituye origenValido() en lib/notificar.ts, que
     * compara contra una lista explicita de origenes y no depende de como el
     * adaptador reconstruya la URL.
     */
    checkOrigin: false,
  },
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
