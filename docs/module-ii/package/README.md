# Voces Silentes — Módulo II

Plataforma educativa con React, Tailwind CSS, Express, Prisma y PostgreSQL.
La entrega contiene el código actualizado, SQL reproducible, configuración de ejemplo y pruebas.

## Contenido

- `proyecto/`: frontend, backend, migraciones, pruebas y documentación técnica.
- `01_schema.sql`: estructura completa para una base nueva y aislada.
- `02_seed.sql`: 50 registros académicos relacionados, cinco por tabla salvo ReportEvidence.
- `03_verificacion.sql`: consulta de estructura, relaciones y datos de la reconstrucción aislada.
- `04_verificacion_supabase.sql`: consulta de los datos académicos dentro de la base de desarrollo.
- `05_storage_supabase.sql`: configuración de los buckets privados; exclusivamente para Supabase.
- `DATOS-DEL-ESTUDIANTE.txt`: identificación de la estudiante y credenciales públicas de la demo local.
- `PRUEBAS.md` y `pruebas/`: resultados y evidencias de las comprobaciones realizadas.
- `ARCHIVOS-FUENTE.txt`: inventario del código incluido.

Las dependencias se instalan con pnpm; los builds y la configuración privada se preparan en el equipo de ejecución.

## Inicio rápido sin credenciales externas

Instalar Node **22.23.4** y pnpm **10.18.2**. Abrir PowerShell en `proyecto/`:

```powershell
pnpm install --frozen-lockfile
pnpm db:generate
pnpm academic:demo
```

Abrir `http://localhost:5280`. El puerto debe estar libre. `Ctrl+C` detiene los procesos de esta demo.
La demo reconstruye PostgreSQL WASM en memoria y ejecuta la API real con PrismaPg por TCP.
No lee `.env` ni usa Supabase; los cambios desaparecen al salir. Las imágenes se conservan en un
almacenamiento local de prueba identificado como tal, que permite comprobar archivos y permisos.

| Rol   | Correo de demostración local |
| ----- | ---------------------------- |
| ADMIN | `academic_1@example.invalid` |
| USER  | `academic_2@example.invalid` |

Contraseña pública: **Solo practica local 2026!**. No utilizarla en cuentas reales.

## Funciones conectadas

ADMIN dispone de dashboard con recuentos globales, gestión de usuarios, desactivación/reactivación,
borrado lógico, consulta y resolución/reapertura de reportes, visor de imágenes y bitácora.
Ambos roles pueden cambiar su contraseña y guardar o quitar su foto; USER puede editar su perfil
y enviar reportes con imagen opcional. Los cambios se confirman en backend y se conservan al recargar.
Desactivar revoca sesiones; reactivar exige iniciar sesión nuevamente. Se protege el último ADMIN activo.

Las lecciones no se amplían en esta versión. El catálogo académico es sintético; la actividad manual
no acredita dominio de LSV ni reconocimiento por cámara. OAuth, recuperación y envío de correo no están implementados.

## PostgreSQL y Supabase

La base Supabase de desarrollo ya recibió los 50 registros académicos, conservando los existentes.
Se encuentran en **Table Editor → esquema `vocessilentes`**, no en Supabase Auth. Las cuentas del
seed quedaron desactivadas en remoto por utilizar una contraseña pública. Sus sesiones están
revocadas y sus identidades externas son fixtures relacionales, no identidades OAuth verificadas.
ReportEvidence queda vacío en el seed para no representar objetos S3 inexistentes.

Para usar una base persistente propia, seguir [instalación y configuración](proyecto/docs/development.md).
El backend requiere secretos privados de PostgreSQL/S3 que no forman parte de esta entrega.
El certificado CA incluido es público y permite verificar TLS hacia Supabase.

`01_schema.sql`, `02_seed.sql` y `03_verificacion.sql` se ejecutan en orden **solo en una base nueva
y aislada**. El seed exige tablas vacías. Ese snapshot no incluye historial Prisma: no ejecutar
`prisma migrate deploy` encima. En una base administrada por Prisma se utilizan las migraciones de
`proyecto/Backend/prisma/migrations/`; no se vuelve a aplicar el snapshot.
`04_verificacion_supabase.sql` es de solo lectura. El archivo 05 configura Storage de Supabase y
no debe ejecutarse en PostgreSQL genérico ni sin revisar y autorizar el destino.

## Controles

Desde `proyecto/`:

```powershell
pnpm verify
pnpm academic:verify
```

El primer comando comprueba lint, formato, pruebas, Prisma y build. El segundo necesita Chrome y
comprueba los formularios en otra base efímera sin seed. Los resultados incluidos distinguen esas
pruebas de la comprobación realizada contra Supabase/S3 reales. No acreditan un despliegue publicado.
