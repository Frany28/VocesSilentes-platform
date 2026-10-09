# Frontend en Netlify

Sitio del usuario: <https://vocessilentes.netlify.app/>. La ruta `/` lleva a `/login`;
al iniciar sesión, USER entra en `/student` y ADMIN en `/admin`, según el retorno autorizado.
Las rutas del estudiante siguen protegidas por sesión; no se publica una sesión ficticia.

## Build desde Git

`netlify.toml` en la raíz fija estos valores para el workspace con un único pnpm-lock.yaml:

| Ajuste            | Valor                                         |
| ----------------- | --------------------------------------------- |
| Base directory    | Raíz del repositorio (`.`)                    |
| Build command     | `pnpm --filter @vocessilentes/frontend build` |
| Publish directory | `Frontend/dist`                               |
| Node              | `22.23.1`                                     |
| pnpm              | `10.18.2`                                     |

Netlify instala desde la raíz y construye únicamente el frontend. No usar Backend ni su configuración
de Vercel como carpeta de publicación. Subir los cambios al repositorio/rama vinculados y lanzar
un nuevo deploy. El archivo de configuración fija los ajustes de build; comprobar que Netlify usa
el commit actualizado y ese archivo en el log del despliegue.

## Rutas directas y publicación manual

`Frontend/public/_redirects` contiene `/* /index.html 200`. Vite lo copia a `Frontend/dist/_redirects`.
Netlify sirve index.html al abrir/recargar `/login`, `/student` o `/student/modules`, y React resuelve
la pantalla y sus permisos. Los archivos existentes de assets conservan prioridad.

Si el sitio se publicó arrastrando una carpeta a Netlify, reconstruir y subir **Frontend/dist** completo,
incluyendo index.html, assets y _redirects. No subir Frontend/src, el workspace ni archivos .env.
El deploy manual no ejecuta el build de netlify.toml:

```powershell
# Configurar antes la URL pública real de la API; nunca un secreto.
$env:VITE_API_URL = 'https://<dominio-backend>/api'
pnpm --filter @vocessilentes/frontend build
```

## Conexión con el backend

En Netlify, añadir `VITE_API_URL=https://<dominio-backend>/api` a las variables disponibles durante
el build, y volver a desplegar. Vite incluye ese valor público al construir; modificar Backend/.env
no configura el frontend publicado. Sin la variable, el valor de desarrollo es localhost:3000.
`DATABASE_URL` y `CSRF_SECRET` permanecen exclusivamente en el backend.

En Vercel, `CORS_ORIGINS` debe incluir **https://vocessilentes.netlify.app**, sin barra final.
Para cookies entre netlify.app y vercel.app, configurar producción HTTPS y `SESSION_SAME_SITE=none`.
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
