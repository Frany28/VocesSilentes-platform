import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/use-auth.js';
import { AdminContext } from './admin-context.js';
import { demoUsers, demoReports } from './admin-demo.js';
import { createUsersApi } from './users.api.js';
import { readKnownUsers, rememberUser } from './known-users.js';

/**
 * Mantiene demostraciones en memoria y cuentas reales obtenidas por UUID; recarga desde la API.
 * @param {{children: import('react').ReactNode}} props Contenido administrativo protegido.
 * @returns {import('react').ReactElement} Proveedor; aborta lecturas al salir y conserva errores reales.
 */
export function AdminProvider({ children }) {
  const { user } = useAuth();
  const [api] = useState(createUsersApi);
  const [realUsers, setRealUsers] = useState([]);
  const [users, setUsers] = useState(demoUsers);
  const [reports, setReports] = useState(demoReports);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const [preview, setPreview] = useState('ready');
  const [draft, setDraft] = useState({ dirty: false, pending: false });
  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      readKnownUsers(user.id).map(async (id) => ({
        ...(await api.get(id, controller.signal)),
        source: 'server',
      })),
    )
      .then((values) => {
        if (!controller.signal.aborted) {
          setRealUsers(values);
          setStatus('ready');
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setError(reason);
          setStatus('error');
        }
      });
    return () => controller.abort();
  }, [api, user.id, revision]);
  const accept = (account) => {
    const actual = { ...account, source: 'server' };
    rememberUser(user.id, actual.id);
    setRealUsers((previous) => [actual, ...previous.filter((item) => item.id !== actual.id)]);
    return actual;
  };
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
        accept,
        users: [...realUsers, ...users],
        reports,
        demoAction,
        preview,
        setPreview,
        status: preview === 'ready' ? status : preview,
        error,
        retry: () => {
          setPreview('ready');
          setError(null);
          setStatus('loading');
          setRevision((value) => value + 1);
        },
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
