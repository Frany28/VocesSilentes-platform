# Primera fase del prototipo académico

Actualización funcional: perfil propio USER, contraseña y fotos ya guardan mediante servicios reales;
el dashboard ADMIN y el cambio de estado también están conectados. Las lecciones no se amplían.
[Contrato y controles actuales](account-functionality.md). Las dependencias posteriores son históricas.

La fase descrita aquí es histórica. La [entrega final del Módulo II](module-ii/final-delivery.md)
consulta catálogo real y registra progreso manual desde Practicar; también resuelve/reabre reportes
y consulta bitácora. La demo original requiere `VITE_STUDENT_DEMO=true`; sin bandera se usa la API,
en desarrollo y producción. No se activa cámara ni se acredita reconocimiento LSV.

## 4.1 Descripción del prototipo

VocesSilentes presenta una plataforma educativa de Lengua de Señas Venezolana con autenticación
real y dos entornos separados. Inicio, Mis módulos, Practicar, Mi progreso y Mi perfil son
navegables en Student. Admin conserva resumen, usuarios, formularios y reportes.

Son reales el registro, login, consulta de sesión, logout y la creación, consulta por UUID y
edición administrativa de usuarios. Estas operaciones usan Express, Prisma y PostgreSQL,
con las validaciones, Argon2id, cookies HttpOnly y protección CSRF existentes.

El contenido educativo, las lecciones y el progreso son demostraciones explícitas, centralizadas
en `student-demo.js`. Practicar presenta ocho estados visuales elegidos manualmente y una guía;
no activa cámara ni reconoce señas; tampoco captura vídeo ni guarda resultados. Perfil muestra únicamente
la identidad real de la sesión y su estado real de verificación del correo, sin edición simulada.
El listado de usuarios y los reportes/evidencias usan ahora servicios reales; métricas educativas,
resolución de reportes, cambio de contraseña y persistencia de foto continúan pendientes.

La [comparación con Figma](student-design-audit.md) registra la revisión del 22 de octubre:
202 frames inventariados, componentes comunes con Admin, perfil/seguridad/foto y formulario de
reportes actualizados. Los límites de la comparación visual están explícitos en esa auditoría.

## 4.2 Alcance y requisitos obligatorios

| Requisito académico                 | Implementación y evidencia                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticación funcional             | AuthProvider, cliente CSRF y endpoints register/login/me/logout existentes; pruebas HTTP/SQL y navegador con sesiones reales                |
| Dos niveles de usuario              | StudentGuard permite USER; AdminGuard permite ADMIN; `/account` es compartida; pruebas de acceso, sesión inválida y actualización de rol    |
| Interfaces principales              | Cinco rutas Student y pantallas Admin existentes; datos educativos demo visibles, perfil real y navegación sin botones de destino pendiente |
| Diseño adaptable                    | Temas claro/oscuro, cinco destinos móviles, container queries, aprendizaje de 1128 px, cuenta de 904 y diálogos limitados al viewport       |
| Prototipo verificable y documentado | `pnpm verify`, integración SQL aislada y revisión de producción local; instalación, limitaciones y URLs descritas aquí                      |

Este alcance satisface la primera fase mediante interfaces demostrables; no constituye el MVP
educativo, un clasificador de LSV ni integración de los endpoints futuros.

## 4.3 Niveles de usuario

| Rol               | Destinos permitidos                                                                                      | Credenciales de evaluación                                |
| ----------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| USER (estudiante) | `/student`, `/student/modules`, `/student/practice`, `/student/progress`, `/student/profile`, `/account` | `<CORREO_ESTUDIANTE>` / `<CONTRASEÑA_ESTUDIANTE_PRIVADA>` |
| ADMIN             | `/admin` y sus pantallas, `/account`                                                                     | `<CORREO_ADMIN>` / `<CONTRASEÑA_ADMIN_PRIVADA>`           |
| Sin sesión        | `/login`, `/register`; las rutas protegidas llevan a login                                               | Sin credenciales predeterminadas                          |

Usar cuentas autorizadas y compartir credenciales fuera de Git. No se generan cuentas de evaluación
en la base compartida mediante fixtures. Registro público crea USER; la promoción del primer
administrador sigue el procedimiento privado de [autenticación](authentication.md).
El guard es apoyo de navegación; cada consulta/escritura de usuarios vuelve a autorizarse en backend.
Un 403 conserva la sesión; un fallo de red ofrece reintento. La actualización de sesión refleja
el rol vigente. El modo demo no concede acceso ni sustituye autenticación.

## 4.4 Tecnologías

JavaScript ESM y JSDoc; Node 22.23.1 y pnpm 10.18.2. Frontend React 19, React Router 8,
Vite 8 y Tailwind CSS 4 con tokens y SVG originales de Figma. Backend Express 5 y Zod 4;
Prisma 7 con adaptador pg y PostgreSQL. Argon2id y sesiones opacas existentes.
Vitest/Testing Library, node:test/Supertest y PostgreSQL WASM PGlite para integración aislada.
MediaPipe está instalado, sin carga de modelos ni uso de cámara en esta fase.
No se incorporaron dependencias, contratos API, cambios de esquema ni migraciones nuevos.

## 4.5 Estructura de archivos

```text
Frontend/src/
  app/router.jsx                  Rutas y proveedores existentes
  features/auth/                  Sesión, guards y retorno autorizado
  features/student/
    student.routes.jsx            Las cinco rutas Student
    layout/                       Sidebar, navegación móvil, tema, logout y demo
    components/                   Cabeceras, tarjetas, filtros y feedback reutilizados
    data/                         Provider, adaptador configurable y colección demo
    pages/                        Home, Modules, Practice, Progress y Profile
    practice/                     Panel, guía, instrucciones y estados visuales
    student*.css                  Layout, responsive y recursos por tema
  features/admin/                 Operaciones reales y demostraciones existentes
  lib/config.js                   Configuración pública validada
  test/student-*.test.*           Navegación, estados, rol y configuración demo
Backend/
  src/modules/auth/               Autenticación y sesión real, sin cambios
  src/modules/admin/              Consulta, creación y edición real, sin cambios
  prisma/                         Modelo y migraciones conservados
  tests/                          HTTP, seguridad e integración SQL existentes
docs/student-design-audit.md       Matriz Figma y pendientes visuales
docs/verification.md              Resultados ejecutados y límites
netlify.toml                      API pública y demo educativa para el build
```

## 4.6 Instalación y demostración

Seguir los requisitos e instalación de [README](../README.md). Desde PowerShell:

```powershell
pnpm install --frozen-lockfile
# Solo en la primera instalación; conservar .env existentes.
Copy-Item Frontend/.env.example Frontend/.env
Copy-Item Backend/.env.example Backend/.env
pnpm db:generate
pnpm dev
```

Configurar `DATABASE_URL` privada, `CORS_ORIGINS` exactos y la política de sesión en el backend;
consultar [desarrollo](development.md) y [migraciones](migrations.md) para una base autorizada.
No reiniciar ni migrar la base compartida como parte de la demostración. Sin base, auth responde
503: el modo demo educativo requiere igualmente una sesión real.

`VITE_API_URL` y `VITE_STUDENT_DEMO` son públicas. Esta última acepta exclusivamente `true` o
`false`: sin valor, desarrollo habilita demo y producción la deshabilita; un `false` explícito
prevalece también en desarrollo. El ejemplo `.env` la desactiva deliberadamente.
Para habilitar el prototipo local o construirlo explícitamente:

```powershell
$env:VITE_STUDENT_DEMO = 'true'
pnpm dev:frontend
# O construir después de configurar VITE_API_URL pública:
pnpm --filter @vocessilentes/frontend build
```

Reiniciar Vite o reconstruir para cambiar variables públicas. `netlify.toml` incluye
`VITE_STUDENT_DEMO="true"` para la entrega académica: banners y selectores siguen visibles en
producción. Con demo deshabilitada, las vistas educativas muestran integración pendiente;
no sustituyen silenciosamente errores de API por datos inventados. Perfil sigue mostrando sesión.

```powershell
pnpm verify
```

Este comando ejecuta lint, formato, pruebas, validación Prisma, build y `db:test` sin usar la base
compartida. Resultados y revisión de navegador en [verification.md](verification.md).

## 4.7 Limitaciones

- No hay backend educativo, guardado de progreso, reconocimiento LSV, captura ni evaluación de cámara.
- No hay envío/verificación de correo, edición de perfil, recuperación de contraseña ni OAuth.
- Métricas educativas, resolución de reportes y desactivación/reactivación requieren servicios futuros.
  Reportes, evidencia privada y listado de usuarios ya usan servicios reales.
- Figma: la página actual contiene Perfil, Seguridad y Foto; Lección y Progreso no tienen frames
  propios. La auditoría actual distingue inventario, capturas y dependencias pendientes.
- La emulación Chrome y SQL en memoria no sustituyen validación con hardware, cookies de terceros
  ni toda la matriz de navegadores. Las pruebas no escriben fixtures en PostgreSQL compartido.

## 4.8 URLs y estado de publicación

| Entorno              | URL                                              | Evidencia y alcance                                                                                        |
| -------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Frontend configurado | `https://vocessilentes.netlify.app/`             | Sitio existente del usuario; `netlify.toml` prepara el nuevo build, sin publicar estos cambios             |
| API configurada      | `https://voces-silentes-platform.vercel.app/api` | Dominio existente; autenticación desplegada comprobada en la tarea anterior, registrada en verification.md |
| Frontend local       | `http://localhost:5173`                          | Puerto de ejemplo; el entorno existente puede usar 5174 u otro FRONTEND_PORT                               |
| API local            | `http://localhost:3000/api`                      | Requiere configuración privada de base para autenticación/persistencia                                     |

La revisión de esta fase usa una compilación de producción **local** con API y base aisladas;
no confirma que los nuevos archivos estén publicados. Para actualizarlos será necesario un
despliegue autorizado y reconstrucción con las variables públicas indicadas. No se realizó
commit, push ni deploy. Las evidencias remotas históricas no se presentan como una ejecución nueva.
