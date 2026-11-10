import { Alert } from '../../../components/ui/Alert.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { abstentionAdvice } from './recognition-support.js';
import { useCandidateContinuation } from './use-candidate-continuation.js';

/**
 * Resultado experimental de un intento. La letra objetivo solo se usa para comparar después de la
 * predicción, nunca como predicción. Ningún resultado califica ni completa el ejercicio.
 * @param {{result: object, model: object, target?: string, onRetry: Function,
 * disabled: boolean, onContinue?: Function}} props Datos y acciones.
 * @returns {import('react').ReactElement} Hipótesis o abstención con indicación y opción de repetir.
 */
export function LabAttemptResult({ result, model, target, onRetry, disabled, onContinue }) {
  const continuation = useCandidateContinuation(result, target, onContinue, !disabled);
  const candidate = Boolean(result.label);
  const hand = result.frames?.[0]?.hand;
  let comparison = '';
  if (candidate && target)
    comparison =
      result.label === target
        ? ` Coincide con la ${target} que practicas.`
        : ` No coincide con la ${target} que practicas; el modelo puede equivocarse, compara con la referencia.`;
  return (
    <div className="flex flex-col gap-3">
      {candidate && (
        <p className="recognition-candidate" aria-label={`Letra candidata ${result.label}`}>
          {result.label}
        </p>
      )}
      <Alert tone={candidate ? 'info' : 'warning'} title="Hipótesis experimental">
        {candidate
          ? `El modelo propone: ${result.label}.${comparison}`
          : `Sin evidencia suficiente. ${abstentionAdvice(result.reason, model)}`}{' '}
        Este resultado no califica ni completa el ejercicio.
        {model.trainingMode && ' Umbrales sin calibrar; puede abstenerse o confundir letras.'}
      </Alert>
      <p>
        Mano del intento: {hand ? (hand === 'Left' ? 'izquierda' : 'derecha') : 'sin registrar'}.
        {Number.isFinite(result.inferenceMs) && ` Inferencia: ${result.inferenceMs.toFixed(1)} ms.`}{' '}
        Incertidumbre: {candidate ? 'hipótesis sin calibrar' : 'abstención'}.
      </p>
      <Button variant="secondary" icon={null} disabled={disabled} onClick={onRetry}>
        Repetir intento
      </Button>
      {candidate && result.label === target && onContinue && (
        <Button onClick={continuation.continueNow}>Continuar</Button>
      )}
      {continuation.advancing && (
        <>
          <p role="status">
            Coincidencia experimental. Pasaremos al siguiente paso en 3 segundos, sin calificar.
          </p>
          <Button variant="secondary" icon={null} onClick={continuation.stay}>
            Seguir practicando aquí
          </Button>
        </>
      )}
    </div>
  );
}
