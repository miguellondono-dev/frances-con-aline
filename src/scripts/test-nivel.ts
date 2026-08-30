/**
 * TEST DE NIVEL.
 *
 * El servidor pinta las 12 preguntas completas. Este script las convierte en
 * una por pantalla, con barra de progreso y resultado inmediato.
 *
 * Sin JavaScript la pagina sigue siendo util: se ven las 12 preguntas y el
 * aviso de que el resultado automatico necesita JS, mas el CTA a la clase
 * gratis, que es el objetivo real de la pagina.
 *
 * El resultado se muestra sin pedir el correo. El correo se pide despues, a
 * cambio del plan personalizado. Ese es el momento de captura, no antes.
 */

interface Nivel {
  titulo: string;
  explicacion: string;
}

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function initTest() {
  const form = document.querySelector<HTMLFormElement>('[data-test]');
  if (!form) return;

  const datos = document.querySelector<HTMLScriptElement>('#test-datos');
  if (!datos?.textContent) return;

  const { correctas, niveles } = JSON.parse(datos.textContent) as {
    correctas: { id: number; nivel: string; correcta: number }[];
    niveles: Record<string, Nivel>;
  };

  const pasos = Array.from(form.querySelectorAll<HTMLElement>('[data-paso]'));
  const total = pasos.length;
  if (!total) return;

  const barra = form.querySelector<HTMLElement>('[data-progreso-barra]');
  const contador = form.querySelector<HTMLElement>('[data-progreso-texto]');
  const anterior = form.querySelector<HTMLButtonElement>('[data-anterior]');
  const siguiente = form.querySelector<HTMLButtonElement>('[data-siguiente]');
  const nav = form.querySelector<HTMLElement>('[data-test-nav]');
  const sinJs = document.querySelector<HTMLElement>('[data-sin-js]');
  const resultado = document.querySelector<HTMLElement>('[data-resultado]');
  const anuncio = form.querySelector<HTMLElement>('[data-anuncio]');

  // A partir de aqui el test es interactivo: se revela la navegacion y se
  // esconde el aviso de "necesita JavaScript".
  form.dataset.modo = 'paso';
  if (nav) nav.hidden = false;
  if (sinJs) sinJs.hidden = true;

  let actual = 0;

  function pintar(nuevo: number, mover: 'adelante' | 'atras' | 'ninguno' = 'ninguno') {
    pasos.forEach((paso, i) => {
      paso.hidden = i !== nuevo;
      if (i === nuevo && mover !== 'ninguno' && !reduced.matches) {
        paso.dataset.entrada = mover;
        // Se reinicia la animacion en el frame siguiente.
        requestAnimationFrame(() => delete paso.dataset.entrada);
      }
    });

    actual = nuevo;

    if (barra) barra.style.transform = `scaleX(${(nuevo + 1) / total})`;
    if (contador) contador.textContent = `${nuevo + 1} de ${total}`;
    if (anterior) anterior.disabled = nuevo === 0;

    const esUltima = nuevo === total - 1;
    if (siguiente) {
      siguiente.textContent = esUltima ? 'Ver mi resultado' : 'Siguiente';
    }

    // Se anuncia el cambio de pregunta a los lectores de pantalla.
    if (anuncio) anuncio.textContent = `Pregunta ${nuevo + 1} de ${total}`;

    const primerInput = pasos[nuevo].querySelector<HTMLInputElement>('input[type="radio"]');
    primerInput?.focus({ preventScroll: true });
  }

  function calcular() {
    // Aciertos por nivel. El nivel estimado es el mas alto en el que se acierta
    // la mayoria de sus preguntas, sin saltarse ningun nivel intermedio.
    const porNivel = new Map<string, { aciertos: number; total: number }>();

    correctas.forEach((pregunta) => {
      const marcada = form.querySelector<HTMLInputElement>(
        `input[name="q${pregunta.id}"]:checked`,
      );
      const registro = porNivel.get(pregunta.nivel) ?? { aciertos: 0, total: 0 };
      registro.total += 1;
      if (marcada && Number(marcada.value) === pregunta.correcta) {
        registro.aciertos += 1;
      }
      porNivel.set(pregunta.nivel, registro);
    });

    const orden = ['A1', 'A2', 'B1', 'B2', 'C1'];
    let estimado = 'A1';

    for (const nivel of orden) {
      const registro = porNivel.get(nivel);
      if (!registro) continue;
      if (registro.aciertos * 2 >= registro.total) {
        estimado = nivel;
      } else {
        break; // No se saltan niveles: se para en el primero que falla.
      }
    }

    return estimado;
  }

  function mostrarResultado() {
    if (!resultado) return;
    const nivel = calcular();
    const info = niveles[nivel];

    const tituloEl = resultado.querySelector<HTMLElement>('[data-resultado-nivel]');
    const textoEl = resultado.querySelector<HTMLElement>('[data-resultado-texto]');
    const nivelOculto = resultado.querySelector<HTMLInputElement>('[data-resultado-input]');

    if (tituloEl) tituloEl.textContent = info?.titulo ?? nivel;
    if (textoEl) textoEl.textContent = info?.explicacion ?? '';
    if (nivelOculto) nivelOculto.value = nivel;

    form.hidden = true;
    resultado.hidden = false;
    resultado.querySelector<HTMLElement>('h2')?.focus();
  }

  siguiente?.addEventListener('click', () => {
    if (actual === total - 1) {
      mostrarResultado();
      return;
    }
    pintar(actual + 1, 'adelante');
  });

  anterior?.addEventListener('click', () => {
    if (actual === 0) return;
    pintar(actual - 1, 'atras');
  });

  // Elegir una opcion avanza sola: menos clics, mismo control (los botones
  // siguen ahi y funcionan con teclado).
  form.addEventListener('change', (event) => {
    const objetivo = event.target as HTMLInputElement;
    if (objetivo.type !== 'radio') return;
    if (actual === total - 1) return;
    window.setTimeout(() => pintar(actual + 1, 'adelante'), reduced.matches ? 0 : 260);
  });

  // Enter dentro del formulario no debe saltar al resultado a mitad del test:
  // el avance lo controlan los botones.
  form.addEventListener('submit', (event) => event.preventDefault());

  pintar(0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTest, { once: true });
} else {
  initTest();
}
