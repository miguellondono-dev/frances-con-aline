import crypto from 'node:crypto';

/**
 * TUBERIA DE FORMULARIOS
 *
 * Cada envio dispara tres cosas:
 *  1. correo de notificacion a Miguel, con asunto que distingue el tipo;
 *  2. registro en Google Sheets mediante cuenta de servicio (esa es la base de
 *     datos del proyecto);
 *  3. autorespuesta al usuario, escrita en la voz de Aline.
 *
 * Proteccion anti spam: campo trampa (honeypot) mas limite de envios por IP.
 * Sin captcha visible: el captcha le cobra el peaje al usuario legitimo.
 *
 * Principio de diseno: un fallo en el registro o en la autorespuesta NO puede
 * hacer que el usuario pierda su envio. Lo unico que se considera critico es la
 * notificacion a Miguel, porque es lo que garantiza que alguien lo lea.
 */

function env(clave: string): string | undefined {
  const meta = (import.meta.env as Record<string, string | undefined>)[clave];
  if (meta) return meta;
  return typeof process !== 'undefined' ? process.env?.[clave] : undefined;
}

/* TODO [PENDIENTE] Variables de entorno que faltan por configurar:
   - RESEND_API_KEY          clave de Resend
   - CORREO_NOTIFICACIONES   correo de Miguel donde llegan los avisos
   - CORREO_REMITENTE        remitente verificado en Resend (depende del dominio)
   - GOOGLE_SERVICE_ACCOUNT_EMAIL
   - GOOGLE_PRIVATE_KEY      clave privada de la cuenta de servicio
   - GOOGLE_SHEET_ID         identificador de la hoja de calculo             */

export type TipoEnvio = 'Agenda' | 'Test' | 'Talleres' | 'Tours' | 'Contacto';

export interface Resultado {
  ok: boolean;
  /** Mensaje ya redactado para mostrar al usuario, en la voz del sitio. */
  mensaje: string;
  estado: number;
}

// ---------------------------------------------------------------------------
// Validacion
// ---------------------------------------------------------------------------

const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function correoValido(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.length <= 254 && CORREO_RE.test(valor);
}

/** El campo trampa lo rellenan los robots y nadie mas. */
export function esRobot(datos: FormData): boolean {
  const trampa = datos.get('empresa');
  return typeof trampa === 'string' && trampa.trim().length > 0;
}

/** Recorta y limita, para que un envio no pueda inflar la hoja ni el correo. */
export function limpiar(valor: FormDataEntryValue | null, maximo = 2000): string {
  if (typeof valor !== 'string') return '';
  return valor.trim().slice(0, maximo);
}

// ---------------------------------------------------------------------------
// Limite por IP
// ---------------------------------------------------------------------------

const VENTANA_MS = 10 * 60 * 1000;
const MAXIMO_POR_VENTANA = 5;
const registro = new Map<string, number[]>();

/**
 * Limite en memoria. En serverless cada instancia tiene la suya, asi que esto
 * frena el abuso torpe, no un ataque distribuido. Es deliberado: para lo otro
 * haria falta almacenamiento compartido, y de momento no lo justifica el trafico.
 */
export function superaLimite(ip: string): boolean {
  const ahora = Date.now();
  const previos = (registro.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  previos.push(ahora);
  registro.set(ip, previos);

  if (registro.size > 5000) registro.clear(); // techo de memoria

  return previos.length > MAXIMO_POR_VENTANA;
}

export function ipDe(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'desconocida'
  );
}

// ---------------------------------------------------------------------------
// Correo (Resend)
// ---------------------------------------------------------------------------

interface Correo {
  para: string;
  asunto: string;
  texto: string;
  responderA?: string;
}

async function enviarCorreo({ para, asunto, texto, responderA }: Correo) {
  const clave = env('RESEND_API_KEY');
  const remitente = env('CORREO_REMITENTE');

  if (!clave || !remitente) {
    // TODO [PENDIENTE] Sin clave de Resend no se puede enviar nada. Se registra
    // en el log del servidor para que el envio no desaparezca en silencio.
    console.warn('[correo] Falta RESEND_API_KEY o CORREO_REMITENTE. No se envió:', {
      para,
      asunto,
    });
    return false;
  }

  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clave}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: remitente,
      to: [para],
      subject: asunto,
      text: texto,
      ...(responderA ? { reply_to: responderA } : {}),
    }),
  });

  if (!respuesta.ok) {
    console.error('[correo] Resend respondió', respuesta.status, await respuesta.text());
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Google Sheets (cuenta de servicio)
// ---------------------------------------------------------------------------

function base64url(entrada: Buffer | string): string {
  return Buffer.from(entrada)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Firma un JWT RS256 y lo cambia por un token de acceso. */
async function tokenDeGoogle(): Promise<string | null> {
  const cuenta = env('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const clavePrivada = env('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
  if (!cuenta || !clavePrivada) return null;

  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const cuerpo = base64url(
    JSON.stringify({
      iss: cuenta,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: ahora,
      exp: ahora + 3600,
    }),
  );

  const firma = base64url(
    crypto.sign('RSA-SHA256', Buffer.from(`${cabecera}.${cuerpo}`), clavePrivada),
  );

  const respuesta = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${cabecera}.${cuerpo}.${firma}`,
    }),
  });

  if (!respuesta.ok) {
    console.error('[sheets] No se pudo obtener el token', await respuesta.text());
    return null;
  }

  const datos = (await respuesta.json()) as { access_token?: string };
  return datos.access_token ?? null;
}

/** Una hoja por tipo de formulario. El nombre de la hoja es la pestaña. */
async function guardarEnHoja(hoja: string, fila: (string | number)[]) {
  const sheetId = env('GOOGLE_SHEET_ID');
  if (!sheetId) {
    console.warn('[sheets] Falta GOOGLE_SHEET_ID. No se registró la fila:', hoja);
    return false;
  }

  const token = await tokenDeGoogle();
  if (!token) return false;

  const rango = encodeURIComponent(`${hoja}!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${rango}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [fila] }),
  });

  if (!respuesta.ok) {
    console.error('[sheets] Falló el registro', respuesta.status, await respuesta.text());
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Orquestacion
// ---------------------------------------------------------------------------

interface Envio {
  tipo: TipoEnvio;
  /** Pestaña de la hoja de calculo. */
  hoja: string;
  /** Fila que se anade, sin la fecha: se antepone aqui. */
  fila: (string | number)[];
  /** Cuerpo del correo de notificacion. */
  resumen: string;
  /** Correo del usuario, para la autorespuesta. */
  correoUsuario?: string;
  /** Autorespuesta ya redactada en la voz de Aline. */
  autorespuesta?: { asunto: string; texto: string };
}

export async function procesar(envio: Envio): Promise<Resultado> {
  const destino = env('CORREO_NOTIFICACIONES');
  const fecha = new Date().toISOString();

  // Se lanzan en paralelo: ninguna depende de la otra.
  const tareas: Promise<boolean>[] = [];

  if (destino) {
    tareas.push(
      enviarCorreo({
        para: destino,
        asunto: `[${envio.tipo}] ${SUJETO[envio.tipo]}`,
        texto: `${envio.resumen}\n\nRecibido: ${fecha}`,
        responderA: envio.correoUsuario,
      }),
    );
  } else {
    // TODO [PENDIENTE] Correo de notificaciones de Miguel.
    console.warn('[aviso] Falta CORREO_NOTIFICACIONES. Envío recibido:', envio.resumen);
  }

  tareas.push(guardarEnHoja(envio.hoja, [fecha, ...envio.fila]));

  if (envio.correoUsuario && envio.autorespuesta) {
    tareas.push(
      enviarCorreo({
        para: envio.correoUsuario,
        asunto: envio.autorespuesta.asunto,
        texto: envio.autorespuesta.texto,
      }),
    );
  }

  const resultados = await Promise.allSettled(tareas);
  const algoLlego = resultados.some((r) => r.status === 'fulfilled' && r.value === true);

  // Si no llegó nada a ningún sitio, el envío se habría perdido: hay que
  // decirlo y dar una salida real, no fingir que salió bien.
  if (!algoLlego) {
    return {
      ok: false,
      estado: 500,
      mensaje:
        'No pude registrar tu mensaje. Escríbeme directamente y lo resolvemos, que esto es un fallo mío y no tuyo.',
    };
  }

  return { ok: true, estado: 200, mensaje: CONFIRMACION[envio.tipo] };
}

const SUJETO: Record<TipoEnvio, string> = {
  Agenda: 'Nueva reserva de clase gratis',
  Test: 'Alguien pidió el plan tras el test de nivel',
  Talleres: 'Nueva persona en la lista de espera de talleres',
  Tours: 'Nueva persona en la lista de espera de tours',
  Contacto: 'Nuevo mensaje desde el formulario de contacto',
};

const CONFIRMACION: Record<TipoEnvio, string> = {
  Agenda: 'Reserva recibida. Te llega la confirmación por correo.',
  Test: 'Hecho. Te mando el plan por correo en los próximos días.',
  Talleres: 'Anotado. Te escribo en cuanto el taller tenga fecha y precio.',
  Tours: 'Anotado. Te escribo en cuanto abra fechas de tours.',
  Contacto: 'Mensaje recibido. Te contesto yo, y suele ser en poco tiempo.',
};

/** Respuesta JSON uniforme para todos los endpoints. */
export function responder(resultado: Resultado): Response {
  return new Response(JSON.stringify({ ok: resultado.ok, mensaje: resultado.mensaje }), {
    status: resultado.estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
