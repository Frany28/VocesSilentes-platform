import { fullName } from '../data/admin-labels.js';
/**
 * Presenta identidad y origen de la cuenta; avatar por iniciales como en el formulario de Figma.
 * @param {{user?: object, values: object}} props Cuenta original y datos temporales.
 * @returns {import('react').ReactElement} Cabecera del formulario.
 */
export function UserFormHeader({ user, values }) {
  return (
    <>
      {user ? (
        <>
          <h2>{fullName(user)}</h2>
          <p className="admin-muted">Datos de la cuenta</p>
        </>
      ) : (
        <p className="admin-kicker">IDENTIDAD Y ACCESO</p>
      )}
      <p className="admin-demo-note">
        {user?.source === 'demo'
          ? 'Edición de demostración: no se guardará en la base de datos.'
          : 'Los datos se guardan en la base de datos al recibir una respuesta del servidor.'}
      </p>
      <div className="admin-avatar-line">
        <span className="admin-avatar">
          {values.firstName.slice(0, 1) || 'V'}
          {values.lastName.slice(0, 1) || 'S'}
        </span>
        <p className="admin-demo-note">Avatar por defecto · Sin foto de perfil</p>
      </div>
    </>
  );
}
