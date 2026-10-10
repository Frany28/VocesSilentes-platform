import { validateRegistration } from '../../auth/registration/registration-validation.js';
/**
 * Reutiliza identidad y límites de auth; crear desde Admin admite contraseña desde 8 caracteres.
 * @param {object} input Campos temporales; nunca se almacenan fuera del formulario.
 * @param {boolean} creating Si corresponde validar contraseña y estado inicial.
 * @returns {object} Errores por campo, sin duplicar autenticación ni comprobar unicidad localmente.
 */
export function validateAdminUser(input, creating) {
  const errors = validateRegistration(input, 8);
  if (!creating) delete errors.password;
  if (!['USER', 'ADMIN'].includes(input.role)) errors.role = 'Selecciona Usuario o Admin.';
  if (creating && !['true', 'false'].includes(input.isActive))
    errors.isActive = 'Selecciona Activo o Desactivado.';
  return errors;
}
/**
 * Construye exclusivamente el contrato admitido por el servidor; conserva la contraseña exacta.
 * @param {object} values Datos del formulario.
 * @param {boolean} creating Si admite contraseña y estado inicial.
 * @returns {object} Payload explícito, sin hash ni emailVerified.
 */
export function userPayload(values, creating) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim() || null,
    username: values.username.trim().toLowerCase(),
    email: values.email.trim().toLowerCase(),
    role: values.role,
    ...(creating ? { password: values.password, isActive: values.isActive === 'true' } : {}),
  };
}
