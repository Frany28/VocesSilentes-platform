import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { CameraExercise } from '../recognition/CameraExercise.jsx';
import '../lesson/lesson.css';

/**
 * Entrada de práctica real con cámara bajo los mismos guards USER, sin activarla al abrir la ruta.
 * @returns {import('react').ReactElement} Cámara local y clasificador propio experimental importable.
 */
export function StudentCameraPractice() {
  return (
    <div className="flex flex-col gap-6">
      <StudentPageHeader
        title="Practicar con cámara"
        description="Observa tus manos y prueba nuestro modelo LSV cuando esté entrenado."
      />
      <div className="education-card">
        <CameraExercise />
      </div>
    </div>
  );
}
