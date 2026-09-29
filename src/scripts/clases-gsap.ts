/**
 * ANIMACION CON GSAP DE LAS PAGINAS DE CLASES.
 *
 * En /clases-privadas, /clases-en-grupo y /preparacion-delf: la plantilla ServiceLanding pone
 * data-gsap-pagina cuando la pagina le pasa `gsap`. En el resto del sitio este
 * guion sale en la primera linea y GSAP no se descarga: va en import()
 * dinamico, en su propio trozo.
 *
 * Que anima:
 *  - Portada: la foto entra girando hasta su sitio, el titular sube linea a
 *    linea desde detras de una mascara, y luego la entrada, el boton y las
 *    garantias, con los checks que saltan. Al bajar, la foto se desplaza un
 *    poco dentro de su tarjeta. En privadas, el collage: las piezas se abren
 *    desde el centro, flotan, siguen al raton, y un bucle cuenta una clase
 *    (Aline escribe, se tacha un error, entra la correccion).
 *  - Titulares de seccion: linea a linea con mascara al entrar en pantalla.
 *  - Lo que vas a conseguir: los logros entran en cascada y el panel llega
 *    girado y se asienta; en movil, las tarjetas suben y los iconos saltan.
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

  /* --- El collage de la portada (solo privadas) ---------------------------- */

  /**
   * Las piezas salen juntas del centro y se abren hasta su sitio (from() lee
   * el giro de cada una en el CSS y termina ahi). Luego flotan, cada una a su
   * ritmo, y en escritorio siguen al raton con distinta profundidad. Al bajar,
   * el collage sube un poco.
   *
   * Y un bucle que cuenta una clase: Aline escribe, aparece "On y va ?", se
   * tacha el error y entra la correccion. Solo corre mientras se ve.
   */
  function coleccion(escritorio: boolean) {
    const collage = uno('[data-g-collage]');
    if (!collage) return;

    const piezas = todos('[data-g-pieza]', collage);
    const fondos = todos('[data-g-fondo]', collage);
    const escribe = uno('[data-g-escribe]', collage);
    const frase = uno('[data-g-frase]', collage);
    const raya = uno('[data-g-raya]', collage);
    const bien = uno('[data-g-bien]', collage);
    const check = bien ? uno('svg', bien) : null;

    const entrada = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (fondos.length) {
      entrada.from(fondos, { scale: 0.4, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.4)', stagger: 0.12 }, 0);
    }
    entrada.from(
      piezas,
      {
        autoAlpha: 0,
        y: 120,
        x: (i: number) => [0, -70, 70, -50][i] ?? 0,
        rotation: 0,
        scale: 0.8,
        duration: 1.15,
        ease: 'back.out(1.3)',
        stagger: 0.13,
      },
      0.15,
    );
    entrada.add(() => {
      piezas.forEach((pieza, i) => {
        gsap.to(pieza, {
          y: '-=11',
          duration: 2.8 + i * 0.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
    });

    // El bucle de la clase. Arranca con Aline escribiendo: el estado inicial
    // se pone ya, para que durante la entrada no asome la frase terminada.
    if (escribe && frase && raya && bien) {
      const inicio = () => {
        gsap.set(escribe, { autoAlpha: 1 });
        gsap.set(frase, { autoAlpha: 0, y: 8 });
        gsap.set(raya, { scaleX: 0, autoAlpha: 1 });
        gsap.set(bien, { autoAlpha: 0, x: -10 });
      };
      inicio();
      const clase = gsap.timeline({
        repeat: -1,
        delay: 0.5,
        onRepeat: inicio,
        scrollTrigger: {
          trigger: collage,
          start: 'top bottom',
          end: 'bottom top',
          toggleActions: 'play pause resume pause',
        },
      });
      clase
        .to(escribe, { autoAlpha: 0, duration: 0.2 }, 1.3)
        .to(frase, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(2)' })
        .to(raya, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, '+=0.5')
        .to(bien, { autoAlpha: 1, x: 0, duration: 0.5 }, '+=0.1');
      if (check) {
        clase.from(check, { scale: 0, rotation: -60, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2.6)' }, '<0.1');
      }
      clase.to([frase, bien, raya], { autoAlpha: 0, duration: 0.4 }, '+=4.2');
    }

    if (escritorio && window.matchMedia('(pointer: fine)').matches) {
      const raiz = collage.closest<HTMLElement>('[data-g-portada]') ?? collage;
      const capas = todos('.colage__capa', collage).map((capa) => ({
        prof: Number(capa.dataset.profundidad ?? 1),
        x: gsap.quickTo(capa, 'x', { duration: 0.8, ease: 'power3.out' }),
        y: gsap.quickTo(capa, 'y', { duration: 0.8, ease: 'power3.out' }),
      }));
      const mover = (evento: PointerEvent) => {
        const caja = collage.getBoundingClientRect();
        const dx = (evento.clientX - caja.left) / caja.width - 0.5;
        const dy = (evento.clientY - caja.top) / caja.height - 0.5;
        capas.forEach((c) => {
          c.x(dx * 34 * c.prof);
          c.y(dy * 26 * c.prof);
        });
      };
      const soltar = () => capas.forEach((c) => (c.x(0), c.y(0)));
      raiz.addEventListener('pointermove', mover);
      raiz.addEventListener('pointerleave', soltar);
    }

    gsap.to(collage, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: collage.closest('[data-g-portada]') ?? collage,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
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

  /* --- Lo que vas a conseguir ------------------------------------------ */

  /**
   * Los logros entran en cascada desde la izquierda y el panel llega desde
   * la derecha, algo girado, y se asienta. En movil, las tarjetas suben y sus
   * iconos saltan. Que logro esta activo no lo lleva GSAP: va en el guion
   * de la plantilla, para que funcione aunque GSAP no cargue.
   */
  function logros(escritorio: boolean) {
    const items = todos('[data-g-logro]');
    if (!items.length) return;
    const lista = items[0].parentElement ?? items[0];
    const disparo = { trigger: lista, start: 'top 82%', toggleActions: CICLO };

    gsap.from(items, {
      autoAlpha: 0,
      x: escritorio ? -40 : 0,
      y: escritorio ? 0 : 30,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: disparo,
    });

    if (!escritorio) {
      gsap.from(todos('.logro__icono svg', lista), {
        scale: 0.3,
        rotation: -20,
        transformOrigin: '50% 50%',
        ease: 'back.out(2.2)',
        duration: 0.6,
        stagger: 0.1,
        delay: 0.2,
        scrollTrigger: disparo,
      });
      return;
    }

    const escena = uno('[data-g-escena]');
    if (escena) {
      gsap.from(escena, {
        autoAlpha: 0,
        y: 50,
        rotation: 3,
        scale: 0.92,
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: escena, start: 'top 85%', toggleActions: CICLO },
      });
    }
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
        coleccion(escritorio);
        titulares();
        logros(escritorio);
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
