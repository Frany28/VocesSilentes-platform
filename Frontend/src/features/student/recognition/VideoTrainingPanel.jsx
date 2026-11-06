import { Input } from '../../../components/ui/Input.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { VideoFileEditor } from './VideoFileEditor.jsx';

/**
 * Importa MP4/WebM locales autorizados; no acepta URLs ni descarga fuentes de YouTube.
 * @param {{files: object, operation: object, collection: object}} props Archivos y muestras solo en memoria.
 * @returns {import('react').ReactElement} Selección explícita, estados y editor del video local.
 */
export function VideoTrainingPanel({ files, operation, collection }) {
  return (
    <section
      className="education-card flex min-w-0 flex-col gap-5"
      aria-label="Importar videos autorizados"
    >
      <h2 className="[font:var(--type-h3)]">Preparar muestras desde un video</h2>
      <p>
        Selecciona un archivo obtenido legalmente y autorizado. Marca una ejecución completa de A,
        E, I, O, U o NONE. Cada intervalo produce una sola muestra pendiente de revisión LSV.
      </p>
      <Input
        type="file"
        label="Video local MP4 o WebM"
        accept="video/mp4,video/webm,.mp4,.webm"
        disabled={operation.pending || files.pending}
        help="Hasta 128 MB. No se sube al servidor ni se descarga de YouTube."
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            operation.clear();
            files.select(file);
          }
          event.target.value = '';
        }}
      />
      {files.pending && <p role="status">Leyendo la huella del archivo local…</p>}
      {files.error && (
        <Alert tone="error" title="Revisa el archivo local">
          {files.error}
        </Alert>
      )}
      {operation.error && (
        <Alert tone="error" title="No se creó la muestra">
          {operation.error}
        </Alert>
      )}
      {files.asset && (
        <VideoFileEditor
          key={files.asset.sha256}
          files={files}
          operation={operation}
          collection={collection}
        />
      )}
    </section>
  );
}
