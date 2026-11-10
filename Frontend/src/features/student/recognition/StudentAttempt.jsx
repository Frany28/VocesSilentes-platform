import { Button } from '../../../components/ui/Button.jsx';
import { AttemptResult } from './AttemptResult.jsx';
import { ModelStatus } from './ModelStatus.jsx';

/**
 * Controles y retroalimentación del estudiante; comparte el intento coordinado con el visor.
 * @param {{attempt: object, operation: object, capture: object, target?: string,
 * onContinue?: Function}} props Estados reales y siguiente paso opcional.
 * @returns {import('react').ReactElement} Resultado inmediato y acciones, sin configuración del laboratorio.
 */
export function StudentAttempt({ attempt, operation, capture, target, onContinue }) {
  const { countdown, supported, busy, preparing, live, automatic, manual, shown } = attempt;
  const retry = () => {
    operation.clear();
    capture.clear();
    automatic.rearm();
  };
  if (!supported)
    return (
      <p className="attempt-status">
        Practica con la referencia. Esta letra aún no tiene ayuda automática.
      </p>
    );
  let message = 'Forma la seña dentro del recuadro: la captura empieza sola.';
  if (shown && operation.result.label === target && onContinue)
    message = 'Tu siguiente paso está listo. Pulsa Continuar o sigue practicando aquí.';
  else if (shown && live) message = 'Para otro intento, baja la mano y vuelve a formar la seña.';
  else if (!live) message = 'Activa la cámara cuando estés listo para intentarlo.';
  else if (automatic.phase === 'holding')
    message = 'Mano detectada: mantén la seña, la captura empieza sola…';
  if (preparing) message = 'Estamos preparando tu práctica…';
  if (busy)
    message =
      countdown.count !== null
        ? `Prepárate: la captura empieza en ${countdown.count}…`
        : 'Capturando… mantén la seña quieta.';
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
        />
      )}
      <p className="attempt-status" data-phase={automatic.phase} role="status">
        {message}
      </p>
      {!shown && live && (
        <Button
          variant="secondary"
          icon={null}
          disabled={!live || busy || preparing}
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
          <p>
            No pudimos seguir tu mano durante todo el intento. Colócala en el recuadro y mantén la
            seña quieta.
          </p>
        </div>
      )}
    </section>
  );
}
