import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

/**
 * Protege el borrador al recargar y al usar regreso/navegación del panel.
 * @param {boolean} dirty Hay cambios o evidencia cuyo envío no terminó.
 * @param {boolean} pending Hay validación o envío en curso que impide salir por enlaces internos.
 * @param {string} scope Raíz de las rutas internas protegidas, por ejemplo /student.
 * @returns {object} Confirmación de navegación interna; la recarga conserva el aviso nativo.
 */
export function useDraftLeave(dirty, pending, scope) {
  const [destination, setDestination] = useState(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!dirty && !pending) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const leave = (event) => {
      const link = event.target.closest('a[href]');
      const href = link?.getAttribute('href');
      if (
        !href ||
        (href !== scope && !href.startsWith(`${scope}/`)) ||
        href === pathname ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self') ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      if (!pending) setDestination(() => () => navigate(href));
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', leave, true);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', leave, true);
    };
  }, [dirty, pending, scope, pathname, navigate]);
  return {
    confirm: Boolean(destination),
    requestLeave: (action) => {
      if (pending) return;
      if (dirty) setDestination(() => action);
      else action();
    },
    cancel: () => setDestination(null),
    proceed: () => {
      if (pending) return;
      setDestination(null);
      destination?.();
    },
  };
}
