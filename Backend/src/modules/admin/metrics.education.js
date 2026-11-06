/**
 * Agrega progreso persistido de estudiantes no eliminados en contenido actualmente publicado.
 * @param {object} tx Instantánea Prisma.
 * @param {object} range Límites inclusivo/exclusivo y zona del gráfico.
 * @returns {Promise<object>} Eventos de finalización, cohorte de inicios y distribución por módulo.
 */
export async function readEducationMetrics(tx, range) {
  const rows = await tx.$queryRaw`
    WITH lessons AS (
      SELECT p.*, m.id AS module, m.title AS title FROM vocessilentes."LessonProgress" p
      JOIN vocessilentes."User" u ON u.id = p."userId"
      JOIN vocessilentes."Lesson" l ON l.id = p."lessonId"
      JOIN vocessilentes."Module" m ON m.id = l."moduleId"
      WHERE u."isDeleted" = false AND u.role = 'USER'
        AND l."publicationStatus" = 'PUBLISHED' AND m."publicationStatus" = 'PUBLISHED'
    ), events AS (
      SELECT 'started' AS kind, "startedAt" AS at, module, title FROM lessons
        WHERE "startedAt" >= ${range.from} AND "startedAt" < ${range.to} AND status <> 'NOT_STARTED'
      UNION ALL
      SELECT 'lessons', "completedAt", module, title FROM lessons
        WHERE status = 'COMPLETED' AND "completedAt" >= ${range.from} AND "completedAt" < ${range.to}
      UNION ALL
      SELECT 'exercises', p."completedAt", m.id, m.title FROM vocessilentes."ExerciseProgress" p
      JOIN vocessilentes."User" u ON u.id = p."userId"
      JOIN vocessilentes."Exercise" e ON e.id = p."exerciseId"
      JOIN vocessilentes."Lesson" l ON l.id = e."lessonId"
      JOIN vocessilentes."Module" m ON m.id = l."moduleId"
      WHERE u."isDeleted" = false AND u.role = 'USER' AND p.status = 'COMPLETED'
        AND l."publicationStatus" = 'PUBLISHED' AND m."publicationStatus" = 'PUBLISHED'
        AND p."completedAt" >= ${range.from} AND p."completedAt" < ${range.to}
    )
    SELECT 'TOTAL' AS kind, '' AS key, '' AS title,
      count(*) FILTER (WHERE status <> 'NOT_STARTED' AND "startedAt" >= ${range.from}
        AND "startedAt" < ${range.to})::int AS value,
      count(*) FILTER (WHERE status = 'COMPLETED' AND "startedAt" >= ${range.from}
        AND "startedAt" < ${range.to} AND "completedAt" < ${range.to})::int AS cohort
      FROM lessons
    UNION ALL
    SELECT kind, to_char(at AT TIME ZONE ${range.timeZone}, 'YYYY-MM-DD'), '', count(*)::int, 0
      FROM events GROUP BY 1, 2
    UNION ALL
    SELECT 'MODULE', module::text, title, count(*)::int, 0 FROM events
      WHERE kind = 'lessons' GROUP BY module, title
  `;
  const total = rows.find((item) => item.kind === 'TOTAL');
  const counts = new Map(rows.map((item) => [`${item.kind}:${item.key}`, item.value]));
  const daily = range.days.map((day) => ({ day, started: counts.get(`started:${day}`) ?? 0,
    lessons: counts.get(`lessons:${day}`) ?? 0, exercises: counts.get(`exercises:${day}`) ?? 0 }));
  return {
    lessonsStarted: total.value, cohortCompleted: total.cohort,
    lessonsCompleted: daily.reduce((sum, item) => sum + item.lessons, 0),
    exercisesCompleted: daily.reduce((sum, item) => sum + item.exercises, 0),
    completionPercentage: total.value ? Math.round(total.cohort / total.value * 10000) / 100 : null,
    completionUnavailableReason: total.value ? null : 'No hay lecciones iniciadas en el período para calcular el porcentaje.',
    daily,
    byModule: rows.filter((item) => item.kind === 'MODULE')
      .map((item) => ({ id: item.key, title: item.title, completed: item.value }))
      .sort((a, b) => b.completed - a.completed || a.title.localeCompare(b.title)),
  };
}
