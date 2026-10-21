import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/use-auth.js';
import { useAdmin } from '../data/admin-context.js';
import { validateAdminUser, userPayload } from './user-validation.js';

const conflictMessages = {
  email: 'Este correo ya está registrado.',
  username: 'Este nombre de usuario ya existe.',
};
const conflictFields = {
  EMAIL_IN_USE: { email: conflictMessages.email },
  USERNAME_IN_USE: { username: conflictMessages.username },
  ACCOUNT_IDENTIFIERS_IN_USE: conflictMessages,
  ACCOUNT_UNAVAILABLE: {
    email: 'Revisa si el correo ya existe.',
    username: 'Revisa si el usuario ya existe.',
  },
};

/**
 * Envía creación/edición con exclusión de doble envío y aborta al salir; éxito solo tras respuesta real.
 * @param {object | undefined} user Cuenta original o undefined para crear.
 * @returns {object} pending/errors/error y submit; la edición demo queda explícita y separada.
 */
export function useUserSubmit(user) {
  const { api, demoAction } = useAdmin();
  const auth = useAuth();
  const navigate = useNavigate();
  const request = useRef();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  useEffect(() => () => request.current?.abort(), []);
  const submit = async (event, values) => {
    event.preventDefault();
    if (request.current) return;
    const invalid = validateAdminUser(values, !user);
    setErrors(invalid);
    setError(null);
    if (Object.keys(invalid).length) {
      event.currentTarget.elements.namedItem(Object.keys(invalid)[0])?.focus();
      return;
    }
    const input = userPayload(values, !user);
    if (user?.source === 'demo') {
      demoAction('users', user.id, input);
      navigate(`/admin/users/${user.id}`, {
        state: {
          message: 'Demostración: cambios en memoria, sin persistencia en la base de datos.',
        },
      });
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    try {
      const saved = user
        ? await api.edit(user.id, input, controller.signal)
        : await api.create(input, controller.signal);
      if (controller.signal.aborted) return;
      if (saved.id === auth.user.id) {
        auth.refresh();
        navigate(saved.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
      } else
        navigate(`/admin/users/${saved.id}${user ? '' : '/created'}`, {
          state: {
            message: user
              ? 'La cuenta se actualizó en la base de datos.'
              : 'La cuenta se creó en la base de datos.',
          },
        });
    } catch (reason) {
      if (!controller.signal.aborted) {
        setError(reason.message);
        const fields = conflictFields[reason.code];
        if (fields) setErrors(fields);
      }
    } finally {
      if (!controller.signal.aborted) {
        request.current = undefined;
        setPending(false);
      }
    }
  };
  return { pending, errors, error, submit };
}
