import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

const options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
};

/**
 * Prepara Argon2id y un hash señuelo por instancia, sin guardar contraseñas originales.
 * @returns {Promise<object>} hash y verify asíncronos; verify usa señuelo si no hay usuario/hash válido.
 * @throws {Error} Si falla el inicializador nativo de Argon2.
 */
export async function createPasswords() {
  const dummyHash = await argon2.hash(randomBytes(32), options);
  return {
    hash: (password) => argon2.hash(password, options),
    async verify(passwordHash, password) {
      const usable = typeof passwordHash === 'string' && passwordHash.startsWith('$argon2id$');
      try {
        const valid = await argon2.verify(usable ? passwordHash : dummyHash, password);
        return usable && valid;
      } catch {
        await argon2.verify(dummyHash, password);
        return false;
      }
    },
  };
}
