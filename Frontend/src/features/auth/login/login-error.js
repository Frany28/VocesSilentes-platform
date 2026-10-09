/**
 * Traduce códigos públicos a mensajes controlados, sin revelar existencia de cuentas.
 * @param {{code?: string, status?: number}} failure Error uniforme del cliente HTTP.
 * @returns {{title: string, message: string, retry: boolean}} Presentación de error de servidor.
 */
export function loginError(failure) {
  if (failure.code === 'INVALID_CREDENTIALS')
    return {
      title: 'No pudimos iniciar sesión',
      message: 'El correo o la contraseña son incorrectos. Revisa tus datos e inténtalo de nuevo.',
      retry: false,
    };
  if (failure.code === 'RATE_LIMITED' || failure.status === 429)
    return {
      title: 'Demasiados intentos',
      message: 'Has alcanzado el límite de intentos. Espera antes de volver a intentarlo.',
      retry: true,
    };
  if (failure.code === 'NETWORK_ERROR')
    return {
      title: 'Sin conexión',
      message: 'No pudimos conectar. Comprueba tu conexión e inténtalo de nuevo.',
      retry: true,
    };
  if (failure.code === 'CSRF_INVALID')
    return {
      title: 'Vuelve a intentarlo',
      message: 'La protección del formulario ha caducado. Vuelve a enviar tus datos.',
      retry: true,
    };
  return {
    title: 'No pudimos iniciar sesión',
    message: 'El servicio no está disponible en este momento. Inténtalo de nuevo más tarde.',
    retry: true,
  };
}
