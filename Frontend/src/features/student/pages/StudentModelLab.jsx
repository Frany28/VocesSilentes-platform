import { useState } from 'react';
import { Link } from 'react-router';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog.jsx';
import { useDraftLeave } from '../../../hooks/use-draft-leave.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { useHandCamera } from '../recognition/use-hand-camera.js';
import { useSequenceCapture } from '../recognition/use-sequence-capture.js';
import { useTrainingSamples } from '../recognition/use-training-samples.js';
import { CameraView } from '../recognition/CameraView.jsx';
import { ManualReference } from '../recognition/ManualReference.jsx';
import { TrainingCapture } from '../recognition/TrainingCapture.jsx';
import { TrainingSamples } from '../recognition/TrainingSamples.jsx';
import { ModelTraining } from '../recognition/ModelTraining.jsx';
import '../lesson/lesson.css';
import '../recognition/recognition.css';

/**
 * Laboratorio USER de datos locales para crear el modelo; no carga muestras a la API ni modifica cursos publicados.
 * @returns {import('react').ReactElement} Captura consentida, revisión declarada y exportación para entrenamiento.
 */
export function StudentModelLab() {
  const [letter, setLetter] = useState('A');
  const camera = useHandCamera();
  const capture = useSequenceCapture(camera);
  const collection = useTrainingSamples();
  const leave = useDraftLeave(collection.dirty, capture.pending, '/student');
  return (
    <div className="flex w-full flex-col gap-6">
      <StudentPageHeader
        title="Nuestro modelo de LSV"
        description="Recopila muestras reales para entrenar y evaluar un primer modelo experimental."
      />
      <p>
        El manual es una referencia. El modelo necesita secuencias de cámara etiquetadas y personas
        distintas para entrenamiento, calibración y prueba. Aquí no se generan aciertos ni se
        completa progreso.
      </p>
      <div className="education-card camera-reference-grid">
        <div className="flex min-w-0 flex-col gap-4">
          <ManualReference letter={letter} compact />
          <CameraView camera={camera} />
        </div>
        <TrainingCapture
          camera={camera}
          capture={capture}
          collection={collection}
          letter={letter}
          onLetter={setLetter}
        />
      </div>
      <TrainingSamples collection={collection} />
      <ModelTraining samples={collection.samples} />
      <section className="education-card flex flex-col gap-3">
        <h2 className="[font:var(--type-h3)]">Entrenar con las muestras revisadas</h2>
        <p>
          Guarda los archivos exportados en una carpeta local y ejecuta desde la raíz del proyecto:
        </p>
        <code className="model-command">
          pnpm lsv:train .local/muestras.json --output .local/modelo-lsv
        </code>
        <p>
          Se generan lsv-model.json y evaluation.json con resultados del conjunto de prueba
          independiente. El modelo seguirá siendo experimental hasta una validación más amplia.
        </p>
        <Link
          className="education-back inline-flex min-h-11 items-center"
          to="/student/practice/camera"
        >
          Probar el modelo entrenado con mi cámara
        </Link>
        <a
          className="education-back inline-flex min-h-11 items-center"
          href="/licenses/mediapipe-Apache-2.0.txt"
        >
          Licencia del detector de manos MediaPipe
        </a>
      </section>
      {leave.confirm && (
        <ConfirmationDialog
          title="¿Salir sin exportar las muestras?"
          confirm="Salir sin exportar"
          onConfirm={leave.proceed}
          onCancel={leave.cancel}
        >
          Las muestras que siguen en memoria se perderán al salir.
        </ConfirmationDialog>
      )}
    </div>
  );
}
