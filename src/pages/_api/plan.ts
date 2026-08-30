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

const NIVELES = new Set(['A1', 'A2', 'B1', 'B2', 'C1']);

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
    return responder({ ok: true, estado: 200, mensaje: 'Hecho.' });
  }

  if (superaLimite(ipDe(request))) {
    return responder({
      ok: false,
      estado: 429,
      mensaje: 'Has enviado varios mensajes seguidos. Espera un momento y vuelve a probar.',
    });
  }

  const correo = limpiar(datos.get('correo'), 254);
  if (!correoValido(correo)) {
    return responder({
      ok: false,
      estado: 400,
      mensaje: 'Ese correo no parece válido. Revísalo y vuelve a enviarlo.',
    });
  }

  const nivelBruto = limpiar(datos.get('nivel'), 4).toUpperCase();
  const nivel = NIVELES.has(nivelBruto) ? nivelBruto : 'sin determinar';

  return responder(
    await procesar({
      tipo: 'Test',
      hoja: 'Test',
      fila: [correo, nivel],
      resumen: `Correo: ${correo}\nNivel estimado por el test: ${nivel}`,
      correoUsuario: correo,
      autorespuesta: {
        asunto: 'Tu plan de francés, en camino',
        texto: `Hola:

Recibí tu resultado del test. Te preparo el plan de por dónde empezar desde tu nivel y qué esperar en los próximos tres meses, y te lo mando por aquí. Lo escribo yo, no sale automático, así que tarda un poco.

El test mide lo que reconoces por escrito, que es la mitad del asunto: para afinarlo hace falta oírte hablar. La primera sesión dura media hora y no tiene costo.

Aline
Francés con Aline`,
      },
    }),
  );
};

export const GET: APIRoute = () =>
  new Response('Este endpoint solo acepta envíos del formulario.', { status: 405 });
