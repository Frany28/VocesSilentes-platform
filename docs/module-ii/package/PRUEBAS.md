# Resultados de verificación — 23 de octubre de 2026

| Control                    | Resultado                                                                  |
| -------------------------- | -------------------------------------------------------------------------- |
| `pnpm verify`              | Código 0; lint sin advertencias, formato, Prisma y build correctos         |
| Frontend                   | 109 pruebas aprobadas                                                      |
| Backend HTTP/configuración | 44 pruebas aprobadas                                                       |
| SQL y autenticación        | 65 pruebas aprobadas                                                       |
| Total                      | **218 pruebas aprobadas**                                                  |
| Formularios en Chrome      | Cinco usuarios y cinco reportes, edición, borrado lógico y recarga         |
| Adjuntos de reportes       | Cinco PNG locales, visor autorizado, resolución y reapertura               |
| Bitácora                   | 24 eventos consultados en cinco páginas ADMIN                              |
| Presentación existente     | 40 combinaciones, cuatro anchos y ambos temas, sin desbordamiento          |
| Nuevas acciones de cuenta  | Estado, perfil USER, contraseña, foto, recarga y nuevo login               |
| Perfil y seguridad         | 16 combinaciones adicionales sin desbordamiento ni errores JavaScript      |
| Supabase/S3 reales         | Cuenta, foto, reporte con imagen, visor, resolución, dashboard y seguridad |
| Transporte PostgreSQL      | TLS activo y certificado autorizado en runtime y CLI                       |

## Evidencias incluidas

La copia distribuida se extrajo en un directorio independiente y se instalaron sus dependencias
con el lockfile fijo, utilizando la caché local sin descargar paquetes. Desde esa copia pasó
`pnpm verify`: 218 pruebas, lint, formato, Prisma y build. El CSS de producción coincide con el
del proyecto principal. Se comprobaron 1.133 referencias internas sin archivos faltantes y los
659 archivos de frontend/backend comparados coinciden con sus fuentes actuales.
También pasó `pnpm academic:verify` desde esa copia: cinco usuarios, cinco reportes con imágenes,
visor, resolución/reapertura, 24 eventos y 40 combinaciones de presentación sin errores JavaScript.

- `pruebas/resultados-ui.json` y sus capturas: formularios existentes sobre PostgreSQL WASM/TCP
  y almacenamiento local de prueba. `captures` identifica las imágenes de esa ejecución.
- `pruebas/cuentas-ui.json` y `perfil-con-foto.png`: nuevas acciones de cuenta comprobadas en Chrome
  sobre otra base y almacenamiento de prueba. Las cuentas visibles son sintéticas.
- `pruebas/integracion-supabase-s3.json`: comprobación contra servicios remotos reales. Se retiraron
  únicamente los registros y objetos temporales creados por la ejecución, sin alterar datos anteriores.
- `pruebas/supabase-importacion.json` y `supabase-verificacion.json`: importación y consulta de los
  50 registros académicos. Las cuentas públicas de ese conjunto están desactivadas en remoto.

Las pruebas de permisos incluyen sesión ausente, rol insuficiente, CSRF, campos adicionales,
propiedad de archivos, protección del último administrador y revocación de sesiones. Los fallos
deliberados de bitácora comprueban rollback de cambios y conservación de credenciales/fotos.
El límite de intentos devuelve errores JSON consistentes y no altera la contraseña ante fallos.

## Alcance de los datos y límites

El seed contiene cinco registros en cada una de diez tablas: **50 filas**. ReportEvidence tiene
cero porque el SQL no puede entregar objetos S3. Las cinco identidades externas son sintéticas
y las sesiones están vencidas/revocadas. Los cinco eventos del seed están identificados como
sintéticos; los eventos de formularios reales registran al actor autenticado.

La demo y las capturas con almacenamiento local no demuestran S3 remoto; la comprobación remota
está identificada por separado. PostgreSQL WASM tampoco certifica PostgreSQL 17 nativo ni
concurrencia multiworker. No se ejecutaron GitHub Actions ni se publicó un despliegue en esta revisión.
SQL y S3 no comparten transacción; una caída puede requerir reconciliar objetos sin referencia.
En Vercel el límite de cuerpos es inferior a los 5 MiB admitidos por el servidor Express.

Las instrucciones de instalación están en [README.md](README.md) y los contratos actuales en
[proyecto/docs/api.md](proyecto/docs/api.md).
