# Francés con Aline — Plan de diseño (pasada 1)
Estado: PENDIENTE DE APROBACIÓN. No se escribe código hasta que Miguel apruebe.

## 0. Dirección: "Aperturas"

Tesis visual: el sitio es una serie de aperturas. No se "aprende un idioma": se abre
algo y se ve Francia del otro lado. El ojo del logo no es un adorno del header, es el
instrumento óptico con el que está construida la página.

Tono: editorial tranquilo, cálido, adulto. Blanco cálido como suelo, azul tinta como
estructura, rojo solo donde se actúa.

### Defaults descartados a propósito
- NO crema + serif de alto contraste + terracota: cero serifas (prohibido por brief),
  base es blanco cálido #FFFDFB, no crema, y el acento es una familia roja completa
  usada al 10%, no un terracota único.
- NO negro + acento ácido: no hay negro, la tinta es #00043A (azul marino).
- NO retícula de periódico con filetes de 1px: el organizador de la página no son las
  líneas, es la forma de apertura y una retícula asimétrica con desfase. Filetes solo
  en tablas de datos reales.

## 1. Tokens

### Color (los 11 del brief + 2 neutros derivados, nada más)
```css
--encre:#00043A --nuit:#033270 --bleu:#1368AA --azur:#4091C9 --ciel:#9DCEE2
--papier:#FEDFD4 --chair:#F29479 --corail:#F26A4F --vermeil:#EF3C2D
--grenat:#CB1B16 --lie:#65010C --blanc:#FFFDFB --pierre:#EDE4DE
```

Capa semántica (sin colores nuevos):
| Rol | Claro | Oscuro |
|---|---|---|
| Superficie | --blanc / --papier | --encre / --nuit |
| Texto principal | --encre | --blanc |
| Texto secundario | --nuit | --ciel |
| Enlace | --bleu (subrayado) | --ciel |
| CTA | fondo --grenat, texto --blanc; hover --lie | igual |
| Acento cálido | --corail (hover), --vermeil (activo) | --corail |
| Borde / separador | --pierre | --nuit |

Contrastes ya calculados (AA):
- --encre / --blanc = 18.9:1 OK
- --encre / --papier = 16:1 OK
- --blanc / --grenat = 5.6:1 OK (texto normal)
- --bleu / --blanc = 5.8:1 OK (enlaces)
- --ciel / --encre = 11.5:1 OK
- --corail / --encre = 6.4:1 OK
- --vermeil / --blanc = 3.9:1 SOLO texto grande o elementos no textuales
- --grenat / --papier = 4.5:1 justo en el límite: sobre --papier el CTA usa --lie

Regla 70/20/10 auditada por sección: se cuenta el área de cada superficie antes de
cerrar la sección. Secciones oscuras: exactamente 3 en el home (Precios resumidos,
Talleres y tours, CTA final). Ninguna banda azul-blanco-rojo adyacente ni vertical.

### Escala tipográfica (clamp, sin media queries)
Display: Cabinet Grotesk. Cuerpo: Satoshi. Ambas autoalojadas, subconjunto latino
con acentos franceses, font-display: swap. Plan B: Bricolage Grotesque + Instrument Sans.

| Token | clamp | tracking | line-height | peso |
|---|---|---|---|---|
| display-xl (h1 hero) | 2.75rem → 6.25rem | -0.03em | 1.02 | 500 |
| display-l (h2) | 2.125rem → 4rem | -0.03em | 1.05 | 500 |
| display-m (h3) | 1.5rem → 2.25rem | -0.02em | 1.15 | 600 |
| title | 1.25rem fijo | -0.01em | 1.3 | 600 |
| body | 1.0625rem → 1.125rem | 0 | 1.7 | 400, máx 68ch |
| body-s | 0.9375rem | 0 | 1.6 | 400 |
| label | 0.75rem | 0.12em | 1.2 | 600, mayúsculas |
| num | Cabinet 500, tabular-nums | -0.02em | 1 | — |

Nunca peso 700/800. Etiquetas solo cuando dicen algo verdadero. Palabras francesas
con `<span lang="fr">`, siempre traducidas o explicadas por contexto.

### Espacio, retícula, radios
- Contenedor 1320px, gutters 24px móvil / 32px desktop.
- Retícula 12 columnas con desfase deliberado: el texto vive en col 1-6 o 6-12, las
  aperturas sangran al borde del viewport. Nada centrado salvo el CTA final.
- Escala de espacio: 4 8 12 16 24 32 48 64 96 128 176.
- Radio: 4px en contenedores (casi recto). Toda la curvatura del sitio vive en la
  forma de apertura. Esto evita el look "bento redondeado" por defecto.
- Sombras: solo dos, teñidas con --encre a muy baja opacidad. Nada de glows.

### Tokens de movimiento
```
duracion: instant .08 / fast .18 / normal .35 / slow .6
easing:   smooth cubic-bezier(.22,1,.36,1) / sharp cubic-bezier(.4,0,.2,1)
distancia: sm 8 / md 16 / lg 24 (entradas por scroll usan 24)
stagger: 60ms entre hermanos
```
Solo transform y opacity. prefers-reduced-motion corta todo lo no esencial.

## 2. Elemento firma: "La apertura"

Una forma de lente (vesica: dos arcos que se encuentran en punta) con iris. Es el ojo
del logo convertido en sistema.

Cuatro usos, en orden de importancia:
1. **Máscara de imagen.** `<clipPath clipPathUnits="objectBoundingBox">` recorta cada
   foto principal. Las fotos de París se ven "a través" del ojo. Es estático, escala
   sin recalcular, cero coste de animación.
2. **Apertura del hero.** Dos párpados (formas curvas del color de fondo) que se
   separan con `translateY`. NO se anima `clip-path` ni `d`: solo transform. Duración
   total 1.1s. Con reduced-motion aparecen ya separados, sin transición.
3. **Parpadeo de transición.** Los mismos párpados barren una vez entre "Cómo es una
   clase" y "Por qué conmigo", y otra vez al entrar al CTA final. Dos veces en todo el
   home, no más.
4. **Glifo pequeño.** Versión de 8px como separador en la barra de credibilidad y como
   marcador de progreso (el iris se desplaza) en la columna sticky de "Cómo es una clase".

Todo lo demás se calla alrededor. Si algo compite con la apertura, se quita.

### Micro motion graphics culturales (cuatro, no más)
1. Acento `é` que se dibuja con trazo SVG al entrar la sección de método.
2. Rotador fr/es en el hero: una palabra francesa gira sobre su traducción.
3. Marquee de vocabulario, lento, con pausa al hover. Uno solo en todo el sitio.
4. El parpadeo de la apertura como transición.

Descartados a propósito: torre por capas, pincel que revela. Menos piezas, mejor hechas.

## 3. Wireframes del home
Ver anexo al final de este documento.

## 4. Decisiones tomadas
- Astro 5 + Tailwind v4 (tokens en @theme), islas solo en test, agenda y nav.
- Motion (motion.dev) en su API vanilla (`animate`, `inView`, `scroll`), no React.
  El home entero sale sin una sola isla de framework.
- Hosting Vercel (adaptador para las API routes).
- Keystatic se pospone. Se lanza editando markdown, se añade después.
- Sin GSAP: ninguna secuencia lo justifica todavía.

## 5. Pendientes que bloquean
- SVG del ojo del logo.
- Autorización para generar referencias visuales (consume créditos).
- Los 8 [PENDIENTE] del brief, marcados en código como placeholder visible + TODO.
