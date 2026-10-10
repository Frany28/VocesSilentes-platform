# Administración

Referencia: [VocesSilentes / Admin, 218:11858](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=218-11858&m=dev).
Se consultaron mediante el plugin Figma y la skill `figma-design-to-code` las siete pantallas,
las composiciones desktop/tablet/mobile en ambos temas y los estados/confirmaciones.
Code Connect exige un asiento Dev/Full en Organization/Enterprise que la conexión no posee;
la reutilización es manual y no se afirma que falten mappings.

## Pantallas y comportamiento

Todas las rutas `/admin` requieren sesión existente y rol ADMIN. El backend vuelve a comprobar
sesión y rol en cada petición; el guard visual no concede permisos.

| Ruta                       | Función                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| `/admin`                   | Resumen, métricas de demostración y accesos a cuentas/reportes                    |
| `/admin/users`             | Cuentas demo y cuentas reales conocidas, búsqueda, filtro de rol, páginas de tres |
| `/admin/users/new`         | Creación real, validación, errores y bloqueo de doble envío                       |
| `/admin/users/:id`         | Detalle real por UUID o demo por `demo-user-N`                                    |
| `/admin/users/:id/edit`    | Lectura actual y edición de identidad/rol                                         |
| `/admin/users/:id/created` | Consulta de la cuenta guardada, también después de recargar                       |
| `/admin/reports`           | Reportes demo, búsqueda, estado, paginación y estados visuales                    |
| `/admin/reports/:id`       | Contexto, comentario y resolución/reapertura exclusivamente de demostración       |

Se reutilizan Brand, Input, PasswordInput, Button, Icon, Badge, Alert, ThemeToggle y los tokens
existentes. Los nuevos SVG son originales descargados de los assets de get_design_context;
no hay URLs temporales de Figma en el código. Sidebar de 280 px en desktop y 80 px en tablet;
navegación horizontal en móvil. Breakpoints de composición: 1200 y 600 px, como Student.
Se conservan márgenes de 24 px, paneles de 24 px, campos/navegación de 12 px y botones de 16 px.
Claro/oscuro usa el proveedor existente y su preferencia persistida.

Los avisos de procedencia, consulta por UUID y detalles de validación ocupan espacio adicional
respecto al prototipo: no se ocultan para aparentar una integración. El botón Crear queda en flujo,
sin reproducir el solapamiento con el listado presente en la muestra desktop.
El diseño usa nombres de usuario con puntos; el modelo/auth admite únicamente `[a-z0-9_]{3,50}`.
El formulario explica y conserva esa regla, sin ampliar el contrato del registro.

Los diálogos nativos contienen el foco, restauran el foco anterior y permiten Escape salvo durante
logout. Cancelación y navegación por controles del panel confirman descarte de formularios sucios;
cerrar/recargar el navegador usa beforeunload. No se bloquea el historial nativo del navegador.
Las escrituras en curso deshabilitan el formulario y la navegación de sus controles.
El cierre de sesión usa auth.logout existente: un fallo conserva sesión y permite reintento.

## Datos reales y demostración

`data/admin-demo.js` centraliza las 12 cuentas y los 12 reportes de ejemplo. Las métricas derivan
únicamente de esa colección y están marcadas como demostración. Cambiar estado, editar una cuenta
demo, resolver/reabrir y comentar reportes modifica solo memoria; los mensajes explican que no hubo
persistencia. Recargar reinicia esas simulaciones. No hay endpoints nuevos para esas acciones.

El alcance no autoriza un listado backend. Las cuentas creadas/editadas se actualizan con la respuesta
real y se recuerdan **solo por UUID**, con un máximo de 50 IDs por administrador en localStorage.
Al recargar se vuelven a consultar; no se almacenan copias de cuentas, hashes ni contraseñas.
El listado explica que contiene demostración y cuentas conocidas en este navegador; no es el censo de la DB.
Se puede abrir una cuenta existente por UUID, o mediante su enlace de detalle/edición.
Sin localStorage siguen funcionando los enlaces directos; falla únicamente recordar IDs entre recargas.
La actividad educativa de una cuenta real indica que requiere integración, sin inventar progreso.

Las respuestas reales jamás usan la colección demo como fallback ante errores. La creación no muestra
éxito antes del 201, y la edición no lo muestra antes del 200. Los errores preservan datos para corregir
y reintentar; no hay reintentos automáticos de escrituras. AbortSignal evita aplicar respuestas tardías.
Solo en desarrollo hay un selector explícito para previsualizar carga, error y vacío de las demos.

## Backend y reglas de datos

Se reutilizan Prisma y su conexión configurada. No se cambió esquema ni se aplicaron migraciones.
`modules/admin/` separa rutas, controller, Zod, service, repository y proyección permitida del usuario.
Crear/editar exige sesión ADMIN, transporte de auth y CSRF compartido con los endpoints existentes;
las respuestas llevan `Cache-Control: no-store`. No se crea otra autenticación ni otra cookie.

Creación exige firstName, username, email, password, role (`USER`/`ADMIN`) e isActive booleano.
lastName es opcional y nullable. Se reutilizan identidad, normalización y Argon2id de auth.
Por solicitud del usuario, crear desde Admin permite 8–128 caracteres Unicode, hasta 512 bytes;
exige al menos una letra mayúscula Unicode y un signo de puntuación/símbolo (por ejemplo !, @ o #).
Los espacios no satisfacen el requisito de carácter especial. El frontend muestra requisitos y
errores junto al campo, y Zod vuelve a comprobarlos en el servidor.
No se recorta ni normaliza la contraseña. Esto reemplaza el mínimo de 15 del diseño para este flujo;
el registro público conserva su mínimo de 15. Login admite las cuentas creadas con ambos mínimos.
El correo empieza con emailVerified=false, también para administradores. No se crea sesión para la cuenta.
Estado inicial inactivo impide entrar según las comprobaciones existentes de auth.

Edición admite exclusivamente firstName, lastName, username, email y role; los campos principales/rol
son obligatorios. No admite password, passwordHash, isActive, emailVerified ni propiedades arbitrarias.
lastName vacío se representa como null. Cambiar el correo canónico restablece emailVerified=false;
mantenerlo conserva su valor. No se envía correo porque el proyecto aún no tiene ese flujo.
Los UNIQUE existentes incluyen cuentas eliminadas y resuelven también conflictos concurrentes;
actualizar una cuenta con su propio correo/username no genera un conflicto.
Al enviar, PostgreSQL comprueba unicidad; tras un conflicto se consultan solo los identificadores
necesarios, excluyendo la cuenta editada. El endpoint ADMIN devuelve 409 EMAIL_IN_USE,
USERNAME_IN_USE o ACCOUNT_IDENTIFIERS_IN_USE y el frontend señala únicamente los campos afectados.
ACCOUNT_UNAVAILABLE queda como fallback si una modificación concurrente liberó el identificador.
El registro público conserva su error genérico; no existe un endpoint público de disponibilidad.

La transacción toma un advisory lock de PostgreSQL compartido por las escrituras administrativas,
bloquea las filas de actor/cuenta y vuelve a comprobar permisos del actor. No permite degradar el rol
del último ADMIN con isActive=true e isDeleted=false. Este bloqueo se mantiene hasta commit/rollback.
La sesión existente lee el rol vigente al autenticar. Si un admin edita su propia cuenta, el frontend
refresca auth; una degradación confirmada sale del panel hacia Student.

## Verificación

Las pruebas SQL usan PostgreSQL WASM efímero, PrismaPg y Argon2 reales, sin leer `.env` ni escribir
fixtures en Supabase. Las pruebas de UI con fetch controlado verifican el contrato del cliente y no
se presentan como persistencia. Consultar los resultados ejecutados en [verification.md](verification.md).
Quedan para backend futuro: listado completo, métricas, progreso, reportes, comentarios y cambio de estado.
