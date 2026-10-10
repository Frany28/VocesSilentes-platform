import { validateLogin } from '../login/login-validation.js';

/**
 * Refleja longitudes y normalización del contrato del backend; no modifica la contraseña.
 * @param {object} input Valores temporales de los cinco campos del registro.
 * @returns {object} Errores locales por campo en el orden visual, sin peticiones.
 */
export function validateRegistration(input) {
  const errors = {};
  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim() || '';
  if (!firstName) errors.firstName = 'Introduce tu nombre.';
  else if ([...firstName].length > 100) errors.firstName = 'El nombre admite hasta 100 caracteres.';
  if ([...lastName].length > 100) errors.lastName = 'El apellido admite hasta 100 caracteres.';
  if (!/^[a-z0-9_]{3,50}$/.test(input.username.trim().toLowerCase()))
    errors.username = 'Usa de 3 a 50 letras (a–z), números o guiones bajos.';
  Object.assign(errors, validateLogin(input));
  if (input.password && [...input.password].length < 15)
    errors.password = 'La contraseña debe tener al menos 15 caracteres.';
  return errors;
}
