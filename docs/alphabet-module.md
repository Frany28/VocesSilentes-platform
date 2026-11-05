# Módulo 1 — alfabeto manual LSV

Implementación del 5 de noviembre de 2026. Reutiliza Module, Lesson, Exercise, LessonProgress y
ExerciseProgress. Las siete lecciones, las 27 tarjetas y las 34 preguntas proceden del JSON entregado;
todo el paquete permanece en **DRAFT**, pendiente de revisión lingüística. No está publicado en
Supabase ni disponible en el catálogo normal. No se ejecutaron migraciones o cargas remotas.

## Abrir y descartar la revisión local

Desde la raíz, con las dependencias instaladas:

```powershell
pnpm db:generate
pnpm alphabet:dev
```

Abrir <http://localhost:5282/student/modules>. Entrar con la cuenta **pública, exclusivamente local**:
`alfabeto@example.invalid`, contraseña `Alfabeto local de prueba 123!`.
Elegir «Explorar módulo». El catálogo, el índice, anterior/siguiente y los enlaces directos emplean
UUID de módulo/lección, nunca títulos. Se puede recargar cualquier lección conservando el avance
durante la sesión del procedimiento. La cabecera identifica la vista previa como borrador.

El comando crea PostgreSQL WASM en memoria, API Express con sesiones/CSRF reales y Vite. No lee
Backend/.env ni acepta una URL de base de datos. Se reconstruyen las migraciones únicamente en esa
base efímera. `Ctrl+C` cierra los procesos propios y descarta cuentas, contenido y progreso; otra
ejecución empieza de cero. No necesita configurar Supabase ni modificar los puertos del entorno
normal. Si 5282 está ocupado, cerrar la revisión anterior; no detener procesos ajenos.

`seed-alphabet.js` valida el JSON antes de abrir una transacción y utiliza UUID deterministas,
contentKey único y bloqueo transaccional. Repetir la carga sobre ese entorno devuelve `created:false`
sin actualizar filas, fechas, avances ni auditoría. Detecta colisiones/cargas parciales y aborta;
añade el módulo al final sin reordenar registros anteriores. Es una **carga inicial conservadora**:
cambiar el JSON no actualiza datos previamente cargados. Para revisar una nueva versión basta
cerrar y volver a abrir este entorno descartable. No hay comando de importación remota ni borrado
por título; el procedimiento completo es reversible al descartar su base propia.

## Contenido y materiales

| Lección                                  | Tarjetas | Preguntas de texto | Preguntas visuales pendientes |
| ---------------------------------------- | -------: | -----------------: | ----------------------------: |
| Conozcamos a la LSV y su alfabeto manual |        0 |                  3 |                             0 |
| Las cinco vocales: A, E, I, O y U        |        5 |                  0 |                             5 |
| Consonantes iniciales: B, C, D, F y G    |        5 |                  0 |                             5 |
| Consonantes: H, J, K, L y M              |        5 |                  0 |                             5 |
| Consonantes: N, Ñ, P, Q y R              |        5 |                  0 |                             5 |
| Consonantes: S, T, V, W y X              |        5 |                  0 |                             5 |
| Y, Z y mi nombre en el alfabeto manual   |        2 |                  4 |                             2 |
| **Total**                                |   **27** |              **7** |                        **27** |

Cada lectura presenta objetivos, secciones teóricas, práctica personal y espacio de video pendiente.
Las tarjetas muestran letras de estudio, pistas editoriales y créditos de página; sus imágenes y
videos son null. No describen configuraciones de manos ni reproducen ilustraciones.

Fuente privada: `Backend/content/alphabet/module-01.json`, copia semántica del JSON entregado,
formateada con Prettier. Conserva preguntas, opciones, claves, explicaciones, estados y checklist.
La [guía original](content/module-01-source-guide.md) se conserva como material editorial, no como
instrucciones de ejecución. El esquema de carga comprueba cantidades, IDs, referencias, cuatro
opciones, pertenencia de la clave y ausencia de recursos todavía no autorizados.

El PDF se inspeccionó **solo localmente**: páginas 5 y 6 para el abecedario y página 3 para créditos.
Identifica a Yulianny Fuentes y señala finalidad educativa/prohibición de venta; no se encontró una
licencia expresa de redistribución de ilustraciones. No se incorporó el PDF ni sus imágenes a Git,
public/ o al bundle. Las capturas privadas de revisión están ignoradas en `.local/`.
Las flechas editoriales de J, Ñ y Z únicamente se señalan como pendientes de validación; no se
deduce ni inventa el movimiento. Falta confirmar permisos, producir imágenes originales/autorizadas
y validar señas, textos y videos con personas competentes en LSV antes de publicar.

## Evaluación y progreso

Las siete preguntas de texto funcionan en la revisión local: selección mediante radios nativos,
botón deshabilitado sin selección, espera durante el envío, explicación devuelta por el servidor,
reintento y navegación. Ante error se conserva la selección; salir cancela el transporte.
La corrección compara optionId con la definición privada del servidor. El frontend no recibe
claves ni explicaciones antes de contestar y no importa el JSON del backend.

Las 27 preguntas visuales siempre devuelven `PENDING_MATERIAL`: sin opciones, referencia a la
tarjeta objetivo, imagen o explicación. No se puede comprobar una respuesta ni avanzar su progreso.
Se pueden recorrer los marcadores pendientes para revisar la estructura. Una ruta de archivo por
sí sola no habilita una pregunta; incorporar material aprobado exige un flujo posterior explícito.

Una respuesta incorrecta registra IN_PROGRESS; una correcta registra COMPLETED en ExerciseProgress
del usuario de sesión, atómicamente con auditoría. Repetir no degrada COMPLETED. No se guardan
intentos individuales, porcentajes, XP ni supuestos resultados de reconocimiento.
El resumen calcula preguntas resueltas sobre **todas las preguntas de esa lección**, incluidas las
pendientes. Por ejemplo, 4/6 = 67%; texto, valor ARIA y barra coinciden. Es mejor avance persistido,
no la nota del último intento. Las preguntas pendientes no cuentan como aciertos.

«Registrar lectura completada» conserva la acción manual explícita de LessonProgress. Contestar
preguntas no completa lecturas automáticamente. El porcentaje del módulo sigue siendo lecturas
completadas / lecturas disponibles: en esta vista previa utiliza las siete lecciones DRAFT
autorizadas; el catálogo normal sigue usando solo PUBLISHED. Los ejercicios SIGN_PRACTICE
anteriores conservan su flujo manual. Los nuevos cuestionarios no ofrecen ese atajo y el servidor
lo rechaza aunque se envíe directamente una petición PUT.

## Contrato y almacenamiento

Migración **preparada, no aplicada en bases compartidas**:
`20261105000100_alphabet_curriculum`. Añade campos opcionales a tablas existentes:

- Module.contentKey, único y no vacío cuando está presente.
- Lesson.content JSONB: objetivos, secciones, tarjetas y metadatos editoriales.
- Exercise.definition JSONB privado: opciones, clave, explicaciones, estado y revisión.
- ExerciseType: MULTIPLE_CHOICE_TEXT y MULTIPLE_CHOICE_IMAGE, conservando SIGN_PRACTICE.

Los CHECK exigen objetos JSON y definición para selección múltiple; el ejercicio manual conserva
definition null. No hay tablas nuevas, cambios de roles, RLS, auth o administración. expectedSignKey
se conserva: para selección múltiple contiene el ID editorial del ejercicio, nunca su respuesta.
El snapshot académico incorpora exactamente esta migración; no se regeneraron sus datos.
Antes de desplegar este código contra una base persistente se debe revisar y aplicar la migración
en un destino autorizado y generar el cliente. Este trabajo solo la ejecutó en bases de pruebas
descartables. No ejecutar db:migrate sobre Supabase como parte de abrir la revisión.

GET `/api/learning` mantiene el contrato existente y añade contenido estructurado cuando lo hay.
La lectura antigua sin Lesson.content conserva su renderizado. Los cuestionarios incluyen
`type`, `prompt`, `availability`, `reviewStatus`, `options` públicas y `media:null`.
No se serializa definition, expectedSignKey, correctOptionId, mediaRef ni explicaciones anticipadas.

POST `/api/learning/exercises/:id/answer`, sesión USER y CSRF:

```json
{ "optionId": "opt1" }
```

Respuesta 200 `{data:{isCorrect,progress,feedback:{tone,title,explanation}}}`. Acepta exclusivamente
optionId: rechaza userId, nota o clave enviados por el cliente. Comparte el límite existente de
30 escrituras/minuto por usuario, Cache-Control no-store y revalidación transaccional del actor.

| Estado    | Código / situación                                                                    |
| --------- | ------------------------------------------------------------------------------------- |
| 400       | INVALID_INPUT para cuerpo/UUID inválido; INVALID_OPTION si no pertenece a la pregunta |
| 401 / 403 | Sesión ausente / rol distinto de USER o CSRF inválido                                 |
| 404       | CONTENT_NOT_FOUND para contenido oculto, inexistente o no publicado                   |
| 409       | PENDING_MATERIAL, PENDING_REVIEW o EXERCISE_NOT_READY                                 |
| 409       | ASSESSMENT_REQUIRED al intentar completar manualmente un cuestionario                 |
| 429       | LEARNING_RATE_LIMIT                                                                   |

createLearningService admite un previewModuleId **inyectado solo por el proceso aislado y tests**.
Autoriza exclusivamente ese UUID, mantiene DRAFT y marca preview=true. No hay parámetro HTTP,
bandera VITE_* ni cambio en el arranque productivo que abra borradores. Sin esa inyección se exige
publicación de módulo/lección y aprobación del cuestionario de texto. No se habilitan preguntas
visuales en ningún entorno de esta entrega.

## Organización de archivos

Se consultó el [canvas Student de Figma](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=175-22520)
y los frames del flujo educativo claro/oscuro existentes. Se reutilizan sus superficies, Manrope,
tokens, controles, menú lateral desktop/tablet y navegación inferior móvil. Las tarjetas nuevas
componen esos elementos; no añaden dibujos de señas ni colores de un sistema paralelo.

- `Backend/content/alphabet/`, `docs/content/`: fuentes editoriales privadas y guía.
- `Backend/prisma/content.prisma`, nueva migración y snapshot `docs/module-ii/sql/01_schema.sql`:
  ampliación aditiva, sin modificar migraciones anteriores.
- `Backend/scripts/learning/alphabet*.js`, `seed-alphabet.js`, `review-alphabet-*.js`,
  `Backend/scripts/alphabet-dev.js`, `academic/environment.js`: validación, carga y revisión aisladas.
- `Backend/src/modules/learning/`: acceso por publicación/preview, proyección pública, validación y
  corrección, persistencia compartida y rutas/servicio/repositorio existentes.
- `Frontend/src/features/student/curriculum/`: teoría, tarjetas, cuestionario, resumen y estado.
  Reutiliza StudentLayout, StudentProvider, StudentPageHeader, Button, Select, Progress y las piezas
  de `lesson/`. Servicios en `data/learning.api.js`; ninguna petición en tarjetas/presentación.
- Adaptaciones de `StudentLesson`, cabeceras de inicio/catálogo, `module-progress`, `LearningPractice`,
  `LessonQuestion` y `LessonFeedback`: compatibilidad con contenido anterior y nuevos estados.
- Pruebas `Backend/tests/alphabet-source.test.js`, `auth/alphabet-*.test.js`,
  `database/alphabet-schema.test.js`, fixture auth y `Frontend/src/test/student-curriculum*`.
- Scripts de raíz/backend y referencias en README, architecture, api, data-model, migrations,
  development, first-lesson y educational-flow-ui. Sin dependencias nuevas ni cambios al lockfile.

## Verificación local

`pnpm alphabet:verify` abre Chrome con perfil propio sobre otra base efímera (puerto 5284).
Revisa catálogo → lección por UUID, las siete lecturas en claro/oscuro a 1440, 834 y 390 px,
Manrope, navegación lateral/inferior, ausencia de desbordamiento y medios/cámara. Envía las siete
respuestas de texto a Express/Prisma, prueba error/reintento, recarga el avance, recorre preguntas
pendientes y comprueba que siguen en DRAFT. Capturas y resultados se guardan en
`.local/alphabet-review/`; son evidencia local, no recursos de producto. Requiere Chrome disponible
en el equipo. Las pruebas de teclado, cancelación, espera y error HTTP también están en Vitest.

Los resultados finales de `pnpm verify` y de la revisión de navegador se incorporan tras su ejecución.
GitHub Actions y despliegues remotos no se ejecutan como parte de esta entrega.

Pendiente: autorización de recursos, revisión lingüística, aprobación editorial/publicación y
validación del despliegue en PostgreSQL del destino autorizado. Reconocimiento por cámara,
clasificadores, historial de intentos y certificación de ejecución quedan fuera del alcance.
