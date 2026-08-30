import type { APIRoute } from 'astro';
import {
  procesar,
  responder,
  esRobot,
  correoValido,
  limpiar,
  superaLimite,
  ipDe,
  type TipoEnvio,
} from '../../lib/notificar';

export const prerender = false;

const ORIGENES: Record<string, { tipo: TipoEnvio; hoja: string }> = {
  talleres: { tipo: 'Talleres', hoja: 'Talleres' },
  tours: { tipo: 'Tours', hoja: 'Tours' },
  ambos: { tipo: 'Talleres', hoja: 'Talleres' },
};

export const POST: APIRoute = async ({ request }) => {
  if (!origenValido(request)) {
    return responder({
      ok: false,
      estado: 403,
      mensaje: 'No pude verificar de dónde viene el envío. Recarga la página y vuelve a probar.',
    });
  }

  const datos = await request.formData();

  // Campo trampa: se responde con éxito para no darle pistas al robot.
  if (esRobot(datos)) {
    return responder({ ok: true, estado: 200, mensaje: 'Anotado.' });
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

  const origen = limpiar(datos.get('origen'), 20) || 'ambos';
  const interes = limpiar(datos.get('interes'), 20) || origen;
  const config = ORIGENES[origen] ?? ORIGENES.ambos;

  return responder(
    await procesar({
      tipo: config.tipo,
      hoja: config.hoja,
      fila: [correo, interes, origen],
      resumen: `Correo: ${correo}\nInterés: ${interes}\nDesde: ${origen}`,
      correoUsuario: correo,
      autorespuesta: {
        asunto: 'Te anoté en la lista de espera',
        texto: `Hola:

Te anoté en la lista de espera. Te escribo en cuanto haya fecha y precio, y no por ninguna otra razón.

Si mientras tanto quieres empezar con el francés, la primera sesión dura media hora y no tiene costo.

Aline
Francés con Aline`,
      },
    }),
  );
};

/** Un GET a este endpoint no tiene sentido: se responde con claridad. */
export const GET: APIRoute = () =>
  new Response('Este endpoint solo acepta envíos del formulario.', { status: 405 });
