/**
 * Datos del sitio. Fuente unica: si un dato aparece dos veces en el codigo,
 * esta mal. Todo lo que no esta confirmado va marcado como PENDIENTE y se
 * renderiza visible, nunca relleno con una cifra plausible.
 */

export const SITE_NAME = 'Francés con Aline';

/** Descripcion corta, reutilizada en metadatos y en llms.txt. */
export const SITE_DESCRIPTION =
  'Clases de francés en línea para hispanohablantes, con Aline, profesora francesa. Primera sesión gratuita de 30 minutos.';

/**
 * Correo publico. La segunda via de contacto, detras de WhatsApp, para quien
 * no lo usa.
 */
export const CORREO_CONTACTO = 'contacto@francesconaline.com';

/**
 * WhatsApp directo. Desde septiembre de 2026 es LA via de contacto del sitio:
 * Miguel quito los formularios y todos los botones llevan aqui. El numero va
 * sin "+" ni espacios porque asi lo pide wa.me.
 */
export const WHATSAPP = {
  numero: '33759174967',
  visible: '+33 7 59 17 49 67',
};

/**
 * Mensaje ya escrito que lleva cada boton. El de por defecto es agendar la
 * primera sesion; un boton que dice otra cosa ("Hablemos", "Guardar mi
 * plaza") lleva el mensaje que corresponde a lo que dice. A quien escribe
 * solo le queda pulsar enviar, y quien contesta sabe de que viene.
 */
export const WA = {
  agendar: 'Hola, me gustaría agendar la primera sesión.',
  privadas: 'Hola, me gustaría agendar la primera sesión de clases privadas.',
  grupo: 'Hola, me gustaría probar una clase en grupo.',
  delf: 'Hola, me gustaría preparar el DELF y agendar la primera sesión.',
  pregunta: 'Hola, tengo una pregunta antes de empezar.',
  documentos: 'Hola, me gustaría ayuda con mis documentos (Campus France o CV en francés).',
  talleres: 'Hola, me gustaría saber más sobre los talleres en París.',
  reservarTaller: 'Hola, me gustaría reservar una plaza en un taller.',
  dudasTalleres: 'Hola, tengo una pregunta sobre los talleres.',
  teatro: 'Hola, me gustaría inscribirme en el taller de teatro.',
  acuarela: 'Hola, me gustaría inscribirme en el taller de acuarela.',
  /** El boton flotante de un taller sin fechas. Los botones de cada taller
      escriben el suyo con la fecha: talleres.ts, mensajeInscripcion(). */
  avisoTeatro: 'Hola, me gustaría que me avises cuando haya fechas para el taller de teatro.',
  tours: 'Hola, me gustaría saber más sobre los tours por París.',
} as const;

/** Enlace a WhatsApp con el mensaje escrito. Sin mensaje, el de agendar. */
export function whatsapp(mensaje: string = WA.agendar): string {
  return `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * El mensaje del boton flotante en cada pagina: el de la accion principal de
 * esa pagina. Donde no hay una concreta, el de agendar.
 */
const WA_POR_PAGINA: Record<string, string> = {
  '/clases-privadas': WA.privadas,
  '/clases-en-grupo': WA.grupo,
  '/preparacion-delf': WA.delf,
  '/sobre-mi': WA.pregunta,
  '/talleres': WA.talleres,
  '/talleres/teatro': WA.avisoTeatro,
  '/talleres/acuarela': WA.acuarela,
  '/tours-en-paris': WA.tours,
};

export function whatsappDePagina(ruta = '/'): string {
  const limpia = ruta.length > 1 ? ruta.replace(/\/$/, '') : ruta;
  return whatsapp(WA_POR_PAGINA[limpia] ?? WA.agendar);
}

/**
 * PENDIENTES del brief. Se dejan en null a proposito.
 * Cada consumidor tiene que saber renderizar el hueco marcado.
 */
export const PENDIENTE = {
  /** TODO [PENDIENTE] Correo de notificaciones de formularios (Miguel). */
  correoNotificaciones: null as string | null,
  /** TODO [PENDIENTE] Dominio definitivo. Tambien en astro.config.mjs. */
  dominio: null as string | null,
  /** TODO [PENDIENTE] Usuario y evento de Cal.com con disponibilidad ya cargada. */
  calcom: null as string | null,
  /** TODO [PENDIENTE] Niveles exactos de DELF que prepara Aline (A1 a B2, o hasta C). */
  nivelesDelf: null as string | null,
  /** TODO [PENDIENTE] Precio y formato definitivo de talleres. */
  precioTalleres: null as string | null,
  /** TODO [PENDIENTE] Precio y formato definitivo de tours. */
  precioTours: null as string | null,
} as const;

/**
 * Navegacion principal, agrupada en cuatro entradas.
 * /diario se mantiene oculto hasta que haya 3 entradas.
 *
 * Quien soy y Precios viven dentro de los desplegables para no pasar de
 * cuatro entradas visibles.
 */
export const NAV: {
  label: string;
  href?: string;
  hijos?: { href: string; label: string }[];
}[] = [
  { label: 'Sobre mí', href: '/sobre-mi' },
  {
    label: 'Clases',
    hijos: [
      { href: '/clases-privadas', label: 'Clases privadas' },
      { href: '/clases-en-grupo', label: 'Clases en grupo' },
      { href: '/preparacion-delf', label: 'Preparación DELF' },
    ],
  },
  {
    /**
     * Solo los dos padres. Teatro y acuarela son talleres, y colgados aqui al
     * mismo nivel que Talleres se leian como cuatro cosas distintas. Se llega
     * a ellos desde /talleres, que es donde viven.
     */
    label: 'Experiencias',
    hijos: [
      { href: '/talleres', label: 'Talleres' },
      { href: '/tours-en-paris', label: 'Tours' },
    ],
  },
  { label: 'Test', href: '/test-de-nivel' },
];

export const NAV_FOOTER = {
  clases: [
    { href: '/clases-privadas', label: 'Clases privadas' },
    { href: '/clases-en-grupo', label: 'Clases en grupo' },
    { href: '/preparacion-delf', label: 'Preparación DELF' },
  ],
  experiencias: [
    { href: '/talleres', label: 'Talleres' },
    { href: '/talleres/teatro', label: 'Teatro en francés' },
    { href: '/talleres/acuarela', label: 'Acuarela en francés' },
    { href: '/tours-en-paris', label: 'Tours' },
  ],
  sobre: [
    { href: '/sobre-mi', label: 'Sobre mí' },
    { href: '/test-de-nivel', label: 'Test de nivel' },
    { href: whatsapp(WA.agendar), label: 'Agendar' },
    { href: '/sobre-mi#hablemos', label: 'Hablemos' },
  ],
  legal: [
    { href: '/privacidad', label: 'Privacidad' },
    { href: '/terminos', label: 'Términos' },
  ],
};

/** Precios confirmados en el brief. En euros, sin conversion ni selector. */
export const PRECIOS = {
  privada: { valor: 35, unidad: 'la hora', detalle: 'Clase individual' },
  grupo: { valor: 20, unidad: 'la hora por persona', detalle: 'De dos a cinco personas' },
  gratis: { valor: 0, unidad: '30 minutos', detalle: 'La primera clase' },
};

/**
 * Bonos. Miguel los dio por definitivos el 29 de septiembre de 2026: ya no se
 * enseña el aviso de "pendiente de confirmar".
 */
export const BONOS = {
  confirmado: true,
  privada: [
    { clases: 4, precio: 132, vence: '3 meses' },
    { clases: 8, precio: 256, vence: '6 meses' },
    { clases: 12, precio: 360, vence: '6 meses' },
  ],
  grupo: [{ clases: 8, precio: 144, vence: '6 meses', nota: 'por persona' }],
};

/**
 * El boton de agendar de todo el sitio. Va directo a WhatsApp con el mensaje
 * por defecto. Cuando exista el calendario de Cal.com, basta con volver a
 * poner aqui '/agenda'.
 */
export const CTA_AGENDA = {
  href: whatsapp(WA.agendar),
  label: 'Agenda tu clase gratis',
  labelLargo: 'Agenda tu clase gratis de 30 minutos',
};

/**
 * Textos del CTA por contexto.
 *
 * Todos llevan al mismo sitio, pero repetir seis veces la misma frase hace que
 * el boton deje de leerse. Cada uno dice lo que hace desde el punto en el que
 * esta la persona cuando lo ve: no es lo mismo el primer golpe de vista que el
 * final de una pagina de precios.
 *
 * El del header no cambia nunca: es el ancla del sitio.
 */
export const CTA = {
  header: 'Empezar',
  heroHome: 'Agenda tu primera clase sin costo',
  cierreHome: 'Agendar conversación',
  heroPrivadas: 'Reserva tu clase gratis',
  cierrePrivadas: 'Reservar mi clase gratis',
  heroGrupo: 'Probar una clase en grupo',
  cierreGrupo: 'Quiero empezar',
  heroDelf: 'Evalúa tu nivel conmigo',
  cierreDelf: 'Quiero preparar mi DELF',
  cierreQuienSoy: 'Conozcámonos en una clase',
  cierrePrecios: 'Prueba antes de decidir',
  trasTest: 'Ahora, hablemos en francés',
  metodo: 'Descubre tu punto de partida',
  perdido: 'Volver a empezar',
} as const;
