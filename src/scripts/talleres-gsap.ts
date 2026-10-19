/**
 * ANIMACION DE /talleres CON GSAP.
 *
 * Solo en la pagina de talleres (data-talleres-pagina). GSAP va en import()
 * dinamico, asi que el resto del sitio no lo descarga por esto.
 *
 * Que anima:
 *  - Portada: las tres fotos del collage entran apiladas y se abren en
 *    abanico hasta su sitio, las etiquetas y el sello saltan, el titular sube
 *    linea a linea y luego el texto y la entrada del proximo taller, con su
 *    talon que cae y el dia y el precio que saltan. Despues las fotos flotan,
 *    cada una a su ritmo, y en escritorio siguen al raton con distinta
 *    profundidad. Al bajar, el collage se desplaza un poco.
 *  - Cada taller: una cortina de tinta descubre la foto mientras la foto se
 *    asienta desde grande; el numero sube, el titular entra por lineas y los
 *    datos del billete y el boton caen en cascada. La foto se mueve
 *    despacio dentro de su marco al hacer scroll.
 *
 * Solo transform y opacity. Con movimiento reducido no se anima nada y todo
 * se ve quieto. Si GSAP no llega, la red de seguridad lo muestra todo.
 */

const pagina = document.querySelector<HTMLElement>('[data-talleres-pagina]');
if (pagina) void iniciar();

function mostrarTodo() {
  document
    .querySelectorAll<HTMLElement>('[data-t-oculto]')
    .forEach((el) => el.removeAttribute('data-t-oculto'));
}

/**
 * Las cortinas tapan las fotos hasta que GSAP las abre. Si GSAP no llega, o
 * hay movimiento reducido, se quitan: una foto tapada para siempre es peor
 * que una foto sin animacion.
 */
function quitarCortinas() {
  document
    .querySelectorAll<HTMLElement>('[data-t-cortina]')
    .forEach((el) => (el.style.display = 'none'));
}

async function iniciar() {
  const seguro = window.setTimeout(mostrarTodo, 3000);

  let modulos;
  try {
    modulos = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
    ]);
  } catch {
    window.clearTimeout(seguro);
    mostrarTodo();
    quitarCortinas();
    return;
  }
  window.clearTimeout(seguro);

  const [{ gsap }, { ScrollTrigger }, { SplitText }] = modulos;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const todos = <T extends Element = HTMLElement>(sel: string, raiz: ParentNode = document) =>
    Array.from(raiz.querySelectorAll<T>(sel));

  /** Titular por lineas, con mascara. Devuelve la animacion para encadenarla. */
  const porLineas = (el: HTMLElement, vars: gsap.TweenVars) => {
    let tween: gsap.core.Tween | undefined;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'g-linea',
      autoSplit: true,
      onSplit: (self) => {
        tween = gsap.from(self.lines, { yPercent: 115, ease: 'power4.out', ...vars });
        return tween;
      },
    });
    return tween;
  };

  /* --- Portada ----------------------------------------------------------- */

  function portada(escritorio: boolean) {
    const raiz = document.querySelector<HTMLElement>('[data-t-portada]');
    if (!raiz) return;

    const fotos = todos('.collage__foto', raiz);
    const etiquetas = todos('.collage__etiqueta', raiz);
    const sello = raiz.querySelector<HTMLElement>('[data-t-sello]');
    const textos = todos('[data-t="entrada"]', raiz);
    const titulo = raiz.querySelector<HTMLElement>('[data-t-titulo]');
    const collage = raiz.querySelector<HTMLElement>('[data-t-collage]');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Las fotos salen apiladas en el centro y se abren hasta su sitio. from()
    // lee el giro que cada una tiene en el CSS y termina ahi.
    tl.from(
      fotos,
      {
        autoAlpha: 0,
        y: 140,
        x: (i: number) => [60, -60, 0][i] ?? 0,
        rotation: 0,
        scale: 0.8,
        duration: 1.2,
        ease: 'back.out(1.25)',
        stagger: 0.14,
      },
      0.1,
    );
    if (etiquetas.length) {
      tl.from(
        etiquetas,
        { scale: 0, rotation: -12, duration: 0.6, ease: 'back.out(2.6)', stagger: 0.12 },
        0.9,
      );
    }
    if (sello) {
      tl.from(sello, { scale: 0, rotation: -120, duration: 0.9, ease: 'back.out(1.8)' }, 1);
    }
    if (textos.length) tl.from(textos, { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.12 }, 0.5);
    if (titulo) porLineas(titulo, { duration: 1.1, stagger: 0.12, delay: 0.2 });

    // La entrada del proximo taller: el talon cae como una pestaña y el dia,
    // el numero y el mes saltan uno detras de otro. Despues, el precio late.
    const talon = raiz.querySelector<HTMLElement>('[data-t-talon]');
    if (talon) {
      tl.from(talon, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.7, ease: 'power3.out' }, 0.95);
      tl.from(
        Array.from(talon.children),
        { y: 16, autoAlpha: 0, duration: 0.5, ease: 'back.out(2.4)', stagger: 0.08 },
        1.2,
      );
      const precio = raiz.querySelector<HTMLElement>('[data-t-entrada] .entrada__precio');
      if (precio) {
        tl.from(precio, { scale: 0.4, autoAlpha: 0, duration: 0.6, ease: 'back.out(2.6)' }, 1.35);
      }
    }

    // Despues, cada foto flota a su ritmo. Arranca cuando la entrada termina,
    // para no pisar su "y".
    tl.add(() => {
      fotos.forEach((foto, i) => {
        gsap.to(foto, {
          y: '-=12',
          duration: 3 + i * 0.7,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
    });

    // En escritorio, las capas siguen al raton, cada una con su profundidad.
    if (escritorio && collage && window.matchMedia('(pointer: fine)').matches) {
      const capas = todos('.collage__capa', collage).map((capa) => ({
        prof: Number(capa.dataset.profundidad ?? 1),
        x: gsap.quickTo(capa, 'x', { duration: 0.8, ease: 'power3.out' }),
        y: gsap.quickTo(capa, 'y', { duration: 0.8, ease: 'power3.out' }),
      }));
      const mover = (evento: PointerEvent) => {
        const caja = collage.getBoundingClientRect();
        const dx = (evento.clientX - caja.left) / caja.width - 0.5;
        const dy = (evento.clientY - caja.top) / caja.height - 0.5;
        capas.forEach((c) => {
          c.x(dx * 36 * c.prof);
          c.y(dy * 28 * c.prof);
        });
      };
      const soltar = () => capas.forEach((c) => (c.x(0), c.y(0)));
      raiz.addEventListener('pointermove', mover);
      raiz.addEventListener('pointerleave', soltar);
    }

    // Al bajar, el collage se va un poco hacia arriba: profundidad.
    if (collage) {
      gsap.to(collage, {
        y: -70,
        ease: 'none',
        scrollTrigger: { trigger: raiz, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }

  /* --- Cada taller ------------------------------------------------------- */

  function filas(escritorio: boolean) {
    todos('[data-t-fila]').forEach((fila, i) => {
      const cortina = fila.querySelector<HTMLElement>('[data-t-cortina]');
      const img = fila.querySelector<HTMLElement>('[data-t-img]');
      const numero = fila.querySelector<HTMLElement>('[data-t-numero]');
      const titulo = fila.querySelector<HTMLElement>('[data-t-titulo]');
      const piezas = todos('[data-t-pieza]', fila);
      const billete = fila.querySelector<HTMLElement>('[data-t-billete]');
      const datos = todos('[data-t-dato]', fila);
      const cortes = todos('[data-t-corte]', fila);
      const iconos = todos('[data-t-dato] .billete__icono svg', fila);
      const rellenos = todos('[data-t-dato] .billete__icono svg [opacity]', fila);
      const cifra = fila.querySelector<HTMLElement>('[data-t-cifra]');

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        // En movil la foto ocupa toda la pantalla: se descubre en cuanto
        // asoma, para que no se vea un rato la cortina cerrada.
        scrollTrigger: {
          trigger: fila,
          start: escritorio ? 'top 72%' : 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });

      if (cortina) tl.fromTo(cortina, { scaleX: 1 }, { scaleX: 0, duration: 1.15, ease: 'power4.inOut' }, 0);
      if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6 }, 0);
      if (numero) tl.from(numero, { yPercent: 60, autoAlpha: 0, duration: 1 }, 0.2);
      if (piezas[0]) tl.from(piezas[0], { autoAlpha: 0, y: 18, duration: 0.6 }, 0.35);
      // El titular, palabra a palabra desde detras de una mascara. Por
      // palabras y no por lineas: las palabras se recolocan solas si cambia
      // el ancho, y el corte se hace una sola vez aunque la fila entre y
      // salga muchas veces.
      if (titulo) {
        const corte = SplitText.create(titulo, { type: 'words', mask: 'words', wordsClass: 'g-palabra' });
        tl.from(corte.words, { yPercent: 110, duration: 0.8, ease: 'power4.out', stagger: 0.04 }, 0.4);
      }
      if (piezas[1]) tl.from(piezas[1], { autoAlpha: 0, y: 20, duration: 0.7 }, 0.65);
      // El billete llega con un pequeño giro, como si te lo tendieran; luego
      // se dibujan los cortes y entran sus tres partes.
      if (billete) {
        tl.from(
          billete,
          { autoAlpha: 0, y: 36, rotation: -2.5, transformOrigin: '0% 100%', duration: 0.9, ease: 'back.out(1.5)' },
          0.75,
        );
      }
      cortes.forEach((corte) => {
        const vertical = corte.offsetHeight > corte.offsetWidth;
        tl.fromTo(
          corte,
          vertical ? { scaleY: 0 } : { scaleX: 0 },
          { ...(vertical ? { scaleY: 1 } : { scaleX: 1 }), duration: 0.6, ease: 'power2.out' },
          1.05,
        );
      });
      if (datos.length) {
        tl.from(datos, { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1 }, 0.95);
      }
      // El precio cuenta hasta su cifra.
      if (cifra) {
        const texto = cifra.textContent?.trim() ?? '';
        const partes = texto.match(/^(\d+)(.*)$/);
        if (partes) {
          const total = Number(partes[1]);
          const resto = partes[2];
          const cuenta = { v: 0 };
          tl.fromTo(
            cuenta,
            { v: 0 },
            {
              v: total,
              duration: 1.1,
              ease: 'power2.out',
              snap: { v: 1 },
              onUpdate: () => {
                cifra.textContent = `${cuenta.v}${resto}`;
              },
            },
            1.1,
          );
        }
      }
      if (iconos.length) {
        tl.from(
          iconos,
          { scale: 0.3, rotation: -25, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2.4)', stagger: 0.1 },
          1,
        );
      }
      if (rellenos.length) tl.from(rellenos, { opacity: 0, duration: 0.8, stagger: 0.1 }, 1.25);
      if (piezas.length > 2) {
        tl.from(piezas.slice(2), { autoAlpha: 0, y: 20, duration: 0.7, stagger: 0.12 }, 1.35);
      }

      // La foto se mueve despacio dentro de su marco mientras se baja.
      if (img) {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: { trigger: fila, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }

      // En escritorio el numero va a otra velocidad que la foto.
      if (escritorio && numero) {
        gsap.to(numero, {
          y: i % 2 === 0 ? -50 : -35,
          ease: 'none',
          scrollTrigger: { trigger: fila, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    });
  }

  /* --- Arranque ----------------------------------------------------------- */

  // Se corta el texto cuando ya estan las fuentes: con la de reserva, las
  // palabras miden otra cosa.
  await document.fonts.ready;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', () => {
    mostrarTodo();
    quitarCortinas();
  });

  mm.add(
    {
      escritorio: '(min-width: 64rem) and (prefers-reduced-motion: no-preference)',
      movil: '(max-width: 63.98rem) and (prefers-reduced-motion: no-preference)',
    },
    (contexto) => {
      const escritorio = Boolean(contexto.conditions?.escritorio);
      try {
        portada(escritorio);
        filas(escritorio);
      } catch (error) {
        console.error('[talleres-gsap]', error);
        quitarCortinas();
      } finally {
        mostrarTodo();
      }
    },
  );
}
