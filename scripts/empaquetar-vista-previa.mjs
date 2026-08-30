/**
 * Empaqueta el home en una sola página autocontenida, para compartirla.
 *
 * No es el sitio: es una foto del inicio. Todo va incrustado (CSS, JavaScript,
 * fuentes e imagen) porque la página se sirve desde otro dominio y no puede
 * pedir archivos al nuestro.
 *
 * Uso:  node scripts/empaquetar-vista-previa.mjs <ruta-de-salida.html> [--sin-js]
 * Antes hay que haber hecho `npm run build`.
 *
 * Con --sin-js se omite el paquete de JavaScript. La página sigue en pie
 * porque el sitio está hecho con mejora progresiva: los estados ocultos solo
 * se aplican cuando existe la clase .js, que pone el propio script. Sin él,
 * todo aparece ya colocado. Se pierden el titular que se escribe, las entradas
 * por scroll y el menú móvil, y por eso ese botón se esconde: un control que
 * no hace nada es peor que ningún control.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { build } from 'esbuild';

const RAIZ = process.cwd();
const ESTATICO = join(RAIZ, '.vercel', 'output', 'static');
const SALIDA = process.argv[2];

if (!SALIDA) {
  console.error('Falta la ruta de salida.');
  process.exit(1);
}

const leer = (rutaWeb) => readFile(join(ESTATICO, rutaWeb.replace(/^\//, '')));

/** Empaqueta los scripts de cliente en un solo IIFE, sin trozos sueltos. */
async function empaquetarJs() {
  const resultado = await build({
    stdin: {
      contents: `
        document.documentElement.classList.add('js');
        import '../src/scripts/motion.ts';
        import '../src/scripts/forms.ts';
      `,
      resolveDir: join(RAIZ, 'scripts'),
      loader: 'ts',
    },
    bundle: true,
    format: 'iife',
    target: 'es2020',
    minify: true,
    write: false,
  });
  return resultado.outputFiles[0].text;
}

/** Mete las fuentes dentro del CSS como datos, que si no no cargan. */
async function incrustarFuentes(css) {
  const rutas = [...css.matchAll(/url\((\/fonts\/[^)]+\.woff2)\)/g)];
  let salida = css;
  for (const [entero, ruta] of rutas) {
    const datos = await leer(ruta);
    salida = salida.replace(
      entero,
      `url(data:font/woff2;base64,${datos.toString('base64')})`,
    );
  }
  return salida;
}

const html = await readFile(join(ESTATICO, 'index.html'), 'utf8');

// 1. Estilos, con las fuentes ya dentro.
const hojas = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g)];
let css = '';
for (const [, href] of hojas) {
  css += await incrustarFuentes((await leer(href)).toString('utf8'));
}

// 2. Solo lo que va dentro del body: el envoltorio lo pone la propia página.
let cuerpo = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];

// 3. Fuera los scripts con src: se sustituyen por el paquete único.
cuerpo = cuerpo.replace(/<script[^>]*\ssrc="[^"]*"[^>]*><\/script>/g, '');

// 4. La imagen, como datos. Se elige la variante mediana en AVIF.
const avifs = [...html.matchAll(/\/_astro\/(paris-tejados[^"\s]*\.avif)/g)].map((m) => m[1]);
const elegida = [...new Set(avifs)].sort()[Math.floor(new Set(avifs).size / 2)];
const imagenDatos = `data:image/avif;base64,${(await leer('/_astro/' + elegida)).toString('base64')}`;

cuerpo = cuerpo
  .replace(/<source[^>]*>/g, '')
  .replace(/(<img[^>]*class="paris__img"[^>]*>)/g, (etiqueta) =>
    etiqueta
      .replace(/\ssrcset="[^"]*"/, '')
      .replace(/\ssizes="[^"]*"/, '')
      .replace(/\ssrc="[^"]*"/, ` src="${imagenDatos}"`),
  );

const sinJs = process.argv.includes('--sin-js');
const js = sinJs ? '' : await empaquetarJs();

/* Sin JavaScript el botón del menú móvil no abre nada: se oculta. */
const parcheSinJs = sinJs
  ? '\n<style>[data-nav-toggle]{display:none !important}</style>'
  : '';

const aviso = `
<p style="position:fixed;right:12px;bottom:12px;z-index:100;margin:0;
          font:500 12px/1.4 system-ui,sans-serif;letter-spacing:.02em;
          background:#00043A;color:#FFFDFB;padding:8px 12px;border-radius:4px;
          opacity:.88;max-width:min(92vw,26rem)">
  Vista previa del inicio. Los enlaces internos no funcionan aquí.
</p>`;

const bloqueJs = js ? `\n<script type="module">\n${js}\n</script>` : '';

await writeFile(
  SALIDA,
  `<title>Francés con Aline</title>\n<style>\n${css}\n</style>${parcheSinJs}\n${cuerpo}\n${aviso}${bloqueJs}\n`,
  'utf8',
);

const bytes = Buffer.byteLength(
  `${css}${cuerpo}${js}${imagenDatos}`,
  'utf8',
);
console.log(`escrito ${basename(SALIDA)}  (~${Math.round(bytes / 1024)} KB)`);
console.log(`  css ${Math.round(css.length / 1024)} KB`);
console.log(`  js  ${Math.round(js.length / 1024)} KB`);
console.log(`  img ${Math.round(imagenDatos.length / 1024)} KB  (${elegida})`);
