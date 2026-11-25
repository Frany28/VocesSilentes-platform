# Estándar de diseño de lecciones de VocesSilentes

Versión 1.1 · Actualizado el 24 de noviembre de 2026.

> Fuente oficial para diseñar, desarrollar, modificar, revisar y mantener todas las lecciones
> educativas de VocesSilentes.

Este documento describe el sistema que existe en el repositorio. No convierte ideas futuras en
capacidades disponibles. Si cambia un componente compartido, una regla visual, la navegación, el
progreso o cualquier comportamiento general de las lecciones, este archivo debe actualizarse en el
mismo pull request.

## 1. Introducción y propósito

El sistema de lecciones organiza contenido validado en recorridos breves, enfocados y retomables.
Su objetivo es ayudar al estudiante a comprender conceptos, observar referencias, practicar y
recibir retroalimentación sin confundir una interacción de interfaz o una predicción experimental
con dominio certificado de Lengua de Señas Venezolana (LSV).

Principios del sistema:

- una unidad educativa principal por pantalla;
- objetivos visibles y secuencia anticipable;
- texto, recursos y evaluaciones autorizados por el backend;
- corrección académica exclusiva del servidor;
- evidencia formativa local mínima y diferenciada del progreso académico;
- navegación consistente, reversible y recuperable;
- accesibilidad por defecto y movimiento nunca necesario para comprender;
- adaptación de la mecánica al objetivo pedagógico sin duplicar la estructura común.

La experiencia utiliza la identidad visual de VocesSilentes: Manrope como tipografía de marca,
violeta como color de acción, superficies claras u oscuras según el tema, tarjetas redondeadas y una
jerarquía serena. La interfaz debe acompañar el aprendizaje visual, no competir con él.

## 2. Arquitectura compartida

### Componentes y responsabilidades

| Componente o módulo | Responsabilidad real |
| --- | --- |
| `StudentLesson` | Obtiene módulo y lección del catálogo autorizado, decide qué adaptador usar y navega a la siguiente lección. Abrir una lección no altera el progreso. |
| `CurriculumLesson` | Recorrido genérico para lecciones derivables de secciones, recursos, tarjetas, práctica y preguntas del backend. |
| `IntroductionCurriculumLesson` | Adaptador de la introducción a la LSV y al alfabeto manual. Añade conceptos y situaciones formativas sin reemplazar la evaluación real. |
| `VowelCurriculumLesson` | Adaptador de vocales. Coordina microclase, estudio, actividades, cámara voluntaria, repaso mixto y resumen. |
| `LessonIntroduction` | Bienvenida con título, descripción, objetivos, medio, vista previa de etapas y pie opcional. |
| `LessonContent` | Explicación breve con apoyo visual y detalles opcionales. |
| `LessonActivity` | Contenedor semántico de actividad; normaliza la estructura, no impone una mecánica. |
| `JourneyHeader` | Marca, salida, tema, perfil, posición, barra de recorrido, fases y avisos editoriales o de persistencia. |
| `JourneyPhases` | Representa la etapa actual y las etapas del recorrido. |
| `JourneyControls` | Acciones persistentes de volver, continuar o enviar; comunica bloqueos con ayuda visible. |
| `useLessonJourney` | Orden, checkpoint local, reanudación y resultados confirmados por servidor. Visitar teoría no registra progreso académico. |
| `CurriculumAssessment` | Presenta una pregunta, envía la selección y muestra la retroalimentación devuelta por el backend. |
| `AssessmentSummary` | Resume objetivos, resultados reales y progreso; registra manualmente la lección y permite repasar. |
| `LessonResources` | Muestra microclase, videos aprobados o un marcador explícito de material pendiente. |
| `LessonIllustration` / `LessonMedia` | Ilustración o reserva visual. `LessonMedia` declara que no representa una seña aprobada. |
| `useIntroductionProgress` / `useVowelProgress` | Guardan evidencia formativa mínima en el dispositivo, separada del progreso académico. |

### Organización de carpetas

```text
Frontend/src/features/student/
├── lesson/                 # Entrada, preguntas, feedback y lectura base
├── curriculum/             # Recorrido, superficies, adaptadores y estilos educativos
├── microclass/             # Microclase interactiva de vocales
├── recognition/            # Práctica experimental mediante cámara
├── resources/              # Videos y referencias disponibles por lección
└── data/                   # Catálogo y progreso académico consumidos desde la API

Backend/
├── content/alphabet/       # Paquete educativo: lecciones, recursos y ejercicios
└── ...                     # API, validación, sanitización, evaluación y persistencia

Frontend/src/test/          # Pruebas de recorrido, persistencia e integración educativa
docs/                       # Auditorías y este estándar oficial
```

### Frontera entre frontend, backend y contenido

El backend y su paquete educativo son la fuente de verdad para objetivos, secciones,
instrucciones, tarjetas, recursos, estado editorial y ejercicios. El frontend transforma esos
datos públicos en pasos, pero no debe copiar claves de respuesta, inventar evaluaciones ni publicar
material pendiente.

`lessonSteps()` construye el recorrido genérico. Los adaptadores especializados construyen pasos
estables cuando la pedagogía exige otra secuencia. Solo los ejercicios con
`availability === 'READY'` son preguntas respondibles. `PENDING_LSV_REVIEW` y `PENDING_REVIEW`
siguen siendo restricciones editoriales; la vista previa puede usar el mecanismo existente, pero la
experiencia publicada no debe eludirlos.

`useLessonAssessment` envía la respuesta y `LessonFeedback` presenta la explicación recibida. El
progreso académico se registra desde el resumen por una acción explícita. El checkpoint de
navegación y la evidencia formativa local no equivalen a una lección completada.

### Regla de reutilización

1. Usa `CurriculumLesson` si el orden genérico satisface el objetivo.
2. Si hace falta una mecánica especializada, crea un adaptador que componga los elementos comunes.
3. Reutiliza `JourneyHeader`, `JourneyControls`, `LessonIntroduction`, `LessonContent`,
   `LessonActivity`, `CurriculumAssessment` y `AssessmentSummary` cuando corresponda.
4. Mantén los datos educativos en el backend y la composición en el frontend.
5. Extrae una abstracción cuando dos experiencias comparten responsabilidad y contrato, no solo
   una apariencia circunstancial.

No copies cabeceras, barras de progreso, pies de navegación, formularios de evaluación,
retroalimentación, guardado académico ni estilos de tarjeta dentro de una nueva lección.

## 3. Estándar visual

### Tokens y temas

Los valores canónicos están en `Frontend/src/styles/foundations.css` y
`Frontend/src/styles/tokens.css`. Se consumen como variables; no se duplican valores hexadecimales
o escalas dentro de una lección.

| Propósito | Token | Claro | Oscuro |
| --- | --- | --- | --- |
| Página | `--page` | `#faf9fe` | `#171625` |
| Superficie | `--surface` | `#ffffff` | `#252338` |
| Texto | `--content` | `#332e4a` | `#f3f0fc` |
| Texto secundario | `--text-secondary` | `#5d5870` | `#c8c3d7` |
| Acción | `--action-primary` | `#6045c5` | `#b7a4ff` |
| Acento | `--surface-accent` | `#e9dfff` | `#38304f` |
| Éxito | `--status-success` | `#26734d` | `#75d9a4` |
| Error | `--status-error` | `#bc3d50` | `#ff94a4` |
| Foco | `--focus` | `#6045c5` | `#b7a4ff` |

Usa también `--surface-neutral`, `--surface-secondary`, `--surface-tertiary`,
`--border-subtle`, fondos de estado y los tokens de acción `hover`, `pressed` y `disabled`. Todo
elemento debe funcionar en ambos temas.

### Tipografía y jerarquía

- La interfaz educativa usa Manrope mediante `--font-brand`.
- Usa `--type-h1`, `--type-h3`, `--type-subtitle`, `--type-button`, `--type-secondary` y
  `--type-label`; no crees una escala paralela.
- Los títulos de las superficies compartidas usan una escala fluida de 28 a 40 px; el título de la
  cabecera usa de 22 a 30 px.
- Los párrafos deben ser breves, con una idea central por bloque y títulos que anticipen la acción.
- `text-wrap: balance` puede usarse en títulos, no en texto largo.

### Espaciado, tarjetas, botones e imágenes

- La escala es 4, 8, 12, 16, 24 y 32 px (`--space-*`).
- Los radios van de `--radius-sm` a `--radius-2xl`; las tarjetas educativas usan normalmente
  `--radius-2xl` y `--shadow-soft`.
- Las acciones usan `Button`, incluidos sus estados de carga y desactivado.
- Los controles conservan un objetivo de al menos 44 px; `--size-control` vale 52 px.
- Imágenes, videos y referencias tienen texto alternativo o pie pertinente. Una imagen decorativa
  se declara como tal. Una ilustración genérica nunca se presenta como seña válida.
- Los recursos no aprobados usan `LessonMedia` y una indicación explícita, no contenido de relleno.

### Estados visuales

Cada actividad contempla inicial, enfocado, seleccionado, pendiente, desactivado, correcto,
incorrecto y error técnico cuando apliquen. Ningún estado se comunica solo con color: usa texto,
icono, borde o `role="status"`. Conserva `focus-visible` con un contorno basado en `--focus`.

### Responsive y aprovechamiento del ancho

- `.lesson-experience` permite hasta 1480 px; su contenido principal hasta 1400 px.
- El recorrido base limita texto convencional a 840 px. Las experiencias visuales especializadas
  pueden ampliar microclase, cámara o actividades hasta 1400 px cuando su composición lo requiere.
- En escritorio, `LessonIntroduction`, `LessonContent` y `LessonActivity` pueden usar dos columnas
  cuando existe una relación útil entre explicación, referencia y actividad.
- Por debajo de 760 px estas superficies y la vista previa pasan a una columna.
- Por debajo de 1280 px, las fases no actuales muestran su número y conservan su etiqueta en la
  estructura accesible.
- Desde 900 px, la cabecera agrupa la marca, el título y los accesos en la primera fila. La segunda
  reúne el progreso, las fases y los detalles secundarios. Por debajo de 820 px de alto, reduce separaciones y usa la marca
  compacta, sin reducir objetivos táctiles.
- En móvil, los controles inferiores se reparten el ancho y respetan el área segura.

No limites una actividad visual compleja al ancho de un párrafo, pero tampoco extiendas texto largo
de borde a borde. Evita anchos fijos, desbordamiento horizontal y columnas vacías. Dedica el ancho
extra a comparar, mostrar referencias o reducir desplazamiento vertical.

### Distribución adaptativa por ancho y altura

El ancho decide cuándo existe espacio para columnas; la altura decide cuánto puede crecer el área
visual principal. No uses un breakpoint de ancho como única señal para reproductores, cámaras o
actividades altas.

- La microclase mantiene `aspect-ratio: 16 / 9`. Cuando su reproductor mide menos de 640 px,
  adopta `3 / 4` para dar espacio a las escenas apiladas.
- A partir de 900 px de ancho de la microclase, `.mc-layout` coloca el reproductor a la izquierda
  y el título y la guía a la derecha. El reproductor usa un mínimo operativo de 642 px y crece
  según el espacio libre y el ancho 16:9 derivado de `100dvh`. Una ventana muy baja conserva ese
  mínimo y permite desplazamiento natural.
- La guía lateral limita su alto según `100dvh`; únicamente la lista secundaria de capítulos puede
  desplazarse internamente. El reproductor, sus subtítulos y controles nunca se recortan para hacer
  caber la página.
- Bajo 900 px de alto, el recorrido reduce las separaciones exteriores. Bajo 740 px, el pie reduce
  su relleno y conserva los controles.
- Los ejercicios de vocales usan consultas al contenedor del escenario. La evaluación genérica
  muestra pregunta y feedback en dos columnas desde 1000 px. Los resultados usan dos columnas desde
  900 px. En móvil todos vuelven a una secuencia vertical.
- Las fichas individuales de vocales pueden ocupar hasta 1400 px. Desde 900 px de ancho del
  escenario, la referencia, la explicación y la comparación se agrupan junto a la demostración.
  En ventanas bajas se compactan los márgenes interiores y las miniaturas sin encoger los
  controles. En escenarios estrechos la demostración sigue a la explicación en el flujo del
  documento.

### Encabezado compacto, multimedia y overflow

`JourneyHeader` conserva visibles el título, la etapa, el progreso y la navegación. La orientación
adicional y la información de vista previa se agrupan en `journey-details`, un `details` operable
con teclado. Los fallos de persistencia se muestran directamente. La disponibilidad de las
evaluaciones depende del backend. El resumen informa de los ejercicios pendientes. Usa un solo
encabezado para cada actividad.

La microclase es la superficie principal de su etapa. El reproductor ocupa la primera columna; la
guía y transcripción ocupan el panel lateral. Los subtítulos permanecen en una franja propia y los
controles principales conservan una altura de al menos 44 px. En contenedores estrechos las
acciones, incluido el volumen, se ajustan en varias líneas.

Las escenas reutilizadas cargan sus estilos junto con el componente, también al retomar una
lección directamente en una ficha. Solo la escena del reproductor completo ocupa una capa
absoluta. En una demostración individual, la escena dimensiona su propio marco en el flujo y
adapta la ilustración al ancho del panel y a la altura disponible. Los subtítulos y los controles
conservan su espacio. La procedencia de las imágenes se conserva en los metadatos del material y
en el laboratorio. Las ilustraciones educativas mantienen texto alternativo descriptivo.

El documento y el escenario educativo usan scroll natural. `overflow: hidden` solo es válido para
recortar decoraciones o escenas dentro de un marco con proporción definida, nunca para esconder
contenido, feedback o navegación. Un scroll interno se reserva para contenido secundario acotado,
como capítulos; debe tener `overscroll-behavior` y no sustituye al scroll de la página.

## 4. Estándar de animaciones

`Frontend/src/features/student/curriculum/lesson-motion.css` define el movimiento compartido. Las
duraciones canónicas de `foundations.css` son:

- presión: `--motion-press`, 100 ms;
- control: `--motion-control`, 180 ms;
- superficie: `--motion-surface`, 220 ms;
- diálogo o cambio principal: `--motion-dialog`, 240 ms;
- curva general: `--motion-ease`, `ease-in-out`;
- entrada: `--motion-enter-ease`, `cubic-bezier(0.23, 1, 0.32, 1)`;
- elevación: `--motion-lift`, -2 px.

La cabecera aparece por opacidad; una superficie entra con opacidad y 8 px de traslación vertical;
el feedback usa 4 px. Los botones pueden cambiar elevación, sombra y color mediante los tokens. Una
salida no debe retrasar la navegación ni ocultar el resultado de una acción.

Con `prefers-reduced-motion: reduce`, las duraciones pasan a `0s`, la elevación a `0px` y el
recorrido evita desplazamiento suave. Toda animación nueva debe tener alternativa sin movimiento y
mantener idéntica información y funcionalidad.

Evita movimiento continuo, parallax, rebotes, destellos, cambios bruscos de luminosidad,
animaciones mayores que el cambio explicado, estados comunicados solo por movimiento y controles
bloqueados mientras termina una animación decorativa.

## 5. Estructura pedagógica

Una lección adapta sus pasos, pero cubre una secuencia comprensible:

1. **Introducción y objetivos.** Presenta propósito, resultados esperados y recorrido mediante
   `LessonIntroduction` o el paso introductorio genérico.
2. **Explicación.** Divide el contenido del backend en unidades breves. `LessonContent` sirve para
   conceptos con apoyo visual; `CurriculumTheory` conserva el texto del recorrido genérico.
3. **Recursos multimedia.** Usa microclase, video aprobado o referencia visual. Incluye subtítulos y
   controles; si falta material, declara el estado editorial.
4. **Actividades interactivas.** Recuperación, discriminación, aplicación contextual o práctica
   motora según el objetivo. Una exploración no se presenta como evaluación.
5. **Retroalimentación.** Explica el resultado de inmediato. En evaluaciones proviene del backend;
   en actividades especializadas forma parte de la mecánica versionada y probada.
6. **Práctica.** Permite repetir sin penalización. La cámara solo aparece cuando aporta al objetivo y
   se describe como experimental o voluntaria según la implementación.
7. **Repaso y finalización.** Resume objetivos, evidencia real y próximo paso. El estudiante decide
   cuándo registrar la lección y puede reiniciar el repaso.

Son comunes la cabecera, fases, progreso, navegación, superficies, evaluación del servidor, resumen
y guardado académico. Pueden variar la cantidad de etapas, referencia, actividad, requisitos
formativos para avanzar y presencia de cámara.

La Lección 1 recorre Inicio, LSV, Alfabeto, Aplicaciones, Comprueba —solo con preguntas `READY`— y
Repaso. La Lección 2 recorre Inicio, Microclase, Aprende, Comprueba, Cámara y Repaso; ejecutar la
seña con cámara es voluntario, aunque el recorrido exige visitar sus objetivos antes de avanzar.

## 6. Estándar de actividades

### Selección múltiple

`LessonQuestion` usa radios nativos, admite teclado y no conoce la clave correcta.
`CurriculumAssessment` envía la selección, espera al servidor, muestra `LessonFeedback` y habilita
continuar después de una respuesta correcta o ya completada. Un error permite reintentar con su
explicación; un fallo de red usa `Alert`.

### Ejercicios visuales

La referencia debe estar aprobada o marcada como pendiente. `VowelRound` y `VowelActivity`
implementan reconocimiento y comparación por rondas. La respuesta permanece oculta hasta elegir, y
cada error se explica antes del siguiente intento.

### Actividades de memoria

`VowelMixedReview` alterna retos visuales y formación de una vocal de memoria. La referencia puede
revelarse cuando la mecánica lo permite. Atender un reto no certifica la ejecución.

### Práctica mediante cámara

La lección de vocales usa `VowelCameraJourney`, `VowelSignBridge` y `CameraPracticeLoader`. La
interfaz explica permiso, estado, referencia y resultado. Solo guarda conteos de intentos
coincidentes o inciertos; no guarda imágenes, landmarks, secuencias, confianza ni una nota. Una
predicción coincidente es evidencia experimental, no certificación de LSV.

No agregues cámara por uniformidad. Debe corresponder al objetivo, manejar permiso o ausencia del
dispositivo y seguir las reglas de privacidad.

### Estados, validación, feedback y repetición

- Antes de responder: instrucciones y estado neutro.
- Al seleccionar: opción distinguible y acción disponible.
- Durante validación: controles bloqueados y etiqueta de carga.
- Correcta: confirmación, explicación y avance.
- Incorrecta: explicación y acción explícita de reintento.
- Guardada: informa que el servidor conserva el resultado y permite practicar de nuevo.
- Error técnico: mensaje accionable sin borrar la selección innecesariamente.
- Repetición: restablece solo esa práctica; no borra progreso académico confirmado.

Una actividad local puede exigir completar rondas para avanzar, pero no debe escribir por sí sola el
estado académico del backend.

## 7. Navegación y progreso

`JourneyControls` mantiene **Volver** y la acción principal después del escenario, en el flujo
normal del documento. En etapas breves el escenario ocupa el espacio libre y empuja los controles
hacia el borde inferior. En etapas largas los controles se alcanzan al final del contenido. El
relleno inferior respeta el área segura. Volver se desactiva sin paso anterior. La acción
principal nombra el efecto: «Comenzar lección», «Comprobar respuesta», «Reintentar», «Ver mi repaso»
o «Guardar y continuar».

`useLessonJourney` guarda en `localStorage` un checkpoint versionado por estudiante, módulo y
lección: posición, firma y pasos visitados. Si cambia la firma, el checkpoint se reconcilia. Una
pregunta anterior incompleta bloquea el salto hacia pasos posteriores.

Distinción obligatoria:

- **contenido visitado:** posición y porcentaje del recorrido local;
- **actividad formativa completada:** evidencia local de rondas, exploraciones o intentos;
- **ejercicio académico completado:** resultado confirmado por el backend;
- **lección completada:** registro académico manual desde `AssessmentSummary`.

**Repasar desde el inicio** no borra aciertos del servidor. Guardar y continuar usa
`useLearningProgress`; llegar al resumen nunca registra automáticamente la lección. Si no se puede
guardar el checkpoint local, `JourneyHeader` lo comunica y permite continuar.

## 8. Accesibilidad y responsive

La interfaz usa flujo natural, no una altura fija ni un recorte global. En escritorio puede haber
dos columnas y cabecera horizontal. En tablet se compactan etiquetas de fases. En móvil el contenido
pasa a una columna, los botones se reparten el ancho y el pie respeta
`env(safe-area-inset-bottom)`.

Requisitos:

- usa HTML semántico: `header`, `main`, `article`, `section`, `nav`, `fieldset`, listas y botones;
- relaciona títulos con `aria-labelledby`; usa `aria-current`, `aria-pressed` y `role="status"`
  cuando corresponde;
- mantén orden lógico de foco; los radios nativos operan con Tab, Espacio y flechas;
- al cambiar de paso, `useLessonJourney` enfoca el contenido principal y restaura el scroll superior;
- conserva contraste en ambos temas y un `focus-visible` claro;
- videos educativos ofrecen subtítulos y controles; el contenido esencial no reside solo en audio o
  imagen;
- los errores indican qué ocurrió y cómo reintentar sin borrar avance;
- evita carruseles obligatorios, scroll horizontal, paneles principales con desplazamiento y saltos
  automáticos repetidos; el scroll interno de capítulos es una excepción secundaria y acotada;
- el pie sigue al último contenido y deja accesibles todos los controles;
- respeta `prefers-reduced-motion` y áreas táctiles de al menos 44 px.

Prueba, como matriz de referencia, 1920×1080, 1773×832, 1440×900, 1366×768, 1280×720,
1024×768, 768×1024, 390×844 y 360×800. Verifica zoom, textos largos, tema oscuro, teclado y
contenido con y sin evaluaciones. En cada tamaño confirma que la navegación no cubre contenido, la
microclase conserva subtítulos y controles, no hay títulos duplicados ni overflow horizontal y una
ventana baja no fuerza un recorte.

## 9. Guía para desarrollar nuevas lecciones

1. **Define el objetivo.** Indica qué comprenderá, reconocerá o practicará el estudiante y qué
   evidencia es apropiada. No empieces por la animación o la cámara.
2. **Actualiza el contenido fuente.** Coloca objetivos, secciones, instrucciones, tarjetas, recursos
   y ejercicios en el paquete del backend. Respeta la revisión lingüística.
3. **Comprueba el contrato público.** La API debe sanitizar respuestas y exponer como `READY` solo
   preguntas respondibles.
4. **Elige el recorrido.** Usa `CurriculumLesson` si `lessonSteps()` basta. Crea un adaptador solo por
   una necesidad pedagógica concreta.
5. **Reconoce semánticamente.** Usa propiedades estables del contenido, no UUID. Por ejemplo,
   `isIntroductionLesson()` usa propósito y ausencia de tarjetas; `isVowelLesson()` usa A, E, I, O, U.
6. **Construye pasos estables.** Cada paso requiere `id`, `type` y `phase`; los IDs son únicos y
   sobreviven a la recarga.
7. **Compón lo compartido.** Usa `LessonIntroduction`, `LessonContent` y `LessonActivity` dentro de
   `JourneyHeader` y `JourneyControls`.
8. **Conecta evaluación y resumen.** Reutiliza `CurriculumAssessment`; no corrijas en el cliente.
   Termina con `AssessmentSummary` o un resumen especializado que conserve guardado explícito.
9. **Modela evidencia mínima.** Si necesita reanudación, crea un hook versionado por usuario, módulo
   y lección. Guarda solo lo necesario y nunca material sensible.
10. **Aplica tokens.** Importa la composición desde `curriculum.css` y limita CSS nuevo a la mecánica
    propia. Verifica ambos temas y breakpoints.
11. **Prueba.** Cubre reconocimiento, pasos, avance, regreso, reanudación, bloqueos, feedback,
    reintento, resumen, guardado y regresiones.
12. **Documenta.** Si cambia el sistema compartido, actualiza este archivo en el mismo pull request.

Ejemplo del adaptador genérico usado por `StudentLesson`:

```jsx
<CurriculumLesson
  lesson={lesson}
  module={module}
  onContinue={continueLearning}
  nextTitle={next?.title}
  initialStep={initialStep}
/>
```

Composición de una etapa especializada con componentes reales:

```jsx
<div className="learning-journey education-page lesson-experience">
  <JourneyHeader
    lesson={lesson}
    module={module}
    journey={journey}
    phaseOrder={phaseOrder}
  />
  <div className="journey-stage" data-step={step.type}>
    <LessonContent
      id="lesson-concept"
      eyebrow="Descubre"
      title={step.section.heading}
      body={step.section.body}
    />
  </div>
  <JourneyControls onBack={journey.back} onContinue={journey.next} />
</div>
```

Ejemplo de estructura para una mecánica especializada:

```jsx
<LessonActivity
  id="lesson-practice"
  eyebrow="Ponlo en práctica"
  title="Aplica lo aprendido"
  description={step.practiceInstructions}
>
  {activityContent}
</LessonActivity>
```

`activityContent` representa la mecánica concreta que se implemente y pruebe; no es un componente
del repositorio ni autoriza texto, respuestas o validación locales.

## 10. Checklist de calidad

### Contenido y pedagogía

- [ ] Los objetivos son observables y aparecen al inicio y en el repaso.
- [ ] El contenido proviene del backend o de un recurso versionado y aprobado.
- [ ] La secuencia distingue explicación, práctica, evaluación y repaso.
- [ ] Las instrucciones explican qué hacer y por qué.
- [ ] La repetición no penaliza ni borra progreso confirmado.
- [ ] Una predicción o exploración no se presenta como certificación de LSV.
- [ ] No se elude `PENDING_LSV_REVIEW`/`PENDING_REVIEW`.

### Arquitectura y datos

- [ ] Se reutilizan cabecera, fases, controles, evaluación, feedback y resumen aplicables.
- [ ] No hay componentes o estilos duplicados para responsabilidades compartidas.
- [ ] Los pasos tienen IDs únicos y estables.
- [ ] No hay UUID de base de datos codificados para reconocer la lección.
- [ ] La clave correcta y la validación académica permanecen en el backend.
- [ ] Checkpoint, evidencia formativa y progreso académico están separados.
- [ ] No se almacenan imágenes, landmarks, confianza ni datos sensibles de cámara.

### Interfaz, responsive y movimiento

- [ ] Se usan Manrope y los tokens existentes de color, tipografía, espacio, radio y movimiento.
- [ ] La lección funciona en temas claro y oscuro.
- [ ] No hay ancho fijo ni desplazamiento horizontal en móvil.
- [ ] Escritorio aprovecha el ancho sin extender demasiado la lectura.
- [ ] El pie está en el flujo después del escenario y respeta el área segura.
- [ ] Los layouts visuales responden a la altura disponible, no solo al ancho.
- [ ] Reproductor, subtítulos y controles permanecen visibles sin `overflow: hidden` estructural.
- [ ] Solo contenido secundario acotado utiliza scroll interno.
- [ ] Los estados tienen una señal adicional al color.
- [ ] `prefers-reduced-motion` conserva información y funcionalidad.
- [ ] No hay animaciones continuas, distractoras o bloqueantes.

### Accesibilidad

- [ ] La estructura semántica y jerarquía de encabezados son correctas.
- [ ] La navegación y las actividades operan mediante teclado.
- [ ] El foco es visible y se mueve de forma predecible.
- [ ] Las áreas táctiles miden al menos 44 px.
- [ ] Imágenes y videos tienen alternativa, pie o declaración decorativa adecuada.
- [ ] Los videos incluyen subtítulos y controles cuando corresponde.
- [ ] Los errores son accionables y no destruyen avance.
- [ ] Se verificaron zoom, texto largo, móvil, tablet y escritorio.

### Progreso y pruebas

- [ ] Volver, continuar, salir, retomar y reiniciar el repaso funcionan.
- [ ] Visitar contenido no completa automáticamente la lección.
- [ ] Las preguntas se validan y reintentan según el backend.
- [ ] Guardar la lección es explícito y usa el progreso académico existente.
- [ ] Hay pruebas unitarias para constructores y reglas de progreso.
- [ ] Hay una prueba de integración del recorrido y sus estados críticos.
- [ ] Pasan pruebas educativas afectadas, lint, formato y build.
- [ ] Se revisó visualmente cuando el entorno dispone de navegador.
- [ ] Este documento se actualizó si cambió el comportamiento compartido.
