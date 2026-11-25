# Especificación técnica del abecedario LSV

Fuente de verdad del código: [`shared/lsv/engine/alphabet-spec.js`](../shared/lsv/engine/alphabet-spec.js).
Evidencia y discrepancias: [LSV_ALPHABET_RESEARCH.md](LSV_ALPHABET_RESEARCH.md). Si cambias una
restricción, actualiza esta tabla y las pruebas de `Backend/tests/lsv-engine.test.js`.

## Convenciones

- Descripciones desde el punto de vista de quien observa a una persona **diestra** (como en las fichas).
  Para la mano izquierda, todo lo lateral se refleja; arriba/abajo y palma/dorso no cambian.
- «Cerrado»: dedo flexionado hacia la palma (curvatura acumulada MCP+PIP+DIP > ~135°). «Extendido»:
  < ~55° y recto. «Curvado»: flexión parcial sin cerrar (C, O). «Gancho»: falange proximal elevada y
  punta doblada (X). «Colgando»: dedo recto doblado en el nudillo sobre el pulgar (M, N). Los grados
  son anatómicos y **no están calibrados** con participantes ([thresholds.js](../shared/lsv/engine/thresholds.js)).
- Fuentes: **M** = ficha del curso (manual Fuentes 2022), **O** = Oviedo 2000, **U** = Martínez UPEL 2018.
- Estados de evidencia: `DOCUMENTED`, `TEXT_AND_REFERENCE`, `SOURCE_CONFLICT`, `VARIANT_PENDING`,
  `MOTION_FROM_REFERENCE`, `REFERENCE_ONLY`, `BLOCKED` (definidos en `alphabet-spec.js`).
- La columna «Errores previsibles» se deriva de la diferencia con las letras parecidas. **No son
  errores observados en estudiantes**: no existen datos de uso todavía.

## Matriz de configuración

| Letra | Dedos (índice, medio, anular, meñique) | Pulgar | Separación / cruce | Palma y dirección | Movimiento |
| --- | --- | --- | --- | --- | --- |
| A | Cerrados | Extendido junto al lado del índice, hacia arriba | — | Palma al frente; mano hacia arriba | Estática |
| B | Extendidos | Doblado sobre la palma | Dedos juntos | Palma al frente; dedos arriba | Estática |
| C | Curvados | Curvado enfrente, sin tocar | Dedos juntos | De canto; abertura hacia el lado | Estática |
| D | Índice extendido; resto curvados | Toca la punta del medio (círculo) | — | Palma al frente; índice arriba | Estática |
| E | Flexionados, puntas hacia el pulgar | Cruzado bajo las puntas | — | Palma al frente | Estática |
| F | Índice curvado; medio, anular y meñique extendidos | Toca la punta del índice (círculo) | Extendidos levemente separados | Palma al frente; dedos arriba | Estática |
| G | Índice extendido; resto cerrados | Recogido | — | Índice horizontal, hacia un lado | Estática |
| H | Índice y medio extendidos; resto cerrados | Recogido | Índice y medio juntos | Dedos horizontales, hacia un lado | Estática |
| I | Meñique extendido; resto cerrados | Cerrado sobre los dedos | — | Palma al frente; meñique arriba | Estática (detención, O p. 57) |
| J | Como I | Como I | — | De base neutra a supina | Giro de muñeca (O pp. 57–58) |
| K | Índice y medio extendidos; resto cerrados | Punta apoyada en el medio, entre ambos | Índice y medio separados | Dedos arriba | Estática |
| L | Índice extendido; resto cerrados | Extendido hacia el lado (L) | — | Índice arriba | Estática |
| M | Índice, medio y anular colgando sobre el pulgar; meñique cerrado | Bajo los tres dedos | — | Dedos hacia abajo sobre el pulgar | Estática |
| N | Índice y medio colgando; anular y meñique cerrados | Bajo los dos dedos | — | Dedos hacia abajo sobre el pulgar | Estática |
| Ñ | Como N | Como N | — | Como N | Oscilación lateral (flecha doble de M) |
| O | Curvados, puntas en contacto con el pulgar | Toca índice y medio | — | De canto | Estática |
| P | Índice, medio y anular extendidos; meñique cerrado | Recogido | Juntos | Dedos horizontales | Estática (variante de la ficha) |
| Q | Ficha: mano hacia abajo, índice y pulgar curvados | — | — | — | Sin rasgos verificables |
| R | Índice y medio extendidos y cruzados; resto cerrados | Sobre anular y meñique | Medio cruzado sobre el índice | Dedos arriba | Estática |
| S | Cerrados (puño) | Cruzado por delante de los dedos | — | Palma al frente | Estática |
| T | Ficha: puño con pulgar elevado junto al índice | — | — | — | Sin rasgos verificables |
| U | Índice y medio extendidos; resto cerrados | Sobre anular y meñique | Juntos, sin cruzar | Dedos arriba | Estática |
| V | Índice y medio extendidos; resto cerrados | Sobre anular y meñique | Separados, sin cruzar | Dedos arriba | Estática |
| W | Índice, medio y anular extendidos; meñique cerrado | Sobre el meñique | Separados | Dedos arriba | Estática |
| X | Índice en gancho; resto cerrados | Recogido | — | Mano arriba | Estática |
| Y | Meñique extendido; resto cerrados | Extendido hacia el lado | — | Palma al frente | Estática |
| Z | Índice extendido; resto cerrados | Recogido | — | Índice arriba | Trazo en Z descendente (flechas de M) |

## Evidencia, letras parecidas y estado del motor

| Letra | Fuentes | Estado | Parecidas | Errores previsibles | Comprobación del motor |
| --- | --- | --- | --- | --- | --- |
| A | M, O | `SOURCE_CONFLICT` | S, E, T | Pulgar cruzado (→ S) | Estática |
| B | M | `DOCUMENTED` | U, W, P | Dedos separados; pulgar extendido | Estática |
| C | M | `DOCUMENTED` | O, E | Cerrar el círculo (→ O) | Estática |
| D | M | `DOCUMENTED` | O, F, L, X | Pulgar sin tocar el medio | Estática |
| E | M | `DOCUMENTED` | A, S, O, M, N | Cerrar del todo el puño (→ S) | Estática; **E/S de baja separabilidad** |
| F | M | `DOCUMENTED` | D, O, W | Índice sin tocar el pulgar | Estática |
| G | M | `DOCUMENTED` | D, L, H, Z | Índice vertical (→ D/L) | Estática |
| H | M | `DOCUMENTED` | U, G, P, N | Dedos verticales (→ U) | Estática |
| I | M, O | `TEXT_AND_REFERENCE` | J, Y | Pulgar extendido (→ Y) | Estática |
| J | M, O | `TEXT_AND_REFERENCE` | I, Y | Hacer solo la I, sin girar | Temporal (rotación ≥ 45°, completada) |
| K | M | `DOCUMENTED` | V, R, U, P | Pulgar fuera del medio (→ V) | Estática |
| L | M | `DOCUMENTED` | G, D, Y | Pulgar recogido | Estática |
| M | M | `DOCUMENTED` | N, E, S | Solo dos dedos colgando (→ N) | Estática, **baja confianza** (z comprimida) |
| N | M | `DOCUMENTED` | M, Ñ, U | Tres dedos colgando (→ M) | Estática, **baja confianza** |
| Ñ | M, U | `MOTION_FROM_REFERENCE` | N, M | Hacer solo la N | Temporal (≥ 2 inversiones laterales) |
| O | M | `DOCUMENTED` | C, E, D, F | Dejar abierto (→ C) | Estática |
| P | M, U | `VARIANT_PENDING` | H, W, B | Dedos verticales (→ W) | Estática (solo variante de la ficha) |
| Q | M | `REFERENCE_ONLY` | G, X | — | Ninguna: solo referencia |
| R | M | `DOCUMENTED` | U, V, K | No cruzar (→ U) | Estática |
| S | M, O | `SOURCE_CONFLICT` | A, E, T | Pulgar junto al índice (→ A) | Estática; **E/S de baja separabilidad** |
| T | M | `REFERENCE_ONLY` | A, S | — | Ninguna: solo referencia |
| U | M | `DOCUMENTED` | V, H, R, N, K | Separar (→ V); horizontal (→ H) | Estática |
| V | M | `DOCUMENTED` | U, K, W, R | Juntar (→ U); pulgar en el medio (→ K) | Estática |
| W | M | `DOCUMENTED` | V, F, B, P | Juntar o bajar el anular | Estática |
| X | M | `DOCUMENTED` | D, G, Z | Extender del todo el índice | Estática |
| Y | M | `DOCUMENTED` | I, L | Pulgar recogido (→ I) | Estática |
| Z | M | `MOTION_FROM_REFERENCE` | D, G, X | Trazo recto o sin descender | Temporal (≥ 2 inversiones, recorrido ≥ 1,2 palmas, descenso) |

**Mano izquierda frente a derecha.** En todas las letras la diferencia es la reflexión lateral: la
izquierda se lleva al sistema de la derecha (`canonicalHand`) y se aplica la misma especificación. Para
G, H y P, «hacia un lado» se evalúa sin signo lateral; para Z y Ñ, el eje horizontal también se
refleja, de modo que «hacia el lado del pulgar» signifique lo mismo con ambas manos.

## Restricciones por letra (resumen del código)

Cada restricción produce un grado entre 0 y 1. Una letra es **compatible** si todas sus restricciones
críticas alcanzan 0,5 y la media ponderada alcanza 0,65 (`DECISION` en `handshape.js`). Cada restricción
lleva su corrección educativa, por ejemplo `index.extended` → «Extiende el dedo índice.».

Ejemplo (V):

| Restricción | Crítica | Corrección |
| --- | --- | --- |
| `index.extended`, `middle.extended` | Sí | Extiende el dedo índice / medio |
| `index-middle.spread` | Sí | Separa los dedos índice y medio |
| `index-middle.notCrossed` | Sí | Descruza los dedos índice y medio |
| `ring.closed`, `pinky.closed` | Sí | Dobla el anular / meñique hacia la palma |
| `thumb.notOnMiddle` | No | Lleva el pulgar sobre el anular y el meñique doblados |
| `hand.up` | Sí | Orienta la mano con los dedos hacia arriba |

## Letras bloqueadas y digrafos

| Letra | Motivo | Para desbloquear |
| --- | --- | --- |
| Q, T | La ficha no fija rasgos verificables | Descripción de personas competentes o grabaciones revisadas que muestren contacto y orientación |
| Segunda P | Documentada pero no descrita | Descripción o ficha de la variante |
| CH | Sin evidencia en fuentes LSV consultadas | Fuente venezolana que confirme su uso y ejecución |
| LL | Existe (Martínez 2018), sin descripción de su ejecución | Descripción de su configuración y movimiento |
| RR | Solo imágenes de terceros sin licencia | Fuente verificable y con permiso |

## Cómo incorporar una nueva seña

1. Documenta la fuente (autor, página, licencia) en `LSV_ALPHABET_RESEARCH.md` y en
   `lsv-alphabet-sources.json`.
2. Añade la entrada en `alphabet-spec.js` con `status`, `sources`, `similar` y restricciones
   construidas con los ayudantes existentes (`extended`, `closed`, `touches`…). No escribas umbrales
   dentro de la especificación: si hace falta un rasgo nuevo, añádelo en `features.js` y
   `descriptors.js` con su umbral en `thresholds.js`.
3. Añade la postura sintética en `Backend/tests/fixtures/synthetic-hand.js` y comprueba con
   `node --test Backend/tests/lsv-engine.test.js` que se reconoce con ambas manos y que no aprueba a
   sus letras parecidas.
4. Para movimiento, define `from` (postura inicial) y `motion` en `MOTION_SPECS`; añade pruebas de
   movimiento completo, incompleto y con otra configuración.
5. Cuando haya muestras reales, mide con `pnpm lsv:engine:evaluate` antes de cambiar umbrales.
6. Actualiza esta matriz y, si cambia la experiencia de la lección, `LESSON_DESIGN_STANDARD.md`.
