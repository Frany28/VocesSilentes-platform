# Autenticación y seguridad

Implementación local del MVP sobre `User` y `Session` existentes, sin migraciones adicionales,
JWT ni Supabase Auth. Reutiliza el esquema privado `vocessilentes` y la migración aplicada
`20261009000100_phase_one`. No implementa OAuth, recuperación, correo ni módulos educativos.
Contratos HTTP en [api.md](api.md); variables en [development.md](development.md).

## Contraseñas y cuentas

Registro público estricto: nombre obligatorio, apellido opcional, correo y username canónicos.
Correo ASCII recortado y convertido a minúsculas, máximo 254; username `[a-z0-9_]`, 3–50,
recortado y en minúsculas. Nombre/apellido se recortan y admiten 1–100 caracteres.
PostgreSQL conserva UNIQUE; el conflicto, incluso concurrente, se traduce a 409 genérico.
No se aceptan rol, estado, bloqueo, verificación ni otros campos fuera del contrato.

Contraseñas del registro público: **15–128 puntos de código Unicode**, máximo **512 bytes UTF-8**.
Crear usuarios desde Admin admite **8–128** por solicitud del usuario; usa el mismo Argon2id
y límites máximos y exige una mayúscula Unicode y un signo de puntuación/símbolo.
Véase [admin.md](admin.md). Se permiten espacios, Unicode y gestores; en el registro público
no hay reglas de composición. En ambos flujos no hay transformación,
recorte o truncado. Login acepta 1–128 puntos de código / 512 bytes para verificar la entrada
exacta. No hay consulta de contraseñas filtradas en esta etapa.

Argon2id con memoria **19 456 KiB**, **2** iteraciones, paralelismo **1**, salida de 32 bytes
y salt aleatorio de la biblioteca. Son los mínimos de la
[recomendación OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html);
medir latencia y capacidad en el host de producción antes de aumentar costos.
Antes de implementar se comprobó que no había usuarios ni hashes existentes. El CHECK del
modelo también admite bcrypt, pero el servicio actual verifica solo Argon2id: no se deben
importar hashes bcrypt sin acordar e implementar su compatibilidad/migración.

Login devuelve el mismo 401 `INVALID_CREDENTIALS` para correo desconocido, contraseña incorrecta
y cuenta desactivada, eliminada o con `lockedUntil` futuro. Los usuarios ausentes o hashes
inutilizables pasan por un hash señuelo Argon2id. Esto reduce diferencias evidentes; no promete
tiempo constante entre consultas ni elimina todos los canales de enumeración.
Después del hash, una transacción bloquea y vuelve a leer la cuenta antes de emitir la sesión.

Registro crea `USER`, `emailVerified=false` y una sesión. **El MVP permite acceder con correo
pendiente de verificación**; la vista lo indica. No afirmar identidad verificada ni usar ese correo
como prueba de propiedad. Verificación y recuperación requieren una implementación posterior.

## Sesiones y permisos

Token opaco de **32 bytes criptográficos** en base64url; solo **SHA-256 hexadecimal** en Session.
Las respuestas JSON nunca incluyen el token de sesión ni el hash de sesión/contraseña.
Cada login/registro emite una sesión nueva; no acepta un identificador proporcionado por el cliente.
Duración absoluta inicial: **86 400 segundos (24 horas)**, configurable entre 1 y 604 800.
No hay renovación deslizante. Puede haber varias sesiones de un usuario; logout revoca únicamente
la presentada. Sesiones vencidas/revocadas se conservan; falta una política operativa de purga.

Cookies de desarrollo: `vs-session`, `vs-context`, `vs-csrf`. Producción añade `__Host-` a las tres.
Todas son **HttpOnly**, host-only (**sin Domain**), `Path=/`, `SameSite=Lax` por defecto;
producción usa **Secure** obligatoriamente. Sesión lleva Expires; contexto/CSRF Max-Age con la
misma duración. Logout borra las tres con los mismos atributos. Es idempotente respecto a
persistencia; cada solicitud sigue necesitando CSRF válido. Tras borrar cookies, obtener un token
anónimo nuevo antes de repetirla. No se guarda ningún token en storage, URLs ni logs.

`requireSession(service, policy)` consulta Session y su User actual en cada petición protegida:
expiración, revocación, actividad, eliminación y bloqueo. Añade el DTO permitido a `req.auth`.
`requireRole(...roles)` se ejecuta después y devuelve 403 para rol insuficiente; falta de sesión
devuelve 401. No se publicaron endpoints administrativos ficticios; sus permisos se verifican
con una ruta aislada. Cambios de rol/estado afectan las siguientes peticiones al backend.
El frontend mantiene una instantánea para navegar: refrescar la sesión actualiza esa vista,
pero su guard nunca sustituye al middleware del servidor.

Futuros endpoints de perfil/progreso deben usar **`req.auth.id`** para la identidad y filtrar
propiedad/autorización en backend. Un `userId` enviado por el cliente no autoriza acceso a esa cuenta.
Toda operación nueva con cookies que cambie estado debe reutilizar la protección CSRF firmada,
además de la sesión y los permisos que necesite.

## CSRF, CORS y transporte

`csrf-csrf` implementa double-submit **firmado HMAC**, ligado al hash de la cookie de sesión o a
un contexto anónimo aleatorio HttpOnly previo al login. GET `/api/auth/csrf` emite contexto/cookie
y devuelve el token CSRF para memoria del cliente. POST register/login/logout exigen además
`X-CSRF-Token`; no aceptan el token desde body/query. Login y registro rotan contexto y CSRF,
ligándolo a la sesión nueva. Bootstrap recupera cookies obsoletas; no permite omitir validación.
El cliente descarta CSRF ante `CSRF_INVALID`; el siguiente intento obtiene uno nuevo y no reproduce
automáticamente una mutación cuyo resultado pudiera ser ambiguo.

Se conserva Helmet, JSON de 100 KB, errores controlados y logs por lista permitida: id, método,
estado y duración; sin URL, headers, cookies, body, trazas internas ni credenciales.
Auth usa `Cache-Control: no-store`. CORS permite exclusivamente los orígenes exactos configurados,
`credentials: true` y Content-Type/X-CSRF-Token. Clientes sin Origin siguen permitidos, pero pasan
por transporte, CSRF y permisos. CORS/SameSite no sustituyen CSRF.

HTTP para auth se admite únicamente en conexiones loopback de desarrollo/test; producción exige
HTTPS, incluso si la solicitud trae X-Forwarded-Proto arbitrario. `trust proxy` es **false** por
defecto. `TRUST_PROXY_IPS` admite solo direcciones IP literales separadas por comas de proxies
conocidos; no admite true, saltos genéricos o cabeceras suministradas por clientes.
Si se configura, el proxy debe limpiar/sobrescribir X-Forwarded-* y el backend debe aceptar tráfico
solo desde esos proxies. Configurar las IP reales de cada topología, no copiar valores de pruebas.

La entrada exclusiva `Backend/app.js` para Vercel acepta un salto cuando `VERCEL=1` en el entorno
privado de la plataforma, que proporciona X-Forwarded-Proto e IP. No reconoce al proveedor por
headers ni cambia la política del servidor local. Ver [despliegue y límites](vercel.md).

Producción requiere `CSRF_SECRET`: 32 bytes aleatorios como 64 caracteres hexadecimales privados,
persistentes y compartidos entre instancias. Generarlo mediante un gestor de secretos o Node crypto
y guardarlo exclusivamente en el entorno privado, sin capturarlo en documentación/logs.
Sin secreto en desarrollo se genera uno por proceso; reiniciar invalida CSRF, no las sesiones.

Se recomienda frontend/API HTTPS bajo el mismo sitio y orígenes explícitos. `SameSite=None` solo
se admite en producción Secure si realmente se necesitan sitios distintos: los navegadores pueden
bloquear cookies de terceros. Lax/Strict no permiten auth entre sitios diferentes aunque CORS permita
el origen. Las cookies no distinguen puertos: evitar otras aplicaciones no confiables en el mismo
host de desarrollo y usar consistentemente localhost o 127.0.0.1 en frontend/API.

## Intentos y limitación

Ventanas fijas iniciales de **600 segundos**. Dos controles por operación, ambos necesarios:

| Operación | Por IP | Por IP + correo normalizado |
| --------- | ------ | --------------------------- |
| Login     | 30     | 5                           |
| Registro  | 5      | 3                           |

El correo se guarda como SHA-256 en la clave en memoria, sin registrarlo. IPv6 se agrupa mediante
`ipKeyGenerator` de la biblioteca. Cada solicitud cuenta, incluidos errores, CSRF inválido y éxitos.
Exceso devuelve 429 y Retry-After; ventanas se reinician sin bloqueo indefinido global de la cuenta.
GET CSRF permite al menos 60 por IP/ventana, o LOGIN_IP_LIMIT si es mayor.

No se adopta la regla contradictoria de bloqueo de 12 horas del prototipo ni se crea bloqueo
automático de cuenta. `lockedUntil` existente se respeta. Contraseña incorrecta de cuenta conocida
incrementa `failedLoginAttempts` atómicamente, saturando en el máximo entero; login exitoso reinicia
el contador y limpia bloqueo vencido dentro de su transacción. Es un contador informativo,
no un umbral que terceros puedan usar para bloquear globalmente al titular.

MemoryStore es **por middleware y proceso**, sin Redis; reinicia al reiniciar la API y no comparte
cuotas entre réplicas. IP+correo evita bloquear globalmente una cuenta ajena, pero no impide ataques
distribuidos ni consumo Argon2 desde muchas IP; una IP compartida puede agotar su cuota para otros.
Antes de escalar horizontalmente, acordar limitación compartida/en el borde y capacidad del servidor.
Valores máximos de configuración no son recomendaciones para producción.

## Frontend

`requestJson` envía credentials: include y conserva AbortSignal/errores. AuthProvider confirma
`/auth/me`; estados loading/authenticated/unauthenticated/error. Guards no muestran contenido
durante loading ni interpretan red/503/JSON ilegible como sesión inexistente. Una respuesta 401
`UNAUTHENTICATED` invalida el estado; INVALID_CREDENTIALS de login y cualquier 403 no cierran
otra sesión válida. Logout limpia estado al confirmarse; un error de red permite reintentar.
Respuestas tardías de me se descartan después de login/logout/cancelación.

`/login` implementa la pantalla Auth de Figma; `/register` reutiliza su composición y controles
adaptados a los datos de User, con validación local: [registro](registration.md).
`/student` y sus cinco pantallas exigen sesión y USER; `/admin`, sesión y ADMIN.
`/account` es compartida. El retorno admite solo rutas publicadas y autorizadas para cada rol:
Student para USER, Admin para ADMIN y cuenta para ambos.
Sin retorno autorizado, ADMIN entra a `/admin` y USER a `/student`.
Sin destinos externos, query ni traversal.
CSRF vive en memoria; el token de sesión es inaccesible desde JavaScript. No se modifican diseños
Figma ni se simulan APIs educativas/administrativas. [Estados, diferencias y verificación de login](login.md).

## Primer administrador: procedimiento controlado

No se crea automáticamente. Una persona autorizada registra su propia cuenta por el flujo normal
con contraseña personal fuerte; no hay contraseña predeterminada ni registro ADMIN.
Un responsable verifica fuera de banda su identidad y la autorización, y obtiene el UUID exacto
de esa cuenta por una consulta privada. El correo pendiente no sirve como verificación.

Un operador con acceso privado autorizado ejecuta la siguiente operación de **datos**, revisa que
RETURNING contenga exactamente el UUID autorizado y registra quién aprobó el cambio en el registro
operativo del equipo. Sustituir el marcador antes de ejecutar; no usar correos/UUID ficticios ni
guardar credenciales en un script. No requiere migración ni modificación del esquema:

```sql
BEGIN;
UPDATE vocessilentes."User"
SET role = 'ADMIN',
    "updatedAt" = GREATEST(clock_timestamp(), "createdAt", "updatedAt")
WHERE id = '<UUID de la cuenta autorizada>'::uuid
  AND role = 'USER'
  AND "isActive" = true AND "isDeleted" = false
  AND "passwordHash" IS NOT NULL
  AND ("lockedUntil" IS NULL OR "lockedUntil" <= clock_timestamp())
RETURNING id, role;
-- COMMIT solo si se obtuvo exactamente la cuenta autorizada; en otro caso ROLLBACK.
```

Después, refrescar me y verificar permisos. Una despromoción controlada a USER afecta al siguiente
acceso protegido; desactivación/eliminación lógica rechaza todas sus sesiones en backend.
No publicar este procedimiento como endpoint. AuditLog del [Día 1](module-ii/database.md) registra
operaciones realizadas por la API ADMIN; este procedimiento SQL manual requiere todavía un registro
de aprobación externo y separación de accesos operativa. La creación y promoción de la cuenta solicitada expresamente el 9 de octubre de 2026
se registra en [verification.md](verification.md); las credenciales no se documentan en el repositorio.

## Verificación y límites

Integración real aislada: Express/Supertest → Argon2id → Prisma → PrismaPg/pg → PostgreSQL WASM
en memoria por TCP, aplicando el SQL versionado. No se sustituyen repositorio ni hashing por mocks.
PGlite usa PostgreSQL 18.3 y una conexión; no reproduce un despliegue PostgreSQL 17 multiusuario,
TLS de producción, varios workers, navegadores reales ni cookies de terceros.
Pruebas frontend controlan fetch en jsdom: prueban UI/contratos, no una conexión a Supabase.
Ver resultados y comprobaciones remotas separadas en [verification.md](verification.md).

Fuentes oficiales consultadas:

- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).
- [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
- [csrf-csrf v4](https://github.com/Psifi-Solutions/csrf-csrf).
- [node-argon2](https://github.com/ranisalt/node-argon2) y [opciones](https://github.com/ranisalt/node-argon2/wiki/Options).
- [express-rate-limit: IPv6](https://express-rate-limit.mintlify.app/reference/helpers).
