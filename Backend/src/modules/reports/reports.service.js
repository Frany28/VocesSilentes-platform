import { HttpError } from '../../errors/http-error.js';
import { createReportsRepository } from './reports.repository.js';
import { createEvidenceService } from './evidence.service.js';
import { updateReportStatus } from './reports.status.js';

function present(report, admin) {
  const result = {
    id: report.id,
    description: report.description,
    title: report.description.slice(0, 100),
    reference: report.id,
    category: report.category,
    status: report.status,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    author: [report.author.firstName, report.author.lastName].filter(Boolean).join(' '),
    username: report.author.username,
    evidence: report.evidence
      ? {
          state: report.evidence.state,
          mimeType: report.evidence.mimeType,
          size: report.evidence.size,
          name: 'Imagen de evidencia',
        }
      : null,
  };
  if (admin)
    Object.assign(result, {
      internalComment: report.internalComment,
      resolvedAt: report.resolvedAt,
      resolvedBy: report.resolvedBy
        ? [report.resolvedBy.firstName, report.resolvedBy.lastName].filter(Boolean).join(' ')
        : null,
    });
  return result;
}

/**
 * Negocio real mínimo de reportes para el flujo de evidencia; conserva idempotencia por autor/requestId.
 * @param {object} database Prisma existente con conexión privada configurada.
 * @param {object | undefined} storage Storage exclusivo del servidor.
 * @returns {object} Reportes con resolución/reapertura ADMIN y evidencia; propaga HttpError.
 */
export function createReportsService(database, storage) {
  const repository = createReportsRepository(database);
  const evidence = createEvidenceService(repository, storage);
  return {
    async updateStatus(actor, id, input) {
      await updateReportStatus(database, actor.id, id, input);
      return present(await repository.get(actor, id), true);
    },
    async create(actor, input) {
      const report = await repository.create(actor, input);
      if (report.description !== input.description || report.category !== input.category)
        throw new HttpError(
          409,
          'REPORT_REQUEST_CONFLICT',
          'Este envío ya corresponde a otro reporte',
        );
      return present(report, actor.role === 'ADMIN');
    },
    get: async (actor, id) => present(await repository.get(actor, id), actor.role === 'ADMIN'),
    async list(actor, query) {
      const result = await repository.list(actor, query);
      return {
        ...result,
        reports: result.reports.map((report) => present(report, actor.role === 'ADMIN')),
      };
    },
    ...evidence,
  };
}
