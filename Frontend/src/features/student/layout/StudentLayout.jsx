import { StudentProvider } from '../data/StudentProvider.jsx';
import { StudentShell } from './StudentShell.jsx';
import { RecognitionModelProvider } from '../recognition/RecognitionModelProvider.jsx';
import { useAuth } from '../../auth/use-auth.js';

/**
 * Conserva el proveedor compartido al entrar y salir del modo de aprendizaje enfocado.
 * @returns {import('react').ReactElement} Marco Student bajo los mismos guards de sesión y rol.
 */
export function StudentLayout() {
  const { user } = useAuth();
  return (
    <StudentProvider>
      <RecognitionModelProvider key={user.id}>
        <StudentShell />
      </RecognitionModelProvider>
    </StudentProvider>
  );
}
