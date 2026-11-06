import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { ModelLabWorkspace } from '../recognition/ModelLabWorkspace.jsx';
import { ModelLabInstructions } from '../recognition/ModelLabInstructions.jsx';
import '../lesson/lesson.css';
import '../recognition/recognition.css';
import '../recognition/video-lab.css';

/**
 * Laboratorio USER de cámara y archivos autorizados, sin publicar datos ni modificar cursos.
 * @returns {import('react').ReactElement} Preparación local de muestras y modelo experimental.
 */
export function StudentModelLab() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <StudentPageHeader
        title="Nuestro modelo de LSV"
        description="Prepara muestras reales de cámara o videos locales autorizados para entrenar el modelo."
      />
      <p>
        El modelo necesita ejecuciones etiquetadas y personas distintas para entrenamiento,
        calibración y prueba. Aquí no se generan aciertos ni se completa progreso académico.
      </p>
      <ModelLabWorkspace />
      <ModelLabInstructions />
    </div>
  );
}
