<?php
/**
 * CONFIGURACION DE LOS FORMULARIOS.
 *
 * Copia este archivo como config.php en la misma carpeta y rellena los
 * valores. config.php NO esta en el repositorio y no debe estarlo nunca:
 * lleva la contraseña del correo.
 *
 * En Hostinger: Archivos > Administrador de archivos > public_html/api/
 */

return [
  // A donde llegan los avisos de cada formulario.
  'destino' => 'tu-correo@ejemplo.com',

  // La cuenta desde la que salen los correos. Tiene que ser una del dominio,
  // o el correo acaba en spam. La de Hostinger vale.
  'smtp' => [
    'servidor'   => 'smtp.hostinger.com',
    'puerto'     => 465,
    'seguridad'  => 'ssl',            // ssl en el 465, tls en el 587
    'usuario'    => 'contacto@francesconaline.com',
    'contrasena' => 'AQUI_LA_CONTRASENA',
    'remitente'  => 'contacto@francesconaline.com',
    'nombre'     => 'Francés con Aline',
  ],

  // Dominios desde los que se acepta un envio. Cualquier otro se rechaza.
  'origenes' => [
    'https://francesconaline.com',
    'https://www.francesconaline.com',
  ],
];
