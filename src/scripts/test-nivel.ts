/**
 * EL TEST DE NIVEL.
 *
 * Cuatro pantallas: portada, preguntas, datos y resultado.
 *
 * Las preguntas: una por pantalla, siete formas de preguntar, y no se pasa
 * sin responder. Van mezcladas y en otro orden en cada intento, igual que las
 * opciones de dentro, para que nadie se las aprenda. Durante el test no se ve
 * de que nivel es cada pregunta: la barra solo cuenta cuantas faltan, con un
 * aviso al cuarto, a la mitad y al final. Las opciones se eligen tambien con
 * el teclado (1 a 4 o A a D) y Enter avanza.
 *
 * El nivel no sale de la nota global sino del porcentaje de cada bloque, y se
 * para en el primero que no se domina: asi alguien que acierta cuatro cosas
 * sueltas de C1 pero falla A2 no sale como C1.
 *
 * Antes del resultado se piden nombre y objetivo. El resultado dice el nivel,
 * lo que ya se sabe hacer, las fortalezas, donde mejorar (con un consejo
 * concreto) y los aciertos por nivel. El boton final manda todo a Aline por
 * WhatsApp, con los tres textos escritos, que son lo unico que no se corrige
 * solo.
 *
 * Nada se guarda en ningun servidor: solo llega a Aline si la persona pulsa
 * el boton.
 */
import {
  PREGUNTAS,
  BLOQUES,
  AREAS,
  NIVELES,
  type Area,
  type Bloque,
  type Pregunta,
} from '../data/test-nivel';
import { whatsapp } from '../data/site';

/** Cada redaccion va entera hasta este largo; mas alla se corta. */
const MAXIMO_REDACCION = 600;

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
const CURVA = 'cubic-bezier(0.16, 1, 0.3, 1)';
const REBOTE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/** Animacion con la API nativa del navegador. Con movimiento reducido, nada. */
function animar(el: Element, fotogramas: Keyframe[], opciones: KeyframeAnimationOptions) {
  if (reducido.matches) return null;
  return el.animate(fotogramas, { fill: 'backwards', ...opciones });
}

/** Normaliza para comparar: sin tildes, sin comillas raras, sin dobles espacios. */
function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?]+$/, '');
}

/** Una copia barajada (Fisher-Yates). */
function barajar<T>(lista: readonly T[]): T[] {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Un orden nuevo para cada intento: las preguntas mezcladas y, dentro de cada
 * una, las opciones, las afirmaciones, las parejas y las fichas. La nota no
 * cambia: se compara por texto, o contra esta misma copia barajada.
 */
function nuevoOrden(): Pregunta[] {
  return barajar(PREGUNTAS).map((p) => {
    switch (p.tipo) {
      case 'opcion':
        return { ...p, opciones: barajar(p.opciones) };
      case 'verdadero-falso':
        return { ...p, afirmaciones: barajar(p.afirmaciones) };
      case 'emparejar':
        return { ...p, parejas: barajar(p.parejas) };
      case 'ordenar': {
        // Que las fichas no salgan, por casualidad, ya en su sitio.
        let palabras = barajar(p.palabras);
        for (let i = 0; i < 5 && normalizar(palabras.join(' ')) === normalizar(p.ordenCorrecto); i++) {
          palabras = barajar(p.palabras);
        }
        return { ...p, palabras };
      }
      default:
        return p;
    }
  });
}

type Respuesta = string | string[];

interface Marcador {
  obtenidos: number;
  posibles: number;
  porcentaje: number;
}

/**
 * Puntua una pregunta. Devuelve null cuando no se puede puntuar sola, que
 * es el caso de las redacciones.
 */
function puntuar(pregunta: Pregunta, respuesta: Respuesta | undefined): number | null {
  if (pregunta.tipo === 'redaccion') return null;
  if (respuesta === undefined) return 0;

  switch (pregunta.tipo) {
    case 'opcion':
      return normalizar(String(respuesta)) === normalizar(pregunta.correcta) ? pregunta.puntos : 0;

    case 'verdadero-falso': {
      const dadas = respuesta as string[];
      const aciertos = pregunta.afirmaciones.filter((a, i) => (dadas[i] === 'v') === a.verdadera).length;
      return (aciertos / pregunta.afirmaciones.length) * pregunta.puntos;
    }

    case 'huecos': {
      const dadas = respuesta as string[];
      const aciertos = pregunta.correctas.filter(
        (c, i) => normalizar(dadas[i] ?? '') === normalizar(c),
      ).length;
      return (aciertos / pregunta.correctas.length) * pregunta.puntos;
    }

    case 'ordenar':
      return normalizar(String(respuesta)) === normalizar(pregunta.ordenCorrecto) ? pregunta.puntos : 0;

    case 'emparejar': {
      const dadas = respuesta as string[];
      const aciertos = pregunta.parejas.filter(
        (p, i) => normalizar(dadas[i] ?? '') === normalizar(p.derecha),
      ).length;
      return (aciertos / pregunta.parejas.length) * pregunta.puntos;
    }

    case 'audio': {
      const dadas = respuesta as string[];
      const aciertos = pregunta.subPreguntas.filter((sp, i) => {
        const dada = normalizar(dadas[i] ?? '');
        return [sp.correcta, ...(sp.alternativas ?? [])].some((v) => dada.includes(normalizar(v)));
      }).length;
      return (aciertos / pregunta.subPreguntas.length) * pregunta.puntos;
    }
  }
}

/** El nivel, bloque a bloque: dominado desde el 75 %, en curso desde el 50 %. */
interface Nivel {
  /** El ultimo dominado, o A1 si todavia ninguno. */
  principal: Bloque;
  /** Pre-A1 si ni siquiera A1 esta en curso. */
  empezando: boolean;
  /** El siguiente, si ya esta en curso. */
  siguiente: Bloque | null;
  dominados: Bloque[];
  texto: string;
}

function calcularNivel(marcadores: Record<Bloque, Marcador>): Nivel {
  const dom = (b: Bloque) => marcadores[b].porcentaje >= 0.75;
  const enCurso = (b: Bloque) => marcadores[b].porcentaje >= 0.5;

  const dominados: Bloque[] = [];
  for (const b of BLOQUES) {
    if (!dom(b)) break;
    dominados.push(b);
  }

  if (!dominados.length) {
    const aprendiendo = enCurso('A1');
    return {
      principal: 'A1',
      empezando: !aprendiendo,
      siguiente: null,
      dominados,
      texto: aprendiendo ? 'A1 en curso' : 'Pre-A1',
    };
  }

  const principal = dominados[dominados.length - 1];
  const sig = BLOQUES[BLOQUES.indexOf(principal) + 1];
  const siguiente = sig && enCurso(sig) ? sig : null;
  return {
    principal,
    empezando: false,
    siguiente,
    dominados,
    texto: siguiente ? `${principal}, camino al ${siguiente}` : principal,
  };
}

export function iniciarTest() {
  const raiz = document.querySelector<HTMLElement>('[data-test]');
  const intro = document.querySelector<HTMLElement>('[data-test-intro]');
  const datos = document.querySelector<HTMLElement>('[data-test-datos]');
  const resultado = document.querySelector<HTMLElement>('[data-test-resultado]');
  if (!raiz || !intro || !datos || !resultado) return;

  const zona = raiz.querySelector<HTMLElement>('[data-test-zona]')!;
  const barra = raiz.querySelector<HTMLElement>('[data-test-barra]')!;
  const cuenta = raiz.querySelector<HTMLElement>('[data-test-cuenta]')!;
  const chip = raiz.querySelector<HTMLElement>('[data-test-chip]')!;
  const hito = raiz.querySelector<HTMLElement>('[data-test-hito]')!;
  const segmentos = [...barra.querySelectorAll<HTMLElement>('[data-test-segmento]')];
  const atras = raiz.querySelector<HTMLButtonElement>('[data-test-atras]')!;
  const seguir = raiz.querySelector<HTMLButtonElement>('[data-test-seguir]')!;
  const empezar = document.querySelector<HTMLButtonElement>('[data-test-empezar]');

  const respuestas = new Map<string, Respuesta>();
  /* Para ordenar se guardan los indices de las fichas, no el texto: hay
     fichas de varias palabras (est-ce que) y partir la frase por espacios
     las rompe. */
  const fichasElegidas = new Map<string, number[]>();
  let orden = nuevoOrden();
  let actual = 0;
  let nombre = '';
  let objetivo = '';

  /* --- Cambio de pantalla --------------------------------------------------- */

  function mostrar(de: HTMLElement, a: HTMLElement, foco?: HTMLElement | null) {
    let salida: Animation | null = null;
    const entrar = () => {
      de.hidden = true;
      // La salida deja la pantalla transparente; se cancela para que, si
      // vuelve a mostrarse (repetir el test), no aparezca invisible.
      salida?.cancel();
      a.hidden = false;
      animar(a, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], {
        duration: 520,
        easing: CURVA,
      });
      a.scrollIntoView({ behavior: reducido.matches ? 'auto' : 'smooth', block: 'start' });
      (foco ?? a).focus({ preventScroll: true });
    };
    salida = animar(de, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-12px)' }], {
      duration: 200,
      easing: 'ease-in',
      fill: 'forwards',
    });
    if (salida) salida.finished.then(entrar);
    else entrar();
  }

  /* --- Pintado de cada tipo de pregunta ------------------------------------ */

  function campo(etiqueta: string, valor: string, indice: number) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'test-campo';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.dataset.hueco = String(indice);
    input.value = valor;
    input.setAttribute('aria-label', etiqueta);
    return input;
  }

  /** Un pequeño golpe al elegir: el boton se hunde y vuelve. */
  function pulsar(el: Element) {
    animar(el, [{ transform: 'scale(0.97)' }, { transform: 'scale(1)' }], {
      duration: 260,
      easing: REBOTE,
    });
  }

  const PISTAS: Record<Pregunta['tipo'], string> = {
    opcion: 'Elige una opción',
    'verdadero-falso': 'Vrai ou faux',
    huecos: 'Completa',
    ordenar: 'Ordena la frase',
    redaccion: 'Escribe',
    emparejar: 'Relaciona',
    audio: 'Escucha',
  };

  function pintarPregunta(p: Pregunta) {
    zona.textContent = '';

    const pista = document.createElement('p');
    pista.className = 'test-pista';
    pista.textContent = PISTAS[p.tipo];

    const enunciado = document.createElement('p');
    enunciado.className = 'test-enunciado';
    enunciado.textContent = p.enunciado;
    zona.append(pista, enunciado);

    const previa = respuestas.get(p.id);

    if (p.tipo === 'opcion') {
      const lista = document.createElement('div');
      lista.className = 'test-opciones';
      p.opciones.forEach((op, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'test-opcion';
        btn.dataset.indice = String(i);
        const letra = document.createElement('span');
        letra.className = 'test-letra';
        letra.textContent = 'ABCD'[i] ?? String(i + 1);
        letra.setAttribute('aria-hidden', 'true');
        const texto = document.createElement('span');
        texto.textContent = op;
        btn.append(letra, texto);
        btn.setAttribute('aria-pressed', String(previa === op));
        btn.addEventListener('click', () => {
          respuestas.set(p.id, op);
          lista.querySelectorAll('.test-opcion').forEach((o) =>
            o.setAttribute('aria-pressed', String(o === btn)),
          );
          pulsar(btn);
          revisarSeguir();
        });
        lista.append(btn);
      });
      zona.append(lista);
    }

    if (p.tipo === 'verdadero-falso' || p.tipo === 'emparejar') {
      const dadas = (previa as string[]) ?? [];
      const filas =
        p.tipo === 'verdadero-falso'
          ? p.afirmaciones.map((a) => ({ texto: a.texto, valores: ['v', 'f'], etiquetas: ['Vrai', 'Faux'] }))
          : p.parejas.map((par) => {
              const registros = [...new Set(p.parejas.map((x) => x.derecha))];
              return { texto: par.izquierda, valores: registros, etiquetas: registros };
            });
      const lista = document.createElement('div');
      lista.className = 'test-afirmaciones';
      filas.forEach((fila, i) => {
        const caja = document.createElement('div');
        caja.className = 'test-afirmacion';
        const texto = document.createElement('p');
        texto.textContent = fila.texto;
        const grupo = document.createElement('div');
        grupo.className = 'test-vf';
        fila.valores.forEach((valor, j) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'test-opcion test-opcion--corta';
          btn.textContent = fila.etiquetas[j];
          btn.setAttribute('aria-pressed', String(dadas[i] === valor));
          btn.addEventListener('click', () => {
            const guardadas = ((respuestas.get(p.id) as string[]) ?? []).slice();
            guardadas[i] = valor;
            respuestas.set(p.id, guardadas);
            grupo.querySelectorAll('button').forEach((o) =>
              o.setAttribute('aria-pressed', String(o === btn)),
            );
            pulsar(btn);
            revisarSeguir();
          });
          grupo.append(btn);
        });
        caja.append(texto, grupo);
        lista.append(caja);
      });
      zona.append(lista);
    }

    if (p.tipo === 'huecos') {
      const dadas = (previa as string[]) ?? [];
      const caja = document.createElement('div');
      caja.className = 'test-huecos';
      const trozos = p.texto.split('___');
      trozos.forEach((trozo, i) => {
        const span = document.createElement('span');
        span.className = 'test-huecos__texto';
        span.textContent = trozo;
        caja.append(span);
        if (i < trozos.length - 1) {
          const input = campo(`Hueco ${i + 1}`, dadas[i] ?? '', i);
          input.addEventListener('input', () => {
            const guardadas = ((respuestas.get(p.id) as string[]) ?? []).slice();
            guardadas[i] = input.value;
            respuestas.set(p.id, guardadas);
            revisarSeguir();
          });
          caja.append(input);
        }
      });
      zona.append(caja);
    }

    if (p.tipo === 'ordenar') {
      const elegidas = (fichasElegidas.get(p.id) ?? []).slice();
      const guardar = () => {
        fichasElegidas.set(p.id, elegidas.slice());
        respuestas.set(p.id, elegidas.map((i) => p.palabras[i]).join(' '));
      };
      const destino = document.createElement('p');
      destino.className = 'test-frase';
      const banco = document.createElement('div');
      banco.className = 'test-opciones test-opciones--fichas';

      const repintar = () => {
        destino.textContent =
          elegidas.map((i) => p.palabras[i]).join(' ') || 'Toca las palabras en orden';
        destino.dataset.vacia = String(elegidas.length === 0);
        banco.textContent = '';
        p.palabras.forEach((palabra, i) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'test-ficha';
          btn.textContent = palabra;
          btn.disabled = elegidas.includes(i);
          btn.addEventListener('click', () => {
            elegidas.push(i);
            guardar();
            repintar();
            animar(destino, [{ transform: 'scale(1.015)' }, { transform: 'scale(1)' }], {
              duration: 220,
              easing: REBOTE,
            });
            revisarSeguir();
          });
          banco.append(btn);
        });
        const deshacer = document.createElement('button');
        deshacer.type = 'button';
        deshacer.className = 'test-deshacer';
        deshacer.textContent = 'Borrar la última';
        deshacer.disabled = elegidas.length === 0;
        deshacer.addEventListener('click', () => {
          elegidas.pop();
          guardar();
          repintar();
          revisarSeguir();
        });
        banco.append(deshacer);
      };
      repintar();
      zona.append(destino, banco);
    }

    if (p.tipo === 'audio') {
      const dadas = (previa as string[]) ?? [];
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'test-audio';
      const ondas = document.createElement('span');
      ondas.className = 'test-audio__ondas';
      ondas.setAttribute('aria-hidden', 'true');
      ondas.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
      const texto = document.createElement('span');
      texto.textContent = 'Escuchar';
      boton.append(ondas, texto);
      boton.addEventListener('click', () => {
        // Lo lee el propio navegador: no hay archivo de sonido que servir.
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const voz = new SpeechSynthesisUtterance(p.textoAudio);
        voz.lang = 'fr-FR';
        voz.rate = 0.95;
        voz.onstart = () => (boton.dataset.sonando = 'true');
        voz.onend = () => {
          delete boton.dataset.sonando;
          texto.textContent = 'Escuchar otra vez';
        };
        window.speechSynthesis.speak(voz);
      });
      zona.append(boton);

      if (!('speechSynthesis' in window)) {
        const aviso = document.createElement('p');
        aviso.className = 'test-aviso';
        aviso.textContent = p.textoAudio;
        zona.append(aviso);
      }

      const lista = document.createElement('div');
      lista.className = 'test-huecos test-huecos--columna';
      p.subPreguntas.forEach((sp, i) => {
        const et = document.createElement('label');
        et.className = 'test-subpregunta';
        et.textContent = sp.enunciado;
        const input = campo(sp.enunciado, dadas[i] ?? '', i);
        et.append(input);
        input.addEventListener('input', () => {
          const guardadas = ((respuestas.get(p.id) as string[]) ?? []).slice();
          guardadas[i] = input.value;
          respuestas.set(p.id, guardadas);
          revisarSeguir();
        });
        lista.append(et);
      });
      zona.append(lista);
    }

    if (p.tipo === 'redaccion') {
      const area = document.createElement('textarea');
      area.className = 'test-campo test-campo--largo';
      area.rows = 6;
      area.value = String(previa ?? '');
      area.setAttribute('aria-label', 'Tu respuesta');
      const contador = document.createElement('div');
      contador.className = 'test-contador';
      const pistaBarra = document.createElement('span');
      pistaBarra.className = 'test-contador__pista';
      const relleno = document.createElement('span');
      relleno.className = 'test-contador__relleno';
      pistaBarra.append(relleno);
      const cifra = document.createElement('span');
      contador.append(pistaBarra, cifra);

      const contar = () => {
        const n = area.value.trim().split(/\s+/).filter(Boolean).length;
        cifra.textContent = `${n} de ${p.minPalabras}-${p.maxPalabras} palabras`;
        relleno.style.setProperty('--lleno', String(Math.min(n / p.minPalabras, 1)));
        contador.dataset.suficiente = String(n >= p.minPalabras);
      };
      area.addEventListener('input', () => {
        respuestas.set(p.id, area.value);
        contar();
        revisarSeguir();
      });
      contar();
      zona.append(area, contador);
    }
  }

  /** Hay respuesta suficiente para dejar pasar. */
  function respondida(p: Pregunta): boolean {
    const r = respuestas.get(p.id);
    if (r === undefined) return false;
    if (p.tipo === 'ordenar') return (fichasElegidas.get(p.id)?.length ?? 0) === p.palabras.length;
    if (p.tipo === 'redaccion') {
      return String(r).trim().split(/\s+/).filter(Boolean).length >= p.minPalabras;
    }
    if (Array.isArray(r)) {
      const esperadas =
        p.tipo === 'verdadero-falso'
          ? p.afirmaciones.length
          : p.tipo === 'huecos'
            ? p.correctas.length
            : p.tipo === 'emparejar'
              ? p.parejas.length
              : p.tipo === 'audio'
                ? p.subPreguntas.length
                : 0;
      return r.filter((x) => String(x ?? '').trim()).length === esperadas;
    }
    return String(r).trim().length > 0;
  }

  function revisarSeguir() {
    seguir.disabled = !respondida(orden[actual]);
  }

  /**
   * La barra: un tramo por pregunta, sin nombres de nivel. Los hechos se
   * llenan y el de ahora late.
   */
  function pintarBarra(indice: number) {
    const total = orden.length;
    segmentos.forEach((s, i) => {
      s.dataset.estado = i < indice ? 'hecho' : i === indice ? 'actual' : 'pendiente';
    });
    barra.setAttribute('aria-valuenow', String(indice + 1));
    barra.setAttribute('aria-valuetext', `Pregunta ${indice + 1} de ${total}`);
    chip.textContent = `Pregunta ${indice + 1} de ${total}`;
    const quedan = total - indice - 1;
    cuenta.textContent = quedan === 0 ? 'La última' : quedan === 1 ? 'Queda 1' : `Quedan ${quedan}`;
  }

  /**
   * Avisos que animan sin decir el nivel: al empezar, al cuarto, a la mitad,
   * a los tres cuartos y en la ultima. El primero se queda mientras se esta
   * en la primera pregunta; los demas se van solos.
   */
  let tempHito = 0;
  function avisarHito(indice: number, direccion: 1 | -1) {
    window.clearTimeout(tempHito);
    const total = orden.length;
    let texto = '';
    if (indice === 0) {
      texto = 'Vienen mezcladas, fáciles y difíciles. Si una te supera, elige la que te suene mejor.';
    } else if (direccion === 1) {
      if (indice === Math.round(total / 4)) texto = 'Un cuarto hecho. Buen ritmo.';
      else if (indice === Math.round(total / 2)) texto = 'Mitad del camino.';
      else if (indice === Math.round((total * 3) / 4)) texto = `Ya casi: quedan ${total - indice}.`;
      else if (indice === total - 1) texto = 'Última pregunta.';
    }
    hito.textContent = texto;
    if (!texto) return;
    animar(hito, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], {
      duration: 420,
      easing: REBOTE,
    });
    animar(chip, [{ transform: 'scale(0.8)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], {
      duration: 520,
      easing: REBOTE,
    });
    if (indice > 0) tempHito = window.setTimeout(() => (hito.textContent = ''), 3200);
  }

  function pintar(indice: number, direccion: 1 | -1 = 1) {
    actual = indice;
    const p = orden[indice];
    pintarPregunta(p);
    pintarBarra(indice);
    avisarHito(indice, direccion);

    animar(zona, [{ opacity: 0, transform: `translateX(${direccion * 28}px)` }, { opacity: 1, transform: 'none' }], {
      duration: 420,
      easing: CURVA,
    });

    atras.disabled = indice === 0;
    seguir.textContent = indice === orden.length - 1 ? 'Terminar' : 'Siguiente';
    revisarSeguir();
    zona.focus({ preventScroll: true });
    // En movil una pregunta larga dejaria mirando el final de la anterior.
    const arriba = raiz.getBoundingClientRect().top;
    if (arriba < 0 || arriba > window.innerHeight * 0.4) {
      raiz.scrollIntoView({ behavior: reducido.matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  /* --- Resultado ------------------------------------------------------------ */

  function calcular() {
    const marcadores = {} as Record<Bloque, Marcador>;
    BLOQUES.forEach((b) => (marcadores[b] = { obtenidos: 0, posibles: 0, porcentaje: 0 }));
    /**
     * Por area: puntos, el primer nivel donde se fallo algo y el nivel mas
     * alto acertado entero. Donde mejorar se ordena por el primer fallo: a
     * quien acierta la pregunta de A1 y falla la de C1, lo urgente no es A1.
     */
    const areas = new Map<Area, { obtenidos: number; posibles: number; fallo: number; hasta: number }>();
    const redacciones: string[] = [];

    // Se puntua la copia barajada que vio la persona (las respuestas de
    // verdadero o falso y de emparejar van por posicion), pero en el orden
    // original: asi los textos le llegan a Aline siempre en el mismo orden.
    const vistas = new Map(orden.map((p) => [p.id, p]));
    PREGUNTAS.map((p) => vistas.get(p.id) ?? p).forEach((p) => {
      const nota = puntuar(p, respuestas.get(p.id));
      if (nota === null) {
        // Fuera del denominador: si contara como cero, ningun bloque con
        // redaccion podria llegar nunca al 75 por ciento.
        redacciones.push(String(respuestas.get(p.id) ?? ''));
        return;
      }
      marcadores[p.bloque].obtenidos += nota;
      marcadores[p.bloque].posibles += p.puntos;
      const nivelPregunta = BLOQUES.indexOf(p.bloque);
      const a = areas.get(p.area) ?? { obtenidos: 0, posibles: 0, fallo: 99, hasta: -1 };
      a.obtenidos += nota;
      a.posibles += p.puntos;
      if (nota < p.puntos) a.fallo = Math.min(a.fallo, nivelPregunta);
      else a.hasta = Math.max(a.hasta, nivelPregunta);
      areas.set(p.area, a);
    });

    BLOQUES.forEach((b) => {
      const m = marcadores[b];
      m.porcentaje = m.posibles > 0 ? m.obtenidos / m.posibles : 0;
    });

    const porArea = [...areas.entries()].map(([area, a]) => ({
      area,
      pct: a.posibles ? a.obtenidos / a.posibles : 0,
      fallo: a.fallo,
      hasta: a.hasta,
    }));

    // Fortalezas: lo que mejor sale, y hasta que nivel. Donde mejorar: lo
    // primero que falla, porque es lo que sostiene todo lo demas.
    const fortalezas = porArea
      .filter((x) => x.pct >= 0.75)
      .sort((a, b) => b.pct - a.pct || b.hasta - a.hasta)
      .slice(0, 3);
    const mejorar = porArea
      .filter((x) => x.pct < 0.6)
      .sort((a, b) => a.fallo - b.fallo || a.pct - b.pct)
      .slice(0, 3);

    return { marcadores, nivel: calcularNivel(marcadores), fortalezas, mejorar, redacciones };
  }

  const pct = (x: number) => `${Math.round(x * 100)} %`;

  function item(nombreArea: string, porcentaje: string, texto: string) {
    const li = document.createElement('li');
    li.className = 'r-item';
    const cabeza = document.createElement('div');
    cabeza.className = 'r-item__cabeza';
    const n = document.createElement('span');
    n.className = 'r-item__nombre';
    n.textContent = nombreArea;
    cabeza.append(n);
    if (porcentaje) {
      const p = document.createElement('span');
      p.className = 'r-item__pct';
      p.textContent = porcentaje;
      cabeza.append(p);
    }
    const t = document.createElement('p');
    t.className = 'r-item__texto';
    t.textContent = texto;
    li.append(cabeza, t);
    return li;
  }

  function pintarResultado() {
    const r = calcular();
    const q = (sel: string) => resultado.querySelector<HTMLElement>(sel);

    const saludo = q('[data-r-saludo]');
    if (saludo) saludo.textContent = `Bravo, ${nombre}. Este es tu resultado.`;

    const clave = r.nivel.empezando ? 'Pre-A1' : r.nivel.principal;
    const nivelEl = q('[data-r-nivel]');
    const etiqueta = q('[data-r-etiqueta]');
    const puedes = q('[data-r-puedes]');
    if (etiqueta) {
      etiqueta.textContent = r.nivel.empezando
        ? 'Estás empezando'
        : r.nivel.siguiente
          ? `${NIVELES[r.nivel.principal].etiqueta} · camino al ${r.nivel.siguiente}`
          : NIVELES[r.nivel.principal].etiqueta;
    }
    if (puedes) puedes.textContent = NIVELES[clave].puedes;

    // El nivel "sube" de A1 hasta el suyo, como un marcador.
    if (nivelEl) {
      const destino = BLOQUES.indexOf(r.nivel.principal);
      nivelEl.textContent = 'A1';
      if (!reducido.matches && destino > 0) {
        let paso = 0;
        const t = window.setInterval(() => {
          paso += 1;
          nivelEl.textContent = BLOQUES[paso];
          animar(nivelEl, [{ transform: 'translateY(10px)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], {
            duration: 260,
            easing: REBOTE,
          });
          if (paso >= destino) window.clearInterval(t);
        }, 320);
      } else {
        nivelEl.textContent = r.nivel.principal;
      }
    }

    // La escala: dominados llenos, el siguiente a medias.
    BLOQUES.forEach((b, i) => {
      const paso = q(`[data-r-escala="${b}"]`);
      if (!paso) return;
      const dominado = r.nivel.dominados.includes(b);
      const curso = r.nivel.siguiente === b || (!r.nivel.dominados.length && b === 'A1' && !r.nivel.empezando);
      paso.dataset.estado = dominado ? 'dominado' : curso ? 'curso' : 'pendiente';
      const relleno = paso.querySelector<HTMLElement>('.escala__relleno');
      const lleno = dominado ? 1 : curso ? 0.5 : 0;
      relleno?.style.setProperty('--lleno', String(lleno));
      if (relleno && lleno > 0) {
        animar(relleno, [{ transform: 'scaleX(0)' }, { transform: `scaleX(${lleno})` }], {
          duration: 700,
          delay: 300 + i * 220,
          easing: CURVA,
        });
      }
    });

    // Fortalezas y donde mejorar.
    const listaBien = q('[data-r-fortalezas]');
    const listaMejorar = q('[data-r-mejorar]');
    if (listaBien) {
      listaBien.textContent = '';
      if (r.fortalezas.length) {
        r.fortalezas.forEach((f) =>
          listaBien.append(
            item(
              AREAS[f.area].nombre,
              pct(f.pct),
              f.hasta >= 0 ? `Lo dominas hasta el nivel ${BLOQUES[f.hasta]}.` : 'Aquí ya tienes una base sólida.',
            ),
          ),
        );
      } else {
        listaBien.append(
          item('Te animaste con todo', '', 'Hiciste el test completo: ese es el primer paso. Con clase, lo básico se asienta rápido.'),
        );
      }
    }
    if (listaMejorar) {
      listaMejorar.textContent = '';
      if (r.mejorar.length) {
        r.mejorar.forEach((m) => listaMejorar.append(item(AREAS[m.area].nombre, pct(m.pct), AREAS[m.area].consejo)));
      } else {
        listaMejorar.append(
          item('Soltura al hablar', '', 'Vas bien en todo lo que mide el test. El siguiente paso es ganar fluidez hablando y afinar la escritura.'),
        );
      }
    }
    [listaBien, listaMejorar].forEach((lista) =>
      lista?.querySelectorAll('.r-item').forEach((li, i) =>
        animar(li, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], {
          duration: 520,
          delay: 700 + i * 120,
          easing: CURVA,
        }),
      ),
    );

    // Aciertos por nivel.
    BLOQUES.forEach((b, i) => {
      const barraNivel = q(`[data-r-barra="${b}"]`);
      const cifra = q(`[data-r-pct="${b}"]`);
      const valor = r.marcadores[b].porcentaje;
      barraNivel?.style.setProperty('--lleno', String(valor));
      if (cifra) cifra.textContent = pct(valor);
      if (barraNivel && valor > 0) {
        animar(barraNivel, [{ transform: 'scaleX(0)' }, { transform: `scaleX(${valor})` }], {
          duration: 800,
          delay: 900 + i * 120,
          easing: CURVA,
        });
      }
    });

    // La llamada final y el mensaje a Aline.
    const tituloCta = q('[data-r-cta-titulo]');
    const meta = r.nivel.siguiente ?? BLOQUES[BLOQUES.indexOf(r.nivel.principal) + 1];
    if (tituloCta) tituloCta.textContent = meta ? `¿Vamos a por el ${meta}, ${nombre}?` : `Vamos a pulir tu francés, ${nombre}`;

    const cta = q('[data-r-cta]') as HTMLAnchorElement | null;
    if (cta) {
      const textos = r.redacciones
        .map((t, i) => {
          const limpio = t.trim().replace(/\s+/g, ' ');
          return `${i + 1}. ${limpio.length > MAXIMO_REDACCION ? `${limpio.slice(0, MAXIMO_REDACCION)}…` : limpio}`;
        })
        .join('\n');
      const mensaje = [
        `Hola, soy ${nombre}. Hice el test de nivel y me gustaría agendar mi clase gratis.`,
        '',
        `Objetivo: ${objetivo}`,
        `Nivel estimado: ${r.nivel.texto}`,
        `Aciertos por nivel: ${BLOQUES.map((b) => `${b} ${pct(r.marcadores[b].porcentaje)}`).join(', ')}`,
        r.fortalezas.length ? `Fortalezas: ${r.fortalezas.map((f) => AREAS[f.area].nombre).join(', ')}` : '',
        r.mejorar.length ? `A mejorar: ${r.mejorar.map((m) => AREAS[m.area].nombre).join(', ')}` : '',
        '',
        'Mis textos:',
        textos,
      ]
        .filter((linea, i, todas) => linea !== '' || todas[i - 1] !== '')
        .join('\n');
      cta.href = whatsapp(mensaje);
    }
  }

  /* --- Datos antes del resultado ------------------------------------------- */

  const campoNombre = datos.querySelector<HTMLInputElement>('[data-test-nombre]')!;
  const botonVer = datos.querySelector<HTMLButtonElement>('[data-test-ver]')!;
  const chips = [...datos.querySelectorAll<HTMLButtonElement>('[data-test-objetivo]')];

  const revisarDatos = () => {
    nombre = campoNombre.value.trim().replace(/\s+/g, ' ');
    botonVer.disabled = nombre.length < 2 || !objetivo;
  };
  campoNombre.addEventListener('input', revisarDatos);
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      objetivo = c.dataset.testObjetivo ?? '';
      chips.forEach((o) => o.setAttribute('aria-pressed', String(o === c)));
      pulsar(c);
      revisarDatos();
    }),
  );
  campoNombre.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !botonVer.disabled) botonVer.click();
  });
  botonVer.addEventListener('click', () => {
    if (botonVer.disabled) return;
    pintarResultado();
    mostrar(datos, resultado, resultado.querySelector<HTMLElement>('[data-r-nivel]'));
  });

  function terminar() {
    mostrar(raiz!, datos!, campoNombre);
    const sello = datos!.querySelector('.datos__sello');
    if (sello) {
      animar(sello, [{ transform: 'scale(0) rotate(-40deg)' }, { transform: 'scale(1) rotate(0)' }], {
        duration: 700,
        delay: 250,
        easing: REBOTE,
      });
    }
  }

  /* --- Arranque y navegacion ----------------------------------------------- */

  empezar?.addEventListener('click', () => {
    mostrar(intro, raiz, zona);
    orden = nuevoOrden();
    actual = 0;
    pintar(0);
  });

  atras.addEventListener('click', () => {
    if (actual > 0) pintar(actual - 1, -1);
  });

  seguir.addEventListener('click', () => {
    if (!respondida(orden[actual])) return;
    if (actual === orden.length - 1) {
      terminar();
      return;
    }
    pintar(actual + 1, 1);
  });

  // Repetir baraja de nuevo: otro orden, otras posiciones.
  resultado.querySelector('[data-r-repetir]')?.addEventListener('click', () => {
    respuestas.clear();
    fichasElegidas.clear();
    orden = nuevoOrden();
    actual = 0;
    mostrar(resultado, raiz, zona);
    pintar(0);
  });

  // Teclado: Enter avanza (salvo dentro de una redaccion) y 1-4 o A-D eligen.
  raiz.addEventListener('keydown', (evento) => {
    const destino = evento.target as HTMLElement;
    const escribiendo = destino.tagName === 'TEXTAREA' || destino.tagName === 'INPUT';
    if (evento.key === 'Enter') {
      if (destino.tagName === 'TEXTAREA' || destino.tagName === 'BUTTON') return;
      evento.preventDefault();
      if (!seguir.disabled) seguir.click();
      return;
    }
    if (escribiendo || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    const p = orden[actual];
    if (p.tipo !== 'opcion') return;
    const indice = '1234'.indexOf(evento.key) >= 0 ? '1234'.indexOf(evento.key) : 'abcd'.indexOf(evento.key.toLowerCase());
    if (indice < 0) return;
    zona.querySelector<HTMLButtonElement>(`.test-opcion[data-indice="${indice}"]`)?.click();
  });
}
