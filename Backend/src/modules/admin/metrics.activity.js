/**
 * Agrega actividad atribuida al actor: sesiones creadas y bitácora, nunca isActive ni cambios de otra persona.
 * @param {object} tx Transacción de solo lectura.
 * @param {object} range Límites [from,to), zona y calendario del gráfico.
 * @returns {Promise<object>} Personas distintas por ventana y día; no expone IDs ni sesiones.
 */
export async function readActivityMetrics(tx, range) {
  const since30 = new Date(Number(range.to) - 30 * 86400000);
  const since7 = new Date(Number(range.to) - 7 * 86400000);
  const earliest = new Date(Math.min(Number(range.from), Number(since30)));
  const rows = await tx.$queryRaw`
    WITH events AS (
      SELECT "userId" AS actor, "createdAt" AS at FROM vocessilentes."Session"
      WHERE "createdAt" >= ${earliest} AND "createdAt" < ${range.to}
      UNION ALL
      SELECT "actorId" AS actor, "createdAt" AS at FROM vocessilentes."AuditLog"
      WHERE "createdAt" >= ${earliest} AND "createdAt" < ${range.to}
    ), observed AS (
      SELECT e.* FROM events e JOIN vocessilentes."User" u ON u.id = e.actor
      WHERE u."isDeleted" = false
    )
    SELECT 'WINDOWS' AS day,
      count(DISTINCT actor) FILTER (WHERE at >= ${since7})::int AS "active7",
      count(DISTINCT actor) FILTER (WHERE at >= ${since30})::int AS "active30",
      count(DISTINCT actor) FILTER (WHERE at >= ${range.from})::int AS users
    FROM observed
    UNION ALL
    SELECT to_char(at AT TIME ZONE ${range.timeZone}, 'YYYY-MM-DD'), 0, 0,
      count(DISTINCT actor)::int FROM observed WHERE at >= ${range.from} GROUP BY 1
  `;
  const windows = rows.find((item) => item.day === 'WINDOWS');
  const daily = new Map(rows.filter((item) => item.day !== 'WINDOWS').map((item) => [item.day, item.users]));
  return {
    active7: windows.active7, active30: windows.active30, uniqueUsers: windows.users,
    definition: 'Personas con inicio de sesión o acción registrada en bitácora. Incluye USER y ADMIN; excluye eliminadas.',
    daily: range.days.map((day) => ({ day, users: daily.get(day) ?? 0 })),
  };
}
