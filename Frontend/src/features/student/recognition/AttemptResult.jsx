import { Alert } from '../../../components/ui/Alert.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { abstentionAdvice } from './recognition-support.js';

/**
 * Resultado experimental de un intento. La letra objetivo solo se usa para comparar después de la
 * predicción, nunca como predicción. Ningún resultado califica ni completa el ejercicio.
 * @param {{result: object, model: object, target?: string, onRetry: Function, disabled: boolean}} props Datos y acción.
 * @returns {import('react').ReactElement} Hipótesis o abstención con indicación y opción de repetir.
 */
export function AttemptResult({ result, model, target, onRetry, disabled }) {
  const candidate = Boolean(result.label);
  let comparison = '';
  if (candidate && target)
    comparison =
      result.label === target
        ? ` Coincide con la ${target} que practicas.`
        : ` No coincide con la ${target} que practicas; el modelo puede equivocarse, compara con la referencia.`;
  return (
    <div className="flex flex-col gap-3">
      <Alert tone={candidate ? 'info' : 'warning'} title="Hipótesis experimental">
        {candidate
          ? `El modelo propone: ${result.label}.${comparison}`
          : `Sin evidencia suficiente. ${abstentionAdvice(result.reason, model)}`}{' '}
        Este resultado no califica ni completa el ejercicio.
        {model.trainingMode && ' Umbrales sin calibrar; puede abstenerse o confundir letras.'}
      </Alert>
      <Button variant="secondary" icon={null} disabled={disabled} onClick={onRetry}>
        Repetir intento
      </Button>
    </div>
  );
}
