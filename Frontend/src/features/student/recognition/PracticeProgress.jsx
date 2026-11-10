import './practice-progress.css';

/**
 * Secuencia local de observación e intento; no representa una nota ni progreso guardado.
 * @param {{phase: string}} props Fase real del intento de cámara.
 * @returns {import('react').ReactElement} Pasos visibles con el actual indicado por texto y aria-current.
 */
export function PracticeProgress({ phase }) {
  const current = phase === 'success' ? 2 : phase === 'observe' ? 0 : 1;
  return (
    <ol className="practice-progress" aria-label="Tu recorrido de práctica">
      {['Observa', 'Intenta', 'Continúa'].map((step, index) => (
        <li
          key={step}
          aria-current={index === current ? 'step' : undefined}
          data-completed={index < current || undefined}
        >
          <span aria-hidden="true">{index + 1}</span>
          {step}
          {index === current && <span className="sr-only">: paso actual</span>}
        </li>
      ))}
    </ol>
  );
}
