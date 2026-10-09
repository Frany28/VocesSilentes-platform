# Preparación de MediaPipe

Está instalado @mediapipe/tasks-vision **1.1.0**, publicación estable fijada en manifiesto y lockfile.
No se importa en el inicio ni se solicita cámara. La funcionalidad de práctica todavía no existe.
No se instaló TensorFlow.js ni se construyó un clasificador simulado.

## Integración prevista

La futura funcionalidad `features/practice/` separará vista, hook de ciclo de vida y adaptador de
MediaPipe en lib/ o servicios propios. Hacer import dinámico solo cuando se vaya a practicar.
La cámara se solicita con getUserMedia después de una acción explícita, nunca al abrir una ruta.
Exige contexto seguro (HTTPS o localhost), permiso y tratamiento accesible de denegaciones.

HandLandmarker devuelve landmarks y lateralidad de manos. No reconoce LSV. GestureRecognizer tiene
categorías genéricas preentrenadas: tampoco constituye un modelo de LSV. La diferencia debe aparecer
en contratos, UI y documentación de práctica; no mostrar detección como evaluación lingüística.
Las [guías oficiales de landmarks](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js)
y [gestos](https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer)
describen esas tareas y sus límites de reconocimiento.

## Recursos reproducibles y privacidad

- Fijar archivos WASM de la misma versión **1.1.0** del paquete. No usar rutas @latest ni nightly.
- Preferir copiar WASM del paquete a recursos versionados/identificados al integrar práctica.
- Cada modelo .task tendrá versión, origen, licencia y hash SHA-256 documentados. No se eligió ni
  descargó un modelo todavía; una URL mutable no satisface reproducibilidad.
- Cargar tareas/modelos bajo demanda. Considerar worker al integrar inferencia, que puede bloquear
  el hilo principal; no crear uno sin mediciones y un contrato de ciclo de vida.
- Al salir o cancelar: cancelar frames, detener todas las pistas del MediaStream, limpiar srcObject,
  cerrar tareas con close() y liberar workers y referencias. Manejar resultados tardíos del arranque.
- No enviar imágenes, vídeo ni landmarks al servidor por defecto; procesar localmente. Cualquier
  cambio de este contrato requerirá un objetivo acordado y consentimiento claro.
- Manejar ausencia de cámara, permisos denegados, hardware no soportado y fallo al cargar recursos.

## Modelo específico de LSV: pendiente

Definir alcance lingüístico con personas competentes en LSV y comunidad sorda. Identificar señas
estáticas/dinámicas y componentes manuales/no manuales; landmarks de manos por sí solos pueden ser
insuficientes. Preparar datos con consentimiento, licencias y protección de participantes.

Diseñar particiones por persona/sesión para evitar fuga entre entrenamiento y evaluación. Entrenar
un modelo específico y validar con datos independientes, métricas por clase, variaciones de cámara,
iluminación, lateralidad y usuarios. Evaluar secuencias temporales, umbrales de confianza y abstención.
Comunicar límites y revisar accesibilidad de feedback antes de afirmar reconocimiento funcional.
Un resultado con categorías genéricas no valida reconocimiento LSV ni corrección de una seña.
