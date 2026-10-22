# Administración

Actualización del 21 de octubre: reportes y evidencia ya consultan servicios reales de sesión propia.
El listado se pagina/filtra en backend y el visor existente obtiene enlaces temporales autorizados.
La resolución y las fotos de perfil siguen pendientes. Las secciones históricas siguientes que
describen evidencia/reportes sin backend corresponden al rediseño anterior; ver el
[contrato actual y comprobación real de Supabase S3](report-evidence.md).

Fuente actual: [Admin · Rediseño moderno, 286:50](https://www.figma.com/design/GRbHCgOXNZZxRWSpIcHKVU/VocesSilentes-Website?node-id=286-50).
La revisión del 21 de octubre de 2026 inventarió los 170 frames de la página mediante metadata.
Se consultaron contextos detallados y renders de pantallas, componentes, estados, modales,
perfil, foto y evidencia, correlacionando escritorio/tablet/móvil y Claro/Oscuro.
La sección «Reportar un error» queda fuera de Admin por decisión explícita del usuario.

Referencias principales: summary/users/user/report `289:30167/30289/30507/30621`;
modales `289:30717/30763/30804/30823/30837`; inputs/botones `286:91/82`;
estados de lectura `290:647/764/874`; perfil/seguridad `298:1724/1840`;
foto `298:2195/2212/2242/2257/2270`, encuadre `301:1123`;
evidencia/visor `347:1789/1790/1817/1883/1916/1982`.
La anterior referencia `218:11858` describe la implementación reemplazada.

## Pantallas e integración real

Todas las rutas requieren sesión y rol ADMIN. El backend vuelve a autorizar cada operación;
los controles y guards del frontend no conceden permisos.

| Ruta                       | Presentación y capacidad actual                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `/admin`                   | Resumen moderno y censo real de cuentas no eliminadas, independiente de filtros de URL. Reportes sin cifras inventadas.      |
| `/admin/users`             | Lista real, búsqueda/rol en servidor, páginas de tres, carga, error, vacío, sin resultados y reintento.                      |
| `/admin/users/new`         | Modal de creación real; conserva acceso directo y recarga.                                                                   |
| `/admin/users/:id`         | Identidad, acceso y seguridad reales; aprendizaje sin datos inventados.                                                      |
| `/admin/users/:id/edit`    | Modal de edición real sobre el detalle, con lectura actual antes de editar.                                                  |
| `/admin/users/:id/created` | Confirmación después del 201 y nueva consulta; mantiene compatibilidad con el enlace anterior.                               |
| `/admin/reports`           | Pantalla y filtros; la ruta informa integración pendiente porque no existe servicio de reportes.                             |
| `/admin/reports/:id`       | Dependencia pendiente. La presentación de revisión/evidencia recibe datos del consumidor, sin consultar endpoints supuestos. |
| `/admin/profile`           | Identidad de sesión y edición propia usando el PATCH ADMIN existente, rol fijo y refresh de sesión.                          |
| `/admin/profile/security`  | Presentación de seguridad con campos/actualización deshabilitados: no hay cambio de contraseña en backend.                   |

Se retiran las colecciones demo y el selector de cargas simuladas del panel.
No se mezclan datos sintéticos con respuestas reales ni se usa una demo como recuperación de errores.
No hay peticiones a endpoints de reportes, fotos, contraseñas o desactivación que no existan.

Las creaciones/ediciones solo comunican éxito tras 201/200. Los errores conservan el borrador;
conflictos de correo/usuario se asocian al campo correspondiente. Las lecturas usan AbortSignal,
se descartan respuestas tardías y no se repiten escrituras automáticamente.
La identidad propia envía el ID autenticado y el rol existente al servicio ADMIN; no se crea un
endpoint de perfil ni se permite cambiar el rol desde esa pantalla.

## Diseño, navegación y accesibilidad

Se reutilizan Button, Input, Icon, Badge, Alert, fuentes, proveedor de tema, cliente HTTP y auth.
Las variantes compactas se limitan a `.admin-shell`: control de 44 px, radio 8 px, etiquetas Manrope
13/20, campos Inter 14/20, títulos 28/40; perfil 36/44 desde tablet. Paneles de 16 px y perfil de 24 px.
La marca reutiliza `Brand`, igual que Auth/Student: recursos y recortes compartidos por tema,
versión completa en escritorio/móvil e isotipo compacto en tablet. Este estándar compartido
reemplaza la composición independiente del rediseño de Admin. Los SVG de controles están en `assets/admin-v2/`.
Los iconos mantienen sus dimensiones nativas; no hay URLs temporales de Figma en ejecución.

Sidebar de 232 px en escritorio y 76 px en tablet; navegación móvil de tres destinos y acceso
a perfil en la barra. El menú móvil expone todos los destinos y logout mediante diálogo.
«Reportes» y «Mi perfil» pertenecen a Admin; «Reportar un error» no aparece.
«Cerrar sesión» queda al final del sidebar, separado de las secciones principales.
Los controles de vuelta son iconos con nombres accesibles; «Ver cuenta» usa un ojo.
Cabeceras y filas comparten exactamente los mismos tracks de grid y alineación de columnas.
El listado de reportes usa tarjetas en todos los tamaños: referencia/estado, título y contexto/revisión;
en móvil la acción se reduce a «Revisar», como en `289:31745`. Los recuentos de reportes se muestran
solo cuando el consumidor proporciona una colección completa, nunca desde una página aislada.
Desde 620 px de contenido se conserva la tabla; por debajo aparecen filas compactas de identidad,
estado y acción. Se comprueban también anchos intermedios, texto largo y altura reducida.

Los diálogos nativos contienen el foco, bloquean scroll, admiten Escape/cierre/backdrop y restauran
el disparador cuando sigue montado. Los formularios confirman el descarte antes de cerrar o navegar;
los controles del panel bloquean navegación durante escrituras. beforeunload protege recarga/cierre.
El historial nativo sigue sin interceptarse. Al cerrar un formulario por ruta se enfoca su acción
de origen. Logout conserva sesión ante fallo y permite reintentar.

## Capacidades pendientes, sin simulaciones

- **Desactivar/reactivar:** existe el modal diseñado, con cuenta, efecto y dependencia visibles.
  Su confirmación está deshabilitada: PATCH no admite isActive. No se sustituye por DELETE.
  La eliminación lógica real anterior permanece bajo «Otras acciones de cuenta», con confirmación.
- **Reportes y resolución:** faltan consulta, detalle autorizado, comentario, resolución y acceso
  a adjuntos. `AdminReports`/`ReportReview` reciben datos/operación del consumidor; las rutas no
  proporcionan fixtures ni un callback de éxito. La confirmación de resolución queda deshabilitada
  sin operación. La presentación acepta únicamente una respuesta que confirme el reporte resuelto.
- **Evidencia:** tarjeta «Ver imagen», visor contenido, cierre, carga/error/reintento y «Sin imagen
  adjunta» implementados para una imagen recibida. No hay evidencia real consultable todavía.
- **Foto:** selección local JPG/PNG/WEBP hasta 5 MB, validación, error de lectura y encuadre 100–135 %.
  Los object URLs se liberan al reemplazar/cerrar. La vista previa no cambia el avatar real ni sube
  archivos. Guardar/quitar requieren servicio de almacenamiento, validación de servidor, recorte y
  persistencia. El progreso de carga del prototipo no se finge.
- **Seguridad:** faltan verificación de contraseña actual, actualización y política de sesiones.
  Los campos no recogen credenciales para una operación inexistente.
- **Métricas/actividad:** no hay agregados de usuarios activos/desactivados ni backend educativo;
  no se calculan porcentajes a partir de una página del listado.

No se añaden dependencias, variables, endpoints ni migraciones. Las escrituras reales conservan
el requisito de aplicar la migración AuditLog en una base de desarrollo autorizada.

## Verificación de presentación

`Frontend/admin-review.html` es una entrada de desarrollo, como `ui.html`, sin inclusión en el
build de producción. Importa exclusivamente fixtures de pruebas con aviso visible «Datos sintéticos».
Permite revisar las presentaciones de reportes/evidencia sin atribuirles integración.
Las pruebas unitarias de resolución controlan el callback; no demuestran persistencia de reportes.
Resultados de la suite, Chrome, base efímera y límites en [verification.md](verification.md).

## Backend y reglas de datos

Se reutilizan Prisma y su conexión configurada. El Día 1 añade AuditLog mediante migración versionada,
probada solo en memoria; no se aplica a Supabase en esta entrega.
`modules/admin/` separa rutas, controller, Zod, service, repository y proyección permitida del usuario.
Crear/editar/eliminar exige sesión ADMIN, transporte de auth y CSRF compartido con los endpoints existentes;
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

El detalle real ofrece eliminación lógica con confirmación explícita y bloqueo de doble envío.
DELETE marca isDeleted/deletedAt, revoca todas las sesiones y conserva relaciones y unicidad.
Rechaza cuentas ya eliminadas y no permite quitar el último ADMIN activo. Las escrituras administrativas
generan USER_CREATED/USER_UPDATED/USER_DELETED dentro de la misma transacción; un fallo de auditoría
revierte todos sus efectos. GET `/api/admin/audit-logs` permite consulta paginada exclusivamente ADMIN.
No existe UI de bitácora, cambio real de isActive ni restauración. Ver [Día 1](module-ii/README.md).
