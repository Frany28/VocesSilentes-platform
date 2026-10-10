/**
 * Presenta fechas HTTP en la zona del proyecto sin convertir ausencias en actividad ficticia.
 * @param {string | null} value Fecha ISO o ausencia.
 * @returns {string} Fecha legible o No aplica.
 */
export function adminDate(value) {
  return value
    ? new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium', timeZone: 'America/Caracas' }).format(
        new Date(value),
      )
    : 'No aplica';
}
/**
 * Forma el nombre visible de una cuenta sin requerir apellido.
 * @param {object} user DTO real o demostración identificada.
 * @returns {string} Nombre completo.
 */
export function fullName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
}
