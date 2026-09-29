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
 * Correo publico. Es la salida cuando un formulario no puede enviar, asi que
 * tiene que estar visible en el sitio y no solo en el mensaje de error.
 */
export const CORREO_CONTACTO = 'contacto@francesconaline.com';

/**
 * WhatsApp directo (Miguel, septiembre de 2026). Es la via mas rapida para
 * quien ya esta decidido: un toque y escribe. El numero va sin "+" ni
 * espacios porque asi lo pide wa.me.
 */
export const WHATSAPP = {
  numero: '33757194967',
  visible: '+33 7 57 19 49 67',
};

/**
 * Mensaje ya escrito segun la pagina desde la que se abre WhatsApp. Asi quien
 * contesta sabe de que viene la persona sin preguntarlo, y a quien escribe le
 * cuesta menos empezar: solo tiene que pulsar enviar.
 */
const MENSAJES_WHATSAPP: Record<string, string> = {
  '/': 'Hola, vengo de la web de Francés con Aline y me gustaría empezar con el francés.',
  '/clases-privadas': 'Hola, vengo de la web de Francés con Aline y me interesan las clases privadas.',
  '/clases-en-grupo': 'Hola, vengo de la web de Francés con Aline y me interesan las clases en grupo.',
  '/preparacion-delf': 'Hola, vengo de la web de Francés con Aline y quiero preparar el DELF.',
  '/talleres': 'Hola, vengo de la web de Francés con Aline y me interesan los talleres en París.',
  '/talleres/teatro': 'Hola, vengo de la web de Francés con Aline y me interesa el taller de teatro.',
  '/talleres/acuarela': 'Hola, vengo de la web de Francés con Aline y me interesa el taller de acuarela.',
  '/tours-en-paris': 'Hola, vengo de la web de Francés con Aline y me interesan los tours por París.',
  '/test-de-nivel': 'Hola, vengo de la web de Francés con Aline y tengo una pregunta sobre el test de nivel.',
  '/agenda': 'Hola, vengo de la web de Francés con Aline y quiero agendar mi primera clase gratis.',
};

/** Enlace a WhatsApp con el mensaje de la pagina, o uno general. */
export function enlaceWhatsapp(ruta = '/', mensaje?: string): string {
  const limpia = ruta.length > 1 ? ruta.replace(/\/$/, '') : ruta;
  const texto =
    mensaje ??
    MENSAJES_WHATSAPP[limpia] ??
    'Hola, vengo de la web de Francés con Aline y tengo una pregunta.';
  return `https://wa.me/${WHATSAPP.numero}?text=${encodeURIComponent(texto)}`;
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
    { href: '/agenda', label: 'Agendar' },
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
 * Bonos: propuesta por defecto del brief.
 * TODO [PENDIENTE] Miguel confirma o ajusta estos numeros antes de publicar.
 */
export const BONOS = {
  confirmado: false,
  privada: [
    { clases: 4, precio: 132, vence: '3 meses' },
    { clases: 8, precio: 256, vence: '6 meses' },
    { clases: 12, precio: 360, vence: '6 meses' },
  ],
  grupo: [{ clases: 8, precio: 144, vence: '6 meses', nota: 'por persona' }],
};

export const CTA_AGENDA = {
  href: '/agenda',
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
