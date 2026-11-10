import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cuenta atrás antes de capturar, para que la seña ya esté formada cuando empiezan los tres segundos.
 * Así los primeros frames no recogen la mano en movimiento hacia la posición.
 * @param {number} [seconds] Duración de la cuenta atrás.
 * @returns {{count: number | null, start: Function, cancel: Function}} Segundos restantes o null, y acciones.
 */
export function useCaptureCountdown(seconds = 3) {
  const [count, setCount] = useState(null);
  const timer = useRef(null);
  const cancel = useCallback(() => {
    clearInterval(timer.current);
    timer.current = null;
    setCount(null);
  }, []);
  useEffect(() => () => clearInterval(timer.current), []);
  const start = (onDone) => {
    if (timer.current) return;
    let left = seconds;
    setCount(left);
    timer.current = setInterval(() => {
      left -= 1;
      if (left > 0) {
        setCount(left);
        return;
      }
      clearInterval(timer.current);
      timer.current = null;
      setCount(null);
      onDone();
    }, 1000);
  };
  return { count, start, cancel };
}
