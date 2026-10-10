/** Estados visuales del diseño: no constituyen resultados de cámara, MediaPipe ni reconocimiento LSV. */
export const practiceStates = Object.freeze({
  off: {
    label: 'Cámara apagada',
    title: 'Cámara apagada',
    tone: 'neutral',
    symbol: 'camera',
    description: 'Activa la demostración para explorar los estados del prototipo.',
    action: 'Activar cámara (demo)',
    next: 'permission',
  },
  permission: {
    label: 'Permiso pendiente',
    title: 'Esperando permiso',
    tone: 'neutral',
    symbol: 'camera',
    description: 'Ejemplo visual de espera. En esta demostración no se solicita permiso de cámara.',
    action: 'Esperando permiso…',
    disabled: true,
  },
  ready: {
    label: 'Lista para practicar',
    title: 'Lista para practicar',
    tone: 'info',
    symbol: 'camera',
    description: 'Ejemplo del encuadre. No se está capturando imagen ni vídeo.',
    action: 'Ver estado de análisis (demo)',
    next: 'analyzing',
  },
  analyzing: {
    label: 'Analizando',
    title: 'Reconociendo…',
    tone: 'info',
    symbol: 'camera',
    description: 'Estado visual de ejemplo; no hay análisis ni clasificación de señas.',
    action: 'Analizando…',
    disabled: true,
  },
  success: {
    label: 'Seña reconocida',
    title: '¡Buen trabajo!',
    tone: 'success',
    symbol: 'success',
    description: 'Ejemplo de respuesta positiva del diseño. No es una evaluación de tu seña.',
    action: 'Practicar de nuevo (demo)',
    next: 'ready',
  },
  retry: {
    label: 'Volver a intentar',
    title: 'Intentémoslo otra vez',
    tone: 'warning',
    symbol: 'warning',
    description: 'Revisa la iluminación y el encuadre. Consulta la referencia y prueba de nuevo.',
    action: 'Intentar de nuevo (demo)',
    next: 'ready',
  },
  denied: {
    label: 'Permiso denegado',
    title: 'Permiso de cámara denegado',
    tone: 'error',
    symbol: 'lock',
    description: 'Ejemplo de permiso denegado. No se ha solicitado acceso a tu cámara.',
    action: 'Volver a intentar (demo)',
    next: 'off',
  },
  unavailable: {
    label: 'Cámara no disponible',
    title: 'Cámara no disponible',
    tone: 'error',
    symbol: 'error',
    description: 'Ejemplo de cámara no disponible. Tu dispositivo no se ha comprobado.',
    action: 'Reintentar cámara (demo)',
    next: 'off',
  },
});

/** Pasos originales de Practice/Guide, compartidos por el panel lateral y las instrucciones. */
export const practiceSteps = Object.freeze([
  {
    title: '01 / Observa la lección',
    description: 'Revisa la referencia de la seña antes de comenzar.',
  },
  { title: '02 / Busca buena luz', description: 'Mantén las manos visibles y un fondo despejado.' },
  {
    title: '03 / Prueba a tu ritmo',
    description: 'Sigue la indicación del ejercicio. Puedes repetir.',
  },
]);
