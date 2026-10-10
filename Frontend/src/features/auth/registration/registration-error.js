import { loginError } from '../login/login-error.js';

/**
 * Adapta errores públicos al registro sin identificar el dato que causa un conflicto.
 * @param {{code?: string, status?: number}} failure Error uniforme del cliente HTTP.
 * @returns {{title: string, message: string, retry: boolean}} Mensaje público controlado.
 */
export function registrationError(failure) {
  if (failure.code === 'ACCOUNT_UNAVAILABLE')
    return {
      title: 'No pudimos crear tu cuenta',
      message:
        'No se puede registrar una cuenta con esos datos. Revisa el correo y el nombre de usuario.',
      retry: false,
    };
  if (failure.code === 'INVALID_INPUT')
    return {
      title: 'Revisa tus datos',
      message:
        'Los datos no cumplen los requisitos del registro. Revisa los campos e inténtalo de nuevo.',
      retry: false,
    };
  if (
    ['RATE_LIMITED', 'NETWORK_ERROR', 'CSRF_INVALID'].includes(failure.code) ||
    failure.status === 429
  )
    return loginError(failure);
  return {
    title: 'No pudimos crear tu cuenta',
    message: 'El servicio no está disponible en este momento. Inténtalo de nuevo más tarde.',
    retry: true,
  };
}
