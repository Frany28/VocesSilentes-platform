# Contratos HTTP

Base `/api`. Éxitos JSON `{data: ...}`; errores `{error:{code,message}}`.
Las solicitudes del navegador incluyen cookies. Antes de escribir, obtener GET `/auth/csrf` y
enviar su token en `X-CSRF-Token`. No se repiten mutaciones automáticamente ante errores.
Zod rechaza entradas fuera del contrato. Las rutas privadas devuelven `Cache-Control: no-store`.

## Sesión

| Método / ruta         | Entrada / resultado                                                         |
| --------------------- | --------------------------------------------------------------------------- |
| GET `/health`         | Vida HTTP; no consulta PostgreSQL                                           |
| GET `/auth/csrf`      | Token CSRF y cookies de contexto                                            |
| POST `/auth/register` | firstName, lastName opcional, email, username, password; crea USER y sesión |
| POST `/auth/login`    | email, password; emite sesión nueva                                         |
| GET `/auth/me`        | Identidad pública de la sesión vigente                                      |
| POST `/auth/logout`   | Revoca la sesión presentada; 204                                            |

Registro público admite contraseñas de 15–128 puntos Unicode y hasta 512 bytes UTF-8.
Login nunca revela si el correo existe. Producción exige HTTPS y cookies Secure/HttpOnly.

## Administración — ADMIN

| Método / ruta                  | Entrada / resultado                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| GET `/admin/summary`           | users, activeUsers, inactiveUsers, pendingReports, resolvedReports, reports recientes |
| GET `/admin/users`             | q, role opcional, page, pageSize; items, total, page, pageSize, pages                 |
| GET `/admin/users/:id`         | Usuario y actividad persistida                                                        |
| POST `/admin/users`            | firstName, lastName opcional/nullable, email, username, password, role, isActive      |
| PATCH `/admin/users/:id`       | Identidad y role; no contraseña ni estado                                             |
| PATCH `/admin/users/:id/state` | `{isActive:boolean}`; revoca sesiones al desactivar                                   |
| DELETE `/admin/users/:id`      | Borrado lógico con revocación; conserva relaciones                                    |
| GET `/admin/audit-logs`        | page, pageSize; eventos paginados sin valores sensibles                               |

El alta administrativa conserva mínimo de ocho caracteres, una mayúscula y un símbolo/puntuación.
El último ADMIN activo no puede degradarse, desactivarse ni eliminarse. Una cuenta eliminada no se
restaura cambiando su actividad. Reactivar no devuelve validez a sesiones revocadas.

## Cuenta propia — sesión USER o ADMIN

| Método / ruta                    | Entrada / resultado                                                     |
| -------------------------------- | ----------------------------------------------------------------------- |
| PATCH `/account/profile`         | firstName, lastName opcional/nullable, username, email; usuario público |
| PUT `/account/password`          | currentPassword, newPassword; 204; revoca otras sesiones                |
| PUT `/account/photo?zoom=100`    | Bytes JPEG/PNG/WEBP hasta 5 MiB; zoom entero 100–135                    |
| DELETE `/account/photo`          | Retira foto y referencia; usuario público                               |
| GET `/account/photos/:id/image`  | WEBP; titular o ADMIN                                                   |
| GET `/account/photos/:id/access` | Enlace de 120 s; titular o ADMIN                                        |

Nueva contraseña: distinta de la actual, 15–128 puntos Unicode y hasta 512 bytes. Foto y contraseña
tienen cuotas independientes de diez intentos/usuario/10 minutos/proceso. El perfil no acepta otro ID,
rol ni campos privilegiados. Cambiar correo restablece emailVerified=false.

## Reportes y catálogo existente

| Método / ruta                          | Entrada / resultado                                                     |
| -------------------------------------- | ----------------------------------------------------------------------- |
| POST `/reports`                        | requestId UUID, description de 1–4000, category CONTENT/TECHNICAL/OTHER |
| GET `/reports`                         | page, q, status; solo propios salvo ADMIN                               |
| GET `/reports/:id`                     | Detalle autorizado; comentarios internos exclusivamente ADMIN           |
| PATCH `/reports/:id/status`            | ADMIN; status PENDING/RESOLVED, internalComment opcional hasta 2000     |
| PUT `/reports/:id/evidence`            | Bytes de una imagen; 204 tras validación y confirmación                 |
| GET `/reports/:id/evidence/access`     | Enlace autorizado de 120 s                                              |
| GET `/learning`                        | USER; publicaciones y progreso propio                                   |
| PUT `/learning/lessons/:id/progress`   | USER; status IN_PROGRESS/COMPLETED                                      |
| PUT `/learning/exercises/:id/progress` | USER; mismo contrato de actividad manual                                |

Estados generales: 400 entrada inválida, 401 sesión/credenciales inválidas, 403 permisos/CSRF,
404 recurso inexistente/no autorizado, 409 conflicto, 413 tamaño excesivo, 422 imagen inválida,
429 límite de intentos y 503 persistencia/almacenamiento no disponible. Los mensajes no incluyen secretos.
