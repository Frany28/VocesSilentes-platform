import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { TrainingSampleFields } from './TrainingSampleFields.jsx';

/**
 * Solicita etiqueta, código consistente por persona y consentimiento antes de recopilar puntos para entrenar.
 * @param {{camera: object, capture: object, collection: object, letter: string, onLetter: Function}} props Laboratorio local.
 * @returns {import('react').ReactElement} Preparación de una muestra, nunca un ejercicio calificado.
 */
export function TrainingCapture({ camera, capture, collection, letter, onLetter }) {
  const [participantId, setParticipant] = useState('');
  const [partition, setPartition] = useState('train');
  const [consent, setConsent] = useState(false);
  const clear = () => capture.clear();
  const ready = camera.state === 'live' && consent && /^[a-z0-9_-]{1,64}$/.test(participantId);
  return (
    <section
      className="flex min-w-0 flex-col gap-4"
      aria-label="Recopilar muestras de entrenamiento"
    >
      <h2 className="[font:var(--type-h3)]">Recopilar una muestra</h2>
      <TrainingSampleFields
        metadata={{ participantId, partition, label: letter, consent }}
        disabled={capture.pending}
        onChange={(field, value) => {
          clear();
          if (field === 'participantId') setParticipant(value);
          if (field === 'partition') setPartition(value);
          if (field === 'consent') setConsent(value);
          if (field === 'label') onLetter(value);
        }}
      />
      <div className="camera-actions">
        <Button
          loading={capture.pending}
          loadingLabel="Capturando 3 segundos…"
          disabled={!ready}
          onClick={capture.capture}
        >
          Capturar muestra
        </Button>
        <Button
          variant="secondary"
          icon={null}
          disabled={!ready || !capture.frames || capture.pending}
          onClick={() => {
            if (
              collection.add(
                { participantId, partition, label: letter, consent },
                capture.frames,
                capture.sessionId,
              )
            )
              clear();
          }}
        >
          Guardar muestra en memoria
        </Button>
      </div>
      {capture.frames && (
        <p role="status">
          Muestra lista: {capture.frames.length} frames, etiqueta {letter}.
        </p>
      )}
      {capture.error && (
        <Alert tone="error" title="Repite la muestra">
          {capture.error}
        </Alert>
      )}
    </section>
  );
}
