import { Button } from '../../../components/ui/Button.jsx';
import { TrainingSampleFields } from './TrainingSampleFields.jsx';
import { VideoSourceFields } from './VideoSourceFields.jsx';
import { VideoIntervalFields } from './VideoIntervalFields.jsx';
import { useVideoAnnotation } from './use-video-annotation.js';
import { PILOT_LABELS } from '../../../../../shared/lsv/coverage.js';

/**
 * Presenta anotación manual y acción explícita de extracción; no adivina tiempos ni etiquetas.
 * @param {{asset: object, operation: object, duration: number}} props Archivo y procesador locales.
 * @returns {import('react').ReactElement} Intervalo, metadatos y autorización declarada.
 */
export function VideoAnnotation({ asset, operation, duration }) {
  const annotation = useVideoAnnotation(operation.clear);
  const { metadata, source, range } = annotation;
  return (
    <form
      className="flex min-w-0 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (range.start === '' || range.end === '') return;
        operation.process(metadata, {
          ...source,
          type: 'LOCAL_VIDEO',
          sha256: asset.sha256,
          startMs: Math.round(Number(range.start) * 1000),
          endMs: Math.round(Number(range.end) * 1000),
        });
      }}
    >
      <VideoIntervalFields
        range={range}
        duration={duration}
        disabled={operation.pending}
        videoRef={operation.videoRef}
        onChange={annotation.changeRange}
      />
      <TrainingSampleFields
        metadata={metadata}
        labels={PILOT_LABELS}
        disabled={operation.pending}
        onChange={annotation.changeMetadata}
      />
      <VideoSourceFields
        source={source}
        disabled={operation.pending}
        onChange={annotation.changeSource}
      />
      <p className="model-command text-muted">
        La huella SHA-256 del archivo se incluye en la exportación.
      </p>
      <div className="camera-actions">
        <Button
          type="submit"
          loading={operation.pending}
          loadingLabel="Extrayendo puntos…"
          disabled={
            !duration || !metadata.consent || !source.authorized || !range.start || !range.end
          }
        >
          Extraer muestra del intervalo
        </Button>
        {operation.pending && (
          <Button variant="secondary" icon={null} onClick={operation.cancel}>
            Cancelar extracción
          </Button>
        )}
      </div>
      <p role="status">
        {operation.pending
          ? `Procesando: ${operation.progress} %`
          : 'La extracción conserva solo puntos reales; la etiqueta requiere revisión humana.'}
      </p>
    </form>
  );
}
