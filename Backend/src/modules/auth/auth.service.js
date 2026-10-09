import { HttpError } from '../../errors/http-error.js';
import { createPasswords } from './passwords.js';
import { createAuthRepository } from './auth.repository.js';
import { accountAllowed, publicUser } from './public-user.js';
import { newSessionToken, sessionTokenHash, validSessionToken } from './session-tokens.js';

const invalidLogin = () =>
  new HttpError(401, 'INVALID_CREDENTIALS', 'No se pudo iniciar sesión con esos datos');

/**
 * Crea negocio de autenticación con Prisma real, hashing y sesiones opacas persistidas.
 * @param {import('../../../generated/client.js').PrismaClient} database Cliente conectado.
 * @param {object} policy Política validada; duración de sesión en segundos.
 * @returns {Promise<object>} register/login/authenticate/logout; nunca devuelve filas privadas al controller.
 * @throws {Error} Por fallo de inicialización o persistencia; HttpError para fallos públicos.
 */
export async function createAuthService(database, policy) {
  const repository = createAuthRepository(database);
  const passwords = await createPasswords();
  function issueSession() {
    const token = newSessionToken();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + policy.sessionDurationSeconds * 1000);
    return { token, session: { tokenHash: sessionTokenHash(token), createdAt, expiresAt } };
  }
  return {
    async register({ password, ...input }) {
      const passwordHash = await passwords.hash(password);
      const { token, session } = issueSession();
      try {
        const user = await repository.register(
          { ...input, passwordHash, role: 'USER', emailVerified: false },
          session,
        );
        return { user: publicUser(user), token, expiresAt: session.expiresAt };
      } catch (error) {
        if (error.code === 'P2002')
          throw new HttpError(409, 'ACCOUNT_UNAVAILABLE', 'No se puede registrar esa cuenta');
        throw error;
      }
    },
    async login({ email, password }) {
      const found = await repository.findUser(email);
      const matches = await passwords.verify(found?.passwordHash, password);
      if (!matches || !accountAllowed(found, new Date())) {
        if (found && !matches) await repository.recordFailure(found);
        throw invalidLogin();
      }
      return repository.finalizeLogin(found.id, async (current, operations) => {
        if (!accountAllowed(current, new Date()) || current.passwordHash !== found.passwordHash)
          throw invalidLogin();
        const { token, session } = issueSession();
        await operations.reset();
        await operations.createSession(session);
        return { user: publicUser(current), token, expiresAt: session.expiresAt };
      });
    },
    async authenticate(token) {
      if (!validSessionToken(token)) return null;
      const session = await repository.findSession(sessionTokenHash(token));
      const now = new Date();
      if (
        !session ||
        session.revokedAt ||
        session.expiresAt <= now ||
        !accountAllowed(session.user, now)
      )
        return null;
      return publicUser(session.user);
    },
    async logout(token) {
      if (validSessionToken(token)) await repository.revoke(sessionTokenHash(token), new Date());
    },
  };
}
