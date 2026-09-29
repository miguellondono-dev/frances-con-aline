<?php
/**
 * EL UNICO ENDPOINT DE LOS FORMULARIOS.
 *
 * Los tres endpoints anteriores estaban en src/pages/_api/ y Astro no publica
 * las carpetas que empiezan por guion bajo, asi que los cinco formularios del
 * sitio devolvian 404. Esto es PHP porque es lo unico que Hostinger ejecuta en
 * un sitio estatico: no hay proceso de Node.
 *
 * Devuelve el mismo JSON que ya esperaba el guion del navegador, { ok, mensaje },
 * con el formato "campo:nombre|texto" para marcar un campo concreto. Por eso no
 * hubo que tocar forms.ts.
 *
 * Cada envio hace tres cosas: guarda una fila en un CSV, avisa a Aline y
 * contesta a quien escribe. Guarda primero a proposito: si el correo falla
 * algun dia, el dato no se pierde.
 */

header('Content-Type: application/json; charset=utf-8');

const CORREO_CONTACTO = 'contacto@francesconaline.com';

function responder(bool $ok, int $estado, string $mensaje): void
{
  http_response_code($estado);
  echo json_encode(['ok' => $ok, 'mensaje' => $mensaje], JSON_UNESCAPED_UNICODE);
  exit;
}

function fallo(): void
{
  responder(
    false,
    500,
    'No pude registrar tu mensaje. Escríbeme a ' . CORREO_CONTACTO
      . ' y lo resolvemos, que esto es un fallo mío y no tuyo.'
  );
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  responder(false, 405, 'Este endpoint solo acepta envíos del formulario.');
}

$cfg = @include __DIR__ . '/config.php';
if (!is_array($cfg)) {
  error_log('[formularios] Falta api/config.php');
  fallo();
}
require_once __DIR__ . '/smtp.php';

/* --- De donde viene el envio --- */

$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
$vale = in_array($origen, $cfg['origenes'], true)
  || preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origen) === 1;

if (!$vale) {
  responder(false, 403, 'No pude verificar de dónde viene el envío. Recarga la página y vuelve a probar.');
}

/* --- Campo trampa. Se responde con exito para no darle pistas al robot. --- */

if (trim($_POST['empresa'] ?? '') !== '') {
  responder(true, 200, 'Recibido.');
}

/* --- Limite por IP: cinco envios cada diez minutos --- */

$ip = $_SERVER['HTTP_CF_CONNECTING_IP']
  ?? $_SERVER['HTTP_X_FORWARDED_FOR']
  ?? $_SERVER['REMOTE_ADDR']
  ?? '0.0.0.0';
$ip = trim(explode(',', $ip)[0]);

$jaula = sys_get_temp_dir() . '/fca-' . md5($ip) . '.txt';
$ahora = time();
$marcas = [];
if (is_readable($jaula)) {
  foreach (explode(',', (string) file_get_contents($jaula)) as $t) {
    $t = (int) $t;
    if ($t > 0 && $ahora - $t < 600) $marcas[] = $t;
  }
}
if (count($marcas) >= 5) {
  responder(false, 429, 'Has enviado varios mensajes seguidos. Espera un momento y vuelve a probar.');
}
$marcas[] = $ahora;
@file_put_contents($jaula, implode(',', $marcas), LOCK_EX);

/* --- Los datos --- */

function limpiar(string $clave, int $maximo = 2000): string
{
  $v = (string) ($_POST[$clave] ?? '');
  $v = str_replace(["\r\n", "\r"], "\n", trim($v));
  // Fuera los caracteres de control: es por donde se inyectan cabeceras.
  $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v);
  return mb_substr((string) $v, 0, $maximo);
}

$tipo       = limpiar('tipo', 20) ?: 'contacto';
$correo     = limpiar('correo', 254);
$nombre     = limpiar('nombre', 120);
$apellido   = limpiar('apellido', 120);
$mensaje    = limpiar('mensaje', 5000);
$interes    = limpiar('interes', 60);
$nivel      = limpiar('nivel', 40);
$origenForm = limpiar('origen', 40);
$resultado  = limpiar('resultado', 20000);
// Permiso para escribirle consejos y novedades (RGPD): solo si marco la
// casilla. Se guarda con la fecha del envio, que es la prueba del permiso.
$novedades  = limpiar('novedades', 3) === 'si' ? 'si' : 'no';

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  responder(false, 400, 'campo:correo|Ese correo no parece válido. Revísalo.');
}

/* --- Que dice cada formulario --- */

$saludo = $nombre !== '' ? "Hola, $nombre:" : 'Hola:';
$firma  = "\n\nAline\nFrancés con Aline";

$guiones = [
  'contacto' => [
    'sujeto'          => 'Nuevo mensaje desde el formulario de contacto',
    'confirmacion'    => 'Mensaje recibido. Te contesto yo, y suele ser en poco tiempo.',
    'asuntoRespuesta' => 'Recibí tu mensaje',
    'respuesta'       => "$saludo\n\nRecibí tu mensaje y te contesto yo en persona, normalmente en poco tiempo.$firma",
  ],
  'taller-teatro' => [
    'sujeto'          => 'Nueva plaza en el taller de teatro',
    'confirmacion'    => 'Anotado. Te escribo con la dirección exacta y la forma de pago.',
    'asuntoRespuesta' => 'Te guardé una plaza en el taller de teatro',
    'respuesta'       => "$saludo\n\nTe guardé una plaza en el taller de teatro. Apunta las fechas:\n\nSábados 10, 17, 24 y 31 de octubre, de 11:00 a 12:30, en París. El taller completo cuesta 65 euros.\n\nTe escribo en los próximos días para confirmarte la dirección exacta y cómo se paga.\n\nSi al final no puedes venir, dímelo y libero la plaza para otra persona.$firma",
  ],
  'taller-acuarela' => [
    'sujeto'          => 'Nueva plaza en el taller de acuarela',
    'confirmacion'    => 'Anotado. Te escribo con la dirección exacta y la forma de pago.',
    'asuntoRespuesta' => 'Te guardé una plaza en el taller de acuarela',
    'respuesta'       => "$saludo\n\nTe guardé una plaza en el taller de acuarela. Es el domingo 18 de octubre, de 11:00 a 13:30, en París. Son 30 euros la sesión.\n\nTe escribo en los próximos días para confirmarte la dirección exacta, qué material hace falta traer y cómo se paga.\n\nSi al final no puedes venir, dímelo y libero la plaza para otra persona.$firma",
  ],
  'lista-espera' => [
    'sujeto'          => 'Nueva persona en la lista de espera',
    'confirmacion'    => 'Anotado. Te escribo en cuanto haya fecha y precio.',
    'asuntoRespuesta' => 'Te anoté en la lista de espera',
    'respuesta'       => "$saludo\n\nTe anoté en la lista de espera. Te escribo en cuanto haya fecha y precio, y no por ninguna otra razón.\n\nSi mientras tanto quieres empezar con el francés, la primera sesión dura media hora y no tiene costo.$firma",
  ],
  'test' => [
    'sujeto'          => 'Alguien terminó el test de nivel',
    'confirmacion'    => 'Hecho. Te mando tu resultado por correo.',
    'asuntoRespuesta' => 'Tu resultado del test de francés',
    'respuesta'       => "$saludo\n\nRecibí tu test. Leo tus tres textos escritos, confirmo el nivel y te mando el resultado con lo que ya sabes hacer y lo que te falta para el siguiente escalón.\n\nLo reviso yo, una redacción por una, así que tardo un poco, pero el resultado sirve para algo.$firma",
  ],
];

$guion = $guiones[$tipo] ?? $guiones['contacto'];

// El de contacto es el unico que exige nombre y mensaje.
if ($tipo === 'contacto') {
  if ($nombre === '') {
    responder(false, 400, 'campo:nombre|Dime cómo te llamas.');
  }
  if (mb_strlen($mensaje) < 10) {
    responder(false, 400, 'campo:mensaje|Cuéntame un poco más para poder contestarte algo útil.');
  }
}

/* --- Se guarda primero: el dato no se pierde aunque falle el correo --- */

$fecha = date('c');
$csv = __DIR__ . '/envios.csv';
$nuevo = !file_exists($csv);
$guardado = false;

if ($f = @fopen($csv, 'a')) {
  if (flock($f, LOCK_EX)) {
    if ($nuevo) {
      fputcsv($f, ['fecha', 'tipo', 'correo', 'nombre', 'apellido', 'interes', 'nivel', 'mensaje', 'novedades']);
    }
    fputcsv($f, [
      $fecha,
      $tipo,
      $correo,
      $nombre,
      $apellido,
      $interes !== '' ? $interes : $origenForm,
      $nivel,
      str_replace("\n", ' ', $mensaje),
      $novedades,
    ]);
    flock($f, LOCK_UN);
    $guardado = true;
  }
  fclose($f);
}

if (!$guardado) {
  error_log('[formularios] No pude escribir en envios.csv');
}

// El resultado del test es un JSON largo y no cabe en una columna legible:
// va en su propio archivo, con la fecha y el correo en el nombre.
if ($tipo === 'test' && $resultado !== '') {
  $carpeta = __DIR__ . '/tests';
  if (!is_dir($carpeta)) @mkdir($carpeta, 0755, true);
  @file_put_contents(
    $carpeta . '/' . date('Y-m-d-His') . '-' . preg_replace('/[^a-z0-9]+/i', '-', $correo) . '.json',
    $resultado
  );
}

/* --- Aviso a Aline y respuesta a quien escribe --- */

$resumen = "Tipo: $tipo\nCorreo: $correo\n"
  . ($nombre     !== '' ? "Nombre: $nombre $apellido\n" : '')
  . ($interes    !== '' ? "Interés: $interes\n" : '')
  . ($origenForm !== '' ? "Desde: $origenForm\n" : '')
  . ($nivel      !== '' ? "Nivel: $nivel\n" : '')
  . "Acepta novedades por correo: $novedades\n"
  . ($mensaje    !== '' ? "\n$mensaje\n" : '')
  . "\nRecibido: $fecha";

$avisado = smtp_enviar(
  $cfg['smtp'],
  $cfg['destino'],
  '[' . mb_strtoupper($tipo) . '] ' . $guion['sujeto'],
  $resumen,
  $correo
);

smtp_enviar($cfg['smtp'], $correo, $guion['asuntoRespuesta'], $guion['respuesta']);

// Si no llego a ningun sitio, se dice. Fingir que salio bien pierde al cliente.
if (!$guardado && !$avisado) {
  fallo();
}

responder(true, 200, $guion['confirmacion']);
