# Verificación

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
