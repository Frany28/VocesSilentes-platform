# Verificación

## URL pública de API y comprobación de Vercel — 9 de octubre de 2026

El usuario confirmó `https://voces-silentes-platform.vercel.app/`. Se añadió la variable pública
`VITE_API_URL=https://voces-silentes-platform.vercel.app/api` a netlify.toml y se reconstruyó
Frontend/dist con ese valor. El build terminó con **código 0**; el bundle incluye la URL confirmada
y conserva `_redirects`. Formato y `git diff --check` correctos. No cambiaron código ni dependencias;
la ejecución completa de 121 pruebas de la corrección anterior sigue siendo aplicable.

Comprobación pública: health sin Origin **200** con el contrato esperado; health, preflight login
y me con Origin Netlify **403**. Sin Origin, me devuelve **401 UNAUTHENTICATED** y csrf **200**
con cookies HttpOnly, SameSite=Lax y sin Secure. Se registraron únicamente estados y atributos,
nunca valores de cookies/tokens. No se enviaron credenciales ni se hicieron escrituras PostgreSQL.

`pnpm vercel whoami` indicó sesión cerrada; no hay proyecto local vinculado ni token de entorno.
No se modificó configuración remota ni se publicó un deploy. Quedan pendientes CORS_ORIGINS,
NODE_ENV=production, SESSION_SAME_SITE=none y un CSRF_SECRET privado válido en Vercel, con nuevo
deploy backend; después publicar el frontend actualizado. Los pasos están en [netlify.md](netlify.md).

## Inicio público y rutas de Netlify — 9 de octubre de 2026

La revisión pública de `https://vocessilentes.netlify.app/` obtuvo HTML 200 y el bundle
`index-mgXqYp4N.js`, que contiene la pantalla técnica y las rutas login/student. Las solicitudes
directas `/login` y `/student` devolvieron **404** de Netlify. El entorno público compilado no incluye
VITE_API_URL y conserva el fallback localhost:3000/api. No se consultaron credenciales ni datos privados.

Se cambió `/` para redirigir a `/login`, se actualizaron las pruebas existentes de inicio/tema
y se añadió `Frontend/public/_redirects`, copiado correctamente a `Frontend/dist/_redirects`.
`netlify.toml` fija el build del frontend desde la raíz y la carpeta publicada Frontend/dist.
`pnpm verify` terminó con **código 0**: lint/formato, **57 pruebas frontend**, **34 backend**,
**30 de integración SQL aislada** (121 en total), Prisma validate y ambos builds correctos.

No se publicó un nuevo deploy ni se modificaron ajustes de la cuenta Netlify. El sitio remoto
conservará el comportamiento anterior hasta publicar estos cambios. La URL pública real del backend
debe configurarse como VITE_API_URL durante el build; ver [netlify.md](netlify.md).
No se ejecutó GitHub Actions ni db:check remoto para esta corrección de frontend.

## Preparación del backend para Vercel — 9 de octubre de 2026

Windows, Node **22.23.1**, pnpm **10.18.2**. `pnpm verify` terminó con **código 0**:
lint sin errores/advertencias, formato, **57 pruebas frontend**, **34 backend** y
**30 de integración SQL aislada** (121 en total), Prisma validate y ambos builds correctos.
El primer intento dentro del sandbox terminó en `spawn EPERM` al iniciar pruebas; la ejecución
con permisos de procesos completó todos los controles. No fue un fallo de la aplicación.

La CLI instalada responde como **63.1.2**. El detector oficial `@vercel/express` seleccionó
`Backend/app.js`, y el análisis local `@vercel/nft` incluye `generated/client.js` y el binding Argon2
de Windows, sin archivos `.env`. El análisis informa cinco referencias opcionales/no aplicables a
Node (`pg-native`, `supports-color`, `cloudflare:sockets`, `bufferutil`, `utf-8-validate`);
no se añadieron dependencias que la aplicación no usa. El build Linux del binding sigue pendiente.

Dos pruebas nuevas ejecutan la entrada real aislada: rutas, CORS/preflight, errores, cookies Secure
y SameSite=None detrás del proxy Vercel; fuera de Vercel, headers arbitrarios no permiten auth HTTP.
Otra prueba usa PostgreSQL WASM por TCP para comprobar la consulta y cierre del pool externo Vercel.
`pnpm db:check` completó SELECT 1 contra la conexión privada existente, sin cambios de datos.

No se vincularon cuentas/proyectos ni se publicaron despliegues. No se ejecutaron `vercel build`
vinculado ni GitHub Actions; configuración remota, TLS, cookies reales y permisos de producción
deben comprobarse al seguir [vercel.md](vercel.md). Se conservaron los cambios existentes del frontend.

## Migración del login a Tailwind — 9 de octubre de 2026

Verificación local: `pnpm lint`, `pnpm format:check`, las **45 pruebas frontend** y
`pnpm --filter @vocessilentes/frontend build` terminaron con código 0.
Esta revisión modifica presentación y aliases visuales; no cambia autenticación ni dependencias.
No se repitieron los controles backend/SQL/Prisma de la entrega anterior ni GitHub Actions.

Se volvieron a capturar ambos temas a **1440/834/390/320 px**. Las posiciones y dimensiones
de cabecera, tarjeta, campos, footer, panel, emblema e icono de contraseña coinciden con las
mediciones anteriores a Tailwind en las ocho composiciones iniciales.
Se revisaron nuevamente los **48 casos** de errores/carga/429: sin overflow horizontal
ni textos recortados; el texto largo a 320 px conserva el crecimiento de la tarjeta.
Se comprobaron recursos originales y fuentes, las ocho capas de movimiento reducido y
el foco visible por teclado. Evidencia local ignorada en `.local/login-*.png` y JSON,
con mediciones previas en `login-geometry-before-tailwind.json` y `login-states-before-tailwind.json`.

## Inicio de sesión de Figma — 9 de octubre de 2026

Windows, Node **22.23.1**, pnpm **10.18.2**. `pnpm verify` terminó con **código 0**:
lint sin errores/advertencias, formato, **45 pruebas frontend**, **32 backend** y
**29 de integración SQL aislada** (106 en total), Prisma validate y build correctos.
Se añadieron 12 casos frontend relevantes y se ajustaron los selectores existentes al texto de Figma.
No se alteraron backend, modelos, migraciones, dependencias ni lockfile; no se ejecutó db:check remoto.
Tras el último ajuste accesible se volvió a comprobar frontend/lint; los cambios finales de documentación
pasaron format:check. Los controles remotos de GitHub Actions no se ejecutaron.

Se compararon capturas de la pantalla contra Figma en ambos temas a **1440, 834 y 390 px**.
Escritorio inicial: tarjeta 480 × 630 en (168,154), panel 600 × 912 en (816,24).
Tablet: tarjeta 480 × 630 en (177,157), franja 770 × 110.
Móvil: tarjeta 342 × 592, con padding exterior de 24 px; el tema oscuro conserva su marca de 36 px.
Se corrigieron la precedencia del borde de error, la cabecera móvil, el tamaño del isotipo oscuro,
la sombra de la vista previa y el ancho de 148 px del título de alerta.

Se revisaron **48 combinaciones** de seis estados (vacíos, correo inválido, credenciales, conexión,
carga y 429), dos temas y cuatro anchos (**1440/834/390/320**): sin desbordamientos horizontales
ni texto recortado. Los errores se capturaron a la altura de sus frames originales para evitar que
la barra de desplazamiento de Windows redujera el área de comparación. Texto largo a 320 × 568
permitió crecimiento de la tarjeta a 1138 px y de la página a 1392 px sin overflow horizontal.

Auditoría de **46 slots visibles** en las composiciones iniciales: recursos con contenido,
imágenes decodificadas y geometría comprobada, fuentes Manrope/Inter cargadas.
Se verificaron el control Eye normal y sus estados disabled en las capturas de carga.
Movimiento normal: gradientes, órbitas, emblema y etiquetas en ciclos de 8 s; entrada de tarjeta
una sola vez. Movimiento reducido: ninguna animación activa en las ocho capas inspeccionadas.
Tab enfocó el selector de tema con contorno sólido visible.

Evidencia local ignorada: `.local/login-*.png`, `login-geometry.json`, `login-states.json`,
`login-assets.json` y `login-motion.json`. Los estados de API en capturas y pruebas frontend
usan dobles explícitos; no prueban una sesión de navegador contra Supabase. La integración
SQL existente sí ejecutó Express, Argon2 y Prisma sobre PostgreSQL WASM aislado.
No se crearon cuentas ni sesiones de prueba en la base compartida.

Los límites de CORS/Retry-After y de la exportación del grosor de órbitas, el selector móvil añadido
y las diferencias tipográficas están documentados en [login.md](login.md).
La primera ejecución de Vite/Vitest encontró EPERM del sandbox; la ejecución autorizada pasó.
Se usaron Vite en 5181 con caché aislada y Brave headless con perfil independiente,
conservando los procesos de desarrollo que ya existían. No hubo publicación ni despliegue.

## Componentes generales de Figma — 9 de octubre de 2026

Verificación local en Windows con Node **22.23.1** y pnpm **10.18.2**.
`pnpm verify` terminó con **código 0**: lint sin errores/advertencias, formato correcto,
**33 pruebas frontend**, **32 backend** y **29 de integración SQL aislada** (94 en total),
Prisma validate, build frontend, sintaxis backend y generación/compilación Prisma correctos.
No se modificaron contratos API, lógica backend, dependencias ni el lockfile. No se ejecutaron
db:check ni migraciones ni pruebas contra PostgreSQL remoto para esta tarea de UI.

Galería en `/ui.html`, servida en localhost:5180 para esta revisión, sin proveedores de auth ni API.
El build solo contiene index.html: no se incluyeron la entrada, componentes ni rutas de galería.
Se comprobaron diez component sets frente a capturas originales de Figma, ambos temas, con
viewport 1776 px y escala 1, esperando fuentes Manrope/Inter y recursos. Dimensiones de todas
las variantes coinciden con la referencia; se corrigieron precedencia de estilos de Button,
altura de Input y anchura del track de Progress. A 375 px, documento y controles sin desbordamientos.
Los 36 SVG locales originales tienen contenido y dimensiones nativas correctas en sus slots;
el navegador renderizó 64 slots de iconos. prefers-reduced-motion produce transition-duration:0s.

Evidencia local ignorada: `.local/figma-0.png` a `figma-9.png`, `gallery-0.png` a `gallery-9.png`,
`gallery-mobile.png`, `ui-geometry.json`, `ui-mobile.json` y `ui-assets.json`.
Las capturas se revisaron visualmente, sin afirmar identidad píxel por píxel. Persisten diferencias
de rasterización tipográfica entre Figma y Windows/Chromium; el foco añadido al botón secundario
y la extensión PasswordInput están documentados en [design-system.md](design-system.md).
Figma permite consultar diseño/variables, pero Code Connect está bloqueado por el plan educativo;
se documentó una correspondencia manual, sin afirmar que no existan conexiones previas.

La primera ejecución de Vite/Vitest falló por EPERM del sandbox de Windows; los mismos comandos
completaron correctamente con ejecución autorizada de subprocesos, sin cambiar configuración para
ocultar el fallo. Se usó Brave headless con perfil temporal independiente para las capturas.
GitHub Actions no se ejecutó ni comprobó remotamente; no hay commits ni publicación en esta entrega.

## Autenticación — 9 de octubre de 2026

Ejecutada localmente en Windows, Node **22.23.1** y pnpm **10.18.2**. No se modificó el esquema,
se aplicaron migraciones nuevas ni se insertaron fixtures/administradores en Supabase.
`pnpm verify` completo terminó con **código 0**, sin errores ni advertencias de lint.

| Control                               | Resultado observado                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Lint                                  | Correcto, sin errores ni advertencias                                                                |
| Backend (`test`)                      | 32 pruebas aprobadas: incluye configuración auth y HTTPS/proxies/cookies de producción               |
| Frontend (`test`)                     | 23 pruebas aprobadas en 7 archivos: formularios, guards, red, logout, CSRF y respuestas tardías      |
| Integración aislada (`db:test`)       | 29 pruebas aprobadas: 13 SQL existentes + 16 auth HTTP/PrismaPg/Argon2id reales                      |
| PostgreSQL remoto (`db:check`)        | SELECT 1 correcto con la conexión runtime privada                                                    |
| Historial (`db:status`, `db:inspect`) | Una migración finalizada: 20261009000100_phase_one; schema up to date; nueve tablas en vocessilentes |
| Lectura Prisma remota                 | Transacción READ ONLY: User y Session con cero filas                                                 |
| Arranque HTTP con DB real             | Servicio auth inicializado; health 200, me sin cookie 401, csrf 200; sin escrituras                  |

Formato, Prisma validate, generación/compilación del cliente 7.10.0, sintaxis del backend y build
frontend correctos. `pnpm install --frozen-lockfile --offline` terminó con código 0, sin cambios
del lockfile. `git diff --check` correcto. Total: **84 pruebas aprobadas**. La verificación agregada
detectó primero formato en un test de formulario; se aplicó Prettier y el control final completo pasó.

Las pruebas aisladas ejecutan las migraciones versionadas en PGlite **0.5.8 / PostgreSQL 18.3**,
exponen protocolo PostgreSQL por TCP loopback y usan **Prisma 7.10.0, PrismaPg/pg y Argon2 nativo**.
Registro válido/concurrente, duplicados, campos privilegiados, contraseña exacta/Unicode, login y
estados de cuenta, intentos concurrentes, cookies y hash de sesión, expiración/revocación/logout,
401/403/ADMIN, cambio de rol/estado después de login, CSRF anónimo/rotación/cookies obsoletas,
CORS con credenciales, límites IP/IP+correo y ausencia de campos sensibles están cubiertos.
La ruta administrativa de prueba y sus cuentas existen exclusivamente en la base efímera.

Frontend usa fetch controlado en jsdom, no conexiones remotas ni cookies reales de navegador.
Prueba ocultación durante me, 401 frente a 403/red, retornos internos, formularios y AbortSignal,
logout fallido/satisfactorio y descarte de me/401 tardíos después de cancelación/autenticación.
Las pruebas de configuración/transporte de producción simulan un proxy permitido por loopback;
no son una validación del TLS/proxy de un despliegue real.

La base compartida **PostgreSQL 17.11** se comprobó solo con lectura y arranque del servicio.
No se probó registro/login de una persona real en Supabase ni se afirma una sesión remota real.
Una comprobación inicial de lectura no finalizó; la repetición con timeout de transacción de
15 segundos completó ambas consultas y el arranque HTTP. No se imprimieron errores internos.
Los subprocesos Vite inicialmente bloqueados por EPERM completaron la ejecución autorizada.

Producción pendiente: HTTPS y proxy real, CSRF_SECRET privado persistente/compartido, CORS HTTPS
exacto y SameSite según sitio; medir capacidad Argon2 y acordar limitación compartida antes de
varias réplicas. MemoryStore es por proceso; no hay bloqueo automático global, MFA, filtro de
contraseñas filtradas, correo/recuperación ni purga de sesiones. PGlite es una conexión y versión
18.3; no valida concurrencia multiworker de PostgreSQL 17, TLS ni navegador real. No se ejecutó
GitHub Actions remotamente ni se publicó la aplicación. Procedimiento del primer administrador
documentado y no ejecutado: [authentication.md](authentication.md).

## Histórico: fase 1 de datos — 9 de octubre de 2026

Ejecutada localmente en Windows con Node **22.23.1** y pnpm **10.18.2**.
`pnpm verify` completo terminó con **código 0**, sin errores ni advertencias de lint.

| Control                      | Resultado observado                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Lint / formato               | Correctos                                                                                                                 |
| Backend                      | 28 pruebas aprobadas: 25 existentes y 3 de configuración de migraciones                                                   |
| Frontend                     | 11 pruebas aprobadas en 2 archivos                                                                                        |
| SQL aislado (`db:test`)      | 13 pruebas aprobadas; PGlite 0.5.8 / PostgreSQL 18.3 WASM en memoria                                                      |
| Prisma validate              | Válidos los cuatro dominios del esquema con nueve entidades                                                               |
| Prisma generate              | Cliente 7.10.0 generado y compilado a JavaScript ESM                                                                      |
| Build                        | Frontend, sintaxis backend y generación/compilación Prisma correctos                                                      |
| PostgreSQL real (`db:check`) | SELECT 1 correcto con PrismaPg y DATABASE_URL Transaction 6543                                                            |
| Inspección previa            | PostgreSQL 17.11; sin tablas de aplicación ni historial Prisma; lectura sin modificaciones                                |
| Identificación del destino   | DIRECT_URL Session 5432 coincide en host, usuario y base con runtime; usuario confirmó desarrollo del proyecto            |
| Aplicación                   | `20261009000100_phase_one` aplicada mediante Prisma migrate deploy, sin shadow                                            |
| Historial real               | Una migración finalizada, sin rollback; `_prisma_migrations` en vocessilentes                                             |
| Estado Prisma                | `db:status`: schema is up to date                                                                                         |
| Catálogo real                | Nueve tablas de aplicación, 27 CHECK, 13 FK; todas las FK RESTRICT/CASCADE                                                |
| Seguridad real               | RLS en las nueve tablas, cero políticas; anon/authenticated/service_role sin USAGE/CREATE de esquema ni permisos de tabla |
| Lectura real con Prisma      | count() de las nueve entidades mediante PrismaPg/Transaction: todas con cero filas                                        |
| Revisión Git                 | `git diff --check` correcto; sin commits ni publicación                                                                   |

La migración se generó con `migrate diff --from-empty --to-schema prisma --script --output ...`,
se revisó y se probó antes de deploy. Es aditiva y no insertó usuarios, administradores ni contenido.
Las verificaciones de catálogo y count() se ejecutaron dentro de transacciones READ ONLY.
Las pruebas de restricciones y permisos ejecutan el SQL versionado exclusivamente en memoria:
unicidad, normalización, FK, estados con NULL, fechas, contexto de reportes, reapertura, persistencia
del progreso ante eliminación lógica, RESTRICT y denegación para roles equivalentes de Data API.

El sandbox bloqueó inicialmente subprocesos con EPERM; la ejecución autorizada completó Prisma,
pruebas y builds. La instalación de PGlite necesitó descarga porque no estaba en la caché offline.
Se corrigieron parámetros SQL de fixtures con tipos explícitos y el SQLSTATE esperado para RESTRICT
del motor aislado antes de ejecutar la verificación final. No se modificaron controles para ocultar fallos.

Límites pendientes:

- El PDF mencionado no estaba accesible; se implementaron las decisiones explícitas del texto adjunto.
- No se obtuvo la lista de esquemas expuestos de Data API desde SQL; pgrst.db_schemas estaba ausente.
  Sí se verificaron revocaciones reales y RLS, sin políticas de acceso público.
- PGlite usa PostgreSQL 18.3 y la base remota usa 17.11. Las pruebas de escrituras son aisladas;
  el catálogo y las lecturas Prisma se comprobaron realmente en remoto, sin escrituras de fixtures.
- GitHub Actions no se ejecutó ni se comprobó remotamente en esta tarea.
- No hay endpoints nuevos, autenticación completa, reglas de bloqueo, OAuth ni reconocimiento LSV.

Reproducir controles con `pnpm verify`; conectividad y lectura de historial requieren entorno privado:
`pnpm db:check`, `pnpm db:inspect`, `pnpm db:status`. Ver [migraciones](migrations.md).

## Histórico: preparación de la base inicial

Ejecutada localmente en Windows el **9 de octubre de 2026**, Node **22.23.1** y pnpm **10.18.2**.

| Control                                 | Resultado observado                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| Instalación pnpm                        | Correcta, dependencias fijadas sin conflictos forzados                                |
| Instalación frozen-lockfile desde caché | Correcta, sin modificar el único lockfile                                             |
| Lint                                    | Correcto, sin errores ni advertencias                                                 |
| Prettier                                | Formato aplicado y format:check correcto                                              |
| Backend                                 | 25 pruebas aprobadas con node:test y Supertest, sin PostgreSQL                        |
| Frontend                                | 11 pruebas aprobadas en 2 archivos con Vitest y Testing Library                       |
| Prisma validate                         | Esquema válido, sin entidades ni conexión a PostgreSQL                                |
| Prisma generate                         | Cliente 7.10.0 generado con esquema sin entidades y compilado a JavaScript ESM        |
| Cliente generado                        | Importado e instanciado con PrismaPg; desconectado sin abrir conexión                 |
| Build                                   | Frontend compilado; sintaxis backend y generación Prisma correctas                    |
| Arranque conjunto                       | pnpm dev inicia API en 3000 y Vite en 5175 con variables temporales                   |
| Comprobación HTTP real                  | Frontend 200, health 200, CORS exacto 5175 y ruta desconocida 404                     |
| Cierre                                  | Ctrl+C produjo log de cierre del backend; pruebas verifican cierre HTTP y desconexión |

Los puertos 5173 y después 5174 estaban ocupados por un Vite existente de este mismo workspace.
Se conservó ese proceso. Se agregó FRONTEND_PORT configurable y se usó 5175 solo para la comprobación
conjunta, con CORS_ORIGINS temporal correspondiente. Los `.env` locales, ignorados por Git, usan 5174;
los ejemplos usan 5173. El proceso iniciado para comprobar 5175 se detuvo al terminar.

El sandbox de Windows bloqueó inicialmente subprocesos de Vite con EPERM. Tests y build se ejecutaron
con acceso autorizado a esos procesos, sin cambiar reglas de lint ni forzar dependencias.
Las pruebas detectaron una URL inválida que escapaba de safeParse; se corrigió la validación
y los controles posteriores pasaron.

### No comprobado en la preparación inicial

- PostgreSQL: no hay DATABASE_URL de desarrollo configurada ni psql disponible en PATH.
  No se conectó a una base real ni se ejecutaron migraciones. Generación/instanciación no prueban conexión.
- Migraciones: no existen modelos aprobados ni SQL. El comando está preparado para una etapa posterior.
- MediaPipe: paquete instalado; no se descargaron modelos, activó cámara ni ejecutó inferencia.
  No existe reconocimiento LSV ni un modelo específico validado.
- Figma: sin referencia accesible; los estilos siguen siendo provisionales del navegador.
- GitHub Actions: workflow creado para Linux/Windows, sin despliegue. No se ejecutó remotamente.
  La carpeta inicial no contenía `.git`; no se creó historial, commit, PR ni publicación.
- Comprobación visual en navegador: cubierta funcionalmente con jsdom y HTTP; no se realizó
  validación de píxeles, contraste de un diseño aprobado ni cámara física.

`pnpm verify` completo terminó correctamente con código de salida 0.
Reproducción sin PostgreSQL: `pnpm install --frozen-lockfile` y `pnpm verify`.
Con una base de desarrollo configurada: `pnpm db:generate` y `pnpm db:check`.
