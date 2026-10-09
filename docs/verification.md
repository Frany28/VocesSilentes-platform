# Verificación de la base

Ejecutada localmente en Windows el **9 de octubre de 2026**, Node **22.23.1** y pnpm **10.18.2**.

| Control                                 | Resultado observado                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| Instalación pnpm                        | Correcta, dependencias fijadas sin conflictos forzados                                |
| Instalación frozen-lockfile desde caché | Correcta, sin modificar el único lockfile                                             |
| Lint                                    | Correcto, sin errores ni advertencias                                                 |
| Prettier                                | Formato aplicado y format:check correcto                                              |
| Backend                                 | 25 pruebas aprobadas con node:test y Supertest, sin PostgreSQL                        |
| Frontend                                | 11 pruebas aprobadas en 2 archivos con Vitest y Testing Library                       |
| Prisma validate                         | Esquema válido, sin entidades ni conexión a PostgreSQL                                |
| Prisma generate                         | Cliente 7.10.0 generado con esquema sin entidades y compilado a JavaScript ESM        |
| Cliente generado                        | Importado e instanciado con PrismaPg; desconectado sin abrir conexión                 |
| Build                                   | Frontend compilado; sintaxis backend y generación Prisma correctas                    |
| Arranque conjunto                       | pnpm dev inicia API en 3000 y Vite en 5175 con variables temporales                   |
| Comprobación HTTP real                  | Frontend 200, health 200, CORS exacto 5175 y ruta desconocida 404                     |
| Cierre                                  | Ctrl+C produjo log de cierre del backend; pruebas verifican cierre HTTP y desconexión |

Los puertos 5173 y después 5174 estaban ocupados por un Vite existente de este mismo workspace.
Se conservó ese proceso. Se agregó FRONTEND_PORT configurable y se usó 5175 solo para la comprobación
conjunta, con CORS_ORIGINS temporal correspondiente. Los `.env` locales, ignorados por Git, usan 5174;
los ejemplos usan 5173. El proceso iniciado para comprobar 5175 se detuvo al terminar.

El sandbox de Windows bloqueó inicialmente subprocesos de Vite con EPERM. Tests y build se ejecutaron
con acceso autorizado a esos procesos, sin cambiar reglas de lint ni forzar dependencias.
Las pruebas detectaron una URL inválida que escapaba de safeParse; se corrigió la validación
y los controles posteriores pasaron.

## No comprobado

- PostgreSQL: no hay DATABASE_URL de desarrollo configurada ni psql disponible en PATH.
  No se conectó a una base real ni se ejecutaron migraciones. Generación/instanciación no prueban conexión.
- Migraciones: no existen modelos aprobados ni SQL. El comando está preparado para una etapa posterior.
- MediaPipe: paquete instalado; no se descargaron modelos, activó cámara ni ejecutó inferencia.
  No existe reconocimiento LSV ni un modelo específico validado.
- Figma: sin referencia accesible; los estilos siguen siendo provisionales del navegador.
- GitHub Actions: workflow creado para Linux/Windows, sin despliegue. No se ejecutó remotamente.
  La carpeta inicial no contenía `.git`; no se creó historial, commit, PR ni publicación.
- Comprobación visual en navegador: cubierta funcionalmente con jsdom y HTTP; no se realizó
  validación de píxeles, contraste de un diseño aprobado ni cámara física.

`pnpm verify` completo terminó correctamente con código de salida 0.
Reproducción sin PostgreSQL: `pnpm install --frozen-lockfile` y `pnpm verify`.
Con una base de desarrollo configurada: `pnpm db:generate` y `pnpm db:check`.
