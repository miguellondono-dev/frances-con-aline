import type { APIRoute } from 'astro';
import {
  procesar,
  responder,
  esRobot,
  correoValido,
  limpiar,
  superaLimite,
  ipDe,
  origenValido,
} from '../../lib/notificar';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!origenValido(request)) {
    return responder({
      ok: false,
      estado: 403,
      mensaje: 'No pude verificar de dónde viene el envío. Recarga la página y vuelve a probar.',
    });
  }

  const datos = await request.formData();

  if (esRobot(datos)) {
    return responder({ ok: true, estado: 200, mensaje: 'Mensaje recibido.' });
  }

  if (superaLimite(ipDe(request))) {
    return responder({
      ok: false,
      estado: 429,
      mensaje: 'Has enviado varios mensajes seguidos. Espera un momento y vuelve a probar.',
    });
  }

  const nombre = limpiar(datos.get('nombre'), 120);
  const correo = limpiar(datos.get('correo'), 254);
  const mensaje = limpiar(datos.get('mensaje'), 5000);

  // Los errores se devuelven de uno en uno y nombrando el campo, para que el
  // cliente pueda marcarlo y mover el foco ahí.
  if (!nombre) {
    return responder({
      ok: false,
      estado: 400,
      mensaje: 'campo:nombre|Dime cómo te llamas.',
    });
  }

  if (!correoValido(correo)) {
    return responder({
      ok: false,
      estado: 400,
      mensaje: 'campo:correo|Ese correo no parece válido. Revísalo.',
    });
  }

  if (mensaje.length < 10) {
    return responder({
      ok: false,
      estado: 400,
      mensaje: 'campo:mensaje|Cuéntame un poco más para poder contestarte algo útil.',
    });
  }

  return responder(
    await procesar({
      tipo: 'Contacto',
      hoja: 'Contacto',
      fila: [nombre, correo, mensaje],
      resumen: `Nombre: ${nombre}\nCorreo: ${correo}\n\nMensaje:\n${mensaje}`,
      correoUsuario: correo,
      autorespuesta: {
        asunto: 'Recibí tu mensaje',
        texto: `Hola ${nombre}:

Recibí tu mensaje y te contesto yo, no un equipo. Suele ser en poco tiempo.

Si tu duda era sobre horarios o sobre si esto te sirve, quizá lo más rápido sea vernos media hora en línea, sin costo.

Aline
Francés con Aline`,
      },
    }),
  );
};

export const GET: APIRoute = () =>
  new Response('Este endpoint solo acepta envíos del formulario.', { status: 405 });
