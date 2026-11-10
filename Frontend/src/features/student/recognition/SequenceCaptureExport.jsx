import { Button } from '../../../components/ui/Button.jsx';
import { downloadJson } from './download-json.js';

/**
 * Exporta captura sincronizada consentida para futura revisión; no la convierte en entrenamiento bimanual aprobado.
 * @param {{capture: object, metadata: object, ready: boolean}} props Captura y declaración del participante.
 * @returns {import('react').ReactElement|null} Exportación local de ambos canales, sin vídeo ni red.
 */
export function SequenceCaptureExport({ capture, metadata, ready }) {
  if (!capture.sequence) return null;
  return (
    <Button
      variant="secondary"
      icon={null}
      disabled={!ready || capture.pending}
      onClick={() =>
        downloadJson(
          {
            version: 2,
            type: 'UNREVIEWED_HAND_SEQUENCE',
            sequence: capture.sequence,
            sessionId: capture.sessionId,
            participantId: metadata.participantId,
            label: null,
            intendedLabel: metadata.label,
            consent: metadata.consent,
            sampleKind: 'REAL',
            dataOrigin: 'CAMERA',
            reviewStatus: 'PENDING_LSV_REVIEW',
            validationError: capture.error || null,
            source: { type: 'CAMERA' },
            createdAt: new Date().toISOString(),
          },
          `lsv-hand-sequence-${Date.now()}.json`,
        )
      }
    >
      Exportar canales de manos para revisión
    </Button>
  );
}
