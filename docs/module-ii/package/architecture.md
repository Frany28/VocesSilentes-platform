# Arquitectura

El workspace tiene dos aplicaciones y un único lockfile. React/Tailwind presenta formularios;
hooks gestionan estado y clientes de API reutilizan `Frontend/src/lib/http.js`, cookies y AbortSignal.
Los componentes visuales compartidos no gestionan permisos ni realizan negocio.

Express separa rutas, validación Zod, servicios y acceso Prisma. `src/app.js` no abre puertos;
`src/server.js` gestiona arranque, cierre HTTP y desconexión de Prisma. `Backend/app.js` es la
entrada de Vercel. `Backend/prisma/` contiene modelos y migraciones del esquema `vocessilentes`.

## Dominios

- `auth`: registro, login, sesiones opacas, cookies HttpOnly y CSRF firmado.
- `admin`: usuarios, estado, borrado lógico, dashboard y bitácora; exige rol ADMIN vigente.
- `account`: perfil propio, contraseña y fotos; el actor se obtiene de la sesión.
- `reports`: creación idempotente, consulta por propiedad/rol, adjuntos y resolución/reapertura.
- `learning`: lectura del catálogo publicado y actividad manual propia ya implementada.
- `health`: vida HTTP independiente de PostgreSQL.

Las contraseñas se guardan como Argon2id con sal individual; los tokens de sesión como SHA-256.
Las respuestas y logs omiten credenciales, hashes y cuerpos sensibles. Las mutaciones comprueban
CSRF y permisos en backend. Desactivar o eliminar revoca sesiones; el último ADMIN activo se conserva.
Cambiar contraseña verifica la actual y revoca las demás sesiones, conservando la presentada.

Los datos y su evento de auditoría comparten transacción. El dashboard utiliza RepeatableRead y
recuentos globales. Las escrituras administrativas serializan cambios para proteger las reglas de ADMIN.
La conexión a Supabase verifica TLS, CA y hostname; los secretos se mantienen fuera del frontend.

Sharp valida el contenido de JPEG/PNG/WEBP y elimina metadatos. Las fotos se recortan a WEBP 512×512.
Los buckets son privados y las lecturas exigen sesión autorizada. Los enlaces de evidencia expiran
en 120 segundos. SQL y S3 no comparten transacción; las compensaciones reducen archivos sin referencia,
pero una caída del proceso o proveedor puede requerir reconciliación operativa.

Las lecciones conservan el alcance existente. La actividad manual no es evaluación de LSV y
no se activa cámara por defecto. No se implementan OAuth, recuperación de acceso ni envío de correo.
