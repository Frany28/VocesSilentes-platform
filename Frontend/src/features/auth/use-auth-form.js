import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from './use-auth.js';
import { safeReturnPath } from './return-path.js';
import { validateLogin } from './login/login-validation.js';
import { loginError } from './login/login-error.js';
import { useRetryDelay } from './login/use-retry-delay.js';

/**
 * Gestiona validación, envío/cancelación y navegación con el proveedor existente.
 * @param {string} mode login o register.
 * @returns {object} Acciones, errores y carga; no persiste contraseñas ni tokens.
 */
export function useAuthForm(mode) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const delay = useRetryDelay();
  const controller = useRef();
  useEffect(() => () => controller.current?.abort(), []);
  return {
    pending,
    error,
    feedback,
    fieldErrors,
    retryIn: delay.remaining,
    onChange(event) {
      const name = event.target.name;
      if (fieldErrors[name]) {
        const input = Object.fromEntries(new FormData(event.currentTarget));
        const updated = validateLogin(input);
        setFieldErrors((current) => ({ ...current, [name]: updated[name] }));
      }
      if (!delay.remaining) {
        setError('');
        setFeedback(null);
      }
    },
    async onSubmit(event) {
      event.preventDefault();
      if (controller.current || delay.remaining) return;
      const form = event.currentTarget;
      const input = Object.fromEntries(new FormData(form));
      if (mode === 'login') {
        const errors = validateLogin(input);
        setFieldErrors(errors);
        if (Object.keys(errors).length) {
          setError('');
          setFeedback(null);
          form.elements.namedItem(Object.keys(errors)[0])?.focus();
          return;
        }
      }
      if (input.lastName === '') delete input.lastName;
      const request = new AbortController();
      controller.current = request;
      setPending(true);
      setError('');
      setFeedback(null);
      try {
        const user = await auth[mode](input, request.signal);
        if (!request.signal.aborted) {
          form.elements.namedItem('password').value = '';
          navigate(safeReturnPath(location.state?.from, user.role), { replace: true });
        }
      } catch (failure) {
        if (!request.signal.aborted) {
          setError(mode === 'login' ? loginError(failure).message : failure.message);
          if (mode === 'login') setFeedback(loginError(failure));
          if (failure.status === 429 || failure.code === 'RATE_LIMITED')
            delay.start(failure.retryAfter);
        }
      } finally {
        // FormData y contraseña solo viven durante el envío; no se guardan en estado/storage.
        if (!request.signal.aborted) {
          controller.current = undefined;
          setPending(false);
        }
      }
    },
  };
}
