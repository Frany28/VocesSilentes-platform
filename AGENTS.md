# Instrucciones de trabajo — VocesSilentes

## Antes de modificar

- Leer este archivo, README.md y la documentación de la tarea en docs/.
- Revisar archivos, dependencias y cambios existentes antes de crear componentes o utilidades.
- Mantener los cambios dentro de la tarea solicitada. Esta base no autoriza construir el MVP.
- Conservar el trabajo del usuario; no sobrescribirlo ni usar operaciones destructivas.
- No introducir secretos en código, documentación, logs ni commits. VITE_* siempre es público.
- Actualizar documentación si cambian contratos, arquitectura, dependencias o configuración.
- Ejecutar los controles correspondientes y comunicar los resultados reales, incluidos bloqueos.
- No presentar datos simulados como integraciones funcionales.
- No crear abstracciones, pruebas triviales ni dependencias sin una necesidad concreta.

## Tamaño y responsabilidades

- Procurar aproximadamente 100 líneas útiles o menos por archivo de código.
- ESLint advierte con max-lines (100, excluye comentarios y líneas vacías) y max-len (120).
- Dividir por responsabilidades coherentes; no generar fragmentos artificiales ni archivos vacíos.
- Una excepción necesita una razón concreta documentada junto al código y en docs/development.md.
- No comprimir instrucciones en una línea para esquivar el límite ni desactivar reglas para ocultar fallos.
- Mantener componentes, hooks, controllers y services enfocados en una responsabilidad.
- Evitar archivos globales de utilidades con funciones sin relación.

## JavaScript y JSDoc

- Aplicaciones en JavaScript ESM; usar extensiones explícitas en imports locales.
- Documentar funciones exportadas, hooks, servicios y contratos relevantes con JSDoc:
  propósito, parámetros, retorno, errores y efectos secundarios relevantes.
- Usar typedef cuando ayude a describir un contrato; explicar decisiones no evidentes.
- No comentar cada línea ni documentar operaciones triviales para cumplir una cuota.
- ESLint comprueba nombres de parámetros, tipos y etiquetas JSDoc; advierte documentación faltante.
- Prisma genera TypeScript automáticamente, compilado a ESM por esbuild. No editar generated/.

## Frontend y backend

- Separar presentación, estado y servicios de API. Reutilizar src/lib/http.js.
- No hacer peticiones desde componentes visuales reutilizables.
- Preservar errores consistentes y soporte de AbortSignal del cliente HTTP.
- Centralizar errores y configuración; validar entradas de módulos en el backend con Zod.
- Los controllers gestionan HTTP; los services contienen negocio; acceso Prisma fuera de controllers.
- Separar rutas, validaciones, controllers, services y repositorios cuando la complejidad lo justifique.
- Los permisos se comprueban en backend; el frontend no es la única protección.
- GET /api/health solo indica vida HTTP. PostgreSQL se comprueba explícitamente con db:check.
- CORS usa orígenes exactos, nunca comodines. CORS no sustituye autorización.
- Registrar solo campos permitidos; no bodies, URLs, cookies, headers ni mensajes internos con secretos.
- Conservar cierre HTTP y desconexión de Prisma; no abrir el puerto en src/app.js.

## Diseño y MediaPipe

- Seguir docs/design-system.md; sin enlace y acceso a Figma no inventar tokens del diseño.
- Seguir docs/mediapipe.md; cámara solo por acción explícita del usuario.
- Cargar modelos cuando se necesitan, fijar versiones WASM/modelos y liberar tareas y vídeo al salir.
- No subir vídeo ni imágenes por defecto ni afirmar que detección de manos reconoce LSV.
- No crear clasificadores simulados ni instalar TensorFlow.js sin necesidad demostrada.

## Controles

- pnpm verify: lint, formato, pruebas, validación Prisma y build sin PostgreSQL.
- pnpm db:check: requiere PostgreSQL real y DATABASE_URL privada.
- pnpm db:migrate: solo con base de desarrollo y modelos aprobados. Revisar SQL y permisos de shadow DB.
- Mantener un único pnpm-lock.yaml y versiones estables compatibles; no usar --force para conflictos.
- Mantener los scripts compatibles con Windows y VS Code. No depender solo de Bash.
- Reportar por separado validación local y GitHub Actions; no afirmar ejecución remota sin evidencia.
