import { HttpError } from '../../errors/http-error.js';
import { adminUser } from './admin-user.js';

/**
 * Proyecta una escritura real y traduce UNIQUE después del rollback a campos duplicados.
 * @param {Function} operation Escritura protegida con las restricciones reales de PostgreSQL.
 * @param {Function} findConflicts Consulta mínima de email/username, excluyendo la cuenta editada.
 * @returns {Promise<object>} DTO permitido; lanza HttpError 409 sin incluir valores privados.
 */
export async function persistAdminUser(operation, findConflicts) {
  try {
    return adminUser(await operation());
  } catch (error) {
    if (error.code !== 'P2002') throw error;
    const { email, username } = await findConflicts();
    if (email && username)
      throw new HttpError(
        409,
        'ACCOUNT_IDENTIFIERS_IN_USE',
        'El correo y el nombre de usuario ya existen',
      );
    if (email) throw new HttpError(409, 'EMAIL_IN_USE', 'Este correo ya está registrado');
    if (username) throw new HttpError(409, 'USERNAME_IN_USE', 'Este nombre de usuario ya existe');
    // Una modificación concurrente puede haber liberado el identificador tras el conflicto.
    throw new HttpError(
      409,
      'ACCOUNT_UNAVAILABLE',
      'El correo o nombre de usuario ya está registrado',
    );
  }
}
