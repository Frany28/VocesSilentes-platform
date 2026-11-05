# Fase 1 — primera lectura educativa

Actualización visual: la [maquetación educativa desde Figma](educational-flow-ui.md) añade el marcador
multimedia, la continuación por ID y una demo de desarrollo separada con seis vistas. Mantiene los
contratos, permisos, texto publicado y progreso manual descritos aquí. Los resultados inferiores
corresponden a la entrega inicial de lectura.

`/student/modules/:moduleId/lessons/:lessonId` muestra una lección publicada del módulo indicado.
Las tarjetas del catálogo y el inicio abren la siguiente lectura usando IDs de la respuesta actual,
con alternativa a la primera lección. El índice permite elegir cualquier lectura del mismo módulo,
volver al catálogo y navegar a anterior/siguiente sin suponer que hay más de una lección.
Recargar o abrir el enlace directamente reconstruye la lectura desde la API.

Se reutilizan StudentLayout, StudentProvider, StudentPageHeader, Alert, DataFeedback y NavigationItem,
los tokens y los temas existentes. El foco pasa al contenido al cambiar de lectura o terminar la carga.
La maquetación inicial no añadía tokens ni una especificación Figma; la referencia visual posterior
y sus diferencias están documentadas en el flujo educativo enlazado arriba.

## Contrato y datos

Se conserva `GET /api/learning`, sesión USER, filtrado de publicaciones en backend y AbortSignal.
No se añaden endpoints ni campos JSON, modelos, migraciones o dependencias. Cada ID de lección se
busca dentro del módulo de la URL. Un ID inexistente, una combinación incorrecta o un contenido
no publicado muestran «Lección no disponible»; un fallo HTTP ofrece reintento sin datos sustitutos.
La demo visual histórica conserva su recorrido por Practicar, identificado como demostración.

`Lesson.description` sigue siendo texto plano. Para la primera clase, el primer párrafo empieza por
`Objetivo:` y los párrafos restantes constituyen la explicación. Se admiten saltos LF/CRLF; React
presenta el texto sin interpretar HTML ni Markdown. Las descripciones anteriores se muestran enteras
como explicación y señalan que no hay objetivo documentado. Esta convención editorial no cambia
el contrato API ni obliga a actualizar registros previos. Abrir, leer y navegar no escribe progreso.
El progreso manual de Practicar y las demás funcionalidades conservan sus servicios y comportamiento.
Solo se amplía la lista de destinos internos tras login para aceptar esta ruta por UUID para USER;
las comprobaciones de sesión, rol y permisos siguen siendo las existentes.

## Contenido revisable

Fuente de edición: `Backend/content/lsv-introduction.txt`, código **LSV-INTRO-01**, versión 1,
4 de noviembre de 2026. Módulo 1: «Descubriendo la LSV y mis primeras señas»; clase:
«¿Qué es la Lengua de Señas Venezolana?». El texto visible indica que es un borrador educativo
pendiente de revisión por docentes y personas sordas usuarias de LSV, no una validación ya realizada.

La síntesis sobre lenguas naturales y estructuras propias se apoya en
[Naciones Unidas: Día Internacional de las Lenguas de Señas](https://www.un.org/en/observances/sign-languages-day).
La diversidad lingüística y la participación de personas sordas se apoyan en
[Federación Mundial de Sordos: declaración de 2014](https://wfdeaf.org/wfd-statement-on-standardized-sign-language/).
Son referencias generales, no una certificación del contenido local de LSV. Se requiere revisión
lingüística y pedagógica venezolana antes de una publicación educativa definitiva.

## Carga local reproducible y reversible

Desde la raíz, con las dependencias instaladas:

```powershell
pnpm db:generate
pnpm learning:demo
```

Abrir <http://localhost:5281/student/modules>. Iniciar sesión con `lectura@example.invalid` y
la contraseña **pública de prueba** `Lectura local de prueba 123!`. «Explorar módulo» abre la clase.
El programa fuerza `VITE_STUDENT_DEMO=false`: la lectura recorre Express, Prisma y PostgreSQL WASM
efímero con autenticación real local. No requiere un servidor PostgreSQL instalado. No es Supabase
ni una integración Storage: el entorno compartido de desarrollo tiene un sustituto local de Storage
que esta lectura no utiliza.

Cada ejecución reconstruye las migraciones existentes en memoria, inserta un Module y un Lesson
con UUID estables y una cuenta USER sintética. El cargador solo usa `create`, nunca `update` o `upsert`;
un conflicto falla sin reemplazar registros. No crea ejercicios, progreso ni otra cuenta administrativa.
El programa no lee DATABASE_URL/DIRECT_URL ni archivos privados de backend, y no acepta una URL DB
como argumento. **No ejecutar el cargador contra bases existentes o compartidas.** No se ha realizado
ninguna carga remota. La clase no aparecerá en esas bases hasta una publicación aprobada posterior.

Reversión: pulsar Ctrl+C; se descarta toda la base en memoria y se cierran los procesos propios.
Si el puerto 5281 está ocupado, liberar el proceso propio correspondiente antes de volver a iniciar.
No cambiar `.env`. Repetir el comando reconstruye los mismos IDs con progreso vacío.

## Verificación y Fase 2

Las pruebas de lectura usan router/proveedores/componentes reales con transporte simulado identificado;
cubren navegación por IDs con títulos repetidos, retorno al catálogo, enlace directo, carga/error/reintento,
ausencia de contenido, sesión/rol y ausencia de escrituras. La integración backend usa Prisma y
PostgreSQL WASM en memoria para verificar el contenido cargado y el filtrado de publicaciones.
Verificación local del 4 de noviembre de 2026: `pnpm verify` terminó con código 0.

| Control                             | Resultado                                           |
| ----------------------------------- | --------------------------------------------------- |
| ESLint / Prettier                   | Correctos, sin advertencias                         |
| Frontend (Vitest + Testing Library) | 134 pruebas correctas, 51 archivos                  |
| Backend HTTP y configuración        | 44 pruebas correctas                                |
| Prisma validate / build completo    | Correctos, sin migraciones nuevas                   |
| Integración SQL y auth con WASM     | 67 pruebas correctas, incluidas las 2 de esta clase |

Chrome headless recorrió catálogo → clase → enlace directo/recarga → catálogo con sesión USER,
API y PostgreSQL WASM reales locales. Se comprobó el objetivo, la identidad editorial y el foco;
390/1280 px en claro/oscuro no tuvieron desbordamiento horizontal. Hubo cero errores de ejecución,
cero llamadas de cámara y cero escrituras en LessonProgress/ExerciseProgress. Evidencias locales
ignoradas por Git: `.local/first-lesson-review/results.json`, cuatro capturas en ese directorio
y `.local/first-lesson-verify.log`. No se ejecutó ni se comprobó GitHub Actions.

Para Fase 2 quedan la revisión local del texto, la decisión editorial y publicación autorizada de
contenidos, materiales visuales validados y un contrato editorial más estructurado si resulta necesario.
XP, cuestionarios, corrección automática, cámara y reconocimiento LSV siguen fuera de esta entrega.

## Archivos de la entrega

Nuevos:

- `Frontend/src/features/student/lesson/StudentLesson.jsx`: página protegida de lectura.
- `Frontend/src/features/student/lesson/LessonReading.jsx`: objetivo y texto plano accesible.
- `Frontend/src/features/student/lesson/LessonNavigation.jsx`: índice y anterior/siguiente por IDs.
- `Backend/content/lsv-introduction.txt`: borrador educativo versionado.
- `Backend/scripts/learning/seed-introduction.js`: inserción de contenido en la base aislada.
- `Backend/scripts/learning-demo.js`: procedimiento local completo y cierre reversible.
- `Frontend/src/test/student-lesson-fixture.jsx`: transporte simulado identificado.
- `Frontend/src/test/student-lesson-navigation.test.jsx`: recorrido, títulos repetidos y enlace directo.
- `Frontend/src/test/student-lesson-states.test.jsx`: carga, error, reintento, ausencia, cancelación y texto seguro.
- `Frontend/src/test/student-lesson-session.test.jsx`: login con retorno y destinos internos autorizados.
- `Backend/tests/auth/first-lesson.test.js`: persistencia/consulta local y filtrado de publicaciones.
- `docs/first-lesson.md`: alcance, contenido, carga, verificación e inventario.

Modificados:

- `Frontend/src/features/student/student.routes.jsx`: ruta de lectura bajo el layout existente.
- `Frontend/src/features/student/layout/use-student-actions.js`: apertura por IDs del catálogo real.
- `Frontend/src/features/student/components/ModuleCard.jsx`: pasa el módulo a la acción de navegación.
- `Frontend/src/features/student/components/StudentHero.jsx`: destino por módulo y texto de lectura.
- `Frontend/src/features/student/components/LessonPreview.jsx`: apertura de la lección por sus IDs.
- `Frontend/src/features/student/pages/StudentHome.jsx`: conserva el módulo de la lección sugerida.
- `Frontend/src/features/auth/return-path.js`: permite el nuevo destino interno USER tras login.
- `Frontend/src/test/student-role.test.jsx`: cubre sesión y rol para la nueva ruta.
- `package.json` y `Backend/package.json`: comando `learning:demo`, sin nuevas dependencias.
- `README.md`, `docs/architecture.md` y `docs/development.md`: enlaces y estado actualizado.
