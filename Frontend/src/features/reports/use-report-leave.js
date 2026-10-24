import { useEffect } from 'react';

/**
 * Protege el borrador al recargar y al usar regreso/navegación del panel.
 * @param {boolean} dirty Hay cambios o evidencia cuyo envío no terminó.
 * @returns {Function} Confirmación para acciones de cancelación del formulario.
 */
export function useReportLeave(dirty) {
  const message = 'El envío no está completo. ¿Salir y dejar este borrador?';
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const leave = (event) => {
      const href = event.target.closest('a[href]')?.getAttribute('href');
      if (
        !href?.startsWith('/student') ||
        href === window.location.pathname ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', leave, true);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', leave, true);
    };
  }, [dirty]);
  return () => !dirty || window.confirm(message);
}
