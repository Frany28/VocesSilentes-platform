import { useEffect, useState } from 'react';
import { StudentContext } from './student-context.js';
import { readStudentSnapshot } from './student-adapter.js';

/**
 * Comparte una lectura cancelable; reintentar conserva el adaptador y nunca sustituye una API por fixtures.
 * @param {object} props Dependencia reemplazable y contenido protegido.
 * @param {Function} [props.read] Lectura (AbortSignal, escenario) => Promise de instantánea.
 * @param {import('react').ReactNode} props.children Páginas/layout de estudiante.
 * @returns {import('react').ReactElement} Proveedor separado de autenticación.
 */
export function StudentProvider({ read = readStudentSnapshot, children }) {
  const [state, setState] = useState({ status: 'loading', snapshot: null });
  const [revision, setRevision] = useState(0);
  const [scenario, setScenario] = useState('progress');
  useEffect(() => {
    const request = new AbortController();
    Promise.resolve()
      .then(() => read(request.signal, scenario))
      .then((snapshot) => {
        if (!request.signal.aborted) setState({ status: 'ready', snapshot });
      })
      .catch(() => {
        if (!request.signal.aborted) setState({ status: 'error', snapshot: null });
      });
    return () => request.abort();
  }, [read, revision, scenario]);
  return (
    <StudentContext.Provider
      value={{
        ...state,
        scenario,
        refresh: () => setRevision((value) => value + 1),
        setScenario: (value) => {
          setState({ status: 'loading', snapshot: null });
          setScenario(value);
        },
        retry: () => {
          setState({ status: 'loading', snapshot: null });
          setRevision((value) => value + 1);
        },
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
