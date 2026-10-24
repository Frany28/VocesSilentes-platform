import { HttpError } from '../../errors/http-error.js';
import { persistReport } from './reports.creation.js';
import { confirmEvidence } from './evidence-confirmation.js';

/**
 * Reutiliza Prisma; los permisos de lectura se filtran antes de proyectar datos.
 * @param {object} database Cliente Prisma existente.
 * @returns {object} Operaciones de persistencia de reportes y reservas de evidencia.
 */
export function createReportsRepository(database) {
  const include = {
    evidence: true,
    author: { select: { firstName: true, lastName: true, username: true } },
    resolvedBy: { select: { firstName: true, lastName: true } },
  };
  const scope = (actor) => (actor.role === 'ADMIN' ? {} : { authorId: actor.id });
  return {
    async get(actor, id, ownerOnly = false) {
      const report = await database.report.findFirst({
        where: { id, ...(ownerOnly ? { authorId: actor.id } : scope(actor)) },
        include,
      });
      if (!report) throw new HttpError(404, 'REPORT_NOT_FOUND', 'Reporte no encontrado');
      return report;
    },
    create: (actor, input) => persistReport(database, actor, input, include),
    async list(actor, { page, q, status }) {
      const where = {
        ...scope(actor),
        ...(status ? { status } : {}),
        ...(q ? { description: { contains: q, mode: 'insensitive' } } : {}),
      };
      const [reports, total] = await database.$transaction([
        database.report.findMany({
          where,
          include,
          skip: (page - 1) * 30,
          take: 30,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }),
        database.report.count({ where }),
      ]);
      return { reports, total, page, pages: Math.max(1, Math.ceil(total / 30)) };
    },
    reserve: (data) => database.reportEvidence.create({ data }),
    ready: (id) => confirmEvidence(database, id),
    claim: (id, before = new Date()) =>
      database.reportEvidence.updateMany({
        where: { id, state: 'PENDING', createdAt: { lt: before } },
        data: { state: 'DELETING' },
      }),
    stale: () =>
      database.reportEvidence.findMany({
        where: {
          OR: [
            { state: 'DELETING' },
            { state: 'PENDING', createdAt: { lt: new Date(Date.now() - 900000) } },
          ],
        },
        take: 100,
        orderBy: { createdAt: 'asc' },
      }),
    discard: (id) => database.reportEvidence.deleteMany({ where: { id, state: 'DELETING' } }),
  };
}
