import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { HttpError } from '../../errors/http-error.js';
import { validateEvidenceImage } from '../reports/evidence-image.js';
import { lockActor } from '../auth/auth-transaction.js';
import { publicUser } from '../auth/public-user.js';
import { removeProfilePhoto } from './profile-photo.removal.js';

/**
 * Recorta fotos en servidor y confirma su referencia con auditoría; nunca usa rutas del cliente.
 * @param {object} database Prisma compartido.
 * @param {object | undefined} storage Bucket privado de fotos o undefined.
 * @returns {object} savePhoto/removePhoto/readPhoto; propaga fallos de almacenamiento sin falso éxito.
 */
export function createProfilePhotoService(database, storage) {
  const requireStorage = () => {
    if (!storage)
      throw new HttpError(
        503,
        'PHOTO_STORAGE_UNAVAILABLE',
        'Almacenamiento de fotos no configurado',
      );
  };
  const write = (actorId, change) =>
    database.$transaction(async (tx) => {
      await lockActor(tx, actorId);
      const current = await tx.user.findUnique({ where: { id: actorId } });
      return change(tx, current);
    });
  const audit = (tx, actorId) =>
    tx.auditLog.create({
      data: {
        actorId,
        operation: 'USER_UPDATED',
        entityType: 'User',
        entityId: actorId,
      },
    });
  return {
    async savePhoto(actorId, input, zoom) {
      requireStorage();
      const image = await validateEvidenceImage(input);
      const side = Math.round((512 * zoom) / 100);
      const bytes = await sharp(image.bytes)
        .resize(side, side, { fit: 'cover' })
        .extract({
          left: Math.floor((side - 512) / 2),
          top: Math.floor((side - 512) / 2),
          width: 512,
          height: 512,
        })
        .webp({ quality: 85 })
        .toBuffer();
      const path = `${actorId}/${randomUUID()}.webp`;
      let saved;
      try {
        await storage.upload(path, bytes);
        saved = await write(actorId, async (tx, current) => {
          const user = await tx.user.update({
            where: { id: actorId },
            data: { profileImagePath: path },
          });
          await audit(tx, actorId);
          return { user: publicUser(user), previous: current.profileImagePath };
        });
      } catch (error) {
        await storage.remove(path);
        throw error;
      }
      // La referencia nueva ya está confirmada; no se revierte ante un fallo de limpieza del objeto anterior.
      if (saved.previous)
        await storage.remove(saved.previous).catch(() => {
          process.emitWarning(
            'La foto anterior requiere reconciliación de almacenamiento.',
            'ProfilePhotoCleanupWarning',
          );
        });
      return saved.user;
    },
    async removePhoto(actorId) {
      requireStorage();
      return removeProfilePhoto(database, storage, actorId);
    },
    async readPhoto(actor, userId, bytes = false) {
      requireStorage();
      if (actor.id !== userId && actor.role !== 'ADMIN')
        throw new HttpError(403, 'FORBIDDEN', 'Permiso insuficiente');
      const user = await database.user.findUnique({ where: { id: userId } });
      if (!user || user.isDeleted || !user.profileImagePath)
        throw new HttpError(404, 'PHOTO_NOT_FOUND', 'La cuenta no tiene foto');
      return bytes ? storage.read(user.profileImagePath) : storage.sign(user.profileImagePath);
    },
  };
}
