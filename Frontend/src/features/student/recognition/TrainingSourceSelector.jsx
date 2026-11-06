import { Button } from '../../../components/ui/Button.jsx';

/**
 * Elige cámara o archivo sin arrancar ninguno de forma implícita.
 * @param {{mode: string, busy: boolean, onChange: Function}} props Origen activo y navegación.
 * @returns {import('react').ReactElement} Acciones del origen compartido por ambos flujos.
 */
export function TrainingSourceSelector({ mode, busy, onChange }) {
  return (
    <div className="camera-actions" role="group" aria-label="Origen de muestras">
      <Button
        variant="secondary"
        icon={null}
        aria-pressed={mode === 'camera'}
        disabled={busy}
        onClick={() => onChange('camera')}
      >
        Usar cámara
      </Button>
      <Button
        variant="secondary"
        icon={null}
        aria-pressed={mode === 'video'}
        disabled={busy}
        onClick={() => onChange('video')}
      >
        Importar video local
      </Button>
    </div>
  );
}
