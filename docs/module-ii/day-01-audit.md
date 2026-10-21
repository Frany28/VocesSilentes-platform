# Auditoría inicial — Día 1

Inspección local del 20 de octubre de 2026, antes de implementar. Árbol de trabajo limpio;
rama de trabajo `module-ii/day-01`. Esta tabla describe el punto de partida.

| Área                                | Estado       | Evidencia inicial y reutilización                                                        |
| ----------------------------------- | ------------ | ---------------------------------------------------------------------------------------- |
| PostgreSQL / Prisma                 | Implementado | Nueve modelos en `Backend/prisma/*.prisma`; esquema privado `vocessilentes`              |
| Migraciones                         | Implementado | Solo `20261009000100_phase_one`, con PK, UNIQUE, 13 FK RESTRICT/CASCADE, 27 CHECK y RLS  |
| Crear / consultar / editar usuarios | Implementado | POST `/api/admin/users`, GET/PATCH `/api/admin/users/:id`; Prisma, Zod y Argon2id reales |
| Permisos administrativos            | Implementado | Sesión, rol ADMIN, CSRF y transporte; advisory lock y relectura del actor en escrituras  |
| Listado administrativo              | Parcial      | UI con demos y UUID recordados en localStorage; sin GET de colección PostgreSQL          |
| Eliminación lógica                  | Pendiente    | User ya tiene isDeleted/deletedAt; UI solo simula cambio de isActive                     |
| Bitácora persistente                | Pendiente    | Pino registra eventos técnicos; no existe AuditLog                                       |
| Formularios persistentes            | Implementado | Registro/login y creación/edición Admin; no contenido, progreso ni reportes              |
| Validaciones                        | Implementado | Zod estricto, normalización, UUID, contraseña, UNIQUE y protección del último ADMIN      |
| Pruebas aisladas                    | Implementado | node:test/Supertest, Vitest/Testing Library, PGlite con PrismaPg y Argon2 reales         |
| SQL académico reproducible          | Pendiente    | Hay migración y fixtures internos, sin scripts de entrega ni seed académico              |
| OAuth e identidades externas        | No aplicable | Modelo sin autenticación/vinculación implementada; no fabricar sujetos externos          |
| Backend educativo (Día 2)           | No aplicable | Fuera del alcance de esta entrega                                                        |

## Archivos y documentación revisados

Modelos originales: User, ExternalIdentity, Session, Module, Lesson, Exercise, LessonProgress,
ExerciseProgress y Report. Única migración inicial: `20261009000100_phase_one`.

- `AGENTS.md`, `README.md`, `docs/{admin,api,architecture,authentication,data-model,development,migrations,verification,design-system}.md`.
- `Backend/prisma/{schema,accounts,content,progress,reports}.prisma` y migración inicial completa.
- `Backend/src/modules/admin/*.js`, middleware de autenticación y proyecciones públicas.
- `Backend/tests/auth/{fixture,admin-users,admin-validation,admin-invariant}.test.js`
  (el fixture es `fixture.js`), `Backend/tests/database/{fixture.js,security.test.js}`.
- `Frontend/src/features/admin/{pages,components,data,forms}/` y pruebas `Frontend/src/test/admin-*`.
- Scripts de los tres `package.json`, configuración ESLint y flujo `pnpm verify`.

## Cambios mínimos identificados

Conservar creación, edición y lectura individual. Añadir listado paginado y borrado lógico al módulo
administrativo, reutilizar su transacción para auditoría y revocación, añadir una migración aditiva
y SQL académico derivado del historial. Sustituir únicamente el listado demo por consulta real y
añadir confirmación de eliminación. Mantener demos explícitas de resumen/reportes y el Día 2 pendiente.

La auditoría inicial no comprueba el estado actual de Supabase ni implica autorización para migrarlo.
El resultado final y los controles ejecutados se registran en [implementación](day-01-implementation.md)
y [pruebas](day-01-testing.md).
