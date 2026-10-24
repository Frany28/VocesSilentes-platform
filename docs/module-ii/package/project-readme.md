# Voces Silentes

Aplicación educativa de Lengua de Señas Venezolana con React/Tailwind CSS y Express/Prisma/PostgreSQL.
Incluye autenticación propia, cuentas, reportes con imágenes privadas, dashboard y bitácora.

## Ejecutar la demostración local

Requisitos: Node **22.23.1**, pnpm **10.18.2** y puerto 5280 libre.

```powershell
pnpm install --frozen-lockfile
pnpm db:generate
pnpm academic:demo
```

Abrir `http://localhost:5280`. Accesos sintéticos: ADMIN `academic_1@example.invalid` y USER
`academic_2@example.invalid`, contraseña pública **Solo practica local 2026!**.
La demo usa PostgreSQL WASM/TCP y almacenamiento local de prueba en memoria. No conecta a Supabase.
`Ctrl+C` cierra sus procesos; los cambios se descartan.

## Instalación persistente y controles

La [guía de desarrollo](docs/development.md) explica `.env`, PostgreSQL, migraciones, Storage y comandos.
Los secretos reales no se distribuyen. No ejecutar el seed académico sobre una base poblada.

```powershell
pnpm verify
pnpm academic:verify
```

El segundo comando necesita Chrome/Chromium; `CHROME_PATH` permite indicar su ejecutable.
Las evidencias generales de la entrega están en [PRUEBAS.md](../PRUEBAS.md).

- [Arquitectura y seguridad](docs/architecture.md).
- [Contratos de la API](docs/api.md).
- [Instalación, configuración y mantenimiento](docs/development.md).

La estructura es `Frontend/`, `Backend/` y `docs/`. Prisma genera el cliente durante el build;
no se editan sus archivos generados. Las lecciones no se amplían en esta versión y no existe
reconocimiento automático de LSV. OAuth y recuperación/envío de correo permanecen pendientes.
