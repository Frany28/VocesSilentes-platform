import { Input } from '../../components/ui/Input.jsx';
import { Icon } from '../../components/ui/Icon.jsx';

/**
 * Campos comunes de identidad; el consumidor conserva validación y persistencia.
 * @param {{values: object, role: string, errors?: object, onChange?: Function, readOnly?: boolean}} props Datos y edición.
 * @returns {import('react').ReactElement} Pares compactos con etiquetas persistentes y rol informativo.
 */
export function ProfileFields({ values, role, errors = {}, onChange, readOnly = false }) {
  const field = (name, label, help, attributes = {}) => (
    <Input
      density="compact"
      appearance="plain"
      name={name}
      label={label}
      value={values[name] || ''}
      help={help}
      error={errors[name]}
      onChange={onChange}
      readOnly={readOnly}
      {...attributes}
    />
  );
  return (
    <>
      <div className="account-name-row">
        {field('firstName', 'Nombre', undefined, {
          required: true,
          maxLength: 100,
          autoComplete: 'given-name',
        })}
        {field('lastName', 'Apellido (opcional)', undefined, {
          maxLength: 100,
          autoComplete: 'family-name',
        })}
      </div>
      <div className="account-profile-contact">
        {field(
          'username',
          'Nombre de usuario',
          'Tu identificador: letras, números o guiones bajos.',
          {
            required: true,
            maxLength: 50,
            autoComplete: 'username',
          },
        )}
        {field('email', 'Correo de acceso', 'Usado para acceder a tu cuenta.', {
          type: 'email',
          required: true,
          maxLength: 254,
          autoComplete: 'email',
        })}
      </div>
      <div className="account-profile-role">
        <Icon name="modern-profile" size={20} />
        <div>
          <p>Rol · {role === 'ADMIN' ? 'Administrador' : 'Estudiante'}</p>
          <p className="account-caption">Tu rol no se modifica desde el perfil.</p>
        </div>
      </div>
    </>
  );
}
