# Anexo A — Wireframes ASCII

## HEADER (persistente en todo el sitio)
```
arriba del todo: transparente
+--------------------------------------------------------------------+
| (o) Francés con Aline   Clases  Quién soy  Precios  Diario*  [CTA] |
+--------------------------------------------------------------------+
a partir de 80px de scroll: backdrop-filter blur(16px) + --blanc al 80%,
transición 300ms.  * Diario oculto hasta que haya 3 entradas.
Móvil: botón de menú 44px, panel a pantalla completa, foco atrapado, Esc cierra.
```

## 1. HERO — fondo --blanc, min-h 100dvh
```
+--------------------------------------------------------------------+
|                                       .---------------------.      |
| CLASES DE FRANCÉS EN LÍNEA            |  ~~~~ párpado ~~~~  |      |
|                                       | (                 ) |      |
| No vas a aprender francés.            | (   APERTURA 1    ) |      |
| Vas a poder [voir|ver] Francia.       | ( retrato Aline   ) |      |
|            ^ rotador fr/es            |  ____ párpado ____  |      |
|                                       | [PENDIENTE foto real]      |
| Párrafo, 2 líneas, máx 60ch.          '---------------------'      |
|                                         sangra al borde derecho    |
| [ Agenda tu clase gratis de 30 min ]  <- único CTA de la vista     |
| Sin tarjeta. En línea. El horario lo eliges tú.                    |
+--------------------------------------------------------------------+
  cols 1-6                               cols 7-12 (sangrado a borde)
Móvil: texto arriba, apertura debajo a 4:5, CTA al final del bloque.
Carga: los párpados se separan con translateY, y el titular se revela por
líneas con clip-path sobre un wrapper (el texto no se mueve). Total < 1.2s.
```

## 2. BARRA DE CREDIBILIDAD — fondo --papier, 96px
```
+--------------------------------------------------------------------+
| Francesa (o) Gestión de la Cultura (o) Cinco idiomas (o) +5 años   |
+--------------------------------------------------------------------+
(o) = glifo de la apertura a 8px. Móvil: 2x2, sin scroll horizontal.
Sin iconos, sin banderas, sin adornos. Tipografía label.
```

## 3. LA TESIS — gradiente vertical --blanc -> --papier
```
+--------------------------------------------------------------------+
| .--------------.                                                   |
| |  APERTURA 2  |   Estudié Gestión de la Cultura.                  |
| |  Montmartre  |   Por eso mis clases no empiezan por la gramática.|
| | [PENDIENTE]  |                                                   |
| '--------------'   Párrafo 68ch. La cultura no es el adorno de     |
|  sangra izquierda  la clase, es el método.                         |
|  cols 1-5          cols 6-12                                       |
|                                                                    |
|        (´)  <- el acento é se dibuja con trazo SVG al entrar       |
|                                                                    |
| ---- vitrine . flâner . quotidien . ailleurs . vitrine -------->   |
|      marquee lento, único del sitio, pausa al hover                |
+--------------------------------------------------------------------+
```

## 4. LOS FORMATOS — fondo --blanc, retícula asimétrica
```
+--------------------------------------------------------------------+
| Cuatro formas de trabajar conmigo                                  |
| +------------------------+ +------------------+                    |
| | Clases privadas        | | Clases en grupo  |   7fr / 5fr        |
| | 35 € la hora           | | 20 € por persona |   alto 380px       |
| | ->                     | | ->               |                    |
| +------------------------+ +------------------+                    |
| +------------------+ +--------------------------+                  |
| | Preparación DELF | | Talleres y tours en París|   5fr / 7fr      |
| | ->               | | En construcción       -> |   alto 240px     |
| +------------------+ +--------------------------+                  |
+--------------------------------------------------------------------+
No es la fila de tres tarjetas iguales. Hover: escala 1.02 + revelado de
gradiente --papier -> --chair, 200ms ease-out. Toda la tarjeta es enlace,
foco visible en el borde. Móvil: una columna, alturas automáticas.
```

## 5. CÓMO ES UNA CLASE CONMIGO — fondo --papier
```
+---------------------------------------------------------------------+
| +---- sticky ----+ 1 Diagnóstico. Media hora para saber dónde estás |
| | Cómo es una    | ----------------------------------------------   |
| | clase conmigo  | 2 Plan según tu objetivo. Mudarte no es viajar.  |
| |                | ----------------------------------------------   |
| |      (o)       | 3 Material cultural real. No libro de texto.     |
| |  el iris baja  | ----------------------------------------------   |
| |  con el scroll | 4 Tarea. Poca, concreta, revisable.              |
| |                | ----------------------------------------------   |
| | [CTA discreto] | 5 Revisión conjunta. Se corrige contigo.         |
| +----------------+ ----------------------------------------------   |
|  cols 1-4          6 Ajuste de horario. Cambia y se reprograma.     |
|                    cols 6-12                                        |
+---------------------------------------------------------------------+
Los números sí van: es una secuencia real. Entrada escalonada 60ms.
Móvil: título arriba, lista debajo, sin sticky.
```

## 6. PARPADEO — transición de sección (los párpados barren una vez)

## 7. POR QUÉ CONMIGO — fondo --blanc, comparación honesta
```
+--------------------------------------------------------------------+
| Qué ganas y qué pierdes con cada opción                            |
| +------------+------------+------------#==============#            |
| | Plataforma | Institución| Aplicación # Conmigo       # --encre,  |
| | de tutores | con grupos | de idiomas #               # texto     |
| | rotativos  | de veinte  |            #               # --blanc   |
| +------------+------------+------------#---------------#           |
| | Ganas: ... | Ganas: ... | Ganas: ... # Ganas: ...    #           |
| +------------+------------+------------#---------------#           |
| | Pierdes:...| Pierdes:...| Pierdes:...# Pierdes: ...  # <- mío    |
| +------------+------------+------------#==============#   también  |
+--------------------------------------------------------------------+
Sin nombrar competidores. La columna propia TAMBIÉN dice qué se pierde:
ahí está la credibilidad. Móvil: cuatro bloques apilados, el mío al final.
```

## 8. APRENDAN JUNTOS — gradiente --papier -> --chair (cálida, no oscura)
```
+--------------------------------------------------------------------+
| Si se mudan juntos, aprendan juntos.      .--------------.         |
|                                           |  APERTURA 3  |         |
| 20 € por persona. Mínimo dos, máximo      | [PENDIENTE]  |         |
| cinco. Pareja, familia o dos amigos que   '--------------'         |
| se van a la misma ciudad.                  cols 8-12               |
|                                            (invertido respecto     |
| [ Agenda la clase gratis para los dos ]     a La tesis)            |
| cols 1-7                                                           |
+--------------------------------------------------------------------+
El CTA sobre --chair usa --lie por contraste. Es el bloque con más
potencial comercial de la página.
```

## 9. PRECIOS RESUMIDOS — fondo --encre (oscura 1 de 3)
```
+--------------------------------------------------------------------+
|  35 €            20 €                  0 €                         |
|  la hora         la hora por persona   la primera clase            |
|  clase privada   clase en grupo        30 minutos                  |
|  (Cabinet 500, tabular-nums, alineados a la misma línea base)      |
|                                                                    |
|  -> Ver todos los precios y bonos                                  |
+--------------------------------------------------------------------+
Sin contadores animados: no hay cifras reales que contar.
```

## 10. TEST DE NIVEL — fondo --blanc con panel --ciel
```
+--------------------------------------------------------------------+
| ¿No sabes por dónde empezar?    +-----------------------------+    |
|                                 | ###......   1 de 12         |    |
| Doce preguntas. Tres minutos.   | Elle ___ à Paris.           |    |
| Resultado inmediato, sin pedirte| ( ) habite  ( ) habites ... |    |
| el correo.                      +-----------------------------+    |
| [ Haz el test ]                   vista previa real, no maqueta    |
+--------------------------------------------------------------------+
```

## 11. TALLERES Y TOURS EN PARÍS — gradiente --nuit -> --encre (oscura 2 de 3)
```
+--------------------------------------------------------------------+
| Presenciales en París                                              |
| .--------------.  .--------------.                                 |
| |  APERTURA 4  |  |  APERTURA 5  |   Teatro y cocina. Tours.       |
| | [PENDIENTE]  |  | [PENDIENTE]  |   [PENDIENTE: precio y formato] |
| '--------------'  '--------------'                                 |
|                                                                    |
| Lista de espera                                                    |
| [ Tu correo ]  [ ¿Talleres / Tours / Los dos? ]  [ Avísame ]       |
| label sobre el campo, error en línea bajo el campo, honeypot oculto|
+--------------------------------------------------------------------+
```

## 12. PREGUNTAS FRECUENTES — fondo --blanc, mínimo 12
```
+--------------------------------------------------------------------+
| +--- sticky ---+  ¿Cuánto cuesta una clase de francés?          v  |
| | Preguntas    |  Respuesta seca en la primera frase, luego 30 a   |
| | frecuentes   |  50 palabras de contexto. Total 40 a 70.          |
| |              |  ------------------------------------------------ |
| | ¿Falta algo? |  ¿Necesito saber algo de francés para empezar? v  |
| | -> contacto  |  ------------------------------------------------ |
| +--------------+  ... doce o más en total                          |
+--------------------------------------------------------------------+
details/summary nativo: h3 dentro del summary, respuesta en el p inmediato,
siempre presente en el DOM (rastreable). Las tres primeras abiertas por
defecto. El JSON-LD FAQPage se genera del mismo archivo de datos.
```

## 13. CTA FINAL — fondo --encre (oscura 3 de 3), parpadeo al entrar
```
+--------------------------------------------------------------------+
|                                                                    |
|                Media hora. Gratis. Sin tarjeta.                    |
|                [ Agenda tu clase gratis ]                          |
|                El horario lo eliges tú.                            |
|                                                                    |
+--------------------------------------------------------------------+
Única sección centrada del sitio. Es el final, puede permitírselo.
```

## 14. FOOTER — fondo --encre
```
+--------------------------------------------------------------------+
| (o) Francés con Aline   Clases       Sobre          Legal          |
| Una frase en primera    Privadas     Quién soy      Privacidad     |
| persona, no un eslogan. En grupo     Cómo es clase  Términos       |
|                         DELF         Diario*        Contacto       |
|                         Talleres                                   |
|                         Tours                                      |
| ------------------------------------------------------------------ |
| Última actualización: [fecha automática]      Escrito por Aline    |
+--------------------------------------------------------------------+
```

## PLANTILLA DE LANDING DE SERVICIO
/clases-privadas, /clases-en-grupo, /preparacion-delf.
Misma estructura, copy propio, nunca reciclado.
```
+--------------------------------------------------------------------+
| 1 PROMESA        h1 + párrafo + CTA. Media apertura a la derecha.  |
|                  Composición espejada respecto al home.            |
+--------------------------------------------------------------------+
| 2 PARA QUIÉN SÍ / PARA QUIÉN NO   dos columnas, fondo --papier     |
|   +------------------+-------------------+                         |
|   | Es para ti si... | No es para ti si..|  <- obligatorio         |
|   +------------------+-------------------+                         |
+--------------------------------------------------------------------+
| 3 QUÉ INCLUYE    lista concreta, sin adjetivos                     |
+--------------------------------------------------------------------+
| 4 CÓMO FUNCIONA  tres pasos en horizontal. Única fila de tres del  |
|                  sitio, porque es una secuencia real.              |
+--------------------------------------------------------------------+
| 5 PRECIO Y BONOS fondo --encre, cifras Cabinet tabular             |
+--------------------------------------------------------------------+
| 6 FAQ            cinco a ocho propias de este servicio             |
+--------------------------------------------------------------------+
| 7 CTA            clase gratis                                      |
+--------------------------------------------------------------------+
```

## /test-de-nivel
```
+--------------------------------------------------------------------+
| #####.......  5 de 12         (barra --grenat sobre --pierre)      |
|                                                                    |
|   Pregunta en display-m, máx 2 líneas                              |
|                                                                    |
|   ( ) Opción A    <- radiogroup real: flechas y Enter funcionan    |
|   ( ) Opción B       área táctil 44px, foco visible                |
|   ( ) Opción C                                                     |
|   ( ) Opción D                                                     |
|                                                                    |
|   <- Anterior                                       Siguiente ->   |
+--------------------------------------------------------------------+
Transición entre preguntas: fade + translateX 16px, 180ms. El cambio se
anuncia con aria-live polite. Con reduced-motion solo cambia el texto.

RESULTADO (sin pedir el correo)
+--------------------------------------------------------------------+
|  Tu nivel estimado          B1                                     |
|  Dos frases de qué significa eso en la vida real, no en el MCER.   |
|  ----------------------------------------------------------------- |
|  ¿Quieres el plan de por dónde empezar y qué esperar en tres       |
|  meses?   [ Tu correo ]  [ Envíamelo ]   <- momento de captura     |
|  ----------------------------------------------------------------- |
|  [ Agenda tu clase gratis ]                                        |
+--------------------------------------------------------------------+
Las doce preguntas viven en src/content/test-nivel.json, marcadas PLACEHOLDER.
```

## /agenda
```
+--------------------------------------------------------------------+
| FILTRO PREVIO (tres pasos, antes del calendario)                   |
|  1 ¿Cuál es tu objetivo?  mudarme a Francia / ya vivo allá /       |
|                           pasar el DELF / viajar / interés personal|
|  2 ¿Qué nivel tienes?     ninguno / básico / intermedio /          |
|                           avanzado / no sé                         |
|  3 ¿Individual o en grupo?                                         |
|  ----------------------------------------------------------------- |
| CALENDARIO Cal.com embebido, no redirección                        |
|  [PENDIENTE: cuenta de Cal.com y disponibilidad configurada]       |
|  Las tres respuestas viajan como campos del evento.                |
|  Mientras no haya cuenta: bloque de aviso visible + TODO en código.|
+--------------------------------------------------------------------+
```

## /diario (se construye vacío)
```
ÍNDICE                            ENTRADA
+------------------------+        +--------------------------+
| Diario                 |        | h1 + fecha + etiquetas   |
| +--------------------+ |        | .----------------------. |
| | estado vacío       | |        | | video embebido 16:9  | |
| | Todavía no hay     | |        | '----------------------' |
| | entradas. Estoy    | |        | resumen                  |
| | grabando las       | |        | transcripción completa   |
| | primeras.          | |        | (SEO y accesibilidad)    |
| +--------------------+ |        +--------------------------+
+------------------------+
Content Collection con esquema: titulo, resumen, fecha, video, transcripcion,
etiquetas. RSS y sitemap listos. Enlace del menú oculto hasta tres entradas.
```

---

# Anexo B — Lienzo de propuesta de valor (comprobación del copy)

SEGMENTO 1 (prioritario): adulto de más de 30 que se muda a Francia, a menudo
en pareja o en familia.

## Perfil del cliente
- **Trabajos funcionales\***: resolver trámites en francés; entender al casero,
  al banco, al médico; dejar de depender de su pareja o de un traductor.
- **Trabajos sociales\***: no quedar como el extranjero que no se integra;
  sostener una conversación en una cena sin sonreír y callar.
- **Trabajos emocionales\***: llegar sintiendo que controla algo; dejar de
  posponer una decisión que ya tomó.
- **Frustraciones** (extremas marcadas \*): la fecha de mudanza es fija y el
  reloj corre\*; el profesor nativo no entiende POR QUÉ se equivoca\*; la
  aplicación no le enseña a hablar; en el grupo de veinte no le toca turno; ya
  lo intentó antes y lo dejó.
- **Alegrías** (esenciales marcadas \*): sentir que avanza cada semana\*; que
  alguien conozca su caso concreto\*; entender la vida real francesa y no el
  libro de texto; poder empezar hoy sin riesgo.

## Mapa de valor
- **Productos**: privada 35 €/h, grupo 20 €/h por persona, DELF, talleres,
  tours, clase gratis de 30 minutos.
- **Aliviadores -> frustración que atacan**
  - Aprendió español de adulta, viviendo en Latinoamérica -> "el nativo no
    entiende por qué me equivoco". Es EL aliviador diferencial del negocio.
  - Siempre la misma profesora, con diagnóstico y plan -> "tutor rotativo" y
    "ya lo intenté y lo dejé".
  - Plan según objetivo y fecha -> "el reloj corre".
  - Grupo de dos a cinco -> "no me toca turno de palabra", y además baja el precio.
- **Creadores de alegrías -> alegría que producen**
  - Tarea corregida contigo -> sensación semanal de avance.
  - Material cultural real, con un título de gestión cultural detrás ->
    entender la vida real francesa.
  - Clase gratis de 30 minutos sin tarjeta -> empezar hoy sin riesgo.

## Encaje
- **Bien atendido**: las dos frustraciones extremas y las dos alegrías esenciales.
- **Falta**: nada que se resuelva con producto. Falta PRUEBA, porque no hay
  testimonios. Por eso "Cómo es una clase conmigo" carga todo el peso de la
  credibilidad, y por eso "Por qué conmigo" dice también qué se pierde conmigo.
- **Sobra**: nada. Talleres y tours no atacan a este segmento; por eso van al
  final y en lista de espera, sin competir con el CTA.

## Consecuencia para el copy
- El mensaje principal del home ataca el trabajo emocional y social ("ver
  Francia"), no el funcional ("aprender francés"). El brief ya lo pedía así:
  el lienzo lo confirma, no lo cambia.
- El argumento 1 (francesa que habla tu idioma) va más arriba que los otros dos
  porque ataca la frustración extrema que ninguna alternativa del mercado
  atiende. Va en el hero, en /quien-soy y en "Por qué conmigo".
- Cada CTA nombra el trabajo del cliente, no la acción genérica.

## Advertencia honesta
Todo el perfil de arriba es hipótesis razonada a partir de la sección 3 del
brief. No hay dato real de cliente todavía. El filtro previo de /agenda es la
oportunidad de validarlo: conviene revisar qué contesta la gente en esas tres
preguntas antes de reescribir copy por intuición.
