import { useState } from 'react';
import { AdminContext } from './admin-context.js';
import { demoUsers, demoReports } from './admin-demo.js';
import { createUsersApi } from './users.api.js';

/**
 * Mantiene las demos de resumen/reportes y el cliente real; el listado consulta PostgreSQL.
 * @param {{children: import('react').ReactNode}} props Contenido administrativo protegido.
 * @returns {import('react').ReactElement} Proveedor sin caché de cuentas en localStorage.
 */
export function AdminProvider({ children }) {
  const [api] = useState(createUsersApi);
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
        users,
        reports,
        demoAction,
        preview,
        setPreview,
        retry: () => setPreview('ready'),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
