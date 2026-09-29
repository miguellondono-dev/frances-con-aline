/**
 * ANIMACION CON GSAP DE LAS PAGINAS DE CLASES.
 *
 * Solo /clases-privadas y /clases-en-grupo: la plantilla ServiceLanding pone
 * data-gsap-pagina cuando la pagina le pasa `gsap`. En el resto del sitio este
 * guion sale en la primera linea y GSAP no se descarga: va en import()
 * dinamico, en su propio trozo.
 *
 * Que anima:
 *  - Portada: la foto entra girando hasta su sitio, el titular sube linea a
 *    linea desde detras de una mascara, y luego la entrada, el boton y las
 *    garantias, con los checks que saltan. Al bajar, la foto se desplaza un
 *    poco dentro de su tarjeta.
 *  - Titulares de seccion: linea a linea con mascara al entrar en pantalla.
 *  - Lo que vas a conseguir (privadas): las tarjetas entran desde su
 *    columna, los iconos saltan, se rellenan y flotan mientras se ven.
 *  - Para quien (grupo): la tarjeta principal entra desde la derecha y la
 *    discreta desde la izquierda; los puntos caen en cascada.
 *  - Que incluye: las piezas entran por tandas desde su lado del zigzag.
 *  - Como empezamos: el carril de la linea de tiempo, con scrub suave. En estas
 *    paginas lo lleva GSAP en vez de Motion, asi no se cargan dos librerias.
 *  - Precio: la cifra cuenta hasta el precio y las filas de bonos entran una
 *    detras de otra cuando el parpadeo ya ha abierto.
 *  - Cierre: titular por lineas, texto y boton.
 *
 * Todo con transform y opacity (autoAlpha). Las entradas se rehacen al volver
 * a pasar, como en el resto del sitio. Con movimiento reducido no se anima
 * nada y todo se ve quieto. Si GSAP no llega, una red de seguridad lo muestra
 * todo.
 */

const pagina = document.querySelector<HTMLElement>('[data-gsap-pagina]');
if (pagina) void iniciar();

/**
 * La portada empieza oculta (data-g-oculto) para que no se vea un parpadeo
 * entre el HTML y el estado inicial de la animacion. Esto la destapa.
 */
function mostrarTodo() {
  document
    .querySelectorAll<HTMLElement>('[data-g-oculto]')
    .forEach((el) => el.removeAttribute('data-g-oculto'));
}

/** Entra al bajar y se deshace al volver a subir por encima. */
const CICLO = 'play none none reverse';

async function iniciar() {
  // Red de seguridad: si GSAP tarda o falla, nada se queda escondido.
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
    return;
  }
  window.clearTimeout(seguro);

  const [{ gsap }, { ScrollTrigger }, { SplitText }] = modulos;
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const uno = <T extends HTMLElement = HTMLElement>(sel: string, raiz: ParentNode = document) =>
    raiz.querySelector<T>(sel);
  const todos = <T extends HTMLElement = HTMLElement>(sel: string, raiz: ParentNode = document) =>
    Array.from(raiz.querySelectorAll<T>(sel));

  /* --- Portada ----------------------------------------------------------- */

  function portada() {
    const raiz = uno('[data-g-portada]');
    if (!raiz) return;

    const foto = uno('[data-g="foto"]', raiz);
    const imagen = uno('.foto-tarjeta__img', raiz);
    const titulo = uno('[data-g-titulo="portada"]', raiz);
    const textos = todos('[data-g="entrada"]', raiz);
    const garantias = todos('[data-g-garantias] li', raiz);
    const checks = todos('[data-g-garantias] svg', raiz);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });

    // La foto gira hasta su sitio. Se mueve el envoltorio, no la tarjeta: la
    // tarjeta tiene su propio giro y su gesto al pasar por encima en el CSS.
    if (foto) {
      tl.from(
        foto,
        { autoAlpha: 0, y: 40, rotation: -6, scale: 0.94, duration: 1.3, ease: 'power4.out' },
        0,
      );
    }
    if (textos.length) tl.from(textos, { autoAlpha: 0, y: 22, stagger: 0.12 }, 0.55);
    if (garantias.length) {
      tl.from(garantias, { autoAlpha: 0, x: -12, stagger: 0.09, duration: 0.6 }, '-=0.35');
    }
    if (checks.length) {
      tl.from(
        checks,
        {
          scale: 0,
          rotation: -60,
          transformOrigin: '50% 50%',
          ease: 'back.out(2.4)',
          stagger: 0.09,
          duration: 0.55,
        },
        '<0.12',
      );
    }

    // El titular por lineas. autoSplit rehace el corte cuando cargan las
    // fuentes o cambia el ancho; la animacion va dentro de onSplit para que
    // siempre apunte a las lineas buenas.
    if (titulo) {
      SplitText.create(titulo, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'g-linea',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.1,
            ease: 'power4.out',
            stagger: 0.12,
            delay: 0.15,
          }),
      });
    }

    // Al bajar, la foto se desplaza un poco dentro de su tarjeta. Entra algo
    // ampliada para que el borde no asome.
    if (imagen) {
      gsap.set(imagen, { scale: 1.12 });
      gsap.to(imagen, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: raiz, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }

  /* --- Titulares de seccion ---------------------------------------------- */

  function titulares() {
    todos('[data-g-titulo]')
      .filter((h) => h.dataset.gTitulo !== 'portada')
      .forEach((h) => {
        SplitText.create(h, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'g-linea',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              duration: 0.95,
              ease: 'power4.out',
              stagger: 0.1,
              scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: CICLO },
            }),
        });
      });
  }

  /* --- Para quien --------------------------------------------------------- */

  function publico(escritorio: boolean) {
    const si = uno('[data-g="derecha"]');
    const no = uno('[data-g="izquierda"]');

    if (si) {
      const disparo = { trigger: si, start: 'top 82%', toggleActions: CICLO };
      gsap.from(si, {
        autoAlpha: 0,
        x: escritorio ? 70 : 0,
        y: escritorio ? 0 : 40,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: disparo,
      });
      gsap.from(todos('li', si), {
        autoAlpha: 0,
        y: 16,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.25,
        scrollTrigger: disparo,
      });
      gsap.from(todos('.publico__marca', si), {
        scale: 0,
        rotation: -60,
        transformOrigin: '50% 50%',
        ease: 'back.out(2.4)',
        stagger: 0.08,
        duration: 0.5,
        delay: 0.4,
        scrollTrigger: disparo,
      });
    }

    if (no) {
      gsap.from(no, {
        autoAlpha: 0,
        x: escritorio ? -50 : 0,
        y: escritorio ? 0 : 30,
        duration: 1,
        ease: 'power3.out',
        delay: 0.15,
        scrollTrigger: { trigger: no, start: 'top 88%', toggleActions: CICLO },
      });
    }
  }

  /* --- Lo que vas a conseguir -------------------------------------------- */

  /**
   * Las tarjetas entran por tandas, cada una desde su columna; el icono salta
   * y despues se rellena su segundo tono. Mientras la seccion esta en
   * pantalla, los iconos flotan muy suave; fuera se pausa.
   */
  function beneficios(escritorio: boolean) {
    const celdas = todos('[data-g-beneficio]');
    if (!celdas.length) return;
    const rejilla = celdas[0].parentElement ?? celdas[0];

    const lado = (el: HTMLElement) =>
      escritorio ? (el.dataset.gBeneficio === 'izq' ? -36 : 36) : 0;

    gsap.set(celdas, { autoAlpha: 0, y: 36, x: (_i: number, el: HTMLElement) => lado(el) });

    ScrollTrigger.batch(celdas, {
      start: 'top 88%',
      onEnter: (lote) => {
        const tanda = lote as HTMLElement[];
        gsap.to(tanda, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.1,
          overwrite: true,
        });
        gsap.fromTo(
          tanda.flatMap((c) => todos('.beneficio__icono svg', c)),
          { scale: 0.4, rotation: -20, transformOrigin: '50% 50%' },
          { scale: 1, rotation: 0, ease: 'back.out(2.2)', duration: 0.6, stagger: 0.1, delay: 0.2 },
        );
        gsap.fromTo(
          tanda.flatMap((c) => todos('.beneficio__icono svg [opacity]', c)),
          { opacity: 0 },
          { opacity: 0.2, duration: 0.8, ease: 'power2.out', stagger: 0.1, delay: 0.45 },
        );
      },
      onLeaveBack: (lote) =>
        gsap.to(lote, {
          autoAlpha: 0,
          y: 36,
          x: (_i: number, el: HTMLElement) => lado(el),
          duration: 0.4,
          overwrite: true,
        }),
    });

    const flotar = gsap.to(todos('.beneficio__icono svg', rejilla), {
      y: -3,
      duration: 2.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      stagger: { each: 0.4, from: 'random' },
      paused: true,
    });
    ScrollTrigger.create({
      trigger: rejilla,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (estado) => (estado.isActive ? flotar.play() : flotar.pause()),
    });
  }

  /* --- Que incluye -------------------------------------------------------- */

  function incluye(escritorio: boolean) {
    const piezas = todos('[data-g-pieza]');
    if (!piezas.length) return;

    // Cada pieza viene de su lado del zigzag; en movil, todas desde abajo.
    const lado = (el: HTMLElement) =>
      escritorio ? (el.dataset.gPieza === 'izq' ? -40 : 40) : 0;

    gsap.set(piezas, { autoAlpha: 0, y: 40, x: (_i: number, el: HTMLElement) => lado(el) });

    ScrollTrigger.batch(piezas, {
      start: 'top 88%',
      onEnter: (lote) =>
        gsap.to(lote, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          overwrite: true,
        }),
      onLeaveBack: (lote) =>
        gsap.to(lote, {
          autoAlpha: 0,
          y: 40,
          x: (_i: number, el: HTMLElement) => lado(el),
          duration: 0.4,
          overwrite: true,
        }),
    });
  }

  /* --- Como empezamos: el carril ------------------------------------------ */

  /**
   * La misma logica que setupMetodo en motion.ts, pero con ScrollTrigger y un
   * scrub de 0,6s, que suaviza el relleno. El carril se mide de centro a
   * centro de los puntos y cada paso se enciende cuando el rojo lo alcanza.
   */
  function metodo(escritorio: boolean) {
    const recorrido = uno('[data-metodo][data-motor="gsap"]');
    const relleno = recorrido ? uno('[data-metodo-relleno]', recorrido) : null;
    const carril = recorrido ? uno('.carril', recorrido) : null;
    if (!recorrido || !relleno || !carril) return undefined;

    const pasos = todos('[data-metodo-paso]', recorrido);
    if (pasos.length < 2) return undefined;

    let umbrales: number[] = [];

    const medir = () => {
      const punto = uno('.paso__punto', pasos[0]);
      if (!punto) return;
      const posiciones = pasos.map((paso) => (escritorio ? paso.offsetLeft : paso.offsetTop));
      const primero = posiciones[0];
      const largo = posiciones[posiciones.length - 1] - primero;
      umbrales = posiciones.map((p) => (largo > 0 ? (p - primero) / largo : 0));
      const centro = escritorio ? pasos[0].offsetWidth / 2 : punto.offsetHeight / 2;
      recorrido.style.setProperty('--carril-inicio', `${Math.round(primero + centro)}px`);
      recorrido.style.setProperty('--carril-largo', `${Math.round(largo)}px`);
    };

    const pintar = (progreso: number) => {
      pasos.forEach((paso, i) => {
        const activo = progreso >= umbrales[i] - 0.02 ? 'true' : 'false';
        if (paso.dataset.activo !== activo) paso.dataset.activo = activo;
      });
    };

    medir();
    recorrido.dataset.vivo = 'true';

    const eje = escritorio ? 'scaleX' : 'scaleY';
    // GSAP llama a onUpdate en el mismo momento de crear el tween, antes de que
    // la variable exista: por eso se declara antes y se comprueba.
    let tween: { progress: () => number } | undefined;
    tween = gsap.fromTo(
      relleno,
      { [eje]: 0 },
      {
        [eje]: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: carril,
          start: escritorio ? 'top 85%' : 'top 80%',
          end: escritorio ? 'top 40%' : 'bottom 55%',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: medir,
        },
        onUpdate: () => {
          if (tween) pintar(tween.progress());
        },
      },
    );
    pintar(0);

    return () => {
      delete recorrido.dataset.vivo;
      pasos.forEach((paso) => delete paso.dataset.activo);
      recorrido.style.removeProperty('--carril-inicio');
      recorrido.style.removeProperty('--carril-largo');
    };
  }

  /* --- Precio ------------------------------------------------------------- */

  function precio(escritorio: boolean) {
    let restaurar: (() => void) | undefined;

    // La cifra cuenta hasta el precio. Arranca un poco tarde para que el
    // parpadeo ya haya abierto.
    const cifra = uno('[data-g-cifra]');
    const texto = cifra?.textContent?.trim() ?? '';
    const partes = texto.match(/^(\d+)(.*)$/);
    if (cifra && partes) {
      const total = Number(partes[1]);
      const resto = partes[2];
      const cuenta = { v: 0 };
      cifra.textContent = `0${resto}`;
      gsap.to(cuenta, {
        v: total,
        duration: 1.3,
        delay: 0.3,
        ease: 'power2.out',
        snap: { v: 1 },
        onUpdate: () => {
          cifra.textContent = `${cuenta.v}${resto}`;
        },
        scrollTrigger: { trigger: cifra, start: 'top 72%', toggleActions: 'play none none reset' },
      });
      restaurar = () => {
        cifra.textContent = texto;
      };
    }

    const filas = todos('[data-g-fila]');
    if (filas.length) {
      gsap.from(filas, {
        autoAlpha: 0,
        x: escritorio ? 40 : 0,
        y: escritorio ? 0 : 16,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.35,
        scrollTrigger: { trigger: filas[0], start: 'top 85%', toggleActions: CICLO },
      });
    }

    return restaurar;
  }

  /* --- Entradas sueltas: textos y botones fuera de la portada ------------- */

  function entradas() {
    todos('[data-g="entrada"]')
      .filter((el) => !el.closest('[data-g-portada]'))
      .forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 26,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: CICLO },
        });
      });
  }

  /* --- Arranque ----------------------------------------------------------- */

  const mm = gsap.matchMedia();

  // Con movimiento reducido no se anima nada: todo se ve quieto.
  mm.add('(prefers-reduced-motion: reduce)', () => {
    mostrarTodo();
  });

  // El resto, en dos variantes: en escritorio las tarjetas entran de lado y el
  // carril es horizontal; en movil entran desde abajo y el carril es vertical.
  // Al cruzar los 64rem, matchMedia lo deshace todo y lo vuelve a montar.
  mm.add(
    {
      escritorio: '(min-width: 64rem) and (prefers-reduced-motion: no-preference)',
      movil: '(max-width: 63.98rem) and (prefers-reduced-motion: no-preference)',
    },
    (contexto) => {
      const escritorio = Boolean(contexto.conditions?.escritorio);

      let limpiarMetodo: (() => void) | undefined;
      let limpiarPrecio: (() => void) | undefined;

      // Si una seccion falla, las demas siguen y la portada se destapa igual:
      // un error aqui no puede dejar la pagina en blanco.
      try {
        portada();
        titulares();
        publico(escritorio);
        beneficios(escritorio);
        incluye(escritorio);
        limpiarMetodo = metodo(escritorio);
        limpiarPrecio = precio(escritorio);
        entradas();
      } catch (error) {
        console.error('[clases-gsap]', error);
      } finally {
        // Los estados iniciales ya estan puestos: ahora se puede destapar la
        // portada sin que se vea un salto.
        mostrarTodo();
      }

      return () => {
        limpiarMetodo?.();
        limpiarPrecio?.();
      };
    },
  );
}
