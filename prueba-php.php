<?php
// Archivo de prueba. Subelo a public_html y abre francesconaline.com/prueba-php.php
//
// Si ves un bloque JSON con la version de PHP, el alojamiento lo ejecuta y
// podemos hacer los formularios ahi mismo, sin pagar nada mas.
//
// Si ves este mismo texto tal cual, o se descarga un archivo, no lo ejecuta.
//
// Borralo despues: no tiene por que estar publicado.

header('Content-Type: application/json; charset=utf-8');

echo json_encode(
  [
    'php' => PHP_VERSION,
    'correo_disponible' => function_exists('mail'),
    'mysql_disponible' => extension_loaded('mysqli') || extension_loaded('pdo_mysql'),
    'curl_disponible' => extension_loaded('curl'),
    'escritura' => is_writable(__DIR__),
  ],
  JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);
