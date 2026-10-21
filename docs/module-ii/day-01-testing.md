# Verificación del Día 1

Controles locales del 20 de octubre de 2026, Windows, Node 22.23.1 y pnpm 10.18.2.
GitHub Actions y despliegues remotos no ejecutados. No se aplican migraciones ni fixtures a Supabase.

## Comandos y resultados

| Comando                                                    | Resultado real                                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `node Backend/scripts/prepare-module-ii-sql.js`            | Generó snapshot y credenciales sintéticas locales; sin conexiones                                    |
| `node --test Backend/tests/database/module-ii-sql.test.js` | 1 prueba aprobada: reconstrucción completa, seed y recuentos                                         |
| `pnpm db:generate`                                         | Cliente Prisma 7.10 generado y compilado a ESM                                                       |
| Pruebas ADMIN seleccionadas                                | Detectaron una dependencia de orden en un fixture nuevo; se corrigió separando su base               |
| Pruebas de eliminación/invariantes repetidas               | 3 aprobadas, incluyendo degradación concurrente y actor eliminado                                    |
| `pnpm --filter @vocessilentes/frontend test`               | 89 pruebas aprobadas, 29 archivos, tras corregir soporte de query                                    |
| `pnpm verify`                                              | Código 0: lint sin advertencias, formato, 89 frontend, 34 backend, Prisma, builds y 43 SQL aprobados |
| `pnpm db:check`                                            | Código 0: SELECT 1 real, sin escrituras ni verificación del esquema remoto                           |
| `git diff --check`                                         | Código 0: sin errores de espacios                                                                    |

El sandbox bloqueó inicialmente subprocesos de node:test/esbuild con EPERM. Las repeticiones
con ejecución autorizada funcionaron; no se cambiaron reglas ni se omitieron pruebas.
La primera ejecución UI detectó INVALID_PATH: requestJson no aceptaba query en path. Se añadió
`options.query` codificado y una prueba que verifica origen/ruta, preservación de valores y aislamiento
de parámetros. La prueba de doble envío se ajustó al nombre accesible de carga del botón existente.

## Cobertura y evidencias

Tras verify se añadieron dos aserciones de body vacío a la prueba ADMIN existente. Se ejecutó
`node --test Backend/tests/auth/admin-validation.test.js`: **2 pruebas aprobadas** con esas aserciones.
Se retiró además un BOM de AdminUsers.jsx y se repitieron lint, formato y diff; sin cambios
de comportamiento posteriores en la aplicación.

- Crear/editar: se conservan pruebas reales de campos faltantes, correo/username inválidos,
  duplicados canónicos, UUID incorrecto/inexistente, hash real, cambios y verificación de correo.
- Nuevas rutas: anónimo 401, USER 403, CSRF obligatorio en DELETE; parámetros extra, roles
  inválidos y paginación fuera de límites devuelven 400. No hay mutación HTTP de AuditLog.
- PostgreSQL: listado paginado sin duplicación entre páginas, búsqueda por los cuatro campos,
  filtro de rol, exclusión de eliminados y respuestas sin credenciales.
- Eliminación: se conservan usuario/reportes, se revocan varias sesiones, se impide me/login,
  se rechaza repetir/editar y se protege el último ADMIN con el bloqueo administrativo.
- Auditoría: se leen filas reales por Prisma, tres operaciones ordenadas y actor correcto,
  sin valores sensibles. Conflictos no crean eventos; fallo SQL de auditoría revierte creación,
  edición, eliminación y revocación, sin mocks de persistencia.
- Integridad SQL: FK del actor, tipo de entidad, enum, nulabilidad y conservación tras borrado
  lógico; batería existente de UNIQUE, FK, CHECK, fechas y RESTRICT; RLS en diez tablas y acceso
  denegado a bitácora para roles equivalentes de Data API.
- UI con fetch controlado: carga/error/vacío/reintento, parámetros remotos, cancelación de lectura
  tardía, confirmación/cancelación, doble envío y espera del servidor. No acredita Supabase real.
- SQL académico: snapshot contiene exactamente el historial; ejecución autónoma y cinco filas
  en nueve tablas, excepción ExternalIdentity=0, Argon2id válido y sesiones inutilizables.

Para entrega académica guardar salida de `pnpm verify`, tabla de recuentos del seed y capturas de
listado/búsqueda, error de validación, confirmación de eliminación y consulta ADMIN de bitácora
en una base de desarrollo aislada. No capturar contraseñas, cookies, hashes, tokens ni URLs privadas.
No se han tomado capturas de navegador ni realizado una prueba manual con cuentas reales.

## Límites pendientes

PGlite ejecuta PostgreSQL 18.3 WASM con una conexión por fixture; Promise.all comprueba llamadas
concurrentes del servicio, pero no contención real entre procesos/conexiones PostgreSQL 17.
La nueva migración debe revisarse y aplicarse posteriormente en desarrollo autorizado antes
de comprobar todo el flujo contra ese servidor. El seed académico no proporciona cuentas utilizables.
Las decisiones operativas de retención/purga/restauración y las funciones educativas siguen pendientes.
