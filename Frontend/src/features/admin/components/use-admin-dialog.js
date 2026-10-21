import { useEffect, useRef } from 'react';

const openDialogs = new Set();
let originalOverflow = '';

/**
 * Abre un diálogo nativo y coordina scroll/foco entre confirmaciones anidadas.
 * @param {string | undefined} initialFocus Selector del primer control, si se requiere.
 * @returns {object} ref y trapFocus; restaura scroll solo al desmontar el último diálogo.
 */
export function useAdminDialog(initialFocus) {
  const ref = useRef();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    if (!openDialogs.size) originalOverflow = document.body.style.overflow;
    openDialogs.add(dialog);
    document.body.style.overflow = 'hidden';
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
    if (initialFocus) dialog.querySelector(initialFocus)?.focus();
    return () => {
      openDialogs.delete(dialog);
      dialog.close?.();
      if (!openDialogs.size) document.body.style.overflow = originalOverflow;
      if (previous?.isConnected && !previous.closest('[inert]')) previous.focus();
    };
  }, [initialFocus]);
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return;
    const controls = [
      ...event.currentTarget.querySelectorAll(
        'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),' +
          'textarea:not(:disabled),[tabindex]:not([tabindex="-1"])',
      ),
    ].filter((node) => node.tabIndex >= 0 && node.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) {
      event.preventDefault();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return { ref, trapFocus };
}
