/**
 * Envio de formularios sin recarga.
 *
 * Todos los formularios funcionan tambien sin JavaScript: llevan `method="post"`
 * y `action` a su endpoint, asi que el navegador los envia igual. Este script
 * solo mejora la experiencia: evita la recarga y muestra el estado en linea.
 *
 * Los errores se muestran junto al campo y con texto, nunca solo con color.
 */

interface Respuesta {
  ok: boolean;
  mensaje: string;
}

/** El servidor puede devolver "campo:correo|texto" para marcar un campo. */
function partirMensaje(mensaje: string): { campo?: string; texto: string } {
  const coincide = /^campo:([a-z]+)\|(.*)$/s.exec(mensaje);
  if (!coincide) return { texto: mensaje };
  return { campo: coincide[1], texto: coincide[2] };
}

function limpiarErrores(form: HTMLFormElement) {
  form.querySelectorAll<HTMLElement>('[data-error-nombre], [data-error-correo], [data-error-mensaje]')
    .forEach((el) => (el.textContent = ''));
  form.querySelectorAll<HTMLInputElement>('input, textarea').forEach((campo) => {
    campo.removeAttribute('aria-invalid');
    campo.removeAttribute('aria-describedby');
  });
}

function marcarCampo(form: HTMLFormElement, nombre: string, texto: string) {
  const campo = form.querySelector<HTMLInputElement>(`[name="${nombre}"]`);
  const destino = form.querySelector<HTMLElement>(`[data-error-${nombre}]`);

  if (destino) {
    destino.textContent = texto;
    if (!destino.id) destino.id = `error-${nombre}-${Math.random().toString(36).slice(2, 7)}`;
    campo?.setAttribute('aria-describedby', destino.id);
  }

  campo?.setAttribute('aria-invalid', 'true');
  campo?.focus();
}

function conectar(selector: string, salidaSelector: string) {
  document.querySelectorAll<HTMLFormElement>(selector).forEach((form) => {
    const salida = form.querySelector<HTMLElement>(salidaSelector);
    const boton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const textoOriginal = boton?.textContent ?? '';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      limpiarErrores(form);

      if (salida) salida.textContent = '';
      if (boton) {
        boton.disabled = true;
        boton.textContent = 'Enviando...';
      }

      try {
        const respuesta = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        const datos = (await respuesta.json()) as Respuesta;
        const { campo, texto } = partirMensaje(datos.mensaje);

        if (!datos.ok && campo) {
          marcarCampo(form, campo, texto);
          return;
        }

        if (salida) salida.textContent = texto;

        if (datos.ok) {
          form.reset();
          // Se anuncia el resultado y se devuelve el foco al mensaje.
          salida?.setAttribute('tabindex', '-1');
          salida?.focus();
        }
      } catch {
        if (salida) {
          salida.textContent =
            'No pude enviarlo. Revisa tu conexión y vuelve a intentarlo, o escríbeme directamente.';
        }
      } finally {
        if (boton) {
          boton.disabled = false;
          boton.textContent = textoOriginal;
        }
      }
    });
  });
}

function boot() {
  conectar('[data-waitlist]', '[data-waitlist-message]');
  conectar('[data-contacto]', '[data-contacto-message]');
  conectar('[data-plan]', '[data-plan-message]');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
