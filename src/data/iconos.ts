/**
 * ICONOS DE PHOSPHOR (licencia MIT), en su version de dos tonos: el contorno y
 * una capa de relleno al 20 por ciento. Se importan como texto y se incrustan
 * en el HTML al compilar, asi que el navegador no descarga ningun codigo de
 * iconos.
 *
 * Sustituyen a los que dibuje a mano: Miguel los vio feos (septiembre de
 * 2026). Para añadir uno, se importa su svg desde @phosphor-icons/core/duotone
 * y se le da nombre aqui.
 */
import conversacion from '@phosphor-icons/core/duotone/chats-circle-duotone.svg?raw';
import nivel from '@phosphor-icons/core/duotone/stairs-duotone.svg?raw';
import objetivo from '@phosphor-icons/core/duotone/target-duotone.svg?raw';
import real from '@phosphor-icons/core/duotone/film-slate-duotone.svg?raw';
import entender from '@phosphor-icons/core/duotone/lightbulb-duotone.svg?raw';
import dinamico from '@phosphor-icons/core/duotone/lightning-duotone.svg?raw';
import check from '@phosphor-icons/core/duotone/check-circle-duotone.svg?raw';

const ICONOS = {
  conversacion,
  nivel,
  objetivo,
  real,
  entender,
  dinamico,
  check,
} as const;

export type NombreIcono = keyof typeof ICONOS;

/** El svg listo para incrustar: decorativo y con la clase que se pida. */
export function icono(nombre: NombreIcono, clase = ''): string {
  return ICONOS[nombre].replace(
    '<svg ',
    `<svg class="${clase}" aria-hidden="true" focusable="false" `,
  );
}
