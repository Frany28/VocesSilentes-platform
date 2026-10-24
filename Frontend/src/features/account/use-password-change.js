import { useState } from 'react';
import { accountApi } from './account.api.js';
import { useAccountOperation } from './use-account-operation.js';

/**
 * Valida confirmación local; solo comunica éxito después de verificar y actualizar la credencial en backend.
 * @returns {object} Campos, error y envío; las contraseñas solo viven temporalmente en memoria.
 */
export function usePasswordChange() {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
  const [validation, setValidation] = useState('');
  const operation = useAccountOperation();
  return {
    ...operation,
    values,
    error: validation || operation.error,
    change: (event) => {
      setValidation('');
      setValues({ ...values, [event.target.name]: event.target.value });
    },
    submit(event) {
      event.preventDefault();
      const length = [...values.newPassword].length;
      if (
        !values.currentPassword ||
        length < 15 ||
        length > 128 ||
        new TextEncoder().encode(values.newPassword).length > 512 ||
        values.newPassword !== values.confirmation ||
        values.newPassword === values.currentPassword
      ) {
        setValidation(
          'Introduce tu contraseña actual y una nueva distinta de 15 a 128 caracteres. Ambas copias deben coincidir.',
        );
        return;
      }
      operation.run(
        (signal) =>
          accountApi.password(
            {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            },
            signal,
          ),
        () => setValues({ currentPassword: '', newPassword: '', confirmation: '' }),
      );
    },
  };
}
