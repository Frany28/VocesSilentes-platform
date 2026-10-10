# Contratos HTTP

Base `/api`. Éxitos JSON `{ "data": ... }`; errores `{ "error": { "code": ..., "message": ... } }`.

## Usuarios administrados

Todos exigen sesión ADMIN y transporte de autenticación; POST/PATCH también CSRF existente.
Se reutiliza la conexión de Prisma. No existe un endpoint nuevo de listado o cambio de estado.

| Método / ruta            | Entrada                                                                            | Respuesta                                                  |
| ------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| GET `/admin/users/:id`   | UUID válido                                                                        | 200 `{data:{user}}` para cargar detalle/edición            |
| POST `/admin/users`      | firstName, lastName?, username, email, role USER/ADMIN, isActive boolean, password | 201 `{data:{user}}` sin crear una sesión                   |
| PATCH `/admin/users/:id` | firstName, lastName?, username, email, role USER/ADMIN                             | 200 `{data:{user}}` sin contraseña ni estado en el payload |

DTO administrativo: campos públicos de auth más isActive, isDeleted, deletedAt, lockedUntil,
failedLoginAttempts, createdAt y updatedAt. Nunca password/passwordHash/tokens/sesiones.
Correo y username duplicados: 409 ACCOUNT_UNAVAILABLE; último admin activo: 409 LAST_ACTIVE_ADMIN;
cuenta eliminada: 409 USER_DELETED; UUID inexistente: 404 USER_NOT_FOUND; campos inválidos/extra: 400 INVALID_INPUT.
Cambiar correo restablece emailVerified=false; creación siempre lo deja pendiente.
Crear desde Admin admite contraseña de 8–128 caracteres Unicode y hasta 512 bytes UTF-8;
se conserva exactamente la entrada. El registro público mantiene el mínimo de 15.
Reglas, alcance de demostración y pantallas: [admin.md](admin.md).

## Autenticación y salud

No se exponen issues de validación con valores, errores SQL, hashes o tokens de sesión.
El token **CSRF** sí se devuelve para enviarlo en una cabecera; no es una credencial de sesión.

| Método / ruta         | Entrada / protección                                   | Respuesta                                              |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| GET `/health`         | Pública, vida HTTP; no comprueba DB                    | 200 `{data:{status:"ok",service:"vocessilentes-api"}}` |
| GET `/auth/csrf`      | HTTPS o desarrollo local; límite IP; cookies incluidas | 200 `{data:{csrfToken}}` y cookies de contexto/CSRF    |
| POST `/auth/register` | CSRF, límites; JSON estricto                           | 201 `{data:{user,csrfToken}}` y cookie de sesión nueva |
| POST `/auth/login`    | CSRF, límites; JSON estricto                           | 200 `{data:{user,csrfToken}}` y cookie de sesión nueva |
| GET `/auth/me`        | Sesión y estado actual válidos                         | 200 `{data:{user}}`                                    |
| POST `/auth/logout`   | CSRF; body opcional `{}`                               | 204 sin body; revoca sesión presentada y borra cookies |

Registro admite únicamente firstName, lastName opcional, email, username y password.
Login admite únicamente email y password. El contrato de normalización y longitudes está en
[authentication.md](authentication.md). Registro inicia sesión inmediatamente, con USER y correo
pendiente. Duplicados concurrentes dependen de UNIQUE real y no de un precheck vulnerable a carreras.

DTO user permitido en register/login/me: id, firstName, lastName (nullable), email, username,
profileImagePath (nullable), role y emailVerified. Es información de la cuenta autenticada,
no una consulta pública de usuarios. No incluye passwordHash, tokenHash, intentos, bloqueo,
identidades externas, sesiones ni fechas internas.

Enviar `credentials: "include"` en todas las solicitudes del navegador. Antes de cada secuencia
de mutaciones sin token en memoria, pedir csrf y enviar `X-CSRF-Token` con el valor recibido.
Usar el token rotado devuelto por registro/login. Al salir, descartar CSRF; una repetición de
logout tras borrar cookies obtiene primero CSRF anónimo. Un 403 CSRF requiere actualizar el token
y reintentar por acción del usuario, sin repetición automática de la mutación.

| HTTP / código           | Significado                                                                       |
| ----------------------- | --------------------------------------------------------------------------------- |
| 400 INVALID_INPUT       | Entrada fuera del contrato, incluyendo campos privilegiados                       |
| 401 INVALID_CREDENTIALS | Login rechazado sin revelar existencia/estado del correo                          |
| 401 UNAUTHENTICATED     | Sesión ausente, mal formada, desconocida, vencida, revocada o cuenta no permitida |
| 403 FORBIDDEN           | Identidad válida con rol insuficiente en futuros endpoints con requireRole        |
| 403 CSRF_INVALID        | Falta CSRF, no coincide o corresponde a otro contexto/sesión                      |
| 403 HTTPS_REQUIRED      | Transporte de auth inseguro fuera de desarrollo local                             |
| 403 ORIGIN_NOT_ALLOWED  | Origin fuera de la lista CORS exacta                                              |
| 409 ACCOUNT_UNAVAILABLE | Registro en conflicto de correo/username; respuesta genérica                      |
| 429 RATE_LIMITED        | Cuota agotada; observar Retry-After                                               |
| 503 AUTH_UNAVAILABLE    | API arrancada sin servicio de persistencia configurado                            |
| 500 INTERNAL_ERROR      | Fallo interno controlado, por ejemplo caída de PostgreSQL                         |

Errores generales conservan 404 NOT_FOUND y 413 PAYLOAD_TOO_LARGE. Sin DATABASE_URL health
funciona y csrf puede inicializar contexto; register/login/me/logout responden 503.
El cliente HTTP expone `ApiError.retryAfter` opcional en segundos cuando el navegador puede
leer Retry-After. CORS actual no expone ese header entre orígenes: login conserva el mensaje
genérico de cuota y el reintento manual sin inventar su duración; véase [login.md](login.md).
Los futuros endpoints administrativos deben usar requireSession y requireRole('ADMIN'); no existe
un endpoint administrativo de datos en esta entrega. Perfil/progreso deben tomar identidad de
req.auth.id y comprobar propiedad, aunque el cliente mande otro userId.
