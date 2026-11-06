import { Button } from '../../../components/ui/Button.jsx';
import { SamplePreview } from './SamplePreview.jsx';
import { useEffect, useRef } from 'react';

/**
 * Presenta una ejecución extraída antes de añadirla al lote; nunca la aprueba automáticamente.
 * @param {{operation: object, collection: object}} props Borrador temporal y colección compartida.
 * @returns {import('react').ReactElement|null} Inspección, descarte o incorporación pendiente de revisión.
 */
export function VideoSampleDraft({ operation, collection }) {
  const region = useRef(null);
  useEffect(() => {
    if (operation.preview) region.current?.focus();
  }, [operation.preview]);
  if (!operation.preview) return null;
  const { sample, decodedFrames } = operation.preview;
  return (
    <section
      className="training-sample-row flex min-w-0 flex-col gap-3"
      aria-label="Vista previa de la muestra"
      ref={region}
      tabIndex={-1}
    >
      <h3 className="[font:var(--type-h3)]">Muestra pendiente: {sample.label}</h3>
      <p>
        {decodedFrames} fotogramas procesados; {sample.frames.length} observaciones conservadas. Una
        ejecución, una muestra. Participante {sample.participantId} · {sample.partition}.
      </p>
      <SamplePreview key={sample.id} sample={sample} />
      <div className="camera-actions">
        <Button
          onClick={() => {
            if (collection.add(sample, sample.frames, sample.sessionId)) operation.clear();
          }}
        >
          Añadir muestra pendiente
        </Button>
        <Button variant="secondary" icon={null} onClick={operation.clear}>
          Descartar extracción
        </Button>
      </div>
    </section>
  );
}
