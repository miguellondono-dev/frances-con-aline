// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// De este valor dependen el sitemap, los canonical y las etiquetas Open Graph.
export const SITE = 'https://francesconaline.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  // Todo se genera al compilar. Ninguna pagina se renderiza bajo demanda: eso
  // es lo que sostiene el objetivo de LCP.
  output: 'static',
  // Sin adaptador: el sitio es un monton de archivos ya generados y nada mas.
  //
  // Hostinger instala, compila y publica `dist` tal cual. No arranca ningun
  // proceso: en su panel solo hay comando de instalacion, comando de
  // compilacion y directorio de salida. Con el adaptador de Node la salida se
  // repartia en dist/client y dist/server, asi que lo publicado no tenia
  // index.html en la raiz y el dominio respondia 403.
  //
  // Las tres rutas de /api estan aparcadas en src/pages/_api: el guion bajo
  // hace que Astro no las enrute. El codigo sigue ahi y se recupera
  // renombrando la carpeta, cuando decidamos como resolver los formularios.
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
