# Hoja de ruta del reconocimiento LSV

Estado de partida: motor geométrico y temporal con 24 letras evaluables y ambas manos, umbrales sin
calibrar, sin dataset real ([HAND_RECOGNITION_ARCHITECTURE.md](HAND_RECOGNITION_ARCHITECTURE.md)).

## Fase A — Validación lingüística (bloqueante para afirmar corrección)

- Revisar la [especificación](LSV_ALPHABET_SPECIFICATION.md) con personas sordas competentes en LSV
  (p. ej., instructores de la Asociación de Sordos de Caracas u otra institución venezolana).
- Resolver la discrepancia A/S (Oviedo 2000, p. 62) y documentar la segunda configuración de la P.
- Describir Q y T con rasgos verificables; decidir si se incorporan LL, RR y CH y cómo se ejecutan.
- Confirmar la trayectoria de Ñ y Z, y la amplitud mínima del giro de J.
- Confirmar que la reflexión es adecuada para personas zurdas.

## Fase B — Datos reales

- Campaña de captura según [LSV_DATASET_STRATEGY.md](LSV_DATASET_STRATEGY.md), con particiones por persona.
- Revisión de cada ejecución y de los negativos frente a las 27 letras.
- Verificar con una persona real la lateralidad de MediaPipe con cámara frontal (§4 de la investigación).

## Fase C — Calibración y medición

- Calibrar por letra los umbrales de `thresholds.js` y los tiempos de `TIMING` con *train*/*validation*.
- Medir con `pnpm lsv:engine:evaluate` en *test*. Publicar matriz de confusión, métricas por mano y
  comparación con el DTW sobre el mismo test.
- Revisar la separabilidad E/S y M/N; si sigue baja, añadir rasgos (p. ej., visibilidad relativa de las
  uñas o el área de la silueta) o un clasificador aprendido para esos pares.

## Fase D — Clasificador aprendido (cuando haya datos suficientes)

- Entrenar k-NN, SVM o una red pequeña sobre los rasgos de `features.js`, con abstención calibrada.
- Mantener la geometría como validador y fuente de correcciones (arquitectura híbrida).
- Si el coste supera ~5 ms por fotograma, mover la inferencia a un Web Worker.

## Fase E — Experiencia educativa

- Indicador visual del progreso de «mantén la posición» y resaltado del dedo a corregir sobre el
  esqueleto dibujado, respetando `LESSON_DESIGN_STANDARD.md`.
- Ejercicios de deletreo (secuencias de letras), que requieren detectar transiciones entre letras.
- Solo tras la Fase C, y con aprobación lingüística, valorar si una comprobación puede contar como
  evidencia formativa más fuerte. La corrección académica sigue siendo exclusiva del servidor.
