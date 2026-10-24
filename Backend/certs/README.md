# CA pública de Supabase

`supabase-root-2021.crt` es el certificado **público** Supabase Root 2021 CA, no una clave privada.
Se descargó por HTTPS el 23 de octubre de 2026 desde la distribución del proveedor:
<https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt>.

Huella SHA-256 DER:
`80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`.
Vence el **26 de abril de 2031**. Sujeto, firma y huella se comprobaron antes de incorporarlo.

El runtime pg y las herramientas Prisma usan `sslmode=verify-full` y este certificado en hosts
Supabase. Una `sslrootcert` explícita conserva la CA configurada por el operador. No se usa
`rejectUnauthorized=false`, no se altera la confianza global del sistema y no se descarga al arrancar.
Vercel incluye el archivo mediante `includeFiles`; el resto de hosts debe conservar esta carpeta.

Ante rotación del proveedor, descargar la CA desde **Database Settings → SSL Configuration**,
verificar origen, vigencia y huella, actualizar el archivo y comprobar runtime y CLI antes de publicar.
[Procedimiento oficial](https://supabase.com/docs/guides/platform/ssl-enforcement).
