import { useState } from 'react';

/**
 * Impide escribir o pegar espacios (cualquier espacio en blanco) en un campo, p. ej. contraseñas, que
 * no los admiten. La tecla espacio no escribe nada y al pegar se eliminan; se avisa una vez para que
 * el cambio no pase desapercibido.
 * @param {boolean} enabled Si el campo debe rechazar espacios.
 * @param {{onChange?: Function, onKeyDown?: Function}} handlers Manejadores originales del campo.
 * @returns {{onChange?: Function, onKeyDown?: Function, removed: boolean}} Manejadores y si se quitó alguno.
 */
export function useNoWhitespace(enabled, { onChange, onKeyDown }) {
  const [removed, setRemoved] = useState(false);
  if (!enabled) return { onChange, onKeyDown, removed: false };
  return {
    removed,
    onKeyDown: (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        setRemoved(true);
      }
      onKeyDown?.(event);
    },
    onChange: (event) => {
      const value = event.target.value;
      if (/\s/u.test(value)) {
        event.target.value = value.replace(/\s/gu, '');
        setRemoved(true);
      }
      onChange?.(event);
    },
  };
}
