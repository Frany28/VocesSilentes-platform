# Instalación y desarrollo

## Requisitos e instalación

Node **22.23.1**, pnpm **10.18.2** y PostgreSQL **17** para persistencia. La demo y `pnpm verify`
no necesitan un servidor PostgreSQL externo. Desde `proyecto/`, en PowerShell:

```powershell
pnpm install --frozen-lockfile
pnpm db:generate
```

Para una demo efímera ejecutar `pnpm academic:demo`. Para desarrollo persistente, copiar los ejemplos
solo si todavía no existen `.env`; no sobrescribir configuración privada:

```powershell
Copy-Item Backend/.env.example Backend/.env
Copy-Item Frontend/.env.example Frontend/.env
```

Frontend usa `VITE_API_URL=http://localhost:3000/api`, `VITE_STUDENT_DEMO=false` y puerto 5173.
VITE_* es público: no poner secretos ahí. Backend usa HOST/PORT, NODE_ENV y CORS_ORIGINS con
orígenes exactos. `DATABASE_URL` es privada para Prisma runtime; `DIRECT_URL` Session/direct es
para migraciones, nunca Transaction 6543. No utilizar SHADOW_DATABASE_URL del mismo destino.
Sin DATABASE_URL funciona health HTTP, pero no la persistencia.

## Base de datos administrada por Prisma

Con una base de desarrollo autorizada, revisar las migraciones antes de aplicar:

```powershell
pnpm db:validate
pnpm db:inspect
pnpm db:migrate
pnpm db:status
pnpm db:check
pnpm dev
```

No usar reset, db push ni modificar migraciones aplicadas. Los scripts SQL de reconstrucción
de la carpeta superior son una alternativa para otra base limpia; no se aplican encima del
historial Prisma ni se ejecutan migraciones Prisma encima de ese snapshot.
El seed académico exige tablas vacías. El comando `academic:prepare` regenera SQL y hashes
locales; no conecta al proveedor y cambia las sales del conjunto regenerado.

## Almacenamiento privado

Configurar exclusivamente en backend S3_ENDPOINT, S3_REGION, s3_access_key_id y s3_secret_access_key,
del mismo proyecto Supabase que PostgreSQL. No se entregan sus valores reales. Después de revisar
el destino, aplicar `Backend/storage/001_report_evidence.sql` y `002_profile_photos.sql` o el archivo
05 de la carpeta superior. Los buckets `report-evidence` y `profile-photos` son privados.
Sin Storage se pueden enviar reportes sin adjunto, pero no guardar imágenes.

La conexión Supabase fuerza TLS con CA y hostname verificados; conservar `Backend/certs/`.
El certificado es público. El runtime espera hasta diez segundos para iniciar una transacción
y quince para completarla. La retirada de una foto dispone de treinta segundos para SQL/S3.

## Comandos y publicación

`pnpm verify` ejecuta lint, formato, 218 pruebas, validación Prisma y build.
`pnpm academic:verify` prueba formularios en Chrome con una base vacía efímera.
`pnpm dev` inicia frontend y backend; `Ctrl+C` detiene sus procesos.
`pnpm db:check` comprueba SELECT 1; GET `/api/health` solo comprueba vida HTTP.

Para publicar, configurar el frontend con la URL HTTPS de la API. Backend requiere NODE_ENV=production,
CSRF_SECRET privado de 64 hex, CORS_ORIGINS exactos y HTTPS. Usar SESSION_SAME_SITE=none únicamente
cuando frontend y API sean sitios distintos; las políticas del navegador pueden bloquear cookies de terceros.
Netlify usa `netlify.toml`; Vercel usa Backend como raíz e incluye el cliente Prisma y la CA pública.
En Vercel los cuerpos admitidos son menores que el máximo de 5 MiB del Express local.

JavaScript ESM con extensiones locales explícitas y JSDoc para contratos relevantes. Se procura
un máximo aproximado de 100 líneas útiles por archivo de código. Los snapshots SQL íntegros y
los keyframes CSS exportados conservan su unidad técnica como excepciones documentadas junto al código.
