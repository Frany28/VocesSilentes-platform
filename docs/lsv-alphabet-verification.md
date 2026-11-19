# Verificación del pipeline LSV — 18 de noviembre de 2026

Validación local en Windows, Node 22.23.4 y pnpm 10.18.2. Checkout aislado basado en
`origin/main` (`ac647c6`), rama `codex/lsv-alphabet-data-pipeline`. No se modificó la
copia de trabajo anterior ni sus cambios de imágenes.

## Resultados finales

| Control | Resultado real |
| --- | --- |
| Regresiones LSV: `node --test Backend/tests/lsv-*.test.js` | 55/55 correctas |
| Suite backend completa | 104/104 correctas |
| Suite frontend completa | 264 correctas / 9 fallidas, de 273 |
| Línea base frontend de main, antes de cambios | 261 correctas / las mismas 9 fallidas, de 270 |
| Lint de aplicación: `pnpm exec eslint Backend Frontend shared eslint.config.js` | Sin errores; advertencia preexistente de 101 líneas en `Backend/tests/auth/login.test.js` |
| Formato de archivos modificados/nuevos | Comprobado con Prettier |
| `pnpm build` | Correcto: Vite, sintaxis backend y generación/compilación Prisma |
| `pnpm db:validate` | Esquema válido; sin conectar a una base compartida |
| `pnpm db:test` | 86 correctas / 1 fallida, de 87, en PostgreSQL WASM efímero |
| `pnpm video:verify` | Correcto: seis vistas (390/834/1440, claro/oscuro), 28 clases de cobertura, sin overflow horizontal |
| Auditoría del lote real provisional | Nueve muestras disponibles, cero elegibles; 27 letras y NONE pendientes |
| Intento de entrenamiento real | Rechazado antes de escribir modelo/evaluación; código 1 |
| Modelo demo y lockfile | Sin cambios; hash del demo conservado en la auditoría |

El importador se probó con video sintético **sin manos**, decodificación local y MediaPipe reales:
46 observaciones decodificadas; intervalo inválido rechazado antes de cargar el modelo; ausencia de
mano rechazada. No se solicitó cámara física ni se escribieron aciertos/progreso. Se inspeccionaron
capturas de escritorio/móvil y cobertura. No se midió precisión de LSV con ese video.

Las 14 pruebas backend añadidas y las tres frontend añadidas verifican software, no son nuevas
muestras ni participantes. Las pruebas existentes se adaptaron donde una traslación era una copia
de otra captura o donde se contaban metadatos como muestras revisadas sin examinar el contrato.

## Bloqueos generales que ya están en main

`pnpm verify` **no está verde**: se detiene en 76 errores ESLint de los cuatro archivos CJS de
`.agents/skills/security-audit/`, que main ya versiona sin el contexto Node correspondiente.
Esos archivos y la configuración global no se modificaron. El lint de código de aplicación sí pasó.

`pnpm format:check` detecta ocho archivos preexistentes fuera de esta tarea: los seis archivos
versionados de `.agents/skills/` y `Backend/tests/auth/admin-password-reset.test.js`,
`Frontend/src/features/auth/login/login-validation.js`. Se verificó por separado el formato
de todos los archivos de esta entrega.

Las nueve pruebas frontend que fallan son las mismas de la línea base: manejo de espacios en
contraseñas en `account-settings`, `admin-validation`, `auth-forms` (dos), `login-fields`,
`login-submit`, `login-validation`, `registration-validation` y `ui-fields`.
No se modificaron autenticación ni Input/PasswordInput para resolverlas.

El fallo SQL está en `Backend/tests/auth/registration.test.js:25`: una contraseña de la fixture
coincide con su versión trim cuando la prueba espera que difieran. Es ajeno al pipeline y coincide
con la incompatibilidad de espacios de las pruebas de autenticación.

## Reproducción y evidencia

Ejecutar los comandos anteriores desde la raíz del checkout con dependencias del lockfile.
La auditoría se reproduce con:

```powershell
pnpm lsv:readiness .local/lsv-experimental/experimental-samples.json --json --output .local/auditoria.json
```

Los datos privados no forman parte del PR. El snapshot agregado versionado conserva la huella
del archivo auditado para contrastar la reproducción sin publicar puntos o códigos de personas.

Evidencia local, excluida de Git, en `.local/` del worktree: `baseline-tests.log`,
`final-tests.log`, `backend-lsv-tests.log`, `application-lint.log`, `format-check.log`,
`verify.log`, `build.log`, `prisma-validation.log`, `database-tests.log`,
`real-training-attempt.log` y `video-import-review/`.

Estos resultados son **locales**. El estado remoto de GitHub Actions se consulta por separado
después de publicar la rama; no se presenta como una ejecución local ni como validación lingüística.
