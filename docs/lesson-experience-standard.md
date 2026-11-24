# Estándar de experiencias educativas

## Propósito

Las lecciones de VocesSilentes comparten una misma estructura visual y de navegación sin forzar
las mismas actividades. El contenido académico continúa en el backend; los adaptadores del frontend
solo lo ordenan en una secuencia pedagógica y añaden interacciones formativas sin calificación.

## Arquitectura actual

- `JourneyHeader` presenta identidad, posición, progreso y etapas.
- `JourneyControls` mantiene volver/continuar en una zona accesible y responsive.
- `LessonIntroduction`, `LessonContent` y `LessonActivity` ofrecen las superficies reutilizables.
- `CurriculumAssessment` usa las preguntas públicas y deja la corrección exclusivamente al backend.
- `LessonFeedback` presenta la explicación devuelta por el servidor.
- `AssessmentSummary` muestra objetivos, evidencia real, progreso académico y siguientes acciones.
- `useLessonJourney` conserva el punto local sin convertirlo en progreso académico.
- `lesson-motion.css` unifica entrada de superficies y feedback, y respeta
  `prefers-reduced-motion`.

La Lección 1 usa `IntroductionCurriculumLesson`; la Lección 2 conserva
`VowelCurriculumLesson` porque necesita rondas, microclase y práctica opcional con cámara. Ambas
comparten la introducción, cabecera, progreso, etapas, controles, tarjetas, resumen y movimiento.

## Flujo de la Lección 1

1. Bienvenida, ilustración existente, objetivos y vista previa.
2. LSV como lengua natural visual-gestual.
3. Alfabeto manual como recurso de la LSV.
4. Tres situaciones cotidianas explorables y práctica sugerida por el backend.
5. Preguntas disponibles con feedback inmediato del backend.
6. Resumen de objetivos, situaciones exploradas, ejercicios reales y progreso académico.

Las preguntas pendientes de revisión LSV no se convierten en preguntas locales. La vista previa
editorial puede probarlas mediante el mecanismo ya existente; el catálogo publicado conserva su
estado `PENDING_REVIEW` hasta una aprobación real.

## Incorporar una lección futura

1. Mantener objetivos, secciones, instrucciones, tarjetas y ejercicios en el paquete del backend.
2. Usar el recorrido genérico si las etapas existentes son suficientes.
3. Crear un adaptador especializado solo si la pedagogía necesita una mecánica propia.
4. Componer la experiencia con las superficies compartidas; no duplicar cabecera, navegación,
   feedback ni guardado.
5. Guardar localmente solo evidencia formativa mínima. No almacenar imágenes, claves de respuesta
   ni supuestos aciertos.
6. Mantener toda corrección académica y autorización editorial en el backend.
7. Probar reconocimiento del contenido, recorrido, reanudación, feedback, resumen y ausencia de
   regresiones en las experiencias especializadas existentes.

## Criterios responsive y de movimiento

- Escritorio: usar una o dos columnas según la relación entre explicación, referencia y actividad.
- Móvil: convertir las rejillas en una columna, mantener controles de 44 px como mínimo y evitar
  anchos fijos.
- El cambio de etapa usa las duraciones y curvas del sistema de tokens.
- Las animaciones comunican jerarquía o feedback; no deben ser necesarias para comprender el
  contenido.
- Con movimiento reducido, el recorrido mantiene todas sus funciones sin transiciones espaciales.
