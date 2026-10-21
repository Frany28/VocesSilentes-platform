import { useLayoutEffect, useState } from 'react';
import { useAdmin } from '../data/admin-context.js';
/**
 * Mantiene datos temporales y avisa al cerrar o navegar con cambios; nunca almacena contraseñas.
 * @param {object | undefined} user Cuenta inicial.
 * @param {boolean} pending Si una escritura está en curso.
 * @returns {object} values/change/dirty; limpia la protección al desmontar.
 */
export function useUserDraft(user, pending) {
  const { setDraft } = useAdmin();
  const [initial] = useState(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'USER',
    isActive: 'true',
    password: '',
  }));
  const [values, setValues] = useState(initial);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  // El guard debe recibir el estado antes de que el usuario pueda interactuar tras una respuesta HTTP.
  useLayoutEffect(() => {
    setDraft({ dirty, pending });
    const warn = (event) => {
      if (dirty || pending) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
      setDraft({ dirty: false, pending: false });
    };
  }, [dirty, pending, setDraft]);
  return {
    values,
    dirty,
    change: (event) =>
      setValues((previous) => ({ ...previous, [event.target.name]: event.target.value })),
  };
}
