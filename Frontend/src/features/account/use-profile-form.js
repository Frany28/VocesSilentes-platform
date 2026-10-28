import { useState } from 'react';
import { useAuth } from '../auth/use-auth.js';
import { validateRegistration } from '../auth/registration/registration-validation.js';
import { accountApi } from './account.api.js';
import { useAccountOperation } from './use-account-operation.js';

const payload = (value) => ({
  firstName: value.firstName.trim(),
  lastName: value.lastName?.trim() || null,
  username: value.username.trim().toLowerCase(),
  email: value.email.trim().toLowerCase(),
});

/**
 * Gestiona el borrador y el guardado de identidad propia con el contrato existente.
 * @param {object} user Identidad autenticada original; no permite cambiar rol ni ID.
 * @returns {object} Campos, errores, dirty y operación abortable; actualiza sesión solo tras guardar.
 */
export function useProfileForm(user) {
  const auth = useAuth();
  const [values, setValues] = useState(user);
  const [errors, setErrors] = useState({});
  const operation = useAccountOperation();
  const dirty = JSON.stringify(payload(values)) !== JSON.stringify(payload(user));
  const submit = (event) => {
    event.preventDefault();
    const invalid = validateRegistration(values);
    delete invalid.password;
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      event.currentTarget.elements.namedItem(Object.keys(invalid)[0])?.focus();
      return;
    }
    operation.run(
      (signal) => accountApi.profile(payload(values), signal),
      (saved) => {
        setValues(saved);
        auth.updateUser(saved);
      },
    );
  };
  return {
    values,
    errors,
    operation,
    dirty,
    submit,
    change: (event) => setValues({ ...values, [event.target.name]: event.target.value }),
  };
}
