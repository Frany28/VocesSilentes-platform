import { useEffect, useRef, useState } from 'react';
import { readDemoModel } from './demo-model.js';

/**
 * Descarga el modelo de demostración a nivel de sesión. Su estado (cargando, error) sobrevive a que
 * la práctica se vuelva a montar al cambiar de letra. La carga automática ocurre una vez por sesión;
 * después solo se reintenta por acción del estudiante. Nunca solicita cámara ni envía puntos.
 * @param {Function} importModel Valida e instala un modelo en la sesión.
 * @returns {{demoLoading: boolean, demoError: string, loadDemo: Function, autoLoadDemo: Function}} Estado y acciones.
 */
export function useDemoLoader(importModel) {
  const [demoLoading, setLoading] = useState(false);
  const [demoError, setError] = useState('');
  const active = useRef(null);
  const claimed = useRef(false);
  useEffect(() => () => active.current?.abort(), []);
  const loadDemo = async () => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setError('');
    try {
      const demo = await readDemoModel(controller.signal);
      await importModel(new File([JSON.stringify(demo)], 'lsv-vowels-demo-v1.json'));
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof SyntaxError
            ? 'El modelo de vocales publicado no es válido.'
            : failure.message,
        );
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  };
  const autoLoadDemo = () => {
    if (claimed.current) return;
    claimed.current = true;
    loadDemo();
  };
  return { demoLoading, demoError, loadDemo, autoLoadDemo };
}
