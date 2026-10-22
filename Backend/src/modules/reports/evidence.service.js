import { randomUUID } from 'node:crypto';
import { HttpError } from '../../errors/http-error.js';
import { EVIDENCE_BUCKET, validateEvidenceImage } from './evidence-image.js';

/**
 * Autoriza propiedad antes de decodificar; reserva una ruta única durable antes de escribir en Storage.
 * @param {object} repository Persistencia de reportes y reservas.
 * @param {object | undefined} storage Adaptador privado o undefined sin configuración.
 * @returns {object} attach/read/cleanup; sin sobrescrituras, URLs permanentes ni listado público.
 */
export function createEvidenceService(repository, storage) {
  const available = () => {
    if (!storage)
      throw new HttpError(503, 'STORAGE_UNAVAILABLE', 'Almacenamiento de evidencia sin configurar');
  };
  const remove = async (row) => {
    await storage.remove(row.path);
    await repository.discard(row.id);
  };
  return {
    async attach(actor, reportId, bytes) {
      const report = await repository.get(actor, reportId, true);
      available();
      const image = await validateEvidenceImage(bytes);
      if (report.evidence?.state === 'READY' && report.evidence.digest === image.digest) return;
      if (report.evidence)
        throw new HttpError(409, 'EVIDENCE_EXISTS', 'La evidencia ya existe o está procesándose');
      const id = randomUUID();
      const row = {
        id,
        reportId,
        ownerId: actor.id,
        bucket: EVIDENCE_BUCKET,
        path: `${actor.id}/${reportId}/${id}`,
        mimeType: image.mimeType,
        size: image.size,
        digest: image.digest,
      };
      try {
        await repository.reserve(row);
      } catch (error) {
        if (error.code === 'P2002')
          throw new HttpError(409, 'EVIDENCE_EXISTS', 'La evidencia ya existe o está procesándose');
        throw error;
      }
      try {
        await storage.upload(row.path, image);
        if (!(await repository.ready(id)).count) throw new Error('Reservation expired');
      } catch {
        // Solo se borra tras reclamar PENDING. Un commit READY ambiguo nunca elimina evidencia válida.
        try {
          if ((await repository.claim(id)).count) await remove(row);
        } catch {
          /* La reserva durable queda para evidence:cleanup, incluso tras reinicio. */
        }
        throw new HttpError(
          503,
          'EVIDENCE_UPLOAD_FAILED',
          'Reporte guardado; no se confirmó la imagen. Reintenta el envío.',
        );
      }
    },
    async read(actor, reportId) {
      const report = await repository.get(actor, reportId);
      if (report.evidence?.state !== 'READY')
        throw new HttpError(404, 'EVIDENCE_NOT_FOUND', 'Sin imagen adjunta disponible');
      available();
      return storage.sign(report.evidence.path);
    },
    async cleanup() {
      available();
      let removed = 0;
      for (const row of await repository.stale()) {
        if (
          row.state === 'PENDING' &&
          !(await repository.claim(row.id, new Date(Date.now() - 900000))).count
        )
          continue;
        await remove(row);
        removed += 1;
      }
      return removed;
    },
  };
}
