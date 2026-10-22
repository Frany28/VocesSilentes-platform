import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';

/**
 * Identidad y permisos según Figma, manteniendo los contratos aprobados de username y contraseña.
 * @param {{values: object, errors: object, change: Function, creating: boolean}} props Datos y validación.
 * @returns {import('react').ReactElement} Campos nativos; edición omite contraseña y estado.
 */
export function UserFields({ values, errors, change, creating }) {
  const field = (name, label, placeholder, attributes = {}) => (
    <Input
      density="compact"
      appearance="plain"
      name={name}
      label={label}
      placeholder={placeholder}
      value={values[name]}
      error={errors[name]}
      onChange={change}
      {...attributes}
    />
  );
  return (
    <>
      <div className="admin-name-row">
        {field('firstName', 'Nombre', 'Nombre', { required: true, maxLength: 100 })}
        {field('lastName', 'Apellido (opcional)', 'Apellido', { maxLength: 100 })}
      </div>
      {field('username', 'Nombre de usuario', 'nombre_usuario', {
        required: true,
        maxLength: 50,
        autoComplete: 'off',
        help: 'Único: 3–50 letras, números o guiones bajos.',
      })}
      {field('email', 'Correo', 'nombre@ejemplo.com', {
        type: 'email',
        required: true,
        maxLength: 254,
        autoComplete: 'off',
      })}
      <div className={creating ? 'admin-name-row' : undefined}>
        <Select label="Rol" name="role" value={values.role} error={errors.role} onChange={change}>
          <option value="USER">Usuario</option>
          <option value="ADMIN">Admin</option>
        </Select>
        {creating && (
          <Select
            label="Estado inicial"
            name="isActive"
            value={values.isActive}
            error={errors.isActive}
            onChange={change}
          >
            <option value="true">Activo</option>
            <option value="false">Desactivado</option>
          </Select>
        )}
      </div>
      {creating && (
        <Input
          density="compact"
          type="password"
          appearance="plain"
          name="password"
          label="Contraseña"
          placeholder="Contraseña"
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
