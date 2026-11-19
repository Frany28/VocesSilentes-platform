import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { TrainingSampleFields } from './TrainingSampleFields.jsx';
import { SequenceCaptureExport } from './SequenceCaptureExport.jsx';

/**
 * Solicita etiqueta, código consistente por persona y consentimiento antes de recopilar puntos para entrenar.
 * @param {{camera: object, capture: object, collection: object, letter: string, onLetter: Function}} props Laboratorio local.
 * @returns {import('react').ReactElement} Preparación de una muestra, nunca un ejercicio calificado.
 */
export function TrainingCapture({ camera, capture, collection, letter, onLetter }) {
  const [metadata, setMetadata] = useState({
    participantId: '',
    partition: 'train',
    consent: false,
    requestedHand: 'AUTO',
  });
  const { participantId, consent, requestedHand } = metadata;
  const clear = () => capture.clear();
  const consented = consent && /^[a-z0-9_-]{1,64}$/.test(participantId);
  const ready = camera.state === 'live' && consented;
  const matchingHand = requestedHand === 'AUTO' || capture.frames?.[0]?.hand === requestedHand;
  return (
    <section
      className="flex min-w-0 flex-col gap-4"
      aria-label="Recopilar muestras de entrenamiento"
    >
      <h2 className="[font:var(--type-h3)]">Recopilar una muestra</h2>
      <TrainingSampleFields
        experimental={collection.experimental}
        metadata={{ ...metadata, label: letter }}
        disabled={capture.pending}
        onChange={(field, value) => {
          clear();
          if (field === 'label') onLetter(value);
          else
            setMetadata((current) => ({
              ...current,
              [field]: value,
              ...(field === 'participantId' ? { consent: false } : {}),
            }));
        }}
      />
      <div className="camera-actions">
        <Button
          loading={capture.pending}
          loadingLabel="Capturando 3 segundos…"
          disabled={!ready}
          onClick={() => capture.capture()}
        >
          Capturar muestra
        </Button>
        <Button
          variant="secondary"
          icon={null}
          disabled={!ready || !capture.frames || !matchingHand || capture.pending}
          onClick={() => {
            if (collection.add({ ...metadata, label: letter }, capture.frames, capture.sessionId))
              clear();
          }}
        >
          Guardar muestra en memoria
        </Button>
        <Button
          variant="secondary"
          icon={null}
          disabled={!capture.frames || capture.pending}
          onClick={clear}
        >
          Descartar captura
        </Button>
      </div>
      <SequenceCaptureExport
        capture={capture}
        metadata={{ participantId, label: letter, consent }}
        ready={consented}
      />
      {capture.frames && (
        <p role="status">
          Muestra lista: {capture.frames.length} frames, etiqueta {letter}, mano{' '}
          {capture.frames[0].hand === 'Left' ? 'izquierda' : 'derecha'}. Grabación auténtica.
        </p>
      )}
      {capture.frames && !matchingHand && (
        <p role="status">
          La mano observada no coincide con la solicitada. Repite la captura sin reflejarla.
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
