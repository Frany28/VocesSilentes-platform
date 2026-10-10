import { Input } from '../../../components/ui/Input.jsx';
import { PasswordInput } from '../../../components/ui/PasswordInput.jsx';
import { AdminSelect } from '../components/AdminSelect.jsx';
/**
 * Campos exactos de creación o edición del diseño, con componentes y validación compartidos.
 * @param {{values: object, errors: object, change: Function, creating: boolean}} props Estado del formulario.
 * @returns {import('react').ReactElement} Campos nativos; edición omite contraseña y estado.
 */
export function UserFields({ values, errors, change, creating }) {
  const field = (name, label, placeholder, help, attributes = {}) => (
    <Input
      appearance="plain"
      name={name}
      label={label}
      placeholder={placeholder}
      help={help}
      value={values[name]}
      error={errors[name]}
      onChange={change}
      {...attributes}
    />
  );
  return (
    <>
      <div className={creating ? 'admin-name-row' : 'admin-form'}>
        {field('firstName', 'Nombre', 'Ingresa el nombre', 'Campo obligatorio', {
          required: true,
          maxLength: 100,
        })}
        {field('lastName', 'Apellido (opcional)', 'Ingresa el apellido', 'Puedes dejarlo vacío', {
          maxLength: 100,
        })}
      </div>
      <div className={creating ? 'admin-name-row' : 'admin-form'}>
      {field(
        'username',
        'Nombre de usuario',
        'Elige un nombre de usuario',
        'Único: 3–50 letras, números o guiones bajos.',
        { required: true, maxLength: 50, autoComplete: 'off' },
      )}
      {field(
        'email',
        'Correo',
        'nombre@ejemplo.com',
        'Debe ser único; se usa para iniciar sesión',
        {
          type: 'email',
          required: true,
          maxLength: 254,
          autoComplete: 'off',
        },
      )}
      </div>
      <div className={creating ? 'admin-name-row' : undefined}>
        <AdminSelect
          label="Rol"
          name="role"
          value={values.role}
          error={errors.role}
          onChange={change}
          help={
            values.role === 'ADMIN'
              ? 'Puede gestionar usuarios y revisar reportes'
              : 'Acceso a módulos y práctica'
          }
        >
          <option value="USER">Usuario</option>
          <option value="ADMIN">Admin</option>
        </AdminSelect>
        {creating && (
          <AdminSelect
            label="Estado inicial"
            name="isActive"
            value={values.isActive}
            error={errors.isActive}
            onChange={change}
            help={values.isActive === 'true' ? 'Puede iniciar sesión' : 'No podrá iniciar sesión'}
          >
            <option value="true">Activo</option>
            <option value="false">Desactivado</option>
          </AdminSelect>
        )}
      </div>
      {creating && (
        <PasswordInput
          appearance="plain"
          name="password"
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          help="8–128 caracteres, una mayúscula y un carácter especial (ej.: !, @ o #)."
          error={errors.password}
          value={values.password}
          onChange={change}
          required
          autoComplete="new-password"
        />
      )}
    </>
  );
}
