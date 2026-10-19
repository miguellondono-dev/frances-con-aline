/**
 * CIERRE AUTOMATICO DE LOS TALLERES.
 *
 * Cada bloque que depende de que un taller tenga plazas lleva su fecha de
 * cierre en [data-taller-cierre]. Si esa fecha ya paso, se le pone
 * [data-taller-cerrado] y el CSS (global.css, .si-abierto / .si-cerrado)
 * cambia "Inscribirme" por "Avísame del próximo".
 *
 * Asi la web no sigue vendiendo un taller pasado aunque nadie la vuelva a
 * publicar. Al compilar ya sale cerrado si la fecha habia pasado; esto cubre
 * los dias entre una publicacion y la siguiente.
 */
function revisar() {
  const ahora = Date.now();
  document.querySelectorAll<HTMLElement>('[data-taller-cierre]').forEach((el) => {
    const cierre = Date.parse(el.dataset.tallerCierre ?? '');
    if (!Number.isNaN(cierre) && ahora > cierre) el.setAttribute('data-taller-cerrado', '');
  });
}

revisar();
