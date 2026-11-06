/**
 * Respuesta identificada solo para pruebas del contrato visual; jamás se importa desde producción.
 * @returns {object} Métricas sintéticas para comprobar valores, filtros, accesibilidad y estados.
 */
export function metricsResponse() {
  return {
    users: 12,
    enabledUsers: 8,
    disabledUsers: 4,
    pendingReports: 3,
    resolvedReports: 2,
    reports: [],
    generatedAt: '2026-11-05T16:00:00Z',
    period: { startDay: '2026-11-04', endDay: '2026-11-05', timeZone: 'America/Caracas' },
    activity: {
      active7: 5,
      active30: 7,
      uniqueUsers: 2,
      daily: [
        { day: '2026-11-04', users: 1 },
        { day: '2026-11-05', users: 2 },
      ],
    },
    catalog: { modulesPublished: 2, lessonsPublished: 5, exercisesAvailable: 9 },
    education: {
      lessonsStarted: 3,
      cohortCompleted: 1,
      lessonsCompleted: 2,
      exercisesCompleted: 4,
      completionPercentage: 33.33,
      completionUnavailableReason: null,
      daily: [
        { day: '2026-11-04', started: 2, lessons: 1, exercises: 1 },
        { day: '2026-11-05', started: 1, lessons: 1, exercises: 3 },
      ],
      byModule: [{ id: 'software-module-only', title: 'Módulo sintético de prueba', completed: 2 }],
    },
    limitations: ['Fixture de software: no representa datos reales de estudiantes.'],
  };
}
