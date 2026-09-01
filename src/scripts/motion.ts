/**
 * SISTEMA DE MOVIMIENTO
 *
 * Reglas que no se rompen:
 *  - solo se anima transform y opacity (unica excepcion declarada: el trazo
 *    stroke-dashoffset del acento, que no provoca layout);
 *  - prefers-reduced-motion desactiva todo lo no esencial;
 *  - nada se engancha a window.onscroll a pelo: o IntersectionObserver, o el
 *    scroll() de Motion, que se apoya en el scroll timeline del navegador.
 *
 * El techo manda: si una pieza pone en riesgo el LCP, se sacrifica la pieza.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * APARICION DE TITULARES, LINEA A LINEA.
 *
 * Cada titular se parte en sus lineas reales, cada linea se mete en una
 * mascara y sube desde abajo con 70ms de diferencia entre ellas. Es lo que
 * hace que un titular "entre" en vez de limitarse a aparecer.
 *
 * Se aplica solo a titulares de texto plano: si el titular tiene dentro un
 * enlace, el rotador del hero o cualquier otra etiqueta, se deja como esta.
 * Partir HTML arbitrario rompe cosas.
 *
 * Sin JS no se parte nada y el titular se ve entero, que es lo correcto.
 */
function setupLineReveal() {
  const titulares = Array.from(
    document.querySelectorAll<HTMLElement>('main h1, main h2'),
  ).filter(
    (el) =>
      !el.classList.contains('sr-only') &&
      el.children.length === 0 &&
      (el.textContent ?? '').trim().length > 0,
  );

  if (!titulares.length) return;

  const partir = (el: HTMLElement) => {
    const original = el.dataset.original ?? el.textContent ?? '';
    el.dataset.original = original;

    // Primero cada palabra suelta, para poder leer en que linea cae.
    const palabras = original.trim().split(/\s+/);
    el.textContent = '';
    const spans = palabras.map((palabra, i) => {
      const s = document.createElement('span');
      s.textContent = palabra;
      el.appendChild(s);
      if (i < palabras.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });

    // Se agrupan por su posicion vertical real.
    const lineas: string[][] = [];
    let topActual: number | null = null;
    let actual: string[] = [];

    spans.forEach((s) => {
      const top = s.offsetTop;
      if (topActual === null || Math.abs(top - topActual) < 4) {
        if (topActual === null) topActual = top;
        actual.push(s.textContent ?? '');
      } else {
        lineas.push(actual);
        actual = [s.textContent ?? ''];
        topActual = top;
      }
    });
    if (actual.length) lineas.push(actual);

    // Y se reconstruye con una mascara por linea.
    el.textContent = '';
    lineas.forEach((linea, i) => {
      const mascara = document.createElement('span');
      mascara.className = 'line-mask';
      const interior = document.createElement('span');
      interior.className = 'line-inner';
      interior.style.setProperty('--line-i', String(i));
      interior.textContent = linea.join(' ');
      mascara.appendChild(interior);
      el.appendChild(mascara);

      // Espacio real entre lineas. Sin el, el texto del titular queda pegado
      // ("aprenderfrancés") al leerlo un lector de pantalla, al copiarlo y al
      // rastrearlo un buscador. Entre bloques no se pinta, asi que no se ve.
      if (i < lineas.length - 1) el.appendChild(document.createTextNode(' '));
    });

    el.dataset.lines = '';
    // El titular ya tiene su propia entrada: sobra la del bloque entero.
    delete el.dataset.reveal;
  };

  titulares.forEach(partir);

  if (reduced.matches) {
    titulares.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  let vivo = false;
  const io = new IntersectionObserver(
    (entries) => {
      vivo = true;
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        const repite = el.dataset.repite !== undefined;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          el.classList.add('is-revealed');
          if (!repite) io.unobserve(el);
          return;
        }

        // Se rearma solo cuando el titular ha salido entero de pantalla.
        if (repite && entry.intersectionRatio === 0) {
          el.classList.remove('is-revealed');
        }
      });
    },
    { threshold: [0, 0.2], rootMargin: '0px 0px -40px 0px' },
  );

  titulares.forEach((el) => io.observe(el));

  // Misma red de seguridad que el resto: un titular no puede quedarse oculto.
  window.setTimeout(() => {
    if (vivo) return;
    io.disconnect();
    titulares.forEach((el) => el.classList.add('is-revealed'));
  }, 2000);

  // Al cambiar el ancho, las lineas son otras y hay que recalcularlas.
  let anchoPrevio = window.innerWidth;
  let temporizador = 0;
  window.addEventListener(
    'resize',
    () => {
      if (Math.abs(window.innerWidth - anchoPrevio) < 40) return;
      anchoPrevio = window.innerWidth;
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => {
        titulares.forEach((el) => {
          const visible = el.classList.contains('is-revealed');
          partir(el);
          if (visible) el.classList.add('is-revealed');
        });
      }, 200);
    },
    { passive: true },
  );
}

/**
 * APARICION PALABRA A PALABRA.
 *
 * Para titulares que llevan etiquetas dentro, como el <em> de "francés": el
 * reparto por lineas no puede con ellos porque reconstruye el titular a base
 * de texto plano y se cargaria la etiqueta.
 *
 * Aqui se recorren los nodos: el texto se parte en palabras y cada etiqueta se
 * trata como una palabra mas, sin tocarla por dentro. Cada palabra sube desde
 * abajo dentro de su mascara, con 45ms de diferencia entre ellas.
 *
 * Con data-repite la entrada se rehace cada vez que el titular vuelve a
 * pantalla.
 */
function setupWordReveal() {
  const titulares = Array.from(
    document.querySelectorAll<HTMLElement>('[data-palabras]'),
  );
  if (!titulares.length) return;

  const envolver = (contenido: Node, indice: number) => {
    const mascara = document.createElement('span');
    mascara.className = 'palabra';
    const interior = document.createElement('span');
    interior.className = 'palabra__interior';
    interior.style.setProperty('--palabra-i', String(indice));
    interior.appendChild(contenido);
    mascara.appendChild(interior);
    return mascara;
  };

  const partir = (el: HTMLElement) => {
    if (el.dataset.partido === 'true') return;

    const original = Array.from(el.childNodes);
    const destino = document.createDocumentFragment();
    let i = 0;

    original.forEach((nodo) => {
      if (nodo.nodeType === Node.TEXT_NODE) {
        const palabras = (nodo.textContent ?? '').split(/\s+/).filter(Boolean);
        palabras.forEach((palabra) => {
          destino.appendChild(envolver(document.createTextNode(palabra), i));
          // Espacio real entre palabras: sin el, el titular se lee pegado.
          destino.appendChild(document.createTextNode(' '));
          i += 1;
        });
        return;
      }

      // Cualquier etiqueta viaja entera, sin tocarle nada por dentro.
      destino.appendChild(envolver(nodo, i));
      destino.appendChild(document.createTextNode(' '));
      i += 1;
    });

    el.textContent = '';
    el.appendChild(destino);
    el.dataset.partido = 'true';
  };

  titulares.forEach(partir);

  if (reduced.matches) {
    titulares.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  let vivo = false;
  const io = new IntersectionObserver(
    (entries) => {
      vivo = true;
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        const repite = el.dataset.repite !== undefined;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          el.classList.add('is-revealed');
          if (!repite) io.unobserve(el);
          return;
        }

        if (repite && entry.intersectionRatio === 0) {
          el.classList.remove('is-revealed');
        }
      });
    },
    { threshold: [0, 0.2], rootMargin: '0px 0px -40px 0px' },
  );

  titulares.forEach((el) => io.observe(el));

  // Misma red de seguridad: un titular no puede quedarse invisible.
  window.setTimeout(() => {
    if (vivo) return;
    io.disconnect();
    titulares.forEach((el) => el.classList.add('is-revealed'));
  }, 2000);
}

/** Entradas por scroll: fade + translateY(24px), escalonado de 60ms. */
function setupReveals() {
  const items = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal]'),
  );
  if (!items.length) return;

  if (reduced.matches) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  // El escalonado se calcula entre hermanos, no globalmente: cada bloque
  // entra con su propio ritmo en vez de heredar el retraso de la pagina.
  const seen = new Map<Element, number>();
  items.forEach((el) => {
    const parent = el.parentElement;
    if (!parent) return;
    const i = seen.get(parent) ?? 0;
    seen.set(parent, i + 1);
    el.style.setProperty('--reveal-delay', `${Math.min(i, 8) * 60}ms`);
  });

  let observadorVivo = false;

  /**
   * Por defecto la entrada ocurre una sola vez. Los elementos marcados con
   * data-repite la rehacen cada vez que vuelven a pantalla, y solo se rearman
   * cuando han salido del todo: si se rearmaran a medias, la animacion se
   * desharia delante de quien esta leyendo.
   */
  const io = new IntersectionObserver(
    (entries) => {
      observadorVivo = true;
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        const repite = el.dataset.repite !== undefined;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          el.classList.add('is-revealed');
          if (!repite) io.unobserve(el);
          return;
        }

        if (repite && entry.intersectionRatio === 0) {
          el.classList.remove('is-revealed');
        }
      });
    },
    { threshold: [0, 0.15], rootMargin: '0px 0px -40px 0px' },
  );

  items.forEach((el) => io.observe(el));

  /**
   * Red de seguridad. Si el observador no llega a dispararse nunca (navegador
   * que no compone frames, IntersectionObserver capado, una extension que lo
   * rompe), el contenido se quedaria invisible para siempre.
   *
   * En un navegador sano esto no hace nada: el observador dispara en cuanto se
   * conectan los elementos, mucho antes de los 2 segundos.
   *
   * Regla de fondo: una animacion puede fallar, el contenido no.
   */
  window.setTimeout(() => {
    if (observadorVivo) return;
    io.disconnect();
    items.forEach((el) => el.classList.add('is-revealed'));
  }, 2000);
}

/**
 * Nav superior con blur. Transparente arriba; a partir de 80px de scroll
 * aparece con backdrop-filter y fondo --blanc al 80%.
 * Se resuelve con un centinela, no con un listener de scroll.
 */
function setupHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const sentinel = document.querySelector('[data-header-sentinel]');
  if (!header || !sentinel) return;

  const io = new IntersectionObserver(
    ([entry]) => {
      header.dataset.scrolled = entry.isIntersecting ? 'false' : 'true';
    },
    { threshold: 0 },
  );
  io.observe(sentinel);
}

/** Menu movil: panel a pantalla completa, foco atrapado, Escape cierra. */
function setupNav() {
  /**
   * Los desplegables de escritorio son elementos details, y un details no
   * sabe nada de los demas: al abrir el segundo, el primero seguia abierto y
   * los dos paneles se montaban uno encima de otro.
   *
   * Se cierran entre ellos al abrirse, y todos al pulsar fuera o Escape.
   */
  const menus = Array.from(document.querySelectorAll<HTMLDetailsElement>('[data-menu]'));

  const cerrarMenus = (salvo?: HTMLDetailsElement) => {
    menus.forEach((menu) => {
      if (menu !== salvo) menu.open = false;
    });
  };

  menus.forEach((menu) => {
    // Se escucha el clic en el resumen y no el evento toggle: toggle se
    // dispara de forma asincrona, asi que entre abrir uno y cerrar el otro
    // habria un instante con los dos paneles montados. El clic es sincrono.
    // Tambien cubre el teclado: Enter y Espacio sobre un summary disparan
    // clic.
    menu.querySelector('summary')?.addEventListener('click', () => {
      if (!menu.open) cerrarMenus(menu);
    });
  });

  if (menus.length) {
    document.addEventListener('click', (evento) => {
      const dentro = menus.some((menu) => menu.contains(evento.target as Node));
      if (!dentro) cerrarMenus();
    });

    document.addEventListener('keydown', (evento) => {
      if (evento.key !== 'Escape') return;
      const abierto = menus.find((menu) => menu.open);
      if (!abierto) return;
      abierto.open = false;
      abierto.querySelector('summary')?.focus();
    });
  }

  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-nav-panel]');
  if (!toggle || !panel) return;

  const focusables = () =>
    Array.from(
      panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    );

  function open() {
    panel.hidden = false;
    toggle!.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    focusables()[0]?.focus();
  }

  function close() {
    panel!.hidden = true;
    toggle!.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggle!.focus();
  }

  toggle.addEventListener('click', () => {
    toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
  });

  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    const list = focusables();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  panel.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', close);
  });
}

/** Apertura del hero: los parpados se separan al cargar. */
function setupApertures() {
  const closed = document.querySelectorAll<HTMLElement>('[data-lids="closed"]');
  if (!closed.length) return;

  if (reduced.matches) {
    closed.forEach((el) => (el.dataset.lids = 'open'));
    return;
  }

  const abrir = () => closed.forEach((el) => (el.dataset.lids = 'open'));

  // Un frame de margen para que la transicion tenga estado inicial que animar.
  requestAnimationFrame(() => requestAnimationFrame(abrir));

  // Red de seguridad: si requestAnimationFrame no corre (pestana en segundo
  // plano al cargar, navegador que no pinta), los parpados taparian la imagen
  // indefinidamente. A los 2 segundos se abren igual.
  window.setTimeout(abrir, 2000);
}

/**
 * Rotador del hero: una palabra francesa gira sobre su traduccion al espanol.
 * Se detiene solo si el usuario pide menos movimiento.
 */
/**
 * El verbo del hero se borra letra a letra y el siguiente se escribe letra a
 * letra.
 *
 * Solo existe una palabra en pantalla, asi que no hay nada que se pueda
 * solapar. El ancho de la caja lo reserva un pseudoelemento con el verbo de
 * destino, y ese ancho solo cambia en el instante en que la caja esta vacia:
 * mientras se escribe, la linea no se mueve ni un pixel.
 */
function setupRotator() {
  const rotator = document.querySelector<HTMLElement>('[data-rotator]');
  const texto = rotator?.querySelector<HTMLElement>('[data-text]');
  if (!rotator || !texto) return;

  let verbos: string[] = [];
  try {
    verbos = JSON.parse(rotator.dataset.verbos ?? '[]');
  } catch {
    return;
  }
  if (verbos.length < 2) return;

  // Sin movimiento se queda el primer verbo, quieto y sin cursor.
  if (reduced.matches) return;

  const BORRAR = 42; // por letra al borrar
  const ESCRIBIR = 68; // por letra al escribir
  const VACIO = 280; // respiro con la caja vacia
  const LLENO = 1800; // tiempo de lectura con la palabra entera

  rotator.dataset.escribiendo = 'true';

  /**
   * Se reserva el ALTO del titular, no el ancho.
   *
   * El ancho reservado dejaba un hueco blanco esperando a llenarse. El alto no
   * se ve, y hace falta: en movil el titular pasa de cuatro a cinco lineas
   * segun crece el verbo, y sin esto el boton daba un salto de 38px en cada
   * vuelta.
   *
   * Se mide una vez, probando los cuatro verbos, y se repite si cambia el
   * ancho de la ventana.
   */
  const titular = rotator.closest('h1');

  const reservarAlto = () => {
    if (!titular) return;
    const previo = texto.textContent;
    titular.style.minHeight = '';

    let maximo = 0;
    verbos.forEach((verbo) => {
      texto.textContent = verbo;
      maximo = Math.max(maximo, titular.getBoundingClientRect().height);
    });

    texto.textContent = previo;
    titular.style.minHeight = `${Math.ceil(maximo)}px`;
  };

  reservarAlto();
  if ('fonts' in document) {
    (document as Document & { fonts: FontFaceSet }).fonts.ready.then(reservarAlto);
  }

  let anchoPrevio = window.innerWidth;
  let reajuste = 0;
  window.addEventListener(
    'resize',
    () => {
      if (Math.abs(window.innerWidth - anchoPrevio) < 40) return;
      anchoPrevio = window.innerWidth;
      window.clearTimeout(reajuste);
      reajuste = window.setTimeout(reservarAlto, 200);
    },
    { passive: true },
  );

  const espera = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
  // Un poco de irregularidad: escribir a intervalos exactos suena a maquina.
  const humano = (ms: number) => ms + Math.random() * 44 - 22;

  let i = 0;

  const bucle = async () => {
    for (;;) {
      await espera(LLENO);

      // Borrar la actual.
      const actual = verbos[i];
      for (let n = actual.length; n > 0; n -= 1) {
        texto.textContent = actual.slice(0, n - 1);
        await espera(humano(BORRAR));
      }

      // Un respiro con la linea ya cerrada, antes de volver a escribir.
      i = (i + 1) % verbos.length;
      await espera(VACIO);

      // Escribir la siguiente.
      const siguiente = verbos[i];
      for (let n = 1; n <= siguiente.length; n += 1) {
        texto.textContent = siguiente.slice(0, n);
        await espera(humano(ESCRIBIR));
      }
    }
  };

  void bucle();
}

/**
 * El parpadeo: los parpados se abren para revelar la seccion de cierre.
 * Segunda y ultima aparicion del gesto en el home.
 */
function setupBlink() {
  const blinks = Array.from(
    document.querySelectorAll<HTMLElement>('[data-blink="closed"]'),
  );
  if (!blinks.length) return;

  if (reduced.matches) {
    blinks.forEach((el) => (el.dataset.blink = 'open'));
    return;
  }

  let observadorVivo = false;

  /**
   * El parpadeo se repite cada vez que la seccion vuelve a entrar, no solo la
   * primera. Se vuelve a cerrar solo cuando la seccion ha salido del todo de
   * la pantalla, para que nunca se cierre delante de quien esta leyendo.
   */
  const io = new IntersectionObserver(
    (entries) => {
      observadorVivo = true;
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (entry.intersectionRatio >= 0.25) {
          el.dataset.blink = 'open';
        } else if (entry.intersectionRatio === 0) {
          el.dataset.blink = 'closed';
        }
      });
    },
    { threshold: [0, 0.25] },
  );

  blinks.forEach((el) => io.observe(el));

  // Aqui la red de seguridad es especialmente importante: los parpados del
  // parpadeo cubren una seccion entera, incluido su CTA. Si el observador no
  // dispara, esa seccion quedaria tapada por dos bloques blancos.
  window.setTimeout(() => {
    if (observadorVivo) return;
    io.disconnect();
    blinks.forEach((el) => (el.dataset.blink = 'open'));
  }, 2500);
}

/** El acento se dibuja con trazo cuando entra la seccion del metodo. */
function setupAccentStroke() {
  const accent = document.querySelector<HTMLElement>('[data-accent-stroke]');
  if (!accent) return;

  if (reduced.matches) {
    accent.dataset.drawn = 'true';
    return;
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      accent.dataset.drawn = 'true';
      io.disconnect();
    },
    { threshold: 0.6 },
  );
  io.observe(accent);
}

/**
 * El metodo se queda quieto y lo unico que se mueve son los pasos.
 *
 * La seccion se pega mientras se pasa por ella y los cuatro pasos recorren
 * una ventana de alto fijo. El que toca esta arriba y nitido; el siguiente
 * asoma por abajo desenfocado, para que se vea que hay mas sin poder leerlo
 * todavia; y el anterior ya ha salido por arriba deshaciendose.
 *
 * Antes compartian celda y en el relevo se pisaban las letras. Repartidos por
 * sitio eso no puede pasar: cada uno ocupa el suyo.
 *
 * El apilado lo enciende este guion y solo si va a poder moverlos. Sin
 * JavaScript, o con movimiento reducido, la pista no crece, el bloque no se
 * pega y los cuatro pasos se leen en columna. Esconder desde el CSS lo que
 * levanta el guion ya me costo una seccion invisible; aqui no se repite.
 */
async function setupMetodo() {
  const pista = document.querySelector<HTMLElement>('[data-metodo-pista]');
  const fija = document.querySelector<HTMLElement>('[data-metodo-fija]');
  const lista = document.querySelector<HTMLElement>('[data-metodo-pasos]');
  if (!pista || !fija || !lista) return;

  const pasos = Array.from(lista.querySelectorAll<HTMLElement>('.paso'));
  const tramos = Array.from(
    pista.querySelectorAll<HTMLElement>('.carril__tramo'),
  );
  if (pasos.length < 2) return;

  // Sin movimiento la seccion se lee entera, en columna y sin pista alta.
  if (reduced.matches) {
    tramos.forEach((t) => {
      t.dataset.pasado = 'true';
    });
    return;
  }

  pista.dataset.apilado = 'true';
  fija.dataset.apilado = 'true';
  lista.dataset.apilado = 'true';

  const n = pasos.length;

  /**
   * El avance va de 0 a n-1: al empezar el primero esta centrado y al acabar
   * lo esta el ultimo. Con n-0.5, que es lo que habia, el cuarto terminaba a
   * un tercio de opacidad en vez de entero.
   */
  const RECORRIDO = n - 1;

  const limitar = (v: number, min: number, max: number) =>
    v < min ? min : v > max ? max : v;

  /** Arranque y frenada suaves: una recta se siente mecanica. */
  const suave = (t: number) => t * t * (3 - 2 * t);

  /**
   * La separacion no puede ser un numero fijo. En una columna estrecha el
   * texto de un paso se reparte en mas lineas y crece: en escritorio el mas
   * alto mide 122 y en un movil 228. Con los 132 fijos que habia, en movil se
   * pisaban. Se mide y se recalcula.
   */
  let SEPARACION = 0;

  function medir() {
    const mayor = Math.max(...pasos.map((paso) => paso.offsetHeight));
    SEPARACION = mayor + 30;
    // El ancla no va al medio: lo que sobra por abajo es el sitio del asomo.
    const ancla = mayor / 2 + 14;
    lista.style.setProperty('--ancla', ancla.toFixed(0) + 'px');
    lista.style.setProperty(
      '--ventana',
      (ancla + SEPARACION - mayor / 2 + 70).toFixed(0) + 'px',
    );
  }

  function pintar(progreso: number) {
    const avance = progreso * RECORRIDO;

    pasos.forEach((paso, i) => {
      // 0 es el que toca. Negativo, los que todavia vienen, abajo. Positivo,
      // los que ya pasaron, arriba.
      const d = avance - i;

      // El sitio es lo que reparte: cada paso se separa del activo lo mismo.
      const desplaza = -d * SEPARACION;

      let opacidad: number;
      let escala: number;
      let desenfoque: number;

      if (d <= 0) {
        // Viene por abajo. El primero de la cola asoma al 34 por ciento y
        // desenfocado, para que se lea que hay mas y no cual.
        const cerca = limitar(-d, 0, 1);
        const lejos = limitar(-d - 1, 0, 1);
        opacidad = (1 - 0.66 * suave(cerca)) * (1 - suave(lejos));
        escala = 1 - 0.05 * cerca - 0.03 * lejos;
        desenfoque = 2.4 * suave(cerca) + 1.4 * lejos;
      } else {
        // Ya paso: sube y se deshace. Aguanta entero hasta d = 0,4 y solo
        // entonces empieza a irse. Con la caida arrancando en d = 0 habia un
        // tramo en que ninguno estaba nitido: el que salia ya iba por la
        // mitad y el que entraba todavia no habia llegado.
        const t = suave(limitar((d - 0.4) / 0.6, 0, 1));
        opacidad = 1 - t;
        escala = 1 - 0.09 * t;
        desenfoque = 1.6 * t;
      }

      // El desenfoque se redondea a saltos de un cuarto de pixel: cada valor
      // nuevo obliga a rasterizar el texto otra vez.
      const dz = Math.round(desenfoque * 4) / 4;

      paso.style.opacity = opacidad.toFixed(3);
      paso.style.transform =
        'translate3d(0, calc(-50% + ' +
        desplaza.toFixed(1) +
        'px), 0) scale(' +
        escala.toFixed(4) +
        ')';
      paso.style.filter = dz > 0 ? 'blur(' + dz + 'px)' : '';
      // El que no se lee tampoco se toca ni se tabula.
      paso.style.visibility = opacidad < 0.03 ? 'hidden' : 'visible';
    });

    const activo = limitar(Math.floor(avance + 0.25), 0, n - 1);
    tramos.forEach((tramo, i) => {
      const esActivo = i === activo ? 'true' : 'false';
      const esPasado = i < activo ? 'true' : 'false';
      if (tramo.dataset.activo !== esActivo) tramo.dataset.activo = esActivo;
      if (tramo.dataset.pasado !== esPasado) tramo.dataset.pasado = esPasado;
    });
  }

  // Primer pintado antes de pedir Motion por la red: sin esto los cuatro se
  // ven amontonados hasta que llega el modulo.
  medir();
  pintar(0);

  // Al cambiar el ancho cambian las alturas, y con ellas la separacion. Solo
  // se rehace si el cambio es real: en movil la barra del navegador aparece y
  // desaparece y eso dispara resize sin que nada se haya movido.
  let anchoPrevio = window.innerWidth;
  let reajuste = 0;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - anchoPrevio) < 40) return;
    anchoPrevio = window.innerWidth;
    window.clearTimeout(reajuste);
    reajuste = window.setTimeout(medir, 180);
  });

  const { scroll } = await import('motion');

  scroll(pintar, { target: pista, offset: ['start start', 'end end'] });
}


/**
 * Los tejados del hero se separan por capas al bajar: la de delante se mueve
 * mas que la del fondo. Recorrido corto, solo transform.
 */
async function setupParisBackdrop() {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero || reduced.matches) return;

  const imagen = hero.querySelector<HTMLElement>('.paris__img');
  if (!imagen) return;

  const { scroll } = await import('motion');
  scroll(
    (progress: number) => {
      // Recorrido corto: los tejados se quedan un poco atras al bajar.
      // El scale da margen para moverse sin que asome el borde de la imagen.
      imagen.style.transform = `translate3d(0, ${progress * 26}px, 0) scale(1.05)`;
    },
    { target: hero, offset: ['start start', 'end start'] },
  );
}

/** Parallax de las imagenes grandes. Recorrido maximo 40px. */
async function setupParallax() {
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>('[data-parallax]'),
  );
  if (!targets.length || reduced.matches) return;

  const { scroll } = await import('motion');
  targets.forEach((target) => {
    scroll(
      (progress: number) => {
        // Ademas del recorrido, la imagen entra a 1.03 y asienta en 1.0 justo
        // cuando queda centrada. Se nota como respiracion, no como zoom.
        const escala = 1 + Math.max(0, 0.5 - progress) * 0.06;
        target.style.transform = `translate3d(0, ${(progress - 0.5) * -40}px, 0) scale(${escala.toFixed(4)})`;
      },
      { target, offset: ['start end', 'end start'] },
    );
  });
}

/**
 * La escena del test se compone al llegar a pantalla: aparece el centro, se
 * dibujan los arcos de dentro hacia fuera y caen las pastillas, escalonadas y
 * cada una desde su lado. Los tiempos estan en el CSS, en el retraso de cada
 * elemento; aqui solo se pone y se quita un atributo.
 *
 * Esta seccion fallo dos veces, y las dos por lo mismo: mecanismos que podian
 * dejar contenido invisible. Ahora el unico estado escondido cuelga de
 * data-entrada, que pone este guion despues de comprobar que tiene todas las
 * piezas. Si esto no corre, no ha escondido nada y la escena se ve entera.
 *
 * No hay parallax ni gesto al pasar por encima: lo unico que reacciona al
 * puntero es el boton.
 */
function setupTest() {
  const escena = document.querySelector<HTMLElement>('[data-test-escena]');
  if (!escena) return;

  const piezas = escena.querySelectorAll('.nivel__entrada, .arco, .escena__disco');

  // Sin las piezas, o sin movimiento, no se toca nada: la escena ya esta
  // entera en el HTML y asi se queda.
  if (!piezas.length || reduced.matches) {
    escena.dataset.montado = 'true';
    return;
  }

  const poner = () => {
    if (escena.dataset.entrada !== 'oculta') return;
    delete escena.dataset.entrada;
    escena.dataset.montado = 'true';
  };

  escena.dataset.entrada = 'oculta';

  // Cinturon: pase lo que pase, a los seis segundos la escena esta puesta.
  const rescate = window.setTimeout(poner, 6000);

  let observadorVivo = false;

  const io = new IntersectionObserver(
    (registros) => {
      observadorVivo = true;
      if (!registros.some((r) => r.isIntersecting && r.intersectionRatio >= 0.15)) {
        return;
      }
      io.disconnect();
      window.clearTimeout(rescate);
      poner();
    },
    { threshold: [0, 0.15, 0.5] },
  );

  io.observe(escena);

  // Red de seguridad: solo si el observador no ha dado senales de vida. Con
  // la comprobacion, una seccion que esta muy abajo ya no se revela sola
  // antes de que nadie haya bajado hasta ella.
  window.setTimeout(() => {
    if (observadorVivo) return;
    io.disconnect();
    window.clearTimeout(rescate);
    poner();
  }, 2600);
}






function boot() {
  // Antes que setupReveals: los titulares que se parten se quitan a si mismos
  // el data-reveal, para no llevar dos entradas encima.
  setupLineReveal();
  setupWordReveal();
  setupReveals();
  setupHeader();
  setupNav();
  setupApertures();
  setupRotator();
  setupBlink();
  setupAccentStroke();
  setupParisBackdrop();
  // Las dos piezas ligadas a scroll cargan Motion aparte, ya pintado el hero.
  setupMetodo();
  setupTest();
  setupParallax();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
