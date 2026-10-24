import { useEffect, useRef, useState } from 'react';

/**
 * Evita escrituras duplicadas y conserva fallos reales; aborta transporte al desmontar.
 * @returns {object} pending/error/success y run(operation, confirmed).
 */
export function useAccountOperation() {
  const request = useRef();
  const [state, setState] = useState({ pending: false, error: '', success: false });
  useEffect(() => () => request.current?.abort(), []);
  const run = async (operation, confirmed) => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setState({ pending: true, error: '', success: false });
    try {
      const result = await operation(controller.signal);
      if (!controller.signal.aborted) {
        setState({ pending: false, error: '', success: true });
        confirmed?.(result);
      }
    } catch (error) {
      if (!controller.signal.aborted)
        setState({ pending: false, error: error.message, success: false });
    } finally {
      if (!controller.signal.aborted) request.current = undefined;
    }
  };
  return { ...state, run };
}
