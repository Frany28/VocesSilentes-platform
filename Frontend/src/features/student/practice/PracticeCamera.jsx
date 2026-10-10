import { Badge } from '../../../components/ui/Badge.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { practiceStates } from './practice-demo.js';

/**
 * CameraPanel de Figma como demostración visual explícita; jamás accede a cámara o red.
 * @param {{state: string, exercise: string, onState: Function, onInstructions: Function}} props Vista y acciones.
 * @returns {import('react').ReactElement} Panel accesible con ejemplos seleccionados manualmente.
 */
export function PracticeCamera({ state, exercise, onState, onInstructions }) {
  const view = practiceStates[state];
  const tone = view.tone === 'neutral' ? 'info' : view.tone;
  return (
    <section
      className="practice-camera flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-6 shadow-(--shadow-soft)"
      data-state={state}
      data-tone={view.tone}
    >
      <header className="practice-camera-header flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-action [font:var(--type-label)]">PRACTICA LSV · EJERCICIO 01</p>
          <h2 className="[font:var(--type-h3)]">{exercise}</h2>
        </div>
        <Badge tone={tone}>
          {['success', 'retry', 'denied', 'unavailable'].includes(state)
            ? view.label
            : 'Práctica guiada'}
        </Badge>
      </header>
      <div className="practice-viewport flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-border bg-page p-4 text-center">
        <span className="practice-symbol-slot flex rounded-3xl p-4" aria-hidden="true">
          <span className="vs-icon practice-symbol" data-symbol={view.symbol} />
        </span>
        <p className="[font:var(--type-button)]">
          {['off', 'permission', 'denied', 'unavailable'].includes(state)
            ? view.title
            : 'Área de captura'}
        </p>
        <p className="text-muted [font:var(--type-label)]">
          Vista simulada del prototipo · Cámara sin activar
        </p>
      </div>
      <div
        className="practice-feedback flex flex-col gap-2 rounded-2xl p-4 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="[font:var(--type-button)]">{view.title}</p>
        <p className="text-muted">{view.description}</p>
      </div>
      <div className="practice-actions flex gap-3">
        <Button
          className="w-full! [--size-control:48px]"
          disabled={view.disabled}
          onClick={() => onState(view.next)}
        >
          {view.action}
        </Button>
        <Button
          variant="secondary"
          className="w-full! [--size-control:48px]"
          onClick={onInstructions}
        >
          Ver instrucciones
        </Button>
      </div>
      <p className="text-muted [font:var(--type-label)]">
        No se captura vídeo, no se reconoce LSV y no se guarda ningún intento.
      </p>
    </section>
  );
}
