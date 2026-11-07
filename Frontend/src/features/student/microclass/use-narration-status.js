import { useEffect, useState } from 'react';
import { narrationStatus, watchVoices } from './speech-narration.js';

/**
 * Estado de la voz en español, actualizado cuando el navegador termina de cargar sus voces.
 * @returns {'unsupported'|'loading'|'ready'|'none'} Disponibilidad para mostrar al estudiante.
 */
export function useNarrationStatus() {
  const [status, setStatus] = useState(narrationStatus);
  useEffect(() => watchVoices(() => setStatus(narrationStatus())), []);
  return status;
}
