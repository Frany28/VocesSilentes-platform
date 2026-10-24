# Frontend en Netlify

Sitio del usuario: <https://vocessilentes.netlify.app/>. La ruta `/` lleva a `/login`;
al iniciar sesión, USER entra en `/student` y ADMIN en `/admin`, según el retorno autorizado.
Las rutas del estudiante siguen protegidas por sesión; no se publica una sesión ficticia.
Backend confirmado por el usuario: <https://voces-silentes-platform.vercel.app/>.

## Build desde Git

`netlify.toml` en la raíz fija estos valores para el workspace con un único pnpm-lock.yaml:

| Ajuste            | Valor                                            |
| ----------------- | ------------------------------------------------ |
| Base directory    | Raíz del repositorio (`.`)                       |
| Build command     | `pnpm --filter @vocessilentes/frontend build`    |
| Publish directory | `Frontend/dist`                                  |
| Node              | `22.23.4`                                        |
| pnpm              | `10.18.2`                                        |
| VITE_API_URL      | `https://voces-silentes-platform.vercel.app/api` |
| VITE_STUDENT_DEMO | `true` (prototipo educativo identificado)        |

Netlify instala desde la raíz y construye únicamente el frontend. No usar Backend ni su configuración
de Vercel como carpeta de publicación. Subir los cambios al repositorio/rama vinculados y lanzar
un nuevo deploy. El archivo de configuración fija los ajustes de build; comprobar que Netlify usa
el commit actualizado y ese archivo en el log del despliegue.

## Rutas directas y publicación manual

`Frontend/public/_redirects` contiene `/* /index.html 200`. Vite lo copia a `Frontend/dist/_redirects`.
Netlify sirve index.html al abrir/recargar `/login` y las cinco rutas `/student`, y React resuelve
la pantalla y sus permisos. Los archivos existentes de assets conservan prioridad.

Si el sitio se publicó arrastrando una carpeta a Netlify, reconstruir y subir **Frontend/dist** completo,
incluyendo index.html, assets y _redirects. No subir Frontend/src, el workspace ni archivos .env.
El deploy manual no ejecuta el build de netlify.toml:

```powershell
# URL pública de la API confirmada por el usuario; nunca un secreto.
$env:VITE_API_URL = 'https://voces-silentes-platform.vercel.app/api'
$env:VITE_STUDENT_DEMO = 'true'
pnpm --filter @vocessilentes/frontend build
```

## Conexión con el backend

`netlify.toml` configura `VITE_API_URL=https://voces-silentes-platform.vercel.app/api` durante el build.
Volver a desplegar para incluirlo en el bundle. Si cambia el dominio, actualizar esa variable pública
en el archivo. Vite incluye el valor al construir; modificar Backend/.env no configura el frontend
publicado. Sin la variable, el valor de desarrollo es localhost:3000.
`DATABASE_URL` y `CSRF_SECRET` permanecen exclusivamente en el backend.

El demo educativo no omite login ni permisos; conserva sus avisos y selectores en producción.
El nuevo prototipo requiere reconstrucción y un despliegue autorizado; esta implementación
no lo publica. Ver [configuración y alcance](phase-one-prototype.md).

En Vercel, `CORS_ORIGINS` debe incluir **https://vocessilentes.netlify.app**, sin barra final.
Para cookies entre netlify.app y vercel.app, configurar producción HTTPS y `SESSION_SAME_SITE=none`.
Valores necesarios en Settings → Environment Variables del proyecto backend, entorno Production:

```dotenv
NODE_ENV=production
CORS_ORIGINS=https://vocessilentes.netlify.app
SESSION_SAME_SITE=none
```

Si ya hay otros orígenes HTTPS autorizados, conservarlos y añadir Netlify separados por comas.
Producción también exige `CSRF_SECRET` privado de 64 caracteres hexadecimales; conservar el existente
si cumple ese contrato o generarlo y guardarlo exclusivamente en Vercel. No incluirlo en este archivo,
el frontend ni la conversación. Volver a desplegar el backend después de cambiar las variables.

La conexión de producción fue corregida y comprobada el 9 de octubre de 2026 tras autenticar
la CLI en el proyecto autorizado. Vercel tenía `CORS_ORIGIN` en singular, que la API no lee,
y faltaban SESSION_SAME_SITE y CSRF_SECRET. Se configuraron las variables anteriores para
Production, un CSRF_SECRET privado aleatorio y Node 22.x; se conservaron las variables de
Preview y las credenciales PostgreSQL. Se redesplegó la misma versión del backend.

El bundle de Netlify contiene la URL estable correcta. Health responde 200 con Origin Netlify,
el preflight de login 204, csrf 200 y me sin sesión 401, con permiso CORS explícito y credentials.
Las cookies son HttpOnly, Secure y SameSite=None. Login/me/logout de ambas cuentas dieron
200/200/204 por HTTP real. Desde Chrome aislado en el sitio publicado, ADMIN entró a `/admin`
y USER a `/student`; ambas sesiones persistieron al recargar y se cerraron correctamente.

`GET /` de la API sigue devolviendo el 404 `NOT_FOUND` esperado. La URL individual del despliegue
anterior redirige a la autenticación de Vercel (302), incluido health; el frontend usa el dominio
estable. Evidencia y límites en [verification.md](verification.md).

Los navegadores que bloquean cookies de terceros pueden impedir la sesión; los dominios del mismo
sitio permiten usar lax. Ver [vercel.md](vercel.md) y [authentication.md](authentication.md).

## Comprobaciones después del nuevo deploy

Abrir `/`: debe mostrar «Inicia sesión». Abrir `/login` y recargar debe conservar esa pantalla,
sin 404 de Netlify. Abrir `/student` sin sesión debe conducir a login cuando la API confirme 401.
Probar login y recarga del área del estudiante con la API real; los estados de error no se interpretan
como una sesión válida ni como ausencia confirmada de sesión.

Fuentes oficiales: [Vite en Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/),
[fallback para SPA](https://docs.netlify.com/build/configure-builds/javascript-spas/) y
[monorepos](https://docs.netlify.com/build/configure-builds/monorepos/).
