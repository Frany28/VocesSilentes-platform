import { useEffect, useState } from 'react';
import { forgetUser, readKnownUsers, rememberUser } from './known-users.js';

/**
 * Consulta al servidor las cuentas reales recordadas por UUID en este navegador.
 * Un 404 USER_NOT_FOUND olvida ese ID (p. ej. tras cambiar de base); otros errores se exponen.
 * @param {object} api Cliente de usuarios administrativos.
 * @param {string} actorId Administrador actual; separa los IDs recordados por cuenta.
 * @returns {object} users con source 'server', status, error, accept y reload.
 */
export function useKnownUsers(api, actorId) {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const load = (id) =>
      api.get(id, controller.signal).then(
        (account) => ({ ...account, source: 'server' }),
        (reason) => {
          if (reason?.status !== 404 || reason.code !== 'USER_NOT_FOUND') throw reason;
          forgetUser(actorId, id);
          return null;
        },
      );
    Promise.all(readKnownUsers(actorId).map(load))
      .then((values) => {
        if (!controller.signal.aborted) {
          setUsers(values.filter(Boolean));
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
  }, [api, actorId, revision]);
  return {
    users,
    status,
    error,
    accept: (account) => {
      const actual = { ...account, source: 'server' };
      rememberUser(actorId, actual.id);
      setUsers((previous) => [actual, ...previous.filter((item) => item.id !== actual.id)]);
      return actual;
    },
    reload: () => {
      setError(null);
      setStatus('loading');
      setRevision((value) => value + 1);
    },
  };
}
