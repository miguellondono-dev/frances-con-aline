/**
 * EL TEST DE NIVEL.
 *
 * Una pregunta por pantalla, siete formas de preguntar y una barra que dice
 * cuanto queda. Se avanza con el raton o con el teclado, y no se puede pasar
 * sin responder: un test a medias no estima nada.
 *
 * El nivel no sale de la nota global. Sale del porcentaje de cada bloque, y
 * se para en el primero que falla: asi alguien que acierta cuatro cosas
 * sueltas de C1 pero falla A2 no sale como C1, que es el error clasico de
 * estos tests.
 *
 * Las tres redacciones no se corrigen aqui. No hay forma honesta de puntuar
 * un texto libre comparando cadenas, asi que se guardan enteras y quedan
 * fuera del denominador de su bloque. El nivel que sale es provisional y el
 * definitivo lo confirma Aline al leerlas.
 *
 * Al final no se ensena resultado: se piden nombre, apellido y correo, y se
 * anuncia que el resultado llega por ahi. Es deliberado. Ver el nivel en
 * pantalla y marcharse no deja nada; recibirlo por correo abre la
 * conversacion.
 */
import { PREGUNTAS, BLOQUES, type Bloque, type Pregunta } from '../data/test-nivel';

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

type Respuesta = string | string[];

interface Marcador {
  obtenidos: number;
  posibles: number;
  porcentaje: number;
}

/**
 * Puntua una pregunta. Devuelve null cuando no se puede puntuar sola, que
 * hoy es solo el caso de las redacciones.
 */
function puntuar(pregunta: Pregunta, respuesta: Respuesta | undefined): number | null {
  if (respuesta === undefined) return 0;

  switch (pregunta.tipo) {
    case 'opcion':
      return normalizar(String(respuesta)) === normalizar(pregunta.correcta)
        ? pregunta.puntos
        : 0;

    case 'verdadero-falso': {
      const dadas = respuesta as string[];
      const aciertos = pregunta.afirmaciones.filter(
        (a, i) => (dadas[i] === 'v') === a.verdadera,
      ).length;
      // Punto a punto: acertar una de dos vale la mitad.
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
      return normalizar(String(respuesta)) === normalizar(pregunta.ordenCorrecto)
        ? pregunta.puntos
        : 0;

    case 'emparejar': {
      const dadas = respuesta as string[];
      const aciertos = pregunta.parejas.filter(
        (p, i) => normalizar(dadas[i] ?? '') === normalizar(p.derecha),
      ).length;
      return (aciertos / pregunta.parejas.length) * pregunta.puntos;
    }

    case 'audio': {
      const dadas = respuesta as string[];
      const aciertos = pregunta.subPreguntas.filter((sp, i) =>
        normalizar(dadas[i] ?? '').includes(normalizar(sp.correcta)),
      ).length;
      return (aciertos / pregunta.subPreguntas.length) * pregunta.puntos;
    }

    case 'redaccion':
      // La lee Aline. Fuera del calculo automatico.
      return null;
  }
}

/**
 * El nivel, bloque a bloque.
 *
 * Dominado a partir del 75 por ciento, en curso entre el 50 y el 75. No se
 * salta ningun bloque: se recorre de A1 a C1 y se para en el primero que no
 * se domina.
 */
function calcularNivel(marcadores: Record<Bloque, Marcador>): string {
  const dom = (b: Bloque) => marcadores[b].porcentaje >= 0.75;
  const enCurso = (b: Bloque) => marcadores[b].porcentaje >= 0.5;

  let ultimoDominado: Bloque | null = null;
  for (const bloque of BLOQUES) {
    if (!dom(bloque)) break;
    ultimoDominado = bloque;
  }

  if (!ultimoDominado) {
    return enCurso('A1') ? 'A1 en curso' : 'Pre-A1';
  }

  const siguiente = BLOQUES[BLOQUES.indexOf(ultimoDominado) + 1];
  if (siguiente && enCurso(siguiente)) {
    return `${ultimoDominado} consolidado, ${siguiente} en curso`;
  }
  return `${ultimoDominado} consolidado`;
}

export function iniciarTest() {
  const raiz = document.querySelector<HTMLElement>('[data-test]');
  if (!raiz) return;

  const zona = raiz.querySelector<HTMLElement>('[data-test-zona]');
  const barra = raiz.querySelector<HTMLElement>('[data-test-barra]');
  const cuenta = raiz.querySelector<HTMLElement>('[data-test-cuenta]');
  const atras = raiz.querySelector<HTMLButtonElement>('[data-test-atras]');
  const seguir = raiz.querySelector<HTMLButtonElement>('[data-test-seguir]');
  const cierre = document.querySelector<HTMLElement>('[data-test-cierre]');
  const intro = document.querySelector<HTMLElement>('[data-test-intro]');
  const empezar = document.querySelector<HTMLButtonElement>('[data-test-empezar]');
  if (!zona || !barra || !cuenta || !atras || !seguir || !cierre || !intro) return;

  const respuestas = new Map<string, Respuesta>();
  /* Para ordenar guardo los indices de las fichas, no el texto: hay fichas de
     varias palabras (est-ce que) y partir la frase por espacios las rompe. */
  const fichasElegidas = new Map<string, number[]>();
  let actual = 0;

  /* --- Pintado de cada tipo --- */

  function campo(nombre: string, valor: string, indice: number) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'test-campo';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.dataset.hueco = String(indice);
    input.value = valor;
    input.setAttribute('aria-label', nombre);
    return input;
  }

  function pintarPregunta(p: Pregunta) {
    zona!.textContent = '';

    const enunciado = document.createElement('p');
    enunciado.className = 'test-enunciado';
    enunciado.textContent = p.enunciado;
    zona!.append(enunciado);

    const previa = respuestas.get(p.id);

    if (p.tipo === 'opcion') {
      const lista = document.createElement('div');
      lista.className = 'test-opciones';
      p.opciones.forEach((op) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'test-opcion';
        btn.textContent = op;
        btn.setAttribute('aria-pressed', String(previa === op));
        btn.addEventListener('click', () => {
          respuestas.set(p.id, op);
          lista.querySelectorAll('.test-opcion').forEach((o) =>
            o.setAttribute('aria-pressed', String(o === btn)),
          );
          revisarSeguir();
        });
        lista.append(btn);
      });
      zona!.append(lista);
    }

    if (p.tipo === 'verdadero-falso') {
      const dadas = (previa as string[]) ?? [];
      const lista = document.createElement('div');
      lista.className = 'test-afirmaciones';
      p.afirmaciones.forEach((af, i) => {
        const fila = document.createElement('div');
        fila.className = 'test-afirmacion';
        const texto = document.createElement('p');
        texto.textContent = af.texto;
        const grupo = document.createElement('div');
        grupo.className = 'test-vf';
        (['v', 'f'] as const).forEach((valor) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'test-opcion test-opcion--corta';
          btn.textContent = valor === 'v' ? 'Vrai' : 'Faux';
          btn.setAttribute('aria-pressed', String(dadas[i] === valor));
          btn.addEventListener('click', () => {
            const guardadas = ((respuestas.get(p.id) as string[]) ?? []).slice();
            guardadas[i] = valor;
            respuestas.set(p.id, guardadas);
            grupo.querySelectorAll('button').forEach((o) =>
              o.setAttribute('aria-pressed', String(o === btn)),
            );
            revisarSeguir();
          });
          grupo.append(btn);
        });
        fila.append(texto, grupo);
        lista.append(fila);
      });
      zona!.append(lista);
    }

    if (p.tipo === 'huecos') {
      const dadas = (previa as string[]) ?? [];
      const caja = document.createElement('div');
      caja.className = 'test-huecos';
      // El texto se parte por los huecos y cada uno se sustituye por un campo.
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
      zona!.append(caja);
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
      zona!.append(destino, banco);
    }

    if (p.tipo === 'emparejar') {
      const dadas = (previa as string[]) ?? [];
      const registros = [...new Set(p.parejas.map((x) => x.derecha))];
      const lista = document.createElement('div');
      lista.className = 'test-afirmaciones';
      p.parejas.forEach((par, i) => {
        const fila = document.createElement('div');
        fila.className = 'test-afirmacion';
        const texto = document.createElement('p');
        texto.textContent = par.izquierda;
        const grupo = document.createElement('div');
        grupo.className = 'test-vf';
        registros.forEach((reg) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'test-opcion test-opcion--corta';
          btn.textContent = reg;
          btn.setAttribute('aria-pressed', String(dadas[i] === reg));
          btn.addEventListener('click', () => {
            const guardadas = ((respuestas.get(p.id) as string[]) ?? []).slice();
            guardadas[i] = reg;
            respuestas.set(p.id, guardadas);
            grupo.querySelectorAll('button').forEach((o) =>
              o.setAttribute('aria-pressed', String(o === btn)),
            );
            revisarSeguir();
          });
          grupo.append(btn);
        });
        fila.append(texto, grupo);
        lista.append(fila);
      });
      zona!.append(lista);
    }

    if (p.tipo === 'audio') {
      const dadas = (previa as string[]) ?? [];
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'test-audio';
      boton.textContent = 'Escuchar';
      boton.addEventListener('click', () => {
        // Lo lee el propio navegador: no hay archivo de sonido que servir.
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const voz = new SpeechSynthesisUtterance(p.textoAudio);
        voz.lang = 'fr-FR';
        voz.rate = 0.95;
        window.speechSynthesis.speak(voz);
      });
      zona!.append(boton);

      if (!('speechSynthesis' in window)) {
        const aviso = document.createElement('p');
        aviso.className = 'test-aviso';
        aviso.textContent = p.textoAudio;
        zona!.append(aviso);
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
      zona!.append(lista);
    }

    if (p.tipo === 'redaccion') {
      const area = document.createElement('textarea');
      area.className = 'test-campo test-campo--largo';
      area.rows = 6;
      area.value = String(previa ?? '');
      area.setAttribute('aria-label', 'Tu respuesta');
      const contador = document.createElement('p');
      contador.className = 'test-contador';

      const contar = () => {
        const n = area.value.trim().split(/\s+/).filter(Boolean).length;
        contador.textContent = `${n} palabras · se piden entre ${p.minPalabras} y ${p.maxPalabras}`;
        contador.dataset.suficiente = String(n >= p.minPalabras);
      };
      area.addEventListener('input', () => {
        respuestas.set(p.id, area.value);
        contar();
        revisarSeguir();
      });
      contar();
      zona!.append(area, contador);
    }
  }

  /** Hay respuesta suficiente para dejar pasar. */
  function respondida(p: Pregunta): boolean {
    const r = respuestas.get(p.id);
    if (r === undefined) return false;
    if (p.tipo === 'ordenar') {
      return (fichasElegidas.get(p.id)?.length ?? 0) === p.palabras.length;
    }
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
              : p.subPreguntas.length;
      return r.filter((x) => String(x ?? '').trim()).length === esperadas;
    }
    return String(r).trim().length > 0;
  }

  function revisarSeguir() {
    seguir!.disabled = !respondida(PREGUNTAS[actual]);
  }

  function pintar(indice: number) {
    actual = indice;
    const p = PREGUNTAS[indice];
    pintarPregunta(p);

    const avance = ((indice + 1) / PREGUNTAS.length) * 100;
    barra!.style.setProperty('--avance', `${avance.toFixed(1)}%`);
    barra!.setAttribute('aria-valuenow', String(indice + 1));
    cuenta!.textContent = `${indice + 1} de ${PREGUNTAS.length}`;
    raiz!.dataset.bloque = p.bloque;

    atras!.disabled = indice === 0;
    seguir!.textContent = indice === PREGUNTAS.length - 1 ? 'Terminar' : 'Siguiente';
    revisarSeguir();
    zona!.focus({ preventScroll: true });
    // Cada pregunta empieza arriba: en movil una pregunta larga dejaria al
    // usuario mirando el final de la anterior.
    raiz!.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* --- Resultado --- */

  function calcular() {
    const marcadores = {} as Record<Bloque, Marcador>;
    BLOQUES.forEach((b) => (marcadores[b] = { obtenidos: 0, posibles: 0, porcentaje: 0 }));

    const paraRevisar: { id: string; bloque: Bloque; texto: string }[] = [];

    PREGUNTAS.forEach((p) => {
      const nota = puntuar(p, respuestas.get(p.id));
      if (nota === null) {
        // Fuera del denominador: si contara como cero, ningun bloque con
        // redaccion podria llegar nunca al 75 por ciento.
        paraRevisar.push({
          id: p.id,
          bloque: p.bloque,
          texto: String(respuestas.get(p.id) ?? ''),
        });
        return;
      }
      marcadores[p.bloque].obtenidos += nota;
      marcadores[p.bloque].posibles += p.puntos;
    });

    BLOQUES.forEach((b) => {
      const m = marcadores[b];
      m.porcentaje = m.posibles > 0 ? m.obtenidos / m.posibles : 0;
    });

    return { marcadores, nivel: calcularNivel(marcadores), paraRevisar };
  }

  function terminar() {
    const resultado = calcular();

    // Se guarda para que el envio lo recoja cuando exista. Todavia no hay a
    // donde mandarlo, y eso se dice tal cual en pantalla.
    const carga = {
      nivel: resultado.nivel,
      bloques: Object.fromEntries(
        BLOQUES.map((b) => [b, Math.round(resultado.marcadores[b].porcentaje * 100)]),
      ),
      redacciones: resultado.paraRevisar,
      respuestas: Object.fromEntries(respuestas),
      terminadoEn: new Date().toISOString(),
    };

    const oculto = cierre!.querySelector<HTMLInputElement>('[data-test-carga]');
    if (oculto) oculto.value = JSON.stringify(carga);

    raiz!.hidden = true;
    cierre!.hidden = false;
    cierre!.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    cierre!.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* --- Arranque y navegacion --- */

  empezar?.addEventListener('click', () => {
    intro!.hidden = true;
    raiz!.hidden = false;
    pintar(0);
  });

  atras.addEventListener('click', () => {
    if (actual > 0) pintar(actual - 1);
  });

  seguir.addEventListener('click', () => {
    if (!respondida(PREGUNTAS[actual])) return;
    if (actual === PREGUNTAS.length - 1) {
      terminar();
      return;
    }
    pintar(actual + 1);
  });

  // Enter avanza, salvo dentro de una redaccion, donde sirve para saltar de
  // linea.
  raiz.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter') return;
    const destino = evento.target as HTMLElement;
    if (destino.tagName === 'TEXTAREA' || destino.tagName === 'BUTTON') return;
    evento.preventDefault();
    if (!seguir.disabled) seguir.click();
  });
}
