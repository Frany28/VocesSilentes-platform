# Pendientes del Día 2 — módulos educativos

El Día 1 no implementa backend educativo, reconocimiento LSV, cámara, métricas ni reportes reales.
Los modelos existentes permiten preparar los siguientes procesos cuando se apruebe su alcance.

1. Definir contratos de CRUD ADMIN de Module/Lesson/Exercise, validación Zod y orden único
   global/por padre. Reutilizar Prisma, sesión/rol ADMIN y CSRF en cada escritura.
2. Acordar recursos LSV válidos para `expectedSignKey`, multimedia y publicación. Ofrecer a USER
   únicamente ejercicios cuyos módulos y lecciones estén publicados.
3. Sustituir las demos Student por servicios reales con carga/error/vacío, sin inventar progreso.
4. Persistir progreso por `req.auth.id`; conservar UNIQUE usuario/contenido y CHECK de estados/fechas.
   El cliente nunca decide la identidad autorizada ni concede permisos.
5. Decidir qué operaciones educativas requieren auditoría. Ampliar enum y CHECK de entityType
   mediante una nueva migración y una política explícita; hoy AuditLog admite exclusivamente User.

## Dependencias y contratos que conservar

- Revisar y aplicar la migración del Día 1 solo en desarrollo autorizado antes de probarlo con datos propios.
- Mantener envelopes `{data: ...}` / `{error:{code,message}}`, cliente HTTP compartido y AbortSignal;
  las consultas usan `options.query` como URLSearchParams, sin permitir URLs arbitrarias en path.
- Proteger sesión, CSRF, rol y transporte en backend. Mantener errores públicos sin secretos.
- Conservar FK RESTRICT/CASCADE, borrado lógico de usuarios, reserva de email/username e historial.
- No editar migraciones aplicadas ni poblar Supabase con fixtures académicos.
- Aplicar [sistema visual](../design-system.md) y [MediaPipe](../mediapipe.md): cámara por acción
  explícita, liberar recursos; detección de manos no equivale a reconocer LSV.
- Ejecutar `pnpm verify` y nuevas pruebas de integración aislada. Validar concurrencia real
  multiworker en PostgreSQL 17 con infraestructura autorizada antes de afirmar esa cobertura.

Quedan también para decisiones posteriores: retención/anonimización de auditoría, purga de sesiones,
restauración de cuentas, búsquedas de gran volumen, OAuth verificable y UI de auditoría.

El rediseño posterior de [Admin](../admin.md) implementa su presentación y reutiliza usuarios/perfil
reales. No implementa backend educativo ni amplía los contratos: siguen pendientes reportes,
resolución/comentarios/evidencia autorizada, cambio de isActive, contraseña y persistencia de foto.
Las rutas administrativas ya no proporcionan las demos del Día 1 para esas capacidades.
