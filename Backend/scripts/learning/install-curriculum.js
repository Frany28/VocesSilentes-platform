import { readAlphabetSource } from './alphabet-source.js';
import { insertAlphabet } from './seed-alphabet.js';
import { planCurriculum } from './curriculum-plan.js';

/**
 * Aplica el plan editorial en una sola transacción; requiere autorización explícita para la base destino.
 * Nunca publica borradores ni escribe usuarios, lecciones existentes o tablas de progreso.
 * @param {object} database Prisma de la base autorizada, con la migración aditiva aplicada.
 * @returns {Promise<object[]>} Metadatos finales; repetir no actualiza filas que ya coinciden.
 * @throws {Error} Ante colisiones, cargas parciales o errores SQL; revierte toda la operación.
 */
export async function installCurriculum(database) {
  const source = await readAlphabetSource();
  return database.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(611050001)`;
      // Bloquea la edición concurrente del catálogo y evita conflictos del índice UNIQUE(order).
      await tx.$executeRaw`LOCK TABLE vocessilentes."Module" IN SHARE ROW EXCLUSIVE MODE`;
      await insertAlphabet(tx, source);
      const modules = await tx.module.findMany({ orderBy: { order: 'asc' } });
      const plan = planCurriculum(modules, source);
      const changed = plan.filter((item) => {
        const current = modules.find((row) => row.id === item.id);
        return (
          !current ||
          Object.entries(item).some(([key, value]) => key !== 'action' && current[key] !== value)
        );
      });
      const maxOrder = Math.max(...modules.map((item) => item.order), plan.length);
      if (maxOrder + changed.length + 1 >= 2147483647)
        throw new Error('Orden curricular fuera de rango');
      for (const [index, item] of changed.entries()) {
        if (modules.some((row) => row.id === item.id))
          await tx.module.update({ where: { id: item.id }, data: { order: maxOrder + index + 1 } });
      }
      for (const { id, action, ...data } of changed) {
        if (action === 'CREATE_DRAFT') await tx.module.create({ data: { id, ...data } });
        else await tx.module.update({ where: { id }, data });
      }
      return plan;
    },
    { timeout: 30000 },
  );
}
