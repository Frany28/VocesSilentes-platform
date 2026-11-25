# Arquitectura del reconocimiento de manos

Motor único: [`shared/lsv/engine/`](../shared/lsv/engine/). Todas las lecciones lo consumen a través de
`CameraExercise` y de `index.js`; ninguna pantalla debe duplicar normalización, reglas por letra ni lógica
temporal.

## 1. Línea base (antes de este cambio)

| Aspecto | Estado anterior |
| --- | --- |
| Detector | MediaPipe Hand Landmarker (`hand-engine.js`), local, modelo con SHA-256 verificado, 2 manos, VIDEO |
| Clasificador | `LSV_DTW_1NN`: 16 fotogramas × 66 rasgos (`screen-pose-wrist-v1`), 9 prototipos |
| Cobertura | Solo A, E, I, O, U y NONE, solo mano **derecha** |
| Mano izquierda | `UNSUPPORTED_HAND`: el estudiante zurdo no recibía resultado |
| Consonantes | `REFERENCE_ONLY`: sin comprobación ni captura |
| Decisión | Una captura de 3 s y un único vecino más cercano por intento; abstención por radio y margen |
| Retroalimentación | Encuadre (mano ausente, borde, movimiento rápido) y «predicción coincidente»; ninguna corrección de dedos |
| J, Ñ, Z | Sin verificación de movimiento |

Causas de fallo identificadas: prototipos de dos videos sin participantes independientes; la distancia
DTW compara coordenadas absolutas, de modo que una postura parcialmente parecida puede quedar cerca;
sin prototipos izquierdos no hay respuesta; no se distinguía «postura incorrecta» de «otra letra».

## 2. Pipeline actual

```
getUserMedia (sin reflejar) ─► HandLandmarker (21 puntos × 2 manos, VIDEO)
   └─► createHandTracker        lateralidad estabilizada por votos, tracks por muñeca
        ├─► useLetterRecognizer ─► createLetterRecognizer   guía continua (cada fotograma)
        └─► useSequenceCapture ─► singleHandFrames          intento de 3 s
               └─► useLocalModel.predict
                      ├─ predictHandSequence (DTW, si hay modelo)
                      ├─ analyzeCapture (geometría + tiempo)
                      └─ combineEvidence ─► camera-stage ─► WorkspaceAttempt / AttemptResult
```

| Responsabilidad | Módulo |
| --- | --- |
| Captura de video y ciclo de vida | `camera-session.js`, `use-hand-camera.js` (cierra pistas en `pagehide`, pestaña oculta y desmontaje) |
| Extracción de landmarks | `hand-engine.js` (MediaPipe) |
| Identidad y lateralidad | `shared/lsv/hand-tracker.js`, `hand-track-matching.js` |
| Normalización | `engine/landmarks.js` (`canonicalHand`) |
| Rasgos | `engine/features.js` |
| Descriptores interpretables | `engine/descriptors.js`, umbrales en `engine/thresholds.js` |
| Especificación por letra | `engine/alphabet-spec.js` |
| Clasificación de conjunto abierto | `engine/handshape.js` |
| Análisis temporal | `engine/motion.js` (J, Ñ, Z), `engine/recognizer.js` (estabilidad) |
| Validación de un intento | `engine/capture-analysis.js`, `engine/hybrid.js` |
| Retroalimentación educativa | `recognition/camera-stage.js`, `WorkspaceAttempt.jsx`, `AttemptResult.jsx` |
| Evaluación con datos reales | `engine/evaluation.js`, `Backend/scripts/lsv-engine-evaluate.js` |

## 3. Lateralidad y espejo

- El video se entrega a MediaPipe **sin reflejar**; el espejo del visor es solo CSS. La lateralidad
  devuelta corresponde a la mano física (evidencia en `LSV_ALPHABET_RESEARCH.md` §4). No se
  intercambian etiquetas.
- El tracker vota tres observaciones con confianza ≥ 0,65 antes de fijar la lateralidad y crea un
  track nuevo ante un cambio persistente, así que dos manos no intercambian identidad por el orden de
  salida de MediaPipe.
- Con dos manos visibles, `selectActiveHand` conserva el track activo y, si no hay, elige la mano estable
  más grande. Como el alfabeto es unimanual, la guía pide dejar visible una sola mano.
- No se pregunta la mano dominante: cada fotograma se evalúa con la mano que se observa.

## 4. Normalización (`canonicalHand`)

1. Corrección de aspecto (`x·ancho/alto`, igual para `z`).
2. Muñeca en el origen.
3. Escala: media de |muñeca→índice MCP|, |muñeca→medio MCP| y |muñeca→meñique MCP| (en 3D, más estable
   ante inclinación que una sola distancia 2D).
4. Mano izquierda: reflexión `x → −x`. Es la única transformación de lateralidad. Arriba/abajo y la
   profundidad se conservan, así que siguen distinguiéndose G/H/P (horizontales) de D/U/W (verticales)
   y M/N (colgando).

No se rota la mano a una orientación canónica: la orientación distingue letras y su eliminación sería
una normalización excesiva.

## 5. Rasgos

Por dedo: flexión MCP (inclinación de la falange proximal respecto al plano palmar), PIP y DIP; curvatura
acumulada; rectitud punta–nudillo; avance a lo largo de la mano (`rise`) y hacia la palma (`forward`).
Pulgar: flexión, posición lateral respecto al índice y al meñique en el eje radial–cubital, altura,
profundidad respecto a las puntas, distancia a nudillos y falanges, abducción. Contactos pulgar–punta,
distancias entre puntas, separación angular de dedos en el plano palmar, cruce índice/medio (inversión
del orden lateral) y orientación (dirección de la mano y normal de la palma, mediante productos
vectoriales y escalares).

La profundidad de MediaPipe está comprimida (en un puño real, la flexión MCP se mide en 20–70° en lugar de
~90°). Por eso cada propiedad combina ángulos con medidas robustas como la rectitud y el avance relativo.

## 6. Decisión

- **Estática:** cada letra es un conjunto de restricciones con grado 0–1 y corrección asociada. Es
  compatible si toda restricción crítica ≥ 0,5 y la media ponderada ≥ 0,65.
- **Conjunto abierto:** `classifyShape` devuelve `UNKNOWN` si ninguna letra es compatible y `AMBIGUOUS`
  si dos compatibles quedan a menos de 0,08. Nunca fuerza una letra.
- **Frente a la letra objetivo:** `evaluateTarget` devuelve `MATCH`, `CONFUSED` (otra letra encaja
  mejor: se nombra la rival) o `ADJUST`, con la corrección crítica más incumplida.
- **Temporal estática:** el reconocedor exige ≥ 70 % de votos compatibles en una ventana de 700 ms,
  velocidad de las puntas ≤ 2,5 palmas/s (no cuenta durante transiciones) y 800 ms continuos para
  confirmar. Una pérdida del detector ≤ 400 ms no reinicia el intento. Una corrección nueva debe
  dominar 600 ms para sustituir a la anterior: no hay mensajes contradictorios fotograma a fotograma.
- **Temporal dinámica:** la postura inicial debe aparecer al comienzo y mantenerse en ≥ 50 % del
  recorrido; además, J requiere un giro de la normal palmar ≥ 45° que se mantenga al final (segunda
  detención supina de Oviedo), Ñ ≥ 2 inversiones laterales y Z ≥ 2 inversiones horizontales, recorrido
  ≥ 1,2 palmas y descenso. La postura inicial sola nunca aprueba.
- **Híbrido con el DTW:** la geometría puede vetar una coincidencia del DTW. Si el DTW se abstiene por
  cobertura (mano izquierda), decide la geometría. Si el DTW propone otra letra, el resultado es incierto.

Todos los valores numéricos están **sin calibrar** con personas (`THRESHOLDS_STATUS =
'UNCALIBRATED_ANATOMICAL'`).

## 7. Estados para el estudiante

| Estado | Origen | Texto principal |
| --- | --- | --- |
| Cámara inicializando | `camera.state` | Preparando la cámara |
| Buscando mano | `SEARCHING` / sin manos | Buscando tu mano |
| Mano detectada | `DETECTED` | Mano detectada |
| Analizando seña | `ANALYZING` o captura en curso | Analizando la seña |
| Ajuste necesario | `ADJUST` | Corrección concreta: «Separa el pulgar del índice.», «Coloca toda la mano dentro de la cámara.», «Mejora la iluminación…» |
| Mantener | `HOLD` | Mantén la posición / Ahora realiza el movimiento / Completa el movimiento |
| Seña correcta | `MATCH` | «Configuración compatible»: comprobación orientativa, no certificación |
| Seña no reconocida | `UNRECOGNIZED` | No reconocemos esta configuración |

El aviso de iluminación es heurístico: se basa en una confianza de lateralidad < 0,5 sostenida durante
1 s, no en una medición de luz.

## 8. Alternativas evaluadas

Sin datos reales independientes no es posible medir precisión, así que la comparación es cualitativa y
se basa en los requisitos del proyecto (navegador, privacidad, sin servicios de pago).

| Alternativa | Datos necesarios | Navegador / móvil | Mantenimiento | Decisión |
| --- | --- | --- | --- | --- |
| Reglas geométricas | Ninguno para empezar; datos para calibrar | Sí; ~0,1 ms/fotograma | Interpretable; cada regla es una corrección | **Adoptada** como validador y fuente de retroalimentación |
| DTW 1-NN (actual) | Prototipos por letra y mano | Sí | Simple; escala mal con muchas clases | **Conservada**; se combina con la geometría |
| k-NN / SVM / Random Forest sobre rasgos | Cientos de muestras por clase y mano | Sí (JS puro) | Medio | Pendiente de datos; los rasgos de `features.js` sirven de entrada |
| Red densa con TensorFlow.js | Cientos o miles de muestras por clase | Sí, con dependencia de ~1 MB+ | Alto | No justificada sin datos |
| Modelo temporal (LSTM/GRU/TCN) | Secuencias revisadas de J, Ñ, Z | Sí, con TF.js | Alto | No justificada: solo 3 letras dinámicas |
| Gesture Recognizer personalizado | Imágenes por clase en carpetas, entrenamiento en Python | Sí, otro `.task` | Medio | Descartada por ahora: almacena imágenes (no solo landmarks), es estático y no da correcciones por dedo |
| Híbrido (elegido) | Crece con los datos | Sí | Medio | **Arquitectura objetivo**: rasgos → clasificador aprendido → validación geométrica y temporal |

No se añadieron dependencias. Web Worker: no es necesario, porque el motor cuesta ~0,1 ms por fotograma
(p95 < 0,3 ms medido en un Ryzen 5 7535HS) frente a los milisegundos de MediaPipe. Si un clasificador
futuro supera ~5 ms, debe moverse a un worker como `training.worker.js`.

## 9. Privacidad y recursos

Todo se procesa en el navegador. El motor no guarda puntos, imágenes ni confianza; la evidencia formativa
de las vocales sigue registrando solo conteos (`attemptMatches`). La cámara se libera al detenerla, al
ocultar la pestaña, en `pagehide` y al desmontar el componente (`use-hand-camera.js`).
