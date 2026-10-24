import { HttpError } from '../../errors/http-error.js';
import { accountAllowed } from './public-user.js';

/**
 * Bloquea y revalida al actor antes de una mutación transaccional de negocio.
 * @param {object} tx Transacción Prisma; debe mantenerse abierta hasta guardar y auditar.
 * @param {string} id Actor derivado de la sesión, nunca del body.
 * @param {string} [role] Rol requerido si la operación lo restringe.
 * @returns {Promise<void>} Lanza 403 si la cuenta o el permiso dejaron de estar vigentes.
 */
export async function lockActor(tx, id, role) {
  await tx.$queryRaw`SELECT id FROM vocessilentes."User" WHERE id = ${id}::uuid FOR UPDATE`;
  const user = await tx.user.findUnique({ where: { id } });
  if (!accountAllowed(user, new Date()) || (role && user.role !== role))
    throw new HttpError(403, 'FORBIDDEN', 'Permiso insuficiente');
}
