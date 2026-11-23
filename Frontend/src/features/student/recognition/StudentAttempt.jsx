import { Button } from '../../../components/ui/Button.jsx';
import { AttemptResult } from './AttemptResult.jsx';
import { ModelStatus } from './ModelStatus.jsx';
import { practiceMessages } from './practice-feedback.js';

/**
 * Controles y retroalimentación del estudiante; comparte el intento coordinado con el visor.
 * @param {{attempt: object, operation: object, capture: object, target?: string,
 * onContinue?: Function, onReference?: Function}} props Estados reales y siguiente paso opcional.
 * @returns {import('react').ReactElement} Resultado inmediato y acciones, sin configuración del laboratorio.
 */
export function StudentAttempt({ attempt, operation, capture, target, onContinue, onReference }) {
  const { countdown, supported, busy, preparing, live, automatic, manual, shown } = attempt;
  const retry = () => {
    operation.clear();
    capture.clear();
    automatic.rearm();
  };
  if (!supported)
    return (
      <p className="attempt-status" data-feedback="REFERENCE_ONLY">
        {practiceMessages.REFERENCE_ONLY}
      </p>
    );
  let message = 'Forma la seña dentro del recuadro: la captura empieza sola.';
  if (shown && live) message = 'Para otro intento, baja la mano y vuelve a formar la seña.';
  else if (!live) message = 'Activa la cámara cuando estés listo para intentarlo.';
  else if (automatic.phase === 'holding')
    message = 'Mano detectada: mantén la seña, la captura empieza sola…';
  if (live && !operation.model) message = 'El reconocimiento requiere que el modelo de vocales esté disponible.';
  if (preparing) message = 'Estamos preparando tu práctica…';
  if (busy)
    message =
      countdown.count !== null
        ? `Prepárate: la captura empieza en ${countdown.count}…`
        : 'Capturando… realiza la seña dentro del encuadre.';
  return (
    <section className="student-attempt" aria-label="Tu intento">
      <ModelStatus operation={operation} />
      {shown && (
        <AttemptResult
          result={operation.result}
          target={target}
          disabled={!live || busy}
          onRetry={retry}
          onContinue={onContinue}
          onReference={onReference}
        />
      )}
      <p className="attempt-status" data-phase={automatic.phase} role="status">
        {message}
      </p>
      {!shown && live && (
        <Button
          variant="secondary"
          icon={null}
          disabled={!live || busy || !operation.model}
          loading={busy}
          loadingLabel={
            countdown.count !== null ? `Empieza en ${countdown.count}…` : 'Capturando 3 segundos…'
          }
          onClick={manual}
        >
          Capturar intento
        </Button>
      )}
      {(capture.error || operation.error) && (
        <div className="practice-retry" role="alert">
          <h3>Inténtalo de nuevo</h3>
          <p>{practiceMessages[capture.feedback] ?? practiceMessages.UNCERTAIN}</p>
        </div>
      )}
    </section>
  );
}
