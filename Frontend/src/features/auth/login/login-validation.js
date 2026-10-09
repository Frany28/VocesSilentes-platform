import { z } from 'zod';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email()
  .regex(/^[!-~]+$/);

/**
 * Valida login conforme al contrato existente; conserva exactamente la contraseña.
 * @param {{email: string, password: string}} input Valores temporales del formulario.
 * @returns {{email?: string, password?: string}} Errores locales por campo, sin peticiones.
 */
export function validateLogin(input) {
  const errors = {};
  if (!input.email.trim()) errors.email = 'Introduce tu correo electrónico.';
  else if (!email.safeParse(input.email).success)
    errors.email = 'Escribe un correo válido, como nombre@correo.com.';
  if (!input.password) errors.password = 'Introduce tu contraseña.';
  else if (
    [...input.password].length > 128 ||
    new TextEncoder().encode(input.password).length > 512
  )
    errors.password = 'La contraseña supera el máximo de 128 caracteres o 512 bytes.';
  return errors;
}
