import { validateLogin } from '../login/login-validation.js';

/**
 * Refleja longitudes y normalización del contrato del backend; no modifica la contraseña.
 * @param {object} input Valores temporales de los cinco campos del registro.
 * @param {number} [passwordMinimum] Mínimo de caracteres: 15 en registro, 8 al crear desde Admin.
 * @returns {object} Errores locales por campo en el orden visual, sin peticiones.
 */
export function validateRegistration(input, passwordMinimum = 15) {
  const errors = {};
  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim() || '';
  if (!firstName) errors.firstName = 'Introduce tu nombre.';
  else if ([...firstName].length > 100) errors.firstName = 'El nombre admite hasta 100 caracteres.';
  if ([...lastName].length > 100) errors.lastName = 'El apellido admite hasta 100 caracteres.';
  if (!/^[a-z0-9_]{3,50}$/.test(input.username.trim().toLowerCase()))
    errors.username = 'Usa de 3 a 50 letras (a–z), números o guiones bajos.';
  Object.assign(errors, validateLogin(input));
  if (input.password && [...input.password].length < passwordMinimum)
    errors.password = `La contraseña debe tener al menos ${passwordMinimum} caracteres.`;
  return errors;
}
