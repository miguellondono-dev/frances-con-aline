<?php
/**
 * ENVIO DE CORREO POR SMTP, SIN LIBRERIAS.
 *
 * No se usa mail() de PHP a proposito: en alojamiento compartido sale desde
 * una IP que comparten cientos de sitios y acaba en spam. Hablando SMTP con
 * la cuenta del propio dominio, el correo sale autenticado y llega.
 *
 * Son unas cien lineas y no hay que instalar nada, que en Hostinger compartido
 * es media hora de pelea con Composer que no hace falta pasar.
 */

function smtp_enviar(array $cfg, string $para, string $asunto, string $texto, ?string $responderA = null): bool
{
  $protocolo = $cfg['seguridad'] === 'ssl' ? 'ssl://' : '';
  $socket = @stream_socket_client(
    $protocolo . $cfg['servidor'] . ':' . $cfg['puerto'],
    $errno, $errstr, 12, STREAM_CLIENT_CONNECT
  );
  if (!$socket) {
    error_log("[formularios] No se pudo conectar al SMTP: $errstr ($errno)");
    return false;
  }
  stream_set_timeout($socket, 12);

  // Lee la respuesta del servidor y comprueba que empieza por el codigo dado.
  $leer = function () use ($socket): string {
    $todo = '';
    while (($linea = fgets($socket, 515)) !== false) {
      $todo .= $linea;
      // La ultima linea de una respuesta lleva un espacio tras el codigo.
      if (isset($linea[3]) && $linea[3] === ' ') break;
    }
    return $todo;
  };
  $decir = function (string $orden, string $espera) use ($socket, $leer): bool {
    if ($orden !== '') fwrite($socket, $orden . "\r\n");
    $r = $leer();
    if (strpos($r, $espera) !== 0) {
      error_log('[formularios] SMTP respondio: ' . trim($r) . ' tras: ' . explode(' ', $orden)[0]);
      return false;
    }
    return true;
  };

  $bien = $decir('', '220')
    && $decir('EHLO ' . $cfg['servidor'], '250');

  if ($bien && $cfg['seguridad'] === 'tls') {
    $bien = $decir('STARTTLS', '220')
      && stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)
      && $decir('EHLO ' . $cfg['servidor'], '250');
  }

  $bien = $bien
    && $decir('AUTH LOGIN', '334')
    && $decir(base64_encode($cfg['usuario']), '334')
    && $decir(base64_encode($cfg['contrasena']), '235')
    && $decir('MAIL FROM:<' . $cfg['remitente'] . '>', '250')
    && $decir('RCPT TO:<' . $para . '>', '250')
    && $decir('DATA', '354');

  if (!$bien) { fclose($socket); return false; }

  $de = '=?UTF-8?B?' . base64_encode($cfg['nombre']) . '?= <' . $cfg['remitente'] . '>';
  $cabeceras = [
    'From: ' . $de,
    'To: <' . $para . '>',
    'Subject: =?UTF-8?B?' . base64_encode($asunto) . '?=',
    'Date: ' . date('r'),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ];
  if ($responderA) $cabeceras[] = 'Reply-To: <' . $responderA . '>';

  $cuerpo = chunk_split(base64_encode($texto));
  fwrite($socket, implode("\r\n", $cabeceras) . "\r\n\r\n" . $cuerpo . "\r\n.\r\n");

  $bien = $decir('', '250');
  $decir('QUIT', '221');
  fclose($socket);
  return $bien;
}
