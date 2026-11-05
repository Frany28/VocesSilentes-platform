# Flujo educativo Student — capa visual

La lectura publicada continúa en `/student/modules/:moduleId/lessons/:lessonId`, atendida por
`StudentLesson`. Se conservan la consulta por ID dentro del módulo, el acceso directo, StudentGuard,
StudentProvider, AbortSignal, los estados de carga/error/reintento/no disponible y el progreso manual.
Esta entrega no modifica servicios, API, autenticación, esquema Prisma, datos ni dependencias.

## Referencias y composición

Diseños consultados mediante Figma el 4 de noviembre de 2026:

- [Flujo educativo claro · 457:15338](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=457-15338).
- [Flujo educativo oscuro · 457:17358](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=457-17358).

Se consultaron los 36 flujos hijos con contexto detallado, sus capturas y las cabeceras de las seis
vistas. La implementación compone StudentLayout, StudentPageHeader, StudentProvider, Button, Radio,
Select, Progress e Icon; mantiene Manrope y los tokens de tema existentes. No se modificó Figma.

| Vista                        | Desktop claro / oscuro | Tablet claro / oscuro | Mobile claro / oscuro |
| ---------------------------- | ---------------------- | --------------------- | --------------------- |
| Contenido                    | 457:15339 / 457:17359  | 457:16094 / 457:18100 | 457:16759 / 457:18763 |
| Selección múltiple           | 457:15466 / 457:17485  | 457:16206 / 457:18213 | 457:16853 / 457:18858 |
| Reconocimiento visual        | 457:15598 / 457:17612  | 457:16323 / 457:18327 | 457:16952 / 457:18954 |
| Retroalimentación correcta   | 457:15742 / 457:17751  | 457:16452 / 457:18453 | 457:17063 / 457:19062 |
| Retroalimentación incorrecta | 457:15857 / 457:17865  | 457:16552 / 457:18554 | 457:17145 / 457:19145 |
| Resultado                    | 457:15972 / 457:17979  | 457:16652 / 457:18655 | 457:17227 / 457:19228 |

Las tarjetas usan radio 24 y padding 24/16; los controles conservan su tamaño cómodo de 52 px.
Las columnas de teoría/multimedia y multimedia/opciones se apilan por debajo de 1200 px. El área
multimedia mide 245 px en Desktop/Tablet y 190 px en Mobile. Se conservan los umbrales del shell:
sidebar de 240 px desde 1200, sidebar de 80 px desde 600 y navegación inferior por debajo de 600.

El marcador multimedia conserva la ilustración decorativa original, sin presentarla como una seña
o un vídeo funcional. No se utiliza el enlace YouTube del diseño: falta validación del material LSV.
La leyenda informa «pendiente»; no hay reproductor, iframe, cámara ni descarga de clips.

## Lectura publicada y demo

En la lectura real se muestran el título, objetivo y explicación recibidos por la API, sin reemplazarlos
por los ejemplos de Figma. «Continuar aprendiendo» abre por ID la siguiente lección publicada del
mismo módulo o vuelve al catálogo si no hay otra. No completa la lectura ni abre ejercicios simulados.
El indicador superior muestra la posición de la lección, no un porcentaje de avance guardado.
Se conserva también el índice de navegación de la entrega anterior.

Los ejercicios, la retroalimentación y el resultado se encuentran solo en
`/student/modules/education-demo`, registrada exclusivamente cuando `import.meta.env.DEV` es true.
La ruta sigue dentro de los guards y StudentLayout existentes. Se carga por importación diferida;
los fixtures y el controlador de demo no forman parte del bundle de producción.

Los textos de ejemplo proceden de Figma y no se declaran contenido LSV aprobado. La cabecera identifica
el origen de demostración y los controles explican que no hay evaluación ni guardado. El selector
«Vista de demostración» permite inspeccionar las seis vistas directamente. «Retroalimentación de
muestra» elige el mensaje mostrado al comprobar; la opción marcada no determina si es correcta.
Reintentar limpia la selección. El estado se pierde al recargar o salir. El resultado fijo usa 2/2
aciertos y 4/5 lecciones: un único cálculo produce 80% para texto, ancho y valor accesible de la barra.
No se crean intentos, XP, ejercicios persistidos ni escrituras de progreso.

## Abrir la demo aislada

Con dependencias instaladas, desde la raíz:

```powershell
pnpm db:generate
pnpm learning:demo
```

Abrir <http://localhost:5281/login> e iniciar sesión con la cuenta **pública de prueba**
`lectura@example.invalid` y la contraseña `Lectura local de prueba 123!`. Después, abrir
<http://localhost:5281/student/modules/education-demo> y usar los selectores inferiores.
Para revisar la lectura real, abrir Mis módulos → Explorar módulo.

Este comando existente crea API y PostgreSQL WASM locales efímeros, sin leer URLs privadas de DB ni
escribir en Supabase. Ctrl+C cierra sus procesos y descarta la base. La demo visual no exige cambiar
`VITE_STUDENT_DEMO` ni `.env`; el procedimiento ya fuerza la API real para el catálogo.
En un Vite ya iniciado con sesión USER también se puede abrir la ruta usando el puerto correspondiente.

## Recursos y accesibilidad

`Frontend/src/assets/education/` contiene 20 SVG originales descargados de los nodos consultados.
No se editaron paths, colores o dimensiones raíz; `lesson-assets.css` elige el recurso exacto por
tema, tamaño y ubicación. Las flechas de Button reutilizan los recursos existentes del UI Kit.

| Slot                   | Claro                 | Oscuro                | Dimensiones nativas |
| ---------------------- | --------------------- | --------------------- | ------------------- |
| Regreso                | 4d132.svg             | a3a14.svg             | 24 × 24             |
| Play decorativo        | 768fb.svg             | c586d.svg             | 24 × 24             |
| Acierto / error        | 3862f.svg / 8353a.svg | e6072.svg / 1fbf9.svg | 24 × 24             |
| Contenido Desktop      | 6f7d2.svg             | 7e9be.svg             | 356,4 × 80,64       |
| Reconocimiento Desktop | c69f4.svg             | 84783.svg             | 753,12 × 80,64      |
| Contenido Tablet       | 2d800.svg             | 6eab7.svg             | 432 × 80,64         |
| Reconocimiento Tablet  | 26c14.svg             | 52ccb.svg             | 432 × 80,64         |
| Contenido Mobile       | 0ced2.svg             | 800c7.svg             | 154,56 × 62,72      |
| Reconocimiento Mobile  | 897e7.svg             | 027a4.svg             | 154,56 × 62,72      |

El SVG de reconocimiento Desktop excede el ancho de su área en el diseño; se conserva el tamaño
nativo y se recorta su desborde dentro del marcador para evitar scroll horizontal. No se reconstruye
ni deforma la ilustración. Los avisos de demo, controles de revisión y textos de material pendiente
son extensiones necesarias de esta entrega; la navegación exterior conserva la implementación
compartida previa, sin atribuirle una nueva reproducción exacta del shell de Figma.

Las opciones usan radios nativos, fieldset, leyenda y etiquetas asociadas: Tab, Espacio y flechas.
Comprobar está deshabilitado sin selección. El foco visible rodea la opción; al cambiar de vista
se dirige al main. Acierto/error combinan icono, texto y role status/alert. Los SVG son decorativos.
La barra conserva etiqueta, valor y descripción accesibles del componente Progress.

## Verificación y archivos

Las pruebas `student-education-demo.test.jsx` cubren selección/teclado, mensajes configurados,
reintento, resultado coherente, reinicio de estado y ausencia de escrituras. Se amplía la regresión
de lectura para comprobar multimedia pendiente, continuación por ID y retorno al catálogo.
La nueva ruta también entra en las pruebas existentes de sesión y rol.

Verificación local final del 4 de noviembre de 2026: **`pnpm verify` terminó con código 0**.

| Control                                   | Resultado                            |
| ----------------------------------------- | ------------------------------------ |
| ESLint / Prettier                         | Correctos, sin advertencias          |
| Vitest + Testing Library                  | 139 pruebas correctas en 52 archivos |
| Pruebas HTTP/configuración backend        | 44 pruebas correctas                 |
| Prisma validate y builds frontend/backend | Correctos                            |
| Integración SQL/auth en PostgreSQL WASM   | 67 pruebas correctas                 |
| Total automatizado                        | 250 pruebas correctas, cero fallos   |

Chrome headless comprobó **48 composiciones**: seis vistas, más las variantes con/sin selección,
en claro/oscuro a 1440×968, 834×1108 y 390×1032. Se verificaron ausencia de desbordamiento horizontal,
Manrope, sidebar/navegación móvil, cuatro opciones, deshabilitado sin selección, geometría nativa de
SVG, y 4/5 = 80% en texto, aria-valuenow y ancho real de la barra. La lectura publicada funcionó desde
el catálogo y al abrir directamente su URL por IDs, con foco en el contenido y texto original.
No hubo errores de ejecución, reproductores, llamadas de cámara ni escrituras en las tablas de progreso.
También se comprobó que la ruta, los controles y los fixtures de demo quedan excluidos del build final.

Evidencias locales ignoradas por Git: `.local/education-review/results.json`, 49 capturas en ese
directorio (48 composiciones y una lectura publicada) y `.local/education-verify-final.log`.
No se ejecutó ni se comprobó GitHub Actions; no hubo publicación ni escrituras en Supabase.

Archivos nuevos de presentación en `Frontend/src/features/student/lesson/`:
`LessonTrail.jsx`, `LessonMedia.jsx`, `LessonQuestion.jsx`, `LessonFeedback.jsx`, `LessonResult.jsx`,
`lesson.css`, `lesson-layout.css`, `lesson-media.css`, `lesson-feedback.css`, `lesson-assets.css`.
Estado y fixtures aislados en `lesson/demo/`: `EducationDemo.jsx`, `EducationDemoControls.jsx`,
`use-education-demo.js` y `education-demo-data.js`. Se añaden los 20 recursos SVG y
`Frontend/src/test/student-education-demo.test.jsx`.

Archivos modificados: `LessonReading.jsx`, `StudentLesson.jsx`, `student.routes.jsx`,
`Frontend/src/test/student-lesson-navigation.test.jsx`, `Frontend/src/test/student-role.test.jsx`,
`README.md`, `docs/architecture.md`, `docs/design-system.md`, `docs/first-lesson.md` y este documento.
Todos los cambios de código pertenecen al frontend Student; no hay cambios backend ni de configuración.

Quedan pendientes el material audiovisual LSV aprobado, la validación de los ejercicios y la futura
definición de corrección/persistencia de intentos. La capa visual no los presenta como integraciones.
