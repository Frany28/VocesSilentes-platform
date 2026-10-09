import { useEffect, useState } from 'react';

/**
 * Espera Retry-After del servidor; el reloj no persiste credenciales ni reenvía peticiones.
 * @returns {object} remaining en segundos y start(seconds); limpia el intervalo al salir.
 */
export function useRetryDelay() {
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  useEffect(() => {
    if (!deadline) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);
  return {
    remaining,
    start(seconds) {
      const current = Date.now();
      setNow(current);
      setDeadline(seconds > 0 ? current + seconds * 1000 : 0);
    },
  };
}
