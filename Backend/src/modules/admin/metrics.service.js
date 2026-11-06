import { metricsPeriod } from './metrics-period.js';
import { readAccountMetrics } from './metrics.accounts.js';
import { readActivityMetrics } from './metrics.activity.js';
import { readCatalogMetrics } from './metrics.catalog.js';
import { readEducationMetrics } from './metrics.education.js';

/**
 * Extiende el resumen existente con métricas reales, parámetros validados e instantánea consistente sin escrituras.
 * @param {object} database Prisma conectado a la base configurada del backend.
 * @param {object} [input] Período 7/30/90 o fechas custom inclusivas, máximo 366 días.
 * @param {Date} [now] Un único reloj por consulta; no se expone como parámetro HTTP.
 * @returns {Promise<object>} Agregados actuales y del período, sin identidades en los gráficos.
 * @throws {Error} Filtros inválidos, base no disponible o consulta fallida; nunca sustituye fallos por ceros.
 */
export function readAdminMetrics(database, input = {}, now = new Date()) {
  const period = metricsPeriod(input, now);
  return database.$transaction(
    async (tx) => {
      await tx.$executeRaw`SET TRANSACTION READ ONLY`;
      // Normaliza también la serialización TIMESTAMPTZ del adaptador; los días se agrupan en Caracas.
      await tx.$executeRaw`SET LOCAL TIME ZONE 'UTC'`;
      const [bounds] = await tx.$queryRaw`
      SELECT (${period.startDay}::date::timestamp AT TIME ZONE ${period.timeZone}) AS "from",
        LEAST(((${period.endDay}::date + 1)::timestamp AT TIME ZONE ${period.timeZone}),
          ${now}::timestamptz) AS "to"
    `;
      const range = { ...period, ...bounds };
      const accounts = await readAccountMetrics(tx);
      const catalog = await readCatalogMetrics(tx);
      const activity = await readActivityMetrics(tx, range);
      const education = await readEducationMetrics(tx, range);
      return {
        ...accounts,
        catalog,
        activity,
        education,
        generatedAt: now,
        period: { ...period, days: undefined, ...bounds },
        limitations: [
          'Actividad observada: las lecturas pasivas sin evento no quedan registradas. No mide tiempo conectado.',
          'Catálogo, habilitación de cuentas y estado de reportes son totales actuales; no tienen historial reconstruible por período.',
          'El progreso refleja registros educativos; no certifica dominio de LSV ni reconocimiento por cámara.',
        ],
      };
    },
    { isolationLevel: 'RepeatableRead', timeout: 15000 },
  );
}
