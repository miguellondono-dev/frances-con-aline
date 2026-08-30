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
  {
    label: 'Clases',
    hijos: [
      { href: '/clases-privadas', label: 'Clases privadas' },
      { href: '/clases-en-grupo', label: 'Clases en grupo' },
      { href: '/preparacion-delf', label: 'Preparación DELF' },
      { href: '/precios', label: 'Precios' },
      { href: '/quien-soy', label: 'Quién soy' },
    ],
  },
  {
    label: 'Talleres',
    hijos: [
      { href: '/talleres', label: 'Talleres en París' },
      { href: '/tours-en-paris', label: 'Tours en París' },
    ],
  },
  { label: 'Test', href: '/test-de-nivel' },
  { label: 'Contacto', href: '/contacto' },
];

export const NAV_FOOTER = {
  clases: [
    { href: '/clases-privadas', label: 'Clases privadas' },
    { href: '/clases-en-grupo', label: 'Clases en grupo' },
    { href: '/preparacion-delf', label: 'Preparación DELF' },
    { href: '/talleres', label: 'Talleres' },
    { href: '/tours-en-paris', label: 'Tours en París' },
  ],
  sobre: [
    { href: '/quien-soy', label: 'Quién soy' },
    { href: '/como-es-una-clase', label: 'Cómo es una clase' },
    { href: '/test-de-nivel', label: 'Test de nivel' },
  ],
  legal: [
    { href: '/precios', label: 'Precios' },
    { href: '/contacto', label: 'Contacto' },
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
  heroPrivadas: 'Prueba una clase conmigo',
  cierrePrivadas: 'Quiero empezar',
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
