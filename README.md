# Francés con Aline

Sitio en Astro 5 + Tailwind 4. Un solo objetivo de conversión: que la persona
agende la clase gratuita de 30 minutos.

```bash
npm install
npm run dev
```

El sitio queda en `http://localhost:4321`.

```bash
npm run build
```

---

## Decisiones que ya están tomadas

- **Astro 5**, salida estática. El adaptador de Vercel existe solo para las tres
  rutas de `/api`, que llevan `export const prerender = false`. Ninguna página
  se renderiza bajo demanda.
- **Tailwind 4** con los tokens definidos en `@theme` dentro de
  `src/styles/global.css`. No hay ni un hex suelto en el resto del proyecto,
  salvo el `theme-color` de la etiqueta meta, que no puede leer una variable CSS.
- **Motion (motion.dev)** en su API vanilla, cargada aparte y solo para las dos
  piezas atadas al scroll. El resto del movimiento es CSS.
- **Fuentes autoalojadas**: Cabinet Grotesk y Satoshi, variables, 42 KB cada una.
  Las licencias están en `public/fonts/`.
- **Keystatic** se pospuso. Se publica editando markdown y se añade después.

## Dónde se edita cada cosa

| Qué | Dónde |
|---|---|
| Colores, tipografía, espacio, movimiento | `src/styles/global.css` |
| Precios, navegación, bonos, pendientes | `src/data/site.ts` |
| Preguntas frecuentes del home | `src/data/faq.ts` |
| Preguntas de cada landing | `src/data/faq-servicios.ts` |
| Las 12 preguntas del test de nivel | `src/data/test-nivel.json` |
| Entradas del diario | `src/content/diario/*.md` |
| Datos estructurados | `src/lib/schema.ts` |
| Tubería de formularios | `src/lib/notificar.ts` |

El test de nivel y el diario se editan **sin tocar código**: uno es un JSON y el
otro son archivos markdown con el frontmatter descrito en
`src/content/diario/README.md`.

---

## Lo que falta antes de publicar

Todo esto aparece marcado y **visible** en el sitio, nunca relleno con datos
inventados. Buscar `PENDIENTE` en el código para encontrarlos todos.

- [ ] **Correo de notificaciones** de Miguel. Sin él, los envíos quedan en el
      log del servidor y el usuario ve un aviso pidiéndole escribir directamente.
- [ ] **Dominio**. Aparece en `astro.config.mjs`, en `public/robots.txt` y en el
      remitente de Resend.
- [ ] **Números finales de los bonos**. Se muestran como propuesta, con una
      etiqueta que dice que no son el precio final.
- [ ] **Niveles exactos del DELF** que prepara Aline.
- [ ] **Las 12 preguntas del test**. Las de ahora están marcadas PLACEHOLDER.
- [ ] **Precio y formato de talleres y tours**.
- [ ] **Fotos reales de Aline**. Bloquean el lanzamiento: el retrato del hero y
      el de `/quien-soy` son huecos marcados.
- [ ] **Cuenta de Cal.com** con la disponibilidad configurada. Mientras no
      exista, `/agenda` ofrece la vía alternativa real, que es escribir.
- [ ] **Política de cancelación** y **métodos de pago**, que faltan en
      `/terminos` y en dos preguntas frecuentes.
- [ ] **Revisión legal** de `/privacidad` y `/terminos`. Están escritos como
      borradores honestos: describen lo que el sitio hace de verdad y marcan lo
      que solo puede decidir Aline.
- [ ] Variables de entorno: copiar `.env.example` a `.env` y rellenar.

## Reglas que no se rompen

Están comprobadas y conviene volver a comprobarlas antes de cada publicación:

1. La palabra "academia" no aparece en ninguna parte, ni en el código.
2. No hay testimonios, cifras de estudiantes ni tasas de aprobación. No existen.
3. No se dice ni se insinúa que Aline sea examinadora acreditada del DELF.
4. La escuela europea que la contrató se menciona sin nombre propio.
5. No se usa la bandera de Francia como icono, emoji ni recurso gráfico.
6. No se generan imágenes de personas que aparenten ser Aline.
7. No hay pasarela de pago. El sitio agenda; el cobro se hace fuera.
8. No hay guiones largos en ningún texto del sitio.
9. Todo el sitio habla en primera persona del singular. Nunca "nosotros".

Comprobación rápida:

```bash
grep -rniE "academi" src/ public/
```

## Accesibilidad y rendimiento

Verificado sobre el home: un solo `h1`, jerarquía de encabezados sin saltos,
cero controles sin nombre accesible, cero campos sin etiqueta, cero ids
duplicados, skip link funcional, landmarks completos y sin scroll horizontal en
375 px.

Peso de la primera carga, comprimido: unos 24 KB de HTML, CSS y JS, más 85 KB de
fuentes. El objetivo del brief eran 300 KB.

`prefers-reduced-motion: reduce` desactiva todo el movimiento no esencial: la
apertura del ojo, el parpadeo, el marquee, el rotador del hero, el trazo del
acento, el parallax y las entradas por scroll.

Falta pasar Lighthouse en móvil sobre el sitio ya desplegado.
