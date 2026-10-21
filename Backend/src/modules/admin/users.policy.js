import { HttpError } from '../../errors/http-error.js';
import { accountAllowed } from '../auth/public-user.js';

/**
 * Revalida el actor bajo bloqueo antes de escribir.
 * @param {object | null} actor Cuenta privada vigente.
 * @returns {void} Lanza 403 si perdió permisos.
 */
export function requireAdministrator(actor) {
  if (!accountAllowed(actor, new Date()) || actor.role !== 'ADMIN')
    throw new HttpError(403, 'FORBIDDEN', 'Permiso insuficiente');
}

/**
 * Exige una cuenta existente que no esté eliminada lógicamente.
 * @param {object | null} user Cuenta bloqueada.
 * @returns {void} Lanza 404 o 409; no modifica datos.
 */
export function requireEditableUser(user) {
  if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
  if (user.isDeleted)
    throw new HttpError(409, 'USER_DELETED', 'No se puede modificar una cuenta eliminada');
}

/**
 * Impide quitar el último ADMIN activo mientras el advisory lock serializa las escrituras.
 * @param {object} operations Operaciones de la transacción administrativa.
 * @returns {Promise<void>} Lanza 409 si no queda otro ADMIN activo.
 */
export async function requireRemainingAdmin(operations) {
  const current = operations.current;
  if (current.role === 'ADMIN' && current.isActive && (await operations.activeAdmins()) <= 1)
    throw new HttpError(
      409,
      'LAST_ACTIVE_ADMIN',
      'Debe permanecer al menos un administrador activo',
    );
}
