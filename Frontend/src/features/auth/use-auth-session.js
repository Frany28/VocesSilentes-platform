import { useEffect, useRef, useState } from 'react';
import { onSessionInvalidated } from '../../lib/session-events.js';

const anonymous = { status: 'unauthenticated', user: null, error: null };

/**
 * Confirma sesión y descarta respuestas tardías tras login/logout, 401 o desmontaje.
 * @param {object} api Cliente de autenticación con AbortSignal.
 * @returns {object} Estado explícito y acciones; los fallos de red no equivalen a logout.
 */
export function useAuthSession(api) {
  const [state, setState] = useState({ status: 'loading', user: null, error: null });
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  const controller = useRef();
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const request = new AbortController();
    controller.current = request;
    const current = ++generation.current;
    const valid = () =>
      mounted.current && !request.signal.aborted && generation.current === current;
    api
      .me(request.signal)
      .then((user) => {
        if (valid()) setState({ status: 'authenticated', user, error: null });
      })
      .catch((error) => {
        if (valid())
          setState(error.status === 401 ? anonymous : { status: 'error', user: null, error });
      });
    const unsubscribe = onSessionInvalidated(() => {
      ++generation.current;
      request.abort();
      api.clearCsrf();
      setState(anonymous);
    });
    return () => {
      mounted.current = false;
      request.abort();
      unsubscribe();
    };
  }, [api, revision]);

  const authenticate = async (operation, input, signal) => {
    const current = ++generation.current;
    controller.current?.abort();
    let user;
    try {
      user = await api[operation](input, signal);
    } catch (error) {
      if (mounted.current && current === generation.current && state.status === 'loading') {
        setRevision((value) => value + 1);
      }
      throw error;
    }
    if (mounted.current && current === generation.current) {
      setState({ status: 'authenticated', user, error: null });
    }
    return user;
  };
  return {
    ...state,
    updateUser: (user) =>
      setState((current) => (current.user?.id === user.id ? { ...current, user } : current)),
    login: (input, signal) => authenticate('login', input, signal),
    register: (input, signal) => authenticate('register', input, signal),
    async logout(signal) {
      const current = ++generation.current;
      controller.current?.abort();
      await api.logout(signal);
      api.clearCsrf();
      if (mounted.current && current === generation.current) setState(anonymous);
    },
    refresh() {
      ++generation.current;
      controller.current?.abort();
      setState({ status: 'loading', user: null, error: null });
      setRevision((value) => value + 1);
    },
  };
}
