import { createHash, randomBytes } from 'node:crypto';

/**
 * Genera 256 bits de token opaco; solo se entrega al controller para la cookie HttpOnly.
 * @returns {string} Base64url de 32 bytes aleatorios.
 */
export function newSessionToken() {
  return randomBytes(32).toString('base64url');
}

/**
 * Deriva el identificador persistido de sesión, nunca un hash de contraseña.
 * @param {string} token Token opaco.
 * @returns {string} SHA-256 hexadecimal.
 */
export function sessionTokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Limita cookies de sesión al formato emitido; no registra entradas inválidas.
 * @param {unknown} token Valor de cookie.
 * @returns {boolean} Si es un token base64url de 32 bytes.
 */
export function validSessionToken(token) {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token);
}
