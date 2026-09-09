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

/**
 * Cada origen trae su propia autorespuesta. El taller de teatro ya tiene fecha
 * y precio, asi que soltarle un "te aviso cuando haya fecha" a quien acaba de
 * inscribirse seria mentirle en el primer correo que recibe.
 */
type Origen = {
  tipo: TipoEnvio;
  hoja: string;
  asunto: string;
  texto: (nombre: string) => string;
};

const saludo = (nombre: string) => (nombre ? `Hola, ${nombre}:` : 'Hola:');

const ESPERA = (nombre: string) => `${saludo(nombre)}

Te anoté en la lista de espera. Te escribo en cuanto haya fecha y precio, y no por ninguna otra razón.

Si mientras tanto quieres empezar con el francés, la primera sesión dura media hora y no tiene costo.

Aline
Francés con Aline`;

const ORIGENES: Record<string, Origen> = {
  talleres: {
    tipo: 'Talleres',
    hoja: 'Talleres',
    asunto: 'Te anoté en la lista de espera',
    texto: ESPERA,
  },
  tours: {
    tipo: 'Tours',
    hoja: 'Tours',
    asunto: 'Te anoté en la lista de espera',
    texto: ESPERA,
  },
  ambos: {
    tipo: 'Talleres',
    hoja: 'Talleres',
    asunto: 'Te anoté en la lista de espera',
    texto: ESPERA,
  },
  'taller-teatro': {
    tipo: 'Talleres',
    hoja: 'Taller de teatro',
    asunto: 'Te guardé una plaza en el taller de teatro',
    texto: (nombre) => `${saludo(nombre)}

Te guardé una plaza en el taller de teatro. Apunta las fechas:

Sábados 10, 17, 24 y 31 de octubre, de 11:00 a 12:30, en París.

Te escribo en los próximos días para confirmarte la dirección exacta y cómo se paga. Son 65 euros las cuatro sesiones.

Si al final no puedes venir, dímelo y libero la plaza para otra persona.

Aline
Francés con Aline`,
  },
  'taller-acuarela': {
    tipo: 'Talleres',
    hoja: 'Taller de acuarela',
    asunto: 'Te guardé una plaza en el taller de acuarela',
    texto: (nombre) => `${saludo(nombre)}

Te guardé una plaza en el taller de acuarela. Es el domingo 18 de octubre, de 11:00 a 13:30, en París.

Te escribo en los próximos días para confirmarte la dirección exacta, qué material hace falta traer y cómo se paga. Son 30 euros la sesión.

Si al final no puedes venir, dímelo y libero la plaza para otra persona.

Aline
Francés con Aline`,
  },
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
  const nombre = limpiar(datos.get('nombre'), 120);
  const interes = limpiar(datos.get('interes'), 20) || origen;
  const config = ORIGENES[origen] ?? ORIGENES.ambos;

  return responder(
    await procesar({
      tipo: config.tipo,
      hoja: config.hoja,
      fila: [correo, nombre, interes, origen],
      resumen: `Correo: ${correo}\nNombre: ${nombre || 'sin dar'}\nInterés: ${interes}\nDesde: ${origen}`,
      correoUsuario: correo,
      autorespuesta: {
        asunto: config.asunto,
        texto: config.texto(nombre),
      },
    }),
  );
};

/** Un GET a este endpoint no tiene sentido: se responde con claridad. */
export const GET: APIRoute = () =>
  new Response('Este endpoint solo acepta envíos del formulario.', { status: 405 });
