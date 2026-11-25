# Investigación lingüística y técnica del abecedario LSV

Fecha de consulta: 24 de noviembre de 2026. Complementa la [auditoría del 18 de noviembre](lsv-alphabet-audit.md)
y el [inventario de fuentes](lsv-alphabet-sources.json). Especificación resultante:
[LSV_ALPHABET_SPECIFICATION.md](LSV_ALPHABET_SPECIFICATION.md).

**Regla del proyecto:** la ASL u otras lenguas de señas no se usan como referencia lingüística. Sus
trabajos técnicos (MediaPipe, datasets, modelos) sí se consultan como referencia de ingeniería.

## 1. Fuentes consultadas

| Id | Fuente | Qué aporta | Limitaciones y derechos |
| --- | --- | --- | --- |
| `manual-fuentes-2022` | Y. Fuentes, *Manual básico de LSV* (2022), pp. 5–6. 27 fichas en `Frontend/src/assets/lsv-manual/` | Configuración visual de A–Z, con flechas de movimiento en J, Ñ y Z. Es la referencia que ven los estudiantes | Uso educativo declarado por la usuaria (`provenance.json`); revisión LSV pendiente. Dibujos 2D: no muestran profundidad ni todas las caras de la mano |
| `oviedo-2000-part3` | A. Oviedo, *Un estudio sobre la estructura de las señas de la LSV*, ULA, 2000, Parte 3, pp. 56–62. [PDF](https://cultura-sorda.org/wp-content/uploads/2015/03/Oviedo_Estructura_LSV_Parte3_de_6.pdf) | **I:** una detención, meñique extendido, demás dedos cerrados (p. 57). **J:** dos detenciones, antebrazo en base neutra y luego supina, unidas por un giro de muñeca (pp. 57–58). Taxonomía de movimientos de muñeca (giro interior/exterior, pronosupino, cubital-radial, rotación) y oscilación (pp. 60–62). Menciona la **S** como «puño cerrado, con el pulgar extendido» (p. 62) | Consulta académica; sin permiso para extraer imágenes ni entrenar |
| `upel-martinez-2018` | A. M. Martínez, *Formación docente para una educación matemática especialmente inclusiva*, UPEL, 2018, pp. 65–66. [PDF](https://mail.espacio.digital.upel.edu.ve/index.php/TD/article/download/1784/1679/5428) | El alfabeto LSV es **unimanual** («dactilología figurativa»). La **P** tiene dos configuraciones en LSV. **LL** y **Ñ** existen en el alfabeto venezolano y no en el internacional. Gráfico 9 tomado de Oviedo (2006) | Gráfico no reproducido; la segunda P y la LL no se describen en texto |
| `oviedo-2006-origen` | A. Oviedo, *Origen del alfabeto manual usado entre nosotros*, 2006. [Web](http://www.cultura-sorda.org/origen-del-alfabeto-manual/) | Origen histórico común (Yebra 1593, Bonet 1620) y «pequeñas variaciones» entre países | No describe letras ni el caso venezolano en texto |
| `oviedo-rumbos-perez-2004` | Oviedo, Rumbos y Pérez, *El estudio de la LSV*, 2004. [Web](https://www.cultura-sorda.org/el-estudio-de-la-lsv/) | La LSV agrupa variedades regionales con diferencias **mayormente léxicas**. Cita a Rojas (1997): el alfabeto manual permite «deletrear en el aire» | No describe configuraciones |
| `perez-2011-blog` | I. Pérez (facilitador LSV, persona con discapacidad auditiva), [*Lengua de señas a tu alcance*](http://lenguadesenasatualcance.blogspot.com/2011/05/alfabeto.html), 2011 | «El Alfabeto Manual Venezolano se ejecuta con una sola mano» | Blog personal; la tabla es una imagen sin licencia |
| `arteliro` | [Arteliro: Alfabeto en la LSV](https://arteliro.com/lengua-de-senas-venezolana/) | Muestra imágenes de **Ll** y **RR** como letras | Solo imágenes, sin descripción ni licencia. No se usó como evidencia de configuración |
| FEVENSOR 1999 | Ya inventariado en `lsv-alphabet-sources.json` | Referencia básica de LSV | Copyright; sin licencia para entrenamiento |

No accesibles en esta consulta: el taller de la UCV
(`ucv.ve/.../lenguaje_de_señas.pdf`, conexión rechazada), los documentos de Scribd/Docsity (requieren
cuenta) y los ya registrados como no disponibles en el inventario anterior.

### Referencias técnicas

| Fuente | Uso en el proyecto |
| --- | --- |
| [Guía oficial de Hand Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker) | 21 puntos por mano, coordenadas de imagen normalizadas, `z` relativa a la muñeca y lateralidad |
| [Documentación legada de MediaPipe Hands](https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/hands.md) | Advierte que la lateralidad se calculaba **suponiendo una imagen espejada**. Ver §4 |
| [Referencia de `HandLandmarkerResult`](https://developers.google.com/edge/api/mediapipe/python/mp/tasks/vision/HandLandmarkerResult) | Indica que la lateralidad describe las manos de la persona. Contradice la anterior; ver §4 |
| [Zhang et al., *MediaPipe Hands*, 2020](https://arxiv.org/abs/2006.10214) | Arquitectura del detector y del modelo de puntos |
| [Personalización de Gesture Recognizer (Model Maker)](https://developers.google.com/edge/mediapipe/solutions/customization/gesture_recognizer) | Alternativa evaluada: exige un dataset de imágenes por carpeta con clase `none`, entrena en Python y produce un `.task` |
| [BdSL47](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10700367/), LSA64 (citado), LSTM sobre landmarks ([ACM](https://dl.acm.org/doi/fullHtml/10.1145/3675888.3676105)) | Ejemplos técnicos de datasets y modelos sobre landmarks en otras lenguas. **No son LSV** y no se usaron como clases |

## 2. Conclusiones lingüísticas

1. **Unimanual.** Dos fuentes independientes (Martínez 2018 y Pérez 2011) describen el alfabeto
   manual venezolano como unimanual. Por eso el motor evalúa una sola mano y trata la segunda mano
   visible como interferencia; no hay configuraciones bimanuales que implementar.
2. **Lateralidad.** Ninguna fuente prescribe la mano dominante. La convención de las lenguas de señas
   es que la persona zurda articula con su mano dominante, produciendo la imagen especular. El motor
   refleja la mano izquierda a un sistema común (§4). Validar esta equivalencia con personas zurdas
   que usan LSV queda pendiente.
3. **Movimiento.** Hay evidencia textual para J (Oviedo 2000). Para Ñ y Z solo existen las flechas de
   la ficha del curso; su trayectoria exacta no está descrita en texto.
4. **Variación.** La variación regional de la LSV es mayormente léxica (Oviedo et al. 2004). Para el
   alfabeto, la única variante documentada en texto es la P (dos configuraciones, Martínez 2018).
5. **CH, LL, RR.** LL es una letra del alfabeto venezolano (Martínez 2018), pero ninguna fuente
   consultada describe su ejecución. RR aparece solo en imágenes de terceros sin licencia. No se
   encontró evidencia para CH. **No se implementan** (§3 de la especificación).

## 3. Discrepancias abiertas

| Letra | Discrepancia | Decisión |
| --- | --- | --- |
| S y A | Oviedo (2000, p. 62) describe la S como «puño cerrado con el pulgar extendido». En la ficha del curso, ese puño con pulgar extendido junto al índice es la **A**, y la S lleva el pulgar cruzado por delante de los dedos | Se evalúa la ficha del curso, que es lo que se enseña. Ambas quedan como `SOURCE_CONFLICT` para revisión por personas sordas competentes en LSV |
| P | Dos configuraciones en LSV (Martínez 2018); solo una tiene ficha | Se evalúa la de la ficha (`VARIANT_PENDING`); la segunda se añadirá cuando se documente |
| Q, T | Las fichas no permiten fijar contactos ni orientación verificables (T se confunde con A en el dibujo) | `REFERENCE_ONLY`: sin comprobación automática |

## 4. Lateralidad de MediaPipe: verificación

Las dos fuentes oficiales se contradicen (la guía legada dice «se asume imagen espejada; si no, intercambia
las etiquetas»; la referencia de Tasks dice que la etiqueta describe la mano de la persona). Se contrastó
con datos reales:

- Los 9 prototipos del modelo `vowels-demo-v1` proceden de fotogramas **sin reflejar** y están
  etiquetados `Right` por MediaPipe Tasks.
- En los 9, el nudillo del índice queda a la derecha del nudillo del meñique en la imagen y la normal
  `(índice − muñeca) × (meñique − muñeca)` apunta hacia la cámara.
- Con la palma hacia la cámara (como en las fichas de vocales), esa geometría corresponde a una mano
  **derecha** vista de frente.

Conclusión: con fotogramas sin reflejar, la etiqueta de MediaPipe Tasks describe la mano tal como
aparece en la imagen. `getUserMedia` entrega fotogramas sin reflejar (el espejo del visor es CSS), así que
`Right` es la mano física derecha. **No se intercambian etiquetas**, en coherencia con la decisión ya
documentada en [lsv-left-hand-feedback.md](lsv-left-hand-feedback.md). Es evidencia, no prueba
exhaustiva: los videos de origen podrían haber estado espejados. La prueba
«efecto espejo» de `Backend/tests/lsv-engine.test.js` documenta qué ocurre si la etiqueta fuese
errónea: la palma queda invertida y las letras que dependen de la orientación pierden compatibilidad.
Una verificación con una persona real (mano levantada y conocida) sigue en la hoja de ruta.

## 5. Datasets LSV

No se encontró ningún dataset público de LSV con landmarks, imágenes o videos y licencia de uso (búsquedas
en inglés y español, repositorios académicos y GitHub). Los recursos locales siguen siendo los descritos
en la [auditoría](lsv-alphabet-audit.md): 9 muestras provisionales de vocales sin participantes
independientes. La estrategia de captura propia está en [LSV_DATASET_STRATEGY.md](LSV_DATASET_STRATEGY.md).

## 6. Ensayo sobre las fichas ilustradas

Se ejecutó el Hand Landmarker real del proyecto (modelo con hash verificado) sobre las 27 fichas y sus
reflejos, en un Chromium local. **No detectó ninguna mano**, ni siquiera con umbrales de 0,05: los
dibujos estilizados no se parecen a fotografías. Por eso no se derivaron landmarks de las fichas; las
posturas de prueba se construyeron con un generador cinemático explícitamente sintético.
