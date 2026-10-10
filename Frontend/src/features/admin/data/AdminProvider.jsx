import { useState } from 'react';
import { useAuth } from '../../auth/use-auth.js';
import { AdminContext } from './admin-context.js';
import { demoUsers, demoReports } from './admin-demo.js';
import { createUsersApi } from './users.api.js';
import { useKnownUsers } from './use-known-users.js';

/**
 * Mantiene demostraciones en memoria y cuentas reales obtenidas por UUID; recarga desde la API.
 * @param {{children: import('react').ReactNode}} props Contenido administrativo protegido.
 * @returns {import('react').ReactElement} Proveedor; aborta lecturas al salir y conserva errores reales.
 */
export function AdminProvider({ children }) {
  const { user } = useAuth();
  const [api] = useState(createUsersApi);
  const known = useKnownUsers(api, user.id);
  const [users, setUsers] = useState(demoUsers);
  const [reports, setReports] = useState(demoReports);
  const [preview, setPreview] = useState('ready');
  const [draft, setDraft] = useState({ dirty: false, pending: false });
  const demoAction = (type, id, patch) => {
    const update = type === 'users' ? setUsers : setReports;
    update((previous) => previous.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };
  return (
    <AdminContext.Provider
      value={{
        api,
        draft,
        setDraft,
        accept: known.accept,
        users: [...known.users, ...users],
        reports,
        demoAction,
        preview,
        setPreview,
        status: preview === 'ready' ? known.status : preview,
        error: known.error,
        retry: () => {
          setPreview('ready');
          known.reload();
        },
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
