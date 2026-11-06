import { useState } from 'react';
import { Alert } from '../../../components/ui/Alert.jsx';
import { LocalVideoPlayer } from './LocalVideoPlayer.jsx';
import { VideoAnnotation } from './VideoAnnotation.jsx';
import { VideoSampleDraft } from './VideoSampleDraft.jsx';

/**
 * Agrupa reproducción y anotación de un archivo; cambiar de archivo reinicia permisos y límites declarados.
 * @param {{files: object, operation: object, collection: object}} props Archivo seleccionado y lote compartido.
 * @returns {import('react').ReactElement} Visor, metadatos y borrador revisable.
 */
export function VideoFileEditor({ files, operation, collection }) {
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  return (
    <div className="video-editor-grid">
      <div className="flex min-w-0 flex-col gap-4">
        <LocalVideoPlayer
          asset={files.asset}
          replay={files.replay}
          operation={operation}
          onReady={(value) => {
            if (Number.isFinite(value) && value > 0) {
              setDuration(value);
              setError('');
            } else setError('El archivo no tiene una duración finita utilizable.');
          }}
          onError={(message) => {
            setDuration(0);
            setError(message);
          }}
        />
        {error && (
          <Alert tone="error" title="Video no disponible">
            {error}
          </Alert>
        )}
        <VideoSampleDraft operation={operation} collection={collection} />
      </div>
      <VideoAnnotation asset={files.asset} duration={duration} operation={operation} />
    </div>
  );
}
