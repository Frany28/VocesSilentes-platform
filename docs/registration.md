# Registro — datos y presentación

`/register` utiliza la misma composición del login: marca, selector de tema, fondos, tarjeta,
controles, ilustración, animaciones y enlaces. Se adaptan título, descripción, acciones y campos.
Reutiliza los recursos y tokens existentes; no se atribuye a una nueva referencia de Figma.
La tarjeta crece con sus cinco campos, ayudas y errores, también en móvil y con movimiento reducido.

## Correspondencia con la base de datos

El formulario coincide con `registrationSchema` en `Backend/src/modules/auth/auth.validation.js`
y `User` en `Backend/prisma/accounts.prisma`. No requiere cambios ni migraciones de la base.

| Campo del formulario | Entrada API | Regla del backend                                                                         |
| -------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| Nombre               | `firstName` | Obligatorio; recortado, 1–100 puntos de código Unicode                                    |
| Apellido (opcional)  | `lastName`  | Se omite si está vacío o solo contiene espacios; presente, 1–100 puntos de código Unicode |
| Nombre de usuario    | `username`  | Recortado y en minúsculas; 3–50 letras ASCII, números o `_`                               |
| Correo electrónico   | `email`     | Recortado y en minúsculas; correo ASCII válido, máximo 254 caracteres                     |
| Contraseña           | `password`  | 15–128 puntos de código Unicode y máximo 512 bytes UTF-8; sin recortar ni transformar     |

El backend convierte la contraseña en `passwordHash` mediante Argon2id antes de persistirla.
El registro público fija `role=USER` y `emailVerified=false`; la base/servidor generan UUID,
fechas y estados iniciales. El formulario no envía roles, hashes, verificación, perfil ni estados.
Correo y usuario son únicos en PostgreSQL; un conflicto se muestra como un aviso genérico,
sin identificar cuál de los dos está reservado. No se comprueba disponibilidad con una API simulada.

El límite nativo de los nombres permite 200 unidades UTF-16 para no truncar caracteres de dos
unidades; la validación local y Zod limitan el valor recortado a 100 puntos de código Unicode.

La validación local refleja las reglas del backend y enfoca el primer campo incorrecto antes
de pedir CSRF o enviar datos. Los errores se asocian a cada control y se corrigen al editarlo.
El backend conserva la validación autoritativa y las restricciones reales de persistencia.

## Flujo y archivos

`AuthLayout.jsx` comparte la página y `AuthForm.jsx` la tarjeta, mensajes y acciones con login.
`features/auth/registration/` contiene página, campos, validación y mensajes del registro.
Se conservan `useAuthForm`, AuthProvider y el cliente HTTP con cookies, CSRF y AbortSignal.
Durante el envío se deshabilitan campos, visibilidad y botón, evitando solicitudes duplicadas.
Red, CSRF caducado y servicio no disponible permiten reintento explícito; 429 respeta Retry-After
cuando el navegador puede leerlo. Nunca se repite automáticamente el registro.

El registro crea cuenta y sesión; USER entra al área `/student` tras confirmar el éxito,
salvo retorno publicado y autorizado. No incluye envío de correo ni recuperación de contraseña.
Las condiciones de despliegue Netlify/Vercel y cookies entre sitios siguen en [netlify.md](netlify.md).

## Comprobación

Las pruebas frontend comparan los límites con el esquema real de validación del backend,
incluidos espacios y Unicode; comprueban el payload, apellido vacío, errores accesibles,
carga, envío único, conflicto genérico y navegación. Fetch es un doble de transporte.
`pnpm verify` también ejecuta la integración de auth existente con SQL y Argon2 reales
en una base efímera aislada; no crea usuarios en la base compartida.
Resultados locales y revisión visual en [verification.md](verification.md).
