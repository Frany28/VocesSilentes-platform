# Desarrollo en Windows y VS Code

## Preparación

Instalar Node 22.23.1 y pnpm 10.18.2 como describe README. Verificar versiones después de abrir una
terminal nueva. Abrir la raíz del workspace en VS Code; `.vscode/extensions.json` recomienda ESLint,
Prettier y Tailwind IntelliSense. Los scripts son JavaScript o comandos pnpm, sin dependencia de Bash.
`.editorconfig`, `.gitattributes` y Prettier mantienen UTF-8, espacios y LF.

Si PowerShell impide ejecutar un shim `.ps1`, usar `pnpm.cmd` en lugar de cambiar globalmente las
políticas de ejecución. Si Corepack está disponible, puede gestionar la versión packageManager;
no es requisito y no hay que reemplazar una instalación funcional del equipo.

`pnpm install --frozen-lockfile` reproduce las dependencias. Para añadir una dependencia justificada,
usar `pnpm --filter @vocessilentes/frontend add paquete@version` o el filtro backend, y `add -D`
para herramientas. Los scripts de instalación permitidos se restringen en pnpm-workspace.yaml a
Prisma y esbuild. Revisar nuevos scripts antes de autorizarlos, sin usar --force para resolver conflictos.

## Trabajo diario

1. Leer AGENTS.md y la documentación relacionada; revisar el estado existente.
2. Iniciar `pnpm dev`; cada app admite ejecución independiente.
3. Implementar solo la tarea acordada y actualizar contratos/documentación cuando corresponda.
4. Aplicar `pnpm format`; ejecutar `pnpm verify` antes de entregar.
5. Si se toca persistencia, comprobar también PostgreSQL con `pnpm db:check`.

Vite usa localhost:5173 y strictPort: true: si está ocupado, cambiar FRONTEND_PORT en Frontend/.env
y sus orígenes CORS en Backend/.env. No detener procesos ajenos. Preview usa 4173.
Express usa HOST/PORT del entorno. En el equipo de preparación, los `.env` locales usan 5174
porque 5173 ya estaba ocupado; los ejemplos conservan el valor habitual de 5173.
`Ctrl+C` cierra desarrollo. El servidor espera peticiones activas y libera Prisma al recibir señales.

## Variables

| Variable      | Dónde                  | Valor inicial / significado                                       |
| ------------- | ---------------------- | ----------------------------------------------------------------- |
| VITE_API_URL  | Frontend, pública      | http://localhost:3000/api; HTTP(S) sin credenciales/query/hash    |
| FRONTEND_PORT | Frontend, solo tooling | 5173; puerto de desarrollo Vite, no incluido en el bundle         |
| NODE_ENV      | Backend, privada       | development; también test o production                            |
| HOST          | Backend, privada       | localhost; interfaz para escuchar                                 |
| PORT          | Backend, privada       | 3000; entero entre 1 y 65535                                      |
| CORS_ORIGINS  | Backend, privada       | Orígenes HTTP(S) exactos separados por coma, sin ruta             |
| LOG_LEVEL     | Backend, privada       | info; niveles estándar Pino o silent                              |
| DATABASE_URL  | Backend, privada       | Vacía desactiva DB; postgres:// o postgresql:// para persistencia |

Los ejemplos no contienen credenciales reales. `.env` no se versiona. La configuración inválida
detiene el arranque antes de escuchar y comunica nombres de variables sin mostrar sus valores.
Producción exige CORS_ORIGINS explícito. En Vite todos los VITE_* llegan al navegador; no incluir
DATABASE_URL ni secretos bajo ese prefijo. Reiniciar/reconstruir al cambiar valores públicos.

## Convenciones y controles

Usar JavaScript ESM y JSDoc en APIs exportadas, hooks, servicios y contratos. Tipar con typedef cuando
ayude. No comentar código evidente. Funciones/archivos tienen una responsabilidad coherente.
No existen excepciones al objetivo de 100 líneas útiles en esta base; futuras excepciones deberán
explicar su razón en código y aquí, sin fragmentar artificialmente ni compactar instrucciones.
ESLint advierte tamaño/largo/documentación y comprueba consistencia JSDoc, hooks y Fast Refresh.

Pruebas frontend: Vitest, jsdom y Testing Library; se prueban rutas, temas y contrato HTTP con fetch
controlado. Backend: node:test y Supertest; configuración, salud, errores, CORS, límites JSON,
logs y cierre. Los dobles de Prisma en cierre comprueban ciclo de vida, no conectividad real.

`pnpm verify` no necesita `.env`, PostgreSQL ni cámara. Ejecuta lint, formato, pruebas, schema validate
y build con generación de Prisma. El build backend comprueba sintaxis y genera el cliente; no afirma
que PostgreSQL funciona. `pnpm db:generate` también se puede ejecutar por separado.

Para persistencia, instalar PostgreSQL 17 con la revisión mantenida, crear base y usuario de desarrollo,
guardar URL privada, generar cliente y ejecutar `pnpm db:check`. Nunca copiar una URL real a logs o docs.
Cuando se aprueben los modelos, `pnpm db:migrate --name nombre` creará la migración de desarrollo;
revisar SQL, añadirlo al control de versiones y regenerar el cliente con `pnpm db:generate`.

CI está preparado en `.github/workflows/verify.yml`, con Node/pnpm fijados y matriz Linux/Windows.
Usa frozen-lockfile, no base real, no despliegue y no secretos de producción. Subir archivos a un
repositorio GitHub y comprobar la ejecución remota es una tarea posterior.
